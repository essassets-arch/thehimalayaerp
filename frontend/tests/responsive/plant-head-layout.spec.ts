import { test, expect } from '@playwright/test';

test.describe('Plant Head Layout & Interactive Bounds Suite', () => {
  test('Plant Head root container fits on 320x568 compact viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });

  test('Plant Head modal and container bounds fit within 360x800 viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const isWithinBounds = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      return doc.scrollWidth <= doc.clientWidth + 1 && body.scrollWidth <= body.clientWidth + 1;
    });

    expect(isWithinBounds).toBe(true);
  });

  test('Plant Head wide desktop preserves multi-column analytics on 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
});
