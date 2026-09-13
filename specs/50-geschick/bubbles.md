# Blasen

**Datei:** [`spiele/bubbles.js`](../../spiele/bubbles.js)
**Stand:** 12/12 fertig

## Zweck

Bubble Shooter für den Finger: zielen, über die Bande spielen, drei gleiche
Farben zum Platzen bringen. Druck macht keine Uhr, sondern jeder Schuss, bei
dem nichts platzt – wer nachdenkt, verliert nichts.

## Akzeptanzkriterien

### Steuerung

- **AC-1** `fertig` **Zielen mit dem Finger** — Liegt der Finger auf dem Feld
  oberhalb der Kanone, zielt sie auf ihn (zwischen etwa 10° und 170°), und
  Loslassen schießt. Wer unterhalb der Kanone loslässt, schießt nicht. Der
  erste Tipp startet die Partie; ein Tipp in der Pause setzt sie nur fort und
  schießt nicht. Am Rechner: Pfeile links/rechts (A, D) drehen, Leertaste,
  Pfeil hoch oder W schießt, Pfeil runter, S oder X tauscht, P und Escape
  schalten die Pause um.
- **AC-2** `fertig` **Ziellinie hält Wort** — Solange nichts fliegt, zeigt eine
  gepunktete Linie den Flug bis zur ersten Blase oder zur Decke, über
  höchstens eine Bande. Linie und Flug rechnen in denselben Schritten: Die
  Blase bleibt genau in dem Feld hängen, in dem die Linie endet.
- **AC-3** `fertig` **Tauschen** — Die nächste Blase steht links unten; ein
  Tipp darauf tauscht sie mit der in der Kanone.

### Regeln

- **AC-4** `fertig` **Sechseckraster** — Acht Blasen je Reihe, jede zweite um
  eine halbe Blase versetzt. Die Wände werfen zurück. Eine fliegende Blase
  bleibt am nächsten freien Feld hängen, das an der Decke oder an einer Blase
  hängt; getroffen wird mit einem etwas kleineren Kreis, als gemalt ist.
- **AC-5** `fertig` **Drei gleiche platzen** — Hängen nach dem Anlegen drei oder
  mehr gleiche Farben zusammen, platzen sie (je 10 Punkte). Was danach nicht
  mehr über Nachbarn an der Decke hängt, fällt (je 20 Punkte).
- **AC-6** `fertig` **Nur Farben aus dem Feld** — Kanone und Vorrat bekommen nur
  Farben, die noch im Feld liegen; verschwindet eine, wird umgefärbt. Neue
  Reihen haben vier Farben, ab 1500 Punkten fünf, ab 5000 sechs.
- **AC-7** `fertig` **Fehlschüsse schieben Reihen** — Jeder Schuss, bei dem
  nichts platzt, kostet einen der Punkte rechts unten. Sind sechs verbraucht,
  schiebt sich oben eine neue Reihe herein und alles rutscht eine Reihe
  tiefer. Je fünf solcher Reihen ist es ein Fehlschuss weniger, mindestens
  drei.
- **AC-8** `fertig` **Leeres Feld** — Ist das Feld leer, gibt es 1000 Punkte, die
  Meldung „Feld leer – 1000 Punkte." und sechs neue Reihen.
- **AC-9** `fertig` **Über der Linie** — Liegt eine Blase in der dreizehnten
  Reihe, unter der gestrichelten Linie, endet die Partie mit „Über der Linie."
  samt Punkten, Blasen und Spielzeit, bei neuem Bestwert „Das ist dein
  Bestwert.", darunter „Nochmal".
- **AC-10** `fertig` **Farben mit Zeichen** — Jede der sechs Farben trägt ein
  eigenes Zeichen (Punkt, Dreieck, Quadrat, Ring, Raute, Kreuz), damit sie
  sich auch ohne Farbsehen unterscheiden.

### Speicher und Statistik

- **AC-11** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `punkte`, `blasen` und `dauer` notiert, ohne `gewonnen`. Oben stehen Punkte
  und Blasen, darunter der Bestwert.
- **AC-12** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt
  Bestwert, Punkte im Schnitt und die meisten Blasen einer Partie; fehlende
  oder unlesbare Felder zählen als 0.

Pause, Neuladen und Spielzeit folgen dem gemeinsamen Vertrag in der
[Echtzeit-Spec](echtzeit.md).

## Randfälle

| #    | Fall                                        | Erwartetes Verhalten                                                    |
| ---- | ------------------------------------------- | ----------------------------------------------------------------------- |
| RF-1 | Linie braucht eine zweite Bande             | Sie endet an der zweiten Wand; die Blase fliegt trotzdem weiter.        |
| RF-2 | Letzte Blase einer Farbe platzt             | Kanone und Vorrat werden auf eine Farbe umgefärbt, die noch da ist.     |
| RF-3 | App wird geschlossen, während eine fliegt   | Nach dem Neuladen Pause; nach „Weiter" fliegt sie zu Ende.              |
| RF-4 | Unlesbarer Stand im Speicher                | Frisches Feld mit sechs Reihen.                                         |

## Hintergrund

Die Kanone zielt auf den Finger statt ihm mit einem Ziehen zu folgen: Beim
Bubble Shooter ist der Winkel alles, und den bestimmt der Finger so am
genauesten. Das Abbrechen unterhalb der Kanone braucht keinen eigenen Knopf.

Nachgeprüft mit einem Wegwerf-Gerüst, das die Spieldatei in Node lädt und von
Hand taktet: vier gleiche platzen samt zwei hängenden (80 Punkte, danach leeres
Feld mit 1000 Punkten und sechs Reihen), sechster Fehlschuss schiebt eine
Reihe (Versatz wechselt, alte Reihe liegt darunter), Reihe 13 beendet mit
`punkte`, `blasen`, `dauer` ohne `gewonnen`. In 1000 Zufallsschüssen endete die
Linie 729-mal an einer Blase oder der Decke, und alle 729 Blasen blieben genau
dort hängen; 271 Linien brauchten eine zweite Bande. 300 Schüsse, nach denen
eine Farbe verschwand, luden nie eine Farbe, die nicht mehr im Feld lag.
