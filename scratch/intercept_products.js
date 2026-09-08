const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
  });

  page.on('response', async res => {
    if (res.url().includes('/products?type=RAW_MATERIAL')) {
      const data = await res.json();
      console.log('API /products?type=RAW_MATERIAL response sample (first 3):', (Array.isArray(data) ? data : data?.data || []).slice(0, 3));
    }
  });

  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await browser.close();
})();
