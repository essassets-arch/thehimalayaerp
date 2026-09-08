const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8f1dff96-3967-4466-8db6-db51dd9de918';
  const browser = await chromium.launch({ headless: true });
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });
  await mobilePage.goto('http://localhost:3000/login');
  await mobilePage.click('button:has-text("Store")');
  await mobilePage.locator('button:has-text("Login")').first().click();
  await mobilePage.waitForURL('**/store/**');
  await mobilePage.goto('http://localhost:3000/store/low-stock-alerts');
  await mobilePage.waitForLoadState('networkidle');

  await mobilePage.click('button:has-text("Create Indent")');
  await mobilePage.waitForTimeout(500);

  const cardCount = await mobilePage.locator('.mobile-only select').count();
  if (cardCount === 0) {
    await mobilePage.click('button:has-text("Add Low Stock Items")');
    await mobilePage.waitForTimeout(500);
  }

  await mobilePage.screenshot({ path: path.join(artifactDir, 'aligned_mobile_cards.png') });
  console.log('Saved aligned_mobile_cards.png');

  await browser.close();
})();
