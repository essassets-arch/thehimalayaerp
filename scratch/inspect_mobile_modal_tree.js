const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(600);

  const res = await page.evaluate(() => {
    const box = document.querySelector('.bulk-indent-modal-box');
    const header = document.querySelector('.bulk-indent-modal-header');
    const body = document.querySelector('.bulk-indent-modal-body');
    const overlay = document.querySelector('.bulk-indent-modal-overlay');

    const bodyChildren = Array.from(body.children).map(c => ({
      tag: c.tagName,
      cls: c.className,
      clientHeight: c.clientHeight,
      scrollHeight: c.scrollHeight,
      offsetHeight: c.offsetHeight,
      style: c.getAttribute('style')
    }));

    return {
      windowHeight: window.innerHeight,
      overlay: {
        clientHeight: overlay.clientHeight,
        scrollHeight: overlay.scrollHeight
      },
      box: {
        clientHeight: box.clientHeight,
        scrollHeight: box.scrollHeight,
        computedMaxHeight: window.getComputedStyle(box).maxHeight,
        computedHeight: window.getComputedStyle(box).height,
      },
      header: {
        clientHeight: header.clientHeight
      },
      body: {
        clientHeight: body.clientHeight,
        scrollHeight: body.scrollHeight,
        computedHeight: window.getComputedStyle(body).height,
        computedMaxHeight: window.getComputedStyle(body).maxHeight,
        computedOverflowY: window.getComputedStyle(body).overflowY
      },
      bodyChildren
    };
  });

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
