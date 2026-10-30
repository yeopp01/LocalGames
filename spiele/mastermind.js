/* Zahlen-Mastermind – einen geheimen Zahlencode knacken.

   Nach jedem Versuch gibt es zwei Zahlen zurück:
   · schwarz  – richtige Ziffer an richtiger Stelle
   · weiß     – richtige Ziffer, aber an falscher Stelle

   Der Vorschlag arbeitet wie bei Wördle: Aus allen Rückmeldungen bleibt eine
   Menge möglicher Codes übrig, und gesucht ist der Zug, der diese Menge im
   Schnitt am stärksten zerlegt. Nur ist der Suchraum hier gerechnet statt
   aufgeschrieben – 6^4 sind 1296 Codes.
*/

(() => {
  const ZIFFERN = 6;

  const STUFEN = {
    normal: { name: 'normal', stellen: 4, versuche: 10 },
    schwer: { name: 'schwer', stellen: 5, versuche: 12 },
  };

  const alleCodes = (stellen) => {
    let raus = [[]];
    for (let i = 0; i < stellen; i += 1) {
      const naechste = [];
      for (const teil of raus) {
        for (let z = 1; z <= ZIFFERN; z += 1) naechste.push([...teil, z]);
      }
      raus = naechste;
    }
    return raus.map((c) => c.join(''));
  };

  /* Rückmeldung als "schwarz,weiß" – doppelte Ziffern sauber gezählt. */
  function bewerten(rat, code) {
    let schwarz = 0;
    const uebrigRat = [];
    const uebrigCode = [];
    for (let i = 0; i < rat.length; i += 1) {
      if (rat[i] === code[i]) schwarz += 1;
      else { uebrigRat.push(rat[i]); uebrigCode.push(code[i]); }
    }
    let weiss = 0;
    const zaehler = new Map();
    for (const c of uebrigCode) zaehler.set(c, (zaehler.get(c) || 0) + 1);
    for (const r of uebrigRat) {
      const da = zaehler.get(r) || 0;
      if (da > 0) { weiss += 1; zaehler.set(r, da - 1); }
    }
    return schwarz + ',' + weiss;
  }

  const passende = (codes, versuche) =>
    codes.filter((c) => versuche.every((v) => bewerten(v.rat, c) === v.antwort));

  /* Der informativste nächste Zug: erwartete Restmenge so klein wie möglich.
     Bei sehr vielen Kandidaten wird gegen eine Stichprobe gerechnet, sonst
     dauert es zu lange – die Reihenfolge ändert sich dadurch kaum. */
  function vorschlag(moegliche) {
    if (moegliche.length <= 2) return moegliche[0];

    const probe = moegliche.length > 1500
      ? moegliche.filter((_, i) => i % Math.ceil(moegliche.length / 800) === 0)
      : moegliche;
    const rater = moegliche.length > 600
      ? moegliche.filter((_, i) => i % Math.ceil(moegliche.length / 400) === 0)
      : moegliche;

    let bestes = null;
    let besteNote = Infinity;
    const eimer = new Map();
    for (const g of rater) {
      eimer.clear();
      for (const k of probe) {
        const a = bewerten(g, k);
        eimer.set(a, (eimer.get(a) || 0) + 1);
      }
      let summe = 0;
      for (const n of eimer.values()) summe += n * n;
      const note = summe / probe.length;
      if (note < besteNote) { besteNote = note; bestes = g; }
    }
    return bestes;
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let stelle = ersteLuecke();   // wohin die nächste Ziffer kommt; -1, wenn alle stehen
    let neuGetippt = -1;          // diese Stelle landet gerade
    let neueMarken = false;       // die Punkte des letzten Versuchs erscheinen gerade
    let neuerBestwert = false;

    function ersteLuecke() { return stand.entwurf.indexOf(''); }

    function frisch(stufe) {
      const stellen = STUFEN[stufe].stellen;
      let code = '';
      for (let i = 0; i < stellen; i += 1) code += String(1 + Math.floor(Math.random() * ZIFFERN));
      return {
        stufe,
        stellen,
        code,
        entwurf: new Array(stellen).fill(''),
        versuche: [],
        hilfen: 0,
        verbraucht: 0,
        seit: Date.now(),
        fertig: null,      // null | 'sieg' | 'pleite'
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && alt.code && Array.isArray(alt.versuche) && !alt.fertig) {
        alt.verbraucht = alt.verbraucht || 0;
        // Stände von früher kennen den angefangenen Versuch noch nicht.
        if (!Array.isArray(alt.entwurf) || alt.entwurf.length !== alt.stellen) alt.entwurf = new Array(alt.stellen).fill('');
        alt.seit = Date.now();
        return alt;
      }
      return frisch('normal');
    }

    /* Die Spielzeit zählt nur, solange das Spiel offen ist – wie bei Damen und
       Weg. Vorher war sie die Uhrzeit seit dem Anlegen des Codes, und eine
       über Nacht liegen gelassene Partie brachte die Nacht mit. */
    const zeitJetzt = () => stand.verbraucht + (stand.fertig ? 0 : Date.now() - stand.seit);
    function sichern() {
      if (!stand.fertig) {
        stand.verbraucht = zeitJetzt();
        stand.seit = Date.now();
      }
      s.merken(stand);
    }
    const vorbei = () => stand.fertig !== null;
    const maxVersuche = () => STUFEN[stand.stufe].versuche;

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const liste = el('div', 'k-liste');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    // Steht von Anfang an da: Wer zum ersten Mal spielt, soll die Punkte nicht
    // erst in der Anleitung nachschlagen müssen.
    const legende = el('div', 'k-legende');
    for (const [art, text] of [['voll', 'richtige Stelle'], ['halb', 'andere Stelle']]) {
      const eintrag = el('span');
      eintrag.append(el('i', 'k-marke k-marke--' + art), document.createTextNode(text));
      legende.append(eintrag);
    }
    const pad = el('div', 'k-pad');
    const leiste = el('div', 'leiste');
    wurzel.append(kopf, liste, endeKasten, legende, pad, leiste);

    for (let z = 1; z <= ZIFFERN; z += 1) {
      const t = el('button', 'k-taste', String(z));
      t.type = 'button';
      t.dataset.z = String(z);
      t.addEventListener('click', () => tippen(String(z)));
      pad.append(t);
    }
    const wegTaste = el('button', 'k-taste');
    wegTaste.type = 'button';
    wegTaste.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-6-6 6-6z"/><path d="M17 10l-4 4M13 10l4 4"/></svg>';
    wegTaste.setAttribute('aria-label', 'Letzte Ziffer löschen');
    wegTaste.addEventListener('click', loeschen);
    pad.append(wegTaste);
    const okTaste = el('button', 'k-taste k-taste--ok');
    okTaste.type = 'button';
    okTaste.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.6 4.6L19 7.5"/></svg>';
    okTaste.setAttribute('aria-label', 'Versuch abgeben');
    okTaste.addEventListener('click', pruefen);
    pad.append(okTaste);

    const vorschlagKnopf = s.leistenKnopf('Vorschlag', 'hinweis', vorschlagZeigen);
    leiste.append(vorschlagKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neuer Code', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    /* ---------------------------------------------------------------- Zug */

    function tippen(z) {
      if (vorbei() || stelle < 0) return;
      stand.entwurf[stelle] = z;
      neuGetippt = stelle;
      // Weiter zur nächsten Lücke, erst nach rechts, dann von vorn. Wer eine Stelle
      // gezielt korrigiert hat, landet so nicht auf einer schon besetzten.
      const dahinter = stand.entwurf.findIndex((w, i) => i > stelle && !w);
      stelle = dahinter >= 0 ? dahinter : ersteLuecke();
      s.fuehlen();
      sichern();
      zeichnen();
    }

    /* Nimmt, was unter dem Cursor steht, sonst die letzte Ziffer davor. */
    function loeschen() {
      if (vorbei()) return;
      let wo = stelle >= 0 && stand.entwurf[stelle] ? stelle : -1;
      if (wo < 0) {
        const bis = stelle >= 0 ? stelle : stand.stellen;
        for (let i = bis - 1; i >= 0 && wo < 0; i -= 1) if (stand.entwurf[i]) wo = i;
      }
      if (wo < 0) return;
      stand.entwurf[wo] = '';
      stelle = wo;
      s.fuehlen();
      sichern();
      zeichnen();
    }

    function stelleWaehlen(i) {
      stelle = i;
      zeichnen();
    }

    /* Der nächste Versuch unterscheidet sich meist nur in ein, zwei Stellen. */
    function uebernehmen(rat) {
      if (vorbei()) return;
      stand.entwurf = rat.split('');
      stelle = -1;
      s.fuehlen();
      sichern();
      zeichnen();
    }

    function pruefen() {
      if (vorbei()) return;
      if (stand.entwurf.some((w) => !w)) { s.toast('Noch nicht genug Ziffern.'); return; }
      const rat = stand.entwurf.join('');
      // Derselbe Versuch verrät nichts Neues. Seit man alte Versuche antippen kann,
      // gäbe man ihn sonst leicht aus Versehen noch einmal ab.
      if (stand.versuche.some((v) => v.rat === rat)) { s.toast('Den hattest du schon.'); return; }
      const antwort = bewerten(rat, stand.code);
      stand.versuche.push({ rat, antwort });
      stand.entwurf = new Array(stand.stellen).fill('');
      stelle = 0;
      neueMarken = true;
      s.fuehlen(12);

      if (antwort === stand.stellen + ',0') abschluss('sieg');
      else if (stand.versuche.length >= maxVersuche()) abschluss('pleite');

      sichern();
      zeichnen();
      // Auf einem flachen Fenster läge das Ergebnis sonst unter dem Rand.
      if (vorbei()) endeKasten.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function abschluss(ausgang) {
      stand.verbraucht = zeitJetzt();
      stand.fertig = ausgang;
      // Vor dem Notieren schauen, sonst schlägt die Partie sich selbst.
      const frueher = s.partien().filter((p) => p.gewonnen && p.stufe === stand.stufe && typeof p.zuege === 'number' && p.zuege > 0);
      neuerBestwert = ausgang === 'sieg' && frueher.length > 0 && frueher.every((p) => p.zuege > stand.versuche.length);
      s.fuehlen(ausgang === 'sieg' ? 30 : 60);
      s.notieren({
        gewonnen: ausgang === 'sieg',
        dauer: stand.verbraucht,
        zuege: stand.versuche.length,
        hilfen: stand.hilfen,
        stufe: stand.stufe,
      });
    }

    function vorschlagZeigen() {
      if (vorbei()) return;
      stand.hilfen += 1;
      sichern();

      const moegliche = passende(alleCodes(stand.stellen), stand.versuche);
      const d = el('div');
      let vorgeschlagen = null;
      if (!moegliche.length) {
        d.append(el('p', 'notiz', 'Zu diesen Rückmeldungen passt kein Code – da muss sich ein Tippfehler eingeschlichen haben.'));
      } else {
        d.append(el('p', 'notiz', moegliche.length === 1
          ? 'Es bleibt genau ein Code übrig:'
          : 'Es passen noch ' + moegliche.length + ' Codes. Dieser Zug trennt sie am besten:'));
        const rat = vorschlag(moegliche);
        vorgeschlagen = rat;
        const zeile = el('div', 'vorschlag');
        zeile.append(el('span', 'vorschlag-wort', rat));
        zeile.append(el('span', 'vorschlag-rest', moegliche.length === 1 ? 'das ist er' : 'informativster Zug'));
        d.append(zeile);
        if (moegliche.length <= 10) {
          d.append(el('p', 'notiz', 'Möglich sind noch: ' + moegliche.join(', ')));
        }
      }
      s.blatt({
        titel: 'Wie weiter?',
        inhalt: d,
        aktionen: vorgeschlagen
          ? [{ text: 'Eintragen', tun: () => uebernehmen(vorgeschlagen) }, { text: 'Selbst überlegen', art: 'still' }]
          : [{ text: 'Verstanden' }],
      });
      zeichnen();
    }

    /* ------------------------------------------------------------ Zeichnen */

    function zeichnen() {
      liste.replaceChildren();
      liste.style.setProperty('--k-reihen', String(maxVersuche()));

      stand.versuche.forEach((v, nr) => {
        liste.append(alteZeile(v, neueMarken && nr === stand.versuche.length - 1));
      });
      if (!vorbei()) {
        liste.append(aktiveZeile());
        // Die freien Zeilen zeigen, was noch übrig ist. Am Ende sind sie nur im Weg.
        for (let i = stand.versuche.length + 1; i < maxVersuche(); i += 1) liste.append(freieZeile());
      }
      neueMarken = false;
      neuGetippt = -1;

      okTaste.disabled = stand.entwurf.some((w) => !w);
      wegTaste.disabled = stand.entwurf.every((w) => !w);
      kopfZeichnen();
      endeZeichnen();
      legende.hidden = vorbei();
      pad.hidden = vorbei();
      leiste.hidden = vorbei();
    }

    function kachel(z, art = 'span') {
      const f = el(art, 'k-feld', z);
      if (z) f.dataset.z = z;
      return f;
    }

    function markenBauen(antwort, neu) {
      const marken = el('div', 'k-marken');
      const [schwarz, weiss] = antwort ? antwort.split(',').map(Number) : [0, 0];
      for (let i = 0; i < stand.stellen; i += 1) {
        const art = i < schwarz ? ' k-marke--voll' : i < schwarz + weiss ? ' k-marke--halb' : '';
        const m = el('span', 'k-marke' + art + (neu ? ' k-marke--neu' : ''));
        if (neu) m.style.setProperty('--i', String(i));
        marken.append(m);
      }
      return marken;
    }

    function alteZeile(v, neu) {
      const zeile = el(vorbei() ? 'div' : 'button', 'k-zeile');
      if (!vorbei()) {
        zeile.type = 'button';
        zeile.setAttribute('aria-label', 'Versuch ' + v.rat + ' übernehmen');
        zeile.addEventListener('click', () => uebernehmen(v.rat));
      }
      const felder = el('div', 'k-felder');
      for (const c of v.rat) felder.append(kachel(c));
      zeile.append(felder, markenBauen(v.antwort, neu));
      return zeile;
    }

    function aktiveZeile() {
      const zeile = el('div', 'k-zeile');
      zeile.dataset.aktiv = 'ja';
      const felder = el('div', 'k-felder');
      stand.entwurf.forEach((z, i) => {
        const f = kachel(z, 'button');
        f.type = 'button';
        f.setAttribute('aria-label', 'Stelle ' + (i + 1) + (z ? ', ' + z : ', leer'));
        if (i === stelle) f.dataset.stelle = 'ja';
        if (i === neuGetippt) f.classList.add('k-feld--neu');
        f.addEventListener('click', () => stelleWaehlen(i));
        felder.append(f);
      });
      zeile.append(felder, markenBauen(null, false));
      return zeile;
    }

    function freieZeile() {
      const zeile = el('div', 'k-zeile k-zeile--frei');
      const felder = el('div', 'k-felder');
      for (let i = 0; i < stand.stellen; i += 1) felder.append(el('span', 'k-feld'));
      zeile.append(felder, markenBauen(null, false));
      return zeile;
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      kopf.append(s.stufenName(STUFEN, stand.stufe));
      const rest = el('span', null, '');
      rest.append(el('b', null, String(maxVersuche() - stand.versuche.length)));
      rest.append(document.createTextNode(' Versuche frei'));
      kopf.append(rest);
      s.unter(stand.stellen + ' Stellen · 1–' + ZIFFERN);
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !vorbei();
      if (!vorbei()) return;
      if (stand.fertig === 'sieg') endeKasten.append(s.bildzeichen('fertig'));
      endeKasten.append(el('p', 'ende-titel',
        stand.fertig === 'sieg' ? 'Code geknackt.' : 'Nicht geknackt.'));
      if (neuerBestwert) endeKasten.append(el('span', 'ende-marke', 'Neuer Bestwert'));
      const code = el('div', 'k-felder k-felder--ende');
      for (const c of stand.code) code.append(kachel(c));
      endeKasten.append(code);
      endeKasten.append(el('p', 'notiz', stand.fertig === 'sieg'
        ? 'Gebraucht: ' + stand.versuche.length + (stand.versuche.length === 1 ? ' Versuch.' : ' Versuche.')
        : 'Das war der Code.'));
      endeKasten.append(s.stufenLeiste(STUFEN, stand.stufe, neu));
    }

    function neu(stufe) {
      stand = frisch(stufe);
      stelle = 0;
      neuerBestwert = false;
      sichern();
      zeichnen();
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neuer Code',
        inhalt: 'Normal sind vier Stellen und zehn Versuche, schwer fünf Stellen und zwölf. Ziffern dürfen sich wiederholen.',
        aktionen: s.stufenAktionen(STUFEN, neu),
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Gesucht ist ein geheimer Code aus ' + stand.stellen + ' Ziffern von 1 bis 6. Ziffern dürfen mehrfach vorkommen.'));
      d.append(el('p', 'notiz', 'Nach jedem Versuch stehen rechts Punkte:'));
      d.append(el('p', 'notiz', '● gefüllt und grün – eine Ziffer sitzt richtig, an der richtigen Stelle.'));
      d.append(el('p', 'notiz', '○ offen und gelb – diese Ziffer kommt im Code vor, steht aber woanders.'));
      d.append(el('p', 'notiz', 'Welcher Punkt zu welcher Stelle gehört, wird nicht verraten – das ist der ganze Reiz.'));
      d.append(el('p', 'notiz', 'Der Knopf „Vorschlag" rechnet aus, welcher Versuch jetzt am meisten verrät, und sagt, wie viele Codes überhaupt noch möglich sind. „Eintragen" schreibt ihn gleich in die Zeile.'));
      d.append(el('p', 'notiz', 'Tipp eine Stelle der aktiven Zeile an, um gezielt sie zu ändern. Ein früherer Versuch wird angetippt zum Ausgangspunkt für den nächsten. Am Rechner gehen Ziffern, Pfeile, Rücktaste und Enter.'));
      s.blatt({ titel: 'Zahlen-Mastermind', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function taste(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!document.getElementById('sheet-spiel').hidden) return;
      if (vorbei()) return;
      if (e.key >= '1' && e.key <= String(ZIFFERN)) { e.preventDefault(); tippen(e.key); return; }
      if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); loeschen(); return; }
      if (e.key === 'Enter') { e.preventDefault(); pruefen(); return; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const schritt = e.key === 'ArrowLeft' ? -1 : 1;
        const von = stelle >= 0 ? stelle : (schritt < 0 ? stand.stellen : -1);
        stelleWaehlen(Math.max(0, Math.min(stand.stellen - 1, von + schritt)));
      }
    }
    window.addEventListener('keydown', taste);

    sichern();
    zeichnen();

    return {
      ende: () => {
        window.removeEventListener('keydown', taste);
        if (!vorbei()) sichern();
      },
    };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien) {
    // Siege ohne Zugzahl – etwa aus einer alten Sicherung – fallen aus dem
    // Schnitt, statt ihn zu „NaN" zu machen.
    const siege = partien.filter((p) => p.gewonnen && typeof p.zuege === 'number' && p.zuege > 0);
    const schnitt = siege.length
      ? (siege.reduce((s, p) => s + p.zuege, 0) / siege.length).toFixed(1).replace('.', ',')
      : '–';
    const bestes = siege.length ? Math.min(...siege.map((p) => p.zuege)) : 0;
    return [
      { wert: schnitt, label: 'Versuche je Sieg' },
      { wert: bestes ? String(bestes) : '–', label: 'bester Lauf' },
    ];
  }

  Rahmen.anmelden({
    id: 'mastermind',
    name: 'Zahlencode',
    gruppe: 'raetsel',
    unter: 'Vier Ziffern, zehn Versuche.',
    farbe: '#B8577F',
    symbol: '<circle cx="7" cy="8" r="2.4"/><circle cx="14" cy="8" r="2.4"/><circle cx="7" cy="16" r="2.4"/><circle cx="14" cy="16" r="2.4"/><path d="M19 6v12" stroke-linecap="round"/>',
    starten,
    auswertung,
  });
})();
