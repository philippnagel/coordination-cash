import { describe, expect, test } from "bun:test";
import { DEFAULT_INPUTS, PARAMETER_RANGES } from "./defaults.ts";
import { decodeConfig, encodeConfig } from "./url-state.ts";

describe("decodeConfig", () => {
	test("round-trips default inputs", () => {
		const encoded = encodeConfig(DEFAULT_INPUTS);
		const decoded = decodeConfig(encoded);
		expect(decoded).toEqual(DEFAULT_INPUTS);
	});

	test("returns defaults for invalid base64", () => {
		const decoded = decodeConfig("not-valid-base64!!!");
		expect(decoded).toEqual(DEFAULT_INPUTS);
	});

	test("returns defaults for invalid JSON", () => {
		const decoded = decodeConfig(btoa("not json"));
		expect(decoded).toEqual(DEFAULT_INPUTS);
	});

	test("fills missing fields with defaults", () => {
		const partial = { implementations: 50 };
		const encoded = btoa(JSON.stringify(partial));
		const decoded = decodeConfig(encoded);
		expect(decoded.implementations).toBe(50);
		expect(decoded.messageVolume).toBe(DEFAULT_INPUTS.messageVolume);
	});

	test("clamps values above max to max", () => {
		const tooHigh = {
			implementations: 9999,
			concentration: 5.0,
			errorRate: 1.0,
		};
		const encoded = btoa(JSON.stringify(tooHigh));
		const decoded = decodeConfig(encoded);
		expect(decoded.implementations).toBe(PARAMETER_RANGES.implementations.max);
		expect(decoded.concentration).toBe(PARAMETER_RANGES.concentration.max);
		expect(decoded.errorRate).toBe(PARAMETER_RANGES.errorRate.max);
	});

	test("clamps values below min to min", () => {
		const tooLow = {
			implementations: 1,
			concentration: 0,
			messageVolume: 100,
		};
		const encoded = btoa(JSON.stringify(tooLow));
		const decoded = decodeConfig(encoded);
		expect(decoded.implementations).toBe(PARAMETER_RANGES.implementations.min);
		expect(decoded.concentration).toBe(PARAMETER_RANGES.concentration.min);
		expect(decoded.messageVolume).toBe(PARAMETER_RANGES.messageVolume.min);
	});

	test("clamps nested cost values", () => {
		const extreme = {
			costs: { implMaintenance: 0, frictionResolution: 99999 },
		};
		const encoded = btoa(JSON.stringify(extreme));
		const decoded = decodeConfig(encoded);
		expect(decoded.costs.implMaintenance).toBe(
			PARAMETER_RANGES["costs.implMaintenance"].min,
		);
		expect(decoded.costs.frictionResolution).toBe(
			PARAMETER_RANGES["costs.frictionResolution"].max,
		);
	});

	test("clamps nested sector multiplier values", () => {
		const extreme = {
			sectorMultipliers: { implementation: 0.5, friction: 10.0 },
		};
		const encoded = btoa(JSON.stringify(extreme));
		const decoded = decodeConfig(encoded);
		expect(decoded.sectorMultipliers.implementation).toBe(
			PARAMETER_RANGES["sectorMultipliers.implementation"].min,
		);
		expect(decoded.sectorMultipliers.friction).toBe(
			PARAMETER_RANGES["sectorMultipliers.friction"].max,
		);
	});

	test("resets invalid scope to default", () => {
		const invalid = { scope: "invalid_scope" };
		const encoded = btoa(JSON.stringify(invalid));
		const decoded = decodeConfig(encoded);
		expect(decoded.scope).toBe(DEFAULT_INPUTS.scope);
	});

	test("accepts valid scope values", () => {
		for (const scope of ["strom", "strom_gas"]) {
			const encoded = btoa(JSON.stringify({ scope }));
			const decoded = decodeConfig(encoded);
			expect(decoded.scope).toBe(scope);
		}
	});
});
