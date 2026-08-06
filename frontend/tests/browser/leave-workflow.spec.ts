import { test, expect } from '@playwright/test';

test.describe('Leave Management Module E2E Workflows', () => {
  
  test('1. Full E2E Multi-Level Leave Approval Flow (Sales -> HR -> Super Admin)', async ({ page }) => {
    // Listen to browser console and page errors
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

    const uniqueReason = `E2E Sales Test Sick Leave ${Date.now()}`;

    // ── STEP A: Sales Employee submits leave request ──
    console.log('Logging in as Sales Executive...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('sales.executive@himalayaerp.com');
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
    console.log('Filling form fields...');
    const form = page.locator('form:has-text("Apply New Leave Request")');
    await form.locator('select').selectOption({ value: 'SICK' });
    await form.locator('input[type="date"]').first().fill('2026-08-10');
    await form.locator('input[type="date"]').last().fill('2026-08-12');
    await form.locator('textarea').fill(uniqueReason);
    
    // Submit
    console.log('Submitting leave request...');
    await form.getByRole('button', { name: 'Submit Leave Request' }).click();
    
    // Verify status is PENDING_HR in log
    console.log('Verifying Pending HR status in employee leave logs...');
    await expect(page.locator(`text=${uniqueReason}`).first()).toBeVisible();
    await expect(page.locator('text=Pending HR').first()).toBeVisible();

    // ── STEP B: HR Review and Approval ──
    console.log('Logging out and signing in as HR...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('hr@himalayaerp.com');
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
    await expect(page.locator(`text=${uniqueReason}`)).toHaveCount(0);

    // ── STEP C: Super Admin Final Review ──
    console.log('Logging out and signing in as Super Admin...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('super.admin@himalayaerp.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/super-admin(?:\/dashboard)?(?:[/?#]|$)/);
    
    console.log('Navigating to Super Admin Leave Approvals page...');
    await page.goto('/super-admin/leave-approvals');

    // Verify request is visible under pending
    await expect(page.locator(`text=${uniqueReason}`).first()).toBeVisible();
    
    // Fill final remarks and approve
    console.log('Approving leave finally as Super Admin...');
    await page.locator('input[placeholder="Add review remarks/comments..."]').first().fill('Final Approved by Super Admin');
    await page.getByRole('button', { name: 'Approve & Forward' }).first().click();

    // Verify request is removed from pending
    await expect(page.locator(`text=${uniqueReason}`)).toHaveCount(0);
  });

  test('2. Full E2E Multi-Level Leave Approval Flow (Production -> Plant Head -> Super Admin)', async ({ page }) => {
    // Listen to browser console and page errors
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));

    const uniqueReason = `E2E Production Operator Casual Leave ${Date.now()}`;

    // ── STEP A: Production Operator submits leave request ──
    console.log('Logging in as Production Operator...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('production.operator@himalayaerp.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/production(?:\/dashboard)?(?:[/?#]|$)/);
    console.log('Navigated to Production portal. Moving to Profile...');
    
    // Go to My Profile page
    await page.goto('/production/profile');
    
    // Click Leave Management Tab
    console.log('Accessing Leave Management tab...');
    await page.getByRole('button', { name: 'Leave Management' }).click();

    // Fill form
    console.log('Filling form fields...');
    const form = page.locator('form:has-text("Apply New Leave Request")');
    await form.locator('select').selectOption({ value: 'CASUAL' });
    await form.locator('input[type="date"]').first().fill('2026-09-01');
    await form.locator('input[type="date"]').last().fill('2026-09-05');
    await form.locator('textarea').fill(uniqueReason);
    
    // Submit
    console.log('Submitting leave request...');
    await form.getByRole('button', { name: 'Submit Leave Request' }).click();
    
    // Verify status is PENDING_PLANT_HEAD in log
    console.log('Verifying Pending Plant Head status in employee leave logs...');
    await expect(page.locator(`text=${uniqueReason}`).first()).toBeVisible();
    await expect(page.locator('text=Ready for Confirmation').first()).toBeVisible();

    // ── STEP B: Plant Head Review and Approval ──
    console.log('Logging out and signing in as Plant Head...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('plant.head@himalayaerp.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/plant-head(?:\/dashboard)?(?:[/?#]|$)/);
    
    console.log('Navigating to Plant Head Leave Approvals page...');
    await page.goto('/plant-head/leave-approvals');

    // Approve request
    console.log('Filling review remarks and approving as Plant Head...');
    await page.locator('input[placeholder="Add review remarks/comments..."]').first().fill('Plant Head Approved Production Leave');
    await page.getByRole('button', { name: 'Approve & Forward' }).first().click();

    // Verify it is removed from the pending list
    console.log('Verifying request is successfully approved and removed from Plant Head list...');
    await expect(page.locator(`text=${uniqueReason}`)).toHaveCount(0);

    // ── STEP C: Super Admin Final Review ──
    console.log('Logging out and signing in as Super Admin...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('super.admin@himalayaerp.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/super-admin(?:\/dashboard)?(?:[/?#]|$)/);
    
    console.log('Navigating to Super Admin Leave Approvals page...');
    await page.goto('/super-admin/leave-approvals');

    // Verify request is visible under pending
    await expect(page.locator(`text=${uniqueReason}`).first()).toBeVisible();
    
    // Fill final remarks and approve
    console.log('Approving leave finally as Super Admin...');
    await page.locator('input[placeholder="Add review remarks/comments..."]').first().fill('Final Approved by Super Admin for Production');
    await page.getByRole('button', { name: 'Approve & Forward' }).first().click();

    // Verify request is removed from pending
    await expect(page.locator(`text=${uniqueReason}`)).toHaveCount(0);
  });
});
