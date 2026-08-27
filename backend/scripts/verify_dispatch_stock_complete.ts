import { PrismaClient } from '@prisma/client';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { DispatchDailyReportService } from '../src/modules/dispatch/dispatch-daily-report.service';
import { SequenceService } from '../src/common/sequence/sequence.service';
import { ProductionWorkflowService } from '../src/modules/production/production-workflow.service';
import { DispatchService } from '../src/modules/dispatch/dispatch.service';

const prisma = new PrismaClient();
const sequenceService = new SequenceService(prisma as any);
const inventoryService = new InventoryService(prisma as any);
const dispatchReportService = new DispatchDailyReportService(prisma as any, sequenceService, inventoryService);
const productionWorkflowService = new ProductionWorkflowService(prisma as any, inventoryService);
const dispatchService = new DispatchService(prisma as any, null as any, null as any, sequenceService);

async function runAcceptanceTests() {
  console.log('\n======================================================');
  console.log('--- STARTING COMPREHENSIVE DISPATCH STOCK SUITE ---');
  console.log('======================================================\n');

  // Find 2 test products
  const products = await prisma.product.findMany({
    where: {
      category: { in: ['FRP COVER', 'FRP COVERS'] },
      isActive: true,
    },
    take: 2,
  });

  if (products.length < 2) {
    throw new Error('Need at least 2 active FRP COVER products in database for testing');
  }

  const prodA = products[0];
  const prodB = products[1];
  const companyId = prodA.companyId;
  const user = await prisma.user.findFirst();
  const userId = user?.id || 'test-user-id';

  console.log(`Product A: ${prodA.name} (${prodA.id})`);
  console.log(`Product B: ${prodB.name} (${prodB.id})`);

  // Helper to get total available stock from FinishedGoods table
  async function getAvailableStock(productId: string): Promise<number> {
    const fg = await prisma.finishedGoods.findMany({ where: { productId } });
    return fg.reduce((sum, r) => sum + Number(r.availableQuantity || 0), 0);
  }

  // Set initial stock: ProdA = 100, ProdB = 50
  await prisma.$transaction(async (tx) => {
    // Clean previous test finished goods and test reports
    await tx.dispatchDailyReportItem.deleteMany({ where: { report: { reportNo: { startsWith: 'DR-2030' } } } });
    await tx.dispatchDailyReport.deleteMany({ where: { reportNo: { startsWith: 'DR-2030' } } });
    await tx.finishedGoods.deleteMany({ where: { productId: { in: [prodA.id, prodB.id] } } });
    await inventoryService.stockInFinishedGoods(tx, companyId, prodA.id, 100, 'TEST_SETUP', 'setup-1', null, 'INIT-A', userId, 'Setup stock A');
    await inventoryService.stockInFinishedGoods(tx, companyId, prodB.id, 50, 'TEST_SETUP', 'setup-2', null, 'INIT-B', userId, 'Setup stock B');
  });

  let stockA = await getAvailableStock(prodA.id);
  let stockB = await getAvailableStock(prodB.id);
  console.log(`[INIT] Stock A: ${stockA} (expected 100), Stock B: ${stockB} (expected 50)`);
  if (stockA !== 100 || stockB !== 50) throw new Error('Initial stock setup failed');

  const testDate = '2030-01-01';

  // ----------------------------------------------------
  // TEST 1: Submit dispatch report with duplicate lines (5 + 3 + 2 = 10 for ProdA, 10 for ProdB)
  // ----------------------------------------------------
  console.log('\n--- TEST 1: Submit with duplicate lines & multiple products ---');
  const report1 = await dispatchReportService.createReport(companyId, userId, {
    reportDate: testDate,
    shift: 'Morning',
    dispatchExecutive: 'Dispatcher Dave',
    items: [
      { productId: prodA.id, coverQty: 5, frameQty: 5, setQty: 5 },
      { productId: prodA.id, coverQty: 3, frameQty: 3, setQty: 3 },
      { productId: prodA.id, coverQty: 2, frameQty: 2, setQty: 2 },
      { productId: prodB.id, coverQty: 10, frameQty: 10, setQty: 10 },
    ]
  }, 'DISPATCH_1');

  await dispatchReportService.submitReport(companyId, userId, report1.id, 'DISPATCH_1');

  stockA = await getAvailableStock(prodA.id);
  stockB = await getAvailableStock(prodB.id);
  console.log(`[TEST 1] After submit Report 1: Stock A: ${stockA} (expected 90), Stock B: ${stockB} (expected 40)`);
  if (stockA !== 90 || stockB !== 40) throw new Error('TEST 1 Failed: Deductions incorrect');

  // Verify StockHistory entries
  const sh1 = await prisma.stockHistory.findMany({
    where: { referenceNumber: report1.reportNo, event: 'DISPATCH_OUT' }
  });
  console.log(`[TEST 1] StockHistory entries created: ${sh1.length} (expected 2 - one per aggregated product)`);
  if (sh1.length !== 2) throw new Error('TEST 1 Failed: Duplicate lines were not aggregated into 1 entry per product');

  // ----------------------------------------------------
  // TEST 2: Double-submit idempotency guard
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Double-submit idempotency guard ---');
  let doubleSubmitCaught = false;
  try {
    await dispatchReportService.submitReport(companyId, userId, report1.id, 'DISPATCH_1');
  } catch (err: any) {
    doubleSubmitCaught = true;
    console.log(`[TEST 2] Expected double submit rejection: "${err.message}"`);
  }
  if (!doubleSubmitCaught) throw new Error('TEST 2 Failed: Second submit was not rejected');
  stockA = await getAvailableStock(prodA.id);
  if (stockA !== 90) throw new Error('TEST 2 Failed: Stock deducted twice');

  // ----------------------------------------------------
  // TEST 3: Insufficient stock atomic rollback
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Insufficient stock atomic rollback ---');
  const reportFail = await dispatchReportService.createReport(companyId, userId, {
    reportDate: testDate,
    shift: 'Evening',
    dispatchExecutive: 'Dispatcher Dave',
    items: [
      { productId: prodA.id, coverQty: 10, frameQty: 10, setQty: 10 }, // 10 available (Stock A is 90)
      { productId: prodB.id, coverQty: 500, frameQty: 500, setQty: 500 }, // 500 requested, only 40 available!
    ]
  }, 'DISPATCH_1');

  let insufficientCaught = false;
  try {
    await dispatchReportService.submitReport(companyId, userId, reportFail.id, 'DISPATCH_1');
  } catch (err: any) {
    insufficientCaught = true;
    console.log(`[TEST 3] Expected rollback rejection: "${err.message}"`);
  }

  if (!insufficientCaught) throw new Error('TEST 3 Failed: Insufficient stock was not rejected');

  stockA = await getAvailableStock(prodA.id);
  stockB = await getAvailableStock(prodB.id);
  console.log(`[TEST 3] After rollback: Stock A: ${stockA} (expected 90), Stock B: ${stockB} (expected 40)`);
  if (stockA !== 90 || stockB !== 40) throw new Error('TEST 3 Failed: Partial deduction occurred during rollback');

  const reportFailDb = await prisma.dispatchDailyReport.findUnique({ where: { id: reportFail.id } });
  if (reportFailDb?.status !== 'DRAFT' || reportFailDb?.stockPostedAt !== null) {
    throw new Error('TEST 3 Failed: Report state was modified despite rollback');
  }

  // ----------------------------------------------------
  // TEST 4: Delta-based editing of submitted report (Edit 10 -> 25 for ProdA, 10 -> 5 for ProdB)
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Delta-based editing of submitted report ---');
  // Report 1 had ProdA = 10 (Stock A = 90), ProdB = 10 (Stock B = 40)
  // Edit Report 1: ProdA -> 25 (+15 more), ProdB -> 5 (-5 returned)
  await dispatchReportService.updateReport(companyId, userId, report1.id, {
    items: [
      { productId: prodA.id, coverQty: 25, frameQty: 25, setQty: 25 },
      { productId: prodB.id, coverQty: 5, frameQty: 5, setQty: 5 },
    ]
  }, 'DISPATCH_1');

  stockA = await getAvailableStock(prodA.id);
  stockB = await getAvailableStock(prodB.id);
  console.log(`[TEST 4] After delta edit (A: 10->25, B: 10->5): Stock A: ${stockA} (expected 75), Stock B: ${stockB} (expected 45)`);
  if (stockA !== 75 || stockB !== 45) throw new Error('TEST 4 Failed: Delta stock adjustment incorrect');

  // ----------------------------------------------------
  // TEST 5: Reopen submitted report & idempotency
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Reopen submitted report & idempotency ---');
  await dispatchReportService.reopenReport(companyId, userId, report1.id, 'DISPATCH_1');
  stockA = await getAvailableStock(prodA.id);
  stockB = await getAvailableStock(prodB.id);
  console.log(`[TEST 5] After reopen Report 1: Stock A: ${stockA} (expected 100), Stock B: ${stockB} (expected 50)`);
  if (stockA !== 100 || stockB !== 50) throw new Error('TEST 5 Failed: Stock was not restored on reopen');

  // Try reopening again - should be rejected safely
  let reopenTwiceCaught = false;
  try {
    await dispatchReportService.reopenReport(companyId, userId, report1.id, 'DISPATCH_1');
  } catch (err: any) {
    reopenTwiceCaught = true;
    console.log(`[TEST 5] Expected reopen twice rejection: "${err.message}"`);
  }
  if (!reopenTwiceCaught) throw new Error('TEST 5 Failed: Reopen twice was not guarded');

  stockA = await getAvailableStock(prodA.id);
  if (stockA !== 100) throw new Error('TEST 5 Failed: Stock restored twice on second reopen');

  // Re-submit Report 1 with 20 sets of ProdA
  await dispatchReportService.updateReport(companyId, userId, report1.id, {
    items: [{ productId: prodA.id, coverQty: 20, frameQty: 20, setQty: 20 }]
  }, 'DISPATCH_1');
  await dispatchReportService.submitReport(companyId, userId, report1.id, 'DISPATCH_1');
  stockA = await getAvailableStock(prodA.id);
  console.log(`[TEST 5] Re-submitted Report 1 with 20 sets: Stock A: ${stockA} (expected 80)`);
  if (stockA !== 80) throw new Error('TEST 5 Failed: Re-submission after reopen failed');

  // ----------------------------------------------------
  // TEST 6: Cancel submitted report & reversal
  // ----------------------------------------------------
  console.log('\n--- TEST 6: Cancel submitted report & reversal ---');
  await dispatchReportService.cancelReport(companyId, userId, report1.id, 'DISPATCH_1');
  stockA = await getAvailableStock(prodA.id);
  console.log(`[TEST 6] After cancel Report 1: Stock A: ${stockA} (expected 100)`);
  if (stockA !== 100) throw new Error('TEST 6 Failed: Stock was not restored on cancel');

  // ----------------------------------------------------
  // TEST 7: Concurrent submit protection
  // ----------------------------------------------------
  console.log('\n--- TEST 7: Concurrent submit protection ---');
  const reportConcurrent = await dispatchReportService.createReport(companyId, userId, {
    reportDate: testDate,
    shift: 'Night',
    dispatchExecutive: 'Dispatcher Dave',
    items: [{ productId: prodA.id, coverQty: 20, frameQty: 20, setQty: 20 }]
  }, 'DISPATCH_1');

  // Fire 2 simultaneous submits
  const [res1, res2] = await Promise.allSettled([
    dispatchReportService.submitReport(companyId, userId, reportConcurrent.id, 'DISPATCH_1'),
    dispatchReportService.submitReport(companyId, userId, reportConcurrent.id, 'DISPATCH_1'),
  ]);

  const fulfilledCount = [res1, res2].filter(r => r.status === 'fulfilled').length;
  const rejectedCount = [res1, res2].filter(r => r.status === 'rejected').length;
  console.log(`[TEST 7] Concurrent results: ${fulfilledCount} fulfilled, ${rejectedCount} rejected`);
  if (fulfilledCount !== 1 || rejectedCount !== 1) {
    throw new Error(`TEST 7 Failed: Expected exactly 1 success and 1 rejection, got ${fulfilledCount}/${rejectedCount}`);
  }

  stockA = await getAvailableStock(prodA.id);
  console.log(`[TEST 7] Stock A after concurrent submit: ${stockA} (expected 80, deducted exactly 20 only once)`);
  if (stockA !== 80) throw new Error('TEST 7 Failed: Concurrency allowed double deduction');

  // ----------------------------------------------------
  // TEST 8: Finished Goods History & Production Workflow sync
  // ----------------------------------------------------
  console.log('\n--- TEST 8: Finished Goods History & Unified Inventory View ---');
  const history = await dispatchService.getFinishedGoodsHistory();
  const foundReportInHistory = history.some(h => h.orderNumber === reportConcurrent.reportNo || h.dispatchNo === reportConcurrent.reportNo);
  console.log(`[TEST 8] Report ${reportConcurrent.reportNo} found in Finished Goods Dispatch History: ${foundReportInHistory}`);
  if (!foundReportInHistory) throw new Error('TEST 8 Failed: Daily report not found in Finished Goods Dispatch History');

  // Verify getFinishedGoods() returns correct aggregated stock
  const allFg = await productionWorkflowService.getFinishedGoods(companyId);
  const fgRowA = allFg.find((item: any) => item.productId === prodA.id || item.productCode === prodA.sku);
  console.log(`[TEST 8] getFinishedGoods row for ProdA availableQuantity: ${fgRowA?.availableQuantity} (expected 80)`);
  console.log(`[TEST 8] getFinishedGoods row for ProdA dispatchOut: ${fgRowA?.dispatchOut}`);
  if (fgRowA?.availableQuantity !== 80) throw new Error('TEST 8 Failed: getFinishedGoods returned inconsistent availableQuantity');
  // ----------------------------------------------------
  // TEST 9: Multiple reports on same date and shift allowed
  // ----------------------------------------------------
  console.log('\n--- TEST 9: Multiple reports on same date and shift allowed ---');
  const sameDayReport1 = await dispatchReportService.createReport(companyId, userId, {
    reportDate: '2030-05-15',
    shift: 'Morning',
    dispatchExecutive: 'Dispatcher 1',
    items: [{ productId: prodA.id, coverQty: 2, frameQty: 2, setQty: 2 }]
  }, 'DISPATCH_1');
  await dispatchReportService.submitReport(companyId, userId, sameDayReport1.id, 'DISPATCH_1');

  const sameDayReport2 = await dispatchReportService.createReport(companyId, userId, {
    reportDate: '2030-05-15',
    shift: 'Morning', // exact same date, shift, and dispatchType
    dispatchExecutive: 'Dispatcher 2',
    items: [{ productId: prodA.id, coverQty: 3, frameQty: 3, setQty: 3 }]
  }, 'DISPATCH_1');
  await dispatchReportService.submitReport(companyId, userId, sameDayReport2.id, 'DISPATCH_1');

  console.log(`[TEST 9] Successfully created and submitted two reports on same date & shift: ${sameDayReport1.reportNo} and ${sameDayReport2.reportNo}`);
  if (sameDayReport1.reportNo === sameDayReport2.reportNo) {
    throw new Error('TEST 9 Failed: Reports must have distinct report numbers');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 11 ACCEPTANCE TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('======================================================\n');
}

runAcceptanceTests()
  .catch(e => {
    console.error('\n❌ ACCEPTANCE TEST FAILED:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
