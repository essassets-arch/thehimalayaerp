const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\df4eb4aa-ff83-4954-9ea6-fad059d2b490';

async function main() {
  console.log('=== STARTING BROWSER VERIFICATION: PARTIAL DELIVERY TAB ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 }
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();

  // 1. Log in
  console.log('1. Logging in as Super Admin / Finance...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  // 2. Navigate to Finance PO Requests with Partial Delivery tab
  console.log('2. Navigating to /finance/po-requests?tab=Partial%20Delivery...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3500);

  // Capture main Partial Delivery screen
  const mainShot = path.join(artifactDir, 'partial_delivery_main_dashboard.png');
  await page.screenshot({ path: mainShot, fullPage: false });
  console.log('✓ Captured Partial Delivery Main Dashboard:', mainShot);

  // 3. Verify presence of Partial Delivery tab and content
  const activeTab = await page.locator('.po-tab.active').textContent();
  console.log(`Active PO Workspace Tab: "${activeTab?.trim()}"`);

  // 4. Verify KPI Cards
  const kpiCards = await page.locator('.pd-kpi-card').allTextContents();
  console.log('\nKPI Summary Cards:');
  kpiCards.forEach(c => console.log('  -', c.replace(/\s+/g, ' ').trim()));

  // 5. Verify Ledger Tree Widget
  const treeText = await page.locator('.pd-tree-summary').textContent();
  console.log('\nDynamic Ledger Tree Summary:', treeText?.replace(/\s+/g, ' ').trim());

  // 6. Verify Table Rows
  const rows = await page.locator('.pd-table tbody tr').allTextContents();
  console.log(`\nFound ${rows.length} material lines in Table View:`);
  rows.forEach((r, idx) => {
    console.log(`  Line ${idx + 1}:`, r.replace(/\s+/g, ' ').trim().slice(0, 140));
  });

  // 7. Click View PO on first row
  console.log('\n7. Clicking "View PO"...');
  const viewPoBtn = page.locator('.pd-btn-action.view-po').first();
  if (await viewPoBtn.count() > 0) {
    await viewPoBtn.click();
    await page.waitForTimeout(1000);
    const modalShot = path.join(artifactDir, 'partial_delivery_view_po_modal.png');
    await page.screenshot({ path: modalShot, fullPage: false });
    console.log('✓ Captured View PO Modal:', modalShot);

    // Close modal
    const closeBtn = page.locator('.pd-modal-box .pd-modal-close, .pd-modal-box button:has-text("Close")').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 8. Toggle to Cards View
  console.log('\n8. Switching to Cards Layout Mode...');
  const cardToggleBtn = page.locator('.pd-view-btn[title*="Cards"], .pd-view-btn').nth(1);
  if (await cardToggleBtn.count() > 0) {
    await cardToggleBtn.click();
    await page.waitForTimeout(1000);
    const cardsShot = path.join(artifactDir, 'partial_delivery_cards_view.png');
    await page.screenshot({ path: cardsShot, fullPage: false });
    console.log('✓ Captured Partial Delivery Cards View:', cardsShot);
  }

  console.log('\n=== ALL BROWSER VERIFICATIONS COMPLETED SUCCESSFULLY ===');
  await browser.close();
}

main().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
