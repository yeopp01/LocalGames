/* Futterzeit – jedes Tier zu seinem Futter.

   Unten steht ein Tier, oben stehen ein, zwei oder drei Teller. Das Tier
   lässt sich hinziehen; wer noch nicht ziehen kann, tippt auf den Teller, und
   das Tier läuft von selbst hin. Nah genug ist nah genug: Liegt das Tier beim
   Loslassen ungefähr über einem Teller, gilt dieser Teller.

   Falsch gibt es nicht als Fehler. Das Tier schnuppert am fremden Futter, der
   Teller schüttelt sich, das Tier geht zurück – ohne Ton, ohne Rot. Sechs
   Tiere sind eine Runde, dann sind alle satt. */

(() => {
  const JE_RUNDE = 6;
  const STUFEN = [
    { wert: 1, text: 'Ein Teller' },
    { wert: 2, text: 'Zwei Teller' },
    { wert: 3, text: 'Drei Teller' },
  ];
  const FRESSER = Tiere.TIERE.filter((t) => t.futter);
  const HOCH = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 11l6-6 6 6M6 18l6-6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const mittelpunkt = (knoten) => {
    const r = knoten.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, breite: r.width };
  };

  function starten(wurzel, s) {
    let stand = null;   // die laufende Runde: { nr, fehl, beginn, stufe }

    /* jetzt und beginn laufen auf der Uhr des Zimmers – Zeit im Hintergrund
       zählt nicht mit. Eine angefangene Runde zählt mit den Tieren, die schon
       satt sind; ohne ein einziges gibt es nichts zu notieren. */
    function notieren(jetzt) {
      if (stand && stand.nr) {
        s.notieren({
          dauer: Math.max(0, Math.round(jetzt - stand.beginn)),
          tiere: stand.nr,
          fehlgriffe: stand.fehl,
          stufe: stand.stufe,
        });
      }
      stand = null;
    }

    return Tiere.kinderzimmer(wurzel, s, {
      bilder: ['🐶', '🦴', '🐰', '🥕', '🐵', '🍌'],
      satz: 'Zieh jedes Tier zu seinem Futter – oder tipp auf den Teller.',
      stufen: STUFEN,
      stufe: 1,
      toene: [...FRESSER.filter((t) => t.ton).map((t) => t.id), 'knabbern'],

      spielen(buehne, h) {
        const oben = h.el('div', 'fu-ziele');
        const mitte = h.el('div', 'fu-mitte');
        mitte.innerHTML = HOCH;
        const unten = h.el('div', 'fu-start');
        buehne.append(oben, mitte, unten);

        let liste = [];
        let paar = null;    // { tier, knoten, bild, ziele: [{ tier, knoten }], frei, dx, dy }
        let griff = null;   // { id, x, y }
        let ruheUhr = 0;

        function neueRunde() {
          liste = Tiere.mischen(FRESSER).slice(0, JE_RUNDE);
          stand = { nr: 0, fehl: 0, beginn: h.uhr(), stufe: h.stufe };
          naechstes();
        }

        function naechstes() {
          const tier = liste[stand.nr];
          const knoten = Tiere.kachel(h.el, tier, 'fu-tier');
          const andere = Tiere.mischen(FRESSER.filter((t) => t !== tier)).slice(0, h.stufe - 1);
          const ziele = Tiere.mischen([tier, ...andere]).map((t) => ({ tier: t, knoten: Tiere.futterKachel(h.el, t) }));
          oben.replaceChildren(...ziele.map((z) => z.knoten));
          unten.replaceChildren(knoten);
          // Bewegt wird die Kachel, gewackelt wird ihr Bild – sonst hielte
          // eine laufende Animation das Tier fest, während es gezogen wird.
          for (const z of ziele) Tiere.anstossen(z.knoten.firstChild, 'kz-auftritt');
          paar = { tier, knoten, bild: knoten.firstChild, ziele, frei: true, dx: 0, dy: 0 };
          Tiere.anstossen(paar.bild, 'kz-auftritt');
          ruhe();
        }

        /* Wer eine Weile nichts tut, bekommt einen Wink: Das Tier wippt, und
           Pfeile zeigen nach oben – aber nie auf den richtigen Teller. */
        function ruhe() {
          h.abbestellen(ruheUhr);
          ruheUhr = h.spaeter(() => {
            if (paar && paar.frei && !griff) {
              Tiere.anstossen(paar.bild, 'kz-winken');
              Tiere.anstossen(mitte, 'fu-mitte--zeigt');
            }
            ruhe();
          }, 5000);
        }

        function naechsterTeller() {
          const a = mittelpunkt(paar.knoten);
          let bester = null;
          let abstand = Infinity;
          for (const z of paar.ziele) {
            const t = mittelpunkt(z.knoten);
            const d = Math.hypot(a.x - t.x, a.y - t.y);
            if (d < Math.max(a.breite, t.breite) * 0.85 && d < abstand) {
              bester = z;
              abstand = d;
            }
          }
          return bester;
        }

        function schieben(p, x, y, zusatz, zeit) {
          p.knoten.style.transition = zeit ? 'transform ' + zeit : 'none';
          p.knoten.style.transform = 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)' + (zusatz || '');
        }

        function heim(p) {
          p.dx = 0;
          p.dy = 0;
          p.knoten.style.transition = 'transform .35s cubic-bezier(.3, 1.3, .5, 1)';
          p.knoten.style.transform = '';
        }

        function waehlen(z) {
          const p = paar;
          if (!p || !p.frei || !z) return;
          p.frei = false;
          const a = mittelpunkt(p.knoten);
          const t = mittelpunkt(z.knoten);
          // Die Verschiebung kommt zu der dazu, die das Tier schon hat – es
          // kann mitten auf dem Weg losgelassen worden sein.
          const zx = p.dx + (t.x - a.x);
          const zy = p.dy + (t.y - a.y);
          if (z.tier === p.tier) {
            p.dx = zx;
            p.dy = zy;
            schieben(p, zx, zy, ' scale(.8)', '.3s cubic-bezier(.3, .7, .4, 1)');
            h.spaeter(() => fressen(p, z), 320);
            return;
          }
          stand.fehl += 1;
          schieben(p, p.dx + (t.x - a.x) * 0.6, p.dy + (t.y - a.y) * 0.6, '', '.3s ease-out');
          h.spaeter(() => {
            Tiere.anstossen(z.knoten.firstChild, 'kz-wackel');
            Tiere.anstossen(p.bild, 'kz-wackel');
          }, 300);
          h.spaeter(() => {
            heim(p);
            p.frei = true;
          }, 900);
        }

        function fressen(p, z) {
          z.knoten.classList.add('kz-futter--leer');
          Tiere.anstossen(p.bild, 'kz-mampf');
          h.klang.knabbern();
          h.spaeter(async () => {
            const m = mittelpunkt(p.knoten);
            h.konfetti(m.x, m.y);
            h.blase(Tiere.gross(Tiere.mitArtikel(p.tier)) + ' ist satt!');
            Tiere.anstossen(p.bild, 'kz-hops');
            const dauer = p.tier.ton ? await h.klang.tier(p.tier.id, p.tier.laut) : 0;
            h.spaeter(weiter, Math.max(1000, dauer * 1000 + 350));
          }, 750);
        }

        function weiter() {
          stand.nr += 1;
          if (stand.nr < JE_RUNDE) {
            naechstes();
            return;
          }
          notieren(h.uhr());
          paar = null;
          oben.replaceChildren();
          unten.replaceChildren();
          h.fest('Alle satt!', liste.map((t) => t.bild), neueRunde);
        }

        /* --------------------------------------------------------- Finger */

        h.an(buehne, 'pointerdown', (e) => {
          if (!paar) return;
          ruhe();
          const teller = e.target.closest('.kz-futter');
          if (teller) {
            e.preventDefault();
            if (!griff) waehlen(paar.ziele.find((z) => z.knoten === teller));
            return;
          }
          if (!paar.frei || griff || !e.target.closest('.fu-tier')) return;
          e.preventDefault();
          griff = { id: e.pointerId, x: e.clientX, y: e.clientY };
          try {
            paar.knoten.setPointerCapture(e.pointerId);
          } catch { /* synthetisch */ }
          paar.knoten.classList.add('fu-tier--gezogen');
          schieben(paar, 0, 0, ' scale(1.08)');
          Tiere.anstossen(paar.bild, 'kz-hops');
          if (paar.tier.ton) h.klang.tier(paar.tier.id, paar.tier.laut);
          else h.klang.plopp();
        });

        h.an(buehne, 'pointermove', (e) => {
          if (!griff || e.pointerId !== griff.id || !paar) return;
          paar.dx = e.clientX - griff.x;
          paar.dy = e.clientY - griff.y;
          schieben(paar, paar.dx, paar.dy, ' scale(1.08)');
          const nah = naechsterTeller();
          for (const z of paar.ziele) z.knoten.classList.toggle('kz-futter--nah', z === nah);
        });

        const loslassen = (e, abgebrochen) => {
          if (!griff || e.pointerId !== griff.id || !paar) return;
          griff = null;
          paar.knoten.classList.remove('fu-tier--gezogen');
          const nah = abgebrochen ? null : naechsterTeller();
          for (const z of paar.ziele) z.knoten.classList.remove('kz-futter--nah');
          if (nah) waehlen(nah);
          else heim(paar);
        };
        h.an(buehne, 'pointerup', (e) => loslassen(e, false));
        h.an(buehne, 'pointercancel', (e) => loslassen(e, true));

        neueRunde();

        return {
          ende() {
            paar = null;
            griff = null;
          },
        };
      },

      schluss(ms) {
        notieren(ms);
      },
    });
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien) {
    const z = Tiere.zahl;
    const tiere = partien.reduce((summe, p) => summe + z(p.tiere), 0);
    const satt = partien.filter((p) => z(p.tiere) >= JE_RUNDE).length;
    return [
      { wert: String(tiere), label: 'Tiere gefüttert' },
      { wert: String(satt), label: 'Runden alle satt' },
    ];
  }

  Rahmen.anmelden({
    id: 'futter',
    name: 'Futterzeit',
    gruppe: 'kinder',
    unter: 'Zieh das Tier zu seinem Futter.',
    farbe: '#6C9A3E',
    symbol: '<path d="M3.5 12.5h17a8.5 7.5 0 0 1-17 0z"/><path d="M9.5 9.5c-.9-1.4.9-2.3 0-3.8M14.5 9.5c-.9-1.4.9-2.3 0-3.8"/>',
    ohneSiege: true,
    starten,
    auswertung,
  });
})();
