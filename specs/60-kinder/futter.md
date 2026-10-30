# Futterzeit

**Datei:** [`spiele/futter.js`](../../spiele/futter.js)
**Stand:** 16/16 fertig

## Zweck

Für Kinder ab etwa zwei Jahren: Unten steht ein Tier, oben stehen ein bis drei
Teller, und das Tier will zu seinem Futter – der Hund zum Knochen, der Hase zur
Möhre. Wer schon ziehen kann, zieht; wer noch nicht ziehen kann, tippt auf den
Teller. Falsch gibt es nur als freundliches Kopfschütteln. Zimmer, Klang und
Tiere kommen aus dem Werkzeug [Tiere](tiere.md).

## Akzeptanzkriterien

### Aufgabe

- **AC-1** `fertig` **Ein bis drei Teller** — Auf dem Vorhang steht die Wahl
  „Ein Teller", „Zwei Teller" oder „Drei Teller", jede mit so vielen Futterbildern
  (Werkzeug AC-21); die Wahl bleibt gemerkt. Vorgabe ist ein Teller.
- **AC-2** `fertig` **Immer genau ein richtiger Teller** — Zur Wahl stehen
  das Futter des Tiers und zufällige Futter anderer Tiere, in zufälliger
  Reihenfolge. Kein Futter gehört zwei Tieren. Eine Runde sind sechs
  verschiedene Tiere.

### Ziehen und Tippen

- **AC-3** `fertig` **Ziehen oder Teller tippen** — Das Tier folgt dem
  Finger, groß und mit Schatten, und neigt sich in die Zugrichtung. Der Teller,
  zu dem es gerade gehören würde, leuchtet auf, sein Futter hüpft, und er zieht
  das Tier schon ein Stück zu sich. Wird es losgelassen, wenn seine Mitte näher
  als 1,15 Kachelbreiten an einer Tellermitte liegt und es mindestens 40 % des
  Wegs geschafft hat, gilt der nächste solche Teller; sonst geht es zurück. Ein
  Tipp auf einen Teller schickt das Tier von selbst dorthin. Beim Aufnehmen ruft
  das Tier.
- **AC-4** `fertig` **Richtiges Futter** — Das Tier läuft an den Tellerrand,
  knabbert, das Futter verschwindet sichtbar, es gibt Konfetti, oben steht „Der
  Hund ist satt!", das Tier ruft, und danach kommt das nächste Tier. Anlass: Es
  saß vorher auf dem Teller und deckte das Futter zu.
- **AC-5** `fertig` **Falsches Futter ohne Fehler** — Das Tier läuft an den
  Tellerrand, Teller und Tier schütteln sich, oben steht „Hm, der Hund möchte
  etwas anderes.", und das Tier geht zurück – ohne Ton und ohne rote Farbe.
  Danach darf sofort neu gewählt werden.
- **AC-6** `fertig` **Der Weg ist zu sehen** — Pfeile zwischen Tier und Tellern
  stehen immer leise da. Liegt kein Finger auf dem Spiel, wippt das Tier, und die
  Pfeile steigen nach oben: nach 2,5 s, solange noch kein Tier gefressen hat,
  danach nach fünf Sekunden. Der Wink zeigt nie auf den richtigen Teller.
- **AC-7** `fertig` **Alle satt, dann weiter** — Nach dem sechsten Tier
  steht „Alle satt!" mit den sechs Tieren da, eine Tonleiter spielt, Konfetti
  fällt. Nach gut vier Sekunden oder einem Tipp (frühestens nach 1,2 s) beginnt
  die nächste Runde.
- **AC-8** `fertig` **Passt ins Fenster** — Teller und Tier sind auf einem
  Pixel 7 hoch und quer und in 1366 × 700 ganz zu sehen, ohne dass etwas
  scrollt – auch nicht beim Ziehen. Beide stehen zusammen in der Mitte, ein
  Teller allein ist größer als drei: Im Hochformat war der Weg sonst über 500 px
  lang, weiter, als ein Kinderarm in einem Zug zieht.
- **AC-10** `fertig` **Daneben greifen zählt** — Wer das Tier knapp verfehlt
  (bis eine Kachelbreite von seiner Mitte), hat es trotzdem: Es springt unter den
  Finger.
- **AC-11** `fertig` **Schnippen zählt** — Wird das Tier im Schwung losgelassen,
  zählt die Stelle, an der es 0,16 s später wäre. Dasselbe Stück langsam gezogen
  und losgelassen führt zurück.
- **AC-12** `fertig` **Antippen zeigt den Weg** — Wird das Tier nur angetippt und
  nicht gezogen, ruft es, und kurz darauf kommt der Wink aus AC-6.
- **AC-13** `fertig` **Wer gerade dran ist** — Kommt ein neues Tier, steht oben
  „Der Hund hat Hunger!" – zum Vorlesen.
- **AC-14** `fertig` **Satte Tiere sammeln sich** — Sechs Plätze am unteren Rand
  (quer unten links) füllen sich mit den Tieren, die satt sind (Werkzeug AC-23).
- **AC-15** `fertig` **Griff geht nie verloren** — Verliert das Fenster den Fokus
  oder geht es in den Hintergrund, während das Tier am Finger hängt, geht es
  zurück und lässt sich wieder greifen. Anlass: Ein Loslassen, das nie ankam,
  sperrte das Tier für den Rest des Besuchs.
- **AC-16** `fertig` **Tasten** — Am Laptop lässt jede Taste (ohne Strg, Alt,
  Meta) das Tier rufen und den Wink zeigen. Füttern geht nur mit Maus oder Finger.

### Statistik

- **AC-9** `fertig` **Runde mit Tieren und Fehlgriffen** — Jede Runde wird
  mit `dauer`, `tiere` (wie viele satt wurden), `fehlgriffe` und `stufe`
  notiert – eine angefangene beim Schließen des Zimmers, sofern schon ein
  Tier satt ist. Die Statistik zeigt „Tiere gefüttert" und „Runden alle satt";
  fehlende Felder zählen als null.

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                           |
| ---- | ------------------------------------------------- | -------------------------------------------------------------- |
| RF-1 | Tier auf dem ersten Drittel langsam losgelassen   | Es geht zurück an seinen Platz.                                |
| RF-2 | Während des Ziehens ein Tipp auf einen Teller      | Zählt nicht; das gezogene Tier bleibt am Finger.               |
| RF-3 | Das System bricht die Berührung ab (Geste)        | Das Tier geht zurück, nichts wird gewertet.                    |
| RF-4 | Tier ohne Aufnahme (Hase, Eichhörnchen, Maus)     | Beim Aufnehmen ein leises Plopp, beim Fressen nur das Knabbern. |

## Hintergrund

Nah genug ist nah genug: Kleine Finger lassen ungenau los, und ein Tier, das
eine Handbreit neben dem Teller zurückspringt, ist für ein Zweijähriges ein
Fehler, den es nicht versteht. Mit 1,15 Kachelbreiten reicht es, in die Nähe des
Tellers zu kommen; welcher Teller gilt, sieht man vor dem Loslassen am Leuchten,
und ein falscher Teller kostet nichts. Die Grenze von 40 % des Wegs sorgt dafür,
dass ein Zucken am Start noch nichts füttert – quer im Fenster liegen Tier und
Teller nah beieinander.

Tippen auf den Teller ist kein Notbehelf, sondern der Weg für Kinder, die noch
nicht ziehen: Bei einem Teller ist jedes Tippen richtig.

Das Futter ist eine Bildgeschichte, keine Ernährungslehre: Der Löwe bekommt
Fleisch, der Elefant Erdnüsse, der Wal Krill. Die Katze bekommt Milch, seit
der Pinguin den Fisch braucht – jedes Futter darf nur einem Tier gehören.
