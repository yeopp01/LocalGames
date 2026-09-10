# Mini-Sudoku

**Datei:** [`spiele/sudoku.js`](../../spiele/sudoku.js)
**Stand:** 16/18 fertig · 2 offen

## Zweck

Sudoku im Kleinformat für die kurze Pause: sechs mal sechs Felder, Ziffern 1
bis 6, in ein paar Minuten gelöst. Wer hängt, bekommt einen Hinweis, der seinen
Schluss erklärt, statt eine Ziffer zu verraten.

## Akzeptanzkriterien

### Feld und Stufen

- **AC-1** `fertig` **Sechs mal sechs** — Das Gitter hat 6 × 6 Felder in sechs
  Blöcken von je 3 × 2. In jede Zeile, jede Spalte und jeden Block gehört jede
  Ziffer von 1 bis 6 genau einmal. Vorgegebene Ziffern sind als fest erkennbar
  und lassen sich nicht ändern („Das Feld war vorgegeben.").
- **AC-2** `fertig` **Drei Stufen wählbar** — Das Werkzeug „Neues Rätsel" bietet
  leicht, mittel und schwer an; nach einem gelösten Rätsel stehen „Neu,
  leicht/mittel/schwer" unter dem Ergebnis. Über dem Gitter stehen Stufe,
  laufende Zeit und die Zahl der offenen Felder.
- **AC-3** `offen` **Vorgaben genau nach Stufe** — Ein Rätsel beginnt mit genau
  20 (leicht), 15 (mittel) oder 11 (schwer) vorgegebenen Ziffern, nie mit mehr.

### Erzeugung

- **AC-4** `fertig` **Immer eindeutig lösbar** — Jedes Rätsel entsteht im Gerät
  und hat auf jeder Stufe genau eine Lösung.
- **AC-5** `offen` **Ohne Raten lösbar** — Jedes Rätsel lässt sich vom Anfang bis
  zum Ende allein mit Schlüssen lösen, die der Hinweis begründen kann. Der
  Hinweis kommt bei einem fehlerfreien Stand nie an eine Stelle, an der er „Hier
  hilft nur Ausprobieren" sagen muss.

### Eingabe

- **AC-6** `fertig` **Feld wählen, Ziffer setzen** — Ein Feld antippen, dann eine
  Ziffer im Ziffernblock: Sie steht im Feld. Dieselbe Ziffer noch einmal nimmt
  sie wieder weg, die Löschtaste leert das Feld samt Notizen. Ist kein Feld
  gewählt, kommt „Erst ein Feld antippen."
- **AC-7** `fertig` **Bedienung per Tastatur** — Die Pfeiltasten bewegen die
  Auswahl (ohne Auswahl beginnt sie oben links, am Rand bleibt sie stehen), 1 bis
  6 setzt eine Ziffer, 0, Rücktaste und Entf leeren, n schaltet die Notizen um.
  Solange ein Blatt offen ist oder Strg, Alt oder Cmd gedrückt sind, reagiert das
  Spiel nicht auf Tasten.
- **AC-8** `fertig` **Notizen als Kandidaten** — Im Notiz-Modus setzt und
  entfernt eine Ziffer eine kleine Notiz im Feld. Wird eine Ziffer gesetzt – von
  Hand oder über den Hinweis –, verschwindet sie aus den Notizen aller Felder in
  derselben Zeile, Spalte und demselben Block.
- **AC-9** `fertig` **Orientierung im Gitter** — Das gewählte Feld ist
  hervorgehoben, dazu seine Zeile, Spalte und sein Block sowie alle Felder mit
  derselben Ziffer. Eine Ziffer, die schon sechsmal im Gitter steht, tritt im
  Ziffernblock zurück.

### Fehler und Hinweise

- **AC-10** `fertig` **Doppelte Ziffern werden rot** — Steht eine Ziffer doppelt
  in einer Zeile, Spalte oder einem Block, sind beide Felder sofort rot. Andere
  Fehler zeigt das Gitter von sich aus nicht.
- **AC-11** `fertig` **Hinweis räumt Fehler zuerst** — Solange etwas rot ist,
  sagt der Hinweis nur „Erst die roten Felder". Stehen Ziffern, die in der Lösung
  dort nicht vorkommen, umrandet er alle auf einmal, nennt nicht die richtige und
  bietet „Alle wegnehmen" oder „Ich such es selbst" an. Die Umrandung verschwindet
  am Feld, sobald es angefasst wird, und kommt nach dem Neuladen nicht wieder.
- **AC-12** `fertig` **Hinweis begründet seinen Schluss** — Sonst nennt der
  Hinweis ein Feld und seine Ziffer mit Grund: Entweder passt dort nur noch diese
  Ziffer, oder die Ziffer hat in einer Zeile, Spalte oder einem Block nur noch
  dieses Feld. Ein Schluss der ersten Art am gewählten Feld hat Vorrang. Das Feld
  wird ausgewählt, eingetragen wird erst auf „Eintragen". Der Schluss stützt sich
  nur auf die Ziffern im Gitter.
- **AC-13** `fertig` **Ehrlich, wenn nichts zwingt** — Lässt sich kein solcher
  Schluss ziehen, sagt der Hinweis „Hier hilft nur Ausprobieren" und bietet an,
  ein Feld aufzudecken – das gewählte, wenn es leer ist, sonst ein zufälliges
  leeres.

### Ende, Speicher und Statistik

- **AC-14** `fertig` **Gelöst beendet die Partie** — Stimmt jedes Feld mit der
  Lösung überein, erscheint „Gelöst." mit Stufe, Zeit und Zahl der Hinweise
  („ohne Hinweis", wenn keiner). Ziffernblock, Notizen- und Hinweisknopf
  verschwinden, die Uhr steht.
- **AC-15** `fertig` **Rätsel überlebt Schließen** — Ein laufendes Rätsel steht
  nach Zurück, Neuladen oder Neustart der App mit Stufe, Eingaben, Notizen,
  Hinweiszahl und verbrauchter Zeit wieder da; die Zeit dazwischen zählt nicht.
  Nach einem gelösten Rätsel beginnt beim nächsten Öffnen ein neues auf leicht.
- **AC-16** `fertig` **Gelöstes in der Statistik** — Jedes gelöste Rätsel wird
  mit `gewonnen: true`, `dauer`, `stufe` (`leicht`, `mittel`, `schwer`) und
  `hilfen` notiert. `hilfen` zählt jedes gezeigte Blatt mit Umrandung, Schluss
  oder „Hier hilft nur Ausprobieren", auch wenn man den Vorschlag ablehnt – nicht
  aber „Erst die roten Felder". Ein verworfenes Rätsel wird nicht notiert.
- **AC-17** `fertig` **Bestzeit je Stufe** — Die Statistik zeigt je Stufe die
  Bestzeit aus gelösten Partien und „–", solange es keine gibt – auch bei leerer
  Liste und bei Partien, denen `stufe`, `dauer` oder `gewonnen` fehlt.
- **AC-18** `fertig` **Regeln auf Abruf** — Das Werkzeug „Regeln" erklärt die
  Regel, das Setzen und Wegnehmen von Ziffern, die Notizen, die rote Markierung
  und was der Hinweis tut – und dass er die richtige Ziffer nicht verrät.

## Randfälle

| #    | Fall                                                  | Erwartetes Verhalten                                                   |
| ---- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| RF-1 | Neues Rätsel mitten in einer Partie                   | Das alte wird ohne Rückfrage verworfen und nicht notiert.              |
| RF-2 | Notiz in ein Feld, in dem schon eine Ziffer steht     | Die Ziffer verschwindet, die Notiz steht.                              |
| RF-3 | Ziffer auf ein vorgegebenes Feld                      | Nichts ändert sich, Meldung „Das Feld war vorgegeben."                 |
| RF-4 | Pfeil links am Zeilenanfang oder rechts am Zeilenende | Die Auswahl bleibt stehen und springt nicht in die Nachbarzeile.       |
| RF-5 | Gitter voll, aber mit doppelten Ziffern               | Kein Sieg; die Doppelten sind rot, der Hinweis verweist auf sie.       |
| RF-6 | „Feld aufdecken" füllt das letzte leere Feld          | Die Partie gilt als gelöst und wird notiert.                           |

## Hintergrund

Die Rätsel entstehen im Browser, nicht aus einer Liste: erst ein volles Gitter
per Backtracking, dann werden Felder in zufälliger Reihenfolge geleert, solange
die Lösung eindeutig bleibt. Geprüft wird das, indem der Löser bis zur *zweiten*
Lösung zählt und dann abbricht.

| Stufe | Vorgaben | Rechenzeit |
| --- | --- | --- |
| leicht | 20 | wenige Millisekunden |
| mittel | 15 | wenige Millisekunden |
| schwer | 11 | wenige Millisekunden |

Jedes ausgegebene Rätsel ist damit garantiert eindeutig lösbar.
