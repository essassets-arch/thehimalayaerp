const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public"
    }
  }
});

async function main() {
  const targetId = '01339514-e4bb-4346-a1bb-4ce26be9b838';

  const emp = await prisma.employee.findUnique({ where: { id: targetId } });
  console.log('Employee found?', emp ? { id: emp.id, name: emp.firstName, code: emp.employeeCode } : null);

  const pr = await prisma.payrollRecord.findUnique({ where: { id: targetId } });
  console.log('PayrollRecord found?', pr ? { id: pr.id, payrollNumber: pr.payrollNumber } : null);

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  console.log('User found?', user ? { id: user.id, email: user.email } : null);

  // List all salary structures currently in the DB
  const allStructures = await prisma.employeeSalaryStructure.findMany({
    include: { employee: true }
  });
  console.log('All structures in DB:', allStructures.map(s => ({
    id: s.id,
    employeeId: s.employeeId,
    name: s.employeeNameSnapshot || (s.employee ? s.employee.firstName : null),
    code: s.employee ? s.employee.employeeCode : null,
    basic: s.basicSalary,
    gross: s.grossSalary,
    net: s.netTakeHome,
    wef: s.wef
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
