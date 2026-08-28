/* Zwei Wahrheiten, eine Lüge.

   Einer schreibt drei Sätze über sich auf, zwei davon stimmen. Dann wandert
   das Gerät, und jeder andere tippt auf den Satz, den er für gelogen hält.
   Am Ende zeigt sich, wer richtig lag.

   Das Gerät kennt die Wahrheit nicht und prüft nichts nach – es hält nur
   auseinander, wer was sehen darf. Genau dafür ist der Sperrschirm aus
   runde.js da: erst beim Schreiben, damit niemand mitliest, dann beim Raten,
   damit niemand die Stimme des Vorgängers sieht.

   Die drei Sätze werden vor dem Raten gemischt. Sonst gewöhnt sich die Runde
   daran, dass die Lüge immer an derselben Stelle steht – Leute schreiben sie
   gern zuletzt.
*/

(() => {
  const STELLE = ['Der erste', 'Der zweite', 'Der dritte'];

  function starten(wurzel, s) {
    const el = s.el;
    const boden = el('div', 'v-boden');
    wurzel.append(boden);

    let gabe = null;

    const alt = s.erinnert() || {};
    const einst = {
      namen: Array.isArray(alt.namen) && alt.namen.length >= 3 ? alt.namen : null,
      dran: alt.dran || 0,
    };
    const merken = () => s.merken(einst);

    let partie = null;   // { namen, dran, saetze, luege, andere, tipps, begonnen }

    function aufraeumen() {
      if (gabe) { gabe.ende(); gabe = null; }
      boden.replaceChildren();
    }

    /* -------------------------------------------------------------- Aufbau */

    function zeigeAufbau() {
      aufraeumen();
      s.unter('');
      boden.append(el('p', 'v-notiz',
        'Reihum schreibt einer drei Sätze über sich – zwei wahr, einer erfunden. Die anderen raten dann, welcher gelogen ist.'));

      Runde.aufbau(boden, {
        namen: einst.namen,
        min: 3,
        max: 10,
        knopfText: 'Losschreiben',
        weiter(namen) {
          einst.namen = namen;
          if (einst.dran >= namen.length) einst.dran = 0;
          merken();
          partie = {
            namen,
            dran: einst.dran,
            saetze: null,
            luege: -1,
            andere: null,
            tipps: null,
            begonnen: Date.now(),
          };
          zeigeSchreiben();
        },
      });
    }

    /* ------------------------------------------------------------ Schreiben */

    function zeigeSchreiben() {
      aufraeumen();
      const name = partie.namen[partie.dran];
      s.unter(name + ' ist dran');

      gabe = Runde.weitergabe(boden, {
        namen: [name],
        knopf: null,
        uebergabe: 'Schreiben darf',
        zeigen(i, flaeche, weiter) {
          flaeche.append(el('p', 'r-frage', 'Drei Sätze über dich – einer davon gelogen.'));

          const felder = [];
          const eingaben = el('div', 'r-namen');
          for (let n = 0; n < 3; n += 1) {
            const zeile = el('label', 'r-name');
            zeile.append(el('span', 'r-name-nr', String(n + 1)));
            const feld = el('input', 'r-name-feld');
            feld.type = 'text';
            feld.value = '';
            feld.maxLength = 90;
            feld.autocomplete = 'off';
            feld.setAttribute('aria-label', 'Satz ' + (n + 1));
            feld.addEventListener('input', pruefen);
            zeile.append(feld);
            eingaben.append(zeile);
            felder.push(feld);
          }
          flaeche.append(eingaben);

          flaeche.append(el('p', 'v-wahl-titel', 'Welcher ist gelogen?'));
          let gewaehlt = -1;
          const reihe = el('div', 'v-wahl-reihe');
          const marken = [];
          for (let n = 0; n < 3; n += 1) {
            const b = el('button', 'v-wahl-knopf', null);
            b.type = 'button';
            b.append(el('span', 'v-wahl-name', STELLE[n]));
            b.addEventListener('click', () => {
              gewaehlt = n;
              marken.forEach((m, k) => {
                if (k === n) m.dataset.an = 'ja';
                else delete m.dataset.an;
              });
              pruefen();
            });
            reihe.append(b);
            marken.push(b);
          }
          flaeche.append(reihe);

          const fertig = el('button', 'knopf knopf--voll v-breit', 'Fertig – weitergeben');
          fertig.type = 'button';
          fertig.disabled = true;
          fertig.addEventListener('click', () => {
            /* Gemischt, damit die Lüge nicht immer hinten steht. */
            const roh = felder.map((f, n) => ({ text: f.value.trim(), luege: n === gewaehlt }));
            const gemischt = Runde.mischenMit(Math.random, roh);
            partie.saetze = gemischt.map((x) => x.text);
            partie.luege = gemischt.findIndex((x) => x.luege);
            weiter();
          });
          flaeche.append(fertig);

          function pruefen() {
            fertig.disabled = gewaehlt < 0 || felder.some((f) => !f.value.trim());
          }
        },
        fertig: zeigeRaten,
      });
    }

    /* ---------------------------------------------------------------- Raten */

    function zeigeRaten() {
      aufraeumen();
      partie.andere = partie.namen.filter((_, i) => i !== partie.dran);
      const tipps = new Array(partie.andere.length).fill(-1);

      gabe = Runde.weitergabe(boden, {
        namen: partie.andere,
        knopf: null,
        uebergabe: 'Raten darf',
        zeigen(i, flaeche, weiter) {
          flaeche.append(el('p', 'r-frage', 'Welcher Satz ist gelogen?'));
          const liste = el('div', 'r-wahl');
          partie.saetze.forEach((text, n) => {
            const b = el('button', 'r-wahl-knopf', text);
            b.addEventListener('click', () => { tipps[i] = n; weiter(); });
            liste.append(b);
          });
          flaeche.append(liste);
        },
        fertig() {
          partie.tipps = tipps;
          zeigeEnde();
        },
      });
    }

    /* ----------------------------------------------------------- Auflösung */

    function zeigeEnde() {
      aufraeumen();
      const richtig = partie.tipps.filter((t) => t === partie.luege).length;
      const gefunden = richtig * 2 > partie.tipps.length;

      const kasten = el('div', 'v-ende');
      kasten.dataset.aus = gefunden ? 'gut' : 'schlecht';
      kasten.append(el('p', 'v-ende-titel', gefunden ? 'Durchschaut.' : 'Gut gelogen.'));
      kasten.append(el('p', 'v-notiz',
        richtig + ' von ' + partie.tipps.length + ' haben die Lüge gefunden.'));
      boden.append(kasten);

      const liste = el('div', 'w2-liste');
      partie.saetze.forEach((text, n) => {
        const zeile = el('div', 'w2-satz');
        if (n === partie.luege) zeile.dataset.luege = 'ja';
        zeile.append(el('span', 'w2-text', text));
        const wer = partie.andere.filter((_, k) => partie.tipps[k] === n);
        zeile.append(el('span', 'w2-wer', wer.length ? wer.join(', ') : '–'));
        liste.append(zeile);
      });
      boden.append(liste);
      boden.append(el('p', 'v-notiz', 'Unter jedem Satz steht, wer ihn für die Lüge hielt.'));

      abschluss(gefunden);

      const weiter = el('button', 'knopf knopf--voll v-breit',
        'Weiter – ' + partie.namen[(partie.dran + 1) % partie.namen.length] + ' ist dran');
      weiter.type = 'button';
      weiter.addEventListener('click', () => {
        einst.dran = (partie.dran + 1) % partie.namen.length;
        merken();
        notiert = false;
        partie = {
          namen: partie.namen,
          dran: einst.dran,
          saetze: null, luege: -1, andere: null, tipps: null,
          begonnen: Date.now(),
        };
        zeigeSchreiben();
      });
      boden.append(weiter);
    }

    let notiert = false;
    function abschluss(gefunden) {
      if (notiert) return;
      notiert = true;
      s.notieren({
        gewonnen: gefunden,
        dauer: Date.now() - partie.begonnen,
        spieler: partie.namen.length,
        richtig: partie.tipps.filter((t) => t === partie.luege).length,
        rater: partie.tipps.length,
      });
    }

    function neu() {
      notiert = false;
      partie = null;
      zeigeAufbau();
    }

    function anleitung() {
      const inhalt = document.createElement('div');
      inhalt.innerHTML = [
        '<p>Einer ist dran und schreibt drei Sätze über sich auf: zwei stimmen, einer ist erfunden. Dabei schaut niemand mit – der Sperrschirm davor sorgt dafür.</p>',
        '<p>Dann wandert das Gerät, und jeder andere tippt auf den Satz, den er für gelogen hält. Auch das geheim: wer als Zweiter rät, sieht die Stimme des Ersten nicht.</p>',
        '<p>Am Ende steht unter jedem Satz, wer ihn gewählt hat. Danach ist der Nächste dran.</p>',
        '<p>Die drei Sätze werden vor dem Raten gemischt – die Lüge steht also nicht dort, wo sie geschrieben wurde.</p>',
        '<p>Das Gerät prüft nichts nach. Ob ein Satz wirklich stimmt, weiß nur, wer ihn geschrieben hat.</p>',
      ].join('');
      s.blatt({ titel: 'Zwei Wahrheiten', inhalt, aktionen: [{ text: 'Alles klar' }] });
    }

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neue Runde', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neu },
    ]);

    zeigeAufbau();

    return { ende() { aufraeumen(); } };
  }

  Rahmen.anmelden({
    id: 'wahrheiten',
    name: 'Zwei Wahrheiten',
    unter: 'Drei Sätze, einer erfunden.',
    farbe: '#4573B8',
    symbol: '<path d="M4 7h16M4 12h16M4 17h10" stroke-linecap="round"/><path d="M15.5 17.5l2 2 3.5-4" stroke-linecap="round" stroke-linejoin="round"/>',
    starten,

    auswertung(partien, hilfe) {
      if (!partien.length) return [];
      const richtig = partien.reduce((a, p) => a + (p.richtig || 0), 0);
      const rater = partien.reduce((a, p) => a + (p.rater || 0), 0);
      const leute = partien.map((p) => p.spieler || 0).filter(Boolean);
      const meist = leute.length ? Math.round(leute.reduce((a, b) => a + b, 0) / leute.length) : 0;
      return [
        { wert: String(partien.length), label: partien.length === 1 ? 'Runde' : 'Runden' },
        { wert: hilfe.prozent(richtig, rater), label: 'Tipps richtig' },
        { wert: meist ? 'zu ' + meist : '–', label: 'meist gespielt' },
      ];
    },
  });
})();
