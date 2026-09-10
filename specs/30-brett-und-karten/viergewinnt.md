# Vier gewinnt

**Datei:** [`spiele/viergewinnt.js`](../../spiele/viergewinnt.js)
**Stand:** 16/16 fertig

## Zweck

Vier gewinnt gegen einen Rechner, der je nach Stufe nachgiebig oder kaum zu
schlagen ist – oder zu zweit an einem Gerät, das hin und her wandert. Für eine
schnelle Partie auf dem Handy wie am Rechner.

## Akzeptanzkriterien

### Brett und Gegner

- **AC-1** `fertig` **Sieben mal sechs Felder** — Das Brett hat 7 Spalten und 6
  Zeilen. Ein Tipp auf irgendein Feld einer Spalte lässt den Stein bis auf den
  Boden oder auf den obersten liegenden Stein fallen. Ist die Spalte voll,
  kommt „Diese Spalte ist voll." und es geschieht kein Zug.
- **AC-2** `fertig` **Drei Stufen gegen den Rechner** — „Neue Partie" bietet
  leicht, mittel und schwer. Der Rechner sucht mit Minimax und Alpha-Beta und
  schaut 2, 5 bzw. 7 Steine voraus; auf leicht greift er in etwa jedem dritten
  Zug, auf mittel in etwa jedem zwölften absichtlich daneben. Ohne gespeicherte
  Partie beginnt eine auf mittel.
- **AC-3** `fertig` **Sofortsieg wird genommen** — Kann der Rechner mit seinem
  Stein gewinnen, tut er es auf jeder Stufe, auch auf leicht. Ebenso spielt er
  einen erzwungenen Sieg, den er innerhalb seiner Rechentiefe sieht.
- **AC-4** `fertig` **Drohung wird immer blockiert** — Kann der Mensch im
  nächsten Zug vier in eine Reihe legen und lässt sich das mit einem Stein
  verhindern, legt der Rechner diesen Stein auf jeder Stufe. Das Danebengreifen
  auf leicht und mittel darf nie eine offene Niederlage übersehen.
- **AC-5** `fertig` **Eigener Stein liegt zuerst** — Nach dem eigenen Wurf liegt
  der Stein sofort sichtbar, oben steht „Rechner am Zug", unter dem Titel „Der
  Rechner überlegt …". Erst danach rechnet der Rechner. Tipps aufs Brett und
  „Zug zurück" werden angenommen, sobald er gelegt hat, vorher nicht.
- **AC-6** `fertig` **Überlegen friert nicht ein** — Auch auf schwer bleibt die
  App bedienbar, während der Rechner überlegt: Zurück, Menü und Werkzeuge
  reagieren ohne spürbare Verzögerung, weil die Rechnung nicht auf der Seite,
  sondern in einem Worker läuft. Wer währenddessen das Spiel verlässt oder eine
  neue Partie beginnt, bekommt keinen nachträglichen Stein des Rechners.
- **AC-7** `fertig` **Wer beginnt** — Eine Partie aus „Neue Partie" beginnt
  der Mensch bzw. Rot. Nach dem Ende gegen den Rechner beginnt, wer verloren
  hat: nach einer Niederlage der Mensch, nach Sieg oder Unentschieden der
  Rechner. Zu zweit beginnt nach einem Sieg von Rot Gelb, nach einem Sieg von
  Gelb oder einem Unentschieden Rot.

### Zu zweit

- **AC-8** `fertig` **Zu zweit an einem Gerät** — „Neue Partie" → „Zu zweit an
  einem Gerät" startet eine Partie ohne Rechner: Rot und Gelb legen abwechselnd.
  Oben stehen „zu zweit" und „Rot am Zug" bzw. „Gelb am Zug" mit farbigem
  Punkt, der Rand des Brettes trägt dieselbe Farbe. Nach dem Ende gibt es „Noch
  eine" und „Gegen den Rechner".
- **AC-9** `fertig` **Zug zurück** — Gegen den Rechner nimmt „Zug zurück" den
  eigenen letzten Stein samt der Antwort des Rechners vom Brett, danach ist man
  wieder am Zug. Der Knopf ist gesperrt, solange der Rechner am Zug ist oder
  kein solches Paar liegt. Zu zweit nimmt er genau einen Stein, und wer ihn
  gelegt hat, ist wieder dran. Ist die Partie vorbei, gibt es kein Zurück.

### Ende der Partie

- **AC-10** `fertig` **Sieg und Unentschieden** — Vier gleiche Steine
  waagerecht, senkrecht oder in einer der beiden Schrägen beenden die Partie
  sofort, die vier Felder sind markiert. Es erscheint „Du gewinnst." oder „Der
  Rechner gewinnt.", zu zweit „Rot gewinnt." oder „Gelb gewinnt.". Ist das Brett
  voll, ohne dass vier in einer Reihe liegen, heißt es „Unentschieden.".
  Danach nimmt das Brett keine Steine mehr an.

### Speicher und Statistik

- **AC-11** `fertig` **Partie überlebt Schließen** — Eine laufende Partie gegen
  den Rechner steht nach Zurück, Neuladen oder Neustart der App wieder da, mit
  Brett, Stufe und Verlauf fürs Zurücknehmen. War der Rechner am Zug, zieht er
  gleich. Eine beendete Partie wird nicht wiederhergestellt; ein Stand aus einer
  älteren Fassung ohne Verlauf läuft als Partie gegen den Rechner weiter.
- **AC-12** `fertig` **Zu zweit übersteht Schließen** — Eine laufende Partie zu
  zweit steht nach dem Wiederöffnen unverändert als Partie zu zweit da – auch
  wenn Gelb am Zug ist. Niemand außer den beiden legt einen Stein.
- **AC-13** `fertig` **Gegen den Rechner mit Urteil** — Eine beendete Partie
  gegen den Rechner wird mit `gewonnen` (`true` nur bei eigenem Sieg, `false`
  bei Niederlage und Unentschieden), `remis`, `stufe`, `dauer` und `zuege`
  (Steine beider Seiten) notiert.
- **AC-14** `fertig` **Zu zweit ohne Urteil** — Eine beendete Partie zu zweit
  wird **ohne** das Feld `gewonnen` und ohne `stufe` notiert, dafür mit
  `modus: 'zwei'`, `remis`, `dauer` und `zuege`. Sie zählt als gespielt, aber
  nicht in der Siegquote – siehe
  [Partien ohne Urteil](../../README.md#partien-ohne-urteil). Das Ende sagt
  „Zählt als Runde, nicht als Sieg."
- **AC-15** `fertig` **Dauer zählt nur Spielzeit** — `dauer` enthält nur die
  Zeit, in der die Partie offen war. Eine Partie, die über Nacht geschlossen
  lag, bringt nicht die Nacht als Spielzeit in die Statistik.
- **AC-16** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt je
  Stufe „Siege" als gewonnen/gespielt (nur Partien mit dieser `stufe`, sonst
  „–"), die Zahl der Unentschieden und – nur wenn es welche gibt – „Runde zu
  zweit" bzw. „Runden zu zweit". Eine leere Liste und Partien ohne `stufe`,
  `gewonnen` oder `modus` ergeben keinen Fehler.

## Randfälle

| #    | Fall                                                  | Erwartetes Verhalten                                                   |
| ---- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| RF-1 | Tippen, während der Rechner überlegt                  | Wird ignoriert, ohne Meldung.                                          |
| RF-2 | Der 42. Stein vollendet eine Viererreihe              | Die Partie ist gewonnen, nicht unentschieden.                          |
| RF-3 | Der Rechner hat begonnen, man nimmt den ersten Zug zurück | Eigener Stein und Antwort gehen weg, sein Eröffnungsstein bleibt liegen. |
| RF-4 | Zu zweit „Gegen den Rechner" nach dem Ende            | Neue Partie gegen den Rechner auf der zuletzt gewählten Stufe, der Mensch beginnt. |
| RF-5 | Unentschieden gegen den Rechner                       | Zählt in der Siegquote als nicht gewonnen und zusätzlich als Unentschieden. |
| RF-6 | Nach einer beendeten Partie das Spiel neu öffnen      | Es beginnt eine frische Partie gegen den Rechner auf mittel.           |

## Hintergrund

Der Rechner spielt alle Züge gedanklich durch, unterstellt dem Menschen dabei
jeweils die beste Antwort und nimmt den Zug, der ihm im schlechtesten Fall am
wenigsten schadet. Damit das flott bleibt, prüft er die Spalten von der Mitte
nach außen – gute Züge zuerst gefunden heißt mehr abgeschnittene Äste. Am Ende
seiner Rechentiefe bewertet er offene Dreier und Zweier und die Mittelspalte,
durch die die meisten Viererreihen laufen; fremde Dreier wiegen etwas schwerer
als eigene.

Gemessen gegen den Code vor Version 60 (Wegwerf-Skript, Node am PC):

| Stufe | Sofortsieg genommen | Drohung blockiert | Rechenzeit Median | Rechenzeit max |
| --- | --- | --- | --- | --- |
| leicht | 400 / 400 | 66–67 % | 0,1 ms | 1–9 ms |
| mittel | 400 / 400 | 92 % | 3–4 ms | 21–59 ms |
| schwer | 50 / 50 | 100 % | 34–45 ms | 137–434 ms |

Das Danebengreifen wählte damals zufällig unter allen übrigen Spalten, sobald
der beste Zug nicht selbst entschied – stand eine Drohung, waren das genau die
verlierenden. Seit Version 60 greift der Rechner nur noch unter den Zügen
daneben, die nicht sofort verlieren (AC-4).

Die Rechnung lief am Stück auf der Seite. Mit sechsfach gebremster CPU, wie
auf einem langsamen Handy, blockierten die ersten drei Züge auf schwer die
Seite 248, 281 und 170 ms lang. Seit Version 60 rechnet ein Worker, dem die
Funktionen als Text mitgegeben werden – es bleibt eine einzige Fassung der
Rechnung (AC-6). Geht kein Worker, wird wie früher auf der Seite gerechnet.

„Zug zurück" nimmt gegen den Rechner zwei Steine, weil ein halber Schritt
nichts brächte: man stünde vor demselben Brett, nur wäre der Rechner am Zug.
Zu zweit reicht einer, das Gerät wandert ohnehin. Nach dem Ende geht es nicht
mehr, weil die Partie dann schon in der Statistik steht und sich nicht sauber
zurückdrehen ließe.
