/* Riegel – den richtigen Riegel zuerst ziehen.

   Das Rätsel aus der Werbung, die nie das Spiel zeigt, für das sie wirbt:
   Kammern voller Wasser, Lava und Gold, getrennt durch Riegel. Wer zieht,
   lässt los, was dahinter liegt. Wasser löscht Lava zu Stein, Lava
   verbrennt Gold, Held und Ungeheuer, fallende Steine erschlagen das
   Ungeheuer. Der Held will das Gold und darf dem Ungeheuer nicht begegnen,
   solange es lebt.

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
   = Riegel waagerecht  | Riegel senkrecht  H Held  M Ungeheuer. Eine Reihe
   von = oder | am Stück ist ein Riegel, ein Block H oder M eine Figur. */

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

  const TREFFER_TOT = 6;          // so viele fallende Steinzellen hält ein Kopf aus
  const SAMMELN = 6;              // Gold in diesem Abstand zum Helden gehört ihm – zwei Kacheln
  const RUHE = 6;                 // Takte ohne Änderung: Lava zieht jeden 2., Figuren jeden 3.
  const HOECHSTENS = 6000;        // Takte, nach denen eine Welt als ruhig gilt, was auch passiert

  /* ------------------------------------------------------------ Level */

  const LEVEL = [
    {
      name: 'Der erste Riegel',
      karte: [
        '###############',
        '#.............#',
        '#.............#',
        '#....#$$$#....#',
        '#....#$$$#....#',
        '#....#$$$#....#',
        '#....#===#....#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#....#...#....#',
        '#....#...#....#',
        '#....#HH.#....#',
        '#....#HH.#....#',
        '#....#HH.#....#',
        '###############',
      ],
    },
    {
      name: 'Nicht der da',
      karte: [
        '###############',
        '#.............#',
        '#.#^^^^#$$$$#.#',
        '#.#^^^^#$$$$#.#',
        '#.#====#====#.#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#........HH...#',
        '#........HH...#',
        '#........HH...#',
        '###############',
      ],
    },
    {
      name: 'Das Ungeheuer',
      karte: [
        '###############',
        '#......#......#',
        '##^^^^^#......#',
        '##^^^^^#......#',
        '##=====#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......|......#',
        '#..MM..|..HH..#',
        '#..MM..|..HH..#',
        '#..MM..|..HH..#',
        '###############',
      ],
    },
    {
      name: 'Falltür',
      karte: [
        '###############',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#......#......#',
        '#.MM...|......#',
        '#.MM...|......#',
        '#.MM...|......#',
        '#======#......#',
        '#^^^^^^#......#',
        '#^^^^^^#...HH.#',
        '#^^^^^^#...HH.#',
        '#^^^^^^#...HH.#',
        '###############',
      ],
    },
    {
      name: 'Erst löschen',
      ziel: 60,
      karte: [
        '###############',
        '#.......#~~~#.#',
        '#...#$$$#~~~#.#',
        '#...#$$$#~~~#.#',
        '#...#===#===#.#',
        '#...#.......#.#',
        '#...#.......#.#',
        '#...#^^^^^^^#.#',
        '#...#=======#.#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.......HH....#',
        '#.......HH....#',
        '#.......HH....#',
        '###############',
      ],
    },
    {
      name: 'Steinschlag',
      karte: [
        '###############',
        '######ooo#$$$##',
        '######ooo#$$$##',
        '######===#===##',
        '######...#....#',
        '######...#....#',
        '######...#....#',
        '######...#....#',
        '######...#....#',
        '######...#....#',
        '######...#....#',
        '######...#....#',
        '######...#....#',
        '######...#....#',
        '######...#....#',
        '######...#....#',
        '#^^^^#...#....#',
        '#^^^^#...#....#',
        '#^^^^#...#....#',
        '#^^^^|...#....#',
        '#^^^^|MM.#.HH.#',
        '#^^^^|MM.#.HH.#',
        '#^^^^|MM...HH.#',
        '###############',
      ],
    },
    {
      name: 'Stein statt Lava',
      karte: [
        '###############',
        '#~~~~~###$$$$##',
        '#~~~~~###$$$$##',
        '#~~~~~###====##',
        '#=====###.....#',
        '#^^^^^###.....#',
        '#^^^^^###.....#',
        '#=====###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.....###.....#',
        '#.MM..###..HH.#',
        '#.MM..###..HH.#',
        '#.MM.......HH.#',
        '###############',
      ],
    },
    {
      name: 'Die Grube',
      karte: [
        '###############',
        '#....#~~~#$$$$#',
        '#....#~~~#$$$$#',
        '#....#~~~#$$$$#',
        '#....#===#====#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '######........#',
        '#..MM|....HH..#',
        '#..MM|....HH..#',
        '#..MM|....HH..#',
        '######^^^######',
        '######^^^######',
        '######^^^######',
        '###############',
      ],
    },
    {
      name: 'Ablauf',
      karte: [
        '###############',
        '#.......#$$$#.#',
        '#.......#$$$#.#',
        '#.......#$$$#.#',
        '#...#####===#.#',
        '#...#^^^^^^^#.#',
        '#...#^^^^^^^#.#',
        '#...#===#===#.#',
        '#...#...#.....#',
        '#...#...#.....#',
        '#...#...#.....#',
        '#...#...#.....#',
        '#...#...#.....#',
        '#...#####.....#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#.............#',
        '#........HH...#',
        '#........HH...#',
        '#........HH...#',
        '###############',
      ],
    },
    {
      name: 'Pfropfen',
      karte: [
        '###############',
        '#^^^^^#ooo#$$$#',
        '#^^^^^#ooo#$$$#',
        '#^^^^^#ooo#$$$#',
        '#=====#===#===#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.........#...#',
        '#.MM......#.HH#',
        '#.MM......#.HH#',
        '#.MM#.........#',
        '###############',
      ],
    },
    {
      name: 'Weiche',
      karte: [
        '###############',
        '#$$$$#~~~######',
        '#$$$$#~~~######',
        '#....#~~~######',
        '#====#=#=######',
        '#......#......#',
        '#^^^^#####^^^^#',
        '#^^^^#####^^^^#',
        '#====#####====#',
        '#....#####....#',
        '#....#####....#',
        '#....#####....#',
        '#....#####....#',
        '#....#####....#',
        '#....#####....#',
        '#....#####....#',
        '#....#####....#',
        '#....#####....#',
        '#....#####....#',
        '#....#####....#',
        '#.HH.#####.MM.#',
        '#.HH.#####.MM.#',
        '#.HH.#####.MM.#',
        '###############',
      ],
    },
  ];

  /* --------------------------------------------------------- Aufbauen */

  const ZEICHEN = { '#': FELS, '.': LUFT, '~': WASSER, '^': LAVA, '$': GOLD, o: STEIN, '=': LUFT, '|': LUFT, H: LUFT, M: LUFT };

  function bauen(level) {
    const karte = level.karte;
    const zellen = new Uint8Array(W * HH);
    const riegelVon = new Int8Array(W * HH).fill(-1);
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
      const r = Object.assign({ nr: i + 1, zellen: [] }, l);
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
      for (const p of r.zellen) { zellen[p] = RIEGEL; riegelVon[p] = i; }
      return r;
    });

    // Figuren: zusammenhängende Blöcke aus H oder M.
    const figuren = [];
    const gesehen = new Set();
    for (let ty = 0; ty < ZEILEN; ty += 1) {
      for (let tx = 0; tx < SPALTEN; tx += 1) {
        const ch = karte[ty][tx];
        if ((ch !== 'H' && ch !== 'M') || gesehen.has(ty * SPALTEN + tx)) continue;
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
        figuren.push({
          art: ch === 'H' ? 'held' : 'ungeheuer',
          x: x0 * K, y: y0 * K, w: (x1 - x0 + 1) * K, h: (y1 - y0 + 1) * K,
          lebt: true, treffer: 0, wie: null, blick: 1,
        });
      }
    }
    // Der Held zuerst – auf ihn beziehen sich alle anderen.
    figuren.sort((a, b) => (a.art === 'held' ? -1 : 0) - (b.art === 'held' ? -1 : 0));

    let gold = 0;
    for (const m of zellen) if (m === GOLD) gold += 1;

    const w = {
      zellen,
      riegelVon,
      riegel: riegel.map((r) => ({ nr: r.nr, zellen: r.zellen, waagerecht: r.waagerecht, tx0: r.tx0, ty0: r.ty0, tx1: r.tx1, ty1: r.ty1, griff: r.griff, gezogen: false })),
      figuren,
      stempel: new Uint32Array(W * HH),
      takt: 0,
      ruhig: 0,
      gold: { gesamt: gold, gesammelt: 0, verbrannt: 0, ziel: Math.ceil((gold * (level.ziel || 70)) / 100) },
      ereignisse: neueEreignisse(),
    };
    for (const f of figuren) stempeln(w, f, FIGUR);
    laufen(w);
    w.ereignisse = neueEreignisse();
    return w;
  }

  const neueEreignisse = () => ({ stein: 0, gesammelt: 0, verbrannt: 0, tote: [] });

  function kopie(w) {
    return {
      zellen: w.zellen.slice(),
      riegelVon: w.riegelVon,
      riegel: w.riegel.map((r) => Object.assign({}, r)),
      figuren: w.figuren.map((f) => Object.assign({}, f)),
      stempel: new Uint32Array(W * HH),
      takt: w.takt,
      ruhig: w.ruhig,
      gold: Object.assign({}, w.gold),
      ereignisse: neueEreignisse(),
    };
  }

  function stempeln(w, f, m) {
    for (let y = f.y; y < f.y + f.h; y += 1) for (let x = f.x; x < f.x + f.w; x += 1) w.zellen[y * W + x] = m;
  }

  /* ------------------------------------------------------------ Regeln */

  const fliesst = (m) => m === WASSER || m === LAVA;
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
      // Der Held trägt einen Helm, das Ungeheuer nicht.
      if (z[p + W] === STEIN && y + 2 < HH && z[p + 2 * W] === FIGUR) {
        const f = figurBei(w, x, y + 2);
        if (f && f.art === 'ungeheuer') f.treffer += 1;
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
        if (q < 0 || q >= z.length) continue;
        if (z[q] === GOLD) {
          z[q] = LUFT;
          w.gold.verbrannt += 1;
          w.ereignisse.verbrannt += 1;
          etwas = true;
        }
      }
      for (const q of nachbarn) {
        if (q < 0 || q >= z.length || z[q] !== WASSER) continue;
        z[p] = STEIN;
        z[q] = LUFT;
        w.ereignisse.stein += 1;
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
  }

  function figurenSchritt(w) {
    const z = w.zellen;
    let etwas = false;
    const h = held(w);
    for (const f of w.figuren) {
      if (!f.lebt) continue;
      let dx = 0;
      let dy = 0;
      const boden = f.y + f.h;
      if (boden < HH) {
        let traeger = 0;
        let summe = 0;
        for (let x = f.x; x < f.x + f.w; x += 1) if (z[boden * W + x] !== LUFT) { traeger += 1; summe += x; }
        if (!traeger) dy = 1;
        else if (traeger * 3 <= f.w) {
          // Steht nur noch mit der Kante auf – rutscht zur freien Seite ab.
          // Sonst hielte eine einzige Felszelle ein Ungeheuer über der Falltür.
          const r = summe / traeger < f.x + f.w / 2 ? 1 : -1;
          const sx = r > 0 ? f.x + f.w : f.x - 1;
          let frei = sx >= 0 && sx < W;
          for (let y = f.y; frei && y < f.y + f.h; y += 1) if (z[y * W + sx] !== LUFT) frei = false;
          if (frei) dx = r;
        }
      }
      // Das Ungeheuer läuft auf den Helden zu, solange es Boden unter den
      // Füßen hat und nichts im Weg steht. Klettern kann es nicht.
      if (!dy && !dx && f.art === 'ungeheuer' && h && h.lebt) {
        const r = Math.sign((h.x + h.w / 2) - (f.x + f.w / 2));
        const nah = f.x <= h.x + h.w && h.x <= f.x + f.w;
        if (r && !nah) {
          f.blick = r;
          const sx = r > 0 ? f.x + f.w : f.x - 1;
          let frei = sx >= 0 && sx < W;
          for (let y = f.y; frei && y < f.y + f.h; y += 1) if (z[y * W + sx] !== LUFT) frei = false;
          if (frei) dx = r;
        }
      }
      if (dx || dy) {
        stempeln(w, f, LUFT);
        f.x += dx;
        f.y += dy;
        stempeln(w, f, FIGUR);
        etwas = true;
      }
    }
    return etwas;
  }

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
    if (h && h.lebt) {
      for (const f of w.figuren) {
        if (f === h || !f.lebt) continue;
        if (f.x <= h.x + h.w && h.x <= f.x + f.w && f.y <= h.y + h.h && h.y <= f.y + f.h) {
          sterben(w, h, 'gefressen');
          return true;
        }
      }
      for (let y = Math.max(0, h.y - SAMMELN); y < Math.min(HH, h.y + h.h + SAMMELN); y += 1) {
        for (let x = Math.max(0, h.x - SAMMELN); x < Math.min(W, h.x + h.w + SAMMELN); x += 1) {
          if (z[y * W + x] !== GOLD) continue;
          z[y * W + x] = LUFT;
          w.gold.gesammelt += 1;
          w.ereignisse.gesammelt += 1;
          etwas = true;
        }
      }
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
        if (m < WASSER || m === FIGUR || w.stempel[p] === marke) continue;
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

  /* Bis zur Ruhe rechnen – oder bis der Held tot ist: Danach ändert nichts
     mehr das Urteil, und die letzten Lavatropfen brauchen oft noch Sekunden. */
  function laufen(w) {
    for (let i = 0; i < HOECHSTENS && !ruhig(w) && heldLebt(w); i += 1) ticken(w);
    if (heldLebt(w)) w.ruhig = Math.max(w.ruhig, RUHE);
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

  /* Wie steht es, wenn die Welt ruht? sieg, tot, aus (kein Weg mehr zum
     Ziel) oder offen. Mit `wie` als Grund. */
  function urteil(w) {
    const h = held(w);
    if (!h || !h.lebt) return { art: 'tot', wie: h ? h.wie : 'fehlt' };
    const goldOk = w.gold.gesamt === 0 || w.gold.gesammelt >= w.gold.ziel;
    const ungeheuerOk = w.figuren.every((f) => f.art !== 'ungeheuer' || !f.lebt);
    if (goldOk && ungeheuerOk) return { art: 'sieg' };
    if (!goldOk) {
      let imFeld = 0;
      for (const m of w.zellen) if (m === GOLD) imFeld += 1;
      if (w.gold.gesammelt + imFeld < w.gold.ziel) return { art: 'aus', wie: 'geschmolzen' };
    }
    if (offen(w).length) return { art: 'offen' };
    return { art: 'aus', wie: goldOk ? 'ungeheuer' : 'fern' };
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
    for (const f of w.figuren) s += ':' + (f.lebt ? f.x + ',' + f.y + ',' + f.treffer : '-');
    for (const r of w.riegel) s += r.gezogen ? '1' : '0';
    return s;
  }

  /* Von der ruhenden Welt aus eine Reihenfolge suchen, die gewinnt. Liefert
     { weg } oder { gruende } – die Arten, auf die jeder Versuch endete. */
  function loesen(w, gemerkt = new Map()) {
    const k = schluessel(w);
    if (gemerkt.has(k)) return gemerkt.get(k);
    const gruende = new Set();
    let ergebnis = null;
    for (const nr of offen(w)) {
      const v = kopie(w);
      ziehen(v, nr);
      laufen(v);
      const u = urteil(v);
      if (u.art === 'sieg') { ergebnis = { weg: [nr] }; break; }
      if (u.art === 'offen') {
        const weiter = loesen(v, gemerkt);
        if (weiter.weg) { ergebnis = { weg: [nr, ...weiter.weg] }; break; }
        for (const g of weiter.gruende) gruende.add(g);
      } else {
        gruende.add(u.wie);
      }
    }
    ergebnis = ergebnis || { gruende };
    gemerkt.set(k, ergebnis);
    return ergebnis;
  }

  /* ------------------------------------------------------------------ Spiel */

  const FARBE = {
    wasser: '#3C8ED6', wasserHell: '#7DBCEF',
    lava: '#E0542B', lavaHell: '#F6A637',
    gold: '#E2B01E', goldHell: '#F7DB6A',
    stein: '#7B736A', steinHell: '#978E84',
    held: '#3F6DB3', ruestung: '#B9C2CC', ungeheuer: '#5C9B3A', ungeheuerDunkel: '#3F7426',
  };

  const GRUND = {
    verbrannt: 'die Lava erreicht den Helden',
    gefressen: 'das Ungeheuer kommt an den Helden heran',
    geschmolzen: 'zu viel Gold schmilzt in der Lava',
    fern: 'das Gold kommt nicht beim Helden an',
    ungeheuer: 'das Ungeheuer bleibt am Leben',
  };

  const TITEL = {
    verbrannt: 'Verbrannt.',
    gefressen: 'Gefressen.',
    geschmolzen: 'Das Gold ist geschmolzen.',
    fern: 'Das Gold kam nicht an.',
    ungeheuer: 'Das Ungeheuer lebt noch.',
  };

  function starten(wurzel, s) {
    const el = s.el;
    const geloest = () => new Set(s.partien().filter((p) => p.gewonnen === true && Number.isInteger(p.stufe)).map((p) => p.stufe));
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
    let ende = null;              // { art, wie } nach Sieg oder Niederlage
    let vorgemerkt = null;
    let zug = null;               // gleitender Riegel fürs Bild
    let angehalten = false;       // Bewegung wurde unterbrochen, nicht beendet
    let seit = Date.now();
    let puls = 0;
    let nachTod = 0;

    function laden() {
      const alt = s.erinnert();
      const ok = alt && Number.isInteger(alt.level) && alt.level >= 0 && alt.level < LEVEL.length &&
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
      s.merken({ level: stand.level, gezogen: stand.gezogen, hilfen: stand.hilfen, verbraucht: stand.verbraucht });
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
      ende = null;
      vorgemerkt = null;
      zug = null;
      angehalten = false;
      nachTod = 0;
    }

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const flaeche = el('div', 'ez-flaeche ri-flaeche');
    const feld = el('div', 'ri-kasten');
    const leiste = el('div', 'leiste');
    const unten = el('div', 'ez-unten');
    flaeche.append(feld);
    wurzel.append(kopf, flaeche, leiste, unten);

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
      if (ende) {
        // Nach dem Urteil darf die Lava zu Ende fließen; dann steht die Schleife.
        if (ruhig(welt) && !zug) b.halt();
      } else if (!heldLebt(welt)) {
        nachTod += dt;
        if (nachTod > 0.9) beenden(urteil(welt));
      } else if (ruhig(welt) && !zug) {
        zurRuhe();
      }
    }

    function zurRuhe() {
      const u = urteil(welt);
      if (u.art !== 'offen') { beenden(u); return; }
      if (vorgemerkt) { jetztZiehen(vorgemerkt); return; }
      // Der Hinweis pulsiert weiter; sonst gibt es nichts zu bewegen.
      if (!stand.zeige) b.halt();
      else if (puls > 60) b.halt();
    }

    function beiHalt() {
      if (!ruhig(welt) || zug) angehalten = true;
      puls = 0;
      anzeigen();
      // Nach dem Urteil liegt schon der nächste Stand im Speicher; die
      // auslaufende Lava darf ihn nicht mit dem entschiedenen überschreiben.
      if (!ende) sichern();
    }

    function beenden(u) {
      sichern();
      ende = u;
      const partie = { gewonnen: u.art === 'sieg', stufe: stand.level + 1, dauer: stand.verbraucht, hilfen: stand.hilfen };
      if (welt.gold.gesamt) partie.gold = Math.round((welt.gold.gesammelt / welt.gold.gesamt) * 100);
      s.notieren(partie);
      // Der nächste Besuch beginnt beim nächsten Level – oder bei diesem, wenn es nicht geklappt hat.
      const naechstes = u.art === 'sieg' && stand.level + 1 < LEVEL.length ? stand.level + 1 : stand.level;
      s.merken({ level: naechstes, gezogen: [], hilfen: 0, verbraucht: 0 });
      stand.zeige = null;
      vorgemerkt = null;
      if (ruhig(welt) && !zug) b.halt();
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
      if (e.gesammelt) teile.push('Gold fällt zum Helden');
      if (e.verbrannt && !teile.length) teile.push('ein wenig Gold schmilzt, aber es bleibt genug');
      if (!teile.length) teile.push('noch passiert nichts Entscheidendes, aber der nächste Riegel findet alles bereit');
      return teile;
    }

    const satz = (teile) => {
      if (!teile.length) return '';
      const t = teile.length === 1 ? teile[0] : teile.slice(0, -1).join(', ') + ' und ' + teile[teile.length - 1];
      return t[0].toUpperCase() + t.slice(1) + '.';
    };

    function hinweis() {
      if (ende) return;
      if (!ruhig(welt) || zug) {
        s.toast('Erst wenn alles ruht.');
        return;
      }
      stand.hilfen += 1;
      sichern();
      const zeilen = [];
      let gut = null;
      let gutFolgen = [];
      const gemerkt = new Map();
      for (const nr of offen(welt)) {
        const v = kopie(welt);
        ziehen(v, nr);
        laufen(v);
        const u = urteil(v);
        if (u.art === 'sieg' || (u.art === 'offen' && loesen(v, gemerkt).weg)) {
          if (!gut) { gut = nr; gutFolgen = folgen(v.ereignisse); }
          continue;
        }
        if (u.art === 'tot' || u.art === 'aus') {
          zeilen.push('Riegel ' + nr + ' jetzt: ' + GRUND[u.wie] + '.');
        } else {
          const g = [...loesen(v, gemerkt).gruende].map((x) => GRUND[x]).filter(Boolean);
          zeilen.push('Riegel ' + nr + ' käme zu früh: danach ' + (g.length === 1 ? g[0] : 'geht es nicht mehr auf') + '.');
        }
      }

      const d = el('div');
      if (!gut) {
        d.append(el('p', 'notiz', 'Von hier geht es nicht mehr auf.'));
        for (const z of zeilen) d.append(el('p', 'notiz', z));
        s.blatt({ titel: 'Hinweis', inhalt: d, aktionen: [{ text: 'Von vorn', tun: () => neu(stand.level) }, { text: 'Schließen', art: 'still' }] });
        return;
      }
      d.append(el('p', 'notiz', 'Zieh als Nächstes Riegel ' + gut + '. ' + satz(gutFolgen)));
      for (const z of zeilen) d.append(el('p', 'notiz', z));
      stand.zeige = gut;
      puls = 0;
      s.blatt({
        titel: 'Hinweis',
        inhalt: d,
        aktionen: [{ text: 'Riegel ' + gut + ' ziehen', tun: () => tippen(gut) }, { text: 'Selbst ziehen', art: 'still', tun: () => { b.los(); } }],
      });
    }

    /* ----------------------------------------------------------- Anzeige */

    function ziel() {
      const teile = [];
      if (welt.gold.gesamt) teile.push('Gold zum Helden');
      if (welt.figuren.some((f) => f.art === 'ungeheuer')) teile.push('Ungeheuer besiegen');
      return teile.join(' · ');
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      const l = el('span');
      l.append(document.createTextNode('Level '), el('b', null, String(stand.level + 1)), document.createTextNode(' / ' + LEVEL.length));
      kopf.append(l);
      if (welt.gold.gesamt) {
        const g = el('span');
        const jetzt = Math.round((welt.gold.gesammelt / welt.gold.gesamt) * 100);
        g.append(document.createTextNode('Gold '), el('b', null, jetzt + ' %'), document.createTextNode(' / ' + (LEVEL[stand.level].ziel || 70) + ' %'));
        kopf.append(g);
      }
      s.unter(LEVEL[stand.level].name);
    }

    function anzeigen() {
      kopfZeichnen();
      unten.replaceChildren();
      leiste.hidden = !!ende;
      hinweisKnopf.disabled = !!ende;
      if (ende) {
        const titel = ende.art === 'sieg' ? 'Geschafft.' : TITEL[ende.wie] || 'Verloren.';
        b.schild(titel);
        const nr = stand.level + 1;
        const text = ende.art === 'sieg'
          ? 'Level ' + nr + ' in ' + s.dauerText(stand.verbraucht) + (stand.hilfen ? ', ' + stand.hilfen + (stand.hilfen === 1 ? ' Hinweis.' : ' Hinweise.') : ', ohne Hinweis.')
          : satz([GRUND[ende.wie] || 'es ging schief']);
        const knoepfe = [];
        if (ende.art === 'sieg' && stand.level + 1 < LEVEL.length) knoepfe.push({ text: 'Weiter zu Level ' + (nr + 1), tun: () => neu(stand.level + 1) });
        knoepfe.push({ text: ende.art === 'sieg' ? 'Nochmal' : 'Nochmal versuchen', art: ende.art === 'sieg' && knoepfe.length ? 'still' : undefined, tun: () => neu(stand.level) });
        if (ende.art === 'sieg' && stand.level + 1 >= LEVEL.length) knoepfe.push({ text: 'Level wählen', art: 'still', tun: wahl });
        unten.append(Echtzeit.kasten(titel, text, knoepfe));
      } else if (angehalten) {
        b.schild('Angehalten', 'Tippen, dann geht es weiter.');
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
    }

    function zeichnen(ctx, f) {
      const w = welt;
      const z = w.zellen;
      ctx.fillStyle = f.karte;
      ctx.fillRect(0, 0, B, H);

      // Zellen als waagerechte Läufe gleicher Art – ein Rechteck statt vieler.
      const farbe = (m, x, y) => {
        const oben = y > 0 ? z[(y - 1) * W + x] : FELS;
        if (m === FELS) return f.karteRand;
        if (m === WASSER) return oben === LUFT ? FARBE.wasserHell : FARBE.wasser;
        if (m === LAVA) return oben === LUFT || (x * 5 + y * 3 + Math.floor(w.takt / 20)) % 11 === 0 ? FARBE.lavaHell : FARBE.lava;
        if (m === GOLD) return (x * 3 + y * 5) % 7 === 0 ? FARBE.goldHell : FARBE.gold;
        if (m === STEIN) return (x + y) % 3 === 0 ? FARBE.steinHell : FARBE.stein;
        return null;
      };
      for (let y = 0; y < HH; y += 1) {
        let x = 0;
        while (x < W) {
          const c = farbe(z[y * W + x], x, y);
          if (!c) { x += 1; continue; }
          let e = x + 1;
          while (e < W && farbe(z[y * W + e], e, y) === c) e += 1;
          ctx.fillStyle = c;
          ctx.fillRect(x * Z, y * Z, (e - x) * Z + 0.05, Z + 0.05);
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

      for (const fig of w.figuren) figurMalen(ctx, f, fig);
      for (const r of w.riegel) riegelMalen(ctx, f, r);
    }

    function riegelMalen(ctx, f, r) {
      let versatz = 0;
      if (r.gezogen) {
        if (!zug || zug.nr !== r.nr) return;
        versatz = Math.min(1, zug.t / 0.3);
      }
      const laenge = (r.waagerecht ? r.tx1 - r.tx0 + 1 : r.ty1 - r.ty0 + 1) * K * Z;
      const weg = versatz * (laenge + 10) * r.griff;
      ctx.save();
      ctx.globalAlpha = 1 - versatz * 0.7;
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
        gy = y0 - 4.5;
      }
      const hervor = stand.zeige === r.nr || vorgemerkt === r.nr;
      if (hervor) {
        ctx.strokeStyle = f.rost;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(puls * 4));
        ctx.beginPath();
        ctx.arc(gx, gy, 8.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1 - versatz * 0.7;
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

    function figurMalen(ctx, f, fig) {
      const x = fig.x * Z;
      const y = fig.y * Z;
      const bw = fig.w * Z;
      const bh = fig.h * Z;
      const mx = x + bw / 2;
      if (!fig.lebt) {
        // Ein kleiner Haufen Asche oder ein Kreuz – der Platz bleibt erkennbar.
        ctx.fillStyle = f.tinteStill;
        ctx.globalAlpha = 0.7;
        if (fig.art === 'held') {
          ctx.fillRect(mx - 1, y + bh - 14, 2, 14);
          ctx.fillRect(mx - 5, y + bh - 10, 10, 2);
        } else {
          ctx.beginPath();
          ctx.ellipse(mx, y + bh - 1.5, bw / 3, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        return;
      }
      if (fig.art === 'held') {
        // Beine, Körper, Kopf mit Helm, Schwert.
        ctx.fillStyle = f.tinte;
        ctx.fillRect(mx - 4, y + bh - 8, 3, 8);
        ctx.fillRect(mx + 1, y + bh - 8, 3, 8);
        ctx.fillStyle = FARBE.held;
        Echtzeit.rund(ctx, mx - 6.5, y + bh - 21, 13, 14, 3);
        ctx.fill();
        ctx.fillStyle = '#F1D2B0';
        ctx.beginPath();
        ctx.arc(mx, y + bh - 25.5, 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = FARBE.ruestung;
        ctx.beginPath();
        ctx.arc(mx, y + bh - 26.5, 5, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(mx - 0.6, y + bh - 34, 1.2, 4);
        ctx.fillStyle = f.tinte;
        ctx.fillRect(mx - 2.4, y + bh - 25.5, 1.1, 1.3);
        ctx.fillRect(mx + 1.3, y + bh - 25.5, 1.1, 1.3);
        ctx.fillStyle = FARBE.ruestung;
        ctx.fillRect(mx + 7, y + bh - 25, 1.6, 13);
        ctx.fillStyle = f.tinte;
        ctx.fillRect(mx + 5.3, y + bh - 13, 5, 1.4);
        return;
      }
      // Ungeheuer: runder Leib, Hörner, ein großes Auge, Zähne.
      const r = Math.min(bw, bh) / 2 - 1;
      const cy = y + bh - r - 1;
      ctx.fillStyle = FARBE.ungeheuerDunkel;
      ctx.beginPath();
      ctx.moveTo(mx - r * 0.7, cy - r * 0.6);
      ctx.lineTo(mx - r * 0.95, cy - r * 1.35);
      ctx.lineTo(mx - r * 0.25, cy - r * 0.9);
      ctx.moveTo(mx + r * 0.7, cy - r * 0.6);
      ctx.lineTo(mx + r * 0.95, cy - r * 1.35);
      ctx.lineTo(mx + r * 0.25, cy - r * 0.9);
      ctx.fill();
      ctx.fillStyle = FARBE.ungeheuer;
      ctx.beginPath();
      ctx.ellipse(mx, cy, bw / 2 - 0.5, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(mx + fig.blick * 2, cy - r * 0.25, r * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1B1815';
      ctx.beginPath();
      ctx.arc(mx + fig.blick * 3, cy - r * 0.25, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      for (let i = -2; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(mx + i * 3, cy + r * 0.35);
        ctx.lineTo(mx + i * 3 + 3, cy + r * 0.35);
        ctx.lineTo(mx + i * 3 + 1.5, cy + r * 0.62);
        ctx.fill();
      }
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Tipp auf einen Riegel, und er ist draußen. Was dahinter lag, fällt, fließt oder rollt los. Ist er einmal gezogen, gibt es kein Zurück – nur „Von vorn".'));
      d.append(el('p', 'notiz', 'Der Held will das Gold. Fällt es neben ihn, gehört es ihm; die Zahl oben sagt, wie viel er braucht. Ein Ungeheuer muss weg, bevor er gewonnen hat – und er darf ihm nicht begegnen, solange es lebt.'));
      d.append(el('p', 'notiz', 'Lava verbrennt Helden, Ungeheuer und Gold. Wasser löscht Lava zu Stein. Fallende Steine erschlagen das Ungeheuer – der Held trägt einen Helm. Das Ungeheuer läuft auf den Helden zu, sobald nichts mehr dazwischen ist; klettern kann es nicht.'));
      d.append(el('p', 'notiz', 'Solange sich etwas bewegt, wartet der nächste Riegel: Wer vorher tippt, merkt ihn vor. Der Hinweis rechnet von der aktuellen Lage aus durch, was jeder Riegel anrichten würde. Am Rechner ziehen die Zifferntasten.'));
      s.blatt({ titel: 'Riegel', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function wahl() {
      const d = el('div', 'ri-wahl');
      const g = geloest();
      LEVEL.forEach((lv, i) => {
        const k = el('button', 'knopf ' + (i === stand.level ? 'knopf--voll' : 'knopf--still'), String(i + 1));
        k.type = 'button';
        k.title = lv.name;
        if (g.has(i + 1)) k.dataset.geloest = 'ja';
        k.disabled = !frei(i);
        k.addEventListener('click', () => { s.blattZu(); neu(i); });
        d.append(k);
      });
      const n = el('p', 'notiz notiz--klein', g.size + ' von ' + LEVEL.length + ' gelöst. Ein Level darf man überspringen.');
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
          const y0 = r.ty0 * K * Z - 10;
          const y1 = (r.ty1 + 1) * K * Z;
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
    const gewonnen = partien.filter((p) => p.gewonnen === true && Number.isInteger(p.stufe));
    const geloest = new Set(gewonnen.map((p) => p.stufe));
    const ohne = new Set(gewonnen.filter((p) => !p.hilfen).map((p) => p.stufe));
    return [
      { wert: geloest.size + '/' + LEVEL.length, label: 'Level gelöst' },
      { wert: String(ohne.size), label: 'ohne Hinweis gelöst' },
    ];
  }

  Rahmen.anmelden({
    id: 'pins',
    name: 'Riegel',
    unter: 'Wasser, Lava, Gold. Welcher Riegel zuerst?',
    farbe: '#C9632F',
    symbol: '<path d="M4 4v16h16V4"/><path d="M4 11h11"/><circle cx="17.5" cy="11" r="2.5"/><path d="M8 7.5h.01M11 7.5h.01M9.5 6h.01"/>',
    starten,
    auswertung,
  });
})();
