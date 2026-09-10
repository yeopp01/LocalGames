# Weg

**Datei:** [`spiele/zip.js`](../../spiele/zip.js)
**Stand:** 15/17 fertig · 2 offen

## Zweck

Ein Rätsel nach dem Vorbild von Zip: Ein einziger Weg soll jedes Feld genau
einmal berühren und dabei die Zahlen der Reihe nach abklappern. Gezogen wird
mit dem Finger oder der Maus, auf „schwer" stehen Mauern im Weg.

## Akzeptanzkriterien

### Feld und Stufen

- **AC-1** `fertig` **Drei Größen** — Es gibt die Stufen leicht (5 × 5,
  mindestens 4 Zahlen), mittel (6 × 6, mindestens 6 Zahlen) und schwer (7 × 7,
  mindestens 10 Zahlen, 6 Mauern). Die Kopfzeile zeigt Stufe, Zeit und
  „n/k² Felder", darüber steht „Zahl x von n".
- **AC-2** `fertig` **Neues Rätsel wählbar** — Das Werkzeug „Neues Rätsel"
  bietet alle drei Stufen an; nach einem gelösten Rätsel stehen sie als Knöpfe
  „Neu, leicht/mittel/schwer" unter dem Ergebnis. Auf schwer erscheint vor dem
  Rechnen „Der Weg wird gesucht – einen Moment.", statt dass die Oberfläche
  stumm einfriert.
- **AC-3** `fertig` **Mauern nie auf dem Weg** — Mauern stehen als dicke
  Striche zwischen zwei Feldern, nie zwischen zwei Feldern, die der gesuchte
  Weg nacheinander betritt. Sie zerschneiden das Brett deshalb nie.

### Eingabe

- **AC-4** `fertig` **Start bei der 1** — Der Weg beginnt nur auf dem Feld mit
  der 1; ein anderes erstes Feld wird mit „Der Weg beginnt bei der 1."
  abgewiesen.
- **AC-5** `fertig` **Ziehen über Nachbarn** — Der Weg wächst beim Ziehen oder
  Tippen um waagerecht oder senkrecht benachbarte Felder, nie über Eck.
  Überspringt ein schneller Wisch genau ein Feld in gerader Linie, wird es
  nachgeholt.
- **AC-6** `fertig` **Schritte zurücknehmen** — Zurückziehen auf das vorletzte
  Feld nimmt einen Schritt zurück, „Ein Feld zurück" ebenso; „Von vorn" leert
  den Weg.
- **AC-7** `fertig` **Unerlaubtes wird abgewiesen** — Durch eine Mauer geht es
  nicht („Da ist eine Mauer dazwischen."), eine Zahl außer der Reihe auch nicht
  („Erst die n."). Schon besuchte oder nicht benachbarte Felder werden still
  übergangen.
- **AC-8** `fertig` **Weg als Linie** — Der Weg liegt als durchgehende Linie
  über dem Gitter, besuchte Felder sind gefärbt, das letzte Feld ist umrandet.

### Hinweise und Erzeugung

- **AC-9** `fertig` **Genau ein Weg** — Jedes Rätsel lässt genau einen Weg zu.
  Ist die Aufgabe mehrdeutig oder die Suche zu lang, kommen Zahlen auf dem
  gewürfelten Weg dazu, bis nur einer übrig bleibt.
- **AC-10** `offen` **Ohne Raten lösbar** — Jedes Rätsel lässt sich Schritt für
  Schritt herleiten, ohne einen Weg auf Verdacht zu probieren. Heute prüft der
  Erzeuger nur, dass es genau einen Weg gibt.
- **AC-11** `offen` **Hinweis nennt seinen Grund** — Der Hinweis zeigt einen
  Schritt, der aus Zahlen, Mauern und freien Anschlüssen zwingend folgt, und
  sagt, warum (etwa: „dieses Feld hat nur noch einen freien Nachbarn").
  Heute liest er die beim Erzeugen gemerkte Lösung aus und nennt nur „Von hier
  geht es weiter auf Zeile z, Spalte s" – ohne Begründung.
- **AC-12** `fertig` **Irrweg wird erkannt** — Weicht der gezogene Weg bereits
  von der Lösung ab, sagt der Hinweis das zuerst („Ab hier führt es in die
  Irre") und bietet an, bis zum letzten richtigen Feld zurückzunehmen.
  Sonst bietet er den nächsten Schritt mit „Gehen" oder „Selbst gehen" an.
- **AC-13** `fertig` **Hinweise werden gezählt** — Jeder Druck auf „Hinweis"
  zählt als Hinweis, auch wenn das Angebot nicht angenommen wird.

### Ende, Speicher und Statistik

- **AC-14** `fertig` **Sieg am letzten Feld** — Berührt der Weg alle Felder und
  endet auf der höchsten Zahl, erscheint „Weg gefunden." mit Stufe, Zeit und
  Zahl der Hinweise („ohne Hinweis", wenn keiner). Danach nimmt das Brett
  keine Züge mehr an.
- **AC-15** `fertig` **Partie überlebt Schließen** — Ein laufendes Rätsel steht
  nach Zurück, Neuladen oder Neustart samt Weg, Mauern, Hinweiszahl und
  verbrauchter Zeit wieder da; die Zeit mit geschlossener App zählt nicht mit.
  Ein gelöstes Rätsel wird nicht wiederhergestellt.
- **AC-16** `fertig` **Partie in der Statistik** — Jedes gelöste Rätsel wird mit
  `gewonnen: true`, `dauer`, `stufe` und `hilfen` notiert; ein abgebrochenes
  wird nicht notiert. Die Statistik zeigt „Bestzeit 5×5", „6×6" und „7×7" aus
  gewonnenen Partien und „–", solange es keine gibt – auch bei leeren Listen
  und bei Partien ohne `stufe` oder `dauer`.
- **AC-17** `fertig` **Anleitung erklärt alles** — Das Blatt „Anleitung" nennt
  die Regel (bei der 1 beginnen, Zahlen der Reihe nach, jedes Feld genau
  einmal, bei der höchsten Zahl enden), das Ziehen ohne Ecken, das
  Zurückziehen, die Mauern auf schwer und Ecken und Ränder als guten Anfang.

## Randfälle

| #    | Fall                                                   | Erwartetes Verhalten                                                        |
| ---- | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| RF-1 | Weg erreicht die höchste Zahl, es sind noch Felder frei | Der Weg darf weiterlaufen, gewonnen ist erst, wenn er dort auch endet.      |
| RF-2 | Schneller Wisch überspringt ein Feld über Eck          | Nichts wird nachgeholt, das ferne Feld wird übergangen.                     |
| RF-3 | Gespeichertes Rätsel aus einer Fassung ohne Mauern     | Es lädt und wird ohne Mauern gespielt.                                      |
| RF-4 | Die Eindeutigkeitssuche erreicht ihre Schrittbremse    | Das zählt als mehrdeutig; es kommt eine weitere Zahl dazu.                  |
| RF-5 | Hinweis bei noch leerem Weg                            | Er nennt das Feld mit der 1 als nächsten Schritt.                           |
| RF-6 | Fenster wird während der Partie schmaler               | Das Gitter wird neu gebaut, der Weg bleibt.                                 |

## Hintergrund

Das Rätsel ist ein Hamiltonpfad mit Zwischenzielen. Der Erzeuger würfelt
zuerst einen Weg über das ganze Brett – Nachbarn mit den wenigsten freien
Anschlüssen zuerst, so läuft er sich selten fest – und setzt Anfang, Ende und
einige Zahlen dazwischen darauf ab. Ist die Aufgabe dann noch mehrdeutig,
kommt eine weitere Zahl dazu, höchstens achtmal.

Die Suche nach einem zweiten Weg ist teuer. Sie verwirft einen Ast, sobald ein
freies Feld nicht mehr erreichbar ist oder weniger als zwei Anschlüsse hat
(nur das Zielfeld kommt mit einem aus), und bricht nach 120 000 Schritten ab –
lieber „nicht eindeutig" melden als hängen bleiben.

Mauern dürfen überall stehen, nur nicht auf dem gesuchten Weg. Sie verraten
mehr, als sie verbieten; deshalb braucht schwer weniger Zahlen, als es ohne sie
bräuchte.

Nachgemessen mit einem Wegwerf-Skript gegen `spiele/zip.js`, Eindeutigkeit
zusätzlich mit einem unabhängigen Zähler ohne Schrittbremse:

| Stufe  | Rätsel | Lösung gültig | eindeutig | Zahlen Schnitt / max | Rechenzeit Schnitt / max |
| ------ | ------ | ------------- | --------- | -------------------- | ------------------------ |
| leicht | 30     | 30            | 30        | 9,6 / 12             | 16 ms / 63 ms            |
| mittel | 30     | 30            | 30        | 11,9 / 14            | 7 ms / 18 ms             |
| schwer | 15     | 15            | 15        | 14,8 / 18            | 103 ms / 434 ms          |

Die Grundzahlen 4, 6 und 10 werden also fast immer aufgestockt.
