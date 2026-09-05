const { PrismaClient } = require('@prisma/client');

async function wipeSuperSales2FromDb(config) {
  console.log(`\n======================================================================`);
  console.log(` 🗑️  WIPING ALL SUPERSALES 2 DATA FROM: ${config.name}`);
  console.log(` URL: ${config.url.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`======================================================================`);

  let prisma;
  try {
    prisma = new PrismaClient({ datasources: { db: { url: config.url } } });
    await prisma.$connect();
  } catch (err) {
    console.warn(`Could not connect to ${config.name}: ${err.message}. Skipping.`);
    return;
  }

  try {
    // 1. Find supersales2 user
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' }
      }
    });

    if (!user) {
      console.log(`❌ User supersales2@himalayaerp.com not found in ${config.name}.`);
      return;
    }
    const userId = user.id;
    console.log(`Resolved User: ${user.name} (${user.email}, ID: ${userId})`);

    // 2. Identify all Leads related to SuperSales 2
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { remarks: 'Imported from Taher Sir Super Sales 2 CSV' }
        ]
      },
      select: { id: true, leadNumber: true }
    });
    const leadIds = leads.map(l => l.id);
    console.log(`Identified ${leadIds.length} leads.`);

    // 3. Identify all Quotations related to SuperSales 2
    const quotations = await prisma.quotation.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          ...(leadIds.length ? [{ leadId: { in: leadIds } }] : []),
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } }
        ]
      },
      select: { id: true, quotationNumber: true }
    });
    const quoteIds = quotations.map(q => q.id);
    console.log(`Identified ${quoteIds.length} quotations.`);

    // 4. Identify all Sales Orders related to SuperSales 2
    const salesOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          ...(quoteIds.length ? [{ quotationId: { in: quoteIds } }] : [])
        ]
      },
      select: { id: true, orderNumber: true }
    });
    const orderIds = salesOrders.map(o => o.id);
    console.log(`Identified ${orderIds.length} sales orders.`);

    // 5. Delete Dispatches & Dispatch Items
    try {
      if (orderIds.length > 0) {
        await prisma.dispatchItem.deleteMany({
          where: { dispatch: { salesOrderId: { in: orderIds } } }
        });
        const delDisp = await prisma.dispatch.deleteMany({
          where: {
            OR: [
              { salesOrderId: { in: orderIds } },
              { createdById: userId }
            ]
          }
        });
        console.log(`  ✓ Deleted ${delDisp.count} dispatches.`);
      }
    } catch (e) {
      console.log(`  - Dispatches: ${e.message}`);
    }

    // 6. Delete Work Orders & Production Plans
    try {
      if (orderIds.length > 0) {
        try {
          await prisma.workOrderItem.deleteMany({
            where: { workOrder: { salesOrderItem: { salesOrderId: { in: orderIds } } } }
          });
        } catch (_) {}

        const delWo = await prisma.workOrder.deleteMany({
          where: {
            OR: [
              { salesOrderItem: { salesOrderId: { in: orderIds } } },
              { createdById: userId }
            ]
          }
        });
        console.log(`  ✓ Deleted ${delWo.count} work orders.`);
      }
    } catch (e) {
      console.log(`  - Work Orders: ${e.message}`);
    }

    // 7. Delete Customer Complaints
    try {
      const delComp = await prisma.customerComplaint.deleteMany({
        where: {
          OR: [
            { createdBy: userId },
            { salesExecutiveId: userId }
          ]
        }
      });
      console.log(`  ✓ Deleted ${delComp.count} customer complaints.`);
    } catch (e) {
      console.log(`  - Complaints: ${e.message}`);
    }

    // 8. Delete Sample Requests
    try {
      const delSamp = await prisma.sampleRequest.deleteMany({
        where: {
          OR: [
            { createdById: userId },
            { salesExecutiveId: userId },
            ...(leadIds.length ? [{ leadId: { in: leadIds } }] : [])
          ]
        }
      });
      console.log(`  ✓ Deleted ${delSamp.count} sample requests.`);
    } catch (e) {
      console.log(`  - Samples: ${e.message}`);
    }

    // 9. Delete Reminders & Notifications
    try {
      const delRem = await prisma.reminder.deleteMany({
        where: {
          OR: [
            { userId: userId },
            { createdById: userId },
            ...(leadIds.length ? [{ leadId: { in: leadIds } }] : [])
          ]
        }
      });
      console.log(`  ✓ Deleted ${delRem.count} reminders.`);
    } catch (_) {}

    try {
      const delNotif = await prisma.notification.deleteMany({
        where: { userId: userId }
      });
      console.log(`  ✓ Deleted ${delNotif.count} notifications.`);
    } catch (_) {}

    // 10. Delete Sales Orders & Items
    if (orderIds.length > 0) {
      try {
        await prisma.salesOrderItem.deleteMany({
          where: { salesOrderId: { in: orderIds } }
        });
      } catch (_) {}

      const delSo = await prisma.salesOrder.deleteMany({
        where: { id: { in: orderIds } }
      });
      console.log(`  ✓ Deleted ${delSo.count} sales orders.`);
    }

    // 11. Delete Quotations, Items & Terms
    if (quoteIds.length > 0) {
      try {
        await prisma.quotationItem.deleteMany({
          where: { quotationId: { in: quoteIds } }
        });
      } catch (_) {}

      try {
        await prisma.quotationTerm.deleteMany({
          where: { quotationId: { in: quoteIds } }
        });
      } catch (_) {}

      const delQ = await prisma.quotation.deleteMany({
        where: { id: { in: quoteIds } }
      });
      console.log(`  ✓ Deleted ${delQ.count} quotations.`);
    }

    // 12. Delete Leads
    if (leadIds.length > 0) {
      const delL = await prisma.lead.deleteMany({
        where: { id: { in: leadIds } }
      });
      console.log(`  ✓ Deleted ${delL.count} leads.`);
    }

    console.log(`🎉 [${config.name}] ALL SUPERSALES 2 DATA HAS BEEN PERMANENTLY REMOVED!`);
  } catch (err) {
    console.error(`❌ Error wiping ${config.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const isDocker = require('fs').existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));
  const targetDbs = isDocker
    ? [{ name: 'Docker Database', url: process.env.DATABASE_URL }]
    : [
        { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
        { name: 'Local Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
        { name: 'Docker Postgres 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
      ];

  for (const db of targetDbs) {
    await wipeSuperSales2FromDb(db);
  }
}

main().catch(console.error);
