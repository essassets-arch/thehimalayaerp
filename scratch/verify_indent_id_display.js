const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';
  const browser = await chromium.launch({ headless: true });

  // ─────────────────────────────────────────────────────────
  // 1. FINANCE PORTAL VERIFICATION
  // ─────────────────────────────────────────────────────────
  console.log('=== 1. VERIFYING FINANCE PORTAL ===');
  const finContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const finPage = await finContext.newPage();
  await finPage.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });

  await finPage.goto('http://localhost:3000/login');
  await finPage.waitForLoadState('networkidle');

  // Click Finance pill and login
  const finPill = finPage.locator('.pill-btn:has-text("Finance")');
  if (await finPill.count() > 0) {
    await finPill.click();
    await finPage.waitForTimeout(300);
    const loginBtn = finPage.locator('.account-card .btn-quick-login').first();
    await loginBtn.click();
    await finPage.waitForURL('**/finance/**', { timeout: 10000 });
  }

  await finPage.goto('http://localhost:3000/finance/purchase-orders');
  await finPage.waitForLoadState('networkidle');
  await finPage.waitForTimeout(1000);

  // Click "Pending Requests" tab if not active
  const pendingReqTab = finPage.locator('button:has-text("Pending Requests")');
  if (await pendingReqTab.count() > 0) {
    await pendingReqTab.click();
    await finPage.waitForTimeout(1000);
  }

  // Capture screenshot of Pending Requests tab
  await finPage.screenshot({ path: path.join(artifactDir, 'finance_pending_requests_ind0010.png') });
  console.log('Saved finance_pending_requests_ind0010.png');

  // Check the table content
  const financeRows = await finPage.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.map(r => {
      const cells = Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim());
      return cells;
    });
  });
  console.log('Finance Approved Indents (Waiting for PO) rows:', JSON.stringify(financeRows, null, 2));

  // Click "Convert to Draft PO" to check the form header
  const convertBtn = finPage.locator('button:has-text("Convert to Draft PO")').first();
  if (await convertBtn.count() > 0) {
    await convertBtn.click();
    await finPage.waitForTimeout(1000);
    const formHeading = await finPage.locator('h2:has-text("Create Draft PO for")').innerText().catch(() => '');
    console.log('Convert to Draft PO Form Heading:', formHeading);
    await finPage.screenshot({ path: path.join(artifactDir, 'finance_create_draft_po_ind0010.png') });
    console.log('Saved finance_create_draft_po_ind0010.png');
  }

  await finContext.close();

  // ─────────────────────────────────────────────────────────
  // 2. STORE INDENT HISTORY VERIFICATION
  // ─────────────────────────────────────────────────────────
  console.log('\n=== 2. VERIFYING STORE INDENT HISTORY ===');
  const storeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const storePage = await storeContext.newPage();
  await storePage.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });

  await storePage.goto('http://localhost:3000/login');
  await storePage.waitForLoadState('networkidle');

  const storePill = storePage.locator('.pill-btn:has-text("Store")');
  if (await storePill.count() > 0) {
    await storePill.click();
    await storePage.waitForTimeout(300);
    await storePage.locator('.account-card:has-text("Makhdum") .btn-quick-login').first().click();
    await storePage.waitForURL('**/store/**', { timeout: 10000 });
  }

  // Click Indent History navigation tab
  const indentHistoryNav = storePage.locator('button:has-text("Indent History"), a:has-text("Indent History")').first();
  if (await indentHistoryNav.count() > 0) {
    await indentHistoryNav.click();
    await storePage.waitForTimeout(1500);
  } else {
    await storePage.goto('http://localhost:3000/store/indent-history');
    await storePage.waitForLoadState('networkidle');
    await storePage.waitForTimeout(1500);
  }

  await storePage.screenshot({ path: path.join(artifactDir, 'store_indent_history_ind0010.png') });
  console.log('Saved store_indent_history_ind0010.png');

  const storeRows = await storePage.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.slice(0, 15).map(r => {
      const cells = Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim());
      return cells;
    });
  });
  console.log('Store Indent History rows:', JSON.stringify(storeRows, null, 2));

  await storeContext.close();

  // ─────────────────────────────────────────────────────────
  // 3. PLANT HEAD INDENT APPROVALS VERIFICATION
  // ─────────────────────────────────────────────────────────
  console.log('\n=== 3. VERIFYING PLANT HEAD INDENT APPROVALS ===');
  const phContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const phPage = await phContext.newPage();
  await phPage.addInitScript(() => { localStorage.setItem('e2e_bypass_permissions', 'true'); });

  await phPage.goto('http://localhost:3000/login');
  await phPage.waitForLoadState('networkidle');

  const prodPill = phPage.locator('.pill-btn:has-text("Production")');
  if (await prodPill.count() > 0) {
    await prodPill.click();
    await phPage.waitForTimeout(300);
    await phPage.locator('.account-card:has-text("Sana R") .btn-quick-login').click();
    await phPage.waitForURL('**/plant-head/**', { timeout: 10000 });
  }

  await phPage.goto('http://localhost:3000/plant-head/indent-approvals');
  await phPage.waitForLoadState('networkidle');
  await phPage.waitForTimeout(1500);

  await phPage.screenshot({ path: path.join(artifactDir, 'plant_head_indent_approvals_ind0010.png') });
  console.log('Saved plant_head_indent_approvals_ind0010.png');

  const phTableRows = await phPage.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.slice(0, 10).map(r => {
      return Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim());
    });
  });
  console.log('Plant Head Indent Approvals rows:', JSON.stringify(phTableRows, null, 2));

  await phContext.close();
  await browser.close();
  console.log('\nAll verifications completed successfully!');
})();
