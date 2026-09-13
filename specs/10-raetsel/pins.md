# Riegel

**Datei:** [`spiele/pins.js`](../../spiele/pins.js)
**Stand:** 27/27 fertig

## Zweck

Das Rätsel aus der Werbung für Hero Wars, die nie das Spiel zeigt, für das sie
wirbt: Ein Held will zur Truhe, und dazwischen liegen Kammern mit Wasser,
Lava, Gold und Steinen, getrennt durch Riegel. Wer zieht, lässt los, was
dahinter liegt; der Held läuft von selbst, sobald der Weg frei ist. Siebzehn
feste Level, jedes mit einem Zug, der verliert; ab Level 13 hängen vier bis
fünf Riegel voneinander ab.

## Akzeptanzkriterien

### Level

- **AC-1** `fertig` **Siebzehn feste Level** — Es gibt siebzehn gebaute Level
  mit Namen. Oben stehen „Level n / 17" und, wo es Gold gibt, „Gold x %";
  darunter der Name. Ohne gespeicherten Stand beginnt das erste noch nicht
  gelöste.
- **AC-2** `fertig` **Level wählen** — Das Werkzeug „Level wählen" zeigt alle
  Level als Knöpfe mit Nummer und, bei gelösten, der besten Sternzahl; das
  aktuelle ist hervorgehoben. Wählbar ist jedes gelöste und alles bis zwei
  hinter dem höchsten gelösten – eines darf man überspringen. Darunter steht
  „x von 17 gelöst, y von 51 Sternen". Was gelöst ist, kommt aus der Statistik
  und reist deshalb mit der Sicherung.
- **AC-3** `fertig` **Jedes Level lösbar** — Jedes Level lässt sich mit drei
  Sternen lösen, und außer dem ersten hat jedes mindestens einen Riegel, der
  als erster gezogen verliert.
- **AC-23** `fertig` **Auftrag über dem Feld** — Über dem Feld steht, was zu
  tun ist: der Satz des Levels, sonst „Bring den Helden zur Truhe. Gold
  unterwegs gibt Sterne." (ohne Gold nur der erste Satz).
- **AC-25** `fertig` **Neuer Levelsatz zählt neu** — Siege und Spielstände
  tragen `satz: 2`. Siege und Stände aus dem ersten Satz, dessen Karten anders
  aussahen, schalten nichts frei, laden nicht und zählen in der Statistik nicht.

### Riegel

- **AC-4** `fertig` **Tippen zieht** — Ein Tipp auf einen Riegel oder seinen
  nummerierten Griff zieht ihn heraus; er ruckt kurz und gleitet zur Seite des
  Griffs weg. Die Zifferntasten ziehen den Riegel mit der Nummer. Gezogen ist
  gezogen: Zurück geht es nur mit „Von vorn" (oder R), das das Level neu
  aufbaut.
- **AC-5** `fertig` **Gezogen wird in Ruhe** — Bewegt sich noch etwas, merkt ein
  Tipp den Riegel nur vor (sein Griff pulsiert); gezogen wird, sobald alles
  ruht. Ein zweiter Tipp nimmt die Vormerkung zurück. So entscheidet nie die
  Schnelligkeit des Fingers.
- **AC-6** `fertig` **Ohne Zufall** — Dieselben Riegel in derselben Reihenfolge
  ergeben immer dieselbe Welt, Zelle für Zelle.

### Welt

- **AC-7** `fertig` **Wasser, Lava, Gold, Stein** — Wasser fällt und fließt zur
  nächsten Stelle, an der es tiefer kann; Lava ebenso, aber halb so oft. Wo
  Wasser Lava berührt, wird die Lava zu Stein und das Wasser verdampft. Lava
  schmilzt Gold, das sie berührt. Gold und Stein fallen, rutschen schräg ab
  und sinken durch Wasser und Lava.
- **AC-8** `fertig` **Held und Ungeheuer** — Beide fallen, wenn nichts Festes sie
  trägt, und sinken dabei durch Wasser und Lava. Wer nur noch mit einem Drittel
  seiner Breite aufsteht und nicht weiterkommt, rutscht zur freien Seite ab.
  Das Ungeheuer läuft auf den Helden zu, bis es unter oder über ihm steht. Lava
  verbrennt jede Figur, die sie berührt; ein lebendes Ungeheuer, das den
  Helden berührt, frisst ihn.
- **AC-9** `fertig` **Gold unterwegs** — Gold, das bis auf zwei Kacheln an den
  Helden herankommt, sammelt er ein, solange das Level nicht entschieden ist.
- **AC-19** `fertig` **Steine treffen jeden** — Fällt ein Stein auf eine Figur
  oder auf den Haufen, der schon auf ihr liegt, zählt das als Treffer; sechs
  Treffer erschlagen sie, den Helden wie das Ungeheuer. Gold fällt harmlos.
  Vorher zählte nur die erste Lage und nur beim Ungeheuer: Ein Kopf, schmaler
  als der Steinregen, überlebte jeden Steinschlag, und der Held trug einen
  Helm, den man nirgends sah.
- **AC-20** `fertig` **Held läuft zur Truhe** — Der Held läuft von selbst in
  Richtung der Truhe, sobald nichts im Weg ist, und watet durch Wasser. Er
  schaut nicht, wohin er tritt: Über Lava läuft er hinein, über ein Loch fällt
  er hinab.
- **AC-21** `fertig` **Stufen und Schutt** — Held und Ungeheuer steigen eine
  Kachel hoch, höheren Fels nicht. Losen Schutt – Steine und Gold – schieben
  sie beiseite; er fällt hinter ihnen herunter, nicht auf ihren Kopf.
- **AC-27** `fertig` **Keine ewige Bewegung** — Eine Figur rutscht nicht von
  einer Kante zurück, auf die sie selbst gelaufen ist. Vorher stieg sie hinauf,
  rutschte zurück und stieg wieder, die Welt kam nie zur Ruhe, und der Löser
  rechnete in „Treppab" 45 Sekunden.

### Ende

- **AC-10** `fertig` **Sieg an der Truhe** — Berührt der lebende Held die
  Truhe, klappt sie auf und leuchtet, er reckt das Schwert, und kurz darauf
  steht unter dem Feld – ohne Schild, das die Truhe verdecken würde –
  „Geschafft." mit den Sternen, Level, Zeit und Zahl der Hinweise, unter drei
  Sternen dazu „Mehr Gold unterwegs bringt mehr Sterne.", und die Knöpfe
  „Weiter zu Level n+1" und „Nochmal". Übrige Riegel müssen nicht gezogen
  werden.
- **AC-11** `fertig` **Niederlage** — Stirbt der Held, erscheint knapp eine
  Sekunde später „Verbrannt.", „Gefressen." oder „Erschlagen."; die Welt läuft
  dabei zu Ende. Sind alle Riegel gezogen, ruht die Welt und steht der Held
  nicht an der Truhe, heißt es „Kein Weg zur Truhe.". Darunter steht der Grund
  als Satz und „Nochmal versuchen".
- **AC-22** `fertig` **Sterne fürs Gold** — Ein Stern für die Truhe, einer ab der
  Hälfte des Goldes im Level, einer ab neun Zehnteln; ein Level ohne Gold gibt
  drei.
- **AC-24** `fertig` **Man sieht, was passiert** — Beim Löschen steigt Dampf
  auf, schmelzendes Gold sprüht Funken, und eingesammeltes Gold fliegt als
  Münze im Bogen zum Helden, statt zu verschwinden. Wasser und Lava werden nach
  unten dunkler, ihre Oberfläche bewegt sich, Gold glitzert. Laufende Figuren
  bewegen die Beine; verbrannte verkohlen und zerfallen zu Asche, erschlagene
  werden platt gedrückt.

### Hinweis

- **AC-12** `fertig` **Hinweis rechnet nach** — „Hinweis" probiert von der
  ruhenden Welt aus jeden übrigen Riegel durch und nennt den, von dem aus die
  meisten Sterne zu holen sind, samt dem, was er anrichtet („Wasser trifft auf
  Lava und wird zu Stein.") und „Von dort sind noch ★★★ zu holen.". Für die
  anderen sagt er, was schiefginge („Riegel 3 jetzt: die Lava erreicht den
  Helden."). Der Griff des genannten Riegels pulsiert, „Riegel n ziehen" zieht
  ihn. Er liest keine gespeicherte Lösung – es gibt keine.
- **AC-13** `fertig` **Sackgasse wird erkannt** — Führt kein Riegel mehr zum
  Sieg, sagt der Hinweis „Von hier geht es nicht mehr auf.", nennt für jeden
  Riegel den Grund und bietet „Von vorn" an.
- **AC-14** `fertig` **Hinweise werden gezählt** — Jeder Hinweis, der erscheint,
  zählt. Bewegt sich noch etwas, kommt nur „Erst wenn alles ruht." und nichts
  wird gezählt.
- **AC-26** `fertig` **Rechnen mit Rückmeldung** — Vor der Rechnung steht
  „Der Hinweis rechnet …"; ein zweiter Druck währenddessen tut nichts. Wird
  inzwischen ein anderes Level geöffnet oder neu begonnen, verfällt der
  Hinweis.

### Speicher und Statistik

- **AC-15** `fertig` **Partie überlebt Schließen** — Gespeichert werden Satz,
  Level, gezogene Riegel, Hinweise und verbrauchte Zeit. Nach Zurück oder
  Neuladen rechnet das Spiel die Züge nach und steht in der ruhenden Welt
  danach. Ein schon entschiedenes Level beginnt neu, nach einem Sieg das
  nächste.
- **AC-16** `fertig` **Angehalten** — Wird die App verdeckt oder ein Blatt
  geöffnet, während sich etwas bewegt, steht „Angehalten – Tippen, dann geht es
  weiter."; ein Tipp aufs Feld lässt es weiterlaufen.
- **AC-17** `fertig` **Partie in der Statistik** — Jedes entschiedene Level wird
  mit `gewonnen` (wahr oder falsch), `satz`, `stufe` (Levelnummer), `dauer`,
  `hilfen`, bei Sieg `sterne` und, wo es Gold gibt, `gold` in Prozent notiert;
  ein abgebrochenes nicht. Die Statistik zeigt „Level gelöst" als x/17,
  „Sterne" als beste Sterne je Level zusammen, y/51, und „ohne Hinweis gelöst",
  auch bei leeren Listen und Partien ohne `stufe` oder `sterne`.
- **AC-18** `fertig` **Anleitung erklärt alles** — Das Blatt „Anleitung"
  nennt das Ziel Truhe und dass der Held von selbst läuft, das Ziehen ohne
  Zurück, was Lava, Wasser, Steine und Gold für alle gleich tun, wann das
  Ungeheuer gefährlich ist, Stufen und Schutt, die Sterne, das Vormerken und
  den Hinweis.

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                                     |
| ---- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| RF-1 | App schließt, während Wasser fließt               | Nach dem Neuladen ist die Bewegung nachgerechnet, die Welt ruht.         |
| RF-2 | Held erreicht die Truhe, während Lava noch fließt | Sieg; die Lava fließt zu Ende, dem Helden tut sie nichts mehr.           |
| RF-3 | Hinweis, während sich etwas bewegt                | „Erst wenn alles ruht.", kein Hinweis gezählt.                           |
| RF-4 | Gespeicherter Stand aus dem ersten Levelsatz      | Das erste im neuen Satz noch ungelöste Level beginnt.                    |
| RF-5 | Ungeheuer steht nur mit der Kante auf der Falltür | Es rutscht ab, statt über dem Loch zu schweben.                          |
| RF-6 | Steinhaufen türmt sich vor einer Tür              | Nach dem Öffnen schiebt sich der Held durch den Schutt.                  |

## Hintergrund

Bis Fassung 77 wollte der Held das Gold, das zu ihm fallen musste, und jedes
Ungeheuer musste sterben; Steine trafen nur das Ungeheuer. Beim Spielen war
nicht zu erkennen, was eigentlich zu tun war, und warum Steine dem Helden
nichts taten, dem Ungeheuer aber schon. Jetzt gelten die Regeln für alle
gleich, und das Ziel ist sichtbar: die Truhe. Gold ist Kür und gibt Sterne.

Die Welt ist ein Raster aus 45 × 72 Zellen; eine Kachel der Levelkarte sind
3 × 3 davon. Gerechnet wird mit 90 Takten je Sekunde. Flüssiges geht seitwärts
nur in Richtung einer Stelle, an der es fallen kann (oder über der anderen
Flüssigkeit steht) – ohne diese Bedingung wanderten die letzten Tropfen auf
einer Fläche ewig hin und her, und die Welt käme nie zur Ruhe. Über freie
Zellen springt Wasser bis zu vier, Lava bis zu zwei Zellen je Takt.

Weil alles ohne Zufall läuft, speichert das Spiel nur die gezogenen Riegel,
und der Hinweis kann ehrlich sein: Er rechnet vor, statt nachzuschlagen. Der
Löser merkt sich jede ruhende Lage, die er schon kennt, und hört auf, sobald
er drei Sterne gefunden hat.

Waagerechte Riegel liegen in der obersten Zellreihe ihrer Kachel; in der Mitte
ließen sie darüber eine Rinne, in der Lava liegen blieb. Die Gänge sind vier
Kacheln hoch und die Türen ebenso: Bei drei Kacheln stieß der Held, sobald er
eine Stufe nahm, mit dem Kopf an den Fels über der Tür. Schutt schieben die
Figuren, weil zwei Kammern Steine sich höher türmen, als ein Gang Luft über dem
Kopf hat – der Held stand oben auf dem Haufen und kam nicht weiter.

Nachgeprüft mit einem Wegwerf-Gerüst gegen `spiele/pins.js` (Node, PC), das
jede Reihenfolge der Riegel bis zum Urteil durchrechnet, und dem Hinweis, wie
ihn das Spiel rechnet:

| Level             | Riegel | Siege / Enden | gute erste Riegel | Hinweis am Start |
| ----------------- | ------ | ------------- | ----------------- | ---------------- |
| Die Tür           | 1      | 1/1           | 1                 | 9 ms             |
| Nicht der da      | 2      | 1/2           | 2                 | 55 ms            |
| Das Ungeheuer     | 2      | 1/2           | 1                 | 16 ms            |
| Erst löschen      | 3      | 1/5           | 1                 | 93 ms            |
| Steinschlag       | 3      | 1/4           | 2                 | 33 ms            |
| Die Grube         | 3      | 1/5           | 3                 | 95 ms            |
| Tief gefallen     | 2      | 1/2           | 2                 | 62 ms            |
| Schatzregen       | 3      | 3/5           | 1, 2              | 79 ms            |
| Falltür           | 3      | 2/5           | 1, 3              | 65 ms            |
| Steinbrücke       | 3      | 1/6           | 1                 | 140 ms           |
| Dammbruch         | 3      | 4/6           | 1, 2, 3           | 212 ms           |
| Doppeldecker      | 3      | 3/6           | 1, 2              | 123 ms           |
| Zwei Gruben       | 4      | 4/18          | 4                 | 453 ms           |
| Goldader          | 4      | 7/16          | 2, 3              | 132 ms           |
| Treppab           | 4      | 6/22          | 1, 3, 4           | 993 ms           |
| Pfropfen          | 5      | 26/82         | 1, 2, 3, 4        | 576 ms           |
| Drei Etagen       | 5      | 48/102        | 1–5               | 501 ms           |

In „Schatzregen", „Dammbruch" und „Goldader" gewinnt auch, wer das Gold opfert –
mit einem Stern. „Gute erste Riegel" zählt jeden Anfang, von dem aus noch ein
Sieg möglich ist, egal mit wie vielen Sternen.
