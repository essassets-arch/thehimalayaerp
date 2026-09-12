const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\fd8f5c2d-4532-408a-9e9c-fc3dbcd6f05a';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 23.8315, longitude: 91.2868 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  console.log('1. Logging in as Super Admin on Mobile (390x844)...');
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

  console.log('Opening Salary Slip modal on mobile...');
  const viewSlipBtn = page.locator('button:has-text("View Slip"):visible, button.btn-view:visible').first();
  await viewSlipBtn.click();
  await page.waitForTimeout(2000);

  // Take screenshot of initial view (left side)
  await page.screenshot({ path: path.join(artifactDir, 'mobile_slip_left.png') });
  console.log('Saved mobile_slip_left.png');

  // Scroll horizontally to see right side (deductions, etc.)
  await page.evaluate(() => {
    const body = document.querySelector('.salary-slip-content-body');
    if (body) body.scrollLeft = 450;
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_slip_right.png') });
  console.log('Saved mobile_slip_right.png');

  // Scroll down to see Net Pay and Signatures
  await page.evaluate(() => {
    const body = document.querySelector('.salary-slip-content-body');
    if (body) {
      body.scrollLeft = 0;
      body.scrollTop = 500;
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_slip_bottom.png') });
  console.log('Saved mobile_slip_bottom.png');

  await browser.close();
})();
