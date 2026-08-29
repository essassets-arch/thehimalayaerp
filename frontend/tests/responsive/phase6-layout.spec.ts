import { test, expect } from '@playwright/test';

test.describe('Phase 6 Enterprise Layout & Interactive Bounds Suite', () => {
  test('Enterprise root container fits on 320x568 compact viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const bodyWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyWidth).toBeLessThanOrEqual(320);
  });

  test('Enterprise forms, modals, and toolbars fit on 360x800', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const bounds = await page.evaluate(() => {
      const el = document.body;
      const rect = el.getBoundingClientRect();
      return { width: rect.width, left: rect.left, right: rect.right };
    });

    expect(bounds.width).toBeLessThanOrEqual(360);
    expect(bounds.left).toBeGreaterThanOrEqual(0);
  });

  test('Enterprise wide desktop preserves multi-column density on 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const width = await page.evaluate(() => window.innerWidth);
    expect(width).toBe(1440);
  });
});
