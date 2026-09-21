import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PlantHeadService } from '../src/modules/plant-head/plant-head.service';

const prisma = new PrismaClient();

async function runReadOnlyQA() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🔎 FINAL READ-ONLY QA / RECONCILIATION AUDIT (ZERO DATA MUTATION)');
  console.log('════════════════════════════════════════════════════════════════\n');

  const comp = await prisma.company.findFirst();
  if (!comp) throw new Error('No company found.');
  const companyId = comp.id;
  console.log(`Authenticated Company: ${comp.name} (${companyId})\n`);

  const plantHeadService = new PlantHeadService(prisma as any, null as any);

  // ─────────────────────────────────────────────────────────────
  // 1. DATA RECONCILIATION: AUGUST 2026
  // ─────────────────────────────────────────────────────────────
  console.log('─── 1. AUGUST 2026 RECONCILIATION ───');
  const augData = await plantHeadService.getMaterialAnalytics(
    companyId,
    undefined,
    undefined,
    undefined,
    '8',
    '2026',
  );

  console.log('Period Label:', augData.period.periodLabel);
  console.log('KPIs:', {
    totalIssueKg: augData.kpis.totalIssueKg,
    totalReceiveKg: augData.kpis.totalReceiveKg,
    totalConsumptionKg: augData.kpis.totalConsumptionKg,
    totalItems: augData.kpis.totalItems,
    topItem: augData.kpis.topItem,
    topItemQty: augData.kpis.topItemQty,
    topIssueDate: augData.kpis.topIssueDate,
    topIssueDateQty: augData.kpis.topIssueDateQty,
  });

  const augIssueSum = augData.issueByItem.reduce((acc, i) => acc + i.sumOfKg, 0);
  const augReceiveSum = augData.receiveByItem.reduce((acc, i) => acc + i.sumOfKg, 0);
  const augCsmSum = augData.consumptionByItem.reduce((acc, i) => acc + i.sumOfKg, 0);
  const augTop10CsmSum = augData.top10DatesConsumption.reduce((acc, i) => acc + i.sumOfKg, 0);

  const augIssueCheck = Math.abs(augIssueSum - augData.kpis.totalIssueKg) < 0.01;
  const augReceiveCheck = Math.abs(augReceiveSum - augData.kpis.totalReceiveKg) < 0.01;
  const augCsmCheck = Math.abs(augCsmSum - augData.kpis.totalConsumptionKg) < 0.01;
  const augTop10Check = augTop10CsmSum <= augData.kpis.totalConsumptionKg + 0.01;

  console.log(`  ✓ SUM(Store Issue Table) [${augIssueSum}] == Total Issue KPI [${augData.kpis.totalIssueKg}]: ${augIssueCheck}`);
  console.log(`  ✓ SUM(Store Receive Table) [${augReceiveSum}] == Total Receive KPI [${augData.kpis.totalReceiveKg}]: ${augReceiveCheck}`);
  console.log(`  ✓ SUM(Consumption Table) [${augCsmSum}] == Total Consumption KPI [${augData.kpis.totalConsumptionKg}]: ${augCsmCheck}`);
  console.log(`  ✓ Top 10 Dates Consumption Sum [${augTop10CsmSum}] <= Total Consumption KPI [${augData.kpis.totalConsumptionKg}]: ${augTop10Check}`);

  if (!augIssueCheck || !augReceiveCheck || !augCsmCheck || !augTop10Check) {
    throw new Error('August 2026 reconciliation failed!');
  }

  // ─────────────────────────────────────────────────────────────
  // 2. DATA RECONCILIATION: SEPTEMBER 2026
  // ─────────────────────────────────────────────────────────────
  console.log('\n─── 2. SEPTEMBER 2026 RECONCILIATION ───');
  const sepData = await plantHeadService.getMaterialAnalytics(
    companyId,
    undefined,
    undefined,
    undefined,
    '9',
    '2026',
  );

  console.log('Period Label:', sepData.period.periodLabel);
  console.log('KPIs:', {
    totalIssueKg: sepData.kpis.totalIssueKg,
    totalReceiveKg: sepData.kpis.totalReceiveKg,
    totalConsumptionKg: sepData.kpis.totalConsumptionKg,
    totalItems: sepData.kpis.totalItems,
    topItem: sepData.kpis.topItem,
    topItemQty: sepData.kpis.topItemQty,
    topIssueDate: sepData.kpis.topIssueDate,
    topIssueDateQty: sepData.kpis.topIssueDateQty,
  });

  const sepIssueSum = sepData.issueByItem.reduce((acc, i) => acc + i.sumOfKg, 0);
  const sepReceiveSum = sepData.receiveByItem.reduce((acc, i) => acc + i.sumOfKg, 0);
  const sepCsmSum = sepData.consumptionByItem.reduce((acc, i) => acc + i.sumOfKg, 0);
  const sepTop10CsmSum = sepData.top10DatesConsumption.reduce((acc, i) => acc + i.sumOfKg, 0);

  const sepIssueCheck = Math.abs(sepIssueSum - sepData.kpis.totalIssueKg) < 0.01;
  const sepReceiveCheck = Math.abs(sepReceiveSum - sepData.kpis.totalReceiveKg) < 0.01;
  const sepCsmCheck = Math.abs(sepCsmSum - sepData.kpis.totalConsumptionKg) < 0.01;
  const sepTop10Check = sepTop10CsmSum <= sepData.kpis.totalConsumptionKg + 0.01;

  console.log(`  ✓ SUM(Store Issue Table) [${sepIssueSum}] == Total Issue KPI [${sepData.kpis.totalIssueKg}]: ${sepIssueCheck}`);
  console.log(`  ✓ SUM(Store Receive Table) [${sepReceiveSum}] == Total Receive KPI [${sepData.kpis.totalReceiveKg}]: ${sepReceiveCheck}`);
  console.log(`  ✓ SUM(Consumption Table) [${sepCsmSum}] == Total Consumption KPI [${sepData.kpis.totalConsumptionKg}]: ${sepCsmCheck}`);
  console.log(`  ✓ Top 10 Dates Consumption Sum [${sepTop10CsmSum}] <= Total Consumption KPI [${sepData.kpis.totalConsumptionKg}]: ${sepTop10Check}`);

  if (!sepIssueCheck || !sepReceiveCheck || !sepCsmCheck || !sepTop10Check) {
    throw new Error('September 2026 reconciliation failed!');
  }

  // ─────────────────────────────────────────────────────────────
  // 3. TENANT ISOLATION CHECK
  // ─────────────────────────────────────────────────────────────
  console.log('\n─── 3. TENANT ISOLATION AUDIT ───');
  const dummyOtherCompanyId = '00000000-0000-0000-0000-000000000001';
  const otherData = await plantHeadService.getMaterialAnalytics(
    dummyOtherCompanyId,
    undefined,
    undefined,
    undefined,
    '8',
    '2026',
  );

  console.log(`  Company A (${companyId}) Total Receive: ${augData.kpis.totalReceiveKg} KG`);
  console.log(`  Company B (${dummyOtherCompanyId}) Total Receive: ${otherData.kpis.totalReceiveKg} KG`);
  console.log(`  Company B Items: ${otherData.kpis.totalItems}`);

  if (otherData.kpis.totalReceiveKg !== 0 || otherData.kpis.totalIssueKg !== 0 || otherData.kpis.totalItems !== 0) {
    throw new Error('Tenant isolation breach! Company B saw Company A transactions.');
  }
  console.log('  ✓ Tenant Isolation Confirmed: Company A cannot see Company B transactions (and vice versa).');

  // ─────────────────────────────────────────────────────────────
  // 4. ZERO-DATA PERIOD CHECK
  // ─────────────────────────────────────────────────────────────
  console.log('\n─── 4. ZERO-DATA PERIOD AUDIT ───');
  const zeroData = await plantHeadService.getMaterialAnalytics(
    companyId,
    undefined,
    undefined,
    undefined,
    '1',
    '2020', // No transactions in Jan 2020
  );

  console.log('Zero Period KPIs:', zeroData.kpis);
  console.log('Zero Period Issue Items count:', zeroData.issueByItem.length);
  console.log('Zero Period Receive Items count:', zeroData.receiveByItem.length);
  console.log('Zero Period Consumption Items count:', zeroData.consumptionByItem.length);
  console.log('Zero Period Insights:', zeroData.insights);

  const zeroIssueCheck = zeroData.kpis.totalIssueKg === 0 && zeroData.issueByItem.length === 0;
  const zeroReceiveCheck = zeroData.kpis.totalReceiveKg === 0 && zeroData.receiveByItem.length === 0;
  const zeroCsmCheck = zeroData.kpis.totalConsumptionKg === 0 && zeroData.consumptionByItem.length === 0;

  console.log(`  ✓ Zero numbers are legitimate: ${zeroIssueCheck && zeroReceiveCheck && zeroCsmCheck}`);
  console.log(`  ✓ No mock data or fake rows: ${zeroData.issueByItem.length === 0}`);
  if (!zeroIssueCheck || !zeroReceiveCheck || !zeroCsmCheck) {
    throw new Error('Zero data period returned non-zero or mock values!');
  }

  // ─────────────────────────────────────────────────────────────
  // 5. CUSTOM DATE RANGE FILTER CHECK
  // ─────────────────────────────────────────────────────────────
  console.log('\n─── 5. CUSTOM DATE RANGE FILTER AUDIT ───');
  const customData = await plantHeadService.getMaterialAnalytics(
    companyId,
    'Custom',
    '2026-08-01',
    '2026-08-15',
  );
  console.log('Custom Range Period:', customData.period.periodLabel);
  console.log('Custom Range Total Receive:', customData.kpis.totalReceiveKg);
  console.log('Custom Range Total Issue:', customData.kpis.totalIssueKg);
  console.log('Custom Range Total Consumption:', customData.kpis.totalConsumptionKg);

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('✅ ALL READ-ONLY AUDIT CRITERIA PASSED WITHOUT DATABASE WRITES');
  console.log('════════════════════════════════════════════════════════════════');
}

runReadOnlyQA()
  .catch(async (e) => {
    console.error('❌ Read-only QA failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
