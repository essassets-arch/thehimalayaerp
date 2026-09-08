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

  console.log('=== OPENING CREATE INDENT MODAL ===');
  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(500);

  console.log('=== CLICKING SMART SEARCH INPUT ===');
  const searchInput = page.locator('input[placeholder*="Type keyword to add product"]');
  await searchInput.click();
  await page.waitForTimeout(400);

  // Check dropdown item count and header text
  const dropdownInfo = await page.evaluate(() => {
    const dropdown = document.querySelector('div[style*="boxShadow"], div[style*="box-shadow"]');
    if (!dropdown) return { found: false };
    const header = dropdown.querySelector('div:first-child')?.innerText;
    // count rows
    const rows = dropdown.querySelectorAll('div[style*="justify-content: space-between"], div[style*="justifyContent: space-between"]');
    return {
      found: true,
      header,
      rowCount: rows.length
    };
  });
  console.log('Smart Search Dropdown Info (all items):', JSON.stringify(dropdownInfo, null, 2));

  // Take screenshot with full dropdown open showing count and all low stock materials
  await page.screenshot({ path: path.join(artifactDir, 'smart_search_all_low_stock.png') });
  console.log('Saved smart_search_all_low_stock.png');

  // Test keyword search
  console.log('=== TESTING KEYWORD SEARCH ===');
  await searchInput.fill('WATER');
  await page.waitForTimeout(300);

  const searchInfo = await page.evaluate(() => {
    const dropdown = document.querySelector('div[style*="boxShadow"], div[style*="box-shadow"]');
    if (!dropdown) return { found: false };
    const header = dropdown.querySelector('div:first-child')?.innerText;
    const rows = dropdown.querySelectorAll('div[style*="justify-content: space-between"], div[style*="justifyContent: space-between"]');
    return {
      header,
      rowCount: rows.length
    };
  });
  console.log('Smart Search with "WATER":', JSON.stringify(searchInfo, null, 2));

  await page.screenshot({ path: path.join(artifactDir, 'smart_search_filtered_water.png') });
  console.log('Saved smart_search_filtered_water.png');

  await browser.close();
})();
