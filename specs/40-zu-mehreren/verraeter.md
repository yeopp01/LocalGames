# Verräter

**Datei:** [`spiele/verraeter.js`](../../spiele/verraeter.js), Wortpaare [`spiele/begriffe.js`](../../spiele/begriffe.js)
**Stand:** 13/16 fertig · 2 offen · 1 zurückgestellt

## Zweck

Ein Wortspiel für eine Runde am Tisch: alle kennen das Wort, einer nicht.
Reihum sagt jeder ein Wort dazu, dann wird der Verräter gesucht. Gespielt wird
mit einem Handy, das im Kreis wandert, oder mit einem Code auf den Handys
aller.

## Akzeptanzkriterien

### Runde und Fassungen

- **AC-1** `fertig` **Drei bis zwölf Spieler** — Beide Wege nehmen 3 bis 12
  Spieler. Mit einem Handy haben die Plätze Namen, mit Code heißen sie
  „Nummer 1" bis „Nummer n".
- **AC-2** `fertig` **Drei Fassungen, drei Karten** — *Doppelgänger:* alle
  sehen „Euer Wort", der Verräter das zweite Wort des Paares – ohne jeden
  Hinweis auf eine Rolle. *Blind:* der Verräter sieht „Du bist der Verräter"
  und das Thema, aber kein Wort. *Zwei Verräter:* wie blind, nur zu zweit; jeder
  erfährt, dass es einen zweiten gibt, aber nicht, wer es ist. Alle anderen
  sehen in jeder Fassung „Euer Wort" und das erste Wort des Paares.
- **AC-3** `offen` **Zwei Verräter ab fünf** — Die Fassung „Zwei Verräter" ist
  wählbar, sobald der Zähler auf fünf oder mehr steht, und darunter gesperrt.
  Wird die Gruppe nach der Wahl unter fünf verkleinert, gilt beim Verteilen
  still „Doppelgänger". Heute hängt die Sperre an den gemerkten Namen der
  letzten Runde statt am Zähler: beim ersten Öffnen ist die Fassung auch zu
  fünft gesperrt und erst nach einer gespielten Runde zu fünft wählbar.
- **AC-4** `fertig` **Thema und Redezeit wählbar** — Mit einem Handy wählt man
  „Bunt gemischt" oder eines der zehn Themen und die Zeit zum Reden: ohne Uhr,
  2 oder 4 Minuten. Die Uhr läuft sichtbar auf dem Redeschirm und meldet am
  Ende „Zeit vorbei.". Auch bei „Bunt gemischt" wird ein Thema gezogen, damit
  der blinde Verräter etwas in der Hand hat.
- **AC-5** `fertig` **Handgeschriebener Wortschatz** — `spiele/begriffe.js`
  enthält 120 Paare in zehn Themen, je 12. Kein Wort kommt zweimal vor, die
  beiden Hälften eines Paares sind nie gleich. Das erste Wort geht an die
  Gruppe, das zweite an den Doppelgänger.

### Ein Handy

- **AC-6** `fertig` **Rolle hinter dem Sperrschirm** — Beim Verteilen steht vor
  jedem Spieler ein Sperrschirm mit seinem Namen. Die Karte liegt unter dem
  Deckel „Gedrückt halten" und ist nur zu sehen, solange der Finger liegt;
  „Gesehen" führt zum nächsten Sperrschirm. Weder ein Sperrschirm noch der
  Schirm nach dem Verteilen zeigt ein Wort, die Kopfzeile nennt nur die Fassung.
- **AC-7** `fertig` **Reden mit Startspieler** — Nach dem Verteilen steht „Es
  beginnt ‹Name›" mit der Regel „ein einziges Wort" auf dem Schirm, ohne Wort und
  ohne Rolle. Wer beginnt, wird gewürfelt.
- **AC-8** `fertig` **Geheime Abstimmung** — „Abstimmen" startet die Abstimmung
  „Wer kennt das Wort nicht?" reihum hinter dem Sperrschirm; niemand kann sich
  selbst wählen. Erwischt ist der Verräter nur, wenn genau einer die meisten
  Stimmen hat und dieser ein Verräter ist – bei zwei Verrätern reicht einer.
  Bei Gleichstand an der Spitze entkommt er.
- **AC-9** `fertig` **Auflösung zeigt alles** — Das Ende zeigt „Erwischt." oder
  „Entkommen.", wer gewählt wurde oder dass es einen Gleichstand gab, das Wort,
  wer es nicht wusste, bei Doppelgänger das andere Wort, und eine Tafel mit den
  Stimmen je Spieler, auf der die Verräter markiert sind.

### Mit Code

- **AC-10** `fertig` **Gleicher Code, gleiche Runde** — Aus Code und
  Spielerzahl rechnet jedes Gerät der Reihe nach Thema, Fassung, Wortpaar,
  Verräter und Startspieler aus. Gleicher Code und gleiche Spielerzahl ergeben
  auf jedem Gerät dieselbe Runde (geprüft an 3000 Codes); eine andere
  Spielerzahl ergibt eine andere Runde. „Zwei Verräter" fällt nur ab fünf
  Spielern. Die Themen- und Fassungswahl des Handy-Wegs spielt keine Rolle.
- **AC-11** `fertig` **Probe oben auf dem Schirm** — Über der eigenen Rolle
  stehen Thema, Fassung und „zu n" mit dem Hinweis, dass die drei bei allen
  gleich sein müssen; die Kopfzeile zeigt „Code ‹Code›". Die eigene Rolle liegt
  unter dem Deckel „Gedrückt halten". Mit weniger als drei Zeichen im Code
  lässt sich die Rolle nicht aufrufen.
- **AC-12** `fertig` **Ausgang wird erfragt** — Nach dem Reden führt
  „Auflösen" zu Wort und Verrätern und zur Frage „Habt ihr ihn erwischt?" mit
  Ja und Nein. Erst die Antwort wird notiert; danach steht „Erwischt." oder
  „Entkommen." da.
- **AC-13** `zurueckgestellt` (braucht eine Verbindung zwischen den Geräten) **Stimmen übers Netz sammeln** — Im
  Code-Weg sammeln die Geräte die Stimmen ein und zählen sie aus, statt nach dem
  Ausgang zu fragen. Ohne fremden Rechner nicht zu haben; der Code-Weg bleibt
  bewusst ohne jede Verbindung.

### Speicher und Statistik

- **AC-14** `fertig` **Einstellungen bleiben, Runde nicht** — Gemerkt werden
  Weg, Fassung, Thema, Redezeit, Namen, Spielerzahl, Code und eigene Nummer.
  Eine halb verteilte oder laufende Runde wird nicht wiederhergestellt; beim
  Öffnen steht der Aufbau da.
- **AC-15** `fertig` **Runde in der Statistik** — Jede aufgelöste Runde wird
  genau einmal notiert mit `gewonnen` (`true` heißt: Verräter erwischt),
  `dauer`, `spieler`, `fassung` (`doppel`, `blind`, `zwei`) und `modus`
  (`handy`, `code`). Eine vor der Auflösung abgebrochene Runde wird nicht
  notiert. Die Auswertung zeigt Runden, „Verräter gefunden" und die übliche
  Spielerzahl, bei leerer Liste nichts.
- **AC-16** `offen` **Quote nur aus Urteilen** — „Verräter gefunden" rechnet
  nur über Partien, deren `gewonnen` wahr oder falsch ist; eine Partie ohne das
  Feld (etwa aus einer alten Sicherung) zählt weder dafür noch dagegen. Heute
  teilt die Auswertung durch alle Partien: `[{ gewonnen: true }, {}]` ergibt
  50 % statt 100 %.

## Randfälle

| #    | Fall                                                        | Erwartetes Verhalten                                                  |
| ---- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| RF-1 | Gleichstand an der Spitze der Abstimmung                    | „Entkommen." mit dem Hinweis, dass sich die Gruppe nicht einigen konnte. |
| RF-2 | „Zwei Verräter" gewählt, dann auf vier verkleinert          | Verteilt wird still als Doppelgänger.                                 |
| RF-3 | Jemand hat sich beim Code vertippt                          | Seine Probe weicht ab; die Runde wird vor dem Reden neu aufgesetzt.   |
| RF-4 | Zwei Geräte wählen dieselbe Nummer                          | Beide zeigen dieselbe Rolle.                                          |
| RF-5 | Code-Weg: nach „Auflösen" verlassen, ohne Ja oder Nein      | Es wird nichts notiert.                                               |
| RF-6 | Code-Weg mit Redezeit                                       | Es gilt die auf dem Gerät gemerkte Redezeit des Handy-Wegs.           |

## Hintergrund

Alle bekommen dasselbe Wort, einer nicht. Reihum sagt jeder ein einziges Wort
dazu, dann wird abgestimmt. Drei Fassungen: *Doppelgänger* (der Verräter
bekommt ein ähnliches Wort und ahnt selbst nichts), *blind* (er weiß Bescheid
und kennt nur das Thema) und *zwei Verräter* ab fünf Leuten.

**Zwei Wege, die Rollen zu verteilen.**

*Ein Handy* wandert im Kreis. Vor jedem Blick steht ein Sperrschirm mit dem
Namen, und das Wort erscheint nur, solange der Finger auf dem Feld liegt – so
steht nichts mehr auf dem Bildschirm, während das Gerät weitergereicht wird.
Abgestimmt wird danach genauso, reihum und geheim.

*Mit Code* braucht jeder die App, dafür kein Weitergeben. Einer würfelt einen
Code wie `R4KM`, sagt ihn samt Spielerzahl an, alle tippen ihn ein und wählen
ihre Nummer. Danach rechnet jedes Gerät die Runde für sich aus – und kommt auf
dasselbe Ergebnis.

**Warum das ohne Verbindung geht.** Zwei Geräte müssen sich nicht absprechen,
wenn sie dieselbe Rechnung mit demselben Startwert ausführen. `Math.random`
taugt dafür nicht, also steht in `spiele/runde.js` ein eigener Würfel: FNV-1a
macht aus dem Code eine Zahl, Mulberry32 daraus eine Folge, und die ist Zeichen
für Zeichen auf jedem Gerät dieselbe. Aus ihr fallen der Reihe nach Thema,
Fassung, das Wortpaar, wer der Verräter ist und wer anfängt.

Es fließt dabei kein Byte zwischen den Geräten. Kein Server, kein Bluetooth,
keine Kamera – der Code *ist* die Verbindung, und er wird vorgelesen.

**Was dieser Weg nicht kann.** Stimmen einsammeln. Dafür müssten die Geräte
wirklich miteinander reden, und das ginge nur über einen fremden Rechner. Also
wird von Hand abgestimmt, und die App fragt am Ende nur nach dem Ausgang.

**Die Probe.** Oben auf dem Schirm stehen Thema, Fassung und Spielerzahl. Die
drei müssen bei allen gleich sein – sie kommen ja aus demselben Code. Wer sich
vertippt hat, sieht dort etwas anderes als der Rest und merkt es vor der ersten
Runde statt in der Auflösung. Der Zeichenvorrat des Codes hilft mit: kein O
neben der 0, kein I neben der 1, damit sich beim Vorlesen nichts verhört.

**Der Wortschatz** steht in `spiele/begriffe.js`: 120 Paare in zehn Themen, von
Hand geschrieben wie die Wördle-Liste und aus demselben Grund – fremde
Wortlisten stehen unter der GPL und würden sich auf das ganze Projekt
durchschlagen. Ein Paar muss nah genug sein, dass beide Wörter auf dieselben
Beschreibungen passen, und verschieden genug, dass es irgendwann auffällt.
Neue Paare kommen einfach in das passende Thema.
