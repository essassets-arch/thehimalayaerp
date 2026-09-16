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

    const screenshotPath = path.resolve(__dirname, 'plant_head_products_verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('✓ Screenshot saved to:', screenshotPath);

    // Copy screenshot to artifacts folder
    const artifactPath = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\55d5cea9-1543-4ed9-9232-f07703cec640\\plant_head_products_verified.png';
    fs.copyFileSync(screenshotPath, artifactPath);
    console.log('✓ Copied screenshot to artifacts directory:', artifactPath);

    // Extract text from table rows
    const rows = await page.$$eval('tbody tr', trs => trs.slice(0, 8).map(tr => tr.innerText.replace(/\s+/g, ' ')));
    console.log(`Rendered ${rows.length} rows on first page:`);
    rows.forEach((r, idx) => console.log(`  Row ${idx + 1}: ${r}`));

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture().catch(console.error).finally(() => process.exit(0));
