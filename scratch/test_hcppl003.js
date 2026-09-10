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

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[Browser Console ${msg.type()}]:`, msg.text());
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/inventory/') || url.includes('/products')) {
      console.log(`[API Response] ${res.status()} ${res.request().method()} ${url}`);
      if (res.status() >= 400) {
        try {
          console.log(`[API Error Body]:`, await res.text());
        } catch (e) {}
      }
    }
  });

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

  console.log('3. Searching for HCPPL003 in raw materials...');
  const searchInput = page.locator('input[placeholder*="Search raw materials"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('HCPPL003');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: path.join(artifactDir, 'hcppl003_raw_inventory_row.png') });
  console.log('✓ Saved hcppl003_raw_inventory_row.png');

  const row = page.locator('tr:has-text("HCPPL003")').first();
  console.log('Found HCPPL003 row count:', await row.count());

  // 4. Test Log
  console.log('4. Clicking Log on HCPPL003...');
  const logBtn = row.locator('.raw-btn-log, button:has-text("Log")').first();
  if (await logBtn.count() > 0) {
    await logBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(artifactDir, 'hcppl003_log_modal.png') });
    console.log('✓ Saved hcppl003_log_modal.png');
    const closeBtn = page.locator('button:has-text("Close Log")').first();
    if (await closeBtn.count() > 0) await closeBtn.click();
    await page.waitForTimeout(1000);
  }

  // 5. Test + In
  console.log('5. Testing + In on HCPPL003...');
  const inBtn = row.locator('.raw-btn-in, button:has-text("+ In")').first();
  if (await inBtn.count() > 0) {
    await inBtn.click();
    await page.waitForTimeout(1000);
    await page.fill('#swal-qty', '10');
    await page.fill('#swal-remarks', 'Testing + In 10 units');
    await page.click('button.swal2-confirm');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(artifactDir, 'hcppl003_after_stock_in.png') });
    console.log('✓ Saved hcppl003_after_stock_in.png');
  }

  await browser.close();
  console.log('Done testing HCPPL003!');
}

run().catch(console.error);
