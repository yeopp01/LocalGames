/* LocalGames – Rahmen.

   Der Rahmen kennt kein einziges Spiel. Er hält die Auswahl (das Dashboard),
   den Speicher, die gemeinsame Statistik und die Sicherung. Jedes Spiel meldet
   sich mit Rahmen.anmelden({...}) an und bekommt beim Start eine Sitzung –
   darüber läuft alles, was ein Spiel vom Rahmen braucht.

   Alle Daten liegen in localStorage: kein Konto, keine Anmeldung, nichts davon
   verlässt das Gerät. Das Netz wird an genau einer Stelle berührt – der
   anonyme Aufrufzähler weiter unten in dieser Datei.
*/

const Rahmen = (() => {
  const SPEICHER = 'localgames.v1';
  const MAX_PARTIEN = 5000;

  /* ---------------------------------------------------------------- Speicher */

  const leer = () => ({ version: 1, partien: [], stand: {} });

  let daten = leer();

  function laden() {
    try {
      const roh = localStorage.getItem(SPEICHER);
      if (!roh) return leer();
      const d = JSON.parse(roh);
      if (!d || typeof d !== 'object') return leer();
      return {
        version: 1,
        partien: Array.isArray(d.partien) ? d.partien : [],
        stand: d.stand && typeof d.stand === 'object' ? d.stand : {},
      };
    } catch (e) {
      return leer();
    }
  }

  let schreibgesperrt = false;
  function sichern() {
    if (schreibgesperrt) return;
    try {
      localStorage.setItem(SPEICHER, JSON.stringify(daten));
    } catch (e) {
      schreibgesperrt = true;
      toast('Der Speicher des Browsers ist voll.');
    }
  }

  /* ------------------------------------------------------------- Kleinkram */

  const el = (name, klasse, text) => {
    const k = document.createElement(name);
    if (klasse) k.className = klasse;
    if (text != null) k.textContent = text;
    return k;
  };

  const kennung = () =>
    Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

  const tagVon = (iso) => new Date(iso).toISOString().slice(0, 10);
  const heute = () => new Date().toISOString().slice(0, 10);

  function dauerText(ms) {
    if (!ms || ms < 0) return '–';
    const s = Math.round(ms / 1000);
    if (s < 60) return s + ' s';
    const m = Math.floor(s / 60);
    const r = s % 60;
    if (m < 60) return m + ':' + String(r).padStart(2, '0');
    return Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
  }

  function zeitspanne(ms) {
    if (ms < 60000) return Math.round(ms / 1000) + ' s';
    const min = Math.round(ms / 60000);
    if (min < 60) return min + ' min';
    const h = Math.floor(min / 60);
    return h + ' h ' + String(min % 60).padStart(2, '0') + ' min';
  }

  const prozent = (a, b) => (b ? Math.round((a / b) * 100) + ' %' : '–');

  /* Eine Zeile bei GoatCounter, mehr nicht: kein Cookie, keine Kennung,
     nichts aus der Statistik. Fehlt das Script (offline, Blocker, Datei
     per Doppelklick), passiert einfach gar nichts. */
  function zaehlen(pfad, titel) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: pfad, title: titel, event: true });
      }
    } catch (e) { /* egal */ }
  }

  /* --------------------------------------------------------------- Register */

  const spiele = [];
  const nachId = (id) => spiele.find((s) => s.id === id);

  function anmelden(spiel) {
    spiele.push(spiel);
    if (bereit) zeichnen();
  }

  /* Nicht jede Partie lässt sich in gewonnen und verloren teilen. Eine Runde
     „Wer am ehesten" hat gar keinen Sieger, und bei Vier gewinnt zu zweit
     gewinnt zwar jemand, aber niemand, den das Gerät kennt.

     Solche Partien lassen das Feld gewonnen einfach weg. Sie zählen als
     gespielt – in der Spielzeit, im Kalender, in der Tagesserie – aber nicht
     in der Quote. Das ist feiner als eine Angabe am Spiel, weil dasselbe Spiel
     beides können darf: gegen den Rechner mit Urteil, zu zweit ohne. */
  const mitUrteil = (liste) => liste.filter((p) => typeof p.gewonnen === 'boolean');
  const siegquote = (liste) => {
    const u = mitUrteil(liste);
    return prozent(u.filter((p) => p.gewonnen).length, u.length);
  };

  /* ------------------------------------------------------------------ Toast */

  let toastUhr = null;
  function toast(text) {
    const kasten = document.getElementById('toast');
    document.getElementById('toast-text').textContent = text;
    kasten.hidden = false;
    clearTimeout(toastUhr);
    toastUhr = setTimeout(() => { kasten.hidden = true; }, 2600);
  }

  /* ------------------------------------------------------------------ Blatt */

  function blattZeigen({ titel, inhalt, aktionen }) {
    const huelle = document.getElementById('sheet-spiel');
    document.getElementById('sheet-spiel-titel').textContent = titel || '';
    const koerper = document.getElementById('sheet-spiel-inhalt');
    koerper.replaceChildren();
    if (typeof inhalt === 'string') {
      const p = el('p', 'notiz', inhalt);
      koerper.append(p);
    } else if (inhalt) {
      koerper.append(inhalt);
    }
    const leiste = document.getElementById('sheet-spiel-aktionen');
    leiste.replaceChildren();
    for (const a of aktionen || [{ text: 'Fertig' }]) {
      const b = el('button', 'knopf ' + (a.art === 'still' ? 'knopf--still' : 'knopf--voll'), a.text);
      b.type = 'button';
      b.addEventListener('click', () => { blattZu(); if (a.tun) a.tun(); });
      leiste.append(b);
    }
    huelle.hidden = false;
  }

  const blattZu = () => { document.getElementById('sheet-spiel').hidden = true; };

  /* ------------------------------------------------------------- Statistik */

  function partienVon(spielId) {
    return daten.partien.filter((p) => p.spiel === spielId);
  }

  function notieren(spielId, partie) {
    const eintrag = Object.assign(
      { id: kennung(), spiel: spielId, ende: new Date().toISOString() },
      partie
    );
    daten.partien.push(eintrag);
    if (daten.partien.length > MAX_PARTIEN) {
      daten.partien = daten.partien.slice(-MAX_PARTIEN);
    }
    sichern();
    return eintrag;
  }

  /* Tagesserie: wie viele Tage am Stück wurde zuletzt gespielt? */
  function serie(partien) {
    const tage = new Set(partien.map((p) => tagVon(p.ende)));
    if (!tage.size) return 0;
    let zaehler = 0;
    const zeiger = new Date();
    // Wer heute noch nicht gespielt hat, verliert die Serie noch nicht.
    if (!tage.has(zeiger.toISOString().slice(0, 10))) zeiger.setDate(zeiger.getDate() - 1);
    for (;;) {
      const t = zeiger.toISOString().slice(0, 10);
      if (!tage.has(t)) break;
      zaehler += 1;
      zeiger.setDate(zeiger.getDate() - 1);
    }
    return zaehler;
  }

  /* Kennzahlen, die jedes Spiel bekommt, das die Felder mitschreibt.
     So muss kein Spiel dieselbe Rechnung noch einmal aufschreiben. */
  function allgemeineKennzahlen(partien) {
    const raus = [];
    const mittel = (werte) =>
      (werte.reduce((s, w) => s + w, 0) / werte.length).toFixed(1).replace('.', ',');

    // Die wichtigste Zahl zuerst: aus eigener Kraft gelöst.
    const gewonnen = partien.filter((p) => p.gewonnen);
    const kenntHilfen = partien.some((p) => typeof p.hilfen === 'number');
    if (kenntHilfen && gewonnen.length) {
      const ohne = gewonnen.filter((p) => !p.hilfen).length;
      raus.push({ wert: ohne + '/' + gewonnen.length, label: 'Siege ohne Hinweis' });
    }

    const zuege = partien.filter((p) => typeof p.zuege === 'number').map((p) => p.zuege);
    if (zuege.length) raus.push({ wert: mittel(zuege), label: 'Züge im Schnitt' });

    const hilfen = partien.filter((p) => typeof p.hilfen === 'number').map((p) => p.hilfen);
    if (hilfen.length) {
      raus.push({ wert: String(hilfen.reduce((s, w) => s + w, 0)), label: 'Hinweise gesamt' });
    }
    return raus;
  }

  function beste(partien, feld) {
    const werte = partien.filter((p) => p.gewonnen && p[feld] > 0).map((p) => p[feld]);
    return werte.length ? Math.min(...werte) : 0;
  }

  /* ----------------------------------------------------------------- Ansicht */

  let bereit = false;
  let laufend = null;   // { spiel, ende() }  – gerade offenes Spiel
  let ansicht = { name: 'auswahl' };

  const buehne = () => document.getElementById('buehne');

  function kopfSetzen(titel, unter, werkzeuge) {
    document.getElementById('kopf-titel').textContent = titel;
    document.getElementById('kopf-unter').textContent = unter || '';
    document.getElementById('btn-zurueck').hidden = ansicht.name === 'auswahl';
    const schacht = document.getElementById('kopf-werkzeuge');
    schacht.replaceChildren();
    for (const w of werkzeuge || []) {
      const b = el('button', 'icon-button', null);
      b.type = 'button';
      b.setAttribute('aria-label', w.label);
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + w.symbol + '</svg>';
      b.addEventListener('click', w.tun);
      if (w.marke) b.dataset.marke = w.marke;
      schacht.append(b);
    }
  }

  function gehe(ziel) {
    if (laufend && laufend.ende) laufend.ende();
    laufend = null;
    ansicht = ziel;
    const hash = ziel.name === 'auswahl' ? '#/'
      : ziel.name === 'statistik' ? (ziel.spiel ? '#/statistik/' + ziel.spiel : '#/statistik')
      : '#/spiel/' + ziel.spiel;
    if (location.hash !== hash) history.pushState(null, '', hash);
    zeichnen();
  }

  function ausHash() {
    const h = location.hash.replace(/^#/, '');
    if (h.startsWith('/spiel/')) {
      const id = h.slice('/spiel/'.length);
      if (nachId(id)) return { name: 'spiel', spiel: id };
    }
    if (h.startsWith('/statistik/')) {
      const id = h.slice('/statistik/'.length);
      if (nachId(id)) return { name: 'statistik', spiel: id };
    }
    if (h === '/statistik') return { name: 'statistik' };
    return { name: 'auswahl' };
  }

  function zeichnen() {
    if (!bereit) return;
    const b = buehne();
    b.replaceChildren();
    b.scrollTop = 0;
    if (ansicht.name === 'spiel') zeichneSpiel(b);
    else if (ansicht.name === 'statistik') zeichneStatistik(b);
    else zeichneAuswahl(b);
  }

  /* ------------------------------------------------------ Ansicht: Auswahl */

  function zeichneAuswahl(wurzel) {
    kopfSetzen('LocalGames', tagesGruss(), []);
    document.body.dataset.ansicht = 'auswahl';

    const gitter = el('div', 'kacheln');
    for (const s of spiele) {
      const p = partienVon(s.id);

      const karte = el('button', 'kachel');
      karte.type = 'button';
      karte.style.setProperty('--ton', s.farbe);
      karte.addEventListener('click', () => gehe({ name: 'spiel', spiel: s.id }));

      const marke = el('div', 'kachel-marke');
      marke.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + s.symbol + '</svg>';

      const text = el('div', 'kachel-text');
      text.append(el('span', 'kachel-name', s.name));
      text.append(el('span', 'kachel-unter', s.unter));

      const urteil = mitUrteil(p);
      const fuss = el('span', 'kachel-fuss',
        !p.length ? 'Noch nie gespielt'
          : !urteil.length ? p.length + (p.length === 1 ? ' Runde' : ' Runden')
          : p.length + (p.length === 1 ? ' Partie · ' : ' Partien · ')
            + prozent(urteil.filter((x) => x.gewonnen).length, urteil.length) + ' gewonnen');

      karte.append(marke, text, fuss);
      gitter.append(karte);
    }
    wurzel.append(gitter);

    if (!daten.partien.length) {
      const hinweis = el('p', 'notiz notiz--mitte',
        'Such dir etwas aus. Alles läuft auf diesem Gerät – auch ohne Internet.');
      wurzel.append(hinweis);
      return;
    }

    // Kurzer Überblick unter den Kacheln, damit man den Bestand sieht.
    const heutePartien = daten.partien.filter((p) => tagVon(p.ende) === heute());
    const streifen = el('button', 'ueberblick');
    streifen.type = 'button';
    streifen.addEventListener('click', () => gehe({ name: 'statistik' }));
    streifen.append(zahlBlock(String(daten.partien.length), 'Partien'));
    streifen.append(zahlBlock(siegquote(daten.partien), 'gewonnen'));
    streifen.append(zahlBlock(String(serie(daten.partien)), 'Tage Serie'));
    streifen.append(zahlBlock(String(heutePartien.length), 'heute'));
    wurzel.append(streifen);
  }

  function zahlBlock(wert, label) {
    const k = el('span', 'zahlblock');
    k.append(el('span', 'zahlblock-wert', wert));
    k.append(el('span', 'zahlblock-label', label));
    return k;
  }

  function tagesGruss() {
    const std = new Date().getHours();
    if (std < 5) return 'Noch wach?';
    if (std < 11) return 'Guten Morgen.';
    if (std < 18) return 'Kleine Pause?';
    return 'Guten Abend.';
  }

  /* -------------------------------------------------------- Ansicht: Spiel */

  function zeichneSpiel(wurzel) {
    const s = nachId(ansicht.spiel);
    if (!s) { gehe({ name: 'auswahl' }); return; }
    document.body.dataset.ansicht = 'spiel';
    kopfSetzen(s.name, '', []);

    const sitzung = {
      spiel: s,

      /* Kopfzeile */
      unter: (text) => { document.getElementById('kopf-unter').textContent = text || ''; },
      werkzeuge: (liste) => kopfSetzen(s.name, document.getElementById('kopf-unter').textContent, liste),

      /* Rückmeldung */
      toast,
      blatt: blattZeigen,
      blattZu,

      /* Laufender Spielstand – überlebt das Schließen der App */
      merken: (wert) => { daten.stand[s.id] = wert; sichern(); },
      erinnert: () => daten.stand[s.id] || null,
      vergessen: () => { delete daten.stand[s.id]; sichern(); },

      /* Fertige Partie in die Statistik */
      notieren: (partie) => notieren(s.id, partie),
      partien: () => partienVon(s.id),

      zurueck: () => gehe({ name: 'auswahl' }),
      el,
      dauerText,
    };

    const boden = el('div', 'spielboden');
    wurzel.append(boden);
    laufend = s.starten(boden, sitzung) || null;
    zaehlen('spiel/' + s.id, s.name);
  }

  /* ---------------------------------------------------- Ansicht: Statistik */

  /* Ein Spiel als Block. Mit anklickbarer Überschrift, wenn er in der
     Gesamtübersicht steht – dann führt er auf die Einzelansicht. */
  function spielBlock(s, p, verlinkt) {
    const block = el('section', 'block');
    block.style.setProperty('--ton', s.farbe);

    const titel = el(verlinkt ? 'button' : 'h2', 'block-titel block-titel--marke');
    if (verlinkt) {
      titel.type = 'button';
      titel.classList.add('block-titel--knopf');
      titel.addEventListener('click', () => gehe({ name: 'statistik', spiel: s.id }));
    }
    const marke = el('span', 'block-marke');
    marke.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + s.symbol + '</svg>';
    titel.append(marke, el('span', null, s.name));
    block.append(titel);

    if (!p.length) {
      block.append(el('p', 'notiz', 'Noch nicht gespielt.'));
      return block;
    }

    const werte = el('div', 'kennzahlen');
    werte.append(kennzahl(String(p.length), s.ohneSiege ? 'Runden' : 'Partien'));
    const urteil = mitUrteil(p);
    if (!s.ohneSiege && urteil.length) {
      werte.append(kennzahl(prozent(urteil.filter((x) => x.gewonnen).length, urteil.length), 'gewonnen'));
    }
    const eigene = s.auswertung ? s.auswertung(p, { dauerText, beste, prozent }) : [];
    for (const k of [...eigene, ...allgemeineKennzahlen(p)]) {
      werte.append(kennzahl(k.wert, k.label));
    }
    block.append(werte);

    if (s.zusatz) {
      const extra = s.zusatz(p, { el });
      if (extra) block.append(extra);
    }
    return block;
  }

  /* Statistik zu einem einzelnen Spiel. */
  function zeichneSpielStatistik(wurzel, s) {
    document.body.dataset.ansicht = 'statistik';
    kopfSetzen(s.name, 'Statistik', []);

    const p = partienVon(s.id);
    if (!p.length) {
      wurzel.append(el('p', 'notiz notiz--mitte',
        'Noch keine Partie beendet. Sobald du eine durchspielst, steht sie hier.'));
    } else {
      const kopf = el('section', 'block');
      kopf.append(el('h2', 'block-titel', 'Überblick'));
      const gitter = el('div', 'kennzahlen');
      gitter.append(kennzahl(zeitspanne(p.reduce((s2, x) => s2 + (x.dauer || 0), 0)), 'gespielt'));
      gitter.append(kennzahl(String(serie(p)), serie(p) === 1 ? 'Tag in Folge' : 'Tage in Folge'));
      gitter.append(kennzahl(String(p.filter((x) => tagVon(x.ende) === heute()).length), 'heute'));
      kopf.append(gitter);
      kopf.append(kalenderStreifen(p));
      wurzel.append(kopf);
      wurzel.append(spielBlock(s, p, false));
    }

    const fuss = el('div', 'sheet-aktionen sheet-aktionen--frei');
    const zurueckKnopf = el('button', 'knopf knopf--voll', 'Weiterspielen');
    zurueckKnopf.type = 'button';
    zurueckKnopf.addEventListener('click', () => gehe({ name: 'spiel', spiel: s.id }));
    const alleKnopf = el('button', 'knopf knopf--still', 'Alle Spiele');
    alleKnopf.type = 'button';
    alleKnopf.addEventListener('click', () => gehe({ name: 'statistik' }));
    fuss.append(zurueckKnopf, alleKnopf);
    wurzel.append(fuss);
  }

  function zeichneStatistik(wurzel) {
    if (ansicht.spiel) {
      const s = nachId(ansicht.spiel);
      if (s) { zeichneSpielStatistik(wurzel, s); return; }
    }
    document.body.dataset.ansicht = 'statistik';
    kopfSetzen('Statistik', 'Alles, was du gespielt hast', []);

    const alle = daten.partien;
    if (!alle.length) {
      wurzel.append(el('p', 'notiz notiz--mitte', 'Noch keine Partie gespielt. Sobald du eine beendest, steht sie hier.'));
      return;
    }

    const spielzeit = alle.reduce((s, p) => s + (p.dauer || 0), 0);
    const kopf = el('section', 'block');
    kopf.append(el('h2', 'block-titel', 'Insgesamt'));
    const gitter = el('div', 'kennzahlen');
    gitter.append(kennzahl(String(alle.length), 'Partien'));
    gitter.append(kennzahl(siegquote(alle), 'gewonnen'));
    gitter.append(kennzahl(zeitspanne(spielzeit), 'gespielt'));
    gitter.append(kennzahl(String(serie(alle)), serie(alle) === 1 ? 'Tag in Folge' : 'Tage in Folge'));
    kopf.append(gitter);
    kopf.append(kalenderStreifen(alle));
    wurzel.append(kopf);

    for (const s of spiele) wurzel.append(spielBlock(s, partienVon(s.id), true));

    const fuss = el('div', 'sheet-aktionen sheet-aktionen--frei');
    const sichernKnopf = el('button', 'knopf knopf--still', 'Statistik sichern');
    sichernKnopf.type = 'button';
    sichernKnopf.addEventListener('click', exportieren);
    fuss.append(sichernKnopf);
    wurzel.append(fuss);
  }

  function kennzahl(wert, label) {
    const k = el('div', 'kennzahl');
    k.append(el('span', 'kennzahl-wert', wert));
    k.append(el('span', 'kennzahl-label', label));
    return k;
  }

  /* Die letzten 35 Tage als Punktreihe – wie viel an welchem Tag gespielt wurde. */
  function kalenderStreifen(partien) {
    const proTag = new Map();
    for (const p of partien) {
      const t = tagVon(p.ende);
      proTag.set(t, (proTag.get(t) || 0) + 1);
    }
    const reihe = el('div', 'kalender');
    reihe.setAttribute('aria-label', 'Aktivität der letzten fünf Wochen');
    const zeiger = new Date();
    zeiger.setDate(zeiger.getDate() - 34);
    for (let i = 0; i < 35; i += 1) {
      const t = zeiger.toISOString().slice(0, 10);
      const n = proTag.get(t) || 0;
      const punkt = el('span', 'kalender-tag');
      punkt.dataset.stufe = n === 0 ? '0' : n < 2 ? '1' : n < 4 ? '2' : '3';
      punkt.title = t + ': ' + n + (n === 1 ? ' Partie' : ' Partien');
      reihe.append(punkt);
      zeiger.setDate(zeiger.getDate() + 1);
    }
    return reihe;
  }

  /* ------------------------------------------------------------- Sicherung */

  function exportieren() {
    const inhalt = JSON.stringify({
      app: 'LocalGames',
      version: 1,
      erstellt: new Date().toISOString(),
      partien: daten.partien,
    }, null, 2);
    const blob = new Blob([inhalt], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'localgames-' + heute() + '.json';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Sicherung gespeichert.');
  }

  function importieren(datei) {
    const leser = new FileReader();
    leser.onload = () => {
      let d;
      try {
        d = JSON.parse(String(leser.result));
      } catch (e) {
        toast('Die Datei lässt sich nicht lesen.');
        return;
      }
      if (!d || !Array.isArray(d.partien)) {
        toast('Das sieht nicht nach einer Sicherung aus.');
        return;
      }
      // Zusammenführen statt ersetzen: gleiche Partien nur einmal.
      const vorhanden = new Set(daten.partien.map((p) => p.id));
      let neu = 0;
      for (const p of d.partien) {
        if (!p || !p.spiel || !p.ende) continue;
        const id = p.id || kennung();
        if (vorhanden.has(id)) continue;
        vorhanden.add(id);
        daten.partien.push(Object.assign({}, p, { id }));
        neu += 1;
      }
      daten.partien.sort((a, b) => (a.ende < b.ende ? -1 : 1));
      sichern();
      toast(neu ? neu + (neu === 1 ? ' Partie ergänzt.' : ' Partien ergänzt.') : 'Alles war schon da.');
      zeichnen();
    };
    leser.readAsText(datei);
  }

  /* ---------------------------------------------------------------- Aufbau */

  let installEreignis = null;

  function los() {
    bereit = true;
    daten = laden();
    ansicht = ausHash();

    document.getElementById('btn-zurueck')
      .addEventListener('click', () => gehe({ name: 'auswahl' }));
    document.getElementById('btn-statistik').addEventListener('click', () => {
      // Aus einem Spiel heraus führt der Knopf auf dessen eigene Zahlen.
      gehe(ansicht.name === 'spiel'
        ? { name: 'statistik', spiel: ansicht.spiel }
        : { name: 'statistik' });
    });
    document.getElementById('btn-einstellungen')
      .addEventListener('click', einstellungenZeigen);

    for (const knopf of document.querySelectorAll('[data-schliessen]')) {
      knopf.addEventListener('click', (e) => {
        e.target.closest('.sheet-huelle').hidden = true;
      });
    }

    document.getElementById('btn-export').addEventListener('click', exportieren);
    document.getElementById('btn-import').addEventListener('click', () => {
      document.getElementById('import-datei').click();
    });
    document.getElementById('import-datei').addEventListener('change', (e) => {
      const datei = e.target.files && e.target.files[0];
      if (datei) importieren(datei);
      e.target.value = '';
    });
    document.getElementById('btn-aktualisieren')
      .addEventListener('click', aktualisierungSuchen);
    document.getElementById('btn-alles-loeschen').addEventListener('click', () => {
      if (!confirm('Wirklich alles löschen? Statistik und laufende Partien sind dann weg.')) return;
      daten = leer();
      sichern();
      document.getElementById('sheet-einstellungen').hidden = true;
      gehe({ name: 'auswahl' });
      toast('Alles gelöscht.');
    });

    window.addEventListener('appinstalled', () => {
      zaehlen('app-installiert', 'Installation');
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      installEreignis = e;
      document.getElementById('btn-installieren').hidden = false;
    });
    document.getElementById('btn-installieren').addEventListener('click', async () => {
      if (!installEreignis) return;
      installEreignis.prompt();
      await installEreignis.userChoice;
      installEreignis = null;
      document.getElementById('btn-installieren').hidden = true;
    });

    window.addEventListener('popstate', () => {
      if (laufend && laufend.ende) laufend.ende();
      laufend = null;
      ansicht = ausHash();
      zeichnen();
    });

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }

    zeichnen();
  }

  function einstellungenZeigen() {
    const n = daten.partien.length;
    document.getElementById('bestand-notiz').textContent =
      n ? n + (n === 1 ? ' Partie' : ' Partien') + ' auf diesem Gerät.' : 'Noch nichts gespeichert.';
    document.getElementById('fassung-notiz').textContent = fassungText();
    document.getElementById('sheet-einstellungen').hidden = false;
  }

  /* Die Nummer kommt aus fassung.js, also aus dem Code, der gerade wirklich
     läuft – nicht vom Service Worker. Der kann schon eine neuere Fassung
     tragen, während die offene Seite noch die alten Dateien ausführt. */
  function fassungText() {
    const f = typeof FASSUNG === 'object' ? FASSUNG : null;
    return f ? 'Fassung ' + f.nummer + ', Stand ' + f.stand : 'Fassung unbekannt';
  }

  /* Der Service Worker liefert die App aus dem Lager, bis er sich erneuert.
     Wer wissen will, ob er auf dem letzten Stand ist, fragt hier nach –
     und lädt erst neu, wenn der neue Worker tatsächlich übernommen hat. */
  async function aktualisierungSuchen() {
    if (!('serviceWorker' in navigator)) { toast('Ohne Offline-Speicher: einfach neu laden.'); return; }
    const anmeldung = await navigator.serviceWorker.getRegistration();
    if (!anmeldung) { toast('Ohne Offline-Speicher: einfach neu laden.'); return; }

    toast('Sucht …');
    const uebernahme = new Promise((fertig) => {
      navigator.serviceWorker.addEventListener('controllerchange', fertig, { once: true });
    });
    try { await anmeldung.update(); } catch (e) { toast('Kein Netz erreichbar.'); return; }
    if (!anmeldung.installing && !anmeldung.waiting) { toast('Schon auf dem neuesten Stand.'); return; }

    toast('Neue Fassung gefunden, lädt neu …');
    await uebernahme;
    location.reload();
  }

  return { anmelden, los, toast, el, dauerText, prozent };
})();
