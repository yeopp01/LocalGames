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

/* Du spielst ein Schellen-Solo und bist wieder am Ausspielen: Eichel hast du
   gestochen, die Herz-Sau ist durchgelaufen. Übrig sind fünf Trümpfe ohne den
   Eichel-Ober und der Herz-König – der Zehner ist noch draußen. Die Rechnung
   sieht den König vorn; am Tisch nachgespielt kostet er (AC-40, AC-42). */
const soloNachHerzSau = (lehre) => {
  const haende = [
    [4, 11, 18, 19, 24, 25],   // Eichel-Unter, Gras-Ober, Herz-König, Herz-Ober, Schellen-Sau, -Zehner
    [8, 10, 13, 28, 30, 31],
    [0, 2, 5, 9, 14, 15],
    [3, 12, 17, 20, 26, 29],   // hält den Herz-Zehner und den Eichel-Ober
  ];
  return leererStand({
    geber: 1, lehre, haende,
    start: [[...haende[0], 16, 27], [...haende[1], 6, 23], [...haende[2], 7, 22], [...haende[3], 1, 21]],
    spielart: { art: 'solo', farbe: 3 }, spieler: 0,
    gebote: [{ p: 2, spiel: null }, { p: 3, spiel: null }, { p: 0, spiel: { art: 'solo', farbe: 3 } }, { p: 1, spiel: null }],
    stiche: [
      { start: 2, karten: [7, 1, 27, 6], sieger: 0 },
      { start: 0, karten: [16, 23, 22, 21], sieger: 0 },
    ],
    aktuell: { start: 0, karten: [] }, amZug: 0,
  });
};

test('als Solist rät der Tipp zu Trumpf statt zum Herz-König, über den noch der Zehner kann', async ({ page }) => {
  await oeffnen(page, '#/spiel/schafkopf', { stand: { schafkopf: soloNachHerzSau('tipp') } });
  await page.getByRole('button', { name: 'Tipp', exact: true }).click();
  await expect(page.locator('.sk-notiz-text')).toContainText('Trumpf statt Herz-König');
  await expect(page.locator('.sk-notiz-titel')).toHaveText(/Ober|Unter|Schellen/);
});

test('als Solist rät der Tipp nach dem ersten Stich zu Trumpf statt zur Herz-Sau', async ({ page }) => {
  /* Dieselbe Gabe einen Stich früher: Eichel gestochen, auf der Hand Herz-Sau,
     Herz-König und fünf Trümpfe (AC-43). */
  const haende = [
    [4, 11, 16, 18, 19, 24, 25],
    [8, 10, 29, 28, 30, 31, 23],
    [0, 2, 5, 9, 14, 15, 22],
    [3, 12, 17, 20, 26, 13, 21],
  ];
  const stand = leererStand({
    geber: 1, lehre: 'tipp', haende,
    start: [[...haende[0], 27], [...haende[1], 6], [...haende[2], 7], [...haende[3], 1]],
    spielart: { art: 'solo', farbe: 3 }, spieler: 0,
    gebote: [{ p: 2, spiel: null }, { p: 3, spiel: null }, { p: 0, spiel: { art: 'solo', farbe: 3 } }, { p: 1, spiel: null }],
    stiche: [{ start: 2, karten: [7, 1, 27, 6], sieger: 0 }],
    aktuell: { start: 0, karten: [] }, amZug: 0,
  });
  await oeffnen(page, '#/spiel/schafkopf', { stand: { schafkopf: stand } });
  await page.getByRole('button', { name: 'Tipp', exact: true }).click();
  await expect(page.locator('.sk-notiz-titel')).toHaveText(/Ober|Unter|Schellen/);
});

test('als Gegenspieler rät der Tipp in Stich 4 zur Farbkarte statt zu Trumpf', async ({ page }) => {
  /* Der Solist hat die Herz-Sau durchgebracht und den Herz-König nachgespielt,
     dein Herz-Zehner hat ihn geholt. Jetzt spielst du aus und hältst den
     höchsten Trumpf und drei weitere – gegen ein Solo spielt man so früh gar
     keinen aus. Der Gras-Neuner ist die einzige Farbkarte (AC-44, AC-46). */
  const haende = [
    [3, 12, 20, 26, 13],
    [4, 11, 19, 24, 25],
    [8, 29, 28, 30, 31],
    [0, 2, 5, 9, 14],
  ];
  const stand = leererStand({
    geber: 2, lehre: 'tipp', haende,
    start: [[...haende[0], 1, 21, 17], [...haende[1], 27, 16, 18], [...haende[2], 6, 23, 10], [...haende[3], 7, 22, 15]],
    spielart: { art: 'solo', farbe: 3 }, spieler: 1,
    gebote: [{ p: 3, spiel: null }, { p: 0, spiel: null }, { p: 1, spiel: { art: 'solo', farbe: 3 } }, { p: 2, spiel: null }],
    stiche: [
      { start: 3, karten: [7, 1, 27, 6], sieger: 1 },
      { start: 1, karten: [16, 23, 22, 21], sieger: 1 },
      { start: 1, karten: [18, 10, 15, 17], sieger: 0 },
    ],
    aktuell: { start: 0, karten: [] }, amZug: 0,
  });
  await oeffnen(page, '#/spiel/schafkopf', { stand: { schafkopf: stand } });
  await page.getByRole('button', { name: 'Tipp', exact: true }).click();
  await expect(page.locator('.sk-notiz-titel')).toHaveText('Gras-Neuner');
  await expect(page.locator('.sk-notiz-text')).toContainText('noch auf der Hand');
});

test('beim Mitlesen heißt der Herz-König in dieser Lage „Besser: …"', async ({ page }) => {
  await oeffnen(page, '#/spiel/schafkopf', { stand: { schafkopf: soloNachHerzSau('mit') } });
  await page.getByRole('button', { name: /^Herz-König/ }).dispatchEvent('click');
  await expect(page.locator('.sk-notiz-titel')).toHaveText(/^Besser: (.*Ober|.*Unter|Schellen)/);
  await expect(page.locator('.sk-notiz-text')).toContainText('Trumpf statt Herz-König');
});

test('der Tisch bleibt gleich hoch, ob in der Mitte eine Karte liegt oder keine', async ({ page }) => {
  /* Die Stichmitte wuchs mit der ersten Karte, und Hand und Knöpfe
     sprangen bei jedem Stich auf und ab (AC-36). */
  const start = [0, 1, 2, 3].map((p) => Array.from({ length: 8 }, (_, i) => p * 8 + i));
  const hoehe = async (karten) => {
    const haende = start.map((h) => h.slice());
    // Resi (3) hat ausgespielt, du bist dran.
    const aktuell = { start: 3, karten: karten ? [haende[3].pop()] : [] };
    await oeffnen(page, '#/spiel/schafkopf', {
      stand: {
        schafkopf: leererStand({
          haende, start, aktuell,
          spielart: { art: 'solo', farbe: 2 }, spieler: 1,
          gebote: [{ p: 3, spiel: null }, { p: 0, spiel: null }, { p: 1, spiel: { art: 'solo', farbe: 2 } }, { p: 2, spiel: null }],
        }),
      },
    });
    await expect(page.locator('.sk-stich .sk-karte')).toHaveCount(karten);
    return page.locator('.sk-tisch').evaluate((e) => e.getBoundingClientRect().height);
  };
  expect(await hoehe(1)).toBe(await hoehe(0));
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
