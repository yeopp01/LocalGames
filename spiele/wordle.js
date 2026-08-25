/* Wördle – fünf Buchstaben, sechs Versuche.

   Drei Hilfen:
   · Beschreibung  – die Umschreibung des gesuchten Wortes.
   · Buchstabe     – deckt den ersten noch verdeckten Buchstaben auf.
   · Vorschlag     – rechnet aus, welches Wort als nächstes am meisten bringt.

   Der Vorschlag stammt aus loeser.js und ist reine Rechnung: aus den bisherigen
   Rückmeldungen bleiben N Wörter möglich, und gesucht wird der Zug, der diese
   Menge im Schnitt am stärksten zusammenschrumpfen lässt.
*/

(() => {
  const ZEILEN = 6;
  const LAENGE = 5;
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ';

  const TAFEL = [
    [...'QWERTZUIOPÜ'],
    [...'ASDFGHJKLÖÄ'],
    ['ENTER', ...'YXCVBNM', 'WEG'],
  ];

  /* Wort des Tages: läuft die Liste einmal komplett durch, bevor sich etwas
     wiederholt – Schrittweite 101 ist teilerfremd zur Listenlänge. */
  function tagesWort(datum) {
    const tage = Math.floor(Date.parse(datum + 'T00:00:00Z') / 86400000);
    return LOESUNGEN[((tage * 101 + 37) % LOESUNGEN.length + LOESUNGEN.length) % LOESUNGEN.length][0];
  }

  const zufallsWort = () => LOESUNGEN[Math.floor(Math.random() * LOESUNGEN.length)][0];
  const heute = () => new Date().toISOString().slice(0, 10);

  function starten(wurzel, s) {
    const el = s.el;

    let stand = laden();
    let eingabe = '';
    let ruettelt = false;

    /* --------------------------------------------------------- Spielstand */

    function frisch(modus) {
      return {
        modus,
        tag: heute(),
        wort: modus === 'tag' ? tagesWort(heute()) : zufallsWort(),
        versuche: [],
        verraten: 0,
        beschreibung: false,
        vorschlaege: 0,
        begonnen: Date.now(),
        fertig: null,
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (!alt || !alt.wort || !Array.isArray(alt.versuche)) return frisch('tag');
      // Ein neuer Tag bringt ein neues Tageswort.
      if (alt.modus === 'tag' && alt.tag !== heute()) return frisch('tag');
      return alt;
    }

    const sichern = () => s.merken(stand);
    const vorbei = () => stand.fertig !== null;

    /* ------------------------------------------------------------- Aufbau */

    const gitter = el('div', 'w-gitter');
    const verratenZeile = el('div', 'w-verraten');
    const tippKasten = el('div', 'w-tipp');
    tippKasten.hidden = true;
    const hilfeLeiste = el('div', 'leiste');
    const tafel = el('div', 'w-tafel');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;

    wurzel.append(gitter, verratenZeile, tippKasten, endeKasten, tafel, hilfeLeiste);

    const felder = [];
    for (let z = 0; z < ZEILEN; z += 1) {
      const zeile = el('div', 'w-zeile');
      zeile.dataset.nr = String(z);
      const reihe = [];
      for (let i = 0; i < LAENGE; i += 1) {
        const f = el('div', 'w-feld');
        zeile.append(f);
        reihe.push(f);
      }
      felder.push(reihe);
      gitter.append(zeile);
    }

    const tasten = new Map();
    for (const reihe of TAFEL) {
      const r = el('div', 'w-reihe');
      for (const zeichen of reihe) {
        const t = el('button', 'w-taste' + (zeichen.length > 1 ? ' w-taste--breit' : ''));
        t.type = 'button';
        t.textContent = zeichen === 'ENTER' ? 'Prüfen' : zeichen === 'WEG' ? 'Löschen' : zeichen;
        t.addEventListener('click', () => tippen(zeichen));
        if (zeichen.length === 1) tasten.set(zeichen, t);
        r.append(t);
      }
      tafel.append(r);
    }

    const hilfeKnopf = (text, tun) => {
      const b = el('button', 'knopf knopf--still', text);
      b.type = 'button';
      b.addEventListener('click', tun);
      hilfeLeiste.append(b);
      return b;
    };
    const knopfBeschreibung = hilfeKnopf('Tipp', beschreibungZeigen);
    const knopfBuchstabe = hilfeKnopf('Buchstabe', buchstabeVerraten);
    const knopfVorschlag = hilfeKnopf('Vorschlag', vorschlagZeigen);

    s.werkzeuge([
      { label: 'Regeln', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: regelnZeigen },
      { label: 'Neues Wort', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    /* ------------------------------------------------------------ Zeichnen */

    function zeichnen() {
      for (let z = 0; z < ZEILEN; z += 1) {
        const versuch = stand.versuche[z];
        for (let i = 0; i < LAENGE; i += 1) {
          const f = felder[z][i];
          delete f.dataset.stufe;
          delete f.dataset.voll;
          delete f.dataset.verraten;
          if (versuch) {
            f.textContent = [...versuch.wort][i];
            f.dataset.stufe = String(versuch.stufen[i]);
          } else if (z === stand.versuche.length && !vorbei()) {
            const zeichen = [...eingabe][i];
            if (zeichen) {
              f.textContent = zeichen;
              f.dataset.voll = 'ja';
            } else if (i < stand.verraten) {
              // Verratene Buchstaben stehen als blasse Vorgabe im Feld.
              f.textContent = [...stand.wort][i];
              f.dataset.verraten = 'ja';
            } else {
              f.textContent = '';
            }
          } else {
            f.textContent = '';
          }
        }
      }

      // Tastatur einfärben: die beste bisher erreichte Stufe gewinnt.
      const beste = new Map();
      for (const v of stand.versuche) {
        const zeichen = [...v.wort];
        zeichen.forEach((c, i) => {
          const alt = beste.get(c);
          if (alt === undefined || v.stufen[i] > alt) beste.set(c, v.stufen[i]);
        });
      }
      for (const [c, t] of tasten) {
        if (beste.has(c)) t.dataset.stufe = String(beste.get(c));
        else delete t.dataset.stufe;
      }

      verratenZeile.textContent = stand.verraten
        ? [...stand.wort].map((c, i) => (i < stand.verraten ? c : '·')).join(' ')
        : '';

      knopfBeschreibung.disabled = stand.beschreibung || vorbei();
      knopfBuchstabe.disabled = stand.verraten >= LAENGE - 1 || vorbei();
      knopfVorschlag.disabled = vorbei();

      s.unter(stand.modus === 'tag'
        ? 'Wort des Tages · ' + stand.tag
        : 'Freies Spiel');

      tafel.hidden = vorbei();
      hilfeLeiste.hidden = vorbei();
      endeZeichnen();
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !vorbei();
      if (!vorbei()) return;

      endeKasten.append(el('p', 'ende-titel',
        stand.fertig === 'sieg' ? lobText(stand.versuche.length) : 'Diesmal nicht.'));
      endeKasten.append(el('p', 'notiz',
        'Das Wort war ' + stand.wort + ' – ' + TIPP_ZU[stand.wort]));

      const leiste = el('div', 'leiste');
      const nochmal = el('button', 'knopf knopf--voll', 'Noch ein Wort');
      nochmal.type = 'button';
      nochmal.addEventListener('click', () => { stand = frisch('frei'); sichern(); zeichnen(); });
      leiste.append(nochmal);

      const zurueck = el('button', 'knopf knopf--still', 'Zur Auswahl');
      zurueck.type = 'button';
      zurueck.addEventListener('click', s.zurueck);
      leiste.append(zurueck);
      endeKasten.append(leiste);
    }

    const lobText = (n) => ['', 'Unfassbar.', 'Stark.', 'Sehr gut.', 'Gut gemacht.', 'Geschafft.', 'Gerade noch.'][n] || 'Geschafft.';

    /* ------------------------------------------------------------ Eingabe */

    function tippen(zeichen) {
      if (vorbei()) return;
      if (zeichen === 'ENTER') { pruefen(); return; }
      if (zeichen === 'WEG') {
        eingabe = [...eingabe].slice(0, -1).join('');
        zeichnen();
        return;
      }
      if (!ALPHABET.includes(zeichen)) return;
      if ([...eingabe].length >= LAENGE) return;
      eingabe += zeichen;
      zeichnen();
    }

    function pruefen() {
      const wort = eingabe;
      if ([...wort].length < LAENGE) { melden('Noch nicht genug Buchstaben.'); return; }
      if (!ALLE_WOERTER.includes(wort)) { melden('Das Wort kenne ich nicht.'); return; }

      const stufen = Loeser.musterStufen(wort, stand.wort);
      stand.versuche.push({ wort, stufen });
      eingabe = '';

      if (wort === stand.wort) abschluss('sieg');
      else if (stand.versuche.length >= ZEILEN) abschluss('pleite');
      else sichern();

      zeichnen();
    }

    function melden(text) {
      s.toast(text);
      if (ruettelt) return;
      ruettelt = true;
      const zeile = gitter.children[stand.versuche.length];
      if (zeile) {
        zeile.dataset.falsch = 'ja';
        setTimeout(() => { delete zeile.dataset.falsch; ruettelt = false; }, 420);
      } else ruettelt = false;
    }

    function abschluss(ausgang) {
      stand.fertig = ausgang;
      s.notieren({
        gewonnen: ausgang === 'sieg',
        dauer: Date.now() - stand.begonnen,
        zuege: stand.versuche.length,
        hilfen: (stand.beschreibung ? 1 : 0) + stand.verraten + stand.vorschlaege,
        modus: stand.modus,
        wort: stand.wort,
      });
      sichern();
    }

    /* -------------------------------------------------------------- Hilfen */

    function beschreibungZeigen() {
      stand.beschreibung = true;
      sichern();
      tippKasten.hidden = false;
      tippKasten.textContent = TIPP_ZU[stand.wort] || 'Zu diesem Wort gibt es keine Beschreibung.';
      zeichnen();
    }

    function buchstabeVerraten() {
      if (stand.verraten >= LAENGE - 1) return;
      stand.verraten += 1;
      sichern();
      zeichnen();
      s.toast('Buchstabe ' + stand.verraten + ' ist ' + [...stand.wort][stand.verraten - 1] + '.');
    }

    function vorschlagZeigen() {
      stand.vorschlaege += 1;
      sichern();

      const moegliche = passende();
      const inhalt = el('div');

      if (!moegliche.length) {
        inhalt.append(el('p', 'notiz', 'Zu diesen Rückmeldungen passt kein Wort aus meiner Liste mehr.'));
      } else {
        inhalt.append(el('p', 'notiz',
          moegliche.length === 1
            ? 'Es bleibt genau ein Wort übrig.'
            : 'Es passen noch ' + moegliche.length + ' Wörter. Diese Züge trennen sie am besten:'));

        for (const v of Loeser.vorschlaege(moegliche, ALLE_WOERTER, 3)) {
          const zeile = el('div', 'vorschlag');
          zeile.append(el('span', 'vorschlag-wort', v.wort));
          if (v.kandidat) zeile.append(el('span', 'vorschlag-marke', 'kann die Lösung sein'));
          zeile.append(el('span', 'vorschlag-rest',
            v.rest <= 1.02 ? 'trennt alles' : 'danach ø ' + v.rest.toFixed(1) + ' übrig'));
          inhalt.append(zeile);
        }

        if (moegliche.length <= 12) {
          inhalt.append(el('p', 'notiz', 'Möglich sind: ' + moegliche.join(', ')));
        }
      }

      s.blatt({
        titel: 'Wie weiter?',
        inhalt,
        aktionen: [{ text: 'Verstanden' }],
      });
    }

    /* Alle Wörter, die zu den Rückmeldungen und zu verratenen Buchstaben passen. */
    function passende() {
      const pool = LOESUNGEN.map((e) => e[0]).filter((w) => {
        for (let i = 0; i < stand.verraten; i += 1) {
          if ([...w][i] !== [...stand.wort][i]) return false;
        }
        return true;
      });
      return Loeser.kandidaten(pool, stand.versuche);
    }

    /* --------------------------------------------------------------- Menü */

    function neuFragen() {
      s.blatt({
        titel: 'Neues Wort',
        inhalt: 'Das Wort des Tages ist für alle gleich und wechselt um Mitternacht. Im freien Spiel wird jedes Mal neu gezogen.',
        aktionen: [
          { text: 'Frei spielen', tun: () => { stand = frisch('frei'); sichern(); zeichnen(); } },
          { text: 'Wort des Tages', art: 'still', tun: () => { stand = frisch('tag'); sichern(); zeichnen(); } },
        ],
      });
    }

    function regelnZeigen() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Rate ein Wort mit fünf Buchstaben. Nach jedem Versuch färben sich die Felder:'));
      d.append(el('p', 'notiz', 'Grün – der Buchstabe steht an der richtigen Stelle. Gelb – er kommt vor, aber woanders. Grau – er kommt nicht vor.'));
      d.append(el('p', 'notiz', 'Ä, Ö und Ü haben eigene Tasten. Sechs Versuche.'));
      d.append(el('p', 'notiz', 'Tipp zeigt eine Umschreibung, Buchstabe deckt den nächsten verdeckten Buchstaben auf, Vorschlag rechnet den besten nächsten Zug aus.'));
      s.blatt({ titel: 'Wördle', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    /* --------------------------------------------------------- Tastatur PC */

    function taste(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!document.getElementById('sheet-spiel').hidden) return;
      const k = e.key;
      if (k === 'Enter') { e.preventDefault(); tippen('ENTER'); return; }
      if (k === 'Backspace') { e.preventDefault(); tippen('WEG'); return; }
      const gross = k.toUpperCase();
      if (gross.length === 1 && ALPHABET.includes(gross)) { e.preventDefault(); tippen(gross); }
    }
    window.addEventListener('keydown', taste);

    if (stand.beschreibung) {
      tippKasten.hidden = false;
      tippKasten.textContent = TIPP_ZU[stand.wort] || '';
    }
    sichern();
    zeichnen();

    return { ende: () => window.removeEventListener('keydown', taste) };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien, hilfe) {
    const siege = partien.filter((p) => p.gewonnen);
    const schnitt = siege.length
      ? (siege.reduce((s, p) => s + (p.zuege || 0), 0) / siege.length).toFixed(1)
      : '–';
    let serie = 0;
    let beste = 0;
    for (const p of partien) {
      serie = p.gewonnen ? serie + 1 : 0;
      if (serie > beste) beste = serie;
    }
    const ohneHilfe = partien.filter((p) => p.gewonnen && !p.hilfen).length;
    return [
      { wert: String(schnitt), label: 'Züge im Schnitt' },
      { wert: String(beste), label: 'Siege in Folge' },
      { wert: String(ohneHilfe), label: 'ohne Hilfe' },
    ];
  }

  function zusatz(partien, { el }) {
    const nach = [0, 0, 0, 0, 0, 0];
    for (const p of partien) if (p.gewonnen && p.zuege >= 1 && p.zuege <= 6) nach[p.zuege - 1] += 1;
    const hoechste = Math.max(1, ...nach);
    const kasten = el('div', 'verteilung');
    nach.forEach((n, i) => {
      const zeile = el('div', 'verteilung-zeile');
      if (n === hoechste && n > 0) zeile.dataset.hell = 'ja';
      zeile.append(el('span', 'verteilung-nr', String(i + 1)));
      const balken = el('span', 'verteilung-balken', String(n));
      balken.style.width = Math.max(8, (n / hoechste) * 100) + '%';
      zeile.append(balken);
      kasten.append(zeile);
    });
    return kasten;
  }

  Rahmen.anmelden({
    id: 'wordle',
    name: 'Wördle',
    unter: 'Fünf Buchstaben, sechs Versuche.',
    farbe: '#4E8A54',
    symbol: '<rect x="3" y="4" width="18" height="7" rx="1.6"/><rect x="3" y="13" width="18" height="7" rx="1.6"/><path d="M7.5 4v7M12 13v7"/>',
    starten,
    auswertung,
    zusatz,
  });
})();
