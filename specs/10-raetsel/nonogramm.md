# Nonogramm

**Datei:** [`spiele/nonogramm.js`](../../spiele/nonogramm.js)
**Stand:** 20/20 fertig

## Zweck

Picross zum Mitnehmen: Die Zahlen am Rand verraten, welche Felder gefüllt sind,
und wer sie richtig liest, legt ein Bild frei. Gedacht für Finger und Maus
gleichermaßen, von 5 × 5 für zwischendurch bis 10 × 10 für länger.

## Akzeptanzkriterien

### Feld und Stufen

- **AC-1** `fertig` **Drei Größen** — Es gibt die Stufen klein (5 × 5), mittel
  (8 × 8) und groß (10 × 10). Über dem Gitter stehen Stufe, laufende Zeit und
  „gefüllt/nötig", unter dem Titel die Größe.
- **AC-2** `fertig` **Neues Rätsel wählbar** — Das Werkzeug „Neues Rätsel" nennt
  die drei Größen und bietet sie an; nach einem fertigen Bild stehen „Neu,
  klein/mittel/groß" unter dem Ergebnis.
- **AC-3** `fertig` **Brett nach Fenster** — Das Gitter ist so groß, wie Breite und
  Höhe des Fensters samt Zahlenrand und Bedienung es erlauben, ein Feld mindestens 20
  Pixel. Der Zahlenrand richtet sich nach den längsten Zahlenreihen des Rätsels, die
  Zahlen wachsen mit dem Feld bis 19 Pixel. Alles passt auf Handy, 320 × 568,
  1366 × 700 und 1000 × 560 ohne Scrollen. Beim Ändern der Fenstergröße wird neu
  berechnet, der Spielstand bleibt.
- **AC-4** `fertig` **Zahlen am Rand** — Jede Zeile und Spalte zeigt die Längen
  ihrer gefüllten Blöcke in der richtigen Reihenfolge; eine ganz leere Reihe
  zeigt 0.
- **AC-17** `fertig` **Erfüllte Reihen werden blass** — Stimmen die Blöcke einer
  Reihe mit ihren Zahlen überein, werden die Zahlen blass, auch eine 0 von Anfang an.
  Gezählt wird nur, was im Gitter steht: Auch ein Block an der falschen Stelle
  erfüllt die Zahl, das Gitter verrät weiter nichts über die Lösung (AC-10).
- **AC-18** `fertig` **Wo man gerade ist** — Zahlen und Felder der Zeile und Spalte
  unter dem Zeiger oder dem zuletzt berührten Feld sind leicht hervorgehoben.

### Erzeugung

- **AC-5** `fertig` **Rein logisch lösbar** — Jedes Rätsel lässt sich vollständig
  lösen, indem man immer nur eine einzelne Zeile oder Spalte betrachtet; damit ist
  es auch eindeutig. Geraten werden muss nie.

### Eingabe

- **AC-6** `fertig` **Tippen und Wischen** — Tippen füllt ein freies Feld und
  macht ein gefülltes wieder frei. Wer wischt, bleibt in der Reihe, in der es losging,
  auch wenn der Finger etwas abdriftet oder über den Rand hinausgeht; schnell
  übersprungene Felder werden nachgeholt. Das erste Feld gibt den Wert vor: Füllen und
  Kreuzen betrifft nur freie Felder, Freimachen nur Felder wie das erste.
- **AC-7** `fertig` **Kreuze auf drei Wegen** — Ein Kreuz („bleibt leer") setzt
  man mit einfachem Tippen im Modus „Kreuz", mit langem Drücken (400 ms) oder mit der
  rechten Maustaste, Ziehen geht bei allen dreien. Die Wahl „Füllen" oder „Kreuz" unter
  dem Brett zeigt immer, was der nächste Tipp tut. Im Modus und mit der rechten
  Maustaste nimmt dieselbe Geste das Kreuz wieder weg – Letzteres ging früher nicht,
  weil der Druck das Kreuz schon gefüllt hatte, bevor das Kontextmenü es umschaltete.
- **AC-8** `fertig` **Langes Drücken schaltet Kreuz** — Langes Drücken schaltet
  das Kreuz um, unabhängig vom Modus: Aus einem Kreuz wird ein freies Feld, aus
  einem freien oder gefüllten Feld ein Kreuz – so, wie die Anleitung es
  verspricht („Nochmal dasselbe nimmt das Kreuz wieder weg"). Meldet das Gerät den
  Druck zusätzlich als Kontextmenü (Android), schaltet es trotzdem nur einmal.
- **AC-19** `fertig` **Rückgängig und von vorn** — „Rückgängig" nimmt die letzte
  Geste zurück: einen ganzen Wisch, einen langen Druck, „Von vorn" oder einen
  eingetragenen Hinweis. „Von vorn" leert das Gitter ohne Rückfrage, weil das
  Rückgängig reicht. Beide sind gesperrt, wenn es nichts zu tun gibt; der Verlauf lebt
  nur im Speicher und ist nach dem Neuladen leer.
- **AC-20** `fertig` **Tastatur** — Die Pfeile wandern übers Brett, Enter oder
  Leertaste handeln wie ein Tipp, X setzt oder nimmt ein Kreuz, ohne Fokus aufs Brett
  schaltet X den Modus. Rücktaste und Strg+Z oder Cmd+Z nehmen zurück. Solange ein Blatt
  offen ist oder die Partie vorbei ist, zählt keine Taste.

### Fehler und Hinweise

- **AC-9** `fertig` **Hinweis aus einer Reihe** — Der Hinweis nennt ein noch
  freies Feld, das gefüllt oder leer sein muss, und die Zeile oder Spalte, aus der
  das allein folgt – Zeilen zuerst. Das Feld ist im Gitter markiert, damit man es
  nicht abzählen muss. Die Begründung stützt sich nur auf richtig gesetzte Felder
  und Kreuze. „Eintragen" übernimmt das Feld, „Selbst machen" nicht.
- **AC-10** `fertig` **Warnung bei falschen Feldern** — Widerspricht ein gefülltes
  Feld oder ein Kreuz dem Bild, sieht der Spieler zuerst die Warnung „Da stimmt
  etwas nicht" mit „Selbst suchen" und „Hinweis trotzdem". Erst „Hinweis
  trotzdem" zeigt einen Hinweis auf ein einzelnes Feld, der die falschen
  Angaben ausblendet. Das Gitter selbst markiert keine Fehler.

### Ende, Speicher und Statistik

- **AC-11** `fertig` **Bild fertig** — Sind genau die Felder des Bildes gefüllt,
  ist das Rätsel gelöst; Kreuze und unmarkierte freie Felder spielen keine Rolle.
  Das Gitter zeigt das Bild ohne Kreuze und ohne Linien, darunter „Bild fertig." mit
  Stufe, Zeit und Zahl der Hinweise („ohne Hinweis", wenn keiner); das Ergebnis
  scrollt ins Bild. War die Zeit besser als alle früheren dieser Stufe, steht dort
  „Neue Bestzeit". Danach nimmt das Gitter keine Züge mehr an.
- **AC-12** `fertig` **Rätsel überlebt Schließen** — Ein laufendes Rätsel steht
  nach Zurück, Neuladen oder Neustart der App mit Stufe, Füllungen, Kreuzen,
  Hinweiszahl und verbrauchter Zeit wieder da; die Zeit dazwischen zählt nicht.
  Nach einem fertigen Bild beginnt beim nächsten Öffnen ein neues auf klein.
- **AC-13** `fertig` **Fertiges Bild in der Statistik** — Jedes gelöste Rätsel
  wird mit `gewonnen: true`, `dauer`, `stufe` (`klein`, `mittel`, `gross`) und
  `hilfen` notiert. `hilfen` zählt jeden gezeigten Hinweis auf ein Feld, auch wenn
  man ihn nicht einträgt; die Warnung zählt nicht. Ein verworfenes Rätsel wird
  nicht notiert.
- **AC-14** `fertig` **Bestzeit je Größe** — Die Statistik zeigt je Größe die
  Bestzeit aus gelösten Partien und „–", solange es keine gibt – auch bei leerer
  Liste und bei Partien, denen `stufe`, `dauer` oder `gewonnen` fehlt.
- **AC-15** `fertig` **Anleitung auf Abruf** — Das Werkzeug „Anleitung" erklärt
  die Zahlen mit Beispiel, das Tippen und Wischen, die drei Wege zum Kreuz, blasse
  Zahlen, „Rückgängig", die Tasten am Rechner und rät, bei den größten Zahlen
  anzufangen.
- **AC-16** `fertig` **Stufe und Ende ohne Lesen** — Kopfzeile, Blatt „Neues
  Rätsel" und Knöpfe unter dem Ergebnis zeigen die Stufe auch als Punkte in
  Ampelfarbe (Schnittstelle AC-15); die gespielte heißt dort „Nochmal" und trägt
  den Kreispfeil. Über „Bild fertig." steht ein grüner Haken.

## Randfälle

| #    | Fall                                                  | Erwartetes Verhalten                                                        |
| ---- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| RF-1 | Mehr Felder gefüllt, als das Bild hat                 | Der Zähler geht über „nötig" hinaus, z. B. 14/12; kein Sieg, nichts gesperrt. |
| RF-2 | Wischen über Felder mit Kreuz                         | Die Kreuze bleiben stehen. Früher schluckte ein Strich sie.                 |
| RF-3 | Für mittel oder groß findet sich kein lösbares Bild   | Es kommt ein Rätsel der Stufe klein.                                        |
| RF-4 | Fenster wird während der Partie schmaler              | Das Gitter wird neu gebaut, Füllungen und Kreuze bleiben.                   |
| RF-5 | Reihe mit der Zahl 0                                  | Die ganze Reihe bleibt leer; der Hinweis kann das sofort begründen.         |

## Hintergrund

Aus den Kommentaren im Code:

* Der Generator würfelt ein Bild und behält es nur, wenn es sich Zeile für Zeile
  rein logisch lösen lässt – ohne Probieren, ohne Rückzieher. Dazu dient dieselbe
  Routine, die auch der Hinweis benutzt: Für eine einzelne Zeile werden alle noch
  möglichen Belegungen aufgezählt und geschnitten. Was in allen gleich ist, steht
  fest.
* Falsch gesetzte Felder würden den Schluss des Hinweises vergiften; er blendet
  sie deshalb für seine Rechnung aus.
* Eine einzige Zählhilfe in der Mitte des Gitters halbiert die Reihe beim
  Abzählen. Bei ungerader Kante gibt es keine: Sie läge neben der Mitte und zählte
  falsch vor.
