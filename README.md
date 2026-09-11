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
| [**Schlange**](specs/50-geschick/snake.md) | Snake wie auf dem alten Handy: wischen, fressen, wachsen. Schnelle Kehren merkt sie sich. |
| [**Invasoren**](specs/50-geschick/invaders.md) | Space Invaders für den Daumen: ziehen lenkt, berühren feuert. Deckungen, die zerbröseln. |
| [**Flattervogel**](specs/50-geschick/flappy.md) | Flappy Bird: ein Tipp, ein Flügelschlag, durch die Lücke. Etwas gnädiger als das Vorbild. |
| [**Hochhinaus**](specs/50-geschick/doodle.md) | Doodle Jump auf Karopapier: halten oder Handy neigen, Federn, wandernde und brüchige Plattformen. |

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
| `spiele/echtzeit.js` | Leinwand, Spielschleife und Pause für die Geschicklichkeitsspiele |
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
