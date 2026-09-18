import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const databaseUrl = process.env.BROWSER_TEST_DATABASE_URL || process.env.DATABASE_URL ||
  'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public';
if (!new URL(databaseUrl).pathname.endsWith('_browser_test')) {
  throw new Error('Manual register tests require a database ending in _browser_test.');
}
process.env.BROWSER_TEST_DATABASE_URL = databaseUrl;

// Keep this lifecycle test away from the development server's rebuilding chunks.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'back-office-manual-registers-flow.spec.ts',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/manual-registers', open: 'never' }]],
  use: {
    actionTimeout: 15_000,
    baseURL: 'http://127.0.0.1:3103',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [{
    command: 'node dist/main.js',
    cwd: path.resolve(__dirname, '../backend'),
    url: 'http://127.0.0.1:4101/api/v1',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { PORT: '4101', DATABASE_URL: databaseUrl },
  }, {
    command: 'next build && next start -H 127.0.0.1 -p 3103',
    url: 'http://127.0.0.1:3103/login',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      NEXT_DIST_DIR: '.next-manual-registers',
      BACKEND_INTERNAL_URL: 'http://127.0.0.1:4101/api/v1',
    },
  }],
});
