'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SalarySlipDocument from '@/components/payroll/SalarySlipDocument';
import { payrollService } from '@/services/payroll/payrollService';

export default function FinanceSalarySlipPage() {
  const params = useParams();
  const payrollId = String(params.payrollId || '');
  const [slip, setSlip] = useState<any>();
  const [error, setError] = useState('');
  useEffect(() => { payrollService.getSalarySlipByPayrollId(payrollId).then(setSlip).catch((cause) => setError(cause.message)); }, [payrollId]);
  useEffect(() => {
    if (slip && new URLSearchParams(window.location.search).get('print') === '1') {
      setTimeout(() => window.print(), 300);
    }
  }, [slip]);
  if (error) return <main style={{ padding: 40, textAlign: 'center' }}>{error.includes('permission') ? 'You do not have permission to view this salary slip.' : 'Salary slip not found.'}</main>;
  if (!slip) return <main style={{ padding: 40, textAlign: 'center' }}>Loading salary slip…</main>;
  return <SalarySlipDocument slip={slip} />;
}
