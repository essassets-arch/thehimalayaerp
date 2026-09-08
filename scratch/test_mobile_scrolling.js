const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8f1dff96-3967-4466-8db6-db51dd9de918';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("Store")');
  await page.locator('button:has-text("Login")').first().click();
  await page.waitForURL('**/store/**');
  await page.goto('http://localhost:3000/store/low-stock-alerts');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Create Indent")');
  await page.waitForTimeout(600);

  // Add 4 items using "Add Low Stock Items (354)" or clicking "Add Product Row"
  const addBtn = page.locator('.bulk-indent-modal-body button:has-text("Add Product Row")');
  for (let i = 0; i < 4; i++) {
    await addBtn.click();
    await page.waitForTimeout(100);
  }

  const res = await page.evaluate(() => {
    const modalBody = document.querySelector('.bulk-indent-modal-body');
    const itemsContainer = document.querySelector('.bulk-indent-modal-body div[style*="max-height"]');
    const mobileCardsContainer = itemsContainer ? itemsContainer.querySelector('.mobile-only') : null;
    const cards = mobileCardsContainer ? Array.from(mobileCardsContainer.children) : [];

    return {
      modalBody: {
        clientHeight: modalBody.clientHeight,
        scrollHeight: modalBody.scrollHeight,
        scrollTop: modalBody.scrollTop
      },
      itemsContainer: {
        clientHeight: itemsContainer ? itemsContainer.clientHeight : null,
        scrollHeight: itemsContainer ? itemsContainer.scrollHeight : null,
        scrollTop: itemsContainer ? itemsContainer.scrollTop : null,
        overflowY: itemsContainer ? window.getComputedStyle(itemsContainer).overflowY : null,
        maxHeight: itemsContainer ? window.getComputedStyle(itemsContainer).maxHeight : null
      },
      cardsCount: cards.length,
      cardsHeights: cards.map(c => c.offsetHeight)
    };
  });

  console.log('Mobile Inspection with 4 added items:', JSON.stringify(res, null, 2));

  // Now scroll the items container to the bottom
  await page.evaluate(() => {
    const itemsContainer = document.querySelector('.bulk-indent-modal-body div[style*="max-height"]');
    if (itemsContainer) itemsContainer.scrollTop = itemsContainer.scrollHeight;
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_items_scrolled.png') });

  // Now scroll the modal body to the bottom
  await page.evaluate(() => {
    const modalBody = document.querySelector('.bulk-indent-modal-body');
    if (modalBody) modalBody.scrollTop = modalBody.scrollHeight;
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_body_scrolled.png') });

  await browser.close();
})();
