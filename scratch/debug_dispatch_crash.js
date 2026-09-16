const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
      window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
      window.__PLAYWRIGHT_TEST__ = true;
    } catch (e) {}
  });
  const page = await context.newPage();
  page.on('console', (msg) => console.log('PAGE LOG [' + msg.type() + ']:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message, '\nSTACK:\n', err.stack));

  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('Navigating to dispatch complaints...');
  await page.goto('http://localhost:3000/dispatch/customer-complaints');
  await page.waitForTimeout(3000);

  const html = await page.content();
  if (html.includes('Application error')) {
    console.log('FOUND APPLICATION ERROR ON PAGE!');
  } else {
    console.log('NO APPLICATION ERROR. Page loaded fine.');
  }

  await browser.close();
})();
