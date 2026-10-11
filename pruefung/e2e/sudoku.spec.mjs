/* Mini-Sudoku: Der Hinweis nimmt Falsches weg.
   Spec: 10-raetsel/sudoku.md */

import { test, expect, oeffnen, gespeichert, blattSchliessen } from './helfer.mjs';

const feld = (page, i) => page.locator('.s-feld').nth(i);

/* Früher blieb der Hinweis bei roten Doppelten stehen und sagte nur „Erst die
   roten Felder" – wer den Fehler nicht fand, kam nicht mehr weiter. */
test('der Hinweis nimmt eine falsche, rot doppelte Ziffer weg und hilft dann weiter', async ({ page }) => {
  await oeffnen(page, '#/spiel/sudoku');
  await blattSchliessen(page);
  const { raetsel } = (await gespeichert(page)).stand.sudoku;

  // Ein leeres Feld mit einer Vorgabe in derselben Zeile: deren Ziffer ist
  // dort zwangsläufig falsch und steht sofort doppelt.
  const zeileVon = (i) => Math.floor(i / 6);
  const leer = raetsel.findIndex((w, i) => !w && raetsel.some((v, j) => v && zeileVon(j) === zeileVon(i)));
  const vorgabe = raetsel.find((v, j) => v && zeileVon(j) === zeileVon(leer));

  await feld(page, leer).click();
  await page.locator('.s-taste', { hasText: new RegExp('^' + vorgabe + '$') }).click();
  await expect(feld(page, leer)).toHaveAttribute('data-fehler', 'ja');

  await page.getByRole('button', { name: 'Hinweis', exact: true }).click();
  await expect(page.locator('#sheet-spiel-titel')).toHaveText('Falsches weggenommen');
  await expect(feld(page, leer)).toHaveText('');
  await expect(feld(page, leer)).toHaveAttribute('data-falsch', 'ja');
  await expect(page.locator('.s-feld[data-fehler]')).toHaveCount(0);

  await page.locator('#sheet-spiel-aktionen').getByRole('button', { name: 'Nächster Hinweis' }).click();
  await expect(page.locator('#sheet-spiel-titel')).toHaveText(/^Nur (eine Ziffer passt|ein Feld bleibt)$/);
});
