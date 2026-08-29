import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Mobile Compact (320x568)', width: 320, height: 568 },
  { name: 'Mobile Standard (360x800)', width: 360, height: 800 },
  { name: 'Mobile iOS (390x844)', width: 390, height: 844 },
  { name: 'Mobile Large (412x915)', width: 412, height: 915 },
  { name: 'Tablet Mini (600x960)', width: 600, height: 960 },
  { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024 },
  { name: 'Tablet Landscape (1024x768)', width: 1024, height: 768 },
  { name: 'Desktop Baseline (1280x720)', width: 1280, height: 720 },
  { name: 'Desktop Standard (1440x900)', width: 1440, height: 900 },
  { name: 'Desktop FHD (1920x1080)', width: 1920, height: 1080 },
];

test.describe('Finance Viewport Overflow Suite', () => {
  for (const vp of viewports) {
    test(`Verify 0 horizontal page overflow in Finance Shell at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/login', { waitUntil: 'domcontentloaded' });

      const metrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        return {
          docScrollWidth: docEl.scrollWidth,
          docClientWidth: docEl.clientWidth,
          bodyScrollWidth: body.scrollWidth,
          bodyClientWidth: body.clientWidth,
          hasOverflow: docEl.scrollWidth > docEl.clientWidth + 1 || body.scrollWidth > body.clientWidth + 1,
        };
      });

      expect(metrics.hasOverflow, `Unintended horizontal overflow at ${vp.name}: docScroll=${metrics.docScrollWidth}, docClient=${metrics.docClientWidth}`).toBe(false);
    });
  }
});
