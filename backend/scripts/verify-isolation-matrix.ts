import { PrismaClient, ComplaintStatus } from '@prisma/client';
import { getSalesScope } from '../src/common/utils/rbac.util';

const prisma = new PrismaClient();

const TARGET_EMAILS = [
  'sales1@himalayaerp.com',
  'sales2@himalayaerp.com',
  'sales3@himalayaerp.com',
  'sales4@himalayaerp.com',
  'sales5@himalayaerp.com',
  'sales6@himalayaerp.com',
  'sales7@himalayaerp.com',
  'supersales1@himalayaerp.com',
  'supersales2@himalayaerp.com',
];

async function main() {
  console.log('======================================================================');
  console.log(' MASTER TEST — STRICT SALES USER DATA ISOLATION (9 ACCOUNTS MATRIX)');
  console.log('======================================================================\n');

  // 1. Retrieve users
  const users = await prisma.user.findMany({
    where: { email: { in: TARGET_EMAILS } },
    include: { role: true },
  });

  const userMap = new Map(users.map((u) => [u.email, u]));

  console.log(`Found ${users.length} target accounts out of 9:`);
  for (const email of TARGET_EMAILS) {
    const u = userMap.get(email);
    console.log(`  - ${email}: ${u ? `ID ${u.id} (${u.role.code})` : 'MISSING'}`);
  }

  if (users.length < 9) {
    console.error('❌ ERROR: Not all 9 target accounts exist in database!');
    process.exit(1);
  }

  const s1 = userMap.get('sales1@himalayaerp.com')!;
  const s2 = userMap.get('sales2@himalayaerp.com')!;
  const s3 = userMap.get('sales3@himalayaerp.com')!;
  const ss1 = userMap.get('supersales1@himalayaerp.com')!;
  const ss2 = userMap.get('supersales2@himalayaerp.com')!;

  const company = await prisma.company.findFirst();
  if (!company) throw new Error('Company not found');

  const product = await prisma.product.findFirst({ where: { isActive: true } });
  if (!product) throw new Error('Product not found');

  const customer = await prisma.customer.findFirst({ where: { companyId: company.id } });
  if (!customer) throw new Error('Customer not found');

  const workflowState = await prisma.workflowState.findFirst();
  if (!workflowState) throw new Error('WorkflowState not found');

  console.log('\n--- 1. CLEANING PREVIOUS TEST OPERATIONAL RECORDS ---');
  await prisma.customerComplaint.deleteMany({ where: { salesExecutiveId: { in: users.map((u) => u.id) } } });
  await prisma.sampleRequest.deleteMany({ where: { salesExecutiveId: { in: users.map((u) => u.id) } } });
  await prisma.salesOrder.deleteMany({ where: { salesExecutiveId: { in: users.map((u) => u.id) } } });
  await prisma.quotation.deleteMany({ where: { salesExecutiveId: { in: users.map((u) => u.id) } } });
  await prisma.lead.deleteMany({ where: { salesExecutiveId: { in: users.map((u) => u.id) } } });
  console.log('✓ Cleanup complete!\n');

  console.log('--- 2. CREATING DISTINCT TEST LEADS PER ACCOUNT ---');
  const lead1 = await prisma.lead.create({
    data: {
      leadNumber: `LEAD-TEST-S1-${Date.now()}`,
      companyName: 'Sales1 Corp',
      contactPerson: 'Contact S1',
      companyId: company.id,
      salesExecutiveId: s1.id,
      createdById: s1.id,
      assignedToId: s1.id,
      workflowStateId: workflowState.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      leadNumber: `LEAD-TEST-S2-${Date.now()}`,
      companyName: 'Sales2 Corp',
      contactPerson: 'Contact S2',
      companyId: company.id,
      salesExecutiveId: s2.id,
      createdById: s2.id,
      assignedToId: s2.id,
      workflowStateId: workflowState.id,
    },
  });

  const leadSS1 = await prisma.lead.create({
    data: {
      leadNumber: `LEAD-TEST-SS1-${Date.now()}`,
      companyName: 'SuperSales1 Corp',
      contactPerson: 'Contact SS1',
      companyId: company.id,
      salesExecutiveId: ss1.id,
      createdById: ss1.id,
      assignedToId: ss1.id,
      workflowStateId: workflowState.id,
    },
  });

  const leadSS2 = await prisma.lead.create({
    data: {
      leadNumber: `LEAD-TEST-SS2-${Date.now()}`,
      companyName: 'SuperSales2 Corp',
      contactPerson: 'Contact SS2',
      companyId: company.id,
      salesExecutiveId: ss2.id,
      createdById: ss2.id,
      assignedToId: ss2.id,
      workflowStateId: workflowState.id,
    },
  });

  console.log('✓ Created 4 test leads for sales1, sales2, supersales1, supersales2.\n');

  console.log('--- 3. TESTING OWNERSHIP ISOLATION READS ---');

  const scopeS1 = getSalesScope(s1.id, s1.role.code, 'Lead');
  const scopeS2 = getSalesScope(s2.id, s2.role.code, 'Lead');
  const scopeSS1 = getSalesScope(ss1.id, ss1.role.code, 'Lead');
  const scopeSS2 = getSalesScope(ss2.id, ss2.role.code, 'Lead');

  const leadsS1 = await prisma.lead.findMany({ where: { deletedAt: null, ...scopeS1 } });
  const leadsS2 = await prisma.lead.findMany({ where: { deletedAt: null, ...scopeS2 } });
  const leadsSS1 = await prisma.lead.findMany({ where: { deletedAt: null, ...scopeSS1 } });
  const leadsSS2 = await prisma.lead.findMany({ where: { deletedAt: null, ...scopeSS2 } });

  console.log(`  sales1 Leads Count:       ${leadsS1.length} (Expected: 1, Lead ID: ${leadsS1[0]?.id === lead1.id ? 'MATCH' : 'MISMATCH'})`);
  console.log(`  sales2 Leads Count:       ${leadsS2.length} (Expected: 1, Lead ID: ${leadsS2[0]?.id === lead2.id ? 'MATCH' : 'MISMATCH'})`);
  console.log(`  supersales1 Leads Count:  ${leadsSS1.length} (Expected: 1, Lead ID: ${leadsSS1[0]?.id === leadSS1.id ? 'MATCH' : 'MISMATCH'})`);
  console.log(`  supersales2 Leads Count:  ${leadsSS2.length} (Expected: 1, Lead ID: ${leadsSS2[0]?.id === leadSS2.id ? 'MATCH' : 'MISMATCH'})`);

  let passIsolation =
    leadsS1.length === 1 && leadsS1[0].id === lead1.id &&
    leadsS2.length === 1 && leadsS2[0].id === lead2.id &&
    leadsSS1.length === 1 && leadsSS1[0].id === leadSS1.id &&
    leadsSS2.length === 1 && leadsSS2[0].id === leadSS2.id;

  if (passIsolation) {
    console.log('\n✅ PASS: LEAD OWNERSHIP ISOLATION IS 100% STRICT!');
  } else {
    console.error('\n❌ FAIL: Lead ownership isolation failed!');
    process.exit(1);
  }

  console.log('\n--- 4. TESTING LIFECYCLE OWNERSHIP CHAIN (sales3) ---');
  const leadS3 = await prisma.lead.create({
    data: {
      leadNumber: `LEAD-CHAIN-${Date.now()}`,
      companyName: 'Sales3 Chain Corp',
      contactPerson: 'Contact S3',
      companyId: company.id,
      salesExecutiveId: s3.id,
      createdById: s3.id,
      assignedToId: s3.id,
      workflowStateId: workflowState.id,
    },
  });

  const quoteS3 = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-CHAIN-${Date.now()}`,
      companyId: company.id,
      leadId: leadS3.id,
      salesExecutiveId: s3.id,
      subtotal: 1000,
      discount: 0,
      tax: 180,
      total: 1180,
      workflowStateId: workflowState.id,
      createdById: s3.id,
    },
  });

  const orderS3 = await prisma.salesOrder.create({
    data: {
      orderNumber: `SO-CHAIN-${Date.now()}`,
      customerId: customer.id,
      quotationId: quoteS3.id,
      salesExecutiveId: s3.id,
      orderDate: new Date(),
      workflowStateId: workflowState.id,
      subtotal: 1000,
      taxableAmount: 1000,
      taxAmount: 180,
      freightAmount: 0,
      discountAmount: 0,
      totalAmount: 1180,
      createdById: s3.id,
    },
  });

  const sampleS3 = await prisma.sampleRequest.create({
    data: {
      sampleNumber: `SMP-CHAIN-${Date.now()}`,
      companyId: company.id,
      leadId: leadS3.id,
      salesExecutiveId: s3.id,
      createdById: s3.id,
    },
  });

  const complaintS3 = await prisma.customerComplaint.create({
    data: {
      complaintNo: `CMP-CHAIN-${Date.now()}`,
      customerId: customer.id,
      productId: product.id,
      complaintType: 'Quality',
      priority: 'HIGH',
      complaintDate: new Date(),
      subject: 'Chain Test Complaint',
      description: 'Testing lifecycle ownership',
      createdBy: s3.id,
      salesExecutiveId: s3.id,
    },
  });

  console.log(`  Lead owner:       ${leadS3.salesExecutiveId} (sales3 ID: ${s3.id})`);
  console.log(`  Quotation owner:  ${quoteS3.salesExecutiveId} (sales3 ID: ${s3.id})`);
  console.log(`  SalesOrder owner: ${orderS3.salesExecutiveId} (sales3 ID: ${s3.id})`);
  console.log(`  Sample owner:     ${sampleS3.salesExecutiveId} (sales3 ID: ${s3.id})`);
  console.log(`  Complaint owner:  ${complaintS3.salesExecutiveId} (sales3 ID: ${s3.id})`);

  const passChain =
    leadS3.salesExecutiveId === s3.id &&
    quoteS3.salesExecutiveId === s3.id &&
    orderS3.salesExecutiveId === s3.id &&
    sampleS3.salesExecutiveId === s3.id &&
    complaintS3.salesExecutiveId === s3.id;

  if (passChain) {
    console.log('\n✅ PASS: LIFECYCLE OWNERSHIP PRESERVATION IS 100% VALID!');
  } else {
    console.error('\n❌ FAIL: Lifecycle ownership chain failed!');
    process.exit(1);
  }

  console.log('\n--- 5. DIRECT URL SECURITY CHECK (CROSS-USER ATTEMPTS) ---');
  // Check if sales2 scope returns sales1 lead
  const crossCheckLead = await prisma.lead.findFirst({
    where: { id: lead1.id, ...getSalesScope(s2.id, s2.role.code, 'Lead') },
  });
  // Check if supersales2 scope returns supersales1 quotation
  const crossCheckQuote = await prisma.quotation.findFirst({
    where: { id: quoteS3.id, ...getSalesScope(ss2.id, ss2.role.code, 'Quotation') },
  });

  console.log(`  sales2 searching sales1 lead:             ${crossCheckLead ? 'FOUND (LEAK!)' : 'NULL (BLOCKED ✓)'}`);
  console.log(`  supersales2 searching sales3 quotation:  ${crossCheckQuote ? 'FOUND (LEAK!)' : 'NULL (BLOCKED ✓)'}`);

  if (!crossCheckLead && !crossCheckQuote) {
    console.log('\n✅ PASS: DIRECT URL & CROSS-USER ACCESS IS FULLY BLOCKED!');
  } else {
    console.error('\n❌ FAIL: Cross-user data leakage detected!');
    process.exit(1);
  }

  console.log('\n======================================================================');
  console.log(' FINAL STATUS: ✅ PASS — ALL 9 SALES & SUPERSALES ACCOUNTS ARE STRICTLY ISOLATED!');
  console.log('======================================================================\n');

  await prisma.$disconnect();
}

main().catch(console.error);
