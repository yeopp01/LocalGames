# Statistik

**Datei:** [`app.js`](../../app.js)
**Stand:** 14/14 fertig

## Zweck

Eine gemeinsame Statistik über alle Partien aller Spiele: wie viel, wie gut,
wie lange und wie regelmäßig gespielt wurde – insgesamt und je Spiel. Die
Zahlen entstehen allein aus den gespeicherten Partien auf dem Gerät.

## Akzeptanzkriterien

### Aufruf

- **AC-1** `fertig` **Statistik-Knopf je nach Ort** — Der Statistik-Knopf in
  der Kopfzeile öffnet aus einem Spiel heraus dessen Statistik
  (`#/statistik/<id>`), von überall sonst die Gesamtstatistik (`#/statistik`).
- **AC-2** `fertig` **Leerer Bestand sagt es** — Ohne Partien zeigt die
  Gesamtstatistik nur „Noch keine Partie gespielt. Sobald du eine beendest,
  steht sie hier.", die Statistik eines Spiels „Noch keine Partie beendet.
  Sobald du eine durchspielst, steht sie hier."

### Gesamtstatistik

- **AC-3** `fertig` **Vier Zahlen insgesamt** — Der Block „Insgesamt" zeigt die
  Zahl der Partien, die Siegquote („gewonnen"), die Spielzeit („gespielt") und
  die Tagesserie („1 Tag in Folge" bzw. „n Tage in Folge").
- **AC-4** `fertig` **Quote nur mit Urteil** — Jede Siegquote – insgesamt, je
  Spiel, auf Kachel und Streifen – rechnet nur über Partien, deren `gewonnen`
  ein Boolean ist, und wird auf ganze Prozent gerundet („67 %"). Gibt es keine
  solche Partie, steht „–". Partien ohne Urteil zählen dennoch in Anzahl,
  Spielzeit, Kalender und Serie.
- **AC-5** `fertig` **Spielzeit aus der Dauer** — Die Spielzeit ist die Summe
  von `dauer` aller Partien; fehlt das Feld, zählt die Partie mit 0. Angezeigt
  wird unter einer Minute in Sekunden („45 s"), unter einer Stunde in Minuten
  („12 min"), darüber „2 h 05 min".
- **AC-6** `fertig` **Serie reißt erst morgen** — Die Tagesserie zählt die Tage
  am Stück mit mindestens einer Partie. Ist heute noch nichts gespielt, zählt
  sie ab gestern weiter; erst ein ganzer Tag ohne Partie beendet sie.
- **AC-7** `fertig` **Tage nach Ortszeit** — „Heute", die Tagesserie, der
  Kalender und das Datum im Dateinamen der Sicherung richten sich nach dem
  Kalendertag der Ortszeit: Eine Partie um halb eins in Deutschland gehört zum
  neuen Tag, nicht zum Vortag der UTC-Mitternacht.
- **AC-8** `fertig` **Kalender der letzten Wochen** — Unter den Zahlen stehen
  35 Punkte für die letzten 35 Tage, heute als letzter. Die Stufe richtet sich
  nach der Zahl der Partien: keine, eine, zwei bis drei, vier und mehr. Jeder
  Punkt nennt als Titel Datum und Anzahl („2026-09-10: 3 Partien").
- **AC-9** `fertig` **Ein Block je Spiel** — Unter „Insgesamt" folgt für jedes
  angemeldete Spiel ein Block in seiner Farbe, auch für ungespielte („Noch
  nicht gespielt."). Die Überschrift eines Blocks führt zur Statistik des
  Spiels. Darunter steht der Knopf „Statistik sichern".

### Je Spiel

- **AC-10** `fertig` **Kennzahlen im Spielblock** — Ein Block zeigt die Zahl
  der Partien („Runden" bei `ohneSiege`), die Siegquote nur ohne `ohneSiege`
  und nur, wenn eine Partie ein Urteil hat, dann die Kennzahlen aus der
  `auswertung` des Spiels, dann die allgemeinen Kennzahlen, zuletzt ein
  optionaler `zusatz` des Spiels.
- **AC-11** `fertig` **Allgemeine Kennzahlen für alle** — Trägt eine Partie
  `hilfen` als Zahl und gibt es Siege, erscheint „Siege ohne Hinweis" als
  „x/y". Tragen Partien `zuege` als Zahl, erscheint „Züge im Schnitt" mit einer
  Nachkommastelle und Komma; bei `hilfen` außerdem „Hinweise gesamt" als Summe.
  Fehlen die Felder, fehlen die Kennzahlen.
- **AC-12** `fertig` **Statistik eines Spiels** — `#/statistik/<id>` zeigt
  einen „Überblick" mit Spielzeit, Tagesserie und Partien von heute, den
  Kalender nur dieses Spiels, darunter seinen Block ohne Verweis und die Knöpfe
  „Weiterspielen" (öffnet das Spiel) und „Alle Spiele" (öffnet `#/statistik`).

### Bestand

- **AC-13** `fertig` **Höchstens 5000 Partien** — Wird eine Partie notiert und
  liegen danach mehr als 5000 vor, fallen die ältesten weg, bis es wieder 5000
  sind.
- **AC-14** `fertig` **Kaputtes Datum bricht nichts** — Eine gespeicherte Partie
  mit unlesbarem `ende` (etwa aus einer älteren Sicherung) bringt weder Auswahl
  noch Statistik zum Absturz; sie zählt in der Anzahl, aber in keinem Tag.

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                               |
| ---- | ------------------------------------------------- | ------------------------------------------------------------------ |
| RF-1 | Gestern gespielt, heute noch nicht                | Die Serie zeigt die Tage bis gestern, nicht 0.                     |
| RF-2 | Vorgestern gespielt, gestern und heute nicht      | Die Serie steht auf 0.                                             |
| RF-3 | Partie ohne `dauer`                               | Sie zählt mit, trägt aber nichts zur Spielzeit bei.                |
| RF-4 | Nur Partien ohne Urteil                           | „gewonnen" zeigt „–", im Spielblock fehlt die Quote ganz.          |
| RF-5 | Partien eines Spiels, das nicht mehr angemeldet ist | Sie zählen in „Insgesamt" und im Kalender, einen Block gibt es nicht. |
| RF-6 | Partie älter als 35 Tage                          | Nicht im Kalender, aber in Anzahl, Quote und Spielzeit.            |

## Hintergrund

Jede beendete Partie wird als ein Eintrag festgehalten: Spiel, Zeitpunkt,
gewonnen oder nicht, Dauer – dazu, was das jeweilige Spiel für wichtig hält
(Züge und genutzte Hilfen bei Wördle, Stufe bei Sudoku und Minenfeld).

Daraus rechnet die Statistik-Ansicht:

* insgesamt: Partien, Siegquote, Spielzeit, Tage in Folge
* die letzten fünf Wochen als Punktraster
* je Spiel die eigenen Kennzahlen – bei Wördle zusätzlich die Verteilung,
  in wie vielen Zügen gelöst wurde

Die Tagesserie reißt nicht schon dadurch, dass heute noch nicht gespielt wurde –
erst ein ganzer ausgelassener Tag beendet sie.
