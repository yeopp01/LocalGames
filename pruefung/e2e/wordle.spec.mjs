/* Wördle: der Vorschlag zeigt die besten Züge in ihrer Reihenfolge.
   Spec: 20-wortspiele/wordle.md */

import { test, expect, oeffnen, blattSchliessen } from './helfer.mjs';

test('die vorgeschlagenen Züge stehen aufsteigend nach ihrem Rest', async ({ page }) => {
  await oeffnen(page, '#/spiel/wordle');
  await blattSchliessen(page);
  await page.locator('.leiste').getByRole('button', { name: 'Vorschlag' }).click();
  const zeilen = page.locator('#sheet-spiel-inhalt .vorschlag');
  await expect(zeilen).toHaveCount(3);

  const reste = (await zeilen.locator('.vorschlag-rest').allTextContents())
    .map((t) => Number(/ø ([\d,]+)/.exec(t)[1].replace(',', '.')));
  expect(reste).toEqual([...reste].sort((a, b) => a - b));
  // Vor dem ersten Versuch ist LASTE der beste Zug (ø 14,5).
  await expect(zeilen.first().locator('.vorschlag-wort')).toHaveText('LASTE');
});
