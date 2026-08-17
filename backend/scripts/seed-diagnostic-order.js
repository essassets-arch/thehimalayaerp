const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env.test') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Seeding diagnostic order HCCL/2627/0002 and Finished Goods stock...');

  // 1. Fetch Company & User
  const company = await prisma.company.findFirst();
  const user = await prisma.user.findFirst();
  if (!company || !user) throw new Error('Ensure DB has basic company and user seeded first.');

  // 2. Find Products
  const eldProduct = await prisma.product.findFirst({ where: { sku: 'HIMALAYAFRPMHC300X300ELD' } });
  const ldProduct = await prisma.product.findFirst({ where: { sku: 'HIMALAYAFRPMHC300X300LD' } });
  if (!eldProduct || !ldProduct) throw new Error('Products HIMALAYA FRP MHC are missing in the DB.');

  // 3. Create or Fetch Customer
  let customer = await prisma.customer.findFirst({ where: { companyName: 'xzcsd' } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        companyName: 'xzcsd',
        companyId: company.id,
        email: 'xzcsd@example.com',
        phone: '1234567890',
        creditStatus: 'APPROVED'
      }
    });
  }

  // 4. CLEANUP OLD DIAGNOSTIC DATA
  const cleanOrderNos = ['HCCL/2627/0002', 'SO-FG-STOCK-ELD'];
  for (const num of cleanOrderNos) {
    const existing = await prisma.salesOrder.findFirst({ where: { orderNumber: num } });
    if (existing) {
      // Find plans
      const plan = await prisma.productionPlan.findFirst({ where: { salesOrderId: existing.id } });
      if (plan) {
        // Find work orders
        const wos = await prisma.workOrder.findMany({ where: { productionPlanId: plan.id } });
        for (const wo of wos) {
          await prisma.finishedGoods.deleteMany({ where: { workOrderId: wo.id } });
          await prisma.workOrder.delete({ where: { id: wo.id } });
        }
        await prisma.productionPlan.delete({ where: { id: plan.id } });
      }
      await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: existing.id } });
      await prisma.salesOrder.delete({ where: { id: existing.id } });
    }
  }

  // 5. Create Mock Order SO-FG-STOCK-ELD to back the Finished Goods stock
  const fgOrder = await prisma.salesOrder.create({
    data: {
      orderNumber: 'SO-FG-STOCK-ELD',
      customerId: customer.id,
      createdById: user.id,
      subtotal: 1100,
      taxableAmount: 1100,
      taxAmount: 198,
      totalAmount: 1298,
      status: 'CONFIRMED',
      items: {
        create: [
          {
            productId: eldProduct.id,
            productNameSnapshot: eldProduct.name,
            productCodeSnapshot: eldProduct.sku,
            orderedQuantity: 11,
            unit: 'UNITS',
            unitPrice: 100,
            taxableAmount: 1100,
            lineTotal: 1100,
          }
        ]
      }
    }
  });

  const fgPlan = await prisma.productionPlan.create({
    data: {
      planNumber: 'PLAN-FG-STOCK-ELD',
      salesOrderId: fgOrder.id,
      status: 'APPROVED',
    }
  });

  const fgWo = await prisma.workOrder.create({
    data: {
      workOrderNumber: 'WO-FG-STOCK-ELD',
      productionPlanId: fgPlan.id,
      quantity: 11,
      status: 'COMPLETED',
      productionStatus: 'READY_FOR_DISPATCH',
    }
  });

  const fgStock = await prisma.finishedGoods.create({
    data: {
      workOrderId: fgWo.id,
      productId: eldProduct.id,
      quantity: 11,
      availableQuantity: 11,
      unit: 'UNITS',
      status: 'IN_STOCK',
    }
  });
  console.log('Successfully created FG Stock backed by WO:', fgStock.id);

  const plantApprovedState = await prisma.workflowState.findFirst({
    where: { code: 'PLANT_APPROVED' }
  });

  // 6. Create actual HCCL/2627/0002 order
  const order = await prisma.salesOrder.create({
    data: {
      orderNumber: 'HCCL/2627/0002',
      customerId: customer.id,
      createdById: user.id,
      subtotal: 200,
      taxableAmount: 200,
      taxAmount: 36,
      totalAmount: 236,
      status: 'PLANT_APPROVED',
      workflowStateId: plantApprovedState?.id,
      items: {
        create: [
          {
            productId: eldProduct.id,
            productNameSnapshot: eldProduct.name,
            productCodeSnapshot: eldProduct.sku,
            orderedQuantity: 1,
            unit: 'UNITS',
            unitPrice: 100,
            taxableAmount: 100,
            lineTotal: 100,
          },
          {
            productId: ldProduct.id,
            productNameSnapshot: ldProduct.name,
            productCodeSnapshot: ldProduct.sku,
            orderedQuantity: 1,
            unit: 'UNITS',
            unitPrice: 100,
            taxableAmount: 100,
            lineTotal: 100,
          }
        ]
      }
    }
  });

  const createdOrder = await prisma.salesOrder.findUnique({
    where: { id: order.id },
    include: { items: true }
  });

  const ldItem = createdOrder.items.find(item => item.productId === ldProduct.id);
  if (!ldItem) throw new Error('LD item not found in created order.');

  // Create a production allocation for LD item to represent it as "already committed"
  await prisma.salesOrderAllocation.create({
    data: {
      salesOrderId: order.id,
      salesOrderItemId: ldItem.id,
      allocationType: 'PRODUCTION_REQUIRED',
      requiredQuantity: 1,
      productionQuantity: 1,
    }
  });

  console.log('Successfully created Sales Order HCCL/2627/0002:', order.id);
  console.log('--- DIAGNOSTIC SEEDING COMPLETED SUCCESSFULLY ---');
}

run()
  .catch(err => {
    console.error(err);
  })
  .finally(() => prisma.$disconnect());
