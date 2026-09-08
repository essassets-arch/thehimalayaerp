const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
  });
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');

  const firstItems = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.low-stock-table tbody tr'));
    return rows.slice(0, 5).map(r => Array.from(r.querySelectorAll('td')).map(td => td.textContent.trim()));
  });
  console.log('First items in table:', firstItems);

  // Check dbRawInventory state or what window has
  const itemObjects = await page.evaluate(async () => {
    const res = await fetch('/api/backend/products?type=RAW_MATERIAL');
    const data = await res.json();
    return data;
  });
  console.log('itemObjects keys:', Object.keys(itemObjects));
  console.log('itemObjects raw:', JSON.stringify(itemObjects).slice(0, 300));

  await browser.close();
})();
