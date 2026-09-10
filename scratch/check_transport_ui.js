const { chromium } = require('playwright');

async function checkTransport() {
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

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'sana.r@himalayaerp.com');
  await page.fill('input[type="password"]', 'Himalaya@1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('http://localhost:3000/dispatch/sample-dispatch/create/req-229cc1ae-7549-4e72-8be7-2c2fe678c469', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const transportInfo = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const costInputs = inputs.filter(i => (i.placeholder && i.placeholder.includes('0.00')) || i.value === '750.00' || i.value === '750');
    const labels = Array.from(document.querySelectorAll('label, div, span'))
      .map(el => el.innerText.trim())
      .filter(t => t.includes('Transport Cost') || t.includes('Fetched Transport') || t.includes('To Be Paid'));

    return {
      inputs: inputs.map(i => ({ name: i.name, placeholder: i.placeholder, value: i.value, type: i.type })),
      labels: [...new Set(labels)].slice(0, 15),
    };
  });
  console.log('Transport Info in UI:', JSON.stringify(transportInfo, null, 2));
  await browser.close();
}
checkTransport().catch(console.error);
