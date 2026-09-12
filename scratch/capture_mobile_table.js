const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\df4eb4aa-ff83-4954-9ea6-fad059d2b490';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
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
  await page.waitForTimeout(3000);

  await page.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3500);

  // Scroll to the first accordion
  const firstAccordion = page.locator('.pd-po-accordion').first();
  await firstAccordion.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const shotPath = path.join(artifactDir, 'mobile_accordion_section.png');
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log('Captured mobile accordion section to:', shotPath);

  // Also capture the nested table inside it
  const nestedTable = firstAccordion.locator('.pd-po-nested-area');
  if (await nestedTable.count() > 0) {
    await nestedTable.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const shotPathTable = path.join(artifactDir, 'mobile_nested_table_current.png');
    await page.screenshot({ path: shotPathTable, fullPage: false });
    console.log('Captured mobile nested table to:', shotPathTable);
  }

  await browser.close();
}

main().catch(console.error);
