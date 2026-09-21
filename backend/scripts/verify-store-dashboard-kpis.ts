import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { InventoryService } from '../src/modules/inventory/inventory.service';

const prisma = new PrismaClient();

async function runDashboardKpiVerification() {
  console.log('🚀 Verifying Store Dashboard KPIs (Issued to Production)...');

  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error('No company found in database.');
  }
  const companyId = company.id;
  console.log(`✓ Company located: ${company.name} (${companyId})`);

  let warehouse = await prisma.warehouse.findFirst({ where: { companyId } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { companyId, name: 'Main Store' },
    });
  }

  // Create a temporary product and OUT transaction of type ISSUE_TO_PRODUCTION
  const testSku = `RM-DASH-TEST-${Date.now()}`;
  const prod = await prisma.product.create({
    data: {
      companyId,
      publicId: `PRD-${testSku}`,
      sku: testSku,
      name: 'Dashboard Test Material',
      unit: 'Units',
      unitPrice: 200,
      category: 'Raw Material',
    },
  });

  const tx = await prisma.inventoryTransaction.create({
    data: {
      companyId,
      warehouseId: warehouse.id,
      productId: prod.id,
      type: 'OUT',
      referenceType: 'ISSUE_TO_PRODUCTION',
      referenceId: 'MR-TEST-123',
      quantity: 85,
    },
  });

  const inventoryService = new InventoryService(prisma as any);
  const data = await inventoryService.getDashboardData(companyId);

  console.log('Dashboard summary metrics:', {
    totalRawMaterials: data.summary.totalRawMaterials,
    availableStock: data.summary.availableStock,
    issuedTotalQty: data.summary.issuedTotalQty,
    issuedMaterialsCount: data.summary.issuedMaterialsCount,
  });

  if (data.summary.issuedTotalQty < 85) {
    throw new Error(`Expected issuedTotalQty >= 85, got ${data.summary.issuedTotalQty}`);
  }
  if (data.summary.issuedMaterialsCount < 1) {
    throw new Error(`Expected issuedMaterialsCount >= 1, got ${data.summary.issuedMaterialsCount}`);
  }

  console.log(`✅ VERIFICATION SUCCESS: Dashboard successfully reflected ${data.summary.issuedTotalQty} units across ${data.summary.issuedMaterialsCount} materials issued!`);

  // Clean up
  await prisma.inventoryTransaction.delete({ where: { id: tx.id } });
  await prisma.product.delete({ where: { id: prod.id } });
  await prisma.$disconnect();
}

runDashboardKpiVerification().catch(async (e) => {
  console.error('❌ Verification failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
