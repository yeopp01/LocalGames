/* Die App startet ohne Netz vom Gerät.
   Spec: specs/00-rahmen/offline.md */

import { test, expect, SPIELE, VERSION, GRUNDBESTAND, kachel, blattSchliessen } from './helfer.mjs';

test.use({ serviceWorkers: 'allow' });

test('der Service Worker legt den ganzen Grundbestand in ein Lager seiner Version', async ({ page }) => {
  await page.goto('./');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15_000 });

  expect(await page.evaluate(() => caches.keys())).toEqual(['localgames-v' + VERSION.nummer]);
  const fehlt = await page.evaluate(async ({ lager, liste }) => {
    const l = await caches.open(lager);
    const ohne = [];
    for (const pfad of liste) if (!(await l.match(pfad))) ohne.push(pfad);
    return ohne;
  }, { lager: 'localgames-v' + VERSION.nummer, liste: GRUNDBESTAND });
  expect(fehlt, 'nicht im Lager').toEqual([]);
});

test('ohne Netz startet die Auswahl und jedes Spiel', async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.goto('./');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15_000 });

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.kachel')).toHaveCount(SPIELE.length);

  for (const spiel of SPIELE) {
    await kachel(page, spiel.name).click();
    await expect(page.locator('#kopf-titel')).toHaveText(spiel.name);
    await expect(page.locator('.spielboden')).not.toBeEmpty();
    await blattSchliessen(page);
    await page.locator('#btn-zurueck').click();
    await expect(page.locator('.kachel')).toHaveCount(SPIELE.length);
  }
});
