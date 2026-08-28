/* Wer am ehesten – die Gruppe stimmt über die Gruppe ab.

   Eine Frage steht im Raum, das Gerät wandert, jeder tippt heimlich auf einen
   Namen. Dann werden die Stimmen aufgedeckt. Es gibt nichts zu gewinnen und
   nichts richtig zu machen – das Ergebnis ist der Witz.

   Deshalb meldet sich das Spiel mit ohneSiege an: eine Runde ohne Sieger darf
   die Siegquote über allen Spielen weder heben noch drücken.

   Vom Baustein braucht es fast alles fertig: Aufbau, Weitergabe, geheime
   Abstimmung, Auszählung. Übrig bleiben die Fragen und die Balken.
*/

(() => {
  const SORTEN = {
    harmlos: {
      name: 'harmlos',
      fragen: [
        'den Flug verpassen',
        'eine Woche ohne Handy überstehen',
        'bei einer Quizshow weit kommen',
        'einen Kuchen von Grund auf backen',
        'sich im eigenen Viertel verlaufen',
        'auf einer Party als Erster einschlafen',
        'mit über vierzig ein Instrument lernen',
        'Bürgermeister werden',
        'einen Marathon laufen',
        'eine Zimmerpflanze am Leben halten',
        'einen ganzen Sonntag im Bett bleiben',
        'ungeplant ein Haustier mit nach Hause bringen',
        'bei Regen freiwillig spazieren gehen',
        'eine Rede halten, ohne sich vorzubereiten',
        'alles selbst reparieren wollen',
        'spontan ins Ausland ziehen',
        'zur eigenen Party zu spät kommen',
        'einen Kassenbon drei Jahre aufheben',
        'freiwillig im Zelt übernachten',
        'die Bedienungsanleitung wirklich lesen',
        'beim Wandern die Karte weglegen',
        'sich einen Namen nicht merken können',
        'als Erster auf die Tanzfläche gehen',
        'ein Auto kaufen, ohne Probe zu fahren',
        'beim Kochen etwas anbrennen lassen',
      ],
    },
    frech: {
      name: 'frech',
      fragen: [
        'die Wahrheit sagen, wenn Schweigen klüger wäre',
        'um drei Uhr nachts eine Nachricht schicken',
        'über den eigenen Witz am lautesten lachen',
        'ein Geheimnis versehentlich ausplaudern',
        'sich mit der Bedienung anlegen',
        'das letzte Stück nehmen, ohne zu fragen',
        'die Serie trotz Absprache allein weiterschauen',
        'die Rechnung zum eigenen Vorteil teilen',
        'eine Ausrede erfinden, um früher zu gehen',
        'in einem Streit als Letzter nachgeben',
        'den Wecker fünfmal ausmachen',
        'am Buffet ein drittes Mal auffüllen',
        'den Gruppenchat verlassen und nichts sagen',
        'ungefragt Ratschläge verteilen',
        'ein Regal falsch zusammenbauen und es so lassen',
        'so tun, als kenne er den Film',
        'sich beim Karaoke nicht mehr bremsen lassen',
        'ein Selfie zwanzigmal wiederholen',
        'die Spielregeln zu eigenen Gunsten auslegen',
        'den ganzen Reiseplan spontan umwerfen',
      ],
    },
  };

  const ALLE = [...SORTEN.harmlos.fragen, ...SORTEN.frech.fragen];
  const fragenVon = (id) => (SORTEN[id] ? SORTEN[id].fragen : ALLE);

  function starten(wurzel, s) {
    const el = s.el;
    const boden = el('div', 'v-boden');
    wurzel.append(boden);

    let gabe = null;

    const alt = s.erinnert() || {};
    const einst = {
      namen: Array.isArray(alt.namen) && alt.namen.length >= 3 ? alt.namen : null,
      sorte: SORTEN[alt.sorte] ? alt.sorte : '',
    };
    const merken = () => s.merken(einst);

    let partie = null;   // { namen, frage, gestellt, offen, begonnen }

    function aufraeumen() {
      if (gabe) { gabe.ende(); gabe = null; }
      boden.replaceChildren();
    }

    /* -------------------------------------------------------------- Aufbau */

    function zeigeAufbau() {
      aufraeumen();
      s.unter('');

      const punkte = [
        { id: '', name: 'gemischt' },
        { id: 'harmlos', name: 'harmlos' },
        { id: 'frech', name: 'frech' },
      ];
      const kasten = el('div', 'v-wahlblock');
      kasten.append(el('h3', 'v-wahl-titel', 'Fragen'));
      const reihe = el('div', 'v-wahl-reihe');
      for (const p of punkte) {
        const b = el('button', 'v-wahl-knopf', null);
        b.type = 'button';
        b.append(el('span', 'v-wahl-name', p.name));
        if (einst.sorte === p.id) b.dataset.an = 'ja';
        b.addEventListener('click', () => { einst.sorte = p.id; merken(); zeigeAufbau(); });
        reihe.append(b);
      }
      kasten.append(reihe);
      boden.append(kasten);

      Runde.aufbau(boden, {
        namen: einst.namen,
        min: 3,
        max: 12,
        knopfText: 'Erste Frage',
        weiter(namen) {
          einst.namen = namen;
          merken();
          partie = {
            namen,
            frage: '',
            gestellt: 0,
            offen: [...fragenVon(einst.sorte)],
            begonnen: Date.now(),
          };
          naechsteFrage();
        },
      });
    }

    /* --------------------------------------------------------------- Frage */

    /* Aus dem Vorrat wird gestrichen, was schon dran war. Ist er leer, füllt
       er sich wieder – ein Abend ist länger als fünfundvierzig Fragen. */
    function naechsteFrage() {
      if (!partie.offen.length) partie.offen = [...fragenVon(einst.sorte)];
      const n = Math.floor(Math.random() * partie.offen.length);
      partie.frage = partie.offen.splice(n, 1)[0];
      partie.gestellt += 1;
      zeigeFrage();
    }

    const frageText = () => 'Wer würde am ehesten ' + partie.frage + '?';

    function zeigeFrage() {
      aufraeumen();
      s.unter('Frage ' + partie.gestellt);

      const kasten = el('div', 'a-frage');
      kasten.append(el('p', 'v-karte-vor', 'Wer würde am ehesten'));
      kasten.append(el('p', 'a-frage-text', partie.frage + '?'));
      boden.append(kasten);
      boden.append(el('p', 'v-notiz',
        'Erst laut vorlesen, dann wandert das Gerät. Jeder tippt heimlich auf einen Namen.'));

      const los = el('button', 'knopf knopf--voll v-breit', 'Abstimmen');
      los.type = 'button';
      los.addEventListener('click', zeigeStimmen);
      boden.append(los);

      const andere = el('button', 'knopf knopf--still v-breit', 'Andere Frage');
      andere.type = 'button';
      andere.addEventListener('click', () => { partie.gestellt -= 1; naechsteFrage(); });
      boden.append(andere);
    }

    function zeigeStimmen() {
      aufraeumen();
      gabe = Runde.stimmen(boden, {
        namen: partie.namen,
        frage: frageText(),
        fertig: (gewaehlt) => zeigeErgebnis(Runde.auszaehlen(gewaehlt, partie.namen)),
      });
    }

    /* ----------------------------------------------------------- Ergebnis */

    function zeigeErgebnis(zaehlung) {
      aufraeumen();
      s.unter('Frage ' + partie.gestellt);

      const kasten = el('div', 'a-frage');
      kasten.append(el('p', 'v-karte-vor', 'Wer würde am ehesten'));
      kasten.append(el('p', 'a-frage-text', partie.frage + '?'));
      boden.append(kasten);

      const spitze = zaehlung.liste.length ? zaehlung.liste[0].anzahl : 0;
      const balken = el('div', 'a-liste');
      for (const e of zaehlung.liste) {
        const zeile = el('div', 'a-zeile');
        /* Der längste Balken füllt die Zeile, der Rest richtet sich danach. */
        zeile.style.setProperty('--anteil', (spitze ? (e.anzahl / spitze) * 100 : 0) + '%');
        if (e.anzahl === spitze && spitze > 0) zeile.dataset.vorn = 'ja';
        zeile.append(el('span', 'a-name', e.name));
        zeile.append(el('span', 'a-zahl', String(e.anzahl)));
        balken.append(zeile);
      }
      boden.append(balken);

      if (zaehlung.gleichstand) {
        boden.append(el('p', 'v-notiz', 'Gleichstand – ihr seid euch nicht einig.'));
      }

      const weiter = el('button', 'knopf knopf--voll v-breit', 'Nächste Frage');
      weiter.type = 'button';
      weiter.addEventListener('click', naechsteFrage);
      boden.append(weiter);

      const schluss = el('button', 'knopf knopf--still v-breit', 'Für heute reicht’s');
      schluss.type = 'button';
      schluss.addEventListener('click', () => { abschluss(); neu(); });
      boden.append(schluss);
    }

    /* Eine Partie ist hier der ganze Abend, nicht die einzelne Frage – sonst
       stünden nach einer Viertelstunde vierzig Einträge in der Statistik. */
    let notiert = false;
    function abschluss() {
      if (notiert || !partie || !partie.gestellt) return;
      notiert = true;
      s.notieren({
        dauer: Date.now() - partie.begonnen,
        spieler: partie.namen.length,
        fragen: partie.gestellt,
        sorte: einst.sorte || 'gemischt',
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
        '<p>Eine Frage wird vorgelesen, dann wandert das Gerät. Jeder tippt heimlich auf einen Namen – sich selbst kann man nicht wählen.</p>',
        '<p>Danach werden alle Stimmen auf einmal aufgedeckt. Es gibt keinen Sieger und keine richtige Antwort; interessant ist, wie einig ihr euch seid.</p>',
        '<p>Fünfundvierzig Fragen liegen bereit, harmlose und freche. Innerhalb eines Abends kommt keine zweimal.</p>',
      ].join('');
      s.blatt({ titel: 'Wer am ehesten', inhalt, aktionen: [{ text: 'Alles klar' }] });
    }

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Neue Runde', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: () => { abschluss(); neu(); } },
    ]);

    zeigeAufbau();

    /* Wer die App zuklappt, hat trotzdem gespielt – der Abend wird beim
       Verlassen festgehalten. */
    return { ende() { abschluss(); aufraeumen(); } };
  }

  Rahmen.anmelden({
    id: 'amehesten',
    name: 'Wer am ehesten',
    unter: 'Die Gruppe stimmt über die Gruppe ab.',
    farbe: '#4E8A54',
    ohneSiege: true,
    symbol: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" stroke-linecap="round"/><path d="M16 7h5M18.5 4.5v5" stroke-linecap="round"/>',
    starten,

    auswertung(partien) {
      if (!partien.length) return [];
      const fragen = partien.reduce((a, p) => a + (p.fragen || 0), 0);
      const leute = partien.map((p) => p.spieler || 0).filter(Boolean);
      const meist = leute.length ? Math.round(leute.reduce((a, b) => a + b, 0) / leute.length) : 0;
      return [
        { wert: String(fragen), label: fragen === 1 ? 'Frage gestellt' : 'Fragen gestellt' },
        { wert: meist ? 'zu ' + meist : '–', label: 'meist gespielt' },
      ];
    },
  });
})();
