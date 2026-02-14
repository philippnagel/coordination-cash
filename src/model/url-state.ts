import { DEFAULT_INPUTS, PARAMETER_RANGES } from "./defaults.ts";
import type { ModelInputs } from "./types.ts";

export function encodeConfig(inputs: ModelInputs): string {
	return btoa(JSON.stringify(inputs));
}

export function decodeConfig(encoded: string): ModelInputs {
	try {
		const parsed = JSON.parse(atob(encoded));
		return clampToRanges(mergeDefaults(parsed));
	} catch {
		return structuredClone(DEFAULT_INPUTS);
	}
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function clampToRanges(inputs: ModelInputs): ModelInputs {
	// Validate scope
	if (inputs.scope !== "strom" && inputs.scope !== "strom_gas") {
		inputs.scope = DEFAULT_INPUTS.scope;
	}

	// Clamp all numeric parameters using PARAMETER_RANGES
	for (const [key, range] of Object.entries(PARAMETER_RANGES)) {
		const parts = key.split(".");
		if (parts.length === 1) {
			const k = parts[0] as keyof ModelInputs;
			const val = inputs[k];
			if (typeof val === "number") {
				(inputs as Record<string, unknown>)[k] = clamp(
					val,
					range.min,
					range.max,
				);
			}
		} else if (parts.length === 2) {
			const [obj, prop] = parts;
			const nested = inputs[obj as keyof ModelInputs];
			if (nested && typeof nested === "object" && prop in nested) {
				(nested as Record<string, number>)[prop] = clamp(
					(nested as Record<string, number>)[prop],
					range.min,
					range.max,
				);
			}
		}
	}

	return inputs;
}

function mergeDefaults(partial: Partial<ModelInputs>): ModelInputs {
	return {
		scope: partial.scope ?? DEFAULT_INPUTS.scope,
		implementations: partial.implementations ?? DEFAULT_INPUTS.implementations,
		participants: {
			large: partial.participants?.large ?? DEFAULT_INPUTS.participants.large,
			medium:
				partial.participants?.medium ?? DEFAULT_INPUTS.participants.medium,
			small: partial.participants?.small ?? DEFAULT_INPUTS.participants.small,
		},
		messageVolume: partial.messageVolume ?? DEFAULT_INPUTS.messageVolume,
		updatesPerYear: partial.updatesPerYear ?? DEFAULT_INPUTS.updatesPerYear,
		errorRate: partial.errorRate ?? DEFAULT_INPUTS.errorRate,
		concentration: partial.concentration ?? DEFAULT_INPUTS.concentration,
		costs: {
			implMaintenance:
				partial.costs?.implMaintenance ?? DEFAULT_INPUTS.costs.implMaintenance,
			opsLarge: partial.costs?.opsLarge ?? DEFAULT_INPUTS.costs.opsLarge,
			opsMedium: partial.costs?.opsMedium ?? DEFAULT_INPUTS.costs.opsMedium,
			opsSmall: partial.costs?.opsSmall ?? DEFAULT_INPUTS.costs.opsSmall,
			perMessage: partial.costs?.perMessage ?? DEFAULT_INPUTS.costs.perMessage,
			updateImpl: partial.costs?.updateImpl ?? DEFAULT_INPUTS.costs.updateImpl,
			updateLarge:
				partial.costs?.updateLarge ?? DEFAULT_INPUTS.costs.updateLarge,
			updateMedium:
				partial.costs?.updateMedium ?? DEFAULT_INPUTS.costs.updateMedium,
			updateSmall:
				partial.costs?.updateSmall ?? DEFAULT_INPUTS.costs.updateSmall,
			frictionResolution:
				partial.costs?.frictionResolution ??
				DEFAULT_INPUTS.costs.frictionResolution,
		},
		sectorMultipliers: {
			implementation:
				partial.sectorMultipliers?.implementation ??
				DEFAULT_INPUTS.sectorMultipliers.implementation,
			operations:
				partial.sectorMultipliers?.operations ??
				DEFAULT_INPUTS.sectorMultipliers.operations,
			update:
				partial.sectorMultipliers?.update ??
				DEFAULT_INPUTS.sectorMultipliers.update,
			friction:
				partial.sectorMultipliers?.friction ??
				DEFAULT_INPUTS.sectorMultipliers.friction,
		},
	};
}

export function getInitialInputs(): ModelInputs {
	const params = new URLSearchParams(window.location.search);
	const config = params.get("config");
	if (config) {
		return decodeConfig(config);
	}
	return structuredClone(DEFAULT_INPUTS);
}

export function pushConfigToUrl(inputs: ModelInputs) {
	const encoded = encodeConfig(inputs);
	const url = new URL(window.location.href);
	url.searchParams.set("config", encoded);
	window.history.replaceState(null, "", url.toString());
}
