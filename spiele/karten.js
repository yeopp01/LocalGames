/* Karten – Regeln und Rechner für das bayrische Schafkopfblatt.

   Kein Spiel, sondern Werkzeug: so wie loeser.js hinter Wördle steht, steht
   diese Datei hinter Schafkopf. Sie kennt keine Oberfläche, nur 32 Karten,
   die Regeln darauf und einen Rechner, der aus einer Lage einen Zug macht.

   Eine Karte ist eine Zahl 0…31:  farbe * 8 + wert.
   Farbe  0 Eichel, 1 Gras, 2 Herz, 3 Schellen.
   Wert   0 Sau, 1 Zehner, 2 König, 3 Ober, 4 Unter, 5 Neuner, 6 Achter,
          7 Siebener – also von oben nach unten. Das ist kein Zufall: unter
          den Nicht-Trümpfen gilt genau diese Reihenfolge weiter, der Rang
          einer Farbkarte ist damit schlicht 7 minus ihr Wert.

   Der Rechner spielt mit unvollständigem Wissen, so wie ein Mensch auch: er
   sieht seine Karten und alles, was schon liegt, und rät den Rest. Aus dieser
   Sicht würfelt er sich mögliche Verteilungen zusammen („Welten"), spielt
   jede zu Ende und nimmt die Karte, die im Schnitt am besten abschneidet.
   Wer nur eine Verteilung durchrechnet, spielt gegen eine Wahrheit, die es
   nicht gibt – und schaut nebenbei in fremde Karten.
*/

const Karten = (() => {
  /* ---------------------------------------------------------------- Blatt */

  const FARBEN = ['Eichel', 'Gras', 'Herz', 'Schellen'];
  const WERTE = ['Sau', 'Zehner', 'König', 'Ober', 'Unter', 'Neuner', 'Achter', 'Siebener'];
  const KURZ = ['A', '10', 'K', 'O', 'U', '9', '8', '7'];
  const AUGEN = [11, 10, 4, 3, 2, 0, 0, 0];
  /* Wie die Sauen am Tisch heißen. Herz steht nur der Vollständigkeit halber
     dabei – auf die Herz-Sau lässt sich nicht rufen, sie ist Trumpf. */
  const SAUNAME = ['die Alte', 'die Blaue', 'die Herz-Sau', 'die Bumpel'];

  const farbe = (k) => k >> 3;
  const wert = (k) => k & 7;
  const augen = (k) => AUGEN[k & 7];
  const karte = (f, w) => f * 8 + w;
  const kartenName = (k) => FARBEN[k >> 3] + '-' + WERTE[k & 7];
  const kartenKurz = (k) => FARBEN[k >> 3].slice(0, 1) + KURZ[k & 7];
  const ALLE = Array.from({ length: 32 }, (_, i) => i);
  const augenSumme = (liste) => liste.reduce((s, k) => s + AUGEN[k & 7], 0);

  /* ------------------------------------------------------------- Ordnung */

  /* Was Trumpf ist und wie hoch, hängt allein an der Spielart:

        Sauspiel/Solo  alle Ober, alle Unter, dann die Trumpffarbe   (14)
        Wenz           nur die vier Unter                             (4)
        Geier          nur die vier Ober                              (4)

     Innerhalb der Ober und Unter gilt die Farbreihenfolge Eichel, Gras, Herz,
     Schellen – der Eichel-Ober ist die höchste Karte im Spiel. */
  function trumpfListe(sp) {
    if (sp.art === 'wenz') return [0, 1, 2, 3].map((f) => karte(f, 4));
    if (sp.art === 'geier') return [0, 1, 2, 3].map((f) => karte(f, 3));
    const t = sp.art === 'solo' ? sp.farbe : 2;     // Sauspiel: immer Herz
    return [
      ...[0, 1, 2, 3].map((f) => karte(f, 3)),
      ...[0, 1, 2, 3].map((f) => karte(f, 4)),
      ...[0, 1, 2, 5, 6, 7].map((w) => karte(t, w)),
    ];
  }

  const ordnungen = new Map();

  /* Die Ordnung ist für eine Spielart immer dieselbe – einmal rechnen reicht.
     rang vergleicht nur innerhalb derselben Reihe; reihe(k) ist 4 für Trumpf
     und sonst die Farbe. Damit ist der ganze Farbzwang ein Zahlenvergleich. */
  function ordnung(sp) {
    const schluessel = sp.art + ':' + (sp.farbe == null ? '' : sp.farbe);
    if (ordnungen.has(schluessel)) return ordnungen.get(schluessel);
    const trumpf = new Uint8Array(32);
    const rang = new Int16Array(32);
    const liste = trumpfListe(sp);
    liste.forEach((k, i) => { trumpf[k] = 1; rang[k] = 100 + (liste.length - i); });
    for (const k of ALLE) if (!trumpf[k]) rang[k] = 7 - (k & 7);
    const ord = { trumpf, rang, liste, reihe: (k) => (trumpf[k] ? 4 : k >> 3) };
    ordnungen.set(schluessel, ord);
    return ord;
  }

  const spielName = (sp) => (
    sp.art === 'sau' ? 'Sauspiel auf ' + SAUNAME[sp.farbe]
      : sp.art === 'wenz' ? 'Wenz'
        : sp.art === 'geier' ? 'Geier'
          : FARBEN[sp.farbe] + '-Solo');

  const spielKurz = (sp) => (
    sp.art === 'sau' ? FARBEN[sp.farbe] + '-Sau'
      : sp.art === 'wenz' ? 'Wenz'
        : sp.art === 'geier' ? 'Geier'
          : FARBEN[sp.farbe] + '-Solo');

  /* Höher gewinnt die Ansage. Wenz und Geier stehen auf derselben Stufe –
     dann entscheidet, wer näher an der Vorhand sitzt. */
  const spielStufe = (sp) => (sp.art === 'sau' ? 1 : sp.art === 'solo' ? 3 : 2);

  /* Karten so sortieren, wie man sie in die Hand nimmt: Trumpf von oben nach
     unten, dann die Farben. */
  function sortieren(hand, sp) {
    const ord = ordnung(sp);
    return hand.slice().sort((a, b) => {
      const ra = ord.reihe(a);
      const rb = ord.reihe(b);
      if (ra !== rb) return (rb === 4 ? 1 : 0) - (ra === 4 ? 1 : 0) || ra - rb;
      return ord.rang[b] - ord.rang[a];
    });
  }

  /* Sticht a die Karte b, wenn ang angespielt wurde? */
  function schlaegt(a, b, ang, ord) {
    const ra = ord.reihe(a);
    const rb = ord.reihe(b);
    if (ra === rb) return ord.rang[a] > ord.rang[b];
    return ra === 4;                       // Trumpf sticht alles andere
  }

  /* Welcher Platz im Stich gewinnt? Gibt den Zeiger in die Kartenliste. */
  function stichPlatz(karten, ord) {
    const ang = ord.reihe(karten[0]);
    let best = 0;
    for (let i = 1; i < karten.length; i += 1) {
      if (schlaegt(karten[i], karten[best], ang, ord)) best = i;
    }
    return best;
  }

  /* --------------------------------------------------------- Ansage-Auswahl */

  /* Was lässt sich mit diesem Blatt überhaupt ansagen? Für ein Sauspiel muss
     die gerufene Sau fehlen und mindestens eine weitere Karte derselben Farbe
     da sein – Ober und Unter zählen dabei nicht, die sind ja Trumpf. */
  function moeglicheSpiele(hand) {
    const raus = [];
    for (const f of [0, 1, 3]) {
      if (hand.includes(karte(f, 0))) continue;
      if (hand.some((k) => farbe(k) === f && wert(k) !== 3 && wert(k) !== 4)) {
        raus.push({ art: 'sau', farbe: f });
      }
    }
    raus.push({ art: 'wenz' });
    raus.push({ art: 'geier' });
    for (const f of [0, 1, 2, 3]) raus.push({ art: 'solo', farbe: f });
    return raus;
  }

  /* ------------------------------------------------------------ Abrechnung */

  /* Laufende: die obersten Trümpfe der Reihe nach, solange sie derselben
     Partei gehören. Gezählt wird nach den Ausgangsblättern und nicht nach dem
     Verlauf – wer sie hatte, hatte sie. */
  function laufende(startHaende, sp, seite) {
    const ord = ordnung(sp);
    const beiSpieler = new Uint8Array(32);
    for (let p = 0; p < 4; p += 1) {
      if (!seite[p]) continue;
      for (const k of startHaende[p]) beiSpieler[k] = 1;
    }
    const obenSpieler = beiSpieler[ord.liste[0]] === 1;
    let n = 0;
    for (const k of ord.liste) {
      if ((beiSpieler[k] === 1) !== obenSpieler) break;
      n += 1;
    }
    return { anzahl: n, mit: obenSpieler };
  }

  const GRUNDWERT = { sau: 10, wenz: 50, geier: 50, solo: 50 };
  /* Ab wie vielen Laufenden bezahlt wird. Beim Wenz und beim Geier gibt es
     überhaupt nur vier Trümpfe – dort zählt schon das Paar. */
  const LAUF_AB = { sau: 3, wenz: 2, geier: 2, solo: 3 };

  /* Aus den fertigen Stichen wird der Preis. seite[p] = 1 heißt: p spielt. */
  function abrechnen(sp, seite, stiche, startHaende) {
    let augenSpieler = 0;
    let sticheSpieler = 0;
    let sticheGegner = 0;
    for (const st of stiche) {
      const a = augenSumme(st.karten);
      if (seite[st.sieger]) { augenSpieler += a; sticheSpieler += 1; }
      else sticheGegner += 1;
    }
    const augenGegner = 120 - augenSpieler;
    const gewonnen = augenSpieler >= 61;
    const verlorene = gewonnen ? augenGegner : augenSpieler;
    const schneider = verlorene <= 30;
    const schwarz = gewonnen ? sticheGegner === 0 : sticheSpieler === 0;

    const lauf = laufende(startHaende, sp, seite);
    const zaehlen = lauf.anzahl >= LAUF_AB[sp.art] ? lauf.anzahl : 0;

    const wert = GRUNDWERT[sp.art]
      + (schneider ? 10 : 0)
      + (schwarz ? 10 : 0)
      + zaehlen * 10;

    /* Beim Sauspiel zahlt jeder Verlierer an jeden Gewinner – unterm Strich
       bekommt jeder der beiden Gewinner einen Wert. Beim Solo steht einer
       gegen drei und bekommt entsprechend das Dreifache. */
    const allein = sp.art !== 'sau';
    const konto = [0, 0, 0, 0];
    for (let p = 0; p < 4; p += 1) {
      const meins = seite[p] ? gewonnen : !gewonnen;
      konto[p] = (meins ? 1 : -1) * wert * (seite[p] && allein ? 3 : 1);
    }

    return {
      gewonnen, augenSpieler, augenGegner, schneider, schwarz,
      laufende: zaehlen, laufendeMit: lauf.mit, laufendeRoh: lauf.anzahl,
      wert, konto, sticheSpieler, sticheGegner,
    };
  }

  /* ============================================================ Simulation

     Eine „Welt" ist eine vollständig aufgedeckte Lage: alle vier Blätter, der
     halbe Stich auf dem Tisch, der Punktestand. Darauf laufen sowohl die
     Ausspielregel als auch die Suche. Züge werden gemacht und wieder
     zurückgenommen, damit nicht bei jedem Knoten neue Felder entstehen.
  */

  function welt(sp, haende, spieler, partner, amZug, trickStart, trick) {
    const ord = ordnung(sp);
    const seite = [0, 0, 0, 0];
    seite[spieler] = 1;
    if (partner >= 0) seite[partner] = 1;
    const gelegt = trick ? trick.slice() : [];
    const w = {
      sp, ord, seite,
      haende: haende.map((h) => h.slice()),
      ruf: sp.art === 'sau' ? sp.farbe : -1,
      sauKarte: sp.art === 'sau' ? karte(sp.farbe, 0) : -1,
      sauWeg: false,
      davon: false,
      amZug,
      trickStart: trickStart == null ? amZug : trickStart,
      trick: gelegt,
      punkte: [0, 0],          // 0 = Spielerpartei, 1 = Gegenpartei
      stiche: [0, 0],
      offen: 0,                // Karten, die noch auf der Hand liegen
      restAugen: 0,            // Augen, die noch zu vergeben sind
      stapel: [],
      tiefe: 0,
    };
    for (const h of w.haende) w.offen += h.length;
    w.restAugen = augenSumme(gelegt) + w.haende.reduce((s, h) => s + augenSumme(h), 0);
    return w;
  }

  /* Was darf p legen? Der ganze Farbzwang samt Rufsau steckt hier – und
     nirgends sonst, damit Mensch und Rechner denselben Regeln folgen. */
  function erlaubt(w, p) {
    const hand = w.haende[p];
    const ord = w.ord;
    const gebunden = w.ruf >= 0 && !w.sauWeg && !w.davon && hand.indexOf(w.sauKarte) >= 0;

    if (!w.trick.length) {
      if (!gebunden) return hand.slice();
      /* Der Partner darf die Rufffarbe nur anspielen, indem er die Sau selbst
         legt. Mit vier Karten der Farbe darf er stattdessen davonlaufen – eine
         kleine vorweg – und die Sau ist danach frei. */
      const farbig = hand.filter((k) => !ord.trumpf[k] && farbe(k) === w.ruf);
      if (farbig.length >= 4) return hand.slice();
      return hand.filter((k) => k === w.sauKarte || ord.trumpf[k] || farbe(k) !== w.ruf);
    }

    const ang = ord.reihe(w.trick[0]);
    const bedienen = hand.filter((k) => ord.reihe(k) === ang);
    if (bedienen.length) {
      // Wird die Rufffarbe gesucht, muss die Sau fallen.
      if (gebunden && ang === w.ruf) return [w.sauKarte];
      return bedienen;
    }
    // Abwerfen darf man alles – nur die Rufsau nicht.
    if (gebunden && hand.length > 1) return hand.filter((k) => k !== w.sauKarte);
    return hand.slice();
  }

  function zugMachen(w, k) {
    const p = w.amZug;
    const hand = w.haende[p];
    const i = hand.indexOf(k);
    let rahmen = w.stapel[w.tiefe];
    if (!rahmen) { rahmen = { karten: [0, 0, 0, 0] }; w.stapel[w.tiefe] = rahmen; }
    rahmen.p = p;
    rahmen.i = i;
    rahmen.k = k;
    rahmen.sauWeg = w.sauWeg;
    rahmen.davon = w.davon;
    rahmen.trickStart = w.trickStart;
    rahmen.voll = false;
    hand.splice(i, 1);

    /* Davonlaufen: der Partner spielt die Rufffarbe an, ohne die Sau zu legen.
       Danach hängt an der Farbe kein Zwang mehr – und alle wissen, wer der
       Partner ist. */
    if (w.ruf >= 0 && !w.sauWeg && !w.trick.length
        && !w.ord.trumpf[k] && farbe(k) === w.ruf && k !== w.sauKarte
        && hand.indexOf(w.sauKarte) >= 0) {
      w.davon = true;
    }
    if (k === w.sauKarte) w.sauWeg = true;

    w.trick.push(k);
    w.offen -= 1;
    w.amZug = (p + 1) % 4;

    if (w.trick.length === 4) {
      const platz = stichPlatz(w.trick, w.ord);
      const sieger = (w.trickStart + platz) % 4;
      const a = augenSumme(w.trick);
      const seite = w.seite[sieger] ? 0 : 1;
      w.punkte[seite] += a;
      w.stiche[seite] += 1;
      w.restAugen -= a;
      rahmen.voll = true;
      rahmen.sieger = sieger;
      rahmen.augen = a;
      rahmen.seite = seite;
      for (let j = 0; j < 4; j += 1) rahmen.karten[j] = w.trick[j];
      w.trick.length = 0;
      w.trickStart = sieger;
      w.amZug = sieger;
    }
    w.tiefe += 1;
    return rahmen;
  }

  function zugZurueck(w) {
    w.tiefe -= 1;
    const r = w.stapel[w.tiefe];
    if (r.voll) {
      w.punkte[r.seite] -= r.augen;
      w.stiche[r.seite] -= 1;
      w.restAugen += r.augen;
      w.trick.length = 0;
      for (let j = 0; j < 4; j += 1) w.trick.push(r.karten[j]);
    }
    w.trick.pop();
    w.haende[r.p].splice(r.i, 0, r.k);
    w.offen += 1;
    w.sauWeg = r.sauWeg;
    w.davon = r.davon;
    w.trickStart = r.trickStart;
    w.amZug = r.p;
  }

  /* Kann nach mir noch jemand über die Karte drüber? In der Welt liegen alle
     Blätter offen – die Antwort ist also keine Schätzung, sondern die
     Wahrheit dieser einen Verteilung. */
  function nochSchlagbar(w, best) {
    const ord = w.ord;
    const ang = ord.reihe(w.trick[0]);
    for (let i = w.trick.length + 1; i < 4; i += 1) {
      const q = (w.trickStart + i) % 4;
      const hand = w.haende[q];
      const bedienen = hand.filter((k) => ord.reihe(k) === ang);
      const kandidaten = bedienen.length ? bedienen : hand.filter((k) => ord.trumpf[k]);
      if (kandidaten.some((k) => schlaegt(k, best, ang, ord))) return true;
    }
    return false;
  }

  /* ---------------------------------------------------- Ausspielregel

     Die schnelle Faustregel. Sie entscheidet in den Ausspielungen, mit denen
     die Suche eine Welt zu Ende spielt – und muss deshalb vor allem eines
     sein: billig. Trotzdem spielt sie schon für sich genommen ordentlich,
     weil sie die zwei Fragen stellt, um die es am Tisch geht: Gehört der
     Stich meiner Partei? Und kommt nach mir noch jemand drüber?
  */

  const billigst = (liste) => liste.reduce((a, b) => (augen(b) < augen(a) ? b : a));
  const teuerst = (liste) => liste.reduce((a, b) => (augen(b) > augen(a) ? b : a));

  /* Was man am liebsten loswird: viel Augen weg wäre schlecht, ein Ass hebt
     man auf, und Farben, von denen nur noch wenig da ist, macht man blank –
     dann kann man später stechen. */
  function abwerfen(w, p, zuege) {
    const ord = w.ord;
    const hand = w.haende[p];
    let bestes = zuege[0];
    let note = -1e9;
    for (const k of zuege) {
      const lang = hand.filter((c) => ord.reihe(c) === ord.reihe(k)).length;
      let n = -augen(k) * 3;
      if (ord.trumpf[k]) n -= 12 + ord.rang[k] - 100;     // Trumpf hält man
      else n += (5 - Math.min(lang, 5)) * 2;              // kurze Farbe blank machen
      if (wert(k) === 0) n -= 20;                         // eine Sau wirft man nicht weg
      if (wert(k) === 1) n -= 10;
      if (n > note) { note = n; bestes = k; }
    }
    return bestes;
  }

  function anspiel(w, p, zuege) {
    const ord = w.ord;
    const hand = w.haende[p];
    const meins = w.seite[p];
    const truempfe = zuege.filter((k) => ord.trumpf[k]);

    /* Trumpf ziehen: Wer den höchsten Trumpf hat, der noch draußen ist, holt
       damit die Trümpfe der Gegenpartei heraus – das ist der Kern jedes
       Solos und der halben Sauspiele. */
    if (truempfe.length) {
      const fremdTrumpf = [];
      for (let q = 0; q < 4; q += 1) {
        if (w.seite[q] === meins) continue;
        for (const k of w.haende[q]) if (ord.trumpf[k]) fremdTrumpf.push(k);
      }
      const hoechster = truempfe.reduce((a, b) => (ord.rang[b] > ord.rang[a] ? b : a));
      const obenauf = fremdTrumpf.every((k) => ord.rang[k] < ord.rang[hoechster]);
      if (fremdTrumpf.length && obenauf && truempfe.length >= 2) return hoechster;
    }

    /* Eine blanke Sau spielt man an, solange die Farbe noch nicht gelaufen
       ist – sonst sticht sie irgendwann jemand weg. */
    const saeue = zuege.filter((k) => !ord.trumpf[k] && wert(k) === 0);
    if (saeue.length) {
      for (const s of saeue) {
        const f = farbe(s);
        const draussen = w.haende.reduce((n, h, q) => (
          q === p ? n : n + h.filter((k) => !ord.trumpf[k] && farbe(k) === f).length), 0);
        if (draussen >= 2) return s;
      }
    }

    const farbig = zuege.filter((k) => !ord.trumpf[k]);
    if (farbig.length) {
      // Kurze Farbe klein anspielen: billig, und danach ist man dort blank.
      let bestes = farbig[0];
      let note = -1e9;
      for (const k of farbig) {
        const lang = hand.filter((c) => !ord.trumpf[c] && farbe(c) === farbe(k)).length;
        const n = -augen(k) * 2 - lang * 3 - ord.rang[k];
        if (n > note) { note = n; bestes = k; }
      }
      return bestes;
    }
    return truempfe.reduce((a, b) => (ord.rang[b] < ord.rang[a] ? b : a));
  }

  function faustregel(w, p) {
    const zuege = erlaubt(w, p);
    if (zuege.length === 1) return zuege[0];
    if (!w.trick.length) return anspiel(w, p, zuege);

    const ord = w.ord;
    const ang = ord.reihe(w.trick[0]);
    const platz = stichPlatz(w.trick, w.ord);
    const bester = w.trick[platz];
    const fuehrer = (w.trickStart + platz) % 4;
    const unsrer = w.seite[fuehrer] === w.seite[p];
    const imStich = augenSumme(w.trick);
    const letzter = w.trick.length === 3;

    if (unsrer) {
      // Gehört der Stich schon uns, wird geschmiert – aber nur, wenn er hält.
      if (letzter || !nochSchlagbar(w, bester)) return teuerst(zuege);
      const klein = zuege.filter((k) => augen(k) <= 4);
      return klein.length ? teuerst(klein) : billigst(zuege);
    }

    const gewinner = zuege.filter((k) => schlaegt(k, bester, ang, ord));
    if (gewinner.length) {
      // Der billigste Zug, der reicht. Nicht der höchste: der wird noch gebraucht.
      const nehmen = gewinner.reduce((a, b) => (
        augen(b) < augen(a) || (augen(b) === augen(a) && ord.rang[b] < ord.rang[a]) ? b : a));
      w.trick.push(nehmen);
      const haelt = letzter || !nochSchlagbar(w, nehmen);
      w.trick.pop();
      if (haelt && (imStich >= 4 || augen(nehmen) === 0 || letzter)) return nehmen;
      // Ein teurer Stich ist auch ein Risiko wert.
      if (!haelt && imStich >= 10 && augen(nehmen) <= 4) return nehmen;
    }
    return abwerfen(w, p, zuege);
  }

  /* Eine Welt bis zum Ende spielen und die Augen der Spielerpartei ablesen.
     Danach wird alles wieder zurückgenommen – die Welt ist hinterher, wie sie
     vorher war. */
  function ausspielen(w) {
    let n = 0;
    while (w.offen) { zugMachen(w, faustregel(w, w.amZug)); n += 1; }
    const ergebnis = { punkte: w.punkte.slice(), stiche: w.stiche.slice() };
    while (n) { zugZurueck(w); n -= 1; }
    return ergebnis;
  }

  /* ------------------------------------------------------------- Endspiel

     Wenn nur noch wenige Karten liegen, wird nicht mehr geschätzt, sondern
     ausgerechnet: beide Parteien spielen bestmöglich, das Ergebnis ist exakt.
     Die Alpha-Beta-Schranken kommen aus dem Spiel selbst – mehr als die noch
     offenen Augen kann keine Partei bekommen, weniger als die schon sicheren
     nicht verlieren. Das schneidet die meisten Äste weg. */
  function endspiel(w, alpha, beta) {
    if (!w.offen) return w.punkte[0];
    const obergrenze = w.punkte[0] + w.restAugen;
    if (obergrenze <= alpha) return obergrenze;
    if (w.punkte[0] >= beta) return w.punkte[0];

    const p = w.amZug;
    const max = w.seite[p] === 1;
    const zuege = erlaubt(w, p);
    if (zuege.length > 1) {
      // Hohe Karten zuerst: sie erzwingen die Antwort und schneiden früher ab.
      zuege.sort((a, b) => w.ord.rang[b] - w.ord.rang[a]);
    }
    let best = max ? -1 : 1000;
    for (const k of zuege) {
      zugMachen(w, k);
      const v = endspiel(w, alpha, beta);
      zugZurueck(w);
      if (max) { if (v > best) best = v; if (best > alpha) alpha = best; }
      else if (v < best) { best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }

  /* ================================================================= Sicht

     Was ein einzelner Spieler wissen kann – und keinen Deut mehr. Der Rechner
     bekommt nie das Blatt der anderen zu sehen; er bekommt diese Sicht, und
     der Hinweisgeber für den Menschen bekommt dieselbe. Deshalb kann ein Tipp
     auch danebenliegen: er ist ehrlich errechnet, nicht abgeschrieben.

     Drei Sorten Wissen stecken darin:

     1. Was liegt. Jede gespielte Karte, für alle sichtbar.
     2. Wer welche Farbe nicht mehr hat. Wer nicht bedient, hat nicht.
     3. Was der Rufsau-Zwang verrät. Der Spieler hat die Rufsau nicht – sonst
        hätte er nicht rufen dürfen. Wer die Rufffarbe bedient, ohne die Sau
        zu legen, hat sie auch nicht. Und fällt die Sau nicht, obwohl die
        Farbe angespielt wurde, dann ist der Anspieler selbst der Partner: nur
        er darf davonlaufen, alle anderen müssten die Sau legen.
  */

  function sichtVon(z, ich) {
    const sp = z.spielart;
    const ord = ordnung(sp);
    const sauK = sp.art === 'sau' ? karte(sp.farbe, 0) : -1;

    const frei = [0, 1, 2, 3].map(() => [0, 0, 0, 0, 0]);
    const sauNicht = [0, 0, 0, 0];
    const gesehen = new Uint8Array(32);
    let sauBei = -1;
    let sauWeg = false;
    let davon = false;
    if (sp.art === 'sau') sauNicht[z.spieler] = 1;

    const runden = z.stiche.concat(z.aktuell.karten.length ? [z.aktuell] : []);
    for (const st of runden) {
      const ang = ord.reihe(st.karten[0]);
      const voll = st.karten.length === 4;
      for (let i = 0; i < st.karten.length; i += 1) {
        const k = st.karten[i];
        const q = (st.start + i) % 4;
        gesehen[k] = 1;
        if (i > 0 && ord.reihe(k) !== ang) frei[q][ang] = 1;
        if (k === sauK) { sauBei = q; sauWeg = true; }
        else if (sauK >= 0 && !sauWeg && !davon && ang === sp.farbe && ord.reihe(k) === ang) {
          sauNicht[q] = 1;                     // bedient, ohne die Sau zu legen
        }
      }
      // Farbe gesucht, Sau nicht gefallen: der Anspieler ist davongelaufen.
      if (sauK >= 0 && voll && !sauWeg && ang === sp.farbe) {
        davon = true;
        sauBei = st.start;
      }
    }

    const hand = z.haende[ich].slice();
    if (hand.indexOf(sauK) >= 0) { sauBei = ich; davon = z.davon; }
    for (const k of hand) gesehen[k] = 1;

    const unbekannt = [];
    for (const k of ALLE) if (!gesehen[k]) unbekannt.push(k);
    for (let p = 0; p < 4; p += 1) if (sauBei >= 0 && p !== sauBei) sauNicht[p] = 1;

    return {
      sp, ord, ich, hand, spieler: z.spieler,
      anzahl: z.haende.map((h) => h.length),
      unbekannt, frei, sauK, sauBei, sauNicht, sauWeg, davon,
      trickStart: z.aktuell.start,
      trick: z.aktuell.karten.slice(),
    };
  }

  const wuerfelStd = Math.random;

  function mischen(liste, wuerfel) {
    for (let i = liste.length - 1; i > 0; i -= 1) {
      const j = Math.floor(wuerfel() * (i + 1));
      const t = liste[i]; liste[i] = liste[j]; liste[j] = t;
    }
    return liste;
  }

  /* Darf Karte k bei Spieler p liegen? */
  function passt(s, p, k) {
    if (s.frei[p][s.ord.reihe(k)]) return false;
    if (k === s.sauK && !s.sauWeg) {
      if (s.sauNicht[p]) return false;
      if (s.sauBei >= 0 && s.sauBei !== p) return false;
    }
    return true;
  }

  /* Eine mögliche Verteilung der unbekannten Karten würfeln. Karten mit
     wenigen erlaubten Plätzen zuerst – sonst rennt man sich fest. Klappt es
     nach etlichen Anläufen nicht, werden die Fesseln gelöst: eine leicht
     falsche Welt ist besser als gar keine. */
  function verteilen(s, wuerfel) {
    const plaetze = [0, 1, 2, 3].filter((p) => p !== s.ich);
    const eng = s.unbekannt.slice().sort((a, b) => (
      plaetze.filter((p) => passt(s, p, a)).length
      - plaetze.filter((p) => passt(s, p, b)).length));

    for (let versuch = 0; versuch < 40; versuch += 1) {
      const haende = [[], [], [], []];
      haende[s.ich] = s.hand.slice();
      let gut = true;
      for (const k of eng) {
        const moegl = plaetze.filter((p) => haende[p].length < s.anzahl[p] && passt(s, p, k));
        if (!moegl.length) { gut = false; break; }
        haende[moegl[Math.floor(wuerfel() * moegl.length)]].push(k);
      }
      if (gut) return haende;
    }

    const haende = [[], [], [], []];
    haende[s.ich] = s.hand.slice();
    const rest = mischen(s.unbekannt.slice(), wuerfel);
    for (const k of rest) {
      const p = plaetze.find((q) => haende[q].length < s.anzahl[q]);
      haende[p].push(k);
    }
    return haende;
  }

  function weltAus(s, haende) {
    let partner = -1;
    if (s.sp.art === 'sau') {
      for (let p = 0; p < 4; p += 1) if (haende[p].indexOf(s.sauK) >= 0) partner = p;
      if (partner < 0 && s.sauBei >= 0) partner = s.sauBei;
    }
    const w = welt(s.sp, haende, s.spieler, partner, s.ich, s.trickStart, s.trick);
    w.sauWeg = s.sauWeg;
    w.davon = s.davon;
    return w;
  }

  /* ============================================================== Der Rat

     Für jede erlaubte Karte: in vielen gewürfelten Verteilungen legen und
     jede zu Ende spielen. Am Ende zählt, wie oft es gereicht hat.

     Zwei Arten, eine Welt zu Ende zu spielen:

       Faustregel   – schnell, ungefähr. Für den Anfang, wo noch zu viel
                      offen ist, als dass sich etwas ausrechnen ließe.
       Endspiel     – exakt. Sobald wenig genug liegt, wird nicht mehr
                      geschätzt: beide Parteien spielen bestmöglich.

     Der Umschaltpunkt hängt an der Zahl der offenen Karten, nicht an der
     Stichnummer – gerechnet wird, sobald es sich rechnen lässt.
  */

  const EXAKT_AB = 13;          // offene Karten, ab denen exakt gerechnet wird

  function bewerten(s, opt) {
    const einst = opt || {};
    const proben = einst.proben || 80;
    const frist = einst.frist || 260;
    const wuerfel = einst.wuerfel || wuerfelStd;
    const beginn = Date.now();

    const erste = weltAus(s, verteilen(s, wuerfel));
    const zuege = erlaubt(erste, s.ich);
    const werte = zuege.map((k) => ({ karte: k, siege: 0, augen: 0, welten: 0 }));
    if (zuege.length === 1) {
      werte[0].welten = 1;
      werte[0].siege = 1;
      return { werte, welten: 0, einzig: true };
    }

    let welten = 0;
    for (let i = 0; i < proben; i += 1) {
      if (i && Date.now() - beginn > frist) break;
      const w = i === 0 ? erste : weltAus(s, verteilen(s, wuerfel));
      const meineSeite = w.seite[s.ich] ? 0 : 1;
      const schwelle = w.seite[s.ich] ? 61 : 60;
      for (const e of werte) {
        zugMachen(w, e.karte);
        const punkte0 = w.offen <= EXAKT_AB ? endspiel(w, -1, 1000) : ausspielen(w).punkte[0];
        zugZurueck(w);
        const meine = meineSeite === 0 ? punkte0 : 120 - punkte0;
        e.augen += meine;
        e.siege += meine >= schwelle ? 1 : 0;
        e.welten += 1;
      }
      welten += 1;
    }

    /* Gewinnen zählt, Augen entscheiden bei Gleichstand: zwei Karten, die
       gleich oft reichen, sind nicht gleich gut – die mit mehr Augen hält
       auch den Schneider offen. */
    for (const e of werte) {
      e.quote = e.welten ? e.siege / e.welten : 0;
      e.schnitt = e.welten ? e.augen / e.welten : 0;
      e.nutzen = e.quote + e.schnitt / 4000;
    }
    werte.sort((a, b) => b.nutzen - a.nutzen);
    return { werte, welten, einzig: false };
  }

  const besteKarte = (s, opt) => bewerten(s, opt).werte[0].karte;

  /* -------------------------------------------------------- Begründung

     Der Rechner sagt nicht nur was, sondern warum. Die Begründung kommt nicht
     aus der Suche – die kann nur zählen –, sondern aus der Lage: dieselben
     Fragen, die ein Mensch am Tisch stellt, in dieser Reihenfolge. */
  function begruenden(s, k, seite) {
    const ord = s.ord;
    const meins = seite;                        // gehöre ich zur Spielerpartei?
    const trumpf = ord.trumpf[k] === 1;

    if (!s.trick.length) {
      if (trumpf) {
        const draussen = s.unbekannt.filter((c) => ord.trumpf[c]);
        const hoechster = draussen.every((c) => ord.rang[c] < ord.rang[k]);
        if (hoechster && draussen.length) {
          return 'Trumpf ziehen: höher ist nichts mehr draußen. Jeder Trumpf, '
            + 'den du jetzt herausholst, kann später keinen deiner Stiche mehr wegnehmen.';
        }
        if (augen(k) === 0) return 'Klein antrumpfen – das kostet nichts und zieht trotzdem.';
        return 'Mit Trumpf anspielen und die Führung behalten.';
      }
      if (s.sp.art === 'sau' && farbe(k) === s.sp.farbe && !s.sauWeg && !meins) {
        return 'Die Sau suchen: wer sie hat, muss sie legen. Danach weißt du, '
          + 'wer zu wem gehört – und der Ruf-Partner kann sie nicht mehr auf einen '
          + 'sicheren Stich schmieren.';
      }
      if (wert(k) === 0) {
        return 'Die Sau anspielen, solange die Farbe noch läuft. Wartest du, '
          + 'ist irgendwann jemand blank und sticht sie weg.';
      }
      const lang = s.hand.filter((c) => !ord.trumpf[c] && farbe(c) === farbe(k)).length;
      if (lang <= 2) {
        return 'Klein anspielen und die Farbe loswerden. Bist du dort blank, '
          + 'kannst du beim nächsten Mal stechen.';
      }
      return 'Eine billige Karte voraus – die teuren hebst du dir auf.';
    }

    const ang = ord.reihe(s.trick[0]);
    const platz = stichPlatz(s.trick, ord);
    const bester = s.trick[platz];
    const fuehrer = (s.trickStart + platz) % 4;
    const unsrer = seiteVon(s, fuehrer) === meins;
    const imStich = augenSumme(s.trick);
    const letzter = s.trick.length === 3;

    if (schlaegt(k, bester, ang, ord)) {
      if (unsrer) return 'Drüber – auch wenn der Stich schon uns gehört, ist es hier billiger, ihn selbst zu machen.';
      return 'Stechen: der Stich ist ' + imStich + (imStich === 1 ? ' Auge' : ' Augen')
        + ' wert' + (letzter ? ' und nach dir kommt keiner mehr.' : ', und billiger kommst du nicht drüber.');
    }
    if (unsrer) {
      if (augen(k) >= 10) {
        return 'Schmieren: der Stich gehört schon uns' + (letzter ? '' : ' und hält voraussichtlich')
          + ' – also die Augen drauf. Zehner und Sau sind bei den eigenen Leuten am besten aufgehoben.';
      }
      if (augen(k) >= 4) return 'Ein König drauf: etwas Zählbares, ohne gleich den Zehner zu riskieren.';
      return 'Noch nichts verschenken – der Stich ist nicht sicher genug für die dicken Karten.';
    }
    if (augen(k) === 0) {
      return 'Da ist nichts zu holen, also billig abwerfen. Kein Auge für die Gegenpartei.';
    }
    return 'Du kommst nicht drüber – dann die Karte weg, die am wenigsten weh tut.';
  }

  const seiteVon = (s, p) => (
    p === s.spieler || (s.sp.art === 'sau' && s.sauBei >= 0 && p === s.sauBei) ? 1 : 0);

  /* ============================================================== Ansage

     Ob sich ein Blatt lohnt, wird nicht nach Punkten geschätzt, sondern
     ausgespielt: Rest zufällig verteilen, Partie mit der Faustregel zu Ende
     spielen, zählen, wie oft 61 Augen zusammenkommen. Das kostet ein paar
     Millisekunden und ist ehrlicher als jede Punktetabelle – die Sau, auf die
     man ruft, liegt schließlich irgendwo, und wo, weiß niemand.

     Vorher wird grob gesiebt: Ein Solo ohne Trümpfe muss man nicht 60-mal
     durchspielen, um zu wissen, dass es nichts wird. */

  function siebt(hand, sp) {
    const ord = ordnung(sp);
    const truempfe = hand.filter((k) => ord.trumpf[k]);
    const ober = hand.filter((k) => wert(k) === 3).length;
    if (sp.art === 'sau') return truempfe.length >= 4;
    if (sp.art === 'wenz') return hand.filter((k) => wert(k) === 4).length >= 2;
    if (sp.art === 'geier') return ober >= 2;
    return truempfe.length >= 6;
  }

  /* Wie oft reicht dieses Blatt für dieses Spiel? platz ist der Sitz relativ
     zur Vorhand: 0 heißt, ich spiele aus. */
  function quote(hand, sp, platz, opt) {
    const einst = opt || {};
    const proben = einst.proben || 60;
    const wuerfel = einst.wuerfel || wuerfelStd;
    const sauK = sp.art === 'sau' ? karte(sp.farbe, 0) : -1;
    const eigen = new Uint8Array(32);
    for (const k of hand) eigen[k] = 1;
    const rest = ALLE.filter((k) => !eigen[k]);
    const vorhand = (4 - (platz % 4)) % 4;

    let siege = 0;
    let augenSum = 0;
    for (let i = 0; i < proben; i += 1) {
      mischen(rest, wuerfel);
      const haende = [hand.slice(), rest.slice(0, 8), rest.slice(8, 16), rest.slice(16, 24)];
      let partner = -1;
      if (sauK >= 0) for (let p = 1; p < 4; p += 1) if (haende[p].indexOf(sauK) >= 0) partner = p;
      const w = welt(sp, haende, 0, partner, vorhand, vorhand, []);
      const e = ausspielen(w);
      if (e.punkte[0] >= 61) siege += 1;
      augenSum += e.punkte[0];
    }
    return { quote: siege / proben, augen: augenSum / proben };
  }

  /* Die Probe schmeichelt dem, der ansagt. Die Faustregel greift lieber an,
     als dass sie verteidigt – wer das Spiel macht, spielt in der Ausspielung
     also gegen eine zu weiche Gegenwehr. Nachgemessen über 160 durchgespielte
     Partien, in denen alle vier mit dem vollen Rechner spielten:

        Sauspiel      geschätzt 0,74   tatsächlich 0,66
        Alleinspiele  geschätzt 0,69   tatsächlich 0,61

     Beides derselbe Abstand, quer durch alle Spielarten und über alle
     Quotenbereiche hinweg. Also wird er einmal abgezogen, statt für jede
     Spielart eine eigene Zahl zu erfinden. */
  const ABSCHLAG = 0.08;

  /* Was der Rechner mit diesem Blatt ansagen würde. Der Einsatz steht dabei
     mit in der Rechnung: ein Sauspiel bringt zehn, ein Solo das Fünfzehnfache –
     ein mittelmäßiges Solo ist deshalb rechnerisch mehr wert als ein sicheres
     Sauspiel. Damit der Rechner trotzdem nicht bei jedem zweiten Blatt allein
     spielt, muss ein Alleinspiel zusätzlich eine Mindestquote schaffen.

     Die Schwelle ist gemessen und nicht geraten: bei 0,62 wird jede vierte
     Gabe allein gespielt, bei 0,72 jede siebte. Das zweite kommt dem nahe,
     wie am Tisch wirklich gespielt wird – ein Solo spielt man, wenn es sitzt,
     und nicht, wenn es sich gerade eben rechnet. */
  const MINDEST = { sau: 0.5, wenz: 0.72, geier: 0.72, solo: 0.72 };

  function ansageRat(hand, platz, opt) {
    const einst = opt || {};
    const liste = [];
    for (const sp of moeglicheSpiele(hand)) {
      if (!siebt(hand, sp)) continue;
      const q = quote(hand, sp, platz, einst);
      const echt = Math.max(0, q.quote - ABSCHLAG);
      const einsatz = GRUNDWERT[sp.art] * (sp.art === 'sau' ? 1 : 3);
      liste.push({
        spiel: sp, quote: echt, roh: q.quote, augen: q.augen,
        erwartung: (2 * echt - 1) * einsatz,
        reicht: echt >= MINDEST[sp.art],
      });
    }
    liste.sort((a, b) => b.erwartung - a.erwartung);
    const gut = liste.filter((e) => e.reicht);
    return { liste, wahl: gut.length ? gut[0] : null };
  }

  return {
    FARBEN, WERTE, KURZ, AUGEN, SAUNAME, ALLE,
    farbe, wert, augen, karte, kartenName, kartenKurz, augenSumme,
    ordnung, trumpfListe, spielName, spielKurz, spielStufe, sortieren,
    schlaegt, stichPlatz, moeglicheSpiele, laufende, abrechnen,
    GRUNDWERT, LAUF_AB, MINDEST, ABSCHLAG, EXAKT_AB,
    welt, erlaubt, zugMachen, zugZurueck, faustregel, ausspielen, endspiel,
    nochSchlagbar, mischen,
    sichtVon, verteilen, weltAus, bewerten, besteKarte, begruenden, seiteVon,
    quote, ansageRat, siebt,
  };
})();
