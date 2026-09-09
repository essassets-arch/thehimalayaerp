require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
  const indents = await prisma.purchaseIndent.findMany({
    where: {
      companyId,
      status: { in: ['PLANT_HEAD_APPROVED', 'PARTIALLY_CONVERTED'] }
    },
    include: { items: { include: { product: true } } }
  });

  console.log(`Found ${indents.length} eligible indents in DB:`);
  for (const ind of indents) {
    console.log(`- ${ind.publicId} (${ind.id}) [${ind.status}]: ${ind.items.length} items`);
    for (const it of ind.items) {
      console.log(`    Item: ${it.id} - ${it.materialName} (qty=${it.quantity}, approved=${it.approvedQuantity})`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
