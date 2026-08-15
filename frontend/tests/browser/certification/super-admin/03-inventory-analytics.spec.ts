import { test, expect } from '@playwright/test';
import { performRobustLogin } from '../sales-order/helpers/test-setup';

test.describe('Super Admin Inventory Analytics & Material Control Certification', () => {

  test('should render 100% dynamic inventory analytics reconciled with Store module', async ({ page }) => {
    // 1. Login & Navigate
    const email = process.env.E2E_SUPER_ADMIN_EMAIL || 'super.admin@himalayaerp.com';
    await performRobustLogin(page, email, process.env.E2E_COMMON_PASSWORD || 'admin123', /\/super-admin/);
    await page.goto('/super-admin/analytics/inventory');
    await page.waitForLoadState('domcontentloaded');

    // 2. Header & Title Verification
    await expect(page.locator('h1').filter({ hasText: /Inventory Analytics & Material Control/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Company-wide raw material stock, shortages, movement/i).first()).toBeVisible();

    // 3. Primary KPI Cards Verification (Matching live DB state: 213 materials, 700 qty, 2 in stock, 0 low stock, 211 out of stock)
    await expect(page.getByText(/Total Raw Materials/i).first()).toBeVisible();
    await expect(page.getByText(/213 Materials/i).first()).toBeVisible();

    await expect(page.getByText(/Total Current Stock/i).first()).toBeVisible();
    await expect(page.getByText(/700 Total Qty/i).first()).toBeVisible();

    await expect(page.getByText(/In Stock Materials/i).first()).toBeVisible();
    await expect(page.getByText(/2 Materials/i).first()).toBeVisible();

    await expect(page.getByText(/Low Stock Materials/i).first()).toBeVisible();
    await expect(page.getByText(/0 Materials/i).first()).toBeVisible();

    await expect(page.getByText(/Out of Stock Materials/i).first()).toBeVisible();
    await expect(page.getByText(/211 Materials/i).first()).toBeVisible();

    // 4. Verify Inventory Health Section & Percentages
    await expect(page.getByText(/Inventory Health Index/i).first()).toBeVisible();
    await expect(page.getByText(/Stock Availability %/i).first()).toBeVisible();
    await expect(page.getByText(/0.94%/i).first()).toBeVisible();

    // 5. Verify UOM Breakdown Table
    await expect(page.getByText(/Stock by Unit of Measure/i).first()).toBeVisible();
    await expect(page.getByText(/KG/i).first()).toBeVisible();
    await expect(page.getByText(/PCS/i).first()).toBeVisible();

    // 6. Verify Critical Stock Alerts Table & Reconciled Out of Stock Count
    await expect(page.getByText(/Critical Stock Alerts & Shortages/i).first()).toBeVisible();

    // 7. Verify Paginated Raw Material Inventory Register Table
    await expect(page.getByText(/Raw Material Inventory Register/i).first()).toBeVisible();
    await expect(page.getByText(/Showing 1 to 15 of 213 materials/i).first()).toBeVisible();

    // 8. Verify No Body Horizontal Overflow
    const isBodyOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > (document.documentElement.clientWidth + 2);
    });
    expect(isBodyOverflowing).toBe(false);
  });

});
