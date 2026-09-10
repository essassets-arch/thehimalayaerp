const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['notifications', 'geolocation'],
    geolocation: { latitude: 19.076, longitude: 72.8777 },
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__PLAYWRIGHT_TEST__ = true;
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
    localStorage.setItem('hasDismissedPermissionsModal', 'true');
    sessionStorage.setItem('hasDismissedPermissionsModal', 'true');
  });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));

  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  console.log('2. Filling form...');
  await page.fill('input[type="email"]', 'sana.r@himalayaerp.com');
  await page.fill('input[type="password"]', 'Himalaya@1234');
  await page.click('button[type="submit"]');

  console.log('3. Waiting for navigation/redirection...');
  await page.waitForTimeout(4000);

  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);

  const authState = await page.evaluate(() => {
    const localKeys = Object.keys(localStorage);
    const sessionKeys = Object.keys(sessionStorage);
    return {
      localStorage: localKeys.map(k => ({ k, v: localStorage.getItem(k)?.slice(0, 50) })),
      sessionStorage: sessionKeys.map(k => ({ k, v: sessionStorage.getItem(k)?.slice(0, 50) })),
    };
  });
  console.log('Auth state storage:', JSON.stringify(authState, null, 2));

  console.log('4. Navigating to /dispatch/sample-dispatch...');
  await page.goto('http://localhost:3000/dispatch/sample-dispatch', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const tableRows = await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll('tbody tr'));
    return trs.map(tr => tr.innerText.replace(/\n+/g, ' | '));
  });
  console.log('Table rows in /dispatch/sample-dispatch:');
  console.log(tableRows);

  await browser.close();
}

main().catch(console.error);
