/* Schafkopf: Sperrgrund und Abendstand – mit fest gelegten Ständen, weil die
   Lagen im freien Spiel zu selten vorkommen.
   Spec: 30-brett-und-karten/schafkopf.md */

import { test, expect, oeffnen, gespeichert } from './helfer.mjs';

// Karte = farbe * 8 + wert; Farbe 0 Eichel, 1 Gras, 2 Herz, 3 Schellen;
// Wert 0 Sau, 1 Zehner, 2 König, 3 Ober, 4 Unter, 5–7 Neuner bis Siebener.
const leererStand = (felder) => ({
  phase: 'spiel', geber: 2, haende: [[], [], [], []], start: [[], [], [], []],
  spielart: null, spieler: -1, partner: -1, gebote: [], zeiger: 4,
  stiche: [], aktuell: { start: 3, karten: [] }, stichFertig: false,
  amZug: 0, sauWeg: false, davon: false, begonnen: Date.now(),
  hilfen: 0, treffer: 0, gezaehlt: 0, zurueck: 0, rueckstand: null, abrechnung: null,
  lehre: 'aus', konto: [0, 0, 0, 0], gaben: 0, notiz: null,
  ...felder,
});

test('die Rufsau lässt sich nicht abwerfen – und das Blatt sagt genau das', async ({ page }) => {
  /* Vroni (1) spielt auf die Blaue (Gras-Sau). Du hältst sie, Resi (3) spielt
     Schellen an, und Schellen hast du keine: abwerfen darfst du alles außer
     der Rufsau. */
  const haende = [
    [0, 1, 3, 8, 9, 10, 16, 17],
    [2, 4, 5, 11, 13, 18, 19, 20],
    [6, 7, 12, 14, 21, 22, 23, 24],
    [15, 25, 26, 27, 28, 29, 30],
  ];
  const stand = leererStand({
    haende,
    start: [haende[0], haende[1], haende[2], [...haende[3], 31]],
    spielart: { art: 'sau', farbe: 1 }, spieler: 1, partner: 0,
    gebote: [{ p: 3, spiel: null }, { p: 0, spiel: null }, { p: 1, spiel: { art: 'sau', farbe: 1 } }, { p: 2, spiel: null }],
    aktuell: { start: 3, karten: [31] },
  });
  await oeffnen(page, '#/spiel/schafkopf', { stand: { schafkopf: stand } });

  // In der aufgefächerten Hand deckt der Zehner die Mitte der Sau ab; ein Klick
  // auf die Mitte träfe ihn. dispatchEvent tippt die Sau selbst an, wie ein
  // Finger auf ihren sichtbaren Rand.
  await page.getByRole('button', { name: /^Gras-Sau/ }).dispatchEvent('click');
  await expect(page.locator('#sheet-spiel-titel')).toHaveText('Die geht nicht');
  await expect(page.locator('#sheet-spiel-inhalt')).toContainText('Rufsau darfst du nicht abwerfen');
  // Gelegt wurde nichts.
  expect((await gespeichert(page)).stand.schafkopf.haende[0]).toContain(8);
});

test('der Abendstand übersteht Neuladen im Moment „zusammengeworfen"', async ({ page }) => {
  const haende = [0, 1, 2, 3].map((p) => Array.from({ length: 8 }, (_, i) => p * 8 + i));
  const stand = leererStand({
    phase: 'weiter', geber: 1, haende, start: haende.map((h) => h.slice()),
    gebote: [0, 1, 2, 3].map((p) => ({ p, spiel: null })),
    aktuell: { start: 2, karten: [] },
    lehre: 'mit', konto: [30, -10, -10, -10], gaben: 5,
  });
  await oeffnen(page, '#/spiel/schafkopf', { stand: { schafkopf: stand } });

  // Nach „zusammengeworfen" wird neu gegeben – der Abend muss mitkommen.
  await expect.poll(async () => (await gespeichert(page)).stand.schafkopf.phase, { timeout: 10_000 })
    .not.toBe('weiter');
  const neu = (await gespeichert(page)).stand.schafkopf;
  expect(neu.konto).toEqual([30, -10, -10, -10]);
  expect(neu.gaben).toBe(5);
  expect(neu.lehre).toBe('mit');
});
