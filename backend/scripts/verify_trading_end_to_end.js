const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { PrismaClient } = require('@prisma/client');
const { isTradingProduct, isPureTradingOrder } = require('../dist/common/utils/trading-product.util');

async function runVerification() {
  console.log('=== STARTING END-TO-END TRADING FLOW VERIFICATION ===');
  
  const prisma = new PrismaClient();
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });

  try {
    const { ProductionWorkflowService } = require('../dist/modules/production/production-workflow.service');
    const { PlantHeadService } = require('../dist/modules/plant-head/plant-head.service');
    const { SalesService } = require('../dist/modules/sales/sales.service');

    const prodWorkflowService = app.get(ProductionWorkflowService);
    const plantHeadService = app.get(PlantHeadService);
    const salesService = app.get(SalesService);

    // 1. Get first active company
    const company = await prisma.company.findFirst();
    if (!company) throw new Error('No company found');
    const companyId = company.id;
    console.log(`Testing against Company: ${company.name} (${companyId})`);

    // 2. Test ProductionWorkflowService.getIncomingOrders
    console.log('\n[TEST 1] Testing ProductionWorkflowService.getIncomingOrders...');
    const incomingProdRes = await prodWorkflowService.getIncomingOrders(companyId);
    const prodPending = incomingProdRes.pending || [];
    const prodHistory = incomingProdRes.history || [];
    const allProdOrders = [...prodPending, ...prodHistory];
    console.log(`Total Orders in Production (Pending: ${prodPending.length}, History: ${prodHistory.length})`);
    const leakedTradingProd = allProdOrders.filter(o => isPureTradingOrder(o));
    if (leakedTradingProd.length > 0) {
      console.error(`FAILED: ${leakedTradingProd.length} trading orders leaked into Production incoming orders!`);
      leakedTradingProd.forEach(o => console.error(`  - ${o.orderNumber || o.orderNo || o.id}`));
      process.exit(1);
    } else {
      console.log('PASSED: Exactly 0 trading orders found in ProductionWorkflow incoming orders.');
    }

    // 3. Test PlantHeadService.getIncomingOrders
    console.log('\n[TEST 2] Testing PlantHeadService.getIncomingOrders...');
    const incomingPlantOrders = await plantHeadService.getIncomingOrders(companyId);
    console.log(`Total Incoming Orders in Plant Head: ${incomingPlantOrders.length}`);
    const leakedTradingPlant = incomingPlantOrders.filter(o => isPureTradingOrder(o));
    if (leakedTradingPlant.length > 0) {
      console.error(`FAILED: ${leakedTradingPlant.length} trading orders leaked into Plant Head incoming orders!`);
      leakedTradingPlant.forEach(o => console.error(`  - ${o.orderNumber || o.id}`));
      process.exit(1);
    } else {
      console.log('PASSED: Exactly 0 trading orders found in Plant Head incoming orders.');
    }

    // 4. Test PlantHeadService.getManufacturingDashboard
    console.log('\n[TEST 3] Testing PlantHeadService.getManufacturingDashboard...');
    const overview = await plantHeadService.getManufacturingDashboard(companyId, 'All Time');
    console.log(`Plant Head Manufacturing Dashboard Total Production Pcs: ${overview?.production?.totalPcs || overview?.totalPcs || 'OK'}`);
    console.log('PASSED: Plant Head Dashboard calculated successfully.');

    // 5. Test Live Sales Order Transition: Pure Trading Order SEND_TO_PLANT
    console.log('\n[TEST 4] Testing SEND_TO_PLANT action on a Pure Trading Order...');
    // Find or create a trading product
    let tradingProd = await prisma.product.findFirst({
      where: { companyId, productType: 'TRADING' }
    });
    if (!tradingProd) {
      tradingProd = await prisma.product.create({
        data: {
          publicId: `PRD-TEST-TRADING-${Date.now()}`,
          companyId,
          name: 'COVERBLOCK 25MM TEST',
          sku: 'WCB25-TEST',
          category: 'COVERBLOCK',
          productType: 'TRADING',
          dispatchCategory: 'D2',
          unit: 'PCS',
          unitPrice: 10
        }
      });
    }

    // Find a customer
    const customer = await prisma.customer.findFirst({ where: { companyId } });
    const user = await prisma.user.findFirst({ where: { companyId } });

    // Create a test sales order with trading product
    const orderNo = `ORD-TEST-TRD-${Date.now().toString().slice(-6)}`;
    const testOrder = await prisma.salesOrder.create({
      data: {
        orderNumber: orderNo,
        customerId: customer.id,
        salesExecutiveId: user.id,
        createdById: user.id,
        status: 'CONFIRMED',
        subtotal: 500,
        taxableAmount: 500,
        taxAmount: 0,
        totalAmount: 500,
        items: {
          create: [{
            productId: tradingProd.id,
            productNameSnapshot: tradingProd.name,
            orderedQuantity: 50,
            unit: 'PCS',
            unitPrice: 10,
            taxableAmount: 500,
            lineTotal: 500,
          }]
        }
      },
      include: { items: { include: { product: true } } }
    });

    console.log(`Created test trading order: ${testOrder.orderNumber}`);

    // Trigger SEND_TO_PLANT action
    const actionResult = await salesService.processAction(
      testOrder.id,
      { action: 'SEND_TO_PLANT', remarks: 'Testing send to dispatch 2' },
      user.id,
      'SUPER_ADMIN'
    );

    const resultingStatus = actionResult?.originalOrder?.status || actionResult?.order?.status;
    console.log(`Order status after SEND_TO_PLANT: ${resultingStatus}`);
    if (resultingStatus !== 'READY_FOR_DISPATCH') {
      console.error(`FAILED: Expected READY_FOR_DISPATCH but got ${resultingStatus}`);
      process.exit(1);
    }
    console.log('PASSED: Status is READY_FOR_DISPATCH!');

    // Check if any ProductionPlan was created
    const createdPlan = await prisma.productionPlan.findUnique({
      where: { salesOrderId: testOrder.id }
    });
    if (createdPlan) {
      console.error(`FAILED: ProductionPlan was created for trading order: ${createdPlan.id}`);
      process.exit(1);
    }
    console.log('PASSED: No ProductionPlan created for pure trading order!');

    // Clean up test order
    await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: testOrder.id } });
    await prisma.salesOrder.delete({ where: { id: testOrder.id } });
    console.log('Test order cleaned up.');

    console.log('\n======================================================');
    console.log('🎉 ALL TESTS PASSED! TRADING FLOW IS PERMANENTLY LOCKED!');
    console.log('======================================================');
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  } finally {
    await app.close();
    await prisma.$disconnect();
  }
}

runVerification();
