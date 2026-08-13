const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('=== STARTING SMART SEARCH & CUSTOM PRODUCT VERIFICATION ===\n');

  const company = await prisma.company.findFirst();
  const user = await prisma.user.findFirst({ where: { companyId: company.id } });

  const catalogProd = await prisma.product.findFirst({ where: { companyId: company.id } });

  const reportNo = `DPR-SMART-${Date.now()}`;
  const reportDateObj = new Date();
  reportDateObj.setHours(0, 0, 0, 0);

  const item1Data = {
    srNo: 1,
    productId: catalogProd ? catalogProd.id : null,
    customProductName: null,
    size: '600 x 600',
    type: 'MHC',
    capacity: 'B125',
    coverQty: 15,
    coverUnitWeight: 10,
    coverWeight: 150,
    frameQty: 5,
    frameUnitWeight: 10,
    frameWeight: 50,
    setQty: 5,
    totalWeight: 200
  };

  const item2Data = {
    srNo: 2,
    productId: null,
    customProductName: 'Custom FRP Special Grating 500x500',
    size: '500 x 500',
    type: 'WGC',
    capacity: 'C250',
    coverQty: 10,
    coverUnitWeight: 5,
    coverWeight: 50,
    frameQty: 5,
    frameUnitWeight: 10,
    frameWeight: 50,
    setQty: 5,
    totalWeight: 100
  };

  const report = await prisma.productionDailyReport.create({
    data: {
      reportNo,
      reportDate: reportDateObj,
      shift: 'Night',
      supervisorName: 'Smart Search Supervisor',
      status: 'DRAFT',
      totalCovers: 25,
      totalFrames: 10,
      totalSets: 10,
      totalCoverWeight: 200,
      totalFrameWeight: 100,
      totalWeight: 300,
      companyId: company.id,
      createdById: user.id,
      items: {
        create: [item1Data, item2Data]
      }
    },
    include: { items: true }
  });

  console.log(`[PASS] Created Report with Custom Product Name: ${report.reportNo}`);
  console.log(`[PASS] Row 1 Product ID: ${report.items[0].productId}`);
  console.log(`[PASS] Row 2 Custom Product Name: ${report.items[1].customProductName} (productId is null: ${report.items[1].productId === null})`);
  console.log(`[PASS] Total Production Weight: ${report.totalWeight} kg`);

  // Clean up test report
  await prisma.productionDailyReport.delete({ where: { id: report.id } });
  console.log('[PASS] Test cleanup complete.');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
