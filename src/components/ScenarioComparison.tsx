import type { ModelInputs, ModelOutputs } from "../model/types.ts";
import { SCENARIOS } from "../model/defaults.ts";
import { calculateModel } from "../model/calculate.ts";
import { formatEuro, formatEuroCompact } from "../utils/format.ts";

interface ScenarioComparisonProps {
  inputs: ModelInputs;
  outputs: ModelOutputs;
}

export function ScenarioComparison({ inputs, outputs }: ScenarioComparisonProps) {
  const currentTotal = outputs.total;

  const scenarioResults = SCENARIOS.map((scenario) => {
    const merged: ModelInputs = { ...structuredClone(inputs), ...scenario.overrides };
    const result = calculateModel(merged);
    const delta = result.total - currentTotal;
    return { ...scenario, result, delta };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Szenarien</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scenarioResults.map((s) => (
          <div
            key={s.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-800">{s.name}</h3>
            <p className="text-xs text-gray-500 mt-1 mb-3">{s.description}</p>
            <p className="text-xl font-bold text-gray-900">
              {formatEuroCompact(s.result.total)}
            </p>
            <p
              className={`text-sm font-medium mt-1 ${
                s.delta < 0 ? "text-emerald-600" : s.delta > 0 ? "text-rose-600" : "text-gray-500"
              }`}
            >
              {s.delta < 0 ? "" : "+"}
              {formatEuro(s.delta)} vs. aktuell
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
