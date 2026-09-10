const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 28.6139, longitude: 77.2090 }
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('[BROWSER CONSOLE ERROR]:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('[BROWSER PAGE ERROR]:', err.message, err.stack);
  });

  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('Navigating to http://localhost:3000/finance/po-requests?tab=Delivery%20Audit...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Delivery%20Audit');
  await page.waitForTimeout(3000);

  await browser.close();
})();
