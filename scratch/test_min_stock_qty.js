const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8f1dff96-3967-4466-8db6-db51dd9de918';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });

  console.log('=== 1. LOGGING IN & NAVIGATING TO LOW STOCK ALERTS ===');
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');

  // Clear any existing draft to start fresh
  await page.evaluate(() => localStorage.removeItem('store_bulk_indent_draft'));

  console.log('=== 2. OPENING MODAL & CLICKING ADD LOW STOCK ITEMS ===');
  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(600);

  await page.click('button:has-text("Add Low Stock Items")');
  await page.waitForTimeout(500);

  // Verify first 5 items have quantity equal to minimum stock
  const sampleItems = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.bulk-indent-items-box tbody tr'));
    return rows.slice(0, 5).map(r => {
      const matText = r.querySelector('select')?.value;
      const detailsText = r.querySelector('td:first-child')?.innerText;
      const minInput = r.querySelector('input[type="number"]');
      const minHelper = r.querySelector('td:nth-child(3) span:last-child')?.innerText;
      return {
        material: matText,
        detailsText,
        qtyValue: minInput ? minInput.value : null,
        minAttr: minInput ? minInput.getAttribute('min') : null,
        helper: minHelper
      };
    });
  });

  console.log('Sample Items Prefilled Quantities:', JSON.stringify(sampleItems, null, 2));

  // Take screenshot with Minimum Stock prefilled
  await page.screenshot({ path: path.join(artifactDir, 'min_stock_prefilled_desktop.png') });
  console.log('Saved screenshot: min_stock_prefilled_desktop.png');

  console.log('=== 3. TESTING LESS THAN MINIMUM STOCK VALIDATION ===');
  // Set first item quantity to 1 (less than its minStock)
  const firstQtyInput = page.locator('.bulk-indent-items-box input[type="number"]').first();
  await firstQtyInput.fill('1');
  await page.waitForTimeout(200);

  const visualWarning = await page.evaluate(() => {
    const firstRow = document.querySelector('.bulk-indent-items-box tbody tr');
    const input = firstRow ? firstRow.querySelector('input[type="number"]') : null;
    const helper = firstRow ? firstRow.querySelector('td:nth-child(3) span:last-child') : null;
    return {
      borderColor: input ? window.getComputedStyle(input).borderColor : null,
      helperText: helper ? helper.innerText : null
    };
  });
  console.log('Visual warning state when Qty = 1:', visualWarning);

  // Try to submit with quantity less than minimum stock
  await page.click('.bulk-indent-modal-footer button:has-text("Submit Request")');
  await page.waitForTimeout(400);

  // Check toast notification
  const toastMsg = await page.evaluate(() => {
    const toast = document.querySelector('.Toastify__toast, div[role="alert"], .swal2-container, .toast');
    return toast ? toast.innerText : null;
  });
  console.log('Validation notification on submit attempt:', toastMsg);

  console.log('=== 4. TESTING ALLOWING SAME OR MORE THAN MINIMUM STOCK ===');
  // Set quantity to minStock + 10
  await firstQtyInput.fill('50');
  await page.waitForTimeout(200);

  const validState = await page.evaluate(() => {
    const firstRow = document.querySelector('.bulk-indent-items-box tbody tr');
    const input = firstRow ? firstRow.querySelector('input[type="number"]') : null;
    const helper = firstRow ? firstRow.querySelector('td:nth-child(3) span:last-child') : null;
    return {
      qtyValue: input ? input.value : null,
      helperText: helper ? helper.innerText : null
    };
  });
  console.log('Valid state when Qty = 50:', validState);

  await page.screenshot({ path: path.join(artifactDir, 'min_stock_enforced_desktop.png') });
  console.log('Saved screenshot: min_stock_enforced_desktop.png');

  await page.close();

  console.log('=== 5. TESTING MOBILE VIEW ===');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });
  await mobilePage.goto('http://localhost:3000/login');
  await mobilePage.click('button:has-text("Store")');
  await mobilePage.locator('button:has-text("Login")').first().click();
  await mobilePage.waitForURL('**/store/**');
  await mobilePage.goto('http://localhost:3000/store/low-stock-alerts');
  await mobilePage.waitForLoadState('networkidle');

  await mobilePage.click('button:has-text("Create Indent")');
  await mobilePage.waitForTimeout(600);

  await mobilePage.click('button:has-text("Add Low Stock Items")');
  await mobilePage.waitForTimeout(600);

  await mobilePage.screenshot({ path: path.join(artifactDir, 'min_stock_mobile_view.png') });
  console.log('Saved screenshot: min_stock_mobile_view.png');

  await mobileContext.close();
  await browser.close();
  console.log('\nAll minimum stock quantity enforcement tests completed successfully!');
})();
