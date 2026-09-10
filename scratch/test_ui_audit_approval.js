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
  console.log('=== TESTING FINANCE AUDIT APPROVAL VIA UI ===\n');

  // Check initial state of GRN-2026-000014
  const initialGRN = await prisma.goodsReceiptNote.findUnique({
    where: { grnNumber: 'GRN-2026-000014' },
    include: { items: true, purchaseOrder: true }
  });
  console.log('Initial GRN status:', initialGRN?.status);
  console.log('Initial PO status:', initialGRN?.purchaseOrder?.status);

  async function getStock(productId) {
    const txs = await prisma.inventoryTransaction.findMany({ where: { productId } });
    let total = 0;
    for (const t of txs) {
      const type = (t.type || '').toUpperCase().trim();
      const qty = Number(t.quantity || 0);
      if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN', 'ADJUSTMENT'].includes(type)) {
        total += qty;
      } else if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(type)) {
        total -= qty;
      }
    }
    return total;
  }

  const deliveredProductId = initialGRN.items[0]?.productId;
  const initialStock = await getStock(deliveredProductId);
  console.log(`Initial stock for delivered product (${deliveredProductId}): ${initialStock}`);

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
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[BROWSER CONSOLE ERROR]:', msg.text());
  });

  // Log in as super.admin@himalayaerp.com
  console.log('Logging in as Super Admin / Finance Auditor...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'super.admin@himalayaerp.com');
  await page.fill('input[type="password"], input[placeholder*="password" i]', 'SuperAdmin@hcppl');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForTimeout(3000);

  // Navigate to Finance Delivery Audit
  console.log('Navigating to Finance Delivery Audit...');
  await page.goto('http://localhost:3000/finance/po-requests?tab=Delivery%20Audit');
  await page.waitForTimeout(3000);

  // Find the card for GRN-2026-000014
  console.log('Selecting GRN-2026-000014...');
  const grn14Card = page.locator('.da-card', { hasText: 'GRN-2026-000014' }).first();
  await grn14Card.locator('.da-audit-btn').click();
  await page.waitForTimeout(1500);

  const detailShot = path.join(artifactDir, 'grn_0014_detail_view.png');
  await page.screenshot({ path: detailShot });
  console.log('✓ Captured GRN-2026-000014 detail view:', detailShot);

  // Fill remarks and click Accept & Close PO
  console.log('Entering audit remarks and approving...');
  await page.fill('.da-remarks-input', 'Delivery audited and verified against physical challan CH-WP-79464. Approved.');
  await page.click('.da-btn-approve');
  await page.waitForTimeout(1000);

  // Confirm Swal popup
  const swalConfirm = page.locator('.swal2-confirm');
  if (await swalConfirm.isVisible()) {
    console.log('Confirming SweetAlert popup...');
    await swalConfirm.click();
    await page.waitForTimeout(3000);
  }

  // Dismiss success alert
  const swalOk = page.locator('.swal2-confirm');
  if (await swalOk.isVisible()) {
    await swalOk.click();
    await page.waitForTimeout(1500);
  }

  await browser.close();

  // Verify in DB
  const finalGRN = await prisma.goodsReceiptNote.findUnique({
    where: { grnNumber: 'GRN-2026-000014' },
    include: { items: true, purchaseOrder: true }
  });
  console.log('\n=== VERIFICATION RESULTS ===');
  console.log('Final GRN status:', finalGRN?.status, '(Expected: FINANCE_AUDIT_APPROVED)');
  console.log('Final PO status:', finalGRN?.purchaseOrder?.status, '(Expected: CLOSED)');

  const finalStock = await getStock(deliveredProductId);
  console.log(`Final stock for delivered product (${deliveredProductId}): ${finalStock}`);
  console.log(`Inventory unchanged between Store and Finance: ${finalStock === initialStock ? 'PASS (No double posting)' : 'FAIL'}`);

  if (finalGRN?.purchaseOrder?.purchaseIndentId) {
    const indent = await prisma.purchaseIndent.findUnique({
      where: { id: finalGRN.purchaseOrder.purchaseIndentId }
    });
    console.log('Final Indent status:', indent?.status, '(Expected: CLOSED)');
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
