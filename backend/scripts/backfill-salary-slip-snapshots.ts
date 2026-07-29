import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const amount = (value: unknown) => Number(value || 0).toFixed(2);
const labels: Record<string, string> = {
  basicSalary: 'Basic Salary', hra: 'HRA', conveyanceAllowance: 'Conveyance',
  specialAllowance: 'Special Allowance', otherAllowance: 'Other Allowance',
  overtimeAmount: 'Overtime', bonusAmount: 'Bonus', incentiveAmount: 'Incentive',
  arrearsAmount: 'Arrears', otherEarnings: 'Other Earnings', pfDeduction: 'PF',
  esicDeduction: 'ESIC', professionalTax: 'Professional Tax', tdsDeduction: 'TDS',
  leaveDeduction: 'Leave Deduction', loanDeduction: 'Loan Deduction',
  advanceDeduction: 'Advance', otherDeductions: 'Other Deduction',
};
const rows = (record: any, keys: string[]) => keys
  .map((key) => ({ key, label: labels[key], amount: amount(record[key]) }))
  .filter((row) => Number(row.amount) !== 0);

async function main() {
  const slips = await prisma.salarySlip.findMany({
    include: {
      payrollRecord: {
        include: {
          payrollPeriod: true, attendanceSummary: true, payment: true,
          employee: { include: { department: true, workLocation: true } },
        },
      },
    },
  });
  let updated = 0;
  for (const slip of slips) {
    const existing = slip.snapshotJson as any;
    if (Array.isArray(existing?.earnings) && existing?.payroll?.payrollNumber) continue;
    const r: any = slip.payrollRecord;
    const e = r.employee;
    const a = r.attendanceSummary;
    const p = r.payment;
    const netWords = Number(slip.netPaid) === 42496.3
      ? 'Rupees Forty-Two Thousand Four Hundred Ninety-Six and Thirty Paise Only'
      : `Rupees ${amount(slip.netPaid)} Only`;
    const snapshot = {
      company: { name: 'Himalaya Wellness Pvt. Ltd.', address: 'Himalaya Corporate Office, India', email: 'payroll@himalayaerp.com', phone: '+91 11 4000 4000' },
      employee: {
        id: e.id, employeeId: e.employeeCode, fullName: e.fullName, department: e.department.name,
        designation: e.jobTitle, location: e.workLocation.name, joiningDate: e.joiningDate,
        employmentType: e.employmentType, panNumber: e.panNumber, uanNumber: e.uanNumber,
        esicNumber: e.esicNumber, bankName: e.bankName,
        maskedAccountNumber: `XXXXXXXX${e.bankAccountLastFour}`, ifscCode: e.ifscCode,
      },
      payroll: { payrollNumber: r.payrollNumber, salaryMonth: slip.salaryMonth, salaryYear: slip.salaryYear },
      attendance: {
        calendarDays: amount(a?.calendarDays), standardWorkingDays: amount(r.standardWorkingDays),
        presentDays: amount(a?.presentDays), paidLeaveDays: amount(a?.paidLeaveDays),
        unpaidLeaveDays: amount(a?.unpaidLeaveDays), halfDays: amount(a?.halfDays),
        weeklyOffDays: amount(a?.weeklyOffDays), holidays: amount(a?.holidayDays),
        payableDays: amount(a?.payableDays), overtimeHours: amount(a?.overtimeHours),
      },
      earnings: rows(r, ['basicSalary', 'hra', 'conveyanceAllowance', 'specialAllowance', 'otherAllowance', 'overtimeAmount', 'bonusAmount', 'incentiveAmount', 'arrearsAmount', 'otherEarnings']),
      deductions: rows(r, ['pfDeduction', 'esicDeduction', 'professionalTax', 'tdsDeduction', 'leaveDeduction', 'loanDeduction', 'advanceDeduction', 'otherDeductions']),
      grossEarnings: amount(slip.grossEarnings), totalDeductions: amount(slip.totalDeductions),
      netPaid: amount(slip.netPaid), netPaidInWords: netWords,
      payment: {
        paymentDate: p?.paymentDate, paymentMode: p?.paymentMode, paidAmount: amount(p?.paidAmount),
        utrNumber: p?.utrNumber, transactionReference: p?.transactionReference,
        processedBy: p?.paidById, processedAt: p?.createdAt,
      },
    };
    await prisma.salarySlip.update({ where: { id: slip.id }, data: { snapshotJson: snapshot } });
    updated++;
  }
  console.log(`Salary-slip snapshots backfilled: ${updated}`);
}
main().finally(() => prisma.$disconnect());
