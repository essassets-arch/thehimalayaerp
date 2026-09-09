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

  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');

  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(async () => {
    await page.waitForTimeout(3000);
  });
  console.log('Logged in, URL:', page.url());

  // 1. FINANCE PORTAL - PENDING REQUESTS
  console.log('\n--- 1. Navigating to /finance/pending-requests ---');
  await page.goto('http://localhost:3000/finance/pending-requests');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  await page.screenshot({ path: path.join(artifactDir, 'finance_pending_requests_ind0010.png') });
  console.log('Saved finance_pending_requests_ind0010.png');

  let tableData = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim()));
  });
  console.log('Finance Pending Requests Rows:\n', JSON.stringify(tableData, null, 2));

  // Check if Convert to Draft PO button is there
  const convertBtn = page.locator('button:has-text("Convert to Draft PO")').first();
  if (await convertBtn.count() > 0) {
    await convertBtn.click({ force: true });
    await page.waitForTimeout(1500);
    const heading = await page.locator('h2:has-text("Create Draft PO for")').innerText().catch(() => '');
    console.log('Finance Draft PO Form Heading:', heading);
    await page.screenshot({ path: path.join(artifactDir, 'finance_create_draft_po_ind0010.png') });
    console.log('Saved finance_create_draft_po_ind0010.png');
  }

  // 2. STORE INDENT HISTORY
  console.log('\n--- 2. Navigating to /store/indent-history ---');
  await page.goto('http://localhost:3000/store/indent-history');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  await page.screenshot({ path: path.join(artifactDir, 'store_indent_history_ind0010.png') });
  console.log('Saved store_indent_history_ind0010.png');

  const storeRows = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.slice(0, 10).map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim()));
  });
  console.log('Store Indent History Rows:\n', JSON.stringify(storeRows, null, 2));

  // 3. PLANT HEAD INDENT APPROVALS - HISTORY TAB (where ind-0010 is since it was approved)
  console.log('\n--- 3. Navigating to /plant-head/indent-approvals ---');
  await page.goto('http://localhost:3000/plant-head/indent-approvals');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const historyTab = page.locator('button:has-text("History"), button:has-text("Approved")').first();
  if (await historyTab.count() > 0) {
    await historyTab.click({ force: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifactDir, 'plant_head_indent_history_ind0010.png') });
    console.log('Saved plant_head_indent_history_ind0010.png');
    const phHistoryRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      return rows.slice(0, 10).map(r => Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim()));
    });
    console.log('Plant Head Indent History Rows:\n', JSON.stringify(phHistoryRows, null, 2));
  }

  await context.close();
  await browser.close();
  console.log('All verification tasks finished!');
})();
