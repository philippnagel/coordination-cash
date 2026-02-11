import type { Scope } from "../model/types.ts";

interface ScopeSelectorProps {
	scope: Scope;
	onChangeScope: (scope: Scope) => void;
}

export function ScopeSelector({ scope, onChangeScope }: ScopeSelectorProps) {
	return (
		<div className="flex items-center justify-center gap-2">
			<span className="text-sm text-gray-500 mr-1">Scope:</span>
			<button
				type="button"
				onClick={() => onChangeScope("strom_gas")}
				className={`px-4 py-2 rounded-l-lg text-sm font-medium border transition-colors ${
					scope === "strom_gas"
						? "bg-blue-600 text-white border-blue-600"
						: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
				}`}
			>
				Strom + Gas
			</button>
			<button
				type="button"
				onClick={() => onChangeScope("strom")}
				className={`px-4 py-2 rounded-r-lg text-sm font-medium border border-l-0 transition-colors ${
					scope === "strom"
						? "bg-blue-600 text-white border-blue-600"
						: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
				}`}
			>
				Nur Strom
			</button>
		</div>
	);
}
