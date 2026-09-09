const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const indents = await prisma.purchaseIndent.findMany({
    include: { items: true }
  });
  console.log(`Found ${indents.length} indents in Docker DB (port 5435):`);
  for (const ind of indents) {
    console.log(`- ${ind.publicId} (${ind.id}) [${ind.status}]: ${ind.items.length} items`);
    for (const it of ind.items) {
      console.log(`    Item: ${it.id} - ${it.materialName} (qty=${it.quantity}, approved=${it.approvedQuantity})`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
