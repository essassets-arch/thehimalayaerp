'use client';
import Swal from 'sweetalert2';
import { payrollService } from '@/services/payroll/payrollService';
import { useState } from 'react';

const money = (value: unknown) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const display = (value: unknown) => value === undefined || value === null || value === '' ? 'N/A' : String(value);

export default function SalarySlipDocument({ slip, publicToken, allowDownload = true }: { slip: any; publicToken?: string; allowDownload?: boolean }) {
  const [downloading, setDownloading] = useState(false);
  const download = async () => {
    setDownloading(true);
    try {
      if (publicToken) await payrollService.downloadPublicSharedSalarySlip(publicToken);
      else await payrollService.downloadSalarySlipPdf(slip.id);
      await Swal.fire('Downloaded', 'Salary slip downloaded successfully.', 'success');
    } catch (error: any) { await Swal.fire('Download failed', error.message, 'error'); }
    finally { setDownloading(false); }
  };
  return <div>
    <style jsx global>{`
      @media print {
        .no-print, aside, nav, header { display: none !important; }
        .salary-slip { width: 100% !important; box-shadow: none !important; border: none !important; margin: 0 !important; }
        body { background: white !important; }
      }
    `}</style>
    <div className="no-print" style={{ maxWidth: 900, margin: '16px auto', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
      {allowDownload && <button disabled={downloading} onClick={download}>{downloading ? 'Downloading…' : 'Download PDF'}</button>}
      <button onClick={async () => { if (!publicToken) await payrollService.auditSalarySlipPrint(slip.id).catch(() => undefined); window.print(); }}>Print</button>
    </div>
    <article className="salary-slip" style={{ maxWidth: 900, margin: '0 auto 32px', background: '#fff', color: '#172033', padding: 40, border: '1px solid #d9e1ec', boxShadow: '0 10px 35px rgba(20,35,60,.08)', fontFamily: 'Arial, sans-serif' }}>
      <section style={{ textAlign: 'center', borderBottom: '3px solid #29456f', paddingBottom: 20 }}>
        <div style={{ width: 54, height: 54, borderRadius: 12, background: '#29456f', color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 10px', fontWeight: 800 }}>H</div>
        <h1 style={{ margin: 0, fontSize: 23 }}>{display(slip.company?.name).toUpperCase()}</h1>
        <p style={{ margin: '5px 0' }}>{display(slip.company?.address)}</p>
        <small>{[slip.company?.email, slip.company?.phone].filter(Boolean).join(' · ')}</small>
        <h2 style={{ margin: '22px 0 4px', letterSpacing: 3 }}>SALARY SLIP</h2>
        <strong>{slip.salaryMonthName} {slip.salaryYear}</strong>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 10, fontSize: 13 }}>
          <span>Slip No: <b>{slip.slipNumber}</b></span><span>Payroll No: <b>{slip.payrollNumber}</b></span>
        </div>
      </section>
      <Section title="Employee Information">
        <Info label="Employee Name" value={slip.employee?.fullName} /><Info label="Employee ID" value={slip.employee?.employeeId} />
        <Info label="Department" value={slip.employee?.department} /><Info label="Designation" value={slip.employee?.designation} />
        <Info label="Work Location" value={slip.employee?.location} /><Info label="Date of Joining" value={String(slip.employee?.joiningDate || '').slice(0, 10)} />
        <Info label="Employment Type" value={slip.employee?.employmentType} /><Info label="PAN Number" value={slip.employee?.panNumber} />
        <Info label="UAN Number" value={slip.employee?.uanNumber} /><Info label="ESIC Number" value={slip.employee?.esicNumber} />
        <Info label="Bank Name" value={slip.employee?.bankName} /><Info label="Account Number" value={slip.employee?.maskedAccountNumber} />
        <Info label="IFSC Code" value={slip.employee?.ifscCode} />
      </Section>
      <Section title="Attendance Summary">
        {[['Calendar Days', 'calendarDays'], ['Standard Working Days', 'standardWorkingDays'], ['Present Days', 'presentDays'], ['Paid Leave Days', 'paidLeaveDays'], ['Unpaid Leave Days', 'unpaidLeaveDays'], ['Half Days', 'halfDays'], ['Weekly-Off Days', 'weeklyOffDays'], ['Holidays', 'holidays'], ['Payable Days', 'payableDays'], ['Overtime Hours', 'overtimeHours']].map(([label, key]) => <Info key={key} label={label} value={slip.attendance?.[key]} />)}
      </Section>
      <section style={{ marginTop: 24 }}>
        <h3 style={heading}>Earnings and Deductions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
          <Statement title="EARNINGS" rows={slip.earnings} totalLabel="Gross Earnings" total={slip.grossEarnings} />
          <Statement title="DEDUCTIONS" rows={slip.deductions} totalLabel="Total Deductions" total={slip.totalDeductions} />
        </div>
      </section>
      <section style={{ marginTop: 28, padding: 24, textAlign: 'center', background: '#edf6ff', border: '2px solid #29456f', borderRadius: 10 }}>
        <small style={{ fontWeight: 700, letterSpacing: 2 }}>NET SALARY PAID</small>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#163863', margin: '7px 0' }}>{money(slip.netPaid)}</div>
        <em>{slip.netPaidInWords}</em>
      </section>
      <Section title="Payment Information">
        <Info label="Payment Status" value={slip.payment ? 'Paid' : 'N/A'} /><Info label="Paid Amount" value={money(slip.payment?.paidAmount)} />
        <Info label="Payment Date" value={String(slip.payment?.paymentDate || '').slice(0, 10)} /><Info label="Payment Mode" value={slip.payment?.paymentMode} />
        <Info label="UTR Number" value={slip.payment?.utrNumber} /><Info label="Transaction Reference" value={slip.payment?.transactionReference} />
        <Info label="Processed By" value={slip.payment?.processedBy} /><Info label="Processing Date" value={String(slip.payment?.processedAt || '').slice(0, 10)} />
      </Section>
      <footer style={{ marginTop: 35, paddingTop: 18, borderTop: '1px solid #b8c3d1', textAlign: 'center', color: '#536174', fontSize: 12 }}>
        <p>This is a system-generated salary slip and does not require a physical signature.</p>
        <p>Confidential payroll document. Generated electronically on {new Date(slip.generatedAt).toLocaleDateString('en-IN')}.</p>
      </footer>
    </article>
  </div>;
}
const heading = { fontSize: 14, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#29456f', borderBottom: '1px solid #aebdce', paddingBottom: 8 };
function Section({ title, children }: any) { return <section style={{ marginTop: 24 }}><h3 style={heading}>{title}</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', columnGap: 35, rowGap: 11 }}>{children}</div></section>; }
function Info({ label, value }: any) { return <div style={{ display: 'flex', justifyContent: 'space-between', gap: 15, borderBottom: '1px dotted #d3dae4', paddingBottom: 4 }}><span style={{ color: '#667085' }}>{label}</span><b style={{ textAlign: 'right' }}>{display(value)}</b></div>; }
function Statement({ title, rows, totalLabel, total }: any) { return <div><strong>{title}</strong>{(rows || []).map((row: any) => <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e8edf3' }}><span>{row.label}</span><b>{money(row.amount)}</b></div>)}<div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderTop: '2px solid #29456f', marginTop: 5 }}><strong>{totalLabel}</strong><strong>{money(total)}</strong></div></div>; }
