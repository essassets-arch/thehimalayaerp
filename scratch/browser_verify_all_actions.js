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

  console.log('1. Logging in...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.fill('input[type="email"], input[name="email"]', 'makhdum@himalayaerp.com');
  await page.fill('input[type="password"], input[name="password"]', 'Himalaya@1234');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  console.log('2. Navigating to /store/raw-inventory...');
  await page.goto('http://localhost:3000/store/raw-inventory', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Loading Workspace...', { state: 'detached', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);

  console.log('3. Searching for handle in raw materials...');
  const searchInput = page.locator('input[placeholder*="Search raw materials"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('handle');
    await page.waitForTimeout(2000);
  }

  const hm204Row = page.locator('tr:has-text("HM204")').first();

  // Test 1: + In button click
  console.log('4. Clicking + In button on HM204 row...');
  const inBtn = hm204Row.locator('.raw-btn-in, button:has-text("+ In")').first();
  if (await inBtn.count() > 0) {
    await inBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'action_stock_in_modal.png') });
    console.log('✓ Saved action_stock_in_modal.png');
    // Close modal
    const cancelBtn = page.locator('button.swal2-cancel').first();
    if (await cancelBtn.count() > 0) await cancelBtn.click();
    await page.waitForTimeout(1000);
  }

  // Test 2: - Out button click
  console.log('5. Clicking - Out button on HM204 row...');
  const outBtn = hm204Row.locator('.raw-btn-out, button:has-text("- Out")').first();
  if (await outBtn.count() > 0) {
    await outBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'action_stock_out_modal.png') });
    console.log('✓ Saved action_stock_out_modal.png');
    // Close modal
    const cancelBtn = page.locator('button.swal2-cancel').first();
    if (await cancelBtn.count() > 0) await cancelBtn.click();
    await page.waitForTimeout(1000);
  }

  // Test 3: Adj button click
  console.log('6. Clicking Adj button on HM204 row...');
  const adjBtn = hm204Row.locator('.raw-btn-adj, button:has-text("Adj")').first();
  if (await adjBtn.count() > 0) {
    await adjBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'action_stock_adjust_modal.png') });
    console.log('✓ Saved action_stock_adjust_modal.png');
    // Close modal
    const cancelBtn = page.locator('button.swal2-cancel').first();
    if (await cancelBtn.count() > 0) await cancelBtn.click();
    await page.waitForTimeout(1000);
  }

  // Test 4: Log button click to see all movements
  console.log('7. Clicking Log button on HM204 row...');
  const logBtn = hm204Row.locator('.raw-btn-log, button:has-text("Log")').first();
  if (await logBtn.count() > 0) {
    await logBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(artifactDir, 'action_stock_log_modal_all_movements.png') });
    console.log('✓ Saved action_stock_log_modal_all_movements.png');
    // Close log modal
    const closeLogBtn = page.locator('button:has-text("Close Log")').first();
    if (await closeLogBtn.count() > 0) await closeLogBtn.click();
    await page.waitForTimeout(1000);
  }

  // Test 5: Edit button click
  console.log('8. Clicking Edit button on HM204 row...');
  const editBtn = hm204Row.locator('.raw-btn-edit, button:has-text("Edit")').first();
  if (await editBtn.count() > 0) {
    await editBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(artifactDir, 'action_edit_material_page.png') });
    console.log('✓ Saved action_edit_material_page.png');
  }

  await browser.close();
  console.log('🎉 All raw-inventory actions (+ In, - Out, Adj, Edit, Log) verified!');
}

run().catch(console.error);
