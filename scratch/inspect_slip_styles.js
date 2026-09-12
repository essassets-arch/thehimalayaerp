const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 23.8315, longitude: 91.2868 },
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  const allowBtn = page.locator('button:has-text("Re-check & Allow All")');
  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.goto('http://localhost:3000/hr/salary/prepare');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  const viewSlipBtn = page.locator('button:has-text("View Slip"):visible, button.btn-view:visible').first();
  await viewSlipBtn.click();
  await page.waitForTimeout(2000);

  const inspection = await page.evaluate(() => {
    const table = document.querySelector('.salary-slip-emp-table');
    const tr = table ? table.querySelector('tr') : null;
    const td = table ? table.querySelector('td') : null;

    function getMatchedRules(el) {
      if (!el) return [];
      const rules = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            if (rule.selectorText && el.matches(rule.selectorText)) {
              rules.push({ selector: rule.selectorText, cssText: rule.cssText, href: sheet.href });
            }
            if (rule.cssRules) {
              for (const subRule of Array.from(rule.cssRules)) {
                if (subRule.selectorText && el.matches(subRule.selectorText)) {
                  rules.push({ media: rule.conditionText, selector: subRule.selectorText, cssText: subRule.cssText, href: sheet.href });
                }
              }
            }
          }
        } catch (e) {}
      }
      return rules;
    }

    return {
      tableDisplay: table ? window.getComputedStyle(table).display : null,
      trDisplay: tr ? window.getComputedStyle(tr).display : null,
      tdDisplay: td ? window.getComputedStyle(td).display : null,
      tdWidth: td ? window.getComputedStyle(td).width : null,
      tdRules: getMatchedRules(td),
      trRules: getMatchedRules(tr),
      tableRules: getMatchedRules(table),
    };
  });

  console.log('INSPECTION RESULT:', JSON.stringify(inspection, null, 2));

  await browser.close();
})();
