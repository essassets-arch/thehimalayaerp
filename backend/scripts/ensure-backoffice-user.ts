import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Ensuring Back Office Role & User exists in DB...');

  // 1. Get or create Company
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        publicId: 'COMP-000001',
        name: 'Himalaya Enterprises',
      },
    });
  }

  // 2. Ensure Department & WorkLocation
  let department = await prisma.department.findFirst({
    where: { companyId: company.id },
  });
  if (!department) {
    department = await prisma.department.create({
      data: {
        code: 'DEPT-OPS',
        name: 'Operations & Administration',
        companyId: company.id,
      },
    });
  }

  let workLocation = await prisma.workLocation.findFirst({
    where: { companyId: company.id },
  });
  if (!workLocation) {
    workLocation = await prisma.workLocation.create({
      data: {
        code: 'LOC-HQ',
        name: 'Headquarters',
        companyId: company.id,
      },
    });
  }

  // 3. Ensure Back Office Role
  let role = await prisma.role.findFirst({
    where: {
      OR: [
        { code: 'BACK_OFFICE' },
        { name: 'Back Office' },
      ],
    },
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        publicId: 'ROLE-BACK-OFFICE',
        name: 'Back Office',
        code: 'BACK_OFFICE',
      },
    });
    console.log('Created Back Office Role:', role.id);
  } else {
    console.log('Found Back Office Role:', role.id, role.code);
  }

  // 4. Ensure Permissions for Back Office
  const permissions = [
    { code: 'backoffice.report.create', name: 'Create Back Office Daily Report' },
    { code: 'backoffice.report.read', name: 'View Back Office Daily Report' },
    { code: 'backoffice.report.manage', name: 'Manage Back Office Daily Report' },
    { code: 'profile.read', name: 'View Profile' },
  ];

  for (const p of permissions) {
    let perm = await prisma.permission.findUnique({ where: { code: p.code } });
    if (!perm) {
      perm = await prisma.permission.create({
        data: {
          publicId: `PERM-${p.code.toUpperCase().replace(/\./g, '_')}`,
          code: p.code,
          name: p.name,
        },
      });
    }

    const rp = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: perm.id,
        },
      },
    });

    if (!rp) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // 5. Ensure Super Admin has review permission
  const superAdminRole = await prisma.role.findFirst({
    where: { OR: [{ code: 'SUPER_ADMIN' }, { name: 'Super Admin' }] },
  });

  if (superAdminRole) {
    let reviewPerm = await prisma.permission.findUnique({
      where: { code: 'backoffice.report.review' },
    });
    if (!reviewPerm) {
      reviewPerm = await prisma.permission.create({
        data: {
          publicId: 'PERM-BACKOFFICE_REPORT_REVIEW',
          code: 'backoffice.report.review',
          name: 'Review Back Office Daily Reports',
        },
      });
    }
    const rpAdmin = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: reviewPerm.id,
        },
      },
    });
    if (!rpAdmin) {
      await prisma.rolePermission.create({
        data: {
          roleId: superAdminRole.id,
          permissionId: reviewPerm.id,
        },
      });
    }
  }

  // 6. Ensure Back Office User
  const email = 'backoffice@himalayaerp.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        publicId: 'USR-BACKOFFICE-01',
        email,
        password: hashedPassword,
        name: 'Back Office Executive',
        roleId: role.id,
        companyId: company.id,
        isActive: true,
      },
    });
    console.log('Created Back Office User:', user.email);
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        roleId: role.id,
        password: hashedPassword,
        isActive: true,
      },
    });
    console.log('Updated Back Office User:', user.email);
  }

  // 7. Ensure Employee record for this user
  let employee = await prisma.employee.findFirst({
    where: { OR: [{ userId: user.id }, { workEmail: email }] },
  });

  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        publicId: 'EMP-BO-001',
        companyId: company.id,
        userId: user.id,
        employeeCode: 'EMP-BO-001',
        firstName: 'Back Office',
        lastName: 'Executive',
        fullName: 'Back Office Executive',
        workEmail: email,
        jobTitle: 'Back Office Associate',
        departmentId: department.id,
        workLocationId: workLocation.id,
        employmentType: 'PERMANENT',
        status: 'ACTIVE',
        joiningDate: new Date('2025-01-15'),
        dateOfBirth: new Date('1995-05-10'),
        gender: 'MALE',
        phoneNumber: '9876543999',
        residentialAddress: 'Haridwar Plant Campus',
        emergencyContactName: 'Supervisor',
        emergencyContactPhone: '9876500000',
        emergencyRelationship: 'Manager',
        panNumber: 'BKOFF1234F',
        aadhaarNumberEncrypted: 'mock-aadhaar-encrypted',
        aadhaarLastFour: '1234',
        aadhaarHash: 'mock-aadhaar-hash-bo',
        bankName: 'State Bank of India',
        accountHolderName: 'Back Office Executive',
        bankAccountType: 'SAVINGS',
        bankAccountEncrypted: 'mock-bank-encrypted',
        bankAccountLastFour: '5678',
        bankAccountHash: 'mock-bank-hash-bo',
        ifscCode: 'SBIN0001234',
        baseSalary: 35000,
      },
    });
    console.log('Created Employee record for Back Office user:', employee.employeeCode);
  }

  console.log('Back Office setup completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding Back Office user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
