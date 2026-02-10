import type { ModelInputs, ModelOutputs, SectorMultipliers } from "./types.ts";
import { SCOPE_CONSTANTS, STROM_ONLY_MULTIPLIERS } from "./defaults.ts";

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

  // Base calculations (Strom)
  const platformBase =
    inputs.implementations * inputs.costs.implMaintenance;

  const operationsBase =
    inputs.participants.large * inputs.costs.opsLarge +
    inputs.participants.medium * inputs.costs.opsMedium +
    inputs.participants.small * inputs.costs.opsSmall +
    inputs.messageVolume * inputs.costs.perMessage;

  const syncTaxBase =
    inputs.updatesPerYear *
    (inputs.implementations * inputs.costs.updateImpl +
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
      longTailCostShare:
        (1 - inputs.concentration) *
        inputs.implementations *
        inputs.costs.implMaintenance,
      effectiveParticipantsPerTopVendor:
        (inputs.concentration * P) / 5,
    },
  };
}
