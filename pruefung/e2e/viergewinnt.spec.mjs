/* Vier gewinnt: was der Rechner nie tun darf.
   Spec: 30-brett-und-karten/viergewinnt.md */

import { test, expect, oeffnen, kachel, gespeichert, blattSchliessen } from './helfer.mjs';

const spalte = (page, n) => page.getByRole('button', { name: 'Spalte ' + n, exact: true }).first();
const steine = (page, wer) => page.locator(`.v-feld[data-wer="${wer}"]`);

/* Rot hat unten drei in einer Reihe (Spalten 1–3), die vierte Spalte ist
   frei; Gelb liegt harmlos rechts außen. Der Rechner ist am Zug. */
const drohung = (stufe) => {
  const brett = new Array(42).fill(0);
  brett[35] = 1; brett[36] = 1; brett[37] = 1;
  brett[41] = 2; brett[40] = 2;
  return {
    modus: 'rechner', stufe, brett, amZug: 2, zuege: 5, fertig: null, siegfelder: null,
    verlauf: [{ i: 35, wer: 1 }, { i: 41, wer: 2 }, { i: 36, wer: 1 }, { i: 40, wer: 2 }, { i: 37, wer: 1 }],
  };
};

test('der Rechner blockt eine offene Drohung auch auf leicht, jedes Mal', async ({ page }) => {
  test.setTimeout(90_000);
  // Leicht greift in gut jedem dritten Zug daneben. Wer 25-mal in Folge blockt,
  // tut es nicht aus Glück (0,65^25 ≈ 2 · 10⁻⁵).
  for (let i = 0; i < 25; i += 1) {
    await oeffnen(page, '#/spiel/viergewinnt', { stand: { viergewinnt: drohung('leicht') } });
    await expect(steine(page, 'er')).toHaveCount(3);
    expect((await gespeichert(page)).stand.viergewinnt.brett[38], `Durchgang ${i + 1}`).toBe(2);
  }
});

test('beim Überlegen auf schwer bleibt die Seite bedienbar', async ({ page }) => {
  await oeffnen(page, '#/spiel/viergewinnt');
  await blattSchliessen(page);
  await page.getByRole('button', { name: 'Neue Partie' }).click();
  await page.locator('#sheet-spiel-aktionen').getByRole('button', { name: 'Schwer' }).click();

  // Wie ein langsames Handy: sechsfach gebremste CPU.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.evaluate(() => {
    window.__lang = [];
    new PerformanceObserver((liste) => {
      for (const e of liste.getEntries()) window.__lang.push(Math.round(e.duration));
    }).observe({ type: 'longtask' });
  });

  for (const n of [4, 3, 5]) {
    await spalte(page, n).click();
    await expect(page.locator('#kopf-unter')).toHaveText('Spalte antippen', { timeout: 30_000 });
  }
  const lang = await page.evaluate(() => window.__lang);
  expect(Math.max(0, ...lang), `lange Aufgaben: ${lang.join(', ')} ms`).toBeLessThan(200);
});

test('zu zweit: Gelb am Zug übersteht das Schließen, die Nacht zählt nicht', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-10T20:00:00+02:00') });
  await oeffnen(page, '#/spiel/viergewinnt');
  await blattSchliessen(page);
  await page.getByRole('button', { name: 'Neue Partie' }).click();
  await page.getByRole('button', { name: 'Zu zweit an einem Gerät' }).click();
  await spalte(page, 1).click();                       // Rot
  await expect(page.locator('.m-kopf')).toContainText('Gelb am Zug');

  await page.locator('#btn-zurueck').click();
  const jetzt = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(jetzt + 10 * 60 * 60 * 1000);
  await kachel(page, 'Vier gewinnt').click();

  // Kein Rechner legt für Gelb – auch nicht nach einer Weile.
  await page.waitForTimeout(1000);
  await expect(steine(page, 'ich')).toHaveCount(1);
  await expect(steine(page, 'er')).toHaveCount(0);
  await expect(page.locator('.m-kopf')).toContainText('Gelb am Zug');

  for (const n of [2, 1, 2, 1, 2, 1]) await spalte(page, n).click();
  await expect(page.getByText('Rot gewinnt.')).toBeVisible();
  const p = (await gespeichert(page)).partien.at(-1);
  expect(p.modus).toBe('zwei');
  expect(p.dauer).toBeLessThan(60_000);
});
