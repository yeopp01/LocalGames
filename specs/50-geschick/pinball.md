# Flipper

**Datei:** [`spiele/pinball.js`](../../spiele/pinball.js)
**Stand:** 22/22 fertig

## Zweck

Flipper nach dem Vorbild von „3D Pinball: Space Cadet", dem Weltraumtisch, der
jahrelang mit Windows kam: Feder rechts, Startrampe, Wurmlöcher, ein Schwarzes
Loch, Treibstoff und Missionen, mit denen man vom Kadetten zum Flottenadmiral
aufsteigt. Auf dem Handy mit zwei Daumen gespielt, am Rechner mit Z, / und
Leertaste wie damals. Nachgebaut sind Regeln und Gefühl, nicht das Bild.

## Akzeptanzkriterien

### Steuerung

- **AC-1** `fertig` **Zwei Hälften, zwei Flipper** — Ein Finger auf der linken
  Hälfte des Feldes hebt den linken Flipper, auf der rechten den rechten,
  solange er liegt; mehrere Finger zugleich gehen, auch neben dem Tisch. Am
  Rechner: Z, Y, Pfeil links oder Umschalt links für links; /, -, Pfeil rechts
  oder Umschalt rechts für rechts. P und Escape schalten die Pause um.
- **AC-2** `fertig` **Feder spannen, loslassen** — Liegt die Kugel auf der
  Feder, spannt ein Finger auf der rechten Hälfte (am Rechner Leertaste oder
  Pfeil runter) die Feder, in 0,8 s bis zum Anschlag. Loslassen schießt mit 260
  bis 800 Einheiten je Sekunde, je nach Spannung. Der erste Tipp startet die
  Partie; bis dahin steht „Feder spannen" da. Zu schwach Geschossenes rollt
  zurück auf die Feder.
- **AC-3** `fertig` **Rütteln und TILT** — X, Punkt und Pfeil hoch stoßen die
  rollende Kugel nach links, rechts oder oben. Jeder Stoß zählt eins, der
  Zähler fällt um 0,5 je Sekunde; ab 1,5 steht „Vorsicht!" da, ab 2,5 ist TILT
  – also beim dritten Stoß innerhalb einer Sekunde:
  Die Flipper fallen und bleiben unten, es gibt keine Punkte, keinen
  Missionsfortschritt und keine Rettung, bis die nächste Kugel auf der Feder
  liegt.

### Tisch

- **AC-4** `fertig` **Nichts geht durch Wände** — Jeder Takt wird so geteilt,
  dass sich weder Kugel noch Flipperspitze in einem Teilschritt mehr als 1,5
  Einheiten bewegen. Die Kugel steckt nie mehr als 1,2 Einheiten in einer Wand
  und verlässt den Tisch nie.
- **AC-5** `fertig` **Keine Kugel bleibt liegen** — Liegt die Kugel 2,5 s still,
  ohne dass ein Flipper gehalten wird, bekommt sie einen Stoß. Wer sie auf dem
  gehaltenen Flipper wiegt, behält sie.
- **AC-6** `fertig` **Klappen nur in eine Richtung** — Die Klappe oben an der
  Federbahn lässt die Kugel hinaus, aber nicht zurück; die Klappe oben im
  linken Umlauf lässt sie nur von unten durch, ein harter Abschuss kommt also
  nicht den Umlauf herunter.
- **AC-7** `fertig` **Bumper und Schleudern** — Drei Angriffsbumper stoßen die
  Kugel mit mindestens 320 Einheiten je Sekunde zurück, die schrägen Seiten der
  Schleudern über den Flippern mit 280. Ein Bumpertreffer bringt 500 je Stufe,
  eine Schleuder 50.

### Regeln

- **AC-8** `fertig` **Bahnen und Geschicktreffer** — Jede Fahrt durch eine der
  drei Bahnen oben bringt 1000 Punkte und ihr Licht; ein Druck auf den linken
  Flipper schiebt die Lichter nach links, auf den rechten nach rechts. Leuchten
  alle drei, gibt es 5000, und die Bumper werden eine Stufe stärker (blau,
  grün, gelb, rot); nach 60 s ohne Aufwertung fallen sie eine Stufe zurück.
  Nach jedem Abschuss blinkt fünf Sekunden lang eine Bahn – ist sie die erste,
  durch die die Kugel rollt, gibt es 25.000 als Geschicktreffer.
- **AC-9** `fertig` **Mission annehmen** — Die drei blauen Missionsziele links
  bringen je 1500 Punkte, schon leuchtend 500. Sind alle drei getroffen, gibt es
  5000, und ohne laufende Mission ist eine bereit („Mission bereit: zur
  Rampe"). Die Startrampe bringt 10.000, fährt die Kugel zur linken Innenbahn,
  tankt voll und nimmt die bereite Mission an. Die Rampe, die eine Mission
  annimmt, zählt nicht als deren erster Schritt.
- **AC-10** `fertig` **Acht Missionen** — Der Reihe nach: Zielübung (8 Bumper),
  Aufklärung (3 Bahnen), Hyperraum (2 Umläufe), Bergung (3 Warnziele), Schwarzes
  Loch (das Loch, dann die Rampe), Wurmlochflug (2 Wurmlöcher), Nachschub (2
  Rampen), Sternensturm (15 Bumper, dann ein Umlauf). Je drei Ränge verlangt
  jeder Schritt mit mehr als einem Treffer ein Viertel mehr (aufgerundet). Die
  Anzeige nennt, was noch fehlt; die blauen Lichter in der Mitte zeigen den
  Fortschritt.
- **AC-11** `fertig` **Treibstoff** — Während einer Mission erlischt alle 9 s,
  in denen die Kugel im Spiel ist, eines von sechs Lichtern. Die Rampe tankt
  voll, jede Bahn gibt eines zurück. Bei zwei steht „Treibstoff knapp" da, bei
  null bricht die Mission ab („Treibstoff leer – Mission abgebrochen"), und die
  nächste Bereitschaft bringt dieselbe Mission wieder.
- **AC-12** `fertig` **Neun Ränge** — Eine erfüllte Mission bringt 20.000 mal
  (Rang + 1). Je zwei erfüllte Missionen bringen einen Rang: Kadett, Fähnrich,
  Leutnant, Kapitän, Korvettenkapitän, Kommandant, Kommodore, Admiral,
  Flottenadmiral – dazu 50.000 mal den neuen Rang und ein oranges Licht in der
  Mitte. Kapitän und Kommodore bringen je eine Extrakugel.
- **AC-13** `fertig` **Schwarzes Loch und Wurmlöcher** — Die Löcher bringen je
  7500 und fangen nur eine Kugel, die langsam genug ist: das Schwarze Loch
  unter 600, die Wurmlöcher unter 360 Einheiten je Sekunde. Sie halten sie 0,9 s
  und werfen sie von Wand und Abfluss weg aus. Leuchtet kein Wurmloch, lässt das
  Schwarze Loch ein zufälliges leuchten. Ein Wurmloch schickt die Kugel zum
  leuchtenden, und das Licht geht aus; wer das leuchtende selbst trifft, bekommt
  25.000 und eine Kugelrettung. Zurückrollen in das Loch, das die Kugel eben
  ausgeworfen hat, ist kein Treffer.
- **AC-14** `fertig` **Umlauf und Hyperraum** — Jede Fahrt durch den linken
  Umlauf nach oben bringt 5000 und ein violettes Licht; das fünfte ist ein
  Hyperraumsprung mit 75.000, danach beginnt es von vorn.
- **AC-15** `fertig` **Warnziele und Rückstoß** — Die drei gelben Warnziele
  rechts klappen bei einem Treffer um (je 750). Sind alle unten, gibt es 10.000,
  der Rückstoß beider Außenbahnen ist scharf, und nach 1,5 s stehen die Ziele
  wieder – nicht, solange die Kugel davor liegt. Ein scharfer Rückstoß schießt
  die Kugel einmal aus seiner Außenbahn zurück ins Feld (2000). Geht die Kugel
  verloren, ist er aus.
- **AC-16** `fertig` **Rettung** — Geht die Kugel in den ersten 10 s nach dem
  Abschuss in den Abfluss, liegt sie wieder auf der Feder („Kugel gerettet"),
  einmal je Kugel. Eine Rettung aus dem Wurmloch hält, bis sie gebraucht wird
  oder die Kugel verloren ist. Bei TILT rettet nichts.
- **AC-17** `fertig` **Ende mit Bilanz** — Nach der letzten Kugel (drei und die
  Extrakugeln) steht „Spiel vorbei." mit Punkten, Rang, Missionen und
  Spielzeit unter dem Feld, bei neuem Bestwert „Das ist dein Bestwert.",
  darunter „Nochmal". Tipps und Tasten starten keine neue Partie.

### Anzeige und Klang

- **AC-18** `fertig` **Anzeige unter dem Tisch** — Ein Streifen unter dem Tisch
  zeigt eine Meldung gut zwei Sekunden lang (höchstens vier warten), sonst TILT,
  die laufende Mission mit dem, was fehlt, und dem Treibstoff, eine bereite
  Mission oder Kugel und Rang. Ein zu langer Text wird schmaler, nicht
  abgeschnitten. Über dem Feld stehen Punkte mit Tausenderpunkten und die Kugel,
  in der Kopfzeile Rang und Bestwert.
- **AC-19** `fertig` **Geräusche** — Flipper, Bumper, Schleuder, Ziele, Bahnen,
  Abschuss, Rampe, Schwarzes Loch, Wurmloch, Auswurf, Umlauf, Kugelverlust,
  Rettung, Mission, erfüllte Mission, Beförderung, Extrakugel, Warnung und TILT
  haben je einen eigenen, erzeugten Ton. Vor dem ersten Tipp klingt nichts, in
  der Pause schläft der Ton.
- **AC-20** `fertig` **Ton abschaltbar** — Ein Knopf im Kopf schaltet den Ton aus
  und an, mit „Ton aus." bzw. „Ton an."; die Wahl gehört zum Stand und bleibt
  bei „Neu anfangen" und „Nochmal".

### Speicher und Statistik

- **AC-21** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `punkte`, `rang` (0 bis 8), `missionen` und `dauer` notiert, ohne `gewonnen`.
- **AC-22** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt
  Bestwert, Punkte im Schnitt und den höchsten Rang; fehlende oder unlesbare
  Felder zählen als 0, ein Rang außerhalb von 0 bis 8 wird begrenzt, ohne
  Partien steht beim Rang „–".

Pause, Neuladen und Spielzeit folgen dem gemeinsamen Vertrag in der
[Echtzeit-Spec](echtzeit.md).

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                                        |
| ---- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| RF-1 | App schließt, während die Kugel auf der Rampe fährt oder im Loch liegt | Nach dem Neuladen Pause; nach „Weiter" fährt sie zu Ende bzw. wird ausgeworfen. |
| RF-2 | Feder gespannt, dann Anleitung geöffnet           | Pause, die Feder ist entspannt; das Loslassen danach schießt nicht.          |
| RF-3 | Warnziele sollen aufstehen, die Kugel liegt davor | Sie warten und versuchen es alle 0,3 s wieder.                              |
| RF-4 | TILT mitten in einer Mission                      | Die Mission läuft weiter, zählt aber nichts bis zur nächsten Kugel.         |
| RF-5 | Unlesbarer Stand im Speicher                      | Frischer Tisch, die Tonwahl bleibt, wenn sie lesbar ist.                    |

## Hintergrund

Vom Vorbild übernommen: die Feder mit Geschicktreffer, drei Bahnen oben, deren
volle Reihe die Angriffsbumper eine Farbe weiter schaltet und die sich mit den
Flippern verschieben, Missionsziele und Startrampe zum Annehmen, Treibstoff,
der während einer Mission ausgeht, drei Wurmlöcher in Rot, Grün und Gelb mit
einem Ziellicht, das Schwarze Loch, der Hyperraum, Warnziele für den Rückstoß,
die Kugelrettung am Anfang, die neun Ränge mit blauen und orangen Lichtern in
der Mitte und die Tasten Z, / und Leertaste. Anders als dort: acht feste
Missionen statt der vielen je Rang, zwei je Beförderung, und eine Anzeige
unter dem Tisch statt der Tafel daneben – auf dem Handy ist neben dem Tisch
kein Platz.

Der Tisch ist immer dunkel, auch in der hellen Fassung der App: Er ist ein
gedrucktes Spielfeld, kein Stück Oberfläche. Das Schild darüber bekommt dafür
einen dunklen Schleier.

Rampe und Löcher rechnen nicht mit der Physik. Auf der Rampe fährt die Kugel
eine feste Bahn ab, im Loch wartet sie. In 2D wäre die Rampe sonst eine zweite
Ebene über dem Tisch, und an deren Rändern bleibt eine Kugel gern hängen.

Die Führungen der Innenbahnen enden tangential oben auf der Flipperachse. In
einem ersten Entwurf endeten sie sechs Einheiten tiefer; dort war eine Kerbe,
und in allen zwölf Partien eines Bots blieb die Kugel irgendwann darin liegen.
Die Stoß-Regel (AC-5) hat seitdem auch diesen Fall.

Nachgeprüft mit dem Gerüst aus der [Echtzeit-Spec](echtzeit.md), das hier
zusätzlich beim Aufbau einmal malt wie die echte Bühne:

* Feder: nach 0,4 s halb gespannt und 530 Einheiten je Sekunde. Bis 0,3
  Spannung fällt die Kugel zurück auf die Feder, von 0,35 bis 0,45 über die
  Klappe rechts ins Feld, um 0,5 rollt sie durch die Bahnen oben (das Fenster
  für den Geschicktreffer ist schmal, wie beim Vorbild), ab 0,6 läuft sie den
  Bogen entlang bis zur Klappe des Umlaufs.
* Ein Bot, der Feder und Flipper zufällig bedient, spielte 16 Partien (40
  Minuten, 48 Kugeln): keine Durchdringung über 1,2 Einheiten, kein
  Verlassen des Tisches, kein Hänger; im Schnitt 2,5 Minuten je Partie und 33 s
  je Kugel, 19 Rampen, 41 Umläufe, 158 Löcher, 4 erfüllte Missionen.
* Balance aus den Bot-Läufen: Als Löcher noch jede Kugel fingen, lag sie 108
  Mal je Partie in einem; als jedes dritte Wurmloch eine Rettung brachte, gab es
  363 davon in 12 Partien. Daher die Tempogrenzen und das eine Ziellicht.
* Je ein Wegwerf-Fall für AC-2, AC-3, AC-5, AC-6 und AC-8 bis AC-22 (58
  Prüfungen, alle grün). Dabei fiel auf, dass TILT nie auslöste: Der Zähler
  fällt schon zwischen zwei Takten und erreichte die Schwelle 3 nie. Jetzt
  liegt sie bei 2,5.
* Im Browser auf Pixel 7 und 1366 × 700: Der Tisch passt ohne Scrollen, nichts
  ragt heraus, keine Konsolenfehler, auch mitten im Spiel.
