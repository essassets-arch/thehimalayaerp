const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reps = await prisma.replacementRequest.findMany({
    include: {
      salesOrder: { include: { customer: true } },
      items: { include: { product: true } }
    }
  });
  console.log('Total Replacements:', reps.length);
  reps.forEach(r => {
    console.log({
      id: r.id,
      requestNumber: r.requestNumber,
      status: r.status,
      dispatchStatus: r.dispatchStatus,
      dispatchDetails: r.dispatchDetails,
      customer: r.salesOrder?.customer?.companyName || r.salesOrder?.customer?.name,
      order: r.salesOrder?.orderNumber
    });
  });
}

main().finally(() => prisma.$disconnect());
