import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PlantHeadService } from '../src/modules/plant-head/plant-head.service';

const prisma = new PrismaClient();

async function runTest() {
  console.log('🧪 VERIFYING STORE R/O MATERIAL ANALYTICS SERVICE');
  const comp = await prisma.company.findFirst();
  if (!comp) throw new Error('No company found.');
  const companyId = comp.id;

  const plantHeadService = new PlantHeadService(prisma as any, null as any);

  // 1. Test August 2026
  console.log('\n--- Test 1: Month=August, Year=2026 ---');
  const augData = await plantHeadService.getMaterialAnalytics(
    companyId,
    undefined,
    undefined,
    undefined,
    'August',
    '2026',
  );

  console.log('Period:', augData.period);
  console.log('KPIs:', augData.kpis);
  console.log('Highlights:', augData.highlights);
  console.log(`Issue Items count: ${augData.issueByItem.length}`);
  console.log(`Receive Items count: ${augData.receiveByItem.length}`);
  console.log(`Consumption Top 10 Dates count: ${augData.top10DatesConsumption.length}`);
  console.log('Insights:', augData.insights);

  // 2. Test September 2026
  console.log('\n--- Test 2: Month=September, Year=2026 ---');
  const sepData = await plantHeadService.getMaterialAnalytics(
    companyId,
    undefined,
    undefined,
    undefined,
    '09',
    '2026',
  );
  console.log('Period:', sepData.period);
  console.log('KPIs:', sepData.kpis);
  console.log('Highlights:', sepData.highlights);

  // 3. Test Custom Date Range
  console.log('\n--- Test 3: Custom Date Range (01-08-2026 to 20-09-2026) ---');
  const customData = await plantHeadService.getMaterialAnalytics(
    companyId,
    'Custom',
    '2026-08-01',
    '2026-09-20',
  );
  console.log('Period:', customData.period);
  console.log('KPIs:', customData.kpis);
  console.log('Highlights:', customData.highlights);

  console.log('\n✅ All backend analytics scenarios completed successfully.');
}

runTest()
  .catch(async (e) => {
    console.error('❌ Verification failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
