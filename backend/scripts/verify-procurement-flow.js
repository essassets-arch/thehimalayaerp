const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module');
const { PrismaService } = require('../dist/src/database/prisma.service');
const { ProcurementService } = require('../dist/src/modules/procurement/procurement.service');

async function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ ${message}`);
  }
}

async function bootstrap() {
  console.log('🚀 Starting end-to-end Procurement Workflow Verification...\n');
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const service = app.get(ProcurementService);

  const company = await prisma.company.findFirst();
  assert(!!company, 'Company should exist');

  const storeManagerUser = await prisma.user.findFirst({ where: { role: { code: 'STORE_MANAGER' } } });
  const plantHeadUser = await prisma.user.findFirst({ where: { role: { code: 'PLANT_HEAD' } } });
  const financeUser = await prisma.user.findFirst({ where: { role: { code: { in: ['FINANCE_EXECUTIVE', 'FINANCE_MANAGER'] } } } });
  const superAdminUser = await prisma.user.findFirst({ where: { role: { code: 'SUPER_ADMIN' } } });

  assert(!!storeManagerUser, 'STORE_MANAGER user should exist');
  assert(!!plantHeadUser, 'PLANT_HEAD user should exist');
  assert(!!financeUser, 'FINANCE user should exist');
  assert(!!superAdminUser, 'SUPER_ADMIN user should exist');

  const product = await prisma.product.findFirst({ where: { sku: 'HM209' } });
  const rawMaterial = await prisma.rawMaterial.findFirst({ where: { sku: 'HM209' } });
  console.log('PRODUCT FOUND:', product);
  console.log('RAW MATERIAL FOUND:', rawMaterial);

  assert(!!product, 'Product HM209 should exist');
  assert(!!rawMaterial, 'RawMaterial HM209 should exist');

  let warehouse = await prisma.warehouse.findFirst({ where: { companyId: company.id } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        companyId: company.id,
        name: 'Main Test Warehouse',
      }
    });
  }
  assert(!!warehouse, 'Warehouse should exist');

  let supplier = await prisma.supplier.findFirst({ where: { companyId: company.id } });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        publicId: 'SUP-TEST',
        companyId: company.id,
        name: 'Test Supplier Corp',
        email: 'supplier@test.com',
        phone: '1234567890',
        isActive: true,
      }
    });
  }
  assert(!!supplier, 'Supplier should exist');

  // Verify Initial Stock is 0
  const initialStockGrouped = await prisma.inventoryTransaction.groupBy({
    by: ['productId', 'rawMaterialId', 'type'],
    _sum: { quantity: true },
    where: { companyId: company.id, productId: product.id },
  });
  let initialStock = 0;
  for (const r of initialStockGrouped) {
    const qty = Number(r._sum.quantity || 0);
    const typeUpper = (r.type || '').toUpperCase().trim();
    if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN', 'ADJUSTMENT'].includes(typeUpper)) {
      initialStock += qty;
    } else if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(typeUpper)) {
      initialStock -= qty;
    }
  }
  console.log(`Initial stock for HM209: ${initialStock} PCS`);

  // Stage 1: Store creates material indent
  console.log('\n--- STAGE 1: Store Creates Indent ---');
  const indent = await service.createIndent({
    department: 'Production',
    requiredDate: new Date('2026-08-25').toISOString(),
    priority: 'HIGH',
    remarks: 'Test Indent for HM209 verification',
    items: [{ productId: product.id, quantity: 100 }]
  }, storeManagerUser.id);

  assert(indent.status === 'PENDING_PLANT_HEAD_APPROVAL', 'Initial indent status must be PENDING_PLANT_HEAD_APPROVAL');
  assert(indent.indentNo.startsWith('IND-'), `Indent reference generated correctly: ${indent.indentNo}`);
  
  const indentItem = await prisma.purchaseIndentItem.findFirst({ where: { purchaseIndentId: indent.id } });
  assert(indentItem.materialCode === 'HM209', 'Snapshotted material code is correct');
  assert(indentItem.materialName === 'FAVDE HANDLE', 'Snapshotted material name is correct');
  assert(indentItem.uom === 'PCS', 'Snapshotted UOM is correct');
  assert(Number(indentItem.currentStockSnapshot) === initialStock, 'Snapshotted current stock is correct');

  // Stage 2: Plant Head approves indent
  console.log('\n--- STAGE 2: Plant Head Approves Indent ---');
  const approvedIndent = await service.indentAction(indent.id, 'approve', {
    items: [{ productId: product.id, approvedQuantity: 100 }]
  }, plantHeadUser.id);

  assert(approvedIndent.status === 'PLANT_HEAD_APPROVED', 'Indent status updated to PLANT_HEAD_APPROVED');
  const dbIndentItem = await prisma.purchaseIndentItem.findFirst({ where: { purchaseIndentId: indent.id } });
  assert(Number(dbIndentItem.approvedQuantity) === 100, `Approved quantity persisted in DB: ${dbIndentItem.approvedQuantity}`);

  // Stage 3: Finance converts to Draft PO
  console.log('\n--- STAGE 3: Finance Converts to Draft PO ---');
  const draftPO = await service.createPO(indent.id, {
    supplierId: supplier.id,
    freight: 1000,
    otherCharges: 0,
    paymentTerms: '30 Days Net',
    expectedDeliveryDate: new Date('2026-08-25').toISOString(),
    items: [{ productId: product.id, quantity: 100, unitPrice: 200, gstPercent: 18 }]
  }, financeUser.id);

  assert(draftPO.status === 'PENDING_SUPER_ADMIN_APPROVAL', 'Draft PO status is PENDING_SUPER_ADMIN_APPROVAL');
  assert(draftPO.draftPoNo.startsWith('PO-DRAFT-'), `Draft PO reference generated correctly: ${draftPO.draftPoNo}`);
  assert(Number(draftPO.totalAmount) === 24600, `Grand total calculated correctly on backend: ${draftPO.totalAmount}`);
  assert(Number(draftPO.gstAmount) === 3600, `GST amount calculated correctly: ${draftPO.gstAmount}`);

  const poItem = await prisma.purchaseOrderItem.findFirst({ where: { purchaseOrderId: draftPO.id } });
  assert(poItem.materialCodeSnapshot === 'HM209', 'Item snapshotted material code matches');
  assert(poItem.materialNameSnapshot === 'FAVDE HANDLE', 'Item snapshotted material name matches');
  assert(poItem.uomSnapshot === 'PCS', 'Item snapshotted UOM matches');
  assert(Number(poItem.lineSubtotal) === 20000, 'Item line subtotal matches');
  assert(Number(poItem.gstAmount) === 3600, 'Item GST matches');
  assert(Number(poItem.lineTotal) === 23600, 'Item line total matches');

  const updatedIndent = await prisma.purchaseIndent.findUnique({ where: { id: indent.id } });
  assert(updatedIndent.status === 'DRAFT_PO_CREATED', `Indent status updated to DRAFT_PO_CREATED: ${updatedIndent.status}`);

  // Stage 4: Super Admin approves PO Draft
  console.log('\n--- STAGE 4: Super Admin Approves Draft PO ---');
  const saApprovedPO = await service.poAction(draftPO.id, 'approve', {}, superAdminUser.id);
  assert(saApprovedPO.status === 'SUPER_ADMIN_APPROVED', 'PO status updated to SUPER_ADMIN_APPROVED');

  const indentAfterSA = await prisma.purchaseIndent.findUnique({ where: { id: indent.id } });
  assert(indentAfterSA.status === 'SUPER_ADMIN_APPROVED', 'Indent status updated to SUPER_ADMIN_APPROVED');

  // Stage 5: Finance issues/places order
  console.log('\n--- STAGE 5: Finance Issues PO ---');
  const orderedPO = await service.poAction(draftPO.id, 'issue', {
    expectedDeliveryDate: new Date('2026-08-25').toISOString(),
    vendorOrderReference: 'ACK-HM209-E2E',
    remarks: 'Ordered manually via phone'
  }, financeUser.id);

  assert(orderedPO.status === 'ORDERED', 'PO status updated to ORDERED');
  assert(orderedPO.poNo.startsWith('PO-'), `Final PO reference generated correctly: ${orderedPO.poNo}`);
  assert(orderedPO.vendorOrderReference === 'ACK-HM209-E2E', 'Vendor acknowledgment ref persisted');

  const indentAfterOrder = await prisma.purchaseIndent.findUnique({ where: { id: indent.id } });
  assert(indentAfterOrder.status === 'ORDERED', 'Indent status updated to ORDERED');

  // Stage 6: Store verifies delivery (received 100, accepted 100, rejected 0)
  console.log('\n--- STAGE 6: Store Verifies Delivery ---');
  const grnResult = await service.verifyDelivery({
    purchaseOrderId: orderedPO.id,
    warehouseId: warehouse.id,
    deliveryDate: new Date().toISOString(),
    invoiceNumber: 'INV-HM209-E2E',
    deliveryChallanNumber: 'DC-HM209-E2E',
    remarks: 'Delivery verified by store',
    items: [{
      productId: product.id,
      purchaseOrderItemId: poItem.id,
      deliveredQuantity: 100,
      acceptedQuantity: 100,
      rejectedQuantity: 0
    }]
  }, storeManagerUser.id);

  const grn = grnResult.delivery;
  assert(grn.status === 'PENDING_FINANCE_AUDIT', 'GRN status is PENDING_FINANCE_AUDIT');
  assert(grn.grnNumber.startsWith('GRN-'), `GRN number generated correctly: ${grn.grnNumber}`);
  
  const grnItem = await prisma.goodsReceiptNoteItem.findFirst({ where: { goodsReceiptNoteId: grn.id } });
  assert(Number(grnItem.acceptedQuantity) === 100, 'GRN accepted quantity is 100');
  assert(Number(grnItem.rejectedQuantity) === 0, 'GRN rejected quantity is 0');

  const poAfterDelivery = await prisma.purchaseOrder.findUnique({ where: { id: orderedPO.id } });
  assert(poAfterDelivery.status === 'DELIVERY_PENDING_FINANCE_AUDIT', 'PO status transitioned to DELIVERY_PENDING_FINANCE_AUDIT');

  const indentAfterDelivery = await prisma.purchaseIndent.findUnique({ where: { id: indent.id } });
  assert(indentAfterDelivery.status === 'DELIVERY_PENDING_FINANCE_AUDIT', 'Indent status transitioned to DELIVERY_PENDING_FINANCE_AUDIT');

  // Verify stock remains unchanged before Finance Audit
  const stockBeforeAuditGrouped = await prisma.inventoryTransaction.groupBy({
    by: ['productId', 'rawMaterialId', 'type'],
    _sum: { quantity: true },
    where: { companyId: company.id, productId: product.id },
  });
  let stockBeforeAudit = 0;
  for (const r of stockBeforeAuditGrouped) {
    const qty = Number(r._sum.quantity || 0);
    const typeUpper = (r.type || '').toUpperCase().trim();
    if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN', 'ADJUSTMENT'].includes(typeUpper)) {
      stockBeforeAudit += qty;
    } else if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(typeUpper)) {
      stockBeforeAudit -= qty;
    }
  }
  assert(stockBeforeAudit === initialStock, `CRITICAL CHECK: Stock remained unchanged at ${stockBeforeAudit} PCS before Finance Audit`);

  // Stage 7: Finance audits delivery
  console.log('\n--- STAGE 7: Finance Audit Approval ---');
  const auditedGRN = await service.grnAction(grn.id, 'audit-approve', {}, financeUser.id);
  assert(auditedGRN.status === 'FINANCE_AUDIT_APPROVED', 'GRN audited successfully');

  // Verify stock increases by accepted quantity (100)
  const stockAfterAuditGrouped = await prisma.inventoryTransaction.groupBy({
    by: ['productId', 'rawMaterialId', 'type'],
    _sum: { quantity: true },
    where: { companyId: company.id, productId: product.id },
  });
  let stockAfterAudit = 0;
  for (const r of stockAfterAuditGrouped) {
    const qty = Number(r._sum.quantity || 0);
    const typeUpper = (r.type || '').toUpperCase().trim();
    if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN', 'ADJUSTMENT'].includes(typeUpper)) {
      stockAfterAudit += qty;
    } else if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(typeUpper)) {
      stockAfterAudit -= qty;
    }
  }
  assert(stockAfterAudit === initialStock + 100, `CRITICAL CHECK: Stock successfully increased by 100 PCS (Current Stock: ${stockAfterAudit} PCS)`);

  const allTxs = await prisma.inventoryTransaction.findMany({
    where: { referenceId: orderedPO.id }
  });
  console.log('ALL TXS FOR PO:', allTxs);

  // Verify exactly one inventory transaction IN is posted
  const txs = await prisma.inventoryTransaction.findMany({
    where: {
      companyId: company.id,
      productId: product.id,
      rawMaterialId: rawMaterial.id,
      referenceId: orderedPO.id,
      referenceType: 'PURCHASE_ORDER',
      type: 'IN'
    }
  });
  assert(txs.length === 1, `CRITICAL CHECK: Exactly one inventory ledger entry IN created linking both product and raw material (Count: ${txs.length})`);
  assert(Number(txs[0].quantity) === 100, 'Inventory transaction quantity is exactly 100');

  // Verify Idempotency: Duplicate approval should fail or be blocked
  console.log('\n--- STAGE 8: Enforce Idempotency ---');
  try {
    await service.grnAction(grn.id, 'audit-approve', {}, financeUser.id);
    assert(false, 'Should throw duplicate audited warning error');
  } catch (err) {
    assert(err.message.includes('audited') || err.message.includes('status') || err.message.includes('FINANCE_AUDIT_APPROVED') || err.message.includes('audit-approve'), `Successfully threw duplicate audited error: ${err.message}`);
  }

  // Verify PO and Indent are closed
  const finalPO = await prisma.purchaseOrder.findUnique({ where: { id: orderedPO.id } });
  const finalIndent = await prisma.purchaseIndent.findUnique({ where: { id: indent.id } });
  
  assert(finalPO.status === 'CLOSED', `PO successfully transitioned to CLOSED: ${finalPO.status}`);
  assert(finalIndent.status === 'CLOSED', `Indent successfully transitioned to CLOSED: ${finalIndent.status}`);
  assert(finalPO.closedAt !== null, 'PO closedAt timestamp set');
  assert(finalIndent.closedAt !== null, 'Indent closedAt timestamp set');

  console.log('\n🌟 WORKFLOW LIFE CYCLE FULLY PERSISTED & VERIFIED ON POSTGRESQL! 🌟');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
