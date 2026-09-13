# Hochhinaus

**Datei:** [`spiele/doodle.js`](../../spiele/doodle.js)
**Stand:** 27/29 fertig · 2 in arbeit

## Zweck

Doodle Jump auf Karopapier: Eine kleine Figur springt von selbst, und man
lenkt sie von Plattform zu Plattform nach oben. Gelenkt wird mit Halten –
linke Hälfte, rechte Hälfte – oder, wer mag, durch Neigen des Handys.
Unterwegs warten Monster, die man abschießt oder von oben erledigt, schwarze
Löcher, Propeller und Raketen, und je Rang drei Ziele wie beim Vorbild.

## Akzeptanzkriterien

### Steuerung

- **AC-1** `fertig` **Springt von allein** — Die Figur steht auf einer Platte
  und springt los, sobald getippt oder eine Taste gedrückt wird; bis dahin
  steht „Tippen zum Springen" da. Ohne Lenken hüpft sie auf der Startplatte
  auf und ab.
- **AC-2** `fertig` **Halten lenkt** — Ein Finger auf der unteren Hälfte des
  Feldes oder auf der Leiste darunter lenkt nach links, wenn er links der
  Mitte liegt, sonst nach rechts; wandert er über die Mitte, wechselt die
  Richtung. Liegen mehrere Finger, gilt der zuletzt aufgesetzte. Pfeil
  links/rechts und A/D tun dasselbe, Enter startet oder schaltet die Pause um,
  P und Escape halten an.
- **AC-3** `fertig` **Neigen lenkt** — Unter dem Feld (vor dem Start) und im
  Pausenkasten lässt sich auf „Neigen" umstellen. Dann lenkt die Neigung des
  Geräts: bis 3° gar nicht, ab 25° mit voller Geschwindigkeit, dazwischen
  anteilig. Die Wahl gilt auch für die nächste Partie, und die Zeile unter dem
  Titel sagt „Gesteuert mit Neigen".
- **AC-4** `in-arbeit` **Erlaubnis auf dem iPhone** — Wo der Browser für die
  Neigung eine Erlaubnis verlangt, fragt der Knopf danach; ohne Erlaubnis
  bleibt es beim Halten, mit der Meldung „Ohne Erlaubnis geht Neigen nicht.".
  Gebaut, aber auf einem iPhone noch nicht nachvollzogen.
- **AC-5** `fertig` **Kein Sensor, kein Neigen** — Meldet das Gerät 1,5 s nach dem
  Start keine Neigung, geht es mit Halten weiter, und eine Meldung sagt es.
  Gerät ganz ohne Neigungsereignis: Umstellen meldet „Dieses Gerät meldet
  keine Neigung.".

### Sprünge und Plattformen

- **AC-6** `fertig` **Rand ist kein Ende** — Wer links aus dem Feld läuft, kommt
  rechts wieder herein und umgekehrt; am Rand ist die Figur auf beiden Seiten
  zu sehen.
- **AC-7** `fertig` **Immer erreichbar** — Zwei tragende Plattformen (fest oder
  wandernd) liegen nie mehr als 78 Einheiten übereinander; ein gewöhnlicher
  Sprung reicht 97,5. Mit der Höhe werden die Abstände größer, ab 1200
  Einheiten kommen wandernde Plattformen, ab 300 Federn und ab 600 brüchige
  Plattformen dazu – brüchige nur zusätzlich, nie als einzige Stufe.
- **AC-8** `fertig` **Landen nur von oben** — Die Figur landet nur im Fallen auf
  einer Plattform und springt von unten hindurch. Eine brüchige Plattform
  bricht beim ersten Tritt und trägt nicht. Eine Feder schießt die Figur etwa
  zweieinhalbmal so hoch wie ein gewöhnlicher Sprung.
- **AC-9** `fertig` **Gezählt wird die Höhe** — Das Bild folgt der Figur nach
  oben, nie nach unten. Oben stehen die größte erreichte Höhe in Metern (20
  Einheiten je Meter) und der Bestwert.
- **AC-10** `fertig` **Unten raus ist vorbei** — Fällt die Figur unten aus dem
  Bild, endet die Partie mit „Abgestürzt.", Höhe und Spielzeit unter dem Feld,
  bei neuem Bestwert „Das ist dein Bestwert.", darunter „Nochmal".

### Speicher und Statistik

- **AC-11** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `meter` und `dauer` notiert, ohne `gewonnen`.
- **AC-12** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt
  Bestwert, Höhe im Schnitt und die längste Partie; fehlende oder unsinnige
  Felder zählen als 0.
- **AC-27** `fertig` **Partie zählt alles mit** — Zusätzlich notiert jede Partie
  `ursache` (`absturz`, `monster` oder `loch`), `spruenge`, `federn`, `monster`
  (abgeschossen), `gestampft`, `schuesse`, `serie`, `propeller`, `raketen`,
  `loecher` (unten aus dem Bild gezogen, während die Figur noch lebte),
  `ohneSchuss` (Höhe in Metern bis zum ersten Schuss) und `ohneHilfe` (Höhe bis
  zur ersten Feder, dem ersten Propeller oder der ersten Rakete). `serie` ist
  die längste Folge abgeschossener Monster ohne Fehlschuss dazwischen; ein
  Treffer, der den Brocken nur ankratzt, unterbricht sie nicht.
- **AC-28** `fertig` **Statistik mit Monstern und Rang** — Die Statistik zeigt
  dazu die Summe abgeschossener Monster und die geschafften Ränge als „3/10";
  fehlende oder unsinnige Felder zählen auch hier als 0.
- **AC-29** `fertig` **Alte Pause spielt weiter** — Eine Pause von einem Stand
  vor Monstern und Zielen lädt ohne Fehler. Monster, Löcher und Geräte kommen
  auf dem Weg nach oben dazu, die Zähler beginnen bei 0, der Ton ist an.

### Schießen

- **AC-13** `fertig` **Oben tippen schießt** — Mit Halten gehört die obere
  Hälfte des Feldes dem Schießen; mit Neigen schießt ein Tipp irgendwo aufs
  Feld, nur die Leiste lenkt dann noch. Die Kugel fliegt vom Kopf der Figur zum
  Finger hin, höchstens 55° neben der Senkrechten, und die Figur hebt dabei die
  Nase. Leertaste, W und Pfeil hoch schießen senkrecht; vor dem Start und in
  der Pause starten sie stattdessen.
- **AC-14** `fertig` **Schussfolge begrenzt** — Höchstens ein Schuss je 0,16 s
  und vier Kugeln zugleich; eine gehaltene Taste schießt in diesem Takt. Eine
  Kugel verschwindet am Bildrand, in einem schwarzen Loch oder im ersten
  Monster, das sie trifft.

### Monster und schwarze Löcher

- **AC-15** `fertig` **Drei Monsterarten** — Ab 30 m kommen Monster: der blaue
  Klecks, ab 60 m der graue Flatterer, der quer durchs Bild fliegt, ab 150 m
  der rote Brocken. Klecks und Flatterer fallen nach einem Treffer, der Brocken
  nach dreien und zeigt mit Punkten, wie viele noch fehlen. Ein Treffer lässt
  das Monster aufblitzen, ein erledigtes fällt auf dem Rücken aus dem Bild.
- **AC-16** `fertig` **Berühren ist tödlich** — Berührt die Figur ein Monster
  von der Seite oder von unten, ist sie erwischt: Sie fällt mit gekreuzten
  Augen durch alle Plattformen, und die Partie endet mit „Vom Monster
  erwischt.". Fällt sie von oben darauf, ist das Monster erledigt – auch der
  Brocken –, und die Figur springt ab wie von einer Plattform.
- **AC-17** `fertig` **Schwarze Löcher schlucken** — Ab 100 m gibt es schwarze
  Löcher. Kommt die Figur einem zu nahe, zieht es sie wirbelnd hinein, und die
  Partie endet mit „Ins schwarze Loch gefallen.". Abschießen lässt sich ein
  Loch nicht.
- **AC-18** `fertig` **Gefahren fair gesetzt** — Monster und Löcher entstehen
  über dem Bild, nie darin. Klecks und Brocken stehen nie in derselben Spalte
  wie eine nicht wandernde Plattform auf ihrer Höhe oder bis eine Sprunghöhe
  darunter (unter einer Feder: eine Federhöhe), auch nicht über den Rand
  hinweg. Ein Flatterer fliegt nur durch eine Lücke, in der seine Bahn keine
  Plattform und keine darauf stehende Figur kreuzt. Ein Loch hält diesen
  Abstand samt seinem Schluckradius zu jeder Plattform, auch zu wandernden.
  Zwischen zwei Gefahren liegen anfangs mindestens 21 m, weiter oben weniger,
  nie unter 11 m.

### Propeller und Rakete

- **AC-19** `fertig` **Propeller und Rakete** — Ab 25 m liegen ab und zu
  Propellermützen auf festen Plattformen, ab 125 m auch Raketen, nie zwei
  Geräte näher als 20 m beieinander. Wer eins berührt, fliegt: der Propeller
  2,6 s mit 330 Einheiten je Sekunde (etwa 43 m), die Rakete 2,2 s mit 560
  (etwa 62 m). Gelenkt wird weiter, Monster und Löcher können der Figur im Flug
  nichts. Danach fällt das Gerät ab.

### Klang

- **AC-20** `in-arbeit` **Geräusche** — Sprung, Feder, brechende Platte, Schuss,
  Treffer, erledigtes Monster, Draufspringen, Aufnehmen eines Geräts,
  Propeller und Rakete im Flug, Erwischtwerden, Loch, Absturz und ein
  geschafftes Ziel haben je einen eigenen, erzeugten Ton. Monster summen,
  kurz bevor sie oben ins Bild kommen und solange sie darin sind, lauter, je
  näher sie der Figur sind. In der Pause und nach dem Ende ist alles still.
  Gebaut und im Browser ohne Fehler abgespielt, auf einem Handy aber noch
  nicht angehört.
- **AC-21** `fertig` **Ton abschaltbar** — Ein Knopf im Kopf schaltet den Ton
  aus und wieder an, mit der Meldung „Ton aus." bzw. „Ton an."; die Wahl gilt
  auch für die nächste Partie.

### Ziele

- **AC-22** `fertig` **Drei Ziele je Rang** — Zehn Ränge mit je drei Zielen
  (Liste im Hintergrund). Sind alle drei geschafft, gilt ab der nächsten
  Partie der nächste Rang; was vor ihm lag, zählt nicht für ihn. Ziele über
  mehrere Partien („Springe 500-mal") zählen alle Partien des Rangs zusammen,
  die übrigen verlangen es in einer Partie.
- **AC-23** `fertig` **Rang aus der Statistik** — Der Rang wird aus den notierten
  Partien nachgerechnet, nicht eigens gespeichert; nach dem Einlesen einer
  Sicherung stimmt er mit ihr. Fehlende oder unsinnige Felder zählen als 0.
- **AC-24** `fertig` **Ziel geschafft im Spiel** — Wird ein Ziel mitten in der
  Partie erreicht, steht es sofort mit Haken oben im Feld, mit einem Ton; ist
  es das dritte des Rangs, folgt „Rang N geschafft!". Das Ende nennt die
  geschafften Ziele und den neuen Rang. Was im Spiel gemeldet wird, stimmt mit
  der Nachrechnung nach dem Ende überein.
- **AC-25** `fertig` **Ziele ansehen** — Der Rang über dem Feld und „Ziele"
  unter dem Feld (vor dem Start und nach dem Ende) öffnen ein Blatt mit dem
  Rang und den drei Zielen mit Haken, Stand und Balken – die laufende Partie
  eingerechnet. Der Knopf unter dem Feld sagt, wie viele der drei geschafft
  sind. Einen eigenen Knopf im Kopf gibt es nicht: Mit ihm überdeckten die
  Knöpfe auf dem Handy den Titel.
- **AC-26** `fertig` **Alle Ränge geschafft** — Nach dem zehnten Rang heißt es im
  Kopf „Alle Ränge", das Blatt sagt, dass es keine weiteren Ziele gibt, und im
  Spiel wird nichts mehr gemeldet.

## Randfälle

| #    | Fall                                                | Erwartetes Verhalten                                     |
| ---- | --------------------------------------------------- | -------------------------------------------------------- |
| RF-1 | Handy im Querformat beim Neigen                     | Die Achse wird nach der Bildschirmdrehung umgerechnet.   |
| RF-2 | Taste und Finger gleichzeitig, in Gegenrichtung     | Die Taste gewinnt.                                       |
| RF-3 | Brüchige Platte liegt knapp über der Zielplatte     | Sie bricht, die Figur fällt auf die tragende darunter.   |
| RF-4 | Neuladen mit „Neigen" auf dem iPhone                | Die Erlaubnis gilt nur für die Sitzung; kommt keine Neigung, springt es auf Halten zurück (AC-5). |
| RF-5 | Ziel im Spiel gemeldet, dann „Neu anfangen"         | Die verworfene Partie zählt nicht (Echtzeit AC-12) – das Ziel ist wieder offen. |
| RF-6 | Flug endet direkt unter einem Monster               | Die Figur ist wieder verwundbar; wer nicht ausweicht oder schießt, wird erwischt. |
| RF-7 | Figur am linken Rand, Monster am rechten            | Die Figur ragt hinüber und wird dort erwischt (AC-6); beim Setzen zählt der Abstand über den Rand (AC-18). |
| RF-8 | Kugel unterwegs, als die Figur erwischt wird        | Sie fliegt weiter; ein Monster, das sie noch trifft, zählt. |
| RF-9 | Finger landet oben und rutscht in die untere Hälfte | Er bleibt ein Schuss und lenkt nicht – entschieden wird beim Aufsetzen. |

## Hintergrund

Das Vorbild wird durch Neigen gesteuert. Das ist hier nicht die Vorgabe:
Neigen braucht auf dem iPhone eine Erlaubnis aus einem Tipp heraus, fehlt am
Rechner ganz und dreht sich gegen einen, wer im Liegen spielt. Halten geht
überall. Beim Vorbild schießt ein Tipp irgendwohin; mit Halten liegen aber
beide Daumen schon unten. Die Figur steht nie höher als 42 % des Feldes, die
Monster, auf die man zielt, kommen von oben – deshalb schießt die obere
Hälfte, und die untere lenkt.

Die Plattformen entstehen beim Klettern. Jede tragende liegt zwischen
16 + min(24, h/200) und min(78, 34 + h/70) Einheiten über der vorigen, wobei h
die Höhe über dem Start ist – anfangs also dicht, später weiter, aber nie
außer Reichweite.

Monster und Löcher werden in Streifen von 60 Einheiten ausgewürfelt, aber
erst, wenn die Plattformen darüber schon feststehen – so lässt sich prüfen,
dass keins über einer Plattform steht, von der man hochspringt. Gesucht wird
jede freie Lage im Raster von 2; mit ein paar zufälligen Versuchen fanden die
Löcher ihre schmalen Lücken fast nie (3 Löcher in 5 Partien mit zusammen
5500 m). Ein Monster ist zu Beginn mit 15 % je Streifen dran, bis 35 % weiter
oben, ein Loch mit 3 bis 10 %; der Mindestabstand ist max(220, 420 − h/50).

Die Ziele sind Felder der notierten Partie – auch „ohne Schuss" und „ohne
Hilfe", die sonst nur aus dem Spielverlauf zu erkennen wären. Deshalb braucht
der Rang keinen eigenen Speicher und sagt immer dasselbe wie die Statistik.

| Rang | Ziel 1                                   | Ziel 2                               | Ziel 3                                    |
| ---- | ---------------------------------------- | ------------------------------------ | ----------------------------------------- |
| 1    | Erreiche 50 m                            | Springe 100-mal                      | Schieß ein Monster ab                     |
| 2    | Erreiche 150 m                           | Nimm 3 Federn in einer Partie        | Flieg mit dem Propeller                   |
| 3    | 3 Monster hintereinander ohne Fehlschuss | Erreiche 250 m                       | Springe 500-mal                           |
| 4    | Spring auf ein Monster                   | Flieg mit der Rakete                 | Schieß 10 Monster ab                      |
| 5    | Erreiche 400 m                           | Schaff 150 m ohne einen Schuss       | Lass 3 schwarze Löcher hinter dir         |
| 6    | 5 Monster hintereinander ohne Fehlschuss | Springe 2000-mal                     | Nimm 2 Propeller in einer Partie          |
| 7    | Erreiche 600 m                           | Schieß 5 Monster in einer Partie ab  | Nimm 8 Federn in einer Partie             |
| 8    | 8 Monster hintereinander ohne Fehlschuss | Erreiche 800 m                       | Nimm 2 Raketen in einer Partie            |
| 9    | Erreiche 1000 m                          | Schieß 100 Monster ab                | Spring in einer Partie auf 3 Monster      |
| 10   | Erreiche 1500 m                          | 12 Monster hintereinander ohne Fehlschuss | Schaff 500 m ohne Feder, Propeller, Rakete |

Die Töne sind mit der Web Audio API erzeugt, keine Aufnahmen: Die App bleibt
klein und offline. Der AudioContext entsteht beim ersten Tipp, weil Browser
ihn vorher stumm schalten, und schläft in der Pause.

Nachgeprüft mit dem Gerüst aus der [Echtzeit-Spec](echtzeit.md): In fünf
Partien eines einfachen Bots (234 m, 853 m, 313 m, über 1307 m, 53 m) lagen
tragende Plattformen höchstens 78,0 auseinander. Brüchige Platte bricht und
trägt nicht, Feder gibt −633 nach einem Takt Schwerkraft, rechts hinaus kommt
links herein. Neigen und der Rückfall auf Halten wurden in Chromium mit
künstlichen `deviceorientation`-Ereignissen nachvollzogen.

Für Monster, Geräte und Ziele spielte ein Bot, der auf Monster in der oberen
Hälfte tippt, 20 Partien (99 bis 2259 m; 11 abgestürzt, 7 erwischt, 1 im Loch,
eine nach 400 s abgebrochen). Dabei entstanden 431 Kleckse, 39 Flatterer,
177 Brocken, 33 Löcher, 99 Propeller und 37 Raketen, ohne einen Verstoß gegen
AC-18; tragende Plattformen lagen weiter höchstens 78,0 auseinander. Die im
Spiel gemeldeten Ziele stimmten in jeder Partie mit der Nachrechnung überein.
26 gezielte Fälle bestätigen Draufspringen (auch Brocken), Erwischtwerden von
unten, Durchfallen, Schutz im Flug, Aufnehmen und Dauer beider Geräte, Sog und
Ende im Loch, Kugeln im Loch, drei Treffer am Brocken, Serie und Fehlschuss,
höchstens vier Kugeln, Winkelgrenze bei −0,960, Lenken in der unteren Hälfte,
Schießen unten beim Neigen, Ton aus und an, eine Pause von Version 71 (883 m,
30 Monster) und die Nachrechnung der Ränge samt Lücken. Mit einem nachgebauten
AudioContext entstanden 5945 Oszillatoren ohne einen ungültigen Wert.
