# Auswahl und Navigation

**Datei:** [`app.js`](../../app.js), [`index.html`](../../index.html)
**Stand:** 14/14 fertig

## Zweck

Der Einstieg in die App: ein Dashboard mit einer Kachel je Spiel, darunter ein
kurzer Blick auf den eigenen Bestand. Dazu die Wege zwischen Auswahl, Spiel und
Statistik – über Adressen, die man neu laden und mit dem Zurück des Browsers
oder des Handys durchlaufen kann – und die gemeinsame Kopfzeile, Meldung und
Dialog, die alle Spiele benutzen.

## Akzeptanzkriterien

### Dashboard

- **AC-1** `fertig` **Eine Kachel je Spiel** — Jedes angemeldete Spiel
  erscheint als Kachel in der Reihenfolge der Anmeldung, mit Symbol, Name,
  Unterzeile und seiner Farbe. Ein Tipp öffnet das Spiel unter `#/spiel/<id>`.
- **AC-2** `fertig` **Fußzeile nennt den Bestand** — Unten auf der Kachel steht
  „Noch nie gespielt", solange es keine Partie gibt; „1 Runde" bzw. „n Runden",
  wenn keine Partie ein Urteil (`gewonnen` als `true`/`false`) trägt; sonst
  „1 Partie · x % gewonnen" bzw. „n Partien · x % gewonnen", die Quote nur über
  die Partien mit Urteil.
- **AC-3** `fertig` **Hinweis bei leerem Bestand** — Liegt noch gar keine
  Partie vor, steht unter den Kacheln „Such dir etwas aus. Alles läuft auf
  diesem Gerät – auch ohne Internet." und kein Überblick-Streifen.
- **AC-4** `fertig` **Überblick-Streifen unter Kacheln** — Sobald eine Partie
  existiert, zeigt ein Streifen unter den Kacheln die Zahl aller Partien, die
  Siegquote („gewonnen"), die Tagesserie („Tage Serie") und die Partien von
  heute („heute"). Ein Tipp darauf öffnet `#/statistik`.
- **AC-5** `fertig` **Tagesgruß nach Uhrzeit** — Unter „LocalGames" steht nach
  der Ortszeit: vor 5 Uhr „Noch wach?", vor 11 Uhr „Guten Morgen.", vor 18 Uhr
  „Kleine Pause?", danach „Guten Abend.".

### Adressen und Verlauf

- **AC-6** `fertig` **Jede Ansicht hat Adresse** — `#/` (oder keine Adresse)
  zeigt die Auswahl, `#/spiel/<id>` das Spiel, `#/statistik` die
  Gesamtstatistik, `#/statistik/<id>` die Statistik eines Spiels. Neuladen oder
  ein direkter Aufruf öffnet dieselbe Ansicht.
- **AC-7** `fertig` **Unbekanntes führt zur Auswahl** — Eine Adresse mit einer
  `id`, die kein angemeldetes Spiel trägt (`#/spiel/…` wie `#/statistik/…`),
  und jede andere unbekannte Adresse zeigen die Auswahl, ohne Fehler.
- **AC-8** `fertig` **Zurück-Knopf führt zur Auswahl** — Der Pfeil links in
  der Kopfzeile ist in der Auswahl verborgen und überall sonst sichtbar. Er
  führt immer zur Auswahl, auch aus der Statistik eines Spiels.
- **AC-9** `fertig` **Browser-Zurück folgt dem Verlauf** — Jeder Wechsel der
  Ansicht legt einen Eintrag im Verlauf an. Zurück und Vor des Browsers (oder
  die Zurück-Geste des Handys) zeigen die jeweils vorige bzw. nächste Ansicht.
- **AC-10** `fertig` **Verlassen beendet das Spiel** — Wer ein Spiel auf
  irgendeinem Weg verlässt (Zurück-Knopf, Browser-Zurück, Statistik-Knopf,
  Knöpfe des Spiels), löst das `ende()` des Spiels genau einmal aus, bevor die
  nächste Ansicht erscheint.

### Kopfzeile, Meldung, Blatt

- **AC-11** `fertig` **Kopfzeile je Ansicht** — Die Kopfzeile trägt Titel und
  Unterzeile der Ansicht („LocalGames" mit Tagesgruß, der Spielname, „Statistik"
  mit „Alles, was du gespielt hast"). Die Werkzeuge eines Spiels stehen vor dem
  Statistik- und dem Einstellungsknopf und verschwinden beim Wechsel der
  Ansicht.
- **AC-12** `fertig` **Kurze Meldung unten** — Eine Meldung (Toast) erscheint
  unten und verschwindet nach knapp drei Sekunden von selbst. Eine neue Meldung
  ersetzt die alte und bekommt ihre volle Zeit.
- **AC-13** `fertig` **Blatt von unten** — Ein Blatt zeigt Titel, einen Text
  oder ein beliebiges Element und eine Knopfleiste; ohne Angabe gibt es einen
  Knopf „Fertig". Jeder Knopf schließt das Blatt, bevor seine Aktion läuft; ein
  Tipp auf den abgedunkelten Hintergrund schließt es ebenfalls.
- **AC-14** `fertig` **Blätter schließen beim Verlassen** — Wechselt die
  Ansicht, während ein Blatt eines Spiels oder das Einstellungsblatt offen ist
  – über einen Knopf oder die Zurück-Geste –, schließt sich das Blatt, bevor
  das Spiel beendet wird.

## Randfälle

| #    | Fall                                                  | Erwartetes Verhalten                                                  |
| ---- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| RF-1 | `#/spiel/gibtsnicht` von Hand eingetippt              | Die Auswahl erscheint, nichts bricht.                                 |
| RF-2 | `#/statistik/minen` ohne eine einzige Minen-Partie    | Die Statistik des Spiels mit ihrem Leer-Hinweis, nicht die Auswahl.   |
| RF-3 | Ein Spiel gibt aus `starten` nichts zurück            | Verlassen funktioniert trotzdem, es wird nur kein `ende()` gerufen.   |
| RF-4 | Nur Partien ohne Urteil vorhanden                     | Kachel „n Runden", im Streifen steht bei „gewonnen" ein „–".          |
| RF-5 | Zweite Meldung, während die erste noch steht          | Der Text wird ersetzt, die Anzeigezeit beginnt von vorn.              |
| RF-6 | Aus einem Spiel auf den Statistik-Knopf               | `ende()` läuft, dann erscheint `#/statistik/<id>` dieses Spiels.      |
