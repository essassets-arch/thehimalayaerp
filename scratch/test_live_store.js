const { chromium } = require('playwright');

async function testStorePage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Logging in to live cloud...');
  await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"], input[name="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[name="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);
  console.log('Navigating to /store/raw-inventory...');
  await page.goto('https://thehimalaya.cloud/store/raw-inventory', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const title = await page.title();
  const url = page.url();
  console.log('Current URL:', url);
  console.log('Page title:', title);

  const tableRows = await page.locator('table tbody tr').count();
  console.log('Table rows count:', tableRows);

  const textContent = await page.locator('body').innerText();
  console.log('Sample text (first 500 chars):', textContent.slice(0, 500));

  await browser.close();
}

testStorePage().catch(console.error);
