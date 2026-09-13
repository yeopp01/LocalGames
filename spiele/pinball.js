/* Flipper – ein Tisch im Weltraum, wie der alte unter Windows.

   Vorbild ist „3D Pinball: Space Cadet": Feder rechts, drei Bahnen oben, die
   die Angriffsbumper aufwerten, eine Startrampe, die Missionen annimmt und
   volltankt, Treibstoff, der während einer Mission ausgeht, drei Wurmlöcher
   in Rot, Grün und Gelb, ein Schwarzes Loch, ein Umlauf für den Hyperraum,
   Warnziele für den Rückstoß und neun Ränge vom Kadetten zum
   Flottenadmiral. Nachgebaut sind die Regeln und das Gefühl, nicht das Bild:
   Tisch, Zahlen und Klänge sind eigen.

   Physik: Die Kugel ist ein Kreis, der Tisch besteht aus Strecken, Kreisen
   und zwei Flippern als Kapseln, die sich drehen. Echtzeit taktet mit
   1/120 s; ein Flipper schlägt aber mit 700 Einheiten je Sekunde, und die
   Kugel ist nur 8 breit. Jeder Takt wird deshalb in so viele Unterschritte
   geteilt, dass sich weder Kugel noch Flipperspitze mehr als 1,5 Einheiten
   bewegen – sonst schlüge ein Flipper durch die Kugel hindurch.

   Rampe und Löcher rechnen nicht mit: Auf der Rampe fährt die Kugel eine
   feste Bahn ab, im Loch wartet sie. Beides wäre in 2D sonst eine zweite
   Ebene, und dort bleibt eine Kugel gern hängen. */

(() => {
  const B = 200;
  const H = 360;
  const TISCH_H = 340;          // darunter die Anzeige
  const R = 4;
  const SCHWERE = 480;
  const V_MAX = 950;

  const KL_LAENGE = 28;
  const KL_R_ACHSE = 5;
  const KL_R_SPITZE = 2.5;
  const RUHE = 0.52;             // Winkel unter der Waagrechten, im Bogenmaß
  const OBEN = -0.49;
  const KL_HOCH = 26;            // rad/s
  const KL_RUNTER = 16;
  const KLAPPEN = [{ x: 62, y: 292, s: 1 }, { x: 126, y: 292, s: -1 }];

  const FEDER_X = 189;
  const FEDER_Y = 322;
  const FEDER_WEG = 12;
  const FEDER_ZEIT = 0.8;        // so lange, bis sie ganz gespannt ist
  const V_FEDER_MIN = 260;
  const V_FEDER_MAX = 800;

  const RETTUNG_S = 10;
  const TANK = 6;
  const TANK_S = 9;              // ein Licht Treibstoff je so viele Sekunden Mission
  const MISSIONEN_JE_RANG = 2;

  const BAHN_X = [126, 142, 158, 174];
  const BAHN_Y = 68;
  const BUMPER = [{ x: 134, y: 100 }, { x: 162, y: 104 }, { x: 148, y: 126 }];
  const BUMPER_R = 8;
  const STUFEN = ['#3E7BFA', '#3FBF5F', '#F2C230', '#E5484D'];

  /* Drei Wurmlöcher und das Schwarze Loch. `aus` ist die Richtung, in die ein
     Loch die Kugel wieder ausspuckt – immer weg von Wand und Abfluss. */
  const LOECHER = [
    { titel: 'Rotes', x: 116, y: 120, farbe: '#E5484D', aus: [-0.4, 0.92] },
    { titel: 'Grünes', x: 64, y: 74, farbe: '#46C46A', aus: [0.5, 0.87] },
    { titel: 'Gelbes', x: 136, y: 206, farbe: '#F2C230', aus: [-0.45, 0.89] },
    { titel: 'Schwarzes', x: 34, y: 100, farbe: '#9B6BFF', aus: [0.15, 0.99] },
  ];
  const LOCH_FANG = 5.5;
  const SCHWARZ = 3;

  const RAMPE = { x: 51, y: 122, dx: -0.351, dy: -0.936, tempo: 280 };
  const RAMPE_PFAD = [[51, 122], [50, 100], [46, 80], [38, 62], [26, 58], [16, 70], [13, 100],
    [13, 150], [16, 180], [22, 205], [25, 222]];

  const RAENGE = ['Kadett', 'Fähnrich', 'Leutnant', 'Kapitän', 'Korvettenkapitän', 'Kommandant',
    'Kommodore', 'Admiral', 'Flottenadmiral'];

  const MISSIONEN = [
    { name: 'Zielübung', schritte: [{ art: 'bumper', n: 8 }] },
    { name: 'Aufklärung', schritte: [{ art: 'bahn', n: 3 }] },
    { name: 'Hyperraum', schritte: [{ art: 'umlauf', n: 2 }] },
    { name: 'Bergung', schritte: [{ art: 'warn', n: 3 }] },
    { name: 'Schwarzes Loch', schritte: [{ art: 'loch', n: 1 }, { art: 'rampe', n: 1 }] },
    { name: 'Wurmlochflug', schritte: [{ art: 'wurm', n: 2 }] },
    { name: 'Nachschub', schritte: [{ art: 'rampe', n: 2 }] },
    { name: 'Sternensturm', schritte: [{ art: 'bumper', n: 15 }, { art: 'umlauf', n: 1 }] },
  ];
  const EINHEIT = {
    bumper: ['Bumper', 'Bumper'],
    bahn: ['Bahn', 'Bahnen'],
    umlauf: ['Umlauf', 'Umläufe'],
    warn: ['Warnziel', 'Warnziele'],
    loch: ['Schwarzes Loch', 'Schwarze Löcher'],
    wurm: ['Wurmloch', 'Wurmlöcher'],
    rampe: ['Rampe', 'Rampen'],
  };

  /** Wie viel ein Schritt verlangt – ab Kapitän etwas mehr, einzelne Treffer bleiben einzeln. */
  const verlangt = (schritt, rang) =>
    schritt.n > 1 ? schritt.n + Math.floor(rang / 3) * Math.ceil(schritt.n / 4) : schritt.n;

  const zahlText = (n) => Math.round(n).toLocaleString('de-DE');
  const blinkt = (st, hz = 3) => Math.floor(st.zeit * hz * 2) % 2 === 0;

  /* Fester Sternenhimmel: jedes Bild dieselben Sterne, auf jedem Gerät. Hier
     oben und nicht in starten(), weil die Bühne schon beim Aufbau einmal
     malt. */
  const STERNE = (() => {
    let z = 7;
    const zufall = () => ((z = (z * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 80 }, () => ({ x: zufall() * B, y: zufall() * TISCH_H, r: 0.3 + zufall() * 0.7, a: 0.3 + zufall() * 0.6 }));
  })();

  /* ------------------------------------------------------------------ Tisch */

  function bogen(cx, cy, r, von, bis, n) {
    const p = [];
    for (let i = 0; i <= n; i += 1) {
      const w = ((von + ((bis - von) * i) / Math.max(1, n)) * Math.PI) / 180;
      p.push([cx + r * Math.cos(w), cy + r * Math.sin(w)]);
    }
    return p;
  }

  const TISCH = (() => {
    const waende = [];
    const seg = (a, b, o = {}) => {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      waende.push({ ax: a[0], ay: a[1], bx: b[0], by: b[1], dx, dy, l2: dx * dx + dy * dy, e: 0.4, stil: 'innen', ...o });
    };
    const zug = (p, o) => { for (let i = 1; i < p.length; i += 1) seg(p[i - 1], p[i], o); };

    // Außenwand: links mit einer Nase über der Außenbahn, oben ein Halbkreis.
    // Die Nase lenkt, was den Umlauf herunterkommt, zur Innenbahn, und wirft
    // einen Rückstoß ins Feld statt zurück in die Außenbahn.
    // Der Bogen federt kaum: Die Kugel soll ihm folgen wie einer Schiene und
    // nicht von Ecke zu Ecke des Vielecks springen.
    zug([[6, 350], [6, 214], [22, 196], [6, 176], [6, 104]], { stil: 'aussen' });
    zug(bogen(101, 104, 95, 180, 360, 36), { stil: 'aussen', e: 0.1 });
    zug([[196, 104], [196, 350]], { stil: 'aussen' });

    // Federbahn mit Boden und einer Klappe, die nur hinauslässt.
    zug([[182, 350], [182, 130]], { stil: 'aussen' });
    seg([182, 326], [196, 326], { stil: 'boden' });
    seg([196, 116], [182, 130], { stil: 'tor', einweg: [-Math.SQRT1_2, -Math.SQRT1_2] });
    zug([[182, 176], [166, 196], [182, 214]], { stil: 'aussen' });

    // Umlauf links: innere Wand und oben eine Klappe, durch die es nur von
    // unten geht – so kommt ein harter Abschuss nicht den Umlauf herunter.
    const innen = bogen(101, 104, 77, 240, 180, 12);
    zug(innen, { stil: 'innen', e: 0.15 });
    zug([innen[innen.length - 1], [24, 168]], { stil: 'innen' });
    const torAussen = bogen(101, 104, 95, 240, 240, 0)[0];
    seg(innen[0], torAussen, { stil: 'tor', einweg: [0.866, -0.5] });

    // Bahnen oben
    for (const x of BAHN_X) seg([x, BAHN_Y - 8], [x, BAHN_Y + 8], { stil: 'pfosten' });

    // Startrampe: Einfahrt schräg zum rechten Flipper hin.
    zug([[52, 150], [40, 118], [58, 112], [70, 144]], { stil: 'innen' });

    // Missionsziele links, Warnziele (Fallziele) rechts
    for (let i = 0; i < 3; i += 1) seg([26, 118 + i * 15], [26, 130 + i * 15], { stil: 'ziel', art: 'mziel', id: i, e: 0.5 });
    for (let i = 0; i < 3; i += 1) seg([179, 134 + i * 14], [179, 146 + i * 14], { stil: 'ziel', art: 'fziel', id: i, e: 0.4 });

    // Schleudern über den Flippern: nur die schräge Seite stößt.
    const schleuder = [[[31, 232], [31, 256], [52, 268]], [[157, 232], [157, 256], [136, 268]]];
    schleuder.forEach(([a, b, c], id) => {
      seg(a, c, { stil: 'schleuder', art: 'schleuder', id, e: 0.5 });
      seg(a, b, { stil: 'gummi', e: 0.55 });
      seg(b, c, { stil: 'gummi', e: 0.55 });
    });

    // Trenner zwischen Außen- und Innenbahn, dann die Führung zum Flipper. Sie
    // endet tangential oben auf der Flipperachse: Endete sie tiefer, läge
    // dort eine Kerbe, in der die Kugel stehen bleibt.
    zug([[17, 226], [17, 262], [64.4, 287.6]], { stil: 'innen' });
    zug([[171, 226], [171, 262], [123.6, 287.6]], { stil: 'innen' });

    const tor = waende.find((w) => w.einweg && w.einweg[0] > 0);
    const pfad = [0];
    for (let i = 1; i < RAMPE_PFAD.length; i += 1) {
      pfad.push(pfad[i - 1] + Math.hypot(RAMPE_PFAD[i][0] - RAMPE_PFAD[i - 1][0], RAMPE_PFAD[i][1] - RAMPE_PFAD[i - 1][1]));
    }
    return { waende, tor, schleuder, pfadLaenge: pfad };
  })();

  /* ---------------------------------------------------------------- Stand */

  function frisch(ton) {
    return {
      v: 1,
      zustand: 'bereit',
      zeit: 0,
      punkte: 0,
      kugelNr: 1,
      kugeln: 3,
      kugel: { ort: 'feder', x: FEDER_X, y: FEDER_Y, vx: 0, vy: 0, t: 0, loch: 0, ziel: 0, s: 0 },
      zug: 0,
      rang: 0,
      missionen: 0,
      missionenRang: 0,
      missionNr: 0,
      mission: null,
      bereit: false,
      treibstoff: TANK,
      tankUhr: 0,
      bahnen: [false, false, false],
      geschick: null,
      stufe: 0,
      stufenUhr: 0,
      mziele: [false, false, false],
      fall: [false, false, false],
      fallHoch: 0,
      rueckstoss: [false, false],
      hyper: 0,
      wurmZiel: -1,
      rettungBis: 0,
      rettungFrei: false,
      gerettet: false,
      tilt: false,
      wackeln: 0,
      sperre: [0, 0, 0, 0],
      bahnSperre: [0, 0, 0],
      ruhe: 0,
      meldungen: [],
      ton: ton !== false,
    };
  }

  const ORTE = ['feder', 'frei', 'loch', 'rampe', 'weg'];
  const liste = (a, n, art) => Array.isArray(a) && a.length === n && a.every((x) => typeof x === art);

  function gueltig(alt) {
    if (!alt || alt.v !== 1 || alt.zustand === 'vorbei') return false;
    const k = alt.kugel;
    if (!k || !ORTE.includes(k.ort) || ![k.x, k.y, k.vx, k.vy].every(Number.isFinite)) return false;
    if (!Number.isFinite(alt.punkte) || !Number.isFinite(alt.zeit)) return false;
    if (!Number.isInteger(alt.rang) || alt.rang < 0 || alt.rang >= RAENGE.length) return false;
    if (!Number.isInteger(alt.missionNr) || !MISSIONEN[alt.missionNr]) return false;
    if (alt.mission !== null && !(alt.mission && MISSIONEN[alt.mission.nr] &&
      MISSIONEN[alt.mission.nr].schritte[alt.mission.schritt])) return false;
    return liste(alt.bahnen, 3, 'boolean') && liste(alt.mziele, 3, 'boolean') && liste(alt.fall, 3, 'boolean') &&
      liste(alt.rueckstoss, 2, 'boolean') && liste(alt.sperre, 4, 'number') && liste(alt.bahnSperre, 3, 'number') &&
      Array.isArray(alt.meldungen) && Number.isInteger(alt.kugelNr) && Number.isInteger(alt.kugeln) &&
      Number.isInteger(alt.wurmZiel) && alt.wurmZiel >= -1 && alt.wurmZiel < 3;
  }

  /* ------------------------------------------------------------------ Klang */

  /* Erzeugt, nicht aufgenommen – wie in Hochhinaus. Der Kontext entsteht erst
     beim ersten Tipp, weil Browser ihn vorher stumm lassen. */
  function klangwerk(erlaubt) {
    const A = window.AudioContext || window.webkitAudioContext;
    let ac = null;
    let haupt = null;
    let rauschen = null;
    const zuletzt = {};

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

    function huelle(c, t, laut, zeit) {
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(laut, t + 0.006);
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
      if (!rauschen) {
        rauschen = c.createBuffer(1, c.sampleRate, c.sampleRate);
        const d = rauschen.getChannelData(0);
        for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
      }
      const q = c.createBufferSource();
      q.buffer = rauschen;
      const fi = c.createBiquadFilter();
      fi.type = 'bandpass';
      fi.Q.value = 1.4;
      fi.frequency.setValueAtTime(von, t);
      fi.frequency.exponentialRampToValueAtTime(bis, t + zeit);
      q.connect(fi);
      fi.connect(huelle(c, t, laut, zeit));
      q.start(t);
      q.stop(t + zeit + 0.05);
    }

    /* Ein Bumper, der in einem Takt dreimal berührt wird, klingt einmal. */
    const selten = (name, fn) => () => {
      const jetzt = performance.now();
      if (zuletzt[name] && jetzt - zuletzt[name] < 45) return;
      zuletzt[name] = jetzt;
      fn();
    };
    const folge = (freq, zeit, typ, laut, abstand) =>
      freq.forEach((f, i) => ton(f, f, zeit, typ, laut, i * abstand));

    return {
      wecken: kontext,
      schlafen() { if (ac && ac.state === 'running') ac.suspend().catch(() => {}); },
      ende() { if (ac) ac.close().catch(() => {}); ac = null; },
      klappe: selten('klappe', () => { zisch(0.05, 0.05, 2600, 700); ton(150, 70, 0.06, 'square', 0.025); }),
      bumper: selten('bumper', () => { ton(560, 190, 0.09, 'square', 0.04); ton(1120, 560, 0.05, 'sine', 0.03); }),
      schleuder: selten('schleuder', () => ton(250, 90, 0.07, 'square', 0.04)),
      ziel: selten('ziel', () => ton(1320, 1320, 0.07, 'square', 0.03)),
      fallziel: () => { ton(420, 90, 0.14, 'triangle', 0.06); zisch(0.08, 0.04, 1200, 300); },
      bahn: () => { ton(1568, 1568, 0.06, 'sine', 0.05); ton(2093, 2093, 0.08, 'sine', 0.04, 0.06); },
      abschuss: (kraft) => zisch(0.25, 0.03 + 0.06 * kraft, 300, 2400),
      rampe: () => { ton(220, 1320, 0.55, 'sawtooth', 0.02); zisch(0.5, 0.03, 600, 3000); },
      loch: () => { ton(700, 40, 0.8, 'sine', 0.08); ton(350, 30, 0.8, 'triangle', 0.04); },
      wurm: () => { ton(200, 1800, 0.35, 'sine', 0.06); ton(1800, 200, 0.35, 'sine', 0.05, 0.35); },
      auswurf: () => ton(160, 520, 0.12, 'triangle', 0.06),
      umlauf: () => folge([660, 880, 1100], 0.06, 'square', 0.03, 0.05),
      verloren: () => { ton(600, 300, 0.25, 'triangle', 0.06); ton(300, 80, 0.6, 'triangle', 0.06, 0.25); },
      rettung: () => folge([880, 660, 880, 1175], 0.09, 'triangle', 0.05, 0.08),
      mission: () => folge([523, 659, 784], 0.12, 'square', 0.03, 0.1),
      erfuellt: () => folge([523, 659, 784, 1047, 1319], 0.14, 'triangle', 0.05, 0.09),
      befoerderung: () => folge([392, 523, 659, 784, 659, 784, 1047], 0.16, 'square', 0.03, 0.12),
      extra: () => folge([784, 988, 1175, 1568, 1976], 0.1, 'triangle', 0.05, 0.07),
      abbruch: () => folge([440, 330, 220], 0.18, 'triangle', 0.05, 0.15),
      warnung: () => ton(220, 220, 0.15, 'square', 0.05),
      tilt: () => ton(110, 90, 0.8, 'sawtooth', 0.07),
      get kontext() { return ac; },
    };
  }

  const SYMBOL_TON = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" stroke-linejoin="round"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke-linecap="round"/>';
  const SYMBOL_STUMM = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" stroke-linejoin="round"/><path d="M16 9.5l5 5M21 9.5l-5 5" stroke-linecap="round"/>';

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    const klappen = KLAPPEN.map(() => ({ a: RUHE, w: 0 }));
    const halten = new Map();          // Zeiger → 'l', 'r' oder 'f' (Feder)
    const tasten = { l: false, r: false, f: false };
    let gedrueckt = { l: false, r: false, f: false };
    const blitz = { bumper: [0, 0, 0], schleuder: [0, 0], loch: [0, 0, 0, 0] };
    let kopfSchluessel = '';

    const klang = klangwerk(() => stand.ton);

    function laden() {
      const alt = s.erinnert();
      if (!gueltig(alt)) return frisch(alt && alt.ton);
      if (alt.zustand === 'laeuft') alt.zustand = 'pause';
      alt.zug = 0;
      return alt;
    }

    const sichern = () => s.merken(stand);
    const bestwert = () => s.partien().reduce((h, p) => Math.max(h, Echtzeit.zahl(p.punkte)), 0);

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const flaeche = el('div', 'ez-flaeche pb-flaeche');
    const feld = el('div', 'pb-kasten');
    const unten = el('div', 'ez-unten');
    flaeche.append(feld);
    wurzel.append(kopf, flaeche, unten);

    const b = Echtzeit.buehne(feld, { breite: B, hoehe: H, schritt, zeichnen, beiHalt });

    function werkzeugeSetzen() {
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
      stand.zustand = 'laeuft';
      klang.wecken();
      anzeigen();
      b.los();
    }

    function pauseUmschalten() {
      if (b.laeuft) b.halt();
      else if (stand.zustand === 'pause') weiter();
    }

    function beiHalt() {
      if (stand.zustand === 'laeuft') stand.zustand = 'pause';
      // Wer beim Anhalten die Feder hielt, schießt damit nicht beim Loslassen.
      halten.clear();
      tasten.l = tasten.r = tasten.f = false;
      gedrueckt = { l: false, r: false, f: false };
      stand.zug = 0;
      if (stand.kugel.ort === 'feder') stand.kugel.y = FEDER_Y;
      klang.schlafen();
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

    function vorbei() {
      const st = stand;
      st.zustand = 'vorbei';
      st.meldungen = [];
      s.notieren({ punkte: Math.round(st.punkte), rang: st.rang, missionen: st.missionen, dauer: Math.round(st.zeit * 1000) });
      b.halt();
    }

    function neu() {
      stand = frisch(stand.ton);
      for (const k of klappen) { k.a = RUHE; k.w = 0; }
      anzeigen();
      sichern();
      b.malen();
    }

    /* ------------------------------------------------------------ Regeln */

    function melden(text, dauer = 2.2) {
      const m = stand.meldungen;
      // Nicht mehr als drei warten lassen: Was nach einer Salve von Treffern
      // noch käme, ist längst überholt.
      if (m.length >= 4) m.splice(1, m.length - 3);
      m.push({ text, t: dauer });
    }

    function punkte(n) {
      if (!stand.tilt) stand.punkte += n;
    }

    function fortschritt(art) {
      const st = stand;
      if (!st.mission || st.tilt) return;
      const m = MISSIONEN[st.mission.nr];
      const schritt = m.schritte[st.mission.schritt];
      if (schritt.art !== art) return;
      st.mission.zaehler += 1;
      if (st.mission.zaehler < verlangt(schritt, st.rang)) return;
      st.mission.schritt += 1;
      st.mission.zaehler = 0;
      if (st.mission.schritt < m.schritte.length) {
        melden(m.name + ': weiter');
        klang.mission();
        return;
      }
      const lohn = 20000 * (st.rang + 1);
      punkte(lohn);
      st.mission = null;
      st.missionen += 1;
      st.missionenRang += 1;
      st.missionNr = (st.missionNr + 1) % MISSIONEN.length;
      melden('Mission erfüllt: ' + zahlText(lohn), 2.6);
      klang.erfuellt();
      if (st.missionenRang >= MISSIONEN_JE_RANG && st.rang < RAENGE.length - 1) befoerdern();
    }

    function befoerdern() {
      const st = stand;
      st.rang += 1;
      st.missionenRang = 0;
      punkte(50000 * st.rang);
      melden('Beförderung: ' + RAENGE[st.rang], 3);
      klang.befoerderung();
      if (st.rang % 3 === 0) {
        st.kugeln += 1;
        melden('Extrakugel!', 2.4);
        klang.extra();
      }
    }

    function bahn(i) {
      const st = stand;
      if (st.zeit < st.bahnSperre[i]) return;
      st.bahnSperre[i] = st.zeit + 0.5;
      if (st.geschick && st.zeit < st.geschick.bis) {
        if (st.geschick.bahn === i) {
          punkte(25000);
          melden('Geschicktreffer: 25.000');
          klang.erfuellt();
        }
        st.geschick = null;
      }
      punkte(1000);
      klang.bahn();
      st.bahnen[i] = true;
      if (st.mission) st.treibstoff = Math.min(TANK, st.treibstoff + 1);
      fortschritt('bahn');
      if (st.bahnen.every(Boolean)) {
        st.bahnen = [false, false, false];
        punkte(5000);
        st.stufenUhr = 0;
        if (st.stufe < STUFEN.length - 1) {
          st.stufe += 1;
          melden('Angriffsbumper: Stufe ' + (st.stufe + 1));
        }
      }
    }

    function bahnenDrehen(richtung) {
      const l = stand.bahnen;
      stand.bahnen = richtung < 0 ? [l[1], l[2], l[0]] : [l[2], l[0], l[1]];
    }

    function bumperTreffer(i) {
      blitz.bumper[i] = 0.12;
      punkte(500 * (stand.stufe + 1));
      klang.bumper();
      fortschritt('bumper');
    }

    function missionsziel(i) {
      const st = stand;
      klang.ziel();
      punkte(st.mziele[i] ? 500 : 1500);
      st.mziele[i] = true;
      if (!st.mziele.every(Boolean)) return;
      st.mziele = [false, false, false];
      punkte(5000);
      if (!st.mission && !st.bereit) {
        st.bereit = true;
        melden('Mission bereit: zur Rampe', 2.6);
        klang.mission();
      }
    }

    function fallziel(i) {
      const st = stand;
      if (st.fall[i]) return;
      st.fall[i] = true;
      punkte(750);
      klang.fallziel();
      fortschritt('warn');
      if (st.fall.every(Boolean)) {
        punkte(10000);
        st.rueckstoss = [true, true];
        st.fallHoch = st.zeit + 1.5;
        melden('Rückstoß bereit');
      }
    }

    function umlauf() {
      const st = stand;
      punkte(5000);
      klang.umlauf();
      st.hyper += 1;
      fortschritt('umlauf');
      if (st.hyper >= 5) {
        st.hyper = 0;
        punkte(75000);
        melden('Hyperraumsprung: 75.000', 2.6);
        klang.erfuellt();
      }
    }

    function rampeRein() {
      const st = stand;
      const k = st.kugel;
      k.ort = 'rampe';
      k.s = 0;
      punkte(10000);
      klang.rampe();
      st.treibstoff = TANK;
      st.tankUhr = 0;
      // Erst zählen, dann annehmen: Die Rampe, die eine Mission startet, soll
      // nicht gleich deren erster Schritt sein.
      fortschritt('rampe');
      if (st.bereit && !st.mission) {
        st.bereit = false;
        st.mission = { nr: st.missionNr, schritt: 0, zaehler: 0 };
        melden('Mission: ' + MISSIONEN[st.missionNr].name, 2.6);
        klang.mission();
      }
    }

    function einlochen(i) {
      const st = stand;
      const k = st.kugel;
      k.ort = 'loch';
      k.loch = i;
      k.x = LOECHER[i].x;
      k.y = LOECHER[i].y;
      k.vx = k.vy = 0;
      k.t = 0.9;
      blitz.loch[i] = 0.9;
      if (i === SCHWARZ) {
        k.ziel = SCHWARZ;
        punkte(7500);
        klang.loch();
        // Das Schwarze Loch zeigt ein Wurmloch an. Erst dann gibt es etwas
        // zu treffen – vorher brachte jedes dritte Wurmloch eine Rettung.
        if (st.wurmZiel < 0) {
          st.wurmZiel = Math.floor(Math.random() * 3);
          melden(LOECHER[st.wurmZiel].titel + ' Wurmloch leuchtet');
        }
        fortschritt('loch');
        return;
      }
      punkte(7500);
      klang.wurm();
      k.ziel = st.wurmZiel >= 0 ? st.wurmZiel : i;
      // Rollt die Kugel zurück in das Loch, das sie eben ausgespuckt hat, ist
      // das kein Treffer – sonst brächte schon ein Wurmloch die Rettung.
      const zurueck = st.auswurf && st.auswurf.loch === i && st.zeit - st.auswurf.zeit < 3;
      if (i === st.wurmZiel && !zurueck) {
        punkte(25000);
        st.rettungFrei = true;
        melden('Wurmloch getroffen – Rettung bereit', 2.6);
      }
      // Ein Licht, ein Versuch: Wer ein anderes Loch trifft, fliegt zum
      // leuchtenden, aber das Licht ist dann aus.
      st.wurmZiel = -1;
      fortschritt('wurm');
    }

    function auswerfen() {
      const st = stand;
      const k = st.kugel;
      const l = LOECHER[k.ziel];
      k.ort = 'frei';
      k.x = l.x;
      k.y = l.y;
      k.vx = l.aus[0] * 230;
      k.vy = l.aus[1] * 230;
      st.sperre[k.ziel] = st.zeit + 0.7;
      st.auswurf = { loch: k.ziel, zeit: st.zeit };
      blitz.loch[k.ziel] = 0.3;
      klang.auswurf();
    }

    function zurFeder() {
      const st = stand;
      st.kugel = { ort: 'feder', x: FEDER_X, y: FEDER_Y, vx: 0, vy: 0, t: 0, loch: 0, ziel: 0, s: 0 };
      st.zug = 0;
      st.ruhe = 0;
    }

    function abschiessen() {
      const st = stand;
      const k = st.kugel;
      if (st.zustand !== 'laeuft' || k.ort !== 'feder') return;
      const kraft = st.zug;
      k.ort = 'frei';
      k.y = FEDER_Y;
      k.vx = 0;
      k.vy = -(V_FEDER_MIN + (V_FEDER_MAX - V_FEDER_MIN) * kraft);
      st.zug = 0;
      // Die Zeitrettung gilt einmal je Kugel – sonst ließe sich eine Kugel,
      // die sofort abläuft, beliebig oft neu abschießen.
      if (!st.gerettet) st.rettungBis = st.zeit + RETTUNG_S;
      st.geschick = { bahn: Math.floor(Math.random() * 3), bis: st.zeit + 5 };
      klang.abschuss(kraft);
    }

    function abfluss() {
      const st = stand;
      const gerettet = !st.tilt && (st.zeit < st.rettungBis || st.rettungFrei);
      if (gerettet) {
        if (st.zeit >= st.rettungBis) st.rettungFrei = false;
        zurFeder();
        st.rettungBis = 0;
        st.gerettet = true;
        melden('Kugel gerettet');
        klang.rettung();
        return;
      }
      st.kugel.ort = 'weg';
      st.kugel.t = 1.4;
      klang.verloren();
    }

    function naechsteKugel() {
      const st = stand;
      st.kugelNr += 1;
      st.tilt = false;
      st.wackeln = 0;
      st.rettungFrei = false;
      st.gerettet = false;
      st.rueckstoss = [false, false];
      if (st.kugelNr > st.kugeln) {
        vorbei();
        return;
      }
      zurFeder();
      melden('Kugel ' + st.kugelNr);
    }

    function ruetteln(richtung) {
      const st = stand;
      const k = st.kugel;
      if (st.tilt || k.ort !== 'frei') return;
      k.vx += richtung * 70;
      k.vy -= richtung ? 40 : 90;
      st.wackeln += 1;
      // Der Zähler fällt schon zwischen zwei Takten; eine Schwelle von genau 3
      // erreichten nur drei Stöße im selben Takt. So sind es drei in einer Sekunde.
      if (st.wackeln >= 2.5) {
        st.tilt = true;
        st.meldungen = [];
        melden('TILT', 3);
        klang.tilt();
      } else if (st.wackeln >= 1.5) {
        melden('Vorsicht!', 1.2);
        klang.warnung();
      }
    }

    /* ------------------------------------------------------------- Physik */

    const aktiv = (j) => !stand.tilt && (j === 0 ? gedrueckt.l : gedrueckt.r);

    function klappenBewegen(h) {
      klappen.forEach((f, j) => {
        const an = aktiv(j);
        const ziel = an ? OBEN : RUHE;
        const tempo = an ? KL_HOCH : KL_RUNTER;
        const alt = f.a;
        f.a = f.a > ziel ? Math.max(ziel, f.a - tempo * h) : Math.min(ziel, f.a + tempo * h);
        f.w = (f.a - alt) / h;
      });
    }

    function wand(k, w) {
      if (w.art === 'fziel' && stand.fall[w.id]) return;
      const px = k.x - w.ax;
      const py = k.y - w.ay;
      if (w.einweg && px * w.einweg[0] + py * w.einweg[1] <= 0) return;
      let t = (px * w.dx + py * w.dy) / w.l2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      let nx = px - w.dx * t;
      let ny = py - w.dy * t;
      const d2 = nx * nx + ny * ny;
      if (d2 >= R * R) return;
      const d = Math.sqrt(d2);
      if (d < 1e-6) {
        const l = Math.sqrt(w.l2);
        nx = -w.dy / l;
        ny = w.dx / l;
      } else {
        nx /= d;
        ny /= d;
      }
      k.x += nx * (R - d);
      k.y += ny * (R - d);
      const vn = k.vx * nx + k.vy * ny;
      if (vn >= 0) return;
      // Eine Kugel, die nur aufliegt, soll liegen und nicht zittern.
      const e = -vn < 25 ? 0 : w.e;
      k.vx -= (1 + e) * vn * nx;
      k.vy -= (1 + e) * vn * ny;
      if (w.art === 'schleuder' && -vn > 40) {
        const neu = k.vx * nx + k.vy * ny;
        if (neu < 280) { k.vx += (280 - neu) * nx; k.vy += (280 - neu) * ny; }
        blitz.schleuder[w.id] = 0.1;
        punkte(50);
        klang.schleuder();
      } else if (w.art === 'mziel' && -vn > 30) {
        missionsziel(w.id);
      } else if (w.art === 'fziel' && -vn > 30) {
        fallziel(w.id);
      }
    }

    function bumper(k, i) {
      const c = BUMPER[i];
      let nx = k.x - c.x;
      let ny = k.y - c.y;
      const min = R + BUMPER_R;
      const d2 = nx * nx + ny * ny;
      if (d2 >= min * min) return;
      const d = Math.sqrt(d2) || 1e-6;
      nx /= d;
      ny /= d;
      k.x = c.x + nx * min;
      k.y = c.y + ny * min;
      const vn = k.vx * nx + k.vy * ny;
      if (vn >= 0) return;
      k.vx -= 1.6 * vn * nx;
      k.vy -= 1.6 * vn * ny;
      const neu = k.vx * nx + k.vy * ny;
      if (neu < 320) { k.vx += (320 - neu) * nx; k.vy += (320 - neu) * ny; }
      bumperTreffer(i);
    }

    function klappe(k, j) {
      const F = KLAPPEN[j];
      const f = klappen[j];
      const dx = F.s * KL_LAENGE * Math.cos(f.a);
      const dy = KL_LAENGE * Math.sin(f.a);
      let t = ((k.x - F.x) * dx + (k.y - F.y) * dy) / (KL_LAENGE * KL_LAENGE);
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = F.x + dx * t;
      const qy = F.y + dy * t;
      const rr = KL_R_ACHSE + (KL_R_SPITZE - KL_R_ACHSE) * t;
      let nx = k.x - qx;
      let ny = k.y - qy;
      const min = R + rr;
      const d2 = nx * nx + ny * ny;
      if (d2 >= min * min) return;
      const d = Math.sqrt(d2);
      if (d < 1e-6) { nx = 0; ny = -1; } else { nx /= d; ny /= d; }
      k.x = qx + nx * min;
      k.y = qy + ny * min;
      // Geschwindigkeit der Flipperfläche an der Berührstelle
      const cx = qx + nx * rr - F.x;
      const cy = qy + ny * rr - F.y;
      const ux = F.s * f.w * -cy;
      const uy = F.s * f.w * cx;
      const vn = (k.vx - ux) * nx + (k.vy - uy) * ny;
      if (vn >= 0) return;
      const e = -vn < 30 ? 0 : 0.3;
      k.vx -= (1 + e) * vn * nx;
      k.vy -= (1 + e) * vn * ny;
    }

    /** Fühler ohne Widerstand. Liefert true, wenn die Kugel den freien Lauf verlassen hat. */
    function fuehler(ox, oy) {
      const st = stand;
      const k = st.kugel;

      if ((oy - BAHN_Y) * (k.y - BAHN_Y) < 0) {
        for (let i = 0; i < 3; i += 1) if (k.x > BAHN_X[i] && k.x < BAHN_X[i + 1]) bahn(i);
      }

      if (oy < 244 && k.y >= 244) {
        if (k.x < 17) { punkte(1000); }
        else if (k.x < 31 || (k.x > 157 && k.x <= 171)) { punkte(250); }
        else if (k.x > 171 && k.x < 182) { punkte(1000); }
      }

      if (k.y > 296 && k.vy > 0) {
        const seite = k.x < 17 ? 0 : k.x > 171 && k.x < 182 ? 1 : -1;
        if (seite >= 0 && st.rueckstoss[seite] && !st.tilt) {
          st.rueckstoss[seite] = false;
          k.vx = 0;
          k.vy = -640;
          punkte(2000);
          melden('Rückstoß');
          klang.schleuder();
        }
      }

      const tor = TISCH.tor;
      const s0 = (ox - tor.ax) * tor.einweg[0] + (oy - tor.ay) * tor.einweg[1];
      const s1 = (k.x - tor.ax) * tor.einweg[0] + (k.y - tor.ay) * tor.einweg[1];
      if (s0 < 0 && s1 >= 0) {
        const t = ((k.x - tor.ax) * tor.dx + (k.y - tor.ay) * tor.dy) / tor.l2;
        if (t >= -0.1 && t <= 1.1) umlauf();
      }

      if ((k.x - RAMPE.x) ** 2 + (k.y - RAMPE.y) ** 2 < 81 && k.vx * RAMPE.dx + k.vy * RAMPE.dy > RAMPE.tempo) {
        rampeRein();
        return true;
      }

      // Ein Loch fängt nur, was langsam genug darüber rollt – sonst läge die
      // Kugel öfter in einem Loch als auf dem Tisch.
      const tempo = Math.hypot(k.vx, k.vy);
      for (let i = 0; i < LOECHER.length; i += 1) {
        const l = LOECHER[i];
        if (st.zeit >= st.sperre[i] && tempo < (i === SCHWARZ ? 600 : 360) &&
          (k.x - l.x) ** 2 + (k.y - l.y) ** 2 < LOCH_FANG * LOCH_FANG) {
          einlochen(i);
          return true;
        }
      }

      if (k.y > 352) {
        abfluss();
        return true;
      }

      if (k.x > 183 && k.y > 316 && Math.hypot(k.vx, k.vy) < 60) {
        zurFeder();
        return true;
      }
      return false;
    }

    function frei(dt) {
      const st = stand;
      const k = st.kugel;
      const tempo = Math.hypot(k.vx, k.vy);
      const bewegt = klappen.some((f, j) => f.a !== (aktiv(j) ? OBEN : RUHE));
      const weg = Math.max(tempo * dt, bewegt ? KL_LAENGE * KL_HOCH * dt : 0);
      const n = Math.min(16, Math.max(1, Math.ceil(weg / 1.5)));
      const h = dt / n;
      for (let i = 0; i < n; i += 1) {
        klappenBewegen(h);
        const ox = k.x;
        const oy = k.y;
        k.vy += SCHWERE * h;
        const v = Math.hypot(k.vx, k.vy);
        if (v > V_MAX) { k.vx *= V_MAX / v; k.vy *= V_MAX / v; }
        k.x += k.vx * h;
        k.y += k.vy * h;
        for (const w of TISCH.waende) wand(k, w);
        for (let j = 0; j < BUMPER.length; j += 1) bumper(k, j);
        klappe(k, 0);
        klappe(k, 1);
        if (fuehler(ox, oy)) return;
      }

      // Eine Kugel, die irgendwo liegen bleibt, wird angestoßen – wie die
      // Suche nach der Kugel, die echte Tische dann laufen lassen. Wer sie
      // auf dem gehaltenen Flipper wiegt, meint das so.
      if (Math.hypot(k.vx, k.vy) < 8 && !gedrueckt.l && !gedrueckt.r && k.x < 182) st.ruhe += dt;
      else st.ruhe = 0;
      if (st.ruhe > 2.5) {
        st.ruhe = 0;
        k.vy = -160;
        k.vx = k.x < 94 ? 60 : -60;
      }
      if (!(k.x > -5 && k.x < B + 5 && k.y > -10)) zurFeder();
    }

    function uhren(dt) {
      const st = stand;
      if (st.meldungen.length) {
        st.meldungen[0].t -= dt;
        if (st.meldungen[0].t <= 0) st.meldungen.shift();
      }
      for (const liste_ of [blitz.bumper, blitz.schleuder, blitz.loch]) {
        for (let i = 0; i < liste_.length; i += 1) liste_[i] = Math.max(0, liste_[i] - dt);
      }
      st.wackeln = Math.max(0, st.wackeln - 0.5 * dt);
      if (st.stufe > 0) {
        st.stufenUhr += dt;
        if (st.stufenUhr >= 60) { st.stufe -= 1; st.stufenUhr = 0; }
      }
      if (st.fallHoch && st.zeit >= st.fallHoch) {
        // Nicht unter einer Kugel hochklappen – sie säße sonst im Ziel fest.
        const k = st.kugel;
        if (k.ort === 'frei' && k.x > 168 && k.y > 126 && k.y < 182) st.fallHoch = st.zeit + 0.3;
        else { st.fall = [false, false, false]; st.fallHoch = 0; }
      }
      const imSpiel = st.kugel.ort !== 'feder' && st.kugel.ort !== 'weg';
      if (st.mission && imSpiel) {
        st.tankUhr += dt;
        if (st.tankUhr >= TANK_S) {
          st.tankUhr = 0;
          st.treibstoff -= 1;
          if (st.treibstoff <= 0) {
            st.mission = null;
            st.treibstoff = TANK;
            melden('Treibstoff leer – Mission abgebrochen', 2.8);
            klang.abbruch();
          } else if (st.treibstoff === 2) {
            melden('Treibstoff knapp');
          }
        }
      }
    }

    function schritt(dt) {
      const st = stand;
      st.zeit += dt;
      uhren(dt);
      const k = st.kugel;
      if (k.ort === 'frei') {
        frei(dt);
        return;
      }
      klappenBewegen(dt);
      if (k.ort === 'feder') {
        if (gedrueckt.f && !st.tilt) st.zug = Math.min(1, st.zug + dt / FEDER_ZEIT);
        k.y = FEDER_Y + FEDER_WEG * st.zug;
      } else if (k.ort === 'loch') {
        k.t -= dt;
        if (k.t <= 0) auswerfen();
      } else if (k.ort === 'rampe') {
        k.s += 400 * dt;
        const [x, y, rx, ry] = aufRampe(k.s);
        k.x = x;
        k.y = y;
        if (k.s >= TISCH.pfadLaenge[TISCH.pfadLaenge.length - 1]) {
          k.ort = 'frei';
          k.vx = rx * 170;
          k.vy = ry * 170;
        }
      } else if (k.ort === 'weg') {
        k.t -= dt;
        if (k.t <= 0) naechsteKugel();
      }
    }

    /** Punkt und Richtung auf der Rampe nach `weg` Einheiten. */
    function aufRampe(weg) {
      const L = TISCH.pfadLaenge;
      let i = 1;
      while (i < L.length - 1 && L[i] < weg) i += 1;
      const [ax, ay] = RAMPE_PFAD[i - 1];
      const [bx, by] = RAMPE_PFAD[i];
      const l = L[i] - L[i - 1];
      const t = Math.min(1, Math.max(0, (weg - L[i - 1]) / l));
      return [ax + (bx - ax) * t, ay + (by - ay) * t, (bx - ax) / l, (by - ay) / l];
    }

    /* ---------------------------------------------------------- Eingabe */

    function eingabe() {
      const werte = [...halten.values()];
      const jetzt = {
        l: tasten.l || werte.includes('l'),
        r: tasten.r || werte.includes('r'),
        f: tasten.f || werte.includes('f'),
      };
      const vorher = gedrueckt;
      gedrueckt = jetzt;
      if (stand.zustand !== 'laeuft') return;
      if (jetzt.l && !vorher.l && !stand.tilt) { bahnenDrehen(-1); klang.klappe(); }
      if (jetzt.r && !vorher.r && !stand.tilt) { bahnenDrehen(1); klang.klappe(); }
      if (vorher.f && !jetzt.f) abschiessen();
    }

    b.an(flaeche, 'pointerdown', (e) => {
      if (stand.zustand === 'vorbei' || halten.has(e.pointerId)) return;
      e.preventDefault();
      weiter();
      if (stand.zustand !== 'laeuft') return;
      const r = b.canvas.getBoundingClientRect();
      const rechts = e.clientX >= r.left + r.width / 2;
      const art = rechts ? (stand.kugel.ort === 'feder' && !stand.tilt ? 'f' : 'r') : 'l';
      halten.set(e.pointerId, art);
      try { flaeche.setPointerCapture(e.pointerId); } catch { /* synthetisch */ }
      eingabe();
    });
    const loslassen = (e) => {
      if (!halten.has(e.pointerId)) return;
      halten.delete(e.pointerId);
      eingabe();
    };
    b.an(flaeche, 'pointerup', loslassen);
    b.an(flaeche, 'pointercancel', loslassen);

    const tasteVon = (e) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    function belegung(e) {
      const k = tasteVon(e);
      if (k === 'z' || k === 'y' || k === 'ArrowLeft' || e.code === 'ShiftLeft') return 'l';
      if (k === '/' || k === '-' || k === 'ArrowRight' || e.code === 'ShiftRight') return 'r';
      if ((k === ' ' && !Echtzeit.knopfHatFokus(e)) || k === 'ArrowDown') return 'f';
      return null;
    }

    b.an(window, 'keydown', (e) => {
      if (!Echtzeit.tasteZaehlt(e)) return;
      const k = tasteVon(e);
      const art = belegung(e);
      if (art) {
        e.preventDefault();
        if (e.repeat || stand.zustand === 'vorbei') return;
        weiter();
        tasten[art] = true;
        eingabe();
      } else if (k === 'x' || k === '.' || k === 'ArrowUp') {
        e.preventDefault();
        if (!e.repeat && stand.zustand === 'laeuft') ruetteln(k === 'x' ? -1 : k === '.' ? 1 : 0);
      } else if (k === 'p' || k === 'Escape') {
        pauseUmschalten();
      }
    });
    b.an(window, 'keyup', (e) => {
      const art = belegung(e);
      if (!art || !tasten[art]) return;
      tasten[art] = false;
      eingabe();
    });

    /* ----------------------------------------------------------- Anzeige */

    function kopfZeichnen() {
      const st = stand;
      kopf.replaceChildren();
      const p = el('span');
      p.append(el('b', null, zahlText(st.punkte)), document.createTextNode(' Punkte'));
      kopf.append(p, el('span', null, 'Kugel ' + Math.min(st.kugelNr, st.kugeln) + '/' + st.kugeln));
      const best = bestwert();
      s.unter(RAENGE[st.rang] + (best ? ' · Bestwert ' + zahlText(best) : ''));
    }

    function kopfNachziehen() {
      const st = stand;
      const schluessel = [Math.round(st.punkte), st.kugelNr, st.kugeln, st.rang].join('|');
      if (schluessel === kopfSchluessel) return;
      kopfSchluessel = schluessel;
      kopfZeichnen();
    }

    function anzeigen() {
      kopfSchluessel = '';
      kopfNachziehen();
      const st = stand;
      const z = st.zustand;
      unten.replaceChildren();
      if (z === 'bereit') {
        b.schild('Feder spannen', 'Rechte Hälfte halten, loslassen schießt. Danach tippen links und rechts die Flipper.');
      } else if (z === 'pause') {
        b.schild('Pause', 'Tippen, um weiterzuspielen.');
        unten.append(Echtzeit.kasten('Pause', zahlText(st.punkte) + ' Punkte, Kugel ' + st.kugelNr + ' von ' + st.kugeln + '.', [
          { text: 'Weiter', tun: weiter },
          { text: 'Neu anfangen', art: 'still', tun: neu },
        ]));
      } else if (z === 'vorbei') {
        b.schild('Spiel vorbei.');
        const best = bestwert();
        unten.append(Echtzeit.kasten('Spiel vorbei.',
          zahlText(st.punkte) + ' Punkte als ' + RAENGE[st.rang] + ', ' +
          st.missionen + (st.missionen === 1 ? ' Mission' : ' Missionen') + ' in ' +
          s.dauerText(Math.round(st.zeit * 1000)) + '.' +
          (st.punkte > 0 && st.punkte >= best ? ' Das ist dein Bestwert.' : ''),
          [{ text: 'Nochmal', tun: neu }]));
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
    }

    function anzeigeText(st) {
      if (st.meldungen.length) return st.meldungen[0].text;
      if (st.tilt) return 'TILT';
      if (st.mission) {
        const m = MISSIONEN[st.mission.nr];
        const schritt = m.schritte[st.mission.schritt];
        const rest = verlangt(schritt, st.rang) - st.mission.zaehler;
        return m.name + ': ' + rest + ' ' + EINHEIT[schritt.art][rest === 1 ? 0 : 1];
      }
      if (st.bereit) return 'Rampe: ' + MISSIONEN[st.missionNr].name;
      if (st.kugel.ort === 'feder') return 'Kugel ' + st.kugelNr + ' – Feder spannen';
      return RAENGE[st.rang] + ' – Missionsziele treffen';
    }

    /* ---------------------------------------------------------- Zeichnen */

    function licht(ctx, x, y, r, farbe, an) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = farbe;
      ctx.globalAlpha = an ? 1 : 0.22;
      ctx.fill();
      if (an) {
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(x, y, r * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function hintergrund(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, TISCH_H);
      g.addColorStop(0, '#171C52');
      g.addColorStop(0.55, '#0E1236');
      g.addColorStop(1, '#070918');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, B, TISCH_H);
      const n = ctx.createRadialGradient(120, 150, 5, 120, 150, 95);
      n.addColorStop(0, 'rgba(150, 80, 220, .38)');
      n.addColorStop(1, 'rgba(150, 80, 220, 0)');
      ctx.fillStyle = n;
      ctx.fillRect(0, 0, B, TISCH_H);
      const n2 = ctx.createRadialGradient(40, 260, 5, 40, 260, 70);
      n2.addColorStop(0, 'rgba(40, 140, 220, .28)');
      n2.addColorStop(1, 'rgba(40, 140, 220, 0)');
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, B, TISCH_H);
      ctx.fillStyle = '#FFFFFF';
      for (const st of STERNE) {
        ctx.globalAlpha = st.a;
        ctx.fillRect(st.x, st.y, st.r, st.r);
      }
      ctx.globalAlpha = 1;

      // Ringplanet hinter den Rangleuchten
      const p = ctx.createRadialGradient(88, 184, 2, 94, 190, 30);
      p.addColorStop(0, 'rgba(120, 170, 255, .45)');
      p.addColorStop(1, 'rgba(40, 60, 150, .12)');
      ctx.fillStyle = p;
      ctx.beginPath();
      ctx.arc(94, 190, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(170, 200, 255, .25)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(94, 190, 44, 10, -0.25, 0, Math.PI * 2);
      ctx.stroke();

      // Gehäuse außerhalb der Wände
      ctx.fillStyle = '#05060F';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 104);
      ctx.arc(101, 104, 96.5, Math.PI, Math.PI * 2);
      ctx.lineTo(B, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(0, 0, 4.6, TISCH_H);
      ctx.fillRect(197.4, 0, 2.6, TISCH_H);
    }

    function lichter(ctx, st) {
      // Rangleuchten außen (orange), Fortschritt der Mission innen (blau)
      for (let i = 0; i < RAENGE.length; i += 1) {
        const w = -Math.PI / 2 + (i / RAENGE.length) * Math.PI * 2;
        licht(ctx, 94 + Math.cos(w) * 20, 190 + Math.sin(w) * 20, 1.8, '#FF9A3C', i <= st.rang);
      }
      let anteil = 0;
      if (st.mission) {
        const m = MISSIONEN[st.mission.nr];
        let gesamt = 0;
        let fertig = 0;
        m.schritte.forEach((sch, i) => {
          const n = verlangt(sch, st.rang);
          gesamt += n;
          if (i < st.mission.schritt) fertig += n;
          else if (i === st.mission.schritt) fertig += st.mission.zaehler;
        });
        anteil = fertig / gesamt;
      }
      for (let i = 0; i < 8; i += 1) {
        const w = -Math.PI / 2 + (i / 8) * Math.PI * 2;
        licht(ctx, 94 + Math.cos(w) * 11, 190 + Math.sin(w) * 11, 1.5, '#4FA3FF', st.mission && i < Math.round(anteil * 8));
      }
      for (let i = 0; i < MISSIONEN_JE_RANG; i += 1) {
        licht(ctx, 90 + i * 8, 190, 1.6, '#FFFFFF', i < st.missionenRang);
      }

      // Zielfarbe der Wurmlöcher
      for (let i = 0; i < 3; i += 1) licht(ctx, 82 + i * 12, 224, 2, LOECHER[i].farbe, i === st.wurmZiel);

      // Bahnen oben, mit dem blinkenden Geschicktreffer
      for (let i = 0; i < 3; i += 1) {
        const x = (BAHN_X[i] + BAHN_X[i + 1]) / 2;
        const geschick = st.geschick && st.geschick.bahn === i && st.zeit < st.geschick.bis;
        licht(ctx, x, BAHN_Y, 2.4, '#FFD84A', st.bahnen[i] || (geschick && blinkt(st, 4)));
      }

      // Treibstoff in der Rampeneinfahrt
      for (let i = 0; i < TANK; i += 1) {
        const t = i / (TANK - 1);
        const x = 63 - 12 * t;
        const y = 146 - 28 * t;
        const an = i < st.treibstoff && (st.treibstoff > 2 || !st.mission || blinkt(st, 2));
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.36);
        ctx.globalAlpha = an ? 1 : 0.2;
        ctx.fillStyle = st.mission ? '#FF9A3C' : '#FFC98A';
        ctx.beginPath();
        ctx.moveTo(-3, 1.5);
        ctx.lineTo(0, -1.5);
        ctx.lineTo(3, 1.5);
        ctx.lineTo(3, 3);
        ctx.lineTo(0, 0);
        ctx.lineTo(-3, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      if (st.bereit) licht(ctx, 61, 156, 2.6, '#4FA3FF', blinkt(st, 3));

      // Hyperraum im Umlauf
      for (let i = 0; i < 5; i += 1) licht(ctx, 15, 166 - i * 12, 1.8, '#C77DFF', i < st.hyper);

      // Missionsziele-Lichter, Rückstoß, Rettung
      for (let i = 0; i < 3; i += 1) licht(ctx, 33, 124 + i * 15, 1.6, '#4FA3FF', st.mziele[i]);
      licht(ctx, 11, 284, 2.2, '#FF5A5A', st.rueckstoss[0]);
      licht(ctx, 177, 284, 2.2, '#FF5A5A', st.rueckstoss[1]);
      const rettung = !st.tilt && ((st.zeit < st.rettungBis && blinkt(st, 3)) || st.rettungFrei);
      ctx.save();
      ctx.globalAlpha = rettung ? 1 : 0.25;
      ctx.fillStyle = '#5FE3FF';
      ctx.beginPath();
      ctx.moveTo(94, 318);
      ctx.lineTo(99, 324);
      ctx.lineTo(94, 334);
      ctx.lineTo(89, 324);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function loecherMalen(ctx, st) {
      LOECHER.forEach((l, i) => {
        const hell = i === SCHWARZ || i === st.wurmZiel || blitz.loch[i] > 0;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 6.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = l.farbe;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = hell ? 1 : 0.45;
        if (i === SCHWARZ) {
          // Wirbel: drei Bögen, die sich mit der Zeit drehen
          for (let a = 0; a < 3; a += 1) {
            ctx.beginPath();
            ctx.arc(l.x, l.y, 4.2, st.zeit * 3 + (a * Math.PI * 2) / 3, st.zeit * 3 + (a * Math.PI * 2) / 3 + 1.4);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(l.x, l.y, 7.4, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(l.x, l.y, 7.4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.arc(l.x, l.y, 4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });
    }

    function waendeMalen(ctx, st) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const w of TISCH.waende) {
        if (w.stil === 'ziel' || w.stil === 'schleuder' || w.stil === 'gummi') continue;
        ctx.beginPath();
        ctx.moveTo(w.ax, w.ay);
        ctx.lineTo(w.bx, w.by);
        if (w.stil === 'aussen') { ctx.strokeStyle = '#8C9CC4'; ctx.lineWidth = 2.6; }
        else if (w.stil === 'tor') { ctx.strokeStyle = '#E6ECFF'; ctx.lineWidth = 0.9; }
        else if (w.stil === 'boden') { ctx.strokeStyle = '#8C9CC4'; ctx.lineWidth = 1.5; }
        else if (w.stil === 'pfosten') { ctx.strokeStyle = '#C8D3F0'; ctx.lineWidth = 2; }
        else { ctx.strokeStyle = '#A9B8DD'; ctx.lineWidth = 2.1; }
        ctx.stroke();
      }
      // Glanzkante auf den Außenwänden
      ctx.strokeStyle = 'rgba(255, 255, 255, .28)';
      ctx.lineWidth = 0.6;
      for (const w of TISCH.waende) {
        if (w.stil !== 'aussen') continue;
        ctx.beginPath();
        ctx.moveTo(w.ax, w.ay);
        ctx.lineTo(w.bx, w.by);
        ctx.stroke();
      }

      // Schleudern
      TISCH.schleuder.forEach(([a, bb, c], i) => {
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(bb[0], bb[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.closePath();
        ctx.fillStyle = blitz.schleuder[i] > 0 ? '#FFE680' : '#2A3570';
        ctx.fill();
        ctx.strokeStyle = '#F4F6FF';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.strokeStyle = blitz.schleuder[i] > 0 ? '#FFFFFF' : '#E5484D';
        ctx.lineWidth = 2.2;
        ctx.stroke();
      });

      // Ziele
      for (const w of TISCH.waende) {
        if (w.stil !== 'ziel') continue;
        const unten_ = w.art === 'fziel' && st.fall[w.id];
        ctx.beginPath();
        ctx.moveTo(w.ax, w.ay + 1);
        ctx.lineTo(w.bx, w.by - 1);
        ctx.lineCap = 'butt';
        if (w.art === 'fziel') {
          ctx.strokeStyle = unten_ ? 'rgba(242, 194, 48, .25)' : '#F2C230';
          ctx.lineWidth = unten_ ? 1 : 3;
        } else {
          ctx.strokeStyle = st.mziele[w.id] ? '#9CCBFF' : '#3E7BFA';
          ctx.lineWidth = 3;
        }
        ctx.stroke();
        ctx.lineCap = 'round';
      }
    }

    function bumperMalen(ctx, st) {
      const farbe = STUFEN[st.stufe];
      BUMPER.forEach((c, i) => {
        const an = blitz.bumper[i] > 0;
        ctx.beginPath();
        ctx.arc(c.x, c.y, BUMPER_R + (an ? 1 : 0), 0, Math.PI * 2);
        ctx.fillStyle = an ? '#FFFFFF' : farbe;
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = '#F4F6FF';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = '#10143A';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = an ? '#FFFFFF' : farbe;
        ctx.fill();
      });
    }

    function klappenMalen(ctx, st) {
      KLAPPEN.forEach((F, j) => {
        const f = klappen[j];
        const tx = F.x + F.s * KL_LAENGE * Math.cos(f.a);
        const ty = F.y + KL_LAENGE * Math.sin(f.a);
        const nx = -(ty - F.y) / KL_LAENGE;
        const ny = (tx - F.x) / KL_LAENGE;
        ctx.beginPath();
        ctx.arc(F.x, F.y, KL_R_ACHSE, 0, Math.PI * 2);
        ctx.arc(tx, ty, KL_R_SPITZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(F.x + nx * KL_R_ACHSE, F.y + ny * KL_R_ACHSE);
        ctx.lineTo(tx + nx * KL_R_SPITZE, ty + ny * KL_R_SPITZE);
        ctx.lineTo(tx - nx * KL_R_SPITZE, ty - ny * KL_R_SPITZE);
        ctx.lineTo(F.x - nx * KL_R_ACHSE, F.y - ny * KL_R_ACHSE);
        ctx.closePath();
        ctx.fillStyle = st.tilt ? '#6B7394' : '#F1F4FF';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(F.x, F.y, KL_R_ACHSE, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tx, ty, KL_R_SPITZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#E5484D';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(F.x + nx * (KL_R_ACHSE - 1.5), F.y + ny * (KL_R_ACHSE - 1.5));
        ctx.lineTo(tx + nx * 0.8, ty + ny * 0.8);
        ctx.stroke();
        ctx.fillStyle = '#10143A';
        ctx.beginPath();
        ctx.arc(F.x, F.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function federMalen(ctx, st) {
      const oben = FEDER_Y + R + (st.kugel.ort === 'feder' ? FEDER_WEG * st.zug : 0);
      ctx.strokeStyle = '#8C9CC4';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      const windungen = 5;
      const h = (TISCH_H - oben - 2) / windungen;
      ctx.moveTo(FEDER_X, oben + 2);
      for (let i = 0; i < windungen; i += 1) {
        ctx.lineTo(FEDER_X + (i % 2 ? -4 : 4), oben + 2 + h * (i + 0.5));
      }
      ctx.lineTo(FEDER_X, TISCH_H);
      ctx.stroke();
      ctx.fillStyle = '#E5484D';
      Echtzeit.rund(ctx, FEDER_X - 5, oben, 10, 2.6, 1);
      ctx.fill();
    }

    function kugelMalen(ctx, x, y, r) {
      const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.15, x, y, r);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(0.45, '#C9CFDD');
      g.addColorStop(1, '#5B6275');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function rampeMalen(ctx, st) {
      const P = RAMPE_PFAD;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const seite of [-1, 1]) {
        ctx.beginPath();
        P.forEach((p, i) => {
          const q = P[Math.min(P.length - 1, i + 1)];
          const o = P[Math.max(0, i - 1)];
          const dx = q[0] - o[0];
          const dy = q[1] - o[1];
          const l = Math.hypot(dx, dy) || 1;
          const x = p[0] - (dy / l) * 4.8 * seite;
          const y = p[1] + (dx / l) * 4.8 * seite;
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        });
        ctx.strokeStyle = 'rgba(214, 226, 255, .62)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      const L = TISCH.pfadLaenge;
      ctx.strokeStyle = 'rgba(214, 226, 255, .3)';
      ctx.lineWidth = 0.8;
      for (let w = 6; w < L[L.length - 1]; w += 9) {
        const [x, y, rx, ry] = aufRampe(w);
        ctx.beginPath();
        ctx.moveTo(x + ry * 4.8, y - rx * 4.8);
        ctx.lineTo(x - ry * 4.8, y + rx * 4.8);
        ctx.stroke();
      }
      ctx.restore();
      if (st.kugel.ort === 'rampe') {
        // Die Kugel fährt oben: größer und mit Schatten, damit man es sieht.
        ctx.fillStyle = 'rgba(0, 0, 0, .35)';
        ctx.beginPath();
        ctx.arc(st.kugel.x + 2.5, st.kugel.y + 3, R, 0, Math.PI * 2);
        ctx.fill();
        kugelMalen(ctx, st.kugel.x, st.kugel.y, R * 1.25);
      }
    }

    function anzeigeMalen(ctx, st) {
      ctx.fillStyle = '#05060F';
      ctx.fillRect(0, TISCH_H, B, H - TISCH_H);
      ctx.fillStyle = '#0B1A2E';
      Echtzeit.rund(ctx, 4, TISCH_H + 3, B - 8, H - TISCH_H - 6, 2);
      ctx.fill();
      ctx.strokeStyle = '#1E3A5C';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      const text = stand.zustand === 'vorbei' ? 'Spiel vorbei' : anzeigeText(st);
      const tank = !!st.mission;
      const breite = B - 16 - (tank ? 30 : 0);
      ctx.font = '500 8px "DM Mono", ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = text === 'TILT' ? '#FF6B6B' : '#5FE3FF';
      const w = ctx.measureText(text).width;
      ctx.save();
      ctx.translate(9, TISCH_H + 10.5);
      if (w > breite) ctx.scale(breite / w, 1);
      ctx.fillText(text, 0, 0);
      ctx.restore();
      if (tank) {
        for (let i = 0; i < TANK; i += 1) {
          ctx.fillStyle = i < st.treibstoff ? '#FF9A3C' : '#2A3A52';
          ctx.fillRect(B - 36 + i * 4.6, TISCH_H + 6.5, 3.2, 8);
        }
      }
    }

    function zeichnen(ctx) {
      const st = stand;
      hintergrund(ctx);
      lichter(ctx, st);
      loecherMalen(ctx, st);
      waendeMalen(ctx, st);
      bumperMalen(ctx, st);
      klappenMalen(ctx, st);
      federMalen(ctx, st);

      const k = st.kugel;
      if (k.ort === 'frei' || k.ort === 'feder') {
        kugelMalen(ctx, k.x, k.y, R);
      } else if (k.ort === 'loch') {
        // Erst sinkt sie ins Loch, dann taucht sie am Ziel wieder auf.
        const imZiel = k.t < 0.45;
        const l = LOECHER[imZiel ? k.ziel : k.loch];
        const groesse = imZiel ? 1 - k.t / 0.45 : (k.t - 0.45) / 0.45;
        if (groesse > 0.05) kugelMalen(ctx, l.x, l.y, R * groesse);
      }
      rampeMalen(ctx, st);

      if (st.tilt) {
        ctx.save();
        ctx.globalAlpha = blinkt(st, 2) ? 0.9 : 0.45;
        ctx.fillStyle = '#FF4D4D';
        ctx.font = '800 34px "Bricolage Grotesque", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TILT', 94, 250);
        ctx.restore();
      }
      anzeigeMalen(ctx, st);
      kopfNachziehen();
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Die Kugel liegt rechts auf der Feder. Die rechte Hälfte des Feldes halten spannt sie, loslassen schießt – je länger gehalten, desto kräftiger. Rollt ein sanfter Schuss durch die blinkende Bahn oben, ist das ein Geschicktreffer.'));
      d.append(el('p', 'notiz', 'Dann bedient ein Tipp auf die linke Hälfte den linken Flipper, auf die rechte den rechten; halten hält ihn oben. Am Rechner: Z oder Umschalt links, / oder - oder Umschalt rechts, Leertaste für die Feder. X, Punkt und Pfeil hoch rütteln am Tisch – dreimal kurz hintereinander ist TILT, und die Flipper sind bis zur nächsten Kugel tot.'));
      d.append(el('p', 'notiz', 'Missionen: Triff die drei blauen Missionsziele links, dann nimm die Startrampe – sie nimmt die Mission an und tankt voll. Was zu tun ist, steht unten in der Anzeige. Während einer Mission sinkt der Treibstoff; Rampe und Bahnen oben füllen nach. Ist er leer, bricht die Mission ab.'));
      d.append(el('p', 'notiz', 'Zwei erfüllte Missionen bringen einen Rang höher, vom Kadetten bis zum Flottenadmiral. Kapitän und Kommodore bringen je eine Extrakugel.'));
      d.append(el('p', 'notiz', 'Leuchten alle drei Bahnen oben, werden die Bumper stärker; ein Flipperdruck schiebt die Lichter weiter. Die gelben Warnziele rechts machen den Rückstoß in beiden Außenbahnen scharf. Fünf Umläufe links sind ein Hyperraumsprung.'));
      d.append(el('p', 'notiz', 'Das Schwarze Loch am Ende der linken Gasse lässt ein Wurmloch leuchten; seine Farbe steht auch in der Mitte. Jedes Wurmloch schickt die Kugel dorthin, und das Licht geht aus; wer das leuchtende selbst trifft, bekommt eine Kugelrettung. In den ersten zehn Sekunden nach dem ersten Abschuss ist jede Kugel ohnehin einmal gerettet.'));
      s.blatt({ titel: 'Flipper', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    anzeigen();

    return {
      ende: () => {
        b.ende();
        klang.ende();
        sichern();
      },
    };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien) {
    const z = Echtzeit.zahl;
    const best = partien.reduce((h, p) => Math.max(h, z(p.punkte)), 0);
    const schnitt = partien.length ? partien.reduce((sum, p) => sum + z(p.punkte), 0) / partien.length : 0;
    const rang = partien.reduce((h, p) => Math.max(h, Math.min(RAENGE.length - 1, Math.floor(z(p.rang)))), 0);
    return [
      { wert: zahlText(best), label: 'Bestwert' },
      { wert: zahlText(schnitt), label: 'Punkte im Schnitt' },
      { wert: partien.length ? RAENGE[Math.max(0, rang)] : '–', label: 'höchster Rang' },
    ];
  }

  Rahmen.anmelden({
    id: 'pinball',
    name: 'Flipper',
    gruppe: 'geschick',
    unter: 'Feder, Rampe, Wurmloch. Vom Kadetten zum Flottenadmiral.',
    farbe: '#5B4BD6',
    symbol: '<circle cx="15.5" cy="6.5" r="2.5"/><path d="M4 19l6-3M20 19l-6-3M4 4v9M20 4v15" stroke-linecap="round"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
