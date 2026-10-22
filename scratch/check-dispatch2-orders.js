const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== CHECKING DISPATCH-2 ORDERS IN DB ===');

  // Check all dispatch records
  const dispatches = await prisma.dispatch.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      salesOrder: {
        include: {
          customer: true,
          quotation: {
            include: { lead: true }
          }
        }
      },
      items: true
    }
  });

  console.log(`Found ${dispatches.length} dispatches:`);
  for (const d of dispatches) {
    console.log({
      dispatchNo: d.dispatchNo,
      status: d.status,
      receivedBy: d.receivedBy,
      receiverPhone: d.receiverPhone,
      driverName: d.driverName,
      dispatchCategory: d.dispatchCategory,
      soNumber: d.salesOrder?.orderNumber,
      soCustomer_company: d.salesOrder?.customer?.companyName,
      soQuotation_lead_company: d.salesOrder?.quotation?.lead?.companyName,
      soQuotation_customerName: d.salesOrder?.quotation?.customerName
    });
  }

  // Check sales orders with trading items or general sales orders
  const salesOrders = await prisma.salesOrder.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      quotation: {
        include: { lead: true }
      },
      items: {
        include: { product: true }
      }
    }
  });

  console.log(`\nFound ${salesOrders.length} recent sales orders:`);
  for (const so of salesOrders) {
    console.log({
      id: so.id,
      orderNumber: so.orderNumber,
      status: so.status,
      customer_company: so.customer?.companyName,
      customer_name: so.customer?.name,
      customer_id: so.customerId,
      quotation_customerName: so.quotation?.customerName,
      quotation_lead_company: so.quotation?.lead?.companyName,
      items: so.items.map(it => ({
        name: it.productNameSnapshot || it.product?.name,
        category: it.product?.dispatchCategory || it.product?.category
      }))
    });
  }

  // Check work orders / finished goods
  const workOrders = await prisma.workOrder.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      salesOrderItem: {
        include: {
          product: true,
          salesOrder: {
            include: {
              customer: true,
              quotation: { include: { lead: true } }
            }
          }
        }
      },
      productionPlan: {
        include: {
          salesOrder: {
            include: {
              customer: true,
              quotation: { include: { lead: true } }
            }
          }
        }
      }
    }
  });

  console.log(`\nFound ${workOrders.length} recent work orders:`);
  for (const wo of workOrders) {
    const so = wo.salesOrderItem?.salesOrder || wo.productionPlan?.salesOrder;
    console.log({
      id: wo.id,
      workOrderNumber: wo.workOrderNumber,
      status: wo.status,
      productionStatus: wo.productionStatus,
      product: wo.productName || wo.salesOrderItem?.productNameSnapshot,
      soNumber: so?.orderNumber,
      soCustomer_company: so?.customer?.companyName,
      soQuotation_lead_company: so?.quotation?.lead?.companyName,
      soQuotation_customerName: so?.quotation?.customerName
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
