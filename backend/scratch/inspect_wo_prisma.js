require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const wo = await prisma.workOrder.findFirst({
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

  console.log('Sample WO:', {
    id: wo?.id,
    workOrderNumber: wo?.workOrderNumber,
    productName: wo?.productName,
    productionPlan: wo?.productionPlan ? {
      id: wo.productionPlan.id,
      salesOrderId: wo.productionPlan.salesOrderId,
      salesOrder: wo.productionPlan.salesOrder ? {
        orderNumber: wo.productionPlan.salesOrder.orderNumber,
        billingAddress: wo.productionPlan.salesOrder.billingAddress,
        shippingAddress: wo.productionPlan.salesOrder.shippingAddress,
        customer: wo.productionPlan.salesOrder.customer ? {
          companyName: wo.productionPlan.salesOrder.customer.companyName,
          billingAddress: wo.productionPlan.salesOrder.customer.billingAddress,
          shippingAddress: wo.productionPlan.salesOrder.customer.shippingAddress,
          gstin: wo.productionPlan.salesOrder.customer.gstin
        } : null
      } : null
    } : null
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
