const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 28.6139, longitude: 77.2090 }
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('[PAGE CONSOLE]:', msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]:', err.message));

  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('http://localhost:3000/finance/po-requests?tab=Delivery%20Audit');
  await page.waitForTimeout(3000);

  const debugInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.da-card'));
    const btns = Array.from(document.querySelectorAll('.da-audit-btn'));
    return {
      cardCount: cards.length,
      btnCount: btns.length,
      firstBtnText: btns[0] ? btns[0].innerText : null,
      firstCardHtml: cards[0] ? cards[0].outerHTML.substring(0, 300) : null
    };
  });
  console.log('Debug info before click:', debugInfo);

  console.log('Attempting click on first .da-audit-btn...');
  await page.click('.da-audit-btn');
  await page.waitForTimeout(2000);

  const afterClickInfo = await page.evaluate(() => {
    return {
      hasDetailView: !!document.querySelector('.da-detail-view'),
      bodyHasAuditGRN: document.body.innerText.includes('Audit GRN:'),
      activeElement: document.activeElement ? document.activeElement.outerHTML : null
    };
  });
  console.log('After click info:', afterClickInfo);

  await page.screenshot({ path: 'scratch/debug_click_result.png' });

  await browser.close();
})();
