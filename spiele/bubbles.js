/* Blasen – zielen, abprallen lassen, drei gleiche Farben zum Platzen bringen.

   Bubble Shooter für den Finger: Der Finger liegt irgendwo auf dem Feld, die
   Kanone zielt auf ihn, und beim Loslassen fliegt die Blase. Wer es sich
   anders überlegt, zieht den Finger unter die Kanone und lässt dort los – das
   schießt nicht. Die gestrichelte Linie zeigt den Flug bis zur ersten Blase,
   über höchstens eine Bande. Zwei Banden rechnet man selbst.

   Das Feld ist ein Sechseckraster: jede zweite Reihe um eine halbe Blase
   versetzt. Kommt oben eine Reihe dazu, rutscht alles eine Reihe tiefer, und
   damit wechselt, welche Reihen versetzt sind – `versatz` merkt sich das,
   statt das ganze Gitter umzuschreiben.

   Druck kommt nicht von einer Uhr, sondern von Fehlschüssen: Wer eine Blase
   anlegt, ohne dass etwas platzt, verbraucht einen Punkt unter der Kanone.
   Sind alle weg, schiebt sich oben eine neue Reihe herein. Wer nachdenkt,
   verliert also nichts. */

(() => {
  const B = 180;
  const H = 270;
  const SPALTEN = 8;
  const R = 10;
  const RAND = (B - (SPALTEN * 2 + 1) * R) / 2;
  const ZH = R * Math.sqrt(3);
  const OBEN = 2;
  const MAX_REIHEN = 12;               // eine Blase in Reihe 12 ist über der Linie
  const LINIE = OBEN + R + (MAX_REIHEN - 1) * ZH + R + 1.5;
  const SX = B / 2;
  const SY = 250;
  const VORRAT_X = 42;
  const VORRAT_Y = 258;
  const TEMPO = 420;
  const TREFFER = 2 * R * 0.84;        // etwas knapper als die Blasen – so passt man durch Lücken
  const WINKEL_MIN = 0.17;
  const WINKEL_MAX = Math.PI - 0.17;
  const START_REIHEN = 6;
  const FARBEN = ['#D9534F', '#E3AE1F', '#4C9F58', '#3F7FD0', '#9A5BC4', '#26A9A6'];

  const zufall = (n) => Math.floor(Math.random() * n);
  const farbenZahl = (punkte) => 4 + (punkte >= 1500 ? 1 : 0) + (punkte >= 5000 ? 1 : 0);
  const fehlerErlaubt = (reihenDazu) => Math.max(3, 6 - Math.floor(reihenDazu / 5));

  /* Eine Reihe mit kleinen Farbinseln: Rein zufällige Farben ergeben kaum
     Dreiergruppen, und das Feld wirkt wie Konfetti. */
  function neueReihe(unten, farben, versetzt) {
    const reihe = new Array(SPALTEN).fill(-1);
    for (let c = 0; c < SPALTEN; c += 1) {
      const w = Math.random();
      if (c > 0 && w < 0.3) reihe[c] = reihe[c - 1];
      else if (unten && w < 0.55) {
        // Die Nachbarn in der Reihe darunter liegen je nach Versatz links oder rechts.
        const k = Math.min(SPALTEN - 1, Math.max(0, versetzt ? c : c - 1 + zufall(2)));
        reihe[c] = unten[k] >= 0 && unten[k] < farben ? unten[k] : zufall(farben);
      } else reihe[c] = zufall(farben);
    }
    return reihe;
  }

  function frisch() {
    const gitter = [];
    for (let r = START_REIHEN - 1; r >= 0; r -= 1) gitter.unshift(neueReihe(gitter[0], 4, r % 2 === 1));
    const st = {
      zustand: 'bereit',
      gitter,
      versatz: 0,
      punkte: 0,
      blasen: 0,
      zeit: 0,
      fehl: 0,
      reihenDazu: 0,
      winkel: Math.PI / 2,
      flug: null,
      geladen: 0,
      naechste: 0,
    };
    st.geladen = ziehen(st);
    st.naechste = ziehen(st);
    return st;
  }

  /* ------------------------------------------------------------- Gitter */

  const versetzt = (st, r) => (r + st.versatz) % 2 === 1;
  const mitteX = (st, r, c) => RAND + R + c * 2 * R + (versetzt(st, r) ? R : 0);
  const mitteY = (r) => OBEN + R + r * ZH;
  const belegt = (st, r, c) => r >= 0 && r < st.gitter.length && c >= 0 && c < SPALTEN && st.gitter[r][c] >= 0;

  function nachbarn(st, r, c) {
    const v = versetzt(st, r);
    const liste = [[r, c - 1], [r, c + 1]];
    for (const rr of [r - 1, r + 1]) {
      if (v) liste.push([rr, c], [rr, c + 1]);
      else liste.push([rr, c - 1], [rr, c]);
    }
    return liste.filter(([a, b]) => a >= 0 && b >= 0 && b < SPALTEN);
  }

  /** Farbe für die nächste Blase – nur eine, die noch im Feld liegt. */
  function ziehen(st) {
    const da = new Set();
    for (const reihe of st.gitter) for (const f of reihe) if (f >= 0) da.add(f);
    const liste = [...da];
    return liste.length ? liste[zufall(liste.length)] : zufall(farbenZahl(st.punkte));
  }

  const leerGitter = (st) => st.gitter.every((reihe) => reihe.every((f) => f < 0));

  function stutzen(st) {
    while (st.gitter.length && st.gitter[st.gitter.length - 1].every((f) => f < 0)) st.gitter.pop();
  }

  /* Flug einer Blase ab (x, y) in Richtung (dx, dy), bis sie anstößt.
     Gemeinsam für den echten Flug und die Ziellinie, damit die Linie nie
     etwas anderes zeigt, als dann passiert. Liefert Punkte und ob sie an einer
     Blase oder der Decke hängen bleibt. `banden` begrenzt die Abpraller. */
  function bahn(st, x, y, dx, dy, banden) {
    const punkte = [[x, y]];
    let abpraller = 0;
    const schritt = 2;
    for (let i = 0; i < 600; i += 1) {
      x += dx * schritt;
      y += dy * schritt;
      if (x < RAND + R) { x = 2 * (RAND + R) - x; dx = -dx; abpraller += 1; punkte.push([x, y]); }
      else if (x > B - RAND - R) { x = 2 * (B - RAND - R) - x; dx = -dx; abpraller += 1; punkte.push([x, y]); }
      if (abpraller > banden) return { punkte, ende: null };
      if (y <= OBEN + R || anstoss(st, x, y)) {
        punkte.push([x, Math.max(y, OBEN + R)]);
        return { punkte, ende: [x, Math.max(y, OBEN + R)] };
      }
    }
    return { punkte, ende: null };
  }

  function anstoss(st, x, y) {
    const r0 = Math.floor((y - OBEN) / ZH);
    for (let r = r0 - 1; r <= r0 + 1; r += 1) {
      if (r < 0 || r >= st.gitter.length) continue;
      for (let c = 0; c < SPALTEN; c += 1) {
        if (st.gitter[r][c] < 0) continue;
        if ((mitteX(st, r, c) - x) ** 2 + (mitteY(r) - y) ** 2 < TREFFER * TREFFER) return true;
      }
    }
    return false;
  }

  /** Das freie Feld, in dem eine Blase an (x, y) liegen bleibt: das nächste,
      das an der Decke oder an einer anderen Blase hängt. */
  function einrasten(st, x, y) {
    let best = null;
    const r0 = Math.round((y - OBEN - R) / ZH);
    for (let r = Math.max(0, r0 - 1); r <= r0 + 1; r += 1) {
      for (let c = 0; c < SPALTEN; c += 1) {
        if (belegt(st, r, c)) continue;
        const haengt = r === 0 || nachbarn(st, r, c).some(([a, b]) => belegt(st, a, b));
        if (!haengt) continue;
        const d = (mitteX(st, r, c) - x) ** 2 + (mitteY(r) - y) ** 2;
        if (!best || d < best.d) best = { r, c, d };
      }
    }
    return best;
  }

  /* ------------------------------------------------------------------ Spiel */

  const gueltig = (alt) =>
    !!alt && Array.isArray(alt.gitter) &&
    alt.gitter.every((z) => Array.isArray(z) && z.length === SPALTEN && z.every((f) => Number.isInteger(f) && f >= -1 && f < FARBEN.length)) &&
    typeof alt.punkte === 'number' && typeof alt.winkel === 'number' &&
    Number.isInteger(alt.geladen) && Number.isInteger(alt.naechste) && alt.zustand !== 'vorbei';

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let fallen = [];        // platzende und fallende Blasen – nur fürs Bild, nicht im Stand
    let drehen = 0;         // Pfeiltasten: -1, 0, 1

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
    const flaeche = el('div', 'ez-flaeche bl-flaeche');
    const feld = el('div', 'bl-kasten');
    const unten = el('div', 'ez-unten');
    flaeche.append(feld);
    wurzel.append(kopf, flaeche, unten);

    const b = Echtzeit.buehne(feld, { breite: B, hoehe: H, schritt, zeichnen, beiHalt });

    s.werkzeuge([
      { label: 'Pause', symbol: Echtzeit.SYMBOL.pause, tun: pauseUmschalten },
      { label: 'Anleitung', symbol: Echtzeit.SYMBOL.anleitung, tun: anleitung },
    ]);

    /* ------------------------------------------------------------ Ablauf */

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
      if (stand.zustand === 'laeuft') stand.zustand = 'pause';
      griff = null;
      drehen = 0;
      anzeigen();
      sichern();
    }

    function schiessen() {
      if (stand.zustand !== 'laeuft' || stand.flug) return;
      const dx = Math.cos(stand.winkel);
      const dy = -Math.sin(stand.winkel);
      stand.flug = { x: SX, y: SY, dx, dy, farbe: stand.geladen };
      stand.geladen = stand.naechste;
      stand.naechste = ziehen(stand);
    }

    function tauschen() {
      if (stand.zustand !== 'laeuft') return;
      [stand.geladen, stand.naechste] = [stand.naechste, stand.geladen];
    }

    function schritt(dt) {
      const st = stand;
      st.zeit += dt;
      if (drehen) st.winkel = Math.min(WINKEL_MAX, Math.max(WINKEL_MIN, st.winkel - drehen * 1.5 * dt));

      for (const f of fallen) {
        f.t += dt;
        if (f.art === 'fall') { f.vy += 600 * dt; f.y += f.vy * dt; f.x += f.vx * dt; }
      }
      fallen = fallen.filter((f) => (f.art === 'fall' ? f.y < H + R : f.t < 0.22));

      const fl = st.flug;
      if (!fl) return;
      // In Schritten von genau 2 Einheiten wie die Ziellinie in bahn(): So
      // bleibt die Blase dort hängen, wo die Linie endet, und springt nie über
      // eine Blase hinweg. Der Rest wartet auf den nächsten Takt.
      fl.rest = (fl.rest || 0) + TEMPO * dt;
      while (fl.rest >= 2) {
        fl.rest -= 2;
        fl.x += fl.dx * 2;
        fl.y += fl.dy * 2;
        if (fl.x < RAND + R) { fl.x = 2 * (RAND + R) - fl.x; fl.dx = -fl.dx; }
        else if (fl.x > B - RAND - R) { fl.x = 2 * (B - RAND - R) - fl.x; fl.dx = -fl.dx; }
        if (fl.y <= OBEN + R || anstoss(st, fl.x, fl.y)) {
          anlegen(st, fl.x, Math.max(fl.y, OBEN + R), fl.farbe);
          return;
        }
      }
    }

    function anlegen(st, x, y, farbe) {
      st.flug = null;
      const ziel = einrasten(st, x, y);
      if (!ziel) return;
      while (st.gitter.length <= ziel.r) st.gitter.push(new Array(SPALTEN).fill(-1));
      st.gitter[ziel.r][ziel.c] = farbe;

      // Gleiche Farbe, die zusammenhängt.
      const gruppe = [[ziel.r, ziel.c]];
      const gesehen = new Set([ziel.r + ':' + ziel.c]);
      for (let i = 0; i < gruppe.length; i += 1) {
        for (const [a, c] of nachbarn(st, gruppe[i][0], gruppe[i][1])) {
          if (!belegt(st, a, c) || st.gitter[a][c] !== farbe || gesehen.has(a + ':' + c)) continue;
          gesehen.add(a + ':' + c);
          gruppe.push([a, c]);
        }
      }

      if (gruppe.length >= 3) {
        for (const [a, c] of gruppe) {
          fallen.push({ art: 'platz', x: mitteX(st, a, c), y: mitteY(a), farbe: st.gitter[a][c], t: 0 });
          st.gitter[a][c] = -1;
        }
        const lose = abgerissen(st);
        for (const [a, c] of lose) {
          fallen.push({ art: 'fall', x: mitteX(st, a, c), y: mitteY(a), vx: (Math.random() - 0.5) * 40, vy: -40 - Math.random() * 60, farbe: st.gitter[a][c], t: 0 });
          st.gitter[a][c] = -1;
        }
        st.blasen += gruppe.length + lose.length;
        st.punkte += gruppe.length * 10 + lose.length * 20;
        stutzen(st);
        if (leerGitter(st)) {
          st.punkte += 1000;
          for (let r = 0; r < START_REIHEN; r += 1) reiheDazu(st, false);
          s.toast('Feld leer – 1000 Punkte.');
        }
        // Liegt die Farbe der Kanone nicht mehr im Feld, gibt es eine, die noch da ist.
        const da = new Set(st.gitter.flat().filter((f) => f >= 0));
        if (da.size && !da.has(st.geladen)) st.geladen = ziehen(st);
        if (da.size && !da.has(st.naechste)) st.naechste = ziehen(st);
      } else {
        st.fehl += 1;
        if (st.fehl >= fehlerErlaubt(st.reihenDazu)) {
          st.fehl = 0;
          reiheDazu(st, true);
        }
      }
      kopfZeichnen();
      if (st.gitter.length > MAX_REIHEN && st.gitter.slice(MAX_REIHEN).some((z) => z.some((f) => f >= 0))) vorbei();
    }

    /** Alles, was nach dem Platzen nicht mehr über Nachbarn an der Decke hängt. */
    function abgerissen(st) {
      const haengt = new Set();
      const schlange = [];
      for (let c = 0; c < SPALTEN; c += 1) {
        if (belegt(st, 0, c)) { haengt.add('0:' + c); schlange.push([0, c]); }
      }
      for (let i = 0; i < schlange.length; i += 1) {
        for (const [a, c] of nachbarn(st, schlange[i][0], schlange[i][1])) {
          if (!belegt(st, a, c) || haengt.has(a + ':' + c)) continue;
          haengt.add(a + ':' + c);
          schlange.push([a, c]);
        }
      }
      const lose = [];
      st.gitter.forEach((reihe, a) => reihe.forEach((f, c) => { if (f >= 0 && !haengt.has(a + ':' + c)) lose.push([a, c]); }));
      return lose;
    }

    function reiheDazu(st, gezaehlt) {
      st.versatz = (st.versatz + 1) % 2;
      st.gitter.unshift(neueReihe(st.gitter[0], farbenZahl(st.punkte), versetzt(st, 0)));
      if (gezaehlt) st.reihenDazu += 1;
      stutzen(st);
    }

    function vorbei() {
      stand.zustand = 'vorbei';
      stand.flug = null;
      s.notieren({ punkte: stand.punkte, blasen: stand.blasen, dauer: Math.round(stand.zeit * 1000) });
      b.halt();
    }

    function neu() {
      stand = frisch();
      fallen = [];
      anzeigen();
      sichern();
      b.malen();
    }

    /* ----------------------------------------------------------- Anzeige */

    function kopfZeichnen() {
      kopf.replaceChildren();
      const p = el('span');
      p.append(el('b', null, String(stand.punkte)), document.createTextNode(' Punkte'));
      kopf.append(p, el('span', null, stand.blasen + (stand.blasen === 1 ? ' Blase' : ' Blasen')));
      const best = bestwert();
      s.unter(best ? 'Bestwert ' + best : '');
    }

    function anzeigen() {
      kopfZeichnen();
      const z = stand.zustand;
      unten.replaceChildren();
      if (z === 'bereit') {
        b.schild('Zielen und loslassen', 'Finger aufs Feld, die Kanone zielt auf ihn. Loslassen schießt, die Blase links unten tauscht.');
      } else if (z === 'pause') {
        b.schild('Pause', 'Tippen, um weiterzuspielen.');
        unten.append(Echtzeit.kasten('Pause', stand.punkte + ' Punkte bisher.', [
          { text: 'Weiter', tun: weiter },
          { text: 'Neu anfangen', art: 'still', tun: neu },
        ]));
      } else if (z === 'vorbei') {
        b.schild('Über der Linie.');
        const best = bestwert();
        unten.append(Echtzeit.kasten('Über der Linie.',
          stand.punkte + ' Punkte, ' + stand.blasen + (stand.blasen === 1 ? ' Blase' : ' Blasen') + ' in ' +
          s.dauerText(Math.round(stand.zeit * 1000)) + '.' +
          (stand.punkte > 0 && stand.punkte >= best ? ' Das ist dein Bestwert.' : ''),
          [{ text: 'Nochmal', tun: neu }]));
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
    }

    /* Ein Zeichen je Farbe, damit sich die Blasen auch ohne Farbsehen
       unterscheiden lassen. */
    function zeichen(ctx, farbe, x, y, k) {
      ctx.fillStyle = 'rgba(255, 255, 255, .62)';
      ctx.strokeStyle = 'rgba(255, 255, 255, .62)';
      ctx.lineWidth = 1.1 * k;
      ctx.beginPath();
      const g = 2.6 * k;
      if (farbe === 0) { ctx.arc(x, y, g * 0.75, 0, Math.PI * 2); ctx.fill(); }
      else if (farbe === 1) { ctx.moveTo(x, y - g); ctx.lineTo(x + g, y + g * 0.8); ctx.lineTo(x - g, y + g * 0.8); ctx.closePath(); ctx.fill(); }
      else if (farbe === 2) { ctx.rect(x - g * 0.75, y - g * 0.75, g * 1.5, g * 1.5); ctx.fill(); }
      else if (farbe === 3) { ctx.arc(x, y, g * 0.85, 0, Math.PI * 2); ctx.stroke(); }
      else if (farbe === 4) { ctx.moveTo(x, y - g); ctx.lineTo(x + g, y); ctx.lineTo(x, y + g); ctx.lineTo(x - g, y); ctx.closePath(); ctx.fill(); }
      else { ctx.moveTo(x - g, y); ctx.lineTo(x + g, y); ctx.moveTo(x, y - g); ctx.lineTo(x, y + g); ctx.stroke(); }
    }

    function blase(ctx, f, farbe, x, y, k) {
      const r = (R - 0.5) * k;
      ctx.fillStyle = FARBEN[farbe];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, .18)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, .35)';
      ctx.beginPath();
      ctx.ellipse(x - r * 0.35, y - r * 0.42, r * 0.36, r * 0.22, -0.6, 0, Math.PI * 2);
      ctx.fill();
      zeichen(ctx, farbe, x + r * 0.08, y + r * 0.12, k);
    }

    function zeichnen(ctx, f) {
      const st = stand;
      ctx.fillStyle = f.karte;
      ctx.fillRect(0, 0, B, H);
      ctx.fillStyle = f.karteRand;
      ctx.fillRect(0, 0, B, OBEN);

      // Die Linie, über die nichts rutschen darf.
      ctx.strokeStyle = f.rost;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, LINIE);
      ctx.lineTo(B, LINIE);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      st.gitter.forEach((reihe, r) => reihe.forEach((farbe, c) => {
        if (farbe >= 0) blase(ctx, f, farbe, mitteX(st, r, c), mitteY(r), 1);
      }));

      for (const p of fallen) {
        if (p.art === 'platz') {
          ctx.globalAlpha = Math.max(0, 1 - p.t / 0.22);
          blase(ctx, f, p.farbe, p.x, p.y, 1 + p.t * 1.6);
          ctx.globalAlpha = 1;
        } else {
          blase(ctx, f, p.farbe, p.x, p.y, 1);
        }
      }

      // Ziellinie – nur, wenn gerade nichts fliegt.
      if (st.zustand !== 'vorbei' && !st.flug) {
        const weg = bahn(st, SX, SY, Math.cos(st.winkel), -Math.sin(st.winkel), 1);
        ctx.fillStyle = f.tinteStill;
        let rest = 0;
        for (let i = 1; i < weg.punkte.length; i += 1) {
          const [x0, y0] = weg.punkte[i - 1];
          const [x1, y1] = weg.punkte[i];
          const l = Math.hypot(x1 - x0, y1 - y0);
          let t = rest;
          while (t < l) {
            ctx.beginPath();
            ctx.arc(x0 + ((x1 - x0) * t) / l, y0 + ((y1 - y0) * t) / l, 0.9, 0, Math.PI * 2);
            ctx.fill();
            t += 6;
          }
          rest = t - l;
        }
      }

      // Kanone
      ctx.save();
      ctx.translate(SX, SY);
      ctx.rotate(-st.winkel + Math.PI / 2);
      ctx.fillStyle = f.tinteLeise;
      Echtzeit.rund(ctx, -4, -21, 8, 14, 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = f.karteRand;
      ctx.beginPath();
      ctx.arc(SX, SY + 6, 15, Math.PI, 0);
      ctx.fill();
      if (st.zustand !== 'vorbei') blase(ctx, f, st.geladen, SX, SY, 1);
      if (st.flug) blase(ctx, f, st.flug.farbe, st.flug.x, st.flug.y, 1);

      // Vorrat und Fehlschüsse
      blase(ctx, f, st.naechste, VORRAT_X, VORRAT_Y, 0.72);
      ctx.fillStyle = f.tinteStill;
      ctx.font = '500 7px "DM Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('tauschen', VORRAT_X, VORRAT_Y - 10);
      const erlaubt = fehlerErlaubt(st.reihenDazu);
      for (let i = 0; i < erlaubt; i += 1) {
        ctx.fillStyle = i < erlaubt - st.fehl ? f.tinteLeise : f.karteRand;
        ctx.beginPath();
        ctx.arc(120 + i * 8, VORRAT_Y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Leg den Finger aufs Feld – die Kanone zielt auf ihn, die gestrichelte Linie zeigt den Flug. Loslassen schießt. Wer doch nicht schießen will, zieht den Finger unter die Kanone und lässt dort los.'));
      d.append(el('p', 'notiz', 'Drei oder mehr gleiche Farben, die sich berühren, platzen. Alles, was danach nicht mehr oben hängt, fällt mit – das bringt doppelt so viele Punkte.'));
      d.append(el('p', 'notiz', 'Die Blase links unten kommt als nächste. Ein Tipp darauf tauscht sie mit der in der Kanone. Die Wände werfen zurück.'));
      d.append(el('p', 'notiz', 'Die Punkte rechts unten sind deine Fehlschüsse: Jede Blase, bei der nichts platzt, kostet einen. Sind alle weg, schiebt sich oben eine neue Reihe herein. Rutscht eine Blase über die rote Linie, ist es vorbei.'));
      d.append(el('p', 'notiz', 'Am Rechner: Pfeile links und rechts zielen, Leertaste schießt, Pfeil runter oder X tauscht.'));
      s.blatt({ titel: 'Blasen', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* ---------------------------------------------------------- Steuerung */

    function zuFeld(e) {
      const r = b.canvas.getBoundingClientRect();
      return [(e.clientX - r.left) / b.masstab, (e.clientY - r.top) / b.masstab];
    }

    function zielen(x, y) {
      // Unter der Kanone wird nicht gezielt: Dort loszulassen heißt „doch nicht".
      if (y > SY - 4) return false;
      stand.winkel = Math.min(WINKEL_MAX, Math.max(WINKEL_MIN, Math.atan2(SY - y, x - SX)));
      if (!b.laeuft) b.malen();
      return true;
    }

    let griff = null;
    b.an(flaeche, 'pointerdown', (e) => {
      if (stand.zustand === 'vorbei' || griff) return;
      e.preventDefault();
      const [x, y] = zuFeld(e);
      // Eine Pause endet mit dem Tipp, aber dieser Tipp schießt nicht – er
      // träfe irgendwohin, wo der Finger gerade zufällig lag.
      const warPause = stand.zustand === 'pause';
      weiter();
      if ((x - VORRAT_X) ** 2 + (y - VORRAT_Y) ** 2 < 16 * 16) {
        if (!warPause) tauschen();
        return;
      }
      griff = { id: e.pointerId, nurWeiter: warPause };
      if (!warPause) zielen(x, y);
      try { flaeche.setPointerCapture(e.pointerId); } catch { /* synthetisch */ }
    });
    b.an(flaeche, 'pointermove', (e) => {
      if (!griff || e.pointerId !== griff.id || griff.nurWeiter) return;
      zielen(...zuFeld(e));
    });
    b.an(flaeche, 'pointerup', (e) => {
      if (!griff || e.pointerId !== griff.id) return;
      const g = griff;
      griff = null;
      if (!g.nurWeiter && zielen(...zuFeld(e))) schiessen();
    });
    b.an(flaeche, 'pointercancel', (e) => {
      if (griff && e.pointerId === griff.id) griff = null;
    });

    const tasteVon = (e) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    b.an(window, 'keydown', (e) => {
      if (!Echtzeit.tasteZaehlt(e)) return;
      const k = tasteVon(e);
      if (k === 'ArrowLeft' || k === 'a') { e.preventDefault(); drehen = -1; weiter(); }
      else if (k === 'ArrowRight' || k === 'd') { e.preventDefault(); drehen = 1; weiter(); }
      else if ((k === ' ' && !Echtzeit.knopfHatFokus(e)) || k === 'ArrowUp' || k === 'w') {
        e.preventDefault();
        const warBereit = stand.zustand === 'laeuft';
        weiter();
        if (warBereit && !e.repeat) schiessen();
      } else if (k === 'ArrowDown' || k === 's' || k === 'x') {
        e.preventDefault();
        if (!e.repeat) tauschen();
      } else if (k === 'p' || k === 'Escape') {
        pauseUmschalten();
      }
    });
    b.an(window, 'keyup', (e) => {
      const k = tasteVon(e);
      if ((k === 'ArrowLeft' || k === 'a') && drehen < 0) drehen = 0;
      else if ((k === 'ArrowRight' || k === 'd') && drehen > 0) drehen = 0;
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
    const schnitt = partien.length ? Math.round(partien.reduce((sum, p) => sum + z(p.punkte), 0) / partien.length) : 0;
    const blasen = partien.reduce((h, p) => Math.max(h, z(p.blasen)), 0);
    return [
      { wert: String(best), label: 'Bestwert' },
      { wert: String(schnitt), label: 'Punkte im Schnitt' },
      { wert: String(blasen), label: 'meiste Blasen' },
    ];
  }

  Rahmen.anmelden({
    id: 'bubbles',
    name: 'Blasen',
    unter: 'Drei gleiche platzen. Was dran hing, fällt mit.',
    farbe: '#3F7FD0',
    symbol: '<circle cx="7" cy="7" r="3"/><circle cx="13" cy="7" r="3"/><circle cx="10" cy="12.2" r="3"/><circle cx="12" cy="20" r="2.4"/><path d="M12 17.6V15"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
