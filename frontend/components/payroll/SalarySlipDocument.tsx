'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { safeSaveFile } from '../../services/export.service';
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

  // 1. Component Breakdowns (Raw inputs from data)
  const rawBasic = Number(data.basicSalary ?? data.basic ?? 0);
  const rawGross = Number(data.grossSalary ?? data.grossEarnings ?? data.grossTotal ?? 0);
  const basicSalary = rawBasic > 0 ? rawBasic : (rawGross > 0 ? Math.round(rawGross * 0.80) : 0);

  // Allowances: Check explicit values and percentages (including 0!)
  const hasHraPct = data.hraPercentage !== undefined && data.hraPercentage !== null && data.hraPercentage !== '';
  const hasHraAmt = (data.hraAmount !== undefined && data.hraAmount !== null && data.hraAmount !== '') ||
                    (data.hra !== undefined && data.hra !== null && data.hra !== '');
  const hraPct = hasHraPct
    ? Number(data.hraPercentage)
    : (hasHraAmt && basicSalary > 0
        ? Math.round((Number(data.hraAmount ?? data.hra) / basicSalary) * 100)
        : 10);
  const hraAmount = hasHraAmt
    ? Number(data.hraAmount ?? data.hra)
    : Math.round((basicSalary * hraPct) / 100);

  const hasLtaPct = data.ltaPercentage !== undefined && data.ltaPercentage !== null && data.ltaPercentage !== '';
  const hasLtaAmt = (data.ltaAmount !== undefined && data.ltaAmount !== null && data.ltaAmount !== '') ||
                    (data.lta !== undefined && data.lta !== null && data.lta !== '') ||
                    (data.specialAllowance !== undefined && data.specialAllowance !== null && data.specialAllowance !== '');
  const ltaPct = hasLtaPct
    ? Number(data.ltaPercentage)
    : (hasLtaAmt && basicSalary > 0
        ? Math.round((Number(data.ltaAmount ?? data.lta ?? data.specialAllowance) / basicSalary) * 100)
        : 5);
  const ltaAmount = hasLtaAmt
    ? Number(data.ltaAmount ?? data.lta ?? data.specialAllowance)
    : Math.round((basicSalary * ltaPct) / 100);

  const hasEduPct = data.educationAllowancePercentage !== undefined && data.educationAllowancePercentage !== null && data.educationAllowancePercentage !== '';
  const hasEduAmt = (data.educationAllowanceAmount !== undefined && data.educationAllowanceAmount !== null && data.educationAllowanceAmount !== '') ||
                    (data.educationAllowance !== undefined && data.educationAllowance !== null && data.educationAllowance !== '') ||
                    (data.otherAllowance !== undefined && data.otherAllowance !== null && data.otherAllowance !== '');
  const eduPct = hasEduPct
    ? Number(data.educationAllowancePercentage)
    : (hasEduAmt && basicSalary > 0
        ? Math.round((Number(data.educationAllowanceAmount ?? data.educationAllowance ?? data.otherAllowance) / basicSalary) * 100)
        : 5);
  const eduAmount = hasEduAmt
    ? Number(data.educationAllowanceAmount ?? data.educationAllowance ?? data.otherAllowance)
    : Math.round((basicSalary * eduPct) / 100);

  const hasConvPct = data.conveyancePercentage !== undefined && data.conveyancePercentage !== null && data.conveyancePercentage !== '';
  const hasConvAmt = (data.conveyanceAllowance !== undefined && data.conveyanceAllowance !== null && data.conveyanceAllowance !== '') ||
                     (data.conveyanceAmount !== undefined && data.conveyanceAmount !== null && data.conveyanceAmount !== '') ||
                     (data.conveyance !== undefined && data.conveyance !== null && data.conveyance !== '');
  const convPct = hasConvPct
    ? Number(data.conveyancePercentage)
    : (hasConvAmt && basicSalary > 0
        ? Math.round((Number(data.conveyanceAllowance ?? data.conveyanceAmount ?? data.conveyance) / basicSalary) * 100)
        : 5);
  const convAmount = hasConvAmt
    ? Number(data.conveyanceAllowance ?? data.conveyanceAmount ?? data.conveyance)
    : Math.round((basicSalary * convPct) / 100);

  // Total Gross Salary (A) is ALWAYS strictly equal to sum of basic and allowances
  const componentsSum = basicSalary + hraAmount + ltaAmount + eduAmount + convAmount;
  const totalGross = componentsSum > 0 ? componentsSum : rawGross;

  // 2. Deductions (B)
  const hasEmpEpfPct = data.employeeEpfPercentage !== undefined && data.employeeEpfPercentage !== null && data.employeeEpfPercentage !== '';
  const empEpfPct = hasEmpEpfPct
    ? Number(data.employeeEpfPercentage)
    : ((data.employeeEpfAmount > 0 || data.pfDeduction > 0) ? 12 : 12);
  const epfWage = basicSalary > 15000 && empEpfPct === 12 ? 15000 : basicSalary;
  const hasEmpEpfAmt = (data.employeeEpfAmount !== undefined && data.employeeEpfAmount !== null && data.employeeEpfAmount !== '') ||
                       (data.pfDeduction !== undefined && data.pfDeduction !== null && data.pfDeduction !== '') ||
                       (data.epf !== undefined && data.epf !== null && data.epf !== '');
  const empEpfAmount = hasEmpEpfAmt
    ? Number(data.employeeEpfAmount ?? data.pfDeduction ?? data.epf)
    : (empEpfPct > 0 ? Math.round((epfWage * empEpfPct) / 100) : 0);

  const hasEmpEsicPct = data.employeeEsicPercentage !== undefined && data.employeeEsicPercentage !== null && data.employeeEsicPercentage !== '';
  const empEsicPct = hasEmpEsicPct
    ? Number(data.employeeEsicPercentage)
    : (totalGross <= 21000 ? 0.75 : 0.75);
  const esicWage = totalGross > 21000 ? 21000 : totalGross;
  const hasEmpEsicAmt = (data.employeeEsicAmount !== undefined && data.employeeEsicAmount !== null && data.employeeEsicAmount !== '') ||
                        (data.esicDeduction !== undefined && data.esicDeduction !== null && data.esicDeduction !== '') ||
                        (data.esic !== undefined && data.esic !== null && data.esic !== '');
  const empEsicAmount = hasEmpEsicAmt
    ? Number(data.employeeEsicAmount ?? data.esicDeduction ?? data.esic)
    : (empEsicPct > 0 ? Math.round((esicWage * empEsicPct) / 100 * 100) / 100 : 0);

  const hasPtPct = data.professionalTaxPercentage !== undefined && data.professionalTaxPercentage !== null && data.professionalTaxPercentage !== '';
  const ptPct = hasPtPct ? Number(data.professionalTaxPercentage) : 0;
  const hasPtAmt = (data.professionalTaxAmount !== undefined && data.professionalTaxAmount !== null && data.professionalTaxAmount !== '') ||
                   (data.professionalTax !== undefined && data.professionalTax !== null && data.professionalTax !== '') ||
                   (data.pt !== undefined && data.pt !== null && data.pt !== '');
  const ptAmount = hasPtAmt
    ? Number(data.professionalTaxAmount ?? data.professionalTax ?? data.pt)
    : (ptPct > 0 ? Math.round((totalGross * ptPct) / 100) : (totalGross >= 12000 ? 200 : 0));

  const hasTdsPct = data.tdsPercentage !== undefined && data.tdsPercentage !== null && data.tdsPercentage !== '';
  const tdsPct = hasTdsPct ? Number(data.tdsPercentage) : 0;
  const hasTdsAmt = (data.tdsAmount !== undefined && data.tdsAmount !== null && data.tdsAmount !== '') ||
                    (data.tdsDeduction !== undefined && data.tdsDeduction !== null && data.tdsDeduction !== '') ||
                    (data.tds !== undefined && data.tds !== null && data.tds !== '');
  const tdsAmount = hasTdsAmt
    ? Number(data.tdsAmount ?? data.tdsDeduction ?? data.tds)
    : (tdsPct > 0 ? Math.round((totalGross * tdsPct) / 100) : 0);

  const rawLeaveCut = Number(data.leaveDeduction || data.lopDeduction || 0);
  const statutoryDeductionsWithoutLeave = empEpfAmount + empEsicAmount + ptAmount + tdsAmount;
  
  // Implied leave cut if payroll record net is lower than gross - statutory
  const rawNet = Number(data.netTakeHome || data.netPayable || data.netSalary || 0);
  const leaveDeduction = rawLeaveCut > 0
    ? rawLeaveCut
    : (rawNet > 0 && rawNet < (totalGross - statutoryDeductionsWithoutLeave)
        ? Math.round(((totalGross - statutoryDeductionsWithoutLeave) - rawNet) * 100) / 100
        : 0);

  // Total Deductions (B) is ALWAYS strictly the sum of all deduction line items in Table B:
  const totalDeductions = statutoryDeductionsWithoutLeave + leaveDeduction;

  // Net Take Home Pay (C = A - B) is ALWAYS strictly totalGross - totalDeductions:
  const netTakeHome = Math.max(0, totalGross - totalDeductions);

  // 3. Employer Contributions & CTC (D & E)
  const hasCompEpfPct = data.companyEpfPercentage !== undefined && data.companyEpfPercentage !== null && data.companyEpfPercentage !== '';
  const compEpfPct = hasCompEpfPct ? Number(data.companyEpfPercentage) : 12;
  const hasCompEpfAmt = (data.companyEpfAmount !== undefined && data.companyEpfAmount !== null && data.companyEpfAmount !== '') ||
                        (data.employerPf !== undefined && data.employerPf !== null && data.employerPf !== '');
  const compEpfAmount = hasCompEpfAmt
    ? Number(data.companyEpfAmount ?? data.employerPf)
    : (compEpfPct > 0 ? Math.round((epfWage * compEpfPct) / 100) : 0);

  const hasCompEsicPct = data.companyEsicPercentage !== undefined && data.companyEsicPercentage !== null && data.companyEsicPercentage !== '';
  const compEsicPct = hasCompEsicPct ? Number(data.companyEsicPercentage) : (totalGross <= 21000 ? 3.25 : 3.25);
  const hasCompEsicAmt = (data.companyEsicAmount !== undefined && data.companyEsicAmount !== null && data.companyEsicAmount !== '') ||
                         (data.employerEsic !== undefined && data.employerEsic !== null && data.employerEsic !== '');
  const compEsicAmount = hasCompEsicAmt
    ? Number(data.companyEsicAmount ?? data.employerEsic)
    : (compEsicPct > 0 ? Math.round((esicWage * compEsicPct) / 100 * 100) / 100 : 0);

  const hasGratuityPct = data.gratuityPercentage !== undefined && data.gratuityPercentage !== null && data.gratuityPercentage !== '';
  const gratuityPct = hasGratuityPct ? Number(data.gratuityPercentage) : 4.81;
  const hasGratuityAmt = data.gratuityAmount !== undefined && data.gratuityAmount !== null && data.gratuityAmount !== '';
  const gratuityAmount = hasGratuityAmt
    ? Number(data.gratuityAmount)
    : (gratuityPct > 0 ? Math.round((basicSalary * gratuityPct) / 100 * 100) / 100 : 0);

  // Total Company Contribution (D) is ALWAYS strictly the sum of employer contributions:
  const totalCompanyCost = compEpfAmount + compEsicAmount + gratuityAmount;

  // Total Cost to Company - CTC (E = A + D) is ALWAYS strictly totalGross + totalCompanyCost:
  const ctcPerMonth = totalGross + totalCompanyCost;
  const ctcPerAnnum = ctcPerMonth * 12;

  // High-Resolution Image Download function with native Tailwind v4 oklch support
  const handleDownloadImage = async () => {
    const el = document.getElementById('printable-salary-slip-doc');
    if (!el) {
      return;
    }

    setDownloading(true);
    const safeName = (empName || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeCode = (empCode || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Salary_Slip_${safeName}_${safeCode}.png`;

    try {
      // Strategy 1: html-to-image (Native Tailwind v4 oklch color & foreignObject rendering)
      try {
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(el, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          width: 840,
          filter: (node: any) => !node.classList || !node.classList.contains('no-print'),
        });

        if (dataUrl) {
          await safeSaveFile(dataUrl, filename, 'image/png');
          setDownloading(false);
          return;
        }
      } catch (h2iErr) {
        console.warn('[html-to-image failed, trying html2canvas fallback]:', h2iErr);
      }

      // Strategy 2: html2canvas with oklch sanitizer
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          // Sanitize any style tags with oklch
          clonedDoc.querySelectorAll('style').forEach((styleTag) => {
            if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
              styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]+\)/g, '#1e293b');
            }
          });
          // Sanitize inline styles
          clonedDoc.querySelectorAll('*').forEach((elem: any) => {
            if (elem.style) {
              const styleStr = elem.getAttribute('style') || '';
              if (styleStr.includes('oklch')) {
                elem.setAttribute('style', styleStr.replace(/oklch\([^)]+\)/g, '#1e293b'));
              }
            }
          });
        },
      });

      if (canvas && canvas.width > 0 && canvas.height > 0) {
        const imageURI = canvas.toDataURL('image/png', 1.0);
        await safeSaveFile(imageURI, filename, 'image/png');
      }
    } catch (err) {
      console.error('Failed to generate salary slip image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const documentContent = (
    <div id="printable-salary-slip-doc" className="salary-slip-paper no-mobile-stack">
      {/* ── Document Header with Himalaya Official Mountain Logo ── */}
      <div className="salary-slip-header">
        <div className="salary-slip-logo-wrap">
          <img
            src="/images/himalaya-logo.png"
            alt="Himalaya Composites & Precast Pvt. Ltd."
            crossOrigin="anonymous"
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
      <table className="salary-slip-emp-table no-mobile-stack flat-table">
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
      <table className="salary-slip-breakdown-table no-mobile-stack flat-table">
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
            <td><strong>Professional Tax (P.Tax)</strong> <small style={{ color: '#64748b' }}>({ptAmount === 0 ? 'Exempt' : ptPct > 0 ? `${ptPct}% of Gross` : 'Standard Slab'})</small></td>
            <td style={{ textAlign: 'right', color: ptAmount > 0 ? '#e11d48' : '#94a3b8' }}>{fmt(ptAmount)}</td>
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
            {tdsAmount > 0 ? (
              <>
                <td><strong>TDS (Income Tax)</strong> <small style={{ color: '#64748b' }}>({tdsPct > 0 ? `${tdsPct}% of Gross` : 'Tax Slab'})</small></td>
                <td style={{ textAlign: 'right', color: '#e11d48', fontWeight: 600 }}>{fmt(tdsAmount)}</td>
              </>
            ) : (
              <>
                <td><strong>TDS (Income Tax)</strong> <small style={{ color: '#94a3b8' }}>(0%)</small></td>
                <td style={{ textAlign: 'right', color: '#94a3b8' }}>₹ 0.00</td>
              </>
            )}
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
      <table className="salary-slip-ctc-table no-mobile-stack flat-table">
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
              {allowDownload && (
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={downloading}
                  className="btn-slip-action btn-slip-download"
                  title="Download Salary Slip as Image"
                >
                  {downloading ? '⏳ Generating Image...' : '🖼️ Download Image'}
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

          <div className="salary-slip-content-body">
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
          {allowDownload && (
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={downloading}
              className="btn-slip-action btn-slip-download"
              title="Download Salary Slip as Image"
            >
              {downloading ? '⏳ Generating Image...' : '🖼️ Download Image'}
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

      <div className="salary-slip-page-scroll-wrap">
        {documentContent}
      </div>
    </div>
  );
}

export default SalarySlipDocument;
