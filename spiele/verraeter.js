/* Verräter – einer weiß das Wort nicht.

   Alle bekommen dasselbe Wort, einer nicht. Dann sagt reihum jeder ein einziges
   Wort dazu – nah genug, dass es passt, vage genug, dass der Verräter nichts
   lernt. Danach wird abgestimmt.

   Drei Fassungen:

   * blind        – der Verräter weiß, dass er es ist, und kennt nur das Thema.
   * doppelgänger – er bekommt ein ähnliches Wort und ahnt selbst nichts. Die
                    beste Fassung: es gibt keine Rolle zu spielen, nur ein
                    Missverständnis, das langsam auffällt.
   * zwei         – zwei Verräter, die einander nicht kennen. Ab fünf Leuten.

   Zwei Wege, die Rollen zu verteilen, beide in runde.js:

   * Ein Handy wandert im Kreis.
   * Alle tippen denselben Code ein. Jedes Gerät würfelt dann für sich, und
     weil derselbe Code dieselbe Folge ergibt, würfeln alle dasselbe.

   Im Code-Weg kommen Thema und Fassung aus dem Code selbst, nicht aus einer
   Einstellung. Das ist kein Verzicht, sondern die Absicherung: beide stehen
   oben auf dem Schirm, und wer sich vertippt hat, sieht dort etwas anderes als
   der Rest. Ein Fehler, der sich sonst erst in der Auflösung zeigen würde,
   fällt so vor der ersten Runde auf.
*/

(() => {
  const FASSUNGEN = [
    { id: 'doppel', name: 'Doppelgänger', unter: 'Einer bekommt ein ähnliches Wort und ahnt nichts davon.', ab: 3 },
    { id: 'blind', name: 'Blind', unter: 'Der Verräter weiß Bescheid, kennt aber nur das Thema.', ab: 3 },
    { id: 'zwei', name: 'Zwei Verräter', unter: 'Zwei wissen es nicht – und nichts voneinander.', ab: 5 },
  ];

  const ZEITEN = [
    { id: 'aus', name: 'ohne Uhr', sekunden: 0 },
    { id: 'kurz', name: '2 Minuten', sekunden: 120 },
    { id: 'lang', name: '4 Minuten', sekunden: 240 },
  ];

  const fassungVon = (id) => FASSUNGEN.find((f) => f.id === id) || FASSUNGEN[0];
  const zeitVon = (id) => ZEITEN.find((z) => z.id === id) || ZEITEN[0];

  /* Die eine Rechnung, die auf allen Geräten dasselbe ergeben muss. Sie darf
     deshalb nichts anfassen, was nicht in den Startwert eingegangen ist – und
     die Aufrufe des Würfels müssen immer in derselben Reihenfolge kommen. */
  function rollenBauen(zufall, anzahl, fassungId, themaId) {
    /* Ein Thema wird immer gezogen, auch bei „bunt gemischt“: der blinde
       Verräter bekommt es als einzigen Halt, sonst steht er ohne alles da. */
    const thema = (themaId && Begriffe.nachId(themaId)) || Runde.waehlen(zufall, Begriffe.THEMEN);
    const paar = Runde.waehlen(zufall, thema.paare);
    const wieViele = fassungId === 'zwei' ? 2 : 1;
    const verraeter = Runde.mischenMit(zufall, [...Array(anzahl).keys()]).slice(0, wieViele);
    const beginnt = Math.floor(zufall() * anzahl);
    return { thema, wort: paar[0], zwilling: paar[1], verraeter, beginnt };
  }

  /* Aus einem Code fallen auch Thema und Fassung – siehe Kopf der Datei. */
  function ausCode(code, anzahl) {
    const zufall = Runde.zufallAus(code + ':' + anzahl);
    const thema = Runde.waehlen(zufall, Begriffe.THEMEN);
    const moeglich = FASSUNGEN.filter((f) => anzahl >= f.ab);
    const fassung = Runde.waehlen(zufall, moeglich);
    return { thema, fassung, rollen: rollenBauen(zufall, anzahl, fassung.id, thema.id) };
  }

  function starten(wurzel, s) {
    const el = s.el;
    const boden = el('div', 'v-boden');
    wurzel.append(boden);

    let laufendeUhr = null;
    let laufendeGabe = null;

    /* Gemerkt werden nur die Einstellungen, nicht die Runde. Eine halb
       verteilte Partie beim nächsten Öffnen fortzusetzen wäre sinnlos – die
       Leute stehen dann nicht mehr im Kreis. */
    const alt = s.erinnert() || {};
    const einst = {
      modus: alt.modus === 'code' ? 'code' : 'handy',
      fassung: fassungVon(alt.fassung).id,
      thema: alt.thema || '',
      zeit: zeitVon(alt.zeit).id,
      namen: Array.isArray(alt.namen) && alt.namen.length >= 3 ? alt.namen : null,
      anzahl: alt.anzahl || 4,
      code: alt.code || '',
      ich: alt.ich || 1,
    };
    const merken = () => s.merken(einst);

    let partie = null;   // { rollen, namen, fassung, thema, begonnen }

    function aufraeumen() {
      if (laufendeUhr) { laufendeUhr.stopp(); laufendeUhr = null; }
      if (laufendeGabe) { laufendeGabe.ende(); laufendeGabe = null; }
      boden.replaceChildren();
    }

    /* -------------------------------------------------------------- Aufbau */

    function zeigeAufbau() {
      aufraeumen();
      s.unter('');

      const schalter = el('div', 'v-modus');
      for (const m of [
        { id: 'handy', name: 'Ein Handy', unter: 'Wandert im Kreis.' },
        { id: 'code', name: 'Mit Code', unter: 'Jeder an seinem eigenen.' },
      ]) {
        const b = el('button', 'v-modus-knopf', null);
        b.type = 'button';
        b.append(el('span', 'v-modus-name', m.name), el('span', 'v-modus-unter', m.unter));
        if (einst.modus === m.id) b.dataset.an = 'ja';
        b.addEventListener('click', () => { einst.modus = m.id; merken(); zeigeAufbau(); });
        schalter.append(b);
      }
      boden.append(schalter);

      if (einst.modus === 'handy') aufbauHandy();
      else aufbauCode();
    }

    function aufbauHandy() {
      boden.append(wahlBlock('Fassung', FASSUNGEN.map((f) => ({
        id: f.id, name: f.name, unter: f.unter,
        gesperrt: (einst.namen ? einst.namen.length : 3) < f.ab,
      })), einst.fassung, (id) => { einst.fassung = id; merken(); zeigeAufbau(); }));

      boden.append(themaBlock());
      boden.append(zeitBlock());

      Runde.aufbau(boden, {
        namen: einst.namen,
        min: 3,
        max: 12,
        knopfText: 'Rollen verteilen',
        weiter(namen) {
          einst.namen = namen;
          /* „Zwei Verräter" braucht fünf Leute – wer die Gruppe nachträglich
             verkleinert, fällt still auf die nächstbeste Fassung zurück. */
          if (namen.length < fassungVon(einst.fassung).ab) einst.fassung = 'doppel';
          merken();
          const rollen = rollenBauen(Runde.zufallAus(null), namen.length, einst.fassung, einst.thema);
          partie = {
            namen,
            fassung: fassungVon(einst.fassung),
            thema: rollen.thema,
            rollen,
            begonnen: Date.now(),
          };
          zeigeVerteilen();
        },
      });
    }

    function aufbauCode() {
      const notiz = el('p', 'v-notiz',
        'Alle brauchen die App. Einer würfelt einen Code und sagt ihn samt Spielerzahl an, dann tippt ihn jeder ein und wählt seine Nummer. Danach spricht kein Gerät mehr mit einem anderen – jedes rechnet die Runde für sich aus.');
      boden.append(notiz);

      Runde.codeAufbau(boden, {
        code: einst.code,
        anzahl: einst.anzahl,
        ich: einst.ich,
        min: 3,
        max: 12,
        knopfText: 'Meine Rolle zeigen',
        weiter({ code, anzahl, ich }) {
          einst.code = code;
          einst.anzahl = anzahl;
          einst.ich = ich + 1;
          merken();
          const { thema, fassung, rollen } = ausCode(code, anzahl);
          partie = {
            namen: Array.from({ length: anzahl }, (_, i) => 'Nummer ' + (i + 1)),
            fassung, thema, rollen,
            code, ich,
            begonnen: Date.now(),
          };
          zeigeCodeRolle();
        },
      });
    }

    /* Ein Block aus Knöpfen, von denen einer an ist – dreimal gebraucht. */
    function wahlBlock(titel, punkte, gewaehlt, tun) {
      const kasten = el('div', 'v-wahlblock');
      kasten.append(el('h3', 'v-wahl-titel', titel));
      const reihe = el('div', 'v-wahl-reihe');
      for (const p of punkte) {
        const b = el('button', 'v-wahl-knopf', null);
        b.type = 'button';
        b.append(el('span', 'v-wahl-name', p.name));
        if (p.unter) b.append(el('span', 'v-wahl-unter', p.unter));
        if (p.id === gewaehlt) b.dataset.an = 'ja';
        if (p.gesperrt) {
          b.disabled = true;
          b.title = 'Dafür seid ihr zu wenige.';
        }
        b.addEventListener('click', () => tun(p.id));
        reihe.append(b);
      }
      kasten.append(reihe);
      return kasten;
    }

    function themaBlock() {
      const punkte = [{ id: '', name: 'Bunt gemischt' }]
        .concat(Begriffe.THEMEN.map((t) => ({ id: t.id, name: t.name })));
      return wahlBlock('Thema', punkte, einst.thema, (id) => {
        einst.thema = id; merken(); zeigeAufbau();
      });
    }

    function zeitBlock() {
      return wahlBlock('Zeit zum Reden', ZEITEN.map((z) => ({ id: z.id, name: z.name })),
        einst.zeit, (id) => { einst.zeit = id; merken(); zeigeAufbau(); });
    }

    /* --------------------------------------------------- Rollen: ein Handy */

    function zeigeVerteilen() {
      aufraeumen();
      s.unter(partie.fassung.name);

      laufendeGabe = Runde.weitergabe(boden, {
        namen: partie.namen,
        halten: true,
        knopf: 'Gesehen',
        zeigen(i, flaeche) {
          flaeche.append(rollenKarte(i));
        },
        fertig: zeigeReden,
      });
    }

    /* Was ein Spieler auf seinem Schirm sieht – dieselbe Karte in beiden Wegen. */
    function rollenKarte(i) {
      const { rollen, fassung, thema } = partie;
      const istVerraeter = rollen.verraeter.includes(i);
      const kasten = el('div', 'v-karte');

      /* Doppelgänger: kein Wort über Rollen. Er soll ja nichts merken. */
      if (fassung.id === 'doppel') {
        kasten.append(el('p', 'v-karte-vor', 'Euer Wort'));
        kasten.append(el('p', 'v-wort', istVerraeter ? rollen.zwilling : rollen.wort));
        return kasten;
      }

      if (istVerraeter) {
        kasten.dataset.rolle = 'verraeter';
        kasten.append(el('p', 'v-karte-vor', 'Du bist'));
        kasten.append(el('p', 'v-wort', 'der Verräter'));
        kasten.append(el('p', 'v-karte-nach', 'Thema: ' + thema.name));
        if (fassung.id === 'zwei') {
          kasten.append(el('p', 'v-karte-nach', 'Ihr seid zu zweit – wer der andere ist, weißt du nicht.'));
        }
        return kasten;
      }

      kasten.append(el('p', 'v-karte-vor', 'Euer Wort'));
      kasten.append(el('p', 'v-wort', rollen.wort));
      return kasten;
    }

    /* -------------------------------------------------------- Rolle: Code */

    /* Im Code-Weg gibt es nichts weiterzugeben: das Gerät zeigt genau eine
       Rolle, die eigene. Thema und Fassung stehen als Probe darüber. */
    function zeigeCodeRolle() {
      aufraeumen();
      s.unter('Code ' + partie.code);

      const probe = el('div', 'v-probe');
      probe.append(el('span', 'v-probe-teil', partie.thema.name));
      probe.append(el('span', 'v-probe-teil', partie.fassung.name));
      probe.append(el('span', 'v-probe-teil', 'zu ' + partie.namen.length));
      boden.append(probe);
      boden.append(el('p', 'v-notiz',
        'Diese drei Angaben müssen bei allen gleich sein. Stimmt eine nicht, hat sich jemand vertippt – dann nochmal von vorn, sonst geht die Runde schief.'));

      const geheim = el('div', 'r-decke');
      const flaeche = el('div', 'r-flaeche');
      flaeche.append(rollenKarte(partie.ich));
      const deckel = el('div', 'r-deckel');
      deckel.append(el('span', 'r-deckel-text', 'Gedrückt halten'));
      geheim.append(flaeche, deckel);
      const auf = (e) => { e.preventDefault(); geheim.dataset.offen = 'ja'; };
      const zu = () => { delete geheim.dataset.offen; };
      geheim.addEventListener('pointerdown', auf);
      geheim.addEventListener('pointerup', zu);
      geheim.addEventListener('pointercancel', zu);
      geheim.addEventListener('pointerleave', zu);
      geheim.addEventListener('contextmenu', (e) => e.preventDefault());
      boden.append(geheim);

      const weiter = el('button', 'knopf knopf--voll v-breit', 'Weiter');
      weiter.type = 'button';
      weiter.addEventListener('click', zeigeReden);
      boden.append(weiter);
    }

    /* --------------------------------------------------------------- Reden */

    function zeigeReden() {
      aufraeumen();
      s.unter(partie.fassung.name);

      const kasten = el('div', 'v-reden');
      kasten.append(el('p', 'v-karte-vor', 'Es beginnt'));
      kasten.append(el('p', 'v-beginner', partie.namen[partie.rollen.beginnt]));
      kasten.append(el('p', 'v-notiz',
        'Reihum sagt jeder ein einziges Wort zum Begriff. Nicht zu genau – sonst hat es der Verräter leicht.'));
      boden.append(kasten);

      const zeit = zeitVon(einst.zeit);
      if (zeit.sekunden) {
        laufendeUhr = Runde.uhr(kasten, {
          sekunden: zeit.sekunden,
          ende: () => s.toast('Zeit vorbei.'),
        });
      }

      const weiter = el('button', 'knopf knopf--voll v-breit',
        partie.code ? 'Auflösen' : 'Abstimmen');
      weiter.type = 'button';
      weiter.addEventListener('click', () => {
        if (laufendeUhr) { laufendeUhr.stopp(); laufendeUhr = null; }
        if (partie.code) zeigeCodeEnde();
        else zeigeStimmen();
      });
      boden.append(weiter);
    }

    /* ---------------------------------------------------------- Abstimmung */

    function zeigeStimmen() {
      aufraeumen();
      laufendeGabe = Runde.stimmen(boden, {
        namen: partie.namen,
        frage: 'Wer kennt das Wort nicht?',
        fertig(gewaehlt) {
          const zaehlung = Runde.auszaehlen(gewaehlt, partie.namen);
          zeigeEnde(zaehlung);
        },
      });
    }

    /* Bei Gleichstand entkommt der Verräter – die Gruppe hat sich nicht
       geeinigt, und das ist ein Ergebnis, kein Fehler. */
    function zeigeEnde(zaehlung) {
      aufraeumen();
      const { rollen, namen } = partie;
      const getroffen = !zaehlung.gleichstand && zaehlung.vorn.length === 1
        && rollen.verraeter.includes(zaehlung.vorn[0].i);

      const kasten = el('div', 'v-ende');
      kasten.dataset.aus = getroffen ? 'gut' : 'schlecht';
      kasten.append(el('p', 'v-ende-titel', getroffen ? 'Erwischt.' : 'Entkommen.'));

      if (zaehlung.gleichstand) {
        kasten.append(el('p', 'v-notiz', 'Gleichstand – die Gruppe konnte sich nicht einigen.'));
      } else if (zaehlung.vorn.length === 1) {
        kasten.append(el('p', 'v-notiz', 'Gewählt wurde ' + zaehlung.vorn[0].name + '.'));
      }

      kasten.append(aufloesung());

      const tafel = el('div', 'v-tafel');
      for (const e of zaehlung.liste) {
        const zeile = el('div', 'v-tafel-zeile');
        if (rollen.verraeter.includes(e.i)) zeile.dataset.rolle = 'verraeter';
        zeile.append(el('span', 'v-tafel-name', e.name));
        zeile.append(el('span', 'v-tafel-zahl', e.anzahl === 1 ? '1 Stimme' : e.anzahl + ' Stimmen'));
        tafel.append(zeile);
      }
      kasten.append(tafel);
      boden.append(kasten);

      abschluss(getroffen);
      nochmalKnopf();
    }

    /* Der Code-Weg kann keine Stimmen einsammeln – dafür müssten die Geräte
       miteinander reden. Abgestimmt wird also von Hand, und das Gerät fragt
       nur nach dem Ausgang, damit die Statistik stimmt. */
    function zeigeCodeEnde() {
      aufraeumen();
      const kasten = el('div', 'v-ende');
      kasten.append(el('p', 'v-ende-titel', 'Auflösung'));
      kasten.append(aufloesung());
      boden.append(kasten);

      const frage = el('p', 'v-notiz', 'Habt ihr ihn erwischt?');
      boden.append(frage);

      const leiste = el('div', 'leiste');
      for (const [text, gut] of [['Ja', true], ['Nein', false]]) {
        const b = el('button', gut ? 'knopf knopf--voll' : 'knopf knopf--still', text);
        b.type = 'button';
        b.addEventListener('click', () => {
          abschluss(gut);
          leiste.remove();
          frage.textContent = gut ? 'Erwischt.' : 'Entkommen.';
          nochmalKnopf();
        });
        leiste.append(b);
      }
      boden.append(leiste);
    }

    function aufloesung() {
      const { rollen, namen, fassung } = partie;
      const kasten = el('div', 'v-aufloesung');
      kasten.append(el('p', 'v-karte-vor', 'Das Wort war'));
      kasten.append(el('p', 'v-wort', rollen.wort));

      const wer = rollen.verraeter.map((i) => namen[i]).join(' und ');
      kasten.append(el('p', 'v-notiz',
        rollen.verraeter.length > 1 ? wer + ' wussten es nicht.' : wer + ' wusste es nicht.'));

      if (fassung.id === 'doppel') {
        kasten.append(el('p', 'v-notiz', 'Auf dem anderen Schirm stand: ' + rollen.zwilling + '.'));
      }
      return kasten;
    }

    let notiert = false;
    function abschluss(gewonnen) {
      if (notiert) return;
      notiert = true;
      s.notieren({
        gewonnen,
        dauer: Date.now() - partie.begonnen,
        spieler: partie.namen.length,
        fassung: partie.fassung.id,
        modus: partie.code ? 'code' : 'handy',
      });
    }

    function nochmalKnopf() {
      const b = el('button', 'knopf knopf--voll v-breit', 'Noch eine Runde');
      b.type = 'button';
      b.addEventListener('click', neu);
      boden.append(b);
    }

    function neu() {
      notiert = false;
      partie = null;
      zeigeAufbau();
    }

    /* ------------------------------------------------------------ Anleitung */

    function anleitung() {
      const inhalt = document.createElement('div');
      inhalt.innerHTML = [
        '<p>Alle bekommen dasselbe Wort – einer nicht. Reihum sagt jeder <b>ein</b> Wort dazu. Zu genau, und der Verräter hat es; zu vage, und die anderen halten dich dafür.</p>',
        '<p><b>Doppelgänger:</b> Der Verräter bekommt ein ähnliches Wort und weiß selbst nicht, dass er einer ist. Es gibt nichts zu schauspielern, nur ein Missverständnis, das auffliegt.</p>',
        '<p><b>Blind:</b> Er weiß Bescheid und kennt nur das Thema. <b>Zwei Verräter:</b> wie blind, aber zu zweit und ohne einander zu kennen.</p>',
        '<p><b>Ein Handy:</b> Das Gerät wandert, jeder deckt seinen Schirm allein auf und stimmt am Ende geheim ab.</p>',
        '<p><b>Mit Code:</b> Alle haben die App. Einer würfelt einen Code, sagt ihn und die Spielerzahl an, jeder tippt ihn ein und wählt seine Nummer. Aus dem Code rechnet jedes Gerät dieselbe Runde aus – ohne Netz, ohne Verbindung. Thema, Fassung und Spielerzahl stehen oben und müssen bei allen gleich sein; das ist die Probe, dass sich keiner vertippt hat. Abgestimmt wird dann mit der Hand.</p>',
        '<p>Bei Gleichstand entkommt der Verräter.</p>',
      ].join('');
      s.blatt({ titel: 'Verräter', inhalt, aktionen: [{ text: 'Alles klar', voll: true }] });
    }

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neue Runde', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neu },
    ]);

    zeigeAufbau();

    return {
      ende() { aufraeumen(); },
    };
  }

  Rahmen.anmelden({
    id: 'verraeter',
    name: 'Verräter',
    unter: 'Alle kennen das Wort. Einer nicht.',
    farbe: '#B45B3E',
    symbol: '<path d="M4 8c2.5-2 5.5-3 8-3s5.5 1 8 3" stroke-linecap="round"/><circle cx="8" cy="13" r="2.6"/><circle cx="16" cy="13" r="2.6"/><path d="M10.6 13h2.8" stroke-linecap="round"/>',
    starten,

    auswertung(partien, hilfe) {
      if (!partien.length) return [];
      const gefunden = partien.filter((p) => p.gewonnen).length;
      const leute = partien.map((p) => p.spieler || 0).filter(Boolean);
      const schnitt = leute.length
        ? Math.round(leute.reduce((a, b) => a + b, 0) / leute.length)
        : 0;
      return [
        { wert: String(partien.length), label: partien.length === 1 ? 'Runde' : 'Runden' },
        { wert: hilfe.prozent(gefunden, partien.length), label: 'Verräter gefunden' },
        { wert: schnitt ? 'zu ' + schnitt : '–', label: 'meist gespielt' },
      ];
    },
  });
})();
