/* 2048 – gleiche Zahlen zusammenschieben, bis 2048 dasteht.

   Der Kern ist eine einzige Zeilenoperation: eine Reihe nach links schieben.
   Alle vier Richtungen entstehen daraus, indem die Reihe vorher passend
   ausgelesen und hinterher zurückgeschrieben wird. Das spart drei Viertel
   des Codes und drei Viertel der Fehlerquellen.
*/

(() => {
  const N = 4;
  const ZIEL = 2048;

  /* Eine Reihe nach links: erst Lücken schließen, dann gleiche Nachbarn
     einmalig verschmelzen, dann wieder Lücken schließen. */
  function schiebeReihe(reihe) {
    const voll = reihe.filter((w) => w !== 0);
    const raus = [];
    let punkte = 0;
    for (let i = 0; i < voll.length; i += 1) {
      if (voll[i] === voll[i + 1]) {
        raus.push(voll[i] * 2);
        punkte += voll[i] * 2;
        i += 1;                       // der Partner ist verbraucht
      } else {
        raus.push(voll[i]);
      }
    }
    while (raus.length < N) raus.push(0);
    return { reihe: raus, punkte };
  }

  /* Die Felder einer Reihe in Schubrichtung – Index 0 ist vorn. */
  function reihenFelder(richtung, nr) {
    const felder = [];
    for (let k = 0; k < N; k += 1) {
      if (richtung === 'links')  felder.push(nr * N + k);
      if (richtung === 'rechts') felder.push(nr * N + (N - 1 - k));
      if (richtung === 'hoch')   felder.push(k * N + nr);
      if (richtung === 'runter') felder.push((N - 1 - k) * N + nr);
    }
    return felder;
  }

  function schieben(brett, richtung) {
    const neu = brett.slice();
    let punkte = 0;
    let bewegt = false;
    for (let nr = 0; nr < N; nr += 1) {
      const felder = reihenFelder(richtung, nr);
      const alt = felder.map((i) => brett[i]);
      const erg = schiebeReihe(alt);
      punkte += erg.punkte;
      felder.forEach((i, k) => {
        if (neu[i] !== erg.reihe[k]) bewegt = true;
        neu[i] = erg.reihe[k];
      });
    }
    return { brett: neu, punkte, bewegt };
  }

  const gehtNoch = (brett) =>
    ['links', 'rechts', 'hoch', 'runter'].some((r) => schieben(brett, r).bewegt);

  function neueKachel(brett) {
    const frei = brett.map((w, i) => (w ? -1 : i)).filter((i) => i >= 0);
    if (!frei.length) return;
    const i = frei[Math.floor(Math.random() * frei.length)];
    brett[i] = Math.random() < 0.9 ? 2 : 4;
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let uhr = null;

    function frisch() {
      const brett = new Array(N * N).fill(0);
      neueKachel(brett);
      neueKachel(brett);
      return {
        brett,
        punkte: 0,
        zuege: 0,
        gewonnenGemeldet: false,
        verbraucht: 0,
        seit: Date.now(),
        fertig: false,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.brett) && alt.brett.length === N * N && !alt.fertig) {
        alt.seit = Date.now();
        return alt;
      }
      return frisch();
    }

    const zeitJetzt = () => stand.verbraucht + (stand.fertig ? 0 : Date.now() - stand.seit);

    function sichern() {
      if (!stand.fertig) {
        stand.verbraucht = zeitJetzt();
        stand.seit = Date.now();
      }
      s.merken(stand);
    }

    const bestwert = () =>
      s.partien().reduce((hoch, p) => Math.max(hoch, p.punkte || 0), 0);

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const brettKasten = el('div', 'z-brett');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste');
    wurzel.append(kopf, brettKasten, endeKasten, leiste);

    const felder = [];
    for (let i = 0; i < N * N; i += 1) {
      const f = el('div', 'z-feld');
      brettKasten.append(f);
      felder.push(f);
    }

    for (const [text, richtung] of [['←', 'links'], ['↑', 'hoch'], ['↓', 'runter'], ['→', 'rechts']]) {
      const b = el('button', 'knopf knopf--still', text);
      b.type = 'button';
      b.setAttribute('aria-label', 'Nach ' + richtung);
      b.addEventListener('click', () => zug(richtung));
      leiste.append(b);
    }

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neues Spiel', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    /* --------------------------------------------------------------- Zug */

    function zug(richtung) {
      if (stand.fertig) return;
      const erg = schieben(stand.brett, richtung);
      if (!erg.bewegt) return;

      stand.brett = erg.brett;
      stand.punkte += erg.punkte;
      stand.zuege += 1;
      neueKachel(stand.brett);

      // 2048 beendet das Spiel nicht – wer mag, spielt weiter.
      if (!stand.gewonnenGemeldet && stand.brett.some((w) => w >= ZIEL)) {
        stand.gewonnenGemeldet = true;
        s.blatt({
          titel: 'Geschafft: ' + ZIEL,
          inhalt: 'Du hast die ' + ZIEL + ' erreicht. Weiterspielen geht – das Spiel endet erst, wenn kein Zug mehr möglich ist.',
          aktionen: [{ text: 'Weiter' }],
        });
      }

      if (!gehtNoch(stand.brett)) abschluss();
      sichern();
      zeichnen();
    }

    function abschluss() {
      stand.verbraucht = zeitJetzt();
      stand.fertig = true;
      s.notieren({
        gewonnen: stand.brett.some((w) => w >= ZIEL),
        dauer: stand.verbraucht,
        punkte: stand.punkte,
        zuege: stand.zuege,
        hoechste: Math.max(...stand.brett),
      });
    }

    /* ------------------------------------------------------------ Zeichnen */

    function zeichnen() {
      for (let i = 0; i < N * N; i += 1) {
        const w = stand.brett[i];
        felder[i].textContent = w ? String(w) : '';
        felder[i].dataset.wert = String(w);
      }
      kopfZeichnen();
      endeZeichnen();
      leiste.hidden = stand.fertig;
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      const punkte = el('span', null, '');
      punkte.append(el('b', null, String(stand.punkte)));
      punkte.append(document.createTextNode(' Punkte'));
      kopf.append(punkte);
      const best = bestwert();
      if (best) kopf.append(el('span', null, 'Bestwert ' + best));
      kopf.append(el('span', null, String(stand.zuege) + ' Züge'));
      s.unter('Höchste Kachel: ' + Math.max(...stand.brett));
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !stand.fertig;
      if (!stand.fertig) return;
      const hoechste = Math.max(...stand.brett);
      endeKasten.append(el('p', 'ende-titel', 'Kein Zug mehr möglich.'));
      endeKasten.append(el('p', 'notiz',
        stand.punkte + ' Punkte, höchste Kachel ' + hoechste + ', ' + stand.zuege + ' Züge.' +
        (stand.punkte >= bestwert() && stand.punkte > 0 ? ' Das ist dein Bestwert.' : '')));
      const l = el('div', 'leiste');
      const b = el('button', 'knopf knopf--voll', 'Nochmal');
      b.type = 'button';
      b.addEventListener('click', neu);
      l.append(b);
      endeKasten.append(l);
    }

    function neu() {
      stand = frisch();
      sichern();
      zeichnen();
    }

    function neuFragen() {
      if (stand.fertig || stand.zuege === 0) { neu(); return; }
      s.blatt({
        titel: 'Neu anfangen?',
        inhalt: 'Die laufende Partie mit ' + stand.punkte + ' Punkten wird verworfen und zählt nicht für die Statistik.',
        aktionen: [
          { text: 'Neu anfangen', tun: neu },
          { text: 'Weiterspielen', art: 'still' },
        ],
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Wische über das Feld oder nimm die Pfeiltasten. Alle Kacheln rutschen gleichzeitig in die gewählte Richtung, bis sie anstoßen.'));
      d.append(el('p', 'notiz', 'Treffen zwei gleiche Kacheln aufeinander, verschmelzen sie zu ihrer Summe – aus zwei Vieren wird eine Acht. Ihr Wert kommt als Punkte dazu.'));
      d.append(el('p', 'notiz', 'Pro Zug verschmilzt eine Kachel nur einmal: aus 2 2 2 2 wird 4 4, nicht 8.'));
      d.append(el('p', 'notiz', 'Nach jedem Zug, der etwas bewegt hat, erscheint an einer freien Stelle eine neue 2 (selten eine 4). Vorbei ist es, wenn keine Richtung mehr etwas bewegt.'));
      d.append(el('p', 'notiz', 'Der Rat der Erfahrenen: such dir eine Ecke, halte die größte Kachel dort und schiebe nie in die Gegenrichtung.'));
      s.blatt({ titel: '2048', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* ------------------------------------------------------- Steuerung */

    function taste(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!document.getElementById('sheet-spiel').hidden) return;
      const richtung = {
        ArrowLeft: 'links', ArrowRight: 'rechts', ArrowUp: 'hoch', ArrowDown: 'runter',
        a: 'links', d: 'rechts', w: 'hoch', s: 'runter',
      }[e.key];
      if (richtung) { e.preventDefault(); zug(richtung); }
    }
    window.addEventListener('keydown', taste);

    // Wischen: ab 30 Pixeln zählt die stärkere der beiden Achsen.
    let start = null;
    const anfassen = (e) => { start = { x: e.clientX, y: e.clientY }; };
    const loslassen = (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
      zug(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'rechts' : 'links') : (dy > 0 ? 'runter' : 'hoch'));
    };
    brettKasten.addEventListener('pointerdown', anfassen);
    brettKasten.addEventListener('pointerup', loslassen);
    brettKasten.addEventListener('pointercancel', () => { start = null; });

    sichern();
    zeichnen();
    uhr = setInterval(() => { if (!stand.fertig) kopfZeichnen(); }, 5000);

    return {
      ende: () => {
        clearInterval(uhr);
        window.removeEventListener('keydown', taste);
        if (!stand.fertig) sichern();
      },
    };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien) {
    const best = partien.reduce((h, p) => Math.max(h, p.punkte || 0), 0);
    const hoechste = partien.reduce((h, p) => Math.max(h, p.hoechste || 0), 0);
    const schnitt = partien.length
      ? Math.round(partien.reduce((s, p) => s + (p.punkte || 0), 0) / partien.length)
      : 0;
    return [
      { wert: String(best), label: 'Bestwert' },
      { wert: String(hoechste), label: 'höchste Kachel' },
      { wert: String(schnitt), label: 'Punkte im Schnitt' },
    ];
  }

  Rahmen.anmelden({
    id: 'zweitausend',
    name: '2048',
    unter: 'Zahlen zusammenschieben.',
    farbe: '#C9A227',
    symbol: '<rect x="3" y="3" width="8" height="8" rx="1.6"/><rect x="13" y="3" width="8" height="8" rx="1.6"/><rect x="3" y="13" width="8" height="8" rx="1.6"/><path d="M15 17h4M17 15v4" stroke-linecap="round"/>',
    starten,
    auswertung,
  });
})();
