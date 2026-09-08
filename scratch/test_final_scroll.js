const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8f1dff96-3967-4466-8db6-db51dd9de918';
  const browser = await chromium.launch({ headless: true });

  console.log('=== 1. TESTING DESKTOP SCROLL (1440x900) ===');
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

  // Add 6 more product rows
  for (let i = 0; i < 6; i++) {
    await desktopPage.click('button:has-text("Add Product Row")');
    await desktopPage.waitForTimeout(80);
  }

  const desktopInfo = await desktopPage.evaluate(() => {
    const tableBox = document.querySelector('.bulk-indent-items-box');
    const thead = tableBox ? tableBox.querySelector('thead') : null;
    const body = document.querySelector('.bulk-indent-modal-body');
    const footer = document.querySelector('.bulk-indent-modal-footer');

    const canScrollTable = tableBox && tableBox.scrollHeight > tableBox.clientHeight;
    if (tableBox) {
      tableBox.scrollTop = tableBox.scrollHeight;
    }

    return {
      tableBox: {
        clientHeight: tableBox.clientHeight,
        scrollHeight: tableBox.scrollHeight,
        scrollTop: tableBox.scrollTop,
        canScroll: canScrollTable
      },
      theadSticky: thead ? window.getComputedStyle(thead).position : null,
      footerVisible: footer ? footer.offsetHeight > 0 : false,
      body: {
        clientHeight: body.clientHeight,
        scrollHeight: body.scrollHeight
      }
    };
  });

  console.log('Desktop Info:', JSON.stringify(desktopInfo, null, 2));
  await desktopPage.screenshot({ path: path.join(artifactDir, 'final_desktop_scrolled.png') });
  console.log('Saved: final_desktop_scrolled.png');
  await desktopPage.close();

  console.log('\n=== 2. TESTING MOBILE SCROLL (390x844) ===');
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

  // Add 4 more product rows
  for (let i = 0; i < 4; i++) {
    await mobilePage.click('.bulk-indent-modal-body button:has-text("Add Product Row")');
    await mobilePage.waitForTimeout(80);
  }

  await mobilePage.screenshot({ path: path.join(artifactDir, 'final_mobile_top.png') });
  console.log('Saved: final_mobile_top.png');

  // Scroll mobile body down
  const mobileInfo = await mobilePage.evaluate(() => {
    const body = document.querySelector('.bulk-indent-modal-body');
    const footer = document.querySelector('.bulk-indent-modal-footer');
    const itemsBox = document.querySelector('.bulk-indent-items-box');
    const cards = itemsBox ? itemsBox.querySelectorAll('.mobile-only > div') : [];

    const canScrollBody = body && body.scrollHeight > body.clientHeight;
    if (body) {
      body.scrollTop = body.scrollHeight;
    }

    return {
      body: {
        clientHeight: body.clientHeight,
        scrollHeight: body.scrollHeight,
        scrollTop: body.scrollTop,
        canScroll: canScrollBody
      },
      cardsCount: cards.length,
      cardsHeights: Array.from(cards).map(c => c.offsetHeight),
      footer: {
        offsetHeight: footer ? footer.offsetHeight : 0,
        visible: !!footer
      }
    };
  });

  console.log('Mobile Info after scroll:', JSON.stringify(mobileInfo, null, 2));
  await mobilePage.waitForTimeout(200);
  await mobilePage.screenshot({ path: path.join(artifactDir, 'final_mobile_scrolled.png') });
  console.log('Saved: final_mobile_scrolled.png');

  await mobileContext.close();
  await browser.close();
  console.log('\nAll tests completed successfully!');
})();
