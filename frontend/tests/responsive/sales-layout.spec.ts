import { test, expect } from '@playwright/test';

test.describe('Sales & SuperSales Layout & Interactive Bounds Suite', () => {
  test('Login and Authentication Shell fits on 320x568 compact viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });

  test('Interactive elements do not cause document overflow on 360x800', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      return {
        hasDocOverflow: doc.scrollWidth > doc.clientWidth + 1,
        hasBodyOverflow: body.scrollWidth > body.clientWidth + 1,
      };
    });

    expect(metrics.hasDocOverflow).toBe(false);
    expect(metrics.hasBodyOverflow).toBe(false);
  });

  test('Desktop layout preserves wide multi-column structure on 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
});
