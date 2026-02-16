import type { ModelInputs } from "./types.ts";
import { clampToRanges, mergeDefaults } from "./url-state.ts";

export interface SavedScenario {
	id: string;
	name: string;
	inputs: ModelInputs;
	createdAt: number;
}

const STORAGE_KEY = "coordination-cash:scenarios";

function isValidEntry(entry: unknown): entry is {
	id: string;
	name: string;
	inputs: Partial<ModelInputs>;
	createdAt: number;
} {
	if (typeof entry !== "object" || entry === null) return false;
	const e = entry as Record<string, unknown>;
	return (
		typeof e.id === "string" &&
		typeof e.name === "string" &&
		typeof e.inputs === "object" &&
		e.inputs !== null &&
		typeof e.createdAt === "number"
	);
}

export function loadSavedScenarios(): SavedScenario[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(isValidEntry).map((entry) => ({
			...entry,
			inputs: clampToRanges(mergeDefaults(entry.inputs)),
		}));
	} catch {
		return [];
	}
}

export function saveScenario(name: string, inputs: ModelInputs): SavedScenario {
	const scenario: SavedScenario = {
		id: crypto.randomUUID(),
		name,
		inputs: structuredClone(inputs),
		createdAt: Date.now(),
	};
	const existing = loadSavedScenarios();
	existing.push(scenario);
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
	} catch {
		// quota exceeded or unavailable — scenario returned but not persisted
	}
	return scenario;
}

export function deleteSavedScenario(id: string): void {
	const existing = loadSavedScenarios();
	const filtered = existing.filter((s) => s.id !== id);
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
	} catch {
		// storage unavailable
	}
}
