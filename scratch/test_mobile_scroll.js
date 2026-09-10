const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
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
  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(() => {});

  await page.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click first card
  const firstCard = page.locator('.delivery-po-card').first();
  await firstCard.waitFor({ state: 'visible', timeout: 10000 });
  await firstCard.click();
  await page.waitForTimeout(1500);

  // Check scroll container info
  const info = await page.evaluate(() => {
    const mv = document.querySelector('.main-viewport');
    return {
      windowScrollY: window.scrollY,
      mvScrollTop: mv ? mv.scrollTop : null,
      mvScrollHeight: mv ? mv.scrollHeight : null,
      mvClientHeight: mv ? mv.clientHeight : null,
    };
  });
  console.log('Scroll container info:', info);

  // Reset to top of .main-viewport
  await page.evaluate(() => {
    const mv = document.querySelector('.main-viewport');
    if (mv) mv.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);

  // Take screenshot of very top on mobile
  await page.screenshot({ path: path.join(artifactDir, 'debug_mobile_0_top.png') });

  // Scroll .main-viewport down by 400
  await page.evaluate(() => {
    const mv = document.querySelector('.main-viewport');
    if (mv) mv.scrollTop = 400;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'debug_mobile_1_mid.png') });

  // Scroll .main-viewport to bottom
  await page.evaluate(() => {
    const mv = document.querySelector('.main-viewport');
    if (mv) mv.scrollTop = mv.scrollHeight;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'debug_mobile_2_bottom.png') });

  console.log('Done capturing mobile screenshots');
  await browser.close();
})();
