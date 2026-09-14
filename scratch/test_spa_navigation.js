const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testSpa() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    await page.addInitScript(() => {
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
      window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
      window.__PLAYWRIGHT_TEST__ = true;
    });

    // =========================================================================
    // PART 1: Sales 1 Login and View QU/2627/0072
    // =========================================================================
    console.log('\n================================================================');
    console.log('PART 1: Sales 1 Login and View Quotation QU/2627/0072');
    console.log('================================================================');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'sales1@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'Himalaya@2026');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✓ Sales 1 logged in. Current URL:', page.url());

    console.log('Navigating to Quotations via sidebar...');
    const quoteLink = page.locator('a[href*="/sales/quotations"], nav a:has-text("Quotation"), a:has-text("Quotations")').first();
    await quoteLink.click();
    await page.waitForURL(url => url.pathname.includes('/sales/quotations'), { timeout: 15000 });
    console.log('✓ On Quotations page.');

    await page.waitForTimeout(2000);

    let row0072 = page.locator('tr:has-text("QU/2627/0072")');
    let rowCount = await row0072.count();
    console.log('Row count for QU/2627/0072 on page 1:', rowCount);

    if (rowCount === 0) {
      console.log('Not on page 1, clicking "Next" pagination button...');
      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.count() > 0) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
      row0072 = page.locator('tr:has-text("QU/2627/0072")');
      rowCount = await row0072.count();
      console.log('Row count for QU/2627/0072 on page 2:', rowCount);
    }

    if (rowCount === 0) {
      throw new Error('Quotation QU/2627/0072 not found in table!');
    }

    console.log('Clicking "View Quotation" for QU/2627/0072...');
    const viewBtn0072 = row0072.locator('button[title="View Quotation"]').first();
    await viewBtn0072.click({ force: true });

    const printableArea = page.locator('#quotation-printable-area');
    await printableArea.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ Quotation QU/2627/0072 modal opened.');

    const footerText1 = await printableArea.innerText();
    const hasSales1Phone = footerText1.includes('+91 9586040153') || footerText1.includes('9586040153');
    const hasDefaultPhone = footerText1.includes('+91 84888 11609');

    console.log('Footer contains Sales 1 phone (+91 9586040153):', hasSales1Phone);
    console.log('Footer contains default company phone (+91 84888 11609):', hasDefaultPhone);

    const shot1 = path.join(screenshotsDir, 'qu_0072_modal.png');
    await printableArea.screenshot({ path: shot1 });
    console.log(`✓ Saved screenshot to ${shot1}`);

    if (!hasSales1Phone) {
      throw new Error(`Quotation QU/2627/0072 does not display Sales 1 mobile 9586040153! Excerpt:\n${footerText1.slice(-400)}`);
    }
    if (hasDefaultPhone) {
      throw new Error(`Quotation QU/2627/0072 still displays default company phone +91 84888 11609!`);
    }
    console.log('✓ PASS: Quotation QU/2627/0072 displays +91 9586040153 correctly!\n');

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // =========================================================================
    // PART 2: Sales 2 Login and View Sales 2 Quotation (Isolation Verification)
    // =========================================================================
    console.log('\n================================================================');
    console.log('PART 2: Sales 2 Login and View Quotation QT/2627/0266 (Isolation)');
    console.log('================================================================');
    // Clear cookies & storage for clean re-login
    await context.clearCookies();
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem('e2e_bypass_permissions', 'true');
    });

    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'sales2@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'Himalaya@2026');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✓ Sales 2 logged in. Current URL:', page.url());

    const quoteLink2 = page.locator('a[href*="/sales/quotations"], nav a:has-text("Quotation"), a:has-text("Quotations")').first();
    await quoteLink2.click();
    await page.waitForURL(url => url.pathname.includes('/sales/quotations'), { timeout: 15000 });
    console.log('✓ Sales 2 on Quotations page.');

    await page.waitForTimeout(2000);

    console.log('Typing "0266" in search input...');
    const searchInput2 = page.locator('input[placeholder="Search quotations..."]');
    await searchInput2.fill('0266');
    await page.waitForTimeout(1000);

    const row0266 = page.locator('tr:has-text("QT/2627/0266")');
    const rowCount2 = await row0266.count();
    console.log('Row count for QT/2627/0266:', rowCount2);

    if (rowCount2 === 0) {
      throw new Error('Quotation QT/2627/0266 not found in table after search!');
    }

    console.log('Clicking "View Quotation" for QT/2627/0266...');
    const viewBtn0266 = row0266.locator('button[title="View Quotation"]').first();
    await viewBtn0266.click({ force: true });

    await printableArea.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ Quotation QT/2627/0266 modal opened.');

    const footerText2 = await printableArea.innerText();
    const hasSales2Phone = footerText2.includes('+91 9998521843') || footerText2.includes('9998521843');
    const hasSales1PhoneLeakage = footerText2.includes('9586040153');
    const hasDefaultPhone2 = footerText2.includes('+91 84888 11609');

    console.log('Footer contains Sales 2 phone (+91 9998521843):', hasSales2Phone);
    console.log('Footer contains Sales 1 phone (9586040153) [DATA LEAKAGE CHECK]:', hasSales1PhoneLeakage);
    console.log('Footer contains default company phone (+91 84888 11609):', hasDefaultPhone2);

    const shot2 = path.join(screenshotsDir, 'sales2_0266_modal.png');
    await printableArea.screenshot({ path: shot2 });
    console.log(`✓ Saved screenshot to ${shot2}`);

    if (!hasSales2Phone) {
      throw new Error(`Quotation QT/2627/0266 does not display Sales 2 mobile 9998521843! Excerpt:\n${footerText2.slice(-400)}`);
    }
    if (hasSales1PhoneLeakage) {
      throw new Error('CRITICAL DATA LEAKAGE: Sales 1 mobile was found in Sales 2 quotation view!');
    }
    if (hasDefaultPhone2) {
      throw new Error('Quotation QT/2627/0266 still displays default company phone +91 84888 11609!');
    }

    console.log('✓ PASS: Sales 2 quotation displays +91 9998521843 with ZERO cross-contamination!\n');

    console.log('================================================================');
    console.log('>>> ALL END-TO-END BROWSER TESTS PASSED PERFECTLY! <<<');
    console.log('================================================================');
  } finally {
    await browser.close();
  }
}

testSpa().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
