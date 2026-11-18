import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', workers: 1, fullyParallel: false, timeout: 90000,
  use: { baseURL: 'http://127.0.0.1:5178', channel: 'chrome', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'node tests/start-vite.mjs', url: 'http://127.0.0.1:5178', reuseExistingServer: false, timeout: 30000 },
  reporter: 'list'
});
