# Wördle

**Datei:** [`spiele/wordle.js`](../../spiele/wordle.js) · [`spiele/woerter.js`](../../spiele/woerter.js) · [`spiele/loeser.js`](../../spiele/loeser.js)
**Stand:** 23/24 fertig · 1 offen

## Zweck

Das bekannte Worträtsel auf Deutsch: ein Wort mit fünf Buchstaben in sechs
Versuchen finden, Umlaute eingeschlossen. Wer festhängt, holt sich eine von drei
Hilfen – bis hin zu einem Vorschlag, der ausrechnet, welcher Zug am meisten
verrät. Der Wortschatz ist selbst geschrieben und liegt auf dem Gerät.

## Akzeptanzkriterien

### Regeln und Eingabe

- **AC-1** `fertig` **Fünf Buchstaben, sechs Versuche** — Gesucht ist ein
  zufällig gezogenes Lösungswort mit fünf Buchstaben; das Gitter hat sechs
  Zeilen. Unter dem Titel steht „5 Buchstaben · 6 Versuche".
- **AC-2** `fertig` **Bildschirmtastatur mit Umlauten** — Die Tafel folgt in drei
  Reihen dem QWERTZ-Muster, mit eigenen Tasten für Ä, Ö und Ü sowie „Prüfen" und
  „Löschen". Nach dem Ende der Partie ist sie ausgeblendet.
- **AC-3** `fertig` **Buchstaben an jede Stelle** — Die Eingabe hat feste Plätze.
  Ein Tipp auf ein Feld der aktuellen Zeile setzt den Schreibplatz dorthin; nach
  jedem Buchstaben springt er auf die nächste Lücke dahinter, sonst vorne weiter,
  und bleibt bei voller Zeile stehen. „Löschen" leert den Schreibplatz, ist der
  leer, den nächsten beschriebenen Platz davor.
- **AC-4** `fertig` **Physische Tastatur** — Buchstaben samt ä, ö, ü gehen ohne
  Rücksicht auf Groß- und Kleinschreibung, Enter prüft, die Rücktaste löscht,
  Pfeil links und rechts verschieben den Schreibplatz ringsum. Tasten mit Strg,
  Alt oder Meta und jede Taste bei offenem Blatt werden nicht verarbeitet.
- **AC-5** `fertig` **Nur gültige Wörter** — Eine unvollständige Zeile meldet
  „Noch nicht genug Buchstaben.", ein Wort, das weder Lösungswort noch weiteres
  Rateweort ist, „Das Wort kenne ich nicht." In beiden Fällen rüttelt die Zeile
  kurz, und es wird kein Versuch verbraucht.

### Rückmeldung

- **AC-6** `fertig` **Drei Farben je Feld** — Nach dem Prüfen bleibt das Wort in
  seiner Zeile stehen: grün steht an der richtigen Stelle, gelb kommt im Wort vor,
  aber woanders, grau kommt nicht (mehr) vor.
- **AC-7** `fertig` **Doppelte Buchstaben richtig gezählt** — Grün wird zuerst
  vergeben, gelb danach von links und nur so oft, wie der Buchstabe im
  Lösungswort noch übrig ist. `ESSEN` gegen `SONNE` ergibt
  gelb-gelb-grau-grau-gelb, `SONNE` gegen `ESSEN` gelb-grau-gelb-grau-gelb.
- **AC-8** `fertig` **Tastatur zeigt besten Stand** — Jede schon geratene Taste
  trägt die beste Farbe, die ihr Buchstabe bisher bekommen hat: grün vor gelb vor
  grau.

### Hilfen

- **AC-9** `fertig` **Tipp zeigt Umschreibung** — „Tipp" blendet die Umschreibung
  des gesuchten Wortes unter dem Gitter ein und ist danach für dieses Wort
  gesperrt. Mit dem Ende der Partie verschwindet der Kasten, die Umschreibung
  steht dann im Ergebnis.
- **AC-10** `fertig` **Buchstabe deckt der Reihe nach** — „Buchstabe" deckt beim
  ersten Mal den ersten Buchstaben auf, dann den zweiten und so fort, höchstens
  vier; danach ist der Knopf gesperrt. Es erscheint „Buchstabe n ist X.", eine
  Zeile wie `A B · · ·`, und im Eingabefeld steht der Buchstabe als blasse
  Vorgabe – getippt werden muss er trotzdem.
- **AC-11** `fertig` **Vorschlag aus den Rückmeldungen** — „Vorschlag" öffnet
  „Wie weiter?" mit der Zahl der Lösungswörter, die zu allen bisherigen
  Rückmeldungen und verratenen Buchstaben passen, und bis zu drei Zügen aus allen
  gültigen Wörtern. Jeder Zug nennt „danach ø x übrig" oder „trennt alles";
  Wörter, die selbst noch Lösung sein können, tragen „kann die Lösung sein". Bei
  höchstens zwölf passenden Wörtern stehen sie alle darunter, bei höchstens zwei
  werden genau diese vorgeschlagen.
- **AC-12** `offen` **Beste Züge richtig sortiert** — Angezeigt werden die drei
  Züge mit dem kleinsten ø-Rest, aufsteigend; ein Wort, das noch Lösung sein
  kann, steht nur bei gleichem Rest vorn. Heute wird ein solches Wort auch mit bis
  zu 0,4 mehr Rest vorgezogen: im ersten Zug steht `LINSE` (ø 14,9) vor `LASTE`
  (ø 14,5).
- **AC-13** `fertig` **Vorschlag ohne Denkpause** — Auch der aufwendigste Aufruf –
  noch nichts geraten, alle Lösungswörter offen – ist am Rechner in unter einer
  Viertelsekunde fertig.
- **AC-14** `fertig` **Jede Hilfe zählt** — Die genutzten Hilfen einer Partie sind
  1 für den Tipp, plus die Zahl der verratenen Buchstaben, plus jedes Öffnen des
  Vorschlags – wer ihn zweimal öffnet, hat zwei Hilfen genutzt. Nach dem Ende
  sind alle drei Knöpfe weg.

### Wortschatz

- **AC-15** `fertig` **Wortschatz hält seinen Vertrag** — Jedes Wort in `LOESUNGEN`
  und `WEITERE` hat genau fünf Zeichen (Ä, Ö, Ü je eins), ist groß geschrieben und
  besteht nur aus A–Z, Ä, Ö, Ü – ß steht als SS. Kein Wort kommt doppelt vor,
  auch nicht über beide Listen hinweg. Jedes Lösungswort trägt eine nicht leere
  Umschreibung, in der es selbst nicht vorkommt; gezogen werden nur Lösungswörter.
- **AC-16** `fertig` **Kein fremdes Wörterbuch** — Der Wortschatz steht von Hand
  geschrieben in `spiele/woerter.js`; es wird keine Wortliste nachgeladen und
  keine unter GPL stehende Liste eingebunden.

### Ende der Partie

- **AC-17** `fertig` **Sieg und Verlust** — Das richtige Wort beendet die Partie
  mit einem Lob nach Zahl der Züge, von „Unfassbar." bei einem bis „Gerade noch."
  bei sechs; nach sechs Fehlversuchen steht „Diesmal nicht.". Beides zeigt „Das
  Wort war X – Umschreibung" und die Knöpfe „Noch ein Wort" und „Zur Auswahl".
- **AC-18** `fertig` **Neues Wort mit Rückfrage** — Das Werkzeug „Neues Wort"
  fragt nach, wenn das laufende Wort schon einen Versuch hat („Der angefangene
  Versuch geht dabei verloren."), sonst beginnt es sofort. Ein abgebrochenes Wort
  landet nicht in der Statistik.

### Speicher und Statistik

- **AC-19** `fertig` **Stand überlebt Schließen** — Wort, geprüfte Versuche,
  verratene Buchstaben, Tipp, Zahl der Vorschläge und Spielzeit stehen nach
  Zurück, Neuladen oder Neustart der App wieder da. Auch eine beendete Partie
  erscheint mit ihrem Ergebnis, ohne ein zweites Mal notiert zu werden.
- **AC-20** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `gewonnen`, `dauer` (Spielzeit, siehe AC-24), `zuege` (geprüfte
  Versuche, 1–6), `hilfen` (Zählung aus AC-14) und `wort` notiert. Die Statistik
  zeigt „Züge je Sieg", die längste Folge von Siegen und die allgemeinen
  Kennzahlen des Rahmens.
- **AC-21** `fertig` **Verteilung nach Zügen** — Unter den Kennzahlen steht, wie
  viele Siege in 1 bis 6 Zügen gelangen, je Balken getrennt in „ohne Hilfe" und
  „mit Hilfe". Verlorene Partien und solche ohne `zuege` zwischen 1 und 6 bleiben
  draußen.
- **AC-22** `fertig` **Lückenhafte Partien verfälschen nichts** — Eine leere Liste
  zeigt „–" und „0". Siege ohne Zahl in `zuege` gehen nicht in „Züge je Sieg" ein
  – weder als 0 noch als „NaN".
- **AC-23** `fertig` **Regeln als Blatt** — Das Werkzeug „Regeln" öffnet ein Blatt
  „Wördle" mit den drei Farben, den Umlaut-Tasten, den sechs Versuchen, dem
  Schreibplatz samt Pfeiltasten und den drei Hilfen.
- **AC-24** `fertig` **Spielzeit ohne Pausen** — `dauer` zählt nur die Zeit, in
  der das Spiel offen war. Eine über Nacht geschlossene Partie bringt die Nacht
  nicht in die Spielzeit; bis Version 59 war es die Uhrzeit seit dem Ziehen des
  Wortes.

## Randfälle

| #    | Fall                                                    | Erwartetes Verhalten                                                        |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| RF-1 | Verratener Buchstabe steht blass im Feld, nicht getippt | „Noch nicht genug Buchstaben." – die Vorgabe zählt nicht als Eingabe.       |
| RF-2 | Neuladen mit halb getippter Zeile                       | Die geprüften Versuche bleiben, die ungeprüften Buchstaben sind weg.        |
| RF-3 | Dasselbe gültige Wort ein zweites Mal geprüft           | Wird angenommen und verbraucht einen Versuch.                               |
| RF-4 | Nur noch ein oder zwei Wörter möglich                   | Genau diese werden vorgeschlagen, mit „trennt alles".                       |
| RF-5 | Kein Lösungswort passt mehr (Wort aus älterer Liste)    | „Zu diesen Rückmeldungen passt kein Wort aus meiner Liste mehr."            |
| RF-6 | Gespeichertes Wort hat keine Umschreibung               | Der Tipp zeigt „Zu diesem Wort gibt es keine Beschreibung."                 |
| RF-7 | Taste ß, Ziffer oder Satzzeichen                        | Wird ignoriert.                                                             |

## Hintergrund

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
