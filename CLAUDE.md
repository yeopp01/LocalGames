# LocalGames

Sammlung kleiner Browserspiele als PWA. Reines Vanilla-JS, **kein Build,
kein Paketmanager, keine Abhängigkeit** – die Dateien im Repo sind die App.
Ausprobieren: `npx serve -l 4173 .`

## Aufbau

* `app.js` – der **Rahmen**: Dashboard, Router (`#/…`), localStorage,
  Statistik, Sicherung. Kennt kein einziges Spiel.
* `spiele/*.js` – je ein Spiel, meldet sich selbst beim Rahmen an.
  Ausnahmen sind die Werkzeuge: `woerter.js` (Wortliste), `loeser.js`
  (Wördle-Rechner), `begriffe.js` (Wortpaare), `runde.js` (alles für
  Spiele zu mehreren: Sperrschirm, geheime Abstimmung, Uhr).
* `index.html` lädt alle Dateien als klassische `<script>`-Tags in fester
  Reihenfolge (Werkzeuge, `app.js`, dann die Spiele) und ruft `Rahmen.los()`.
  Kein `type="module"`, jede Datei ist ein IIFE mit einem globalen Namen.
* `sw.js` – Service Worker. **Bei jeder Änderung an ausgelieferten Dateien
  die Zahl in `LAGER` hochzählen** und neue Dateien in `GRUNDBESTAND`
  eintragen, sonst bekommen installierte Geräte den alten Stand.

## Ein Spiel hinzufügen

1. `spiele/name.js` anlegen, am Ende `Rahmen.anmelden({ id, name, unter,
   farbe, symbol, starten, auswertung })`.
   `starten(boden, sitzung)` baut die Oberfläche und gibt optional
   `{ ende() }` zurück; `auswertung(partien)` liefert Kennzahlen für die
   Statistik.
2. `<script>` in `index.html` ergänzen.
3. Pfad in `sw.js` (`GRUNDBESTAND`) ergänzen, `LAGER` hochzählen.
4. Zeile in der Tabelle im README ergänzen.

Die `sitzung` ist die einzige Verbindung zum Rahmen: `unter`, `werkzeuge`,
`toast`, `blatt`/`blattZu`, `merken`/`erinnert`/`vergessen` (laufender
Spielstand), `notieren`/`partien` (Statistik), `zurueck`, `el`, `dauerText`.

## Verträge, die leicht kaputtgehen

* `notieren({ gewonnen, … })`: `gewonnen` ist **dreiwertig** – `true`,
  `false` oder gar nicht gesetzt. Ohne das Feld zählt die Partie als
  gespielt (Spielzeit, Kalender, Tagesserie), aber nicht in der Siegquote.
  Alles, was quotet, prüft `typeof p.gewonnen === 'boolean'`.
* `ohneSiege: true` am Spiel ist nur Anzeige („Runden" statt „Partien").
* Auswertungen müssen leere und lückenhafte Partienlisten vertragen –
  eine eingelesene Sicherung kann von einem älteren Stand stammen.
* Alles liegt in `localStorage` unter `localgames.v1`. Nach draußen geht
  einzig der anonyme Aufrufzähler (GoatCounter) in `app.js`/`index.html`.

## Stil

* Oberfläche, Bezeichner und Kommentare sind **deutsch** (`spieler`,
  `zeichnen`, `raetsel`). Kommentare erklären das Warum, nicht das Was.
* Rätsel-Spiele sollen ohne Raten lösbar sein und ihre Hinweise begründen
  können; der Hinweisgeber schaut nicht in die Lösung.
* Commits: deutscher Betreff im Aussagesatz, ohne Umlaute (`ae/oe/ue/ss`),
  Rumpf erklärt Grund, Abwägung und was geprüft wurde.
* Tests gibt es nicht im Repo. Was geprüft werden muss, wird als
  Wegwerf-Skript gegen die Spieldatei laufen gelassen (die Module hängen
  an `globalThis`) und im Commit-Rumpf mit Zahlen belegt.
