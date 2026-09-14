const { PrismaClient } = require('@prisma/client');

const SUPERSALES_MAPPING = [
  { email: 'supersales1@himalayaerp.com', mobile: '8488811670', name: 'SuperSales 1' },
  { email: 'supersales2@himalayaerp.com', mobile: '9033516045', name: 'SuperSales 2' },
];

async function updateDb(label, url) {
  console.log(`\n--- Updating ${label} ---`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    for (const mapping of SUPERSALES_MAPPING) {
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
            lastName: mapping.name.split(' ')[1] || 'SuperSales',
            fullName: user.name || mapping.name,
            dateOfBirth: new Date('1995-01-01'),
            gender: 'MALE',
            jobTitle: 'SuperSales Lead',
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
