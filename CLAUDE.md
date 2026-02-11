# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

coordination.cash is an interactive web tool that estimates the national economic cost of Germany's edi@energy market communication system for electricity (Strom) and gas markets. Target audience: policy makers, industry associations, utilities, researchers.

## Commands

```bash
bun run dev      # Start dev server with hot reload (port 3000)
bun run build    # Production build to dist/
bun run css      # Watch mode for Tailwind CSS only
bun run lint     # Uses biome to format, lint, and organize imports of all files
```

Use bun.js testing for tests.

## Architecture

### Tech Stack
- **Runtime/Bundler**: Bun (not Node.js)
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts

### Directory Structure
```
src/
├── model/           # Pure cost calculation logic
│   ├── types.ts     # All TypeScript interfaces
│   ├── calculate.ts # Core calculateModel() function
│   ├── defaults.ts  # Default values and parameter ranges
│   └── url-state.ts # Base64 URL state encoding
├── components/      # React UI components
├── pages/           # Content pages (Methodology, DataSources, About)
└── utils/format.ts  # Number formatting utilities
```

### Cost Model

The model calculates four cost components:
1. **Platform** (`I_eff × C_impl × θ_impl`) - Implementation maintenance
2. **Operations** (`Σ(P_tier × C_ops) + V×C_msg`) × θ_ops - Running costs
3. **Sync Tax** (`U × (I×C_update + Σ(P×C_update))`) × θ_update - Regulatory updates
4. **Friction** (`V × ε × C_resolve × θ_friction`) - Error handling

Key concepts:
- `κ` (concentration) affects `I_eff = κ×5 + (1-κ)×I` for platform costs
- `θ` (theta) multipliers apply only when scope is `strom_gas`
- `P` (total participants) is derived from tier sum, not independently adjustable

### State Management

All model configuration is encoded as base64 JSON in the URL query parameter `config`. This enables shareable links. See `url-state.ts` for encoding/decoding.

## Content Language

All UI text and content pages are in German. The SPEC.md contains the complete specification and changelog.
