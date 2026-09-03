const { PrismaClient } = require('@prisma/client');

const databases = [
  { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
  { name: 'Docker DB 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
];

async function verify() {
  for (const db of databases) {
    console.log(`\n============================================================`);
    console.log(` VERIFYING: ${db.name}`);
    console.log(`============================================================`);

    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });

    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
        include: { role: true, company: true }
      });

      if (!user) {
        console.log(`❌ User supersales1@himalayaerp.com not found.`);
        continue;
      }

      console.log(`User: ${user.name} (${user.email}), Role: ${user.role?.name}, Company: ${user.company?.name}`);

      const leads = await prisma.lead.findMany({
        where: {
          OR: [
            { salesExecutiveId: user.id },
            { createdById: user.id },
            { assignedToId: user.id }
          ]
        },
        orderBy: { leadDate: 'asc' }
      });

      console.log(`Total Leads Owned: ${leads.length}`);

      let totalItems = 0;
      let totalValue = 0;
      let withGst = 0;
      let withAddress = 0;

      for (const l of leads) {
        const items = Array.isArray(l.detailedItems) ? l.detailedItems : [];
        totalItems += items.length;
        if (l.gstNumber) withGst++;
        if (l.address && typeof l.address === 'object' && l.address.line1) withAddress++;

        for (const it of items) {
          totalValue += Number(it.grandTotal) || 0;
        }
      }

      console.log(`Total Line Items: ${totalItems}`);
      console.log(`Total Value: ₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
      console.log(`Leads with GST: ${withGst}`);
      console.log(`Leads with structured address: ${withAddress}`);

      // Sample multi-item leads
      const multiItemLeads = leads.filter(l => Array.isArray(l.detailedItems) && l.detailedItems.length > 1);
      console.log(`Multi-item leads count: ${multiItemLeads.length}`);
      
      console.log('\nSample Multi-item Lead (First 3):');
      multiItemLeads.slice(0, 3).forEach(ml => {
        console.log(`- Lead ${ml.leadNumber}: ${ml.projectName} (${ml.detailedItems.length} items) - Date: ${ml.leadDate?.toISOString().substring(0, 10)}`);
        ml.detailedItems.forEach(it => {
          console.log(`    * ${it.product} ${it.size} ${it.capacity} x ${it.quantity} @ ₹${it.unitPrice} => Grand: ₹${it.grandTotal}`);
        });
      });

    } catch (e) {
      console.error(`Verification error in ${db.name}:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

verify();
