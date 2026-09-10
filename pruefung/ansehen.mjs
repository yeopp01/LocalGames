#!/usr/bin/env node
/* Eine Ansicht der App im echten Browser aufnehmen und vermessen.

   Für die Frage „sieht das jetzt richtig aus?" nach einer Änderung an
   Layout oder Oberfläche – ohne Test zu schreiben. Liefert ein Bild, die
   Fehler aus der Konsole und ob etwas aus dem Fenster ragt. Die Bilder sind
   Arbeitsmaterial und landen ungetrackt unter pruefung/ansichten/.

   Aufruf:
     node pruefung/ansehen.mjs "#/spiel/schafkopf"
     node pruefung/ansehen.mjs "#/spiel/minen" --geraet 1366x700 --klick "Neues Feld" --klick "Groß"
     node pruefung/ansehen.mjs "#/statistik" --bestand sicherung.json --dunkel

   Optionen:
     --geraet handy|laptop|BREITExHOEHE   Vorgabe: handy (Pixel 7)
     --klick TEXT        klickt das erste sichtbare Element mit diesem Text;
                         mit "css=" davor ein Selektor. Mehrfach möglich.
     --taste TASTE       drückt eine Taste (z. B. ArrowLeft). Mehrfach möglich.
     --warte MS          wartet nach dem letzten Schritt (Vorgabe 400)
     --bestand DATEI     legt eine Sicherungsdatei als Bestand in localStorage
     --dunkel            dunkle Darstellung
     --datei NAME        Name des Bildes (Vorgabe aus der Adresse) */

import { chromium, devices } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const weg = args[0] && !args[0].startsWith('--') ? args.shift() : '#/';
const schritte = [];
const opt = { geraet: 'handy', warte: 400, dunkel: false, datei: null, bestand: null };
for (let i = 0; i < args.length; i += 1) {
  const a = args[i];
  if (a === '--klick') schritte.push({ klick: args[++i] });
  else if (a === '--taste') schritte.push({ taste: args[++i] });
  else if (a === '--dunkel') opt.dunkel = true;
  else if (a.startsWith('--')) opt[a.slice(2)] = args[++i];
}

const PORT = 4391;
const server = spawn(process.execPath, [join(HIER, 'server.mjs'), String(PORT)], { stdio: 'ignore' });
const basis = `http://127.0.0.1:${PORT}/`;
for (let i = 0; i < 50; i += 1) {
  try {
    if ((await fetch(basis + 'version.js')).ok) break;
  } catch {
    await new Promise((f) => setTimeout(f, 100));
  }
}

const geraet =
  opt.geraet === 'handy' ? devices['Pixel 7']
    : opt.geraet === 'laptop' ? { viewport: { width: 1366, height: 700 } }
      : (() => {
          const [w, h] = opt.geraet.split('x').map(Number);
          return { viewport: { width: w, height: h } };
        })();

const browser = await chromium.launch();
const ergebnis = { weg, geraet: opt.geraet, fehler: [], draussen: [] };
try {
  const context = await browser.newContext({
    ...geraet,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    serviceWorkers: 'block',
    colorScheme: opt.dunkel ? 'dark' : 'light',
  });
  await context.route('**/*', (r) => {
    if (r.request().url().startsWith(basis)) return r.continue();
    ergebnis.draussen.push(r.request().url());
    return r.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => ergebnis.fehler.push('Ausnahme: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|net::ERR_FAILED/.test(m.text())) ergebnis.fehler.push(m.text());
  });

  if (opt.bestand) {
    const d = JSON.parse(readFileSync(resolve(opt.bestand), 'utf8'));
    await page.goto(basis + 'version.js');
    await page.evaluate((b) => localStorage.setItem('localgames.v1', JSON.stringify(b)), {
      version: 1, partien: d.partien || [], stand: d.stand || {},
    });
  }
  await page.goto(basis + weg);
  await page.waitForTimeout(300);

  for (const s of schritte) {
    if (s.taste) await page.keyboard.press(s.taste);
    else if (s.klick.startsWith('css=')) await page.locator(s.klick.slice(4)).first().click();
    else {
      // Erst ein Knopf mit genau diesem Namen, dann genau dieser Text, erst
      // zuletzt ein Teiltreffer – sonst trifft „Schwer" den Absatz
      // „… schwer 7 × 7" statt des Knopfs darunter.
      const kandidaten = [
        page.getByRole('button', { name: s.klick, exact: true }),
        page.getByText(s.klick, { exact: true }),
        page.getByText(s.klick, { exact: false }),
      ];
      let ziel = null;
      for (const k of kandidaten) {
        const sichtbar = k.locator('visible=true');
        if (await sichtbar.count()) { ziel = sichtbar.first(); break; }
      }
      if (!ziel) throw new Error(`Nichts Sichtbares zum Anklicken: "${s.klick}"`);
      await ziel.click();
    }
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(Number(opt.warte));

  ergebnis.masse = await page.evaluate(() => {
    const fenster = { breite: innerWidth, hoehe: innerHeight };
    const raus = [];
    for (const el of document.querySelectorAll('#buehne *, #topbar *')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.right > innerWidth + 1 || r.left < -1) {
        raus.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ragt seitlich heraus (${Math.round(r.left)}…${Math.round(r.right)})`);
      }
    }
    return {
      fenster,
      seite: { breite: document.documentElement.scrollWidth, hoehe: document.documentElement.scrollHeight },
      seitlichRaus: [...new Set(raus)].slice(0, 10),
    };
  });

  const ordner = join(HIER, 'ansichten');
  mkdirSync(ordner, { recursive: true });
  const name = opt.datei || `${weg.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'auswahl'}-${opt.geraet}${opt.dunkel ? '-dunkel' : ''}.png`;
  ergebnis.bild = join(ordner, name);
  await page.screenshot({ path: ergebnis.bild, animations: 'disabled' });
} finally {
  await browser.close();
  server.kill();
}
console.log(JSON.stringify(ergebnis, null, 2));
