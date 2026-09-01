const { PrismaClient } = require('@prisma/client');

async function verifySuperSales1() {
  const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

  try {
    const user = await p.user.findFirst({
      where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } }
    });

    if (!user) {
      console.log('SuperSales 1 user not found.');
      return;
    }

    console.log(`=== SuperSales 1 Profile ===`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`ID: ${user.id}`);

    const leads = await p.lead.findMany({
      where: {
        OR: [
          { createdById: user.id },
          { salesExecutiveId: user.id },
          { assignedToId: user.id }
        ]
      },
      orderBy: { leadNumber: 'asc' }
    });

    console.log(`\n=== Imported Leads Summary ===`);
    console.log(`Total Leads: ${leads.length}`);
    const totalItems = leads.reduce((acc, l) => acc + (Array.isArray(l.detailedItems) ? l.detailedItems.length : 0), 0);
    console.log(`Total Line Items: ${totalItems}`);
    console.log(`Lead Number Range: ${leads[0]?.leadNumber} -> ${leads[leads.length - 1]?.leadNumber}`);

    let totalValue = 0;
    for (const l of leads) {
      const items = Array.isArray(l.detailedItems) ? l.detailedItems : [];
      for (const it of items) {
        totalValue += Number(it.grandTotal || 0);
      }
    }
    console.log(`Total Pipeline / Grand Total Value: ₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    console.log(`\nSample First 5 Leads:`);
    leads.slice(0, 5).forEach((l, i) => {
      const items = Array.isArray(l.detailedItems) ? l.detailedItems : [];
      console.log(`  #${i+1}: [${l.leadNumber}] ${l.companyName} | ${items.length} items | Date: ${l.leadDate?.toISOString().substring(0, 10)} | Contact: ${l.contactPerson} (${l.phone})`);
    });

    console.log(`\nSample Last 5 Leads:`);
    leads.slice(-5).forEach((l, i) => {
      const items = Array.isArray(l.detailedItems) ? l.detailedItems : [];
      console.log(`  #${leads.length - 5 + i + 1}: [${l.leadNumber}] ${l.companyName} | ${items.length} items | Date: ${l.leadDate?.toISOString().substring(0, 10)} | Contact: ${l.contactPerson} (${l.phone})`);
    });

  } catch (e) {
    console.error('Error during verification:', e);
  } finally {
    await p.$disconnect();
  }
}

verifySuperSales1();
