const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['notifications', 'geolocation'],
    geolocation: { latitude: 19.076, longitude: 72.8777 },
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__PLAYWRIGHT_TEST__ = true;
    localStorage.setItem('e2e_bypass_permissions', 'true');
    sessionStorage.setItem('e2e_bypass_permissions', 'true');
    localStorage.setItem('hasDismissedPermissionsModal', 'true');
    sessionStorage.setItem('hasDismissedPermissionsModal', 'true');
  });

  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Check if login form is present
  const emailInput = await page.$('input[type="email"], input[name="email"]');
  if (emailInput) {
    console.log('Performing login...');
    await page.fill('input[type="email"], input[name="email"]', 'sana.r@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'Himalaya@1234');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  // 2. Navigate to Dispatch 1 Sample Dispatch
  console.log('2. Navigating to Dispatch 1: /dispatch/sample-dispatch...');
  await page.goto('http://localhost:3000/dispatch/sample-dispatch');
  await page.waitForTimeout(3000);

  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\18857276-3a85-46f7-a487-faa1c6778da9';
  const d1Screenshot = path.join(artifactDir, 'd1_sample_dispatch.png');
  await page.screenshot({ path: d1Screenshot, fullPage: false });
  console.log('Saved D1 screenshot to:', d1Screenshot);

  // Inspect table text
  const d1Text = await page.innerText('body');
  const d1HasSample = d1Text.includes('SMP-2026-0001');
  const d1HasFRP = d1Text.includes('HIMALAYA FRP MHC 600X600 B125');
  const d1HasGrating = d1Text.includes('FRP MOULDED GRATING 30MM');
  const d1HasCoverblock = d1Text.includes('COVERBLOCK');
  const d1HasAddress = d1Text.includes('Plot 44, Industrial Area Phase II, Jaipur, Rajasthan - 302013');
  const d1HasRawAddress = d1Text.includes('See Lead/Customer address');

  console.log('D1 Verification:');
  console.log('  - Has SMP-2026-0001:', d1HasSample);
  console.log('  - Has FRP products in table:', d1HasFRP && d1HasGrating);
  console.log('  - Does NOT have Trading Coverblock:', !d1HasCoverblock);
  console.log('  - Has clean formatted address:', d1HasAddress);
  console.log('  - Does NOT say "See Lead/Customer address":', !d1HasRawAddress);

  // 3. Navigate to Dispatch 2 Sample Dispatch
  console.log('\n3. Navigating to Dispatch 2: /dispatch-2/sample-dispatch...');
  await page.goto('http://localhost:3000/dispatch-2/sample-dispatch');
  await page.waitForTimeout(3000);

  const d2Screenshot = path.join(artifactDir, 'd2_sample_dispatch.png');
  await page.screenshot({ path: d2Screenshot, fullPage: false });
  console.log('Saved D2 screenshot to:', d2Screenshot);

  const d2Text = await page.innerText('body');
  const d2HasSample = d2Text.includes('SMP-2026-0001');
  const d2HasCoverblock = d2Text.includes('COVERBLOCK 25MM');
  const d2HasFRP = d2Text.includes('HIMALAYA FRP MHC');

  console.log('D2 Verification:');
  console.log('  - Has SMP-2026-0001:', d2HasSample);
  console.log('  - Has Trading Coverblock in table:', d2HasCoverblock);
  console.log('  - Does NOT have Manufacturing FRP products:', !d2HasFRP);

  // 4. Navigate to Consignment Booking Create page
  console.log('\n4. Navigating to Create Consignment Booking page...');
  await page.goto('http://localhost:3000/dispatch/sample-dispatch/create/req-229cc1ae-7549-4e72-8be7-2c2fe678c469');
  await page.waitForTimeout(3000);

  const createScreenshot = path.join(artifactDir, 'create_sample_consignment.png');
  await page.screenshot({ path: createScreenshot, fullPage: false });
  console.log('Saved Create Consignment screenshot to:', createScreenshot);

  const createText = await page.innerText('body');
  const hasSampleOrder = createText.includes('SMP-2026-0001');
  const hasLeadNo = createText.includes('LEAD/2627/0190');
  const hasCust = createText.includes('Himalaya Commercial Projects Pvt Ltd');
  const hasAddr = createText.includes('Plot 44, Industrial Area Phase II, Jaipur, Rajasthan - 302013');
  const hasContact = createText.includes('Suresh Verma');
  const hasPhone = createText.includes('9876543210');
  const hasMixedNotice = createText.includes('Mixed Order Notice');
  const hasFetchedCost = createText.includes('750.00');

  // Check input value of To Be Paid
  const costInput = await page.$('input[type="number"][placeholder*="500"]');
  const costValue = costInput ? await costInput.inputValue() : null;

  console.log('Create Page Verification:');
  console.log('  - Sample Order number present:', hasSampleOrder);
  console.log('  - Lead number badge present:', hasLeadNo);
  console.log('  - Customer name present:', hasCust);
  console.log('  - Clean delivery address present:', hasAddr);
  console.log('  - Contact person & phone present:', hasContact && hasPhone);
  console.log('  - Mixed Order Notice banner present:', hasMixedNotice);
  console.log('  - Fetched Transport Cost contains 750.00:', hasFetchedCost);
  console.log('  - "To Be Paid" input value:', costValue, '(Expect 750.00, NOT 500.00)');

  await browser.close();
}

main().catch(console.error);
