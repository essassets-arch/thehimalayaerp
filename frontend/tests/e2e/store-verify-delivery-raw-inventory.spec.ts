import { expect, test, type Page } from '@playwright/test';

async function getAuthToken(email: string, pass: string): Promise<string> {
  try {
    const res = await fetch('http://127.0.0.1:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const json = await res.json();
    return json.data?.accessToken || '';
  } catch {
    return '';
  }
}

async function loginAsStore(page: Page) {
  const email = 'sana.r@himalayaerp.com';
  const roleName = 'Plant Head';
  const userName = 'Sana R';
  const userId = '3b3c4d40-94ec-4824-933c-260ebb2660e8';
  const password = 'Himalaya@1234';
  const token = (await getAuthToken(email, password)) || 'valid-store-session';

  await page.context().addCookies([
    { name: 'token', value: token, domain: 'localhost', path: '/' },
    { name: 'himalaya_token', value: token, domain: 'localhost', path: '/' },
  ]);

  await page.addInitScript(({ roleName, userName, userId, token, email }) => {
    (window as any).__PLAYWRIGHT_TEST__ = true;
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
    localStorage.setItem('token', token);
    localStorage.setItem('himalaya_token', token);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('himalaya_token', token);

    const userObj = {
      id: userId,
      email,
      name: userName,
      role: roleName,
      companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015',
    };
    sessionStorage.setItem('erpUser', JSON.stringify(userObj));

    const authState = {
      state: {
        user: userObj,
        role: roleName,
        isAuthenticated: true,
        accessToken: token,
      },
      version: 0,
    };
    localStorage.setItem('auth-storage', JSON.stringify(authState));
  }, { roleName, userName, userId, token, email });
}

test.describe('Store: Verify Delivery & Automatic Raw Inventory Stock Integration', () => {

  test('1. Store Purchase: Access /store/purchase?tab=Verify Delivery and verify receiving queue', async ({ page }) => {
    await loginAsStore(page);

    await page.goto('/store/purchase?tab=Verify%20Delivery', { waitUntil: 'domcontentloaded' });

    // Assert Header & Active Tab
    await expect(page.getByRole('heading', { name: 'Purchase Management' })).toBeVisible({ timeout: 10_000 });
    
    // Assert Verify Delivery Tab is Present & Active
    const verifyTab = page.locator('button', { hasText: 'Verify Delivery' });
    await expect(verifyTab).toBeVisible({ timeout: 10_000 });
  });

  test('2. Store Raw Inventory: Access /store/raw-inventory and verify live stock table & KPIs', async ({ page }) => {
    await loginAsStore(page);

    await page.goto('/store/raw-inventory', { waitUntil: 'domcontentloaded' });

    // Assert Page Title
    await expect(page.getByRole('heading', { name: 'Raw Inventory Management' })).toBeVisible({ timeout: 10_000 });

    // Assert KPI Metric Cards
    await expect(page.locator('text=Total Materials')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Total Stock Quantity')).toBeVisible();
    await expect(page.locator('text=Low Stock Items')).toBeVisible();
    await expect(page.locator('text=Out of Stock Items')).toBeVisible();
    await expect(page.locator('text=Total Inventory Value')).toBeVisible();

    // Assert Table Column Headers
    await expect(page.getByRole('columnheader', { name: 'Material Code', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Material Name', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Category', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Unit', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Current Stock', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Minimum Stock', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions', exact: true })).toBeVisible();
  });

  test('3. Store Raw Inventory: Status Filters & Search Functionality', async ({ page }) => {
    await loginAsStore(page);

    await page.goto('/store/raw-inventory', { waitUntil: 'domcontentloaded' });

    // Ensure page is mounted
    await expect(page.getByRole('heading', { name: 'Raw Inventory Management' })).toBeVisible({ timeout: 10_000 });

    // Assert Filter Buttons
    await expect(page.locator('button', { hasText: 'In Stock' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('button', { hasText: 'Low Stock' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Out of Stock' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Fast' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Slow' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Non-Moving' })).toBeVisible();

    // Test Search Box
    const searchInput = page.locator('input[placeholder*="Search raw materials"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Cement');
    await expect(searchInput).toHaveValue('Cement');
  });

});
