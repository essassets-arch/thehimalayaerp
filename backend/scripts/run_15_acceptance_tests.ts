import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { ProductsService } from '../src/modules/products/products.service';
import { SalesService } from '../src/modules/sales/sales.service';
import { PlantHeadService } from '../src/modules/plant-head/plant-head.service';
import { DispatchService } from '../src/modules/dispatch/dispatch.service';
import { WorkOrdersService } from '../src/modules/work-orders/work-orders.service';
import {
  isTradingProduct,
  resolveProductRouting,
  isPureTradingOrder,
  normalizeDispatchCategory,
} from '../src/common/utils/trading-product.util';

interface TestResult {
  testNumber: number;
  description: string;
  passed: boolean;
  details: string;
  error?: string;
}

async function runAcceptanceTests() {
  console.log('================================================================');
  console.log('   STARTING 15-POINT ACCEPTANCE TEST SUITE');
  console.log('   Invariant: Product Master Classification is Authoritative');
  console.log('================================================================\n');

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();
  await app.init();

  const prisma = app.get(PrismaService);
  const productsService = app.get(ProductsService);
  const salesService = app.get(SalesService);
  const plantHeadService = app.get(PlantHeadService);
  const dispatchService = app.get(DispatchService);
  const workOrdersService = app.get(WorkOrdersService);

  const results: TestResult[] = [];

  // Helper to record result
  function record(num: number, desc: string, passed: boolean, details: string, err?: any) {
    results.push({
      testNumber: num,
      description: desc,
      passed,
      details,
      error: err ? (err.message || String(err)) : undefined,
    });
    const badge = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[Test ${num.toString().padStart(2, '0')}] ${badge} - ${desc}`);
    console.log(`         Details: ${details}`);
    if (err) console.error(`         Error: ${err.message || err}`);
  }

  // Pre-requisites: company, customer, user
  const company = await prisma.company.findFirst();
  if (!company) throw new Error('No company found in database');
  const companyId = company.id;

  let customer = await prisma.customer.findFirst({ where: { companyId } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        companyId,
        companyName: 'Test Acceptance Customer Corp',
        contactPerson: 'John Test',
        email: `test-${Date.now()}@acceptance.com`,
        phone: '9998887776',
      },
    });
  }

  let user = await prisma.user.findFirst({ where: { email: { contains: 'admin' } } });
  if (!user) user = await prisma.user.findFirst();
  const userId = user?.id || 'a6605e65-beca-40f2-a19f-8e451e270867';

  // Cleanup tracked records created during this run
  const createdProductIds: string[] = [];
  const createdOrderIds: string[] = [];

  try {
    // -------------------------------------------------------------
    // Test 1: Create D1 product containing "FRC" -> MUST remain D1
    // -------------------------------------------------------------
    let prod1: any = null;
    try {
      prod1 = await productsService.create(companyId, {
        name: 'HEAVY FRC DRAIN COVER 600',
        sku: `TST-FRC-${Date.now()}`,
        dispatchCategory: 'D1',
        category: 'FRC COVERS',
        unit: 'PCS',
        unitPrice: 1200,
      } as any);
      createdProductIds.push(prod1.id);

      const pass =
        prod1.dispatchCategory === 'D1' &&
        prod1.productType === 'MANUFACTURING' &&
        prod1.isTrading === false &&
        isTradingProduct(prod1) === false;

      record(
        1,
        'Create D1 product containing "FRC" -> MUST remain D1',
        pass,
        `dispatchCategory=${prod1.dispatchCategory}, productType=${prod1.productType}, isTrading=${prod1.isTrading}`,
      );
    } catch (err) {
      record(1, 'Create D1 product containing "FRC" -> MUST remain D1', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 2: Create D1 product containing "GRATING" -> MUST remain D1
    // -------------------------------------------------------------
    let prod2: any = null;
    try {
      prod2 = await productsService.create(companyId, {
        name: 'HEAVY DUTY GRATING PANEL 1000x500',
        sku: `TST-GRAT-${Date.now()}`,
        dispatchCategory: 'D1',
        category: 'GRATING',
        unit: 'PCS',
        unitPrice: 1800,
      } as any);
      createdProductIds.push(prod2.id);

      const pass =
        prod2.dispatchCategory === 'D1' &&
        prod2.productType === 'MANUFACTURING' &&
        prod2.isTrading === false &&
        isTradingProduct(prod2) === false;

      record(
        2,
        'Create D1 product containing "GRATING" -> MUST remain D1',
        pass,
        `dispatchCategory=${prod2.dispatchCategory}, productType=${prod2.productType}, isTrading=${prod2.isTrading}`,
      );
    } catch (err) {
      record(2, 'Create D1 product containing "GRATING" -> MUST remain D1', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 3: Create D1 product containing "MOULDED" -> MUST remain D1
    // -------------------------------------------------------------
    let prod3: any = null;
    try {
      prod3 = await productsService.create(companyId, {
        name: 'MOULDED BASE SUMP TANK 450',
        sku: `TST-MOULD-${Date.now()}`,
        dispatchCategory: 'D1',
        category: 'MOULDED',
        unit: 'PCS',
        unitPrice: 2200,
      } as any);
      createdProductIds.push(prod3.id);

      const pass =
        prod3.dispatchCategory === 'D1' &&
        prod3.productType === 'MANUFACTURING' &&
        prod3.isTrading === false &&
        isTradingProduct(prod3) === false;

      record(
        3,
        'Create D1 product containing "MOULDED" -> MUST remain D1',
        pass,
        `dispatchCategory=${prod3.dispatchCategory}, productType=${prod3.productType}, isTrading=${prod3.isTrading}`,
      );
    } catch (err) {
      record(3, 'Create D1 product containing "MOULDED" -> MUST remain D1', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 4: Create D2 product with arbitrary name -> MUST remain D2
    // -------------------------------------------------------------
    let prod4: any = null;
    try {
      prod4 = await productsService.create(companyId, {
        name: 'SPECIAL SOLAR INVERTER MOUNTING BRACKET',
        sku: `TST-SOLAR-${Date.now()}`,
        dispatchCategory: 'D2',
        category: 'ACCESSORIES',
        unit: 'PCS',
        unitPrice: 450,
      } as any);
      createdProductIds.push(prod4.id);

      const pass =
        prod4.dispatchCategory === 'D2' &&
        prod4.productType === 'TRADING' &&
        prod4.isTrading === true &&
        isTradingProduct(prod4) === true;

      record(
        4,
        'Create D2 product with arbitrary name -> MUST remain D2',
        pass,
        `dispatchCategory=${prod4.dispatchCategory}, productType=${prod4.productType}, isTrading=${prod4.isTrading}`,
      );
    } catch (err) {
      record(4, 'Create D2 product with arbitrary name -> MUST remain D2', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 5: Edit D1 product name/SKU/category -> MUST remain D1
    // -------------------------------------------------------------
    try {
      const updated1 = await productsService.update(companyId, prod1.id, {
        name: 'MODIFIED ULTRA FRC COVER SLAB',
        sku: `MOD-FRC-${Date.now()}`,
        category: 'FRC COVERS',
      } as any);

      const pass =
        updated1.dispatchCategory === 'D1' &&
        updated1.productType === 'MANUFACTURING' &&
        updated1.isTrading === false &&
        isTradingProduct(updated1) === false;

      record(
        5,
        'Edit D1 product name/SKU/category -> MUST remain D1',
        pass,
        `Name updated to "${updated1.name}". dispatchCategory=${updated1.dispatchCategory}, productType=${updated1.productType}, isTrading=${updated1.isTrading}`,
      );
    } catch (err) {
      record(5, 'Edit D1 product name/SKU/category -> MUST remain D1', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 6: Edit D2 product name/SKU/category -> MUST remain D2
    // -------------------------------------------------------------
    try {
      const updated4 = await productsService.update(companyId, prod4.id, {
        name: 'NEW SUPER MOULDED ACCESSORY',
        sku: `MOD-TRD-${Date.now()}`,
        category: 'HARDWARE ACCESSORY',
      } as any);

      const pass =
        updated4.dispatchCategory === 'D2' &&
        updated4.productType === 'TRADING' &&
        updated4.isTrading === true &&
        isTradingProduct(updated4) === true;

      record(
        6,
        'Edit D2 product name/SKU/category -> MUST remain D2',
        pass,
        `Name updated to "${updated4.name}". dispatchCategory=${updated4.dispatchCategory}, productType=${updated4.productType}, isTrading=${updated4.isTrading}`,
      );
    } catch (err) {
      record(6, 'Edit D2 product name/SKU/category -> MUST remain D2', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 7: Confirm Sales Order containing D2 -> NO Plant Head record
    // -------------------------------------------------------------
    let d2Order: any = null;
    try {
      const soDraft = await salesService.createOrder(
        {
          customerId: customer.id,
          orderDate: new Date().toISOString(),
          paymentTerms: 'Immediate',
          items: [
            {
              productId: prod4.id,
              orderedQuantity: 10,
              quantity: 10,
              unit: 'PCS',
              unitPrice: 450,
              taxRate: 18,
              discountAmount: 0,
            } as any,
          ],
        } as any,
        userId,
      );
      d2Order = soDraft;
      createdOrderIds.push(soDraft.id);

      // Transition with SEND_TO_PLANT
      await salesService.processAction(soDraft.id, { action: 'SEND_TO_PLANT' }, userId);

      // Check current state of this order
      const freshSo = await prisma.salesOrder.findUnique({
        where: { id: soDraft.id },
        include: { workflowState: true },
      });

      // Check Plant Head queue
      const incomingOrders = await plantHeadService.getIncomingOrders(companyId);
      const planningOrders = await plantHeadService.getPlanningOrders(companyId);
      const inIncoming = incomingOrders.some((o: any) => o.id === soDraft.id || o.orderNumber === soDraft.orderNumber);
      const inPlanning = planningOrders.some((o: any) => o.id === soDraft.id || o.orderNumber === soDraft.orderNumber);
      const inPlantHead = inIncoming || inPlanning;

      const pass = !inPlantHead && freshSo?.status === 'READY_FOR_DISPATCH';

      record(
        7,
        'Confirm Sales Order containing D2 -> NO Plant Head record',
        pass,
        `inPlantHeadQueue=${inPlantHead}, orderStatus=${freshSo?.status}, workflowState=${freshSo?.workflowState?.code}`,
      );
    } catch (err) {
      record(7, 'Confirm Sales Order containing D2 -> NO Plant Head record', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 8: D2 order -> Dispatch 2 queue
    // -------------------------------------------------------------
    try {
      const d2Queue = await dispatchService.getDispatchQueue(userId, 'DISPATCH_2', companyId, 'D2');
      const inD2Queue = d2Queue.some(
        (entry: any) =>
          entry.salesOrderId === d2Order?.id ||
          entry.orderNo === d2Order?.orderNumber ||
          entry.orderId === d2Order?.orderNumber,
      );

      const d1Queue = await dispatchService.getDispatchQueue(userId, 'DISPATCH_1', companyId, 'D1');
      const inD1Queue = d1Queue.some(
        (entry: any) =>
          entry.salesOrderId === d2Order?.id ||
          entry.orderNo === d2Order?.orderNumber ||
          entry.orderId === d2Order?.orderNumber,
      );

      const pass = inD2Queue && !inD1Queue;
      record(
        8,
        'D2 order -> Dispatch 2 queue',
        pass,
        `inD2Queue=${inD2Queue}, inD1Queue=${inD1Queue}`,
      );
    } catch (err) {
      record(8, 'D2 order -> Dispatch 2 queue', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 9: D2 order -> Dispatch 1 API must reject it
    // -------------------------------------------------------------
    try {
      const freshD2Order = await prisma.salesOrder.findUnique({
        where: { id: d2Order.id },
        include: { items: true },
      });
      const d2ItemId = freshD2Order!.items[0].id;

      let rejected = false;
      let rejectMessage = '';
      try {
        await dispatchService.createDispatch(
          {
            salesOrderId: d2Order.id,
            dispatchCategory: 'D1',
            deliveryAddress: 'Industrial Area Sahad',
            vehicleNumber: 'UK-07-CB-9999',
            items: [{ salesOrderItemId: d2ItemId, quantity: 5 }],
          } as any,
          userId,
        );
      } catch (e: any) {
        if (e instanceof BadRequestException || e.message?.includes('cannot dispatch Trading')) {
          rejected = true;
          rejectMessage = e.message;
        } else {
          throw e;
        }
      }

      record(
        9,
        'D2 order -> Dispatch 1 API must reject it',
        rejected,
        `Rejected=${rejected}, ServerMessage="${rejectMessage}"`,
      );
    } catch (err) {
      record(9, 'D2 order -> Dispatch 1 API must reject it', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 10: D1 order -> Dispatch 2 API must reject it
    // -------------------------------------------------------------
    let d1Order: any = null;
    try {
      const soD1 = await salesService.createOrder(
        {
          customerId: customer.id,
          orderDate: new Date().toISOString(),
          paymentTerms: 'Immediate',
          items: [
            {
              productId: prod1.id,
              orderedQuantity: 5,
              quantity: 5,
              unit: 'PCS',
              unitPrice: 1200,
              taxRate: 18,
              discountAmount: 0,
            } as any,
          ],
        } as any,
        userId,
      );
      d1Order = soD1;
      createdOrderIds.push(soD1.id);

      const freshD1Order = await prisma.salesOrder.findUnique({
        where: { id: soD1.id },
        include: { items: true },
      });
      const d1ItemId = freshD1Order!.items[0].id;

      let rejected = false;
      let rejectMessage = '';
      try {
        await dispatchService.createDispatch(
          {
            salesOrderId: soD1.id,
            dispatchCategory: 'D2',
            deliveryAddress: 'Factory Site Dehradun',
            vehicleNumber: 'UK-07-CB-8888',
            items: [{ salesOrderItemId: d1ItemId, quantity: 2 }],
          } as any,
          userId,
        );
      } catch (e: any) {
        if (e instanceof BadRequestException || e.message?.includes('cannot dispatch Manufacturing')) {
          rejected = true;
          rejectMessage = e.message;
        } else {
          throw e;
        }
      }

      record(
        10,
        'D1 order -> Dispatch 2 API must reject it',
        rejected,
        `Rejected=${rejected}, ServerMessage="${rejectMessage}"`,
      );
    } catch (err) {
      record(10, 'D1 order -> Dispatch 2 API must reject it', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 11: Attempt direct Plant Head submission of D2 -> server must reject
    // -------------------------------------------------------------
    try {
      const freshD2Order = await prisma.salesOrder.findUnique({
        where: { id: d2Order.id },
        include: { items: true },
      });
      const d2ItemId = freshD2Order!.items[0].id;

      let rejected = false;
      let rejectMessage = '';
      try {
        await plantHeadService.submitFulfillmentPlan(
          d2Order.id,
          {
            items: [
              {
                salesOrderItemId: d2ItemId,
                productionQty: 5,
                directDispatchQty: 0,
              } as any,
            ],
          } as any,
          companyId,
          userId,
        );
      } catch (e: any) {
        if (e instanceof BadRequestException || e.message?.includes('Trading / Dispatch 2 order')) {
          rejected = true;
          rejectMessage = e.message;
        } else {
          throw e;
        }
      }

      record(
        11,
        'Attempt direct Plant Head submission of D2 -> server must reject',
        rejected,
        `Rejected=${rejected}, ServerMessage="${rejectMessage}"`,
      );
    } catch (err) {
      record(11, 'Attempt direct Plant Head submission of D2 -> server must reject', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 12: Attempt work-order creation for D2 -> server must reject
    // -------------------------------------------------------------
    try {
      // Create mixed order with 1 D1 item and 1 D2 item
      const mixedOrder = await salesService.createOrder(
        {
          customerId: customer.id,
          orderDate: new Date().toISOString(),
          paymentTerms: 'Immediate',
          items: [
            { productId: prod1.id, orderedQuantity: 2, quantity: 2, unit: 'PCS', unitPrice: 1200, taxRate: 18, discountAmount: 0 } as any,
            { productId: prod4.id, orderedQuantity: 3, quantity: 3, unit: 'PCS', unitPrice: 450, taxRate: 18, discountAmount: 0 } as any,
          ],
        } as any,
        userId,
      );
      createdOrderIds.push(mixedOrder.id);

      const freshMixed = await prisma.salesOrder.findUnique({
        where: { id: mixedOrder.id },
        include: { items: { include: { product: true } } },
      });
      const d2Item = freshMixed!.items.find((i) => i.productId === prod4.id)!;

      let rejected = false;
      let rejectMessage = '';
      try {
        await plantHeadService.submitFulfillmentPlan(
          mixedOrder.id,
          {
            items: [
              {
                salesOrderItemId: d2Item.id,
                productionQty: 2,
              } as any,
            ],
          } as any,
          companyId,
          userId,
        );
      } catch (e: any) {
        if (e instanceof BadRequestException || e.message?.includes('Trading / Dispatch 2 product')) {
          rejected = true;
          rejectMessage = e.message;
        } else {
          throw e;
        }
      }

      // Also verify workOrdersService list excludes any trading work orders
      const allWos = await workOrdersService.listWorkOrders();
      const hasAnyTradingWo = allWos.some((w: any) => isTradingProduct(w.salesOrderItem?.product || w.FinishedGoods?.product));

      const pass = rejected && !hasAnyTradingWo;
      record(
        12,
        'Attempt work-order creation for D2 -> server must reject',
        pass,
        `Rejected=${rejected}, hasAnyTradingWo=${hasAnyTradingWo}, ServerMessage="${rejectMessage}"`,
      );
    } catch (err) {
      record(12, 'Attempt work-order creation for D2 -> server must reject', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 13: Restart backend -> routing unchanged
    // -------------------------------------------------------------
    try {
      // Simulate fresh load by querying DB directly via Prisma
      const freshP1 = await prisma.product.findUnique({ where: { id: prod1.id } });
      const freshP2 = await prisma.product.findUnique({ where: { id: prod2.id } });
      const freshP3 = await prisma.product.findUnique({ where: { id: prod3.id } });
      const freshP4 = await prisma.product.findUnique({ where: { id: prod4.id } });

      const r1 = resolveProductRouting(freshP1);
      const r2 = resolveProductRouting(freshP2);
      const r3 = resolveProductRouting(freshP3);
      const r4 = resolveProductRouting(freshP4);

      const pass =
        r1.dispatchCategory === 'D1' && !r1.isTrading &&
        r2.dispatchCategory === 'D1' && !r2.isTrading &&
        r3.dispatchCategory === 'D1' && !r3.isTrading &&
        r4.dispatchCategory === 'D2' && r4.isTrading;

      record(
        13,
        'Restart backend -> routing unchanged',
        pass,
        `Direct DB re-resolution: P1(D1)=${r1.dispatchCategory}, P2(D1)=${r2.dispatchCategory}, P3(D1)=${r3.dispatchCategory}, P4(D2)=${r4.dispatchCategory}`,
      );
    } catch (err) {
      record(13, 'Restart backend -> routing unchanged', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 14: Refresh Product Master -> routing unchanged
    // -------------------------------------------------------------
    try {
      const allProds: any[] = (await productsService.findAll(companyId)) as any[];
      const item1: any = allProds.find((p: any) => p.id === prod1.id);
      const item2: any = allProds.find((p: any) => p.id === prod2.id);
      const item3: any = allProds.find((p: any) => p.id === prod3.id);
      const item4: any = allProds.find((p: any) => p.id === prod4.id);

      // Simulate ProductMasterUI normalization
      const uiRow1 = {
        cat: item1?.dispatchCategory || (isTradingProduct(item1) ? 'D2' : 'D1'),
        isTrading: item1?.isTrading,
      };
      const uiRow2 = {
        cat: item2?.dispatchCategory || (isTradingProduct(item2) ? 'D2' : 'D1'),
        isTrading: item2?.isTrading,
      };
      const uiRow3 = {
        cat: item3?.dispatchCategory || (isTradingProduct(item3) ? 'D2' : 'D1'),
        isTrading: item3?.isTrading,
      };
      const uiRow4 = {
        cat: item4?.dispatchCategory || (isTradingProduct(item4) ? 'D2' : 'D1'),
        isTrading: item4?.isTrading,
      };

      const pass =
        uiRow1.cat === 'D1' && !uiRow1.isTrading &&
        uiRow2.cat === 'D1' && !uiRow2.isTrading &&
        uiRow3.cat === 'D1' && !uiRow3.isTrading &&
        uiRow4.cat === 'D2' && uiRow4.isTrading;

      record(
        14,
        'Refresh Product Master -> routing unchanged',
        pass,
        `UI table rows: P1=${uiRow1.cat}, P2=${uiRow2.cat}, P3=${uiRow3.cat}, P4=${uiRow4.cat}`,
      );
    } catch (err) {
      record(14, 'Refresh Product Master -> routing unchanged', false, 'Exception thrown', err);
    }

    // -------------------------------------------------------------
    // Test 15: Save/edit unrelated product fields -> routing unchanged
    // -------------------------------------------------------------
    try {
      const p1Edited = await productsService.update(companyId, prod1.id, {
        unitPrice: 2850,
        weight: 52.5,
      } as any);

      const p4Edited = await productsService.update(companyId, prod4.id, {
        unitPrice: 420,
        description: 'New updated description for trading bracket',
      } as any);

      const pass =
        p1Edited.dispatchCategory === 'D1' &&
        p1Edited.productType === 'MANUFACTURING' &&
        p1Edited.isTrading === false &&
        p4Edited.dispatchCategory === 'D2' &&
        p4Edited.productType === 'TRADING' &&
        p4Edited.isTrading === true;

      record(
        15,
        'Save/edit unrelated product fields -> routing unchanged',
        pass,
        `P1 after price/weight edit: dispatchCategory=${p1Edited.dispatchCategory}, isTrading=${p1Edited.isTrading}. P4 after price/desc edit: dispatchCategory=${p4Edited.dispatchCategory}, isTrading=${p4Edited.isTrading}`,
      );
    } catch (err) {
      record(15, 'Save/edit unrelated product fields -> routing unchanged', false, 'Exception thrown', err);
    }

  } finally {
    // Cleanup created test records
    console.log('\n--- Cleaning up test records ---');
    try {
      for (const oId of createdOrderIds) {
        const dispatches = await prisma.dispatch.findMany({ where: { salesOrderId: oId }, select: { id: true } });
        const dIds = dispatches.map((d: any) => d.id);
        if (dIds.length > 0) {
          await prisma.dispatchItem.deleteMany({ where: { dispatchId: { in: dIds } } });
          await prisma.dispatch.deleteMany({ where: { id: { in: dIds } } });
        }
        await prisma.dispatchItem.deleteMany({ where: { salesOrderItem: { salesOrderId: oId } } });
        await prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: oId } });
        await prisma.workOrder.deleteMany({ where: { productionPlan: { salesOrderId: oId } } });
        await prisma.productionPlan.deleteMany({ where: { salesOrderId: oId } });
        await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: oId } });
        await prisma.salesOrder.deleteMany({ where: { id: oId } });
      }
      for (const pId of createdProductIds) {
        await prisma.finishedGoods.deleteMany({ where: { productId: pId } });
        await prisma.product.deleteMany({ where: { id: pId } });
      }
      console.log('Cleaned up test sales orders and products.');
    } catch (cleanErr: any) {
      console.warn('Cleanup warning:', cleanErr.message);
    }

    await app.close();
  }

  console.log('\n================================================================');
  console.log('                 FINAL ACCEPTANCE TEST REPORT');
  console.log('================================================================');
  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Passed: ${passedCount} / ${results.length}`);
  console.log(`Status: ${allPassed ? 'ALL 15 TESTS PASSED SUCCESFULLY! 🎉' : 'FAILURES DETECTED'}\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

runAcceptanceTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
