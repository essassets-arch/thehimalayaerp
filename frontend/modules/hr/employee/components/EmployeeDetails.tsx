'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { employeesService } from '@/services/hr/employeesService';
import EmployeeAttendanceSummary from './EmployeeAttendanceSummary';
import styles from './EmployeeDetails.module.css';

const v = (x: any) => (x === undefined || x === null || x === '' ? '—' : String(x));
const d = (x: any) => (x ? new Date(x).toLocaleDateString() : '—');

const Field = ({ label, children, wide = false }: any) => (
  <div className={`${styles.field} ${wide ? styles.wide : ''}`}>
    <span>{label}</span>
    <strong>{children || '—'}</strong>
  </div>
);

const Card = ({ title, children }: any) => (
  <section className={styles.card}>
    <h2>{title}</h2>
    <div className={styles.grid}>{children}</div>
  </section>
);

export default function EmployeeDetails({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [employee, setEmployee] = useState<any>();
  const [form, setForm] = useState<any>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'attendance' | 'info'>('attendance');

  useEffect(() => {
    employeesService
      .getEmployee(id)
      .then(setEmployee)
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (employee && searchParams.get('edit') === '1') {
      setForm({
        ...employee,
        personalEmail: employee.personalEmail || '',
        companyPhoneNumber: employee.companyPhoneNumber || '',
        permanentAddress: employee.permanentAddress || '',
        branchName: employee.branchName || '',
      });
      setEditing(true);
    }
  }, [employee, searchParams]);

  if (!employee) return <div className={styles.state}>{error || 'Loading employee…'}</div>;

  const docs = employee.documents || [];
  const edit = () => {
    setForm({
      ...employee,
      personalEmail: employee.personalEmail || '',
      companyPhoneNumber: employee.companyPhoneNumber || '',
      permanentAddress: employee.permanentAddress || '',
      branchName: employee.branchName || '',
    });
    setEditing(true);
  };

  const set = (k: string, x: string) => setForm((p: any) => ({ ...p, [k]: x }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await employeesService.updateEmployee(id, {
        version: employee.version,
        jobTitle: form.jobTitle,
        personalEmail: form.personalEmail || null,
        phoneNumber: form.phoneNumber,
        companyPhoneNumber: form.companyPhoneNumber || null,
        residentialAddress: form.residentialAddress,
        permanentAddress: form.permanentAddress || form.residentialAddress,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        emergencyRelationship: form.emergencyRelationship,
        branchName: form.branchName || null,
      });
      setEmployee(r);
      setEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <button className={styles.back} onClick={() => router.push('/hr/employees')}>
        ← Back to employees
      </button>

      <header className={styles.hero}>
        <div className={styles.avatar}>{employee.fullName?.[0] || 'E'}</div>
        <div className={styles.name}>
          <p>Employee profile</p>
          <h1>{employee.fullName}</h1>
          <span>
            {employee.jobTitle} · {employee.department?.name || 'Operations'} · {employee.workLocation?.name || 'Ahmedabad Plant'}
          </span>
        </div>
        <div className={styles.meta}>
          <code>{employee.employeeCode}</code>
          <button onClick={edit}>Edit employee</button>
        </div>
      </header>

      {/* Primary Tab Navigation */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '800',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'attendance' ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === 'attendance' ? '#4f46e5' : '#64748b',
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          📅 Attendance Summary &amp; Logs
        </button>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '800',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'info' ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === 'info' ? '#4f46e5' : '#64748b',
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          👤 Employee Identity &amp; Info
        </button>
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      {activeTab === 'attendance' ? (
        <EmployeeAttendanceSummary employeeId={employee.id} />
      ) : (
        <div className={styles.content}>
          <Card title="Employee identity">
            <Field label="Employee ID">{v(employee.employeeCode)}</Field>
            <Field label="First name">{v(employee.firstName)}</Field>
            <Field label="Last name">{v(employee.lastName)}</Field>
            <Field label="Full name">{v(employee.fullName)}</Field>
            <Field label="Date of birth">{d(employee.dateOfBirth)}</Field>
            <Field label="Gender">{v(employee.gender)}</Field>
          </Card>
          <Card title="Employment information">
            <Field label="Job title">{v(employee.jobTitle)}</Field>
            <Field label="Department">{v(employee.department?.name)}</Field>
            <Field label="Work location">{v(employee.workLocation?.name)}</Field>
            <Field label="Manager">{v(employee.reportingManager?.fullName)}</Field>
            <Field label="Employment type">{v(employee.employmentType)}</Field>
            <Field label="Joining date">{d(employee.joiningDate)}</Field>
          </Card>
          <Card title="Contact information">
            <Field label="Work email">{v(employee.workEmail)}</Field>
            <Field label="Personal email">{v(employee.personalEmail)}</Field>
            <Field label="Mobile phone">{v(employee.phoneNumber)}</Field>
            <Field label="Company phone">{v(employee.companyPhoneNumber)}</Field>
            <Field label="Present address" wide>
              {v(employee.residentialAddress)}
            </Field>
            <Field label="Permanent address" wide>
              {v(employee.permanentAddress || employee.residentialAddress)}
            </Field>
          </Card>
          <Card title="Emergency contact">
            <Field label="Name">{v(employee.emergencyContactName)}</Field>
            <Field label="Phone">{v(employee.emergencyContactPhone)}</Field>
            <Field label="Relationship">{v(employee.emergencyRelationship)}</Field>
          </Card>
          <Card title="Statutory and bank">
            <Field label="PAN">{v(employee.panNumber)}</Field>
            <Field label="Aadhaar">{v(employee.aadhaarMasked)}</Field>
            <Field label="UAN">{v(employee.uanNumber)}</Field>
            <Field label="ESIC">{v(employee.esicNumber)}</Field>
            <Field label="Bank">{v(employee.bankName)}</Field>
            <Field label="Account">{v(employee.bankAccountMasked)}</Field>
            <Field label="IFSC">{v(employee.ifscCode)}</Field>
          </Card>
          <Card title={`Documents (${docs.length})`}>
            {docs.length ? (
              docs.map((x: any) => (
                <Field key={x.id} label={x.documentType?.replaceAll('_', ' ')}>
                  <a href={`/api/backend/uploads/employees/${x.storageKey}`} target="_blank" rel="noreferrer">
                    Preview {x.documentName || x.originalFileName}
                  </a>
                </Field>
              ))
            ) : (
              <p className={styles.empty}>No documents uploaded.</p>
            )}
          </Card>
        </div>
      )}

      {editing && (
        <div className={styles.modal}>
          <div className={styles.editor}>
            <h2>Edit employee</h2>
            {[
              ['jobTitle', 'Job title'],
              ['phoneNumber', 'Mobile Phone'],
              ['companyPhoneNumber', 'Company Phone'],
              ['personalEmail', 'Personal email'],
              ['emergencyContactName', 'Emergency name'],
              ['emergencyContactPhone', 'Emergency phone'],
              ['emergencyRelationship', 'Relationship'],
              ['branchName', 'Branch'],
            ].map(([k, l]) => (
              <label key={k}>
                {l}
                <input value={form[k] || ''} onChange={(e) => set(k, e.target.value)} />
              </label>
            ))}
            <label className={styles.full}>
              Present Address
              <textarea value={form.residentialAddress || ''} onChange={(e) => set('residentialAddress', e.target.value)} />
            </label>
            <label className={styles.full}>
              Permanent Address
              <textarea value={form.permanentAddress || ''} onChange={(e) => set('permanentAddress', e.target.value)} />
            </label>
            <div className={styles.actions}>
              <button onClick={() => setEditing(false)}>Cancel</button>
              <button onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
