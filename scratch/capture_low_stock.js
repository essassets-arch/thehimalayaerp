const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  // Click "Store" filter pill in Quick Demo Login
  console.log('Filtering demo accounts by Store...');
  await page.click('button:has-text("Store")');
  await page.waitForTimeout(500);

  // Click "Login" on the first store demo card
  console.log('Clicking Quick Login for Store...');
  const loginBtns = page.locator('button:has-text("Login")');
  await loginBtns.first().click();

  console.log('Waiting for URL redirect...');
  await page.waitForURL('**/store/**', { timeout: 15000 }).catch(async () => {
    console.log('Current URL after login attempt:', page.url());
  });

  console.log('Navigating directly to http://localhost:3000/store/low-stock-alerts...');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const outDir = 'C:/Users/SYSTEM3/.gemini/antigravity-ide/brain/8f1dff96-3967-4466-8db6-db51dd9de918';
  await page.screenshot({ path: path.join(outDir, 'table_verified.png'), fullPage: false });
  console.log('Captured table_verified.png at URL:', page.url());

  // Check table headers
  const ths = await page.$$eval('table.low-stock-table thead th', els => els.map(e => e.textContent.trim()));
  console.log('Table Headers:', ths);

  // Check rows
  const rowsCount = await page.$$eval('table.low-stock-table tbody tr', els => els.length);
  console.log('Table rows count:', rowsCount);

  // Check first few rows text
  const rows = await page.$$eval('table.low-stock-table tbody tr', els => els.slice(0, 6).map(r => {
    return Array.from(r.querySelectorAll('td')).map(td => td.textContent.trim());
  }));
  console.log('First 6 rows data:');
  console.dir(rows, { depth: null });

  // Check action buttons - should be 0
  const createMaterialIndentBtns = await page.$$eval('button:has-text("+ Create Material Indent")', els => els.length);
  console.log('Count of "+ Create Material Indent" buttons in table rows:', createMaterialIndentBtns);

  // Check "Create Indent" button in header
  const createIndentBtn = await page.$('button:has-text("Create Indent")');
  console.log('Top right Create Indent button exists:', !!createIndentBtn);

  if (createIndentBtn) {
    console.log('Clicking Create Indent button...');
    await createIndentBtn.click();
    await page.waitForTimeout(1000);

    // Take screenshot of the modal
    await page.screenshot({ path: path.join(outDir, 'modal_verified.png'), fullPage: false });
    console.log('Captured modal_verified.png');

    const modalTitle = await page.$eval('.modal-box h3', el => el.textContent.trim());
    console.log('Modal Title:', modalTitle);

    const targetDateInput = await page.$('input[type="date"]');
    console.log('Target date input exists:', !!targetDateInput);

    const modalCheckboxes = await page.$$eval('.modal-box input[type="checkbox"]', els => els.length);
    console.log('Modal checkboxes count:', modalCheckboxes);

    const submitBtn = await page.$('button:has-text("Submit Indent")');
    console.log('Submit Indent button text:', await submitBtn?.textContent());
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
