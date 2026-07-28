import { Employee } from './employee.types';
import { maskAadhaar, maskPan, maskBankAccount, maskUan, maskEsic } from './employee.utils';

/**
 * Normalizes and masks a raw employee object
 */
export function maskEmployeeRecord(emp: Employee): Employee {
  return {
    ...emp,
    aadhaar: maskAadhaar(emp.aadhaar),
    pan: maskPan(emp.pan),
    bankAccount: maskBankAccount(emp.bankAccount),
    confirmBankAccountNumber: maskBankAccount(emp.bankAccount), // clear or mask
    uan: emp.uan ? maskUan(emp.uan) : undefined,
    esic: emp.esic ? maskEsic(emp.esic) : undefined,
  };
}

/**
 * Selector for directory listings: Returns only active (non-archived) employees
 * with all statutory and banking information masked.
 */
export function selectEmployeeListRows(employees: Employee[]): Employee[] {
  return employees
    .filter(emp => emp.recordStatus !== 'ARCHIVED')
    .map(maskEmployeeRecord);
}

/**
 * Selector for archived directory listings: Returns archived employees
 * with sensitive data masked.
 */
export function selectArchivedEmployeeListRows(employees: Employee[]): Employee[] {
  return employees
    .filter(emp => emp.recordStatus === 'ARCHIVED')
    .map(maskEmployeeRecord);
}

/**
 * Selector for public/general employee profile view: returns the employee
 * details with confidential data masked.
 */
export function selectEmployeeProfile(employees: Employee[], id: string): Employee | null {
  const emp = employees.find(e => e.id === id);
  if (!emp) return null;
  return maskEmployeeRecord(emp);
}

/**
 * Selector for authorized administrative access (e.g., HR verification or salary structure config):
 * returns the full, raw (unmasked) employee profile details.
 */
export function selectEmployeeSensitiveProfile(employees: Employee[], id: string): Employee | null {
  const emp = employees.find(e => e.id === id);
  if (!emp) return null;
  return emp;
}
