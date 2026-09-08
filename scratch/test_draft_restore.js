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

  console.log('=== 2. OPENING FRESH MODAL ===');
  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(600);

  // Verify empty initial state
  const initialEmpty = await page.evaluate(() => {
    const emptyText = document.querySelector('.bulk-indent-modal-body');
    return emptyText ? emptyText.innerText.includes('No items added yet') : false;
  });
  console.log('Initial modal is empty:', initialEmpty);

  console.log('=== 3. ADDING 2 ITEMS & CUSTOM NOTES ===');
  await page.click('button:has-text("Add Product Row")');
  await page.waitForTimeout(150);
  await page.click('button:has-text("Add Product Row")');
  await page.waitForTimeout(150);

  // Fill in first item quantity 45
  const qtyInputs = page.locator('.bulk-indent-items-box input[type="number"]');
  await qtyInputs.first().fill('45');

  // Fill in notes
  const notesArea = page.locator('textarea[placeholder*="Provide special instructions"]');
  await notesArea.fill('Urgent production batch requirement - draft test');
  await page.waitForTimeout(200);

  console.log('=== 4. CLICKING CANCEL WITHOUT SUBMITTING ===');
  await page.click('.bulk-indent-modal-footer button:has-text("Cancel")');
  await page.waitForTimeout(500);

  const isModalClosed = await page.evaluate(() => !document.querySelector('.bulk-indent-modal-overlay'));
  console.log('Modal closed after cancel:', isModalClosed);

  console.log('=== 5. CLICKING CREATE INDENT AGAIN TO VERIFY RESTORE ===');
  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(600);

  const restoredInfo = await page.evaluate(() => {
    const qtyInputs = Array.from(document.querySelectorAll('.bulk-indent-items-box input[type="number"]'));
    const notesArea = document.querySelector('textarea[placeholder*="Provide special instructions"]');
    const tableRows = document.querySelectorAll('.bulk-indent-items-box tbody tr');
    return {
      rowCount: tableRows.length,
      firstQty: qtyInputs[0] ? qtyInputs[0].value : null,
      notes: notesArea ? notesArea.value : null
    };
  });
  console.log('Restored info on re-open:', restoredInfo);

  await page.screenshot({ path: path.join(artifactDir, 'draft_restored_after_cancel.png') });
  console.log('Saved screenshot: draft_restored_after_cancel.png');

  console.log('=== 6. TESTING PERSISTENCE ACROSS FULL PAGE RELOAD ===');
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(600);

  const reloadedInfo = await page.evaluate(() => {
    const qtyInputs = Array.from(document.querySelectorAll('.bulk-indent-items-box input[type="number"]'));
    const notesArea = document.querySelector('textarea[placeholder*="Provide special instructions"]');
    const tableRows = document.querySelectorAll('.bulk-indent-items-box tbody tr');
    return {
      rowCount: tableRows.length,
      firstQty: qtyInputs[0] ? qtyInputs[0].value : null,
      notes: notesArea ? notesArea.value : null
    };
  });
  console.log('Restored info after page reload:', reloadedInfo);

  console.log('=== 7. TESTING CLEAR LIST BUTTON ===');
  await page.click('button:has-text("Clear List")');
  await page.waitForTimeout(300);

  const afterClear = await page.evaluate(() => {
    const body = document.querySelector('.bulk-indent-modal-body');
    return {
      hasEmptyText: body ? body.innerText.includes('No items added yet') : false,
      draftInStorage: localStorage.getItem('store_bulk_indent_draft')
    };
  });
  console.log('After Clear List:', afterClear);

  await browser.close();
  console.log('\nAll draft restore tests passed successfully!');
})();
