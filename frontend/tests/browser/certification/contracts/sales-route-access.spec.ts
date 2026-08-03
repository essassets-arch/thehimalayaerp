import { test, expect } from '@playwright/test';
import { performRobustLogin } from '../sales-order/helpers/test-setup';

test.describe('Sales Route Access & RBAC Diagnostic', () => {

  test('Sales Executive can access all required routes without unexpected 403s', async ({ page }) => {
    // Collect all failed responses for reporting
    const unexpectedErrors: Array<{ method: string; url: string; status: number; body: string }> = [];

    page.on('response', async (response) => {
      const status = response.status();
      if (status === 401 || status === 403) {
        let body = '';
        try {
          body = await response.text();
        } catch (e) {
          body = 'Could not read body';
        }
        
        // Exclude specific expected failures if any, but for now we expect 0
        unexpectedErrors.push({
          method: response.request().method(),
          url: response.url(),
          status,
          body
        });
        console.error(`[${status}] ${response.request().method()} ${response.url()} -> ${body}`);
      }
    });

    const email = process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test';
    await performRobustLogin(page, email, undefined, /\/sales/);

    const routes = [
      { path: '/sales/dashboard', name: 'Dashboard' },
      { path: '/sales/leads', name: 'Sales Leads' },
      { path: '/sales/create-lead', name: 'Create Lead' },
      { path: '/sales/samples', name: 'Sample Requests' },
      { path: '/sales/quotations', name: 'Quotations' },
      { path: '/sales/orders', name: 'Sales Orders' },
      { path: '/sales/payment-followup', name: 'Payment Followups' }
    ];

    for (const route of routes) {
      console.log(`Navigating to ${route.path}...`);
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      // Assert that we did not land on the 403 Access Denied page
      await expect(page.locator('text="Access Denied"').first()).not.toBeVisible();
    }

    if (unexpectedErrors.length > 0) {
      console.log('RBAC Diagnostic Matrix of Unexpected Errors:');
      console.table(unexpectedErrors);
    }

    expect(unexpectedErrors.length).toBe(0);
  });
});
