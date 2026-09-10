/* Gemeinsames für alle E2E-Tests.

   Zwei Wachen hängen an jeder Seite, ohne dass ein Test sie anfordern muss:
   Jeder Fehler im Browser – geworfene Ausnahme oder console.error – lässt den
   Test scheitern, auch wenn seine eigenen Zusicherungen grün sind. Und jede
   Anfrage, die das eigene Haus verlässt, wird abgefangen und notiert: Die App
   verspricht, dass nur der Zähler nach draußen spricht, und ein Test soll nie
   von einem fremden Server abhängen.

   Was die App enthält, liest dieser Helfer aus den Dateien selbst – aus
   spiele/*.js, sw.js und version.js. Ein neues Spiel ist damit ohne
   Änderung am Test dabei. */

import { test as basis, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export { expect };

export const WURZEL = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const lies = (...teile) => readFileSync(join(WURZEL, ...teile), 'utf8');

/* ------------------------------------------------------- Was die App hat */

/** Jedes Spiel, das sich beim Rahmen anmeldet: { id, name, ohneSiege, datei }. */
export const SPIELE = readdirSync(join(WURZEL, 'spiele'))
  .filter((d) => d.endsWith('.js'))
  .flatMap((datei) => {
    const text = lies('spiele', datei);
    const stelle = text.indexOf('Rahmen.anmelden(');
    if (stelle < 0) return [];
    const block = text.slice(stelle, stelle + 1500);
    const id = /id:\s*'([^']+)'/.exec(block)?.[1];
    const name = /name:\s*'([^']+)'/.exec(block)?.[1];
    return id ? [{ id, name, ohneSiege: /ohneSiege:\s*true/.test(block), datei }] : [];
  });

export const VERSION = (() => {
  const text = lies('version.js');
  return {
    nummer: Number(/nummer:\s*(\d+)/.exec(text)[1]),
    stand: /stand:\s*'([^']+)'/.exec(text)[1],
  };
})();

export const GRUNDBESTAND = [...lies('sw.js').matchAll(/^\s*'(\.\/[^']*)',?\s*$/gm)].map((m) => m[1]);

/* -------------------------------------------------------------- Wachen */

/** Meldungen, die kein Fehler der App sind, sondern Folge der Netzsperre. */
const GEWOLLT = /net::ERR_FAILED|net::ERR_INTERNET_DISCONNECTED|Failed to load resource/;

export const test = basis.extend({
  /** Adressen außerhalb des Prüfservers, die die Seite angefragt hat. */
  draussen: async ({ context, baseURL }, use) => {
    const eigen = new URL(baseURL).origin;
    const liste = [];
    await context.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith(eigen)) return route.continue();
      liste.push(url);
      return route.abort();
    });
    await use(liste);
  },

  page: async ({ page, draussen }, use, info) => {
    void draussen;
    const fehler = [];
    page.on('pageerror', (e) => fehler.push('Ausnahme: ' + (e.stack || e.message)));
    page.on('console', (m) => {
      if (m.type() === 'error' && !GEWOLLT.test(m.text())) fehler.push('console.error: ' + m.text());
    });
    await use(page);
    if (!info.annotations.some((a) => a.type === 'fehler-erwartet')) {
      expect(fehler, 'Fehler im Browser').toEqual([]);
    }
  },
});

/* -------------------------------------------------------------- Helfer */

/**
 * Öffnet die App, wahlweise mit einem vorbereiteten Bestand in localStorage.
 *
 * Der Bestand wird auf version.js geschrieben – derselbe Ursprung, aber ohne
 * dass der Rahmen schon läuft und ihn beim Start mit dem leeren überschreibt.
 */
export async function oeffnen(page, weg = '#/', bestand = null) {
  if (bestand) {
    await page.goto('./version.js');
    await page.evaluate((d) => localStorage.setItem('localgames.v1', JSON.stringify(d)), {
      version: 1,
      partien: bestand.partien || [],
      stand: bestand.stand || {},
    });
  }
  await page.goto('./' + weg);
  await expect(page.locator('#buehne > *').first()).toBeVisible();
}

/** Der Bestand, wie er gerade in localStorage liegt. */
export const gespeichert = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('localgames.v1') || 'null'));

/** Zeitpunkt vor `tage` Tagen als ISO-Text – so, wie notieren() ihn schreibt. */
export const vorTagen = (tage) => new Date(Date.now() - tage * 86_400_000).toISOString();

/** Eine Partie für den Bestand. */
let laufendeNummer = 0;
export const partie = (spiel, felder = {}) => ({
  id: 'test-' + (laufendeNummer += 1),
  spiel,
  ende: vorTagen(0),
  ...felder,
});

/** Die Kachel eines Spiels auf der Auswahl – über den genauen Namen, weil
    „Weg" sonst auch in „Wer am ehesten" steckt. */
export const kachel = (page, name) =>
  page.locator('.kachel').filter({ has: page.locator('.kachel-name', { hasText: new RegExp('^' + name + '$') }) });

/** Schließt ein Blatt, das ein Spiel beim Start von sich aus zeigt. */
export async function blattSchliessen(page) {
  const blatt = page.locator('#sheet-spiel');
  if (await blatt.isVisible()) {
    await blatt.locator('#sheet-spiel-aktionen button').first().click();
    await expect(blatt).toBeHidden();
  }
}

/** Die Kennzahl mit dieser Beschriftung im ersten passenden Block. */
export const kennzahl = (bereich, label) =>
  bereich
    .locator('.kennzahl, .zahlblock')
    .filter({ has: bereich.page().locator('.kennzahl-label, .zahlblock-label', { hasText: new RegExp('^' + label + '$') }) })
    .first()
    .locator('.kennzahl-wert, .zahlblock-wert');
