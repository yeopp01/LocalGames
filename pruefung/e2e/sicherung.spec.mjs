/* Sicherung sichern und einlesen.
   Spec: specs/00-rahmen/sicherung.md */

import { readFile } from 'node:fs/promises';
import { test, expect, SPIELE, oeffnen, partie, gespeichert, vorTagen, blattSchliessen } from './helfer.mjs';

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

test('Einlesen überspringt unlesbare Daten und nimmt Einträge ohne Kennung nur einmal', async ({ page }) => {
  await oeffnen(page);
  await page.locator('#btn-einstellungen').click();
  const sicherung = {
    app: 'LocalGames',
    version: 1,
    partien: [
      { spiel: 'minen', ende: vorTagen(1), gewonnen: true, dauer: 4000 },
      { spiel: 'sudoku', ende: 'gestern abend', gewonnen: true },
    ],
  };
  await einlesen(page, sicherung);
  await expect(page.locator('#toast')).toHaveText('1 Partie ergänzt.');
  await einlesen(page, sicherung);
  await expect(page.locator('#toast')).toHaveText('Alles war schon da.');
  expect((await gespeichert(page)).partien).toHaveLength(1);
});

test('Einlesen hält die Obergrenze von 5000 Partien und behält die neuesten', async ({ page }) => {
  const start = Date.UTC(2025, 0, 1);
  const alt = Array.from({ length: 4990 }, (_, i) =>
    partie('minen', { gewonnen: true, ende: new Date(start + i * 60_000).toISOString() }));
  await oeffnen(page, '#/', { partien: alt });
  await page.locator('#btn-einstellungen').click();
  const neu = Array.from({ length: 20 }, (_, i) =>
    partie('sudoku', { gewonnen: true, ende: new Date(Date.now() - i * 1000).toISOString() }));
  await einlesen(page, { app: 'LocalGames', version: 1, partien: neu });
  await expect(page.locator('#toast')).toHaveText('20 Partien ergänzt.');
  const d = await gespeichert(page);
  expect(d.partien).toHaveLength(5000);
  expect(d.partien.filter((p) => p.spiel === 'sudoku')).toHaveLength(20);
});

test('Alles löschen aus einem laufenden Spiel lässt nichts von ihm zurück', async ({ page }) => {
  await oeffnen(page, '#/spiel/minen');
  await blattSchliessen(page);
  await expect.poll(async () => Boolean((await gespeichert(page))?.stand?.minen)).toBe(true);
  await page.locator('#btn-einstellungen').click();
  page.once('dialog', (d) => d.accept());
  await page.locator('#btn-alles-loeschen').click();
  await expect(page.locator('#toast')).toHaveText('Alles gelöscht.');
  expect((await gespeichert(page))?.stand?.minen).toBeUndefined();
});

test('voller Speicher: Einlesen meldet es, Alles löschen wirkt trotzdem', async ({ page }) => {
  await oeffnen(page, '#/', { partien: [partie('minen', { gewonnen: true })] });
  // Ab jetzt lehnt der Browser jedes Schreiben ab, wie bei ausgeschöpftem Kontingent.
  await page.evaluate(() => {
    const echt = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (window.__voll) throw new DOMException('Speicher voll', 'QuotaExceededError');
      return echt.call(this, k, v);
    };
    window.__voll = true;
  });
  await page.locator('#btn-einstellungen').click();
  await einlesen(page, { app: 'LocalGames', version: 1, partien: [partie('sudoku', { gewonnen: true })] });
  await expect(page.locator('#toast')).toHaveText('Der Speicher des Browsers ist voll.');

  page.once('dialog', (d) => d.accept());
  await page.locator('#btn-alles-loeschen').click();
  await expect(page.locator('#toast')).toHaveText('Alles gelöscht.');
  await page.reload();
  await expect(page.locator('.kachel-fuss', { hasText: 'Noch nie gespielt' })).toHaveCount(SPIELE.length);
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
