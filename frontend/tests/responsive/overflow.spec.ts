import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Mobile 320', width: 320, height: 568 },
  { name: 'Mobile 360', width: 360, height: 800 },
  { name: 'Mobile 390', width: 390, height: 844 },
  { name: 'Mobile 412', width: 412, height: 915 },
  { name: 'Tablet 600', width: 600, height: 960 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Tablet 1024', width: 1024, height: 768 },
  { name: 'Desktop 1280', width: 1280, height: 720 },
  { name: 'Desktop 1440', width: 1440, height: 900 },
  { name: 'Desktop 1920', width: 1920, height: 1080 },
];

test.describe('Global Viewport Overflow Verification Suite', () => {
  for (const vp of viewports) {
    test(`Global Shell & Page Container does not overflow on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/login', { waitUntil: 'domcontentloaded' });

      const overflowMetrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        return {
          docScrollWidth: docEl.scrollWidth,
          docClientWidth: docEl.clientWidth,
          bodyScrollWidth: body.scrollWidth,
          bodyClientWidth: body.clientWidth,
          hasDocOverflow: docEl.scrollWidth > docEl.clientWidth + 1,
          hasBodyOverflow: body.scrollWidth > body.clientWidth + 1,
        };
      });

      expect(overflowMetrics.hasDocOverflow, `Document overflowed on ${vp.name}: scrollWidth=${overflowMetrics.docScrollWidth}, clientWidth=${overflowMetrics.docClientWidth}`).toBe(false);
      expect(overflowMetrics.hasBodyOverflow, `Body overflowed on ${vp.name}: scrollWidth=${overflowMetrics.bodyScrollWidth}, clientWidth=${overflowMetrics.bodyClientWidth}`).toBe(false);
    });
  }
});
