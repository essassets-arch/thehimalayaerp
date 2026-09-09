const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  // 1. Approve ind-0001 through ind-0009
  const pendingStoreIndents = await prisma.purchaseIndent.findMany({
    where: {
      department: 'STORE',
      status: 'PENDING_PLANT_HEAD_APPROVAL'
    },
    include: { items: true }
  });

  console.log(`Found ${pendingStoreIndents.length} pending store indents to approve:`);
  for (const ind of pendingStoreIndents) {
    await prisma.purchaseIndent.update({
      where: { id: ind.id },
      data: { status: 'PLANT_HEAD_APPROVED' }
    });
    console.log(`- Approved ${ind.publicId} (${ind.id})`);

    for (const it of ind.items) {
      if (!it.approvedQuantity || Number(it.approvedQuantity) === 0) {
        await prisma.purchaseIndentItem.update({
          where: { id: it.id },
          data: { approvedQuantity: it.quantity }
        });
        console.log(`    Set approvedQuantity=${it.quantity} for item ${it.materialName}`);
      }
    }
  }

  // 2. Remove test production indent ind-0011 if it exists
  const ind11 = await prisma.purchaseIndent.findFirst({
    where: { publicId: 'ind-0011' }
  });
  if (ind11) {
    await prisma.purchaseIndentStatusHistory.deleteMany({ where: { purchaseIndentId: ind11.id } });
    await prisma.purchaseIndentItem.deleteMany({ where: { purchaseIndentId: ind11.id } });
    await prisma.purchaseIndent.delete({ where: { id: ind11.id } });
    console.log('Removed test production indent ind-0011');
  }

  // 3. Print all eligible indents now
  const eligible = await prisma.purchaseIndent.findMany({
    where: {
      department: 'STORE',
      status: { in: ['PLANT_HEAD_APPROVED', 'PARTIALLY_CONVERTED'] }
    },
    include: { items: true }
  });

  console.log(`\nTotal eligible Store indents in DB: ${eligible.length}`);
  for (const e of eligible) {
    console.log(`- ${e.publicId} (${e.status}) : ${e.items.map(i => `${i.materialName} (${i.approvedQuantity || i.quantity})`).join(', ')}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
