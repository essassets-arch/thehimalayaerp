require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const soWithVishal = await prisma.salesOrder.findFirst({
    where: {
      customer: { companyName: { contains: 'VISHAL', mode: 'insensitive' } }
    },
    include: {
      customer: true,
      items: true
    }
  });

  console.log('SO with Vishal:', soWithVishal ? {
    id: soWithVishal.id,
    orderNumber: soWithVishal.orderNumber,
    billingAddress: soWithVishal.billingAddress,
    shippingAddress: soWithVishal.shippingAddress,
    customer: soWithVishal.customer ? {
      companyName: soWithVishal.customer.companyName,
      billingAddress: soWithVishal.customer.billingAddress,
      shippingAddress: soWithVishal.customer.shippingAddress,
      gstin: soWithVishal.customer.gstin,
      city: soWithVishal.customer.city,
      state: soWithVishal.customer.state
    } : null,
    items: soWithVishal.items.map(i => ({ name: i.productNameSnapshot, code: i.productCodeSnapshot, qty: i.orderedQuantity }))
  } : 'Not found');

  // Also check WorkOrders for Vishal
  const woWithVishal = await prisma.workOrder.findFirst({
    where: {
      OR: [
        { customerName: { contains: 'VISHAL', mode: 'insensitive' } },
        { productionPlan: { salesOrder: { customer: { companyName: { contains: 'VISHAL', mode: 'insensitive' } } } } }
      ]
    },
    include: {
      productionPlan: {
        include: {
          salesOrder: {
            include: {
              customer: true
            }
          }
        }
      }
    }
  });
  console.log('WO with Vishal:', woWithVishal ? {
    id: woWithVishal.id,
    workOrderNumber: woWithVishal.workOrderNumber,
    customerName: woWithVishal.customerName,
    productionPlanSO: woWithVishal.productionPlan?.salesOrder ? {
      orderNumber: woWithVishal.productionPlan.salesOrder.orderNumber,
      billingAddress: woWithVishal.productionPlan.salesOrder.billingAddress,
      shippingAddress: woWithVishal.productionPlan.salesOrder.shippingAddress,
      customer: woWithVishal.productionPlan.salesOrder.customer
    } : null
  } : 'Not found');
}

main().catch(console.error).finally(() => prisma.$disconnect());
