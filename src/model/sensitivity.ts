import { calculateModel } from "./calculate.ts";
import { PARAMETER_RANGES } from "./defaults.ts";
import type { ModelInputs } from "./types.ts";

export interface SensitivityResult {
	paramKey: string;
	label: string;
	deltaLow: number;
	deltaHigh: number;
	swing: number;
}

export const PARAM_LABELS: Record<string, string> = {
	implementations: "Implementierungen (I)",
	"participants.large": "Große Teilnehmer",
	"participants.medium": "Mittlere Teilnehmer",
	"participants.small": "Kleine Teilnehmer",
	messageVolume: "Transaktionen (V)",
	updatesPerYear: "Updates/Jahr (U)",
	errorRate: "Fehlerrate (ε)",
	concentration: "Konzentration (κ)",
	"costs.implMaintenance": "Impl. Wartung",
	"costs.opsLarge": "Betrieb Groß",
	"costs.opsMedium": "Betrieb Mittel",
	"costs.opsSmall": "Betrieb Klein",
	"costs.perMessage": "Pro Transaktion",
	"costs.frictionResolution": "Klärfall-Kosten",
	"costs.updateImpl": "Update/Impl",
	"costs.updateLarge": "Update Groß",
	"costs.updateMedium": "Update Mittel",
	"costs.updateSmall": "Update Klein",
	"sectorMultipliers.implementation": "θ Implementierung",
	"sectorMultipliers.operations": "θ Betrieb",
	"sectorMultipliers.update": "θ Updates",
	"sectorMultipliers.friction": "θ Reibung",
};

export function setNestedValue(
	obj: ModelInputs,
	path: string,
	value: number,
): void {
	const parts = path.split(".");
	// biome-ignore lint/suspicious/noExplicitAny: generic nested setter
	let current: any = obj;
	for (let i = 0; i < parts.length - 1; i++) {
		// biome-ignore lint/style/noNonNullAssertion: index always in bounds
		current = current[parts[i]!];
	}
	// biome-ignore lint/style/noNonNullAssertion: parts always has at least one element
	current[parts[parts.length - 1]!] = value;
}

export function calculateSensitivity(
	inputs: ModelInputs,
	topN = 10,
): SensitivityResult[] {
	const baselineTotal = calculateModel(inputs).total;
	const results: SensitivityResult[] = [];

	for (const [paramKey, range] of Object.entries(PARAMETER_RANGES)) {
		// Skip sector multipliers when scope is strom (they have no effect)
		if (paramKey.startsWith("sectorMultipliers.") && inputs.scope === "strom")
			continue;

		// Low variant
		const lowInputs = structuredClone(inputs);
		setNestedValue(lowInputs, paramKey, range.min);
		const lowTotal = calculateModel(lowInputs).total;

		// High variant
		const highInputs = structuredClone(inputs);
		setNestedValue(highInputs, paramKey, range.max);
		const highTotal = calculateModel(highInputs).total;

		const deltaLow = lowTotal - baselineTotal;
		const deltaHigh = highTotal - baselineTotal;
		const swing = Math.abs(deltaHigh - deltaLow);

		// Skip parameters where the current value is already at an extreme and swing is 0
		if (swing === 0) continue;

		results.push({
			paramKey,
			label: PARAM_LABELS[paramKey] ?? paramKey,
			deltaLow,
			deltaHigh,
			swing,
		});
	}

	results.sort((a, b) => b.swing - a.swing);
	return results.slice(0, topN);
}
