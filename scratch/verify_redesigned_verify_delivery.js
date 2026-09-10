const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  console.log('=== STARTING REDESIGNED STORE VERIFY DELIVERY TEST ===');

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

  // Login
  console.log('1. Logging in as Super Admin...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');

  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(async () => {
    await page.waitForTimeout(3000);
  });

  // Navigate to Store Verify Delivery
  console.log('2. Navigating to Store Verify Delivery...');
  await page.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // If Verify Delivery tab button is visible, click to ensure it's active
  const verifyTabBtn = page.locator('button:has-text("Verify Delivery")').first();
  if (await verifyTabBtn.isVisible()) {
    await verifyTabBtn.click();
    await page.waitForTimeout(1500);
  }

  // Screenshot 1: Redesigned Overview with KPI cards & Grid view
  const shot1 = path.join(artifactDir, 'redesigned_store_delivery_overview.png');
  await page.screenshot({ path: shot1, fullPage: true });
  console.log(`   Captured: ${shot1}`);

  // Test Table View Toggle
  console.log('3. Testing Table View toggle...');
  const tableToggleBtn = page.locator('button[title="Table View"]').first();
  if (await tableToggleBtn.isVisible()) {
    await tableToggleBtn.click();
    await page.waitForTimeout(1000);
    const shot2 = path.join(artifactDir, 'redesigned_store_delivery_table_view.png');
    await page.screenshot({ path: shot2, fullPage: true });
    console.log(`   Captured: ${shot2}`);

    // Switch back to Grid View
    const gridToggleBtn = page.locator('button[title="Grid View"]').first();
    await gridToggleBtn.click();
    await page.waitForTimeout(1000);
  }

  // Click on the first PO card to open inspection workspace
  console.log('4. Selecting first PO delivery card...');
  const firstCard = page.locator('.delivery-po-card').first();
  if (await firstCard.isVisible()) {
    await firstCard.click();
    await page.waitForTimeout(2000);

    // Screenshot 3: Inspection Initial View
    const shot3 = path.join(artifactDir, 'redesigned_store_delivery_inspection_initial.png');
    await page.screenshot({ path: shot3, fullPage: true });
    console.log(`   Captured: ${shot3}`);

    // Test "⚡ Auto-Fill Full Delivery" accelerator
    console.log('5. Testing ⚡ Auto-Fill Full Delivery accelerator...');
    const autoFillBtn = page.locator('button:has-text("Auto-Fill Full Delivery")').first();
    if (await autoFillBtn.isVisible()) {
      await autoFillBtn.click();
      await page.waitForTimeout(1000);

      // Fill Challan and Vehicle numbers
      const challanInput = page.locator('input[placeholder*="DC-"]').first();
      if (await challanInput.isVisible()) {
        await challanInput.fill('DC-2026-9841');
      }

      const vehicleInput = page.locator('input[placeholder*="MH-"]').first();
      if (await vehicleInput.isVisible()) {
        await vehicleInput.fill('MH-12-AB-9988');
      }

      const shot4 = path.join(artifactDir, 'redesigned_store_delivery_autofilled.png');
      await page.screenshot({ path: shot4, fullPage: true });
      console.log(`   Captured: ${shot4}`);
    }
  }

  console.log('=== REDESIGNED STORE VERIFY DELIVERY TEST COMPLETE ===');
  await browser.close();
})().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
