const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function run() {
  // Query all leads ordered by id ASC
  const leads = await prisma.lead.findMany({
    orderBy: { id: 'asc' },
    include: {
      salesExecutive: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  console.log(`Successfully fetched ${leads.length} leads from database.`);

  // Write full dataset as JSON file
  fs.writeFileSync('scratch-query-results.json', JSON.stringify(leads, null, 2));
  console.log('Saved full query results to scratch-query-results.json');

  // Format a summary table for the terminal/logs
  const summary = leads.map(l => ({
    id: l.id,
    leadNumber: l.leadNumber,
    leadDate: l.leadDate ? l.leadDate.toISOString().split('T')[0] : 'N/A',
    companyName: l.companyName,
    projectName: l.projectName,
    contactPerson: l.contactPerson,
    phone: l.phone,
    estimatedQuantity: l.estimatedQuantity ? Number(l.estimatedQuantity) : 0,
    salesExecutive: l.salesExecutive ? `${l.salesExecutive.name} (${l.salesExecutive.email})` : 'N/A'
  }));

  console.log('\n--- FIRST 20 LEADS ---');
  console.table(summary.slice(0, 20));
}

run().catch(console.error).finally(() => prisma.$disconnect());
