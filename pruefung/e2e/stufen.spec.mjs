/* Stufen, „Nochmal" und „Fertig" ohne Lesen erkennbar.
   Spec: 00-rahmen/schnittstelle.md AC-15, je Spiel „Stufe und Ende ohne Lesen" */

import { test, expect, oeffnen, blattSchliessen } from './helfer.mjs';

const punkte = (knopf) => knopf.locator('.stufe-punkt--voll');

test('Weg zeigt die Stufen als Punkte, die Knöpfe heißen weiter wie ihr Text', async ({ page }) => {
  await oeffnen(page, '#/spiel/zip');
  await blattSchliessen(page);
  await expect(page.locator('.m-kopf .stufe[data-ton="leicht"] .stufe-punkt--voll')).toHaveCount(1);

  await page.getByRole('button', { name: 'Neues Rätsel' }).click();
  const leiste = page.locator('#sheet-spiel-aktionen');
  for (const [name, zahl, ton] of [['Leicht', 1, 'leicht'], ['Mittel', 2, 'mittel'], ['Schwer', 3, 'schwer']]) {
    const knopf = leiste.getByRole('button', { name, exact: true });
    await expect(knopf.locator('.stufe')).toHaveAttribute('data-ton', ton);
    await expect(punkte(knopf)).toHaveCount(zahl);
    await expect(knopf.locator('.stufe-punkt')).toHaveCount(3);
  }
});

test('nach dem Lösen stehen Haken und „Nochmal" mit Kreispfeil auf der gespielten Stufe', async ({ page }) => {
  await oeffnen(page, '#/spiel/sudoku');
  await blattSchliessen(page);
  // Alles bis auf ein Feld aus der Lösung eintragen, das letzte von Hand.
  const { feld, wert } = await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('localgames.v1'));
    const st = d.stand.sudoku;
    st.stufe = 'mittel';
    const feld = st.raetsel.indexOf(0);
    st.eingabe = st.loesung.map((w, i) => (i === feld ? 0 : w));
    localStorage.setItem('localgames.v1', JSON.stringify(d));
    return { feld, wert: st.loesung[feld] };
  });
  await page.reload();
  await blattSchliessen(page);
  await page.locator('.s-feld').nth(feld).click();
  await page.locator('.s-taste', { hasText: new RegExp('^' + wert + '$') }).click();

  const ende = page.locator('.ende-kasten');
  await expect(ende.locator('.bildzeichen--fertig')).toBeVisible();
  const nochmal = ende.getByRole('button', { name: 'Nochmal', exact: true });
  await expect(nochmal.locator('.bildzeichen--nochmal')).toHaveCount(1);
  await expect(punkte(nochmal)).toHaveCount(2);
  await expect(ende.getByRole('button', { name: 'Leicht', exact: true })).toBeVisible();
  await expect(ende.getByRole('button', { name: 'Schwer', exact: true })).toBeVisible();

  await nochmal.click();
  await expect(page.locator('.m-kopf .stufe[data-ton="mittel"]')).toBeVisible();
});
