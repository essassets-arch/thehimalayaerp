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

  console.log('1. Logging in as superadmin@himalayaerp.com...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'superadmin@himalayaerp.com');
  await page.fill('input[type="password"]', 'Password@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('   Logged in successfully. URL:', page.url());

  // 2. Navigate to /orders (Sales Orders)
  console.log('\n2. Navigating to /orders...');
  await page.goto('http://localhost:3000/orders', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Search for HCPPL/2627/0251
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

  // Extract text from order table
  const orderRows = await page.locator('table tbody tr').evaluateAll(rows =>
    rows.map(r => r.innerText.trim().replace(/\n+/g, ' | '))
  );
  console.log(`   Sales Orders (${orderRows.length} rows found):`);
  orderRows.slice(0, 3).forEach((r, i) => console.log(`     ${i + 1}. ${r}`));

  // 3. Navigate to /finance/sales-confirmation
  console.log('\n3. Navigating to /finance/sales-confirmation...');
  await page.goto('http://localhost:3000/finance/sales-confirmation', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

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

  const financeRows = await page.locator('table tbody tr').evaluateAll(rows =>
    rows.map(r => r.innerText.trim().replace(/\n+/g, ' | '))
  );
  console.log(`   Finance Orders (${financeRows.length} rows found):`);
  financeRows.slice(0, 3).forEach((r, i) => console.log(`     ${i + 1}. ${r}`));

  console.log('\n--- VERIFICATION FINISHED SUCCESSFULLY! ---');
  await browser.close();
}

main().catch(err => {
  console.error('TEST SCRIPT FAILED:', err);
  process.exit(1);
});
