require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.salesOrder.findFirst({
    where: { orderNumber: { contains: '0122' } },
    include: {
      customer: true,
      sourceQuotation: true,
      quotation: true,
      items: true
    }
  });
  console.log('Order found by 0122:', JSON.stringify(order, null, 2));

  const customer = await prisma.customer.findFirst({
    where: { companyName: { contains: 'VISHAL', mode: 'insensitive' } }
  });
  console.log('Customer VISHAL:', JSON.stringify(customer, null, 2));

  const count = await prisma.salesOrder.count();
  console.log('Total sales orders:', count);

  const sampleOrders = await prisma.salesOrder.findMany({
    take: 3,
    include: { customer: true }
  });
  console.log('Sample orders customer fields:', sampleOrders.map(o => ({
    orderNumber: o.orderNumber,
    billingAddress: o.billingAddress,
    shippingAddress: o.shippingAddress,
    customer: o.customer ? {
      name: o.customer.companyName,
      billingAddress: o.customer.billingAddress,
      shippingAddress: o.customer.shippingAddress,
      gstin: o.customer.gstin,
      city: o.customer.city
    } : null
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
