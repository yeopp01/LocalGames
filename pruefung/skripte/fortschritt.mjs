/* FORTSCHRITT: Zeilen, Akzeptanzkriterien und Versionsnummer zu Stichtagen.

   Alles kommt aus der Git-Historie, damit die Reihe nicht gepflegt werden
   muss und nicht lügen kann – Stichtag ist jeweils der letzte Commit des
   Tages. Die Zeilen zählt `git log --numstat` mit (hinzugefügt minus
   gelöscht, aufsummiert); Binärdateien meldet Git dort als "-", sie fallen
   heraus. Kriterien und Versionsnummer liest `git cat-file --batch` aus dem
   Stand des jeweiligen Commits, ohne etwas auszuchecken.

   Unter zwei Tagen Historie wäre ein Tag nur ein Punkt – dann sind es
   Stunden. */

import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { specLesen, STATUS } from './spec-leser.mjs';

const lauf = promisify(execFile);

/** Zeilenklassen in der Reihenfolge, in der sie gestapelt werden. */
export const KLASSEN = [
  { id: 'app', name: 'App', farbe: 'gelb' },
  { id: 'pruefung', name: 'Prüfung', farbe: 'blau' },
  { id: 'doku', name: 'Doku', farbe: 'violett' },
  { id: 'werkzeug', name: 'Werkzeug', farbe: 'grau' },
];

const AUSSEN = [/(^|\/)package-lock\.json$/, /(^|\/)node_modules\//, /^specs\/BOARD\.md$/];

/** Einordnung einer Datei. Doku vor Prüfung vor App. */
export function klasse(pfad) {
  if (AUSSEN.some((r) => r.test(pfad))) return null;
  if (/\.md$/.test(pfad)) return 'doku';
  if (/^pruefung\/e2e\//.test(pfad) || /^pruefung\/waechter\.mjs$/.test(pfad)) return 'pruefung';
  if (/^(index\.html|app\.js|styles\.css|sw\.js|version\.js|manifest\.webmanifest)$/.test(pfad) || /^spiele\//.test(pfad)) return 'app';
  return 'werkzeug';
}

export const TAKTE = {
  stunde: {
    name: 'Stunde',
    eimer: (iso) => iso.slice(0, 13) + ':00',
    zeige: (s) => s.slice(8, 10) + '.' + s.slice(5, 7) + '. ' + s.slice(11) + ' Uhr',
    kurz: (s) => s.slice(11),
  },
  tag: {
    name: 'Tag',
    eimer: (iso) => iso.slice(0, 10),
    zeige: (s) => s.slice(8, 10) + '.' + s.slice(5, 7) + '.' + s.slice(0, 4),
    kurz: (s) => s.slice(8, 10) + '.' + s.slice(5, 7) + '.',
  },
};

async function commits(cwd) {
  const { stdout } = await lauf('git', ['log', '--reverse', '--no-renames', '--numstat', '--format=@@%H %cI'], {
    cwd,
    maxBuffer: 1 << 28,
  });
  const liste = [];
  for (const zeile of stdout.split('\n')) {
    if (zeile.startsWith('@@')) {
      const [sha, iso] = zeile.slice(2).split(' ');
      liste.push({ sha, iso, netto: {} });
      continue;
    }
    const teile = zeile.split('\t');
    if (teile.length < 3 || !liste.length) continue;
    const [plus, minus, pfad] = teile;
    if (plus === '-') continue;
    const k = klasse(pfad);
    if (!k) continue;
    const netto = liste.at(-1).netto;
    netto[k] = (netto[k] ?? 0) + Number(plus) - Number(minus);
  }
  return liste;
}

/** Mehrere Blobs in einem Rutsch; ein fehlender kommt als null zurück. */
function blobs(cwd, anfragen) {
  return new Promise((fertig, scheitern) => {
    const kind = spawn('git', ['cat-file', '--batch'], { cwd });
    const stuecke = [];
    kind.stdout.on('data', (b) => stuecke.push(b));
    kind.on('error', scheitern);
    kind.on('close', () => {
      const roh = Buffer.concat(stuecke);
      const inhalte = [];
      let pos = 0;
      while (pos < roh.length) {
        const umbruch = roh.indexOf(10, pos);
        if (umbruch < 0) break;
        const kopf = roh.subarray(pos, umbruch).toString('utf8').split(' ');
        pos = umbruch + 1;
        if (kopf.at(-1) === 'missing') {
          inhalte.push(null);
          continue;
        }
        const groesse = Number(kopf[2]);
        inhalte.push(roh.subarray(pos, pos + groesse).toString('utf8'));
        pos += groesse + 1;
      }
      fertig(inhalte);
    });
    kind.stdin.end(anfragen.join('\n') + '\n');
  });
}

async function standBei(cwd, sha) {
  const { stdout } = await lauf('git', ['ls-tree', '-r', '--name-only', sha, '--', 'specs/'], { cwd });
  const pfade = stdout.split('\n').filter((p) => p.endsWith('.md') && !/(^|\/)(README|BOARD)\.md$/.test(p));
  const [version, ...inhalte] = await blobs(cwd, [`${sha}:version.js`, ...pfade.map((p) => `${sha}:${p}`)]);
  const status = Object.fromEntries(STATUS.map((s) => [s, 0]));
  let gesamt = 0;
  for (const inhalt of inhalte) {
    if (inhalt == null) continue;
    for (const k of specLesen(inhalt).kriterien) {
      gesamt += 1;
      status[STATUS.includes(k.status) ? k.status : 'offen'] += 1;
    }
  }
  return {
    specs: pfade.length,
    gesamt,
    status,
    version: version ? Number(/nummer:\s*(\d+)/.exec(version)?.[1]) || null : null,
  };
}

/** Die Reihe der Stichtage, oder null ohne Historie. */
export async function fortschritt(cwd) {
  const liste = await commits(cwd);
  if (!liste.length) return null;
  const spanne = (Date.parse(liste.at(-1).iso) - Date.parse(liste[0].iso)) / 86_400_000;
  const takt = spanne >= 2 ? 'tag' : 'stunde';

  const summe = Object.fromEntries(KLASSEN.map((k) => [k.id, 0]));
  const eimer = new Map();
  for (const c of liste) {
    for (const [k, n] of Object.entries(c.netto)) summe[k] += n;
    const schluessel = TAKTE[takt].eimer(c.iso);
    const bisher = eimer.get(schluessel);
    eimer.set(schluessel, { sha: c.sha, loc: { ...summe }, commits: (bisher?.commits ?? 0) + 1 });
  }

  const punkte = [];
  let vorher = 0;
  for (const [datum, s] of eimer) {
    const gesamtLoc = KLASSEN.reduce((n, k) => n + s.loc[k.id], 0);
    const stand = await standBei(cwd, s.sha);
    punkte.push({
      datum,
      anzeige: TAKTE[takt].zeige(datum),
      kurz: TAKTE[takt].kurz(datum),
      sha: s.sha.slice(0, 7),
      commits: s.commits,
      loc: { ...s.loc, gesamt: gesamtLoc },
      zuwachs: gesamtLoc - vorher,
      ...stand,
      quote: stand.gesamt ? Math.round((stand.status.fertig / stand.gesamt) * 100) : 0,
    });
    vorher = gesamtLoc;
  }
  return { takt, punkte };
}
