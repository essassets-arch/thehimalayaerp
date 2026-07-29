import { test, expect } from '@playwright/test';

test('HR login opens the HR dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#login-email').fill('hr@himalayaerp.com');
  await page.locator('#login-password').fill('admin123');
  await page.locator('#login-submit').click();

  await expect(page).toHaveURL(/\/hr\/dashboard$/);
  await expect(page.getByText('HR Dashboard: Overview')).toBeVisible();
});
