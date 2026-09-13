/* Auswahl, Navigation und Einstellungen.
   Spec: specs/00-rahmen/auswahl.md, specs/00-rahmen/offline.md */

import { test, expect, SPIELE, VERSION, oeffnen, kachel, partie, gespeichert, blattSchliessen } from './helfer.mjs';

test.describe('Kopfzeile', () => {
  /* Auf dem Handy lief „Schafkopf" unter fünf Werkzeuge, Statistik und Menü,
     bei 360 px ragten die Knöpfe aus dem Fenster (auswahl.md AC-17). */
  test('kein Titel läuft unter die Knöpfe, auch nicht bei 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const s of SPIELE) {
      await oeffnen(page, '#/spiel/' + s.id);
      await expect(page.locator('#kopf-titel')).toHaveText(s.name);
      // Gepollt, weil nach dem Laden der Schrift noch einmal eingepasst wird.
      await expect.poll(() => page.evaluate(() => {
        const name = document.getElementById('kopf-titel');
        const zeile = document.querySelector('.topbar-row');
        return {
          titel: name.scrollWidth <= name.parentElement.clientWidth,
          zeile: zeile.scrollWidth <= zeile.clientWidth,
        };
      }), { message: s.id }).toEqual({ titel: true, zeile: true });
    }
  });

  test('was nicht in die Zeile passt, liegt hinter „Weitere Werkzeuge"', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await oeffnen(page, '#/spiel/schafkopf');
    await blattSchliessen(page);
    const mehr = page.getByRole('button', { name: 'Weitere Werkzeuge' });
    const menue = page.locator('.kopf-mehr-menue');

    await mehr.click();
    await expect(menue).toBeVisible();
    await expect(mehr).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menue).toBeHidden();
    await expect(mehr).toBeFocused();

    await mehr.click();
    await page.getByRole('menuitem', { name: 'Regeln des Rechners' }).click();
    await expect(menue).toBeHidden();
    await expect(page.locator('#sheet-spiel')).toBeVisible();
  });
});

test.describe('Auswahl', () => {
  test('zeigt jedes angemeldete Spiel als Kachel', async ({ page }) => {
    await oeffnen(page);
    await expect(page.locator('.kachel')).toHaveCount(SPIELE.length);
    const namen = await page.locator('.kachel-name').allTextContents();
    expect(namen.sort()).toEqual(SPIELE.map((s) => s.name).sort());
  });

  test('jede Kachel steht im Abschnitt ihrer Gruppe, keine unter „Weitere"', async ({ page }) => {
    await oeffnen(page);
    for (const s of SPIELE) {
      const abschnitt = page.locator(`.auswahl-gruppe[data-gruppe="${s.gruppe}"]`);
      await expect(abschnitt.locator('.kachel-name', { hasText: new RegExp('^' + s.name + '$') }), s.name).toHaveCount(1);
    }
    await expect(page.locator('.auswahl-gruppe[data-gruppe=""]')).toHaveCount(0);
    for (const abschnitt of await page.locator('.auswahl-gruppe').all()) {
      await expect(abschnitt.locator('.auswahl-gruppe-zahl')).toHaveText(String(await abschnitt.locator('.kachel').count()));
    }
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

  test('ein offenes Blatt schließt, wenn die Ansicht wechselt', async ({ page }) => {
    await oeffnen(page);
    await kachel(page, 'Minenfeld').click();
    await blattSchliessen(page);
    await page.getByRole('button', { name: 'Regeln' }).click();
    await expect(page.locator('#sheet-spiel')).toBeVisible();
    await page.goBack();
    await expect(page.locator('.kachel')).toHaveCount(SPIELE.length);
    await expect(page.locator('#sheet-spiel')).toBeHidden();
  });

  test('ein Spiel beginnt oben – aus der gescrollten Auswahl und nach Neuladen', async ({ page }) => {
    // So flach, dass Damen höher ist als das Fenster; sonst gäbe es nichts zu prüfen.
    await page.setViewportSize({ width: 360, height: 420 });
    await oeffnen(page);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await kachel(page, 'Damen').click();
    await expect(page.locator('#kopf-titel')).toHaveText('Damen');
    await blattSchliessen(page);
    const zuHoch = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    expect(zuHoch, 'Damen passt hier ins Fenster – der Test prüft dann nichts').toBeGreaterThan(40);
    expect(await page.evaluate(() => Math.round(scrollY))).toBe(0);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.reload();
    await expect(page.locator('#kopf-titel')).toHaveText('Damen');
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => Math.round(scrollY))).toBe(0);
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
    // Der Hinweis nennt alles, was gezählt wird.
    await expect(page.locator('#sheet-einstellungen .notiz--fuss')).toContainText(
      'geöffnet, ein Spiel gestartet oder die App installiert');
    await page.locator('#sheet-einstellungen').getByRole('button', { name: 'Fertig' }).click();
    await expect(page.locator('#sheet-einstellungen')).toBeHidden();
  });

  test('eine Meldung verdeckt die Knöpfe eines offenen Blatts nicht', async ({ page }) => {
    await oeffnen(page);
    await page.locator('#btn-einstellungen').click();
    await page.locator('#btn-aktualisieren').click();
    const toast = page.locator('#toast');
    await expect(toast).toBeVisible();
    const t = await toast.boundingBox();
    const k = await page.locator('#sheet-einstellungen .sheet-aktionen').boundingBox();
    const ueberlappt = t.y < k.y + k.height && k.y < t.y + t.height && t.x < k.x + k.width && k.x < t.x + t.width;
    expect(ueberlappt, `Meldung ${JSON.stringify(t)} über Knöpfen ${JSON.stringify(k)}`).toBe(false);
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
    // Der Eintrag wird entfernt, nicht leer überschrieben – das gelingt auch
    // bei vollem Speicher.
    expect(await gespeichert(page)).toBeNull();
    await expect(page.locator('.kachel-fuss', { hasText: 'Noch nie gespielt' })).toHaveCount(SPIELE.length);
    await page.reload();
    await expect(page.locator('.kachel-fuss', { hasText: 'Noch nie gespielt' })).toHaveCount(SPIELE.length);
  });
});

test.describe('Spiel, das beim Start wirft', () => {
  /* Der Sternjäger warf an einer Partie aus Level 3 bis 6, bevor seine
     Steuerung hing – bei jedem Öffnen wieder, und kein Knopf half heraus
     (schnittstelle.md AC-14). Nachgebaut mit einer Schlange, die wirft. */
  const schlangeWirft = (page, bedingung) =>
    page.route('**/spiele/snake.js', async (route) => {
      const antwort = await route.fetch();
      const text = (await antwort.text()).replace('function starten(wurzel, s) {',
        `function starten(wurzel, s) { if (${bedingung}) throw new Error('Schlange kaputt');`);
      await route.fulfill({ response: antwort, body: text });
    });

  test('bietet an, den Spielstand zu verwerfen, und startet dann neu', async ({ page }) => {
    test.info().annotations.push({ type: 'fehler-erwartet' });
    const konsole = [];
    page.on('console', (m) => { if (m.type() === 'error') konsole.push(m.text()); });
    await schlangeWirft(page, '(s.erinnert() || {}).kaputt');
    await oeffnen(page, '#/spiel/snake', {
      partien: [partie('snake', { aepfel: 3 })],
      stand: { snake: { kaputt: true }, minen: { angefangen: true } },
    });

    const meldung = page.locator('.spielboden .ende-kasten');
    await expect(meldung).toContainText('Das Spiel ließ sich nicht starten.');
    expect(konsole.join('\n')).toContain('Schlange kaputt');

    await page.getByRole('button', { name: 'Spielstand verwerfen' }).click();
    await expect(meldung).toHaveCount(0);
    await expect(page.locator('.ez-schild')).toBeVisible();
    const d = await gespeichert(page);
    expect(d.stand.snake?.kaputt).toBeUndefined();
    expect(d.stand.minen).toEqual({ angefangen: true });
    expect(d.partien).toHaveLength(1);
  });

  test('ohne Stand bleibt nur neu laden', async ({ page }) => {
    test.info().annotations.push({ type: 'fehler-erwartet' });
    await schlangeWirft(page, 'true');
    await oeffnen(page, '#/spiel/snake');
    const meldung = page.locator('.spielboden .ende-kasten');
    await expect(meldung).toContainText('Das Spiel ließ sich nicht starten.');
    await expect(page.getByRole('button', { name: 'Spielstand verwerfen' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Neu laden' }).click();
    await expect(meldung).toContainText('Das Spiel ließ sich nicht starten.');
  });
});
