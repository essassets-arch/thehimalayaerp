const { PrismaClient } = require('@prisma/client');
const urls = [
  { name: 'Active/Browser Test DB (Port 5432)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
  { name: 'Dev DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public' },
  { name: 'Docker DB (Port 5433)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
  { name: 'Docker DB (Port 5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
];

async function check() {
  for (const entry of urls) {
    const p = new PrismaClient({ datasources: { db: { url: entry.url } } });
    try {
      const u1 = await p.user.findFirst({ where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } } });
      const u2 = await p.user.findFirst({ where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } } });
      console.log(`\n======================================================`);
      console.log(`DATABASE: ${entry.name}`);
      console.log(`URL: ${entry.url.replace(/:[^:@]+@/, ':****@')}`);
      console.log(`======================================================`);
      
      if (u1) {
        const uid = u1.id;
        const leads = await p.lead.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { assignedToId: uid }] } });
        const quotes = await p.quotation.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] } });
        const orders = await p.salesOrder.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] } });
        const samples = await p.sampleRequest.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] } });
        const complaints = await p.customerComplaint.count({ where: { OR: [{ createdBy: uid }, { salesExecutiveId: uid }] } });
        const followups = await p.followUp.count({ where: { createdById: uid } });
        console.log(`  SuperSales 1 (${u1.email}, ID: ${uid}):`);
        console.log(`    Leads: ${leads}, Quotations: ${quotes}, Orders: ${orders}, Samples: ${samples}, Complaints: ${complaints}, FollowUps: ${followups}`);
      } else {
        console.log(`  SuperSales 1: User not found`);
      }

      if (u2) {
        const uid = u2.id;
        const leads = await p.lead.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { assignedToId: uid }] } });
        const quotes = await p.quotation.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] } });
        const orders = await p.salesOrder.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] } });
        const samples = await p.sampleRequest.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] } });
        const complaints = await p.customerComplaint.count({ where: { OR: [{ createdBy: uid }, { salesExecutiveId: uid }] } });
        const followups = await p.followUp.count({ where: { createdById: uid } });
        console.log(`  SuperSales 2 (${u2.email}, ID: ${uid}):`);
        console.log(`    Leads: ${leads}, Quotations: ${quotes}, Orders: ${orders}, Samples: ${samples}, Complaints: ${complaints}, FollowUps: ${followups}`);
      } else {
        console.log(`  SuperSales 2: User not found`);
      }
    } catch (e) {
      console.log(`DATABASE: ${entry.name} -> Connection failed / not reachable: ${e.message}`);
    } finally {
      await p.$disconnect();
    }
  }
}

check();
