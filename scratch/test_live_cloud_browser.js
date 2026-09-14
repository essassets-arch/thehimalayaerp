const { chromium } = require('playwright');
const path = require('path');

async function testLiveBrowser() {
  console.log('Launching browser to inspect live cloud https://thehimalaya.cloud...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    await page.addInitScript(() => {
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
      window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
      window.__PLAYWRIGHT_TEST__ = true;
    });

    console.log('Navigating to live login page...');
    await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'networkidle', timeout: 45000 });

    await page.fill('input[type="email"], input[name="email"]', 'sales1@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'Himalaya@2026');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 20000 });
    console.log('✓ Logged in to live cloud. Current URL:', page.url());

    console.log('Navigating to live /sales/quotations...');
    const quoteLink = page.locator('a[href*="/sales/quotations"], nav a:has-text("Quotation"), a:has-text("Quotations")').first();
    await quoteLink.click();
    await page.waitForURL(url => url.pathname.includes('/sales/quotations'), { timeout: 20000 });
    console.log('✓ On live Quotations page.');

    await page.waitForTimeout(3000);

    // Look for QU/2627/0072
    let row0072 = page.locator('tr:has-text("QU/2627/0072")');
    let rowCount = await row0072.count();
    console.log('Row count for QU/2627/0072 on page 1:', rowCount);

    if (rowCount === 0) {
      console.log('Clicking Next page button...');
      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.count() > 0) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
      row0072 = page.locator('tr:has-text("QU/2627/0072")');
      rowCount = await row0072.count();
      console.log('Row count for QU/2627/0072 on page 2:', rowCount);
    }

    if (rowCount > 0) {
      console.log('Clicking "View Quotation" for QU/2627/0072...');
      const viewBtn = row0072.locator('button[title="View Quotation"]').first();
      await viewBtn.click({ force: true });

      const printableArea = page.locator('#quotation-printable-area');
      await printableArea.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✓ Printable area opened on live cloud.');

      const footerText = await printableArea.innerText();
      console.log('\n--- LIVE CLOUD MODAL FOOTER TEXT EXCERPT ---');
      console.log(footerText.slice(-300));
      console.log('---------------------------------------------');
      console.log('Contains "+91 9586040153":', footerText.includes('+91 9586040153'));
      console.log('Contains "9586040153":', footerText.includes('9586040153'));
      console.log('Contains "+91 84888 11609":', footerText.includes('+91 84888 11609'));

      const shotPath = path.join(__dirname, 'screenshots', 'live_cloud_quote_view.png');
      await printableArea.screenshot({ path: shotPath });
      console.log(`Saved screenshot to ${shotPath}`);
    } else {
      console.log('QU/2627/0072 not found, clicking first View Quotation...');
      const firstBtn = page.locator('button[title="View Quotation"]').first();
      await firstBtn.click({ force: true });
      const printableArea = page.locator('#quotation-printable-area');
      await printableArea.waitFor({ state: 'visible', timeout: 10000 });
      const footerText = await printableArea.innerText();
      console.log('First quotation modal footer text on live cloud:');
      console.log(footerText.slice(-300));
    }
  } finally {
    await browser.close();
  }
}

testLiveBrowser().catch(console.error);
