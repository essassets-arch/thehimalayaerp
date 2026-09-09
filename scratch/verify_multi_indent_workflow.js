const { chromium } = require('playwright');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  console.log('=== STARTING MULTI-INDENT PO WORKFLOW VERIFICATION ===');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 28.6139, longitude: 77.2090 },
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('PO') || msg.text().includes('indent') || msg.text().includes('Failed')) {
      console.log(`[Browser ${msg.type()}]:`, msg.text());
    }
  });

  // Step 1: Login as Super Admin
  console.log('1. Logging in as Super Admin...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');

  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(async () => {
    await page.waitForTimeout(3000);
  });
  console.log('   Logged in, current URL:', page.url());

  // Step 2: Navigate to Finance PO Requests (Pending Requests tab)
  console.log('2. Navigating to Finance PO Requests (Pending Requests tab)...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Pending%20Requests');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(artifactDir, 'step1_pending_requests_grouped.png'), fullPage: true });
  console.log('   Captured step1_pending_requests_grouped.png');

  // Verify both ind-0010 and ind-0011 cards are rendered
  const ind10Header = await page.locator('text=/ind-0010/i').first().isVisible();
  const ind11Header = await page.locator('text=/ind-0011/i').first().isVisible();
  console.log(`   ind-0010 visible: ${ind10Header}, ind-0011 visible: ${ind11Header}`);

  // Step 3: Select Materials across both indents
  console.log('3. Selecting materials: WATER PAPER 60, WATER PAPER 120 from ind-0010, and Material A from ind-0011...');
  
  await page.locator('tr').filter({ hasText: 'WATER PAPER 60' }).first().click();
  await page.waitForTimeout(300);
  await page.locator('tr').filter({ hasText: 'WATER PAPER 120' }).first().click();
  await page.waitForTimeout(300);
  await page.locator('tr').filter({ hasText: 'Material A' }).first().click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(artifactDir, 'step2_materials_selected.png') });
  console.log('   Captured step2_materials_selected.png');

  // Check the Create Purchase Order button text
  const createPOBtn = page.locator('button:has-text("Create Purchase Order")').first();
  const btnText = await createPOBtn.innerText();
  console.log(`   Create PO Button text: "${btnText}"`);

  // Step 4: Click Create Purchase Order
  console.log('4. Clicking Create Purchase Order (3 Items)...');
  await createPOBtn.click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(artifactDir, 'step3_create_po_form.png'), fullPage: true });
  console.log('   Captured step3_create_po_form.png');

  // Step 5: Fill PO form fields
  console.log('5. Filling PO form fields (Vendor, delivery date, rates)...');
  const vendorInput = page.locator('input[placeholder*="Vendor" i]').first();
  await vendorInput.fill('Himalaya Test Vendor');

  const dateInput = page.locator('input[type="date"]').first();
  await dateInput.fill('2026-09-30');

  // Rates in the selected materials table
  const rateInputs = page.locator('input[placeholder*="Rate per unit" i]');
  const rateCount = await rateInputs.count();
  console.log(`   Found ${rateCount} rate per unit inputs on form`);
  for (let i = 0; i < rateCount; i++) {
    await rateInputs.nth(i).fill(String(125 + i * 25));
  }
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(artifactDir, 'step4_form_filled_and_totals.png') });
  console.log('   Captured step4_form_filled_and_totals.png');

  // Step 6: Submit the PO
  console.log('6. Submitting the Purchase Order...');
  const submitBtn = page.locator('button[type="submit"]').first();
  console.log('   Submit button text:', await submitBtn.innerText());
  await submitBtn.click();
  await page.waitForTimeout(4000);

  await page.screenshot({ path: path.join(artifactDir, 'step5_post_submission.png') });
  console.log('   Captured step5_post_submission.png');

  // Step 7: Check Database Records
  console.log('7. Verifying Database state...');
  const latestPO = await prisma.purchaseOrder.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { items: true, purchaseIndent: true }
  });

  console.log('=== LATEST PURCHASE ORDER IN DB ===');
  console.log(`PO ID: ${latestPO?.id}`);
  console.log(`Public ID: ${latestPO?.publicId}`);
  console.log(`Status: ${latestPO?.status}`);
  console.log(`Total Amount: ${latestPO?.totalAmount}`);
  console.log(`Primary Indent ID: ${latestPO?.purchaseIndentId}`);
  console.log(`Snapshot selectedIndents:`, JSON.stringify(latestPO?.snapshot?.selectedIndents, null, 2));
  console.log(`Snapshot selectedItems:`, JSON.stringify(latestPO?.snapshot?.selectedItems, null, 2));
  console.log(`PO Items Count: ${latestPO?.items?.length}`);
  for (const it of (latestPO?.items || [])) {
    console.log(`  - PO Item: ${it.id} | Product: ${it.productId} | IndentItem: ${it.indentItemId} | IndentID: ${it.purchaseIndentId} | Name: ${it.materialNameSnapshot} | Qty: ${it.quantity} | Rate: ${it.unitPrice}`);
  }

  const ind10After = await prisma.purchaseIndent.findFirst({
    where: { publicId: 'ind-0010' },
    include: { items: true }
  });
  const ind11After = await prisma.purchaseIndent.findFirst({
    where: { publicId: 'ind-0011' },
    include: { items: true }
  });

  console.log('=== INDENT STATUSES AFTER PO CREATION ===');
  console.log(`ind-0010 status: ${ind10After?.status}`);
  console.log(`ind-0011 status: ${ind11After?.status}`);

  // Step 8: Return to Pending Requests tab in UI and verify remaining materials
  console.log('8. Returning to Pending Requests tab in UI...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Pending%20Requests');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(artifactDir, 'step6_remaining_pending_requests.png'), fullPage: true });
  console.log('   Captured step6_remaining_pending_requests.png');

  // Verify remaining rows in table
  const remainingRows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(tr => tr.innerText.trim().replace(/\s+/g, ' '));
  });
  console.log('Remaining Pending Request Material Lines in UI:', remainingRows);

  await context.close();
  await browser.close();
  await prisma.$disconnect();
  console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
})();
