# LocalGames

Sammlung kleiner Browserspiele als PWA. Reines Vanilla-JS. **Die App hat
keinen Build, keinen Paketmanager, keine Abhängigkeit** – die Dateien im
Wurzelverzeichnis samt `spiele/`, `icons/`, `schriften/` sind die App.
Ausprobieren: `npx serve -l 4173 .`

Daneben liegen zwei Ordner, die nicht zur App gehören: `specs/` (was sie
können soll) und `pruefung/` (wie das geprüft wird). Nur `pruefung/` hat ein
`package.json`, und nur für Playwright.

## Aufbau

* `app.js` – der **Rahmen**: Dashboard, Router (`#/…`), localStorage,
  Statistik, Sicherung. Kennt kein einziges Spiel.
* `spiele/*.js` – je ein Spiel, meldet sich selbst beim Rahmen an.
  Ausnahmen sind die Werkzeuge: `woerter.js` (Wortliste), `loeser.js`
  (Wördle-Rechner), `begriffe.js` (Wortpaare), `karten.js` (Schafkopf-Blatt
  und Kartenrechner), `runde.js` (alles für Spiele zu mehreren: Sperrschirm,
  geheime Abstimmung, Uhr), `echtzeit.js` (für die Geschicklichkeitsspiele:
  Leinwand, Spielschleife mit festem Takt, Pause bei Blatt oder Hintergrund).
* `index.html` lädt alle Dateien als klassische `<script>`-Tags in fester
  Reihenfolge (Werkzeuge, `app.js`, dann die Spiele) und ruft `Rahmen.los()`.
  Kein `type="module"`, jede Datei ist ein IIFE mit einem globalen Namen.
* `version.js` – nur die Versionsnummer. **Bei jeder Änderung an
  ausgelieferten Dateien `nummer` hochzählen und `stand` setzen**, sonst
  bekommen installierte Geräte den alten Stand. Seite und Service Worker
  lesen dieselbe Datei; die Einstellungen zeigen die Nummer an, mit der die
  Seite geladen wurde.
* `sw.js` – Service Worker. Neue Dateien in `GRUNDBESTAND` eintragen; der
  Lagername kommt aus `version.js`.
* `specs/<bereich>/<id>.md` – je Spiel und für den Rahmen: Zweck,
  **Akzeptanzkriterien mit Status**, Randfälle, Hintergrund. Regeln in
  `specs/README.md`, Überblick im erzeugten `specs/BOARD.md`.
* `pruefung/` – Wächter, E2E-Tests, Board, Bericht. Siehe
  `pruefung/README.md`.

## Ein Spiel hinzufügen

1. `spiele/name.js` anlegen, am Ende `Rahmen.anmelden({ id, name, unter,
   farbe, symbol, starten, auswertung })`.
   `starten(boden, sitzung)` baut die Oberfläche und gibt optional
   `{ ende() }` zurück; `auswertung(partien)` liefert Kennzahlen für die
   Statistik.
2. `<script>` in `index.html` ergänzen.
3. Pfad in `sw.js` (`GRUNDBESTAND`) ergänzen, `version.js` hochzählen.
4. Spec `specs/<bereich>/<id>.md` mit Akzeptanzkriterien anlegen.
5. Zeile in der Spieltabelle im README ergänzen, der Name verlinkt auf die Spec.

Der Wächter meldet jeden vergessenen Schritt. Die Rauchtests nehmen das neue
Spiel ohne Änderung auf.

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

## Specs und Akzeptanzkriterien

* **Abgearbeitet wird das Kriterium, nicht die Spec.** Jedes trägt Status
  und Kurztitel: `- **AC-7** \`fertig\` **Erster Klick sicher** — …`.
  Status: `offen` · `geplant` · `in-arbeit` · `fertig` · `zurueckgestellt`
  (mit Grund in Klammern).
* Wer Verhalten ändert, ändert die Spec mit: neues Kriterium mit der nächsten
  freien Nummer, Status nachziehen. Nummern werden nie neu vergeben.
* **`fertig` nur, was am Code oder im Browser nachvollzogen ist.** Was die
  Spec verspricht und der Code nicht hält, ist `offen` – mit einem Satz, was
  heute stattdessen passiert.
* Ein behobener Fehler, der eine Lücke in der Anforderung gezeigt hat,
  hinterlässt ein Kriterium.
* `**Stand:**`-Zeilen, Bereichstabellen und `specs/BOARD.md` sind erzeugt:
  `node pruefung/skripte/spec-board.mjs`, dann mitcommitten.

## Selbst prüfen

Nach jeder Änderung, bevor „fertig" gesagt wird:

* `node pruefung/pruefen.mjs` – Wächter, E2E-Tests auf Handy und Laptop,
  Bericht. Rot heißt nicht fertig. `--ohne-e2e` für die schnelle Runde
  (Sekunden), `-- -g Minenfeld` für einen Teil der Tests.
  Einmalig vorher: `npm --prefix pruefung install`.
* `node pruefung/ansehen.mjs "#/spiel/<id>" --geraet laptop --klick "…"` –
  eine Ansicht im echten Browser als Bild, samt Konsolenfehlern und allem,
  was seitlich aus dem Fenster ragt. Für jede sichtbare Änderung: Bild
  ansehen, auf `handy` und einem flachen Fenster (`1366x700`).
* Die E2E-Tests sind Rauchtests für den Rahmen und die Verträge, keine
  Regeltests der Spiele. Ein neuer Test gehört dazu, wenn er einen Vertrag
  oder einen behobenen Fehler festhält. Kein `.skip`, kein `.only`, keine
  Wiederholung – ein Test, der erst beim zweiten Mal grün wird, ist rot.
* Spielregeln, Rechner und Erzeuger werden weiter mit Wegwerf-Skripten gegen
  die Spieldatei geprüft (die Module hängen an `globalThis`) und im
  Commit-Rumpf mit Zahlen belegt.
* Der Bericht `pruefung/bericht/index.html` zeigt Kriterien, letzten Lauf
  und Fortschritt. Ergebnisse und Bericht werden nicht eingecheckt.

## Stil

* Oberfläche, Bezeichner und Kommentare sind **deutsch** (`spieler`,
  `zeichnen`, `raetsel`). Kommentare erklären das Warum, nicht das Was.
* Rätsel-Spiele sollen ohne Raten lösbar sein und ihre Hinweise begründen
  können; der Hinweisgeber schaut nicht in die Lösung.
* Commits: deutscher Betreff im Aussagesatz, ohne Umlaute (`ae/oe/ue/ss`),
  Rumpf erklärt Grund, Abwägung und was geprüft wurde.
