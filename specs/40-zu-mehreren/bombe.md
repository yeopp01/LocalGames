# Bombe

**Datei:** [`spiele/bombe.js`](../../spiele/bombe.js)
**Stand:** 11/11 fertig

## Zweck

Ein schnelles Wortspiel mit einem Handy, das im Kreis wandert: zur Silbe auf
dem Schirm ein Wort sagen und weitergeben, bevor die Bombe platzt. Wer sie beim
Knall hält, ist raus, bis einer übrig bleibt.

## Akzeptanzkriterien

### Aufbau und Stufen

- **AC-1** `fertig` **Zwei bis zwölf Spieler** — Der Aufbau nimmt 2 bis 12
  Spieler mit Namen; der Knopf heißt „Zünden".
- **AC-2** `fertig` **Drei Stufen** — *leicht:* um die 45 s, 20 Silben aus zwei
  Buchstaben (darunter `AU`, `ER`, `ST`); *mittel:* um die 35 s, 20 Silben aus
  drei Buchstaben (darunter `SCH`, `UNG`, `TER`, `RAU`); *schwer:* um die 25 s,
  20 Silben aus drei oder vier Buchstaben (darunter `PFL`, `TZE`, `KNO`, `ÖFF`).
  Keine Silbe steht in einer Stufe zweimal. Die Knöpfe nennen „um die n
  Sekunden", vorgewählt ist mittel.

### Runde

- **AC-3** `fertig` **Silbe und wer sie hält** — Der Tisch zeigt „Sag ein Wort
  mit", die Silbe groß, den Namen dessen, der gerade dran ist, und eine
  gleichmäßig flackernde Lunte. Die Kopfzeile nennt, wie viele übrig sind. Die
  erste Silbe hält der erste Spieler der Liste.
- **AC-4** `fertig` **Uhr verdeckt und gestreut** — Nirgends steht eine
  Restzeit, und nichts auf dem Schirm verrät, wann es knallt. Das Ende liegt
  gleichverteilt um die Stufenzeit herum: leicht ± 15 s, mittel ± 12 s, schwer
  ± 10 s (gemessen an je 1500 Uhren: 30,1–60,0 s, 23,1–47,0 s, 15,1–35,0 s).
- **AC-5** `fertig` **Weitergeben stellt Uhr nicht zurück** — „Weiter" reicht
  reihum an den nächsten der Übrigen weiter und wechselt nur den Namen; die Uhr
  läuft unverändert weiter.
- **AC-6** `fertig` **Knall wirft raus** — Wer beim Ablauf der Uhr dran ist,
  ist raus: „Peng.", „‹Name› ist raus.", „n machen weiter.". Wo das Gerät es
  kann, rüttelt es kurz; wo nicht, passiert nichts und nichts bricht. Weiter
  geht es erst mit „Nächste Silbe"; dann läuft eine neue Uhr, und dran ist der
  Nächste nach dem Ausgeschiedenen.
- **AC-7** `fertig` **Nie dieselbe Silbe zweimal** — Nach jedem Knall kommt
  eine neue Silbe, nie dieselbe wie direkt davor (geprüft an 1500 Wechseln).
- **AC-8** `fertig` **Der Letzte gewinnt** — Bleibt einer übrig, zeigt das Ende
  „Peng.", wer die Bombe zuletzt gehalten hat, „‹Name› gewinnt." und wie viele
  Silben die Runde gedauert hat. „Noch eine Runde" führt zurück zum Aufbau.

### Speicher und Statistik

- **AC-9** `fertig` **Einstellungen bleiben, Runde nicht** — Gemerkt werden
  Stufe und Namen; eine unbekannte gemerkte Stufe wird zu mittel. Eine laufende
  Runde wird nicht wiederhergestellt, und beim Verlassen des Spiels steht die
  Uhr sofort still.
- **AC-10** `fertig` **Runde ohne Urteil notiert** — Am Ende wird die Runde
  genau einmal notiert mit `dauer`, `spieler`, `runden` (Zahl der Silben) und
  `stufe` – ohne `gewonnen`, denn der Sieger ist niemand, den das Gerät kennt.
  Das Spiel meldet sich mit `ohneSiege` an. Eine abgebrochene Runde wird nicht
  notiert.
- **AC-11** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt
  Silben je Runde (Schnitt mit einer Nachkommastelle), die längste Runde und
  die übliche Spielerzahl. Eine leere Liste ergibt keine Kennzahlen; Partien
  ohne `runden` oder `spieler` fließen nicht ein, fehlt alles, steht „–".

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                                  |
| ---- | ------------------------------------------------- | --------------------------------------------------------------------- |
| RF-1 | Knall, wenn nur noch zwei übrig sind              | Kein Zwischenschirm – direkt das Ende mit dem Sieger.                 |
| RF-2 | „Weiter" wird kurz vor dem Knall getippt          | Raus ist, wessen Name beim Knall auf dem Schirm steht.                |
| RF-3 | Gerät ohne Vibration (Rechner, iOS)               | Der Knall kommt ohne Rütteln, sonst gleich.                           |
| RF-4 | Bildschirm geht während der Runde aus             | Die Uhr rechnet nach der verstrichenen Zeit; war sie abgelaufen, knallt es beim Zurückkommen. |
| RF-5 | Jemand wiederholt ein Wort                        | Das Gerät prüft nichts; darüber wacht die Gruppe.                     |

## Hintergrund

Auf dem Schirm steht eine Silbe. Wer das Gerät hält, sagt ein Wort, in dem sie
vorkommt, und reicht weiter. Wer sie hält, wenn es knallt, ist raus – bis einer
übrig bleibt.

Die Uhr läuft **verdeckt und mit Streuung**: die eingestellte Zeit ist nur die
Mitte, das Ende liegt irgendwo darum herum. Eine sichtbare Uhr würde das Spiel
zerstören, weil der Vorletzte dann einfach abwarten könnte.

| Stufe | Silben | Zeit |
| --- | --- | --- |
| leicht | häufige Bausteine wie `AU`, `ER`, `ST` | um die 45 s |
| mittel | `SCH`, `UNG`, `TER`, `RAU` … | um die 35 s |
| schwer | `PFL`, `TZE`, `KNO`, `ÖFF` … | um die 25 s |

Weitergeben stellt die Uhr **nicht** zurück – nur der Name wechselt. Wo das
Gerät es kann, rüttelt es beim Knall kurz; wo nicht, passiert eben nichts.
