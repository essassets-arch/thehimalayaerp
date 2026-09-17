import { test, expect } from '@playwright/test';

test.describe('Super Admin All Stock Page E2E Suite', () => {
  test('Super Admin navigates via sidebar to All Stock, verifies hero, tabs, finished goods registry, and logs', async ({ page }) => {
    test.setTimeout(90_000);

    // 1. Log in as Super Admin
    console.log('Logging in as Super Admin...');
    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
    });

    await page.goto('/login');
    await page.getByTestId('login-email').fill('super.admin@himalayaerp.test');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/super-admin(?:\/dashboard)?(?:[/?#]|$)/, { timeout: 30000 });
    console.log('Logged into Super Admin dashboard successfully!');

    // 2. Check sidebar for "All Stock" under MASTER DATA
    const allStockNavLink = page.locator('a[href="/super-admin/all-stock"]');
    await expect(allStockNavLink).toBeVisible({ timeout: 15000 });
    console.log('Sidebar "All Stock" link is visible!');

    // 3. Click sidebar link to navigate to /super-admin/all-stock
    await allStockNavLink.click();
    await expect(page).toHaveURL(/\/super-admin\/all-stock/, { timeout: 30000 });
    console.log('Navigated to /super-admin/all-stock!');

    // 4. Verify hero banner elements
    await expect(page.locator('text=SUPER ADMIN EXECUTIVE INVENTORY MASTER')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Super Admin Inventory — Finished Goods — All Stock')).toBeVisible();
    await expect(page.locator('#btn-add-product')).toBeVisible();
    console.log('Hero banner and Add Product button verified!');

    // 5. Verify tabs
    const allStockTab = page.locator('button:has-text("All Stock Registry")');
    const logsTab = page.locator('button:has-text("Stock Movement Logs")');
    const dispatchHistoryTab = page.locator('button:has-text("Dispatch History")');

    await expect(allStockTab).toBeVisible();
    await expect(logsTab).toBeVisible();
    await expect(dispatchHistoryTab).toBeVisible();
    console.log('All three tabs are visible!');

    // 6. Verify All Stock table
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 15000 });
    const rowCount = await page.locator('tbody tr').count();
    console.log(`Found ${rowCount} finished goods rows in All Stock Registry.`);
    expect(rowCount).toBeGreaterThan(0);

    // 7. Verify quick action buttons exist on rows (Stock In, Stock Out, Adjust, History)
    const historyBtn = page.locator('button[title*="History"]').first();
    await expect(historyBtn).toBeVisible();

    // 8. Test History modal opens
    console.log('Opening History modal...');
    await historyBtn.click();
    await expect(page.locator('text=Stock Audit Trail Log')).toBeVisible({ timeout: 10000 });
    console.log('History modal opened successfully!');

    // Close modal by clicking outside or close button
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);

    // 9. Test Stock Movement Logs tab
    console.log('Switching to Stock Movement Logs tab...');
    await logsTab.click();
    await page.waitForTimeout(2000);
    const logsTable = page.locator('table');
    await expect(logsTable).toBeVisible();
    console.log('Stock Movement Logs tab loaded successfully!');

    // 10. Test Dispatch Out History tab
    console.log('Switching to Dispatch Out History tab...');
    await dispatchHistoryTab.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Dispatch ID').or(page.locator('text=No finished goods dispatch history records found.'))).toBeVisible();
    console.log('Dispatch History tab loaded successfully!');

    console.log('ALL SUPER ADMIN ALL-STOCK VERIFICATIONS PASSED!');
  });
});
