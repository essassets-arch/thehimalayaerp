import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PlantHeadService } from '../src/modules/plant-head/plant-head.service';
import { loadRawMaterialCatalog } from '../src/modules/inventory/raw-material-read-model';

const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} companies in the database.`);

  const plantHeadService = new PlantHeadService(prisma as any, null as any);

  for (const company of companies) {
    const companyId = company.id;
    const catalog = await loadRawMaterialCatalog(prisma, companyId);
    if (catalog.length === 0) continue;

    console.log(`\nTesting Company: "${company.name}" (${companyId})`);
    console.log(`  Raw Material Catalog count: ${catalog.length}`);

    // Check non-raw products in this company
    const nonRawProducts = await prisma.product.findMany({
      where: {
        companyId,
        category: { in: ['MANUFACTURING', 'TRADING', 'HARDWARE', 'FINISHED_GOODS'] },
      },
    });
    console.log(`  Non-raw products count in company: ${nonRawProducts.length}`);

    if (nonRawProducts.length > 0) {
      const nonRawIds = new Set(nonRawProducts.map(p => p.id));
      const nonRawNames = new Set(nonRawProducts.map(p => p.name.trim().toLowerCase()));

      const leakedInCatalog = catalog.filter(m => nonRawIds.has(m.id) || m.aliases.some(a => nonRawIds.has(a)));
      if (leakedInCatalog.length > 0) {
        throw new Error(`Leak detected in catalog for company ${company.name}: ${leakedInCatalog.length} items`);
      }

      const analytics = await plantHeadService.getMaterialWiseAnalytics(companyId);
      const leakedInAnalytics = analytics.materials.filter((m: any) =>
        nonRawIds.has(m.materialId) || nonRawNames.has(m.materialName.trim().toLowerCase())
      );
      if (leakedInAnalytics.length > 0) {
        console.error('Leaked in analytics:', leakedInAnalytics);
        throw new Error(`Leak detected in analytics table for company ${company.name}: ${leakedInAnalytics.length} items`);
      }

      const audit = await plantHeadService.getTransactionAudit(companyId);
      const leakedAudit = audit.data.filter((item: any) =>
        nonRawIds.has(item.materialId) || nonRawNames.has(item.materialName.trim().toLowerCase())
      );
      if (leakedAudit.length > 0) {
        console.error('Leaked in audit:', leakedAudit);
        throw new Error(`Leak detected in audit drawer for company ${company.name}: ${leakedAudit.length} items`);
      }

      console.log(`  ✓ PASSED: All ${nonRawProducts.length} non-raw products strictly excluded from analytics & audit.`);
    } else {
      console.log(`  (No non-raw products found in company ${company.name})`);
    }
  }

  // ACTIVE EXPERIMENTAL ISOLATION TEST
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🧪 ACTIVE TEST: INSERT DUMMY FINISHED PRODUCT & TRANSACTIONS');
  console.log('════════════════════════════════════════════════════════════════');
  const testCompany = companies[0];
  const companyId = testCompany.id;

  const warehouse = await prisma.warehouse.findFirst({ where: { companyId } });
  if (!warehouse) {
    console.log('No warehouse found; skipping transaction insertion.');
    return;
  }

  // 1. Create a dummy finished good product
  const dummyProduct = await prisma.product.create({
    data: {
      companyId,
      publicId: `PRD-TEST-${Date.now()}`,
      name: 'TEST_HEAVY_DUTY_FRP_MANHOLE_COVER_600MM',
      sku: 'TEST-FG-MHC-600',
      category: 'MANUFACTURING',
      unit: 'NOS',
      unitPrice: 2500,
    },
  });
  console.log(`Created dummy manufacturing product: ${dummyProduct.name} (${dummyProduct.id})`);

  try {
    // 2. Add an InventoryTransaction OUT for this finished product
    const dummyTx = await prisma.inventoryTransaction.create({
      data: {
        companyId,
        warehouseId: warehouse.id,
        productId: dummyProduct.id,
        quantity: 500,
        type: 'OUT',
        referenceType: 'ISSUE_TO_PRODUCTION',
      },
    });

    // 3. Add an InventoryTransaction IN for this finished product
    const dummyInTx = await prisma.inventoryTransaction.create({
      data: {
        companyId,
        warehouseId: warehouse.id,
        productId: dummyProduct.id,
        quantity: 800,
        type: 'IN',
        referenceType: 'STOCK_IN',
      },
    });

    // 4. Fetch Material Analytics
    const analytics = await plantHeadService.getMaterialWiseAnalytics(companyId);

    // Assert finished product is NOT in materials list
    const foundInMaterials = analytics.materials.find(
      (m: any) => m.materialId === dummyProduct.id || m.materialName.includes('TEST_HEAVY_DUTY_FRP')
    );
    if (foundInMaterials) {
      throw new Error(`FAILURE: Finished product leaked into materials list! ${JSON.stringify(foundInMaterials)}`);
    }
    console.log('✓ PASSED: Dummy finished product is NOT in materials list.');

    // Assert finished product is NOT in catalog
    const catalog = await loadRawMaterialCatalog(prisma, companyId);
    const foundInCatalog = catalog.find(
      (m: any) => m.id === dummyProduct.id || m.name.includes('TEST_HEAVY_DUTY_FRP') || m.aliases.includes(dummyProduct.id)
    );
    if (foundInCatalog) {
      throw new Error(`FAILURE: Finished product leaked into raw material catalog!`);
    }
    console.log('✓ PASSED: Dummy finished product is NOT in raw material catalog.');

    // Assert audit drawer does NOT contain dummy product transactions
    const audit = await plantHeadService.getTransactionAudit(companyId);
    const foundInAudit = audit.data.find(
      (item: any) => item.materialName.includes('TEST_HEAVY_DUTY_FRP') || item.sku.includes('TEST-FG-MHC-600')
    );
    if (foundInAudit) {
      throw new Error(`FAILURE: Finished product transaction leaked into audit drawer!`);
    }
    console.log('✓ PASSED: Dummy finished product transactions are strictly excluded from audit drawer.');

    // Clean up
    await prisma.inventoryTransaction.deleteMany({ where: { id: { in: [dummyTx.id, dummyInTx.id] } } });
  } finally {
    await prisma.product.delete({ where: { id: dummyProduct.id } });
    console.log('Teardown: Dummy finished product & transactions cleaned up cleanly.');
  }

  console.log('\n✅ ALL ISOLATION & EXCLUSION TESTS PASSED WITH 100% CERTAINTY!');
}

main()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
