import { test, expect } from '@playwright/test';
import { performRobustLogin } from '../sales-order/helpers/test-setup';

test.describe('Sales Analytics Page Multi-Device Responsiveness Certification', () => {

  const viewports = [
    { name: 'Desktop 1920x1080', width: 1920, height: 1080 },
    { name: 'Laptop 1366x768', width: 1366, height: 768 },
    { name: 'Tablet 768x1024', width: 768, height: 1024 },
    { name: 'Mobile 375x812', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    test(`should render all charts, cards, and tables responsively on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Login & Navigate
      const email = process.env.E2E_SUPER_ADMIN_EMAIL || 'super.admin@himalayaerp.com';
      await performRobustLogin(page, email, process.env.E2E_COMMON_PASSWORD || 'admin123', /\/super-admin/);
      await page.goto('/super-admin/analytics/sales');
      await page.waitForLoadState('domcontentloaded');

      // 2. Header & Filter Bar Visibility
      await expect(page.locator('h1').filter({ hasText: /Executive Command Center/i }).first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/Sales Analytics Filter Control/i).first()).toBeVisible();

      // 3. Verify KPI Cards are rendered
      const kpiContainer = page.locator('.sales-kpi-container');
      await expect(kpiContainer).toBeVisible();

      // 4. Verify All 3 Recharts Charts are visible
      const chartFrames = page.locator('.command-center-chart-frame');
      const chartCount = await chartFrames.count();
      expect(chartCount).toBeGreaterThanOrEqual(3);

      // Verify each chart card frame has positive height and width
      for (let i = 0; i < chartCount; i++) {
        const frame = chartFrames.nth(i);
        await expect(frame).toBeVisible();
        const box = await frame.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(200);
          expect(box.width).toBeGreaterThan(150);
        }
      }

      // 5. Verify Drilldown Section & Tables
      await expect(page.getByText(/Executive Performance Ledger/i).first()).toBeVisible();
      await expect(page.getByText(/Finance Receivables Ageing Buckets/i).first()).toBeVisible();
      await expect(page.getByText(/Enterprise Transaction Records Explorer/i).first()).toBeVisible();

      // 6. Verify No Page Body Horizontal Overflow (scrollWidth <= clientWidth + 2px tolerance)
      const isBodyOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > (document.documentElement.clientWidth + 2);
      });
      expect(isBodyOverflowing).toBe(false);
    });
  }
});
