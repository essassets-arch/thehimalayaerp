import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// Try standard connection string or fallback to docker port 5435
const dbUrl = process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public';
const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl }
  }
});

async function main() {
  console.log('--- INSERTING/ENSURING HR & SUPERADMIN USERS & DEPARTMENTS ---');
  console.log(`Connecting to: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`);

  // 1. Ensure Company exists
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        publicId: 'COMP-000001',
        name: 'Himalaya ERP Company',
      },
    });
    console.log(`Created Company: ${company.name} (${company.id})`);
  } else {
    console.log(`Found Company: ${company.name} (${company.id})`);
  }

  // 2. Ensure Work Location exists
  let workLocation = await prisma.workLocation.findFirst({
    where: { companyId: company.id }
  });
  if (!workLocation) {
    workLocation = await prisma.workLocation.create({
      data: {
        companyId: company.id,
        code: 'LOC-HQ',
        name: 'Headquarters',
        isActive: true,
      }
    });
    console.log(`Created Work Location: ${workLocation.name}`);
  }

  // 3. Ensure Departments
  // 3a. HR Department
  let hrDept = await prisma.department.findFirst({
    where: {
      companyId: company.id,
      OR: [{ code: 'DEPT-HR' }, { name: 'HR Department' }, { name: 'Human Resources' }, { name: 'HR' }]
    }
  });
  if (!hrDept) {
    hrDept = await prisma.department.create({
      data: {
        companyId: company.id,
        code: 'DEPT-HR',
        name: 'HR Department',
        isActive: true,
      }
    });
    console.log(`Created Department: HR Department (${hrDept.id})`);
  } else {
    hrDept = await prisma.department.update({
      where: { id: hrDept.id },
      data: { name: 'HR Department', isActive: true }
    });
    console.log(`Updated Department: ${hrDept.name} (${hrDept.id})`);
  }

  // 3b. Super Admin Department
  let superAdminDept = await prisma.department.findFirst({
    where: {
      companyId: company.id,
      OR: [{ code: 'DEPT-SUPER-ADMIN' }, { name: 'Super Admin Department' }, { name: 'Executive Management' }, { name: 'Administration' }]
    }
  });
  if (!superAdminDept) {
    superAdminDept = await prisma.department.create({
      data: {
        companyId: company.id,
        code: 'DEPT-SUPER-ADMIN',
        name: 'Super Admin Department',
        isActive: true,
      }
    });
    console.log(`Created Department: Super Admin Department (${superAdminDept.id})`);
  } else {
    superAdminDept = await prisma.department.update({
      where: { id: superAdminDept.id },
      data: { name: 'Super Admin Department', isActive: true }
    });
    console.log(`Updated Department: ${superAdminDept.name} (${superAdminDept.id})`);
  }

  // 4. Ensure Roles
  // 4a. HR Role
  let hrRole = await prisma.role.findFirst({
    where: { OR: [{ code: 'HR' }, { name: 'HR' }] }
  });
  if (!hrRole) {
    hrRole = await prisma.role.create({
      data: {
        publicId: 'ROLE-HR',
        code: 'HR',
        name: 'HR',
      }
    });
    console.log(`Created Role: HR (${hrRole.id})`);
  } else {
    console.log(`Found Role: ${hrRole.name} (${hrRole.code})`);
  }

  // 4b. Super Admin Role
  let superAdminRole = await prisma.role.findFirst({
    where: { OR: [{ code: 'SUPER_ADMIN' }, { name: 'Super Admin' }] }
  });
  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        publicId: 'ROLE-SUPER-ADMIN',
        code: 'SUPER_ADMIN',
        name: 'Super Admin',
      }
    });
    console.log(`Created Role: Super Admin (${superAdminRole.id})`);
  } else {
    console.log(`Found Role: ${superAdminRole.name} (${superAdminRole.code})`);
  }

  // 5. Insert / Update HR User: hr@himalayaerp.com / HR@hcppl
  const hrEmail = 'hr@himalayaerp.com';
  const hrPlainPassword = 'HR@hcppl';
  const hrHashedPassword = await bcrypt.hash(hrPlainPassword, 12);

  let hrUser = await prisma.user.findUnique({
    where: { email: hrEmail },
  });

  if (!hrUser) {
    hrUser = await prisma.user.create({
      data: {
        publicId: `USR-HR-${Date.now()}`,
        email: hrEmail,
        password: hrHashedPassword,
        name: 'Nahin V',
        roleId: hrRole.id,
        companyId: company.id,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }
    });
    console.log(`✅ Created HR User: ${hrUser.email} (Name: ${hrUser.name})`);
  } else {
    hrUser = await prisma.user.update({
      where: { id: hrUser.id },
      data: {
        name: 'Nahin V',
        password: hrHashedPassword,
        roleId: hrRole.id,
        companyId: company.id,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }
    });
    console.log(`✅ Updated HR User: ${hrUser.email} (Password reset to: ${hrPlainPassword})`);
  }

  // Ensure Employee profile for HR User
  let hrEmployee = await prisma.employee.findFirst({
    where: { OR: [{ userId: hrUser.id }, { workEmail: hrEmail }] }
  });
  if (!hrEmployee) {
    const randomAadhaar = String(Math.floor(100000000000 + Math.random() * 900000000000));
    const randomPan = 'ABCDE' + String(Math.floor(1000 + Math.random() * 9000)) + 'F';
    const randBank = String(Math.floor(1000000000 + Math.random() * 9000000000));
    hrEmployee = await prisma.employee.create({
      data: {
        publicId: `EMP-${Date.now()}-HR`,
        companyId: company.id,
        userId: hrUser.id,
        employeeCode: `EMP-HR-001`,
        firstName: 'Nahin',
        lastName: 'V',
        fullName: 'Nahin V',
        dateOfBirth: new Date('1995-01-01'),
        gender: 'MALE',
        jobTitle: 'HR Executive',
        departmentId: hrDept.id,
        workLocationId: workLocation.id,
        employmentType: 'PERMANENT',
        joiningDate: new Date('2024-01-01'),
        status: 'ACTIVE',
        workEmail: hrEmail,
        phoneNumber: '9876543210',
        residentialAddress: 'Himalaya HQ',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '9876543211',
        emergencyRelationship: 'Family',
        panNumber: randomPan,
        aadhaarNumberEncrypted: 'encrypted',
        aadhaarLastFour: randomAadhaar.slice(-4),
        aadhaarHash: crypto.createHash('sha256').update(randomAadhaar).digest('hex'),
        bankName: 'HDFC Bank',
        accountHolderName: 'Nahin V',
        bankAccountType: 'SAVINGS',
        bankAccountEncrypted: 'encrypted',
        bankAccountLastFour: randBank.slice(-4),
        bankAccountHash: crypto.createHash('sha256').update(randBank).digest('hex'),
        ifscCode: 'HDFC0001234',
        baseSalary: 45000,
      }
    });
    console.log(`✅ Created Employee record for Nahin V in ${hrDept.name}`);
  } else {
    await prisma.employee.update({
      where: { id: hrEmployee.id },
      data: {
        userId: hrUser.id,
        departmentId: hrDept.id,
        jobTitle: 'HR Executive',
        status: 'ACTIVE',
      }
    });
    console.log(`✅ Linked Employee record for Nahin V in ${hrDept.name}`);
  }

  // 6. Insert / Update Super Admin User: super.admin@himalayaerp.com / SuperAdmin@hcppl
  const superAdminEmail = 'super.admin@himalayaerp.com';
  const superAdminPass = 'SuperAdmin@hcppl';
  const superAdminHashedPassword = await bcrypt.hash(superAdminPass, 12);

  let superAdminUser = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!superAdminUser) {
    superAdminUser = await prisma.user.create({
      data: {
        publicId: `USR-SA-${Date.now()}`,
        email: superAdminEmail,
        password: superAdminHashedPassword,
        name: 'Super Admin',
        roleId: superAdminRole.id,
        companyId: company.id,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }
    });
    console.log(`✅ Created Super Admin User: ${superAdminUser.email}`);
  } else {
    superAdminUser = await prisma.user.update({
      where: { id: superAdminUser.id },
      data: {
        name: 'Super Admin',
        password: superAdminHashedPassword,
        roleId: superAdminRole.id,
        companyId: company.id,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }
    });
    console.log(`✅ Updated Super Admin User: ${superAdminUser.email} (Password set to: ${superAdminPass})`);
  }

  // Also ensure superadmin@himalayaerp.com exists as alias if needed
  const altSuperAdminEmail = 'superadmin@himalayaerp.com';
  let altSuperAdminUser = await prisma.user.findUnique({ where: { email: altSuperAdminEmail } });
  if (!altSuperAdminUser) {
    altSuperAdminUser = await prisma.user.create({
      data: {
        publicId: `USR-SA-ALT-${Date.now()}`,
        email: altSuperAdminEmail,
        password: superAdminHashedPassword,
        name: 'Super Admin',
        roleId: superAdminRole.id,
        companyId: company.id,
        isActive: true,
      }
    });
    console.log(`✅ Created Alias Super Admin User: ${altSuperAdminEmail}`);
  } else {
    await prisma.user.update({
      where: { id: altSuperAdminUser.id },
      data: {
        password: superAdminHashedPassword,
        roleId: superAdminRole.id,
        isActive: true,
      }
    });
    console.log(`✅ Updated Alias Super Admin User: ${altSuperAdminEmail}`);
  }

  // Ensure Employee profile for Super Admin
  let superAdminEmployee = await prisma.employee.findFirst({
    where: { OR: [{ userId: superAdminUser.id }, { workEmail: superAdminEmail }] }
  });
  if (!superAdminEmployee) {
    const randomAadhaar = String(Math.floor(100000000000 + Math.random() * 900000000000));
    const randomPan = 'ABCDE' + String(Math.floor(1000 + Math.random() * 9000)) + 'A';
    const randBank = String(Math.floor(1000000000 + Math.random() * 9000000000));
    superAdminEmployee = await prisma.employee.create({
      data: {
        publicId: `EMP-${Date.now()}-SA`,
        companyId: company.id,
        userId: superAdminUser.id,
        employeeCode: `EMP-SA-001`,
        firstName: 'Super',
        lastName: 'Admin',
        fullName: 'Super Admin',
        dateOfBirth: new Date('1985-01-01'),
        gender: 'MALE',
        jobTitle: 'Super Administrator',
        departmentId: superAdminDept.id,
        workLocationId: workLocation.id,
        employmentType: 'PERMANENT',
        joiningDate: new Date('2020-01-01'),
        status: 'ACTIVE',
        workEmail: superAdminEmail,
        phoneNumber: '9876500001',
        residentialAddress: 'Himalaya Corporate Office',
        emergencyContactName: 'HQ Contact',
        emergencyContactPhone: '9876500002',
        emergencyRelationship: 'Corporate',
        panNumber: randomPan,
        aadhaarNumberEncrypted: 'encrypted',
        aadhaarLastFour: randomAadhaar.slice(-4),
        aadhaarHash: crypto.createHash('sha256').update(randomAadhaar).digest('hex'),
        bankName: 'HDFC Bank',
        accountHolderName: 'Super Admin',
        bankAccountType: 'SAVINGS',
        bankAccountEncrypted: 'encrypted',
        bankAccountLastFour: randBank.slice(-4),
        bankAccountHash: crypto.createHash('sha256').update(randBank).digest('hex'),
        ifscCode: 'HDFC0001234',
        baseSalary: 150000,
      }
    });
    console.log(`✅ Created Employee record for Super Admin in ${superAdminDept.name}`);
  } else {
    await prisma.employee.update({
      where: { id: superAdminEmployee.id },
      data: {
        userId: superAdminUser.id,
        departmentId: superAdminDept.id,
        jobTitle: 'Super Administrator',
        status: 'ACTIVE',
      }
    });
    console.log(`✅ Linked Employee record for Super Admin in ${superAdminDept.name}`);
  }

  console.log('\n--- SUMMARY OF INSERTED/PROVISIONED USERS ---');
  console.log('1. HR Account:');
  console.log('   - Email:      nahin.v@himalayaerp.com');
  console.log('   - Password:   HR@hcppl');
  console.log('   - Role:       HR');
  console.log('   - Department: HR Department');
  console.log('2. Super Admin Account:');
  console.log('   - Email:      super.admin@himalayaerp.com (and superadmin@himalayaerp.com)');
  console.log('   - Password:   SuperAdmin@hcppl');
  console.log('   - Role:       SUPER_ADMIN');
  console.log('   - Department: Super Admin Department');
}

main()
  .catch((e) => {
    console.error('Error executing script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
