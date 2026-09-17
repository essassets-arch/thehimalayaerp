const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Testing Dispatch Flow ---');
  // Find a product
  const product = await prisma.product.findFirst({
    where: {
      category: { in: ['FRP Manhole Covers', 'FRP COVER', 'FRP COVERS'] },
      isActive: true,
      coversPerSet: { gt: 0 },
      framesPerSet: { gt: 0 }
    }
  });

  if (!product) {
    console.log('No suitable test product found');
    return;
  }
  console.log('Using product:', product.name, product.id, product.sku);

  // Check companyId
  const companyId = product.companyId || 'COMP-000001';
  const user = await prisma.user.findFirst();
  const userId = user?.id || 'test-user-id';

  // Import services
  const { SequenceService } = require('../backend/dist/src/common/sequence/sequence.service');
  const { InventoryService } = require('../backend/dist/src/modules/inventory/inventory.service');
  const { DispatchDailyReportService } = require('../backend/dist/src/modules/dispatch/dispatch-daily-report.service');
  const { ProductionWorkflowService } = require('../backend/dist/src/modules/production/production-workflow.service');

  const seq = new SequenceService(prisma);
  const inv = new InventoryService(prisma);
  const disp = new DispatchDailyReportService(prisma, seq, inv);
  const prodWf = new ProductionWorkflowService(prisma, inv);

  // Let's check current stock for this product via getAllStock
  const allStockBefore = await prodWf.getAllStock(companyId);
  const prodStockBefore = allStockBefore.items.find(i => i.id === product.id);
  console.log('Before Dispatch Stock:', {
    openingStock: prodStockBefore?.openingStock,
    productionIn: prodStockBefore?.productionIn,
    dispatchOut: prodStockBefore?.dispatchOut,
    availableStock: prodStockBefore?.availableStock,
  });

  // Let's create a test production report first to give it 50 sets of stock
  const { ProductionDailyReportService } = require('../backend/dist/src/modules/production/production-daily-report.service');
  const prodRepService = new ProductionDailyReportService(prisma, seq, inv);

  console.log('Creating production report with 50 sets...');
  const prodRep = await prodRepService.createReport(companyId, userId, {
    reportDate: new Date().toISOString(),
    shift: 'Morning',
    supervisorName: 'Test Supervisor',
    items: [{
      productId: product.id,
      coverQty: 50,
      frameQty: 50,
    }]
  });
  console.log('Submitting production report...');
  await prodRepService.submitReport(companyId, userId, prodRep.id);

  const allStockAfterProd = await prodWf.getAllStock(companyId);
  const prodStockAfterProd = allStockAfterProd.items.find(i => i.id === product.id);
  console.log('After Production Stock:', {
    openingStock: prodStockAfterProd?.openingStock,
    productionIn: prodStockAfterProd?.productionIn,
    dispatchOut: prodStockAfterProd?.dispatchOut,
    availableStock: prodStockAfterProd?.availableStock,
  });

  // Now create Dispatch 1 report with 20 sets
  console.log('Creating Dispatch 1 report with 20 sets...');
  const disp1Rep = await disp.createReport(companyId, userId, {
    reportDate: new Date().toISOString(),
    shift: 'Morning',
    dispatchExecutive: 'Test Dispatcher 1',
    items: [{
      productId: product.id,
      coverQty: 20,
      frameQty: 20,
    }]
  }, 'DISPATCH_1');
  console.log('Submitting Dispatch 1 report...');
  await disp.submitReport(companyId, userId, disp1Rep.id, 'DISPATCH_1');

  const allStockAfterDisp1 = await prodWf.getAllStock(companyId);
  const prodStockAfterDisp1 = allStockAfterDisp1.items.find(i => i.id === product.id);
  console.log('After Dispatch 1 Stock:', {
    openingStock: prodStockAfterDisp1?.openingStock,
    productionIn: prodStockAfterDisp1?.productionIn,
    dispatchOut: prodStockAfterDisp1?.dispatchOut,
    availableStock: prodStockAfterDisp1?.availableStock,
  });

  // Now create Dispatch 2 report with 10 sets
  console.log('Creating Dispatch 2 report with 10 sets...');
  const disp2Rep = await disp.createReport(companyId, userId, {
    reportDate: new Date().toISOString(),
    shift: 'Evening',
    dispatchExecutive: 'Test Dispatcher 2',
    items: [{
      productId: product.id,
      coverQty: 10,
      frameQty: 10,
    }]
  }, 'DISPATCH_2');
  console.log('Submitting Dispatch 2 report...');
  await disp.submitReport(companyId, userId, disp2Rep.id, 'DISPATCH_2');

  const allStockAfterDisp2 = await prodWf.getAllStock(companyId);
  const prodStockAfterDisp2 = allStockAfterDisp2.items.find(i => i.id === product.id);
  console.log('After Dispatch 2 Stock:', {
    openingStock: prodStockAfterDisp2?.openingStock,
    productionIn: prodStockAfterDisp2?.productionIn,
    dispatchOut: prodStockAfterDisp2?.dispatchOut,
    availableStock: prodStockAfterDisp2?.availableStock,
  });

  // Clean up test reports
  console.log('Cleaning up test reports...');
  await prisma.dispatchDailyReportItem.deleteMany({ where: { reportId: { in: [disp1Rep.id, disp2Rep.id] } } });
  await prisma.dispatchDailyReport.deleteMany({ where: { id: { in: [disp1Rep.id, disp2Rep.id] } } });
  await prisma.productionDailyReportItem.deleteMany({ where: { reportId: prodRep.id } });
  await prisma.productionDailyReport.deleteMany({ where: { id: prodRep.id } });
  await prisma.stockHistory.deleteMany({ where: { sourceId: { in: [disp1Rep.id, disp2Rep.id, prodRep.id] } } });
  await prisma.finishedGoods.deleteMany({ where: { productId: product.id } });
  console.log('Test completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
