const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['notifications', 'geolocation'],
    geolocation: { latitude: 19.076, longitude: 72.8777 },
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__PLAYWRIGHT_TEST__ = true;
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
    localStorage.setItem('hasDismissedPermissionsModal', 'true');
    sessionStorage.setItem('hasDismissedPermissionsModal', 'true');
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('2. Submitting login form...');
  await page.fill('input[type="email"]', 'sana.r@himalayaerp.com');
  await page.fill('input[type="password"]', 'Himalaya@1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // 3. Check Dispatch 1 (Manufacturing)
  console.log('3. Navigating to Dispatch 1 (/dispatch/sample-dispatch)...');
  await page.goto('http://localhost:3000/dispatch/sample-dispatch', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const d1Rows = await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll('tbody tr'));
    return trs.map((tr) => {
      const tds = Array.from(tr.querySelectorAll('td'));
      return tds.map((td) => td.innerText.replace(/\n+/g, ' | ').trim());
    });
  });
  console.log('\n=== DISPATCH 1 TABLE ROWS ===');
  console.log(JSON.stringify(d1Rows, null, 2));

  const screenshotDir = path.join(__dirname, 'screenshots');
  const fs = require('fs');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  await page.screenshot({ path: path.join(screenshotDir, 'd1_verified.png'), fullPage: true });

  // 4. Check Dispatch 2 (Trading)
  console.log('\n4. Navigating to Dispatch 2 (/dispatch-2/sample-dispatch)...');
  await page.goto('http://localhost:3000/dispatch-2/sample-dispatch', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const d2Rows = await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll('tbody tr'));
    return trs.map((tr) => {
      const tds = Array.from(tr.querySelectorAll('td'));
      return tds.map((td) => td.innerText.replace(/\n+/g, ' | ').trim());
    });
  });
  console.log('\n=== DISPATCH 2 TABLE ROWS ===');
  console.log(JSON.stringify(d2Rows, null, 2));

  await page.screenshot({ path: path.join(screenshotDir, 'd2_verified.png'), fullPage: true });

  // 5. Check Consignment Booking UI
  console.log('\n5. Navigating to Consignment Booking UI (/dispatch/sample-dispatch/create/req-229cc1ae-7549-4e72-8be7-2c2fe678c469)...');
  await page.goto('http://localhost:3000/dispatch/sample-dispatch/create/req-229cc1ae-7549-4e72-8be7-2c2fe678c469', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const consignmentData = await page.evaluate(() => {
    return {
      title: document.querySelector('h1')?.innerText,
      subtitle: document.querySelector('p')?.innerText,
      bodyTextSnippet: document.body.innerText.slice(0, 2000),
    };
  });
  console.log('\n=== CONSIGNMENT BOOKING DATA ===');
  console.log('Title:', consignmentData.title);
  console.log('Snippet:', consignmentData.bodyTextSnippet);

  await page.screenshot({ path: path.join(screenshotDir, 'consignment_verified.png'), fullPage: true });

  await browser.close();
  console.log('\nVerification complete! Screenshots saved.');
}

main().catch(console.error);
