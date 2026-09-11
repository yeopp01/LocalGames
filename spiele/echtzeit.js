/* Echtzeit – das Werkzeug hinter den Geschicklichkeitsspielen.

   Die übrigen Spiele warten auf einen Zug; diese laufen weiter, ob jemand
   hinsieht oder nicht. Was daran jedes Mal gleich ist und jedes Mal leicht
   falsch wird, steht hier einmal:

   * Eine Leinwand mit festen logischen Maßen, die sich selbst auf Fenster
     und Pixeldichte einstellt. Die Spiele rechnen nur in ihren eigenen
     Einheiten und merken nichts davon, ob das Handy klein oder der Laptop
     groß ist.
   * Eine Schleife mit festem Takt. Die Bildrate schwankt – zwischen 60 und
     120 Hz, und nach einem Ruckler liegen auch mal 300 ms zwischen zwei
     Bildern. Mit festem Takt fällt ein Vogel auf jedem Gerät gleich schnell,
     und nichts rutscht in einem großen Schritt durch eine Wand.
   * Anhalten, sobald niemand hinsieht: App im Hintergrund, anderes Fenster,
     ein offenes Blatt. Ein Echtzeitspiel, das weiterläuft, während die
     Anleitung offen ist, ist verloren, bevor man sie zu Ende gelesen hat.
   * Aufräumen. Jeder Listener, der über `an()` hängt, und die Schleife
     selbst enden mit `ende()` – ein Nachzügler würde sonst in eine Bühne
     malen, die längst einem anderen Spiel gehört.

   Die Farben kommen aus den CSS-Tokens, damit die Spiele hell und dunkel
   aussehen wie der Rest der App. */

var Echtzeit = (() => {
  const TOKENS = ['papier', 'karte', 'karte-rand', 'tinte', 'tinte-leise', 'tinte-still',
    'gruen', 'gelb', 'grau', 'rost', 't-sonne', 't-mond'];

  function farbenLesen() {
    const stil = getComputedStyle(document.documentElement);
    const f = {};
    for (const t of TOKENS) f[t.replace(/-(\w)/g, (_, b) => b.toUpperCase())] = stil.getPropertyValue('--' + t).trim();
    return f;
  }

  const blattOffen = () =>
    ['sheet-spiel', 'sheet-einstellungen'].some((id) => {
      const b = document.getElementById(id);
      return b && !b.hidden;
    });

  /* Eine Taste zählt fürs Spiel nur ohne Strg/Alt/Meta und ohne offenes Blatt –
     sonst lenkt Strg+R die Schlange, bevor die Seite neu lädt. */
  const tasteZaehlt = (e) => !(e.metaKey || e.ctrlKey || e.altKey) && !blattOffen();

  /**
   * Baut Leinwand und Schild in `kasten` und betreibt die Schleife.
   *
   * opt.breite, opt.hoehe  logische Maße, in denen das Spiel rechnet
   * opt.schritt(dt)        ein Takt Spielrechnung, dt in Sekunden
   * opt.zeichnen(ctx, f)   malt den Stand; f sind die Farben der Tokens
   * opt.beiHalt()          die Schleife hat angehalten – von selbst oder gerufen
   * opt.takt               Sekunden je Schritt, Vorgabe 1/120
   */
  function buehne(kasten, opt) {
    const takt = opt.takt || 1 / 120;
    kasten.classList.add('ez-kasten');
    kasten.style.aspectRatio = opt.breite + ' / ' + opt.hoehe;

    const canvas = document.createElement('canvas');
    canvas.className = 'ez-leinwand';
    const schild = document.createElement('div');
    schild.className = 'ez-schild';
    schild.hidden = true;
    kasten.append(canvas, schild);
    const ctx = canvas.getContext('2d');

    let farben = farbenLesen();
    let masstab = 1;              // CSS-Pixel je logischer Einheit
    let laeuft = false;
    let rahmen = 0;
    let zuletzt = 0;
    let rest = 0;
    let beendet = false;
    const abnehmen = [];

    function an(ziel, typ, fn, optionen) {
      ziel.addEventListener(typ, fn, optionen);
      abnehmen.push(() => ziel.removeEventListener(typ, fn, optionen));
    }

    function malen() {
      if (beendet || !canvas.width) return;
      ctx.setTransform(canvas.width / opt.breite, 0, 0, canvas.height / opt.hoehe, 0, 0);
      opt.zeichnen(ctx, farben);
    }

    function messen() {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      const dichte = window.devicePixelRatio || 1;
      canvas.width = Math.round(r.width * dichte);
      canvas.height = Math.round(r.height * dichte);
      masstab = r.width / opt.breite;
      malen();
    }

    const beobachter = new ResizeObserver(messen);
    beobachter.observe(canvas);
    messen();

    const dunkel = window.matchMedia('(prefers-color-scheme: dark)');
    const farbwechsel = () => { farben = farbenLesen(); malen(); };
    dunkel.addEventListener('change', farbwechsel);
    abnehmen.push(() => dunkel.removeEventListener('change', farbwechsel));

    function bild(jetzt) {
      rahmen = 0;
      if (!laeuft) return;
      if (blattOffen()) { halt(); return; }
      // Nach einem langen Hänger nicht alles nachholen: lieber kurz langsamer
      // als ein Sprung, in dem der Vogel schon am Boden liegt.
      rest += Math.min(0.1, Math.max(0, (jetzt - zuletzt) / 1000));
      zuletzt = jetzt;
      while (rest >= takt && laeuft) {
        rest -= takt;
        opt.schritt(takt);
      }
      malen();
      if (laeuft) rahmen = requestAnimationFrame(bild);
    }

    function los() {
      if (laeuft || beendet) return;
      laeuft = true;
      rest = 0;
      zuletzt = performance.now();
      rahmen = requestAnimationFrame(bild);
    }

    function halt() {
      if (!laeuft) return;
      laeuft = false;
      if (rahmen) cancelAnimationFrame(rahmen);
      rahmen = 0;
      if (opt.beiHalt) opt.beiHalt();
      malen();
    }

    an(document, 'visibilitychange', () => { if (document.hidden) halt(); });
    an(window, 'blur', halt);
    an(window, 'pagehide', halt);

    return {
      canvas,
      get laeuft() { return laeuft; },
      /** CSS-Pixel je logischer Einheit – für Gesten, die 1:1 folgen sollen. */
      get masstab() { return masstab; },
      los,
      halt,
      malen,
      an,
      schild(titel, unter) {
        schild.replaceChildren();
        const t = document.createElement('p');
        t.className = 'ez-schild-titel';
        t.textContent = titel;
        schild.append(t);
        if (unter) {
          const u = document.createElement('p');
          u.className = 'ez-schild-unter';
          u.textContent = unter;
          schild.append(u);
        }
        schild.hidden = false;
      },
      schildWeg() { schild.hidden = true; },
      ende() {
        if (beendet) return;
        // Erst die Listener ab, dann anhalten: beiHalt darf noch sichern,
        // aber kein blur von gleich darf danach wieder hineinrufen.
        for (const f of abnehmen.splice(0)) f();
        halt();
        beendet = true;
        beobachter.disconnect();
      },
    };
  }

  /* ---------------------------------------------------------- Kleinzeug */

  /** Kasten unter dem Feld mit Titel, Satz und Knöpfen – für Pause und Ende. */
  function kasten(titel, text, knoepfe) {
    const k = document.createElement('div');
    k.className = 'ende-kasten';
    const t = document.createElement('p');
    t.className = 'ende-titel';
    t.textContent = titel;
    k.append(t);
    if (text) {
      const n = document.createElement('p');
      n.className = 'notiz';
      n.textContent = text;
      k.append(n);
    }
    const leiste = document.createElement('div');
    leiste.className = 'leiste';
    for (const kn of knoepfe) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'knopf ' + (kn.art === 'still' ? 'knopf--still' : 'knopf--voll');
      b.textContent = kn.text;
      b.addEventListener('click', kn.tun);
      leiste.append(b);
    }
    k.append(leiste);
    return k;
  }

  /** Abgerundetes Rechteck als Pfad; ältere Browser bekommen Ecken. */
  function rund(ctx, x, y, b, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, b, h, r);
    else ctx.rect(x, y, b, h);
  }

  /** Zahl aus einer Partie – eine eingelesene Sicherung kann alles enthalten. */
  const zahl = (w) => (typeof w === 'number' && Number.isFinite(w) ? w : 0);

  const SYMBOL = {
    pause: '<path d="M9 6v12M15 6v12" stroke-linecap="round"/>',
    anleitung: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>',
  };

  /* Leertaste und Enter gehören dem Knopf, der gerade den Fokus hat – sonst
     schaltet ein Druck die Pause ein und der fokussierte Pause-Knopf sie
     beim Loslassen gleich wieder aus. */
  const knopfHatFokus = (e) => e.target instanceof Element && !!e.target.closest('button, input, select, textarea');

  return { buehne, blattOffen, tasteZaehlt, knopfHatFokus, farbenLesen, kasten, rund, zahl, SYMBOL };
})();
