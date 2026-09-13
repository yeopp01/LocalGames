# Tiere

**Datei:** [`spiele/tiere.js`](../../spiele/tiere.js)
**Stand:** 20/20 fertig

## Zweck

Kein Spiel, sondern das Werkzeug hinter den Kinderspielen. Ein Kind von
anderthalb Jahren tippt mit der ganzen Hand, wischt quer über alles und kann
nicht lesen. Was die Kinderspiele deshalb teilen – die Tiere mit Bild, Ruf,
Futter und Aufnahme, der Klang und das Kinderzimmer, aus dem nur Erwachsene
wieder herausfinden –, steht hier einmal. Es kennt kein einzelnes Spiel.

## Akzeptanzkriterien

### Tiere und Aufnahmen

- **AC-1** `fertig` **Jedes Tier vollständig** — Jedes Tier hat Kennung,
  Name mit Artikel, ein Emoji als Bild – bis Unicode 13 (2020), jüngere nur
  mit der Prüfung aus AC-18 –, einen Ort und eine Farbe. Einen Ton hat nur ein
  Tier mit Ruf und Aufnahme. Jedes Futter gehört genau einem Tier.
- **AC-2** `fertig` **Aufnahmen frei und im Lager** — Jede Aufnahme liegt
  als `toene/<id>.mp3` vor, steht in `GRUNDBESTAND` und in `NOTICE` mit
  Quelle, Urheber und Lizenz. Erlaubt sind nur gemeinfreie Aufnahmen, CC0,
  CC BY und CC BY-SA. Der Wächter meldet eine Datei, die im Lager oder in
  `NOTICE` fehlt.
- **AC-3** `fertig` **Aufnahmen gleich laut** — Jede Aufnahme ist mono,
  kurz (unter 3,6 s), auf etwa −16 LUFS angeglichen und übersteuert nicht
  (Spitze höchstens −1,5 dBTP). Löwe, Wolf und Elefant spielen zusätzlich
  leiser, weil ihr Ruf auch bei gleicher Lautheit erschreckt.
- **AC-17** `fertig` **Mehrere Aufnahmen je Tier** — Hat ein Tier mehrere
  Aufnahmen (`<id>.mp3`, `<id>-2.mp3`, …), tönt bei jedem Ruf zufällig eine
  davon, nie zweimal hintereinander dieselbe. Vorab geholt werden alle.
- **AC-18** `fertig` **Junge Emoji nur, wo sichtbar** — Ein Tier, dessen
  Emoji erst mit Unicode 15 kam, erscheint nur, wenn das Gerät es farbig
  zeichnet. Sonst fehlt es in allen Kinderspielen, statt als leeres Kästchen
  zu rufen.

### Klang

- **AC-4** `fertig` **Ein Ruf zur Zeit** — Ein neuer Ruf beendet den
  laufenden mit einer kurzen Blende. Ein Ruf, der noch lädt, während schon
  der nächste angefordert ist, bleibt stumm.
- **AC-5** `fertig` **Ton ab dem ersten Tipp** — Die Aufnahmen werden schon
  geholt, während der Vorhang steht; der Ton wird im Tipp auf „Los geht's"
  eingeschaltet, weil Browser ihn vorher stumm lassen. Ohne Web Audio laufen
  die Spiele stumm, und ein Spiel, das ohne Ton nicht geht, sperrt „Los
  geht's" mit einem Hinweis.
- **AC-6** `fertig` **Kaputter Ton bleibt still** — Fehlt eine Aufnahme
  oder lässt sie sich nicht lesen, bleibt das Tier stumm. Das Spiel läuft
  weiter, nichts wirft, und in der Konsole steht kein Fehler außer dem
  fehlgeschlagenen Laden selbst.
- **AC-19** `fertig` **Name und Ruf nahtlos** — Ein Spiel kann dem Ruf den
  gesprochenen Namen mit Artikel voranstellen (`toene/name-<id>.mp3`). Der Ruf
  beginnt 0,2 s nach dem Ende des Namens; ein neuer Ruf stoppt beide, auch
  einen Ruf, der noch gar nicht begonnen hat. Fehlt die Ansage eines Tiers,
  kommt nur der Ruf. Die Ansagen sind mit einer freien Stimme erzeugt, stehen
  in `NOTICE` und liegen einheitlich knapp unter den Rufen (um −20 LUFS,
  gemessen mit Stille dahinter; Spitze höchstens −1 dBTP), damit das Tier die
  Hauptsache bleibt.

### Vorhang

- **AC-7** `fertig` **Vorhang vor dem Zimmer** — Jedes Kinderspiel öffnet
  mit einem Vorhang für die Eltern: ein paar Bilder, ein Satz, was passiert,
  bei Spielen mit Stufen die Wahl der Stufe (gemerkt, auch über Neuladen),
  „Los geht's" und der Hinweis, wie man beendet und wie man das Handy
  festsetzt („App anheften" unter Android, „Geführter Zugriff" am iPhone).
  Kopfzeile und Zurück funktionieren wie bei jedem Spiel.
- **AC-20** `fertig` **Schalter der Eltern** — Ein Spiel kann auf dem
  Vorhang Ein/Aus-Schalter anbieten, für Vorleser als Schalter erkennbar. Die
  Wahl bleibt gemerkt, auch über Neuladen; ein unlesbarer gemerkter Wert ergibt
  die Vorgabe. Im Zimmer gibt es keinen Schalter.

### Kinderzimmer

- **AC-8** `fertig` **Zimmer deckt alles ab** — Nach „Los geht's" liegt
  das Kinderzimmer über dem ganzen Fenster, auch über der Kopfzeile. Kein Knopf
  des Rahmens ist zu treffen, und nichts im Zimmer scrollt oder zoomt.
- **AC-9** `fertig` **Heraus nur durch Halten** — Oben rechts steht ein
  blasses ×. Ein kurzer Tipp darauf zeigt nur „Zum Beenden gedrückt halten".
  Erst nach 1,5 s Halten schließt das Zimmer; ein Ring um das × zeigt, wie weit
  es ist. Escape, genauso lange gehalten, wirkt wie der Knopf.
- **AC-10** `fertig` **Zweite Hand bricht ab** — Liegt beim Aufsetzen auf
  das × schon ein anderer Finger auf dem Zimmer, beginnt kein Halten; kommt
  währenddessen einer dazu, bricht es ab.
- **AC-11** `fertig` **Kein Menü, nichts markiert** — Langes Drücken im
  Zimmer öffnet kein Kontextmenü, markiert keinen Text und zieht kein Bild
  heraus. Tasten ohne Strg, Alt oder Meta lösen im Browser nichts aus – kein
  Scrollen, kein Tab aus dem Zimmer, kein Neuladen mit F5.
- **AC-12** `fertig` **Vollbild und wacher Bildschirm** — Wo der Browser es
  erlaubt, geht das Zimmer ins Vollbild und hält den Bildschirm wach. Beides
  endet mit dem Zimmer. Erlaubt der Browser es nicht, geht es ohne.
- **AC-13** `fertig` **Uhr ohne Hintergrund** — Die Zeit im Zimmer zählt nur,
  solange die Seite zu sehen ist. Im Hintergrund schläft der Ton.
- **AC-14** `fertig` **Schließen räumt auf** — Schließt das Zimmer – durch
  Halten oder weil das Spiel auf anderem Weg verlassen wird –, enden alle Uhren
  und Listener, die über das Zimmer laufen, das Spiel bekommt sein `ende()`,
  der Vorhang steht wieder da, und das Spiel erfährt die Zeit im Zimmer. Was
  danach noch eingeplant wird, läuft nicht mehr.

### Gemeinsamer Vertrag der Kinderspiele

- **AC-15** `fertig` **Partien ohne Urteil** — Tierstimmen, Futterzeit und
  Horch mal melden sich mit `ohneSiege: true` an und notieren nie `gewonnen`.
  Ein Besuch im Zimmer, in dem nichts geschah, landet nicht in der Statistik.
- **AC-16** `fertig` **Kein Fehlerton, kein Rot** — Kein Kinderspiel hat
  einen Ton oder eine Farbe für „falsch". Eine falsche Wahl wackelt und geht
  zurück.

## Randfälle

| #    | Fall                                                  | Erwartetes Verhalten                                                     |
| ---- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| RF-1 | Kind wischt mit der Zurück-Geste aus dem Spiel        | Das Zimmer schließt wie beim Halten, die Runde wird notiert.             |
| RF-2 | Handy geht während des Zimmers in den Hintergrund     | Ton schläft, Uhr steht; beim Zurückkommen geht es mit dem nächsten Tipp weiter. |
| RF-3 | Neuladen, während das Zimmer offen ist                | Der Vorhang steht da; die Stufe ist gemerkt.                             |
| RF-4 | Ganze Hand liegt auf dem Glas, ein Finger auf dem ×   | Kein Halten beginnt.                                                     |
| RF-5 | Offline, Aufnahmen im Lager                           | Alle Rufe tönen.                                                         |

## Hintergrund

**Warum Emoji statt Zeichnungen:** Sie sind auf jedem Gerät da, groß, bunt und
ohne eine einzige Datei. Eine Kuh sieht am iPhone anders aus als unter
Android, bleibt aber eine Kuh. Esel und Gans kamen erst mit Unicode 15 (2022)
und erschienen auf älteren Geräten als leeres Kästchen; sie stehen deshalb nur
da, wo das Gerät sie farbig zeichnet (AC-18). Für den Kuckuck gibt es gar kein
Emoji, und ein allgemeiner Vogel wäre von der Amsel nicht zu unterscheiden.

**Warum Web Audio statt `<audio>`:** Ein `<audio>` braucht auf manchen
Handys spürbar, bis es tönt, und ein Kind hat bis dahin schon das nächste
Tier gedrückt. Einmal dekodiert, spielt ein Puffer sofort, und ein neuer Ruf
kann den alten sauber ausblenden.

**Warum Halten und nicht zwei Finger:** Zwei Finger gibt es am Laptop nicht,
und Babys legen ohnehin gern die ganze Hand auf. Halten allein genügt aber
auch nicht: Ein Daumen bleibt leicht anderthalb Sekunden in der Ecke liegen.
Deshalb zählt das Halten nur, solange sonst nichts das Glas berührt.

**Was das Zimmer nicht verhindern kann:** Zurück-Geste, Startknopf und
Benachrichtigungen gehören dem Betriebssystem. Das Vollbild fängt unter
Android die erste Zurück-Geste ab, mehr nicht. Wirklich festsetzen lässt
sich nur das Handy selbst: „App anheften" unter Android, „Geführter Zugriff"
am iPhone. Der Vorhang sagt das den Eltern.

**Die Aufnahmen** stammen von Wikimedia Commons, sind auf einen einzigen Ruf
geschnitten, mono, als MP3 mit 64 kbit/s und auf gleiche Lautheit gebracht
(gemessen −16,3 bis −17,6 LUFS, das Knabbern −18,3; True Peak überall
höchstens −1,5 dBTP). Zusammen sind es 36 Aufnahmen für 30 Tiere und das
Knabbern, gut 510 KB; Hund und Katze haben je drei, das Pferd zwei. Wer welche
Aufnahme gemacht hat und unter welcher Lizenz sie steht, steht in
[`NOTICE`](../../NOTICE); jede Lizenz ist gegen die Commons-API nachgeprüft.
Verworfen wurden Aufnahmen, deren Hochlader sie als eigenes Werk ausgab,
obwohl die Quelle eine kommerzielle Geräuschsammlung nennt.

Manche Tiere klingen anders, als das Bild verspricht, weil es nichts Besseres
Freies gab: Die „Biene" ist eine Hummel, der „Frosch" ein knarrender Seefrosch
statt eines Quak, der Tiger jault eher, als dass er brüllt, die Gans
schnattert im Chor, und das Trompeten des Elefanten ist kurz und leicht
verrauscht. Für Maus, Bär, Seehund, Gorilla, Kamel, Delfin, Schlange, Mücke
und Fliege fand sich keine freie Aufnahme, die taugt – nur Ultraschall aus dem
Labor, Kampfgebrüll, stumme Zoo-Videos oder Aufnahmen, in denen das Tier kaum
lauter ist als die Umgebung. Die Maus bleibt deshalb stumm, die anderen
fehlen; Hase und Eichhörnchen haben keinen Ruf, den ein Kind kennt.

Die gesprochenen Namen (AC-19) sind mit Piper und der Stimme „Thorsten"
erzeugt, deren Datensatz unter CC0 steht. Gemessen wird ihre Lautheit mit
einer Sekunde Stille dahinter: Die Namen sind kürzer als das 400-ms-Fenster
der Messung, und ohne die Stille galt „Der Hund." als unmessbar leise und
wurde um über 50 dB verstärkt.
