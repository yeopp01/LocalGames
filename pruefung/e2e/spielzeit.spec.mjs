/* Die Spielzeit zählt nur, solange eine Partie offen ist.

   Jeder Test beginnt eine Partie, klappt sie zu, stellt die Uhr zehn Stunden
   vor und spielt sie dann zu Ende. In der Statistik darf die Nacht nicht
   stehen.
   Specs: 10-raetsel/mastermind.md, 10-raetsel/queens.md, 20-wortspiele/wordle.md,
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

/* Damen bleibt offen, nur das Fenster verschwindet: gesperrtes Handy, anderer
   Tab. Auch das ist keine Spielzeit (queens.md AC-24). */
test('Damen: verborgenes Fenster', async ({ page }) => {
  await oeffnen(page, '#/spiel/queens');
  await blattSchliessen(page);
  const verborgen = (ja) => page.evaluate((v) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => v });
    document.dispatchEvent(new Event('visibilitychange'));
  }, ja);
  await verborgen(true);
  const jetzt = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(jetzt + NACHT);
  await verborgen(false);

  const { damen, kanten } = (await gespeichert(page)).stand.queens;
  for (let z = 0; z < kanten; z += 1) {
    const feld = page.locator('.q-feld').nth(z * kanten + damen[z]);
    // Leer braucht zwei Tipps, ein schon abgedecktes Feld nur einen.
    for (let n = 0; n < 2 && (await feld.getAttribute('data-wert')) !== 'dame'; n += 1) await feld.click();
  }
  await expect(page.getByText('Alle Damen sitzen.')).toBeVisible();
  expect((await letztePartie(page)).dauer).toBeLessThan(60_000);
});
