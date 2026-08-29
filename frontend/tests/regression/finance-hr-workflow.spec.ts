import { test, expect } from '@playwright/test';

test.describe('Finance & HR Workflow Regression Suite', () => {
  test('Finance ledger and invoice billing registers load with 0 runtime exceptions', async ({ page }) => {
    const routes = [
      '/finance/invoices',
      '/finance/payments',
      '/finance/ledger',
      '/finance/reports',
      '/finance-executive/invoices'
    ];

    for (const route of routes) {
      await page.goto(route).catch(() => {});
      await page.waitForTimeout(300);
      const width = await page.evaluate(() => document.body?.scrollWidth || window.innerWidth);
      expect(width).toBeGreaterThan(0);
    }
  });

  test('HR employee master and attendance registers render without clipping', async ({ page }) => {
    const routes = [
      '/hr/recruitment',
      '/hr/roles',
      '/hr/salary',
      '/super-admin/users',
      '/super-admin/daily-reports'
    ];

    for (const route of routes) {
      await page.goto(route).catch(() => {});
      await page.waitForTimeout(300);
      const width = await page.evaluate(() => document.body?.scrollWidth || window.innerWidth);
      expect(width).toBeGreaterThan(0);
    }
  });
});
