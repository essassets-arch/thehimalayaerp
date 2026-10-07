const { chromium } = require('playwright');

async function runBrowserQA() {
  console.log('--- STARTING PLAYWRIGHT BROWSER QA VERIFICATION ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      // Filter out benign background websocket or favicon noise
      if (!txt.includes('socket.io') && !txt.includes('favicon') && !txt.includes('websocket')) {
        consoleErrors.push(txt);
      }
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  // Step 1: Login
  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3002/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const emailInput = await page.$('input[type="email"], input[name="email"]');
  if (emailInput) {
    await emailInput.fill('superadmin@himalayaerp.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    console.log('   Submitted login credentials. Waiting for session...');
    await page.waitForTimeout(3000);
  }

  // Step 2: Navigate to Dispatch Analytics
  console.log('2. Navigating to /plant-head/dispatch-analytics...');
  await page.goto('http://localhost:3002/plant-head/dispatch-analytics', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000); // Allow React hydration & API call

  // Step 3: Check Title & Header
  const content = await page.content();
  const hasHimalaya = content.includes('HIMALAYA');
  const hasTagline = content.includes('STRONG. LIGHT. FOREVER.');
  const hasDispatchTitle = content.includes('DISPATCH ANALYSIS');
  console.log(`3. Header Check -> HIMALAYA: ${hasHimalaya}, Tagline: ${hasTagline}, Title: ${hasDispatchTitle}`);

  // Step 4: Check KPIs
  const hasQty = content.includes('2,883') || content.includes('2883');
  const hasWeight = content.includes('1,29,726.4') || content.includes('129,726.4');
  const hasDays = content.includes('24') && content.includes('DAYS');
  const hasClients = content.includes('35') && content.includes('CLIENTS');
  console.log(`4. KPI Text Check -> Qty (2,883 PCS): ${hasQty}, Weight (129,726.40 KG): ${hasWeight}, Days (24): ${hasDays}, Clients (35): ${hasClients}`);

  // Step 5: Test Audit Modal Button
  console.log('5. Testing "Data Audit" button click...');
  const auditBtn = await page.$('button:has-text("Data Audit")');
  let modalSuccess = false;
  if (auditBtn) {
    await auditBtn.click();
    await page.waitForTimeout(1500);
    const modalContent = await page.content();
    modalSuccess = modalContent.includes('The 17 Data Groups Audit Status') || modalContent.includes('17 Data Groups');
    console.log(`   Audit Modal Opened: ${modalSuccess ? '✅ PASS' : '❌ FAIL'}`);
    
    // Close modal
    const closeBtn = await page.$('button:has-text("Close Audit View")');
    if (closeBtn) await closeBtn.click();
  } else {
    console.log('   Audit button check skipped');
  }

  // Step 6: Take Full-Page Screenshot
  const screenshotPath = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\6434b111-97c0-4e70-b71e-bbe215276aa0\\dispatch_analytics_verified.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`6. Captured full-page verification screenshot to: ${screenshotPath}`);

  // Step 7: Console & Page Errors Check
  console.log(`7. Console Errors Count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('   Errors:', consoleErrors);
  }
  console.log(`   Page Runtime Errors Count: ${pageErrors.length}`);
  if (pageErrors.length > 0) {
    console.log('   Page Errors:', pageErrors);
  }

  await browser.close();

  const isPass = hasHimalaya && hasDispatchTitle && hasQty && hasWeight && consoleErrors.length === 0 && pageErrors.length === 0;
  console.log(`\nOVERALL BROWSER VERIFICATION: ${isPass ? '✅ PASS' : '❌ FAIL'}`);
  return isPass;
}

runBrowserQA().catch(err => {
  console.error('Browser QA Error:', err);
  process.exit(1);
});
