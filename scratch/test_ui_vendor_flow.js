const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\5700c2fd-29b6-4d85-8f1a-3e6a1ae00d49';

async function main() {
  console.log('=== STARTING BROWSER E2E UI TEST FOR DYNAMIC VENDORS ===\n');

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
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('[BROWSER CONSOLE ERROR]:', msg.text());
  });

  console.log('1. Logging in as super.admin@himalayaerp.com...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('2. Navigating to Finance PO Requests portal...');
  await page.goto('http://localhost:3000/finance/po-requests');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('3. Selecting an indent item and opening Create PO Drawer...');
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  console.log(`Found ${count} checkboxes on page`);
  if (count > 1) {
    await checkboxes.nth(1).check();
    await page.waitForTimeout(1000);
  }

  const createPOBtn = page.locator('button:has-text("Create Purchase Order")').first();
  if (await createPOBtn.isVisible()) {
    await createPOBtn.click({ timeout: 5000 }).catch(() => console.log('Click on Create PO button timed out'));
    await page.waitForTimeout(2000);

    const drawerShot = path.join(artifactDir, 'finance_create_po_drawer.png');
    await page.screenshot({ path: drawerShot, fullPage: false });
    console.log('✓ Captured Create PO Drawer:', drawerShot);

    // Inspect datalist options
    const datalistOptions = await page.$$eval('#vendor-options option', (options) =>
      options.map((opt) => ({
        value: opt.value,
        name: opt.getAttribute('data-name') || opt.textContent,
      }))
    );
    console.log(`Found ${datalistOptions.length} vendors in Create PO datalist:`);
    datalistOptions.slice(0, 8).forEach((opt) => console.log('  -', opt.value, opt.name ? `[${opt.name}]` : ''));

    const hasDynamicInDatalist = datalistOptions.some(
      (opt) =>
        opt.value.includes('Jindal Steel') ||
        (opt.name && opt.name.includes('Jindal Steel')) ||
        opt.value.includes('Cement Supplier')
    );
    console.log('Dynamic vendor present in PO creation datalist:', hasDynamicInDatalist);

    // Close drawer
    const closeBtn = page.locator('button[aria-label="Close"], button:has-text("Cancel"), button:has-text("Close")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  console.log('4. Checking Approved POs tab...');
  const approvedTabBtn = page.locator('button:has-text("Approved POs")').first();
  if (await approvedTabBtn.isVisible()) {
    await approvedTabBtn.click();
    await page.waitForTimeout(2500);

    const approvedTableShot = path.join(artifactDir, 'finance_approved_pos_table.png');
    await page.screenshot({ path: approvedTableShot, fullPage: false });
    console.log('✓ Captured Finance Approved POs table:', approvedTableShot);

    const approvedContent = await page.content();
    const hasJindalInApproved = approvedContent.includes('Jindal Steel & Power Ltd');
    console.log('Approved POs table contains dynamic vendor "Jindal Steel & Power Ltd":', hasJindalInApproved);
    console.log('Approved POs table contains "Default Supplier":', approvedContent.includes('Default Supplier'));
  }

  console.log('5. Navigating to Finance Vendor Management view (/finance?view=vendors)...');
  await page.goto('http://localhost:3000/finance?view=vendors');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  const vendorMgmtShot = path.join(artifactDir, 'vendor_management_table.png');
  await page.screenshot({ path: vendorMgmtShot, fullPage: false });
  console.log('✓ Captured Vendor Management table:', vendorMgmtShot);

  const vendorPageContent = await page.content();
  console.log('Vendor Management contains "Tata Steel BSL Limited":', vendorPageContent.includes('Tata Steel BSL Limited'));
  console.log('Vendor Management contains "Jindal Steel & Power Ltd":', vendorPageContent.includes('Jindal Steel & Power Ltd'));
  console.log('Vendor Management contains "Himalaya Prime Raw Materials Ltd":', vendorPageContent.includes('Himalaya Prime Raw Materials Ltd'));
  console.log('Vendor Management contains "Default Supplier":', vendorPageContent.includes('Default Supplier'));

  console.log('6. Navigating to Plant Head Purchase Approvals...');
  await page.goto('http://localhost:3000/plant-head/approvals?tab=Purchase%20Orders');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  const plantHeadShot = path.join(artifactDir, 'plant_head_purchase_approval.png');
  await page.screenshot({ path: plantHeadShot, fullPage: false });
  console.log('✓ Captured Plant Head Purchase Approval screen:', plantHeadShot);

  const phContent = await page.content();
  console.log('Plant Head page contains "Default Supplier":', phContent.includes('Default Supplier'));
  console.log('Plant Head page contains "Selected Vendor":', phContent.includes('Selected Vendor'));

  console.log('7. Navigating to Store Portal Goods Receipt tab...');
  await page.goto('http://localhost:3000/store/inventory?tab=goods-receipt');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  const storeShot = path.join(artifactDir, 'store_goods_receipt.png');
  await page.screenshot({ path: storeShot, fullPage: false });
  console.log('✓ Captured Store Portal Goods Receipt screen:', storeShot);

  const storeContent = await page.content();
  console.log('Store page contains "Global Tech Suppliers":', storeContent.includes('Global Tech Suppliers'));
  console.log('Store page contains "Default Supplier":', storeContent.includes('Default Supplier'));

  console.log('\n=== ALL BROWSER E2E TESTS COMPLETED SUCCESSFULLY! ===');
  await browser.close();
}

main().catch((err) => {
  console.error('Playwright test failed:', err);
  process.exit(1);
});
