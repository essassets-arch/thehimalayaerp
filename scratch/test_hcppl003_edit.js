const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
  });
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'makhdum@himalayaerp.com');
  await page.fill('input[type="password"]', 'Himalaya@1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  await page.goto('http://localhost:3000/store/raw-inventory');
  await page.waitForTimeout(2500);

  const searchInput = page.locator('input[placeholder*="Search raw materials"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('HCPPL003');
    await page.waitForTimeout(1500);
  }

  const row = page.locator('tr:has-text("HCPPL003")').first();
  const editBtn = row.locator('.raw-btn-edit, button:has-text("Edit")').first();
  await editBtn.click();
  await page.waitForTimeout(2000);

  console.log('Current URL after clicking Edit:', page.url());
  const title = await page.locator('h2, .m-theme-title').first().textContent();
  console.log('Edit page title:', title);

  const inputs = await page.locator('form input').all();
  for (let i = 0; i < inputs.length; i++) {
    console.log(`Input ${i} value:`, await inputs[i].inputValue());
  }

  await browser.close();
}

run().catch(console.error);
