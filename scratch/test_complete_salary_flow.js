const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\fd8f5c2d-4532-408a-9e9c-fc3dbcd6f05a';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 23.8315, longitude: 91.2868 },
    acceptDownloads: true,
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

  // Dismiss permissions popup if visible
  const allowBtn = page.locator('button:has-text("Re-check & Allow All")');
  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  console.log('2. Navigating to /hr/salary/prepare/create...');
  await page.goto('http://localhost:3000/hr/salary/prepare/create');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  // Select employee from custom select dropdown
  console.log('Opening employee dropdown...');
  const triggerBtn = page.locator('button.ctc-dropdown-trigger-btn');
  await triggerBtn.click();
  await page.waitForTimeout(500);

  const firstItem = page.locator('div.ctc-dropdown-item').first();
  console.log('Selecting employee:', await firstItem.innerText());
  await firstItem.click();
  await page.waitForTimeout(2000);

  // Scroll to Basic Salary and change to 35000
  console.log('Setting basic salary to 35000...');
  const basicInput = page.locator('div.ctc-allowance-card:has-text("BASIC SALARY") input[type="number"], div:has-text("ENTER MONTHLY BASIC SALARY") input[type="number"]').first();
  if (await basicInput.count() > 0) {
    await basicInput.fill('35000');
  } else {
    await page.locator('input[type="number"]').first().fill('35000');
  }
  await page.waitForTimeout(500);

  // Scroll to TDS section and select 5%
  console.log('Selecting 5% TDS preset...');
  const preset5Btn = page.locator('div.ctc-allowance-card:has-text("Tax Deducted at Source") button:has-text("5%")');
  if (await preset5Btn.count() > 0) {
    await preset5Btn.click({ force: true });
    console.log('5% TDS preset clicked');
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: path.join(artifactDir, 'salary_structure_configured.png'), fullPage: true });
  console.log('Saved salary_structure_configured.png');

  // Submit the salary structure using the form button
  console.log('Clicking Save & Publish CTC...');
  const saveBtn = page.locator('button.btn-ctc-primary:has-text("Save & Publish CTC")').first();
  await saveBtn.click({ force: true });
  await page.waitForTimeout(3000);

  // Handle SweetAlert confirmation if any
  const swalConfirm = page.locator('button.swal2-confirm');
  if (await swalConfirm.count() > 0 && await swalConfirm.isVisible()) {
    console.log('Confirming SweetAlert dialog...');
    await swalConfirm.click();
    await page.waitForTimeout(2000);
  }

  console.log('Current URL after save:', page.url());
  await page.screenshot({ path: path.join(artifactDir, 'salary_register_after_save.png') });
  console.log('Saved salary_register_after_save.png');

  // Open the Salary Slip modal for the saved employee
  console.log('Opening Salary Slip modal from register...');
  const viewSlipLink = page.locator('button.emp-name-link').first();
  if (await viewSlipLink.count() > 0) {
    await viewSlipLink.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: path.join(artifactDir, 'salary_slip_modal_active.png') });
  console.log('Saved salary_slip_modal_active.png');

  // Click "Download Image"
  console.log('Testing "🖼️ Download Image"...');
  const downloadImgBtn = page.locator('button:has-text("Download Image")');
  if (await downloadImgBtn.count() > 0) {
    console.log('Found Download Image button. Clicking...');
    await downloadImgBtn.click();
    await page.waitForTimeout(4000);
  }

  console.log('\n=== FINAL VERIFICATION RESULTS ===');
  const oklchErrors = consoleErrors.filter(e => e.toLowerCase().includes('oklch'));
  console.log('oklch errors count:', oklchErrors.length);
  const tdsSchemaErrors = consoleErrors.filter(e => e.includes('tdsPercentage') || e.includes('500'));
  console.log('tdsPercentage / 500 errors count:', tdsSchemaErrors.length);

  await browser.close();
})();
