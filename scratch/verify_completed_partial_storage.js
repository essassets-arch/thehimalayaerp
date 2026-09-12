const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\df4eb4aa-ff83-4954-9ea6-fad059d2b490';

async function main() {
  console.log('=== STARTING TEST: COMPLETED PARTIAL DELIVERIES STORED IN STORE DELIVERY HISTORY ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log('PAGE EXCEPTION:', err.message);
  });

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  // 1. Check Finance -> Partial Delivery
  console.log('Navigating to http://localhost:3000/finance/po-requests?tab=Partial%20Delivery ...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3500);

  // Check Completed Deliveries KPI Card
  const completedKpi = page.locator('text=Completed Deliveries').first();
  console.log('Completed Deliveries KPI visible:', await completedKpi.isVisible());

  // Check Storage Banner
  const storageBanner = page.locator('text=Completed Partial Deliveries Storage').first();
  console.log('Storage Banner visible:', await storageBanner.isVisible());

  await page.screenshot({
    path: path.join(artifactDir, 'finance_partial_delivery_completed_banner_kpi.png'),
    fullPage: false
  });
  console.log('Saved finance_partial_delivery_completed_banner_kpi.png');

  // Click View in Store Delivery History button
  const viewHistoryBtn = page.locator('button:has-text("View in Store Delivery History")').first();
  if (await viewHistoryBtn.isVisible()) {
    console.log('Clicking "View in Store Delivery History" button...');
    await viewHistoryBtn.click();
    await page.waitForTimeout(2500);

    await page.screenshot({
      path: path.join(artifactDir, 'finance_partial_delivery_history_tab_filtered.png'),
      fullPage: false
    });
    console.log('Saved finance_partial_delivery_history_tab_filtered.png');
  }

  // 2. Check Store -> Delivery History
  console.log('\nNavigating to http://localhost:3000/store/purchase?tab=Delivery%20History ...');
  await page.goto('http://localhost:3000/store/purchase?tab=Delivery%20History');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3500);

  // Check filter buttons
  const filterButtons = await page.locator('button:has-text("Deliveries"), button:has-text("All Receipts")').allInnerTexts();
  console.log('Filter Buttons:', filterButtons);

  // Check Complete Delivery or Partial Delivery badges in table
  const completeBadges = await page.locator('text="Complete Delivery"').count();
  const partialBadges = await page.locator('text="Partial Delivery"').count();
  console.log(`Badges in table: Complete Delivery: ${completeBadges}, Partial Delivery: ${partialBadges}`);

  // Test Completed Deliveries filter
  const completedFilterBtn = page.locator('button:has-text("Completed Deliveries")').first();
  if (await completedFilterBtn.isVisible()) {
    console.log('Clicking Completed Deliveries filter button...');
    await completedFilterBtn.click();
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(artifactDir, 'store_delivery_history_completed_filter.png'),
      fullPage: false
    });
    console.log('Saved store_delivery_history_completed_filter.png');
  }

  // Test Partial Deliveries filter
  const partialFilterBtn = page.locator('button:has-text("Partial Deliveries")').first();
  if (await partialFilterBtn.isVisible()) {
    console.log('Clicking Partial Deliveries filter button...');
    await partialFilterBtn.click();
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(artifactDir, 'store_delivery_history_partial_filter.png'),
      fullPage: false
    });
    console.log('Saved store_delivery_history_partial_filter.png');
  }

  console.log('\nConsole error count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console errors:', consoleErrors);
  }

  await browser.close();
  console.log('\n=== COMPLETED PARTIAL DELIVERIES STORE HISTORY TEST COMPLETE ===');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
