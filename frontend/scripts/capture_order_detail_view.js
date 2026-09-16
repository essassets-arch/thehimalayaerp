const { chromium } = require('playwright');
const path = require('path');

async function main() {
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

  console.log('Logging in as superadmin...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'superadmin@himalayaerp.com');
  await page.fill('input[type="password"]', 'Password@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // 1. Open Sales Orders and click HCPPL/2627/0251
  console.log('Navigating to /orders...');
  await page.goto('http://localhost:3000/orders', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  console.log('Clicking on HCPPL/2627/0251...');
  const orderLink = page.locator('text=HCPPL/2627/0251').first();
  await orderLink.click();
  await page.waitForTimeout(1500);

  const orderModalScreenshot = path.join(
    'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\3d2f2c0b-8be2-40b2-988e-98ee6fd60d51',
    'sales_order_0251_modal_verified.png'
  );
  await page.screenshot({ path: orderModalScreenshot, fullPage: true });
  console.log(`Saved screenshot: ${orderModalScreenshot}`);

  // 2. Navigate to Payment Follow-up
  console.log('Navigating to /sales/payment-followup...');
  await page.goto('http://localhost:3000/sales/payment-followup', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const paymentFollowupScreenshot = path.join(
    'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\3d2f2c0b-8be2-40b2-988e-98ee6fd60d51',
    'payment_followup_verified.png'
  );
  await page.screenshot({ path: paymentFollowupScreenshot, fullPage: true });
  console.log(`Saved screenshot: ${paymentFollowupScreenshot}`);

  await browser.close();
}

main().catch(console.error);
