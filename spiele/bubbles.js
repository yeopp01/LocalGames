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
   verliert also nichts.

   Zielhilfe, für kleine Hände: Ziehen und Loslassen verlangt, Zielen und
   Schießen in einer einzigen Bewegung zu treffen. Beim Antippen ist beides
   getrennt: Jede Stelle, die ein Schuss erreicht, trägt einen Punkt; ein Tipp
   wählt die nächste, ein zweiter oder „Schießen" schießt. Die Punkte liegen auf
   dem Feld statt als Raster darunter, weil eine Spalte unten mehrere Stellen
   meinen könnte – und weil man am Feld sieht, wohin man zeigt. Die Stellen
   rechnet dieselbe Bahn aus wie der Flug, die Blase landet also genau dort. */

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
  /* So lange nach dem Ende zählt ein Tipp nicht als neue Partie: Der letzte
     Schuss liegt ja noch unter dem Finger. */
  const SPERRE_MS = 600;
  const TAUSCH_S = 0.16;
  // Die Kanone wird in so feinen Schritten durchprobiert, dass auf fast 300
  // Einheiten Flug keine Stelle durchrutscht, die man mit dem Finger träfe.
  const WINKEL_SCHRITT = 0.003;

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
    let endeUm = 0;
    let tauschT = TAUSCH_S; // Sekunden seit dem letzten Tausch – nur fürs Bild
    let kein = false;       // Finger liegt unter der Kanone: Loslassen schießt nicht
    let auswahl = null;     // Beim Antippen: die gewählte Stelle { r, c, winkel, x, y }
    let zieleVon = '';      // Für welches Feld die Stellen gerechnet sind
    let zieleListe = [];

    /* Die Zielhilfe gilt über Partien hinweg, sie hängt am Kind, nicht am Feld.
       Darum liest laden() sie auch aus einem Stand, der sonst nicht mehr gilt. */
    function hilfeVon(alt) {
      const h = alt && typeof alt.hilfe === 'object' && alt.hilfe ? alt.hilfe : {};
      return { vorschau: h.vorschau === true, antippen: h.antippen === true };
    }

    function laden() {
      const alt = s.erinnert();
      if (!gueltig(alt)) {
        const st = frisch();
        st.hilfe = hilfeVon(alt);
        return st;
      }
      if (alt.zustand === 'laeuft') alt.zustand = 'pause';
      alt.hilfe = hilfeVon(alt);
      return alt;
    }

    const sichern = () => s.merken(stand);
    // Mit Zielhilfe ist es ein anderes Spiel: Der Bestwert der einen schlägt den
    // der anderen nicht.
    const bestwert = () => {
      const mit = stand.hilfe.vorschau || stand.hilfe.antippen || stand.mitHilfe === true;
      return s.partien().reduce((h, p) => (!!p.mitHilfe === mit ? Math.max(h, Echtzeit.zahl(p.punkte)) : h), 0);
    };

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const flaeche = el('div', 'ez-flaeche bl-flaeche');
    const feld = el('div', 'bl-kasten');
    const unten = el('div', 'ez-unten');
    // Groß und unter dem Daumen: Das ist der Knopf, den ein Kind sucht.
    const losKnopf = el('button', 'knopf knopf--voll bl-los', 'Schießen');
    losKnopf.type = 'button';
    const losPunkt = el('span', 'bl-los-punkt');
    losPunkt.setAttribute('aria-hidden', 'true');
    losKnopf.prepend(losPunkt);
    losKnopf.addEventListener('click', () => schiessen());
    flaeche.append(feld, losKnopf);
    wurzel.append(kopf, flaeche);

    const b = Echtzeit.buehne(feld, { breite: B, hoehe: H, schritt, zeichnen, beiHalt });
    // Die Knöpfe liegen auf dem Feld, ihr Tipp ist aber kein Schuss.
    b.an(unten, 'pointerdown', (e) => e.stopPropagation());
    b.an(losKnopf, 'pointerdown', (e) => e.stopPropagation());

    const SYMBOL_HILFE = '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke-linecap="round"/>';
    function werkzeugeSetzen() {
      s.werkzeuge([
        { label: 'Pause', symbol: Echtzeit.SYMBOL.pause, tun: pauseUmschalten },
        { label: 'Zielhilfe', symbol: SYMBOL_HILFE, tun: zielhilfeBlatt, marke: stand.hilfe.vorschau || stand.hilfe.antippen ? 'an' : undefined },
        { label: 'Anleitung', symbol: Echtzeit.SYMBOL.anleitung, tun: anleitung },
      ]);
    }
    werkzeugeSetzen();

    /* ------------------------------------------------------------ Ablauf */

    function weiter() {
      if (stand.zustand !== 'bereit' && stand.zustand !== 'pause') return;
      stand.zustand = 'laeuft';
      // Der Pause-Knopf behielte sonst den Fokus, und die nächste Leertaste
      // ginge an ihn statt an die Kanone.
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      anzeigen();
      b.los();
    }

    function nochmal() {
      neu();
      weiter();
    }

    const neustartFrei = () => stand.zustand === 'vorbei' && performance.now() - endeUm >= SPERRE_MS;

    function pauseUmschalten() {
      if (b.laeuft) b.halt();
      else if (stand.zustand === 'pause') weiter();
    }

    function beiHalt() {
      if (stand.zustand === 'laeuft') stand.zustand = 'pause';
      griff = null;
      kein = false;
      drehen = 0;
      anzeigen();
      sichern();
    }

    function schiessen() {
      if (stand.zustand !== 'laeuft' || stand.flug) return;
      if (stand.hilfe.antippen && !auswahl) return;
      auswahl = null;
      if (stand.hilfe.vorschau || stand.hilfe.antippen) stand.mitHilfe = true;
      s.fuehlen(10);
      const dx = Math.cos(stand.winkel);
      const dy = -Math.sin(stand.winkel);
      stand.flug = { x: SX, y: SY, dx, dy, farbe: stand.geladen };
      stand.geladen = stand.naechste;
      stand.naechste = ziehen(stand);
    }

    function tauschen() {
      if (stand.zustand !== 'laeuft') return;
      [stand.geladen, stand.naechste] = [stand.naechste, stand.geladen];
      tauschT = 0;
      s.fuehlen(6);
    }

    function schritt(dt) {
      const st = stand;
      st.zeit += dt;
      if (tauschT < TAUSCH_S) tauschT += dt;
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
        s.fuehlen(lose.length ? 20 : 10);
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
      endeUm = performance.now();
      s.fuehlen(30);
      const partie = { punkte: stand.punkte, blasen: stand.blasen, dauer: Math.round(stand.zeit * 1000) };
      if (stand.mitHilfe) partie.mitHilfe = true;
      s.notieren(partie);
      b.halt();
    }

    function neu() {
      const hilfe = stand.hilfe;
      stand = frisch();
      stand.hilfe = hilfe;
      auswahl = null;
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
      s.unter('Bestwert ' + (best || '–'));
    }

    /* ---------------------------------------------------------- Zielhilfe */

    /* Alle Stellen, an denen ein Schuss liegen bleiben kann. Über eine Bande
       wie die Ziellinie – mehr zeigt das Feld auch sonst nicht. Bei mehreren
       passenden Winkeln gilt die Mitte des breitesten Bereichs: Sie ist am
       weitesten von den Winkeln entfernt, die woanders landen. Gezählt wird in
       ganzen Schritten: So ist auch die Mitte ein Winkel, der wirklich
       durchgerechnet wurde, und „genau dort" stimmt ohne Rundung. */
    function ziele() {
      const merkmal = JSON.stringify(stand.gitter) + stand.versatz;
      if (merkmal === zieleVon) return zieleListe;
      zieleVon = merkmal;
      const stellen = new Map();
      let zuletzt = null;
      const anzahl = Math.floor((WINKEL_MAX - WINKEL_MIN) / WINKEL_SCHRITT);
      for (let i = 0; i <= anzahl; i += 1) {
        const w = WINKEL_MIN + i * WINKEL_SCHRITT;
        const weg = bahn(stand, SX, SY, Math.cos(w), -Math.sin(w), 1);
        const ziel = weg.ende && einrasten(stand, weg.ende[0], weg.ende[1]);
        if (!ziel) { zuletzt = null; continue; }
        const name = ziel.r + ':' + ziel.c;
        let stelle = stellen.get(name);
        if (!stelle) {
          stelle = { r: ziel.r, c: ziel.c, x: mitteX(stand, ziel.r, ziel.c), y: mitteY(ziel.r), von: i, bis: i, jetzt: i };
          stellen.set(name, stelle);
        }
        if (zuletzt !== name) stelle.jetzt = i;
        if (i - stelle.jetzt > stelle.bis - stelle.von) { stelle.von = stelle.jetzt; stelle.bis = i; }
        zuletzt = name;
      }
      zieleListe = [...stellen.values()]
        .map((z) => ({ r: z.r, c: z.c, x: z.x, y: z.y, winkel: WINKEL_MIN + Math.floor((z.von + z.bis) / 2) * WINKEL_SCHRITT }))
        .sort((a, c) => a.winkel - c.winkel);
      auswahl = null;
      return zieleListe;
    }

    function waehlen(ziel) {
      auswahl = ziel;
      stand.winkel = ziel.winkel;
      s.fuehlen(6);
      if (!b.laeuft) b.malen();
    }

    /** Die Stelle, die der Finger meint: die nächste, egal wie grob er trifft. */
    function zielBei(x, y) {
      let best = null;
      let abstand = Infinity;
      for (const z of ziele()) {
        const d = (z.x - x) ** 2 + (z.y - y) ** 2;
        if (d < abstand) { abstand = d; best = z; }
      }
      return best;
    }

    /** Pfeile gehen die Stellen der Reihe nach ab, der Kanone nach. */
    function zielWeiter(richtung) {
      const liste = ziele();
      if (!liste.length) return;
      const i = auswahl ? liste.findIndex((z) => z.r === auswahl.r && z.c === auswahl.c) : -1;
      const n = i < 0 ? Math.floor(liste.length / 2) : Math.min(liste.length - 1, Math.max(0, i + richtung));
      waehlen(liste[n]);
    }

    function zielhilfeBlatt() {
      const d = el('div', 'bl-hilfe');
      const zeile = (name, titel, text) => {
        const k = el('button', 'bl-schalter');
        k.type = 'button';
        k.setAttribute('role', 'switch');
        const zeigen = () => k.setAttribute('aria-checked', String(stand.hilfe[name]));
        const worte = el('span', 'bl-schalter-worte');
        worte.append(el('span', 'bl-schalter-titel', titel), el('span', 'bl-schalter-text', text));
        k.append(worte, el('span', 'bl-schalter-knopf'));
        zeigen();
        k.addEventListener('click', () => {
          stand.hilfe[name] = !stand.hilfe[name];
          auswahl = null;
          griff = null;
          zeigen();
          hilfeAnzeigen();
          sichern();
        });
        return k;
      };
      d.append(zeile('vorschau', 'Landeplatz zeigen', 'Eine blasse Blase zeigt beim Zielen, wo die Blase liegen bleibt.'));
      d.append(zeile('antippen', 'Antippen statt ziehen', 'Punkte zeigen, wo eine Blase hinkann. Antippen wählt, noch einmal antippen oder „Schießen" schießt – genau dorthin. Gut für kleine Hände.'));
      d.append(el('p', 'notiz notiz--klein', 'Partien mit Zielhilfe haben einen eigenen Bestwert.'));
      s.blatt({ titel: 'Zielhilfe', inhalt: d, aktionen: [{ text: 'Fertig' }] });
    }

    /* Das Feld wird schmaler, wenn der Knopf darunter Platz braucht – das Maß
       steht in styles.css unter data-antippen. */
    function hilfeAnzeigen() {
      flaeche.dataset.antippen = stand.hilfe.antippen ? 'ja' : 'nein';
      losKnopf.hidden = !stand.hilfe.antippen;
      werkzeugeSetzen();
      anzeigen();
      b.malen();
    }

    function anzeigen() {
      kopfZeichnen();
      const z = stand.zustand;
      unten.replaceChildren();
      if (z === 'bereit') {
        if (stand.hilfe.antippen) b.schild('Tipp, wo sie hin soll', 'Tipp auf einen Punkt: Dort landet die Blase. Noch einmal antippen schießt.');
        else b.schild('Zielen und loslassen', 'Finger aufs Feld, die Kanone zielt auf ihn. Loslassen schießt, die Blase links unten tauscht.');
      } else if (z === 'pause') {
        b.schild('Pause', stand.punkte + ' Punkte bisher. Tippen, um weiterzuspielen.');
        unten.append(Echtzeit.kasten('', null, [
          { text: 'Weiter', tun: weiter },
          { text: 'Neu anfangen', art: 'still', tun: nochmal },
        ]));
      } else if (z === 'vorbei') {
        b.schild('Über der Linie.',
          stand.punkte + ' Punkte, ' + stand.blasen + (stand.blasen === 1 ? ' Blase' : ' Blasen') + ' in ' +
          s.dauerText(Math.round(stand.zeit * 1000)) + '.');
        const k = Echtzeit.kasten('', null, [{ text: 'Nochmal', tun: nochmal }]);
        k.querySelector('.knopf').prepend(s.bildzeichen('nochmal'));
        if (stand.punkte > 0 && stand.punkte >= bestwert()) k.prepend(el('span', 'ende-marke', 'Das ist dein Bestwert.'));
        k.append(el('p', 'notiz notiz--klein', 'Ein Tipp aufs Feld oder die Leertaste geht auch.'));
        unten.append(k);
      } else {
        b.schildWeg();
      }
      unten.hidden = !unten.childElementCount;
      // In die Karte auf dem Feld: So bleibt „Nochmal" auch im flachen Fenster
      // im Bild, und die Seite springt nicht.
      if (!unten.hidden) feld.querySelector('.ez-schild').append(unten);
    }

    /* Ein Zeichen je Farbe, damit sich die Blasen auch ohne Farbsehen
       unterscheiden lassen. */
    function zeichen(ctx, farbe, x, y, k) {
      ctx.fillStyle = 'rgba(255, 255, 255, .92)';
      ctx.strokeStyle = 'rgba(255, 255, 255, .92)';
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
      ctx.globalAlpha = 0.85;
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

      const antippen = st.hilfe.antippen;
      losPunkt.style.background = FARBEN[st.geladen];
      losKnopf.disabled = !(auswahl && st.zustand === 'laeuft' && !st.flug);
      if (antippen && st.zustand !== 'vorbei' && !st.flug) {
        ctx.fillStyle = FARBEN[st.geladen];
        ctx.globalAlpha = 0.6;
        for (const z of ziele()) {
          ctx.beginPath();
          ctx.arc(z.x, z.y, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Ziellinie – nur, wenn gerade nichts fliegt und der Finger nicht gerade
      // abbricht: Keine Linie heißt dann auch kein Schuss. Beim Antippen erst,
      // wenn eine Stelle gewählt ist.
      if (st.zustand !== 'vorbei' && !st.flug && !kein && (!antippen || auswahl)) {
        const weg = bahn(st, SX, SY, Math.cos(st.winkel), -Math.sin(st.winkel), 1);
        // Die blasse Blase rechnet dieselbe Stelle wie der Schuss. Ob dort etwas
        // platzt, sagt sie nicht; das bleibt das Spiel.
        const ziel = (st.hilfe.vorschau || antippen) && weg.ende && einrasten(st, weg.ende[0], weg.ende[1]);
        if (ziel) {
          ctx.globalAlpha = antippen ? 0.7 : 0.45;
          blase(ctx, f, st.geladen, mitteX(st, ziel.r, ziel.c), mitteY(ziel.r), 1);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = f.tinteLeise;
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
      // Beim Tausch wippen beide kurz – sonst sieht man leicht nicht, dass er geschah.
      const wipp = tauschT < TAUSCH_S ? 1 + 0.2 * Math.sin((Math.PI * tauschT) / TAUSCH_S) : 1;
      if (st.zustand !== 'vorbei') blase(ctx, f, st.geladen, SX, SY, wipp);
      if (st.flug) blase(ctx, f, st.flug.farbe, st.flug.x, st.flug.y, 1);

      // Vorrat und Fehlschüsse
      blase(ctx, f, st.naechste, VORRAT_X, VORRAT_Y, 0.72 * wipp);
      ctx.fillStyle = f.tinteLeise;
      ctx.font = '500 7px "DM Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('tauschen', VORRAT_X, VORRAT_Y - 10);
      ctx.fillText('neue Reihe', 140, VORRAT_Y - 10);
      const erlaubt = fehlerErlaubt(st.reihenDazu);
      const uebrig = erlaubt - st.fehl;
      const links = 140 - ((erlaubt - 1) * 8) / 2;
      for (let i = 0; i < erlaubt; i += 1) {
        // Der letzte Punkt warnt: Der nächste Fehlschuss schiebt eine Reihe nach.
        ctx.fillStyle = i >= uebrig ? f.karteRand : uebrig === 1 ? f.rost : f.tinteLeise;
        ctx.beginPath();
        ctx.arc(links + i * 8, VORRAT_Y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Leg den Finger aufs Feld – die Kanone zielt auf ihn, die gepunktete Linie zeigt den Flug. Loslassen schießt. Wer doch nicht schießen will, zieht den Finger unter die Kanone, bis die Linie verschwindet, und lässt dort los.'));
      d.append(el('p', 'notiz', 'Oben unter „Zielhilfe" lässt sich der Landeplatz als blasse Blase einblenden und das Ziehen durch Antippen ersetzen: Tipp auf einen Punkt, und die Blase landet genau dort.'));
      d.append(el('p', 'notiz', 'Drei oder mehr gleiche Farben, die sich berühren, platzen. Alles, was danach nicht mehr oben hängt, fällt mit – das bringt doppelt so viele Punkte.'));
      d.append(el('p', 'notiz', 'Die Blase links unten kommt als nächste. Ein Tipp darauf tauscht sie mit der in der Kanone. Die Wände werfen zurück.'));
      d.append(el('p', 'notiz', 'Die Punkte rechts unten sind deine Fehlschüsse: Jede Blase, bei der nichts platzt, kostet einen. Sind alle weg, schiebt sich oben eine neue Reihe herein. Rutscht eine Blase über die rote Linie, ist es vorbei.'));
      d.append(el('p', 'notiz', 'Am Rechner: Die Maus zielt, ein Klick schießt. Oder Pfeile links und rechts zielen, Leertaste schießt, Pfeil runter oder X tauscht.'));
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
      if (griff) return;
      if (stand.zustand === 'vorbei') {
        e.preventDefault();
        if (!neustartFrei()) return;
        // Wie bei der Pause: Dieser Tipp beginnt die Partie, er schießt nicht.
        nochmal();
        griff = { id: e.pointerId, nurWeiter: true };
        try { flaeche.setPointerCapture(e.pointerId); } catch { /* synthetisch */ }
        return;
      }
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
      if (stand.hilfe.antippen && !warPause) {
        griff.antippen = true;
        if (y <= SY - 4 && !stand.flug) {
          const ziel = zielBei(x, y);
          griff.zweiter = !!(ziel && auswahl && ziel.r === auswahl.r && ziel.c === auswahl.c);
          if (ziel) waehlen(ziel);
        }
      } else if (!warPause) kein = !zielen(x, y);
      try { flaeche.setPointerCapture(e.pointerId); } catch { /* synthetisch */ }
    });
    b.an(flaeche, 'pointermove', (e) => {
      // Die Maus zielt schon beim Überfahren; der Finger hat dafür nur den Griff.
      if (!griff) {
        if (e.pointerType === 'mouse' && !stand.hilfe.antippen && (stand.zustand === 'laeuft' || stand.zustand === 'bereit')) zielen(...zuFeld(e));
        return;
      }
      if (e.pointerId !== griff.id || griff.nurWeiter) return;
      if (griff.antippen) {
        // Wer beim Antippen rutscht, wählt um – und das ist dann kein zweiter Tipp.
        const [x, y] = zuFeld(e);
        if (y > SY - 4 || stand.flug) return;
        const ziel = zielBei(x, y);
        if (ziel && !(auswahl && ziel.r === auswahl.r && ziel.c === auswahl.c)) {
          griff.zweiter = false;
          waehlen(ziel);
        }
        return;
      }
      kein = !zielen(...zuFeld(e));
      if (!b.laeuft) b.malen();
    });
    b.an(flaeche, 'pointerup', (e) => {
      if (!griff || e.pointerId !== griff.id) return;
      const g = griff;
      griff = null;
      kein = false;
      if (g.antippen) {
        if (g.zweiter) schiessen();
        return;
      }
      if (!g.nurWeiter && zielen(...zuFeld(e))) schiessen();
    });
    b.an(flaeche, 'pointercancel', (e) => {
      if (griff && e.pointerId === griff.id) {
        griff = null;
        kein = false;
      }
    });

    const tasteVon = (e) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    b.an(window, 'keydown', (e) => {
      if (!Echtzeit.tasteZaehlt(e)) return;
      const k = tasteVon(e);
      const pfeil = k === 'ArrowLeft' || k === 'a' ? -1 : k === 'ArrowRight' || k === 'd' ? 1 : 0;
      if (pfeil && stand.hilfe.antippen) {
        // Links heißt größerer Winkel; die Liste ist nach dem Winkel sortiert.
        e.preventDefault();
        weiter();
        if (!stand.flug) zielWeiter(-pfeil);
      } else if (k === 'ArrowLeft' || k === 'a') { e.preventDefault(); drehen = -1; weiter(); }
      else if (k === 'ArrowRight' || k === 'd') { e.preventDefault(); drehen = 1; weiter(); }
      else if (((k === ' ' || k === 'Enter') && !Echtzeit.knopfHatFokus(e)) || k === 'ArrowUp' || k === 'w') {
        e.preventDefault();
        if (stand.zustand === 'vorbei') {
          if (!e.repeat && neustartFrei()) nochmal();
          return;
        }
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

    hilfeAnzeigen();

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
    const ohne = partien.filter((p) => !p.mitHilfe);
    const best = ohne.reduce((h, p) => Math.max(h, z(p.punkte)), 0);
    const schnitt = ohne.length ? Math.round(ohne.reduce((sum, p) => sum + z(p.punkte), 0) / ohne.length) : 0;
    const blasen = ohne.reduce((h, p) => Math.max(h, z(p.blasen)), 0);
    const liste = [
      { wert: String(best), label: 'Bestwert' },
      { wert: String(schnitt), label: 'Punkte im Schnitt' },
      { wert: String(blasen), label: 'meiste Blasen' },
    ];
    const mit = partien.filter((p) => p.mitHilfe);
    if (mit.length) liste.push({ wert: String(mit.reduce((h, p) => Math.max(h, z(p.punkte)), 0)), label: 'Bestwert mit Zielhilfe' });
    return liste;
  }

  Rahmen.anmelden({
    id: 'bubbles',
    name: 'Blasen',
    gruppe: 'geschick',
    unter: 'Drei gleiche platzen. Was dran hing, fällt mit.',
    farbe: '#3F7FD0',
    symbol: '<circle cx="7" cy="7" r="3"/><circle cx="13" cy="7" r="3"/><circle cx="10" cy="12.2" r="3"/><circle cx="12" cy="20" r="2.4"/><path d="M12 17.6V15"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
