/* Service Worker: legt die App auf dem Gerät ab, damit sie offline startet.
   Die Versionsnummer steht in version.js und gilt für beide Seiten. */
// Eingebundene Skripte zaehlen bei der Aktualisierungspruefung des Workers
// mit: aendert sich version.js, gilt auch dieser Worker als neu.
importScripts('./version.js');
const LAGER = 'localgames-v' + VERSION.nummer;

const GRUNDBESTAND = [
  './',
  './index.html',
  './version.js',
  './styles.css',
  './app.js',
  './spiele/woerter.js',
  './spiele/loeser.js',
  './spiele/begriffe.js',
  './spiele/runde.js',
  './spiele/wordle.js',
  './spiele/sudoku.js',
  './spiele/minen.js',
  './spiele/zweitausend.js',
  './spiele/galgen.js',
  './spiele/viergewinnt.js',
  './spiele/nonogramm.js',
  './spiele/mastermind.js',
  './spiele/tango.js',
  './spiele/queens.js',
  './spiele/zip.js',
  './spiele/verraeter.js',
  './spiele/bombe.js',
  './spiele/wahrheiten.js',
  './spiele/amehesten.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './schriften/bricolage-400-800-latin-ext.woff2',
  './schriften/bricolage-400-800-latin.woff2',
  './schriften/dm-mono-400-latin-ext.woff2',
  './schriften/dm-mono-400-latin.woff2',
  './schriften/dm-mono-500-latin-ext.woff2',
  './schriften/dm-mono-500-latin.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(LAGER)
      // Einzeln, damit eine fehlende Datei nicht die ganze Installation kippt.
      // 'reload' geht am Browser-Cache vorbei: sonst landet beim Ausrollen
      // womoeglich eine alte Datei im neuen Lager und bleibt dort liegen.
      .then((lager) => Promise.all(GRUNDBESTAND.map(
        (pfad) => lager.add(new Request(pfad, { cache: 'reload' })).catch(() => {})
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== LAGER).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const anfrage = e.request;
  if (anfrage.method !== 'GET') return;
  if (new URL(anfrage.url).origin !== self.location.origin) return;

  /* Ein Lager ist ein Jahrgang und wird nach der Installation nicht mehr
     angefasst. Alles kommt aus demselben - index.html, app.js, die Spiele.
     Vorher holte die Seite frisches HTML aus dem Netz, waehrend die Skripte
     aus dem Lager kamen: Nach einem Ausrollen traf dann neues HTML auf alten
     Code, und was das eine kannte, gab es im anderen noch nicht. Neues gibt
     es erst, wenn ein neuer Worker sein eigenes Lager gefuellt hat - dann
     aber vollstaendig. */
  const ziel = anfrage.mode === 'navigate' ? './index.html' : anfrage;

  e.respondWith(
    caches.match(ziel)
      .then((treffer) => treffer || fetch(anfrage))
      .catch(() => caches.match('./'))
  );
});
