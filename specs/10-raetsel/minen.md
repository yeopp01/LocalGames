# Minenfeld

**Datei:** [`spiele/minen.js`](../../spiele/minen.js)
**Stand:** 15/15 fertig

## Zweck

Das alte Minesweeper für zwischendurch: Felder aufdecken, bis nur noch die
Minen zugedeckt sind. Gebaut für den Finger auf dem Handy genauso wie für die
Maus am Rechner.

## Akzeptanzkriterien

### Feld und Stufen

- **AC-1** `fertig` **Drei Größen** — Es gibt die Stufen klein (8 × 10, 10
  Minen), mittel (10 × 14, 24 Minen) und groß (12 × 18, 40 Minen). Die Kopfzeile
  nennt Spalten × Zeilen, darüber stehen Stufe, verbleibende Minen und Zeit.
- **AC-2** `fertig` **Neues Feld wählbar** — Das Werkzeug „Neues Feld" bietet
  alle drei Stufen an; nach einer beendeten Partie stehen sie als Knöpfe
  unter dem Ergebnis, die gespielte als „Nochmal".
- **AC-3** `fertig` **Brett nach Fenster** — Die Kachelgröße richtet sich nach Breite
  und Höhe des Fensters (22 bis 54 Pixel je Kachel) und wird beim Ändern der
  Fenstergröße neu berechnet, ohne dass ein laufender Druck abbricht. Brett und
  Moduswahl passen ohne Scrollen ins Fenster; einzig „groß" braucht auf 320 × 568 und
  1000 × 560 etwas Scrollen, weil die Kacheln sonst zu klein würden.

### Spielzug

- **AC-4** `fertig` **Erster Klick sicher** — Der erste Klick trifft nie eine
  Mine. Die Minen werden erst danach verteilt, außerhalb des angetippten Feldes
  und seiner acht Nachbarn – der Anfang öffnet also immer eine Fläche.
- **AC-5** `fertig` **Leere Felder öffnen mit** — Ein Feld ohne Minen in der
  Nachbarschaft deckt seine Nachbarn mit auf, bis an die Zahlen heran.
- **AC-6** `fertig` **Fahne auf drei Wegen** — Eine Fahne setzt und entfernt man
  mit der rechten Maustaste, mit langem Drücken (420 ms) oder im Modus „Fahne" mit
  einfachem Tippen. Unter dem Brett steht dafür die Wahl „Aufdecken" oder „Fahne",
  die immer zeigt, was der nächste Tipp tut; im Fahnen-Modus trägt auch das Brett
  einen roten Rand. Ein beflaggtes Feld lässt sich nicht aufdecken, ein offenes nicht
  beflaggen. Meldet das Gerät den langen Druck zusätzlich als Kontextmenü (Android),
  wechselt die Fahne trotzdem nur einmal; zieht der Finger danach vom Feld, geht der
  nächste Tipp nicht verloren.
- **AC-7** `fertig` **Zahl öffnet Umgebung** — Ein Tipp auf eine offene Zahl
  deckt die übrigen Nachbarn auf, wenn genau so viele Fahnen daneben stehen, wie
  die Zahl sagt, in beiden Modi. Liegt eine Fahne falsch, geht dabei eine Mine hoch.
- **AC-14** `fertig` **Zahl sagt, was fehlt** — Stimmt die Zahl der Fahnen nicht,
  leuchten die fraglichen Felder kurz auf, und die Unterzeile sagt „Noch 1 Fahne" oder
  „3 statt 2 Fahnen". Eine Zahl, um die herum alles offen oder beflaggt ist und deren
  Fahnen stimmen, wird blass; stehen zu viele Fahnen daneben, wird sie rot hinterlegt.
  Gezählt wird nur, was der Spieler sieht – auch falsche Fahnen zählen mit.
- **AC-15** `fertig` **Tastatur** — Die Pfeile wandern übers Feld (der erste setzt
  den Fokus aufs Brett), Enter oder Leertaste decken auf, F setzt die Fahne, ohne
  Fokus aufs Brett schaltet F den Modus. Nur ein Feld steht in der Tab-Reihenfolge.
  Solange ein Blatt offen ist oder Strg, Alt oder Cmd gedrückt sind, zählt keine Taste.
- **AC-8** `fertig` **Uhr ab erstem Zug** — Die Zeit läuft erst ab dem ersten
  Aufdecken und steht still, solange das Spiel nicht offen ist.

### Ende der Partie

- **AC-9** `fertig` **Sieg räumt das Feld** — Sind alle minenfreien Felder offen,
  ist die Partie gewonnen: alle Minen bekommen eine Fahne, es erscheint „Feld
  geräumt." mit Stufe und Zeit, das Ergebnis scrollt ins Bild. War die Zeit besser als
  alle früheren dieser Stufe, steht dort „Neue Bestzeit".
- **AC-10** `fertig` **Verlust zeigt alles** — Wer eine Mine aufdeckt, verliert:
  „Bumm.", alle Minen liegen offen, die getroffene ist kräftig rot, falsch gesetzte
  Fahnen sind mit × markiert. Danach nimmt das Feld keine Züge mehr an.

### Speicher und Statistik

- **AC-11** `fertig` **Partie überlebt Schließen** — Eine laufende Partie steht
  nach Zurück, Neuladen oder Neustart der App unverändert wieder da, samt
  verbrauchter Zeit. Eine beendete Partie wird nicht wiederhergestellt.
- **AC-12** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `gewonnen`, `dauer`, `stufe` und `aufgedeckt` notiert. Die Statistik zeigt je
  Stufe die Bestzeit aus gewonnenen Partien und „–", solange es keine gibt –
  auch bei Partien, denen `stufe` oder `dauer` fehlt.
- **AC-13** `fertig` **Stufe und Ende ohne Lesen** — Kopfzeile, Blatt „Neues
  Feld" und Knöpfe unter dem Ergebnis zeigen die Stufe auch als Punkte in
  Ampelfarbe (Schnittstelle AC-15); die gespielte heißt dort „Nochmal" und trägt
  den Kreispfeil. Über „Feld geräumt." steht ein grüner Haken, über „Bumm."
  nicht.

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                           |
| ---- | ------------------------------------------------- | -------------------------------------------------------------- |
| RF-1 | Mehr Fahnen gesetzt als Minen                     | Der Minenzähler wird negativ; nichts wird gesperrt.            |
| RF-2 | Nach einer beendeten Partie das Spiel neu öffnen  | Es beginnt ein frisches Feld der Stufe klein.                  |
| RF-3 | Langes Drücken endet auf dem Feld                 | Nur die Fahne wechselt, der anschließende Klick deckt nicht auf. |
| RF-4 | Fenster wird während der Partie schmaler          | Das Gitter wird neu gebaut, der Spielstand bleibt.             |

## Hintergrund

Zwei Zugeständnisse an das Spielgefühl:

* Der **erste Klick ist immer sicher**. Die Minen werden erst danach verteilt,
  und zwar außerhalb des angetippten Feldes samt seiner acht Nachbarn – der
  Anfang ist also nie ein Rätselraten.
* Für Finger gibt es einen **Fahnen-Modus**; am Rechner geht weiter die rechte
  Maustaste, auf dem Handy zusätzlich langes Drücken.

Auf eine bereits offene Zahl zu tippen deckt die restlichen Nachbarn auf,
sobald genug Fahnen daneben stehen. Die Meldung, was dafür fehlt, steht in der
Unterzeile statt in einem Toast: Der läge auf flachen Fenstern über der Moduswahl.

| Größe | Feld | Minen |
| --- | --- | --- |
| klein | 8 × 10 | 10 |
| mittel | 10 × 14 | 24 |
| groß | 12 × 18 | 40 |
