# Tierstimmen

**Datei:** [`spiele/tierstimmen.js`](../../spiele/tierstimmen.js)
**Stand:** 8/8 fertig

## Zweck

Für die Kleinsten, ab dem Alter, in dem ein Kind auf etwas zeigt: große Tiere
antippen, und jedes hüpft und ruft. Es gibt nichts zu gewinnen und nichts
falsch zu machen. Oben steht, wer da ruft – zum Vorlesen für die, die
danebensitzen. Zimmer, Klang und Aufnahmen kommen aus dem Werkzeug
[Tiere](tiere.md).

## Akzeptanzkriterien

### Tiere

- **AC-1** `fertig` **Sechs Tiere je Seite** — Zu sehen sind alle Tiere mit
  Aufnahme, sechs je Seite (AC-7): im Hochformat zwei neben-
  und drei untereinander, quer drei neben- und zwei untereinander. Die ganze
  Seite samt Pfeilen passt ins Fenster, auf einem Pixel 7 hoch und quer wie in
  1366 × 700.
- **AC-2** `fertig` **Tipp lässt rufen** — Schon beim Aufsetzen des Fingers
  hüpft das Tier, ruft, und oben steht groß „Die Kuh macht Muh!". Ein Tipp auf
  ein anderes Tier unterbricht den laufenden Ruf.
- **AC-3** `fertig` **Blättern im Kreis** — Die Pfeile unten und die
  Pfeiltasten blättern; nach der letzten Seite kommt die erste. Punkte zwischen
  den Pfeilen zeigen, auf welcher Seite man ist.
- **AC-4** `fertig` **Jede Taste ruft ein Tier** — Am Laptop lässt jede
  andere Taste (ohne Strg, Alt, Meta) ein zufälliges Tier der Seite hüpfen und
  rufen.
- **AC-7** `fertig` **Seiten nach Orten** — Die Seiten folgen den Orten
  Bauernhof, Wald und Wiese, Zoo und Am Wasser. Hat ein Ort mehr als sechs
  Tiere, bekommt er mehrere Seiten, ein Ort ohne Tier keine. Zwischen den
  Pfeilen steht der Name des Orts über den Punkten. Anlass: Mit über dreißig
  Tieren fände niemand in einer bunt gemischten Folge das Tier, das das Kind
  gerade hören will.
- **AC-8** `fertig` **Name vor dem Ruf** — Vor dem Kinderzimmer steht der
  Schalter „Tiername ansagen", eingeschaltet, solange nichts anderes gemerkt
  ist. Ist er an, sagt bei jedem Tipp erst eine Stimme den Namen mit Artikel
  („Der Hund."), und 0,2 s danach ruft das Tier. Ein neuer Tipp bricht Name
  und Ruf zusammen ab. Ist er aus, kommt nur der Ruf. So lernt das Kind zum
  Bild und zum Klang auch, wie das Tier heißt.

### Statistik

- **AC-5** `fertig` **Ein Besuch ist eine Runde** — Schließt das Zimmer nach
  mindestens einem Tipp, wird eine Runde notiert: `dauer` (Zeit im Zimmer),
  `tipps` und `tiere` (wie oft welches Tier). Ohne Tipp wird nichts notiert.
- **AC-6** `fertig` **Tipps und Lieblingstier** — Die Statistik zeigt „Tiere
  angetippt" über alle Runden und, sobald es eines gibt, das „Lieblingstier" –
  das am häufigsten getippte, mit Bild. Fehlende oder unsinnige Felder und
  unbekannte Tiere zählen nicht.

## Randfälle

| #    | Fall                                            | Erwartetes Verhalten                                          |
| ---- | ----------------------------------------------- | ------------------------------------------------------------- |
| RF-1 | Zehn Finger zugleich auf verschiedenen Tieren   | Alle hüpfen, zu hören ist nur der zuletzt getippte Ruf.       |
| RF-2 | Tipp mit Wischen                                 | Zählt als Tipp – gerufen wird beim Aufsetzen.                 |
| RF-3 | Eingelesene Runde mit `tiere: "viele"`           | Keine Kennzahl wirft; das Lieblingstier bleibt, wie es war.   |

## Hintergrund

Gerufen wird beim Aufsetzen, nicht beim Loslassen: Ein Kind wischt beim
Tippen, und ein verwischter Tipp wird im Browser nie zum `click`.

Sechs je Seite, weil ein Tier auf einem Handy sonst kleiner wird als die
Hand, die es treffen soll. Blättern ist kein Fehler: Wer die Pfeile trifft,
sieht eben neue Tiere.

Die Ansage kommt aus Dateien, nicht aus der Sprachausgabe des Geräts: Die
klingt auf jedem Handy anders und fehlt offline oft ganz. Die dreißig Namen
sind einmal mit Piper und der Stimme „Thorsten" erzeugt (Datensatz
Thorsten-Voice, CC0), je gut eine halbe Sekunde lang und so laut wie die Rufe.
Der Schalter liegt auf dem Vorhang und nicht im Zimmer, damit ihn kein Kind
umlegt.
