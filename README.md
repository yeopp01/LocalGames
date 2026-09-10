# LocalGames

Kleine Spiele für zwischendurch. Kein Konto, keine Anmeldung, kein fremder
Rechner, auf dem deine Partien liegen – die stehen im Speicher des Geräts, auf
dem die App läuft, und verlassen es nicht. Nach draußen geht einzig ein
anonymer Aufrufzähler; was der zählt, steht unten unter *Zählung*.

Enthalten sind bisher:

| Spiel | Kurz |
| --- | --- |
| [**Wördle**](specs/20-wortspiele/wordle.md) | Fünf Buchstaben, sechs Versuche. Mit Tipp, Buchstaben-Hilfe und einem Rechner für den besten nächsten Zug. |
| [**Mini-Sudoku**](specs/10-raetsel/sudoku.md) | 6 × 6 mit den Ziffern 1 bis 6, drei Stufen, Notizen, begründende Hinweise. |
| [**Minenfeld**](specs/10-raetsel/minen.md) | Minesweeper in drei Größen, erster Klick immer sicher. |
| [**2048**](specs/30-brett-und-karten/zweitausend.md) | Zahlen zusammenschieben, per Wischgeste oder Pfeiltaste. |
| [**Galgenmännchen**](specs/20-wortspiele/galgen.md) | Buchstabe für Buchstabe, elf Fehler sind erlaubt. |
| [**Vier gewinnt**](specs/30-brett-und-karten/viergewinnt.md) | Gegen den Rechner in drei Stufen (Minimax mit Alpha-Beta) oder zu zweit an einem Gerät, Zug zurück. |
| [**Nonogramm**](specs/10-raetsel/nonogramm.md) | Aus Zahlen wird ein Bild, 5 × 5 bis 10 × 10. |
| [**Zahlencode**](specs/10-raetsel/mastermind.md) | Mastermind mit Ziffern, mit rechnendem Vorschlag. |
| [**Tango**](specs/10-raetsel/tango.md) | Sonne und Mond im Gleichgewicht, 6 × 6, immer ohne Raten lösbar. |
| [**Damen**](specs/10-raetsel/queens.md) | Eine Dame je Zeile, Spalte und Farbgebiet, immer ohne Raten lösbar. |
| [**Weg**](specs/10-raetsel/zip.md) | Ein Zug durch jedes Feld, die Zahlen der Reihe nach, auf „schwer" mit Mauern. |
| [**Verräter**](specs/40-zu-mehreren/verraeter.md) | Alle kennen dasselbe Wort, einer nicht. Zu dritt bis zu zwölft, auf einem Handy oder mit Code auf allen. |
| [**Bombe**](specs/40-zu-mehreren/bombe.md) | Eine Silbe, ein Wort, schnell weitergeben – bis es knallt. Die Uhr läuft verdeckt. |
| [**Zwei Wahrheiten**](specs/40-zu-mehreren/wahrheiten.md) | Drei Sätze über sich, einer erfunden. Die anderen raten reihum und geheim. |
| [**Wer am ehesten**](specs/40-zu-mehreren/amehesten.md) | Eine Frage, geheime Stimmen, aufgedecktes Ergebnis. 45 Fragen, harmlos und frech. |
| [**Schafkopf**](specs/30-brett-und-karten/schafkopf.md) | Bayrisch, zu viert, gegen drei rechnende Gegner. Sauspiel, Wenz, Geier, Solo – mit Lehrer, der sagt, was du hättest spielen sollen. |

Über allem liegt ein Dashboard mit der Spielauswahl und eine gemeinsame
Statistik über alle Partien, samt Sicherung zum Mitnehmen. Was jedes Spiel
genau können soll – und was davon noch offen ist –, steht in seiner Spec; der
Name in der Tabelle führt hin.

## Am PC ausprobieren

Im Ordner `LocalGames` ein Terminal öffnen und eingeben:

```
npx serve -l 4173 .
```

Dann im Browser `http://localhost:4173/` aufrufen. Zum Beenden `Strg + C`.

Direkt per Doppelklick auf `index.html` geht es auch, nur der Offline-Speicher
(Service Worker) bleibt dann aus – der braucht `http://` oder `https://`.

## Aufs Handy bringen

Die Dateien müssen einmalig unter einer `https://…`-Adresse liegen — danach
lädt das Handy die App herunter und startet sie offline vom Icon.

1. Dateien auf GitHub Pages oder Netlify ablegen.
2. Die Adresse einmal in Chrome auf dem Handy öffnen.
3. Menü (drei Punkte) → **App installieren** bzw. **Zum Startbildschirm hinzufügen**.

## Sicherung

Menü (drei Punkte oben rechts) → **Statistik sichern** legt eine JSON-Datei mit
allen Partien an. **Statistik einlesen** holt sie zurück und **führt zusammen**,
statt zu ersetzen: jede Partie trägt eine Kennung, und schon vorhandene werden
übersprungen. So lassen sich auch zwei Geräte zusammenlegen.

Laufende Partien (halb gelöstes Sudoku, angefangenes Wort) sind bewusst *nicht*
Teil der Sicherung – die gehören zum Gerät.

## Zählung

Eine einzige Sache verlässt das Gerät: beim Öffnen meldet
[GoatCounter](https://www.goatcounter.com) einen Aufruf an
`yeopp01.goatcounter.com`, und beim Ablegen auf dem Startbildschirm ein
Ereignis `app-installiert`. Kein Cookie, keine Kennung, keine IP-Speicherung –
und nichts aus der Statistik oder aus laufenden Partien. Das Script hängt
unten in `index.html`, das Ereignis in `app.js` neben `beforeinstallprompt`.

Dazu meldet jeder Spielstart ein Ereignis `spiel/<id>` – die einzige Zahl, die
verrät, was hier eigentlich gespielt wird. Auch die ohne Bezug zu einem Gerät:
gezählt wird, *dass* Damen gestartet wurde, nicht *von wem*.

Wer offline vom Icon spielt, wird nicht gezählt; das lässt sich nicht ändern
und ist auch nicht schlimm. Wer gar nicht zählen will, löscht die zwei Zeilen
in `index.html` – die App läuft unverändert weiter.

## Was wo steht

| Ort | Inhalt |
| --- | --- |
| `index.html` | Gerüst: Kopfzeile, Bühne, die beiden Blätter |
| `styles.css` | Aussehen, helle und dunkle Fassung, je ein Abschnitt pro Spiel |
| `app.js` | Der Rahmen: Auswahl, Navigation, Speicher, Statistik, Sicherung |
| `spiele/*.js` | je Datei ein Spiel |
| `spiele/woerter.js` | Wortschatz für Wördle samt Tipps |
| `spiele/loeser.js` | Die Rechnung hinter dem Zug-Vorschlag |
| `spiele/begriffe.js` | Wortpaare für Verräter |
| `spiele/karten.js` | Das bayrische Blatt: Regeln, Abrechnung und der Kartenrechner |
| `spiele/runde.js` | Bausteine für die Spiele zu mehreren |
| `version.js` | Die Versionsnummer, für Seite und Offline-Speicher |
| `sw.js` | Der Offline-Speicher |
| `icons/` | App-Icons |
| `schriften/` | Die beiden Schriften samt Lizenztexten |
| [`specs/`](specs/README.md) | Was die App können soll: je Spiel und für den Rahmen Zweck, Akzeptanzkriterien mit Status, Randfälle und der Hintergrund, warum es so gebaut ist |
| [`pruefung/`](pruefung/README.md) | Der Prüfstand: Wächter, E2E-Tests, Board und Bericht |

Die App sind die Dateien bis einschließlich `schriften/` – ohne Build und ohne
Paket. `specs/` und `pruefung/` gehören zur Entwicklung; nur der Prüfstand hat
ein `package.json`, und das nur für Playwright.

### Änderungen ausrollen

Wenn an einer ausgelieferten Datei etwas geändert wird, in `version.js` die
`nummer` hochzählen und `stand` setzen. Sonst zeigt das Handy weiter die alte
Version aus seinem Offline-Speicher – der Wächter erinnert daran. Wie die
Aktualisierung abläuft und warum die Nummer in der Adresse des Service Workers
steht: [Offline und Versionen](specs/00-rahmen/offline.md).

## Prüfen

Einmalig `npm --prefix pruefung install` – das holt Playwright, nur für den
Prüfstand. Danach:

```
node pruefung/pruefen.mjs               # Wächter, E2E-Tests auf Handy und Laptop, Bericht
node pruefung/pruefen.mjs --ohne-e2e    # nur Wächter und Bericht, in Sekunden
node pruefung/ansehen.mjs "#/spiel/minen" --geraet laptop   # eine Ansicht als Bild
```

Der Bericht `pruefung/bericht/index.html` lässt sich per Doppelklick öffnen.
Er zeigt jedes Akzeptanzkriterium mit Status – filterbar, durchsuchbar –, den
letzten Prüflauf und den Fortschritt je Tag aus der Git-Historie. Was offen
ist, steht außerdem zeilenweise in [`specs/BOARD.md`](specs/BOARD.md).

## Ein Spiel dazu bauen

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

Dann:

1. `<script>` in `index.html` und den Pfad in `sw.js` ergänzen, `version.js`
   hochzählen.
2. Eine Spec `specs/<bereich>/<id>.md` mit Akzeptanzkriterien anlegen und das
   Board neu schreiben: `node pruefung/skripte/spec-board.mjs`.
3. Eine Zeile in der Spieltabelle oben, der Name verlinkt auf die Spec.

Das Dashboard, die Statistik, die Sicherung und die Rauchtests nehmen das
Spiel von allein auf; der Wächter meldet, was vergessen wurde. Was die Sitzung
bietet und welche Verträge gelten – etwa für Partien ohne Sieger –, steht in
der [Spielschnittstelle](specs/00-rahmen/schnittstelle.md).

## Schafkopf im Detail

> Zieht nach [specs/30-brett-und-karten/schafkopf.md](specs/30-brett-und-karten/schafkopf.md)
> um, sobald die laufende Arbeit an Schafkopf eingecheckt ist. Die
> Akzeptanzkriterien stehen schon dort.

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

## Lizenz

MIT – siehe [LICENSE](LICENSE), Herkunft aller Bestandteile in [NOTICE](NOTICE). Kurz: nutzen, ändern, weitergeben, auch
kommerziell, ohne Rückfrage. Einzige Bedingung ist, dass der Lizenztext mit
der Copyright-Zeile beim Weitergeben dabeibleibt. Ohne Gewähr.

Der Code und die Wortliste sind selbst geschrieben – daran hängt keine fremde
Lizenz.

Die beiden Schriften liegen in [`schriften/`](schriften/) und werden von dort
geladen, nicht von Google. Sie stehen unter der **SIL Open Font License 1.1**,
die verlangt, dass ihr Lizenztext mitgeliefert wird; er liegt als
`OFL-Bricolage-Grotesque.txt` und `OFL-DM-Mono.txt` daneben. Die OFL steckt
das Projekt nicht an: Sie gilt für die Schriftdateien, nicht für den Code
drumherum. Der bleibt MIT.

Warum die Schriften lokal liegen und nicht von Google kommen, steht unter
[Datenschutz](specs/00-rahmen/datenschutz.md).
