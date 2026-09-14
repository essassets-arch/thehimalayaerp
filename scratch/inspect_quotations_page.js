const { chromium } = require('playwright');
const path = require('path');

async function inspectPage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));

  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'sales1@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'Himalaya@2026');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/login'));

    await page.goto('http://localhost:3000/sales/quotations', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const screenshotPath = path.join(__dirname, 'screenshots', 'page_state.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot to ${screenshotPath}`);

    // Check all buttons on the page
    const buttons = await page.locator('button').evaluateAll(els =>
      els.map(el => ({ text: el.innerText.trim(), title: el.title, className: el.className }))
    );
    console.log('Buttons on page:', buttons.slice(0, 20));

    // Check table rows
    const rows = await page.locator('table tr').evaluateAll(els =>
      els.map(el => el.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean)
    );
    console.log('Table rows:', rows.slice(0, 5));
  } finally {
    await browser.close();
  }
}

inspectPage().catch(console.error);
