# Wer am ehesten

**Datei:** [`spiele/amehesten.js`](../../spiele/amehesten.js)
**Stand:** 11/11 fertig

## Zweck

Ein Partyspiel ohne Sieger: eine Frage wie „Wer würde am ehesten den Flug
verpassen?", jeder tippt heimlich auf einen Namen, dann werden alle Stimmen auf
einmal gezeigt. Gespielt wird mit einem Handy, das im Kreis wandert – einen
ganzen Abend lang.

## Akzeptanzkriterien

### Aufbau

- **AC-1** `fertig` **Drei bis zwölf Spieler** — Der Aufbau nimmt 3 bis 12
  Spieler mit Namen; der Knopf heißt „Erste Frage".
- **AC-2** `fertig` **Harmlos, frech oder gemischt** — Es liegen 45 Fragen
  bereit, 25 harmlose und 20 freche, keine doppelt. Man wählt „gemischt"
  (vorgewählt), „harmlos" oder „frech"; die Wahl und die Namen bleiben fürs
  nächste Öffnen.

### Frage und Abstimmung

- **AC-3** `fertig` **Frage zum Vorlesen** — Der Schirm zeigt „Wer würde am
  ehesten" und die Frage, den Hinweis, sie erst laut vorzulesen, und die Knöpfe
  „Abstimmen" und „Andere Frage". „Andere Frage" tauscht die Frage, ohne dass
  die Kopfzeile „Frage n" weiterzählt.
- **AC-4** `fertig` **Geheim und nie sich selbst** — Abgestimmt wird reihum
  hinter dem Sperrschirm „Abstimmen". Jeder sieht die Frage und die Namen der
  anderen, den eigenen nie. Bis zur letzten Stimme erscheint keine Zahl.
- **AC-5** `fertig` **Alle Stimmen auf einmal** — Nach der letzten Stimme zeigt
  der Schirm die Frage und alle Namen nach Stimmen geordnet, mit Zahl und einem
  Balken im Verhältnis zur Spitze; wer vorn liegt, ist hervorgehoben. Bei
  Gleichstand steht „Gleichstand – ihr seid euch nicht einig.". Einen Sieger
  gibt es nicht.
- **AC-6** `fertig` **Keine Frage zweimal** — Innerhalb eines Abends kommt
  keine Frage zweimal, auch keine übersprungene, bis der gewählte Vorrat
  aufgebraucht ist (45, 25 oder 20 Fragen). Dann füllt er sich neu. Gemessen:
  die ersten 45 Fragen gemischt sind verschieden, bei „frech" je 20 in Folge.
- **AC-7** `fertig` **Weiter oder Schluss** — Nach dem Ergebnis geht es mit
  „Nächste Frage" weiter oder mit „Für heute reicht’s" zurück zum Aufbau.

### Statistik

- **AC-8** `fertig` **Ein Abend, eine Partie** — Notiert wird einmal je Abend,
  nicht je Frage: `dauer` (nur die Zeit, in der das Spiel offen war),
  `spieler`, `fragen` (gestellte Fragen ohne
  übersprungene) und `sorte` (`gemischt`, `harmlos`, `frech`) – nie
  `gewonnen`. Während des Abends wird nichts notiert (gemessen: 51 Fragen, ein
  Eintrag). Das Spiel meldet sich mit `ohneSiege` an: die Kachel zählt Runden,
  eine Siegquote erscheint nicht.
- **AC-9** `fertig` **Abend endet beim Verlassen** — Der Abend wird notiert bei
  „Für heute reicht’s", beim Werkzeug „Neue Runde" und beim Verlassen des
  Spiels über die App (Zurück zur Auswahl, Zurück im Browser). Ein Abend wird nie
  doppelt notiert; ohne gestellte Frage wird nichts notiert.
- **AC-10** `fertig` **Abend überlebt das Zuklappen** — Der laufende Abend wird
  mit jeder neuen Frage gemerkt. Wird die App geschlossen, neu geladen oder vom
  System beendet, steht er beim nächsten Öffnen mit der offenen Frage wieder
  da. Lag er länger als sechs Stunden, ist er vorbei: Er wird notiert – mit dem
  Zeitpunkt der letzten Frage als `ende`, damit er am richtigen Tag zählt –
  und der Aufbau erscheint.
- **AC-11** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt die
  Summe der gestellten Fragen („1 Frage gestellt", sonst „n Fragen gestellt")
  und die übliche Spielerzahl. Eine leere Liste ergibt keine Kennzahlen;
  Partien ohne `fragen` oder `spieler` zählen mit 0 bzw. gar nicht.

## Randfälle

| #    | Fall                                                    | Erwartetes Verhalten                                                  |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| RF-1 | Spiel verlassen, nachdem eine Frage nur vorgelesen wurde | Der Abend zählt mit dieser Frage (`fragen: 1`).                      |
| RF-2 | Spiel verlassen, bevor eine Frage kam                   | Es wird nichts notiert.                                               |
| RF-3 | Der gewählte Vorrat ist aufgebraucht                    | Er füllt sich neu; Fragen können ab dann wiederkommen.                |
| RF-4 | Spiel verlassen und wieder geöffnet                     | Ein neuer Abend beginnt beim Aufbau, der Vorrat ist wieder voll.      |
| RF-5 | Alle Stimmen verteilen sich gleichmäßig                 | Alle sind hervorgehoben, dazu der Gleichstand-Hinweis.                |
| RF-6 | App mitten in der Abstimmung neu geladen                | Die offene Frage steht wieder da; die schon abgegebenen Stimmen sind weg. |

## Hintergrund

Eine Frage wird vorgelesen, das Gerät wandert, jeder tippt heimlich auf einen
Namen, dann werden alle Stimmen auf einmal aufgedeckt. Sich selbst kann niemand
wählen.

45 Fragen liegen bereit, harmlose und freche; innerhalb eines Abends kommt
keine zweimal. Es gibt keinen Sieger – das Spiel notiert deshalb kein
`gewonnen` und meldet sich mit `ohneSiege` an; siehe *Partien ohne Urteil*.

Eine „Partie" ist hier der ganze Abend und nicht die einzelne Frage. Sonst
stünden nach einer Viertelstunde vierzig Einträge in der Statistik.
