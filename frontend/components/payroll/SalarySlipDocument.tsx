'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './SalarySlipDocument.css';

export interface SalarySlipDocumentProps {
  structure?: any;
  slip?: any;
  onClose?: () => void;
  isModal?: boolean;
  allowDownload?: boolean;
}

// Convert number to Indian currency words
function numberToWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen ',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  const inWords = (n: number): string => {
    let str = '';
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const hundred = Math.floor((n % 1000) / 100);
    const rest = Math.floor(n % 100);

    if (crore > 0) str += inWords(crore) + 'Crore ';
    if (lakh > 0) str += inWords(lakh) + 'Lakh ';
    if (thousand > 0) str += inWords(thousand) + 'Thousand ';
    if (hundred > 0) str += inWords(hundred) + 'Hundred ';
    if (rest > 0) {
      if (rest < 20) {
        str += a[rest];
      } else {
        str += b[Math.floor(rest / 10)] + ' ' + a[rest % 10];
      }
    }
    return str;
  };

  const rupees = inWords(n);
  const paiseVal = Math.round((Math.abs(num) - n) * 100);
  const paise = paiseVal > 0 ? ` and ${inWords(paiseVal)}Paise` : '';

  return `Rupees ${rupees}${paise} Only`;
}

const fmt = (val: unknown) =>
  `₹ ${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function SalarySlipDocument({
  structure,
  slip,
  onClose,
  isModal = false,
  allowDownload = true,
}: SalarySlipDocumentProps) {
  const [downloading, setDownloading] = useState<boolean>(false);

  // Normalize data from either structure or slip
  const data = structure || slip || {};

  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>No salary structure or payslip data available.</p>
      </div>
    );
  }

  const empName =
    data.employeeNameSnapshot ||
    data.employee?.fullName ||
    (data.employee
      ? `${data.employee.firstName || ''} ${data.employee.lastName || ''}`.trim()
      : '') ||
    data.employeeName ||
    'Staff Member';

  const empCode =
    data.employee?.employeeCode ||
    data.employeeCode ||
    data.employeeId?.slice(0, 8) ||
    'EMP-CODE';

  const designation =
    data.designationSnapshot ||
    data.employee?.jobTitle ||
    data.designation ||
    'Executive';

  const department =
    data.departmentSnapshot ||
    (typeof data.employee?.department === 'object'
      ? data.employee?.department?.name
      : data.employee?.department) ||
    data.department ||
    'Operations';

  const wefDate = data.wef
    ? data.wef
    : data.effectiveFrom
    ? new Date(data.effectiveFrom).toLocaleDateString('en-GB')
    : data.payPeriod || 'Current Active';

  // 1. Gross Earnings Resolution
  const grossSalary = Number(
    data.grossSalary ||
    data.grossEarnings ||
    data.grossTotal ||
    (Number(data.basicSalary || 0) +
      Number(data.hraAmount || data.hra || 0) +
      Number(data.ltaAmount || data.lta || 0) +
      Number(data.educationAllowanceAmount || data.educationAllowance || 0) +
      Number(data.conveyanceAllowance || data.conveyanceAmount || 0))
  );

  // 2. Component Breakdowns (If raw components are missing, derive proportionally from Gross)
  const rawBasic = Number(data.basicSalary || data.basic || 0);
  const basicSalary = rawBasic > 0 ? rawBasic : (grossSalary > 0 ? Math.round(grossSalary * 0.80) : 0);

  const rawHra = Number(data.hraAmount || data.hra || 0);
  const hraAmount = rawHra > 0 ? rawHra : (basicSalary > 0 ? Math.round(basicSalary * 0.10) : 0);
  const hraPct = Number(data.hraPercentage || (basicSalary > 0 ? Math.round((hraAmount / basicSalary) * 100) : 10));

  const rawLta = Number(data.ltaAmount || data.lta || data.specialAllowance || 0);
  const ltaAmount = rawLta > 0 ? rawLta : (basicSalary > 0 ? Math.round(basicSalary * 0.05) : 0);
  const ltaPct = Number(data.ltaPercentage || (basicSalary > 0 ? Math.round((ltaAmount / basicSalary) * 100) : 5));

  const rawEdu = Number(data.educationAllowanceAmount || data.educationAllowance || data.otherAllowance || 0);
  const eduAmount = rawEdu > 0 ? rawEdu : (basicSalary > 0 ? Math.round(basicSalary * 0.05) : 0);
  const eduPct = Number(data.educationAllowancePercentage || (basicSalary > 0 ? Math.round((eduAmount / basicSalary) * 100) : 5));

  const rawConv = Number(data.conveyanceAllowance || data.conveyanceAmount || data.conveyance || 0);
  const convAmount = rawConv > 0 ? rawConv : (basicSalary > 0 ? Math.round(basicSalary * 0.05) : 0);
  const convPct = Number(data.conveyancePercentage || (basicSalary > 0 ? Math.round((convAmount / basicSalary) * 100) : 5));

  const totalGross = grossSalary > 0 ? grossSalary : (basicSalary + hraAmount + ltaAmount + eduAmount + convAmount);

  // 3. Deductions
  const empEpfAmount = Number(
    data.employeeEpfAmount ||
    data.pfDeduction ||
    data.epf ||
    (basicSalary > 0 ? Math.round(Math.min(basicSalary, 15000) * 0.12) : 0)
  );
  const empEpfPct = Number(data.employeeEpfPercentage || 12);

  const empEsicAmount = Number(
    data.employeeEsicAmount ||
    data.esicDeduction ||
    data.esic ||
    (totalGross > 0 && totalGross <= 21000 ? Math.round(totalGross * 0.0075) : 0)
  );
  const empEsicPct = Number(data.employeeEsicPercentage || 0.75);

  const ptAmount = Number(
    data.professionalTaxAmount ||
    data.professionalTax ||
    data.pt ||
    (totalGross >= 12000 ? 200 : 0)
  );
  const ptPct = Number(data.professionalTaxPercentage || 0);

  const leaveDeduction = Number(data.leaveDeduction || data.lopDeduction || 0);

  const statutoryDeductions = empEpfAmount + empEsicAmount + ptAmount + leaveDeduction;
  const totalDeductions = Number(data.totalDeduction || data.totalDeductions || statutoryDeductions);

  const netTakeHome = Math.max(
    0,
    Number(data.netTakeHome || data.netPayable || data.netSalary || (totalGross - totalDeductions))
  );

  // 4. Employer Contributions & CTC
  const compEpfAmount = Number(
    data.companyEpfAmount ||
    data.employerPf ||
    (basicSalary > 0 ? Math.round(Math.min(basicSalary, 15000) * 0.12) : 0)
  );
  const compEpfPct = Number(data.companyEpfPercentage || 12);

  const compEsicAmount = Number(
    data.companyEsicAmount ||
    data.employerEsic ||
    (totalGross > 0 && totalGross <= 21000 ? Math.round(totalGross * 0.0325) : 0)
  );
  const compEsicPct = Number(data.companyEsicPercentage || 3.25);

  const gratuityAmount = Number(
    data.gratuityAmount ||
    (basicSalary > 0 ? Math.round(basicSalary * 0.0481) : 0)
  );
  const gratuityPct = Number(data.gratuityPercentage || 4.81);

  const totalCompanyCost = Number(
    data.totalCompanyContribution ||
    data.employerTotalCost ||
    (compEpfAmount + compEsicAmount + gratuityAmount)
  );

  const ctcPerMonth = Number(data.ctcPerMonth || (totalGross + totalCompanyCost));
  const ctcPerAnnum = ctcPerMonth * 12;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // PDF Download function using html2canvas and jsPDF
  const handleDownloadPDF = async () => {
    const el = document.getElementById('printable-salary-slip-doc');
    if (!el) {
      window.print();
      return;
    }

    setDownloading(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210; // A4 mm
      const pdfHeight = 297; // A4 mm
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      } else {
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;
        }
      }

      const safeName = (empName || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeCode = (empCode || '').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Salary_Slip_${safeName}_${safeCode}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const documentContent = (
    <div id="printable-salary-slip-doc" className="salary-slip-paper">
      {/* ── Document Header with Himalaya Official Mountain Logo ── */}
      <div className="salary-slip-header">
        <div className="salary-slip-logo-wrap">
          <img
            src="/images/himalaya-logo.png"
            alt="Himalaya Composites & Precast Pvt. Ltd."
            className="salary-slip-logo-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/himalaya-logo.png';
            }}
          />
        </div>

        <div className="salary-slip-company-info">
          <h1 className="salary-slip-company-name">Himalaya Composites &amp; Precast Pvt. Ltd.</h1>
          <p className="salary-slip-company-sub">DURABLE Manhole Covers • Since 2004</p>
          <p className="salary-slip-company-addr">
            An ISO 9001:2015 Certified Company<br />
            Industrial Growth Centre, Phase-II, Bodhjungnagar, Agartala, Tripura - 799008<br />
            Email: hr@thehimalayaerp.com | Web: www.thehimalayaerp.com
          </p>
        </div>
      </div>

      {/* ── Document Title Ribbon ── */}
      <div className="salary-slip-title-ribbon">
        <h2>EMPLOYEE SALARY SLIP &amp; CTC BREAKDOWN STATEMENT</h2>
        <p>Statutory Salary Structure &amp; Cost to Company (CTC) Record</p>
      </div>

      {/* ── Employee Master Information Table ── */}
      <table className="salary-slip-emp-table">
        <tbody>
          <tr>
            <td className="label">Employee Name:</td>
            <td className="val">{empName}</td>
            <td className="label">Employee Code:</td>
            <td className="val">{empCode}</td>
          </tr>
          <tr>
            <td className="label">Designation:</td>
            <td className="val">{designation}</td>
            <td className="label">Department:</td>
            <td className="val">{department}</td>
          </tr>
          <tr>
            <td className="label">Effective Date (W.E.F.):</td>
            <td className="val">{wefDate}</td>
            <td className="label">Status:</td>
            <td className="val">
              <span style={{ color: data.isActive !== false ? '#166534' : '#64748b', fontWeight: 800 }}>
                {data.isActive !== false ? '● Active Structure' : '○ Superseded'}
              </span>
            </td>
          </tr>
          <tr>
            <td className="label">Payment Mode:</td>
            <td className="val">Bank Transfer (NEFT/RTGS)</td>
            <td className="label">Statement Date:</td>
            <td className="val">{new Date().toLocaleDateString('en-GB')}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Earnings & Deductions Two-Column Statement ── */}
      <table className="salary-slip-breakdown-table">
        <thead>
          <tr>
            <th style={{ width: '35%', textAlign: 'left' }}>EARNINGS &amp; ALLOWANCES (A)</th>
            <th style={{ width: '15%', textAlign: 'right' }}>AMOUNT (₹)</th>
            <th style={{ width: '35%', textAlign: 'left' }}>DEDUCTIONS (B)</th>
            <th style={{ width: '15%', textAlign: 'right' }}>AMOUNT (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Basic Salary</strong></td>
            <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(basicSalary)}</td>
            <td><strong>Provident Fund (EPF Employee)</strong> <small style={{ color: '#64748b' }}>({empEpfPct}% of Basic)</small></td>
            <td style={{ textAlign: 'right', color: '#e11d48', fontWeight: 700 }}>{fmt(empEpfAmount)}</td>
          </tr>
          <tr>
            <td><strong>House Rent Allowance (HRA)</strong> <small style={{ color: '#64748b' }}>({hraPct}% of Basic)</small></td>
            <td style={{ textAlign: 'right' }}>{fmt(hraAmount)}</td>
            <td><strong>ESIC (Employee)</strong> <small style={{ color: '#64748b' }}>({empEsicPct}% of Gross)</small></td>
            <td style={{ textAlign: 'right', color: '#e11d48' }}>{fmt(empEsicAmount)}</td>
          </tr>
          <tr>
            <td><strong>Leave Travel Allowance (LTA)</strong> <small style={{ color: '#64748b' }}>({ltaPct}% of Basic)</small></td>
            <td style={{ textAlign: 'right' }}>{fmt(ltaAmount)}</td>
            <td><strong>Professional Tax (P.Tax)</strong> <small style={{ color: '#64748b' }}>({ptPct}% of Gross)</small></td>
            <td style={{ textAlign: 'right', color: '#e11d48' }}>{fmt(ptAmount)}</td>
          </tr>
          <tr>
            <td><strong>Education Allowance</strong> <small style={{ color: '#64748b' }}>({eduPct}% of Basic)</small></td>
            <td style={{ textAlign: 'right' }}>{fmt(eduAmount)}</td>
            {leaveDeduction > 0 ? (
              <>
                <td><strong>Leave &amp; LOP Deduction</strong> <small style={{ color: '#64748b' }}>(Unpaid Days)</small></td>
                <td style={{ textAlign: 'right', color: '#e11d48', fontWeight: 600 }}>{fmt(leaveDeduction)}</td>
              </>
            ) : (
              <>
                <td style={{ color: '#94a3b8' }}>—</td>
                <td style={{ textAlign: 'right', color: '#94a3b8' }}>—</td>
              </>
            )}
          </tr>
          <tr>
            <td><strong>Conveyance Allowance</strong> <small style={{ color: '#64748b' }}>({convPct}% of Basic)</small></td>
            <td style={{ textAlign: 'right' }}>{fmt(convAmount)}</td>
            <td style={{ color: '#94a3b8' }}>—</td>
            <td style={{ textAlign: 'right', color: '#94a3b8' }}>—</td>
          </tr>
          <tr className="subtotal-row">
            <td><strong>TOTAL GROSS SALARY (A)</strong></td>
            <td style={{ textAlign: 'right', color: '#0f172a', fontSize: '13.5px' }}><strong>{fmt(totalGross)}</strong></td>
            <td><strong>TOTAL DEDUCTIONS (B)</strong></td>
            <td style={{ textAlign: 'right', color: '#e11d48', fontSize: '13.5px' }}><strong>{fmt(totalDeductions)}</strong></td>
          </tr>
        </tbody>
      </table>

      {/* ── Net Take Home In-Hand Salary Banner ── */}
      <div className="salary-slip-net-banner">
        <div className="salary-slip-net-left">
          <span>Net Take Home Pay (C = A - B)</span>
          <strong>NET SALARY PAYABLE IN HAND:</strong>
          <div className="salary-slip-net-words">
            {numberToWords(netTakeHome)}
          </div>
        </div>
        <div className="salary-slip-net-right">
          <strong>{fmt(netTakeHome)}</strong>
          <small>Monthly In-Hand</small>
        </div>
      </div>

      {/* ── Employer Contribution & CTC (D & E) ── */}
      <table className="salary-slip-ctc-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left', width: '70%' }}>COMPANY CONTRIBUTION &amp; COST TO COMPANY (D &amp; E)</th>
            <th style={{ textAlign: 'right', width: '30%' }}>MONTHLY COST (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>EPF Company Contribution</strong> ({compEpfPct}% of Basic Salary)</td>
            <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(compEpfAmount)}</td>
          </tr>
          <tr>
            <td><strong>ESIC Company Contribution</strong> ({compEsicPct}% of Gross Salary)</td>
            <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(compEsicAmount)}</td>
          </tr>
          <tr>
            <td><strong>Gratuity Provision</strong> ({gratuityPct}% of Basic Salary)</td>
            <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(gratuityAmount)}</td>
          </tr>
          <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
            <td><strong>TOTAL COMPANY CONTRIBUTION (D)</strong></td>
            <td style={{ textAlign: 'right', color: '#2563eb' }}><strong>{fmt(totalCompanyCost)}</strong></td>
          </tr>
          <tr className="ctc-total-row">
            <td>
              <div><strong>TOTAL COST TO COMPANY - CTC (E = A + D)</strong></div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#78350f', marginTop: '2px' }}>
                Annual CTC: <strong>{fmt(ctcPerAnnum)} / Year</strong>
              </div>
            </td>
            <td style={{ textAlign: 'right', fontSize: '15px' }}>
              <strong>{fmt(ctcPerMonth)} / Month</strong>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Authorization & Signatures ── */}
      <div className="salary-slip-signatures">
        <div className="salary-slip-sign-box">
          <div className="salary-slip-sign-line"></div>
          <div className="salary-slip-sign-title">Employee Signature</div>
          <div className="salary-slip-sign-sub">Acknowledged &amp; Received</div>
        </div>

        <div className="salary-slip-sign-box">
          <div className="salary-slip-sign-line"></div>
          <div className="salary-slip-sign-title">Prepared by (HR Dept)</div>
          <div className="salary-slip-sign-sub">Himalaya ERP System</div>
        </div>

        <div className="salary-slip-sign-box">
          <div className="salary-slip-sign-line"></div>
          <div className="salary-slip-sign-title">Authorized Signatory</div>
          <div className="salary-slip-sign-sub">Himalaya Composites &amp; Precast Pvt. Ltd.</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="salary-slip-footer-note">
        * This is a computer-generated official salary slip and CTC breakdown statement issued by Himalaya Composites &amp; Precast Pvt. Ltd.
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="salary-slip-modal-backdrop" onClick={onClose}>
        <div className="salary-slip-modal-dialog" onClick={(e) => e.stopPropagation()}>
          {/* Action Toolbar */}
          <div className="salary-slip-toolbar no-print">
            <div className="salary-slip-toolbar-left">
              <span>📄 Official Salary Statement Slip</span>
            </div>

            <div className="salary-slip-toolbar-actions">
              <button
                type="button"
                onClick={handlePrint}
                className="btn-slip-action btn-slip-print"
                title="Print Document"
              >
                🖨️ Print Slip
              </button>

              {allowDownload && (
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="btn-slip-action btn-slip-download"
                  title="Download PDF"
                >
                  {downloading ? '⏳ Generating PDF...' : '📥 Download PDF'}
                </button>
              )}

              {data.id && (
                <Link
                  href={`/hr/salary/prepare/edit/${data.id}`}
                  className="btn-slip-action"
                  style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
                >
                  ✏️ Edit
                </Link>
              )}

              {onClose && (
                <button type="button" onClick={onClose} className="btn-slip-action btn-slip-close">
                  ✕ Close
                </button>
              )}
            </div>
          </div>

          <div style={{ padding: '24px', overflowY: 'auto' }}>
            {documentContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="salary-slip-page-container">
      {/* Top Controls on Page */}
      <div className="salary-slip-toolbar no-print" style={{ borderRadius: '12px', marginBottom: '20px' }}>
        <div className="salary-slip-toolbar-left">
          <Link href="/hr/salary/prepare" style={{ color: '#2563eb', textDecoration: 'none' }}>
            ← Back to Salary Register
          </Link>
        </div>

        <div className="salary-slip-toolbar-actions">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-slip-action btn-slip-print"
          >
            🖨️ Print Slip
          </button>

          {allowDownload && (
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="btn-slip-action btn-slip-download"
            >
              {downloading ? '⏳ Generating PDF...' : '📥 Download PDF'}
            </button>
          )}

          {data.id && (
            <Link
              href={`/hr/salary/prepare/edit/${data.id}`}
              className="btn-slip-action"
              style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
            >
              ✏️ Edit
            </Link>
          )}
        </div>
      </div>

      {documentContent}
    </div>
  );
}

export default SalarySlipDocument;
