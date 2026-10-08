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

  // Select 'All (217)'
  console.log('Selecting "All" in the pagination dropdown...');
  await page.selectOption('.store-pagination-control select', '9999');
  await page.waitForTimeout(2000);

  // Check pagination info text
  const paginationInfo = await page.locator('.store-pagination-control').innerText().catch(() => 'None');
  console.log('Pagination info after selecting All:', paginationInfo.replace(/\n+/g, ' '));

  // Count rows in the table
  const rows = await page.locator('.m-theme-table tbody tr').count();
  console.log('Total table rows rendered on page:', rows);

  // Check first and last SKU
  const firstSku = await page.locator('.m-theme-table tbody tr:first-child td:first-child').innerText();
  const lastSku = await page.locator('.m-theme-table tbody tr:last-child td:first-child').innerText();
  console.log('First rendered material:', firstSku);
  console.log('Last rendered material:', lastSku);

  // Take screenshot
  await page.screenshot({ path: 'scratch/store_raw_inventory_all_217.png', fullPage: false });
  console.log('Screenshot of all 217 materials saved.');

  await browser.close();
}

test().catch(console.error);
