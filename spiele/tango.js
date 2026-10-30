/* Tango – 6×6 mit zwei Zeichen, nach dem Vorbild des LinkedIn-Rätsels.

   Drei Regeln:
   · In jeder Zeile und jeder Spalte stehen von jedem Zeichen genau drei.
   · Nie drei gleiche Zeichen nebeneinander oder untereinander.
   · Zwischen zwei Feldern kann ein Zeichen stehen:
       =  die beiden sind gleich
       ×  die beiden sind verschieden

   Der Generator baut erst ein gültiges Feld, streut dann ein paar Zeichen
   zwischen die Felder und gibt so lange einzelne Felder vor, bis sich das
   Rätsel Schritt für Schritt herleiten lässt – danach wird jede entbehrliche
   Vorgabe wieder entfernt. Womit hergeleitet wird, steht bei
   ohneRatenLoesbar; Eindeutigkeit allein wäre zu wenig.
*/

(() => {
  const N = 6;
  const HALB = N / 2;
  const SONNE = 1;
  const MOND = 2;

  /* Sonne und Mond werden gezeichnet, nicht getippt: die Schriftzeichen ☀ und ☾
     kommen je nach Gerät als buntes Emoji, in ganz anderer Größe oder gar nicht.
     Beide Formen liegen immer im Feld, sichtbar ist über CSS nur die gefragte. */
  const ZEICHNUNG = '<svg class="t-bild" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
    + '<g class="t-bild-sonne">'
    + '<circle cx="12" cy="12" r="5"/>'
    + '<g stroke-linecap="round">'
    + '<path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2"/>'
    + '<path d="M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/>'
    + '</g></g>'
    + '<path class="t-bild-mond" d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>'
    + '</svg>';

  // Auch die Marken zwischen den Feldern: × und = stehen sonst je nach Schrift verschieden hoch.
  const MARKE = (art) => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'
    + (art === '=' ? 'M5.5 9h13M5.5 15h13' : 'M6.5 6.5l11 11M17.5 6.5l-11 11') + '"/></svg>';

  const ZAHLWORT = { 4: 'vier', 5: 'fünf', 6: 'sechs' };

  const zeileVon = (i) => Math.floor(i / N);
  const spalteVon = (i) => i % N;

  const mischen = (feld) => {
    for (let i = feld.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [feld[i], feld[j]] = [feld[j], feld[i]];
    }
    return feld;
  };

  /* Passt der Wert an dieser Stelle noch zu allen drei Regeln? */
  function erlaubt(feld, i, wert, zeichen) {
    const z = zeileVon(i);
    const s = spalteVon(i);

    let inZeile = 0;
    for (let k = 0; k < N; k += 1) if (feld[z * N + k] === wert) inZeile += 1;
    if (inZeile >= HALB) return false;

    let inSpalte = 0;
    for (let k = 0; k < N; k += 1) if (feld[k * N + s] === wert) inSpalte += 1;
    if (inSpalte >= HALB) return false;

    // Drei gleiche am Stück – waagerecht wie senkrecht, in beide Richtungen.
    const wertAn = (zz, ss) => (zz < 0 || ss < 0 || zz >= N || ss >= N ? 0 : feld[zz * N + ss]);
    const dreier = [
      [[0, -2], [0, -1]], [[0, -1], [0, 1]], [[0, 1], [0, 2]],
      [[-2, 0], [-1, 0]], [[-1, 0], [1, 0]], [[1, 0], [2, 0]],
    ];
    for (const [a, b] of dreier) {
      if (wertAn(z + a[0], s + a[1]) === wert && wertAn(z + b[0], s + b[1]) === wert) return false;
    }

    for (const c of zeichen) {
      if (c.a !== i && c.b !== i) continue;
      const anderes = feld[c.a === i ? c.b : c.a];
      if (!anderes) continue;
      if (c.art === '=' && anderes !== wert) return false;
      if (c.art === 'x' && anderes === wert) return false;
    }
    return true;
  }

  function vollesFeld() {
    const feld = new Array(N * N).fill(0);
    const bauen = (i) => {
      if (i === N * N) return true;
      for (const wert of mischen([SONNE, MOND])) {
        if (!erlaubt(feld, i, wert, [])) continue;
        feld[i] = wert;
        if (bauen(i + 1)) return true;
        feld[i] = 0;
      }
      return false;
    };
    return bauen(0) ? feld : null;
  }

  /* Die Linien, in die je drei Sonnen und drei Monde gehören: sechs Zeilen,
     sechs Spalten. Jede weiß, wie sie heißt und wie man eine Stelle in ihr
     benennt – innerhalb der Zeile 3 genügt die Spalte. */
  const LINIEN = (() => {
    const raus = [];
    for (let z = 0; z < N; z += 1) {
      raus.push({
        name: 'Zeile ' + (z + 1),
        felder: [...Array(N).keys()].map((s2) => z * N + s2),
        kurz: (i) => 'Spalte ' + (spalteVon(i) + 1),
      });
    }
    for (let s2 = 0; s2 < N; s2 += 1) {
      raus.push({
        name: 'Spalte ' + (s2 + 1),
        felder: [...Array(N).keys()].map((z) => z * N + s2),
        kurz: (i) => 'Zeile ' + (zeileVon(i) + 1),
      });
    }
    return raus;
  })();

  const andersAls = (w) => (w === SONNE ? MOND : SONNE);
  const platzName = (i) => 'Zeile ' + (zeileVon(i) + 1) + ', Spalte ' + (spalteVon(i) + 1);
  const zeichenName = (w) => (w === SONNE ? 'die Sonne' : 'der Mond');
  const mehrzahl = (w) => (w === SONNE ? 'Sonnen' : 'Monde');

  /* Der nächste Schluss, der sich ohne Probieren ziehen lässt – mitsamt
     Begründung. Der Hinweis im Spiel gibt genau das weiter, und der Prüfer
     beim Bauen fragt dieselbe Stelle: Was der Hinweis nicht erklären könnte,
     soll gar nicht erst als Rätsel herauskommen.

     Die Reihenfolge ist die, in der man selbst schaut: erst die Zeichen
     zwischen den Feldern, dann die Dreier, dann die ausgezählte Linie – und
     erst wenn nichts davon greift, wird eine einzelne Linie durchgespielt.

     Zurück kommt { zuege, titel, text } oder null. */
  function naechsterSchluss(feld, zeichen) {
    // 1. Ein Zeichen zwischen zwei Feldern, von denen eines schon steht.
    for (const c of zeichen) {
      const bekannt = feld[c.a] ? c.a : feld[c.b] ? c.b : -1;
      if (bekannt < 0) continue;
      const offen = bekannt === c.a ? c.b : c.a;
      if (feld[offen]) continue;
      const gleich = c.art === '=';
      const wert = gleich ? feld[bekannt] : andersAls(feld[bekannt]);
      return {
        zuege: [{ i: offen, wert }],
        titel: gleich ? 'Das Gleichheitszeichen' : 'Das Kreuz',
        text: 'Zwischen ' + platzName(c.a) + ' und ' + platzName(c.b) + ' steht ein '
          + (gleich ? '=' : '×') + ': die beiden sind ' + (gleich ? 'gleich' : 'verschieden') + '. '
          + 'Auf ' + platzName(bekannt) + ' liegt ' + zeichenName(feld[bekannt]) + ', also gehört auf '
          + platzName(offen) + ' ' + zeichenName(wert) + '.',
      };
    }

    // 2. Drei gleiche am Stück verhindern.
    for (const linie of LINIEN) {
      const f = linie.felder;
      for (let p = 0; p + 2 < N; p += 1) {
        const a = f[p];
        const b = f[p + 1];
        const c = f[p + 2];
        const machen = (einer, anderer, offen, luecke) => ({
          zuege: [{ i: offen, wert: andersAls(feld[einer]) }],
          titel: 'Drei am Stück sind verboten',
          text: 'In ' + linie.name + ' liegen auf ' + linie.kurz(einer) + ' und ' + linie.kurz(anderer)
            + ' zwei ' + mehrzahl(feld[einer])
            + (luecke ? ' mit einer Lücke dazwischen. Käme in die Lücke noch eine, '
              : ' nebeneinander. Käme daneben noch eine, ')
            + 'wären es drei am Stück. Auf ' + linie.kurz(offen) + ' gehört also '
            + zeichenName(andersAls(feld[einer])) + '.',
        });
        if (feld[a] && feld[a] === feld[b] && !feld[c]) return machen(a, b, c, false);
        if (feld[b] && feld[b] === feld[c] && !feld[a]) return machen(b, c, a, false);
        if (feld[a] && feld[a] === feld[c] && !feld[b]) return machen(a, c, b, true);
      }
    }

    // 3. Sind von einem Zeichen schon drei da, ist der Rest festgelegt.
    for (const linie of LINIEN) {
      let sonnen = 0;
      let monde = 0;
      for (const i of linie.felder) {
        if (feld[i] === SONNE) sonnen += 1;
        else if (feld[i] === MOND) monde += 1;
      }
      const voll = sonnen >= HALB ? SONNE : monde >= HALB ? MOND : 0;
      if (!voll) continue;
      const rest = linie.felder.filter((i) => !feld[i]);
      if (!rest.length) continue;
      const wert = andersAls(voll);
      return {
        zuege: rest.map((i) => ({ i, wert })),
        titel: 'Die Linie ist ausgezählt',
        text: 'In ' + linie.name + ' liegen schon drei ' + mehrzahl(voll) + '. Mehr dürfen es nicht sein – '
          + 'von jedem Zeichen gehören genau drei in jede Zeile und jede Spalte. '
          + (rest.length === 1
            ? 'Das letzte freie Feld ist also ' + zeichenName(wert) + '.'
            : 'Die übrigen ' + rest.length + ' Felder sind also alle ' + mehrzahl(wert) + '.'),
      };
    }

    /* 4. Der stärkere Schluss, den man am Brett auch von Hand zieht: eine
          einzelne Zeile oder Spalte einmal ganz durchspielen. Bei sechs
          Feldern sind das höchstens 64 Möglichkeiten. Steht in allen
          zulässigen dasselbe Zeichen an einer Stelle, ist es dort sicher –
          ohne dass man den Rest des Bretts anfassen müsste. */
    for (const linie of LINIEN) {
      const f = linie.felder;
      const leer = f.filter((i) => !feld[i]);
      if (!leer.length) continue;

      const drin = new Set(f);
      const regeln = zeichen.filter((c) => drin.has(c.a) || drin.has(c.b));
      const treffer = new Map(leer.map((i) => [i, null]));
      let anzahl = 0;

      for (let muster = 0; muster < (1 << leer.length); muster += 1) {
        const probe = feld.slice();
        leer.forEach((i, n) => { probe[i] = (muster >> n) & 1 ? SONNE : MOND; });

        let sonnen = 0;
        for (const i of f) if (probe[i] === SONNE) sonnen += 1;
        if (sonnen !== HALB) continue;

        let gut = true;
        for (let p = 0; p + 2 < N && gut; p += 1) {
          if (probe[f[p]] === probe[f[p + 1]] && probe[f[p]] === probe[f[p + 2]]) gut = false;
        }
        for (const c of regeln) {
          if (!gut) break;
          if (!probe[c.a] || !probe[c.b]) continue;   // Partner draußen, noch offen
          if (c.art === '=' ? probe[c.a] !== probe[c.b] : probe[c.a] === probe[c.b]) gut = false;
        }
        if (!gut) continue;

        anzahl += 1;
        for (const i of leer) {
          if (treffer.get(i) === null) treffer.set(i, probe[i]);
          else if (treffer.get(i) !== probe[i]) treffer.set(i, 0);
        }
      }
      if (!anzahl) return null;                      // Sackgasse, dürfte nicht sein

      const sicher = [...treffer].filter(([, wert]) => wert).map(([i, wert]) => ({ i, wert }));
      if (!sicher.length) continue;

      return {
        zuege: sicher,
        titel: 'Diese Linie einmal durchspielen',
        text: 'Spiel ' + linie.name + ' einmal ganz durch: drei Sonnen, drei Monde, keine drei gleichen '
          + 'am Stück, dazu die Zeichen ringsum. Dann '
          + (anzahl === 1 ? 'bleibt genau eine Möglichkeit' : 'bleiben nur ' + anzahl + ' Möglichkeiten')
          + ' – und '
          + (sicher.length === 1
            ? 'auf ' + linie.kurz(sicher[0].i) + ' steht dabei immer ' + zeichenName(sicher[0].wert) + '.'
            : 'an ' + sicher.length + ' Stellen steht immer dasselbe: '
              + sicher.map((z) => linie.kurz(z.i) + ' ' + zeichenName(z.wert)).join(', ') + '.'),
      };
    }

    return null;
  }

  /* Lässt sich das Rätsel allein mit diesen Schlüssen zu Ende bringen? Bleibt
     der Kessel vorher stehen, käme man nur noch durchs Probieren weiter. */
  function ohneRatenLoesbar(vorgabe, zeichen) {
    const feld = vorgabe.slice();
    let offen = feld.filter((w) => !w).length;
    while (offen > 0) {
      const schluss = naechsterSchluss(feld, zeichen);
      if (!schluss) return false;
      for (const zug of schluss.zuege) {
        if (feld[zug.i]) continue;
        feld[zug.i] = zug.wert;
        offen -= 1;
      }
    }
    return true;
  }

  function raetselBauen(anzahlZeichen) {
    const loesung = vollesFeld();
    if (!loesung) return null;

    // Ein paar Beziehungen zwischen Nachbarn aufdecken.
    const paare = [];
    for (let i = 0; i < N * N; i += 1) {
      if (spalteVon(i) < N - 1) paare.push({ a: i, b: i + 1 });
      if (zeileVon(i) < N - 1) paare.push({ a: i, b: i + N });
    }
    const zeichen = mischen(paare).slice(0, anzahlZeichen).map(({ a, b }) => ({
      a, b, art: loesung[a] === loesung[b] ? '=' : 'x',
    }));

    /* So lange Felder vorgeben, bis sich das Rätsel Schritt für Schritt
       herleiten lässt. Eindeutigkeit allein genügt nicht: Ein eindeutiges
       Rätsel kann trotzdem eine Stelle haben, an der nur noch Probieren
       weiterhilft. Wer sich herleiten lässt, ist ohnehin eindeutig. */
    const vorgabe = new Array(N * N).fill(0);
    const reihenfolge = mischen([...Array(N * N).keys()]);
    let zeiger = 0;
    while (!ohneRatenLoesbar(vorgabe, zeichen) && zeiger < reihenfolge.length) {
      const i = reihenfolge[zeiger];
      vorgabe[i] = loesung[i];
      zeiger += 1;
    }
    if (!ohneRatenLoesbar(vorgabe, zeichen)) return null;

    // Und jetzt wieder wegnehmen, was sich auch so ergibt.
    for (const i of mischen([...Array(N * N).keys()])) {
      if (!vorgabe[i]) continue;
      const gemerkt = vorgabe[i];
      vorgabe[i] = 0;
      if (!ohneRatenLoesbar(vorgabe, zeichen)) vorgabe[i] = gemerkt;
    }

    return { loesung, vorgabe, zeichen };
  }

  /* ------------------------------------------------------------------ Spiel */

  const STUFEN = {
    leicht: { name: 'leicht', zeichen: 10 },
    mittel: { name: 'mittel', zeichen: 6 },
    schwer: { name: 'schwer', zeichen: 3 },
  };

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let uhr = null;
    let neueBestzeit = false;

    function frisch(stufe) {
      let r = null;
      for (let versuch = 0; versuch < 30 && !r; versuch += 1) {
        r = raetselBauen(STUFEN[stufe].zeichen);
      }
      if (!r) r = raetselBauen(STUFEN.leicht.zeichen);
      return {
        stufe,
        loesung: r.loesung,
        vorgabe: r.vorgabe,
        zeichen: r.zeichen,
        feld: r.vorgabe.slice(),
        verbraucht: 0,
        seit: Date.now(),
        hilfen: 0,
        verlauf: [],
        fertig: false,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.feld) && alt.feld.length === N * N && !alt.fertig) {
        alt.seit = Date.now();
        // Ein Stand aus einer älteren Fassung kennt den Verlauf noch nicht.
        if (!Array.isArray(alt.verlauf)) alt.verlauf = [];
        return alt;
      }
      return frisch('leicht');
    }

    const zeitJetzt = () => stand.verbraucht + (stand.fertig ? 0 : Date.now() - stand.seit);

    function sichern() {
      if (!stand.fertig) {
        stand.verbraucht = zeitJetzt();
        stand.seit = Date.now();
      }
      s.merken(stand);
    }

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const gitter = el('div', 't-gitter');
    // Die Zeile unter dem Brett sagt, warum etwas rot ist. Sie hält ihren Platz
    // frei, sonst springen die Knöpfe beim ersten Patzer nach unten.
    const lage = el('p', 't-lage');
    lage.setAttribute('aria-live', 'polite');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste');
    wurzel.append(kopf, gitter, lage, endeKasten, leiste);

    const zurueckKnopf = s.leistenKnopf('Rückgängig', 'rueckgaengig', zurueckNehmen);
    const leerenKnopf = s.leistenKnopf('Von vorn', 'leeren', vonVorn);
    const hinweisKnopf = s.leistenKnopf('Hinweis', 'hinweis', hinweis);
    leiste.append(zurueckKnopf, leerenKnopf, hinweisKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neues Rätsel', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    const felder = [];
    for (let i = 0; i < N * N; i += 1) {
      const f = el('button', 't-feld');
      f.type = 'button';
      f.innerHTML = ZEICHNUNG;
      // Im Sieg läuft eine Welle von oben links über das Brett.
      f.style.setProperty('--schritt', String(zeileVon(i) + spalteVon(i)));
      const nr = i;
      f.addEventListener('click', () => weiterschalten(nr));
      gitter.append(f);
      felder.push(f);
    }

    /* Die Zeichen zwischen den Feldern liegen als kleine Marken darüber. */
    const marken = el('div', 't-marken');
    gitter.append(marken);

    const zeichenVerletzt = (c) => {
      const a = stand.feld[c.a];
      const b = stand.feld[c.b];
      return !!a && !!b && (c.art === '=' ? a !== b : a === b);
    };

    function markenZeichnen() {
      marken.replaceChildren();
      for (const c of stand.zeichen) {
        const m = el('span', 't-marke');
        m.innerHTML = MARKE(c.art);
        const z = zeileVon(c.a);
        const s2 = spalteVon(c.a);
        const waagerecht = c.b === c.a + 1;
        m.style.left = ((s2 + (waagerecht ? 1 : 0.5)) / N * 100) + '%';
        m.style.top = ((z + (waagerecht ? 0.5 : 1)) / N * 100) + '%';
        if (zeichenVerletzt(c)) m.dataset.fehler = 'ja';
        marken.append(m);
      }
    }

    /* ---------------------------------------------------------------- Zug */

    /* Wer ein Feld antippt, bis das richtige Zeichen steht, hat einen Zug
       gemacht, nicht zwei – „Rückgängig" nimmt das Feld ganz zurück. Der
       Verlauf liegt im Stand und übersteht ein Neuladen wie bei Damen. */
    const VERLAUF_TIEFE = 80;
    let letztesFeld = -1;
    let stelle = new Set();     // Felder, von denen der Hinweis gerade spricht

    function zugMerken(i = -1) {
      stelle = new Set();
      if (i >= 0 && i === letztesFeld) return;
      stand.verlauf.push(stand.feld.slice());
      if (stand.verlauf.length > VERLAUF_TIEFE) stand.verlauf.shift();
      letztesFeld = i;
    }

    function setzen(i, wert) {
      if (stand.fertig || stand.vorgabe[i] || stand.feld[i] === wert) return;
      zugMerken(i);
      stand.feld[i] = wert;
      // Einmal ganz herum getippt: Dann war es gar kein Zug.
      const vorher = stand.verlauf[stand.verlauf.length - 1];
      if (vorher && vorher.every((w, k) => w === stand.feld[k])) {
        stand.verlauf.pop();
        letztesFeld = -1;
      }
      s.fuehlen();
      sichern();
      zeichnen();
      pruefenObFertig();
    }

    function weiterschalten(i) {
      setzen(i, stand.feld[i] === 0 ? SONNE : stand.feld[i] === SONNE ? MOND : 0);
    }

    function zurueckNehmen() {
      if (stand.fertig || !stand.verlauf.length) return;
      stand.feld = stand.verlauf.pop();
      letztesFeld = -1;
      stelle = new Set();
      s.fuehlen();
      sichern();
      zeichnen();
    }

    /* Keine Rückfrage: „Rückgängig" holt alles wieder. */
    function vonVorn() {
      if (stand.fertig || !hatEigenes()) return;
      zugMerken();
      stand.feld = stand.vorgabe.slice();
      sichern();
      zeichnen();
    }

    const hatEigenes = () => stand.feld.some((w, i) => w && !stand.vorgabe[i]);

    /* Pfeile wandern von Feld zu Feld, die Felder sind ja Knöpfe: Enter und
       Leertaste schalten weiter wie ein Tipp. Dazu die Abkürzungen, damit der
       Mond nicht zwei Anschläge kostet. */
    const PFEILE = { ArrowUp: -N, ArrowDown: N, ArrowLeft: -1, ArrowRight: 1 };
    const beiTaste = (e) => {
      if (stand.fertig || Echtzeit.blattOffen() || e.altKey) return;
      if (e.target && e.target.closest && e.target.closest('input, textarea, select')) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); zurueckNehmen(); }
        return;
      }
      const hier = felder.indexOf(document.activeElement);
      if (PFEILE[e.key]) {
        e.preventDefault();
        if (hier < 0) { felder[0].focus(); return; }
        const schritt = PFEILE[e.key];
        const ziel = hier + schritt;
        // Nicht von der rechten Kante in die nächste Zeile rutschen.
        if (ziel < 0 || ziel >= N * N || (Math.abs(schritt) === 1 && zeileVon(ziel) !== zeileVon(hier))) return;
        felder[ziel].focus();
        return;
      }
      if (e.key === 'Backspace') { e.preventDefault(); zurueckNehmen(); return; }
      if (hier < 0) return;
      const taste = e.key.toLowerCase();
      if (taste === 's' || taste === '1') setzen(hier, SONNE);
      else if (taste === 'm' || taste === '2') setzen(hier, MOND);
      else if (taste === '0' || taste === 'delete') setzen(hier, 0);
    };
    window.addEventListener('keydown', beiTaste);

    /* Was ist an diesem Feld falsch? Für die rote Markierung. */
    function fehlerhaft() {
      const raus = new Set();
      const wertAn = (z, s2) => (z < 0 || s2 < 0 || z >= N || s2 >= N ? 0 : stand.feld[z * N + s2]);

      for (let z = 0; z < N; z += 1) {
        for (const wert of [SONNE, MOND]) {
          const treffer = [];
          for (let s2 = 0; s2 < N; s2 += 1) if (wertAn(z, s2) === wert) treffer.push(z * N + s2);
          if (treffer.length > HALB) treffer.forEach((i) => raus.add(i));
        }
      }
      for (let s2 = 0; s2 < N; s2 += 1) {
        for (const wert of [SONNE, MOND]) {
          const treffer = [];
          for (let z = 0; z < N; z += 1) if (wertAn(z, s2) === wert) treffer.push(z * N + s2);
          if (treffer.length > HALB) treffer.forEach((i) => raus.add(i));
        }
      }
      for (let z = 0; z < N; z += 1) {
        for (let s2 = 0; s2 < N; s2 += 1) {
          const w = wertAn(z, s2);
          if (!w) continue;
          if (wertAn(z, s2 + 1) === w && wertAn(z, s2 + 2) === w) {
            raus.add(z * N + s2); raus.add(z * N + s2 + 1); raus.add(z * N + s2 + 2);
          }
          if (wertAn(z + 1, s2) === w && wertAn(z + 2, s2) === w) {
            raus.add(z * N + s2); raus.add((z + 1) * N + s2); raus.add((z + 2) * N + s2);
          }
        }
      }
      for (const c of stand.zeichen) {
        const a = stand.feld[c.a];
        const b = stand.feld[c.b];
        if (!a || !b) continue;
        if ((c.art === '=' && a !== b) || (c.art === 'x' && a === b)) { raus.add(c.a); raus.add(c.b); }
      }
      return raus;
    }

    /* Rot allein sagt nicht, was nicht stimmt. Genannt wird der erste Verstoß,
       in derselben Sprache wie die Anleitung. */
    function verstossText() {
      for (const linie of LINIEN) {
        for (const wert of [SONNE, MOND]) {
          const zahl = linie.felder.filter((i) => stand.feld[i] === wert).length;
          if (zahl > HALB) return 'In ' + linie.name + ' stehen ' + ZAHLWORT[zahl] + ' ' + mehrzahl(wert) + ' – höchstens drei.';
        }
      }
      for (const linie of LINIEN) {
        const f = linie.felder;
        for (let p = 0; p + 2 < N; p += 1) {
          const w = stand.feld[f[p]];
          if (w && w === stand.feld[f[p + 1]] && w === stand.feld[f[p + 2]]) {
            return 'In ' + linie.name + ' stehen drei ' + mehrzahl(w) + ' am Stück.';
          }
        }
      }
      for (const c of stand.zeichen) {
        if (zeichenVerletzt(c)) return c.art === '=' ? 'Am = müssen beide Felder gleich sein.' : 'Am × müssen die beiden Felder verschieden sein.';
      }
      return null;
    }

    /* Der Hinweis schaut nicht in die Lösung, sondern sucht einen Schluss,
       den man auch selbst ziehen könnte – und nennt ihn. Es ist derselbe
       Schluss, an dem sich beim Bauen entscheidet, ob ein Rätsel überhaupt
       zugelassen wird. */
    function hinweis() {
      if (stand.fertig) return;

      const falsch = stand.feld.some((w, i) => w && w !== stand.loesung[i]);
      if (falsch) {
        s.blatt({
          titel: 'Da steht etwas Falsches',
          inhalt: 'Mindestens ein gesetztes Zeichen passt nicht zur Lösung. Geh die Zeilen und Spalten noch einmal durch – drei gleiche am Stück sind der häufigste Patzer.',
          aktionen: [{ text: 'Schaue nach' }],
        });
        return;
      }

      const schluss = naechsterSchluss(stand.feld, stand.zeichen);
      if (!schluss) {
        s.blatt({
          titel: 'Hier sehe ich nichts Zwingendes',
          inhalt: 'Mit den einfachen Schlüssen komme ich gerade nicht weiter. Bei einem frisch gebauten '
            + 'Rätsel sollte das nicht vorkommen – trag erst einmal nach, was sich ohnehin schon ergibt.',
          aktionen: [{ text: 'Verstanden' }],
        });
        return;
      }

      stand.hilfen += 1;
      sichern();
      /* „Zeile 4, Spalte 5" muss man sonst abzählen. Der Ring bleibt nach
         „Selbst machen" stehen, bis der nächste Zug kommt. */
      stelle = new Set(schluss.zuege.map((z) => z.i));
      zeichnen();
      s.blatt({
        titel: schluss.titel,
        inhalt: schluss.text,
        aktionen: [
          {
            text: schluss.zuege.length === 1 ? 'Eintragen' : 'Alle eintragen',
            tun: () => {
              zugMerken();
              for (const zug of schluss.zuege) if (!stand.feld[zug.i]) stand.feld[zug.i] = zug.wert;
              sichern();
              zeichnen();
              pruefenObFertig();
            },
          },
          { text: 'Selbst machen', art: 'still' },
        ],
      });
    }

    function pruefenObFertig() {
      if (stand.fertig) return;
      for (let i = 0; i < N * N; i += 1) if (stand.feld[i] !== stand.loesung[i]) return;
      stand.verbraucht = zeitJetzt();
      stand.fertig = true;
      // Vor dem Notieren schauen, sonst schlägt die Partie sich selbst.
      const frueher = s.partien().filter((p) => p.gewonnen && p.stufe === stand.stufe && p.dauer > 0);
      neueBestzeit = frueher.length > 0 && frueher.every((p) => p.dauer > stand.verbraucht);
      s.fuehlen(30);
      s.notieren({
        gewonnen: true,
        dauer: stand.verbraucht,
        stufe: stand.stufe,
        hilfen: stand.hilfen,
      });
      s.merken(stand);
      zeichnen();
      // Auf einem flachen Fenster läge das Ergebnis sonst unter dem Rand.
      endeKasten.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    /* ------------------------------------------------------------ Zeichnen */

    function zeichnen() {
      const fehler = fehlerhaft();
      for (let i = 0; i < N * N; i += 1) {
        const f = felder[i];
        const w = stand.feld[i];
        f.dataset.wert = w === SONNE ? 'sonne' : w === MOND ? 'mond' : 'leer';
        f.dataset.fest = stand.vorgabe[i] ? 'ja' : 'nein';
        if (fehler.has(i)) f.dataset.fehler = 'ja'; else delete f.dataset.fehler;
        if (stelle.has(i)) f.dataset.stelle = 'ja'; else delete f.dataset.stelle;
        f.setAttribute('aria-label', 'Zeile ' + (zeileVon(i) + 1) + ', Spalte ' + (spalteVon(i) + 1)
          + ': ' + (w === SONNE ? 'Sonne' : w === MOND ? 'Mond' : 'leer'));
      }
      gitter.dataset.fertig = stand.fertig ? 'ja' : 'nein';
      markenZeichnen();
      lageZeichnen();
      kopfZeichnen();
      endeZeichnen();
      leiste.hidden = stand.fertig;
      zurueckKnopf.disabled = !stand.verlauf.length;
      leerenKnopf.disabled = !hatEigenes();
    }

    function lageZeichnen() {
      const verstoss = stand.fertig ? null : verstossText();
      lage.hidden = stand.fertig;
      lage.dataset.fehler = verstoss ? 'ja' : 'nein';
      lage.textContent = verstoss || (hatEigenes() ? '' : 'Tippen setzt die Sonne, nochmal tippen den Mond.');
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      kopf.append(s.stufenName(STUFEN, stand.stufe));
      const zeit = el('span', null, '');
      zeit.append(el('b', null, s.dauerText(zeitJetzt()) === '–' ? '0 s' : s.dauerText(zeitJetzt())));
      kopf.append(zeit);
      kopf.append(el('span', null, stand.feld.filter((w) => !w).length + ' offen'));
      s.unter('Sonne und Mond, je drei');
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !stand.fertig;
      if (!stand.fertig) return;
      endeKasten.append(s.bildzeichen('fertig'));
      endeKasten.append(el('p', 'ende-titel', 'Gelöst.'));
      if (neueBestzeit) endeKasten.append(el('span', 'ende-marke', 'Neue Bestzeit'));
      endeKasten.append(el('p', 'notiz', STUFEN[stand.stufe].name + ' · ' + s.dauerText(stand.verbraucht)
        + (stand.hilfen ? ' · ' + stand.hilfen + (stand.hilfen === 1 ? ' Hinweis' : ' Hinweise') : ' · ohne Hinweis')));
      endeKasten.append(s.stufenLeiste(STUFEN, stand.stufe, neu));
    }

    function neu(stufe) {
      stand = frisch(stufe);
      neueBestzeit = false;
      letztesFeld = -1;
      stelle = new Set();
      sichern();
      zeichnen();
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neues Rätsel',
        inhalt: 'Je schwerer die Stufe, desto weniger Zeichen stehen zwischen den Feldern. Eindeutig lösbar ist jedes.',
        aktionen: s.stufenAktionen(STUFEN, neu),
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Fülle das Feld mit Sonne und Mond. Tippen schaltet weiter: leer → Sonne → Mond → leer. Am Rechner wandern die Pfeile von Feld zu Feld, S und M setzen das Zeichen.'));
      d.append(el('p', 'notiz', 'Regel 1: In jeder Zeile und jeder Spalte stehen genau drei Sonnen und drei Monde.'));
      d.append(el('p', 'notiz', 'Regel 2: Nie drei gleiche direkt nebeneinander oder untereinander.'));
      d.append(el('p', 'notiz', 'Regel 3: Steht zwischen zwei Feldern ein =, tragen beide dasselbe Zeichen. Steht dort ein ×, tragen sie verschiedene.'));
      d.append(el('p', 'notiz', 'Was gegen eine Regel verstößt, färbt sich sofort rot, und unter dem Brett steht, warum. „Rückgängig" nimmt das zuletzt angefasste Feld zurück, auch nach „Von vorn". Geraten werden muss nie: Jedes Rätsel lässt sich Schritt für Schritt herleiten, sonst kommt es gar nicht erst vor.'));
      d.append(el('p', 'notiz', 'Der Hinweis schaut dafür nie in die Lösung. Er sucht den nächsten Schluss, den du auch selbst ziehen könntest, und sagt dir, worauf er beruht.'));
      d.append(el('p', 'notiz', 'Guter Anfang: Stehen zwei gleiche nebeneinander, muss links und rechts davon das andere Zeichen stehen.'));
      s.blatt({ titel: 'Tango', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    sichern();
    zeichnen();
    uhr = setInterval(() => { if (!stand.fertig) kopfZeichnen(); }, 1000);

    return {
      ende: () => {
        clearInterval(uhr);
        window.removeEventListener('keydown', beiTaste);
        if (!stand.fertig) sichern();
      },
    };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien, hilfe) {
    const bestzeit = (stufe) => {
      const zeiten = partien.filter((p) => p.gewonnen && p.stufe === stufe && p.dauer > 0).map((p) => p.dauer);
      return zeiten.length ? hilfe.dauerText(Math.min(...zeiten)) : '–';
    };
    return [
      { wert: bestzeit('leicht'), label: 'Bestzeit leicht' },
      { wert: bestzeit('mittel'), label: 'Bestzeit mittel' },
      { wert: bestzeit('schwer'), label: 'Bestzeit schwer' },
    ];
  }

  Rahmen.anmelden({
    id: 'tango',
    name: 'Tango',
    gruppe: 'raetsel',
    unter: 'Sonne und Mond im Gleichgewicht.',
    farbe: '#E39B5E',
    symbol: '<circle cx="8.5" cy="8.5" r="3.5"/><path d="M19 14.5a4 4 0 1 1-4.4-4 3.2 3.2 0 0 0 4.4 4z"/>',
    starten,
    auswertung,
  });
})();
