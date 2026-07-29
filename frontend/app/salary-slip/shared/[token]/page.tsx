'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SalarySlipDocument from '@/components/payroll/SalarySlipDocument';
import { payrollService } from '@/services/payroll/payrollService';

export default function SharedSalarySlipPage() {
  const token = String(useParams().token || '');
  const [result, setResult] = useState<any>();
  const [error, setError] = useState('');
  useEffect(() => { payrollService.getPublicSharedSalarySlip(token).then(setResult).catch((cause) => setError(cause.message)); }, [token]);
  if (error) return <main style={{ padding: 50, textAlign: 'center' }}><h1>Salary slip unavailable</h1><p>{error}</p></main>;
  if (!result) return <main style={{ padding: 50, textAlign: 'center' }}>Loading salary slip…</main>;
  return <SalarySlipDocument slip={result.salarySlip} publicToken={token} allowDownload={result.allowDownload} />;
}
