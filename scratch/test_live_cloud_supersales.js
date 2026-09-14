const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testLiveSuperSales() {
  console.log('Launching browser to test SuperSales on https://thehimalaya.cloud...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // 1. Test SuperSales 1
    console.log('\n==============================');
    console.log('TESTING SUPERSALES 1 ON LIVE');
    console.log('==============================');
    await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.fill('input[type="email"], input[name="email"]', 'supersales1@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'supersales123');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 20000 });
    console.log('✓ Logged in as SuperSales 1. Current URL:', page.url());

    // Navigate to /supersales/quotations
    console.log('Navigating to /supersales/quotations...');
    await page.goto('https://thehimalaya.cloud/supersales/quotations', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('Current URL after navigation:', page.url());

    // Wait for quotation table / view buttons
    const ss1ViewBtn = page.locator('button[title="View Quotation"]').first();
    await ss1ViewBtn.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Found View Quotation button for SuperSales 1, clicking...');
    await ss1ViewBtn.click({ force: true });

    const printable1 = page.locator('#quotation-printable-area');
    await printable1.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ Quotation view modal opened for SuperSales 1.');

    const footerText1 = await printable1.innerText();
    console.log('\n--- SUPERSALES 1 MODAL FOOTER ---');
    console.log(footerText1.slice(-350));
    console.log('---------------------------------');
    const ss1Success = footerText1.includes('+91 8488811670') || footerText1.includes('8488811670');
    console.log('SuperSales 1 has "+91 8488811670":', ss1Success);
    console.log('Contains old default "+91 84888 11609":', footerText1.includes('+91 84888 11609'));

    const shot1Path = path.join(screenshotsDir, 'live_cloud_supersales1.png');
    await printable1.screenshot({ path: shot1Path });
    console.log(`Saved screenshot to ${shot1Path}`);

    // Close modal
    const closeBtn = page.locator('button:has-text("Close"), button[aria-label="Close"], svg.lucide-x').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click({ force: true });
      await page.waitForTimeout(1000);
    }

    // Clear session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // 2. Test SuperSales 2
    console.log('\n==============================');
    console.log('TESTING SUPERSALES 2 ON LIVE');
    console.log('==============================');
    await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.fill('input[type="email"], input[name="email"]', 'supersales2@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'supersales124');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 20000 });
    console.log('✓ Logged in as SuperSales 2. Current URL:', page.url());

    // Navigate to /supersales/quotations
    console.log('Navigating to /supersales/quotations...');
    await page.goto('https://thehimalaya.cloud/supersales/quotations', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('Current URL after navigation:', page.url());

    const ss2ViewBtn = page.locator('button[title="View Quotation"]').first();
    await ss2ViewBtn.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Found View Quotation button for SuperSales 2, clicking...');
    await ss2ViewBtn.click({ force: true });

    const printable2 = page.locator('#quotation-printable-area');
    await printable2.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ Quotation view modal opened for SuperSales 2.');

    const footerText2 = await printable2.innerText();
    console.log('\n--- SUPERSALES 2 MODAL FOOTER ---');
    console.log(footerText2.slice(-350));
    console.log('---------------------------------');
    const ss2Success = footerText2.includes('+91 9033516045') || footerText2.includes('9033516045');
    console.log('SuperSales 2 has "+91 9033516045":', ss2Success);
    console.log('Contains old default "+91 84888 11609":', footerText2.includes('+91 84888 11609'));

    const shot2Path = path.join(screenshotsDir, 'live_cloud_supersales2.png');
    await printable2.screenshot({ path: shot2Path });
    console.log(`Saved screenshot to ${shot2Path}`);

    console.log('\n=======================================');
    console.log(`FINAL RESULT: SuperSales 1 = ${ss1Success ? 'PASSED' : 'FAILED'}, SuperSales 2 = ${ss2Success ? 'PASSED' : 'FAILED'}`);
    console.log('=======================================');

  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
}

testLiveSuperSales().catch(console.error);
