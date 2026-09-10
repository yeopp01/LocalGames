# Bausteine für Runden

**Datei:** [`spiele/runde.js`](../../spiele/runde.js)
**Stand:** 12/12 fertig

## Zweck

Kein Spiel, sondern das Werkzeug hinter den Spielen zu mehreren: ein Würfel,
der aus einem Code auf jedem Gerät dieselbe Runde macht, der Aufbau für
Spielerzahl und Namen, der Sperrschirm fürs Weiterreichen, die geheime
Abstimmung und eine Uhr. Es kennt kein einzelnes Spiel.

## Akzeptanzkriterien

### Würfel und Code

- **AC-1** `fertig` **Gleicher Code, gleiche Folge** — `Runde.zufallAus(text)`
  liefert zu demselben Text auf jedem Gerät Zahl für Zahl dieselbe Folge im
  Bereich [0, 1) (FNV-1a als Startwert, Mulberry32 als Folge, nur ganzzahlige
  32-Bit-Rechnung). Ein anderer Text ergibt eine andere Folge. Ohne Startwert
  (`null`, `undefined`, leerer Text) kommt der gewöhnliche Zufall
  `Math.random` zurück.
- **AC-2** `fertig` **Vorlesbarer Zeichenvorrat** — Codes bestehen nur aus den
  25 Zeichen `ACDEFGHJKLMNPRTUVWXY34679`: kein O neben der 0, kein I neben der
  1 (auch B, Q, S, Z, 2, 5 und 8 fehlen). „Würfeln" erzeugt einen Code aus vier
  Zeichen dieses Vorrats.
- **AC-3** `fertig` **Eingabe wird still bereinigt** — Beim Eintippen werden
  Buchstaben groß, und alles außerhalb des Vorrats fällt sofort weg: `r4km` und
  `R 4 K M` ergeben beide `R4KM` und damit dieselbe Runde. Das Codefeld nimmt
  höchstens sechs Zeichen.

### Aufbau

- **AC-4** `fertig` **Spielerzahl und Namen** — `aufbau` zeigt einen Zähler
  „Wir sind zu" mit − und + in den Grenzen, die das Spiel vorgibt (ohne Angabe
  3 bis 12; an der Grenze ist der Knopf gesperrt), und je Platz ein Namensfeld
  mit höchstens 14 Zeichen. Ohne gemerkte Namen – oder mit weniger als der
  Mindestzahl – beginnt er mit „Spieler 1" bis „Spieler 3". Ein leer gelassenes
  Feld wird wieder zu „Spieler n", Namen kommen ohne Rand-Leerzeichen beim
  Spiel an.
- **AC-5** `fertig` **Code-Aufbau auf einem Schirm** — `codeAufbau` bündelt
  Codefeld mit „Würfeln", die Spielerzahl und „Ich bin Nummer" auf einem
  Schirm. Die eigene Nummer geht nie über die Spielerzahl und rutscht mit, wenn
  die Spielerzahl kleiner wird. Der Startknopf bleibt gesperrt, bis der Code
  mindestens drei Zeichen hat. Ein Hinweis sagt, dass eine doppelt gewählte
  Nummer dieselbe Rolle bekommt.

### Weitergabe

- **AC-6** `fertig` **Sperrschirm vor jedem Blick** — `weitergabe` stellt vor
  jeden Spieler einen Schirm mit „Weitergeben an" (oder dem Wort, das das Spiel
  vorgibt), seinem Namen und dem Knopf „Ich bin ‹Name›". Erst danach erscheint
  sein Inhalt. Auf dem Sperrschirm steht nichts vom Inhalt des vorigen
  Spielers; nach dem letzten Spieler ist die Fläche leer, bevor das Spiel
  weitermacht.
- **AC-7** `fertig` **Halten zum Aufdecken** — Mit `halten` liegt ein dunkler
  Deckel „Gedrückt halten" über dem Inhalt. Er weicht nur, solange Finger oder
  Maus drücken, und schließt beim Loslassen, Abbrechen und Verlassen der
  Fläche. Kontextmenü und Textauswahl sind auf der Fläche unterdrückt; der
  Inhalt liegt schon fertig darunter, beim Aufdecken springt nichts.
- **AC-8** `fertig` **Abbruch hält Weitergabe an** — Nach `ende()` führt kein
  Knopf mehr zum nächsten Spieler, und `fertig` wird nicht mehr aufgerufen.

### Abstimmung

- **AC-9** `fertig` **Geheim, reihum, ohne sich** — `stimmen` legt vor jede
  Stimme einen Sperrschirm „Abstimmen". Danach sieht der Spieler die Frage und
  die Namen aller anderen – den eigenen nie. Ein Tipp gibt die Stimme ab und
  zeigt sofort den nächsten Sperrschirm, sodass keine Stimme auf dem Schirm
  stehen bleibt. Am Ende bekommt das Spiel je Platz die gewählte Nummer.
- **AC-10** `fertig` **Auszählung meldet Gleichstand** — `auszaehlen` liefert
  alle Namen nach Stimmen absteigend (bei gleicher Zahl in Sitzreihenfolge),
  die Spitze und `gleichstand`, wenn sich mehrere die Spitze teilen. Ungültige
  Stimmen zählen nicht; ohne eine gültige Stimme ist die Spitze leer und es
  gibt keinen Gleichstand. Aufgelöst wird ein Gleichstand nicht – das
  entscheidet das Spiel.

### Uhr

- **AC-11** `fertig` **Rücklaufende Uhr** — `uhr` zeigt die Restzeit als
  `m:ss`, markiert die letzten zehn Sekunden und ruft `ende` genau einmal auf.
  `stopp()` hält sie an. Die Restzeit richtet sich nach der verstrichenen Zeit,
  nicht nach der Zahl der Takte – setzt der Browser Takte aus, stimmt sie
  danach trotzdem.
- **AC-12** `fertig` **Verdeckt und gestreut** — Mit `sichtbar: false` bleibt
  die Anzeige leer und ausgeblendet. `streuung` verschiebt das Ende
  gleichverteilt um bis zu so viele Sekunden nach oben oder unten (gemessen bei
  45 ± 15 s: 30,1 bis 60,0 s, Mittel 45,2 s). Die Streuung würfelt immer mit dem
  gewöhnlichen Zufall, nie aus einem Code.

## Randfälle

| #    | Fall                                                  | Erwartetes Verhalten                                                   |
| ---- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| RF-1 | Zwei Spieler wählen im Code-Weg dieselbe Nummer       | Beide bekommen dieselbe Rolle; der Hinweis auf dem Schirm warnt vorher. |
| RF-2 | Jemand tippt O, 0, I oder 1 in den Code               | Das Zeichen fällt weg; sein Code und damit seine Runde weichen ab.     |
| RF-3 | Gemerkte Namensliste ist kürzer als die Mindestzahl   | Der Aufbau beginnt mit „Spieler 1" bis „Spieler 3".                    |
| RF-4 | Jede Stimme geht an einen anderen                     | Alle teilen sich die Spitze, `gleichstand` ist gesetzt.                |
| RF-5 | Der Finger rutscht beim Aufdecken vom Feld            | Der Deckel schließt sofort.                                            |
| RF-6 | Spielerzahl wird unter die gewählte eigene Nummer gesenkt | Die Nummer wird auf die neue Spielerzahl gesetzt.                  |

## Hintergrund

Vier Spiele teilen sich `spiele/runde.js`. Der Baustein kennt kein Spiel,
sondern nur die Teile, die alle brauchen:

| Werkzeug | Wofür |
| --- | --- |
| `zufallAus(code)` | Der Würfel, der aus einem Text seine Folge ableitet – Grundlage des Code-Wegs bei Verräter. Ohne Startwert der gewöhnliche Zufall. |
| `aufbau(…)` | Spielerzahl und Namen |
| `codeAufbau(…)` | Code, Spielerzahl und „ich bin Nummer" auf einem Schirm |
| `weitergabe(…)` | Sperrschirm mit Namen, Halten zum Aufdecken, reihum |
| `stimmen(…)` / `auszaehlen(…)` | Geheime Abstimmung und ihre Auszählung |
| `uhr(…)` | Rücklaufende Uhr, wahlweise verdeckt und mit Streuung |

Der Sperrschirm ist dabei das eigentliche Stück Arbeit: ohne ihn steht das
Geheimnis schon auf dem Bildschirm, während das Gerät noch in der Luft ist.
