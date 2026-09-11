# Invasoren

**Datei:** [`spiele/invaders.js`](../../spiele/invaders.js)
**Stand:** 15/15 fertig

## Zweck

Space Invaders für den Daumen: Reihen von Außerirdischen rücken hin und her
und immer tiefer, eine Kanone hält dagegen, vier Deckungen zerbröseln. Auf
dem Handy folgt die Kanone der Bewegung des Fingers, und solange er aufliegt,
feuert sie.

## Akzeptanzkriterien

### Aufstellung und Steuerung

- **AC-1** `fertig` **Fünf Reihen, vier Deckungen** — Eine Partie beginnt mit 45
  Angreifern in 5 Reihen zu 9 (oben 30 Punkte, zwei Reihen 20, zwei Reihen
  10), vier Deckungen, einer Kanone in der Mitte und drei Leben. Sie läuft erst
  nach einem Tipp oder einer Taste; bis dahin steht „Tippen zum Starten" da.
- **AC-2** `fertig` **Ziehen lenkt, Berühren feuert** — Ein Finger auf dem Feld
  oder der Leiste darunter bewegt die Kanone um genau so viel, wie er selbst
  zieht, egal wo er liegt. Solange er aufliegt, feuert sie. Ein zweiter Finger
  wird nicht beachtet, und die Seite scrollt nicht.
- **AC-3** `fertig` **Tasten** — Pfeil links/rechts und A/D bewegen die Kanone,
  Leertaste, Pfeil hoch und W feuern, solange sie gedrückt sind. P und Escape
  schalten die Pause um.
- **AC-4** `fertig` **Ein Schuss zur Zeit** — Es ist höchstens ein eigener Schuss
  unterwegs. Ein Tipp, während einer fliegt, geht nicht verloren: Der nächste
  Schuss geht los, sobald der alte aufschlägt. Ein Schuss trifft
  Außerirdische, Bomben, das Schiff oben und die Deckungen.

### Angreifer

- **AC-5** `fertig` **Vorrücken wie im Original** — Die Aufstellung rückt
  schrittweise zur Seite; am Rand geht sie eine Stufe tiefer und kehrt um. Je
  weniger Angreifer übrig sind, desto kürzer der Schritt-Takt (0,42 s bei 45,
  nie unter 0,04 s), und jede Welle ist bis zur siebten um 12 % schneller.
- **AC-6** `fertig` **Bomben von unten** — Bomben wirft nur der unterste
  Angreifer einer Spalte, gut jede dritte von dem, der der Kanone am nächsten
  ist. Es fallen höchstens drei zugleich, ab jeder zweiten Welle eine mehr, bis
  fünf.
- **AC-7** `fertig` **Deckungen bröckeln** — Wo ein Schuss oder eine Bombe eine
  Deckung trifft, bricht ein kleiner Krater heraus, und das Geschoss ist weg.
  Erreichen die Reihen die Deckungen, fressen sie sich hindurch.
- **AC-8** `fertig` **Das Schiff oben** — Alle 18 bis 28 Sekunden zieht, solange
  noch mindestens sechs Angreifer da sind, ein Schiff über das Feld. Ein
  Treffer bringt 50, 100, 150 oder 300 Punkte, und der Wert steht kurz dort.

### Leben und Ende

- **AC-9** `fertig` **Treffer kostet ein Leben** — Trifft eine Bombe die Kanone,
  zerspringt sie, alles steht 1,2 s still, und die fallenden Bomben
  verschwinden. Ist es das letzte Leben, endet die Partie mit „Abgeschossen.".
- **AC-10** `fertig` **Gelandet ist vorbei** — Erreicht ein Angreifer die Höhe der
  Kanone, endet die Partie unabhängig von den Leben mit „Sie sind gelandet.".
- **AC-11** `fertig` **Neue Welle** — Ist die letzte Reihe geräumt, steht 1,4 s
  „Welle 2" (3, 4 …) da. Die neue Aufstellung beginnt je Welle eine Stufe
  tiefer (höchstens fünf Stufen), und die Deckungen sind wieder heil.
- **AC-12** `fertig` **Bonus bei 1500** — Beim Erreichen von 1500 Punkten kommt
  einmal je Partie ein Leben dazu, angesagt mit „+1 Leben".
- **AC-13** `fertig` **Ende mit Bilanz** — Nach dem Ende stehen Punkte, Welle und
  Spielzeit unter dem Feld, bei neuem Bestwert „Das ist dein Bestwert.",
  darunter „Nochmal".

### Speicher und Statistik

- **AC-14** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `punkte`, `welle` und `dauer` notiert, ohne `gewonnen`. Oben stehen Punkte,
  Welle und Leben, unter dem Titel der Bestwert.
- **AC-15** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt
  Bestwert, höchste Welle und Punkte im Schnitt; fehlende oder unsinnige
  Felder zählen als 0.

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                           |
| ---- | ------------------------------------------------- | -------------------------------------------------------------- |
| RF-1 | Letzter Angreifer, und er ist am schnellsten      | 50 Einheiten je Sekunde – langsamer als die Kanone mit 80.     |
| RF-2 | Schuss trifft eine Bombe                          | Beide sind weg.                                                |
| RF-3 | Finger zieht über das Feld hinaus                 | Die Kanone folgt weiter, bis der Finger abhebt; sie bleibt im Feld. |
| RF-4 | Tipp in der Pause                                 | Die Partie läuft weiter, und die Kanone feuert gleich.         |

## Hintergrund

Die Kanone folgt der Bewegung, nicht der Stelle des Fingers. Folgte sie der
Stelle, läge der Daumen immer über ihr, und man sähe die Bombe nicht, die
gerade trifft. So kann der Daumen unten auf der Leiste liegen.

Die Figuren sind eigene Pixelbilder im Geist des Automaten von 1978, keine
Abschrift. Jedes Bild wird als ein einziger Pfad gefüllt: Einzeln gefüllte
Pixel hätten bei krummer Vergrößerung feine Fugen.

Nachgeprüft mit dem Gerüst aus der [Echtzeit-Spec](echtzeit.md): Ohne
Gegenwehr fallen die Leben 3 → 2 → 1 → 0, die Deckungen verloren dabei
Pixel; eine Aufstellung auf Höhe 150 landet sofort; der Bonus kommt bei 1500;
die zweite Welle beginnt auf Höhe 32 mit heilen Deckungen; 40 px Ziehen bei
2 px je Einheit bewegen die Kanone um 20 Einheiten. Ein Bot, der zielt, aber
nicht ausweicht, holte 550 bis 850 Punkte. Mit dem alten Mindesttakt von
0,025 s war der letzte Angreifer so schnell wie die Kanone und für den Bot
nicht mehr zu treffen – daher 0,04 s.
