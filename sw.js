/* Service Worker: legt die App auf dem Gerät ab, damit sie offline startet.
   Die Versionsnummer steht in version.js und gilt für beide Seiten. */
/* Die Nummer steht in der Adresse dieses Workers - sw.js?v=32 - und nur
   ersatzweise in der importierten version.js.

   Frueher stand hier, eingebundene Skripte zaehlten bei der
   Aktualisierungspruefung mit: aendere version.js, und der Worker gelte als
   neu. Das stimmt nur halb. Der Browser holt eingebundene Skripte beim
   Pruefen aus dem HTTP-Cache (updateViaCache steht von Haus aus auf
   'imports'), und GitHub Pages liefert mit max-age=600. Zehn Minuten lang
   verglich der Browser also gegen eine alte version.js, fand keinen
   Unterschied und installierte gar nichts - auf dem Geraet sah das aus, als
   braeche die Aktualisierung ab.

   Die Adresse des Workers dagegen kommt nie aus dem Cache. Steht die Nummer
   darin, ist jede Version ein anderes Skript, und es gibt nichts zu
   vergleichen. */
importScripts('./version.js');
const NUMMER = new URL(self.location.href).searchParams.get('v')
  || (typeof VERSION === 'object' ? String(VERSION.nummer) : '0');
const LAGER = 'localgames-v' + NUMMER;

const GRUNDBESTAND = [
  './',
  './index.html',
  './version.js',
  './styles.css',
  './app.js',
  './spiele/woerter.js',
  './spiele/loeser.js',
  './spiele/begriffe.js',
  './spiele/karten.js',
  './spiele/runde.js',
  './spiele/echtzeit.js',
  './spiele/tiere.js',
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
  './spiele/pins.js',
  './spiele/verraeter.js',
  './spiele/bombe.js',
  './spiele/wahrheiten.js',
  './spiele/amehesten.js',
  './spiele/schafkopf.js',
  './spiele/snake.js',
  './spiele/impact.js',
  './spiele/flappy.js',
  './spiele/doodle.js',
  './spiele/bubbles.js',
  './spiele/pinball.js',
  './spiele/tierstimmen.js',
  './spiele/futter.js',
  './spiele/horch.js',
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
  './toene/affe.mp3',
  './toene/biene.mp3',
  './toene/elefant.mp3',
  './toene/ente.mp3',
  './toene/eule.mp3',
  './toene/frosch.mp3',
  './toene/hahn.mp3',
  './toene/huhn.mp3',
  './toene/hund.mp3',
  './toene/katze.mp3',
  './toene/knabbern.mp3',
  './toene/kuh.mp3',
  './toene/loewe.mp3',
  './toene/pferd.mp3',
  './toene/schaf.mp3',
  './toene/schwein.mp3',
  './toene/vogel.mp3',
  './toene/wolf.mp3',
  './toene/ziege.mp3',
  './toene/esel.mp3',
  './toene/gans.mp3',
  './toene/grille.mp3',
  './toene/hirsch.mp3',
  './toene/hund-2.mp3',
  './toene/hund-3.mp3',
  './toene/katze-2.mp3',
  './toene/katze-3.mp3',
  './toene/krokodil.mp3',
  './toene/papagei.mp3',
  './toene/pfau.mp3',
  './toene/pferd-2.mp3',
  './toene/pinguin.mp3',
  './toene/taube.mp3',
  './toene/tiger.mp3',
  './toene/truthahn.mp3',
  './toene/wal.mp3',
  './toene/name-affe.mp3',
  './toene/name-biene.mp3',
  './toene/name-elefant.mp3',
  './toene/name-ente.mp3',
  './toene/name-esel.mp3',
  './toene/name-eule.mp3',
  './toene/name-frosch.mp3',
  './toene/name-gans.mp3',
  './toene/name-grille.mp3',
  './toene/name-hahn.mp3',
  './toene/name-hirsch.mp3',
  './toene/name-huhn.mp3',
  './toene/name-hund.mp3',
  './toene/name-katze.mp3',
  './toene/name-krokodil.mp3',
  './toene/name-kuh.mp3',
  './toene/name-loewe.mp3',
  './toene/name-papagei.mp3',
  './toene/name-pfau.mp3',
  './toene/name-pferd.mp3',
  './toene/name-pinguin.mp3',
  './toene/name-schaf.mp3',
  './toene/name-schwein.mp3',
  './toene/name-taube.mp3',
  './toene/name-tiger.mp3',
  './toene/name-truthahn.mp3',
  './toene/name-vogel.mp3',
  './toene/name-wal.mp3',
  './toene/name-wolf.mp3',
  './toene/name-ziege.mp3',
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
