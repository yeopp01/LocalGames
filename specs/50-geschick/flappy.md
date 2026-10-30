# Flattervogel

**Datei:** [`spiele/flappy.js`](../../spiele/flappy.js)
**Stand:** 11/11 fertig

## Zweck

Flappy Bird: ein Tipp, ein Flügelschlag, und zwischen den Röhren hindurch.
Eine einzige Eingabe – wie für den Finger gemacht. Etwas gnädiger als das
Vorbild, damit es schwer bleibt, aber nicht unfair wird.

## Akzeptanzkriterien

### Steuerung

- **AC-1** `fertig` **Tippen ist Flattern** — Ein Tipp irgendwo auf das Feld oder
  auf die freie Fläche darunter gibt beim Aufsetzen des Fingers einen
  Flügelschlag. Der erste Tipp startet die Partie; bis dahin steht „Tippen zum
  Flattern" da. Leertaste, Enter, Pfeil hoch und W tun dasselbe; eine gehaltene
  Taste flattert nicht wiederholt. P und Escape schalten die Pause um. Setzt das
  Spiel fort, verliert ein fokussierter Knopf den Fokus: Die nächste Leertaste
  flattert, statt noch einmal den Pause-Knopf zu drücken.

### Flug

- **AC-2** `fertig` **Fallen und Schwung** — Der Vogel fällt mit einer
  Schwerkraft von 950 Einheiten je s², höchstens mit 340 je s. Ein
  Flügelschlag setzt die Geschwindigkeit auf 260 nach oben, gleich wie schnell
  er gerade fällt. Die Decke hält ihn auf, beendet aber nichts.
- **AC-3** `fertig` **Faire Röhren** — Alle 96 Einheiten Strecke kommt eine
  Röhre mit einer Lücke von 62 Einheiten (gut sechsmal der Vogel). Die Mitte
  der Lücke liegt zwischen 44 und 182, und zwei aufeinanderfolgende Lücken
  liegen höchstens 64 auseinander.
- **AC-4** `fertig` **Ein Punkt je Röhre** — Hat der Vogel die Mitte einer Röhre
  hinter sich, zählt sie einen Punkt.
- **AC-5** `fertig` **Anstoßen, fallen, Ende** — Berührt der Vogel eine Röhre,
  bleibt alles stehen, er fällt zu Boden, und Tipps zählen nicht mehr. Am
  Boden – ob nach einer Röhre oder direkt – endet die Partie mit
  „Abgestürzt.".
- **AC-6** `fertig` **Ende mit Bilanz** — Nach dem Ende stehen Röhren und
  Flugzeit in der Karte auf dem Feld, bei neuem Bestwert die Marke „Das ist dein
  Bestwert.", darunter „Nochmal", das gleich mit einem Flügelschlag losfliegt.
  Im Absturz und in den ersten 600 ms nach dem Aufschlag zählt kein Tipp – ein
  Tipp zu viel soll nicht gleich den nächsten Flug beginnen. Danach beginnt ein
  Tipp oder eine Flatter-Taste sofort den nächsten Flug.

### Speicher und Statistik

- **AC-7** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `punkte` und `dauer` notiert, ohne `gewonnen`. Oben stehen die Röhren, unter
  dem Titel der Bestwert oder „Noch kein Bestwert".
- **AC-8** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt
  Bestwert, Röhren im Schnitt (eine Nachkommastelle) und den längsten Flug;
  fehlende Felder zählen als 0.

### Ansicht

- **AC-9** `fertig` **Karte statt Schleier** — Schild, Pausen- und Endknöpfe stehen
  in einer Karte auf dem Feld, das darum herum in voller Farbe sichtbar bleibt. In
  der Pause steht sie in der Hälfte, in der der Vogel nicht ist; nach dem Absturz
  in der Mitte. Auf einem Pixel 7, in 1366 × 700 und in 839 × 412 passt alles ohne
  Scrollen.
- **AC-10** `fertig` **Zahl im Feld** — Sobald der Flug läuft, steht die Zahl der
  Röhren groß oben im Feld, gut lesbar über Himmel und Röhre, hell wie dunkel.
- **AC-11** `fertig` **Himmel und Boden** — Das Feld hat einen getönten Himmel und
  einen deutlich sichtbaren Boden, aus den Tokens der App, hell wie dunkel.

## Randfälle

| #    | Fall                                     | Erwartetes Verhalten                                         |
| ---- | ---------------------------------------- | ------------------------------------------------------------ |
| RF-1 | Nach dem Start kein weiterer Tipp        | Nach knapp einer Sekunde am Boden, 0 Röhren.                 |
| RF-2 | App wird im Absturz geschlossen          | Nach dem Neuladen Pause; nach „Weiter" oder einem Tipp fällt er zu Ende. |
| RF-3 | Tipp in der Pause                        | Die Partie läuft weiter, und der Tipp ist gleich ein Flügelschlag. |
| RF-4 | „Weiter" in der Karte                    | Die Partie läuft weiter, aber ohne Flügelschlag.             |

## Hintergrund

Die Maße des Vorbilds auf dieses Feld umgerechnet ergäben eine Lücke von etwa
viermal der Vogelhöhe. Hier ist sie gut sechsmal so hoch, der Vogel trifft mit
einem etwas kleineren Kreis, als er gemalt ist, und der Versatz zwischen zwei
Lücken ist gedeckelt.

Nachgeprüft mit dem Gerüst aus der [Echtzeit-Spec](echtzeit.md): Ohne Tipp
liegt der Vogel nach 0,88 s am Boden. Ein Bot, der unter die Lückenmitte fällt
und dann flattert, flog in sechs Partien je zehn Minuten durch (386 Röhren),
ohne einmal anzustoßen; über alle Röhren war der größte Versatz 63,9 und keine
Mitte außerhalb von 44 bis 182.
