const { PrismaClient } = require('@prisma/client');

const dbUrl = process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public';
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function auditAllSalesUsers() {
  console.log(`\n========================================================================`);
  console.log(`FULL SALES TEAM AUDIT ACROSS ALL USERS`);
  console.log(`========================================================================`);

  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { email: 'asc' }
  });

  const report = [];

  for (const u of users) {
    const leadCount = await prisma.lead.count({
      where: {
        OR: [
          { salesExecutiveId: u.id },
          { createdById: u.id },
          { assignedToId: u.id }
        ]
      }
    });

    const quoteCount = await prisma.quotation.count({
      where: {
        OR: [
          { salesExecutiveId: u.id },
          { createdById: u.id }
        ]
      }
    });

    const orderCount = await prisma.salesOrder.count({
      where: {
        OR: [
          { salesExecutiveId: u.id },
          { createdById: u.id }
        ]
      }
    });

    const dispatchCount = await prisma.dispatch.count({
      where: {
        salesOrder: {
          OR: [
            { salesExecutiveId: u.id },
            { createdById: u.id }
          ]
        }
      }
    });

    if (leadCount > 0 || quoteCount > 0 || orderCount > 0 || dispatchCount > 0 || u.role?.name?.toLowerCase().includes('sales') || u.email.includes('sales')) {
      report.push({
        'Name': u.name,
        'Email': u.email,
        'Role': u.role?.name || 'N/A',
        'Leads': leadCount,
        'Quotations': quoteCount,
        'Sales Orders': orderCount,
        'Dispatches': dispatchCount
      });
    }
  }

  console.table(report);
  await prisma.$disconnect();
}

auditAllSalesUsers();
