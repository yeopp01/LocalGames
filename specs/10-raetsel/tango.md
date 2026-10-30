# Tango

**Datei:** [`spiele/tango.js`](../../spiele/tango.js)
**Stand:** 21/21 fertig

## Zweck

Ein kleines Logikrätsel nach dem Vorbild von LinkedIns Tango: Sonne und Mond so
verteilen, dass jede Reihe im Gleichgewicht ist. Jedes Rätsel lässt sich Schritt
für Schritt herleiten, und der Hinweis sagt, worauf der nächste Schritt beruht.

## Akzeptanzkriterien

### Regeln und Stufen

- **AC-1** `fertig` **Drei Regeln** — Auf 6 × 6 Feldern stehen Sonne und Mond: In
  jeder Zeile und jeder Spalte genau drei von jedem, nie drei gleiche direkt
  nebeneinander oder untereinander, und ein „=" zwischen zwei Feldern heißt
  gleich, ein „×" verschieden. Sonne und Mond sehen auf jedem Gerät gleich aus.
- **AC-2** `fertig` **Drei Stufen nach Zeichen** — Die Stufen unterscheiden sich
  in der Zahl der Zeichen zwischen den Feldern: leicht 10, mittel 6, schwer 3.
  Wählbar über das Werkzeug „Neues Rätsel" und nach dem Lösen über „Nochmal" und die anderen Stufen. Über
  dem Feld stehen Stufe, laufende Zeit und die Zahl der offenen Felder.

### Erzeugung

- **AC-3** `fertig` **Ohne Raten lösbar** — Jedes Rätsel lässt sich von den
  Vorgaben aus allein mit den Schlüssen des Hinweises bis zum Ende herleiten und
  ist damit eindeutig.
- **AC-4** `fertig` **Keine überflüssige Vorgabe** — Jede vorgegebene Figur ist
  nötig: Ohne sie ließe sich das Rätsel nicht mehr allein herleiten.

### Eingabe

- **AC-5** `fertig` **Tippen schaltet weiter** — Ein Tipp schaltet ein Feld
  weiter: leer → Sonne → Mond → leer. Vorgegebene Felder sind als fest erkennbar
  und reagieren nicht.
- **AC-16** `fertig` **Rückgängig nimmt das Feld zurück** — „Rückgängig" holt den
  Stand vor dem letzten Zug zurück. Mehrere Tipps nacheinander auf dasselbe Feld
  sind ein Zug; wer einmal ganz herum tippt, hat gar keinen gemacht. Auch „Eintragen"
  aus dem Hinweis und „Von vorn" lassen sich so zurücknehmen. Bis zu 80 Züge bleiben
  erhalten, auch über ein Neuladen. Ohne Verlauf ist der Knopf gesperrt.
- **AC-17** `fertig` **Von vorn ohne Rückfrage** — „Von vorn" räumt alle eigenen
  Zeichen ab, die Vorgaben bleiben; Zeit und Hinweise laufen weiter. Es fragt nicht
  nach, weil „Rückgängig" alles wiederholt. Ist nichts Eigenes gesetzt, ist der Knopf
  gesperrt.
- **AC-18** `fertig` **Am Rechner per Tastatur** — Die Pfeile wandern von Feld zu
  Feld und halten am Rand, Enter und Leertaste schalten weiter wie ein Tipp, S oder 1
  setzt die Sonne, M oder 2 den Mond, Entf oder 0 leert das Feld. Rücktaste und Strg+Z
  sind „Rückgängig". Bei offenem Blatt bleiben die Tasten beim Blatt.
- **AC-19** `fertig` **Brett nutzt das Fenster** — Das Brett ist so groß, wie Breite
  und Höhe des Fensters es erlauben, und passt samt Knöpfen ohne Scrollen hinein:
  auf dem Handy (360 und 412 Punkte) wie in 1366 × 700 und 1000 × 560.

### Fehler und Hinweise

- **AC-6** `fertig` **Regelbruch wird rot** — Sofort rot werden: alle Figuren
  einer Sorte in einer Reihe, sobald es mehr als drei sind; drei gleiche am
  Stück; beide Felder an einem verletzten „=" oder „×". Eine Figur, die gegen
  keine Regel verstößt, aber nicht zur Lösung passt, bleibt ungefärbt.
- **AC-20** `fertig` **Der Verstoß wird genannt** — Unter dem Brett steht in einem
  Satz, was gerade nicht stimmt („In Zeile 2 stehen drei Sonnen am Stück."), ein
  verletztes „=" oder „×" färbt sich selbst mit. Solange kein eigenes Zeichen steht,
  sagt dieselbe Zeile, was ein Tipp tut. Die Zeile hält ihren Platz, die Knöpfe
  springen nicht.
- **AC-21** `fertig` **Der Hinweis zeigt die Stelle** — Die Felder, von denen ein
  Schluss spricht, tragen einen Ring. Er bleibt nach „Selbst machen" stehen, bis der
  nächste Zug kommt, damit niemand „Zeile 4, Spalte 5" abzählen muss.
- **AC-7** `fertig` **Hinweis warnt vor Falschem** — Passt irgendeine gesetzte
  Figur nicht zur Lösung, sagt der Hinweis nur „Da steht etwas Falsches", ohne
  das Feld zu nennen, und zählt nicht als Hinweis.
- **AC-8** `fertig` **Begründeter nächster Schluss** — Sonst nennt der Hinweis
  einen Schluss mit Ort und Grund, in dieser Reihenfolge gesucht: ein „=" oder „×"
  neben einem belegten Feld; zwei gleiche nebeneinander oder mit einer Lücke; eine
  Reihe, in der von einer Sorte schon drei liegen; zuletzt eine einzelne Zeile oder
  Spalte, ganz durchgespielt. Betrifft ein Schluss mehrere Felder, heißt der Knopf
  „Alle eintragen". Eingetragen wird nur auf Wunsch. Der Schluss stützt sich nur
  auf die Figuren und Zeichen im Feld.
- **AC-9** `fertig` **Hinweis hilft von überall** — Aus jedem richtigen
  Zwischenstand findet der Hinweis einen Schluss – auch wenn der Spieler Figuren
  gesetzt hat, die sich noch nicht herleiten ließen.

### Ende, Speicher und Statistik

- **AC-10** `fertig` **Gelöst beendet die Partie** — Steht die Lösung vollständig,
  läuft eine Welle über das Brett und erscheint „Gelöst." mit Stufe, Zeit und Zahl
  der Hinweise („ohne Hinweis", wenn keiner), bei einem neuen Rekord dieser Stufe dazu
  „Neue Bestzeit". Das Ergebnis rückt von selbst ins Bild. Die Knöpfe unter dem Brett
  verschwinden, das Feld nimmt keine Züge mehr an.
- **AC-11** `fertig` **Rätsel überlebt Schließen** — Ein laufendes Rätsel steht
  nach Zurück, Neuladen oder Neustart der App mit Stufe, Zeichen, Figuren, Verlauf,
  Hinweiszahl und verbrauchter Zeit wieder da; die Zeit dazwischen zählt nicht.
  Nach einem gelösten Rätsel beginnt beim nächsten Öffnen ein neues auf leicht.
- **AC-12** `fertig` **Gelöstes in der Statistik** — Jedes gelöste Rätsel wird
  mit `gewonnen: true`, `dauer`, `stufe` (`leicht`, `mittel`, `schwer`) und
  `hilfen` notiert. `hilfen` zählt jeden gezeigten Schluss, auch wenn man ihn
  nicht einträgt; Warnungen zählen nicht. Ein verworfenes Rätsel wird nicht
  notiert.
- **AC-13** `fertig` **Bestzeit je Stufe** — Die Statistik zeigt je Stufe die
  Bestzeit aus gelösten Partien und „–", solange es keine gibt – auch bei leerer
  Liste und bei Partien, denen `stufe`, `dauer` oder `gewonnen` fehlt.
- **AC-14** `fertig` **Anleitung auf Abruf** — Das Werkzeug „Anleitung" erklärt
  das Weiterschalten, die drei Regeln, die rote Markierung, dass nie geraten
  werden muss und der Hinweis nicht in die Lösung schaut, und nennt einen guten
  Anfang.
- **AC-15** `fertig` **Stufe und Ende ohne Lesen** — Kopfzeile, Blatt „Neues
  Rätsel" und Knöpfe unter dem Ergebnis zeigen die Stufe auch als Punkte in
  Ampelfarbe (Schnittstelle AC-15); die gespielte heißt dort „Nochmal" und trägt
  den Kreispfeil. Über „Gelöst." steht ein grüner Haken.

## Randfälle

| #    | Fall                                                        | Erwartetes Verhalten                                                              |
| ---- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| RF-1 | Vorgegebenes Feld antippen                                  | Nichts passiert.                                                                  |
| RF-2 | Vor „Alle eintragen" eines der Felder selbst belegt         | Das belegte Feld bleibt, wie es ist; nur die freien werden gefüllt.               |
| RF-3 | Feld voll, aber mit Regelbruch                              | Kein Sieg; die betroffenen Felder sind rot.                                       |
| RF-4 | Hinweis findet bei richtigem Stand keinen Schluss           | Kommt nicht vor (AC-9); falls doch: „Hier sehe ich nichts Zwingendes", zählt nicht. |
| RF-5 | Neues Rätsel mitten in einer Partie                         | Das alte wird ohne Rückfrage verworfen und nicht notiert.                         |
| RF-6 | Gespeicherter Stand aus einer Fassung ohne Verlauf          | Das Rätsel lädt, Rückgängig beginnt mit leerem Verlauf.                           |

## Hintergrund

Aus den Kommentaren im Code:

* **Sonne und Mond werden gezeichnet, nicht getippt:** Die Schriftzeichen ☀ und ☾
  kommen je nach Gerät als buntes Emoji, in ganz anderer Größe oder gar nicht.
* **Eindeutigkeit allein genügt nicht.** Ein eindeutiges Rätsel kann trotzdem eine
  Stelle haben, an der nur noch Probieren weiterhilft. Der Generator baut darum
  erst ein gültiges Feld, streut ein paar Zeichen zwischen die Felder und gibt so
  lange einzelne Felder vor, bis sich das Rätsel Schritt für Schritt herleiten
  lässt – danach wird jede entbehrliche Vorgabe wieder entfernt. Wer sich
  herleiten lässt, ist ohnehin eindeutig.
* **Hinweis und Generator fragen dieselbe Stelle.** Was der Hinweis nicht
  erklären könnte, soll gar nicht erst als Rätsel herauskommen.
* **Die Reihenfolge der Schlüsse ist die, in der man selbst schaut:** erst die
  Zeichen zwischen den Feldern, dann die Dreier, dann die ausgezählte Linie – und
  erst wenn nichts davon greift, wird eine einzelne Linie durchgespielt. Bei sechs
  Feldern sind das höchstens 64 Möglichkeiten, ohne dass man den Rest des Bretts
  anfassen müsste.
