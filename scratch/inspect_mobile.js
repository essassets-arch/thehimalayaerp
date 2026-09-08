const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForTimeout(1500);
  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(600);

  const cardHtml = await page.evaluate(() => {
    const card = document.querySelector('.bulk-indent-mobile-card');
    return card ? card.outerHTML : 'no card';
  });
  console.log('Card HTML:', cardHtml.slice(0, 500));

  const listRect = await page.evaluate(() => {
    const el = document.querySelector('.bulk-indent-mobile-list');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, height: r.height, scrollHeight: el.scrollHeight };
  });
  console.log('List rect:', listRect);

  const cardRect = await page.evaluate(() => {
    const el = document.querySelector('.bulk-indent-mobile-card');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, height: r.height };
  });
  console.log('Card rect:', cardRect);

  await browser.close();
})();
