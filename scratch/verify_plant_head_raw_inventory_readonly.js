const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\954cf727-a96f-4538-8164-ad9920a70841';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.grantPermissions(['notifications', 'geolocation']);
  await context.setGeolocation({ latitude: 26.9124, longitude: 75.7873 });

  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
  });

  console.log('=== Step 1: Logging in as Plant Head Sana ===');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'sana.r@himalayaerp.com');
  await page.fill('input[type="password"]', 'Himalaya@1234');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('=== Step 2: Navigating to http://localhost:3000/plant-head/raw-inventory ===');
  await page.goto('http://localhost:3000/plant-head/raw-inventory');
  await page.waitForTimeout(3500);

  // Verification 1: Header and Badges
  const pageDetails = await page.evaluate(() => {
    const title = document.querySelector('.m-theme-title')?.innerText || '';
    const readOnlyBadge = Array.from(document.querySelectorAll('span')).some(s => s.innerText.includes('Read Only View'));
    const addMaterialBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Add Material'));
    const exportBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Export'));
    
    // Check table headers & action buttons
    const headers = Array.from(document.querySelectorAll('th')).map(th => th.innerText.trim());
    const actionBtns = Array.from(document.querySelectorAll('tbody tr td button')).map(b => b.innerText.trim());
    
    const hasInBtn = actionBtns.some(b => b.includes('+ In') || b === '+ In');
    const hasOutBtn = actionBtns.some(b => b.includes('- Out') || b === '- Out');
    const hasAdjBtn = actionBtns.some(b => b.includes('Adj'));
    const hasEditBtn = actionBtns.some(b => b.includes('Edit'));
    const hasViewBtn = actionBtns.some(b => b.includes('View'));

    return {
      title,
      readOnlyBadge,
      addMaterialBtn,
      exportBtn,
      headers,
      actionButtonsSample: actionBtns.slice(0, 10),
      hasInBtn,
      hasOutBtn,
      hasAdjBtn,
      hasEditBtn,
      hasViewBtn
    };
  });

  console.log('Page Verification Results:');
  console.log(JSON.stringify(pageDetails, null, 2));

  // Assertions
  if (!pageDetails.readOnlyBadge) {
    console.error('FAIL: Read Only View badge NOT found in header!');
  } else {
    console.log('PASS: Read Only View badge found in header.');
  }

  if (pageDetails.addMaterialBtn) {
    console.error('FAIL: Add Material button should NOT be present in Plant Head view!');
  } else {
    console.log('PASS: Add Material button is correctly hidden.');
  }

  if (pageDetails.hasInBtn || pageDetails.hasOutBtn || pageDetails.hasAdjBtn || pageDetails.hasEditBtn) {
    console.error('FAIL: Table contains mutation buttons (+ In, - Out, Adj, Edit)!');
  } else {
    console.log('PASS: Modifying action buttons (+ In, - Out, Adj, Edit) are successfully removed from table.');
  }

  if (!pageDetails.hasViewBtn) {
    console.error('FAIL: Read-only View button not found in table rows!');
  } else {
    console.log('PASS: Read-only View button is present.');
  }

  // Capture desktop table screenshot
  const screenshot1Path = path.join(artifactDir, 'plant_head_raw_inventory_readonly.png');
  await page.screenshot({ path: screenshot1Path });
  console.log('Saved screenshot:', screenshot1Path);

  // Verification 2: Open Detail Drawer
  console.log('\n=== Step 3: Clicking View button to open Detail Drawer ===');
  const viewBtn = page.locator('tbody tr button:has-text("View")').first();
  await viewBtn.click();
  await page.waitForTimeout(1500);

  const drawerDetails = await page.evaluate(() => {
    const drawer = document.querySelector('.erp-drawer-responsive');
    if (!drawer) return { drawerOpen: false };
    
    const drawerText = drawer.innerText;
    const hasReadOnlyNotice = drawerText.includes('Read-only ledger view') || drawerText.includes('Store Department');
    const drawerButtons = Array.from(drawer.querySelectorAll('button')).map(b => b.innerText.trim());
    const hasStockIn = drawerButtons.some(b => b.includes('Stock In'));
    const hasIssueOut = drawerButtons.some(b => b.includes('Issue Out'));

    return {
      drawerOpen: true,
      hasReadOnlyNotice,
      drawerButtons,
      hasStockIn,
      hasIssueOut
    };
  });

  console.log('Detail Drawer Verification Results:', JSON.stringify(drawerDetails, null, 2));

  if (!drawerDetails.drawerOpen) {
    console.error('FAIL: Detail drawer did not open on View button click!');
  } else {
    console.log('PASS: Detail drawer opened successfully.');
  }

  if (!drawerDetails.hasReadOnlyNotice) {
    console.error('FAIL: Read-only notice NOT found in Detail Drawer!');
  } else {
    console.log('PASS: Read-only notice is clearly visible in Detail Drawer.');
  }

  if (drawerDetails.hasStockIn || drawerDetails.hasIssueOut) {
    console.error('FAIL: Detail Drawer still has mutation buttons (+ Stock In, - Issue Out)!');
  } else {
    console.log('PASS: Mutation buttons (+ Stock In, - Issue Out) are correctly removed from Detail Drawer.');
  }

  // Capture detail drawer screenshot
  const screenshot2Path = path.join(artifactDir, 'plant_head_raw_inventory_drawer_readonly.png');
  await page.screenshot({ path: screenshot2Path });
  console.log('Saved screenshot:', screenshot2Path);

  // Close drawer
  const closeBtn = page.locator('button:has-text("Close Details")').first();
  if (await closeBtn.count() > 0) {
    await closeBtn.click();
    await page.waitForTimeout(800);
  }

  // Verification 3: URL guard check
  console.log('\n=== Step 4: Testing Direct Navigation to /plant-head/add-material ===');
  await page.goto('http://localhost:3000/plant-head/add-material');
  await page.waitForTimeout(2000);
  const redirectedUrl = page.url();
  console.log('URL after attempting /plant-head/add-material:', redirectedUrl);
  if (redirectedUrl.includes('/plant-head/raw-inventory')) {
    console.log('PASS: Successfully redirected from /plant-head/add-material to /plant-head/raw-inventory.');
  } else {
    console.log('WARN: Current URL is', redirectedUrl);
  }

  console.log('\n=== All Plant Head Raw Inventory Read-Only verifications finished ===');
  await browser.close();
})();
