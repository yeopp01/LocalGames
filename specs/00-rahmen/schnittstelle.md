# Spielschnittstelle

**Datei:** [`app.js`](../../app.js)
**Stand:** 12/12 fertig

## Zweck

Der Vertrag zwischen Rahmen und Spielen. Ein Spiel meldet sich mit
`Rahmen.anmelden` an und bekommt beim Start eine `sitzung` – das ist seine
einzige Verbindung zum Rahmen. So kommt ein neues Spiel dazu, ohne dass der
Rahmen ein Spiel kennen muss.

## Akzeptanzkriterien

### Anmeldung

- **AC-1** `fertig` **Anmelden mit festen Feldern** — Ein Spiel ruft
  `Rahmen.anmelden({ id, name, unter, farbe, symbol, starten })`. `id` ist der
  Kurzname in Adressen und Partien, `name` und `unter` stehen auf der Kachel,
  `farbe` färbt Kachel und Statistikblock, `symbol` ist der Inhalt eines
  24×24-SVG. Optional sind `auswertung`, `zusatz` und `ohneSiege`.
- **AC-2** `fertig` **Kein Eingriff in den Rahmen** — Ein neues Spiel braucht
  seine Datei in `spiele/`, ein `<script>` in `index.html` und den Pfad in
  `GRUNDBESTAND`. Kachel, Adresse, Statistikblock und Sicherung kommen ohne
  Änderung an `app.js`; `app.js` nennt keine einzige Spiel-`id`.
- **AC-3** `fertig` **Starten und Beenden** — Beim Öffnen ruft der Rahmen
  `starten(boden, sitzung)` mit einem leeren Element, in das das Spiel seine
  Oberfläche baut. Gibt `starten` ein Objekt mit `ende()` zurück, wird das beim
  Verlassen genau einmal gerufen; ohne Rückgabe geht es auch.

### Sitzung

- **AC-4** `fertig` **Kopfzeile aus dem Spiel** — `sitzung.unter(text)` setzt
  die Zeile unter dem Spielnamen. `sitzung.werkzeuge([{ label, symbol, tun,
  marke }])` ersetzt die Knöpfe oben rechts; `label` wird Beschriftung für
  Vorleser, `marke` landet als `data-marke` am Knopf.
- **AC-5** `fertig` **Meldung und Dialog** — `sitzung.toast(text)` zeigt eine
  kurze Meldung. `sitzung.blatt({ titel, inhalt, aktionen })` öffnet ein Blatt;
  `inhalt` ist Text oder Element, `aktionen` sind `{ text, art, tun }` mit
  `art: 'still'` für einen zurückhaltenden Knopf. `sitzung.blattZu()` schließt
  es.
- **AC-6** `fertig` **Laufender Stand überlebt** — `sitzung.merken(wert)`
  speichert sofort unter `stand[<id>]`, `sitzung.erinnert()` liefert ihn – auch
  nach Neuladen – oder `null`, `sitzung.vergessen()` entfernt ihn. Der Stand
  gehört nur diesem Spiel.
- **AC-7** `fertig` **Partie notieren** — `sitzung.notieren(partie)` legt einen
  Eintrag mit `id` (eindeutige Kennung), `spiel` (die `id` des Spiels), `ende`
  (Zeitpunkt als ISO-Text) und allen Feldern der Partie an und speichert
  sofort. `sitzung.partien()` liefert nur die Partien dieses Spiels.
- **AC-8** `fertig` **Kleine Helfer** — `sitzung.zurueck()` führt zur Auswahl.
  `sitzung.el(name, klasse, text)` baut ein Element. `sitzung.dauerText(ms)`
  schreibt „–" für 0 oder weniger, „42 s" unter einer Minute, „3:07" unter
  einer Stunde und „1 h 12 min" darüber.

### Urteil und Auswertung

- **AC-9** `fertig` **`gewonnen` ist dreiwertig** — `gewonnen: true` zählt als
  Sieg, `false` als Niederlage, ein fehlendes Feld als Partie ohne Urteil: sie
  zählt in Anzahl, Spielzeit, Kalender und Tagesserie, aber in keiner
  Siegquote. Geprüft wird überall mit `typeof p.gewonnen === 'boolean'`.
- **AC-10** `fertig` **`ohneSiege` ist nur Anzeige** — Ein Spiel mit
  `ohneSiege: true` heißt auf Kachel und im Statistikblock „Runden" statt
  „Partien". Ein Urteil an seinen Partien – etwa aus einer eingelesenen
  Sicherung – zählt nirgends: nicht auf der Kachel, nicht im Block und nicht in
  der Gesamtquote.
- **AC-11** `fertig` **Auswertung liefert Kennzahlen** — `auswertung(partien,
  hilfe)` gibt eine Liste `{ wert, label }` zurück, die im Statistikblock vor
  den allgemeinen Kennzahlen steht. `hilfe` bietet `dauerText`, `beste(partien,
  feld)` (kleinster Wert über 0 aus gewonnenen Partien, sonst 0) und
  `prozent(a, b)`. `zusatz(partien, { el })` darf ein Element darunter hängen.
- **AC-12** `fertig` **Auswertung verträgt Lücken** — Jede `auswertung` und
  jeder `zusatz` kommen mit einer leeren Liste und mit Partien aus, denen Felder
  fehlen, ohne zu werfen und ohne „NaN", „undefined" oder „Infinity" anzuzeigen.
  Nachgeprüft an allen 16 Spielen mit je 400 zufällig lückenhaften Listen.

## Randfälle

| #    | Fall                                                   | Erwartetes Verhalten                                                 |
| ---- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| RF-1 | Spiel ohne `auswertung`                                | Der Block zeigt Anzahl, Quote und die allgemeinen Kennzahlen.        |
| RF-2 | Spiel wird nicht mehr angemeldet, Partien bleiben      | Keine Kachel, kein Block; die Partien zählen weiter in „Insgesamt".  |
| RF-3 | Vier gewinnt: gegen den Rechner und zu zweit gemischt  | Die Quote rechnet nur über die Partien gegen den Rechner.            |
| RF-4 | `erinnert()` bei einem Spiel, das nie etwas gemerkt hat | `null`.                                                             |
| RF-5 | Spiel ruft `werkzeuge([])`                             | Die Werkzeugknöpfe verschwinden, Statistik- und Menüknopf bleiben.   |

## Hintergrund

Ein Spiel ist genau eine Datei in `spiele/`, die sich beim Rahmen anmeldet:

```js
Rahmen.anmelden({
  id: 'kurzname',
  name: 'Anzeigename',
  unter: 'Ein Satz für die Kachel.',
  farbe: '#4E8A54',
  symbol: '<circle cx="12" cy="12" r="8"/>',   // Inhalt eines 24×24-SVG
  starten(wurzel, sitzung) { /* … */ return { ende() {} }; },
  auswertung(partien, hilfe) { return [{ wert: '…', label: '…' }]; },
});
```

Dann noch das `<script>` in `index.html` und den Pfad in `sw.js` ergänzen –
mehr nicht. Das Dashboard, die Statistik und die Sicherung nehmen das Spiel
von allein auf.

### Partien ohne Urteil

Nicht jede Partie lässt sich in gewonnen und verloren teilen. Eine Runde
„Wer am ehesten" hat gar keinen Sieger, und bei Vier gewinnt zu zweit gewinnt
zwar jemand, aber niemand, den das Gerät kennt.

Solche Partien **lassen das Feld `gewonnen` einfach weg**. Sie zählen dann als
gespielt – in der Spielzeit, im Kalender, in der Tagesserie – aber nicht in der
Siegquote, weder beim Spiel noch in der Gesamtzahl.

Das hängt an der einzelnen Partie und nicht am Spiel, weil dasselbe Spiel
beides können darf: Vier gewinnt gegen den Rechner mit Urteil, zu zweit ohne.
`gewonnen` ist damit dreiwertig – `true`, `false` oder gar nicht gesetzt – und
alles, was zählt, prüft auf `typeof p.gewonnen === 'boolean'`.

Dazu kommt `ohneSiege: true` bei der Anmeldung für Spiele, bei denen es
*grundsätzlich* nichts zu gewinnen gibt. Das ist nur eine Frage der Anzeige:
die Kachel schreibt dann „12 Runden" statt „12 Partien", und die Siegquote
taucht auch dann nicht auf, wenn aus alten Sicherungen doch einmal ein Urteil
hereinkommt.

Was die Sitzung bietet:

| Aufruf | Wirkung |
| --- | --- |
| `sitzung.merken(obj)` / `erinnert()` | laufender Spielstand, überlebt das Schließen |
| `sitzung.notieren({gewonnen, dauer, …})` | fertige Partie in die Statistik |
| `sitzung.werkzeuge([…])` | Knöpfe oben rechts in der Kopfzeile |
| `sitzung.blatt({titel, inhalt, aktionen})` | Dialog von unten |
| `sitzung.toast(text)`, `sitzung.unter(text)` | kurze Meldung, Zeile unter dem Titel |
| `sitzung.zurueck()` | zurück zur Auswahl |
