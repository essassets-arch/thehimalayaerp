const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://thehimalaya.cloud/login');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('https://thehimalaya.cloud/store/raw-inventory');
  await page.waitForTimeout(5000);

  // Check pagination info text
  const paginationInfo = await page.locator('.store-pagination-control').innerText().catch(() => 'None');
  console.log('Pagination info:', paginationInfo.replace(/\n+/g, ' '));

  // Count rows in the table
  const rows = await page.locator('.m-theme-table tbody tr').count();
  console.log('Table rows rendered on page:', rows);

  // Check the select dropdown options
  const selectValue = await page.locator('.store-pagination-control select').inputValue().catch(() => 'None');
  console.log('Current page size selected:', selectValue);

  // Capture list of first 5 and last 5 material codes visible
  const skus = await page.locator('.m-theme-table tbody tr td:first-child').allInnerTexts();
  console.log('Total SKUs extracted from rows:', skus.length);
  if (skus.length > 0) {
    console.log('First 5:', skus.slice(0, 5));
    console.log('Last 5:', skus.slice(-5));
  }

  // Take screenshot for visual confirmation
  await page.screenshot({ path: 'scratch/store_raw_inventory_verified.png', fullPage: false });
  console.log('Screenshot saved to scratch/store_raw_inventory_verified.png');

  await browser.close();
}

test().catch(console.error);
