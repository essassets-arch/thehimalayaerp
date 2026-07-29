'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SalarySlipDocument from '@/components/payroll/SalarySlipDocument';
import { backendFetch } from '@/lib/backendFetch';

export default function EmployeeSalarySlipPage() {
  const id = String(useParams().id || '');
  const [slip, setSlip] = useState<any>();
  const [error, setError] = useState('');
  useEffect(() => {
    backendFetch<any>(`/api/backend/hr/salary-slips/own/${id}`, { cacheTtlMs: 0 })
      .then(setSlip).catch((cause) => setError(cause.message));
  }, [id]);
  if (error) return <main style={{ padding: 40, textAlign: 'center' }}>You do not have permission to view this salary slip.</main>;
  if (!slip) return <main style={{ padding: 40, textAlign: 'center' }}>Loading salary slip…</main>;
  return <SalarySlipDocument slip={slip} allowDownload={false} />;
}
