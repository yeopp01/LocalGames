# Hochhinaus

**Datei:** [`spiele/doodle.js`](../../spiele/doodle.js)
**Stand:** 11/12 fertig · 1 in arbeit

## Zweck

Doodle Jump auf Karopapier: Eine kleine Figur springt von selbst, und man
lenkt sie von Plattform zu Plattform nach oben. Gelenkt wird mit Halten –
linke Hälfte, rechte Hälfte – oder, wer mag, durch Neigen des Handys.

## Akzeptanzkriterien

### Steuerung

- **AC-1** `fertig` **Springt von allein** — Die Figur steht auf einer Platte
  und springt los, sobald getippt oder eine Taste gedrückt wird; bis dahin
  steht „Tippen zum Springen" da. Ohne Lenken hüpft sie auf der Startplatte
  auf und ab.
- **AC-2** `fertig` **Halten lenkt** — Ein Finger auf der linken Hälfte von Feld
  und Leiste lenkt nach links, auf der rechten nach rechts; wandert er über
  die Mitte, wechselt die Richtung. Liegen mehrere Finger, gilt der zuletzt
  aufgesetzte. Pfeil links/rechts und A/D tun dasselbe, Leertaste und Enter
  starten oder schalten die Pause um, P und Escape halten an.
- **AC-3** `fertig` **Neigen lenkt** — Unter dem Feld (vor dem Start) und im
  Pausenkasten lässt sich auf „Neigen" umstellen. Dann lenkt die Neigung des
  Geräts: bis 3° gar nicht, ab 25° mit voller Geschwindigkeit, dazwischen
  anteilig. Die Wahl gilt auch für die nächste Partie, und die Zeile unter dem
  Titel sagt „Gesteuert mit Neigen".
- **AC-4** `in-arbeit` **Erlaubnis auf dem iPhone** — Wo der Browser für die
  Neigung eine Erlaubnis verlangt, fragt der Knopf danach; ohne Erlaubnis
  bleibt es beim Halten, mit der Meldung „Ohne Erlaubnis geht Neigen nicht.".
  Gebaut, aber auf einem iPhone noch nicht nachvollzogen.
- **AC-5** `fertig` **Kein Sensor, kein Neigen** — Meldet das Gerät 1,5 s nach dem
  Start keine Neigung, geht es mit Halten weiter, und eine Meldung sagt es.
  Gerät ganz ohne Neigungsereignis: Umstellen meldet „Dieses Gerät meldet
  keine Neigung.".

### Sprünge und Plattformen

- **AC-6** `fertig` **Rand ist kein Ende** — Wer links aus dem Feld läuft, kommt
  rechts wieder herein und umgekehrt; am Rand ist die Figur auf beiden Seiten
  zu sehen.
- **AC-7** `fertig` **Immer erreichbar** — Zwei tragende Plattformen (fest oder
  wandernd) liegen nie mehr als 78 Einheiten übereinander; ein gewöhnlicher
  Sprung reicht 97,5. Mit der Höhe werden die Abstände größer, ab 1200
  Einheiten kommen wandernde Plattformen, ab 300 Federn und ab 600 brüchige
  Plattformen dazu – brüchige nur zusätzlich, nie als einzige Stufe.
- **AC-8** `fertig` **Landen nur von oben** — Die Figur landet nur im Fallen auf
  einer Plattform und springt von unten hindurch. Eine brüchige Plattform
  bricht beim ersten Tritt und trägt nicht. Eine Feder schießt die Figur etwa
  zweieinhalbmal so hoch wie ein gewöhnlicher Sprung.
- **AC-9** `fertig` **Gezählt wird die Höhe** — Das Bild folgt der Figur nach
  oben, nie nach unten. Oben stehen die größte erreichte Höhe in Metern (20
  Einheiten je Meter) und der Bestwert.
- **AC-10** `fertig` **Unten raus ist vorbei** — Fällt die Figur unten aus dem
  Bild, endet die Partie mit „Abgestürzt.", Höhe und Spielzeit unter dem Feld,
  bei neuem Bestwert „Das ist dein Bestwert.", darunter „Nochmal".

### Speicher und Statistik

- **AC-11** `fertig` **Partie in der Statistik** — Jede beendete Partie wird mit
  `meter` und `dauer` notiert, ohne `gewonnen`.
- **AC-12** `fertig` **Auswertung verträgt Lücken** — Die Statistik zeigt
  Bestwert, Höhe im Schnitt und die längste Partie; fehlende oder unsinnige
  Felder zählen als 0.

## Randfälle

| #    | Fall                                                | Erwartetes Verhalten                                     |
| ---- | --------------------------------------------------- | -------------------------------------------------------- |
| RF-1 | Handy im Querformat beim Neigen                     | Die Achse wird nach der Bildschirmdrehung umgerechnet.   |
| RF-2 | Taste und Finger gleichzeitig, in Gegenrichtung     | Die Taste gewinnt.                                       |
| RF-3 | Brüchige Platte liegt knapp über der Zielplatte     | Sie bricht, die Figur fällt auf die tragende darunter.   |
| RF-4 | Neuladen mit „Neigen" auf dem iPhone                | Die Erlaubnis gilt nur für die Sitzung; kommt keine Neigung, springt es auf Halten zurück (AC-5). |

## Hintergrund

Das Vorbild wird durch Neigen gesteuert. Das ist hier nicht die Vorgabe:
Neigen braucht auf dem iPhone eine Erlaubnis aus einem Tipp heraus, fehlt am
Rechner ganz und dreht sich gegen einen, wer im Liegen spielt. Halten geht
überall.

Die Plattformen entstehen beim Klettern. Jede tragende liegt zwischen
16 + min(24, h/200) und min(78, 34 + h/70) Einheiten über der vorigen, wobei h
die Höhe über dem Start ist – anfangs also dicht, später weiter, aber nie
außer Reichweite.

Nachgeprüft mit dem Gerüst aus der [Echtzeit-Spec](echtzeit.md): In fünf
Partien eines einfachen Bots (234 m, 853 m, 313 m, über 1307 m, 53 m) lagen
tragende Plattformen höchstens 78,0 auseinander. Brüchige Platte bricht und
trägt nicht, Feder gibt −633 nach einem Takt Schwerkraft, rechts hinaus kommt
links herein. Neigen und der Rückfall auf Halten wurden in Chromium mit
künstlichen `deviceorientation`-Ereignissen nachvollzogen.
