# Weg

**Datei:** [`spiele/zip.js`](../../spiele/zip.js)
**Stand:** 20/20 fertig

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
  Das folgt aus AC-10: Wer das ganze Rätsel mit zwingenden Schlüssen herleitet,
  hat keine Wahl gelassen.
- **AC-10** `fertig` **Ohne Raten lösbar** — Jedes ausgegebene Rätsel lässt sich
  vom leeren Brett bis zum letzten Feld allein mit den Schlüssen aus AC-18
  herleiten, ohne einen Weg auf Verdacht zu probieren. Kommen die Schlüsse
  beim Erzeugen nicht bis zum Ende, bekommt ein Feld, an dem sie hängen
  geblieben sind, eine Zahl; Zahlen, die sie nicht brauchen, fallen danach
  wieder weg, höchstens bis zur Grundzahl der Stufe.
- **AC-11** `fertig` **Hinweis nennt seinen Grund** — Der Hinweis nennt genau
  einen Schluss aus dem aktuellen Stand – Weg und Merklinien – samt Grund, etwa
  „Die 3 ist von links her schon verbunden und muss noch weiter. Sie liegt am
  Rand. Nach unten kämen die Zahlen in der Folge 2, 3, 5 statt der Reihe nach.
  Bleibt nur rechts – dort muss der Weg entlang." Er liest dafür nie die beim
  Erzeugen gemerkte Lösung; überschreibt man sie im Speicher, bleibt der
  Hinweis derselbe. Findet er nichts, sagt er „Hier sehe ich nichts
  Zwingendes"; stehen alle Verbindungen schon als Linie da, bietet er
  „Nachziehen" an.
- **AC-12** `fertig` **Irrweg wird erkannt** — Enthält der gezogene Weg einen
  Schritt, der sich nicht herleiten lässt, sagt der Hinweis das zuerst („Ab
  hier führt es in die Irre"), nennt, woran es scheitert (etwa eine Sackgasse,
  ein abgeschnittener Teil, Zahlen außer der Reihe), und bietet an, bis zum
  letzten passenden Feld zurückzunehmen.
- **AC-13** `fertig` **Hinweise werden gezählt** — Jeder Druck auf „Hinweis"
  zählt als Hinweis, auch wenn das Angebot nicht angenommen wird.
- **AC-18** `fertig` **Ein Satz Schlüsse** — Erzeuger und Hinweis ziehen
  dieselben Schlüsse. Jedes Feld braucht zwei Verbindungen, die 1 und die
  höchste Zahl eine. Eine Verbindung scheidet aus, wenn dort eine Mauer steht,
  ein Feld schon genug Verbindungen hat, sich der Weg zu einem Ring schlösse,
  die 1 und die höchste Zahl aneinanderhingen, bevor alle Felder dran sind,
  oder die Zahlen nicht mehr der Reihe nach kämen. Hat ein Feld nur noch so
  viele mögliche Verbindungen, wie es braucht, benutzt der Weg sie alle.
- **AC-19** `fertig` **Merklinien aus dem Hinweis** — „Einzeichnen" zieht den Weg
  weiter, soweit der Schluss an seiner Spitze (oder an der 1) hängt; alles
  andere bleibt als dünne gestrichelte Linie liegen. Die Linien werden
  gespeichert, bleiben bei „Von vorn" und „Ein Feld zurück" stehen und zählen
  für den nächsten Hinweis als sicher.
- **AC-20** `fertig` **Altes Rätsel wird ersetzt** — Lädt ein gespeichertes
  Rätsel aus einer früheren Fassung, das sich mit den Schlüssen nicht lösen
  lässt, gibt es stattdessen ein neues derselben Stufe und die Meldung „Das
  gespeicherte Rätsel stammte aus einer älteren Fassung und ließ sich nicht
  ohne Raten lösen – hier ist ein neues." Lösbare alte Rätsel laden samt Weg.

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
| RF-4 | Die Schlüsse bleiben beim Erzeugen stecken             | Eine weitere Zahl kommt dazu; mit allen Feldern nummeriert geht es immer.   |
| RF-5 | Hinweis bei noch leerem Weg                            | Er nennt einen Schluss wie sonst; hängt der an der 1, beginnt dort der Weg. |
| RF-6 | Fenster wird während der Partie schmaler               | Das Gitter wird neu gebaut, der Weg bleibt.                                 |
| RF-7 | Alle Verbindungen stehen als Linie, der Weg noch nicht | „Alles hergeleitet" mit „Nachziehen", das den Weg die Linien entlangzieht.  |
| RF-8 | Zufallssuche findet keinen Weg über das Brett          | Ein Schlangenweg Zeile für Zeile springt ein; die Schlüsse gelten wie sonst. |

## Hintergrund

Das Rätsel ist ein Hamiltonpfad mit Zwischenzielen. Der Erzeuger würfelt
zuerst einen Weg über das ganze Brett – Nachbarn mit den wenigsten freien
Anschlüssen zuerst, so läuft er sich selten fest – und setzt Anfang, Ende und
einige Zahlen dazwischen darauf ab. Dann zieht er die Schlüsse aus AC-18,
bis nichts mehr geht. Bleiben sie stecken, bekommt ein noch offenes Feld eine
Zahl; danach wird jede Zwischenzahl einmal probeweise entfernt und bleibt weg,
wenn die Schlüsse trotzdem durchkommen.

Gedacht wird in Verbindungen zwischen Nachbarfeldern statt in Schritten ab der
1: So lassen sich auch Ecken und Engstellen weit vor der Spitze herleiten, und
der Hinweis kann sie als Merklinie hinlegen. Weil jeder Schluss für sich
zwingend ist, heißt „bis zum Ende hergeleitet" auch „genau ein Weg" – die
frühere Suche nach einem zweiten Weg mit ihrer Schrittbremse ist entfallen.
Einen Irrweg erkennt der Hinweis daran, dass ein gezogener Schritt in der
Herleitung vom leeren Brett nicht vorkommt; als Grund nennt er den
Widerspruch, auf den der aktuelle Stand sofort oder nach weiteren zwingenden
Schritten stößt.

Erwogen und verworfen: „Die einzige Verbindung zwischen zwei Teilen des
Bretts muss benutzt werden." Unter 600 Rätseln fand sie ein einziges Mal etwas,
das der Zwang nicht fand – zu selten für einen eigenen Hinweistext. Übrig
bleibt davon die Prüfung, ob ein Teil abgeschnitten ist.

Mauern dürfen überall stehen, nur nicht auf dem gesuchten Weg. Sie verraten
mehr, als sie verbieten; deshalb braucht schwer weniger Zahlen, als es ohne sie
bräuchte.

Nachgemessen mit Wegwerf-Skripten gegen `spiele/zip.js` (Node, PC), je 200
Rätsel pro Stufe. Eindeutigkeit zusätzlich mit einem unabhängigen Zähler ohne
Schrittbremse; „per Hinweis gelöst" heißt: im Spiel nur „Hinweis" und
„Einzeichnen" bzw. „Nachziehen" gedrückt, bis „Weg gefunden." kam.

| Stufe  | eindeutig | per Hinweis gelöst | Hinweise Schnitt | Zahlen Schnitt / min / max | Bauzeit Median / max |
| ------ | --------- | ------------------ | ---------------- | -------------------------- | -------------------- |
| leicht | 200       | 200                | 19,5             | 7,1 / 5 / 10               | 3 ms / 59 ms         |
| mittel | 200       | 200                | 28,3             | 8,7 / 6 / 14               | 4 ms / 7 ms          |
| schwer | 200       | 200                | 38,3             | 10,5 / 10 / 15             | 14 ms / 66 ms        |

Vor der Umstellung (Suche auf Eindeutigkeit, im Schnitt 9,6 / 11,9 / 14,8
Zahlen) hätten die Schlüsse 77 %, 62 % und 67 % der Rätsel gelöst. Gespeicherte
Rätsel aus jener Fassung laden deshalb nur, wenn sie aufgehen (AC-20); in einer
Stichprobe von 120 waren es 80. Überschrieb oder löschte das Prüfskript die
gemerkte Lösung vor einem Hinweis, blieb der Hinweis in allen 5 148 Fällen
wörtlich gleich.
