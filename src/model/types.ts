export type Scope = "strom" | "strom_gas";

export interface Participants {
	large: number;
	medium: number;
	small: number;
}

export interface Costs {
	implMaintenance: number;
	opsLarge: number;
	opsMedium: number;
	opsSmall: number;
	perMessage: number;
	updateImpl: number;
	updateLarge: number;
	updateMedium: number;
	updateSmall: number;
	frictionResolution: number;
}

export interface SectorMultipliers {
	implementation: number;
	operations: number;
	update: number;
	friction: number;
}

export interface ModelInputs {
	scope: Scope;
	implementations: number;
	participants: Participants;
	messageVolume: number;
	updatesPerYear: number;
	errorRate: number;
	concentration: number;
	costs: Costs;
	sectorMultipliers: SectorMultipliers;
}

export interface CostComponents {
	platform: number;
	operations: number;
	syncTax: number;
	friction: number;
}

export interface DerivedMetrics {
	perZaehlpunkt: number;
	perHousehold: number;
	perMessage: number;
	perParticipant: number;
	impliedFTEs: number;
	longTailCostShare: number;
	effectiveParticipantsPerTopVendor: number;
}

export interface ModelOutputs {
	total: number;
	components: CostComponents;
	derived: DerivedMetrics;
}

export interface ParameterRange {
	min: number;
	max: number;
	step: number;
	log?: boolean;
}

export interface ScopeConstants {
	zaehlpunkte: number;
	messageVolumeFactor: number;
	participantFactor: number;
}
