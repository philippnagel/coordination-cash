export function DataSources() {
	return (
		<div className="max-w-3xl mx-auto prose prose-sm prose-gray">
			<h1>Datenquellen</h1>

			<p>
				Die Standardwerte des Modells basieren auf öffentlich verfügbaren Daten
				und Branchenschätzungen. Alle Parameter sind transparent und können
				angepasst werden.
			</p>

			<h2>Primärquellen</h2>
			<ul>
				<li>
					<strong>Bundesnetzagentur (BNetzA)</strong> — Marktteilnehmerzahlen,
					Monitoring-Berichte
					<br />
					<a
						href="https://www.bundesnetzagentur.de/"
						target="_blank"
						rel="noopener"
					>
						bundesnetzagentur.de
					</a>
				</li>
				<li>
					<strong>Marktstammdatenregister (MaStR)</strong> — Registrierte
					Marktakteure
					<br />
					<a
						href="https://www.marktstammdatenregister.de/"
						target="_blank"
						rel="noopener"
					>
						marktstammdatenregister.de
					</a>
				</li>
				<li>
					<strong>BDEW / edi@energy</strong> — Spezifikationen, Release-Zyklen,
					Nachrichtenformate
					<br />
					<a href="https://www.edi-energy.de/" target="_blank" rel="noopener">
						edi-energy.de
					</a>
				</li>
				<li>
					<strong>BDEW Marktprozesse</strong> — GPKE, WiM, MaBiS, GeLi Gas
					<br />
					<a href="https://www.bdew.de/" target="_blank" rel="noopener">
						bdew.de
					</a>
				</li>
			</ul>

			<h2>Schätzungsansätze</h2>
			<table>
				<thead>
					<tr>
						<th>Variable</th>
						<th>Ansatz</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Implementierungen (I=75)</td>
						<td>Vendor-Zählung + In-house-Schätzung</td>
					</tr>
					<tr>
						<td>Teilnehmer (P=2.200/2.500)</td>
						<td>BNetzA + MaStR Registrierungen</td>
					</tr>
					<tr>
						<td>Transaktionsvolumen (V=400/550M)</td>
						<td>edi@energy Statistiken, BNetzA Monitoring</td>
					</tr>
					<tr>
						<td>Stückkosten</td>
						<td>Branchenschätzungen, Konferenzgespräche</td>
					</tr>
					<tr>
						<td>Konzentration (κ=0,6)</td>
						<td>Öffentliche Vendor-Listen, Konferenzteilnehmer</td>
					</tr>
				</tbody>
			</table>

			<h2>Validierungsstrategie</h2>
			<ol>
				<li>
					3-5 anonyme Stadtwerke-Datenpunkte zur Validierung der Stückkosten
				</li>
				<li>Vendor-Abgleich zur Bestätigung der Implementierungszahl</li>
				<li>Transaktionsvolumen-Triangulation mit BNetzA-Berichten</li>
				<li>Transparenz als Glaubwürdigkeitsmechanismus</li>
			</ol>
		</div>
	);
}
