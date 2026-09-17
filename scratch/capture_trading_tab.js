const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureTradingTab() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['notifications', 'geolocation'],
    geolocation: { latitude: 23.0225, longitude: 72.5714 },
  });

  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
      window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
      window.__PLAYWRIGHT_TEST__ = true;
    } catch (e) {}
  });

  const page = await context.newPage();
  await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"], input[name="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[name="password"]', 'SuperAdmin@hcppl');
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });

  await page.goto('https://thehimalaya.cloud/plant-head/products', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Dismiss modal
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach((el) => {
      if (el.innerText && el.innerText.includes('Mandatory Permissions Required')) {
        const backdrop = el.closest('.fixed') || el;
        backdrop.remove();
      }
    });
  });

  // Click the tab filter for Trading (Dispatch 2 - Sahad Dispatch)
  const tab = page.locator('button', { hasText: 'Trading (Dispatch 2 - Sahad Dispatch)' });
  await tab.click();
  await page.waitForTimeout(2000);

  const shotPath = path.resolve('scratch', 'trading_tab_selected.png');
  await page.screenshot({ path: shotPath, fullPage: false });

  const artifactPath = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\55d5cea9-1543-4ed9-9232-f07703cec640\\trading_tab_selected.png';
  fs.copyFileSync(shotPath, artifactPath);
  console.log('✓ Captured trading tab view to artifact!');

  const rowCount = await page.$$eval('tbody tr', trs => trs.length);
  console.log(`Rendered ${rowCount} rows on Trading tab`);

  await browser.close();
}

captureTradingTab().catch(console.error).finally(() => process.exit(0));
