const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
  });

  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'makhdum@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'Store@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('http://localhost:3000/store/purchase');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click the Indent History tab button directly
  console.log('Finding Indent History button...');
  const buttons = await page.locator('.store-po-tabs-strip button').all();
  for (const btn of buttons) {
    const text = await btn.innerText();
    if (text.includes('Indent History')) {
      console.log('Found button with text:', text, '- clicking!');
      await btn.click();
      break;
    }
  }

  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(artifactDir, 'store_indent_history_verified.png') });
  console.log('Saved store_indent_history_verified.png');

  const rows = await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll('tbody tr'));
    return trs.map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim()));
  });
  console.log('Store Indent History Rows:\n', JSON.stringify(rows.slice(0, 15), null, 2));

  // Mobile screenshot
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'store_indent_history_mobile_verified.png') });
  console.log('Saved store_indent_history_mobile_verified.png');

  await browser.close();
})();
