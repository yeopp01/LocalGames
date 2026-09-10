#!/usr/bin/env node
/* WÄCHTER + BOARD: Status der Akzeptanzkriterien.

   Die Spec bleibt – abgearbeitet wird das einzelne Kriterium. Jedes trägt
   seinen Status in der Spec selbst; dieses Skript führt sie zu specs/BOARD.md
   zusammen, setzt die **Stand:**-Zeile jeder Spec und die Tabelle in den
   Bereichs-READMEs.

   Beanstandet wird:
     - ein Kriterium ohne oder mit unbekanntem Status,
     - `zurueckgestellt` ohne Grund in Klammern,
     - ein fehlender oder zu langer Kurztitel,
     - eine Nummer, die in derselben Spec zweimal steht,
     - eine Spec ohne Akzeptanzkriterien,
     - mit --check: eine erzeugte Datei, die nicht mehr zum Stand passt.

   Aufruf: node pruefung/skripte/spec-board.mjs [--check] */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  REIHENFOLGE, STATUS, STATUS_ANZEIGE, TITEL_WOERTER, TITEL_ZEICHEN,
  dateien, specsLesen, zaehlen,
} from './spec-leser.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SPECS = join(ROOT, 'specs');
const BOARD = join(SPECS, 'BOARD.md');
const rel = (p) => relative(ROOT, p).split(sep).join('/');

/** Markdown-Tabelle mit gepolsterten Spalten. */
function tabelle(kopf, zeilen) {
  const breite = kopf.map((_, i) => Math.max(3, ...[kopf, ...zeilen].map((z) => String(z[i] ?? '').length)));
  const zeile = (z) => '| ' + z.map((c, i) => String(c ?? '').padEnd(breite[i])).join(' | ') + ' |';
  const trenner = '| ' + breite.map((b) => '-'.repeat(b)).join(' | ') + ' |';
  return [zeile(kopf), trenner, ...zeilen.map(zeile)].join('\n');
}

const kurz = (pfad) => pfad.replace(/\.md$/, '').split('/').pop();
const nummer = (id) => Number(id.slice(3));
const uebersicht = (z) => REIHENFOLGE.map((s) => `${z[s]} ${STATUS_ANZEIGE[s].toLowerCase()}`).join(' · ');

/** Kurzfassung für den Kopf einer Spec und die Bereichs-README. */
export function standText(kriterien) {
  const z = zaehlen(kriterien);
  const rest = REIHENFOLGE.filter((s) => s !== 'fertig' && z[s]).map((s) => `${z[s]} ${STATUS_ANZEIGE[s].toLowerCase()}`);
  return `${z.fertig}/${kriterien.length} fertig` + (rest.length ? ' · ' + rest.join(' · ') : '');
}

/**
 * Prüft die Specs und schreibt die erzeugten Dateien – oder meldet sie mit
 * `schreiben: false` nur als veraltet.
 */
export async function board({ schreiben = true } = {}) {
  const fehler = [];
  const veraltet = [];
  const specs = await specsLesen(SPECS);
  const bekannt = new Set(STATUS);

  for (const spec of specs.values()) {
    if (!spec.kriterien.length) {
      fehler.push(`specs/${spec.pfad}: nennt keine Akzeptanzkriterien.`);
    }
    const gesehen = new Set();
    for (const k of spec.kriterien) {
      const wo = `specs/${spec.pfad} ${k.id}`;
      if (gesehen.has(k.id)) fehler.push(`${wo}: die Nummer steht zweimal in derselben Spec.`);
      gesehen.add(k.id);
      if (!k.status) {
        fehler.push(`${wo}: ohne Status – erwartet einen aus ${STATUS.join(', ')}.`);
        continue;
      }
      if (!bekannt.has(k.status)) {
        fehler.push(`${wo}: unbekannter Status "${k.status}" – erlaubt: ${STATUS.join(', ')}.`);
        continue;
      }
      if (k.status === 'zurueckgestellt' && !k.grund) {
        fehler.push(`${wo}: zurueckgestellt ohne Grund – erwartet \`zurueckgestellt\` (Grund).`);
      }
      if (!k.titel) {
        fehler.push(`${wo}: ohne Kurztitel – erwartet **Titel** vor der Anforderung.`);
      } else if (k.titel.split(/\s+/).length > TITEL_WOERTER || k.titel.length > TITEL_ZEICHEN) {
        fehler.push(`${wo}: Kurztitel zu lang ("${k.titel}") – höchstens ${TITEL_WOERTER} Wörter und ${TITEL_ZEICHEN} Zeichen.`);
      }
    }
  }

  async function ablegen(pfad, inhalt) {
    const alt = existsSync(pfad) ? await readFile(pfad, 'utf8') : '';
    if (alt === inhalt) return;
    if (!schreiben) veraltet.push(rel(pfad));
    else await writeFile(pfad, inhalt, 'utf8');
  }

  // Stand je Spec
  for (const spec of specs.values()) {
    const inhalt = await readFile(spec.datei, 'utf8');
    if (!/^\*\*Stand:\*\*/m.test(inhalt)) {
      fehler.push(`specs/${spec.pfad}: ohne **Stand:**-Zeile im Kopf.`);
      continue;
    }
    await ablegen(spec.datei, inhalt.replace(/^\*\*Stand:\*\*.*$/m, `**Stand:** ${standText(spec.kriterien)}`));
  }

  // Stand je Bereich
  const START = '<!-- board:start -->';
  const ENDE = '<!-- board:end -->';
  for (const readme of await dateien(SPECS)) {
    if (!readme.endsWith('README.md') || readme === join(SPECS, 'README.md')) continue;
    const inhalt = await readFile(readme, 'utf8');
    if (!inhalt.includes(START)) continue;
    const bereich = relative(SPECS, dirname(readme)).split(sep).join('/');
    const eigene = [...specs.values()].filter((s) => s.pfad.startsWith(bereich + '/'));
    const block = eigene.length
      ? tabelle(['Spezifikation', 'Stand'], eigene.map((s) => [`[${s.titel}](${kurz(s.pfad)}.md)`, standText(s.kriterien)]))
      : '> Noch keine Spezifikationen in diesem Bereich.';
    await ablegen(readme, inhalt.replace(new RegExp(`${START}[\\s\\S]*?${ENDE}`), `${START}\n\n${block}\n\n${ENDE}`));
  }

  // Das Board
  const alle = [...specs.values()];
  const gesamt = zaehlen(alle.flatMap((s) => s.kriterien));
  const teile = [
    '<!-- Erzeugt von pruefung/skripte/spec-board.mjs. Nicht von Hand ändern –',
    '     der Status steht am Akzeptanzkriterium in der jeweiligen Spec. -->',
    '',
    '# Board',
    '',
    'Eine Zeile je Akzeptanzkriterium. Gepflegt wird der Status in der Spec',
    'selbst, hier steht er zusammengefasst.',
    '',
    `**Gesamt:** ${uebersicht(gesamt)}`,
    '',
    '## Nach Spezifikation',
    '',
    tabelle(
      ['Spezifikation', ...REIHENFOLGE.map((s) => STATUS_ANZEIGE[s])],
      alle.map((s) => {
        const z = zaehlen(s.kriterien);
        return [`[${s.titel}](${s.pfad})`, ...REIHENFOLGE.map((st) => (z[st] ? String(z[st]) : '-'))];
      }),
    ),
    '',
  ];
  for (const status of REIHENFOLGE) {
    const zeilen = [];
    for (const spec of alle) {
      for (const k of [...spec.kriterien].sort((a, b) => nummer(a.id) - nummer(b.id))) {
        if (k.status !== status) continue;
        zeilen.push([kurz(spec.pfad), `[${k.id}](${spec.pfad})`, k.titel || '-', k.grund || k.gruppe || '']);
      }
    }
    if (!zeilen.length) continue;
    teile.push(`## ${STATUS_ANZEIGE[status]} (${zeilen.length})`, '', tabelle(['Spec', 'AC', 'Titel', 'Anmerkung'], zeilen), '');
  }
  await ablegen(BOARD, teile.join('\n').replace(/\n+$/, '\n'));

  if (veraltet.length) {
    fehler.push(`nicht aktuell: ${veraltet.join(', ')} – "node pruefung/skripte/spec-board.mjs" ausführen und mitcommitten.`);
  }
  return { fehler, specs, gesamt, uebersicht: uebersicht(gesamt) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ergebnis = await board({ schreiben: !process.argv.includes('--check') });
  if (ergebnis.fehler.length) {
    console.error('Board: Status der Akzeptanzkriterien stimmt nicht.\n');
    for (const e of ergebnis.fehler) console.error('  ' + e);
    console.error(`\n${ergebnis.fehler.length} Beanstandung(en).`);
    process.exit(1);
  }
  console.log(`Board: ${ergebnis.uebersicht} über ${ergebnis.specs.size} Spec(s).`);
}
