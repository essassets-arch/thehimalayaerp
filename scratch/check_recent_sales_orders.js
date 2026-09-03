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
      items: { include: { product: true } },
      customer: true,
      workflowState: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('Total Orders in DB:', orders.length);
  orders.forEach(o => {
    console.log(`\nOrder: ${o.orderNumber} (ID: ${o.id})`);
    console.log(` - Status: ${o.status}, WorkflowState: ${o.workflowState?.code}`);
    console.log(` - Customer: ${o.customer?.companyName || o.customerName}`);
    console.log(` - Items:`);
    o.items.forEach(it => {
      console.log(`    * Item: ${it.productNameSnapshot || it.product?.name} (Qty: ${it.orderedQuantity || it.quantity}) | Product SKU: ${it.product?.sku}, ProductType: ${it.product?.productType}, DispatchCat: ${it.product?.dispatchCategory}`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
