const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\df4eb4aa-ff83-4954-9ea6-fad059d2b490';

async function main() {
  console.log('=== STARTING TEST: SIDEBAR PARTIAL DELIVERY & FULFILLMENT COLUMN REMOVAL ===\n');

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
      console.log('PAGE CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log('PAGE EXCEPTION:', err.message);
  });

  console.log('1. Logging in as Super Admin...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('2. Navigating to /finance/po-requests?tab=Partial%20Delivery...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3500);

  // 3. Check Sidebar Navigation Items
  console.log('\n3. Checking Sidebar Navigation items...');
  const sidebarSubNavItems = page.locator('.sidebar .sub-nav-item');
  const subNavCount = await sidebarSubNavItems.count();
  console.log(`Found ${subNavCount} sub-nav items in the sidebar.`);
  
  let partialDeliverySubItemFound = false;
  let partialDeliveryIsActive = false;

  for (let i = 0; i < subNavCount; i++) {
    const item = sidebarSubNavItems.nth(i);
    const text = (await item.textContent()).trim();
    const href = await item.getAttribute('href');
    const className = await item.getAttribute('class');
    const isActive = className.includes('active');
    console.log(`  Sidebar item [${i}]: "${text}" -> href: "${href}", active: ${isActive}`);
    if (text.toLowerCase().includes('partial delivery')) {
      partialDeliverySubItemFound = true;
      partialDeliveryIsActive = isActive;
    }
  }

  console.log(`\nSidebar 'Partial Delivery' item found: ${partialDeliverySubItemFound}`);
  console.log(`Sidebar 'Partial Delivery' item is active: ${partialDeliveryIsActive}`);

  // 4. Check nested Material Table headers
  console.log('\n4. Checking Nested Material Table in Partial Delivery view...');
  const poAccordions = page.locator('.pd-po-accordion');
  const poCount = await poAccordions.count();
  console.log(`Found ${poCount} PO accordions.`);

  if (poCount > 0) {
    const firstPO = poAccordions.first();
    const thLocator = firstPO.locator('.pd-nested-table thead th');
    const thCount = await thLocator.count();
    const thTexts = [];
    for (let i = 0; i < thCount; i++) {
      thTexts.push((await thLocator.nth(i).textContent()).trim());
    }
    console.log('Nested Table Column Headers:', thTexts);

    const hasFulfillmentColumn = thTexts.some(t => t.toLowerCase().includes('fulfillment'));
    console.log(`Does the nested table contain 'Fulfillment' column? ${hasFulfillmentColumn}`);

    // Check cells count in each row matches headers count
    const rows = firstPO.locator('.pd-nested-table tbody tr');
    const rowCount = await rows.count();
    console.log(`Number of material rows: ${rowCount}`);
    for (let r = 0; r < rowCount; r++) {
      const tdCount = await rows.nth(r).locator('td').count();
      console.log(`  Row ${r + 1} td count: ${tdCount} (th count: ${thCount})`);
      if (tdCount !== thCount) {
        console.error(`  MISMATCH in row ${r + 1}: ${tdCount} tds vs ${thCount} ths!`);
      }
    }
  }

  // Capture screenshot of the sidebar and table
  const shotPath = path.join(artifactDir, 'sidebar_and_table_no_fulfillment.png');
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log('\n✓ Saved verification screenshot to:', shotPath);

  // 5. Click a different tab in sidebar or main tabs, then click Partial Delivery in sidebar
  console.log('\n5. Testing navigation via Sidebar click...');
  const approvedPOsSidebar = page.locator('.sidebar .sub-nav-item:has-text("Approved POs")');
  if (await approvedPOsSidebar.count() > 0) {
    console.log('Clicking "Approved POs" in sidebar...');
    await approvedPOsSidebar.first().click();
    await page.waitForTimeout(2000);
    console.log('Current URL after click:', page.url());

    const partialDeliverySidebar = page.locator('.sidebar .sub-nav-item:has-text("Partial Delivery")');
    console.log('Clicking "Partial Delivery" in sidebar...');
    await partialDeliverySidebar.first().click();
    await page.waitForTimeout(2500);
    console.log('Current URL after clicking Partial Delivery:', page.url());

    const isPartialViewVisible = await page.locator('.pd-container').count() > 0;
    console.log('Is Partial Delivery container visible after sidebar navigation?', isPartialViewVisible);
  }

  console.log('\nConsole Errors during test:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }

  await browser.close();
  console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
