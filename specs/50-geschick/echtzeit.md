# Echtzeit

**Datei:** [`spiele/echtzeit.js`](../../spiele/echtzeit.js)
**Stand:** 12/12 fertig

## Zweck

Kein Spiel, sondern das Werkzeug hinter den Geschicklichkeitsspielen. Die
übrigen Spiele warten auf einen Zug; diese laufen weiter, ob jemand hinsieht
oder nicht. Was daran jedes Mal gleich ist und jedes Mal leicht falsch wird –
Leinwand, Takt, Anhalten, Aufräumen –, steht hier einmal. Es kennt kein
einzelnes Spiel.

## Akzeptanzkriterien

### Leinwand

- **AC-1** `fertig` **Feld passt ins Fenster** — Das Spielfeld behält das
  Seitenverhältnis seines Spiels, ist höchstens 440 px und höchstens 92 % der
  Fensterbreite breit, und in einem flachen Fenster richtet sich seine Breite
  nach der Höhe. Auf einem Pixel 7 und in 1366 × 700 ragt keines der vier
  Spiele seitlich heraus, und die Seite ist nicht höher als das Fenster.
- **AC-2** `fertig` **Scharf auf jeder Pixeldichte** — Die Leinwand hat so viele
  Bildpunkte wie ihr Platz auf dem Gerät (CSS-Größe mal `devicePixelRatio`)
  und stellt sich bei jeder Größenänderung neu ein. Das Spiel rechnet
  unverändert in seinen eigenen logischen Einheiten.
- **AC-3** `fertig` **Hell und dunkel** — Die Farben kommen aus den CSS-Tokens
  der App. Wechselt das Gerät zwischen hell und dunkel, ist das nächste Bild
  schon in der neuen Fassung, auch in einer Pause.

### Schleife

- **AC-4** `fertig` **Fester Takt** — Das Spiel rechnet in Schritten von 1/120 s,
  unabhängig von der Bildrate. Liegen zwischen zwei Bildern mehr als 100 ms,
  wird nur diese Zeit nachgeholt – ein Hänger wird zu einer kurzen
  Verlangsamung, nicht zu einem Sprung.
- **AC-5** `fertig` **Hält an, wenn niemand hinsieht** — Die Schleife hält an,
  sobald die App verdeckt wird, das Fenster den Fokus verliert, die Seite
  verlassen wird oder ein Blatt offen ist (das Spielblatt ebenso wie die
  Einstellungen). Das Spiel erfährt es und zeigt „Pause". Weiter geht es erst
  auf eine Eingabe hin, nicht von selbst beim Schließen des Blatts.
- **AC-6** `fertig` **Ende räumt auf** — `ende()` nimmt jeden Listener ab, der
  über `an()` hängt, hält die Schleife an und trennt den Größenbeobachter.
  Danach malt nichts mehr; ein zweiter Aufruf tut nichts.

### Bedienung

- **AC-7** `fertig` **Tasten nur ohne Kürzel** — Eine Taste zählt fürs Spiel
  nicht, wenn Strg, Alt oder Meta gedrückt sind oder ein Blatt offen ist.
  Leertaste und Enter gehören einem Knopf, der gerade den Fokus hat – sie
  schalten dann nicht zusätzlich die Pause um.
- **AC-8** `fertig` **Schild und Kasten** — Über dem Feld steht bei Start,
  Pause und Ende ein Schild mit Titel und Satz; es lässt Berührungen zum Feld
  durch. Unter dem Feld steht bei Pause und Ende ein Kasten mit Titel, Satz und
  Knöpfen.

### Gemeinsamer Vertrag der vier Spiele

- **AC-9** `fertig` **Pause überlebt Neuladen** — Schlange, Invasoren,
  Flattervogel und Hochhinaus sichern beim Anhalten ihren ganzen Stand. Nach
  Neuladen, Zurück oder Neustart der App steht eine laufende Partie als Pause
  da, mit „Weiter" und „Neu anfangen". Eine beendete Partie und ein
  unlesbarer Stand ergeben ein frisches Feld.
- **AC-10** `fertig` **Spielzeit ohne Pausen** — `dauer` zählt nur die Takte, in
  denen das Spiel lief. Pausen, Blätter und die Zeit, in der die App zu war,
  zählen nicht.
- **AC-11** `fertig` **Partien ohne Urteil** — Alle vier melden sich mit
  `ohneSiege: true` an und notieren kein `gewonnen`. Die Kachel zählt Runden,
  und keine Siegquote rechnet mit ihnen.
- **AC-12** `fertig` **Neu anfangen verwirft** — „Neu anfangen" im Pausenkasten
  beginnt sofort ein frisches Feld; die verworfene Partie landet nicht in der
  Statistik.

## Randfälle

| #    | Fall                                                  | Erwartetes Verhalten                                                    |
| ---- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| RF-1 | Anleitung öffnen, während das Spiel läuft             | Das nächste Bild hält an; nach dem Schließen steht die Pause da.        |
| RF-2 | App wird mitten im Lauf vom System beendet            | `visibilitychange` kommt vorher; der Stand ist gesichert.               |
| RF-3 | Fenster wird während der Pause breiter oder schmaler  | Leinwand stellt sich neu ein und malt die Pause scharf nach.            |
| RF-4 | Sehr kleines Querformat                               | Das Feld wird nicht schmaler als 220 px; dann darf die Seite scrollen.  |

## Hintergrund

Warum ein fester Takt: Die Bildrate schwankt zwischen 60 und 120 Hz, und nach
einem Ruckler liegen auch mal 300 ms zwischen zwei Bildern. Mit einem Schritt
je Bild fiele der Flattervogel auf einem 120-Hz-Handy doppelt so schnell, und
ein großer Schritt trüge einen Schuss durch eine Deckung hindurch.

Warum Pause statt Weiterlaufen beim Blatt: Ein Echtzeitspiel, das weiterläuft,
während die Anleitung offen ist, ist verloren, bevor man sie gelesen hat.

Der Rand des Feldes ist ein Schatten, kein `border`: Ein echter Rand nähme der
Leinwand zwei Pixel, und sie stünde nicht mehr genau im Seitenverhältnis ihrer
Rechnung.

Nachgeprüft wurden die Spielregeln aller vier Spiele mit einem Wegwerf-Gerüst,
das `echtzeit.js` und die Spieldatei in einen Node-Kontext lädt und die Bühne
von Hand taktet; Anhalten und Wiederkehr prüft `pruefung/e2e/geschick.spec.mjs`
im Browser.
