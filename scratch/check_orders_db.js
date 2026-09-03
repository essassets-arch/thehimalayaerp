const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const orders = await prisma.salesOrder.findMany({
    include: {
      items: {
        include: {
          product: true
        }
      },
      customer: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('Total sales orders in DB:', orders.length);
  orders.forEach(o => {
    console.log('Order:', o.id, o.orderNumber, o.status, 'Items:', JSON.stringify(o.items.map(i => ({ 
      id: i.id,
      productId: i.productId,
      name: i.productNameSnapshot, 
      sku: i.product?.sku, 
      prodType: i.product?.productType, 
      dispatchCat: i.product?.dispatchCategory,
      prodCategory: i.product?.category
    }))));
  });

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'FRCCP', mode: 'insensitive' } },
        { sku: { contains: 'FRCCP', mode: 'insensitive' } },
        { category: { contains: 'FRC', mode: 'insensitive' } },
        { productType: 'TRADING' }
      ]
    },
    take: 10
  });

  console.log('Matching Products in DB:');
  products.forEach(p => {
    console.log(p.id, p.sku, p.name, p.category, p.productType, p.dispatchCategory);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
