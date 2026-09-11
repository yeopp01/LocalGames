/* Hochhinaus – von Plattform zu Plattform, immer höher, auf Karopapier.

   Gesprungen wird von selbst; der Spieler lenkt nur nach links und rechts.
   Das Vorbild kippt dafür das Handy. Das geht hier auch, ist aber nicht die
   Vorgabe: Neigen braucht auf dem iPhone eine Erlaubnis, fehlt auf dem
   Rechner ganz und dreht sich beim Spielen im Liegen gegen einen. Vorgabe ist
   Halten – linke Hälfte nach links, rechte nach rechts.

   Die Plattformen entstehen beim Klettern, und jede feste liegt so dicht
   über der vorigen, dass ein gewöhnlicher Sprung sie erreicht (Sprunghöhe
   97,5, Abstand höchstens 78). Brüchige Plattformen sind nur Zugabe
   dazwischen – sie sind nie die einzige Stufe nach oben. */

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

  /* Legt Plattformen an, bis eine Bildschirmhöhe über der Kamera belegt ist. */
  function erzeugen(st) {
    while (st.oben > st.kamera - 60) {
      const h = START_Y - st.oben;
      const min = 16 + Math.min(24, h / 200);
      const max = Math.min(MAX_LUECKE, 34 + h / 70);
      const y = st.oben - (min + Math.random() * (max - min));
      const wandert = h > 1200 && Math.random() < Math.min(0.4, (h - 1200) / 5000);
      const p = { x: Math.random() * (B - PLATTE_B), y, art: wandert ? 'wandernd' : 'fest' };
      if (wandert) p.vx = (Math.random() < 0.5 ? -1 : 1) * (22 + Math.min(40, h / 250));
      else if (h > 300 && Math.random() < 0.07) p.feder = 4 + Math.random() * (PLATTE_B - FEDER_B - 8);
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
  }

  function frisch(steuerung) {
    const st = {
      zustand: 'bereit',
      steuerung: steuerung === 'neigen' ? 'neigen' : 'tippen',
      figur: { x: B / 2, y: START_Y, vx: 0, vy: 0, blick: 1 },
      platten: [{ x: B / 2 - PLATTE_B / 2, y: START_Y, art: 'fest' }],
      kamera: 0,
      oben: START_Y,
      hoechste: 0,
      zeit: 0,
    };
    erzeugen(st);
    return st;
  }

  const meterVon = (st) => Math.floor(st.hoechste / METER);

  const gueltig = (alt) =>
    !!alt && alt.figur && typeof alt.figur.y === 'number' && typeof alt.figur.x === 'number' &&
    Array.isArray(alt.platten) && typeof alt.kamera === 'number' && typeof alt.oben === 'number' &&
    alt.zustand !== 'vorbei';

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();

    const halten = new Map();      // Zeiger → -1 oder 1, in der Reihenfolge des Aufsetzens
    let tasteL = false;
    let tasteR = false;
    let neigung = 0;
    let neigungGemeldet = false;
    let pruefUhr = 0;

    function laden() {
      const alt = s.erinnert();
      if (!gueltig(alt)) return frisch(alt && alt.steuerung);
      if (alt.zustand === 'laeuft') alt.zustand = 'pause';
      return alt;
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

    s.werkzeuge([
      { label: 'Pause', symbol: Echtzeit.SYMBOL.pause, tun: pauseUmschalten },
      { label: 'Anleitung', symbol: Echtzeit.SYMBOL.anleitung, tun: anleitung },
    ]);

    /* ------------------------------------------------------------ Ablauf */

    function weiter() {
      if (stand.zustand !== 'bereit' && stand.zustand !== 'pause') return;
      if (stand.zustand === 'bereit') stand.figur.vy = SPRUNG;
      stand.zustand = 'laeuft';
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
      anzeigen();
      sichern();
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

      const ziel = achse() * LAUF;
      const d = BESCHL * dt;
      f.vx += Math.max(-d, Math.min(d, ziel - f.vx));
      f.x += f.vx * dt;
      if (Math.abs(f.vx) > 20) f.blick = Math.sign(f.vx);
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

      const alt = f.y;
      f.vy += SCHWERE * dt;
      f.y += f.vy * dt;

      // Gelandet wird nur im Fallen, und nur, wenn die Füße die Oberkante in
      // diesem Takt überquert haben – von unten springt man durch.
      if (f.vy > 0) {
        for (const p of st.platten) {
          if (p.art === 'weg') continue;
          if (alt > p.y || f.y < p.y) continue;
          if (!(f.x + FUSS > p.x && f.x - FUSS < p.x + PLATTE_B)) continue;
          if (p.art === 'bruechig') {
            p.art = 'weg';
            p.fall = 0;
            continue;
          }
          f.y = p.y;
          const aufFeder = p.feder != null && f.x + FUSS > p.x + p.feder && f.x - FUSS < p.x + p.feder + FEDER_B;
          f.vy = aufFeder ? FEDER : SPRUNG;
          if (aufFeder) p.gespannt = 0.2;
          break;
        }
      }

      if (f.y - st.kamera < H * KAMERA) st.kamera = f.y - H * KAMERA;
      const hoehe = START_Y - f.y;
      if (hoehe > st.hoechste) {
        const vorher = meterVon(st);
        st.hoechste = hoehe;
        if (meterVon(st) !== vorher) kopfZeichnen();
      }
      erzeugen(st);
      st.platten = st.platten.filter((p) => p.y - st.kamera < H + 40 && !(p.art === 'weg' && p.fall > 1));

      if (f.y - 16 - st.kamera > H) vorbei();
    }

    function vorbei() {
      stand.zustand = 'vorbei';
      s.notieren({ meter: meterVon(stand), dauer: Math.round(stand.zeit * 1000) });
      b.halt();
    }

    function neu() {
      stand = frisch(stand.steuerung);
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

    function kopfZeichnen() {
      kopf.replaceChildren();
      const p = el('span');
      p.append(el('b', null, String(meterVon(stand))), document.createTextNode(' m'));
      kopf.append(p);
      const best = bestwert();
      if (best) kopf.append(el('span', null, 'Bestwert ' + best + ' m'));
      s.unter(stand.steuerung === 'neigen' ? 'Gesteuert mit Neigen' : '');
    }

    function steuerKnopf() {
      return { text: stand.steuerung === 'neigen' ? 'Mit Halten steuern' : 'Mit Neigen steuern', art: 'still', tun: steuerungWechseln };
    }

    function anzeigen() {
      kopfZeichnen();
      const z = stand.zustand;
      steuer.hidden = z === 'pause' || z === 'vorbei';
      unten.replaceChildren();
      if (z === 'bereit') {
        b.schild('Tippen zum Springen', stand.steuerung === 'neigen'
          ? 'Neig das Handy, um zu lenken.'
          : 'Links halten lenkt nach links, rechts nach rechts. Am Rechner: Pfeiltasten.');
        const l = el('div', 'leiste');
        const k = el('button', 'knopf knopf--still', steuerKnopf().text);
        k.type = 'button';
        k.addEventListener('click', steuerungWechseln);
        l.append(k);
        unten.append(l);
      } else if (z === 'pause') {
        b.schild('Pause', 'Tippen, um weiterzuspringen.');
        unten.append(Echtzeit.kasten('Pause', meterVon(stand) + ' m bisher.', [
          { text: 'Weiter', tun: weiter },
          { text: 'Neu anfangen', art: 'still', tun: neu },
          steuerKnopf(),
        ]));
      } else if (z === 'vorbei') {
        b.schild('Abgestürzt.');
        const best = bestwert();
        const m = meterVon(stand);
        unten.append(Echtzeit.kasten('Abgestürzt.',
          m + ' m hoch in ' + s.dauerText(Math.round(stand.zeit * 1000)) + '.' +
          (m > 0 && m >= best ? ' Das ist dein Bestwert.' : ''),
          [{ text: 'Nochmal', tun: neu }]));
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
    }

    function figurMalen(ctx, f, x, y, figur) {
      const blick = figur.blick || 1;
      const steigt = figur.vy < -120;
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
      Echtzeit.rund(ctx, x + blick * 5 - 2.5, y - 12.5, 5, 4, 2);
      ctx.fill();
      ctx.stroke();
      for (const dx of [-2.2, 2.4]) {
        const ax = x + dx + blick * 1.2;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ax, y - 13, 1.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1B1815';
        ctx.beginPath();
        ctx.arc(ax + blick * 0.7, y - 13, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function zeichnen(ctx, f) {
      const st = stand;
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

      for (const p of st.platten) {
        const y = p.y - st.kamera;
        if (y < -10 || y > H + 10) continue;
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
      }

      const fig = st.figur;
      const fy = fig.y - st.kamera;
      figurMalen(ctx, f, fig.x, fy, fig);
      // Am Rand halb hier, halb drüben: Die Figur ist auf beiden Seiten zu sehen.
      if (fig.x < 8) figurMalen(ctx, f, fig.x + B, fy, fig);
      if (fig.x > B - 8) figurMalen(ctx, f, fig.x - B, fy, fig);
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Die Figur springt von allein. Du lenkst nur: halte links neben der Mitte, um nach links zu laufen, rechts für rechts. Am Rechner die Pfeiltasten oder A und D.'));
      d.append(el('p', 'notiz', 'Wer lieber das Handy neigt, stellt das unter dem Feld oder in der Pause um. Auf dem iPhone fragt der Browser dann einmal um Erlaubnis.'));
      d.append(el('p', 'notiz', 'Grüne Plattformen tragen, blaue wandern hin und her, rostrote brechen beim ersten Tritt. Eine Feder schießt dich weit nach oben.'));
      d.append(el('p', 'notiz', 'Wer links hinausläuft, kommt rechts wieder herein. Wer unten aus dem Bild fällt, ist abgestürzt. Gezählt wird die größte Höhe.'));
      s.blatt({ titel: 'Hochhinaus', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* ---------------------------------------------------------- Steuerung */

    const seiteVon = (e) => {
      const r = flaeche.getBoundingClientRect();
      return e.clientX < r.left + r.width / 2 ? -1 : 1;
    };
    b.an(flaeche, 'pointerdown', (e) => {
      if (stand.zustand === 'vorbei') return;
      e.preventDefault();
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
      else if ((k === ' ' || k === 'Enter') && !Echtzeit.knopfHatFokus(e)) {
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
      },
    };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien, hilfe) {
    const z = Echtzeit.zahl;
    const best = partien.reduce((h, p) => Math.max(h, z(p.meter)), 0);
    const schnitt = partien.length ? Math.round(partien.reduce((sum, p) => sum + z(p.meter), 0) / partien.length) : 0;
    const laengste = partien.reduce((h, p) => Math.max(h, z(p.dauer)), 0);
    return [
      { wert: best + ' m', label: 'Bestwert' },
      { wert: schnitt + ' m', label: 'Höhe im Schnitt' },
      { wert: hilfe.dauerText(laengste), label: 'längste Partie' },
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
