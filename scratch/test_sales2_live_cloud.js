const { chromium } = require('playwright');
const path = require('path');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.addInitScript(() => {
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
      window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
      window.__PLAYWRIGHT_TEST__ = true;
    });

    console.log('Logging in as Sales 2 on live cloud...');
    await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'sales2@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'Himalaya@2026');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 20000 });
    console.log('✓ Sales 2 logged in.');

    const quoteLink = page.locator('a[href*="/sales/quotations"], nav a:has-text("Quotation"), a:has-text("Quotations")').first();
    await quoteLink.click();
    await page.waitForURL(url => url.pathname.includes('/sales/quotations'), { timeout: 20000 });
    await page.waitForTimeout(2000);

    const viewBtn = page.locator('button[title="View Quotation"]').first();
    await viewBtn.click({ force: true });

    const printableArea = page.locator('#quotation-printable-area');
    await printableArea.waitFor({ state: 'visible', timeout: 10000 });

    const text = await printableArea.innerText();
    console.log('Contains +91 9998521843:', text.includes('+91 9998521843'));
    console.log('Contains +91 9586040153 (leakage):', text.includes('9586040153'));
    console.log('Contains +91 84888 11609 (default):', text.includes('84888 11609'));

    const shotPath = path.join(__dirname, 'screenshots', 'live_cloud_sales2.png');
    await printableArea.screenshot({ path: shotPath });
    console.log(`Saved screenshot to ${shotPath}`);

    console.log('\n--- Excerpt ---');
    console.log(text.slice(-300));
  } finally {
    await browser.close();
  }
}

test().catch(console.error);
