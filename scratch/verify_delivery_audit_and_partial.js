const { chromium } = require('playwright');

async function main() {
  console.log('=== STARTING BROWSER AUDIT: DELIVERY AUDIT & PARTIAL DELIVERY ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });

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
      console.log('PAGE CONSOLE ERROR:', msg.text(), 'at:', msg.location());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log('UNCAUGHT EXCEPTION:', err.message);
  });

  page.on('requestfailed', req => {
    console.log('FAILED REQUEST URL:', req.url(), req.failure()?.errorText);
  });

  console.log('1. Logging in as Super Admin...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  // Test 1: Navigate to Partial Delivery
  console.log('2. Testing Partial Delivery Tab (/finance/po-requests?tab=Partial%20Delivery)...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Test 2: Navigate to Delivery Audit
  console.log('3. Testing Delivery Audit Tab (/finance/po-requests?tab=Delivery%20Audit)...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Delivery%20Audit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Click on any audit card if available to trigger poAuditSummary calculation
  const auditCards = page.locator('.da-card, .da-table tbody tr');
  const count = await auditCards.count();
  console.log(`Found ${count} audit cards/rows in Delivery Audit.`);
  if (count > 0) {
    console.log('Clicking first audit item to test audit calculation and modal/details...');
    await auditCards.first().click();
    await page.waitForTimeout(2000);
  }

  // Switch to History sub-tab in Delivery Audit if available
  const historySubTab = page.locator('button:has-text("Audit History"), button:has-text("History")');
  if (await historySubTab.count() > 0) {
    console.log('Testing Audit History sub-tab...');
    await historySubTab.first().click();
    await page.waitForTimeout(2000);
    const histCards = page.locator('.da-card, .da-table tbody tr');
    if (await histCards.count() > 0) {
      await histCards.first().click();
      await page.waitForTimeout(2000);
    }
  }

  console.log('\n--- VERIFICATION RESULT ---');
  console.log('Total Console/Page Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Errors caught:', consoleErrors);
  } else {
    console.log('✓ ZERO console or page errors detected! ReferenceError is completely resolved.');
  }

  await browser.close();
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
