const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(() => {});

  await page.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const firstCard = page.locator('.delivery-po-card').first();
  await firstCard.waitFor({ state: 'visible', timeout: 10000 });
  await firstCard.click();
  await page.waitForTimeout(1500);

  const details = await page.evaluate(() => {
    const el = document.querySelector('.inspection-card');
    // Go up 4 parents:
    // 0: inspection-card
    // 1: section 4 wrapper
    // 2: VerifyPODelivery root
    // 3: store-po-workspace-content
    // 4: parent of store-po-workspace-content (the one with height 724px)
    let p = el;
    for (let i = 0; i < 4; i++) {
      if (p) p = p.parentElement;
    }
    return {
      tagName: p.tagName,
      className: p.className,
      id: p.id,
      outerHTML: p.outerHTML.slice(0, 300),
      styleAttr: p.getAttribute('style'),
      matchedCSSRules: Array.from(document.styleSheets).flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules || []).filter(rule => rule.selectorText && p.matches(rule.selectorText)).map(r => ({ selector: r.selectorText, cssText: r.cssText }));
        } catch { return []; }
      })
    };
  });

  console.log('Parent 4 details:', JSON.stringify(details, null, 2));
  await browser.close();
})();
