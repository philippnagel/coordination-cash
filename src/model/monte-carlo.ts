import { calculateModel } from "./calculate.ts";
import { PARAMETER_RANGES } from "./defaults.ts";
import { setNestedValue } from "./sensitivity.ts";
import type { CostComponents, ModelInputs } from "./types.ts";

export interface MonteCarloResults {
	samples: number[];
	percentiles: Record<string, number>;
	mean: number;
	stdDev: number;
	componentBreakdown: {
		platform: number;
		operations: number;
		syncTax: number;
		friction: number;
	};
}

/**
 * Seeded PRNG (mulberry32) for reproducible results.
 * Returns a function that produces uniform [0, 1) values.
 */
function mulberry32(seed: number): () => number {
	let s = seed | 0;
	return () => {
		s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Derive a deterministic seed from model inputs */
function deriveInputSeed(inputs: ModelInputs): number {
	// Simple hash: combine a few key numeric values
	return (
		(inputs.implementations * 97 +
			inputs.messageVolume * 13 +
			inputs.participants.large * 37 +
			inputs.errorRate * 1e6 +
			inputs.concentration * 53) |
		0
	);
}

/**
 * Correlation groups: parameters within a group share a common random factor.
 * ρ (rho) controls within-group correlation strength (0 = independent, 1 = perfectly correlated).
 */
const CORRELATION_GROUPS: { params: string[]; rho: number }[] = [
	{
		params: [
			"costs.opsLarge",
			"costs.opsMedium",
			"costs.opsSmall",
			"costs.perMessage",
		],
		rho: 0.6,
	},
	{
		params: [
			"costs.updateImpl",
			"costs.updateLarge",
			"costs.updateMedium",
			"costs.updateSmall",
		],
		rho: 0.6,
	},
	{
		params: [
			"sectorMultipliers.implementation",
			"sectorMultipliers.operations",
			"sectorMultipliers.update",
			"sectorMultipliers.friction",
		],
		rho: 0.7,
	},
	{
		params: ["participants.large", "participants.medium", "participants.small"],
		rho: 0.5,
	},
];

/** Build a lookup from param key → { groupIndex, rho } */
function buildGroupLookup(): Map<string, { groupIndex: number; rho: number }> {
	const lookup = new Map<string, { groupIndex: number; rho: number }>();
	for (let gi = 0; gi < CORRELATION_GROUPS.length; gi++) {
		// biome-ignore lint/style/noNonNullAssertion: index bounded by loop
		const group = CORRELATION_GROUPS[gi]!;
		for (const param of group.params) {
			lookup.set(param, { groupIndex: gi, rho: group.rho });
		}
	}
	return lookup;
}

const GROUP_LOOKUP = buildGroupLookup();

/**
 * Triangular inverse CDF: given u ∈ [0,1], return sample from Triangular(min, max, mode).
 */
function triangularInvCDF(
	u: number,
	min: number,
	max: number,
	mode: number,
): number {
	const fc = (mode - min) / (max - min);
	if (u < fc) {
		return min + Math.sqrt(u * (max - min) * (mode - min));
	}
	return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

/**
 * Mix a shared group uniform with an independent uniform using desired pairwise correlation ρ.
 * Uses the Gaussian copula: convert to normal, mix with factor loading √ρ, convert back.
 * With loading = √ρ, Cor(X_i, X_j) = (√ρ)² = ρ as intended.
 */
function correlatedUniform(
	sharedU: number,
	independentU: number,
	rho: number,
): number {
	const loading = Math.sqrt(rho);
	const z1 = normalInvCDF(sharedU);
	const z2 = normalInvCDF(independentU);
	const mixed = loading * z1 + Math.sqrt(1 - rho) * z2;
	return normalCDF(mixed);
}

/**
 * Standard normal CDF via Abramowitz & Stegun 7.1.26.
 * Coefficients approximate erf(x), so input is scaled by 1/√2: Φ(x) = 0.5·(1 + erf(x/√2)).
 */
function normalCDF(x: number): number {
	const a1 = 0.254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const p = 0.3275911;
	const sign = x < 0 ? -1 : 1;
	// A&S 7.1.26 approximates erf(z), so z = |x|/√2
	const z = Math.abs(x) / Math.SQRT2;
	const t = 1.0 / (1.0 + p * z);
	const y =
		1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
	return 0.5 * (1.0 + sign * y);
}

/** Rational approximation of the standard normal inverse CDF (Beasley-Springer-Moro) */
function normalInvCDF(u: number): number {
	// Clamp to avoid infinities at extremes
	const p = Math.max(1e-10, Math.min(1 - 1e-10, u));
	const t = p < 0.5 ? p : 1 - p;
	const s = Math.sqrt(-2 * Math.log(t));
	// Rational approximation coefficients
	const c0 = 2.515517;
	const c1 = 0.802853;
	const c2 = 0.010328;
	const d1 = 1.432788;
	const d2 = 0.189269;
	const d3 = 0.001308;
	const result =
		s - (c0 + c1 * s + c2 * s * s) / (1 + d1 * s + d2 * s * s + d3 * s * s * s);
	return p < 0.5 ? -result : result;
}

/** Sample from Triangular(min, max, mode), optionally in log-space */
function sampleTriangular(
	min: number,
	max: number,
	mode: number,
	u: number,
	log: boolean,
): number {
	if (log) {
		return Math.exp(
			triangularInvCDF(u, Math.log(min), Math.log(max), Math.log(mode)),
		);
	}
	return triangularInvCDF(u, min, max, mode);
}

function getNestedValue(obj: ModelInputs, path: string): number {
	const parts = path.split(".");
	// biome-ignore lint/suspicious/noExplicitAny: generic nested getter
	let current: any = obj;
	for (const part of parts) {
		current = current[part];
	}
	return current as number;
}

/** Fast manual clone of ModelInputs (avoids structuredClone overhead in hot loop) */
function cloneInputs(src: ModelInputs): ModelInputs {
	return {
		scope: src.scope,
		implementations: src.implementations,
		participants: { ...src.participants },
		messageVolume: src.messageVolume,
		updatesPerYear: src.updatesPerYear,
		errorRate: src.errorRate,
		concentration: src.concentration,
		costs: { ...src.costs },
		sectorMultipliers: { ...src.sectorMultipliers },
	};
}

export function runMonteCarloSimulation(
	inputs: ModelInputs,
	iterations = 1000,
): MonteCarloResults {
	const rand = mulberry32(deriveInputSeed(inputs) + iterations);
	const samples: number[] = [];
	const componentSums: CostComponents = {
		platform: 0,
		operations: 0,
		syncTax: 0,
		friction: 0,
	};

	const paramEntries = Object.entries(PARAMETER_RANGES).filter(
		([key]) =>
			!(key.startsWith("sectorMultipliers.") && inputs.scope === "strom"),
	);

	// Pre-compute modes (clamped to range) and group info once outside the loop
	const paramConfigs = paramEntries.map(([paramKey, range]) => {
		const currentValue = getNestedValue(inputs, paramKey);
		const mode = Math.max(range.min, Math.min(range.max, currentValue));
		const group = GROUP_LOOKUP.get(paramKey);
		return { paramKey, range, mode, group };
	});

	const numGroups = CORRELATION_GROUPS.length;

	for (let i = 0; i < iterations; i++) {
		const randomized = cloneInputs(inputs);

		// Sample one shared uniform per correlation group for this iteration
		const groupSharedU: number[] = [];
		for (let g = 0; g < numGroups; g++) {
			groupSharedU.push(rand());
		}

		for (const { paramKey, range, mode, group } of paramConfigs) {
			let u: number;
			if (group) {
				// Correlated: mix shared group factor with independent noise
				u = correlatedUniform(
					// biome-ignore lint/style/noNonNullAssertion: groupIndex bounded by numGroups
					groupSharedU[group.groupIndex]!,
					rand(),
					group.rho,
				);
			} else {
				// Uncorrelated parameter: purely independent
				u = rand();
			}

			const sampled = sampleTriangular(
				range.min,
				range.max,
				mode,
				u,
				!!range.log,
			);
			setNestedValue(randomized, paramKey, sampled);
		}

		const result = calculateModel(randomized);
		samples.push(result.total);
		componentSums.platform += result.components.platform;
		componentSums.operations += result.components.operations;
		componentSums.syncTax += result.components.syncTax;
		componentSums.friction += result.components.friction;
	}

	samples.sort((a, b) => a - b);

	const n = samples.length;
	const mean = samples.reduce((s, v) => s + v, 0) / n;
	const variance = samples.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
	const stdDev = Math.sqrt(variance);

	const pct = (p: number) => samples[Math.floor((p / 100) * (n - 1))] ?? 0;

	return {
		samples,
		percentiles: {
			P5: pct(5),
			P25: pct(25),
			P50: pct(50),
			P75: pct(75),
			P95: pct(95),
		},
		mean,
		stdDev,
		componentBreakdown: {
			platform: componentSums.platform / n,
			operations: componentSums.operations / n,
			syncTax: componentSums.syncTax / n,
			friction: componentSums.friction / n,
		},
	};
}
