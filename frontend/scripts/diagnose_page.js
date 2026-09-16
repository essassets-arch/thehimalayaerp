const { chromium } = require('playwright');

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

  console.log('Logging in as super.admin@himalayaerp.com...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('Current URL after login:', page.url());

  console.log('Navigating to http://localhost:3000/plant-head/customer-complaints...');
  await page.goto('http://localhost:3000/plant-head/customer-complaints', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('Current URL:', page.url());

  const pageTitle = await page.title();
  console.log('Page Title:', pageTitle);

  const h1Text = await page.locator('h1').allInnerTexts();
  console.log('H1 headings:', h1Text);

  const allButtons = await page.locator('button').allInnerTexts();
  console.log('All buttons found:', allButtons);

  await page.screenshot({ path: 'plant_head_debug.png' });
  await browser.close();
}

main().catch(console.error);
