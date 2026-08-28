/* Bombe – eine Silbe, ein Wort, schnell weitergeben.

   Auf dem Schirm steht eine Silbe. Wer das Gerät hat, sagt laut ein Wort, in
   dem sie vorkommt, und reicht weiter. Irgendwann platzt die Bombe – wer sie
   dann hält, ist raus. So lange, bis einer übrig ist.

   Der ganze Reiz hängt daran, dass niemand weiß, wann es soweit ist. Die Uhr
   läuft deshalb verdeckt und mit Streuung: die eingestellte Zeit ist nur die
   Mitte, das Ende liegt irgendwo darum herum. Eine sichtbare Uhr würde das
   Spiel zerstören – dann wartet der Vorletzte einfach ab.

   Anders als Verräter hat die Bombe kein Geheimnis zu verteilen: die Silbe
   sehen alle. Vom Baustein braucht sie darum nur den Aufbau und die Uhr.
*/

(() => {
  /* Silben, die im Deutschen wirklich vorkommen – nach Häufigkeit gestaffelt.
     Auf „leicht" fällt einem sofort etwas ein, auf „schwer" muss man suchen. */
  const STUFEN = {
    leicht: {
      name: 'leicht',
      sekunden: 45,
      streuung: 15,
      silben: ['AU', 'EI', 'IN', 'AN', 'ER', 'EN', 'ST', 'CH', 'TE', 'LE',
               'RE', 'GE', 'BE', 'UN', 'OR', 'AL', 'AR', 'IS', 'EL', 'ND'],
    },
    mittel: {
      name: 'mittel',
      sekunden: 35,
      streuung: 12,
      silben: ['SCH', 'UNG', 'BER', 'TER', 'GEN', 'SEN', 'MEN', 'LAN', 'RAU', 'FEL',
               'KAR', 'WIN', 'HOL', 'TAG', 'BAU', 'MIT', 'ZEI', 'WAS', 'KOP', 'GAR'],
    },
    schwer: {
      name: 'schwer',
      sekunden: 25,
      streuung: 10,
      silben: ['ZEU', 'PFL', 'KRI', 'SPO', 'TZE', 'FAH', 'ZWI', 'KNO', 'QUA', 'GLI',
               'SPR', 'STR', 'NEB', 'PUL', 'HÖH', 'ÄCH', 'ÖFF', 'DRU', 'FLU', 'SCHW'],
    },
  };

  const stufeVon = (id) => STUFEN[id] || STUFEN.mittel;

  /* Kurz rütteln, wenn es knallt – wo das Gerät es kann. Auf dem Rechner und
     unter iOS passiert nichts, und das ist in Ordnung. */
  function ruetteln() {
    try {
      if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate([90, 60, 200]);
    } catch (e) { /* verboten oder unbekannt – dann eben nicht */ }
  }

  function starten(wurzel, s) {
    const el = s.el;
    const boden = el('div', 'b-boden');
    wurzel.append(boden);

    let uhr = null;

    const alt = s.erinnert() || {};
    const einst = {
      stufe: stufeVon(alt.stufe).name,
      namen: Array.isArray(alt.namen) && alt.namen.length >= 2 ? alt.namen : null,
    };
    const merken = () => s.merken(einst);

    let partie = null;   // { namen, lebende, amZug, silbe, runde, begonnen }

    function aufraeumen() {
      if (uhr) { uhr.stopp(); uhr = null; }
      boden.replaceChildren();
    }

    /* -------------------------------------------------------------- Aufbau */

    function zeigeAufbau() {
      aufraeumen();
      s.unter('');

      const kasten = el('div', 'v-wahlblock');
      kasten.append(el('h3', 'v-wahl-titel', 'Stufe'));
      const reihe = el('div', 'v-wahl-reihe');
      for (const id of Object.keys(STUFEN)) {
        const st = STUFEN[id];
        const b = el('button', 'v-wahl-knopf', null);
        b.type = 'button';
        b.append(el('span', 'v-wahl-name', st.name));
        b.append(el('span', 'v-wahl-unter', 'um die ' + st.sekunden + ' Sekunden'));
        if (einst.stufe === id) b.dataset.an = 'ja';
        b.addEventListener('click', () => { einst.stufe = id; merken(); zeigeAufbau(); });
        reihe.append(b);
      }
      kasten.append(reihe);
      boden.append(kasten);

      Runde.aufbau(boden, {
        namen: einst.namen,
        min: 2,
        max: 12,
        knopfText: 'Zünden',
        weiter(namen) {
          einst.namen = namen;
          merken();
          partie = {
            namen,
            lebende: [...Array(namen.length).keys()],
            amZug: 0,
            silbe: '',
            runde: 0,
            begonnen: Date.now(),
          };
          neueSilbe();
        },
      });
    }

    /* -------------------------------------------------------------- Runde */

    function neueSilbe() {
      const st = stufeVon(einst.stufe);
      /* Nicht zweimal hintereinander dieselbe – das fällt sonst sofort auf. */
      let silbe = st.silben[Math.floor(Math.random() * st.silben.length)];
      if (st.silben.length > 1) {
        while (silbe === partie.silbe) silbe = st.silben[Math.floor(Math.random() * st.silben.length)];
      }
      partie.silbe = silbe;
      partie.runde += 1;
      zeigeRunde();
    }

    function zeigeRunde() {
      aufraeumen();
      const st = stufeVon(einst.stufe);
      s.unter(partie.lebende.length + ' übrig');

      const kasten = el('div', 'b-tisch');
      kasten.append(el('p', 'v-karte-vor', 'Sag ein Wort mit'));
      kasten.append(el('p', 'b-silbe', partie.silbe));
      const dran = el('p', 'b-dran', partie.namen[partie.lebende[partie.amZug]]);
      kasten.append(dran);

      /* Die Lunte flackert gleichmäßig – sie zeigt, dass es läuft, und verrät
         nichts darüber, wie lange noch. */
      kasten.append(el('div', 'b-lunte'));
      boden.append(kasten);

      const weiter = el('button', 'knopf knopf--voll b-weiter', 'Weiter');
      weiter.type = 'button';
      weiter.addEventListener('click', () => {
        partie.amZug = (partie.amZug + 1) % partie.lebende.length;
        /* Nur den Namen tauschen, nicht neu aufbauen: die Uhr läuft weiter und
           darf beim Weiterreichen nicht von vorn beginnen. */
        dran.textContent = partie.namen[partie.lebende[partie.amZug]];
      });
      boden.append(weiter);

      uhr = Runde.uhr(kasten, {
        sekunden: st.sekunden,
        streuung: st.streuung,
        sichtbar: false,
        ende: geplatzt,
      });
    }

    function geplatzt() {
      const raus = partie.lebende[partie.amZug];
      partie.lebende.splice(partie.amZug, 1);
      ruetteln();

      if (partie.lebende.length <= 1) { zeigeEnde(raus); return; }

      /* Nach dem Herausnehmen zeigt derselbe Zeiger schon auf den Nächsten –
         außer am Ende der Liste, dann geht es vorn weiter. */
      if (partie.amZug >= partie.lebende.length) partie.amZug = 0;

      aufraeumen();
      const kasten = el('div', 'b-tisch b-tisch--peng');
      kasten.append(el('p', 'b-peng', 'Peng.'));
      kasten.append(el('p', 'b-raus', partie.namen[raus] + ' ist raus.'));
      kasten.append(el('p', 'v-notiz', partie.lebende.length + ' machen weiter.'));
      boden.append(kasten);

      const weiter = el('button', 'knopf knopf--voll b-weiter', 'Nächste Silbe');
      weiter.type = 'button';
      weiter.addEventListener('click', neueSilbe);
      boden.append(weiter);
    }

    function zeigeEnde(raus) {
      aufraeumen();
      s.unter('');
      const sieger = partie.namen[partie.lebende[0]];

      const kasten = el('div', 'v-ende');
      kasten.dataset.aus = 'gut';
      kasten.append(el('p', 'b-peng', 'Peng.'));
      kasten.append(el('p', 'v-notiz', partie.namen[raus] + ' hat sie zuletzt gehalten.'));
      kasten.append(el('p', 'v-ende-titel', sieger + ' gewinnt.'));
      kasten.append(el('p', 'v-notiz', partie.runde + (partie.runde === 1 ? ' Silbe' : ' Silben') + ' lang durchgehalten.'));
      boden.append(kasten);

      abschluss();

      const nochmal = el('button', 'knopf knopf--voll b-weiter', 'Noch eine Runde');
      nochmal.type = 'button';
      nochmal.addEventListener('click', neu);
      boden.append(nochmal);
    }

    let notiert = false;
    function abschluss() {
      if (notiert) return;
      notiert = true;
      s.notieren({
        dauer: Date.now() - partie.begonnen,
        spieler: partie.namen.length,
        runden: partie.runde,
        stufe: einst.stufe,
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
        '<p>Auf dem Schirm steht eine Silbe. Wer das Gerät hält, sagt laut ein Wort, in dem sie vorkommt – irgendwo, nicht nur am Anfang – und tippt auf <b>Weiter</b>.</p>',
        '<p>Wann die Bombe platzt, weiß niemand: die Uhr läuft verdeckt und endet nicht auf die Sekunde genau dort, wo die Stufe es sagt. Wer sie in der Hand hat, wenn es knallt, ist raus.</p>',
        '<p>Danach gibt es eine neue Silbe und es geht weiter, bis einer übrig ist.</p>',
        '<p>Ein Wort zählt nur einmal je Runde – wer sich wiederholt, muss ein neues finden. Darüber wacht die Gruppe, nicht das Gerät.</p>',
      ].join('');
      s.blatt({ titel: 'Bombe', inhalt, aktionen: [{ text: 'Alles klar' }] });
    }

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neue Runde', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neu },
    ]);

    zeigeAufbau();

    return { ende() { aufraeumen(); } };
  }

  Rahmen.anmelden({
    id: 'bombe',
    name: 'Bombe',
    unter: 'Ein Wort mit der Silbe – und schnell weitergeben.',
    farbe: '#C9A227',
    ohneSiege: true,
    symbol: '<circle cx="11" cy="15" r="6"/><path d="M15 10l2.5-2.5M17.5 7.5c1-1 2.5-.6 3 .5" stroke-linecap="round" stroke-linejoin="round"/>',
    starten,

    auswertung(partien) {
      if (!partien.length) return [];
      const silben = partien.map((p) => p.runden || 0).filter(Boolean);
      const schnitt = silben.length
        ? (silben.reduce((a, b) => a + b, 0) / silben.length).toFixed(1).replace('.', ',')
        : '–';
      const leute = partien.map((p) => p.spieler || 0).filter(Boolean);
      const meist = leute.length ? Math.round(leute.reduce((a, b) => a + b, 0) / leute.length) : 0;
      return [
        { wert: schnitt, label: 'Silben je Runde' },
        { wert: silben.length ? String(Math.max(...silben)) : '–', label: 'längste Runde' },
        { wert: meist ? 'zu ' + meist : '–', label: 'meist gespielt' },
      ];
    },
  });
})();
