const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  console.log('=== VERIFYING REMOVAL OF "PARTIALLY CONVERTED" ===');

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

  // Take full screenshot
  const screenshotPath = path.join(artifactDir, 'no_partially_converted_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`   Captured screenshot: ${screenshotPath}`);

  // Check for any text matching "PARTIALLY CONVERTED"
  const bodyText = await page.innerText('body');
  const hasPartiallyConverted = bodyText.toUpperCase().includes('PARTIALLY CONVERTED');
  console.log('   Contains "PARTIALLY CONVERTED":', hasPartiallyConverted);

  // Extract all status badges in the indent headers
  const badges = await page.evaluate(() => {
    const headers = document.querySelectorAll('div[style*="background: rgb(248, 250, 252)"], div[style*="background: #F8FAFC"]');
    return Array.from(headers).map(h => {
      const idSpan = h.querySelector('span[style*="monospace"]');
      const badge = h.querySelector('span[class*="badge"], span[style*="border-radius"]');
      return {
        indentId: idSpan ? idSpan.innerText.trim() : 'Unknown',
        badgeText: badge ? badge.innerText.trim() : 'None',
        allText: h.innerText.trim().replace(/\n+/g, ' | ')
      };
    });
  });

  console.log('   Indent Headers found:', badges.length);
  console.table(badges);

  if (hasPartiallyConverted) {
    console.error('FAILED: "PARTIALLY CONVERTED" text is still visible on the page!');
    process.exit(1);
  } else {
    console.log('SUCCESS: "PARTIALLY CONVERTED" has been completely removed!');
  }

  await context.close();
  await browser.close();
  console.log('=== VERIFICATION COMPLETE ===');
})();
