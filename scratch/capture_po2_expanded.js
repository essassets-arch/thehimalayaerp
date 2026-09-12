const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\df4eb4aa-ff83-4954-9ea6-fad059d2b490';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });

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

  const poCards = page.locator('.pd-po-accordion');
  const count = await poCards.count();
  console.log(`Found ${count} POs.`);

  // Find PO-2026-000005
  for (let i = 0; i < count; i++) {
    const text = await poCards.nth(i).textContent();
    if (text.includes('PO-2026-000005')) {
      console.log(`Found PO-2026-000005 at index ${i}`);
      const isExpanded = await poCards.nth(i).locator('.pd-nested-table').count() > 0;
      if (!isExpanded) {
        await poCards.nth(i).locator('.pd-po-row-header').click();
        await page.waitForTimeout(1000);
      }
      
      const matLines = poCards.nth(i).locator('.pd-nested-table tbody tr');
      const mCount = await matLines.count();
      console.log(`PO-2026-000005 lines (${mCount}):`);
      for (let j = 0; j < mCount; j++) {
        console.log(`  Line ${j + 1}:`, (await matLines.nth(j).textContent()).replace(/\s+/g, ' ').trim());
      }

      const shotPath = path.join(artifactDir, 'po_2026_000005_expanded.png');
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log('✓ Captured PO-2026-000005 expanded:', shotPath);
    }
  }

  await browser.close();
}

main().catch(console.error);
