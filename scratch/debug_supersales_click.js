const { chromium } = require('playwright');
const path = require('path');

async function debugClick() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER PAGE ERROR:', err.message));

  await page.goto('https://thehimalaya.cloud/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"]', 'supersales1@himalayaerp.com');
  await page.fill('input[type="password"]', 'supersales123');
  await page.click('button[type="submit"]');

  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 20000 });
  console.log('Logged in, URL:', page.url());

  await page.goto('https://thehimalaya.cloud/supersales/quotations', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const viewBtn = page.locator('button[title="View Quotation"]').first();
  console.log('View button count:', await viewBtn.count());
  if (await viewBtn.count() > 0) {
    console.log('Clicking view button...');
    await viewBtn.click();
    await page.waitForTimeout(3000);

    const hasPrintable = await page.locator('#quotation-printable-area').count();
    console.log('#quotation-printable-area count:', hasPrintable);

    // Check all modals or dialogs or visible elements
    const modals = await page.evaluate(() => {
      const allModals = Array.from(document.querySelectorAll('.fixed, [role="dialog"], [class*="modal"]')).map(el => ({
        tag: el.tagName,
        className: el.className,
        id: el.id,
        textSnippet: el.innerText ? el.innerText.slice(0, 150) : ''
      }));
      return allModals;
    });
    console.log('Modals found:', modals);

    await page.screenshot({ path: path.join(__dirname, 'screenshots', 'debug_supersales_click.png') });
  }

  await browser.close();
}

debugClick().catch(console.error);
