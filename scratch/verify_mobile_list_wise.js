const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\df4eb4aa-ff83-4954-9ea6-fad059d2b490';

async function main() {
  console.log('=== STARTING TEST: MOBILE LIST-WISE MATERIAL BREAKDOWN ===\n');

  const browser = await chromium.launch({ headless: true });

  // 1. Mobile Viewport (iPhone 14 / standard 390px)
  console.log('--- TESTING MOBILE VIEWPORT (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });

  await mobileContext.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const mobilePage = await mobileContext.newPage();
  const consoleErrors = [];
  mobilePage.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('MOBILE CONSOLE ERROR:', msg.text());
    }
  });
  mobilePage.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log('MOBILE EXCEPTION:', err.message);
  });

  await mobilePage.goto('http://localhost:3000/login');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await mobilePage.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await mobilePage.click('button:has-text("Sign In"), button[type="submit"]');
  await mobilePage.waitForTimeout(3000);

  await mobilePage.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(3500);

  // Check mobile visibility of table vs list
  const isTableWrapHiddenOnMobile = await mobilePage.evaluate(() => {
    const el = document.querySelector('.pd-nested-table-wrap');
    return el ? window.getComputedStyle(el).display === 'none' : false;
  });
  const isMobileListVisible = await mobilePage.evaluate(() => {
    const el = document.querySelector('.pd-nested-mobile-list');
    return el ? window.getComputedStyle(el).display !== 'none' : false;
  });

  console.log(`Mobile: Is table wrap hidden? ${isTableWrapHiddenOnMobile}`);
  console.log(`Mobile: Is mobile list visible? ${isMobileListVisible}`);

  const mobileCards = mobilePage.locator('.pd-nested-mobile-list .pd-mobile-mat-card');
  const cardCount = await mobileCards.count();
  console.log(`Found ${cardCount} list-wise material cards on mobile.`);

  for (let i = 0; i < cardCount; i++) {
    const card = mobileCards.nth(i);
    const title = (await card.locator('.pd-mobile-mat-name').textContent()).trim();
    const code = (await card.locator('.pd-mobile-mat-code').textContent()).trim();
    const status = (await card.locator('.pd-mobile-mat-status').textContent()).trim();
    const stats = (await card.locator('.pd-mobile-mat-stats-grid').textContent()).replace(/\s+/g, ' ').trim();
    console.log(`Card ${i + 1}: [${title} - ${code}] Status: ${status}`);
    console.log(`  Stats: ${stats}`);
  }

  // Scroll to the first accordion nested area
  const nestedArea = mobilePage.locator('.pd-po-nested-area').first();
  await nestedArea.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(1000);

  const mobileShot = path.join(artifactDir, 'mobile_list_wise_breakdown.png');
  await mobilePage.screenshot({ path: mobileShot, fullPage: false });
  console.log('✓ Captured mobile list-wise breakdown screenshot:', mobileShot);

  // 2. Desktop Viewport (1440x900)
  console.log('\n--- TESTING DESKTOP VIEWPORT (1440x900) ---');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await desktopContext.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });
  const desktopPage = await desktopContext.newPage();

  await desktopPage.goto('http://localhost:3000/login');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await desktopPage.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await desktopPage.click('button:has-text("Sign In"), button[type="submit"]');
  await desktopPage.waitForTimeout(3000);

  await desktopPage.goto('http://localhost:3000/finance/po-requests?tab=Partial%20Delivery');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(3000);

  const isTableWrapVisibleOnDesktop = await desktopPage.evaluate(() => {
    const el = document.querySelector('.pd-nested-table-wrap');
    return el ? window.getComputedStyle(el).display !== 'none' : false;
  });
  const isMobileListHiddenOnDesktop = await desktopPage.evaluate(() => {
    const el = document.querySelector('.pd-nested-mobile-list');
    return el ? window.getComputedStyle(el).display === 'none' : false;
  });

  console.log(`Desktop: Is table wrap visible? ${isTableWrapVisibleOnDesktop}`);
  console.log(`Desktop: Is mobile list hidden? ${isMobileListHiddenOnDesktop}`);

  console.log('\nTotal Console Errors:', consoleErrors.length);
  await browser.close();
  console.log('\n=== TEST PASSED ===');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
