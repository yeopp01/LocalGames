/* Vier gewinnt – gegen den Rechner.

   Der Gegner sucht seinen Zug mit Minimax und Alpha-Beta-Schnitt: er spielt
   alle Züge gedanklich durch, unterstellt dir dabei jeweils die beste Antwort
   und nimmt den Zug, der ihm im schlechtesten Fall am wenigsten schadet.

   Damit das flott bleibt, werden die Spalten von der Mitte nach außen
   geprüft – gute Züge zuerst gefunden heißt mehr abgeschnittene Äste.
*/

(() => {
  const SPALTEN = 7;
  const ZEILEN = 6;
  const LEER = 0;
  const MENSCH = 1;
  const RECHNER = 2;

  const STUFEN = {
    leicht: { name: 'leicht', tiefe: 2, schludert: 0.35 },
    mittel: { name: 'mittel', tiefe: 5, schludert: 0.08 },
    schwer: { name: 'schwer', tiefe: 7, schludert: 0 },
  };

  const feld = (z, s) => z * SPALTEN + s;

  /* Alle 69 Vierer-Fenster einmal vorberechnet – Grundlage für Sieg und
     Bewertung. */
  const FENSTER = (() => {
    const raus = [];
    for (let z = 0; z < ZEILEN; z += 1) {
      for (let s = 0; s < SPALTEN; s += 1) {
        if (s + 3 < SPALTEN) raus.push([0, 1, 2, 3].map((k) => feld(z, s + k)));
        if (z + 3 < ZEILEN) raus.push([0, 1, 2, 3].map((k) => feld(z + k, s)));
        if (s + 3 < SPALTEN && z + 3 < ZEILEN) raus.push([0, 1, 2, 3].map((k) => feld(z + k, s + k)));
        if (s - 3 >= 0 && z + 3 < ZEILEN) raus.push([0, 1, 2, 3].map((k) => feld(z + k, s - k)));
      }
    }
    return raus;
  })();

  /* Spalten von der Mitte nach außen: 3, 2, 4, 1, 5, 0, 6 */
  const REIHENFOLGE = [3, 2, 4, 1, 5, 0, 6];

  const freieZeile = (brett, s) => {
    for (let z = ZEILEN - 1; z >= 0; z -= 1) if (brett[feld(z, s)] === LEER) return z;
    return -1;
  };

  const moeglich = (brett) => REIHENFOLGE.filter((s) => freieZeile(brett, s) >= 0);

  function sieger(brett) {
    for (const f of FENSTER) {
      const a = brett[f[0]];
      if (a !== LEER && f.every((i) => brett[i] === a)) return { wer: a, felder: f };
    }
    return null;
  }

  /* Wie gut steht es für den Rechner? Offene Dreier und Zweier zählen,
     die Mittelspalte ist etwas wert, weil durch sie die meisten Vierer laufen. */
  function bewerten(brett) {
    let punkte = 0;
    for (const f of FENSTER) {
      let meine = 0;
      let deine = 0;
      for (const i of f) {
        if (brett[i] === RECHNER) meine += 1;
        else if (brett[i] === MENSCH) deine += 1;
      }
      if (meine && deine) continue;             // gemischt – für niemanden nutzbar
      if (meine === 3) punkte += 50;
      else if (meine === 2) punkte += 10;
      else if (meine === 1) punkte += 1;
      if (deine === 3) punkte -= 60;            // eigene Bedrohung etwas höher werten
      else if (deine === 2) punkte -= 10;
      else if (deine === 1) punkte -= 1;
    }
    for (let z = 0; z < ZEILEN; z += 1) {
      const m = brett[feld(z, 3)];
      if (m === RECHNER) punkte += 4;
      else if (m === MENSCH) punkte -= 4;
    }
    return punkte;
  }

  function minimax(brett, tiefe, alpha, beta, rechnerAmZug) {
    const sieg = sieger(brett);
    if (sieg) return sieg.wer === RECHNER ? 100000 + tiefe : -100000 - tiefe;

    const zuege = moeglich(brett);
    if (!zuege.length) return 0;
    if (tiefe === 0) return bewerten(brett);

    if (rechnerAmZug) {
      let bestes = -Infinity;
      for (const s of zuege) {
        const z = freieZeile(brett, s);
        brett[feld(z, s)] = RECHNER;
        bestes = Math.max(bestes, minimax(brett, tiefe - 1, alpha, beta, false));
        brett[feld(z, s)] = LEER;
        alpha = Math.max(alpha, bestes);
        if (alpha >= beta) break;
      }
      return bestes;
    }
    let schlechtestes = Infinity;
    for (const s of zuege) {
      const z = freieZeile(brett, s);
      brett[feld(z, s)] = MENSCH;
      schlechtestes = Math.min(schlechtestes, minimax(brett, tiefe - 1, alpha, beta, true));
      brett[feld(z, s)] = LEER;
      beta = Math.min(beta, schlechtestes);
      if (alpha >= beta) break;
    }
    return schlechtestes;
  }

  function bestesZug(brett, stufe) {
    const zuege = moeglich(brett);
    if (!zuege.length) return -1;

    // Auf der leichten Stufe greift der Rechner ab und zu daneben – aber nie
    // so, dass er einen sofortigen Sieg oder eine offene Niederlage übersieht.
    const bewertet = zuege.map((s) => {
      const z = freieZeile(brett, s);
      brett[feld(z, s)] = RECHNER;
      const wert = minimax(brett, STUFEN[stufe].tiefe - 1, -Infinity, Infinity, false);
      brett[feld(z, s)] = LEER;
      return { spalte: s, wert };
    });

    bewertet.sort((a, b) => b.wert - a.wert);
    const beste = bewertet[0];
    if (Math.abs(beste.wert) > 90000) return beste.spalte;
    if (Math.random() < STUFEN[stufe].schludert && bewertet.length > 1) {
      return bewertet[1 + Math.floor(Math.random() * (bewertet.length - 1))].spalte;
    }
    return beste.spalte;
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let denkt = false;

    function frisch(stufe, anfang) {
      return {
        stufe: stufe || (stand && stand.stufe) || 'mittel',
        brett: new Array(SPALTEN * ZEILEN).fill(LEER),
        amZug: anfang || MENSCH,
        zuege: 0,
        begonnen: Date.now(),
        fertig: null,            // null | 'sieg' | 'pleite' | 'remis'
        siegfelder: null,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.brett) && alt.brett.length === SPALTEN * ZEILEN && !alt.fertig) {
        return alt;
      }
      return frisch('mittel', MENSCH);
    }

    const sichern = () => s.merken(stand);
    const vorbei = () => stand.fertig !== null;

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const brettKasten = el('div', 'v-brett');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    wurzel.append(kopf, brettKasten, endeKasten);

    const felder = [];
    for (let z = 0; z < ZEILEN; z += 1) {
      for (let sp = 0; sp < SPALTEN; sp += 1) {
        const f = el('button', 'v-feld');
        f.type = 'button';
        f.setAttribute('aria-label', 'Spalte ' + (sp + 1));
        const spalte = sp;
        f.addEventListener('click', () => werfen(spalte));
        brettKasten.append(f);
        felder.push(f);
      }
    }

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neue Partie', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    /* ---------------------------------------------------------------- Zug */

    function werfen(spalte) {
      if (vorbei() || denkt || stand.amZug !== MENSCH) return;
      const z = freieZeile(stand.brett, spalte);
      if (z < 0) { s.toast('Diese Spalte ist voll.'); return; }

      setzen(z, spalte, MENSCH);
      if (vorbei()) return;

      stand.amZug = RECHNER;
      zeichnen();
      denkenLassen();
    }

    function setzen(z, spalte, wer) {
      stand.brett[feld(z, spalte)] = wer;
      stand.zuege += 1;

      const sieg = sieger(stand.brett);
      if (sieg) {
        stand.siegfelder = sieg.felder;
        abschluss(sieg.wer === MENSCH ? 'sieg' : 'pleite');
      } else if (!moeglich(stand.brett).length) {
        abschluss('remis');
      }
      sichern();
      zeichnen();
    }

    function denkenLassen() {
      denkt = true;
      s.unter('Der Rechner überlegt …');
      // Kurz Luft lassen, damit der eigene Stein schon liegt, wenn es rechnet.
      setTimeout(() => {
        const spalte = bestesZug(stand.brett, stand.stufe);
        denkt = false;
        if (spalte < 0 || vorbei()) { zeichnen(); return; }
        const z = freieZeile(stand.brett, spalte);
        setzen(z, spalte, RECHNER);
        if (!vorbei()) stand.amZug = MENSCH;
        sichern();
        zeichnen();
      }, 220);
    }

    function abschluss(ausgang) {
      stand.fertig = ausgang;
      s.notieren({
        gewonnen: ausgang === 'sieg',
        remis: ausgang === 'remis',
        dauer: Date.now() - stand.begonnen,
        stufe: stand.stufe,
        zuege: stand.zuege,
      });
    }

    /* ------------------------------------------------------------ Zeichnen */

    function zeichnen() {
      for (let i = 0; i < felder.length; i += 1) {
        const w = stand.brett[i];
        felder[i].dataset.wer = w === MENSCH ? 'ich' : w === RECHNER ? 'er' : 'leer';
        if (stand.siegfelder && stand.siegfelder.includes(i)) felder[i].dataset.sieg = 'ja';
        else delete felder[i].dataset.sieg;
      }
      kopfZeichnen();
      endeZeichnen();
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      kopf.append(el('span', null, STUFEN[stand.stufe].name));
      const wer = el('span', null, '');
      wer.append(el('b', null, vorbei() ? '–' : stand.amZug === MENSCH ? 'du' : 'Rechner'));
      wer.append(document.createTextNode(' am Zug'));
      kopf.append(wer);
      kopf.append(el('span', null, stand.zuege + ' Steine'));
      if (!denkt) s.unter(vorbei() ? '' : 'Spalte antippen');
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !vorbei();
      if (!vorbei()) return;
      endeKasten.append(el('p', 'ende-titel',
        stand.fertig === 'sieg' ? 'Du gewinnst.'
          : stand.fertig === 'remis' ? 'Unentschieden.' : 'Der Rechner gewinnt.'));
      endeKasten.append(el('p', 'notiz',
        'Stufe ' + STUFEN[stand.stufe].name + ', ' + stand.zuege + ' Steine.'
        + (stand.fertig === 'pleite' && stand.stufe !== 'leicht' ? ' Eine Stufe tiefer ist keine Schande.' : '')));

      const l = el('div', 'leiste');
      for (const stufe of Object.keys(STUFEN)) {
        const b = el('button', 'knopf ' + (stufe === stand.stufe ? 'knopf--voll' : 'knopf--still'),
          'Neu, ' + STUFEN[stufe].name);
        b.type = 'button';
        // Wer verloren hat, darf anfangen.
        b.addEventListener('click', () => neu(stufe, stand.fertig === 'pleite' ? MENSCH : RECHNER));
        l.append(b);
      }
      endeKasten.append(l);
    }

    function neu(stufe, anfang) {
      stand = frisch(stufe, anfang);
      sichern();
      zeichnen();
      if (stand.amZug === RECHNER) denkenLassen();
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neue Partie',
        inhalt: 'Leicht greift ab und zu daneben, mittel rechnet fünf Züge weit, schwer sieben – da muss man schon sehr gut sein.',
        aktionen: [
          { text: 'Leicht', tun: () => neu('leicht', MENSCH) },
          { text: 'Mittel', art: 'still', tun: () => neu('mittel', MENSCH) },
          { text: 'Schwer', art: 'still', tun: () => neu('schwer', MENSCH) },
        ],
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Tippe eine Spalte an – dein Stein fällt bis auf den Boden oder auf den obersten Stein, der dort schon liegt.'));
      d.append(el('p', 'notiz', 'Gewonnen hat, wer zuerst vier eigene Steine in eine Reihe bekommt: waagerecht, senkrecht oder schräg. Ist das Feld voll, endet es unentschieden.'));
      d.append(el('p', 'notiz', 'Der Rechner spielt Minimax: er denkt je nach Stufe zwei bis sieben Züge voraus und unterstellt dir dabei immer die beste Antwort. Auf „leicht" greift er absichtlich manchmal daneben – einen sicheren Sieg lässt er sich aber auch dort nicht entgehen.'));
      d.append(el('p', 'notiz', 'Die Mitte ist mehr wert als der Rand: durch die mittlere Spalte laufen die meisten möglichen Viererreihen.'));
      s.blatt({ titel: 'Vier gewinnt', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    sichern();
    zeichnen();
    if (!vorbei() && stand.amZug === RECHNER) denkenLassen();

    return { ende: () => { if (!vorbei()) sichern(); } };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien) {
    const je = (stufe) => {
      const p = partien.filter((x) => x.stufe === stufe);
      if (!p.length) return '–';
      return p.filter((x) => x.gewonnen).length + '/' + p.length;
    };
    const remis = partien.filter((p) => p.remis).length;
    return [
      { wert: je('leicht'), label: 'Siege leicht' },
      { wert: je('mittel'), label: 'Siege mittel' },
      { wert: je('schwer'), label: 'Siege schwer' },
      { wert: String(remis), label: 'Unentschieden' },
    ];
  }

  Rahmen.anmelden({
    id: 'viergewinnt',
    name: 'Vier gewinnt',
    unter: 'Gegen den Rechner.',
    farbe: '#6A4FA3',
    symbol: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="10" r="1.8"/><circle cx="15.5" cy="10" r="1.8"/><circle cx="12" cy="15" r="1.8"/>',
    starten,
    auswertung,
  });
})();
