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
  console.log(`Total indents in DB: ${indents.length}`);
  for (const i of indents) {
    console.log(`- ${i.publicId} (${i.id}) | dept: ${i.department} | status: ${i.status} | items: ${i.items.map(it => it.materialName).join(', ')}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
