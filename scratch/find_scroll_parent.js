const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(() => {});

  await page.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const firstCard = page.locator('.delivery-po-card').first();
  await firstCard.waitFor({ state: 'visible', timeout: 10000 });
  await firstCard.click();
  await page.waitForTimeout(1500);

  // Inspect the hierarchy of ancestors of VerifyPODelivery
  const hierarchy = await page.evaluate(() => {
    const el = document.querySelector('.inspection-card') || document.querySelector('h3');
    let curr = el;
    const path = [];
    while (curr && curr !== document.documentElement) {
      const style = window.getComputedStyle(curr);
      path.push({
        tag: curr.tagName,
        className: curr.className,
        id: curr.id,
        height: style.height,
        maxHeight: style.maxHeight,
        overflow: style.overflow,
        overflowY: style.overflowY,
        overflowX: style.overflowX,
        position: style.position,
        scrollHeight: curr.scrollHeight,
        clientHeight: curr.clientHeight,
        scrollTop: curr.scrollTop,
      });
      curr = curr.parentElement;
    }
    return path;
  });

  console.log('Hierarchy from inspection card to html:');
  console.log(JSON.stringify(hierarchy, null, 2));

  await browser.close();
})();
