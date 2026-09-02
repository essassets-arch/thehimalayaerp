'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { employeesService } from '@/services/hr/employeesService';
import { useNotificationStore } from '@/store/notificationStore';
import { getBackendAssetUrl } from '@/lib/assetUrl';
import SecureImage from '@/shared/components/SecureImage';
import EmployeeAttendanceSummary from './EmployeeAttendanceSummary';
import { 
  User, Briefcase, Phone, Mail, Building, MapPin, 
  Calendar, CreditCard, Shield, FileText, Edit3, 
  Check, X, AlertCircle, Save, ArrowLeft, Eye, Download, Users,
  Plus, Trash2, Upload, ExternalLink, Image as ImageIcon, Sparkles, FileCheck, ZoomIn
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

const Card = ({ title, children, icon: Icon, headerAction }: any) => (
  <section className={styles.card}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e8eef5', background: '#f8fbff' }}>
      <h2 style={{ margin: 0, padding: 0, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#1e3a6d' }}>
        {Icon && <Icon size={16} color="#0284c7" />}
        {title}
      </h2>
      {headerAction}
    </div>
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

  // Dynamic Document Upload State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadForm, setUploadForm] = useState<{
    category: string;
    documentName: string;
    file: File | null;
    previewUrl: string;
  }>({
    category: 'AADHAAR_CARD',
    documentName: '',
    file: null,
    previewUrl: '',
  });

  // Lightbox Zoom Modal State
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; category?: string } | null>(null);

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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) {
      showToast('Please select a file to upload.');
      return;
    }
    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadForm.file);
      fd.append('documentType', uploadForm.category);
      fd.append('category', uploadForm.category);
      if (uploadForm.documentName.trim()) {
        fd.append('documentName', uploadForm.documentName.trim());
      }
      await employeesService.uploadEmployeeDocument(employee.id, fd);
      showToast('Document attached successfully!');
      setUploadModalOpen(false);
      setUploadForm({ category: 'AADHAAR_CARD', documentName: '', file: null, previewUrl: '' });
      await loadData();
    } catch (err: any) {
      showToast(err?.data?.message || err?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId: string, docTitle: string) => {
    if (docId === 'photo-hero' || docId === 'sig-hero') {
      showToast('Primary photo/signature is part of core identity.');
      return;
    }
    const res = await Swal.fire({
      title: 'Delete Document?',
      text: `Are you sure you want to remove "${docTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    });
    if (res.isConfirmed) {
      try {
        await employeesService.deleteEmployeeDocument(employee.id, docId);
        showToast('Document deleted successfully.');
        await loadData();
      } catch (err: any) {
        showToast(err?.message || 'Failed to delete document');
      }
    }
  };

  if (!employee) return <div className={styles.state}>{error || 'Loading employee details…'}</div>;

  const rawDocs = employee.documents || [];
  const allMediaDocs = useMemo(() => {
    const list = [...rawDocs];
    if (employee.selfieUrl && !list.some((d: any) => d.documentType === 'PHOTOGRAPH' || d.storageKey === employee.selfieUrl)) {
      list.unshift({
        id: 'photo-hero',
        documentType: 'PHOTOGRAPH',
        documentName: 'Profile Photograph',
        storageKey: employee.selfieUrl,
        mimeType: 'image/jpeg',
      });
    }
    if (employee.signatureUrl && !list.some((d: any) => d.documentType === 'SIGNATURE' || d.storageKey === employee.signatureUrl)) {
      list.push({
        id: 'sig-hero',
        documentType: 'SIGNATURE',
        documentName: 'Official Digital Signature',
        storageKey: employee.signatureUrl,
        mimeType: 'image/png',
      });
    }
    return list;
  }, [rawDocs, employee.selfieUrl, employee.signatureUrl]);

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

          {/* Card 6: Documents & Media Inspection Gallery */}
          <div className={styles.wide} style={{ gridColumn: '1 / -1' }}>
            <section className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e8eef5', background: '#f8fbff' }}>
                <h2 style={{ margin: 0, padding: 0, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#1e3a6d' }}>
                  <FileText size={16} color="#0284c7" />
                  Uploaded Documents &amp; Verification Gallery ({allMediaDocs.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <Plus size={14} /> Upload Document
                </button>
              </div>

              <div style={{ padding: '18px' }}>
                {allMediaDocs.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {allMediaDocs.map((doc: any) => {
                      const isImage = doc.mimeType?.startsWith('image/') || 
                        ['PHOTOGRAPH', 'SIGNATURE', 'AADHAAR_CARD', 'PAN_CARD', 'BANK_PASSBOOK'].includes(doc.documentType) ||
                        String(doc.storageKey || doc.fileUrl || '').match(/\.(png|jpg|jpeg|webp|gif|svg)$/i);
                      const assetUrl = getBackendAssetUrl(doc.storageKey || doc.fileUrl || doc.url || `/api/backend/uploads/employees/${doc.storageKey}`);
                      const categoryLabel = (doc.documentType || 'DOCUMENT').replaceAll('_', ' ');

                      const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
                        AADHAAR_CARD: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
                        PAN_CARD: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
                        BANK_PASSBOOK: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
                        PHOTOGRAPH: { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' },
                        SIGNATURE: { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
                        OFFER_LETTER: { bg: '#f0fdfa', text: '#0f766e', border: '#ccfbf1' },
                        EXPERIENCE_LETTER: { bg: '#ecfeff', text: '#0e7490', border: '#cffafe' },
                      };
                      const color = categoryColors[doc.documentType] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };

                      return (
                        <div
                          key={doc.id || doc.storageKey}
                          style={{
                            background: '#ffffff',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          }}
                        >
                          {/* Card Top / Category Badge */}
                          <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: '800',
                              letterSpacing: '0.04em',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: color.bg,
                              color: color.text,
                              border: `1px solid ${color.border}`,
                              textTransform: 'uppercase'
                            }}>
                              {categoryLabel}
                            </span>
                            {doc.fileSize && (
                              <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                {(doc.fileSize / 1024).toFixed(0)} KB
                              </span>
                            )}
                          </div>

                          {/* Media Preview Box */}
                          <div
                            style={{
                              height: '160px',
                              background: '#f8fafc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              overflow: 'hidden',
                              cursor: isImage ? 'pointer' : 'default',
                              padding: '8px'
                            }}
                            onClick={() => {
                              if (isImage) {
                                setLightboxImage({ url: assetUrl, title: doc.documentName || categoryLabel, category: categoryLabel });
                              }
                            }}
                          >
                            {isImage ? (
                              <SecureImage
                                src={doc.storageKey || doc.fileUrl}
                                alt={doc.documentName || categoryLabel}
                                allowZoom={false}
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
                              />
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                <FileText size={42} color="#0284c7" />
                                <span style={{ fontSize: '12px', fontWeight: '700' }}>PDF / Document File</span>
                              </div>
                            )}

                            {isImage && (
                              <div style={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '8px',
                                background: 'rgba(15, 23, 42, 0.75)',
                                color: '#ffffff',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <ZoomIn size={12} /> Click to Inspect
                              </div>
                            )}
                          </div>

                          {/* Info & Actions */}
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'space-between' }}>
                            <div>
                              <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>
                                {doc.documentName || doc.originalFileName || categoryLabel}
                              </strong>
                              {doc.originalFileName && doc.originalFileName !== doc.documentName && (
                                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px', wordBreak: 'break-all' }}>
                                  {doc.originalFileName}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                              {isImage ? (
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage({ url: assetUrl, title: doc.documentName || categoryLabel, category: categoryLabel })}
                                  style={{
                                    flex: 1,
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    color: '#1d4ed8',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Eye size={13} /> Inspect
                                </button>
                              ) : (
                                <a
                                  href={assetUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    flex: 1,
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    color: '#1d4ed8',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <ExternalLink size={13} /> Open
                                </a>
                              )}

                              <a
                                href={assetUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                title="Download File"
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  textDecoration: 'none'
                                }}
                              >
                                <Download size={13} />
                              </a>

                              {doc.id !== 'photo-hero' && doc.id !== 'sig-hero' && (
                                <button
                                  type="button"
                                  title="Delete Document"
                                  onClick={() => handleDeleteDoc(doc.id, doc.documentName || categoryLabel)}
                                  style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #cbd5e1' }}>
                    <ImageIcon size={40} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#1e293b' }}>No Verification Documents Attached Yet</h3>
                    <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b' }}>
                      Upload Aadhaar Card, PAN Card, Bank Passbook, Photograph or custom files for this staff member.
                    </p>
                    <button
                      type="button"
                      onClick={() => setUploadModalOpen(true)}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '7px',
                        padding: '8px 18px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={15} /> Upload First Document
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Dynamic Upload Document Modal */}
      {uploadModalOpen && (
        <div className={styles.modal} onClick={() => setUploadModalOpen(false)}>
          <div className={styles.editor} style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.editorHeader}>
              <div>
                <h2>Upload Employee Document</h2>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Attach ID proof, compliance documents, or employee photo/signature
                </span>
              </div>
              <button className={styles.editorCloseBtn} onClick={() => setUploadModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label>
                Document Category *
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(p => ({ ...p, category: e.target.value }))}
                >
                  <option value="AADHAAR_CARD">Aadhaar Card (National ID)</option>
                  <option value="PAN_CARD">PAN Card (Tax ID)</option>
                  <option value="BANK_PASSBOOK">Bank Passbook / Cancelled Cheque</option>
                  <option value="PHOTOGRAPH">Employee Profile Photograph</option>
                  <option value="SIGNATURE">Official Digital Signature</option>
                  <option value="OFFER_LETTER">Appointment / Offer Letter</option>
                  <option value="EXPERIENCE_LETTER">Experience / Relieving Certificate</option>
                  <option value="ID_PROOF">Government Photo ID / Passport / DL</option>
                  <option value="OTHER">Other Corporate Document</option>
                </select>
              </label>

              <label>
                Document Title / Description (Optional)
                <input
                  type="text"
                  placeholder="e.g. Front & Back Aadhaar Scan"
                  value={uploadForm.documentName}
                  onChange={(e) => setUploadForm(p => ({ ...p, documentName: e.target.value }))}
                />
              </label>

              <label>
                Select File (Image / PDF) *
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    const preview = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
                    setUploadForm(p => ({ ...p, file, previewUrl: preview }));
                  }}
                />
              </label>

              {uploadForm.previewUrl && (
                <div style={{ textAlign: 'center', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Selected Image Preview:</span>
                  <img src={uploadForm.previewUrl} alt="Preview" style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }} />
                </div>
              )}

              <div className={styles.actions}>
                <button type="button" onClick={() => setUploadModalOpen(false)}>Cancel</button>
                <button type="submit" disabled={uploadingDoc || !uploadForm.file}>
                  <Upload size={14} /> {uploadingDoc ? 'Uploading…' : 'Upload & Attach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Modal for Images */}
      {lightboxImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setLightboxImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                color: '#ffffff',
              }}
            >
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', display: 'block' }}>{lightboxImage.title}</span>
                {lightboxImage.category && (
                  <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600 }}>{lightboxImage.category}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={lightboxImage.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '7px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <Download size={14} /> Download
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '7px',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              style={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: '#0f172a'
              }}
            />
          </div>
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
