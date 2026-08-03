'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import {
  User, Briefcase, Phone, AlertCircle, FileText, Building2,
  Upload, Trash2, Eye, RefreshCw, Plus, Check, X, Camera, PenTool,
  ChevronDown, ChevronUp, Save, UserPlus, ArrowLeft
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

// ── Helper: generate a random ID ───────────────────────────────
const genId = () => `doc_${Date.now()}_${Math.floor(Math.random() * 99999)}`;

// ── Helper: convert File to Base64 ────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Helper: format bytes ───────────────────────────────────────
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ── Types ───────────────────────────────────────────────────────
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

// ── Inline styles ──────────────────────────────────────────────
const styles = {
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0',
  },
  header: {
    background: 'linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%)',
    borderRadius: '16px 16px 0 0',
    padding: '24px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#fff',
  },
  formBody: {
    background: '#fff',
    borderRadius: '0 0 16px 16px',
    border: '1px solid #E5ECF5',
    borderTop: 'none',
    padding: '0 32px 32px',
  },
  section: {
    marginTop: '28px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '2px solid #E5ECF5',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  sectionIcon: {
    width: '34px',
    height: '34px',
    background: 'linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#24345C',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#5E6B82',
    letterSpacing: '0.02em',
  },
  required: {
    color: '#EF4444',
    marginLeft: '2px',
  },
  input: {
    padding: '9px 12px',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: '#DCE5F0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#24345C',
    background: '#F8FAFD',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
  },
  inputError: {
    borderColor: '#EF4444',
    background: '#FFF5F5',
  },
  errorText: {
    fontSize: '11px',
    color: '#EF4444',
    marginTop: '3px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  select: {
    padding: '9px 12px',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: '#DCE5F0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#24345C',
    background: '#F8FAFD',
    width: '100%',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    padding: '9px 12px',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: '#DCE5F0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#24345C',
    background: '#F8FAFD',
    width: '100%',
    resize: 'vertical' as const,
    minHeight: '80px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  docBox: {
    borderWidth: '1.5px',
    borderStyle: 'dashed',
    borderColor: '#DCE5F0',
    borderRadius: '10px',
    padding: '16px',
    background: '#F8FAFD',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  docBoxError: {
    borderColor: '#EF4444',
    background: '#FFF5F5',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    background: '#2F4375',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  docPreview: {
    width: '64px',
    height: '64px',
    objectFit: 'cover' as const,
    borderRadius: '6px',
    border: '1px solid #DCE5F0',
  },
  actionBar: {
    position: 'sticky' as const,
    bottom: '0',
    background: '#fff',
    borderTop: '1px solid #E5ECF5',
    padding: '16px 32px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    zIndex: 10,
    borderRadius: '0 0 16px 16px',
    boxShadow: '0 -4px 20px rgba(47,67,117,0.06)',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
    background: 'linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '9px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
    background: '#F1F5F9',
    color: '#5E6B82',
    border: '1.5px solid #DCE5F0',
    borderRadius: '9px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 16px',
    background: 'rgba(239,68,68,0.08)',
    color: '#EF4444',
    border: '1.5px solid rgba(239,68,68,0.2)',
    borderRadius: '9px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

// ── Field Component ────────────────────────────────────────────
function Field({
  label, required: req, error, children, hint,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>
        {label}{req && <span style={styles.required}>*</span>}
      </label>
      {children}
      {hint && !error && <span style={{ fontSize: '11px', color: '#8893A7' }}>{hint}</span>}
      {error && (
        <span style={styles.errorText}>
          <AlertCircle size={10} /> {error}
        </span>
      )}
    </div>
  );
}

// ── Document Upload Sub-component ──────────────────────────────
function DocUpload({
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
    // Revoke old preview
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
    <div style={{ ...styles.docBox, ...(error ? styles.docBoxError : {}) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#24345C' }}>{label}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {hasFile && value.previewUrl && (
            <a href={value.previewUrl} target="_blank" rel="noopener noreferrer">
              <button type="button" style={{ ...styles.uploadBtn, background: '#3BAEEB' }}>
                <Eye size={12} /> Preview
              </button>
            </a>
          )}
          <button type="button" onClick={() => inputRef.current?.click()} style={styles.uploadBtn}>
            <Upload size={12} /> {hasFile ? 'Replace' : 'Upload'}
          </button>
          {hasFile && (
            <button type="button" onClick={handleRemove} style={{ ...styles.uploadBtn, background: '#EF4444' }}>
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
      {hasFile && value.meta && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {value.previewUrl ? (
            <img src={value.previewUrl} alt="preview" style={styles.docPreview} />
          ) : (
            <div style={{ ...styles.docPreview, background: '#EEF4FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} color="#3BAEEB" />
            </div>
          )}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#24345C' }}>{value.meta.fileName}</div>
            <div style={{ fontSize: '11px', color: '#8893A7' }}>{formatBytes(value.meta.size)}</div>
          </div>
        </div>
      )}
      {!hasFile && (
        <div style={{ textAlign: 'center', padding: '8px 0', color: '#8893A7', fontSize: '12px' }}>
          <Upload size={20} style={{ marginBottom: '4px', opacity: 0.4 }} />
          <div>PDF, JPG, PNG — max {formatBytes(maxSize)}</div>
        </div>
      )}
      {error && <span style={styles.errorText}><AlertCircle size={10} /> {error}</span>}
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

// ── Main Form ──────────────────────────────────────────────────
export default function EmployeeRegistrationForm() {
  const navigate = useRouter();
  const showToast = useNotificationStore((s: any) => s.showToast);
  const [departments, setDepartments] = useState<any[]>([]);
  const [workLocations, setWorkLocations] = useState<any[]>([]);
  const [eligibleManagers, setEligibleManagers] = useState<any[]>([]);

  // Form setup
  const {
    register, control, handleSubmit, watch, setValue, reset, setError, clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(employeeRegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      additionalDocuments: [],
      photograph: '',
      signature: '',
    },
  });

  // Document states (managed outside RHF because they hold File objects)
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
        showToast('Employee registration draft was restored.');
      }
    }).catch((error) => Swal.fire('Unable to load HR data', error.message, 'error'));
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
  }, [watchedName]);

  // ── Draft: restore on mount ────────────────────────────────
  useEffect(() => {
    try {
      const raw = null;
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft?.version !== DRAFT_VERSION) return;
      const values = draft.values || {};
      reset(values);
      if (values.photograph) { setPhotograph(values.photograph); setPhotoPreview(values.photograph); }
      if (values.signature) { setSignature(values.signature); setSigPreview(values.signature); }
      // Binary files are intentionally not restored from a draft payload.
      if (values.aadhaarCardDoc) setAadhaarDoc({ meta: values.aadhaarCardDoc, previewUrl: null, blob: null });
      if (values.panCardDoc) setPanDoc({ meta: values.panCardDoc, previewUrl: null, blob: null });
      if (values.bankProofDoc) setBankDoc({ meta: values.bankProofDoc, previewUrl: null, blob: null });
      if (Array.isArray(draft.additionalDocuments)) {
        setAdditionalDocs(draft.additionalDocuments.map((d: any) => ({
          ...d, previewUrl: null, blob: null,
        })));
      }
      setDraftRestored(true);
      showToast('Employee registration draft was restored!');
    } catch { /* ignore */ }
  }, []);

  // ── Draft: auto-save on changes ───────────────────────────
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
      } catch { /* localStorage full */ }
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [formValues, aadhaarDoc.meta, panDoc.meta, bankDoc.meta, additionalDocs, photograph, signature]);

  // ── Clear Draft ────────────────────────────────────────────
  const handleClearDraft = async () => {
    const result = await Swal.fire({
      title: 'Clear Draft?',
      text: 'This will erase all entered values, uploaded document metadata, and draft files. You cannot undo this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Clear Draft',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
    });
    if (!result.isConfirmed) return;

    // Revoke preview URLs
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

  // ── Save as Draft (explicit) ───────────────────────────────
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const saved = await employeesService.saveEmployeeDraft({ id: draftId, employeeData: formValues });
      setDraftId(saved.id);
      setDraftRestored(true);
      showToast('Draft saved to PostgreSQL.');
    } catch (error: any) {
      Swal.fire('Draft not saved', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Photo / Signature upload ───────────────────────────────
  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'photo' | 'sig'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      Swal.fire('Invalid File', 'Only JPG/JPEG/PNG images are allowed.', 'error');
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

  // ── Additional Documents ───────────────────────────────────
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
      Swal.fire('Invalid File', 'PDF, JPG, PNG, DOC, DOCX files are accepted.', 'error');
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

  // ── Form submission ────────────────────────────────────────
  const onSubmit: SubmitHandler<any> = async (data) => {
    // Attach document metadata to form data for service layer
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
        confirmButtonText: 'View Employee Directory',
        confirmButtonColor: '#2F4375',
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
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Show Swal summary on RHF validation errors
  const onInvalid = (errs: any) => {
    const messages = collectErrors(errs);
    if (messages.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Errors',
        html: `<ul style="text-align:left;padding-left:16px;">${messages.slice(0, 8).map(m => `<li style="margin:4px 0;font-size:13px;">${m}</li>`).join('')}</ul>`,
        confirmButtonColor: '#2F4375',
      });
      // Scroll to first error field
      setTimeout(() => {
        const firstError = document.querySelector('[data-error="true"]') as HTMLElement;
        if (firstError) { firstError.scrollIntoView({ behavior: 'smooth', block: 'center' }); firstError.focus(); }
      }, 100);
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
    ...styles.input,
    ...(hasError ? styles.inputError : {}),
  });

  // ── Filtered departments ───────────────────────────────────
  const filteredDepts = departments
    .filter(d => d.isActive)
    .filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase()));

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={() => navigate.push('/hr/employees')}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Register New Employee</h1>
            <p style={{ fontSize: '12px', opacity: 0.8, margin: '2px 0 0' }}>Complete all required fields marked with *</p>
          </div>
        </div>
        {draftRestored && (
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '600' }}>
            ✏️ Draft Restored
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
        <div style={styles.formBody}>

          {/* ─── SECTION 1: Personal Information ────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}><User size={16} /></div>
              <h2 style={styles.sectionTitle}>Personal Information</h2>
            </div>
            <div style={styles.grid3}>
              <Field label="First Name" required error={errors.firstName?.message as string}>
                <input
                  {...register('firstName')}
                  data-error={!!errors.firstName}
                  style={inputStyle(!!errors.firstName)}
                  placeholder="e.g. Rahul"
                />
              </Field>
              <Field label="Last Name" required error={errors.lastName?.message as string}>
                <input
                  {...register('lastName')}
                  data-error={!!errors.lastName}
                  style={inputStyle(!!errors.lastName)}
                  placeholder="e.g. Sharma"
                />
              </Field>
              <Field label="Full Name" required error={errors.name?.message as string} hint="Auto-generated from First + Last Name">
                <input
                  {...register('name')}
                  data-error={!!errors.name}
                  style={inputStyle(!!errors.name)}
                  placeholder="e.g. Rahul Sharma"
                />
              </Field>
            </div>
            <div style={{ ...styles.grid3, marginTop: '16px' }}>
              <Field label="Date of Birth" required error={errors.dob?.message as string}>
                <input
                  type="date"
                  {...register('dob')}
                  data-error={!!errors.dob}
                  style={inputStyle(!!errors.dob)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </Field>
              <Field label="Gender" required error={errors.gender?.message as string}>
                <select {...register('gender')} style={styles.select}>
                  <option value="">Select Gender</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* ─── SECTION 2: Employment Information ──────────── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}><Briefcase size={16} /></div>
              <h2 style={styles.sectionTitle}>Employment Information</h2>
            </div>
            <div style={styles.grid3}>
              <Field label="Employee ID Code" required error={errors.employeeCode?.message as string} hint="Unique e.g. 001">
                <input
                  {...register('employeeCode')}
                  data-error={!!errors.employeeCode}
                  style={inputStyle(!!errors.employeeCode)}
                  placeholder="e.g. 001"
                />
              </Field>
              <Field label="Job Title" required error={errors.designation?.message as string}>
                <input
                  {...register('designation')}
                  data-error={!!errors.designation}
                  style={inputStyle(!!errors.designation)}
                  placeholder="e.g. Sales Executive"
                />
              </Field>
              {/* Department searchable dropdown */}
              <Field label="Department" required error={errors.department?.message as string}>
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => setDeptOpen(prev => !prev)}
                    style={{ ...inputStyle(!!errors.department), cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span style={{ color: watchedDept ? '#24345C' : '#8893A7' }}>
                      {watchedDept
                        ? departments.find(d => d.id === watchedDept)?.name || watchedDept
                        : 'Select Department'}
                    </span>
                    {deptOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                  {deptOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1.5px solid #DCE5F0', borderRadius: '8px', boxShadow: '0 8px 25px rgba(47,67,117,0.12)', marginTop: '4px' }}>
                      <div style={{ padding: '8px' }}>
                        <input
                          autoFocus
                          value={deptSearch}
                          onChange={e => setDeptSearch(e.target.value)}
                          placeholder="Search department..."
                          style={{ ...styles.input, marginBottom: 0 }}
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
                            style={{ padding: '9px 14px', cursor: 'pointer', fontSize: '13px', color: '#24345C', background: watchedDept === d.id ? '#EEF4FB' : 'transparent', fontWeight: watchedDept === d.id ? '600' : '400' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#F5F9FF')}
                            onMouseLeave={e => (e.currentTarget.style.background = watchedDept === d.id ? '#EEF4FB' : 'transparent')}
                          >
                            {d.name}
                          </div>
                        ))}
                        {filteredDepts.length === 0 && <div style={{ padding: '12px 14px', fontSize: '12px', color: '#8893A7' }}>No departments found</div>}
                      </div>
                    </div>
                  )}
                </div>
                {/* Hidden field bound to RHF */}
                <input type="hidden" {...register('department')} />
              </Field>
            </div>
            <div style={{ ...styles.grid3, marginTop: '16px' }}>
              <Field label="Reporting Manager" error={errors.managerId?.message as string}>
                <select {...register('managerId')} style={styles.select}>
                  <option value="">None / Direct Report</option>
                  {eligibleManagers.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.jobTitle})</option>
                  ))}
                </select>
              </Field>
              <Field label="Work Location" required error={errors.workLocation?.message as string}>
                <select {...register('workLocation')} style={styles.select}>
                  <option value="">Select Location</option>
                  {workLocations.map((location) => <option key={location.id} value={location.name}>{location.name}</option>)}
                </select>
              </Field>
              <Field label="Employment Type" required error={errors.employmentType?.message as string}>
                <select {...register('employmentType')} style={styles.select}>
                  <option value="">Select Type</option>
                  {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ ...styles.grid2, marginTop: '16px' }}>
              <Field label="Date of Joining" required error={errors.joiningDate?.message as string}>
                <input type="date" {...register('joiningDate')} style={inputStyle(!!errors.joiningDate)} />
              </Field>
              <Field label="Probation End Date" error={errors.probationEndDate?.message as string} hint="Optional — leave blank if no probation">
                <input type="date" {...register('probationEndDate')} style={inputStyle(!!errors.probationEndDate)} />
              </Field>
            </div>
          </div>

          {/* ─── SECTION 3: Contact Information ─────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}><Phone size={16} /></div>
              <h2 style={styles.sectionTitle}>Contact Information</h2>
            </div>
            <div style={styles.grid3}>
              <Field label="Work Email" required error={errors.email?.message as string}>
                <input
                  type="email"
                  {...register('email')}
                  data-error={!!errors.email}
                  style={inputStyle(!!errors.email)}
                  placeholder="rahul@himalaya.com"
                />
              </Field>
              <Field label="Personal Email" error={errors.personalEmail?.message as string}>
                <input
                  type="email"
                  {...register('personalEmail')}
                  style={inputStyle(!!errors.personalEmail)}
                  placeholder="rahul@gmail.com"
                />
              </Field>
              <Field label="Phone Number" required error={errors.phone?.message as string}>
                <input
                  {...register('phone')}
                  data-error={!!errors.phone}
                  style={inputStyle(!!errors.phone)}
                  placeholder="9876500000"
                  maxLength={12}
                />
              </Field>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Field label="Residential Address" required error={errors.residentialAddress?.message as string}>
                <textarea
                  {...register('residentialAddress')}
                  style={{ ...styles.textarea, ...(errors.residentialAddress ? styles.inputError : {}) }}
                  placeholder="123, Street, City, State, PIN"
                />
              </Field>
            </div>
          </div>

          {/* ─── SECTION 4: Emergency Contact ───────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.sectionIcon, background: 'linear-gradient(135deg, #ef4444, #f97316)' }}><AlertCircle size={16} /></div>
              <h2 style={styles.sectionTitle}>Emergency Contact</h2>
            </div>
            <div style={styles.grid3}>
              <Field label="Emergency Contact Name" required error={errors.emergencyName?.message as string}>
                <input
                  {...register('emergencyName')}
                  data-error={!!errors.emergencyName}
                  style={inputStyle(!!errors.emergencyName)}
                  placeholder="Contact's Full Name"
                />
              </Field>
              <Field label="Emergency Phone" required error={errors.emergencyPhone?.message as string}>
                <input
                  {...register('emergencyPhone')}
                  data-error={!!errors.emergencyPhone}
                  style={inputStyle(!!errors.emergencyPhone)}
                  placeholder="9876500000"
                  maxLength={12}
                />
              </Field>
              <Field label="Relationship" required error={errors.emergencyRelationship?.message as string}>
                <select {...register('emergencyRelationship')} style={styles.select}>
                  <option value="">Select Relationship</option>
                  {EMERGENCY_RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* ─── SECTION 5: Statutory Information ───────────── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.sectionIcon, background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}><Shield size={16} /></div>
              <h2 style={styles.sectionTitle}>Statutory Information</h2>
            </div>
            <div style={styles.grid2}>
              <Field label="PAN Number" required error={errors.pan?.message as string} hint="Format: ABCDE1234F">
                <input
                  {...register('pan')}
                  data-error={!!errors.pan}
                  style={inputStyle(!!errors.pan)}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  onChange={e => { e.target.value = e.target.value.toUpperCase(); register('pan').onChange(e); }}
                />
              </Field>
              <Field label="Aadhaar Number" required error={errors.aadhaar?.message as string} hint="12-digit Aadhaar number">
                <input
                  {...register('aadhaar')}
                  data-error={!!errors.aadhaar}
                  style={inputStyle(!!errors.aadhaar)}
                  placeholder="XXXX XXXX XXXX"
                  maxLength={14}
                  type="password"
                  autoComplete="off"
                />
              </Field>
              <Field label="UAN (Universal Account Number)" error={errors.uan?.message as string} hint="Optional — 12 digits">
                <input
                  {...register('uan')}
                  style={inputStyle(!!errors.uan)}
                  placeholder="100XXXXXXXXX"
                  maxLength={12}
                />
              </Field>
              <Field label="ESIC Number" error={errors.esic?.message as string} hint="Optional — 17 digits">
                <input
                  {...register('esic')}
                  style={inputStyle(!!errors.esic)}
                  placeholder="XX-XX-XXXXXX-XXX-XXXX"
                  maxLength={20}
                />
              </Field>
            </div>
          </div>

          {/* ─── SECTION 6: Bank Information ─────────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.sectionIcon, background: 'linear-gradient(135deg, #0ea5e9, #3BAEEB)' }}><Building2 size={16} /></div>
              <h2 style={styles.sectionTitle}>Bank Information</h2>
            </div>
            <div style={styles.grid3}>
              <Field label="Bank Name" required error={errors.bankName?.message as string}>
                <input
                  {...register('bankName')}
                  data-error={!!errors.bankName}
                  style={inputStyle(!!errors.bankName)}
                  placeholder="e.g. State Bank of India"
                />
              </Field>
              <Field label="Account Holder Name" required error={errors.bankAccountHolder?.message as string} hint="Auto-filled from Full Name">
                <input
                  {...register('bankAccountHolder')}
                  data-error={!!errors.bankAccountHolder}
                  style={inputStyle(!!errors.bankAccountHolder)}
                  placeholder="As per bank records"
                />
              </Field>
              <Field label="Account Type" required error={errors.accountType?.message as string}>
                <select {...register('accountType')} style={styles.select}>
                  <option value="">Select Type</option>
                  {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ ...styles.grid3, marginTop: '16px' }}>
              <Field label="Bank Account Number" required error={errors.bankAccount?.message as string}>
                <input
                  {...register('bankAccount')}
                  data-error={!!errors.bankAccount}
                  style={inputStyle(!!errors.bankAccount)}
                  placeholder="Account Number"
                  type="password"
                  autoComplete="off"
                />
              </Field>
              <Field label="Confirm Account Number" required error={errors.confirmBankAccount?.message as string}>
                <input
                  {...register('confirmBankAccount')}
                  data-error={!!errors.confirmBankAccount}
                  style={inputStyle(!!errors.confirmBankAccount)}
                  placeholder="Re-enter Account Number"
                  type="password"
                  autoComplete="off"
                />
              </Field>
              <Field label="IFSC Code" required error={errors.ifscCode?.message as string} hint="Format: SBIN0001234">
                <input
                  {...register('ifscCode')}
                  data-error={!!errors.ifscCode}
                  style={inputStyle(!!errors.ifscCode)}
                  placeholder="SBIN0001234"
                  maxLength={11}
                  onChange={e => { e.target.value = e.target.value.toUpperCase(); register('ifscCode').onChange(e); }}
                />
              </Field>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Field label="Branch Name" error={errors.branchName?.message as string}>
                <input
                  {...register('branchName')}
                  style={styles.input}
                  placeholder="e.g. Connaught Place Branch (optional)"
                />
              </Field>
            </div>
          </div>

          {/* ─── SECTION 7: Mandatory Documents ─────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}><FileText size={16} /></div>
              <h2 style={styles.sectionTitle}>Mandatory Documents</h2>
            </div>
            <div style={styles.grid3}>
              <DocUpload
                label="Aadhaar Card"
                category="AADHAAR"
                accept="application/pdf,image/jpeg,image/jpg,image/png"
                maxSize={MAX_DOC_SIZE}
                value={aadhaarDoc}
                onChange={v => { setAadhaarDoc(v); setValue('aadhaarCardDoc', v.meta); }}
                error={errors.aadhaarCardDoc?.message as string}
              />
              <DocUpload
                label="PAN Card"
                category="PAN"
                accept="application/pdf,image/jpeg,image/jpg,image/png"
                maxSize={MAX_DOC_SIZE}
                value={panDoc}
                onChange={v => { setPanDoc(v); setValue('panCardDoc', v.meta); }}
                error={errors.panCardDoc?.message as string}
              />
              <DocUpload
                label="Bank Passbook / Cancelled Cheque"
                category="BANK_PROOF"
                accept="application/pdf,image/jpeg,image/jpg,image/png"
                maxSize={MAX_DOC_SIZE}
                value={bankDoc}
                onChange={v => { setBankDoc(v); setValue('bankProofDoc', v.meta); }}
                error={errors.bankProofDoc?.message as string}
              />
            </div>
            <div style={{ marginTop: '12px', background: '#FFF8E1', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#92400E', border: '1px solid #FDE68A' }}>
              <strong>Secure upload:</strong> Files are stored by the authenticated employee document service and remain available across sessions and devices.
            </div>
          </div>

          {/* ─── SECTION 8: Additional Documents ────────────── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}><FileText size={16} /></div>
              <h2 style={styles.sectionTitle}>Additional Documents</h2>
              <button type="button" onClick={addAdditionalDoc} style={{ ...styles.uploadBtn, marginLeft: 'auto' }}>
                <Plus size={13} /> Add Document
              </button>
            </div>
            {additionalDocs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#8893A7', fontSize: '13px', background: '#F8FAFD', borderRadius: '10px', border: '1.5px dashed #DCE5F0' }}>
                No additional documents added. Click "Add Document" to attach a resume, passport, certificate, etc.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {additionalDocs.map((doc) => (
                <div key={doc.rowId} style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: '12px', alignItems: 'start', background: '#F8FAFD', borderRadius: '10px', padding: '14px', border: '1.5px solid #DCE5F0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={styles.label}>Document Type</label>
                    <select
                      value={doc.docType}
                      onChange={e => updateAdditionalDoc(doc.rowId, { docType: e.target.value })}
                      style={styles.select}
                    >
                      {ADDITIONAL_DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {doc.docType === 'Other' && (
                      <input
                        value={doc.customTitle}
                        onChange={e => updateAdditionalDoc(doc.rowId, { customTitle: e.target.value })}
                        placeholder="Custom document title"
                        style={{ ...styles.input, marginTop: '4px' }}
                      />
                    )}
                  </div>
                  <div>
                    {doc.meta ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0' }}>
                        {doc.previewUrl
                          ? <img src={doc.previewUrl} alt="" style={styles.docPreview} />
                          : <div style={{ ...styles.docPreview, background: '#EEF4FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={20} color="#3BAEEB" /></div>
                        }
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#24345C' }}>{doc.meta.fileName}</div>
                          <div style={{ fontSize: '11px', color: '#8893A7' }}>{formatBytes(doc.meta.size)}</div>
                        </div>
                        <input type="file" id={`addl-${doc.rowId}`} accept={ALLOWED_EXTRA_TYPES.join(',')} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleAdditionalFileChange(doc.rowId, f); }} />
                        <label htmlFor={`addl-${doc.rowId}`} style={{ ...styles.uploadBtn, cursor: 'pointer' }}>
                          <RefreshCw size={11} /> Replace
                        </label>
                      </div>
                    ) : (
                      <div style={{ paddingTop: '9px' }}>
                        <input type="file" id={`addl-${doc.rowId}`} accept={ALLOWED_EXTRA_TYPES.join(',')} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleAdditionalFileChange(doc.rowId, f); }} />
                        <label htmlFor={`addl-${doc.rowId}`} style={{ ...styles.uploadBtn, cursor: 'pointer' }}>
                          <Upload size={13} /> Upload File
                        </label>
                        <div style={{ fontSize: '11px', color: '#8893A7', marginTop: '6px' }}>PDF, JPG, PNG, DOC — max 5 MB</div>
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => removeAdditionalDoc(doc.rowId)} style={{ ...styles.uploadBtn, background: '#EF4444', marginTop: '9px' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ─── SECTION 9: Photograph & Signature ──────────── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.sectionIcon, background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}><Camera size={16} /></div>
              <h2 style={styles.sectionTitle}>Photograph & Signature <span style={{ fontSize: '12px', fontWeight: '500', color: '#8893A7' }}>(Optional)</span></h2>
            </div>
            <div style={styles.grid2}>
              {/* Photograph */}
              <div style={styles.docBox}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#24345C' }}>Employee Photograph</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <label htmlFor="photo-upload" style={{ ...styles.uploadBtn, cursor: 'pointer' }}>
                      <Camera size={12} /> {photoPreview ? 'Replace' : 'Upload'}
                    </label>
                    {photoPreview && (
                      <button type="button" onClick={() => { setPhotograph(''); setPhotographFile(null); setPhotoPreview(''); setValue('photograph', ''); }} style={{ ...styles.uploadBtn, background: '#EF4444' }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
                {photoPreview
                  ? <img src={photoPreview} alt="Photograph" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #DCE5F0' }} />
                  : <div style={{ textAlign: 'center', padding: '16px 0', color: '#8893A7', fontSize: '12px' }}><Camera size={28} style={{ opacity: 0.3, display: 'block', margin: '0 auto 6px' }} />JPG, PNG — max 2 MB</div>
                }
                <input id="photo-upload" type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }} onChange={e => handleMediaUpload(e, 'photo')} />
              </div>
              {/* Signature */}
              <div style={styles.docBox}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#24345C' }}>Signature</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <label htmlFor="sig-upload" style={{ ...styles.uploadBtn, cursor: 'pointer' }}>
                      <PenTool size={12} /> {sigPreview ? 'Replace' : 'Upload'}
                    </label>
                    {sigPreview && (
                      <button type="button" onClick={() => { setSignature(''); setSignatureFile(null); setSigPreview(''); setValue('signature', ''); }} style={{ ...styles.uploadBtn, background: '#EF4444' }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
                {sigPreview
                  ? <img src={sigPreview} alt="Signature" style={{ width: '160px', height: '60px', objectFit: 'contain', borderRadius: '6px', border: '1.5px solid #DCE5F0', background: '#fff' }} />
                  : <div style={{ textAlign: 'center', padding: '16px 0', color: '#8893A7', fontSize: '12px' }}><PenTool size={28} style={{ opacity: 0.3, display: 'block', margin: '0 auto 6px' }} />JPG, PNG — max 2 MB</div>
                }
                <input id="sig-upload" type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }} onChange={e => handleMediaUpload(e, 'sig')} />
              </div>
            </div>
          </div>

        </div>

        {/* ── STICKY ACTION BAR ─────────────────────────────── */}
        <div style={styles.actionBar}>
          <button type="button" onClick={handleClearDraft} style={styles.btnDanger}>
            <Trash2 size={14} /> Clear Draft
          </button>
          <button type="button" onClick={() => navigate.push('/hr/employees')} style={styles.btnSecondary}>
            <ArrowLeft size={14} /> Cancel
          </button>
          <button type="button" onClick={handleSaveDraft} style={{ ...styles.btnSecondary, borderColor: '#3BAEEB', color: '#2F4375' }} disabled={isSaving}>
            <Save size={14} /> {isSaving ? 'Saving…' : 'Save as Draft'}
          </button>
          <button type="submit" style={styles.btnPrimary} disabled={isRegistering}>
            <UserPlus size={14} /> {isRegistering ? 'Registering…' : 'Register Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Missing import placeholder
function Shield({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
