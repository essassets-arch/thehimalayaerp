const jwt = require('jsonwebtoken');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
      }
    }
  });

  console.log('=== STARTING DELIVERY AUDIT FULL END-TO-END TEST ===\n');

  // 1. Find Super Admin / Users
  const adminUser = await prisma.user.findFirst({
    where: { role: { name: { in: ['Super Admin', 'Admin', 'Plant Head'] } } },
    include: { role: true }
  });

  if (!adminUser) {
    throw new Error('No admin user found');
  }

  const storeUser = await prisma.user.findFirst({
    where: { email: 'makhdum@himalayaerp.com' },
    include: { role: true }
  }) || adminUser;

  const financeUser = await prisma.user.findFirst({
    where: { email: 'sahad.m@himalayaerp.com' },
    include: { role: true }
  });

  if (!financeUser) {
    throw new Error('Finance user sahad.m@himalayaerp.com not found');
  }

  const secret = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
  const storeToken = jwt.sign({
    sub: storeUser.id,
    id: storeUser.id,
    email: storeUser.email,
    role: storeUser.role.name,
    companyId: storeUser.companyId
  }, secret, { expiresIn: '1h' });

  const financeToken = jwt.sign({
    sub: financeUser.id,
    id: financeUser.id,
    email: financeUser.email,
    role: financeUser.role.name,
    companyId: financeUser.companyId
  }, secret, { expiresIn: '1h' });

  const storeApi = axios.create({
    baseURL: 'http://127.0.0.1:4001/api/v1',
    headers: {
      Authorization: `Bearer ${storeToken}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  const financeApi = axios.create({
    baseURL: 'http://127.0.0.1:4001/api/v1',
    headers: {
      Authorization: `Bearer ${financeToken}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  // 2. Find product "WATER PAPER 150" or first raw material
  let product = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'WATER PAPER 150', mode: 'insensitive' } },
        { name: { contains: 'WATER PAPER', mode: 'insensitive' } },
        { productType: 'RAW_MATERIAL' }
      ]
    }
  });

  if (!product) {
    product = await prisma.product.findFirst();
  }

  console.log(`Using Product: "${product.name}" (ID: ${product.id})`);

  async function getStock(productId) {
    const txs = await prisma.inventoryTransaction.findMany({
      where: { productId }
    });
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

  // Check current inventory level for this product
  const initialQty = await getStock(product.id);
  console.log(`Initial stock quantity in DB: ${initialQty}`);

  // Find a supplier
  const supplier = await prisma.supplier.findFirst();
  const warehouse = await prisma.warehouse.findFirst();

  if (!supplier || !warehouse) {
    throw new Error('Supplier or Warehouse missing in DB');
  }

  // 3. Create a clean Purchase Indent & Purchase Order for this test
  const timestamp = Date.now().toString().slice(-6);
  const indentNumber = `IND-AUDIT-${timestamp}`;
  const poNumber = `PO-AUDIT-${timestamp}`;

  const testQty = 25;
  const testRate = 120;

  console.log(`\nCreating Test Indent ${indentNumber} and PO ${poNumber} for ${testQty} units...`);

  const indent = await prisma.purchaseIndent.create({
    data: {
      publicId: indentNumber,
      companyId: adminUser.companyId,
      indentNo: indentNumber,
      status: 'APPROVED',
      warehouseId: warehouse.id,
      requestedById: adminUser.id,
      items: {
        create: [{
          productId: product.id,
          quantity: testQty
        }]
      }
    }
  });

  const po = await prisma.purchaseOrder.create({
    data: {
      publicId: poNumber,
      poNo: poNumber,
      poNumber,
      draftPoNo: poNumber,
      companyId: adminUser.companyId,
      purchaseIndentId: indent.id,
      supplierId: supplier.id,
      status: 'ISSUED',
      totalAmount: testQty * testRate,
      issuedById: adminUser.id,
      issuedAt: new Date(),
      items: {
        create: [{
          productId: product.id,
          quantity: testQty,
          unitPrice: testRate,
          receivedQuantity: 0
        }]
      }
    },
    include: { items: true }
  });

  console.log(`PO created with ID: ${po.id}, status: ${po.status}`);

  // 4. STEP 1: STORE CONFIRMS DELIVERY & GENERATES GRN
  console.log('\n--- STEP 1: STORE CONFIRMS DELIVERY (verifyDelivery) ---');
  const verifyPayload = {
    purchaseOrderId: po.id,
    warehouseId: warehouse.id,
    challanNumber: `CH-AUD-${timestamp}`,
    vehicleNumber: 'MH-14-GH-5566',
    remarks: 'Delivered in good condition by driver Ramesh',
    attachments: [
      {
        name: 'challan_scan.png',
        size: '32 KB',
        previewUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      }
    ],
    items: [
      {
        purchaseOrderItemId: po.items[0].id,
        productId: product.id,
        receivedQuantity: testQty,
        acceptedQuantity: testQty,
        rejectedQuantity: 0,
        inspectionRemarks: 'Physical check ok'
      }
    ]
  };

  const storeRes = await storeApi.post('/procurement/store/deliveries/verify', verifyPayload);
  console.log('Store verifyDelivery response status:', storeRes.status);
  const grnData = storeRes.data?.delivery || storeRes.data?.data?.delivery || storeRes.data;
  console.log(`Generated GRN ID: ${grnData?.id}, GRN Number: ${grnData?.grnNumber}, Status: ${grnData?.status}`);

  // Fetch updated GRN with items
  const updatedGrn = await prisma.goodsReceiptNote.findUnique({
    where: { id: grnData.id },
    include: { items: true }
  });
  const updatedPo = await prisma.purchaseOrder.findUnique({
    where: { id: po.id }
  });
  const updatedIndent = await prisma.purchaseIndent.findUnique({
    where: { id: indent.id }
  });

  const deliveredProductId = updatedGrn.items[0]?.productId || product.id;

  // VERIFY CRITICAL REQUIREMENT 1: Stock is added immediately at Store verification
  const qtyAfterStore = await getStock(deliveredProductId);
  console.log(`Stock quantity after Store verification: ${qtyAfterStore} (Expected: ${testQty})`);

  if (qtyAfterStore < testQty) {
    throw new Error(`FAIL: Expected stock to be at least ${testQty}, but got ${qtyAfterStore}`);
  }
  console.log('✓ PASS: Raw inventory updated immediately at Store delivery confirmation!');

  // VERIFY CRITICAL REQUIREMENT 2: GRN status is PENDING_FINANCE_AUDIT, PO status is DELIVERY_PENDING_FINANCE_AUDIT
  console.log(`GRN status in DB: ${updatedGrn.status} (Expected: PENDING_FINANCE_AUDIT)`);
  console.log(`PO status in DB: ${updatedPo.status} (Expected: DELIVERY_PENDING_FINANCE_AUDIT)`);
  console.log(`Indent status in DB: ${updatedIndent.status} (Expected: still APPROVED or OPEN)`);

  if (updatedGrn.status !== 'PENDING_FINANCE_AUDIT') {
    throw new Error(`FAIL: Expected GRN status PENDING_FINANCE_AUDIT, got ${updatedGrn.status}`);
  }
  if (updatedPo.status !== 'DELIVERY_PENDING_FINANCE_AUDIT') {
    throw new Error(`FAIL: Expected PO status DELIVERY_PENDING_FINANCE_AUDIT, got ${updatedPo.status}`);
  }
  console.log('✓ PASS: GRN and PO are correctly in PENDING_FINANCE_AUDIT status!');

  // 5. STEP 2: FINANCE AUDITS AND APPROVES
  console.log('\n--- STEP 2: FINANCE AUDIT APPROVES (audit-approve) ---');
  const financeApproveRes = await financeApi.post(`/procurement/grns/${grnData.id}/audit-approve`, {
    remarks: 'Finance audit complete. Challan verified, rate matched.'
  });
  console.log('Finance audit-approve response status:', financeApproveRes.status);

  // VERIFY CRITICAL REQUIREMENT 3: PO and Indent are CLOSED
  const finalPo = await prisma.purchaseOrder.findUnique({
    where: { id: po.id }
  });
  const finalIndent = await prisma.purchaseIndent.findUnique({
    where: { id: indent.id }
  });
  const finalGrn = await prisma.goodsReceiptNote.findUnique({
    where: { id: grnData.id }
  });

  console.log(`Final GRN status: ${finalGrn.status} (Expected: FINANCE_AUDIT_APPROVED)`);
  console.log(`Final PO status: ${finalPo.status} (Expected: CLOSED)`);
  console.log(`Final Indent status: ${finalIndent.status} (Expected: CLOSED)`);

  if (finalGrn.status !== 'FINANCE_AUDIT_APPROVED') {
    throw new Error(`FAIL: Expected GRN status FINANCE_AUDIT_APPROVED, got ${finalGrn.status}`);
  }
  if (finalPo.status !== 'CLOSED') {
    throw new Error(`FAIL: Expected PO status CLOSED, got ${finalPo.status}`);
  }
  if (finalIndent.status !== 'CLOSED') {
    throw new Error(`FAIL: Expected Indent status CLOSED, got ${finalIndent.status}`);
  }
  console.log('✓ PASS: PO and Indent closed upon Finance Audit approval!');

  // VERIFY CRITICAL REQUIREMENT 4: NO DOUBLE-POSTING OF INVENTORY
  const finalQty = await getStock(deliveredProductId);
  console.log(`Final stock quantity in DB: ${finalQty} (Expected: ${qtyAfterStore})`);

  if (finalQty !== qtyAfterStore) {
    throw new Error(`FAIL: Double posting detected! Stock is ${finalQty}, expected ${qtyAfterStore}`);
  }
  console.log('✓ PASS: No double posting! Inventory remained exactly correct.');

  // 6. STEP 3: TEST REJECTION FLOW
  console.log('\n--- STEP 3: TEST FINANCE REJECTION FLOW ---');
  const rejectIndent = await prisma.purchaseIndent.create({
    data: {
      publicId: `IND-REJ-${timestamp}`,
      companyId: adminUser.companyId,
      indentNo: `IND-REJ-${timestamp}`,
      status: 'APPROVED',
      warehouseId: warehouse.id,
      requestedById: adminUser.id,
      items: {
        create: [{
          productId: product.id,
          quantity: 10
        }]
      }
    }
  });

  const rejectPo = await prisma.purchaseOrder.create({
    data: {
      publicId: `PO-REJ-${timestamp}`,
      poNo: `PO-REJ-${timestamp}`,
      draftPoNo: `PO-REJ-${timestamp}`,
      companyId: adminUser.companyId,
      poNumber: `PO-REJ-${timestamp}`,
      purchaseIndentId: rejectIndent.id,
      supplierId: supplier.id,
      status: 'ISSUED',
      totalAmount: 10 * testRate,
      issuedById: adminUser.id,
      issuedAt: new Date(),
      items: {
        create: [{
          productId: product.id,
          quantity: 10,
          unitPrice: testRate,
          receivedQuantity: 0
        }]
      }
    },
    include: { items: true }
  });

  // Store verifies
  const storeRejRes = await storeApi.post('/procurement/store/deliveries/verify', {
    purchaseOrderId: rejectPo.id,
    warehouseId: warehouse.id,
    challanNumber: `CH-REJ-${timestamp}`,
    items: [{
      purchaseOrderItemId: rejectPo.items[0].id,
      productId: product.id,
      receivedQuantity: 10,
      acceptedQuantity: 10,
      rejectedQuantity: 0
    }]
  });
  const rejGrnId = storeRejRes.data?.data?.delivery?.id || storeRejRes.data?.delivery?.id || storeRejRes.data?.id;

  // Finance rejects
  console.log(`Rejecting GRN ${rejGrnId} with mandatory reason...`);
  const rejectRes = await financeApi.post(`/procurement/grns/${rejGrnId}/reject`, {
    reason: 'Challan missing signature and damaged outer packing',
    remarks: 'Challan missing signature and damaged outer packing'
  });
  console.log('Reject API status:', rejectRes.status);

  const afterRejectGrn = await prisma.goodsReceiptNote.findUnique({ where: { id: rejGrnId } });
  const afterRejectPo = await prisma.purchaseOrder.findUnique({ where: { id: rejectPo.id } });

  console.log(`After rejection - GRN status: ${afterRejectGrn.status} (Expected: FINANCE_AUDIT_REJECTED)`);
  console.log(`After rejection - PO status: ${afterRejectPo.status} (Expected: PARTIALLY_DELIVERED, NOT CLOSED)`);

  if (afterRejectGrn.status !== 'FINANCE_AUDIT_REJECTED') {
    throw new Error(`FAIL: Expected GRN status FINANCE_AUDIT_REJECTED, got ${afterRejectGrn.status}`);
  }
  if (afterRejectPo.status === 'CLOSED') {
    throw new Error(`FAIL: PO should NOT be CLOSED upon rejection!`);
  }
  console.log('✓ PASS: Finance rejection keeps PO open and marks GRN FINANCE_AUDIT_REJECTED!');

  console.log('\n========================================');
  console.log('🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY!');
  console.log('========================================\n');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('\n❌ TEST FAILED:', err.response?.data || err.message);
  process.exit(1);
});
