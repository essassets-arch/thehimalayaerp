const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\df4eb4aa-ff83-4954-9ea6-fad059d2b490';

async function main() {
  console.log('=== STARTING TEST: PARTIAL DELIVERY STORE HISTORY TAB ===\n');

  const browser = await chromium.launch({ headless: true });

  // 1. DESKTOP TEST
  console.log('--- 1. TESTING DESKTOP VIEWPORT (1400x900) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  await desktopContext.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await desktopContext.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('DESKTOP CONSOLE ERROR:', msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log('DESKTOP EXCEPTION:', err.message);
  });

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  // Navigate to Partial Delivery
  console.log('Navigating to /finance/po-requests?tab=Partial%20Delivery ...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Check subnav buttons
  const subnavBar = page.locator('.pd-subnav-bar');
  const subnavCount = await subnavBar.count();
  console.log(`Subnav bar present: ${subnavCount > 0}`);

  const activeTabBtn = page.locator('.pd-subnav-tab:has-text("Active Partial POs")');
  const historyTabBtn = page.locator('.pd-subnav-tab:has-text("Store Delivery History")');

  console.log(`Active Partial POs button visible: ${await activeTabBtn.isVisible()}`);
  console.log(`Store Delivery History button visible: ${await historyTabBtn.isVisible()}`);

  // Screenshot Active Partial POs
  await page.screenshot({
    path: path.join(artifactDir, 'partial_delivery_active_pos_subtab.png'),
    fullPage: false
  });
  console.log('Saved partial_delivery_active_pos_subtab.png');

  // Click Store Delivery History
  console.log('Clicking Store Delivery History tab...');
  await historyTabBtn.click();
  await page.waitForTimeout(2500);

  const currentUrl = page.url();
  console.log(`Current URL after clicking history: ${currentUrl}`);

  // Check if DeliveryHistory rendered
  const historyBox = page.locator('.pd-history-box');
  console.log(`History box visible: ${await historyBox.isVisible()}`);

  // Check for Store Delivery History elements inside
  const historyHeading = page.locator('.pd-history-box h2, .pd-history-box h3, .pd-history-box :text("Store Delivery History"), .pd-history-box :text("Inward Receipts")');
  console.log(`Found history headings/indicators: ${await historyHeading.count()}`);

  const kpiCards = page.locator('.pd-history-box :text("Total Inward Receipts"), .pd-history-box :text("Accepted & Stocked")');
  console.log(`Found store KPI elements: ${await kpiCards.count()}`);

  // Screenshot Store Delivery History in Desktop
  await page.screenshot({
    path: path.join(artifactDir, 'partial_delivery_store_history_desktop.png'),
    fullPage: false
  });
  console.log('Saved partial_delivery_store_history_desktop.png');

  // Test switching back to Active Partial POs
  console.log('Clicking back to Active Partial POs...');
  await activeTabBtn.click();
  await page.waitForTimeout(1500);
  console.log(`URL after clicking ledger: ${page.url()}`);
  console.log(`KPI grid visible: ${await page.locator('.pd-kpi-grid').isVisible()}`);

  // 2. MOBILE TEST
  console.log('\n--- 2. TESTING MOBILE VIEWPORT (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });

  await mobileContext.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/login');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await mobilePage.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await mobilePage.click('button:has-text("Sign In"), button[type="submit"]');
  await mobilePage.waitForTimeout(3000);

  // Navigate directly with subtab=history
  console.log('Navigating mobile to /finance/po-requests?tab=Partial%20Delivery&subtab=history ...');
  await mobilePage.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery&subtab=history');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(3000);

  const mobileHistoryBox = mobilePage.locator('.pd-history-box');
  console.log(`Mobile: Is history box visible when navigating via query param? ${await mobileHistoryBox.isVisible()}`);

  await mobilePage.screenshot({
    path: path.join(artifactDir, 'mobile_store_history_view.png'),
    fullPage: false
  });
  console.log('Saved mobile_store_history_view.png');

  // On mobile, switch to Active Partial POs
  const mobileActiveTabBtn = mobilePage.locator('.pd-subnav-tab:has-text("Active Partial POs")');
  await mobileActiveTabBtn.click();
  await mobilePage.waitForTimeout(2000);

  console.log(`Mobile: Is mobile list visible? ${await mobilePage.locator('.pd-nested-mobile-list').first().isVisible()}`);
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'mobile_partial_pos_view.png'),
    fullPage: false
  });
  console.log('Saved mobile_partial_pos_view.png');

  console.log('\nConsole error count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console errors:', consoleErrors);
  }

  await browser.close();
  console.log('\n=== ALL TESTS FINISHED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
