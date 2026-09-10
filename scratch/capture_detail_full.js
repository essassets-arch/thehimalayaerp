const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

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
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('http://localhost:3000/finance/po-requests?tab=Delivery%20Audit');
  await page.waitForTimeout(3000);

  await page.click('.da-audit-btn');
  await page.waitForTimeout(1500);

  // Full page screenshot of detail view
  const detailFull = path.join(artifactDir, 'finance_delivery_audit_detail_full.png');
  await page.screenshot({ path: detailFull, fullPage: true });
  console.log('✓ Captured full page detail screenshot:', detailFull);

  // Check buttons
  const approveBtn = page.locator('.da-btn-approve, button:has-text("Accept & Close PO")');
  const rejectBtn = page.locator('.da-btn-reject, button:has-text("Reject Audit")');
  const returnBtn = page.locator('.da-btn-return, button:has-text("Return for Correction")');

  console.log('Approve button count:', await approveBtn.count());
  console.log('Reject button count:', await rejectBtn.count());
  console.log('Return button count:', await returnBtn.count());

  await browser.close();
})();
