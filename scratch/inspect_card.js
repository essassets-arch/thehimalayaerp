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

  const cardInfo = await page.evaluate(() => {
    const card = document.querySelector('.bulk-indent-modal-body .mobile-only > div');
    if (!card) return null;
    return {
      cardClientHeight: card.clientHeight,
      cardScrollHeight: card.scrollHeight,
      cardOffsetHeight: card.offsetHeight,
      children: Array.from(card.children).map(c => ({
        tag: c.tagName,
        cls: c.className,
        h: c.offsetHeight,
        innerHTML: c.innerHTML.slice(0, 100)
      }))
    };
  });

  console.log(JSON.stringify(cardInfo, null, 2));
  await browser.close();
})();
