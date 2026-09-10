# Schafkopf

**Datei:** [`spiele/schafkopf.js`](../../spiele/schafkopf.js) · [`spiele/karten.js`](../../spiele/karten.js)
**Stand:** 33/35 fertig · 2 in arbeit

## Zweck

Bayrischer Schafkopf zu viert: du und drei Rechner – Vroni, Sepp und Resi –,
kurze Karte, Sauspiel, Wenz, Geier und Farbsolo, abgerechnet nach dem üblichen
Tarif. Gebaut für alle, die das Spiel lernen oder üben wollen: Ein Lehrer in
drei Stufen erklärt Züge aus derselben Sicht, die ein Mensch am Tisch hat.

## Akzeptanzkriterien

### Blatt und Geben

- **AC-1** `fertig` **Kurze Karte zu viert** — Gespielt wird mit 32 Karten
  (Eichel, Gras, Herz, Schellen; Sau bis Siebener), jeder der vier bekommt
  acht. Die Augen sind Sau 11, Zehner 10, König 4, Ober 3, Unter 2, der Rest
  0 – zusammen 120; die Partei mit 61 Augen gewinnt. Du sitzt unten, in der
  ersten Gabe hast du die Vorhand, danach wandert der Geber reihum.
- **AC-2** `fertig` **Trumpf nach Spielart** — Beim Sauspiel sind alle Ober,
  alle Unter und Herz Trumpf, beim Farbsolo dasselbe mit der Solofarbe, beim
  Wenz nur die vier Unter, beim Geier nur die vier Ober; unter Obern und
  Untern gilt Eichel, Gras, Herz, Schellen. In der Hand stehen die Trümpfe
  vorn, abgesetzt von den Farben, und tragen eine Marke – vor der Ansage nicht.

### Ansage

- **AC-3** `fertig` **Einmal reihum ab Vorhand** — Jeder sagt genau einmal an
  oder weiter, beginnend bei der Vorhand, und wer ansagt, nennt gleich das
  Spiel. Unter jedem Namen steht, was er gesagt hat.
- **AC-4** `fertig` **Höhere Spielart sticht** — Solo steht über Wenz und
  Geier, diese über dem Sauspiel. Wer nach einer Ansage dran ist, bekommt nur
  noch höhere Spielarten angeboten; bei gleichem Rang bleibt das Spiel beim
  Näheren an der Vorhand. Die Frage lautet dann „… will … spielen. Hältst du
  dagegen?".
- **AC-5** `fertig` **Rufsau nur mit Farbe** — Ein Sauspiel geht nur auf
  Eichel, Gras oder Schellen, nur ohne die gerufene Sau in der eigenen Hand
  und nur mit mindestens einer weiteren Karte dieser Farbe (Ober und Unter
  zählen nicht). Andere Rufe werden weder dir noch den Rechnern angeboten.
- **AC-6** `fertig` **Keiner mag: zusammengeworfen** — Sagt keiner an, steht
  im Kopf „zusammengeworfen", und nach kurzer Pause wird neu gegeben. Die Gabe
  landet nicht in der Statistik.
- **AC-7** `fertig` **Rechner sagen durchgerechnet an** — Die Rechner
  entscheiden, indem sie jedes zulässige Spiel probeweise ausspielen, und
  verlangen für ein Alleinspiel eine deutlich höhere Erfolgsquote als für ein
  Sauspiel. Scheitert die Rechnung, sagen sie weiter – die Ansage bleibt nie
  hängen.

### Spielregeln beim Legen

- **AC-8** `fertig` **Farb- und Trumpfzwang** — Die angespielte Farbe muss
  bedient werden, angespielter Trumpf mit Trumpf; wer nicht kann, darf stechen
  oder abwerfen. Den Stich holt der höchste Trumpf, ohne Trumpf die höchste
  Karte der angespielten Farbe. Mensch und Rechner folgen denselben Regeln.
- **AC-9** `fertig` **Rufsau-Zwang** — Wird die Rufffarbe angespielt, muss der
  Partner die Sau legen. Anspielen darf er die Farbe nur mit der Sau selbst,
  außer er hält vier Karten davon: Dann darf er davonlaufen, und die Sau ist
  danach frei. Abwerfen darf er sie nicht, solange er noch eine andere Karte
  hat.
- **AC-10** `fertig` **Gesperrte Karte mit Grund** — Ist der Mensch dran, sind
  unerlaubte Karten sichtbar gedämpft. Wer trotzdem eine antippt, legt nichts
  und bekommt in einem Blatt „Die geht nicht" genau den Zwang genannt, der
  greift – Farbzwang, Trumpfzwang, Rufsau muss fallen, Rufffarbe nicht
  anspielen oder Rufsau nicht abwerfen. Das gilt auf jeder Lehrer-Stufe.
- **AC-11** `fertig` **Letzter Stich einsehbar** — Ab dem ersten fertigen
  Stich zeigt „Letzter Stich" dessen vier Karten in Legereihenfolge mit den
  Namen, markiert den Stecher und nennt die Augen; die früheren Stiche stehen
  klein darunter. Nach der Gabe zeigt „Stiche ansehen" alle acht.
- **AC-12** `fertig` **Karte vorwählen** — Tippst du eine Karte an, während ein
  anderer überlegt oder der Stich noch liegt, wird sie markiert und in der
  Dran-Zeile genannt („du legst …"). Sie fällt einen Augenblick nach dem
  Dranwerden von selbst; nochmaliges Antippen hebt die Vorwahl auf. Zwei
  Klicks kurz hintereinander zählen als einer.

### Abrechnung

- **AC-13** `fertig` **Tarif mit Laufenden** — Sauspiel 10, Wenz, Geier und
  Solo 50; dazu je 10 für Schneider, für Schwarz und für jeden Laufenden.
  Laufende sind die obersten Trümpfe ohne Lücke bei einer Partei, gezählt nach
  den ausgeteilten Blättern, und zählen ab drei, beim Wenz und Geier ab zwei.
  Beim Sauspiel bekommt oder zahlt jeder den einfachen Wert, der Alleinspieler
  den dreifachen; die vier Beträge ergeben zusammen immer null.
- **AC-14** `fertig` **Schneidergrenze wie am Tisch** — Die Spielerpartei ist
  mit 31 Augen schneiderfrei, die Gegenpartei schon mit 30: Schneider gewinnt
  der Spieler erst ab 91 Augen, Schneider verliert er mit 30 oder weniger.
  Schwarz ist, wer keinen einzigen Stich macht. Die Anleitung im Spiel nennt
  dieselbe Grenze.
- **AC-15** `fertig` **Ende zeigt die Rechnung** — Nach dem achten Stich steht
  aus deiner Sicht „Gewonnen." oder „Verloren.", dazu Spielart, Spieler und
  Partner, die Augen beider Seiten, jede Zeile der Abrechnung, dein Betrag und
  der Stand aller vier über den Abend. Liegen Laufende unter der Schwelle,
  steht auch das da, mit 0.

### Die Gegner

- **AC-16** `fertig` **Gegner sehen nur Erlaubtes** — Ein Rechner entscheidet
  allein aus seinem Blatt, dem Gelegten, der Ansage und der Kartenzahl je
  Hand. Zwei Lagen, die sich nur darin unterscheiden, wer welche fremde Karte
  hält, ergeben für ihn dieselbe Sicht.
- **AC-17** `fertig` **Schlüsse aus dem Verlauf** — Die gewürfelten
  Verteilungen widersprechen nie dem, was sich wissen lässt: Wer nicht bedient,
  hat die Farbe nicht. Der Spieler hat die Rufsau nicht; wer die Rufffarbe
  bedient, ohne die Sau zu legen, auch nicht – der Anspieler bedient dabei nicht,
  er spielt an; fällt sie trotz angespielter Farbe nicht, hält sie der
  Anspieler. Weitersagern werden, solange sich eine
  passende Verteilung findet, keine Blätter zugewürfelt, mit denen sie
  angesagt hätten.
- **AC-18** `in-arbeit` **Wenz- und Geier-Ansager gewogen** — Beim Wenz und
  Geier würfeln die Gegner dem Alleinspieler Blätter so oft zu, wie man sie
  auch ansagen würde – Sauen, Zehner und freie Farben zählen mit, nicht nur die
  Trümpfe, und schon gelegte Karten gehören zum Blatt. Findet sich in den
  Anläufen keine angenommene Verteilung, nehmen sie die glaubwürdigste.
- **AC-19** `in-arbeit` **Fertige Stiche zählen mit** — Ob eine Karte für 61
  Augen reicht, rechnet der Rechner samt der Augen, die in fertigen Stichen
  schon bei der jeweiligen Partei liegen – nicht ab null beim laufenden Stich.
  Wem ein fertiger Stich gehört, entscheidet die jeweilige Verteilung.
- **AC-20** `fertig` **Sau nicht vor den Zehner** — Beim Wenz und Geier
  spielt die Gegenpartei ihre Sau nicht an, wenn der Alleinspieler in dieser
  Farbe den Zehner mit Beikarte hält, und holt einen Stich dieser Farbe nicht
  mit der Sau, solange der Spieler schon gelegt hat und den Zehner noch hält.
- **AC-21** `fertig` **Exaktes Endspiel ab dreizehn** — Liegen nach dem
  geprüften Zug höchstens dreizehn Karten offen, spielt der Rechner jede
  gewürfelte Verteilung nicht mehr nach Faustregel zu Ende, sondern exakt,
  beide Parteien bestmöglich. Das Ergebnis stimmt mit einer vollständigen
  Suche ohne Abschneiden überein.
- **AC-22** `fertig` **Rechnen friert nichts ein** — Ein Rechnerzug rechnet mit
  fester Frist von rund einer Viertelsekunde und nimmt dann die beste bis dahin
  gefundene Karte; Tipp und Urteil rechnen höchstens knapp eine Sekunde.
  Wirft die Rechnung eine Ausnahme, legt der Rechner trotzdem eine erlaubte
  Karte – „… überlegt …" bleibt nie stehen.

### Der Lehrer

- **AC-23** `fertig` **Drei Lehrer-Stufen** — Unter der Glühbirne „Hinweise"
  stehen *aus*, *Tipp auf Anfrage* und *Mitlesen*; die Wahl bleibt über Gaben
  und Neuladen erhalten. Bei *aus* gibt es weder Tipp-Knopf noch Urteil, die
  Sperre unerlaubter Karten bleibt.
- **AC-24** `fertig` **Tipp mit Grund und Zahlen** — Auf Anfrage wird die
  empfohlene Karte in der Hand markiert, ein Satz begründet sie, und dabei
  stehen die Zahl der durchgerechneten Verteilungen, die Quote dieser Karte und
  die der nächstbesten sowie, ob der Zug der Faustregel folgt. Ist der
  Unterschied kleiner als sein Fehler – paarweise in denselben Verteilungen
  verglichen –, sagt der Hinweis das, statt eine Rangfolge zu behaupten. In
  der Ansage heißt der Knopf „Was geht?" und zeigt die Quoten der noch
  möglichen Spiele samt Fehler.
- **AC-25** `fertig` **Gleichauf entscheidet die Farbe** — Sind mehrere
  Sauspiele rechnerisch nicht zu unterscheiden, ruft der Rechner die Farbe, in
  der die meisten eigenen Augen stehen. „Was geht?" sagt dann, dass die Rufe
  gleichauf sind und warum die Farbe entschieden hat – oder dass es einerlei
  ist. Verschiedene Spielarten gelten nie als gleichauf.
- **AC-26** `fertig` **Mitlesen mit Bilanz** — Beim Mitlesen steht nach jeder
  deiner Karten, bei der du eine Wahl hattest, ein Urteil: „Genau die." oder
  „Geht auch." mit Begründung, sonst „Besser: …" mit beiden Quoten. Gerechnet
  wird schon, während du überlegst. Am Ende steht, bei wie vielen dieser
  Karten du auf der besten lagst.
- **AC-27** `fertig` **Hinweis schaut nicht rein** — Tipp, Urteil, „Was geht?",
  „Was du wissen kannst" und die Dran-Zeile rechnen aus derselben Sicht wie ein
  Gegner: dein Blatt, was liegt, die Ansage. Ein Tipp kann deshalb danebengehen.
- **AC-28** `fertig` **Begründung nur mit Geprüftem** — Kein Satz behauptet, was
  aus deiner Sicht nicht feststeht. „Billiger kommst du nicht drüber" steht nur,
  wenn keine billigere erlaubte Karte den Stich holt; empfiehlt der Rechner die
  teurere, nennt er die verworfene billigere und den Grund. „Der Stich gehört
  schon uns" oder „Stich ist sicher – schmieren" steht nur, wenn feststeht, zu
  welcher Partei der Führende gehört. Steht es nicht fest, sagt der Satz, dass
  es offen ist, und die Dran-Zeile heißt „Stich ist entschieden, für wen ist
  offen".
- **AC-29** `fertig` **Was du wissen kannst** — Ein Blatt fasst zusammen, was
  sich aus dem Verlauf ableiten lässt: Augen je Seite, Trümpfe draußen und wer
  den höchsten hält, hohe Karten unterwegs, was den laufenden Stich noch
  schlagen kann, wer wo frei ist, erzwungenes Zugeben, Indizien für den Partner
  und wo die Rufsau nicht sein kann.

### Darstellung

- **AC-30** `fertig` **Passt in flache Fenster** — Die Kartengröße richtet sich
  nach Breite und Höhe des Fensters. Mit acht Karten auf der Hand bleiben Hand
  und Knopfleiste auf einem flachen Laptop-Fenster (1366 × 700) wie am Handy
  (390 × 844) ganz sichtbar; unterhalb einer lesbaren Mindestgröße wird
  gescrollt statt weiter verkleinert.
- **AC-31** `fertig` **Selbst gezeichnete Karten** — Farbzeichen, Figuren und
  Rückseite sind eigene Zeichnungen im Code, ohne fremde Bilddateien. Zahlkarten
  tragen ihr Zeichen so oft, wie sie heißen, der Ober das Zeichen oben, der
  Unter unten, und der Eckindex steht zweimal auf der Karte.

### Speicher und Statistik

- **AC-32** `fertig` **Spielstand überlebt Schließen** — Eine Gabe steht nach
  Zurück, Neuladen oder Neustart der App in Ansage, Spiel oder Abrechnung
  wieder da, samt Geboten, Stichen und Lehrer-Zählern, und die Rechner machen
  weiter. Ein Stand, in dem nicht jede Karte genau einmal vorkommt, wird
  verworfen und neu gegeben. Tipp und Vorwahl sind flüchtig.
- **AC-33** `fertig` **Abendstand überlebt Zusammenwerfen** — Stand über den
  Abend, Zahl der Gaben und Lehrer-Stufe bleiben auch dann erhalten, wenn die
  App genau im Moment „zusammengeworfen" geschlossen oder neu geladen wird –
  und ebenso, wenn ein unstimmiger Stand verworfen und neu gegeben wird.
- **AC-34** `fertig` **Partie in der Statistik** — Jede zu Ende gespielte Gabe
  wird mit `gewonnen` (aus deiner Sicht), `dauer`, `spielart`, `alsSpieler`,
  `augen`, `punkte`, `hilfen`, `treffer`, `gezaehlt` und `zurueck` notiert.
  „Neu geben" und zusammengeworfene Gaben notieren nichts.
- **AC-35** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt Punkte
  gesamt, Siege als Spieler, Siege im Alleinspiel, Augen im Schnitt,
  zurückgenommene Züge und den Anteil bester Karten. Eine leere Partienliste
  zeigt nur „Punkte gesamt" mit 0; fehlende Felder erzeugen nie `NaN`, und
  Partien ohne boolesches `gewonnen` zählen in keiner Siegquote.

## Randfälle

| #     | Fall                                                          | Erwartetes Verhalten                                                                 |
| ----- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| RF-1  | Partner hält vier Karten der Rufffarbe und spielt eine kleine an | Erlaubt (davonlaufen); die Sau ist danach frei, und alle wissen, wer der Partner ist. |
| RF-2  | Partner kann nicht bedienen und tippt die Rufsau an           | Gesperrt, das Blatt nennt das Abwurfverbot. Ist sie seine letzte Karte, darf sie fallen. |
| RF-3  | Nach einer Ansage ist ein Solo schon angesagt                 | Es gibt nur noch den Knopf „Weiter".                                                 |
| RF-4  | Die Spielerpartei macht keinen Stich                          | Schneider und Schwarz werden beide berechnet.                                        |
| RF-5  | Zwei Laufende im Sauspiel                                     | Die Abrechnung zeigt „2 Laufende – zählen erst ab 3" mit 0.                          |
| RF-6  | Tipp, wenn nur eine Karte erlaubt ist                         | „Du hast gar keine Wahl"; Mitlesen zählt diese Karte nicht mit.                      |
| RF-7  | Vorgewählte Karte ist beim Dranwerden nicht erlaubt           | Sie fällt nicht; das Blatt „Die geht nicht" erklärt den Zwang.                       |
| RF-8  | Die Rechnung eines Rechners wirft eine Ausnahme               | Er legt nach Faustregel oder die erste erlaubte Karte, ein Toast sagt es.            |
| RF-9  | Sauspiel, die Rufsau ist noch nicht gefallen                  | Der Kopf zählt nur „Augen bei dir", der Partner wird nirgends angedeutet.            |
| RF-10 | „Neu geben" mitten in der Gabe                                | Die Gabe wird nach Rückfrage verworfen und nicht notiert, der Abendstand bleibt.     |
| RF-11 | Gespeicherter Stand aus älterer Fassung, Karte doppelt        | Es wird neu gegeben, statt bei „überlegt …" hängen zu bleiben.                       |

## Hintergrund

Der Hintergrund steht vorerst noch in der [README](../../README.md#schafkopf-im-detail),
Abschnitt „Schafkopf im Detail". Er zieht hierher um, sobald die laufende
Arbeit an Schafkopf eingecheckt ist – bis dahin wird er dort fortgeschrieben.
