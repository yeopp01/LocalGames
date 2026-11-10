/* Damen – nach dem Vorbild von Queens.

   In jede Zeile, jede Spalte und jedes Farbgebiet gehört genau eine Dame.
   Zwei Damen dürfen sich nicht berühren, auch nicht über Eck. Anders als im
   Schach schlagen sie sich nicht über die ganze Diagonale – nur die acht
   direkten Nachbarfelder sind tabu.

   Der Generator setzt erst die Damen, lässt dann von jeder Dame aus ein
   Farbgebiet wachsen und prüft, ob die Aufgabe damit eindeutig ist. Danach
   muss sie noch eine zweite Hürde nehmen: Sie muss sich Schritt für Schritt
   herleiten lassen, ohne dass man irgendwo probieren müsste. Womit, steht bei
   ohneRatenLoesbar.
*/

(() => {
  const STUFEN = {
    leicht: { name: 'leicht', kanten: 6 },
    mittel: { name: 'mittel', kanten: 7 },
    schwer: { name: 'schwer', kanten: 8 },
  };

  const LEER = 0;
  const KREUZ = 1;
  const DAME = 2;

  /* Genug Farben für die größte Stufe, in Reihenfolge gut unterscheidbar. Die
     Töne selbst stehen in styles.css: hell und dunkel brauchen andere. */
  const FARBEN = [0, 1, 2, 3, 4, 5, 6, 7].map((n) => 'var(--q-g' + n + ')');

  /* Dame und Kreuz werden gezeichnet: ♛ kommt je nach Gerät in anderer Größe,
     dünn oder als Emoji, und auf einer Farbe muss es sofort zu lesen sein. */
  const DAME_BILD = '<svg class="q-bild q-bild--dame" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
    + '<path d="M5.2 17.6h13.6L21 7.8l-5.2 3.8L12 4.6l-3.8 7L3 7.8z"/><path d="M5.6 21h12.8"/></svg>';
  const KREUZ_BILD = '<svg class="q-bild q-bild--kreuz" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
    + '<path d="M5 5l14 14M19 5L5 19"/></svg>';

  const mischen = (feld) => {
    for (let i = feld.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [feld[i], feld[j]] = [feld[j], feld[i]];
    }
    return feld;
  };

  /* Eine Damenstellung: je Zeile eine Spalte, benachbarte Zeilen mindestens
     zwei Spalten auseinander. */
  function stellungSuchen(k) {
    const spalten = new Array(k).fill(-1);
    const benutzt = new Set();

    const weiter = (z) => {
      if (z === k) return true;
      for (const s of mischen([...Array(k).keys()])) {
        if (benutzt.has(s)) continue;
        if (z > 0 && Math.abs(spalten[z - 1] - s) <= 1) continue;
        spalten[z] = s;
        benutzt.add(s);
        if (weiter(z + 1)) return true;
        benutzt.delete(s);
        spalten[z] = -1;
      }
      return false;
    };
    return weiter(0) ? spalten : null;
  }

  /* Von jeder Dame aus ein Gebiet wachsen lassen, bis das Brett voll ist. */
  function gebieteWachsen(k, damen) {
    const gebiet = new Array(k * k).fill(-1);
    const raender = damen.map((s, z) => {
      gebiet[z * k + s] = z;
      return [z * k + s];
    });

    let offen = k * k - k;
    while (offen > 0) {
      let bewegung = false;
      for (const nr of mischen([...Array(k).keys()])) {
        const rand = raender[nr];
        if (!rand.length) continue;
        const auswahl = rand[Math.floor(Math.random() * rand.length)];
        const z = Math.floor(auswahl / k);
        const s = auswahl % k;
        const nachbarn = mischen([[z - 1, s], [z + 1, s], [z, s - 1], [z, s + 1]]);
        let gesetzt = false;
        for (const [nz, ns] of nachbarn) {
          if (nz < 0 || ns < 0 || nz >= k || ns >= k) continue;
          const i = nz * k + ns;
          if (gebiet[i] !== -1) continue;
          gebiet[i] = nr;
          rand.push(i);
          offen -= 1;
          gesetzt = true;
          bewegung = true;
          break;
        }
        if (!gesetzt) rand.splice(rand.indexOf(auswahl), 1);
      }
      // Nur aufgeben, wenn wirklich kein Gebiet mehr wachsen kann. Früher genügte
      // eine Runde, in der zufällig jedes Gebiet ein zugebautes Randfeld zog –
      // auf 8 × 8 verwarf das mehr als die Hälfte aller Anläufe.
      if (!bewegung && !raender.some((r) => r.length)) return null;
    }
    return gebiet;
  }

  /* Zählt Lösungen, hört bei der zweiten auf. */
  function loesungen(k, gebiet) {
    let gefunden = 0;
    const spalten = new Set();
    const gebiete = new Set();
    const gesetzt = [];

    const weiter = (z) => {
      if (gefunden > 1) return;
      if (z === k) { gefunden += 1; return; }
      for (let s = 0; s < k; s += 1) {
        if (spalten.has(s)) continue;
        const g = gebiet[z * k + s];
        if (gebiete.has(g)) continue;
        if (z > 0 && Math.abs(gesetzt[z - 1] - s) <= 1) continue;
        spalten.add(s); gebiete.add(g); gesetzt[z] = s;
        weiter(z + 1);
        spalten.delete(s); gebiete.delete(g); gesetzt[z] = -1;
        if (gefunden > 1) return;
      }
    };
    weiter(0);
    return gefunden;
  }

  /* Irgendeine Lösung, die nicht die gesuchte ist – oder null. */
  function andereLoesung(k, gebiet, damen) {
    const spalten = new Set();
    const gebiete = new Set();
    const gesetzt = [];
    let treffer = null;

    const weiter = (z) => {
      if (treffer) return;
      if (z === k) {
        if (gesetzt.some((s, i) => s !== damen[i])) treffer = gesetzt.slice();
        return;
      }
      for (let s = 0; s < k; s += 1) {
        if (spalten.has(s)) continue;
        const g = gebiet[z * k + s];
        if (gebiete.has(g)) continue;
        if (z > 0 && Math.abs(gesetzt[z - 1] - s) <= 1) continue;
        spalten.add(s); gebiete.add(g); gesetzt[z] = s;
        weiter(z + 1);
        spalten.delete(s); gebiete.delete(g);
        if (treffer) return;
      }
    };
    weiter(0);
    return treffer;
  }

  /* Bleibt das Gebiet zusammenhängend, wenn diese Zelle es verlässt? */
  function bleibtHeil(gebiet, zelle, k) {
    const nr = gebiet[zelle];
    const rest = [];
    for (let i = 0; i < k * k; i += 1) if (i !== zelle && gebiet[i] === nr) rest.push(i);
    if (!rest.length) return false;

    const gesehen = new Set([rest[0]]);
    const stapel = [rest[0]];
    while (stapel.length) {
      const i = stapel.pop();
      for (const j of nachbarnVon(i, k)) {
        if (j === zelle || gebiet[j] !== nr || gesehen.has(j)) continue;
        gesehen.add(j);
        stapel.push(j);
      }
    }
    return gesehen.size === rest.length;
  }

  const nachbarnVon = (i, k) => {
    const z = Math.floor(i / k);
    const s = i % k;
    const raus = [];
    if (z > 0) raus.push(i - k);
    if (z < k - 1) raus.push(i + k);
    if (s > 0) raus.push(i - 1);
    if (s < k - 1) raus.push(i + 1);
    return raus;
  };

  /* Zufällig gewachsene Gebiete sind fast nie eindeutig lösbar. Statt neu zu
     würfeln, wird nachgeschärft: Zu jeder unerwünschten zweiten Lösung wird
     eine ihrer Damenzellen in ein Nachbargebiet umgehängt, das diese Lösung
     dann doppelt belegt – die echte Lösung bleibt davon unberührt. */
  function eindeutigMachen(k, gebiet, damen) {
    // Wer eindeutig wird, schafft das gemessen in höchstens gut 50 Runden;
    // was länger braucht, dreht sich im Kreis und kostet nur Zeit.
    for (let runde = 0; runde < 80; runde += 1) {
      const alt = andereLoesung(k, gebiet, damen);
      if (!alt) return true;

      let geaendert = false;
      const zeilen = mischen([...Array(k).keys()].filter((z) => alt[z] !== damen[z]));

      for (const z of zeilen) {
        const zelle = z * k + alt[z];
        if (alt[z] === damen[z]) continue;

        for (const n of mischen(nachbarnVon(zelle, k))) {
          const ziel = gebiet[n];
          if (ziel === gebiet[zelle]) continue;
          // Nur sinnvoll, wenn die zweite Lösung dieses Gebiet schon benutzt.
          const belegt = [...Array(k).keys()].some((z2) => z2 !== z && gebiet[z2 * k + alt[z2]] === ziel);
          if (!belegt) continue;
          if (!bleibtHeil(gebiet, zelle, k)) continue;

          gebiet[zelle] = ziel;
          geaendert = true;
          break;
        }
        if (geaendert) break;
      }
      if (!geaendert) return false;
    }
    return false;
  }

  /* Der Prüfer für „ohne Raten lösbar“. Er kennt genau die beiden Schlüsse,
     die auch der Hinweis anbietet, und wendet sie an, bis sich nichts mehr
     rührt (Constraint-Propagation bis zum Fixpunkt):

       1. Einziger Platz: Bleibt in einer Zeile, Spalte oder Farbe nur noch
          ein mögliches Feld, steht dort die Dame.
       2. Gemeinsame Abdeckung: Wird ein Feld von JEDEM noch möglichen Platz
          einer Einheit abgedeckt, kann dort keine Dame stehen. Daraus fallen
          die geläufigen Fälle von selbst ab – eine Farbe, die ganz in einer
          Zeile liegt, räumt diese Zeile, und umgekehrt.

     Bleibt der Kessel stehen, bevor alle k Damen stehen, käme man nur noch
     durchs Probieren weiter – so ein Rätsel lassen wir gar nicht erst zu.

     Weil jeder Schluss zwingend ist, heißt „bis zur letzten Dame“ zugleich
     „genau eine Lösung“. Zurück kommt außerdem, wie weit er gekommen ist:
     daran richtet sich nachhelfen aus. */
  function herleiten(k, gebiet) {
    const geht = new Array(k * k).fill(true);
    const damen = [];

    const deckt = (p, x) => {
      if (p === x) return false;
      const pz = Math.floor(p / k); const ps = p % k;
      const xz = Math.floor(x / k); const xs = x % k;
      return pz === xz || ps === xs || gebiet[p] === gebiet[x]
        || (Math.abs(pz - xz) <= 1 && Math.abs(ps - xs) <= 1);
    };

    const setzen = (d) => {
      damen.push(d);
      for (let x = 0; x < k * k; x += 1) if (x === d || deckt(d, x)) geht[x] = false;
    };

    /* Zeilen, Spalten und Farben – die Einheiten, in die je eine Dame gehört. */
    const einheiten = [];
    for (let z = 0; z < k; z += 1) einheiten.push((i) => Math.floor(i / k) === z);
    for (let sp = 0; sp < k; sp += 1) einheiten.push((i) => i % k === sp);
    for (const g of new Set(gebiet)) einheiten.push((i) => gebiet[i] === g);

    const felderVon = (pruef) => {
      const raus = [];
      for (let i = 0; i < k * k; i += 1) if (geht[i] && pruef(i)) raus.push(i);
      return raus;
    };

    const ergebnis = (fertig) => {
      let raus = 0;
      for (let i = 0; i < k * k; i += 1) if (!geht[i]) raus += 1;
      // Eine Dame wiegt mehr als jedes Kreuz – sie räumt ohnehin mehrere Felder.
      return { fertig, wert: fertig ? Infinity : damen.length * k * k + raus, geht };
    };

    while (damen.length < k) {
      let bewegung = false;

      for (const pruef of einheiten) {
        if (damen.some(pruef)) continue;
        const frei = felderVon(pruef);
        if (!frei.length) return { fertig: false, wert: -1, geht };   // Sackgasse, dürfte nicht sein
        if (frei.length === 1) { setzen(frei[0]); bewegung = true; }
      }
      if (bewegung) continue;

      for (const pruef of einheiten) {
        if (damen.some(pruef)) continue;
        const frei = felderVon(pruef);
        if (frei.length < 2) continue;
        for (let x = 0; x < k * k; x += 1) {
          if (!geht[x] || pruef(x)) continue;
          if (frei.every((p) => deckt(p, x))) { geht[x] = false; bewegung = true; }
        }
        if (bewegung) break;
      }
      if (!bewegung) return ergebnis(false);      // nur noch Raten hülfe weiter
    }
    return ergebnis(true);
  }

  const ohneRatenLoesbar = (k, gebiet) => herleiten(k, gebiet).fertig;

  /* Bleibt der Prüfer bei einem eindeutigen Rätsel stehen, wird es nicht
     weggeworfen, sondern umgebaut – wie beim Nachschärfen: Ein Feld, das an
     der Stelle noch als Platz in Frage kommt, wandert ins Nachbargebiet. Die
     geplante Lösung bleibt gültig, weil keine Damenzelle wandert und jedes
     Gebiet zusammenhängt. Behalten wird ein Umbau nur, wenn der Prüfer danach
     weiter kommt; stockt es ganz, würfelt raetselBauen neu.
     Auf schwer verwarf der Erzeuger sonst zwei von drei eindeutigen Rätseln
     und brauchte im schlechtesten Fall Hunderte Anläufe. */
  function nachhelfen(k, gebiet, damen) {
    const dameDa = new Set(damen.map((s, z) => z * k + s));
    let bisher = herleiten(k, gebiet);

    while (!bisher.fertig) {
      let besser = null;
      const kandidaten = mischen([...Array(k * k).keys()].filter((i) => bisher.geht[i] && !dameDa.has(i)));
      suche: for (const zelle of kandidaten) {
        if (!bleibtHeil(gebiet, zelle, k)) continue;
        const von = gebiet[zelle];
        for (const n of mischen(nachbarnVon(zelle, k))) {
          if (gebiet[n] === von) continue;
          gebiet[zelle] = gebiet[n];
          const neu = herleiten(k, gebiet);
          if (neu.wert > bisher.wert) { besser = neu; break suche; }
          gebiet[zelle] = von;
        }
      }
      // Jeder behaltene Umbau hebt den Wert, darum endet die Schleife sicher.
      if (!besser) return false;
      bisher = besser;
    }
    return true;
  }

  /* Die Suche läuft gegen eine Uhr statt gegen eine feste Zahl Anläufe: Auf
     einem langsamen Handy soll sie genauso bald aufgeben wie am PC. Die Frist
     ist ein Vielfaches dessen, was ein Rätsel im schlechtesten gemessenen Fall
     braucht (Hintergrund in der Spec) – sie fängt nur Ausreißer ab. */
  const FRIST_MS = 600;

  function raetselBauen(stufe, frist = FRIST_MS) {
    const k = STUFEN[stufe].kanten;
    const bis = Date.now() + frist;

    do {
      const damen = stellungSuchen(k);
      if (!damen) continue;
      const gebiet = gebieteWachsen(k, damen);
      if (!gebiet) continue;
      // Nachgeholfen wird nur bei eindeutigen Rätseln: Denen fehlt meist nur
      // wenig. Auf rohen Gebieten braucht es so viele Umbauten, dass neu
      // würfeln billiger ist.
      if (!eindeutigMachen(k, gebiet, damen)) continue;
      if (!nachhelfen(k, gebiet, damen)) continue;
      // Doppelt genäht: Der Prüfer schließt eine zweite Lösung schon aus.
      if (loesungen(k, gebiet) !== 1) continue;
      return { kanten: k, gebiet, damen };
    } while (Date.now() < bis);
    return null;
  }

  /* Letzte Rückfallebene, falls selbst auf leicht bis zur Frist nichts
     entsteht – gemessen kommt das nicht vor, aber ein Rätsel, das Probieren
     verlangt, oder ein Absturz wären schlechter als ein bekanntes Rätsel.
     Einmal erzeugt und mit ohneRatenLoesbar und loesungen nachgeprüft. */
  const ERSATZ = {
    kanten: 6,
    gebiet: '000005103205133225133425334425333555'.split('').map(Number),
    damen: [2, 0, 4, 1, 3, 5],
  };

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let uhr = null;
    let zieht = null;          // Streichen statt Tippen
    let gemaltGerade = false;  // merkt sich, dass gestrichen wurde
    let neueBestzeit = false;

    /* Findet die Suche bis zur Frist nichts, weicht sie auf die nächstkleinere
       Stufe aus und sagt das – lieber ein kleineres Brett als ein Rätsel, das
       Probieren verlangt, oder gar keins. */
    function frisch(stufe) {
      const reihe = Object.keys(STUFEN);
      let r = null;
      let wirklich = stufe;
      for (let i = reihe.indexOf(stufe); i >= 0 && !r; i -= 1) {
        wirklich = reihe[i];
        r = raetselBauen(wirklich);
      }
      if (!r) { wirklich = 'leicht'; r = ERSATZ; }
      if (wirklich !== stufe) {
        s.toast('Auf ' + STUFEN[stufe].name + ' kam gerade kein Rätsel zustande – hier eins auf ' + STUFEN[wirklich].name + '.');
      }
      return {
        stufe: wirklich,
        kanten: r.kanten,
        // Kopien, damit ein Stand nie das Ersatzrätsel selbst in der Hand hält.
        gebiet: r.gebiet.slice(),
        damen: r.damen.slice(),
        feld: new Array(r.kanten * r.kanten).fill(LEER),
        verbraucht: 0,
        seit: Date.now(),
        hilfen: 0,
        autoKreuze: true,
        verlauf: [],
        fertig: false,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.feld) && alt.kanten && !alt.fertig) {
        alt.seit = Date.now();
        // Ein Stand aus einer älteren Fassung kennt den Verlauf noch nicht.
        if (!Array.isArray(alt.verlauf)) alt.verlauf = [];
        return alt;
      }
      return frisch('leicht');
    }

    /* Liegt das Handy gesperrt in der Tasche oder ist ein anderer Tab vorn,
       spielt niemand: Die Uhr ruht dann wie bei geschlossener App. Sonst
       stünde die Mittagspause in der Bestzeit. */
    let ruht = document.hidden;
    const zeitJetzt = () => stand.verbraucht + (stand.fertig || ruht ? 0 : Date.now() - stand.seit);

    function sichern() {
      if (!stand.fertig) {
        stand.verbraucht = zeitJetzt();
        stand.seit = Date.now();
      }
      s.merken(stand);
    }

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const gitter = el('div', 'q-gitter');
    // Sagt, warum etwas rot ist; hält den Platz frei, damit nichts springt.
    const lage = el('p', 'q-lage');
    lage.setAttribute('aria-live', 'polite');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste q-leiste');
    wurzel.append(kopf, gitter, lage, endeKasten, leiste);

    const zurueckKnopf = s.leistenKnopf('Rückgängig', 'rueckgaengig', zurueckNehmen);
    const leerenKnopf = s.leistenKnopf('Von vorn', 'leeren', vonVorn);
    const hinweisKnopf = s.leistenKnopf('Hinweis', 'hinweis', hinweis);
    /* Ein Schalter, der selten bedient wird: Er steht als letzter, und an bleibt
       er leise. Als schwarzer Knopf war er das Lauteste auf der Seite. */
    const autoKnopf = s.leistenKnopf('Auto-Kreuze', null, () => {
      stand.autoKreuze = !stand.autoKreuze;
      sichern();
      zeichnen();
    });
    autoKnopf.classList.add('q-schalter');
    leiste.append(zurueckKnopf, leerenKnopf, hinweisKnopf, autoKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neues Rätsel', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    let felder = [];

    /* So groß, wie das Fenster es erlaubt – aber nie so klein, dass ein Feld
       unter den Finger rutscht: Auf einem sehr flachen Fenster wird lieber
       gescrollt, als dass acht Zeilen auf 32 Pixel schrumpfen. */
    function masseSetzen() {
      const k = stand.kanten;
      const platz = Math.max(s.brettKante(230), Math.min(window.innerWidth - 28, k * 40));
      gitter.style.setProperty('--kanten', String(k));
      gitter.style.setProperty('--zelle', Math.floor(platz / k) + 'px');
    }

    function gitterBauen() {
      const k = stand.kanten;
      masseSetzen();

      gitter.replaceChildren();
      felder = [];
      for (let i = 0; i < k * k; i += 1) {
        const f = el('button', 'q-feld');
        f.type = 'button';
        f.style.setProperty('--gebiet', FARBEN[stand.gebiet[i] % FARBEN.length]);
        // Gebietsgrenzen sichtbar machen: dicke Linie, wo die Farbe wechselt.
        const z = Math.floor(i / k);
        const sp = i % k;
        if (sp < k - 1 && stand.gebiet[i] !== stand.gebiet[i + 1]) f.dataset.grenzeRechts = 'ja';
        if (z < k - 1 && stand.gebiet[i] !== stand.gebiet[i + k]) f.dataset.grenzeUnten = 'ja';
        // Am Außenrand des Bretts keine Linie, die sich gegen den Rahmen drückt.
        if (sp === k - 1) f.dataset.randRechts = 'ja';
        if (z === k - 1) f.dataset.randUnten = 'ja';
        f.style.setProperty('--schritt', String(z + sp));
        const nr = i;
        // Tippen schaltet weiter, Streichen malt Kreuze. Unterschieden wird
        // erst beim Loslassen: Wer nie ein zweites Feld berührt hat, hat getippt.
        f.addEventListener('pointerdown', (e) => {
          zieht = { start: nr, letztes: nr, zeiger: e.pointerId, wert: stand.feld[nr] === KREUZ ? LEER : KREUZ };
          // Muss hier zurückgesetzt werden, nicht erst beim Klick: Endet ein
          // Streichzug auf einer anderen Zelle als er begann, landet der Klick
          // beim Gitter statt bei einer Zelle – das Flag bliebe sonst hängen
          // und der nächste Streichzug würde sein erstes Feld auslassen.
          gemaltGerade = false;
          // Bei Berührung fängt der Browser den Zeiger sonst beim Startfeld ab,
          // dann käme kein pointerenter mehr bei den Nachbarn an.
          if (e.pointerId !== undefined && f.hasPointerCapture(e.pointerId)) {
            f.releasePointerCapture(e.pointerId);
          }
        });
        // Das Weiterschalten hängt bewusst am Klick und nicht am Loslassen:
        // so funktionieren auch Tastatur und Vorlesehilfen weiter.
        f.addEventListener('click', () => {
          if (gemaltGerade) { gemaltGerade = false; return; }
          weiterschalten(nr);
        });
        gitter.append(f);
        felder.push(f);
      }
    }

    /* ---------------------------------------------------- Rückgängig */

    /* Vor jedem Zug wird das Brett weggelegt. Ein Streichzug legt nur einen
       einzigen Stand weg – ein schief geratener Wisch soll mit einem Druck
       verschwinden und nicht Feld für Feld. Tiefer als ein paar Dutzend
       Schritte muss der Stapel nicht sein; er liegt im gespeicherten Stand,
       damit er ein Neuladen übersteht. */
    const VERLAUF_TIEFE = 60;
    let letztesFeld = -1;

    /* Zwei Tipps bis zur Dame sind ein Zug, nicht zwei: Wer mehrmals auf
       dasselbe Feld tippt, legt nur beim ersten Mal einen Stand weg. */
    function schrittMerken(i = -1) {
      if (i >= 0 && i === letztesFeld) return;
      stand.verlauf.push(stand.feld.slice());
      if (stand.verlauf.length > VERLAUF_TIEFE) stand.verlauf.shift();
      letztesFeld = i;
    }

    function zurueckNehmen() {
      if (stand.fertig || !stand.verlauf.length) return;
      stand.feld = stand.verlauf.pop();
      letztesFeld = -1;
      s.fuehlen();
      sichern();
      zeichnen();
    }

    const hatMarken = () => stand.feld.some((w) => w !== LEER);

    /* Keine Rückfrage: „Rückgängig" holt alles wieder. */
    function vonVorn() {
      if (stand.fertig || !hatMarken()) return;
      schrittMerken();
      stand.feld = stand.feld.map(() => LEER);
      sichern();
      zeichnen();
    }

    /* Beim Streichen werden nur leere Felder und Kreuze angefasst –
       eine gesetzte Dame überfährt man nicht aus Versehen. Was eine Dame schon
       von selbst auskreuzt, bleibt ebenfalls liegen: Als eigenes Kreuz stünde
       es noch da, wenn die Dame längst weg ist. */
    function malen(i, wert) {
      if (stand.fertig) return;
      if (stand.feld[i] === DAME) return;
      if (stand.feld[i] === wert) return;
      if (wert === KREUZ && abgedeckt().has(i)) return;
      if (zieht && !zieht.gemerkt) { zieht.gemerkt = true; schrittMerken(); }
      stand.feld[i] = wert;
      s.fuehlen(4);
      /* Gezeichnet wird jedes Feld sofort, gespeichert der ganze Strich erst
         beim Loslassen: Der Rahmen schreibt bei jedem Merken den ganzen Bestand,
         und bei ein paar tausend Partien kostet das je Feld so viel wie ein Bild. */
      zeichnen();
    }

    const feldUnter = (e) => {
      const ziel = document.elementFromPoint(e.clientX, e.clientY);
      const feld = ziel && ziel.closest('.q-feld');
      return feld ? felder.indexOf(feld) : -1;
    };

    /* Wer flott streicht, überspringt Felder: Der Browser fasst die Bewegung zu
       wenigen Meldungen zusammen. Darum die Einzelpunkte holen und dazwischen
       auffüllen, sonst bleiben im Wisch Lücken. */
    function streichenBis(i) {
      const k = stand.kanten;
      const von = zieht.letztes;
      const dz = Math.floor(i / k) - Math.floor(von / k);
      const ds = (i % k) - (von % k);
      const schritte = Math.max(Math.abs(dz), Math.abs(ds));
      if (!gemaltGerade) {
        gemaltGerade = true;
        malen(zieht.start, zieht.wert);
      }
      for (let t = 1; t <= schritte; t += 1) {
        const z = Math.floor(von / k) + Math.round((dz * t) / schritte);
        const sp = (von % k) + Math.round((ds * t) / schritte);
        malen(z * k + sp, zieht.wert);
      }
      zieht.letztes = i;
    }

    const beiBewegung = (e) => {
      if (!zieht || e.pointerId !== zieht.zeiger) return;
      const punkte = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      for (const p of punkte.length ? punkte : [e]) {
        const i = feldUnter(p);
        if (i >= 0 && i !== zieht.letztes) streichenBis(i);
      }
    };
    window.addEventListener('pointermove', beiBewegung);

    const losgelassen = () => {
      if (!zieht) return;
      zieht = null;
      if (gemaltGerade) {
        sichern();
        letztesFeld = -1;
        // Der Klick, der zum Strich gehört, kommt gleich noch und wird verschluckt.
        // Danach darf das Merkmal nicht liegen bleiben, sonst schluckt es die Tastatur.
        setTimeout(() => { gemaltGerade = false; }, 0);
      }
    };
    window.addEventListener('pointerup', losgelassen);
    window.addEventListener('pointercancel', losgelassen);

    /* Pfeile wandern von Feld zu Feld, Enter und Leertaste schalten weiter wie
       ein Tipp. D und X setzen direkt, ohne den Umweg über das Weiterschalten. */
    const PFEILE = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const beiTaste = (e) => {
      if (stand.fertig || Echtzeit.blattOffen() || e.altKey) return;
      if (e.target && e.target.closest && e.target.closest('input, textarea, select')) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); zurueckNehmen(); }
        return;
      }
      const k = stand.kanten;
      const hier = felder.indexOf(document.activeElement);
      const pfeil = PFEILE[e.key];
      if (pfeil) {
        e.preventDefault();
        if (hier < 0) { felder[0].focus(); return; }
        const z = Math.floor(hier / k) + pfeil[0];
        const sp = (hier % k) + pfeil[1];
        if (z >= 0 && z < k && sp >= 0 && sp < k) felder[z * k + sp].focus();
        return;
      }
      if (e.key === 'Backspace') { e.preventDefault(); zurueckNehmen(); return; }
      if (hier < 0) return;
      const taste = e.key.toLowerCase();
      if (taste === 'd') setzen(hier, DAME);
      else if (taste === 'x') setzen(hier, KREUZ);
      else if (taste === 'delete' || taste === '0') setzen(hier, LEER);
    };
    window.addEventListener('keydown', beiTaste);

    /* ---------------------------------------------------------------- Zug */

    /* Welche leeren Felder scheiden aus, weil eine gesetzte Dame sie abdeckt?
       Das wird bei jedem Zeichnen neu ausgerechnet und nirgends gespeichert –
       darum verschwinden diese Kreuze sofort wieder, wenn die Dame weicht,
       die sie verursacht hat. Eine falsch gesetzte Dame hinterlässt also
       keinen Scherbenhaufen. */
    function abgedeckt(auchOhneSchalter = false) {
      const k = stand.kanten;
      const raus = new Set();
      if (!stand.autoKreuze && !auchOhneSchalter) return raus;

      for (let i = 0; i < k * k; i += 1) {
        if (stand.feld[i] !== DAME) continue;
        const z = Math.floor(i / k);
        const sp = i % k;
        for (let j = 0; j < k * k; j += 1) {
          if (j === i || stand.feld[j] === DAME) continue;
          const jz = Math.floor(j / k);
          const jsp = j % k;
          const beruehrt = Math.abs(jz - z) <= 1 && Math.abs(jsp - sp) <= 1;
          if (jz === z || jsp === sp || stand.gebiet[j] === stand.gebiet[i] || beruehrt) {
            raus.add(j);
          }
        }
      }
      return raus;
    }

    function setzen(i, wert) {
      if (stand.fertig || stand.feld[i] === wert) return;
      schrittMerken(i);
      stand.feld[i] = wert;
      // Einmal ganz herum getippt: Dann war es gar kein Zug.
      const vorher = stand.verlauf[stand.verlauf.length - 1];
      if (vorher && vorher.every((w, j) => w === stand.feld[j])) {
        stand.verlauf.pop();
        letztesFeld = -1;
      }
      s.fuehlen(wert === DAME ? 14 : 6);
      sichern();
      zeichnen();
      pruefenObFertig();
    }

    function weiterschalten(i) {
      // Ist das Feld ohnehin schon automatisch ausgekreuzt, wäre ein eigenes
      // Kreuz nur ein überflüssiger Zwischenschritt.
      if (stand.feld[i] === LEER && abgedeckt().has(i)) setzen(i, DAME);
      else setzen(i, stand.feld[i] === LEER ? KREUZ : stand.feld[i] === KREUZ ? DAME : LEER);
    }

    /* Welche Damen stehen einander im Weg? */
    function fehlerhaft() {
      const k = stand.kanten;
      const raus = new Set();
      const damen = stand.feld.map((w, i) => (w === DAME ? i : -1)).filter((i) => i >= 0);

      const zaehle = (schluessel) => {
        const gruppen = new Map();
        for (const i of damen) {
          const g = schluessel(i);
          if (!gruppen.has(g)) gruppen.set(g, []);
          gruppen.get(g).push(i);
        }
        for (const liste of gruppen.values()) {
          if (liste.length > 1) liste.forEach((i) => raus.add(i));
        }
      };
      zaehle((i) => 'z' + Math.floor(i / k));
      zaehle((i) => 's' + (i % k));
      zaehle((i) => 'g' + stand.gebiet[i]);

      for (const a of damen) {
        for (const b of damen) {
          if (a >= b) continue;
          const dz = Math.abs(Math.floor(a / k) - Math.floor(b / k));
          const ds = Math.abs((a % k) - (b % k));
          if (dz <= 1 && ds <= 1) { raus.add(a); raus.add(b); }
        }
      }
      return raus;
    }

    /* Rot allein sagt nicht, was nicht stimmt. Genannt wird das Erste, was stört. */
    function stoerText() {
      const k = stand.kanten;
      const damen = stand.feld.map((w, i) => (w === DAME ? i : -1)).filter((i) => i >= 0);
      for (const a of damen) {
        for (const b of damen) {
          if (a >= b) continue;
          if (Math.floor(a / k) === Math.floor(b / k)) return 'Zwei Damen in Zeile ' + (Math.floor(a / k) + 1) + '.';
          if (a % k === b % k) return 'Zwei Damen in Spalte ' + ((a % k) + 1) + '.';
          if (stand.gebiet[a] === stand.gebiet[b]) return 'Zwei Damen in derselben Farbe.';
          if (Math.abs(Math.floor(a / k) - Math.floor(b / k)) <= 1 && Math.abs((a % k) - (b % k)) <= 1) return 'Zwei Damen berühren sich.';
        }
      }
      return null;
    }

    /* Wo könnte überhaupt noch eine Dame stehen? Ausgeschlossen ist ein Feld,
       das schon ausgekreuzt ist, dessen Zeile, Spalte oder Gebiet bereits eine
       Dame trägt, oder das eine gesetzte Dame berührt. */
    function moegliche() {
      const k = stand.kanten;
      const damen = [];
      for (let i = 0; i < k * k; i += 1) if (stand.feld[i] === DAME) damen.push(i);

      const zeilenBelegt = new Set(damen.map((i) => Math.floor(i / k)));
      const spaltenBelegt = new Set(damen.map((i) => i % k));
      const gebieteBelegt = new Set(damen.map((i) => stand.gebiet[i]));

      const geht = new Array(k * k).fill(false);
      for (let i = 0; i < k * k; i += 1) {
        if (stand.feld[i] !== LEER) continue;
        const z = Math.floor(i / k);
        const sp = i % k;
        if (zeilenBelegt.has(z) || spaltenBelegt.has(sp) || gebieteBelegt.has(stand.gebiet[i])) continue;
        if (damen.some((dd) => Math.abs(Math.floor(dd / k) - z) <= 1 && Math.abs((dd % k) - sp) <= 1)) continue;
        geht[i] = true;
      }
      return { geht, damen, zeilenBelegt, spaltenBelegt, gebieteBelegt };
    }

    /* Lässt sich das Rätsel mit den gesetzten Damen überhaupt noch lösen?
       Eigene Kreuze bleiben außen vor – die sind nur Notizen. */
    function nochLoesbar() {
      const k = stand.kanten;
      const feste = new Map();
      for (let i = 0; i < k * k; i += 1) if (stand.feld[i] === DAME) feste.set(Math.floor(i / k), i % k);
      if (new Set(feste.values()).size !== feste.size) return false;

      const spalten = new Set();
      const gebiete = new Set();
      const gesetzt = [];
      const weiter = (z) => {
        if (z === k) return true;
        const nurDiese = feste.has(z) ? [feste.get(z)] : [...Array(k).keys()];
        for (const sp of nurDiese) {
          if (spalten.has(sp)) continue;
          const g = stand.gebiet[z * k + sp];
          if (gebiete.has(g)) continue;
          if (z > 0 && Math.abs(gesetzt[z - 1] - sp) <= 1) continue;
          spalten.add(sp); gebiete.add(g); gesetzt[z] = sp;
          if (weiter(z + 1)) return true;
          spalten.delete(sp); gebiete.delete(g);
        }
        return false;
      };
      return weiter(0);
    }

    /* Alle Lösungen des Rätsels – ohne Rücksicht auf das, was auf dem Brett
       liegt. Gesucht wird jedes Mal neu, statt in stand.damen nachzusehen:
       so stimmt die Antwort auch bei einem gespeicherten Rätsel aus einer
       älteren Fassung, und der Hinweis kennt weiterhin keine „richtige“ Lösung. */
    function alleLoesungen() {
      const k = stand.kanten;
      const gefunden = [];
      const spalten = new Set();
      const gebiete = new Set();
      const gesetzt = [];
      const weiter = (z) => {
        if (z === k) { gefunden.push(gesetzt.slice()); return; }
        for (let sp = 0; sp < k; sp += 1) {
          if (spalten.has(sp)) continue;
          const g = stand.gebiet[z * k + sp];
          if (gebiete.has(g)) continue;
          if (z > 0 && Math.abs(gesetzt[z - 1] - sp) <= 1) continue;
          spalten.add(sp); gebiete.add(g); gesetzt[z] = sp;
          weiter(z + 1);
          spalten.delete(sp); gebiete.delete(g);
        }
      };
      weiter(0);
      return gefunden;
    }

    /* Was liegt nachweislich falsch? Auf einem Feld, das in keiner Lösung
       eine Dame trägt, steht die Dame falsch; auf einem Feld, das in jeder
       Lösung eine Dame trägt, ist das Kreuz falsch. Beides folgt aus dem
       Rätsel selbst – anders als eine gesetzte Dame ist ein Kreuz sonst nur
       eine Notiz und fällt nirgends auf, obwohl es genauso in die Irre führt. */
    function falscheMarken() {
      const k = stand.kanten;
      const loes = alleLoesungen();
      const damen = [];
      const kreuze = [];
      if (!loes.length) return { damen, kreuze };
      const wieOft = new Array(k * k).fill(0);
      for (const l of loes) for (let z = 0; z < k; z += 1) wieOft[z * k + l[z]] += 1;
      for (let i = 0; i < k * k; i += 1) {
        if (stand.feld[i] === DAME && wieOft[i] === 0) damen.push(i);
        if (stand.feld[i] === KREUZ && wieOft[i] === loes.length) kreuze.push(i);
      }
      return { damen, kreuze };
    }

    const platzName = (i) => 'Zeile ' + (Math.floor(i / stand.kanten) + 1)
      + ', Spalte ' + ((i % stand.kanten) + 1);

    /* Der Hinweis schaut ausdrücklich nicht in die Lösung, sondern sucht einen
       Schluss, den man auch selbst ziehen könnte – und nennt ihn. */
    function hinweis() {
      if (stand.fertig) return;
      const k = stand.kanten;

      if (fehlerhaft().size) {
        s.blatt({
          titel: 'Zwei Damen stören sich',
          inhalt: 'Die rot umrandeten Damen stehen in derselben Zeile, Spalte oder Farbe – oder sie berühren sich. Räum das zuerst weg.',
          aktionen: [{ text: 'Mach ich' }],
        });
        return;
      }

      /* Ein kleines Abbild des Bretts im Hinweisblatt. Ohne das müsste man
         die genannten Felder erst selbst zusammensuchen. */
      const miniBrett = ({ kandidaten, kreuze, dame, falsch }) => {
        const g = el('div', 'q-mini');
        g.style.setProperty('--kanten', String(k));
        /* Satz, Legende und Knöpfe brauchen ihren Platz im Blatt: Auf einem flachen
           Fenster soll man nicht scrollen müssen, um das Bild zu sehen und zu antworten. */
        const platz = Math.min(320, window.innerWidth - 64, Math.max(180, window.innerHeight - 400));
        g.style.setProperty('--zelle', Math.floor(platz / k) + 'px');
        /* Was gesetzte Damen abdecken, steht auch hier als Kreuz – der Hinweis
           rechnet damit, ob der Schalter an ist oder nicht. Ohne diese Kreuze
           sähe „nur ein Feld bleibt übrig" im Bild nach vier freien Feldern aus. */
        const gedeckt = abgedeckt(true);
        for (let i = 0; i < k * k; i += 1) {
          const f = el('div', 'q-mini-feld');
          f.style.setProperty('--gebiet', FARBEN[stand.gebiet[i] % FARBEN.length]);
          const z = Math.floor(i / k);
          const sp = i % k;
          if (sp < k - 1 && stand.gebiet[i] !== stand.gebiet[i + 1]) f.dataset.grenzeRechts = 'ja';
          if (z < k - 1 && stand.gebiet[i] !== stand.gebiet[i + k]) f.dataset.grenzeUnten = 'ja';
          if (sp === k - 1) f.dataset.randRechts = 'ja';
          if (z === k - 1) f.dataset.randUnten = 'ja';
          if (stand.feld[i] === DAME) f.innerHTML = DAME_BILD;
          else if (stand.feld[i] === KREUZ || gedeckt.has(i)) { f.innerHTML = KREUZ_BILD; f.dataset.rolle = 'schon'; }
          if (kandidaten && kandidaten.includes(i)) { f.innerHTML = DAME_BILD; f.dataset.rolle = 'kandidat'; }
          if (kreuze && kreuze.includes(i)) { f.innerHTML = KREUZ_BILD; f.dataset.rolle = 'raus'; }
          if (dame === i) { f.innerHTML = DAME_BILD; f.dataset.rolle = 'ziel'; }
          // Zuletzt, damit die rote Umrandung jede andere Rolle sticht.
          if (falsch && falsch.includes(i)) f.dataset.rolle = 'falsch';
          g.append(f);
        }
        return g;
      };

      const falsch = falscheMarken();
      if (falsch.damen.length || falsch.kreuze.length) {
        stand.hilfen += 1;
        sichern();
        const stuecke = [];
        if (falsch.damen.length) {
          stuecke.push(falsch.damen.length === 1
            ? 'eine Dame steht auf einem Feld, auf dem in keiner Lösung eine steht'
            : falsch.damen.length + ' Damen stehen auf Feldern, auf denen in keiner Lösung eine steht');
        }
        if (falsch.kreuze.length) {
          stuecke.push(falsch.kreuze.length === 1
            ? 'ein Kreuz liegt auf einem Feld, auf dem am Ende eine Dame stehen muss'
            : falsch.kreuze.length + ' Kreuze liegen auf Feldern, auf denen am Ende Damen stehen müssen');
        }
        const inhalt = el('div');
        inhalt.append(
          el('p', 'notiz', 'Rot umrandet: ' + stuecke.join(', und ') + '. Solange das so liegt, '
            + 'führt jeder weitere Schluss in die Irre – warum es falsch ist, findest du heraus, '
            + 'indem du durchspielst, was danach noch übrig bliebe.'),
          miniBrett({ falsch: [...falsch.damen, ...falsch.kreuze] }),
        );
        s.blatt({
          titel: 'Da liegt etwas falsch',
          inhalt,
          aktionen: [
            {
              text: 'Wegnehmen',
              tun: () => {
                schrittMerken();
                for (const i of [...falsch.damen, ...falsch.kreuze]) stand.feld[i] = LEER;
                sichern();
                zeichnen();
              },
            },
            { text: 'Lass ich noch', art: 'still' },
          ],
        });
        return;
      }

      if (!nochLoesbar()) {
        stand.hilfen += 1;
        sichern();
        s.blatt({
          titel: 'So geht es nicht mehr auf',
          inhalt: 'Jede gesetzte Dame steht für sich genommen auf einem möglichen Feld, zusammen '
            + 'gehen sie aber nicht auf. Welche Kombination stört, verrate ich nicht: Das lässt sich '
            + 'herausfinden, indem du für jede Dame durchspielst, was danach noch übrig bliebe.',
          aktionen: [{ text: 'Verstanden' }],
        });
        return;
      }

      const { geht } = moegliche();
      const felderVon = (pruef) => [...Array(k * k).keys()].filter((i) => geht[i] && pruef(i));

      const zeigen = (titel, text, kreuze, dame, kandidaten) => {
        stand.hilfen += 1;
        sichern();
        const inhalt = el('div');
        inhalt.append(el('p', 'notiz', text), miniBrett({ kandidaten, kreuze, dame }));
        const beine = [];
        if (kandidaten && kandidaten.length) beine.push('blasse Damen: die noch möglichen Stellen');
        if (kreuze && kreuze.length) beine.push('rote Kreuze: die Felder, die deshalb wegfallen');
        if (dame !== undefined) beine.push('umrandete Dame: das Feld, um das es geht');
        inhalt.append(el('p', 'notiz notiz--klein', beine.join(' · ')));
        s.blatt({
          titel,
          inhalt,
          aktionen: [
            {
              text: dame !== undefined ? 'Dame setzen' : 'Kreuze setzen',
              tun: () => {
                schrittMerken();
                if (dame !== undefined) stand.feld[dame] = DAME;
                else for (const i of kreuze) stand.feld[i] = KREUZ;
                sichern();
                zeichnen();
                pruefenObFertig();
              },
            },
            { text: 'Selbst machen', art: 'still' },
          ],
        });
      };

      // 1. Bleibt in einer Zeile, Spalte oder Farbe nur ein Feld übrig?
      const einheiten = [];
      for (let z = 0; z < k; z += 1) einheiten.push({ art: 'zeile', text: 'Zeile ' + (z + 1), pruef: (i) => Math.floor(i / k) === z });
      for (let sp = 0; sp < k; sp += 1) einheiten.push({ art: 'spalte', text: 'Spalte ' + (sp + 1), pruef: (i) => i % k === sp });
      for (const g of new Set(stand.gebiet)) {
        einheiten.push({ art: 'gebiet', text: 'diesem Farbgebiet', pruef: (i) => stand.gebiet[i] === g, gebiet: g });
      }
      for (const e of einheiten) {
        const belegt = stand.feld.some((w, i) => w === DAME && e.pruef(i));
        if (belegt) continue;
        const frei = felderVon(e.pruef);
        if (frei.length === 1) {
          // Innerhalb einer Zeile genügt die Spalte, um das Feld zu benennen –
          // sonst stünde die Zeile zweimal im selben Satz.
          const wo = e.art === 'zeile' ? 'Spalte ' + ((frei[0] % k) + 1)
            : e.art === 'spalte' ? 'Zeile ' + (Math.floor(frei[0] / k) + 1)
            : platzName(frei[0]);
          zeigen('Nur ein Feld bleibt übrig',
            'In ' + e.text + ' ist noch kein Platz vergeben, und von allen Feldern dort kommt nur '
            + 'das Feld in ' + wo + ' in Frage. Alles andere ist durch bereits gesetzte Damen, '
            + 'deine Kreuze oder die Nachbarschaftsregel ausgeschlossen.',
            null, frei[0], null);
          return;
        }
      }

      /* 2. Der allgemeine Ausschluss: Wenn ein Feld von JEDER noch möglichen
            Stelle einer Einheit abgedeckt würde, kann dort keine Dame stehen –
            ganz gleich, wie sich die Einheit am Ende entscheidet. Daraus folgen
            die geläufigen Fälle von selbst: eine Farbe, die ganz in einer Zeile
            steckt, räumt diese Zeile; eine Zeile, die ganz in einer Farbe
            liegt, räumt diese Farbe. */
      const deckt = (p, x) => {
        if (p === x) return false;
        const pz = Math.floor(p / k);
        const ps = p % k;
        const xz = Math.floor(x / k);
        const xs = x % k;
        return pz === xz || ps === xs || stand.gebiet[p] === stand.gebiet[x]
          || (Math.abs(pz - xz) <= 1 && Math.abs(ps - xs) <= 1);
      };

      for (const e of einheiten) {
        const belegt = stand.feld.some((w, i) => w === DAME && e.pruef(i));
        if (belegt) continue;
        const frei = felderVon(e.pruef);
        if (frei.length < 2) continue;

        const raus = felderVon((x) => !e.pruef(x) && frei.every((p) => deckt(p, x)));
        if (!raus.length) continue;

        // Für den Text: liegt die Einheit zufällig ganz in einer Zeile,
        // Spalte oder Farbe, lässt sich das viel anschaulicher sagen.
        const zeilen = new Set(frei.map((i) => Math.floor(i / k)));
        const spalten = new Set(frei.map((i) => i % k));
        const gebiete = new Set(frei.map((i) => stand.gebiet[i]));
        // Nur nennen, was die Einheit nicht ohnehin schon sagt: Dass die
        // Stellen der Dame von Zeile 2 alle in Zeile 2 liegen, ist keine
        // Beobachtung.
        let grund = null;
        if (zeilen.size === 1 && e.art !== 'zeile') grund = 'liegen alle in Zeile ' + ([...zeilen][0] + 1);
        else if (spalten.size === 1 && e.art !== 'spalte') grund = 'liegen alle in Spalte ' + ([...spalten][0] + 1);
        else if (gebiete.size === 1 && e.art !== 'gebiet') grund = 'liegen alle in derselben Farbe';

        const einleitung = grund
          ? 'Die ' + frei.length + ' noch möglichen Stellen für die Dame von ' + e.text + ' ' + grund + '.'
          : 'Für die Dame von ' + e.text + ' kommen noch ' + frei.length + ' Felder in Frage.';

        zeigen('Das fällt so oder so weg',
          einleitung + ' Wo auch immer sie am Ende steht: '
          + (raus.length === 1 ? 'das rot gekreuzte Feld' : 'die ' + raus.length + ' rot gekreuzten Felder')
          + ' wird sie in jedem Fall abdecken – ' + (raus.length === 1 ? 'es kann' : 'sie können')
          + ' also keine Dame tragen.',
          raus, undefined, frei);
        return;
      }

      s.blatt({
        titel: 'Hier sehe ich nichts Zwingendes',
        inhalt: 'Mit den einfachen Schlüssen – nur ein Feld übrig, Farbe steckt ganz in einer Zeile oder Spalte '
          + 'und umgekehrt – komme ich gerade nicht weiter. Kreuze erst aus, was die gesetzten Damen abdecken; '
          + 'danach findet sich meist wieder etwas.',
        aktionen: [{ text: 'Verstanden' }],
      });
    }

    function pruefenObFertig() {
      if (stand.fertig) return;
      const k = stand.kanten;
      for (let z = 0; z < k; z += 1) {
        if (stand.feld[z * k + stand.damen[z]] !== DAME) return;
      }
      if (stand.feld.filter((w) => w === DAME).length !== k) return;

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
      const auto = abgedeckt();
      const k = stand.kanten;
      for (let i = 0; i < felder.length; i += 1) {
        const f = felder[i];
        const w = stand.feld[i];
        const vonAllein = w === LEER && auto.has(i);
        // Gelöst bleiben nur die Damen auf den Farben stehen.
        const art = w === DAME ? 'dame' : stand.fertig ? 'leer' : w === KREUZ ? 'kreuz' : vonAllein ? 'auto' : 'leer';
        // Nur neu setzen, was sich geändert hat: Sonst flackert beim Streichen
        // jedes Zeichen des Bretts mit seiner Einblendung.
        if (f.dataset.wert !== art) {
          f.innerHTML = art === 'dame' ? DAME_BILD : art === 'leer' ? '' : KREUZ_BILD;
          f.dataset.wert = art;
          f.setAttribute('aria-label', 'Zeile ' + (Math.floor(i / k) + 1) + ', Spalte ' + ((i % k) + 1)
            + ': ' + (art === 'dame' ? 'Dame' : art === 'leer' ? 'leer' : 'Kreuz'));
        }
        if (fehler.has(i)) f.dataset.fehler = 'ja'; else delete f.dataset.fehler;
      }
      gitter.dataset.fertig = stand.fertig ? 'ja' : 'nein';
      autoKnopf.setAttribute('aria-pressed', stand.autoKreuze ? 'true' : 'false');
      zurueckKnopf.disabled = !stand.verlauf.length;
      leerenKnopf.disabled = !hatMarken();
      lageZeichnen();
      kopfZeichnen();
      endeZeichnen();
      leiste.hidden = stand.fertig;
    }

    function lageZeichnen() {
      const stoer = stand.fertig ? null : stoerText();
      lage.hidden = stand.fertig;
      lage.dataset.fehler = stoer ? 'ja' : 'nein';
      lage.textContent = stoer || (hatMarken() ? '' : 'Tippen setzt ein Kreuz, nochmal tippen die Dame. Streichen kreuzt mehrere.');
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      kopf.append(s.stufenName(STUFEN, stand.stufe));
      const zeit = el('span', null, '');
      zeit.append(el('b', null, s.dauerText(zeitJetzt()) === '–' ? '0 s' : s.dauerText(zeitJetzt())));
      kopf.append(zeit);
      kopf.append(el('span', null, stand.feld.filter((w) => w === DAME).length + '/' + stand.kanten + ' Damen'));
      s.unter(stand.kanten + ' × ' + stand.kanten);
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !stand.fertig;
      if (!stand.fertig) return;
      endeKasten.append(s.bildzeichen('fertig'));
      endeKasten.append(el('p', 'ende-titel', 'Alle Damen sitzen.'));
      if (neueBestzeit) endeKasten.append(el('span', 'ende-marke', 'Neue Bestzeit'));
      endeKasten.append(el('p', 'notiz', STUFEN[stand.stufe].name + ' · ' + s.dauerText(stand.verbraucht)
        + (stand.hilfen ? ' · ' + stand.hilfen + (stand.hilfen === 1 ? ' Hinweis' : ' Hinweise') : ' · ohne Hinweis')));
      endeKasten.append(s.stufenLeiste(STUFEN, stand.stufe, neu));
    }

    function neu(stufe) {
      stand = frisch(stufe);
      neueBestzeit = false;
      letztesFeld = -1;
      gitterBauen();
      sichern();
      zeichnen();
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neues Rätsel',
        inhalt: 'Leicht ist 6 × 6, mittel 7 × 7, schwer 8 × 8 – je größer, desto mehr Farbgebiete. Jedes Rätsel hat genau eine Lösung.',
        aktionen: s.stufenAktionen(STUFEN, neu),
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Setze in jede Zeile, jede Spalte und jedes Farbgebiet genau eine Dame.'));
      d.append(el('p', 'notiz', 'Zwei Damen dürfen sich nicht berühren – auch nicht über Eck. Anders als im Schach schlagen sie aber nicht über die ganze Diagonale; nur die acht direkten Nachbarfelder sind verboten.'));
      d.append(el('p', 'notiz', 'Tippen schaltet weiter: leer → × → Dame → leer. Über mehrere Felder zu streichen setzt dort Kreuze – das geht deutlich schneller als einzeln zu tippen. Am Rechner wandern die Pfeile von Feld zu Feld, D setzt die Dame, X das Kreuz.'));
      d.append(el('p', 'notiz', 'Mit dem Schalter „Auto-Kreuze" kreuzt die App alles aus, was durch eine gesetzte Dame ohnehin wegfällt. Diese blassen Kreuze sind nur abgeleitet und nirgends gespeichert: Nimmst du eine falsch gesetzte Dame wieder weg, verschwinden sie im selben Moment mit. Deine eigenen Kreuze bleiben davon unberührt.'));
      d.append(el('p', 'notiz', 'Was sich in die Quere kommt, färbt sich rot, und unter dem Brett steht, warum.'));
      d.append(el('p', 'notiz', '„Rückgängig“ nimmt den letzten Zug zurück – ein Streichzug zählt dabei als einer, ein schief geratener Wisch ist also mit einem Druck weg. Auch „Von vorn“ lässt sich so zurückholen.'));
      d.append(el('p', 'notiz', 'Guter Anfang: Ein Farbgebiet, das nur in einer einzigen Zeile liegt, belegt diese Zeile – in allen anderen Feldern dieser Zeile kann dann keine Dame mehr stehen. Genau nach solchen Schlüssen sucht auch der Hinweis; er schaut nie in die Lösung. Steht dagegen schon eine Dame oder ein Kreuz nachweislich falsch, sagt er zuerst das – sonst führt jeder weitere Schluss in die Irre.'));
      s.blatt({ titel: 'Damen', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    // Die Felder bleiben dieselben, sonst ginge beim Drehen der Tastaturfokus verloren.
    const beiGroesse = () => masseSetzen();
    window.addEventListener('resize', beiGroesse);

    const beiSicht = () => {
      if (stand.fertig) return;
      if (document.hidden) {
        sichern();
        ruht = true;
      } else {
        ruht = false;
        stand.seit = Date.now();
        kopfZeichnen();
      }
    };
    document.addEventListener('visibilitychange', beiSicht);

    gitterBauen();
    sichern();
    zeichnen();
    uhr = setInterval(() => { if (!stand.fertig) kopfZeichnen(); }, 1000);

    return {
      ende: () => {
        clearInterval(uhr);
        window.removeEventListener('resize', beiGroesse);
        document.removeEventListener('visibilitychange', beiSicht);
        window.removeEventListener('keydown', beiTaste);
        window.removeEventListener('pointermove', beiBewegung);
        window.removeEventListener('pointerup', losgelassen);
        window.removeEventListener('pointercancel', losgelassen);
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
      { wert: bestzeit('leicht'), label: 'Bestzeit 6×6' },
      { wert: bestzeit('mittel'), label: 'Bestzeit 7×7' },
      { wert: bestzeit('schwer'), label: 'Bestzeit 8×8' },
    ];
  }

  Rahmen.anmelden({
    id: 'queens',
    name: 'Damen',
    gruppe: 'raetsel',
    unter: 'Eine je Zeile, Spalte und Farbe.',
    farbe: '#B8577F',
    symbol: '<path d="M5 18h14M6 18l-1.5-9 4 3L12 6l3.5 6 4-3L18 18" stroke-linejoin="round"/>',
    starten,
    auswertung,
  });
})();
