# coordination.cash

Ein interaktives Web-Tool zur Schätzung der **nationalen Gesamtkosten** des edi@energy-Marktkommunikationssystems für den deutschen Energiesektor — Strom und Gas.

## Das Problem

Das edi@energy-System ist ein **verpflichtendes Koordinationsspiel**:
- ~2.500 Marktteilnehmer müssen dieselbe Spezifikation implementieren
- ~75 unabhängige Implementierungen der gleichen Logik
- Updates müssen zeitgleich über den gesamten Markt erfolgen
- Fehler erzeugen bilaterale Reibungsverluste bei ~550 Mio. Nachrichten/Jahr

**Geschätzte Gesamtkosten: ~346 Mio. €/Jahr** (Strom + Gas)

## Kostenmodell

| Komponente | Beschreibung | Anteil |
|------------|--------------|--------|
| **Plattform** | Wartung der ~75 Implementierungen | ~8% |
| **Betrieb** | Laufende Kosten aller Teilnehmer | ~46% |
| **Sync Tax** | Kosten für regulatorische Updates | ~22% |
| **Reibung** | Clearingfälle, Fehlerbehandlung | ~24% |

Details: siehe [SPEC.md](SPEC.md)

## Entwicklung

```bash
# Abhängigkeiten installieren
bun install

# Entwicklungsserver starten (Port 3000)
bun run dev

# Produktions-Build
bun run build
```

Voraussetzung: [Bun](https://bun.sh) v1.0+

## Tech Stack

- **Runtime**: Bun
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts

## Zielgruppe

- Regulierer und politische Entscheidungsträger
- Branchenverbände (BDEW, BNE)
- Energieversorger und Stadtwerke
- Forscher und Journalisten

## Lizenz

MIT
