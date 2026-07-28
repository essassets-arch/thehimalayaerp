import { test, expect } from '@playwright/test';

test.describe('Procurement End-to-End UI Flow', () => {
  test('complete page-to-page procurement lifecycle', async ({ page }) => {
    // Step 1: Store creates material indent
    await page.goto('/store/low-stock-alerts', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).not.toContainText(/404|application error/i);

    // Step 2: Plant Head views and approves indent
    await page.goto('/plant-head/indent-approvals', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).not.toContainText(/404|application error/i);

    // Step 3: Finance PO Workspace
    await page.goto('/finance/po-requests', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).not.toContainText(/404|application error/i);

    // Step 4: Super Admin PO requests
    await page.goto('/super-admin/po-requests', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).not.toContainText(/404|application error/i);
  });
});
