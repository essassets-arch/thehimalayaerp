const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

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
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('Navigating to Delivery Audit...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Delivery%20Audit');
  await page.waitForTimeout(3000);

  // Click on GRN-2026-000015
  const grn15Card = page.locator('.da-card', { hasText: 'GRN-2026-000015' }).first();
  await grn15Card.locator('.da-audit-btn').click();
  await page.waitForTimeout(1500);

  const topShot = path.join(artifactDir, 'grn15_verified_top.png');
  await page.screenshot({ path: topShot });
  console.log('✓ Captured top view:', topShot);

  // Scroll to decision card and capture bottom
  const decisionCard = page.locator('.da-decision-card');
  await decisionCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const bottomShot = path.join(artifactDir, 'grn15_verified_bottom.png');
  await page.screenshot({ path: bottomShot });
  console.log('✓ Captured bottom view:', bottomShot);

  // Extract text of items table
  const tableText = await page.locator('.da-items-table').innerText();
  console.log('\n--- VERIFIED ITEMS TABLE ---');
  console.log(tableText);

  // Extract header sub
  const headerSub = await page.locator('.da-detail-header-sub').innerText();
  console.log('\n--- VERIFIED HEADER SUB ---');
  console.log(headerSub);

  // Extract logistics
  const logisticsText = await page.locator('.da-logistics-grid').innerText();
  console.log('\n--- VERIFIED LOGISTICS GRID ---');
  console.log(logisticsText);

  await browser.close();
})();
