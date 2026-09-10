const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

async function main() {
  console.log('=== STARTING BROWSER UI VERIFICATION ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 28.6139, longitude: 77.2090 }
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();

  // 1. Log in as Super Admin / Auditor
  console.log('1. Logging in to ERP...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  // 2. Visit Store Verify Delivery Page
  console.log('\n2. Navigating to Store Verify Delivery (/store/purchase?tab=Verify%20Delivery)...');
  await page.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  const storeShot = path.join(artifactDir, 'store_verify_delivery_screen.png');
  await page.screenshot({ path: storeShot, fullPage: false });
  console.log('✓ Captured Store Verify Delivery screenshot:', storeShot);

  // 3. Visit Finance Delivery Audit Page
  console.log('\n3. Navigating to Finance Delivery Audit (/finance/po-requests?tab=Delivery%20Audit)...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Delivery%20Audit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  const financeListShot = path.join(artifactDir, 'finance_delivery_audit_list.png');
  await page.screenshot({ path: financeListShot, fullPage: false });
  console.log('✓ Captured Finance Delivery Audit List screenshot:', financeListShot);

  // 4. Click Review & Audit on first pending GRN card
  console.log('\n4. Inspecting Pending Audit Detail View...');
  const auditBtn = page.locator('.da-audit-btn, button:has-text("Review & Audit"), button:has-text("Audit")').first();
  const hasAuditBtn = await auditBtn.count();

  if (hasAuditBtn > 0) {
    await auditBtn.click();
    await page.waitForTimeout(1500);

    const financeDetailShot = path.join(artifactDir, 'finance_delivery_audit_detail.png');
    await page.screenshot({ path: financeDetailShot, fullPage: false });
    console.log('✓ Captured Finance Delivery Audit Detail screenshot:', financeDetailShot);

    // Verify Action Buttons exist
    const approveBtn = page.locator('.da-btn-approve, button:has-text("Accept & Close PO")');
    const rejectBtn = page.locator('.da-btn-reject, button:has-text("Reject Audit")');
    const returnBtn = page.locator('.da-btn-return, button:has-text("Return for Correction")');

    console.log('Approve button visible:', await approveBtn.isVisible());
    console.log('Reject button visible:', await rejectBtn.isVisible());
    console.log('Return button visible:', await returnBtn.isVisible());

    // Back to list
    const backBtn = page.locator('.da-back-button, button:has-text("Back")').first();
    if (await backBtn.count()) {
      await backBtn.click();
      await page.waitForTimeout(1000);
    }
  } else {
    console.log('No pending GRNs in list; checking card container.');
  }

  // 5. Check History Tab
  console.log('\n5. Inspecting Audit History Tab...');
  const historyTab = page.locator('.da-tab:has-text("Audit History"), .da-tab:has-text("History")').first();
  if (await historyTab.count()) {
    await historyTab.click();
    await page.waitForTimeout(1500);

    const historyShot = path.join(artifactDir, 'finance_delivery_audit_history.png');
    await page.screenshot({ path: historyShot, fullPage: false });
    console.log('✓ Captured Finance Delivery Audit History screenshot:', historyShot);
  }

  await browser.close();
  console.log('\n=== BROWSER VERIFICATION COMPLETED SUCCESSFULLY ===\n');
}

main().catch(err => {
  console.error('Browser verification error:', err);
  process.exit(1);
});
