const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== USERS COUNT BY COMPANY ===');
  const userCounts = await prisma.user.groupBy({
    by: ['companyId'],
    _count: { id: true }
  });
  console.log(userCounts);

  console.log('=== EMPLOYEES COUNT BY COMPANY ===');
  const employeeCounts = await prisma.employee.groupBy({
    by: ['companyId'],
    _count: { id: true }
  });
  console.log(employeeCounts);

  console.log('=== ORDERS COUNT BY COMPANY ===');
  // Check if Order table has companyId
  try {
    const orderCounts = await prisma.order.groupBy({
      by: ['companyId'],
      _count: { id: true }
    });
    console.log(orderCounts);
  } catch (e) {
    console.log('Order table does not have companyId or error:', e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
