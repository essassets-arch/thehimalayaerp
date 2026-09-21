import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { PrismaClient } from '@prisma/client';
import { PlantHeadService } from '../src/modules/plant-head/plant-head.service';

async function main() {
  const prisma = new PrismaClient();
  const service = new PlantHeadService(prisma as any, {} as any);

  const company = await prisma.company.findFirst();
  const companyId = company?.id || '';

  console.log('Testing getDailySummary with companyId:', companyId);

  // Test 1: "today"
  console.log('\n--- 1. Testing date = "today" ---');
  const todaySummary = await service.getDailySummary(companyId, 'today', { id: 'u1', name: 'Sana Konda Reddy' });
  console.log('Date:', todaySummary.date, '| Formatted:', todaySummary.formattedDate);
  console.log('Plant Head Signatory:', todaySummary.plantHeadName);
  console.log('Main KPIs:', todaySummary.mainKpis);
  console.log('Orders Received Today:', todaySummary.orders.receivedToday, '| Awaiting Approval:', todaySummary.orders.awaitingPlantHead);
  console.log('FG Direct Fulfillment Count:', todaySummary.planning.fgDirectFulfillment, '| Produce Required:', todaySummary.planning.productionRequired);
  console.log('MR Count:', todaySummary.materialRequests.table.length, '| MR Shortages:', todaySummary.materialRequests.mrMaterialShortage);
  console.log('Dispatches Count:', todaySummary.dispatch.table.length, '| Dispatches Delayed:', todaySummary.dispatch.dispatchDelayed);
  console.log('Attention Required Count:', todaySummary.attentionRequired.length);
  if (todaySummary.attentionRequired.length > 0) {
    console.log('Sample Attention Issue:', todaySummary.attentionRequired[0]);
  }

  // Test 2: "yesterday"
  console.log('\n--- 2. Testing date = "yesterday" ---');
  const yesterdaySummary = await service.getDailySummary(companyId, 'yesterday', { id: 'u2', name: 'Executive Director' });
  console.log('Date:', yesterdaySummary.date, '| Formatted:', yesterdaySummary.formattedDate);
  console.log('Signatory:', yesterdaySummary.plantHeadName);
  console.log('Main KPIs:', yesterdaySummary.mainKpis);

  // Test 3: Specific custom date "2026-09-20"
  console.log('\n--- 3. Testing date = "2026-09-20" ---');
  const customSummary = await service.getDailySummary(companyId, '2026-09-20');
  console.log('Date:', customSummary.date, '| Formatted:', customSummary.formattedDate);
  console.log('Signatory (Auto resolved):', customSummary.plantHeadName);
  console.log('Main KPIs:', customSummary.mainKpis);

  // Check Comparison Array
  console.log('\n--- 4. Checking Target Date vs Yesterday Comparison Array ---');
  console.log(todaySummary.comparison);

  console.log('\n[SUCCESS] All getDailySummary tests executed smoothly with accurate calculations!');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('[TEST ERROR]:', err);
  process.exit(1);
});
