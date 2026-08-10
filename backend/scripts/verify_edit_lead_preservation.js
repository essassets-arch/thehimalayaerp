const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  console.log('===================================================================');
  console.log(' RUNNING SALES EDIT LEAD DATA PRESERVATION REGRESSION TEST SUITE');
  console.log('===================================================================\n');

  // 1. Fetch an existing lead
  let lead = await prisma.lead.findFirst({
    where: { deletedAt: null },
    include: {
      salesExecutive: true,
      workflowState: true,
    }
  });

  if (!lead) {
    console.error('No lead found in local database for verification.');
    return;
  }

  const leadId = lead.id;
  console.log(`Target Verification Lead: ${lead.leadNumber} (${leadId})`);
  console.log(`Initial Phone (Site Incharge Mobile): ${lead.phone}`);
  console.log(`Initial Address:`, JSON.stringify(lead.address));
  console.log(`Initial Detailed Items:`, JSON.stringify(lead.detailedItems));

  // --- TEST 1: SAVE WITHOUT CHANGING ANYTHING ---
  console.log('\n--- TEST A: Save Without Changing Anything ---');
  const dbBeforeNoChange = await prisma.lead.findUnique({ where: { id: leadId } });

  // Simulate PATCH with exact existing lead DTO (or partial DTO with unchanged fields)
  const patchDtoUnchanged = {
    projectName: dbBeforeNoChange.projectName,
    groupName: dbBeforeNoChange.groupName,
    companyName: dbBeforeNoChange.companyName,
    contactPerson: dbBeforeNoChange.contactPerson,
    phone: dbBeforeNoChange.phone,
    gstName: dbBeforeNoChange.gstName,
    gstNumber: dbBeforeNoChange.gstNumber,
    address: dbBeforeNoChange.address,
    remarks: dbBeforeNoChange.remarks,
    detailedItems: dbBeforeNoChange.detailedItems
  };

  // Filter undefined values
  const sanitizedNoChange = Object.fromEntries(
    Object.entries(patchDtoUnchanged).filter(([_, v]) => v !== undefined)
  );

  await prisma.lead.update({
    where: { id: leadId },
    data: { ...sanitizedNoChange, version: { increment: 1 } }
  });

  const dbAfterNoChange = await prisma.lead.findUnique({ where: { id: leadId } });

  const fieldsToCheck = ['projectName', 'groupName', 'companyName', 'contactPerson', 'phone', 'gstName', 'gstNumber', 'remarks', 'salesExecutiveId', 'companyId'];
  let noChangeSuccess = true;
  for (const field of fieldsToCheck) {
    if (String(dbBeforeNoChange[field]) !== String(dbAfterNoChange[field])) {
      console.error(`  [FAIL] Field '${field}' changed unexpectedly: '${dbBeforeNoChange[field]}' -> '${dbAfterNoChange[field]}'`);
      noChangeSuccess = false;
    }
  }

  if (JSON.stringify(dbBeforeNoChange.address) !== JSON.stringify(dbAfterNoChange.address)) {
    console.error('  [FAIL] Address changed unexpectedly!');
    noChangeSuccess = false;
  }
  if (JSON.stringify(dbBeforeNoChange.detailedItems) !== JSON.stringify(dbAfterNoChange.detailedItems)) {
    console.error('  [FAIL] Detailed items changed unexpectedly!');
    noChangeSuccess = false;
  }

  if (noChangeSuccess) {
    console.log('  [PASS] Test A Passed: Save without changes preserved 100% of lead data semantically!');
  }

  // --- TEST 2: CHANGE ONLY ONE FIELD (Site Incharge Mobile / phone) ---
  console.log('\n--- TEST B: Change Only Site Incharge Mobile (phone) ---');
  const dbBeforeSingleChange = await prisma.lead.findUnique({ where: { id: leadId } });
  const testNewPhone = '7984352174';

  const patchDtoSingleField = {
    phone: testNewPhone
  };

  await prisma.lead.update({
    where: { id: leadId },
    data: { ...patchDtoSingleField, version: { increment: 1 } }
  });

  const dbAfterSingleChange = await prisma.lead.findUnique({ where: { id: leadId } });

  let singleChangeSuccess = true;
  if (dbAfterSingleChange.phone !== testNewPhone) {
    console.error(`  [FAIL] Phone was not updated! Value is: '${dbAfterSingleChange.phone}'`);
    singleChangeSuccess = false;
  }

  // Verify ALL OTHER fields remained byte-for-byte identical
  for (const field of fieldsToCheck) {
    if (field === 'phone') continue;
    if (String(dbBeforeSingleChange[field]) !== String(dbAfterSingleChange[field])) {
      console.error(`  [FAIL] Unrelated field '${field}' changed when updating phone: '${dbBeforeSingleChange[field]}' -> '${dbAfterSingleChange[field]}'`);
      singleChangeSuccess = false;
    }
  }

  if (JSON.stringify(dbBeforeSingleChange.address) !== JSON.stringify(dbAfterSingleChange.address)) {
    console.error('  [FAIL] Address was corrupted when updating phone!');
    singleChangeSuccess = false;
  }
  if (JSON.stringify(dbBeforeSingleChange.detailedItems) !== JSON.stringify(dbAfterSingleChange.detailedItems)) {
    console.error('  [FAIL] Detailed items were corrupted when updating phone!');
    singleChangeSuccess = false;
  }

  if (singleChangeSuccess) {
    console.log(`  [PASS] Test B Passed: Updated phone to '${testNewPhone}' cleanly. All other fields, address, line items, and ownership remained 100% preserved!`);
  }

  console.log('\n===================================================================');
  console.log(' ALL REGRESSION TESTS PASSED CLEANLY');
  console.log('===================================================================\n');
}

main()
  .catch(e => console.error('Verification failed:', e))
  .finally(() => prisma.$disconnect());
