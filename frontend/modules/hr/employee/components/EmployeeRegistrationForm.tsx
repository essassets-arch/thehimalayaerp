'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import {
  User, Briefcase, Phone, AlertCircle, FileText, Building2,
  Upload, Trash2, Eye, RefreshCw, Plus, Check, X, Camera, PenTool,
  ChevronDown, ChevronUp, Save, UserPlus, ArrowLeft, Shield, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/notificationStore';
import { employeeRegistrationSchema } from '../employee.schema';
import { employeesService } from '@/services/hr/employeesService';

// ── Constants ──────────────────────────────────────────────────
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary', 'Consultant'] as const;
const DRAFT_VERSION = 1;
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
const EMERGENCY_RELATIONSHIPS = ['Parent', 'Spouse', 'Sibling', 'Relative', 'Friend', 'Other'] as const;
const ACCOUNT_TYPES = ['Savings', 'Current', 'Salary'] as const;

const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTRA_TYPES = [...ALLOWED_DOC_TYPES, 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2 MB

const ADDITIONAL_DOC_TYPES = ['Resume', 'Passport', 'Education Certificate', 'Experience Letter', 'Background Check', 'Other'];

// Helper: generate a random ID
const genId = () => `doc_${Date.now()}_${Math.floor(Math.random() * 99999)}`;

// Helper: convert File to Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper: format bytes
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Types
interface DocState {
  meta: { id: string; fileName: string; mimeType: string; size: number; category: string; title: string; storageKey: string; uploadedAt: string } | null;
  previewUrl: string | null;
  blob: File | null;
}

interface AdditionalDoc {
  rowId: string;
  docType: string;
  customTitle: string;
  meta: DocState['meta'];
  previewUrl: string | null;
  blob: File | null;
}

// Field wrapper component
function FormField({
  label, required: req, error, children, hint,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '3px' }}>
        {label}{req && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {hint && !error && <span style={{ fontSize: '11px', color: '#64748b' }}>{hint}</span>}
      {error && (
        <span style={{ fontSize: '11.5px', color: '#ef4444', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </div>
  );
}

// Document upload component
function DocUploadBox({
  label, category, accept, maxSize, value, onChange, error,
}: {
  label: string; category: string; accept: string; maxSize: number;
  value: DocState; onChange: (v: DocState) => void; error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFile = !!value.meta;

  const handleFile = async (file: File) => {
    if (!accept.split(',').some(t => file.type.includes(t.trim().split('/')[1]))) {
      Swal.fire('Invalid File', `Only ${accept} files are allowed.`, 'error');
      return;
    }
    if (file.size > maxSize) {
      Swal.fire('File Too Large', `Maximum allowed size is ${formatBytes(maxSize)}.`, 'error');
      return;
    }
    if (value.previewUrl) URL.revokeObjectURL(value.previewUrl);

    const storageKey = `draft_${category}_${Date.now()}`;
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    onChange({
      meta: {
        id: genId(),
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        category,
        title: label,
        storageKey,
        uploadedAt: new Date().toISOString(),
      },
      previewUrl,
      blob: file,
    });
  };

  const handleRemove = () => {
    if (value.previewUrl) URL.revokeObjectURL(value.previewUrl);
    onChange({ meta: null, previewUrl: null, blob: null });
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{
      border: `1.5px dashed ${error ? '#ef4444' : hasFile ? '#2563eb' : '#cbd5e1'}`,
      borderRadius: '10px',
      padding: '16px',
      background: hasFile ? '#f0f6ff' : error ? '#fef2f2' : '#f8fafc',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{label}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {hasFile && value.previewUrl && (
            <a href={value.previewUrl} target="_blank" rel="noopener noreferrer">
              <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Eye size={12} /> Preview
              </button>
            </a>
          )}
          <button type="button" onClick={() => inputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Upload size={12} /> {hasFile ? 'Replace' : 'Upload'}
          </button>
          {hasFile && (
            <button type="button" onClick={handleRemove} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
      {hasFile && value.meta && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          {value.previewUrl ? (
            <img src={value.previewUrl} alt="preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
          ) : (
            <div style={{ width: '48px', height: '48px', background: '#e0f2fe', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} color="#0284c7" />
            </div>
          )}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', wordBreak: 'break-all' }}>{value.meta.fileName}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{formatBytes(value.meta.size)}</div>
          </div>
        </div>
      )}
      {!hasFile && (
        <div style={{ textAlign: 'center', padding: '12px 0', color: '#64748b', fontSize: '12px' }}>
          <Upload size={22} style={{ marginBottom: '4px', opacity: 0.5 }} />
          <div>Click Upload to attach (PDF, JPG, PNG — max {formatBytes(maxSize)})</div>
        </div>
      )}
      {error && <span style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: '600' }}><AlertCircle size={12} /> {error}</span>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

export default function EmployeeRegistrationForm() {
  const navigate = useRouter();
  const showToast = useNotificationStore((s: any) => s.showToast);
  const [activeStep, setActiveStep] = useState<number>(1);

  const [departments, setDepartments] = useState<any[]>([]);
  const [workLocations, setWorkLocations] = useState<any[]>([]);
  const [eligibleManagers, setEligibleManagers] = useState<any[]>([]);

  // Form setup
  const {
    register, control, handleSubmit, watch, setValue, reset, setError,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(employeeRegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      additionalDocuments: [],
      photograph: '',
      signature: '',
    },
  });

  // Document states
  const [aadhaarDoc, setAadhaarDoc] = useState<DocState>({ meta: null, previewUrl: null, blob: null });
  const [panDoc, setPanDoc] = useState<DocState>({ meta: null, previewUrl: null, blob: null });
  const [bankDoc, setBankDoc] = useState<DocState>({ meta: null, previewUrl: null, blob: null });
  const [additionalDocs, setAdditionalDocs] = useState<AdditionalDoc[]>([]);
  const [photograph, setPhotograph] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [photographFile, setPhotographFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [sigPreview, setSigPreview] = useState<string>('');

  // Draft state
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftId, setDraftId] = useState<string | undefined>();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Department search
  const [deptSearch, setDeptSearch] = useState('');
  const [deptOpen, setDeptOpen] = useState(false);
  const watchedDept = watch('department');

  useEffect(() => {
    Promise.all([
      employeesService.listDepartments(),
      employeesService.listWorkLocations(),
      employeesService.listReportingManagers(),
      employeesService.listDrafts(),
    ]).then(([departmentRows, locations, managers, drafts]) => {
      setDepartments(departmentRows);
      setWorkLocations(locations);
      setEligibleManagers(managers);
      const latest = drafts[0];
      if (latest?.employeeData) {
        reset(latest.employeeData);
        setDraftId(latest.id);
        setDraftRestored(true);
        showToast('Employee registration draft restored.');
      }
    }).catch((error) => console.warn('HR data load fallback:', error.message));
  }, [reset, showToast]);

  // Auto-gen full name from first+last
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  useEffect(() => {
    if (firstName || lastName) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      setValue('name', fullName, { shouldDirty: false });
    }
  }, [firstName, lastName, setValue]);

  // Auto-populate bank account holder from full name
  const watchedName = watch('name');
  useEffect(() => {
    const currentHolder = watch('bankAccountHolder');
    if (!currentHolder && watchedName) {
      setValue('bankAccountHolder', watchedName, { shouldDirty: false });
    }
  }, [watchedName, setValue, watch]);

  // Draft auto-save
  const formValues = watch();
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const draft = {
          version: DRAFT_VERSION,
          draftId: `draft_${Date.now()}`,
          values: {
            ...formValues,
            photograph,
            signature,
            aadhaarCardDoc: aadhaarDoc.meta,
            panCardDoc: panDoc.meta,
            bankProofDoc: bankDoc.meta,
          },
          additionalDocuments: additionalDocs.map(d => ({
            rowId: d.rowId, docType: d.docType, customTitle: d.customTitle, meta: d.meta,
          })),
          lastSavedAt: new Date().toISOString(),
        };
        void draft;
      } catch { /* ignore */ }
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [formValues, aadhaarDoc.meta, panDoc.meta, bankDoc.meta, additionalDocs, photograph, signature]);

  // Clear Draft
  const handleClearDraft = async () => {
    const result = await Swal.fire({
      title: 'Clear Draft?',
      text: 'This will erase all entered values and files.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Clear Draft',
      confirmButtonColor: '#ef4444',
    });
    if (!result.isConfirmed) return;

    if (aadhaarDoc.previewUrl) URL.revokeObjectURL(aadhaarDoc.previewUrl);
    if (panDoc.previewUrl) URL.revokeObjectURL(panDoc.previewUrl);
    if (bankDoc.previewUrl) URL.revokeObjectURL(bankDoc.previewUrl);
    additionalDocs.forEach(d => { if (d.previewUrl) URL.revokeObjectURL(d.previewUrl); });
    setAadhaarDoc({ meta: null, previewUrl: null, blob: null });
    setPanDoc({ meta: null, previewUrl: null, blob: null });
    setBankDoc({ meta: null, previewUrl: null, blob: null });
    setAdditionalDocs([]);
    setPhotograph(''); setSigPreview(''); setPhotoPreview(''); setSignature('');
    reset();
    setDraftRestored(false);
    showToast('Draft cleared successfully.');
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const saved = await employeesService.saveEmployeeDraft({ id: draftId, employeeData: formValues });
      setDraftId(saved.id);
      setDraftRestored(true);
      showToast('Draft saved successfully.');
    } catch (error: any) {
      Swal.fire('Draft not saved', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Media Upload
  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'photo' | 'sig'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      Swal.fire('Invalid File', 'Only JPG/JPEG/PNG images allowed.', 'error');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      Swal.fire('File Too Large', 'Maximum photo size is 2 MB.', 'error');
      return;
    }
    const b64 = await fileToBase64(file);
    if (type === 'photo') { setPhotograph(b64); setPhotographFile(file); setPhotoPreview(b64); setValue('photograph', 'selected'); }
    else { setSignature(b64); setSignatureFile(file); setSigPreview(b64); setValue('signature', 'selected'); }
  };

  // Additional Documents
  const addAdditionalDoc = () => {
    setAdditionalDocs(prev => [
      ...prev,
      { rowId: genId(), docType: 'Resume', customTitle: '', meta: null, previewUrl: null, blob: null }
    ]);
  };

  const updateAdditionalDoc = (rowId: string, updates: Partial<AdditionalDoc>) => {
    setAdditionalDocs(prev => prev.map(d => d.rowId === rowId ? { ...d, ...updates } : d));
  };

  const removeAdditionalDoc = async (rowId: string) => {
    const doc = additionalDocs.find(d => d.rowId === rowId);
    if (doc?.previewUrl) URL.revokeObjectURL(doc.previewUrl);
    setAdditionalDocs(prev => prev.filter(d => d.rowId !== rowId));
  };

  const handleAdditionalFileChange = async (rowId: string, file: File) => {
    if (!ALLOWED_EXTRA_TYPES.some(t => file.type === t)) {
      Swal.fire('Invalid File', 'PDF, JPG, PNG, DOC, DOCX files accepted.', 'error');
      return;
    }
    if (file.size > MAX_DOC_SIZE) {
      Swal.fire('File Too Large', 'Maximum 5 MB per file.', 'error');
      return;
    }
    const old = additionalDocs.find(d => d.rowId === rowId);
    if (old?.previewUrl) URL.revokeObjectURL(old.previewUrl);
    const storageKey = `draft_other_${rowId}_${Date.now()}`;
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    updateAdditionalDoc(rowId, {
      meta: { id: genId(), fileName: file.name, mimeType: file.type, size: file.size, category: 'OTHER', title: '', storageKey, uploadedAt: new Date().toISOString() },
      previewUrl,
      blob: file,
    });
  };

  // Submit Handler
  const onSubmit: SubmitHandler<any> = async (data) => {
    data.aadhaarCardDoc = aadhaarDoc.meta;
    data.panCardDoc = panDoc.meta;
    data.bankProofDoc = bankDoc.meta;
    data.additionalDocuments = additionalDocs.map(d => d.meta).filter(Boolean);

    setIsRegistering(true);
    try {
      const employmentTypes: Record<string, string> = {
        'Full-time': 'PERMANENT', 'Part-time': 'PART_TIME', Contract: 'CONTRACT',
        Intern: 'INTERN', Temporary: 'TEMPORARY', Consultant: 'CONSULTANT',
      };
      const genders: Record<string, string> = {
        Male: 'MALE', Female: 'FEMALE', Other: 'OTHER', 'Prefer not to say': 'PREFER_NOT_TO_SAY',
      };
      const payload = {
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dob,
        gender: genders[data.gender],
        jobTitle: data.designation,
        departmentId: data.department,
        reportingManagerId: data.managerId || undefined,
        workLocationId: workLocations.find((location) => location.name === data.workLocation)?.id,
        employmentType: employmentTypes[data.employmentType],
        joiningDate: data.joiningDate,
        probationEndDate: data.probationEndDate || undefined,
        workEmail: data.email,
        personalEmail: data.personalEmail || undefined,
        phoneNumber: data.phone,
        residentialAddress: data.residentialAddress,
        emergencyContactName: data.emergencyName,
        emergencyContactPhone: data.emergencyPhone,
        emergencyRelationship: data.emergencyRelationship,
        panNumber: data.pan,
        aadhaarNumber: data.aadhaar,
        uanNumber: data.uan || undefined,
        esicNumber: data.esic || undefined,
        bankName: data.bankName,
        accountHolderName: data.bankAccountHolder,
        bankAccountType: data.accountType.toUpperCase(),
        bankAccountNumber: data.bankAccount,
        confirmAccountNumber: data.confirmBankAccount,
        ifscCode: data.ifscCode,
        branchName: data.branchName || undefined,
        draftId,
        additionalDocuments: additionalDocs.map((doc) => ({
          documentType: doc.docType.toUpperCase().replaceAll(' ', '_'),
          documentName: doc.customTitle || doc.docType,
        })),
      };
      const multipart = new FormData();
      multipart.append('employeeData', JSON.stringify(payload));
      if (aadhaarDoc.blob) multipart.append('aadhaarCard', aadhaarDoc.blob);
      if (panDoc.blob) multipart.append('panCard', panDoc.blob);
      if (bankDoc.blob) multipart.append('bankDocument', bankDoc.blob);
      if (photographFile) multipart.append('photograph', photographFile);
      if (signatureFile) multipart.append('signature', signatureFile);
      additionalDocs.forEach((doc) => { if (doc.blob) multipart.append('additionalDocuments', doc.blob); });

      const employee = await employeesService.createEmployee(multipart);

      await Swal.fire({
        icon: 'success',
        title: 'Employee Registered!',
        html: `<b>${employee.fullName}</b> has been registered successfully.<br/><small>Employee ID: <strong>${employee.employeeCode}</strong></small>`,
        confirmButtonText: 'View Roster Directory',
        confirmButtonColor: '#0f172a',
      });
      navigate.push('/hr/employees');
    } catch (err: any) {
      const msg = err?.message || 'Registration failed.';
      const backendToForm: Record<string, string> = {
        workEmail: 'email', panNumber: 'pan', aadhaarNumber: 'aadhaar',
        departmentId: 'department', workLocationId: 'workLocation',
        reportingManagerId: 'managerId', dateOfBirth: 'dob',
        phoneNumber: 'phone', confirmAccountNumber: 'confirmBankAccount',
      };
      const field = backendToForm[err?.field] || err?.field;
      if (field) setError(field, { type: 'server', message: msg });
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        html: `<p>${msg}</p>`,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const onInvalid = (errs: any) => {
    const messages = collectErrors(errs);
    if (messages.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Form Validation Required',
        html: `<ul style="text-align:left;padding-left:16px;">${messages.slice(0, 8).map(m => `<li style="margin:4px 0;font-size:13px;">${m}</li>`).join('')}</ul>`,
        confirmButtonColor: '#0f172a',
      });
    }
  };

  function collectErrors(errs: any, prefix = ''): string[] {
    const msgs: string[] = [];
    for (const key in errs) {
      const e = errs[key];
      if (e?.message) msgs.push(prefix ? `${prefix} → ${e.message}` : e.message);
      else if (typeof e === 'object') msgs.push(...collectErrors(e, key));
    }
    return msgs;
  }

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '9px 12px',
    border: `1.5px solid ${hasError ? '#ef4444' : '#cbd5e1'}`,
    borderRadius: '8px',
    fontSize: '13.5px',
    color: '#0f172a',
    background: hasError ? '#fef2f2' : '#ffffff',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s ease',
  });

  const selectStyle = (hasError: boolean) => ({
    ...inputStyle(hasError),
    cursor: 'pointer',
  });

  const filteredDepts = departments
    .filter(d => d.isActive)
    .filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase()));

  // Step definition
  const steps = [
    { id: 1, title: 'Personal & Contact', icon: User, subtitle: 'Basic details & address' },
    { id: 2, title: 'Employment & Statutory', icon: Briefcase, subtitle: 'Role, department & IDs' },
    { id: 3, title: 'Bank & Emergency', icon: Building2, subtitle: 'Salary account & emergency' },
    { id: 4, title: 'Documents & Photo', icon: FileText, subtitle: 'Identity files & photos' },
  ];

  return (
    <div className="reg-form-wrapper" style={{ maxWidth: '1080px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @media (max-width: 900px) {
          .reg-stepper-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .reg-grid-3, .reg-grid-4 {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .reg-form-wrapper {
            padding: 0 4px !important;
          }
          .reg-stepper-grid {
            display: flex !important;
            overflow-x: auto !important;
            padding-bottom: 8px !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .reg-stepper-grid > div {
            min-width: 220px !important;
            scroll-snap-align: start !important;
            flex-shrink: 0 !important;
          }
          .reg-grid-2, .reg-grid-3, .reg-grid-4 {
            grid-template-columns: 1fr !important;
          }
          .reg-addl-row {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .reg-header-banner {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 16px !important;
          }
          .reg-footer-nav {
            flex-direction: column-reverse !important;
            gap: 12px !important;
            align-items: stretch !important;
            padding: 12px 16px !important;
          }
          .reg-footer-nav > div {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .reg-footer-nav button {
            width: 100% !important;
            justify-content: center !important;
            padding: 12px 16px !important;
            font-size: 13px !important;
          }
          .reg-form-card {
            padding: 16px 14px !important;
            border-radius: 12px !important;
          }
        }
      `}</style>
      
      {/* ── TOP HEADER BANNER ────────────────────────────────────────── */}
      <div className="reg-header-banner" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #2563eb 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        color: '#ffffff',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigate.push('/hr/employees')}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#93c5fd', marginBottom: '2px' }}>
              HR Administration Portal
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.3px' }}>
              Employee Onboarding & Registration
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {draftRestored && (
            <span style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: '700' }}>
              ✏️ Draft Auto-Restored
            </span>
          )}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Form Completion</span>
            <strong style={{ fontSize: '14px', color: '#38bdf8' }}>Step {activeStep} of 4</strong>
          </div>
        </div>
      </div>

      {/* ── STEPPER NAVIGATION TABS ───────────────────────────────────── */}
      <div className="reg-stepper-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {steps.map((step) => {
          const IconComponent = step.icon;
          const isActive = activeStep === step.id;
          const isDone = activeStep > step.id;
          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              style={{
                background: isActive ? '#ffffff' : '#f8fafc',
                border: `2px solid ${isActive ? '#2563eb' : isDone ? '#16a34a' : '#e2e8f0'}`,
                borderRadius: '12px',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 10px 20px -5px rgba(37, 99, 235, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isActive ? '#2563eb' : isDone ? '#16a34a' : '#cbd5e1',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                flexShrink: 0
              }}>
                {isDone ? <Check size={18} /> : <IconComponent size={18} />}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: isActive ? '#0f172a' : '#475569', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {step.title}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {step.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FORM CONTAINER ────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
        <div className="reg-form-card" style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '32px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          marginBottom: '24px'
        }}>

          {/* ─── STEP 1: PERSONAL & CONTACT INFORMATION ─────────────── */}
          {activeStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Step 1: Personal & Contact Information</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Provide official identity details and primary contact channels</p>
                </div>
                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>Personal Details</span>
              </div>

              {/* Names Grid */}
              <div className="reg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <FormField label="First Name" required error={errors.firstName?.message as string}>
                  <input {...register('firstName')} style={inputStyle(!!errors.firstName)} placeholder="e.g. Rahul" />
                </FormField>
                <FormField label="Last Name" required error={errors.lastName?.message as string}>
                  <input {...register('lastName')} style={inputStyle(!!errors.lastName)} placeholder="e.g. Sharma" />
                </FormField>
                <FormField label="Full Name" required error={errors.name?.message as string} hint="Auto-filled from First + Last Name">
                  <input {...register('name')} style={inputStyle(!!errors.name)} placeholder="e.g. Rahul Sharma" />
                </FormField>
              </div>

              {/* DOB & Gender */}
              <div className="reg-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Date of Birth" required error={errors.dob?.message as string}>
                  <input type="date" {...register('dob')} style={inputStyle(!!errors.dob)} max={new Date().toISOString().split('T')[0]} />
                </FormField>
                <FormField label="Gender" required error={errors.gender?.message as string}>
                  <select {...register('gender')} style={selectStyle(!!errors.gender)}>
                    <option value="">Select Gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </FormField>
              </div>

              {/* Contact Channels */}
              <div className="reg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <FormField label="Work Email" required error={errors.email?.message as string}>
                  <input type="email" {...register('email')} style={inputStyle(!!errors.email)} placeholder="rahul@himalaya.com" />
                </FormField>
                <FormField label="Personal Email" error={errors.personalEmail?.message as string}>
                  <input type="email" {...register('personalEmail')} style={inputStyle(!!errors.personalEmail)} placeholder="rahul@gmail.com" />
                </FormField>
                <FormField label="Mobile Phone Number" required error={errors.phone?.message as string}>
                  <input {...register('phone')} style={inputStyle(!!errors.phone)} placeholder="9876500000" maxLength={12} />
                </FormField>
              </div>

              {/* Address */}
              <FormField label="Residential Address" required error={errors.residentialAddress?.message as string}>
                <textarea
                  {...register('residentialAddress')}
                  style={{ ...inputStyle(!!errors.residentialAddress), minHeight: '90px', fontFamily: 'inherit', resize: 'vertical' }}
                  placeholder="Enter complete permanent / present residential address (Street, City, State, PIN)"
                />
              </FormField>
            </div>
          )}

          {/* ─── STEP 2: EMPLOYMENT & STATUTORY ──────────────────────── */}
          {activeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Step 2: Employment & Statutory Information</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Assign designation, department, work location, and tax IDs</p>
                </div>
                <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>Corporate Profile</span>
              </div>

              {/* ID & Job Title & Department */}
              <div className="reg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <FormField label="Employee ID Code" required error={errors.employeeCode?.message as string} hint="Unique ID e.g. 001">
                  <input {...register('employeeCode')} style={inputStyle(!!errors.employeeCode)} placeholder="e.g. EMP-015" />
                </FormField>
                <FormField label="Job Designation" required error={errors.designation?.message as string}>
                  <input {...register('designation')} style={inputStyle(!!errors.designation)} placeholder="e.g. Senior Operations Exec" />
                </FormField>
                
                {/* Searchable Department */}
                <FormField label="Department" required error={errors.department?.message as string}>
                  <div style={{ position: 'relative' }}>
                    <div
                      onClick={() => setDeptOpen(prev => !prev)}
                      style={{ ...selectStyle(!!errors.department), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <span style={{ color: watchedDept ? '#0f172a' : '#64748b', fontWeight: watchedDept ? '600' : 'normal' }}>
                        {watchedDept
                          ? departments.find(d => d.id === watchedDept)?.name || watchedDept
                          : 'Select Department'}
                      </span>
                      {deptOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                    {deptOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginTop: '4px' }}>
                        <div style={{ padding: '8px' }}>
                          <input
                            autoFocus
                            value={deptSearch}
                            onChange={e => setDeptSearch(e.target.value)}
                            placeholder="Search department..."
                            style={{ ...inputStyle(false), marginBottom: 0 }}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                          {filteredDepts.map(d => (
                            <div
                              key={d.id}
                              onClick={() => {
                                setValue('department', d.id, { shouldValidate: true });
                                setDeptOpen(false);
                                setDeptSearch('');
                              }}
                              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: '#0f172a', background: watchedDept === d.id ? '#f1f5f9' : 'transparent', fontWeight: watchedDept === d.id ? '700' : 'normal' }}
                            >
                              {d.name}
                            </div>
                          ))}
                          {filteredDepts.length === 0 && <div style={{ padding: '10px', fontSize: '12px', color: '#64748b' }}>No departments found</div>}
                        </div>
                      </div>
                    )}
                  </div>
                  <input type="hidden" {...register('department')} />
                </FormField>
              </div>

              {/* Manager & Location & Employment Type */}
              <div className="reg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <FormField label="Reporting Manager" error={errors.managerId?.message as string}>
                  <select {...register('managerId')} style={selectStyle(!!errors.managerId)}>
                    <option value="">None / Direct Report</option>
                    {eligibleManagers.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.fullName} ({e.jobTitle})</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Work Location" required error={errors.workLocation?.message as string}>
                  <select {...register('workLocation')} style={selectStyle(!!errors.workLocation)}>
                    <option value="">Select Location</option>
                    {workLocations.map((loc) => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                  </select>
                </FormField>

                <FormField label="Employment Type" required error={errors.employmentType?.message as string}>
                  <select {...register('employmentType')} style={selectStyle(!!errors.employmentType)}>
                    <option value="">Select Type</option>
                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
              </div>

              {/* Dates */}
              <div className="reg-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Date of Joining" required error={errors.joiningDate?.message as string}>
                  <input type="date" {...register('joiningDate')} style={inputStyle(!!errors.joiningDate)} />
                </FormField>
                <FormField label="Probation End Date" error={errors.probationEndDate?.message as string} hint="Optional — leave blank if no probation">
                  <input type="date" {...register('probationEndDate')} style={inputStyle(!!errors.probationEndDate)} />
                </FormField>
              </div>

              {/* Statutory Information */}
              <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Statutory & Tax Identifiers</h4>
                <div className="reg-grid-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>

                  <FormField label="PAN Number" required error={errors.pan?.message as string} hint="Format: ABCDE1234F">
                    <input {...register('pan')} style={inputStyle(!!errors.pan)} placeholder="ABCDE1234F" maxLength={10} onChange={e => { e.target.value = e.target.value.toUpperCase(); register('pan').onChange(e); }} />
                  </FormField>
                  <FormField label="Aadhaar Number" required error={errors.aadhaar?.message as string} hint="12 digits">
                    <input {...register('aadhaar')} style={inputStyle(!!errors.aadhaar)} placeholder="XXXX XXXX XXXX" maxLength={14} type="password" autoComplete="off" />
                  </FormField>
                  <FormField label="UAN Number" error={errors.uan?.message as string} hint="Optional — 12 digits">
                    <input {...register('uan')} style={inputStyle(!!errors.uan)} placeholder="100XXXXXXXXX" maxLength={12} />
                  </FormField>
                  <FormField label="ESIC Number" error={errors.esic?.message as string} hint="Optional — 17 digits">
                    <input {...register('esic')} style={inputStyle(!!errors.esic)} placeholder="XX-XX-XXXXXX-XXX-XXXX" maxLength={20} />
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3: BANK & EMERGENCY CONTACT ───────────────────── */}
          {activeStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Step 3: Bank Account & Emergency Contact</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Payroll disbursement banking details and next-of-kin contacts</p>
                </div>
                <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>Payroll & Safety</span>
              </div>

              {/* Bank Details */}
              <div className="reg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <FormField label="Bank Name" required error={errors.bankName?.message as string}>
                  <input {...register('bankName')} style={inputStyle(!!errors.bankName)} placeholder="e.g. State Bank of India" />
                </FormField>
                <FormField label="Account Holder Name" required error={errors.bankAccountHolder?.message as string} hint="Auto-filled from Full Name">
                  <input {...register('bankAccountHolder')} style={inputStyle(!!errors.bankAccountHolder)} placeholder="As per bank records" />
                </FormField>
                <FormField label="Account Type" required error={errors.accountType?.message as string}>
                  <select {...register('accountType')} style={selectStyle(!!errors.accountType)}>
                    <option value="">Select Type</option>
                    {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
              </div>

              <div className="reg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <FormField label="Bank Account Number" required error={errors.bankAccount?.message as string}>
                  <input {...register('bankAccount')} style={inputStyle(!!errors.bankAccount)} placeholder="Account Number" type="password" autoComplete="off" />
                </FormField>
                <FormField label="Confirm Account Number" required error={errors.confirmBankAccount?.message as string}>
                  <input {...register('confirmBankAccount')} style={inputStyle(!!errors.confirmBankAccount)} placeholder="Re-enter Account Number" type="password" autoComplete="off" />
                </FormField>
                <FormField label="IFSC Code" required error={errors.ifscCode?.message as string} hint="Format: SBIN0001234">
                  <input {...register('ifscCode')} style={inputStyle(!!errors.ifscCode)} placeholder="SBIN0001234" maxLength={11} onChange={e => { e.target.value = e.target.value.toUpperCase(); register('ifscCode').onChange(e); }} />
                </FormField>
              </div>

              <FormField label="Branch Name" error={errors.branchName?.message as string}>
                <input {...register('branchName')} style={inputStyle(!!errors.branchName)} placeholder="e.g. Connaught Place Branch (optional)" />
              </FormField>

              {/* Emergency Contact */}
              <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Emergency Next-of-Kin Contact</h4>
                <div className="reg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <FormField label="Emergency Contact Name" required error={errors.emergencyName?.message as string}>
                    <input {...register('emergencyName')} style={inputStyle(!!errors.emergencyName)} placeholder="Contact Full Name" />
                  </FormField>
                  <FormField label="Emergency Phone" required error={errors.emergencyPhone?.message as string}>
                    <input {...register('emergencyPhone')} style={inputStyle(!!errors.emergencyPhone)} placeholder="9876500000" maxLength={12} />
                  </FormField>
                  <FormField label="Relationship" required error={errors.emergencyRelationship?.message as string}>
                    <select {...register('emergencyRelationship')} style={selectStyle(!!errors.emergencyRelationship)}>
                      <option value="">Select Relationship</option>
                      {EMERGENCY_RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4: DOCUMENTS & PHOTOS ───────────────────────────── */}
          {activeStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Step 4: Verification Documents & Photograph</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Upload identity proofs, photos, signature, and additional certificates</p>
                </div>
                <span style={{ background: '#faf5ff', color: '#9333ea', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>Verification Files</span>
              </div>

              {/* Mandatory Documents */}
              <div className="reg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <DocUploadBox
                  label="Aadhaar Card Proof"
                  category="AADHAAR"
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                  maxSize={MAX_DOC_SIZE}
                  value={aadhaarDoc}
                  onChange={v => { setAadhaarDoc(v); setValue('aadhaarCardDoc', v.meta); }}
                  error={errors.aadhaarCardDoc?.message as string}
                />
                <DocUploadBox
                  label="PAN Card Proof"
                  category="PAN"
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                  maxSize={MAX_DOC_SIZE}
                  value={panDoc}
                  onChange={v => { setPanDoc(v); setValue('panCardDoc', v.meta); }}
                  error={errors.panCardDoc?.message as string}
                />
                <DocUploadBox
                  label="Bank Passbook / Cheque"
                  category="BANK_PROOF"
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                  maxSize={MAX_DOC_SIZE}
                  value={bankDoc}
                  onChange={v => { setBankDoc(v); setValue('bankProofDoc', v.meta); }}
                  error={errors.bankProofDoc?.message as string}
                />
              </div>

              {/* Photos & Signatures */}
              <div className="reg-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>

                {/* Photograph */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Employee Passport Photo</span>
                    <label htmlFor="photo-upload-input" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <Camera size={14} /> {photoPreview ? 'Replace' : 'Upload Photo'}
                    </label>
                  </div>
                  {photoPreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img src={photoPreview} alt="Passport" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      <button type="button" onClick={() => { setPhotograph(''); setPhotographFile(null); setPhotoPreview(''); setValue('photograph', ''); }} style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '12px', border: '1.5px dashed #cbd5e1', borderRadius: '8px' }}>
                      <Camera size={28} style={{ opacity: 0.4, margin: '0 auto 6px', display: 'block' }} />
                      Upload clear front-facing JPEG/PNG passport photo (max 2 MB)
                    </div>
                  )}
                  <input id="photo-upload-input" type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }} onChange={e => handleMediaUpload(e, 'photo')} />
                </div>

                {/* Signature */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Digital Signature</span>
                    <label htmlFor="sig-upload-input" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <PenTool size={14} /> {sigPreview ? 'Replace' : 'Upload Signature'}
                    </label>
                  </div>
                  {sigPreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img src={sigPreview} alt="Signature" style={{ width: '160px', height: '60px', objectFit: 'contain', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <button type="button" onClick={() => { setSignature(''); setSignatureFile(null); setSigPreview(''); setValue('signature', ''); }} style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Remove Signature
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '12px', border: '1.5px dashed #cbd5e1', borderRadius: '8px' }}>
                      <PenTool size={28} style={{ opacity: 0.4, margin: '0 auto 6px', display: 'block' }} />
                      Upload signature specimen image (max 2 MB)
                    </div>
                  )}
                  <input id="sig-upload-input" type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }} onChange={e => handleMediaUpload(e, 'sig')} />
                </div>
              </div>

              {/* Additional Documents */}
              <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Additional Certificates & Documents</h4>
                  <button type="button" onClick={addAdditionalDoc} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    <Plus size={14} /> Add Extra Document
                  </button>
                </div>
                {additionalDocs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px', background: '#f8fafc', borderRadius: '8px', border: '1.5px dashed #cbd5e1' }}>
                    No extra documents added. Click "Add Extra Document" to attach resumes, degree certificates, or experience letters.
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {additionalDocs.map((doc) => (
                    <div key={doc.rowId} className="reg-addl-row" style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '12px', alignItems: 'center', background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #cbd5e1' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>Document Type</label>
                        <select
                          value={doc.docType}
                          onChange={e => updateAdditionalDoc(doc.rowId, { docType: e.target.value })}
                          style={selectStyle(false)}
                        >
                          {ADDITIONAL_DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        {doc.meta ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{doc.meta.fileName}</div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>({formatBytes(doc.meta.size)})</span>
                          </div>
                        ) : (
                          <div>
                            <input type="file" id={`addl-${doc.rowId}`} accept={ALLOWED_EXTRA_TYPES.join(',')} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleAdditionalFileChange(doc.rowId, f); }} />
                            <label htmlFor={`addl-${doc.rowId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: '#0f172a', color: '#fff', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                              <Upload size={12} /> Select File
                            </label>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => removeAdditionalDoc(doc.rowId)} style={{ padding: '6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── STICKY FOOTER NAVIGATION BAR ──────────────────────────── */}
        <div className="reg-footer-nav" style={{
          position: 'sticky',
          bottom: '16px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={handleClearDraft} style={{ padding: '9px 14px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={14} /> Clear Draft
            </button>
            <button type="button" onClick={handleSaveDraft} style={{ padding: '9px 14px', background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={isSaving}>
              <Save size={14} /> {isSaving ? 'Saving…' : 'Save Draft'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                style={{ padding: '10px 18px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={14} /> Previous Step
              </button>
            )}

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                style={{ padding: '10px 22px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Next Step <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="submit"
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}
                disabled={isRegistering}
              >
                <UserPlus size={16} /> {isRegistering ? 'Registering…' : 'Complete Employee Registration'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
