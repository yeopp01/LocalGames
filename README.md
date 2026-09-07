# LocalGames

Kleine Spiele für zwischendurch. Kein Konto, keine Anmeldung, kein fremder
Rechner, auf dem deine Partien liegen – die stehen im Speicher des Geräts, auf
dem die App läuft, und verlassen es nicht. Nach draußen geht einzig ein
anonymer Aufrufzähler; was der zählt, steht unten unter *Zählung*.

Enthalten sind bisher:

| Spiel | Kurz |
| --- | --- |
| **Wördle** | Fünf Buchstaben, sechs Versuche. Mit Tipp, Buchstaben-Hilfe und einem Rechner für den besten nächsten Zug. |
| **Mini-Sudoku** | 6 × 6 mit den Ziffern 1 bis 6, drei Stufen, Notizen, begründende Hinweise. |
| **Minenfeld** | Minesweeper in drei Größen, erster Klick immer sicher. |
| **2048** | Zahlen zusammenschieben, per Wischgeste oder Pfeiltaste. |
| **Galgenmännchen** | Buchstabe für Buchstabe, elf Fehler sind erlaubt. |
| **Vier gewinnt** | Gegen den Rechner in drei Stufen (Minimax mit Alpha-Beta) oder zu zweit an einem Gerät, Zug zurück. |
| **Nonogramm** | Aus Zahlen wird ein Bild, 5 × 5 bis 10 × 10. |
| **Zahlencode** | Mastermind mit Ziffern, mit rechnendem Vorschlag. |
| **Tango** | Sonne und Mond im Gleichgewicht, 6 × 6, immer ohne Raten lösbar. |
| **Damen** | Eine Dame je Zeile, Spalte und Farbgebiet, immer ohne Raten lösbar. |
| **Weg** | Ein Zug durch jedes Feld, die Zahlen der Reihe nach, auf „schwer" mit Mauern. |
| **Verräter** | Alle kennen dasselbe Wort, einer nicht. Zu dritt bis zu zwölft, auf einem Handy oder mit Code auf allen. |
| **Bombe** | Eine Silbe, ein Wort, schnell weitergeben – bis es knallt. Die Uhr läuft verdeckt. |
| **Zwei Wahrheiten** | Drei Sätze über sich, einer erfunden. Die anderen raten reihum und geheim. |
| **Wer am ehesten** | Eine Frage, geheime Stimmen, aufgedecktes Ergebnis. 45 Fragen, harmlos und frech. |
| **Schafkopf** | Bayrisch, zu viert, gegen drei rechnende Gegner. Sauspiel, Wenz, Geier, Solo – mit Lehrer, der sagt, was du hättest spielen sollen. |

Über allem liegt ein Dashboard mit der Spielauswahl und eine gemeinsame
Statistik über alle Partien, samt Sicherung zum Mitnehmen.

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

| Datei | Inhalt |
| --- | --- |
| `index.html` | Gerüst: Kopfzeile, Bühne, die beiden Blätter |
| `styles.css` | Aussehen, helle und dunkle Fassung, je ein Abschnitt pro Spiel |
| `app.js` | Der Rahmen: Auswahl, Navigation, Speicher, Statistik, Sicherung |
| `spiele/woerter.js` | Wortschatz für Wördle samt Tipps |
| `spiele/loeser.js` | Die Rechnung hinter dem Zug-Vorschlag |
| `spiele/begriffe.js` | Wortpaare für Verräter |
| `spiele/karten.js` | Das bayrische Blatt: Regeln, Abrechnung und der Kartenrechner |
| `spiele/runde.js` | Bausteine für die Spiele zu mehreren |
| `spiele/*.js` | je Datei ein Spiel |
| `version.js` | Die Versionsnummer, für Seite und Offline-Speicher |
| `sw.js` | Der Offline-Speicher |
| `icons/` | App-Icons |
| `schriften/` | Die beiden Schriften samt Lizenztexten |

### Änderungen ausrollen

Wenn an einer Datei etwas geändert wird, in `version.js` die `nummer`
hochzählen und `stand` setzen. Sonst zeigt das Handy weiter die alte Version
aus seinem Offline-Speicher.

Welche Version gerade läuft, steht in den Einstellungen unter „Nach einer
neuen Version suchen". Die Zahl kommt aus dem geladenen Code selbst, nicht
vom Offline-Speicher – der kann schon weiter sein, während die offene Seite
noch die alten Dateien ausführt. Der Knopf holt `version.js` frisch vom
Server, vergleicht die Nummern und schreibt das Ergebnis in dieselbe Zeile:
entweder „ist die neueste" oder er holt den neuen Bestand und lädt neu,
sobald der Worker übernommen hat.

Der Offline-Speicher ist dabei ein Jahrgang: Ein Lager wird bei der
Installation gefüllt und danach nicht mehr angefasst, alles kommt aus
demselben. Sonst träfe nach einem Ausrollen frisches HTML auf alten Code.

**Warum die Nummer in der Adresse des Workers steht.** Ein Service Worker
erneuert sich nur, wenn sich sein *Skript* ändert. Die Nummer stand aber lange
nicht in `sw.js`, sondern in der davon importierten `version.js` — und
eingebundene Skripte holt der Browser bei der Prüfung aus dem HTTP-Cache
(`updateViaCache` steht von Haus aus auf `'imports'`). GitHub Pages liefert mit
`max-age=600`. Zehn Minuten lang verglich der Browser also gegen eine alte
`version.js`, fand keinen Unterschied und installierte gar nichts. Auf dem
Gerät sah das aus, als bräche die Aktualisierung ab: Der Knopf meldete eine
neue Version, lud neu — und alles kam wieder aus dem alten Lager.

Angemeldet wird der Worker deshalb als `sw.js?v=<nummer>`, mit
`updateViaCache: 'none'`. Die Adresse eines Workers kommt nie aus dem Cache;
ist die Nummer darin, ist jede Version schlicht ein anderes Skript, und es gibt
nichts zu vergleichen. Das Lager benennt sich aus derselben Adresse und nur
ersatzweise aus dem Import — sonst bekäme es womöglich den Namen einer alten
Version. Der Knopf meldet zusätzlich ausdrücklich die Nummer an, die der Server
nennt, statt nur `update()` auf der alten Adresse aufzurufen.

Die Nummer steht damit weiterhin an genau einer Stelle: in `version.js`.

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

## Wördle im Detail

**Wortschatz.** 396 Lösungswörter, jedes mit einer Umschreibung, dazu 1226
weitere erlaubte Rateworte — zusammen 1622 gültige Eingaben. Alles genau fünf
Zeichen, Ä/Ö/Ü zählen als ein Zeichen und haben eigene Tasten, ß steht als SS
(`GROSS`, `SPASS`).

Die Liste ist von Hand geschrieben und hängt an keinem fremden Wörterbuch.
Das ist Absicht: die verbreiteten deutschen Wortlisten (igerman98, hunspell-de
und alles, was davon abstammt) stehen unter der GPL, und die würde sich beim
Veröffentlichen auf das ganze Projekt durchschlagen. So bleibt LocalGames frei
lizenzierbar.

Sie darf gern wachsen: neue Wörter kommen einfach in das Feld `WEITERE` in
`spiele/woerter.js` — fünf Zeichen, groß geschrieben, sonst nichts zu beachten.
Ein Lösungswort braucht zusätzlich seinen Tipp und gehört nach `LOESUNGEN`.

**Die drei Hilfen.**

* *Tipp* zeigt die Umschreibung des gesuchten Wortes.
* *Buchstabe* deckt den ersten noch verdeckten Buchstaben auf, beim nächsten
  Mal den zweiten und so fort.
* *Vorschlag* rechnet aus, wie es weitergehen sollte.

**Wie der Vorschlag rechnet.** Ganz ohne Sprachmodell, in zwei Schritten:

1. Aus allen bisherigen Rückmeldungen wird die Liste der noch möglichen
   Lösungen gefiltert. Doppelte Buchstaben werden dabei korrekt gezählt –
   `ESSEN` gegen `SONNE` ergibt gelb-gelb-grau-grau-gelb, nicht dreimal gelb.
2. Damit die Rechnung nicht spürbar wird, kommt bei mehr als 900 erlaubten
   Wörtern erst eine billige Vorauswahl: Wörter, deren Buchstaben in den
   übrigen Kandidaten häufig vorkommen, sind die aussichtsreichen. Nur die
   werden genau gerechnet — zusammen mit allen Kandidaten, die ja selbst noch
   die Lösung sein können.
3. Für jedes so ausgewählte Rateweort wird geschaut, in wie viele Gruppen es diese
   Restmenge zerlegt. Übrig bleiben im Schnitt `Σ (Gruppengröße²) / Gesamtzahl`
   Kandidaten – je kleiner dieser Wert, desto mehr verrät der Zug. Angezeigt
   werden die drei besten, und bei Gleichstand gewinnt ein Wort, das selbst
   noch die Lösung sein kann.

Das ist der Informationsgehalt (Entropie) eines Zuges, nur in der Form
„so viele Wörter bleiben danach übrig". Gemessen an der eigenen Wortliste
löst diese Strategie in im Schnitt **2,8 Zügen**, schlechtester Fall 5.
Der aufwendigste Aufruf – noch nichts geraten, alle 396 Kandidaten offen –
braucht rund 210 ms.

## Mini-Sudoku im Detail

Die Rätsel entstehen im Browser, nicht aus einer Liste: erst ein volles Gitter
per Backtracking, dann werden Felder in zufälliger Reihenfolge geleert, solange
die Lösung eindeutig bleibt. Geprüft wird das, indem der Löser bis zur *zweiten*
Lösung zählt und dann abbricht.

| Stufe | Vorgaben | Rechenzeit |
| --- | --- | --- |
| leicht | 20 | wenige Millisekunden |
| mittel | 15 | wenige Millisekunden |
| schwer | 11 | wenige Millisekunden |

Jedes ausgegebene Rätsel ist damit garantiert eindeutig lösbar.

## Minenfeld im Detail

Zwei Zugeständnisse an das Spielgefühl:

* Der **erste Klick ist immer sicher**. Die Minen werden erst danach verteilt,
  und zwar außerhalb des angetippten Feldes samt seiner acht Nachbarn – der
  Anfang ist also nie ein Rätselraten.
* Für Finger gibt es einen **Fahnen-Modus**; am Rechner geht weiter die rechte
  Maustaste, auf dem Handy zusätzlich langes Drücken.

Auf eine bereits offene Zahl zu tippen deckt die restlichen Nachbarn auf,
sobald genug Fahnen daneben stehen.

| Größe | Feld | Minen |
| --- | --- | --- |
| klein | 8 × 10 | 10 |
| mittel | 10 × 14 | 24 |
| groß | 12 × 18 | 40 |

## Verräter im Detail

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

## Die Spiele zu mehreren

Vier Spiele teilen sich `spiele/runde.js`. Der Baustein kennt kein Spiel,
sondern nur die Teile, die alle brauchen:

| Werkzeug | Wofür |
| --- | --- |
| `zufallAus(code)` | Der Würfel, der aus einem Text seine Folge ableitet – Grundlage des Code-Wegs bei Verräter. Ohne Startwert der gewöhnliche Zufall. |
| `aufbau(…)` | Spielerzahl und Namen |
| `codeAufbau(…)` | Code, Spielerzahl und „ich bin Nummer" auf einem Schirm |
| `weitergabe(…)` | Sperrschirm mit Namen, Halten zum Aufdecken, reihum |
| `stimmen(…)` / `auszaehlen(…)` | Geheime Abstimmung und ihre Auszählung |
| `uhr(…)` | Rücklaufende Uhr, wahlweise verdeckt und mit Streuung |

Der Sperrschirm ist dabei das eigentliche Stück Arbeit: ohne ihn steht das
Geheimnis schon auf dem Bildschirm, während das Gerät noch in der Luft ist.

## Bombe im Detail

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

## Zwei Wahrheiten im Detail

Einer schreibt drei Sätze über sich auf, zwei stimmen. Dann wandert das Gerät,
und jeder andere tippt auf den, den er für gelogen hält.

Die drei Sätze werden vor dem Raten **gemischt**. Ohne das gewöhnt sich die
Runde daran, dass die Lüge immer an derselben Stelle steht – Leute schreiben
sie gern zuletzt.

Das Gerät prüft nichts nach; es hält nur auseinander, wer was sehen darf. Beim
Schreiben liegt ein Sperrschirm davor, beim Raten auch – wer als Zweiter rät,
sieht die Stimme des Ersten nicht.

## Wer am ehesten im Detail

Eine Frage wird vorgelesen, das Gerät wandert, jeder tippt heimlich auf einen
Namen, dann werden alle Stimmen auf einmal aufgedeckt. Sich selbst kann niemand
wählen.

45 Fragen liegen bereit, harmlose und freche; innerhalb eines Abends kommt
keine zweimal. Es gibt keinen Sieger – das Spiel notiert deshalb kein
`gewonnen` und meldet sich mit `ohneSiege` an; siehe *Partien ohne Urteil*.

Eine „Partie" ist hier der ganze Abend und nicht die einzelne Frage. Sonst
stünden nach einer Viertelstunde vierzig Einträge in der Statistik.

## Schafkopf im Detail

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

### Was von den Merksätzen übrig blieb

Alle bisher geprüften, jeder in der Fassung, die tatsächlich gemessen wurde.
Gemessen wird immer paarweise – dieselben Gaben mit und ohne Regel – und
getrennt danach, welche Partei sie anwendet.

| Merksatz | Fassung | Wirkung | |
| --- | --- | --- | --- |
| Mit der teuren Karte stechen, wenn der Stich hält | außer sie ist der höchste Trumpf | +1,9 Sauspiel, **+7,6** Solo | eingebaut |
| Blanke Sau anspielen | *nicht* als Alleinspieler bei Wenz/Geier | +3,4 Wenz, +2,8 Geier | eingebaut |
| Den höchsten Trumpf anspielen, der noch draußen ist | auch mit nur einem Trumpf | +0,56 ± 0,36 Sau, +0,63 ± 0,32 Solo | eingebaut |
| Als Spielerpartei Trumpf ziehen | pauschal, immer | −1,9 Sauspiel, −4,2 Solo | verworfen |
| Als Gegenspieler die Rufsau suchen | pauschal, immer | −1,2 | verworfen |
| Nachspielen | Farbe der eigenen Partei fortsetzen | ±0,4, kein Unterschied | verworfen |
| Nachspielen gegen ein Solo | **hohe** Karte in eine Farbe, in der der Mitspieler frei ist | **−3,2 / −3,8** für die Spielerpartei | eingebaut |
| dasselbe mit kleiner Karte | sonst gleich | +5,0 bis +5,5, also schädlich | verworfen |
| dasselbe, Spieler muss bedienen | zusätzliche Bedingung | −0,8, Wirkung weg | verworfen |
| Kurzer Weg – lange Farbe | nur die Farbwahl, überstimmt nichts | ±0,4, kein Unterschied | offen |
| Langer Weg – lange Farbe | dieselbe enge Fassung | −0,5 ± 0,5, nicht bestätigt | offen |
| Farbeln: längste Farbe spielen | dieselbe enge Fassung | ±0,6, kein Unterschied | offen |
| Weg-Regeln und Farbeln | als Vorrang **über** Trumpfziehen | −3,2 bis −3,9 | verworfen |

Die vorletzte Zeile ist die lehrreichste. Der Merksatz „spiel die Farbe nach,
in der dein Partner schon frei ist" stimmt — aber nur mit einer **hohen**
Karte. Mit der kleinsten angespielt verbrennt der Partner einen Trumpf für
einen Stich ohne Augen, und aus dem Gewinn von drei Punkten wird ein Verlust
von fünf. Zwischen der richtigen und der schädlichen Auslegung desselben
Satzes liegen acht Punkte.

Ebenso gegen die Erwartung: Jede Zusatzbedingung *schwächt* die Regel. Verlangt
man, dass der Alleinspieler die Farbe noch bedienen muss — was nach der besten
Gelegenheit klingt —, bleibt von −3,2 nur −0,8 übrig.

Drei Lehren stehen darin.

**Die Fassung entscheidet über das Ergebnis, nicht der Merksatz.** Dieselben
drei Regeln sind als Vorrang über alles ein Verlust von fast vier Punkten und
als bloße Farbwahl wirkungslos. Wer eine Regel prüft, prüft immer eine ganz
bestimmte Auslegung von ihr – und muss sie deshalb hinschreiben.

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

## Statistik

Jede beendete Partie wird als ein Eintrag festgehalten: Spiel, Zeitpunkt,
gewonnen oder nicht, Dauer – dazu, was das jeweilige Spiel für wichtig hält
(Züge und genutzte Hilfen bei Wördle, Stufe bei Sudoku und Minenfeld).

Daraus rechnet die Statistik-Ansicht:

* insgesamt: Partien, Siegquote, Spielzeit, Tage in Folge
* die letzten fünf Wochen als Punktraster
* je Spiel die eigenen Kennzahlen – bei Wördle zusätzlich die Verteilung,
  in wie vielen Zügen gelöst wurde

Die Tagesserie reißt nicht schon dadurch, dass heute noch nicht gespielt wurde –
erst ein ganzer ausgelassener Tag beendet sie.

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

Warum überhaupt lokal: Wer die Seite öffnet, soll nicht nebenbei Google
begegnen. Nach dem Umzug spricht die App beim Laden mit genau zwei Stellen –
GitHub, das die Dateien ausliefert, und dem Zähler oben. Bricolage ist eine
variable Schrift, eine Datei deckt die Gewichte 400 bis 800 ab; zusammen mit
DM Mono sind es 153 kB, die einmal geladen und dann offline vorgehalten werden.
