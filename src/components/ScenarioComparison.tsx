import { useState } from "react";
import { calculateModel } from "../model/calculate.ts";
import type { Scenario } from "../model/defaults.ts";
import { DEFAULT_INPUTS, SCENARIOS } from "../model/defaults.ts";
import type { SavedScenario } from "../model/storage.ts";
import type { ModelInputs, ModelOutputs } from "../model/types.ts";
import { formatEuro, formatEuroCompact } from "../utils/format.ts";

interface ScenarioComparisonProps {
	outputs: ModelOutputs;
	onApplyScenario: (
		overrides: Scenario["overrides"],
		isActive: boolean,
	) => void;
	savedScenarios: SavedScenario[];
	activeCustomScenarioId: string | null;
	onSaveScenario: (name: string) => void;
	onDeleteScenario: (id: string) => void;
	onApplyCustomScenario: (
		id: string,
		inputs: ModelInputs,
		isActive: boolean,
	) => void;
}

export function ScenarioComparison({
	outputs,
	onApplyScenario,
	savedScenarios,
	activeCustomScenarioId,
	onSaveScenario,
	onDeleteScenario,
	onApplyCustomScenario,
}: ScenarioComparisonProps) {
	const [showSaveForm, setShowSaveForm] = useState(false);
	const [saveName, setSaveName] = useState("");

	const currentTotal = outputs.total;
	const defaultTotal = calculateModel(DEFAULT_INPUTS).total;

	const scenarioResults = SCENARIOS.map((scenario) => {
		const merged: ModelInputs = {
			...structuredClone(DEFAULT_INPUTS),
			...scenario.overrides,
		};
		const result = calculateModel(merged);
		const delta = result.total - defaultTotal;
		return { ...scenario, result, delta };
	});

	const handleSave = () => {
		const trimmed = saveName.trim();
		if (!trimmed) return;
		onSaveScenario(trimmed);
		setSaveName("");
		setShowSaveForm(false);
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<h2 className="text-base font-semibold text-gray-900 mb-4">Szenarien</h2>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				{scenarioResults.map((s) => {
					const isActive = s.result.total === currentTotal;
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
									&#10003; Aktiv
								</p>
							) : (
								<p
									className={`text-sm font-medium mt-1 ${
										s.delta < 0 ? "text-emerald-600" : "text-rose-600"
									}`}
								>
									{s.delta < 0 ? "" : "+"}
									{formatEuro(s.delta)} vs. Standard
								</p>
							)}
						</button>
					);
				})}
			</div>

			{/* Save current configuration */}
			<div className="mt-4">
				{showSaveForm ? (
					<div className="flex items-center gap-2">
						<input
							type="text"
							value={saveName}
							onChange={(e) => setSaveName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSave()}
							placeholder="Name des Szenarios"
							className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
							// biome-ignore lint/a11y/noAutofocus: intentional focus on user-triggered form
							autoFocus
						/>
						<button
							type="button"
							onClick={handleSave}
							disabled={!saveName.trim()}
							className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Speichern
						</button>
						<button
							type="button"
							onClick={() => {
								setShowSaveForm(false);
								setSaveName("");
							}}
							className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
						>
							Abbrechen
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => setShowSaveForm(true)}
						className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
					>
						+ Aktuelle Konfiguration speichern
					</button>
				)}
			</div>

			{/* Saved custom scenarios */}
			{savedScenarios.length > 0 && (
				<div className="mt-6">
					<h3 className="text-sm font-semibold text-gray-700 mb-3">
						Gespeicherte Szenarien
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						{savedScenarios.map((s) => {
							const result = calculateModel(s.inputs);
							const delta = result.total - defaultTotal;
							const isActive = activeCustomScenarioId === s.id;
							return (
								<div
									key={s.id}
									className={`relative border rounded-lg p-4 transition-colors text-left ${
										isActive
											? "border-blue-400 bg-blue-50"
											: "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
									}`}
								>
									<button
										type="button"
										onClick={() =>
											onApplyCustomScenario(s.id, s.inputs, isActive)
										}
										className="w-full text-left cursor-pointer"
									>
										<h3 className="text-sm font-semibold text-gray-800 pr-6">
											{s.name}
										</h3>
										<p className="text-xl font-bold text-gray-900 mt-2">
											{formatEuroCompact(result.total)}
										</p>
										{isActive ? (
											<p className="text-sm font-medium mt-1 text-blue-600">
												&#10003; Aktiv
											</p>
										) : (
											<p
												className={`text-sm font-medium mt-1 ${
													delta < 0 ? "text-emerald-600" : "text-rose-600"
												}`}
											>
												{delta < 0 ? "" : "+"}
												{formatEuro(delta)} vs. Standard
											</p>
										)}
									</button>
									<button
										type="button"
										onClick={() => onDeleteScenario(s.id)}
										className="absolute top-3 right-3 text-gray-400 hover:text-red-500 cursor-pointer"
										title="Szenario loeschen"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4"
											viewBox="0 0 20 20"
											fill="currentColor"
											role="img"
											aria-label="Loeschen"
										>
											<title>Loeschen</title>
											<path
												fillRule="evenodd"
												d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
