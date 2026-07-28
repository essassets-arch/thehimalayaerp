export interface DocumentMetadata {
  id: string;
  employeeId?: string;
  draftId?: string;
  category: 'AADHAAR' | 'PAN' | 'BANK_PROOF' | 'PHOTO' | 'SIGNATURE' | 'OTHER';
  documentType: string;
  title: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fileName: string;
  mimeType: string;
  size: number;
  storageKey: string; // Key under which the Blob is stored in IndexedDB
  uploadedAt: string;
}

export interface EmployeeAuditEntry {
  id: string;
  action: 'EMPLOYEE_REGISTERED' | 'EMPLOYEE_UPDATED' | 'EMPLOYEE_ARCHIVED' | 'EMPLOYEE_RESTORED';
  employeeId: string;
  performedBy: string;
  performedAt: string;
  metadata: {
    source: string;
    remarks?: string;
  };
}

export interface Employee {
  id: string; // Canonical identifier (e.g., 'EMP-001')
  employeeCode: string; // User entered or generated code (e.g., '001')
  firstName: string;
  lastName: string;
  name: string; // Full name (firstName + lastName, editable)
  
  // Employment Information
  designation: string; // Job Title
  role: string; // Designation Role
  department: string; // Department code (e.g., 'Sales', 'HR')
  managerId?: string; // Reporting manager EMP ID
  managerName?: string; // Reporting manager Full Name
  workLocation: string; // 'Head Office' | 'Plant' | 'Warehouse' | 'Field' | 'Remote' | 'Other'
  employmentType: string; // 'Full-time' | 'Part-time' | 'Contract' | 'Intern' | 'Temporary' | 'Consultant'
  joiningDate: string; // Date of Joining
  probationEndDate?: string;
  
  // Contact Information
  email: string; // Work email
  personalEmail?: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  residentialAddress: string;
  
  // Emergency Contact
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  
  // Statutory Information
  pan: string;
  aadhaar: string;
  uan?: string;
  esic?: string;
  
  // Bank Information
  bankName: string;
  bankAccountHolder: string;
  bankAccount: string;
  ifscCode: string;
  branchName?: string;
  accountType: 'Savings' | 'Current' | 'Salary';
  
  // Integrations & Status
  status: 'ACTIVE' | 'INACTIVE'; // Roster status compatibility
  recordStatus: 'ACTIVE' | 'ARCHIVED';
  employmentStatus: 'ACTIVE' | 'ON_PROBATION' | 'NOTICE_PERIOD' | 'SUSPENDED' | 'TERMINATED';
  salaryStructureStatus: 'PENDING' | 'CONFIGURED';
  payrollEligibility: 'NOT_CONFIGURED' | 'ELIGIBLE';
  
  // Payroll compatibility fields (can be edited/completed under salary-structure)
  baseSalary?: number;
  salary?: number; // compat
  hra?: number;
  conveyance?: number;
  medicalAllowance?: number;
  allowance?: number;
  pfApplicable?: boolean;
  esiApplicable?: boolean;
  professionalTax?: number;
  tds?: number;
  overtimeRate?: number;
  loanDeduction?: number;
  advanceRecovery?: number;
  salaryEffectiveDate?: string;

  // Documents and Media Metadata list
  documents: DocumentMetadata[];
  photograph?: string; // Base64 data URL
  signature?: string; // Base64 data URL

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  archivedAt?: string;
  archivedBy?: string;
  auditHistory: EmployeeAuditEntry[];
}

export interface EmployeeDraft {
  version: number;
  draftId: string;
  values: any; // React Hook Form state partial values
  additionalDocuments: DocumentMetadata[];
  lastSavedAt: string;
}
