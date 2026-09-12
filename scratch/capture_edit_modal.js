const { chromium } = require('playwright');
const path = require('path');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\fd8f5c2d-4532-408a-9e9c-fc3dbcd6f05a';

(async () => {
  console.log('=== CAPTURING EDIT QUOTATION WITH DECIMALS ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 23.8315, longitude: 91.2868, accuracy: 20 },
  });
  const page = await context.newPage();

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(3000);

  const allowBtn = page.locator('button:has-text("Re-check & Allow All")');
  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.goto('http://localhost:3000/sales/quotations');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  if (await allowBtn.count() > 0 && await allowBtn.isVisible()) {
    await allowBtn.click();
    await page.waitForTimeout(1000);
  }

  // Find exact row for QU/2627/0026
  const row = page.locator('tr:has-text("QU/2627/0026")');
  const editBtn = row.locator('button:has(.lucide-edit), button[title*="Edit" i], button:has-text("Edit")').first();
  if (await editBtn.count() > 0) {
    console.log('Clicking Edit quotation...');
    await editBtn.click();
    await page.waitForTimeout(2000);

    const editShot = path.join(artifactDir, 'quotation_edit_decimal_inputs.png');
    await page.screenshot({ path: editShot, fullPage: true });
    console.log(`Saved screenshot: ${editShot}`);

    // Verify input values
    const qtyInputs = page.locator('td[data-label="Quantity"] input');
    const q1 = await qtyInputs.nth(0).inputValue();
    const q2 = await qtyInputs.nth(1).inputValue();
    const q3 = await qtyInputs.nth(2).inputValue();
    console.log(`Edit Quantity Values loaded in inputs: Item 1 = "${q1}", Item 2 = "${q2}", Item 3 = "${q3}"`);
  }

  await browser.close();
  console.log('=== DONE ===');
})();
