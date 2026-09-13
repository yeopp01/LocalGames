/* Sternjäger – Space Impact wie auf dem alten Nokia: ein Schiff links, die
   Welt zieht vorbei, Staffel um Staffel, und am Ende jedes Levels wartet ein
   Endgegner.

   Gelenkt wird wie bei den Invasoren: Das Schiff folgt der Bewegung des
   Fingers, nicht seiner Stelle – jetzt in beide Richtungen –, und solange er
   aufliegt, feuert es. Die Spezialwaffe liegt auf einem eigenen Knopf, damit
   ein Tipp mit dem zweiten Finger sie zündet, ohne das Lenken zu stören.

   Ein Level ist nicht jedes Mal neu gewürfelt. Sein Ablauf entsteht aus einem
   festen Startwert, also kommen dieselben Staffeln in derselben Reihenfolge –
   man lernt ein Level, wie man es damals gelernt hat.

   Gelände schiebt das Schiff weg, statt es zu zerstören. Auf dem kleinen Feld
   läge sonst ein Leben in einer Bodenwelle, die unter dem Daumen auftaucht.

   Die Figuren sind eigene Pixelbilder im Geist des Handys von 2000, keine
   Abschrift. */

(() => {
  const B = 168;
  const H = 96;
  const ROLLEN = 22;          // Einheiten je Sekunde, die die Welt vorbeizieht
  const SCHIFF_TEMPO = 75;
  const SCHUSS_TEMPO = 230;
  const SCHUSS_TAKT = 0.2;
  const SCHUSS_MAX = 4;
  const LEBEN = 3;
  const LEBEN_MAX = 9;
  const SCHUTZ = 2.2;
  const SPEZIAL_PACK = 3;
  const SPEZIAL_MAX = 9;
  const GESCHOSSE_MAX = 16;
  const SCHIEBEN = 200;       // so schnell schiebt Gelände das Schiff zurück
  const BOSS_PUNKTE = 200;

  /* ------------------------------------------------------------- Bilder */

  const SCHIFF = [
    '###........',
    '.####......',
    '..#######..',
    '.##########',
    '..#######..',
    '.####......',
    '###........',
  ];
  const KNALL = ['#...#.#...#', '.#.......#.', '..#.....#..', '##.......##', '..#.....#..', '.#.......#.', '#...#.#...#'];

  const PFEIL = [
    '...####',
    '.####..',
    '#######',
    '.####..',
    '...####',
  ];
  const WELLE = [
    ['..####..', '.######.', '##.##.##', '########', '.#.##.#.', '#......#'],
    ['..####..', '.######.', '##.##.##', '########', '.#.##.#.', '.#....#.'],
  ];
  const JAEGER = [
    '....##..',
    '..####..',
    '.##..###',
    '########',
    '.##..###',
    '..####..',
    '....##..',
  ];
  const SCHUETZE = [
    '...#####.',
    '..##...##',
    '###.###.#',
    '#########',
    '###.###.#',
    '..##...##',
    '...#####.',
  ];
  const BROCKEN = [
    '...####...',
    '.###..###.',
    '##.#....##',
    '#....##..#',
    '#...####.#',
    '##...##..#',
    '.##.....##',
    '..###.###.',
    '....###...',
  ];

  const spiegeln = (bild) => bild.map((z) => z.split('').reverse().join(''));

  const ARTEN = {
    pfeil: { bilder: [PFEIL], hp: 1, punkte: 10, tempo: 58 },
    welle: { bilder: WELLE, hp: 1, punkte: 15, tempo: 40 },
    jaeger: { bilder: [JAEGER], hp: 2, punkte: 20, tempo: 30 },
    schuetze: { bilder: [SCHUETZE], hp: 3, punkte: 30, tempo: 36 },
    brocken: { bilder: [BROCKEN, spiegeln(BROCKEN)], hp: 5, punkte: 40, tempo: 20 },
  };

  /* Wie viele einer Art zusammen kommen und wie dicht hintereinander.
     Wer „streut", kommt jeder auf eigener Höhe. */
  const FORMATION = {
    pfeil: { n: [3, 5], abstand: 0.32 },
    welle: { n: [4, 6], abstand: 0.3 },
    jaeger: { n: [2, 3], abstand: 0.7, streu: true },
    schuetze: { n: [1, 2], abstand: 1.4, streu: true },
    brocken: { n: [1, 3], abstand: 1.1, streu: true },
  };

  const KRAKE = [
    '......######......',
    '....##########....',
    '...############...',
    '..###..####..###..',
    '..###..####..###..',
    '.################.',
    '##################',
    '##################',
    '.################.',
    '..#.##.####.##.#..',
    '.##.#..#..#..#.##.',
    '.#..#.##..##.#..#.',
    '##.##.#....#.##.##',
    '#..#..#....#..#..#',
    '...#..........#...',
  ];

  const BOSSE = {
    kreuzer: {
      bilder: [[
        '.........#######......',
        '......##########......',
        '....##############....',
        '..####..##..##..#####.',
        '######################',
        '#.##.##.##.##.##.##.##',
        '######################',
        '..####################',
        '....##############....',
        '......##########......',
        '.........#######......',
      ]],
      hp: 40, bewegung: 'pendel', tempo: 11,
      angriffe: [['gezielt', 1.3], ['faecher3', 2.6]],
    },
    krake: {
      // Die Fangarme wandern: im zweiten Bild um eine Spalte versetzt.
      bilder: [KRAKE, KRAKE.map((z, i) => (i < 9 ? z : z.slice(1) + z[0]))],
      hp: 55, bewegung: 'sinus',
      angriffe: [['brut', 3.2], ['gezielt', 1.5]],
    },
    turm: {
      bilder: [[
        '.....######.....',
        '....########....',
        '...##########...',
        '...##.####.##...',
        '...##########...',
        '######..######..',
        '#########.####..',
        '######..######..',
        '...##########...',
        '....########....',
        '....##.##.##....',
        '....########....',
        '...##########...',
        '..############..',
        '..##.##.##.##...',
        '..############..',
        '.##############.',
        '################',
        '##.##.##.##.##.#',
        '################',
      ]],
      hp: 65, bewegung: 'pendel', tempo: 12,
      angriffe: [['salve', 2.2], ['faecher3', 3.0]],
    },
    waechter: {
      bilder: [[
        '......#####......',
        '....#########....',
        '...###########...',
        '..#############..',
        '.######...######.',
        '.#####.....#####.',
        '#####..###..#####',
        '####..#####..####',
        '####..##.##..####',
        '####..#####..####',
        '#####..###..#####',
        '.#####.....#####.',
        '.######...######.',
        '..#############..',
        '...###########...',
        '....#########....',
        '......#####......',
      ]],
      hp: 75, bewegung: 'folgen', tempo: 16,
      angriffe: [['faecher5', 2.4], ['gezielt', 1.6]],
    },
    panzer: {
      bilder: [[
        '...........#####..........',
        '.......#############......',
        '..#######################.',
        '#####..##..##..##..#######',
        '##########################',
        '..########################',
        '#####..##..##..##..#######',
        '..#######################.',
        '.......#############......',
        '...........#####..........',
      ]],
      hp: 90, bewegung: 'pendel', tempo: 13,
      angriffe: [['salve', 2.0], ['brut', 4.0], ['faecher3', 2.8]],
    },
    mutter: {
      bilder: [[
        '...........########...........',
        '.........############.........',
        '.......################.......',
        '.....####################.....',
        '...###..##..##..##..##..###...',
        '..##########################..',
        '.############################.',
        '####..####..####..####..######',
        '##############################',
        '##############################',
        '####..####..####..####..######',
        '.############################.',
        '..##########################..',
        '...###..##..##..##..##..###...',
        '.....####################.....',
        '.......################.......',
        '.........############.........',
        '...........########...........',
      ]],
      hp: 120, bewegung: 'sinus',
      angriffe: [['ring', 3.4], ['gezielt', 1.4], ['brut', 5.0]],
    },
  };

  const EXTRA_BILD = {
    rakete: ['..#..', '...#.', '#####', '...#.', '..#..'],
    strahl: ['#....', '##...', '#####', '##...', '#....'],
    wand: ['.#.#.', '.#.#.', '.#.#.', '.#.#.', '.#.#.'],
    leben: ['##.##', '#####', '#####', '.###.', '..#..'],
  };
  const SPEZIAL_NAME = { rakete: 'Rakete', strahl: 'Strahl', wand: 'Wand' };

  /* ---------------------------------------------------------- Welten */

  const hash = (i) => {
    const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
  const rest = (a, n) => ((a % n) + n) % n;

  /* boden(x) und decke(x) sind Höhen in Einheiten an der Weltstelle x;
     bodenMax und deckeMax sagen, wo Gegner sicher auftauchen dürfen. */
  const WELTEN = {
    sterne: { boden: () => 0, decke: () => 0, bodenMax: 0, deckeMax: 0 },
    huegel: {
      boden: (x) => 8 + 3.5 * Math.sin(x / 21) + 2.5 * Math.sin(x / 8.3 + 1.3),
      decke: () => 0, bodenMax: 14, deckeMax: 0,
    },
    hoehle: {
      boden: (x) => 6 + 3 * Math.sin(x / 19 + 0.4) + 2 * Math.sin(x / 7.1),
      decke: (x) => 6 + 3 * Math.sin(x / 23 + 2.1) + 2 * Math.sin(x / 6.3 + 0.7),
      bodenMax: 11, deckeMax: 11,
    },
    stadt: { boden: (x) => 4 + Math.floor(hash(Math.floor(x / 11)) * 11), decke: () => 0, bodenMax: 15, deckeMax: 0 },
    rumpf: {
      boden: (x) => (rest(Math.floor(x / 40), 3) === 0 ? 10 : 5),
      decke: (x) => (rest(Math.floor(x / 56), 2) ? 9 : 5),
      bodenMax: 10, deckeMax: 9,
    },
  };

  const LEVELS = [
    { name: 'Sternenfeld', welt: 'sterne', dauer: 50, dichte: 0.9, arten: { pfeil: 3, welle: 2 },
      boss: 'kreuzer', extras: ['rakete', 'strahl', 'rakete'] },
    { name: 'Asteroidengürtel', welt: 'sterne', dauer: 55, dichte: 0.95, arten: { pfeil: 2, welle: 2, brocken: 2 },
      boss: 'krake', extras: ['wand', 'leben', 'rakete'] },
    { name: 'Mondhügel', welt: 'huegel', dauer: 55, dichte: 1, arten: { pfeil: 2, jaeger: 2, schuetze: 1 },
      boss: 'turm', extras: ['strahl', 'rakete', 'wand'] },
    { name: 'Eishöhle', welt: 'hoehle', dauer: 58, dichte: 1, arten: { welle: 2, jaeger: 2, schuetze: 1, brocken: 1 },
      boss: 'waechter', extras: ['rakete', 'leben', 'strahl'] },
    { name: 'Ruinenstadt', welt: 'stadt', dauer: 60, dichte: 1.1, arten: { pfeil: 2, jaeger: 2, schuetze: 2, brocken: 1 },
      boss: 'panzer', extras: ['wand', 'strahl', 'rakete'] },
    { name: 'Mutterschiff', welt: 'rumpf', dauer: 60, dichte: 1.2, arten: { pfeil: 2, welle: 2, jaeger: 2, schuetze: 2, brocken: 1 },
      boss: 'mutter', extras: ['leben', 'wand', 'strahl'] },
  ];

  const levelDaten = (level) => LEVELS[(level - 1) % LEVELS.length];
  const umlaufVon = (level) => Math.floor((level - 1) / LEVELS.length) + 1;
  /* Nach dem sechsten Level beginnt es von vorn, jede Runde etwas schneller. */
  const tempoVon = (level) => Math.min(1.6, 1 + 0.15 * (umlaufVon(level) - 1));

  function zufall(saat) {
    let a = saat >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Der ganze Ablauf eines Levels vorab: wer wann auf welcher Höhe kommt. */
  function planen(level) {
    const L = levelDaten(level);
    const w = WELTEN[L.welt];
    const r = zufall(level * 9973 + 17);
    const oben = w.deckeMax + 8;
    const unten = H - w.bodenMax - 8;
    const hoehe = () => oben + r() * (unten - oben);
    const arten = Object.keys(L.arten);
    const summe = arten.reduce((s, a) => s + L.arten[a], 0);
    const plan = [];
    let t = 3;
    while (t < L.dauer) {
      let wahl = r() * summe;
      let art = arten[0];
      for (const a of arten) {
        wahl -= L.arten[a];
        if (wahl < 0) { art = a; break; }
      }
      const f = FORMATION[art];
      const n = f.n[0] + Math.floor(r() * (f.n[1] - f.n[0] + 1));
      const y0 = hoehe();
      const treppe = art === 'pfeil' && r() < 0.5 ? (r() < 0.5 ? -7 : 7) : 0;
      for (let i = 0; i < n; i += 1) {
        const y = f.streu ? hoehe() : Math.max(oben, Math.min(unten, y0 + treppe * (i - (n - 1) / 2)));
        plan.push({ t: t + i * f.abstand, art, y, p: i });
      }
      t += n * f.abstand + (1.3 + r() * 1.4) / L.dichte;
    }
    L.extras.forEach((extra, i) => plan.push({ t: L.dauer * [0.3, 0.6, 0.88][i], art: 'extra', extra, y: hoehe(), p: i }));
    return plan.sort((a, b) => a.t - b.t);
  }

  function frisch() {
    return {
      zustand: 'bereit',
      punkte: 0,
      leben: LEBEN,
      level: 1,
      phase: 'flug',
      zeit: 0,
      levelZeit: 0,
      weg: 0,
      plan: planen(1),
      schiff: { x: 22, y: H / 2 },
      schutz: 0,
      getroffen: 0,
      feuerUhr: 0,
      spezialUhr: 0,
      spezial: { art: 'rakete', anzahl: SPEZIAL_PACK },
      schuesse: [],
      geschosse: [],
      gegner: [],
      extras: [],
      raketen: [],
      strahl: null,
      wand: null,
      boss: null,
      siegUhr: 0,
      knall: [],
      ansage: { text: 'Level 1', unter: LEVELS[0].name, t: 2.4 },
      naechsteId: 1,
    };
  }

  const masse = (bild) => ({ w: bild[0].length, h: bild.length });
  const ueberlappt = (ax, ay, aw, ah, bx, by, bw, bh) =>
    Math.abs(ax - bx) * 2 < aw + bw && Math.abs(ay - by) * 2 < ah + bh;
  const klemme = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const gueltig = (alt) =>
    !!alt && typeof alt.punkte === 'number' && typeof alt.level === 'number' && alt.level >= 1 &&
    !!alt.schiff && typeof alt.schiff.x === 'number' && typeof alt.schiff.y === 'number' &&
    ['plan', 'schuesse', 'geschosse', 'gegner', 'extras', 'raketen', 'knall'].every((k) => Array.isArray(alt[k])) &&
    !!alt.spezial && !!SPEZIAL_NAME[alt.spezial.art] &&
    (alt.boss == null || !!BOSSE[alt.boss.typ]) &&
    alt.gegner.every((g) => !!ARTEN[g.art]) &&
    alt.zustand !== 'vorbei';

  /* Ein Pixelbild als ein einziger Pfad: einzeln gefüllte Rechtecke hätten bei
     krummer Vergrößerung feine Fugen. */
  function pfad(zeilen) {
    const p = new Path2D();
    for (let y = 0; y < zeilen.length; y += 1) {
      const z = zeilen[y];
      let x = 0;
      while (x < z.length) {
        if (z[x] !== '#') { x += 1; continue; }
        let e = x;
        while (e < z.length && z[e] === '#') e += 1;
        p.rect(x, y, e - x, 1);
        x = e;
      }
    }
    return p;
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();

    // Eingaben leben nicht im Stand: Nach einer Pause hält niemand mehr eine Taste.
    let links = false;
    let rechts = false;
    let hoch = false;
    let runter = false;
    let feuer = false;
    let feuerWunsch = false;
    let spezialWunsch = false;
    let zugX = 0;
    let zugY = 0;

    function laden() {
      const alt = s.erinnert();
      if (!gueltig(alt)) return frisch();
      if (alt.zustand === 'laeuft') alt.zustand = 'pause';
      return alt;
    }

    const sichern = () => s.merken(stand);
    const bestwert = () => s.partien().reduce((h, p) => Math.max(h, Echtzeit.zahl(p.punkte)), 0);

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const flaeche = el('div', 'ez-flaeche im-flaeche');
    const feld = el('div', 'im-kasten');
    const leiste = el('div', 'im-steuer');
    const steuer = el('div', 'ez-steuer', 'Ziehen lenkt · Berühren feuert');
    const spezialKnopf = el('button', 'knopf knopf--still im-spezial');
    spezialKnopf.type = 'button';
    spezialKnopf.tabIndex = -1;
    leiste.append(steuer, spezialKnopf);
    const unten = el('div', 'ez-unten');
    flaeche.append(feld, leiste);
    wurzel.append(kopf, flaeche, unten);

    // Vor der Bühne: Die malt schon beim Anlegen das erste Bild.
    const bilder = {
      schiff: pfad(SCHIFF),
      knall: pfad(KNALL),
      arten: Object.fromEntries(Object.entries(ARTEN).map(([k, a]) => [k, a.bilder.map(pfad)])),
      bosse: Object.fromEntries(Object.entries(BOSSE).map(([k, d]) => [k, d.bilder.map(pfad)])),
      extras: Object.fromEntries(Object.entries(EXTRA_BILD).map(([k, z]) => [k, pfad(z)])),
    };

    const b = Echtzeit.buehne(feld, { breite: B, hoehe: H, schritt, zeichnen, beiHalt });

    s.werkzeuge([
      { label: 'Pause', symbol: Echtzeit.SYMBOL.pause, tun: pauseUmschalten },
      { label: 'Anleitung', symbol: Echtzeit.SYMBOL.anleitung, tun: anleitung },
    ]);

    /* ------------------------------------------------------------ Ablauf */

    function weiter() {
      if (stand.zustand !== 'bereit' && stand.zustand !== 'pause') return;
      stand.zustand = 'laeuft';
      zugX = zugY = 0;
      anzeigen();
      b.los();
    }

    function pauseUmschalten() {
      if (b.laeuft) b.halt();
      else if (stand.zustand === 'pause') weiter();
    }

    function beiHalt() {
      if (stand.zustand === 'laeuft') stand.zustand = 'pause';
      links = rechts = hoch = runter = feuer = feuerWunsch = spezialWunsch = false;
      griff = null;
      zugX = zugY = 0;
      anzeigen();
      sichern();
    }

    function punkteDazu(st, n) {
      st.punkte += n;
      kopfZeichnen();
    }

    /** Oberkante und Unterkante des freien Raums an der Bildschirmstelle x. */
    function korridor(st, x) {
      const w = WELTEN[levelDaten(st.level).welt];
      const wx = st.weg + x;
      const f = gelaendeFaktor(st);
      return [w.decke(wx) * f, H - w.boden(wx) * f];
    }

    /* Zu Beginn eines Levels wächst das Gelände in zwei Sekunden hoch. Sonst
       stünde das Schiff beim Wechsel in die Höhle plötzlich in der Decke. */
    const gelaendeFaktor = (st) => (st.phase === 'flug' ? Math.min(1, st.levelZeit / 2) : 1);

    function imGelaende(st, x, y) {
      const [o, u] = korridor(st, x);
      return y < o || y > u;
    }

    function levelBeginnen(st, level) {
      st.level = level;
      st.plan = planen(level);
      st.levelZeit = 0;
      st.phase = 'flug';
      st.boss = null;
      st.ansage = { text: 'Level ' + level, unter: levelDaten(level).name, t: 2.4 };
      kopfZeichnen();
    }

    function schritt(dt) {
      const st = stand;
      st.zeit += dt;
      for (const k of st.knall) k.t -= dt;
      st.knall = st.knall.filter((k) => k.t > 0);
      if (st.ansage) {
        st.ansage.t -= dt;
        if (st.ansage.t <= 0) st.ansage = null;
      }

      // Das letzte Leben ist weg: Der Knall steht noch kurz, dann ist Schluss.
      if (st.getroffen > 0) {
        st.getroffen -= dt;
        if (st.getroffen <= 0) vorbei();
        return;
      }

      const k = tempoVon(st.level);
      st.weg += ROLLEN * dt;
      if (st.schutz > 0) st.schutz -= dt;
      st.feuerUhr -= dt;
      st.spezialUhr -= dt;

      schiffZiehen(st, dt);

      if ((feuer || feuerWunsch) && st.feuerUhr <= 0 && st.schuesse.length < SCHUSS_MAX) {
        st.schuesse.push({ x: st.schiff.x + 6, y: st.schiff.y });
        st.feuerUhr = SCHUSS_TAKT;
        feuerWunsch = false;
      }
      if (spezialWunsch) {
        spezialWunsch = false;
        spezialZuenden(st);
      }

      if (st.phase === 'flug') {
        st.levelZeit += dt;
        while (st.plan.length && st.plan[0].t <= st.levelZeit) erscheinen(st, st.plan.shift());
        const L = levelDaten(st.level);
        // Der Endgegner kommt, wenn die Staffeln durch sind – spätestens acht
        // Sekunden danach, auch wenn noch ein Nachzügler im Feld treibt.
        if (!st.plan.length && st.levelZeit >= L.dauer && (!st.gegner.length || st.levelZeit >= L.dauer + 8)) {
          bossBauen(st);
        }
      } else if (st.phase === 'sieg') {
        st.siegUhr -= dt;
        if (st.boss && Math.random() < dt * 9) {
          const { w, h } = masse(BOSSE[st.boss.typ].bilder[0]);
          st.knall.push({ x: st.boss.x + (Math.random() - 0.5) * w, y: st.boss.y + (Math.random() - 0.5) * h, t: 0.35, art: 'gross' });
        }
        if (st.siegUhr <= 0) levelBeginnen(st, st.level + 1);
      }

      gegnerZiehen(st, dt, k);
      if (st.boss && st.phase !== 'sieg') bossZiehen(st, dt, k);
      schuesseZiehen(st, dt);
      raketenZiehen(st, dt);
      strahlUndWand(st, dt);
      geschosseZiehen(st, dt);
      extrasZiehen(st, dt);
      zusammenstoesse(st);

      st.schuesse = st.schuesse.filter((x) => !x.weg);
      st.geschosse = st.geschosse.filter((x) => !x.weg);
      st.gegner = st.gegner.filter((x) => !x.weg);
      st.extras = st.extras.filter((x) => !x.weg);
      st.raketen = st.raketen.filter((x) => !x.weg);
    }

    function schiffZiehen(st, dt) {
      const sch = st.schiff;
      const ax = (rechts ? 1 : 0) - (links ? 1 : 0);
      const ay = (runter ? 1 : 0) - (hoch ? 1 : 0);
      sch.x = klemme(sch.x + ax * SCHIFF_TEMPO * dt + zugX, 6, B - 8);
      const vorher = sch.y;
      let y = klemme(sch.y + ay * SCHIFF_TEMPO * dt + zugY, 4, H - 4);
      zugX = zugY = 0;

      let o = 0;
      let u = H;
      // Ein Stück vor den Bug geschaut: Eine Hauswand, die von rechts kommt,
      // hebt das Schiff, bevor sie es erreicht.
      for (const dx of [-5, 0, 5, 9]) {
        const [oo, uu] = korridor(st, sch.x + dx);
        o = Math.max(o, oo);
        u = Math.min(u, uu);
      }
      // Die eigene Eingabe führt nicht ins Gelände hinein; wo das Gelände
      // selbst heranrückt, schiebt es das Schiff zügig, aber ohne Sprung weg.
      const lo = o + 4;
      const hi = u - 4;
      if (y < lo) y = Math.min(lo, Math.max(y, Math.min(vorher, lo)) + SCHIEBEN * dt);
      if (y > hi) y = Math.max(hi, Math.min(y, Math.max(vorher, hi)) - SCHIEBEN * dt);
      sch.y = y;
    }

    function erscheinen(st, e) {
      if (e.art === 'extra') {
        st.extras.push({ art: e.extra, x: B + 5, y: e.y, y0: e.y, t: 0 });
        return;
      }
      const a = ARTEN[e.art];
      st.gegner.push({
        id: st.naechsteId++,
        art: e.art,
        x: B + 6,
        y: e.y,
        y0: e.y,
        p: e.p,
        t: 0,
        hp: a.hp + umlaufVon(st.level) - 1,
        blink: 0,
        uhr: 0.7,
        halt: null,
        ziel: B * 0.6 + (e.p % 3) * 10,
        vy: e.art === 'brocken' ? (e.p % 2 ? 5 : -5) : 0,
      });
    }

    function zielschuss(st, x, y, tempo) {
      if (st.geschosse.length >= GESCHOSSE_MAX) return;
      const dx = st.schiff.x - x;
      const dy = st.schiff.y - y;
      const d = Math.hypot(dx, dy) || 1;
      const v = Math.min(80, tempo);
      st.geschosse.push({ x, y, vx: (dx / d) * v, vy: (dy / d) * v });
    }

    function winkelschuss(st, x, y, winkel, tempo) {
      if (st.geschosse.length >= GESCHOSSE_MAX) return;
      const v = Math.min(80, tempo);
      st.geschosse.push({ x, y, vx: Math.cos(winkel) * v, vy: Math.sin(winkel) * v });
    }

    function gegnerZiehen(st, dt, k) {
      for (const g of st.gegner) {
        const a = ARTEN[g.art];
        g.t += dt;
        if (g.blink > 0) g.blink -= dt;
        if (g.art === 'welle') {
          g.x -= a.tempo * k * dt;
          g.y = g.y0 + 11 * Math.sin(g.p * 0.8 + g.t * 3);
        } else if (g.art === 'jaeger') {
          g.x -= a.tempo * k * dt;
          g.y += klemme(st.schiff.y - g.y, -20 * k * dt, 20 * k * dt);
        } else if (g.art === 'schuetze') {
          // Fliegt ein, bleibt stehen und schießt, dann zieht er weiter.
          if (g.halt == null) {
            g.x -= a.tempo * k * dt;
            if (g.x <= g.ziel) g.halt = 0;
          } else if (g.halt < 3.5) {
            g.halt += dt;
            g.uhr -= dt;
            if (g.uhr <= 0) {
              g.uhr = 1.4 / k;
              zielschuss(st, g.x - 5, g.y, 60 * k);
            }
          } else {
            g.x -= 50 * k * dt;
          }
        } else if (g.art === 'brocken') {
          g.x -= a.tempo * k * dt;
          g.y += g.vy * dt;
        } else {
          g.x -= a.tempo * k * dt;
        }
        const { h } = masse(a.bilder[0]);
        const [o, u] = korridor(st, g.x);
        if (g.y < o + h / 2 + 1) { g.y = o + h / 2 + 1; g.vy = Math.abs(g.vy); }
        if (g.y > u - h / 2 - 1) { g.y = u - h / 2 - 1; g.vy = -Math.abs(g.vy); }
        if (g.x < -12) g.weg = true;
      }
    }

    function bossBauen(st) {
      const L = levelDaten(st.level);
      const d = BOSSE[L.boss];
      const { w } = masse(d.bilder[0]);
      const welt = WELTEN[L.welt];
      const hp = Math.round(d.hp * (1 + 0.3 * (umlaufVon(st.level) - 1)));
      st.phase = 'boss';
      st.boss = {
        typ: L.boss,
        x: B + w / 2 + 2,
        y: (welt.deckeMax + H - welt.bodenMax) / 2,
        hp,
        hpMax: hp,
        t: 0,
        rein: true,
        vy: d.tempo || 0,
        uhren: d.angriffe.map((_, i) => 1 + i * 0.7),
        blink: 0,
      };
      st.ansage = { text: 'Endgegner', t: 1.6 };
    }

    function bossZiehen(st, dt, k) {
      const bo = st.boss;
      const d = BOSSE[bo.typ];
      const { w, h } = masse(d.bilder[0]);
      const welt = WELTEN[levelDaten(st.level).welt];
      const o = welt.deckeMax + h / 2 + 1;
      const u = H - welt.bodenMax - h / 2 - 1;
      bo.t += dt;
      if (bo.blink > 0) bo.blink -= dt;
      if (bo.rein) {
        bo.x -= 20 * dt;
        if (bo.x <= B - w / 2 - 6) {
          bo.x = B - w / 2 - 6;
          bo.rein = false;
        }
      }
      if (d.bewegung === 'pendel') {
        bo.y += bo.vy * k * dt;
        if (bo.y < o) { bo.y = o; bo.vy = Math.abs(bo.vy); }
        if (bo.y > u) { bo.y = u; bo.vy = -Math.abs(bo.vy); }
      } else if (d.bewegung === 'sinus') {
        bo.y = (o + u) / 2 + ((u - o) / 2) * Math.sin(bo.t * 0.9 * k);
      } else {
        bo.y = klemme(bo.y + klemme(st.schiff.y - bo.y, -d.tempo * k * dt, d.tempo * k * dt), o, u);
      }
      if (bo.rein) return;
      d.angriffe.forEach(([art, alle], i) => {
        bo.uhren[i] -= dt;
        if (bo.uhren[i] > 0) return;
        bo.uhren[i] += alle / k;
        angriff(st, bo, art, w, k);
      });
    }

    function angriff(st, bo, art, w, k) {
      const vx = bo.x - w / 2;
      if (art === 'gezielt') {
        zielschuss(st, vx, bo.y, 64 * k);
      } else if (art === 'faecher3' || art === 'faecher5') {
        const n = art === 'faecher3' ? 3 : 5;
        for (let i = 0; i < n; i += 1) winkelschuss(st, vx, bo.y, Math.PI + (i - (n - 1) / 2) * 0.32, 55 * k);
      } else if (art === 'salve') {
        // Drei hintereinander auf derselben Bahn: Sie kommen nacheinander an.
        const dx = st.schiff.x - vx;
        const dy = st.schiff.y - bo.y;
        const dd = Math.hypot(dx, dy) || 1;
        for (let i = 0; i < 3; i += 1) {
          if (st.geschosse.length >= GESCHOSSE_MAX) break;
          const v = Math.min(80, 70 * k);
          st.geschosse.push({ x: vx - (dx / dd) * i * 7, y: bo.y - (dy / dd) * i * 7, vx: (dx / dd) * v, vy: (dy / dd) * v });
        }
      } else if (art === 'brut') {
        if (st.gegner.length >= 5) return;
        for (const dy of [-8, 8]) {
          erscheinen(st, { art: 'pfeil', y: bo.y + dy, p: 0 });
          st.gegner[st.gegner.length - 1].x = vx;
        }
      } else if (art === 'ring') {
        for (let i = 0; i < 10; i += 1) winkelschuss(st, bo.x, bo.y, (i / 10) * Math.PI * 2 + bo.t, 42 * k);
      }
    }

    function schaden(st, g, n) {
      if (g.weg) return;
      g.hp -= n;
      g.blink = 0.08;
      if (g.hp > 0) return;
      g.weg = true;
      st.knall.push({ x: g.x, y: g.y, t: 0.3, art: 'gross' });
      punkteDazu(st, ARTEN[g.art].punkte);
    }

    function bossSchaden(st, n) {
      const bo = st.boss;
      if (!bo || st.phase !== 'boss') return;
      bo.hp -= n;
      bo.blink = 0.08;
      if (bo.hp > 0) return;
      bo.hp = 0;
      st.phase = 'sieg';
      st.siegUhr = 1.8;
      st.geschosse = [];
      for (const g of st.gegner) {
        g.weg = true;
        st.knall.push({ x: g.x, y: g.y, t: 0.3, art: 'gross' });
      }
      st.strahl = null;
      st.ansage = { text: '+' + BOSS_PUNKTE * st.level, t: 1.6 };
      punkteDazu(st, BOSS_PUNKTE * st.level);
    }

    const bossKasten = (st) => {
      const { w, h } = masse(BOSSE[st.boss.typ].bilder[0]);
      return { w, h };
    };

    function schuesseZiehen(st, dt) {
      for (const sch of st.schuesse) {
        sch.x += SCHUSS_TEMPO * dt;
        if (sch.x > B + 4 || imGelaende(st, sch.x, sch.y)) { sch.weg = true; continue; }
        for (const g of st.gegner) {
          if (g.weg) continue;
          const { w, h } = masse(ARTEN[g.art].bilder[0]);
          if (ueberlappt(sch.x, sch.y, 4, 2, g.x, g.y, w - 1, h - 1)) {
            sch.weg = true;
            schaden(st, g, 1);
            break;
          }
        }
        if (sch.weg || !st.boss || st.phase !== 'boss') continue;
        // Für eigene Schüsse zählt der Endgegner eine Zeile höher und tiefer,
        // als er aussieht: Ein Streifschuss an einem pendelnden Ziel soll sitzen.
        const { w, h } = bossKasten(st);
        if (ueberlappt(sch.x, sch.y, 4, 2, st.boss.x, st.boss.y, w, h + 2)) {
          sch.weg = true;
          st.knall.push({ x: sch.x + 2, y: sch.y, t: 0.12, art: 'klein' });
          bossSchaden(st, 1);
        }
      }
    }

    function spezialZuenden(st) {
      const sp = st.spezial;
      if (sp.anzahl <= 0 || st.spezialUhr > 0 || st.phase === 'sieg') return;
      if (sp.art === 'strahl' && st.strahl) return;
      if (sp.art === 'wand' && st.wand) return;
      sp.anzahl -= 1;
      st.spezialUhr = 0.35;
      const { x, y } = st.schiff;
      if (sp.art === 'rakete') st.raketen.push({ x: x + 6, y, vx: 120, vy: 0, t: 0 });
      else if (sp.art === 'strahl') st.strahl = { t: 0.35, getroffen: [] };
      else st.wand = { x: x + 6, getroffen: [] };
      kopfZeichnen();
    }

    /** Nächstes Ziel vor der Rakete – ein Gegner oder der Endgegner. */
    function naechstesZiel(st, ra) {
      let best = null;
      let abstand = Infinity;
      const pruefe = (x, y) => {
        if (x < ra.x - 4 || x > B + 2) return;
        const d = Math.hypot(x - ra.x, y - ra.y);
        if (d < abstand) { abstand = d; best = { x, y }; }
      };
      for (const g of st.gegner) if (!g.weg) pruefe(g.x, g.y);
      if (st.boss && st.phase === 'boss') pruefe(st.boss.x, st.boss.y);
      return best;
    }

    function raketenZiehen(st, dt) {
      for (const ra of st.raketen) {
        ra.t += dt;
        const ziel = naechstesZiel(st, ra);
        if (ziel) {
          const ist = Math.atan2(ra.vy, ra.vx);
          let d = Math.atan2(ziel.y - ra.y, ziel.x - ra.x) - ist;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          const neu = ist + klemme(d, -5 * dt, 5 * dt);
          ra.vx = Math.cos(neu) * 120;
          ra.vy = Math.sin(neu) * 120;
        }
        ra.x += ra.vx * dt;
        ra.y += ra.vy * dt;
        if (ra.t > 3 || ra.x > B + 6 || ra.x < -6 || ra.y < -6 || ra.y > H + 6) { ra.weg = true; continue; }
        for (const g of st.gegner) {
          if (g.weg) continue;
          const { w, h } = masse(ARTEN[g.art].bilder[0]);
          if (ueberlappt(ra.x, ra.y, 4, 2, g.x, g.y, w, h)) {
            ra.weg = true;
            schaden(st, g, 5);
            break;
          }
        }
        if (ra.weg || !st.boss || st.phase !== 'boss') continue;
        const { w, h } = bossKasten(st);
        if (ueberlappt(ra.x, ra.y, 4, 2, st.boss.x, st.boss.y, w - 2, h - 2)) {
          ra.weg = true;
          st.knall.push({ x: ra.x, y: ra.y, t: 0.3, art: 'gross' });
          bossSchaden(st, 5);
        }
      }
    }

    function strahlUndWand(st, dt) {
      const bo = st.boss && st.phase === 'boss' ? st.boss : null;
      if (st.strahl) {
        // Der Strahl hängt am Schiff und trifft jeden in seiner Zeile einmal.
        const sl = st.strahl;
        sl.t -= dt;
        const x0 = st.schiff.x + 6;
        const y = st.schiff.y;
        for (const g of st.gegner) {
          const { w, h } = masse(ARTEN[g.art].bilder[0]);
          if (!g.weg && g.x + w / 2 > x0 && Math.abs(g.y - y) < h / 2 + 1.5 && !sl.getroffen.includes(g.id)) {
            sl.getroffen.push(g.id);
            schaden(st, g, 6);
          }
        }
        if (bo && !sl.getroffen.includes('boss')) {
          const { w, h } = bossKasten(st);
          if (bo.x + w / 2 > x0 && Math.abs(bo.y - y) < h / 2 + 1.5) {
            sl.getroffen.push('boss');
            bossSchaden(st, 6);
          }
        }
        for (const ge of st.geschosse) if (ge.x > x0 && Math.abs(ge.y - y) < 2.5) ge.weg = true;
        if (sl.t <= 0) st.strahl = null;
      }
      if (st.wand) {
        // Die Wand fegt über das ganze Feld und trifft jeden, den sie überstreicht, einmal.
        const wa = st.wand;
        wa.x += 120 * dt;
        for (const g of st.gegner) {
          const { w } = masse(ARTEN[g.art].bilder[0]);
          if (!g.weg && Math.abs(g.x - wa.x) < w / 2 + 1.5 && !wa.getroffen.includes(g.id)) {
            wa.getroffen.push(g.id);
            schaden(st, g, 8);
          }
        }
        if (bo && !wa.getroffen.includes('boss') && Math.abs(bo.x - wa.x) < bossKasten(st).w / 2 + 1.5) {
          wa.getroffen.push('boss');
          bossSchaden(st, 8);
        }
        for (const ge of st.geschosse) if (Math.abs(ge.x - wa.x) < 2.5) ge.weg = true;
        if (wa.x > B + 4) st.wand = null;
      }
    }

    function geschosseZiehen(st, dt) {
      for (const ge of st.geschosse) {
        ge.x += ge.vx * dt;
        ge.y += ge.vy * dt;
        if (ge.x < -3 || ge.x > B + 3 || ge.y < -3 || ge.y > H + 3 || imGelaende(st, ge.x, ge.y)) ge.weg = true;
      }
    }

    function extrasZiehen(st, dt) {
      for (const e of st.extras) {
        e.t += dt;
        e.x -= ROLLEN * dt;
        e.y = e.y0 + 3 * Math.sin(e.t * 3);
        if (e.x < -8) e.weg = true;
      }
    }

    function einsammeln(st, e) {
      e.weg = true;
      if (e.art === 'leben') {
        st.leben = Math.min(LEBEN_MAX, st.leben + 1);
        st.ansage = { text: '+1 Leben', t: 1.2 };
      } else {
        const sp = st.spezial;
        // Dieselbe Waffe füllt auf, eine andere tauscht – wie damals.
        if (sp.art === e.art) sp.anzahl = Math.min(SPEZIAL_MAX, sp.anzahl + SPEZIAL_PACK);
        else st.spezial = { art: e.art, anzahl: SPEZIAL_PACK };
        st.ansage = { text: SPEZIAL_NAME[e.art], unter: st.spezial.anzahl + ' Schuss', t: 1.2 };
      }
      kopfZeichnen();
    }

    function zusammenstoesse(st) {
      const sch = st.schiff;
      for (const e of st.extras) {
        if (!e.weg && ueberlappt(sch.x, sch.y, 11, 7, e.x, e.y, 7, 7)) einsammeln(st, e);
      }
      if (st.schutz > 0) return;
      for (const ge of st.geschosse) {
        if (!ge.weg && ueberlappt(sch.x, sch.y, 8, 4, ge.x, ge.y, 2, 2)) { ge.weg = true; treffer(st); return; }
      }
      for (const g of st.gegner) {
        if (g.weg) continue;
        const { w, h } = masse(ARTEN[g.art].bilder[0]);
        if (ueberlappt(sch.x, sch.y, 9, 5, g.x, g.y, w - 2, h - 2)) {
          g.weg = true;
          st.knall.push({ x: g.x, y: g.y, t: 0.3, art: 'gross' });
          treffer(st);
          return;
        }
      }
      if (st.boss && st.phase === 'boss') {
        const { w, h } = bossKasten(st);
        if (ueberlappt(sch.x, sch.y, 9, 5, st.boss.x, st.boss.y, w - 4, h - 4)) treffer(st);
      }
    }

    function treffer(st) {
      st.leben -= 1;
      st.knall.push({ x: st.schiff.x, y: st.schiff.y, t: 0.5, art: 'schiff' });
      // Alle feindlichen Schüsse verschwinden: Sonst trifft der nächste, bevor
      // man das Blinken überhaupt gesehen hat.
      st.geschosse = [];
      if (st.leben <= 0) {
        st.leben = 0;
        st.getroffen = 1.2;
        st.strahl = null;
      } else {
        st.schutz = SCHUTZ;
      }
      kopfZeichnen();
    }

    function vorbei() {
      stand.zustand = 'vorbei';
      s.notieren({
        punkte: stand.punkte,
        level: stand.level,
        dauer: Math.round(stand.zeit * 1000),
      });
      b.halt();
    }

    function neu() {
      stand = frisch();
      anzeigen();
      sichern();
      b.malen();
    }

    /* ----------------------------------------------------------- Anzeige */

    function kopfZeichnen() {
      kopf.replaceChildren();
      const p = el('span');
      p.append(el('b', null, String(stand.punkte)), document.createTextNode(' Punkte'));
      kopf.append(p, el('span', null, 'Level ' + stand.level), el('span', null, Math.max(0, stand.leben) + ' Leben'));
      const best = bestwert();
      s.unter(best ? 'Bestwert ' + best : '');

      const sp = stand.spezial;
      spezialKnopf.replaceChildren(el('span', 'im-spezial-name', SPEZIAL_NAME[sp.art]), el('b', null, String(sp.anzahl)));
      spezialKnopf.classList.toggle('im-spezial--leer', sp.anzahl <= 0);
      spezialKnopf.setAttribute('aria-label', 'Spezialwaffe ' + SPEZIAL_NAME[sp.art] + ', ' + sp.anzahl + ' übrig');
    }

    function anzeigen() {
      kopfZeichnen();
      const z = stand.zustand;
      leiste.hidden = z === 'pause' || z === 'vorbei';
      unten.replaceChildren();
      if (z === 'bereit') {
        b.schild('Tippen zum Starten', 'Ziehen lenkt, solange der Finger liegt, wird geschossen. Am Rechner: Pfeile, Leertaste, X.');
      } else if (z === 'pause') {
        b.schild('Pause', 'Tippen, um weiterzufliegen.');
        unten.append(Echtzeit.kasten('Pause', stand.punkte + ' Punkte in Level ' + stand.level + '.', [
          { text: 'Weiter', tun: weiter },
          { text: 'Neu anfangen', art: 'still', tun: neu },
        ]));
      } else if (z === 'vorbei') {
        b.schild('Abgeschossen.');
        const best = bestwert();
        unten.append(Echtzeit.kasten('Abgeschossen.',
          stand.punkte + ' Punkte, Level ' + stand.level + ', ' + s.dauerText(Math.round(stand.zeit * 1000)) + '.' +
          (stand.punkte > 0 && stand.punkte >= best ? ' Das ist dein Bestwert.' : ''),
          [{ text: 'Nochmal', tun: neu }]));
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
    }

    function malBild(ctx, p, x, y) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fill(p);
      ctx.restore();
    }

    function zeichnen(ctx, f) {
      const st = stand;
      const welt = WELTEN[levelDaten(st.level).welt];
      ctx.fillStyle = f.karte;
      ctx.fillRect(0, 0, B, H);

      // Sterne in drei Tiefen: Die fernen ziehen langsamer.
      ctx.fillStyle = f.tinteStill;
      for (let i = 0; i < 36; i += 1) {
        const tiefe = 0.15 + hash(i + 50) * 0.5;
        const x = rest(hash(i) * (B + 2) - st.weg * tiefe, B + 2) - 1;
        ctx.globalAlpha = 0.3 + tiefe;
        ctx.fillRect(x, Math.floor(hash(i + 9) * H), 1, 1);
      }
      ctx.globalAlpha = 1;

      if (welt.bodenMax || welt.deckeMax) {
        // Ein Pfad für das ganze Gelände – Spalten einzeln gefüllt hätten Fugen.
        const ganz = Math.floor(st.weg);
        const bruch = st.weg - ganz;
        const faktor = gelaendeFaktor(st);
        ctx.fillStyle = f.grau;
        ctx.beginPath();
        for (let x = -1; x <= B; x += 1) {
          const wx = ganz + x;
          const bo = welt.boden(wx) * faktor;
          const de = welt.decke(wx) * faktor;
          if (bo > 0) ctx.rect(x - bruch, H - bo, 1.02, bo);
          if (de > 0) ctx.rect(x - bruch, 0, 1.02, de);
        }
        ctx.fill();
      }

      for (const e of st.extras) {
        ctx.fillStyle = f.gelb;
        Echtzeit.rund(ctx, e.x - 3.5, e.y - 3.5, 7, 7, 1.5);
        ctx.fill();
        ctx.fillStyle = '#1B1815';
        malBild(ctx, bilder.extras[e.art], Math.round(e.x) - 2.5, Math.round(e.y) - 2.5);
      }

      for (const g of st.gegner) {
        const a = ARTEN[g.art];
        const bildNr = a.bilder.length > 1 ? Math.floor(g.t * 4) % a.bilder.length : 0;
        const { w, h } = masse(a.bilder[0]);
        ctx.fillStyle = g.blink > 0 ? f.rost : f.tinte;
        malBild(ctx, bilder.arten[g.art][bildNr], Math.round(g.x - w / 2), Math.round(g.y - h / 2));
      }

      if (st.boss) {
        const bo = st.boss;
        const d = BOSSE[bo.typ];
        const { w, h } = masse(d.bilder[0]);
        const bildNr = d.bilder.length > 1 ? Math.floor(bo.t * 3) % d.bilder.length : 0;
        ctx.fillStyle = bo.blink > 0 || st.phase === 'sieg' ? f.rost : f.tinte;
        if (st.phase !== 'sieg' || Math.floor(st.siegUhr * 12) % 2) {
          malBild(ctx, bilder.bosse[bo.typ][bildNr], Math.round(bo.x - w / 2), Math.round(bo.y - h / 2));
        }
        if (st.phase === 'boss') {
          ctx.fillStyle = f.karteRand;
          ctx.fillRect(44, 3, 80, 2);
          ctx.fillStyle = f.rost;
          ctx.fillRect(44, 3, (80 * bo.hp) / bo.hpMax, 2);
        }
      }

      if (st.wand) {
        ctx.fillStyle = f.gruen;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(st.wand.x - 1, 0, 2, H);
        ctx.globalAlpha = 1;
      }

      const sch = st.schiff;
      if (st.getroffen <= 0 && st.zustand !== 'vorbei') {
        if (st.strahl) {
          ctx.fillStyle = f.gruen;
          ctx.globalAlpha = 0.6 + 0.4 * (Math.floor(st.strahl.t * 30) % 2);
          ctx.fillRect(sch.x + 6, sch.y - 1, B, 2);
          ctx.globalAlpha = 1;
        }
        // Blinken während des Schutzes, damit man sieht, dass er gilt.
        if (st.schutz <= 0 || Math.floor(st.schutz * 10) % 2) {
          ctx.fillStyle = f.gruen;
          malBild(ctx, bilder.schiff, Math.round(sch.x - 5.5), Math.round(sch.y - 3.5));
        }
      }

      ctx.fillStyle = f.tinte;
      for (const s_ of st.schuesse) ctx.fillRect(s_.x - 1.5, s_.y - 0.5, 3, 1);
      for (const ra of st.raketen) {
        ctx.save();
        ctx.translate(ra.x, ra.y);
        ctx.rotate(Math.atan2(ra.vy, ra.vx));
        ctx.fillStyle = f.tinte;
        ctx.fillRect(-2, -1, 4, 2);
        ctx.fillStyle = f.rost;
        ctx.fillRect(-3.5, -0.5, 1.5, 1);
        ctx.restore();
      }
      ctx.fillStyle = f.rost;
      for (const ge of st.geschosse) ctx.fillRect(ge.x - 1, ge.y - 1, 2, 2);

      for (const k of st.knall) {
        ctx.fillStyle = f.rost;
        if (k.art === 'klein') {
          ctx.fillRect(k.x - 1.5, k.y - 0.5, 3, 1);
          ctx.fillRect(k.x - 0.5, k.y - 1.5, 1, 3);
        } else {
          malBild(ctx, bilder.knall, Math.round(k.x - 5.5), Math.round(k.y - 3.5));
        }
      }

      // Nur im Lauf: Vor dem Start und in der Pause liegt das Schild darüber.
      if (st.ansage && st.zustand === 'laeuft') {
        ctx.fillStyle = f.tinte;
        ctx.textAlign = 'center';
        ctx.font = '800 12px "Bricolage Grotesque", system-ui, sans-serif';
        ctx.fillText(st.ansage.text, B / 2, st.ansage.unter ? 44 : 50);
        if (st.ansage.unter) {
          ctx.fillStyle = f.tinteStill;
          ctx.font = '500 7px "DM Mono", ui-monospace, monospace';
          ctx.fillText(st.ansage.unter, B / 2, 55);
        }
      }
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Leg den Finger aufs Feld oder auf die Leiste darunter und zieh – das Schiff folgt der Bewegung, nach oben, unten und zur Seite. Solange der Finger liegt, schießt es. Am Rechner: Pfeiltasten oder WASD, Leertaste schießt.'));
      d.append(el('p', 'notiz', 'Der Knopf rechts neben der Leiste zündet die Spezialwaffe, am Rechner X oder K. Rakete sucht sich ihr Ziel, Strahl trifft die ganze Zeile, Wand fegt über das Feld und schluckt feindliche Schüsse. Die Zahl sagt, wie viele du noch hast.'));
      d.append(el('p', 'notiz', 'Gelbe Kästchen einsammeln: dieselbe Waffe füllt um drei auf, eine andere tauscht sie aus. Das Herz bringt ein Leben.'));
      d.append(el('p', 'notiz', 'Am Ende jedes Levels kommt ein Endgegner; der Balken oben zeigt, wie viel er noch aushält. Nach dem sechsten Level geht es von vorn los, schneller. Berge und Höhlenwände schieben dich nur weg – Schüsse, Gegner und der Endgegner selbst kosten ein Leben.'));
      s.blatt({ titel: 'Sternjäger', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* ---------------------------------------------------------- Steuerung */

    let griff = null;
    b.an(flaeche, 'pointerdown', (e) => {
      if (stand.zustand === 'vorbei' || griff) return;
      e.preventDefault();
      griff = { id: e.pointerId, x: e.clientX, y: e.clientY };
      try { flaeche.setPointerCapture(e.pointerId); } catch { /* synthetisch */ }
      feuer = true;
      feuerWunsch = true;
      weiter();
    });
    b.an(flaeche, 'pointermove', (e) => {
      if (!griff || e.pointerId !== griff.id) return;
      if (b.laeuft) {
        zugX += (e.clientX - griff.x) / b.masstab;
        zugY += (e.clientY - griff.y) / b.masstab;
      }
      griff.x = e.clientX;
      griff.y = e.clientY;
    });
    const loslassen = (e) => {
      if (!griff || e.pointerId !== griff.id) return;
      griff = null;
      feuer = false;
    };
    b.an(flaeche, 'pointerup', loslassen);
    b.an(flaeche, 'pointercancel', loslassen);

    // Der Knopf gehört nicht zum Lenken: Ein zweiter Finger darf ihn tippen,
    // während der erste weiter zieht.
    b.an(spezialKnopf, 'pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (stand.zustand === 'vorbei') return;
      spezialWunsch = true;
      weiter();
    });

    const tasteVon = (e) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    b.an(window, 'keydown', (e) => {
      if (!Echtzeit.tasteZaehlt(e)) return;
      const k = tasteVon(e);
      const lenken = { ArrowLeft: 'l', a: 'l', ArrowRight: 'r', d: 'r', ArrowUp: 'o', w: 'o', ArrowDown: 'u', s: 'u' }[k];
      if (lenken) {
        e.preventDefault();
        if (lenken === 'l') links = true;
        else if (lenken === 'r') rechts = true;
        else if (lenken === 'o') hoch = true;
        else runter = true;
        weiter();
      } else if (k === ' ' && !Echtzeit.knopfHatFokus(e)) {
        e.preventDefault();
        if (!e.repeat) feuerWunsch = true;
        feuer = true;
        weiter();
      } else if (k === 'x' || k === 'k') {
        e.preventDefault();
        if (!e.repeat) spezialWunsch = true;
        weiter();
      } else if (k === 'p' || k === 'Escape') {
        pauseUmschalten();
      }
    });
    b.an(window, 'keyup', (e) => {
      const k = tasteVon(e);
      if (k === 'ArrowLeft' || k === 'a') links = false;
      else if (k === 'ArrowRight' || k === 'd') rechts = false;
      else if (k === 'ArrowUp' || k === 'w') hoch = false;
      else if (k === 'ArrowDown' || k === 's') runter = false;
      else if (k === ' ') feuer = false;
    });

    anzeigen();

    return {
      ende: () => {
        b.ende();
        sichern();
      },
    };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien) {
    const z = Echtzeit.zahl;
    const best = partien.reduce((h, p) => Math.max(h, z(p.punkte)), 0);
    const level = partien.reduce((h, p) => Math.max(h, z(p.level)), 0);
    const schnitt = partien.length ? Math.round(partien.reduce((sum, p) => sum + z(p.punkte), 0) / partien.length) : 0;
    return [
      { wert: String(best), label: 'Bestwert' },
      { wert: String(level), label: 'höchstes Level' },
      { wert: String(schnitt), label: 'Punkte im Schnitt' },
    ];
  }

  Rahmen.anmelden({
    id: 'impact',
    name: 'Sternjäger',
    gruppe: 'geschick',
    unter: 'Durch die Welten, bis zum Endgegner.',
    farbe: '#3D4F7C',
    symbol: '<path d="M3 7l4 2 9 3-9 3-4 2 2-5z" stroke-linejoin="round"/><path d="M18 12h3M16 6.5h2M16 17.5h2" stroke-linecap="round"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
