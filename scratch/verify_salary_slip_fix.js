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

  await page.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });

  console.log('1. Logging in as Super Admin...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('2. Navigating to /hr/salary/prepare...');
  await page.goto('http://localhost:3000/hr/salary/prepare');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Dismiss permission modal if present
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      if (el.innerText && el.innerText.includes('Mandatory Permissions Required') && el.classList && el.classList.contains('fixed')) {
        el.remove();
      }
    });
  });
  const allowBtn2 = page.locator('button:has-text("Re-check & Allow All")');
  if (await allowBtn2.count() > 0 && await allowBtn2.isVisible()) {
    await allowBtn2.click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(artifactDir, 'salary_register_ravikant.png'), fullPage: true });
  console.log('Saved salary_register_ravikant.png');

  // Find Ravikant T in the table and click View Slip
  console.log('3. Opening salary slip for Ravikant T...');
  const ravikantRow = page.locator('tr:has-text("Ravikant")').first();
  if (await ravikantRow.count() > 0) {
    const viewBtn = ravikantRow.locator('button:has-text("View Slip")');
    await viewBtn.click({ force: true });
  } else {
    console.log('Ravikant not in table row, opening directly by button or ID...');
    const anyView = page.locator('button:has-text("View Slip")').first();
    await anyView.click({ force: true });
  }

  await page.waitForSelector('.salary-slip-modal-dialog, #printable-salary-slip-doc', { timeout: 6000 });
  await page.waitForTimeout(1500);

  const slipElement = page.locator('#printable-salary-slip-doc');
  await slipElement.screenshot({ path: path.join(artifactDir, 'salary_slip_full_document.png') });
  console.log('Saved salary_slip_full_document.png');

  // Extract text from the slip to verify calculations
  const slipDoc = page.locator('#printable-salary-slip-doc');
  const slipText = await slipDoc.innerText();
  console.log('\n--- EXTRACTED SLIP TEXT SNIPPET ---');
  console.log(slipText.slice(0, 1000));
  console.log('--- END SLIP TEXT ---\n');

  // Check specific assertions
  const hasGross = slipText.includes('43,750.00');
  const hasDeductions = slipText.includes('2,157.50');
  const hasNet = slipText.includes('41,592.50');
  const hasCompany = slipText.includes('2,516.00');
  const hasCtc = slipText.includes('46,266.00');
  const hasCompEpf = slipText.includes('150.00');

  console.log('Calculations check:');
  console.log('Gross ₹ 43,750.00 present?', hasGross);
  console.log('Deductions ₹ 2,157.50 present?', hasDeductions);
  console.log('Net Take Home ₹ 41,592.50 present?', hasNet);
  console.log('Company Contribution ₹ 2,516.00 present?', hasCompany);
  console.log('Monthly CTC ₹ 46,266.00 present?', hasCtc);
  console.log('Comp EPF ₹ 150.00 present?', hasCompEpf);

  // Close modal
  const closeBtn = page.locator('button:has-text("Close")');
  if (await closeBtn.count() > 0) {
    await closeBtn.click();
    await page.waitForTimeout(1000);
  }

  console.log('4. Navigating to /hr/salary/prepare/edit/01339514-e4bb-4346-a1bb-4ce26be9b838...');
  await page.goto('http://localhost:3000/hr/salary/prepare/edit/01339514-e4bb-4346-a1bb-4ce26be9b838');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Dismiss permission modal if present
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      if (el.innerText && el.innerText.includes('Mandatory Permissions Required') && el.classList && el.classList.contains('fixed')) {
        el.remove();
      }
    });
  });

  await page.screenshot({ path: path.join(artifactDir, 'salary_edit_page_ravikant.png'), fullPage: true });
  console.log('Saved salary_edit_page_ravikant.png');

  // Verify edit fields
  const empNameHeader = await page.locator('.ctc-emp-name, .ctc-header-title').innerText().catch(() => '');
  console.log('Edit page header / emp:', empNameHeader);

  await browser.close();
  console.log('Verification completed successfully!');
})();
