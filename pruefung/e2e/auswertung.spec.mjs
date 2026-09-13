/* Kennzahlen einzelner Spiele mit lückenhaften Partien.

   Der Rauchtest in statistik.spec.mjs sagt nur, dass nichts wirft. Hier
   steht, was herauskommen muss, wenn Felder fehlen – eine Sicherung von
   einem älteren Stand darf die Zahlen nicht verfälschen.
   Specs: 10-raetsel/mastermind.md, 20-wortspiele/wordle.md,
   20-wortspiele/galgen.md, 40-zu-mehreren/verraeter.md, 50-geschick/doodle.md */

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

test('Schafkopf: Siegquoten nur mit Urteil, kein „NaN" bei fehlenden Feldern', async ({ page }) => {
  await oeffnen(page, '#/statistik/schafkopf', {
    partien: [
      partie('schafkopf', { gewonnen: true, alsSpieler: true, spielart: 'solo', punkte: 150, gezaehlt: 4, treffer: 2, zurueck: 1 }),
      partie('schafkopf', { alsSpieler: true, spielart: 'wenz' }),
      partie('schafkopf', { gewonnen: false, gezaehlt: 3 }),
    ],
  });
  await expect(kennzahl(block(page), 'Punkte gesamt')).toHaveText('+150');
  await expect(kennzahl(block(page), 'Siege als Spieler')).toHaveText('1/1');
  await expect(kennzahl(block(page), 'Siege im Alleinspiel')).toHaveText('1/1');
  await expect(kennzahl(block(page), 'beste Karte')).toHaveText('50 %');
  await expect(kennzahl(block(page), 'Zug zurück')).toHaveText('1');
});

/* Der Rang hat keinen eigenen Speicher, er wird aus den Partien nachgerechnet.
   Eine Sicherung von vor den Zielen darf ihn nicht verfälschen, und die Partie,
   die einen Rang abschließt, zählt nicht schon für den nächsten.
   Spec: 50-geschick/doodle.md AC-23, AC-28 */
test('Hochhinaus: Rang und Monster aus lückenhaften Partien', async ({ page }) => {
  await oeffnen(page, '#/statistik/doodle', {
    partien: [
      partie('doodle', { meter: 60, dauer: 30000, spruenge: 50, monster: 1 }),
      partie('doodle', { meter: 200, spruenge: 50, monster: 'zwei', federn: 3, propeller: 1 }),
      partie('doodle', { dauer: 'lang' }),
    ],
  });
  await expect(kennzahl(block(page), 'Ränge geschafft')).toHaveText('1/10');
  await expect(kennzahl(block(page), 'Monster abgeschossen')).toHaveText('1');
  await expect(kennzahl(block(page), 'Bestwert')).toHaveText('200 m');
});

test('Verräter: die Quote rechnet nur über Runden mit Urteil', async ({ page }) => {
  await oeffnen(page, '#/statistik/verraeter', {
    partien: [partie('verraeter', { gewonnen: true, spieler: 5 }), partie('verraeter', { spieler: 5 })],
  });
  await expect(kennzahl(block(page), 'Verräter gefunden')).toHaveText('100 %');
  await expect(kennzahl(block(page), 'meist gespielt')).toHaveText('zu 5');
});
