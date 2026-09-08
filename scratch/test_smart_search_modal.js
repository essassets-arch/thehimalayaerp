const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
  });

  console.log('1. Logging in as Store Manager...');
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  console.log('2. Clicking "+ Create Indent"...');
  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(800);

  // Check empty state
  const emptyText = await page.textContent('.bulk-indent-modal-body');
  console.log('Contains empty state text:', emptyText.includes('No items added yet. Use the "Smart Search & Add" bar above'));

  const emptyScreenshot = path.resolve(__dirname, '../scratch/smart_search_empty_state.png');
  await page.screenshot({ path: emptyScreenshot });
  console.log('Saved empty state screenshot to:', emptyScreenshot);

  // 3. Focus search input to show smart search dropdown
  console.log('3. Focusing Smart Search input...');
  const searchInput = page.locator('input[placeholder="Type keyword to add product..."]');
  await searchInput.click();
  await page.waitForTimeout(500);

  const dropdownScreenshot = path.resolve(__dirname, '../scratch/smart_search_dropdown.png');
  await page.screenshot({ path: dropdownScreenshot });
  console.log('Saved dropdown screenshot to:', dropdownScreenshot);

  // 4. Click first result in dropdown
  console.log('4. Selecting item from dropdown...');
  const firstItem = page.locator('.bulk-indent-modal-body div[style*="border-bottom: 1px solid"]').first();
  await firstItem.click();
  await page.waitForTimeout(500);

  // 5. Click "+ Add Product Row"
  console.log('5. Clicking "+ Add Product Row"...');
  await page.click('button:has-text("Add Product Row")');
  await page.waitForTimeout(500);

  // Enter Justification
  await page.fill('textarea[placeholder="Provide special instructions or reason for authorization request..."]', 'Urgent replenishment for production line');

  const addedItemsScreenshot = path.resolve(__dirname, '../scratch/smart_search_added_items.png');
  await page.screenshot({ path: addedItemsScreenshot });
  console.log('Saved added items screenshot to:', addedItemsScreenshot);

  // 6. Submit Request
  console.log('6. Submitting request...');
  await page.click('button:has-text("Submit Request")');
  await page.waitForTimeout(2000);

  // Close SweetAlert if open
  const swalOk = page.locator('button.swal2-confirm');
  if (await swalOk.isVisible()) {
    await swalOk.click();
    await page.waitForTimeout(1000);
  }

  const afterSubmitScreenshot = path.resolve(__dirname, '../scratch/smart_search_after_submit.png');
  await page.screenshot({ path: afterSubmitScreenshot });
  console.log('Saved after submit screenshot to:', afterSubmitScreenshot);

  // 7. Also test Mobile viewport for Smart Search modal
  console.log('7. Testing mobile viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(800);

  const mobileEmptyScreenshot = path.resolve(__dirname, '../scratch/smart_search_mobile_empty.png');
  await page.screenshot({ path: mobileEmptyScreenshot });
  console.log('Saved mobile empty screenshot to:', mobileEmptyScreenshot);

  await page.click('button:has-text("Add Product Row")');
  await page.waitForTimeout(500);

  const mobileItemsScreenshot = path.resolve(__dirname, '../scratch/smart_search_mobile_items.png');
  await page.screenshot({ path: mobileItemsScreenshot });
  console.log('Saved mobile items screenshot to:', mobileItemsScreenshot);

  await browser.close();
  console.log('All Smart Search tests completed successfully!');
})();
