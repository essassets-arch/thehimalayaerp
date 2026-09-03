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
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      quotation: {
        include: {
          lead: true
        }
      },
      sourceQuotation: {
        include: {
          lead: true
        }
      },
      productionPlans: true
    }
  });

  console.log('--- RECENT SALES ORDERS ---');
  orders.forEach(o => {
    console.log({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      customerId: o.customerId,
      customerCompany: o.customer?.companyName,
      customerName: o.customer?.name,
      quotationLeadCompany: o.quotation?.lead?.companyName,
      sourceQuotationLeadCompany: o.sourceQuotation?.lead?.companyName,
      quotationLeadCustName: o.quotation?.lead?.customerName,
      productionPlansCount: o.productionPlans?.length
    });
  });

  const workOrders = await prisma.workOrder.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      productionPlan: {
        include: {
          salesOrder: {
            include: {
              customer: true,
              quotation: { include: { lead: true } },
              sourceQuotation: { include: { lead: true } }
            }
          }
        }
      }
    }
  });

  console.log('\n--- RECENT WORK ORDERS ---');
  workOrders.forEach(w => {
    const so = w.productionPlan?.salesOrder;
    const custName =
      so?.customer?.companyName ||
      so?.customer?.name ||
      so?.quotation?.lead?.companyName ||
      so?.sourceQuotation?.lead?.companyName ||
      so?.quotation?.lead?.customerName ||
      so?.sourceQuotation?.lead?.customerName;
    console.log({
      id: w.id,
      workOrderNumber: w.workOrderNumber,
      status: w.status,
      productionPlanId: w.productionPlanId,
      salesOrderNumber: so?.orderNumber,
      resolvedCustomerName: custName
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
