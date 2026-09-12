const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\fd8f5c2d-4532-408a-9e9c-fc3dbcd6f05a';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 23.8315, longitude: 91.2868 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log('PAGE ERROR:', err.message);
  });

  console.log('1. Logging in as Super Admin...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');

  await page.waitForTimeout(3000);
  console.log('Current URL:', page.url());

  // Handle any permissions overlay if shown
  const allowBtn = page.locator('button:has-text("Re-check & Allow All")');
  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    console.log('Dismissing permissions overlay...');
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  console.log('2. Navigating to /hr/salary/prepare/create...');
  await page.goto('http://localhost:3000/hr/salary/prepare/create');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Check again for permissions overlay
  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    console.log('Dismissing permissions overlay on create page...');
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(artifactDir, 'create_salary_structure_page.png') });
  console.log('Screenshot saved: create_salary_structure_page.png');

  // Select an employee from the dropdown
  const empSelect = page.locator('select').first();
  if (await empSelect.count() > 0) {
    const options = await empSelect.locator('option').allInnerTexts();
    console.log('Available employees:', options);
    if (options.length > 1) {
      await empSelect.selectOption({ index: 1 });
      console.log('Selected employee at index 1');
      await page.waitForTimeout(2000);
    }
  }

  await page.screenshot({ path: path.join(artifactDir, 'employee_selected_form.png') });
  console.log('Screenshot saved: employee_selected_form.png');

  // Verify TDS field is present
  const tdsField = page.locator('text=Tax Deducted at Source (TDS)');
  const tdsCount = await tdsField.count();
  console.log('TDS field count in DOM:', tdsCount);

  // Test editing Basic Salary
  const basicInput = page.locator('input[placeholder*="30000"], input[type="number"]').first();
  if (await basicInput.count() > 0) {
    await basicInput.fill('45000');
    console.log('Filled basic salary: 45000');
    await page.waitForTimeout(500);
  }

  // Click 5% TDS preset
  const tdsSection = page.locator('div:has-text("Tax Deducted at Source (TDS)")').last();
  const preset5 = tdsSection.locator('button:has-text("5%")');
  if (await preset5.count() > 0) {
    console.log('Clicking 5% TDS preset...');
    await preset5.first().click({ force: true });
    await page.waitForTimeout(500);
  }

  // Open Official Salary Statement Slip modal
  const viewSlipBtn = page.locator('button:has-text("Official Salary Statement Slip"), button:has-text("Statement Slip")').first();
  if (await viewSlipBtn.count() > 0) {
    console.log('Opening Salary Statement Slip modal...');
    await viewSlipBtn.click({ force: true });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(artifactDir, 'salary_slip_modal_rendered.png') });
    console.log('Screenshot saved: salary_slip_modal_rendered.png');

    const downloadImgBtn = page.locator('button:has-text("Download Image"), button:has-text("Image (PNG)")').first();
    if (await downloadImgBtn.count() > 0) {
      console.log('Clicking Download Image button to verify no oklch error...');
      await downloadImgBtn.click({ force: true });
      await page.waitForTimeout(4000);
    }
  }

  console.log('\n=== TEST SUMMARY ===');
  console.log('Total console errors during flow:', consoleErrors.length);
  const oklchErrors = consoleErrors.filter(e => e.includes('oklch'));
  console.log('oklch errors:', oklchErrors.length);
  const schemaErrors = consoleErrors.filter(e => e.includes('tdsPercentage') || e.includes('500'));
  console.log('schema/500 errors:', schemaErrors.length);

  await browser.close();
})();
