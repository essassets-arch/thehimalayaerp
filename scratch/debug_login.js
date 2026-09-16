const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));
  page.on('response', res => {
    if (res.url().includes('/auth/login') || res.url().includes('/api/')) {
      console.log('API RESP:', res.url(), res.status());
    }
  });

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(5000);
  console.log('Current URL:', page.url());

  const errText = await page.locator('.login-error').textContent().catch(() => null);
  if (errText) console.log('Login Error displayed:', errText);

  await browser.close();
})();
