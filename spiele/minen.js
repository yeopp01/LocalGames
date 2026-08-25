/* Minenfeld – das alte Minesweeper.

   Aufdecken, bis nur noch die Minen zugedeckt sind. Die Zahl in einem Feld
   sagt, wie viele der acht Nachbarn eine Mine tragen.

   Zwei Dinge sind hier bewusst anders als im Original:
   · Der erste Klick ist immer sicher – die Minen werden erst danach verteilt,
     und zwar außerhalb des angetippten Feldes samt seiner Nachbarn.
   · Für Finger gibt es einen Fahnen-Modus. Am Rechner geht weiterhin die
     rechte Maustaste, auf dem Handy zusätzlich langes Drücken.
*/

(() => {
  const STUFEN = {
    klein:  { name: 'klein',  spalten: 8,  zeilen: 10, minen: 10 },
    mittel: { name: 'mittel', spalten: 10, zeilen: 14, minen: 24 },
    gross:  { name: 'groß',   spalten: 12, zeilen: 18, minen: 40 },
  };

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let fahnenModus = false;
    let uhr = null;
    let druckUhr = null;
    let langGedrueckt = false;

    function frisch(stufe) {
      const { spalten, zeilen, minen } = STUFEN[stufe];
      return {
        stufe,
        spalten,
        zeilen,
        minen,
        mine: new Array(spalten * zeilen).fill(false),
        offen: new Array(spalten * zeilen).fill(false),
        fahne: new Array(spalten * zeilen).fill(false),
        gelegt: false,          // Minen liegen erst nach dem ersten Klick
        verbraucht: 0,
        seit: Date.now(),
        fertig: null,           // null | 'sieg' | 'bumm'
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.mine) && !alt.fertig) {
        alt.seit = Date.now();
        return alt;
      }
      return frisch('klein');
    }

    const anzahl = () => stand.spalten * stand.zeilen;
    const zeitJetzt = () => stand.verbraucht + (stand.fertig || !stand.gelegt ? 0 : Date.now() - stand.seit);

    function sichern() {
      if (!stand.fertig) {
        stand.verbraucht = zeitJetzt();
        stand.seit = Date.now();
      }
      s.merken(stand);
    }

    function nachbarn(i) {
      const z = Math.floor(i / stand.spalten);
      const sp = i % stand.spalten;
      const raus = [];
      for (let dz = -1; dz <= 1; dz += 1) {
        for (let ds = -1; ds <= 1; ds += 1) {
          if (!dz && !ds) continue;
          const nz = z + dz;
          const ns = sp + ds;
          if (nz < 0 || ns < 0 || nz >= stand.zeilen || ns >= stand.spalten) continue;
          raus.push(nz * stand.spalten + ns);
        }
      }
      return raus;
    }

    const minenUm = (i) => nachbarn(i).filter((j) => stand.mine[j]).length;

    function minenLegen(sicher) {
      const tabu = new Set([sicher, ...nachbarn(sicher)]);
      const frei = [];
      for (let i = 0; i < anzahl(); i += 1) if (!tabu.has(i)) frei.push(i);
      for (let i = frei.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [frei[i], frei[j]] = [frei[j], frei[i]];
      }
      for (const i of frei.slice(0, Math.min(stand.minen, frei.length))) stand.mine[i] = true;
      stand.gelegt = true;
      stand.seit = Date.now();
    }

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const rahmen = el('div', 'm-rahmen');
    const gitter = el('div', 'm-gitter');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste');
    rahmen.append(gitter);
    wurzel.append(kopf, rahmen, endeKasten, leiste);

    const fahnenKnopf = el('button', 'knopf knopf--still', 'Fahne setzen');
    fahnenKnopf.type = 'button';
    fahnenKnopf.addEventListener('click', () => { fahnenModus = !fahnenModus; zeichnen(); });
    leiste.append(fahnenKnopf);

    s.werkzeuge([
      { label: 'Regeln', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: regelnZeigen },
      { label: 'Neues Feld', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    let felder = [];

    function gitterBauen() {
      gitter.replaceChildren();
      felder = [];
      gitter.style.gridTemplateColumns = 'repeat(' + stand.spalten + ', var(--kachel))';
      const platz = Math.min(400, window.innerWidth - 28);
      const kachel = Math.max(20, Math.floor((platz - (stand.spalten - 1) * 2) / stand.spalten));
      gitter.style.setProperty('--kachel', kachel + 'px');

      for (let i = 0; i < anzahl(); i += 1) {
        const f = el('button', 'm-feld');
        f.type = 'button';
        const nr = i;
        f.addEventListener('click', () => { if (!langGedrueckt) antippen(nr); langGedrueckt = false; });
        f.addEventListener('contextmenu', (e) => { e.preventDefault(); fahneWechseln(nr); });
        f.addEventListener('pointerdown', () => {
          clearTimeout(druckUhr);
          druckUhr = setTimeout(() => { langGedrueckt = true; fahneWechseln(nr); }, 420);
        });
        for (const art of ['pointerup', 'pointerleave', 'pointercancel']) {
          f.addEventListener(art, () => clearTimeout(druckUhr));
        }
        gitter.append(f);
        felder.push(f);
      }
    }

    /* ------------------------------------------------------------- Spielzug */

    function antippen(i) {
      if (stand.fertig) return;
      if (fahnenModus) { fahneWechseln(i); return; }
      if (stand.fahne[i]) return;

      if (!stand.gelegt) minenLegen(i);

      if (stand.offen[i]) { umgebungOeffnen(i); return; }

      if (stand.mine[i]) {
        stand.offen[i] = true;
        abschluss('bumm');
        return;
      }

      aufdecken(i);
      sichern();
      zeichnen();
      siegPruefen();
    }

    /* Leere Felder ziehen ihre Nachbarn mit auf – iterativ, nicht rekursiv. */
    function aufdecken(start) {
      const stapel = [start];
      while (stapel.length) {
        const i = stapel.pop();
        if (stand.offen[i] || stand.fahne[i]) continue;
        stand.offen[i] = true;
        if (minenUm(i) === 0) {
          for (const j of nachbarn(i)) if (!stand.offen[j] && !stand.mine[j]) stapel.push(j);
        }
      }
    }

    /* Auf eine offene Zahl tippen: sind genug Fahnen gesetzt, geht der Rest auf. */
    function umgebungOeffnen(i) {
      const zahl = minenUm(i);
      if (!zahl) return;
      const um = nachbarn(i);
      if (um.filter((j) => stand.fahne[j]).length !== zahl) return;

      for (const j of um) {
        if (stand.fahne[j] || stand.offen[j]) continue;
        if (stand.mine[j]) { stand.offen[j] = true; abschluss('bumm'); return; }
        aufdecken(j);
      }
      sichern();
      zeichnen();
      siegPruefen();
    }

    function fahneWechseln(i) {
      if (stand.fertig || stand.offen[i]) return;
      stand.fahne[i] = !stand.fahne[i];
      sichern();
      zeichnen();
    }

    function siegPruefen() {
      if (stand.fertig) return;
      for (let i = 0; i < anzahl(); i += 1) {
        if (!stand.mine[i] && !stand.offen[i]) return;
      }
      for (let i = 0; i < anzahl(); i += 1) if (stand.mine[i]) stand.fahne[i] = true;
      abschluss('sieg');
    }

    function abschluss(ausgang) {
      stand.verbraucht = zeitJetzt();
      stand.fertig = ausgang;
      s.notieren({
        gewonnen: ausgang === 'sieg',
        dauer: stand.verbraucht,
        stufe: stand.stufe,
        aufgedeckt: stand.offen.filter(Boolean).length,
      });
      s.merken(stand);
      zeichnen();
    }

    /* ------------------------------------------------------------ Zeichnen */

    function zeichnen() {
      for (let i = 0; i < anzahl(); i += 1) {
        const f = felder[i];
        if (!f) continue;
        for (const merkmal of ['offen', 'zahl', 'mine', 'fahne']) delete f.dataset[merkmal];
        f.textContent = '';

        const verloren = stand.fertig === 'bumm';

        if (stand.fahne[i] && !stand.offen[i]) {
          f.dataset.fahne = 'ja';
          f.textContent = verloren && !stand.mine[i] ? '×' : '⚑';
          continue;
        }
        if (stand.offen[i] || (verloren && stand.mine[i])) {
          f.dataset.offen = 'ja';
          if (stand.mine[i]) {
            f.dataset.mine = 'ja';
            f.textContent = '✳';
          } else {
            const n = minenUm(i);
            if (n) { f.textContent = String(n); f.dataset.zahl = String(n); }
          }
        }
      }

      kopfZeichnen();
      fahnenKnopf.className = 'knopf ' + (fahnenModus ? 'knopf--voll' : 'knopf--still');
      fahnenKnopf.textContent = fahnenModus ? 'Fahne setzen: an' : 'Fahne setzen';
      leiste.hidden = !!stand.fertig;
      endeZeichnen();
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      const gesetzt = stand.fahne.filter(Boolean).length;
      kopf.append(el('span', null, STUFEN[stand.stufe].name));
      const minenText = el('span', null, '');
      minenText.append(el('b', null, String(stand.minen - gesetzt)));
      minenText.append(document.createTextNode(' Minen'));
      kopf.append(minenText);
      const zeit = el('span', null, '');
      zeit.append(el('b', null, stand.gelegt ? s.dauerText(zeitJetzt()) : '0 s'));
      kopf.append(zeit);
      s.unter(stand.spalten + ' × ' + stand.zeilen);
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !stand.fertig;
      if (!stand.fertig) return;
      endeKasten.append(el('p', 'ende-titel', stand.fertig === 'sieg' ? 'Feld geräumt.' : 'Bumm.'));
      endeKasten.append(el('p', 'notiz', stand.fertig === 'sieg'
        ? STUFEN[stand.stufe].name + ' · ' + s.dauerText(stand.verbraucht)
        : 'Eine Mine erwischt. Die anderen liegen jetzt offen.'));

      const l = el('div', 'leiste');
      for (const stufe of Object.keys(STUFEN)) {
        const b = el('button', 'knopf ' + (stufe === stand.stufe ? 'knopf--voll' : 'knopf--still'), 'Neu, ' + STUFEN[stufe].name);
        b.type = 'button';
        b.addEventListener('click', () => neu(stufe));
        l.append(b);
      }
      endeKasten.append(l);
    }

    function neu(stufe) {
      stand = frisch(stufe);
      gitterBauen();
      sichern();
      zeichnen();
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neues Feld',
        inhalt: 'Klein ist 8 × 10 mit 10 Minen, mittel 10 × 14 mit 24, groß 12 × 18 mit 40.',
        aktionen: [
          { text: 'Klein', tun: () => neu('klein') },
          { text: 'Mittel', art: 'still', tun: () => neu('mittel') },
          { text: 'Groß', art: 'still', tun: () => neu('gross') },
        ],
      });
    }

    function regelnZeigen() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Decke alle Felder auf, unter denen keine Mine liegt. Die Zahl sagt, wie viele der acht Nachbarn vermint sind.'));
      d.append(el('p', 'notiz', 'Der erste Klick geht nie daneben – die Minen werden erst danach verteilt.'));
      d.append(el('p', 'notiz', 'Fahne setzen: den Knopf einschalten, lange auf ein Feld drücken oder rechts klicken.'));
      d.append(el('p', 'notiz', 'Auf eine schon offene Zahl tippen deckt die restlichen Nachbarn auf, sobald genug Fahnen stehen.'));
      s.blatt({ titel: 'Minenfeld', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function beiGroesse() { gitterBauen(); zeichnen(); }
    window.addEventListener('resize', beiGroesse);

    gitterBauen();
    sichern();
    zeichnen();
    uhr = setInterval(() => { if (!stand.fertig && stand.gelegt) kopfZeichnen(); }, 1000);

    return {
      ende: () => {
        clearInterval(uhr);
        clearTimeout(druckUhr);
        window.removeEventListener('resize', beiGroesse);
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
      { wert: bestzeit('klein'), label: 'Bestzeit klein' },
      { wert: bestzeit('mittel'), label: 'Bestzeit mittel' },
      { wert: bestzeit('gross'), label: 'Bestzeit groß' },
    ];
  }

  Rahmen.anmelden({
    id: 'minen',
    name: 'Minenfeld',
    unter: 'Aufdecken, ohne zu treten.',
    farbe: '#B45B3E',
    symbol: '<circle cx="12" cy="13" r="6"/><path d="M12 4v3M18.4 6.6l-2 2M5.6 6.6l2 2" stroke-linecap="round"/>',
    starten,
    auswertung,
  });
})();
