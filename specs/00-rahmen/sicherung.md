# Sicherung

**Datei:** [`app.js`](../../app.js), [`index.html`](../../index.html)
**Stand:** 14/14 fertig

## Zweck

Die Partien liegen nur auf dem Gerät. Die Sicherung holt sie als Datei heraus,
damit sie ein Löschen des Browser-Speichers oder einen Gerätewechsel
überleben, und führt Sicherungen beim Einlesen mit dem Bestand zusammen – auch
die von zwei Geräten. Dazu gehört der Weg, alles zu löschen.

## Akzeptanzkriterien

### Sichern

- **AC-1** `fertig` **Sichern an zwei Stellen** — „Statistik sichern" steht im
  Einstellungsblatt (Menü mit den drei Punkten) und als Knopf unter der
  Gesamtstatistik. Beide legen dieselbe Datei an.
- **AC-2** `fertig` **Datei mit allen Partien** — Die Datei heißt
  `localgames-JJJJ-MM-TT.json` und enthält `{ app: 'LocalGames', version: 1,
  erstellt, partien }` mit allen gespeicherten Partien samt ihrer `id`. Danach
  meldet ein Toast „Sicherung gespeichert."
- **AC-3** `fertig` **Laufende Partien bleiben daheim** — Angefangene
  Spielstände (`stand`) stehen nicht in der Datei und werden beim Einlesen
  nicht berührt.
- **AC-4** `fertig` **Bestand im Einstellungsblatt** — Das Einstellungsblatt
  nennt oben „1 Partie auf diesem Gerät." bzw. „n Partien auf diesem Gerät.",
  bei leerem Bestand „Noch nichts gespeichert."

### Einlesen

- **AC-5** `fertig` **Einlesen führt zusammen** — „Statistik einlesen" öffnet
  die Dateiauswahl (JSON). Partien, deren `id` schon im Bestand liegt, werden
  übersprungen, alle anderen ergänzt; danach ist der Bestand nach `ende`
  sortiert und die offene Ansicht neu gezeichnet. Der Toast meldet „1 Partie
  ergänzt.", „n Partien ergänzt." oder „Alles war schon da."
- **AC-6** `fertig` **Ungültige Datei ändert nichts** — Eine Datei, die kein
  JSON ist, meldet „Die Datei lässt sich nicht lesen.", ein JSON ohne Liste
  `partien` meldet „Das sieht nicht nach einer Sicherung aus." In beiden Fällen
  bleibt der Bestand unverändert.
- **AC-7** `fertig` **Ungültige Einträge übersprungen** — Einträge ohne `spiel`
  oder ohne `ende` werden stillschweigend ausgelassen, der Rest der Datei wird
  trotzdem eingelesen.
- **AC-8** `fertig` **Unlesbares Datum übersprungen** — Ein Eintrag, dessen
  `ende` kein lesbarer Zeitpunkt ist, wird wie ein Eintrag ohne `ende`
  ausgelassen.
- **AC-9** `fertig` **Ohne Kennung nicht doppelt** — Ein Eintrag ohne `id`
  bekommt eine Kennung, die aus seinem Inhalt folgt. Wer dieselbe Datei zweimal
  einliest, hat ihn deshalb nur einmal im Bestand; zwei Einträge mit gleichem
  Inhalt gelten als dieselbe Partie.
- **AC-10** `fertig` **Einlesen hält die Obergrenze** — Auch nach dem Einlesen
  liegen höchstens 5000 Partien im Bestand; überzählig sind die ältesten.

### Löschen und voller Speicher

- **AC-11** `fertig` **Alles löschen mit Rückfrage** — „Alles löschen" fragt
  „Wirklich alles löschen? Statistik und laufende Partien sind dann weg." Bei
  Abbruch bleibt alles, wie es war. Bei Bestätigung sind Partien und laufende
  Spielstände weg, das Blatt schließt, die Auswahl erscheint und ein Toast
  meldet „Alles gelöscht."
- **AC-12** `fertig` **Offenes Spiel schreibt nicht nach** — Wird aus einem
  laufenden Spiel heraus gelöscht, wird das Spiel zuerst beendet und dann
  gelöscht. Was sein `ende()` noch merkt oder notiert, ist danach ebenfalls
  weg.
- **AC-13** `fertig` **Voller Speicher meldet sich** — Lässt der Browser nicht
  mehr schreiben, meldet ein Toast „Der Speicher des Browsers ist voll." –
  einmal, bis wieder ein Schreiben gelingt. Die App läuft weiter und versucht
  es beim nächsten Speichern erneut. Scheitert das Schreiben beim Einlesen,
  bleibt diese Meldung stehen und wird nicht von „ergänzt" überdeckt.
- **AC-14** `fertig` **Löschen trotz vollem Speicher** — „Alles löschen"
  entfernt den Eintrag im Speicher, statt ihn leer zu überschreiben, und wirkt
  deshalb auch bei vollem Speicher: Nach dem Neuladen ist nichts mehr da.

## Randfälle

| #    | Fall                                                | Erwartetes Verhalten                                                  |
| ---- | --------------------------------------------------- | --------------------------------------------------------------------- |
| RF-1 | Dieselbe Sicherung zweimal einlesen                 | Beim zweiten Mal „Alles war schon da.", der Bestand wächst nicht.     |
| RF-2 | Sicherungen zweier Geräte nacheinander einlesen     | Der Bestand enthält jede Partie genau einmal.                         |
| RF-3 | Sicherung mit leerer Liste `partien`                | „Alles war schon da.", nichts ändert sich.                            |
| RF-4 | Sicherung eines älteren Stands mit fehlenden Feldern | Die Einträge werden übernommen; Statistik und Kacheln zeigen sich.    |
| RF-5 | Gleich danach dieselbe Datei noch einmal auswählen  | Die Auswahl löst erneut ein Einlesen aus.                             |
| RF-6 | Rückfrage beim Löschen abgebrochen                  | Blatt bleibt offen, nichts ist gelöscht.                              |

## Hintergrund

Wie Sicherung und Einlesen für Spieler beschrieben sind, steht in der
[README](../../README.md#sicherung) – dort bleibt es, weil es jeder lesen soll,
der die App benutzt.
