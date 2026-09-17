const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const company = await prisma.company.findFirst();
    console.log('Connected! Company:', company?.name, company?.id);
    const employees = await prisma.employee.count();
    console.log('Employee count:', employees);
    const payrollRecords = await prisma.payrollRecord.count();
    console.log('PayrollRecord count:', payrollRecords);
    const salarySlips = await prisma.salarySlip.count();
    console.log('SalarySlip count:', salarySlips);
  } catch (err) {
    console.error('Error connecting to database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
