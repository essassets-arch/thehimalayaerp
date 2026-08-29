import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INSPECTING DATABASE USERS & EMPLOYEES ---');
  
  const users = await prisma.user.findMany({
    include: { role: true, employee: true }
  });
  console.log(`Found ${users.length} Users:`);
  users.forEach(u => {
    console.log(`- User ID: ${u.id} | Email: ${u.email} | Role: ${u.role?.name} (${u.role?.code}) | Employee: ${u.employee?.fullName || 'None'}`);
  });

  const employees = await prisma.employee.findMany({
    include: { department: true, user: true }
  });
  console.log(`\nFound ${employees.length} Employees:`);
  employees.forEach(e => {
    console.log(`- Emp Code: ${e.employeeCode} | Name: ${e.fullName} | Dept: ${e.department?.name} | User: ${e.user?.email || 'None'}`);
  });

  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true } } }
  });
  console.log(`\nFound ${roles.length} Roles:`);
  roles.forEach(r => {
    console.log(`- Role: ${r.name} (Code: ${r.code}, ID: ${r.id}) -> Assigned Users: ${r._count.users}`);
  });
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
