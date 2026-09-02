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
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotificationStore } from '@/store/notificationStore';
import { employeeRegistrationSchema, employeeEditSchema } from '../employee.schema';
import { employeesService } from '@/services/hr/employeesService';
import { clearFilesByPrefix, getFile, saveFile } from '../employee.db';
import { getBackendAssetUrl } from '@/lib/assetUrl';

// ── Constants ──────────────────────────────────────────────────
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary', 'Consultant'] as const;
const DRAFT_VERSION = 1;
const REGISTRATION_DRAFT_KEY = 'hr_employee_registration_draft_v1';
const PHOTO_DRAFT_KEY = 'draft_employee_photo';
const SIGNATURE_DRAFT_KEY = 'draft_employee_signature';
const normalizeIndianPhone = (value: string) =>
  value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
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
  const inputId = `doc-upload-${category.toLowerCase()}-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const handleFile = async (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImg = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|gif|heic|heif|bmp)$/i);
    if (!isPdf && !isImg && file.type && !accept.split(',').some(t => file.type.includes(t.trim().split('/')[1]))) {
      Swal.fire('Invalid File', 'Only PDF or JPG/PNG image files are allowed.', 'error');
      return;
    }
    if (file.size > maxSize) {
      Swal.fire('File Too Large', `Maximum allowed size is ${formatBytes(maxSize)}.`, 'error');
      return;
    }
    if (value.previewUrl && value.previewUrl.startsWith('blob:')) URL.revokeObjectURL(value.previewUrl);

    const storageKey = `draft_${category}_${Date.now()}`;
    await saveFile(storageKey, file).catch(() => {});
    const previewUrl = isImg ? URL.createObjectURL(file) : null;
    onChange({
      meta: {
        id: genId(),
        fileName: file.name,
        mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
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
    if (value.previewUrl && value.previewUrl.startsWith('blob:')) URL.revokeObjectURL(value.previewUrl);
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
      gap: '10px',
      position: 'relative'
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
          <label htmlFor={inputId} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Upload size={12} /> {hasFile ? 'Replace' : 'Upload'}
          </label>
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
        <label htmlFor={inputId} style={{ textAlign: 'center', padding: '12px 0', color: '#64748b', fontSize: '12px', cursor: 'pointer', display: 'block' }}>
          <Upload size={22} style={{ marginBottom: '4px', opacity: 0.5, margin: '0 auto 4px', display: 'block' }} />
          <div>Click Upload to attach (PDF, JPG, PNG — max {formatBytes(maxSize)})</div>
        </label>
      )}
      {error && <span style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: '600' }}><AlertCircle size={12} /> {error}</span>}
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

const employmentTypeReverseMap: Record<string, string> = {
  PERMANENT: 'Full-time',
  FULL_TIME: 'Full-time',
  'FULL-TIME': 'Full-time',
  PART_TIME: 'Part-time',
  'PART-TIME': 'Part-time',
  CONTRACT: 'Contract',
  INTERN: 'Intern',
  TEMPORARY: 'Temporary',
  CONSULTANT: 'Consultant',
  PROBATION: 'Full-time',
  ON_PROBATION: 'Full-time',
};

const genderMap: Record<string, 'Male' | 'Female' | 'Other' | 'Prefer not to say'> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
  Male: 'Male',
  Female: 'Female',
  Other: 'Other',
};

const accountTypeMap: Record<string, 'Savings' | 'Current' | 'Salary'> = {
  SAVINGS: 'Savings',
  CURRENT: 'Current',
  SALARY: 'Salary',
  Savings: 'Savings',
  Current: 'Current',
  Salary: 'Salary',
};

export default function EmployeeRegistrationForm({ editEmployeeId }: { editEmployeeId?: string }) {
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const editId = editEmployeeId || searchParams?.get('edit') || searchParams?.get('id');
  const isEditMode = !!editId;

  const showToast = useNotificationStore((s: any) => s.showToast);
  const [departments, setDepartments] = useState<any[]>([]);
  const [workLocations, setWorkLocations] = useState<any[]>([]);
  const [eligibleManagers, setEligibleManagers] = useState<any[]>([]);
  const [existingEmployee, setExistingEmployee] = useState<any>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  // Form setup
  const {
    register, control, handleSubmit, watch, getValues, setValue, reset, setError,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(isEditMode ? employeeEditSchema : employeeRegistrationSchema),
    mode: 'onBlur',
    defaultValues: {
      additionalDocuments: [],
      photograph: '',
      signature: '',
      sameAsPresentAddress: false,
      companyPhone: '',
      permanentAddress: '',
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
  const hasSessionDraft = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);

  // Department search
  const [deptSearch, setDeptSearch] = useState('');
  const [deptOpen, setDeptOpen] = useState(false);
  const watchedDept = watch('department');
  const watchedWorkLoc = watch('workLocation');
  const watchedCustomDept = watch('customDepartment');
  const watchedCustomWorkLoc = watch('customWorkLocation');

  // Load existing employee if in edit mode
  useEffect(() => {
    if (!editId) return;
    setIsLoadingExisting(true);
    employeesService.getEmployee(editId)
      .then((emp) => {
        setExistingEmployee(emp);
        const mappedGender = genderMap[emp.gender] || 'Male';
        const mappedEmploymentType = employmentTypeReverseMap[emp.employmentType] || 'Full-time';
        const mappedAccountType = accountTypeMap[emp.bankAccountType] || 'Savings';

        reset({
          employeeCode: emp.employeeCode || '',
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          dob: emp.dateOfBirth ? new Date(emp.dateOfBirth).toISOString().split('T')[0] : '',
          gender: mappedGender,
          designation: emp.jobTitle || '',
          department: emp.departmentId || emp.department?.id || '',
          workLocation: emp.workLocationId || emp.workLocation?.id || '',
          managerId: emp.reportingManagerId || emp.reportingManager?.id || '',
          employmentType: mappedEmploymentType,
          joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
          probationEndDate: emp.probationEndDate ? new Date(emp.probationEndDate).toISOString().split('T')[0] : '',
          salary: emp.baseSalary !== undefined && emp.baseSalary !== null ? Number(emp.baseSalary) : 0,
          baseSalary: emp.baseSalary !== undefined && emp.baseSalary !== null ? Number(emp.baseSalary) : 0,
          branchName: emp.branchName || '',
          email: emp.workEmail || '',
          personalEmail: emp.personalEmail || '',
          phone: emp.phoneNumber || '',
          companyPhone: emp.companyPhoneNumber || '',
          residentialAddress: emp.residentialAddress || '',
          permanentAddress: emp.permanentAddress || emp.residentialAddress || '',
          sameAsPresentAddress: !!(emp.residentialAddress && emp.permanentAddress && emp.residentialAddress === emp.permanentAddress),
          emergencyName: emp.emergencyContactName || '',
          emergencyPhone: emp.emergencyContactPhone || '',
          emergencyRelationship: emp.emergencyRelationship || 'Parent',
          pan: emp.panNumber || '',
          aadhaar: emp.aadhaarLastFour ? `XXXX-XXXX-${emp.aadhaarLastFour}` : '',
          uan: emp.uanNumber || '',
          esic: emp.esicNumber || '',
          bankName: emp.bankName || '',
          bankAccountHolder: emp.accountHolderName || '',
          accountType: mappedAccountType,
          bankAccount: emp.bankAccountLastFour ? `XXXXXXXX${emp.bankAccountLastFour}` : '',
          confirmBankAccount: emp.bankAccountLastFour ? `XXXXXXXX${emp.bankAccountLastFour}` : '',
          ifscCode: emp.ifscCode || '',
        });

        if (emp.selfieUrl) {
          setPhotoPreview(getBackendAssetUrl(emp.selfieUrl));
        }
        if (emp.signatureUrl) {
          setSigPreview(getBackendAssetUrl(emp.signatureUrl));
        }

        if (emp.documents && emp.documents.length > 0) {
          const addls: AdditionalDoc[] = [];
          emp.documents.forEach((doc: any) => {
            const rawKey = doc.storageKey || doc.fileUrl;
            const previewUrl = getBackendAssetUrl(rawKey);
            const meta = {
              id: doc.id,
              fileName: doc.documentName || doc.originalFileName || doc.documentType,
              mimeType: doc.mimeType || 'application/pdf',
              size: doc.fileSize || 0,
              category: doc.documentType,
              title: doc.documentName || doc.documentType,
              storageKey: rawKey,
              uploadedAt: doc.createdAt || new Date().toISOString(),
            };
            if (doc.documentType === 'AADHAAR_CARD') {
              setAadhaarDoc({ meta, previewUrl, blob: null });
            } else if (doc.documentType === 'PAN_CARD') {
              setPanDoc({ meta, previewUrl, blob: null });
            } else if (doc.documentType === 'BANK_PASSBOOK') {
              setBankDoc({ meta, previewUrl, blob: null });
            } else if (doc.documentType === 'PHOTOGRAPH') {
              setPhotoPreview(previewUrl);
            } else if (doc.documentType === 'SIGNATURE') {
              setSigPreview(previewUrl);
            } else {
              addls.push({
                rowId: doc.id,
                docType: doc.documentType?.replace(/_/g, ' ') || 'Other',
                customTitle: doc.documentName || '',
                meta,
                previewUrl,
                blob: null,
              });
            }
          });
          if (addls.length > 0) setAdditionalDocs(addls);
        }
        setIsDraftReady(true);
      })
      .catch((err) => {
        console.error('Failed to load employee for editing:', err);
        Swal.fire('Error', 'Failed to load employee details.', 'error');
      })
      .finally(() => setIsLoadingExisting(false));
  }, [editId, reset]);

  useEffect(() => {
    if (isEditMode) return;
    const restore = async () => {
    try {
      const stored = sessionStorage.getItem(REGISTRATION_DRAFT_KEY);
      if (!stored) return;
      const draft = JSON.parse(stored);
      if (draft?.version === DRAFT_VERSION && draft.values) {
        reset(draft.values);
        hasSessionDraft.current = true;
        setDraftRestored(true);
        showToast('Your registration details were restored after refresh.');
        await (async () => {
          const restoreDoc = async (meta: DocState['meta']) => {
            if (!meta) return null;
            const blob = await getFile(meta.storageKey);
            if (!blob) return null;
            return { meta, blob: new File([blob], meta.fileName, { type: meta.mimeType }), previewUrl: blob.type.startsWith('image/') ? URL.createObjectURL(blob) : null };
          };
          const documents = draft.documents || {};
          const [aadhaar, pan, bank, photo, signature] = await Promise.all([
            restoreDoc(documents.aadhaar),
            restoreDoc(documents.pan),
            restoreDoc(documents.bank),
            getFile(PHOTO_DRAFT_KEY),
            getFile(SIGNATURE_DRAFT_KEY),
          ]);
          if (aadhaar) setAadhaarDoc(aadhaar);
          if (pan) setPanDoc(pan);
          if (bank) setBankDoc(bank);
          const restoredAdditional = await Promise.all((documents.additional || []).map(async (doc: AdditionalDoc) => {
            const restored = await restoreDoc(doc.meta);
            return restored ? { ...doc, ...restored } : doc;
          }));
          setAdditionalDocs(restoredAdditional);
          if (photo) {
            const file = new File([photo], 'employee-photo', { type: photo.type });
            const base64 = await fileToBase64(file);
            setPhotograph(base64); setPhotoPreview(base64); setPhotographFile(file);
          }
          if (signature) {
            const file = new File([signature], 'employee-signature', { type: signature.type });
            const base64 = await fileToBase64(file);
            setSignature(base64); setSigPreview(base64); setSignatureFile(file);
          }
        })();
      }
    } catch {
      sessionStorage.removeItem(REGISTRATION_DRAFT_KEY);
    } finally {
      setIsDraftReady(true);
    }
    };
    void restore();
  }, [reset, showToast, isEditMode]);

  useEffect(() => {
    Promise.all([
      employeesService.listDepartments(),
      employeesService.listWorkLocations(),
      employeesService.listReportingManagers(),
      isEditMode ? Promise.resolve([]) : employeesService.listDrafts(),
    ]).then(([departmentRows, locations, managers, drafts]) => {
      setDepartments(departmentRows);
      setWorkLocations(locations);
      setEligibleManagers(managers);
      if (!isEditMode) {
        const latest = drafts[0];
        if (!hasSessionDraft.current && latest?.employeeData) {
          reset(latest.employeeData);
          setDraftId(latest.id);
          setDraftRestored(true);
          showToast('Employee registration draft restored.');
        }
      }
    }).catch((error) => console.warn('HR data load fallback:', error.message));
  }, [reset, showToast, isEditMode]);

  useEffect(() => {
    employeesService.getNextEmployeeCode()
      .then(({ employeeCode }) => {
        if (!getValues('employeeCode')) {
          setValue('employeeCode', employeeCode, { shouldDirty: false });
        }
      })
      .catch((error) => console.warn('Employee code suggestion unavailable:', error.message));
  }, [getValues, setValue]);

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

  // Auto-sync permanent address when "Same as Present Address" is checked
  const sameAsPresent = watch('sameAsPresentAddress');
  const watchedResidential = watch('residentialAddress');
  useEffect(() => {
    if (sameAsPresent) {
      setValue('permanentAddress', watchedResidential || '', { shouldDirty: false });
    }
  }, [sameAsPresent, watchedResidential, setValue]);

  // Draft auto-save
  const formValues = watch();
  useEffect(() => {
    if (isEditMode || !isDraftReady) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const draft = {
          version: DRAFT_VERSION,
          values: {
            ...formValues,
          },
          documents: {
            aadhaar: aadhaarDoc.meta,
            pan: panDoc.meta,
            bank: bankDoc.meta,
            additional: additionalDocs.map(({ rowId, docType, customTitle, meta }) => ({ rowId, docType, customTitle, meta })),
          },
          lastSavedAt: new Date().toISOString(),
        };
        sessionStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(draft));
      } catch { /* ignore */ }
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [formValues, aadhaarDoc.meta, panDoc.meta, bankDoc.meta, additionalDocs, photograph, signature, isDraftReady]);

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
    sessionStorage.removeItem(REGISTRATION_DRAFT_KEY);
    await clearFilesByPrefix('draft_');
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
    if (type === 'photo') { await saveFile(PHOTO_DRAFT_KEY, file); setPhotograph(b64); setPhotographFile(file); setPhotoPreview(b64); setValue('photograph', 'selected'); }
    else { await saveFile(SIGNATURE_DRAFT_KEY, file); setSignature(b64); setSignatureFile(file); setSigPreview(b64); setValue('signature', 'selected'); }
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
    await saveFile(storageKey, file);
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

    if (isEditMode && editId) {
      setIsRegistering(true);
      try {
        const employmentTypes: Record<string, string> = {
          'Full-time': 'PERMANENT', 'Part-time': 'PART_TIME', Contract: 'CONTRACT',
          Intern: 'INTERN', Temporary: 'TEMPORARY', Consultant: 'CONSULTANT',
        };
        const genders: Record<string, string> = {
          Male: 'MALE', Female: 'FEMALE', Other: 'OTHER', 'Prefer not to say': 'PREFER_NOT_TO_SAY',
        };
        const normalizeDateStr = (val?: string | null) => {
          if (!val || typeof val !== 'string') return undefined;
          const s = val.trim();
          if (!s) return undefined;
          const dmyMatch = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
          if (dmyMatch) {
            const day = dmyMatch[1].padStart(2, '0');
            const month = dmyMatch[2].padStart(2, '0');
            const year = dmyMatch[3];
            return `${year}-${month}-${day}`;
          }
          return s;
        };

        const updatePayload: any = {
          version: existingEmployee?.version,
          firstName: data.firstName ? data.firstName.trim() : undefined,
          lastName: data.lastName ? data.lastName.trim() : undefined,
          fullName: (data.firstName || data.lastName)
            ? `${(data.firstName || '').trim()} ${(data.lastName || '').trim()}`.trim()
            : (data.name ? data.name.trim() : undefined),
          dateOfBirth: normalizeDateStr(data.dob),
          gender: data.gender ? (genders[data.gender] || data.gender.toUpperCase()) : undefined,
          jobTitle: data.designation ? data.designation.trim() : undefined,
          departmentId: data.department === 'CUSTOM' ? (data.customDepartment?.trim() || 'CUSTOM') : (data.department || undefined),
          customDepartment: data.department === 'CUSTOM' ? data.customDepartment?.trim() : undefined,
          departmentName: data.department === 'CUSTOM' ? data.customDepartment?.trim() : undefined,
          workLocationId: data.workLocation === 'CUSTOM' ? (data.customWorkLocation?.trim() || 'CUSTOM') : (data.workLocation && data.workLocation !== 'Select Location' ? data.workLocation : undefined),
          customWorkLocation: data.workLocation === 'CUSTOM' ? data.customWorkLocation?.trim() : undefined,
          workLocationName: data.workLocation === 'CUSTOM' ? data.customWorkLocation?.trim() : undefined,
          reportingManagerId: data.managerId || null,
          employmentType: data.employmentType ? (employmentTypes[data.employmentType] || data.employmentType.toUpperCase()) : undefined,
          joiningDate: normalizeDateStr(data.joiningDate),
          probationEndDate: normalizeDateStr(data.probationEndDate) || null,
          workEmail: data.email ? data.email.trim().toLowerCase() : undefined,
          personalEmail: data.personalEmail ? data.personalEmail.trim().toLowerCase() : null,
          phoneNumber: data.phone ? normalizeIndianPhone(data.phone) : undefined,
          companyPhoneNumber: data.companyPhone ? normalizeIndianPhone(data.companyPhone) : null,
          residentialAddress: data.residentialAddress ? data.residentialAddress.trim() : undefined,
          permanentAddress: (data.sameAsPresentAddress ? (data.residentialAddress || '') : (data.permanentAddress || data.residentialAddress || '')).trim(),
          emergencyContactName: data.emergencyName ? data.emergencyName.trim() : undefined,
          emergencyContactPhone: data.emergencyPhone ? normalizeIndianPhone(data.emergencyPhone) : undefined,
          emergencyRelationship: data.emergencyRelationship || undefined,
          panNumber: data.pan ? data.pan.trim().toUpperCase() : undefined,
          uanNumber: data.uan ? data.uan.trim() : null,
          esicNumber: data.esic ? data.esic.trim() : null,
          bankName: data.bankName ? data.bankName.trim() : undefined,
          accountHolderName: data.bankAccountHolder ? data.bankAccountHolder.trim() : undefined,
          bankAccountType: data.accountType ? data.accountType.toUpperCase() : undefined,
          ifscCode: data.ifscCode ? data.ifscCode.trim().toUpperCase() : undefined,
          branchName: data.branchName ? data.branchName.trim() : null,
          baseSalary: (data.baseSalary !== undefined && data.baseSalary !== null && String(data.baseSalary).trim() !== '') ? Number(data.baseSalary) : (data.salary ? Number(data.salary) : 0),
        };

        if (data.aadhaar && !data.aadhaar.includes('X') && !data.aadhaar.includes('•') && !data.aadhaar.includes('*')) {
          const cleanAadhaar = data.aadhaar.replace(/\D/g, '');
          if (cleanAadhaar.length >= 10) {
            updatePayload.aadhaarNumber = cleanAadhaar;
          }
        }
        if (data.bankAccount && !data.bankAccount.includes('X') && !data.bankAccount.includes('•') && !data.bankAccount.includes('*')) {
          const cleanBank = data.bankAccount.replace(/\D/g, '');
          if (cleanBank.length >= 4) {
            updatePayload.bankAccountNumber = cleanBank;
          }
        }

        if (aadhaarDoc.blob) {
          const fd = new FormData();
          fd.append('file', aadhaarDoc.blob);
          fd.append('document', aadhaarDoc.blob);
          fd.append('documentType', 'AADHAAR_CARD');
          fd.append('category', 'AADHAAR_CARD');
          fd.append('documentName', 'Aadhaar Card');
          await employeesService.uploadEmployeeDocument(editId, fd).catch((e) => console.warn('Aadhaar upload notice:', e));
        }
        if (panDoc.blob) {
          const fd = new FormData();
          fd.append('file', panDoc.blob);
          fd.append('document', panDoc.blob);
          fd.append('documentType', 'PAN_CARD');
          fd.append('category', 'PAN_CARD');
          fd.append('documentName', 'PAN Card');
          await employeesService.uploadEmployeeDocument(editId, fd).catch((e) => console.warn('PAN upload notice:', e));
        }
        if (bankDoc.blob) {
          const fd = new FormData();
          fd.append('file', bankDoc.blob);
          fd.append('document', bankDoc.blob);
          fd.append('documentType', 'BANK_PASSBOOK');
          fd.append('category', 'BANK_PASSBOOK');
          fd.append('documentName', 'Bank Passbook / Cheque');
          await employeesService.uploadEmployeeDocument(editId, fd).catch((e) => console.warn('Bank doc upload notice:', e));
        }
        if (photographFile) {
          const fd = new FormData();
          fd.append('file', photographFile);
          fd.append('document', photographFile);
          fd.append('documentType', 'PHOTOGRAPH');
          fd.append('category', 'PHOTOGRAPH');
          fd.append('documentName', 'Employee Passport Photo');
          await employeesService.uploadEmployeeDocument(editId, fd).catch((e) => console.warn('Photo upload notice:', e));
        }
        if (signatureFile) {
          const fd = new FormData();
          fd.append('file', signatureFile);
          fd.append('document', signatureFile);
          fd.append('documentType', 'SIGNATURE');
          fd.append('category', 'SIGNATURE');
          fd.append('documentName', 'Digital Signature');
          await employeesService.uploadEmployeeDocument(editId, fd).catch((e) => console.warn('Signature upload notice:', e));
        }
        for (const doc of additionalDocs) {
          if (doc.blob) {
            const fd = new FormData();
            fd.append('file', doc.blob);
            fd.append('document', doc.blob);
            const docType = doc.docType.toUpperCase().replaceAll(' ', '_');
            fd.append('documentType', docType);
            fd.append('category', docType);
            fd.append('documentName', doc.customTitle || doc.docType);
            await employeesService.uploadEmployeeDocument(editId, fd).catch((e) => console.warn('Addl doc upload notice:', e));
          }
        }

        const employee = await employeesService.updateEmployee(editId, updatePayload);
        await Swal.fire({
          icon: 'success',
          title: 'Employee File Updated!',
          html: `<b>${employee.fullName}</b> profile and registration records have been saved successfully.<br/><small>Employee ID: <strong>${employee.employeeCode}</strong></small>`,
          confirmButtonText: 'View Roster Directory',
          confirmButtonColor: '#0f172a',
        });
        navigate.push('/hr/employees');
      } catch (err: any) {
        const msg = err?.data?.message || err?.message || 'Update failed.';
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          html: `<p>${msg}</p>`,
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setIsRegistering(false);
      }
      return;
    }

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
        departmentId: data.department === 'CUSTOM' ? (data.customDepartment?.trim() || 'CUSTOM') : data.department,
        customDepartment: data.department === 'CUSTOM' ? data.customDepartment?.trim() : undefined,
        departmentName: data.department === 'CUSTOM' ? data.customDepartment?.trim() : undefined,
        reportingManagerId: data.managerId || undefined,
        workLocationId: data.workLocation === 'CUSTOM' ? (data.customWorkLocation?.trim() || 'CUSTOM') : data.workLocation,
        customWorkLocation: data.workLocation === 'CUSTOM' ? data.customWorkLocation?.trim() : undefined,
        workLocationName: data.workLocation === 'CUSTOM' ? data.customWorkLocation?.trim() : undefined,
        employmentType: employmentTypes[data.employmentType],
        joiningDate: data.joiningDate,
        probationEndDate: data.probationEndDate || undefined,
        workEmail: data.email,
        personalEmail: data.personalEmail || undefined,
        phoneNumber: normalizeIndianPhone(data.phone),
        companyPhoneNumber: data.companyPhone ? normalizeIndianPhone(data.companyPhone) : undefined,
        residentialAddress: data.residentialAddress,
        permanentAddress: data.sameAsPresentAddress ? data.residentialAddress : (data.permanentAddress || data.residentialAddress),
        emergencyContactName: data.emergencyName,
        emergencyContactPhone: normalizeIndianPhone(data.emergencyPhone),
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
        baseSalary: (data.baseSalary !== undefined && data.baseSalary !== null && String(data.baseSalary).trim() !== '') ? Number(data.baseSalary) : (data.salary ? Number(data.salary) : 0),
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
      sessionStorage.removeItem(REGISTRATION_DRAFT_KEY);
      await clearFilesByPrefix('draft_');

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
        phoneNumber: 'phone', companyPhoneNumber: 'companyPhone', confirmAccountNumber: 'confirmBankAccount',
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

  return (
    <div className="reg-form-wrapper" style={{ maxWidth: '1080px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        .reg-grid-3, .reg-grid-4 {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
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
        @media (max-width: 480px) {
          .reg-form-wrapper {
            padding: 0 !important;
          }
          .reg-header-banner {
            padding: 14px 12px !important;
            border-radius: 12px !important;
          }
          .reg-form-card {
            padding: 14px 10px !important;
          }
          .reg-footer-nav {
            padding: 12px !important;
            bottom: 8px !important;
          }
          .reg-footer-nav > div {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .reg-footer-nav button {
            width: 100% !important;
            min-height: 42px !important;
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
              {isEditMode ? `Edit Employee File: ${existingEmployee?.fullName || 'Loading…'}` : 'Register New Staff'}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '13px' }}>
              {isEditMode ? `Employee Code: ${existingEmployee?.employeeCode || '...'} • Update personal, statutory, banking and department profile` : 'Create employee profile, employment, statutory and banking records'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isEditMode ? (
            <span style={{ background: 'rgba(37, 99, 235, 0.4)', border: '1px solid rgba(147, 197, 253, 0.4)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: '700' }}>
              ⚡ Editing Mode
            </span>
          ) : draftRestored ? (
            <span style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: '700' }}>
              ✏️ Draft Auto-Restored
            </span>
          ) : null}
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#bae6fd' }}>Employee Master</span>
        </div>
      </div>

      {/* ── STEPPER NAVIGATION TABS ───────────────────────────────────── */}
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
          {(
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
              <div className="reg-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <FormField label="Work Email" required error={errors.email?.message as string}>
                  <input type="email" {...register('email')} style={inputStyle(!!errors.email)} placeholder="rahul@himalaya.com" />
                </FormField>
                <FormField label="Personal Email" error={errors.personalEmail?.message as string}>
                  <input type="email" {...register('personalEmail')} style={inputStyle(!!errors.personalEmail)} placeholder="rahul@gmail.com" />
                </FormField>
                <FormField label="Mobile Phone Number" required error={errors.phone?.message as string}>
                  <input {...register('phone')} style={inputStyle(!!errors.phone)} placeholder="9876500000" maxLength={12} />
                </FormField>
                <FormField label="Company Number" error={errors.companyPhone?.message as string} hint="Official SIM / Work Phone">
                  <input {...register('companyPhone')} style={inputStyle(!!errors.companyPhone)} placeholder="e.g. 9876500001 (optional)" maxLength={12} />
                </FormField>
              </div>

              {/* 2 Addresses: Present & Permanent */}
              <div className="reg-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Present / Current Address" required error={errors.residentialAddress?.message as string}>
                  <textarea
                    {...register('residentialAddress')}
                    style={{ ...inputStyle(!!errors.residentialAddress), minHeight: '90px', fontFamily: 'inherit', resize: 'vertical' }}
                    placeholder="Enter present / current residential address (Street, City, State, PIN)"
                  />
                </FormField>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', letterSpacing: '0.01em' }}>
                      Permanent Address
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '600', color: '#2563eb', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        {...register('sameAsPresentAddress')}
                        onChange={(e) => {
                          register('sameAsPresentAddress').onChange(e);
                          if (e.target.checked) {
                            setValue('permanentAddress', getValues('residentialAddress') || '', { shouldDirty: true });
                          }
                        }}
                      />
                      Same as Present Address
                    </label>
                  </div>
                  <textarea
                    {...register('permanentAddress')}
                    disabled={sameAsPresent}
                    style={{
                      ...inputStyle(!!errors.permanentAddress),
                      minHeight: '90px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      background: sameAsPresent ? '#f8fafc' : '#ffffff',
                      color: sameAsPresent ? '#64748b' : '#0f172a',
                      cursor: sameAsPresent ? 'not-allowed' : 'text'
                    }}
                    placeholder={sameAsPresent ? 'Synced with Present / Current Address' : 'Enter permanent residential address (Street, City, State, PIN)'}
                  />
                  {errors.permanentAddress && (
                    <span style={{ fontSize: '11.5px', color: '#ef4444', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <AlertCircle size={12} /> {errors.permanentAddress?.message as string}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: EMPLOYMENT & STATUTORY ──────────────────────── */}
          {(
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
                
                {/* Searchable Department + Custom Option */}
                <FormField label="Department" required error={(errors.department?.message || errors.customDepartment?.message) as string}>
                  {watchedDept === 'CUSTOM' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          {...register('customDepartment')}
                          autoFocus
                          style={{ ...inputStyle(!!errors.customDepartment), borderColor: '#2563eb', background: '#eff6ff' }}
                          placeholder="Type custom department name..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setValue('department', '', { shouldValidate: true });
                            setValue('customDepartment', '');
                          }}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            color: '#475569',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Select List
                        </button>
                      </div>
                      <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600' }}>
                        ✨ Writing new custom department
                      </span>
                    </div>
                  ) : (
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
                              placeholder="Search or type department..."
                              style={{ ...inputStyle(false), marginBottom: 0 }}
                              onClick={e => e.stopPropagation()}
                            />
                          </div>
                          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                            {deptSearch.trim() && (
                              <div
                                onClick={() => {
                                  setValue('department', 'CUSTOM', { shouldValidate: true });
                                  setValue('customDepartment', deptSearch.trim(), { shouldValidate: true });
                                  setDeptOpen(false);
                                  setDeptSearch('');
                                }}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  fontSize: '12.5px',
                                  color: '#2563eb',
                                  background: '#eff6ff',
                                  fontWeight: '700',
                                  borderBottom: '1px solid #dbeafe',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                ✨ Use "{deptSearch.trim()}" as Custom Department
                              </div>
                            )}

                            {filteredDepts.map(d => (
                              <div
                                key={d.id}
                                onClick={() => {
                                  setValue('department', d.id, { shouldValidate: true });
                                  setValue('customDepartment', '');
                                  setDeptOpen(false);
                                  setDeptSearch('');
                                }}
                                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: '#0f172a', background: watchedDept === d.id ? '#f1f5f9' : 'transparent', fontWeight: watchedDept === d.id ? '700' : 'normal' }}
                              >
                                {d.name}
                              </div>
                            ))}

                            <div
                              onClick={() => {
                                setValue('department', 'CUSTOM', { shouldValidate: true });
                                setValue('customDepartment', deptSearch.trim() || '', { shouldValidate: true });
                                setDeptOpen(false);
                                setDeptSearch('');
                              }}
                              style={{
                                padding: '9px 12px',
                                cursor: 'pointer',
                                fontSize: '12.5px',
                                color: '#2563eb',
                                background: '#f8fafc',
                                fontWeight: '700',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              ✨ + Write Custom Department...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <input type="hidden" {...register('department')} />
                </FormField>
              </div>

              {/* Manager & Location & Employment Type */}
              <div className="reg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <FormField label="Reporting Manager" error={errors.managerId?.message as string}>
                  <select {...register('managerId')} style={selectStyle(!!errors.managerId)}>
                    <option value="">None / Direct Report</option>
                    {eligibleManagers.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.fullName} — {e.jobTitle}{e.department?.name ? ` • ${e.department.name}` : ''}</option>
                    ))}
                  </select>
                </FormField>

                {/* Work Location + Custom Option */}
                <FormField label="Work Location" required error={(errors.workLocation?.message || errors.customWorkLocation?.message) as string}>
                  {watchedWorkLoc === 'CUSTOM' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          {...register('customWorkLocation')}
                          autoFocus
                          style={{ ...inputStyle(!!errors.customWorkLocation), borderColor: '#2563eb', background: '#eff6ff' }}
                          placeholder="Type custom work location name..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setValue('workLocation', '', { shouldValidate: true });
                            setValue('customWorkLocation', '');
                          }}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            color: '#475569',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Select List
                        </button>
                      </div>
                      <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600' }}>
                        ✨ Writing new custom work location
                      </span>
                    </div>
                  ) : (
                    <select
                      {...register('workLocation')}
                      required
                      aria-required="true"
                      style={selectStyle(!!errors.workLocation)}
                      onChange={(e) => {
                        register('workLocation').onChange(e);
                        if (e.target.value === 'CUSTOM') {
                          setValue('customWorkLocation', '', { shouldValidate: false });
                        }
                      }}
                    >
                      <option value="">Select Location</option>
                      {workLocations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                      <option value="CUSTOM" style={{ fontWeight: '700', color: '#2563eb' }}>
                        ✨ + Write Custom Location...
                      </option>
                    </select>
                  )}
                </FormField>

                <FormField label="Employment Type" required error={errors.employmentType?.message as string}>
                  <select {...register('employmentType')} style={selectStyle(!!errors.employmentType)}>
                    <option value="">Select Type</option>
                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
              </div>

              {/* Dates & Compensation */}
              <div className="reg-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <FormField label="Date of Joining" required error={errors.joiningDate?.message as string}>
                  <input type="date" {...register('joiningDate')} style={inputStyle(!!errors.joiningDate)} />
                </FormField>
                <FormField label="Probation End Date" error={errors.probationEndDate?.message as string} hint="Optional — leave blank if none">
                  <input type="date" {...register('probationEndDate')} style={inputStyle(!!errors.probationEndDate)} />
                </FormField>
                <FormField label="Gross Salary (₹ / Month)" error={errors.baseSalary?.message as string} hint="Monthly gross compensation">
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', color: '#64748b', fontWeight: '800', fontSize: '14px', zIndex: 2 }}>₹</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="e.g. 45000"
                      {...register('baseSalary')}
                      style={{ ...inputStyle(!!errors.baseSalary), paddingLeft: '28px', fontWeight: '700', color: '#0f172a' }}
                    />
                  </div>
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
                    <input {...register('aadhaar')} style={inputStyle(!!errors.aadhaar)} placeholder="12 digits, starting 2–9" maxLength={12} inputMode="numeric" type="password" autoComplete="off" />
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
          {(
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
          {(
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
            {!isEditMode && (
              <>
                <button type="button" onClick={handleClearDraft} style={{ padding: '9px 14px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trash2 size={14} /> Clear Draft
                </button>
                <button type="button" onClick={handleSaveDraft} style={{ padding: '9px 14px', background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={isSaving}>
                  <Save size={14} /> {isSaving ? 'Saving…' : 'Save Draft'}
                </button>
              </>
            )}
            {isEditMode && (
              <button
                type="button"
                onClick={() => navigate.push(`/hr/employees/${editId}`)}
                style={{ padding: '9px 14px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Eye size={14} /> View Current Profile
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => navigate.push('/hr/employees')}
              style={{ padding: '10px 18px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={14} /> Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '10px 24px',
                background: isEditMode
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isEditMode ? '0 4px 12px rgba(2, 132, 199, 0.3)' : '0 4px 12px rgba(22, 163, 74, 0.3)'
              }}
              disabled={isRegistering}
            >
              {isEditMode ? (
                <>
                  <Save size={16} /> {isRegistering ? 'Saving Changes…' : 'Save Employee Changes'}
                </>
              ) : (
                <>
                  <UserPlus size={16} /> {isRegistering ? 'Registering…' : 'Complete Employee Registration'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
