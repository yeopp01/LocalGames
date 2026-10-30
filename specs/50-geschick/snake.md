# Schlange

**Datei:** [`spiele/snake.js`](../../spiele/snake.js)
**Stand:** 16/16 fertig

## Zweck

Snake, wie es auf jedem Handy war: Die Schlange fährt von selbst, man lenkt,
sie frisst Äpfel, wird länger und schneller. Gebaut für den Finger – wischen
über das Feld oder ein Steuerkreuz darunter – und genauso für Pfeiltasten.

## Akzeptanzkriterien

### Feld und Steuerung

- **AC-1** `fertig` **Siebzehn mal siebzehn** — Das Feld hat 17 × 17 Felder. Eine
  neue Partie beginnt mit einer Schlange der Länge 3 in der Mitte, Kopf nach
  rechts, und einem Apfel auf einem freien Feld. Sie fährt erst los, wenn
  gelenkt oder getippt wird; bis dahin steht „Wisch los" auf dem Feld.
- **AC-2** `fertig` **Wischen, ohne abzusetzen** — Eine Bewegung auf dem Feld
  lenkt, sobald sie 22 Pixel lang ist, in Richtung der stärkeren Achse. Danach
  beginnt die Messung am aktuellen Punkt neu, so dass ein Strich mehrere
  Richtungen geben kann. Ein Tipp ohne Wischen setzt eine Pause fort. Die Seite
  scrollt dabei nicht.
- **AC-3** `fertig` **Steuerkreuz beim Daumen** — Vier Knöpfe ↑ ← ↓ → lenken
  beim Aufsetzen des Fingers, nicht erst beim Loslassen. Im Hochformat stehen sie
  unter dem Feld, so breit wie das Feld und bis 84 px hoch; im Querformat neben
  dem Feld, das dann die ganze Höhe bekommt. Sie bleiben in Pause und nach dem
  Ende stehen, damit nichts springt: In der Pause setzt ein Pfeil fort und lenkt,
  nach dem Ende beginnt er die nächste Partie (AC-13).
- **AC-4** `fertig` **Tasten** — Pfeiltasten und W/A/S/D lenken, Leertaste und
  Enter starten oder schalten die Pause um, P und Escape halten an.
- **AC-5** `fertig` **Schnelle Kehren** — Bis zu drei Richtungen werden gemerkt
  und je Feld eine gefahren. Eine Richtung, die der zuletzt gemerkten gleicht
  oder ihr entgegengesetzt ist, wird verworfen. „Hoch, links" innerhalb eines
  Takts bei einer Schlange, die nach rechts fährt, ist also eine Kehre und
  kein Biss in den eigenen Hals.

### Spielzug

- **AC-6** `fertig` **Schneller mit jedem Apfel** — Die Schlange zieht anfangs
  alle 0,15 s ein Feld weiter, mit jedem Apfel 3 ms schneller, ab 27 Äpfeln
  gleichbleibend alle 0,07 s.
- **AC-7** `fertig` **Apfel macht länger** — Frisst sie einen Apfel, wird sie ein
  Glied länger, und ein neuer Apfel erscheint auf einem Feld, das die Schlange
  nicht belegt.
- **AC-8** `fertig` **Wand, Körper, volles Feld** — Stößt der Kopf an die Wand,
  endet die Partie mit „An die Wand.", trifft er den eigenen Körper, mit „In
  den eigenen Schwanz.". Auf das Feld des Schwanzendes darf er, weil das im
  selben Takt weiterrückt – außer die Schlange wächst gerade. Bleibt nach
  einem Apfel kein freies Feld, endet sie mit „Das Feld ist voll.".
- **AC-9** `fertig` **Ende mit Bilanz** — Nach dem Ende stehen in der Karte auf
  dem Feld Äpfel, Länge und Spielzeit, bei neuem oder eingestelltem Bestwert die
  Marke „Das ist dein Bestwert.", darunter „Nochmal", das gleich losfährt.
- **AC-13** `fertig` **Neustart mit einem Tipp** — Nach dem Ende beginnt ein Tipp
  aufs Feld, ein Wisch, ein Pfeil am Kreuz, eine Pfeil- oder WASD-Taste, Leertaste
  oder Enter sofort die nächste Partie; eine Richtung zählt dabei schon. In den
  ersten 500 ms nach dem Ende zählt nichts davon, und auch eine gehaltene Taste
  nicht – wer noch lenkt, fängt nicht aus Versehen neu an.
- **AC-14** `fertig` **Karte statt Schleier** — Schild, Pausen- und Endknöpfe
  stehen in einer Karte auf dem Feld, das darum herum in voller Farbe sichtbar
  bleibt. Die Karte steht in der Hälfte, in der der Kopf nicht ist. Tipps neben
  ihre Knöpfe gehen ans Feld. Die Seite wird dadurch nicht höher: Auf einem
  Pixel 7, in 1366 × 700 und in 839 × 412 passt alles ohne Scrollen.
- **AC-15** `fertig` **Wand und Kopf sichtbar** — Der Feldrand ist deutlich dunkler
  als das Gitter, weil er tödlich ist. Der Kopf ist dunkler als der Körper, und
  Kopf und Schwanzende sind rund.
- **AC-16** `fertig` **Leertaste nach dem Pause-Knopf** — Setzt das Spiel fort,
  verliert ein fokussierter Knopf den Fokus: Die nächste Leertaste schaltet die
  Pause, statt noch einmal den Knopf zu drücken.

### Speicher und Statistik

- **AC-10** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `aepfel`, `laenge` und `dauer` notiert, ohne `gewonnen`.
- **AC-11** `fertig` **Kopfzeile** — Oben stehen die Äpfel und – sobald eine
  Partie mit Äpfeln notiert ist – der Bestwert; unter dem Titel die Länge.
- **AC-12** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt
  Bestwert, Äpfel im Schnitt und die längste Partie. Fehlende oder unsinnige
  Felder zählen als 0; eine leere Liste ergibt Nullen und „–".

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                          |
| ---- | ------------------------------------------------- | ------------------------------------------------------------- |
| RF-1 | Erste Eingabe ist „links" (gegen die Fahrtrichtung) | Die Schlange startet und fährt nach rechts.                  |
| RF-2 | Apfel liegt auf dem Weg in die Wand               | Er wird gefressen, die Partie endet trotzdem an der Wand.     |
| RF-3 | Pause mit gemerkten Richtungen                    | Die Warteschlange wird geleert; nach „Weiter" zählt Neues.    |
| RF-4 | Gespeicherter Stand mit Gliedern außerhalb        | Es beginnt ein frisches Feld.                                 |

## Hintergrund

Das Wischen misst während der Bewegung statt beim Loslassen. Beim Loslassen
wäre eine Kehre zwei Wischgesten, und die zweite käme bei 70 ms je Feld fast
immer zu spät.

Die Warteschlange gibt es, weil schnelle Finger schneller sind als die
Schlange. Ohne sie gewinnt die letzte Eingabe eines Takts: Aus „hoch, links"
würde „links", und das ist bei einer Schlange, die nach rechts fährt, der Biss
in den eigenen Hals.

Die Sperre nach dem Ende ist kürzer als beim Flattervogel: Die Schlange endet
sofort, ohne Fall, und ein Lenkender hat die Finger längst woanders.

Nachgeprüft mit einem Gerüst, das die Spieldatei in Node lädt: Wand nach 1,35 s
(9 Felder zu 0,15 s), Gegenrichtung, Kehre, Biss, Schwanzende, volles Feld aus
einem vorbereiteten Stand mit 288 Gliedern, und fünf Partien eines Bots mit
Breitensuche (25, 20, 17, 6 und 69 Äpfel), in denen der Apfel nie auf der
Schlange lag.
