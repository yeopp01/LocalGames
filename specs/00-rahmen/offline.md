# Offline und Versionen

**Datei:** [`app.js`](../../app.js), [`sw.js`](../../sw.js), [`version.js`](../../version.js), [`manifest.webmanifest`](../../manifest.webmanifest)
**Stand:** 14/14 fertig

## Zweck

Einmal geladen, startet LocalGames ohne Netz vom Icon. Ein Service Worker legt
dafür den ganzen Bestand auf dem Gerät ab. Weil das Gerät dann eine alte
Fassung behalten kann, trägt jede Auslieferung eine Nummer, die man in den
Einstellungen sieht und mit dem Server abgleichen kann.

## Akzeptanzkriterien

### Offline-Speicher

- **AC-1** `fertig` **Worker mit Nummer angemeldet** — Wird die Seite über
  `http://` oder `https://` geladen, meldet sie nach dem Laden den Service
  Worker als `sw.js?v=<nummer>` mit `updateViaCache: 'none'` an. Scheitert die
  Anmeldung oder fehlt die Unterstützung, läuft die App ohne ihn.
- **AC-2** `fertig` **Grundbestand wird abgelegt** — Bei der Installation legt
  der Worker jede Datei aus `GRUNDBESTAND` – Seite, Stil, alle Skripte,
  Manifest, Icons, Schriften – frisch vom Server (am Browser-Cache vorbei) im
  Lager `localgames-v<nummer>` ab. Fehlt eine Datei, bricht die Installation
  nicht ab.
- **AC-3** `fertig` **Alles Geladene im Grundbestand** — Jedes Skript, das
  `index.html` lädt, jede Schrift aus `styles.css` und jedes Icon aus Manifest
  und Seite steht in `GRUNDBESTAND`.
- **AC-4** `fertig` **Lager ist ein Jahrgang** — Alle Antworten kommen aus dem
  Lager des aktiven Workers, jede Navigation bekommt dessen `index.html`. Ein
  Lager wird nach der Installation nicht mehr verändert; aktiviert sich ein
  neuer Worker, sind alle anderen Lager gelöscht.
- **AC-5** `fertig` **Start ohne Netz** — Nach einem vollständigen Laden
  startet die App im Flugmodus, auch unter einer tiefen Adresse wie
  `#/spiel/minen`. Eine nicht abgelegte Anfrage der eigenen Seite beantwortet
  der Worker offline mit der Startseite.
- **AC-6** `fertig` **Fremdes bleibt unberührt** — Anfragen an andere Server
  (der Zähler) und alles außer `GET` gehen am Worker vorbei.

### Version

- **AC-7** `fertig` **Nummer an einer Stelle** — `version.js` setzt
  `VERSION = { nummer, stand }`. Seite und Worker lesen diese Datei; der
  Lagername kommt aus der Adresse des Workers und nur ersatzweise aus dem
  Import.
- **AC-8** `fertig` **Version in den Einstellungen** — Unter „Nach einer neuen
  Version suchen" steht „Version <nummer>, Stand <stand>" aus dem Code, mit dem
  die Seite geladen wurde, nicht aus dem Lager. Fehlt `version.js`, steht dort
  „Version unbekannt".
- **AC-9** `fertig` **Suche sperrt Doppeltipp** — Ein Tipp auf „Nach einer
  neuen Version suchen" schreibt „Sucht …" in die Zeile, holt `version.js` am
  Lager und Browser-Cache vorbei vom Server und nimmt bis zum Ergebnis keinen
  weiteren Tipp an.
- **AC-10** `fertig` **Neueste Version gemeldet** — Nennt der Server keine
  höhere Nummer, steht in der Zeile „Version <nummer> ist die neueste." und ein
  Toast meldet „Schon auf dem neuesten Stand."
- **AC-11** `fertig` **Server nicht erreichbar** — Ist der Server nicht
  erreichbar oder die Antwort ohne lesbare Nummer, zeigt die Zeile wieder die
  geladene Version und ein Toast meldet „Nicht erreichbar – geladen ist Version
  <nummer>."
- **AC-12** `fertig` **Neue Version lädt** — Nennt der Server eine höhere
  Nummer, steht in der Zeile „Version <neu> gefunden, lädt …", ein Toast meldet
  „Version <neu> wird geladen.", der Worker `sw.js?v=<neu>` wird angemeldet,
  und die Seite lädt neu, sobald er übernommen hat – spätestens nach acht
  Sekunden. Nach dem Neuladen nennt die Zeile die neue Nummer.

### Installation

- **AC-13** `fertig` **Installieren nur wenn möglich** — Die Zeile „Auf dem
  Startbildschirm ablegen" erscheint im Einstellungsblatt erst, wenn der
  Browser die Installation anbietet. Ein Tipp öffnet dessen Dialog; danach
  verschwindet die Zeile, egal wie entschieden wurde.
- **AC-14** `fertig` **Startet wie eine App** — Das Manifest nennt „LocalGames",
  startet unter `./` im Vollbild ohne Browserleiste (`standalone`), hochkant,
  mit Icons in 192 und 512 Pixeln und einem maskierbaren Icon.

## Randfälle

| #    | Fall                                                   | Erwartetes Verhalten                                                   |
| ---- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| RF-1 | `index.html` per Doppelklick geöffnet                  | Kein Worker, die Spiele laufen; die Suche meldet „Nicht erreichbar".   |
| RF-2 | Versionssuche im Flugmodus                             | „Nicht erreichbar – geladen ist Version <nummer>.", nichts lädt neu.   |
| RF-3 | Server nennt eine kleinere Nummer (Rückbau)            | „ist die neueste", es wird nichts angemeldet.                          |
| RF-4 | Neuer Worker übernimmt nicht                           | Die Seite lädt nach acht Sekunden trotzdem neu.                        |
| RF-5 | Eine Datei fehlt im `GRUNDBESTAND`                     | Online kommt sie aus dem Netz, offline fehlt sie.                      |
| RF-6 | Browser bietet keine Installation an (iOS, installiert) | Die Zeile zum Ablegen bleibt verborgen.                               |

## Hintergrund

Wenn an einer Datei etwas geändert wird, in `version.js` die `nummer`
hochzählen und `stand` setzen. Sonst zeigt das Handy weiter die alte Version
aus seinem Offline-Speicher.

Welche Version gerade läuft, steht in den Einstellungen unter „Nach einer
neuen Version suchen". Die Zahl kommt aus dem geladenen Code selbst, nicht
vom Offline-Speicher – der kann schon weiter sein, während die offene Seite
noch die alten Dateien ausführt. Der Knopf holt `version.js` frisch vom
Server, vergleicht die Nummern und schreibt das Ergebnis in dieselbe Zeile:
entweder „ist die neueste" oder er holt den neuen Bestand und lädt neu,
sobald der Worker übernommen hat.

Der Offline-Speicher ist dabei ein Jahrgang: Ein Lager wird bei der
Installation gefüllt und danach nicht mehr angefasst, alles kommt aus
demselben. Sonst träfe nach einem Ausrollen frisches HTML auf alten Code.

**Warum die Nummer in der Adresse des Workers steht.** Ein Service Worker
erneuert sich nur, wenn sich sein *Skript* ändert. Die Nummer stand aber lange
nicht in `sw.js`, sondern in der davon importierten `version.js` — und
eingebundene Skripte holt der Browser bei der Prüfung aus dem HTTP-Cache
(`updateViaCache` steht von Haus aus auf `'imports'`). GitHub Pages liefert mit
`max-age=600`. Zehn Minuten lang verglich der Browser also gegen eine alte
`version.js`, fand keinen Unterschied und installierte gar nichts. Auf dem
Gerät sah das aus, als bräche die Aktualisierung ab: Der Knopf meldete eine
neue Version, lud neu — und alles kam wieder aus dem alten Lager.

Angemeldet wird der Worker deshalb als `sw.js?v=<nummer>`, mit
`updateViaCache: 'none'`. Die Adresse eines Workers kommt nie aus dem Cache;
ist die Nummer darin, ist jede Version schlicht ein anderes Skript, und es gibt
nichts zu vergleichen. Das Lager benennt sich aus derselben Adresse und nur
ersatzweise aus dem Import — sonst bekäme es womöglich den Namen einer alten
Version. Der Knopf meldet zusätzlich ausdrücklich die Nummer an, die der Server
nennt, statt nur `update()` auf der alten Adresse aufzurufen.

Die Nummer steht damit weiterhin an genau einer Stelle: in `version.js`.
