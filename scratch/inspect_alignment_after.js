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
    const unitBadge = row.querySelector('td:nth-child(3) span:first-of-type');
    const btn = row.querySelector('button');
    const getBox = el => el ? {
      top: Math.round(el.getBoundingClientRect().top * 10) / 10,
      height: Math.round(el.getBoundingClientRect().height * 10) / 10
    } : null;
    return {
      select: getBox(select),
      date: getBox(date),
      qty: getBox(qty),
      unitBadge: getBox(unitBadge),
      btn: getBox(btn)
    };
  });
  console.log('Control Positions After Fix:', JSON.stringify(metrics, null, 2));

  // Take a focused screenshot of the first 2 table rows
  const rowLocator = page.locator('.bulk-indent-items-box tbody tr').first();
  if (await rowLocator.count() > 0) {
    await rowLocator.screenshot({ path: path.join(artifactDir, 'aligned_row_closeup.png') });
    console.log('Saved aligned_row_closeup.png');
  }

  // Take full modal screenshot
  const modal = page.locator('div[style*="max-width: 960px"], div[style*="maxWidth: 960px"], .bulk-indent-items-box').first();
  await page.screenshot({ path: path.join(artifactDir, 'aligned_desktop_modal.png') });
  console.log('Saved aligned_desktop_modal.png');

  await browser.close();
})();
