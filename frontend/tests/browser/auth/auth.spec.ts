import { test, expect } from '@playwright/test';
import { getPrismaClient } from '../certification/sales-order/helpers/test-setup';

async function safeResponseBody(
  response: import('@playwright/test').Response,
): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '<response body unavailable after navigation>';
  }
}

test.describe('Browser Authentication Lifecycle & Security', () => {

  test('1. Login Page UI & Public Route', async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-forwarded-for': '127.0.0.40' },
    });
    const page = await context.newPage();

    page.on('response', async (response) => {
      if (response.status() === 403) {
        console.error(`[403] ${response.request().method()} ${response.url()}`);
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/Login|Himalaya|ERP|Prototype/i);
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
    
    await context.close();
  });

  test('2. Valid Sales Executive Login', async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-forwarded-for': '127.0.0.41' },
    });
    const page = await context.newPage();

    page.on('response', async (response) => {
      if (response.status() === 403) {
        console.error(`[403] ${response.request().method()} ${response.url()}`);
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const email = process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test';
    const password = process.env.E2E_COMMON_PASSWORD || 'admin123';

    await expect.poll(async () => {
      await page.getByTestId('login-email').fill(email);
      await page.getByTestId('login-password').fill(password);
      return page.getByTestId('login-email').inputValue();
    }, { timeout: 5000 }).toBe(email);
    
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/login') &&
        response.request().method() === 'POST'
    );

    await page.getByTestId('login-submit').click();

    const loginResponse = await loginResponsePromise;

    if (!loginResponse.ok()) {
      const body = await safeResponseBody(loginResponse);
      throw new Error(`Login failed: HTTP ${loginResponse.status()} ${body}`);
    }

    await expect(page.locator('.login-error')).toHaveCount(0);

    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/sales(?:\/dashboard)?(?:[/?#]|$)/);
    
    await context.close();
  });

  test('3. Invalid Password Displays Error', async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-forwarded-for': '127.0.0.42' },
    });
    const page = await context.newPage();

    page.on('response', async (response) => {
      if (response.status() === 403) {
        console.error(`[403] ${response.request().method()} ${response.url()}`);
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const email = process.env.E2E_AUTH_LOCKOUT_EMAIL || 'browser.auth.lockout.user@himalayaerp.test';
    await expect.poll(async () => {
      await page.getByTestId('login-email').fill(email);
      await page.getByTestId('login-password').fill('WrongPassword123');
      return page.getByTestId('login-password').inputValue();
    }, { timeout: 5000 }).toBe('WrongPassword123');
    
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/login') &&
        response.request().method() === 'POST'
    );

    await page.getByTestId('login-submit').click();

    const loginResponse = await loginResponsePromise;
    expect(loginResponse.status()).toBe(401);

    await expect(page.locator('.login-error')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    // Reset lockout state
    const prisma = getPrismaClient();
    await prisma.user.updateMany({
      where: { email },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      }
    });
    await prisma.$disconnect();
    
    await context.close();
  });

  test('4. Unknown Email Rejected', async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-forwarded-for': '127.0.0.43' },
    });
    const page = await context.newPage();

    page.on('response', async (response) => {
      if (response.status() === 403) {
        console.error(`[403] ${response.request().method()} ${response.url()}`);
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const email = 'unknown.user.browser@himalayaerp.test';
    await expect.poll(async () => {
      await page.getByTestId('login-email').fill(email);
      await page.getByTestId('login-password').fill(process.env.E2E_COMMON_PASSWORD || 'admin123');
      return page.getByTestId('login-email').inputValue();
    }, { timeout: 5000 }).toBe(email);
    
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/login') &&
        response.request().method() === 'POST'
    );

    await page.getByTestId('login-submit').click();
    
    const loginResponse = await loginResponsePromise;
    expect(loginResponse.status()).toBe(401);
    
    await expect(page.locator('.login-error')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    
    await context.close();
  });

  test('5. Unauthenticated Direct Navigation Redirects to /login', async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-forwarded-for': '127.0.0.44' },
    });
    const page = await context.newPage();

    await page.goto('/sales/leads');
    await expect(page).toHaveURL(/\/login/);
    
    await context.close();
  });

  test('6. Logout Clears Session', async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-forwarded-for': '127.0.0.45' },
    });
    const page = await context.newPage();

    page.on('response', async (response) => {
      if (response.status() === 403) {
        console.error(`[403] ${response.request().method()} ${response.url()}`);
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const email = process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test';
    const password = process.env.E2E_COMMON_PASSWORD || 'admin123';

    await expect.poll(async () => {
      await page.getByTestId('login-email').fill(email);
      await page.getByTestId('login-password').fill(password);
      return page.getByTestId('login-email').inputValue();
    }, { timeout: 5000 }).toBe(email);
    
    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/login') &&
        response.request().method() === 'POST'
    );
    
    await page.getByTestId('login-submit').click();
    
    const loginResponse = await loginResponsePromise;
    if (!loginResponse.ok()) {
      const body = await safeResponseBody(loginResponse);
      throw new Error(`Login failed: HTTP ${loginResponse.status()} ${body}`);
    }

    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/sales(?:\/dashboard)?(?:[/?#]|$)/);

    const logoutBtn = page.getByRole('button', { name: /logout|sign out/i }).first();
    const fallbackLogout = page.locator('button:has(svg.lucide-log-out), [aria-label="Logout"]');
    
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      await fallbackLogout.click();
    }
    
    await expect(page).toHaveURL(/\/login/);
    
    await page.goto('/sales/leads');
    await expect(page).toHaveURL(/\/login/);
    
    await context.close();
  });

});
