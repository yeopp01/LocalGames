/* Invasoren – Reihen von Außerirdischen rücken vor, eine Kanone hält dagegen.

   Auf dem Handy folgt die Kanone der Bewegung des Fingers, nicht seiner
   Stelle: Der Daumen darf irgendwo auf dem Feld oder der Leiste darunter
   liegen und verdeckt nicht, was er steuert. Solange er aufliegt, feuert
   sie. Wie im Original ist immer nur ein eigener Schuss unterwegs – Dauerfeuer
   ist also kein Vorteil, nur bequem, und ein kurzer Tipp geht nie verloren:
   Er wartet, bis der laufende Schuss aufgeschlagen ist.

   Die Deckungen sind Pixel für Pixel gespeichert und brechen dort weg, wo
   etwas einschlägt – von oben wie von unten, und wo die Reihen sie erreichen.

   Die Figuren sind eigene Pixelbilder im Geist des Automaten von 1978, keine
   Abschrift. */

(() => {
  const B = 180;
  const H = 214;
  const SPALTEN = 9;
  const REIHEN = 5;
  const ANZAHL = SPALTEN * REIHEN;
  const RASTER_X = 16;
  const RASTER_Y = 14;
  const UFO_OBEN = 10;
  const KANONE_OBEN = 200;
  const BODEN = 209;
  const BUNKER_OBEN = 168;
  const BUNKER_B = 22;
  const BUNKER_H = 16;
  const BUNKER_X = [0, 1, 2, 3].map((i) => Math.round(((B - 4 * BUNKER_B) / 5) * (i + 1) + BUNKER_B * i));
  const SCHUSS_TEMPO = 190;
  const KANONE_TEMPO = 80;
  const LEBEN = 3;
  const BONUS_AB = 1500;
  const UFO_WERTE = [50, 100, 150, 300];

  const ARTEN = [
    { punkte: 30, bilder: [
      ['..#..#..', '...##...', '.######.', '##.##.##', '########', '..#..#..', '.#.##.#.', '#.#..#.#'],
      ['.#....#.', '..#..#..', '.######.', '##.##.##', '########', '.#.##.#.', '#......#', '.#....#.'],
    ] },
    { punkte: 20, bilder: [
      ['...#...#...', '....#.#....', '..#######..', '.#########.', '##..###..##', '###########', '.#.#...#.#.', '#.#.....#.#'],
      ['...#...#...', '....#.#....', '..#######..', '.#########.', '##..###..##', '###########', '..#.#.#.#..', '.#.......#.'],
    ] },
    { punkte: 10, bilder: [
      ['...######...', '.##########.', '###..##..###', '############', '.##########.', '..#.#..#.#..', '.#..#..#..#.', '#...#..#...#'],
      ['...######...', '.##########.', '###..##..###', '############', '.##########.', '..#.#..#.#..', '..#..##..#..', '.#...##...#.'],
    ] },
  ];
  const artDerReihe = (r) => (r === 0 ? 0 : r < 3 ? 1 : 2);

  const KANONE = ['......#......', '.....###.....', '....#####....', '.###########.', '#############', '#############', '#############'];
  const KANONE_KNALL = ['..#...#...#..', '#...#...#...#', '..#.#####.#..', '.###########.', '#############', '#.##.###.##.#'];
  const UFO = ['.....######.....', '...##########...', '..############..', '.##.##.##.##.##.', '################', '..###..##..###..', '...#........#...'];
  const KNALL = ['#...#.#...#', '.#.......#.', '..#.....#..', '##.......##', '..#.....#..', '.#.......#.', '#...#.#...#'];
  const BUNKER = [
    '....##############....',
    '...################...',
    '..##################..',
    '.####################.',
    ...new Array(8).fill('######################'),
    '#######........#######',
    '######..........######',
    '#####............#####',
    '#####............#####',
  ];

  /* Ein Pixelbild als ein einziger Pfad. Einzeln gefüllte Rechtecke hätten
     bei krummer Vergrößerung feine Fugen zwischen den Zeilen; ein Pfad wird
     in einem Zug gefüllt und bleibt dicht. */
  function pfad(zeilen, breite) {
    const p = new Path2D();
    const w = breite || zeilen[0].length;
    const lies = Array.isArray(zeilen) && typeof zeilen[0] === 'string'
      ? (x, y) => zeilen[y][x] === '#'
      : (x, y) => zeilen[y * w + x] === 1;
    const h = Array.isArray(zeilen) && typeof zeilen[0] === 'string' ? zeilen.length : zeilen.length / w;
    for (let y = 0; y < h; y += 1) {
      let x = 0;
      while (x < w) {
        if (!lies(x, y)) { x += 1; continue; }
        let e = x;
        while (e < w && lies(e, y)) e += 1;
        p.rect(x, y, e - x, 1);
        x = e;
      }
    }
    return p;
  }

  const neueBunker = () => [0, 1, 2, 3].map(() => BUNKER.join('').split('').map((c) => (c === '#' ? 1 : 0)));

  const formation = (welle) => ({
    lebt: new Array(ANZAHL).fill(1),
    fx: 20,
    fy: 26 + Math.min(welle - 1, 5) * 6,
    fr: 1,
    fUhr: 0.4,
    fBild: 0,
  });

  function frisch() {
    return Object.assign({
      zustand: 'bereit',
      punkte: 0,
      leben: LEBEN,
      welle: 1,
      zeit: 0,
      bonus: false,
      kx: B / 2,
      schuss: null,
      bomben: [],
      bombenUhr: 1.2,
      ufo: null,
      ufoUhr: 20,
      bunker: neueBunker(),
      knall: [],
      getroffen: 0,
      ansage: null,
      ursache: null,
    }, formation(1));
  }

  /** Lage eines Außerirdischen: l, r, o, u als Kasten, cx als Mitte. */
  function alienKasten(st, i) {
    const r = Math.floor(i / SPALTEN);
    const c = i % SPALTEN;
    const art = artDerReihe(r);
    const w = ARTEN[art].bilder[0][0].length;
    const cx = st.fx + c * RASTER_X + 6;
    const l = cx - Math.floor(w / 2);
    const o = st.fy + r * RASTER_Y;
    return { art, cx, l, r: l + w, o, u: o + 8 };
  }

  function intervall(st) {
    const lebend = st.lebt.reduce((a, b) => a + b, 0);
    // Je weniger übrig sind, desto schneller rücken sie – der letzte rast.
    // Aber nicht schneller als 50 Einheiten je Sekunde: Bei 0,025 s war er so
    // schnell wie die Kanone, und kein Vorhalten half mehr.
    return Math.max(0.04, (0.42 * lebend) / ANZAHL) * Math.pow(0.88, Math.min(st.welle - 1, 6));
  }

  const gueltig = (alt) =>
    !!alt && Array.isArray(alt.lebt) && alt.lebt.length === ANZAHL &&
    Array.isArray(alt.bunker) && alt.bunker.length === 4 &&
    alt.bunker.every((b) => Array.isArray(b) && b.length === BUNKER_B * BUNKER_H) &&
    Array.isArray(alt.bomben) && Array.isArray(alt.knall) &&
    typeof alt.punkte === 'number' && typeof alt.kx === 'number' && alt.zustand !== 'vorbei';

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();

    // Eingaben leben nicht im Stand: Nach einer Pause hält niemand mehr eine Taste.
    let links = false;
    let rechts = false;
    let feuer = false;
    let feuerWunsch = false;
    let zug = 0;

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
    const flaeche = el('div', 'ez-flaeche iv-flaeche');
    const feld = el('div', 'iv-kasten');
    const steuer = el('div', 'ez-steuer', 'Hier ziehen lenkt · Berühren feuert');
    const unten = el('div', 'ez-unten');
    flaeche.append(feld, steuer);
    wurzel.append(kopf, flaeche, unten);

    // Vor der Bühne: Die malt schon beim Anlegen das erste Bild.
    const bilder = {
      arten: ARTEN.map((a) => a.bilder.map((z) => pfad(z))),
      kanone: pfad(KANONE),
      kanoneKnall: pfad(KANONE_KNALL),
      ufo: pfad(UFO),
      knall: pfad(KNALL),
    };
    // Die Deckungen ändern sich nur bei Treffern – ihr Pfad wird erst dann neu gebaut.
    let bunkerBilder = [null, null, null, null];

    const b = Echtzeit.buehne(feld, { breite: B, hoehe: H, schritt, zeichnen, beiHalt });

    s.werkzeuge([
      { label: 'Pause', symbol: Echtzeit.SYMBOL.pause, tun: pauseUmschalten },
      { label: 'Anleitung', symbol: Echtzeit.SYMBOL.anleitung, tun: anleitung },
    ]);

    /* ------------------------------------------------------------ Ablauf */

    function weiter() {
      if (stand.zustand !== 'bereit' && stand.zustand !== 'pause') return;
      stand.zustand = 'laeuft';
      zug = 0;
      anzeigen();
      b.los();
    }

    function pauseUmschalten() {
      if (b.laeuft) b.halt();
      else if (stand.zustand === 'pause') weiter();
    }

    function beiHalt() {
      if (stand.zustand === 'laeuft') stand.zustand = 'pause';
      links = rechts = feuer = feuerWunsch = false;
      griff = null;
      zug = 0;
      anzeigen();
      sichern();
    }

    function punkteDazu(st, n) {
      st.punkte += n;
      if (!st.bonus && st.punkte >= BONUS_AB) {
        st.bonus = true;
        st.leben += 1;
        st.ansage = { text: '+1 Leben', t: 1.2 };
      }
      kopfZeichnen();
    }

    function bunkerTreffer(st, x, y) {
      const yi = Math.floor(y) - BUNKER_OBEN;
      if (yi < 0 || yi >= BUNKER_H) return false;
      for (let i = 0; i < 4; i += 1) {
        const xi = Math.floor(x) - BUNKER_X[i];
        if (xi < 0 || xi >= BUNKER_B || !st.bunker[i][yi * BUNKER_B + xi]) continue;
        // Ein Krater statt eines Pixels: Sonst bohrt jeder Schuss nur einen
        // Tunnel von einem Pixel Breite, und die Deckung hielte ewig.
        for (let dy = -2; dy <= 2; dy += 1) {
          for (let dx = -2; dx <= 2; dx += 1) {
            const d = dx * dx + dy * dy;
            const px = xi + dx;
            const py = yi + dy;
            if (px < 0 || py < 0 || px >= BUNKER_B || py >= BUNKER_H) continue;
            if (d <= 2 || (d <= 5 && Math.random() < 0.55)) st.bunker[i][py * BUNKER_B + px] = 0;
          }
        }
        bunkerBilder[i] = null;
        return true;
      }
      return false;
    }

    function getroffen(st, ursache) {
      st.leben -= 1;
      st.getroffen = 1.2;
      st.bomben = [];
      st.schuss = null;
      if (st.leben <= 0) st.ursache = ursache;
      kopfZeichnen();
    }

    function naechsteWelle(st) {
      st.welle += 1;
      Object.assign(st, formation(st.welle));
      st.bunker = neueBunker();
      bunkerBilder = [null, null, null, null];
      st.bomben = [];
      st.schuss = null;
      st.ufo = null;
      st.ansage = { text: 'Welle ' + st.welle, t: 1.4, warten: true };
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

      // Während die Kanone zerspringt oder eine Welle angesagt wird, steht alles.
      if (st.getroffen > 0) {
        st.getroffen -= dt;
        if (st.getroffen <= 0 && st.leben <= 0) vorbei();
        return;
      }
      if (st.ansage && st.ansage.warten) return;

      const achse = (rechts ? 1 : 0) - (links ? 1 : 0);
      st.kx = Math.max(7, Math.min(B - 7, st.kx + achse * KANONE_TEMPO * dt + zug));
      zug = 0;

      if ((feuer || feuerWunsch) && !st.schuss) {
        st.schuss = { x: Math.round(st.kx) + 0.5, y: KANONE_OBEN - 4 };
        feuerWunsch = false;
      }
      if (st.schuss) schussZiehen(st, dt);
      if (st.ansage && st.ansage.warten) return;

      st.fUhr -= dt;
      if (st.fUhr <= 0) {
        st.fUhr += intervall(st);
        if (formationSchritt(st)) return;
      }

      if (bombenZiehen(st, dt)) return;

      st.ufoUhr -= dt;
      if (!st.ufo && st.ufoUhr <= 0) {
        st.ufoUhr = 18 + Math.random() * 10;
        if (st.lebt.reduce((a, v) => a + v, 0) >= 6) {
          const r = Math.random() < 0.5 ? 1 : -1;
          st.ufo = { x: r > 0 ? -10 : B + 10, r };
        }
      }
      if (st.ufo) {
        st.ufo.x += st.ufo.r * 36 * dt;
        if (st.ufo.x < -12 || st.ufo.x > B + 12) st.ufo = null;
      }
    }

    function schussZiehen(st, dt) {
      const sch = st.schuss;
      const von = sch.y;
      sch.y -= SCHUSS_TEMPO * dt;
      // Jede Pixelzeile zwischen alter und neuer Spitze, damit er nicht durch
      // eine dünn gewordene Deckung hindurchspringt.
      for (let y = Math.floor(von); y >= Math.floor(sch.y); y -= 1) {
        if (bunkerTreffer(st, sch.x, y)) { st.schuss = null; return; }
      }
      for (let i = 0; i < ANZAHL; i += 1) {
        if (!st.lebt[i]) continue;
        const a = alienKasten(st, i);
        if (sch.x >= a.l && sch.x <= a.r && sch.y <= a.u && sch.y + 4 >= a.o) {
          st.lebt[i] = 0;
          st.schuss = null;
          st.knall.push({ x: a.cx, y: a.o, t: 0.25, art: 'alien' });
          punkteDazu(st, ARTEN[a.art].punkte);
          if (!st.lebt.some(Boolean)) naechsteWelle(st);
          return;
        }
      }
      for (const bo of st.bomben) {
        if (Math.abs(bo.x - sch.x) < 2 && sch.y <= bo.y + 5 && sch.y + 4 >= bo.y) {
          bo.weg = true;
          st.bomben = st.bomben.filter((x) => !x.weg);
          st.knall.push({ x: sch.x, y: sch.y, t: 0.15, art: 'klein' });
          st.schuss = null;
          return;
        }
      }
      if (st.ufo && Math.abs(st.ufo.x - sch.x) <= 8 && sch.y <= UFO_OBEN + 7 && sch.y + 4 >= UFO_OBEN) {
        const wert = UFO_WERTE[Math.floor(Math.random() * UFO_WERTE.length)];
        st.knall.push({ x: st.ufo.x, y: UFO_OBEN, t: 1, art: 'ufo', text: String(wert) });
        st.ufo = null;
        st.schuss = null;
        punkteDazu(st, wert);
        return;
      }
      if (sch.y < 2) {
        st.knall.push({ x: sch.x, y: 2, t: 0.15, art: 'klein' });
        st.schuss = null;
      }
    }

    /* Liefert true, wenn die Reihen unten angekommen sind – dann steht der Rest des Takts. */
    function formationSchritt(st) {
      let links_ = Infinity;
      let rechts_ = -Infinity;
      for (let i = 0; i < ANZAHL; i += 1) {
        if (!st.lebt[i]) continue;
        const a = alienKasten(st, i);
        links_ = Math.min(links_, a.l);
        rechts_ = Math.max(rechts_, a.r);
      }
      if ((st.fr > 0 && rechts_ + 2 > B - 3) || (st.fr < 0 && links_ - 2 < 3)) {
        st.fy += 6;
        st.fr = -st.fr;
      } else {
        st.fx += 2 * st.fr;
      }
      st.fBild ^= 1;

      let unten_ = -Infinity;
      for (let i = 0; i < ANZAHL; i += 1) {
        if (!st.lebt[i]) continue;
        const a = alienKasten(st, i);
        unten_ = Math.max(unten_, a.u);
        if (a.u <= BUNKER_OBEN) continue;
        // Wer die Deckungen erreicht, frisst sich hindurch.
        for (let j = 0; j < 4; j += 1) {
          for (let y = Math.max(a.o, BUNKER_OBEN); y < Math.min(a.u, BUNKER_OBEN + BUNKER_H); y += 1) {
            for (let x = Math.max(a.l, BUNKER_X[j]); x < Math.min(a.r, BUNKER_X[j] + BUNKER_B); x += 1) {
              const k = (y - BUNKER_OBEN) * BUNKER_B + (x - BUNKER_X[j]);
              if (st.bunker[j][k]) { st.bunker[j][k] = 0; bunkerBilder[j] = null; }
            }
          }
        }
      }
      if (unten_ >= KANONE_OBEN) {
        st.leben = 1;
        getroffen(st, 'gelandet');
        return true;
      }
      return false;
    }

    function bombenZiehen(st, dt) {
      st.bombenUhr -= dt;
      if (st.bombenUhr <= 0) {
        st.bombenUhr = (0.5 + Math.random() * 0.8) * Math.pow(0.9, Math.min(st.welle - 1, 6));
        if (st.bomben.length < Math.min(5, 3 + Math.floor((st.welle - 1) / 2))) bombeWerfen(st);
      }
      const tempo = Math.min(95, 55 + st.welle * 5);
      for (const bo of st.bomben) {
        const von = bo.y + 5;
        bo.y += tempo * dt;
        bo.t += dt;
        for (let y = Math.floor(von); y <= Math.floor(bo.y + 5); y += 1) {
          if (bunkerTreffer(st, bo.x, y)) { bo.weg = true; break; }
        }
        if (bo.weg) continue;
        const dx = Math.abs(bo.x - (Math.round(st.kx) + 0.5));
        const spitze = bo.y + 5;
        if (bo.y <= KANONE_OBEN + 7 && ((spitze >= KANONE_OBEN + 3 && dx <= 6.5) || (spitze >= KANONE_OBEN && dx <= 1.5))) {
          getroffen(st, 'abgeschossen');
          return true;
        }
        if (spitze >= BODEN) {
          bo.weg = true;
          st.knall.push({ x: bo.x, y: BODEN - 3, t: 0.15, art: 'klein' });
        }
      }
      st.bomben = st.bomben.filter((x) => !x.weg);
      return false;
    }

    function bombeWerfen(st) {
      // Geworfen wird nur von unten: je Spalte der unterste, der noch lebt.
      const unterste = [];
      for (let c = 0; c < SPALTEN; c += 1) {
        for (let r = REIHEN - 1; r >= 0; r -= 1) {
          if (st.lebt[r * SPALTEN + c]) { unterste.push(r * SPALTEN + c); break; }
        }
      }
      if (!unterste.length) return;
      let i;
      if (Math.random() < 0.35) {
        const abstand = (j) => Math.abs(alienKasten(st, j).cx - st.kx);
        i = unterste.reduce((best, j) => (abstand(j) < abstand(best) ? j : best));
      } else {
        i = unterste[Math.floor(Math.random() * unterste.length)];
      }
      const a = alienKasten(st, i);
      st.bomben.push({ x: a.cx + 0.5, y: a.u, t: 0, art: Math.random() < 0.5 ? 0 : 1 });
    }

    function vorbei() {
      stand.zustand = 'vorbei';
      s.notieren({
        punkte: stand.punkte,
        welle: stand.welle,
        dauer: Math.round(stand.zeit * 1000),
      });
      b.halt();
    }

    function neu() {
      stand = frisch();
      bunkerBilder = [null, null, null, null];
      anzeigen();
      sichern();
      b.malen();
    }

    /* ----------------------------------------------------------- Anzeige */

    function kopfZeichnen() {
      kopf.replaceChildren();
      const p = el('span');
      p.append(el('b', null, String(stand.punkte)), document.createTextNode(' Punkte'));
      kopf.append(p, el('span', null, 'Welle ' + stand.welle), el('span', null, Math.max(0, stand.leben) + ' Leben'));
      const best = bestwert();
      s.unter(best ? 'Bestwert ' + best : '');
    }

    function anzeigen() {
      kopfZeichnen();
      const z = stand.zustand;
      steuer.hidden = z === 'pause' || z === 'vorbei';
      unten.replaceChildren();
      if (z === 'bereit') {
        b.schild('Tippen zum Starten', 'Ziehen lenkt die Kanone, solange der Finger liegt, feuert sie. Am Rechner: Pfeile und Leertaste.');
      } else if (z === 'pause') {
        b.schild('Pause', 'Tippen, um weiterzuspielen.');
        unten.append(Echtzeit.kasten('Pause', stand.punkte + ' Punkte in Welle ' + stand.welle + '.', [
          { text: 'Weiter', tun: weiter },
          { text: 'Neu anfangen', art: 'still', tun: neu },
        ]));
      } else if (z === 'vorbei') {
        const titel = stand.ursache === 'gelandet' ? 'Sie sind gelandet.' : 'Abgeschossen.';
        b.schild(titel);
        const best = bestwert();
        unten.append(Echtzeit.kasten(titel,
          stand.punkte + ' Punkte, Welle ' + stand.welle + ', ' + s.dauerText(Math.round(stand.zeit * 1000)) + '.' +
          (stand.punkte > 0 && stand.punkte >= best ? ' Das ist dein Bestwert.' : ''),
          [{ text: 'Nochmal', tun: neu }]));
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
    }

    function zeichnen(ctx, f) {
      const st = stand;
      ctx.fillStyle = f.karte;
      ctx.fillRect(0, 0, B, H);
      ctx.fillStyle = f.gruen;
      ctx.fillRect(0, BODEN, B, 1);

      ctx.fillStyle = f.tinte;
      for (let i = 0; i < ANZAHL; i += 1) {
        if (!st.lebt[i]) continue;
        const a = alienKasten(st, i);
        ctx.save();
        ctx.translate(a.l, a.o);
        ctx.fill(bilder.arten[a.art][st.fBild]);
        ctx.restore();
      }

      if (st.ufo) {
        ctx.fillStyle = f.rost;
        ctx.save();
        ctx.translate(Math.round(st.ufo.x) - 8, UFO_OBEN);
        ctx.fill(bilder.ufo);
        ctx.restore();
      }

      ctx.fillStyle = f.gruen;
      for (let i = 0; i < 4; i += 1) {
        if (!bunkerBilder[i]) bunkerBilder[i] = pfad(st.bunker[i], BUNKER_B);
        ctx.save();
        ctx.translate(BUNKER_X[i], BUNKER_OBEN);
        ctx.fill(bunkerBilder[i]);
        ctx.restore();
      }

      ctx.save();
      if (st.getroffen > 0) {
        ctx.fillStyle = f.rost;
        ctx.translate(Math.round(st.kx) - 6, KANONE_OBEN + 1);
        ctx.fill(bilder.kanoneKnall);
      } else if (st.zustand !== 'vorbei') {
        ctx.fillStyle = f.gruen;
        ctx.translate(Math.round(st.kx) - 6, KANONE_OBEN);
        ctx.fill(bilder.kanone);
      }
      ctx.restore();

      ctx.fillStyle = f.tinte;
      if (st.schuss) ctx.fillRect(st.schuss.x - 0.5, st.schuss.y, 1, 4);

      ctx.fillStyle = f.rost;
      for (const bo of st.bomben) {
        const takt = Math.floor(bo.t * 12);
        if (bo.art === 0) {
          ctx.fillRect(bo.x - 0.5, bo.y, 1, 5);
          ctx.fillRect(bo.x - 1.5, bo.y + (takt % 4), 3, 1);
        } else {
          for (let k = 0; k < 5; k += 1) ctx.fillRect(bo.x - 0.5 + ((k + takt) % 2 ? 0.7 : -0.7), bo.y + k, 1, 1);
        }
      }

      for (const k of st.knall) {
        if (k.art === 'alien') {
          ctx.fillStyle = f.tinte;
          ctx.save();
          ctx.translate(k.x - 5, k.y);
          ctx.fill(bilder.knall);
          ctx.restore();
        } else if (k.art === 'ufo') {
          ctx.fillStyle = f.rost;
          ctx.font = '700 8px "DM Mono", ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(k.text, k.x, UFO_OBEN + 7);
        } else {
          ctx.fillStyle = f.rost;
          ctx.fillRect(k.x - 1.5, k.y - 0.5, 3, 1);
          ctx.fillRect(k.x - 0.5, k.y - 1.5, 1, 3);
        }
      }

      if (st.ansage) {
        ctx.fillStyle = f.tinte;
        ctx.font = '800 14px "Bricolage Grotesque", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(st.ansage.text, B / 2, 140);
      }
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Leg den Finger aufs Feld oder auf die Leiste darunter und zieh nach links oder rechts – die Kanone folgt der Bewegung. Solange der Finger liegt, feuert sie. Am Rechner: Pfeiltasten oder A und D, Leertaste feuert.'));
      d.append(el('p', 'notiz', 'Es ist immer nur ein Schuss unterwegs. Oben 30 Punkte, in der Mitte 20, unten 10. Das Schiff, das ab und zu oben vorbeizieht, bringt 50 bis 300.'));
      d.append(el('p', 'notiz', 'Die grünen Deckungen fangen Bomben ab – und deine Schüsse. Jeder Treffer bricht ein Stück heraus.'));
      d.append(el('p', 'notiz', 'Drei Kanonen hast du, bei 1500 Punkten kommt eine dazu. Je weniger Angreifer übrig sind, desto schneller rücken sie. Erreichen sie die Kanone, ist es vorbei.'));
      s.blatt({ titel: 'Invasoren', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* ---------------------------------------------------------- Steuerung */

    let griff = null;
    b.an(flaeche, 'pointerdown', (e) => {
      if (stand.zustand === 'vorbei' || griff) return;
      e.preventDefault();
      griff = { id: e.pointerId, x: e.clientX };
      try { flaeche.setPointerCapture(e.pointerId); } catch { /* synthetisch */ }
      feuer = true;
      feuerWunsch = true;
      weiter();
    });
    b.an(flaeche, 'pointermove', (e) => {
      if (!griff || e.pointerId !== griff.id) return;
      if (b.laeuft) zug += (e.clientX - griff.x) / b.masstab;
      griff.x = e.clientX;
    });
    const loslassen = (e) => {
      if (!griff || e.pointerId !== griff.id) return;
      griff = null;
      feuer = false;
    };
    b.an(flaeche, 'pointerup', loslassen);
    b.an(flaeche, 'pointercancel', loslassen);

    const tasteVon = (e) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    b.an(window, 'keydown', (e) => {
      if (!Echtzeit.tasteZaehlt(e)) return;
      const k = tasteVon(e);
      if (k === 'ArrowLeft' || k === 'a') { e.preventDefault(); links = true; weiter(); }
      else if (k === 'ArrowRight' || k === 'd') { e.preventDefault(); rechts = true; weiter(); }
      else if ((k === ' ' && !Echtzeit.knopfHatFokus(e)) || k === 'ArrowUp' || k === 'w') {
        e.preventDefault();
        if (!e.repeat) feuerWunsch = true;
        feuer = true;
        weiter();
      } else if (k === 'p' || k === 'Escape') {
        pauseUmschalten();
      }
    });
    b.an(window, 'keyup', (e) => {
      const k = tasteVon(e);
      if (k === 'ArrowLeft' || k === 'a') links = false;
      else if (k === 'ArrowRight' || k === 'd') rechts = false;
      else if (k === ' ' || k === 'ArrowUp' || k === 'w') feuer = false;
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
    const welle = partien.reduce((h, p) => Math.max(h, z(p.welle)), 0);
    const schnitt = partien.length ? Math.round(partien.reduce((sum, p) => sum + z(p.punkte), 0) / partien.length) : 0;
    return [
      { wert: String(best), label: 'Bestwert' },
      { wert: String(welle), label: 'höchste Welle' },
      { wert: String(schnitt), label: 'Punkte im Schnitt' },
    ];
  }

  Rahmen.anmelden({
    id: 'invaders',
    name: 'Invasoren',
    unter: 'Reihe um Reihe rücken sie an. Halt sie auf.',
    farbe: '#3D4F7C',
    symbol: '<path d="M8 4l2 3M16 4l-2 3"/><rect x="5" y="7" width="14" height="8" rx="2"/><path d="M9.5 11h.01M14.5 11h.01M7 15l-2 4M17 15l2 4M10 15v3M14 15v3"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
