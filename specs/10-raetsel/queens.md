# Damen

**Datei:** [`spiele/queens.js`](../../spiele/queens.js)
**Stand:** 18/18 fertig

## Zweck

Ein Logikrätsel nach dem Vorbild von Queens: In jede Zeile, jede Spalte und
jedes Farbgebiet gehört genau eine Dame, und zwei Damen berühren sich nicht.
Für alle, die gern Schluss an Schluss reihen – ohne dass irgendwo probiert
werden muss.

## Akzeptanzkriterien

### Feld und Stufen

- **AC-1** `fertig` **Drei Größen** — Es gibt die Stufen leicht (6 × 6), mittel
  (7 × 7) und schwer (8 × 8) mit je so vielen zusammenhängenden Farbgebieten,
  wie das Brett Kanten hat. Die Kopfzeile zeigt Stufe, Zeit und „n/k Damen",
  darüber steht „k × k".
- **AC-2** `fertig` **Neues Rätsel wählbar** — Das Werkzeug „Neues Rätsel"
  bietet alle drei Stufen an; nach einem gelösten Rätsel stehen sie als Knöpfe
  „Neu, leicht/mittel/schwer" unter dem Ergebnis.
- **AC-3** `fertig` **Gebiete klar getrennt** — Jedes Gebiet hat seine Farbe,
  an jeder Gebietsgrenze liegt eine dicke Linie. Die Feldgröße richtet sich
  nach der Fensterbreite (höchstens 340 Pixel Brett) und wird beim Ändern der
  Fenstergröße neu berechnet.

### Eingabe

- **AC-4** `fertig` **Tippen schaltet weiter** — Ein Tipp schaltet ein Feld
  leer → × → Dame → leer. Ist ein leeres Feld schon automatisch ausgekreuzt,
  setzt der Tipp gleich die Dame. Tastatur und Vorlesehilfen lösen denselben
  Wechsel aus.
- **AC-5** `fertig` **Streichen setzt Kreuze** — Wer über mehrere Felder
  streicht, setzt auf allen ein Kreuz; beginnt der Strich auf einem Kreuz,
  entfernt er stattdessen Kreuze. Gesetzte Damen bleiben dabei unberührt.
- **AC-6** `fertig` **Kreuze automatisch** — Ist der Schalter an, erscheint
  auf jedem Feld, das eine gesetzte Dame abdeckt (Zeile, Spalte, Farbe, acht
  Nachbarn), ein blasses Kreuz. Diese Kreuze werden nicht gespeichert und
  verschwinden, sobald die Dame weicht; eigene Kreuze bleiben.
- **AC-7** `fertig` **Rückgängig je Zug** — „Rückgängig" nimmt den letzten Zug
  zurück, ein ganzer Streichzug zählt als einer. Mindestens 60 Schritte bleiben
  erhalten, auch über ein Neuladen hinweg. Ohne Verlauf ist der Knopf gesperrt.

### Konflikte und Hinweise

- **AC-8** `fertig` **Konflikte rot umrandet** — Stehen zwei Damen in derselben
  Zeile, Spalte oder Farbe oder berühren sie sich, sind beide sofort rot
  umrandet – ohne dass jemand den Hinweis drückt.
- **AC-9** `fertig` **Hinweis nennt seinen Schluss** — Der Hinweis kennt genau
  zwei Schlüsse: „Nur ein Feld bleibt übrig" (eine Zeile, Spalte oder Farbe hat
  nur noch einen möglichen Platz) und „Das fällt so oder so weg" (jede noch
  mögliche Stelle einer Einheit deckt dieselben Felder ab). Er nennt die
  Einheit und den Grund, zeigt ein kleines Brett mit Kandidaten und Folgen und
  bietet „Dame setzen" bzw. „Kreuze setzen" oder „Selbst machen" an. Er liest
  nie die beim Erzeugen gemerkte Lösung. Findet er nichts, sagt er „Hier sehe
  ich nichts Zwingendes".
- **AC-10** `fertig` **Falsches kommt zuerst** — Vor jedem Schluss prüft der
  Hinweis, was nachweislich falsch liegt: stören sich Damen, heißt es „Zwei
  Damen stören sich"; steht eine Dame auf einem Feld, das in keiner Lösung
  eine trägt, oder ein Kreuz auf einem Feld, das in jeder Lösung eine trägt,
  werden diese rot gezeigt und lassen sich mit „Wegnehmen" räumen; gehen die
  Damen nur zusammen nicht auf, sagt er das, ohne die störende Kombination zu
  verraten.
- **AC-11** `fertig` **Hinweise werden gezählt** — Jedes Hinweisblatt mit Schluss
  oder Fehlerbefund zählt als Hinweis, auch wenn man ihn nicht übernimmt. Das
  Blatt zu störenden Damen und „nichts Zwingendes" zählen nicht.

### Erzeugung

- **AC-12** `fertig` **Genau eine Lösung** — Jedes Rätsel hat genau eine
  Lösung: Nach dem Wachsen der Gebiete wird so lange nachgeschärft, bis der
  Zähler keine zweite Lösung mehr findet.
- **AC-13** `fertig` **Ohne Raten geprüft** — Bevor ein Rätsel ausgegeben wird,
  muss es sich allein mit den beiden Schlüssen des Hinweises vom leeren Brett
  bis zur letzten Dame lösen lassen.
- **AC-14** `fertig` **Nie ein Rate-Rätsel** — Es erscheint nie ein Rätsel, das
  Probieren verlangt, und das Spiel bricht nicht ab. Kommt auf der gewählten
  Stufe binnen 0,6 Sekunden kein ohne Raten lösbares Rätsel zustande, weicht
  die Erzeugung auf die nächstkleinere Stufe aus und sagt das in einer Meldung
  („Auf schwer kam gerade kein Rätsel zustande – hier eins auf mittel.").
  Gelingt auch leicht nicht, erscheint ein fest hinterlegtes, nachgeprüftes
  6 × 6-Rätsel.

### Ende, Speicher und Statistik

- **AC-15** `fertig` **Sieg bei voller Lösung** — Stehen alle k Damen auf den
  Feldern der Lösung, erscheint „Alle Damen sitzen." mit Stufe, Zeit und Zahl
  der Hinweise („ohne Hinweis", wenn keiner). Danach nimmt das Brett keine
  Züge mehr an, Leiste und Hinweis verschwinden.
- **AC-16** `fertig` **Partie überlebt Schließen** — Ein laufendes Rätsel steht
  nach Zurück, Neuladen oder Neustart unverändert wieder da, samt Kreuzen,
  Verlauf, Hinweiszahl und verbrauchter Zeit; die Zeit mit geschlossener App
  zählt nicht mit. Ein gelöstes Rätsel wird nicht wiederhergestellt.
- **AC-17** `fertig` **Partie in der Statistik** — Jedes gelöste Rätsel wird mit
  `gewonnen: true`, `dauer`, `stufe` und `hilfen` notiert; ein abgebrochenes
  wird nicht notiert. Die Statistik zeigt „Bestzeit 6×6", „7×7" und „8×8" aus
  gewonnenen Partien und „–", solange es keine gibt – auch bei leeren Listen
  und bei Partien ohne `stufe` oder `dauer`.
- **AC-18** `fertig` **Anleitung erklärt alles** — Das Blatt „Anleitung" nennt
  die Regeln (auch: keine Diagonale über mehr als ein Feld), die Bedienung,
  die automatischen Kreuze, Rückgängig, einen guten Anfang und dass der
  Hinweis nie in die Lösung schaut, aber Falsches zuerst meldet.

## Randfälle

| #    | Fall                                                  | Erwartetes Verhalten                                                         |
| ---- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| RF-1 | Streichzug endet auf einem anderen Feld als begonnen  | Der nächste Streichzug setzt auch auf seinem ersten Feld ein Kreuz.          |
| RF-2 | Gespeicherter Stand aus einer Fassung ohne Verlauf    | Das Rätsel lädt, Rückgängig beginnt mit leerem Verlauf.                      |
| RF-3 | „Kreuze automatisch" aus, Hinweis gedrückt            | Der Hinweis rechnet trotzdem mit allem, was gesetzte Damen abdecken.         |
| RF-4 | Nach einem gelösten Rätsel das Spiel neu öffnen       | Es beginnt ein frisches Rätsel der Stufe leicht.                             |
| RF-5 | Fenster wird während der Partie schmaler              | Das Brett wird neu gebaut, der Spielstand bleibt.                            |
| RF-6 | Eigenes Kreuz auf einem Feld, das keine Dame trägt    | Gilt als Notiz; der Hinweis rechnet es als ausgeschlossen und meldet nichts. |
| RF-7 | Erzeuger liefert auf keiner Stufe ein Rätsel          | Kein Absturz: das hinterlegte 6 × 6-Rätsel, bei mittel/schwer mit Meldung.   |

## Hintergrund

Anders als im Schach schlagen sich die Damen nicht über die ganze Diagonale –
nur die acht direkten Nachbarfelder sind tabu.

Der Erzeuger setzt zuerst die Damen (benachbarte Zeilen mindestens zwei
Spalten auseinander) und lässt von jeder aus ein Gebiet wachsen. Zufällig
gewachsene Gebiete sind fast nie eindeutig; statt neu zu würfeln, wird
nachgeschärft: Zu jeder unerwünschten zweiten Lösung wandert eine ihrer
Damenzellen in ein Nachbargebiet, das diese Lösung dann doppelt belegt – die
echte Lösung bleibt unberührt, das Gebiet bleibt zusammenhängend.

Danach die zweite Hürde: Der Prüfer kennt genau die beiden Schlüsse des
Hinweises und wendet sie bis zum Stillstand an. Die geläufigen Fälle – eine
Farbe ganz in einer Zeile räumt diese Zeile – fallen aus der gemeinsamen
Abdeckung von selbst ab. Bleibt er vor der letzten Dame stehen, wird
nachgeholfen: Ein Feld, das an der Stelle noch in Frage kommt (nie eine
Damenzelle), wandert ins Nachbargebiet, und der Umbau bleibt nur, wenn der
Prüfer danach weiter kommt. Auf schwer verwarf der Erzeuger sonst zwei von drei
eindeutigen Rätseln; nachgeholfen gelingt es bei gut neun von zehn in wenigen
Millisekunden. Auf rohen, noch mehrdeutigen Gebieten lohnt es sich nicht – das
war langsamer als neu zu würfeln. Mehr als die Hälfte aller Anläufe ging
außerdem verloren, weil das Wachsen schon aufgab, wenn in einer Runde zufällig
jedes Gebiet ein zugebautes Randfeld zog.

Gesucht wird gegen eine Frist statt gegen eine feste Zahl Anläufe, damit ein
langsames Handy genauso bald ausweicht wie ein PC. Der Hinweis sucht jedes Mal
neu, statt in der gemerkten Lösung nachzusehen. Für den Fehlerbefund (AC-10)
zählt er dabei alle Lösungen des Rätsels durch; der Befund folgt aus dem
Rätsel, eine Begründung gibt er dafür bewusst nicht.

Nachgemessen mit einem Wegwerf-Skript gegen `spiele/queens.js`, je 500 Rätsel,
alle eindeutig und ohne Raten lösbar, nie ausgewichen:

| Stufe  | Anläufe Median / max vorher | nachher | Rechenzeit Median / max vorher | nachher        |
| ------ | --------------------------- | ------- | ------------------------------ | -------------- |
| leicht | 5 / 53                      | 2 / 14  | 0,4 ms / 6 ms                  | 0,4 ms / 12 ms |
| mittel | 14 / 163                    | 4 / 26  | 1,9 ms / 30 ms                 | 1,7 ms / 28 ms |
| schwer | 33 / 337 (von 720)          | 7 / 57  | 18 ms / 395 ms                 | 10 ms / 107 ms |

Vorher gab es nach 720 Anläufen ein eindeutiges, aber nur mit Raten lösbares
Rätsel als Notnagel, und lieferte der Erzeuger gar nichts, brach das Spiel ab.
Mit nur einem Anlauf je Stufe erzwungen (je 300-mal) wich die Erzeugung
aus – etwa schwer 34-mal auf schwer, 57-mal auf mittel, 209-mal auf leicht –,
und jedes ausgegebene Rätsel war ohne Raten lösbar.
