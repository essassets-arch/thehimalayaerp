const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const items = await prisma.purchaseIndentItem.findMany({
    where: {
      purchaseIndent: {
        department: 'STORE',
        status: { in: ['PLANT_HEAD_APPROVED', 'PARTIALLY_CONVERTED'] }
      }
    },
    include: { product: true, purchaseIndent: true }
  });

  console.log(`Found ${items.length} items across eligible store indents:`);
  for (const it of items) {
    console.log(`- Indent ${it.purchaseIndent.publicId} | Item: ${it.materialName} | estimatedUnitRate: ${it.estimatedUnitRate} | product.unitPrice: ${it.product?.unitPrice}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
