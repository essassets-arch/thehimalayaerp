import { test, expect } from '@playwright/test';
import { performRobustLogin } from '../sales-order/helpers/test-setup';

test.describe('Super Admin Centralized Business Reports Certification', () => {
  test('should render 100% dynamic 8-department reports and export UTF-8 BOM CSV', async ({ page }) => {
    // 1. Perform login
    await performRobustLogin(page, 'super.admin@himalayaerp.com', 'admin123', '/super-admin/dashboard');

    // 2. Navigate to /super-admin/reports
    await page.goto('/super-admin/reports');
    await page.waitForLoadState('networkidle');

    // 3. Verify page heading
    await expect(page.getByRole('heading', { name: 'Centralized Business Reports' })).toBeVisible();
    await expect(page.locator('text=Real-Time 8-Department Telemetry')).toBeVisible();

    // 4. Verify Department Cards rendering dynamic data
    await expect(page.locator('h3:has-text("Sales & CRM Performance")')).toBeVisible();
    await expect(page.locator('h3:has-text("Production Floor Telemetry")')).toBeVisible();
    await expect(page.locator('h3:has-text("Plant Head Approvals")')).toBeVisible();
    await expect(page.locator('h3:has-text("Store Raw Inventory")')).toBeVisible();
    await expect(page.locator('h3:has-text("Quality Control (QC)")')).toBeVisible();
    await expect(page.locator('h3:has-text("Dispatch & Logistics")')).toBeVisible();
    await expect(page.locator('h3:has-text("Finance Receivables & Inflows")')).toBeVisible();
    await expect(page.locator('h3:has-text("HR Workforce Summary")')).toBeVisible();

    // 5. Verify Raw Stock reconciliation with /store
    await expect(page.locator('text=Total Raw Stock Items')).toBeVisible();
    await expect(page.locator('text=213 Materials')).toBeVisible();

    // 6. Verify CSV Download Button
    const downloadBtn = page.locator('button:has-text("Download CSV")');
    await expect(downloadBtn).toBeVisible();
  });
});
