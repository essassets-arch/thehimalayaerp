import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: '320x568 Mobile Small', width: 320, height: 568 },
  { name: '375x667 Mobile Standard', width: 375, height: 667 },
  { name: '768x1024 Tablet Portrait', width: 768, height: 1024 },
  { name: '1024x768 Tablet Landscape', width: 1024, height: 768 },
  { name: '1280x720 Desktop HD', width: 1280, height: 720 },
  { name: '1440x900 Desktop Full', width: 1440, height: 900 },
];

test.describe('Responsive Viewport Verification', () => {

  for (const vp of VIEWPORTS) {
    test(`Login Page — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/login');

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px tolerance for subpixel rounding
    });
  }

});
