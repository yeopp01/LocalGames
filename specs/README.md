# Spezifikationen

Hier steht, **was LocalGames können soll** – je Spiel und für den Rahmen eine
Datei mit Zweck, Akzeptanzkriterien, Randfällen und dem Hintergrund, warum es
so gebaut ist. Wie es gebaut ist, steht im Code; was gerade kaputt ist, in
einem Issue.

## Was ist gerade zu tun

[**BOARD.md**](BOARD.md) – eine Zeile je Akzeptanzkriterium, nach Status
sortiert. Erzeugt, nicht von Hand gepflegt. Dieselben Daten als Seite mit
Filter, Suche, Fortschritt und dem letzten Prüflauf:

```
node pruefung/skripte/spec-board.mjs     # Board und Stand-Zeilen neu schreiben
node pruefung/skripte/bericht.mjs        # Seite: pruefung/bericht/index.html
```

## Bereiche

| Bereich                                         | Inhalt                                                   |
| ----------------------------------------------- | -------------------------------------------------------- |
| [00-rahmen](00-rahmen/)                         | Auswahl, Statistik, Sicherung, Offline, Spielschnittstelle |
| [10-raetsel](10-raetsel/)                       | Mini-Sudoku, Minenfeld, Nonogramm, Zahlencode, Tango, Damen, Weg |
| [20-wortspiele](20-wortspiele/)                 | Wördle, Galgenmännchen                                   |
| [30-brett-und-karten](30-brett-und-karten/)     | 2048, Vier gewinnt, Schafkopf                            |
| [40-zu-mehreren](40-zu-mehreren/)               | Bausteine für Runden, Verräter, Bombe, Zwei Wahrheiten, Wer am ehesten |
| [50-geschick](50-geschick/)                     | Echtzeit-Werkzeug, Schlange, Invasoren, Flattervogel, Hochhinaus |

## Regeln für die Ablage

1. **Der Pfad ist die Identität.** Ein Spiel liegt unter seiner `id` aus
   `Rahmen.anmelden` – `10-raetsel/minen.md` für `id: 'minen'`. Der Wächter
   prüft, dass jedes angemeldete Spiel seine Spec hat.
2. **Ein Thema, eine Datei.** Nachträge werden eingearbeitet, nicht
   danebengelegt.
3. **Aufbau einer Spec:**

   ```md
   # Minenfeld

   **Datei:** [`spiele/minen.js`](../../spiele/minen.js)
   **Stand:** 12/12 fertig

   ## Zweck
   Zwei, drei Sätze: was das Spiel ist und für wen.

   ## Akzeptanzkriterien

   ### Gruppe
   - **AC-1** `fertig` **Erster Klick sicher** — Der erste Klick trifft nie
     eine Mine, auch keines der acht Nachbarfelder …

   ## Randfälle
   | #    | Fall | Erwartetes Verhalten |

   ## Hintergrund
   Warum es so gebaut ist, Messungen, verworfene Wege.
   ```

4. **Jedes Akzeptanzkriterium trägt Status und Kurztitel.** Status:
   `offen` · `geplant` · `in-arbeit` · `fertig` · `zurueckgestellt` – Letzteres
   **mit Grund in Klammern** dahinter:

   ```md
   - **AC-9** `zurueckgestellt` (braucht einen Server) **Stimmen übers Netz** — …
   ```

   Der Kurztitel hat höchstens fünf Wörter und 44 Zeichen – er ist die Zeile
   im Board. Der Text dahinter ist die eigentliche Anforderung.

5. **Ein Kriterium beschreibt beobachtbares Verhalten**, so dass man es im
   Browser oder mit einem Skript nachprüfen kann: was der Spieler sieht, was
   in der Statistik landet, was nie passieren darf. Keine Umsetzungsdetails,
   außer sie sind ein Vertrag (Feldnamen in `notieren`, Speicherschlüssel).

6. **`fertig` heißt: gebaut und am Code oder im Browser nachvollzogen.** Was
   die Beschreibung verspricht, der Code aber nicht hält, ist `offen` – nicht
   `fertig` mit Fußnote.

7. **Der Status am Kriterium ist die einzige Stelle für den Stand.** Keine
   Tabelle „Stand der Umsetzung" daneben. Die `**Stand:**`-Zeile im Kopf, die
   Tabelle in der Bereichs-README (zwischen den `board`-Markern) und
   [`BOARD.md`](BOARD.md) sind erzeugt und werden überschrieben.

8. **Nummern werden nie neu vergeben.** Fällt ein Kriterium weg, bleibt die
   Lücke. Ein neues Kriterium bekommt die nächste freie Nummer, auch wenn es
   thematisch weiter oben steht.

9. **Ein behobener Fehler hinterlässt ein Kriterium**, wenn er eine Lücke in
   der Anforderung aufgedeckt hat – sonst kommt er wieder.
