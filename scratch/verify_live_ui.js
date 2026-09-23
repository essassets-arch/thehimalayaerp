const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\e1b7c3a1-7d4f-4b67-9308-6e7ea4614c3d';

async function verify() {
  console.log('Launching browser to verify https://thehimalaya.cloud/plant-head/products...');
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
    console.log('Logging in as super.admin@himalayaerp.com...');
    await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"], input[name="email"]', 'super.admin@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'SuperAdmin@hcppl');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✓ Logged in! Current URL:', page.url());

    // 1. Visit https://thehimalaya.cloud/plant-head/products
    console.log('Navigating to https://thehimalaya.cloud/plant-head/products...');
    await page.goto('https://thehimalaya.cloud/plant-head/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Dismiss permission overlay if present
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((el) => {
        if (el.innerText && el.innerText.includes('Mandatory Permissions Required')) {
          const backdrop = el.closest('.fixed') || el;
          backdrop.remove();
        }
      });
    });

    await page.waitForTimeout(2000);

    // Capture Overview with KPI cards
    const overviewImg = path.join(ARTIFACT_DIR, 'plant_head_products_overview.png');
    await page.screenshot({ path: overviewImg, fullPage: false });
    console.log('✓ Saved overview screenshot to:', overviewImg);

    // 2. Search for FRP MOULDED GRATING
    console.log('Searching for FRP MOULDED GRATING in search box...');
    const searchInput = await page.$('input[placeholder*="Search"], input[type="text"]');
    if (searchInput) {
      await searchInput.fill('FRP MOULDED GRATING');
      await page.waitForTimeout(2000);
      const searchImg = path.join(ARTIFACT_DIR, 'plant_head_moulded_grating_search.png');
      await page.screenshot({ path: searchImg, fullPage: false });
      console.log('✓ Saved search screenshot to:', searchImg);

      // Extract rows
      const searchRows = await page.$$eval('tbody tr', trs => trs.slice(0, 5).map(tr => tr.innerText.replace(/\s+/g, ' ')));
      console.log('Search results for FRP MOULDED GRATING:');
      searchRows.forEach((r, idx) => console.log(`   ${idx + 1}: ${r}`));

      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(1000);
    }

    // 3. Switch to Trading Products tab
    console.log('Clicking Trading tab...');
    const tradingBtn = await page.$('button:has-text("Trading Products"), button:has-text("Trading"), button:has-text("Sahad")');
    if (tradingBtn) {
      await tradingBtn.click();
      await page.waitForTimeout(2000);

      const tradingImg = path.join(ARTIFACT_DIR, 'plant_head_trading_tab.png');
      await page.screenshot({ path: tradingImg, fullPage: false });
      console.log('✓ Saved trading tab screenshot to:', tradingImg);

      const tradingRows = await page.$$eval('tbody tr', trs => trs.slice(0, 8).map(tr => tr.innerText.replace(/\s+/g, ' ')));
      console.log('Trading tab rows:');
      tradingRows.forEach((r, idx) => console.log(`   ${idx + 1}: ${r}`));
    }

    // 4. Visit Plant Head Dashboard to verify Incoming Orders
    console.log('Navigating to https://thehimalaya.cloud/plant-head/dashboard...');
    await page.goto('https://thehimalaya.cloud/plant-head/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Dismiss overlay again if present
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((el) => {
        if (el.innerText && el.innerText.includes('Mandatory Permissions Required')) {
          const backdrop = el.closest('.fixed') || el;
          backdrop.remove();
        }
      });
    });

    const dashboardImg = path.join(ARTIFACT_DIR, 'plant_head_dashboard_verified.png');
    await page.screenshot({ path: dashboardImg, fullPage: false });
    console.log('✓ Saved Plant Head Dashboard screenshot to:', dashboardImg);

  } catch (err) {
    console.error('Error in verification:', err);
  } finally {
    await browser.close();
  }
}

verify().catch(console.error);
