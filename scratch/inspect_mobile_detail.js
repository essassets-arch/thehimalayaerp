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
    const mobileCards = document.querySelectorAll('.mobile-only');
    const list = [];
    mobileCards.forEach((mc, i) => {
      list.push({
        i,
        parentTag: mc.parentElement.tagName,
        parentClass: mc.parentElement.className,
        parentStyle: mc.parentElement.getAttribute('style'),
        mcClientHeight: mc.clientHeight,
        mcScrollHeight: mc.scrollHeight,
        parentClientHeight: mc.parentElement.clientHeight,
        parentScrollHeight: mc.parentElement.scrollHeight,
      });
    });
    return list;
  });

  console.log('Mobile Cards Elements:', JSON.stringify(res, null, 2));
  await browser.close();
})();
