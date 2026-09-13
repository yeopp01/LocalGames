# Riegel

**Datei:** [`spiele/pins.js`](../../spiele/pins.js)
**Stand:** 18/18 fertig

## Zweck

Das Rätsel aus der Werbung für Hero Wars, die nie das Spiel zeigt, für das sie
wirbt: Kammern mit Wasser, Lava, Gold und Steinen, getrennt durch Riegel. Wer
zieht, lässt los, was dahinter liegt – die Kunst ist die Reihenfolge. Elf
feste Level, jedes mit einem Zug, der verliert.

## Akzeptanzkriterien

### Level

- **AC-1** `fertig` **Elf feste Level** — Es gibt elf gebaute Level mit Namen.
  Oben stehen „Level n / 11" und, wo es Gold gibt, „Gold x % / Ziel %"; darunter
  der Name. Ohne gespeicherten Stand beginnt das erste noch nicht gelöste.
- **AC-2** `fertig` **Level wählen** — Das Werkzeug „Level wählen" zeigt alle
  Level als Knöpfe, gelöste mit Haken, das aktuelle hervorgehoben. Wählbar ist
  jedes gelöste und alles bis zwei hinter dem höchsten gelösten – eines darf
  man überspringen. Was gelöst ist, kommt aus der Statistik und reist deshalb
  mit der Sicherung.
- **AC-3** `fertig` **Jedes Level lösbar** — Jedes Level hat eine Reihenfolge,
  die gewinnt, und außer dem ersten mindestens einen Riegel, der als erster
  gezogen verliert.

### Riegel

- **AC-4** `fertig` **Tippen zieht** — Ein Tipp auf einen Riegel oder seinen
  nummerierten Griff zieht ihn heraus; er gleitet zur Seite des Griffs weg.
  Die Zifferntasten ziehen den Riegel mit der Nummer. Gezogen ist gezogen:
  Zurück geht es nur mit „Von vorn" (oder R), das das Level neu aufbaut.
- **AC-5** `fertig` **Gezogen wird in Ruhe** — Bewegt sich noch etwas, merkt ein
  Tipp den Riegel nur vor (sein Griff pulsiert); gezogen wird, sobald alles
  ruht. Ein zweiter Tipp nimmt die Vormerkung zurück. So entscheidet nie die
  Schnelligkeit des Fingers.
- **AC-6** `fertig` **Ohne Zufall** — Dieselben Riegel in derselben Reihenfolge
  ergeben immer dieselbe Welt, Zelle für Zelle.

### Welt

- **AC-7** `fertig` **Wasser, Lava, Gold, Stein** — Wasser fällt und fließt zur
  nächsten Stelle, an der es tiefer kann; Lava ebenso, aber halb so oft. Wo
  Wasser Lava berührt, wird die Lava zu Stein und das Wasser verdampft. Lava
  schmilzt Gold, das sie berührt. Gold und Stein fallen, rutschen schräg ab
  und sinken durch Wasser und Lava.
- **AC-8** `fertig` **Held und Ungeheuer** — Beide fallen, wenn nichts sie trägt,
  und rutschen ab, wenn sie nur noch mit einem Drittel ihrer Breite
  aufstehen. Das Ungeheuer läuft auf den Helden zu, solange nichts im Weg ist;
  klettern kann es nicht. Berührt Lava eine der Figuren, verbrennt sie. Sechs
  fallende Steine auf den Kopf erschlagen das Ungeheuer; der Held trägt einen
  Helm. Berührt ein lebendes Ungeheuer den Helden, frisst es ihn.
- **AC-9** `fertig` **Gold beim Helden** — Gold, das bis auf zwei Kacheln an den
  Helden herankommt, gehört ihm.

### Ende

- **AC-10** `fertig` **Sieg** — Ruht die Welt, lebt der Held, hat er das Ziel an
  Gold (sonst 70 % des Goldes im Level, in „Erst löschen" 60 %) und lebt kein
  Ungeheuer mehr, erscheint „Geschafft." mit Level, Zeit und Zahl der Hinweise
  und den Knöpfen „Weiter zu Level n+1" und „Nochmal". Übrige Riegel müssen
  nicht gezogen werden.
- **AC-11** `fertig` **Niederlage** — Stirbt der Held, erscheint knapp eine
  Sekunde später „Verbrannt." oder „Gefressen."; die Lava darf dabei zu Ende
  fließen. Ruht die Welt und reicht das Gold im Feld nicht mehr fürs Ziel,
  heißt es „Das Gold ist geschmolzen."; sind alle Riegel gezogen und das Ziel
  fehlt, „Das Gold kam nicht an." oder „Das Ungeheuer lebt noch.". Darunter
  steht der Grund als Satz und „Nochmal versuchen".

### Hinweis

- **AC-12** `fertig` **Hinweis rechnet nach** — „Hinweis" probiert von der
  ruhenden Welt aus jeden übrigen Riegel durch und nennt einen, nach dem das
  Level noch zu gewinnen ist, samt dem, was er anrichtet („Wasser trifft auf
  Lava und wird zu Stein."). Für die anderen sagt er, was schiefginge („Riegel
  3 jetzt: die Lava erreicht den Helden."). Der Griff des genannten Riegels
  pulsiert, „Riegel n ziehen" zieht ihn. Er liest keine gespeicherte Lösung –
  es gibt keine.
- **AC-13** `fertig` **Sackgasse wird erkannt** — Führt kein Riegel mehr zum
  Sieg, sagt der Hinweis „Von hier geht es nicht mehr auf.", nennt für jeden
  Riegel den Grund und bietet „Von vorn" an.
- **AC-14** `fertig` **Hinweise werden gezählt** — Jeder Druck auf „Hinweis" in
  ruhender Welt zählt als Hinweis. Bewegt sich noch etwas, kommt nur „Erst
  wenn alles ruht." und nichts wird gezählt.

### Speicher und Statistik

- **AC-15** `fertig` **Partie überlebt Schließen** — Gespeichert werden Level,
  gezogene Riegel, Hinweise und verbrauchte Zeit. Nach Zurück oder Neuladen
  rechnet das Spiel die Züge nach und steht in der ruhenden Welt danach. Ein
  schon entschiedenes Level beginnt neu, nach einem Sieg das nächste.
- **AC-16** `fertig` **Angehalten** — Wird die App verdeckt oder ein Blatt
  geöffnet, während sich etwas bewegt, steht „Angehalten – Tippen, dann geht es
  weiter."; ein Tipp aufs Feld lässt es weiterlaufen.
- **AC-17** `fertig` **Partie in der Statistik** — Jedes entschiedene Level wird
  mit `gewonnen` (wahr oder falsch), `stufe` (Levelnummer), `dauer`, `hilfen`
  und, wo es Gold gibt, `gold` in Prozent notiert; ein abgebrochenes nicht. Die
  Statistik zeigt „Level gelöst" als x/11 und „ohne Hinweis gelöst", auch bei
  leeren Listen und Partien ohne `stufe`.
- **AC-18** `fertig` **Anleitung erklärt alles** — Das Blatt „Anleitung" nennt
  das Ziehen ohne Zurück, das Ziel mit Gold und Ungeheuer, was Lava, Wasser
  und Steine tun, dass das Ungeheuer läuft und nicht klettert, das Vormerken
  und den Hinweis.

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                                   |
| ---- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| RF-1 | App schließt, während Wasser fließt               | Nach dem Neuladen ist die Bewegung nachgerechnet, die Welt ruht.       |
| RF-2 | Held stirbt, nachdem genug Gold da ist            | Niederlage – das Urteil gilt erst in Ruhe, und dann lebt er nicht.     |
| RF-3 | Hinweis, während sich etwas bewegt                | „Erst wenn alles ruht.", kein Hinweis gezählt.                         |
| RF-4 | Gespeichertes Level außerhalb der Liste           | Das erste ungelöste Level beginnt.                                     |
| RF-5 | Ungeheuer steht nur mit der Kante auf der Falltür | Es rutscht ab, statt über dem Loch zu schweben.                        |

## Hintergrund

Die Welt ist ein Raster aus 45 × 72 Zellen; eine Kachel der Levelkarte sind
3 × 3 davon. Gerechnet wird mit 90 Takten je Sekunde. Flüssiges geht seitwärts
nur in Richtung einer Stelle, an der es fallen kann (oder über der anderen
Flüssigkeit steht) – ohne diese Bedingung wanderten die letzten Tropfen auf
einer Fläche ewig hin und her, und die Welt käme nie zur Ruhe. Über freie
Zellen springt Wasser bis zu vier, Lava bis zu zwei Zellen je Takt: Vorher
kroch in „Nicht der da" ein letzter Lavafaden noch 5 Sekunden nach dem Tod des
Helden zur Wand.

Weil alles ohne Zufall läuft, speichert das Spiel nur die gezogenen Riegel,
und der Hinweis kann ehrlich sein: Er rechnet vor, statt nachzuschlagen. Der
Löser merkt sich jede ruhende Lage, die er schon kennt – wer zwei Kammern
unabhängig öffnet, landet in beiden Reihenfolgen gleich.

Waagerechte Riegel liegen in der obersten Zellreihe ihrer Kachel. In der Mitte
ließen sie darüber eine Rinne, in der Lava liegen blieb, und das Ungeheuer der
„Falltür" stand mit einer Zelle auf dem Fels daneben.

Nachgeprüft mit einem Wegwerf-Gerüst gegen `spiele/pins.js` (Node, PC), das
jede Reihenfolge der Riegel bis zum Urteil durchrechnet:

| Level             | Riegel | Siege / Enden | gute erste Riegel | Hinweis am Start |
| ----------------- | ------ | ------------- | ----------------- | ---------------- |
| Der erste Riegel  | 1      | 1/1           | 1                 | 12 ms            |
| Nicht der da      | 2      | 1/2           | 2                 | 22 ms            |
| Das Ungeheuer     | 2      | 1/2           | 1                 | 30 ms            |
| Falltür           | 2      | 1/2           | 2                 | 22 ms            |
| Erst löschen      | 3      | 2/4           | 2                 | 57 ms            |
| Steinschlag       | 3      | 3/5           | 1, 2              | 66 ms            |
| Stein statt Lava  | 3      | 3/5           | 1, 2              | 116 ms           |
| Die Grube         | 3      | 3/6           | 2, 3              | 100 ms           |
| Ablauf            | 3      | 2/4           | 2                 | 68 ms            |
| Pfropfen          | 3      | 3/5           | 2, 3              | 116 ms           |
| Weiche            | 5      | 30/48         | 2, 5              | 192 ms           |
