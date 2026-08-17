const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module');
const { PlantHeadService } = require('../dist/src/modules/plant-head/plant-head.service');
const { DispatchService } = require('../dist/src/modules/dispatch/dispatch.service');
const { ProductionService } = require('../dist/src/modules/production/production.service');
const { QcService } = require('../dist/src/modules/qc/qc.service');
const { WorkflowService } = require('../dist/src/modules/workflow/workflow.service');
const { PrismaService } = require('../dist/src/database/prisma.service');

async function runTests() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const plantHeadService = app.get(PlantHeadService);
  const dispatchService = app.get(DispatchService);
  const productionService = app.get(ProductionService);
  const qcService = app.get(QcService);
  const workflowService = app.get(WorkflowService);
  
  console.log('--- STARTING FULFILLMENT LIFECYCLE MATRIX TESTS ---');
  
  const dbCompany = await prisma.company.findFirst();
  const companyId = dbCompany ? dbCompany.id : 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
  const dbUser = await prisma.user.findFirst();
  const userId = dbUser ? dbUser.id : '771024a5-43f5-457b-b90e-eec27a019c65';
  
  const productSku = 'FRCSQRC24X24LD3';
  let product = await prisma.product.findFirst({ where: { sku: productSku } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        name: 'FRCSQRC24x24 LD3 Cover',
        sku: productSku,
        publicId: 'PRD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        category: 'FRC COVER',
        dispatchCategory: 'FRC COVER',
        unit: 'PCS',
        unitPrice: 1500,
        isActive: true,
        companyId,
      }
    });
  } else {
    product = await prisma.product.update({
      where: { id: product.id },
      data: { category: 'FRC COVER', dispatchCategory: 'FRC COVER', unit: 'PCS' }
    });
  }
  const productId = product.id;
  console.log(`Using product: ${product.name} [ID: ${productId}, Cat: ${product.category}, UOM: ${product.unit}]`);

  // Clean-up
  const existingItems = await prisma.salesOrderItem.findMany({ where: { productId } });
  const existingItemIds = existingItems.map(i => i.id);

  const existingWOs = await prisma.workOrder.findMany({
    where: { salesOrderItemId: { in: existingItemIds } }
  });
  const woIds = existingWOs.map(w => w.id);
  await prisma.qCInspection.deleteMany({
    where: { workOrderId: { in: woIds } }
  });

  await prisma.invoiceItem.deleteMany({
    where: { salesOrderItemId: { in: existingItemIds } }
  });
  await prisma.dispatchItem.deleteMany({
    where: { salesOrderItemId: { in: existingItemIds } }
  });
  await prisma.salesOrderAllocation.deleteMany({
    where: { salesOrderItemId: { in: existingItemIds } }
  });
  await prisma.finishedGoods.deleteMany({
    where: { productId }
  });
  await prisma.workOrder.deleteMany({
    where: { salesOrderItemId: { in: existingItemIds } }
  });
  await prisma.salesOrderItem.deleteMany({
    where: { productId }
  });
  // Clean-up Production Plans for test orders
  const testOrders = await prisma.salesOrder.findMany({
    where: { orderNumber: { in: ['SO-TEST-FULL-01', 'SO-TEST-PART-01'] } }
  });
  const testOrderIds = testOrders.map(o => o.id);
  await prisma.productionPlan.deleteMany({
    where: { salesOrderId: { in: testOrderIds } }
  });
  await prisma.dispatch.deleteMany({
    where: { salesOrderId: { in: testOrderIds } }
  });
  await prisma.salesOrderItem.deleteMany({
    where: { productId }
  });
  await prisma.salesOrder.deleteMany({
    where: { id: { in: testOrderIds } }
  });

  // Customer
  let customer = await prisma.customer.findFirst({ where: { companyId } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        companyName: 'Test Customer LLC',
        contactPerson: 'John Test',
        email: 'john@test.com',
        phone: '1234567890',
        companyId,
        createdById: userId,
      }
    });
  }

  // SENT_TO_PLANT workflow state
  const draftState = await prisma.workflowState.findFirst({
    where: { code: 'SENT_TO_PLANT' }
  });
  
  // ─── TEST 1: FULL STOCK SCENARIO (10 ordered / 100 available) ───
  console.log('\n--- TEST 1: FULL STOCK DIRECT DISPATCH ALLOCATION (SO-TEST-FULL-01) ---');
  const salesOrderFull = await prisma.salesOrder.create({
    data: {
      orderNumber: 'SO-TEST-FULL-01',
      customerId: customer.id,
      salesExecutiveId: userId,
      status: 'SENT_TO_PLANT',
      workflowStateId: draftState?.id || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91',
      subtotal: 15000,
      taxableAmount: 15000,
      taxAmount: 2700,
      totalAmount: 17700,
      createdById: userId,
      shippingAddress: 'Staging Delivery Dock A',
      items: {
        create: [
          {
            productId,
            orderedQuantity: 10,
            unit: 'PCS',
            unitPrice: 1500,
            taxableAmount: 15000,
            lineTotal: 15000,
            productNameSnapshot: product.name,
            productCodeSnapshot: product.sku,
          }
        ]
      }
    },
    include: { items: true }
  });
  const orderItemId = salesOrderFull.items[0].id;
  console.log(`Created SalesOrder SO-TEST-FULL-01 with 10 PCS ordered. Item ID: ${orderItemId}`);

  // Create mock ProductionPlan
  const prodPlan = await prisma.productionPlan.create({
    data: {
      salesOrderId: salesOrderFull.id,
      planNumber: 'PLAN-' + Math.floor(1000 + Math.random() * 9000),
      plannedStartDate: new Date(),
      plannedEndDate: new Date(),
      status: 'APPROVED',
    }
  });

  // Create mock WorkOrder
  const workOrder = await prisma.workOrder.create({
    data: {
      workOrderNumber: 'WO-TEST-FULL-01',
      productionPlanId: prodPlan.id,
      salesOrderItemId: orderItemId,
      quantity: 100,
      status: 'COMPLETED',
    }
  });

  // Create FinishedGoods linked to the WorkOrder
  const fgRecord = await prisma.finishedGoods.create({
    data: {
      productId,
      workOrderId: workOrder.id,
      quantity: 100,
      availableQuantity: 100,
      unit: 'PCS',
      status: 'AVAILABLE',
      receivedById: userId,
    }
  });
  console.log(`Created Initial FG Stock linked to WorkOrder: Total 100, Available 100`);

  console.log('Reserving 10 PCS via plantHeadService.directDispatch...');
  const reserveRes = await plantHeadService.directDispatch(
    salesOrderFull.id,
    [{ salesOrderItemId: orderItemId, productId, quantity: 10 }],
    companyId,
    userId
  );
  console.log('Result:', reserveRes);

  let fgAfterRes = await prisma.finishedGoods.findUnique({ where: { id: fgRecord.id } });
  console.log(`Assert Stock: Physical quantity = ${fgAfterRes.quantity} (Expected: 100)`);
  console.log(`Assert Stock: Available quantity = ${fgAfterRes.availableQuantity} (Expected: 90)`);
  if (Number(fgAfterRes.quantity) !== 100 || Number(fgAfterRes.availableQuantity) !== 90) {
    throw new Error('Stock assertion failed after reservation!');
  }

  const allocation = await prisma.salesOrderAllocation.findFirst({
    where: { salesOrderItemId: orderItemId, allocationType: 'FINISHED_GOODS_RESERVATION' }
  });
  console.log(`Assert Allocation: reservedQuantity = ${allocation.reservedQuantity} (Expected: 10)`);
  if (Number(allocation.reservedQuantity) !== 10) {
    throw new Error('Allocation reservedQuantity assertion failed!');
  }

  const histReserve = await prisma.stockHistory.findFirst({
    where: { salesOrderItemId: orderItemId, event: 'RESERVE' }
  });
  console.log(`Assert StockHistory: Event = ${histReserve?.event}, Qty = ${histReserve?.quantity} (Expected: RESERVE, 10)`);
  if (!histReserve || Number(histReserve.quantity) !== 10) {
    throw new Error('StockHistory RESERVE logging failed!');
  }

  // ─── TEST 2: DUPLICATE DIRECT DISPATCH CHECK ───
  console.log('\n--- TEST 2: DUPLICATE DIRECT DISPATCH PREVENTION ---');
  try {
    await plantHeadService.directDispatch(
      salesOrderFull.id,
      [{ salesOrderItemId: orderItemId, productId, quantity: 10 }],
      companyId,
      userId
    );
    throw new Error('Duplicate reservation succeeded, but should have failed!');
  } catch (err) {
    console.log('Duplicate reservation correctly rejected with error:', err.message);
  }

  // ─── TEST 3: CATEGORY FILTERING IN DISPATCH QUEUE ───
  console.log('\n--- TEST 3: CATEGORY FILTERING IN DISPATCH QUEUE ---');
  let executiveUser = await prisma.user.findFirst({ where: { dispatchCategory: 'FRC COVER' } });
  if (!executiveUser) {
    const dbUser = await prisma.user.findFirst();
    executiveUser = await prisma.user.create({
      data: {
        name: 'FRC Executive',
        email: 'frc.exec@factory.com',
        password: 'pwd',
        publicId: 'USR-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        dispatchCategory: 'FRC COVER',
        company: { connect: { id: companyId } },
        role: { connect: { id: dbUser.roleId } },
      }
    });
  }
  
  const queueFiltered = await dispatchService.getDispatchQueue(
    executiveUser.id,
    'DISPATCH_EXECUTIVE',
    companyId
  );
  console.log(`Dispatch Queue count for FRC COVER executive: ${queueFiltered.length} (Expected: 1)`);
  if (queueFiltered.length !== 1) {
    throw new Error('Dispatch queue filtering by category failed!');
  }

  // ─── TEST 4: CONSIGNMENT DISPATCH CREATION & DEDUCTIONS ───
  console.log('\n--- TEST 4: CONSIGNMENT DISPATCH CREATION & PHYSICAL DEDUCTION ---');
  const dispatchDto = {
    salesOrderId: salesOrderFull.id,
    vehicleNumber: 'DL-01-AB-1234',
    driverName: 'Harish Singh',
    driverMobile: '9988776655',
    items: [
      {
        salesOrderItemId: orderItemId,
        quantity: 10
      }
    ]
  };
  
  console.log('Creating dispatch consignment...');
  const dispatchRes = await dispatchService.createDispatch(dispatchDto, userId);
  console.log('Dispatch consignment created successfully:', dispatchRes.dispatchNo);

  let fgAfterDispatch = await prisma.finishedGoods.findUnique({ where: { id: fgRecord.id } });
  console.log(`Assert Stock: Physical quantity = ${fgAfterDispatch.quantity} (Expected: 90)`);
  console.log(`Assert Stock: Available quantity = ${fgAfterDispatch.availableQuantity} (Expected: 90)`);
  if (Number(fgAfterDispatch.quantity) !== 90 || Number(fgAfterDispatch.availableQuantity) !== 90) {
    throw new Error('Stock deduction assertion failed after dispatch!');
  }

  const allocAfterDispatch = await prisma.salesOrderAllocation.findUnique({
    where: { id: allocation.id }
  });
  console.log(`Assert Allocation: reservedQuantity = ${allocAfterDispatch?.reservedQuantity} (Expected: 0)`);
  if (Number(allocAfterDispatch?.reservedQuantity) !== 0) {
    throw new Error('Allocation reservedQuantity was not cleared!');
  }

  const histDispatch = await prisma.stockHistory.findFirst({
    where: { salesOrderItemId: orderItemId, event: 'DISPATCH_OUT' }
  });
  console.log(`Assert StockHistory: Event = ${histDispatch?.event}, Qty = ${histDispatch?.quantity} (Expected: DISPATCH_OUT, 10)`);
  if (!histDispatch || Number(histDispatch.quantity) !== 10) {
    throw new Error('StockHistory DISPATCH_OUT logging failed!');
  }

  // ─── TEST 5: DUPLICATE CREATE DISPATCH CHECK ───
  console.log('\n--- TEST 5: DUPLICATE CREATE DISPATCH PREVENTION ---');
  try {
    await dispatchService.createDispatch(dispatchDto, userId);
    throw new Error('Duplicate dispatch creation succeeded, but should have failed!');
  } catch (err) {
    console.log('Duplicate dispatch consignment correctly rejected with error:', err.message);
  }

  // ─── TEST 6: CONCURRENCY CONTROLS ───
  console.log('\n--- TEST 6: CONCURRENCY CONTROLS ON LAST STOCK ---');
  await prisma.finishedGoods.update({
    where: { id: fgRecord.id },
    data: { quantity: 15, availableQuantity: 5 }
  });
  console.log('Stock updated: availableQuantity = 5 PCS');

  const soItem1 = await prisma.salesOrderItem.create({
    data: {
      salesOrderId: salesOrderFull.id,
      productId,
      orderedQuantity: 5,
      unit: 'PCS',
      unitPrice: 1500,
      taxableAmount: 7500,
      lineTotal: 7500,
      productNameSnapshot: product.name,
      productCodeSnapshot: product.sku,
    }
  });

  const soItem2 = await prisma.salesOrderItem.create({
    data: {
      salesOrderId: salesOrderFull.id,
      productId,
      orderedQuantity: 5,
      unit: 'PCS',
      unitPrice: 1500,
      taxableAmount: 7500,
      lineTotal: 7500,
      productNameSnapshot: product.name,
      productCodeSnapshot: product.sku,
    }
  });

  console.log('Triggering Reservation 1 for 5 PCS...');
  const res1 = await plantHeadService.directDispatch(
    salesOrderFull.id,
    [{ salesOrderItemId: soItem1.id, productId, quantity: 5 }],
    companyId,
    userId
  );
  console.log('Reservation 1 succeeded:', res1.success);

  console.log('Triggering Reservation 2 for 5 PCS (should fail due to 0 available)...');
  try {
    await plantHeadService.directDispatch(
      salesOrderFull.id,
      [{ salesOrderItemId: soItem2.id, productId, quantity: 5 }],
      companyId,
      userId
    );
    throw new Error('Reservation 2 succeeded but should have failed!');
  } catch (err) {
    console.log('Reservation 2 correctly rejected due to concurrency/insufficient stock:', err.message);
  }

  // ─── TEST 7: PARTIAL STOCK SCENARIO (100 ordered / 20 FG / 80 Production shortage) ───
  console.log('\n--- TEST 7: PARTIAL STOCK SCENARIO (100 ordered / 20 FG / 80 Production shortage) ---');
  
  // Set FG stock available to exactly 20 PCS
  await prisma.finishedGoods.update({
    where: { id: fgRecord.id },
    data: { quantity: 20, availableQuantity: 20 }
  });
  console.log('Stock updated: quantity = 20, availableQuantity = 20 PCS');
  
  const salesOrderPart = await prisma.salesOrder.create({
    data: {
      orderNumber: 'SO-TEST-PART-01',
      customerId: customer.id,
      salesExecutiveId: userId,
      status: 'SENT_TO_PLANT',
      workflowStateId: draftState?.id || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91',
      subtotal: 150000,
      taxableAmount: 150000,
      taxAmount: 27000,
      totalAmount: 177000,
      createdById: userId,
      shippingAddress: 'Staging Delivery Dock B',
      items: {
        create: [
          {
            productId,
            orderedQuantity: 100,
            unit: 'PCS',
            unitPrice: 1500,
            taxableAmount: 150000,
            lineTotal: 150000,
            productNameSnapshot: product.name,
            productCodeSnapshot: product.sku,
          }
        ]
      }
    },
    include: { items: true }
  });
  const partItemId = salesOrderPart.items[0].id;
  console.log(`Created SalesOrder SO-TEST-PART-01. Item ID: ${partItemId}`);

  console.log('Reserving 20 available PCS via plantHeadService.directDispatch...');
  await plantHeadService.directDispatch(
    salesOrderPart.id,
    [{ salesOrderItemId: partItemId, productId, quantity: 20 }],
    companyId,
    userId
  );
  
  let fgAfterPartRes = await prisma.finishedGoods.findUnique({ where: { id: fgRecord.id } });
  console.log(`Assert Stock: Physical quantity = ${fgAfterPartRes.quantity} (Expected: 20)`);
  console.log(`Assert Stock: Available quantity = ${fgAfterPartRes.availableQuantity} (Expected: 0)`);
  if (Number(fgAfterPartRes.availableQuantity) !== 0) {
    throw new Error('Stock available quantity failed to decrement to 0!');
  }

  // Create mock production plan in SENT_TO_PLANT / APPROVED status
  const planInitialState = await workflowService.getInitialState('PRODUCTION_PLAN');
  const plan = await prisma.productionPlan.create({
    data: {
      salesOrderId: salesOrderPart.id,
      planNumber: 'PLAN-' + Math.floor(1000 + Math.random() * 9000),
      plannedStartDate: new Date(),
      plannedEndDate: new Date(),
      status: 'APPROVED',
      workflowStateId: planInitialState.id,
    }
  });

  console.log('Releasing production plan to trigger shortage work order creation...');
  await productionService.processAction(plan.id, 'RELEASE', 'Released for shortage', userId, 'PLANT_HEAD');

  const shortageWO = await prisma.workOrder.findFirst({
    where: { productionPlanId: plan.id, salesOrderItemId: partItemId }
  });
  console.log(`Assert WorkOrder: Qty = ${shortageWO?.quantity} (Expected: 80)`);
  if (!shortageWO || Number(shortageWO.quantity) !== 80) {
    throw new Error('Shortage WorkOrder was not created for the correct quantity of 80!');
  }

  const shortageAlloc = await prisma.salesOrderAllocation.findFirst({
    where: { salesOrderItemId: partItemId, allocationType: 'PRODUCTION_REQUIRED' }
  });
  console.log(`Assert Allocation: productionQuantity = ${shortageAlloc?.productionQuantity} (Expected: 80)`);
  if (!shortageAlloc || Number(shortageAlloc.productionQuantity) !== 80) {
    throw new Error('Shortage PRODUCTION_REQUIRED allocation was not created for 80!');
  }

  // ─── TEST 8: WORK ORDER QC APPROVAL & FINISHED GOODS RECEIPT ───
  console.log('\n--- TEST 8: WORK ORDER QC APPROVAL & FINISHED GOODS RECEIPT ---');
  
  const qcInitialState = await workflowService.getInitialState('QC_INSPECTION');
  const inspection = await prisma.qCInspection.create({
    data: {
      workOrderId: shortageWO.id,
      status: 'PENDING',
      version: 1,
      workflowStateId: qcInitialState.id,
    }
  });
  
  console.log('Approving QC inspection...');
  await qcService.processAction(inspection.id, 'APPROVE', 'QC Inspection Approved', userId, 'QC_INSPECTOR', { approvedQuantity: 80 });

  const fgPool = await prisma.finishedGoods.findMany({ where: { productId } });
  const totalPhysical = fgPool.reduce((sum, f) => sum + Number(f.quantity), 0);
  const totalAvailable = fgPool.reduce((sum, f) => sum + Number(f.availableQuantity), 0);
  console.log(`Assert Stock Pool: Total Physical = ${totalPhysical} (Expected: 100)`);
  console.log(`Assert Stock Pool: Total Available = ${totalAvailable} (Expected: 80)`);
  if (totalPhysical !== 100 || totalAvailable !== 80) {
    throw new Error('QC receipt failed to return the correct stock to the Finished Goods pool!');
  }

  const histQc = await prisma.stockHistory.findFirst({
    where: { salesOrderId: salesOrderPart.id, event: 'QC_RECEIPT' }
  });
  console.log(`Assert StockHistory: Event = ${histQc?.event}, Qty = ${histQc?.quantity} (Expected: QC_RECEIPT, 80)`);
  if (!histQc || Number(histQc.quantity) !== 80) {
    throw new Error('StockHistory QC_RECEIPT logging failed!');
  }

  console.log('\n--- ALL VERIFICATION MATRIX RUNTIME CHECKS PASSED SUCCESSFULLY! ---');
  await app.close();
}

runTests().catch(err => {
  console.error('\n❌ VERIFICATION TEST MATRIX FAILED:', err);
  process.exit(1);
});
