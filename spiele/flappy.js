/* Flattervogel – ein Tipp, ein Flügelschlag, und zwischen den Röhren hindurch.

   Das Spiel hat genau eine Eingabe und ist damit wie für den Finger gemacht:
   Tippen irgendwo auf das Feld. Getippt wird beim Aufsetzen, nicht beim
   Loslassen – ein Klick käme erst, wenn der Finger wieder oben ist, und das
   sind die 80 ms, die zwischen Röhre und Lücke entscheiden.

   Die Maße sind großzügiger als beim Vorbild: Die Lücke ist gut sechsmal so
   hoch wie der Vogel, und zwei aufeinanderfolgende Lücken liegen höchstens 64
   Einheiten auseinander. Schwer bleibt es trotzdem; unfair soll es nicht
   sein. */

(() => {
  const B = 180;
  const H = 250;
  const BODEN = 226;
  const VOGEL_X = 54;
  const RADIUS = 6;
  const TREFFER = 4.6;        // etwas kleiner als das Bild – ein Streifen Feder zählt nicht
  const SCHWERE = 950;
  const SCHWUNG = -260;
  const FALL_MAX = 340;
  const TEMPO = 62;
  const ROHR = 30;
  const LUECKE = 62;
  const ABSTAND = 96;
  const VERSATZ = 64;

  function neueMitte(vorige) {
    const lo = 44;
    const hi = BODEN - 44;
    const von = vorige == null ? lo : Math.max(lo, vorige - VERSATZ);
    const bis = vorige == null ? hi : Math.min(hi, vorige + VERSATZ);
    return von + Math.random() * (bis - von);
  }

  const frisch = () => ({
    zustand: 'bereit',
    vogel: { y: 110, vy: 0 },
    roehren: [],
    bisRohr: 40,
    punkte: 0,
    zeit: 0,
    weg: 0,
    schlag: 1,
    tot: false,
  });

  /* Kreis gegen Rechteck: nächster Punkt des Rechtecks zum Mittelpunkt. */
  function beruehrt(cx, cy, r, x, y, b, h) {
    const nx = Math.max(x, Math.min(cx, x + b));
    const ny = Math.max(y, Math.min(cy, y + h));
    return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
  }

  const stoesst = (y, rohr) =>
    beruehrt(VOGEL_X, y, TREFFER, rohr.x, -50, ROHR, rohr.mitte - LUECKE / 2 + 50) ||
    beruehrt(VOGEL_X, y, TREFFER, rohr.x, rohr.mitte + LUECKE / 2, ROHR, BODEN);

  const gueltig = (alt) =>
    !!alt && alt.vogel && typeof alt.vogel.y === 'number' && Array.isArray(alt.roehren) &&
    typeof alt.punkte === 'number' && alt.zustand !== 'vorbei';

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();

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
    const flaeche = el('div', 'ez-flaeche fl-flaeche');
    const feld = el('div', 'fl-kasten');
    const unten = el('div', 'ez-unten');
    flaeche.append(feld);
    wurzel.append(kopf, flaeche, unten);

    const b = Echtzeit.buehne(feld, { breite: B, hoehe: H, schritt, zeichnen, beiHalt });

    s.werkzeuge([
      { label: 'Pause', symbol: Echtzeit.SYMBOL.pause, tun: pauseUmschalten },
      { label: 'Anleitung', symbol: Echtzeit.SYMBOL.anleitung, tun: anleitung },
    ]);

    /* ------------------------------------------------------------ Ablauf */

    function flattern() {
      if (stand.zustand === 'vorbei' || stand.tot) return;
      if (stand.zustand !== 'laeuft') weiter();
      stand.vogel.vy = SCHWUNG;
      stand.schlag = 0;
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
      if (stand.zustand === 'laeuft') stand.zustand = 'pause';
      anzeigen();
      sichern();
    }

    function schritt(dt) {
      const st = stand;
      const v = st.vogel;
      st.zeit += dt;
      st.schlag += dt;
      v.vy = Math.min(FALL_MAX, v.vy + SCHWERE * dt);
      v.y += v.vy * dt;
      if (v.y < RADIUS) { v.y = RADIUS; v.vy = 0; }

      if (!st.tot) {
        const strecke = TEMPO * dt;
        st.weg += strecke;
        for (const r of st.roehren) {
          r.x -= strecke;
          if (!r.gezaehlt && r.x + ROHR / 2 < VOGEL_X) {
            r.gezaehlt = true;
            st.punkte += 1;
            kopfZeichnen();
          }
        }
        st.roehren = st.roehren.filter((r) => r.x > -ROHR - 4);
        st.bisRohr -= strecke;
        if (st.bisRohr <= 0) {
          const vorige = st.roehren.length ? st.roehren[st.roehren.length - 1].mitte : null;
          st.roehren.push({ x: B + 4, mitte: neueMitte(vorige), gezaehlt: false });
          st.bisRohr += ABSTAND;
        }
        // Wer anstößt, fällt noch zu Boden – das Spiel endet erst dort.
        if (st.roehren.some((r) => stoesst(v.y, r))) {
          st.tot = true;
          v.vy = Math.max(v.vy, 0);
        }
      }

      if (v.y + TREFFER >= BODEN) {
        v.y = BODEN - TREFFER;
        vorbei();
      }
    }

    function vorbei() {
      stand.zustand = 'vorbei';
      stand.tot = true;
      s.notieren({ punkte: stand.punkte, dauer: Math.round(stand.zeit * 1000) });
      b.halt();
    }

    function neu() {
      stand = frisch();
      anzeigen();
      sichern();
      b.malen();
    }

    /* ----------------------------------------------------------- Anzeige */

    const roehrenText = (n) => n + (n === 1 ? ' Röhre' : ' Röhren');

    function kopfZeichnen() {
      kopf.replaceChildren();
      const p = el('span');
      p.append(el('b', null, String(stand.punkte)), document.createTextNode(stand.punkte === 1 ? ' Röhre' : ' Röhren'));
      kopf.append(p);
      const best = bestwert();
      if (best) kopf.append(el('span', null, 'Bestwert ' + best));
      s.unter('');
    }

    function anzeigen() {
      kopfZeichnen();
      const z = stand.zustand;
      unten.replaceChildren();
      if (z === 'bereit') {
        b.schild('Tippen zum Flattern', 'Jeder Tipp ein Flügelschlag. Am Rechner: Leertaste.');
      } else if (z === 'pause') {
        b.schild('Pause', 'Tippen, um weiterzufliegen.');
        unten.append(Echtzeit.kasten('Pause', roehrenText(stand.punkte) + ' bisher.', [
          { text: 'Weiter', tun: weiter },
          { text: 'Neu anfangen', art: 'still', tun: neu },
        ]));
      } else if (z === 'vorbei') {
        b.schild('Abgestürzt.');
        const best = bestwert();
        unten.append(Echtzeit.kasten('Abgestürzt.',
          roehrenText(stand.punkte) + ' in ' + s.dauerText(Math.round(stand.zeit * 1000)) + '.' +
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

      // Wolken ziehen langsamer als die Röhren – das gibt dem Bild Tiefe.
      ctx.fillStyle = f.karteRand;
      ctx.globalAlpha = 0.6;
      for (let k = 0; k < 4; k += 1) {
        const spanne = B + 70;
        const x = (((k * 83 - st.weg * 0.25) % spanne) + spanne) % spanne - 35;
        const y = 28 + ((k * 47) % 120);
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.arc(x + 10, y - 4, 10, 0, Math.PI * 2);
        ctx.arc(x + 21, y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const r of st.roehren) {
        const oben = r.mitte - LUECKE / 2;
        const unten_ = r.mitte + LUECKE / 2;
        ctx.fillStyle = f.gruen;
        ctx.fillRect(r.x, 0, ROHR, oben);
        ctx.fillRect(r.x, unten_, ROHR, BODEN - unten_);
        ctx.fillRect(r.x - 2, oben - 8, ROHR + 4, 8);
        ctx.fillRect(r.x - 2, unten_, ROHR + 4, 8);
        ctx.fillStyle = 'rgba(255, 255, 255, .2)';
        ctx.fillRect(r.x + 4, 0, 4, oben - 8);
        ctx.fillRect(r.x + 4, unten_ + 8, 4, BODEN - unten_ - 8);
        ctx.fillStyle = 'rgba(0, 0, 0, .14)';
        ctx.fillRect(r.x - 2, oben - 2, ROHR + 4, 2);
        ctx.fillRect(r.x - 2, unten_ + 6, ROHR + 4, 2);
      }

      ctx.fillStyle = f.karteRand;
      ctx.fillRect(0, BODEN, B, H - BODEN);
      ctx.fillStyle = f.karte;
      ctx.globalAlpha = 0.5;
      for (let x = -(st.weg % 12) - 12; x < B + 12; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, BODEN + 3);
        ctx.lineTo(x + 6, BODEN + 3);
        ctx.lineTo(x + 2, H);
        ctx.lineTo(x - 4, H);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = f.gruen;
      ctx.fillRect(0, BODEN, B, 3);

      const v = st.vogel;
      ctx.save();
      ctx.translate(VOGEL_X, v.y);
      ctx.rotate(st.zustand === 'bereit' ? 0 : Math.max(-0.45, Math.min(1.2, v.vy / 420)));
      ctx.fillStyle = f.gelb;
      ctx.strokeStyle = f.tinte;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const hub = st.tot ? 0 : Math.sin(Math.min(st.schlag, 0.3) * 21) * 2.2;
      ctx.fillStyle = f.tSonne;
      ctx.beginPath();
      ctx.ellipse(-2.2, 1 - hub, 3.4, 2.1, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(2.6, -2, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1B1815';
      ctx.beginPath();
      if (st.tot) {
        ctx.fillRect(2.0, -3.2, 1.4, 0.5);
        ctx.fillRect(2.0, -1.3, 1.4, 0.5);
      } else {
        ctx.arc(3.3, -2, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = f.rost;
      ctx.beginPath();
      ctx.moveTo(4.6, -0.2);
      ctx.lineTo(9.2, 1.1);
      ctx.lineTo(4.6, 2.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Tippen irgendwo auf das Feld – jeder Tipp ist ein Flügelschlag nach oben. Dazwischen fällt der Vogel. Am Rechner geht es mit Leertaste, Pfeil hoch oder W.'));
      d.append(el('p', 'notiz', 'Flieg durch die Lücken zwischen den Röhren. Jede Röhre, an der du vorbei bist, zählt einen Punkt.'));
      d.append(el('p', 'notiz', 'Eine Röhre oder der Boden beendet den Flug. Die Decke hält dich nur auf.'));
      d.append(el('p', 'notiz', 'Der Trick: nicht hektisch tippen. Lieber im Takt, und kurz vor der Lücke etwas tiefer ansetzen als zu hoch.'));
      s.blatt({ titel: 'Flattervogel', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* ---------------------------------------------------------- Steuerung */

    b.an(flaeche, 'pointerdown', (e) => {
      e.preventDefault();
      flattern();
    });

    b.an(window, 'keydown', (e) => {
      if (!Echtzeit.tasteZaehlt(e)) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if ((k === ' ' && !Echtzeit.knopfHatFokus(e)) || k === 'ArrowUp' || k === 'w') {
        e.preventDefault();
        if (!e.repeat) flattern();
      } else if (k === 'p' || k === 'Escape') {
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
    const best = partien.reduce((h, p) => Math.max(h, z(p.punkte)), 0);
    const schnitt = partien.length
      ? (partien.reduce((sum, p) => sum + z(p.punkte), 0) / partien.length).toFixed(1).replace('.', ',')
      : '0';
    const laengste = partien.reduce((h, p) => Math.max(h, z(p.dauer)), 0);
    return [
      { wert: String(best), label: 'Bestwert' },
      { wert: schnitt, label: 'Röhren im Schnitt' },
      { wert: hilfe.dauerText(laengste), label: 'längster Flug' },
    ];
  }

  Rahmen.anmelden({
    id: 'flappy',
    name: 'Flattervogel',
    unter: 'Ein Tipp, ein Flügelschlag. Durch die Lücke.',
    farbe: '#3E9AC1',
    symbol: '<circle cx="10" cy="12" r="5"/><path d="M15 12.5l4 1-4 1.5M8 12.5c-1.5 0-3 1-3.5 2.5M11.5 10.5h.01M2 4v5M2 16v4M22 4v4M22 17v3"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
