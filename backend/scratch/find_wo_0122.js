require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const so0122 = await prisma.salesOrder.findFirst({
    where: { orderNumber: { contains: '0122' } },
    include: {
      productionPlans: {
        include: {
          workOrders: true
        }
      }
    }
  });
  console.log('SO 0122 production plans:', so0122?.productionPlans);

  // Find all work orders in DB
  const count = await prisma.workOrder.count();
  console.log('Total work orders:', count);

  // Find work order with FRPMHCLD 28X28
  const w = await prisma.workOrder.findFirst({
    where: {
      salesOrderItem: {
        productNameSnapshot: { contains: 'FRPMHCLD 28X28' }
      }
    },
    include: {
      productionPlan: {
        include: {
          salesOrder: {
            include: { customer: true }
          }
        }
      },
      salesOrderItem: true
    }
  });
  console.log('FRPMHCLD 28X28 WO:', w ? {
    id: w.id,
    workOrderNumber: w.workOrderNumber,
    so: w.productionPlan?.salesOrder?.orderNumber,
    customer: w.productionPlan?.salesOrder?.customer?.companyName,
    customerBilling: w.productionPlan?.salesOrder?.customer?.billingAddress,
    customerGstin: w.productionPlan?.salesOrder?.customer?.gstin,
    soBilling: w.productionPlan?.salesOrder?.billingAddress,
    item: w.salesOrderItem?.productNameSnapshot,
    qty: w.salesOrderItem?.orderedQuantity
  } : 'none');
}

main().catch(console.error).finally(() => prisma.$disconnect());
