const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\df4eb4aa-ff83-4954-9ea6-fad059d2b490';

async function main() {
  console.log('=== STARTING TEST: PO-WISE PARTIAL DELIVERY ACCORDION ===\n');

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

  // Capture Main PO-wise view
  const shot1 = path.join(artifactDir, 'po_wise_partial_delivery_main.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('✓ Captured PO-wise Partial Delivery Main Screen:', shot1);

  // 3. Verify PO-level Accordion rows
  const poCards = page.locator('.pd-po-accordion');
  const count = await poCards.count();
  console.log(`\nFound ${count} Partial Purchase Orders:`);

  for (let i = 0; i < count; i++) {
    const poHeader = await poCards.nth(i).locator('.pd-po-row-header').textContent();
    console.log(`  PO #${i + 1}:`, poHeader.replace(/\s+/g, ' ').trim().slice(0, 160));
  }

  // 4. Verify nested Material-wise breakdown for the first PO
  if (count > 0) {
    console.log('\n4. Verifying Expanded Material-wise breakdown for first PO...');
    const firstPO = poCards.first();
    const materialRows = firstPO.locator('.pd-nested-table tbody tr');
    const matCount = await materialRows.count();
    console.log(`First PO contains ${matCount} material lines:`);

    for (let j = 0; j < matCount; j++) {
      const rowText = await materialRows.nth(j).textContent();
      console.log(`    Material ${j + 1}:`, rowText.replace(/\s+/g, ' ').trim());
    }

    const summaryFooter = await firstPO.locator('.pd-po-footer-summary').textContent();
    console.log('\nFirst PO Summary Footer:', summaryFooter.replace(/\s+/g, ' ').trim());

    // Capture expanded detail screenshot
    const shot2 = path.join(artifactDir, 'po_wise_partial_delivery_expanded.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log('✓ Captured PO-wise Expanded Materials Screenshot:', shot2);

    // 5. Test Toggling / Collapsing
    console.log('\n5. Testing collapse toggle on first PO...');
    await firstPO.locator('.pd-po-row-header').click();
    await page.waitForTimeout(800);
    const isStillExpanded = await firstPO.locator('.pd-po-nested-area').count() > 0;
    console.log(`After click, first PO is expanded: ${isStillExpanded}`);

    // Click again to re-expand
    await firstPO.locator('.pd-po-row-header').click();
    await page.waitForTimeout(800);
  }

  // 6. Test Cards View
  console.log('\n6. Testing Cards Layout View toggle...');
  const cardsBtn = page.locator('.pd-view-btn[title*="Cards"], .pd-view-btn').nth(1);
  if (await cardsBtn.count() > 0) {
    await cardsBtn.click();
    await page.waitForTimeout(1000);
    const shot3 = path.join(artifactDir, 'po_wise_partial_delivery_cards.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log('✓ Captured Cards View Screenshot:', shot3);
  }

  console.log('\n--- VERIFICATION RESULT ---');
  console.log('Total Console/Page Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  } else {
    console.log('✓ SUCCESS: ZERO errors detected in PO-wise Partial Delivery workflow!');
  }

  await browser.close();
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
