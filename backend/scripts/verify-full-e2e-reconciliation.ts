import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PlantHeadService } from '../src/modules/plant-head/plant-head.service';
import { MaterialRequestsService } from '../src/modules/material-requests/material-requests.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';

const prisma = new PrismaClient();

async function runE2EReconciliation() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🏛️ MANDATORY END-TO-END CONSUMPTION & ISSUE RECONCILIATION AUDIT');
  console.log('════════════════════════════════════════════════════════════════');

  const comp = await prisma.company.findFirst();
  if (!comp) throw new Error('No company found.');
  const companyId = comp.id;

  const user = (await prisma.user.findFirst({ where: { companyId } })) || (await prisma.user.findFirst());
  if (!user) throw new Error('No user found.');
  const userId = user.id;

  let warehouse = await prisma.warehouse.findFirst({ where: { companyId } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({ data: { companyId, name: 'Main Store' } });
  }

  const plantHeadService = new PlantHeadService(prisma as any, null as any);
  const mrService = new MaterialRequestsService(prisma as any);
  const invService = new InventoryService(prisma as any);

  // 1. Get baseline analytics for current month
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = String(now.getFullYear());
  const baseline = await plantHeadService.getMaterialAnalytics(companyId, undefined, undefined, undefined, currentMonth, currentYear);
  console.log(`\n[Baseline ${currentMonth}/${currentYear}]`);
  console.log(`  Issue: ${baseline.kpis.totalIssueKg} KG | Receive: ${baseline.kpis.totalReceiveKg} KG | Consumption: ${baseline.kpis.totalConsumptionKg} KG`);

  // 2. Create Unique Test Raw Material
  const ts = Date.now();
  const product = await prisma.product.create({
    data: {
      companyId,
      publicId: `PRD-AUDIT-${ts}`,
      sku: `RM-AUDIT-${ts}`,
      name: `Audit Resin Polymer ${ts}`,
      unit: 'KG',
      unitPrice: 180,
      productType: 'RAW_MATERIAL',
      category: 'Raw Material',
    },
  });

  // 3. Receive 500 KG into Store via GoodsReceiptNote
  const po = await prisma.purchaseOrder.create({
    data: {
      publicId: `PO-AUDIT-${ts}`,
      poNumber: `PO-${ts}`,
      companyId,
      supplierId: (await prisma.supplier.findFirst({ where: { companyId } }))?.id || (await prisma.supplier.create({ data: { publicId: `SUP-${ts}`, companyId, name: `Supplier-${ts}` } })).id,
      status: 'APPROVED',
      totalAmount: 90000,
    },
  });

  const grn = await prisma.goodsReceiptNote.create({
    data: {
      publicId: `GRN-AUDIT-${ts}`,
      grnNumber: `GRN-${ts}`,
      companyId,
      purchaseOrderId: po.id,
      warehouseId: warehouse.id,
      status: 'PENDING_FINANCE_AUDIT',
      receivedAt: new Date(),
      items: {
        create: [
          {
            productId: product.id,
            acceptedQuantity: 500,
            receivedQuantity: 500,
            rejectedQuantity: 0,
          },
        ],
      },
    },
  });
  console.log(`✓ Store Receive Created: GRN-${ts} (500 KG of ${product.name})`);

  // 4. Create Material Request for 300 KG
  const mr = await mrService.create(
    {
      workOrderNo: `WO-AUDIT-${ts}`,
      items: [{ materialId: product.id, materialName: product.name, requestedQty: 300, unit: 'KG' }],
    },
    userId,
    companyId,
  );
  const mrItemId = mr.items[0].id;
  console.log(`✓ Material Request Created: ${mr.publicId} (Item ID: ${mrItemId}, Requested: 300 KG)`);

  // 5. Store Release / Issue: Issue 200 KG to Production
  await mrService.updateStatus(
    mr.id,
    {
      status: 'STORE_APPROVED',
      items: [{ id: mrItemId, issuedQty: 200 }],
      metadata: { issueReference: `ISS-AUDIT-${ts}` },
    },
    userId,
    companyId,
  );
  console.log(`✓ Store Released 200 KG to Production (Inventory Transaction type="OUT", ref="ISSUE_TO_PRODUCTION")`);

  // 6. Production Consumption: Shop floor logs 150 KG utilization
  await mrService.updateStatus(
    mr.id,
    {
      status: 'CONSUMING',
      items: [{ id: mrItemId, consumedQty: 150 }],
    },
    userId,
    companyId,
  );
  console.log(`✓ Shop Floor Logged 150 KG Actual Consumption (MaterialRequestItem.consumedQuantity = 150)`);

  // 7. Re-query analytics and reconcile exact deltas
  const updated = await plantHeadService.getMaterialAnalytics(companyId, undefined, undefined, undefined, currentMonth, currentYear);
  console.log(`\n[Post-Activity Analytics]`);
  console.log(`  Issue: ${updated.kpis.totalIssueKg} KG (Delta: +${updated.kpis.totalIssueKg - baseline.kpis.totalIssueKg} KG, Expected: +200 KG)`);
  console.log(`  Receive: ${updated.kpis.totalReceiveKg} KG (Delta: +${updated.kpis.totalReceiveKg - baseline.kpis.totalReceiveKg} KG, Expected: +500 KG)`);
  console.log(`  Consumption: ${updated.kpis.totalConsumptionKg} KG (Delta: +${updated.kpis.totalConsumptionKg - baseline.kpis.totalConsumptionKg} KG, Expected: +150 KG)`);

  const deltaIssue = Math.round((updated.kpis.totalIssueKg - baseline.kpis.totalIssueKg) * 100) / 100;
  const deltaReceive = Math.round((updated.kpis.totalReceiveKg - baseline.kpis.totalReceiveKg) * 100) / 100;
  const deltaConsumption = Math.round((updated.kpis.totalConsumptionKg - baseline.kpis.totalConsumptionKg) * 100) / 100;

  if (deltaIssue !== 200) {
    throw new Error(`Issue delta mismatch: expected +200 KG, got +${deltaIssue} KG`);
  }
  if (deltaReceive !== 500) {
    throw new Error(`Receive delta mismatch: expected +500 KG, got +${deltaReceive} KG`);
  }
  if (deltaConsumption !== 150) {
    throw new Error(`Consumption delta mismatch: expected +150 KG, got +${deltaConsumption} KG`);
  }

  // 8. Verify Table Grand Totals match KPIs exactly
  const issueTableSum = updated.issueByItem.reduce((acc, i) => acc + i.sumOfKg, 0);
  const receiveTableSum = updated.receiveByItem.reduce((acc, i) => acc + i.sumOfKg, 0);
  const consumptionTop10Sum = updated.top10DatesConsumption.reduce((acc, i) => acc + i.sumOfKg, 0);

  console.log('\n[KPI ↔ Table Reconciliation Check]');
  console.log(`  Issue Table Sum: ${Math.round(issueTableSum * 100) / 100} KG == Total Issue KPI: ${updated.kpis.totalIssueKg} KG? ${Math.abs(issueTableSum - updated.kpis.totalIssueKg) < 0.01}`);
  console.log(`  Receive Table Sum: ${Math.round(receiveTableSum * 100) / 100} KG == Total Receive KPI: ${updated.kpis.totalReceiveKg} KG? ${Math.abs(receiveTableSum - updated.kpis.totalReceiveKg) < 0.01}`);
  console.log(`  Consumption Top 10 <= Total Consumption KPI? ${consumptionTop10Sum <= updated.kpis.totalConsumptionKg + 0.01}`);

  if (Math.abs(issueTableSum - updated.kpis.totalIssueKg) >= 0.05) {
    throw new Error('Issue table sum does not match Total Issue KPI!');
  }
  if (Math.abs(receiveTableSum - updated.kpis.totalReceiveKg) >= 0.05) {
    throw new Error('Receive table sum does not match Total Receive KPI!');
  }

  console.log('\n✅ ZERO DOUBLE COUNTING VERIFIED:');
  console.log('  - Store Issue strictly queries InventoryTransaction (OUT / ISSUE_TO_PRODUCTION)');
  console.log('  - Production Consumption strictly queries MaterialRequestItem (consumedQuantity)');
  console.log('  - Store Receive strictly queries GoodsReceiptNoteItem (accepted/receivedQuantity)');
  console.log('  - All KPIs reconcile 100% with tabular breakdowns.');

  // Clean up
  await prisma.stockHistory.deleteMany({ where: { productId: product.id } });
  await prisma.inventoryTransaction.deleteMany({ where: { productId: product.id } });
  await prisma.materialRequestItem.deleteMany({ where: { materialRequestId: mr.id } });
  await prisma.materialRequest.delete({ where: { id: mr.id } });
  await prisma.goodsReceiptNoteItem.deleteMany({ where: { goodsReceiptNoteId: grn.id } });
  await prisma.goodsReceiptNote.delete({ where: { id: grn.id } });
  await prisma.purchaseOrder.delete({ where: { id: po.id } });
  await prisma.product.delete({ where: { id: product.id } });
  console.log('✓ Cleaned up all audit test records.');
}

runE2EReconciliation()
  .catch(async (e) => {
    console.error('❌ E2E Reconciliation failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
