const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  console.log('=== VERIFYING REMOVAL OF CREATE REQUEST BUTTON ===');

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
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(async () => {
    await page.waitForTimeout(3000);
  });

  // Navigate to /store/purchase without any tab parameter
  console.log('Navigating to http://localhost:3000/store/purchase...');
  await page.goto('http://localhost:3000/store/purchase');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const shot = path.join(artifactDir, 'store_purchase_without_create_request.png');
  await page.screenshot({ path: shot, fullPage: true });
  console.log(`Captured screenshot: ${shot}`);

  // Check tab buttons in the horizontal strip
  const pageText = await page.innerText('.store-po-tabs-strip');
  console.log('Tabs strip content:', pageText);
  const hasCreateRequest = pageText.includes('Create Request');
  console.log('Contains "Create Request":', hasCreateRequest);

  // Check that Verify Delivery is visible and active
  const hasVerifyDelivery = pageText.includes('Verify Delivery');
  console.log('Contains "Verify Delivery":', hasVerifyDelivery);

  // Check that the KPI cards for Verify Delivery are visible
  const hasPendingInward = (await page.innerText('body')).includes('Pending Inward');
  console.log('Contains "Pending Inward":', hasPendingInward);

  await browser.close();

  if (hasCreateRequest) {
    throw new Error('FAILED: "Create Request" is still present in the tabs strip!');
  }

  console.log('=== VERIFICATION PASSED: "Create Request" is completely removed ===');
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
