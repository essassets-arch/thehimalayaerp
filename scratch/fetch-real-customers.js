const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    where: {
      status: 'ACTIVE',
      NOT: {
        companyName: {
          in: ['MENVOC INFRASTRUCTURE', 'SHYAM SOHAM REALTY', 'Test Customer', 'Sample Customer', 'Consignee Client']
        }
      }
    },
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      shippingAddress: true,
      billingAddress: true,
      gstin: true,
      phone: true
    },
    take: 60
  });

  console.log(`Found ${customers.length} distinct active real customers.`);
  customers.slice(0, 35).forEach((c, i) => {
    let addr = c.shippingAddress || c.billingAddress;
    if (typeof addr === 'object' && addr !== null) {
      addr = `${addr.line1 || ''}, ${addr.city || ''}, ${addr.state || 'Gujarat'} ${addr.pincode || ''}`.replace(/^, /, '').trim();
    }
    console.log(`${i + 1}. ID: ${c.id}`);
    console.log(`   Company: ${c.companyName}`);
    console.log(`   Contact: ${c.contactPerson || 'N/A'}`);
    console.log(`   Address: ${addr || 'Gujarat, India'}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
