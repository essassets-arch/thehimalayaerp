const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);
  await page.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const matchedRules = await page.evaluate(() => {
    const tr = document.querySelector('.pd-nested-table tbody tr');
    const results = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.selectorText && tr.matches(rule.selectorText)) {
            results.push({
              href: sheet.href,
              selector: rule.selectorText,
              cssText: rule.cssText
            });
          }
        }
      } catch (e) {}
    }
    return results;
  });
  console.log('Matched rules:', matchedRules);
  await browser.close();
}
main().catch(console.error);
