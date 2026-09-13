/* Das Kinderzimmer: Es deckt alles ab, und heraus kommt nur, wer hält – allein.

   Der Vertrag gilt für jedes Kinderspiel, deshalb läuft der erste Test über
   alle Spiele der Gruppe. Die Regeln der Spiele prüft er nicht.
   Spec: specs/60-kinder/tiere.md */

import { test, expect, SPIELE, GRUNDBESTAND, oeffnen, gespeichert } from './helfer.mjs';

const KINDER = SPIELE.filter((s) => s.gruppe === 'kinder');

async function zimmerAuf(page, id) {
  await oeffnen(page, '#/spiel/' + id);
  await page.locator('.kz-los').click();
  await expect(page.locator('.kz-zimmer')).toBeVisible();
}

/** Hält das × mit der Maus, so lange wie angegeben. */
async function halten(page, ms) {
  const b = await page.locator('.kz-raus').boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}

const partien = async (page) => (await gespeichert(page))?.partien ?? [];

for (const spiel of KINDER) {
  test(`${spiel.name}: das Zimmer deckt die Kopfzeile ab, ein Tipp aufs × beendet nicht, Halten schon`, async ({ page }) => {
    await zimmerAuf(page, spiel.id);
    const zurueckVerdeckt = await page.evaluate(() => {
      const r = document.getElementById('btn-zurueck').getBoundingClientRect();
      const oben = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!oben && !!oben.closest('.kz-zimmer');
    });
    expect(zurueckVerdeckt, 'Der Zurück-Knopf ist im Zimmer zu treffen').toBe(true);

    await page.locator('.kz-raus').click();
    await expect(page.locator('.kz-raus-tipp')).toBeVisible();
    await expect(page.locator('.kz-zimmer')).toBeVisible();

    await halten(page, 1800);
    await expect(page.locator('.kz-zimmer')).toHaveCount(0);
    await expect(page.locator('.kz-los')).toBeVisible();
  });
}

/* Ein Baby legt gern die ganze Hand aufs Glas; ein Daumen bleibt dabei leicht
   anderthalb Sekunden in der Ecke liegen (tiere.md AC-10). */
test('eine zweite Hand auf dem Glas lässt das Halten nicht zählen', async ({ page }) => {
  await zimmerAuf(page, 'tierstimmen');
  const finger = (ziel, typ, id) => page.evaluate(([sel, t, n]) => {
    document.querySelector(sel).dispatchEvent(new PointerEvent(t, {
      pointerId: n, pointerType: 'touch', isPrimary: n === 1, bubbles: true, cancelable: true, composed: true,
    }));
  }, [ziel, typ, id]);

  // Die Hand liegt schon, dann kommt der Daumen aufs ×.
  await finger('.kz-buehne', 'pointerdown', 1);
  await finger('.kz-raus', 'pointerdown', 2);
  await page.waitForTimeout(1800);
  await expect(page.locator('.kz-zimmer')).toBeVisible();
  await finger('.kz-raus', 'pointerup', 2);
  await finger('.kz-buehne', 'pointerup', 1);

  // Der Daumen hält allein, dann kommt die Hand dazu.
  await finger('.kz-raus', 'pointerdown', 3);
  await page.waitForTimeout(500);
  await finger('.kz-buehne', 'pointerdown', 4);
  await page.waitForTimeout(1500);
  await expect(page.locator('.kz-zimmer')).toBeVisible();
  await finger('.kz-raus', 'pointerup', 3);
  await finger('.kz-buehne', 'pointerup', 4);

  // Allein und lange genug: hinaus.
  await finger('.kz-raus', 'pointerdown', 5);
  await page.waitForTimeout(1800);
  await expect(page.locator('.kz-zimmer')).toHaveCount(0);
});

test('Escape wirkt nur gehalten', async ({ page }) => {
  await zimmerAuf(page, 'tierstimmen');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await expect(page.locator('.kz-zimmer')).toBeVisible();
  await page.keyboard.down('Escape');
  await page.waitForTimeout(1800);
  await page.keyboard.up('Escape');
  await expect(page.locator('.kz-zimmer')).toHaveCount(0);
});

/* ohneSiege und dreiwertiges gewonnen (tiere.md AC-15, tierstimmen.md AC-5). */
test('Tierstimmen: ein Besuch mit Tipps wird eine Runde ohne Urteil, einer ohne Tipp nichts', async ({ page }) => {
  await zimmerAuf(page, 'tierstimmen');
  await halten(page, 1800);
  expect(await partien(page)).toEqual([]);

  await page.locator('.kz-los').click();
  const kacheln = page.locator('.ts-gitter .kz-tier');
  await kacheln.nth(0).click();
  await kacheln.nth(1).click();
  await kacheln.nth(1).click();
  await expect(page.locator('.kz-blase')).toContainText(' macht ');
  await halten(page, 1800);
  await expect(page.locator('.kz-zimmer')).toHaveCount(0);

  const liste = await partien(page);
  expect(liste).toHaveLength(1);
  const [p] = liste;
  expect(p.spiel).toBe('tierstimmen');
  expect(p.tipps).toBe(3);
  expect(Object.values(p.tiere).sort()).toEqual([1, 2]);
  expect(p.dauer).toBeGreaterThan(0);
  expect('gewonnen' in p).toBe(false);
});

/* Jede Aufnahme, die ein Tier verspricht, liegt im Lager und lässt sich
   dekodieren – kurz und mit Ton darin (tiere.md AC-2, AC-3). */
test('jede Aufnahme liegt vor, steht im Lager und lässt sich abspielen', async ({ page }) => {
  await oeffnen(page, '#/spiel/tierstimmen');
  const ids = await page.evaluate(() => Tiere.TIERE.filter((t) => t.ton).map((t) => t.id));
  expect(ids.length).toBeGreaterThan(8);
  for (const id of ids) expect(GRUNDBESTAND, id).toContain('./toene/' + id + '.mp3');

  const laengen = await page.evaluate(async (liste) => {
    const raus = {};
    for (const id of liste) {
      const bytes = await (await fetch('toene/' + id + '.mp3')).arrayBuffer();
      const ctx = new OfflineAudioContext(1, 44100, 44100);
      try {
        const puffer = await ctx.decodeAudioData(bytes);
        const d = puffer.getChannelData(0);
        let spitze = 0;
        for (let i = 0; i < d.length; i += 1) spitze = Math.max(spitze, Math.abs(d[i]));
        raus[id] = { dauer: puffer.duration, spitze };
      } catch (e) {
        raus[id] = { fehler: String(e) };
      }
    }
    return raus;
  }, ids);
  for (const id of ids) {
    const l = laengen[id];
    expect(l.fehler, id).toBeUndefined();
    expect(l.dauer, id).toBeGreaterThan(0.3);
    expect(l.dauer, id).toBeLessThan(3.6);
    expect(l.spitze, id).toBeGreaterThan(0.1);
  }
});
