const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\df4eb4aa-ff83-4954-9ea6-fad059d2b490';

async function main() {
  console.log('=== STARTING TEST: STORE DELIVERY HISTORY INDENT ID COLUMN ===\n');

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

  // Navigate to Store Purchase -> Delivery History
  console.log('Navigating to http://localhost:3000/store/purchase?tab=Delivery%20History ...');
  await page.goto('http://localhost:3000/store/purchase?tab=Delivery%20History');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3500);

  // Verify headers
  const headers = await page.locator('table thead th').allInnerTexts();
  console.log('Table Headers:', headers.map(h => h.trim().replace(/\s+/g, ' ')));

  const hasIndentHeader = headers.some(h => h.includes('INDENT ID') || h.includes('Indent ID'));
  console.log(`Has Indent ID header: ${hasIndentHeader}`);

  // Check first few rows
  const rows = page.locator('table tbody tr');
  const rowCount = await rows.count();
  console.log(`Found ${rowCount} delivery rows in table.`);

  if (rowCount > 0) {
    const firstRowCells = await rows.first().locator('td').allInnerTexts();
    console.log('First row cells:', firstRowCells.map(c => c.trim().replace(/\s+/g, ' ')));
  }

  // Capture screenshot of Store Delivery History table
  await page.screenshot({
    path: path.join(artifactDir, 'store_delivery_history_indent_column.png'),
    fullPage: false
  });
  console.log('Saved store_delivery_history_indent_column.png');

  // Open Details Modal for first row
  const detailsBtn = page.locator('button:has-text("Details")').first();
  if (await detailsBtn.isVisible()) {
    console.log('Clicking Details button on first delivery row...');
    await detailsBtn.click();
    await page.waitForTimeout(1000);

    const modalHeader = page.locator('text=Goods Receipt Note (GRN) Manifest').first();
    console.log(`Details modal visible: ${await modalHeader.isVisible()}`);

    const indentRefLabel = page.locator('text=Purchase Indent Ref').first();
    console.log(`Purchase Indent Ref visible in modal: ${await indentRefLabel.isVisible()}`);

    await page.screenshot({
      path: path.join(artifactDir, 'store_delivery_history_modal_indent.png'),
      fullPage: false
    });
    console.log('Saved store_delivery_history_modal_indent.png');
  }

  // Also check Finance Partial Delivery History tab
  console.log('\nNavigating to /finance/po-requests?tab=Partial%20Delivery&subtab=history ...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery&subtab=history');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const financeHeaders = await page.locator('.pd-history-box table thead th').allInnerTexts();
  console.log('Finance History Tab Headers:', financeHeaders.map(h => h.trim().replace(/\s+/g, ' ')));

  await page.screenshot({
    path: path.join(artifactDir, 'finance_partial_delivery_indent_column.png'),
    fullPage: false
  });
  console.log('Saved finance_partial_delivery_indent_column.png');

  console.log('\nConsole error count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console errors:', consoleErrors);
  }

  await browser.close();
  console.log('\n=== STORE DELIVERY HISTORY TEST COMPLETE ===');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
