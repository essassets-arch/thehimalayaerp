const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testUI() {
  console.log('Launching browser to test UI Quotation View...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // ---------------------------------------------------------
    // TEST 1: Sales 1 logs in and views QU/2627/0072
    // ---------------------------------------------------------
    console.log('\n--- 1. Testing Sales 1 Quotation View ---');
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });

    await page.fill('input[type="email"], input[name="email"]', 'sales1@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'Himalaya@2026');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✓ Sales 1 logged in successfully.');

    console.log('Navigating to /sales/quotations...');
    await page.goto('http://localhost:3000/sales/quotations', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Filter or find QU/2627/0072
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('QU/2627/0072');
      await page.waitForTimeout(1500);
    }

    const quoteSpan = page.locator('span:has-text("QU/2627/0072")');
    if (await quoteSpan.count() > 0) {
      console.log('Found span with QU/2627/0072, clicking to open preview...');
      await quoteSpan.first().click({ force: true });
    } else {
      console.log('Clicking first button[title="View Quotation"] with force...');
      const viewBtn = page.locator('button[title="View Quotation"]').first();
      await viewBtn.click({ force: true });
    }

    const printableArea = page.locator('#quotation-printable-area');
    await printableArea.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ Quotation modal / printable area is visible.');

    const footerText1 = await printableArea.innerText();
    console.log('Printable area footer contains "+91 9586040153":', footerText1.includes('+91 9586040153'));
    console.log('Printable area footer contains "9586040153":', footerText1.includes('9586040153'));
    console.log('Printable area footer contains "+91 84888 11609":', footerText1.includes('+91 84888 11609'));

    const screenshotPath1 = path.join(screenshotsDir, 'sales1_quote_view.png');
    await printableArea.screenshot({ path: screenshotPath1 });
    console.log(`✓ Saved Sales 1 screenshot to ${screenshotPath1}`);

    if (!footerText1.includes('9586040153')) {
      throw new Error(`Quotation footer does not contain Sales 1 mobile! Content:\n${footerText1.slice(-300)}`);
    }
    if (footerText1.includes('+91 84888 11609')) {
      throw new Error('Default company phone +91 84888 11609 is still displayed for Sales 1 quotation!');
    }
    console.log('✓ PASS: Sales 1 quotation correctly displays +91 9586040153!');

    // Close modal
    const closeBtn = page.locator('button:has-text("Close"), button[aria-label="Close"], .sheet-actions button').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(1000);

    // ---------------------------------------------------------
    // TEST 2: Sales 2 logs in and views QT/2627/0266
    // ---------------------------------------------------------
    console.log('\n--- 2. Testing Sales 2 Quotation View (Isolation) ---');
    // Clear cookies & storage to re-login
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"], input[name="email"]', 'sales2@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'Himalaya@2026');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✓ Sales 2 logged in successfully.');

    await page.goto('http://localhost:3000/sales/quotations', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const searchInput2 = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput2.count() > 0) {
      await searchInput2.fill('QT/2627/0266');
      await page.waitForTimeout(1500);
    }

    const quoteSpan2 = page.locator('span:has-text("QT/2627/0266")');
    if (await quoteSpan2.count() > 0) {
      console.log('Found span with QT/2627/0266, clicking to open preview...');
      await quoteSpan2.first().click({ force: true });
    } else {
      console.log('Clicking first button[title="View Quotation"] with force...');
      const viewBtn = page.locator('button[title="View Quotation"]').first();
      await viewBtn.click({ force: true });
    }

    await printableArea.waitFor({ state: 'visible', timeout: 10000 });
    const footerText2 = await printableArea.innerText();

    console.log('Printable area footer contains "+91 9998521843":', footerText2.includes('+91 9998521843'));
    console.log('Printable area footer contains "9998521843":', footerText2.includes('9998521843'));
    console.log('Printable area footer contains "+91 9586040153" (Sales 1 leakage):', footerText2.includes('9586040153'));
    console.log('Printable area footer contains "+91 84888 11609":', footerText2.includes('+91 84888 11609'));

    const screenshotPath2 = path.join(screenshotsDir, 'sales2_quote_view.png');
    await printableArea.screenshot({ path: screenshotPath2 });
    console.log(`✓ Saved Sales 2 screenshot to ${screenshotPath2}`);

    if (!footerText2.includes('9998521843')) {
      throw new Error(`Quotation footer does not contain Sales 2 mobile! Content:\n${footerText2.slice(-300)}`);
    }
    if (footerText2.includes('9586040153')) {
      throw new Error('Data leakage! Sales 1 mobile was found in Sales 2 quotation view!');
    }
    if (footerText2.includes('+91 84888 11609')) {
      throw new Error('Default company phone +91 84888 11609 is still displayed for Sales 2 quotation!');
    }
    console.log('✓ PASS: Sales 2 quotation correctly displays +91 9998521843 without any leakage!');

    console.log('\n>>> ALL BROWSER UI CHECKS PASSED SUCCESSFULLY! <<<');

  } finally {
    await browser.close();
  }
}

testUI().catch(err => {
  console.error('Playwright UI test error:', err);
  process.exit(1);
});
