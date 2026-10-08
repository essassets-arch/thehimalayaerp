const { chromium } = require('playwright');

async function inspectNetwork() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', async res => {
    if (res.url().includes('raw-material-snapshot') || res.url().includes('inventory')) {
      console.log('RES URL:', res.url(), 'STATUS:', res.status());
      try {
        const text = await res.text();
        console.log('RES BODY (first 300 chars):', text.slice(0, 300));
        try {
          const json = JSON.parse(text);
          const data = Array.isArray(json) ? json : json.data;
          console.log('RES ITEM COUNT:', Array.isArray(data) ? data.length : 'not array');
        } catch (e) {}
      } catch (e) {
        console.log('Could not read body:', e.message);
      }
    }
  });

  await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('Navigating to /store/raw-inventory...');
  await page.goto('https://thehimalaya.cloud/store/raw-inventory', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const kpis = await page.locator('.m-theme-kpi-card').allInnerTexts();
  console.log('KPIs:', kpis);

  const filterButtons = await page.locator('.raw-inv-status-strip button').allInnerTexts();
  console.log('Filter buttons:', filterButtons);

  await browser.close();
}

inspectNetwork().catch(console.error);
