# Beitragen zu coordination.cash

Vielen Dank für dein Interesse! Dieses Dokument erklärt, wie du zum Projekt beitragen kannst.

## Entwicklungsumgebung

```bash
bun install
bun run dev
```

Siehe [README.md](README.md) für Details.

## Arten von Beiträgen

### 1. Fehler melden

Öffne ein [Issue](../../issues) mit:
- Beschreibung des Problems
- Schritte zur Reproduktion
- Erwartetes vs. tatsächliches Verhalten

### 2. UI/UX-Verbesserungen

Pull Requests für UI-Änderungen sind willkommen. Bitte:
- Beschreibe die Änderung im PR
- Füge Screenshots bei, falls relevant
- Teste auf Desktop und Mobile

### 3. Modelländerungen

Änderungen am Kostenmodell (`src/model/`) erfordern besondere Sorgfalt:

- **Neue Parameter**: Begründung mit Quellenangabe
- **Geänderte Defaults**: Verweis auf Datenquelle oder Experteneinschätzung
- **Formeländerungen**: Dokumentation in SPEC.md aktualisieren

Bitte eröffne zuerst ein Issue zur Diskussion, bevor du einen PR für Modelländerungen erstellst.

### 4. Kostendaten beisteuern

Wenn du Einblick in reale MaKo-Kosten hast (z.B. als Stadtwerk oder Dienstleister), kannst du anonymisierte Datenpunkte zur Kalibrierung des Modells beisteuern. Kontaktiere uns über ein Issue mit dem Label `data-calibration`.

## Code-Konventionen

- **Sprache im Code**: Englisch (Variablen, Kommentare, Commits)
- **UI-Texte**: Deutsch (solange wir nur DE betrachten)
- **Formatierung**: Nutze die bestehende [Biome][https://biomejs.dev/] Konfiguration
- **TypeScript**: Strict mode, keine `any`-Types

## Pull Requests

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/meine-aenderung`)
3. Committe deine Änderungen
4. Pushe den Branch und öffne einen PR

## Fragen?

Öffne ein Issue mit dem Label `question`.
