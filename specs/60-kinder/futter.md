# Futterzeit

**Datei:** [`spiele/futter.js`](../../spiele/futter.js)
**Stand:** 9/9 fertig

## Zweck

Für Kinder ab etwa zwei Jahren: Unten steht ein Tier, oben stehen ein bis drei
Teller, und das Tier will zu seinem Futter – der Hund zum Knochen, der Hase zur
Möhre. Wer schon ziehen kann, zieht; wer noch nicht ziehen kann, tippt auf den
Teller. Falsch gibt es nur als freundliches Kopfschütteln. Zimmer, Klang und
Tiere kommen aus dem Werkzeug [Tiere](tiere.md).

## Akzeptanzkriterien

### Aufgabe

- **AC-1** `fertig` **Ein bis drei Teller** — Auf dem Vorhang wählen die
  Eltern „Ein Teller", „Zwei Teller" oder „Drei Teller"; die Wahl bleibt
  gemerkt. Vorgabe ist ein Teller.
- **AC-2** `fertig` **Immer genau ein richtiger Teller** — Zur Wahl stehen
  das Futter des Tiers und zufällige Futter anderer Tiere, in zufälliger
  Reihenfolge. Kein Futter gehört zwei Tieren. Eine Runde sind sechs
  verschiedene Tiere.

### Ziehen und Tippen

- **AC-3** `fertig` **Ziehen oder Teller tippen** — Das Tier folgt dem
  Finger, groß und mit Schatten; der Teller, über dem es gerade liegt, leuchtet
  auf. Wird es losgelassen, wenn seine Mitte näher als 0,85 Kachelbreiten an
  einer Tellermitte liegt, gilt der nächste solche Teller; sonst geht es zurück.
  Ein Tipp auf einen Teller schickt das Tier von selbst dorthin. Beim
  Aufnehmen ruft das Tier.
- **AC-4** `fertig` **Richtiges Futter** — Das Tier läuft auf den Teller,
  knabbert, das Futter verschwindet, es gibt Konfetti, oben steht „Der Hund ist
  satt!", das Tier ruft, und danach kommt das nächste Tier.
- **AC-5** `fertig` **Falsches Futter ohne Fehler** — Das Tier läuft nur ein
  Stück hin, Teller und Tier schütteln sich, und das Tier geht zurück – ohne
  Ton und ohne rote Farbe. Danach darf sofort neu gewählt werden.
- **AC-6** `fertig` **Wink nach fünf Sekunden** — Liegt fünf Sekunden kein
  Finger auf dem Spiel, wippt das Tier, und Pfeile zwischen Tier und Tellern
  steigen nach oben. Der Wink zeigt nie auf den richtigen Teller.
- **AC-7** `fertig` **Alle satt, dann weiter** — Nach dem sechsten Tier
  steht „Alle satt!" mit den sechs Tieren da, eine Tonleiter spielt, Konfetti
  fällt. Nach gut vier Sekunden oder einem Tipp (frühestens nach 1,2 s) beginnt
  die nächste Runde.
- **AC-8** `fertig` **Passt ins Fenster** — Teller und Tier sind auf einem
  Pixel 7 hoch und quer und in 1366 × 700 ganz zu sehen, ohne dass etwas
  scrollt – auch nicht beim Ziehen.

### Statistik

- **AC-9** `fertig` **Runde mit Tieren und Fehlgriffen** — Jede Runde wird
  mit `dauer`, `tiere` (wie viele satt wurden), `fehlgriffe` und `stufe`
  notiert – eine angefangene beim Schließen des Zimmers, sofern schon ein
  Tier satt ist. Die Statistik zeigt „Tiere gefüttert" und „Runden alle satt";
  fehlende Felder zählen als null.

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                           |
| ---- | ------------------------------------------------- | -------------------------------------------------------------- |
| RF-1 | Tier auf halbem Weg losgelassen                   | Es geht zurück an seinen Platz.                                |
| RF-2 | Während des Ziehens ein Tipp auf einen Teller      | Zählt nicht; das gezogene Tier bleibt am Finger.               |
| RF-3 | Das System bricht die Berührung ab (Geste)        | Das Tier geht zurück, nichts wird gewertet.                    |
| RF-4 | Tier ohne Aufnahme (Hase, Eichhörnchen, Maus)     | Beim Aufnehmen ein leises Plopp, beim Fressen nur das Knabbern. |

## Hintergrund

Nah genug ist nah genug: Kleine Finger lassen ungenau los, und ein Tier, das
eine Handbreit neben dem Teller zurückspringt, ist für ein Zweijähriges ein
Fehler, den es nicht versteht. 0,85 Kachelbreiten sind so großzügig, dass es
ungefähr über dem Teller reicht, aber nicht so, dass ein Tier aus der Mitte
zwischen zwei Tellern den falschen erwischt.

Tippen auf den Teller ist kein Notbehelf, sondern der Weg für Kinder, die noch
nicht ziehen: Bei einem Teller ist jedes Tippen richtig.

Das Futter ist eine Bildgeschichte, keine Ernährungslehre: Die Katze bekommt
Fisch, der Löwe Fleisch, der Elefant Erdnüsse.
