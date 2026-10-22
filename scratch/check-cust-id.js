const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const custId = 'a4f5abc1-89d7-4860-aa7a-1b915119ea46';
  const customer = await prisma.customer.findUnique({
    where: { id: custId },
    include: {
      salesOrders: true,
      payments: true,
      ledgers: true,
      complaints: true
    }
  });

  console.log('Customer lookup:', customer ? customer.companyName : 'NOT FOUND');
  if (customer) {
    console.log(`Orders: ${customer.salesOrders.length}, Payments: ${customer.payments.length}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
