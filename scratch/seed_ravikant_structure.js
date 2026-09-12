const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public' } }
});

async function main() {
  const targetStructureId = '01339514-e4bb-4346-a1bb-4ce26be9b838';

  // Find Ravikant T or EMP-10 / EMP-13
  let ravikant = await prisma.employee.findFirst({
    where: {
      OR: [
        { firstName: 'Ravikant' },
        { fullName: { contains: 'Ravikant' } }
      ]
    },
    include: { department: true }
  });

  if (!ravikant) {
    console.error('Ravikant employee not found!');
    return;
  }

  console.log('Found Ravikant:', { id: ravikant.id, name: ravikant.fullName, code: ravikant.employeeCode });

  // If needed, update employeeCode to EMP-10 to match user's prompt
  const emp10 = await prisma.employee.findFirst({ where: { employeeCode: 'EMP-10' } });
  if (emp10 && emp10.id !== ravikant.id) {
    console.log('Swapping employee codes so Ravikant is EMP-10...');
    await prisma.employee.update({
      where: { id: emp10.id },
      data: { employeeCode: 'EMP-TEMP' }
    });
    await prisma.employee.update({
      where: { id: ravikant.id },
      data: { employeeCode: 'EMP-10', baseSalary: 35000 }
    });
    await prisma.employee.update({
      where: { id: emp10.id },
      data: { employeeCode: 'EMP-13' }
    });
  } else if (ravikant.employeeCode !== 'EMP-10') {
    await prisma.employee.update({
      where: { id: ravikant.id },
      data: { employeeCode: 'EMP-10', baseSalary: 35000 }
    });
  }

  // Deactivate any existing active structures for Ravikant
  await prisma.employeeSalaryStructure.updateMany({
    where: { employeeId: ravikant.id },
    data: { isActive: false }
  });

  // Upsert structure with targetStructureId
  const upserted = await prisma.employeeSalaryStructure.upsert({
    where: { id: targetStructureId },
    update: {
      employeeId: ravikant.id,
      effectiveFrom: new Date('2026-09-30'),
      wef: '2026-09-30',
      employeeNameSnapshot: 'Ravikant T',
      designationSnapshot: 'Dispatch Logistics Lead 1',
      departmentSnapshot: 'Dispatch Department',
      basicSalary: 35000,
      hraPercentage: 10,
      hra: 3500,
      ltaPercentage: 5,
      ltaAmount: 1750,
      educationAllowancePercentage: 5,
      educationAllowanceAmount: 1750,
      conveyancePercentage: 5,
      conveyanceAllowance: 1750,
      grossSalary: 43750,
      employeeEpfPercentage: 12,
      employeeEpfAmount: 1800,
      employeeEsicPercentage: 0.75,
      employeeEsicAmount: 157.50,
      professionalTaxPercentage: 0,
      professionalTaxAmount: 200,
      tdsPercentage: 0,
      tdsAmount: 0,
      tdsApplicable: false,
      totalDeduction: 2157.50,
      netTakeHome: 41592.50,
      companyEpfPercentage: 1,
      companyEpfAmount: 150,
      companyEsicPercentage: 3.25,
      companyEsicAmount: 682.50,
      gratuityPercentage: 4.81,
      gratuityAmount: 1683.50,
      totalCompanyContribution: 2516,
      ctcPerMonth: 46266,
      status: 'ACTIVE',
      isActive: true,
    },
    create: {
      id: targetStructureId,
      employeeId: ravikant.id,
      effectiveFrom: new Date('2026-09-30'),
      wef: '2026-09-30',
      employeeNameSnapshot: 'Ravikant T',
      designationSnapshot: 'Dispatch Logistics Lead 1',
      departmentSnapshot: 'Dispatch Department',
      basicSalary: 35000,
      hraPercentage: 10,
      hra: 3500,
      ltaPercentage: 5,
      ltaAmount: 1750,
      educationAllowancePercentage: 5,
      educationAllowanceAmount: 1750,
      conveyancePercentage: 5,
      conveyanceAllowance: 1750,
      grossSalary: 43750,
      employeeEpfPercentage: 12,
      employeeEpfAmount: 1800,
      employeeEsicPercentage: 0.75,
      employeeEsicAmount: 157.50,
      professionalTaxPercentage: 0,
      professionalTaxAmount: 200,
      tdsPercentage: 0,
      tdsAmount: 0,
      tdsApplicable: false,
      totalDeduction: 2157.50,
      netTakeHome: 41592.50,
      companyEpfPercentage: 1,
      companyEpfAmount: 150,
      companyEsicPercentage: 3.25,
      companyEsicAmount: 682.50,
      gratuityPercentage: 4.81,
      gratuityAmount: 1683.50,
      totalCompanyContribution: 2516,
      ctcPerMonth: 46266,
      status: 'ACTIVE',
      isActive: true,
    }
  });

  console.log('Structure upserted successfully:', {
    id: upserted.id,
    empName: upserted.employeeNameSnapshot,
    basic: upserted.basicSalary,
    gross: upserted.grossSalary,
    deductions: upserted.totalDeduction,
    net: upserted.netTakeHome,
    compContrib: upserted.totalCompanyContribution,
    ctc: upserted.ctcPerMonth,
    wef: upserted.wef
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
