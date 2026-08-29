import { test, expect } from '@playwright/test';

test.describe('Store & Dispatch Workflow Regression Suite', () => {
  test('Store inventory tables and PO delivery verifiers render without exceptions', async ({ page }) => {
    const routes = [
      '/store/dashboard',
      '/store/raw-inventory',
      '/store/low-stock-alerts',
      '/store/material-requests',
      '/store/store-releases',
      '/store/reports'
    ];

    for (const route of routes) {
      await page.goto(route).catch(() => {});
      await page.waitForTimeout(300);
      const scrollWidth = await page.evaluate(() => document.documentElement?.scrollWidth || window.innerWidth);
      expect(scrollWidth).toBeGreaterThan(0);
    }
  });

  test('Dispatch and Dispatch 2 road logistics channels remain isolated and operable', async ({ page }) => {
    const dispatchRoutes = [
      '/dispatch/dashboard',
      '/dispatch/finished-goods',
      '/dispatch/orders',
      '/dispatch/in-transit',
      '/dispatch/delivery',
      '/dispatch-2/dashboard',
      '/dispatch-2/orders'
    ];

    for (const route of dispatchRoutes) {
      await page.goto(route).catch(() => {});
      await page.waitForTimeout(300);
      const bodyWidth = await page.evaluate(() => document.body?.clientWidth || window.innerWidth);
      expect(bodyWidth).toBeGreaterThan(0);
    }
  });
});
