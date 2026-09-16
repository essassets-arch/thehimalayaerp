const { chromium } = require('playwright');

async function testLocalStore() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Logging into local app...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"], input[name="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[name="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(2000);
  console.log('Navigating to http://localhost:3000/store/raw-inventory...');
  await page.goto('http://localhost:3000/store/raw-inventory', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const textContent = await page.locator('body').innerText();
  console.log('Page content summary:');
  const lines = textContent.split('\n').map(l => l.trim()).filter(Boolean);
  lines.slice(0, 35).forEach(l => console.log('  ', l));

  const tableRows = await page.locator('table tbody tr').count();
  console.log('Table rows:', tableRows);

  await browser.close();
}

testLocalStore().catch(console.error);
