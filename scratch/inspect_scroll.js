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

  // Add 5 product rows
  for (let i = 0; i < 5; i++) {
    await page.click('button:has-text("Add Product Row")');
    await page.waitForTimeout(100);
  }

  const res = await page.evaluate(() => {
    const box = document.querySelector('.bulk-indent-modal-box');
    const nodes = [];
    function scan(el, depth = 0) {
      if (!el || depth > 4) return;
      const cs = window.getComputedStyle(el);
      nodes.push({
        tag: el.tagName,
        cls: el.className,
        depth,
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
        offsetHeight: el.offsetHeight,
        overflow: cs.overflow,
        overflowY: cs.overflowY,
        maxHeight: cs.maxHeight,
        height: cs.height,
        flex: cs.flex,
        minHeight: cs.minHeight
      });
      for (const child of el.children) {
        scan(child, depth + 1);
      }
    }
    scan(box);
    return nodes;
  });

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
