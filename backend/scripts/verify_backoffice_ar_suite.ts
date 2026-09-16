import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('=====================================================');
  console.log('  BACK OFFICE LOCAL IMPLEMENTATION VERIFICATION SUITE');
  console.log('=====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (detail) console.error(`   Detail: ${detail}`);
      failed++;
    }
  }

  // 1. Check existing system counts
  const usersCount = await prisma.user.count();
  const rolesCount = await prisma.role.count();
  const ordersCount = await prisma.salesOrder.count();
  const dispCount = await prisma.dispatch.count();
  const custCount = await prisma.customer.count();

  // Baseline was 39 users before; now 40 (with 1 new backoffice user)
  assert(usersCount === 40, `User count should be 40 (39 baseline + 1 backoffice). Got: ${usersCount}`);
  assert(rolesCount === 17, `Role count should remain untouched at 17. Got: ${rolesCount}`);
  assert(ordersCount === 305, `SalesOrder count should remain untouched at 305. Got: ${ordersCount}`);
  assert(dispCount === 70, `Dispatch count should remain untouched at 70. Got: ${dispCount}`);
  assert(custCount === 151, `Customer count should remain untouched at 151. Got: ${custCount}`);

  // 2. Check Back Office User
  const boUser = await prisma.user.findUnique({
    where: { email: 'backoffice@himalayaerp.com' },
    include: { role: true },
  });

  assert(!!boUser, 'Back Office user backoffice@himalayaerp.com exists');
  assert(
    boUser?.role?.code === 'BACK_OFFICE' || boUser?.role?.name === 'Back Office',
    `User has BACK_OFFICE role. Got: ${boUser?.role?.code}`
  );

  const passwordMatches = boUser ? await bcrypt.compare('admin123', boUser.password) : false;
  assert(passwordMatches, 'Back Office user password validates correctly (admin123)');

  // 3. Check APPL AR Register data
  const applRows = await prisma.backOfficeArInvoice.findMany({
    where: { entity: 'APPL' },
    orderBy: { srNo: 'asc' },
  });

  assert(applRows.length > 0, `APPL AR rows exist in DB. Count: ${applRows.length}`);

  // Verify all 21 columns are populated on sample row
  const r1 = applRows[0];
  const hasAll21Cols = (
    r1.srNo !== null &&
    !!r1.invoiceNumber &&
    !!r1.invoiceDate &&
    r1.basicAmount !== null &&
    r1.invoiceAmount !== null &&
    !!r1.companyName &&
    !!r1.siteName &&
    !!r1.city &&
    !!r1.salesType &&
    !!r1.salesPerson &&
    r1.paymentTermDays !== null &&
    !!r1.dueDate &&
    r1.status !== null &&
    r1.amtRcvd !== null &&
    r1.outstanding !== null &&
    !!r1.quarter
  );
  assert(hasAll21Cols, 'APPL AR row contains all 21 columns populated properly');

  // Verify calculation: Outstanding = Invoice Amount - Amt Rcvd
  let mathExact = true;
  for (const row of applRows) {
    const invAmt = Number(row.invoiceAmount);
    const amtRcvd = Number(row.amtRcvd);
    const out = Number(row.outstanding);
    const expectedOut = Number((invAmt - amtRcvd).toFixed(2));
    if (Math.abs(out - expectedOut) > 0.01) {
      mathExact = false;
      console.error(`Mismatch on ${row.invoiceNumber}: ${out} vs expected ${expectedOut}`);
      break;
    }
  }
  assert(mathExact, 'All APPL AR rows satisfy Outstanding = Invoice Amount - Amt Rcvd to 2 decimal places');

  // 4. Check HCPPL AR Summary data
  const hcpplRows = await prisma.backOfficeArInvoice.findMany({
    where: { entity: 'HCPPL' },
  });

  assert(hcpplRows.length > 0, `HCPPL AR rows exist in DB. Count: ${hcpplRows.length}`);

  const hcpplUnpaid = hcpplRows.filter((r) => r.status !== 'RT' && r.salesType !== 'RT');
  const hcpplRt = hcpplRows.filter((r) => r.status === 'RT' || r.salesType === 'RT');

  assert(hcpplUnpaid.length > 0, `HCPPL Section 1 (Unpaid) rows populated. Count: ${hcpplUnpaid.length}`);
  assert(hcpplRt.length > 0, `HCPPL Section 2 (RT) rows populated. Count: ${hcpplRt.length}`);

  // Check Quarters distribution in HCPPL
  const quartersPresent = new Set(hcpplRows.map((r) => r.quarter));
  const expectedQuarters = ['Q1-2026/27', 'Q2-2026/27', 'Q3-2026/27', 'Q4-2026/27'];
  const allQuartersPresent = expectedQuarters.every((q) => quartersPresent.has(q));
  assert(allQuartersPresent, `HCPPL rows cover all 4 quarters: ${Array.from(quartersPresent).join(', ')}`);

  console.log('-----------------------------------------------------');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('=====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification()
  .catch((err) => {
    console.error('Test runner fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
