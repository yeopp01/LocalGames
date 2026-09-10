/* Liefert das Repository für die Tests aus – ohne Paket.

   Der Prüfstand soll dieselbe App sehen, die GitHub Pages ausliefert: die
   Dateien, wie sie im Arbeitsbaum liegen, ohne Build dazwischen. `npx serve`
   ginge auch, holt sich aber beim ersten Aufruf ein Paket aus dem Netz und
   leitet `/index.html` auf `/` um – beides soll im Test nicht mitspielen.

   Aufruf: node pruefung/server.mjs [port]   (Vorgabe 4317) */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.argv[2] || process.env.PRUEF_PORT || 4317);

const ARTEN = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (anfrage, antwort) => {
  let pfad;
  try {
    pfad = decodeURIComponent(new URL(anfrage.url, 'http://pruefstand').pathname);
  } catch {
    antwort.writeHead(400).end();
    return;
  }
  let datei = normalize(join(WURZEL, pfad));
  if (datei !== WURZEL && !datei.startsWith(WURZEL + sep)) {
    antwort.writeHead(403).end();
    return;
  }
  try {
    if ((await stat(datei)).isDirectory()) datei = join(datei, 'index.html');
    const inhalt = await readFile(datei);
    antwort.writeHead(200, {
      'Content-Type': ARTEN[extname(datei)] || 'application/octet-stream',
      // Wie GitHub Pages cachen wäre näher an der Wirklichkeit, macht aber
      // jeden zweiten Lauf von einem alten Stand abhängig. Den Cache-Fall
      // prüft der Offline-Test über das Lager des Service Workers.
      'Cache-Control': 'no-cache',
    });
    antwort.end(anfrage.method === 'HEAD' ? undefined : inhalt);
  } catch {
    antwort.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('nicht gefunden');
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`LocalGames unter http://127.0.0.1:${PORT}/`);
});
