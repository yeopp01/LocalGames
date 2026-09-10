/* Jedes Spiel startet, passt aufs Gerät und lässt sich sauber verlassen.

   Das ist bewusst nur ein Rauchtest: Er fängt, was nach einer Änderung am
   häufigsten kaputtgeht – ein Fehler beim Start, eine Uhr, die nach dem
   Verlassen weiterläuft und ins Leere greift, ein Brett, das seitlich aus dem
   Fenster ragt. Die Regeln der Spiele prüft er nicht.
   Spec: specs/00-rahmen/schnittstelle.md */

import { test, expect, SPIELE, oeffnen, blattSchliessen } from './helfer.mjs';

for (const spiel of SPIELE) {
  test(`${spiel.name} startet, übersteht Neuladen und Zurück`, async ({ page }) => {
    await oeffnen(page, '#/spiel/' + spiel.id);
    await expect(page.locator('#kopf-titel')).toHaveText(spiel.name);
    await expect(page.locator('.spielboden')).not.toBeEmpty();
    await blattSchliessen(page);

    const masse = await page.evaluate(() => ({
      seite: document.documentElement.scrollWidth,
      fenster: window.innerWidth,
    }));
    expect(masse.seite, 'Die Seite ragt seitlich aus dem Fenster').toBeLessThanOrEqual(masse.fenster);

    // Neuladen mitten im Spiel: dieselbe Adresse, derselbe Spielstand.
    await page.reload();
    await expect(page.locator('#kopf-titel')).toHaveText(spiel.name);
    await expect(page.locator('.spielboden')).not.toBeEmpty();
    await blattSchliessen(page);

    await page.locator('#btn-zurueck').click();
    await expect(page.locator('.kachel')).toHaveCount(SPIELE.length);

    // Laufende Uhren des Spiels müssen mit ende() aufgehört haben: ein
    // Nachzügler würde jetzt in eine Bühne schreiben, die ihm nicht mehr gehört.
    await page.waitForTimeout(1500);
    await expect(page.locator('#kopf-titel')).toHaveText('LocalGames');
    await expect(page.locator('.kachel')).toHaveCount(SPIELE.length);
  });
}
