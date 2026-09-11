import { test, expect, type Page } from '@playwright/test';

async function loginAsUser(page: Page, role = 'Super Admin') {
  let token = '';
  let userData: any = null;
  try {
    const res = await fetch('http://127.0.0.1:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' }),
    });
    const json = await res.json();
    token = json.data?.accessToken || '';
    userData = json.data?.user || null;
  } catch (err) {
    console.error('Login fetch failed:', err);
  }

  await page.addInitScript(({ token, userData, role }) => {
    (window as any).__PLAYWRIGHT_TEST__ = true;
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
    localStorage.setItem('token', token);
    localStorage.setItem('himalaya_token', token);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('himalaya_token', token);

    const userObj = {
      ...(userData || {
        id: '1eeb9aa7-bf73-42cf-aee8-f3db6c9d5731',
        email: 'super.admin@himalayaerp.com',
        name: 'Super Admin User',
        companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015'
      }),
      role: role
    };
    sessionStorage.setItem('erpUser', JSON.stringify(userObj));
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: userObj,
        role: role,
        isAuthenticated: true,
        accessToken: token,
      },
      version: 0
    }));
  }, { token, userData, role });
}

test.describe('Verify Finished Goods Pages Removed from Super Admin and Plant Head', () => {
  test('Super Admin finished-goods route is removed and redirects to dashboard', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsUser(page, 'Super Admin');

    await page.goto('http://localhost:3000/super-admin/finished-goods', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Ensure it redirected away from finished-goods to dashboard
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/super-admin/finished-goods');
    expect(currentUrl).toContain('/super-admin/dashboard');

    // Ensure page does NOT have "SUPER ADMIN INVENTORY MASTER — Finished Goods"
    const heading = page.locator('text=SUPER ADMIN INVENTORY MASTER — Finished Goods');
    expect(await heading.count()).toBe(0);

    // Ensure sidebar does NOT have "Finished Goods Inventory" link
    const finishedGoodsLink = page.locator('a[href="/super-admin/finished-goods"]');
    expect(await finishedGoodsLink.count()).toBe(0);
  });

  test('Plant Head finished-goods route is removed and redirects to dashboard', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsUser(page, 'Plant Head');

    await page.goto('http://localhost:3000/plant-head/finished-goods', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Ensure it redirected away from finished-goods to dashboard
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/plant-head/finished-goods');
    expect(currentUrl).toContain('/plant-head/dashboard');

    // Ensure sidebar does NOT have "Finished Goods Inventory" link
    const finishedGoodsLink = page.locator('a[href="/plant-head/finished-goods"]');
    expect(await finishedGoodsLink.count()).toBe(0);
  });

  test('Plant Head Daily Summary does not have View All FG button', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsUser(page, 'Plant Head');

    await page.goto('http://localhost:3000/plant-head/daily-summary', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Verify "View All FG" button is absent
    const viewAllFgBtn = page.locator('button:has-text("View All FG")');
    expect(await viewAllFgBtn.count()).toBe(0);
  });

  test('Production finished-goods still exists and is accessible', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsUser(page, 'Production');

    await page.goto('http://localhost:3000/production/finished-goods', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toContain('/production/finished-goods');
  });
});
