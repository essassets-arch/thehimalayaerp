const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  console.log('=== VERIFYING EMPTY RATES & ACCURATE ORDER SUMMARY CALCULATION ===');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
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

  // Navigate to Finance Pending Requests
  console.log('2. Navigating to Finance PO Requests (Pending Requests tab)...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Pending%20Requests');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Select the 5 items described by user
  console.log('3. Selecting the 5 materials...');
  const materialsToSelect = [
    'WATER PAPER 150',
    'sdecf',
    'WATER PAPER 120',
    'BENJO WAX POLISH',
    'WHITE WAX POLISH'
  ];

  for (const mat of materialsToSelect) {
    const row = page.locator(`tr:has-text("${mat}")`).first();
    if (await row.count() > 0) {
      await row.locator('input[type="checkbox"]').check();
      console.log(`   Checked: ${mat}`);
    } else {
      console.log(`   Warning: Could not find row for ${mat}`);
    }
  }

  // Click Create Purchase Order button
  const createBtn = page.locator('button:has-text("Create Purchase Order")');
  console.log('   Create PO Button text:', await createBtn.innerText());
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Verify that all Material Rate inputs are initially empty
  console.log('4. Verifying Material Rate inputs are initially EMPTY...');
  const rateInputs = page.locator('input[placeholder="Rate per unit"]');
  const count = await rateInputs.count();
  console.log(`   Found ${count} rate inputs.`);

  for (let i = 0; i < count; i++) {
    const val = await rateInputs.nth(i).inputValue();
    console.log(`   Input ${i + 1} value: "${val}" (isEmpty: ${val === ''})`);
  }

  // Check initial subtotal
  const initialSubtotal = await page.locator('div:has-text("Material Subtotal:") + span, span:has-text("Material Subtotal:") ~ span').first().innerText().catch(() => '');
  console.log('   Initial Subtotal text:', initialSubtotal);

  // Enter the rates:
  // WATER PAPER 150 -> 94
  // sdecf -> 85
  // WATER PAPER 120 -> 95
  // BENJO WAX POLISH -> 450
  // WHITE WAX POLISH -> 520
  console.log('5. Entering rates: 94, 85, 95, 450, 520...');
  const rateValues = ['94', '85', '95', '450', '520'];
  for (let i = 0; i < Math.min(count, rateValues.length); i++) {
    await rateInputs.nth(i).fill(rateValues[i]);
  }

  // Toggle GST to "No (0% Non-GST)"
  console.log('6. Selecting No (0% Non-GST)...');
  await page.locator('button:has-text("No (0% Non-GST)")').click();
  await page.waitForTimeout(500);

  // Verify Line Totals
  console.log('7. Verifying line totals and calculations...');
  const lineTotalElements = await page.locator('div[style*="display: grid"]:has(input[placeholder="Rate per unit"])').all();
  for (let i = 0; i < lineTotalElements.length; i++) {
    const text = await lineTotalElements[i].innerText();
    console.log(`   Row ${i + 1}: ${text.replace(/\n+/g, ' | ')}`);
  }

  // Read Order Summary Calculation values
  const summaryBox = page.locator('div:has-text("Order Summary Calculation")').last();
  const summaryText = await summaryBox.innerText();
  console.log('   === ORDER SUMMARY CALCULATION ===');
  console.log(summaryText);

  // Take screenshot
  const screenshotPath = path.join(artifactDir, 'order_summary_calculation_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`   Captured screenshot: ${screenshotPath}`);

  // Assertions
  const expectedSubtotal = '₹27,680.00';
  const hasExpectedTotal = summaryText.includes(expectedSubtotal);
  console.log(`   Summary contains expected subtotal ${expectedSubtotal}:`, hasExpectedTotal);

  if (!hasExpectedTotal) {
    console.error('FAILED: Order Summary Calculation did not sum all 5 items correctly!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Order Summary Calculation accurately sums all selected items to ₹27,680.00!');
  }

  await context.close();
  await browser.close();
  console.log('=== TEST COMPLETE ===');
})();
