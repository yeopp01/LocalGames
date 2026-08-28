/* Runde – die gemeinsamen Teile der Spiele, die man zu mehreren spielt.

   Kein Spiel, sondern Werkzeug: so wie loeser.js hinter Wördle steht, steht
   diese Datei hinter Verräter und allem, was in der Art noch kommt.

   Zwei Wege führen an denselben Punkt, nämlich „Platz Nummer i bekommt Rolle r":

   1. Weitergeben. Ein Handy wandert im Kreis, jeder sieht seinen Teil allein.
      Braucht nichts als ein Gerät.

   2. Code. Jeder hat die App, alle tippen denselben Code ein und sagen, welche
      Nummer sie sind. Aus dem Code errechnet jedes Gerät für sich dieselbe
      Runde – gleicher Startwert, gleiche Rechnung, gleiches Ergebnis. Die
      Geräte sind synchron, ohne je miteinander gesprochen zu haben.

   Dass Weg 2 ohne Netz auskommt, hängt an einer einzigen Bedingung: der Zufall
   muss vorhersagbar sein. Math.random ist es nicht – deshalb steht hier ein
   eigener Würfel, der aus einem Text seine Folge ableitet.
*/

const Runde = (() => {
  const el = (name, klasse, text) => {
    const k = document.createElement(name);
    if (klasse) k.className = klasse;
    if (text != null) k.textContent = text;
    return k;
  };

  const knopf = (klasse, text) => {
    const b = el('button', klasse, text);
    b.type = 'button';
    return b;
  };

  /* --------------------------------------------------------------- Zufall */

  /* Der Vorrat kennt kein O und keine 0, kein I und keine 1: der Code wird
     vorgelesen, nicht kopiert, und „null oder Oh?" verdirbt die Runde. */
  const VORRAT = 'ACDEFGHJKLMNPRTUVWXY34679';

  const codeErzeugen = (laenge = 4) => {
    let raus = '';
    for (let i = 0; i < laenge; i += 1) raus += VORRAT[Math.floor(Math.random() * VORRAT.length)];
    return raus;
  };

  /* Beim Eintippen ist alles erlaubt – aussortiert wird hier. So darf jemand
     "r4km" oder "R 4 K M" schreiben und bekommt dieselbe Runde. */
  const codeSauber = (text) => [...String(text || '').toUpperCase()]
    .filter((c) => VORRAT.includes(c))
    .join('');

  /* FNV-1a macht aus dem Code eine Zahl, Mulberry32 daraus eine Folge. Beides
     winzig, und vor allem: Zeichen für Zeichen auf jedem Gerät dieselbe.
     Ohne Startwert fällt die Sache auf Math.random zurück – dann ist es der
     gewöhnliche Zufall, wie ihn das Weitergeben braucht. */
  function zufallAus(startwert) {
    if (startwert == null || startwert === '') return Math.random;

    let h = 2166136261;
    for (const c of String(startwert)) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }

    let a = h >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const mischenMit = (zufall, feld) => {
    const raus = [...feld];
    for (let i = raus.length - 1; i > 0; i -= 1) {
      const j = Math.floor(zufall() * (i + 1));
      [raus[i], raus[j]] = [raus[j], raus[i]];
    }
    return raus;
  };

  const waehlen = (zufall, feld) => feld[Math.floor(zufall() * feld.length)];

  /* Zwei Knöpfe und eine Zahl – mehrfach gebraucht, also einmal geschrieben.
     Die Grenzen dürfen Funktionen sein, weil „ich bin Nummer" nie über die
     Spielerzahl hinausdarf, die gleich daneben verstellt wird. */
  function zaehlerBlock(beschriftung, holen, setzen, unten, oben) {
    const wurzel = el('div', 'r-zaehler');
    const weniger = knopf('r-stufe', '−');
    const mehr = knopf('r-stufe', '+');
    const zahl = el('span', 'r-zahl');
    weniger.setAttribute('aria-label', beschriftung + ': weniger');
    mehr.setAttribute('aria-label', beschriftung + ': mehr');
    wurzel.append(el('span', 'r-zaehler-wort', beschriftung), weniger, zahl, mehr);

    const grenze = (g) => (typeof g === 'function' ? g() : g);

    const auffrischen = () => {
      zahl.textContent = String(holen());
      weniger.disabled = holen() <= grenze(unten);
      mehr.disabled = holen() >= grenze(oben);
    };

    weniger.addEventListener('click', () => { if (holen() > grenze(unten)) setzen(holen() - 1); });
    mehr.addEventListener('click', () => { if (holen() < grenze(oben)) setzen(holen() + 1); });

    auffrischen();
    return { wurzel, auffrischen };
  }

  /* -------------------------------------------------------- Aufbau: Namen */

  /* Der Aufbau fürs Weitergeben. Namen sind freiwillig – wer keine Lust aufs
     Tippen hat, bleibt bei „Spieler 3", und es spielt sich genauso. */
  function aufbau(wurzel, { titel, hinweis, min = 3, max = 12, namen, knopfText = 'Los', weiter }) {
    const standard = (i) => 'Spieler ' + (i + 1);
    const liste = (namen && namen.length >= min) ? [...namen] : [standard(0), standard(1), standard(2)];

    const kasten = el('div', 'r-aufbau');
    if (titel) kasten.append(el('h2', 'r-titel', titel));
    if (hinweis) kasten.append(el('p', 'r-hinweis', hinweis));

    const namensfeld = el('div', 'r-namen');
    const los = knopf('knopf knopf--voll r-los', knopfText);

    const zaehler = zaehlerBlock('Wir sind zu', () => liste.length, (n) => {
      while (liste.length > n) liste.pop();
      while (liste.length < n) liste.push(standard(liste.length));
      zeichnen();
    }, min, max);

    kasten.append(zaehler.wurzel, namensfeld, los);
    wurzel.append(kasten);

    function zeichnen() {
      zaehler.auffrischen();
      namensfeld.replaceChildren();
      liste.forEach((name, i) => {
        const zeile = el('label', 'r-name');
        zeile.append(el('span', 'r-name-nr', String(i + 1)));
        const feld = el('input', 'r-name-feld');
        feld.type = 'text';
        feld.value = name;
        feld.maxLength = 14;
        feld.autocomplete = 'off';
        feld.setAttribute('aria-label', 'Name von Spieler ' + (i + 1));
        feld.addEventListener('input', () => { liste[i] = feld.value; });
        /* Leer stehen lassen heißt: doch lieber die Nummer. */
        feld.addEventListener('blur', () => {
          if (!feld.value.trim()) { liste[i] = standard(i); feld.value = liste[i]; }
        });
        zeile.append(feld);
        namensfeld.append(zeile);
      });
    }

    los.addEventListener('click', () => {
      weiter(liste.map((n, i) => (n.trim() ? n.trim() : standard(i))));
    });

    zeichnen();
    return kasten;
  }

  /* -------------------------------------------------------- Aufbau: Code */

  /* Ein einziger Schirm für alle: der Erste würfelt einen Code und sagt ihn
     samt Spielerzahl an, alle tippen ihn ein, jeder wählt seine Nummer. Kein
     Einladen, kein Warten, kein Gastgeber – nur eine Verabredung. */
  function codeAufbau(wurzel, { titel, hinweis, min = 3, max = 12, anzahl = 4, code = '', ich = 1, knopfText = 'Los', weiter }) {
    const stand = { code: codeSauber(code), anzahl, ich };

    const kasten = el('div', 'r-aufbau');
    if (titel) kasten.append(el('h2', 'r-titel', titel));
    if (hinweis) kasten.append(el('p', 'r-hinweis', hinweis));

    const codeZeile = el('div', 'r-codezeile');
    const codeFeld = el('input', 'r-codefeld');
    codeFeld.type = 'text';
    codeFeld.value = stand.code;
    codeFeld.maxLength = 6;
    codeFeld.placeholder = 'Code';
    codeFeld.autocapitalize = 'characters';
    codeFeld.autocomplete = 'off';
    codeFeld.spellcheck = false;
    codeFeld.setAttribute('aria-label', 'Code der Runde');
    const wuerfel = knopf('knopf knopf--still r-wuerfel', 'Würfeln');
    codeZeile.append(codeFeld, wuerfel);

    const anzahlWahl = zaehlerBlock('Wir sind zu', () => stand.anzahl, (n) => {
      stand.anzahl = n;
      if (stand.ich > n) stand.ich = n;
      zeichnen();
    }, min, max);

    const ichWahl = zaehlerBlock('Ich bin Nummer', () => stand.ich, (n) => {
      stand.ich = n;
      zeichnen();
    }, 1, () => stand.anzahl);

    const merke = el('p', 'r-hinweis r-hinweis--leise',
      'Alle tippen denselben Code ein und zählen einmal laut durch. Wer versehentlich dieselbe Nummer nimmt, bekommt auch dieselbe Rolle.');
    const los = knopf('knopf knopf--voll r-los', knopfText);

    kasten.append(codeZeile, anzahlWahl.wurzel, ichWahl.wurzel, merke, los);
    wurzel.append(kasten);

    function zeichnen() {
      anzahlWahl.auffrischen();
      ichWahl.auffrischen();
      los.disabled = stand.code.length < 3;
    }

    codeFeld.addEventListener('input', () => {
      const sauber = codeSauber(codeFeld.value);
      if (codeFeld.value !== sauber) codeFeld.value = sauber;
      stand.code = sauber;
      zeichnen();
    });
    wuerfel.addEventListener('click', () => {
      stand.code = codeErzeugen();
      codeFeld.value = stand.code;
      zeichnen();
    });
    los.addEventListener('click', () => {
      if (stand.code.length < 3) return;
      weiter({ code: stand.code, anzahl: stand.anzahl, ich: stand.ich - 1 });
    });

    zeichnen();
    return kasten;
  }

  /* ----------------------------------------------------------- Weitergabe */

  /* Das Handy wandert. Vor jedem Blick steht ein Sperrschirm mit dem Namen –
     er ist der eigentliche Trick: ohne ihn liest der Nachbar mit, weil das
     Geheimnis schon auf dem Bildschirm steht, während das Gerät noch in der
     Luft ist.

     zeigen(i, flaeche, weiter) füllt den Schirm des Spielers i. Wer selbst
     einen Knopf setzt – die Abstimmung etwa –, übergibt knopf: null und ruft
     weiter() von Hand.

     halten: true deckt den Inhalt nur auf, solange der Finger liegt. Für alles
     Geheime richtig, für alles Antippbare falsch. */
  function weitergabe(wurzel, { namen, zeigen, fertig, knopf: knopfText = 'Weiter', halten = false, uebergabe }) {
    const buehne = el('div', 'r-buehne');
    wurzel.append(buehne);

    let i = 0;
    let abgebrochen = false;

    function sperre() {
      buehne.replaceChildren();
      const karte = el('div', 'r-sperre');
      karte.append(el('p', 'r-sperre-vor', uebergabe || 'Weitergeben an'));
      karte.append(el('p', 'r-sperre-name', namen[i]));
      const auf = knopf('knopf knopf--voll r-sperre-knopf', 'Ich bin ' + namen[i]);
      auf.addEventListener('click', geheim);
      karte.append(auf);
      buehne.append(karte);
    }

    function geheim() {
      buehne.replaceChildren();
      const karte = el('div', 'r-geheim');
      karte.append(el('p', 'r-geheim-name', namen[i]));

      const flaeche = el('div', 'r-flaeche');
      karte.append(halten ? decke(flaeche) : flaeche);

      if (knopfText) {
        const w = knopf('knopf knopf--voll r-weiter', knopfText);
        w.addEventListener('click', naechster);
        karte.append(w);
      }

      buehne.append(karte);
      zeigen(i, flaeche, naechster);
    }

    /* Der Deckel liegt über dem Inhalt, nicht an seiner Stelle: so steht der
       Schirm schon fertig da, wenn der Finger kommt, und nichts springt beim
       Aufdecken. */
    function decke(flaeche) {
      const huelle = el('div', 'r-decke');
      const deckel = el('div', 'r-deckel');
      deckel.append(el('span', 'r-deckel-text', 'Gedrückt halten'));
      huelle.append(flaeche, deckel);

      const auf = (e) => { e.preventDefault(); huelle.dataset.offen = 'ja'; };
      const zu = () => { delete huelle.dataset.offen; };
      huelle.addEventListener('pointerdown', auf);
      huelle.addEventListener('pointerup', zu);
      huelle.addEventListener('pointercancel', zu);
      huelle.addEventListener('pointerleave', zu);
      huelle.addEventListener('contextmenu', (e) => e.preventDefault());
      return huelle;
    }

    function naechster() {
      if (abgebrochen) return;
      i += 1;
      if (i >= namen.length) { buehne.replaceChildren(); fertig(); return; }
      sperre();
    }

    sperre();
    return { ende() { abgebrochen = true; } };
  }

  /* ----------------------------------------------------------- Abstimmung */

  /* Reihum, geheim, auf demselben Gerät – also wieder eine Weitergabe, nur mit
     einer Liste statt einer Botschaft. */
  function stimmen(wurzel, { namen, frage, fertig }) {
    const gewaehlt = new Array(namen.length).fill(-1);

    return weitergabe(wurzel, {
      namen,
      knopf: null,
      uebergabe: 'Abstimmen',
      zeigen(i, flaeche, weiter) {
        if (frage) flaeche.append(el('p', 'r-frage', frage));
        const liste = el('div', 'r-wahl');
        namen.forEach((name, k) => {
          if (k === i) return;                    // sich selbst wählt niemand
          const b = knopf('r-wahl-knopf', name);
          b.addEventListener('click', () => { gewaehlt[i] = k; weiter(); });
          liste.append(b);
        });
        flaeche.append(liste);
      },
      fertig: () => fertig(gewaehlt),
    });
  }

  /* Aus den Stimmen die Reihenfolge. Ein Gleichstand an der Spitze wird
     gemeldet und nicht heimlich aufgelöst – was er bedeutet, weiß nur das
     Spiel. */
  function auszaehlen(gewaehlt, namen) {
    const zahl = new Array(namen.length).fill(0);
    for (const k of gewaehlt) if (k >= 0 && k < zahl.length) zahl[k] += 1;

    const liste = namen
      .map((name, i) => ({ i, name, anzahl: zahl[i] }))
      .sort((a, b) => b.anzahl - a.anzahl || a.i - b.i);

    const spitze = liste.length ? liste[0].anzahl : 0;
    const vorn = spitze > 0 ? liste.filter((e) => e.anzahl === spitze) : [];
    return { liste, vorn, gleichstand: vorn.length > 1 };
  }

  /* ------------------------------------------------------------------ Uhr */

  /* Läuft rückwärts und meldet sich am Ende. streuung verschiebt das Ende um
     bis zu so viele Sekunden nach oben oder unten – für eine Bombe, die eben
     nicht auf die Sekunde genau hochgehen darf. Ist sie im Spiel, bleibt die
     Anzeige besser aus, sonst zählt jeder mit. */
  function uhr(flaeche, { sekunden, streuung = 0, sichtbar = true, ende }) {
    const anzeige = el('div', sichtbar ? 'r-uhr' : 'r-uhr r-uhr--blind');
    flaeche.append(anzeige);

    const ziel = Date.now() + (sekunden + (Math.random() * 2 - 1) * streuung) * 1000;
    let takt = null;

    const text = (ms) => {
      const s = Math.max(0, Math.ceil(ms / 1000));
      return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    };

    function stopp() {
      if (takt) { clearInterval(takt); takt = null; }
    }

    function schlag() {
      const rest = ziel - Date.now();
      if (sichtbar) {
        anzeige.textContent = text(rest);
        if (rest <= 10000) anzeige.dataset.knapp = 'ja';
      }
      if (rest <= 0) { stopp(); if (ende) ende(); }
    }

    schlag();
    takt = setInterval(schlag, 250);
    return { stopp, anzeige };
  }

  return {
    codeErzeugen, codeSauber, zufallAus, mischenMit, waehlen,
    aufbau, codeAufbau, weitergabe, stimmen, auszaehlen, uhr,
  };
})();
