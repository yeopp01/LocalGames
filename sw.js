/* Service Worker: legt die App auf dem Gerät ab, damit sie offline startet.
   Beim Ausrollen einer neuen Fassung die Zahl in LAGER hochzählen. */
const LAGER = 'localgames-v6';

const GRUNDBESTAND = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './spiele/woerter.js',
  './spiele/loeser.js',
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
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(LAGER)
      // Einzeln, damit eine fehlende Datei nicht die ganze Installation kippt.
      .then((lager) => Promise.all(GRUNDBESTAND.map((pfad) => lager.add(pfad).catch(() => {}))))
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

  const url = new URL(anfrage.url);

  // Schriften von Google: einmal holen, danach aus dem Lager.
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com')) {
    e.respondWith(
      caches.match(anfrage).then((treffer) =>
        treffer ||
        fetch(anfrage).then((antwort) => {
          const kopie = antwort.clone();
          caches.open(LAGER).then((lager) => lager.put(anfrage, kopie)).catch(() => {});
          return antwort;
        }).catch(() => new Response('', { status: 504 }))
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Seitenaufrufe: erst das Netz für frische Fassungen, sonst das Lager.
  if (anfrage.mode === 'navigate') {
    e.respondWith(
      fetch(anfrage)
        .then((antwort) => {
          const kopie = antwort.clone();
          caches.open(LAGER).then((lager) => lager.put('./index.html', kopie)).catch(() => {});
          return antwort;
        })
        .catch(() => caches.match('./index.html').then((t) => t || caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(anfrage).then((treffer) => {
      if (treffer) {
        // Im Hintergrund auffrischen, damit Änderungen nachrücken.
        fetch(anfrage).then((antwort) => {
          if (antwort && antwort.ok) {
            caches.open(LAGER).then((lager) => lager.put(anfrage, antwort)).catch(() => {});
          }
        }).catch(() => {});
        return treffer;
      }
      return fetch(anfrage);
    })
  );
});
