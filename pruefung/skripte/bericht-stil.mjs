/* Das Aussehen des Berichts – dieselben Farben und Schriften wie die App,
   hell als Vorgabe, dunkel nach Systemeinstellung. Die Schriften kommen aus
   schriften/ im Repository, nicht aus dem Netz. */

export const stil = `
      @font-face { font-family: 'Bricolage Grotesque'; font-weight: 400 800; font-display: swap;
        src: url('../../schriften/bricolage-400-800-latin.woff2') format('woff2'); }
      @font-face { font-family: 'DM Mono'; font-weight: 400; font-display: swap;
        src: url('../../schriften/dm-mono-400-latin.woff2') format('woff2'); }
      :root {
        color-scheme: light dark;
        --grund: #F4F1EC; --karte: #FFFFFF; --linie: #E3DDD2;
        --text: #1B1815; --leise: #6E665C; --still: #9C9388;
        --gelb: #9A7A12; --gruen: #3F7A45; --orange: #B45B3E; --blau: #4E5FA8;
        --violett: #7A4FA0; --grau: #8C8479; --rot: #B3261E;
        --kopfhoehe: 8rem;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --grund: #12100E; --karte: #1C1917; --linie: #2E2A26;
          --text: #F2EEE8; --leise: #A79E92; --still: #736B61;
          --gelb: #C4A63C; --gruen: #6DB173; --orange: #D9805F; --blau: #8A98DC;
          --violett: #B99BDA; --grau: #8C8479; --rot: #F2867E;
        }
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--grund); color: var(--text);
        font: 15px/1.55 'Bricolage Grotesque', system-ui, 'Segoe UI', sans-serif; }
      a { color: inherit; }
      code, pre, .id { font-family: 'DM Mono', ui-monospace, monospace; font-size: .86em; }
      .meta { color: var(--leise); font-size: .8rem; font-weight: 400; }

      .f-gruen { color: var(--gruen); } .f-orange { color: var(--orange); }
      .f-blau { color: var(--blau); } .f-grau { color: var(--grau); }
      .f-violett { color: var(--violett); } .f-gelb { color: var(--gelb); }
      .f-rot { color: var(--rot); }

      /* -- Kopf ------------------------------------------------------------ */
      .kopf { position: sticky; top: 0; z-index: 5; background: var(--grund);
        border-bottom: 1px solid var(--linie); padding: .9rem 1.5rem .8rem; }
      .kopf h1 { font-size: 1.2rem; margin: 0; letter-spacing: -.01em; font-weight: 700; }
      .kopf h1 span { font-weight: 800; }
      .kopf > .meta { margin: .1rem 0 0; }
      .werkzeug { display: flex; flex-wrap: wrap; gap: .45rem; align-items: center; margin-top: .65rem; }
      .werkzeug input { font: inherit; font-size: .85rem; flex: 1 1 14rem; min-width: 9rem;
        background: var(--karte); color: var(--text); border: 1px solid var(--linie);
        border-radius: 999px; padding: .32rem .9rem; }
      input:focus-visible, button:focus-visible, a:focus-visible { outline: 2px solid var(--blau); outline-offset: 2px; }
      button { font: inherit; font-size: .82rem; cursor: pointer; white-space: nowrap;
        background: var(--karte); color: var(--text); border: 1px solid var(--linie);
        border-radius: 999px; padding: .3rem .8rem; display: inline-flex; gap: .4rem; align-items: center; }
      button[class^="f-"] { color: var(--text); }
      button .punkt { width: .5rem; height: .5rem; border-radius: 50%; display: inline-block; }
      button.f-gruen .punkt { background: var(--gruen); } button.f-orange .punkt { background: var(--orange); }
      button.f-blau .punkt { background: var(--blau); } button.f-grau .punkt { background: var(--grau); }
      button.f-violett .punkt { background: var(--violett); }
      button:hover { border-color: var(--leise); }
      button[aria-pressed="true"] { border-color: var(--text); font-weight: 600; }
      button b { font-variant-numeric: tabular-nums; font-weight: 600; }

      /* -- Rumpf ----------------------------------------------------------- */
      .rumpf { display: grid; grid-template-columns: 15rem minmax(0, 1fr); gap: 2rem;
        max-width: 1400px; margin: 0 auto; padding: 1.5rem 1.5rem 6rem; }
      nav { position: sticky; top: calc(var(--kopfhoehe) + 1rem); align-self: start;
        max-height: calc(100vh - var(--kopfhoehe) - 2rem); overflow-y: auto; font-size: .87rem; }
      nav h2 { font-size: .72rem; text-transform: uppercase; letter-spacing: .1em; color: var(--leise);
        margin: 1.2rem 0 .4rem; padding: 0 .5rem; display: flex; justify-content: space-between; }
      nav h2 .meta { font-size: .72rem; text-transform: none; letter-spacing: 0; }
      nav h2:first-child { margin-top: 0; }
      nav a { display: flex; justify-content: space-between; gap: .5rem; text-decoration: none;
        padding: .28rem .5rem; border-radius: 6px; }
      nav a:hover, nav a.hier { background: var(--karte); }
      nav a.hier { font-weight: 600; }
      nav a.voll .meta { color: var(--gruen); }
      nav .balken { display: flex; height: 3px; border-radius: 2px; overflow: hidden;
        margin: .1rem .5rem .4rem; background: var(--linie); }
      nav .balken i { display: block; background: currentColor; }

      /* -- Abschnitte ------------------------------------------------------ */
      .abschnitt > h2, .bereich > h2 { font-size: .78rem; text-transform: uppercase; letter-spacing: .1em;
        color: var(--leise); margin: 2rem 0 .8rem; }
      main > .abschnitt:first-child > h2 { margin-top: 0; }
      .spec { background: var(--karte); border: 1px solid var(--linie); border-radius: 14px;
        padding: 1.1rem 1.25rem; margin-bottom: 1.1rem; scroll-margin-top: calc(var(--kopfhoehe) + 1rem); }
      .abschnitt { scroll-margin-top: calc(var(--kopfhoehe) + 1rem); }
      .spec.voll { border-color: color-mix(in srgb, var(--gruen) 45%, var(--linie)); }
      .spec h3 { font-size: 1.1rem; margin: 0; font-weight: 700; }
      .spec h3 a { text-decoration: none; border-bottom: 1px solid var(--linie); }
      .spec h3 a:hover { border-color: currentColor; }
      .spec h4 { font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; color: var(--leise); margin: 1.4rem 0 .3rem; }
      .spec > .meta { display: block; margin: .2rem 0 .9rem; }
      .spec > .meta a { text-decoration: none; }
      .haken { font-weight: 700; margin-right: .35rem; }
      .nurlesbar { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

      .kennzahlen { display: flex; flex-wrap: wrap; gap: .6rem; margin: 0 0 1rem; }
      .kennzahl { flex: 1 1 10rem; border: 1px solid var(--linie); border-radius: 10px;
        padding: .55rem .75rem; display: flex; flex-direction: column; gap: .05rem; }
      .kennzahl strong { font-size: 1.45rem; font-variant-numeric: tabular-nums; letter-spacing: -.02em; font-weight: 800; }
      .kennzahl.gruen strong { color: var(--gruen); } .kennzahl.rot strong { color: var(--rot); }

      /* -- Kriterien ------------------------------------------------------- */
      table { width: 100%; border-collapse: collapse; }
      table.kriterien tr + tr td { border-top: 1px solid var(--linie); }
      table.kriterien td { vertical-align: top; padding: .65rem 0; }
      td.ac { width: 8rem; padding-right: 1rem; }
      .id { display: block; font-weight: 500; font-variant-numeric: tabular-nums; }
      .marke { display: inline-block; margin-top: .25rem; font-size: .7rem; letter-spacing: .05em;
        text-transform: uppercase; font-weight: 600; }
      .titel { font-weight: 700; margin: 0; }
      .gruppe { font-size: .7rem; text-transform: uppercase; letter-spacing: .07em; color: var(--leise); margin: 0 0 .1rem; }
      .text { margin: .15rem 0 0; max-width: 80ch; }
      .grund { color: var(--leise); font-size: .86rem; max-width: 80ch; margin: .4rem 0 0; }
      .grund b { color: var(--text); }
      .warnung { border-left: 3px solid var(--orange); padding-left: .7rem; }
      .leer { color: var(--leise); padding: 2rem 0; }

      /* -- Zahlen und Lauf ------------------------------------------------- */
      table.zahlen { margin-top: 1rem; font-size: .83rem; font-variant-numeric: tabular-nums; }
      table.zahlen th, table.zahlen td { padding: .3rem .5rem; text-align: left; vertical-align: top; }
      table.zahlen thead th { font-size: .7rem; text-transform: uppercase; letter-spacing: .06em;
        color: var(--leise); font-weight: 600; border-bottom: 1px solid var(--linie); white-space: nowrap; }
      table.zahlen tbody th { font-weight: 600; }
      table.zahlen tbody tr + tr > * { border-top: 1px solid color-mix(in srgb, var(--linie) 60%, transparent); }
      table.zahlen .n { text-align: right; white-space: nowrap; }
      table.zahlen .leise { color: var(--leise); }
      table.zahlen.breit tbody th { font-weight: 500; }
      table.zahlen.breit tbody th .meta { font-weight: 400; }
      table.zahlen .symbol { width: 4.5rem; text-align: center; font-weight: 700; }
      table.lauf tr.datei th { padding-top: 1rem; font-weight: 600; border-top: none; }
      .beanstandung { display: block; color: var(--rot); font-weight: 400; margin-top: .2rem; }
      pre.fehler { white-space: pre-wrap; color: var(--rot); background: color-mix(in srgb, var(--rot) 7%, transparent);
        border-radius: 6px; padding: .4rem .6rem; margin: .35rem 0 0; font-weight: 400; font-size: .76rem; }

      .diagramme { display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 1.2rem; }
      .diagramm { margin: 0; }
      .diagramm figcaption { font-size: .8rem; color: var(--leise); margin-bottom: .3rem; }
      /* Rollt waagerecht und beginnt rechts, beim heutigen Tag – ohne Skript. */
      .diagramm .rollen { overflow-x: auto; direction: rtl; padding-bottom: .2rem; }
      .diagramm svg { display: block; direction: ltr; max-width: none; margin-left: auto; font-size: 10px; }
      .diagramm svg rect { fill: currentColor; }
      .diagramm .gitter line { stroke: var(--linie); }
      .diagramm .gitter text, .diagramm .achse { fill: var(--leise); font-variant-numeric: tabular-nums; }
      .diagramm .grund { stroke: var(--leise); }
      .legende { display: flex; flex-wrap: wrap; gap: .1rem .8rem; margin: .4rem 0 0; font-size: .78rem; }
      .legende span { display: inline-flex; align-items: center; gap: .3rem; }
      .legende i { width: .55rem; height: .55rem; border-radius: 2px; background: currentColor; }

      @media (max-width: 900px) {
        .rumpf { grid-template-columns: minmax(0, 1fr); }
        /* Auf dem Handy stünde das ganze Inhaltsverzeichnis vor dem Inhalt. */
        nav { display: none; }
        table.zahlen { display: block; overflow-x: auto; }
        td.ac { width: 6.5rem; }
      }
      @media print { .kopf { position: static; } nav { display: none; } .rumpf { grid-template-columns: 1fr; } }
`;
