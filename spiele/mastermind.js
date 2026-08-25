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
    let eingabe = '';

    function frisch(stufe) {
      const stellen = STUFEN[stufe].stellen;
      let code = '';
      for (let i = 0; i < stellen; i += 1) code += String(1 + Math.floor(Math.random() * ZIFFERN));
      return {
        stufe,
        stellen,
        code,
        versuche: [],
        hilfen: 0,
        begonnen: Date.now(),
        fertig: null,      // null | 'sieg' | 'pleite'
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && alt.code && Array.isArray(alt.versuche) && !alt.fertig) return alt;
      return frisch('normal');
    }

    const sichern = () => s.merken(stand);
    const vorbei = () => stand.fertig !== null;
    const maxVersuche = () => STUFEN[stand.stufe].versuche;

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const liste = el('div', 'k-liste');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const pad = el('div', 'k-pad');
    const leiste = el('div', 'leiste');
    wurzel.append(kopf, liste, endeKasten, pad, leiste);

    for (let z = 1; z <= ZIFFERN; z += 1) {
      const t = el('button', 'k-taste', String(z));
      t.type = 'button';
      t.addEventListener('click', () => tippen(String(z)));
      pad.append(t);
    }
    const wegTaste = el('button', 'k-taste', '⌫');
    wegTaste.type = 'button';
    wegTaste.setAttribute('aria-label', 'Letzte Ziffer löschen');
    wegTaste.addEventListener('click', () => { eingabe = eingabe.slice(0, -1); zeichnen(); });
    pad.append(wegTaste);
    const okTaste = el('button', 'k-taste k-taste--ok', '✓');
    okTaste.type = 'button';
    okTaste.setAttribute('aria-label', 'Versuch abgeben');
    okTaste.addEventListener('click', pruefen);
    pad.append(okTaste);

    const vorschlagKnopf = el('button', 'knopf knopf--still', 'Vorschlag');
    vorschlagKnopf.type = 'button';
    vorschlagKnopf.addEventListener('click', vorschlagZeigen);
    leiste.append(vorschlagKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neuer Code', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    /* ---------------------------------------------------------------- Zug */

    function tippen(z) {
      if (vorbei() || eingabe.length >= stand.stellen) return;
      eingabe += z;
      zeichnen();
    }

    function pruefen() {
      if (vorbei()) return;
      if (eingabe.length < stand.stellen) { s.toast('Noch nicht genug Ziffern.'); return; }
      const antwort = bewerten(eingabe, stand.code);
      stand.versuche.push({ rat: eingabe, antwort });
      eingabe = '';

      if (antwort === stand.stellen + ',0') abschluss('sieg');
      else if (stand.versuche.length >= maxVersuche()) abschluss('pleite');

      sichern();
      zeichnen();
    }

    function abschluss(ausgang) {
      stand.fertig = ausgang;
      s.notieren({
        gewonnen: ausgang === 'sieg',
        dauer: Date.now() - stand.begonnen,
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
      if (!moegliche.length) {
        d.append(el('p', 'notiz', 'Zu diesen Rückmeldungen passt kein Code – da muss sich ein Tippfehler eingeschlichen haben.'));
      } else {
        d.append(el('p', 'notiz', moegliche.length === 1
          ? 'Es bleibt genau ein Code übrig:'
          : 'Es passen noch ' + moegliche.length + ' Codes. Dieser Zug trennt sie am besten:'));
        const rat = vorschlag(moegliche);
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
        aktionen: [{ text: 'Verstanden' }],
      });
      zeichnen();
    }

    /* ------------------------------------------------------------ Zeichnen */

    function zeichnen() {
      liste.replaceChildren();

      for (const v of stand.versuche) {
        liste.append(zeileBauen(v.rat, v.antwort));
      }
      if (!vorbei()) {
        const offen = eingabe.padEnd(stand.stellen, ' ');
        liste.append(zeileBauen(offen, null, true));
      }

      kopfZeichnen();
      endeZeichnen();
      pad.hidden = vorbei();
      leiste.hidden = vorbei();
    }

    function zeileBauen(ziffern, antwort, aktiv) {
      const zeile = el('div', 'k-zeile');
      if (aktiv) zeile.dataset.aktiv = 'ja';
      const felder = el('div', 'k-felder');
      for (const c of ziffern) {
        felder.append(el('span', 'k-feld', c === ' ' ? '' : c));
      }
      zeile.append(felder);

      const marken = el('div', 'k-marken');
      if (antwort) {
        const [schwarz, weiss] = antwort.split(',').map(Number);
        for (let i = 0; i < schwarz; i += 1) marken.append(el('span', 'k-marke k-marke--voll'));
        for (let i = 0; i < weiss; i += 1) marken.append(el('span', 'k-marke k-marke--halb'));
        for (let i = schwarz + weiss; i < stand.stellen; i += 1) marken.append(el('span', 'k-marke'));
      }
      zeile.append(marken);
      return zeile;
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      kopf.append(el('span', null, STUFEN[stand.stufe].name));
      const rest = el('span', null, '');
      rest.append(el('b', null, String(maxVersuche() - stand.versuche.length)));
      rest.append(document.createTextNode(' Versuche frei'));
      kopf.append(rest);
      s.unter(stand.stellen + ' Stellen, Ziffern 1 bis ' + ZIFFERN);
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !vorbei();
      if (!vorbei()) return;
      endeKasten.append(el('p', 'ende-titel',
        stand.fertig === 'sieg' ? 'Code geknackt.' : 'Nicht geknackt.'));
      endeKasten.append(el('p', 'notiz', 'Der Code war ' + stand.code + '.'
        + (stand.fertig === 'sieg' ? ' Gebraucht: ' + stand.versuche.length + ' Versuche.' : '')));
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
      eingabe = '';
      sichern();
      zeichnen();
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neuer Code',
        inhalt: 'Normal sind vier Stellen und zehn Versuche, schwer fünf Stellen und zwölf. Ziffern dürfen sich wiederholen.',
        aktionen: [
          { text: 'Normal', tun: () => neu('normal') },
          { text: 'Schwer', art: 'still', tun: () => neu('schwer') },
        ],
      });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Gesucht ist ein geheimer Code aus ' + stand.stellen + ' Ziffern von 1 bis 6. Ziffern dürfen mehrfach vorkommen.'));
      d.append(el('p', 'notiz', 'Nach jedem Versuch stehen rechts Punkte:'));
      d.append(el('p', 'notiz', '● gefüllt – eine Ziffer sitzt richtig, an der richtigen Stelle.'));
      d.append(el('p', 'notiz', '○ offen – diese Ziffer kommt im Code vor, steht aber woanders.'));
      d.append(el('p', 'notiz', 'Welcher Punkt zu welcher Stelle gehört, wird nicht verraten – das ist der ganze Reiz.'));
      d.append(el('p', 'notiz', 'Der Knopf „Vorschlag" rechnet aus, welcher Versuch jetzt am meisten verrät, und sagt, wie viele Codes überhaupt noch möglich sind.'));
      s.blatt({ titel: 'Zahlen-Mastermind', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function taste(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!document.getElementById('sheet-spiel').hidden) return;
      if (e.key >= '1' && e.key <= String(ZIFFERN)) { e.preventDefault(); tippen(e.key); return; }
      if (e.key === 'Backspace') { e.preventDefault(); eingabe = eingabe.slice(0, -1); zeichnen(); return; }
      if (e.key === 'Enter') { e.preventDefault(); pruefen(); }
    }
    window.addEventListener('keydown', taste);

    sichern();
    zeichnen();

    return { ende: () => window.removeEventListener('keydown', taste) };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien) {
    const siege = partien.filter((p) => p.gewonnen);
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
    unter: 'Vier Ziffern, zehn Versuche.',
    farbe: '#B8577F',
    symbol: '<circle cx="7" cy="8" r="2.4"/><circle cx="14" cy="8" r="2.4"/><circle cx="7" cy="16" r="2.4"/><circle cx="14" cy="16" r="2.4"/><path d="M19 6v12" stroke-linecap="round"/>',
    starten,
    auswertung,
  });
})();
