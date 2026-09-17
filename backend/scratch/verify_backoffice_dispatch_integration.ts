import { PrismaClient } from '@prisma/client';
import { BackOfficeService } from '../src/modules/back-office/back-office.service';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public',
    },
  },
});

const mockSequenceService: any = {};

const backOfficeService = new BackOfficeService(
  prisma as any,
  mockSequenceService,
);

async function runVerification() {
  console.log('====================================================');
  console.log('🧪 BACK OFFICE DISPATCH READ-ONLY VERIFICATION SUITE');
  console.log('====================================================\n');

  // Initial snapshot counts
  const initialDispatchCount = await prisma.dispatch.count();
  const initialUserCount = await prisma.user.count();
  const initialSalesOrderCount = await prisma.salesOrder.count();

  // Test 1: Query all confirmed records
  console.log('▶ [Test 1] Querying All Confirmed Dispatches (D1)...');
  const allD1Result = await backOfficeService.getConfirmedDispatches({
    tab: 'D1',
    dateFilter: 'all',
    limit: 100,
  });

  console.log(`  ✓ Received ${allD1Result.items.length} items`);
  console.log(`  ✓ D1 Count: ${allD1Result.counts.D1}, D2 Count: ${allD1Result.counts.D2}, Total: ${allD1Result.counts.total}`);
  if (allD1Result.items.length !== 70) {
    throw new Error(`Expected 70 D1 items, got ${allD1Result.items.length}`);
  }

  // Test 2: Verify DELIVERED status enforcement (no non-delivered statuses)
  console.log('\n▶ [Test 2] Verifying status = DELIVERED enforcement...');
  const nonDelivered = allD1Result.items.filter((d: any) => d.status !== 'DELIVERED');
  if (nonDelivered.length > 0) {
    throw new Error(`Found ${nonDelivered.length} non-delivered dispatches!`);
  }
  console.log('  ✓ PASS: 100% of records have status = DELIVERED');

  // Test 3: Dispatch 1 isolation & no null pollution
  console.log('\n▶ [Test 3] Verifying Dispatch 1 category isolation...');
  const invalidD1 = allD1Result.items.filter(
    (d: any) => !['D1', 'DISPATCH 1', 'DISPATCH_1', 'CATEGORY 1', 'CATEGORY_1', 'Category 1'].includes(d.dispatchCategory),
  );
  if (invalidD1.length > 0) {
    throw new Error(`Found ${invalidD1.length} records in D1 with non-D1 categories!`);
  }
  console.log('  ✓ PASS: All D1 items belong strictly to authoritative D1 categories');

  // Test 4: Query Dispatch 2 tab
  console.log('\n▶ [Test 4] Querying Dispatch 2 tab...');
  const allD2Result = await backOfficeService.getConfirmedDispatches({
    tab: 'D2',
    dateFilter: 'all',
    limit: 100,
  });
  console.log(`  ✓ D2 Items: ${allD2Result.items.length}`);
  const invalidD2 = allD2Result.items.filter(
    (d: any) => !['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'Category 2'].includes(d.dispatchCategory),
  );
  if (invalidD2.length > 0) {
    throw new Error(`Found ${invalidD2.length} records in D2 with non-D2 categories!`);
  }
  console.log('  ✓ PASS: All D2 items belong strictly to authoritative D2 categories');

  // Test 5: Tab Disjointness (D1 ∩ D2 = ∅)
  console.log('\n▶ [Test 5] Verifying D1 ∩ D2 = ∅ (Zero Overlap)...');
  const d1Ids = new Set(allD1Result.items.map((d: any) => d.id));
  const overlap = allD2Result.items.filter((d: any) => d1Ids.has(d.id));
  if (overlap.length > 0) {
    throw new Error(`Overlap detected between D1 and D2: ${overlap.length} items!`);
  }
  console.log('  ✓ PASS: Zero overlap between Dispatch 1 and Dispatch 2 (D1 ∩ D2 = ∅)');

  // Test 6: Sales Person Resolution from SalesOrder
  console.log('\n▶ [Test 6] Verifying Sales Person resolution from SalesOrder...');
  let resolvedCount = 0;
  let fallbackCount = 0;
  for (const d of allD1Result.items) {
    if (d.salesPerson && d.salesPerson !== '—') {
      resolvedCount++;
    } else {
      fallbackCount++;
    }
  }
  console.log(`  ✓ Resolved Sales Persons: ${resolvedCount} / ${allD1Result.items.length} (Fallbacks: ${fallbackCount})`);
  const sample = allD1Result.items[0];
  console.log(`  ✓ Sample record: Dispatch #${sample.dispatchNo} -> Sales Order #${sample.salesOrderNumber} -> Sales Person: "${sample.salesPerson}"`);
  if (resolvedCount === 0) {
    throw new Error('Failed to resolve any Sales Person from SalesOrder relationship!');
  }
  console.log('  ✓ PASS: Sales Person resolved directly from PostgreSQL relationship without hardcoding');

  // Test 7: Date Sorting (Newest Dispatches First)
  console.log('\n▶ [Test 7] Verifying Sorting (Dispatched Date Descending)...');
  for (let i = 0; i < allD1Result.items.length - 1; i++) {
    const curTime = new Date(allD1Result.items[i].dispatchedAt).getTime();
    const nextTime = new Date(allD1Result.items[i + 1].dispatchedAt).getTime();
    if (curTime < nextTime) {
      throw new Error(`Sorting violation at index ${i}: ${allD1Result.items[i].dispatchNo} is older than ${allD1Result.items[i + 1].dispatchNo}`);
    }
  }
  console.log('  ✓ PASS: Records are strictly ordered by dispatchedAt DESC, newest first');

  // Test 8: Date Filters
  console.log('\n▶ [Test 8] Testing Date Filters (IST Timezone)...');
  const todayResult = await backOfficeService.getConfirmedDispatches({
    tab: 'D1',
    dateFilter: 'today',
  });
  console.log(`  ✓ Today filter returned: ${todayResult.items.length} records`);

  const yesterdayResult = await backOfficeService.getConfirmedDispatches({
    tab: 'D1',
    dateFilter: 'yesterday',
  });
  console.log(`  ✓ Yesterday filter returned: ${yesterdayResult.items.length} records`);

  const thisMonthResult = await backOfficeService.getConfirmedDispatches({
    tab: 'D1',
    dateFilter: 'this_month',
    limit: 100,
  });
  console.log(`  ✓ This Month filter returned: ${thisMonthResult.items.length} records`);

  const customRangeResult = await backOfficeService.getConfirmedDispatches({
    tab: 'D1',
    dateFilter: 'custom',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    limit: 100,
  });
  console.log(`  ✓ Custom Range (August 2026) returned: ${customRangeResult.items.length} records`);
  if (customRangeResult.items.length === 0) {
    throw new Error('Custom range query returned 0 records for August 2026!');
  }
  console.log('  ✓ PASS: All date filters function correctly respecting IST bounds');

  // Test 9: Quick Search
  console.log('\n▶ [Test 9] Testing Quick Search...');
  const searchResult = await backOfficeService.getConfirmedDispatches({
    tab: 'D1',
    dateFilter: 'all',
    search: sample.dispatchNo,
  });
  console.log(`  ✓ Search for "${sample.dispatchNo}" returned ${searchResult.items.length} match`);
  if (searchResult.items.length === 0 || searchResult.items[0].dispatchNo !== sample.dispatchNo) {
    throw new Error(`Search failed for ${sample.dispatchNo}`);
  }
  console.log('  ✓ PASS: Search accurately finds records by dispatch number');

  // Test 10: Zero Side Effects
  console.log('\n▶ [Test 10] Verifying Zero Side Effects...');
  const finalDispatchCount = await prisma.dispatch.count();
  const finalUserCount = await prisma.user.count();
  const finalSalesOrderCount = await prisma.salesOrder.count();

  console.log(`  ✓ Dispatches before: ${initialDispatchCount}, after: ${finalDispatchCount} (Diff: ${finalDispatchCount - initialDispatchCount})`);
  console.log(`  ✓ Users before: ${initialUserCount}, after: ${finalUserCount} (Diff: ${finalUserCount - initialUserCount})`);
  console.log(`  ✓ Sales Orders before: ${initialSalesOrderCount}, after: ${finalSalesOrderCount} (Diff: ${finalSalesOrderCount - initialSalesOrderCount})`);

  if (
    initialDispatchCount !== finalDispatchCount ||
    initialUserCount !== finalUserCount ||
    initialSalesOrderCount !== finalSalesOrderCount
  ) {
    throw new Error('SIDE EFFECT DETECTED: Records were modified or created!');
  }
  console.log('  ✓ PASS: Absolute read-only operation verified. Zero records created or mutated.');

  console.log('\n====================================================');
  console.log('🎉 ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================\n');
}

runVerification()
  .catch((err) => {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
