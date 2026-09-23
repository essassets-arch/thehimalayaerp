const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\e1b7c3a1-7d4f-4b67-9308-6e7ea4614c3d';

async function testSearch() {
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

  try {
    await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
    await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✓ Logged in!');

    await page.goto('https://thehimalaya.cloud/plant-head/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Dismiss permission overlay
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((el) => {
        if (el.innerText && el.innerText.includes('Mandatory Permissions Required')) {
          const backdrop = el.closest('.fixed') || el;
          backdrop.remove();
        }
      });
    });
    await page.waitForTimeout(1000);

    // Get Trading button text
    const tradingButtonText = await page.$eval('button:has-text("Trading (Dispatch 2"), button:has-text("Trading (D2)")', el => el.innerText);
    console.log('Trading button text in Submenu:', tradingButtonText);

    // Click Trading tab
    const tradingBtn = await page.$('button:has-text("Trading (Dispatch 2"), button:has-text("Trading (D2)")');
    if (tradingBtn) {
      await tradingBtn.click();
      await page.waitForTimeout(2000);
    }

    // Now search in .search-box input
    const catalogSearchInput = await page.$('.search-box input, input[placeholder*="code, name"]');
    console.log('Found catalog search input:', !!catalogSearchInput);
    if (catalogSearchInput) {
      await catalogSearchInput.fill('MOULDED');
      await page.waitForTimeout(2000);

      const mouldedScreenshot = path.join(ARTIFACT_DIR, 'trading_moulded_gratings.png');
      await page.screenshot({ path: mouldedScreenshot, fullPage: false });
      console.log('✓ Saved moulded gratings screenshot to:', mouldedScreenshot);

      const rows = await page.$$eval('tbody tr', trs => trs.map(tr => tr.innerText.replace(/\s+/g, ' ')));
      console.log(`Rendered ${rows.length} rows for search 'MOULDED':`);
      rows.forEach((r, idx) => console.log(`   ${idx + 1}: ${r}`));

      // Also search for RCC HUME PIPE
      await catalogSearchInput.fill('HUME PIPE');
      await page.waitForTimeout(2000);
      const humeRows = await page.$$eval('tbody tr', trs => trs.map(tr => tr.innerText.replace(/\s+/g, ' ')));
      console.log(`\nRendered ${humeRows.length} rows for search 'HUME PIPE':`);
      humeRows.forEach((r, idx) => console.log(`   ${idx + 1}: ${r}`));

      // Also search for FRCSQRC
      await catalogSearchInput.fill('FRCSQRC');
      await page.waitForTimeout(2000);
      const frcRows = await page.$$eval('tbody tr', trs => trs.slice(0, 5).map(tr => tr.innerText.replace(/\s+/g, ' ')));
      console.log(`\nRendered ${frcRows.length} rows for search 'FRCSQRC':`);
      frcRows.forEach((r, idx) => console.log(`   ${idx + 1}: ${r}`));

      // Clear search
      await catalogSearchInput.fill('');
      await page.waitForTimeout(2000);

      const allTradingScreenshot = path.join(ARTIFACT_DIR, 'all_trading_products_tab.png');
      await page.screenshot({ path: allTradingScreenshot, fullPage: false });
      console.log('✓ Saved all trading products screenshot to:', allTradingScreenshot);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

testSearch().catch(console.error);
