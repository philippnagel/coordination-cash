import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { calculateSensitivity } from "../model/sensitivity.ts";
import type { ModelInputs } from "../model/types.ts";
import { formatEuro, formatEuroCompact } from "../utils/format.ts";

interface Props {
	inputs: ModelInputs;
}

interface ChartEntry {
	label: string;
	deltaLow: number;
	deltaHigh: number;
	negativeBar: number;
	positiveBar: number;
}

function CustomTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{ payload: ChartEntry }>;
}) {
	if (!active || !payload?.[0]) return null;
	const entry = payload[0].payload;
	return (
		<div className="bg-white rounded-lg border border-gray-200 shadow-md px-3 py-2 text-sm">
			<p className="font-semibold text-gray-900 mb-1">{entry.label}</p>
			<p className="text-gray-600">
				Am Minimum:{" "}
				<span className="font-medium">{formatEuro(entry.deltaLow)}</span>
			</p>
			<p className="text-gray-600">
				Am Maximum:{" "}
				<span className="font-medium">{formatEuro(entry.deltaHigh)}</span>
			</p>
		</div>
	);
}

export function SensitivityAnalysis({ inputs }: Props) {
	const [isOpen, setIsOpen] = useState(true);

	const data = useMemo(() => {
		const results = calculateSensitivity(inputs);
		return results.map((r) => ({
			label: r.label,
			deltaLow: r.deltaLow,
			deltaHigh: r.deltaHigh,
			// Clamp to split into left/right bars for Recharts stacking
			negativeBar: Math.min(r.deltaLow, r.deltaHigh, 0),
			positiveBar: Math.max(r.deltaLow, r.deltaHigh, 0),
		}));
	}, [inputs]);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<button
				type="button"
				className="w-full flex items-center justify-between text-left"
				onClick={() => setIsOpen(!isOpen)}
			>
				<div>
					<h2 className="text-lg font-semibold text-gray-900">
						Sensitivitätsanalyse
					</h2>
					<p className="text-sm text-gray-500 mt-1">
						Welche Parameter beeinflussen die Gesamtkosten am stärksten?
					</p>
				</div>
				<span className="text-gray-400 text-xl">{isOpen ? "▾" : "▸"}</span>
			</button>

			{isOpen && (
				<div className="mt-6">
					{data.length === 0 ? (
						<p className="text-gray-500 text-sm">
							Keine sensitiven Parameter gefunden.
						</p>
					) : (
						<ResponsiveContainer width="100%" height={data.length * 44 + 40}>
							<BarChart
								data={data}
								layout="vertical"
								margin={{ top: 5, right: 30, left: 160, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" horizontal={false} />
								<XAxis
									type="number"
									tickFormatter={(v: number) => formatEuroCompact(v)}
									fontSize={12}
								/>
								<YAxis
									type="category"
									dataKey="label"
									width={150}
									fontSize={12}
									tickLine={false}
								/>
								<Tooltip content={<CustomTooltip />} />
								<ReferenceLine x={0} stroke="#6b7280" />
								<Bar dataKey="negativeBar" stackId="a">
									{data.map((entry) => (
										<Cell
											key={`neg-${entry.label}`}
											fill={entry.negativeBar < 0 ? "#10b981" : "transparent"}
										/>
									))}
								</Bar>
								<Bar dataKey="positiveBar" stackId="a">
									{data.map((entry) => (
										<Cell
											key={`pos-${entry.label}`}
											fill={entry.positiveBar > 0 ? "#3b82f6" : "transparent"}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					)}
					<div className="flex gap-6 mt-4 text-xs text-gray-500 justify-center">
						<span className="flex items-center gap-1.5">
							<span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
							Kostenreduktion vs. Ausgangswert
						</span>
						<span className="flex items-center gap-1.5">
							<span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
							Kostensteigerung vs. Ausgangswert
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
