/* Kennzahlen einzelner Spiele mit lückenhaften Partien.

   Der Rauchtest in statistik.spec.mjs sagt nur, dass nichts wirft. Hier
   steht, was herauskommen muss, wenn Felder fehlen – eine Sicherung von
   einem älteren Stand darf die Zahlen nicht verfälschen.
   Specs: 10-raetsel/mastermind.md, 20-wortspiele/wordle.md,
   20-wortspiele/galgen.md, 40-zu-mehreren/verraeter.md */

import { test, expect, oeffnen, kennzahl, partie } from './helfer.mjs';

const block = (page) => page.locator('.block').nth(1);

test('Zahlencode: Siege ohne Zugzahl fallen aus dem Schnitt', async ({ page }) => {
  await oeffnen(page, '#/statistik/mastermind', {
    partien: [
      partie('mastermind', { gewonnen: true, zuege: 4 }),
      partie('mastermind', { gewonnen: true }),
      partie('mastermind', { gewonnen: true, zuege: 'vier' }),
    ],
  });
  await expect(kennzahl(block(page), 'Versuche je Sieg')).toHaveText('4,0');
  await expect(kennzahl(block(page), 'bester Lauf')).toHaveText('4');
});

test('Wördle: Siege ohne Zugzahl fallen aus dem Schnitt', async ({ page }) => {
  await oeffnen(page, '#/statistik/wordle', {
    partien: [
      partie('wordle', { gewonnen: true, zuege: 3 }),
      partie('wordle', { gewonnen: true }),
      partie('wordle', { gewonnen: true, zuege: 'drei' }),
    ],
  });
  await expect(kennzahl(block(page), 'Züge je Sieg')).toHaveText('3,0');
});

test('Galgenmännchen: Schnitt mit Komma, fehlende Fehler zählen nicht als fehlerfrei', async ({ page }) => {
  await oeffnen(page, '#/statistik/galgen', {
    partien: [
      partie('galgen', { gewonnen: true, fehler: 3 }),
      partie('galgen', { gewonnen: true, fehler: 0 }),
      partie('galgen', { gewonnen: true }),
    ],
  });
  await expect(kennzahl(block(page), 'Fehler je Sieg')).toHaveText('1,5');
  await expect(kennzahl(block(page), 'ohne Fehler')).toHaveText('1');
});

test('Verräter: die Quote rechnet nur über Runden mit Urteil', async ({ page }) => {
  await oeffnen(page, '#/statistik/verraeter', {
    partien: [partie('verraeter', { gewonnen: true, spieler: 5 }), partie('verraeter', { spieler: 5 })],
  });
  await expect(kennzahl(block(page), 'Verräter gefunden')).toHaveText('100 %');
  await expect(kennzahl(block(page), 'meist gespielt')).toHaveText('zu 5');
});
