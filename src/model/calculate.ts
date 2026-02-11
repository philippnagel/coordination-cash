import { SCOPE_CONSTANTS, STROM_ONLY_MULTIPLIERS } from "./defaults.ts";
import type { ModelInputs, ModelOutputs, SectorMultipliers } from "./types.ts";

export function calculateModel(inputs: ModelInputs): ModelOutputs {
	const P =
		inputs.participants.large +
		inputs.participants.medium +
		inputs.participants.small;

	const θ: SectorMultipliers =
		inputs.scope === "strom_gas"
			? inputs.sectorMultipliers
			: STROM_ONLY_MULTIPLIERS;

	const sc = SCOPE_CONSTANTS[inputs.scope];

	// Effective implementations: κ concentrates maintenance burden
	// Top 5 vendors share κ of the market efficiently; the rest maintain independently
	const I = inputs.implementations;
	const κ = inputs.concentration;
	const I_eff = κ * 5 + (1 - κ) * I;

	// Base calculations (Strom)
	// Platform uses I_eff (concentrated market = less redundant maintenance)
	const platformBase = I_eff * inputs.costs.implMaintenance;

	const operationsBase =
		inputs.participants.large * inputs.costs.opsLarge +
		inputs.participants.medium * inputs.costs.opsMedium +
		inputs.participants.small * inputs.costs.opsSmall +
		inputs.messageVolume * inputs.costs.perMessage;

	// Sync tax uses raw I: every implementation must update regardless of market share
	const syncTaxBase =
		inputs.updatesPerYear *
		(I * inputs.costs.updateImpl +
			inputs.participants.large * inputs.costs.updateLarge +
			inputs.participants.medium * inputs.costs.updateMedium +
			inputs.participants.small * inputs.costs.updateSmall);

	const frictionBase =
		inputs.messageVolume * inputs.errorRate * inputs.costs.frictionResolution;

	// Apply sector multipliers
	const platform = platformBase * θ.implementation;
	const operations = operationsBase * θ.operations;
	const syncTax = syncTaxBase * θ.update;
	const friction = frictionBase * θ.friction;

	const total = platform + operations + syncTax + friction;

	// Derived metrics
	const effectiveV = inputs.messageVolume * sc.messageVolumeFactor;
	const effectiveP = P * sc.participantFactor;

	return {
		total,
		components: { platform, operations, syncTax, friction },
		derived: {
			perZaehlpunkt: total / sc.zaehlpunkte,
			perHousehold: total / 42_000_000,
			perMessage: total / effectiveV,
			perParticipant: total / effectiveP,
			impliedFTEs: total / 100_000,
			longTailCostShare: (1 - κ) * I * inputs.costs.implMaintenance,
			effectiveParticipantsPerTopVendor: (κ * P) / 5,
		},
	};
}
