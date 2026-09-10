/* Nach draußen geht einzig der anonyme Zähler.
   Spec: specs/00-rahmen/datenschutz.md */

import { test, expect, oeffnen, kachel, blattSchliessen } from './helfer.mjs';

test('außer GoatCounter fragt die App keinen fremden Server an', async ({ page, draussen }) => {
  await oeffnen(page);
  await page.locator('#btn-einstellungen').click();
  await page.locator('#sheet-einstellungen').getByRole('button', { name: 'Fertig' }).click();
  await page.locator('#btn-statistik').click();
  await page.locator('#btn-zurueck').click();
  for (const name of ['Wördle', 'Schafkopf', 'Verräter']) {
    await kachel(page, name).click();
    await expect(page.locator('#kopf-titel')).toHaveText(name);
    await blattSchliessen(page);
    await page.locator('#btn-zurueck').click();
  }

  const hosts = [...new Set(draussen.map((u) => new URL(u).host))];
  // Der Zähler muss auftauchen – sonst beweist die leere Liste nur, dass die
  // Sperre nichts gesehen hat.
  expect(hosts).toEqual(['gc.zgo.at']);
});
