/* Sicherung sichern und einlesen.
   Spec: specs/00-rahmen/sicherung.md */

import { readFile } from 'node:fs/promises';
import { test, expect, oeffnen, partie, gespeichert } from './helfer.mjs';

const einlesen = (page, inhalt) =>
  page.locator('#import-datei').setInputFiles({
    name: 'sicherung.json',
    mimeType: 'application/json',
    buffer: Buffer.from(typeof inhalt === 'string' ? inhalt : JSON.stringify(inhalt)),
  });

test('Sichern lädt eine Datei mit allen Partien, ohne laufende Spielstände', async ({ page }) => {
  const partien = [partie('minen', { gewonnen: true }), partie('wordle', { gewonnen: false, zuege: 6 })];
  await oeffnen(page, '#/', { partien, stand: { minen: { geheim: 'laufend' } } });
  await page.locator('#btn-einstellungen').click();

  const [datei] = await Promise.all([page.waitForEvent('download'), page.locator('#btn-export').click()]);
  expect(datei.suggestedFilename()).toMatch(/^localgames-\d{4}-\d{2}-\d{2}\.json$/);
  const inhalt = JSON.parse(await readFile(await datei.path(), 'utf8'));
  expect(inhalt.app).toBe('LocalGames');
  expect(inhalt.partien.map((p) => p.id)).toEqual(partien.map((p) => p.id));
  expect(JSON.stringify(inhalt)).not.toContain('laufend');
  await expect(page.locator('#toast')).toHaveText('Sicherung gespeichert.');
});

test('Einlesen führt zusammen und überspringt Bekanntes', async ({ page }) => {
  const bekannt = partie('minen', { gewonnen: true });
  await oeffnen(page, '#/', { partien: [bekannt] });
  await page.locator('#btn-einstellungen').click();

  const sicherung = {
    app: 'LocalGames',
    version: 1,
    partien: [bekannt, partie('sudoku', { gewonnen: true }), partie('galgen', { gewonnen: false }), { kaputt: true }],
  };
  await einlesen(page, sicherung);
  await expect(page.locator('#toast')).toHaveText('2 Partien ergänzt.');
  expect((await gespeichert(page)).partien).toHaveLength(3);

  await einlesen(page, sicherung);
  await expect(page.locator('#toast')).toHaveText('Alles war schon da.');
  expect((await gespeichert(page)).partien).toHaveLength(3);
});

test('Einlesen weist fremde Dateien ab, ohne etwas zu verändern', async ({ page }) => {
  await oeffnen(page, '#/', { partien: [partie('minen', { gewonnen: true })] });
  await page.locator('#btn-einstellungen').click();

  await einlesen(page, 'das ist kein JSON');
  await expect(page.locator('#toast')).toHaveText('Die Datei lässt sich nicht lesen.');

  await einlesen(page, { etwas: 'anderes' });
  await expect(page.locator('#toast')).toHaveText('Das sieht nicht nach einer Sicherung aus.');

  expect((await gespeichert(page)).partien).toHaveLength(1);
});
