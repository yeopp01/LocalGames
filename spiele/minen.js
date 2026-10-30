/* Minenfeld – das alte Minesweeper.

   Aufdecken, bis nur noch die Minen zugedeckt sind. Die Zahl in einem Feld
   sagt, wie viele der acht Nachbarn eine Mine tragen.

   Zwei Dinge sind hier bewusst anders als im Original:
   · Der erste Klick ist immer sicher – die Minen werden erst danach verteilt,
     und zwar außerhalb des angetippten Feldes samt seiner Nachbarn.
   · Für Finger gibt es einen Fahnen-Modus. Am Rechner geht weiterhin die
     rechte Maustaste, auf dem Handy zusätzlich langes Drücken.
   Die Spielregeln stehen in den Funktionen unter „Spielzug".
*/

(() => {
  /* Als Zeichnung statt als Schriftzeichen: ⚑ und ✳ sehen auf jedem Gerät
     anders aus und sind auf kleinen Kacheln kaum zu erkennen. */
  const FAHNE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="m-stange" d="M7.5 21V3.5"/><path class="m-tuch" d="M8.5 4l10.5 4.6-10.5 4.6z"/></svg>';
  const MINE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="m-stange" d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3L5.3 18.7"/><circle class="m-kugel" cx="12" cy="12" r="6.6"/></svg>';
  const BLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="m-kugel" x="4.5" y="4.5" width="15" height="15" rx="3"/></svg>';

  const STUFEN = {
    klein:  { name: 'klein',  spalten: 8,  zeilen: 10, minen: 10 },
    mittel: { name: 'mittel', spalten: 10, zeilen: 14, minen: 24 },
    gross:  { name: 'groß',   spalten: 12, zeilen: 18, minen: 40 },
  };

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let fahnenModus = false;
    let uhr = null;
    let druckUhr = null;
    let langGedrueckt = false;
    let cursor = 0;             // das Feld, auf dem die Pfeiltasten gerade stehen
    let neueBestzeit = false;
    let lage = '';              // was die Unterzeile gerade kurz zu sagen hat
    let lageBis = 0;

    function frisch(stufe) {
      const { spalten, zeilen, minen } = STUFEN[stufe];
      return {
        stufe,
        spalten,
        zeilen,
        minen,
        mine: new Array(spalten * zeilen).fill(false),
        offen: new Array(spalten * zeilen).fill(false),
        fahne: new Array(spalten * zeilen).fill(false),
        gelegt: false,          // Minen liegen erst nach dem ersten Klick
        verbraucht: 0,
        seit: Date.now(),
        fertig: null,           // null | 'sieg' | 'bumm'
      };
    }

    function laden() {
      const alt = s.erinnert();
      if (alt && Array.isArray(alt.mine) && !alt.fertig) {
        alt.seit = Date.now();
        return alt;
      }
      return frisch('klein');
    }

    const anzahl = () => stand.spalten * stand.zeilen;
    const zeitJetzt = () => stand.verbraucht + (stand.fertig || !stand.gelegt ? 0 : Date.now() - stand.seit);

    function sichern() {
      if (!stand.fertig) {
        stand.verbraucht = zeitJetzt();
        stand.seit = Date.now();
      }
      s.merken(stand);
    }

    function nachbarn(i) {
      const z = Math.floor(i / stand.spalten);
      const sp = i % stand.spalten;
      const raus = [];
      for (let dz = -1; dz <= 1; dz += 1) {
        for (let ds = -1; ds <= 1; ds += 1) {
          if (!dz && !ds) continue;
          const nz = z + dz;
          const ns = sp + ds;
          if (nz < 0 || ns < 0 || nz >= stand.zeilen || ns >= stand.spalten) continue;
          raus.push(nz * stand.spalten + ns);
        }
      }
      return raus;
    }

    const minenUm = (i) => nachbarn(i).filter((j) => stand.mine[j]).length;

    function minenLegen(sicher) {
      const tabu = new Set([sicher, ...nachbarn(sicher)]);
      const frei = [];
      for (let i = 0; i < anzahl(); i += 1) if (!tabu.has(i)) frei.push(i);
      for (let i = frei.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [frei[i], frei[j]] = [frei[j], frei[i]];
      }
      for (const i of frei.slice(0, Math.min(stand.minen, frei.length))) stand.mine[i] = true;
      stand.gelegt = true;
      stand.seit = Date.now();
    }

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'm-kopf');
    const rahmen = el('div', 'm-rahmen');
    const gitter = el('div', 'm-gitter');
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    /* Zwei Hälften statt eines Schalters: Man sieht jederzeit, was der nächste
       Tipp tut, und ein Fehltipp auf „Fahne" schaltet nicht aus Versehen zurück. */
    const leiste = el('div', 'm-modus');
    leiste.setAttribute('role', 'group');
    leiste.setAttribute('aria-label', 'Was ein Tipp tut');
    const modusKnopf = (text, zeichen, fahne) => {
      const b = el('button', 'm-modus-knopf');
      b.type = 'button';
      b.innerHTML = zeichen;
      b.append(document.createTextNode(text));
      b.addEventListener('click', () => { fahnenModus = fahne; s.fuehlen(); zeichnen(); });
      return b;
    };
    const aufdeckKnopf = modusKnopf('Aufdecken', BLOCK, false);
    const fahnenKnopf = modusKnopf('Fahne', FAHNE, true);
    leiste.append(aufdeckKnopf, fahnenKnopf);
    rahmen.append(gitter);
    wurzel.append(kopf, rahmen, endeKasten, leiste);

    s.werkzeuge([
      { label: 'Regeln', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: regelnZeigen },
      { label: 'Neues Feld', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    let felder = [];

    /* Das Brett ist hochkant, also entscheidet mal die Breite, mal die Höhe. Die
       Abzüge sind Kopfzeile, Zählerzeile, Moduswahl und der Rand der Karte. */
    function kachelRechnen() {
      const breit = Math.min(window.innerWidth - 28, 532) - 14;
      const hoch = window.innerHeight - 214;
      const passt = Math.min((breit - (stand.spalten - 1) * 2) / stand.spalten, (hoch - (stand.zeilen - 1) * 2) / stand.zeilen);
      gitter.style.setProperty('--kachel', Math.max(22, Math.min(54, Math.floor(passt))) + 'px');
    }

    function gitterBauen() {
      gitter.style.gridTemplateColumns = 'repeat(' + stand.spalten + ', var(--kachel))';
      kachelRechnen();
      // Stehen die Felder schon, reicht die neue Größe; ein Neubau während eines
      // langen Drucks, weil die Adressleiste einfährt, würde den Druck abbrechen.
      if (felder.length === anzahl()) return;
      gitter.replaceChildren();
      felder = [];
      for (let i = 0; i < anzahl(); i += 1) {
        const f = el('button', 'm-feld');
        f.type = 'button';
        const nr = i;
        f.tabIndex = i === cursor ? 0 : -1;
        f.addEventListener('click', () => { if (!langGedrueckt) antippen(nr); langGedrueckt = false; });
        /* Android meldet einen langen Druck zusätzlich als contextmenu, etwas
           später als unsere Uhr. Ohne die Abfrage käme die Fahne und ginge gleich wieder. */
        f.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          if (langGedrueckt) return;
          clearTimeout(druckUhr);
          fahneWechseln(nr);
        });
        f.addEventListener('pointerdown', (e) => {
          // Zieht der Finger nach dem langen Druck vom Feld, kommt kein click, der
          // das Merkmal zurücksetzt – dann schluckte es sonst den nächsten Tipp.
          langGedrueckt = false;
          clearTimeout(druckUhr);
          if (e.button) return;
          druckUhr = setTimeout(() => { langGedrueckt = true; s.fuehlen(20); fahneWechseln(nr); }, 420);
        });
        for (const art of ['pointerup', 'pointerleave', 'pointercancel']) {
          f.addEventListener(art, () => clearTimeout(druckUhr));
        }
        gitter.append(f);
        felder.push(f);
      }
    }

    /* ------------------------------------------------------------- Spielzug */

    function antippen(i) {
      if (stand.fertig) return;
      cursorSetzen(i);
      // Eine offene Zahl hat keine Fahne zu vergeben: Sie öffnet in jedem Modus.
      if (stand.offen[i]) { umgebungOeffnen(i); return; }
      if (fahnenModus) { fahneWechseln(i); return; }
      if (stand.fahne[i]) return;

      if (!stand.gelegt) minenLegen(i);

      s.fuehlen();
      if (stand.mine[i]) {
        stand.offen[i] = true;
        abschluss('bumm');
        return;
      }

      aufdecken(i);
      sichern();
      zeichnen();
      siegPruefen();
    }

    /* Leere Felder ziehen ihre Nachbarn mit auf – iterativ, nicht rekursiv. */
    function aufdecken(start) {
      const stapel = [start];
      while (stapel.length) {
        const i = stapel.pop();
        if (stand.offen[i] || stand.fahne[i]) continue;
        stand.offen[i] = true;
        if (minenUm(i) === 0) {
          for (const j of nachbarn(i)) if (!stand.offen[j] && !stand.mine[j]) stapel.push(j);
        }
      }
    }

    /* Auf eine offene Zahl tippen: sind genug Fahnen gesetzt, geht der Rest auf. */
    function umgebungOeffnen(i) {
      const zahl = minenUm(i);
      if (!zahl) return;
      const um = nachbarn(i);
      const fahnen = um.filter((j) => stand.fahne[j]).length;
      if (fahnen !== zahl) {
        const zu = um.filter((j) => !stand.fahne[j] && !stand.offen[j]);
        if (!zu.length && fahnen < zahl) return;
        /* Sagen, warum nichts passiert, und zeigen, um welche Felder es geht.
           In der Unterzeile, weil eine Meldung unten die Moduswahl verdecken würde. */
        lage = fahnen < zahl
          ? 'Noch ' + (zahl - fahnen) + (zahl - fahnen === 1 ? ' Fahne' : ' Fahnen')
          : fahnen + ' statt ' + zahl + ' Fahnen';
        lageBis = Date.now() + 2500;
        kopfZeichnen();
        for (const j of zu) {
          felder[j].classList.remove('m-feld--zeigt');
          void felder[j].offsetWidth;
          felder[j].classList.add('m-feld--zeigt');
        }
        return;
      }

      s.fuehlen();
      for (const j of um) {
        if (stand.fahne[j] || stand.offen[j]) continue;
        if (stand.mine[j]) { stand.offen[j] = true; abschluss('bumm'); return; }
        aufdecken(j);
      }
      sichern();
      zeichnen();
      siegPruefen();
    }

    function fahneWechseln(i) {
      if (stand.fertig || stand.offen[i]) return;
      stand.fahne[i] = !stand.fahne[i];
      s.fuehlen();
      sichern();
      zeichnen();
    }

    function siegPruefen() {
      if (stand.fertig) return;
      for (let i = 0; i < anzahl(); i += 1) {
        if (!stand.mine[i] && !stand.offen[i]) return;
      }
      for (let i = 0; i < anzahl(); i += 1) if (stand.mine[i]) stand.fahne[i] = true;
      abschluss('sieg');
    }

    function abschluss(ausgang) {
      stand.verbraucht = zeitJetzt();
      stand.fertig = ausgang;
      // Vor dem Notieren schauen, sonst schlägt die Partie sich selbst.
      const frueher = s.partien().filter((p) => p.gewonnen && p.stufe === stand.stufe && p.dauer > 0);
      neueBestzeit = ausgang === 'sieg' && frueher.length > 0 && frueher.every((p) => p.dauer > stand.verbraucht);
      s.fuehlen(ausgang === 'sieg' ? 30 : 60);
      s.notieren({
        gewonnen: ausgang === 'sieg',
        dauer: stand.verbraucht,
        stufe: stand.stufe,
        aufgedeckt: stand.offen.filter(Boolean).length,
      });
      s.merken(stand);
      zeichnen();
      // Auf einem flachen Fenster läge das Ergebnis sonst unter dem Rand.
      endeKasten.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    /* ------------------------------------------------------------ Zeichnen */

    function feldName(i) {
      return 'Zeile ' + (Math.floor(i / stand.spalten) + 1) + ', Spalte ' + ((i % stand.spalten) + 1);
    }

    function zeichnen() {
      const verloren = stand.fertig === 'bumm';
      for (let i = 0; i < anzahl(); i += 1) {
        const f = felder[i];
        if (!f) continue;
        for (const merkmal of ['offen', 'zahl', 'mine', 'fahne', 'gezuendet', 'erledigt', 'zuviel', 'falsch']) delete f.dataset[merkmal];
        const vorher = f.dataset.bild || '';
        let bild = '';
        let text = '';
        let name = 'zugedeckt';

        if (stand.fahne[i] && !stand.offen[i]) {
          f.dataset.fahne = 'ja';
          name = 'Fahne';
          if (verloren && !stand.mine[i]) { f.dataset.falsch = 'ja'; text = '×'; name = 'falsche Fahne'; } else bild = 'fahne';
        } else if (stand.offen[i] || (verloren && stand.mine[i])) {
          f.dataset.offen = 'ja';
          name = 'offen';
          if (stand.mine[i]) {
            f.dataset.mine = 'ja';
            name = 'Mine';
            if (stand.offen[i]) f.dataset.gezuendet = 'ja';
            bild = 'mine';
          } else {
            const n = minenUm(i);
            if (n) {
              text = String(n);
              name = String(n);
              f.dataset.zahl = String(n);
              // Nur gezählt, nicht gewusst: Auch falsche Fahnen zählen mit.
              const um = nachbarn(i);
              const fahnen = um.filter((j) => stand.fahne[j]).length;
              if (fahnen > n) f.dataset.zuviel = 'ja';
              else if (fahnen === n && um.every((j) => stand.fahne[j] || stand.offen[j])) f.dataset.erledigt = 'ja';
            }
          }
        }
        // Nur schreiben, was sich ändert: Sonst springt der Zustand der Zeichnung
        // bei jedem Tipp auf 216 Feldern zurück.
        if (vorher !== bild + text) {
          f.dataset.bild = bild + text;
          if (bild) f.innerHTML = bild === 'fahne' ? FAHNE : MINE;
          else f.textContent = text;
        }
        f.setAttribute('aria-label', feldName(i) + ', ' + name);
      }

      kopfZeichnen();
      aufdeckKnopf.setAttribute('aria-pressed', fahnenModus ? 'false' : 'true');
      fahnenKnopf.setAttribute('aria-pressed', fahnenModus ? 'true' : 'false');
      rahmen.dataset.fahne = fahnenModus && !stand.fertig ? 'ja' : 'nein';
      rahmen.dataset.ende = stand.fertig || 'nein';
      leiste.hidden = !!stand.fertig;
      endeZeichnen();
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      const gesetzt = stand.fahne.filter(Boolean).length;
      kopf.append(s.stufenName(STUFEN, stand.stufe));
      const minenText = el('span', null, '');
      minenText.append(el('b', null, String(stand.minen - gesetzt)));
      minenText.append(document.createTextNode(' Minen'));
      kopf.append(minenText);
      const zeit = el('span', null, '');
      // In der ersten Sekunde sagt dauerText noch „–".
      zeit.append(el('b', null, !stand.gelegt || s.dauerText(zeitJetzt()) === '–' ? '0 s' : s.dauerText(zeitJetzt())));
      kopf.append(zeit);
      s.unter(!stand.fertig && Date.now() < lageBis ? lage : stand.spalten + ' × ' + stand.zeilen);
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = !stand.fertig;
      if (!stand.fertig) return;
      if (stand.fertig === 'sieg') endeKasten.append(s.bildzeichen('fertig'));
      endeKasten.append(el('p', 'ende-titel', stand.fertig === 'sieg' ? 'Feld geräumt.' : 'Bumm.'));
      if (neueBestzeit) endeKasten.append(el('span', 'ende-marke', 'Neue Bestzeit'));
      endeKasten.append(el('p', 'notiz', stand.fertig === 'sieg'
        ? STUFEN[stand.stufe].name + ' · ' + s.dauerText(stand.verbraucht)
        : 'Eine Mine erwischt. Die anderen liegen jetzt offen.'));
      endeKasten.append(s.stufenLeiste(STUFEN, stand.stufe, neu));
    }

    function neu(stufe) {
      stand = frisch(stufe);
      neueBestzeit = false;
      lageBis = 0;
      gitterBauen();
      cursorSetzen(0);
      sichern();
      zeichnen();
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neues Feld',
        inhalt: 'Klein ist 8 × 10 mit 10 Minen, mittel 10 × 14 mit 24, groß 12 × 18 mit 40.',
        aktionen: s.stufenAktionen(STUFEN, neu),
      });
    }

    function regelnZeigen() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Decke alle Felder auf, unter denen keine Mine liegt. Die Zahl sagt, wie viele der acht Nachbarn vermint sind.'));
      d.append(el('p', 'notiz', 'Der erste Klick geht nie daneben – die Minen werden erst danach verteilt.'));
      d.append(el('p', 'notiz', 'Eine Fahne setzt, wer unter dem Feld auf „Fahne" umschaltet, lange auf ein Feld drückt oder rechts klickt.'));
      d.append(el('p', 'notiz', 'Auf eine schon offene Zahl tippen deckt die restlichen Nachbarn auf, sobald genug Fahnen stehen. Fehlen welche, zeigt das Spiel die Felder, um die es geht. Eine Zahl, um die herum alles geklärt ist, wird blass.'));
      d.append(el('p', 'notiz', 'Am Rechner: Pfeile wandern übers Feld, Enter deckt auf, F setzt die Fahne.'));
      s.blatt({ titel: 'Minenfeld', inhalt: d, aktionen: [{ text: 'Los' }] });
    }

    function beiGroesse() { kachelRechnen(); }
    window.addEventListener('resize', beiGroesse);

    /* Nur ein Feld steht in der Tab-Reihenfolge, sonst bräuchte man bis zu 216
       Tabs, um an dem Brett vorbeizukommen. */
    function cursorSetzen(i) {
      if (felder[cursor]) felder[cursor].tabIndex = -1;
      cursor = i;
      if (felder[cursor]) felder[cursor].tabIndex = 0;
    }

    const PFEILE = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    function beiTaste(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || stand.fertig) return;
      if (!document.getElementById('sheet-spiel').hidden) return;
      const aufBrett = felder.includes(document.activeElement);
      const pfeil = PFEILE[e.key];
      if (pfeil) {
        e.preventDefault();
        if (aufBrett) {
          const z = Math.floor(cursor / stand.spalten) + pfeil[0];
          const sp = (cursor % stand.spalten) + pfeil[1];
          if (z >= 0 && sp >= 0 && z < stand.zeilen && sp < stand.spalten) cursorSetzen(z * stand.spalten + sp);
        }
        felder[cursor].focus();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (aufBrett) fahneWechseln(cursor);
        else { fahnenModus = !fahnenModus; zeichnen(); }
      }
    }
    window.addEventListener('keydown', beiTaste);

    gitterBauen();
    sichern();
    zeichnen();
    uhr = setInterval(() => { if (!stand.fertig && stand.gelegt) kopfZeichnen(); }, 1000);

    return {
      ende: () => {
        clearInterval(uhr);
        clearTimeout(druckUhr);
        window.removeEventListener('resize', beiGroesse);
        window.removeEventListener('keydown', beiTaste);
        if (!stand.fertig) sichern();
      },
    };
  }

  /* ----------------------------------------------------------- Statistik */

  function auswertung(partien, hilfe) {
    const bestzeit = (stufe) => {
      const zeiten = partien.filter((p) => p.gewonnen && p.stufe === stufe && p.dauer > 0).map((p) => p.dauer);
      return zeiten.length ? hilfe.dauerText(Math.min(...zeiten)) : '–';
    };
    return [
      { wert: bestzeit('klein'), label: 'Bestzeit klein' },
      { wert: bestzeit('mittel'), label: 'Bestzeit mittel' },
      { wert: bestzeit('gross'), label: 'Bestzeit groß' },
    ];
  }

  Rahmen.anmelden({
    id: 'minen',
    name: 'Minenfeld',
    gruppe: 'raetsel',
    unter: 'Aufdecken, ohne zu treten.',
    farbe: '#B45B3E',
    symbol: '<circle cx="12" cy="13" r="6"/><path d="M12 4v3M18.4 6.6l-2 2M5.6 6.6l2 2" stroke-linecap="round"/>',
    starten,
    auswertung,
  });
})();
