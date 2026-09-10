#!/usr/bin/env node
/* BERICHT: Specs, Fortschritt und letzter Prüflauf auf einer Seite.

   Schreibt pruefung/bericht/index.html. Die Seite lädt nichts nach und
   braucht keinen Server – doppelklicken genügt.

   Gelesen werden:
     specs/**            Akzeptanzkriterien und Status (spec-leser.mjs)
     Git-Historie        Zeilen, Kriterien, Version je Tag (fortschritt.mjs)
     pruefung/e2e, waechter.mjs   Bestand an Prüfungen (bestand.mjs)
     pruefung/ergebnisse          letzter Lauf (lauf.mjs)

   Der Bericht prüft nichts; das tun Wächter und Tests. Fehlt ein Teil
   (keine Historie, noch kein Lauf), entfällt nur dieser Abschnitt.

   Aufruf: node pruefung/skripte/bericht.mjs */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { specsLesen, zaehlen } from './spec-leser.mjs';
import { fortschritt } from './fortschritt.mjs';
import { bestand } from './bestand.mjs';
import { letzterLauf } from './lauf.mjs';
import { seite } from './bericht-vorlage.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ZIEL = join(ROOT, 'pruefung', 'bericht', 'index.html');

const specs = await specsLesen(join(ROOT, 'specs'));

// Welche Dateien eine Spec beschreibt, steht in ihrer **Datei:**-Zeile.
for (const spec of specs.values()) {
  const zeile = (await readFile(spec.datei, 'utf8')).match(/^\*\*Datei:\*\*(.*)$/m)?.[1] ?? '';
  spec.code = [...zeile.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
}

let verlauf = null;
try {
  verlauf = await fortschritt(ROOT);
} catch (e) {
  console.warn(`Fortschritt übersprungen: ${e.message}`);
}

let pruef = null;
try {
  pruef = bestand(ROOT);
} catch (e) {
  console.warn(`Bestand übersprungen: ${e.message}`);
}

const lauf = letzterLauf(ROOT);
const version = /nummer:\s*(\d+)/.exec(await readFile(join(ROOT, 'version.js'), 'utf8'))?.[1] ?? '?';

await mkdir(dirname(ZIEL), { recursive: true });
// Der Name eines Bereichs steht als Titel in seiner README – „Rätsel", nicht „10-raetsel".
const bereichTitel = {};
for (const bereich of new Set([...specs.values()].map((s) => s.pfad.split('/')[0]))) {
  try {
    const text = await readFile(join(ROOT, 'specs', bereich, 'README.md'), 'utf8');
    bereichTitel[bereich] = text.match(/^# (.+)$/m)?.[1].trim() ?? bereich;
  } catch {
    bereichTitel[bereich] = bereich;
  }
}

await writeFile(ZIEL, seite({ specs, verlauf, bestand: pruef, lauf, version, bereichTitel }), 'utf8');

const z = zaehlen([...specs.values()].flatMap((s) => s.kriterien));
const summe = Object.values(z).reduce((a, b) => a + b, 0);
console.log(`Bericht: ${relative(ROOT, ZIEL).split(sep).join('/')}`);
console.log(`  ${summe} Akzeptanzkriterien in ${specs.size} Specs, ${z.fertig} fertig, ${z.offen} offen.`);
if (lauf?.e2e) console.log(`  Letzter E2E-Lauf: ${lauf.e2e.bestanden} grün, ${lauf.e2e.rot} rot (${lauf.e2e.zeit}).`);
if (lauf?.waechter) {
  const rot = lauf.waechter.pruefungen.filter((p) => p.beanstandungen.length).length;
  console.log(`  Letzter Wächterlauf: ${lauf.waechter.pruefungen.length - rot} grün, ${rot} rot.`);
}
