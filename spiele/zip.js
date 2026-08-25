/* Weg – nach dem Vorbild von Zip.

   Ziehe einen zusammenhängenden Weg, der jedes Feld genau einmal berührt und
   die Zahlen der Reihe nach abklappert. Ein Hamiltonpfad mit Zwischenzielen.

   Der Generator würfelt zuerst einen solchen Weg über das ganze Brett und
   setzt die Zahlen darauf ab. Ist die Aufgabe dann noch mehrdeutig, kommt
   eine weitere Zahl dazu, bis genau ein Weg übrig bleibt.
*/

(() => {
  const STUFEN = {
    leicht: { name: 'leicht', kanten: 5, ziele: 4 },
    mittel: { name: 'mittel', kanten: 6, ziele: 6 },
    schwer: { name: 'schwer', kanten: 7, ziele: 12 },
  };

  const mischen = (feld) => {
    for (let i = feld.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [feld[i], feld[j]] = [feld[j], feld[i]];
    }
    return feld;
  };

  const nachbarnVon = (i, k) => {
    const z = Math.floor(i / k);
    const s = i % k;
    const raus = [];
    if (z > 0) raus.push(i - k);
    if (z < k - 1) raus.push(i + k);
    if (s > 0) raus.push(i - 1);
    if (s < k - 1) raus.push(i + 1);
    return raus;
  };

  /* Ein Weg über alle Felder. Der Trick ist die Reihenfolge: Nachbarn mit
     den wenigsten freien Anschlüssen zuerst – so laufen wir uns selten fest. */
  function wegSuchen(k) {
    const anzahl = k * k;
    for (let versuch = 0; versuch < 60; versuch += 1) {
      const besucht = new Array(anzahl).fill(false);
      const weg = [];
      let schritte = 0;

      const frei = (i) => nachbarnVon(i, k).filter((j) => !besucht[j]).length;

      const weiter = (i) => {
        schritte += 1;
        if (schritte > 60000) return false;
        besucht[i] = true;
        weg.push(i);
        if (weg.length === anzahl) return true;

        const kandidaten = mischen(nachbarnVon(i, k).filter((j) => !besucht[j]))
          .sort((a, b) => frei(a) - frei(b));
        for (const j of kandidaten) {
          if (weiter(j)) return true;
        }
        besucht[i] = false;
        weg.pop();
        return false;
      };

      const start = Math.floor(Math.random() * anzahl);
      if (weiter(start)) return weg;
    }
    return null;
  }

  /* Zählt Wege, die alle Felder berühren und die Zahlen der Reihe nach
     mitnehmen – Abbruch bei der zweiten Lösung. */
  function loesungen(k, zahlAn, hoechste) {
    const anzahl = k * k;
    const start = zahlAn.indexOf(1);
    const ziel = zahlAn.indexOf(hoechste);
    if (start < 0 || ziel < 0) return 0;

    const besucht = new Array(anzahl).fill(false);
    let gefunden = 0;
    let schritte = 0;
    let abgebrochen = false;
    let offen = anzahl;                 // mitgezählt statt jedes Mal neu ermittelt

    /* Bleibt alles Unbesuchte noch erreichbar? Sonst ist der Ast tot. */
    const zusammenhaengend = (von) => {
      const gesehen = new Set([von]);
      const stapel = [von];
      while (stapel.length) {
        const i = stapel.pop();
        for (const j of nachbarnVon(i, k)) {
          if (besucht[j] || gesehen.has(j)) continue;
          gesehen.add(j);
          stapel.push(j);
        }
      }
      return gesehen.size >= offen;
    };

    const weiter = (i, tiefe, naechsteZahl) => {
      if (gefunden > 1 || abgebrochen) return;
      schritte += 1;
      // Harte Bremse: lieber "nicht eindeutig" melden als hängen bleiben.
      if (schritte > 120000) { abgebrochen = true; return; }
      besucht[i] = true;
      offen -= 1;

      if (tiefe === anzahl) {
        if (i === ziel && naechsteZahl > hoechste) gefunden += 1;
        besucht[i] = false;
        offen += 1;
        return;
      }

      for (const j of nachbarnVon(i, k)) {
        if (besucht[j]) continue;
        const zahl = zahlAn[j];
        if (zahl && zahl !== naechsteZahl) continue;      // Zahlen nur der Reihe nach
        if (!zahl && naechsteZahl > hoechste && j === ziel) continue;
        besucht[j] = true;
        offen -= 1;
        const geht = zusammenhaengend(j);
        besucht[j] = false;
        offen += 1;
        if (!geht) continue;
        weiter(j, tiefe + 1, zahl ? naechsteZahl + 1 : naechsteZahl);
        if (gefunden > 1 || abgebrochen) break;
      }
      besucht[i] = false;
      offen += 1;
    };

    weiter(start, 1, 2);
    return abgebrochen ? 2 : gefunden;
  }

  function raetselBauen(stufe) {
    const { kanten: k, ziele } = STUFEN[stufe];
    for (let versuch = 0; versuch < 30; versuch += 1) {
      const weg = wegSuchen(k);
      if (!weg) continue;

      // Zahlen auf dem Weg verteilen: Anfang, Ende und dazwischen verteilt.
      const stellen = new Set([0, weg.length - 1]);
      while (stellen.size < ziele) {
        stellen.add(1 + Math.floor(Math.random() * (weg.length - 2)));
      }

      let sortiert = [...stellen].sort((a, b) => a - b);
      const zahlAn = new Array(k * k).fill(0);
      sortiert.forEach((pos, nr) => { zahlAn[weg[pos]] = nr + 1; });

      // Solange nachschärfen, bis genau ein Weg übrig bleibt.
      let versuche = 0;
      while (loesungen(k, zahlAn, sortiert.length) !== 1 && versuche < 8) {
        const frei = [...Array(weg.length).keys()].filter((p) => !stellen.has(p));
        if (!frei.length) break;
        stellen.add(frei[Math.floor(Math.random() * frei.length)]);
        sortiert = [...stellen].sort((a, b) => a - b);
        zahlAn.fill(0);
        sortiert.forEach((pos, nr) => { zahlAn[weg[pos]] = nr + 1; });
        versuche += 1;
      }

      if (loesungen(k, zahlAn, sortiert.length) === 1) {
        return { kanten: k, zahlAn, hoechste: sortiert.length, loesung: weg };
      }
    }
    return null;
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let zieht = false;
    let uhr = null;

    function frisch(stufe) {
      const r = raetselBauen(stufe) || raetselBauen('leicht');
      return {
        stufe: r.kanten === STUFEN[stufe].kanten ? stufe : 'leicht',
        kanten: r.kanten,
        zahlAn: r.zahlAn,
        hoechste: r.hoechste,
        loesung: r.loesung,
        pfad: [],
        verbraucht: 0,
        seit: Date.now(),
        hilfen: 0,
        fertig: false,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.pfad) && alt.kanten && !alt.fertig) {
        alt.seit = Date.now();
        return alt;
      }
      return frisch('leicht');
    }

    const zeitJetzt = () => stand.verbraucht + (stand.fertig ? 0 : Date.now() - stand.seit);

    function sichern() {
      if (!stand.fertig) {
        stand.verbraucht = zeitJetzt();
        stand.seit = Date.now();
      }
      s.merken(stand);
    }

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const buehne = el('div', 'p-buehne');
    const gitter = el('div', 'p-gitter');
    const linie = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    linie.classList.add('p-linie');
    buehne.append(gitter, linie);
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste');
    wurzel.append(kopf, buehne, endeKasten, leiste);

    const zurueckKnopf = el('button', 'knopf knopf--still', 'Ein Feld zurück');
    zurueckKnopf.type = 'button';
    zurueckKnopf.addEventListener('click', () => {
      if (stand.fertig || !stand.pfad.length) return;
      stand.pfad.pop();
      sichern();
      zeichnen();
    });
    const leerenKnopf = el('button', 'knopf knopf--still', 'Von vorn');
    leerenKnopf.type = 'button';
    leerenKnopf.addEventListener('click', () => {
      if (stand.fertig) return;
      stand.pfad = [];
      sichern();
      zeichnen();
    });
    const hinweisKnopf = el('button', 'knopf knopf--still', 'Hinweis');
    hinweisKnopf.type = 'button';
    hinweisKnopf.addEventListener('click', hinweis);
    leiste.append(zurueckKnopf, leerenKnopf, hinweisKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neues Rätsel', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    let felder = [];

    function gitterBauen() {
      const k = stand.kanten;
      gitter.style.setProperty('--kanten', String(k));
      const platz = Math.min(340, window.innerWidth - 30);
      const zelle = Math.floor(platz / k);
      buehne.style.setProperty('--zelle', zelle + 'px');
      buehne.style.setProperty('--kanten', String(k));
      linie.setAttribute('viewBox', '0 0 ' + k + ' ' + k);

      gitter.replaceChildren();
      felder = [];
      for (let i = 0; i < k * k; i += 1) {
        const f = el('button', 'p-feld');
        f.type = 'button';
        const nr = i;
        f.addEventListener('pointerdown', (e) => { e.preventDefault(); zieht = true; anfassen(nr); });
        f.addEventListener('pointerenter', () => { if (zieht) anfassen(nr); });
        gitter.append(f);
        felder.push(f);
      }
    }

    const beiLoslassen = () => { zieht = false; };
    window.addEventListener('pointerup', beiLoslassen);
    window.addEventListener('pointercancel', beiLoslassen);

    /* ---------------------------------------------------------------- Zug */

    /* Wie viele Zahlen sind bisher abgeklappert? */
    function erreichteZahl(pfad) {
      let hoch = 0;
      for (const i of pfad) if (stand.zahlAn[i]) hoch = Math.max(hoch, stand.zahlAn[i]);
      return hoch;
    }

    function anfassen(i) {
      if (stand.fertig) return;
      const pfad = stand.pfad;

      if (!pfad.length) {
        // Losgehen darf man nur bei der 1.
        if (stand.zahlAn[i] !== 1) { s.toast('Der Weg beginnt bei der 1.'); return; }
        pfad.push(i);
        sichern();
        zeichnen();
        return;
      }

      const letzter = pfad[pfad.length - 1];
      if (i === letzter) return;

      // Auf das vorletzte Feld zurück heißt: einen Schritt zurücknehmen.
      if (pfad.length > 1 && i === pfad[pfad.length - 2]) {
        pfad.pop();
        sichern();
        zeichnen();
        return;
      }

      if (!nachbarnVon(letzter, stand.kanten).includes(i)) return;
      if (pfad.includes(i)) return;

      const zahl = stand.zahlAn[i];
      if (zahl && zahl !== erreichteZahl(pfad) + 1) {
        s.toast('Erst die ' + (erreichteZahl(pfad) + 1) + '.');
        return;
      }

      pfad.push(i);
      sichern();
      zeichnen();
      pruefenObFertig();
    }

    function hinweis() {
      if (stand.fertig) return;
      stand.hilfen += 1;
      sichern();

      // Wie weit stimmt der eigene Weg mit der Lösung überein?
      let gleich = 0;
      while (gleich < stand.pfad.length && stand.pfad[gleich] === stand.loesung[gleich]) gleich += 1;

      if (gleich < stand.pfad.length) {
        s.blatt({
          titel: 'Ab hier führt es in die Irre',
          inhalt: 'Die ersten ' + gleich + ' Felder stimmen mit der Lösung überein, danach geht es woanders lang. '
            + 'Soll ich bis dorthin zurücknehmen?',
          aktionen: [
            { text: 'Zurücknehmen', tun: () => { stand.pfad = stand.pfad.slice(0, gleich); sichern(); zeichnen(); } },
            { text: 'Selbst suchen', art: 'still' },
          ],
        });
        return;
      }

      const naechstes = stand.loesung[gleich];
      const z = Math.floor(naechstes / stand.kanten) + 1;
      const sp = (naechstes % stand.kanten) + 1;
      s.blatt({
        titel: 'Der nächste Schritt',
        inhalt: 'Von hier geht es weiter auf Zeile ' + z + ', Spalte ' + sp + '.',
        aktionen: [
          { text: 'Gehen', tun: () => { stand.pfad.push(naechstes); sichern(); zeichnen(); pruefenObFertig(); } },
          { text: 'Selbst gehen', art: 'still' },
        ],
      });
    }

    function pruefenObFertig() {
      if (stand.fertig) return;
      const k = stand.kanten;
      if (stand.pfad.length !== k * k) return;
      if (erreichteZahl(stand.pfad) !== stand.hoechste) return;
      if (stand.zahlAn[stand.pfad[stand.pfad.length - 1]] !== stand.hoechste) return;

      stand.verbraucht = zeitJetzt();
      stand.fertig = true;
      s.notieren({
        gewonnen: true,
        dauer: stand.verbraucht,
        stufe: stand.stufe,
        hilfen: stand.hilfen,
      });
      s.merken(stand);
      zeichnen();
    }

    /* ------------------------------------------------------------ Zeichnen */

    function zeichnen() {
      const k = stand.kanten;
      for (let i = 0; i < felder.length; i += 1) {
        const f = felder[i];
        const zahl = stand.zahlAn[i];
        f.textContent = zahl ? String(zahl) : '';
        f.dataset.zahl = zahl ? 'ja' : 'nein';
        const platz = stand.pfad.indexOf(i);
        f.dataset.besucht = platz >= 0 ? 'ja' : 'nein';
        if (platz === stand.pfad.length - 1 && platz >= 0) f.dataset.spitze = 'ja';
        else delete f.dataset.spitze;
      }

      // Der Weg als eine durchgehende Linie über dem Gitter.
      linie.replaceChildren();
      if (stand.pfad.length > 1) {
        const zug = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        zug.setAttribute('points', stand.pfad
          .map((i) => ((i % k) + 0.5) + ',' + (Math.floor(i / k) + 0.5)).join(' '));
        zug.setAttribute('fill', 'none');
        zug.setAttribute('stroke-width', '0.34');
        zug.setAttribute('stroke-linecap', 'round');
        zug.setAttribute('stroke-linejoin', 'round');
        linie.append(zug);
      }

      kopfZeichnen();
      endeZeichnen();
      leiste.hidden = stand.fertig;
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      kopf.append(el('span', null, STUFEN[stand.stufe].name));
      const zeit = el('span', null, '');
      zeit.append(el('b', null, s.dauerText(zeitJetzt()) === '–' ? '0 s' : s.dauerText(zeitJetzt())));
      kopf.append(zeit);
      kopf.append(el('span', null, stand.pfad.length + '/' + (stand.kanten * stand.kanten) + ' Felder'));
      s.unter('Zahl ' + Math.max(1, erreichteZahl(stand.pfad)) + ' von ' + stand.hoechste);
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !stand.fertig;
      if (!stand.fertig) return;
      endeKasten.append(el('p', 'ende-titel', 'Weg gefunden.'));
      endeKasten.append(el('p', 'notiz', STUFEN[stand.stufe].name + ' · ' + s.dauerText(stand.verbraucht)
        + (stand.hilfen ? ' · ' + stand.hilfen + ' Hinweise' : ' · ohne Hinweis')));
      const l = el('div', 'leiste');
      for (const stufe of Object.keys(STUFEN)) {
        const b = el('button', 'knopf ' + (stufe === stand.stufe ? 'knopf--voll' : 'knopf--still'), 'Neu, ' + STUFEN[stufe].name);
        b.type = 'button';
        b.addEventListener('click', () => neu(stufe));
        l.append(b);
      }
      endeKasten.append(l);
    }

    /* Ein 7×7-Rätsel zu bauen kostet ein paar Sekunden. Damit die Oberfläche
       nicht einfach einfriert, erst melden, dann im nächsten Anlauf rechnen. */
    function neu(stufe) {
      const bauen = () => {
        stand = frisch(stufe);
        gitterBauen();
        sichern();
        zeichnen();
      };
      if (STUFEN[stufe].kanten >= 7) {
        s.toast('Der Weg wird gesucht – einen Moment.');
        setTimeout(bauen, 60);
      } else {
        bauen();
      }
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neues Rätsel',
        inhalt: 'Leicht ist 5 × 5, mittel 6 × 6, schwer 7 × 7. Jedes Rätsel hat genau einen möglichen Weg.',
        aktionen: [
          { text: 'Leicht', tun: () => neu('leicht') },
          { text: 'Mittel', art: 'still', tun: () => neu('mittel') },
          { text: 'Schwer', art: 'still', tun: () => neu('schwer') },
        ],
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Ziehe einen Weg, der bei der 1 beginnt und die Zahlen der Reihe nach abklappert – 1, dann 2, dann 3 und so fort.'));
      d.append(el('p', 'notiz', 'Der Weg muss am Ende jedes einzelne Feld genau einmal berührt haben und bei der höchsten Zahl enden. Kein Feld bleibt frei, keines wird zweimal betreten.'));
      d.append(el('p', 'notiz', 'Gezogen wird mit dem Finger oder der Maus über benachbarte Felder – nur waagerecht und senkrecht, nicht über Eck. Auf das vorletzte Feld zurückziehen nimmt einen Schritt zurück.'));
      d.append(el('p', 'notiz', 'Guter Anfang: Ecken und Ränder. Ein Eckfeld hat nur zwei Nachbarn, der Weg muss dort also fast zwangsläufig durch.'));
      s.blatt({ titel: 'Weg', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function beiGroesse() { gitterBauen(); zeichnen(); }
    window.addEventListener('resize', beiGroesse);

    gitterBauen();
    sichern();
    zeichnen();
    uhr = setInterval(() => { if (!stand.fertig) kopfZeichnen(); }, 1000);

    return {
      ende: () => {
        clearInterval(uhr);
        window.removeEventListener('resize', beiGroesse);
        window.removeEventListener('pointerup', beiLoslassen);
        window.removeEventListener('pointercancel', beiLoslassen);
        if (!stand.fertig) sichern();
      },
    };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien, hilfe) {
    const bestzeit = (stufe) => {
      const zeiten = partien.filter((p) => p.gewonnen && p.stufe === stufe && p.dauer > 0).map((p) => p.dauer);
      return zeiten.length ? hilfe.dauerText(Math.min(...zeiten)) : '–';
    };
    return [
      { wert: bestzeit('leicht'), label: 'Bestzeit 5×5' },
      { wert: bestzeit('mittel'), label: 'Bestzeit 6×6' },
      { wert: bestzeit('schwer'), label: 'Bestzeit 7×7' },
    ];
  }

  Rahmen.anmelden({
    id: 'zip',
    name: 'Weg',
    unter: 'Ein Zug durch jedes Feld.',
    farbe: '#4573B8',
    symbol: '<path d="M5 5h6a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="5" cy="5" r="1.6"/><circle cx="14" cy="17" r="1.6"/>',
    starten,
    auswertung,
  });
})();
