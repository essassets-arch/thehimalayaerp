const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(() => {});

  await page.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const firstCard = page.locator('.delivery-po-card').first();
  await firstCard.waitFor({ state: 'visible', timeout: 10000 });
  await firstCard.click();
  await page.waitForTimeout(1500);

  // Scroll parent 4 to TOP (0)
  await page.evaluate(() => {
    const el = document.querySelector('.inspection-card');
    let p = el;
    for (let i = 0; i < 4; i++) { if (p) p = p.parentElement; }
    if (p) p.scrollTop = 0;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'test_scrolled_0_top.png') });

  // Scroll parent 4 to MID (600)
  await page.evaluate(() => {
    const el = document.querySelector('.inspection-card');
    let p = el;
    for (let i = 0; i < 4; i++) { if (p) p = p.parentElement; }
    if (p) p.scrollTop = 600;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'test_scrolled_1_mid.png') });

  // Scroll parent 4 to BOTTOM (scrollHeight)
  await page.evaluate(() => {
    const el = document.querySelector('.inspection-card');
    let p = el;
    for (let i = 0; i < 4; i++) { if (p) p = p.parentElement; }
    if (p) p.scrollTop = p.scrollHeight;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'test_scrolled_2_bottom.png') });

  console.log('Finished capturing scrolled test images');
  await browser.close();
})();
