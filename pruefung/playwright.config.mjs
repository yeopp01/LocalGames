/* E2E-Tests gegen die echte App im Browser.

   Zwei Geräte, weil fast jede Layoutänderung der letzten Monate genau an
   dieser Grenze hing: ein Handy im Hochformat und ein flacher Laptop. Nur
   Chromium – die Browser liegen ohnehin schon auf der Platte, und die App
   nutzt nichts, worin sich die Engines hier unterscheiden. */

import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PRUEF_PORT || 4317);

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  // Ein .only im Commit ließe alle anderen Tests stillschweigend aus.
  forbidOnly: true,
  // Kein Wiederholen: ein Test, der erst beim zweiten Mal grün wird, ist rot.
  retries: 0,
  reporter: [
    ['list'],
    // Der Bericht liest den letzten Lauf von hier (pruefung/skripte/bericht.mjs).
    ['json', { outputFile: './ergebnisse/e2e.json' }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    // Der Service Worker liefert sonst ab dem zweiten Aufruf aus seinem Lager
    // und jeder Test sähe den Stand des vorigen. Der Offline-Test schaltet
    // ihn gezielt ein.
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'handy', use: { ...devices['Pixel 7'] } },
    { name: 'laptop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 700 } } },
  ],
  webServer: {
    command: `node server.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/version.js`,
    reuseExistingServer: true,
    stdout: 'ignore',
  },
});
