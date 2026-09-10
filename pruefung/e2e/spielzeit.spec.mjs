/* Die Spielzeit zählt nur, solange eine Partie offen ist.

   Jeder Test beginnt eine Partie, klappt sie zu, stellt die Uhr zehn Stunden
   vor und spielt sie dann zu Ende. In der Statistik darf die Nacht nicht
   stehen.
   Specs: 10-raetsel/mastermind.md, 20-wortspiele/wordle.md,
   20-wortspiele/galgen.md, 30-brett-und-karten/viergewinnt.md */

import { test, expect, oeffnen, kachel, gespeichert, blattSchliessen } from './helfer.mjs';

const NACHT = 10 * 60 * 60 * 1000;

async function ueberNacht(page, name) {
  await page.locator('#btn-zurueck').click();
  const jetzt = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(jetzt + NACHT);
  await kachel(page, name).click();
  await blattSchliessen(page);
}

const letztePartie = async (page) => (await gespeichert(page)).partien.at(-1);

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-10T20:00:00+02:00') });
});

test('Zahlencode', async ({ page }) => {
  await oeffnen(page, '#/spiel/mastermind');
  await blattSchliessen(page);
  await ueberNacht(page, 'Zahlencode');
  const code = (await gespeichert(page)).stand.mastermind.code;
  for (const ziffer of code) await page.locator('.k-taste', { hasText: new RegExp('^' + ziffer + '$') }).click();
  await page.getByRole('button', { name: 'Versuch abgeben' }).click();
  await expect(page.getByText('Code geknackt.')).toBeVisible();
  expect((await letztePartie(page)).dauer).toBeLessThan(60_000);
});

test('Wördle', async ({ page }) => {
  await oeffnen(page, '#/spiel/wordle');
  await blattSchliessen(page);
  await ueberNacht(page, 'Wördle');
  const wort = (await gespeichert(page)).stand.wordle.wort;
  const tafel = page.locator('.w-tafel');
  for (const c of wort) await tafel.getByRole('button', { name: c, exact: true }).click();
  await tafel.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.locator('.ende-kasten')).toBeVisible();
  expect((await letztePartie(page)).dauer).toBeLessThan(60_000);
});

test('Galgenmännchen', async ({ page }) => {
  await oeffnen(page, '#/spiel/galgen');
  await blattSchliessen(page);
  await ueberNacht(page, 'Galgenmännchen');
  const wort = (await gespeichert(page)).stand.galgen.wort;
  const tafel = page.locator('.g-tafel');
  for (const c of new Set(wort)) await tafel.getByRole('button', { name: c, exact: true }).click();
  await expect(page.getByText('Gerettet.')).toBeVisible();
  expect((await letztePartie(page)).dauer).toBeLessThan(60_000);
});
