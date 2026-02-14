import { describe, expect, test } from "bun:test";
import { DEFAULT_INPUTS } from "./defaults.ts";
import { runMonteCarloSimulation } from "./monte-carlo.ts";

// We can't directly import the private functions, so we test them indirectly
// through the public API, plus we replicate the key math for unit-level checks.

describe("normalCDF / normalInvCDF round-trip", () => {
	// Replicate the functions here for direct testing
	function normalCDF(x: number): number {
		const a1 = 0.254829592;
		const a2 = -0.284496736;
		const a3 = 1.421413741;
		const a4 = -1.453152027;
		const a5 = 1.061405429;
		const p = 0.3275911;
		const sign = x < 0 ? -1 : 1;
		const z = Math.abs(x) / Math.SQRT2;
		const t = 1.0 / (1.0 + p * z);
		const y =
			1.0 -
			((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
		return 0.5 * (1.0 + sign * y);
	}

	function normalInvCDF(u: number): number {
		const p = Math.max(1e-10, Math.min(1 - 1e-10, u));
		const t = p < 0.5 ? p : 1 - p;
		const s = Math.sqrt(-2 * Math.log(t));
		const c0 = 2.515517;
		const c1 = 0.802853;
		const c2 = 0.010328;
		const d1 = 1.432788;
		const d2 = 0.189269;
		const d3 = 0.001308;
		const result =
			s -
			(c0 + c1 * s + c2 * s * s) / (1 + d1 * s + d2 * s * s + d3 * s * s * s);
		return p < 0.5 ? -result : result;
	}

	test("normalCDF at known values", () => {
		expect(normalCDF(0)).toBeCloseTo(0.5, 4);
		expect(normalCDF(1)).toBeCloseTo(0.8413, 3);
		expect(normalCDF(-1)).toBeCloseTo(0.1587, 3);
		expect(normalCDF(2)).toBeCloseTo(0.9772, 3);
		expect(normalCDF(-2)).toBeCloseTo(0.0228, 3);
	});

	test("normalInvCDF at known values", () => {
		expect(normalInvCDF(0.5)).toBeCloseTo(0, 2);
		expect(normalInvCDF(0.8413)).toBeCloseTo(1.0, 2);
		expect(normalInvCDF(0.1587)).toBeCloseTo(-1.0, 2);
		expect(normalInvCDF(0.9772)).toBeCloseTo(2.0, 1);
	});

	test("round-trip: normalCDF(normalInvCDF(u)) ≈ u", () => {
		const testValues = [0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95];
		for (const u of testValues) {
			const roundTripped = normalCDF(normalInvCDF(u));
			expect(roundTripped).toBeCloseTo(u, 2);
		}
	});
});

describe("runMonteCarloSimulation", () => {
	test("returns correct structure", () => {
		const results = runMonteCarloSimulation(DEFAULT_INPUTS, 100);
		expect(results.samples).toHaveLength(100);
		expect(results.percentiles.P5).toBeDefined();
		expect(results.percentiles.P25).toBeDefined();
		expect(results.percentiles.P50).toBeDefined();
		expect(results.percentiles.P75).toBeDefined();
		expect(results.percentiles.P95).toBeDefined();
		expect(results.mean).toBeGreaterThan(0);
		expect(results.stdDev).toBeGreaterThan(0);
	});

	test("samples are sorted", () => {
		const results = runMonteCarloSimulation(DEFAULT_INPUTS, 200);
		for (let i = 1; i < results.samples.length; i++) {
			expect(results.samples[i]!).toBeGreaterThanOrEqual(
				results.samples[i - 1]!,
			);
		}
	});

	test("percentiles are monotonically increasing", () => {
		const results = runMonteCarloSimulation(DEFAULT_INPUTS, 500);
		const { P5, P25, P50, P75, P95 } = results.percentiles;
		expect(P5).toBeLessThanOrEqual(P25);
		expect(P25).toBeLessThanOrEqual(P50);
		expect(P50).toBeLessThanOrEqual(P75);
		expect(P75).toBeLessThanOrEqual(P95);
	});

	test("deterministic with same inputs", () => {
		const r1 = runMonteCarloSimulation(DEFAULT_INPUTS, 100);
		const r2 = runMonteCarloSimulation(DEFAULT_INPUTS, 100);
		expect(r1.mean).toBe(r2.mean);
		expect(r1.stdDev).toBe(r2.stdDev);
	});

	test("component breakdown sums to approximately mean total", () => {
		const results = runMonteCarloSimulation(DEFAULT_INPUTS, 500);
		const componentSum =
			results.componentBreakdown.platform +
			results.componentBreakdown.operations +
			results.componentBreakdown.syncTax +
			results.componentBreakdown.friction;
		// Mean of sums = sum of means, so these should be close
		const relativeError = Math.abs(componentSum - results.mean) / results.mean;
		expect(relativeError).toBeLessThan(0.01);
	});
});
