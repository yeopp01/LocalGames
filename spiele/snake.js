/* Schlange – der Handy-Klassiker: Äpfel fressen, länger werden, nirgends
   anstoßen.

   Gelenkt wird mit Wischen, und zwar schon, solange der Finger noch auf dem
   Feld liegt: Jede Bewegung ab 22 Pixeln zählt als eigene Richtung, danach
   beginnt die Messung neu. So gelingt eine Kehre – hoch, dann links – in
   einem Strich, ohne abzusetzen.

   Richtungen landen in einer kurzen Warteschlange statt direkt am Kopf. Wer
   schneller wischt, als die Schlange zieht, verlöre sonst die erste von zwei
   Eingaben – oder schlimmer: Aus „hoch, gleich danach links" im selben Takt
   würde bei einer Schlange, die nach rechts fährt, nur „links" übrig bleiben,
   und das ist die Kehrtwende in den eigenen Hals. */

(() => {
  const N = 17;
  const RICHTUNG = { hoch: [0, -1], runter: [0, 1], links: [-1, 0], rechts: [1, 0] };
  const GEGEN = { hoch: 'runter', runter: 'hoch', links: 'rechts', rechts: 'links' };
  const WISCHEN = 22;
  const WARTEN_MAX = 3;

  /* Sekunden je Feld: am Anfang gemächlich, mit jedem Apfel etwas schneller,
     ab 27 Äpfeln gleichbleibend. */
  const taktFuer = (aepfel) => Math.max(0.07, 0.15 - aepfel * 0.003);

  function apfelSetzen(stand) {
    const belegt = new Set(stand.schlange.map(([x, y]) => y * N + x));
    const frei = [];
    for (let i = 0; i < N * N; i += 1) if (!belegt.has(i)) frei.push(i);
    if (!frei.length) { stand.apfel = null; return; }
    const i = frei[Math.floor(Math.random() * frei.length)];
    stand.apfel = [i % N, Math.floor(i / N)];
  }

  function frisch() {
    const m = Math.floor(N / 2);
    const stand = {
      schlange: [[m, m], [m - 1, m], [m - 2, m]],
      richtung: 'rechts',
      apfel: null,
      aepfel: 0,
      zeit: 0,          // gespielte Sekunden, ohne Pausen
      uhr: 0,           // Sekunden seit dem letzten Feld
      zustand: 'bereit',
      ursache: null,
    };
    apfelSetzen(stand);
    return stand;
  }

  /* Ein Feld vorwärts. Liefert 'wand', 'selbst', 'voll' oder null. */
  function vorwaerts(stand) {
    const [dx, dy] = RICHTUNG[stand.richtung];
    const [kx, ky] = stand.schlange[0];
    const nx = kx + dx;
    const ny = ky + dy;
    if (nx < 0 || ny < 0 || nx >= N || ny >= N) return 'wand';
    const frisst = !!stand.apfel && stand.apfel[0] === nx && stand.apfel[1] === ny;
    // Das Schwanzende rückt im selben Takt weiter. Dorthin darf der Kopf –
    // außer die Schlange wächst gerade und das Ende bleibt liegen.
    const koerper = frisst ? stand.schlange : stand.schlange.slice(0, -1);
    if (koerper.some(([x, y]) => x === nx && y === ny)) return 'selbst';
    stand.schlange.unshift([nx, ny]);
    if (!frisst) {
      stand.schlange.pop();
      return null;
    }
    stand.aepfel += 1;
    apfelSetzen(stand);
    return stand.apfel ? null : 'voll';
  }

  const gueltig = (alt) =>
    !!alt && Array.isArray(alt.schlange) && alt.schlange.length >= 2 && !!RICHTUNG[alt.richtung] &&
    alt.schlange.every((g) => Array.isArray(g) && g[0] >= 0 && g[0] < N && g[1] >= 0 && g[1] < N) &&
    typeof alt.aepfel === 'number' && alt.zustand !== 'vorbei';

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    const wunsch = [];

    function laden() {
      const alt = s.erinnert();
      if (!gueltig(alt)) return frisch();
      // Wer die App mitten im Lauf schließt, kommt in eine Pause zurück –
      // nicht in eine Schlange, die schon wieder fährt.
      if (alt.zustand === 'laeuft') alt.zustand = 'pause';
      return alt;
    }

    const sichern = () => s.merken(stand);
    const bestwert = () => s.partien().reduce((h, p) => Math.max(h, Echtzeit.zahl(p.aepfel)), 0);

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const flaeche = el('div', 'ez-flaeche sn-flaeche');
    const feld = el('div', 'sn-kasten');
    const pad = el('div', 'sn-pad');
    const unten = el('div', 'ez-unten');
    flaeche.append(feld, pad);
    wurzel.append(kopf, flaeche, unten);

    const b = Echtzeit.buehne(feld, { breite: N, hoehe: N, schritt, zeichnen, beiHalt });

    for (const [text, richtung, ort] of [['↑', 'hoch', 'hoch'], ['←', 'links', 'links'], ['↓', 'runter', 'runter'], ['→', 'rechts', 'rechts']]) {
      const k = el('button', 'knopf knopf--still sn-taste', text);
      k.type = 'button';
      k.tabIndex = -1;
      k.dataset.ort = ort;
      k.setAttribute('aria-label', 'Nach ' + richtung);
      // Beim Aufsetzen, nicht beim Loslassen: Ein click kommt erst, wenn der
      // Finger wieder oben ist, und bei 70 ms je Feld ist das ein Feld zu spät.
      b.an(k, 'pointerdown', (e) => { e.preventDefault(); lenken(richtung); });
      pad.append(k);
    }

    s.werkzeuge([
      { label: 'Pause', symbol: Echtzeit.SYMBOL.pause, tun: pauseUmschalten },
      { label: 'Anleitung', symbol: Echtzeit.SYMBOL.anleitung, tun: anleitung },
    ]);

    /* ------------------------------------------------------------ Ablauf */

    function lenken(richtung) {
      if (stand.zustand === 'vorbei') return;
      const letzte = wunsch.length ? wunsch[wunsch.length - 1] : stand.richtung;
      if (richtung !== letzte && richtung !== GEGEN[letzte] && wunsch.length < WARTEN_MAX) wunsch.push(richtung);
      weiter();
    }

    function weiter() {
      if (stand.zustand !== 'bereit' && stand.zustand !== 'pause') return;
      stand.zustand = 'laeuft';
      anzeigen();
      b.los();
    }

    function pauseUmschalten() {
      if (b.laeuft) b.halt();
      else if (stand.zustand === 'pause') weiter();
    }

    function beiHalt() {
      if (stand.zustand === 'laeuft') {
        stand.zustand = 'pause';
        wunsch.length = 0;
      }
      anzeigen();
      sichern();
    }

    function schritt(dt) {
      stand.zeit += dt;
      stand.uhr += dt;
      const takt = taktFuer(stand.aepfel);
      if (stand.uhr < takt) return;
      stand.uhr -= takt;
      while (wunsch.length) {
        const r = wunsch.shift();
        if (r !== stand.richtung && r !== GEGEN[stand.richtung]) { stand.richtung = r; break; }
      }
      const vorher = stand.aepfel;
      const ende = vorwaerts(stand);
      if (ende) { vorbei(ende); return; }
      if (stand.aepfel !== vorher) kopfZeichnen();
    }

    function vorbei(ursache) {
      stand.zustand = 'vorbei';
      stand.ursache = ursache;
      s.notieren({
        aepfel: stand.aepfel,
        laenge: stand.schlange.length,
        dauer: Math.round(stand.zeit * 1000),
      });
      b.halt();
    }

    function neu() {
      stand = frisch();
      wunsch.length = 0;
      anzeigen();
      sichern();
      b.malen();
    }

    /* ----------------------------------------------------------- Anzeige */

    const apfelText = (n) => n + (n === 1 ? ' Apfel' : ' Äpfel');

    function kopfZeichnen() {
      kopf.replaceChildren();
      const a = el('span');
      a.append(el('b', null, String(stand.aepfel)), document.createTextNode(stand.aepfel === 1 ? ' Apfel' : ' Äpfel'));
      kopf.append(a);
      const best = bestwert();
      if (best) kopf.append(el('span', null, 'Bestwert ' + best));
      s.unter('Länge ' + stand.schlange.length);
    }

    function anzeigen() {
      kopfZeichnen();
      const z = stand.zustand;
      pad.hidden = z === 'pause' || z === 'vorbei';
      unten.replaceChildren();
      if (z === 'bereit') {
        b.schild('Wisch los', 'Über das Feld wischen, die Pfeile tippen oder die Pfeiltasten nehmen.');
      } else if (z === 'pause') {
        b.schild('Pause', 'Tippen oder wischen, um weiterzuspielen.');
        unten.append(Echtzeit.kasten('Pause', apfelText(stand.aepfel) + ' bisher.', [
          { text: 'Weiter', tun: weiter },
          { text: 'Neu anfangen', art: 'still', tun: neu },
        ]));
      } else if (z === 'vorbei') {
        const titel = { wand: 'An die Wand.', selbst: 'In den eigenen Schwanz.', voll: 'Das Feld ist voll.' }[stand.ursache] || 'Vorbei.';
        b.schild(titel);
        const best = bestwert();
        unten.append(Echtzeit.kasten(titel,
          apfelText(stand.aepfel) + ', Länge ' + stand.schlange.length + ', ' + s.dauerText(Math.round(stand.zeit * 1000)) + '.' +
          (stand.aepfel > 0 && stand.aepfel >= best ? ' Das ist dein Bestwert.' : ''),
          [{ text: 'Nochmal', tun: neu }]));
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
    }

    function zeichnen(ctx, f) {
      ctx.fillStyle = f.karte;
      ctx.fillRect(0, 0, N, N);
      ctx.fillStyle = f.karteRand;
      ctx.globalAlpha = 0.35;
      for (let y = 0; y < N; y += 1) {
        for (let x = (y % 2); x < N; x += 2) ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;

      if (stand.apfel) {
        const [ax, ay] = stand.apfel;
        ctx.fillStyle = f.rost;
        ctx.beginPath();
        ctx.arc(ax + 0.5, ay + 0.56, 0.36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = f.gruen;
        ctx.beginPath();
        ctx.ellipse(ax + 0.64, ay + 0.2, 0.15, 0.07, -0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      const glied = stand.schlange;
      ctx.fillStyle = f.gruen;
      for (let i = glied.length - 1; i >= 0; i -= 1) {
        const [x, y] = glied[i];
        Echtzeit.rund(ctx, x + 0.1, y + 0.1, 0.8, 0.8, 0.26);
        ctx.fill();
        if (i > 0) {
          // Brücke zum Vorgänger, damit die Schlange ein Körper ist und keine Perlenkette.
          const [vx, vy] = glied[i - 1];
          ctx.fillRect(Math.min(x, vx) + 0.1, Math.min(y, vy) + 0.1, Math.abs(x - vx) + 0.8, Math.abs(y - vy) + 0.8);
        }
      }

      const [kx, ky] = glied[0];
      if (stand.zustand === 'vorbei' && stand.ursache !== 'voll') {
        ctx.fillStyle = f.rost;
        Echtzeit.rund(ctx, kx + 0.1, ky + 0.1, 0.8, 0.8, 0.26);
        ctx.fill();
      }
      const [dx, dy] = RICHTUNG[stand.richtung];
      for (const seite of [-1, 1]) {
        const ex = kx + 0.5 + dx * 0.14 - dy * 0.2 * seite;
        const ey = ky + 0.5 + dy * 0.14 + dx * 0.2 * seite;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ex, ey, 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1B1815';
        ctx.beginPath();
        ctx.arc(ex + dx * 0.04, ey + dy * 0.04, 0.06, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Die Schlange fährt von selbst. Du bestimmst nur die Richtung: wischen über das Feld, die Pfeile darunter tippen oder die Pfeiltasten (auch W A S D) drücken.'));
      d.append(el('p', 'notiz', 'Jeder Apfel macht sie ein Glied länger und ein wenig schneller. Vorbei ist es an der Wand oder am eigenen Körper.'));
      d.append(el('p', 'notiz', 'Du kannst schneller lenken, als sie fährt – bis zu drei Richtungen merkt sie sich und fährt sie der Reihe nach. Eine Kehre ist also „hoch, links" in einem Wisch.'));
      d.append(el('p', 'notiz', 'Leertaste oder der Pause-Knopf oben halten an. Wechselst du die App, hält sie von selbst.'));
      s.blatt({ titel: 'Schlange', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* ---------------------------------------------------------- Steuerung */

    let griff = null;
    b.an(feld, 'pointerdown', (e) => {
      griff = { id: e.pointerId, x: e.clientX, y: e.clientY, gewischt: false };
      try { feld.setPointerCapture(e.pointerId); } catch { /* synthetisch */ }
    });
    b.an(feld, 'pointermove', (e) => {
      if (!griff || e.pointerId !== griff.id) return;
      const dx = e.clientX - griff.x;
      const dy = e.clientY - griff.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < WISCHEN) return;
      lenken(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'rechts' : 'links') : (dy > 0 ? 'runter' : 'hoch'));
      griff.x = e.clientX;
      griff.y = e.clientY;
      griff.gewischt = true;
    });
    b.an(feld, 'pointerup', (e) => {
      if (griff && e.pointerId === griff.id && !griff.gewischt) weiter();
      griff = null;
    });
    b.an(feld, 'pointercancel', () => { griff = null; });

    b.an(window, 'keydown', (e) => {
      if (!Echtzeit.tasteZaehlt(e)) return;
      const r = {
        ArrowUp: 'hoch', ArrowDown: 'runter', ArrowLeft: 'links', ArrowRight: 'rechts',
        w: 'hoch', s: 'runter', a: 'links', d: 'rechts',
      }[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (r) { e.preventDefault(); lenken(r); return; }
      if ((e.key === ' ' || e.key === 'Enter') && !Echtzeit.knopfHatFokus(e)) {
        e.preventDefault();
        if (stand.zustand === 'bereit') weiter();
        else pauseUmschalten();
      } else if (e.key === 'p' || e.key === 'Escape') {
        pauseUmschalten();
      }
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

  function auswertung(partien, hilfe) {
    const z = Echtzeit.zahl;
    const best = partien.reduce((h, p) => Math.max(h, z(p.aepfel)), 0);
    const schnitt = partien.length ? Math.round(partien.reduce((sum, p) => sum + z(p.aepfel), 0) / partien.length) : 0;
    const laengste = partien.reduce((h, p) => Math.max(h, z(p.dauer)), 0);
    return [
      { wert: String(best), label: 'Bestwert' },
      { wert: String(schnitt), label: 'Äpfel im Schnitt' },
      { wert: hilfe.dauerText(laengste), label: 'längste Partie' },
    ];
  }

  Rahmen.anmelden({
    id: 'snake',
    name: 'Schlange',
    unter: 'Fressen, wachsen, nirgends anstoßen.',
    farbe: '#5E8C3A',
    symbol: '<path d="M4 17h7a3 3 0 0 0 3-3v-4a3 3 0 0 1 3-3h3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="7.5" r="2"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
