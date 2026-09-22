const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript(() => { window.localStorage.setItem('e2e_bypass_permissions', 'true'); });
  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'plant.head@himalayaerp.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
  await page.goto('http://localhost:3002/production/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const el = document.querySelector('.pod-runs-table');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/SYSTEM3/.gemini/antigravity-ide/brain/e99640ef-5d15-428b-8272-7dec1848cb58/production_floor_runs_table.png' });
  await browser.close();
  console.log('Done screenshot');
})();
