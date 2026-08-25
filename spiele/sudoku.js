/* Mini-Sudoku – 6x6 mit den Ziffern 1 bis 6.

   Das Feld ist in sechs Blöcke geteilt, jeder 3 breit und 2 hoch. In jeder
   Zeile, jeder Spalte und jedem Block steht jede Ziffer genau einmal.

   Die Rätsel entstehen im Browser: erst ein vollständiges Gitter per
   Backtracking, dann werden Felder geleert, solange die Lösung eindeutig
   bleibt. Geprüft wird das, indem der Löser bis zur zweiten Lösung zählt.
*/

(() => {
  const N = 6;
  const BLOCK_B = 3;   // Blockbreite
  const BLOCK_H = 2;   // Blockhöhe

  const STUFEN = {
    leicht: { name: 'leicht', gegeben: 20 },
    mittel: { name: 'mittel', gegeben: 15 },
    schwer: { name: 'schwer', gegeben: 11 },
  };

  const zeileVon = (i) => Math.floor(i / N);
  const spalteVon = (i) => i % N;
  const blockVon = (i) =>
    Math.floor(zeileVon(i) / BLOCK_H) * (N / BLOCK_B) + Math.floor(spalteVon(i) / BLOCK_B);

  /* Für jedes Feld die Felder, die es sehen kann – einmal vorberechnet. */
  const NACHBARN = Array.from({ length: N * N }, (_, i) => {
    const menge = new Set();
    for (let j = 0; j < N * N; j += 1) {
      if (j === i) continue;
      if (zeileVon(j) === zeileVon(i) || spalteVon(j) === spalteVon(i) || blockVon(j) === blockVon(i)) {
        menge.add(j);
      }
    }
    return [...menge];
  });

  /* Die 18 Einheiten, in denen jede Ziffer genau einmal vorkommt:
     sechs Zeilen, sechs Spalten, sechs Blöcke. Der Hinweis argumentiert damit. */
  const EINHEITEN = (() => {
    const raus = [];
    for (let z = 0; z < N; z += 1) {
      raus.push({ art: 'Zeile', nummer: z + 1, felder: [...Array(N).keys()].map((s) => z * N + s) });
    }
    for (let s = 0; s < N; s += 1) {
      raus.push({ art: 'Spalte', nummer: s + 1, felder: [...Array(N).keys()].map((z) => z * N + s) });
    }
    for (let b = 0; b < N; b += 1) {
      raus.push({
        art: 'Block',
        nummer: b + 1,
        felder: [...Array(N * N).keys()].filter((i) => blockVon(i) === b),
      });
    }
    return raus;
  })();

  const mischen = (feld) => {
    for (let i = feld.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [feld[i], feld[j]] = [feld[j], feld[i]];
    }
    return feld;
  };

  function erlaubt(gitter, i, wert) {
    for (const j of NACHBARN[i]) if (gitter[j] === wert) return false;
    return true;
  }

  function fuellen(gitter, i = 0) {
    if (i === N * N) return true;
    if (gitter[i]) return fuellen(gitter, i + 1);
    for (const wert of mischen([1, 2, 3, 4, 5, 6])) {
      if (!erlaubt(gitter, i, wert)) continue;
      gitter[i] = wert;
      if (fuellen(gitter, i + 1)) return true;
      gitter[i] = 0;
    }
    return false;
  }

  /* Zählt Lösungen, bricht bei der zweiten ab – mehr muss man nicht wissen. */
  function loesungen(gitter, gefunden = 0) {
    let i = -1;
    let wenigste = 99;
    for (let k = 0; k < N * N; k += 1) {
      if (gitter[k]) continue;
      let zahl = 0;
      for (let w = 1; w <= N; w += 1) if (erlaubt(gitter, k, w)) zahl += 1;
      if (zahl < wenigste) { wenigste = zahl; i = k; }
      if (zahl === 0) return gefunden;
    }
    if (i === -1) return gefunden + 1;

    for (let w = 1; w <= N; w += 1) {
      if (!erlaubt(gitter, i, w)) continue;
      gitter[i] = w;
      gefunden = loesungen(gitter, gefunden);
      gitter[i] = 0;
      if (gefunden > 1) return gefunden;
    }
    return gefunden;
  }

  function raetselBauen(stufe) {
    const loesung = new Array(N * N).fill(0);
    fuellen(loesung);

    const raetsel = loesung.slice();
    let offen = N * N;
    for (const i of mischen([...Array(N * N).keys()])) {
      if (offen <= STUFEN[stufe].gegeben) break;
      const gemerkt = raetsel[i];
      raetsel[i] = 0;
      if (loesungen(raetsel.slice()) === 1) offen -= 1;
      else raetsel[i] = gemerkt;
    }
    return { raetsel, loesung };
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let gewaehlt = -1;
    let notizModus = false;
    let uhr = null;

    function frisch(stufe) {
      const { raetsel, loesung } = raetselBauen(stufe);
      return {
        stufe,
        raetsel,
        loesung,
        eingabe: raetsel.slice(),
        notizen: Array.from({ length: N * N }, () => []),
        verbraucht: 0,
        seit: Date.now(),
        hilfen: 0,
        fertig: false,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.eingabe) && alt.eingabe.length === N * N && !alt.fertig) {
        alt.seit = Date.now();
        return alt;
      }
      return frisch('leicht');
    }

    const zeitJetzt = () => stand.verbraucht + (stand.fertig ? 0 : Date.now() - stand.seit);

    function sichern() {
      stand.verbraucht = zeitJetzt();
      stand.seit = Date.now();
      s.merken(stand);
    }

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const gitter = el('div', 's-gitter');
    const pad = el('div', 's-pad');
    const leiste = el('div', 'leiste');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;

    wurzel.append(kopf, gitter, endeKasten, pad, leiste);

    const felder = [];
    for (let i = 0; i < N * N; i += 1) {
      const f = el('button', 's-feld');
      f.type = 'button';
      f.dataset.zeile = String(zeileVon(i));
      f.dataset.spalte = String(spalteVon(i));
      f.addEventListener('click', () => { gewaehlt = i; zeichnen(); });
      gitter.append(f);
      felder.push(f);
    }

    const padTasten = [];
    for (let w = 1; w <= N; w += 1) {
      const t = el('button', 's-taste', String(w));
      t.type = 'button';
      t.addEventListener('click', () => setzen(w));
      pad.append(t);
      padTasten.push(t);
    }
    const loeschTaste = el('button', 's-taste');
    loeschTaste.type = 'button';
    loeschTaste.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-6-6 6-6z"/><path d="M17 10l-4 4M13 10l4 4"/></svg>';
    loeschTaste.setAttribute('aria-label', 'Feld leeren');
    loeschTaste.addEventListener('click', () => setzen(0));
    pad.append(loeschTaste);

    const notizKnopf = el('button', 'knopf knopf--still', 'Notizen');
    notizKnopf.type = 'button';
    notizKnopf.addEventListener('click', () => { notizModus = !notizModus; zeichnen(); });
    const hinweisKnopf = el('button', 'knopf knopf--still', 'Hinweis');
    hinweisKnopf.type = 'button';
    hinweisKnopf.addEventListener('click', hinweis);
    leiste.append(notizKnopf, hinweisKnopf);

    s.werkzeuge([
      { label: 'Regeln', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: regelnZeigen },
      { label: 'Neues Rätsel', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    /* ------------------------------------------------------------ Zeichnen */

    /* Ein Feld ist falsch, wenn seine Ziffer schon bei einem Nachbarn steht. */
    function fehlerhaft() {
      const raus = new Set();
      for (let i = 0; i < N * N; i += 1) {
        const w = stand.eingabe[i];
        if (!w) continue;
        for (const j of NACHBARN[i]) {
          if (stand.eingabe[j] === w) { raus.add(i); raus.add(j); }
        }
      }
      return raus;
    }

    function zeichnen() {
      const fehler = fehlerhaft();
      const gewaehltWert = gewaehlt >= 0 ? stand.eingabe[gewaehlt] : 0;

      for (let i = 0; i < N * N; i += 1) {
        const f = felder[i];
        const wert = stand.eingabe[i];
        const fest = stand.raetsel[i] !== 0;

        f.replaceChildren();
        f.textContent = wert ? String(wert) : '';
        f.dataset.fest = fest ? 'ja' : 'nein';

        for (const merkmal of ['gewaehlt', 'verwandt', 'gleich', 'fehler']) delete f.dataset[merkmal];
        if (i === gewaehlt) f.dataset.gewaehlt = 'ja';
        else if (gewaehlt >= 0 && NACHBARN[gewaehlt].includes(i)) f.dataset.verwandt = 'ja';
        if (wert && gewaehltWert && wert === gewaehltWert && i !== gewaehlt) f.dataset.gleich = 'ja';
        if (fehler.has(i)) f.dataset.fehler = 'ja';

        if (!wert && stand.notizen[i] && stand.notizen[i].length) {
          const kasten = el('span', 's-notizen');
          for (let w = 1; w <= N; w += 1) {
            kasten.append(el('span', 's-notiz', stand.notizen[i].includes(w) ? String(w) : ''));
          }
          f.append(kasten);
        }
      }

      // Ziffern, die schon sechsmal stehen, treten in den Hintergrund.
      for (let w = 1; w <= N; w += 1) {
        const zahl = stand.eingabe.filter((x) => x === w).length;
        padTasten[w - 1].dataset.fertig = zahl >= N ? 'ja' : 'nein';
      }

      notizKnopf.dataset.an = notizModus ? 'ja' : 'nein';
      notizKnopf.className = 'knopf ' + (notizModus ? 'knopf--voll' : 'knopf--still');
      hinweisKnopf.disabled = stand.fertig;

      kopfZeichnen();
      endeZeichnen();
      pad.hidden = stand.fertig;
      leiste.hidden = stand.fertig;
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      const offen = stand.eingabe.filter((x) => !x).length;
      kopf.append(el('span', null, STUFEN[stand.stufe].name));
      const zeit = el('span', null, '');
      zeit.append(el('b', null, s.dauerText(zeitJetzt())));
      kopf.append(zeit);
      kopf.append(el('span', null, offen + ' offen'));
      s.unter('Ziffern 1 bis 6');
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !stand.fertig;
      if (!stand.fertig) return;
      endeKasten.append(el('p', 'ende-titel', 'Gelöst.'));
      endeKasten.append(el('p', 'notiz',
        STUFEN[stand.stufe].name + ' · ' + s.dauerText(stand.verbraucht) +
        (stand.hilfen ? ' · ' + stand.hilfen + ' Hinweise' : ' · ohne Hinweis')));

      const l = el('div', 'leiste');
      for (const stufe of Object.keys(STUFEN)) {
        const b = el('button', 'knopf ' + (stufe === stand.stufe ? 'knopf--voll' : 'knopf--still'), 'Neu, ' + STUFEN[stufe].name);
        b.type = 'button';
        b.addEventListener('click', () => neu(stufe));
        l.append(b);
      }
      endeKasten.append(l);
    }

    /* -------------------------------------------------------------- Züge */

    function setzen(wert) {
      if (stand.fertig || gewaehlt < 0) { if (!stand.fertig) s.toast('Erst ein Feld antippen.'); return; }
      if (stand.raetsel[gewaehlt]) { s.toast('Das Feld war vorgegeben.'); return; }

      if (wert === 0) {
        stand.eingabe[gewaehlt] = 0;
        stand.notizen[gewaehlt] = [];
      } else if (notizModus) {
        const notizen = stand.notizen[gewaehlt];
        const pos = notizen.indexOf(wert);
        if (pos >= 0) notizen.splice(pos, 1); else notizen.push(wert);
        stand.eingabe[gewaehlt] = 0;
      } else {
        stand.eingabe[gewaehlt] = stand.eingabe[gewaehlt] === wert ? 0 : wert;
        stand.notizen[gewaehlt] = [];
        // Die gesetzte Ziffer aus den Notizen der Nachbarn nehmen.
        if (stand.eingabe[gewaehlt]) {
          for (const j of NACHBARN[gewaehlt]) {
            const n = stand.notizen[j];
            const pos = n ? n.indexOf(wert) : -1;
            if (pos >= 0) n.splice(pos, 1);
          }
        }
      }

      sichern();
      zeichnen();
      pruefenObFertig();
    }

    /* Welche Ziffern kämen in einem leeren Feld überhaupt noch in Frage? */
    function kandidaten(i) {
      if (stand.eingabe[i]) return [];
      const raus = [];
      for (let w = 1; w <= N; w += 1) {
        let frei = true;
        for (const j of NACHBARN[i]) {
          if (stand.eingabe[j] === w) { frei = false; break; }
        }
        if (frei) raus.push(w);
      }
      return raus;
    }

    const platzName = (i) => 'Zeile ' + (zeileVon(i) + 1) + ', Spalte ' + (spalteVon(i) + 1);

    /* Der nächste Zug, der sich wirklich begründen lässt. Zwei Techniken:

       Nacktes Single    – in diesem Feld ist nur noch eine Ziffer möglich.
       Verstecktes Single – diese Ziffer hat in der Zeile, Spalte oder im Block
                            nur noch dieses eine Feld übrig.

       Gesucht wird erst am gewählten Feld, damit der Hinweis dort ansetzt,
       wo man gerade hinschaut. */
    function naechsterSchluss() {
      const reihenfolge = [...Array(N * N).keys()];
      if (gewaehlt >= 0) {
        reihenfolge.splice(reihenfolge.indexOf(gewaehlt), 1);
        reihenfolge.unshift(gewaehlt);
      }

      for (const i of reihenfolge) {
        if (stand.eingabe[i]) continue;
        const k = kandidaten(i);
        if (k.length === 1) return { feld: i, wert: k[0], art: 'nackt' };
      }

      for (const einheit of EINHEITEN) {
        for (let w = 1; w <= N; w += 1) {
          if (einheit.felder.some((i) => stand.eingabe[i] === w)) continue;
          const plaetze = einheit.felder.filter((i) => !stand.eingabe[i] && kandidaten(i).includes(w));
          if (plaetze.length === 1) {
            return { feld: plaetze[0], wert: w, art: 'versteckt', einheit };
          }
        }
      }
      return null;
    }

    function eintragen(i, wert) {
      stand.eingabe[i] = wert;
      stand.notizen[i] = [];
      for (const j of NACHBARN[i]) {
        const n = stand.notizen[j];
        const pos = n ? n.indexOf(wert) : -1;
        if (pos >= 0) n.splice(pos, 1);
      }
      gewaehlt = i;
      sichern();
      zeichnen();
      pruefenObFertig();
    }

    function hinweis() {
      if (stand.fertig) return;

      // Mit einer falschen Ziffer im Feld stimmt jede Begründung nicht mehr.
      if (fehlerhaft().size) {
        s.blatt({
          titel: 'Erst die roten Felder',
          inhalt: 'Eine Ziffer steht doppelt in Zeile, Spalte oder Block. Solange das so ist, führt jede Überlegung in die Irre – räum das zuerst weg.',
          aktionen: [{ text: 'Mach ich' }],
        });
        return;
      }

      const leer = stand.eingabe.some((w) => !w);
      if (!leer) return;

      const schluss = naechsterSchluss();
      stand.hilfen += 1;

      if (!schluss) {
        // Kommt vor: schwere Rätsel brauchen stellenweise mehr als diese zwei
        // Techniken. Dann lieber ehrlich sein als eine Begründung erfinden.
        const offen = stand.eingabe.map((w, i) => (w ? -1 : i)).filter((i) => i >= 0);
        const ziel = gewaehlt >= 0 && !stand.eingabe[gewaehlt]
          ? gewaehlt
          : offen[Math.floor(Math.random() * offen.length)];
        s.blatt({
          titel: 'Hier hilft nur Ausprobieren',
          inhalt: 'An keiner Stelle lässt sich gerade allein aus Zeile, Spalte und Block eine Ziffer erzwingen. Weiter kommt man hier nur, indem man eine Möglichkeit annimmt und schaut, ob sie sich später widerspricht. Soll ich stattdessen ein Feld aufdecken?',
          aktionen: [
            { text: 'Feld aufdecken', tun: () => eintragen(ziel, stand.loesung[ziel]) },
            { text: 'Lieber nicht', art: 'still' },
          ],
        });
        sichern();
        return;
      }

      const { feld, wert, art, einheit } = schluss;
      const begruendung = art === 'nackt'
        ? platzName(feld) + ': Alle anderen Ziffern stehen dort schon in der Zeile, '
          + 'der Spalte oder im Block. Übrig bleibt nur die ' + wert + '.'
        : 'In ' + (einheit.art === 'Block' ? 'Block ' + einheit.nummer : einheit.art + ' ' + einheit.nummer)
          + ' ist die ' + wert + ' noch nicht vergeben – und von allen freien Feldern dort kommt '
          + 'nur ' + platzName(feld) + ' dafür in Frage.';

      gewaehlt = feld;
      zeichnen();

      s.blatt({
        titel: art === 'nackt' ? 'Nur eine Ziffer passt' : 'Nur ein Feld bleibt',
        inhalt: begruendung,
        aktionen: [
          { text: 'Eintragen', tun: () => eintragen(feld, wert) },
          { text: 'Mach ich selbst', art: 'still' },
        ],
      });
      sichern();
    }

    function pruefenObFertig() {
      if (stand.fertig) return;
      for (let i = 0; i < N * N; i += 1) if (stand.eingabe[i] !== stand.loesung[i]) return;
      stand.verbraucht = zeitJetzt();
      stand.fertig = true;
      gewaehlt = -1;
      s.notieren({
        gewonnen: true,
        dauer: stand.verbraucht,
        stufe: stand.stufe,
        hilfen: stand.hilfen,
      });
      s.merken(stand);
      zeichnen();
    }

    function neu(stufe) {
      stand = frisch(stufe);
      gewaehlt = -1;
      sichern();
      zeichnen();
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neues Rätsel',
        inhalt: 'Je schwerer die Stufe, desto weniger Ziffern stehen zu Beginn im Feld. Eindeutig lösbar ist jedes.',
        aktionen: [
          { text: 'Leicht', tun: () => neu('leicht') },
          { text: 'Mittel', art: 'still', tun: () => neu('mittel') },
          { text: 'Schwer', art: 'still', tun: () => neu('schwer') },
        ],
      });
    }

    function regelnZeigen() {
      const d = el('div');
      d.append(el('p', 'notiz', 'In jede Zeile, jede Spalte und jeden der sechs Blöcke gehört jede Ziffer von 1 bis 6 genau einmal.'));
      d.append(el('p', 'notiz', 'Ein Feld antippen, dann eine Ziffer wählen. Nochmal dieselbe Ziffer nimmt sie wieder weg.'));
      d.append(el('p', 'notiz', 'Notizen merken sich Kandidaten in kleiner Schrift. Doppelte Ziffern werden sofort rot.'));
      s.blatt({ titel: 'Mini-Sudoku', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* ---------------------------------------------------------- Tastatur */

    function taste(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!document.getElementById('sheet-spiel').hidden) return;
      if (e.key >= '1' && e.key <= '6') { e.preventDefault(); setzen(Number(e.key)); return; }
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { e.preventDefault(); setzen(0); return; }
      if (e.key === 'n') { notizModus = !notizModus; zeichnen(); return; }
      const schritt = { ArrowUp: -N, ArrowDown: N, ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (schritt) {
        e.preventDefault();
        if (gewaehlt < 0) gewaehlt = 0;
        else {
          const ziel = gewaehlt + schritt;
          const zeilenwechsel = Math.abs(schritt) === 1 && zeileVon(ziel) !== zeileVon(gewaehlt);
          if (ziel >= 0 && ziel < N * N && !zeilenwechsel) gewaehlt = ziel;
        }
        zeichnen();
      }
    }
    window.addEventListener('keydown', taste);

    sichern();
    zeichnen();
    uhr = setInterval(() => { if (!stand.fertig) kopfZeichnen(); }, 1000);

    return {
      ende: () => {
        clearInterval(uhr);
        window.removeEventListener('keydown', taste);
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
    const sauber = partien.filter((p) => p.gewonnen && !p.hilfen).length;
    return [
      { wert: bestzeit('leicht'), label: 'Bestzeit leicht' },
      { wert: bestzeit('mittel'), label: 'Bestzeit mittel' },
      { wert: bestzeit('schwer'), label: 'Bestzeit schwer' },
      { wert: String(sauber), label: 'ohne Hinweis' },
    ];
  }

  Rahmen.anmelden({
    id: 'sudoku',
    name: 'Mini-Sudoku',
    unter: 'Sechs mal sechs, Ziffern 1 bis 6.',
    farbe: '#4573B8',
    symbol: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16M3 12h18"/>',
    starten,
    auswertung,
  });
})();
