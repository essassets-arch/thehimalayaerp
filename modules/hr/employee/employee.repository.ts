import { useERPStore } from '@/store/erpStore';
import { Employee } from './employee.types';

export const employeeRepository = {
  /**
   * Retrieves all canonical employees from the Zustand store
   */
  getAll(): Employee[] {
    const store = useERPStore.getState();
    return (store.state?.employees || []) as Employee[];
  },

  /**
   * Retrieves a single employee by their immutable ID
   */
  getById(id: string): Employee | null {
    const employees = this.getAll();
    return employees.find(emp => emp.id === id) || null;
  },

  /**
   * Retrieves a single employee by their unique user-defined employeeCode
   */
  getByCode(code: string): Employee | null {
    const employees = this.getAll();
    const normalizedCode = code.trim().toLowerCase();
    return employees.find(emp => emp.employeeCode?.trim().toLowerCase() === normalizedCode) || null;
  },

  /**
   * Creates a new employee in the Zustand store state and triggers localStorage sync
   */
  create(payload: Employee): Employee {
    const store = useERPStore.getState();
    const currentEmployees = store.state?.employees || [];
    
    // Add the new record
    const updatedEmployees = [...currentEmployees, payload];
    
    // Write directly to Zustand store state (persists automatically in erpStore.ts setState)
    store.setState({
      ...store.state,
      employees: updatedEmployees
    });

    return payload;
  },

  /**
   * Updates an existing employee in the Zustand store
   */
  update(id: string, payload: Partial<Employee>): Employee {
    const store = useERPStore.getState();
    const currentEmployees = store.state?.employees || [];
    const idx = currentEmployees.findIndex((emp: any) => emp.id === id);
    
    if (idx === -1) {
      throw new Error(`Employee with ID ${id} not found.`);
    }

    const updated = {
      ...currentEmployees[idx],
      ...payload,
      updatedAt: new Date().toISOString()
    };

    const updatedEmployees = [...currentEmployees];
    updatedEmployees[idx] = updated;

    store.setState({
      ...store.state,
      employees: updatedEmployees
    });

    return updated as Employee;
  },

  /**
   * Archives an employee by setting recordStatus to ARCHIVED and employmentStatus to TERMINATED
   */
  archive(id: string, performedBy: string): Employee {
    const employee = this.getById(id);
    if (!employee) {
      throw new Error(`Employee with ID ${id} not found.`);
    }

    const auditEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'EMPLOYEE_ARCHIVED' as const,
      employeeId: id,
      performedBy,
      performedAt: new Date().toISOString(),
      metadata: {
        source: 'HR_EMPLOYEE_DIRECTORY',
        remarks: 'Employee record archived via user action.'
      }
    };

    return this.update(id, {
      recordStatus: 'ARCHIVED',
      employmentStatus: 'TERMINATED',
      status: 'INACTIVE', // roster compat
      archivedAt: new Date().toISOString(),
      archivedBy: performedBy,
      auditHistory: [...(employee.auditHistory || []), auditEntry]
    });
  },

  /**
   * Restores an archived employee back to ACTIVE status
   */
  restore(id: string, performedBy: string): Employee {
    const employee = this.getById(id);
    if (!employee) {
      throw new Error(`Employee with ID ${id} not found.`);
    }

    const auditEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'EMPLOYEE_RESTORED' as const,
      employeeId: id,
      performedBy,
      performedAt: new Date().toISOString(),
      metadata: {
        source: 'HR_EMPLOYEE_DIRECTORY',
        remarks: 'Employee record restored from archives.'
      }
    };

    return this.update(id, {
      recordStatus: 'ACTIVE',
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE', // roster compat
      archivedAt: undefined,
      archivedBy: undefined,
      auditHistory: [...(employee.auditHistory || []), auditEntry]
    });
  }
};
