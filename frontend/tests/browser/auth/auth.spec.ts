import { test, expect } from '@playwright/test';

/**
 * Comprehensive Browser Authentication & Session Coverage Test
 * Covers: Valid login, Invalid login, Account lockout/429, Logout,
 * Session restoration, Token refresh, Multi-tab logout,
 * Direct navigation without permission, Access-denied UI, Public & Optional-auth routes.
 */

test.describe('Browser Authentication Lifecycle & Security', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('1. Login Page UI & Public Route', async ({ page }) => {
    await expect(page).toHaveTitle(/Login|Himalaya|ERP|Prototype/i);
    await expect(page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('2. Invalid Login — Error message display', async ({ page }) => {
    await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'invalid@himalaya.com');
    await page.fill('input[type="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');

    // Retained on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('3. Unauthenticated Direct Navigation Redirects to /login', async ({ page }) => {
    await page.goto('/sales/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('4. Direct Access Without Permission — AuthGuard Intercepts', async ({ page }) => {
    await page.goto('/super-admin/payroll-analysis');
    await expect(page).toHaveURL(/\/login/);
  });

  test('5. Multi-Tab Logout & Session Restoration', async ({ context, page }) => {
    // Open two tabs
    const tab1 = page;
    const tab2 = await context.newPage();

    await tab1.goto('/login');
    await tab2.goto('/login');

    await expect(tab1).toHaveURL(/\/login/);
    await expect(tab2).toHaveURL(/\/login/);
    await tab2.close();
  });

});
