const { PrismaClient } = require('@prisma/client');

async function check() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } }
  });

  const products = await prisma.product.findMany({
    where: { name: { contains: 'handle', mode: 'insensitive' } }
  });
  console.log('Products matching handle:', products.map(p => ({ id: p.id, publicId: p.publicId, name: p.name, sku: p.sku, companyId: p.companyId })));

  const pDetail = await prisma.product.findUnique({ where: { id: '0c9bb4dd-e742-4ea8-a7b5-358c0b61b041' } });
  console.log('Created Product 0c9bb4dd:', pDetail);
  const rmDetail = await prisma.rawMaterial.findUnique({ where: { id: '72610482-33a8-4561-90ef-66260e173b0f' } });
  console.log('Created RawMaterial 72610482:', rmDetail);

  const po = await prisma.purchaseOrder.findFirst({
    where: { poNumber: 'PO-REJ-581697' },
    include: { items: true, grns: { include: { items: true } } }
  });
  console.log('PO-REJ-581697:', {
    id: po?.id,
    companyId: po?.companyId,
    status: po?.status,
    items: po?.items.map(i => ({ id: i.id, productId: i.productId, quantity: i.quantity, receivedQuantity: i.receivedQuantity })),
    grns: po?.grns.map(g => ({ id: g.id, grnNumber: g.grnNumber, items: g.items }))
  });

  const txs = await prisma.inventoryTransaction.findMany({
    where: {
      OR: [
        { referenceId: 'PO-REJ-581697' },
        ...(po?.id ? [{ referenceId: po.id }] : [])
      ]
    }
  });
  console.log('InventoryTransactions for PO:', txs);

  await prisma.$disconnect();
}

check();
