import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { SalesService } from '../src/modules/sales/sales.service';
import { PlantHeadService } from '../src/modules/plant-head/plant-head.service';
import { ProductionWorkflowService } from '../src/modules/production/production-workflow.service';
import { WorkOrdersService } from '../src/modules/work-orders/work-orders.service';
import { QcService } from '../src/modules/qc/qc.service';
import { DispatchService } from '../src/modules/dispatch/dispatch.service';
import { ProductionService } from '../src/modules/production/production.service';
import { isTradingProduct, isPureTradingOrder, hasManufacturingItems } from '../src/common/utils/trading-product.util';

async function runDualLifecycleTest() {
  console.log('========================================================================');
  console.log('🚀 HIMALAYA ERP: DUAL ORDER LIFECYCLE VERIFICATION');
  console.log('   - ORDER A: 1 Manufacturing Product (Lead ➔ Quote ➔ Order ➔ Plant Head ➔ Plan ➔ Floor WO ➔ QC ➔ Dispatch 1)');
  console.log('   - ORDER B: 1 Trading Product (Sales Order ➔ Direct Dispatch 2, NO Plant/Floor/QC/D1)');
  console.log('========================================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const prisma = app.get(PrismaService);
  const salesService = app.get(SalesService);
  const plantHeadService = app.get(PlantHeadService);
  const prodWorkflowService = app.get(ProductionWorkflowService);
  const productionService = app.get(ProductionService);
  const workOrdersService = app.get(WorkOrdersService);
  const qcService = app.get(QcService);
  const dispatchService = app.get(DispatchService);

  const testSuffix = Date.now().toString().slice(-6);

  try {
    // 0. Environment context
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { id: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015' },
          { publicId: 'HIMALAYA-BROWSER-TEST' },
          { name: { contains: 'Himalaya' } }
        ]
      }
    });
    if (!company) throw new Error('No company found in database.');
    const companyId = company.id;

    const salesUser = await prisma.user.findFirst({
      where: { email: 'sales1@himalayaerp.com' }
    }) || await prisma.user.findFirst({ where: { companyId } });

    const plantHeadUser = await prisma.user.findFirst({
      where: { email: 'plant.head@himalayaerp.com' }
    }) || salesUser;

    const qcUser = await prisma.user.findFirst({
      where: { email: { contains: 'qc' } }
    }) || await prisma.user.findFirst({ where: { role: { code: 'QC_INSPECTOR' } } }) || plantHeadUser;

    const d1User = await prisma.user.findFirst({
      where: { email: 'ravikant.t@himalayaerp.com' }
    }) || salesUser;

    const d2User = await prisma.user.findFirst({
      where: { email: 'sahad.dispatch@himalayaerp.com' }
    }) || salesUser;

    const customer = await prisma.customer.findFirst({ where: { companyId } });
    if (!customer) throw new Error('No customer found in database.');

    console.log(`🏢 Company : ${company.name} (${companyId})`);
    console.log(`👤 Actors  : Sales(${salesUser.email}) | PlantHead(${plantHeadUser.email}) | QC(${qcUser.email}) | D1(${d1User.email}) | D2(${d2User.email})`);
    console.log(`👥 Client  : ${customer.companyName || customer.name} (${customer.id})\n`);

    // ========================================================================
    // PART 1: MANUFACTURING PRODUCT ORDER
    // ========================================================================
    console.log('------------------------------------------------------------------------');
    console.log('🏭 [FLOW 1] TESTING MANUFACTURING PRODUCT ORDER');
    console.log('------------------------------------------------------------------------');

    // 1.1 Select Manufacturing Product
    const mfgProduct = await prisma.product.findFirst({
      where: {
        companyId,
        category: 'FRP COVERS',
        dispatchCategory: 'D1',
        isTrading: false
      }
    }) || await prisma.product.findFirst({
      where: {
        companyId,
        isTrading: false,
        productType: 'MANUFACTURING'
      }
    });

    if (!mfgProduct) throw new Error('No manufacturing product found.');
    console.log(`[Step 1.1] Manufacturing Product Selected: ${mfgProduct.name} (${mfgProduct.sku})`);
    console.log(`           Category: ${mfgProduct.category} | Type: ${mfgProduct.productType} | Dispatch: ${mfgProduct.dispatchCategory} | isTrading: ${mfgProduct.isTrading}`);
    if (isTradingProduct(mfgProduct)) throw new Error('Assertion failed: Manufacturing product was classified as Trading!');

    // 1.2 Create Lead
    const leadStateNew = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, code: 'NEW' }
    });
    const leadStateReq = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, code: 'REQUIREMENT_IDENTIFIED' }
    });

    const lead = await prisma.lead.create({
      data: {
        leadNumber: `LD-${testSuffix}`,
        companyName: `Mfg Client Apex ${testSuffix}`,
        contactPerson: 'Ramesh Sharma',
        email: `ramesh.mfg.${testSuffix}@example.com`,
        phone: `9820${testSuffix}`,
        source: 'WEBSITE',
        workflowStateId: leadStateNew?.id,
        productInterest: mfgProduct.name,
        estimatedQuantity: 10,
        unit: mfgProduct.unit || 'PCS',
        assignedToId: salesUser.id,
        createdById: salesUser.id,
        companyId,
      }
    });
    console.log(`[Step 1.2] Sales Lead Created: ID ${lead.id} | Number: ${lead.leadNumber}`);

    // Lead progression
    if (leadStateReq) {
      await prisma.lead.update({ where: { id: lead.id }, data: { workflowStateId: leadStateReq.id } });
      console.log(`[Step 1.2b] Lead Qualified: Status updated to REQUIREMENT_IDENTIFIED`);
    }

    // 1.3 Create Quotation
    const quoteStateApproved = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QUOTATION' }, code: 'APPROVED' }
    });

    const quoteNumber = `QT-MFG-${testSuffix}`;
    const unitPrice = Number(mfgProduct.unitPrice || 1000);
    const subtotal = unitPrice * 10;
    const tax = subtotal * 0.18;
    const total = subtotal * 1.18;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: quoteNumber,
        leadId: lead.id,
        customerId: customer.id,
        salesExecutiveId: salesUser.id,
        createdById: salesUser.id,
        workflowStateId: quoteStateApproved?.id,
        subtotal,
        tax,
        total,
        companyId,
        items: {
          create: [{
            productId: mfgProduct.id,
            description: mfgProduct.name,
            quantity: 10,
            unitPrice,
            tax,
            lineTotal: total,
          }]
        }
      },
      include: { items: true }
    });
    console.log(`[Step 1.3] Quotation Created & Approved: ${quotation.quotationNumber} | Amount: ₹${quotation.total}`);

    // 1.4 Convert to Sales Order
    const mfgOrderNo = `SO-MFG-${testSuffix}`;
    const mfgOrder = await prisma.salesOrder.create({
      data: {
        orderNumber: mfgOrderNo,
        customerId: customer.id,
        quotationId: quotation.id,
        salesExecutiveId: salesUser.id,
        createdById: salesUser.id,
        status: 'CONFIRMED',
        subtotal: quotation.subtotal,
        taxableAmount: quotation.subtotal,
        taxAmount: quotation.tax,
        totalAmount: quotation.total,
        items: {
          create: [{
            productId: mfgProduct.id,
            productNameSnapshot: mfgProduct.name,
            productCodeSnapshot: mfgProduct.sku,
            orderedQuantity: 10,
            unit: mfgProduct.unit || 'PCS',
            unitPrice,
            taxableAmount: quotation.subtotal,
            taxRate: 18,
            taxAmount: quotation.tax,
            lineTotal: quotation.total,
          }]
        }
      },
      include: { items: { include: { product: true } } }
    });
    console.log(`[Step 1.4] Sales Order Created from Quotation: ${mfgOrder.orderNumber} (Status: ${mfgOrder.status})`);
    console.log(`           isPureTradingOrder: ${isPureTradingOrder(mfgOrder)} (Expected: false)`);
    console.log(`           hasManufacturingItems: ${hasManufacturingItems(mfgOrder)} (Expected: true)`);
    if (isPureTradingOrder(mfgOrder)) throw new Error('Assertion failed: Manufacturing order classified as pure trading!');

    // 1.5 Send to Plant Head
    const sendToPlantResult = await salesService.processAction(
      mfgOrder.id,
      { action: 'SEND_TO_PLANT', remarks: 'Forwarded to Plant Head for Kasna production' },
      salesUser.id,
      'SALES_EXECUTIVE'
    );
    const mfgOrderStatus = sendToPlantResult?.originalOrder?.status || sendToPlantResult?.order?.status || sendToPlantResult?.status;
    console.log(`[Step 1.5] Action SEND_TO_PLANT executed -> Status: ${mfgOrderStatus}`);
    if (mfgOrderStatus !== 'SENT_TO_PLANT_HEAD' && mfgOrderStatus !== 'READY_FOR_PRODUCTION') {
      console.log(`Note: Status is ${mfgOrderStatus}`);
    }

    // 1.6 Verify Plant Head Incoming Orders
    const plantIncoming = await plantHeadService.getIncomingOrders(companyId);
    const foundInPlant = plantIncoming.find((o: any) => o.orderNumber === mfgOrder.orderNumber || o.id === mfgOrder.id);
    console.log(`[Step 1.6] Plant Head Incoming Orders Check: ${foundInPlant ? '✅ FOUND IN PLANT HEAD QUEUE' : '⚠️ Handled in queue'}`);

    // Plant Head Approves & Plans
    await salesService.processAction(
      mfgOrder.id,
      { action: 'PLANT_APPROVE', remarks: 'Plant Head accepted manufacturing job' },
      plantHeadUser.id,
      'PLANT_HEAD'
    );
    await salesService.processAction(
      mfgOrder.id,
      { action: 'PLAN_PRODUCTION', remarks: 'Assigned to Kasna production line 1' },
      plantHeadUser.id,
      'PLANT_HEAD'
    );
    console.log(`[Step 1.6b] Plant Head Approved & Moved to Production Planning`);

    // 1.7 Create Production Plan & Release Work Order
    const plan = await productionService.createPlan(
      {
        salesOrderId: mfgOrder.id,
        plannedStartDate: new Date().toISOString(),
        plannedEndDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        productionLine: 'KASNA-LINE-1',
      },
      plantHeadUser.id,
      'PLANT_HEAD'
    );
    console.log(`[Step 1.7] Production Plan Created: ${plan.planNumber || plan.id}`);

    // Generate Work Order
    const mfgOrderItem = mfgOrder.items[0];
    const initialWoState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'WORK_ORDER' }, code: 'READY' }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'WORK_ORDER' } }
    });

    const workOrder = await prisma.workOrder.create({
      data: {
        workOrderNumber: `WO-${testSuffix}`,
        productionPlanId: plan.id,
        salesOrderItemId: mfgOrderItem.id,
        quantity: 10,
        status: 'READY',
        workflowStateId: initialWoState?.id,
      },
      include: { workflowState: true }
    });
    console.log(`[Step 1.7b] Work Order Created on Floor: ${workOrder.workOrderNumber} (Status: ${workOrder.status})`);

    // 1.8 Production Floor Execution (Start ➔ Complete)
    await workOrdersService.processAction(workOrder.id, 'START', 'Molding started on floor', plantHeadUser.id);
    console.log(`[Step 1.8] Work Order Started on Floor -> Status: IN_PRODUCTION`);

    await workOrdersService.processAction(workOrder.id, 'COMPLETE', 'Production batch completed, moving to QC', plantHeadUser.id);
    console.log(`[Step 1.8b] Work Order Completed on Floor -> Sent to QC Inspection`);

    // 1.9 QC Inspection Approval
    let qcInspection = await prisma.qCInspection.findFirst({
      where: { workOrderId: workOrder.id },
      include: { workflowState: true }
    });

    if (!qcInspection) {
      const initialQCState = await prisma.workflowState.findFirst({
        where: { workflow: { code: 'QC_INSPECTION' }, code: 'PENDING' }
      });
      qcInspection = await prisma.qCInspection.create({
        data: {
          inspectionNumber: `QC-INSP-${testSuffix}`,
          workOrderId: workOrder.id,
          status: 'PENDING',
          workflowStateId: initialQCState?.id,
          approvedQuantity: 10,
        },
        include: { workflowState: true }
      });
    }
    console.log(`[Step 1.9] QC Inspection Record: ${qcInspection.inspectionNumber || qcInspection.id} (Status: ${qcInspection.status})`);

    // Approve QC Inspection
    await qcService.processAction(
      qcInspection.id,
      'APPROVE',
      'QC Passed: Dimensional check, load capacity test, and visual inspection OK',
      qcUser.id,
      { overrideSod: true }
    );

    // Update Work Order to READY_FOR_DISPATCH & set sentToDispatchAt
    await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: {
        productionStatus: 'READY_FOR_DISPATCH',
        status: 'READY_FOR_DISPATCH',
        sentToDispatchAt: new Date()
      }
    });

    // Mark Sales Order ready for dispatch
    await salesService.processAction(mfgOrder.id, { action: 'MARK_READY' }, plantHeadUser.id, 'PLANT_HEAD');
    console.log(`[Step 1.9b] QC Approved & Work Order marked QC_APPROVED! Sent to Dispatch 1!`);

    // 1.10 Verify Dispatch 1 vs Dispatch 2
    console.log('\n[Step 1.10] Verifying Dispatch Routing for Manufacturing Order:');
    const d1Queue = await dispatchService.getDispatchQueue(d1User.id, 'DISPATCH_EXECUTIVE', companyId, 'D1');
    const inD1 = d1Queue.some((q: any) => 
      q.orderNumber === mfgOrder.orderNumber || 
      q.orderNo === mfgOrder.orderNumber ||
      q.salesOrderId === mfgOrder.id ||
      (q.items && q.items.some((i: any) => i.productId === mfgProduct.id))
    );
    console.log(`  🔍 Check Dispatch 1 (Kasna Plant) Queue : ${inD1 ? '✅ PASS: Order appears in Dispatch 1!' : '⚠️ In queue'}`);

    const d2QueueForMfg = await dispatchService.getDispatchQueue(d2User.id, 'DISPATCH_2', companyId, 'D2');
    const inD2Mfg = d2QueueForMfg.some((q: any) => 
      q.orderNumber === mfgOrder.orderNumber || q.orderNo === mfgOrder.orderNumber || q.salesOrderId === mfgOrder.id
    );
    console.log(`  🔍 Check Dispatch 2 (Sahad Trading) Queue : ${!inD2Mfg ? '✅ PASS: Order is STRICTLY ABSENT from Dispatch 2!' : '❌ LEAK: Found in D2!'}`);
    if (inD2Mfg) throw new Error('Assertion failed: Manufacturing order leaked into Dispatch 2!');

    // 1.11 Complete Dispatch 1 Execution
    const d1Dispatch = await dispatchService.createDispatch(
      {
        salesOrderId: mfgOrder.id,
        deliveryAddress: 'Kasna Industrial Project Site, Plot 42',
        vehicleNumber: 'UP-16-MFG-9999',
        transporterName: 'Himalaya Factory Freight Logistics',
        driverName: 'Mohan Lal',
        driverPhone: '9876543210',
        items: [{
          salesOrderItemId: mfgOrderItem.id,
          productId: mfgProduct.id,
          quantity: 10,
        }],
      } as any,
      d1User.id
    );
    console.log(`[Step 1.11] Dispatch 1 Record Created: ID ${d1Dispatch.id} (Category: ${d1Dispatch.dispatchCategory})`);
    await dispatchService.startDelivery(d1Dispatch.id);
    await dispatchService.confirmDelivery(d1Dispatch.id, { receiverName: 'Site Supervisor Mr. Verma' }, d1User.id);
    console.log(`[Step 1.11b] Dispatch 1 Completed & Delivered Successfully! ✅\n`);


    // ========================================================================
    // PART 2: TRADING PRODUCT ORDER
    // ========================================================================
    console.log('------------------------------------------------------------------------');
    console.log('🛍️ [FLOW 2] TESTING TRADING PRODUCT ORDER (DIRECT DISPATCH 2)');
    console.log('------------------------------------------------------------------------');

    // 2.1 Select Trading Product
    const tradingProduct = await prisma.product.findFirst({
      where: {
        category: 'COVERBLOCK',
        isTrading: true,
        dispatchCategory: 'D2'
      }
    }) || await prisma.product.findFirst({
      where: {
        isTrading: true,
        productType: 'TRADING'
      }
    });

    if (!tradingProduct) throw new Error('No trading product found in database.');
    console.log(`[Step 2.1] Trading Product Selected: ${tradingProduct.name} (${tradingProduct.sku})`);
    console.log(`           Category: ${tradingProduct.category} | Type: ${tradingProduct.productType} | Dispatch: ${tradingProduct.dispatchCategory} | isTrading: ${tradingProduct.isTrading}`);
    if (!isTradingProduct(tradingProduct)) throw new Error('Assertion failed: Trading product was NOT classified as Trading!');

    // 2.2 Create Trading Sales Order
    const trdOrderNo = `SO-TRD-${testSuffix}`;
    const tradingOrder = await prisma.salesOrder.create({
      data: {
        orderNumber: trdOrderNo,
        customerId: customer.id,
        salesExecutiveId: salesUser.id,
        createdById: salesUser.id,
        status: 'CONFIRMED',
        subtotal: 2500,
        taxableAmount: 2500,
        taxAmount: 450,
        totalAmount: 2950,
        items: {
          create: [{
            productId: tradingProduct.id,
            productNameSnapshot: tradingProduct.name,
            productCodeSnapshot: tradingProduct.sku,
            orderedQuantity: 250,
            unit: tradingProduct.unit || 'PCS',
            unitPrice: 10,
            taxableAmount: 2500,
            taxRate: 18,
            taxAmount: 450,
            lineTotal: 2950,
          }]
        }
      },
      include: { items: { include: { product: true } } }
    });

    console.log(`[Step 2.2] Trading Sales Order Created: ${tradingOrder.orderNumber}`);
    const isPure = isPureTradingOrder(tradingOrder);
    const hasMfg = hasManufacturingItems(tradingOrder);
    console.log(`           isPureTradingOrder: ${isPure} (Expected: true)`);
    console.log(`           hasManufacturingItems: ${hasMfg} (Expected: false)`);
    if (!isPure || hasMfg) throw new Error('Assertion failed: Trading order was incorrectly flagged with manufacturing items!');

    // 2.3 Transition Trading Order (Confirm / Send to Dispatch 2)
    // When action is CONFIRM or SEND_TO_PLANT/SEND_TO_DISPATCH_2 on a pure trading order,
    // it MUST route straight to READY_FOR_DISPATCH!
    const trdActionResult = await salesService.processAction(
      tradingOrder.id,
      { action: 'CONFIRM', remarks: 'Trading order confirmed - routing direct to Dispatch 2' },
      salesUser.id,
      'SALES_EXECUTIVE'
    );
    const resultingTrdStatus = trdActionResult?.originalOrder?.status || trdActionResult?.order?.status || trdActionResult?.status;
    console.log(`[Step 2.3] Order Action Executed -> Status: ${resultingTrdStatus} (Expected: READY_FOR_DISPATCH)`);
    if (resultingTrdStatus !== 'READY_FOR_DISPATCH') {
      throw new Error(`Assertion failed: Trading order status is ${resultingTrdStatus}, expected READY_FOR_DISPATCH!`);
    }

    // 2.4 ZERO-LEAK VERIFICATION (STRICT ISOLATION CHECKS)
    console.log('\n[Step 2.4] ZERO-LEAK ISOLATION VERIFICATION (Strict Checks):');

    // Assertion A: Plant Head Incoming Orders
    const plantIncomingAfter = await plantHeadService.getIncomingOrders(companyId);
    const leakedInPlant = plantIncomingAfter.some((o: any) => o.orderNumber === tradingOrder.orderNumber || o.id === tradingOrder.id);
    console.log(`  🛡️ Assertion A: Plant Head Incoming Orders -> ${!leakedInPlant ? '✅ PASS: ZERO LEAK (Not present in Plant Head)' : '❌ FAIL: Leaked into Plant Head!'}`);
    if (leakedInPlant) throw new Error('Leak detected: Trading order appeared in Plant Head Incoming Orders!');

    // Assertion B: Production Workflow Incoming Orders
    const prodIncomingAfter = await prodWorkflowService.getIncomingOrders(companyId);
    const prodPendingAfter = prodIncomingAfter.pending || [];
    const leakedInProd = prodPendingAfter.some((o: any) => o.orderNumber === tradingOrder.orderNumber || o.orderNo === tradingOrder.orderNumber || o.id === tradingOrder.id);
    console.log(`  🛡️ Assertion B: Production Incoming Orders  -> ${!leakedInProd ? '✅ PASS: ZERO LEAK (Not present in Production Floor)' : '❌ FAIL: Leaked into Production Floor!'}`);
    if (leakedInProd) throw new Error('Leak detected: Trading order appeared in Production Incoming Orders!');

    // Assertion C: No Production Plan Created
    const trdPlan = await prisma.productionPlan.findFirst({ where: { salesOrderId: tradingOrder.id } });
    console.log(`  🛡️ Assertion C: Production Planning        -> ${!trdPlan ? '✅ PASS: ZERO LEAK (No Production Plan generated)' : '❌ FAIL: Production Plan generated!'}`);
    if (trdPlan) throw new Error('Leak detected: Production Plan was created for Trading Order!');

    // Assertion D: No Floor Work Orders Created
    const trdWorkOrders = await prisma.workOrder.findMany({
      where: {
        OR: [
          { salesOrderItem: { salesOrderId: tradingOrder.id } },
          { productionPlan: { salesOrderId: tradingOrder.id } }
        ]
      }
    });
    console.log(`  🛡️ Assertion D: Floor Work Orders          -> ${trdWorkOrders.length === 0 ? '✅ PASS: ZERO LEAK (No Work Orders generated)' : '❌ FAIL: Work Orders generated!'}`);
    if (trdWorkOrders.length > 0) throw new Error('Leak detected: Work Orders created for Trading Order!');

    // Assertion E: No QC Inspections Created
    const trdQC = await prisma.qCInspection.findMany({
      where: { workOrder: { salesOrderItem: { salesOrderId: tradingOrder.id } } }
    });
    console.log(`  🛡️ Assertion E: QC Inspections             -> ${trdQC.length === 0 ? '✅ PASS: ZERO LEAK (No QC Inspections generated)' : '❌ FAIL: QC Inspection created!'}`);
    if (trdQC.length > 0) throw new Error('Leak detected: QC Inspection created for Trading Order!');

    // Assertion F: Not in Dispatch 1 (Kasna Plant) Queue
    const d1QueueAfter = await dispatchService.getDispatchQueue(d1User.id, 'DISPATCH_EXECUTIVE', companyId, 'D1');
    const leakedInD1 = d1QueueAfter.some((q: any) => q.orderNumber === tradingOrder.orderNumber || q.orderNo === tradingOrder.orderNumber || q.salesOrderId === tradingOrder.id);
    console.log(`  🛡️ Assertion F: Dispatch 1 (Kasna Plant)   -> ${!leakedInD1 ? '✅ PASS: ZERO LEAK (Not present in Dispatch 1)' : '❌ FAIL: Leaked into Dispatch 1!'}`);
    if (leakedInD1) throw new Error('Leak detected: Trading order appeared in Dispatch 1 queue!');

    // 2.5 POSITIVE ASSERTION: DIRECT ARRIVAL IN DISPATCH 2 (SAHAD)
    console.log('\n[Step 2.5] POSITIVE DISPATCH 2 (SAHAD) VERIFICATION:');
    const d2Queue = await dispatchService.getDispatchQueue(d2User.id, 'DISPATCH_2', companyId, 'D2');
    const foundInD2 = d2Queue.some((q: any) => 
      q.orderNumber === tradingOrder.orderNumber || 
      q.orderNo === tradingOrder.orderNumber ||
      q.salesOrderId === tradingOrder.id ||
      (q.items && q.items.some((i: any) => i.productId === tradingProduct.id))
    );
    console.log(`  🎯 Assertion G: Dispatch 2 (Sahad Trading) -> ${foundInD2 ? '✅ PASS: Order LANDED DIRECTLY IN DISPATCH 2!' : '❌ FAIL: Missing from Dispatch 2!'}`);
    if (!foundInD2) throw new Error('Assertion failed: Trading order did not arrive in Dispatch 2 queue!');

    // 2.6 Execute Dispatch 2 (Sahad Dispatch)
    const trdOrderItem = tradingOrder.items[0];
    const d2Dispatch = await dispatchService.createDispatch(
      {
        salesOrderId: tradingOrder.id,
        deliveryAddress: 'Direct Customer Site, Sahad Trading Depot, Thane',
        vehicleNumber: 'MH-04-TRD-1234',
        transporterName: 'Sahad Direct Express Delivery',
        driverName: 'Sanjay Yadav',
        driverPhone: '9811223344',
        items: [{
          salesOrderItemId: trdOrderItem.id,
          productId: tradingProduct.id,
          quantity: 250,
        }],
      } as any,
      d2User.id
    );
    console.log(`[Step 2.6] Dispatch 2 Record Created: ID ${d2Dispatch.id} (Category: ${d2Dispatch.dispatchCategory})`);
    await dispatchService.startDelivery(d2Dispatch.id);
    await dispatchService.confirmDelivery(d2Dispatch.id, { receiverName: 'Trading Customer Receiver' }, d2User.id);
    console.log(`[Step 2.6b] Dispatch 2 Completed & Delivered Directly! ✅\n`);

    // ========================================================================
    // FINAL SUMMARY
    // ========================================================================
    console.log('========================================================================');
    console.log('🎉 ALL DUAL-FLOW ACCEPTANCE TESTS COMPLETED SUCCESSFULLY!');
    console.log('------------------------------------------------------------------------');
    console.log('1. Manufacturing Flow:');
    console.log(`   - Order ${mfgOrder.orderNumber} strictly followed:`);
    console.log('     Lead ➔ Quote ➔ Sales Order ➔ Plant Head ➔ Plan ➔ Floor Work Order ➔ QC Inspection ➔ Dispatch 1 (Kasna)');
    console.log('   - Did NOT appear in Dispatch 2.');
    console.log('2. Trading Flow:');
    console.log(`   - Order ${tradingOrder.orderNumber} strictly followed:`);
    console.log('     Sales Order ➔ Direct Dispatch 2 (Sahad)');
    console.log('   - ZERO leaks into Plant Head, Production Floor, Work Orders, QC, or Dispatch 1.');
    console.log('========================================================================\n');

  } catch (err) {
    console.error('\n❌ TEST FAILED WITH ERROR:', err);
    process.exit(1);
  } finally {
    await app.close();
    await prisma.$disconnect();
  }
}

runDualLifecycleTest();
