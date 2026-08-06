import { test, expect } from '@playwright/test';

test.describe('Leave Management Module E2E Workflows', () => {
  
  test('1. Full E2E Multi-Level Leave Approval Flow (Sales -> HR -> Super Admin)', async ({ page }) => {
    // ── STEP A: Sales Employee submits leave request ──
    console.log('Logging in as Sales Executive...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('sales.executive.browser@himalayaerp.test');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/sales(?:\/dashboard)?(?:[/?#]|$)/);
    console.log('Navigated to Sales Dashboard. Moving to Profile...');
    
    // Go to My Profile page
    await page.goto('/sales/profile');
    
    // Click Leave Management Tab
    console.log('Accessing Leave Management tab...');
    await page.getByRole('button', { name: 'Leave Management' }).click();

    // Fill form
    await page.selectOption('select:has-option("Casual Leave")', { label: 'Sick Leave' });
    await page.locator('input[type="date"]').first().fill('2026-08-10');
    await page.locator('input[type="date"]').last().fill('2026-08-12');
    await page.locator('textarea').fill('E2E Sales Test Sick Leave');
    
    // Submit
    console.log('Submitting leave request...');
    await page.getByRole('button', { name: 'Submit Leave Request' }).click();
    
    // Verify status is PENDING_HR in log
    console.log('Verifying PENDING_HR status in employee leave logs...');
    await expect(page.locator('text=E2E Sales Test Sick Leave')).toBeVisible();
    await expect(page.locator('text=PENDING_HR').first()).toBeVisible();

    // ── STEP B: HR Review and Approval ──
    console.log('Logging out and signing in as HR...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('hr.browser@himalayaerp.test');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/hr(?:\/dashboard)?(?:[/?#]|$)/);
    
    console.log('Navigating to HR Leave Approvals page...');
    await page.goto('/hr/leave-approvals');

    // Approve request
    console.log('Filling review remarks and approving as HR...');
    await page.locator('input[placeholder="Add review remarks/comments..."]').first().fill('HR Approved Sales Leave');
    await page.getByRole('button', { name: 'Approve & Forward' }).first().click();

    // Verify it is removed from the pending list
    console.log('Verifying request is successfully approved and removed from HR list...');
    await expect(page.locator('text=E2E Sales Test Sick Leave')).toHaveCount(0);

    // ── STEP C: Super Admin Final Review ──
    console.log('Logging out and signing in as Super Admin...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('super.admin.browser@himalayaerp.test');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/super-admin(?:\/dashboard)?(?:[/?#]|$)/);
    
    console.log('Navigating to Super Admin Leave Approvals page...');
    await page.goto('/super-admin/leave-approvals');

    // Verify request is visible under pending
    await expect(page.locator('text=E2E Sales Test Sick Leave')).toBeVisible();
    
    // Fill final remarks and approve
    console.log('Approving leave finally as Super Admin...');
    await page.locator('input[placeholder="Add review remarks/comments..."]').first().fill('Final Approved by Super Admin');
    await page.getByRole('button', { name: 'Approve & Forward' }).first().click();

    // Verify request is removed from pending
    await expect(page.locator('text=E2E Sales Test Sick Leave')).toHaveCount(0);
  });
});
