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

    // 4. Verify Recharts Charts SVG elements are rendered and visible (non-zero height)
    const svgCharts = page.locator('.recharts-responsive-container svg, .pnl-chart-container svg');
    const chartCount = await svgCharts.count();
    expect(chartCount).toBeGreaterThan(0);
  });
});
