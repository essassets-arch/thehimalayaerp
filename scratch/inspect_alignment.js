const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8f1dff96-3967-4466-8db6-db51dd9de918';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(500);

  // If table empty, add low stock items
  const rowCount = await page.locator('.bulk-indent-items-box tbody tr').count();
  if (rowCount === 0 || (await page.locator('.bulk-indent-items-box tbody td').first().innerText()).includes('No items')) {
    await page.click('button:has-text("Add Low Stock Items")');
    await page.waitForTimeout(500);
  }

  // Get bounding box and positions of inputs in the first row
  const metrics = await page.evaluate(() => {
    const row = document.querySelector('.bulk-indent-items-box tbody tr');
    if (!row) return null;
    const select = row.querySelector('select');
    const date = row.querySelector('input[type="date"]');
    const qty = row.querySelector('input[type="number"]');
    const btn = row.querySelector('button');
    const getBox = el => el ? { top: el.getBoundingClientRect().top, height: el.getBoundingClientRect().height } : null;
    return {
      select: getBox(select),
      date: getBox(date),
      qty: getBox(qty),
      btn: getBox(btn)
    };
  });
  console.log('Control Positions:', JSON.stringify(metrics, null, 2));

  // Take a screenshot of the table
  const table = page.locator('.bulk-indent-items-box table');
  if (await table.count() > 0) {
    await table.screenshot({ path: path.join(artifactDir, 'table_alignment_before.png') });
    console.log('Saved table_alignment_before.png');
  }

  await browser.close();
})();
