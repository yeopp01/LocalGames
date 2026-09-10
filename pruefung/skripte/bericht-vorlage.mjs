/* Die HTML-Vorlage des Berichts.

   Nur Darstellung: gezählt und geprüft wird woanders. Aussehen in
   bericht-stil.mjs, das bisschen Verhalten in bericht-client.mjs. */

import { STATUS_ANZEIGE, REIHENFOLGE, zaehlen } from './spec-leser.mjs';
import { KLASSEN, TAKTE } from './fortschritt.mjs';
import { stil } from './bericht-stil.mjs';
import { skript } from './bericht-client.mjs';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const markdown = (s) =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

const zahl = (n) => new Intl.NumberFormat('de-DE').format(n);
const FARBE = { fertig: 'gruen', 'in-arbeit': 'orange', geplant: 'blau', offen: 'grau', zurueckgestellt: 'violett' };
const STAPEL = ['fertig', 'in-arbeit', 'geplant', 'offen', 'zurueckgestellt'];

const zeitText = (iso) =>
  new Date(iso).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });
const dauerText = (ms) => (ms < 60_000 ? `${Math.round(ms / 1000)} s` : `${Math.floor(ms / 60_000)} min ${Math.round((ms % 60_000) / 1000)} s`);

const kennzahl = (name, wert, hinweis, klasse = '') => `
          <div class="kennzahl ${klasse}">
            <span class="meta">${esc(name)}</span>
            <strong>${wert}</strong>
            <span class="meta">${hinweis}</span>
          </div>`;

/* -------------------------------------------------------------- Specs */

function acZeile(k) {
  const suche = [k.id, k.titel, k.text, k.gruppe, k.status].join(' ').toLowerCase();
  return `
            <tr class="zeile" data-status="${esc(k.status ?? 'offen')}" data-suche="${esc(suche)}">
              <td class="ac">
                <span class="id">${esc(k.id)}</span>
                <span class="marke f-${esc(FARBE[k.status] ?? 'grau')}">${esc(STATUS_ANZEIGE[k.status] ?? k.status ?? 'ohne Status')}</span>
              </td>
              <td>
                ${k.gruppe ? `<p class="gruppe">${esc(k.gruppe)}</p>` : ''}
                ${k.titel ? `<p class="titel">${markdown(k.titel)}</p>` : ''}
                <p class="text">${markdown(k.text)}</p>
                ${k.grund ? `<p class="grund"><b>Zurückgestellt:</b> ${esc(k.grund)}</p>` : ''}
              </td>
            </tr>`;
}

const vollstaendig = (spec) => spec.kriterien.length > 0 && spec.kriterien.every((k) => k.status === 'fertig');
const haken = '<span class="haken f-gruen" title="alle Kriterien fertig">✓<span class="nurlesbar"> vollständig</span></span>';

function balken(kriterien) {
  const z = zaehlen(kriterien);
  const teile = STAPEL.filter((s) => z[s]);
  if (!teile.length) return '';
  return `<span class="balken" aria-hidden="true">${teile
    .map((s) => `<i class="f-${FARBE[s]}" style="flex:${z[s]}" title="${z[s]} ${esc(STATUS_ANZEIGE[s])}"></i>`)
    .join('')}</span>`;
}

function specBlock(spec) {
  const z = zaehlen(spec.kriterien);
  const rest = REIHENFOLGE.filter((s) => s !== 'fertig' && z[s]).map((s) => `${z[s]} ${STATUS_ANZEIGE[s].toLowerCase()}`);
  const code = spec.code.length
    ? ' · ' + spec.code.map((c) => `<a href="../../${esc(c)}"><code>${esc(c)}</code></a>`).join(', ')
    : '';
  return `
        <section class="spec${vollstaendig(spec) ? ' voll' : ''}" id="${esc(spec.pfad)}">
          <h3>${vollstaendig(spec) ? haken : ''}<a href="../../specs/${esc(spec.pfad)}">${esc(spec.titel)}</a></h3>
          <span class="meta">${z.fertig}/${spec.kriterien.length} fertig${rest.length ? ' · ' + rest.join(' · ') : ''}${code}</span>
          ${spec.kriterien.length ? `<table class="kriterien">${spec.kriterien.map(acZeile).join('')}</table>` : '<p class="grund">Diese Spec nennt keine Akzeptanzkriterien.</p>'}
        </section>`;
}

/* ---------------------------------------------------------- Prüfstand */

const STATUS_LAUF = {
  passed: ['✓', 'gruen', 'grün'],
  failed: ['✗', 'rot', 'rot'],
  timedOut: ['⏱', 'rot', 'Zeit überschritten'],
  interrupted: ['■', 'orange', 'abgebrochen'],
  skipped: ['–', 'grau', 'übersprungen'],
};

function pruefstandBlock(lauf, bestand) {
  const teile = [];
  const w = lauf?.waechter;
  const e = lauf?.e2e;

  const kennzahlen = [];
  if (w) {
    const rot = w.pruefungen.filter((p) => p.beanstandungen.length).length;
    kennzahlen.push(kennzahl('Wächter', `${w.pruefungen.length - rot}/${w.pruefungen.length}`, `grün · ${esc(zeitText(w.zeit))}`, rot ? 'rot' : 'gruen'));
  }
  if (e) {
    kennzahlen.push(kennzahl('E2E-Läufe', `${e.bestanden}/${e.bestanden + e.rot + e.wackelig + e.uebersprungen}`, `grün · ${esc(e.geraete.join(', '))} · ${esc(dauerText(e.dauer))}`, e.rot ? 'rot' : 'gruen'));
    kennzahlen.push(kennzahl('Gelaufen', esc(zeitText(e.zeit)), e.juenger.length ? `<span class="f-orange">danach geändert: ${e.juenger.length} Datei(en)</span>` : 'seitdem nichts geändert'));
  }
  if (bestand) {
    kennzahlen.push(kennzahl('Bestand', zahl(bestand.laeufe), `Läufe aus ${bestand.faelle} Fällen × ${bestand.geraete.length} Geräte · ${bestand.waechter.length} Wächter`));
  }

  if (!w && !e) {
    teile.push('<p class="grund">Noch kein Lauf. <code>node pruefung/pruefen.mjs</code> startet Wächter, E2E-Tests und schreibt diesen Bericht neu.</p>');
  }

  // Ein Teillauf (-g, einzelne Datei) ist kein Beleg für den Rest – erkennbar
  // daran, dass weniger lief, als der Bestand hergibt.
  const gelaufen = e ? e.bestanden + e.rot + e.wackelig + e.uebersprungen : 0;
  if (e && bestand && gelaufen < bestand.laeufe) {
    teile.push(`<p class="grund warnung"><b>Teillauf:</b> ${gelaufen} von ${bestand.laeufe} Läufen. Für die übrigen sagt dieser Lauf nichts.</p>`);
  }

  if (e?.juenger.length) {
    teile.push(`<p class="grund warnung"><b>Der E2E-Lauf ist älter als diese Dateien:</b> ${e.juenger.map((d) => `<code>${esc(d)}</code>`).join(', ')}. Was er sagt, gilt für den Stand davor.</p>`);
  }

  if (w) {
    teile.push(`
          <h4>Wächter</h4>
          <table class="zahlen breit">
            <tbody>${w.pruefungen
              .map(
                (p) => `
              <tr>
                <td class="symbol f-${p.beanstandungen.length ? 'rot' : 'gruen'}">${p.beanstandungen.length ? '✗' : '✓'}</td>
                <th scope="row"><code>${esc(p.id)}</code><span class="meta"> ${esc(p.was)}</span>
                  ${p.beanstandungen.map((b) => `<span class="beanstandung">${esc(b)}</span>`).join('')}</th>
              </tr>`,
              )
              .join('')}</tbody>
          </table>`);
  }

  if (e) {
    const nachDatei = new Map();
    for (const t of e.tests) {
      if (!nachDatei.has(t.datei)) nachDatei.set(t.datei, []);
      nachDatei.get(t.datei).push(t);
    }
    const zeilen = [...nachDatei.entries()]
      .map(([datei, tests]) => {
        const info = bestand?.e2e.find((d) => d.datei === datei.split(/[\\/]/).pop());
        const kopf = `
              <tr class="datei"><th colspan="${e.geraete.length + 1}"><code>${esc(datei)}</code>${
                info?.spec.length ? `<span class="meta"> ${info.spec.map((s) => `<a href="../../${esc(s)}">${esc(s.replace(/^specs\//, ''))}</a>`).join(', ')}</span>` : ''
              }</th></tr>`;
        return (
          kopf +
          tests
            .map((t) => {
              const fehler = Object.entries(t.geraete).filter(([, g]) => g.fehler);
              return `
              <tr>
                <th scope="row">${esc(t.titel)}${fehler
                  .map(([gerät, g]) => `<pre class="fehler"><b>${esc(gerät)}:</b> ${esc(g.fehler)}</pre>`)
                  .join('')}</th>
                ${e.geraete
                  .map((g) => {
                    const r = t.geraete[g];
                    const [zeichen, farbe, wort] = STATUS_LAUF[r?.status] ?? ['?', 'grau', r?.status ?? 'nicht gelaufen'];
                    return `<td class="symbol f-${farbe}" title="${esc(g)}: ${esc(wort)}${r ? ' · ' + esc(dauerText(r.dauer)) : ''}">${zeichen}</td>`;
                  })
                  .join('')}
              </tr>`;
            })
            .join('')
        );
      })
      .join('');
    teile.push(`
          <h4>E2E-Tests</h4>
          <table class="zahlen breit lauf">
            <thead><tr><th scope="col">Test</th>${e.geraete.map((g) => `<th scope="col" class="symbol">${esc(g)}</th>`).join('')}</tr></thead>
            <tbody>${zeilen}</tbody>
          </table>`);
  }

  return `
      <section class="abschnitt" id="pruefstand">
        <h2>Prüfstand</h2>
        <div class="spec">
          <h3>Letzter Lauf</h3>
          <span class="meta">aus <code>pruefung/ergebnisse/</code> · nicht eingecheckt, gilt für den Arbeitsbaum, auf dem er lief</span>
          <div class="kennzahlen">${kennzahlen.join('')}</div>
          ${teile.join('')}
        </div>
      </section>`;
}

/* --------------------------------------------------------- Fortschritt */

function decke(max) {
  if (max <= 0) return 1;
  const stelle = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / (stelle / 2)) * (stelle / 2);
}

function saeulen({ punkte, reihen, wert, benennung }) {
  const H = 210, OBEN = 14, UNTEN = 30, LINKS = 46, BREITE = 34;
  const W = LINKS + punkte.length * BREITE + 10;
  const boden = H - UNTEN;
  const hoch = boden - OBEN;
  const max = decke(Math.max(...punkte.map((p) => reihen.reduce((n, r) => n + Math.max(0, wert(p, r.id)), 0))));
  const y = (n) => boden - (n / max) * hoch;
  const gitter = [0, 0.5, 1]
    .map((t) => `<line x1="${LINKS - 4}" x2="${W}" y1="${y(max * t)}" y2="${y(max * t)}" /><text x="${LINKS - 8}" y="${y(max * t) + 4}" text-anchor="end">${zahl(Math.round(max * t))}</text>`)
    .join('');
  const koerper = punkte
    .map((p, i) => {
      const x = LINKS + i * BREITE;
      let unten = boden;
      const stapel = reihen
        .map((r) => {
          const n = wert(p, r.id);
          if (n <= 0) return '';
          const h = (n / max) * hoch;
          unten -= h;
          return `<rect class="f-${r.farbe}" x="${x + 3}" y="${unten}" width="${BREITE - 6}" height="${h}"><title>${esc(p.anzeige)} · ${esc(r.name)}: ${zahl(n)}</title></rect>`;
        })
        .join('');
      return stapel + `<text class="achse" x="${x + BREITE / 2}" y="${boden + 16}" text-anchor="middle">${esc(p.kurz)}</text>`;
    })
    .join('');
  const legende = reihen.map((r) => `<span class="f-${r.farbe}"><i aria-hidden="true"></i>${esc(r.name)}</span>`).join('');
  return `
          <figure class="diagramm">
            <figcaption>${esc(benennung)}</figcaption>
            <div class="rollen">
              <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(benennung)}">
                <g class="gitter">${gitter}</g>${koerper}
                <line class="grund" x1="${LINKS - 4}" x2="${W}" y1="${boden}" y2="${boden}" />
              </svg>
            </div>
            <p class="legende">${legende}</p>
          </figure>`;
}

function fortschrittBlock(verlauf) {
  const jetzt = verlauf.punkte.at(-1);
  const zeilen = [...verlauf.punkte]
    .reverse()
    .map(
      (p) => `
              <tr>
                <th scope="row">${esc(p.anzeige)}<span class="meta"> ${esc(p.sha)} · ${p.commits} Commit${p.commits === 1 ? '' : 's'}</span></th>
                <td class="n">${p.version ?? '–'}</td>
                <td class="n">${zahl(p.loc.gesamt)}</td>
                <td class="n ${p.zuwachs >= 0 ? 'f-gruen' : 'f-orange'}">${p.zuwachs >= 0 ? '+' : '−'}${zahl(Math.abs(p.zuwachs))}</td>
                ${KLASSEN.map((k) => `<td class="n leise">${zahl(p.loc[k.id])}</td>`).join('')}
                <td class="n">${zahl(p.gesamt)}</td>
                <td class="n f-gruen">${zahl(p.status.fertig)}</td>
                <td class="n">${p.gesamt ? p.quote + '&nbsp;%' : '–'}</td>
              </tr>`,
    )
    .join('');

  return `
      <section class="abschnitt" id="fortschritt">
        <h2>Fortschritt</h2>
        <div class="spec">
          <h3>Stand je ${esc(TAKTE[verlauf.takt].name)}</h3>
          <span class="meta">aus der Git-Historie, jeweils der letzte Commit des Zeitraums · ohne Lockfiles und das erzeugte Board</span>
          <div class="kennzahlen">
            ${kennzahl('Version', esc(jetzt.version ?? '–'), 'zuletzt eingecheckt')}
            ${kennzahl('Zeilen', zahl(jetzt.loc.gesamt), KLASSEN.map((k) => `${esc(k.name)} ${zahl(jetzt.loc[k.id])}`).join(' · '))}
            ${kennzahl('Akzeptanzkriterien', zahl(jetzt.gesamt), `in ${jetzt.specs} Specs, eingecheckt`)}
            ${kennzahl('Fertig', jetzt.gesamt ? jetzt.quote + ' %' : '–', `${zahl(jetzt.status.fertig)} Kriterien`)}
          </div>
          <div class="diagramme">
            ${saeulen({ punkte: verlauf.punkte, reihen: KLASSEN, wert: (p, id) => p.loc[id], benennung: 'Zeilen je Klasse' })}
            ${saeulen({
              punkte: verlauf.punkte,
              reihen: STAPEL.map((s) => ({ id: s, name: STATUS_ANZEIGE[s], farbe: FARBE[s] })),
              wert: (p, id) => p.status[id] ?? 0,
              benennung: 'Akzeptanzkriterien je Status',
            })}
          </div>
          <table class="zahlen">
            <thead>
              <tr>
                <th scope="col">Stichtag</th><th scope="col" class="n">Version</th>
                <th scope="col" class="n">Zeilen</th><th scope="col" class="n">Δ</th>
                ${KLASSEN.map((k) => `<th scope="col" class="n">${esc(k.name)}</th>`).join('')}
                <th scope="col" class="n">ACs</th><th scope="col" class="n">fertig</th><th scope="col" class="n">Grad</th>
              </tr>
            </thead>
            <tbody>${zeilen}</tbody>
          </table>
        </div>
      </section>`;
}

/* -------------------------------------------------------------- Seite */

export function seite({ specs, verlauf, bestand, lauf, version, bereichTitel = {} }) {
  const alle = [...specs.values()];
  const bereiche = new Map();
  for (const spec of alle) {
    const b = spec.pfad.split('/')[0];
    if (!bereiche.has(b)) bereiche.set(b, []);
    bereiche.get(b).push(spec);
  }
  const kriterien = alle.flatMap((s) => s.kriterien);
  const z = zaehlen(kriterien);

  const knopf = (wert, beschriftung, anzahl, farbe) => `
          <button type="button" data-wert="${wert}" aria-pressed="${wert === 'alle'}" class="${farbe ? 'f-' + farbe : ''}">${
            farbe ? '<span class="punkt" aria-hidden="true"></span>' : ''
          }${esc(beschriftung)} <b>${anzahl}</b></button>`;

  const e2e = lauf?.e2e;
  const wRot = lauf?.waechter?.pruefungen.filter((p) => p.beanstandungen.length).length ?? 0;
  const laufMarke = !lauf
    ? '<span class="meta">noch kein Lauf</span>'
    : e2e?.rot || wRot
      ? '<span class="meta f-rot">✗ rot</span>'
      : '<span class="meta f-gruen">✓ grün</span>';

  const nav = [...bereiche.entries()]
    .map(([bereich, liste]) => {
      const voll = liste.filter(vollstaendig).length;
      return `
          <h2>${esc(bereichTitel[bereich] ?? bereich)} <span class="meta">${voll}/${liste.length}</span></h2>
          ${liste
            .map(
              (spec) => `
          <a href="#${esc(spec.pfad)}" data-ziel="${esc(spec.pfad)}"${vollstaendig(spec) ? ' class="voll"' : ''}>
            <span>${esc(spec.titel)}</span>
            <span class="meta">${vollstaendig(spec) ? haken : ''}${spec.kriterien.filter((k) => k.status === 'fertig').length}/${spec.kriterien.length}</span>
          </a>
          ${balken(spec.kriterien)}`,
            )
            .join('')}`;
    })
    .join('');

  const abschnitte = [...bereiche.entries()]
    .map(
      ([bereich, liste]) => `
      <section class="bereich">
        <h2>${esc(bereichTitel[bereich] ?? bereich)}</h2>
        ${liste.map(specBlock).join('')}
      </section>`,
    )
    .join('');

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LocalGames — Specs und Prüfstand</title>
    <style>${stil}</style>
  </head>
  <body>
    <header class="kopf">
      <h1><span>LocalGames</span> — Specs und Prüfstand</h1>
      <p class="meta"><span id="stand">${kriterien.length} Akzeptanzkriterien</span> · Version ${esc(version)} im Arbeitsbaum · erzeugt ${esc(zeitText(new Date().toISOString()))}</p>
      <div class="werkzeug">
        <input id="suche" type="search" placeholder="Suchen (Taste /) — Titel, Text, AC-Nummer" aria-label="Akzeptanzkriterien durchsuchen" />
        ${knopf('alle', 'alle', kriterien.length)}
        ${REIHENFOLGE.map((s) => knopf(s, STATUS_ANZEIGE[s], z[s], FARBE[s])).join('')}
      </div>
    </header>
    <div class="rumpf">
      <nav aria-label="Inhalt">
        <h2>Überblick</h2>
        <a href="#pruefstand" data-ziel="pruefstand"><span>Prüfstand</span>${laufMarke}</a>
        ${verlauf?.punkte.length ? `<a href="#fortschritt" data-ziel="fortschritt"><span>Fortschritt</span><span class="meta">${z.fertig}/${kriterien.length}</span></a>` : ''}
        ${nav}
      </nav>
      <main>
        ${pruefstandBlock(lauf, bestand)}
        ${verlauf?.punkte.length ? fortschrittBlock(verlauf) : ''}
        ${abschnitte || '<p class="leer">Keine Specs gefunden.</p>'}
        <p class="leer" id="nichts" hidden>Kein Akzeptanzkriterium passt zu dieser Auswahl.</p>
      </main>
    </div>
    <script>${skript}</script>
  </body>
</html>
`;
}
