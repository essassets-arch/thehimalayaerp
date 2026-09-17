const { chromium } = require('playwright');
const path = require('path');

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

  console.log('Logging in as Sana (Plant Head)...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'sana.r@himalayaerp.com');
  await page.fill('input[type="password"]', 'Himalaya@1234');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(2500);

  console.log('Navigating to http://localhost:3000/plant-head/raw-inventory...');
  await page.goto('http://localhost:3000/plant-head/raw-inventory');
  await page.waitForTimeout(3000);
  
  const title = await page.title();
  const url = page.url();
  console.log('Page URL:', url);
  console.log('Title:', title);

  const textContent = await page.evaluate(() => {
    const titleElem = document.querySelector('.m-theme-title, h1, h2');
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
    const tableHeaders = Array.from(document.querySelectorAll('th')).map(th => th.innerText.trim());
    return {
      heading: titleElem ? titleElem.innerText : 'None',
      buttons: buttons.slice(0, 25),
      headers: tableHeaders
    };
  });
  console.log('Content inspection:', JSON.stringify(textContent, null, 2));

  await page.screenshot({ path: path.join(__dirname, 'current_plant_head_raw_inventory.png') });
  console.log('Saved screenshot to scratch/current_plant_head_raw_inventory.png');

  await browser.close();
})();
