const { chromium } = require('playwright');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  }
});

const artifactDir = 'C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\8d82b913-d83a-4d15-89eb-fcf8bda9d447';

async function main() {
  console.log('=== TESTING FINANCE AUDIT REJECTION VIA UI ===\n');

  // Find a pending GRN to reject
  const targetGRN = await prisma.goodsReceiptNote.findFirst({
    where: { status: 'PENDING_FINANCE_AUDIT' },
    include: { purchaseOrder: true }
  });

  if (!targetGRN) {
    console.log('No pending GRN found for rejection test.');
    return;
  }

  console.log(`Target GRN for rejection: ${targetGRN.grnNumber} (PO: ${targetGRN.purchaseOrder?.poNumber})`);
  console.log('Initial GRN status:', targetGRN.status);
  console.log('Initial PO status:', targetGRN.purchaseOrder?.status);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['geolocation', 'notifications'],
    geolocation: { latitude: 28.6139, longitude: 77.2090 }
  });

  await context.addInitScript(() => {
    window.localStorage.setItem('e2e_bypass_permissions', 'true');
    window.sessionStorage.setItem('e2e_bypass_permissions', 'true');
    window.__PLAYWRIGHT_TEST__ = true;
  });

  const page = await context.newPage();

  console.log('Logging in as Super Admin / Auditor...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('Navigating to Finance Delivery Audit...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Delivery%20Audit');
  await page.waitForTimeout(3000);

  // Click Review & Audit on the target GRN card
  console.log(`Clicking Review & Audit on ${targetGRN.grnNumber}...`);
  const card = page.locator('.da-card', { hasText: targetGRN.grnNumber }).first();
  await card.locator('.da-audit-btn').click();
  await page.waitForTimeout(1500);

  // Click Reject Audit
  console.log('Clicking Reject Audit button...');
  await page.click('.da-btn-reject');
  await page.waitForTimeout(1000);

  // SweetAlert textarea prompt should appear
  console.log('Filling mandatory rejection reason in SweetAlert modal...');
  const rejectionReason = 'Physical inspection failed: outer seal damaged and barcode unreadable by scanner.';
  await page.fill('.swal2-textarea', rejectionReason);
  await page.click('.swal2-confirm');
  await page.waitForTimeout(3000);

  // Dismiss success popup
  const swalOk = page.locator('.swal2-confirm');
  if (await swalOk.isVisible()) {
    await swalOk.click();
    await page.waitForTimeout(1500);
  }

  // Switch to Audit History Tab to take screenshot of rejected GRN in history
  console.log('Navigating to Audit History tab to verify rejected status chip...');
  await page.click('.da-tab:has-text("Audit History")');
  await page.waitForTimeout(2000);

  const historyShot = path.join(artifactDir, 'finance_delivery_audit_rejection_history.png');
  await page.screenshot({ path: historyShot, fullPage: false });
  console.log('✓ Captured Audit History with rejected GRN:', historyShot);

  await browser.close();

  // Verify in DB
  const finalGRN = await prisma.goodsReceiptNote.findUnique({
    where: { id: targetGRN.id },
    include: { purchaseOrder: true }
  });

  console.log('\n=== REJECTION VERIFICATION RESULTS ===');
  console.log('Final GRN status:', finalGRN?.status, '(Expected: FINANCE_AUDIT_REJECTED)');
  console.log('Final PO status:', finalGRN?.purchaseOrder?.status, '(Expected: PARTIALLY_DELIVERED)');
  console.log('Rejection reason recorded:', (finalGRN?.snapshot)?.rejectionReason);

  const poOpen = finalGRN?.purchaseOrder?.status !== 'CLOSED';
  console.log(`PO remains open for store re-verification: ${poOpen ? 'PASS' : 'FAIL'}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
