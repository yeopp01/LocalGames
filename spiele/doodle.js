/* Hochhinaus – von Plattform zu Plattform, immer höher, auf Karopapier.

   Gesprungen wird von selbst; der Spieler lenkt nur nach links und rechts.
   Das Vorbild kippt dafür das Handy. Das geht hier auch, ist aber nicht die
   Vorgabe: Neigen braucht auf dem iPhone eine Erlaubnis, fehlt auf dem
   Rechner ganz und dreht sich beim Spielen im Liegen gegen einen. Vorgabe ist
   Halten – linke Hälfte nach links, rechte nach rechts. Weil dann beide
   Daumen unten liegen, gehört die obere Hälfte des Feldes dem Schießen: Man
   tippt auf das Monster, das man treffen will.

   Die Plattformen entstehen beim Klettern, und jede feste liegt so dicht
   über der vorigen, dass ein gewöhnlicher Sprung sie erreicht (Sprunghöhe
   97,5, Abstand höchstens 78). Brüchige Plattformen sind nur Zugabe
   dazwischen – sie sind nie die einzige Stufe nach oben.

   Monster und schwarze Löcher werden erst gesetzt, wenn die Plattformen um
   sie herum schon feststehen. So sitzt keins auf einer Plattform oder genau
   über einer, von der man hochspringt: Wer stirbt, ist hineingelenkt, nicht
   hineingeworfen worden.

   Die Ziele werden nicht eigens gespeichert, sondern aus den notierten
   Partien nachgerechnet. Sie überleben damit jede Sicherung und können nie
   etwas anderes sagen als die Statistik. */

(() => {
  const B = 180;
  const H = 270;
  const SCHWERE = 780;
  const SPRUNG = -390;
  const FEDER = -640;
  const LAUF = 170;
  const BESCHL = 1400;
  const PLATTE_B = 30;
  const PLATTE_H = 6;
  const FEDER_B = 8;
  const FUSS = 5;             // halbe Breite der Füße für die Landung
  const START_Y = H - 40;
  const KAMERA = 0.42;        // Die Figur steigt nie über diesen Anteil der Höhe.
  const METER = 20;
  const MAX_LUECKE = 78;
  // So weit über dem Bild liegen Plattformen schon bereit. Gefahren kommen erst
  // 100 darunter dazu – das reicht, damit auch im Raketenflug keine im Bild entsteht.
  const VORLAUF = 160;

  const SCHUSSZONE = 0.5;     // Anteil des Feldes von oben, in dem ein Tipp schießt
  const KUGEL_TEMPO = 400;
  const KUGEL_PAUSE = 0.16;
  const KUGELN_MAX = 4;
  const SCHUSS_WINKEL = 0.96; // etwa 55° neben der Senkrechten – weiter dreht die Nase nicht

  const FLUG = {
    propeller: { tempo: -330, dauer: 2.6, ab: 500, anteil: 0.03 },
    rakete: { tempo: -560, dauer: 2.2, ab: 2500, anteil: 0.018 },
  };
  const DING_B = 10;

  const MONSTER = {
    klecks: { b: 22, h: 16, leben: 1 },
    flatter: { b: 20, h: 12, leben: 1 },
    brocken: { b: 30, h: 22, leben: 3 },
  };
  const MONSTER_AB = 600;
  const LOCH_AB = 2000;
  const LOCH_R = 12;
  const STREIFEN = 60;        // Gefahren werden streifenweise ausgewürfelt
  const SOG_DAUER = 0.8;

  /* Je Rang drei Ziele. `summe` zählt über die Partien seit Beginn des Rangs,
     sonst zählt die beste einzelne Partie. `feld` ist ein Feld der notierten
     Partie – nur so lässt sich jedes Ziel aus der Statistik nachrechnen. */
  const ZIELE = [
    [
      { text: 'Erreiche 50 m', feld: 'meter', n: 50 },
      { text: 'Springe 100-mal', feld: 'spruenge', n: 100, summe: true },
      { text: 'Schieß ein Monster ab', feld: 'monster', n: 1, summe: true },
    ],
    [
      { text: 'Erreiche 150 m', feld: 'meter', n: 150 },
      { text: 'Nimm 3 Federn in einer Partie', feld: 'federn', n: 3 },
      { text: 'Flieg mit dem Propeller', feld: 'propeller', n: 1, summe: true },
    ],
    [
      { text: '3 Monster hintereinander ohne Fehlschuss', feld: 'serie', n: 3 },
      { text: 'Erreiche 250 m', feld: 'meter', n: 250 },
      { text: 'Springe 500-mal', feld: 'spruenge', n: 500, summe: true },
    ],
    [
      { text: 'Spring auf ein Monster', feld: 'gestampft', n: 1, summe: true },
      { text: 'Flieg mit der Rakete', feld: 'raketen', n: 1, summe: true },
      { text: 'Schieß 10 Monster ab', feld: 'monster', n: 10, summe: true },
    ],
    [
      { text: 'Erreiche 400 m', feld: 'meter', n: 400 },
      { text: 'Schaff 150 m ohne einen Schuss', feld: 'ohneSchuss', n: 150 },
      { text: 'Lass 3 schwarze Löcher hinter dir', feld: 'loecher', n: 3, summe: true },
    ],
    [
      { text: '5 Monster hintereinander ohne Fehlschuss', feld: 'serie', n: 5 },
      { text: 'Springe 2000-mal', feld: 'spruenge', n: 2000, summe: true },
      { text: 'Nimm 2 Propeller in einer Partie', feld: 'propeller', n: 2 },
    ],
    [
      { text: 'Erreiche 600 m', feld: 'meter', n: 600 },
      { text: 'Schieß 5 Monster in einer Partie ab', feld: 'monster', n: 5 },
      { text: 'Nimm 8 Federn in einer Partie', feld: 'federn', n: 8 },
    ],
    [
      { text: '8 Monster hintereinander ohne Fehlschuss', feld: 'serie', n: 8 },
      { text: 'Erreiche 800 m', feld: 'meter', n: 800 },
      { text: 'Nimm 2 Raketen in einer Partie', feld: 'raketen', n: 2 },
    ],
    [
      { text: 'Erreiche 1000 m', feld: 'meter', n: 1000 },
      { text: 'Schieß 100 Monster ab', feld: 'monster', n: 100, summe: true },
      { text: 'Spring in einer Partie auf 3 Monster', feld: 'gestampft', n: 3 },
    ],
    [
      { text: 'Erreiche 1500 m', feld: 'meter', n: 1500 },
      { text: '12 Monster hintereinander ohne Fehlschuss', feld: 'serie', n: 12 },
      { text: 'Schaff 500 m ohne Feder, Propeller, Rakete', feld: 'ohneHilfe', n: 500 },
    ],
  ];

  /* Was eine Partie mitzählt – dieselben Namen landen in der Statistik. */
  const neueZaehler = () => ({
    spruenge: 0, federn: 0, monster: 0, gestampft: 0, schuesse: 0, serie: 0,
    propeller: 0, raketen: 0, loecher: 0, ohneSchuss: 0, ohneHilfe: 0,
  });

  /* ------------------------------------------------------------- Ziele */

  const leererRang = (stufe) => ({ stufe, werte: [0, 0, 0], erreicht: [false, false, false] });

  function anrechnen(zs, wert) {
    ZIELE[zs.stufe].forEach((z, i) => {
      const w = wert(z.feld);
      zs.werte[i] = z.summe ? zs.werte[i] + w : Math.max(zs.werte[i], w);
      if (zs.werte[i] >= z.n) zs.erreicht[i] = true;
    });
  }

  /* Spielt die Partien der Reihe nach durch. Ein Rang beginnt mit der Partie
     nach der, die ihn freigeschaltet hat – was davor lag, zählt nicht für ihn. */
  function zieleRechnen(partien) {
    let zs = leererRang(0);
    for (const p of partien) {
      if (zs.stufe >= ZIELE.length) break;
      anrechnen(zs, (feld) => Echtzeit.zahl(p[feld]));
      if (zs.erreicht.every(Boolean)) zs = leererRang(zs.stufe + 1);
    }
    return zs;
  }

  /* ------------------------------------------------------------ Aufbau der Welt */

  function erzeugen(st) {
    while (st.oben > st.kamera - VORLAUF) {
      const h = START_Y - st.oben;
      const min = 16 + Math.min(24, h / 200);
      const max = Math.min(MAX_LUECKE, 34 + h / 70);
      const y = st.oben - (min + Math.random() * (max - min));
      const wandert = h > 1200 && Math.random() < Math.min(0.4, (h - 1200) / 5000);
      const p = { x: Math.random() * (B - PLATTE_B), y, art: wandert ? 'wandernd' : 'fest' };
      if (wandert) p.vx = (Math.random() < 0.5 ? -1 : 1) * (22 + Math.min(40, h / 250));
      else if (h > 300 && Math.random() < 0.07) p.feder = 4 + Math.random() * (PLATTE_B - FEDER_B - 8);
      else if (h > st.dingBis) {
        const art = h > FLUG.rakete.ab && Math.random() < FLUG.rakete.anteil ? 'rakete'
          : h > FLUG.propeller.ab && Math.random() < FLUG.propeller.anteil ? 'propeller' : null;
        if (art) {
          p.ding = { art, x: 3 + Math.random() * (PLATTE_B - DING_B - 6) };
          st.dingBis = h + 400;
        }
      }
      st.platten.push(p);
      if (h > 600 && Math.random() < Math.min(0.45, h / 6000)) {
        st.platten.push({
          x: Math.random() * (B - PLATTE_B),
          y: y + (st.oben - y) * (0.3 + Math.random() * 0.4),
          art: 'bruechig',
        });
      }
      st.oben = y;
    }

    // Gefahren nur dort, wo die Plattformen darüber schon feststehen.
    while (st.bestueckt - STREIFEN > st.oben + 40) {
      st.bestueckt -= STREIFEN;
      const y = st.bestueckt + Math.random() * STREIFEN;
      const h = START_Y - y;
      if (h < st.gefahrBis) continue;
      const pLoch = h < LOCH_AB ? 0 : Math.min(0.1, 0.03 + (h - LOCH_AB) / 50000);
      const pMonster = h < MONSTER_AB ? 0 : Math.min(0.35, 0.15 + (h - MONSTER_AB) / 15000);
      const wurf = Math.random();
      const gesetzt = wurf < pLoch ? lochSetzen(st, y) : wurf < pLoch + pMonster ? monsterSetzen(st, y, h) : false;
      if (gesetzt) st.gefahrBis = h + Math.max(220, 420 - h / 50);
    }
  }

  /* Liegt eine Plattform mit ihrer ganzen Breite (plus Rand) neben [l, r]?
     Auch drüben: Wer am linken Rand steht, ragt rechts wieder hinein. */
  const daneben = (p, l, r, rand) =>
    [p.x - B, p.x, p.x + B].every((px) => px + PLATTE_B + rand < l || px - rand > r);

  function monsterSetzen(st, y, h) {
    const wahl = Math.random();
    const art = h > 3000 && wahl < 0.25 ? 'brocken' : h > 1200 && wahl < 0.55 ? 'flatter' : 'klecks';
    const a = MONSTER[art];
    const oben = y - a.h / 2;
    const unten = y + a.h / 2;
    const t = Math.random() * 6;

    if (art === 'flatter') {
      // Es fliegt quer durchs Bild und geht deshalb nur in eine Lücke, in der
      // weder eine Plattform noch eine darauf stehende Figur seine Bahn kreuzt.
      if (st.platten.some((p) => p.y + PLATTE_H + 4 > oben && p.y - 20 < unten)) return false;
      const vx = (Math.random() < 0.5 ? -1 : 1) * (30 + Math.min(30, h / 400));
      st.monster.push({ art, x: Math.random() * (B - a.b), y: oben, vx, leben: a.leben, t, blitz: 0 });
      return true;
    }

    const x = freieLage(2, B - a.b - 2, (x) => st.platten.every((p) => {
      if (p.art === 'wandernd' || p.art === 'weg') return true;
      // Auf seiner Höhe und eine Sprunghöhe darunter bleibt die Spalte frei,
      // unter einer Feder sogar eine Federhöhe.
      const tiefe = p.feder != null ? 280 : 115;
      if (p.y + PLATTE_H + 3 < oben || p.y > unten + tiefe) return true;
      return daneben(p, x, x + a.b, 6);
    }));
    if (x == null) return false;
    st.monster.push({ art, x, y: oben, vx: 0, leben: a.leben, t, blitz: 0 });
    return true;
  }

  function lochSetzen(st, y) {
    const x = freieLage(LOCH_R + 4, B - LOCH_R - 4, (x) => st.platten.every((p) => {
      if (p.art === 'weg') return true;
      // Eine Sprunghöhe darunter plus der Radius, in dem das Loch schluckt.
      const tiefe = p.feder != null ? 300 : 125;
      if (p.y + PLATTE_H + 30 < y - LOCH_R || p.y > y + LOCH_R + tiefe) return true;
      // Wandernde Plattformen kommen früher oder später überall vorbei.
      if (p.art === 'wandernd') return false;
      return daneben(p, x - LOCH_R, x + LOCH_R, 8);
    }));
    if (x == null) return false;
    st.loecher.push({ x, y });
    return true;
  }

  /* Alle Lagen im Raster von 2, an denen `frei` gilt – eine davon zufällig.
     Raten mit ein paar Würfen fände die schmalen Lücken zu selten. */
  function freieLage(von, bis, frei) {
    const lagen = [];
    for (let x = von; x <= bis; x += 2) if (frei(x)) lagen.push(x);
    return lagen.length ? lagen[Math.floor(Math.random() * lagen.length)] : null;
  }

  function frisch(steuerung, ton) {
    const st = {
      zustand: 'bereit',
      steuerung: steuerung === 'neigen' ? 'neigen' : 'tippen',
      ton: ton !== false,
      figur: { x: B / 2, y: START_Y, vx: 0, vy: 0, blick: 1, nase: 0, tot: null },
      platten: [{ x: B / 2 - PLATTE_B / 2, y: START_Y, art: 'fest' }],
      monster: [],
      loecher: [],
      kugeln: [],
      fetzen: [],
      ansagen: [],
      gemeldet: [],
      flug: null,
      sog: null,
      kamera: 0,
      oben: START_Y,
      bestueckt: START_Y,
      gefahrBis: 0,
      dingBis: 0,
      hoechste: 0,
      zeit: 0,
      schussUhr: 0,
      serieJetzt: 0,
      z: neueZaehler(),
    };
    erzeugen(st);
    return st;
  }

  const meterVon = (st) => Math.floor(st.hoechste / METER);

  const gueltig = (alt) =>
    !!alt && alt.figur && typeof alt.figur.y === 'number' && typeof alt.figur.x === 'number' &&
    Array.isArray(alt.platten) && typeof alt.kamera === 'number' && typeof alt.oben === 'number' &&
    alt.zustand !== 'vorbei';

  /* Eine Pause von einem älteren Stand kennt Monster, Flug und Zähler noch nicht. */
  function ergaenzen(alt) {
    for (const k of ['monster', 'loecher', 'kugeln', 'fetzen', 'ansagen', 'gemeldet']) {
      if (!Array.isArray(alt[k])) alt[k] = [];
    }
    const z = neueZaehler();
    for (const k of Object.keys(z)) {
      if (alt.z && typeof alt.z[k] === 'number') z[k] = alt.z[k];
    }
    alt.z = z;
    for (const k of ['gefahrBis', 'dingBis', 'schussUhr', 'serieJetzt']) {
      if (typeof alt[k] !== 'number') alt[k] = 0;
    }
    if (typeof alt.bestueckt !== 'number') alt.bestueckt = alt.oben;
    if (!alt.flug || !FLUG[alt.flug.art]) alt.flug = null;
    if (!alt.sog || typeof alt.sog.t !== 'number') {
      alt.sog = null;
      if (alt.figur.tot === 'loch') alt.figur.tot = 'monster';
    }
    alt.ton = alt.ton !== false;
    return alt;
  }

  /* ------------------------------------------------------------------ Klang */

  /* Alle Töne sind erzeugt, keine Aufnahmen: Das hält die App klein und
     offline-fähig. Ein AudioContext entsteht erst beim ersten Tipp, weil
     Browser ihn vorher stumm lassen. In der Pause schläft er – ein Summen,
     das weiterläuft, während niemand spielt, wäre nur lästig. */
  function klangwerk(erlaubt) {
    const A = window.AudioContext || window.webkitAudioContext;
    let ac = null;
    let haupt = null;
    let rauschen = null;
    const dauer = {};

    function kontext() {
      if (!erlaubt() || !A) return null;
      if (!ac) {
        try {
          ac = new A();
        } catch {
          return null;
        }
        haupt = ac.createGain();
        haupt.gain.value = 0.6;
        haupt.connect(ac.destination);
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    }

    function puffer(c) {
      if (!rauschen) {
        rauschen = c.createBuffer(1, c.sampleRate, c.sampleRate);
        const d = rauschen.getChannelData(0);
        for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
      }
      return rauschen;
    }

    function huelle(c, t, laut, zeit) {
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(laut, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + zeit);
      g.connect(haupt);
      return g;
    }

    function ton(von, bis, zeit, typ, laut, spaeter = 0) {
      const c = kontext();
      if (!c) return;
      const t = c.currentTime + spaeter;
      const o = c.createOscillator();
      o.type = typ;
      o.frequency.setValueAtTime(von, t);
      o.frequency.exponentialRampToValueAtTime(bis, t + zeit);
      o.connect(huelle(c, t, laut, zeit));
      o.start(t);
      o.stop(t + zeit + 0.05);
    }

    function zisch(zeit, laut, von, bis) {
      const c = kontext();
      if (!c) return;
      const t = c.currentTime;
      const q = c.createBufferSource();
      q.buffer = puffer(c);
      const fi = c.createBiquadFilter();
      fi.type = 'bandpass';
      fi.Q.value = 1.2;
      fi.frequency.setValueAtTime(von, t);
      fi.frequency.exponentialRampToValueAtTime(bis, t + zeit);
      q.connect(fi);
      fi.connect(huelle(c, t, laut, zeit));
      q.start(t);
      q.stop(t + zeit + 0.05);
    }

    /* Dauertöne laufen immer und werden nur lauter oder leiser gedreht. */
    function dauerton(name) {
      const c = kontext();
      if (!c) return null;
      const g = c.createGain();
      g.gain.value = 0;
      g.connect(haupt);
      const quellen = [];
      if (name === 'rakete') {
        const q = c.createBufferSource();
        q.buffer = puffer(c);
        q.loop = true;
        const fi = c.createBiquadFilter();
        fi.type = 'lowpass';
        fi.frequency.value = 900;
        q.connect(fi);
        fi.connect(g);
        quellen.push(q);
      } else {
        // Summen der Monster und Knattern des Propellers: ein tiefer Ton, dessen
        // Lautstärke flattert.
        const summen = name === 'summen';
        const o = c.createOscillator();
        o.type = summen ? 'sawtooth' : 'square';
        o.frequency.value = summen ? 92 : 64;
        const fi = c.createBiquadFilter();
        fi.type = 'lowpass';
        fi.frequency.value = summen ? 700 : 500;
        const flattern = c.createGain();
        flattern.gain.value = 0.5;
        const lfo = c.createOscillator();
        lfo.frequency.value = summen ? 11 : 24;
        const tiefe = c.createGain();
        tiefe.gain.value = 0.5;
        lfo.connect(tiefe);
        tiefe.connect(flattern.gain);
        o.connect(fi);
        fi.connect(flattern);
        flattern.connect(g);
        quellen.push(o, lfo);
      }
      for (const q of quellen) q.start();
      dauer[name] = { g, wert: 0 };
      return dauer[name];
    }

    function pegel(name, wert) {
      if (!erlaubt()) wert = 0;
      const d = dauer[name] || (wert > 0 ? dauerton(name) : null);
      if (!d || Math.abs(d.wert - wert) < 0.004) return;
      d.wert = wert;
      d.g.gain.setTargetAtTime(wert, ac.currentTime, 0.06);
    }

    /* Hart auf null, nicht ausblenden: Ein Kontext, der gleich schläft, würde
       den Rest der Blende beim Aufwachen nachholen. */
    function still() {
      for (const d of Object.values(dauer)) {
        d.wert = 0;
        d.g.gain.cancelScheduledValues(ac.currentTime);
        d.g.gain.setValueAtTime(0, ac.currentTime);
      }
    }

    return {
      wecken: kontext,
      pegel,
      still,
      schlafen() {
        if (!ac) return;
        still();
        if (ac.state === 'running') ac.suspend().catch(() => {});
      },
      ende() {
        if (ac) ac.close().catch(() => {});
        ac = null;
      },
      get kontext() { return ac; },
      sprung: () => ton(260, 520, 0.11, 'triangle', 0.05),
      feder: () => { ton(180, 900, 0.32, 'triangle', 0.06); ton(360, 1800, 0.32, 'sine', 0.02); },
      bruch: () => zisch(0.18, 0.09, 1800, 300),
      schuss: () => ton(1100, 380, 0.07, 'square', 0.025),
      treffer: () => ton(220, 140, 0.07, 'square', 0.04),
      monsterWeg: () => { ton(500, 60, 0.35, 'sawtooth', 0.05); zisch(0.2, 0.05, 900, 200); },
      stampfen: () => { ton(160, 50, 0.2, 'triangle', 0.09); zisch(0.12, 0.06, 600, 150); },
      aufnehmen: () => [523, 659, 784, 1047].forEach((f, i) => ton(f, f, 0.07, 'square', 0.03, i * 0.06)),
      erwischt: () => ton(700, 90, 0.9, 'sawtooth', 0.05),
      loch: () => { ton(900, 30, 1.1, 'sine', 0.08); ton(450, 20, 1.1, 'triangle', 0.04); },
      absturz: () => ton(900, 150, 0.9, 'triangle', 0.05),
      ziel: () => [784, 988, 1175, 1568].forEach((f, i) => ton(f, f, 0.12, 'triangle', 0.05, i * 0.09)),
    };
  }

  /* ------------------------------------------------------------------ Spiel */

  const SYMBOL_TON = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" stroke-linejoin="round"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke-linecap="round"/>';
  const SYMBOL_STUMM = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" stroke-linejoin="round"/><path d="M16 9.5l5 5M21 9.5l-5 5" stroke-linecap="round"/>';

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let zielstand = zieleRechnen(s.partien());
    let bilanz = null;           // was die letzte Partie an Zielen gebracht hat

    const halten = new Map();      // Zeiger → -1 oder 1, in der Reihenfolge des Aufsetzens
    let tasteL = false;
    let tasteR = false;
    let neigung = 0;
    let neigungGemeldet = false;
    let pruefUhr = 0;

    const klang = klangwerk(() => stand.ton);

    function laden() {
      const alt = s.erinnert();
      if (!gueltig(alt)) return frisch(alt && alt.steuerung, alt && alt.ton);
      if (alt.zustand === 'laeuft') alt.zustand = 'pause';
      return ergaenzen(alt);
    }

    const sichern = () => s.merken(stand);
    const bestwert = () => s.partien().reduce((h, p) => Math.max(h, Echtzeit.zahl(p.meter)), 0);

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const flaeche = el('div', 'ez-flaeche dj-flaeche');
    const feld = el('div', 'dj-kasten');
    const steuer = el('div', 'ez-steuer ez-steuer--zwei');
    steuer.append(el('span', null, '◀ halten'), el('span', null, 'halten ▶'));
    const unten = el('div', 'ez-unten');
    flaeche.append(feld, steuer);
    wurzel.append(kopf, flaeche, unten);

    const b = Echtzeit.buehne(feld, { breite: B, hoehe: H, schritt, zeichnen, beiHalt });

    function werkzeugeSetzen() {
      // Kein eigener Ziele-Knopf: Mit sechs Knöpfen überdeckt der Kopf auf dem
      // Handy den Titel. Die Ziele öffnet der Rang über dem Feld.
      s.werkzeuge([
        { label: 'Pause', symbol: Echtzeit.SYMBOL.pause, tun: pauseUmschalten },
        { label: stand.ton ? 'Ton aus' : 'Ton an', symbol: stand.ton ? SYMBOL_TON : SYMBOL_STUMM, tun: tonUmschalten },
        { label: 'Anleitung', symbol: Echtzeit.SYMBOL.anleitung, tun: anleitung },
      ]);
    }
    werkzeugeSetzen();

    /* ------------------------------------------------------------ Ablauf */

    function weiter() {
      if (stand.zustand !== 'bereit' && stand.zustand !== 'pause') return;
      if (stand.zustand === 'bereit') stand.figur.vy = SPRUNG;
      stand.zustand = 'laeuft';
      klang.wecken();
      anzeigen();
      b.los();
      if (stand.steuerung === 'neigen') neigungPruefen();
    }

    function pauseUmschalten() {
      if (b.laeuft) b.halt();
      else if (stand.zustand === 'pause') weiter();
    }

    function beiHalt() {
      if (stand.zustand === 'laeuft') stand.zustand = 'pause';
      halten.clear();
      tasteL = tasteR = false;
      if (stand.zustand === 'pause') klang.schlafen();
      else if (klang.kontext) klang.still();
      anzeigen();
      sichern();
    }

    function tonUmschalten() {
      stand.ton = !stand.ton;
      if (stand.ton) klang.wecken();
      else klang.schlafen();
      werkzeugeSetzen();
      sichern();
      s.toast(stand.ton ? 'Ton an.' : 'Ton aus.');
    }

    function achse() {
      if (tasteL !== tasteR) return tasteL ? -1 : 1;
      if (halten.size) return [...halten.values()].pop();
      return stand.steuerung === 'neigen' ? neigung : 0;
    }

    function schritt(dt) {
      const st = stand;
      const f = st.figur;
      st.zeit += dt;

      if (st.ansagen.length) {
        st.ansagen[0].t -= dt;
        if (st.ansagen[0].t <= 0) st.ansagen.shift();
      }
      for (const m of st.monster) {
        m.t += dt;
        if (m.blitz > 0) m.blitz -= dt;
      }
      for (const x of st.fetzen) {
        x.t += dt;
        x.vy += SCHWERE * dt;
        x.x += x.vx * dt;
        x.y += x.vy * dt;
      }

      if (st.sog) {
        st.sog.t += dt;
        if (st.sog.t >= SOG_DAUER) vorbei();
        return;
      }

      if (st.schussUhr > 0) st.schussUhr -= dt;
      if (f.nase > 0) f.nase -= dt;

      if (f.tot) {
        f.vx *= 0.99;
      } else {
        const ziel = achse() * LAUF;
        const d = BESCHL * dt;
        f.vx += Math.max(-d, Math.min(d, ziel - f.vx));
        if (Math.abs(f.vx) > 20) f.blick = Math.sign(f.vx);
      }
      f.x += f.vx * dt;
      // Wer links hinausläuft, kommt rechts wieder herein.
      if (f.x < 0) f.x += B;
      if (f.x >= B) f.x -= B;

      for (const p of st.platten) {
        if (p.art === 'wandernd') {
          p.x += p.vx * dt;
          if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
          if (p.x > B - PLATTE_B) { p.x = B - PLATTE_B; p.vx = -Math.abs(p.vx); }
        } else if (p.art === 'weg') {
          p.fall += dt;
        }
        if (p.gespannt > 0) p.gespannt -= dt;
      }
      for (const m of st.monster) {
        if (m.art !== 'flatter') continue;
        m.x += m.vx * dt;
        if (m.x < 0) { m.x = 0; m.vx = Math.abs(m.vx); }
        if (m.x > B - MONSTER.flatter.b) { m.x = B - MONSTER.flatter.b; m.vx = -Math.abs(m.vx); }
      }

      const alt = f.y;
      if (st.flug) {
        f.vy = FLUG[st.flug.art].tempo;
        st.flug.t -= dt;
        if (st.flug.t <= 0) flugEnde(st);
      } else {
        f.vy += SCHWERE * dt;
      }
      f.y += f.vy * dt;

      if (!f.tot) {
        if (f.vy > 0) landen(st, alt);
        dingeAufnehmen(st);
        if (!st.flug) {
          monsterBeruehren(st, alt);
          lochBeruehren(st);
        }
      }
      kugelnZiehen(st, dt);

      if (!f.tot) {
        if (f.y - st.kamera < H * KAMERA) st.kamera = f.y - H * KAMERA;
        const hoehe = START_Y - f.y;
        if (hoehe > st.hoechste) {
          const vorher = meterVon(st);
          st.hoechste = hoehe;
          const m = meterVon(st);
          if (!st.z.schuesse) st.z.ohneSchuss = m;
          if (!st.z.federn && !st.z.propeller && !st.z.raketen) st.z.ohneHilfe = m;
          if (m !== vorher) kopfZeichnen();
        }
      }
      erzeugen(st);

      const bildUnten = st.kamera + H;
      st.platten = st.platten.filter((p) => p.y < bildUnten + 40 && !(p.art === 'weg' && p.fall > 1));
      st.monster = st.monster.filter((m) => m.y < bildUnten + 30);
      st.loecher = st.loecher.filter((l) => {
        if (l.y - LOCH_R < bildUnten + 10) return true;
        if (!f.tot) st.z.loecher += 1;
        return false;
      });
      st.fetzen = st.fetzen.filter((x) => x.t < 1.5 && x.y < bildUnten + 60);

      zielePruefen(st);
      klangNachziehen(st);

      if (f.y - 16 - st.kamera > H) vorbei();
    }

    function landen(st, alt) {
      const f = st.figur;
      // Gelandet wird nur im Fallen, und nur, wenn die Füße die Oberkante in
      // diesem Takt überquert haben – von unten springt man durch.
      for (const p of st.platten) {
        if (p.art === 'weg') continue;
        if (alt > p.y || f.y < p.y) continue;
        if (!(f.x + FUSS > p.x && f.x - FUSS < p.x + PLATTE_B)) continue;
        if (p.art === 'bruechig') {
          p.art = 'weg';
          p.fall = 0;
          klang.bruch();
          continue;
        }
        f.y = p.y;
        const aufFeder = p.feder != null && f.x + FUSS > p.x + p.feder && f.x - FUSS < p.x + p.feder + FEDER_B;
        f.vy = aufFeder ? FEDER : SPRUNG;
        st.z.spruenge += 1;
        if (aufFeder) {
          p.gespannt = 0.2;
          st.z.federn += 1;
          klang.feder();
        } else {
          klang.sprung();
        }
        return;
      }
    }

    function dingeAufnehmen(st) {
      if (st.flug) return;
      const f = st.figur;
      for (const p of st.platten) {
        if (!p.ding || p.art === 'weg') continue;
        const mitte = p.x + p.ding.x + DING_B / 2;
        const hoch = p.ding.art === 'rakete' ? 12 : 8;
        if (Math.abs(f.x - mitte) < 9 && f.y > p.y - hoch && f.y - 17 < p.y) {
          st.flug = { art: p.ding.art, t: FLUG[p.ding.art].dauer };
          st.z[p.ding.art === 'rakete' ? 'raketen' : 'propeller'] += 1;
          p.ding = null;
          klang.aufnehmen();
          return;
        }
      }
    }

    function flugEnde(st) {
      const f = st.figur;
      st.fetzen.push({ art: st.flug.art, x: f.x, y: f.y - 14, vx: -f.blick * 30, vy: -60, t: 0, dreh: -f.blick * 6 });
      f.vy = FLUG[st.flug.art].tempo * 0.35;
      st.flug = null;
    }

    function monsterBeruehren(st, alt) {
      const f = st.figur;
      for (const m of st.monster) {
        const a = MONSTER[m.art];
        // Am Rand steht die Figur halb drüben – sie trifft auch dort.
        for (const fx of [f.x, f.x - B, f.x + B]) {
          if (fx + 6 < m.x + 2 || fx - 6 > m.x + a.b - 2) continue;
          if (f.vy > 0 && alt <= m.y + 3 && f.y >= m.y) {
            st.monster = st.monster.filter((x) => x !== m);
            monsterFaellt(st, m);
            f.y = m.y;
            f.vy = SPRUNG;
            st.z.gestampft += 1;
            klang.stampfen();
            return;
          }
          if (f.y - 16 < m.y + a.h - 2 && f.y > m.y + 2) {
            f.tot = 'monster';
            f.vy = Math.max(f.vy, 0);
            klang.still();
            klang.erwischt();
            return;
          }
        }
      }
    }

    function lochBeruehren(st) {
      const f = st.figur;
      for (const l of st.loecher) {
        let dx = f.x - l.x;
        if (dx > B / 2) dx -= B;
        if (dx < -B / 2) dx += B;
        const dy = f.y - 9 - l.y;
        if (dx * dx + dy * dy < 14 * 14) {
          f.tot = 'loch';
          st.sog = { t: 0, vonX: f.x, vonY: f.y, zuX: f.x - dx, zuY: l.y + 9 };
          klang.still();
          klang.loch();
          return;
        }
      }
    }

    function monsterFaellt(st, m) {
      st.fetzen.push({ art: m.art, x: m.x, y: m.y, vx: (Math.random() - 0.5) * 60, vy: -80, t: 0, dreh: (Math.random() - 0.5) * 8 });
    }

    function schiessen(zielX, zielY) {
      const st = stand;
      const f = st.figur;
      if (st.zustand !== 'laeuft' || f.tot) return;
      if (st.schussUhr > 0 || st.kugeln.length >= KUGELN_MAX) return;
      const ox = f.x;
      const oy = f.y - 19;
      let w = 0;
      if (zielX != null) w = Math.max(-SCHUSS_WINKEL, Math.min(SCHUSS_WINKEL, Math.atan2(zielX - ox, oy - zielY)));
      st.kugeln.push({ x: ox, y: oy, vx: Math.sin(w) * KUGEL_TEMPO, vy: -Math.cos(w) * KUGEL_TEMPO });
      st.schussUhr = KUGEL_PAUSE;
      f.nase = 0.25;
      st.z.schuesse += 1;
      klang.schuss();
    }

    function kugelnZiehen(st, dt) {
      for (const k of st.kugeln) {
        k.x += k.vx * dt;
        k.y += k.vy * dt;
        for (const m of st.monster) {
          const a = MONSTER[m.art];
          if (m.leben <= 0 || k.x < m.x - 1 || k.x > m.x + a.b + 1 || k.y < m.y - 1 || k.y > m.y + a.h + 1) continue;
          k.weg = true;
          m.leben -= 1;
          m.blitz = 0.12;
          if (m.leben > 0) {
            klang.treffer();
          } else {
            monsterFaellt(st, m);
            st.z.monster += 1;
            st.serieJetzt += 1;
            st.z.serie = Math.max(st.z.serie, st.serieJetzt);
            klang.monsterWeg();
          }
          break;
        }
        if (k.weg) continue;
        const imLoch = st.loecher.some((l) => (k.x - l.x) ** 2 + (k.y - l.y) ** 2 < LOCH_R * LOCH_R);
        const draussen = k.y < st.kamera - 6 || k.y > st.kamera + H + 6 || k.x < -4 || k.x > B + 4;
        if (imLoch || draussen) {
          k.weg = true;
          st.serieJetzt = 0;
        }
      }
      st.kugeln = st.kugeln.filter((k) => !k.weg);
      st.monster = st.monster.filter((m) => m.leben > 0);
    }

    function klangNachziehen(st) {
      const f = st.figur;
      // Das Summen setzt ein, kurz bevor das Monster oben ins Bild kommt, und
      // wird lauter, je näher es der Figur ist.
      let naehe = 0;
      if (!f.tot) {
        for (const m of st.monster) {
          const y = m.y - st.kamera;
          if (y + MONSTER[m.art].h < -40 || y > H) continue;
          naehe = Math.max(naehe, 1 - Math.min(1, Math.abs(m.y - f.y) / H));
        }
      }
      klang.pegel('summen', naehe ? Math.round((0.03 + 0.05 * naehe) * 100) / 100 : 0);
      klang.pegel('propeller', st.flug && st.flug.art === 'propeller' ? 0.06 : 0);
      klang.pegel('rakete', st.flug && st.flug.art === 'rakete' ? 0.12 : 0);
    }

    /* ------------------------------------------------------------- Ziele */

    const wertJetzt = (st, feld) => (feld === 'meter' ? meterVon(st) : Echtzeit.zahl(st.z[feld]));

    /* Der Rang samt der laufenden Partie – so, wie er nach ihrem Ende stünde. */
    function zieleJetzt() {
      const zs = { stufe: zielstand.stufe, werte: zielstand.werte.slice(), erreicht: zielstand.erreicht.slice() };
      const laeuft = stand.zustand === 'laeuft' || stand.zustand === 'pause';
      if (laeuft && zs.stufe < ZIELE.length) anrechnen(zs, (feld) => wertJetzt(stand, feld));
      return zs;
    }

    function zielePruefen(st) {
      if (zielstand.stufe >= ZIELE.length) return;
      const jetzt = zieleJetzt();
      jetzt.erreicht.forEach((ok, i) => {
        const id = zielstand.stufe + '-' + i;
        if (!ok || zielstand.erreicht[i] || st.gemeldet.includes(id)) return;
        st.gemeldet.push(id);
        st.ansagen.push({ text: '✓ ' + ZIELE[zielstand.stufe][i].text, t: 2.4, d: 2.4 });
        if (jetzt.erreicht.every(Boolean)) {
          st.ansagen.push({ text: 'Rang ' + (zielstand.stufe + 1) + ' geschafft!', t: 2.4, d: 2.4 });
        }
        klang.ziel();
      });
    }

    function vorbei() {
      const st = stand;
      st.zustand = 'vorbei';
      const vorher = zielstand;
      s.notieren(Object.assign(
        { meter: meterVon(st), dauer: Math.round(st.zeit * 1000), ursache: st.figur.tot || 'absturz' },
        st.z
      ));
      zielstand = zieleRechnen(s.partien());
      bilanz = {
        ziele: vorher.stufe < ZIELE.length
          ? ZIELE[vorher.stufe].filter((_, i) => !vorher.erreicht[i] && (zielstand.stufe > vorher.stufe || zielstand.erreicht[i]))
          : [],
        rang: zielstand.stufe > vorher.stufe,
      };
      if (!st.figur.tot) klang.absturz();
      b.halt();
    }

    function neu() {
      stand = frisch(stand.steuerung, stand.ton);
      bilanz = null;
      anzeigen();
      sichern();
      b.malen();
    }

    /* ------------------------------------------------------------ Neigen */

    async function steuerungWechseln() {
      if (stand.steuerung === 'neigen') {
        stand.steuerung = 'tippen';
        anzeigen();
        sichern();
        return;
      }
      const D = window.DeviceOrientationEvent;
      if (!D) { s.toast('Dieses Gerät meldet keine Neigung.'); return; }
      // iOS fragt nur, wenn die Frage aus einem Tipp heraus kommt – deshalb
      // hier im Knopf und nicht beim Start.
      if (typeof D.requestPermission === 'function') {
        try {
          if (await D.requestPermission() !== 'granted') { s.toast('Ohne Erlaubnis geht Neigen nicht.'); return; }
        } catch {
          s.toast('Ohne Erlaubnis geht Neigen nicht.');
          return;
        }
      }
      stand.steuerung = 'neigen';
      anzeigen();
      sichern();
    }

    /* Viele Geräte kennen das Ereignis, liefern aber nie einen Wert – ein
       Laptop etwa. Kommt nach dem Start nichts, geht es mit Halten weiter. */
    function neigungPruefen() {
      clearTimeout(pruefUhr);
      pruefUhr = setTimeout(() => {
        if (stand.steuerung !== 'neigen' || neigungGemeldet) return;
        stand.steuerung = 'tippen';
        s.toast('Keine Neigung gemeldet – gesteuert wird mit Halten.');
        anzeigen();
      }, 1500);
    }

    b.an(window, 'deviceorientation', (e) => {
      if (e.gamma == null) return;
      neigungGemeldet = true;
      const winkel = (screen.orientation && screen.orientation.angle) || 0;
      const roh = winkel === 90 ? e.beta : winkel === 270 ? -e.beta : winkel === 180 ? -e.gamma : e.gamma;
      const tot = 3;
      const voll = 25;
      neigung = Math.abs(roh) < tot ? 0 : Math.max(-1, Math.min(1, (roh - Math.sign(roh) * tot) / (voll - tot)));
    });

    /* ----------------------------------------------------------- Anzeige */

    const rangText = (zs) => (zs.stufe >= ZIELE.length ? 'Alle Ränge' : 'Rang ' + (zs.stufe + 1));

    function kopfZeichnen() {
      kopf.replaceChildren();
      const p = el('span');
      p.append(el('b', null, String(meterVon(stand))), document.createTextNode(' m'));
      kopf.append(p);
      const best = bestwert();
      if (best) kopf.append(el('span', null, 'Bestwert ' + best + ' m'));
      const rang = el('button', 'dj-rang', rangText(zielstand));
      rang.type = 'button';
      rang.addEventListener('click', zieleZeigen);
      kopf.append(rang);
      s.unter(stand.steuerung === 'neigen' ? 'Gesteuert mit Neigen' : '');
    }

    function steuerKnopf() {
      return { text: stand.steuerung === 'neigen' ? 'Mit Halten steuern' : 'Mit Neigen steuern', art: 'still', tun: steuerungWechseln };
    }

    function zieleKnopf() {
      const zs = zieleJetzt();
      const text = zs.stufe >= ZIELE.length ? 'Ziele' : 'Ziele ' + zs.erreicht.filter(Boolean).length + '/3';
      return { text, art: 'still', tun: zieleZeigen };
    }

    function anzeigen() {
      kopfZeichnen();
      const z = stand.zustand;
      steuer.hidden = z === 'pause' || z === 'vorbei';
      unten.replaceChildren();
      if (z === 'bereit') {
        b.schild('Tippen zum Springen', stand.steuerung === 'neigen'
          ? 'Neig das Handy, um zu lenken. Ein Tipp aufs Feld schießt.'
          : 'Unten halten lenkt, oben tippen schießt. Am Rechner: Pfeile lenken, Leertaste schießt.');
        const l = el('div', 'leiste');
        for (const kn of [steuerKnopf(), zieleKnopf()]) {
          const k = el('button', 'knopf knopf--still', kn.text);
          k.type = 'button';
          k.addEventListener('click', kn.tun);
          l.append(k);
        }
        unten.append(l);
      } else if (z === 'pause') {
        b.schild('Pause', 'Tippen, um weiterzuspringen.');
        const zs = zieleJetzt();
        const ziele = zs.stufe < ZIELE.length ? ' ' + rangText(zs) + ': ' + zs.erreicht.filter(Boolean).length + ' von 3 Zielen.' : '';
        unten.append(Echtzeit.kasten('Pause', meterVon(stand) + ' m bisher.' + ziele, [
          { text: 'Weiter', tun: weiter },
          { text: 'Neu anfangen', art: 'still', tun: neu },
          steuerKnopf(),
        ]));
      } else if (z === 'vorbei') {
        const titel = stand.figur.tot === 'monster' ? 'Vom Monster erwischt.'
          : stand.figur.tot === 'loch' ? 'Ins schwarze Loch gefallen.' : 'Abgestürzt.';
        b.schild(titel);
        const best = bestwert();
        const m = meterVon(stand);
        let text = m + ' m hoch in ' + s.dauerText(Math.round(stand.zeit * 1000)) + '.' +
          (m > 0 && m >= best ? ' Das ist dein Bestwert.' : '');
        if (bilanz && bilanz.ziele.length) {
          text += ' Geschafft: ' + bilanz.ziele.map((x) => x.text).join(', ') + '.';
        }
        if (bilanz && bilanz.rang) text += ' ' + (zielstand.stufe >= ZIELE.length ? 'Alle Ränge geschafft!' : rangText(zielstand) + ' erreicht!');
        unten.append(Echtzeit.kasten(titel, text, [{ text: 'Nochmal', tun: neu }, zieleKnopf()]));
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
    }

    function zieleZeigen() {
      const zs = zieleJetzt();
      const d = el('div');
      if (zs.stufe >= ZIELE.length) {
        d.append(el('p', 'notiz', 'Alle ' + ZIELE.length + ' Ränge geschafft. Mehr Ziele gibt es nicht – nur noch Höhe.'));
        s.blatt({ titel: 'Ziele', inhalt: d, aktionen: [{ text: 'Fertig' }] });
        return;
      }
      d.append(el('p', 'notiz', 'Drei Ziele je Rang. Sind alle drei geschafft, geht es mit der nächsten Partie im nächsten Rang weiter. Gezählt wird ab dem Rang, in dem ein Ziel steht.'));
      const liste = el('ul', 'dj-ziele');
      ZIELE[zs.stufe].forEach((z, i) => {
        const fertig = zs.erreicht[i];
        const li = el('li', 'dj-ziel' + (fertig ? ' dj-ziel--fertig' : ''));
        const w = Math.min(z.n, Math.floor(zs.werte[i]));
        const einheit = z.feld === 'meter' || z.feld.startsWith('ohne') ? ' m' : '';
        li.append(
          el('span', 'dj-ziel-haken', fertig ? '✓' : ''),
          el('span', 'dj-ziel-text', z.text),
          el('span', 'dj-ziel-zahl', fertig ? 'geschafft' : w + ' / ' + z.n + einheit)
        );
        const balken = el('span', 'dj-ziel-balken');
        const fuellung = el('span');
        fuellung.style.width = Math.round((100 * w) / z.n) + '%';
        balken.append(fuellung);
        li.append(balken);
        liste.append(li);
      });
      d.append(liste);
      if (zs.stufe > 0) {
        d.append(el('p', 'notiz notiz--fuss', zs.stufe === 1 ? 'Rang 1 ist geschafft.' : 'Rang 1 bis ' + zs.stufe + ' sind geschafft.'));
      }
      s.blatt({ titel: rangText(zs) + ' von ' + ZIELE.length, inhalt: d, aktionen: [{ text: 'Fertig' }] });
    }

    /* ----------------------------------------------------------- Zeichnen */

    function propellerMalen(ctx, f, x, y, dreht) {
      // x, y: Mitte der Unterkante der Kappe
      ctx.fillStyle = f.tMond;
      ctx.strokeStyle = f.tinte;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - 4.5);
      ctx.lineTo(x, y - 6.5);
      ctx.stroke();
      const w = dreht == null ? 5 : 1 + 5 * Math.abs(Math.cos(dreht * 40));
      ctx.strokeStyle = f.rost;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x - w, y - 6.5);
      ctx.lineTo(x + w, y - 6.5);
      ctx.stroke();
    }

    function raketeMalen(ctx, f, x, y, brennt) {
      // x, y: Mitte der Oberkante
      ctx.strokeStyle = f.tinte;
      ctx.lineWidth = 0.7;
      for (const dx of [-4.4, 0.8]) {
        if (brennt) {
          ctx.fillStyle = Math.random() < 0.5 ? f.tSonne : f.gelb;
          ctx.beginPath();
          ctx.moveTo(x + dx + 0.2, y + 10);
          ctx.lineTo(x + dx + 1.8, y + 14 + Math.random() * 5);
          ctx.lineTo(x + dx + 3.4, y + 10);
          ctx.fill();
        }
        ctx.fillStyle = f.grau;
        Echtzeit.rund(ctx, x + dx, y + 2, 3.6, 8, 1.2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = f.rost;
        ctx.beginPath();
        ctx.moveTo(x + dx, y + 2.5);
        ctx.lineTo(x + dx + 1.8, y - 0.5);
        ctx.lineTo(x + dx + 3.6, y + 2.5);
        ctx.fill();
      }
    }

    function augenMalen(ctx, x, y, r, zielX) {
      const dx = Math.max(-1, Math.min(1, (zielX - x) / 30));
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1B1815';
      ctx.beginPath();
      ctx.arc(x + dx * r * 0.45, y + r * 0.15, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Monster in Weltkoordinaten minus Kamera; x, y ist die linke obere Ecke. */
    function monsterMalen(ctx, f, m, x, y, zielX) {
      const hell = m.blitz > 0;
      ctx.strokeStyle = f.tinte;
      ctx.lineWidth = 0.9;
      ctx.lineJoin = 'round';
      if (m.art === 'klecks') {
        const y0 = y + Math.sin(m.t * 3) * 1.2;
        ctx.fillStyle = hell ? f.karte : f.tMond;
        ctx.beginPath();
        ctx.moveTo(0.5 + x, y0 + 12);
        ctx.quadraticCurveTo(x, y0, x + 11, y0);
        ctx.quadraticCurveTo(x + 22, y0, x + 21.5, y0 + 12);
        // Füßchen, die zappeln
        for (let k = 0; k < 4; k += 1) {
          const kx = x + 21.5 - (k + 0.5) * 5.25;
          const zappeln = Math.sin(m.t * 9 + k * 1.7) * 1.2;
          ctx.lineTo(kx + 1.5, y0 + 12);
          ctx.lineTo(kx + zappeln, y0 + 16);
          ctx.lineTo(kx - 1.5, y0 + 12);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        augenMalen(ctx, x + 7, y0 + 5.5, 2.6, zielX);
        augenMalen(ctx, x + 15, y0 + 5.5, 2.6, zielX);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x + 6, y0 + 9.5);
        for (let k = 0; k <= 5; k += 1) ctx.lineTo(x + 6 + k * 2, y0 + (k % 2 ? 11.5 : 9.5));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (m.art === 'flatter') {
        const cx = x + 10;
        const cy = y + 6;
        const schlag = Math.sin(m.t * 16);
        ctx.fillStyle = hell ? f.karte : f.grau;
        for (const r of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx + r * 3, cy - 1);
          ctx.lineTo(cx + r * 10, cy - 1 - schlag * 5);
          ctx.lineTo(cx + r * 8, cy + 2 - schlag * 2);
          ctx.lineTo(cx + r * 6, cy + 1);
          ctx.lineTo(cx + r * 3, cy + 3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        augenMalen(ctx, cx - 1.8, cy - 0.8, 1.7, zielX);
        augenMalen(ctx, cx + 1.8, cy - 0.8, 1.7, zielX);
      } else {
        const wackeln = hell ? Math.sin(m.t * 90) * 1.2 : 0;
        const x0 = x + wackeln;
        ctx.fillStyle = hell ? f.karte : f.rost;
        for (const hx of [4, 20]) {
          ctx.beginPath();
          ctx.moveTo(x0 + hx, y + 5);
          ctx.lineTo(x0 + hx + 3, y);
          ctx.lineTo(x0 + hx + 6, y + 5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        Echtzeit.rund(ctx, x0, y + 3, 30, 19, 7);
        ctx.fill();
        ctx.stroke();
        augenMalen(ctx, x0 + 15, y + 10, 4.4, zielX);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x0 + 8, y + 16, 14, 3);
        ctx.strokeRect(x0 + 8, y + 16, 14, 3);
        ctx.beginPath();
        for (let k = 1; k < 5; k += 1) {
          ctx.moveTo(x0 + 8 + k * 2.8, y + 16);
          ctx.lineTo(x0 + 8 + k * 2.8, y + 19);
        }
        ctx.stroke();
        // Wie viel es noch aushält: ein Punkt je übrigem Treffer
        ctx.fillStyle = f.tinte;
        for (let k = 0; k < m.leben; k += 1) ctx.fillRect(x0 + 11.5 + k * 3, y + 4.5, 1.6, 1.6);
      }
    }

    function lochMalen(ctx, f, l, y, zeit) {
      const g = ctx.createRadialGradient(l.x, y, 1, l.x, y, LOCH_R + 5);
      g.addColorStop(0, 'rgba(12, 10, 9, 1)');
      g.addColorStop(0.6, 'rgba(12, 10, 9, 0.95)');
      g.addColorStop(1, 'rgba(12, 10, 9, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(l.x, y, LOCH_R + 5, 0, Math.PI * 2);
      ctx.fill();
      // Wirbel in der Farbe der Monde – auch auf dunklem Papier zu sehen
      ctx.strokeStyle = f.tMond;
      ctx.lineWidth = 0.9;
      for (let k = 0; k < 3; k += 1) {
        const r = 5 + k * 3.2;
        const a = -zeit * (3 - k * 0.6) + k * 2.1;
        ctx.globalAlpha = 0.9 - k * 0.22;
        ctx.beginPath();
        ctx.arc(l.x, y, r, a, a + 2.2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function figurMalen(ctx, f, x, y, figur, flug) {
      const blick = figur.blick || 1;
      const steigt = figur.vy < -120;
      const nase = figur.nase > 0 && !figur.tot;
      if (flug && flug.art === 'rakete') raketeMalen(ctx, f, x - blick * 6, y - 18, true);
      ctx.strokeStyle = f.tinte;
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // Beine: im Steigen angezogen, im Fallen ausgestreckt
      const bein = steigt ? 2.5 : 4.5;
      ctx.moveTo(x - 3, y - 4.5); ctx.lineTo(x - 3.8, y - 4.5 + bein);
      ctx.moveTo(x + 3, y - 4.5); ctx.lineTo(x + 3.8, y - 4.5 + bein);
      ctx.stroke();
      ctx.fillStyle = f.gelb;
      ctx.lineWidth = 0.9;
      Echtzeit.rund(ctx, x - 7, y - 17, 14, 13, 5);
      ctx.fill();
      ctx.stroke();
      // Beim Schießen zeigt die Nase nach oben, wie beim Vorbild.
      if (nase) Echtzeit.rund(ctx, x - 2, y - 21.5, 4, 6, 2);
      else Echtzeit.rund(ctx, x + blick * 5 - 2.5, y - 12.5, 5, 4, 2);
      ctx.fill();
      ctx.stroke();
      if (figur.tot) {
        ctx.strokeStyle = '#1B1815';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (const dx of [-2.3, 2.3]) {
          ctx.moveTo(x + dx - 1.3, y - 14.3); ctx.lineTo(x + dx + 1.3, y - 11.7);
          ctx.moveTo(x + dx + 1.3, y - 14.3); ctx.lineTo(x + dx - 1.3, y - 11.7);
        }
        ctx.stroke();
      } else {
        for (const dx of [-2.2, 2.4]) {
          const ax = x + dx + (nase ? 0 : blick * 1.2);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(ax, y - 13, 1.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1B1815';
          ctx.beginPath();
          ctx.arc(nase ? ax : ax + blick * 0.7, nase ? y - 13.8 : y - 13, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (flug && flug.art === 'propeller') propellerMalen(ctx, f, x, y - 17, flug.t);
    }

    function zeichnen(ctx, f) {
      const st = stand;
      const fig = st.figur;
      ctx.fillStyle = f.karte;
      ctx.fillRect(0, 0, B, H);

      // Karopapier, fest an der Welt, nicht am Bildschirm: Es zieht beim
      // Steigen mit nach unten und zeigt so die Bewegung.
      ctx.strokeStyle = f.karteRand;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let y = Math.ceil(st.kamera / 10) * 10 - st.kamera; y < H; y += 10) {
        ctx.moveTo(0, y);
        ctx.lineTo(B, y);
      }
      for (let x = 10; x < B; x += 10) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      ctx.stroke();

      for (const l of st.loecher) {
        const y = l.y - st.kamera;
        if (y > -20 && y < H + 20) lochMalen(ctx, f, l, y, st.zeit);
      }

      for (const p of st.platten) {
        const y = p.y - st.kamera;
        if (y < -20 || y > H + 10) continue;
        if (p.art === 'weg') {
          const fall = p.fall * p.fall * 400;
          ctx.globalAlpha = Math.max(0, 1 - p.fall);
          ctx.fillStyle = f.rost;
          ctx.save();
          ctx.translate(p.x + 7, y + fall);
          ctx.rotate(-p.fall);
          ctx.fillRect(-7, 0, 14, PLATTE_H - 1);
          ctx.restore();
          ctx.save();
          ctx.translate(p.x + 23, y + fall * 1.1);
          ctx.rotate(p.fall * 1.2);
          ctx.fillRect(-7, 0, 14, PLATTE_H - 1);
          ctx.restore();
          ctx.globalAlpha = 1;
          continue;
        }
        ctx.fillStyle = p.art === 'wandernd' ? f.tMond : p.art === 'bruechig' ? f.rost : f.gruen;
        Echtzeit.rund(ctx, p.x, y, PLATTE_B, PLATTE_H, 3);
        ctx.fill();
        if (p.art === 'bruechig') {
          ctx.strokeStyle = f.karte;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x + 14, y);
          ctx.lineTo(p.x + 16.5, y + 3);
          ctx.lineTo(p.x + 14.5, y + PLATTE_H);
          ctx.stroke();
        }
        if (p.feder != null) {
          const hoch = p.gespannt > 0 ? 7 : 4;
          const fx = p.x + p.feder;
          ctx.strokeStyle = f.tinteLeise;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          for (let k = 0; k <= 3; k += 1) {
            const yy = y - (hoch * k) / 3;
            ctx.moveTo(fx + (k % 2 ? 0 : FEDER_B), yy);
            ctx.lineTo(fx + (k % 2 ? FEDER_B : 0), yy - hoch / 6);
          }
          ctx.stroke();
          ctx.fillStyle = f.tinteLeise;
          ctx.fillRect(fx - 0.5, y - hoch - 1.5, FEDER_B + 1, 1.5);
        }
        if (p.ding) {
          const dx = p.x + p.ding.x + DING_B / 2;
          if (p.ding.art === 'propeller') propellerMalen(ctx, f, dx, y);
          else raketeMalen(ctx, f, dx - 0.5, y - 10.5, false);
        }
      }

      for (const m of st.monster) {
        const y = m.y - st.kamera;
        if (y < -30 || y > H + 10) continue;
        monsterMalen(ctx, f, m, m.x, y, fig.x);
      }

      for (const x of st.fetzen) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - x.t / 1.5);
        if (MONSTER[x.art]) {
          const a = MONSTER[x.art];
          ctx.translate(x.x + a.b / 2, x.y - st.kamera + a.h / 2);
          ctx.rotate(x.t * x.dreh);
          ctx.scale(1, -1);   // auf dem Rücken
          monsterMalen(ctx, f, { art: x.art, t: 0, blitz: 0, leben: 0 }, -a.b / 2, -a.h / 2, x.x);
        } else {
          ctx.translate(x.x, x.y - st.kamera);
          ctx.rotate(x.t * x.dreh);
          if (x.art === 'propeller') propellerMalen(ctx, f, 0, 0);
          else raketeMalen(ctx, f, -0.5, -6, false);
        }
        ctx.restore();
      }

      ctx.fillStyle = f.tinte;
      for (const k of st.kugeln) {
        ctx.beginPath();
        ctx.arc(k.x, k.y - st.kamera, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      if (st.sog) {
        const k = Math.min(1, st.sog.t / SOG_DAUER);
        const x = st.sog.vonX + (st.sog.zuX - st.sog.vonX) * k;
        const y = st.sog.vonY + (st.sog.zuY - st.sog.vonY) * k - st.kamera;
        ctx.save();
        ctx.translate(x, y - 9);
        ctx.rotate(k * 10);
        ctx.scale(1 - k * 0.92, 1 - k * 0.92);
        figurMalen(ctx, f, 0, 9, fig, null);
        ctx.restore();
      } else {
        const fy = fig.y - st.kamera;
        figurMalen(ctx, f, fig.x, fy, fig, st.flug);
        // Am Rand halb hier, halb drüben: Die Figur ist auf beiden Seiten zu sehen.
        if (fig.x < 8) figurMalen(ctx, f, fig.x + B, fy, fig, st.flug);
        if (fig.x > B - 8) figurMalen(ctx, f, fig.x - B, fy, fig, st.flug);
        if (fig.tot === 'monster') {
          ctx.fillStyle = f.gelb;
          for (let k = 0; k < 3; k += 1) {
            const a = st.zeit * 6 + (k * Math.PI * 2) / 3;
            const sx = fig.x + Math.cos(a) * 8;
            const sy = fy - 22 + Math.sin(a) * 2.5;
            ctx.fillRect(sx - 1.5, sy - 0.4, 3, 0.8);
            ctx.fillRect(sx - 0.4, sy - 1.5, 0.8, 3);
          }
        }
      }

      if (st.ansagen.length) {
        const a = st.ansagen[0];
        ctx.globalAlpha = Math.max(0, Math.min(1, a.t / 0.3, (a.d - a.t) / 0.15));
        ctx.font = '700 8px "Bricolage Grotesque", system-ui, sans-serif';
        const breite = ctx.measureText(a.text).width;
        const groesse = Math.min(8, (8 * (B - 28)) / Math.max(1, breite));
        ctx.font = '700 ' + groesse.toFixed(2) + 'px "Bricolage Grotesque", system-ui, sans-serif';
        ctx.fillStyle = f.gruen;
        Echtzeit.rund(ctx, 8, 7, B - 16, 17, 5);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.text, B / 2, 15.8);
        ctx.textBaseline = 'alphabetic';
        ctx.globalAlpha = 1;
      }
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Die Figur springt von allein. Du lenkst nur: halte unten links, um nach links zu laufen, rechts für rechts. Tippst du in die obere Hälfte des Feldes, schießt sie in diese Richtung. Am Rechner lenken die Pfeiltasten oder A und D, Leertaste, W oder Pfeil hoch schießen gerade nach oben.'));
      d.append(el('p', 'notiz', 'Wer lieber das Handy neigt, stellt das unter dem Feld oder in der Pause um. Dann schießt ein Tipp irgendwo aufs Feld. Auf dem iPhone fragt der Browser einmal um Erlaubnis.'));
      d.append(el('p', 'notiz', 'Grüne Plattformen tragen, blaue wandern hin und her, rostrote brechen beim ersten Tritt. Eine Feder schießt dich weit nach oben, ein Propeller trägt dich ein Stück, eine Rakete noch viel weiter – im Flug kann dir nichts passieren.'));
      d.append(el('p', 'notiz', 'Monster summen, wenn sie kommen. Berührst du eins, stürzt du ab – außer du springst von oben drauf. Die kleinen fallen nach einem Treffer, der große Rote braucht drei. Schwarze Löcher schlucken dich und jeden Schuss.'));
      d.append(el('p', 'notiz', 'Wer links hinausläuft, kommt rechts wieder herein. Wer unten aus dem Bild fällt, ist abgestürzt. Gezählt wird die größte Höhe. Unter „Ziele" stehen die drei Aufgaben deines Rangs.'));
      s.blatt({ titel: 'Hochhinaus', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* ---------------------------------------------------------- Steuerung */

    const seiteVon = (e) => {
      const r = flaeche.getBoundingClientRect();
      return e.clientX < r.left + r.width / 2 ? -1 : 1;
    };

    /* Liegt der Finger auf dem Teil des Feldes, der schießt? Beim Neigen ist
       das ganze Feld frei dafür, sonst nur die obere Hälfte. */
    const schusspunkt = (e) => {
      const r = b.canvas.getBoundingClientRect();
      if (!r.width || e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return null;
      const anteil = (e.clientY - r.top) / r.height;
      if (stand.steuerung !== 'neigen' && anteil >= SCHUSSZONE) return null;
      return { x: ((e.clientX - r.left) / r.width) * B, y: anteil * H + stand.kamera };
    };

    b.an(flaeche, 'pointerdown', (e) => {
      if (stand.zustand === 'vorbei') return;
      e.preventDefault();
      const ziel = schusspunkt(e);
      if (ziel) {
        if (stand.zustand === 'laeuft') schiessen(ziel.x, ziel.y);
        else weiter();
        return;
      }
      try { flaeche.setPointerCapture(e.pointerId); } catch { /* synthetisch */ }
      halten.delete(e.pointerId);
      halten.set(e.pointerId, seiteVon(e));
      weiter();
    });
    b.an(flaeche, 'pointermove', (e) => {
      if (halten.has(e.pointerId)) halten.set(e.pointerId, seiteVon(e));
    });
    const loslassen = (e) => { halten.delete(e.pointerId); };
    b.an(flaeche, 'pointerup', loslassen);
    b.an(flaeche, 'pointercancel', loslassen);

    const tasteVon = (e) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    b.an(window, 'keydown', (e) => {
      if (!Echtzeit.tasteZaehlt(e)) return;
      const k = tasteVon(e);
      if (k === 'ArrowLeft' || k === 'a') { e.preventDefault(); tasteL = true; weiter(); }
      else if (k === 'ArrowRight' || k === 'd') { e.preventDefault(); tasteR = true; weiter(); }
      else if (k === 'ArrowUp' || k === 'w' || (k === ' ' && !Echtzeit.knopfHatFokus(e))) {
        e.preventDefault();
        if (stand.zustand === 'laeuft') schiessen();
        else if (!e.repeat) weiter();
      } else if (k === 'Enter' && !Echtzeit.knopfHatFokus(e)) {
        e.preventDefault();
        if (stand.zustand === 'bereit') weiter();
        else pauseUmschalten();
      } else if (k === 'p' || k === 'Escape') {
        pauseUmschalten();
      }
    });
    b.an(window, 'keyup', (e) => {
      const k = tasteVon(e);
      if (k === 'ArrowLeft' || k === 'a') tasteL = false;
      else if (k === 'ArrowRight' || k === 'd') tasteR = false;
    });

    anzeigen();

    return {
      ende: () => {
        clearTimeout(pruefUhr);
        b.ende();
        sichern();
        klang.ende();
      },
    };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien, hilfe) {
    const z = Echtzeit.zahl;
    const best = partien.reduce((h, p) => Math.max(h, z(p.meter)), 0);
    const schnitt = partien.length ? Math.round(partien.reduce((sum, p) => sum + z(p.meter), 0) / partien.length) : 0;
    const laengste = partien.reduce((h, p) => Math.max(h, z(p.dauer)), 0);
    const monster = partien.reduce((sum, p) => sum + z(p.monster), 0);
    const zs = zieleRechnen(partien);
    return [
      { wert: best + ' m', label: 'Bestwert' },
      { wert: schnitt + ' m', label: 'Höhe im Schnitt' },
      { wert: hilfe.dauerText(laengste), label: 'längste Partie' },
      { wert: String(monster), label: 'Monster abgeschossen' },
      { wert: zs.stufe + '/' + ZIELE.length, label: 'Ränge geschafft' },
    ];
  }

  Rahmen.anmelden({
    id: 'doodle',
    name: 'Hochhinaus',
    unter: 'Von Plattform zu Plattform, immer höher.',
    farbe: '#C9772E',
    symbol: '<path d="M4 20h7M13 13h7M6 7h6"/><path d="M9 17c0-4 3-7 7-8" stroke-dasharray="1.5 2.5"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
