/* Horch mal – ein Tier ruft, welches war es?

   Oben ist ein großer Lautsprecher: Er spielt den Ruf, so oft man will.
   Darunter stehen zwei, drei oder vier Tiere. Das richtige hüpft, es regnet
   Konfetti, und es ruft noch einmal. Tippt das Kind ein anderes an, ruft
   eben das – so hört es, wie jenes klingt –, und danach kommt der gesuchte
   Ruf wieder. Rot und Fehlerton gibt es nicht.

   Was leicht zu verwechseln ist, steht nie zusammen zur Wahl: Schaf und Ziege
   meckern fast gleich, Huhn und Hahn sehen als Emoji fast gleich aus. Beim
   Klang zählt, was ein Kind hört, nicht was das Tier ist – der Pinguin iaht
   wie ein Esel, der Pfau schreit wie eine Katze, der Wal heult wie ein Wolf.
   Paare mit einem Tier, das auf diesem Gerät fehlt, stören nicht. */

(() => {
  const JE_RUNDE = 6;
  const STUFEN = [
    { wert: 2, text: 'Zwei Tiere' },
    { wert: 3, text: 'Drei Tiere' },
    { wert: 4, text: 'Vier Tiere' },
  ];
  const VERWECHSELBAR = [
    ['schaf', 'ziege'], ['huhn', 'hahn'], ['huhn', 'truthahn'],
    ['loewe', 'tiger'], ['loewe', 'krokodil'], ['katze', 'tiger'], ['katze', 'pfau'],
    ['pferd', 'esel'], ['pinguin', 'esel'], ['ente', 'gans'],
    ['kuh', 'hirsch'], ['eule', 'taube'], ['wolf', 'wal'],
  ];
  const verwechselbar = (a, b) =>
    VERWECHSELBAR.some(([x, y]) => (a.id === x && b.id === y) || (a.id === y && b.id === x));
  const LAUTSPRECHER = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" stroke-linejoin="round"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke-linecap="round"/></svg>';

  const RUFER = Tiere.TIERE.filter((t) => t.ton);

  /** Die Tiere einer Frage: das gesuchte und so viele andere, die man nicht verwechselt. */
  function wahl(ziel, anzahl) {
    const dabei = [ziel];
    for (const t of Tiere.mischen(RUFER)) {
      if (dabei.length >= anzahl) break;
      if (!dabei.includes(t) && !dabei.some((x) => verwechselbar(x, t))) dabei.push(t);
    }
    return Tiere.mischen(dabei);
  }

  function starten(wurzel, s) {
    let stand = null;   // die laufende Runde: { nr, aufAnhieb, beginn, stufe }

    function notieren(jetzt) {
      if (stand && stand.nr) {
        s.notieren({
          dauer: Math.max(0, Math.round(jetzt - stand.beginn)),
          fragen: stand.nr,
          aufAnhieb: stand.aufAnhieb,
          stufe: stand.stufe,
        });
      }
      stand = null;
    }

    return Tiere.kinderzimmer(wurzel, s, {
      bilder: ['👂', '🐮', '🐸', '🦉', '🐘'],
      satz: 'Ein Tier ruft – tipp auf das, das es war.',
      stufen: STUFEN,
      stufe: 2,
      toene: RUFER.map((t) => t.id),
      brauchtTon: true,

      spielen(buehne, h) {
        const ohr = h.el('button', 'ho-ohr');
        ohr.type = 'button';
        ohr.setAttribute('aria-label', 'Nochmal hören');
        ohr.innerHTML = LAUTSPRECHER;
        const feld = h.el('div', 'ho-feld');
        buehne.append(ohr, feld);

        let liste = [];
        let frage = null;   // { ziel, kacheln: [{ tier, knoten }], zug, fehl, frei }
        let spielt = 0;     // zählt jeden Ruf; nur der letzte darf den Lautsprecher beruhigen

        function neueRunde() {
          liste = Tiere.mischen(RUFER).slice(0, JE_RUNDE);
          stand = { nr: 0, aufAnhieb: 0, beginn: h.uhr(), stufe: h.stufe };
          stellen();
        }

        function stellen() {
          const ziel = liste[stand.nr];
          const kacheln = wahl(ziel, h.stufe).map((t) => ({ tier: t, knoten: Tiere.kachel(h.el, t) }));
          feld.dataset.anzahl = String(kacheln.length);
          feld.replaceChildren(...kacheln.map((k) => k.knoten));
          for (const k of kacheln) Tiere.anstossen(k.knoten.firstChild, 'kz-auftritt');
          const f = { ziel, kacheln, zug: 0, fehl: false, frei: true };
          frage = f;
          h.spaeter(() => { if (frage === f && f.zug === 0) vorspielen(); }, 700);
        }

        async function vorspielen() {
          const f = frage;
          if (!f || !f.frei) return;
          const mein = ++spielt;
          ohr.classList.add('ho-ohr--spielt');
          const dauer = await h.klang.tier(f.ziel.id, f.ziel.laut);
          if (mein !== spielt) return;
          h.spaeter(() => { if (mein === spielt) ohr.classList.remove('ho-ohr--spielt'); }, Math.max(400, dauer * 1000));
        }

        function verstummen() {
          spielt += 1;
          ohr.classList.remove('ho-ohr--spielt');
        }

        function richtig(w) {
          const f = frage;
          f.frei = false;
          f.zug += 1;
          verstummen();
          if (!f.fehl) stand.aufAnhieb += 1;
          for (const k of f.kacheln) if (k !== w) k.knoten.classList.add('ho-weg');
          Tiere.anstossen(w.knoten.firstChild, 'kz-hops');
          h.klang.still();
          h.klang.freude();
          const r = w.knoten.getBoundingClientRect();
          h.konfetti(r.left + r.width / 2, r.top + r.height / 2);
          h.blase('Das war ' + Tiere.mitArtikel(w.tier) + '!');
          h.spaeter(async () => {
            Tiere.anstossen(w.knoten.firstChild, 'kz-hops');
            const dauer = await h.klang.tier(w.tier.id, w.tier.laut);
            h.spaeter(weiter, Math.max(800, dauer * 1000 + 500));
          }, 700);
        }

        /* Das angetippte Tier ruft selbst, danach kommt der gesuchte Ruf noch
           einmal. Tippt das Kind vorher schon wieder, gilt der neue Tipp, und
           die Wiederholung des alten entfällt. */
        async function falsch(w) {
          const f = frage;
          f.fehl = true;
          const zug = ++f.zug;
          verstummen();
          Tiere.anstossen(w.knoten.firstChild, 'kz-wackel');
          h.blase(Tiere.satz(w.tier));
          const dauer = await h.klang.tier(w.tier.id, w.tier.laut);
          if (frage !== f || f.zug !== zug) return;
          h.spaeter(() => { if (frage === f && f.zug === zug) vorspielen(); }, dauer * 1000 + 600);
        }

        function weiter() {
          stand.nr += 1;
          if (stand.nr < JE_RUNDE) {
            stellen();
            return;
          }
          notieren(h.uhr());
          frage = null;
          feld.replaceChildren();
          h.fest('Super zugehört!', liste.map((t) => t.bild), neueRunde);
        }

        h.an(ohr, 'pointerdown', (e) => {
          e.preventDefault();
          if (!frage || !frage.frei) return;
          frage.zug += 1;
          vorspielen();
        });

        h.an(feld, 'pointerdown', (e) => {
          const k = e.target.closest('.kz-tier');
          if (!k || !frage || !frage.frei) return;
          e.preventDefault();
          const w = frage.kacheln.find((x) => x.knoten === k);
          if (!w) return;
          if (w.tier === frage.ziel) richtig(w);
          else falsch(w);
        });

        neueRunde();

        return {
          ende() {
            frage = null;
          },
        };
      },

      schluss(ms) {
        notieren(ms);
      },
    });
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien, hilfe) {
    const z = Tiere.zahl;
    const fragen = partien.reduce((summe, p) => summe + z(p.fragen), 0);
    // Die Quote nur über Runden, die beides mitschreiben – eine ohne
    // aufAnhieb hieße sonst „nie auf Anhieb".
    let treffer = 0;
    let basis = 0;
    for (const p of partien) {
      const n = z(p.fragen);
      if (n <= 0 || typeof p.aufAnhieb !== 'number' || !Number.isFinite(p.aufAnhieb)) continue;
      basis += n;
      treffer += Math.min(n, Math.max(0, p.aufAnhieb));
    }
    const raus = [{ wert: String(fragen), label: 'Tiere erkannt' }];
    if (basis) raus.push({ wert: hilfe.prozent(treffer, basis), label: 'auf Anhieb' });
    return raus;
  }

  Rahmen.anmelden({
    id: 'horch',
    name: 'Horch mal',
    gruppe: 'kinder',
    unter: 'Ein Tier ruft – welches war es?',
    farbe: '#4E7FB8',
    symbol: '<path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 3.2-3.5 4.2-3.5 7.5a3 3 0 0 1-5.6 1.5"/><path d="M9.5 10a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-2 3.2"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
