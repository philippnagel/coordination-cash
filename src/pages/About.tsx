export function About() {
	return (
		<div className="max-w-3xl mx-auto prose prose-sm prose-gray">
			<h1>Über coordination.cash</h1>

			<h2>Motivation</h2>
			<p>
				Deutschlands edi@energy-System ist ein einzigartiges Beispiel für eine{" "}
				<strong>verpflichtende Koordinationsinfrastruktur</strong>. Etwa 2.500
				Marktteilnehmer in der Strom- und Gaswirtschaft müssen dieselbe
				Spezifikation implementieren, sich bei regulatorischen Updates
				synchronisieren und hunderte Millionen Transaktionen austauschen.
			</p>
			<p>
				Die Kosten dieses Systems sind real, aber verteilt und unsichtbar.
				Dieses Tool macht sie sichtbar und ermöglicht einen informierten Diskurs
				über Alternativen.
			</p>

			<h2>Was dieses Modell ist</h2>
			<ul>
				<li>
					Ein <strong>Schätzmodell</strong> mit transparenten Annahmen
				</li>
				<li>Ein Werkzeug zum Vergleich von Szenarien und Politikoptionen</li>
				<li>Eine Grundlage für faktenbasierte Diskussion</li>
			</ul>

			<h2>Was dieses Modell nicht ist</h2>
			<ul>
				<li>Keine Wirtschaftsprüfung oder exakte Messung</li>
				<li>Kein Ersatz für detaillierte Einzelfallanalysen</li>
				<li>Keine Handlungsempfehlung</li>
			</ul>

			<h2>Changelog</h2>
			<h3>v0.2 — 10. Februar 2026</h3>
			<ul>
				<li>Explizites Scope-Feld statt heuristischer Gas-Erkennung</li>
				<li>Gestaffelte Sync-Tax Update-Kosten nach Teilnehmergröße</li>
				<li>Marktkonzentrationsvariable (κ) mit Long-Tail-Metrik</li>
				<li>C_msg auf 0,01 € reduziert (nur Marginalkosten)</li>
				<li>URL-State als Base64-JSON für kompakte, teilbare Links</li>
				<li>Datenvalidierungsstrategie hinzugefügt</li>
			</ul>

			<h3>v0.1 — 24. Januar 2026</h3>
			<ul>
				<li>Initialer Entwurf</li>
			</ul>

			<h2>Kontakt</h2>
			<p>
				Dieses Projekt ist Open Source. Feedback, Korrekturen und Datenpunkte
				sind willkommen.
			</p>
		</div>
	);
}
