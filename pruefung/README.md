# Prüfstand

Alles, womit sich prüfen lässt, ob LocalGames tut, was die
[Specs](../specs/README.md) sagen. Nichts davon wird für die App gebraucht;
ausgeliefert werden nur die Dateien im Wurzelverzeichnis.

```
npm --prefix pruefung install          # einmalig: Playwright
node pruefung/pruefen.mjs              # Wächter → E2E → Bericht
```

## Was es gibt

| Datei | Wofür | Braucht |
| --- | --- | --- |
| [`pruefen.mjs`](pruefen.mjs) | Alles in einem Lauf. `--ohne-e2e` für Sekunden statt einer Minute, Argumente nach `--` gehen an Playwright (`-- -g Minenfeld`, `-- e2e/sicherung.spec.mjs`). Der Bericht wird auch nach Rot geschrieben. | Node |
| [`waechter.mjs`](waechter.mjs) | Regeln aus `CLAUDE.md` als Prüfung: Spiele in `index.html` und im Lager des Service Workers, Versionsnummer nach Änderung, Syntax, Spec und README-Zeile je Spiel, Format der Specs, tote Links. | Node |
| [`e2e/`](e2e/) | Rauchtests im Browser, je auf einem Handy (Pixel 7) und einem flachen Laptop (1366 × 700). | Playwright |
| [`ansehen.mjs`](ansehen.mjs) | Eine Ansicht als Bild, mit Konsolenfehlern und allem, was seitlich herausragt – für „sieht das jetzt richtig aus?". Bilder landen in `ansichten/`. | Playwright |
| [`skripte/spec-board.mjs`](skripte/spec-board.mjs) | Schreibt `specs/BOARD.md`, die `**Stand:**`-Zeilen und die Bereichstabellen. `--check` meldet nur. | Node |
| [`skripte/bericht.mjs`](skripte/bericht.mjs) | Schreibt `bericht/index.html`: jedes Akzeptanzkriterium mit Status, Filter und Suche, der letzte Lauf, der Fortschritt aus der Git-Historie. | Node |
| [`server.mjs`](server.mjs) | Liefert das Repository ohne Paket aus; Playwright startet ihn selbst. | Node |

## Was die E2E-Tests prüfen – und was nicht

Jede Seite hat zwei Wachen, ohne dass ein Test sie anfordern muss: Ein Fehler
im Browser (Ausnahme oder `console.error`) lässt den Test scheitern, und jede
Anfrage an einen fremden Server wird abgefangen – die Tests zählen nie bei
GoatCounter mit.

| Datei | Prüft |
| --- | --- |
| `rahmen.spec.mjs` | Kacheln je Spiel, Adressen, Zurück, Einstellungen, Versionssuche, Alles löschen |
| `statistik.spec.mjs` | Siegquote nur über Partien mit Urteil, Tagesserie, Kalender; **jede** Auswertung mit lückenhaften Partien |
| `sicherung.spec.mjs` | Datei sichern, zusammenführen, Fremdes abweisen |
| `spiele.spec.mjs` | **Jedes** Spiel startet, ragt nicht aus dem Fenster, übersteht Neuladen und Verlassen |
| `offline.spec.mjs` | Ganzer Grundbestand im Lager der richtigen Version; ohne Netz startet jedes Spiel |
| `netz.spec.mjs` | Außer dem Zähler fragt die App niemanden an |

Die Liste der Spiele lesen die Tests aus `spiele/*.js` – ein neues Spiel ist
ohne Änderung dabei.

Die Regeln der einzelnen Spiele prüfen die Tests **nicht**. Dafür sind
Wegwerf-Skripte gegen die Spieldatei schneller und genauer; ihre Zahlen stehen
im Commit. Ein E2E-Test kommt dazu, wenn er einen Vertrag oder einen behobenen
Fehler festhält.

## Was nicht eingecheckt wird

`node_modules/`, `ergebnisse/` (Rohdaten des letzten Laufs), `bericht/`,
`ansichten/`, `test-results/` (Spur und Bild fehlgeschlagener Tests). Ein
Ergebnis gehört zu dem Arbeitsbaum, auf dem es lief, nicht zu einem Commit.
