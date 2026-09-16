const { chromium } = require('playwright');

async function inspectLiveTable() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"], input[name="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[name="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(2000);
  await page.goto('https://thehimalaya.cloud/store/raw-inventory', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const rows = await page.locator('table tbody tr');
  const count = await rows.count();
  console.log(`Live Table Row Count on page 1: ${count}`);

  for (let i = 0; i < Math.min(count, 8); i++) {
    const rowText = await rows.nth(i).innerText();
    console.log(`Row ${i + 1}: ${rowText.replace(/\n+/g, ' | ')}`);
  }

  await browser.close();
}

inspectLiveTable().catch(console.error);
