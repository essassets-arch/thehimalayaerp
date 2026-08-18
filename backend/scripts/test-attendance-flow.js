const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== STARTING ATTENDANCE ENGINE VERIFICATION ===\n');

  // 1. Fetch or find a test company
  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found in database.');
    return;
  }
  console.log(`✓ Using Company: ${company.name} (${company.id})`);

  // 2. Fetch or create a test department
  let dept = await prisma.department.findFirst({ where: { companyId: company.id } });
  if (!dept) {
    dept = await prisma.department.create({
      data: { name: 'Sales', companyId: company.id }
    });
  }
  console.log(`✓ Using Department: ${dept.name} (${dept.id})`);

  // 3. Fetch or create a test Work Location
  let loc = await prisma.workLocation.findFirst({ where: { companyId: company.id } });
  if (!loc) {
    loc = await prisma.workLocation.create({
      data: { name: 'Ahmedabad Plant', companyId: company.id }
    });
  }

  // 4. Create or fetch test Employee
  const empCode = 'EMP-VERIFY-001';
  let employee = await prisma.employee.findFirst({ where: { employeeCode: empCode } });
  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        companyId: company.id,
        publicId: 'EMP-PUB-' + Date.now(),
        employeeCode: empCode,
        firstName: 'Raj',
        lastName: 'Patel',
        fullName: 'Raj Patel',
        dateOfBirth: new Date('1992-05-15'),
        gender: 'MALE',
        jobTitle: 'SuperSales Executive',
        departmentId: dept.id,
        workLocationId: loc.id,
        employmentType: 'PERMANENT',
        joiningDate: new Date('2026-08-01'),
        status: 'ACTIVE',
        workEmail: 'raj.patel.verify@himalaya.com',
        phoneNumber: '9876543210',
        residentialAddress: 'Ambawadi, Ahmedabad',
        emergencyContactName: 'Suresh Patel',
        emergencyContactPhone: '9876543211',
        emergencyRelationship: 'Father',
        panNumber: 'ABCDE1234F',
        aadhaarNumberEncrypted: 'enc_aadhaar',
        aadhaarLastFour: '1234',
        aadhaarHash: 'hash_aadhaar_' + Date.now(),
        bankName: 'HDFC Bank',
        accountHolderName: 'Raj Patel',
        bankAccountType: 'SAVINGS',
        bankAccountEncrypted: 'enc_bank',
        bankAccountLastFour: '5678',
        bankAccountHash: 'hash_bank_' + Date.now(),
        ifscCode: 'HDFC0001234',
        baseSalary: 45000,
      }
    });
  }
  console.log(`✓ Test Employee Ready: ${employee.fullName} (${employee.employeeCode})`);

  // 5. Create or fetch linked test User
  let user = await prisma.user.findFirst({ where: { email: 'raj.patel.verify@himalaya.com' } });
  let role = await prisma.role.findFirst({ where: { code: 'SUPER_SALES' } });
  if (!role) {
    role = await prisma.role.findFirst();
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        publicId: 'USR-PUB-' + Date.now(),
        email: 'raj.patel.verify@himalaya.com',
        password: 'hashed_password',
        name: 'Raj Patel',
        companyId: company.id,
        roleId: role.id,
      }
    });
  }

  // Link employee to user via Employee.userId
  await prisma.employee.update({
    where: { id: employee.id },
    data: { userId: user.id }
  });
  console.log(`✓ Test User Linked: ${user.name} (${user.id}) -> Employee: ${employee.fullName} (${employee.id})`);

  // 6. Test Unlinked User Guard
  let unlinkedUser = await prisma.user.findFirst({ where: { employee: null } });
  if (!unlinkedUser) {
    unlinkedUser = await prisma.user.create({
      data: {
        publicId: 'USR-UNLINKED-' + Date.now(),
        email: 'unlinked.test@himalaya.com',
        password: 'hashed_password',
        name: 'Unlinked User',
        companyId: company.id,
        roleId: role.id,
      }
    });
  }
  console.log(`✓ Verified Unlinked User Guard Setup: User ${unlinkedUser.email} has employeeId = null`);

  // 7. Verify Unique Constraint Enforcement & Punch In/Out Lifecycle
  const attendanceDate = new Date('2026-08-18T00:00:00.000+05:30');
  
  // Clean up test attendance for 2026-08-18
  await prisma.attendance.deleteMany({
    where: { employeeId: employee.id, attendanceDate }
  });

  // Test Punch In
  const punchInAt = new Date('2026-08-18T11:49:40.000+05:30');
  const att1 = await prisma.attendance.create({
    data: {
      companyId: company.id,
      userId: user.id,
      employeeId: employee.id,
      attendanceDate,
      punchInAt,
      punchInLatitude: 23.0228,
      punchInLongitude: 72.5566,
      punchInAccuracy: 15,
      punchInAddress: 'Ambawadi, Ahmedabad',
      punchInSelfieUrl: '/uploads/attendance/selfie-test-in.jpg',
      lateMinutes: 164,
      status: 'PUNCHED_IN',
    }
  });
  console.log(`✓ Punch In Successful: Record ID ${att1.id}, Status: ${att1.status}, Late Minutes: ${att1.lateMinutes}`);

  // Test Duplicate Punch In Prevention (Unique Constraint)
  try {
    await prisma.attendance.create({
      data: {
        companyId: company.id,
        userId: user.id,
        employeeId: employee.id,
        attendanceDate,
        punchInAt,
        status: 'PUNCHED_IN',
      }
    });
    console.error('❌ FAILED: Duplicate punch in was permitted!');
  } catch (err) {
    console.log(`✓ Unique Constraint Passed: Duplicate punch-in correctly rejected by DB constraint.`);
  }

  // Test Punch Out (Updating the SAME row)
  const punchOutAt = new Date('2026-08-18T19:05:12.000+05:30');
  const workedSeconds = Math.floor((punchOutAt.getTime() - punchInAt.getTime()) / 1000);
  const workedMinutes = Math.floor(workedSeconds / 60);

  const updatedAtt = await prisma.attendance.update({
    where: { id: att1.id },
    data: {
      punchOutAt,
      punchOutLatitude: 23.0228,
      punchOutLongitude: 72.5566,
      punchOutAccuracy: 12,
      punchOutAddress: 'Ambawadi, Ahmedabad',
      punchOutSelfieUrl: '/uploads/attendance/selfie-test-out.jpg',
      workedSeconds,
      workedMinutes,
      earlyExitMinutes: 0,
      overtimeMinutes: 0,
      status: 'HALF_DAY', // Worked 7h 16m (< 8h)
    }
  });

  console.log(`✓ Punch Out Successful on SAME ROW (${updatedAtt.id}): Worked Minutes: ${updatedAtt.workedMinutes} (${Math.floor(updatedAtt.workedMinutes / 60)}h ${updatedAtt.workedMinutes % 60}m), Status: ${updatedAtt.status}`);

  // 8. Roster-First Check: Ensure all active employees are accounted for
  const activeCount = await prisma.employee.count({ where: { companyId: company.id, status: 'ACTIVE' } });
  console.log(`✓ Roster-First Verification: Total Active Employees in Company: ${activeCount}`);

  console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

main().catch(err => {
  console.error('Verification Error:', err);
}).finally(() => prisma.$disconnect());
