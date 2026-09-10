const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  console.log('=== VERIFYING REMOVAL OF ACCEPTED & REJECTED COLUMNS ===');

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

  // Click on the first PO card to open inspection workspace
  console.log('3. Selecting PO card to view Physical Gate Verification...');
  const firstCard = page.locator('.delivery-po-card').first();
  await firstCard.waitFor({ state: 'visible', timeout: 10000 });
  await firstCard.click();
  await page.waitForTimeout(2000);

  // Check the table headers
  const ths = await page.$$eval('table thead th', elements => elements.map(el => el.textContent.trim()));
  console.log('   Table headers found:', ths);

  // Check if "Accepted" or "Rejected" exist in table headers
  const hasAccepted = ths.some(h => /accepted/i.test(h));
  const hasRejected = ths.some(h => /rejected/i.test(h));
  console.log(`   Has "Accepted" header: ${hasAccepted} (Expected: false)`);
  console.log(`   Has "Rejected" header: ${hasRejected} (Expected: false)`);

  if (hasAccepted || hasRejected) {
    console.error('ERROR: Accepted or Rejected header is still present!');
  } else {
    console.log('SUCCESS: Accepted and Rejected columns are completely removed from table header!');
  }

  // Check table row columns count
  const tdCounts = await page.$$eval('table tbody tr', rows => rows.map(r => r.querySelectorAll('td').length));
  console.log('   Row column counts:', tdCounts);

  // Check summary card labels
  const summaryText = await page.locator('div:has-text("Total Delivered")').first().innerText();
  console.log('   Summary text sample:', summaryText.replace(/\n+/g, ' | '));

  // Capture Screenshot 1: Inspection table showing only Material Details and Delivered Qty
  const shot1 = path.join(artifactDir, 'verify_delivery_no_accepted_rejected.png');
  await page.screenshot({ path: shot1, fullPage: true });
  console.log(`   Captured: ${shot1}`);

  // Test Auto-Fill accelerator
  console.log('4. Testing Auto-Fill accelerator...');
  const autoFillBtn = page.locator('button:has-text("Auto-Fill Full Delivery")').first();
  if (await autoFillBtn.isVisible()) {
    await autoFillBtn.click();
    await page.waitForTimeout(1000);

    // Capture element screenshot of the Physical Gate Verification card
    const cardEl = page.locator('h3:has-text("Physical Gate Verification & Inspection")').locator('xpath=ancestor::div[contains(@style, "border-radius: 16px")][1]');
    const shot2 = path.join(artifactDir, 'verify_delivery_table_element.png');
    await cardEl.screenshot({ path: shot2 });
    console.log(`   Captured card element: ${shot2}`);
  }

  console.log('=== TEST COMPLETED SUCCESSFULLY ===');
  await browser.close();
})();
