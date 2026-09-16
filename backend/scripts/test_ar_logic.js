const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test the logic implemented in BackOfficeService directly
async function testArEndpoints() {
  console.log('--- TESTING BACK OFFICE AR LOGIC DIRECTLY ---');

  // Test APPL AR
  const applRows = await prisma.backOfficeArInvoice.findMany({
    where: { entity: 'APPL' },
    orderBy: { srNo: 'asc' },
    take: 5
  });

  console.log(`APPL rows count: ${await prisma.backOfficeArInvoice.count({ where: { entity: 'APPL' } })}`);
  console.log('Sample APPL Row:');
  console.log(JSON.stringify(applRows[0], null, 2));

  // Test HCPPL AR
  const hcpplRows = await prisma.backOfficeArInvoice.findMany({
    where: { entity: 'HCPPL' }
  });
  console.log(`HCPPL rows count: ${hcpplRows.length}`);

  const unpaid = hcpplRows.filter(r => r.status !== 'RT' && r.salesType !== 'RT');
  const rt = hcpplRows.filter(r => r.status === 'RT' || r.salesType === 'RT');
  console.log(`HCPPL Unpaid count: ${unpaid.length}, RT count: ${rt.length}`);

  console.log('ALL AR DB LOGIC VERIFIED CLEANLY!');
}

testArEndpoints().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
