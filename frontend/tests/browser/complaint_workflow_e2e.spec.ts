import { test, expect } from '@playwright/test';
import { performRobustLogin } from './certification/sales-order/helpers/test-setup';

test.describe('Customer Complaint Multi-Department Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await performRobustLogin(page, 'super.admin@himalayaerp.com', 'admin123', /\/super-admin/);
  });

  test('1. Sales Complaint Portal & Create Modal UI', async ({ page }) => {
    await page.goto('/sales/customer-complaints');
    await page.waitForLoadState('networkidle');

    // Verify Title & Create Button
    const createBtn = page.locator('[data-testid="btn-create-complaint"]');
    await expect(createBtn).toBeVisible({ timeout: 15000 });

    // Click Create Complaint
    await createBtn.click();

    // Verify Modal Fields
    await expect(page.locator('text=Create Customer Complaint')).toBeVisible();
    await expect(page.locator('text=Select Customer')).toBeVisible();
    await expect(page.locator('[data-testid="select-complaint-order"]')).toBeVisible();

    // Check Complaint Type field
    const typeInput = page.locator('[data-testid="select-complaint-type"]');
    await expect(typeInput).toBeVisible();

    // Check Priority field
    const priorityInput = page.locator('[data-testid="select-complaint-priority"]');
    await expect(priorityInput).toBeVisible();

    // Check buttons
    await expect(page.locator('[data-testid="btn-save-draft"]')).toBeVisible();
    const submitBtn = page.locator('[data-testid="btn-submit-plant-head"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toHaveText('Submit to Plant Head');
  });

  test('2. Plant Head Complaint Review Portal', async ({ page }) => {
    await page.goto('/plant-head/customer-complaints');
    await page.waitForLoadState('networkidle');

    // Verify Plant Head Header
    await expect(page.locator('text=Plant Head — Customer Complaints')).toBeVisible({ timeout: 15000 });

    // Verify Tabs
    await expect(page.locator('button:has-text("Pending Review")')).toBeVisible();
    await expect(page.locator('button:has-text("Sent to Dispatch")')).toBeVisible();
    await expect(page.locator('button:has-text("In Finance")')).toBeVisible();
    await expect(page.locator('button:has-text("Resolved")')).toBeVisible();
    await expect(page.locator('button:has-text("Rejected")')).toBeVisible();

    // Verify that "Approve & Mark Order LOST" does NOT exist
    const lostBtn = page.locator('button:has-text("Approve & Mark Order LOST")');
    await expect(lostBtn).toHaveCount(0);
  });

  test('3. Dispatch Portals (Dispatch 1 & Dispatch 2)', async ({ page }) => {
    // Test Dispatch 1
    await page.goto('/dispatch/customer-complaints');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Dispatch 1 — Customer Complaints')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button:has-text("Pending Inspection")')).toBeVisible();
    await expect(page.locator('button:has-text("Inspection Completed")')).toBeVisible();

    // Test Dispatch 2
    await page.goto('/dispatch-2/customer-complaints');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Dispatch 2 — Customer Complaints')).toBeVisible({ timeout: 15000 });
  });

  test('4. Finance Complaint Realization Portal', async ({ page }) => {
    await page.goto('/finance/customer-complaints');
    await page.waitForLoadState('networkidle');

    // Verify Header
    await expect(page.locator('text=Finance — Customer Complaints Resolution')).toBeVisible({ timeout: 15000 });

    // Verify Tabs
    await expect(page.locator('button:has-text("Pending Finance")')).toBeVisible();
    await expect(page.locator('button:has-text("Resolved Complaints")')).toBeVisible();

    // Verify Table Headers
    await expect(page.locator('th:has-text("Original Bill")')).toBeVisible();
    await expect(page.locator('th:has-text("Calculated Return")')).toBeVisible();
    await expect(page.locator('th:has-text("Approved Return")')).toBeVisible();
    await expect(page.locator('th:has-text("Dispatch Evidence")')).toBeVisible();
  });
});
