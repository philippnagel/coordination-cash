import type { ParameterRange } from "../model/types.ts";
import { formatParamValue } from "../utils/format.ts";

interface SliderControlProps {
	paramKey: string;
	label: string;
	value: number;
	range: ParameterRange;
	disabled?: boolean;
	onChange: (value: number) => void;
}

export function SliderControl({
	paramKey,
	label,
	value,
	range,
	disabled,
	onChange,
}: SliderControlProps) {
	const { min, max, step } = range;

	// For log-scale sliders, map to/from a linear 0-1000 range
	const useLog = !!range.log;
	const sliderMin = 0;
	const sliderMax = 1000;

	const toSlider = (v: number): number => {
		if (!useLog) return v;
		const logMin = Math.log(min);
		const logMax = Math.log(max);
		return ((Math.log(v) - logMin) / (logMax - logMin)) * sliderMax;
	};

	const fromSlider = (s: number): number => {
		if (!useLog) return s;
		const logMin = Math.log(min);
		const logMax = Math.log(max);
		const raw = Math.exp(logMin + (s / sliderMax) * (logMax - logMin));
		return Math.round(raw / step) * step;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = parseFloat(e.target.value);
		onChange(useLog ? fromSlider(raw) : raw);
	};

	const inputId = `slider-${paramKey}`;

	return (
		<div
			className={`flex items-center gap-3 py-1.5 ${disabled ? "opacity-40" : ""}`}
		>
			<label
				htmlFor={inputId}
				className="text-sm text-gray-600 w-52 shrink-0 truncate"
				title={label}
			>
				{label}
			</label>
			<input
				id={inputId}
				type="range"
				min={useLog ? sliderMin : min}
				max={useLog ? sliderMax : max}
				step={useLog ? 1 : step}
				value={toSlider(value)}
				disabled={disabled}
				onChange={handleChange}
				className="flex-1 h-1.5 accent-blue-600"
			/>
			<span className="text-sm font-mono text-gray-800 w-28 text-right shrink-0">
				{formatParamValue(paramKey, value)}
			</span>
		</div>
	);
}
