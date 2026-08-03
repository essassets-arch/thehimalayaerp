const escapePdf = (value: string | number | boolean | null | undefined) =>
  String(value ?? '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/([\\()])/g, '\\$1');

export function createSalarySlipPdf(slip: any): Buffer {
  const lines: Array<{ text: string; size?: number; bold?: boolean }> = [
    { text: slip.company.name || 'Company', size: 16, bold: true },
    { text: slip.company.address || '' },
    {
      text: [slip.company.email, slip.company.phone]
        .filter(Boolean)
        .join(' | '),
    },
    { text: 'SALARY SLIP', size: 18, bold: true },
    {
      text: `${slip.salaryMonthName} ${slip.salaryYear}`,
      size: 12,
      bold: true,
    },
    {
      text: `Slip No: ${slip.slipNumber}    Payroll No: ${slip.payrollNumber}`,
    },
    { text: 'EMPLOYEE INFORMATION', size: 11, bold: true },
    { text: `${slip.employee.fullName} (${slip.employee.employeeId})` },
    {
      text: `${slip.employee.department} | ${slip.employee.designation} | ${slip.employee.location}`,
    },
    {
      text: `Joining: ${String(slip.employee.joiningDate).slice(0, 10)}  PAN: ${slip.employee.panNumber || 'N/A'}`,
    },
    {
      text: `Bank: ${slip.employee.bankName || 'N/A'}  A/C: ${slip.employee.maskedAccountNumber || 'N/A'}  IFSC: ${slip.employee.ifscCode || 'N/A'}`,
    },
    { text: 'ATTENDANCE SUMMARY', size: 11, bold: true },
    {
      text: `Calendar: ${slip.attendance.calendarDays}  Working: ${slip.attendance.standardWorkingDays}  Present: ${slip.attendance.presentDays}`,
    },
    {
      text: `Paid Leave: ${slip.attendance.paidLeaveDays}  Unpaid Leave: ${slip.attendance.unpaidLeaveDays}  Half Days: ${slip.attendance.halfDays}`,
    },
    {
      text: `Weekly Offs: ${slip.attendance.weeklyOffDays}  Holidays: ${slip.attendance.holidays}  Payable: ${slip.attendance.payableDays}  OT: ${slip.attendance.overtimeHours}h`,
    },
    { text: 'EARNINGS', size: 11, bold: true },
    ...slip.earnings.map((row: any) => ({
      text: `${row.label}: INR ${row.amount}`,
    })),
    { text: `Gross Earnings: INR ${slip.grossEarnings}`, bold: true },
    { text: 'DEDUCTIONS', size: 11, bold: true },
    ...slip.deductions.map((row: any) => ({
      text: `${row.label}: INR ${row.amount}`,
    })),
    { text: `Total Deductions: INR ${slip.totalDeductions}`, bold: true },
    { text: `NET SALARY PAID: INR ${slip.netPaid}`, size: 15, bold: true },
    { text: slip.netPaidInWords },
    { text: 'PAYMENT INFORMATION', size: 11, bold: true },
    {
      text: `Paid on ${String(slip.payment.paymentDate).slice(0, 10)} via ${slip.payment.paymentMode}`,
    },
    {
      text: `UTR: ${slip.payment.utrNumber || 'N/A'}  Reference: ${slip.payment.transactionReference || 'N/A'}`,
    },
    {
      text: 'This is a system-generated salary slip and does not require a physical signature.',
    },
    {
      text: `Confidential payroll document. Generated electronically on ${String(slip.generatedAt).slice(0, 10)}.`,
    },
  ].filter((line) => line.text);
  let y = 800;
  const commands = lines
    .map((line) => {
      const size = line.size || 9;
      const font = line.bold ? '/F2' : '/F1';
      const result = `BT ${font} ${size} Tf 48 ${y} Td (${escapePdf(line.text)}) Tj ET`;
      y -= size + 7;
      return result;
    })
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(commands)} >>\nstream\n${commands}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, 'ascii');
}
