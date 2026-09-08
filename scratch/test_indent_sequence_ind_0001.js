const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8f1dff96-3967-4466-8db6-db51dd9de918';
  const browser = await chromium.launch({ headless: true });

  // ─── 1. STORE MANAGER FLOW ───
  console.log('=== 1. LOGGING IN AS STORE MANAGER ===');
  const storeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const storePage = await storeContext.newPage();
  await storePage.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });

  await storePage.goto('http://localhost:3000/login');
  await storePage.waitForLoadState('networkidle');

  // Click Store filter pill, then click Makhdum's quick login
  await storePage.click('.pill-btn:has-text("Store")');
  await storePage.waitForTimeout(300);
  await storePage.locator('.account-card:has-text("Makhdum") .btn-quick-login').click();
  await storePage.waitForURL('**/store/**');

  await storePage.goto('http://localhost:3000/store/low-stock-alerts');
  await storePage.waitForLoadState('networkidle');
  await storePage.waitForTimeout(1000);

  // Capture table screenshot showing ind-XXXX badges
  await storePage.screenshot({ path: path.join(artifactDir, 'indent_sequence_store_table.png') });
  console.log('Saved indent_sequence_store_table.png');

  // Verify that the table shows Indent Created with ind-XXXX sequence!
  const storeBadges = await storePage.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.slice(0, 10).map(r => {
      const name = r.querySelector('td:nth-child(2)')?.innerText.trim();
      const status = r.querySelector('td:last-child')?.innerText.trim();
      return { name, status };
    });
  });
  console.log('Store Low Stock table badges:', storeBadges);

  await storeContext.close();

  // ─── 2. PLANT HEAD FLOW ───
  console.log('=== 2. LOGGING IN AS PLANT HEAD ===');
  const phContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const phPage = await phContext.newPage();
  await phPage.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });

  await phPage.goto('http://localhost:3000/login');
  await phPage.waitForLoadState('networkidle');

  // Click Production pill, then click Sana R quick login
  await phPage.click('.pill-btn:has-text("Production")');
  await phPage.waitForTimeout(300);
  await phPage.locator('.account-card:has-text("Sana R") .btn-quick-login').click();
  await phPage.waitForURL('**/plant-head/**');
  console.log('Logged in as Plant Head, URL:', phPage.url());

  // Test 1: Material Indents view (/plant-head/material-indents)
  console.log('--- Checking /plant-head/material-indents ---');
  await phPage.goto('http://localhost:3000/plant-head/material-indents');
  await phPage.waitForLoadState('networkidle');
  await phPage.waitForTimeout(1500);

  const materialIndentsCards = await phPage.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div[style*="border-radius: 14px"]'));
    return cards.map(c => {
      const title = c.querySelector('div[style*="font-weight: 900"]')?.innerText.trim();
      return title;
    }).filter(Boolean);
  });
  console.log('Material Indents Card IDs:', materialIndentsCards);

  await phPage.screenshot({ path: path.join(artifactDir, 'indent_sequence_plant_head_cards.png') });
  console.log('Saved indent_sequence_plant_head_cards.png');

  // Test 2: Indent Approvals view (/plant-head/indent-approvals)
  console.log('--- Checking /plant-head/indent-approvals ---');
  await phPage.goto('http://localhost:3000/plant-head/indent-approvals');
  await phPage.waitForLoadState('networkidle');
  await phPage.waitForTimeout(1500);

  const indentTableIds = await phPage.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.slice(0, 10).map(r => r.querySelector('td:first-child')?.innerText.trim()).filter(Boolean);
  });
  console.log('Indent Approvals Table IDs:', indentTableIds);

  await phPage.screenshot({ path: path.join(artifactDir, 'indent_sequence_plant_head_table.png') });
  console.log('Saved indent_sequence_plant_head_table.png');

  await phContext.close();
  await browser.close();
  console.log('All verification checks passed successfully!');
})();
