import { employeeRepository } from './employee.repository';
import { employeeRegistrationSchema } from './employee.schema';
import { Employee, DocumentMetadata } from './employee.types';
import { validateManagerRelationship } from './employee.utils';
import { saveFile } from './employee.db';

export const employeeService = {
  /**
   * Validates the uniqueness of critical employee fields.
   * Throws an error with descriptive text if a duplicate is found.
   */
  validateUniqueness(
    fields: { employeeCode?: string; email?: string; pan?: string; aadhaar?: string },
    excludeId?: string
  ): void {
    const employees = employeeRepository.getAll();

    if (fields.employeeCode) {
      const code = fields.employeeCode.trim().toLowerCase();
      const duplicate = employees.find(
        emp => emp.id !== excludeId && emp.recordStatus !== 'ARCHIVED' && emp.employeeCode?.trim().toLowerCase() === code
      );
      if (duplicate) {
        throw new Error(`Employee ID Code '${fields.employeeCode}' is already assigned to another active employee.`);
      }
    }

    if (fields.email) {
      const email = fields.email.trim().toLowerCase();
      const duplicate = employees.find(
        emp => emp.id !== excludeId && emp.recordStatus !== 'ARCHIVED' && emp.email?.trim().toLowerCase() === email
      );
      if (duplicate) {
        throw new Error(`Work Email '${fields.email}' is already registered to another active employee.`);
      }
    }

    if (fields.pan) {
      const pan = fields.pan.toUpperCase().replace(/\s/g, '');
      const duplicate = employees.find(
        emp => emp.id !== excludeId && emp.recordStatus !== 'ARCHIVED' && emp.pan?.toUpperCase().replace(/\s/g, '') === pan
      );
      if (duplicate) {
        throw new Error(`PAN Number '${fields.pan}' is already registered in the system.`);
      }
    }

    if (fields.aadhaar) {
      const aadhaar = fields.aadhaar.replace(/\D/g, '');
      const duplicate = employees.find(
        emp => emp.id !== excludeId && emp.recordStatus !== 'ARCHIVED' && emp.aadhaar?.replace(/\D/g, '') === aadhaar
      );
      if (duplicate) {
        throw new Error(`Aadhaar Number '${fields.aadhaar}' is already registered in the system.`);
      }
    }
  },

  /**
   * Validates manager relationship to prevent self-reporting or circular reporting loops.
   */
  validateManagerHierarchy(employeeId: string | undefined, managerId: string | undefined): void {
    const employees = employeeRepository.getAll();
    if (!managerId) return;

    if (employeeId && employeeId === managerId) {
      throw new Error("An employee cannot be assigned as their own reporting manager.");
    }

    // Circular loop check
    let currentId = managerId;
    const visited = new Set<string>();

    while (currentId) {
      if (employeeId && currentId === employeeId) {
        throw new Error("Circular reporting relationship detected: the selected manager reports to this employee.");
      }

      if (visited.has(currentId)) {
        break;
      }
      visited.add(currentId);

      const manager = employees.find(emp => emp.id === currentId);
      currentId = manager?.managerId || '';
    }
  },

  /**
   * Generates the next sequential immutable Employee ID (e.g. EMP-011)
   */
  generateNextId(): string {
    const employees = employeeRepository.getAll();
    let maxSuffix = 0;
    
    employees.forEach(emp => {
      const match = emp.id?.match(/EMP-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSuffix) maxSuffix = num;
      }
    });

    const nextSuffix = maxSuffix + 1;
    return `EMP-${String(nextSuffix).padStart(3, '0')}`;
  },

  /**
   * Performs transactional employee registration.
   * Normalizes fields, validates schema, checks uniqueness & hierarchy,
   * commits draft documents, logs audit event, and registers the employee.
   */
  async register(
    formValues: any,
    uploadedBlobs: Record<string, Blob>, // maps document metadata ID to Blob file binary
    actorName: string
  ): Promise<Employee> {
    // 1. Normalization
    const normalizedValues = {
      ...formValues,
      email: formValues.email.toLowerCase().trim(),
      personalEmail: formValues.personalEmail ? formValues.personalEmail.toLowerCase().trim() : undefined,
      pan: formValues.pan.toUpperCase().replace(/\s/g, ''),
      aadhaar: formValues.aadhaar.replace(/\D/g, ''),
      ifscCode: formValues.ifscCode.toUpperCase().replace(/\s/g, ''),
      phone: formValues.phone.replace(/\D/g, ''),
      emergencyPhone: formValues.emergencyPhone.replace(/\D/g, ''),
    };

    // 2. Validate Registration Schema
    employeeRegistrationSchema.parse(normalizedValues);

    // 3. Uniqueness Check
    this.validateUniqueness({
      employeeCode: normalizedValues.employeeCode,
      email: normalizedValues.email,
      pan: normalizedValues.pan,
      aadhaar: normalizedValues.aadhaar
    });

    // 4. Generate Immutable ID
    const newId = this.generateNextId();

    // 5. Manager Lookup
    let managerName = '';
    if (normalizedValues.managerId) {
      const mgr = employeeRepository.getById(normalizedValues.managerId);
      if (!mgr) {
        throw new Error(`Selected reporting manager with ID ${normalizedValues.managerId} does not exist.`);
      }
      if (mgr.status !== 'ACTIVE' || mgr.recordStatus === 'ARCHIVED') {
        throw new Error(`Selected reporting manager ${mgr.name} is not active or has been terminated.`);
      }
      managerName = mgr.name;
      this.validateManagerHierarchy(newId, normalizedValues.managerId);
    }

    // 6. Process uploaded documents: move from temporary keys to permanent keys
    const documentsList: DocumentMetadata[] = [];
    const documentStatus = 'COMPLETE'; // Assume success
    
    try {
      const docCategories = [
        { field: 'aadhaarCardDoc', category: 'AADHAAR' as const },
        { field: 'panCardDoc', category: 'PAN' as const },
        { field: 'bankProofDoc', category: 'BANK_PROOF' as const }
      ];

      for (const { field, category } of docCategories) {
        const meta = normalizedValues[field];
        if (meta) {
          const blob = uploadedBlobs[meta.id];
          const permanentKey = `emp_${newId}_${category.toLowerCase()}`;
          if (blob) {
            await saveFile(permanentKey, blob);
          }
          documentsList.push({
            ...meta,
            employeeId: newId,
            storageKey: permanentKey,
            uploadedAt: new Date().toISOString()
          });
        }
      }

      // Add additional documents
      if (Array.isArray(normalizedValues.additionalDocuments)) {
        for (let i = 0; i < normalizedValues.additionalDocuments.length; i++) {
          const doc = normalizedValues.additionalDocuments[i];
          if (doc) {
            const blob = uploadedBlobs[doc.id];
            const permanentKey = `emp_${newId}_other_${i}_${doc.fileName}`;
            if (blob) {
              await saveFile(permanentKey, blob);
            }
            documentsList.push({
              ...doc,
              employeeId: newId,
              storageKey: permanentKey,
              uploadedAt: new Date().toISOString()
            });
          }
        }
      }
    } catch (dbError) {
      console.error('Failed to write documents to IndexedDB during transaction:', dbError);
      // Let's roll back and fail the transaction completely
      throw new Error(`Failed to save documents: ${dbError instanceof Error ? dbError.message : String(dbError)}. Employee registration aborted.`);
    }

    // 7. Assemble final employee record
    const newEmployee: Employee = {
      id: newId,
      employeeCode: normalizedValues.employeeCode.trim(),
      firstName: normalizedValues.firstName.trim(),
      lastName: normalizedValues.lastName.trim(),
      name: normalizedValues.name.trim(),
      
      designation: normalizedValues.designation.trim(),
      role: normalizedValues.designation.trim(), // maps to both designation & role
      department: normalizedValues.department,
      managerId: normalizedValues.managerId || undefined,
      managerName: managerName || undefined,
      workLocation: normalizedValues.workLocation,
      employmentType: normalizedValues.employmentType,
      joiningDate: normalizedValues.joiningDate,
      probationEndDate: normalizedValues.probationEndDate || undefined,
      
      email: normalizedValues.email,
      personalEmail: normalizedValues.personalEmail || undefined,
      phone: normalizedValues.phone,
      dob: normalizedValues.dob,
      gender: normalizedValues.gender,
      residentialAddress: normalizedValues.residentialAddress.trim(),
      
      emergencyName: normalizedValues.emergencyName.trim(),
      emergencyPhone: normalizedValues.emergencyPhone,
      emergencyRelationship: normalizedValues.emergencyRelationship.trim(),
      
      pan: normalizedValues.pan,
      aadhaar: normalizedValues.aadhaar,
      uan: normalizedValues.uan || undefined,
      esic: normalizedValues.esic || undefined,
      
      bankName: normalizedValues.bankName.trim(),
      bankAccountHolder: normalizedValues.bankAccountHolder.trim(),
      bankAccount: normalizedValues.bankAccount,
      ifscCode: normalizedValues.ifscCode,
      branchName: normalizedValues.branchName?.trim() || undefined,
      accountType: normalizedValues.accountType,
      
      status: 'ACTIVE',
      recordStatus: 'ACTIVE',
      employmentStatus: normalizedValues.probationEndDate ? 'ON_PROBATION' : 'ACTIVE',
      salaryStructureStatus: 'PENDING',
      payrollEligibility: 'NOT_CONFIGURED',
      
      documents: documentsList,
      photograph: normalizedValues.photograph || undefined,
      signature: normalizedValues.signature || undefined,
      
      createdAt: new Date().toISOString(),
      createdBy: actorName,
      updatedAt: new Date().toISOString(),
      auditHistory: []
    };

    // 8. Add Audit History log
    const auditEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'EMPLOYEE_REGISTERED' as const,
      employeeId: newId,
      performedBy: actorName,
      performedAt: new Date().toISOString(),
      metadata: {
        source: 'HR_REGISTER_STAFF'
      }
    };
    newEmployee.auditHistory.push(auditEntry);

    // 9. Save to repository
    employeeRepository.create(newEmployee);

    return newEmployee;
  }
};
