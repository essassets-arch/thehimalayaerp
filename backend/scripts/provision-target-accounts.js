const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

const targetUsers = [
  { email: 'supersales1@himalayaerp.com', name: 'SuperSales 1', role: 'SUPER_SALES', empCode: 'EMP-SS-1' },
  { email: 'supersales2@himalayaerp.com', name: 'SuperSales 2', role: 'SUPER_SALES', empCode: 'EMP-SS-2' },
  { email: 'sales1@himalayaerp.com', name: 'Sales Executive 1', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-1' },
  { email: 'sales2@himalayaerp.com', name: 'Sales Executive 2', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-2' },
  { email: 'sales3@himalayaerp.com', name: 'Sales Executive 3', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-3' },
  { email: 'sales4@himalayaerp.com', name: 'Sales Executive 4', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-4' },
  { email: 'sales5@himalayaerp.com', name: 'Sales Executive 5', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-5' },
  { email: 'sales6@himalayaerp.com', name: 'Sales Executive 6', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-6' },
  { email: 'sales7@himalayaerp.com', name: 'Sales Executive 7', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-7' },
  { email: 'plant.head@himalayaerp.com', name: 'Plant Head', role: 'PLANT_HEAD', empCode: 'EMP-PH-1' },
  { email: 'production.operator@himalayaerp.com', name: 'Production Operator', role: 'PRODUCTION_OPERATOR', empCode: 'EMP-PO-1' },
  { email: 'ravikant.tiwari@himalayaerp.com', name: 'Ravikant Tiwari', role: 'DISPATCH_EXECUTIVE', empCode: 'EMP-DE-1' },
  { email: 'sahad.dispatch@himalayaerp.com', name: 'Sahad Dispatch', role: 'DISPATCH_2', empCode: 'EMP-DE-2' },
  { email: 'finance.executive@himalayaerp.com', name: 'Finance Executive', role: 'FINANCE_EXECUTIVE', empCode: 'EMP-FE-1' },
  { email: 'sahad.accounts@himalayaerp.com', name: 'Finance Manager', role: 'FINANCE_MANAGER', empCode: 'EMP-FM-1' },
  { email: 'store.manager@himalayaerp.com', name: 'Store Manager', role: 'STORE_MANAGER', empCode: 'EMP-SM-1' },
  { email: 'hr@himalayaerp.com', name: 'HR Test', role: 'HR', empCode: 'EMP-1012' }
];

async function main() {
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

  // Find or create default department and location
  let dept = await prisma.department.findFirst({ where: { companyId, isActive: true } });
  if (!dept) {
    dept = await prisma.department.create({
      data: { code: 'DEPT-OPS', name: 'Operations', companyId, isActive: true }
    });
  }
  let loc = await prisma.workLocation.findFirst({ where: { companyId, isActive: true } });
  if (!loc) {
    loc = await prisma.workLocation.create({
      data: { code: 'LOC-HQ', name: 'Ahmedabad Head Office', companyId, isActive: true }
    });
  }

  for (const t of targetUsers) {
    console.log(`Processing: ${t.email}`);
    
    // Resolve role
    const dbRole = await prisma.role.findFirst({ where: { code: t.role } });
    if (!dbRole) {
      console.warn(`Role ${t.role} not found in DB! Skipping...`);
      continue;
    }

    // 1. Ensure User account exists
    let user = await prisma.user.findUnique({ where: { email: t.email } });
    if (!user) {
      const passwordHash = await hash('admin123', 12);
      user = await prisma.user.create({
        data: {
          publicId: randomUUID(),
          email: t.email,
          password: passwordHash,
          name: t.name,
          roleId: dbRole.id,
          companyId,
          isActive: true
        }
      });
      console.log(`Created User: ${user.email}`);
    } else {
      // Align companyId & roleId
      user = await prisma.user.update({
        where: { id: user.id },
        data: { companyId, roleId: dbRole.id }
      });
    }

    // 2. Ensure Employee profile exists
    let employee = await prisma.employee.findFirst({
      where: { OR: [{ userId: user.id }, { workEmail: t.email }] }
    });

    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          publicId: `EMP-${t.empCode}`,
          companyId,
          userId: user.id,
          employeeCode: t.empCode,
          firstName: t.name.split(' ')[0],
          lastName: t.name.split(' ').slice(1).join(' ') || 'Staff',
          fullName: t.name,
          dateOfBirth: new Date('1990-01-01'),
          gender: 'OTHER',
          jobTitle: t.name,
          departmentId: dept.id,
          workLocationId: loc.id,
          employmentType: 'PERMANENT',
          joiningDate: new Date(),
          status: 'ACTIVE',
          workEmail: t.email,
          phoneNumber: '9876543210',
          residentialAddress: 'Default Address',
          emergencyContactName: 'Emergency',
          emergencyContactPhone: '9876543210',
          emergencyRelationship: 'Friend',
          panNumber: `PAN-${t.empCode}`.toUpperCase(),
          aadhaarNumberEncrypted: 'enc-auto',
          aadhaarLastFour: '1234',
          aadhaarHash: `hash-${t.empCode}`,
          bankName: 'State Bank of India',
          accountHolderName: t.name,
          bankAccountType: 'SAVINGS',
          bankAccountEncrypted: 'enc-auto',
          bankAccountLastFour: '1234',
          bankAccountHash: `bhash-${t.empCode}`,
          ifscCode: 'SBIN0001234'
        }
      });
      console.log(`Created Employee profile: ${employee.employeeCode}`);
    } else {
      // Update link and companyId
      employee = await prisma.employee.update({
        where: { id: employee.id },
        data: { userId: user.id, companyId }
      });
      console.log(`Linked existing Employee profile: ${employee.employeeCode}`);
    }
  }
  console.log('=== TARGET 17 ACCOUNTS MAPPING COMPLETE ===');
}

main().catch(console.error).finally(() => prisma.$disconnect());
