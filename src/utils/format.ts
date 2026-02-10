const deFormatter = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
});

const deFormatterDecimal = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEuro(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${deFormatterDecimal.format(value / 1_000_000_000)} Mrd. €`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${deFormatterDecimal.format(value / 1_000_000)} Mio. €`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${deFormatter.format(value)} €`;
  }
  return `${deFormatterDecimal.format(value)} €`;
}

export function formatEuroCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${Math.round(value / 1_000_000)} Mio. €`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${Math.round(value / 1_000)}k €`;
  }
  return `${deFormatterDecimal.format(value)} €`;
}

export function formatNumber(value: number): string {
  return deFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatParamValue(key: string, value: number): string {
  if (key === "errorRate") return `${(value * 100).toFixed(2)}%`;
  if (key === "concentration") return `${(value * 100).toFixed(0)}%`;
  if (key === "updatesPerYear") return value.toFixed(1);
  if (key.startsWith("sectorMultipliers.")) return value.toFixed(2);
  if (key === "costs.perMessage") return `${deFormatterDecimal.format(value)} €`;
  if (key.startsWith("costs.")) return formatEuroCompact(value);
  if (key === "messageVolume") return `${formatNumber(value / 1_000_000)} Mio.`;
  return formatNumber(value);
}
