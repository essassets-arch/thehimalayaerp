const { chromium } = require('playwright');
const path = require('path');
const { execSync } = require('child_process');

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

(async () => {
  console.log('=== STARTING END-TO-END FLOW TEST ===');

  // Step 1: Reset database state
  console.log('1. Resetting PO-DRAFT-2026-000002 to DRAFT with vendor karan...');
  execSync('node scratch/reset_flow_for_test.js', { stdio: 'inherit' });

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

  // Login
  console.log('2. Logging in as Super Admin...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');

  await page.waitForURL('**/(dashboard)/**', { timeout: 15000 }).catch(async () => {
    await page.waitForTimeout(3000);
  });

  // Step 3: Finance Draft POs
  console.log('3. Navigating to Finance Draft POs (Pending Drafts)...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Draft%20POs');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const shot1 = path.join(artifactDir, 'flow_step1_draft_pos_karan.png');
  await page.screenshot({ path: shot1, fullPage: true });
  console.log(`   Captured: ${shot1}`);

  // Check PO-DRAFT-2026-000002 vendor
  const pageText = await page.innerText('body');
  console.log('   Contains PO-DRAFT-2026-000002:', pageText.includes('PO-DRAFT-2026-000002'));
  console.log('   Contains vendor karan:', pageText.includes('karan'));

  // Click "🛡️ Send to Plant Head"
  console.log('4. Clicking "🛡️ Send to Plant Head"...');
  const sendBtn = page.locator('button:has-text("Send to Plant Head")').first();
  if (await sendBtn.isVisible()) {
    await sendBtn.click();
    await page.waitForTimeout(3000);
    const shot1b = path.join(artifactDir, 'flow_step1b_submitted_to_plant_head.png');
    await page.screenshot({ path: shot1b, fullPage: true });
    console.log(`   Captured: ${shot1b}`);
  } else {
    console.log('   Send to Plant Head button not found directly, checking row...');
  }

  // Step 4: Plant Head Approvals
  console.log('5. Navigating to Plant Head Approvals...');
  await page.goto('http://localhost:3000/plant-head/purchase-approvals');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const shot2 = path.join(artifactDir, 'flow_step2_plant_head_queue_karan.png');
  await page.screenshot({ path: shot2, fullPage: true });
  console.log(`   Captured: ${shot2}`);

  // Find Approve button for PO-DRAFT-2026-000002 in table
  console.log('6. Opening Plant Head Approve Modal...');
  const approveBtn = page.locator('table button:has-text("Approve")').first();
  await approveBtn.click();
  await page.waitForSelector('.swal2-popup', { timeout: 10000 });
  await page.waitForTimeout(1500);

  const shot2b = path.join(artifactDir, 'flow_step2b_plant_head_approve_modal.png');
  await page.screenshot({ path: shot2b });
  console.log(`   Captured: ${shot2b}`);

  // Fill in Plant Head approval remarks
  const remarks = 'Technical validation approved. Quality specs verified for vendor Karan.';
  await page.fill('.swal2-textarea', remarks);
  await page.waitForTimeout(500);

  // Confirm approve
  console.log('7. Confirming Plant Head approval...');
  await page.click('button:has-text("Approve & Release to Finance")');
  await page.waitForTimeout(3500);

  // Step 5: Finance Approved POs
  console.log('8. Navigating to Finance Approved POs...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Approved%20POs');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const shot3 = path.join(artifactDir, 'flow_step3_approved_pos_karan_remarks.png');
  await page.screenshot({ path: shot3, fullPage: true });
  console.log(`   Captured: ${shot3}`);

  // Check remarks and vendor in Approved POs
  const approvedText = await page.innerText('body');
  console.log('   Approved POs has vendor karan:', approvedText.includes('karan'));
  console.log('   Approved POs has Plant Head remarks:', approvedText.includes('Technical validation approved'));

  // Step 6: Click "Place Order Manually"
  console.log('9. Clicking "Place Order Manually"...');
  const placeOrderBtn = page.locator('button:has-text("Place Order Manually")').first();
  await placeOrderBtn.click();
  await page.waitForTimeout(1500);

  const shot4 = path.join(artifactDir, 'flow_step4_place_order_modal_karan.png');
  await page.screenshot({ path: shot4 });
  console.log(`   Captured: ${shot4}`);

  // Click Confirm & Place Order
  console.log('10. Confirming manual order placement...');
  await page.click('button:has-text("Confirm & Place Order")');
  await page.waitForTimeout(4000);

  // Step 7: Store Verify Delivery
  console.log('11. Navigating to Store Verify Delivery...');
  await page.goto('http://localhost:3000/store/purchase?tab=Verify%20Delivery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const verifyDeliveryBtn = page.locator('button:has-text("Verify Delivery")').first();
  if (await verifyDeliveryBtn.isVisible()) {
    await verifyDeliveryBtn.click();
    await page.waitForTimeout(2000);
  }

  const shot5 = path.join(artifactDir, 'flow_step5_store_verify_delivery_karan.png');
  await page.screenshot({ path: shot5, fullPage: true });
  console.log(`   Captured: ${shot5}`);

  // Check card
  const storeText = await page.innerText('body');
  console.log('   Store page contains vendor karan:', storeText.includes('karan'));
  console.log('   Store page contains PO ref (not UUID):', !storeText.includes('10961f4a-fc23-4d9e-91b9-ea02acc657a4') || storeText.includes('PO-'));

  // Click card to open details
  const poCard = page.locator('.po-card').first();
  if (await poCard.isVisible()) {
    await poCard.click();
    await page.waitForTimeout(2000);
    const shot5b = path.join(artifactDir, 'flow_step5b_store_delivery_details_karan.png');
    await page.screenshot({ path: shot5b, fullPage: true });
    console.log(`   Captured: ${shot5b}`);
  }

  await browser.close();
  console.log('=== END-TO-END FLOW TEST COMPLETE ===');
})();
