import { PrismaClient, Prisma } from '@prisma/client';
import { ProcurementService } from '../src/modules/procurement/procurement.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { SequenceService } from '../src/common/sequence/sequence.service';

const prisma = new PrismaClient();
const sequenceService = new SequenceService(prisma as any);
const procurementService = new ProcurementService(prisma as any, sequenceService);
const inventoryService = new InventoryService(prisma as any);

async function runAcceptanceTests() {
  console.log('====================================================');
  console.log('STARTING PO DELIVERY & RAW INVENTORY ACCEPTANCE TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const runId = Date.now().toString().slice(-6);

  try {
    // 0. Setup Test Data
    const testCompany = await prisma.company.upsert({
      where: { publicId: `COMP-ACCEPT-${runId}` },
      update: {},
      create: {
        publicId: `COMP-ACCEPT-${runId}`,
        name: `Acceptance Test Corp ${runId}`,
      },
    });
    const companyId = testCompany.id;

    // Create Supplier
    const supplier = await prisma.supplier.create({
      data: {
        publicId: `SUP-ACCEPT-${runId}`,
        companyId,
        name: 'Test Chemical Supplier Ltd',
      },
    });

    // Create Raw Material HM028
    const rawMat = await prisma.rawMaterial.create({
      data: {
        publicId: `RM-HM028-${runId}`,
        companyId,
        name: `Acetone (Solvent) ${runId}`,
        sku: `HM028-${runId}`,
        category: 'Raw Material',
        unit: 'PCS',
        minimumStock: 50,
      },
    });

    const product = await prisma.product.create({
      data: {
        publicId: `PRD-HM028-${runId}`,
        companyId,
        name: `Acetone (Solvent) ${runId}`,
        sku: `HM028-${runId}`,
        category: 'Raw Material',
        productType: 'RAW_MATERIAL',
        unit: 'PCS',
        unitPrice: new Prisma.Decimal(200),
        minimumStock: 50,
      },
    });

    // Create Initial Opening Stock = 200 PCS
    await inventoryService.createTransaction(companyId, {
      productId: product.id,
      quantity: 200,
      type: 'IN',
      referenceType: 'OPENING_STOCK',
      referenceId: 'INITIAL_BALANCE',
    });

    let stockLevels = await inventoryService.getStockLevels(companyId);
    let initialStock = stockLevels.find(s => s.productId === product.id || s.productId === rawMat.id)?.quantity || 0;
    assert(initialStock === 200, `Initial Stock for HM028 is 200 PCS (actual: ${initialStock})`);

    // Create Purchase Order for 100 PCS of HM028
    const po = await prisma.purchaseOrder.create({
      data: {
        publicId: `PO-ACCEPT-${runId}`,
        poNumber: `PO-ACCEPT-${runId}`,
        companyId,
        supplierId: supplier.id,
        status: 'ORDERED',
        totalAmount: new Prisma.Decimal(20000),
        items: {
          create: [
            {
              productId: product.id,
              materialCodeSnapshot: `HM028-${runId}`,
              materialNameSnapshot: `Acetone (Solvent) ${runId}`,
              quantity: new Prisma.Decimal(100),
              unitPrice: new Prisma.Decimal(200),
              lineTotal: new Prisma.Decimal(20000),
              receivedQuantity: new Prisma.Decimal(0),
              acceptedQuantity: new Prisma.Decimal(0),
            },
          ],
        },
      },
      include: { items: true },
    });

    console.log('\n--- TEST 1: Verify Partial Delivery Once (50 PCS) ---');
    const del1 = await procurementService.verifyDelivery(
      {
        purchaseOrderId: po.id,
        deliveryChallanNumber: `CH-ACCEPT-001-${runId}`,
        invoiceNumber: `INV-ACCEPT-001-${runId}`,
        items: [
          {
            productId: product.id,
            deliveredQuantity: 50,
            acceptedQuantity: 50,
            rejectedQuantity: 0,
          },
        ],
      },
      undefined,
      companyId,
    );

    stockLevels = await inventoryService.getStockLevels(companyId);
    let currentStock = stockLevels.find(s => s.productId === product.id || s.productId === rawMat.id)?.quantity || 0;
    assert(currentStock === 250, `Stock increased from 200 to 250 PCS (actual: ${currentStock})`);
    assert(del1.purchaseOrderStatus === 'PARTIALLY_DELIVERED', `PO status is PARTIALLY_DELIVERED (actual: ${del1.purchaseOrderStatus})`);

    const sh1 = await prisma.stockHistory.findFirst({
      where: { companyId, referenceNumber: po.poNumber },
      orderBy: { createdAt: 'desc' },
    });
    assert(
      Number(sh1?.beforeQuantity) === 200 && Number(sh1?.afterQuantity) === 250 && sh1?.event === 'STOCK_IN',
      `StockHistory logged correctly: Before=200, After=250, Event=STOCK_IN (actual: Before=${sh1?.beforeQuantity}, After=${sh1?.afterQuantity})`,
    );

    console.log('\n--- TEST 2: Duplicate Delivery Submission with Same Challan ---');
    let dupFailed = false;
    try {
      await procurementService.verifyDelivery(
        {
          purchaseOrderId: po.id,
          deliveryChallanNumber: `CH-ACCEPT-001-${runId}`,
          invoiceNumber: `INV-ACCEPT-001-${runId}`,
          items: [{ productId: product.id, deliveredQuantity: 50, acceptedQuantity: 50 }],
        },
        undefined,
        companyId,
      );
    } catch (err: any) {
      dupFailed = true;
    }
    assert(dupFailed, 'Duplicate delivery submission was blocked with an error');

    stockLevels = await inventoryService.getStockLevels(companyId);
    currentStock = stockLevels.find(s => s.productId === product.id || s.productId === rawMat.id)?.quantity || 0;
    assert(currentStock === 250, `Stock remains exactly 250 PCS without double-crediting (actual: ${currentStock})`);

    console.log('\n--- TEST 3: Delivery with Accepted Qty = 0 (100% Rejected) ---');
    await procurementService.verifyDelivery(
      {
        purchaseOrderId: po.id,
        deliveryChallanNumber: `CH-ACCEPT-002-${runId}`,
        invoiceNumber: `INV-ACCEPT-002-${runId}`,
        items: [
          {
            productId: product.id,
            deliveredQuantity: 10,
            acceptedQuantity: 0,
            rejectedQuantity: 10,
            remarks: 'Quality failed',
          },
        ],
      },
      undefined,
      companyId,
    );

    stockLevels = await inventoryService.getStockLevels(companyId);
    currentStock = stockLevels.find(s => s.productId === product.id || s.productId === rawMat.id)?.quantity || 0;
    assert(currentStock === 250, `Stock unchanged at 250 PCS when Accepted Qty = 0 (actual: ${currentStock})`);

    console.log('\n--- TEST 4: Second Partial Delivery (50 PCS) Completing Order ---');
    const del2 = await procurementService.verifyDelivery(
      {
        purchaseOrderId: po.id,
        deliveryChallanNumber: `CH-ACCEPT-003-${runId}`,
        invoiceNumber: `INV-ACCEPT-003-${runId}`,
        items: [
          {
            productId: product.id,
            deliveredQuantity: 50,
            acceptedQuantity: 50,
            rejectedQuantity: 0,
          },
        ],
      },
      undefined,
      companyId,
    );

    stockLevels = await inventoryService.getStockLevels(companyId);
    currentStock = stockLevels.find(s => s.productId === product.id || s.productId === rawMat.id)?.quantity || 0;
    assert(currentStock === 300, `Stock increased from 250 to 300 PCS (actual: ${currentStock})`);
    assert(del2.purchaseOrderStatus === 'FULLY_RECEIVED', `PO status transitioned to FULLY_RECEIVED (actual: ${del2.purchaseOrderStatus})`);

    const sh2 = await prisma.stockHistory.findFirst({
      where: { companyId, referenceNumber: po.poNumber },
      orderBy: { createdAt: 'desc' },
    });
    assert(
      Number(sh2?.beforeQuantity) === 250 && Number(sh2?.afterQuantity) === 300,
      `StockHistory logged correctly: Before=250, After=300 (actual: Before=${sh2?.beforeQuantity}, After=${sh2?.afterQuantity})`,
    );

    console.log('\n--- TEST 5: Attempt Delivery on Already Fulfilled PO ---');
    let overDeliveryBlocked = false;
    try {
      await procurementService.verifyDelivery(
        {
          purchaseOrderId: po.id,
          deliveryChallanNumber: `CH-ACCEPT-004-${runId}`,
          invoiceNumber: `INV-ACCEPT-004-${runId}`,
          items: [{ productId: product.id, deliveredQuantity: 10, acceptedQuantity: 10 }],
        },
        undefined,
        companyId,
      );
    } catch (e) {
      overDeliveryBlocked = true;
    }
    assert(overDeliveryBlocked, 'Delivery on fully fulfilled PO was correctly blocked');

    console.log('\n--- TEST 6: Simultaneous Concurrent Submissions for Same Challan ---');
    const poConc = await prisma.purchaseOrder.create({
      data: {
        publicId: `PO-ACCEPT-CONC-${runId}`,
        poNumber: `PO-ACCEPT-CONC-${runId}`,
        companyId,
        supplierId: supplier.id,
        status: 'ORDERED',
        totalAmount: new Prisma.Decimal(10000),
        items: {
          create: [
            {
              productId: product.id,
              materialCodeSnapshot: `HM028-${runId}`,
              materialNameSnapshot: `Acetone (Solvent) ${runId}`,
              quantity: new Prisma.Decimal(50),
              unitPrice: new Prisma.Decimal(200),
              lineTotal: new Prisma.Decimal(10000),
              receivedQuantity: new Prisma.Decimal(0),
              acceptedQuantity: new Prisma.Decimal(0),
            },
          ],
        },
      },
    });

    const concPayload = {
      purchaseOrderId: poConc.id,
      deliveryChallanNumber: `CH-CONC-${runId}`,
      invoiceNumber: `INV-CONC-${runId}`,
      items: [{ productId: product.id, deliveredQuantity: 25, acceptedQuantity: 25 }],
    };

    const concResults = await Promise.allSettled([
      procurementService.verifyDelivery(concPayload, undefined, companyId),
      procurementService.verifyDelivery(concPayload, undefined, companyId),
    ]);

    const fulfilledCount = concResults.filter(r => r.status === 'fulfilled').length;
    const rejectedCount = concResults.filter(r => r.status === 'rejected').length;
    assert(fulfilledCount === 1 && rejectedCount === 1, `Concurrency guard: exactly 1 succeeded and 1 was rejected (fulfilled=${fulfilledCount}, rejected=${rejectedCount})`);

    console.log('\n--- TEST 7: Ledger Invariant Validation ---');
    const allTxs = await prisma.inventoryTransaction.findMany({ where: { companyId } });
    let calculatedSum = 0;
    for (const t of allTxs) {
      if (t.type === 'IN') calculatedSum += Number(t.quantity);
      else if (t.type === 'OUT') calculatedSum -= Number(t.quantity);
    }
    stockLevels = await inventoryService.getStockLevels(companyId);
    currentStock = stockLevels.find(s => s.productId === product.id || s.productId === rawMat.id)?.quantity || 0;
    assert(calculatedSum === currentStock, `Ledger Invariant holds: SUM(IN) - SUM(OUT) (${calculatedSum}) === StockLevel (${currentStock})`);

    console.log('\n--- TEST 8: Separate Deliveries with Empty Challan & Invoice ---');
    const po2 = await prisma.purchaseOrder.create({
      data: {
        publicId: `PO-ACCEPT-002-${runId}`,
        poNumber: `PO-ACCEPT-002-${runId}`,
        companyId,
        supplierId: supplier.id,
        status: 'ORDERED',
        totalAmount: new Prisma.Decimal(10000),
        items: {
          create: [
            {
              productId: product.id,
              materialCodeSnapshot: `HM028-${runId}`,
              materialNameSnapshot: `Acetone (Solvent) ${runId}`,
              quantity: new Prisma.Decimal(50),
              unitPrice: new Prisma.Decimal(200),
              lineTotal: new Prisma.Decimal(10000),
              receivedQuantity: new Prisma.Decimal(0),
              acceptedQuantity: new Prisma.Decimal(0),
            },
          ],
        },
      },
    });

    // Delivery 1 with empty challan
    await procurementService.verifyDelivery(
      {
        purchaseOrderId: po2.id,
        deliveryChallanNumber: '',
        invoiceNumber: '',
        items: [{ productId: product.id, deliveredQuantity: 20, acceptedQuantity: 20 }],
      },
      undefined,
      companyId,
    );

    // Delivery 2 with empty challan (should NOT be blocked as duplicate of delivery 1)
    let secondEmptyBlocked = false;
    try {
      await procurementService.verifyDelivery(
        {
          purchaseOrderId: po2.id,
          deliveryChallanNumber: '',
          invoiceNumber: '',
          items: [{ productId: product.id, deliveredQuantity: 20, acceptedQuantity: 20 }],
        },
        undefined,
        companyId,
      );
    } catch (e) {
      secondEmptyBlocked = true;
    }
    assert(!secondEmptyBlocked, 'Multiple legitimate partial deliveries with empty challan are not falsely blocked');

    stockLevels = await inventoryService.getStockLevels(companyId);
    currentStock = stockLevels.find(s => s.productId === product.id || s.productId === rawMat.id)?.quantity || 0;
    assert(currentStock === 365, `Stock increased by 20 + 20 to 365 PCS (actual: ${currentStock})`);

    // Clean up test company
    await prisma.stockHistory.deleteMany({ where: { companyId } });
    await prisma.inventoryTransaction.deleteMany({ where: { companyId } });
    await prisma.goodsReceiptNoteItem.deleteMany({ where: { goodsReceiptNote: { companyId } } });
    await prisma.goodsReceiptNote.deleteMany({ where: { companyId } });
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrder: { companyId } } });
    await prisma.purchaseOrder.deleteMany({ where: { companyId } });
    await prisma.supplier.deleteMany({ where: { companyId } });
    await prisma.rawMaterial.deleteMany({ where: { companyId } });
    await prisma.product.deleteMany({ where: { companyId } });
    await prisma.warehouse.deleteMany({ where: { companyId } });
    await prisma.company.delete({ where: { id: companyId } });

  } catch (error) {
    console.error('Fatal error during acceptance tests:', error);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`ACCEPTANCE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests();
