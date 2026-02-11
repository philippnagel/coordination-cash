import type { ModelOutputs } from "../model/types.ts";
import { formatEuro, formatPercent } from "../utils/format.ts";

interface CostDisplayProps {
	outputs: ModelOutputs;
}

const COMPONENT_META = [
	{ key: "platform" as const, label: "Plattform", color: "bg-blue-500" },
	{ key: "operations" as const, label: "Betrieb", color: "bg-emerald-500" },
	{ key: "syncTax" as const, label: "Sync-Steuer", color: "bg-amber-500" },
	{ key: "friction" as const, label: "Reibung", color: "bg-rose-500" },
];

export function CostDisplay({ outputs }: CostDisplayProps) {
	const { total, components } = outputs;

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<div className="text-center mb-6">
				<p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
					Nationale Gesamtkosten pro Jahr
				</p>
				<p className="text-4xl sm:text-5xl font-bold text-gray-900">
					{formatEuro(total)}
				</p>
			</div>

			{/* Stacked bar */}
			<div className="h-8 rounded-full overflow-hidden flex mb-4">
				{COMPONENT_META.map(({ key, color }) => {
					const pct = (components[key] / total) * 100;
					return (
						<div
							key={key}
							className={`${color} transition-all duration-300`}
							style={{ width: `${pct}%` }}
						/>
					);
				})}
			</div>

			{/* Legend */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{COMPONENT_META.map(({ key, label, color }) => {
					const value = components[key];
					const pct = value / total;
					return (
						<div key={key} className="flex items-start gap-2">
							<div
								className={`w-3 h-3 rounded-full ${color} mt-0.5 shrink-0`}
							/>
							<div>
								<p className="text-sm font-medium text-gray-900">
									{formatEuro(value)}
								</p>
								<p className="text-xs text-gray-500">
									{label} ({formatPercent(pct)})
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
