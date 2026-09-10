/* Spiele zu mehreren: was zwischen zwei Blicken aufs Handy nicht verloren
   gehen darf.
   Specs: 40-zu-mehreren/amehesten.md, 40-zu-mehreren/verraeter.md */

import { test, expect, oeffnen, kachel, gespeichert, blattSchliessen } from './helfer.mjs';

test('Wer am ehesten: der Abend übersteht Neuladen und zählt beim Verlassen genau einmal', async ({ page }) => {
  await oeffnen(page, '#/spiel/amehesten');
  await blattSchliessen(page);
  await page.getByRole('button', { name: 'Erste Frage' }).click();
  await expect(page.locator('#kopf-unter')).toHaveText('Frage 1');
  const frage = await page.locator('.a-frage-text').textContent();

  // Neuladen ruft kein ende() – der Abend muss trotzdem da sein.
  await page.reload();
  await expect(page.locator('#kopf-unter')).toHaveText('Frage 1');
  await expect(page.locator('.a-frage-text')).toHaveText(frage);
  expect((await gespeichert(page)).partien).toHaveLength(0);

  await page.locator('#btn-zurueck').click();
  const d = await gespeichert(page);
  expect(d.partien).toHaveLength(1);
  expect(d.partien[0].fragen).toBe(1);

  // Danach beginnt ein neuer Abend, der alte wird nicht noch einmal gezählt.
  await kachel(page, 'Wer am ehesten').click();
  await expect(page.getByRole('button', { name: 'Erste Frage' })).toBeVisible();
  expect((await gespeichert(page)).partien).toHaveLength(1);
});

test('Wer am ehesten: ein liegen gebliebener Abend zählt an seinem eigenen Tag', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-09T21:00:00+02:00') });
  await oeffnen(page, '#/spiel/amehesten');
  await blattSchliessen(page);
  await page.getByRole('button', { name: 'Erste Frage' }).click();
  await expect(page.locator('#kopf-unter')).toHaveText('Frage 1');

  const abends = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(abends + 12 * 60 * 60 * 1000);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Erste Frage' })).toBeVisible();

  const [p] = (await gespeichert(page)).partien;
  expect(p.fragen).toBe(1);
  expect(Date.parse(p.ende)).toBeLessThan(abends + 60_000);
});

test('Verräter: „Zwei Verräter" folgt dem Zähler, nicht der letzten Runde', async ({ page }) => {
  await oeffnen(page, '#/spiel/verraeter');
  await blattSchliessen(page);
  const zwei = page.locator('.v-wahl-knopf', { hasText: 'Zwei Verräter' });
  const mehr = page.getByRole('button', { name: 'Wir sind zu: mehr' });

  await expect(zwei).toBeDisabled();
  await mehr.click();
  await expect(zwei).toBeDisabled();
  await mehr.click();
  await expect(zwei).toBeEnabled();

  // Die Wahl baut den Schirm neu – der Zähler bleibt dabei auf fünf.
  await zwei.click();
  await expect(zwei).toHaveAttribute('data-an', 'ja');
  await expect(page.locator('.r-zahl')).toHaveText('5');

  await page.getByRole('button', { name: 'Wir sind zu: weniger' }).click();
  await expect(zwei).toBeDisabled();
});
