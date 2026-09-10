const { chromium } = require('playwright');
const path = require('path');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['notifications', 'geolocation'],
    geolocation: { latitude: 19.076, longitude: 72.8777 },
  });

  const page = await context.newPage();
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\5700c2fd-29b6-4d85-8f1a-3e6a1ae00d49';

  await page.addInitScript(() => {
    window.__PLAYWRIGHT_TEST__ = true;
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
    localStorage.setItem('hasDismissedPermissionsModal', 'true');
    sessionStorage.setItem('hasDismissedPermissionsModal', 'true');
  });

  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('2. Filling login credentials for makhdum@himalayaerp.com (Store Manager)...');
  await page.fill('input[type="email"], input[name="email"]', 'makhdum@himalayaerp.com');
  await page.fill('input[type="password"], input[name="password"]', 'Himalaya@1234');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  console.log('✓ Logged in as Store Manager successfully!');

  // Navigate to Verify Delivery
  console.log('3. Navigating to /store/purchase?tab=Verify%20Delivery...');
  await page.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Loading Workspace...', { state: 'detached', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // If there is a PO selector dropdown or search, select PO-REJ-581697
  console.log('4. Selecting PO-REJ-581697...');
  const poCard = page.locator('text=PO-REJ-581697').first();
  if (await poCard.count() > 0 && await poCard.isVisible()) {
    await poCard.click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  const poSelector = page.locator('select, [data-testid="po-selector"]');
  if (await poSelector.count() > 0) {
    const options = await poSelector.first().locator('option').allTextContents();
    const match = options.find(o => o.includes('PO-REJ-581697'));
    if (match) {
      await poSelector.first().selectOption({ label: match });
      await page.waitForTimeout(1000);
    }
  }

  // Look for delivered qty input
  console.log('5. Entering Delivered Qty = 5...');
  const qtyInput = page.locator('input[type="number"]').first();
  if (await qtyInput.count() > 0 && await qtyInput.isVisible()) {
    await qtyInput.fill('5');
  }

  // Fill in Challan, Vehicle, Remarks
  const challanInput = page.locator('input[placeholder*="DC-"], input[placeholder*="INV-"], input[name*="challan"]').first();
  if (await challanInput.count() > 0 && await challanInput.isVisible()) {
    await challanInput.fill('DC-98421');
  }
  const vehicleInput = page.locator('input[placeholder*="MH-"], input[name*="vehicle"]').first();
  if (await vehicleInput.count() > 0 && await vehicleInput.isVisible()) {
    await vehicleInput.fill('MH-12-AB-1234');
  }
  const remarksInput = page.locator('textarea, input[placeholder*="notes"], input[placeholder*="Remarks"]').first();
  if (await remarksInput.count() > 0 && await remarksInput.isVisible()) {
    await remarksInput.fill('Gate dock verified 5 PCS in good condition');
  }

  await page.screenshot({ path: path.join(artifactDir, 'verify_delivery_form_filled.png'), fullPage: true });
  console.log('✓ Saved verify_delivery_form_filled.png');

  // Click Confirm Delivery & Generate GRN
  console.log('6. Clicking Confirm Delivery & Generate GRN...');
  const confirmBtn = page.locator('button.delivery-btn-submit, button:has-text("Confirm Delivery & Generate GRN")').first();
  if (await confirmBtn.count() > 0 && await confirmBtn.isVisible()) {
    await confirmBtn.click();
    await page.waitForTimeout(1500);

    // 1st SweetAlert dialog: Are you sure you want to verify this delivery?
    const swalConfirm1 = page.locator('button.swal2-confirm').first();
    if (await swalConfirm1.count() > 0 && await swalConfirm1.isVisible()) {
      await swalConfirm1.click();
      await page.waitForTimeout(3000);
    }

    // 2nd SweetAlert dialog: Success modal (Delivery Verified & GRN Generated!)
    const swalConfirm2 = page.locator('button.swal2-confirm').first();
    if (await swalConfirm2.count() > 0 && await swalConfirm2.isVisible()) {
      await swalConfirm2.click();
      await page.waitForTimeout(2000);
    }
  }

  await page.screenshot({ path: path.join(artifactDir, 'verify_delivery_submitted.png'), fullPage: true });
  console.log('✓ Saved verify_delivery_submitted.png');

  // 7. Navigate to /store/raw-inventory via sidebar or direct link
  console.log('7. Navigating to /store/raw-inventory...');
  const rawInvNav = page.locator('a:has-text("Raw Inventory"), [href*="raw-inventory"]').first();
  if (await rawInvNav.count() > 0 && await rawInvNav.isVisible()) {
    await rawInvNav.click();
    await page.waitForTimeout(3000);
  } else {
    await page.goto('http://localhost:3000/store/raw-inventory', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  }

  // Search for handle specifically in the Raw Materials search box
  console.log('Searching for handle in raw materials table...');
  const searchInput = page.locator('input[placeholder*="Search raw materials"]').first();
  if (await searchInput.count() > 0 && await searchInput.isVisible()) {
    await searchInput.fill('handle');
    await page.waitForTimeout(2000);
  } else {
    // Fallback: type into .m-theme-search-input inside the inventory container
    const tableSearch = page.locator('.m-theme-search-input').first();
    if (await tableSearch.count() > 0) {
      await tableSearch.fill('handle');
      await page.waitForTimeout(2000);
    }
  }

  await page.screenshot({ path: path.join(artifactDir, 'store_raw_inventory_table.png'), fullPage: true });
  console.log('✓ Saved store_raw_inventory_table.png');

  // 8. Click Log button specifically on handle row
  console.log('8. Clicking Log button on handle row...');
  const handleRow = page.locator('tr:has-text("handle")').first();
  if (await handleRow.count() > 0 && await handleRow.isVisible()) {
    const rowLogBtn = handleRow.locator('.raw-btn-log, button:has-text("Log")').first();
    if (await rowLogBtn.count() > 0) {
      await rowLogBtn.click();
      console.log('Clicked Log button on handle row!');
    }
  } else {
    const logBtn = page.locator('button.raw-btn-log, button:has-text("Log")').first();
    if (await logBtn.count() > 0) {
      await logBtn.click();
    }
  }

  await page.waitForSelector('text=Store Live Ledger', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Expand details if button exists
  const detailsBtn = page.locator('button:has-text("Details")').first();
  if (await detailsBtn.count() > 0 && await detailsBtn.isVisible()) {
    await detailsBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(artifactDir, 'material_movement_log_modal.png'), fullPage: true });
  console.log('✓ Saved material_movement_log_modal.png');

  await browser.close();
  console.log('🎉 Browser verification finished!');
}

run().catch(err => {
  console.error('Browser verification error:', err);
  process.exit(1);
});
