const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  console.log('Launching browser to capture https://thehimalaya.cloud/plant-head/products...');
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
    console.log('Navigating to login page...');
    await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'domcontentloaded' });

    console.log('Logging in as super.admin@himalayaerp.com...');
    await page.fill('input[type="email"], input[name="email"]', 'super.admin@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'SuperAdmin@hcppl');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('Logged in! Current URL:', page.url());

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

    // 1. Capture Overview with KPI cards
    const overviewScreenshot = path.resolve(__dirname, 'plant_head_products_overview.png');
    await page.screenshot({ path: overviewScreenshot, fullPage: false });
    console.log('✓ Overview screenshot saved to:', overviewScreenshot);

    const artifactOverview = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\55d5cea9-1543-4ed9-9232-f07703cec640\\plant_head_products_overview.png';
    fs.copyFileSync(overviewScreenshot, artifactOverview);

    // 2. Click on the Trading Products Tab / Category
    console.log('Clicking on Trading Products tab / category...');
    const tradingBtn = await page.$('button:has-text("Trading Products (Cat 2)"), button:has-text("Sahad Dispatch"), div:has-text("Trading (Dispatch 2")');
    if (tradingBtn) {
      await tradingBtn.click();
      await page.waitForTimeout(2000);
    } else {
      // Try finding button containing "Trading"
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await btn.innerText();
        if (text.includes('Trading') || text.includes('Sahad')) {
          console.log('Clicking button:', text);
          await btn.click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }

    const tradingScreenshot = path.resolve(__dirname, 'plant_head_trading_products_verified.png');
    await page.screenshot({ path: tradingScreenshot, fullPage: false });
    console.log('✓ Trading screenshot saved to:', tradingScreenshot);

    const artifactTrading = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\55d5cea9-1543-4ed9-9232-f07703cec640\\plant_head_trading_products_verified.png';
    fs.copyFileSync(tradingScreenshot, artifactTrading);

    // Extract table rows
    const rows = await page.$$eval('tbody tr', trs => trs.slice(0, 10).map(tr => tr.innerText.replace(/\s+/g, ' ')));
    console.log(`Rendered ${rows.length} rows on page:`);
    rows.forEach((r, idx) => console.log(`  Row ${idx + 1}: ${r}`));

    // Extract KPI summary values
    const kpis = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div')).filter(d => 
        d.innerText && (d.innerText.includes('Trading Products') || d.innerText.includes('Manufacturing') || d.innerText.includes('Total Products'))
      );
      return cards.slice(0, 6).map(c => c.innerText.replace(/\n+/g, ' | '));
    });
    console.log('KPI Cards:', kpis.slice(0, 3));

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture().catch(console.error).finally(() => process.exit(0));
