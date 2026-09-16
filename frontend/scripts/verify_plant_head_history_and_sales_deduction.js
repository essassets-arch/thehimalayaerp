const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['notifications', 'geolocation'],
    geolocation: { latitude: 23.0225, longitude: 72.5714 },
  });

  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
      window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
      window.__PLAYWRIGHT_TEST__ = true;
    } catch (e) {}
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[BROWSER ERROR]', msg.text());
  });

  console.log('1. Logging in as Plant Head (sana.r@himalayaerp.com)...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'sana.r@himalayaerp.com');
  await page.fill('input[type="password"]', 'Password@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('   Logged in successfully. URL:', page.url());

  // 2. Navigate to Plant Head Customer Complaints
  console.log('\n2. Navigating to /plant-head/customer-complaints...');
  await page.goto('http://localhost:3000/plant-head/customer-complaints', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Look for the History tab
  console.log('   Checking Plant Head navigation tabs...');
  const tabs = await page.locator('button').evaluateAll(buttons =>
    buttons
      .map(b => b.innerText.trim().replace(/\n/g, ' '))
      .filter(t => t.includes('Review') || t.includes('Dispatch') || t.includes('Finance') || t.includes('Resolved') || t.includes('Rejected') || t.includes('History') || t.includes('All'))
  );
  console.log('   Visible Plant Head Tabs:', tabs);

  const historyTab = page.locator('button:has-text("History")').first();
  const isHistoryTabVisible = await historyTab.isVisible();
  console.log(`   History tab visible? ${isHistoryTabVisible}`);

  if (!isHistoryTabVisible) {
    throw new Error('FAILED: History tab is not visible on /plant-head/customer-complaints');
  }

  // Click on History tab
  console.log('   Clicking History tab...');
  await historyTab.click();
  await page.waitForTimeout(1500);

  // Take screenshot of Plant Head History Tab
  const plantHeadHistoryScreenshot = path.join(
    'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\3d2f2c0b-8be2-40b2-988e-98ee6fd60d51',
    'plant_head_history_tab_verified.png'
  );
  await page.screenshot({ path: plantHeadHistoryScreenshot, fullPage: true });
  console.log(`   Saved screenshot: ${plantHeadHistoryScreenshot}`);

  // Check table rows in History tab
  const complaintRows = await page.locator('table tbody tr').evaluateAll(rows =>
    rows.map(r => r.innerText.trim().replace(/\n+/g, ' | '))
  );
  console.log(`   History Complaints in table (${complaintRows.length} rows):`);
  complaintRows.slice(0, 5).forEach((r, i) => console.log(`     ${i + 1}. ${r}`));

  // 3. Log in as Super Admin to inspect Sales Orders and Finance views
  console.log('\n3. Logging in as superadmin@himalayaerp.com for Sales & Finance verification...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'superadmin@himalayaerp.com');
  await page.fill('input[type="password"]', 'Password@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('   Super Admin logged in. URL:', page.url());

  // 4. Check Sales Orders list
  console.log('\n4. Navigating to /orders (Sales Orders)...');
  await page.goto('http://localhost:3000/orders', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const searchInput = page.locator('input[placeholder*="Search"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('0251');
    await page.waitForTimeout(1000);
  }

  const salesOrderScreenshot = path.join(
    'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\3d2f2c0b-8be2-40b2-988e-98ee6fd60d51',
    'sales_order_deduction_verified.png'
  );
  await page.screenshot({ path: salesOrderScreenshot, fullPage: true });
  console.log(`   Saved screenshot: ${salesOrderScreenshot}`);

  // 5. Check Finance Sales Confirmation / Payments
  console.log('\n5. Navigating to /finance/sales-confirmation...');
  await page.goto('http://localhost:3000/finance/sales-confirmation', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const financeSearchInput = page.locator('input[placeholder*="Search"]').first();
  if (await financeSearchInput.isVisible()) {
    await financeSearchInput.fill('0251');
    await page.waitForTimeout(1000);
  }

  const financeSalesScreenshot = path.join(
    'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\3d2f2c0b-8be2-40b2-988e-98ee6fd60d51',
    'finance_sales_deduction_verified.png'
  );
  await page.screenshot({ path: financeSalesScreenshot, fullPage: true });
  console.log(`   Saved screenshot: ${financeSalesScreenshot}`);

  console.log('\n--- PLAYWRIGHT VERIFICATION FINISHED SUCCESSFULLY! ---');
  await browser.close();
}

main().catch(err => {
  console.error('TEST SCRIPT FAILED:', err);
  process.exit(1);
});
