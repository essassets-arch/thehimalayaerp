import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface BrowserUserDefinition {
  envKey: string;
  roleCode: string;
  displayName: string;
  departmentCode: string;
}

const browserUsers: BrowserUserDefinition[] = [
  { envKey: 'E2E_SUPER_ADMIN_EMAIL', roleCode: 'SUPER_ADMIN', displayName: 'Browser Super Admin', departmentCode: 'DEPT-ADMIN' },
  { envKey: 'E2E_ADMIN_EMAIL', roleCode: 'ADMIN', displayName: 'Browser Admin', departmentCode: 'DEPT-ADMIN' },
  { envKey: 'E2E_SALES_EXECUTIVE_EMAIL', roleCode: 'SALES_EXECUTIVE', displayName: 'Browser Sales Executive', departmentCode: 'DEPT-SALES' },
  { envKey: 'E2E_SALES_MANAGER_EMAIL', roleCode: 'SALES_MANAGER', displayName: 'Browser Sales Manager', departmentCode: 'DEPT-SALES' },
  { envKey: 'E2E_PLANT_HEAD_EMAIL', roleCode: 'PLANT_HEAD', displayName: 'Browser Plant Head', departmentCode: 'DEPT-PRODUCTION' },
  { envKey: 'E2E_PRODUCTION_PLANNER_EMAIL', roleCode: 'PRODUCTION_PLANNER', displayName: 'Browser Production Planner', departmentCode: 'DEPT-PRODUCTION' },
  { envKey: 'E2E_PRODUCTION_OPERATOR_EMAIL', roleCode: 'PRODUCTION_OPERATOR', displayName: 'Browser Production Operator', departmentCode: 'DEPT-PRODUCTION' },
  { envKey: 'E2E_STORE_MANAGER_EMAIL', roleCode: 'STORE_MANAGER', displayName: 'Browser Store Manager', departmentCode: 'DEPT-STORES' },
  { envKey: 'E2E_QC_INSPECTOR_EMAIL', roleCode: 'QC_INSPECTOR', displayName: 'Browser QC Inspector', departmentCode: 'DEPT-QC' },
  { envKey: 'E2E_DISPATCH_EXECUTIVE_EMAIL', roleCode: 'DISPATCH_EXECUTIVE', displayName: 'Browser Dispatch Exec', departmentCode: 'DEPT-DISPATCH' },
  { envKey: 'E2E_FINANCE_EXECUTIVE_EMAIL', roleCode: 'FINANCE_EXECUTIVE', displayName: 'Browser Finance Exec', departmentCode: 'DEPT-FINANCE' },
  { envKey: 'E2E_FINANCE_MANAGER_EMAIL', roleCode: 'FINANCE_MANAGER', displayName: 'Browser Finance Manager', departmentCode: 'DEPT-FINANCE' },
  { envKey: 'E2E_HR_EMAIL', roleCode: 'HR', displayName: 'Browser HR', departmentCode: 'DEPT-HR' },
  { envKey: 'E2E_EMPLOYEE_EMAIL', roleCode: 'EMPLOYEE', displayName: 'Browser Employee', departmentCode: 'DEPT-GENERAL' },
  { envKey: 'E2E_AUTH_LOCKOUT_EMAIL', roleCode: 'SALES_EXECUTIVE', displayName: 'Browser Auth Lockout User', departmentCode: 'DEPT-SALES' }
];

function assertBrowserTestDatabase(databaseUrl: string): string {
  const parsed = new URL(databaseUrl);
  const databaseName = parsed.pathname.replace(/^\//, '');

  if (!databaseName.endsWith('_browser_test')) {
    throw new Error(
      `Unsafe database "${databaseName}". Expected *_browser_test.`,
    );
  }

  return databaseName;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL is required.');
  
  const dbName = assertBrowserTestDatabase(dbUrl);
  console.log(`Verified browser-test database: ${dbName}`);

  const password = process.env.E2E_COMMON_PASSWORD;
  if (!password) {
    throw new Error('E2E_COMMON_PASSWORD is required.');
  }

  // Same number of rounds as auth service
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  const passwordHash = await bcrypt.hash(password, bcryptRounds);

  // Get or create Company
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        publicId: 'COMP-BROWSER-TEST',
        name: 'Browser Test Company',
      }
    });
  }

  // Get or create Department and WorkLocation for fallback Employee creation
  let department = await prisma.department.findFirst({ where: { companyId: company.id } });
  if (!department) {
    department = await prisma.department.create({
      data: {
        companyId: company.id,
        code: 'DEPT-GENERAL',
        name: 'General Department'
      }
    });
  }

  let workLocation = await prisma.workLocation.findFirst({ where: { companyId: company.id } });
  if (!workLocation) {
    workLocation = await prisma.workLocation.create({
      data: {
        companyId: company.id,
        code: 'LOC-1',
        name: 'Headquarters'
      }
    });
  }

  const report: any[] = [];

  for (const def of browserUsers) {
    const email = process.env[def.envKey] || `${def.roleCode.toLowerCase().replace(/_/g, '.')}@himalayaerp.test`;
    
    // Ensure Role exists
    let role = await prisma.role.findUnique({ where: { code: def.roleCode } });
    if (!role) {
      role = await prisma.role.create({
        data: {
          publicId: `ROLE-${def.roleCode}`,
          code: def.roleCode,
          name: def.displayName.replace('Browser ', ''),
        }
      });
    }

    const existed = !!(await prisma.user.findUnique({ where: { email } }));

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: def.displayName,
        password: passwordHash,
        roleId: role.id,
        companyId: company.id,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        deletedAt: null,
      },
      create: {
        publicId: `E2E-USER-${def.roleCode}-${Date.now()}`,
        email,
        name: def.displayName,
        password: passwordHash,
        roleId: role.id,
        companyId: company.id,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new Error(`Password verification failed for ${email}`);
    }

    // Ensure Employee Relation if needed (many roles are employees)
    // To keep it simple, create an employee profile for everyone so workflows don't fail
    let employee = await prisma.employee.findUnique({ where: { userId: user.id } });
    if (!employee) {
      const firstName = def.displayName.split(' ')[0] || 'Browser';
      const lastName = def.displayName.split(' ').slice(1).join(' ') || 'User';
      const employeeCode = `E2E-${def.roleCode}-${Date.now()}`;
      const uniqueIndex = browserUsers.indexOf(def);

      employee = await prisma.employee.create({
        data: {
          publicId: `E2E-EMP-${def.roleCode}-${Date.now()}`,
          companyId: company.id,
          userId: user.id,
          employeeCode,
      
          firstName,
          lastName,
          fullName: def.displayName,
          dateOfBirth: new Date('1990-01-01'),
          gender: 'MALE',
          jobTitle: def.roleCode.replaceAll('_', ' '),
      
          departmentId: department.id,
          workLocationId: workLocation.id,
          employmentType: 'PERMANENT',
          joiningDate: new Date('2026-01-01'),
      
          workEmail: email,
          phoneNumber: `987650${String(uniqueIndex).padStart(4, '0')}`,
          residentialAddress: 'Browser Test Address',
      
          emergencyContactName: 'Browser Test Emergency',
          emergencyContactPhone: '9876500000',
          emergencyRelationship: 'Friend',
      
          panNumber: `E2ETE${String(1000 + uniqueIndex)}T`,
          aadhaarNumberEncrypted: 'browser-test-encrypted',
          aadhaarLastFour: String(1000 + uniqueIndex).slice(-4),
          aadhaarHash: `browser-test-aadhaar-${def.roleCode}`,
      
          bankName: 'Browser Test Bank',
          accountHolderName: def.displayName,
          bankAccountType: 'SAVINGS',
          bankAccountEncrypted: 'browser-test-bank-encrypted',
          bankAccountLastFour: String(5000 + uniqueIndex).slice(-4),
          bankAccountHash: `browser-test-bank-${def.roleCode}`,
          ifscCode: 'TEST0001234',
      
          baseSalary: 50000,
          status: 'ACTIVE',
        }
      });
    }

    report.push({
      email,
      role: def.roleCode,
      existedBefore: existed,
      active: user.isActive,
      unlocked: user.lockedUntil === null && user.failedLoginAttempts === 0,
      passwordVerified: passwordMatches,
      companyLinked: !!user.companyId,
      employeeLinked: !!employee
    });
  }

  const docsDir = path.join(__dirname, '../../docs/runtime-certification/auth');
  fs.mkdirSync(docsDir, { recursive: true });

  fs.writeFileSync(
    path.join(docsDir, 'credential-preflight.json'),
    JSON.stringify(report, null, 2)
  );

  const mdContent = `# Credential Preflight Report\n\n| Email | Role | Existed | Active | Unlocked | Password OK | Company Linked | Employee Linked |\n|---|---|---|---|---|---|---|---|\n` +
    report.map(r => `| ${r.email} | ${r.role} | ${r.existedBefore} | ${r.active} | ${r.unlocked} | ${r.passwordVerified} | ${r.companyLinked} | ${r.employeeLinked} |`).join('\n');
  
  fs.writeFileSync(
    path.join(docsDir, 'credential-preflight.md'),
    mdContent
  );

  console.log('Successfully provisioned browser test credentials.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
