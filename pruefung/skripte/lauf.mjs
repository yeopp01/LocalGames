/* LETZTER LAUF: was Wächter und E2E-Tests zuletzt gesagt haben.

   Gelesen wird, was die Läufe selbst ablegen – pruefung/ergebnisse/
   waechter.json und e2e.json (JSON-Reporter von Playwright). Beides ist
   nicht eingecheckt: ein Ergebnis gehört zu einem Arbeitsbaum, nicht zu
   einem Commit.

   Dazu die Frage, die man beim Lesen eines grünen Laufs zuerst stellen
   sollte: Ist er noch aktuell? Liegt eine ausgelieferte Datei oder ein Test
   jünger als der Lauf, sagt der Bericht das. */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ANSI = /\[[0-9;]*m/g;

function jsonLesen(pfad) {
  if (!existsSync(pfad)) return null;
  try {
    return JSON.parse(readFileSync(pfad, 'utf8'));
  } catch {
    return null;
  }
}

/** Ausgelieferte Dateien und Tests, die nach `seit` geändert wurden. */
function juenger(root, seit) {
  const kandidaten = ['index.html', 'app.js', 'styles.css', 'sw.js', 'version.js', 'manifest.webmanifest'];
  for (const dir of ['spiele', 'pruefung/e2e']) {
    if (existsSync(join(root, dir))) kandidaten.push(...readdirSync(join(root, dir)).map((d) => `${dir}/${d}`));
  }
  return kandidaten
    .filter((p) => existsSync(join(root, p)) && statSync(join(root, p)).mtimeMs > seit)
    .sort();
}

/** Alle Tests aus dem Playwright-Bericht, flach: Datei, Titelpfad, Ergebnis je Gerät. */
function testsAus(bericht) {
  const zeilen = new Map();
  const ab = (suite, pfad) => {
    for (const s of suite.suites ?? []) ab(s, s.title && !s.file?.endsWith(s.title) ? [...pfad, s.title] : pfad);
    for (const spec of suite.specs ?? []) {
      const schluessel = `${spec.file}::${[...pfad, spec.title].join(' › ')}`;
      const zeile = zeilen.get(schluessel) ?? {
        datei: spec.file,
        titel: [...pfad, spec.title].join(' › '),
        geraete: {},
      };
      for (const t of spec.tests ?? []) {
        const r = t.results?.at(-1);
        const fehler = r?.errors?.[0]?.message ?? r?.error?.message ?? '';
        zeile.geraete[t.projectName] = {
          status: r?.status ?? (t.status === 'skipped' ? 'skipped' : 'unbekannt'),
          dauer: r?.duration ?? 0,
          fehler: fehler.replace(ANSI, '').split('\n').filter(Boolean).slice(0, 6).join('\n'),
        };
      }
      zeilen.set(schluessel, zeile);
    }
  };
  for (const s of bericht.suites ?? []) ab(s, []);
  return [...zeilen.values()];
}

export function letzterLauf(root) {
  const ordner = join(root, 'pruefung', 'ergebnisse');
  const waechter = jsonLesen(join(ordner, 'waechter.json'));
  const e2eRoh = jsonLesen(join(ordner, 'e2e.json'));

  let e2e = null;
  if (e2eRoh?.stats) {
    const tests = testsAus(e2eRoh);
    const start = Date.parse(e2eRoh.stats.startTime);
    e2e = {
      zeit: e2eRoh.stats.startTime,
      dauer: e2eRoh.stats.duration,
      bestanden: e2eRoh.stats.expected,
      rot: e2eRoh.stats.unexpected,
      wackelig: e2eRoh.stats.flaky,
      uebersprungen: e2eRoh.stats.skipped,
      geraete: [...new Set(tests.flatMap((t) => Object.keys(t.geraete)))],
      tests,
      juenger: Number.isFinite(start) ? juenger(root, start) : [],
    };
  }
  return waechter || e2e ? { waechter, e2e } : null;
}
