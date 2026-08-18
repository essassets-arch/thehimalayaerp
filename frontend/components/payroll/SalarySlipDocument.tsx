'use client';

import Swal from 'sweetalert2';
import { payrollService } from '@/services/payroll/payrollService';
import { useState } from 'react';

const money = (value: unknown) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const display = (value: unknown) =>
  value === undefined || value === null || value === '' ? 'N/A' : String(value);

export default function SalarySlipDocument({
  slip,
  publicToken,
  allowDownload = true,
}: {
  slip: any;
  publicToken?: string;
  allowDownload?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      if (publicToken) {
        await payrollService.downloadPublicSharedSalarySlip(publicToken);
      } else {
        await payrollService.downloadSalarySlipPdf(slip.id);
      }
      await Swal.fire('Downloaded', 'Salary slip downloaded successfully.', 'success');
    } catch (error: any) {
      await Swal.fire('Download failed', error.message, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!publicToken) {
      await payrollService.auditSalarySlipPrint(slip.id).catch(() => undefined);
    }
    window.print();
  };

  return (
    <div className="salary-slip-container">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print,
          aside,
          nav,
          header,
          footer:not(.slip-footer) {
            display: none !important;
          }
          .salary-slip {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: 1px solid #94a3b8 !important;
            margin: 0 !important;
            padding: 24px !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Action Controls Bar */}
      <div
        className="no-print"
        style={{
          maxWidth: 900,
          margin: '16px auto',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
          padding: '12px 20px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}
      >
        <span style={{ fontSize: 14, color: '#475569', fontWeight: 600 }}>
          Salary Slip &mdash; {display(slip.salaryMonthName)} {slip.salaryYear}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          {allowDownload && (
            <button
              disabled={downloading}
              onClick={download}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 8,
                fontWeight: 600,
                cursor: downloading ? 'not-allowed' : 'pointer',
              }}
            >
              {downloading ? 'Downloading…' : '📥 Download PDF'}
            </button>
          )}
          <button
            onClick={handlePrint}
            style={{
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Printable Salary Slip Document Card */}
      <article
        className="salary-slip"
        style={{
          maxWidth: 900,
          margin: '0 auto 32px',
          background: '#ffffff',
          color: '#1e293b',
          padding: 40,
          border: '1px solid #cbd5e1',
          borderRadius: 14,
          boxShadow: '0 10px 35px rgba(15, 23, 42, 0.08)',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header Section */}
        <section
          style={{
            textAlign: 'center',
            borderBottom: '3px solid #1e3a8a',
            paddingBottom: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#1e3a8a',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 12px',
              fontWeight: 900,
              fontSize: 24,
            }}
          >
            H
          </div>
          <h1 style={{ margin: 0, fontSize: 22, color: '#0f172a', fontWeight: 800 }}>
            {display(slip.company?.name).toUpperCase()}
          </h1>
          <p style={{ margin: '4px 0', fontSize: 13, color: '#475569' }}>
            {display(slip.company?.address)}
          </p>
          <small style={{ color: '#64748b', fontSize: 12 }}>
            {[slip.company?.email, slip.company?.phone].filter(Boolean).join(' · ')}
          </small>
          <h2
            style={{
              margin: '20px 0 4px',
              letterSpacing: 2,
              color: '#1e3a8a',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            SALARY SLIP
          </h2>
          <strong style={{ fontSize: 14, color: '#334155' }}>
            {display(slip.salaryMonthName)} {slip.salaryYear}
          </strong>
          <div
            style={{
              display: 'flex',
              justify: 'center',
              gap: 28,
              marginTop: 10,
              fontSize: 13,
              color: '#475569',
            }}
          >
            <span>
              Slip No: <b style={{ color: '#0f172a' }}>{display(slip.slipNumber)}</b>
            </span>
            <span>
              Payroll No: <b style={{ color: '#0f172a' }}>{display(slip.payrollNumber)}</b>
            </span>
          </div>
        </section>

        {/* Employee Information */}
        <Section title="Employee Information">
          <Info label="Employee Name" value={slip.employee?.fullName} />
          <Info label="Employee ID" value={slip.employee?.employeeId} />
          <Info label="Department" value={slip.employee?.department} />
          <Info label="Designation" value={slip.employee?.designation} />
          <Info label="Work Location" value={slip.employee?.location} />
          <Info
            label="Date of Joining"
            value={String(slip.employee?.joiningDate || '').slice(0, 10)}
          />
          <Info label="Employment Type" value={slip.employee?.employmentType} />
          <Info label="PAN Number" value={slip.employee?.panNumber} />
          <Info label="UAN Number" value={slip.employee?.uanNumber} />
          <Info label="ESIC Number" value={slip.employee?.esicNumber} />
          <Info label="Bank Name" value={slip.employee?.bankName} />
          <Info label="Account Number" value={slip.employee?.maskedAccountNumber} />
          <Info label="IFSC Code" value={slip.employee?.ifscCode} />
        </Section>

        {/* Attendance Summary */}
        <Section title="Attendance Summary">
          {[
            ['Calendar Days', 'calendarDays'],
            ['Standard Working Days', 'standardWorkingDays'],
            ['Present Days', 'presentDays'],
            ['Paid Leave Days', 'paidLeaveDays'],
            ['Unpaid Leave Days', 'unpaidLeaveDays'],
            ['Half Days', 'halfDays'],
            ['Weekly-Off Days', 'weeklyOffDays'],
            ['Holidays', 'holidays'],
            ['Payable Days', 'payableDays'],
            ['Overtime Hours', 'overtimeHours'],
          ].map(([label, key]) => (
            <Info key={key} label={label} value={slip.attendance?.[key]} />
          ))}
        </Section>

        {/* Earnings & Deductions Breakdown Table */}
        <section style={{ marginTop: 24 }}>
          <h3 style={heading}>Earnings and Deductions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            <Statement
              title="EARNINGS"
              rows={slip.earnings}
              totalLabel="Gross Earnings"
              total={slip.grossEarnings}
            />
            <Statement
              title="DEDUCTIONS"
              rows={slip.deductions}
              totalLabel="Total Deductions"
              total={slip.totalDeductions}
            />
          </div>
        </section>

        {/* Net Salary Paid Highlight Container */}
        <section
          style={{
            marginTop: 28,
            padding: 24,
            textAlign: 'center',
            background: '#eff6ff',
            border: '2px solid #1e3a8a',
            borderRadius: 12,
          }}
        >
          <small style={{ fontWeight: 800, letterSpacing: 2, color: '#1e3a8a' }}>
            NET SALARY PAID
          </small>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#0f172a',
              margin: '8px 0',
            }}
          >
            {money(slip.netPaid)}
          </div>
          <em style={{ color: '#334155', fontSize: 13 }}>{display(slip.netPaidInWords)}</em>
        </section>

        {/* Payment Information */}
        <Section title="Payment Information">
          <Info label="Payment Status" value={slip.payment ? 'Paid' : 'N/A'} />
          <Info label="Paid Amount" value={money(slip.payment?.paidAmount)} />
          <Info
            label="Payment Date"
            value={String(slip.payment?.paymentDate || '').slice(0, 10)}
          />
          <Info label="Payment Mode" value={slip.payment?.paymentMode} />
          <Info label="UTR Number" value={slip.payment?.utrNumber} />
          <Info label="Transaction Reference" value={slip.payment?.transactionReference} />
          <Info label="Processed By" value={slip.payment?.processedBy} />
          <Info
            label="Processing Date"
            value={String(slip.payment?.processedAt || '').slice(0, 10)}
          />
        </Section>

        {/* Footer Statement */}
        <footer
          className="slip-footer"
          style={{
            marginTop: 36,
            paddingTop: 18,
            borderTop: '1px solid #cbd5e1',
            textAlign: 'center',
            color: '#64748b',
            fontSize: 12,
          }}
        >
          <p style={{ margin: '3px 0' }}>
            This is a system-generated salary slip and does not require a physical signature.
          </p>
          <p style={{ margin: '3px 0' }}>
            Confidential payroll document. Generated electronically on{' '}
            {new Date(slip.generatedAt || Date.now()).toLocaleDateString('en-IN')}.
          </p>
        </footer>
      </article>
    </div>
  );
}

const heading = {
  fontSize: 13,
  textTransform: 'uppercase' as const,
  letterSpacing: 1.5,
  color: '#1e3a8a',
  borderBottom: '2px solid #94a3b8',
  paddingBottom: 6,
  marginBottom: 12,
  fontWeight: 700,
};

function Section({ title, children }: any) {
  return (
    <section style={{ marginTop: 24 }}>
      <h3 style={heading}>{title}</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          columnGap: 32,
          rowGap: 10,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Info({ label, value }: any) {
  return (
    <div
      style={{
        display: 'flex',
        justify: 'space-between',
        gap: 12,
        borderBottom: '1px dotted #e2e8f0',
        paddingBottom: 4,
        fontSize: 13,
      }}
    >
      <span style={{ color: '#64748b' }}>{label}</span>
      <b style={{ color: '#0f172a', textAlign: 'right' }}>{display(value)}</b>
    </div>
  );
}

function Statement({ title, rows, totalLabel, total }: any) {
  return (
    <div
      style={{
        background: '#f8fafc',
        padding: 16,
        borderRadius: 10,
        border: '1px solid #e2e8f0',
      }}
    >
      <strong style={{ color: '#1e3a8a', fontSize: 13, letterSpacing: 1 }}>{title}</strong>
      <div style={{ marginTop: 8 }}>
        {(rows || []).map((row: any, idx: number) => (
          <div
            key={row.key || idx}
            style={{
              display: 'flex',
              justify: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid #e2e8f0',
              fontSize: 13,
            }}
          >
            <span style={{ color: '#334155' }}>{row.label}</span>
            <b style={{ color: '#0f172a' }}>{money(row.amount)}</b>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          padding: '10px 0 0',
          borderTop: '2px solid #1e3a8a',
          marginTop: 8,
          fontSize: 14,
        }}
      >
        <strong style={{ color: '#0f172a' }}>{totalLabel}</strong>
        <strong style={{ color: '#1e3a8a' }}>{money(total)}</strong>
      </div>
    </div>
  );
}
