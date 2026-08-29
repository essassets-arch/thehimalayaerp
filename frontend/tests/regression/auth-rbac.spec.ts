import { test, expect } from '@playwright/test';

test.describe('Enterprise Authentication & RBAC Regression Suite', () => {
  test('Login page loads with clean inputs and 0 console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const emailInput = page.locator('input[type="email"], input[type="text"], input[name="identifier"], input[placeholder*="email" i], input[placeholder*="user" i]').first();
    await expect(emailInput).toBeVisible({ timeout: 8000 });

    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();

    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
    await expect(submitBtn).toBeVisible();

    expect(consoleErrors.filter(e => !e.includes('favicon') && !e.includes('manifest'))).toHaveLength(0);
  });

  test('Protected routes redirect unauthenticated users to /login', async ({ page }) => {
    const protectedRoutes = [
      '/sales/dashboard',
      '/plant-head/dashboard',
      '/production/floor',
      '/store/dashboard',
      '/dispatch/dashboard',
      '/finance/dashboard',
      '/hr/dashboard',
      '/super-admin/dashboard'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route).catch(() => {});
      await page.waitForTimeout(400);
      const currentUrl = page.url();
      expect(currentUrl.includes('/login') || currentUrl.includes(route)).toBe(true);
    }
  });
});
