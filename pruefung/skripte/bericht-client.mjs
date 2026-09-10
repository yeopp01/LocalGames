/* Filtern und Suchen im Bericht – über die schon erzeugten Zeilen, ohne
   Nachladen. Ohne JavaScript ist einfach alles sichtbar. */

export const skript = `
      const zeilen = [...document.querySelectorAll('tr.zeile')];
      const suche = document.getElementById('suche');
      const knoepfe = [...document.querySelectorAll('.werkzeug button[data-wert]')];
      const stand = document.getElementById('stand');
      const wahl = new Set();

      function anwenden() {
        const wort = suche.value.trim().toLowerCase();
        let sichtbar = 0;
        for (const zeile of zeilen) {
          const passt = (!wahl.size || wahl.has(zeile.dataset.status)) && (!wort || zeile.dataset.suche.includes(wort));
          zeile.hidden = !passt;
          if (passt) sichtbar += 1;
        }
        for (const spec of document.querySelectorAll('.bereich section.spec')) {
          spec.hidden = ![...spec.querySelectorAll('tr.zeile')].some((z) => !z.hidden);
        }
        for (const bereich of document.querySelectorAll('section.bereich')) {
          bereich.hidden = ![...bereich.querySelectorAll('section.spec')].some((s) => !s.hidden);
        }
        for (const verweis of document.querySelectorAll('nav a[data-ziel]')) {
          const ziel = document.getElementById(verweis.dataset.ziel);
          verweis.hidden = !ziel || ziel.hidden;
          const balken = verweis.nextElementSibling;
          if (balken && balken.classList.contains('balken')) balken.hidden = verweis.hidden;
        }
        const gefiltert = wahl.size || wort;
        for (const abschnitt of document.querySelectorAll('section.abschnitt')) abschnitt.hidden = Boolean(gefiltert);
        document.getElementById('nichts').hidden = sichtbar > 0;
        stand.textContent = sichtbar === zeilen.length
          ? zeilen.length + ' Akzeptanzkriterien'
          : sichtbar + ' von ' + zeilen.length + ' Akzeptanzkriterien';
      }

      for (const knopf of knoepfe) {
        knopf.addEventListener('click', () => {
          const wert = knopf.dataset.wert;
          if (wert === 'alle') wahl.clear();
          else if (wahl.has(wert)) wahl.delete(wert);
          else wahl.add(wert);
          for (const k of knoepfe) {
            k.setAttribute('aria-pressed', String(k.dataset.wert === 'alle' ? wahl.size === 0 : wahl.has(k.dataset.wert)));
          }
          anwenden();
        });
      }
      suche.addEventListener('input', anwenden);
      suche.addEventListener('keydown', (e) => { if (e.key === 'Escape') { suche.value = ''; anwenden(); } });
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== suche) { e.preventDefault(); suche.focus(); }
      });

      const kopf = document.querySelector('header.kopf');
      const kopfhoehe = () => document.documentElement.style.setProperty('--kopfhoehe', kopf.offsetHeight + 'px');
      new ResizeObserver(kopfhoehe).observe(kopf);
      kopfhoehe();

      const beobachter = new IntersectionObserver((eintraege) => {
        for (const eintrag of eintraege) {
          if (!eintrag.isIntersecting) continue;
          for (const a of document.querySelectorAll('nav a')) a.classList.toggle('hier', a.dataset.ziel === eintrag.target.id);
        }
      }, { rootMargin: '-20% 0px -70% 0px' });
      for (const ziel of document.querySelectorAll('section.spec[id], section.abschnitt[id]')) beobachter.observe(ziel);

      anwenden();
`;
