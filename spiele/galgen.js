/* Galgenmännchen – Buchstaben raten, bevor das Männchen fertig ist.

   Die Wörter kommen aus derselben Liste wie bei Wördle und bringen darum
   ihre Umschreibung gleich mit: Wer festhängt, kann sie sich zeigen lassen.
*/

(() => {
  /* Die Tafel folgt dem QWERTZ-Muster, damit die Finger dort suchen, wo sie
     es von der Tastatur gewohnt sind. */
  const TAFEL = ['QWERTZUIOPÜ', 'ASDFGHJKLÖÄ', 'YXCVBNM'];
  const ALPHABET = [...TAFEL.join('')];

  /* Die Teile in der Reihenfolge, in der sie gezeichnet werden. Ihre Anzahl
     ist zugleich die Zahl der erlaubten Fehler. */
  const TEILE = [
    '<path d="M10 92h60" />',                                  // Boden
    '<path d="M28 92V12" />',                                  // Pfosten
    '<path d="M28 12h34" />',                                  // Querbalken
    '<path d="M28 26 46 12" />',                               // Strebe
    '<path d="M62 12v10" />',                                  // Seil
    '<circle cx="62" cy="30" r="8" />',                        // Kopf
    '<path d="M62 38v22" />',                                  // Rumpf
    '<path d="M62 44 50 54" />',                               // linker Arm
    '<path d="M62 44 74 54" />',                               // rechter Arm
    '<path d="M62 60 52 76" />',                               // linkes Bein
    '<path d="M62 60 72 76" />',                               // rechtes Bein
  ];

  const zufallsWort = () => LOESUNGEN[Math.floor(Math.random() * LOESUNGEN.length)][0];

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();

    function frisch() {
      return {
        wort: zufallsWort(),
        geraten: [],
        beschreibung: false,
        begonnen: Date.now(),
        fertig: null,        // null | 'sieg' | 'pleite'
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && alt.wort && Array.isArray(alt.geraten) && !alt.fertig) return alt;
      return frisch();
    }

    const sichern = () => s.merken(stand);
    const buchstaben = () => [...stand.wort];
    const fehler = () => stand.geraten.filter((c) => !buchstaben().includes(c));
    const offen = () => buchstaben().filter((c) => !stand.geraten.includes(c));
    const vorbei = () => stand.fertig !== null;

    /* ------------------------------------------------------------- Aufbau */

    const bild = el('div', 'g-bild');
    const wortZeile = el('div', 'g-wort');
    const tippKasten = el('div', 'w-tipp');
    tippKasten.hidden = true;
    const tafel = el('div', 'g-tafel');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste');
    wurzel.append(bild, wortZeile, tippKasten, endeKasten, tafel, leiste);

    const tasten = new Map();
    for (const reihe of TAFEL) {
      const r = el('div', 'g-reihe');
      for (const c of reihe) {
        const t = el('button', 'g-taste', c);
        t.type = 'button';
        t.addEventListener('click', () => raten(c));
        r.append(t);
        tasten.set(c, t);
      }
      tafel.append(r);
    }

    const tippKnopf = el('button', 'knopf knopf--still', 'Tipp');
    tippKnopf.type = 'button';
    tippKnopf.addEventListener('click', () => {
      stand.beschreibung = true;
      sichern();
      zeichnen();
    });
    leiste.append(tippKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neues Wort', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neu },
    ]);

    /* ---------------------------------------------------------------- Zug */

    function raten(c) {
      if (vorbei() || stand.geraten.includes(c)) return;
      stand.geraten.push(c);

      if (!offen().length) abschluss('sieg');
      else if (fehler().length >= TEILE.length) abschluss('pleite');

      sichern();
      zeichnen();
    }

    function abschluss(ausgang) {
      stand.fertig = ausgang;
      s.notieren({
        gewonnen: ausgang === 'sieg',
        dauer: Date.now() - stand.begonnen,
        fehler: fehler().length,
        zuege: stand.geraten.length,
        buchstaben: stand.geraten.length,
        hilfen: stand.beschreibung ? 1 : 0,
        wort: stand.wort,
      });
    }

    /* ------------------------------------------------------------ Zeichnen */

    function zeichnen() {
      const daneben = fehler().length;

      bild.innerHTML = '<svg viewBox="0 0 90 100" aria-hidden="true">'
        + TEILE.slice(0, daneben).join('') + '</svg>';

      wortZeile.replaceChildren();
      for (const c of buchstaben()) {
        const zeigen = stand.geraten.includes(c) || vorbei();
        const kasten = el('span', 'g-buchstabe', zeigen ? c : '');
        if (vorbei() && !stand.geraten.includes(c)) kasten.dataset.verpasst = 'ja';
        wortZeile.append(kasten);
      }

      for (const [c, t] of tasten) {
        const benutzt = stand.geraten.includes(c);
        t.disabled = benutzt || vorbei();
        t.dataset.stand = !benutzt ? 'offen' : buchstaben().includes(c) ? 'treffer' : 'daneben';
      }

      tippKasten.hidden = !stand.beschreibung;
      if (stand.beschreibung) tippKasten.textContent = TIPP_ZU[stand.wort] || '';
      tippKnopf.disabled = stand.beschreibung || vorbei();

      s.unter(vorbei() ? '' : (TEILE.length - daneben) + ' Fehler frei');
      tafel.hidden = vorbei();
      leiste.hidden = vorbei();
      endeZeichnen();
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !vorbei();
      if (!vorbei()) return;
      endeKasten.append(el('p', 'ende-titel',
        stand.fertig === 'sieg' ? 'Gerettet.' : 'Aufgeknüpft.'));
      endeKasten.append(el('p', 'notiz',
        'Das Wort war ' + stand.wort + ' – ' + TIPP_ZU[stand.wort]));
      const l = el('div', 'leiste');
      const b = el('button', 'knopf knopf--voll', 'Noch ein Wort');
      b.type = 'button';
      b.addEventListener('click', neu);
      l.append(b);
      const z = el('button', 'knopf knopf--still', 'Zur Auswahl');
      z.type = 'button';
      z.addEventListener('click', s.zurueck);
      l.append(z);
      endeKasten.append(l);
    }

    function neu() {
      stand = frisch();
      sichern();
      zeichnen();
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Gesucht ist ein Wort mit fünf Buchstaben. Tippe Buchstaben an – steckt einer im Wort, erscheint er an allen passenden Stellen.'));
      d.append(el('p', 'notiz', 'Jeder Fehlgriff zeichnet einen Strich am Galgen. Nach ' + TEILE.length + ' Fehlern ist das Männchen fertig und die Runde verloren.'));
      d.append(el('p', 'notiz', 'Am Rechner geht auch die Tastatur, Ä, Ö und Ü eingeschlossen.'));
      d.append(el('p', 'notiz', 'Der Knopf „Tipp" zeigt eine Umschreibung des Wortes. Er kostet keinen Fehler, wird aber in der Statistik vermerkt.'));
      s.blatt({ titel: 'Galgenmännchen', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function taste(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!document.getElementById('sheet-spiel').hidden) return;
      const c = e.key.toUpperCase();
      if (c.length === 1 && ALPHABET.includes(c)) { e.preventDefault(); raten(c); }
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
      ? (siege.reduce((s, p) => s + (p.fehler || 0), 0) / siege.length).toFixed(1)
      : '–';
    const makellos = siege.filter((p) => !p.fehler).length;
    return [
      { wert: String(schnitt), label: 'Fehler je Sieg' },
      { wert: String(makellos), label: 'ohne Fehler' },
    ];
  }

  Rahmen.anmelden({
    id: 'galgen',
    name: 'Galgenmännchen',
    unter: 'Buchstabe für Buchstabe.',
    farbe: '#8C6A4F',
    symbol: '<path d="M4 20h9M6 20V4h10M16 4v3" stroke-linecap="round"/><circle cx="16" cy="10" r="2.6"/>',
    starten,
    auswertung,
  });
})();
