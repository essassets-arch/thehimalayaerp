const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
  const company = await prisma.company.findFirst();
  const companyId = company.id;
  console.log(`Testing company: ${company.name} (${companyId})`);

  const now = new Date();
  const year = 2026;
  const month = 8; // August
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) - 330 * 60 * 1000);
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999) - 330 * 60 * 1000);

  console.log('Date bounds:', startDate.toISOString(), 'to', endDate.toISOString());

  // Test Issue
  const issueTx = await prisma.inventoryTransaction.findMany({
    where: {
      companyId,
      type: 'OUT',
      referenceType: 'ISSUE_TO_PRODUCTION',
      createdAt: { gte: startDate, lte: endDate },
    },
    include: { product: true, rawMaterial: true },
  });
  console.log(`Issue Txs in Aug 2026: ${issueTx.length}`);

  // Test Receive
  const grnItems = await prisma.goodsReceiptNoteItem.findMany({
    where: {
      goodsReceiptNote: {
        companyId,
        status: { notIn: ['REJECTED', 'CANCELLED'] },
        receivedAt: { gte: startDate, lte: endDate },
      },
    },
    include: {
      goodsReceiptNote: true,
      product: true,
    },
  });
  console.log(`GRN items in Aug 2026: ${grnItems.length}`);

  // Test Consumption
  const mrItems = await prisma.materialRequestItem.findMany({
    where: {
      materialRequest: {
        companyId,
        createdAt: { gte: startDate, lte: endDate },
      },
      consumedQuantity: { gt: 0 },
    },
    include: { materialRequest: true, product: true },
  });
  console.log(`Consumption items in Aug 2026: ${mrItems.length}`);
}

testQuery().catch(console.error).finally(() => prisma.$disconnect());
