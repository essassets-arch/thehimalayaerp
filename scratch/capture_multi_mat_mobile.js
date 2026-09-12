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
  await page.waitForTimeout(3000);

  // Click second PO row header to expand PO-2026-000005
  const poAccordions = page.locator('.pd-po-accordion');
  if (await poAccordions.count() > 1) {
    const secondPO = poAccordions.nth(1);
    await secondPO.locator('.pd-po-row-header').click();
    await page.waitForTimeout(1000);

    const nestedArea = secondPO.locator('.pd-po-nested-area');
    await nestedArea.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const shotPath = path.join(artifactDir, 'mobile_multi_materials_list_wise.png');
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log('✓ Captured multi-materials mobile list-wise screenshot:', shotPath);
  }

  await browser.close();
}

main().catch(console.error);
