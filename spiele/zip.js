/* Weg – nach dem Vorbild von Zip.

   Ziehe einen zusammenhängenden Weg, der jedes Feld genau einmal berührt und
   die Zahlen der Reihe nach abklappert. Ein Hamiltonpfad mit Zwischenzielen.

   Der Generator würfelt zuerst einen solchen Weg über das ganze Brett und
   setzt die Zahlen darauf ab. Kommen die Schlüsse (siehe unten) damit nicht
   bis zum Ende, kommt eine weitere Zahl dazu; danach fliegt wieder heraus,
   was sie nicht brauchen. Der Hinweis zieht dieselben Schlüsse.
*/

(() => {
  const STUFEN = {
    leicht: { name: 'leicht', kanten: 5, ziele: 4, mauern: 0 },
    mittel: { name: 'mittel', kanten: 6, ziele: 6, mauern: 0 },
    schwer: { name: 'schwer', kanten: 7, ziele: 10, mauern: 6 },
  };

  const mischen = (feld) => {
    for (let i = feld.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [feld[i], feld[j]] = [feld[j], feld[i]];
    }
    return feld;
  };

  /* Eine Mauer sitzt zwischen zwei Feldern, nicht auf einem – sie wird also
     über das Paar benannt, immer kleinere Zahl zuerst. */
  const kante = (a, b) => (a < b ? a + ':' + b : b + ':' + a);

  const nachbarnVon = (i, k, mauern) => {
    const z = Math.floor(i / k);
    const s = i % k;
    const raus = [];
    if (z > 0) raus.push(i - k);
    if (z < k - 1) raus.push(i + k);
    if (s > 0) raus.push(i - 1);
    if (s < k - 1) raus.push(i + 1);
    return mauern && mauern.size ? raus.filter((j) => !mauern.has(kante(i, j))) : raus;
  };

  /* Mauern dürfen überall stehen, nur nicht auf dem gesuchten Weg. Damit ist
     auch gesagt, dass sie das Brett nie zerschneiden: der Weg kommt ja nach
     wie vor überall hin. */
  function mauernWaehlen(k, weg, anzahl) {
    if (!anzahl) return new Set();
    const benutzt = new Set();
    for (let n = 0; n + 1 < weg.length; n += 1) benutzt.add(kante(weg[n], weg[n + 1]));

    const alle = [];
    for (let i = 0; i < k * k; i += 1) {
      if (i % k < k - 1) alle.push(kante(i, i + 1));
      if (Math.floor(i / k) < k - 1) alle.push(kante(i, i + k));
    }
    return new Set(mischen(alle.filter((e) => !benutzt.has(e))).slice(0, anzahl));
  }

  /* Ein Weg über alle Felder. Der Trick ist die Reihenfolge: Nachbarn mit
     den wenigsten freien Anschlüssen zuerst – so laufen wir uns selten fest. */
  function wegSuchen(k) {
    const anzahl = k * k;
    for (let versuch = 0; versuch < 60; versuch += 1) {
      const besucht = new Array(anzahl).fill(false);
      const weg = [];
      let schritte = 0;

      const frei = (i) => nachbarnVon(i, k).filter((j) => !besucht[j]).length;

      const weiter = (i) => {
        schritte += 1;
        if (schritte > 60000) return false;
        besucht[i] = true;
        weg.push(i);
        if (weg.length === anzahl) return true;

        const kandidaten = mischen(nachbarnVon(i, k).filter((j) => !besucht[j]))
          .sort((a, b) => frei(a) - frei(b));
        for (const j of kandidaten) {
          if (weiter(j)) return true;
        }
        besucht[i] = false;
        weg.pop();
        return false;
      };

      const start = Math.floor(Math.random() * anzahl);
      if (weiter(start)) return weg;
    }
    return null;
  }

  /* Hin und her, Zeile für Zeile – geht immer. Nur der Notnagel, falls die
     Zufallssuche wider Erwarten leer ausgeht; ohne ihn gäbe es gar kein
     Rätsel. */
  function schlange(k) {
    const weg = [];
    for (let z = 0; z < k; z += 1) {
      for (let s = 0; s < k; s += 1) weg.push(z * k + (z % 2 ? k - 1 - s : s));
    }
    return weg;
  }

  /* ------------------------------------------------------------ Schlüsse

     Erzeuger und Hinweis teilen sich genau diese Schlüsse. Ein Rätsel wird
     nur ausgegeben, wenn sie es vom leeren Brett bis zum letzten Feld
     herleiten – und weil jeder Schluss für sich zwingend ist, gibt es dann
     auch nur einen Weg. Eine eigene Eindeutigkeitssuche braucht es nicht.

     Gedacht wird in Verbindungen zwischen zwei Nachbarfeldern. „Fest" ist
     eine Verbindung, die der Weg sicher benutzt: gezogen oder hergeleitet.
     Jedes Feld braucht zwei davon, die 1 und die höchste Zahl als Enden nur
     eine. Eine noch offene Verbindung scheidet aus, wenn
       – eines der beiden Felder schon genug feste hat („voll"),
       – beide Felder schon über feste Verbindungen zusammenhängen („Ring"),
       – sie die 1 mit der höchsten Zahl verbände, bevor alle Felder dran
         sind („Schluss"),
       – die Zahlen entlang des Wegs dann nicht mehr der Reihe nach kämen
         („Reihe").
     Mauern zählen gar nicht erst als Verbindung. Der Schluss daraus heißt
     Zwang: Hat ein Feld nur noch so viele mögliche Verbindungen, wie es
     braucht, benutzt der Weg sie alle. Das lässt sich in einem Satz
     begründen und am Brett nachzählen.

     Ein zweiter Schluss („die einzige Verbindung zwischen zwei Teilen des
     Bretts muss benutzt werden") war erwogen. Unter 600 gebauten Rätseln
     hat er ein einziges Mal etwas gefunden, das der Zwang nicht fand – zu
     selten, um einen eigenen Hinweistext zu tragen. Übrig bleibt davon die
     Prüfung auf Zusammenhang.

     Was nicht mehr aufgehen kann, meldet sich als Widerspruch: ein Feld ohne
     genug Nachbarn (Sackgasse), ein abgeschnittener Teil, ein Ring, Zahlen
     außer der Reihe. So erkennt der Hinweis einen Irrweg an einem Grund
     statt an der Lösung. */

  function brettVon(k, zahlAn, hoechste, mauern) {
    const n = k * k;
    const nb = [];
    for (let i = 0; i < n; i += 1) nb.push(nachbarnVon(i, k, mauern));
    const bedarf = [];
    for (let i = 0; i < n; i += 1) bedarf.push(zahlAn[i] === 1 || zahlAn[i] === hoechste ? 1 : 2);
    return { k, n, nb, zahlAn, hoechste, bedarf, mauern };
  }

  const kanteZerlegen = (e) => {
    const t = e.indexOf(':');
    return [Number(e.slice(0, t)), Number(e.slice(t + 1))];
  };

  /* Ein einziger Schluss aus den festen Verbindungen – der erste, der sich
     findet, mit allem, was der Hinweis für seine Begründung braucht.
     `vorne` ist ein Feld, auf das zuerst geschaut wird: für den Hinweis die
     Spitze des gezogenen Wegs, weil ein Schluss dort sofort weiterhilft. */
  function naechsterSchluss(b, fest, vorne = -1) {
    const { n, nb, zahlAn, hoechste, bedarf } = b;
    const an = [];
    for (let i = 0; i < n; i += 1) an.push([]);
    for (const e of fest) {
      const [x, y] = kanteZerlegen(e);
      an[x].push(y);
      an[y].push(x);
    }
    for (let i = 0; i < n; i += 1) {
      if (an[i].length > bedarf[i]) return { art: 'widerspruch', grund: 'voll', zelle: i };
    }

    /* Die festen Verbindungen zerfallen in Stücke. Jedes ist eine Kette;
       gelaufen wird von einem Ende, damit die Zahlen gleich in Wegrichtung
       vorliegen. Ein Feld, das dabei nie erreicht wird, liegt auf einem Ring. */
    const stueckVon = new Int32Array(n).fill(-1);
    const stuecke = [];
    for (let i = 0; i < n; i += 1) {
      if (stueckVon[i] >= 0 || an[i].length > 1) continue;
      const zellen = [];
      let vor = -1;
      let hier = i;
      while (hier !== undefined) {
        stueckVon[hier] = stuecke.length;
        zellen.push(hier);
        const weiter = an[hier][0] !== vor ? an[hier][0] : an[hier][1];
        vor = hier;
        hier = weiter;
      }
      const zahlen = [];
      for (const z of zellen) if (zahlAn[z]) zahlen.push(zahlAn[z]);
      stuecke.push({ zellen, zahlen, eins: zahlen.includes(1), ende: zahlen.includes(hoechste) });
    }
    for (let i = 0; i < n; i += 1) {
      if (stueckVon[i] < 0) return { art: 'widerspruch', grund: 'ring', zelle: i };
    }
    for (const st of stuecke) {
      const z = st.zahlen;
      for (let p = 1; p < z.length; p += 1) {
        if (Math.abs(z[p] - z[p - 1]) !== 1 || z[p] - z[p - 1] !== z[1] - z[0]) {
          return { art: 'widerspruch', grund: 'reihe', folge: [z[p - 1], z[p]], zelle: st.zellen[0] };
        }
      }
      if (st.eins && st.ende) {
        return st.zellen.length === n ? { art: 'geloest' } : { art: 'widerspruch', grund: 'schluss', zelle: st.zellen[0] };
      }
    }

    // Die Zahlen eines Stücks, vom Ende `zelle` aus gelesen.
    const vonEnde = (st, zelle) => (st.zellen[0] === zelle ? st.zahlen : st.zahlen.slice().reverse());

    const grundGegen = (x, y) => {
      if (an[y].length >= bedarf[y]) return { grund: 'voll', zelle: y };
      if (an[x].length >= bedarf[x]) return { grund: 'voll', zelle: x };
      const sx = stuecke[stueckVon[x]];
      const sy = stuecke[stueckVon[y]];
      if (sx === sy) return { grund: 'ring' };
      if (((sx.eins && sy.ende) || (sx.ende && sy.eins)) && sx.zellen.length + sy.zellen.length < n) {
        return { grund: 'schluss' };
      }
      const A = vonEnde(sx, x);
      const B = vonEnde(sy, y);
      if (A.length && B.length) {
        const d = B[0] - A[0];
        if (Math.abs(d) !== 1 || (A.length > 1 && A[1] - A[0] !== -d) || (B.length > 1 && B[1] - B[0] !== d)) {
          return { grund: 'reihe', folge: [...A.slice(0, 2).reverse(), ...B.slice(0, 2)] };
        }
      }
      return null;
    };

    // Für jedes Feld die offenen Verbindungen, die noch in Frage kommen.
    const frei = [];
    for (let i = 0; i < n; i += 1) frei.push([]);
    for (let i = 0; i < n; i += 1) {
      for (const j of nb[i]) {
        if (j < i || an[i].includes(j)) continue;
        if (grundGegen(i, j)) continue;
        frei[i].push(j);
        frei[j].push(i);
      }
    }

    for (let i = 0; i < n; i += 1) {
      if (an[i].length + frei[i].length < bedarf[i]) return { art: 'widerspruch', grund: 'sackgasse', zelle: i };
    }

    // Kommt der Weg über das, was noch möglich ist, überhaupt überall hin?
    const erreicht = new Uint8Array(n);
    const stapel = [0];
    erreicht[0] = 1;
    let gesehen = 1;
    while (stapel.length) {
      const v = stapel.pop();
      for (const w of an[v].concat(frei[v])) {
        if (erreicht[w]) continue;
        erreicht[w] = 1;
        gesehen += 1;
        stapel.push(w);
      }
    }
    if (gesehen < n) {
      // Genannt wird der kleinere Teil – den sieht man auf dem Brett schneller.
      const draussen = [];
      const drinnen = [];
      for (let i = 0; i < n; i += 1) (erreicht[i] ? drinnen : draussen).push(i);
      const teil = draussen.length <= drinnen.length ? draussen : drinnen;
      return { art: 'widerspruch', grund: 'getrennt', zellen: teil, zelle: teil[0] };
    }

    const reihenfolge = vorne >= 0 ? [vorne] : [];
    for (let i = 0; i < n; i += 1) if (i !== vorne) reihenfolge.push(i);

    for (const i of reihenfolge) {
      if (an[i].length >= bedarf[i] || an[i].length + frei[i].length !== bedarf[i]) continue;
      // Für die Begründung: warum jede andere Richtung ausscheidet.
      const raus = [];
      for (const j of nachbarnVon(i, b.k)) {
        if (an[i].includes(j) || frei[i].includes(j)) continue;
        raus.push({ zelle: j, ...(nb[i].includes(j) ? grundGegen(i, j) : { grund: 'mauer' }) });
      }
      return {
        art: 'zwang',
        zelle: i,
        schon: an[i].slice(),
        ziele: frei[i].slice(),
        neu: frei[i].map((j) => kante(i, j)),
        raus,
      };
    }
    return null;
  }

  /* Schlüsse ziehen, bis nichts mehr geht. Jeder Schluss legt mindestens
     eine Verbindung fest, und mehr als n − 1 passen nicht aufs Brett – die
     Schleife endet also von selbst; die Grenze ist nur Gurt und Hosenträger. */
  function schliessen(b, fest) {
    const f = new Set(fest);
    for (let runde = 0; runde <= 2 * b.n; runde += 1) {
      const s = naechsterSchluss(b, f);
      if (!s || s.art === 'widerspruch') return { geloest: false, fest: f, schluss: s };
      if (s.art === 'geloest') return { geloest: true, fest: f };
      for (const e of s.neu) f.add(e);
    }
    return { geloest: false, fest: f, schluss: null };
  }

  function raetselBauen(stufe) {
    const { kanten: k, ziele, mauern: mauerZahl } = STUFEN[stufe];
    const n = k * k;
    const weg = wegSuchen(k) || schlange(k);
    const mauern = mauernWaehlen(k, weg, mauerZahl);

    const zahlAn = new Array(n).fill(0);
    let hoechste = 0;
    const aufgabe = (stellen) => {
      zahlAn.fill(0);
      const sortiert = [...stellen].sort((a, b) => a - b);
      sortiert.forEach((pos, nr) => { zahlAn[weg[pos]] = nr + 1; });
      hoechste = sortiert.length;
      return brettVon(k, zahlAn, hoechste, mauern);
    };

    // Anfang, Ende und ein paar Zahlen dazwischen.
    const stellen = new Set([0, n - 1]);
    while (stellen.size < ziele) stellen.add(1 + Math.floor(Math.random() * (n - 2)));

    /* Kommen die Schlüsse nicht bis zum Ende, bekommt ein Feld eine Zahl, an
       dem sie hängen geblieben sind. Das endet sicher: sind alle Felder
       nummeriert, ergibt sich jede Verbindung schon aus der Reihe. */
    let stand = schliessen(aufgabe(stellen), []);
    while (!stand.geloest) {
      const grad = new Array(n).fill(0);
      for (const e of stand.fest) for (const z of kanteZerlegen(e)) grad[z] += 1;
      let offen = [];
      for (let p = 1; p < n - 1; p += 1) if (!stellen.has(p) && grad[weg[p]] < 2) offen.push(p);
      if (!offen.length) offen = [...Array(n).keys()].filter((p) => !stellen.has(p));
      stellen.add(offen[Math.floor(Math.random() * offen.length)]);
      stand = schliessen(aufgabe(stellen), []);
    }

    /* Nachgeschobene Zahlen machen das Rätsel oft leichter als nötig. Was
       sich wieder wegnehmen lässt, ohne dass die Schlüsse steckenbleiben,
       fliegt raus – bis auf die Grundzahl der Stufe. */
    for (const p of mischen([...stellen].filter((x) => x !== 0 && x !== n - 1))) {
      if (stellen.size <= ziele) break;
      stellen.delete(p);
      if (!schliessen(aufgabe(stellen), []).geloest) stellen.add(p);
    }
    aufgabe(stellen);

    return {
      kanten: k,
      zahlAn: zahlAn.slice(),
      hoechste,
      loesung: weg,
      mauern: [...mauern],
    };
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let ersetzt = false;    // Wurde ein gespeichertes Rätsel verworfen? Für die Meldung.
    let stand = laden();
    let zieht = null;       // Zeiger-Nummer, solange gewischt wird
    let uhr = null;
    let mauern = new Set();   // Nachschlagewerk zum Feld stand.mauern

    const mauernUebernehmen = () => { mauern = new Set(stand.mauern || []); };

    function frisch(stufe) {
      const r = raetselBauen(stufe);
      return {
        stufe,
        kanten: r.kanten,
        zahlAn: r.zahlAn,
        hoechste: r.hoechste,
        /* Wird im Spiel nicht mehr gelesen. Bleibt drin, damit eine Sicherung
           von hier in einer älteren Fassung noch lädt – deren Hinweis griff
           darauf zu. */
        loesung: r.loesung,
        mauern: r.mauern || [],
        notizen: [],          // Merklinien aus Hinweisen, als Kanten "a:b"
        pfad: [],
        verbraucht: 0,
        seit: Date.now(),
        hilfen: 0,
        fertig: false,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.pfad) && alt.kanten && !alt.fertig
        && Array.isArray(alt.zahlAn) && alt.zahlAn.length === alt.kanten * alt.kanten) {
        if (!Array.isArray(alt.mauern)) alt.mauern = [];   // Rätsel von früher
        if (!Array.isArray(alt.notizen)) alt.notizen = [];
        /* Frühere Fassungen haben nur auf genau einen Weg geachtet, nicht
           darauf, dass er sich herleiten lässt. Mit so einem Rätsel käme der
           Hinweis irgendwann nicht weiter – dann lieber gleich ein neues. */
        if (schliessen(brettVon(alt.kanten, alt.zahlAn, alt.hoechste, new Set(alt.mauern)), []).geloest) {
          alt.seit = Date.now();
          return alt;
        }
        ersetzt = true;
        return frisch(STUFEN[alt.stufe] && STUFEN[alt.stufe].kanten === alt.kanten ? alt.stufe : 'leicht');
      }
      return frisch('leicht');
    }

    mauernUebernehmen();

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
    const buehne = el('div', 'p-buehne');
    const gitter = el('div', 'p-gitter');
    const linie = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    linie.classList.add('p-linie');
    buehne.append(gitter, linie);
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste');
    wurzel.append(kopf, buehne, endeKasten, leiste);

    const zurueckKnopf = el('button', 'knopf knopf--still', 'Ein Feld zurück');
    zurueckKnopf.type = 'button';
    zurueckKnopf.addEventListener('click', () => {
      if (stand.fertig || !stand.pfad.length) return;
      stand.pfad.pop();
      sichern();
      zeichnen();
    });
    const leerenKnopf = el('button', 'knopf knopf--still', 'Von vorn');
    leerenKnopf.type = 'button';
    leerenKnopf.addEventListener('click', () => {
      if (stand.fertig) return;
      stand.pfad = [];
      sichern();
      zeichnen();
    });
    const hinweisKnopf = el('button', 'knopf knopf--still', 'Hinweis');
    hinweisKnopf.type = 'button';
    hinweisKnopf.addEventListener('click', hinweis);
    leiste.append(zurueckKnopf, leerenKnopf, hinweisKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neues Rätsel', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    let felder = [];

    function gitterBauen() {
      const k = stand.kanten;
      gitter.style.setProperty('--kanten', String(k));
      const platz = Math.min(340, window.innerWidth - 30);
      const zelle = Math.floor(platz / k);
      buehne.style.setProperty('--zelle', zelle + 'px');
      buehne.style.setProperty('--kanten', String(k));
      linie.setAttribute('viewBox', '0 0 ' + k + ' ' + k);

      gitter.replaceChildren();
      felder = [];
      for (let i = 0; i < k * k; i += 1) {
        const f = el('button', 'p-feld');
        f.type = 'button';
        const nr = i;
        f.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          /* Beim Finger fängt der Browser den Zeiger sonst am Startfeld ein.
             Danach bekämen die übrigen Felder vom Darüberfahren nichts mehr
             mit – deshalb geben wir ihn gleich wieder frei. */
          if (f.hasPointerCapture(e.pointerId)) f.releasePointerCapture(e.pointerId);
          zieht = e.pointerId;
          letztesFeld = nr;
          anfassen(nr);
        });
        gitter.append(f);
        felder.push(f);
      }
    }

    /* Welches Feld liegt unter dem Zeiger? Über den Punkt statt über
       pointerenter, weil das mit dem Finger zuverlässiger ist. */
    const feldUnter = (e) => {
      const ziel = document.elementFromPoint(e.clientX, e.clientY);
      const feld = ziel && ziel.closest ? ziel.closest('.p-feld') : null;
      return feld ? felder.indexOf(feld) : -1;
    };

    /* Beim schnellen Wischen kann ein Feld übersprungen werden. Liegt genau
       eines gerade zwischen dem letzten und dem neuen, wird es nachgeholt;
       über Eck bleibt es liegen, da wären zwei Wege denkbar. */
    function nachziehen(i) {
      const pfad = stand.pfad;
      const k = stand.kanten;
      const letzter = pfad.length ? pfad[pfad.length - 1] : -1;
      if (letzter >= 0 && !nachbarnVon(letzter, k, mauern).includes(i)) {
        const z1 = Math.floor(letzter / k); const s1 = letzter % k;
        const z2 = Math.floor(i / k); const s2 = i % k;
        if (z1 === z2 && Math.abs(s1 - s2) === 2) anfassen(z1 * k + (s1 + s2) / 2);
        else if (s1 === s2 && Math.abs(z1 - z2) === 2) anfassen(((z1 + z2) / 2) * k + s1);
      }
      anfassen(i);
    }

    /* Innerhalb eines Feldes kommen viele Meldungen. Ohne dieses Gedächtnis
       würde ein unerlaubtes Feld bei jeder einzelnen davon meckern. */
    let letztesFeld = -1;

    const beiBewegung = (e) => {
      if (zieht === null || e.pointerId !== zieht) return;
      const i = feldUnter(e);
      if (i < 0 || i === letztesFeld) return;
      letztesFeld = i;
      nachziehen(i);
    };

    const beiLoslassen = () => { zieht = null; letztesFeld = -1; };
    window.addEventListener('pointermove', beiBewegung);
    window.addEventListener('pointerup', beiLoslassen);
    window.addEventListener('pointercancel', beiLoslassen);

    /* ---------------------------------------------------------------- Zug */

    /* Wie viele Zahlen sind bisher abgeklappert? */
    function erreichteZahl(pfad) {
      let hoch = 0;
      for (const i of pfad) if (stand.zahlAn[i]) hoch = Math.max(hoch, stand.zahlAn[i]);
      return hoch;
    }

    function anfassen(i) {
      if (stand.fertig) return;
      const pfad = stand.pfad;

      if (!pfad.length) {
        // Losgehen darf man nur bei der 1.
        if (stand.zahlAn[i] !== 1) { s.toast('Der Weg beginnt bei der 1.'); return; }
        pfad.push(i);
        sichern();
        zeichnen();
        return;
      }

      const letzter = pfad[pfad.length - 1];
      if (i === letzter) return;

      // Auf das vorletzte Feld zurück heißt: einen Schritt zurücknehmen.
      if (pfad.length > 1 && i === pfad[pfad.length - 2]) {
        pfad.pop();
        sichern();
        zeichnen();
        return;
      }

      if (!nachbarnVon(letzter, stand.kanten, mauern).includes(i)) {
        if (nachbarnVon(letzter, stand.kanten).includes(i)) s.toast('Da ist eine Mauer dazwischen.');
        return;
      }
      if (pfad.includes(i)) return;

      const zahl = stand.zahlAn[i];
      if (zahl && zahl !== erreichteZahl(pfad) + 1) {
        s.toast('Erst die ' + (erreichteZahl(pfad) + 1) + '.');
        return;
      }

      pfad.push(i);
      sichern();
      zeichnen();
      pruefenObFertig();
    }

    /* ------------------------------------------------------------ Hinweis */

    const platzName = (i) => 'Zeile ' + (Math.floor(i / stand.kanten) + 1) + ', Spalte ' + ((i % stand.kanten) + 1);
    const gross = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    const aufzaehlen = (teile) => (teile.length < 2 ? teile.join('')
      : teile.slice(0, -1).join(', ') + ' und ' + teile[teile.length - 1]);
    const istEnde = (i) => stand.zahlAn[i] === 1 || stand.zahlAn[i] === stand.hoechste;
    // Nummerierte Felder heißen nach ihrer Zahl – so findet man sie am schnellsten.
    const feldName = (i) => (stand.zahlAn[i] ? 'die ' + stand.zahlAn[i] : 'das Feld in ' + platzName(i));
    const richtung = (von, nach) => {
      const k = stand.kanten;
      if (nach === von - k) return 'oben';
      if (nach === von + k) return 'unten';
      return nach === von - 1 ? 'links' : 'rechts';
    };

    // Was als sicher gilt: der gezogene Weg und die Merklinien.
    const festJetzt = () => {
      const f = new Set(stand.notizen);
      for (let p = 1; p < stand.pfad.length; p += 1) f.add(kante(stand.pfad[p - 1], stand.pfad[p]));
      return f;
    };

    function ausschlussText(i, r) {
      const wo = richtung(i, r.zelle);
      switch (r.grund) {
        case 'mauer': return wo + ' steht eine Mauer';
        case 'voll':
          if (istEnde(r.zelle)) return wo + ' hat die ' + stand.zahlAn[r.zelle] + ' ihre einzige Verbindung schon';
          return wo + ' ist ' + (stand.zahlAn[r.zelle] ? 'die ' + stand.zahlAn[r.zelle] : 'das Nachbarfeld') + ' schon zweimal verbunden';
        case 'ring': return 'nach ' + wo + ' schlösse sich der Weg zu einem Ring';
        case 'schluss': return 'nach ' + wo + ' hingen die 1 und die ' + stand.hoechste + ' aneinander, bevor alle Felder dran sind';
        default: return 'nach ' + wo + ' kämen die Zahlen in der Folge ' + r.folge.join(', ') + ' statt der Reihe nach';
      }
    }

    function zwangText(sch) {
      const i = sch.zelle;
      const saetze = [];
      if (istEnde(i)) {
        saetze.push(gross(feldName(i)) + ' ist ' + (stand.zahlAn[i] === 1 ? 'der Anfang' : 'das Ende')
          + ' des Wegs und hat genau eine Verbindung.');
      } else if (sch.schon.length) {
        saetze.push(gross(feldName(i)) + ' ist von ' + richtung(i, sch.schon[0]) + ' her schon verbunden und muss noch weiter.');
      } else {
        saetze.push(gross(feldName(i)) + ' muss betreten und wieder verlassen werden.');
      }
      const rand = nachbarnVon(i, stand.kanten).length;
      if (rand < 4) saetze.push((stand.zahlAn[i] ? 'Sie' : 'Es') + (rand === 2 ? ' liegt in der Ecke.' : ' liegt am Rand.'));
      const gruende = sch.raus.map((r) => ausschlussText(i, r));
      if (gruende.length) saetze.push(gross(aufzaehlen(gruende)) + '.');
      const wege = sch.ziele.map((j) => richtung(i, j));
      saetze.push((wege.length === 1 ? 'Bleibt nur ' : 'Bleiben nur ') + aufzaehlen(wege) + ' – dort muss der Weg entlang.');
      return saetze.join(' ');
    }

    function widerspruchText(w) {
      switch (w.grund) {
        case 'sackgasse':
          return gross(feldName(w.zelle)) + ' hat nicht mehr genug freie Nachbarn, um '
            + (istEnde(w.zelle) ? 'erreicht' : 'betreten und wieder verlassen') + ' zu werden – eine Sackgasse.';
        case 'getrennt':
          return (w.zellen.length === 1 ? gross(feldName(w.zelle)) + ' ist'
            : w.zellen.length + ' Felder, darunter ' + feldName(w.zelle) + ', sind')
            + ' vom Rest abgeschnitten – der Weg käme nicht mehr überall hin.';
        case 'ring': return 'Der Weg hätte sich zu einem Ring geschlossen.';
        case 'schluss': return 'Die 1 und die ' + stand.hoechste + ' hingen schon aneinander, obwohl noch Felder frei sind.';
        case 'reihe': return 'Die ' + w.folge.join(' und die ') + ' lägen direkt hintereinander.';
        /* Bleibt „voll": Der gezogene Weg kann ein Feld nicht zweimal
           betreten, zu viele Verbindungen entstehen also nur zusammen mit
           Merklinien – das darf der Satz dann auch so sagen. */
        default:
          return 'Die gestrichelten Linien legen für ' + feldName(w.zelle) + ' schon '
            + (istEnde(w.zelle) ? 'die einzige Verbindung' : 'beide Verbindungen') + ' fest, dein Weg käme noch dazu.';
      }
    }

    /* Was an der Spitze des Wegs hängt, wird gleich gezogen – dafür ist der
       Hinweis ja da. Alles andere bleibt als Merklinie liegen, bis der Weg
       dort ankommt; sonst müsste man sich den Schluss merken. */
    function einzeichnen(neu) {
      const offen = new Set(neu);
      const pfad = stand.pfad;
      const eins = stand.zahlAn.indexOf(1);
      if (!pfad.length && [...offen].some((e) => kanteZerlegen(e).includes(eins))) pfad.push(eins);
      let weiter = pfad.length > 0;
      while (weiter) {
        weiter = false;
        const kopf = pfad[pfad.length - 1];
        for (const e of offen) {
          const [x, y] = kanteZerlegen(e);
          const dort = x === kopf ? y : y === kopf ? x : -1;
          if (dort < 0 || pfad.includes(dort)) continue;
          if (stand.zahlAn[dort] && stand.zahlAn[dort] !== erreichteZahl(pfad) + 1) continue;
          pfad.push(dort);
          offen.delete(e);
          weiter = true;
          break;
        }
      }
      for (const e of offen) if (!stand.notizen.includes(e)) stand.notizen.push(e);
    }

    // Den Weg entlang aller sicheren Verbindungen so weit ziehen, wie sie reichen.
    function linienFolgen() {
      const f = festJetzt();
      const pfad = stand.pfad;
      if (!pfad.length) pfad.push(stand.zahlAn.indexOf(1));
      for (let weiter = true; weiter;) {
        weiter = false;
        const kopf = pfad[pfad.length - 1];
        for (const j of nachbarnVon(kopf, stand.kanten, mauern)) {
          if (pfad.includes(j) || !f.has(kante(kopf, j))) continue;
          pfad.push(j);
          weiter = true;
          break;
        }
      }
    }

    /* Der Hinweis schaut nicht in stand.loesung. Er zieht dieselben Schlüsse
       wie der Erzeuger und nennt einen davon samt Grund. */
    function hinweis() {
      if (stand.fertig) return;
      stand.hilfen += 1;
      sichern();

      const b = brettVon(stand.kanten, stand.zahlAn, stand.hoechste, mauern);
      const pfad = stand.pfad;

      /* Falsches kommt zuerst. Vom leeren Brett aus leiten die Schlüsse das
         ganze Rätsel her; ein gezogener Schritt, der dort nicht vorkommt,
         führt in die Irre. Als Grund wird gesucht, woran es scheitert – nicht
         „weil die Lösung anders aussieht". */
      const hergeleitet = schliessen(b, []);
      if (hergeleitet.geloest) {
        stand.notizen = stand.notizen.filter((e) => hergeleitet.fest.has(e));
        let gut = Math.min(1, pfad.length);
        while (gut < pfad.length && hergeleitet.fest.has(kante(pfad[gut - 1], pfad[gut]))) gut += 1;
        if (gut < pfad.length) {
          const sofort = naechsterSchluss(b, festJetzt());
          const spaeter = schliessen(b, festJetzt()).schluss;
          let grund;
          if (sofort && sofort.art === 'widerspruch') {
            grund = widerspruchText(sofort);
          } else if (spaeter && spaeter.art === 'widerspruch') {
            grund = 'Zieht man von dort nur zwingende Schritte weiter, geht es nicht auf: ' + widerspruchText(spaeter);
          } else {
            grund = 'Aus Zahlen und Mauern lässt sich herleiten, dass der Weg dort nicht entlangführt.';
          }
          s.blatt({
            titel: 'Ab hier führt es in die Irre',
            inhalt: 'Die ersten ' + gut + ' Felder stimmen, der Schritt auf ' + platzName(pfad[gut]) + ' nicht. '
              + grund + ' Soll ich bis dorthin zurücknehmen?',
            aktionen: [
              { text: 'Zurücknehmen', tun: () => { stand.pfad = stand.pfad.slice(0, gut); sichern(); zeichnen(); } },
              { text: 'Selbst suchen', art: 'still' },
            ],
          });
          return;
        }
      }

      const spitze = pfad.length ? pfad[pfad.length - 1] : stand.zahlAn.indexOf(1);
      const sch = naechsterSchluss(b, festJetzt(), spitze);

      if (sch && sch.art === 'zwang') {
        s.blatt({
          titel: sch.ziele.length === 1 ? 'Nur eine Richtung bleibt' : 'Nur noch zwei Nachbarn',
          inhalt: zwangText(sch),
          aktionen: [
            { text: 'Einzeichnen', tun: () => { einzeichnen(sch.neu); sichern(); zeichnen(); pruefenObFertig(); } },
            { text: 'Selbst ziehen', art: 'still' },
          ],
        });
      } else if (sch && sch.art === 'geloest') {
        s.blatt({
          titel: 'Alles hergeleitet',
          inhalt: 'Die gestrichelten Linien und dein Weg ergeben zusammen schon den ganzen Weg. '
            + 'Zieh ihn entlang der Linien bis zur ' + stand.hoechste + '.',
          aktionen: [
            { text: 'Nachziehen', tun: () => { linienFolgen(); sichern(); zeichnen(); pruefenObFertig(); } },
            { text: 'Selbst ziehen', art: 'still' },
          ],
        });
      } else if (sch) {
        s.blatt({
          titel: 'So geht es nicht mehr auf',
          inhalt: widerspruchText(sch) + ' Nimm ein paar Schritte zurück.',
          aktionen: [{ text: 'Verstanden' }],
        });
      } else {
        s.blatt({
          titel: 'Hier sehe ich nichts Zwingendes',
          inhalt: 'Mit den einfachen Schlüssen komme ich gerade nicht weiter. Bei einem frisch gebauten '
            + 'Rätsel sollte das nicht vorkommen.',
          aktionen: [{ text: 'Verstanden' }],
        });
      }
    }

    function pruefenObFertig() {
      if (stand.fertig) return;
      const k = stand.kanten;
      if (stand.pfad.length !== k * k) return;
      if (erreichteZahl(stand.pfad) !== stand.hoechste) return;
      if (stand.zahlAn[stand.pfad[stand.pfad.length - 1]] !== stand.hoechste) return;

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
      const k = stand.kanten;
      for (let i = 0; i < felder.length; i += 1) {
        const f = felder[i];
        const zahl = stand.zahlAn[i];
        f.textContent = zahl ? String(zahl) : '';
        f.dataset.zahl = zahl ? 'ja' : 'nein';
        const platz = stand.pfad.indexOf(i);
        f.dataset.besucht = platz >= 0 ? 'ja' : 'nein';
        if (platz === stand.pfad.length - 1 && platz >= 0) f.dataset.spitze = 'ja';
        else delete f.dataset.spitze;
      }

      // Der Weg als eine durchgehende Linie über dem Gitter.
      linie.replaceChildren();

      // Mauern zuerst, damit der eigene Weg darüber liegt.
      for (const e of mauern) {
        const [a, b] = e.split(':').map(Number);
        const z = Math.floor(a / k);
        const sp = a % k;
        const strich = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        if (b === a + 1) {
          strich.setAttribute('x1', String(sp + 1)); strich.setAttribute('y1', String(z));
          strich.setAttribute('x2', String(sp + 1)); strich.setAttribute('y2', String(z + 1));
        } else {
          strich.setAttribute('x1', String(sp)); strich.setAttribute('y1', String(z + 1));
          strich.setAttribute('x2', String(sp + 1)); strich.setAttribute('y2', String(z + 1));
        }
        strich.setAttribute('class', 'p-mauer');
        strich.setAttribute('stroke-width', '0.14');
        strich.setAttribute('stroke-linecap', 'round');
        linie.append(strich);
      }
      // Merklinien aus Hinweisen – unter dem Weg, damit gezogene Stücke sie verdecken.
      for (const e of stand.notizen) {
        const [a, c] = kanteZerlegen(e);
        const strich = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        strich.setAttribute('x1', String((a % k) + 0.5)); strich.setAttribute('y1', String(Math.floor(a / k) + 0.5));
        strich.setAttribute('x2', String((c % k) + 0.5)); strich.setAttribute('y2', String(Math.floor(c / k) + 0.5));
        strich.setAttribute('class', 'p-notiz');
        strich.setAttribute('stroke-width', '0.12');
        strich.setAttribute('stroke-dasharray', '0.16 0.12');
        strich.setAttribute('stroke-linecap', 'round');
        linie.append(strich);
      }
      if (stand.pfad.length > 1) {
        const zug = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        zug.setAttribute('points', stand.pfad
          .map((i) => ((i % k) + 0.5) + ',' + (Math.floor(i / k) + 0.5)).join(' '));
        zug.setAttribute('fill', 'none');
        zug.setAttribute('stroke-width', '0.34');
        zug.setAttribute('stroke-linecap', 'round');
        zug.setAttribute('stroke-linejoin', 'round');
        linie.append(zug);
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
      kopf.append(el('span', null, stand.pfad.length + '/' + (stand.kanten * stand.kanten) + ' Felder'));
      s.unter('Zahl ' + Math.max(1, erreichteZahl(stand.pfad)) + ' von ' + stand.hoechste);
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !stand.fertig;
      if (!stand.fertig) return;
      endeKasten.append(el('p', 'ende-titel', 'Weg gefunden.'));
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

    /* Ein 7×7-Rätsel ist meist in Millisekunden gebaut, auf einem langsamen
       Handy im schlechtesten Fall spürbar länger. Damit die Oberfläche dann
       nicht stumm einfriert, erst melden, dann im nächsten Anlauf rechnen. */
    function neu(stufe) {
      const bauen = () => {
        stand = frisch(stufe);
        mauernUebernehmen();
        gitterBauen();
        sichern();
        zeichnen();
      };
      if (STUFEN[stufe].kanten >= 7) {
        s.toast('Der Weg wird gesucht – einen Moment.');
        setTimeout(bauen, 60);
      } else {
        bauen();
      }
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neues Rätsel',
        inhalt: 'Leicht ist 5 × 5, mittel 6 × 6, schwer 7 × 7. Jedes Rätsel hat genau einen möglichen Weg, und der lässt sich ohne Raten herleiten.',
        aktionen: [
          { text: 'Leicht', tun: () => neu('leicht') },
          { text: 'Mittel', art: 'still', tun: () => neu('mittel') },
          { text: 'Schwer', art: 'still', tun: () => neu('schwer') },
        ],
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Ziehe einen Weg, der bei der 1 beginnt und die Zahlen der Reihe nach abklappert – 1, dann 2, dann 3 und so fort.'));
      d.append(el('p', 'notiz', 'Der Weg muss am Ende jedes einzelne Feld genau einmal berührt haben und bei der höchsten Zahl enden. Kein Feld bleibt frei, keines wird zweimal betreten.'));
      d.append(el('p', 'notiz', 'Gezogen wird mit dem Finger oder der Maus über benachbarte Felder – nur waagerecht und senkrecht, nicht über Eck. Auf das vorletzte Feld zurückziehen nimmt einen Schritt zurück.'));
      d.append(el('p', 'notiz', 'Auf „schwer" stehen dicke Striche zwischen manchen Feldern: Da ist eine Mauer, dort kommt der Weg nicht durch. Sie verraten mehr, als sie verbieten – deshalb braucht die schwere Stufe weniger Zahlen als früher.'));
      d.append(el('p', 'notiz', 'Guter Anfang: Ecken und Ränder. Ein Eckfeld hat nur zwei Nachbarn, der Weg muss dort also fast zwangsläufig durch.'));
      s.blatt({ titel: 'Weg', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function beiGroesse() { gitterBauen(); zeichnen(); }
    window.addEventListener('resize', beiGroesse);

    gitterBauen();
    sichern();
    zeichnen();
    if (ersetzt) s.toast('Das gespeicherte Rätsel stammte aus einer älteren Fassung und ließ sich nicht ohne Raten lösen – hier ist ein neues.');
    uhr = setInterval(() => { if (!stand.fertig) kopfZeichnen(); }, 1000);

    return {
      ende: () => {
        clearInterval(uhr);
        window.removeEventListener('resize', beiGroesse);
        window.removeEventListener('pointermove', beiBewegung);
        window.removeEventListener('pointerup', beiLoslassen);
        window.removeEventListener('pointercancel', beiLoslassen);
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
      { wert: bestzeit('leicht'), label: 'Bestzeit 5×5' },
      { wert: bestzeit('mittel'), label: 'Bestzeit 6×6' },
      { wert: bestzeit('schwer'), label: 'Bestzeit 7×7' },
    ];
  }

  Rahmen.anmelden({
    id: 'zip',
    name: 'Weg',
    unter: 'Ein Zug durch jedes Feld.',
    farbe: '#4573B8',
    symbol: '<path d="M5 5h6a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="5" cy="5" r="1.6"/><circle cx="14" cy="17" r="1.6"/>',
    starten,
    auswertung,
  });
})();
