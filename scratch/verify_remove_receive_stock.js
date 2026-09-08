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
  await page.goto('http://localhost:3000/store/raw-inventory');
  await page.waitForLoadState('networkidle');

  // Verify Receive Stock button does not exist in header actions
  const receiveStockButtons = await page.locator('.m-theme-actions button:has-text("Receive Stock")').count();
  console.log('Receive Stock button count in header actions:', receiveStockButtons);

  // Take screenshot of raw inventory header and actions
  const header = page.locator('.raw-inventory-header');
  if (await header.count() > 0) {
    await header.screenshot({ path: path.join(artifactDir, 'raw_inventory_header_no_receive_stock.png') });
    console.log('Saved raw_inventory_header_no_receive_stock.png');
  }

  // Full page view
  await page.screenshot({ path: path.join(artifactDir, 'raw_inventory_full_page.png') });
  console.log('Saved raw_inventory_full_page.png');

  await browser.close();
})();
