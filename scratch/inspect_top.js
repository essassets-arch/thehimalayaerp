const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');
  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(500);
  for (let i = 0; i < 5; i++) {
    await page.click('button:has-text("Add Product Row")');
    await page.waitForTimeout(100);
  }
  const topNodes = await page.evaluate(() => {
    const box = document.querySelector('.bulk-indent-modal-box');
    const body = document.querySelector('.bulk-indent-modal-body');
    return {
      box: {
        clientHeight: box ? box.clientHeight : null,
        scrollHeight: box ? box.scrollHeight : null,
        offsetHeight: box ? box.offsetHeight : null,
        overflow: box ? window.getComputedStyle(box).overflow : null,
        maxHeight: box ? window.getComputedStyle(box).maxHeight : null
      },
      body: {
        clientHeight: body ? body.clientHeight : null,
        scrollHeight: body ? body.scrollHeight : null,
        offsetHeight: body ? body.offsetHeight : null,
        overflow: body ? window.getComputedStyle(body).overflow : null,
        overflowY: body ? window.getComputedStyle(body).overflowY : null,
        flex: body ? window.getComputedStyle(body).flex : null,
        minHeight: body ? window.getComputedStyle(body).minHeight : null
      }
    };
  });
  console.log(JSON.stringify(topNodes, null, 2));
  await browser.close();
})();
