/* Tierstimmen – für die Kleinsten: Tier antippen, Tier ruft.

   Nichts zu gewinnen, nichts falsch zu machen. Jede Berührung lässt ein Tier
   hüpfen und rufen, und oben steht groß, wer da ruft – zum Vorlesen für die,
   die danebensitzen. Sechs Tiere je Seite, damit sie auch auf einem kleinen
   Handy groß genug für eine Kinderhand bleiben. Wer die Pfeile trifft,
   blättert eben; auch das ist kein Fehler.

   Auf der Tastatur ruft jede Taste ein Tier der Seite: Ein Kleinkind am
   Laptop haut ohnehin drauf, dann soll dabei auch etwas muhen. */

(() => {
  const JE_SEITE = 6;
  const PFEIL_LINKS = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const PFEIL_RECHTS = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function starten(wurzel, s) {
    const tiere = Tiere.TIERE.filter((t) => t.ton);
    const seiten = [];
    for (let i = 0; i < tiere.length; i += JE_SEITE) seiten.push(tiere.slice(i, i + JE_SEITE));
    let runde = null;   // { tipps, tiere: { id: Anzahl } } – solange das Zimmer offen ist

    return Tiere.kinderzimmer(wurzel, s, {
      bilder: ['🐮', '🐷', '🐶', '🐸', '🦁'],
      satz: 'Tier antippen – es hüpft und ruft. Hier kann nichts schiefgehen.',
      toene: tiere.map((t) => t.id),

      spielen(buehne, h) {
        runde = { tipps: 0, tiere: {} };
        let seite = 0;

        const gitter = h.el('div', 'ts-gitter');
        const leiste = h.el('div', 'ts-leiste');
        const pfeil = (label, svg) => {
          const b = h.el('button', 'ts-pfeil');
          b.type = 'button';
          b.setAttribute('aria-label', label);
          b.innerHTML = svg;
          return b;
        };
        const zurueck = pfeil('Vorige Tiere', PFEIL_LINKS);
        const vor = pfeil('Weitere Tiere', PFEIL_RECHTS);
        const punkte = h.el('div', 'ts-punkte');
        punkte.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < seiten.length; i += 1) punkte.append(h.el('span', 'ts-punkt'));
        leiste.append(zurueck, punkte, vor);
        leiste.hidden = seiten.length < 2;
        buehne.append(gitter, leiste);

        function zeigen() {
          gitter.replaceChildren(...seiten[seite].map((t) => Tiere.kachel(h.el, t)));
          [...punkte.children].forEach((p, i) => p.classList.toggle('ts-punkt--an', i === seite));
          Tiere.anstossen(gitter, 'kz-auftritt');
        }

        function antippen(k) {
          const t = Tiere.nachId(k.dataset.tier);
          if (!t) return;
          runde.tipps += 1;
          runde.tiere[t.id] = (runde.tiere[t.id] || 0) + 1;
          Tiere.anstossen(k, 'kz-hops');
          h.blase(Tiere.satz(t));
          h.klang.tier(t.id, t.laut);
        }

        function blaettern(schritt) {
          seite = (seite + schritt + seiten.length) % seiten.length;
          h.klang.plopp();
          zeigen();
        }

        // Beim Aufsetzen, nicht beim Loslassen: Ein Kind wischt beim Tippen,
        // und aus einem verwischten Tipp wird nie ein click.
        h.an(gitter, 'pointerdown', (e) => {
          const k = e.target.closest('.kz-tier');
          if (!k) return;
          e.preventDefault();
          antippen(k);
        });
        h.an(zurueck, 'pointerdown', (e) => { e.preventDefault(); blaettern(-1); });
        h.an(vor, 'pointerdown', (e) => { e.preventDefault(); blaettern(1); });
        h.an(window, 'keydown', (e) => {
          if (e.key === 'Escape' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
          if (e.key === 'ArrowLeft') { blaettern(-1); return; }
          if (e.key === 'ArrowRight') { blaettern(1); return; }
          const kacheln = gitter.querySelectorAll('.kz-tier');
          if (kacheln.length) antippen(kacheln[Math.floor(Math.random() * kacheln.length)]);
        });

        zeigen();
      },

      /* Eine Runde ist ein Besuch im Zimmer. Wer nur hinein- und wieder
         hinausgeht, hat nichts gespielt. */
      schluss(ms) {
        if (runde && runde.tipps) s.notieren({ dauer: ms, tipps: runde.tipps, tiere: runde.tiere });
        runde = null;
      },
    });
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien) {
    const z = Tiere.zahl;
    const tipps = partien.reduce((summe, p) => summe + z(p.tipps), 0);
    const zaehler = new Map();
    for (const p of partien) {
      if (!p.tiere || typeof p.tiere !== 'object') continue;
      for (const [id, n] of Object.entries(p.tiere)) {
        if (Tiere.nachId(id) && z(n) > 0) zaehler.set(id, (zaehler.get(id) || 0) + z(n));
      }
    }
    const raus = [{ wert: String(tipps), label: 'Tiere angetippt' }];
    const liebling = [...zaehler].sort((a, b) => b[1] - a[1])[0];
    if (liebling) {
      const t = Tiere.nachId(liebling[0]);
      raus.push({ wert: t.bild + ' ' + t.name, label: 'Lieblingstier' });
    }
    return raus;
  }

  Rahmen.anmelden({
    id: 'tierstimmen',
    name: 'Tierstimmen',
    gruppe: 'kinder',
    unter: 'Tier antippen, Tier ruft. Für die Kleinsten.',
    farbe: '#D9853B',
    symbol: '<circle cx="10" cy="13.5" r="6"/><path d="M5.6 9.8 4.6 4.6l4.2 3.1M14.4 9.8l1-5.2-4.2 3.1"/><path d="M19 11a3.5 3.5 0 0 1 0 5M21.5 9a6.5 6.5 0 0 1 0 9"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
