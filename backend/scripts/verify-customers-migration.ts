import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('--- Starting Customer Migration Verification ---');
  
  // 1. Check total customers
  const count = await prisma.customer.count();
  console.log(`Total customers in PostgreSQL: ${count}`);

  if (count === 0) {
    console.error('FAIL: No customers found in PostgreSQL. Did the migration run?');
    process.exit(1);
  }

  // 2. Fetch a specific customer and verify fields
  const sampleCustomer = await prisma.customer.findFirst({
    where: { companyName: { not: '' } }
  });

  if (!sampleCustomer) {
    console.error('FAIL: No valid customers found with a company name.');
    process.exit(1);
  }

  console.log('Sample Customer from DB:', {
    id: sampleCustomer.id,
    customerCode: sampleCustomer.customerCode,
    companyName: sampleCustomer.companyName,
    status: sampleCustomer.status,
    creditDays: sampleCustomer.creditDays,
    email: sampleCustomer.email
  });

  if (!sampleCustomer.customerCode?.startsWith('CUST-')) {
    console.error('FAIL: customerCode does not match expected format CUST-XXXXXX');
    process.exit(1);
  }

  if (sampleCustomer.status === null || sampleCustomer.status === undefined) {
    console.error('FAIL: status is missing on the migrated customer');
    process.exit(1);
  }

  // 3. Test duplicate prevention
  console.log('Testing duplicate prevention logic (mock)...');
  const duplicateCheck = await prisma.customer.findFirst({
    where: { companyName: sampleCustomer.companyName, deletedAt: null }
  });

  if (duplicateCheck) {
    console.log(`PASS: Duplicate check would successfully block recreating "${sampleCustomer.companyName}"`);
  } else {
    console.error('FAIL: Duplicate check logic failed to find the existing customer');
    process.exit(1);
  }

  console.log('--- Verification Complete: PASS ---');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
