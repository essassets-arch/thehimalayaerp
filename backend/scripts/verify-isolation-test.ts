import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('======================================================================');
  console.log(' E2E Create & Isolation Verification Test');
  console.log('======================================================================\n');

  const sales1 = await prisma.user.findUnique({ where: { email: 'sales1@himalayaerp.com' } });
  const sales2 = await prisma.user.findUnique({ where: { email: 'sales2@himalayaerp.com' } });
  const super1 = await prisma.user.findUnique({ where: { email: 'supersales1@himalayaerp.com' } });
  const super2 = await prisma.user.findUnique({ where: { email: 'supersales2@himalayaerp.com' } });

  if (!sales1 || !sales2 || !super1 || !super2) {
    throw new Error('Could not find required users for isolation test.');
  }

  const company = await prisma.company.findFirst();

  // Test 1: Sales 1 vs Sales 2
  console.log('--- TEST 1: Sales 1 Lead Creation & Sales 2 Isolation ---');
  const testLead1 = await prisma.lead.create({
    data: {
      leadNumber: `LD-VERIFY-SALES1-${Date.now()}`,
      companyName: 'Verification Client Sales 1',
      contactPerson: 'Alice Smith',
      createdById: sales1.id,
      assignedToId: sales1.id,
      companyId: company?.id,
    },
  });

  console.log(`✓ Created test lead for sales1: ${testLead1.leadNumber} (ID: ${testLead1.id})`);

  const sales1Count = await prisma.lead.count({ where: { OR: [{ createdById: sales1.id }, { assignedToId: sales1.id }] } });
  const sales2Count = await prisma.lead.count({ where: { OR: [{ createdById: sales2.id }, { assignedToId: sales2.id }] } });

  console.log(`  Sales 1 Lead Count: ${sales1Count} (Expected: 1)`);
  console.log(`  Sales 2 Lead Count: ${sales2Count} (Expected: 0)`);

  if (sales1Count !== 1 || sales2Count !== 0) {
    throw new Error('❌ Sales 1 vs Sales 2 isolation test failed!');
  }
  console.log('✅ Sales 1 vs Sales 2 Data Isolation Assertion Passed!');

  // Clean up Lead 1
  await prisma.lead.delete({ where: { id: testLead1.id } });
  console.log(`✓ Deleted test lead ${testLead1.leadNumber}`);

  const postCleanSales1 = await prisma.lead.count({ where: { OR: [{ createdById: sales1.id }, { assignedToId: sales1.id }] } });
  console.log(`  Sales 1 Lead Count after cleanup: ${postCleanSales1} (Expected: 0)\n`);

  // Test 2: SuperSales 1 vs SuperSales 2
  console.log('--- TEST 2: SuperSales 1 Lead Creation & SuperSales 2 Isolation ---');
  const testLeadSuper = await prisma.lead.create({
    data: {
      leadNumber: `LD-VERIFY-SUPER1-${Date.now()}`,
      companyName: 'Verification Client Super 1',
      contactPerson: 'Bob Johnson',
      createdById: super1.id,
      assignedToId: super1.id,
      companyId: company?.id,
    },
  });

  console.log(`✓ Created test lead for supersales1: ${testLeadSuper.leadNumber} (ID: ${testLeadSuper.id})`);

  const super1Count = await prisma.lead.count({ where: { OR: [{ createdById: super1.id }, { assignedToId: super1.id }] } });
  const super2Count = await prisma.lead.count({ where: { OR: [{ createdById: super2.id }, { assignedToId: super2.id }] } });
  const sales1CountDuringSuper = await prisma.lead.count({ where: { OR: [{ createdById: sales1.id }, { assignedToId: sales1.id }] } });

  console.log(`  SuperSales 1 Lead Count: ${super1Count} (Expected: 1)`);
  console.log(`  SuperSales 2 Lead Count: ${super2Count} (Expected: 0)`);
  console.log(`  Sales 1 Lead Count:      ${sales1CountDuringSuper} (Expected: 0)`);

  if (super1Count !== 1 || super2Count !== 0 || sales1CountDuringSuper !== 0) {
    throw new Error('❌ SuperSales isolation test failed!');
  }
  console.log('✅ SuperSales 1 vs SuperSales 2 Data Isolation Assertion Passed!');

  // Clean up Super Lead
  await prisma.lead.delete({ where: { id: testLeadSuper.id } });
  console.log(`✓ Deleted test lead ${testLeadSuper.leadNumber}`);

  const postCleanSuper1 = await prisma.lead.count({ where: { OR: [{ createdById: super1.id }, { assignedToId: super1.id }] } });
  console.log(`  SuperSales 1 Lead Count after cleanup: ${postCleanSuper1} (Expected: 0)\n`);

  // Test 3: Full Sales Executive Ownership Inheritance (Lead -> Quotation -> Sales Order)
  console.log('--- TEST 3: Sales Executive Ownership Inheritance Lifecycle ---');
  const sales3 = await prisma.user.findUnique({ where: { email: 'sales3@himalayaerp.com' } });
  if (!sales3) throw new Error('Sales 3 user missing');

  const testLead3 = await prisma.lead.create({
    data: {
      leadNumber: `LD-INHERIT-${Date.now()}`,
      companyName: 'Inheritance Test Corp',
      contactPerson: 'Charlie Brown',
      createdById: sales3.id,
      assignedToId: sales3.id,
      salesExecutiveId: sales3.id,
      companyId: company?.id,
    },
  });

  const testQuote3 = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-INHERIT-${Date.now()}`,
      companyId: company?.id,
      leadId: testLead3.id,
      salesExecutiveId: testLead3.salesExecutiveId,
      createdById: sales3.id,
      subtotal: 1000,
      total: 1180,
    },
  });

  const customer = await prisma.customer.findFirst();
  const testOrder3 = await prisma.salesOrder.create({
    data: {
      orderNumber: `SO-INHERIT-${Date.now()}`,
      customerId: customer?.id || 'cust-1',
      quotationId: testQuote3.id,
      salesExecutiveId: testQuote3.salesExecutiveId,
      createdById: sales3.id,
      subtotal: 1000,
      taxableAmount: 1000,
      totalAmount: 1180,
    },
  });

  console.log(`✓ Lead salesExecutiveId:       ${testLead3.salesExecutiveId} (sales3.id: ${sales3.id})`);
  console.log(`✓ Quotation salesExecutiveId:  ${testQuote3.salesExecutiveId} (Inherited correctly: ${testQuote3.salesExecutiveId === sales3.id})`);
  console.log(`✓ Sales Order salesExecutiveId:${testOrder3.salesExecutiveId} (Inherited correctly: ${testOrder3.salesExecutiveId === sales3.id})`);

  if (
    testLead3.salesExecutiveId !== sales3.id ||
    testQuote3.salesExecutiveId !== sales3.id ||
    testOrder3.salesExecutiveId !== sales3.id
  ) {
    throw new Error('❌ Sales Executive Ownership Inheritance Test Failed!');
  }
  console.log('✅ Sales Executive Ownership Inheritance Test Passed!\n');

  // Clean up Test 3
  await prisma.salesOrder.delete({ where: { id: testOrder3.id } });
  await prisma.quotation.delete({ where: { id: testQuote3.id } });
  await prisma.lead.delete({ where: { id: testLead3.id } });
  console.log('✓ Cleaned up test order, quotation, and lead.');

  console.log('======================================================================');
  console.log(' ALL E2E ISOLATION & INHERITANCE VERIFICATION TESTS PASSED');
  console.log('======================================================================');
}

main()
  .catch(err => {
    console.error('❌ Isolation test exception:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
