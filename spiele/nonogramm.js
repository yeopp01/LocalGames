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
    let ziehen = null;          // beim Wischen über mehrere Felder
    let druckUhr = null;        // langes Drücken setzt ein Kreuz

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
    const leiste = el('div', 'leiste');
    wurzel.append(kopf, rahmen, endeKasten, leiste);

    const markierKnopf = el('button', 'knopf knopf--still', 'Kreuze setzen');
    markierKnopf.type = 'button';
    markierKnopf.addEventListener('click', () => { markierModus = !markierModus; zeichnen(); });
    const hinweisKnopf = el('button', 'knopf knopf--still', 'Hinweis');
    hinweisKnopf.type = 'button';
    hinweisKnopf.addEventListener('click', hinweis);
    leiste.append(markierKnopf, hinweisKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neues Rätsel', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    let felder = [];

    function gitterBauen() {
      const k = stand.kanten;
      rahmen.style.setProperty('--kanten', String(k));

      const platz = Math.min(360, window.innerWidth - 30);
      const hinweisBreite = Math.max(34, Math.round(platz * 0.22));
      const zelle = Math.max(18, Math.floor((platz - hinweisBreite) / k));
      rahmen.style.setProperty('--zelle', zelle + 'px');
      rahmen.style.setProperty('--rand', hinweisBreite + 'px');

      obenKasten.replaceChildren();
      for (let sp = 0; sp < k; sp += 1) {
        const spalte = el('div', 'n-hinweis n-hinweis--oben');
        for (const zahl of stand.spalten[sp]) spalte.append(el('span', null, String(zahl)));
        obenKasten.append(spalte);
      }

      linksKasten.replaceChildren();
      for (let z = 0; z < k; z += 1) {
        const zeile = el('div', 'n-hinweis n-hinweis--links');
        for (const zahl of stand.zeilen[z]) zeile.append(el('span', null, String(zahl)));
        linksKasten.append(zeile);
      }

      gitter.replaceChildren();
      felder = [];
      const mitte = Math.floor(k / 2) - 1;
      for (let i = 0; i < k * k; i += 1) {
        const f = el('button', 'n-feld');
        f.type = 'button';
        const zeile = Math.floor(i / k);
        const spalte = i % k;
        f.dataset.zeile = String(zeile);
        f.dataset.spalte = String(spalte);
        // Eine einzige Zählhilfe in der Mitte – halbiert die Reihe beim Abzählen.
        if (spalte === mitte) f.classList.add('n-feld--raster-x');
        if (zeile === mitte) f.classList.add('n-feld--raster-y');
        const nr = i;
        f.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          // Sonst fängt der Browser den Zeiger beim Startfeld ab, und die
          // Nachbarn bekommen beim Wischen kein pointerenter mehr.
          if (e.pointerId !== undefined && f.hasPointerCapture(e.pointerId)) {
            f.releasePointerCapture(e.pointerId);
          }
          const neuerWert = naechsterWert(stand.feld[nr]);
          ziehen = neuerWert;
          setzen(nr, neuerWert);
          // Lange drücken heißt „das hier bleibt leer" – ohne den Modus zu wechseln.
          clearTimeout(druckUhr);
          druckUhr = setTimeout(() => {
            ziehen = null;
            setzen(nr, stand.feld[nr] === LEER ? UNKLAR : LEER);
          }, 400);
        });
        f.addEventListener('pointerenter', () => {
          clearTimeout(druckUhr);
          if (ziehen !== null) setzen(nr, ziehen);
        });
        for (const art of ['pointerup', 'pointerleave', 'pointercancel']) {
          f.addEventListener(art, () => clearTimeout(druckUhr));
        }
        // Am Rechner setzt die rechte Maustaste das Kreuz.
        f.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          setzen(nr, stand.feld[nr] === LEER ? UNKLAR : LEER);
        });
        gitter.append(f);
        felder.push(f);
      }
    }

    const naechsterWert = (jetzt) => {
      const ziel = markierModus ? LEER : VOLL;
      return jetzt === ziel ? UNKLAR : ziel;
    };

    window.addEventListener('pointerup', () => { ziehen = null; });

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
    function hinweis() {
      if (stand.fertig) return;
      const k = stand.kanten;

      const bekannt = stand.feld.map((w, i) => {
        // Falsch gesetzte Felder würden den Schluss vergiften: erst prüfen.
        if (w === VOLL && stand.bild[i] !== VOLL) return UNKLAR;
        if (w === LEER && stand.bild[i] !== LEER) return UNKLAR;
        return w;
      });

      const falsch = stand.feld.some((w, i) => w !== UNKLAR && w !== stand.bild[i]);
      if (falsch) {
        s.blatt({
          titel: 'Da stimmt etwas nicht',
          inhalt: 'Mindestens ein Feld widerspricht den Zahlen am Rand. Ich habe die falschen Angaben für diesen Hinweis ausgeblendet – geh die Zeilen noch einmal durch.',
          aktionen: [{ text: 'Weiter' }],
        });
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
      const z = Math.floor(i / stand.kanten) + 1;
      const sp = (i % stand.kanten) + 1;
      s.blatt({
        titel: wert === VOLL ? 'Dieses Feld ist voll' : 'Dieses Feld bleibt leer',
        inhalt: 'Allein aus ' + woher + ' folgt: Zeile ' + z + ', Spalte ' + sp + ' muss '
          + (wert === VOLL ? 'gefüllt' : 'leer') + ' sein. Alle Anordnungen, die zu den Zahlen '
          + 'dieser Reihe passen, sind sich an dieser Stelle einig.',
        aktionen: [
          { text: 'Eintragen', tun: () => setzen(i, wert) },
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
      s.notieren({
        gewonnen: true,
        dauer: stand.verbraucht,
        stufe: stand.stufe,
        hilfen: stand.hilfen,
      });
      s.merken(stand);
      zeichnen();
    }

    /* ------------------------------------------------------------ Zeichnen */

    function zeichnen() {
      for (let i = 0; i < felder.length; i += 1) {
        const w = stand.fertig ? stand.bild[i] : stand.feld[i];
        felder[i].dataset.stand = w === VOLL ? 'voll' : w === LEER ? 'leer' : 'offen';
        felder[i].textContent = !stand.fertig && w === LEER ? '×' : '';
      }
      markierKnopf.className = 'knopf ' + (markierModus ? 'knopf--voll' : 'knopf--still');
      hinweisKnopf.disabled = stand.fertig;
      kopfZeichnen();
      endeZeichnen();
      leiste.hidden = stand.fertig;
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      const gesetzt = stand.feld.filter((w) => w === VOLL).length;
      const noetig = stand.bild.filter((w) => w === VOLL).length;
      kopf.append(el('span', null, STUFEN[stand.stufe].name));
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
      endeKasten.append(el('p', 'ende-titel', 'Bild fertig.'));
      endeKasten.append(el('p', 'notiz',
        STUFEN[stand.stufe].name + ' · ' + s.dauerText(stand.verbraucht)
        + (stand.hilfen ? ' · ' + stand.hilfen + ' Hinweise' : ' · ohne Hinweis')));
      const l = el('div', 'leiste');
      for (const stufe of Object.keys(STUFEN)) {
        const b = el('button', 'knopf ' + (stufe === stand.stufe ? 'knopf--voll' : 'knopf--still'),
          'Neu, ' + STUFEN[stufe].name);
        b.type = 'button';
        b.addEventListener('click', () => neu(stufe));
        l.append(b);
      }
      endeKasten.append(l);
    }

    function neu(stufe) {
      stand = frisch(stufe);
      gitterBauen();
      sichern();
      zeichnen();
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neues Rätsel',
        inhalt: 'Klein ist 5 × 5, mittel 8 × 8, groß 10 × 10. Jedes Rätsel lässt sich rein logisch lösen – geraten werden muss nie.',
        aktionen: [
          { text: 'Klein', tun: () => neu('klein') },
          { text: 'Mittel', art: 'still', tun: () => neu('mittel') },
          { text: 'Groß', art: 'still', tun: () => neu('gross') },
        ],
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Die Zahlen am Rand sagen, wie viele Felder in dieser Zeile oder Spalte am Stück gefüllt sind – in genau dieser Reihenfolge, mit mindestens einer Lücke dazwischen.'));
      d.append(el('p', 'notiz', '„3 1" in einer Zeile mit acht Feldern heißt also: erst drei gefüllte am Stück, dann irgendwo danach noch ein einzelnes. Eine 0 bedeutet: diese Reihe bleibt ganz leer.'));
      d.append(el('p', 'notiz', 'Tippen füllt ein Feld, nochmal tippen macht es wieder frei. Über mehrere Felder zu wischen füllt sie alle.'));
      d.append(el('p', 'notiz', 'Für „das bleibt bestimmt leer" gibt es drei Wege: den Knopf „Kreuze setzen" einschalten, lange auf ein Feld drücken, oder am Rechner rechts klicken. Nochmal dasselbe nimmt das Kreuz wieder weg.'));
      d.append(el('p', 'notiz', 'Die Kreuze sind der eigentliche Trick – erst sie machen sichtbar, wo die vollen Felder liegen müssen.'));
      d.append(el('p', 'notiz', 'Anfangen lohnt sich bei den größten Zahlen – bei einer 8 in einer 10er-Zeile liegen die mittleren sechs Felder in jedem Fall fest, egal wie weit der Block rutscht.'));
      s.blatt({ titel: 'Nonogramm', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function beiGroesse() { gitterBauen(); zeichnen(); }
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
    unter: 'Aus Zahlen wird ein Bild.',
    farbe: '#2E8B8B',
    symbol: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none"/>',
    starten,
    auswertung,
  });
})();
