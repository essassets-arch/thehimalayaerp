const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8f1dff96-3967-4466-8db6-db51dd9de918';
  const browser = await chromium.launch({ headless: true });

  console.log('--- TESTING DESKTOP SCROLL (1440x900) ---');
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });
  await desktopPage.goto('http://localhost:3000/login');
  await desktopPage.click('button:has-text("Store")');
  await desktopPage.locator('button:has-text("Login")').first().click();
  await desktopPage.waitForURL('**/store/**');
  await desktopPage.goto('http://localhost:3000/store/low-stock-alerts');
  await desktopPage.waitForLoadState('networkidle');

  await desktopPage.click('button:has-text("Create Indent")');
  await desktopPage.waitForTimeout(600);

  // Add 6 more product rows (total 7 items)
  for (let i = 0; i < 6; i++) {
    await desktopPage.click('button:has-text("Add Product Row")');
    await desktopPage.waitForTimeout(100);
  }

  // Check table scrollability
  const desktopScrollInfo = await desktopPage.evaluate(() => {
    // The items container
    const tables = document.querySelectorAll('table');
    const table = tables[tables.length - 1]; // inside modal
    const itemsBox = table.closest('div[style*="max-height"]') || table.parentElement.parentElement;
    const body = document.querySelector('.bulk-indent-modal-body');

    const initialTableScrollTop = itemsBox ? itemsBox.scrollTop : 0;
    const tableScrollHeight = itemsBox ? itemsBox.scrollHeight : 0;
    const tableClientHeight = itemsBox ? itemsBox.clientHeight : 0;

    // Scroll down inside the table
    if (itemsBox) {
      itemsBox.scrollTop = itemsBox.scrollHeight;
    }

    const afterTableScrollTop = itemsBox ? itemsBox.scrollTop : 0;

    return {
      tableScrollHeight,
      tableClientHeight,
      canTableScroll: tableScrollHeight > tableClientHeight,
      initialTableScrollTop,
      afterTableScrollTop,
      bodyScrollHeight: body ? body.scrollHeight : 0,
      bodyClientHeight: body ? body.clientHeight : 0
    };
  });

  console.log('Desktop Scroll Info:', desktopScrollInfo);
  await desktopPage.screenshot({ path: path.join(artifactDir, 'scroll_desktop_verified.png') });
  console.log('Desktop screenshot saved: scroll_desktop_verified.png');
  await desktopPage.close();

  console.log('\n--- TESTING MOBILE SCROLL (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });
  await mobilePage.goto('http://localhost:3000/login');
  await mobilePage.click('button:has-text("Store")');
  await mobilePage.locator('button:has-text("Login")').first().click();
  await mobilePage.waitForURL('**/store/**');
  await mobilePage.goto('http://localhost:3000/store/low-stock-alerts');
  await mobilePage.waitForLoadState('networkidle');

  await mobilePage.click('button:has-text("Create Indent")');
  await mobilePage.waitForTimeout(600);

  // Add 4 more product rows on mobile
  for (let i = 0; i < 4; i++) {
    await mobilePage.click('button:has-text("Add Product Row")');
    await mobilePage.waitForTimeout(100);
  }

  // Check mobile scrollability
  const mobileScrollInfo = await mobilePage.evaluate(() => {
    const body = document.querySelector('.bulk-indent-modal-body');
    const mobileCards = document.querySelector('.mobile-only');
    const itemsBox = mobileCards ? mobileCards.parentElement : null;

    const bodyClientHeight = body ? body.clientHeight : 0;
    const bodyScrollHeight = body ? body.scrollHeight : 0;
    const itemsBoxClientHeight = itemsBox ? itemsBox.clientHeight : 0;
    const itemsBoxScrollHeight = itemsBox ? itemsBox.scrollHeight : 0;

    // Scroll items box
    if (itemsBox) {
      itemsBox.scrollTop = itemsBox.scrollHeight;
    }
    const afterItemsBoxScrollTop = itemsBox ? itemsBox.scrollTop : 0;

    // Scroll modal body
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
    const afterBodyScrollTop = body ? body.scrollTop : 0;

    return {
      bodyClientHeight,
      bodyScrollHeight,
      canBodyScroll: bodyScrollHeight > bodyClientHeight,
      afterBodyScrollTop,
      itemsBoxClientHeight,
      itemsBoxScrollHeight,
      canItemsBoxScroll: itemsBoxScrollHeight > itemsBoxClientHeight,
      afterItemsBoxScrollTop
    };
  });

  console.log('Mobile Scroll Info:', mobileScrollInfo);
  await mobilePage.screenshot({ path: path.join(artifactDir, 'scroll_mobile_verified.png') });
  console.log('Mobile screenshot saved: scroll_mobile_verified.png');

  await mobileContext.close();
  await browser.close();
  console.log('\nAll scrolling tests completed!');
})();
