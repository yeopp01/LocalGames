/* Löser für Wördle – rein rechnerisch, ohne Netz und ohne Sprachmodell.

   Zwei Bausteine:

   1. muster(rate, ziel)  liefert die Rückmeldung, die das Spiel geben würde:
      2 = richtiger Buchstabe an richtiger Stelle, 1 = Buchstabe kommt vor,
      0 = kommt nicht (mehr) vor. Doppelte Buchstaben werden korrekt gezählt.

   2. vorschlaege(...) bewertet jedes erlaubte Wort danach, wie stark es die
      Menge der noch möglichen Lösungen zerlegt. Für ein Rateweort g gilt:
      es teilt die Kandidaten in Gruppen mit gleicher Rückmeldung. Übrig
      bleiben im Schnitt  Σ (Gruppengröße²) / Gesamtzahl  Kandidaten.
      Je kleiner dieser Wert, desto mehr lernt man aus dem Zug.

   Das ist derselbe Gedanke wie beim Informationsgehalt (Entropie), nur in der
   Form, die sich direkt als "so viele Wörter bleiben übrig" vorlesen lässt.
*/

const Loeser = (() => {
  /* Rückmeldung als Zahl zur Basis 3 – schnell zu vergleichen und zu bündeln. */
  function musterCode(rate, ziel) {
    const r = [...rate];
    const z = [...ziel];
    const stufe = [0, 0, 0, 0, 0];
    const rest = new Map();

    for (let i = 0; i < 5; i += 1) {
      if (r[i] === z[i]) stufe[i] = 2;
      else rest.set(z[i], (rest.get(z[i]) || 0) + 1);
    }
    for (let i = 0; i < 5; i += 1) {
      if (stufe[i] === 2) continue;
      const uebrig = rest.get(r[i]) || 0;
      if (uebrig > 0) {
        stufe[i] = 1;
        rest.set(r[i], uebrig - 1);
      }
    }
    let code = 0;
    for (let i = 0; i < 5; i += 1) code = code * 3 + stufe[i];
    return code;
  }

  function musterStufen(rate, ziel) {
    let code = musterCode(rate, ziel);
    const stufen = [0, 0, 0, 0, 0];
    for (let i = 4; i >= 0; i -= 1) {
      stufen[i] = code % 3;
      code = Math.floor(code / 3);
    }
    return stufen;
  }

  const stufenCode = (stufen) => stufen.reduce((c, s) => c * 3 + s, 0);

  /* Alle Wörter, die zu jeder bisherigen Rückmeldung passen. */
  function kandidaten(pool, versuche) {
    return pool.filter((wort) =>
      versuche.every((v) => musterCode(v.wort, wort) === stufenCode(v.stufen))
    );
  }

  /* Der genaue Vergleich kostet |Ratepool| × |Kandidaten| Schritte. Bei ein paar
     tausend erlaubten Wörtern wäre das eine spürbare Denkpause, darum kommt erst
     eine billige Vorauswahl: Wörter, deren Buchstaben in den übrigen Kandidaten
     häufig vorkommen, sind die aussichtsreichen. Nur die werden genau gerechnet –
     zusammen mit allen Kandidaten, die ja selbst die Lösung sein können. */
  const SPAEHER = 900;

  function vorauswahl(pool, moegliche) {
    if (pool.length <= SPAEHER) return pool;

    const haeufig = new Map();
    for (const k of moegliche) {
      for (const c of new Set([...k])) haeufig.set(c, (haeufig.get(c) || 0) + 1);
    }
    const note = (w) => {
      let summe = 0;
      for (const c of new Set([...w])) summe += haeufig.get(c) || 0;
      return summe;
    };

    const beste = pool
      .map((w) => ({ w, n: note(w) }))
      .sort((a, b) => b.n - a.n)
      .slice(0, SPAEHER)
      .map((x) => x.w);

    return [...new Set([...moegliche, ...beste])];
  }

  /* Die besten nächsten Züge. Gibt [{wort, rest, kandidat}] zurück. */
  function vorschlaege(moegliche, pool, anzahl = 3) {
    const n = moegliche.length;
    if (n === 0) return [];
    if (n <= 2) {
      return moegliche.slice(0, anzahl).map((w) => ({ wort: w, rest: 1, kandidat: true }));
    }

    pool = vorauswahl(pool, moegliche);
    const istKandidat = new Set(moegliche);
    const bewertet = [];
    const eimer = new Map();

    for (const g of pool) {
      eimer.clear();
      for (const k of moegliche) {
        const c = musterCode(g, k);
        eimer.set(c, (eimer.get(c) || 0) + 1);
      }
      let summe = 0;
      for (const groesse of eimer.values()) summe += groesse * groesse;
      const rest = summe / n;
      // Ein Wort, das selbst noch Lösung sein kann, ist bei gleichem Nutzen
      // vorzuziehen – es kann den Treffer sofort bringen.
      const kandidat = istKandidat.has(g);
      bewertet.push({ wort: g, rest, kandidat, note: rest - (kandidat ? 0.4 : 0) });
    }

    bewertet.sort((a, b) => a.note - b.note || (b.kandidat ? 1 : 0) - (a.kandidat ? 1 : 0));
    return bewertet.slice(0, anzahl).map(({ wort, rest, kandidat }) => ({ wort, rest, kandidat }));
  }

  return { musterCode, musterStufen, kandidaten, vorschlaege };
})();
