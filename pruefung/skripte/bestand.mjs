/* BESTAND: wie viele Prüfungen es gibt, je Art.

   Gezählt wird der Arbeitsbaum, nicht die Historie. Eine Zahl hier ist ein
   Bestand, kein Wirksamkeitsnachweis – ob die Prüfungen etwas taugen, sagt
   der letzte Lauf, und ob sie das Richtige prüfen, nur das Lesen. */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Ein Testfall – test( und die Modifikatoren, die einen Fall erzeugen – samt
    Anfang des Titels. */
const FALL = /^[ \t]*test(?:\.(?:only|skip|fixme|fail))?\s*\(\s*([`'"])(.{0,24})/gm;

export function bestand(root) {
  const e2eDir = join(root, 'pruefung', 'e2e');
  const dateien = existsSync(e2eDir) ? readdirSync(e2eDir).filter((d) => d.endsWith('.spec.mjs')) : [];
  const e2e = dateien.map((d) => {
    const text = readFileSync(join(e2eDir, d), 'utf8');
    // Ein Fall in der Schleife über alle Spiele trägt das Spiel im Titel
    // (`${spiel.name} …`) und läuft einmal je Spiel; alle anderen einmal.
    let einzeln = 0;
    let jeSpiel = 0;
    for (const m of text.matchAll(FALL)) {
      if (m[1] === '`' && m[2].includes('${spiel')) jeSpiel += 1;
      else einzeln += 1;
    }
    const spec = [...text.matchAll(/specs\/[\w/-]+\.md/g)].map((m) => m[0]);
    return { datei: d, einzeln, jeSpiel, spec: [...new Set(spec)] };
  });

  const spiele = existsSync(join(root, 'spiele'))
    ? readdirSync(join(root, 'spiele')).filter((d) => readFileSync(join(root, 'spiele', d), 'utf8').includes('Rahmen.anmelden(')).length
    : 0;

  const waechterText = existsSync(join(root, 'pruefung', 'waechter.mjs'))
    ? readFileSync(join(root, 'pruefung', 'waechter.mjs'), 'utf8')
    : '';
  const waechter = [...waechterText.matchAll(/pruefung\('([\w-]+)',\s*'([^']+)'/g)].map((m) => ({ id: m[1], was: m[2] }));

  let geraete = [];
  const konfig = join(root, 'pruefung', 'playwright.config.mjs');
  if (existsSync(konfig)) geraete = [...readFileSync(konfig, 'utf8').matchAll(/\{\s*name:\s*'([\w-]+)'/g)].map((m) => m[1]);

  const faelleGesamt = e2e.reduce((n, d) => n + d.einzeln + d.jeSpiel * spiele, 0);
  return { e2e, spiele, waechter, geraete, faelle: faelleGesamt, laeufe: faelleGesamt * Math.max(1, geraete.length) };
}
