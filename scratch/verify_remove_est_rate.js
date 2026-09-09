const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  console.log('=== VERIFYING REMOVAL OF EST. RATE COLUMN ===');

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

  // Check table headers
  const thTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('thead th')).map(th => th.innerText.trim());
  });
  console.log('   Table headers found:', thTexts);

  const hasEstRateHeader = thTexts.some(t => t.toUpperCase().includes('EST. RATE') || t.toUpperCase().includes('EST RATE') || t.toUpperCase().includes('RATE'));
  console.log('   Contains Est. Rate in headers:', hasEstRateHeader);

  // Check columns count in first row
  const firstRowCols = await page.evaluate(() => {
    const tr = document.querySelector('tbody tr');
    if (!tr) return [];
    return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
  });
  console.log('   First row columns:', firstRowCols);

  const screenshotPath = path.join(artifactDir, 'pending_requests_no_est_rate.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`   Captured screenshot: ${screenshotPath}`);

  if (hasEstRateHeader) {
    console.error('FAILED: Est. Rate header is still visible!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Est. Rate column has been completely removed!');
  }

  await context.close();
  await browser.close();
  console.log('=== VERIFICATION COMPLETE ===');
})();
