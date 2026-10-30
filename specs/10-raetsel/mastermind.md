# Zahlencode

**Datei:** [`spiele/mastermind.js`](../../spiele/mastermind.js)
**Stand:** 19/19 fertig

## Zweck

Mastermind mit Ziffern: einen geheimen Code aus den Ziffern 1 bis 6 knacken,
nur mit den Rückmeldungen auf die eigenen Versuche. Ein rechnender Vorschlag
zeigt, welcher Zug am meisten verrät – zum Lernen oder wenn man feststeckt.

## Akzeptanzkriterien

### Code und Stufen

- **AC-1** `fertig` **Zwei Stufen** — Normal sind vier Stellen und zehn
  Versuche, schwer fünf Stellen und zwölf. Ziffern 1 bis 6, Wiederholungen
  erlaubt. Die Kopfzeile zeigt Stufe und „n Versuche frei", darüber
  „4 Stellen · 1–6".
- **AC-2** `fertig` **Neuer Code wählbar** — Das Werkzeug „Neuer Code" bietet
  Normal und Schwer an; nach einer beendeten Partie stehen „Nochmal" für die
  gespielte Stufe und die andere mit ihrem Namen unter dem Ergebnis.

### Eingabe

- **AC-3** `fertig` **Ziffernfeld und Tastatur** — Tasten 1–6, Löschen und Abgeben
  auf dem Schirm; am Rechner ebenso die Ziffern 1–6, Rücktaste oder Entf, Enter und
  die Pfeile links und rechts. Mehr Ziffern als Stellen werden nicht angenommen;
  solange ein Blatt offen ist oder Strg, Alt oder Meta gedrückt sind, zählt die
  Tastatur nicht. Löschen ist ohne Ziffer gesperrt, Abgeben ohne vollständigen Versuch.
- **AC-4** `fertig` **Unvollständiges wird abgewiesen** — Ein Versuch mit zu
  wenigen Ziffern lässt sich nicht antippen; Enter weist ihn mit „Noch nicht genug
  Ziffern." ab, und er verbraucht keinen Versuch.
- **AC-17** `fertig` **Stelle gezielt ändern** — Ein Tipp auf eine Stelle der aktiven
  Zeile setzt dorthin den Cursor: Die nächste Ziffer landet dort, danach geht es zur
  nächsten Lücke. Löschen nimmt die Ziffer unter dem Cursor, sonst die letzte davor.
- **AC-18** `fertig` **Früheren Versuch übernehmen** — Ein Tipp auf einen früheren
  Versuch schreibt ihn in die aktive Zeile. Wer denselben Versuch noch einmal abgibt,
  bekommt „Den hattest du schon." und verliert keinen Versuch.
- **AC-19** `fertig` **Ganzes Brett von Anfang an** — Alle Versuche stehen als Zeilen
  von Anfang an da und teilen sich die Fensterhöhe; der Ziffernblock bleibt an seinem
  Platz. Auf Handy, 320 × 568, 1366 × 700 und 1000 × 560 passt alles ohne Scrollen.
  Jede Ziffer hat ihren Farbton in Zeile und Ziffernblock, darunter erklärt eine Zeile
  die beiden Punktarten; auf sehr flachen Fenstern fällt diese Zeile weg.

### Rückmeldung

- **AC-5** `fertig` **Punkte je Versuch** — Neben jedem Versuch steht je Stelle
  ein Punkt: gefüllt für eine richtige Ziffer an richtiger Stelle, offen für
  eine richtige Ziffer an falscher Stelle, leer für den Rest. Gefüllt ist grün,
  offen ein gelber Ring, leer ein kleiner Punkt; die Form allein reicht zum
  Unterscheiden. Welcher Punkt zu welcher Stelle gehört, verraten sie nicht.
- **AC-6** `fertig` **Doppelte Ziffern korrekt** — Jede Ziffer des Codes zählt
  höchstens einmal: `1122` gegen `2211` gibt 0 gefüllte und 4 offene Punkte,
  `1111` gegen `1222` einen gefüllten und keinen offenen, `1123` gegen `3112`
  einen gefüllten und drei offene.

### Vorschlag

- **AC-7** `fertig` **Vorschlag nur aus Rückmeldungen** — Der Vorschlag rechnet
  allein aus den bisherigen Versuchen und ihren Punkten, nie aus dem geheimen
  Code. Er nennt, wie viele Codes noch passen, schlägt einen Zug vor („das ist
  er", wenn nur einer bleibt) und listet bei höchstens zehn Codes alle auf.
  „Eintragen" schreibt den Vorschlag in die aktive Zeile.
- **AC-8** `fertig` **Vorschlag trennt am besten** — Vorgeschlagen wird ein noch
  möglicher Code, nach dessen Rückmeldung im Schnitt die wenigsten Codes
  übrig bleiben. Wer nur Vorschlägen folgt, knackt jeden Code innerhalb der
  erlaubten Versuche, und der Vorschlag steht ohne spürbare Wartezeit da.
- **AC-9** `fertig` **Vorschlag zählt als Hilfe** — Jedes Öffnen des Vorschlags
  zählt als Hinweis, auch wenn man ihm nicht folgt.

### Ende

- **AC-10** `fertig` **Sieg und Verlust** — Sitzen alle Ziffern, erscheint „Code
  geknackt." mit dem Code und der Zahl der Versuche. Ist der letzte Versuch
  verbraucht, erscheint „Nicht geknackt." mit dem Code. Der Code steht in den
  Farbtönen da, die freien Zeilen verschwinden, und das Ergebnis scrollt ins Bild.
  Danach verschwinden Ziffernfeld und Vorschlag. War der Sieg kürzer als alle früheren
  dieser Stufe, steht dort „Neuer Bestwert".

### Speicher und Statistik

- **AC-11** `fertig` **Partie überlebt Schließen** — Nach Zurück, Neuladen oder
  Neustart stehen Code, alle Versuche, der angefangene Versuch und die Hinweiszahl
  wieder da. Stände ohne angefangenen Versuch laden weiter. Eine beendete Partie wird
  nicht wiederhergestellt.
- **AC-12** `fertig` **Spielzeit ohne Pausen** — Die notierte `dauer` zählt nur
  die Zeit, in der das Spiel offen war, wie bei Damen und Weg. Eine über Nacht
  geschlossene Partie bringt die Nacht nicht in die Spielzeit.
- **AC-13** `fertig` **Partie in der Statistik** — Jede beendete Partie, auch
  eine verlorene, wird mit `gewonnen` (`true` oder `false`), `dauer`, `zuege`,
  `hilfen` und `stufe` notiert. Die Statistik zeigt „Versuche je Sieg" und
  „bester Lauf" und „–", solange es keinen Sieg gibt; der Rahmen ergänzt
  „Siege ohne Hinweis", „Züge im Schnitt" und „Hinweise gesamt".
- **AC-14** `fertig` **Lückenhafte Partien vertragen** — Gewonnene Partien ohne
  Zahl in `zuege` (etwa aus einer fremden oder alten Sicherung) werden in
  „Versuche je Sieg" und „bester Lauf" übergangen.
- **AC-15** `fertig` **Anleitung erklärt alles** — Das Blatt „Anleitung" nennt
  Stellenzahl und Ziffernvorrat, dass Ziffern mehrfach vorkommen dürfen, die
  Bedeutung der beiden Punktarten, dass ihre Reihenfolge nichts verrät, was der
  Vorschlag tut und wie man eine Stelle ändert oder einen Versuch übernimmt.
- **AC-16** `fertig` **Stufe und Ende ohne Lesen** — Kopfzeile, Blatt „Neuer
  Code" und Knöpfe unter dem Ergebnis zeigen die Stufe auch als Punkte in
  Ampelfarbe (Schnittstelle AC-15); die gespielte heißt dort „Nochmal" und trägt
  den Kreispfeil. Über „Code geknackt." steht ein grüner Haken, über „Nicht
  geknackt." nicht.

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                                   |
| ---- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| RF-1 | Halb getippter Versuch, dann App geschlossen      | Die getippten Ziffern stehen wieder da, wie die abgegebenen Versuche.  |
| RF-2 | Nur noch ein oder zwei Codes passen               | Der Vorschlag nennt den ersten davon.                                  |
| RF-3 | Kein Code passt zu den Rückmeldungen              | Der Vorschlag meldet einen Widerspruch statt eines Zugs.               |
| RF-4 | Partien auf normal und schwer                     | Die Statistik zählt beide zusammen, ohne Trennung nach Stufe.          |
| RF-5 | Nach einer beendeten Partie das Spiel neu öffnen  | Es beginnt ein frischer Code der Stufe normal.                         |
| RF-6 | Nur verlorene Partien                             | „Versuche je Sieg" und „bester Lauf" zeigen „–".                       |

## Hintergrund

Der Vorschlag arbeitet wie bei Wördle: Aus allen Rückmeldungen bleibt eine
Menge möglicher Codes übrig, und gesucht ist der Zug, der diese Menge im
Schnitt am stärksten zerlegt – bewertet mit `Σ (Gruppengröße²) / Anzahl`. Nur
ist der Suchraum hier gerechnet statt aufgeschrieben: 6⁴ = 1296 Codes auf
normal, 6⁵ = 7776 auf schwer. Bei mehr als 600 Kandidaten wird nur eine
Auswahl als Zug geprüft, bei mehr als 1500 auch nur gegen eine Stichprobe
gerechnet; die Reihenfolge ändert das kaum. Als Zug kommen nur Codes in
Frage, die selbst noch die Lösung sein können.

Nachgemessen mit einem Wegwerf-Skript gegen `spiele/mastermind.js`, gespielt
nur mit dem Vorschlag – auf normal gegen alle Codes, auf schwer gegen
zufällige:

| Stufe  | Partien          | Züge Schnitt | Züge max | über dem Limit | längster Aufruf |
| ------ | ---------------- | ------------ | -------- | -------------- | --------------- |
| normal | 1296 (alle)      | 4,42         | 6        | 0              | 130 ms          |
| schwer | 80 (Stichprobe)  | 4,63         | 6        | 0              | 176 ms          |

Auf normal verteilt sich das so: 1 Code in einem Zug, 13 in zwei, 114 in drei,
530 in vier, 595 in fünf, 43 in sechs. Für schwer ist „jeder Code" aus der
Stichprobe geschlossen, nicht vollständig durchgerechnet.
