/* Auswahl, Navigation und Einstellungen.
   Spec: specs/00-rahmen/auswahl.md, specs/00-rahmen/offline.md */

import { test, expect, SPIELE, VERSION, oeffnen, kachel, partie, gespeichert, blattSchliessen } from './helfer.mjs';

test.describe('Auswahl', () => {
  test('zeigt jedes angemeldete Spiel als Kachel', async ({ page }) => {
    await oeffnen(page);
    await expect(page.locator('.kachel')).toHaveCount(SPIELE.length);
    const namen = await page.locator('.kachel-name').allTextContents();
    expect(namen.sort()).toEqual(SPIELE.map((s) => s.name).sort());
  });

  test('ohne Bestand: jede Kachel „Noch nie gespielt" und kein Überblick', async ({ page }) => {
    await oeffnen(page);
    await expect(page.locator('.kachel-fuss', { hasText: 'Noch nie gespielt' })).toHaveCount(SPIELE.length);
    await expect(page.getByText('Such dir etwas aus.')).toBeVisible();
    await expect(page.locator('.ueberblick')).toHaveCount(0);
  });

  test('Kachel öffnet das Spiel, Zurück führt zur Auswahl', async ({ page }) => {
    await oeffnen(page);
    await kachel(page, 'Minenfeld').click();
    await expect(page).toHaveURL(/#\/spiel\/minen$/);
    await expect(page.locator('#kopf-titel')).toHaveText('Minenfeld');
    await blattSchliessen(page);
    await page.locator('#btn-zurueck').click();
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.locator('#btn-zurueck')).toBeHidden();
    await expect(page.locator('.kachel')).toHaveCount(SPIELE.length);
  });

  test('Browser-Zurück verlässt das Spiel', async ({ page }) => {
    await oeffnen(page);
    await kachel(page, 'Mini-Sudoku').click();
    await expect(page.locator('#kopf-titel')).toHaveText('Mini-Sudoku');
    await page.goBack();
    await expect(page.locator('#kopf-titel')).toHaveText('LocalGames');
    await expect(page.locator('.kachel')).toHaveCount(SPIELE.length);
  });

  test('unbekannte Adresse landet auf der Auswahl', async ({ page }) => {
    await oeffnen(page, '#/spiel/gibt-es-nicht');
    await expect(page.locator('.kachel')).toHaveCount(SPIELE.length);
    await expect(page.locator('#kopf-titel')).toHaveText('LocalGames');
  });

  test('Statistik-Knopf im Spiel führt auf dessen eigene Zahlen', async ({ page }) => {
    await oeffnen(page, '#/spiel/minen');
    await blattSchliessen(page);
    await page.locator('#btn-statistik').click();
    await expect(page).toHaveURL(/#\/statistik\/minen$/);
    await expect(page.locator('#kopf-unter')).toHaveText('Statistik');
    await page.getByRole('button', { name: 'Weiterspielen' }).click();
    await expect(page).toHaveURL(/#\/spiel\/minen$/);
  });
});

test.describe('Einstellungen', () => {
  test('nennen die geladene Version und den Bestand', async ({ page }) => {
    await oeffnen(page, '#/', { partien: [partie('minen', { gewonnen: true })] });
    await page.locator('#btn-einstellungen').click();
    await expect(page.locator('#sheet-einstellungen')).toBeVisible();
    await expect(page.locator('#version-notiz')).toHaveText(`Version ${VERSION.nummer}, Stand ${VERSION.stand}`);
    await expect(page.locator('#bestand-notiz')).toHaveText('1 Partie auf diesem Gerät.');
    await page.locator('#sheet-einstellungen').getByRole('button', { name: 'Fertig' }).click();
    await expect(page.locator('#sheet-einstellungen')).toBeHidden();
  });

  test('Versionssuche meldet den neuesten Stand', async ({ page }) => {
    await oeffnen(page);
    await page.locator('#btn-einstellungen').click();
    await page.locator('#btn-aktualisieren').click();
    await expect(page.locator('#version-notiz')).toHaveText(`Version ${VERSION.nummer} ist die neueste.`);
    await expect(page.locator('#toast')).toHaveText('Schon auf dem neuesten Stand.');
  });

  test('Alles löschen fragt nach und leert dann den Speicher', async ({ page }) => {
    await oeffnen(page, '#/', {
      partien: [partie('minen', { gewonnen: true }), partie('sudoku', { gewonnen: false })],
      stand: { minen: { angefangen: true } },
    });
    await page.locator('#btn-einstellungen').click();

    // Abbrechen lässt alles, wie es war.
    page.once('dialog', (d) => d.dismiss());
    await page.locator('#btn-alles-loeschen').click();
    expect((await gespeichert(page)).partien).toHaveLength(2);

    page.once('dialog', (d) => d.accept());
    await page.locator('#btn-alles-loeschen').click();
    await expect(page.locator('#toast')).toHaveText('Alles gelöscht.');
    const danach = await gespeichert(page);
    expect(danach.partien).toEqual([]);
    expect(danach.stand).toEqual({});
    await expect(page.locator('.kachel-fuss', { hasText: 'Noch nie gespielt' })).toHaveCount(SPIELE.length);
  });
});
