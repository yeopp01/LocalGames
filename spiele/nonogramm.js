/* Nonogramm (Picross) – aus Zahlen ein Bild machen.

   Die Zahlen am Rand sagen, wie viele Felder in dieser Zeile oder Spalte
   hintereinander gefüllt sind, in dieser Reihenfolge, mit mindestens einer
   Lücke dazwischen.

   Der Generator würfelt ein Bild und behält es nur, wenn es sich Zeile für
   Zeile rein logisch lösen lässt – ohne Probieren, ohne Rückzieher. Dazu
   dient dieselbe Routine, die auch der Hinweis benutzt: für eine einzelne
   Zeile werden alle noch möglichen Belegungen aufgezählt und geschnitten.
   Was in allen gleich ist, steht fest.
*/

(() => {
  const ZEICHEN_FUELLEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="m-kugel" x="4.5" y="4.5" width="15" height="15" rx="3"/></svg>';
  const ZEICHEN_KREUZ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="m-stange" d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';

  const STUFEN = {
    klein:  { name: 'klein',  kanten: 5,  dichte: 0.60 },
    mittel: { name: 'mittel', kanten: 8,  dichte: 0.55 },
    gross:  { name: 'groß',   kanten: 10, dichte: 0.52 },
  };

  const VOLL = 1;
  const LEER = 2;
  const UNKLAR = 0;

  /* Die Hinweiszahlen einer Reihe: die Längen der gefüllten Blöcke. */
  function hinweiseVon(reihe) {
    const raus = [];
    let lauf = 0;
    for (const w of reihe) {
      if (w === VOLL) lauf += 1;
      else if (lauf) { raus.push(lauf); lauf = 0; }
    }
    if (lauf) raus.push(lauf);
    return raus.length ? raus : [0];
  }

  /* Alle Belegungen einer Reihe durchgehen, die zu den Hinweisen und zum
     bisher Bekannten passen, und schneiden: Was überall gleich ist, ist
     sicher. gefunden === 0 heißt Widerspruch. */
  function reiheFolgern(hinweise, zustand) {
    const n = zustand.length;
    const schnitt = new Array(n).fill(UNKLAR);
    let gefunden = 0;
    const bloecke = hinweise[0] === 0 ? [] : hinweise;

    const passt = (i, wert) => zustand[i] === UNKLAR || zustand[i] === wert;

    function weiter(nr, ab, bau) {
      if (nr === bloecke.length) {
        for (let i = ab; i < n; i += 1) {
          if (!passt(i, LEER)) return;
          bau[i] = LEER;
        }
        gefunden += 1;
        if (gefunden === 1) for (let i = 0; i < n; i += 1) schnitt[i] = bau[i];
        else for (let i = 0; i < n; i += 1) if (schnitt[i] !== bau[i]) schnitt[i] = UNKLAR;
        return;
      }

      // Wieviel Platz brauchen die restlichen Blöcke samt Lücken?
      let rest = 0;
      for (let k = nr; k < bloecke.length; k += 1) rest += bloecke[k];
      rest += bloecke.length - nr - 1;

      for (let start = ab; start + rest <= n; start += 1) {
        let geht = true;
        // Alles vor dem Block muss leer sein dürfen.
        for (let i = ab; i < start; i += 1) if (!passt(i, LEER)) { geht = false; break; }
        // Steht dort ein sicher gefülltes Feld, hilft auch weiter rechts nichts mehr.
        if (!geht) break;
        for (let i = start; i < start + bloecke[nr]; i += 1) if (!passt(i, VOLL)) { geht = false; break; }
        if (!geht) continue;

        const nach = start + bloecke[nr];
        const letzter = nr === bloecke.length - 1;
        if (!letzter && (nach >= n || !passt(nach, LEER))) continue;

        const bau2 = bau.slice();
        for (let i = ab; i < start; i += 1) bau2[i] = LEER;
        for (let i = start; i < nach; i += 1) bau2[i] = VOLL;
        if (!letzter) bau2[nach] = LEER;
        weiter(nr + 1, letzter ? nach : nach + 1, bau2);
      }
    }

    weiter(0, 0, new Array(n).fill(UNKLAR));
    return { schnitt, gefunden };
  }

  /* Versucht, das Rätsel allein durch Zeilen- und Spaltenschlüsse zu lösen. */
  function durchLogikLoesbar(zeilenHinweise, spaltenHinweise, k) {
    const feld = new Array(k * k).fill(UNKLAR);
    let bewegung = true;

    while (bewegung) {
      bewegung = false;

      for (let z = 0; z < k; z += 1) {
        const zustand = [];
        for (let s = 0; s < k; s += 1) zustand.push(feld[z * k + s]);
        const { schnitt, gefunden } = reiheFolgern(zeilenHinweise[z], zustand);
        if (!gefunden) return false;
        for (let s = 0; s < k; s += 1) {
          if (schnitt[s] !== UNKLAR && feld[z * k + s] === UNKLAR) {
            feld[z * k + s] = schnitt[s];
            bewegung = true;
          }
        }
      }

      for (let s = 0; s < k; s += 1) {
        const zustand = [];
        for (let z = 0; z < k; z += 1) zustand.push(feld[z * k + s]);
        const { schnitt, gefunden } = reiheFolgern(spaltenHinweise[s], zustand);
        if (!gefunden) return false;
        for (let z = 0; z < k; z += 1) {
          if (schnitt[z] !== UNKLAR && feld[z * k + s] === UNKLAR) {
            feld[z * k + s] = schnitt[z];
            bewegung = true;
          }
        }
      }
    }

    return feld.every((w) => w !== UNKLAR);
  }

  function raetselBauen(stufe) {
    const { kanten: k, dichte } = STUFEN[stufe];
    for (let versuch = 0; versuch < 400; versuch += 1) {
      const bild = Array.from({ length: k * k }, () => (Math.random() < dichte ? VOLL : LEER));
      if (!bild.includes(VOLL)) continue;

      const zeilen = [];
      const spalten = [];
      for (let z = 0; z < k; z += 1) zeilen.push(hinweiseVon(bild.slice(z * k, z * k + k)));
      for (let s = 0; s < k; s += 1) {
        const spalte = [];
        for (let z = 0; z < k; z += 1) spalte.push(bild[z * k + s]);
        spalten.push(hinweiseVon(spalte));
      }

      if (durchLogikLoesbar(zeilen, spalten, k)) return { bild, zeilen, spalten, kanten: k };
    }
    return null;
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let markierModus = false;
    let uhr = null;
    let zug = null;             // die laufende Wischbewegung
    let druckUhr = null;        // langes Drücken setzt ein Kreuz
    let cursor = 0;             // das Feld, auf dem die Pfeiltasten stehen
    let hervor = -1;            // dessen Zeile und Spalte sind hervorgehoben
    let tipp = -1;              // das Feld, von dem der Hinweis gerade spricht
    let neueBestzeit = false;
    /* Das Feld vor jeder Geste; eine Geste geht von Aufsetzen bis Loslassen. Der
       Verlauf lebt nur im Speicher, nach dem Neuladen ist der Knopf gesperrt. */
    let verlauf = [];
    let vorGeste = null;

    function frisch(stufe) {
      const r = raetselBauen(stufe) || raetselBauen('klein');
      return {
        stufe: r.kanten === STUFEN[stufe].kanten ? stufe : 'klein',
        kanten: r.kanten,
        bild: r.bild,
        zeilen: r.zeilen,
        spalten: r.spalten,
        feld: new Array(r.kanten * r.kanten).fill(UNKLAR),
        verbraucht: 0,
        seit: Date.now(),
        hilfen: 0,
        fertig: false,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.feld) && alt.kanten && !alt.fertig) {
        alt.seit = Date.now();
        return alt;
      }
      return frisch('klein');
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
    const rahmen = el('div', 'n-rahmen');
    const ecke = el('div', 'n-ecke');
    const obenKasten = el('div', 'n-oben');
    const linksKasten = el('div', 'n-links');
    const gitter = el('div', 'n-gitter');
    rahmen.append(ecke, obenKasten, linksKasten, gitter);
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    /* Zwei Hälften statt eines Schalters: Man sieht jederzeit, was der nächste
       Tipp tut. Dieselbe Bedienung wie „Aufdecken/Fahne" beim Minenfeld. */
    const modus = el('div', 'm-modus');
    modus.setAttribute('role', 'group');
    modus.setAttribute('aria-label', 'Was ein Tipp tut');
    const modusKnopf = (text, zeichen, kreuz) => {
      const b = el('button', 'm-modus-knopf');
      b.type = 'button';
      b.innerHTML = zeichen;
      b.append(document.createTextNode(text));
      b.addEventListener('click', () => { markierModus = kreuz; s.fuehlen(); zeichnen(); });
      return b;
    };
    const fuellKnopf = modusKnopf('Füllen', ZEICHEN_FUELLEN, false);
    const kreuzKnopf = modusKnopf('Kreuz', ZEICHEN_KREUZ, true);
    modus.append(fuellKnopf, kreuzKnopf);
    const leiste = el('div', 'leiste n-leiste');
    wurzel.append(kopf, rahmen, endeKasten, modus, leiste);

    const zurueckKnopf = s.leistenKnopf('Rückgängig', 'rueckgaengig', rueckgaengig);
    const leerenKnopf = s.leistenKnopf('Von vorn', 'leeren', () => {
      if (stand.fertig) return;
      alsGeste(() => { stand.feld = stand.feld.map(() => UNKLAR); });
    });
    const hinweisKnopf = s.leistenKnopf('Hinweis', 'hinweis', () => hinweis(false));
    leiste.append(zurueckKnopf, leerenKnopf, hinweisKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neues Rätsel', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    let felder = [];
    let zeilenRand = [];
    let spaltenRand = [];

    /* Die größte Zelle, bei der Zahlenrand und Gitter in Breite und Höhe passen.
       Der Rand richtet sich nach den längsten Zahlenreihen dieses Rätsels und
       ist darum nicht fest: Zahlen sollen so groß sein, wie der Platz es zulässt.
       Die Abzüge sind Kopfzeile, Zählerzeile, Moduswahl, Leiste und die Karte. */
    function masseRechnen() {
      const k = stand.kanten;
      const breit = Math.min(window.innerWidth - 28, 532) - 16;
      const hoch = window.innerHeight - 272;
      const links = Math.max(...stand.zeilen.map((h) => h.length));
      const oben = Math.max(...stand.spalten.map((h) => h.length));
      let zelle = 64;
      let schrift = 18;
      let randLinks = 0;
      let randOben = 0;
      for (; zelle >= 20; zelle -= 1) {
        schrift = Math.max(12, Math.min(19, Math.round(zelle * 0.5)));
        randLinks = Math.ceil(Math.max(links * (schrift * 0.66 + 4), schrift * 1.3) + 8);
        randOben = Math.ceil(oben * schrift * 1.12 + 6);
        if (zelle * k + randLinks <= breit && zelle * k + randOben <= hoch) break;
      }
      rahmen.style.setProperty('--kanten', String(k));
      rahmen.style.setProperty('--zelle', zelle + 'px');
      rahmen.style.setProperty('--rand', randLinks + 'px');
      rahmen.style.setProperty('--rand-oben', randOben + 'px');
      rahmen.style.setProperty('--n-schrift', schrift + 'px');
    }

    function gitterBauen() {
      const k = stand.kanten;
      masseRechnen();

      obenKasten.replaceChildren();
      spaltenRand = [];
      for (let sp = 0; sp < k; sp += 1) {
        const spalte = el('div', 'n-hinweis n-hinweis--oben');
        for (const zahl of stand.spalten[sp]) spalte.append(el('span', null, String(zahl)));
        obenKasten.append(spalte);
        spaltenRand.push(spalte);
      }

      linksKasten.replaceChildren();
      zeilenRand = [];
      for (let z = 0; z < k; z += 1) {
        const zeile = el('div', 'n-hinweis n-hinweis--links');
        for (const zahl of stand.zeilen[z]) zeile.append(el('span', null, String(zahl)));
        linksKasten.append(zeile);
        zeilenRand.push(zeile);
      }

      gitter.replaceChildren();
      felder = [];
      // Eine einzige Zählhilfe in der Mitte – halbiert die Reihe beim Abzählen.
      // Bei ungerader Kante läge sie neben der Mitte und zählte falsch vor.
      gitter.dataset.mitte = k % 2 === 0 ? 'ja' : 'nein';
      for (let i = 0; i < k * k; i += 1) {
        const f = el('button', 'n-feld');
        f.type = 'button';
        f.dataset.zeile = String(Math.floor(i / k));
        f.dataset.spalte = String(i % k);
        f.tabIndex = i === cursor ? 0 : -1;
        const nr = i;
        f.addEventListener('pointerdown', (e) => zugBeginnen(f, nr, e));
        f.addEventListener('pointerenter', () => hervorheben(nr));
        for (const art of ['pointerup', 'pointerleave', 'pointercancel']) {
          f.addEventListener(art, () => { if (!zug || zug.letzte !== nr) clearTimeout(druckUhr); });
        }
        // Das Kreuz der rechten Maustaste entsteht schon beim Drücken. Hier wird nur
        // noch das Menü unterdrückt – sonst schaltete Android, das auch einen langen
        // Druck so meldet, das eben gesetzte Kreuz gleich wieder weg.
        f.addEventListener('contextmenu', (e) => e.preventDefault());
        // Enter und Leertaste kommen als Klick ohne Zeiger an.
        f.addEventListener('click', (e) => {
          if (e.detail !== 0) return;
          alsGeste(() => setzen(nr, naechsterWert(stand.feld[nr])));
        });
        gitter.append(f);
        felder.push(f);
      }
      gitter.onpointerleave = (e) => { if (e.pointerType === 'mouse' && !zug) hervorheben(-1); };
    }

    const naechsterWert = (jetzt) => {
      const ziel = markierModus ? LEER : VOLL;
      return jetzt === ziel ? UNKLAR : ziel;
    };

    /* ------------------------------------------------------------- Wischen */

    function zugBeginnen(f, nr, e) {
      e.preventDefault();
      if (stand.fertig) return;
      // Sonst fängt der Browser den Zeiger beim Startfeld ab, und die Bewegung
      // käme nur noch dort an.
      if (e.pointerId !== undefined && f.hasPointerCapture(e.pointerId)) {
        f.releasePointerCapture(e.pointerId);
      }
      const vorher = stand.feld[nr];
      const kreuz = e.button === 2 || e.ctrlKey;
      const wert = kreuz ? (vorher === LEER ? UNKLAR : LEER) : naechsterWert(vorher);
      zug = { zeiger: e.pointerId, wert, von: vorher, start: nr, letzte: nr, achse: null };
      vorGeste = stand.feld.slice();
      tipp = -1;
      cursorSetzen(nr);
      hervor = nr;
      s.fuehlen(6);
      setzen(nr, wert);
      clearTimeout(druckUhr);
      if (kreuz || e.button) return;
      // Lange drücken heißt „das hier bleibt leer" – ohne den Modus zu wechseln.
      // Entscheidend ist das Feld vor dem Tippen: Der Tipp hat es schon verändert,
      // und aus einem Kreuz wurde sonst erst ein volles Feld und dann wieder ein
      // Kreuz. Zieht der Finger danach weiter, zieht er Kreuze.
      druckUhr = setTimeout(() => {
        const dorthin = vorher === LEER ? UNKLAR : LEER;
        s.fuehlen(20);
        setzen(nr, dorthin);
        if (zug) { zug.wert = dorthin; zug.von = vorher; }
      }, 400);
    }

    /* Beim Wischen zählt nur die Reihe, in der es losging: Der Finger trifft nie
       genau die Linie, und ein Feld in der Nachbarreihe wäre sofort falsch. Aus
       den Koordinaten statt aus dem Element darunter gerechnet, damit auch ein
       Finger über dem Rand die Reihe noch zu Ende führt. */
    function feldUnter(p) {
      const k = stand.kanten;
      const r = gitter.getBoundingClientRect();
      const grenze = (w) => Math.max(0, Math.min(k - 1, Math.floor(w)));
      return grenze((p.clientY - r.top) / (r.height / k)) * k + grenze((p.clientX - r.left) / (r.width / k));
    }

    function weiterZiehen(i) {
      // Ein Finger zittert auch im Startfeld. Das darf die Richtung noch nicht festlegen.
      if (i === zug.letzte) return;
      const k = stand.kanten;
      const z1 = Math.floor(zug.start / k);
      const s1 = zug.start % k;
      if (!zug.achse) zug.achse = Math.abs((i % k) - s1) >= Math.abs(Math.floor(i / k) - z1) ? 'zeile' : 'spalte';
      const ziel = zug.achse === 'zeile' ? z1 * k + (i % k) : Math.floor(i / k) * k + s1;
      if (ziel === zug.letzte) return;
      clearTimeout(druckUhr);
      // Wer schnell wischt, überspringt Felder; sie werden nachgeholt.
      const schritt = zug.achse === 'zeile' ? Math.sign(ziel - zug.letzte) : Math.sign(ziel - zug.letzte) * k;
      for (let j = zug.letzte + schritt; ; j += schritt) {
        ueberstreichen(j);
        if (j === ziel) break;
      }
      zug.letzte = ziel;
      hervorheben(ziel);
    }

    /* Wischen füllt nur, was noch frei ist, und räumt nur, was so aussah wie das
       erste Feld. So schluckt ein Strich keine Kreuze, die man sich erarbeitet hat. */
    function ueberstreichen(j) {
      const jetzt = stand.feld[j];
      if (zug.wert === UNKLAR ? jetzt === zug.von : jetzt === UNKLAR) {
        s.fuehlen(4);
        setzen(j, zug.wert);
      }
    }

    const beiBewegung = (e) => {
      if (!zug || e.pointerId !== zug.zeiger) return;
      // Der Browser fasst schnelle Bewegungen zu einer Meldung zusammen.
      const punkte = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      for (const p of punkte.length ? punkte : [e]) {
        if (!zug) return;
        weiterZiehen(feldUnter(p));
      }
    };

    const loslassen = () => {
      clearTimeout(druckUhr);
      if (!zug && !vorGeste) return;
      zug = null;
      gesteEnde();
      zeichnen();
    };
    window.addEventListener('pointermove', beiBewegung);
    window.addEventListener('pointerup', loslassen);
    window.addEventListener('pointercancel', loslassen);

    /* ------------------------------------------------------------ Verlauf */

    const gleichesFeld = (a, b) => a.every((w, i) => w === b[i]);

    function gesteEnde() {
      if (vorGeste && !gleichesFeld(vorGeste, stand.feld)) {
        verlauf.push(vorGeste);
        if (verlauf.length > 200) verlauf.shift();
      }
      vorGeste = null;
    }

    function alsGeste(tun) {
      vorGeste = stand.feld.slice();
      tipp = -1;
      tun();
      gesteEnde();
      sichern();
      zeichnen();
      pruefenObFertig();
    }

    function rueckgaengig() {
      if (stand.fertig || !verlauf.length) return;
      stand.feld = verlauf.pop();
      tipp = -1;
      s.fuehlen();
      sichern();
      zeichnen();
    }

    function hervorheben(i) {
      if (hervor === i) return;
      hervor = i;
      reihenZeichnen();
    }

    /* Nur ein Feld steht in der Tab-Reihenfolge, sonst bräuchte man bis zu 100
       Tabs, um an dem Brett vorbeizukommen. */
    function cursorSetzen(i) {
      if (felder[cursor]) felder[cursor].tabIndex = -1;
      cursor = i;
      if (felder[cursor]) felder[cursor].tabIndex = 0;
    }

    const PFEILE = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    function beiTaste(e) {
      if (!document.getElementById('sheet-spiel').hidden || stand.fertig) return;
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'z') { e.preventDefault(); rueckgaengig(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') { e.preventDefault(); rueckgaengig(); return; }
      const aufBrett = felder.includes(document.activeElement);
      const pfeil = PFEILE[e.key];
      if (pfeil) {
        e.preventDefault();
        const k = stand.kanten;
        if (aufBrett) {
          const z = Math.floor(cursor / k) + pfeil[0];
          const sp = (cursor % k) + pfeil[1];
          if (z >= 0 && sp >= 0 && z < k && sp < k) cursorSetzen(z * k + sp);
        }
        felder[cursor].focus();
        hervorheben(cursor);
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        if (aufBrett) alsGeste(() => setzen(cursor, stand.feld[cursor] === LEER ? UNKLAR : LEER));
        else { markierModus = !markierModus; zeichnen(); }
      }
    }
    window.addEventListener('keydown', beiTaste);

    /* ---------------------------------------------------------------- Zug */

    function setzen(i, wert) {
      if (stand.fertig || stand.feld[i] === wert) return;
      stand.feld[i] = wert;
      sichern();
      zeichnen();
      pruefenObFertig();
    }

    /* Der Hinweis sucht ein Feld, das sich aus einer einzigen Zeile oder
       Spalte zwingend ergibt – und sagt, aus welcher. */
    function hinweis(trotzFehler) {
      if (stand.fertig) return;
      const k = stand.kanten;

      const bekannt = stand.feld.map((w, i) => {
        // Falsch gesetzte Felder würden den Schluss vergiften: erst prüfen.
        if (w === VOLL && stand.bild[i] !== VOLL) return UNKLAR;
        if (w === LEER && stand.bild[i] !== LEER) return UNKLAR;
        return w;
      });

      const falsch = stand.feld.some((w, i) => w !== UNKLAR && w !== stand.bild[i]);
      /* Erst die Warnung, der Hinweis nur auf Wunsch. Vorher öffnete sich
         gleich danach das Hinweisblatt und überdeckte die Warnung, bevor
         jemand sie lesen konnte. */
      if (falsch && !trotzFehler) {
        s.blatt({
          titel: 'Da stimmt etwas nicht',
          inhalt: 'Mindestens ein Feld widerspricht den Zahlen am Rand. Ein Hinweis blendet die falschen Angaben aus – besser ist, die Zeilen erst noch einmal durchzugehen.',
          aktionen: [
            { text: 'Selbst suchen' },
            { text: 'Hinweis trotzdem', art: 'still', tun: () => hinweis(true) },
          ],
        });
        return undefined;
      }

      for (let z = 0; z < k; z += 1) {
        const zustand = [];
        for (let sp = 0; sp < k; sp += 1) zustand.push(bekannt[z * k + sp]);
        const { schnitt } = reiheFolgern(stand.zeilen[z], zustand);
        for (let sp = 0; sp < k; sp += 1) {
          if (schnitt[sp] !== UNKLAR && stand.feld[z * k + sp] === UNKLAR) {
            return hinweisZeigen(z * k + sp, schnitt[sp], 'Zeile ' + (z + 1));
          }
        }
      }
      for (let sp = 0; sp < k; sp += 1) {
        const zustand = [];
        for (let z = 0; z < k; z += 1) zustand.push(bekannt[z * k + sp]);
        const { schnitt } = reiheFolgern(stand.spalten[sp], zustand);
        for (let z = 0; z < k; z += 1) {
          if (schnitt[z] !== UNKLAR && stand.feld[z * k + sp] === UNKLAR) {
            return hinweisZeigen(z * k + sp, schnitt[z], 'Spalte ' + (sp + 1));
          }
        }
      }
      return undefined;
    }

    function hinweisZeigen(i, wert, woher) {
      stand.hilfen += 1;
      // Im Gitter zeigen, wovon die Rede ist: Zeile 7, Spalte 4 müsste man sonst abzählen.
      tipp = i;
      hervor = i;
      zeichnen();
      const z = Math.floor(i / stand.kanten) + 1;
      const sp = (i % stand.kanten) + 1;
      s.blatt({
        titel: wert === VOLL ? 'Dieses Feld ist voll' : 'Dieses Feld bleibt leer',
        inhalt: 'Allein aus ' + woher + ' folgt: Zeile ' + z + ', Spalte ' + sp + ' muss '
          + (wert === VOLL ? 'gefüllt' : 'leer') + ' sein. Alle Anordnungen, die zu den Zahlen '
          + 'dieser Reihe passen, sind sich an dieser Stelle einig.',
        aktionen: [
          { text: 'Eintragen', tun: () => alsGeste(() => setzen(i, wert)) },
          { text: 'Selbst machen', art: 'still' },
        ],
      });
      sichern();
    }

    function pruefenObFertig() {
      if (stand.fertig) return;
      for (let i = 0; i < stand.bild.length; i += 1) {
        const soll = stand.bild[i] === VOLL;
        const ist = stand.feld[i] === VOLL;
        if (soll !== ist) return;
      }
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

    /* Stimmen die Blöcke einer Reihe mit ihren Zahlen überein? Gezählt, nicht
       nachgeschlagen: Auch ein Block an der falschen Stelle erfüllt die Zahl, so
       wie man es selbst auf dem Papier sähe. */
    function reiheErfuellt(werte, hinweise) {
      const ist = hinweiseVon(werte);
      return ist.length === hinweise.length && ist.every((w, i) => w === hinweise[i]);
    }

    /* Trennt das Hervorheben vom Zeichnen, weil es bei jeder Mausbewegung kommt. */
    function reihenZeichnen() {
      const k = stand.kanten;
      const hz = hervor >= 0 && !stand.fertig ? Math.floor(hervor / k) : -1;
      const hs = hervor >= 0 && !stand.fertig ? hervor % k : -1;
      zeilenRand.forEach((r, z) => { r.dataset.hervor = z === hz ? 'ja' : 'nein'; });
      spaltenRand.forEach((r, sp) => { r.dataset.hervor = sp === hs ? 'ja' : 'nein'; });
      for (let i = 0; i < felder.length; i += 1) {
        felder[i].dataset.reihe = Math.floor(i / k) === hz || i % k === hs ? 'ja' : 'nein';
      }
    }

    function zeichnen() {
      const k = stand.kanten;
      for (let i = 0; i < felder.length; i += 1) {
        const w = stand.fertig ? stand.bild[i] : stand.feld[i];
        felder[i].dataset.stand = w === VOLL ? 'voll' : w === LEER ? 'leer' : 'offen';
        felder[i].textContent = !stand.fertig && w === LEER ? '×' : '';
        felder[i].dataset.tipp = i === tipp ? 'ja' : 'nein';
      }
      for (let z = 0; z < k; z += 1) {
        const werte = stand.feld.slice(z * k, z * k + k);
        zeilenRand[z].dataset.erfuellt = reiheErfuellt(werte, stand.zeilen[z]) ? 'ja' : 'nein';
      }
      for (let sp = 0; sp < k; sp += 1) {
        const werte = stand.feld.filter((_, i) => i % k === sp);
        spaltenRand[sp].dataset.erfuellt = reiheErfuellt(werte, stand.spalten[sp]) ? 'ja' : 'nein';
      }
      reihenZeichnen();
      fuellKnopf.setAttribute('aria-pressed', markierModus ? 'false' : 'true');
      kreuzKnopf.setAttribute('aria-pressed', markierModus ? 'true' : 'false');
      gitter.dataset.fertig = stand.fertig ? 'ja' : 'nein';
      hinweisKnopf.disabled = stand.fertig;
      zurueckKnopf.disabled = !verlauf.length;
      leerenKnopf.disabled = stand.feld.every((w) => w === UNKLAR);
      kopfZeichnen();
      endeZeichnen();
      modus.hidden = stand.fertig;
      leiste.hidden = stand.fertig;
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      const gesetzt = stand.feld.filter((w) => w === VOLL).length;
      const noetig = stand.bild.filter((w) => w === VOLL).length;
      kopf.append(s.stufenName(STUFEN, stand.stufe));
      const zeit = el('span', null, '');
      zeit.append(el('b', null, s.dauerText(zeitJetzt()) === '–' ? '0 s' : s.dauerText(zeitJetzt())));
      kopf.append(zeit);
      kopf.append(el('span', null, gesetzt + '/' + noetig + ' gefüllt'));
      s.unter(stand.kanten + ' × ' + stand.kanten);
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !stand.fertig;
      if (!stand.fertig) return;
      endeKasten.append(s.bildzeichen('fertig'));
      endeKasten.append(el('p', 'ende-titel', 'Bild fertig.'));
      if (neueBestzeit) endeKasten.append(el('span', 'ende-marke', 'Neue Bestzeit'));
      endeKasten.append(el('p', 'notiz',
        STUFEN[stand.stufe].name + ' · ' + s.dauerText(stand.verbraucht)
        + (stand.hilfen ? ' · ' + stand.hilfen + (stand.hilfen === 1 ? ' Hinweis' : ' Hinweise') : ' · ohne Hinweis')));
      endeKasten.append(s.stufenLeiste(STUFEN, stand.stufe, neu));
    }

    function neu(stufe) {
      stand = frisch(stufe);
      verlauf = [];
      neueBestzeit = false;
      tipp = -1;
      hervor = -1;
      cursor = 0;
      gitterBauen();
      sichern();
      zeichnen();
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neues Rätsel',
        inhalt: 'Klein ist 5 × 5, mittel 8 × 8, groß 10 × 10. Jedes Rätsel lässt sich rein logisch lösen – geraten werden muss nie.',
        aktionen: s.stufenAktionen(STUFEN, neu),
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Die Zahlen am Rand sagen, wie viele Felder in dieser Zeile oder Spalte am Stück gefüllt sind – in genau dieser Reihenfolge, mit mindestens einer Lücke dazwischen.'));
      d.append(el('p', 'notiz', '„3 1" in einer Zeile mit acht Feldern heißt also: erst drei gefüllte am Stück, dann irgendwo danach noch ein einzelnes. Eine 0 bedeutet: diese Reihe bleibt ganz leer.'));
      d.append(el('p', 'notiz', 'Tippen füllt ein Feld, nochmal tippen macht es wieder frei. Wischen füllt eine ganze Strecke in der Reihe, in der es losging, und lässt dabei gesetzte Kreuze stehen.'));
      d.append(el('p', 'notiz', 'Für „das bleibt bestimmt leer" gibt es drei Wege: unter dem Brett auf „Kreuz" umschalten, lange auf ein Feld drücken, oder am Rechner rechts klicken. Nochmal dasselbe nimmt das Kreuz wieder weg. Lange drücken und weiterziehen zieht Kreuze.'));
      d.append(el('p', 'notiz', 'Passen die Blöcke einer Reihe zu ihren Zahlen, werden die Zahlen blass. Das heißt nur: Sie sind gezählt. Ob sie an der richtigen Stelle stehen, sagt erst das fertige Bild. „Rückgängig" nimmt die letzte Bewegung zurück, auch „Von vorn".'));
      d.append(el('p', 'notiz', 'Am Rechner: Pfeile wandern übers Brett, Enter füllt, X setzt ein Kreuz, Rücktaste nimmt zurück.'));
      d.append(el('p', 'notiz', 'Die Kreuze sind der eigentliche Trick – erst sie machen sichtbar, wo die vollen Felder liegen müssen.'));
      d.append(el('p', 'notiz', 'Anfangen lohnt sich bei den größten Zahlen – bei einer 8 in einer 10er-Zeile liegen die mittleren sechs Felder in jedem Fall fest, egal wie weit der Block rutscht.'));
      s.blatt({ titel: 'Nonogramm', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function beiGroesse() { masseRechnen(); }
    window.addEventListener('resize', beiGroesse);

    gitterBauen();
    sichern();
    zeichnen();
    uhr = setInterval(() => { if (!stand.fertig) kopfZeichnen(); }, 1000);

    return {
      ende: () => {
        clearInterval(uhr);
        clearTimeout(druckUhr);
        window.removeEventListener('resize', beiGroesse);
        window.removeEventListener('pointermove', beiBewegung);
        window.removeEventListener('pointerup', loslassen);
        window.removeEventListener('pointercancel', loslassen);
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
      { wert: bestzeit('klein'), label: 'Bestzeit klein' },
      { wert: bestzeit('mittel'), label: 'Bestzeit mittel' },
      { wert: bestzeit('gross'), label: 'Bestzeit groß' },
    ];
  }

  Rahmen.anmelden({
    id: 'nonogramm',
    name: 'Nonogramm',
    gruppe: 'raetsel',
    unter: 'Aus Zahlen wird ein Bild.',
    farbe: '#2E8B8B',
    symbol: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none"/>',
    starten,
    auswertung,
  });
})();
