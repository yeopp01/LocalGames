# Schafkopf

**Datei:** [`spiele/schafkopf.js`](../../spiele/schafkopf.js) · [`spiele/karten.js`](../../spiele/karten.js)
**Stand:** 35/35 fertig

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
- **AC-18** `fertig` **Wenz- und Geier-Ansager gewogen** — Beim Wenz und
  Geier würfeln die Gegner dem Alleinspieler Blätter so oft zu, wie man sie
  auch ansagen würde – Sauen, Zehner und freie Farben zählen mit, nicht nur die
  Trümpfe, und schon gelegte Karten gehören zum Blatt. Findet sich in den
  Anläufen keine angenommene Verteilung, nehmen sie die glaubwürdigste.
- **AC-19** `fertig` **Fertige Stiche zählen mit** — Ob eine Karte für 61
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

Bayrisch, zu viert, kurze Karte: 32 Blatt, jeder acht, 120 Augen, 61 gewinnen.
Angesagt werden Sauspiel, Wenz, Geier und Farbsolo; abgerechnet wird mit dem
üblichen Tarif samt Schneider, Schwarz und Laufenden. Die drei Mitspieler
heißen Vroni, Sepp und Resi und rechnen.

**Wie die Gegner denken.** Sie sehen ihr eigenes Blatt und alles, was liegt –
die Karten der anderen sehen sie nicht. Aus dem, was sie wissen dürfen, würfeln
sie zweihundert mögliche Verteilungen der fremden Karten zusammen, spielen jede
zu Ende und legen die Karte, die am häufigsten für 61 Augen reicht.

Ihr Wissen ist dabei nicht nur „was liegt schon". Wer eine Farbe nicht bedient,
hat sie nicht mehr – das merken sie sich. Und der Rufsau-Zwang verrät noch
mehr: Der Spieler hat die gerufene Sau nicht, sonst hätte er nicht rufen
dürfen. Wer die Rufffarbe bedient, ohne die Sau zu legen, hat sie auch nicht.
Und fällt die Sau nicht, obwohl ihre Farbe angespielt wurde, dann *ist* der
Anspieler der Partner – nur er darf davonlaufen. Verteilungen, die dem
widersprechen, werden gar nicht erst gewürfelt.

**Und sie lesen die Ansage mit.** Das ist die einzige Auskunft, die schon vor
dem ersten Stich vorliegt, und sie ist scharf: Wer ansagt, hält im Schnitt 4,75
Trümpfe und 1,57 Ober, wer weitersagt 3,10 und 0,82. Mit drei Trümpfen oder
weniger sagt so gut wie niemand an; nur 1,2 Prozent aller Weitersager hielten
überhaupt sechs. Der Würfel verwirft deshalb jede Verteilung, in der ein
Weitersager ein Blatt bekäme, mit dem er angesagt hätte — gerechnet über das
ganze Blatt, also einschließlich der Karten, die er schon gelegt hat.

Das wirft vier von zehn Welten weg und macht das Weltbild messbar schärfer: Der
Fehler in der geschätzten Trumpfzahl je fremder Hand sinkt um **18,5 Prozent**,
bei den Obern um 8,4.

Dass daraus auch bessere Züge werden, war nicht selbstverständlich — ein
besseres Weltbild schlägt bei diesem Verfahren nicht automatisch durch, weil in
jeder einzelnen Welt so getan wird, als läge alles offen. Gemessen an der
Wahrheit über 8146 Entscheidungen, in denen die Bedingung eine andere Karte
wählt: **+0,37 ± 0,27 Augen** je geändertem Zug. Und der Gewinn sitzt nicht im
ersten Stich (+0,09), sondern in der Mitte — Stich 4 mit +0,74, Stich 5 mit
+1,49 —, wo die Ansage-Auskunft mit den Farbschlüssen zusammenkommt und das
exakte Endspiel anspringt.

**Beim Wenz und Geier reichte das nicht.** Dort verlangte der Würfel vom
Alleinspieler nur zwei Unter bzw. Ober – und ein Blatt, das nichts weiter hat
als zwei Unter, sagt niemand an. Die Gegenpartei rechnete sich deshalb vor dem
ersten Stich in 78 von 100 Welten als Sieger, tatsächlich gewinnt sie 16. Sie
hielt die Zehner des Spielers für die ihres Partners und legte ihre Sau, sobald
sie konnte. Ein Wenz mit Zehner und Beikarte bekam die Sauen dadurch zuverlässig
vorgelegt: kleine Karte drunter, der Zehner steht, und der Rest geht billig weg.

Jetzt wird das Blatt des Alleinspielers gewogen statt nur geprüft: angenommen
mit der Wahrscheinlichkeit, mit der der Rechner es selbst angesagt hätte.
Gemessen an 40 664 Blättern mit mindestens zwei Trümpfen, 1448 davon angesagt,
trägt eine logistische Kurve über vier Merkmale – Trümpfe, Sauen, Zehner, freie
Farben – und trifft: wo sie 33 % sagt, sind es 31 %, wo sie 88 % sagt, 91 %.

| Gegenpartei vor dem ersten Stich | Sauen beim Spieler | Sieg Gegenpartei | ihre Augen |
| --- | --- | --- | --- |
| vorher gewürfelt | 0,89 | 78 % | 79 |
| jetzt gewürfelt | 1,79 | 31 % | 50 |
| tatsächlich | 2,10 | 16 % | 40 |

Beim Nachsehen fiel ein zweiter Fehler auf, der alle Spielarten betraf: Jede
gewürfelte Welt beginnt beim laufenden Stich, und was schon in fertigen Stichen
lag, fehlte in der Rechnung. Die Schwelle von 61 stand damit an der falschen
Stelle – die Gegenpartei zählte alle bisherigen Augen des Spielers als ihre,
und beim Wenz hielt sie sich vom vierten Stich an praktisch immer für den
Sieger. Wo alles gewonnen scheint, sind alle Karten gleich gut, und dann
entscheidet nur noch die Faustregel.

Liegen nur noch dreizehn Karten, hört das Schätzen auf: dann wird die Welt
exakt durchgerechnet, beide Parteien bestmöglich, mit Alpha-Beta. Früher
umzuschalten wäre schön und geht nicht – die Zeit für einen einzigen Zug,
gemessen statt geschätzt:

| exakt ab … offenen Karten | Median | schlimmster Fall |
| --- | --- | --- |
| 13 | 3 ms | 0,3 s |
| 17 | 4 ms | 1,2 s |
| 21 | 5 ms | 42 s |
| 25 | 7 ms | 21 min |

Der Median bleibt harmlos, weil die meisten Stellungen klein sind. Es sind die
wenigen grossen, die einen Zug zur Hängepartie machen.

Gegen die reine Faustregel, die in den Ausspielungen steckt, gewinnt dieser
Rechner **44 von 59** Partien; umgekehrt nur 29 von 59.

**Ob sich ein Blatt lohnt**, wird genauso beantwortet: probeweise durchspielen
und zählen. Eine Punktetabelle wäre schlechter, denn die gerufene Sau liegt
irgendwo, und wo, weiß beim Ansagen niemand.

Wie oft probeweise, ist dabei keine Geschmacksfrage. Der Fehler einer Quote
fällt mit der Wurzel der Probenzahl: bei 60 Proben liegt er um 0,7 herum bei
±12 Punkten. Zwei Rufe, die drei Punkte auseinanderliegen, sind damit
überhaupt nicht zu unterscheiden – eine Anzeige, die sie trotzdem der Reihe
nach sortiert, zeigt Rauschen und nennt es Rangfolge. Der Rechner nimmt
deshalb 400 Proben, der Hinweis für den Menschen 1200, und `quote()` gibt den
Fehler mit heraus, damit niemand zwei Zahlen für verschieden erklärt, die es
nicht sind.

Das ist nicht nur Kosmetik: Mit 60 Proben wurde jede fünfte Gabe allein
gespielt, mit 600 nur noch jede neunte. Ein Teil der Solos war schlicht
Zufall, der knappe Blätter über die Schwelle geschoben hat.

**Wenn zwei Rufe gleichauf sind**, entscheidet nicht die dritte
Nachkommastelle, sondern eine Regel vom Tisch: Ruf die Farbe, in der deine
eigenen Augen stehen. Die gerufene Sau gehört dem Partner – wird die Farbe
angespielt, muss er sie legen und nimmt den Stich, deine hohe Karte dieser
Farbe fällt also der eigenen Partei zu statt der gegnerischen. Nachgemessen an
einem Blatt mit je einer blanken Karte in Eichel, Gras und Schellen, 3000
ausgespielte Gaben je Ruf – wo landet der Eichel-Zehner?

| gerufen wird | Zehner bei der eigenen Partei |
| --- | --- |
| die Alte (Eichel) | 71 % |
| die Blaue (Gras) | 43 % |
| die Bumpel (Schellen) | 41 % |

Auf die Siegquote schlägt das mit +0,92 ± 1,05 Punkten durch, gepaart über
12 000 Gaben. Zu wenig, um deswegen eine schlechtere Farbe zu rufen – genau
richtig, um zu entscheiden, wenn sich die Quoten ohnehin nicht unterscheiden
lassen. Der Hinweis sagt das dann auch dazu, statt eine Wahl zu treffen, die
willkürlich aussieht.

Diese Probe schmeichelt allerdings dem, der ansagt – die Faustregel greift
lieber an, als dass sie verteidigt. Über 160 durchgespielte Partien gemessen:

| | geschätzt | tatsächlich |
| --- | --- | --- |
| Sauspiel | 0,74 | 0,66 |
| Alleinspiele | 0,69 | 0,61 |

Derselbe Abstand quer durch alle Spielarten, also wird er einmal abgezogen,
statt für jede Spielart eine eigene Zahl zu erfinden. Ein Alleinspiel braucht
danach 0,72, damit es angesagt wird – ein Solo spielt man, wenn es sitzt, und
nicht, wenn es sich gerade eben rechnet. Über 400 Gaben werden damit 94 %
gespielt: 83 % Sauspiel, 11 % Alleinspiel, der Rest zusammengeworfen.

**Der Lehrer.** Drei Stufen, oben unter der Glühbirne:

* *aus* – nur die Regeln. Unerlaubte Karten bleiben trotzdem gesperrt, und wer
  auf eine tippt, bekommt gesagt, welcher Zwang gerade greift.
* *Tipp auf Anfrage* – ein Knopf zeigt auf die Karte, sagt in einem Satz warum,
  und nennt die Zahlen: „In 240 durchgerechneten Verteilungen reicht es damit
  in 71 % der Fälle – mit dem Gras-Ober nur in 58 %." In der Ansage heißt
  derselbe Knopf „Was geht?" und zeigt für jedes mögliche Spiel die Quote.
* *Mitlesen* – nach jeder deiner Karten ein Urteil. Gerechnet wird still, schon
  während du überlegst, damit es sofort dasteht. Am Ende steht die Bilanz, bei
  wie vielen Karten du auf der besten lagst.

**Wann ist ein Vorsprung einer?** Alle Karten werden in *denselben* gewürfelten
Verteilungen geprüft. Der Unterschied lässt sich deshalb Welt für Welt bilden
statt aus zwei getrennten Quoten schätzen, und das ist um ein Vielfaches
genauer: Die meisten Verteilungen gehen für beide Karten gleich aus und fallen
aus der Rechnung heraus, statt zweimal Streuung beizusteuern. Ist der
Unterschied kleiner als sein eigener Fehler, sagt der Hinweis das – und dass
dann die Begründung entscheidet und nicht die Zahl. Eine feste Schwelle wäre
falsch: mal sind drei Punkte Zufall, mal ist einer echt.

**Und die Begründung behauptet nichts Ungeprüftes.** „Billiger kommst du nicht
drüber" steht nur da, wenn wirklich keine billigere Karte den Stich holt.
Empfiehlt der Rechner die teure, sagt er, welche billigere er verwirft und
warum – meistens, weil der Partner hinter einem sitzt und einen Überstich noch
abfangen kann, oder weil die Karte sonst später ohnehin fällt. Ein Lehrer, der
den richtigen Zug falsch begründet, ist schlimmer als keiner.

**Regeln finden, statt sie zu erraten.** Die Faustregel ist eine Sammlung von
Merksätzen, und Merksätze schreibt man leicht hin, ohne sie zu prüfen. Es geht
auch anders: Der Rechner ist nachweislich stärker als die Faustregel, also
lässt man ihn tausende Stellungen bewerten und schaut, wo die Faustregel
systematisch anders entscheidet. Verglichen wird paarweise, in denselben
gewürfelten Welten.

Über 300 Gaben, nur Stellungen mit echter Wahl:

| wo | Lücke in Punkten Siegquote | eindeutig | n |
| --- | --- | --- | --- |
| Spielerpartei | 8,95 | 70 % | 181 |
| Anspiel | 8,62 | 70 % | 132 |
| Rechner legt Trumpf | 7,89 | 65 % | 179 |
| früh (Stich 1–3) | 7,77 | 62 % | 218 |

Die Faustregel spielt also die Spielerpartei am schlechtesten, und zwar beim
Anspiel — und wo der Rechner abweicht, legt er Trumpf. Über alle 1491
Anspiele der Spielerpartei hinweg:

| | Anteil Trumpf-Anspiel |
| --- | --- |
| hält den höchsten Trumpf, der noch draußen ist | 95 % |
| 1 / 2 / 4 / 6 Trümpfe auf der Hand | 10 % / 55 % / 60 % / 78 % |
| Solo / Sauspiel / Wenz / Geier | 79 % / 43 % / 28 % / 23 % |

**Und dann kommt die Lehre daraus.** Man baut die Regel nach — „als
Spielerpartei zieht man Trumpf" — und misst sie. Ergebnis:

| Spielerpartei zieht Trumpf … | Sauspiel | Herz-Solo |
| --- | --- | --- |
| bisherige Regel | 66,8 % | 53,9 % |
| immer den höchsten | 62,2 % | 49,7 % |
| Solo ab 4 Trümpfen | 66,8 % | 51,9 % |
| Solo ab 5 Trümpfen | 66,8 % | 51,6 % |

Jede pauschale Fassung macht es **schlechter**, das Solo um bis zu sieben
Punkte. Das Mining sagt eben nur, *wo* der Rechner abweicht, nicht *dass* man
dort immer so spielen soll: Die 10 Punkte Lücke gelten für die 20 Prozent der
Anspiele, in denen er abweicht — wendet man die Regel auf alle an, verliert
man in den übrigen 80 mehr, als man gewinnt.

Übrig blieb aus dem ganzen Verfahren genau eine Regel, und die ist winzig: Den
höchsten Trumpf, der noch draußen ist, spielt man an — **auch wenn es der
einzige ist, den man hat**. Vorher verlangte die Faustregel zwei. Gemessen
über 8000 gepaarte Gaben: +0,56 ± 0,36 Punkte beim Sauspiel, +0,63 ± 0,32 beim
Solo.

Das ist das eigentliche Ergebnis: Der Vorsprung des Rechners ist zum größten
Teil **nicht in Regeln fassbar**. „Der Spieler zieht Trumpf" ist eine Neigung
und kein Satz, den man durch Abzählen anwenden kann — sonst bräuchte es das
Würfeln nicht.

### Wo Regeln aufhören

Merksätze an- und auszuschalten beantwortet nicht die eigentliche Frage: *Wann*
gilt eine Regel? Dafür braucht es den umgekehrten Weg — Stellungen sammeln, zu
jeder die Merkmale notieren, die ein Mensch am Tisch auch sieht, und darin den
Baum suchen, der die Wahl des Rechners am besten erklärt.

Über 1480 Anspiele, bei denen wirklich zwischen Trumpf und Farbe zu wählen war,
beherrscht **ein einziges Merkmal** das Bild: Hältst du den höchsten Trumpf, der
noch draußen ist?

| | mit Chef-Trumpf | ohne |
| --- | --- | --- |
| Spieler | 69 % Trumpf, mit trumpfhaltenden Gegnern **96 %** | 29 % |
| Mitspieler | **94 %** | 16 % |
| Gegenspieler | **92 %** | **3 %** |

Und die einzige Ausnahme steht gleich daneben: Haben die Gegner gar keinen
Trumpf mehr, fällt der Chef-Trumpf von 96 auf **3 Prozent** — man zieht ja
niemandem mehr etwas heraus.

**Wie weit tragen Regeln?** Das lässt sich beziffern. Zählt man die Blätter des
Baums, in denen der Rechner sich zu über neun Zehnteln einig ist, kommt man auf:

| Rolle | in Regeln fassbar |
| --- | --- |
| Gegenspieler | **89 %** |
| Spieler | 54 % |
| Mitspieler | 27 % |
| zusammen | **59 %** |

Drei von fünf Anspielen folgen also einer Regel, die man aufschreiben kann. Die
übrigen zwei sind echte Abwägungen, in denen es auf die einzelnen Karten
ankommt — dort trägt keine Zusammenfassung mehr. Der Versuch, die deutlichste
dieser offenen Lagen (58 Prozent Trumpf) trotzdem zur Regel zu machen, wurde
gemessen und kostet: Spieler −0,15, Gegenpartei −0,79.

Das ist die Grenze, und sie ist keine Schwäche des Verfahrens, sondern eine
Aussage über das Spiel: Genau in diesen 41 Prozent verdient sich das Rechnen
seinen Platz.

### Was von den Merksätzen übrig blieb

Alle bisher geprüften, jeder in der Fassung, die tatsächlich gemessen wurde.
Gemessen wird immer paarweise – dieselben Gaben mit und ohne Regel – und
getrennt danach, welche Partei sie anwendet.

**Wie die Zahlen zu lesen sind:** Ein Plus heißt immer, dass die Partei, die
die Regel anwendet, so viele Prozentpunkte öfter gewinnt — aus *ihrer* Sicht,
nie aus der des Gegners. Gerechnet wird intern zwar durchgehend die Siegquote
der Spielerpartei; für die Zeilen der Gegenpartei wird das Vorzeichen deshalb
gedreht. Ohne das bedeutet dasselbe Zeichen in zwei Zeilen zweierlei, und
genau daran ist diese Tabelle schon einmal missverstanden worden.

| Merksatz | Fassung | Wirkung | |
| --- | --- | --- | --- |
| Mit der teuren Karte stechen, wenn der Stich hält | außer sie ist der höchste Trumpf | +1,9 Sauspiel, **+7,6** Solo | eingebaut |
| Blanke Sau anspielen | *nicht* als Alleinspieler bei Wenz/Geier | +3,4 Wenz, +2,8 Geier | eingebaut |
| Den höchsten Trumpf anspielen, der noch draußen ist | auch mit nur einem Trumpf | +0,56 ± 0,36 Sau, +0,63 ± 0,32 Solo | eingebaut |
| Trumpf ziehen **ohne Bedingung** | pauschal, immer – nicht etwa: Trumpf ziehen überhaupt | −1,9 Sauspiel, −4,2 Solo | verworfen |
| Als Gegenspieler die Rufsau suchen | pauschal, immer | −1,2 | verworfen |
| Nachspielen | Farbe der eigenen Partei fortsetzen | ±0,4, kein Unterschied | verworfen |
| Nachspielen gegen ein Solo | **hohe** Karte in eine Farbe, in der der Mitspieler frei ist | **−3,2 / −3,8** für die Spielerpartei | eingebaut |
| dasselbe mit kleiner Karte | sonst gleich | +5,0 bis +5,5, also schädlich | verworfen |
| dasselbe, Spieler muss bedienen | zusätzliche Bedingung | −0,8, Wirkung weg | verworfen |
| Kurzer Weg – lange Farbe | nur die Farbwahl, überstimmt nichts | ±0,4, kein Unterschied | offen |
| Langer Weg – lange Farbe | dieselbe enge Fassung | −0,5 ± 0,5, nicht bestätigt | offen |
| Farbeln: längste Farbe spielen | dieselbe enge Fassung | ±0,6, kein Unterschied | offen |
| Weg-Regeln und Farbeln | als Vorrang **über** Trumpfziehen | −3,2 bis −3,9 | verworfen |
| Im ersten Stich Trumpf ziehen | erzwungen, statt Farbe | Spieler −0,58 · Gegenpartei +3,0 Ruf, +10,2 Solo | verworfen |
| Die Rufsau mit dem Zehner suchen | Gegenpartei spielt die Rufffarbe teuer an | ±0,00 – die Formel tut es ohnehin nie | schon drin |
| Sich trumpffrei machen | kleinen Trumpf abwerfen, um schmieren zu können | greift 17× in 1000 Gaben, +2,4 ± 2,2 | nicht prüfbar |
| Womit sticht man? | die Augen **im Stich** mitentscheiden lassen | −0,5 bis −0,7 | verworfen |
| Den höchsten Trumpf nicht schmieren | er holt später selbst einen Stich | Ruf +1,6 / +0,8 / −2,1, Solo −6,0 | eingebaut |
| Beim unsicheren Stich höchstens einen Unter schmieren | statt bis zum König | in der Zeile darüber enthalten | eingebaut |
| Nicht unterstechen | beim Schmieren Farbe vor Trumpf | +0,52 ± 0,23 für den Spieler | eingebaut |
| Als Letzter den Chef doch schmieren | der Stich ist ja sicher | −0,3 bis −0,4 | verworfen |
| Als Letzter die kleinste Karte hergeben | statt der Abwurf-Formel | −0,2 bis 0,0 | verworfen |
| Aus der **langen** Farbe abwerfen | statt die kurze blank zu machen | +0,2 Ruf, +0,5 Solo für die Gegenseite | verworfen |
| Länge beim Abwerfen ignorieren | | +0,1 bis +0,2 | verworfen |
| Wann wagt man einen Stich, den man verlieren kann? | Schwelle von 4 bis „nie" | 0,0 überall | wirkungslos |

Die vorletzte Zeile ist die lehrreichste. Der Merksatz „spiel die Farbe nach,
in der dein Partner schon frei ist" stimmt — aber nur mit einer **hohen**
Karte. Mit der kleinsten angespielt verbrennt der Partner einen Trumpf für
einen Stich ohne Augen, und aus dem Gewinn von drei Punkten wird ein Verlust
von fünf. Zwischen der richtigen und der schädlichen Auslegung desselben
Satzes liegen acht Punkte.

Ebenso gegen die Erwartung: Jede Zusatzbedingung *schwächt* die Regel. Verlangt
man, dass der Alleinspieler die Farbe noch bedienen muss — was nach der besten
Gelegenheit klingt —, bleibt von −3,2 nur −0,8 übrig.

Die drei Zeilen mit dem **höchsten Trumpf** gehören zusammen und sind der
größte Einzelfund: Er wird nicht geschmiert, nicht zum Stechen hergegeben und
auch als Letzter nicht — obwohl der Stich dann sicher ist. Er ist einen
künftigen Stich wert, und zwar unabhängig davon, wie sicher der jetzige ist.

**Gemessen wird seither in zwei Dimensionen**, weil dieselbe Regel darin
verschieden liegen kann: Spielart (Rufspiel / Solo / Wenz / Geier) und Rolle
(Spieler / Mitspieler / Gegenspieler). Das lohnt sich. Beim Schmieren gewinnt
der Spieler +1,6 und sein Mitspieler nur +0,8 — halb so viel, weil der Rufer
öfter in die Lage kommt. Beim Nichtunterstechen gewinnt allein der Spieler,
für alle anderen ist es wirkungslos. Und beim Wenz ist die Hälfte aller
Stech-Entscheidungen gar nicht vorhanden: bei vier Trümpfen gibt es sie nicht.

Sechs Lehren stehen darin.

**Die Fassung entscheidet über das Ergebnis, nicht der Merksatz.** Dieselben
drei Regeln sind als Vorrang über alles ein Verlust von fast vier Punkten und
als bloße Farbwahl wirkungslos. Wer eine Regel prüft, prüft immer eine ganz
bestimmte Auslegung von ihr – und muss sie deshalb hinschreiben.

**Manche Regel ist zu selten, um geprüft zu werden.** „Sich trumpffrei machen"
– den letzten, nutzlosen Trumpf abwerfen, damit man beim nächsten Trumpfstich
schmieren kann statt zuzugeben – kommt nach Einschätzung eines Spielers zweimal
in tausend Gaben vor. Selbst eine großzügig gefasste Version greift nur 17-mal
in tausend, und schon darauf ist die Wirkung nicht von Rauschen zu trennen. Für
die enge Fassung bräuchte es rund das Sechzigfache an Partien. Sie ist deshalb
nicht eingebaut — nicht weil sie falsch wäre, sondern weil dieses Verfahren sie
nicht sehen kann. Das ist eine Grenze der Methode und keine Aussage über die
Regel.

**Eine Messung, die nichts findet, ist auch ein Ergebnis.** Beim Zugeben als
Letzter und beim Abwerfen brachte keine einzige der geprüften Fassungen etwas –
und das heißt: Was dort steht, stimmt. Für das Abwerfen ist damit die
Streitfrage entschieden, ob man die kurze Farbe blank macht oder aus der langen
wirft. Die kurze, und die Gegenprobe kostet.

**Manche Regel ist gar keine.** „Wenn viel im Stich liegt, sticht man mit der
großen Karte" klingt zwingend und ist belanglos: Man holt den Stich mit beiden
Karten, die Augen darin fallen so oder so der eigenen Partei zu. Was allein
zählt, ist, welche der beiden man lieber behält. Das Kriterium herauszunehmen
brachte beiden Parteien rund einen halben Punkt. Und die Schwelle dafür, einen
Stich zu wagen, den einem noch jemand abnehmen kann, ist über den ganzen
Bereich von „ab vier Augen" bis „nie" **exakt wirkungslos** – der Fall kommt zu
selten vor, um zu zählen. Beides Stellschrauben, an denen man endlos hätte
drehen können.

**Auch eine richtige Regel kann in der falschen Auslegung schaden.** Nicht nur
„zu grob gefasst" – wirklich das Vorzeichen umdrehen, wie beim Nachspielen mit
kleiner statt hoher Karte.

**Und: Der erste Treffer ist meistens keiner.** „Langer Weg – lange Farbe" kam
beim Wenz zuerst auf −1,18 ± 1,00 und sah aus wie ein Fund. Mit 14 000 statt
4 000 Gaben blieben −0,50 ± 0,53 übrig, also nichts. Bei zwölf Vergleichen
nebeneinander liefert der Zufall ungefähr einen Treffer auf diesem Niveau —
wer den ersten nimmt und aufhört, baut sich sein Ergebnis selbst.

**Der Hinweisgeber schummelt nicht.** Er bekommt genau dieselbe Sicht wie ein
Gegner: dein Blatt und was liegt, sonst nichts. Ein Tipp kann deshalb
danebengehen – er ist der beste Zug nach dem, was man wissen kann, und nicht
nach dem, was zufällig der Fall ist. Andersherum wäre er als Lehrer wertlos:
Von jemandem, der in fremde Karten schaut, lernt man nichts.

**Die Karten sind selbst gezeichnet**, wie die Wortlisten und aus demselben
Grund – an einem gedruckten Kartensatz hängt eine fremde Lizenz. Vier gefüllte
Farbzeichen, der Wert zweimal auf der Karte. Ein verkleinerter Kupferstich wäre
auf fünfzig Pixeln ohnehin nur ein Fleck.

Eine Vereinfachung gegenüber dem Wirtshaus: Angesagt wird **einmal reihum ab
der Vorhand**, und wer ansagt, sagt gleich was. Die höhere Spielart sticht die
tiefere, bei gleichem Rang – Wenz gegen Geier – bleibt es beim Näheren an der
Vorhand. Das führt zum selben Ergebnis wie das übliche Hin und Her, nur
schneller. Laufende zählen ab drei, beim Wenz und Geier ab zwei.
