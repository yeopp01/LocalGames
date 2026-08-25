/* Damen – nach dem Vorbild von Queens.

   In jede Zeile, jede Spalte und jedes Farbgebiet gehört genau eine Dame.
   Zwei Damen dürfen sich nicht berühren, auch nicht über Eck. Anders als im
   Schach schlagen sie sich nicht über die ganze Diagonale – nur die acht
   direkten Nachbarfelder sind tabu.

   Der Generator setzt erst die Damen, lässt dann von jeder Dame aus ein
   Farbgebiet wachsen und prüft, ob die Aufgabe damit eindeutig ist.
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

  function raetselBauen(stufe) {
    const k = STUFEN[stufe].kanten;
    for (let versuch = 0; versuch < 40; versuch += 1) {
      const damen = stellungSuchen(k);
      if (!damen) continue;
      for (let wuchs = 0; wuchs < 6; wuchs += 1) {
        const gebiet = gebieteWachsen(k, damen);
        if (!gebiet) continue;
        if (eindeutigMachen(k, gebiet, damen) && loesungen(k, gebiet) === 1) {
          return { kanten: k, gebiet, damen };
        }
      }
    }
    return null;
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let uhr = null;

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
        fertig: false,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.feld) && alt.kanten && !alt.fertig) {
        alt.seit = Date.now();
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

    const hinweisKnopf = el('button', 'knopf knopf--still', 'Hinweis');
    hinweisKnopf.type = 'button';
    hinweisKnopf.addEventListener('click', hinweis);
    leiste.append(hinweisKnopf);

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
        f.addEventListener('click', () => weiterschalten(nr));
        gitter.append(f);
        felder.push(f);
      }
    }

    /* ---------------------------------------------------------------- Zug */

    function weiterschalten(i) {
      if (stand.fertig) return;
      stand.feld[i] = stand.feld[i] === LEER ? KREUZ : stand.feld[i] === KREUZ ? DAME : LEER;
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

    function hinweis() {
      if (stand.fertig) return;
      const k = stand.kanten;

      // Steht schon eine Dame falsch, hat weiteres Grübeln keinen Zweck.
      const falsch = stand.feld.map((w, i) => (w === DAME && stand.damen[Math.floor(i / k)] !== i % k ? i : -1))
        .filter((i) => i >= 0);
      if (falsch.length) {
        stand.hilfen += 1;
        sichern();
        const i = falsch[0];
        s.blatt({
          titel: 'Diese Dame steht falsch',
          inhalt: 'Zeile ' + (Math.floor(i / k) + 1) + ', Spalte ' + ((i % k) + 1) + ' gehört nicht zur Lösung. '
            + 'Nimm sie weg, sonst führt alles Weitere in die Irre.',
          aktionen: [
            { text: 'Wegnehmen', tun: () => { stand.feld[i] = LEER; sichern(); zeichnen(); } },
            { text: 'Selbst machen', art: 'still' },
          ],
        });
        return;
      }

      // Sonst die nächste noch fehlende Dame verraten.
      for (let z = 0; z < k; z += 1) {
        const i = z * k + stand.damen[z];
        if (stand.feld[i] === DAME) continue;
        stand.hilfen += 1;
        sichern();
        s.blatt({
          titel: 'Eine Dame gehört hierhin',
          inhalt: 'In Zeile ' + (z + 1) + ' steht die Dame in Spalte ' + (stand.damen[z] + 1) + '.',
          aktionen: [
            { text: 'Setzen', tun: () => { stand.feld[i] = DAME; sichern(); zeichnen(); pruefenObFertig(); } },
            { text: 'Selbst machen', art: 'still' },
          ],
        });
        return;
      }
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
      for (let i = 0; i < felder.length; i += 1) {
        const f = felder[i];
        const w = stand.feld[i];
        f.textContent = w === DAME ? '♛' : w === KREUZ ? '×' : '';
        f.dataset.wert = w === DAME ? 'dame' : w === KREUZ ? 'kreuz' : 'leer';
        if (fehler.has(i)) f.dataset.fehler = 'ja'; else delete f.dataset.fehler;
      }
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
      d.append(el('p', 'notiz', 'Tippen schaltet weiter: leer → × → Dame → leer. Das × ist nur für dich, um auszuschließen, was nicht geht – der eigentliche Weg zur Lösung.'));
      d.append(el('p', 'notiz', 'Was sich in die Quere kommt, färbt sich rot.'));
      d.append(el('p', 'notiz', 'Guter Anfang: Ein Farbgebiet, das nur in einer einzigen Zeile liegt, belegt diese Zeile – in allen anderen Feldern dieser Zeile kann dann keine Dame mehr stehen.'));
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
