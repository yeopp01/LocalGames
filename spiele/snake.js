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
  /* So lange nach dem Ende zählt kein Tipp und keine Taste als Neustart: Wer
     gerade noch hektisch lenkt, soll nicht versehentlich neu anfangen. */
  const SPERRE_MS = 500;
  const PFEIL = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5"/></svg>';

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
    let endeUm = 0;

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
    wurzel.append(kopf, flaeche);

    const b = Echtzeit.buehne(feld, { breite: N, hoehe: N, schritt, zeichnen, beiHalt });
    // Die Knöpfe liegen auf dem Feld, ihr Tipp ist aber keine Eingabe fürs Spiel.
    b.an(unten, 'pointerdown', (e) => e.stopPropagation());

    for (const [richtung, ort] of [['hoch', 'hoch'], ['links', 'links'], ['runter', 'runter'], ['rechts', 'rechts']]) {
      const k = el('button', 'knopf knopf--still sn-taste');
      k.innerHTML = PFEIL;
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

    const neustartFrei = () => stand.zustand === 'vorbei' && performance.now() - endeUm >= SPERRE_MS;

    /* Nach dem Ende zählt der nächste Wisch oder Pfeil schon für die nächste
       Partie: Am schnellsten ist man wieder drin, wenn man einfach weiterspielt. */
    function lenken(richtung) {
      if (stand.zustand === 'vorbei') {
        if (!neustartFrei()) return;
        neu();
      }
      const letzte = wunsch.length ? wunsch[wunsch.length - 1] : stand.richtung;
      if (richtung !== letzte && richtung !== GEGEN[letzte] && wunsch.length < WARTEN_MAX) wunsch.push(richtung);
      weiter();
    }

    function weiter() {
      if (stand.zustand !== 'bereit' && stand.zustand !== 'pause') return;
      stand.zustand = 'laeuft';
      // Der Pause-Knopf behielte sonst den Fokus, und die nächste Leertaste
      // ginge an ihn statt ans Spiel.
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      anzeigen();
      b.los();
    }

    function nochmal() {
      neu();
      weiter();
    }

    /** Tipp oder Leertaste nach dem Ende. */
    function nochmalNachSperre() {
      if (neustartFrei()) nochmal();
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
      if (stand.aepfel !== vorher) {
        kopfZeichnen();
        s.fuehlen(8);
      }
    }

    function vorbei(ursache) {
      stand.zustand = 'vorbei';
      stand.ursache = ursache;
      endeUm = performance.now();
      s.fuehlen(30);
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
      unten.replaceChildren();
      // Die Karte weicht dem Kopf aus: Wer weiterspielt, muss ihn sehen, und
      // wer verloren hat, will sehen, woran.
      feld.dataset.schild = z === 'bereit' || stand.schlange[0][1] < N / 2 ? 'unten' : 'oben';
      if (z === 'bereit') {
        b.schild('Wisch los', 'Über das Feld wischen, die Pfeile tippen oder die Pfeiltasten nehmen.');
      } else if (z === 'pause') {
        b.schild('Pause', apfelText(stand.aepfel) + ' bisher. Tippen oder wischen, um weiterzuspielen.');
        unten.append(Echtzeit.kasten('', null, [
          { text: 'Weiter', tun: weiter },
          { text: 'Neu anfangen', art: 'still', tun: nochmal },
        ]));
      } else if (z === 'vorbei') {
        const titel = { wand: 'An die Wand.', selbst: 'In den eigenen Schwanz.', voll: 'Das Feld ist voll.' }[stand.ursache] || 'Vorbei.';
        b.schild(titel, apfelText(stand.aepfel) + ', Länge ' + stand.schlange.length + ', ' + s.dauerText(Math.round(stand.zeit * 1000)) + '.');
        const k = Echtzeit.kasten('', null, [{ text: 'Nochmal', tun: nochmal }]);
        k.querySelector('.knopf').prepend(s.bildzeichen('nochmal'));
        if (stand.aepfel > 0 && stand.aepfel >= bestwert()) k.prepend(el('span', 'ende-marke', 'Das ist dein Bestwert.'));
        k.append(el('p', 'notiz notiz--klein', 'Ein Tipp aufs Feld, ein Wisch oder eine Taste geht auch.'));
        unten.append(k);
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
      // In die Karte auf dem Feld: So bleibt „Nochmal" auch im flachen Fenster
      // im Bild, und die Seite springt nicht.
      if (!unten.hidden) feld.querySelector('.ez-schild').append(unten);
    }

    function zeichnen(ctx, f) {
      ctx.fillStyle = f.karte;
      ctx.fillRect(0, 0, N, N);
      ctx.fillStyle = f.karteRand;
      ctx.globalAlpha = 0.45;
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
          // Brücke von Mitte zu Mitte, damit die Schlange ein Körper ist und keine
          // Perlenkette – und Kopf und Schwanz ihre runden Ecken behalten.
          const [vx, vy] = glied[i - 1];
          if (x === vx) ctx.fillRect(x + 0.1, Math.min(y, vy) + 0.5, 0.8, 1);
          else ctx.fillRect(Math.min(x, vx) + 0.5, y + 0.1, 1, 0.8);
        }
      }

      const [kx, ky] = glied[0];
      // Der Kopf hebt sich ab: Bei einer langen Schlange sucht man ihn sonst.
      ctx.fillStyle = stand.zustand === 'vorbei' && stand.ursache !== 'voll' ? f.rost : 'rgba(0, 0, 0, .24)';
      Echtzeit.rund(ctx, kx + 0.1, ky + 0.1, 0.8, 0.8, 0.26);
      ctx.fill();
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
      d.append(el('p', 'notiz', 'Die Schlange fährt von selbst. Du bestimmst nur die Richtung: wischen über das Feld, die Pfeile tippen oder die Pfeiltasten (auch W A S D) drücken.'));
      d.append(el('p', 'notiz', 'Jeder Apfel macht sie ein Glied länger und ein wenig schneller. Vorbei ist es an der Wand oder am eigenen Körper.'));
      d.append(el('p', 'notiz', 'Du kannst schneller lenken, als sie fährt – bis zu drei Richtungen merkt sie sich und fährt sie der Reihe nach. Eine Kehre ist also „hoch, links" in einem Wisch.'));
      d.append(el('p', 'notiz', 'Leertaste oder der Pause-Knopf oben halten an. Wechselst du die App, hält sie von selbst. Nach dem Ende beginnt ein Tipp, ein Wisch oder eine Taste gleich die nächste Partie.'));
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
      if (griff && e.pointerId === griff.id && !griff.gewischt) {
        if (stand.zustand === 'vorbei') nochmalNachSperre();
        else weiter();
      }
      griff = null;
    });
    b.an(feld, 'pointercancel', () => { griff = null; });

    b.an(window, 'keydown', (e) => {
      if (!Echtzeit.tasteZaehlt(e)) return;
      const r = {
        ArrowUp: 'hoch', ArrowDown: 'runter', ArrowLeft: 'links', ArrowRight: 'rechts',
        w: 'hoch', s: 'runter', a: 'links', d: 'rechts',
      }[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      // Eine gehaltene Taste, die in die Wand führte, beginnt nichts Neues.
      if (e.repeat && stand.zustand === 'vorbei') return;
      if (r) { e.preventDefault(); lenken(r); return; }
      if ((e.key === ' ' || e.key === 'Enter') && !Echtzeit.knopfHatFokus(e)) {
        e.preventDefault();
        if (stand.zustand === 'bereit') weiter();
        else if (stand.zustand === 'vorbei') nochmalNachSperre();
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
    gruppe: 'geschick',
    unter: 'Fressen, wachsen, nirgends anstoßen.',
    farbe: '#5E8C3A',
    symbol: '<path d="M4 17h7a3 3 0 0 0 3-3v-4a3 3 0 0 1 3-3h3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="7.5" r="2"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
