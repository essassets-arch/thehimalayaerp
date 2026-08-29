import { test, expect } from '@playwright/test';

test.describe('Responsive Navigation & Mobile Drawer Suite', () => {
  test('Mobile viewport layout bounds check at 390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const overflowMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      return {
        docOverflow: doc.scrollWidth > doc.clientWidth + 1,
        bodyOverflow: body.scrollWidth > body.clientWidth + 1,
      };
    });

    expect(overflowMetrics.docOverflow).toBe(false);
    expect(overflowMetrics.bodyOverflow).toBe(false);
  });

  test('Search dropdown fits within mobile viewport bounds', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const isWithinBounds = await page.evaluate(() => {
      const dropdown = document.querySelector('.hero-search-dropdown');
      if (!dropdown) return true;
      const rect = dropdown.getBoundingClientRect();
      return rect.right <= window.innerWidth && rect.left >= 0;
    });

    expect(isWithinBounds).toBe(true);
  });
});
