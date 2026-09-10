const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\5700c2fd-29b6-4d85-8f1a-3e6a1ae00d49';

async function main() {
  console.log('=== FINAL AUDIT: DYNAMIC VENDORS ACROSS ALL PORTALS ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 28.6139, longitude: 77.2090 },
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();

  console.log('1. Logging in as super.admin@himalayaerp.com...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  // 2. Test Finance PO Creation Vendor Options
  console.log('2. Opening Finance PO Creation...');
  await page.goto('http://localhost:3000/finance/po-requests');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Select an indent item and click Create Purchase Order
  const itemCheck = page.locator('input[type="checkbox"]').nth(1);
  if (await itemCheck.isVisible()) {
    await itemCheck.check();
    await page.waitForTimeout(500);
  }

  const createBtn = page.locator('button:has-text("Create Purchase Order")').first();
  if (await createBtn.isVisible() && await createBtn.isEnabled()) {
    await createBtn.click();
    await page.waitForTimeout(1500);

    const datalistOptions = await page.$$eval('#vendor-options option', (options) =>
      options.map((opt) => opt.value)
    );
    console.log('Vendors available in Finance PO creation:', datalistOptions);

    const hasStatic = datalistOptions.some(v =>
      v.toLowerCase().includes('default supplier') ||
      v.toLowerCase().includes('global tech') ||
      v.toLowerCase().includes('selected vendor')
    );
    console.log('Any static/dummy vendors in PO creation datalist:', hasStatic);

    const shot1 = path.join(artifactDir, 'finance_po_create_dynamic_vendors.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log('✓ Captured Finance PO Create view:', shot1);
  }

  // 3. Test Plant Head Purchase Approvals
  console.log('\n3. Checking Plant Head Purchase Approvals (/plant-head/purchase-approvals)...');
  await page.goto('http://localhost:3000/plant-head/purchase-approvals');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  const phShot = path.join(artifactDir, 'plant_head_purchase_approvals_clean.png');
  await page.screenshot({ path: phShot, fullPage: false });
  console.log('✓ Captured Plant Head Purchase Approvals:', phShot);

  const phContent = await page.content();
  console.log('Plant Head page contains "Default Supplier":', phContent.includes('Default Supplier'));
  console.log('Plant Head page contains "Selected Vendor":', phContent.includes('Selected Vendor'));

  // 4. Test Store Purchase View (/store/purchase)
  console.log('\n4. Checking Store Purchase View (/store/purchase)...');
  await page.goto('http://localhost:3000/store/purchase');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  const storeShot = path.join(artifactDir, 'store_purchase_clean.png');
  await page.screenshot({ path: storeShot, fullPage: false });
  console.log('✓ Captured Store Purchase View:', storeShot);

  const storeContent = await page.content();
  console.log('Store Purchase page contains "Default Supplier":', storeContent.includes('Default Supplier'));
  console.log('Store Purchase page contains "Global Tech Suppliers":', storeContent.includes('Global Tech Suppliers'));

  console.log('\n=== ALL AUDIT CHECKS FINISHED ===');
  await browser.close();
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
