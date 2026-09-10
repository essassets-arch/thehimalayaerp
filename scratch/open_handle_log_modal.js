const { chromium } = require('playwright');
const path = require('path');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['notifications', 'geolocation'],
    geolocation: { latitude: 19.076, longitude: 72.8777 },
  });

  const page = await context.newPage();
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\5700c2fd-29b6-4d85-8f1a-3e6a1ae00d49';

  await page.addInitScript(() => {
    window.__PLAYWRIGHT_TEST__ = true;
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
    localStorage.setItem('hasDismissedPermissionsModal', 'true');
    sessionStorage.setItem('hasDismissedPermissionsModal', 'true');
  });

  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  console.log('2. Logging in...');
  await page.fill('input[type="email"], input[name="email"]', 'makhdum@himalayaerp.com');
  await page.fill('input[type="password"], input[name="password"]', 'Himalaya@1234');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  console.log('3. Navigating to /store/raw-inventory...');
  await page.goto('http://localhost:3000/store/raw-inventory', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Loading Workspace...', { state: 'detached', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);

  console.log('4. Filtering by handle...');
  const searchInput = page.locator('input[placeholder*="Search raw materials"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('handle');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: path.join(artifactDir, 'store_raw_inventory_table.png'), fullPage: true });
  console.log('✓ Updated store_raw_inventory_table.png');

  console.log('5. Clicking Log on HM204 row...');
  const hm204Row = page.locator('tr:has-text("HM204")').first();
  if (await hm204Row.count() > 0) {
    const logBtn = hm204Row.locator('.raw-btn-log, button:has-text("Log")').first();
    await logBtn.click();
    console.log('Clicked Log button on HM204 row!');
  }

  await page.waitForSelector('text=Store Live Ledger', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Click Details button to expand full audit metadata
  const detailsBtn = page.locator('button:has-text("Details")').first();
  if (await detailsBtn.count() > 0 && await detailsBtn.isVisible()) {
    await detailsBtn.click();
    await page.waitForTimeout(1000);
    console.log('Clicked Details button');
  }

  await page.screenshot({ path: path.join(artifactDir, 'material_movement_log_modal.png'), fullPage: true });
  console.log('✓ Saved material_movement_log_modal.png');

  await browser.close();
}

run().catch(console.error);
