/* Riegel – den richtigen Riegel zuerst ziehen.

   Das Rätsel aus der Werbung, die nie das Spiel zeigt, für das sie wirbt: Ein
   Held will zur Truhe, und dazwischen liegen Kammern mit Wasser, Lava, Gold
   und Steinen, getrennt durch Riegel. Wer zieht, lässt los, was dahinter
   liegt. Der Held läuft von selbst los, sobald der Weg frei ist – und schaut
   nicht, wohin er tritt.

   Die Regeln gelten für alle gleich, damit man sie sich merken kann:

   * Lava verbrennt jeden, der sie berührt, und schmilzt Gold.
   * Wasser löscht Lava zu Stein. Wasser selbst tut niemandem etwas.
   * Fallende Steine erschlagen jeden, auf den sie fallen – Held wie
     Ungeheuer. Liegende Steine sind nur Boden. Gold fällt harmlos.
   * Das Ungeheuer läuft auf den Helden zu und frisst ihn, wenn es ihn
     erreicht. Töten muss man es nur, wenn es sonst an ihn herankommt.
   * Beide steigen über Schutt bis zwei Zellen hoch, Wände erklimmen sie nicht.

   Gewonnen ist, sobald der Held die Truhe berührt. Gold, das er unterwegs
   einsammelt, gibt Sterne.

   Die Welt ist ein Raster aus Zellen, und jede Regel darin ist ohne Zufall:
   Wer dieselben Riegel in derselben Reihenfolge zieht, sieht immer dasselbe.
   Darauf baut dreierlei:

   * Ein Riegel lässt sich nur ziehen, wenn alles zur Ruhe gekommen ist. Wer
     vorher tippt, merkt ihn vor. So hängt nichts davon ab, wie schnell der
     Finger ist – es ist ein Rätsel, kein Geschicklichkeitsspiel.
   * Gespeichert werden nur Level und gezogene Riegel. Nach dem Neuladen
     rechnet das Spiel die Züge nach und steht genau da, wo es war.
   * Der Hinweis schaut nicht in eine Lösung – es gibt keine gespeicherte. Er
     probiert von der aktuellen Lage aus jeden Riegel durch und sagt, was
     passieren würde.

   Die Level stehen unten als Karten aus Kacheln; jede Kachel wird zu 3 × 3
   Zellen. Zeichen: # Fels  . Luft  ~ Wasser  ^ Lava  $ Gold  o Stein
   = Riegel waagerecht  | Riegel senkrecht  H Held  M Ungeheuer  T Truhe. Eine
   Reihe von = oder | am Stück ist ein Riegel, ein Block H, M oder T eine
   Figur. */

(() => {
  const SPALTEN = 15;
  const ZEILEN = 24;
  const K = 3;                    // Zellen je Kachel
  const W = SPALTEN * K;
  const HH = ZEILEN * K;
  const Z = 4;                    // logische Einheiten je Zelle
  const B = W * Z;
  const H = HH * Z;

  const LUFT = 0;
  const FELS = 1;
  const RIEGEL = 2;
  const WASSER = 3;
  const LAVA = 4;
  const GOLD = 5;
  const STEIN = 6;
  const FIGUR = 7;
  const TRUHE = 8;

  const SATZ = 2;                 // Levelsatz: Siege aus einem früheren zählen nicht als gelöst
  const TREFFER_TOT = 6;          // so viele fallende Steinzellen hält ein Kopf aus
  const SAMMELN = 6;              // Gold in diesem Abstand zum Helden gehört ihm – zwei Kacheln
  const STUFE = K;                // eine Kachel steigen Figuren hinauf, eine Wand von zwei nicht
  const RUHE = 6;                 // Takte ohne Änderung: Lava zieht jeden 2., Figuren jeden 3.
  const HOECHSTENS = 6000;        // Takte, nach denen eine Welt als ruhig gilt, was auch passiert

  /* ------------------------------------------------------------ Level */

  const LEVEL = [
    {
      name: 'Die Tür',
      text: 'Tipp auf den Riegel. Dann läuft der Held los – zur Truhe.',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '#......|......#',
        '#.HH...|......#',
        '#.HH...|....TT#',
        '#.HH...|..$$TT#',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Nicht der da',
      text: 'Nur ein Riegel hilft. Der andere lässt Lava los.',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '########^^^####',
        '########^^^####',
        '########===####',
        '#......|......#',
        '#.HH...|......#',
        '#.HH...|....TT#',
        '#.HH...|..$$TT#',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Das Ungeheuer',
      text: 'Das Ungeheuer frisst den Helden, wenn es ihn erreicht.',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '######oo#######',
        '######oo#######',
        '######==#######',
        '#....|........#',
        '#HH..|MM......#',
        '#HH..|MM....TT#',
        '#HH..|MM....TT#',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Erst löschen',
      text: 'Über Lava kommt der Held nicht. Über Stein schon.',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '#####~~########',
        '#####~~#^^#####',
        '#####~~#^^#####',
        '#####==#==#####',
        '#..|..........#',
        '#HH|..........#',
        '#HH|........TT#',
        '#HH|......$.TT#',
        '#####^^^^######',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Steinschlag',
      text: 'Fallende Steine erschlagen jeden – auch den Helden.',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '#oo#oo#########',
        '#oo#oo#########',
        '#==#==#########',
        '#..|..........#',
        '#HH|MM........#',
        '#HH|MM......TT#',
        '#HH|MM....$$TT#',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Die Grube',
      text: 'Das Ungeheuer schaut nicht, wohin es tritt.',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '#####~~########',
        '#####~~########',
        '#####==########',
        '#..|....|.....#',
        '#HH|....|MM...#',
        '#HH|....|MM$TT#',
        '#HH|....|MM$TT#',
        '#####^^########',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Tief gefallen',
      text: 'Der Held fällt tief, aber weich – nur nicht in Lava.',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '#....#..#######',
        '#.HH.#~~#######',
        '#.HH.#~~#######',
        '#.HH.#~~#######',
        '#====#==#######',
        '#.............#',
        '#.............#',
        '#..........TT.#',
        '#.....$....TT.#',
        '#^^^^##########',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Schatzregen',
      text: 'Die Truhe allein gibt einen Stern. Das Gold unterwegs die anderen.',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '#####$$#~~#####',
        '#####$$#~~#####',
        '#####==#==#####',
        '#..|..........#',
        '#HH|..........#',
        '#HH|........TT#',
        '#HH|........TT#',
        '#####^^########',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Falltür',
      text: 'Manchmal muss zuerst der Boden weg.',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '####~~#########',
        '####~~#########',
        '####==#########',
        '#..|..........#',
        '#HH|MM........#',
        '#HH|MM......TT#',
        '#HH|MM..$...TT#',
        '####==#########',
        '####^^#########',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Steinbrücke',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '#####oo#^^#####',
        '#####oo#^^#####',
        '#####==#==#####',
        '#..|..........#',
        '#HH|..........#',
        '#HH|........TT#',
        '#HH|......$.TT#',
        '#####..########',
        '#####..########',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Dammbruch',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '#########~~~###',
        '#########~~~###',
        '#########===###',
        '#..|....|.....#',
        '#HH|....|.....#',
        '#HH|....|...TT#',
        '#HH|.$$.|^^^TT#',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Doppeldecker',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '#HH############',
        '#HH####oo######',
        '#HH####oo######',
        '#==####==######',
        '#.....#.......#',
        '#.....|.......#',
        '#.....|MM.....#',
        '#.....|MM...TT#',
        '#.....|MM.$$TT#',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Zwei Gruben',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '####~~#~~######',
        '####~~#~~######',
        '####==#==######',
        '#..|.....|....#',
        '#HH|.....|MM..#',
        '#HH|.....|MMTT#',
        '#HH|.....|MMTT#',
        '####^^#^^######',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Goldader',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '#####$$#~~|..##',
        '#####$$#~~|..##',
        '#####==#==#..##',
        '#####..#..#..##',
        '#####..#..#..##',
        '#..|.......####',
        '#HH|..........#',
        '#HH|........TT#',
        '#HH|........TT#',
        '#####^^########',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Treppab',
      karte: [
        '###############',
        '###############',
        '########~~#####',
        '#..|...#~~#####',
        '#HH|...#~~#####',
        '#HH|...#==#####',
        '#HH|...#..#####',
        '#####==#..#####',
        '#........#....#',
        '#........|....#',
        '#........|MM..#',
        '#........|MMTT#',
        '#.......$|MMTT#',
        '#####^^########',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Pfropfen',
      karte: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '######oo#..#~~#',
        '######oo#^^#~~#',
        '######==#==#==#',
        '#..|....|.....#',
        '#HH|....|MM...#',
        '#HH|....|MM.TT#',
        '#HH|.....MM.TT#',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
    {
      name: 'Drei Etagen',
      karte: [
        '###############',
        '###############',
        '#..|..#~~######',
        '#HH|..#~~#oo###',
        '#HH|..#~~#oo###',
        '#HH|..#==#==###',
        '####==#..#..###',
        '#...........###',
        '#...........###',
        '#...........###',
        '#......$....###',
        '####^^####==###',
        '##########....#',
        '##########MM..#',
        '##########MMTT#',
        '##########MMTT#',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
  ];

  /* --------------------------------------------------------- Aufbauen */

  const ZEICHEN = { '#': FELS, '.': LUFT, '~': WASSER, '^': LAVA, '$': GOLD, o: STEIN, '=': LUFT, '|': LUFT, H: LUFT, M: LUFT, T: LUFT };

  /** Zusammenhängende Blöcke eines Zeichens als Kästen in Zellen. */
  function bloecke(karte, ch) {
    const aus = [];
    const gesehen = new Set();
    for (let ty = 0; ty < ZEILEN; ty += 1) {
      for (let tx = 0; tx < SPALTEN; tx += 1) {
        if (karte[ty][tx] !== ch || gesehen.has(ty * SPALTEN + tx)) continue;
        let x0 = tx; let x1 = tx; let y0 = ty; let y1 = ty;
        const stapel = [[tx, ty]];
        gesehen.add(ty * SPALTEN + tx);
        while (stapel.length) {
          const [x, y] = stapel.pop();
          x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
          for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
            if (nx < 0 || ny < 0 || nx >= SPALTEN || ny >= ZEILEN || karte[ny][nx] !== ch || gesehen.has(ny * SPALTEN + nx)) continue;
            gesehen.add(ny * SPALTEN + nx);
            stapel.push([nx, ny]);
          }
        }
        aus.push({ x: x0 * K, y: y0 * K, w: (x1 - x0 + 1) * K, h: (y1 - y0 + 1) * K });
      }
    }
    return aus;
  }

  function bauen(level) {
    const karte = level.karte;
    const zellen = new Uint8Array(W * HH);
    for (let ty = 0; ty < ZEILEN; ty += 1) {
      for (let tx = 0; tx < SPALTEN; tx += 1) {
        const m = ZEICHEN[karte[ty][tx]];
        for (let dy = 0; dy < K; dy += 1) for (let dx = 0; dx < K; dx += 1) zellen[(ty * K + dy) * W + tx * K + dx] = m;
      }
    }

    // Riegel: Läufe von = in einer Zeile, von | in einer Spalte. Der Riegel ist
    // eine Zelle dick. Waagerecht liegt er in der obersten Zellreihe seiner
    // Kacheln, bündig mit dem Fels daneben: In der Mitte ließ er darüber eine
    // Rinne, in der Lava liegen blieb, und Figuren sackten eine Zelle ab und
    // blieben dann an der Felskante hängen. Senkrecht liegt er in der Mitte.
    const laeufe = [];
    for (let ty = 0; ty < ZEILEN; ty += 1) {
      for (let tx = 0; tx < SPALTEN; tx += 1) {
        if (karte[ty][tx] === '=' && (tx === 0 || karte[ty][tx - 1] !== '=')) {
          let e = tx;
          while (e + 1 < SPALTEN && karte[ty][e + 1] === '=') e += 1;
          laeufe.push({ waagerecht: true, tx0: tx, ty0: ty, tx1: e, ty1: ty });
        }
        if (karte[ty][tx] === '|' && (ty === 0 || karte[ty - 1][tx] !== '|')) {
          let e = ty;
          while (e + 1 < ZEILEN && karte[e + 1][tx] === '|') e += 1;
          laeufe.push({ waagerecht: false, tx0: tx, ty0: ty, tx1: tx, ty1: e });
        }
      }
    }
    laeufe.sort((a, b) => a.ty0 - b.ty0 || a.tx0 - b.tx0);
    const riegel = laeufe.map((l, i) => {
      const r = Object.assign({ nr: i + 1, zellen: [], gezogen: false }, l);
      if (l.waagerecht) {
        const y = l.ty0 * K;
        for (let x = l.tx0 * K; x < (l.tx1 + 1) * K; x += 1) r.zellen.push(y * W + x);
        // Der Griff sitzt auf der Seite, die näher am Rand liegt – dort, wo man ihn herauszöge.
        r.griff = l.tx0 <= SPALTEN - 1 - l.tx1 ? -1 : 1;
      } else {
        const x = l.tx0 * K + 1;
        for (let y = l.ty0 * K; y < (l.ty1 + 1) * K; y += 1) r.zellen.push(y * W + x);
        r.griff = -1;
      }
      for (const p of r.zellen) zellen[p] = RIEGEL;
      return r;
    });
    // Zwei Griffe übereinander sind nicht zu treffen – wo einer auf einem
    // früheren läge, wandert er ans andere Ende; bei Türen nach unten.
    const griffBei = (r) => (r.waagerecht
      ? [r.griff < 0 ? r.tx0 * K * Z - 4.5 : (r.tx1 + 1) * K * Z + 4.5, r.ty0 * K * Z + Z / 2]
      : [(r.tx0 * K + 1.5) * Z, r.griff < 0 ? r.ty0 * K * Z - 4.5 : (r.ty1 + 1) * K * Z + 4.5]);
    riegel.forEach((r, i) => {
      const [x, y] = griffBei(r);
      if (riegel.slice(0, i).some((o) => { const [ox, oy] = griffBei(o); return Math.hypot(ox - x, oy - y) < 12; })) r.griff = -r.griff;
    });

    // Der Held zuerst – auf ihn beziehen sich alle anderen.
    const neu = (art) => (k) => Object.assign(k, { art, lebt: true, treffer: 0, wie: null, blick: 1, gang: 0, kante: null });
    const figuren = [...bloecke(karte, 'H').map(neu('held')), ...bloecke(karte, 'M').map(neu('ungeheuer'))];
    const truhe = bloecke(karte, 'T')[0] || null;

    let gold = 0;
    for (const m of zellen) if (m === GOLD) gold += 1;

    const w = {
      zellen,
      riegel,
      figuren,
      truhe,
      gewonnen: false,
      stempel: new Uint32Array(W * HH),
      takt: 0,
      ruhig: 0,
      gold: { gesamt: gold, gesammelt: 0, verbrannt: 0 },
      ereignisse: neueEreignisse(),
      effekte: null,
    };
    for (const f of figuren) stempeln(w, f, FIGUR);
    if (truhe) stempeln(w, truhe, TRUHE);
    laufen(w);
    w.ereignisse = neueEreignisse();
    return w;
  }

  const neueEreignisse = () => ({ stein: 0, gesammelt: 0, verbrannt: 0, tote: [], gelaufen: 0, truhe: false });

  function kopie(w) {
    return {
      zellen: w.zellen.slice(),
      riegel: w.riegel.map((r) => Object.assign({}, r)),
      figuren: w.figuren.map((f) => Object.assign({}, f)),
      truhe: w.truhe,
      gewonnen: w.gewonnen,
      stempel: new Uint32Array(W * HH),
      takt: w.takt,
      ruhig: w.ruhig,
      gold: Object.assign({}, w.gold),
      ereignisse: neueEreignisse(),
      effekte: null,
    };
  }

  function stempeln(w, f, m) {
    for (let y = f.y; y < f.y + f.h; y += 1) for (let x = f.x; x < f.x + f.w; x += 1) w.zellen[y * W + x] = m;
  }

  /* Was geschieht, fürs Bild: Dampf, Funken, Münzen, Tod, Truhe. Nur die
     sichtbare Welt sammelt das – der Löser rechnet ohne. */
  const effekt = (w, e) => { if (w.effekte) w.effekte.push(e); };

  /* ------------------------------------------------------------ Regeln */

  const weich = (m) => m === LUFT || m === WASSER || m === LAVA;

  function tauschen(w, a, b, marke) {
    const z = w.zellen;
    const t = z[a];
    z[a] = z[b];
    z[b] = t;
    w.stempel[a] = marke;
    w.stempel[b] = marke;
  }

  function figurBei(w, x, y) {
    return w.figuren.find((f) => f.lebt && x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h);
  }

  /* Körner – Gold und Stein – fallen, rutschen schräg ab und sinken durch
     Flüssiges. Schräg nur, wenn auch die Zelle daneben frei ist: sonst
     schlüpften sie durch eine Ecke zwischen zwei Felsen. */
  function koerner(w, x, y, d, marke) {
    const z = w.zellen;
    const p = y * W + x;
    if (y + 1 >= HH) return false;
    if (weich(z[p + W])) {
      tauschen(w, p, p + W, marke);
      // Ein Stein trifft, wenn er auf einer Figur landet – direkt oder auf dem
      // Haufen, der schon auf ihr liegt. Nur die erste Lage zu zählen hieß,
      // dass ein Kopf, schmaler als der Steinregen, jeden Steinschlag überlebte.
      if (z[p + W] === STEIN) {
        let yy = y + 2;
        while (yy < HH && yy - y < 12 && z[yy * W + x] === STEIN) yy += 1;
        if (yy < HH && z[yy * W + x] === FIGUR) {
          const f = figurBei(w, x, yy);
          if (f) f.treffer += 1;
        }
      }
      return true;
    }
    for (const dd of [d, -d]) {
      const nx = x + dd;
      if (nx < 0 || nx >= W) continue;
      if (weich(z[p + dd]) && weich(z[p + W + dd])) {
        tauschen(w, p, p + W + dd, marke);
        return true;
      }
    }
    return false;
  }

  /* Flüssiges fällt, und wo es nicht fallen kann, geht es seitwärts – aber
     nur in Richtung einer Stelle, an der es weiter fallen kann. Ohne diese
     Bedingung wanderten die letzten Tropfen auf einer Fläche ewig hin und
     her, und die Welt käme nie zur Ruhe. So endet jede Bewegung in einem
     Fall, und irgendwann gibt es keinen mehr.
     Über freie Zellen springt es mehrere auf einmal: Ein letzter Tropfen, der
     Zelle für Zelle zur fernen Kante kröche, hielt die Welt sonst noch
     Sekunden nach dem Entscheidenden in Bewegung. */
  function fliessen(w, x, y, d, marke) {
    const z = w.zellen;
    const p = y * W + x;
    if (y + 1 >= HH) return false;
    if (z[p + W] === LUFT) { tauschen(w, p, p + W, marke); return true; }
    for (const dd of [d, -d]) {
      const nx = x + dd;
      if (nx >= 0 && nx < W && z[p + dd] === LUFT && z[p + W + dd] === LUFT) {
        tauschen(w, p, p + W + dd, marke);
        return true;
      }
    }
    // Über der anderen Flüssigkeit zu stehen zählt wie Fallen: Dort wird sie
    // gelöscht. Sonst bliebe Wasser neben einem Lavasee auf dem Fels stehen.
    const gegner = z[p] === WASSER ? LAVA : WASSER;
    let best = 0;
    let bestK = Infinity;
    for (const dd of [d, -d]) {
      for (let k = 1; k < bestK; k += 1) {
        const nx = x + dd * k;
        if (nx < 0 || nx >= W || z[y * W + nx] !== LUFT) break;
        const u = z[(y + 1) * W + nx];
        if (u === LUFT || u === gegner) { best = dd; bestK = k; break; }
      }
    }
    if (!best) return false;
    tauschen(w, p, p + best * Math.min(bestK, z[p] === LAVA ? 2 : 4), marke);
    return true;
  }

  function reaktionen(w) {
    const z = w.zellen;
    let etwas = false;
    for (let p = 0; p < z.length; p += 1) {
      if (z[p] !== LAVA) continue;
      const x = p % W;
      const nachbarn = [p - W, p + W, x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1];
      for (const q of nachbarn) {
        if (q < 0 || q >= z.length || z[q] !== GOLD) continue;
        z[q] = LUFT;
        w.gold.verbrannt += 1;
        w.ereignisse.verbrannt += 1;
        effekt(w, { art: 'funke', x: q % W, y: Math.floor(q / W) });
        etwas = true;
      }
      for (const q of nachbarn) {
        if (q < 0 || q >= z.length || z[q] !== WASSER) continue;
        z[p] = STEIN;
        z[q] = LUFT;
        w.ereignisse.stein += 1;
        effekt(w, { art: 'dampf', x: q % W, y: Math.floor(q / W) });
        etwas = true;
        break;
      }
    }
    return etwas;
  }

  const held = (w) => w.figuren[0];

  function sterben(w, f, wie) {
    f.lebt = false;
    f.wie = wie;
    stempeln(w, f, LUFT);
    w.ereignisse.tote.push({ art: f.art, wie });
    effekt(w, { art: 'tod', figur: w.figuren.indexOf(f), wie });
  }

  const durchlaessig = (m) => m === LUFT || m === WASSER || m === LAVA;

  /* Eine Figur um (dx, dy) versetzen. Wasser und Lava, die im Weg stehen,
     tauschen den Platz mit ihr und landen in den Zellen, die sie frei macht –
     so watet sie durch Wasser und sinkt in Lava ein, ohne dass ein Tropfen
     verloren geht. Liefert false, wenn Festes im Weg ist. */
  function versetzen(w, f, dx, dy, schieben) {
    const z = w.zellen;
    const nx = f.x + dx;
    const ny = f.y + dy;
    if (nx < 0 || ny < 0 || nx + f.w > W || ny + f.h > HH) return false;
    const drin = (x, y, kx, ky) => x >= kx && x < kx + f.w && y >= ky && y < ky + f.h;
    const verdraengt = [];
    for (let y = ny; y < ny + f.h; y += 1) {
      for (let x = nx; x < nx + f.w; x += 1) {
        if (drin(x, y, f.x, f.y)) continue;
        const m = z[y * W + x];
        if (!durchlaessig(m) && !(schieben && (m === STEIN || m === GOLD))) return false;
        if (m !== LUFT) verdraengt.push(m);
      }
    }
    const frei = [];
    for (let y = f.y; y < f.y + f.h; y += 1) {
      for (let x = f.x; x < f.x + f.w; x += 1) if (!drin(x, y, nx, ny)) frei.push(y * W + x);
    }
    stempeln(w, f, LUFT);
    f.x = nx;
    f.y = ny;
    stempeln(w, f, FIGUR);
    verdraengt.forEach((m, i) => { z[frei[i]] = m; });
    return true;
  }

  /** Wie viele Zellen unter der Figur tragen, und wo sie im Schnitt liegen. */
  function traeger(w, f) {
    const boden = f.y + f.h;
    if (boden >= HH) return { n: f.w, mitte: f.x + f.w / 2 };
    let n = 0;
    let summe = 0;
    for (let x = f.x; x < f.x + f.w; x += 1) if (!durchlaessig(w.zellen[boden * W + x])) { n += 1; summe += x; }
    return { n, mitte: n ? summe / n : 0 };
  }

  /* Ein Schritt zur Seite: eine Kachel hoch steigt jeder, höheren Fels nicht.
     Losen Schutt schiebt er beiseite – die Steine landen in den Zellen, die er
     hinter sich frei macht, und fallen dort herunter. Klettern allein reichte
     nicht: Zwei Kammern Steine türmen sich höher, als ein Gang Luft über dem
     Kopf hat, und der Held stand oben auf dem Haufen und kam nicht weiter. */
  function schreiten(w, f, r) {
    for (let k = 0; k <= STUFE; k += 1) {
      if (versetzen(w, f, r, -k, true)) return true;
    }
    return false;
  }

  /* Held und Ungeheuer, jeden dritten Takt: fallen, laufen, abrutschen.

     Der Held läuft zur Truhe, das Ungeheuer zum Helden – bis es unter oder
     über ihm steht. Wer nur noch mit einem Drittel seiner Breite aufsteht und
     nicht weiterlaufen kann, rutscht zur freien Seite ab; sonst hielte eine
     einzige Felszelle ein Ungeheuer über der Falltür. Auf eine Kante, die eine
     Figur selbst betreten hat, rutscht sie aber nicht zurück: Sie wäre
     hinaufgestiegen, zurückgerutscht und wieder hinaufgestiegen, und die
     Welt wäre nie zur Ruhe gekommen. */
  function figurenSchritt(w) {
    let etwas = false;
    const h = held(w);
    for (const f of w.figuren) {
      if (!f.lebt || (f === h && w.gewonnen)) continue;
      const t = traeger(w, f);
      if (!t.n) {
        if (versetzen(w, f, 0, 1)) { etwas = true; f.kante = null; }
        continue;
      }
      let ziel = null;
      if (f === h) {
        if (w.truhe) ziel = w.truhe.x + w.truhe.w / 2;
      } else if (h && h.lebt && !w.gewonnen && !(f.x < h.x + h.w && h.x < f.x + f.w)) {
        ziel = h.x + h.w / 2;
      }
      const r = ziel === null ? 0 : Math.sign(ziel - (f.x + f.w / 2));
      if (r) {
        f.blick = r;
        if (schreiten(w, f, r)) {
          f.gang += 1;
          f.kante = traeger(w, f).n * 3 <= f.w ? f.x + ',' + f.y : null;
          if (f === h) w.ereignisse.gelaufen += 1;
          etwas = true;
          continue;
        }
      }
      if (t.n * 3 <= f.w && f.kante !== f.x + ',' + f.y) {
        if (versetzen(w, f, t.mitte < f.x + f.w / 2 ? 1 : -1, 0)) { etwas = true; f.kante = null; }
      }
    }
    return etwas;
  }

  const beruehrt = (a, b) => a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h;

  function beruehrungen(w) {
    const z = w.zellen;
    let etwas = false;
    const h = held(w);
    for (const f of w.figuren) {
      if (!f.lebt) continue;
      let heiss = false;
      for (let x = f.x; x < f.x + f.w && !heiss; x += 1) {
        if (f.y > 0 && z[(f.y - 1) * W + x] === LAVA) heiss = true;
        if (f.y + f.h < HH && z[(f.y + f.h) * W + x] === LAVA) heiss = true;
      }
      for (let y = f.y; y < f.y + f.h && !heiss; y += 1) {
        if (f.x > 0 && z[y * W + f.x - 1] === LAVA) heiss = true;
        if (f.x + f.w < W && z[y * W + f.x + f.w] === LAVA) heiss = true;
      }
      if (heiss) { sterben(w, f, 'verbrannt'); etwas = true; continue; }
      if (f.treffer >= TREFFER_TOT) { sterben(w, f, 'erschlagen'); etwas = true; }
    }
    if (!h || !h.lebt || w.gewonnen) return etwas;
    for (const f of w.figuren) {
      if (f === h || !f.lebt || !beruehrt(f, h)) continue;
      sterben(w, h, 'gefressen');
      return true;
    }
    for (let y = Math.max(0, h.y - SAMMELN); y < Math.min(HH, h.y + h.h + SAMMELN); y += 1) {
      for (let x = Math.max(0, h.x - SAMMELN); x < Math.min(W, h.x + h.w + SAMMELN); x += 1) {
        if (z[y * W + x] !== GOLD) continue;
        z[y * W + x] = LUFT;
        w.gold.gesammelt += 1;
        w.ereignisse.gesammelt += 1;
        effekt(w, { art: 'muenze', x, y });
        etwas = true;
      }
    }
    if (w.truhe && beruehrt(h, w.truhe)) {
      w.gewonnen = true;
      w.ereignisse.truhe = true;
      effekt(w, { art: 'truhe' });
      etwas = true;
    }
    return etwas;
  }

  function ticken(w) {
    const t = w.takt;
    w.takt += 1;
    const marke = w.takt;
    const z = w.zellen;
    let etwas = false;
    for (let y = HH - 1; y >= 0; y -= 1) {
      // Jede Zeile in wechselnder Richtung, sonst driftete alles nach einer Seite.
      const vonLinks = (y + t) % 2 === 0;
      for (let i = 0; i < W; i += 1) {
        const x = vonLinks ? i : W - 1 - i;
        const p = y * W + x;
        const m = z[p];
        if (m < WASSER || m >= FIGUR || w.stempel[p] === marke) continue;
        if (m === LAVA && t % 2) continue;
        const d = (x * 7 + y * 3 + t) % 2 ? 1 : -1;
        if (m === GOLD || m === STEIN ? koerner(w, x, y, d, marke) : fliessen(w, x, y, d, marke)) etwas = true;
      }
    }
    if (reaktionen(w)) etwas = true;
    if (t % 3 === 0 && figurenSchritt(w)) etwas = true;
    if (beruehrungen(w)) etwas = true;
    w.ruhig = etwas ? 0 : w.ruhig + 1;
  }

  const ruhig = (w) => w.ruhig >= RUHE;
  const heldLebt = (w) => !held(w) || held(w).lebt;
  const entschieden = (w) => !heldLebt(w) || w.gewonnen;

  /* Bis zur Ruhe rechnen – oder bis entschieden ist: Nach Tod oder Truhe
     ändert nichts mehr das Urteil, und die letzten Tropfen brauchen oft noch
     Sekunden. */
  function laufen(w) {
    for (let i = 0; i < HOECHSTENS && !ruhig(w) && !entschieden(w); i += 1) ticken(w);
    if (!entschieden(w)) w.ruhig = Math.max(w.ruhig, RUHE);
  }

  function ziehen(w, nr) {
    const r = w.riegel[nr - 1];
    if (!r || r.gezogen) return false;
    r.gezogen = true;
    for (const p of r.zellen) if (w.zellen[p] === RIEGEL) w.zellen[p] = LUFT;
    w.ruhig = 0;
    return true;
  }

  const offen = (w) => w.riegel.filter((r) => !r.gezogen).map((r) => r.nr);

  /** Ein Stern für die Truhe, einer ab der Hälfte des Goldes, einer ab 90 %. */
  function sterne(w) {
    const g = w.gold;
    if (!g.gesamt) return 3;
    const q = g.gesammelt / g.gesamt;
    return 1 + (q >= 0.5 ? 1 : 0) + (q >= 0.9 ? 1 : 0);
  }

  /* Wie steht es? sieg (mit Sternen), tot, aus (alle Riegel gezogen, keine
     Truhe) oder offen. Mit `wie` als Grund. */
  function urteil(w) {
    const h = held(w);
    if (!h || !h.lebt) return { art: 'tot', wie: h ? h.wie : 'fehlt' };
    if (w.gewonnen) return { art: 'sieg', sterne: sterne(w) };
    if (offen(w).length) return { art: 'offen' };
    return { art: 'aus', wie: 'truhe' };
  }

  /* Fingerabdruck einer ruhenden Welt. Wer zwei Kammern unabhängig
     voneinander öffnet, landet in beiden Reihenfolgen in derselben Lage – die
     muss der Löser nur einmal durchrechnen. Der Takt zählt mit, weil die
     Regeln im Sechsertakt die Richtung wechseln. */
  function schluessel(w) {
    let a = 0x811c9dc5;
    const z = w.zellen;
    for (let i = 0; i < z.length; i += 1) a = Math.imul(a ^ z[i], 16777619);
    let s = (a >>> 0).toString(36) + ':' + (w.takt % 6) + ':' + w.gold.gesammelt;
    for (const f of w.figuren) s += ':' + (f.lebt ? f.x + ',' + f.y + ',' + f.treffer + ',' + f.kante : '-');
    for (const r of w.riegel) s += r.gezogen ? '1' : '0';
    return s;
  }

  /* Von der ruhenden Welt aus die Reihenfolge mit den meisten Sternen suchen.
     Liefert { weg, sterne } oder { gruende } – die Arten, auf die jeder
     Versuch endete. Drei Sterne beenden die Suche. */
  function loesen(w, gemerkt = new Map()) {
    const k = schluessel(w);
    if (gemerkt.has(k)) return gemerkt.get(k);
    const gruende = new Set();
    let best = null;
    for (const nr of offen(w)) {
      const v = kopie(w);
      ziehen(v, nr);
      laufen(v);
      const u = urteil(v);
      let kandidat = null;
      if (u.art === 'sieg') kandidat = { weg: [nr], sterne: u.sterne };
      else if (u.art === 'offen') {
        const weiter = loesen(v, gemerkt);
        if (weiter.weg) kandidat = { weg: [nr, ...weiter.weg], sterne: weiter.sterne };
        else for (const g of weiter.gruende) gruende.add(g);
      } else {
        gruende.add(u.wie);
      }
      if (kandidat && (!best || kandidat.sterne > best.sterne)) best = kandidat;
      if (best && best.sterne === 3) break;
    }
    const ergebnis = best || { gruende };
    gemerkt.set(k, ergebnis);
    return ergebnis;
  }

  /* ------------------------------------------------------------------ Spiel */

  const WASSER_TIEF = ['#8FCDF4', '#5DAEEA', '#4C9EE0', '#408FD4', '#3882C8', '#3176BB', '#2C6BB0', '#2861A5'];
  const LAVA_TIEF = ['#FFC957', '#F9A23B', '#EF7C2E', '#E3602A', '#D44C27', '#C44125'];
  const FARBE = {
    gold: '#E2B01E', goldDunkel: '#C9960F', glanz: '#FFF4B8',
    stein: ['#7B736A', '#8F877D', '#6A635B'],
    held: '#3F6DB3', ruestung: '#B9C2CC', haut: '#F1D2B0', ungeheuer: '#5C9B3A', ungeheuerDunkel: '#3F7426',
    holz: '#8A5A2B', holzHell: '#A36E3A', beschlag: '#E2B01E',
    dunkel: '#2F2721',              // Stiefel, Augen, Griff – in hell und dunkel gleich
  };

  const GRUND = {
    verbrannt: 'die Lava erreicht den Helden',
    gefressen: 'das Ungeheuer erwischt den Helden',
    erschlagen: 'die Steine fallen dem Helden auf den Kopf',
    truhe: 'der Weg zur Truhe bleibt zu',
  };

  /** Derselbe Grund mit dem Verb vorn – für „Danach erreicht die Lava den Helden." */
  const GRUND_DANACH = {
    verbrannt: 'erreicht die Lava den Helden',
    gefressen: 'erwischt das Ungeheuer den Helden',
    erschlagen: 'fallen dem Helden die Steine auf den Kopf',
    truhe: 'bleibt der Weg zur Truhe zu',
  };

  const TITEL = {
    verbrannt: 'Verbrannt.',
    gefressen: 'Gefressen.',
    erschlagen: 'Erschlagen.',
    truhe: 'Kein Weg zur Truhe.',
  };

  const sternText = (n) => '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n);

  function starten(wurzel, s) {
    const el = s.el;
    const siege = () => s.partien().filter((p) => p.gewonnen === true && p.satz === SATZ && Number.isInteger(p.stufe));
    const geloest = () => new Set(siege().map((p) => p.stufe));
    const besteSterne = () => {
      const m = new Map();
      for (const p of siege()) m.set(p.stufe, Math.max(m.get(p.stufe) || 0, Echtzeit.zahl(p.sterne)));
      return m;
    };
    const frei = (i) => {
      const g = geloest();
      // Ein Level darf man überspringen: frei ist alles bis zwei hinter dem
      // höchsten gelösten.
      let hoechstes = 0;
      for (const n of g) hoechstes = Math.max(hoechstes, n);
      return i + 1 <= hoechstes + 2 || g.has(i + 1);
    };

    let stand = laden();
    let welt = null;
    let ende = null;              // { art, wie, sterne } nach Sieg oder Niederlage
    let vorgemerkt = null;
    let zug = null;               // gleitender Riegel fürs Bild
    let angehalten = false;       // Bewegung wurde unterbrochen, nicht beendet
    let seit = Date.now();
    let puls = 0;
    let nachEnde = 0;             // Sekunden seit Tod oder Truhe
    let teilchen = [];
    let todZeit = new Map();      // Figur → Zeitpunkt ihres Todes, fürs Bild
    let gangZeit = new Map();     // Figur → { gang, t } für die Laufbeine
    let muenzTakt = 0;

    function laden() {
      const alt = s.erinnert();
      const ok = alt && alt.satz === SATZ && Number.isInteger(alt.level) && alt.level >= 0 && alt.level < LEVEL.length &&
        Array.isArray(alt.gezogen) && alt.gezogen.every((n) => Number.isInteger(n));
      if (!ok) return frischerStand(ersterOffener());
      return { level: alt.level, gezogen: alt.gezogen.slice(), hilfen: Echtzeit.zahl(alt.hilfen), verbraucht: Echtzeit.zahl(alt.verbraucht), zeige: null };
    }

    function ersterOffener() {
      const g = geloest();
      for (let i = 0; i < LEVEL.length; i += 1) if (!g.has(i + 1)) return i;
      return 0;
    }

    function frischerStand(level) {
      return { level, gezogen: [], hilfen: 0, verbraucht: 0, zeige: null };
    }

    function sichern() {
      const jetzt = Date.now();
      if (!document.hidden && !ende) stand.verbraucht += jetzt - seit;
      seit = jetzt;
      s.merken({ satz: SATZ, level: stand.level, gezogen: stand.gezogen, hilfen: stand.hilfen, verbraucht: stand.verbraucht });
    }

    /* Züge nachrechnen. Ein Stand, der schon entschieden war, beginnt neu:
       Entschiedene Partien stehen in der Statistik, nicht im Spielstand. */
    function aufbauen() {
      welt = bauen(LEVEL[stand.level]);
      for (const nr of stand.gezogen) {
        if (!ziehen(welt, nr)) break;
        laufen(welt);
        if (urteil(welt).art !== 'offen') {
          stand = frischerStand(stand.level);
          welt = bauen(LEVEL[stand.level]);
          break;
        }
      }
      welt.effekte = [];
      ende = null;
      vorgemerkt = null;
      zug = null;
      angehalten = false;
      nachEnde = 0;
      teilchen = [];
      todZeit = new Map();
      gangZeit = new Map();
    }

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const auftrag = el('p', 'notiz ri-auftrag');
    const flaeche = el('div', 'ez-flaeche ri-flaeche');
    const feld = el('div', 'ri-kasten');
    const leiste = el('div', 'leiste');
    const unten = el('div', 'ez-unten');
    flaeche.append(feld);
    wurzel.append(kopf, auftrag, flaeche, leiste, unten);

    const vonVorn = el('button', 'knopf knopf--still', 'Von vorn');
    vonVorn.type = 'button';
    vonVorn.addEventListener('click', () => neu(stand.level));
    const hinweisKnopf = el('button', 'knopf knopf--still', 'Hinweis');
    hinweisKnopf.type = 'button';
    hinweisKnopf.addEventListener('click', hinweis);
    leiste.append(vonVorn, hinweisKnopf);

    aufbauen();
    const b = Echtzeit.buehne(feld, { breite: B, hoehe: H, schritt, zeichnen, beiHalt, takt: 1 / 90 });

    s.werkzeuge([
      { label: 'Anleitung', symbol: Echtzeit.SYMBOL.anleitung, tun: anleitung },
      { label: 'Level wählen', symbol: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>', tun: wahl },
    ]);

    /* ------------------------------------------------------------ Ablauf */

    function tippen(nr) {
      if (ende) return;
      const r = welt.riegel[nr - 1];
      if (!r || r.gezogen) return;
      if (!ruhig(welt) || zug) {
        vorgemerkt = vorgemerkt === nr ? null : nr;
        b.malen();
        if (!b.laeuft) { angehalten = false; b.los(); anzeigen(); }
        return;
      }
      jetztZiehen(nr);
    }

    function jetztZiehen(nr) {
      ziehen(welt, nr);
      welt.ereignisse = neueEreignisse();
      stand.gezogen.push(nr);
      if (stand.zeige === nr) stand.zeige = null;
      vorgemerkt = null;
      zug = { nr, t: 0 };
      angehalten = false;
      sichern();
      anzeigen();
      b.los();
    }

    function schritt(dt) {
      puls += dt;
      if (zug) {
        zug.t += dt;
        if (zug.t > 0.3) zug = null;
      }
      if (!ruhig(welt)) ticken(welt);
      teilchenTakt(dt);
      if (ende) {
        nachEnde += dt;
        // Nach dem Urteil darf die Lava zu Ende fließen und die Truhe glänzen;
        // dann steht die Schleife.
        if (ruhig(welt) && !zug && !teilchen.length && nachEnde > 2) b.halt();
      } else if (entschieden(welt)) {
        nachEnde += dt;
        if (nachEnde > (welt.gewonnen ? 0.7 : 1)) beenden(urteil(welt));
      } else if (ruhig(welt) && !zug && !teilchen.length) {
        zurRuhe();
      }
    }

    function zurRuhe() {
      const u = urteil(welt);
      if (u.art !== 'offen') { beenden(u); return; }
      if (vorgemerkt) { jetztZiehen(vorgemerkt); return; }
      // Der Hinweis pulsiert eine Weile; sonst gibt es nichts zu bewegen.
      if (!stand.zeige || puls > 60) b.halt();
    }

    function beiHalt() {
      if (!ende && (!ruhig(welt) || zug)) angehalten = true;
      puls = 0;
      anzeigen();
      // Nach dem Urteil liegt schon der nächste Stand im Speicher; die
      // auslaufende Lava darf ihn nicht mit dem entschiedenen überschreiben.
      if (!ende) sichern();
    }

    function beenden(u) {
      sichern();
      ende = u;
      nachEnde = 0;
      const partie = { gewonnen: u.art === 'sieg', satz: SATZ, stufe: stand.level + 1, dauer: stand.verbraucht, hilfen: stand.hilfen };
      if (u.art === 'sieg') partie.sterne = u.sterne;
      if (welt.gold.gesamt) partie.gold = Math.round((welt.gold.gesammelt / welt.gold.gesamt) * 100);
      s.notieren(partie);
      // Der nächste Besuch beginnt beim nächsten Level – oder bei diesem, wenn es nicht geklappt hat.
      const naechstes = u.art === 'sieg' && stand.level + 1 < LEVEL.length ? stand.level + 1 : stand.level;
      s.merken({ satz: SATZ, level: naechstes, gezogen: [], hilfen: 0, verbraucht: 0 });
      stand.zeige = null;
      vorgemerkt = null;
      anzeigen();
    }

    function neu(level) {
      stand = frischerStand(level);
      seit = Date.now();
      aufbauen();
      sichern();
      anzeigen();
      b.halt();
      b.malen();
    }

    /* ----------------------------------------------------------- Hinweis */

    function folgen(e) {
      const teile = [];
      if (e.stein) teile.push('Wasser trifft auf Lava und wird zu Stein');
      for (const t of e.tote) {
        if (t.art === 'ungeheuer') teile.push(t.wie === 'verbrannt' ? 'die Lava verbrennt das Ungeheuer' : 'die Steine erschlagen das Ungeheuer');
      }
      if (e.truhe) teile.push('der Held läuft zur Truhe');
      else if (e.gelaufen) teile.push('der Held läuft ein Stück weiter');
      if (e.gesammelt) teile.push('er sammelt Gold ein');
      if (!teile.length) teile.push('noch passiert nichts Entscheidendes, aber der nächste Riegel findet alles bereit');
      return teile;
    }

    const satz = (teile) => {
      if (!teile.length) return '';
      const t = teile.length === 1 ? teile[0] : teile.slice(0, -1).join(', ') + ' und ' + teile[teile.length - 1];
      return t[0].toUpperCase() + t.slice(1) + '.';
    };

    /* Der Hinweis rechnet in den schweren Leveln eine Sekunde und länger. Erst
       die Meldung, dann die Rechnung – sonst friert das Antippen scheinbar ein. */
    let rechnet = false;
    function hinweis() {
      if (ende || rechnet) return;
      if (!ruhig(welt) || zug || teilchen.length) {
        s.toast('Erst wenn alles ruht.');
        return;
      }
      rechnet = true;
      s.toast('Der Hinweis rechnet …');
      const fuer = welt;
      setTimeout(() => {
        rechnet = false;
        if (welt === fuer && !ende && ruhig(welt)) hinweisZeigen();
      }, 40);
    }

    function hinweisZeigen() {
      stand.hilfen += 1;
      sichern();
      const zeilen = [];
      let gut = null;
      const gemerkt = new Map();
      for (const nr of offen(welt)) {
        const v = kopie(welt);
        ziehen(v, nr);
        laufen(v);
        const u = urteil(v);
        const erreichbar = u.art === 'sieg' ? u.sterne : u.art === 'offen' ? loesen(v, gemerkt).sterne : undefined;
        if (erreichbar) {
          if (!gut || erreichbar > gut.sterne) gut = { nr, sterne: erreichbar, folgen: folgen(v.ereignisse) };
          continue;
        }
        if (u.art === 'tot' || u.art === 'aus') {
          zeilen.push('Riegel ' + nr + ' jetzt: ' + GRUND[u.wie] + '.');
        } else {
          const g = [...loesen(v, gemerkt).gruende].map((x) => GRUND_DANACH[x]).filter(Boolean);
          zeilen.push('Riegel ' + nr + ' käme zu früh: Danach ' + (g.length === 1 ? g[0] : 'geht es nicht mehr auf') + '.');
        }
      }

      const d = el('div');
      if (!gut) {
        d.append(el('p', 'notiz', 'Von hier geht es nicht mehr auf.'));
        for (const z of zeilen) d.append(el('p', 'notiz', z));
        s.blatt({ titel: 'Hinweis', inhalt: d, aktionen: [{ text: 'Von vorn', tun: () => neu(stand.level) }, { text: 'Schließen', art: 'still' }] });
        return;
      }
      d.append(el('p', 'notiz', 'Zieh als Nächstes Riegel ' + gut.nr + '. ' + satz(gut.folgen)));
      d.append(el('p', 'notiz', 'Von dort sind noch ' + sternText(gut.sterne) + ' zu holen.'));
      for (const z of zeilen) d.append(el('p', 'notiz', z));
      stand.zeige = gut.nr;
      puls = 0;
      s.blatt({
        titel: 'Hinweis',
        inhalt: d,
        aktionen: [{ text: 'Riegel ' + gut.nr + ' ziehen', tun: () => tippen(gut.nr) }, { text: 'Selbst ziehen', art: 'still', tun: () => { b.los(); } }],
      });
    }

    /* ----------------------------------------------------------- Anzeige */

    function kopfZeichnen() {
      kopf.replaceChildren();
      const l = el('span');
      l.append(document.createTextNode('Level '), el('b', null, String(stand.level + 1)), document.createTextNode(' / ' + LEVEL.length));
      kopf.append(l);
      if (welt.gold.gesamt) {
        const g = el('span');
        g.append(document.createTextNode('Gold '), el('b', null, Math.round((welt.gold.gesammelt / welt.gold.gesamt) * 100) + ' %'));
        kopf.append(g);
      }
      s.unter(LEVEL[stand.level].name);
      auftrag.textContent = LEVEL[stand.level].text ||
        (welt.gold.gesamt ? 'Bring den Helden zur Truhe. Gold unterwegs gibt Sterne.' : 'Bring den Helden zur Truhe.');
    }

    function anzeigen() {
      kopfZeichnen();
      unten.replaceChildren();
      leiste.hidden = !!ende;
      hinweisKnopf.disabled = !!ende;
      if (ende) {
        const sieg = ende.art === 'sieg';
        const titel = sieg ? 'Geschafft. ' + sternText(ende.sterne) : TITEL[ende.wie] || 'Verloren.';
        // Kein Schild übers Feld: Es verschleierte genau das, was man sehen
        // will – die aufgehende Truhe oder die Lava. Das Urteil steht darunter.
        b.schildWeg();
        const nr = stand.level + 1;
        let text;
        if (sieg) {
          text = 'Level ' + nr + ' in ' + s.dauerText(stand.verbraucht) + (stand.hilfen ? ', ' + stand.hilfen + (stand.hilfen === 1 ? ' Hinweis.' : ' Hinweise.') : ', ohne Hinweis.');
          if (ende.sterne < 3) text += ' Mehr Gold unterwegs bringt mehr Sterne.';
        } else {
          text = satz([GRUND[ende.wie] || 'es ging schief']);
        }
        const knoepfe = [];
        if (sieg && stand.level + 1 < LEVEL.length) knoepfe.push({ text: 'Weiter zu Level ' + (nr + 1), tun: () => neu(stand.level + 1) });
        knoepfe.push({ text: sieg ? 'Nochmal' : 'Nochmal versuchen', art: sieg && knoepfe.length ? 'still' : undefined, tun: () => neu(stand.level) });
        if (sieg && stand.level + 1 >= LEVEL.length) knoepfe.push({ text: 'Level wählen', art: 'still', tun: wahl });
        unten.append(Echtzeit.kasten(titel, text, knoepfe));
      } else if (angehalten) {
        b.schild('Angehalten', 'Tippen, dann geht es weiter.');
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
    }

    /* ---------------------------------------------------------- Teilchen */

    function teilchenTakt(dt) {
      if (welt.effekte && welt.effekte.length) {
        const h = held(welt);
        for (const e of welt.effekte.splice(0)) {
          const zx = e.x * Z + Z / 2;
          const zy = e.y * Z + Z / 2;
          if (e.art === 'dampf' && teilchen.length < 220 && (e.x + e.y) % 2 === 0) {
            teilchen.push({ art: 'dampf', x: zx, y: zy, vx: (Math.random() - 0.5) * 8, vy: -14 - Math.random() * 10, r: 1.4 + Math.random() * 1.6, t: 0, dauer: 0.9 + Math.random() * 0.4 });
          } else if (e.art === 'funke' && teilchen.length < 220) {
            teilchen.push({ art: 'funke', x: zx, y: zy, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 25, t: 0, dauer: 0.5 });
          } else if (e.art === 'muenze' && h) {
            // Jede dritte Goldzelle wird eine Münze, sonst flöge ein Schwarm.
            muenzTakt += 1;
            if (muenzTakt % 3 === 0 && teilchen.length < 220) {
              teilchen.push({ art: 'muenze', x: zx, y: zy, x0: zx, y0: zy, t: 0, dauer: 0.42 + Math.random() * 0.1 });
            }
          } else if (e.art === 'tod') {
            todZeit.set(e.figur, puls);
            const f = welt.figuren[e.figur];
            if (f && e.wie === 'verbrannt') {
              for (let i = 0; i < 10; i += 1) {
                teilchen.push({ art: 'rauch', x: (f.x + Math.random() * f.w) * Z, y: (f.y + Math.random() * f.h) * Z, vx: (Math.random() - 0.5) * 6, vy: -10 - Math.random() * 12, r: 2 + Math.random() * 2, t: 0, dauer: 1.2 });
              }
            } else if (f) {
              for (let i = 0; i < 8; i += 1) {
                teilchen.push({ art: 'staub', x: (f.x + Math.random() * f.w) * Z, y: (f.y + f.h) * Z - 1, vx: (Math.random() - 0.5) * 30, vy: -6 - Math.random() * 8, r: 1.5 + Math.random(), t: 0, dauer: 0.7 });
              }
            }
          } else if (e.art === 'truhe' && welt.truhe) {
            const tr = welt.truhe;
            for (let i = 0; i < 16; i += 1) {
              const a = (i / 16) * Math.PI * 2;
              teilchen.push({ art: 'glanz', x: (tr.x + tr.w / 2) * Z, y: (tr.y + tr.h * 0.3) * Z, vx: Math.cos(a) * 26, vy: Math.sin(a) * 26 - 12, t: 0, dauer: 0.9 });
            }
          }
        }
      }
      const h = held(welt);
      for (const p of teilchen) {
        p.t += dt;
        if (p.art === 'muenze') {
          const q = Math.min(1, p.t / p.dauer);
          const zx = h ? (h.x + h.w / 2) * Z : p.x0;
          const zy = h ? (h.y + 2) * Z : p.y0;
          // Im Bogen zum Helden: erst hoch, dann hinein.
          p.x = p.x0 + (zx - p.x0) * q;
          p.y = p.y0 + (zy - p.y0) * q - Math.sin(q * Math.PI) * 10;
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.art === 'funke' || p.art === 'staub' || p.art === 'glanz') p.vy += 60 * dt;
        }
      }
      teilchen = teilchen.filter((p) => p.t < p.dauer);
    }

    function teilchenMalen(ctx, f) {
      for (const p of teilchen) {
        const q = p.t / p.dauer;
        if (p.art === 'dampf' || p.art === 'rauch') {
          ctx.globalAlpha = (1 - q) * (p.art === 'rauch' ? 0.55 : 0.45);
          ctx.fillStyle = p.art === 'rauch' ? f.tinteLeise : f.tinteStill;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (1 + q * 1.5), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.art === 'funke') {
          ctx.globalAlpha = 1 - q;
          ctx.fillStyle = q < 0.4 ? '#FFD66E' : '#F0772E';
          ctx.fillRect(p.x - 0.6, p.y - 0.6, 1.2, 1.2);
        } else if (p.art === 'staub') {
          ctx.globalAlpha = (1 - q) * 0.6;
          ctx.fillStyle = FARBE.stein[1];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.art === 'muenze') {
          ctx.globalAlpha = 1;
          const breite = 1.9 * Math.abs(Math.cos(p.t * 14)) + 0.4;
          ctx.fillStyle = FARBE.goldDunkel;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, breite + 0.4, 2.3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = FARBE.gold;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, breite, 1.9, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.art === 'glanz') {
          ctx.globalAlpha = 1 - q;
          ctx.fillStyle = FARBE.glanz;
          stern(ctx, p.x, p.y, 2.2 * (1 - q * 0.5));
        }
      }
      ctx.globalAlpha = 1;
    }

    function stern(ctx, x, y, r) {
      ctx.beginPath();
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        const rr = i % 2 ? r * 0.4 : r;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    }

    /* ------------------------------------------------------------ Malen */

    function zeichnen(ctx, f) {
      const w = welt;
      const z = w.zellen;
      // Der Fels ist Mauerwerk, darüber werden die Kammern ausgespart.
      ctx.fillStyle = f.karteRand;
      ctx.fillRect(0, 0, B, H);
      ctx.strokeStyle = f.tinteStill;
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let r = 0, y = 0; y < H; r += 1, y += 6) {
        ctx.moveTo(0, y);
        ctx.lineTo(B, y);
        for (let x = (r % 2) * 6; x < B; x += 12) { ctx.moveTo(x, y); ctx.lineTo(x, y + 6); }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Tiefe je Spalte: Flüssiges wird nach unten dunkler, die Oberfläche
      // bewegt sich. Gleiche Farben einer Zeile werden ein Rechteck.
      const tiefe = new Int16Array(W);
      const reihe = new Array(W);
      const welle = Math.floor(puls * 5);
      for (let y = 0; y < HH; y += 1) {
        for (let x = 0; x < W; x += 1) {
          const m = z[y * W + x];
          const oben = y > 0 ? z[(y - 1) * W + x] : FELS;
          tiefe[x] = m === oben ? tiefe[x] + 1 : 0;
          let c = null;
          if (m === LUFT || m === RIEGEL || m >= FIGUR) c = f.karte;
          else if (m === WASSER) {
            c = tiefe[x] === 0 && oben === LUFT
              ? (Math.sin(x * 0.9 + puls * 4) > 0.2 ? '#AEDBF8' : WASSER_TIEF[0])
              : WASSER_TIEF[Math.min(WASSER_TIEF.length - 1, tiefe[x])];
          } else if (m === LAVA) {
            c = (x * 13 + y * 7 + welle) % 23 === 0 ? '#FFE08A' : LAVA_TIEF[Math.min(LAVA_TIEF.length - 1, tiefe[x])];
          } else if (m === GOLD) {
            c = (x * 7 + y * 11 + Math.floor(puls * 3)) % 41 === 0 ? FARBE.glanz : (x + y * 2) % 5 === 0 ? FARBE.goldDunkel : FARBE.gold;
          } else if (m === STEIN) {
            c = FARBE.stein[(x * 5 + y * 3) % 3];
          }
          reihe[x] = c;
        }
        let x = 0;
        while (x < W) {
          const c = reihe[x];
          if (!c) { x += 1; continue; }
          let e = x + 1;
          while (e < W && reihe[e] === c) e += 1;
          ctx.fillStyle = c;
          // Etwas höher als die Zeile: Die nächste deckt den Rand wieder zu, und
          // durch die Naht schimmert kein Mauerwerk.
          ctx.fillRect(x * Z, y * Z, (e - x) * Z + 0.05, Z + 0.4);
          x = e;
        }
      }

      // Felskanten, damit die Kammern sich abheben.
      ctx.strokeStyle = f.tinteStill;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let y = 0; y < HH; y += 1) {
        for (let x = 0; x < W; x += 1) {
          if (z[y * W + x] !== FELS) continue;
          if (y > 0 && z[(y - 1) * W + x] !== FELS) { ctx.moveTo(x * Z, y * Z); ctx.lineTo((x + 1) * Z, y * Z); }
          if (y < HH - 1 && z[(y + 1) * W + x] !== FELS) { ctx.moveTo(x * Z, (y + 1) * Z); ctx.lineTo((x + 1) * Z, (y + 1) * Z); }
          if (x > 0 && z[y * W + x - 1] !== FELS) { ctx.moveTo(x * Z, y * Z); ctx.lineTo(x * Z, (y + 1) * Z); }
          if (x < W - 1 && z[y * W + x + 1] !== FELS) { ctx.moveTo((x + 1) * Z, y * Z); ctx.lineTo((x + 1) * Z, (y + 1) * Z); }
        }
      }
      ctx.stroke();

      if (w.truhe) truheMalen(ctx, f, w.truhe);
      w.figuren.forEach((fig, i) => figurMalen(ctx, f, fig, i));
      for (const r of w.riegel) riegelMalen(ctx, f, r);
      teilchenMalen(ctx, f);
    }

    function truheMalen(ctx, f, tr) {
      const x = tr.x * Z;
      const y = tr.y * Z;
      const bw = tr.w * Z;
      const bh = tr.h * Z;
      const offenZeit = welt.gewonnen ? Math.min(1, nachEnde / 0.4) : 0;
      if (offenZeit) {
        const glut = ctx.createRadialGradient(x + bw / 2, y + bh * 0.4, 1, x + bw / 2, y + bh * 0.4, bw * 0.9);
        glut.addColorStop(0, 'rgba(255, 224, 120, ' + (0.7 * offenZeit) + ')');
        glut.addColorStop(1, 'rgba(255, 224, 120, 0)');
        ctx.fillStyle = glut;
        ctx.fillRect(x - bw * 0.5, y - bh * 0.6, bw * 2, bh * 1.8);
      }
      const koerperY = y + bh * 0.42;
      ctx.fillStyle = FARBE.holz;
      Echtzeit.rund(ctx, x + 1, koerperY, bw - 2, bh - (koerperY - y), 1.5);
      ctx.fill();
      if (offenZeit) {
        ctx.fillStyle = FARBE.gold;
        ctx.fillRect(x + 3, koerperY - 1.5, bw - 6, 3);
      }
      ctx.save();
      // Der Deckel klappt nach hinten auf.
      ctx.translate(x + 1, koerperY);
      ctx.scale(1, 1 - offenZeit * 1.6);
      ctx.fillStyle = FARBE.holzHell;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -bh * 0.22);
      ctx.quadraticCurveTo((bw - 2) / 2, -bh * 0.48, bw - 2, -bh * 0.22);
      ctx.lineTo(bw - 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = FARBE.beschlag;
      ctx.fillRect(x + bw * 0.22, koerperY, 1.6, bh - (koerperY - y));
      ctx.fillRect(x + bw * 0.78 - 1.6, koerperY, 1.6, bh - (koerperY - y));
      ctx.fillRect(x + bw / 2 - 1.8, koerperY + 1.5, 3.6, 4);
      ctx.fillStyle = FARBE.dunkel;
      ctx.fillRect(x + bw / 2 - 0.5, koerperY + 3, 1, 1.6);
    }

    function riegelMalen(ctx, f, r) {
      let versatz = 0;
      if (r.gezogen) {
        if (!zug || zug.nr !== r.nr) return;
        versatz = Math.min(1, zug.t / 0.3);
      }
      const laenge = (r.waagerecht ? r.tx1 - r.tx0 + 1 : r.ty1 - r.ty0 + 1) * K * Z;
      // Erst ein kleiner Ruck, dann gleitet er hinaus.
      const weg = (versatz < 0.2 ? versatz * 0.5 : 0.1 + (versatz - 0.2) * 1.125) * (laenge + 10) * r.griff;
      ctx.save();
      ctx.globalAlpha = 1 - versatz * 0.8;
      let gx; let gy;
      if (r.waagerecht) {
        const y = r.ty0 * K * Z;
        const x0 = r.tx0 * K * Z + weg;
        ctx.fillStyle = f.tinteLeise;
        ctx.fillRect(x0, y + 0.4, laenge, Z - 0.8);
        ctx.fillStyle = 'rgba(255, 255, 255, .35)';
        ctx.fillRect(x0, y + 0.9, laenge, 0.9);
        gx = (r.griff < 0 ? x0 - 4.5 : x0 + laenge + 4.5);
        gy = y + Z / 2;
      } else {
        const x = (r.tx0 * K + 1) * Z;
        const y0 = r.ty0 * K * Z + weg;
        ctx.fillStyle = f.tinteLeise;
        ctx.fillRect(x + 0.4, y0, Z - 0.8, laenge);
        ctx.fillStyle = 'rgba(255, 255, 255, .35)';
        ctx.fillRect(x + 0.9, y0, 0.9, laenge);
        gx = x + Z / 2;
        gy = r.griff < 0 ? y0 - 4.5 : y0 + laenge + 4.5;
      }
      const hervor = stand.zeige === r.nr || vorgemerkt === r.nr;
      if (hervor) {
        ctx.strokeStyle = f.rost;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(puls * 4));
        ctx.beginPath();
        ctx.arc(gx, gy, 8.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1 - versatz * 0.8;
      }
      ctx.fillStyle = f.karte;
      ctx.strokeStyle = f.tinteLeise;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(gx, gy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = f.tinte;
      ctx.font = '700 6px "DM Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(r.nr), gx, gy + 0.4);
      ctx.restore();
    }

    /** Läuft die Figur gerade? Dann schwingen die Beine. */
    function schwung(fig, i) {
      const g = gangZeit.get(i);
      if (!g || g.gang !== fig.gang) { gangZeit.set(i, { gang: fig.gang, t: puls }); return fig.gang ? 1 : 0; }
      return puls - g.t < 0.12 ? 1 : 0;
    }

    function figurMalen(ctx, f, fig, i) {
      const x = fig.x * Z;
      const y = fig.y * Z;
      const bw = fig.w * Z;
      const bh = fig.h * Z;
      const mx = x + bw / 2;
      let hoch = 1;                 // 1 = aufrecht, kleiner = platt gedrückt
      let alpha = 1;
      let dunkel = false;
      if (!fig.lebt) {
        const seitTod = puls - (todZeit.has(i) ? todZeit.get(i) : -10);
        if (fig.wie === 'erschlagen') {
          hoch = Math.max(0.22, 1 - seitTod * 5);
        } else if (fig.wie === 'verbrannt') {
          dunkel = true;
          alpha = Math.max(0, 1 - seitTod / 0.9);
        } else {
          alpha = Math.max(0, 1 - seitTod / 0.5);
        }
        if (alpha <= 0) {
          // Was bleibt: ein Häufchen Asche.
          ctx.fillStyle = f.tinteStill;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.ellipse(mx, y + bh - 1.5, bw / 3, 2.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          return;
        }
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(mx, y + bh);
      ctx.scale(1, hoch);
      const sieg = fig.art === 'held' && welt.gewonnen;
      if (sieg) ctx.translate(0, -Math.abs(Math.sin(nachEnde * 9)) * 5);
      if (fig.art === 'held') heldMalen(ctx, f, fig, schwung(fig, i), dunkel, sieg);
      else ungeheuerMalen(ctx, f, fig, bw, bh, schwung(fig, i), dunkel);
      ctx.restore();
    }

    /* Beide Figuren sind um den Fußpunkt gezeichnet: (0, 0) ist unten Mitte. */
    function heldMalen(ctx, f, fig, laeuft, dunkel, sieg) {
      const s_ = laeuft ? Math.sin(fig.gang * 1.3) * 2.2 : 0;
      const farbe = (c) => (dunkel ? '#2B2520' : c);
      ctx.fillStyle = farbe(FARBE.dunkel);
      ctx.fillRect(-4 + s_, -8, 3, 8);
      ctx.fillRect(1 - s_, -8, 3, 8);
      ctx.fillStyle = farbe(FARBE.held);
      Echtzeit.rund(ctx, -6.5, -21, 13, 14, 3);
      ctx.fill();
      ctx.fillStyle = farbe(FARBE.haut);
      ctx.beginPath();
      ctx.arc(0, -25.5, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = farbe(FARBE.ruestung);
      ctx.beginPath();
      ctx.arc(0, -26.5, 5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-0.6, -34, 1.2, 4);
      ctx.fillStyle = farbe(FARBE.dunkel);
      const b_ = fig.blick > 0 ? 0.8 : -0.8;
      ctx.fillRect(-2.4 + b_, -25.5, 1.1, 1.3);
      ctx.fillRect(1.3 + b_, -25.5, 1.1, 1.3);
      // Das Schwert: beim Sieg in die Höhe gereckt.
      ctx.fillStyle = farbe(FARBE.ruestung);
      if (sieg) {
        ctx.fillRect(7, -38, 1.6, 14);
        ctx.fillStyle = farbe(FARBE.dunkel);
        ctx.fillRect(5.3, -24, 5, 1.4);
      } else {
        ctx.fillRect(fig.blick > 0 ? 7 : -8.6, -25, 1.6, 13);
        ctx.fillStyle = farbe(FARBE.dunkel);
        ctx.fillRect(fig.blick > 0 ? 5.3 : -10.3, -13, 5, 1.4);
      }
    }

    function ungeheuerMalen(ctx, f, fig, bw, bh, laeuft, dunkel) {
      const r = Math.min(bw, bh) / 2 - 1;
      const wippen = laeuft ? Math.abs(Math.sin(fig.gang * 1.3)) * 1.5 : Math.sin(puls * 3) * 0.5;
      const cy = -r - 1 - wippen;
      const farbe = (c) => (dunkel ? '#2B2520' : c);
      ctx.fillStyle = farbe(FARBE.ungeheuerDunkel);
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, cy - r * 0.6);
      ctx.lineTo(-r * 0.95, cy - r * 1.35);
      ctx.lineTo(-r * 0.25, cy - r * 0.9);
      ctx.moveTo(r * 0.7, cy - r * 0.6);
      ctx.lineTo(r * 0.95, cy - r * 1.35);
      ctx.lineTo(r * 0.25, cy - r * 0.9);
      ctx.fill();
      ctx.fillRect(-r * 0.6, -3, 3, 3);
      ctx.fillRect(r * 0.6 - 3, -3, 3, 3);
      ctx.fillStyle = farbe(FARBE.ungeheuer);
      ctx.beginPath();
      ctx.ellipse(0, cy, bw / 2 - 0.5, r, 0, 0, Math.PI * 2);
      ctx.fill();
      if (dunkel) return;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(fig.blick * 2, cy - r * 0.25, r * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1B1815';
      ctx.beginPath();
      ctx.arc(fig.blick * 3, cy - r * 0.25, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      for (let k = -2; k <= 1; k += 1) {
        ctx.beginPath();
        ctx.moveTo(k * 3, cy + r * 0.35);
        ctx.lineTo(k * 3 + 3, cy + r * 0.35);
        ctx.lineTo(k * 3 + 1.5, cy + r * 0.62);
        ctx.fill();
      }
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Bring den Helden zur Truhe. Er läuft von selbst los, sobald der Weg frei ist – und schaut nicht, wohin er tritt. Berührt er die Truhe, ist das Level geschafft.'));
      d.append(el('p', 'notiz', 'Tipp auf einen Riegel, und er ist draußen. Was dahinter lag, fällt, fließt oder läuft los. Gezogen ist gezogen – zurück geht es nur mit „Von vorn".'));
      d.append(el('p', 'notiz', 'Lava verbrennt jeden, der sie berührt, und schmilzt Gold. Wasser löscht Lava zu Stein. Fallende Steine erschlagen jeden, auf den sie fallen, Held wie Ungeheuer; liegende Steine sind nur Boden. Gold fällt harmlos.'));
      d.append(el('p', 'notiz', 'Das Ungeheuer läuft auf den Helden zu und frisst ihn, wenn es ihn erreicht. Töten muss man es nur, wenn es sonst an ihn herankommt. Eine Kachel hoch steigen beide, höhere Wände nicht, und losen Schutt schieben sie beiseite.'));
      d.append(el('p', 'notiz', 'Sterne: einer für die Truhe, einer, wenn der Held unterwegs die Hälfte des Goldes einsammelt, und einer ab neun Zehnteln.'));
      d.append(el('p', 'notiz', 'Solange sich etwas bewegt, wartet der nächste Riegel: Wer vorher tippt, merkt ihn vor. Der Hinweis rechnet von der aktuellen Lage aus durch, was jeder Riegel anrichten würde. Am Rechner ziehen die Zifferntasten.'));
      s.blatt({ titel: 'Riegel', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function wahl() {
      const d = el('div', 'ri-wahl');
      const g = geloest();
      const st = besteSterne();
      LEVEL.forEach((lv, i) => {
        const k = el('button', 'knopf ' + (i === stand.level ? 'knopf--voll' : 'knopf--still'));
        k.type = 'button';
        k.title = lv.name;
        k.append(el('span', 'ri-wahl-nr', String(i + 1)), el('span', 'ri-wahl-sterne', g.has(i + 1) ? sternText(st.get(i + 1) || 1) : ''));
        if (g.has(i + 1)) k.dataset.geloest = 'ja';
        k.disabled = !frei(i);
        k.addEventListener('click', () => { s.blattZu(); neu(i); });
        d.append(k);
      });
      let summe = 0;
      for (const n of st.values()) summe += n;
      const n = el('p', 'notiz notiz--klein', g.size + ' von ' + LEVEL.length + ' gelöst, ' + summe + ' von ' + LEVEL.length * 3 + ' Sternen. Ein Level darf man überspringen.');
      const huelle = el('div');
      huelle.append(d, n);
      s.blatt({ titel: 'Level wählen', inhalt: huelle, aktionen: [{ text: 'Schließen', art: 'still' }] });
    }

    /* ---------------------------------------------------------- Steuerung */

    function riegelBei(px, py) {
      let best = null;
      for (const r of welt.riegel) {
        if (r.gezogen) continue;
        let d;
        if (r.waagerecht) {
          const y = (r.ty0 * K + 0.5) * Z;
          const x0 = r.tx0 * K * Z - (r.griff < 0 ? 10 : 0);
          const x1 = (r.tx1 + 1) * K * Z + (r.griff > 0 ? 10 : 0);
          d = Math.hypot(Math.max(x0 - px, 0, px - x1), py - y);
        } else {
          const x = (r.tx0 * K + 1.5) * Z;
          const y0 = r.ty0 * K * Z - (r.griff < 0 ? 10 : 0);
          const y1 = (r.ty1 + 1) * K * Z + (r.griff > 0 ? 10 : 0);
          d = Math.hypot(px - x, Math.max(y0 - py, 0, py - y1));
        }
        if (d < 9 && (!best || d < best.d)) best = { nr: r.nr, d };
      }
      return best && best.nr;
    }

    b.an(flaeche, 'pointerdown', (e) => {
      if (ende) return;
      e.preventDefault();
      const rect = b.canvas.getBoundingClientRect();
      const nr = riegelBei((e.clientX - rect.left) / b.masstab, (e.clientY - rect.top) / b.masstab);
      if (nr) { tippen(nr); return; }
      if (angehalten) { angehalten = false; anzeigen(); b.los(); }
    });

    b.an(window, 'keydown', (e) => {
      if (!Echtzeit.tasteZaehlt(e)) return;
      if (/^[1-9]$/.test(e.key)) { e.preventDefault(); tippen(Number(e.key)); }
      else if (e.key === 'r' || e.key === 'R') neu(stand.level);
    });
    b.an(document, 'visibilitychange', () => {
      if (!document.hidden) seit = Date.now();
    });

    anzeigen();

    return {
      ende: () => {
        b.ende();
        if (!ende) sichern();
      },
    };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien) {
    const gewonnen = partien.filter((p) => p.gewonnen === true && p.satz === SATZ && Number.isInteger(p.stufe));
    const beste = new Map();
    for (const p of gewonnen) beste.set(p.stufe, Math.max(beste.get(p.stufe) || 0, Echtzeit.zahl(p.sterne)));
    let summe = 0;
    for (const n of beste.values()) summe += n;
    const ohne = new Set(gewonnen.filter((p) => !p.hilfen).map((p) => p.stufe));
    return [
      { wert: beste.size + '/' + LEVEL.length, label: 'Level gelöst' },
      { wert: summe + '/' + LEVEL.length * 3, label: 'Sterne' },
      { wert: String(ohne.size), label: 'ohne Hinweis gelöst' },
    ];
  }

  Rahmen.anmelden({
    id: 'pins',
    name: 'Riegel',
    gruppe: 'raetsel',
    unter: 'Zieh die richtigen Riegel. Der Held will zur Truhe.',
    farbe: '#C9632F',
    symbol: '<path d="M4 4v16h16V4"/><path d="M4 11h11"/><circle cx="17.5" cy="11" r="2.5"/><path d="M8 7.5h.01M11 7.5h.01M9.5 6h.01"/>',
    starten,
    auswertung,
  });
})();
