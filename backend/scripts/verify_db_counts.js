const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getCounts() {
  const users = await prisma.user.count();
  const roles = await prisma.role.count();
  const permissions = await prisma.permission.count();
  const salesOrders = await prisma.salesOrder.count();
  const dispatches = await prisma.dispatch.count();
  const customers = await prisma.customer.count();
  const products = await prisma.product.count();
  const payments = await prisma.customerPayment.count();
  
  return {
    users,
    roles,
    permissions,
    salesOrders,
    dispatches,
    customers,
    products,
    payments
  };
}

async function main() {
  const counts = await getCounts();
  console.log('=== BASELINE DB COUNTS BEFORE ===');
  console.log(JSON.stringify(counts, null, 2));
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
