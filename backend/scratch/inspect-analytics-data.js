const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} companies:`);
  for (const comp of companies) {
    const txCount = await prisma.inventoryTransaction.count({ where: { companyId: comp.id } });
    const itOutCount = await prisma.inventoryTransaction.count({
      where: { companyId: comp.id, type: 'OUT', referenceType: 'ISSUE_TO_PRODUCTION' }
    });
    const grnCount = await prisma.goodsReceiptNoteItem.count({
      where: { goodsReceiptNote: { companyId: comp.id } }
    });
    const mriCount = await prisma.materialRequestItem.count({
      where: { materialRequest: { companyId: comp.id } }
    });
    const prodCount = await prisma.product.count({ where: { companyId: comp.id } });
    const rmCount = await prisma.rawMaterial.count({ where: { companyId: comp.id } });
    console.log(`- ${comp.name} (${comp.publicId}) [${comp.id}]:`);
    console.log(`    Products: ${prodCount}, RawMaterials: ${rmCount}`);
    console.log(`    Transactions: total=${txCount}, OUT+ISSUE_TO_PRODUCTION=${itOutCount}`);
    console.log(`    GRN items: ${grnCount}, MR items: ${mriCount}`);
  }

  // Also check if any inventoryTransaction has no companyId or different companyId
  const totalTx = await prisma.inventoryTransaction.count();
  console.log(`Total InventoryTransactions in entire DB: ${totalTx}`);
  const totalGRN = await prisma.goodsReceiptNoteItem.count();
  console.log(`Total GoodsReceiptNoteItems in entire DB: ${totalGRN}`);
  const totalMRI = await prisma.materialRequestItem.count();
  console.log(`Total MaterialRequestItems in entire DB: ${totalMRI}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
