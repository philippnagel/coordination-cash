import { useCallback, useMemo, useState } from "react";
import { CostDisplay } from "./components/CostDisplay.tsx";
import { DerivedMetrics } from "./components/DerivedMetrics.tsx";
import { Layout } from "./components/Layout.tsx";
import { ParameterSliders } from "./components/ParameterSliders.tsx";
import { ScenarioComparison } from "./components/ScenarioComparison.tsx";
import { ScopeSelector } from "./components/ScopeSelector.tsx";
import { SensitivityAnalysis } from "./components/SensitivityAnalysis.tsx";
import { calculateModel } from "./model/calculate.ts";
import {
	DEFAULT_INPUTS,
	type Scenario,
	STROM_ONLY_MULTIPLIERS,
	STROM_PLUS_GAS_MULTIPLIERS,
} from "./model/defaults.ts";

import type { ModelInputs, Scope } from "./model/types.ts";
import { getInitialInputs, pushConfigToUrl } from "./model/url-state.ts";
import { About } from "./pages/About.tsx";
import { DataSources } from "./pages/DataSources.tsx";
import { Methodology } from "./pages/Methodology.tsx";

type Page = "calculator" | "methodology" | "data" | "about";

export function App() {
	const [inputs, setInputs] = useState<ModelInputs>(getInitialInputs);
	const [page, setPage] = useState<Page>("calculator");

	const outputs = useMemo(() => calculateModel(inputs), [inputs]);

	const updateInputs = useCallback(
		(updater: (prev: ModelInputs) => ModelInputs) => {
			setInputs((prev) => {
				const next = updater(prev);
				pushConfigToUrl(next);
				return next;
			});
		},
		[],
	);

	const setScope = useCallback(
		(scope: Scope) => {
			updateInputs((prev) => ({
				...prev,
				scope,
				sectorMultipliers:
					scope === "strom"
						? { ...STROM_ONLY_MULTIPLIERS }
						: { ...STROM_PLUS_GAS_MULTIPLIERS },
			}));
		},
		[updateInputs],
	);

	const resetAll = useCallback(() => {
		const fresh = structuredClone(DEFAULT_INPUTS);
		setInputs(fresh);
		pushConfigToUrl(fresh);
	}, []);

	const setNestedValue = useCallback(
		(path: string, value: number) => {
			updateInputs((prev) => {
				const next = structuredClone(prev);
				const parts = path.split(".");
				let obj: Record<string, unknown> = next as unknown as Record<
					string,
					unknown
				>;
				for (let i = 0; i < parts.length - 1; i++) {
					// biome-ignore lint/style/noNonNullAssertion: index always in bounds
					obj = obj[parts[i]!] as Record<string, unknown>;
				}
				// biome-ignore lint/style/noNonNullAssertion: parts always has at least one element
				obj[parts[parts.length - 1]!] = value;
				return next;
			});
		},
		[updateInputs],
	);

	const applyScenario = useCallback(
		(overrides: Scenario["overrides"], isActive: boolean) => {
			updateInputs(() => {
				// Always start from defaults
				const next = structuredClone(DEFAULT_INPUTS);
				// Apply scenario overrides (unless toggling off to return to defaults)
				if (!isActive) {
					Object.assign(next, overrides);
				}
				return next;
			});
		},
		[updateInputs],
	);

	return (
		<Layout currentPage={page} onNavigate={setPage}>
			{page === "calculator" && (
				<div className="max-w-5xl mx-auto space-y-8">
					<ScopeSelector scope={inputs.scope} onChangeScope={setScope} />
					<CostDisplay outputs={outputs} />
					<DerivedMetrics derived={outputs.derived} scope={inputs.scope} />
					<ParameterSliders
						inputs={inputs}
						onChangeValue={setNestedValue}
						onReset={resetAll}
					/>
					<ScenarioComparison
						outputs={outputs}
						onApplyScenario={applyScenario}
					/>
					<SensitivityAnalysis inputs={inputs} />
				</div>
			)}
			{page === "methodology" && <Methodology />}
			{page === "data" && <DataSources />}
			{page === "about" && <About />}
		</Layout>
	);
}
