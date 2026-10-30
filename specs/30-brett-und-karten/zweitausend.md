# 2048

**Datei:** [`spiele/zweitausend.js`](../../spiele/zweitausend.js)
**Stand:** 18/18 fertig

## Zweck

Das bekannte Schiebespiel für zwischendurch: gleiche Zahlen zusammenschieben,
bis 2048 dasteht – und wer mag, weiter. Mit dem Finger auf dem Handy genauso
spielbar wie mit den Pfeiltasten am Rechner.

## Akzeptanzkriterien

### Brett und Steuerung

- **AC-1** `fertig` **Vier mal vier Felder** — Das Brett hat 4 × 4 Felder. Eine
  neue Partie beginnt mit zwei Kacheln an zufälligen freien Stellen. Jede neue
  Kachel ist eine 2, etwa jede zehnte eine 4.
- **AC-2** `fertig` **Pfeiltasten und WASD** — Die Pfeiltasten und W/A/S/D
  schieben in die jeweilige Richtung. Mit gedrückter Strg-, Alt- oder
  Meta-Taste und bei offenem Blatt passiert nichts.
- **AC-3** `fertig` **Wischen über das Brett** — Eine Wischgeste auf dem Brett
  schiebt in die Richtung der stärkeren Achse, sobald sie mindestens 30 Pixel
  lang ist – schon während der Bewegung, nicht erst beim Loslassen, und auch wenn
  der Finger das Brett dabei verlässt. Eine Geste ist ein Zug. Kürzere Bewegungen
  zählen nicht, und die Seite scrollt beim Wischen nicht mit.
- **AC-4** `fertig` **Richtungsknöpfe unter dem Brett** — Vier Knöpfe ← ↑ ↓ →
  unter dem Brett, mindestens 44 px hoch, tun dasselbe wie die Pfeiltasten. Nach
  dem Ende der Partie sind sie ausgeblendet.

### Spielzug

- **AC-5** `fertig` **Einmal verschmelzen je Zug** — Alle Kacheln rutschen in
  Schubrichtung bis an den Rand oder an die nächste Kachel. Zwei gleiche
  Kacheln verschmelzen zu ihrer Summe, jede Kachel höchstens einmal je Zug, die
  vorderen zuerst: `2 2 2 2` wird `4 4`, `4 4 8` wird `8 8`, `8 4 2 2` wird
  `8 4 4`. Das gilt in allen vier Richtungen gleich.
- **AC-6** `fertig` **Neue Kachel nur nach Zug** — Nur ein Zug, der mindestens
  eine Kachel bewegt oder verschmolzen hat, zählt als Zug und bringt eine neue
  Kachel an einer freien Stelle. Eine Richtung, in der nichts rutscht, ändert
  weder Brett noch Zugzähler.
- **AC-7** `fertig` **Punkte und Bestwert** — Jede Verschmelzung bringt ihren
  neuen Wert als Punkte (aus zwei Vieren werden 8 Punkte); ein kurzes „+8" zeigt
  sie. Oben stehen Punkte, Züge und – sobald eine beendete Partie mit Punkten in
  der Statistik steht – der Bestwert, der mitläuft, wenn die laufende Partie ihn
  schlägt. Die Zeile unter dem Titel nennt die höchste Kachel.

### Ende der Partie

- **AC-8** `fertig` **2048 beendet nichts** — Liegt zum ersten Mal eine Kachel
  ab 2048, öffnet sich das Blatt „Geschafft: 2048" mit „Weiter". Die Partie
  läuft weiter, und in derselben Partie kommt das Blatt nicht wieder.
- **AC-9** `fertig` **Kein Zug mehr möglich** — Bewegt nach einem Zug keine der
  vier Richtungen mehr etwas, ist die Partie vorbei: „Kein Zug mehr möglich."
  mit Punkten, höchster Kachel und Zügen, bei neuem Bestwert zusätzlich „Das
  ist dein Bestwert.", darunter „Nochmal". Danach nimmt das Brett keine Züge
  mehr an.
- **AC-10** `fertig` **Neu nur nach Rückfrage** — „Neues Spiel" beginnt sofort,
  wenn noch kein Zug gemacht oder die Partie vorbei ist. Sonst fragt das Blatt
  „Neu anfangen?". Wer verwirft, bekommt ein frisches Brett, und die verworfene
  Partie landet nicht in der Statistik.

### Speicher und Statistik

- **AC-11** `fertig` **Partie überlebt Schließen** — Eine laufende Partie steht
  nach Zurück, Neuladen oder Neustart der App wieder da, mit Brett, Punkten,
  Zügen und der bis zum letzten Zug verbrauchten Zeit. Die Zeit, in der das
  Spiel geschlossen war, zählt nicht mit. Eine beendete Partie wird nicht
  wiederhergestellt.
- **AC-12** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `gewonnen`, `dauer`, `punkte`, `zuege` und `hoechste` notiert. `gewonnen` ist
  `true`, wenn am Ende eine Kachel ab 2048 liegt, sonst `false`.
- **AC-13** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt
  Bestwert, höchste Kachel und Punkte im Schnitt, dazu vom Rahmen „Züge im
  Schnitt". Partien ohne `punkte` oder `hoechste` zählen dort als 0; eine leere
  Liste ergibt Nullen und keinen Fehler.

### Bedienung und Bild

- **AC-14** `fertig` **Kacheln gleiten** — Beim Zug rutschen die Kacheln sichtbar an
  ihren neuen Platz (gut 100 ms), Verschmelzungen und die neue Kachel treten danach
  auf. Der neue Stand gilt sofort: Ein schneller nächster Zug wartet nicht auf die
  Animation. Bei „Bewegung reduzieren" springt alles sofort.
- **AC-15** `fertig` **Ein Schritt zurück** — „Rückgängig" und die Rücktaste nehmen den
  letzten Zug samt neuer Kachel, Punkten und Zugzähler zurück, genau einen Schritt.
  Danach ist der Knopf gesperrt, bis wieder gezogen wurde. Der Schritt übersteht
  Neuladen; ein gespeicherter Stand von früher läuft ohne ihn weiter. Nach dem Ende
  der Partie gibt es kein Zurück, sie steht dann schon in der Statistik.
- **AC-16** `fertig` **Brett nach Fenster** — Das Brett nutzt den Platz, höchstens
  532 px; Punkte, Brett und Knöpfe passen auf dem Handy und in einem flachen Fenster
  (1366×700, auch 1000×560) ohne Scrollen. Das Ergebnis wird von selbst ins Bild
  geholt.
- **AC-17** `fertig` **Enter nach dem Ende** — Nach dem Ende beginnt Enter ein neues
  Brett.
- **AC-18** `fertig` **Zug ohne Wirkung** — Eine Richtung, in der nichts rutscht, lässt
  das Brett kurz in diese Richtung zucken, sonst geschieht nichts.

## Randfälle

| #    | Fall                                                  | Erwartetes Verhalten                                                  |
| ---- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| RF-1 | Die 2048 entsteht mit dem letzten möglichen Zug       | Blatt „Geschafft" und Ende erscheinen zugleich; notiert mit `gewonnen: true`. |
| RF-2 | Kacheln über 2048 (4096, 8192 …)                      | Werden normal weitergespielt und in einer gemeinsamen Farbe gezeigt.  |
| RF-3 | Punktestand gleich dem bisherigen Bestwert            | Auch dann steht „Das ist dein Bestwert." da.                          |
| RF-4 | Mehr als einen Zug zurücknehmen                       | Geht nicht – „Rückgängig" reicht genau einen Schritt zurück (AC-15).  |
| RF-5 | Gespeicherter Stand mit falscher Brettgröße           | Es beginnt ein frisches Brett.                                        |
| RF-6 | Nach einer beendeten Partie das Spiel neu öffnen      | Es beginnt ein frisches Brett.                                        |

## Hintergrund

Der Kern ist eine einzige Zeilenoperation: eine Reihe nach links schieben.
Die anderen drei Richtungen entstehen daraus, dass jede Reihe vorher in
Schubrichtung ausgelesen und hinterher zurückgeschrieben wird. Das spart drei
Viertel des Codes – und drei Viertel der Stellen, an denen die
Verschmelzregel falsch sein könnte.
