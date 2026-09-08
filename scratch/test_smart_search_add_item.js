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

  await page.evaluate(() => localStorage.removeItem('store_bulk_indent_draft'));

  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(500);

  const searchInput = page.locator('input[placeholder*="Type keyword to add product"]');
  await searchInput.click();
  await page.waitForTimeout(300);

  // Click on the first item in the dropdown
  const firstItem = page.locator('div[style*="justify-content: space-between"]:has-text("sdecf")').first();
  if (await firstItem.count() > 0) {
    await firstItem.dispatchEvent('mousedown');
    await page.waitForTimeout(400);
  }

  // Verify item added to table with Minimum Stock
  const addedRows = await page.locator('.bulk-indent-items-box tbody tr').count();
  console.log('Added rows in table:', addedRows);

  await page.screenshot({ path: path.join(artifactDir, 'smart_search_item_added_to_table.png') });
  console.log('Saved smart_search_item_added_to_table.png');

  await browser.close();
})();
