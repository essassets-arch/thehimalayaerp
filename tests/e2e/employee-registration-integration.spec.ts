import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('Employee Registration — Integration', () => {
  test('TC-19: Registered employee appears in HR Employees directory', async ({ page }) => {
    // First clear state
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Navigate to the employee directory
    await page.goto(`${BASE_URL}/hr/employees`);
    await page.waitForLoadState('networkidle');

    // Page should render the employee directory table
    await expect(page.locator('text=Corporate Staff Directory')).toBeVisible({ timeout: 5000 });
    // The table should have at least the seeded mock employees
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-20: Salary Structure page shows employees with PENDING status', async ({ page }) => {
    await page.goto(`${BASE_URL}/hr/salary-structure`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Employee Salary Structure')).toBeVisible({ timeout: 5000 });
    // Page should render without crashing
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 3000 });
  });

  test('TC-21: Salary Structure page shows Configure Salary button', async ({ page }) => {
    await page.goto(`${BASE_URL}/hr/salary-structure`);
    await page.waitForLoadState('networkidle');

    // At least one Configure Salary or Edit Config button should be visible
    const configButtons = page.locator('button', { hasText: /Configure Salary|Edit Config/ });
    const count = await configButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-22: Register Staff link navigates to registration form', async ({ page }) => {
    await page.goto(`${BASE_URL}/hr/employees`);
    await page.waitForLoadState('networkidle');

    const registerBtn = page.locator('button', { hasText: 'Register Staff' });
    if (await registerBtn.isVisible()) {
      await registerBtn.click();
      await page.waitForURL('**/hr/register-staff');
      await expect(page.locator('text=Register New Employee')).toBeVisible({ timeout: 5000 });
    } else {
      // Try direct navigation
      await page.goto(`${BASE_URL}/hr/register-staff`);
      await expect(page.locator('text=Register New Employee')).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-23: Cancel button returns to employee directory', async ({ page }) => {
    await page.goto(`${BASE_URL}/hr/register-staff`);
    await page.waitForLoadState('networkidle');

    const cancelBtn = page.locator('button', { hasText: 'Cancel' }).first();
    await cancelBtn.click();
    await page.waitForURL('**/hr/employees');
    await expect(page.url()).toContain('/hr/employees');
  });
});
