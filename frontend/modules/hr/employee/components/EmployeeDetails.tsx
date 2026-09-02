'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { employeesService } from '@/services/hr/employeesService';
import { useNotificationStore } from '@/store/notificationStore';
import { getBackendAssetUrl } from '@/lib/assetUrl';
import EmployeeAttendanceSummary from './EmployeeAttendanceSummary';
import { 
  User, Briefcase, Phone, Mail, Building, MapPin, 
  Calendar, CreditCard, Shield, FileText, Edit3, 
  Check, X, AlertCircle, Save, ArrowLeft, Eye, Download, Users
} from 'lucide-react';
import styles from './EmployeeDetails.module.css';

const v = (x: any) => (x === undefined || x === null || x === '' ? '—' : String(x));
const d = (x: any) => (x ? new Date(x).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

const Field = ({ label, children, wide = false }: any) => (
  <div className={`${styles.field} ${wide ? styles.wide : ''}`}>
    <span>{label}</span>
    <strong>{children || '—'}</strong>
  </div>
);

const Card = ({ title, children, icon: Icon }: any) => (
  <section className={styles.card}>
    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {Icon && <Icon size={16} color="#0284c7" />}
      {title}
    </h2>
    <div className={styles.grid}>{children}</div>
  </section>
);

export default function EmployeeDetails({ id, onBack }: { id: string; onBack?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useNotificationStore(s => s.showToast);

  const [employee, setEmployee] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  
  const [form, setForm] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'attendance' | 'info'>('info');

  const loadData = async () => {
    try {
      const [empData, depts, locs, mgrs] = await Promise.allSettled([
        employeesService.getEmployee(id),
        employeesService.listDepartments(),
        employeesService.listWorkLocations(),
        employeesService.listReportingManagers(id)
      ]);

      if (empData.status === 'fulfilled') {
        setEmployee(empData.value);
      } else {
        setError('Failed to load employee details');
      }

      if (depts.status === 'fulfilled' && Array.isArray(depts.value)) {
        setDepartments(depts.value);
      }
      if (locs.status === 'fulfilled' && Array.isArray(locs.value)) {
        setLocations(locs.value);
      }
      if (mgrs.status === 'fulfilled' && Array.isArray(mgrs.value)) {
        setManagers(mgrs.value);
      }
    } catch (e: any) {
      setError(e.message || 'Error loading employee');
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (employee && searchParams.get('edit') === '1') {
      initForm(employee);
      setEditing(true);
    }
  }, [employee, searchParams]);

  const initForm = (emp: any) => {
    setForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      fullName: emp.fullName || '',
      dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth).toISOString().split('T')[0] : '',
      gender: emp.gender || 'MALE',
      jobTitle: emp.jobTitle || '',
      departmentId: emp.departmentId || emp.department?.id || '',
      workLocationId: emp.workLocationId || emp.workLocation?.id || '',
      reportingManagerId: emp.reportingManagerId || emp.reportingManager?.id || '',
      employmentType: emp.employmentType || 'PERMANENT',
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      probationEndDate: emp.probationEndDate ? new Date(emp.probationEndDate).toISOString().split('T')[0] : '',
      status: emp.status || 'ACTIVE',
      baseSalary: emp.baseSalary !== undefined ? emp.baseSalary : (emp.salary || 25000),
      branchName: emp.branchName || '',
      workEmail: emp.workEmail || '',
      personalEmail: emp.personalEmail || '',
      phoneNumber: emp.phoneNumber || '',
      companyPhoneNumber: emp.companyPhoneNumber || '',
      residentialAddress: emp.residentialAddress || '',
      permanentAddress: emp.permanentAddress || '',
      emergencyContactName: emp.emergencyContactName || '',
      emergencyContactPhone: emp.emergencyContactPhone || '',
      emergencyRelationship: emp.emergencyRelationship || 'Family',
      panNumber: emp.panNumber || '',
      aadhaarNumber: '',
      uanNumber: emp.uanNumber || '',
      esicNumber: emp.esicNumber || '',
      bankName: emp.bankName || '',
      accountHolderName: emp.accountHolderName || '',
      bankAccountType: emp.bankAccountType || 'SAVINGS',
      bankAccountNumber: '',
      ifscCode: emp.ifscCode || '',
    });
  };

  const handleEditClick = () => {
    router.push(`/hr/register-staff?edit=${id}`);
  };

  const setField = (k: string, val: any) => setForm((p: any) => ({ ...p, [k]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: any = {
        version: employee.version,
        firstName: form.firstName,
        lastName: form.lastName,
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender,
        jobTitle: form.jobTitle,
        departmentId: form.departmentId || null,
        workLocationId: form.workLocationId || null,
        reportingManagerId: form.reportingManagerId || null,
        employmentType: form.employmentType,
        joiningDate: form.joiningDate || null,
        probationEndDate: form.probationEndDate || null,
        status: form.status,
        baseSalary: Number(form.baseSalary || 0),
        branchName: form.branchName || null,
        workEmail: form.workEmail,
        personalEmail: form.personalEmail || null,
        phoneNumber: form.phoneNumber,
        companyPhoneNumber: form.companyPhoneNumber || null,
        residentialAddress: form.residentialAddress,
        permanentAddress: form.permanentAddress || form.residentialAddress,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        emergencyRelationship: form.emergencyRelationship,
        panNumber: form.panNumber,
        uanNumber: form.uanNumber || null,
        esicNumber: form.esicNumber || null,
        bankName: form.bankName,
        accountHolderName: form.accountHolderName,
        bankAccountType: form.bankAccountType,
        ifscCode: form.ifscCode,
      };

      if (form.aadhaarNumber && form.aadhaarNumber.trim().length >= 4) {
        payload.aadhaarNumber = form.aadhaarNumber.trim();
      }
      if (form.bankAccountNumber && form.bankAccountNumber.trim().length >= 4) {
        payload.bankAccountNumber = form.bankAccountNumber.trim();
      }

      const updated = await employeesService.updateEmployee(id, payload);
      setEmployee(updated);
      showToast('Employee profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.data?.message || err.message || 'Failed to update employee details');
      showToast('Update failed: ' + (err?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (!employee) return <div className={styles.state}>{error || 'Loading employee details…'}</div>;

  const docs = employee.documents || [];

  return (
    <main className={styles.page}>
      <button className={styles.back} onClick={() => onBack ? onBack() : router.push('/hr/employees')}>
        <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Back to Employee Roster
      </button>

      {/* Hero Header */}
      <header className={styles.hero}>
        <div className={styles.avatar}>
          {employee.selfieUrl ? (
            <img 
              src={getBackendAssetUrl(employee.selfieUrl)} 
              alt={employee.fullName} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
            />
          ) : (
            employee.fullName?.[0]?.toUpperCase() || 'E'
          )}
        </div>
        <div className={styles.name}>
          <p>Personnel File &amp; Master Record</p>
          <h1>{employee.fullName}</h1>
          <span>
            {employee.jobTitle || 'Staff Member'} · {employee.department?.name || 'Operations'} · {employee.workLocation?.name || 'Headquarters'}
          </span>
        </div>
        <div className={styles.meta}>
          <code>{employee.employeeCode}</code>
          <span style={{ 
            background: employee.status === 'ACTIVE' ? '#16a34a' : '#ef4444', 
            color: '#fff', 
            padding: '4px 10px', 
            borderRadius: '12px', 
            fontSize: '11px', 
            fontWeight: 'bold' 
          }}>
            {employee.status || 'ACTIVE'}
          </span>
          <button onClick={handleEditClick} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Edit3 size={14} /> Edit Information
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div
        className="erp-tab-scroll-bar hr-employee-tab-bar"
        style={{
          display: 'flex',
          borderBottom: '2px solid #e2e8f0',
          gap: '8px',
          overflowX: 'auto',
          width: '100%',
          boxSizing: 'border-box',
          paddingBottom: '2px',
          marginBottom: '20px'
        }}
      >
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '10px 16px',
            fontSize: '13.5px',
            fontWeight: '800',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'info' ? '2.5px solid #0284c7' : '2.5px solid transparent',
            color: activeTab === 'info' ? '#0284c7' : '#64748b',
            cursor: 'pointer',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <User size={16} /> Employee Identity &amp; Profile Details
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            padding: '10px 16px',
            fontSize: '13.5px',
            fontWeight: '800',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'attendance' ? '2.5px solid #0284c7' : '2.5px solid transparent',
            color: activeTab === 'attendance' ? '#0284c7' : '#64748b',
            cursor: 'pointer',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Calendar size={16} /> Attendance Summary &amp; Biometric Logs
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {activeTab === 'attendance' ? (
        <EmployeeAttendanceSummary employeeId={employee.id} />
      ) : (
        <div className={styles.content}>
          {/* Card 1: Personal Identity */}
          <Card title="Personal Identity" icon={User}>
            <Field label="Employee Code">{v(employee.employeeCode)}</Field>
            <Field label="First Name">{v(employee.firstName)}</Field>
            <Field label="Last Name">{v(employee.lastName)}</Field>
            <Field label="Full Legal Name">{v(employee.fullName)}</Field>
            <Field label="Date of Birth">{d(employee.dateOfBirth)}</Field>
            <Field label="Gender">{v(employee.gender)}</Field>
            <Field label="Active Status">{v(employee.status)}</Field>
          </Card>

          {/* Card 2: Employment Profile */}
          <Card title="Employment Information" icon={Briefcase}>
            <Field label="Job Title / Designation">{v(employee.jobTitle)}</Field>
            <Field label="Department">{v(employee.department?.name)}</Field>
            <Field label="Work Location / Unit">{v(employee.workLocation?.name)}</Field>
            <Field label="Branch Name">{v(employee.branchName)}</Field>
            <Field label="Reporting Manager">{v(employee.reportingManager?.fullName)}</Field>
            <Field label="Employment Type">{v(employee.employmentType)}</Field>
            <Field label="Date of Joining">{d(employee.joiningDate)}</Field>
            <Field label="Probation End Date">{d(employee.probationEndDate)}</Field>
            <Field label="Base Monthly Salary">₹{Number(employee.baseSalary || employee.salary || 0).toLocaleString('en-IN')}</Field>
          </Card>

          {/* Card 3: Contact & Addresses */}
          <Card title="Contact & Addresses" icon={Phone}>
            <Field label="Corporate Work Email">{v(employee.workEmail)}</Field>
            <Field label="Personal Email">{v(employee.personalEmail)}</Field>
            <Field label="Primary Mobile Phone">{v(employee.phoneNumber)}</Field>
            <Field label="Company Extension / Phone">{v(employee.companyPhoneNumber)}</Field>
            <Field label="Present Residential Address" wide>
              {v(employee.residentialAddress)}
            </Field>
            <Field label="Permanent Residential Address" wide>
              {v(employee.permanentAddress || employee.residentialAddress)}
            </Field>
          </Card>

          {/* Card 4: Emergency Contacts */}
          <Card title="Emergency Contact" icon={Shield}>
            <Field label="Emergency Contact Person">{v(employee.emergencyContactName)}</Field>
            <Field label="Emergency Contact Phone">{v(employee.emergencyContactPhone)}</Field>
            <Field label="Relationship">{v(employee.emergencyRelationship)}</Field>
          </Card>

          {/* Card 5: Statutory & Banking */}
          <Card title="Statutory Compliance & Bank" icon={CreditCard}>
            <Field label="Income Tax PAN Number">{v(employee.panNumber)}</Field>
            <Field label="Aadhaar Card">{v(employee.aadhaarMasked)}</Field>
            <Field label="Universal Account Number (UAN)">{v(employee.uanNumber)}</Field>
            <Field label="ESIC Registration Number">{v(employee.esicNumber)}</Field>
            <Field label="Bank Institution Name">{v(employee.bankName)}</Field>
            <Field label="Account Holder Name">{v(employee.accountHolderName)}</Field>
            <Field label="Bank Account Number">{v(employee.bankAccountMasked)}</Field>
            <Field label="Account Type">{v(employee.bankAccountType)}</Field>
            <Field label="IFSC Code">{v(employee.ifscCode)}</Field>
          </Card>

          {/* Card 6: Documents & Attachments */}
          <Card title={`Uploaded Documents (${docs.length})`} icon={FileText}>
            {docs.length ? (
              docs.map((doc: any) => (
                <Field key={doc.id} label={doc.documentType?.replaceAll('_', ' ')}>
                  <a 
                    href={getBackendAssetUrl(doc.storageKey || doc.fileUrl || doc.url || `/api/backend/uploads/employees/${doc.storageKey}`)} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: '#0284c7', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <Eye size={13} /> {doc.documentName || doc.originalFileName || 'View Document'}
                  </a>
                </Field>
              ))
            ) : (
              <p className={styles.empty}>No document files attached.</p>
            )}
          </Card>
        </div>
      )}

      {/* Complete Full-Information Edit Modal */}
      {editing && (
        <div className={styles.modal} onClick={() => setEditing(false)}>
          <div className={styles.editor} onClick={(e) => e.stopPropagation()}>
            <div className={styles.editorHeader}>
              <div>
                <h2>Edit Employee File</h2>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Modify registration data, department allocation, and statutory records</span>
              </div>
              <button className={styles.editorCloseBtn} onClick={() => setEditing(false)}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Section 1: Personal Identity */}
              <div className={styles.sectionHeading}>1. Personal Identity &amp; Legal Info</div>
              <div className={styles.formGrid}>
                <label>
                  First Name *
                  <input type="text" required value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
                </label>
                <label>
                  Last Name *
                  <input type="text" required value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
                </label>
                <label>
                  Date of Birth
                  <input type="date" value={form.dateOfBirth} onChange={(e) => setField('dateOfBirth', e.target.value)} />
                </label>
                <label>
                  Gender
                  <select value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
                <label>
                  Employment Status
                  <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_PROBATION">On Probation</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="RESIGNED">Resigned</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </label>
              </div>

              {/* Section 2: Employment & Compensation */}
              <div className={styles.sectionHeading}>2. Employment, Department &amp; Compensation</div>
              <div className={styles.formGrid}>
                <label>
                  Job Title / Designation *
                  <input type="text" required value={form.jobTitle} onChange={(e) => setField('jobTitle', e.target.value)} />
                </label>
                <label>
                  Department
                  <select value={form.departmentId} onChange={(e) => setField('departmentId', e.target.value)}>
                    <option value="">-- Choose Department --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Work Location
                  <select value={form.workLocationId} onChange={(e) => setField('workLocationId', e.target.value)}>
                    <option value="">-- Choose Work Location --</option>
                    {locations.map((loc: any) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Reporting Manager
                  <select value={form.reportingManagerId} onChange={(e) => setField('reportingManagerId', e.target.value)}>
                    <option value="">-- No Direct Manager --</option>
                    {managers.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.fullName} ({m.employeeCode})</option>
                    ))}
                  </select>
                </label>
                <label>
                  Employment Type
                  <select value={form.employmentType} onChange={(e) => setField('employmentType', e.target.value)}>
                    <option value="PERMANENT">Permanent / Full-Time</option>
                    <option value="PROBATION">Probationary</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERN">Intern</option>
                    <option value="TEMPORARY">Temporary</option>
                  </select>
                </label>
                <label>
                  Base Monthly Salary (₹)
                  <input type="number" value={form.baseSalary} onChange={(e) => setField('baseSalary', e.target.value)} />
                </label>
                <label>
                  Date of Joining
                  <input type="date" value={form.joiningDate} onChange={(e) => setField('joiningDate', e.target.value)} />
                </label>
                <label>
                  Probation End Date
                  <input type="date" value={form.probationEndDate} onChange={(e) => setField('probationEndDate', e.target.value)} />
                </label>
                <label>
                  Branch / Plant
                  <input type="text" value={form.branchName} onChange={(e) => setField('branchName', e.target.value)} placeholder="e.g. Unit 1 Plant" />
                </label>
              </div>

              {/* Section 3: Contact & Addresses */}
              <div className={styles.sectionHeading}>3. Contact Information &amp; Addresses</div>
              <div className={styles.formGrid}>
                <label>
                  Work Email (Login ID) *
                  <input type="email" required value={form.workEmail} onChange={(e) => setField('workEmail', e.target.value)} />
                </label>
                <label>
                  Personal Email
                  <input type="email" value={form.personalEmail} onChange={(e) => setField('personalEmail', e.target.value)} />
                </label>
                <label>
                  Primary Mobile Phone *
                  <input type="text" required value={form.phoneNumber} onChange={(e) => setField('phoneNumber', e.target.value)} />
                </label>
                <label>
                  Company Extension Phone
                  <input type="text" value={form.companyPhoneNumber} onChange={(e) => setField('companyPhoneNumber', e.target.value)} />
                </label>
                <label className={styles.full}>
                  Present Residential Address
                  <textarea rows={2} value={form.residentialAddress} onChange={(e) => setField('residentialAddress', e.target.value)} />
                </label>
                <label className={styles.full}>
                  Permanent Address
                  <textarea rows={2} value={form.permanentAddress} onChange={(e) => setField('permanentAddress', e.target.value)} />
                </label>
              </div>

              {/* Section 4: Emergency Contacts */}
              <div className={styles.sectionHeading}>4. Emergency Contacts</div>
              <div className={styles.formGrid}>
                <label>
                  Emergency Contact Name
                  <input type="text" value={form.emergencyContactName} onChange={(e) => setField('emergencyContactName', e.target.value)} />
                </label>
                <label>
                  Emergency Contact Phone
                  <input type="text" value={form.emergencyContactPhone} onChange={(e) => setField('emergencyContactPhone', e.target.value)} />
                </label>
                <label>
                  Relationship
                  <input type="text" value={form.emergencyRelationship} onChange={(e) => setField('emergencyRelationship', e.target.value)} placeholder="Parent / Spouse / Sibling" />
                </label>
              </div>

              {/* Section 5: Statutory & Banking Details */}
              <div className={styles.sectionHeading}>5. Statutory Compliance &amp; Banking Details</div>
              <div className={styles.formGrid}>
                <label>
                  Income Tax PAN Number
                  <input type="text" value={form.panNumber} onChange={(e) => setField('panNumber', e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
                </label>
                <label>
                  Aadhaar Number (Leave blank to keep unchanged)
                  <input type="text" value={form.aadhaarNumber} onChange={(e) => setField('aadhaarNumber', e.target.value)} placeholder="12-digit Aadhaar Number" />
                </label>
                <label>
                  Universal Account Number (UAN)
                  <input type="text" value={form.uanNumber} onChange={(e) => setField('uanNumber', e.target.value)} />
                </label>
                <label>
                  ESIC Number
                  <input type="text" value={form.esicNumber} onChange={(e) => setField('esicNumber', e.target.value)} />
                </label>
                <label>
                  Bank Name
                  <input type="text" value={form.bankName} onChange={(e) => setField('bankName', e.target.value)} placeholder="e.g. HDFC Bank" />
                </label>
                <label>
                  Account Holder Name
                  <input type="text" value={form.accountHolderName} onChange={(e) => setField('accountHolderName', e.target.value)} />
                </label>
                <label>
                  Bank Account Type
                  <select value={form.bankAccountType} onChange={(e) => setField('bankAccountType', e.target.value)}>
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                    <option value="SALARY">Salary Account</option>
                  </select>
                </label>
                <label>
                  Bank Account Number (Leave blank to keep unchanged)
                  <input type="text" value={form.bankAccountNumber} onChange={(e) => setField('bankAccountNumber', e.target.value)} placeholder="Full Account Number" />
                </label>
                <label>
                  IFSC Code
                  <input type="text" value={form.ifscCode} onChange={(e) => setField('ifscCode', e.target.value.toUpperCase())} placeholder="HDFC0001234" />
                </label>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button type="button" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving Changes…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
