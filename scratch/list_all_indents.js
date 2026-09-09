require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  console.log('Companies:', companies);

  const allIndents = await prisma.purchaseIndent.findMany({
    select: {
      id: true,
      publicId: true,
      indentNo: true,
      status: true,
      companyId: true,
      items: {
        select: {
          id: true,
          materialName: true,
          quantity: true,
          approvedQuantity: true
        }
      }
    }
  });

  console.log(`Total purchase indents in DB: ${allIndents.length}`);
  for (const ind of allIndents) {
    console.log(`- Indent ${ind.publicId} (${ind.id}) | Company: ${ind.companyId} | Status: ${ind.status} | Items: ${ind.items.length}`);
    for (const it of ind.items) {
      console.log(`    Item: ${it.id} - ${it.materialName} (qty=${it.quantity}, approved=${it.approvedQuantity})`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
