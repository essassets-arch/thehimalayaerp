const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  for (const c of companies) {
    const rmCount = await prisma.rawMaterial.count({ where: { companyId: c.id } });
    const prodRawCount = await prisma.product.count({ where: { companyId: c.id, productType: 'RAW_MATERIAL' } });
    const txCount = await prisma.inventoryTransaction.count({ where: { companyId: c.id } });
    console.log(`Company "${c.name}" (${c.id}): RawMaterials=${rmCount}, Product(RAW)=${prodRawCount}, InventoryTransactions=${txCount}`);
    
    const rms = await prisma.rawMaterial.findMany({ where: { companyId: c.id } });
    console.log(`  Sample RMs:`, rms.slice(0, 3));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
