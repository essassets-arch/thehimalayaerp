import { test, expect } from '@playwright/test';

test.describe('Daily Production Report Mobile Responsive Verification', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // Mobile iPhone / Pixel standard viewport
    isMobile: true,
    hasTouch: true,
  });

  test('Verify mobile card layout, view mode toggle, smart combobox, and sticky dock', async ({ page }) => {
    // 1. Bypass mandatory permissions modal
    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
    });

    // 2. Login as production operator
    console.log('Logging in on mobile viewport...');
    await page.goto('/login');
    await page.getByTestId('login-email').fill('production.operator@himalayaerp.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();
    await page.waitForURL(/\/production(?:\/dashboard)?(?:[/?#]|$)/);

    // 3. Navigate to /production/daily-report
    console.log('Navigating to /production/daily-report on mobile...');
    await page.goto('/production/daily-report');
    await page.waitForTimeout(2000);

    // 4. Capture screenshot of top header, metadata, and KPI cards
    await page.screenshot({ path: 'test-results/mobile-daily-report-top.png', fullPage: false });
    console.log('Captured test-results/mobile-daily-report-top.png');

    // 5. Verify 4 KPI Summary Cards exist
    const kpiCards = page.locator('.daily-report-summary-grid > div');
    await expect(kpiCards).toHaveCount(4);
    console.log('Verified 4 KPI summary cards are rendered on mobile!');

    // 6. Verify View Mode Toggle switch is present and shows Card View active on mobile
    const toggleCardsBtn = page.getByRole('button', { name: 'Cards', exact: false });
    const toggleTableBtn = page.getByRole('button', { name: 'Table', exact: false });
    await expect(toggleCardsBtn).toBeVisible();
    await expect(toggleTableBtn).toBeVisible();

    // 7. Verify Touch Card View is active by default on mobile
    const firstCard = page.locator('.daily-report-item-card').first();
    await expect(firstCard).toBeVisible();
    console.log('Verified touch card view is active by default on mobile screen!');

    // 8. Test SmartProductCombobox on mobile
    console.log('Testing product search on mobile...');
    const searchInput = firstCard.locator('input[placeholder="Search product or type custom name..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.click();
    await page.waitForTimeout(300);
    await page.keyboard.insertText('WGC');

    const popover = page.locator('.smart-product-popover');
    await expect(popover).toBeVisible();
    
    // Select first matching product
    await popover.locator('div[style*="cursor: pointer"]').first().click();
    await page.waitForTimeout(300);

    // 9. Enter quantities on mobile card
    console.log('Entering quantities on mobile card...');
    const coverInput = firstCard.locator('input[type="number"]').nth(0);
    const frameInput = firstCard.locator('input[type="number"]').nth(2);
    await coverInput.fill('15');
    await frameInput.fill('15');

    // 10. Verify Sticky Bottom Floating Dock
    const dock = page.locator('.daily-report-floating-dock');
    await expect(dock).toBeVisible();
    console.log('Verified sticky floating dock is visible at bottom of mobile screen!');

    // Capture screenshot showing bottom dock & card layout
    await page.screenshot({ path: 'test-results/mobile-daily-report-card.png', fullPage: false });
    console.log('Captured test-results/mobile-daily-report-card.png');

    // 11. Test View Mode Toggle switch: Switch to Table View
    console.log('Switching to Wide Table mode on mobile...');
    await toggleTableBtn.click();
    await page.waitForTimeout(500);

    // Verify wide table container is rendered
    const tableEl = page.locator('.daily-report-table');
    await expect(tableEl).toBeVisible();
    await page.screenshot({ path: 'test-results/mobile-daily-report-table-mode.png', fullPage: false });
    console.log('Captured test-results/mobile-daily-report-table-mode.png');

    // 12. Switch back to Card View
    await toggleCardsBtn.click();
    await page.waitForTimeout(500);
    await expect(firstCard).toBeVisible();
    console.log('Successfully switched back to Card View!');
  });

  test('Capture desktop viewport layout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass_permissions', 'true');
      sessionStorage.setItem('e2e_bypass_permissions', 'true');
    });
    await page.goto('/login');
    await page.getByTestId('login-email').fill('production.operator@himalayaerp.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();
    await page.waitForURL(/\/production(?:\/dashboard)?(?:[/?#]|$)/);

    await page.goto('/production/daily-report');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/desktop-daily-report.png', fullPage: false });
    console.log('Captured test-results/desktop-daily-report.png');
  });
});
