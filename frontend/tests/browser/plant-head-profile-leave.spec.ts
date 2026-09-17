import { test, expect } from '@playwright/test';

test.describe('Plant Head Profile - Leave Quota Removal Verification', () => {
  test('Verify Annual Quota / Approved / Remaining leave balance cards are completely removed', async ({ page }) => {
    test.setTimeout(60_000);

    // 1. Setup session and log in as Plant Head
    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
    });

    await page.goto('/login');
    await page.getByTestId('login-email').fill('plant.head@himalayaerp.test');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/plant-head(?:\/dashboard)?(?:[/?#]|$)/, { timeout: 30000 });
    console.log('Logged into Plant Head dashboard!');

    // 2. Navigate to /plant-head/profile
    await page.goto('/plant-head/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // 3. Switch to Leaves tab
    const leavesTab = page.locator('button:has-text("Leaves"), [role="tab"]:has-text("Leaves"), button:has-text("Leave")').first();
    if (await leavesTab.isVisible()) {
      await leavesTab.click();
      await page.waitForTimeout(1000);
    }

    // 4. Assert that "Annual Quota", "24 Days", and the quota cards are NOT visible
    const annualQuota = page.locator('text="Annual Quota"');
    await expect(annualQuota).not.toBeVisible();

    const leaveBalanceGrid = page.locator('.leave-balance-grid');
    await expect(leaveBalanceGrid).not.toBeVisible();

    // 5. Assert that the Apply New Leave Request form is intact
    await expect(page.locator('text="Apply New Leave Request"')).toBeVisible();

    console.log('SUCCESS: Annual Quota, Approved, and Remaining cards are removed while leave form remains intact!');
  });
});
