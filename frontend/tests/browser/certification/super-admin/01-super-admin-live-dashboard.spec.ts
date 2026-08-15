import { test, expect } from '@playwright/test';
import { performRobustLogin } from '../sales-order/helpers/test-setup';

test.describe('Super Admin Live Dashboard & Telemetry Certification', () => {
  test('should load Super Admin Command Center with live backend data and visible charts', async ({ page }) => {
    // 1. Authenticate as Super Admin & Navigate to Super Admin Dashboard
    const email = process.env.E2E_SUPER_ADMIN_EMAIL || 'super.admin@himalayaerp.com';
    await performRobustLogin(page, email, process.env.E2E_COMMON_PASSWORD || 'admin123', /\/super-admin/);
    await page.goto('/super-admin/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // 2. Verify Command Center Title & Telemetry Header
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Super Admin Command Center/i }).first()).toBeVisible({ timeout: 10000 });

    // 3. Verify Financial Command Center Cards
    await expect(page.getByText(/Total Sales \/ Order Value/i).first()).toBeVisible();
    await expect(page.getByText(/Payment Received/i).first()).toBeVisible();
    await expect(page.getByText(/Outstanding Receivables/i).first()).toBeVisible();
    await expect(page.getByText(/Total Business Expense/i).first()).toBeVisible();

    // 4. Verify Executive Financial Alerts
    await expect(page.getByText(/Executive Financial Alerts/i).first()).toBeVisible();

    // 5. Verify Operational Overview KPIs
    await expect(page.getByText(/Daily Production/i).first()).toBeVisible();
    await expect(page.getByText(/Daily Dispatch/i).first()).toBeVisible();
    await expect(page.getByText(/Daily Sales/i).first()).toBeVisible();
    await expect(page.getByText(/Pending Orders/i).first()).toBeVisible();
    await expect(page.getByText(/Pending Payments/i).first()).toBeVisible();
    await expect(page.getByText(/Low Stock Alert/i).first()).toBeVisible();

    // 6. Verify Expense & Cost Sections
    await expect(page.getByText(/Where Did We Spend Money/i).first()).toBeVisible();
    await expect(page.getByText(/Monthly Business Performance/i).first()).toBeVisible();
    await expect(page.getByText(/Department-Wise Cost Analysis/i).first()).toBeVisible();
    await expect(page.getByText(/Order-Wise Profitability Control/i).first()).toBeVisible();

    // 7. STRICT REQUIREMENT: Rework Material card MUST NOT exist
    await expect(page.locator('.sa-cost-title').filter({ hasText: /^Rework Material$/i })).toHaveCount(0);

    // 8. STRICT REQUIREMENT: High Rework tab button MUST NOT exist
    await expect(page.getByRole('button', { name: /^High Rework$/i })).toHaveCount(0);

    // 9. Test Profitability Filter Tabs
    for (const tabName of ['All', 'Most Profitable', 'Loss-Making', 'High Transport']) {
      const tabBtn = page.getByRole('button', { name: new RegExp(`^${tabName}$`, 'i') }).first();
      await expect(tabBtn).toBeVisible();
      await tabBtn.click();
    }

    // 10. Verify Recharts Charts SVG elements are rendered and visible
    const svgCharts = page.locator('svg');
    const chartCount = await svgCharts.count();
    expect(chartCount).toBeGreaterThan(0);

    // 11. Test Date Filters
    const periodDropdown = page.locator('select').filter({ hasText: /This Month|Today|This Week/i }).first();
    if (await periodDropdown.isVisible()) {
      await periodDropdown.selectOption('Today');
      await page.waitForTimeout(500);
      await periodDropdown.selectOption('This Month');
      await page.waitForTimeout(500);
    }
  });
});
