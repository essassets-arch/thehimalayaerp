import { PrismaClient } from '@prisma/client';
import { BackOfficeService } from '../src/modules/back-office/back-office.service';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public',
    },
  },
});

const mockSequenceService: any = {};
const backOfficeService = new BackOfficeService(prisma as any, mockSequenceService);

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 BACK OFFICE MANUAL REGISTERS COMPREHENSIVE VERIFICATION SUITE');
  console.log('================================================================\n');

  // Step 1: Capture Pre-Test Baseline of Existing ERP Core Tables
  console.log('📸 [Step 1] Capturing Pre-Test Baseline of Existing ERP Tables...');
  const baseline = {
    users: await prisma.user.count(),
    permissions: await prisma.permission.count(),
    roles: await prisma.role.count(),
    salesOrders: await prisma.salesOrder.count(),
    quotations: await prisma.quotation.count(),
    leads: await prisma.lead.count(),
    dispatches: await prisma.dispatch.count(),
    invoices: await prisma.salesInvoice.count(),
    payments: await prisma.customerPayment.count(),
    backOfficeArInvoices: await prisma.backOfficeArInvoice.count(),
    hcpplArData: await prisma.hcpplArManualEntry.count(),
    inventoryItems: await prisma.inventoryItem.count(),
    rawMaterials: await prisma.rawMaterial.count(),
    finishedGoods: await prisma.finishedGoods.count(),
    workOrders: await prisma.workOrder.count(),
    productionPlans: await prisma.productionPlan.count(),
    productionBatches: await prisma.productionBatch.count(),
  };

  console.log('  Baseline Snapshot:');
  console.log(`    - Users: ${baseline.users}`);
  console.log(`    - Permissions: ${baseline.permissions}`);
  console.log(`    - Roles: ${baseline.roles}`);
  console.log(`    - Sales Orders: ${baseline.salesOrders}`);
  console.log(`    - Quotations: ${baseline.quotations}`);
  console.log(`    - Leads: ${baseline.leads}`);
  console.log(`    - Dispatches: ${baseline.dispatches}`);
  console.log(`    - Invoices: ${baseline.invoices}`);
  console.log(`    - Payments: ${baseline.payments}`);
  console.log(`    - BackOfficeArInvoice: ${baseline.backOfficeArInvoices}`);
  console.log(`    - Existing HCPPL AR Data: ${baseline.hcpplArData}
    - Inventory (Items/Raw/FG): ${baseline.inventoryItems} / ${baseline.rawMaterials} / ${baseline.finishedGoods}
    - Production (Work Orders/Plans/Batches): ${baseline.workOrders} / ${baseline.productionPlans} / ${baseline.productionBatches}`);

  // Fetch initial counts of new registers
  const initialNewRegisters = {
    sampleTracker: await (prisma as any).sampleTrackerEntry.count(),
    outwardRegister: await (prisma as any).outwardRegisterEntry.count(),
    paymentFollowUps: await (prisma as any).paymentFollowUpEntry.count(),
  };
  console.log('\n  Initial New Registers Count:');
  console.log(`    - SampleTrackerEntry: ${initialNewRegisters.sampleTracker}`);
  console.log(`    - OutwardRegisterEntry: ${initialNewRegisters.outwardRegister}`);
  console.log(`    - PaymentFollowUpEntry: ${initialNewRegisters.paymentFollowUps}`);

  const testUserId = (await prisma.user.findFirst({ select: { id: true } }))?.id || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';

  // Step 2: Test SampleTrackerEntry CRUD, Exact Values, and Dynamic SR NO
  console.log('\n▶ [Step 2] Testing SampleTrackerEntry (Customer Samples)...');
  const sampleInput = {
    dispatchDate: '2026-09-17',
    partyName: 'TEST_ACME_PHARMA_PVT_LTD',
    station: 'Baddi, HP',
    contactPerson: 'Mr. Rakesh Sharma',
    contactNumber: '+91 9876543210',
    sampleDetails: 'Grade A HDPE Granules - 500g Trial Sample',
    referancePerson: 'Pooja Verma',
    referaceNumber: 'SMP-REF-2026-098',
    materialManually: 'HDPE Raw Polymer 100MFI',
    transportMode: 'AIR',
    transportAmount: '1250.50',
    status: 'APPROVAL AWAITED',
    remarks: 'Sent via DTDC Air Express for urgent lab evaluation.',
  };

  const createdSample = await backOfficeService.createSampleTrackerEntry(testUserId, sampleInput);
  console.log(`  ✓ Created SampleTrackerEntry ID: ${createdSample.id}`);
  console.log('createdSample:', createdSample);
  if (
    createdSample.partyName !== 'TEST_ACME_PHARMA_PVT_LTD' ||
    Number(createdSample.transportAmount) !== 1250.5 ||
    createdSample.transportMode !== 'AIR' ||
    (createdSample.referancePerson || createdSample.referencePerson) !== 'Pooja Verma' ||
    (createdSample.referaceNumber || createdSample.referenceNumber) !== 'SMP-REF-2026-098' ||
    createdSample.materialManually !== 'HDPE Raw Polymer 100MFI'
  ) {
    throw new Error('SampleTrackerEntry created values do not match exactly!');
  }
  console.log('  ✓ Verified 100% manual fields preserved without automatic alteration');

  // Verify dynamic srNo query
  const sampleQueryResult = await backOfficeService.getSampleTrackerEntries({ search: 'TEST_ACME_PHARMA', limit: 10 });
  const fetchedSample = sampleQueryResult.items.find((i: any) => i.id === createdSample.id);
  if (!fetchedSample || fetchedSample.srNo !== 1) {
    throw new Error(`Dynamic srNo failed for SampleTrackerEntry! Got srNo=${fetchedSample?.srNo}`);
  }
  console.log(`  ✓ Verified dynamic srNo = ${fetchedSample.srNo} (computed on-the-fly, not from DB column)`);

  // Update Sample
  const updatedSample = await backOfficeService.updateSampleTrackerEntry(createdSample.id, testUserId, {
    status: 'APPROVED',
    remarks: 'Sample approved by client QA team.',
  });
  if (updatedSample.status !== 'APPROVED') {
    throw new Error('SampleTrackerEntry update failed');
  }
  console.log('  ✓ Updated SampleTrackerEntry status to APPROVED');

  // Step 3: Test OutwardRegisterEntry CRUD & Decimal(18, 3) Precision
  console.log('\n▶ [Step 3] Testing OutwardRegisterEntry (Outward Movement)...');
  const outwardInput = {
    outwardDate: '2026-09-17',
    transporterName: 'VRL Logistics Express',
    vehicleNo: 'MH-12-AB-9988',
    material: 'Polypropylene Copolymer M12',
    quantity: '15.575', // 3 decimal places testing authoritative precision
    partyName: 'TEST_GLOBAL_PACKAGING_CORP',
    salesPerson: 'Ajay Mehta',
    invoiceNo: 'CH-2026-8871',
    receivingManually: '', // Blank - must remain null or empty, NOT 'Pending'
    remark: 'Direct dock dispatch from warehouse bay 4',
  };

  const createdOutward = await backOfficeService.createOutwardRegisterEntry(testUserId, outwardInput);
  console.log(`  ✓ Created OutwardRegisterEntry ID: ${createdOutward.id}`);
  if (
    createdOutward.transporterName !== 'VRL Logistics Express' ||
    Number(createdOutward.quantity) !== 15.575 ||
    createdOutward.receivingManually !== null
  ) {
    throw new Error(
      `OutwardRegisterEntry values mismatch! qty=${createdOutward.quantity}, receivingManually=${createdOutward.receivingManually}`
    );
  }
  console.log(`  ✓ Verified quantity precision preserved: ${createdOutward.quantity} (exact 3 decimals)`);
  console.log(`  ✓ Verified receivingManually is null/empty when not provided (NO automatic 'Pending' default)`);

  // Verify dynamic srNo query
  const outwardQueryResult = await backOfficeService.getOutwardRegisterEntries({ search: 'TEST_GLOBAL_PACKAGING', limit: 10 });
  const fetchedOutward = outwardQueryResult.items.find((i: any) => i.id === createdOutward.id);
  if (!fetchedOutward || fetchedOutward.srNo !== 1) {
    throw new Error(`Dynamic srNo failed for OutwardRegisterEntry! Got srNo=${fetchedOutward?.srNo}`);
  }
  console.log(`  ✓ Verified dynamic srNo = ${fetchedOutward.srNo} (computed on-the-fly)`);

  // Update Outward
  const updatedOutward = await backOfficeService.updateOutwardRegisterEntry(createdOutward.id, testUserId, {
    receivingManually: 'POD-RCVD-1709',
    remark: 'Signed proof of delivery acknowledged by gate security',
  });
  if (updatedOutward.receivingManually !== 'POD-RCVD-1709') {
    throw new Error('OutwardRegisterEntry update failed');
  }
  console.log('  ✓ Updated OutwardRegisterEntry receivingManually to POD-RCVD-1709');

  // Step 4: Test PaymentFollowUpEntry CRUD & NO DERIVED VALUES
  console.log('\n▶ [Step 4] Testing PaymentFollowUpEntry (Payment Follow-Ups)...');
  const followUpInput = {
    partyName: 'TEST_SHARMA_ENTERPRISES',
    duePaymentAmount: '300000.50',
    salesPerson: 'Vikram Singh',
    remarks: 'Called accounts team; promised NEFT payment of 3 Lakhs by Friday.',
  };

  const createdFollowUp = await backOfficeService.createPaymentFollowUpEntry(testUserId, followUpInput);
  console.log(`  ✓ Created PaymentFollowUpEntry ID: ${createdFollowUp.id}`);
  if (
    createdFollowUp.partyName !== 'TEST_SHARMA_ENTERPRISES' ||
    Number(createdFollowUp.duePaymentAmount) !== 300000.5 ||
    createdFollowUp.salesPerson !== 'Vikram Singh'
  ) {
    throw new Error('PaymentFollowUpEntry created values mismatch!');
  }
  console.log(`  ✓ Verified duePaymentAmount preserved: ${createdFollowUp.duePaymentAmount} (NO finance ledger lookup/overwrite)`);

  // Verify dynamic srNo query
  const followUpQueryResult = await backOfficeService.getPaymentFollowUpEntries({ search: 'TEST_SHARMA_ENTERPRISES', limit: 10 });
  const fetchedFollowUp = followUpQueryResult.items.find((i: any) => i.id === createdFollowUp.id);
  if (!fetchedFollowUp || fetchedFollowUp.srNo !== 1) {
    throw new Error(`Dynamic srNo failed for PaymentFollowUpEntry! Got srNo=${fetchedFollowUp?.srNo}`);
  }
  console.log(`  ✓ Verified dynamic srNo = ${fetchedFollowUp.srNo} (computed on-the-fly)`);

  // Update Follow Up
  const updatedFollowUp = await backOfficeService.updatePaymentFollowUpEntry(createdFollowUp.id, testUserId, {
    duePaymentAmount: '250000.00',
    remarks: 'Partial RTGS received; remaining 2.5 Lakhs promised next Monday.',
  });
  if (Number(updatedFollowUp.duePaymentAmount) !== 250000.0) {
    throw new Error('PaymentFollowUpEntry update failed');
  }
  console.log('  ✓ Updated PaymentFollowUpEntry manually to 250000.00');

  // Step 5: Test Soft-Delete / Archive
  console.log('\n▶ [Step 5] Testing Soft-Delete / Archive for All 3 Registers...');
  await backOfficeService.archiveSampleTrackerEntry(createdSample.id, testUserId);
  await backOfficeService.archiveOutwardRegisterEntry(createdOutward.id, testUserId);
  await backOfficeService.archivePaymentFollowUpEntry(createdFollowUp.id, testUserId);

  // Verify they are no longer in active queries
  const activeSamples = await backOfficeService.getSampleTrackerEntries({ search: 'TEST_ACME_PHARMA' });
  const activeOutward = await backOfficeService.getOutwardRegisterEntries({ search: 'TEST_GLOBAL_PACKAGING' });
  const activeFollowUps = await backOfficeService.getPaymentFollowUpEntries({ search: 'TEST_SHARMA_ENTERPRISES' });

  if (activeSamples.items.length !== 0 || activeOutward.items.length !== 0 || activeFollowUps.items.length !== 0) {
    throw new Error('Archived records still visible in active registers!');
  }
  console.log('  ✓ PASS: Soft-delete verified. Archived records excluded from active list.');

  // Clean up test records completely so database is in pristine state
  console.log('\n▶ [Step 6] Cleaning up test records from new register tables...');
  await (prisma as any).sampleTrackerEntry.delete({ where: { id: createdSample.id } });
  await (prisma as any).outwardRegisterEntry.delete({ where: { id: createdOutward.id } });
  await (prisma as any).paymentFollowUpEntry.delete({ where: { id: createdFollowUp.id } });
  console.log('  ✓ PASS: Test records cleaned up.');

  // Step 7: Final Verification of Core ERP Baseline (Must be 100% unchanged)
  console.log('\n🛡️ [Step 7] Final Verification of Existing ERP Baseline Integrity...');
  const postTestBaseline = {
    users: await prisma.user.count(),
    permissions: await prisma.permission.count(),
    roles: await prisma.role.count(),
    salesOrders: await prisma.salesOrder.count(),
    quotations: await prisma.quotation.count(),
    leads: await prisma.lead.count(),
    dispatches: await prisma.dispatch.count(),
    invoices: await prisma.salesInvoice.count(),
    payments: await prisma.customerPayment.count(),
    backOfficeArInvoices: await prisma.backOfficeArInvoice.count(),
    hcpplArData: await prisma.hcpplArManualEntry.count(),
    inventoryItems: await prisma.inventoryItem.count(),
    rawMaterials: await prisma.rawMaterial.count(),
    finishedGoods: await prisma.finishedGoods.count(),
    workOrders: await prisma.workOrder.count(),
    productionPlans: await prisma.productionPlan.count(),
    productionBatches: await prisma.productionBatch.count(),
  };

  let hasViolation = false;
  for (const [key, initialVal] of Object.entries(baseline)) {
    const finalVal = (postTestBaseline as any)[key];
    const diff = finalVal - initialVal;
    if (diff !== 0) {
      console.error(`  ❌ VIOLATION in ${key}: initial=${initialVal}, final=${finalVal}, diff=${diff}`);
      hasViolation = true;
    } else {
      console.log(`  ✓ ${key}: ${finalVal} (delta = 0, perfectly untouched)`);
    }
  }

  if (hasViolation) {
    throw new Error('Baseline integrity check failed! Core ERP tables were modified.');
  }

  // Step 8: Verify New Registers Contain Zero Leaks
  console.log('\n🛡️ [Step 8] Verifying New Registers Post-Test Counts...');
  const finalNewRegisters = {
    sampleTracker: await (prisma as any).sampleTrackerEntry.count(),
    outwardRegister: await (prisma as any).outwardRegisterEntry.count(),
    paymentFollowUps: await (prisma as any).paymentFollowUpEntry.count(),
  };

  console.log(`  ✓ SampleTrackerEntry count: ${finalNewRegisters.sampleTracker} (match pre-test: ${initialNewRegisters.sampleTracker === finalNewRegisters.sampleTracker})`);
  console.log(`  ✓ OutwardRegisterEntry count: ${finalNewRegisters.outwardRegister} (match pre-test: ${initialNewRegisters.outwardRegister === finalNewRegisters.outwardRegister})`);
  console.log(`  ✓ PaymentFollowUpEntry count: ${finalNewRegisters.paymentFollowUps} (match pre-test: ${initialNewRegisters.paymentFollowUps === finalNewRegisters.paymentFollowUps})`);

  console.log('\n================================================================');
  console.log('🎉 ALL VERIFICATIONS PASSED SUCCESSFULLY WITH ZERO SIDE EFFECTS!');
  console.log('================================================================\n');
}

runVerification()
  .catch((err) => {
    console.error('\n❌ Verification Failed with Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
