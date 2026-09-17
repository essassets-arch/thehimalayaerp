const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.grantPermissions(['notifications', 'geolocation']);
  await context.setGeolocation({ latitude: 26.9124, longitude: 75.7873 });

  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
  });

  // Login as Super Admin or Store User
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(2500);

  console.log('Navigating to http://localhost:3000/store/raw-inventory...');
  await page.goto('http://localhost:3000/store/raw-inventory');
  await page.waitForTimeout(3000);

  const storeDetails = await page.evaluate(() => {
    const title = document.querySelector('.m-theme-title')?.innerText || '';
    const addMaterialBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Add Material'));
    const actionBtns = Array.from(document.querySelectorAll('tbody tr td button')).map(b => b.innerText.trim());
    return {
      title,
      addMaterialBtn,
      actionBtnsSample: actionBtns.slice(0, 8)
    };
  });

  console.log('Store Raw Inventory Verification:', JSON.stringify(storeDetails, null, 2));

  if (storeDetails.addMaterialBtn) {
    console.log('PASS: Store portal retains "+ Add Material" operational button.');
  } else {
    console.log('NOTE: Store portal Add Material check:', storeDetails.addMaterialBtn);
  }

  await browser.close();
})();
