const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  console.log('=== VERIFYING ALL STORE MATERIALS ON PENDING REQUESTS ===');

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

  // Navigate to Finance Pending Requests
  console.log('2. Navigating to Finance PO Requests (Pending Requests tab)...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Pending%20Requests');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(artifactDir, 'all_store_materials_pending_requests.png'), fullPage: true });
  console.log('   Captured all_store_materials_pending_requests.png');

  // Check indent IDs displayed
  const displayedIndents = await page.evaluate(() => {
    const badges = Array.from(document.querySelectorAll('span')).filter(s => /ind-\d+/i.test(s.innerText.trim()));
    return badges.map(b => b.innerText.trim());
  });
  console.log('Displayed Indents:', displayedIndents);

  // Check material counts
  const totalIndentsText = await page.locator('span:has-text("Indent(s)")').first().innerText().catch(() => '');
  const totalMaterialsText = await page.locator('span:has-text("Material(s)")').first().innerText().catch(() => '');
  console.log(`Summary: ${totalIndentsText}, ${totalMaterialsText}`);

  await context.close();
  await browser.close();
  console.log('=== VERIFICATION COMPLETED ===');
})();
