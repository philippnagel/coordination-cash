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
import { calculateModel } from "../model/calculate.ts";
import { runMonteCarloSimulation } from "../model/monte-carlo.ts";
import type { ModelInputs } from "../model/types.ts";
import { formatEuro, formatEuroCompact } from "../utils/format.ts";

interface Props {
	inputs: ModelInputs;
}

interface HistogramBin {
	rangeLabel: string;
	count: number;
	from: number;
	to: number;
}

const ITERATION_OPTIONS = [500, 1_000, 5_000, 10_000] as const;
const BIN_COUNT = 30;

function buildHistogram(samples: number[]): HistogramBin[] {
	if (samples.length === 0) return [];
	// biome-ignore lint/style/noNonNullAssertion: guarded by length check above
	const min = samples[0]!;
	// biome-ignore lint/style/noNonNullAssertion: guarded by length check above
	const max = samples[samples.length - 1]!;
	const binWidth = (max - min) / BIN_COUNT;
	if (binWidth === 0) {
		return [
			{
				rangeLabel: formatEuroCompact(min),
				count: samples.length,
				from: min,
				to: min,
			},
		];
	}

	const bins: HistogramBin[] = [];
	for (let i = 0; i < BIN_COUNT; i++) {
		const from = min + i * binWidth;
		const to = from + binWidth;
		bins.push({
			rangeLabel: formatEuroCompact(from + binWidth / 2),
			count: 0,
			from,
			to,
		});
	}

	for (const value of samples) {
		let idx = Math.floor((value - min) / binWidth);
		if (idx >= BIN_COUNT) idx = BIN_COUNT - 1;
		// biome-ignore lint/style/noNonNullAssertion: idx is clamped to valid range
		bins[idx]!.count++;
	}

	return bins;
}

function BinTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{ payload: HistogramBin }>;
}) {
	if (!active || !payload?.[0]) return null;
	const bin = payload[0].payload;
	return (
		<div className="bg-white rounded-lg border border-gray-200 shadow-md px-3 py-2 text-sm">
			<p className="text-gray-600">
				{formatEuroCompact(bin.from)} – {formatEuroCompact(bin.to)}
			</p>
			<p className="font-semibold text-gray-900">{bin.count} Simulationen</p>
		</div>
	);
}

export function MonteCarloSimulation({ inputs }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [iterations, setIterations] = useState<number>(1_000);

	const baseline = useMemo(() => calculateModel(inputs).total, [inputs]);

	const results = useMemo(
		() => (isOpen ? runMonteCarloSimulation(inputs, iterations) : null),
		[inputs, iterations, isOpen],
	);

	const histogram = useMemo(
		() => (results ? buildHistogram(results.samples) : []),
		[results],
	);

	const p5 = results?.percentiles.P5 ?? 0;
	const p95 = results?.percentiles.P95 ?? 0;

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<button
				type="button"
				className="w-full flex items-center justify-between text-left"
				onClick={() => setIsOpen(!isOpen)}
			>
				<div>
					<h2 className="text-lg font-semibold text-gray-900">
						Monte-Carlo-Simulation
					</h2>
					<p className="text-sm text-gray-500 mt-1">
						Wie variieren die Gesamtkosten bei gleichzeitiger Unsicherheit aller
						Parameter?
					</p>
				</div>
				<span className="text-gray-400 text-xl">{isOpen ? "▾" : "▸"}</span>
			</button>

			{isOpen && results && (
				<div className="mt-6">
					{/* Controls */}
					<div className="flex items-center gap-3 mb-4">
						<span className="text-sm text-gray-600">Simulationen:</span>
						<div className="flex gap-1">
							{ITERATION_OPTIONS.map((n) => (
								<button
									key={n}
									type="button"
									onClick={() => setIterations(n)}
									className={`px-3 py-1 rounded text-sm transition-colors ${
										iterations === n
											? "bg-blue-600 text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{n.toLocaleString("de-DE")}
								</button>
							))}
						</div>
					</div>

					{/* Histogram */}
					<ResponsiveContainer width="100%" height={320}>
						<BarChart
							data={histogram}
							margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="rangeLabel"
								fontSize={11}
								interval={Math.floor(BIN_COUNT / 6)}
								angle={-30}
								textAnchor="end"
								height={60}
							/>
							<YAxis fontSize={12} />
							<Tooltip content={<BinTooltip />} />
							<ReferenceLine
								x={findClosestBinLabel(histogram, baseline)}
								stroke="#ef4444"
								strokeWidth={2}
								strokeDasharray="4 4"
								label={{
									value: "Ausgangswert",
									position: "top",
									fill: "#ef4444",
									fontSize: 12,
								}}
							/>
							<Bar dataKey="count" radius={[2, 2, 0, 0]}>
								{histogram.map((bin) => {
									const mid = (bin.from + bin.to) / 2;
									const inRange = mid >= p5 && mid <= p95;
									return (
										<Cell
											key={bin.rangeLabel}
											fill={inRange ? "#3b82f6" : "#bfdbfe"}
										/>
									);
								})}
							</Bar>
						</BarChart>
					</ResponsiveContainer>

					{/* Legend */}
					<div className="flex gap-6 mt-2 text-xs text-gray-500 justify-center">
						<span className="flex items-center gap-1.5">
							<span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
							P5–P95 Bereich
						</span>
						<span className="flex items-center gap-1.5">
							<span className="w-3 h-3 rounded-sm bg-blue-200 inline-block" />
							Außerhalb P5–P95
						</span>
						<span className="flex items-center gap-1.5">
							<span className="w-3 h-0.5 bg-red-500 inline-block" />
							Ausgangswert
						</span>
					</div>

					{/* Stats table */}
					<div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
						<StatCard label="P5" value={formatEuro(results.percentiles.P5)} />
						<StatCard label="P25" value={formatEuro(results.percentiles.P25)} />
						<StatCard
							label="Median (P50)"
							value={formatEuro(results.percentiles.P50)}
						/>
						<StatCard label="P75" value={formatEuro(results.percentiles.P75)} />
						<StatCard label="P95" value={formatEuro(results.percentiles.P95)} />
						<StatCard label="Mittelwert" value={formatEuro(results.mean)} />
						<StatCard
							label="Standardabweichung"
							value={formatEuro(results.stdDev)}
						/>
						<StatCard
							label="Ausgangswert"
							value={formatEuro(baseline)}
							highlight
						/>
					</div>

					{/* Component breakdown */}
					<div className="mt-6">
						<h3 className="text-sm font-medium text-gray-700 mb-2">
							Mittlere Kostenverteilung nach Komponente
						</h3>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							<StatCard
								label="Plattform"
								value={formatEuro(results.componentBreakdown.platform)}
							/>
							<StatCard
								label="Betrieb"
								value={formatEuro(results.componentBreakdown.operations)}
							/>
							<StatCard
								label="Sync-Steuer"
								value={formatEuro(results.componentBreakdown.syncTax)}
							/>
							<StatCard
								label="Reibung"
								value={formatEuro(results.componentBreakdown.friction)}
							/>
						</div>
					</div>
					{/* Methodology note */}
					<p className="mt-6 text-xs text-gray-400 leading-relaxed">
						Methodik: Dreiecksverteilung pro Parameter (Modus = aktueller Wert).
						Verwandte Parameter (z.B. Betriebskosten, Update-Kosten) werden über
						eine Gauß-Copula gruppenweise korreliert (ρ = 0,5–0,7), um
						realistische gemeinsame Schwankungen abzubilden.
					</p>
				</div>
			)}
		</div>
	);
}

function StatCard({
	label,
	value,
	highlight,
}: {
	label: string;
	value: string;
	highlight?: boolean;
}) {
	return (
		<div
			className={`rounded-lg border px-3 py-2 ${highlight ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}
		>
			<p className="text-xs text-gray-500">{label}</p>
			<p
				className={`text-sm font-semibold ${highlight ? "text-red-700" : "text-gray-900"}`}
			>
				{value}
			</p>
		</div>
	);
}

function findClosestBinLabel(bins: HistogramBin[], value: number): string {
	let closest = bins[0];
	let minDist = Number.POSITIVE_INFINITY;
	for (const bin of bins) {
		const mid = (bin.from + bin.to) / 2;
		const dist = Math.abs(mid - value);
		if (dist < minDist) {
			minDist = dist;
			closest = bin;
		}
	}
	return closest?.rangeLabel ?? "";
}
