const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const indents = await prisma.purchaseIndent.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });

  console.log('Last 10 indents:');
  for (const ind of indents) {
    console.log(`- ID: ${ind.id} | PublicID: ${ind.publicId} | IndentNo: ${ind.indentNo} | Status: ${ind.status} | Items: ${ind.items.length}`);
    for (const it of ind.items) {
      console.log(`     item: ${it.id} | name: ${it.materialName} | qty: ${it.quantity} | approved: ${it.approvedQuantity}`);
    }
  }

  // Find ind-0010 and ind-0009
  const ind10 = indents.find(i => i.id === 'ind-0010' || i.publicId === 'ind-0010' || i.indentNo === 'IND-0010');
  const ind9 = indents.find(i => i.id === 'ind-0009' || i.publicId === 'ind-0009' || i.indentNo === 'IND-0009');

  if (ind10 && ind10.status !== 'PLANT_HEAD_APPROVED') {
    await prisma.purchaseIndent.update({
      where: { id: ind10.id },
      data: { status: 'PLANT_HEAD_APPROVED' }
    });
    console.log(`Updated ${ind10.id} status to PLANT_HEAD_APPROVED`);
  }

  if (ind9) {
    await prisma.purchaseIndent.update({
      where: { id: ind9.id },
      data: { status: 'PLANT_HEAD_APPROVED' }
    });
    console.log(`Updated ${ind9.id} status to PLANT_HEAD_APPROVED`);

    for (const it of ind9.items) {
      if (!it.approvedQuantity || Number(it.approvedQuantity) === 0) {
        await prisma.purchaseIndentItem.update({
          where: { id: it.id },
          data: { approvedQuantity: it.quantity }
        });
        console.log(`Set approvedQuantity for item ${it.id}`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
