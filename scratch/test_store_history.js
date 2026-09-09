const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('=== Logging in as Store Manager (Makhdum) ===');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"], input[placeholder*="email" i]', 'makhdum@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'Store@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');

  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(async () => {
    await page.waitForTimeout(3000);
  });

  // Navigate directly to /store/purchase?tab=Indent%20History
  console.log('--- Navigating to /store/purchase?tab=Indent%20History ---');
  await page.goto('http://localhost:3000/store/purchase?tab=Indent%20History');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(artifactDir, 'store_indent_history_verified.png') });
  console.log('Saved store_indent_history_verified.png');

  const rows = await page.evaluate(() => {
    const tableRows = Array.from(document.querySelectorAll('tbody tr'));
    return tableRows.map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim()));
  });
  console.log('Store Indent History Rows on /store/purchase?tab=Indent%20History:\n', JSON.stringify(rows.slice(0, 15), null, 2));

  // Mobile screenshot
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'store_indent_history_mobile_verified.png') });
  console.log('Saved store_indent_history_mobile_verified.png');

  await context.close();
  await browser.close();
  console.log('Done!');
})();
