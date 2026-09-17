const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\954cf727-a96f-4538-8164-ad9920a70841';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await context.grantPermissions(['notifications', 'geolocation']);
  await context.setGeolocation({ latitude: 26.9124, longitude: 75.7873 });

  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
  });

  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'sana.r@himalayaerp.com');
  await page.fill('input[type="password"]', 'Himalaya@1234');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('http://localhost:3000/plant-head/raw-inventory');
  await page.waitForTimeout(3500);

  await page.evaluate(() => {
    const list = document.querySelector('.raw-inventory-mobile-list');
    if (list) list.scrollIntoView();
  });
  await page.waitForTimeout(1000);

  const screenshotPath = path.join(artifactDir, 'plant_head_raw_inventory_mobile_cards_readonly.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Mobile cards screenshot saved to', screenshotPath);

  await browser.close();
})();
