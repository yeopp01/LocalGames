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
      sp, ord, seite, spieler,
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
      /* Auch mit einem einzigen Trumpf, wenn es der höchste ist, der noch
         draußen ist. Früher standen hier zwei – die Sorge, den letzten Trumpf
         herzugeben. Sie ist unbegründet: Der höchste holt den Stich und dazu
         das Anspiel, und ein Trumpf, den man aufhebt, wird selten mehr wert.
         Gemessen über 8000 gepaarte Gaben: +0,56 ± 0,36 Punkte Siegquote beim
         Sauspiel, +0,63 ± 0,32 beim Solo. */
      if (fremdTrumpf.length && obenauf) return hoechster;
    }

    /* Eine blanke Sau spielt man an, solange die Farbe noch nicht gelaufen
       ist – sonst sticht sie irgendwann jemand weg.

       Nicht aber als Alleinspieler beim Wenz oder Geier. Dort sind nur vier
       Karten Trumpf, die Farben sind lang, und wer vorlegt, legt dem Gegner
       vor – man lässt ihn besser kommen. Gemessen über je 700 Gaben mit
       Blättern, die der Rechner für dieses Spiel auch ansagen würde:

          Wenz    ohne Regel 91,0 %   mit 87,6 %
          Geier   ohne Regel 91,1 %   mit 88,3 %

       Der Gegenpartei nützt sie dagegen überall, auch dort. Deshalb hängt sie
       an der Partei und nicht nur an der Spielart. */
    /* Nachspielen gegen ein Solo: eine hohe Karte in einer Farbe anspielen,
       in der ein Mitspieler schon frei ist. Er sticht, und die Augen der hohen
       Karte fallen der Gegenpartei zu statt dem Alleinspieler.

       Zwei Feinheiten, beide gemessen und beide gegen die Erwartung:

       Es muss eine hohe Karte sein. Mit der kleinsten angespielt verbrennt der
       Mitspieler einen Trumpf für einen Stich ohne Augen – das kostet die
       Gegenpartei 5,0 bis 5,5 Punkte, statt ihr zu nützen.

       Und es darf keine weitere Bedingung dazu. Verlangt man zusätzlich, dass
       der Alleinspieler die Farbe noch bedienen muss, bleibt von der Wirkung
       nichts übrig (−0,8 statt −3,2); dasselbe, wenn man sie auf eigene
       Trumpfschwäche einschränkt.

       Zweimal unabhängig gemessen, je rund 1750 gepaarte Gaben:
       Herz-Solo −3,22 ± 1,79, Eichel-Solo −3,83 ± 1,95 für die Spielerpartei.

       Nur beim Farbsolo. Beim Sauspiel wirkungslos (+0,50 ± 0,74), beim Wenz
       schädlich – dort gibt es nur vier Trümpfe zu stechen. */
    if (meins === 0 && w.sp.art === 'solo') {
      const mitspieler = [];
      for (let q = 0; q < 4; q += 1) {
        if (q !== p && w.seite[q] === meins) mitspieler.push(q);
      }
      const sticht = (f) => mitspieler.some((q) => (
        !w.haende[q].some((c) => !ord.trumpf[c] && farbe(c) === f)
        && w.haende[q].some((c) => ord.trumpf[c])));
      const nach = zuege.filter((k) => !ord.trumpf[k] && sticht(farbe(k)));
      if (nach.length) return nach.reduce((a, b) => (ord.rang[b] > ord.rang[a] ? b : a));
    }

    const zurueckhalten = (w.sp.art === 'wenz' || w.sp.art === 'geier') && meins === 1;
    const saeue = zurueckhalten ? [] : zuege.filter((k) => !ord.trumpf[k] && wert(k) === 0);
    if (saeue.length) {
      for (const s of saeue) {
        const f = farbe(s);
        const draussen = w.haende.reduce((n, h, q) => (
          q === p ? n : n + h.filter((k) => !ord.trumpf[k] && farbe(k) === f).length), 0);
        /* Beim Farbsolo nicht in eine Farbe hinein, in der schon jemand frei
           ist und Trumpf hat: Dort fällt die Sau samt allem, was noch darauf
           kommt. Genau daran scheitert das frühe Ausspielen – nicht daran,
           dass es früh wäre.

           Die naheliegende Abhilfe, als Spielerpartei erst Trumpf zu ziehen
           und die Sau bis dahin zu halten, ist gemessen schlechter: −0,51 für
           den Spieler und −1,88 für den Mitspieler über 20000 Gaben. Die
           Farbe zu meiden statt zu warten trifft es.

           Nur beim Solo. Beim Rufspiel ohne Wirkung (±0,0 über 20000 Gaben),
           beim Wenz und Geier schädlich (+1,6 bzw. +1,7 für die Gegenseite) –
           dort ist eine lange Farbe die Waffe und nicht der Trumpf. */
        if (w.sp.art === 'solo') {
          let jemandFrei = false;
          for (let q = 0; q < 4; q += 1) {
            if (q === p) continue;
            if (!w.haende[q].some((c) => !ord.trumpf[c] && farbe(c) === f)
                && w.haende[q].some((c) => ord.trumpf[c])) { jemandFrei = true; break; }
          }
          if (jemandFrei) continue;
        }
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
    // Ohne erlaubte Karte gaebe es nichts zu waehlen; das darf nicht werfen.
    if (!truempfe.length) return zuege.length ? zuege[0] : hand[0];
    return truempfe.reduce((a, b) => (ord.rang[b] < ord.rang[a] ? b : a));
  }

  /* Ist k die höchste Karte ihrer Reihe, die überhaupt noch draußen ist?
     Dann ist sie Kontrolle und keine Münze – die gibt man nicht für einen
     Stich her, den auch eine kleinere holt. */
  function obenauf(w, p, k, ang) {
    for (let q = 0; q < 4; q += 1) {
      if (q === p) continue;
      for (const c of w.haende[q]) if (schlaegt(c, k, ang, w.ord)) return false;
    }
    return true;
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
      /* Gehört der Stich schon uns, wird geschmiert – mit zwei Einschränkungen,
         beide gemessen.

         Der höchste Trumpf, den es noch gibt, wird nicht geschmiert. Er holt
         später selbst einen Stich; unter dem Trumpf des Partners ist er
         verschenkt. Das ist dieselbe Ausnahme wie beim Stechen, nur an der
         zweiten Stelle – und sie wiegt hier noch schwerer.

         Und hält der Stich nicht sicher, geht höchstens ein Unter drauf. Ein
         König war zu viel: vier Augen, die die Gegenpartei mitnimmt, wenn doch
         noch jemand drüberkommt.

         Gepaarte Differenz gegen die alte Fassung, beides zusammen:

            Rufspiel   Spieler +1,59 ± 0,38   Mitspieler +0,82 ± 0,28
                       Gegenspieler −2,07 ± 0,46
            Solo       Gegenspieler −6,01 ± 1,34
            Wenz       Gegenspieler −0,90 ± 0,52
            Geier      Gegenspieler −0,73 ± 0,47

         Alle drei Rollen gewinnen dabei. Beim Solo und beim Wenz gibt es die
         Entscheidung für den Alleinspieler nicht – er hat niemanden, dem er
         schmieren könnte. */
      /* Den eigenen Stich übernehmen – nicht wegen der Augen, die fallen so
         oder so uns zu, sondern wegen des Anspiels. Wer danach ausspielt,
         kann die Farbe wählen, in der ein Mitspieler schon frei ist; der
         sticht dann und nimmt die Augen mit.

         Nur beim Wenz und Geier, und nur für die Gegenpartei. Dort sind bloß
         vier Karten Trumpf, die Farben sind lang, und das Anspiel ist die
         eigentliche Waffe. Im Rufspiel kostet dasselbe: dem Mitspieler
         −0,92 ± 0,64, dem Spieler −0,21. Man nimmt dem Partner die Führung
         weg und gewinnt zu wenig dafür.

         Gegenpartei, zweimal gemessen: Wenz −0,99 und −0,77 ± 0,29,
         Geier −0,74 und −0,83 ± 0,28 für die Spielerpartei. */
      if (w.seite[p] === 0 && (w.sp.art === 'wenz' || w.sp.art === 'geier')) {
        const gewinnt = zuege.filter((k) => schlaegt(k, bester, ang, ord)
          && !(ord.trumpf[k] && obenauf(w, p, k, ang)));
        if (gewinnt.length) {
          const mitU = [];
          for (let q = 0; q < 4; q += 1) {
            if (q !== p && w.seite[q] === w.seite[p]) mitU.push(q);
          }
          const plan = w.haende[p].some((c) => !ord.trumpf[c] && mitU.some((q) => (
            !w.haende[q].some((x) => !ord.trumpf[x] && farbe(x) === farbe(c))
            && w.haende[q].some((x) => ord.trumpf[x]))));
          if (plan) {
            return gewinnt.reduce((x, y) => (augen(y) > augen(x)
              || (augen(y) === augen(x) && ord.rang[y] < ord.rang[x]) ? y : x));
          }
        }
      }

      let ohneChef = zuege.filter((k) => !(ord.trumpf[k] && obenauf(w, p, k, ang)));
      /* Und nicht unterstechen. Ist Farbe angespielt und ich dort frei, darf
         ich abwerfen oder einen Trumpf drauflegen, der nichts holt – das
         zweite verbrennt einen Trumpf für nichts. Vorher nahm die Regel
         schlicht die teuerste erlaubte Karte, und das war manchmal genau so
         ein Trumpf. Zweimal gemessen: +0,60 ± 0,33 und +0,52 ± 0,23 für den
         Spieler, für Mitspieler und Gegenpartei ohne Wirkung. */
      /* Und nicht unterstechen – aber nicht für alle gleich.

         Für den Spieler und für die Gegenpartei gilt: gar kein Trumpf. Ihre
         Trümpfe sind später mehr wert als jeder Stich, den die eigene Partei
         ohnehin schon hält.

         Für den Ruf-Mitspieler nicht. Er hält öfter einen Trumpf, der den
         Stich gewinnt – etwa die Herz-Sau über dem Achter des Spielers –, und
         damit bringt er elf Augen sicher unter, statt sie in der Hand zu
         behalten, wo sie noch acht höheren Trümpfen begegnen. Ein Trumpf, der
         drüberkommt, ist eben kein Unterstechen.

         Gemessen gegen die Fassung ohne Unterschied: Spieler +0,49 ± 0,29,
         Mitspieler +0,28 ± 0,21, Gegenpartei +0,10. */
      if (ang !== 4) {
        const istMitspieler = w.seite[p] === 1 && p !== w.spieler;
        const brauchbar = ohneChef.filter((k) => !ord.trumpf[k]
          || (istMitspieler && schlaegt(k, bester, ang, ord)));
        if (brauchbar.length) ohneChef = brauchbar;
      }
      const liste = ohneChef.length ? ohneChef : zuege;
      if (letzter || !nochSchlagbar(w, bester)) return teuerst(liste);
      const klein = liste.filter((k) => augen(k) <= 2);
      return klein.length ? teuerst(klein) : billigst(liste);
    }

    /* Womit sticht man?

       Hier stand lange „die billigste Karte, die reicht", und billig hieß:
       die mit den wenigsten Augen. Das ist ein Denkfehler. Die Augen der
       eigenen Karte fallen in den eigenen Stich, wenn er hält – eine teure
       Karte ist dort keine Ausgabe, sondern eine Verwahrung. Der Rechner legte
       deshalb den Eichel-Unter statt der Herz-Sau und ließ elf Augen in einer
       Hand, in der sie später jeder Ober noch holt.

       Was eine Karte wirklich kostet, ist ihr Rang: die Kontrolle, die man
       hergibt. Also: Hält der Stich, kommt die teuerste Karte darauf, die noch
       hält – nur nicht die, die gerade der höchste Trumpf ist, den es noch
       gibt. Die ist Kontrolle und keine Münze.

       Gemessen über 3000 gepaarte Gaben, Siegquote der Partei, die so sticht:

          Sauspiel   45,3 → 47,2 %
          Herz-Solo  51,5 → 59,1 %
          Wenz       17,0 → 16,7 %   (dort gibt es nur vier Trümpfe) */
    const gewinner = zuege.filter((k) => schlaegt(k, bester, ang, ord));
    if (gewinner.length) {
      const haelt = (k) => {
        w.trick.push(k);
        const h = letzter || !nochSchlagbar(w, k);
        w.trick.pop();
        return h;
      };
      const sicher = gewinner.filter(haelt);
      if (sicher.length) {
        const knapp = sicher.reduce((a, b) => (ord.rang[b] < ord.rang[a] ? b : a));
        const ohneChef = sicher.filter((k) => !(augen(k) >= 10 && obenauf(w, p, k, ang)));
        const liste = ohneChef.length ? ohneChef : sicher;
        const teuer = liste.reduce((a, b) => (
          augen(b) > augen(a) || (augen(b) === augen(a) && ord.rang[b] < ord.rang[a]) ? b : a));
        /* Womit – und dabei zählt nur die eigene Hand.

           Hier stand einmal „oder der Stich hat schon vier Augen". Das klingt
           vernünftig und ist doch belanglos: Beide Karten holen den Stich, die
           Augen darin fallen so oder so der eigenen Partei zu. Was allein
           zählt, ist, welche der beiden man lieber behält. Ist die teure vier
           Augen wert, ist sie hier besser aufgehoben als in der Hand; ist sie
           es nicht, nimmt man die im Rang niedrigste und behält die Kontrolle.

           Gemessen, gepaarte Differenz gegen die alte Schwelle: Sauspiel
           +0,51 ± 0,23 für die Spielerpartei und −0,73 ± 0,24, wenn die
           Gegenpartei so spielt; Solo +0,51 ± 0,52 und −0,44 ± 0,32. Beide
           Parteien gewinnen dabei. */
        if (letzter || augen(teuer) >= 4) return teuer;
        return knapp;
      }
      // Keine hält sicher – ein teurer Stich ist trotzdem ein Risiko wert.
      const billig = gewinner.reduce((a, b) => (
        augen(b) < augen(a) || (augen(b) === augen(a) && ord.rang[b] < ord.rang[a]) ? b : a));
      if (imStich >= 10 && augen(billig) <= 4) return billig;
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
    const gelegt = [[], [], [], []];        // was jeder schon gespielt hat
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
        gelegt[q].push(k);
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

    /* Wer angesagt hat und wer weiter gesagt hat. Das ist die Auskunft, die
       vor dem ersten Stich schon vorliegt und die der Weltenwürfel bisher
       nicht genutzt hat: 1 = hat angesagt, 0 = weiter, −1 = unbekannt. */
    const gebote = [-1, -1, -1, -1];
    for (const g of z.gebote || []) gebote[g.p] = g.spiel ? 1 : 0;
    if (z.spieler >= 0) gebote[z.spieler] = 1;

    return {
      sp, ord, ich, hand, spieler: z.spieler,
      anzahl: z.haende.map((h) => h.length),
      unbekannt, frei, sauK, sauBei, sauNicht, sauWeg, davon, gebote, gelegt,
      trickStart: z.aktuell.start,
      trick: z.aktuell.karten.slice(),
    };
  }

  /* ================================================================ Wissen

     Alles, was sich aus einer Sicht ableiten laesst, in lesbarer Form. Der
     Rechner rechnet damit ohnehin; hier wird es herausgegeben, damit ein
     Mensch dasselbe sehen kann, ohne es sich merken zu muessen.

     Nichts davon ist geraten und nichts erschlichen: Es steht alles in dem,
     was auf dem Tisch lag. */

  /* Welche Karten koennen den laufenden Stich ueberhaupt noch schlagen?
     Gezaehlt werden nur Karten, die noch jemand halten kann, der auch noch
     legen muss - wer schon gelegt hat, kommt nicht mehr, und wer in der Farbe
     frei ist, kann sie nicht haben. */
  function gefahr(s) {
    if (!s.trick.length) return [];
    const ord = s.ord;
    const ang = ord.reihe(s.trick[0]);
    const bester = s.trick[stichPlatz(s.trick, ord)];
    const folgende = [];
    for (let i = s.trick.length + 1; i < 4; i += 1) folgende.push((s.trickStart + i) % 4);
    return s.unbekannt.filter((c) => schlaegt(c, bester, ang, ord)
      && folgende.some((q) => !s.frei[q][ord.reihe(c)]));
  }

  /* Der hoechste Trumpf, den es ausserhalb der eigenen Hand noch gibt. */
  function hoechsterFremd(s) {
    const ord = s.ord;
    let best = -1;
    for (const c of s.unbekannt) {
      if (ord.trumpf[c] && (best < 0 || ord.rang[c] > ord.rang[best])) best = c;
    }
    return best;
  }

  function wissen(z, ich) {
    const s = sichtVon(z, ich);
    const ord = s.ord;

    // Augen: was in fertigen Stichen liegt, und wem sie gehoeren.
    let meine = 0;
    let fremde = 0;
    for (const st of z.stiche) {
      const a = augenSumme(st.karten);
      const unser = st.sieger === ich
        || (s.sp.art === 'sau' && s.sauBei >= 0
          && ((s.sauBei === ich && st.sieger === s.spieler)
            || (s.spieler === ich && st.sieger === s.sauBei)))
        || (s.sp.art !== 'sau' && s.spieler !== ich && st.sieger !== s.spieler);
      if (unser) meine += a; else fremde += a;
    }

    const freiListe = [];
    for (let q = 0; q < 4; q += 1) {
      if (q === ich) continue;
      for (let r = 0; r < 5; r += 1) if (s.frei[q][r]) freiListe.push({ wer: q, reihe: r });
    }

    /* Wer musste teuer zugeben, ohne den Stich zu bekommen? Wer einen Zehner
       oder eine Sau auf einen verlorenen Stich legt, hatte in der Farbe nichts
       Billigeres mehr. Sind alle kleineren Karten der Farbe ohnehin schon
       gesehen, ist es kein Verdacht mehr, sondern sicher: Er ist dort blank
       oder leer. */
    const zwaenge = [];
    for (const st of z.stiche) {
      const ang2 = ord.reihe(st.karten[0]);
      const sieger2 = (st.start + stichPlatz(st.karten, ord)) % 4;
      for (let i = 0; i < st.karten.length; i += 1) {
        const q = (st.start + i) % 4;
        const k = st.karten[i];
        if (q === ich || q === sieger2) continue;
        if (ord.reihe(k) !== ang2 || augen(k) < 10) continue;
        // Gibt es in dieser Reihe noch kleinere Karten, die niemand gesehen hat?
        const kleinerOffen = s.unbekannt.some((c) => ord.reihe(c) === ang2
          && ord.rang[c] < ord.rang[k]);
        zwaenge.push({ wer: q, karte: k, reihe: ang2, sicher: !kleinerOffen });
      }
    }

    /* Wer koennte der Partner sein? Solange die Rufsau nicht gefallen ist,
       ist das offen - aber nicht ganz. Drei Verhaltensweisen verschieben die
       Wahrscheinlichkeit messbar, gemessen an 1185 Mitspielern, solange die
       Sau noch lag. Grundwahrscheinlichkeit 33 Prozent:

         die Rufffarbe angespielt   60 %   (er darf sie nur mit der Sau
                                            anspielen oder davonlaufen)
         dem Spieler geschmiert     57 %
         Trumpf angespielt          55 %

       Das sind Indizien und keine Beweise - jedes zweite Mal liegt man
       daneben. Die Folklore, wonach Gegenspieler die Sau suchen, gilt an
       diesem Tisch gerade nicht. */
    const INDIZ = [
      { id: 'ruf', text: 'hat die Rufffarbe angespielt', quote: 60 },
      { id: 'schmier', text: 'hat dem Spieler geschmiert', quote: 57 },
      { id: 'trumpf', text: 'hat Trumpf angespielt', quote: 55 },
    ];
    const teamIndizien = [];
    if (s.sp.art === 'sau' && !s.sauWeg && s.sauBei < 0) {
      for (let q = 0; q < 4; q += 1) {
        if (q === ich || q === s.spieler || s.sauNicht[q]) continue;
        const gefunden = new Set();
        for (const st of z.stiche) {
          const platzT = stichPlatz(st.karten, ord);
          const fuehrerT = (st.start + platzT) % 4;
          for (let i2 = 0; i2 < st.karten.length; i2 += 1) {
            if ((st.start + i2) % 4 !== q) continue;
            const k = st.karten[i2];
            if (i2 === 0 && ord.trumpf[k]) gefunden.add('trumpf');
            if (i2 === 0 && !ord.trumpf[k] && farbe(k) === s.sp.farbe) gefunden.add('ruf');
            if (i2 > 0 && fuehrerT === s.spieler && augen(k) >= 10) gefunden.add('schmier');
          }
        }
        const treffer = INDIZ.filter((x) => gefunden.has(x.id));
        if (treffer.length) teamIndizien.push({ wer: q, indizien: treffer });
      }
    }

    const meineT = s.hand.filter((k) => ord.trumpf[k]);
    const fremdChef = hoechsterFremd(s);
    const meinChef = meineT.length
      ? meineT.reduce((a, b) => (ord.rang[b] > ord.rang[a] ? b : a)) : -1;

    return {
      sicht: s,
      augenMeine: meine,
      augenFremde: fremde,
      augenOffen: 120 - meine - fremde,
      frei: freiListe,
      hoheDraussen: s.unbekannt.filter((c) => augen(c) >= 10 || ord.rang[c] >= 100 + 7)
        .sort((a, b) => ord.rang[b] - ord.rang[a]),
      truempfeDraussen: s.unbekannt.filter((c) => ord.trumpf[c]).length,
      meineTruempfe: meineT.length,
      fremdChef,
      habeChef: meinChef >= 0 && (fremdChef < 0 || ord.rang[meinChef] > ord.rang[fremdChef]),
      meinChefTrumpf: meinChef,
      gefahr: gefahr(s),
      zwaenge,
      teamIndizien,
      sauBei: s.sauBei,
      sauNicht: s.sauNicht,
      sauWeg: s.sauWeg,
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

  /* Wie stark war das Blatt, mit dem einer in die Ansage ging? Gezählt werden
     die Trümpfe der Sauspiel-Ordnung – Ober, Unter, Herz –, und zwar die noch
     auf der Hand plus die schon gelegten. Die Ansage fiel ja über das ganze
     Blatt, nicht über den Rest.

     Gemessen über 6000 Blätter: Wer ansagt, hält im Schnitt 4,75 Trümpfe und
     1,57 Ober, wer weitersagt 3,10 und 0,82. Mit drei Trümpfen oder weniger
     sagt so gut wie niemand an, mit sechs vier von fünf. Nur 1,2 Prozent aller
     Weitersager hielten überhaupt sechs Trümpfe. */
  const SAUORD = ordnung({ art: 'sau', farbe: 0 });

  /* Wie viele Trümpfe hält, wer ansagt? Gemessen an 1400 Gaben, und zwar in
     der Ordnung, die er auch angesagt hat:

        Sauspiel   4,69 im Schnitt, nie unter 4
        Solo       6,61 im Schnitt, nie unter 6
        Wenz       2,71 im Schnitt, nie unter 2
        Geier      2,68 im Schnitt, nie unter 2

     Hier stand vorher eine einzige Zahl – vier –, und gezählt wurde in der
     Sauspiel-Ordnung. Für ein Sauspiel geht das auf. Für ein Solo war es
     grob falsch: Ein Solospieler hält sieben Trümpfe, die Schranke verlangte
     vier, und die zählte bei einem Eichel-Solo auch noch die falschen Karten.
     Der Weltenwürfel gab dem Solisten damit regelmäßig ein Blatt, das er nie
     angesagt hätte – und die Gegenpartei hielt Stiche für sicher, die es
     nicht waren. */
  const ANSAGER_TRUMPF = { sau: 4, solo: 6, wenz: 2, geier: 2 };
  const GEBOT_GRENZE = { weiterTrumpf: 5, weiterOber: 2, weiterSolo: 6 };

  function blattstaerke(karten, ord) {
    const o = ord || SAUORD;
    let truempfe = 0;
    let ober = 0;
    for (const k of karten) {
      if (o.trumpf[k]) truempfe += 1;
      if (wert(k) === 3) ober += 1;
    }
    return { truempfe, ober };
  }

  /* Passt die gewürfelte Hand zu dem, was der Spieler angesagt hat?

     Für den Ansager wird in der Ordnung gezählt, die er angesagt hat – das
     ist die, über die er entschieden hat.

     Für einen Weitersager gilt zweierlei: Er darf kein Blatt haben, mit dem er
     ein Sauspiel angesagt hätte, und keines, mit dem ein Solo drin gewesen
     wäre. Das zweite ist die schärfere Bedingung: Wer sechs Trümpfe in
     irgendeiner Farbe hat, sagt an. */
  function gebotPasst(s, p, hand) {
    const g = s.gebote ? s.gebote[p] : -1;
    if (g < 0 || !s.gebotGrenze) return true;
    const alle = hand.concat(s.gelegt[p] || []);
    if (g === 1) {
      const grenze = ANSAGER_TRUMPF[s.sp.art] || 4;
      return blattstaerke(alle, s.ord).truempfe >= grenze;
    }
    const st = blattstaerke(alle, SAUORD);
    if (st.truempfe > s.gebotGrenze.weiterTrumpf || st.ober > s.gebotGrenze.weiterOber) {
      return false;
    }
    for (let f = 0; f < 4; f += 1) {
      const so = ordnung({ art: 'solo', farbe: f });
      if (blattstaerke(alle, so).truempfe >= s.gebotGrenze.weiterSolo) return false;
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
      if (!gut) continue;
      /* Nur Welten annehmen, die zur Ansage passen. Klappt das nicht, wird
         die Bedingung nach der Hälfte der Anläufe fallengelassen – eine Welt
         ohne sie ist besser als gar keine. */
      if (versuch < 20 && ![0, 1, 2, 3].every((q) => q === s.ich || gebotPasst(s, q, haende[q]))) {
        continue;
      }
      return haende;
    }

    const haende = [[], [], [], []];
    haende[s.ich] = s.hand.slice();
    const rest = mischen(s.unbekannt.slice(), wuerfel);
    for (const k of rest) {
      /* Der Notausgang muss auch dann eine Hand finden, wenn die Zahlen nicht
         aufgehen - lieber eine Karte zu viel als eine Ausnahme, die den Zug des
         Rechners abbricht und das Spiel stehen laesst. */
      const p = plaetze.find((q) => haende[q].length < s.anzahl[q])
        || plaetze.reduce((x, y) => (haende[y].length < haende[x].length ? y : x));
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
    /* Die Ansage als Einschränkung für den Weltenwürfel – siehe gebotPasst.
       Standardmäßig an; mit gebotGrenze: null zum Vergleich abschaltbar. */
    s.gebotGrenze = ('gebotGrenze' in einst) ? einst.gebotGrenze : GEBOT_GRENZE;

    const erste = weltAus(s, verteilen(s, wuerfel));
    const zuege = erlaubt(erste, s.ich);
    const werte = zuege.map((k) => ({ karte: k, siege: 0, augen: 0, welten: 0, folge: [] }));
    if (zuege.length === 1) {
      werte[0].welten = 1;
      werte[0].siege = 1;
      return { werte, welten: 0, einzig: true };
    }

    /* Was die Faustregel in dieser Welt legen wuerde. Gebraucht wird das
       nicht fuer die Bewertung, sondern fuer den Gleichstand weiter unten. */
    const regelStimmen = new Map();

    let welten = 0;
    for (let i = 0; i < proben; i += 1) {
      if (i && Date.now() - beginn > frist) break;
      const w = i === 0 ? erste : weltAus(s, verteilen(s, wuerfel));
      const regelZug = faustregel(w, s.ich);
      regelStimmen.set(regelZug, (regelStimmen.get(regelZug) || 0) + 1);
      const meineSeite = w.seite[s.ich] ? 0 : 1;
      const schwelle = w.seite[s.ich] ? 61 : 60;
      for (const e of werte) {
        zugMachen(w, e.karte);
        const punkte0 = w.offen <= EXAKT_AB ? endspiel(w, -1, 1000) : ausspielen(w).punkte[0];
        zugZurueck(w);
        const meine = meineSeite === 0 ? punkte0 : 120 - punkte0;
        const gut = meine >= schwelle ? 1 : 0;
        e.augen += meine;
        e.siege += gut;
        e.welten += 1;
        /* Jede Welt einzeln festhalten. Alle Karten wurden in denselben Welten
           geprueft - nur so laesst sich hinterher paarweise vergleichen, und
           erst das trennt einen echten Vorsprung vom Rauschen des Wuerfelns. */
        e.folge.push(gut);
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
    for (const e of werte) e.regel = regelStimmen.get(e.karte) || 0;
    /* Welche Karte die Faustregel am häufigsten gelegt hätte. Nicht für die
       Wahl – die trifft die Rechnung –, sondern damit hinterher gesagt werden
       kann, ob der Zug ein Zug nach Merksatz ist oder einer gegen ihn. */
    let regelWahl = -1;
    let regelBeste = -1;
    for (const [kk, n] of regelStimmen) if (n > regelBeste) { regelBeste = n; regelWahl = kk; }

    /* Gleichstand: Alles, was sich vom Besten nicht unterscheiden laesst,
       steht rechnerisch gleichauf – und dann entschied bisher die dritte
       Nachkommastelle des Wuerfelns. Bei fuenfhundert Welten liegt der Fehler
       bei ein paar Punkten; unter sechs erlaubten Karten kann so jede oben
       landen, auch eine, die am Tisch niemand spielen wuerde.

       Unter Gleichen entscheidet deshalb die Faustregel – dieselben
       Merksaetze, die auch die Ausspielungen steuern: Trumpf ziehen, wenn man
       den hoechsten hat, der noch draussen ist. Eine blanke Sau anspielen,
       solange die Farbe laeuft. Mit der billigsten Karte stechen, die reicht.

       Das ist nicht dasselbe wie "nach Merksatz spielen": Ist ein Zug
       nachweisbar besser, gewinnt er, auch gegen jeden Merksatz. Nachgemessen
       schadet es naemlich, die Regeln stur anzuwenden - liessen die
       Gegenspieler in der Ausspielung immer die Rufsau suchen, verloeren sie
       ueber 4000 Sauspiele 1,2 Punkte. Die Merksaetze taugen als Ausgleich
       bei Gleichstand, nicht als Gesetz. */
    const gleichauf = werte.filter((e) => e === werte[0] || !unterschied(werte[0], e).klar);
    if (gleichauf.length > 1) {
      gleichauf.sort((a, b) => b.regel - a.regel || b.nutzen - a.nutzen);
      const wahl = gleichauf[0];
      if (wahl !== werte[0]) {
        werte.splice(werte.indexOf(wahl), 1);
        werte.unshift(wahl);
      }
    }
    return { werte, welten, einzig: false, gleichauf, regelWahl, regelAnteil: welten ? regelBeste / welten : 0 };
  }

  const besteKarte = (s, opt) => bewerten(s, opt).werte[0].karte;

  /* Ist der Vorsprung von a vor b echt? Weil beide in denselben Welten
     geprueft wurden, wird die Differenz Welt fuer Welt gebildet und nicht aus
     zwei getrennten Quoten geschaetzt. Das ist um ein Vielfaches genauer:
     die meisten Welten gehen fuer beide Karten gleich aus und fallen aus der
     Rechnung heraus, statt zweimal Streuung beizusteuern.

     klar heisst: der Unterschied ist groesser als sein eigener Fehler. Ist er
     es nicht, sind die beiden Karten hier gleich gut, und der Hinweis soll
     das auch sagen, statt eine Rangfolge zu behaupten. */
  function unterschied(a, b) {
    const n = Math.min(a.folge.length, b.folge.length);
    if (!n) return { d: 0, fehler: 1, klar: false };
    let summe = 0;
    let quadrat = 0;
    for (let i = 0; i < n; i += 1) {
      const d = a.folge[i] - b.folge[i];
      summe += d;
      quadrat += d * d;
    }
    const m = summe / n;
    const fehler = 1.96 * Math.sqrt(Math.max(quadrat / n - m * m, 0) / n);
    return { d: m, fehler, klar: m > fehler && m > 0.005 };
  }

  /* -------------------------------------------------------- Begründung

     Der Rechner sagt nicht nur was, sondern warum. Die Begründung kommt nicht
     aus der Suche – die kann nur zählen –, sondern aus der Lage: dieselben
     Fragen, die ein Mensch am Tisch stellt, in dieser Reihenfolge. */
  function begruenden(s, k, seite, zuege) {
    const ord = s.ord;
    const meins = seite;                        // gehöre ich zur Spielerpartei?
    const trumpf = ord.trumpf[k] === 1;
    const alle = zuege || [k];

    /* Ist c die höchste Karte ihrer Reihe, die überhaupt noch draußen ist?
       Gerechnet aus der Sicht, also aus dem, was man wissen darf – nicht aus
       den fremden Blättern wie in der Faustregel. Der Hinweisgeber schummelt
       auch hier nicht; er kann sich deshalb irren, wenn die höchste Karte
       zufällig in einer Hand liegt, die man nicht sieht. */
    const chef = (c) => !s.unbekannt.some((x) => ord.reihe(x) === ord.reihe(c)
      && ord.rang[x] > ord.rang[c]);

    /* Wurde eine wertvollere Karte zurückgehalten, weil sie gerade der höchste
       Trumpf ist? Das ist die Regel, die am häufigsten den Ausschlag gibt, und
       ohne diesen Satz sieht der Zug nach Geiz aus. */
    const geschont = () => alle.filter((c) => c !== k && augen(c) > augen(k)
      && ord.trumpf[c] && chef(c));
    const chefSatz = (liste) => 'Den ' + kartenName(liste[0]) + ' behältst du: '
      + 'er ist der höchste Trumpf, den es noch gibt, und holt später selbst '
      + 'einen Stich. Hier wäre er nur eine teure Münze.';

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
      /* Nachspielen gegen ein Solo, in der Reihenfolge, in der die Faustregel
         es auch prüft: gleich hinter dem Trumpfziehen. */
      if (!meins && s.sp.art === 'solo' && !trumpf) {
        const freieMit = [0, 1, 2, 3].filter((q) => q !== s.ich && q !== s.spieler
          && s.frei[q][farbe(k)]);
        if (freieMit.length) {
          return 'Nachspielen: In dieser Farbe ist einer deiner Mitspieler schon '
            + 'frei – er sticht, und die ' + augen(k) + ' Augen fallen euch zu statt '
            + 'dem Alleinspieler. Deshalb eine hohe Karte und keine kleine: mit der '
            + 'kleinsten verbrennt er einen Trumpf für einen Stich ohne Augen.';
        }
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
      /* Warum eine Sau liegen bleibt, die man eigentlich anspielen würde. Ohne
         diesen Satz sieht der Zug aus, als hätte der Rechner sie übersehen. */
      const gemieden = s.hand.filter((c) => !ord.trumpf[c] && wert(c) === 0
        && [0, 1, 2, 3].some((q) => q !== s.ich && s.frei[q][farbe(c)]));
      if (s.sp.art === 'solo' && gemieden.length && farbe(k) !== farbe(gemieden[0])) {
        return kartenName(gemieden[0]) + ' bleibt liegen: In der Farbe ist schon '
          + 'jemand frei, und beim Solo hat fast jeder noch Trumpf – die Sau fiele '
          + 'samt allem, was noch daraufkommt. Sie aufzuheben und erst Trumpf zu '
          + 'ziehen wäre auch falsch; man meidet die Farbe, statt zu warten.';
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

    /* Wer kommt nach mir – und sitzt mein Partner darunter? Das entscheidet
       mehr als alles andere darüber, ob man eine teure Karte anbringen darf:
       Kommt einer drüber, kann der Partner hinter mir ihn noch stechen.

       Beim Sauspiel weiß man das nur, wenn die Rufsau schon gefallen ist oder
       man sie selbst hält. Solange nicht, wird hier auch nichts behauptet. */
    const folgende = [];
    for (let i = s.trick.length + 1; i < 4; i += 1) folgende.push((s.trickStart + i) % 4);
    const teamKlar = s.sp.art !== 'sau' || s.sauBei >= 0;
    const partnerHinten = teamKlar && folgende.some((q) => seiteVon(s, q) === meins);

    /* Alle erlaubten Karten, die den Stich ebenfalls holen würden – daran
       misst sich, ob eine teure Karte Absicht ist oder Verschwendung. Ohne
       diese Liste stand hier früher „billiger kommst du nicht drüber", auch
       wenn danebenlag, was genau das billiger getan hätte. */
    const andere = (zuege || []).filter((c) => c !== k);
    const billiger = andere.filter((c) => schlaegt(c, bester, ang, ord) && augen(c) < augen(k));

    if (schlaegt(k, bester, ang, ord)) {
      if (unsrer) {
        /* Den eigenen Stich zu übernehmen sieht nach Unsinn aus – die Augen
           fallen ja so oder so uns zu. Der Grund liegt woanders, und er muss
           dastehen, sonst wirkt der Zug willkürlich. */
        const hoeher = s.unbekannt.filter((c) => ord.reihe(c) === ord.reihe(k)
          && ord.rang[c] > ord.rang[k]);
        if (augen(k) >= 10 && hoeher.length) {
          return 'Übernehmen, um die Augen unterzubringen. Der Stich gehört zwar schon '
            + 'uns, aber die ' + augen(k) + ' Augen sind in deiner Hand nicht sicher: '
            + hoeher.length + (hoeher.length === 1 ? ' höhere Karte ist' : ' höhere Karten sind')
            + ' noch unterwegs. Auf einem Stich, den ihr macht, sind sie gezählt.';
        }
        const langeFarbe = [0, 1, 2, 3].some((f) => s.hand.some((c) => !ord.trumpf[c]
          && farbe(c) === f) && [0, 1, 2, 3].some((q) => q !== s.ich && q !== s.spieler
            && s.frei[q][f]));
        if ((s.sp.art === 'wenz' || s.sp.art === 'geier') && !meins && langeFarbe) {
          return 'Den Stich selbst holen, um das Anspiel zu bekommen. An den Augen ändert '
            + 'das nichts – die fallen so oder so eurer Partei zu. Aber wer ausspielt, '
            + 'wählt die Farbe, und du hast eine, in der ein Mitspieler schon frei ist.';
        }
        return 'Drüber – auch wenn der Stich schon uns gehört, ist es hier besser, '
          + 'ihn selbst zu machen.';
      }
      const geschontS = geschont();
      if (geschontS.length) {
        return 'Stechen – aber nicht mit der dicksten Karte. ' + chefSatz(geschontS)
          + ' ' + kartenName(k) + ' holt den Stich genauso.';
      }
      if (!billiger.length) {
        return 'Stechen: billiger kommst du nicht drüber – alles andere, was '
          + 'reicht, kostet dich mehr.'
          + (letzter ? ' Nach dir kommt keiner mehr, der Stich ist sicher.' : '');
      }
      /* Die teure Karte ist gewollt. Dann muss auch dastehen, warum – und was
         sie kostet, wenn es schiefgeht. */
      const teuer = billiger.map((c) => kartenName(c)).join(' oder ');
      let satz = 'Den ' + kartenName(k) + ' anbringen, obwohl ' + teuer
        + ' auch reichen würde. ';
      if (partnerHinten) {
        satz += 'Dein Partner legt nach dir: Kommt jemand mit einer höheren Karte '
          + 'drüber, kann er den Stich immer noch holen – und deine ' + augen(k)
          + ' Augen liegen dann bei euch statt bei den anderen. ';
      } else if (letzter) {
        satz += 'Nach dir kommt keiner mehr, der Stich ist also sicher. ';
      } else {
        satz += 'Das ist ein Wagnis: nach dir kommt noch jemand drüber, und dann '
          + 'sind die Augen weg. Der Rechner hält es trotzdem für den besseren Weg. ';
      }
      const hoeher = s.unbekannt.filter((c) => ord.reihe(c) === ord.reihe(k)
        && ord.rang[c] > ord.rang[k]);
      if (hoeher.length && augen(k) >= 10) {
        satz += 'Und lange halten kannst du ihn nicht: ' + kartenName(hoeher[hoeher.length - 1])
          + ' ist noch draußen, dir fällt der Zehner also später ohnehin – nur dann '
          + 'womöglich ohne jemanden im Rücken.';
      }
      return satz.trim();
    }

    if (unsrer) {
      const sicher = letzter || !s.unbekannt.some((c) => schlaegt(c, bester, ang, ord));
      const geschontU = geschont();
      if (geschontU.length) {
        return 'Der Stich gehört schon uns, aber nicht alles gehört darauf. '
          + chefSatz(geschontU) + ' ' + kartenName(k) + ' tut es hier auch.';
      }
      /* Trumpf unter dem Trumpf des Partners ist verbrannt – dafür gibt es
         seit der Messung eine eigene Regel, also auch einen eigenen Satz. */
      /* Nicht unterstechen – aber der Satz stimmt nur, wenn die Trümpfe, die
         hier lägen, tatsächlich unter dem des Partners bleiben. Käme einer
         drüber, wäre das kein Unterstechen, sondern das Unterbringen der
         eigenen Augen; darüber entscheidet der Zweig weiter oben. */
      const nutzlos = alle.filter((c) => ord.trumpf[c] && !schlaegt(c, bester, ang, ord));
      if (!trumpf && ang !== 4 && nutzlos.length) {
        return 'Nicht unterstechen: Du könntest hier Trumpf drauflegen, aber er käme '
          + 'unter den des Partners und wäre verbrannt. Der Stich gehört ohnehin uns – '
          + 'dann lieber Farbe drauf und den Trumpf behalten.';
      }
      if (augen(k) >= 10) {
        return 'Schmieren: der Stich gehört schon uns'
          + (sicher ? ' und kann nicht mehr weg' : ' und hält voraussichtlich')
          + ' – also die Augen drauf. Zehner und Sau sind bei den eigenen Leuten '
          + 'am besten aufgehoben.';
      }
      if (augen(k) >= 4) {
        return 'Ein König drauf – so viel Zählbares trägt der Stich, weil er hält. '
          + 'Wäre er nicht sicher, ginge höchstens ein Unter darauf.';
      }
      if (augen(k) === 2 && !sicher) {
        return 'Ein Unter drauf, mehr nicht: Der Stich gehört uns, aber sicher ist '
          + 'er nicht. Kommt doch noch jemand drüber, nimmt er nur zwei Augen mit '
          + 'statt vier oder zehn.';
      }
      return 'Noch nichts verschenken – der Stich ist nicht sicher genug für die dicken Karten.';
    }

    if (augen(k) === 0) {
      return 'Da ist nichts zu holen, also billig abwerfen. Kein Auge für die Gegenpartei.';
    }
    const billigste = (zuege || [k]).reduce((a, c) => (augen(c) < augen(a) ? c : a), k);
    if (billigste !== k) {
      return 'Du kommst nicht drüber. Billiger wäre ' + kartenName(billigste)
        + ' – der Rechner gibt trotzdem ' + kartenName(k) + ' her, weil die Karte '
        + 'später ohnehin fällt und du die andere noch brauchst.';
    }
    return 'Du kommst nicht drüber – dann die Karte weg, die am wenigsten weh tut.';
  }

  /* Zu welcher Partei gehoert p aus meiner Sicht? 1 heisst Spielerpartei.
     Achtung: Solange beim Sauspiel die Rufsau nicht gefallen ist, weiss man
     von zwei Leuten nicht, wer davon der Partner des Spielers ist - dann
     liefert das hier fuer beide 0. Wer daraus etwas ueber den eigenen Partner
     folgern will, muss vorher fragen, ob sauBei ueberhaupt bekannt ist. */
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
     zur Vorhand: 0 heißt, ich spiele aus.

     Die Zahl der Proben ist kein Geschmack, sondern Genauigkeit: der Fehler
     einer Quote fällt mit der Wurzel. Bei 60 Proben liegt er um eine Quote
     von 0,7 herum bei ±12 Punkten – damit lassen sich zwei Rufe, die zwei
     Punkte auseinanderliegen, überhaupt nicht unterscheiden. Bei 600 sind es
     ±4. Deshalb gibt quote() den Fehler mit heraus, und wer damit rechnet,
     muss ihn ansehen, bevor er zwei Zahlen für verschieden erklärt. */
  function quote(hand, sp, platz, opt) {
    const einst = opt || {};
    const proben = einst.proben || 600;
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
    const q = siege / proben;
    return {
      quote: q,
      augen: augenSum / proben,
      proben,
      // Halbe Breite des 95-Prozent-Bereichs. Zwei Quoten, deren Bereiche sich
      // überschneiden, sind schlicht nicht auseinanderzuhalten.
      fehler: 1.96 * Math.sqrt(Math.max(q * (1 - q), 0.0001) / proben),
    };
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

  /* Wie viele Augen der eigenen Karten stehen in dieser Farbe unter dem
     Schutz der gerufenen Sau? Die Sau gehört dem Partner: Wird die Farbe
     angespielt, muss er sie legen und nimmt den Stich – die eigenen Karten
     dieser Farbe fallen also der eigenen Partei zu statt der gegnerischen.

     Das ist keine Kleinigkeit und keine Überlieferung, sondern nachgemessen.
     Für ein Blatt mit je einer blanken Karte in Eichel, Gras und Schellen,
     3000 ausgespielte Gaben je Ruf – wo landet der Eichel-Zehner?

        auf Eichel gerufen    71 % bei der eigenen Partei
        auf Gras gerufen      43 %
        auf Schellen gerufen  41 %

     Auf die Siegquote schlägt das mit knapp einem Punkt durch (+0,92 ± 1,05
     über 12000 gepaarte Gaben). Zu wenig, um eine schlechtere Farbe deswegen
     zu rufen – aber genau richtig, um zu entscheiden, wenn die Quoten sich
     ohnehin nicht unterscheiden lassen. Genau dort steht es unten auch. */
  function schutz(hand, sp) {
    if (sp.art !== 'sau') return 0;
    const ord = ordnung(sp);
    return augenSumme(hand.filter((k) => !ord.trumpf[k] && farbe(k) === sp.farbe));
  }

  /* stufeAb: Es steht schon eine Ansage. Dann sind alle Spielarten bis zu
     dieser Stufe vom Tisch – sie durchzurechnen wäre nicht nur verschwendet,
     sondern irreführend, weil am Ende ein Spiel empfohlen würde, das gar nicht
     mehr angesagt werden kann. */
  function ansageRat(hand, platz, opt) {
    const einst = opt || {};
    const stufeAb = einst.stufeAb || 0;
    const liste = [];
    for (const sp of moeglicheSpiele(hand)) {
      if (spielStufe(sp) <= stufeAb) continue;
      if (!siebt(hand, sp)) continue;
      const q = quote(hand, sp, platz, einst);
      const echt = Math.max(0, q.quote - ABSCHLAG);
      const einsatz = GRUNDWERT[sp.art] * (sp.art === 'sau' ? 1 : 3);
      liste.push({
        spiel: sp, quote: echt, roh: q.quote, augen: q.augen,
        fehler: q.fehler, proben: q.proben, schutz: schutz(hand, sp),
        erwartung: (2 * echt - 1) * einsatz,
        reicht: echt >= MINDEST[sp.art],
      });
    }
    liste.sort((a, b) => b.erwartung - a.erwartung);
    const gut = liste.filter((e) => e.reicht);
    if (!gut.length) return { liste, wahl: null, gleichauf: [] };

    /* Alles, was vom Besten nicht zu unterscheiden ist, steht gleichauf –
       und unter Gleichen entscheidet nicht die dritte Nachkommastelle des
       Würfelns, sondern die Farbe, in der die eigenen Augen geschützt sind.
       Verglichen wird nur innerhalb einer Spielart: ein Sauspiel und ein Solo
       sind nicht deshalb dasselbe, weil ihre Quoten sich überlappen. */
    const oben = gut[0];
    const spanne = oben.fehler + gut[0].fehler;
    const gleichauf = gut.filter((e) => e.spiel.art === oben.spiel.art
      && oben.quote - e.quote <= spanne);
    const wahl = gleichauf.reduce((a, b) => (
      b.schutz > a.schutz || (b.schutz === a.schutz && b.quote > a.quote) ? b : a), gleichauf[0]);
    return { liste, wahl, gleichauf };
  }

  return {
    FARBEN, WERTE, KURZ, AUGEN, SAUNAME, ALLE,
    farbe, wert, augen, karte, kartenName, kartenKurz, augenSumme,
    ordnung, trumpfListe, spielName, spielKurz, spielStufe, sortieren,
    schlaegt, stichPlatz, moeglicheSpiele, laufende, abrechnen,
    GRUNDWERT, LAUF_AB, MINDEST, ABSCHLAG, EXAKT_AB, GEBOT_GRENZE, ANSAGER_TRUMPF,
    welt, erlaubt, zugMachen, zugZurueck, faustregel, ausspielen, endspiel,
    nochSchlagbar, mischen, unterschied,
    sichtVon, verteilen, weltAus, bewerten, besteKarte, begruenden, seiteVon,
    wissen, gefahr, hoechsterFremd,
    blattstaerke, gebotPasst,
    quote, ansageRat, siebt, schutz,
  };
})();
