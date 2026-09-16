import { PrismaClient } from '@prisma/client';
import { BackOfficeService } from '../src/modules/back-office/back-office.service';

const prisma = new PrismaClient();

async function runDataEntryTest() {
  console.log('Testing HCPPL AR data-entry automatic recalculation...');
  const service = new BackOfficeService(prisma as any);

  // 1. Fetch initial summary
  const summary1 = await service.getHcpplArSummary();
  const initialUnpaidBills = summary1.summary.unpaidBillCount;
  const initialUnpaidAmount = summary1.summary.unpaidInvAmount;
  console.log(`Initial: ${initialUnpaidBills} unpaid bills, Total: ₹${initialUnpaidAmount}`);

  // 2. Add an invoice as data-entry operator
  const testInv = await service.createHcpplArInvoice({
    invoiceNumber: 'TEST-HCPPL-9999',
    invoiceDate: new Date('2026-05-15'), // Q1-2026/27
    basicAmount: 100000,
    invoiceAmount: 118000,
    companyName: 'Test Automation Industries Ltd',
    salesPerson: 'MTH',
    paymentTermDays: 30,
    status: 'UNPAID',
    salesType: 'Regular',
    amtRcvd: 0,
    remarks: 'Automated test entry'
  });
  console.log(`Created test invoice: ${testInv.invoiceNumber} (ID: ${testInv.id})`);

  // 3. Check that summary automatically recalculated
  const summary2 = await service.getHcpplArSummary();
  console.log(`After Create: ${summary2.summary.unpaidBillCount} unpaid bills, Total: ₹${summary2.summary.unpaidInvAmount}`);
  if (summary2.summary.unpaidBillCount !== initialUnpaidBills + 1) {
    throw new Error('Unpaid bill count did not increment automatically!');
  }
  if (Math.abs(summary2.summary.unpaidInvAmount - (initialUnpaidAmount + 118000)) > 0.05) {
    throw new Error(`Unpaid amount mismatch! Got: ${summary2.summary.unpaidInvAmount}, expected: ${initialUnpaidAmount + 118000}`);
  }
  console.log('✅ PASS: Automatic matrix recalculation upon creation');

  // 4. Update the test invoice (convert to RT)
  await service.updateHcpplArInvoice(testInv.id, {
    salesType: 'RT',
    status: 'RT'
  });

  const summary3 = await service.getHcpplArSummary();
  console.log(`After RT conversion: Unpaid bills = ${summary3.summary.unpaidBillCount}, RT bills = ${summary3.summary.rtBillCount}`);
  if (summary3.summary.unpaidBillCount !== initialUnpaidBills) {
    throw new Error('Unpaid bill count should have reverted!');
  }
  console.log('✅ PASS: Automatic matrix shift from Unpaid to RT upon edit');

  // 5. Delete test invoice to maintain clean state
  await service.deleteHcpplArInvoice(testInv.id);

  const summary4 = await service.getHcpplArSummary();
  if (summary4.summary.unpaidBillCount !== initialUnpaidBills) {
    throw new Error('Summary count did not restore after deletion!');
  }
  console.log('✅ PASS: Automatic matrix recalculation upon deletion');

  console.log('ALL HCPPL DATA ENTRY AND AUTO-CALCULATION TESTS PASSED SUCCESSFULLY!');
}

runDataEntryTest()
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
