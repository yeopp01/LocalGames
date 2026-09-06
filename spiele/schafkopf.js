/* Schafkopf – bayrisch, zu viert, gegen drei Rechner.

   Die Regeln und der Rechner stehen in spiele/karten.js; hier steht der Tisch.
   Diese Datei kümmert sich um Gabe, Ansage, die acht Stiche, die Abrechnung –
   und um das, was den Unterschied zum bloßen Kartenspiel macht: die Hinweise.

   Drei Stufen, oben unter der Glühbirne einstellbar:

     aus        nichts, nur die Regeln
     Tipp       ein Knopf, der auf die richtige Karte zeigt und sagt, warum
     Mitlesen   nach jeder deiner Karten ein Urteil, und am Ende die Bilanz

   Der Hinweisgeber rechnet aus deiner Sicht. Er sieht dein Blatt und alles,
   was liegt – die Karten der anderen sieht er nicht. Ein Tipp kann deshalb
   danebengehen; er ist der beste Zug nach dem, was man wissen kann, und nicht
   der beste Zug nach dem, was zufällig der Fall ist. Andersherum wäre es
   Betrug und als Lehrer wertlos: Man lernt nichts von jemandem, der schummelt.
*/

(() => {
  const K = Karten;

  const NAMEN = ['du', 'Vroni', 'Sepp', 'Resi'];
  const PLATZ = ['unten', 'links', 'oben', 'rechts'];
  const ICH = 0;

  const DENKZEIT = 620;      // wie lang ein Rechner "überlegt"
  const STICHZEIT = 1250;    // wie lang ein voller Stich liegen bleibt

  /* Die vier Farbzeichen, selbst gezeichnet – kein fremder Kartensatz, so wie
     die Wortlisten und die Schriften hier auch nicht von außen kommen.

     Gefüllte Umrisse und keine Striche: Auf dreißig Pixeln fällt eine
     Konturlinie auseinander, eine Silhouette bleibt eine Silhouette. Was Loch
     sein soll – der Schlitz der Schelle, die Öse –, wird in Papierfarbe
     darübergelegt statt ausgespart; das spart die Umkehrregeln im Pfad. */
  const ZEICHEN = [
    /* Eichel: Stiel, Kappe, Frucht. Der Spalt dazwischen ist echter Abstand. */
    '<path class="sk-voll" d="M11.2 1.5h1.6v2.6h-1.6z"/>'
      + '<path class="sk-voll" d="M5.3 8.6C5.3 5.6 8.3 3.4 12 3.4s6.7 2.2 6.7 5.2z"/>'
      + '<path class="sk-voll" d="M6.1 9.8h11.8c0 6.7-2.4 11.2-5.9 11.2S6.1 16.5 6.1 9.8z"/>',
    /* Gras: das Laub, wie es auf dem bayrischen Blatt steht – Blatt mit Stiel. */
    '<path class="sk-voll" d="M12 2.3c3.4 4.5 8 7 8 11.1a4.1 4.1 0 0 1-6.7 3.2c.3 1.9.9 3.2 2 4.4H8.7c1.1-1.2 1.7-2.5 2-4.4A4.1 4.1 0 0 1 4 13.4C4 9.3 8.6 6.8 12 2.3z"/>',
    /* Herz. */
    '<path class="sk-voll" d="M12 21.3C6.4 17.2 3.3 14 3.3 10.2A4.7 4.7 0 0 1 12 7.7a4.7 4.7 0 0 1 8.7 2.5c0 3.8-3.1 7-8.7 11.1z"/>',
    /* Schellen: die runde Schelle mit Öse und Schlitz. */
    '<circle class="sk-voll" cx="12" cy="5" r="2.2"/>'
      + '<circle class="sk-aus" cx="12" cy="5" r="1"/>'
      + '<circle class="sk-voll" cx="12" cy="13.7" r="7"/>'
      + '<rect class="sk-aus" x="7.4" y="12.8" width="9.2" height="1.9" rx=".95"/>',
  ];

  const sauKarteVon = (sp) => (sp && sp.art === 'sau' ? K.karte(sp.farbe, 0) : -1);

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let denkt = false;
    let uhren = [];
    let tipp = null;         // { karte, text, quote }
    let vorabRat = null;     // Bewertung deines Zuges, im Voraus gerechnet
    let vorabFuer = -1;      // für welchen Stich sie gilt

    const spaeter = (tun, ms) => { uhren.push(setTimeout(tun, ms)); };
    const uhrenAus = () => { for (const u of uhren) clearTimeout(u); uhren = []; };

    /* ---------------------------------------------------------- Spielstand */

    function frisch(alt) {
      return {
        phase: 'ansage',
        geber: alt ? (alt.geber + 1) % 4 : 3,   // damit du die erste Vorhand hast
        haende: [[], [], [], []],
        start: [[], [], [], []],
        spielart: null, spieler: -1, partner: -1,
        gebote: [], zeiger: 0,
        stiche: [], aktuell: { start: 0, karten: [] }, stichFertig: false,
        amZug: 0, sauWeg: false, davon: false,
        begonnen: Date.now(),
        hilfen: 0, treffer: 0, gezaehlt: 0,
        abrechnung: null,
        lehre: alt ? alt.lehre : 'tipp',
        konto: alt ? alt.konto.slice() : [0, 0, 0, 0],
        gaben: alt ? alt.gaben : 0,
        notiz: null,
      };
    }

    function laden() {
      const a = s.erinnert();
      if (a && Array.isArray(a.haende) && a.haende.length === 4 && a.phase
          && ['ansage', 'spiel', 'ende'].includes(a.phase)) {
        if (!Array.isArray(a.konto)) a.konto = [0, 0, 0, 0];
        if (!a.lehre) a.lehre = 'tipp';
        return a;
      }
      return frisch(null);
    }

    const sichern = () => s.merken(stand);
    const vorhand = () => (stand.geber + 1) % 4;
    const ord = () => K.ordnung(stand.spielart);
    const sauKarte = () => sauKarteVon(stand.spielart);

    /* Meine Partei – aber nur, soweit ich sie kennen darf. Beim Sauspiel weiß
       man vor dem Fallen der Sau nicht, wer zu wem gehört, und die Anzeige
       tut auch nicht so. */
    function partnerBekannt() {
      if (!stand.spielart || stand.spielart.art !== 'sau') return true;
      return stand.sauWeg || stand.davon;
    }

    function meineSeite() {
      if (stand.spieler === ICH) return 1;
      if (stand.spielart.art === 'sau' && stand.partner === ICH) return 1;
      return 0;
    }

    function zustand() {
      return {
        spielart: stand.spielart, spieler: stand.spieler, haende: stand.haende,
        stiche: stand.stiche, aktuell: stand.aktuell, davon: stand.davon,
      };
    }

    function weltJetzt() {
      const w = K.welt(stand.spielart, stand.haende, stand.spieler, stand.partner,
        stand.amZug, stand.aktuell.start, stand.aktuell.karten);
      w.sauWeg = stand.sauWeg;
      w.davon = stand.davon;
      return w;
    }

    const erlaubteJetzt = (p) => K.erlaubt(weltJetzt(), p);

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'sk-kopf');
    const tisch = el('div', 'sk-tisch');
    const mitspieler = [];
    for (const i of [1, 2, 3]) {
      const m = el('div', 'sk-mitspieler sk-mitspieler--' + PLATZ[i]);
      m.append(el('span', 'sk-name', NAMEN[i]));
      m.append(el('span', 'sk-rolle', ''));
      m.append(el('span', 'sk-ruecken', ''));
      tisch.append(m);
      mitspieler[i] = m;
    }
    const stichKasten = el('div', 'sk-stich');
    tisch.append(stichKasten);

    const notizKasten = el('div', 'sk-notiz');
    notizKasten.hidden = true;
    const handKasten = el('div', 'sk-hand');
    const ansageKasten = el('div', 'sk-ansage');
    ansageKasten.hidden = true;
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste');

    wurzel.append(kopf, tisch, notizKasten, ansageKasten, handKasten, leiste, endeKasten);

    const tippKnopf = el('button', 'knopf knopf--still', 'Tipp');
    tippKnopf.type = 'button';
    tippKnopf.addEventListener('click', tippGeben);
    leiste.append(tippKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Hinweise', symbol: '<path d="M9 18h6M10 21h4" stroke-linecap="round"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z"/>', tun: hinweiseWaehlen },
      { label: 'Neu geben', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    /* --------------------------------------------------------------- Gabe */

    function geben() {
      const stapel = K.ALLE.slice();
      K.mischen(stapel, Math.random);
      const neu = frisch(stand);
      for (let p = 0; p < 4; p += 1) {
        neu.haende[p] = stapel.slice(p * 8, p * 8 + 8);
        neu.start[p] = neu.haende[p].slice();
      }
      neu.amZug = (neu.geber + 1) % 4;
      neu.aktuell = { start: neu.amZug, karten: [] };
      stand = neu;
      sichern();
      zeichnen();
      ansageWeiter();
    }

    /* ------------------------------------------------------------- Ansage

       Einmal reihum ab der Vorhand: Jeder sagt an oder sagt weiter, und wer
       ansagt, sagt gleich was. Die höhere Spielart sticht die tiefere; stehen
       zwei auf derselben Stufe – Wenz und Geier –, bleibt es beim Früheren,
       also beim Näheren an der Vorhand. Deshalb reicht die eine Runde. */

    const bestesGebot = () => stand.gebote.reduce(
      (b, g) => (g.spiel && (!b || K.spielStufe(g.spiel) > K.spielStufe(b.spiel)) ? g : b), null);

    function ansageWeiter() {
      if (stand.phase !== 'ansage') return;
      if (stand.zeiger >= 4) { ansageFertig(); return; }
      const p = (vorhand() + stand.zeiger) % 4;
      if (p === ICH) { zeichnen(); return; }        // wartet auf deinen Knopf
      denkt = true;
      zeichnen();
      spaeter(() => {
        const rat = K.ansageRat(stand.haende[p], stand.zeiger, { proben: 60 });
        const oben = bestesGebot();
        const nimmt = rat.wahl
          && (!oben || K.spielStufe(rat.wahl.spiel) > K.spielStufe(oben.spiel));
        stand.gebote.push({ p, spiel: nimmt ? rat.wahl.spiel : null });
        stand.zeiger += 1;
        denkt = false;
        sichern();
        zeichnen();
        ansageWeiter();
      }, DENKZEIT);
    }

    function ansagen(spiel) {
      stand.gebote.push({ p: ICH, spiel });
      stand.zeiger += 1;
      sichern();
      zeichnen();
      ansageWeiter();
    }

    function ansageFertig() {
      const oben = bestesGebot();
      if (!oben) {
        stand.phase = 'weiter';
        sichern();
        zeichnen();
        spaeter(geben, 1700);
        return;
      }
      stand.spielart = oben.spiel;
      stand.spieler = oben.p;
      stand.partner = -1;
      if (oben.spiel.art === 'sau') {
        const sau = sauKarteVon(oben.spiel);
        for (let p = 0; p < 4; p += 1) if (stand.haende[p].indexOf(sau) >= 0) stand.partner = p;
      }
      stand.phase = 'spiel';
      stand.amZug = vorhand();
      stand.aktuell = { start: stand.amZug, karten: [] };
      sichern();
      zeichnen();
      zugWeiter();
    }

    /* ---------------------------------------------------------------- Zug */

    function zugWeiter() {
      if (stand.phase !== 'spiel') return;
      if (stand.stichFertig) { spaeter(stichAbraeumen, STICHZEIT); return; }
      if (stand.amZug === ICH) {
        tipp = null;
        // Beim Mitlesen wird schon gerechnet, während du noch überlegst –
        // dann steht das Urteil sofort, wenn du legst.
        if (stand.lehre === 'mit') {
          vorabRat = null;
          vorabFuer = stand.stiche.length * 4 + stand.aktuell.karten.length;
          const merker = vorabFuer;
          spaeter(() => {
            if (stand.phase !== 'spiel' || stand.amZug !== ICH) return;
            if (stand.stiche.length * 4 + stand.aktuell.karten.length !== merker) return;
            vorabRat = K.bewerten(K.sichtVon(zustand(), ICH), { proben: 240, frist: 300 });
          }, 30);
        }
        zeichnen();
        return;
      }
      denkt = true;
      zeichnen();
      spaeter(() => {
        const p = stand.amZug;
        const karte = K.besteKarte(K.sichtVon(zustand(), p), { proben: 200, frist: 240 });
        denkt = false;
        legen(karte);
      }, DENKZEIT);
    }

    function legen(karte) {
      const p = stand.amZug;
      const hand = stand.haende[p];
      const i = hand.indexOf(karte);
      if (i < 0) return;
      hand.splice(i, 1);

      /* Davonlaufen: der Ruf-Partner spielt seine Farbe an, ohne die Sau zu
         legen. Danach ist sie frei – und alle wissen, wer er ist. */
      if (stand.spielart.art === 'sau' && !stand.sauWeg && !stand.aktuell.karten.length
          && !ord().trumpf[karte] && K.farbe(karte) === stand.spielart.farbe
          && karte !== sauKarte() && hand.indexOf(sauKarte()) >= 0) {
        stand.davon = true;
      }
      if (karte === sauKarte()) stand.sauWeg = true;

      stand.aktuell.karten.push(karte);
      if (stand.aktuell.karten.length === 4) stand.stichFertig = true;
      else stand.amZug = (p + 1) % 4;
      sichern();
      zeichnen();
      zugWeiter();
    }

    function stichAbraeumen() {
      const st = stand.aktuell;
      const platz = K.stichPlatz(st.karten, ord());
      const sieger = (st.start + platz) % 4;
      stand.stiche.push({ start: st.start, karten: st.karten.slice(), sieger });
      stand.aktuell = { start: sieger, karten: [] };
      stand.stichFertig = false;
      stand.amZug = sieger;
      sichern();
      if (stand.stiche.length === 8) { abschluss(); return; }
      zeichnen();
      zugWeiter();
    }

    /* Deine Karte – erst prüfen, dann urteilen, dann legen. */
    function deineKarte(karte) {
      if (stand.phase !== 'spiel' || stand.amZug !== ICH || denkt || stand.stichFertig) return;
      const erlaubt = erlaubteJetzt(ICH);
      if (erlaubt.indexOf(karte) < 0) { warumNicht(karte, erlaubt); return; }
      if (stand.lehre === 'mit') urteilen(karte, erlaubt);
      else stand.notiz = null;
      tipp = null;
      legen(karte);
    }

    /* ------------------------------------------------------------ Hinweise */

    function rechnen(frist) {
      return K.bewerten(K.sichtVon(zustand(), ICH), { proben: 300, frist: frist || 380 });
    }

    function tippGeben() {
      if (stand.phase === 'ansage' && (vorhand() + stand.zeiger) % 4 === ICH) {
        ansageTipp();
        return;
      }
      if (stand.phase !== 'spiel' || stand.amZug !== ICH || stand.stichFertig) {
        s.toast('Gerade bist du nicht dran.');
        return;
      }
      const rat = vorabRat || rechnen();
      const beste = rat.werte[0];
      stand.hilfen += 1;
      tipp = {
        karte: beste.karte,
        text: rat.einzig
          ? 'Du hast gar keine Wahl – nur diese eine Karte ist erlaubt.'
          : K.begruenden(K.sichtVon(zustand(), ICH), beste.karte, meineSeite()),
        zahl: rat.einzig ? '' : zahlSatz(rat, beste),
      };
      sichern();
      zeichnen();
    }

    const prozentText = (q) => Math.round(q * 100) + ' %';

    function zahlSatz(rat, e) {
      const zweite = rat.werte[1];
      const abstand = zweite ? e.quote - zweite.quote : 0;
      return 'In ' + rat.welten + ' durchgerechneten Verteilungen reicht es damit '
        + prozentText(e.quote) + ' der Fälle'
        + (zweite && abstand > 0.005
          ? ' – mit ' + K.kartenName(zweite.karte) + ' nur ' + prozentText(zweite.quote) + '.'
          : '.');
    }

    /* Das Urteil nach deinem Zug. Es kommt aus derselben Rechnung wie der
       Tipp, nur wird sie hier still im Voraus gemacht. Ein knapper Unterschied
       ist keiner: unter drei Punkten Quotenabstand liegen zwei Karten
       innerhalb dessen, was das Würfeln selbst schwankt. */
    function urteilen(karte, erlaubt) {
      stand.notiz = null;
      if (erlaubt.length < 2) return;
      const rat = vorabRat && vorabFuer === stand.stiche.length * 4 + stand.aktuell.karten.length
        ? vorabRat : rechnen(260);
      const beste = rat.werte[0];
      const meine = rat.werte.find((e) => e.karte === karte);
      if (!meine) return;
      stand.gezaehlt += 1;
      const abstand = beste.quote - meine.quote;
      if (abstand <= 0.03) {
        stand.treffer += 1;
        stand.notiz = {
          art: 'gut',
          titel: karte === beste.karte ? 'Genau die.' : 'Geht auch.',
          text: K.begruenden(K.sichtVon(zustand(), ICH), karte, meineSeite()),
        };
        return;
      }
      stand.notiz = {
        art: 'schlecht',
        titel: 'Besser: ' + K.kartenName(beste.karte),
        text: K.begruenden(K.sichtVon(zustand(), ICH), beste.karte, meineSeite())
          + ' Deine Karte reicht in ' + prozentText(meine.quote) + ' der Verteilungen, jene in '
          + prozentText(beste.quote) + '.',
      };
    }

    function warumNicht(karte, erlaubt) {
      const o = ord();
      const st = stand.aktuell.karten;
      let text;
      if (!st.length) {
        text = 'Die Rufsau darfst du nicht anspielen – außer du legst sie selbst. '
          + 'Mit vier Karten dieser Farbe dürftest du davonlaufen, aber so viele hast du nicht.';
      } else if (o.reihe(st[0]) === 4) {
        text = 'Trumpf ist angespielt, und du hast noch Trumpf – den musst du zugeben.';
      } else if (erlaubt.length === 1 && erlaubt[0] === sauKarte()) {
        text = 'Deine Farbe ist gesucht: die Rufsau muss fallen.';
      } else {
        text = K.FARBEN[o.reihe(st[0])] + ' ist angespielt, und du hast noch '
          + K.FARBEN[o.reihe(st[0])] + ' – Farbe muss bedient werden.';
      }
      s.blatt({ titel: 'Die geht nicht', inhalt: text, aktionen: [{ text: 'Verstanden' }] });
    }

    function ansageTipp() {
      stand.hilfen += 1;
      const rat = K.ansageRat(stand.haende[ICH], stand.zeiger, { proben: 120 });
      const d = el('div');
      if (!rat.liste.length) {
        d.append(el('p', 'notiz', 'Mit diesem Blatt ist nichts anzufangen – zu wenig Trumpf, '
          + 'zu wenig Ober. Weiter sagen und schauen, was die anderen wollen.'));
      } else {
        d.append(el('p', 'notiz', 'So oft reicht dein Blatt für 61 Augen, wenn der Rest '
          + 'zufällig verteilt ist. Der Rechner spielt jedes Spiel dafür sechzigmal probeweise durch.'));
        const liste = el('div', 'sk-ratliste');
        for (const e of rat.liste.slice(0, 4)) {
          const z = el('div', 'sk-ratzeile');
          z.append(el('span', 'sk-ratname', K.spielName(e.spiel)));
          z.append(el('span', 'sk-ratzahl', prozentText(e.quote)));
          if (e.reicht) z.dataset.gut = 'ja';
          liste.append(z);
        }
        d.append(liste);
        d.append(el('p', 'notiz', rat.wahl
          ? 'Der Rechner würde ' + K.spielName(rat.wahl.spiel) + ' ansagen.'
          : 'Der Rechner würde weiter sagen. Ein Sauspiel braucht die Hälfte, '
            + 'ein Alleinspiel deutlich mehr – dort steht das Fünfzehnfache auf dem Spiel.'));
      }
      sichern();
      s.blatt({ titel: 'Was geht mit dem Blatt?', inhalt: d, aktionen: [{ text: 'Danke' }] });
    }

    function hinweiseWaehlen() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Der Hinweisgeber rechnet aus deiner Sicht – er sieht dein '
        + 'Blatt und was liegt, aber nicht die Karten der anderen. Er kann sich also irren. '
        + 'Alles andere wäre Betrug, und von einem, der schummelt, lernt man nichts.'));
      const wahl = [
        ['aus', 'Aus', 'Nur die Regeln. Unerlaubte Karten bleiben trotzdem gesperrt.'],
        ['tipp', 'Tipp auf Anfrage', 'Ein Knopf zeigt die Karte und sagt, warum sie es ist.'],
        ['mit', 'Mitlesen', 'Nach jeder deiner Karten ein Urteil, am Ende die Bilanz.'],
      ];
      const liste = el('div', 'sheet-liste');
      for (const [id, titel, unter] of wahl) {
        const b = el('button', 'zeile');
        b.type = 'button';
        if (stand.lehre === id) b.dataset.gewaehlt = 'ja';
        const t = el('span', 'zeile-text');
        t.append(el('span', 'zeile-titel', titel));
        t.append(el('span', 'zeile-unter', unter));
        b.append(t);
        b.addEventListener('click', () => {
          stand.lehre = id;
          if (id === 'aus') stand.notiz = null;
          sichern();
          s.blattZu();
          zeichnen();
          if (id === 'mit' && stand.phase === 'spiel' && stand.amZug === ICH) zugWeiter();
        });
        liste.append(b);
      }
      d.append(liste);
      s.blatt({ titel: 'Hinweise', inhalt: d, aktionen: [{ text: 'Fertig', art: 'still' }] });
    }

    /* ----------------------------------------------------------- Abschluss */

    function abschluss() {
      const seite = [0, 0, 0, 0];
      seite[stand.spieler] = 1;
      if (stand.partner >= 0) seite[stand.partner] = 1;
      const ab = K.abrechnen(stand.spielart, seite, stand.stiche, stand.start);
      stand.abrechnung = ab;
      stand.phase = 'ende';
      stand.gaben += 1;
      for (let p = 0; p < 4; p += 1) stand.konto[p] += ab.konto[p];

      const meins = seite[ICH] === 1;
      s.notieren({
        gewonnen: meins ? ab.gewonnen : !ab.gewonnen,
        dauer: Date.now() - stand.begonnen,
        spielart: stand.spielart.art,
        alsSpieler: stand.spieler === ICH,
        augen: meins ? ab.augenSpieler : ab.augenGegner,
        punkte: ab.konto[ICH],
        hilfen: stand.hilfen,
        treffer: stand.treffer,
        gezaehlt: stand.gezaehlt,
      });
      sichern();
      zeichnen();
    }

    /* ------------------------------------------------------------ Zeichnen */

    function karteBauen(k, klasse) {
      const b = el('button', 'sk-karte ' + (klasse || ''));
      b.type = 'button';
      b.dataset.farbe = String(K.farbe(k));
      b.setAttribute('aria-label', K.kartenName(k));
      const bild = el('span', 'sk-zeichen');
      bild.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
        + ZEICHEN[K.farbe(k)] + '</svg>';
      b.append(bild);
      b.append(el('span', 'sk-wert', K.KURZ[K.wert(k)]));
      b.append(el('span', 'sk-wert sk-wert--unten', K.KURZ[K.wert(k)]));
      return b;
    }

    function zeichnen() {
      tisch.dataset.phase = stand.phase;
      kopfZeichnen();
      tischZeichnen();
      handZeichnen();
      ansageZeichnen();
      notizZeichnen();
      endeZeichnen();
      tippKnopf.hidden = stand.lehre === 'aus' || stand.phase === 'ende' || stand.phase === 'weiter';
      tippKnopf.disabled = denkt || stand.stichFertig
        || !(stand.phase === 'spiel' ? stand.amZug === ICH
          : stand.phase === 'ansage' && (vorhand() + stand.zeiger) % 4 === ICH);
      tippKnopf.textContent = stand.phase === 'ansage' ? 'Was geht?' : 'Tipp';
      leiste.hidden = tippKnopf.hidden;
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      if (stand.phase === 'ansage' || stand.phase === 'weiter') {
        kopf.append(el('span', null, 'Gabe ' + (stand.gaben + 1)));
        kopf.append(el('b', null, stand.phase === 'weiter' ? 'zusammengeworfen' : 'wer spielt?'));
        kopf.append(el('span', null, kontoText()));
        s.unter(stand.phase === 'weiter'
          ? 'Keiner mag – neu geben.'
          : 'Vorhand ist ' + NAMEN[vorhand()] + '.');
        return;
      }
      kopf.append(el('span', null, K.spielKurz(stand.spielart)));
      const mitte = el('b', null, augenText());
      kopf.append(mitte);
      kopf.append(el('span', null, 'Stich ' + Math.min(stand.stiche.length + 1, 8) + '/8'));

      if (stand.phase === 'ende') { s.unter(''); return; }
      s.unter(denkt ? NAMEN[stand.amZug] + ' überlegt …'
        : stand.amZug === ICH ? 'Du bist dran.'
          : NAMEN[stand.amZug] + ' ist dran.');
    }

    /* Was du an Augen beisammen hast. Solange beim Sauspiel die Sau nicht
       gefallen ist, zählt nur, was du selbst gemacht hast – wer dein Partner
       ist, weißt du ja noch nicht. */
    function augenText() {
      let augen = 0;
      for (const st of stand.stiche) {
        const meins = st.sieger === ICH
          || (partnerBekannt() && stand.spielart.art === 'sau'
            && ((stand.partner === ICH && st.sieger === stand.spieler)
              || (stand.spieler === ICH && st.sieger === stand.partner)))
          || (stand.spielart.art !== 'sau' && stand.spieler !== ICH
            && st.sieger !== stand.spieler);
        if (meins) augen += K.augenSumme(st.karten);
      }
      return augen + (partnerBekannt() ? ' Augen' : ' Augen bei dir');
    }

    const kontoText = () => (stand.konto[ICH] > 0 ? '+' : '') + stand.konto[ICH];

    function tischZeichnen() {
      for (const i of [1, 2, 3]) {
        const m = mitspieler[i];
        m.dataset.dran = stand.phase === 'spiel' && stand.amZug === i && !stand.stichFertig ? 'ja' : 'nein';
        m.querySelector('.sk-rolle').textContent = rolleVon(i);
        const ruecken = m.querySelector('.sk-ruecken');
        ruecken.replaceChildren();
        for (let n = 0; n < stand.haende[i].length; n += 1) ruecken.append(el('span', 'sk-rueck'));
      }
      stichKasten.replaceChildren();
      const st = stand.aktuell;
      for (let i = 0; i < st.karten.length; i += 1) {
        const p = (st.start + i) % 4;
        const k = karteBauen(st.karten[i], 'sk-karte--tisch');
        k.disabled = true;
        k.dataset.platz = PLATZ[p];
        if (stand.stichFertig) {
          const sieger = (st.start + K.stichPlatz(st.karten, ord())) % 4;
          if (p === sieger) k.dataset.sticht = 'ja';
        }
        stichKasten.append(k);
      }
      if (!st.karten.length && stand.phase === 'spiel') {
        stichKasten.append(el('span', 'sk-leer', NAMEN[stand.amZug] + ' spielt aus'));
      }
    }

    function rolleVon(p) {
      if (stand.phase === 'ansage') {
        const g = stand.gebote.find((x) => x.p === p);
        if (!g) return '';
        return g.spiel ? K.spielKurz(g.spiel) : 'weiter';
      }
      if (stand.phase !== 'spiel' && stand.phase !== 'ende') return '';
      if (p === stand.spieler) return 'spielt';
      if (stand.spielart.art === 'sau' && p === stand.partner
          && (partnerBekannt() || stand.phase === 'ende')) return 'Partner';
      return '';
    }

    function handZeichnen() {
      handKasten.replaceChildren();
      const hand = K.sortieren(stand.haende[ICH], stand.spielart || { art: 'sau', farbe: 0 });
      const erlaubt = stand.phase === 'spiel' && stand.amZug === ICH && !stand.stichFertig
        ? erlaubteJetzt(ICH) : null;
      handKasten.dataset.eng = hand.length > 6 ? 'ja' : 'nein';
      for (const k of hand) {
        const b = karteBauen(k, 'sk-karte--hand');
        if (erlaubt && erlaubt.indexOf(k) < 0) b.dataset.gesperrt = 'ja';
        if (tipp && tipp.karte === k) b.dataset.tipp = 'ja';
        b.addEventListener('click', () => deineKarte(k));
        if (!erlaubt) b.disabled = stand.phase !== 'spiel';
        handKasten.append(b);
      }
      handKasten.hidden = !hand.length;
    }

    function ansageZeichnen() {
      ansageKasten.replaceChildren();
      const dran = stand.phase === 'ansage' && (vorhand() + stand.zeiger) % 4 === ICH;
      ansageKasten.hidden = !dran;
      if (!dran) return;

      const oben = bestesGebot();
      ansageKasten.append(el('p', 'sk-frage', oben
        ? NAMEN[oben.p] + ' will ' + K.spielName(oben.spiel) + ' spielen. Hältst du dagegen?'
        : 'Magst du spielen?'));

      const moeglich = K.moeglicheSpiele(stand.haende[ICH])
        .filter((sp) => !oben || K.spielStufe(sp) > K.spielStufe(oben.spiel));

      const gruppe = (titel, liste) => {
        if (!liste.length) return;
        const g = el('div', 'sk-gruppe');
        g.append(el('span', 'sk-gruppe-titel', titel));
        const reihe = el('div', 'sk-knopfreihe');
        for (const sp of liste) {
          const b = el('button', 'knopf knopf--still sk-ansageknopf',
            sp.art === 'sau' ? K.SAUNAME[sp.farbe] : K.spielName(sp));
          b.type = 'button';
          b.addEventListener('click', () => ansagen(sp));
          reihe.append(b);
        }
        g.append(reihe);
        ansageKasten.append(g);
      };
      gruppe('Sauspiel auf …', moeglich.filter((sp) => sp.art === 'sau'));
      gruppe('Allein', moeglich.filter((sp) => sp.art === 'wenz' || sp.art === 'geier'));
      gruppe('Solo', moeglich.filter((sp) => sp.art === 'solo'));

      const weiter = el('button', 'knopf knopf--voll sk-weiter', 'Weiter');
      weiter.type = 'button';
      weiter.addEventListener('click', () => ansagen(null));
      ansageKasten.append(weiter);
    }

    function notizZeichnen() {
      notizKasten.replaceChildren();
      if (tipp) {
        notizKasten.dataset.art = 'tipp';
        notizKasten.append(el('p', 'sk-notiz-titel', K.kartenName(tipp.karte)));
        notizKasten.append(el('p', 'sk-notiz-text', tipp.text));
        if (tipp.zahl) notizKasten.append(el('p', 'sk-notiz-zahl', tipp.zahl));
        notizKasten.hidden = false;
        return;
      }
      if (stand.notiz && stand.lehre === 'mit' && stand.phase !== 'ende') {
        notizKasten.dataset.art = stand.notiz.art;
        notizKasten.append(el('p', 'sk-notiz-titel', stand.notiz.titel));
        notizKasten.append(el('p', 'sk-notiz-text', stand.notiz.text));
        notizKasten.hidden = false;
        return;
      }
      notizKasten.hidden = true;
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = stand.phase !== 'ende';
      if (stand.phase !== 'ende') return;
      const ab = stand.abrechnung;
      const meins = stand.spieler === ICH || stand.partner === ICH;
      const gewonnen = meins ? ab.gewonnen : !ab.gewonnen;

      endeKasten.append(el('p', 'ende-titel', gewonnen ? 'Gewonnen.' : 'Verloren.'));
      endeKasten.append(el('p', 'notiz',
        K.spielName(stand.spielart) + ', ' + NAMEN[stand.spieler] + ' spielt'
        + (stand.partner >= 0 ? ' mit ' + NAMEN[stand.partner] : '') + '. '
        + ab.augenSpieler + ' zu ' + ab.augenGegner + ' Augen.'));

      const zeilen = [];
      zeilen.push(['Grundwert', String(K.GRUNDWERT[stand.spielart.art])]);
      if (ab.schneider) zeilen.push(['Schneider', '+10']);
      if (ab.schwarz) zeilen.push(['Schwarz', '+10']);
      if (ab.laufende) {
        zeilen.push([ab.laufende + ' Laufende, ' + (ab.laufendeMit ? 'mit' : 'ohne'),
          '+' + ab.laufende * 10]);
      } else if (ab.laufendeRoh > 1) {
        zeilen.push([ab.laufendeRoh + ' Laufende – zählen erst ab '
          + K.LAUF_AB[stand.spielart.art], '0']);
      }
      zeilen.push(['Für dich', (ab.konto[ICH] > 0 ? '+' : '') + ab.konto[ICH]]);
      const tafel = el('div', 'sk-rechnung');
      for (const [wort, zahl] of zeilen) {
        const z = el('div', 'sk-rechnung-zeile');
        z.append(el('span', null, wort));
        z.append(el('span', 'sk-rechnung-zahl', zahl));
        tafel.append(z);
      }
      endeKasten.append(tafel);

      if (stand.lehre === 'mit' && stand.gezaehlt) {
        endeKasten.append(el('p', 'notiz', 'Bei ' + stand.treffer + ' von ' + stand.gezaehlt
          + ' Karten, bei denen du wirklich die Wahl hattest, lagst du auf der besten – '
          + 'oder so nah dran, dass es keinen Unterschied macht.'));
      }
      endeKasten.append(el('p', 'notiz notiz--klein',
        'Stand über ' + stand.gaben + (stand.gaben === 1 ? ' Gabe: ' : ' Gaben: ')
        + NAMEN.map((n, p) => n + ' ' + (stand.konto[p] > 0 ? '+' : '') + stand.konto[p]).join(' · ')));

      const l = el('div', 'leiste');
      const noch = el('button', 'knopf knopf--voll', 'Nächste Gabe');
      noch.type = 'button';
      noch.addEventListener('click', geben);
      const schauen = el('button', 'knopf knopf--still', 'Stiche ansehen');
      schauen.type = 'button';
      schauen.addEventListener('click', sticheZeigen);
      l.append(noch, schauen);
      endeKasten.append(l);
    }

    function sticheZeigen() {
      const d = el('div', 'sk-rueckblick');
      for (let i = 0; i < stand.stiche.length; i += 1) {
        const st = stand.stiche[i];
        const z = el('div', 'sk-rueck-zeile');
        z.append(el('span', 'sk-rueck-nr', String(i + 1)));
        const karten = el('div', 'sk-rueck-karten');
        for (let j = 0; j < 4; j += 1) {
          const k = karteBauen(st.karten[j], 'sk-karte--mini');
          k.disabled = true;
          if ((st.start + j) % 4 === st.sieger) k.dataset.sticht = 'ja';
          karten.append(k);
        }
        z.append(karten);
        z.append(el('span', 'sk-rueck-wer',
          NAMEN[st.sieger] + ' · ' + K.augenSumme(st.karten)));
        d.append(z);
      }
      s.blatt({ titel: 'Die acht Stiche', inhalt: d, aktionen: [{ text: 'Zu' }] });
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neu geben',
        inhalt: 'Die laufende Gabe wird weggelegt und nicht gewertet. Der Stand über '
          + 'den Abend bleibt stehen.',
        aktionen: [
          { text: 'Neu geben', tun: () => { uhrenAus(); geben(); } },
          { text: 'Weiterspielen', art: 'still' },
        ],
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Vier Leute, 32 Karten, jeder acht. Wer über die Runde 61 der '
        + '120 Augen holt, gewinnt: Sau 11, Zehner 10, König 4, Ober 3, Unter 2, der Rest nichts.'));
      d.append(el('p', 'notiz', 'Gespielt wird reihum im Uhrzeigersinn. Die angespielte Farbe '
        + 'muss bedient werden; wer sie nicht hat, darf stechen oder abwerfen. Der höchste '
        + 'Trumpf holt den Stich, ohne Trumpf die höchste Karte der angespielten Farbe.'));
      d.append(el('p', 'notiz', 'Trumpf sind beim Sauspiel und beim Solo alle acht Ober und '
        + 'Unter und dazu die ganze Trumpffarbe – beim Sauspiel Herz. Die Reihenfolge unter '
        + 'den Obern und Untern: Eichel, Gras, Herz, Schellen. Der Eichel-Ober ist die höchste '
        + 'Karte im Spiel. Beim Wenz sind nur die vier Unter Trumpf, beim Geier nur die vier Ober; '
        + 'in beiden Fällen laufen Ober und Unter sonst als gewöhnliche Farbkarten mit.'));
      d.append(el('p', 'notiz', 'Beim Sauspiel ruft der Spieler eine Sau, die er nicht hat – '
        + 'Eichel, Gras oder Schellen, und von der Farbe muss er selbst noch eine Karte halten. '
        + 'Wer die gerufene Sau hat, ist sein Partner und sagt nichts. Man merkt es erst, wenn '
        + 'sie fällt. Drei Regeln hängen daran: Wird die Farbe angespielt, muss die Sau fallen. '
        + 'Der Partner darf die Farbe nur anspielen, indem er die Sau legt – außer er hat vier '
        + 'davon, dann darf er davonlaufen. Und abwerfen darf er sie nie.'));
      d.append(el('p', 'notiz', 'Vor dem Spiel sagt jeder reihum an oder sagt weiter. Ein Solo '
        + 'sticht Wenz und Geier, die stechen das Sauspiel; bei gleichem Rang zählt, wer näher '
        + 'an der Vorhand sitzt. Mag keiner, wird neu gegeben.'));
      d.append(el('p', 'notiz', 'Abgerechnet wird mit dem üblichen Tarif: Sauspiel 10, '
        + 'Alleinspiel 50. Dazu 10 für Schneider – die Verliererpartei bleibt unter 31 Augen –, '
        + '10 für Schwarz, also gar kein Stich, und 10 je Laufendem. Laufende sind die obersten '
        + 'Trümpfe in ununterbrochener Reihe in einer Hand oder Partei; sie zählen ab drei, beim '
        + 'Wenz und Geier ab zwei. Der Alleinspieler bekommt oder zahlt das Ganze dreifach.'));
      d.append(el('p', 'notiz', 'Die drei Gegenspieler rechnen: aus dem, was sie sehen dürfen, '
        + 'würfeln sie zweihundert mögliche Verteilungen der fremden Karten, spielen jede zu '
        + 'Ende und nehmen die Karte, die am häufigsten reicht. Liegen nur noch wenige Karten, '
        + 'wird nicht mehr geschätzt, sondern exakt durchgerechnet. In die Karten schauen sie '
        + 'dir dabei nicht – so wenig wie der Hinweisgeber.'));
      s.blatt({ titel: 'Schafkopf', inhalt: d, aktionen: [{ text: 'Passt' }] });
    }

    /* --------------------------------------------------------------- Start */

    if (!stand.haende[0].length && !stand.haende[1].length) {
      geben();
    } else {
      zeichnen();
      if (stand.phase === 'ansage') ansageWeiter();
      else if (stand.phase === 'spiel') zugWeiter();
      else if (stand.phase === 'weiter') spaeter(geben, 1200);
    }

    return { ende: () => { uhrenAus(); sichern(); } };
  }

  /* ------------------------------------------------------------- Statistik */

  function auswertung(partien, hilfe) {
    const raus = [];
    const punkte = partien.reduce((s, p) => s + (typeof p.punkte === 'number' ? p.punkte : 0), 0);
    raus.push({ wert: (punkte > 0 ? '+' : '') + punkte, label: 'Punkte gesamt' });

    const selbst = partien.filter((p) => p.alsSpieler);
    if (selbst.length) {
      raus.push({
        wert: selbst.filter((p) => p.gewonnen).length + '/' + selbst.length,
        label: 'Siege als Spieler',
      });
    }
    const allein = partien.filter((p) => p.alsSpieler && p.spielart && p.spielart !== 'sau');
    if (allein.length) {
      raus.push({
        wert: allein.filter((p) => p.gewonnen).length + '/' + allein.length,
        label: 'Siege im Alleinspiel',
      });
    }
    const augen = partien.filter((p) => typeof p.augen === 'number').map((p) => p.augen);
    if (augen.length) {
      raus.push({
        wert: Math.round(augen.reduce((s, a) => s + a, 0) / augen.length) + '',
        label: 'Augen im Schnitt',
      });
    }
    /* Wie oft lag die eigene Karte auf der besten? Nur aus Partien, in denen
       das Mitlesen anlag – sonst wurde nichts gezählt. */
    const gemessen = partien.filter((p) => p.gezaehlt > 0);
    if (gemessen.length) {
      const t = gemessen.reduce((s, p) => s + p.treffer, 0);
      const g = gemessen.reduce((s, p) => s + p.gezaehlt, 0);
      raus.push({ wert: hilfe.prozent(t, g), label: 'beste Karte' });
    }
    return raus;
  }

  Rahmen.anmelden({
    id: 'schafkopf',
    name: 'Schafkopf',
    unter: 'Bayrisch, zu viert, mit Lehrer.',
    farbe: '#8C5A2E',
    symbol: '<path d="M6.5 8.5c0-2 2.5-3.5 5.5-3.5s5.5 1.5 5.5 3.5z"/>'
      + '<path d="M7 8.5h10c0 5.7-2 9.8-5 9.8s-5-4.1-5-9.8z"/>',
    starten,
    auswertung,
  });
})();
