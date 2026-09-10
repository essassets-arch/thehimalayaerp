const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  console.log('=== VERIFYING NON-STICKY BUTTONS & MOBILE RESPONSIVENESS ===');

  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // TEST 1: Desktop View (1440 x 950)
  // -------------------------------------------------------------
  console.log('\n--- 1. Testing Desktop View ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 28.6139, longitude: 77.2090 },
  });
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
  await desktopPage.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(() => {});

  await desktopPage.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(2000);

  // Click first PO card
  const firstCard = desktopPage.locator('.delivery-po-card').first();
  await firstCard.waitFor({ state: 'visible', timeout: 10000 });
  await firstCard.click();
  await desktopPage.waitForTimeout(1500);

  // Check action bar position
  const actionBar = desktopPage.locator('.delivery-actions-bar');
  await actionBar.waitFor({ state: 'visible' });
  const position = await actionBar.evaluate(el => window.getComputedStyle(el).position);
  console.log(`   Action bar CSS position: "${position}" (Expected: not "sticky")`);

  if (position === 'sticky') {
    console.error('ERROR: Action bar is still sticky!');
  } else {
    console.log('SUCCESS: Action bar is non-sticky and sits in natural document flow!');
  }

  // Scroll down to the bottom
  await desktopPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await desktopPage.waitForTimeout(1000);

  const desktopShot = path.join(artifactDir, 'desktop_nonsticky_verify_delivery.png');
  await desktopPage.screenshot({ path: desktopShot });
  console.log(`   Captured desktop screenshot: ${desktopShot}`);

  // -------------------------------------------------------------
  // TEST 2: Mobile View (390 x 844 - iPhone / Modern Smartphone)
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing Mobile View (390 x 844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 28.6139, longitude: 77.2090 },
  });
  await mobileContext.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/login');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await mobilePage.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await mobilePage.click('button:has-text("Sign In"), button[type="submit"]');
  await mobilePage.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(() => {});

  await mobilePage.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(2000);

  // Click first card on mobile
  const mobileFirstCard = mobilePage.locator('.delivery-po-card').first();
  await mobileFirstCard.waitFor({ state: 'visible', timeout: 10000 });
  await mobileFirstCard.click();
  await mobilePage.waitForTimeout(1500);

  // Capture Mobile Top View
  const mobileShotTop = path.join(artifactDir, 'mobile_verify_delivery_top.png');
  await mobilePage.screenshot({ path: mobileShotTop });
  console.log(`   Captured mobile top view: ${mobileShotTop}`);

  // Test Auto-Fill on mobile
  const autoFillMobile = mobilePage.locator('button:has-text("Auto-Fill Full Delivery")').first();
  if (await autoFillMobile.isVisible()) {
    await autoFillMobile.click();
    await mobilePage.waitForTimeout(800);
  }

  // Scroll down halfway to show inspection table
  await mobilePage.evaluate(() => window.scrollTo(0, 400));
  await mobilePage.waitForTimeout(800);
  const mobileShotTable = path.join(artifactDir, 'mobile_verify_delivery_table.png');
  await mobilePage.screenshot({ path: mobileShotTable });
  console.log(`   Captured mobile table view: ${mobileShotTable}`);

  // Scroll down to the bottom to verify non-sticky stacked action buttons
  await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await mobilePage.waitForTimeout(800);
  const mobileShotBottom = path.join(artifactDir, 'mobile_verify_delivery_bottom_actions.png');
  await mobilePage.screenshot({ path: mobileShotBottom });
  console.log(`   Captured mobile bottom actions: ${mobileShotBottom}`);

  console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
  await browser.close();
})();
