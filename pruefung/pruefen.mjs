#!/usr/bin/env node
/* Alles in einem Lauf: Wächter, E2E-Tests, Bericht.

   Der Bericht wird auch nach einem roten Lauf geschrieben – gerade dann
   will man ihn lesen. Der Exit-Code ist rot, sobald eine Stufe rot war.

   Aufruf:
     node pruefung/pruefen.mjs                  alles
     node pruefung/pruefen.mjs --ohne-e2e       nur Wächter und Bericht (Sekunden)
     node pruefung/pruefen.mjs -- -g Minenfeld  Argumente nach -- gehen an Playwright

   Vorher einmalig: npm --prefix pruefung install */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const argumente = process.argv.slice(2);
const trenner = argumente.indexOf('--');
const eigene = trenner < 0 ? argumente : argumente.slice(0, trenner);
const weiter = trenner < 0 ? [] : argumente.slice(trenner + 1);

// Beide gesetzt, und Node warnt bei jedem Arbeiter darüber.
const umgebung = { ...process.env };
delete umgebung.NO_COLOR;

const stufen = [];
function stufe(name, befehl, args) {
  console.log(`\n━━ ${name} ━━`);
  const start = Date.now();
  const r = spawnSync(befehl, args, { cwd: HIER, stdio: 'inherit', env: umgebung });
  const gruen = r.status === 0;
  stufen.push({ name, gruen, dauer: Date.now() - start });
  return gruen;
}

stufe('Wächter', process.execPath, ['waechter.mjs']);

if (!eigene.includes('--ohne-e2e')) {
  const cli = join(HIER, 'node_modules', '@playwright', 'test', 'cli.js');
  if (!existsSync(cli)) {
    console.log('\n━━ E2E ━━\nPlaywright fehlt. Einmalig: npm --prefix pruefung install');
    stufen.push({ name: 'E2E', gruen: false, dauer: 0 });
  } else {
    stufe('E2E', process.execPath, [cli, 'test', ...weiter]);
  }
}

stufe('Bericht', process.execPath, ['skripte/bericht.mjs']);

console.log('\n━━ Ergebnis ━━');
for (const s of stufen) console.log(`${s.gruen ? '✓' : '✗'} ${s.name.padEnd(8)} ${(s.dauer / 1000).toFixed(1)} s`);
const rot = stufen.some((s) => !s.gruen);
console.log(rot ? '\nRot. Bericht: pruefung/bericht/index.html' : '\nGrün. Bericht: pruefung/bericht/index.html');
process.exit(rot ? 1 : 0);
