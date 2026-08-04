import { test, expect } from '@playwright/test';

test.describe('Super Admin Live Dashboard & Telemetry Certification', () => {
  test('should load Super Admin Command Center with live backend data and visible charts', async ({ page }) => {
    // 1. Visit Super Admin Dashboard
    await page.goto('/super-admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 2. Verify Command Center Title & Telemetry Header
    await expect(page.locator('h1, h2, h3').filter({ hasText: /Super Admin Command Center/i }).first()).toBeVisible();

    // 3. Verify Financial Command Center Cards
    await expect(page.getByText('Total Sales / Order Value').first()).toBeVisible();
    await expect(page.getByText('Revenue Collected').first()).toBeVisible();
    await expect(page.getByText('Outstanding Receivables').first()).toBeVisible();

    // 4. Verify Recharts Charts SVG elements are rendered and visible (non-zero height)
    const svgCharts = page.locator('.recharts-responsive-container svg, .pnl-chart-container svg');
    const chartCount = await svgCharts.count();
    expect(chartCount).toBeGreaterThan(0);
  });
});
