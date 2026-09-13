# Sternjäger

**Datei:** [`spiele/impact.js`](../../spiele/impact.js)
**Stand:** 17/17 fertig

## Zweck

Space Impact wie auf dem Nokia 3310: Das Schiff fliegt links, die Welt zieht
von rechts vorbei, Staffeln von Gegnern kommen entgegen, und am Ende jedes
Levels wartet ein Endgegner. Dazu Spezialwaffen mit knapper Munition und
Extras zum Einsammeln. Auf dem Handy folgt das Schiff der Bewegung des
Fingers, und solange er aufliegt, schießt es. Ersetzt die früheren Invasoren.

## Akzeptanzkriterien

### Steuerung

- **AC-1** `fertig` **Start mit drei Leben** — Eine Partie beginnt in Level 1
  „Sternenfeld" mit dem Schiff links in der Mitte, 0 Punkten, drei Leben und
  drei Raketen. Das Feld ist im Querformat (168 × 96). Die Partie läuft erst
  nach einem Tipp oder einer Taste; bis dahin steht „Tippen zum Starten" da.
- **AC-2** `fertig` **Ziehen lenkt, Berühren feuert** — Ein Finger auf dem Feld
  oder der Leiste darunter bewegt das Schiff um genau so viel, wie er selbst
  zieht, waagerecht wie senkrecht, egal wo er liegt. Solange er aufliegt,
  schießt es: höchstens fünf Schüsse je Sekunde und vier zugleich. Ein zweiter
  Finger lenkt nicht, und die Seite scrollt nicht.
- **AC-3** `fertig` **Tasten** — Pfeiltasten und WASD lenken, die Leertaste
  schießt, solange sie gedrückt ist, X und K zünden die Spezialwaffe, P und
  Escape schalten die Pause um.
- **AC-4** `fertig` **Knopf für die Spezialwaffe** — Rechts neben der Leiste
  steht die Spezialwaffe mit ihrem Namen und der Zahl, die noch übrig ist. Ein
  Tipp darauf zündet sie, auch mit einem zweiten Finger, während der erste
  lenkt; das Lenken läuft danach ungestört weiter. Bei 0 ist der Knopf blass
  und tut nichts.

### Level

- **AC-5** `fertig` **Sechs Welten** — Sternenfeld, Asteroidengürtel,
  Mondhügel, Eishöhle, Ruinenstadt und Mutterschiff, jede mit eigenen
  Gegnerarten und eigenem Endgegner. Zu Beginn eines Levels stehen „Level n"
  und der Name kurz im Feld. Nach 50 bis 60 Sekunden Staffeln kommt der
  Endgegner – sobald das Feld leer ist, spätestens acht Sekunden später.
- **AC-6** `fertig` **Jedes Mal derselbe Ablauf** — Ein Level bringt in jeder
  Partie dieselben Staffeln und Extras in derselben Reihenfolge, zur selben
  Zeit und auf derselben Höhe.
- **AC-7** `fertig` **Gelände schiebt, tötet nicht** — Hügel, Höhlendecke,
  Häuser und Rumpfplatten begrenzen den Raum. Das Schiff lässt sich nicht
  hineinlenken; rückt Gelände heran, schiebt es das Schiff ohne Sprung weg.
  Zu Beginn eines Levels wächst das Gelände in zwei Sekunden hoch, statt
  plötzlich dazustehen. Das alles kostet kein Leben. Schüsse beider Seiten
  enden im Gelände.
- **AC-8** `fertig` **Nach dem sechsten von vorn** — Auf Level 6 folgt Level 7
  als Sternenfeld und so fort. Mit jeder Runde bewegen sich Gegner und ihre
  Schüsse um 15 % schneller (höchstens 60 %), jeder Gegner hält einen Treffer
  mehr aus, jeder Endgegner 30 % mehr.

### Gegner

- **AC-9** `fertig` **Fünf Arten** — Pfeil fliegt geradeaus (10 Punkte), Welle
  in einer Wellenlinie (15), Jäger hält auf die Höhe des Schiffs zu (2 Treffer,
  20), Schütze bleibt stehen und schießt gezielt (3 Treffer, 30), Brocken
  treibt langsam (5 Treffer, 40). Wer getroffen wird und nicht fällt, blinkt.
- **AC-10** `fertig` **Endgegner** — Er fliegt von rechts ein, ein Balken oben
  zeigt, wie viel er noch aushält. Jeder der sechs hat ein eigenes Bild, eine
  eigene Bewegung und eigene Angriffe: gezielter Schuss, Fächer, Salve, Ring
  oder ausgesetzte Pfeile. Besiegt bringt er 200 Punkte mal Level; seine
  Schüsse und die übrigen Gegner verschwinden, und nach knapp zwei Sekunden
  beginnt das nächste Level.

### Waffen und Extras

- **AC-11** `fertig` **Drei Spezialwaffen** — Die Rakete sucht sich das nächste
  Ziel vor sich (5 Schaden). Der Strahl trifft 0,35 s lang jeden in der Zeile
  des Schiffs einmal (6) und löscht feindliche Schüsse darin. Die Wand fegt
  über das ganze Feld, trifft jeden einmal (8) und schluckt feindliche
  Schüsse. Strahl und Wand gibt es nur einmal zugleich.
- **AC-12** `fertig` **Extras** — Drei gelbe Kästchen je Level treiben mit dem
  Gelände heran. Dieselbe Waffe füllt um drei auf (höchstens neun), eine andere
  tauscht die Waffe gegen drei Schuss der neuen. Das Herz bringt ein Leben
  (höchstens neun). Was man bekommen hat, steht kurz im Feld.

### Leben und Ende

- **AC-13** `fertig` **Treffer kostet ein Leben** — Ein feindlicher Schuss, ein
  Gegner oder der Endgegner selbst kostet ein Leben. Alle feindlichen Schüsse
  verschwinden, und das Schiff blinkt 2,2 s lang, in denen es nichts trifft.
  Ein Gegner, der das Schiff rammt, ist ebenfalls hin, bringt aber keine
  Punkte.
- **AC-14** `fertig` **Ende mit Bilanz** — Nach dem letzten Leben steht der Knall
  noch 1,2 s, dann „Abgeschossen." mit Punkten, Level und Spielzeit unter dem
  Feld, bei neuem Bestwert „Das ist dein Bestwert.", darunter „Nochmal".

### Speicher und Statistik

- **AC-15** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `punkte`, `level` und `dauer` notiert, ohne `gewonnen`. Oben stehen Punkte,
  Level und Leben, unter dem Titel der Bestwert.
- **AC-16** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt
  Bestwert, höchstes Level und Punkte im Schnitt; fehlende oder unsinnige
  Felder zählen als 0.
- **AC-17** `fertig` **Invasoren-Partien bleiben** — Partien des früheren
  Spiels Invasoren (`spiel: 'invaders'`) bleiben im Speicher und in der
  Sicherung und zählen weiter in Partien, Spielzeit, Kalender und Tagesserie
  der Gesamtstatistik. Einen eigenen Block haben sie nicht mehr, und in den
  Bestwert von Sternjäger gehen sie nicht ein.

## Randfälle

| #    | Fall                                                   | Erwartetes Verhalten                                                 |
| ---- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| RF-1 | Rakete fliegt, ihr Ziel fällt vorher                   | Sie sucht das nächste Ziel vor sich, sonst fliegt sie geradeaus aus dem Feld. |
| RF-2 | Letztes Leben geht im Kampf mit dem Endgegner verloren | Die Partie endet; notiert wird das Level, in dem er stand.           |
| RF-3 | Spezialknopf bei 0 oder während der Endgegner zerfällt | Nichts passiert, die Zahl bleibt.                                    |
| RF-4 | Finger zieht über das Feld hinaus                      | Das Schiff folgt weiter, bis der Finger abhebt; es bleibt im Feld.   |
| RF-5 | Tipp in der Pause                                      | Die Partie läuft weiter, und das Schiff schießt gleich.              |
| RF-6 | Gespeicherter Stand eines älteren Spiels unter `impact` | Unlesbares ergibt ein frisches Feld (Echtzeit AC-9).                |

## Hintergrund

Die Figuren sind eigene Pixelbilder im Geist des Handys von 2000, keine
Abschrift. Der Name folgt der Reihe Schlange, Flattervogel, Hochhinaus: deutsch
in der Oberfläche, das Vorbild in der id.

Das Schiff folgt der Bewegung des Fingers, nicht seiner Stelle – aus demselben
Grund wie bei den Invasoren: Sonst läge der Daumen über dem Schiff und
verdeckte den Schuss, der gleich trifft. Die Spezialwaffe liegt auf einem
eigenen Knopf statt auf einem Doppeltipp: Ein Doppeltipp auf der Leiste würde
das Schiff jedes Mal ein Stück versetzen.

Die Level sind nicht zufällig. Jedes baut seinen Ablauf aus einem festen
Startwert; so lernt man ein Level wie damals, und wer stirbt, weiß beim
nächsten Mal, was kommt.

Gelände schiebt, statt zu töten. Auf einem Feld von 380 px Breite unter dem
Daumen wäre eine Bodenwelle, die unter dem Finger auftaucht, kein fairer Tod.

Nachgeprüft mit einem Wegwerf-Gerüst, das die Spieldatei in Node lädt und von
Hand taktet:

* Alle Pixelbilder haben gleich lange Zeilen.
* Ein unverwundbarer Bot, der nur mit der Hauptwaffe auf die Höhe des
  nächsten Gegners fliegt, kommt in 30 Spielminuten ohne NaN bis Level 12.
  Staffeln 50 bis 63 s je Level, Endgegner 10,5 / 31 / 15 / 18 / 22 / 28,5 s,
  in der zweiten Runde 13 bis 46 s.
* Zuerst pendelten Kreuzer (18 Einheiten/s) und Panzerschiff (20) so schnell,
  dass ein Schuss aus der Ferne sie verfehlte, bis er ankam: Der Bot brauchte
  101 und 239 s. Jetzt 11 und 13, und für eigene Schüsse zählt ein Endgegner
  eine Zeile höher und tiefer, als er aussieht.
* Ein Bot, der Schüssen ausweicht und Spezialwaffen zündet, kam in sechs
  Läufen mit verschiedenen Flughöhen bis Level 2, 5, 5, 6, 2 und 2
  (1295 bis 7530 Punkte). Die meisten Treffer kamen von Wellen und von
  Schüssen der Endgegner. Mit gleicher Flughöhe waren die Läufe gleich – der
  Ablauf ist fest.
* Ein Bot, der abwechselnd gegen Decke und Boden drückt und vor- und
  zurückfliegt, ragt in Sternenfeld, Hügeln, Höhle und Rumpf höchstens 0,04
  Einheiten ins Gelände; an den Hauswänden der Ruinenstadt einmal 4,3
  Einheiten für zwei Takte (1/60 s). Je Takt bewegt sich das Schiff höchstens
  1,7 Einheiten. Zuerst schob das Gelände nur mit 90 Einheiten je Sekunde,
  ohne Blick vor den Bug und ohne Hochwachsen: Da steckte das Schiff bis zu
  8 Einheiten tief, 48 Takte lang an Hauswänden und beim Wechsel in Höhle und
  Rumpf in der plötzlich erschienenen Decke.
* Mit echten Touch-Ereignissen auf einem Pixel 7 (Feld 379 × 217 px): 40 px
  und 20 px Ziehen auf der Leiste bewegen das Schiff genau um 40 und 20 px
  geteilt durch den Maßstab; ein zweiter Finger auf dem Knopf zündet die
  Rakete (3 → 2), und der erste lenkt danach unverändert weiter. Die Seite
  scrollt nicht.
