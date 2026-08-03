/* eslint-disable @typescript-eslint/no-explicit-any */
import { useERPStore } from './erpStore';

export const PAYROLL_STATUS = {
  PAYROLL_DRAFT: 'PAYROLL_DRAFT',
  PENDING_SUPER_ADMIN_APPROVAL: 'PENDING_SUPER_ADMIN_APPROVAL',
  SUPER_ADMIN_REJECTED: 'SUPER_ADMIN_REJECTED',
  SUPER_ADMIN_APPROVED: 'SUPER_ADMIN_APPROVED',
  FINANCE_VERIFIED: 'FINANCE_VERIFIED',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  SALARY_PAID: 'SALARY_PAID',
  PAYSLIP_GENERATED: 'PAYSLIP_GENERATED',
  PAYROLL_CLOSED: 'PAYROLL_CLOSED',
} as const;

export const PAYMENT_STATUS = {
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  PAYMENT_PAID: 'PAYMENT_PAID',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_ON_HOLD: 'PAYMENT_ON_HOLD',
} as const;

const legacyStatus: Record<string, string> = {
  PENDING_PLANT_HEAD_APPROVAL: PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL,
  PLANT_HEAD_REJECTED: PAYROLL_STATUS.SUPER_ADMIN_REJECTED,
  PLANT_HEAD_APPROVED: PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL,
  PENDING_FINANCE_APPROVAL: PAYROLL_STATUS.SUPER_ADMIN_APPROVED,
  FINANCE_APPROVED: PAYROLL_STATUS.SUPER_ADMIN_APPROVED,
  FINAL_APPROVED: PAYROLL_STATUS.SUPER_ADMIN_APPROVED,
};

const now = () => new Date().toISOString();
const audit = (action: string, actor: string, remarks = '', fromStatus?: string, toStatus?: string) => ({
  action, actor, remarks, fromStatus, toStatus, at: now(),
});

const normalizeRun = (run: any) => ({
  ...run,
  salaryMonth: run.salaryMonth || run.month || '',
  month: run.salaryMonth || run.month || '',
  status: legacyStatus[run.status] || run.status || PAYROLL_STATUS.PAYROLL_DRAFT,
  employees: Array.isArray(run.employees) ? run.employees.map((line: any) => ({
    ...line,
    paymentStatus: line.paymentStatus === 'PENDING'
      ? PAYMENT_STATUS.PAYMENT_PENDING
      : (line.paymentStatus || PAYMENT_STATUS.PAYMENT_PENDING),
  })) : [],
  paymentBatches: Array.isArray(run.paymentBatches) ? run.paymentBatches : [],
  revisionHistory: Array.isArray(run.revisionHistory)
    ? run.revisionHistory
    : (Array.isArray(run.history) ? run.history : []),
});

export const selectPayrollRuns = (state: any) =>
  (Array.isArray(state?.payrollRuns) ? state.payrollRuns : [])
    .filter((run: any) => run && typeof run === 'object')
    .map(normalizeRun);

const commit = (updater: (state: any) => any) => {
  const store: any = useERPStore.getState();
  const nextState = updater(store.state || {});
  store.setState(nextState);
};

const totals = (employees: any[]) => employees.reduce((result, line) => ({
  employeeCount: result.employeeCount + 1,
  grossSalary: result.grossSalary + Number(line.grossSalary || 0),
  totalDeductions: result.totalDeductions + Number(line.totalDeductions || 0),
  netPayable: result.netPayable + Number(line.netSalary || 0),
}), { employeeCount: 0, grossSalary: 0, totalDeductions: 0, netPayable: 0 });

const validateLine = (line: any) => {
  const values = ['grossSalary', 'totalDeductions', 'netSalary'];
  if (values.some((field) => !Number.isFinite(Number(line[field])))) throw new Error(`${line.employeeName}: salary contains an invalid number.`);
  if (Number(line.grossSalary) < 0 || Number(line.totalDeductions) < 0) throw new Error(`${line.employeeName}: salary values cannot be negative.`);
  if (Number(line.totalDeductions) > Number(line.grossSalary)) throw new Error(`${line.employeeName}: deductions cannot exceed gross salary.`);
  if (Math.abs(Number(line.netSalary) - (Number(line.grossSalary) - Number(line.totalDeductions))) > 0.01) throw new Error(`${line.employeeName}: net salary must equal gross salary minus deductions.`);
  if (Number(line.overtimeHours || 0) < 0) throw new Error(`${line.employeeName}: overtime cannot be negative.`);
};

const calculateLine = (employee: any, salaryMonth: string) => {
  const basic = Number(employee.baseSalary || employee.basic || employee.salary || 0);
  const hra = Number(employee.hra || 0);
  const conveyance = Number(employee.conveyance || 0);
  const medicalAllowance = Number(employee.medicalAllowance || 0);
  const otherAllowances = Number(employee.allowance || employee.otherAllowances || 0);
  const grossSalary = basic + hra + conveyance + medicalAllowance + otherAllowances;
  const pf = employee.pfApplicable ? basic * 0.12 : Number(employee.pf || 0);
  const esi = employee.esiApplicable ? grossSalary * 0.0075 : Number(employee.esi || 0);
  const professionalTax = Number(employee.professionalTax || 0);
  const tds = Number(employee.tds || 0);
  const loanDeduction = Number(employee.loanDeduction || 0);
  const advanceRecovery = Number(employee.advanceRecovery || 0);
  const totalDeductions = pf + esi + professionalTax + tds + loanDeduction + advanceRecovery;
  const line = {
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    designation: employee.designation || '',
    employeeType: employee.employeeType || 'Permanent',
    branch: employee.branch || employee.plant || 'Main Plant',
    salaryMonth,
    attendance: { presentDays: 26, paidLeave: 0, unpaidLeave: 0, weeklyOffs: 4, holidays: 0, halfDays: 0, lateDeductions: 0 },
    earnings: { basic, hra, conveyance, medicalAllowance, otherAllowances, overtimeAmount: 0, incentives: 0, bonus: 0, reimbursements: 0 },
    deductions: { pf, esi, professionalTax, tds, loanDeduction, advanceRecovery, unpaidLeaveDeduction: 0, otherDeductions: 0 },
    overtimeHours: 0,
    grossSalary,
    totalDeductions,
    netSalary: grossSalary - totalDeductions,
    bankAccount: employee.bankAccount || '',
    ifscCode: employee.ifscCode || employee.ifsc || '',
    bankName: employee.bankName || '',
    bankDetailsValid: Boolean(employee.bankAccount && (employee.ifscCode || employee.ifsc)),
    paymentStatus: PAYMENT_STATUS.PAYMENT_PENDING,
    payrollEmployeeStatus: 'APPROVED',
    held: Boolean(employee.salaryHold),
    payslipStatus: '',
  };
  validateLine(line);
  return line;
};

const findRun = (state: any, id: string) => {
  const run = selectPayrollRuns(state).find((entry: any) => entry.id === id);
  if (!run) throw new Error(`Payroll ${id} was not found.`);
  return run;
};

const updateRun = (id: string, updater: (run: any) => any) => commit((state) => ({
  ...state,
  payrollRuns: selectPayrollRuns(state).map((run: any) => run.id === id ? updater(run) : run),
}));

const transition = (id: string, allowed: string[], status: string, actor: string, remarks = '', extras: any = {}) =>
  updateRun(id, (run) => {
    if (!allowed.includes(run.status)) {
      if (run.status === status) throw new Error(`This payroll has already been ${status.toLowerCase().replaceAll('_', ' ')}.`);
      throw new Error(`Cannot move payroll from ${run.status} to ${status}.`);
    }
    return {
      ...run, ...extras, status, updatedAt: now(),
      revisionHistory: [...run.revisionHistory, audit(status, actor, remarks, run.status, status)],
    };
  });

export const createPayrollDraft = (salaryMonth: string, filters: any = {}, actor = 'HR') => {
  if (!salaryMonth) throw new Error('Select a salary month.');
  const store: any = useERPStore.getState();
  const state = store.state || {};
  const branchId = filters.branchId || filters.branch || 'ALL';
  const duplicate = selectPayrollRuns(state).find((run: any) =>
    run.salaryMonth === salaryMonth && (run.branchId || run.branch || 'ALL') === branchId && run.status !== 'CANCELLED');
  if (duplicate) throw new Error('Payroll already exists for this month and branch.');
  if (filters.attendanceFinalized === false) throw new Error('Attendance must be finalized before payroll can be prepared.');
  const employeeSource = Array.isArray(state.employees) ? state.employees : [];
  const employees = employeeSource.filter((employee: any) =>
    employee.status === 'ACTIVE' &&
    employee.salaryStructureStatus === 'CONFIGURED' &&
    !employee.salaryHold &&
    (!filters.department || filters.department === 'All' || employee.department === filters.department) &&
    (!filters.employeeType || filters.employeeType === 'All' || employee.employeeType === filters.employeeType) &&
    (!filters.branch || filters.branch === 'All' || employee.branch === filters.branch || employee.plant === filters.branch)
  );
  if (!employees.length) throw new Error('No eligible active employees were found.');
  const lines = employees.map((employee: any) => calculateLine(employee, salaryMonth));
  const id = filters.payrollId || `PAY-${salaryMonth.replace('-', '-')}-${branchId === 'ALL' ? 'ALL' : branchId}`;
  const run = {
    id, salaryMonth, month: salaryMonth, branchId, branch: filters.branch || 'All',
    department: filters.department || 'All', employeeType: filters.employeeType || 'All',
    attendanceStatus: 'ATTENDANCE_FINALIZED', status: PAYROLL_STATUS.PAYROLL_DRAFT,
    employees: lines, totals: totals(lines), paymentBatches: [], createdAt: now(), updatedAt: now(),
    revisionHistory: [audit('PAYROLL_CREATED', actor, '', undefined, PAYROLL_STATUS.PAYROLL_DRAFT)],
  };
  commit((current) => ({ ...current, payrollRuns: [run, ...selectPayrollRuns(current)] }));
  return id;
};

export const preparePayrollRun = createPayrollDraft;

export const updatePayrollEmployee = (id: string, employeeId: string, changes: any, actor = 'HR') =>
  updateRun(id, (run) => {
    if (![PAYROLL_STATUS.PAYROLL_DRAFT, PAYROLL_STATUS.SUPER_ADMIN_REJECTED].includes(run.status)) {
      throw new Error('Payroll is pending Super Admin approval and cannot be edited.');
    }
    const employees = run.employees.map((line: any) => {
      if (line.employeeId !== employeeId) return line;
      const next = { ...line, ...changes };
      if (changes.earnings || changes.deductions) {
        next.earnings = { ...line.earnings, ...changes.earnings };
        next.deductions = { ...line.deductions, ...changes.deductions };
      }
      next.grossSalary = Object.values(next.earnings || {}).reduce((sum: number, value: any) => sum + Number(value || 0), 0);
      next.totalDeductions = Object.values(next.deductions || {}).reduce((sum: number, value: any) => sum + Number(value || 0), 0);
      next.netSalary = next.grossSalary - next.totalDeductions;
      validateLine(next);
      return next;
    });
    return { ...run, status: PAYROLL_STATUS.PAYROLL_DRAFT, employees, totals: totals(employees), updatedAt: now(),
      revisionHistory: [...run.revisionHistory, audit('EMPLOYEE_SALARY_UPDATED', actor, employeeId, run.status, PAYROLL_STATUS.PAYROLL_DRAFT)] };
  });

export const submitPayrollToSuperAdmin = (id: string, actor = 'HR') => {
  const state: any = useERPStore.getState();
  const run = findRun(state.state || {}, id);
  run.employees.forEach(validateLine);
  transition(id, [PAYROLL_STATUS.PAYROLL_DRAFT], PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL, actor, '', { hrSubmission: { actor, at: now() } });
};

export const rejectPayrollBySuperAdmin = (id: string, remarks: string, actor = 'Super Admin') => {
  if (!remarks.trim()) throw new Error('A rejection reason is required.');
  transition(id, [PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL], PAYROLL_STATUS.SUPER_ADMIN_REJECTED, actor, remarks, {
    superAdminApproval: { actor, at: now(), decision: 'REJECTED', remarks },
  });
};

export const reopenRejectedPayroll = (id: string, actor = 'HR') =>
  transition(id, [PAYROLL_STATUS.SUPER_ADMIN_REJECTED], PAYROLL_STATUS.PAYROLL_DRAFT, actor, 'Opened for correction');

export const approvePayrollBySuperAdmin = (id: string, remarks = '', actor = 'Super Admin') =>
  transition(id, [PAYROLL_STATUS.PENDING_SUPER_ADMIN_APPROVAL], PAYROLL_STATUS.SUPER_ADMIN_APPROVED, actor, remarks, {
    superAdminApproval: { actor, at: now(), decision: 'APPROVED', remarks },
  });

export const verifyPayrollByFinance = (id: string, actor = 'Finance') =>
  transition(id, [PAYROLL_STATUS.SUPER_ADMIN_APPROVED], PAYROLL_STATUS.FINANCE_VERIFIED, actor, '', {
    financeVerification: { actor, at: now() },
  });

export const createSalaryPaymentBatch = (id: string, payment: any = {}, actor = 'Finance') =>
  updateRun(id, (run) => {
    if (run.status !== PAYROLL_STATUS.FINANCE_VERIFIED) throw new Error('Payment cannot start before Finance verification.');
    const eligible = run.employees.filter((line: any) =>
      line.payrollEmployeeStatus === 'APPROVED' && line.paymentStatus !== PAYMENT_STATUS.PAYMENT_ON_HOLD &&
      line.bankDetailsValid && Number(line.netSalary) > 0);
    if (!eligible.length) throw new Error('No employees are eligible for payment. Validate bank details and salary amounts.');
    const batch = { id: payment.id || (useERPStore.getState() as any).generateEntityId('payrollRun'), payrollId: id, createdAt: now(), ...payment, employeeIds: eligible.map((line: any) => line.employeeId) };
    const employees = run.employees.map((line: any) => eligible.some((item: any) => item.employeeId === line.employeeId)
      ? { ...line, paymentStatus: PAYMENT_STATUS.PAYMENT_PROCESSING } : line);
    return { ...run, status: PAYROLL_STATUS.PAYMENT_PROCESSING, employees,
      paymentBatches: [...run.paymentBatches, batch], updatedAt: now(),
      revisionHistory: [...run.revisionHistory, audit('PAYMENT_BATCH_CREATED', actor, batch.id, run.status, PAYROLL_STATUS.PAYMENT_PROCESSING)] };
  });

const derivePaymentStatus = (employees: any[]) => {
  const eligible = employees.filter((line) => Number(line.netSalary) > 0);
  const paid = eligible.filter((line) => line.paymentStatus === PAYMENT_STATUS.PAYMENT_PAID).length;
  if (eligible.length && paid === eligible.length) return PAYROLL_STATUS.SALARY_PAID;
  if (paid > 0 || eligible.some((line) => [PAYMENT_STATUS.PAYMENT_FAILED, PAYMENT_STATUS.PAYMENT_ON_HOLD].includes(line.paymentStatus))) return PAYROLL_STATUS.PARTIALLY_PAID;
  return PAYROLL_STATUS.PAYMENT_PROCESSING;
};

const updatePayment = (id: string, employeeId: string, paymentStatus: string, details: any, actor: string) =>
  updateRun(id, (run) => {
    if (![PAYROLL_STATUS.PAYMENT_PROCESSING, PAYROLL_STATUS.PARTIALLY_PAID].includes(run.status)) throw new Error('This payroll is not in the payment stage.');
    const employees = run.employees.map((line: any) => line.employeeId === employeeId
      ? { ...line, ...details, paymentStatus } : line);
    return { ...run, employees, status: derivePaymentStatus(employees), updatedAt: now(),
      revisionHistory: [...run.revisionHistory, audit(paymentStatus, actor, employeeId)] };
  });

export const markEmployeePaymentPaid = (id: string, employeeId: string, details: any = {}, actor = 'Finance') =>
  updatePayment(id, employeeId, PAYMENT_STATUS.PAYMENT_PAID, { ...details, paymentDate: details.paymentDate || now() }, actor);
export const markEmployeePaymentFailed = (id: string, employeeId: string, remarks = '', actor = 'Finance') =>
  updatePayment(id, employeeId, PAYMENT_STATUS.PAYMENT_FAILED, { paymentRemarks: remarks }, actor);
export const holdEmployeePayment = (id: string, employeeId: string, remarks = '', actor = 'Finance') =>
  updatePayment(id, employeeId, PAYMENT_STATUS.PAYMENT_ON_HOLD, { paymentRemarks: remarks }, actor);
export const retryEmployeePayment = (id: string, employeeId: string, actor = 'Finance') =>
  updatePayment(id, employeeId, PAYMENT_STATUS.PAYMENT_PROCESSING, {}, actor);

export const generatePayslips = (id: string, actor = 'HR') =>
  updateRun(id, (run) => {
    if (![PAYROLL_STATUS.SALARY_PAID, PAYROLL_STATUS.PAYSLIP_GENERATED].includes(run.status)) throw new Error('Payslips can only be generated after salary payment.');
    const employees = run.employees.map((line: any) => line.paymentStatus === PAYMENT_STATUS.PAYMENT_PAID
      ? { ...line, payslipStatus: PAYROLL_STATUS.PAYSLIP_GENERATED, payslipGeneratedAt: line.payslipGeneratedAt || now() } : line);
    return { ...run, employees, status: PAYROLL_STATUS.PAYSLIP_GENERATED, payslipsGeneratedAt: now(), updatedAt: now(),
      revisionHistory: [...run.revisionHistory, audit('PAYSLIPS_GENERATED', actor)] };
  });

export const closePayroll = (id: string, actor = 'HR') =>
  updateRun(id, (run) => {
    if (run.status === PAYROLL_STATUS.PAYROLL_CLOSED) throw new Error('This payroll is already closed.');
    const unresolved = run.employees.filter((line: any) => line.paymentStatus !== PAYMENT_STATUS.PAYMENT_PAID || line.payslipStatus !== PAYROLL_STATUS.PAYSLIP_GENERATED);
    if (unresolved.length) throw new Error(`Payroll cannot be closed because ${unresolved.length} employee payment is unresolved.`);
    if (run.status !== PAYROLL_STATUS.PAYSLIP_GENERATED) throw new Error('Payslips must be generated before payroll closure.');
    return { ...run, status: PAYROLL_STATUS.PAYROLL_CLOSED, closedAt: now(), updatedAt: now(),
      revisionHistory: [...run.revisionHistory, audit('PAYROLL_CLOSED', actor, '', run.status, PAYROLL_STATUS.PAYROLL_CLOSED)] };
  });

export const generatePayrollPayslips = generatePayslips;
export const closePayrollRun = closePayroll;
