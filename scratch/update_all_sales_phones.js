const { PrismaClient } = require('@prisma/client');

const TARGET_SALES_MAPPING = [
  { email: 'sales1@himalayaerp.com', mobile: '9586040153', name: 'Sales 1' },
  { email: 'sales2@himalayaerp.com', mobile: '9998521843', name: 'Sales 2' },
  { email: 'sales3@himalayaerp.com', mobile: '9033516047', name: 'Sales 3' },
  { email: 'sales4@himalayaerp.com', mobile: '8488811682', name: 'Sales 4' },
  { email: 'sales5@himalayaerp.com', mobile: '9033731173', name: 'Sales 5' },
  { email: 'sales11@himalayaerp.com', mobile: '9033516048', name: 'Sales 11' },
  { email: 'sales12@himalayaerp.com', mobile: '8488811630', name: 'Sales 12' },
  { email: 'sales13@himalayaerp.com', mobile: '8488811619', name: 'Sales 13' },
  { email: 'sales14@himalayaerp.com', mobile: '9033516046', name: 'Sales 14' },
];

async function updateDb(label, url) {
  console.log(`\n--- Updating ${label} ---`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    for (const mapping of TARGET_SALES_MAPPING) {
      const user = await prisma.user.findFirst({
        where: { email: mapping.email },
        include: { employee: true }
      });

      if (!user) {
        console.warn(`[!] User not found for email: ${mapping.email}`);
        continue;
      }

      if (user.employee) {
        await prisma.employee.update({
          where: { id: user.employee.id },
          data: {
            phoneNumber: mapping.mobile,
            companyPhoneNumber: mapping.mobile
          }
        });
        console.log(`✓ Updated ${mapping.name} (${mapping.email}): Employee phone -> ${mapping.mobile}`);
      } else {
        // If employee record missing, create linked employee record
        const company = await prisma.company.findFirst();
        const dept = await prisma.department.findFirst({ where: { name: { contains: 'Sales', mode: 'insensitive' } } }) || await prisma.department.findFirst();
        const loc = await prisma.workLocation.findFirst();

        await prisma.employee.create({
          data: {
            publicId: `EMP-${mapping.email.split('@')[0]}`,
            employeeCode: `EMP-${mapping.email.split('@')[0]}`,
            companyId: company.id,
            userId: user.id,
            firstName: mapping.name.split(' ')[0],
            lastName: mapping.name.split(' ')[1] || 'Sales',
            fullName: user.name || mapping.name,
            dateOfBirth: new Date('1995-01-01'),
            gender: 'MALE',
            jobTitle: 'Sales Executive',
            departmentId: dept.id,
            workLocationId: loc.id,
            employmentType: 'PERMANENT',
            status: 'ACTIVE',
            workEmail: mapping.email,
            phoneNumber: mapping.mobile,
            companyPhoneNumber: mapping.mobile,
            residentialAddress: 'Ahmedabad, Gujarat',
            emergencyContactName: 'Emergency Contact',
            emergencyContactPhone: '9876543219',
            emergencyRelationship: 'Family',
            panNumber: `PAN${mapping.email.slice(0, 5).toUpperCase()}${Date.now().toString().slice(-4)}`,
            aadhaarNumberEncrypted: `enc_${Date.now()}`,
            aadhaarLastFour: '1234',
            aadhaarHash: `hash_aadhaar_${Date.now()}`,
            bankName: 'HDFC Bank',
            accountHolderName: user.name || mapping.name,
            bankAccountType: 'SAVINGS',
            bankAccountEncrypted: `enc_bank_${Date.now()}`,
            bankAccountLastFour: '5678',
            bankAccountHash: `hash_bank_${Date.now()}`,
            ifscCode: 'HDFC0001234'
          }
        });
        console.log(`✓ Created Employee for ${mapping.name} (${mapping.email}): phone -> ${mapping.mobile}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await updateDb('Docker DB (5435)', 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await updateDb('Local DB (5432)', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
}

main().catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
