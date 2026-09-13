/* Tiere – das Werkzeug hinter den Kinderspielen.

   Die übrigen Spiele sind für Leute gebaut, die lesen, zielen und verlieren
   können. Ein Kind von anderthalb Jahren kann nichts davon: Es tippt mit der
   ganzen Hand, wischt quer über alles und lässt den Daumen irgendwo liegen.
   Was die Kinderspiele deshalb teilen, steht hier einmal:

   * Die Tiere – Name, Ruf, Bild, Futter – und ihre Aufnahmen in toene/. Das
     Bild ist ein Emoji: Es ist auf jedem Gerät da, groß und bunt, und die Kuh
     bleibt eine Kuh, auch wenn sie auf dem iPhone anders aussieht als auf
     Android. Herkunft und Lizenz jeder Aufnahme stehen in NOTICE.
   * Der Klang. Die Aufnahmen werden beim Öffnen geholt und über Web Audio
     gespielt; ein <audio> braucht auf manchen Handys spürbar, bis es tönt,
     und das Kind hat bis dahin schon das nächste Tier gedrückt. Es ruft immer
     nur ein Tier – ein neues beendet das vorige, sonst gibt es bei zehn
     Fingern Geräuschsalat.
   * Das Kinderzimmer: eine Fläche über dem ganzen Fenster, auch über der
     Kopfzeile, auf der nichts liegt, was aus dem Spiel führt. Heraus kommt
     nur, wer den Knopf in der Ecke anderthalb Sekunden hält, und zwar allein
     – liegt eine zweite Hand auf dem Glas, zählt das Halten nicht.
     Aus der App heraus führt das Handy selbst trotzdem (Zurück-Geste,
     Startknopf); das kann nur das System sperren, und der Vorhang vor dem
     Zimmer sagt den Eltern, wie.
   * Aufräumen. Jede Uhr und jeder Listener, die über das Zimmer laufen,
     enden, wenn es schließt – ein Nachzügler würde sonst in ein Zimmer rufen,
     das es nicht mehr gibt. */

var Tiere = (() => {
  /* futter: [Name, Bild] – jedes Futter gehört genau einem Tier, sonst hätte
     Futterzeit zwei richtige Antworten. laut unter 1 für Rufe, die ein Baby
     erschrecken können, auch wenn die Aufnahmen gleich laut gemacht sind. */
  const TIERE = [
    { id: 'kuh', name: 'Kuh', der: 'die', ruf: 'Muh', bild: '🐮', farbe: '#9BC27A', futter: ['Gras', '🌿'] },
    { id: 'pferd', name: 'Pferd', der: 'das', ruf: 'Wieher', bild: '🐴', farbe: '#C79A6B', futter: ['Apfel', '🍎'] },
    { id: 'schwein', name: 'Schwein', der: 'das', ruf: 'Oink', bild: '🐷', farbe: '#F0A7B8', futter: ['Mais', '🌽'] },
    { id: 'schaf', name: 'Schaf', der: 'das', ruf: 'Mäh', bild: '🐑', farbe: '#C9D3DC', futter: null },
    { id: 'ziege', name: 'Ziege', der: 'die', ruf: 'Meck-meck', bild: '🐐', farbe: '#D9C7A0', futter: null },
    { id: 'huhn', name: 'Huhn', der: 'das', ruf: 'Gack-gack', bild: '🐔', farbe: '#F2C96B', futter: ['Körner', '🌾'] },
    { id: 'hahn', name: 'Hahn', der: 'der', ruf: 'Kikeriki', bild: '🐓', farbe: '#E68A5C', futter: null },
    { id: 'ente', name: 'Ente', der: 'die', ruf: 'Quak-quak', bild: '🦆', farbe: '#8FC3A8', futter: null },
    { id: 'hund', name: 'Hund', der: 'der', ruf: 'Wau-wau', bild: '🐶', farbe: '#D8B384', futter: ['Knochen', '🦴'] },
    { id: 'katze', name: 'Katze', der: 'die', ruf: 'Miau', bild: '🐱', farbe: '#F2B880', futter: ['Fisch', '🐟'] },
    { id: 'maus', name: 'Maus', der: 'die', ruf: 'Piep', bild: '🐭', farbe: '#BFC4CC', futter: ['Käse', '🧀'] },
    { id: 'hase', name: 'Hase', der: 'der', ruf: null, bild: '🐰', farbe: '#E6D3C3', futter: ['Möhre', '🥕'] },
    { id: 'frosch', name: 'Frosch', der: 'der', ruf: 'Quak', bild: '🐸', farbe: '#9CCB6E', futter: ['Fliege', '🪰'] },
    { id: 'vogel', name: 'Vogel', der: 'der', ruf: 'Tirili', bild: '🐦', farbe: '#8EC5E8', futter: ['Wurm', '🪱'] },
    { id: 'eule', name: 'Eule', der: 'die', ruf: 'Schuhu', bild: '🦉', farbe: '#B59A7A', futter: null },
    { id: 'biene', name: 'Biene', der: 'die', ruf: 'Summ', bild: '🐝', farbe: '#F5D55C', futter: ['Blume', '🌻'] },
    { id: 'eichhoernchen', name: 'Eichhörnchen', der: 'das', ruf: null, bild: '🐿️', farbe: '#D9955B', futter: ['Nuss', '🌰'] },
    { id: 'wolf', name: 'Wolf', der: 'der', ruf: 'Auuu', bild: '🐺', farbe: '#A7B0BC', futter: null, laut: 0.8 },
    { id: 'loewe', name: 'Löwe', der: 'der', ruf: 'Roar', bild: '🦁', farbe: '#E9B654', futter: ['Fleisch', '🍖'], laut: 0.7 },
    { id: 'elefant', name: 'Elefant', der: 'der', ruf: 'Törö', bild: '🐘', farbe: '#AEB8C6', futter: ['Erdnuss', '🥜'], laut: 0.85 },
    { id: 'affe', name: 'Affe', der: 'der', ruf: 'Uh-uh-ah', bild: '🐵', farbe: '#C9A27E', futter: ['Banane', '🍌'] },
  ];

  /* Für diese Tiere liegt eine Aufnahme in toene/<id>.mp3. Die übrigen haben
     keinen Ruf, den ein Kind erkennt, oder keine freie Aufnahme, die taugt. */
  const MIT_TON = new Set(['kuh', 'pferd', 'schwein', 'schaf', 'ziege', 'huhn', 'hahn', 'ente', 'hund',
    'katze', 'frosch', 'vogel', 'eule', 'biene', 'wolf', 'loewe', 'elefant', 'affe']);

  for (const t of TIERE) {
    t.ton = MIT_TON.has(t.id) && !!t.ruf;
    if (!t.laut) t.laut = 1;
  }

  const nachId = (id) => TIERE.find((t) => t.id === id) || null;
  const gross = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  /** „die Kuh" */
  const mitArtikel = (t) => t.der + ' ' + t.name;
  /** „Die Kuh macht Muh!" */
  const satz = (t) => gross(mitArtikel(t)) + (t.ruf ? ' macht ' + t.ruf + '!' : '!');

  function mischen(liste) {
    const a = liste.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Zahl aus einer Partie – eine eingelesene Sicherung kann alles enthalten. */
  const zahl = (w) => (typeof w === 'number' && Number.isFinite(w) ? w : 0);

  /** Startet eine CSS-Animation neu, auch wenn sie gerade noch läuft. */
  function anstossen(knoten, klasse) {
    knoten.classList.remove(klasse);
    void knoten.offsetWidth;
    knoten.classList.add(klasse);
  }

  const ruhigGewuenscht = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ Klang */

  const AUDIO = window.AudioContext || window.webkitAudioContext;

  function klangwerk() {
    let ac = null;
    let haupt = null;
    let rauschen = null;
    let aktuell = null;     // die Aufnahme, die gerade tönt
    let nummer = 0;         // jeder Ruf zählt hoch; ein älterer, der noch lädt, bleibt stumm
    const roh = new Map();  // id → Versprechen auf die Bytes
    const fertig = new Map(); // id → Versprechen auf den dekodierten Puffer

    function holen(id) {
      if (!roh.has(id)) {
        roh.set(id, fetch('toene/' + id + '.mp3')
          .then((antwort) => (antwort.ok ? antwort.arrayBuffer() : null))
          .catch(() => null));
      }
      return roh.get(id);
    }

    /* Ein AudioContext entsteht erst im ersten Tipp: Vorher lassen ihn die
       Browser stumm, und am iPhone bleibt er es dann auch. */
    function kontext() {
      if (!AUDIO) return null;
      if (!ac) {
        try {
          ac = new AUDIO();
        } catch {
          return null;
        }
        haupt = ac.createGain();
        haupt.gain.value = 0.9;
        haupt.connect(ac.destination);
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    }

    function puffer(id) {
      const c = kontext();
      if (!c) return Promise.resolve(null);
      if (!fertig.has(id)) {
        fertig.set(id, holen(id).then((bytes) => bytes && new Promise((gut) => {
          // Die Form mit Rückruf, weil ältere Safari kein Versprechen liefern.
          // Wo doch eines kommt, wird es aufgefangen – sonst stünde ein
          // kaputter Ton als unbehandelter Fehler in der Konsole.
          try {
            const p = c.decodeAudioData(bytes, gut, () => gut(null));
            if (p && p.catch) p.catch(() => gut(null));
          } catch {
            gut(null);
          }
        })));
      }
      return fertig.get(id);
    }

    /* Kurz ausblenden statt hart abschneiden – ein Abbruch mitten in der
       Welle knackt. */
    function still() {
      nummer += 1;
      if (!aktuell || !ac) return;
      const { quelle, huelle } = aktuell;
      aktuell = null;
      const t = ac.currentTime;
      huelle.gain.cancelScheduledValues(t);
      huelle.gain.setValueAtTime(huelle.gain.value, t);
      huelle.gain.linearRampToValueAtTime(0, t + 0.05);
      try {
        quelle.stop(t + 0.06);
      } catch { /* schon zu Ende */ }
    }

    /** Spielt den Ruf eines Tiers. Liefert die Länge in Sekunden, 0 ohne Ton. */
    async function tier(id, laut = 1) {
      still();
      const meine = nummer;
      const p = await puffer(id);
      if (!p || meine !== nummer || !ac) return 0;
      const quelle = ac.createBufferSource();
      quelle.buffer = p;
      const huelle = ac.createGain();
      huelle.gain.value = laut;
      quelle.connect(huelle);
      huelle.connect(haupt);
      const eintrag = { quelle, huelle };
      quelle.onended = () => { if (aktuell === eintrag) aktuell = null; };
      aktuell = eintrag;
      quelle.start();
      return p.duration;
    }

    function ton(von, bis, zeit, typ, laut, spaeter = 0) {
      const c = kontext();
      if (!c) return;
      const t = c.currentTime + spaeter;
      const o = c.createOscillator();
      o.type = typ;
      o.frequency.setValueAtTime(von, t);
      o.frequency.exponentialRampToValueAtTime(bis, t + zeit);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(laut, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + zeit);
      o.connect(g);
      g.connect(haupt);
      o.start(t);
      o.stop(t + zeit + 0.05);
    }

    function knusper(spaeter) {
      const c = kontext();
      if (!c) return;
      if (!rauschen) {
        rauschen = c.createBuffer(1, c.sampleRate / 4, c.sampleRate);
        const d = rauschen.getChannelData(0);
        for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
      }
      const t = c.currentTime + spaeter;
      const q = c.createBufferSource();
      q.buffer = rauschen;
      const fi = c.createBiquadFilter();
      fi.type = 'bandpass';
      fi.frequency.value = 1800 + Math.random() * 900;
      fi.Q.value = 1.4;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      q.connect(fi);
      fi.connect(g);
      g.connect(haupt);
      q.start(t);
      q.stop(t + 0.1);
    }

    return {
      /** Holt die Aufnahmen schon einmal, ohne Ton – dekodiert wird beim ersten Ruf. */
      vorladen: (ids) => { for (const id of ids) holen(id); },
      wecken: kontext,
      tier,
      still,
      /** Leises Plopp – ein Tipp hat etwas bewirkt. */
      plopp: () => ton(420, 880, 0.09, 'sine', 0.12),
      /** Kleiner Dreiklang – richtig. */
      freude: () => [659, 831, 988].forEach((f, i) => ton(f, f, 0.16, 'triangle', 0.1, i * 0.09)),
      /** Längere Tonleiter – eine Runde ist geschafft. */
      jubel: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => ton(f, f, i === 5 ? 0.5 : 0.14, 'triangle', 0.1, i * 0.1)),
      /** Kauen, wenn ein Tier frisst. Fehlt die Aufnahme, knuspert es erzeugt. */
      async knabbern() {
        if (await puffer('knabbern')) return tier('knabbern', 0.9);
        for (let i = 0; i < 4; i += 1) knusper(i * 0.15);
        return 0.6;
      },
      schlafen() {
        if (!ac) return;
        still();
        if (ac.state === 'running') ac.suspend().catch(() => {});
      },
      ende() {
        still();
        if (ac) ac.close().catch(() => {});
        ac = null;
      },
    };
  }

  /* ------------------------------------------------------------ Bausteine */

  function kachel(el, tier, klasse) {
    const b = el('button', 'kz-tier' + (klasse ? ' ' + klasse : ''));
    b.type = 'button';
    b.style.setProperty('--ton', tier.farbe);
    b.setAttribute('aria-label', gross(mitArtikel(tier)));
    b.dataset.tier = tier.id;
    b.append(el('span', 'kz-bild', tier.bild));
    return b;
  }

  function futterKachel(el, tier) {
    const b = el('button', 'kz-tier kz-futter');
    b.type = 'button';
    b.setAttribute('aria-label', tier.futter[0]);
    b.dataset.tier = tier.id;
    b.append(el('span', 'kz-bild', tier.futter[1]));
    return b;
  }

  const X = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 7l10 10M17 7L7 17" stroke-linecap="round"/></svg>';
  const HALTEN = 1500;
  const FARBEN = ['#F2B84B', '#E8735A', '#6DBE7A', '#5AA7E0', '#B78AE0', '#F28DB2'];

  /**
   * Baut den Vorhang in `boden` und öffnet von dort das Kinderzimmer.
   *
   * opt.bilder             ein paar Emoji für den Vorhang
   * opt.satz               ein Satz, was im Spiel passiert
   * opt.stufen             optional [{ wert, text }] – die Eltern wählen vorher
   * opt.stufe              Vorgabe, wenn nichts gemerkt ist
   * opt.toene              ids, deren Aufnahmen schon vorab geholt werden
   * opt.brauchtTon         ohne Web Audio bleibt „Los" aus
   * opt.spielen(buehne, h) baut das Spiel ins Zimmer, gibt optional { ende() }
   * opt.schluss(ms)        das Zimmer ist zu; ms ist die Zeit darin, ohne
   *                        die Zeit im Hintergrund
   *
   * h: { klang, stufe, uhr(), spaeter(fn, ms), abbestellen(id), an(ziel, typ,
   *      fn, opt), el, blase(text), konfetti(x, y), fest(titel, bilder, weiter) }
   */
  function kinderzimmer(boden, s, opt) {
    const el = s.el;
    const klang = klangwerk();
    const gemerkt = s.erinnert();
    let stufe = null;
    if (opt.stufen) {
      stufe = gemerkt && opt.stufen.some((x) => x.wert === gemerkt.stufe) ? gemerkt.stufe : opt.stufe;
    }
    let offen = null;

    /* ------------------------------------------------------------ Vorhang */

    const vorhang = el('div', 'kz-vorhang');
    const bilder = el('div', 'kz-vorhang-bilder');
    bilder.setAttribute('aria-hidden', 'true');
    opt.bilder.forEach((b, i) => {
      const x = el('span', null, b);
      x.style.animationDelay = (i * 0.35) + 's';
      bilder.append(x);
    });
    vorhang.append(bilder, el('p', 'kz-vorhang-satz', opt.satz));

    if (opt.stufen) {
      const wahl = el('div', 'kz-wahl');
      wahl.setAttribute('role', 'radiogroup');
      wahl.setAttribute('aria-label', 'Wie schwer');
      const knoepfe = opt.stufen.map((o) => {
        const b = el('button', 'kz-wahl-knopf', o.text);
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.addEventListener('click', () => {
          stufe = o.wert;
          s.merken({ stufe });
          markieren();
        });
        wahl.append(b);
        return b;
      });
      const markieren = () => knoepfe.forEach((b, i) => b.setAttribute('aria-checked', String(opt.stufen[i].wert === stufe)));
      markieren();
      vorhang.append(wahl);
    }

    const los = el('button', 'knopf knopf--voll kz-los', 'Los geht’s');
    los.type = 'button';
    los.addEventListener('click', oeffnen);
    vorhang.append(los);
    if (opt.brauchtTon && !AUDIO) {
      los.disabled = true;
      vorhang.append(el('p', 'notiz kz-vorhang-notiz', 'Dieser Browser spielt keine Töne ab – ohne Ton geht dieses Spiel nicht.'));
    }
    vorhang.append(el('p', 'notiz kz-vorhang-notiz',
      'Für Eltern: Zum Beenden das × oben rechts gedrückt halten. Damit das Kind nicht aus der App wischt, '
      + 'das Handy festsetzen – unter Android „App anheften", am iPhone „Geführter Zugriff".'));
    boden.append(vorhang);
    klang.vorladen(opt.toene || []);

    /* ------------------------------------------------------------- Zimmer */

    function oeffnen() {
      if (offen) return;
      klang.wecken();

      const abnehmen = [];
      const uhren = new Set();
      let lebt = true;
      let gespielt = 0;
      let seit = document.hidden ? null : performance.now();
      const uhr = () => gespielt + (seit === null ? 0 : performance.now() - seit);

      const an = (ziel, typ, fn, o) => {
        ziel.addEventListener(typ, fn, o);
        abnehmen.push(() => ziel.removeEventListener(typ, fn, o));
      };
      const spaeter = (fn, ms) => {
        if (!lebt) return 0;
        const u = setTimeout(() => {
          uhren.delete(u);
          if (lebt) fn();
        }, ms);
        uhren.add(u);
        return u;
      };
      const abbestellen = (u) => {
        if (!u) return;
        clearTimeout(u);
        uhren.delete(u);
      };

      const flaeche = el('div', 'kz-zimmer');
      const buehne = el('div', 'kz-buehne');
      const blase = el('p', 'kz-blase');
      blase.hidden = true;
      blase.setAttribute('aria-live', 'polite');
      const finger = new Map();   // pointerId → pointerType
      const raus = rausKnopf(el, () => finger.size <= 1, schliessen);
      flaeche.append(buehne, blase, raus.knopf, raus.tipp);
      vorhang.hidden = true;
      boden.append(flaeche);

      const z = { flaeche, abnehmen, uhren, uhr, raus, spiel: null, sperre: null, schluss: null };
      offen = z;
      z.schluss = () => {
        lebt = false;
        if (seit !== null) gespielt += performance.now() - seit;
        seit = null;
      };

      /* Vollbild, wo es geht: Android blendet dann die Leisten aus, und die
         erste Zurück-Geste beendet nur das Vollbild statt das Spiel. */
      const wurzel = document.documentElement;
      if (wurzel.requestFullscreen && !document.fullscreenElement) {
        try {
          const p = wurzel.requestFullscreen({ navigationUI: 'hide' });
          if (p && p.catch) p.catch(() => {});
        } catch { /* dann eben im Fenster */ }
      }

      /* Ein Kind, das nur schaut und horcht, tippt eine Weile nicht – der
         Bildschirm soll dabei nicht dunkel werden. */
      async function wachHalten() {
        if (!navigator.wakeLock || document.hidden) return;
        try {
          const sperre = await navigator.wakeLock.request('screen');
          if (offen === z) z.sperre = sperre;
          else sperre.release().catch(() => {});
        } catch { /* ohne */ }
      }
      wachHalten();

      an(document, 'visibilitychange', () => {
        if (document.hidden) {
          if (seit !== null) gespielt += performance.now() - seit;
          seit = null;
          finger.clear();
          klang.schlafen();
        } else {
          if (seit === null) seit = performance.now();
          wachHalten();
        }
      });

      // Langes Drücken öffnet sonst ein Menü, markiert das Emoji als Text
      // oder zieht es als Bild aus dem Fenster.
      for (const typ of ['contextmenu', 'selectstart', 'dragstart', 'gesturestart']) {
        an(flaeche, typ, (e) => e.preventDefault());
      }

      /* Welche Finger gerade auf dem Glas liegen. Eine Maus ist immer nur
         einer, und wer die App verlässt, nimmt alle Finger mit: Ein Finger,
         dessen Loslassen nie ankam, sperrte sonst den Weg hinaus. */
      an(flaeche, 'pointerdown', (e) => {
        if (e.pointerType === 'mouse') {
          for (const [id, art] of finger) if (art === 'mouse') finger.delete(id);
        }
        finger.set(e.pointerId, e.pointerType);
        if (finger.size > 1) raus.abbrechen();
      }, true);
      const fingerWeg = (e) => finger.delete(e.pointerId);
      an(window, 'pointerup', fingerWeg, true);
      an(window, 'pointercancel', fingerWeg, true);
      an(window, 'blur', () => finger.clear());

      /* Kleine Hände auf der Tastatur: Leertaste scrollt sonst die Seite unter
         dem Zimmer, Tab wandert aus ihm heraus, F5 lädt neu. Nur Escape,
         gehalten wie der Knopf, führt hinaus. */
      an(window, 'keydown', (e) => {
        if (e.key === 'Escape') {
          if (!e.repeat) raus.beginnen('taste');
          e.preventDefault();
          return;
        }
        if (!(e.ctrlKey || e.metaKey || e.altKey)) e.preventDefault();
      });
      an(window, 'keyup', (e) => {
        if (e.key === 'Escape') raus.loslassen('taste');
      });

      let blasenUhr = 0;
      const h = {
        klang,
        stufe,
        uhr,
        spaeter,
        abbestellen,
        an,
        el,
        blase(text, ms = 2200) {
          blase.textContent = text;
          blase.hidden = false;
          anstossen(blase, 'kz-blase--neu');
          abbestellen(blasenUhr);
          blasenUhr = spaeter(() => { blase.hidden = true; }, ms);
        },
        konfetti(x, y, anzahl = 16) {
          if (ruhigGewuenscht()) return;
          for (let i = 0; i < anzahl; i += 1) {
            const k = el('span', 'kz-konfetto');
            const winkel = (i / anzahl) * Math.PI * 2 + Math.random() * 0.4;
            const weit = 70 + Math.random() * 90;
            k.style.setProperty('--x', Math.round(x) + 'px');
            k.style.setProperty('--y', Math.round(y) + 'px');
            k.style.setProperty('--dx', Math.round(Math.cos(winkel) * weit) + 'px');
            k.style.setProperty('--dy', Math.round(Math.sin(winkel) * weit - 30) + 'px');
            k.style.setProperty('--dreh', Math.round(Math.random() * 540 - 270) + 'deg');
            k.style.setProperty('--farbe', FARBEN[i % FARBEN.length]);
            flaeche.append(k);
            spaeter(() => k.remove(), 1000);
          }
        },
        /** Großes Festbild über dem Spiel; weiter kommt von selbst oder auf einen Tipp. */
        fest(titel, liste, weiter) {
          const f = el('div', 'kz-fest');
          f.append(el('p', 'kz-fest-titel', titel));
          const reihe = el('div', 'kz-fest-bilder');
          reihe.setAttribute('aria-hidden', 'true');
          liste.forEach((b, i) => {
            const x = el('span', null, b);
            x.style.animationDelay = (i * 0.12) + 's';
            reihe.append(x);
          });
          f.append(reihe);
          buehne.append(f);
          klang.jubel();
          const r = flaeche.getBoundingClientRect();
          h.konfetti(r.width / 2, r.height / 2, 28);
          let fertigUhr = 0;
          const fertig = () => {
            if (!f.isConnected) return;
            abbestellen(fertigUhr);
            f.remove();
            weiter();
          };
          fertigUhr = spaeter(fertig, 4200);
          // Erst nach einem Moment: Der Tipp, der die Runde beendet hat, soll
          // das Fest nicht gleich wieder wegwischen.
          spaeter(() => f.addEventListener('pointerdown', fertig), 1200);
        },
      };

      z.spiel = opt.spielen(buehne, h) || null;
    }

    function schliessen() {
      const z = offen;
      if (!z) return;
      offen = null;
      const ms = Math.round(z.uhr());
      z.schluss();
      for (const f of z.abnehmen.splice(0)) f();
      for (const u of z.uhren) clearTimeout(u);
      z.uhren.clear();
      z.raus.ende();
      if (z.spiel && z.spiel.ende) z.spiel.ende();
      z.flaeche.remove();
      vorhang.hidden = false;
      klang.schlafen();
      if (z.sperre) z.sperre.release().catch(() => {});
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      if (opt.schluss) opt.schluss(ms);
    }

    return {
      ende() {
        schliessen();
        klang.ende();
      },
    };
  }

  /* Der Knopf in der Ecke. Ein kurzer Tipp sagt nur, wie es geht; erst
     anderthalb Sekunden Halten führen hinaus, und nur, solange kein zweiter
     Finger auf dem Glas liegt – ein Baby hält gern die ganze Hand drauf. */
  function rausKnopf(el, allein, beiRaus) {
    const knopf = el('button', 'kz-raus');
    knopf.type = 'button';
    knopf.setAttribute('aria-label', 'Beenden – gedrückt halten');
    knopf.innerHTML = X;
    const tipp = el('p', 'kz-raus-tipp', 'Zum Beenden gedrückt halten');
    tipp.hidden = true;

    let wer = null;
    let beginn = 0;
    let rahmen = 0;
    let tippUhr = 0;

    function zeichnen() {
      rahmen = 0;
      if (wer === null) return;
      const anteil = Math.min(1, (performance.now() - beginn) / HALTEN);
      knopf.style.setProperty('--halten', anteil.toFixed(3));
      if (anteil >= 1) {
        abbrechen();
        beiRaus();
        return;
      }
      rahmen = requestAnimationFrame(zeichnen);
    }

    function beginnen(id) {
      if (wer !== null || (id !== 'taste' && !allein())) return;
      wer = id;
      beginn = performance.now();
      tipp.hidden = true;
      knopf.classList.add('kz-raus--haelt');
      rahmen = requestAnimationFrame(zeichnen);
    }

    function abbrechen() {
      if (rahmen) cancelAnimationFrame(rahmen);
      rahmen = 0;
      wer = null;
      knopf.classList.remove('kz-raus--haelt');
      knopf.style.setProperty('--halten', '0');
    }

    function loslassen(id) {
      if (wer === null || wer !== id) return;
      abbrechen();
      tipp.hidden = false;
      clearTimeout(tippUhr);
      tippUhr = setTimeout(() => { tipp.hidden = true; }, 2400);
    }

    knopf.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try {
        knopf.setPointerCapture(e.pointerId);
      } catch { /* synthetisch */ }
      beginnen(e.pointerId);
    });
    knopf.addEventListener('pointerup', (e) => loslassen(e.pointerId));
    knopf.addEventListener('pointercancel', () => abbrechen());

    return {
      knopf,
      tipp,
      beginnen,
      loslassen,
      abbrechen,
      ende() {
        abbrechen();
        clearTimeout(tippUhr);
      },
    };
  }

  return {
    TIERE, nachId, mischen, zahl, gross, mitArtikel, satz, anstossen,
    kachel, futterKachel, kinderzimmer, klangDa: !!AUDIO,
  };
})();
