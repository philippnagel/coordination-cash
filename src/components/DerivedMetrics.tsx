import type { DerivedMetrics as DerivedMetricsType, Scope } from "../model/types.ts";
import { formatEuro, formatNumber } from "../utils/format.ts";

interface DerivedMetricsProps {
  derived: DerivedMetricsType;
  scope: Scope;
}

export function DerivedMetrics({ derived, scope }: DerivedMetricsProps) {
  const cards = [
    {
      label: "pro Zählpunkt / Jahr",
      value: formatEuro(derived.perZaehlpunkt),
      sub: scope === "strom_gas" ? "72 Mio. ZP" : "52 Mio. ZP",
    },
    {
      label: "pro Haushalt / Jahr",
      value: formatEuro(derived.perHousehold),
      sub: "42 Mio. Haushalte",
    },
    {
      label: "pro Nachricht",
      value: formatEuro(derived.perMessage),
    },
    {
      label: "pro Marktteilnehmer / Jahr",
      value: formatEuro(derived.perParticipant),
    },
    {
      label: "Implizite FTEs national",
      value: formatNumber(Math.round(derived.impliedFTEs)),
      sub: "bei 100k €/FTE",
    },
    {
      label: "Long-Tail Kosten",
      value: formatEuro(derived.longTailCostShare),
      sub: "Nicht-Top-5 Implementierungen",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <p className="text-lg font-semibold text-gray-900">{card.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          {card.sub && (
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
