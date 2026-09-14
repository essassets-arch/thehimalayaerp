const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testSS() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ['geolocation']
  });
  await context.setGeolocation({ latitude: 23.0225, longitude: 72.5714 });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  try {
    // 1. SuperSales 1
    console.log('--- Logging in as SuperSales 1 ---');
    await page.goto('https://thehimalaya.cloud/login');
    await page.fill('input[type="email"]', 'supersales1@himalayaerp.com');
    await page.fill('input[type="password"]', 'supersales123');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('Logged in URL:', page.url());

    // Click Quotation link in sidebar using evaluate to bypass overlay
    console.log('Looking for Quotations in sidebar/nav...');
    const quoteLink = page.locator('nav a:has-text("Quotation"), a[href*="quotation"]').first();
    await quoteLink.waitFor({ state: 'attached', timeout: 10000 });
    await quoteLink.evaluate(el => el.click());
    console.log('Clicked quote link, waiting for table...');
    await page.waitForTimeout(4000);
    console.log('Current URL:', page.url());

    // Locate the first View button
    const viewBtn = page.locator('button[title="View Quotation"]').first();
    await viewBtn.waitFor({ state: 'attached', timeout: 10000 });
    console.log('Clicking View button via evaluate click...');
    await viewBtn.evaluate(el => el.click());

    // Wait for printable area
    const printableArea = page.locator('#quotation-printable-area');
    await printableArea.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✓ Modal opened for SuperSales 1!');

    const text1 = await printableArea.innerText();
    console.log('\n--- SUPERSALES 1 MODAL FOOTER ---');
    console.log(text1.slice(-350));
    console.log('---------------------------------');
    const ss1Success = text1.includes('8488811670');
    console.log('Contains 8488811670:', ss1Success);
    console.log('Contains fallback 84888 11609:', text1.includes('84888 11609'));

    const shot1 = path.join(screenshotsDir, 'live_supersales1_modal.png');
    await printableArea.screenshot({ path: shot1 });
    console.log('Saved live_supersales1_modal.png');

    // Close modal
    await page.evaluate(() => {
      const close = document.querySelector('button[aria-label="Close"], button.close, svg.lucide-x');
      if (close) close.click();
    });
    await page.waitForTimeout(1000);

    // 2. SuperSales 2
    console.log('\n--- Logging in as SuperSales 2 ---');
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto('https://thehimalaya.cloud/login');
    await page.fill('input[type="email"]', 'supersales2@himalayaerp.com');
    await page.fill('input[type="password"]', 'supersales124');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('Logged in URL:', page.url());

    const quoteLink2 = page.locator('nav a:has-text("Quotation"), a[href*="quotation"]').first();
    await quoteLink2.waitFor({ state: 'attached', timeout: 10000 });
    await quoteLink2.evaluate(el => el.click());
    await page.waitForTimeout(4000);
    console.log('Current URL:', page.url());

    const viewBtn2 = page.locator('button[title="View Quotation"]').first();
    await viewBtn2.waitFor({ state: 'attached', timeout: 10000 });
    console.log('Clicking View button via evaluate click...');
    await viewBtn2.evaluate(el => el.click());

    const printableArea2 = page.locator('#quotation-printable-area');
    await printableArea2.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✓ Modal opened for SuperSales 2!');

    const text2 = await printableArea2.innerText();
    console.log('\n--- SUPERSALES 2 MODAL FOOTER ---');
    console.log(text2.slice(-350));
    console.log('---------------------------------');
    const ss2Success = text2.includes('9033516045');
    console.log('Contains 9033516045:', ss2Success);
    console.log('Contains fallback 84888 11609:', text2.includes('84888 11609'));

    const shot2 = path.join(screenshotsDir, 'live_supersales2_modal.png');
    await printableArea2.screenshot({ path: shot2 });
    console.log('Saved live_supersales2_modal.png');

    console.log('\n======================================================');
    console.log(`SUMMARY: SuperSales 1: ${ss1Success ? 'PASSED' : 'FAILED'}, SuperSales 2: ${ss2Success ? 'PASSED' : 'FAILED'}`);
    console.log('======================================================');
  } finally {
    await browser.close();
  }
}

testSS().catch(console.error);
