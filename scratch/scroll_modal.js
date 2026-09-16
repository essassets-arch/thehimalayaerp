const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\3d2f2c0b-8be2-40b2-988e-98ee6fd60d51';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['notifications', 'geolocation'],
    geolocation: { latitude: 23.0225, longitude: 72.5714 },
  });

  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
      window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
      window.__PLAYWRIGHT_TEST__ = true;
    } catch (e) {}
  });

  const page = await context.newPage();

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Open Sales Customer Complaints
  await page.goto('http://localhost:3000/sales/customer-complaints');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click Resolved row
  const resolvedRow = page.locator('tbody tr:has-text("Resolved")').first();
  await resolvedRow.click({ force: true });
  await page.waitForTimeout(1500);

  // Scroll modal body to bottom
  await page.evaluate(() => {
    const modalBody = document.querySelector('.complaint-modal > div:nth-child(2), .complaint-modal [style*="overflow-y"]');
    if (modalBody) {
      modalBody.scrollTop = modalBody.scrollHeight;
    } else {
      window.scrollTo(0, document.body.scrollHeight);
    }
  });
  await page.waitForTimeout(1000);

  const shot = path.join(artifactDir, 'sales_resolved_realization_breakdown.png');
  await page.screenshot({ path: shot });
  console.log('Saved:', shot);

  await browser.close();
})();
