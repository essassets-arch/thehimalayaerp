const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 1. Test Mobile Viewport (iPhone 12/13/14: 390x844)
  console.log('--- TESTING MOBILE VIEWPORT (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
  });

  await mobilePage.goto('http://localhost:3000/login');
  await mobilePage.click('button:has-text("Store")');
  await mobilePage.locator('button:has-text("Login")').first().click();
  await mobilePage.waitForURL('**/store/**');
  await mobilePage.goto('http://localhost:3000/store/low-stock-alerts');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1500);

  // Click "+ Create Indent"
  await mobilePage.click('button:has-text("Create Indent")');
  await mobilePage.waitForTimeout(800);

  // Verify mobile elements are visible
  const mobileCardsCount = await mobilePage.$$eval('.bulk-indent-mobile-card', cards => cards.length);
  console.log('Mobile cards count rendered:', mobileCardsCount);

  // Take initial mobile screenshot (top view with controls and first card)
  const mobileScreenshot = path.resolve(__dirname, '../scratch/modal_mobile_view.png');
  await mobilePage.screenshot({ path: mobileScreenshot });
  console.log('Saved mobile initial screenshot to:', mobileScreenshot);

  // Check stepper increment button on first card
  const firstQtyBefore = await mobilePage.$eval('.bulk-indent-mobile-card .bulk-indent-stepper-input', el => el.value);
  console.log('First card quantity before stepper + click:', firstQtyBefore);
  await mobilePage.locator('.bulk-indent-mobile-card .bulk-indent-stepper-btn:has-text("+")').first().click();
  await mobilePage.waitForTimeout(300);
  const firstQtyAfter = await mobilePage.$eval('.bulk-indent-mobile-card .bulk-indent-stepper-input', el => el.value);
  console.log('First card quantity after stepper + click:', firstQtyAfter);

  // Scroll down a bit in modal body to show full mobile cards clearly
  await mobilePage.evaluate(() => {
    const body = document.querySelector('.bulk-indent-modal-body');
    if (body) body.scrollTop = 220;
  });
  await mobilePage.waitForTimeout(300);

  const mobileScrolledScreenshot = path.resolve(__dirname, '../scratch/modal_mobile_scrolled.png');
  await mobilePage.screenshot({ path: mobileScrolledScreenshot });
  console.log('Saved mobile scrolled screenshot to:', mobileScrolledScreenshot);

  // 2. Test Desktop Viewport (1440x900)
  console.log('--- TESTING DESKTOP VIEWPORT (1440x900) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
  });

  await desktopPage.goto('http://localhost:3000/login');
  await desktopPage.click('button:has-text("Store")');
  await desktopPage.locator('button:has-text("Login")').first().click();
  await desktopPage.waitForURL('**/store/**');
  await desktopPage.goto('http://localhost:3000/store/low-stock-alerts');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1500);

  await desktopPage.click('button:has-text("Create Indent")');
  await desktopPage.waitForTimeout(800);

  const desktopTableVisible = await desktopPage.isVisible('.bulk-indent-table');
  console.log('Desktop table visible:', desktopTableVisible);

  const desktopScreenshot = path.resolve(__dirname, '../scratch/modal_desktop_redesign.png');
  await desktopPage.screenshot({ path: desktopScreenshot });
  console.log('Saved desktop screenshot to:', desktopScreenshot);

  await browser.close();
  console.log('Responsive testing finished successfully!');
})();
