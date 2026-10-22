const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sos = await prisma.salesOrder.findMany({
    where: {
      orderNumber: { in: ['HCPPL/2627/0308', 'SO-TRD-091567'] }
    },
    include: {
      customer: true,
      quotation: {
        include: {
          lead: true
        }
      }
    }
  });

  for (const so of sos) {
    console.log(`Order: ${so.orderNumber}`);
    console.log(`Customer: ${so.customer?.companyName}`);
    console.log(`Quotation Lead: ${so.quotation?.lead?.companyName}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
