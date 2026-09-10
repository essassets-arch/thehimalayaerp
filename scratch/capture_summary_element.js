const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
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
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');

  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(async () => {
    await page.waitForTimeout(3000);
  });

  // Navigate to Finance Pending Requests
  await page.goto('http://localhost:3000/finance/po-requests?tab=Pending%20Requests');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Select the 5 items
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
    }
  }

  // Click Create PO
  await page.locator('button:has-text("Create Purchase Order")').click();
  await page.waitForTimeout(1000);

  // Fill the 5 rates
  const rateInputs = page.locator('input[placeholder="Rate per unit"]');
  const rateValues = ['94', '85', '95', '450', '520'];
  for (let i = 0; i < rateValues.length; i++) {
    await rateInputs.nth(i).fill(rateValues[i]);
  }

  // Select 0% Non-GST
  await page.locator('button:has-text("No (0% Non-GST)")').click();
  await page.waitForTimeout(500);

  // Scroll the Order Summary Calculation into view
  const summary = page.locator('div:has-text("Order Summary Calculation")').last();
  await summary.scrollIntoViewIfNeeded();

  // Capture screenshot of summary box and buttons
  const screenshotPath = path.join(artifactDir, 'order_summary_calculation_card.png');
  await summary.screenshot({ path: screenshotPath });
  console.log('Saved order_summary_calculation_card.png');

  // Also full viewport after scroll
  await page.screenshot({ path: path.join(artifactDir, 'create_po_scrolled_calculation.png') });
  console.log('Saved create_po_scrolled_calculation.png');

  await context.close();
  await browser.close();
})();
