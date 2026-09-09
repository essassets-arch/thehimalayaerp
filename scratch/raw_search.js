const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Let's search raw SQL across database for STAR WEIGH
  const searchResults = await prisma.$queryRawUnsafe(`
    SELECT 'SalesOrder' as tbl, id::text, "orderNumber" as ref, remarks as txt FROM "SalesOrder" WHERE "orderNumber" ILIKE '%0142%' OR remarks ILIKE '%STAR%'
    UNION ALL
    SELECT 'Customer', id::text, "companyName", "contactPerson" FROM "Customer" WHERE "companyName" ILIKE '%STAR%' OR "companyName" ILIKE '%WEIGH%'
    UNION ALL
    SELECT 'Lead', id::text, "companyName", "contactPerson" FROM "Lead" WHERE "companyName" ILIKE '%STAR%' OR "projectName" ILIKE '%STAR%'
    UNION ALL
    SELECT 'Quotation', id::text, "quotationNumber", remarks FROM "Quotation" WHERE "quotationNumber" ILIKE '%0142%' OR remarks ILIKE '%STAR%'
  `);
  console.log('Raw SQL search results:', searchResults);

  // Check sales order HCPPL/2627/0142 details
  const so0142 = await prisma.salesOrder.findFirst({
    where: { orderNumber: 'HCPPL/2627/0142' },
    include: {
      items: {
        include: {
          product: true
        }
      },
      customer: true,
      productionPlans: {
        include: {
          workOrders: true
        }
      },
      workflowState: true
    }
  });
  console.log('so0142:', JSON.stringify(so0142, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
