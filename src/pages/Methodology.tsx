export function Methodology() {
  return (
    <div className="max-w-3xl mx-auto prose prose-sm prose-gray">
      <h1>Methodik</h1>

      <h2>Warum dieses Modell?</h2>
      <p>
        Das edi@energy-System ist eine <strong>verpflichtende Koordinationsinfrastruktur</strong>:
        ca. 2.500 Marktteilnehmer implementieren dieselbe Spezifikation, synchronisieren sich bei
        regulatorischen Updates und tauschen jährlich über 550 Mio. Nachrichten aus. Die damit
        verbundenen Kosten sind auf Einzelunternehmen verteilt und national weitgehend unsichtbar.
      </p>
      <p>
        Dieses Modell macht die aggregierten Kosten sichtbar und ermöglicht den Vergleich
        verschiedener Szenarien.
      </p>

      <h2>Kostengleichung</h2>
      <p>
        Die nationalen Gesamtkosten setzen sich aus vier Komponenten zusammen:
      </p>
      <pre className="bg-gray-50 p-4 rounded-lg text-sm">
{`C_national = (C_platform × θ_impl)
           + (C_operations × θ_ops)
           + (C_sync_tax × θ_update)
           + (C_friction × θ_friction)`}
      </pre>

      <h3>C_platform — Plattformkosten</h3>
      <p>
        <code>I × C_impl</code> — Die Kosten für die Wartung von ca. 75 unabhängigen
        Softwareimplementierungen derselben Spezifikation. Jede Implementierung benötigt ein
        Entwicklungsteam, Infrastruktur und laufende Anpassungen.
      </p>

      <h3>C_operations — Betriebskosten</h3>
      <p>
        <code>Σ(P_tier × C_ops_tier) + V × C_msg</code> — Die laufenden Betriebskosten aller
        Marktteilnehmer, gestaffelt nach Größe. <code>C_msg</code> erfasst nur die{" "}
        <strong>marginalen</strong> Kosten pro Nachricht (Routing, Speicherung, Bandbreite). Die
        festen Infrastrukturkosten sind bereits in den Betriebskosten enthalten.
      </p>

      <h3>C_sync_tax — Synchronisationssteuer</h3>
      <p>
        <code>U × (I × C_update_impl + Σ(P_tier × C_update_tier))</code> — Die Kosten regulatorischer
        Update-Zyklen (GPKE, WiM, MaBiS, GeLi). Alle Implementierungen und alle Teilnehmer müssen
        sich gleichzeitig aktualisieren. Die Kosten sind nach Teilnehmergröße gestaffelt.
      </p>

      <h3>C_friction — Reibungskosten</h3>
      <p>
        <code>V × ε × C_resolve</code> — Fehlerbehandlung, Clearingfälle und Streitigkeiten. Bei
        550 Mio. Nachrichten und 0,1% Fehlerrate entstehen ca. 550.000 Klärfälle pro Jahr.
      </p>

      <h2>Sektormultiplikatoren (θ)</h2>
      <p>
        Das edi@energy-System regelt sowohl Strom- als auch Gasmärkte. Statt parallele Modelle zu
        bauen, werden θ-Multiplikatoren auf das Basismodell (Strom) angewendet:
      </p>
      <ul>
        <li><strong>θ_impl = 1,1</strong> — Die meisten Plattformen decken beides ab; ca. 10% Gas-spezifisch</li>
        <li><strong>θ_ops = 1,25</strong> — Ca. 25% zusätzliche Gas-only-Akteure</li>
        <li><strong>θ_update = 1,3</strong> — Gasprozesse werden gebündelt, erhöhen aber die Komplexität</li>
        <li><strong>θ_friction = 1,4</strong> — Ca. 40% mehr Nachrichten → proportionale Reibung</li>
      </ul>

      <h2>Einschränkungen</h2>
      <ul>
        <li>Dies ist ein <strong>Schätzmodell</strong>, keine Prüfung</li>
        <li>Standardwerte sind fundierte Schätzungen, keine Messungen</li>
        <li>Nicht enthalten: Verbraucherabrechnung, externe Beratung, Opportunitätskosten</li>
        <li>Sektormultiplikatoren sind Näherungen</li>
        <li>Das Modell geht von der aktuellen Architektur aus (kein AS4-Übergang)</li>
      </ul>
    </div>
  );
}
