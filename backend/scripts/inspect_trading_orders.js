const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectTradingOrders() {
  const tradingProducts = await prisma.product.findMany({
    where: {
      OR: [
        { productType: 'TRADING' },
        { dispatchCategory: 'D2' },
        { category: { in: ['TRADING', 'RCC PIPE', 'FRC COVER', 'COVERBLOCK', 'OTHERS'] } },
      ],
    },
    select: { id: true, sku: true, name: true, productType: true, dispatchCategory: true },
  });

  const tradingProductIds = new Set(tradingProducts.map(p => p.id));
  console.log(`Found ${tradingProducts.length} trading products`);

  const salesOrders = await prisma.salesOrder.findMany({
    where: {
      items: {
        some: {
          productId: { in: Array.from(tradingProductIds) },
        },
      },
    },
    include: {
      customer: true,
      quotation: { include: { lead: true } },
      sourceQuotation: { include: { lead: true } },
      items: { include: { product: true } },
    },
  });

  console.log(`Found ${salesOrders.length} sales orders with trading products:`);
  for (const so of salesOrders) {
    console.log({
      id: so.id,
      orderNumber: so.orderNumber,
      customerNameField: so.customerName,
      customerObject: so.customer ? { id: so.customer.id, companyName: so.customer.companyName } : null,
      quotationCustomerName: so.quotation?.customerName,
      quotationLead: so.quotation?.lead ? { companyName: so.quotation.lead.companyName, projectName: so.quotation.lead.projectName } : null,
      sourceQuotationCustomerName: so.sourceQuotation?.customerName,
      sourceQuotationLead: so.sourceQuotation?.lead ? { companyName: so.sourceQuotation.lead.companyName, projectName: so.sourceQuotation.lead.projectName } : null,
      items: so.items.map(i => ({
        sku: i.product?.sku,
        name: i.productNameSnapshot || i.product?.name,
        qty: i.orderedQuantity,
        isTrading: tradingProductIds.has(i.productId),
      })),
    });
  }

  const workOrders = await prisma.workOrder.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      salesOrderItem: { include: { product: true } },
      productionPlan: {
        include: {
          salesOrder: {
            include: {
              customer: true,
              quotation: { include: { lead: true } },
              sourceQuotation: { include: { lead: true } },
            },
          },
        },
      },
    },
  });

  console.log(`Found ${workOrders.length} sample work orders:`);
  for (const wo of workOrders) {
    console.log({
      id: wo.id,
      workOrderNumber: wo.workOrderNumber,
      customerNameField: wo.customerName,
      customer: wo.customer ? { companyName: wo.customer.companyName } : null,
      soCustomer: wo.productionPlan?.salesOrder?.customer ? { companyName: wo.productionPlan.salesOrder.customer.companyName } : null,
      soLead: wo.productionPlan?.salesOrder?.quotation?.lead ? { companyName: wo.productionPlan.salesOrder.quotation.lead.companyName } : null,
      soSourceLead: wo.productionPlan?.salesOrder?.sourceQuotation?.lead ? { companyName: wo.productionPlan.salesOrder.sourceQuotation.lead.companyName } : null,
    });
  }
}

inspectTradingOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
