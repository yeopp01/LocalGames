# Galgenmännchen

**Datei:** [`spiele/galgen.js`](../../spiele/galgen.js)
**Stand:** 14/14 fertig

## Zweck

Das Kinderspiel vom Papierrand: ein Wort Buchstabe für Buchstabe erraten, bevor
das Männchen am Galgen fertig gezeichnet ist. Schnell gespielt, mit einem Finger
oder an der Tastatur, und mit einer Umschreibung für den, der festhängt.

## Akzeptanzkriterien

### Regeln und Eingabe

- **AC-1** `fertig` **Wort aus der Wördle-Liste** — Gesucht ist ein zufällig
  gezogenes Lösungswort aus dem Wördle-Wortschatz, also fünf Buchstaben. Für jeden
  Buchstaben steht ein leerer Kasten.
- **AC-2** `fertig` **Treffer an allen Stellen** — Ein geratener Buchstabe, der im
  Wort steckt, erscheint an allen passenden Stellen. Jeder Buchstabe lässt sich
  nur einmal raten: seine Taste wird gesperrt, grün bei einem Treffer,
  durchgestrichen bei einem Fehlgriff.
- **AC-3** `fertig` **Tafel und Tastatur** — Die Tafel zeigt alle 29 Buchstaben im
  QWERTZ-Muster, Ä, Ö und Ü eingeschlossen. Am Rechner geht auch die Tastatur,
  ohne Rücksicht auf Groß- und Kleinschreibung; Tasten mit Strg, Alt oder Meta und
  jede Taste bei offenem Blatt werden nicht verarbeitet.
- **AC-4** `fertig` **Elf Striche bis zum Ende** — Jeder Fehlgriff zeichnet ein
  Teil des Galgens, von Boden und Pfosten bis zum rechten Bein. Unter dem Titel
  steht „11 Fehler frei" und zählt herunter; der elfte Fehlgriff vollendet das
  Männchen und beendet die Runde als verloren.

### Ende der Runde

- **AC-5** `fertig` **Sieg und Verlust** — Sind alle Buchstaben aufgedeckt, steht
  „Gerettet.", nach dem elften Fehler „Aufgeknüpft." – dann mit den verpassten
  Buchstaben farbig abgesetzt im Wort. Beides zeigt „Das Wort war X –
  Umschreibung" und die Knöpfe „Noch ein Wort" und „Zur Auswahl"; die Tafel ist
  weg und nimmt keine Züge mehr an.
- **AC-6** `fertig` **Neues Wort sofort** — Das Werkzeug „Neues Wort" beginnt ohne
  Rückfrage ein frisches Wort. Eine abgebrochene Runde landet nicht in der
  Statistik.

### Hilfe

- **AC-7** `fertig` **Tipp kostet keinen Fehler** — „Tipp" zeigt die Umschreibung
  des Wortes und ist danach für dieses Wort gesperrt. Es wird kein Teil
  gezeichnet, die Runde zählt aber als mit Hilfe gespielt.

### Speicher und Statistik

- **AC-8** `fertig` **Runde überlebt Schließen** — Eine laufende Runde steht nach
  Zurück, Neuladen oder Neustart der App mit Wort, geratenen Buchstaben und Tipp
  wieder da. Nach einer beendeten Runde beginnt ein frisches Wort.
- **AC-9** `fertig` **Partie in der Statistik** — Jede beendete Runde wird mit
  `gewonnen`, `dauer` (Spielzeit, siehe AC-14), `fehler`, `zuege` und
  `buchstaben` (beide: Zahl aller geratenen Buchstaben), `hilfen` (1 mit Tipp,
  sonst 0) und `wort` notiert.
- **AC-10** `fertig` **Kennzahlen je Spiel** — Die Statistik zeigt „Fehler je
  Sieg", die Zahl der Siege „ohne Fehler" und die allgemeinen Kennzahlen des
  Rahmens; ohne Siege steht „–" und „0".
- **AC-11** `fertig` **Fehler je Sieg mit Komma** — „Fehler je Sieg" steht wie die
  übrigen Kennzahlen mit Dezimalkomma, etwa „1,5".
- **AC-12** `fertig` **Lückenhafte Partien verfälschen nichts** — Siege ohne Zahl in
  `fehler` gehen weder in „Fehler je Sieg" noch in „ohne Fehler" ein.
- **AC-13** `fertig` **Anleitung als Blatt** — Das Werkzeug „Anleitung" öffnet ein
  Blatt „Galgenmännchen": fünf Buchstaben, Treffer an allen Stellen, nach 11
  Fehlern verloren, Tastatur samt Umlauten, und dass der Tipp keinen Fehler
  kostet, aber in der Statistik vermerkt wird.
- **AC-14** `fertig` **Spielzeit ohne Pausen** — `dauer` zählt nur die Zeit, in
  der die Runde offen war. Eine über Nacht geschlossene Runde bringt die Nacht
  nicht in die Spielzeit; bis Version 59 war es die Uhrzeit seit dem Ziehen des
  Wortes.

## Randfälle

| #    | Fall                                          | Erwartetes Verhalten                                    |
| ---- | --------------------------------------------- | ------------------------------------------------------- |
| RF-1 | Buchstabe steht zweimal im Wort               | Erscheint an beiden Stellen und zählt als ein Zug.      |
| RF-2 | Schon geratenen Buchstaben erneut tippen      | Nichts passiert, kein Fehler, kein Zug.                 |
| RF-3 | Taste ß, Ziffer oder Satzzeichen              | Wird ignoriert.                                         |
| RF-4 | Neuladen direkt nach dem Ende einer Runde     | Es beginnt ein frisches Wort; notiert wurde nur einmal. |

## Hintergrund

Die Wörter kommen aus derselben Liste wie bei Wördle und bringen darum ihre
Umschreibung gleich mit: Wer festhängt, kann sie sich zeigen lassen.

Die Tafel folgt dem QWERTZ-Muster, damit die Finger dort suchen, wo sie es von
der Tastatur gewohnt sind.

Die Teile des Galgens stehen in der Reihenfolge, in der sie gezeichnet werden.
Ihre Anzahl ist zugleich die Zahl der erlaubten Fehler.
