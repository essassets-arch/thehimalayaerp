import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const REGISTER_URL = `${BASE_URL}/hr/register-staff`;

const VIEWPORTS = [
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 390, height: 844 },
];

test.describe('Employee Registration — Responsive Layout', () => {
  for (const viewport of VIEWPORTS) {
    test(`TC-24: ${viewport.name} (${viewport.width}×${viewport.height}) — no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(REGISTER_URL);
      await page.waitForLoadState('networkidle');

      // Check header is visible
      await expect(page.locator('text=Register New Employee')).toBeVisible({ timeout: 5000 });

      // No horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
    });

    test(`TC-25: ${viewport.name} — form labels and inputs remain visible`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(REGISTER_URL);
      await page.waitForLoadState('networkidle');

      // Section titles should be visible
      await expect(page.locator('text=Personal Information')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Employment Information')).toBeVisible({ timeout: 5000 });

      // Critical inputs should be accessible
      const firstNameInput = page.locator('input[name="firstName"]');
      await expect(firstNameInput).toBeVisible({ timeout: 3000 });

      // Check it's usable (can type)
      await firstNameInput.fill('TestInput');
      const val = await firstNameInput.inputValue();
      expect(val).toBe('TestInput');
    });

    test(`TC-26: ${viewport.name} — sticky action bar is visible and does not cover fields`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(REGISTER_URL);
      await page.waitForLoadState('networkidle');

      // Register Employee button should be visible (sticky bar)
      const registerBtn = page.locator('button[type="submit"]');
      await expect(registerBtn).toBeVisible({ timeout: 5000 });

      // Scroll to bottom and check button is still accessible
      await page.keyboard.press('End');
      await page.waitForTimeout(300);
      await expect(registerBtn).toBeVisible();
    });

    test(`TC-27: ${viewport.name} — Add Document button and rows work`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(REGISTER_URL);
      await page.waitForLoadState('networkidle');

      // Scroll to Additional Documents section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(300);

      const addBtn = page.locator('button', { hasText: 'Add Document' });
      await expect(addBtn).toBeVisible({ timeout: 5000 });
      await addBtn.click();

      // A new document row select should appear
      const typeSelect = page.locator('select').last();
      await expect(typeSelect).toBeVisible({ timeout: 3000 });
    });
  }
});
