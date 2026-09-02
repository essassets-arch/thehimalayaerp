import * as z from 'zod';

// ── Regex Patterns ──
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const aadhaarRegex = /^[2-9][0-9]{11}$/;
export const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// ── Document Metadata (for form state) ──
export const documentMetadataSchema = z.object({
  id: z.string(),
  category: z.string(),
  documentType: z.string(),
  title: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  storageKey: z.string(),
  uploadedAt: z.string(),
});

// ────────────────────────────────────────────────────────────────
// 1. STRICT REGISTRATION SCHEMA
// ────────────────────────────────────────────────────────────────
export const employeeRegistrationSchema = z
  .object({
    employeeCode: z.string().min(1, 'Employee ID Code is mandatory').trim(),
    firstName: z.string().min(1, 'First Name is mandatory').trim(),
    lastName: z.string().min(1, 'Last Name is mandatory').trim(),
    name: z.string().min(1, 'Full Name is mandatory').trim(),

    // Employment
    designation: z.string().min(1, 'Job Title is mandatory').trim(),
    department: z.string().min(1, 'Department is mandatory'),
    customDepartment: z.string().optional(),
    managerId: z.string().optional(),
    // Locations are configured in the database, so retain their ID rather
    // than constraining registration to a stale, hard-coded list.
    workLocation: z.string().min(1, 'Work Location is mandatory'),
    customWorkLocation: z.string().optional(),
    employmentType: z.enum(
      ['Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary', 'Consultant'],
      { message: 'Employment Type is mandatory' }
    ),
    joiningDate: z.string().min(1, 'Date of Joining is mandatory'),
    probationEndDate: z.string().optional().nullable(),
    salary: z.preprocess((val) => val === '' || val === undefined || val === null ? 0 : Number(val), z.number().min(0, 'Salary must be 0 or greater').optional().default(0)),
    baseSalary: z.preprocess((val) => val === '' || val === undefined || val === null ? 0 : Number(val), z.number().min(0, 'Salary must be 0 or greater').optional().default(0)),

    // Contact
    email: z.string().min(1, 'Work Email is mandatory').email('Invalid Work Email format'),
    personalEmail: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        'Invalid Personal Email format'
      ),
    phone: z
      .string()
      .transform((v) => v.replace(/\D/g, ''))
      .refine((v) => v.length >= 10 && v.length <= 12, 'Phone must be 10–12 digits'),
    companyPhone: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val.trim() === '') return true;
          const clean = val.replace(/\D/g, '');
          return clean.length >= 10 && clean.length <= 12;
        },
        'Company Phone must be 10–12 digits'
      ),
    dob: z
      .string()
      .min(1, 'Date of Birth is mandatory')
      .refine((val) => new Date(val) <= new Date(), 'Date of Birth cannot be in the future'),
    gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say'], {
      message: 'Gender is mandatory',
    }),
    residentialAddress: z.string().min(1, 'Present / Residential Address is mandatory').trim(),
    sameAsPresentAddress: z.boolean().optional().default(false),
    permanentAddress: z.string().optional(),

    // Emergency Contact
    emergencyName: z.string().min(1, 'Emergency Contact Name is mandatory').trim(),
    emergencyPhone: z
      .string()
      .transform((v) => v.replace(/\D/g, ''))
      .refine((v) => v.length >= 10 && v.length <= 12, 'Emergency Phone must be 10–12 digits'),
    emergencyRelationship: z.string().min(1, 'Emergency Relationship is mandatory'),

    // Statutory
    pan: z
      .string()
      .transform((v) => v.toUpperCase().replace(/\s/g, ''))
      .refine((v) => panRegex.test(v), 'Invalid PAN format (e.g. ABCDE1234F)'),
    aadhaar: z
      .string()
      .transform((v) => v.replace(/\D/g, ''))
      .refine((v) => aadhaarRegex.test(v), 'Aadhaar must be 12 digits starting with 2–9'),
    uan: z.string().optional(),
    esic: z.string().optional(),

    // Bank
    bankName: z.string().min(1, 'Bank Name is mandatory').trim(),
    bankAccountHolder: z.string().min(1, 'Account Holder Name is mandatory').trim(),
    bankAccount: z.string().min(1, 'Bank Account Number is mandatory').trim(),
    confirmBankAccount: z.string().min(1, 'Please confirm the Bank Account Number').trim(),
    ifscCode: z
      .string()
      .transform((v) => v.toUpperCase().replace(/\s/g, ''))
      .refine((v) => ifscRegex.test(v), 'Invalid IFSC (e.g. SBIN0001234)'),
    branchName: z.string().optional(),
    accountType: z.enum(['Savings', 'Current', 'Salary'], {
      message: 'Account Type is mandatory',
    }),

    // Media (Base64)
    photograph: z.string().optional(),
    signature: z.string().optional(),

    // Documents — mandatory attachment metadata objects
    aadhaarCardDoc: z.any().optional(),
    panCardDoc: z.any().optional(),
    bankProofDoc: z.any().optional(),
    additionalDocuments: z.array(z.any()).optional().default([]),
  })
  // ── Cross-field refinements ──
  .refine((d) => d.confirmBankAccount === d.bankAccount, {
    message: 'Bank account numbers must match',
    path: ['confirmBankAccount'],
  })
  .refine(
    (d) => !d.probationEndDate || new Date(d.probationEndDate) >= new Date(d.joiningDate),
    {
      message: 'Probation End Date must not be before Date of Joining',
      path: ['probationEndDate'],
    }
  )
  .refine(
    (d) => {
      const uan = d.uan?.replace(/\D/g, '') || '';
      return uan === '' || uan.length === 12;
    },
    { message: 'UAN must be exactly 12 digits', path: ['uan'] }
  )
  .refine(
    (d) => {
      const esic = d.esic?.replace(/\D/g, '') || '';
      return esic === '' || esic.length === 17;
    },
    { message: 'ESIC must be exactly 17 digits', path: ['esic'] }
  )
  .refine(
    (d) => {
      if (d.department === 'CUSTOM') {
        return !!d.customDepartment && d.customDepartment.trim().length >= 2;
      }
      return true;
    },
    { message: 'Please write the custom department name', path: ['customDepartment'] }
  )
  .refine(
    (d) => {
      if (d.workLocation === 'CUSTOM') {
        return !!d.customWorkLocation && d.customWorkLocation.trim().length >= 2;
      }
      return true;
    },
    { message: 'Please write the custom work location name', path: ['customWorkLocation'] }
  )
  .refine((d) => !!d.aadhaarCardDoc?.id, {
    message: 'Aadhaar Card upload is mandatory',
    path: ['aadhaarCardDoc'],
  })
  .refine((d) => !!d.panCardDoc?.id, {
    message: 'PAN Card upload is mandatory',
    path: ['panCardDoc'],
  })
  .refine((d) => !!d.bankProofDoc?.id, {
    message: 'Bank Passbook / Cancelled Cheque upload is mandatory',
    path: ['bankProofDoc'],
  });

export type EmployeeRegistrationValues = z.infer<typeof employeeRegistrationSchema>;

// ────────────────────────────────────────────────────────────────
// 2. PERMISSIVE DRAFT SCHEMA (incomplete is OK)
// ────────────────────────────────────────────────────────────────
export const employeeDraftSchema = z.object({
  employeeCode: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  customDepartment: z.string().optional(),
  managerId: z.string().optional(),
  workLocation: z.string().optional(),
  customWorkLocation: z.string().optional(),
  employmentType: z.string().optional(),
  joiningDate: z.string().optional(),
  probationEndDate: z.string().optional().nullable(),
  email: z.string().optional(),
  personalEmail: z.string().optional(),
  phone: z.string().optional(),
  companyPhone: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  residentialAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  sameAsPresentAddress: z.boolean().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  pan: z.string().optional(),
  aadhaar: z.string().optional(),
  uan: z.string().optional(),
  esic: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  bankAccount: z.string().optional(),
  confirmBankAccount: z.string().optional(),
  ifscCode: z.string().optional(),
  branchName: z.string().optional(),
  accountType: z.string().optional(),
  photograph: z.string().optional(),
  signature: z.string().optional(),
  aadhaarCardDoc: z.any().optional(),
  panCardDoc: z.any().optional(),
  bankProofDoc: z.any().optional(),
  additionalDocuments: z.array(z.any()).optional().default([]),
});

export type EmployeeDraftValues = z.infer<typeof employeeDraftSchema>;

// ────────────────────────────────────────────────────────────────
// 3. EDIT EMPLOYEE SCHEMA (Allows keeping existing masked sensitive docs/fields)
// ────────────────────────────────────────────────────────────────
export const employeeEditSchema = z.object({
  employeeCode: z.string().optional(),
  firstName: z.string().optional().default(''),
  lastName: z.string().optional().default(''),
  name: z.string().optional().default(''),

  // Employment
  designation: z.string().optional().default(''),
  department: z.string().optional().default(''),
  customDepartment: z.string().optional(),
  managerId: z.string().optional().nullable(),
  workLocation: z.string().optional().default(''),
  customWorkLocation: z.string().optional(),
  employmentType: z.string().optional().default('Full-time'),
  joiningDate: z.string().optional().default(''),
  probationEndDate: z.string().optional().nullable(),
  salary: z.preprocess((val) => val === '' || val === undefined || val === null ? 0 : Number(val), z.number().min(0, 'Salary must be 0 or greater').optional().default(0)),
  baseSalary: z.preprocess((val) => val === '' || val === undefined || val === null ? 0 : Number(val), z.number().min(0, 'Salary must be 0 or greater').optional().default(0)),

  // Contact
  email: z.string().optional().default(''),
  personalEmail: z.string().optional().nullable(),
  phone: z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, '') : ''))
    .refine((v) => !v || (v.length >= 10 && v.length <= 12), 'Phone must be 10–12 digits'),
  companyPhone: z
    .string()
    .optional()
    .nullable(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().default('Male'),
  residentialAddress: z.string().optional().default(''),
  sameAsPresentAddress: z.boolean().optional().default(false),
  permanentAddress: z.string().optional().default(''),

  // Emergency Contact
  emergencyName: z.string().optional().default(''),
  emergencyPhone: z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, '') : ''))
    .refine((v) => !v || (v.length >= 10 && v.length <= 12), 'Emergency Phone must be 10–12 digits'),
  emergencyRelationship: z.string().optional().default(''),

  // Statutory
  pan: z
    .string()
    .optional()
    .transform((v) => (v ? v.toUpperCase().replace(/\s/g, '') : ''))
    .refine((v) => !v || panRegex.test(v), 'Invalid PAN format (e.g. ABCDE1234F)'),
  aadhaar: z.string().optional(),
  uan: z.string().optional(),
  esic: z.string().optional(),

  // Bank
  bankName: z.string().optional().default(''),
  bankAccountHolder: z.string().optional().default(''),
  bankAccount: z.string().optional(),
  confirmBankAccount: z.string().optional(),
  ifscCode: z
    .string()
    .optional()
    .transform((v) => (v ? v.toUpperCase().replace(/\s/g, '') : ''))
    .refine((v) => !v || ifscRegex.test(v), 'Invalid IFSC (e.g. SBIN0001234)'),
  branchName: z.string().optional(),
  accountType: z.string().optional().default('Savings'),

  // Media (Base64)
  photograph: z.string().optional(),
  signature: z.string().optional(),

  // Documents
  aadhaarCardDoc: z.any().optional(),
  panCardDoc: z.any().optional(),
  bankProofDoc: z.any().optional(),
  additionalDocuments: z.array(z.any()).optional().default([]),
});

export type EmployeeEditValues = z.infer<typeof employeeEditSchema>;
