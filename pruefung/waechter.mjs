#!/usr/bin/env node
/* WÄCHTER: was ohne Browser prüfbar ist, in wenigen hundert Millisekunden.

   Jede Prüfung steht für eine Regel aus CLAUDE.md, die bisher nur als Satz
   dastand und deshalb gelegentlich vergessen wurde:

     bestand   – jedes Spiel in index.html, jede ausgelieferte Datei im Lager
                 des Service Workers, nichts im Lager, was es nicht gibt
     reihenfolge – version.js zuerst, app.js vor jedem Spiel, das sich anmeldet
     version   – ausgelieferte Datei geändert, Versionsnummer nicht hochgezählt
     syntax    – jede ausgelieferte Skriptdatei lässt sich parsen
     spiele    – jedes angemeldete Spiel hat eine Spec und eine Zeile im README
     specs     – Format und Status der Akzeptanzkriterien, Board aktuell
     verweise  – relative Links in den Markdown-Dateien zeigen auf etwas

   Das Ergebnis steht zusätzlich in pruefung/ergebnisse/waechter.json, von
   dort liest es der Bericht.

   Aufruf: node pruefung/waechter.mjs */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { board } from './skripte/spec-board.mjs';
import { dateien } from './skripte/spec-leser.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (p) => readFileSync(join(ROOT, p), 'utf8');
const gibt = (p) => existsSync(join(ROOT, p));
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

/** Was GitHub Pages ausliefert und was deshalb die Versionsnummer betrifft. */
const AUSGELIEFERT = /^(index\.html|app\.js|styles\.css|sw\.js|version\.js|manifest\.webmanifest|spiele\/|icons\/|schriften\/)/;

const spielDateien = readdirSync(join(ROOT, 'spiele')).filter((d) => d.endsWith('.js')).map((d) => 'spiele/' + d);
const skripteInIndex = [...lies('index.html').matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]);
const grundbestand = [...lies('sw.js').matchAll(/^\s*'\.\/([^']*)',?\s*$/gm)].map((m) => m[1]);

const pruefungen = [];
function pruefung(id, was, fn) {
  const beanstandungen = [];
  try {
    fn((text) => beanstandungen.push(text));
  } catch (e) {
    beanstandungen.push('Prüfung abgebrochen: ' + e.message);
  }
  pruefungen.push({ id, was, beanstandungen });
}

/* ---------------------------------------------------------------- bestand */

pruefung('bestand', 'Spiele in index.html, ausgelieferte Dateien im Lager des Service Workers', (melde) => {
  for (const d of spielDateien) {
    if (!skripteInIndex.includes(d)) melde(`${d} fehlt als <script> in index.html.`);
  }
  for (const s of skripteInIndex) {
    if (!gibt(s)) melde(`index.html lädt ${s}, die Datei gibt es nicht.`);
  }
  const noetig = new Set(['index.html', 'styles.css', 'manifest.webmanifest', ...skripteInIndex]);
  for (const m of lies('manifest.webmanifest').matchAll(/"src":\s*"([^"]+)"/g)) noetig.add(m[1]);
  for (const m of lies('index.html').matchAll(/<link[^>]+href="([^"]+\.(?:png|webmanifest|css))"/g)) noetig.add(m[1]);
  for (const m of lies('styles.css').matchAll(/url\('([^']+\.woff2)'\)/g)) noetig.add(m[1]);
  for (const d of noetig) {
    if (!grundbestand.includes(d)) melde(`${d} wird geladen, steht aber nicht in GRUNDBESTAND (sw.js) – offline fehlt sie.`);
  }
  for (const d of grundbestand) {
    if (d && !gibt(d)) melde(`sw.js GRUNDBESTAND nennt ./${d}, die Datei gibt es nicht.`);
  }
});

/* ------------------------------------------------------------ reihenfolge */

pruefung('reihenfolge', 'version.js zuerst, app.js vor jedem Spiel', (melde) => {
  if (skripteInIndex[0] !== 'version.js') melde('index.html lädt nicht version.js als erstes Skript.');
  const app = skripteInIndex.indexOf('app.js');
  for (const [i, s] of skripteInIndex.entries()) {
    if (!s.startsWith('spiele/') || !gibt(s)) continue;
    if (lies(s).includes('Rahmen.anmelden(') && i < app) {
      melde(`${s} meldet sich beim Rahmen an, wird aber vor app.js geladen.`);
    }
  }
  if (!/Rahmen\.los\(\)/.test(lies('index.html'))) melde('index.html ruft Rahmen.los() nicht auf.');
});

/* ---------------------------------------------------------------- version */

pruefung('version', 'Geänderte ausgelieferte Datei → Versionsnummer hochgezählt', (melde) => {
  let geaendert;
  try {
    geaendert = git('status', '--porcelain', '--untracked-files=all')
      .split('\n')
      .filter(Boolean)
      .map((z) => z.slice(3).replace(/^"|"$/g, ''))
      .filter((p) => AUSGELIEFERT.test(p) && p !== 'version.js');
  } catch {
    return; // Kein Git – dann gibt es auch nichts zu vergleichen.
  }
  if (!geaendert.length) return;
  const nummer = (text) => Number(/nummer:\s*(\d+)/.exec(text)?.[1]);
  const jetzt = nummer(lies('version.js'));
  const vorher = nummer(git('show', 'HEAD:version.js'));
  if (jetzt <= vorher) {
    melde(
      `Geändert gegenüber HEAD: ${geaendert.join(', ')} – aber version.js steht weiter auf ${jetzt}. ` +
        'Ohne neue Nummer behalten installierte Geräte den alten Stand.',
    );
  }
});

/* ----------------------------------------------------------------- syntax */

pruefung('syntax', 'Jede ausgelieferte Skriptdatei lässt sich parsen', (melde) => {
  for (const d of ['version.js', 'app.js', 'sw.js', ...spielDateien]) {
    try {
      new Script(lies(d), { filename: d });
    } catch (e) {
      melde(`${d}: ${e.message}`);
    }
  }
});

/* ----------------------------------------------------------------- spiele */

pruefung('spiele', 'Jedes angemeldete Spiel hat Spec und README-Zeile, Kennungen eindeutig', (melde) => {
  const readme = lies('README.md');
  const specs = new Map();
  const suche = (dir) => {
    for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      if (e.isDirectory()) suche(join(dir, e.name));
      else specs.set(e.name.replace(/\.md$/, ''), join(dir, e.name).replaceAll('\\', '/'));
    }
  };
  if (gibt('specs')) suche('specs');
  const ids = new Map();
  for (const d of spielDateien) {
    const text = lies(d);
    const stelle = text.indexOf('Rahmen.anmelden(');
    if (stelle < 0) continue;
    const block = text.slice(stelle, stelle + 1500);
    const id = /id:\s*'([^']+)'/.exec(block)?.[1];
    const name = /name:\s*'([^']+)'/.exec(block)?.[1];
    if (!id) {
      melde(`${d}: Rahmen.anmelden ohne lesbare id.`);
      continue;
    }
    if (ids.has(id)) melde(`${d}: id '${id}' vergibt schon ${ids.get(id)}.`);
    ids.set(id, d);
    if (!specs.has(id)) {
      melde(`${d}: Spiel '${id}' hat keine Spec specs/<bereich>/${id}.md.`);
      continue;
    }
    // Die Spieltabelle verlinkt jeden Namen auf seine Spec – der Link ist der
    // Weg vom Überblick zu dem, was das Spiel können soll.
    const zeile = `| [**${name}**](${specs.get(id)}) |`;
    if (name && !readme.includes(zeile)) melde(`${d}: README-Spieltabelle braucht die Zeile "${zeile} …".`);
  }
});

/* ------------------------------------------------------------------ specs */

const specErgebnis = await board({ schreiben: false });
pruefung('specs', 'Format und Status der Akzeptanzkriterien, Board aktuell', (melde) => {
  for (const f of specErgebnis.fehler) melde(f);
});

/* --------------------------------------------------------------- verweise */

const markdown = [
  'README.md', 'CLAUDE.md', 'pruefung/README.md',
  ...(await dateien(join(ROOT, 'specs'))).map((d) => d.slice(ROOT.length + 1).replaceAll('\\', '/')),
].filter(gibt);

pruefung('verweise', 'Relative Links in Markdown zeigen auf vorhandene Dateien', (melde) => {
  for (const datei of markdown) {
    let imCode = false;
    for (const [nr, zeile] of lies(datei).split(/\r?\n/).entries()) {
      if (/^\s*```/.test(zeile)) imCode = !imCode;
      if (imCode) continue;
      for (const m of zeile.matchAll(/\]\(([^)\s]+)\)/g)) {
        const ziel = m[1].split('#')[0];
        if (!ziel || /^[a-z]+:/i.test(ziel)) continue;
        if (!existsSync(resolve(ROOT, dirname(datei), decodeURIComponent(ziel)))) {
          melde(`${datei}:${nr + 1} verweist auf ${m[1]} – gibt es nicht.`);
        }
      }
    }
  }
});

/* --------------------------------------------------------------- Ergebnis */

const rot = pruefungen.filter((p) => p.beanstandungen.length);
mkdirSync(join(ROOT, 'pruefung', 'ergebnisse'), { recursive: true });
writeFileSync(
  join(ROOT, 'pruefung', 'ergebnisse', 'waechter.json'),
  JSON.stringify({ zeit: new Date().toISOString(), pruefungen }, null, 2) + '\n',
);

for (const p of pruefungen) {
  console.log(`${p.beanstandungen.length ? '✗' : '✓'} ${p.id.padEnd(12)} ${p.was}`);
  for (const b of p.beanstandungen) console.log(`    ${b}`);
}
console.log(rot.length ? `\nWächter: ${rot.length} von ${pruefungen.length} rot.` : `\nWächter: alle ${pruefungen.length} grün.`);
process.exit(rot.length ? 1 : 0);
