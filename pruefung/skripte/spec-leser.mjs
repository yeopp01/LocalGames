/* Gemeinsamer Leser für die Specs unter specs/.

   Board, Wächter, Fortschritt und Bericht lesen dieselben Kriterien über
   diese eine Datei – sonst zählt jeder etwas anderes.

   Zeilenformat eines Akzeptanzkriteriums:
     - **AC-7** `fertig` **Erster Klick sicher** — Der erste Klick …
     - **AC-9** `zurueckgestellt` (braucht einen Server) **Stimmen** — …

   Der Kurztitel steht im Board, der Text dahinter ist die Anforderung. */

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Status von „noch nichts" bis „fertig". */
export const STATUS = ['offen', 'geplant', 'in-arbeit', 'fertig', 'zurueckgestellt'];

/** Anzeige und Reihenfolge im Board – oben, was Aufmerksamkeit braucht. */
export const STATUS_ANZEIGE = {
  'in-arbeit': 'In Arbeit',
  geplant: 'Geplant',
  offen: 'Offen',
  zurueckgestellt: 'Zurückgestellt',
  fertig: 'Fertig',
};
export const REIHENFOLGE = Object.keys(STATUS_ANZEIGE);

export const TITEL_WOERTER = 5;
export const TITEL_ZEICHEN = 44;

const AC_ZEILE = /^\s*-\s+\*\*(AC-\d+)\*\*\s+(.*)$/;
const MARKER = /^`([a-z-]+)`\s*(.*)$/;
const GRUND = /^\((.+?)\)\s*(.*)$/;
const TITEL = /^\*\*(.+?)\*\*\s*(?:—\s*)?(.*)$/;

/** Alle Dateien mit dieser Endung unterhalb von dir. */
export async function dateien(dir, endung = '.md') {
  if (!existsSync(dir)) return [];
  const gefunden = [];
  for (const eintrag of await readdir(dir, { withFileTypes: true })) {
    const voll = join(dir, eintrag.name);
    if (eintrag.isDirectory()) gefunden.push(...(await dateien(voll, endung)));
    else if (eintrag.name.endsWith(endung)) gefunden.push(voll);
  }
  return gefunden;
}

/** Titel, Stand und Akzeptanzkriterien aus dem Text einer Spec. */
export function specLesen(inhalt) {
  const zeilen = inhalt.split(/\r?\n/);
  const titel = zeilen.find((z) => z.startsWith('# '))?.slice(2).trim() ?? '(ohne Titel)';
  const stand = inhalt.match(/^\*\*Stand:\*\*\s*(.+)$/m)?.[1].trim() ?? '';

  const kriterien = [];
  let gruppe = '';
  let offen = null;
  let imCode = false;

  for (const zeile of zeilen) {
    // Ein Beispiel im Codeblock ist kein Kriterium.
    if (/^\s*```/.test(zeile)) {
      imCode = !imCode;
      offen = null;
      continue;
    }
    if (imCode) continue;

    const ueberschrift = zeile.match(/^#{2,4}\s+(.*)$/);
    if (ueberschrift) {
      // „### Spielzug" benennt eine Gruppe, „## Akzeptanzkriterien" nicht.
      gruppe = /^#{2}\s/.test(zeile) ? '' : ueberschrift[1].trim();
      offen = null;
      continue;
    }
    const treffer = zeile.match(AC_ZEILE);
    if (treffer) {
      const marker = treffer[2].match(MARKER);
      let status = null;
      let grund = '';
      let kurz = '';
      let text = treffer[2].trim();
      if (marker) {
        status = marker[1];
        text = marker[2].trim();
        const begruendet = text.match(GRUND);
        if (begruendet) {
          grund = begruendet[1].trim();
          text = begruendet[2].trim();
        }
        const benannt = text.match(TITEL);
        if (benannt) {
          kurz = benannt[1].trim();
          text = benannt[2].trim();
        }
      }
      offen = { id: treffer[1], gruppe, status, grund, titel: kurz, text };
      kriterien.push(offen);
      continue;
    }
    // Fortsetzungszeile: eingerückt, kein neuer Punkt.
    if (offen && /^\s{2,}\S/.test(zeile) && !/^\s*-\s/.test(zeile)) {
      offen.text += ' ' + zeile.trim();
      continue;
    }
    if (!zeile.trim()) offen = null;
  }
  return { titel, stand, kriterien };
}

/** Alle Specs unter `wurzel`, geschlüsselt über den relativen Pfad. */
export async function specsLesen(wurzel) {
  const specs = new Map();
  for (const datei of await dateien(wurzel)) {
    if (datei.endsWith('README.md') || datei.endsWith('BOARD.md')) continue;
    const pfad = relative(wurzel, datei).split(sep).join('/');
    specs.set(pfad, { pfad, datei, ...specLesen(await readFile(datei, 'utf8')) });
  }
  return new Map([...specs].sort((a, b) => a[0].localeCompare(b[0])));
}

/** Anzahl je Status. */
export function zaehlen(kriterien) {
  const z = Object.fromEntries(STATUS.map((s) => [s, 0]));
  for (const k of kriterien) if (z[k.status] !== undefined) z[k.status] += 1;
  return z;
}
