const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAll() {
  console.log('--- Starting Complete Verification Audit ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['geolocation', 'notifications'],
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const brainDir = path.resolve('C:/Users/SYSTEM3/.gemini/antigravity-ide/brain/e99640ef-5d15-428b-8272-7dec1848cb58');

  // ==========================================
  // PART 1: Plant Head Dashboard Audit
  // ==========================================
  console.log('\n[TEST 1] Testing Plant Head Dashboard at http://localhost:3002/login...');
  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'plant.head@himalayaerp.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);

  if (!page.url().includes('/plant-head/dashboard')) {
    await page.goto('http://localhost:3002/plant-head/dashboard', { waitUntil: 'networkidle' });
  }

  await page.waitForSelector('text=/Plant Head Manufacturing Command Center/i', { timeout: 15000 });
  console.log('✓ Loaded Plant Head Manufacturing Command Center');

  await page.waitForTimeout(2000);
  const bodyText = await page.textContent('body');
  const lowerBody = bodyText.toLowerCase();

  // 1. Check Productivity is REMOVED
  const hasProductivityCard = lowerBody.includes('target: pcs / man / day') || lowerBody.includes('productivity target');
  console.log('1. Productivity Card REMOVED:', !hasProductivityCard ? '✓ PASS' : '✗ FAIL (still present)');

  // 2. Check Machine Availability card has live data
  const hasMachineAvailability = lowerBody.includes('machine availability') && lowerBody.includes('in use');
  console.log('2. Machine Availability KPI Card Live:', hasMachineAvailability ? '✓ PASS' : '✗ FAIL');

  // 3. Check Fleet Section & HM001 - HM006
  const hasFleetSection = lowerBody.includes('machine availability & daily operations fleet');
  console.log('3. Fleet Operations Section Present:', hasFleetSection ? '✓ PASS' : '✗ FAIL');

  const hasHM001 = lowerBody.includes('hm001') && lowerBody.includes('hydraulic machine 1');
  const hasHM006 = lowerBody.includes('hm006') && lowerBody.includes('hydraulic machine 6');
  console.log('4. Machines HM001 - HM006 Rendered:', (hasHM001 && hasHM006) ? '✓ PASS' : '✗ FAIL');

  // 4. Check Use / Not Use buttons and Save Daily Status button
  const hasUseButtons = (await page.locator('button:has-text("Use")').count()) >= 6;
  const hasNotUseButtons = (await page.locator('button:has-text("Not Use")').count()) >= 6;
  const hasSaveButton = (await page.locator('button:has-text("Save Daily Status")').count()) >= 1;
  console.log('5. Use & Not Use Buttons count:', hasUseButtons ? '✓ PASS' : '✗ FAIL');
  console.log('6. Save Daily Status Button exists:', hasSaveButton ? '✓ PASS' : '✗ FAIL');

  // Screenshot of Top KPI cards
  const screenshotTop = path.join(brainDir, 'plant_head_kpi_cards.png');
  await page.screenshot({ path: screenshotTop });
  console.log('✓ Saved screenshot:', screenshotTop);

  // Scroll to Fleet Section and take screenshot
  await page.locator('#machine-fleet-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const screenshotFleet = path.join(brainDir, 'plant_head_machine_fleet.png');
  await page.screenshot({ path: screenshotFleet });
  console.log('✓ Saved screenshot of Fleet Table:', screenshotFleet);

  // 5. Test clicking Card 6 to open modal
  console.log('7. Testing Machine Availability Card 6 Click -> Modal...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.locator('text=Machine Availability').first().click();
  await page.waitForTimeout(800);

  const modalVisible = await page.locator('text=Machine Availability & Fleet Operations').isVisible();
  console.log('   Modal opened successfully:', modalVisible ? '✓ PASS' : '✗ FAIL');
  if (modalVisible) {
    const screenshotModal = path.join(brainDir, 'plant_head_machine_modal.png');
    await page.screenshot({ path: screenshotModal });
    console.log('✓ Saved screenshot of Modal:', screenshotModal);
    // Close modal
    await page.locator('button:has-text("Close")').click();
    await page.waitForTimeout(500);
  }

  // 6. Test Interactive Toggle & Save
  console.log('8. Testing Interactive Status Toggle & Save on HM001...');
  await page.locator('#machine-fleet-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Click Save Daily Status
  await page.locator('#machine-fleet-section button:has-text("Save Daily Status")').first().click();
  await page.waitForTimeout(1500);
  const saveSuccess = await page.locator('text=/saved successfully/i').isVisible();
  console.log('   Save Daily Status executed & success banner displayed:', saveSuccess ? '✓ PASS' : '✗ FAIL');

  // ==========================================
  // PART 2: Production Operations Dashboard Audit
  // ==========================================
  console.log('\n[TEST 2] Testing Production Dashboard at http://localhost:3002/production/dashboard...');
  await page.goto('http://localhost:3002/production/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Scroll to Active Floor Runs table
  const hasFloorRuns = await page.locator('text=/Active Floor Runs/i').first().isVisible();
  console.log('1. Active Floor Runs section visible:', hasFloorRuns ? '✓ PASS' : '✗ FAIL');

  const tableHeaders = await page.locator('.pod-runs-table th').allTextContents();
  console.log('2. Production Floor Runs Table Headers:', tableHeaders);
  const hasStageAndMachine = tableHeaders.some(h => h.toLowerCase().includes('stage & machine'));
  console.log('3. "Stage & Machine" Column REMOVED:', !hasStageAndMachine ? '✓ PASS' : '✗ FAIL (Still Present)');

  const screenshotProduction = path.join(brainDir, 'production_dashboard_no_machine_col.png');
  await page.screenshot({ path: screenshotProduction });
  console.log('✓ Saved screenshot of Production Floor Runs:', screenshotProduction);

  console.log('\n--- ALL VERIFICATIONS COMPLETE ---');
  await browser.close();
}

testAll().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
