const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\fd8f5c2d-4532-408a-9e9c-fc3dbcd6f05a';

(async () => {
  console.log('=== VERIFYING PREVIEW & EDIT UI DISPLAY ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 23.8315, longitude: 91.2868, accuracy: 20 },
  });
  const page = await context.newPage();

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(3000);

  const allowBtn = page.locator('button:has-text("Re-check & Allow All")');
  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  // 1. Check Quotations View & Modal Preview for QU/2627/0026
  console.log('1. Navigating to /sales/quotations...');
  await page.goto('http://localhost:3000/sales/quotations');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  // Search by exact quotation number QU/2627/0026
  console.log('Searching for quotation QU/2627/0026...');
  const searchInput = page.locator('input[placeholder*="Search quotations" i]');
  await searchInput.fill('QU/2627/0026');
  await page.waitForTimeout(1500);

  // Click View / Preview icon (Eye icon)
  const viewBtn = page.locator('button:has(.lucide-eye)').first();
  if (await viewBtn.count() > 0) {
    console.log('Opening Quotation Preview Modal...');
    await viewBtn.click();
    await page.waitForTimeout(1500);

    const modalShot = path.join(artifactDir, 'quotation_preview_decimal_quantities.png');
    await page.screenshot({ path: modalShot, fullPage: true });
    console.log(`Saved screenshot: ${modalShot}`);

    const modalContent = await page.content();
    console.log('Preview Modal Checks for QU/2627/0026:');
    console.log('  Shows 1.8:', modalContent.includes('1.8'));
    console.log('  Shows 2.5:', modalContent.includes('2.5'));
    console.log('  Shows 1.25:', modalContent.includes('1.25'));

    // Close preview modal
    const closeBtn = page.locator('button:has-text("Close Preview")');
    if (await closeBtn.count() > 0) await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // 2. Check Leads Directory
  console.log('\n2. Navigating to /sales/leads...');
  await page.goto('http://localhost:3000/sales/leads');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.fill('input[placeholder*="Search leads" i]', 'Decimal Test');
  await page.waitForTimeout(1500);

  // Click on the lead card or details
  const leadRow = page.locator('tr:has-text("Decimal Test"), div:has-text("Decimal Test Infrastructure Ltd")').first();
  if (await leadRow.count() > 0) {
    console.log('Opening Lead details...');
    await leadRow.click();
    await page.waitForTimeout(1500);

    const leadShot = path.join(artifactDir, 'lead_details_decimal_display.png');
    await page.screenshot({ path: leadShot, fullPage: true });
    console.log(`Saved screenshot: ${leadShot}`);

    const leadContent = await page.content();
    console.log('Lead Details Checks:');
    console.log('  Shows 5.55 units:', leadContent.includes('5.55'));
    console.log('  Shows 1.8:', leadContent.includes('1.8'));
    console.log('  Shows 2.5:', leadContent.includes('2.5'));
    console.log('  Shows 1.25:', leadContent.includes('1.25'));
  }

  await browser.close();
  console.log('\n=== PREVIEW VERIFICATION COMPLETE ===');
})();
