/* Nonogramm: Kreuze und Warnung.
   Spec: 10-raetsel/nonogramm.md */

import { test, expect, oeffnen, gespeichert, blattSchliessen } from './helfer.mjs';

const feld = (page, i) => page.locator('.n-feld').nth(i);

async function langDruecken(page, ziel) {
  const box = await ziel.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
}

test('langes Drücken setzt ein Kreuz und nimmt es auch wieder weg', async ({ page }) => {
  await oeffnen(page, '#/spiel/nonogramm');
  await blattSchliessen(page);
  const f = feld(page, 0);
  await expect(f).toHaveAttribute('data-stand', 'offen');
  await langDruecken(page, f);
  await expect(f).toHaveAttribute('data-stand', 'leer');
  await langDruecken(page, f);
  await expect(f).toHaveAttribute('data-stand', 'offen');
});

test('bei einem falschen Feld kommt erst die Warnung, der Hinweis nur auf Wunsch', async ({ page }) => {
  await oeffnen(page, '#/spiel/nonogramm');
  await blattSchliessen(page);
  const bild = (await gespeichert(page)).stand.nonogramm.bild;
  const falsch = bild.indexOf(2);   // dieses Feld bleibt im Bild leer
  await feld(page, falsch).click();
  await expect(feld(page, falsch)).toHaveAttribute('data-stand', 'voll');

  await page.getByRole('button', { name: 'Hinweis', exact: true }).click();
  await expect(page.locator('#sheet-spiel-titel')).toHaveText('Da stimmt etwas nicht');
  await page.locator('#sheet-spiel-aktionen').getByRole('button', { name: 'Hinweis trotzdem' }).click();
  await expect(page.locator('#sheet-spiel-titel')).toHaveText(/^Dieses Feld/);
});
