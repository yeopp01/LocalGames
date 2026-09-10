# Minenfeld

**Datei:** [`spiele/minen.js`](../../spiele/minen.js)
**Stand:** 12/12 fertig

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
  „Neu, klein/mittel/groß" unter dem Ergebnis.
- **AC-3** `fertig` **Passt aufs Handy** — Die Kachelgröße richtet sich nach der
  Fensterbreite (höchstens 400 Pixel Feld, mindestens 20 Pixel je Kachel) und
  wird beim Ändern der Fenstergröße neu berechnet.

### Spielzug

- **AC-4** `fertig` **Erster Klick sicher** — Der erste Klick trifft nie eine
  Mine. Die Minen werden erst danach verteilt, außerhalb des angetippten Feldes
  und seiner acht Nachbarn – der Anfang öffnet also immer eine Fläche.
- **AC-5** `fertig` **Leere Felder öffnen mit** — Ein Feld ohne Minen in der
  Nachbarschaft deckt seine Nachbarn mit auf, bis an die Zahlen heran.
- **AC-6** `fertig` **Fahne auf drei Wegen** — Eine Fahne setzt und entfernt man
  mit der rechten Maustaste, mit langem Drücken (420 ms) oder im eingeschalteten
  Fahnen-Modus mit einfachem Tippen. Ein beflaggtes Feld lässt sich nicht
  aufdecken, ein offenes nicht beflaggen.
- **AC-7** `fertig` **Zahl öffnet Umgebung** — Ein Tipp auf eine offene Zahl
  deckt die übrigen Nachbarn auf, wenn genau so viele Fahnen daneben stehen, wie
  die Zahl sagt. Liegt eine Fahne falsch, geht dabei eine Mine hoch.
- **AC-8** `fertig` **Uhr ab erstem Zug** — Die Zeit läuft erst ab dem ersten
  Aufdecken und steht still, solange das Spiel nicht offen ist.

### Ende der Partie

- **AC-9** `fertig` **Sieg räumt das Feld** — Sind alle minenfreien Felder offen,
  ist die Partie gewonnen: alle Minen bekommen eine Fahne, es erscheint „Feld
  geräumt." mit Stufe und Zeit.
- **AC-10** `fertig` **Verlust zeigt alles** — Wer eine Mine aufdeckt, verliert:
  „Bumm.", alle Minen liegen offen, falsch gesetzte Fahnen sind mit × markiert.
  Danach nimmt das Feld keine Züge mehr an.

### Speicher und Statistik

- **AC-11** `fertig` **Partie überlebt Schließen** — Eine laufende Partie steht
  nach Zurück, Neuladen oder Neustart der App unverändert wieder da, samt
  verbrauchter Zeit. Eine beendete Partie wird nicht wiederhergestellt.
- **AC-12** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `gewonnen`, `dauer`, `stufe` und `aufgedeckt` notiert. Die Statistik zeigt je
  Stufe die Bestzeit aus gewonnenen Partien und „–", solange es keine gibt –
  auch bei Partien, denen `stufe` oder `dauer` fehlt.

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
sobald genug Fahnen daneben stehen.

| Größe | Feld | Minen |
| --- | --- | --- |
| klein | 8 × 10 | 10 |
| mittel | 10 × 14 | 24 |
| groß | 12 × 18 | 40 |
