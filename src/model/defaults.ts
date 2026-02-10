import type { ModelInputs, SectorMultipliers, ScopeConstants, Scope, ParameterRange } from "./types.ts";

export const STROM_ONLY_MULTIPLIERS: SectorMultipliers = {
  implementation: 1.0,
  operations: 1.0,
  update: 1.0,
  friction: 1.0,
};

export const STROM_PLUS_GAS_MULTIPLIERS: SectorMultipliers = {
  implementation: 1.1,
  operations: 1.25,
  update: 1.3,
  friction: 1.4,
};

export const SCOPE_CONSTANTS: Record<Scope, ScopeConstants> = {
  strom: {
    zaehlpunkte: 52_000_000,
    messageVolumeFactor: 1.0,
    participantFactor: 1.0,
  },
  strom_gas: {
    zaehlpunkte: 72_000_000,
    messageVolumeFactor: 1.375,
    participantFactor: 1.136,
  },
};

export const DEFAULT_INPUTS: ModelInputs = {
  scope: "strom_gas",
  implementations: 75,
  participants: { large: 100, medium: 400, small: 1700 },
  messageVolume: 400_000_000,
  updatesPerYear: 1.5,
  errorRate: 0.001,
  concentration: 0.6,
  costs: {
    implMaintenance: 800_000,
    opsLarge: 400_000,
    opsMedium: 100_000,
    opsSmall: 25_000,
    perMessage: 0.01,
    updateImpl: 250_000,
    updateLarge: 50_000,
    updateMedium: 15_000,
    updateSmall: 5_000,
    frictionResolution: 150,
  },
  sectorMultipliers: { ...STROM_PLUS_GAS_MULTIPLIERS },
};

export const PARAMETER_RANGES: Record<string, ParameterRange> = {
  implementations:       { min: 30,    max: 150,       step: 1,          },
  "participants.large":  { min: 50,    max: 150,       step: 5,          },
  "participants.medium": { min: 200,   max: 600,       step: 10,         },
  "participants.small":  { min: 1000,  max: 2500,      step: 50,         },
  messageVolume:         { min: 200e6, max: 800e6,     step: 10_000_000, log: true },
  updatesPerYear:        { min: 0.5,   max: 3,         step: 0.1,        },
  errorRate:             { min: 0.0001,max: 0.01,      step: 0.0001,     log: true },
  concentration:         { min: 0.3,   max: 0.9,       step: 0.01,       },

  "costs.implMaintenance":    { min: 400_000,  max: 1_500_000, step: 50_000,  },
  "costs.opsLarge":           { min: 200_000,  max: 800_000,   step: 10_000,  },
  "costs.opsMedium":          { min: 50_000,   max: 200_000,   step: 5_000,   },
  "costs.opsSmall":           { min: 10_000,   max: 50_000,    step: 1_000,   },
  "costs.perMessage":         { min: 0.005,    max: 0.05,      step: 0.001,   },
  "costs.updateImpl":         { min: 100_000,  max: 500_000,   step: 10_000,  },
  "costs.updateLarge":        { min: 20_000,   max: 100_000,   step: 5_000,   },
  "costs.updateMedium":       { min: 5_000,    max: 30_000,    step: 1_000,   },
  "costs.updateSmall":        { min: 2_000,    max: 15_000,    step: 500,     },
  "costs.frictionResolution": { min: 50,       max: 500,       step: 10,      },

  "sectorMultipliers.implementation": { min: 1.0, max: 1.3, step: 0.01 },
  "sectorMultipliers.operations":     { min: 1.0, max: 1.5, step: 0.01 },
  "sectorMultipliers.update":         { min: 1.0, max: 1.5, step: 0.01 },
  "sectorMultipliers.friction":       { min: 1.0, max: 1.6, step: 0.01 },
};

export interface Scenario {
  id: string;
  name: string;
  description: string;
  overrides: Partial<ModelInputs>;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "consolidation",
    name: "Konsolidierung",
    description: "Weniger Implementierungen, höhere Marktkonzentration (I=30, κ=0.8)",
    overrides: { implementations: 30, concentration: 0.8 },
  },
  {
    id: "api-future",
    name: "API-Zukunft",
    description: "Moderne APIs reduzieren Fehlerrate um 70% (ε=0.03%)",
    overrides: { errorRate: 0.0003 },
  },
  {
    id: "mako-pause",
    name: "MaKo-Pause",
    description: "Regulatorische Pause: nur 0.5 Updates pro Jahr",
    overrides: { updatesPerYear: 0.5 },
  },
];
