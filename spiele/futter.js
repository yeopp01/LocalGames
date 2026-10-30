/* Futterzeit – jedes Tier zu seinem Futter.

   Unten steht ein Tier, oben stehen ein, zwei oder drei Teller. Das Tier
   lässt sich hinziehen; wer noch nicht ziehen kann, tippt auf den Teller, und
   das Tier läuft von selbst hin. Nah genug ist nah genug: Liegt das Tier beim
   Loslassen ungefähr über einem Teller, gilt dieser Teller.

   Falsch gibt es nicht als Fehler. Das Tier schnuppert am fremden Futter, der
   Teller schüttelt sich, das Tier geht zurück – ohne Ton, ohne Rot. Sechs
   Tiere sind eine Runde, dann sind alle satt.

   Auf der Tastatur ruft jede Taste das Tier und zeigt den Weg – wie in
   Tierstimmen: Ein Kleinkind am Laptop haut ohnehin drauf. */

(() => {
  const JE_RUNDE = 6;
  const STUFEN = [
    { wert: 1, text: 'Ein Teller', bilder: ['🥕'] },
    { wert: 2, text: 'Zwei Teller', bilder: ['🥕', '🦴'] },
    { wert: 3, text: 'Drei Teller', bilder: ['🥕', '🦴', '🍌'] },
  ];
  const FRESSER = Tiere.TIERE.filter((t) => t.futter);
  const HOCH = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 11l6-6 6 6M6 18l6-6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* Ein Tier gilt schon, wenn es so nah ist, gemessen an der größeren Kachel. So
     weit reicht sonst kein Kinderarm: Nah genug ist nah genug. Aber nie mehr als
     dieser Anteil des Wegs – ein Zucken am Start füttert noch nicht. */
  const FANG = 1.15;
  const MINDESTWEG = 0.4;
  /* Wie weit der Schwung beim Loslassen zählt, in Sekunden: Wer schnippt, statt
     zu ziehen, meint den Teller, auf den das Tier gerade zufliegt. */
  const SCHWUNG = 0.16;
  /* So viel des Restwegs zieht der nahe Teller das Tier schon zu sich. */
  const MAGNET = 0.3;

  const mittelpunkt = (knoten) => {
    const r = knoten.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, breite: r.width };
  };

  /* Wo das Tier ohne jede Verschiebung stünde. Das Rechteck auf dem Schirm taugt
     dafür nicht: Es läuft mitten im Übergang mit. */
  const heimat = (knoten) => {
    const r = knoten.offsetParent.getBoundingClientRect();
    return { x: r.left + knoten.offsetLeft + knoten.offsetWidth / 2, y: r.top + knoten.offsetTop + knoten.offsetHeight / 2 };
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
        const spiel = h.el('div', 'fu-spiel');
        spiel.append(oben, mitte, unten);
        const reihe = h.reihe(JE_RUNDE);
        buehne.append(spiel, reihe.knoten);

        let liste = [];
        let paar = null;    // { tier, knoten, bild, ziele: [{ tier, knoten }], frei, dx, dy }
        let griff = null;   // { id, x, y, start, weit, vx, vy, zeit, nah }
        let ruheUhr = 0;
        let schonSatt = false;   // solange noch keins gefressen hat, winkt das Tier früher

        function neueRunde() {
          liste = Tiere.mischen(FRESSER).slice(0, JE_RUNDE);
          stand = { nr: 0, fehl: 0, beginn: h.uhr(), stufe: h.stufe };
          reihe.leeren();
          naechstes();
        }

        function naechstes() {
          const tier = liste[stand.nr];
          const knoten = Tiere.kachel(h.el, tier, 'fu-tier');
          const andere = Tiere.mischen(FRESSER.filter((t) => t !== tier)).slice(0, h.stufe - 1);
          const ziele = Tiere.mischen([tier, ...andere]).map((t) => ({ tier: t, knoten: Tiere.futterKachel(h.el, t) }));
          oben.dataset.anzahl = String(ziele.length);
          oben.replaceChildren(...ziele.map((z) => z.knoten));
          unten.replaceChildren(knoten);
          h.blase(Tiere.gross(Tiere.mitArtikel(tier)) + ' hat Hunger!');
          // Bewegt wird die Kachel, gewackelt wird ihr Bild – sonst hielte
          // eine laufende Animation das Tier fest, während es gezogen wird.
          for (const z of ziele) Tiere.anstossen(z.knoten.firstChild, 'kz-auftritt');
          paar = { tier, knoten, bild: knoten.firstChild, ziele, frei: true, dx: 0, dy: 0 };
          Tiere.anstossen(paar.bild, 'kz-auftritt');
          ruhe();
        }

        function winken() {
          Tiere.anstossen(paar.bild, 'kz-winken');
          Tiere.anstossen(mitte, 'fu-mitte--zeigt');
        }

        /* Wer eine Weile nichts tut, bekommt einen Wink: Das Tier wippt, und
           Pfeile zeigen nach oben – aber nie auf den richtigen Teller. Vor dem
           ersten Tier kommt er früher: Da weiß das Kind noch nicht, was es soll. */
        function ruhe() {
          h.abbestellen(ruheUhr);
          ruheUhr = h.spaeter(() => {
            if (paar && paar.frei && !griff) winken();
            ruhe();
          }, schonSatt ? 5000 : 2500);
        }

        /** Der Teller, zu dem das Tier an dieser Stelle gehören würde. */
        function naechsterTeller(x, y) {
          const start = heimat(paar.knoten);
          const breite = paar.knoten.offsetWidth;
          let bester = null;
          let abstand = Infinity;
          for (const z of paar.ziele) {
            const t = mittelpunkt(z.knoten);
            const d = Math.hypot(x - t.x, y - t.y);
            const weg = Math.hypot(start.x - t.x, start.y - t.y);
            if (d < Math.min(Math.max(breite, t.breite) * FANG, weg * (1 - MINDESTWEG)) && d < abstand) {
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
          const start = heimat(p.knoten);
          const t = mittelpunkt(z.knoten);
          // Das Tier setzt sich an den Tellerrand, nicht darauf: Sonst sähe
          // niemand, wie das Futter verschwindet oder der Teller sich schüttelt.
          p.dx = t.x - start.x;
          p.dy = t.y - start.y + t.breite * 0.5 + p.knoten.offsetWidth * 0.4;
          schieben(p, p.dx, p.dy, ' scale(.8)', '.3s cubic-bezier(.3, .7, .4, 1)');
          if (z.tier === p.tier) {
            h.spaeter(() => fressen(p, z), 320);
            return;
          }
          stand.fehl += 1;
          h.blase('Hm, ' + Tiere.mitArtikel(p.tier) + ' möchte etwas anderes.');
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
          schonSatt = true;
          h.spaeter(async () => {
            const m = mittelpunkt(p.knoten);
            h.konfetti(m.x, m.y);
            h.fuehlen(12);
            h.blase(Tiere.gross(Tiere.mitArtikel(p.tier)) + ' ist satt!');
            reihe.fuellen(stand.nr, p.tier.bild);
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
          if (!paar.frei || griff) return;
          // Auch knapp daneben gilt als Griff: Das Tier springt dann unter den
          // Finger. Kleine Finger treffen die Kachel nicht immer.
          const h0 = heimat(paar.knoten);
          const aufTier = !!e.target.closest('.fu-tier');
          if (!aufTier && Math.hypot(e.clientX - h0.x, e.clientY - h0.y) > paar.knoten.offsetWidth) return;
          e.preventDefault();
          griff = {
            id: e.pointerId,
            x: aufTier ? e.clientX : h0.x,
            y: aufTier ? e.clientY : h0.y,
            start: h0,
            weit: 0,
            vx: 0,
            vy: 0,
            zeit: e.timeStamp,
            nah: null,
          };
          try {
            paar.knoten.setPointerCapture(e.pointerId);
          } catch { /* synthetisch */ }
          paar.knoten.classList.add('fu-tier--gezogen');
          paar.dx = e.clientX - griff.x;
          paar.dy = e.clientY - griff.y;
          schieben(paar, paar.dx, paar.dy, ' scale(1.12)', '.12s ease-out');
          Tiere.anstossen(paar.bild, 'kz-hops');
          if (paar.tier.ton) h.klang.tier(paar.tier.id, paar.tier.laut);
          else h.klang.plopp();
        });

        h.an(buehne, 'pointermove', (e) => {
          if (!griff || e.pointerId !== griff.id || !paar) return;
          const dx = e.clientX - griff.x;
          const dy = e.clientY - griff.y;
          const dt = Math.max(1, e.timeStamp - griff.zeit) / 1000;
          // Geglättet: Das letzte Stück allein zittert zu sehr.
          griff.vx = griff.vx * 0.6 + ((dx - paar.dx) / dt) * 0.4;
          griff.vy = griff.vy * 0.6 + ((dy - paar.dy) / dt) * 0.4;
          griff.zeit = e.timeStamp;
          griff.weit = Math.max(griff.weit, Math.hypot(dx, dy));
          paar.dx = dx;
          paar.dy = dy;
          const x = griff.start.x + dx;
          const y = griff.start.y + dy;
          const nah = naechsterTeller(x, y);
          if (nah !== griff.nah) {
            for (const z of paar.ziele) z.knoten.classList.toggle('kz-futter--nah', z === nah);
            if (nah) {
              Tiere.anstossen(nah.knoten.firstChild, 'kz-hops');
              h.fuehlen(8);
            }
            griff.nah = nah;
          }
          // Das Tier neigt sich in die Richtung, in die es gezogen wird, und
          // der nahe Teller zieht es schon ein Stück zu sich.
          const kipp = Math.max(-14, Math.min(14, griff.vx / 60));
          const t = nah && mittelpunkt(nah.knoten);
          schieben(paar, t ? dx + (t.x - x) * MAGNET : dx, t ? dy + (t.y - y) * MAGNET : dy,
            ' scale(1.12) rotate(' + kipp.toFixed(1) + 'deg)', t ? '.12s ease-out' : null);
        });

        const loslassen = (e, abgebrochen) => {
          if (!griff || (e && e.pointerId !== griff.id) || !paar) return;
          const g = griff;
          griff = null;
          paar.knoten.classList.remove('fu-tier--gezogen');
          for (const z of paar.ziele) z.knoten.classList.remove('kz-futter--nah');
          // Langsam: Wer schon lange nicht mehr bewegt hat, schnippt nicht.
          const schwung = e && e.timeStamp - g.zeit < 80 ? SCHWUNG : 0;
          const nah = abgebrochen ? null : naechsterTeller(
            g.start.x + paar.dx + g.vx * schwung,
            g.start.y + paar.dy + g.vy * schwung,
          );
          if (nah) {
            waehlen(nah);
            return;
          }
          heim(paar);
          // Nur angetippt, nicht gezogen: Das Tier zeigt gleich, wohin es will.
          if (!abgebrochen && g.weit < 12) {
            h.abbestellen(ruheUhr);
            mitte.classList.remove('fu-mitte--zeigt');
            h.spaeter(() => { if (paar && paar.frei && !griff) winken(); }, 650);
            ruhe();
          }
        };
        h.an(buehne, 'pointerup', (e) => loslassen(e, false));
        h.an(buehne, 'pointercancel', (e) => loslassen(e, true));
        /* Ein Loslassen, das nie ankommt, hielte das Tier sonst für immer fest:
           Wer das Handy weglegt oder die App wechselt, nimmt den Finger mit. */
        h.an(window, 'blur', () => loslassen(null, true));
        h.an(document, 'visibilitychange', () => { if (document.hidden) loslassen(null, true); });

        h.an(window, 'keydown', (e) => {
          if (e.key === 'Escape' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
          if (!paar || !paar.frei || griff) return;
          ruhe();
          winken();
          if (paar.tier.ton) h.klang.tier(paar.tier.id, paar.tier.laut);
          else h.klang.plopp();
        });

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
