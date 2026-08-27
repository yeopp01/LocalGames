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
| **Vier gewinnt** | Gegen den Rechner, drei Stufen, Minimax mit Alpha-Beta, Zug zurück. |
| **Nonogramm** | Aus Zahlen wird ein Bild, 5 × 5 bis 10 × 10. |
| **Zahlencode** | Mastermind mit Ziffern, mit rechnendem Vorschlag. |
| **Tango** | Sonne und Mond im Gleichgewicht, 6 × 6, immer ohne Raten lösbar. |
| **Damen** | Eine Dame je Zeile, Spalte und Farbgebiet, immer ohne Raten lösbar. |
| **Weg** | Ein Zug durch jedes Feld, die Zahlen der Reihe nach. |

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
| `spiele/*.js` | je Datei ein Spiel |
| `sw.js` | Der Offline-Speicher |
| `icons/` | App-Icons |
| `schriften/` | Die beiden Schriften samt Lizenztexten |

### Änderungen ausrollen

Wenn an einer Datei etwas geändert wird, in `sw.js` die Zahl in
`const LAGER = 'localgames-v1'` hochzählen. Sonst zeigt das Handy weiter die
alte Fassung aus seinem Offline-Speicher.

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
