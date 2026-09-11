/* Echtzeitspiele halten an, wenn niemand hinsieht, und kommen als Pause zurück.

   Der Vertrag des Werkzeugs spiele/echtzeit.js, geprüft an jedem Spiel, das
   es benutzt: Ein offenes Blatt oder eine verdeckte App halten die Schleife
   an, der Stand liegt dann als Pause im Speicher, und nach dem Neuladen steht
   die Pause mit „Weiter" da – statt eines Spiels, das weiterläuft, während
   niemand hinsieht.

   Start und Anhalten geschehen im selben evaluate: Der Flattervogel liegt
   ohne Tipp nach einer Sekunde am Boden, und so lange darf der Test nicht
   zwischen zwei Schritten brauchen.
   Spec: specs/50-geschick/echtzeit.md */

import { test, expect, SPIELE, oeffnen, gespeichert } from './helfer.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { WURZEL } from './helfer.mjs';

const ECHTZEIT = SPIELE.filter((s) => readFileSync(join(WURZEL, 'spiele', s.datei), 'utf8').includes('Echtzeit.buehne('));

/** Startet das Spiel mit einem Tipp aufs Feld – so, wie ein Finger es tut. */
const TIPPEN = `
  const kasten = document.querySelector('.ez-kasten');
  const r = kasten.getBoundingClientRect();
  const o = { pointerId: 7, bubbles: true, clientX: r.left + r.width * 0.5, clientY: r.top + r.height * 0.5, pointerType: 'touch' };
  kasten.dispatchEvent(new PointerEvent('pointerdown', o));
  kasten.dispatchEvent(new PointerEvent('pointerup', o));
`;

test('mindestens vier Echtzeitspiele gefunden', () => {
  expect(ECHTZEIT.map((s) => s.id).sort()).toEqual(expect.arrayContaining(['doodle', 'flappy', 'invaders', 'snake']));
});

for (const spiel of ECHTZEIT) {
  test(`${spiel.name} hält bei Blatt und verdeckter App an`, async ({ page }) => {
    await oeffnen(page, '#/spiel/' + spiel.id);
    const schild = page.locator('.ez-schild');
    await expect(schild).toBeVisible();

    // Anleitung mitten im Lauf: Das nächste Bild hält an.
    await page.evaluate(TIPPEN + `
      document.querySelector('#kopf-werkzeuge [aria-label="Anleitung"]').click();
    `);
    await expect(page.locator('#sheet-spiel')).toBeVisible();
    await page.locator('#sheet-spiel-aktionen button').first().click();
    await expect(schild).toContainText('Pause');
    await expect(page.locator('.ez-unten')).toContainText('Weiter');
    expect((await gespeichert(page)).stand[spiel.id].zustand).toBe('pause');

    // Nach dem Neuladen steht die Pause wieder da.
    await page.reload();
    await expect(schild).toContainText('Pause');
    await page.getByRole('button', { name: 'Weiter' }).click();
    await expect(schild).toBeHidden();

    // App verdeckt: sofort anhalten und sichern.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(['pause', 'vorbei']).toContain((await gespeichert(page)).stand[spiel.id].zustand);
    await expect(schild).toBeVisible();
  });
}
