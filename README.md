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
| `spiele/runde.js` | Bausteine für die Spiele zu mehreren |
| `spiele/*.js` | je Datei ein Spiel |
| `fassung.js` | Die Fassungsnummer, für Seite und Offline-Speicher |
| `sw.js` | Der Offline-Speicher |
| `icons/` | App-Icons |
| `schriften/` | Die beiden Schriften samt Lizenztexten |

### Änderungen ausrollen

Wenn an einer Datei etwas geändert wird, in `fassung.js` die `nummer`
hochzählen und `stand` setzen. Sonst zeigt das Handy weiter die alte Fassung
aus seinem Offline-Speicher.

Welche Fassung gerade läuft, steht in den Einstellungen unter „Nach einer
neuen Fassung suchen". Die Zahl kommt aus dem geladenen Code selbst, nicht
vom Offline-Speicher – der kann schon weiter sein, während die offene Seite
noch die alten Dateien ausführt. Derselbe Knopf holt die neue Fassung und
lädt neu, sobald sie übernommen hat.

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
