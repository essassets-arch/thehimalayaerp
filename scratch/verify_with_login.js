const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('=== Logging in as Super Admin ===');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  // Fill email and password
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');

  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(async () => {
    await page.waitForTimeout(3000);
  });
  console.log('Current URL after login:', page.url());

  // 1. FINANCE PORTAL - PENDING REQUESTS
  console.log('\n--- 1. Testing Finance Portal (Approved Indents Waiting for PO) ---');
  await page.goto('http://localhost:3000/finance/purchase-orders');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const pendingReqTab = page.locator('button:has-text("Pending Requests")');
  if (await pendingReqTab.count() > 0) {
    await pendingReqTab.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(artifactDir, 'finance_approved_indents_verified.png') });
  console.log('Saved finance_approved_indents_verified.png');

  const financeRows = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim()));
  });
  console.log('Finance Approved Indents (Waiting for PO) table rows:\n', JSON.stringify(financeRows, null, 2));

  // Test "Convert to Draft PO" header
  const convertBtn = page.locator('button:has-text("Convert to Draft PO")').first();
  if (await convertBtn.count() > 0) {
    await convertBtn.click();
    await page.waitForTimeout(1000);
    const formHeading = await page.locator('h2:has-text("Create Draft PO for")').innerText().catch(() => '');
    console.log('Convert to Draft PO Form Heading:', formHeading);
    await page.screenshot({ path: path.join(artifactDir, 'finance_create_draft_po_verified.png') });
    console.log('Saved finance_create_draft_po_verified.png');
  }

  // 2. PLANT HEAD - MATERIAL INDENTS
  console.log('\n--- 2. Testing Plant Head Material Indents ---');
  await page.goto('http://localhost:3000/plant-head/material-indents');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(artifactDir, 'plant_head_material_indents_verified.png') });
  console.log('Saved plant_head_material_indents_verified.png');

  const materialIndentTitles = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div[style*="font-weight: 900"]'));
    return cards.map(c => c.innerText.trim()).filter(t => t.startsWith('ind-') || t.startsWith('IND-'));
  });
  console.log('Plant Head Material Indent Cards:', materialIndentTitles);

  // 3. PLANT HEAD - INDENT APPROVALS
  console.log('\n--- 3. Testing Plant Head Indent Approvals Table ---');
  await page.goto('http://localhost:3000/plant-head/indent-approvals');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(artifactDir, 'plant_head_indent_approvals_verified.png') });
  console.log('Saved plant_head_indent_approvals_verified.png');

  const phRows = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.slice(0, 10).map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim()));
  });
  console.log('Plant Head Indent Approvals rows:\n', JSON.stringify(phRows, null, 2));

  await context.close();
  await browser.close();
  console.log('\nVerification script completed successfully!');
})();
