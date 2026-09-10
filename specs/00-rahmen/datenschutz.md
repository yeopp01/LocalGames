# Datenschutz

**Datei:** [`app.js`](../../app.js), [`index.html`](../../index.html), [`styles.css`](../../styles.css)
**Stand:** 11/11 fertig

## Zweck

LocalGames braucht kein Konto und keinen fremden Rechner: Partien und
Spielstände bleiben im Speicher des Geräts. Nach draußen geht einzig ein
anonymer Aufrufzähler, und die App funktioniert auch, wenn er fehlt.

## Akzeptanzkriterien

### Speicher auf dem Gerät

- **AC-1** `fertig` **Ein Schlüssel im Browser** — Alles, was die App sich
  merkt, liegt in `localStorage` unter `localgames.v1` als
  `{ version: 1, partien: [...], stand: {...} }` – Partien in `partien`,
  laufende Spielstände je Spiel-`id` in `stand`.
- **AC-2** `fertig` **Kein Konto, keine Anmeldung** — Die App fragt nie nach
  Name, Adresse oder Passwort und ist ohne jede Anmeldung vollständig nutzbar.
- **AC-3** `fertig` **Kaputter Speicher startet leer** — Ist der Inhalt unter
  `localgames.v1` kein lesbares JSON oder fehlen `partien`/`stand`, startet die
  App mit leerem Bestand statt mit einem Fehler.
- **AC-4** `fertig` **Partien verlassen das Gerät nie** — Keine Anfrage der App
  trägt Partien, Spielstände oder Zahlen aus der Statistik. Außer den eigenen
  Dateien vom Server (auch `version.js` bei der Versionssuche) spricht die App
  nur mit dem Zähler.

### Zählung

- **AC-5** `fertig` **Aufruf wird gezählt** — Beim Öffnen der Seite meldet das
  GoatCounter-Skript unten in `index.html` einen Aufruf an
  `yeopp01.goatcounter.com`.
- **AC-6** `fertig` **Spielstart als Ereignis** — Jedes Öffnen eines Spiels
  meldet ein Ereignis mit dem Pfad `spiel/<id>` und dem Spielnamen als Titel –
  sonst nichts, keine Partie, kein Ergebnis.
- **AC-7** `fertig` **Installation als Ereignis** — Legt jemand die App auf dem
  Startbildschirm ab, meldet sie das Ereignis `app-installiert`.
- **AC-8** `fertig` **Ohne Zählskript läuft alles** — Fehlt das Zählskript
  (offline, Werbeblocker, Datei per Doppelklick, Zeilen aus `index.html`
  gelöscht), laufen Auswahl, Spiele und Statistik unverändert, ohne Fehler.
- **AC-9** `fertig` **Offline wird nicht gezählt** — Das Zählskript liegt nicht
  im Offline-Speicher; wer ohne Netz spielt, erzeugt keine Zählung, auch nicht
  nachträglich.
- **AC-10** `fertig` **Hinweis nennt alle Zählungen** — Der Hinweis unten im
  Einstellungsblatt nennt alles, was gezählt wird: das Öffnen der App, den
  Start eines Spiels und die Installation.

### Schriften

- **AC-11** `fertig` **Schriften vom eigenen Server** — Beide Schriften
  (Bricolage Grotesque, DM Mono) kommen aus `schriften/` derselben Seite;
  beim Laden geht keine Anfrage an Google. Die Lizenztexte liegen daneben.

## Randfälle

| #    | Fall                                              | Erwartetes Verhalten                                                 |
| ---- | ------------------------------------------------- | -------------------------------------------------------------------- |
| RF-1 | Werbeblocker sperrt `gc.zgo.at`                   | Keine Zählung, keine Fehlermeldung, Spiele starten normal.           |
| RF-2 | Browser-Speicher der Seite gelöscht               | Die App startet leer; zurück kommt der Bestand nur über eine Sicherung. |
| RF-3 | `localStorage` enthält fremdes JSON (`[]`, `"x"`) | Leerer Bestand, die App startet.                                     |
| RF-4 | Spiel im Flugmodus geöffnet                       | Das Spiel läuft, `spiel/<id>` wird nicht gemeldet.                   |

## Hintergrund

Was gezählt wird und was nicht, steht für Spieler in der
[README](../../README.md#zählung) – dort bleibt es, weil es ein Versprechen an
alle ist, die die App öffnen.

Warum überhaupt lokal: Wer die Seite öffnet, soll nicht nebenbei Google
begegnen. Nach dem Umzug spricht die App beim Laden mit genau zwei Stellen –
GitHub, das die Dateien ausliefert, und dem Zähler. Bricolage ist eine
variable Schrift, eine Datei deckt die Gewichte 400 bis 800 ab; zusammen mit
DM Mono sind es 153 kB, die einmal geladen und dann offline vorgehalten werden.
