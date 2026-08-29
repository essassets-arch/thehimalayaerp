const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  for (const c of companies) {
    const usersCount = await prisma.user.count({ where: { companyId: c.id } });
    const productsCount = await prisma.product.count({ where: { companyId: c.id } });
    const rmsCount = await prisma.rawMaterial.count({ where: { companyId: c.id } });
    const ordersCount = await prisma.salesOrder.count({ where: { companyId: c.id } });
    const quotesCount = await prisma.quotation.count({ where: { companyId: c.id } });
    const txCount = await prisma.inventoryTransaction.count({ where: { companyId: c.id } });
    console.log(`Company: "${c.name}" (${c.id})`);
    console.log(`  Users: ${usersCount}, Products: ${productsCount}, RawMaterials: ${rmsCount}, SalesOrders: ${ordersCount}, Quotations: ${quotesCount}, InventoryTransactions: ${txCount}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
