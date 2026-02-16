# coordination.cash - the edi@energy National Cost Model — Specification

## Overview

An interactive web tool to estimate the **total national economic cost** of operating Germany's edi@energy market communication system for the energy sector — covering both **electricity (Strom) and gas (Gas)** markets.

**Target audience:** Policy makers, industry associations (BDEW, BNE), utilities, researchers, journalists

**Core value proposition:** Make visible the hidden coordination tax that Germany's energy sector pays annually to exchange standardized messages.

---

## Scope: Strom + Gas

The edi@energy system governs market communication for **both** electricity and gas markets. These share significant infrastructure but are not identical:

| Dimension | Strom | Gas | Combined |
|-----------|-------|-----|----------|
| Zählpunkte | ~52M | ~20M | ~72M |
| Netzbetreiber | ~800 | ~700 | ~1,050 unique* |
| Lieferanten | ~1,000 | ~400 | ~1,200 unique* |
| Total participants | ~2,200 | ~1,100 | ~2,500 unique* |
| Annual messages | ~400M | ~150M | ~550M |

*Many participants operate in both markets (esp. Stadtwerke), so totals are not additive.

### Modeling Approach: Sector Multipliers

Rather than building parallel models, we apply **θ (theta) multipliers** to the base electricity model to account for gas market overhead:

| Factor | Symbol | Default | Rationale |
|--------|--------|---------|-----------|
| Implementation overhead | θ_impl | 1.1 | Most platforms cover both; ~10% gas-specific |
| Operations overhead | θ_ops | 1.25 | ~25% additional participants (gas-only actors) |
| Update overhead | θ_update | 1.3 | Gas processes bundled but add complexity |
| Friction overhead | θ_friction | 1.4 | ~40% more messages → proportional friction |

The UI allows toggling between "Strom only" and "Strom + Gas" views via an explicit scope selector.

---

## The Model

### Fundamental Insight

The edi@energy system is a **mandatory coordination game** where:
- All ~2,500 market participants must implement the same specification
- Updates must happen simultaneously across the entire market
- The same logic is independently implemented ~75 times
- Errors create bilateral friction that scales with message volume
- Market concentration means a handful of vendors bear disproportionate implementation burden

### Cost Equation

```
C_national = (C_platform × θ_impl) 
           + (C_operations × θ_ops) 
           + (C_sync_tax × θ_update) 
           + (C_friction × θ_friction)
```

Where θ = 1.0 for electricity-only, or sector-specific multipliers for combined Strom + Gas.

#### Component Definitions

| Component | Formula | Description |
|-----------|---------|-------------|
| **C_platform** | `I_eff × C_impl` | Cost of maintaining implementations, weighted by concentration |
| **C_operations** | `Σ(P_tier × C_ops_tier) + V × C_msg` | Participant operations + marginal message processing |
| **C_sync_tax** | `U × (I × C_update_impl + Σ(P_tier × C_update_tier))` | Regulatory update costs across all actors, tiered by size |
| **C_friction** | `V × ε × C_resolve` | Error handling, Clearingfälle, disputes |

### Variables

#### Structural Variables (Market Shape)

| Variable | Symbol | Default | Range | Source |
|----------|--------|---------|-------|--------|
| Scope | `scope` | `strom_gas` | `strom` / `strom_gas` | User toggle |
| Independent implementations | `I` | 75 | 30-150 | Vendor count + in-house |
| — Large (>100k ZP) | `P_large` | 100 | 50-150 | Top utilities |
| — Medium (10k-100k ZP) | `P_medium` | 400 | 200-600 | Mid-size Stadtwerke |
| — Small (<10k ZP) | `P_small` | 1,700 | 1,000-2,500 | Small LF, wMSB |
| Annual message volume (Strom) | `V` | 400M | 200M-800M | edi@energy statistics |
| Annual message volume (combined) | `V_combined` | 550M | 350M-1B | edi@energy statistics |
| Major updates per year | `U` | 1.5 | 0.5-3 | BDEW release cycle |
| Error rate | `ε` | 0.1% | 0.01%-1% | Industry estimates |
| Market concentration (top-5 share) | `κ` | 0.6 | 0.3-0.9 | Industry structure |

**Total participants (`P`)** is derived as `P_large + P_medium + P_small` (default 2,200 for Strom). Not independently adjustable.

**Market concentration (`κ`):** The fraction of all participants served by the top 5 implementations (e.g. Schleupen, SAP IS-U, SIV, Robotron, and one other). Default 0.6 means ~60% of participants run on just 5 platforms. κ **mechanically affects platform costs** via the effective implementation count: `I_eff = κ × 5 + (1-κ) × I`. With defaults: I_eff = 0.6×5 + 0.4×75 = 33. This models the insight that concentrated vendors amortize maintenance across many participants, while long-tail implementations bear full per-vendor cost. Note: sync tax still uses raw I, since every implementation must be updated regardless of market share.

#### Unit Cost Variables (€)

| Variable | Symbol | Default | Range | Rationale |
|----------|--------|---------|-------|-----------|
| Implementation maintenance | `C_impl` | 800,000 | 400k-1.5M | Platform team + infra |
| Ops cost (large) | `C_ops_large` | 400,000 | 200k-800k | 3-4 FTE + systems |
| Ops cost (medium) | `C_ops_medium` | 100,000 | 50k-200k | 1 FTE + tooling |
| Ops cost (small) | `C_ops_small` | 25,000 | 10k-50k | Shared service fee |
| Per-message marginal cost | `C_msg` | 0.01 | 0.005-0.05 | Routing, storage, bandwidth only* |
| Update cost (per impl) | `C_update_impl` | 250,000 | 100k-500k | Dev + QA per release |
| Update cost (large participant) | `C_update_large` | 50,000 | 20k-100k | UAT, workflow changes, retraining |
| Update cost (medium participant) | `C_update_medium` | 15,000 | 5k-30k | Config, testing, staff time |
| Update cost (small participant) | `C_update_small` | 5,000 | 2k-15k | Vendor-managed update, verification |
| Friction resolution | `C_resolve` | 150 | 50-500 | Staff time per case |

*`C_msg` represents **marginal** per-message cost only (routing, storage, bandwidth). The fixed infrastructure costs for message processing are already captured in the tiered `C_ops` values. This avoids double-counting — a large utility's 400k€/year ops cost already includes their MaKo platform infrastructure.

#### Sector Multipliers (θ) — Gas Market Overhead

| Variable | Symbol | Default | Range | Rationale |
|----------|--------|---------|-------|-----------|
| Implementation overhead | `θ_impl` | 1.1 | 1.0-1.3 | Most platforms cover both |
| Operations overhead | `θ_ops` | 1.25 | 1.0-1.5 | Additional gas-only participants |
| Update overhead | `θ_update` | 1.3 | 1.0-1.5 | Bundled but adds spec complexity |
| Friction overhead | `θ_friction` | 1.4 | 1.0-1.6 | Volume ratio 1.375 + gas-specific error premium |

Set all θ = 1.0 for electricity-only view. Theta values are **only adjustable** when scope = `strom_gas`.

### Default Calculation

#### Electricity (Strom) Only — Base Model

```
I_eff         = κ×5 + (1-κ)×I = 0.6×5 + 0.4×75             =          33
C_platform    = 33 × 800,000                                =  26,400,000 €
C_operations  = (100×400,000 + 400×100,000 + 1,700×25,000)
              + (400,000,000 × 0.01)                         = 126,500,000 €
C_sync_tax    = 1.5 × (75×250,000
              + 100×50,000 + 400×15,000 + 1,700×5,000)       =  57,375,000 €
C_friction    = 400,000,000 × 0.001 × 150                   =  60,000,000 €
─────────────────────────────────────────────────────────────────────────
TOTAL (Strom only)                                          ≈ 270,000,000 €/year
```

#### Combined Strom + Gas — With Sector Multipliers

```
C_platform    =  26,400,000 € × 1.10                        =  29,040,000 €
C_operations  = 126,500,000 € × 1.25                        = 158,125,000 €
C_sync_tax    =  57,375,000 € × 1.30                        =  74,587,500 €
C_friction    =  60,000,000 € × 1.40                        =  84,000,000 €
─────────────────────────────────────────────────────────────────────────
TOTAL (Strom + Gas)                                         ≈ 346,000,000 €/year
```

### Derived Metrics

| Metric | Formula | Strom Only | Strom + Gas |
|--------|---------|------------|-------------|
| Cost per Zählpunkt | `C_national / ZP` | ~5.20 €/year | ~4.80 €/year |
| Cost per household | `C_national / 42M` | ~6.44 €/year | ~8.23 €/year |
| Cost per message | `C_national / V` | ~0.68 € | ~0.63 € |
| Cost per participant | `C_national / P` | ~122,900 €/year | ~138,300 €/year |
| Implied national FTEs | `C_national / 100k` | ~2,703 FTE | ~3,458 FTE |
| Effective impl. (top-5 weighted) | `κ × P / 5` | ~264 participants/vendor | — |
| Long-tail impl. cost share | `(1-κ) × I × C_impl` | 24M € | — |

The **long-tail implementation cost share** highlights how much the market spends maintaining the ~70 smaller implementations that collectively serve only ~40% of participants — a key input to the Consolidation scenario.

---

## Architecture Diagram (System View)

```
┌─────────────────────────────────────────────────────────────────┐
│                      PLATFORM LAYER                              │
│                                                                  │
│   ~75 independent implementations of the same specification      │
│   Vendors: Schleupen, SIV, Robotron, SAP IS-U, in-house...      │
│                                                                  │
│   ┌──────────────────────────┐  ┌──────────────────────────┐     │
│   │  Top 5 (κ=60% share)    │  │  ~70 long-tail impls     │     │
│   │  Serve ~1,500 players    │  │  Serve ~1,000 players    │     │
│   └──────────────────────────┘  └──────────────────────────┘     │
│                                                                  │
│   Cost driver: I_eff × C_impl × θ_impl              ≈ 29M€/year  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ serves
┌─────────────────────────────────────────────────────────────────┐
│                     PARTICIPANT LAYER                            │
│                                                                  │
│   ~2,500 market participants operating MaKo processes            │
│   (Strom + Gas, with significant overlap)                        │
│                                                                  │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│   │  ~100   │  │  ~400   │  │ ~1,700  │  │ Shared  │           │
│   │  Large  │  │ Medium  │  │  Small  │  │Services │           │
│   │ 400k€/a │  │ 100k€/a │  │  25k€/a │  │         │           │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│                                                                  │
│   Cost driver: Σ(P_tier × C_ops_tier) + V×C_msg × θ_ops        │
│                                                   ≈ 158M€/year  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ synchronized by
┌─────────────────────────────────────────────────────────────────┐
│                   REGULATORY UPDATE CYCLE                        │
│                                                                  │
│   MaKo updates (GPKE, WiM, MaBiS, GeLi, etc.) ~1.5×/year       │
│   All implementations + all participants must update together    │
│   Covers both Strom and Gas processes                            │
│                                                                  │
│   Update costs tiered by participant size:                       │
│   Large: 50k€/update — UAT, workflow changes, retraining        │
│   Medium: 15k€/update — config, testing, staff time              │
│   Small: 5k€/update — vendor-managed, verification only          │
│                                                                  │
│   Cost driver: U × (I×C_update_impl + Σ(P_tier×C_update_tier))  │
│                × θ_update                          ≈ 75M€/year   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ generates
┌─────────────────────────────────────────────────────────────────┐
│                      FRICTION / ENTROPY                          │
│                                                                  │
│   ~550M messages/year (Strom + Gas), ~0.1% error rate            │
│   Clearingfälle, interpretation disputes, retries, corrections   │
│                                                                  │
│   Cost driver: V × ε × C_resolve × θ_friction      ≈ 84M€/year │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Interface Specification

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  edi@energy National Cost Model                              [?] [i] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SCOPE:  [● Strom + Gas]  [ Strom only ]                            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │                    TOTAL: €346 Million/year                    │  │
│  │                                                                │  │
│  │         ████████░░░░░░░░░░░░░░░░  Platform      29M€  (8%)    │  │
│  │         ████████████████████████████████████░  Ops  158M€ (46%)│  │
│  │         ██████████████████████░░░░  Sync Tax     75M€ (22%)   │  │
│  │         ████████████████████████░░░░░  Friction  84M€ (24%)   │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐                    │
│  │ €4.80 / Zählpunkt   │  │ €8.23 / Household   │                    │
│  │ per year            │  │ per year            │                    │
│  └─────────────────────┘  └─────────────────────┘                    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  ADJUST PARAMETERS                                          [Reset] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Market Structure                                                    │
│  ├─ Implementations (I)        ●────────────○  75     [30-150]      │
│  ├─ Participants (P)           ●──────────○    2,200  [1.5k-3k]     │
│  ├─ Message volume (V)         ●────────○      400M   [200M-800M]   │
│  ├─ Updates/year (U)           ●──────○        1.5    [0.5-3]       │
│  └─ Concentration κ (top-5)   ●──────○        0.60   [0.3-0.9]     │
│                                                                      │
│  Unit Costs                                              [Advanced]  │
│  ├─ C_impl (per implementation) ●────────○     800k€               │
│  ├─ C_ops_large                 ●────────○     400k€               │
│  ├─ C_ops_medium                ●────────○     100k€               │
│  └─ C_ops_small                 ●────────○      25k€               │
│                                                                      │
│  Update Costs (per release)                              [Advanced]  │
│  ├─ C_update_impl               ●────────○     250k€               │
│  ├─ C_update_large              ●────────○      50k€               │
│  ├─ C_update_medium             ●────────○      15k€               │
│  └─ C_update_small              ●────────○       5k€               │
│                                                                      │
│  Sector Multipliers (Gas)                      [Only in Strom+Gas]  │
│  ├─ θ_impl                      ●────────○     1.10                 │
│  ├─ θ_ops                       ●────────○     1.25                 │
│  ├─ θ_update                    ●────────○     1.30                 │
│  └─ θ_friction                  ●────────○     1.40                 │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  SCENARIOS                                                           │
├──────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│  │  Current   │ │ Consolid.  │ │ API Future │ │ MaKo Pause │        │
│  │   State    │ │(I=30,κ=.8) │ │  (-70% ε)  │ │  (U=0.5)   │        │
│  │   346M€    │ │   304M€    │ │   287M€    │ │   296M€    │        │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘        │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  [Export PDF]  [Share Link]  [Methodology]  [Data Sources]          │
└──────────────────────────────────────────────────────────────────────┘
```

### Interactive Features

#### 1. Primary Display
- Large, prominent total cost figure (updates in real-time)
- Stacked bar showing component breakdown with percentages
- Key derived metrics (cost per ZP, per household)

#### 2. Parameter Sliders
- Grouped by category (Market Structure, Unit Costs, Update Costs)
- Show current value + valid range
- Logarithmic scale for large ranges (message volume)
- "Advanced" toggle for less common parameters (unit costs, update costs)
- Sector multiplier sliders **disabled / hidden** when scope = `strom`

#### 3. Scenario Comparison
- Pre-defined scenarios illustrating policy interventions
- Consolidation scenario now uses both `I` and `κ` to model realistic vendor reduction
- Side-by-side comparison with current state
- User can save custom scenarios

#### 4. Sensitivity Analysis (Advanced View)
- Tornado chart showing which parameters matter most
- Monte Carlo simulation with uncertainty ranges

### Pages / Views

| View | Purpose |
|------|---------|
| **Calculator** | Main interactive model (default) |
| **Methodology** | Detailed explanation of model derivation |
| **Data Sources** | Links to BNetzA, BDEW, MaStR, etc. |
| **About** | Context, motivation, limitations |
| **API** | JSON endpoint for programmatic access |

---

## Technical Implementation

### Stack Recommendation

```
Frontend:  React + TypeScript
Styling:   Tailwind CSS
Charts:    Recharts or D3.js
State:     URL params (base64-encoded config, shareable)
Hosting:   Vercel / Netlify (static)
```

### Data Model (TypeScript)

```typescript
type Scope = 'strom' | 'strom_gas';

interface ModelInputs {
  // Scope
  scope: Scope;

  // Structural
  implementations: number;          // I
  participants: {
    large: number;                  // P_large
    medium: number;                 // P_medium  
    small: number;                  // P_small
  };
  messageVolume: number;            // V (annual, Strom base)
  updatesPerYear: number;           // U
  errorRate: number;                // ε
  concentration: number;            // κ (top-5 vendor share, 0-1)
  
  // Unit costs (€)
  costs: {
    implMaintenance: number;        // C_impl
    opsLarge: number;               // C_ops_large
    opsMedium: number;              // C_ops_medium
    opsSmall: number;               // C_ops_small
    perMessage: number;             // C_msg (marginal only)
    updateImpl: number;             // C_update_impl
    updateLarge: number;            // C_update_large
    updateMedium: number;           // C_update_medium
    updateSmall: number;            // C_update_small
    frictionResolution: number;     // C_resolve
  };
  
  // Sector multipliers (θ) — only applied when scope = 'strom_gas'
  sectorMultipliers: {
    implementation: number;         // θ_impl
    operations: number;             // θ_ops
    update: number;                 // θ_update
    friction: number;               // θ_friction
  };
}

interface ModelOutputs {
  total: number;
  components: {
    platform: number;
    operations: number;
    syncTax: number;
    friction: number;
  };
  derived: {
    perZaehlpunkt: number;
    perHousehold: number;
    perMessage: number;
    perParticipant: number;
    impliedFTEs: number;
    longTailCostShare: number;
    effectiveParticipantsPerTopVendor: number;
  };
}

// Scope-dependent constants
const SCOPE_CONSTANTS: Record<Scope, { zaehlpunkte: number; messageVolumeFactor: number; participantFactor: number }> = {
  strom: {
    zaehlpunkte: 52_000_000,
    messageVolumeFactor: 1.0,     // Use V as-is
    participantFactor: 1.0,       // Use P as-is
  },
  strom_gas: {
    zaehlpunkte: 72_000_000,
    messageVolumeFactor: 1.375,   // 550M / 400M
    participantFactor: 1.136,     // 2,500 / 2,200
  },
};

// Preset multipliers
const STROM_ONLY: SectorMultipliers = {
  implementation: 1.0,
  operations: 1.0,
  update: 1.0,
  friction: 1.0,
};

const STROM_PLUS_GAS: SectorMultipliers = {
  implementation: 1.1,
  operations: 1.25,
  update: 1.3,
  friction: 1.4,
};

function calculateModel(inputs: ModelInputs): ModelOutputs {
  const P = inputs.participants.large 
          + inputs.participants.medium 
          + inputs.participants.small;
  
  // Apply θ only when scope is strom_gas; force 1.0 for strom
  const θ = inputs.scope === 'strom_gas'
    ? inputs.sectorMultipliers
    : STROM_ONLY;
  
  const scopeConst = SCOPE_CONSTANTS[inputs.scope];

  // Effective implementations: κ concentrates maintenance burden
  const I = inputs.implementations;
  const κ = inputs.concentration;
  const I_eff = κ * 5 + (1 - κ) * I;

  // Base calculations (Strom)
  const platformBase = I_eff * inputs.costs.implMaintenance;
  
  const operationsBase = 
    (inputs.participants.large * inputs.costs.opsLarge) +
    (inputs.participants.medium * inputs.costs.opsMedium) +
    (inputs.participants.small * inputs.costs.opsSmall) +
    (inputs.messageVolume * inputs.costs.perMessage);
  
  // Sync tax uses raw I: every implementation must update
  const syncTaxBase = inputs.updatesPerYear * (
    (I * inputs.costs.updateImpl) +
    (inputs.participants.large * inputs.costs.updateLarge) +
    (inputs.participants.medium * inputs.costs.updateMedium) +
    (inputs.participants.small * inputs.costs.updateSmall)
  );
  
  const frictionBase = 
    inputs.messageVolume * inputs.errorRate * inputs.costs.frictionResolution;
  
  // Apply sector multipliers
  const platform = platformBase * θ.implementation;
  const operations = operationsBase * θ.operations;
  const syncTax = syncTaxBase * θ.update;
  const friction = frictionBase * θ.friction;
  
  const total = platform + operations + syncTax + friction;
  
  // Scope-aware derived metrics
  const effectiveZP = scopeConst.zaehlpunkte;
  const effectiveV = inputs.messageVolume * scopeConst.messageVolumeFactor;
  const effectiveP = P * scopeConst.participantFactor;
  
  return {
    total,
    components: { platform, operations, syncTax, friction },
    derived: {
      perZaehlpunkt: total / effectiveZP,
      perHousehold: total / 42_000_000,
      perMessage: total / effectiveV,
      perParticipant: total / effectiveP,
      impliedFTEs: total / 100_000,
      longTailCostShare: (1 - κ) * I * inputs.costs.implMaintenance,
      effectiveParticipantsPerTopVendor: (κ * P) / 5,
    }
  };
}
```

### URL State Encoding

All model configuration is encoded as a **base64 JSON blob** in the URL for shareability:

```
https://edienergy-cost.de/?config=eyJzY29wZSI6InN0cm9tX2dhcyIsIkki...
```

This keeps URLs compact (critical for social media previews and messaging) and avoids the fragility of 15+ individual query parameters. The app decodes and validates the config on load, falling back to defaults for any missing or invalid fields.

```typescript
function encodeConfig(inputs: ModelInputs): string {
  return btoa(JSON.stringify(inputs));
}

function decodeConfig(encoded: string): ModelInputs {
  try {
    const parsed = JSON.parse(atob(encoded));
    return validateAndMergeDefaults(parsed);
  } catch {
    return DEFAULT_INPUTS;
  }
}
```

---

## Content Requirements

### Methodology Page

Must explain:
1. Why this model exists (visibility into coordination costs)
2. Each cost component with real-world examples
3. The marginal-cost rationale for `C_msg` (why it's separate from `C_ops`)
4. Why sync tax is tiered by participant size (different update burdens)
5. How market concentration (`κ`) affects the consolidation argument
6. Data sources and estimation approaches
7. Known limitations and uncertainties
8. How to interpret results

### Caveats & Limitations

Display prominently:
- This is an **estimation model**, not an audit
- Default values are informed estimates, not measurements
- Costs may overlap (e.g., ops vs. update costs) — the model mitigates this by treating `C_msg` as marginal cost only and tiering update costs separately from ops
- Does not include: consumer billing, external consulting, opportunity costs
- Model assumes current architecture; doesn't account for AS4 transition benefits
- Sector multipliers (θ) are approximations; actual gas market costs may differ

---

## Implementation Checklist

### v1 — MVP (Calculator)
- [x] Core model engine (calculateModel pure function)
- [x] Scope toggle (Strom / Strom+Gas) with θ auto-switching
- [x] Cost display: total + stacked bar + component breakdown
- [x] Derived metrics cards (per ZP, per household, FTEs, etc.)
- [x] Parameter sliders grouped by category, with collapsible sections
- [x] Logarithmic scale for large-range sliders (V, ε)
- [x] θ sliders disabled when scope = strom
- [x] Reset all parameters button
- [x] Scenario comparison (Consolidation, API Future, MaKo Pause)
- [x] URL state encoding (base64 JSON, shareable links)
- [x] Content pages: Methodology, Data Sources, About (German)
- [x] Responsive layout with sticky header navigation
- [x] Share button (copy URL to clipboard)
- [x] Input validation: clamp URL-decoded values to parameter ranges

### v1.1 — Polish
- [x] Export PDF (print stylesheet or html2canvas)
- [x] Custom scenario saving (localStorage)
- [ ] Smooth animated transitions on value changes
- [ ] Social meta tags (Open Graph) for link previews
- [ ] German number formatting in slider inputs (dots as thousands separator)
- [ ] `[?]` tooltips on parameter labels explaining each variable
- [ ] `[i]` info button in header linking to Methodology page

### v1.2 — Advanced Analytics
- [x] Sensitivity analysis: tornado chart showing parameter impact ranking
- [x] Monte Carlo simulation with uncertainty ranges
- [ ] API / JSON endpoint for programmatic access that works with the current static page

### Phase 2
- [ ] Time series: model cost evolution 2015-2030
- [ ] Comparative: benchmark against UK, NL, Nordic markets
- [ ] Counterfactual: "What if we had APIs from the start?"
- [ ] Role breakdown: show costs by market role (VNB, LF, MSB)
- [ ] Concentration analysis: detailed vendor market share modeling

### Phase 3
- [ ] Crowd-sourced calibration: let participants submit anonymized cost data
- [ ] Policy simulator: model impact of specific regulatory changes
- [ ] Carbon equivalent: translate compute/coordination into CO2

---

## Data Validation Strategy

Before launch, calibrate defaults via:
1. **3-5 anonymous Stadtwerke datapoints** — sanity-check unit costs (C_ops, C_update) with insiders at different tiers
2. **Vendor cross-reference** — confirm implementation count (I) and concentration (κ) via public vendor lists and conference attendee data
3. **Message volume triangulation** — compare edi@energy published statistics with BNetzA Monitoring Reports
4. **Sensitivity-first launch** — the model's transparency (all assumptions visible, all sliders adjustable) is itself the credibility mechanism; institutional backing can follow in Phase 2

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Unique visitors (month 1) | 1,000+ |
| Average time on page | >2 min |
| Social shares | 100+ |
| Citations in policy documents | 1+ |
| Media mentions | 3+ |

---

## Open Questions

1. ~~**Data validation:** How do we calibrate default values?~~ → See Data Validation Strategy above
2. **Institutional backing:** Partner with BDEW, BNetzA, or academic institution for credibility? *(Deprioritized for v1; model transparency serves as credibility mechanism)*
3. **Language:** German-only for v1 to maximize policy relevance; English in Phase 2 if international traction emerges
4. **Maintenance:** Who updates the model as market evolves? → Open-source with clear contribution policy

---

## References

- BNetzA Marktdaten: https://www.bundesnetzagentur.de/
- Marktstammdatenregister: https://www.marktstammdatenregister.de/
- BDEW edi@energy: https://www.edi-energy.de/
- BDEW Marktprozesse: https://www.bdew.de/

---

## Changelog

### v0.3 — 2026-02-10
- κ now mechanically affects platform cost via `I_eff = κ×5 + (1-κ)×I` (default I_eff=33)
- Removed standalone P and P_combined variables — P is now derived from tier sum
- Clarified θ_friction = 1.4 rationale: volume ratio 1.375 + gas-specific error premium
- Updated C_platform formula from `I × C_impl` to `I_eff × C_impl`
- Recalculated all totals, derived metrics, scenarios, and diagram annotations

### v0.2.1 — 2026-02-10
- Fixed sync tax arithmetic: 55.1M → 57.4M (inner sum was 38.25M, not 36.75M)
- Fixed long-tail cost share: 33.6M → 24M (correct: 0.4 × 75 × 800k)
- Corrected all totals: Strom ~304M (was ~302M), Strom+Gas ~383M (was ~380M)
- Corrected scenario figures: Consolidation 321M (was 344M), API Future 324M (was 322M), MaKo Pause 333M (was 332M)
- Updated all derived metrics and architecture diagram annotations to match

### v0.2 — 2026-02-10
- Added explicit `scope` field replacing fragile `θ.operations > 1.0` heuristic for gas detection
- Tiered sync tax update costs by participant size (large/medium/small) replacing flat per-participant rate
- Added market concentration variable (`κ`) with long-tail cost share metric
- Reduced `C_msg` default from €0.02 to €0.01 and clarified as marginal cost only to avoid double-counting with `C_ops`
- Added `P_combined` (2,500) for consistent Strom+Gas participant counts in derived metrics
- Switched URL state encoding to base64 JSON blob for compact, shareable URLs
- Added Data Validation Strategy section
- Resolved open questions (data validation, language) with concrete decisions
- Updated all calculated totals and derived metrics to reflect model changes

### v0.1 — 2026-01-24
- Initial draft

---

*Version: 0.3 — κ affects costs, model design issues resolved*
*Last updated: 2026-02-10*
