const escapePdf = (value: string | number | boolean | null | undefined) =>
  String(value ?? '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/([\\()])/g, '\\$1');

const formatMoney = (val: any) => {
  const num = Number(val || 0);
  return `INR ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function createSalarySlipPdf(slip: any): Buffer {
  const commands: string[] = [];

  // Helper to place text in PDF at (x, y)
  const drawText = (
    text: string,
    x: number,
    y: number,
    size = 9,
    bold = false,
  ) => {
    if (!text) return;
    const font = bold ? '/F2' : '/F1';
    commands.push(
      `BT ${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`,
    );
  };

  // Helper to draw horizontal line
  const drawLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width = 0.5,
  ) => {
    commands.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  // Helper to draw rectangle box
  const drawBox = (x: number, y: number, w: number, h: number, width = 0.5) => {
    commands.push(`${width} w ${x} ${y} ${w} ${h} re S`);
  };

  let y = 800;

  // 1. Company Header
  drawText(
    slip.company?.name || 'Himalaya ERP & Construction Products',
    48,
    y,
    15,
    true,
  );
  y -= 16;
  drawText(
    slip.company?.address || 'Industrial Area, Solan, Himachal Pradesh',
    48,
    y,
    9,
    false,
  );
  y -= 13;
  drawText(
    [
      slip.company?.email || 'finance@himalayaerp.com',
      slip.company?.phone || '+91 98160 00000',
    ]
      .filter(Boolean)
      .join(' | '),
    48,
    y,
    8,
    false,
  );
  y -= 15;

  drawLine(48, y, 547, y, 1.5);
  y -= 20;

  // 2. Document Title
  drawText('SALARY SLIP', 48, y, 14, true);
  drawText(
    `${(slip.salaryMonthName || 'August').toUpperCase()} ${slip.salaryYear || 2026}`,
    400,
    y,
    12,
    true,
  );
  y -= 15;
  drawText(
    `Slip No: ${slip.slipNumber || 'SLIP-001'}    |    Payroll No: ${slip.payrollNumber || 'PAY-001'}`,
    48,
    y,
    9,
    false,
  );
  y -= 22;

  // 3. Employee Information Box
  drawBox(48, y - 90, 499, 100, 0.75);
  drawText('EMPLOYEE INFORMATION', 58, y - 5, 10, true);
  drawLine(48, y - 10, 547, y - 10, 0.5);

  const emp = slip.employee || {};
  const empY = y - 24;

  // Column 1
  drawText(`Name: ${emp.fullName || 'Staff Member'}`, 58, empY, 9, true);
  drawText(
    `Employee ID: ${emp.employeeId || 'EMP-001'}`,
    58,
    empY - 14,
    9,
    false,
  );
  drawText(
    `Department: ${emp.department || 'Operations'}`,
    58,
    empY - 28,
    9,
    false,
  );
  drawText(
    `Designation: ${emp.designation || 'Employee'}`,
    58,
    empY - 42,
    9,
    false,
  );
  drawText(
    `Joining Date: ${String(emp.joiningDate || '').slice(0, 10)}`,
    58,
    empY - 56,
    9,
    false,
  );

  // Column 2
  drawText(
    `Work Location: ${emp.location || 'Main Plant'}`,
    310,
    empY,
    9,
    false,
  );
  drawText(
    `Bank Name: ${emp.bankName || 'HDFC Bank'}`,
    310,
    empY - 14,
    9,
    false,
  );
  drawText(
    `Account No: ${emp.maskedAccountNumber || '****1234'}`,
    310,
    empY - 28,
    9,
    false,
  );
  drawText(
    `IFSC Code: ${emp.ifscCode || 'HDFC0001234'}`,
    310,
    empY - 42,
    9,
    false,
  );
  drawText(
    `PAN / UAN: ${emp.panNumber || 'N/A'} / ${emp.uanNumber || 'N/A'}`,
    310,
    empY - 56,
    9,
    false,
  );

  y -= 115;

  // 4. Attendance Summary Box
  drawBox(48, y - 50, 499, 60, 0.75);
  drawText('ATTENDANCE SUMMARY', 58, y - 5, 10, true);
  drawLine(48, y - 10, 547, y - 10, 0.5);

  const att = slip.attendance || {};
  const attY = y - 24;
  drawText(
    `Calendar Days: ${att.calendarDays || 31}    Standard Days: ${att.standardWorkingDays || 25}    Present: ${att.presentDays || 25}`,
    58,
    attY,
    9,
    false,
  );
  drawText(
    `Paid Leave: ${att.paidLeaveDays || 0}    Unpaid Leave (LOP): ${att.unpaidLeaveDays || 0}    Payable Days: ${att.payableDays || 25}`,
    58,
    attY - 15,
    9,
    false,
  );

  y -= 75;

  // 5. Earnings and Deductions Side-by-Side Tables
  drawBox(48, y - 140, 245, 150, 0.75); // Earnings Box
  drawBox(302, y - 140, 245, 150, 0.75); // Deductions Box

  // Table Headers
  drawText('EARNINGS', 58, y - 5, 10, true);
  drawText('AMOUNT', 230, y - 5, 9, true);
  drawLine(48, y - 10, 293, y - 10, 0.5);

  drawText('DEDUCTIONS', 312, y - 5, 10, true);
  drawText('AMOUNT', 484, y - 5, 9, true);
  drawLine(302, y - 10, 547, y - 10, 0.5);

  // Rows
  const earnRows = Array.isArray(slip.earnings) ? slip.earnings : [];
  let eY = y - 24;
  earnRows.forEach((r: any) => {
    drawText(String(r.label || r.key), 58, eY, 8.5, false);
    drawText(formatMoney(r.amount), 210, eY, 8.5, false);
    eY -= 14;
  });

  const dedRows = Array.isArray(slip.deductions) ? slip.deductions : [];
  let dY = y - 24;
  dedRows.forEach((r: any) => {
    drawText(String(r.label || r.key), 312, dY, 8.5, false);
    drawText(formatMoney(r.amount), 464, dY, 8.5, false);
    dY -= 14;
  });

  // Table Totals
  drawLine(48, y - 122, 293, y - 122, 0.5);
  drawText('Gross Earnings:', 58, y - 134, 9, true);
  drawText(formatMoney(slip.grossEarnings), 205, y - 134, 9, true);

  drawLine(302, y - 122, 547, y - 122, 0.5);
  drawText('Total Deductions:', 312, y - 134, 9, true);
  drawText(formatMoney(slip.totalDeductions), 459, y - 134, 9, true);

  y -= 165;

  // 6. Net Salary Paid Highlight Box
  drawBox(48, y - 40, 499, 48, 1.25);
  drawText('NET SALARY PAID', 245, y - 5, 9, true);
  drawText(formatMoney(slip.netPaid), 220, y - 22, 14, true);
  drawText(slip.netPaidInWords || 'Rupees Zero Only', 215, y - 34, 8, false);

  y -= 60;

  // 7. Payment Information
  drawBox(48, y - 45, 499, 52, 0.75);
  drawText('PAYMENT INFORMATION', 58, y - 5, 10, true);
  drawLine(48, y - 10, 547, y - 10, 0.5);

  const pm = slip.payment || {};
  drawText(
    `Status: ${pm.paidAmount !== undefined ? 'PAID' : 'PROCESSED'}    Date: ${String(pm.paymentDate || '').slice(0, 10)}    Mode: ${pm.paymentMode || 'NEFT / Bank Transfer'}`,
    58,
    y - 24,
    9,
    false,
  );
  drawText(
    `UTR Number: ${pm.utrNumber || 'N/A'}    Ref: ${pm.transactionReference || 'N/A'}    Processed By: ${pm.processedBy || 'Finance Manager'}`,
    58,
    y - 38,
    9,
    false,
  );

  y -= 65;

  // 8. Footer Notice
  drawLine(48, y, 547, y, 0.5);
  y -= 12;
  drawText(
    'This is a system-generated salary slip and does not require a physical signature.',
    125,
    y,
    8,
    false,
  );
  y -= 10;
  drawText(
    `Confidential payroll document. Generated electronically on ${new Date().toLocaleDateString('en-IN')}.`,
    150,
    y,
    8,
    false,
  );

  const pdfStream = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(pdfStream)} >>\nstream\n${pdfStream}\nendstream`,
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
