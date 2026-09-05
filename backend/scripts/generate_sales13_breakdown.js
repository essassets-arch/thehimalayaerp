const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' }
    }
  });

  const orders = await prisma.salesOrder.findMany({
    where: {
      orderNumber: { gte: 'HCPPL/2627/0264', lte: 'HCPPL/2627/0266' }
    },
    include: {
      customer: true,
      quotation: {
        include: {
          lead: true
        }
      },
      productionPlans: {
        include: {
          workOrders: true
        }
      },
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { orderNumber: 'asc' }
  });

  console.log(`Found ${orders.length} orders for Sales 13:`);
  let totalAmount = 0;
  let totalWO = 0;

  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    const lead = o.quotation?.lead;
    const plan = o.productionPlans[0];
    const wos = plan?.workOrders || [];
    totalWO += wos.length;
    totalAmount += parseFloat(o.totalAmount);

    console.log(`\n#${i + 1}: ${o.orderNumber}`);
    console.log(`  Lead: ${lead?.leadNumber} (${lead?.companyName})`);
    console.log(`  Quote: ${o.quotation?.quotationNumber}`);
    console.log(`  Plan: ${plan?.planNumber}`);
    console.log(`  Customer: ${o.customer?.companyName} (GST: ${o.customer?.gstin || 'URD'})`);
    console.log(`  Total: ₹${parseFloat(o.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
    console.log(`  Items:`);
    for (const item of o.items) {
      console.log(`    - ${item.productNameSnapshot || item.product?.name} (Qty: ${item.orderedQuantity}, Rate: ₹${item.unitPrice})`);
    }
    console.log(`  Work Orders: ${wos.map(w => w.workOrderNumber).join(', ')}`);
  }

  console.log(`\nTotal Pipeline Value: ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} across ${orders.length} orders and ${totalWO} work orders.`);

  await prisma.$disconnect();
}

main().catch(console.error);
