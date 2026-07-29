'use client';

import { useEffect, useState } from 'react';
import { employeesService } from '@/services/hr/employeesService';

export default function EmployeeDetails({ id }: { id: string }) {
  const [employee, setEmployee] = useState<any>();
  const [error, setError] = useState('');

  useEffect(() => {
    employeesService.getEmployee(id).then(setEmployee).catch((cause) => setError(cause.message));
  }, [id]);

  if (error) return <div className="app-card">Unable to load employee: {error}</div>;
  if (!employee) return <div className="app-card">Loading employee…</div>;

  const Section = ({ title, children }: any) => (
    <section style={{ padding: 18, border: '1px solid #e5ecf5', borderRadius: 12 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>{children}</div>
    </section>
  );
  const Item = ({ label, value }: any) => <div><small style={{ color: '#667085' }}>{label}</small><div>{value || '—'}</div></div>;

  return (
    <div className="app-card" style={{ display: 'grid', gap: 16 }}>
      <h2>{employee.fullName} <small>({employee.employeeCode})</small></h2>
      <Section title="Employment Information">
        <Item label="Job title" value={employee.jobTitle} />
        <Item label="Department" value={employee.department?.name} />
        <Item label="Work location" value={employee.workLocation?.name} />
        <Item label="Manager" value={employee.reportingManager?.fullName} />
        <Item label="Status" value={employee.status} />
      </Section>
      <Section title="Contact Information">
        <Item label="Work email" value={employee.workEmail} />
        <Item label="Phone" value={employee.phoneNumber} />
        <Item label="Address" value={employee.residentialAddress} />
      </Section>
      <Section title="Masked Statutory and Bank Information">
        <Item label="PAN" value={employee.panNumber} />
        <Item label="Aadhaar" value={employee.aadhaarMasked} />
        <Item label="Bank account" value={employee.bankAccountMasked} />
        <Item label="IFSC" value={employee.ifscCode} />
      </Section>
      <Section title="Documents">
        {employee.documents?.map((document: any) => <Item key={document.id} label={document.documentType} value={`${document.documentName} (${document.status})`} />)}
      </Section>
      <Section title="Audit Information">
        <Item label="Version" value={employee.version} />
        <Item label="Created" value={new Date(employee.createdAt).toLocaleString()} />
        <Item label="Updated" value={new Date(employee.updatedAt).toLocaleString()} />
      </Section>
    </div>
  );
}
