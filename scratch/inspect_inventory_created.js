const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const grn = await prisma.goodsReceiptNote.findFirst({
    where: { grnNumber: 'GRN-2026-000001' },
    include: { items: true }
  });
  console.log('GRN:', grn?.id, grn?.status, 'Items:', grn?.items);

  const txs = await prisma.inventoryTransaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('\nRecent Inventory Transactions:', txs);

  const sh = await prisma.stockHistory.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('\nRecent Stock Histories:', sh);

  const invItems = await prisma.inventoryItem.findMany({
    take: 5
  });
  console.log('\nInventory Items:', invItems);

  await prisma.$disconnect();
}

main().catch(console.error);
