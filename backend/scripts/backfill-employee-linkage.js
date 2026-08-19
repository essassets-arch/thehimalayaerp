const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== AUDITING AND LINKING UNLINKED EMPLOYEES ===');
  const employees = await prisma.employee.findMany({
    where: { userId: null }
  });
  console.log(`Found ${employees.length} unlinked employees.`);

  let linkedCount = 0;
  for (const emp of employees) {
    if (!emp.workEmail) continue;
    const email = emp.workEmail.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (user) {
      await prisma.employee.update({
        where: { id: emp.id },
        data: { userId: user.id }
      });
      console.log(`Linked Employee ${emp.employeeCode} (${emp.fullName}) to User ${user.email}`);
      linkedCount++;
    } else {
      console.log(`No matching User found for Employee ${emp.employeeCode} (${emp.workEmail})`);
    }
  }
  console.log(`Successfully backfilled ${linkedCount} employee-user links.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
