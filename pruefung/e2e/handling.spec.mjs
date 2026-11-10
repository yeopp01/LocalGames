/* Handling, das leicht wieder verloren geht: Fehler lassen sich billig
   zurücknehmen, Eingaben überleben, eine Hilfe bleibt eingeschaltet.
   Specs: 10-raetsel/zip.md AC-22/23, 10-raetsel/queens.md AC-22/25,
   10-raetsel/nonogramm.md,
   40-zu-mehreren/runde.md, 50-geschick/bubbles.md AC-14 bis 16,
   60-kinder/tiere.md AC-22 */

import { test, expect, oeffnen, gespeichert, blattSchliessen } from './helfer.mjs';

test('Weg: ein Feld auf dem Weg anfassen kürzt ihn, Rückgängig und Von vorn holen ihn zurück', async ({ page }) => {
  await oeffnen(page, '#/spiel/zip');
  await blattSchliessen(page);
  const weg = (await gespeichert(page)).stand.zip.loesung;
  const feld = (i) => page.locator('.p-feld').nth(weg[i]);
  const laenge = async () => (await gespeichert(page)).stand.zip.pfad.length;

  const rueck = page.getByRole('button', { name: 'Rückgängig', exact: true });
  await expect(rueck).toBeDisabled();
  for (let i = 0; i <= 8; i += 1) await feld(i).click();
  expect(await laenge()).toBe(9);

  // Weit hinten anfassen, nicht nur auf dem vorletzten Feld.
  await feld(3).click();
  expect(await laenge()).toBe(4);
  await rueck.click();
  expect(await laenge()).toBe(9);

  await page.getByRole('button', { name: 'Von vorn', exact: true }).click();
  expect(await laenge()).toBe(0);
  await rueck.click();
  expect(await laenge()).toBe(9);
});

test('Damen: die Leiste bleibt beim ersten Tipp stehen, ein Strich zeichnet sofort und speichert einmal', async ({ page }) => {
  await oeffnen(page, '#/spiel/queens');
  await blattSchliessen(page);
  const leisteOben = () => page.evaluate(() => Math.round(document.querySelector('.leiste').getBoundingClientRect().top));
  const kreuze = () => page.locator('.q-feld[data-wert="kreuz"]').count();
  const stand = async () => (await gespeichert(page)).stand.queens;

  // Der Starttext braucht auf dem Handy zwei Zeilen; verschwindet er, darf nichts rutschen.
  const vorher = await leisteOben();
  await page.locator('.q-feld').first().click();
  expect(await leisteOben()).toBe(vorher);
  await page.getByRole('button', { name: 'Rückgängig', exact: true }).click();

  await page.evaluate(() => {
    window.__geschrieben = 0;
    const alt = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(...a) { window.__geschrieben += 1; return alt.apply(this, a); };
  });
  const r = await page.locator('.q-gitter').boundingBox();
  const k = (await stand()).kanten;
  const mitte = (spalte) => r.x + (r.width * (spalte + 0.5)) / k;
  const y = r.y + r.height / (2 * k);
  await page.mouse.move(mitte(0), y);
  await page.mouse.down();
  await page.mouse.move(mitte(2), y, { steps: 4 });
  // Noch gedrückt: Die Kreuze stehen schon da, geschrieben ist noch nichts.
  expect(await kreuze()).toBe(3);
  expect(await page.evaluate(() => window.__geschrieben)).toBe(0);
  await page.mouse.move(mitte(k - 1), y, { steps: 6 });
  await page.mouse.up();

  await expect.poll(async () => (await stand()).feld.filter((w) => w === 1).length).toBe(k);
  expect(await page.evaluate(() => window.__geschrieben)).toBe(1);
  await page.getByRole('button', { name: 'Rückgängig', exact: true }).click();
  expect(await kreuze()).toBe(0);
});

test('Nonogramm: die rechte Maustaste nimmt ein Kreuz auch wieder weg', async ({ page }) => {
  await oeffnen(page, '#/spiel/nonogramm');
  await blattSchliessen(page);
  const f = page.locator('.n-feld').first();
  await f.click({ button: 'right' });
  await expect(f).toHaveAttribute('data-stand', 'leer');
  await f.click({ button: 'right' });
  await expect(f).toHaveAttribute('data-stand', 'offen');
});

test('Namen in der Runde überleben die Wahl der Fragen und das Neuladen', async ({ page }) => {
  await oeffnen(page, '#/spiel/amehesten');
  await blattSchliessen(page);
  await page.locator('.r-name-feld').first().fill('Mia');
  await page.getByRole('button', { name: 'harmlos', exact: true }).click();
  await expect(page.locator('.r-name-feld').first()).toHaveValue('Mia');
  await page.reload();
  await expect(page.locator('.r-name-feld').first()).toHaveValue('Mia');
});

test('Blasen: die Zielhilfe ist ab Werk aus, bleibt eingeschaltet und zählt getrennt', async ({ page }) => {
  await oeffnen(page, '#/spiel/bubbles');
  await blattSchliessen(page);
  const schiessen = page.getByRole('button', { name: 'Schießen', exact: true });
  await expect(schiessen).toBeHidden();

  const blatt = page.locator('#sheet-spiel');
  const oeffneHilfe = async () => {
    const werkzeug = page.getByRole('button', { name: 'Zielhilfe' });
    if (await werkzeug.isVisible()) await werkzeug.click();
    else {
      await page.locator('.kopf-mehr-knopf').click();
      await page.locator('.kopf-mehr-eintrag', { hasText: 'Zielhilfe' }).click();
    }
    await expect(blatt).toBeVisible();
  };
  await oeffneHilfe();
  const antippen = page.getByRole('switch', { name: /Antippen statt ziehen/ });
  await expect(antippen).toHaveAttribute('aria-checked', 'false');
  await antippen.click();
  await blatt.getByRole('button', { name: 'Fertig', exact: true }).click();
  await expect(schiessen).toBeVisible();
  await expect(schiessen).toBeDisabled();

  await page.reload();
  await expect(schiessen).toBeVisible();

  // Ein Tipp aufs Feld startet und wählt, erst dann ist der Knopf frei.
  const r = await page.locator('.ez-leinwand').boundingBox();
  await page.mouse.click(r.x + r.width * 0.5, r.y + r.height * 0.5);
  await expect(schiessen).toBeEnabled();
  await schiessen.click();
  await expect(schiessen).toBeDisabled();
});

test('Horch mal: das Tier bewegt sich wirklich, wenn es dran ist', async ({ page }) => {
  await oeffnen(page, '#/spiel/horch');
  await page.locator('.kz-los').click();
  await expect(page.locator('.kz-zimmer')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.locator('.ho-feld .kz-tier').first().dispatchEvent('pointerdown', { pointerId: 9, bubbles: true });
  /* Die Klasse des ersten Auftritts blieb früher am Bild hängen und schlug jede
     spätere Bewegung; die Spec sagte trotzdem „fertig". */
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('.ho-feld .kz-bild')]
    .some((b) => b.getAnimations().length > 0))).toBe(true);
});
