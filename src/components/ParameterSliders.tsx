import { useState } from "react";
import type { ModelInputs } from "../model/types.ts";
import { PARAMETER_RANGES } from "../model/defaults.ts";
import { SliderControl } from "./SliderControl.tsx";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

interface ParameterSlidersProps {
  inputs: ModelInputs;
  onChangeValue: (path: string, value: number) => void;
  onReset: () => void;
}

interface ParamDef {
  key: string;
  label: string;
}

const MARKET_STRUCTURE: ParamDef[] = [
  { key: "implementations", label: "Implementierungen (I)" },
  { key: "participants.large", label: "Große Teilnehmer (>100k ZP)" },
  { key: "participants.medium", label: "Mittlere Teilnehmer (10k-100k ZP)" },
  { key: "participants.small", label: "Kleine Teilnehmer (<10k ZP)" },
  { key: "messageVolume", label: "Nachrichtenvolumen / Jahr (V)" },
  { key: "updatesPerYear", label: "Updates pro Jahr (U)" },
  { key: "errorRate", label: "Fehlerrate (ε)" },
  { key: "concentration", label: "Top-5 Konzentration (κ)" },
];

const UNIT_COSTS: ParamDef[] = [
  { key: "costs.implMaintenance", label: "Impl. Wartung (C_impl)" },
  { key: "costs.opsLarge", label: "Betrieb Groß (C_ops_large)" },
  { key: "costs.opsMedium", label: "Betrieb Mittel (C_ops_medium)" },
  { key: "costs.opsSmall", label: "Betrieb Klein (C_ops_small)" },
  { key: "costs.perMessage", label: "Pro Nachricht (C_msg)" },
  { key: "costs.frictionResolution", label: "Klärfall-Kosten (C_resolve)" },
];

const UPDATE_COSTS: ParamDef[] = [
  { key: "costs.updateImpl", label: "Update/Impl (C_update_impl)" },
  { key: "costs.updateLarge", label: "Update Groß (C_update_large)" },
  { key: "costs.updateMedium", label: "Update Mittel (C_update_medium)" },
  { key: "costs.updateSmall", label: "Update Klein (C_update_small)" },
];

const SECTOR_MULTIPLIERS: ParamDef[] = [
  { key: "sectorMultipliers.implementation", label: "θ Implementierung" },
  { key: "sectorMultipliers.operations", label: "θ Betrieb" },
  { key: "sectorMultipliers.update", label: "θ Updates" },
  { key: "sectorMultipliers.friction", label: "θ Reibung" },
];

function getValue(inputs: ModelInputs, path: string): number {
  const parts = path.split(".");
  let obj: unknown = inputs;
  for (const p of parts) {
    obj = (obj as Record<string, unknown>)[p];
  }
  return obj as number;
}

function Section({
  title,
  params,
  inputs,
  onChangeValue,
  defaultOpen = true,
  disabled = false,
}: {
  title: string;
  params: ParamDef[];
  inputs: ModelInputs;
  onChangeValue: (path: string, value: number) => void;
  defaultOpen?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1 hover:text-gray-900"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
      </button>
      {open && (
        <div className="ml-1 space-y-0">
          {params.map(({ key, label }) => {
            const range = PARAMETER_RANGES[key];
            if (!range) return null;
            return (
              <SliderControl
                key={key}
                paramKey={key}
                label={label}
                value={getValue(inputs, key)}
                range={range}
                disabled={disabled}
                onChange={(v) => onChangeValue(key, v)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ParameterSliders({
  inputs,
  onChangeValue,
  onReset,
}: ParameterSlidersProps) {
  const isStromOnly = inputs.scope === "strom";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Parameter anpassen
        </h2>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
        >
          <RotateCcw size={12} />
          Zurücksetzen
        </button>
      </div>

      <div className="space-y-5">
        <Section
          title="Marktstruktur"
          params={MARKET_STRUCTURE}
          inputs={inputs}
          onChangeValue={onChangeValue}
        />
        <Section
          title="Stückkosten"
          params={UNIT_COSTS}
          inputs={inputs}
          onChangeValue={onChangeValue}
          defaultOpen={false}
        />
        <Section
          title="Update-Kosten (pro Release)"
          params={UPDATE_COSTS}
          inputs={inputs}
          onChangeValue={onChangeValue}
          defaultOpen={false}
        />
        <Section
          title="Sektormultiplikatoren (Gas)"
          params={SECTOR_MULTIPLIERS}
          inputs={inputs}
          onChangeValue={onChangeValue}
          defaultOpen={!isStromOnly}
          disabled={isStromOnly}
        />
      </div>
    </div>
  );
}
