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
        aendern(namen) { einst.namen = namen; merken(); },
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

          /* Die Wahl der Lüge sitzt direkt am Satz: Mit offener Tastatur liegt alles
             darunter im Dunkeln, und man müsste „der zweite" erst abzählen. */
          const felder = [];
          const marken = [];
          let gewaehlt = -1;
          const eingaben = el('div', 'w2-saetze');
          for (let n = 0; n < 3; n += 1) {
            const zeile = el('div', 'r-name w2-zeile');
            zeile.append(el('span', 'r-name-nr', String(n + 1)));
            /* Ein Textfeld statt einer Eingabezeile: Neunzig Zeichen passen in keine
               Zeile, und einen Satz, dessen Anfang hinten hinausgeschoben ist, kann
               man nicht mehr lesen. */
            const feld = el('textarea', 'r-name-feld w2-feld');
            feld.rows = 1;
            feld.maxLength = 90;
            feld.autocomplete = 'off';
            feld.autocapitalize = 'sentences';
            feld.enterKeyHint = n < 2 ? 'next' : 'done';
            feld.placeholder = 'Satz ' + (n + 1);
            feld.setAttribute('aria-label', 'Satz ' + (n + 1));
            feld.addEventListener('input', () => {
              feld.style.height = 'auto';
              feld.style.height = feld.scrollHeight + 'px';
              pruefen();
            });
            feld.addEventListener('keydown', (e) => {
              if (e.key !== 'Enter' || e.isComposing) return;
              e.preventDefault();
              if (felder[n + 1]) felder[n + 1].focus();
              else if (!fertig.disabled) fertig.focus();
              else feld.blur();
            });
            zeile.append(feld);

            const marke = el('button', 'w2-marke', 'Lüge');
            marke.type = 'button';
            marke.setAttribute('aria-label', 'Satz ' + (n + 1) + ' ist die Lüge');
            marke.setAttribute('aria-pressed', 'false');
            marke.addEventListener('click', () => {
              gewaehlt = n;
              marken.forEach((m, k) => {
                m.setAttribute('aria-pressed', String(k === n));
                m.parentElement.toggleAttribute('data-luege', k === n);
              });
              s.fuehlen();
              pruefen();
            });
            zeile.append(marke);
            eingaben.append(zeile);
            felder.push(feld);
            marken.push(marke);
          }
          flaeche.append(eingaben);

          const fehlt = el('p', 'v-notiz w2-fehlt');
          flaeche.append(fehlt);

          const fertig = el('button', 'knopf knopf--voll v-breit', 'Fertig – weitergeben');
          fertig.type = 'button';
          fertig.disabled = true;
          fertig.addEventListener('click', () => {
            /* Gemischt, damit die Lüge nicht immer hinten steht. */
            const roh = felder.map((f, n) => ({ text: f.value.replace(/\s+/g, ' ').trim(), luege: n === gewaehlt }));
            const gemischt = Runde.mischenMit(Math.random, roh);
            partie.saetze = gemischt.map((x) => x.text);
            partie.luege = gemischt.findIndex((x) => x.luege);
            weiter();
          });
          flaeche.append(fertig);

          /* Der Knopf sagt nicht, warum er gesperrt ist – die Zeile darüber schon. */
          function pruefen() {
            const leer = felder.filter((f) => !f.value.trim()).length;
            fertig.disabled = gewaehlt < 0 || leer > 0;
            if (leer) fehlt.textContent = leer === 1 ? 'Noch ein Satz.' : 'Noch ' + leer + ' Sätze.';
            else if (gewaehlt < 0) fehlt.textContent = 'Tippe beim erfundenen Satz auf „Lüge".';
            else fehlt.textContent = 'Alles da.';
          }
          pruefen();
          felder[0].focus();
        },
        fertig: zeigeRaten,
      });
    }

    /* ---------------------------------------------------------------- Raten */

    function zeigeRaten() {
      aufraeumen();
      partie.andere = partie.namen.filter((_, i) => i !== partie.dran);
      const schreiber = partie.namen[partie.dran];
      s.unter('Von ' + schreiber);
      const tipps = new Array(partie.andere.length).fill(-1);

      gabe = Runde.weitergabe(boden, {
        namen: partie.andere,
        knopf: null,
        uebergabe: 'Raten darf',
        zeigen(i, flaeche, weiter) {
          flaeche.append(el('p', 'r-frage', 'Welcher Satz von ' + schreiber + ' ist gelogen?'));
          const liste = el('div', 'r-wahl');
          partie.saetze.forEach((text, n) => {
            const b = el('button', 'r-wahl-knopf', text);
            b.addEventListener('click', () => { tipps[i] = n; weiter(); });
            liste.append(b);
          });
          flaeche.append(Runde.frisch(liste));
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
        /* Die Lüge steht auch in Worten da, nicht nur in Farbe. */
        if (n === partie.luege) {
          zeile.dataset.luege = 'ja';
          zeile.append(el('span', 'w2-luege', 'Die Lüge'));
        }
        zeile.append(el('span', 'w2-text', text));
        const wer = partie.andere.filter((_, k) => partie.tipps[k] === n);
        zeile.append(el('span', 'w2-wer', wer.length ? 'Getippt von ' + wer.join(', ') : 'Von niemandem getippt'));
        liste.append(zeile);
      });
      boden.append(liste);

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
      boden.append(Runde.frisch(weiter, 450, () => Runde.vorn(weiter)));
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
    gruppe: 'zu-mehreren',
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
