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
    function checkRule(rule, sheetHref) {
      if (rule.cssRules) {
        for (const sub of rule.cssRules) {
          checkRule(sub, sheetHref);
        }
      }
      if (rule.selectorText && tr.matches(rule.selectorText)) {
        if (rule.style && rule.style.display) {
          results.push({
            href: sheetHref,
            selector: rule.selectorText,
            media: rule.parentRule ? rule.parentRule.conditionText : null,
            cssText: rule.cssText
          });
        }
      }
    }
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          checkRule(rule, sheet.href);
        }
      } catch (e) {}
    }
    return results;
  });
  console.log('Matched rules with display:', matchedRules);
  await browser.close();
}
main().catch(console.error);
