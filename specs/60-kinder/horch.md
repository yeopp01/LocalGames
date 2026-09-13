# Horch mal

**Datei:** [`spiele/horch.js`](../../spiele/horch.js)
**Stand:** 9/9 fertig

## Zweck

Für Kinder, die schon wissen, wie eine Kuh klingt: Ein Tier ruft, und das
Kind tippt auf das, das es war. Oben spielt ein großer Lautsprecher den Ruf,
so oft man will. Zimmer, Klang und Aufnahmen kommen aus dem Werkzeug
[Tiere](tiere.md).

## Akzeptanzkriterien

### Frage

- **AC-1** `fertig` **Zwei bis vier Tiere** — Auf dem Vorhang wählen die
  Eltern „Zwei Tiere", „Drei Tiere" oder „Vier Tiere"; die Wahl bleibt gemerkt.
  Vorgabe sind zwei.
- **AC-2** `fertig` **Nichts Verwechselbares** — Zur Wahl stehen nur Tiere
  mit Aufnahme. Schaf und Ziege stehen nie zusammen, Huhn und Hahn auch nicht.
  Eine Runde fragt sechs verschiedene Tiere.
- **AC-3** `fertig` **Ruf kommt von selbst** — 0,7 s nachdem die
  Tiere erschienen sind, ruft das gesuchte Tier. Der Lautsprecher spielt den Ruf
  auf jeden Tipp wieder und pocht, solange er tönt.

### Antwort

- **AC-4** `fertig` **Richtig** — Das Tier hüpft, die anderen verblassen,
  ein Dreiklang spielt, Konfetti fällt, oben steht „Das war die Kuh!", das Tier
  ruft noch einmal, und danach kommt die nächste Frage.
- **AC-5** `fertig` **Anderes Tier ruft selbst** — Ein anderes Tier wackelt,
  oben steht „Die Ente macht Quak!", und es ruft seinen eigenen Ruf. Danach
  kommt der gesuchte Ruf noch einmal. Tippt das Kind vorher schon wieder, gilt
  der neue Tipp, und die Wiederholung entfällt. Einen Fehlerton gibt es nicht.
- **AC-6** `fertig` **Sechs Fragen, dann Fest** — Nach der sechsten Frage
  steht „Super zugehört!" mit den sechs Tieren da; nach gut vier Sekunden oder
  einem Tipp (frühestens nach 1,2 s) beginnt die nächste Runde.
- **AC-7** `fertig` **Passt ins Fenster** — Lautsprecher und Tiere sind bei
  jeder Stufe auf einem Pixel 7 hoch und quer und in 1366 × 700 ganz zu sehen.
- **AC-8** `fertig` **Ohne Ton gesperrt** — Kann der Browser keine Töne
  abspielen, bleibt „Los geht's" aus, und der Vorhang sagt warum.

### Statistik

- **AC-9** `fertig` **Erkannt und auf Anhieb** — Jede Runde wird mit
  `dauer`, `fragen` (beantwortet), `aufAnhieb` (beim ersten Tipp richtig) und
  `stufe` notiert – eine angefangene beim Schließen des Zimmers, sofern schon
  eine Frage beantwortet ist. Die Statistik zeigt „Tiere erkannt" und „auf
  Anhieb" in Prozent, die Quote nur über Runden, die beide Felder haben.

## Randfälle

| #    | Fall                                                 | Erwartetes Verhalten                                           |
| ---- | ---------------------------------------------------- | -------------------------------------------------------------- |
| RF-1 | Tipp auf ein Tier, während der Ruf noch läuft        | Der Ruf bricht ab, der Tipp gilt.                              |
| RF-2 | Zweimal schnell auf zwei falsche Tiere               | Es ruft das zweite; danach kommt der gesuchte Ruf genau einmal. |
| RF-3 | Eingelesene Runde mit `aufAnhieb` größer als `fragen` | Die Quote bleibt bei höchstens 100 %.                          |

## Hintergrund

Ein falsches Tier ruft selbst, statt nur abzuweisen: So lernt das Kind auch
aus dem Fehlgriff, wie die Ente klingt, und das Spiel bleibt ein Spiel.

Schaf und Ziege meckern so ähnlich, dass auch Erwachsene raten. Huhn und Hahn
klingen verschieden, sehen als Emoji aber fast gleich aus – das Kind hätte
recht und würde doch falsch tippen.
