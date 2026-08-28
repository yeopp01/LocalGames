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

  /* Genug Farben für die größte Stufe, in Reihenfolge gut unterscheidbar. */
  const FARBEN = [
    '#C64B3A', '#4573B8', '#4E8A54', '#C9A227', '#6A4FA3',
    '#2E8B8B', '#B8577F', '#8C6A4F',
  ];

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
      if (!bewegung) return null;      // eingeklemmt, neu versuchen
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
    for (let runde = 0; runde < 400; runde += 1) {
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
     durchs Probieren weiter – so ein Rätsel lassen wir gar nicht erst zu. */
  function ohneRatenLoesbar(k, gebiet) {
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

    while (damen.length < k) {
      let bewegung = false;

      for (const pruef of einheiten) {
        if (damen.some(pruef)) continue;
        const frei = felderVon(pruef);
        if (!frei.length) return false;           // Sackgasse, dürfte nicht sein
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
      if (!bewegung) return false;                // nur noch Raten hülfe weiter
    }
    return true;
  }

  function raetselBauen(stufe) {
    const k = STUFEN[stufe].kanten;
    let notnagel = null;               // eindeutig, aber nur mit Probieren

    for (let versuch = 0; versuch < 120; versuch += 1) {
      const damen = stellungSuchen(k);
      if (!damen) continue;
      for (let wuchs = 0; wuchs < 6; wuchs += 1) {
        const gebiet = gebieteWachsen(k, damen);
        if (!gebiet) continue;
        if (!eindeutigMachen(k, gebiet, damen) || loesungen(k, gebiet) !== 1) continue;
        const fertig = { kanten: k, gebiet, damen };
        if (ohneRatenLoesbar(k, gebiet)) return fertig;
        if (!notnagel) notnagel = fertig;
      }
    }
    return notnagel;                   // besser als gar kein Rätsel
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let uhr = null;
    let zieht = null;          // Streichen statt Tippen
    let gemaltGerade = false;  // merkt sich, dass gestrichen wurde

    function frisch(stufe) {
      const r = raetselBauen(stufe) || raetselBauen('leicht');
      return {
        stufe: r.kanten === STUFEN[stufe].kanten ? stufe : 'leicht',
        kanten: r.kanten,
        gebiet: r.gebiet,
        damen: r.damen,
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
    const gitter = el('div', 'q-gitter');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste');
    wurzel.append(kopf, gitter, endeKasten, leiste);

    const autoKnopf = el('button', 'knopf knopf--still', 'Kreuze automatisch');
    autoKnopf.type = 'button';
    autoKnopf.addEventListener('click', () => {
      stand.autoKreuze = !stand.autoKreuze;
      sichern();
      zeichnen();
    });
    const zurueckKnopf = el('button', 'knopf knopf--still', 'Rückgängig');
    zurueckKnopf.type = 'button';
    zurueckKnopf.addEventListener('click', zurueckNehmen);
    const hinweisKnopf = el('button', 'knopf knopf--still', 'Hinweis');
    hinweisKnopf.type = 'button';
    hinweisKnopf.addEventListener('click', hinweis);
    leiste.append(zurueckKnopf, autoKnopf, hinweisKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neues Rätsel', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    let felder = [];

    function gitterBauen() {
      const k = stand.kanten;
      gitter.style.setProperty('--kanten', String(k));
      const platz = Math.min(340, window.innerWidth - 30);
      gitter.style.setProperty('--zelle', Math.floor(platz / k) + 'px');

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
        const nr = i;
        // Tippen schaltet weiter, Streichen malt Kreuze. Unterschieden wird
        // erst beim Loslassen: Wer nie ein zweites Feld berührt hat, hat getippt.
        f.addEventListener('pointerdown', (e) => {
          zieht = { start: nr, wert: stand.feld[nr] === KREUZ ? LEER : KREUZ };
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
        f.addEventListener('pointerenter', () => {
          if (!zieht) return;
          if (!gemaltGerade) {
            gemaltGerade = true;
            malen(zieht.start, zieht.wert);
          }
          malen(nr, zieht.wert);
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

    function schrittMerken() {
      stand.verlauf.push(stand.feld.slice());
      if (stand.verlauf.length > VERLAUF_TIEFE) stand.verlauf.shift();
    }

    function zurueckNehmen() {
      if (stand.fertig || !stand.verlauf.length) return;
      stand.feld = stand.verlauf.pop();
      sichern();
      zeichnen();
    }

    /* Beim Streichen werden nur leere Felder und Kreuze angefasst –
       eine gesetzte Dame überfährt man nicht aus Versehen. */
    function malen(i, wert) {
      if (stand.fertig) return;
      if (stand.feld[i] === DAME) return;
      if (stand.feld[i] === wert) return;
      if (zieht && !zieht.gemerkt) { zieht.gemerkt = true; schrittMerken(); }
      stand.feld[i] = wert;
      sichern();
      zeichnen();
    }

    const losgelassen = () => { zieht = null; };
    window.addEventListener('pointerup', losgelassen);
    window.addEventListener('pointercancel', () => { zieht = null; });

    /* ---------------------------------------------------------------- Zug */

    /* Welche leeren Felder scheiden aus, weil eine gesetzte Dame sie abdeckt?
       Das wird bei jedem Zeichnen neu ausgerechnet und nirgends gespeichert –
       darum verschwinden diese Kreuze sofort wieder, wenn die Dame weicht,
       die sie verursacht hat. Eine falsch gesetzte Dame hinterlässt also
       keinen Scherbenhaufen. */
    function abgedeckt() {
      const k = stand.kanten;
      const raus = new Set();
      if (!stand.autoKreuze) return raus;

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

    function weiterschalten(i) {
      if (stand.fertig) return;
      schrittMerken();
      // Ist das Feld ohnehin schon automatisch ausgekreuzt, wäre ein eigenes
      // Kreuz nur ein überflüssiger Zwischenschritt.
      if (stand.feld[i] === LEER && abgedeckt().has(i)) stand.feld[i] = DAME;
      else stand.feld[i] = stand.feld[i] === LEER ? KREUZ : stand.feld[i] === KREUZ ? DAME : LEER;
      sichern();
      zeichnen();
      pruefenObFertig();
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
       so stimmt die Antwort auch bei einem Notnagel-Rätsel mit mehreren
       Lösungen, und der Hinweis kennt weiterhin keine „richtige“ Lösung. */
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
        g.style.setProperty('--zelle', Math.floor(Math.min(280, window.innerWidth - 80) / k) + 'px');
        for (let i = 0; i < k * k; i += 1) {
          const f = el('div', 'q-mini-feld');
          f.style.setProperty('--gebiet', FARBEN[stand.gebiet[i] % FARBEN.length]);
          const z = Math.floor(i / k);
          const sp = i % k;
          if (sp < k - 1 && stand.gebiet[i] !== stand.gebiet[i + 1]) f.dataset.grenzeRechts = 'ja';
          if (z < k - 1 && stand.gebiet[i] !== stand.gebiet[i + k]) f.dataset.grenzeUnten = 'ja';
          if (stand.feld[i] === DAME) f.textContent = '♛';
          else if (stand.feld[i] === KREUZ) { f.textContent = '×'; f.dataset.rolle = 'schon'; }
          if (kandidaten && kandidaten.includes(i)) { f.textContent = '♛'; f.dataset.rolle = 'kandidat'; }
          if (kreuze && kreuze.includes(i)) { f.textContent = '×'; f.dataset.rolle = 'raus'; }
          if (dame === i) { f.textContent = '♛'; f.dataset.rolle = 'ziel'; }
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
      const fehler = fehlerhaft();
      const auto = abgedeckt();
      for (let i = 0; i < felder.length; i += 1) {
        const f = felder[i];
        const w = stand.feld[i];
        const vonAllein = w === LEER && auto.has(i);
        f.textContent = w === DAME ? '♛' : (w === KREUZ || vonAllein) ? '×' : '';
        f.dataset.wert = w === DAME ? 'dame' : w === KREUZ ? 'kreuz' : vonAllein ? 'auto' : 'leer';
        if (fehler.has(i)) f.dataset.fehler = 'ja'; else delete f.dataset.fehler;
      }
      autoKnopf.className = 'knopf ' + (stand.autoKreuze ? 'knopf--voll' : 'knopf--still');
      zurueckKnopf.disabled = !stand.verlauf.length;
      kopfZeichnen();
      endeZeichnen();
      leiste.hidden = stand.fertig;
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      kopf.append(el('span', null, STUFEN[stand.stufe].name));
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
      endeKasten.append(el('p', 'ende-titel', 'Alle Damen sitzen.'));
      endeKasten.append(el('p', 'notiz', STUFEN[stand.stufe].name + ' · ' + s.dauerText(stand.verbraucht)
        + (stand.hilfen ? ' · ' + stand.hilfen + ' Hinweise' : ' · ohne Hinweis')));
      const l = el('div', 'leiste');
      for (const stufe of Object.keys(STUFEN)) {
        const b = el('button', 'knopf ' + (stufe === stand.stufe ? 'knopf--voll' : 'knopf--still'), 'Neu, ' + STUFEN[stufe].name);
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
        inhalt: 'Leicht ist 6 × 6, mittel 7 × 7, schwer 8 × 8 – je größer, desto mehr Farbgebiete. Jedes Rätsel hat genau eine Lösung.',
        aktionen: [
          { text: 'Leicht', tun: () => neu('leicht') },
          { text: 'Mittel', art: 'still', tun: () => neu('mittel') },
          { text: 'Schwer', art: 'still', tun: () => neu('schwer') },
        ],
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Setze in jede Zeile, jede Spalte und jedes Farbgebiet genau eine Dame ♛.'));
      d.append(el('p', 'notiz', 'Zwei Damen dürfen sich nicht berühren – auch nicht über Eck. Anders als im Schach schlagen sie aber nicht über die ganze Diagonale; nur die acht direkten Nachbarfelder sind verboten.'));
      d.append(el('p', 'notiz', 'Tippen schaltet weiter: leer → × → Dame → leer. Über mehrere Felder zu streichen setzt dort Kreuze – das geht deutlich schneller als einzeln zu tippen.'));
      d.append(el('p', 'notiz', 'Mit „Kreuze automatisch" kreuzt die App alles aus, was durch eine gesetzte Dame ohnehin wegfällt. Diese blassen Kreuze sind nur abgeleitet und nirgends gespeichert: Nimmst du eine falsch gesetzte Dame wieder weg, verschwinden sie im selben Moment mit. Deine eigenen Kreuze bleiben davon unberührt.'));
      d.append(el('p', 'notiz', 'Was sich in die Quere kommt, färbt sich rot.'));
      d.append(el('p', 'notiz', '„Rückgängig“ nimmt den letzten Zug zurück – ein Streichzug zählt dabei als einer, ein schief geratener Wisch ist also mit einem Druck weg.'));
      d.append(el('p', 'notiz', 'Guter Anfang: Ein Farbgebiet, das nur in einer einzigen Zeile liegt, belegt diese Zeile – in allen anderen Feldern dieser Zeile kann dann keine Dame mehr stehen. Genau nach solchen Schlüssen sucht auch der Hinweis; er schaut nie in die Lösung. Steht dagegen schon eine Dame oder ein Kreuz nachweislich falsch, sagt er zuerst das – sonst führt jeder weitere Schluss in die Irre.'));
      s.blatt({ titel: 'Damen', inhalt: d, aktionen: [{ text: 'Los' }] });
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
        window.removeEventListener('resize', beiGroesse);
        window.removeEventListener('pointerup', losgelassen);
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
    unter: 'Eine je Zeile, Spalte und Farbe.',
    farbe: '#B8577F',
    symbol: '<path d="M5 18h14M6 18l-1.5-9 4 3L12 6l3.5 6 4-3L18 18" stroke-linejoin="round"/>',
    starten,
    auswertung,
  });
})();
