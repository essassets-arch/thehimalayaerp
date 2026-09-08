const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8f1dff96-3967-4466-8db6-db51dd9de918';
  const browser = await chromium.launch({ headless: true });

  console.log('=== VERIFYING REMOVAL OF PRIORITY STRIP ===');
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

  const desktopCheck = await desktopPage.evaluate(() => {
    const body = document.querySelector('.bulk-indent-modal-body');
    const hasPriorityText = body ? body.innerText.includes('Priority:') || body.innerText.includes('PRIORITY:') : false;
    const priorityButtons = Array.from(document.querySelectorAll('button')).filter(b => 
      ['Low', 'Medium', 'High', 'Emergency'].includes(b.innerText.trim())
    );
    return {
      hasPriorityText,
      priorityButtonCount: priorityButtons.length
    };
  });

  console.log('Desktop Check:', desktopCheck);
  await desktopPage.screenshot({ path: path.join(artifactDir, 'modal_no_priority_desktop.png') });
  console.log('Saved: modal_no_priority_desktop.png');
  await desktopPage.close();

  // Mobile
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

  const mobileCheck = await mobilePage.evaluate(() => {
    const body = document.querySelector('.bulk-indent-modal-body');
    const hasPriorityText = body ? body.innerText.includes('Priority:') || body.innerText.includes('PRIORITY:') : false;
    const priorityButtons = Array.from(document.querySelectorAll('button')).filter(b => 
      ['Low', 'Medium', 'High', 'Emergency'].includes(b.innerText.trim())
    );
    return {
      hasPriorityText,
      priorityButtonCount: priorityButtons.length
    };
  });

  console.log('Mobile Check:', mobileCheck);
  await mobilePage.screenshot({ path: path.join(artifactDir, 'modal_no_priority_mobile.png') });
  console.log('Saved: modal_no_priority_mobile.png');

  await mobileContext.close();
  await browser.close();
  console.log('Verification completed!');
})();
