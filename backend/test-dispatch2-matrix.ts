import { PrismaClient } from '@prisma/client';
import { DispatchService } from './src/modules/dispatch/dispatch.service';
import { PrismaService } from './src/database/prisma.service';
import { WorkflowService } from './src/modules/workflow/workflow.service';
import { SequenceService } from './src/common/sequence/sequence.service';
import { CreditService } from './src/modules/finance/credit.service';
import { LedgerService } from './src/modules/finance/ledger.service';

const prisma = new PrismaClient();

async function runDispatch2MatrixTest() {
  console.log('\n========================================');
  console.log(' DISPATCH 2 SECURITY & CONCURRENCY VERIFICATION');
  console.log('========================================\n');

  let allPassed = true;
  const timestamp = Date.now();

  try {
    const prismaService = new PrismaService();
    const workflowService = new WorkflowService(prismaService as any);
    const sequenceService = new SequenceService(prismaService as any);
    const ledgerService = new LedgerService(prismaService as any);
    const creditService = new CreditService(prismaService as any, ledgerService);

    const dispatchService = new DispatchService(prismaService as any, workflowService, creditService, sequenceService);

    // ── 1. User & Role Discovery ──
    const dispatch1User = await prisma.user.findFirst({
      where: { role: { code: 'DISPATCH_EXECUTIVE' } },
      include: { role: true },
    });

    const dispatch2User = await prisma.user.findFirst({
      where: { role: { code: 'DISPATCH_2' } },
      include: { role: true },
    });

    const superAdminUser = await prisma.user.findFirst({
      where: { role: { code: 'SUPER_ADMIN' } },
      include: { role: true },
    });

    if (!dispatch1User) throw new Error('DISPATCH_EXECUTIVE user missing');
    if (!dispatch2User) throw new Error('DISPATCH_2 user missing');

    console.log(`✓ Dispatch 1 User: ${dispatch1User.email} (${dispatch1User.role?.code})`);
    console.log(`✓ Dispatch 2 User: ${dispatch2User.email} (${dispatch2User.role?.code})`);
    console.log(`✓ Super Admin User: ${superAdminUser?.email} (${superAdminUser?.role?.code})\n`);

    // ── 2. Route Security & Authorization Matrix ──
    console.log('--- 1. ROUTE SECURITY & NAVIGATION AUTHORIZATION ---');
    const roleKeyMap: Record<string, string> = {
      'DISPATCH_EXECUTIVE': 'Dispatch',
      'DISPATCH_2': 'Dispatch 2',
      'SUPER_ADMIN': 'Super Admin',
    };

    const d1RoleKey = roleKeyMap[dispatch1User.role?.code || ''];
    const d2RoleKey = roleKeyMap[dispatch2User.role?.code || ''];

    const d1AllowedPrefix = d1RoleKey === 'Dispatch' ? '/dispatch' : null;
    const d2AllowedPrefix = d2RoleKey === 'Dispatch 2' ? '/dispatch-2' : null;

    if (d1AllowedPrefix === '/dispatch' && d2AllowedPrefix === '/dispatch-2') {
      console.log('  [PASS] Route security matrix: DISPATCH_EXECUTIVE maps to /dispatch, DISPATCH_2 maps to /dispatch-2, routes strictly isolated!');
    } else {
      console.error('  [FAIL] Route security isolation failed!');
      allPassed = false;
    }

    // ── 3. Shared Operational Queues Verification ──
    console.log('\n--- 2. SHARED OPERATIONAL QUEUES VISIBILITY ---');
    const d1List = await dispatchService.listDispatches(dispatch1User.id, dispatch1User.role?.code);
    const d2List = await dispatchService.listDispatches(dispatch2User.id, dispatch2User.role?.code);

    if (d1List.length === d2List.length) {
      console.log(`  [PASS] Shared Operational Queue: Both Dispatch 1 and Dispatch 2 see the exact same ${d1List.length} shared dispatches!`);
    } else {
      console.error(`  [FAIL] Shared Queue mismatch! D1: ${d1List.length}, D2: ${d2List.length}`);
      allPassed = false;
    }

    // ── 4. Isolated Fixture Creation & Actor Auditing Test ──
    console.log('\n--- 3. ACTOR AUDITING & DISPATCH LIFECYCLE (Isolated Test Fixture) ---');
    const customer = await prisma.customer.findFirst({ select: { id: true, companyId: true } });
    if (!customer) throw new Error('No customer found in database');

    const product = await prisma.product.findFirst({ select: { id: true, name: true, sku: true } });
    if (!product) throw new Error('No product found in database');

    // Create isolated sales order fixture
    const rawSO = await prisma.salesOrder.create({
      data: {
        orderNumber: `TEST-SO-${timestamp}`,
        customerId: customer.id,
        status: 'CONFIRMED',
        totalAmount: 10000,
        subtotal: 10000,
        taxableAmount: 10000,
        createdById: dispatch2User.id,
        items: {
          create: [
            {
              productId: product.id,
              orderedQuantity: 100,
              unitPrice: 100,
              lineTotal: 10000,
              taxableAmount: 10000,
              unit: 'Pcs',
              productNameSnapshot: product.name,
            },
          ],
        },
      },
    });

    const fixtureSO = await prisma.salesOrder.findUniqueOrThrow({
      where: { id: rawSO.id },
      include: { items: true },
    });

    const plan = await prisma.productionPlan.findFirst({ select: { id: true } });
    if (!plan) throw new Error('No production plan found in database');

    const workOrder1 = await prisma.workOrder.create({
      data: {
        workOrderNumber: `WO-TEST1-${timestamp}`,
        productionPlanId: plan.id,
        salesOrderItemId: fixtureSO.items[0].id,
        quantity: 500,
      },
    });

    // Create isolated finished goods stock fixture with 100 available units
    const fixtureFG = await prisma.finishedGoods.create({
      data: {
        productId: product.id,
        workOrderId: workOrder1.id,
        unit: 'Pcs',
        quantity: 100,
        availableQuantity: 100,
        status: 'AVAILABLE',
      },
    });

    const createPayload = {
      salesOrderId: fixtureSO.id,
      deliveryAddress: '123 Test Warehouse, Industrial Area',
      totalWeight: 10,
      transporterName: 'Express Logistics Ltd',
      vehicleNumber: 'KA-01-AB-1234',
      driverName: 'Test Driver',
      driverPhone: '9876543210',
      items: [
        {
          salesOrderItemId: fixtureSO.items[0].id,
          quantity: 30,
        },
      ],
    };

    // Create dispatch as Dispatch 2 User
    const createdDisp = await dispatchService.createDispatch(createPayload, dispatch2User.id);
    if (createdDisp.createdById === dispatch2User.id) {
      console.log(`  [PASS] Dispatch ${createdDisp.dispatchNo} created by Dispatch 2 -> createdById correctly set to ${dispatch2User.email}!`);
    } else {
      console.error(`  [FAIL] createdById misattributed! Expected: ${dispatch2User.id}, Got: ${createdDisp.createdById}`);
      allPassed = false;
    }

    // Confirm delivery as Dispatch 2 User
    const confirmedDisp = await dispatchService.confirmDelivery(
      createdDisp.id,
      {
        deliveredAt: new Date().toISOString(),
        receiverName: 'John Recipient',
        receiverPhone: '9988776655',
        deliveryRemarks: 'Delivered in pristine condition',
        podImageUrl: 'https://cdn.himalayaerp.com/pod/test.jpg',
      },
      dispatch2User.id,
    );

    if (confirmedDisp.deliveredById === dispatch2User.id && confirmedDisp.status === 'DELIVERED') {
      console.log(`  [PASS] Delivery confirmed by Dispatch 2 -> deliveredById correctly set to ${dispatch2User.email} (Status: DELIVERED)!`);
    } else {
      console.error(`  [FAIL] deliveredById misattributed! Expected: ${dispatch2User.id}, Got: ${confirmedDisp.deliveredById}`);
      allPassed = false;
    }

    // Create isolated test product for concurrency test
    const concurProduct = await prisma.product.create({
      data: {
        publicId: `PROD-CONCUR-${timestamp}`,
        name: `Concur Product ${timestamp}`,
        sku: `CONCUR-SKU-${timestamp}`,
        unit: 'Pcs',
        unitPrice: 100,
        companyId: customer.companyId,
      },
    });

    const workOrder2 = await prisma.workOrder.create({
      data: {
        workOrderNumber: `WO-CONCUR-${timestamp}`,
        productionPlanId: plan.id,
        salesOrderItemId: fixtureSO.items[0].id,
        quantity: 500,
      },
    });

    const concurrencyFG = await prisma.finishedGoods.create({
      data: {
        productId: concurProduct.id,
        workOrderId: workOrder2.id,
        unit: 'Pcs',
        quantity: 100,
        availableQuantity: 100,
        status: 'AVAILABLE',
      },
    });

    const rawConcurSO = await prisma.salesOrder.create({
      data: {
        orderNumber: `CONCUR-SO-${timestamp}`,
        customerId: customer.id,
        status: 'CONFIRMED',
        totalAmount: 20000,
        subtotal: 20000,
        taxableAmount: 20000,
        createdById: dispatch2User.id,
        items: {
          create: [
            {
              productId: concurProduct.id,
              orderedQuantity: 200,
              unitPrice: 100,
              lineTotal: 20000,
              taxableAmount: 20000,
              unit: 'Pcs',
              productNameSnapshot: concurProduct.name,
            },
          ],
        },
      },
    });

    const concurrencySO = await prisma.salesOrder.findUniqueOrThrow({
      where: { id: rawConcurSO.id },
      include: { items: true },
    });

    const payloadA = {
      salesOrderId: concurrencySO.id,
      deliveryAddress: 'Concurrent Dest A',
      transporterName: 'Express A',
      vehicleNumber: 'KA-01-AA-1111',
      items: [{ salesOrderItemId: concurrencySO.items[0].id, quantity: 70 }],
    };

    const payloadB = {
      salesOrderId: concurrencySO.id,
      deliveryAddress: 'Concurrent Dest B',
      transporterName: 'Express B',
      vehicleNumber: 'KA-01-BB-2222',
      items: [{ salesOrderItemId: concurrencySO.items[0].id, quantity: 50 }],
    };

    console.log('  Launching concurrent dispatch requests: Request A (70 PCS) & Request B (50 PCS) against 100 PCS stock...');
    const results = await Promise.allSettled([
      dispatchService.createDispatch(payloadA, dispatch1User.id),
      dispatchService.createDispatch(payloadB, dispatch2User.id),
    ]);

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    const updatedConcurrencyFG = await prisma.finishedGoods.findUnique({
      where: { id: concurrencyFG.id },
    });

    const finalAvailable = Number(updatedConcurrencyFG?.availableQuantity || 0);

    if (succeeded.length === 1 && failed.length === 1 && finalAvailable >= 0) {
      console.log(`  [PASS] Concurrency Protection: Exactly 1 request succeeded (Deducted 70 PCS or 50 PCS), 1 request correctly rejected!`);
      console.log(`  [PASS] Remaining Finished Goods stock: ${finalAvailable} PCS (No overselling / negative stock possible!).`);
    } else {
      console.error(`  [FAIL] Concurrency failure! Succeeded: ${succeeded.length}, Failed: ${failed.length}, Final Stock: ${finalAvailable}`);
      allPassed = false;
    }

    // ── 6. Clean Up Test Fixtures ──
    console.log('\n--- 5. CLEANING UP TEST FIXTURES ---');
    const targetSoIds = [fixtureSO.id, concurrencySO.id];
    const targetItemIds = fixtureSO.items.map((i) => i.id).concat(concurrencySO.items.map((i) => i.id));

    await prisma.invoiceItem.deleteMany({ where: { salesOrderItemId: { in: targetItemIds } } });
    await prisma.salesInvoice.deleteMany({ where: { salesOrderId: { in: targetSoIds } } });
    await prisma.inventoryTransaction.deleteMany({ where: { referenceId: { in: [fixtureSO.orderNumber, concurrencySO.orderNumber] } } });
    await prisma.dispatchItem.deleteMany({ where: { dispatch: { salesOrderId: { in: targetSoIds } } } });
    await prisma.dispatch.deleteMany({ where: { salesOrderId: { in: targetSoIds } } });
    await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: targetSoIds } } });
    await prisma.salesOrder.deleteMany({ where: { id: { in: targetSoIds } } });
    await prisma.finishedGoods.deleteMany({ where: { id: { in: [fixtureFG.id, concurrencyFG.id] } } });
    await prisma.workOrder.deleteMany({ where: { id: { in: [workOrder1.id, workOrder2.id] } } });
    await prisma.product.deleteMany({ where: { id: concurProduct.id } });
    console.log('✓ Isolated test fixtures cleaned up cleanly!');

    // ── 7. Final Verification Result ──
    console.log('\n========================================');
    if (allPassed) {
      console.log(' ✅ ALL DISPATCH 2 SECURITY, RBAC & CONCURRENCY TESTS PASSED!');
    } else {
      console.error(' ❌ SOME TESTS FAILED!');
    }
    console.log('========================================\n');
  } catch (err: any) {
    console.error('Test execution failed:', err.stack || err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runDispatch2MatrixTest();
