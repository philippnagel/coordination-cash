import { calculateModel } from "../model/calculate.ts";
import type { Scenario } from "../model/defaults.ts";
import { SCENARIOS } from "../model/defaults.ts";
import type { ModelInputs, ModelOutputs } from "../model/types.ts";
import { formatEuro, formatEuroCompact } from "../utils/format.ts";

interface ScenarioComparisonProps {
	inputs: ModelInputs;
	outputs: ModelOutputs;
	onApplyScenario: (
		overrides: Scenario["overrides"],
		isActive: boolean,
	) => void;
}

export function ScenarioComparison({
	inputs,
	outputs,
	onApplyScenario,
}: ScenarioComparisonProps) {
	const currentTotal = outputs.total;

	const scenarioResults = SCENARIOS.map((scenario) => {
		const merged: ModelInputs = {
			...structuredClone(inputs),
			...scenario.overrides,
		};
		const result = calculateModel(merged);
		const delta = result.total - currentTotal;
		return { ...scenario, result, delta };
	});

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<h2 className="text-base font-semibold text-gray-900 mb-4">Szenarien</h2>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				{scenarioResults.map((s) => {
					const isActive = s.delta === 0;
					return (
						<button
							type="button"
							key={s.id}
							onClick={() => onApplyScenario(s.overrides, isActive)}
							className={`border rounded-lg p-4 transition-colors text-left cursor-pointer ${
								isActive
									? "border-blue-400 bg-blue-50"
									: "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
							}`}
						>
							<h3 className="text-sm font-semibold text-gray-800">{s.name}</h3>
							<p className="text-xs text-gray-500 mt-1 mb-3">{s.description}</p>
							<p className="text-xl font-bold text-gray-900">
								{formatEuroCompact(s.result.total)}
							</p>
							{isActive ? (
								<p className="text-sm font-medium mt-1 text-blue-600">
									✓ Aktiv
								</p>
							) : (
								<p
									className={`text-sm font-medium mt-1 ${
										s.delta < 0 ? "text-emerald-600" : "text-rose-600"
									}`}
								>
									{s.delta < 0 ? "" : "+"}
									{formatEuro(s.delta)} vs. aktuell
								</p>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
