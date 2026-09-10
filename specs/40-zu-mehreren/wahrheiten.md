# Zwei Wahrheiten

**Datei:** [`spiele/wahrheiten.js`](../../spiele/wahrheiten.js)
**Stand:** 10/10 fertig

## Zweck

Das Kennenlernspiel „Zwei Wahrheiten, eine Lüge" mit einem Handy: einer
schreibt drei Sätze über sich, die anderen raten geheim, welcher erfunden ist.
Das Gerät prüft nichts nach – es hält nur auseinander, wer was sehen darf.

## Akzeptanzkriterien

### Aufbau

- **AC-1** `fertig` **Drei bis zehn Spieler** — Der Aufbau nimmt 3 bis 10
  Spieler mit Namen; der Knopf heißt „Losschreiben". Dran ist der Spieler, bei
  dem die letzte Runde aufgehört hat, beim ersten Mal der erste.

### Schreiben

- **AC-2** `fertig` **Schreiben hinter dem Sperrschirm** — Vor dem Schreiben
  steht ein Sperrschirm „Schreiben darf ‹Name›", die Kopfzeile nennt „‹Name› ist
  dran". Danach gibt es drei Felder (je höchstens 90 Zeichen) und die Wahl „Der
  erste", „Der zweite", „Der dritte" für die Lüge.
- **AC-3** `fertig` **Nur vollständig weitergeben** — „Fertig – weitergeben"
  bleibt gesperrt, bis alle drei Sätze etwas anderes als Leerzeichen enthalten
  und die Lüge gewählt ist.
- **AC-4** `fertig` **Sätze werden gemischt** — Vor dem Raten kommen die drei
  Sätze in eine zufällige Reihenfolge; die Lüge steht nicht mehr dort, wo sie
  geschrieben wurde. Gemessen an 3000 Runden, in denen die Lüge immer als
  dritter Satz geschrieben wurde: danach an Stelle 1, 2, 3 in 983, 961 und 1056
  Fällen.

### Raten

- **AC-5** `fertig` **Raten reihum und geheim** — Alle außer dem Schreiber raten
  in Sitzreihenfolge, jeder hinter einem Sperrschirm „Raten darf ‹Name›". Kein
  Sperrschirm zeigt einen Satz, und niemand sieht beim Raten, was vor ihm
  getippt wurde. Ein Tipp auf einen Satz gibt die Stimme ab und zeigt sofort den
  nächsten Sperrschirm.
- **AC-6** `fertig` **Auflösung mit Namen** — Nach dem letzten Tipp zeigt das
  Ende „Durchschaut.", wenn mehr als die Hälfte die Lüge gefunden hat, sonst
  „Gut gelogen.", dazu „r von n haben die Lüge gefunden.". Darunter stehen die
  drei Sätze in der gemischten Reihenfolge, die Lüge markiert, und zu jedem
  Satz, wer ihn für gelogen hielt („–", wenn niemand).
- **AC-7** `fertig` **Der Nächste ist dran** — „Weiter – ‹Name› ist dran" gibt
  das Schreiben reihum an den nächsten Spieler; nach dem letzten ist wieder der
  erste dran. Die neue Runde beginnt direkt beim Sperrschirm fürs Schreiben.

### Speicher und Statistik

- **AC-8** `fertig` **Keine Sätze im Speicher** — Gemerkt werden nur die Namen
  und wer als Nächstes schreibt. Sätze, Lüge und Tipps werden nie gespeichert;
  eine unterbrochene Runde beginnt beim nächsten Öffnen mit dem Aufbau. Passt
  der gemerkte Schreiber nicht mehr zur Gruppe, ist der erste dran.
- **AC-9** `fertig` **Runde in der Statistik** — Jede aufgelöste Runde wird
  genau einmal notiert mit `gewonnen` (`true` heißt: die Mehrheit hat
  durchschaut), `dauer`, `spieler`, `richtig` und `rater`. Eine vor der
  Auflösung abgebrochene Runde wird nicht notiert.
- **AC-10** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt die
  Zahl der Runden, „Tipps richtig" als Anteil aller richtigen an allen Tipps
  und die übliche Spielerzahl. Eine leere Liste ergibt keine Kennzahlen;
  fehlen `richtig` und `rater`, steht „–" statt einer Quote.

## Randfälle

| #    | Fall                                                   | Erwartetes Verhalten                                                  |
| ---- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| RF-1 | Genau die Hälfte findet die Lüge (z. B. 1 von 2)      | „Gut gelogen.", notiert mit `gewonnen: false`.                        |
| RF-2 | Zwei Sätze lauten gleich                               | Beide stehen als eigene Knöpfe da; gezählt wird die Stelle, nicht der Text. |
| RF-3 | Gemerkter Schreiber liegt hinter der verkleinerten Gruppe | Der erste Spieler ist dran.                                        |
| RF-4 | „Neue Runde" während des Schreibens oder Ratens        | Zurück zum Aufbau, nichts wird notiert.                               |

## Hintergrund

Einer schreibt drei Sätze über sich auf, zwei stimmen. Dann wandert das Gerät,
und jeder andere tippt auf den, den er für gelogen hält.

Die drei Sätze werden vor dem Raten **gemischt**. Ohne das gewöhnt sich die
Runde daran, dass die Lüge immer an derselben Stelle steht – Leute schreiben
sie gern zuletzt.

Das Gerät prüft nichts nach; es hält nur auseinander, wer was sehen darf. Beim
Schreiben liegt ein Sperrschirm davor, beim Raten auch – wer als Zweiter rät,
sieht die Stimme des Ersten nicht.
