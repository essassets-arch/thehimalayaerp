const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://thehimalaya.cloud/login');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('https://thehimalaya.cloud/store/raw-inventory');
  await page.waitForTimeout(6000);

  const text = await page.locator('.m-theme-table tbody').innerText();
  console.log('Tbody text:\n', text.slice(0, 500));

  const countBadge = await page.locator('.raw-inv-status-strip button').first().innerText();
  console.log('All button:', countBadge);

  await browser.close();
}

test().catch(console.error);
