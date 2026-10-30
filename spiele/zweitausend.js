/* 2048 – gleiche Zahlen zusammenschieben, bis 2048 dasteht.

   Der Kern ist eine einzige Zeilenoperation: eine Reihe nach links schieben.
   Alle vier Richtungen entstehen daraus, indem die Reihe vorher passend
   ausgelesen und hinterher zurückgeschrieben wird. Das spart drei Viertel
   des Codes und drei Viertel der Fehlerquellen.
*/

(() => {
  const N = 4;
  const ZIEL = 2048;
  const GLEITEN_MS = 110;

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

  /* Wer rutscht wohin? Nur fürs Bild: Die Regel bleibt allein in schiebeReihe,
     das hier läuft dieselbe Reihe noch einmal ab und merkt sich die Wege. */
  function wege(brett, richtung) {
    const raus = [];
    for (let nr = 0; nr < N; nr += 1) {
      const felder = reihenFelder(richtung, nr);
      let ziel = 0;
      let offen = null;       // die vorderste Kachel, die noch verschmelzen kann
      for (const von of felder) {
        const wert = brett[von];
        if (!wert) continue;
        if (offen && offen.wert === wert) {
          raus.push({ von, nach: offen.nach, wert, verschmilzt: true });
          offen.verschmilzt = true;
          offen = null;
        } else {
          offen = { von, nach: felder[ziel], wert, verschmilzt: false };
          raus.push(offen);
          ziel += 1;
        }
      }
    }
    return raus;
  }

  const gehtNoch = (brett) =>
    ['links', 'rechts', 'hoch', 'runter'].some((r) => schieben(brett, r).bewegt);

  /* Liefert die Stelle, damit das Bild sie auftauchen lassen kann. */
  function neueKachel(brett) {
    const frei = brett.map((w, i) => (w ? -1 : i)).filter((i) => i >= 0);
    if (!frei.length) return -1;
    const i = frei[Math.floor(Math.random() * frei.length)];
    brett[i] = Math.random() < 0.9 ? 2 : 4;
    return i;
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();

    function frisch() {
      const brett = new Array(N * N).fill(0);
      neueKachel(brett);
      neueKachel(brett);
      return {
        brett,
        punkte: 0,
        zuege: 0,
        gewonnenGemeldet: false,
        vorher: null,          // { brett, punkte, zuege } vor dem letzten Zug
        verbraucht: 0,
        seit: Date.now(),
        fertig: false,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.brett) && alt.brett.length === N * N && !alt.fertig) {
        alt.seit = Date.now();
        // Stände von früher kennen das Zurücknehmen nicht.
        if (!alt.vorher || !Array.isArray(alt.vorher.brett) || alt.vorher.brett.length !== N * N) alt.vorher = null;
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

    const kopf = el('div', 'z-kopf');
    const brettKasten = el('div', 'z-brett');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste');
    wurzel.append(kopf, brettKasten, endeKasten, leiste);

    /* Die leeren Felder liegen fest im Gitter, die Kacheln in einer zweiten Schicht
       genau darüber. So kann eine Kachel über die anderen hinwegrutschen. */
    const platz = (knoten, i) => {
      knoten.style.gridRow = String(Math.floor(i / N) + 1);
      knoten.style.gridColumn = String((i % N) + 1);
    };
    for (let i = 0; i < N * N; i += 1) brettKasten.append(el('div', 'z-feld'));
    const kachelSchicht = el('div', 'z-schicht');
    brettKasten.append(kachelSchicht);

    const knopfRichtung = (zeichen, richtung) => {
      const b = el('button', 'knopf knopf--still z-pfeil', zeichen);
      b.type = 'button';
      b.setAttribute('aria-label', 'Nach ' + richtung);
      b.addEventListener('click', () => zug(richtung));
      return b;
    };
    const rueckKnopf = s.leistenKnopf('Rückgängig', 'rueckgaengig', rueckgaengig);
    leiste.append(
      knopfRichtung('←', 'links'), knopfRichtung('↑', 'hoch'),
      knopfRichtung('↓', 'runter'), knopfRichtung('→', 'rechts'),
      rueckKnopf,
    );

    /* Die Zahlen stehen in festen Kästchen. Sie werden nur neu beschriftet, nicht
       neu gebaut – sonst wüsste das „+16" nicht, woran es hängt. */
    const zahlKasten = (titel) => {
      const k = el('div', 'z-zahl');
      const wert = el('b', 'z-zahl-wert', '0');
      k.append(el('span', 'z-zahl-titel', titel), wert);
      kopf.append(k);
      return { k, wert };
    };
    const punkteKasten = zahlKasten('Punkte');
    const bestKasten = zahlKasten('Bestwert');
    const zuegeKasten = zahlKasten('Züge');

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neues Spiel', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    /* --------------------------------------------------------------- Zug */

    function zug(richtung) {
      if (stand.fertig) return;
      const erg = schieben(stand.brett, richtung);
      // Nichts rutscht: Das Brett zuckt kurz, damit klar ist, dass die Geste ankam.
      if (!erg.bewegt) { anstossen(richtung); return; }

      const bewegungen = wege(stand.brett, richtung);
      stand.vorher = { brett: stand.brett, punkte: stand.punkte, zuege: stand.zuege };
      stand.brett = erg.brett;
      stand.punkte += erg.punkte;
      stand.zuege += 1;
      const neuBei = neueKachel(stand.brett);
      if (erg.punkte) s.fuehlen(8);

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
      zeichnen({ bewegungen, neuBei, dazu: erg.punkte });
      // Auf einem flachen Fenster läge das Ergebnis sonst unter dem Rand.
      if (stand.fertig) endeKasten.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    /* Ein Schritt zurück, nicht mehr: Der Fehlgriff ist billig, aber das Spiel
       bleibt eines, in dem man vorausdenkt. Eine beendete Partie steht schon in
       der Statistik und lässt sich nicht sauber zurückdrehen. */
    function rueckgaengig() {
      if (stand.fertig || !stand.vorher) return;
      stand.brett = stand.vorher.brett;
      stand.punkte = stand.vorher.punkte;
      stand.zuege = stand.vorher.zuege;
      stand.vorher = null;
      s.fuehlen();
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

    function zeichnen(zugBild = null) {
      kachelnZeichnen(zugBild);
      rueckKnopf.disabled = stand.fertig || !stand.vorher;
      kopfZeichnen(zugBild ? zugBild.dazu : 0);
      endeZeichnen();
      leiste.hidden = stand.fertig;
      brettKasten.dataset.ende = stand.fertig ? 'ja' : 'nein';
    }

    const bewegtSich = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function kachelBauen(i, wert) {
      const k = el('div', 'z-kachel', String(wert));
      k.dataset.wert = String(wert);
      k.dataset.stellen = String(String(wert).length);
      platz(k, i);
      return k;
    }

    /* Das Brett steht sofort im neuen Stand, die Bewegung wird nur darübergespielt.
       Wer schnell tippt, wartet so nie auf eine Animation: Der nächste Zug baut
       einfach neu auf und nimmt die alte mit. */
    function kachelnZeichnen(zugBild) {
      const neu = [];
      const abspielen = [];
      const liegt = new Set();

      if (zugBild && bewegtSich()) {
        const masse = getComputedStyle(kachelSchicht);
        const schritt = (kachelSchicht.getBoundingClientRect().width + parseFloat(masse.columnGap)) / N;
        for (const b of zugBild.bewegungen) {
          const weg = [
            { transform: 'translate(' + ((b.von % N) - (b.nach % N)) * schritt + 'px,'
              + (Math.floor(b.von / N) - Math.floor(b.nach / N)) * schritt + 'px)' },
            { transform: 'translate(0, 0)' },
          ];
          const k = kachelBauen(b.nach, b.wert);
          neu.push(k);
          if (b.verschmilzt) {
            // Beide Partner rutschen als Geister hin und verschwinden; die Summe
            // erscheint erst, wenn sie angekommen sind.
            k.classList.add('z-geist');
            abspielen.push(() => k.animate(weg, { duration: GLEITEN_MS, easing: 'ease-out', fill: 'both' })
              .finished.then(() => k.remove()).catch(() => {}));
          } else {
            liegt.add(b.nach);
            if (b.von !== b.nach) abspielen.push(() => k.animate(weg, { duration: GLEITEN_MS, easing: 'ease-out' }));
          }
        }
      }

      for (let i = 0; i < N * N; i += 1) {
        const w = stand.brett[i];
        if (!w || liegt.has(i)) continue;
        const k = kachelBauen(i, w);
        neu.push(k);
        if (zugBild && bewegtSich()) {
          const auftritt = i === zugBild.neuBei
            ? [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }]
            : [{ transform: 'scale(.9)', opacity: 0 }, { transform: 'scale(1.12)', opacity: 1, offset: .5 }, { transform: 'scale(1)', opacity: 1 }];
          abspielen.push(() => k.animate(auftritt, { duration: 150, delay: GLEITEN_MS - 10, easing: 'ease-out', fill: 'backwards' }));
        }
      }

      kachelSchicht.replaceChildren(...neu);
      for (const los of abspielen) los();
    }

    function anstossen(richtung) {
      if (!bewegtSich()) return;
      const [x, y] = { links: [-5, 0], rechts: [5, 0], hoch: [0, -5], runter: [0, 5] }[richtung];
      brettKasten.animate(
        [{ transform: 'none' }, { transform: 'translate(' + x + 'px,' + y + 'px)' }, { transform: 'none' }],
        { duration: 130, easing: 'ease-out' },
      );
    }

    function kopfZeichnen(dazu = 0) {
      punkteKasten.wert.textContent = String(stand.punkte);
      zuegeKasten.wert.textContent = String(stand.zuege);
      // Sobald die laufende Partie den alten Bestwert schlägt, läuft er mit.
      const bisher = bestwert();
      bestKasten.k.hidden = !bisher;
      bestKasten.wert.textContent = String(Math.max(bisher, stand.punkte));
      if (dazu && bewegtSich()) {
        const plus = el('span', 'z-dazu', '+' + dazu);
        punkteKasten.k.append(plus);
        plus.addEventListener('animationend', () => plus.remove());
      }
      // „Höchste Kachel: 4096" passte im Kopf des Handys nicht und wurde abgeschnitten.
      s.unter('Höchste: ' + Math.max(...stand.brett));
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !stand.fertig;
      if (!stand.fertig) return;
      const hoechste = Math.max(...stand.brett);
      endeKasten.append(el('p', 'ende-titel', 'Kein Zug mehr möglich.'));
      if (stand.punkte >= bestwert() && stand.punkte > 0) {
        endeKasten.append(el('span', 'ende-marke', 'Das ist dein Bestwert.'));
      }
      endeKasten.append(el('p', 'notiz',
        stand.punkte + ' Punkte, höchste Kachel ' + hoechste + ', ' + stand.zuege + ' Züge.'));
      const l = el('div', 'leiste');
      const b = el('button', 'knopf knopf--voll', 'Nochmal');
      b.type = 'button';
      b.prepend(s.bildzeichen('nochmal'));
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
      d.append(el('p', 'notiz', '„Rückgängig" oder die Rücktaste nimmt den letzten Zug zurück: einen Schritt, nicht mehr. Nach dem Ende geht das nicht mehr, dann bringt Enter ein neues Brett.'));
      d.append(el('p', 'notiz', 'Der Rat der Erfahrenen: such dir eine Ecke, halte die größte Kachel dort und schiebe nie in die Gegenrichtung.'));
      s.blatt({ titel: '2048', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* ------------------------------------------------------- Steuerung */

    function taste(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!document.getElementById('sheet-spiel').hidden) return;
      if (e.key === 'Backspace') { e.preventDefault(); rueckgaengig(); return; }
      if (e.key === 'Enter' && stand.fertig) { e.preventDefault(); if (!e.repeat) neu(); return; }
      const richtung = {
        ArrowLeft: 'links', ArrowRight: 'rechts', ArrowUp: 'hoch', ArrowDown: 'runter',
        a: 'links', d: 'rechts', w: 'hoch', s: 'runter',
      }[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (richtung) { e.preventDefault(); zug(richtung); }
    }
    window.addEventListener('keydown', taste);

    /* Wischen: ab 30 Pixeln zählt die stärkere der beiden Achsen. Der Zug fällt,
       sobald die Strecke erreicht ist, nicht erst beim Loslassen – das fühlt sich
       direkt an. Der festgehaltene Zeiger meldet sich auch dann noch, wenn der
       Finger oder die Maus das Brett verlässt. */
    let start = null;
    brettKasten.addEventListener('pointerdown', (e) => {
      start = { x: e.clientX, y: e.clientY };
      brettKasten.setPointerCapture(e.pointerId);
    });
    brettKasten.addEventListener('pointermove', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
      start = null;
      zug(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'rechts' : 'links') : (dy > 0 ? 'runter' : 'hoch'));
    });
    brettKasten.addEventListener('pointerup', () => { start = null; });
    brettKasten.addEventListener('pointercancel', () => { start = null; });

    sichern();
    zeichnen();

    return {
      ende: () => {
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
    gruppe: 'brett-und-karten',
    unter: 'Zahlen zusammenschieben.',
    farbe: '#C9A227',
    symbol: '<rect x="3" y="3" width="8" height="8" rx="1.6"/><rect x="13" y="3" width="8" height="8" rx="1.6"/><rect x="3" y="13" width="8" height="8" rx="1.6"/><path d="M15 17h4M17 15v4" stroke-linecap="round"/>',
    starten,
    auswertung,
  });
})();
