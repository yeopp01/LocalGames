/* Gemeinsame Statistik und der Vertrag mit den Spielen.
   Spec: specs/00-rahmen/statistik.md, specs/00-rahmen/schnittstelle.md */

import { test, expect, SPIELE, oeffnen, kachel, kennzahl, partie, vorTagen } from './helfer.mjs';

test.describe('Siegquote', () => {
  /* gewonnen ist dreiwertig: true, false oder gar nicht gesetzt. Partien
     ohne Urteil zählen als gespielt, aber nicht in der Quote. */
  const bestand = {
    partien: [
      partie('minen', { gewonnen: true, dauer: 90_000 }),
      partie('minen', { gewonnen: true, dauer: 30_000 }),
      partie('minen', { gewonnen: false }),
      partie('amehesten'),
      partie('amehesten'),
      partie('amehesten'),
      partie('viergewinnt'),
    ],
  };

  test('Kacheln unterscheiden Partien mit und ohne Urteil', async ({ page }) => {
    await oeffnen(page, '#/', bestand);
    await expect(kachel(page, 'Minenfeld').locator('.kachel-fuss')).toHaveText('3 Partien · 67 % gewonnen');
    await expect(kachel(page, 'Wer am ehesten').locator('.kachel-fuss')).toHaveText('3 Runden');
    await expect(kachel(page, 'Vier gewinnt').locator('.kachel-fuss')).toHaveText('1 Runde');
  });

  test('Überblick zählt alle Partien, quotet nur die mit Urteil', async ({ page }) => {
    await oeffnen(page, '#/', bestand);
    const streifen = page.locator('.ueberblick');
    await expect(kennzahl(streifen, 'Partien')).toHaveText('7');
    await expect(kennzahl(streifen, 'gewonnen')).toHaveText('67 %');
    await expect(kennzahl(streifen, 'heute')).toHaveText('7');
  });

  test('Gesamtstatistik: Partien, Quote, Spielzeit, Kalender', async ({ page }) => {
    await oeffnen(page, '#/statistik', bestand);
    const kopf = page.locator('.block').first();
    await expect(kennzahl(kopf, 'Partien')).toHaveText('7');
    await expect(kennzahl(kopf, 'gewonnen')).toHaveText('67 %');
    await expect(kennzahl(kopf, 'gespielt')).toHaveText('2 min');
    await expect(kopf.locator('.kalender-tag')).toHaveCount(35);
    await expect(kopf.locator('.kalender-tag').last()).not.toHaveAttribute('data-stufe', '0');
  });

  test('ohne Partien sagt die Statistik das', async ({ page }) => {
    await oeffnen(page, '#/statistik');
    await expect(page.getByText('Noch keine Partie gespielt.')).toBeVisible();
  });
});

test.describe('Tagesserie', () => {
  const serie = async (page, tage) => {
    await oeffnen(page, '#/', { partien: tage.map((t) => partie('minen', { gewonnen: true, ende: vorTagen(t) })) });
    return kennzahl(page.locator('.ueberblick'), 'Tage Serie');
  };

  test('drei Tage am Stück bis heute', async ({ page }) => {
    await expect(await serie(page, [0, 1, 2])).toHaveText('3');
  });

  test('heute noch nicht gespielt reißt die Serie nicht', async ({ page }) => {
    await expect(await serie(page, [1, 2])).toHaveText('2');
  });

  test('ein ausgelassener Tag beendet sie', async ({ page }) => {
    await expect(await serie(page, [0, 2, 3])).toHaveText('1');
  });
});

test.describe('Auswertung je Spiel', () => {
  /* Eine eingelesene Sicherung kann von einem älteren Stand stammen: Felder
     fehlen, das Urteil fehlt. Keine Auswertung darf daran scheitern. */
  for (const spiel of SPIELE) {
    test(`${spiel.name} verträgt lückenhafte Partien`, async ({ page }) => {
      await oeffnen(page, '#/statistik/' + spiel.id, {
        partien: [
          partie(spiel.id),
          partie(spiel.id, { gewonnen: true }),
          partie(spiel.id, { gewonnen: false, dauer: 61_000 }),
        ],
      });
      await expect(page.locator('#kopf-titel')).toHaveText(spiel.name);
      const block = page.locator('.block').nth(1);
      await expect(kennzahl(block, spiel.ohneSiege ? 'Runden' : 'Partien')).toHaveText('3');
      // ohneSiege heißt: keine Quote, auch wenn doch ein Urteil hereinkommt.
      await expect(kennzahl(block, 'gewonnen')).toHaveCount(spiel.ohneSiege ? 0 : 1);

      await page.getByRole('button', { name: 'Alle Spiele' }).click();
      await expect(page.locator('.block-titel', { hasText: spiel.name })).toBeVisible();
    });
  }
});
