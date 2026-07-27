import { create } from 'zustand';
import { assertTransition, createId, calculatePOLineTotals, createProcurementAuditEntry } from '../constants/procurement';
import { salesAndProductionSlice } from './new_sales_store';
import { deepEqual } from '../lib/deepEqual';

const persistToStorage = (state: any) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('erp_procurement_data_version_2', '2');
      if (Array.isArray(state.materialRejections)) window.localStorage.setItem('erp_material_rejections', JSON.stringify(state.materialRejections));
      if (Array.isArray(state.procurementAuditLogs)) window.localStorage.setItem('erp_procurement_audit_logs', JSON.stringify(state.procurementAuditLogs));
      if (Array.isArray(state.procurementDocuments)) window.localStorage.setItem('erp_procurement_documents', JSON.stringify(state.procurementDocuments));
      if (Array.isArray(state.procurementNotifications)) window.localStorage.setItem('erp_procurement_notifications', JSON.stringify(state.procurementNotifications));
      if (Array.isArray(state.materialReplacementSchedules)) window.localStorage.setItem('erp_material_replacement_schedules', JSON.stringify(state.materialReplacementSchedules));
      if (Array.isArray(state.replacementReceipts)) window.localStorage.setItem('erp_replacement_receipts', JSON.stringify(state.replacementReceipts));
      window.localStorage.setItem('erp_procurement_data_version', '1');

      if (Array.isArray(state.orders)) {
        window.localStorage.setItem('erp_orders', JSON.stringify(state.orders));
        window.localStorage.setItem('himalaya_orders', JSON.stringify(state.orders));
      }
      if (Array.isArray(state.workOrders)) {
        window.localStorage.setItem('erp_work_orders', JSON.stringify(state.workOrders));
      }
      if (Array.isArray(state.dispatches)) {
        window.localStorage.setItem('erp_dispatches', JSON.stringify(state.dispatches));
      }
      if (Array.isArray(state.payments)) {
        window.localStorage.setItem('erp_payments', JSON.stringify(state.payments));
      }
      if (Array.isArray(state.notifications)) {
        window.localStorage.setItem('erp_notifications', JSON.stringify(state.notifications));
      }
      if (Array.isArray(state.purchaseIndents)) {
        window.localStorage.setItem('erp_purchase_indents', JSON.stringify(state.purchaseIndents));
      }
      if (Array.isArray(state.purchaseOrders)) {
        window.localStorage.setItem('erp_purchase_orders', JSON.stringify(state.purchaseOrders));
      }
      if (Array.isArray(state.goodsReceipts)) {
        window.localStorage.setItem('erp_goods_receipts', JSON.stringify(state.goodsReceipts));
      }
      if (Array.isArray(state.vendorReturns)) {
        window.localStorage.setItem('erp_vendor_returns', JSON.stringify(state.vendorReturns));
      }
      if (Array.isArray(state.vendorInvoices)) {
        window.localStorage.setItem('erp_vendor_invoices', JSON.stringify(state.vendorInvoices));
      }
      if (Array.isArray(state.vendorPayments)) {
        window.localStorage.setItem('erp_vendor_payments', JSON.stringify(state.vendorPayments));
      }
      if (Array.isArray(state.rawInventory)) {
        window.localStorage.setItem('erp_inventory', JSON.stringify(state.rawInventory));
      }
      if (Array.isArray(state.analysisRequests)) {
        window.localStorage.setItem('erp_analysis_requests_v1', JSON.stringify(state.analysisRequests));
      }
      if (Array.isArray(state.qcInspections)) {
        window.localStorage.setItem('erp_qc_inspections', JSON.stringify(state.qcInspections));
      }
      if (Array.isArray(state.employees)) {
        window.localStorage.setItem('erp_employees', JSON.stringify(state.employees));
      }
      if (Array.isArray(state.payrollBatches)) {
        window.localStorage.setItem('erp_payroll_batches_v2', JSON.stringify(state.payrollBatches));
      }
      if (Array.isArray(state.salaries)) {
        window.localStorage.setItem('erp_salaries_v2', JSON.stringify(state.salaries));
      }
    }
  } catch (e) {
    console.error('Failed to persist ERP state to localStorage', e);
  }
};

const matchOrderId = (item: any, targetId: string) => {
  if (!item || !targetId) return false;
  const tid = String(targetId).trim().toLowerCase();
  const idMatch = String(item.id || '').trim().toLowerCase() === tid;
  const oidMatch = String(item.orderId || '').trim().toLowerCase() === tid;
  const oNumMatch = String(item.orderNumber || '').trim().toLowerCase() === tid;
  const oNoMatch = String(item.orderNo || '').trim().toLowerCase() === tid;
  const wIdMatch = String(item.workOrderId || '').trim().toLowerCase() === tid;
  const wNoMatch = String(item.workOrderNo || '').trim().toLowerCase() === tid;
  const pvMatch = String(item.paymentVerificationId || item.payment_id || '').trim().toLowerCase() === tid;
  const dspMatch = String(item.dispatchId || '').trim().toLowerCase() === tid;

  const woDerived = `wo-${String(item.orderNo || item.id || '').split('-').slice(1).join('-') || item.id}`.toLowerCase();
  return idMatch || oidMatch || oNumMatch || oNoMatch || wIdMatch || wNoMatch || pvMatch || dspMatch || woDerived === tid;
};

const MOCK_EMPLOYEES = [
  { id: 'EMP-001', name: 'John Doe', department: 'Engineering', designation: 'Senior Developer', status: 'ACTIVE', baseSalary: 60000, hra: 12000, allowance: 8000, pfApplicable: true, esiApplicable: false, professionalTax: 200, overtimeRate: 400, joinedAt: '2022-01-15T00:00:00Z' },
  { id: 'EMP-002', name: 'Jane Smith', department: 'HR', designation: 'HR Manager', status: 'ACTIVE', baseSalary: 45000, hra: 10000, allowance: 5000, pfApplicable: true, esiApplicable: true, professionalTax: 200, overtimeRate: 300, joinedAt: '2023-03-10T00:00:00Z' },
  { id: 'EMP-003', name: 'Michael Johnson', department: 'Sales', designation: 'Sales Exec', status: 'ACTIVE', baseSalary: 30000, hra: 8000, allowance: 7000, pfApplicable: true, esiApplicable: true, professionalTax: 200, overtimeRate: 250, joinedAt: '2021-11-20T00:00:00Z' },
  { id: 'EMP-004', name: 'Emily Davis', department: 'Engineering', designation: 'QA Engineer', status: 'ACTIVE', baseSalary: 40000, hra: 10000, allowance: 5000, pfApplicable: true, esiApplicable: false, professionalTax: 200, overtimeRate: 300, joinedAt: '2024-05-01T00:00:00Z' },
  { id: 'EMP-005', name: 'David Brown', department: 'Finance', designation: 'Accountant', status: 'ACTIVE', baseSalary: 35000, hra: 10000, allowance: 5000, pfApplicable: true, esiApplicable: true, professionalTax: 200, overtimeRate: 250, joinedAt: '2020-08-14T00:00:00Z' },
  { id: 'EMP-006', name: 'Sarah Wilson', department: 'Marketing', designation: 'Marketing Lead', status: 'ACTIVE', baseSalary: 50000, hra: 12000, allowance: 8000, pfApplicable: true, esiApplicable: false, professionalTax: 200, overtimeRate: 350, joinedAt: '2022-07-22T00:00:00Z' },
  { id: 'EMP-007', name: 'James Taylor', department: 'Engineering', designation: 'DevOps Engineer', status: 'ACTIVE', baseSalary: 55000, hra: 12000, allowance: 8000, pfApplicable: true, esiApplicable: false, professionalTax: 200, overtimeRate: 350, joinedAt: '2023-01-18T00:00:00Z' },
  { id: 'EMP-008', name: 'Linda Anderson', department: 'Customer Support', designation: 'Support Agent', status: 'ACTIVE', baseSalary: 25000, hra: 5000, allowance: 5000, pfApplicable: true, esiApplicable: true, professionalTax: 200, overtimeRate: 200, joinedAt: '2024-02-10T00:00:00Z' },
  { id: 'EMP-009', name: 'Robert Thomas', department: 'Sales', designation: 'Sales Manager', status: 'ACTIVE', baseSalary: 65000, hra: 12000, allowance: 8000, pfApplicable: true, esiApplicable: false, professionalTax: 200, overtimeRate: 400, joinedAt: '2019-04-05T00:00:00Z' },
  { id: 'EMP-010', name: 'Mary Jackson', department: 'HR', designation: 'Recruiter', status: 'ACTIVE', baseSalary: 30000, hra: 6000, allowance: 4000, pfApplicable: true, esiApplicable: true, professionalTax: 200, overtimeRate: 250, joinedAt: '2023-09-12T00:00:00Z' },
];

const MOCK_BATCHES = [
  { id: 'PAY-2026-07', month: '07', year: '2026', status: 'PROCESSING', createdAt: '2026-07-01T00:00:00Z' }
];

export const calculateSalary = (emp: any, attendance: any, adjustments: any = {}, month: string = '') => {
  const basic = emp.baseSalary || 0;
  const hra = emp.hra || 0;
  const allowance = emp.allowance || 0;
  
  const workingDays = attendance.workingDays || 26;
  const unpaidLeave = attendance.unpaidLeaveDays || 0;
  const otHours = attendance.overtimeHours || 0;

  const perDaySalary = workingDays > 0 ? (basic + hra + allowance) / workingDays : 0;
  const unpaidLeaveDeduction = perDaySalary * unpaidLeave;
  const otAmount = otHours * (emp.overtimeRate || 0);

  const bonus = adjustments.bonus || 0;
  const incentive = adjustments.incentive || 0;
  const otherAllowance = adjustments.otherAllowance || 0;
  const manualAdjustment = adjustments.manualAdjustment || 0;
  
  const adjEarnings = manualAdjustment > 0 ? manualAdjustment : 0;
  const adjDeductions = manualAdjustment < 0 ? Math.abs(manualAdjustment) : 0;

  const grossSalary = basic + hra + allowance + otAmount + bonus + incentive + otherAllowance + adjEarnings;

  const pf = emp.pfApplicable ? basic * 0.12 : 0; // Simplified PF rule
  const esi = emp.esiApplicable ? grossSalary * 0.0075 : 0; // Simplified ESI rule
  const profTax = emp.professionalTax || 0;
  const tds = grossSalary > 50000 ? 1000 : 0; // Simplified TDS rule
  
  const otherDeduction = adjustments.otherDeduction || 0;

  const totalDeductions = pf + esi + profTax + tds + unpaidLeaveDeduction + otherDeduction + adjDeductions;
  
  const netSalary = grossSalary - totalDeductions;

  return {
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    designation: emp.designation,
    month,
    
    // Attendance Snapshot
    workingDays,
    presentDays: attendance.presentDays || 0,
    paidLeave: attendance.paidLeaveDays || 0,
    absentDays: attendance.absentDays || 0,
    unpaidLeaveDays: unpaidLeave,
    overtimeHours: otHours,
    
    // Earnings Snapshot
    basicSalary: basic,
    hra,
    allowances: allowance + otherAllowance,
    overtimeAmount: otAmount,
    bonus: bonus + incentive + adjEarnings,
    grossSalary,

    // Deductions Snapshot
    pf,
    esi,
    professionalTax: profTax,
    tds,
    leaveDeduction: unpaidLeaveDeduction,
    otherDeduction: otherDeduction + adjDeductions,
    totalDeductions,

    netSalary,
    
    // Calculation Snapshot
    calculationSnapshot: {
      workingDays,
      presentDays: attendance.presentDays || 0,
      paidLeaveDays: attendance.paidLeaveDays || 0,
      unpaidLeaveDays: unpaidLeave,
      overtimeHours: otHours,
      basicSalary: basic,
      hra,
      allowance,
      overtimeRate: emp.overtimeRate,
      pfRule: emp.pfApplicable ? '12% of Basic' : 'N/A',
      esiRule: emp.esiApplicable ? '0.75% of Gross' : 'N/A',
      calculatedAt: new Date().toISOString()
    },
    
    adjustments
  };
};

const generateMockSalary = (emp: any, status: string, month: string) => {
  const attendance = {
    workingDays: 26,
    presentDays: 24,
    paidLeaveDays: 2,
    absentDays: 0,
    unpaidLeaveDays: 0,
    overtimeHours: Math.floor(Math.random() * 10)
  };
  
  const baseSalaryObj = calculateSalary(emp, attendance, {}, month);
  
  return {
    ...baseSalaryObj,
    id: `SAL-${emp.id}-${month}`,
    payrollBatchId: `PAY-${month.replace('-', '-')}`, // simple approximation
    status,
    hrSubmittedAt: '2026-07-02T10:00:00Z',
    lastUpdatedAt: '2026-07-02T10:00:00Z',
    ...(status === 'SUPER_ADMIN_REJECTED' ? { superAdminRemarks: 'Please verify the overtime hours.' } : {}),
    ...(status === 'SALARY_PAID' ? { paymentMode: 'NEFT', transactionReference: 'UTR123456789', paymentDate: '2026-07-05T12:00:00Z' } : {}),
    history: [
      { action: 'SALARY_PREPARED', by: 'System', at: '2026-07-01T08:00:00Z', remarks: 'Payroll Generated Automatically' },
      { action: 'SUBMITTED', by: 'HR Admin', at: '2026-07-02T10:00:00Z', remarks: 'Submitted by HR' }
    ]
  };
};

const MOCK_SALARIES = [
  generateMockSalary(MOCK_EMPLOYEES[0], 'SALARY_PAID', '2026-06'),
  generateMockSalary(MOCK_EMPLOYEES[1], 'SALARY_PAID', '2026-06'),
  generateMockSalary(MOCK_EMPLOYEES[2], 'SALARY_PAID', '2026-06'),
  
  generateMockSalary(MOCK_EMPLOYEES[0], 'SENT_TO_FINANCE', '2026-07'),
  generateMockSalary(MOCK_EMPLOYEES[1], 'SENT_TO_FINANCE', '2026-07'),
  generateMockSalary(MOCK_EMPLOYEES[2], 'PAYMENT_PROCESSING', '2026-07'),
  generateMockSalary(MOCK_EMPLOYEES[3], 'SUPER_ADMIN_APPROVED', '2026-07'),
  generateMockSalary(MOCK_EMPLOYEES[4], 'PENDING_SUPER_ADMIN_APPROVAL', '2026-07'),
  generateMockSalary(MOCK_EMPLOYEES[5], 'PENDING_SUPER_ADMIN_APPROVAL', '2026-07'),
  generateMockSalary(MOCK_EMPLOYEES[6], 'SUPER_ADMIN_REJECTED', '2026-07'),
  generateMockSalary(MOCK_EMPLOYEES[7], 'SUPER_ADMIN_ON_HOLD', '2026-07'),
  generateMockSalary(MOCK_EMPLOYEES[8], 'DRAFT', '2026-07'),
  generateMockSalary(MOCK_EMPLOYEES[9], 'DRAFT', '2026-07'),
];


const migratePersistedState = (state: any) => {
  const version = typeof window !== 'undefined' ? window.localStorage.getItem('erp_procurement_data_version_2') : '2';
  if (version === '2') return state;

  console.log('Migrating procurement data to v2...');
  
  state.purchaseOrders = (state.purchaseOrders || []).map((po: any) => {
    return {
      ...po,
      items: (po.items || []).map((item: any) => ({
        ...item,
        orderedQty: item.orderedQty ?? item.quantity ?? 0,
        cumulativeDeliveredQty: item.cumulativeDeliveredQty ?? 0,
        cumulativeAcceptedQty: item.cumulativeAcceptedQty ?? 0,
        cumulativeRejectedQty: item.cumulativeRejectedQty ?? 0,
        cumulativeCancelledQty: item.cumulativeCancelledQty ?? 0,
        cumulativeCommerciallySettledQty: item.cumulativeCommerciallySettledQty ?? 0,
        remainingSupplyQty: item.remainingSupplyQty ?? (item.quantity ?? 0),
      }))
    };
  });

  state.materialRejections = state.materialRejections || [];
  state.procurementAuditLogs = state.procurementAuditLogs || [];
  state.procurementDocuments = state.procurementDocuments || [];
  state.procurementNotifications = state.procurementNotifications || [];
  state.materialReplacementSchedules = state.materialReplacementSchedules || [];
  state.replacementReceipts = state.replacementReceipts || [];

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('erp_procurement_data_version_2', '2');
  }
  return state;
};

const getInitialStateFromStorage = () => {
  if (typeof window === 'undefined') {
    return {
      orders: [], workOrders: [], dispatches: [], payments: [], notifications: [], samples: [], rawInventory: [], customers: [], leads: [], quotations: [], purchaseIndents: [], purchaseOrders: [], goodsReceipts: [], vendorInvoices: [], vendorPayments: [], vendorReturns: [], analysisRequests: [], qcInspections: [], employees: [], payrollBatches: [], salaries: [], materialRejections: [], procurementAuditLogs: [], procurementDocuments: [], procurementNotifications: [], materialReplacementSchedules: [], replacementReceipts: []
    };
  }
  try {
    const getStorageList = (key: string) => {
      const data = window.localStorage.getItem(key);
      if (!data) return [];
      try { return JSON.parse(data) || []; } catch { return []; }
    };
    
    let employees = getStorageList('erp_employees');
    let salaries = getStorageList('erp_salaries_v2');
    let payrollBatches = getStorageList('erp_payroll_batches_v2');
    
    if (employees.length === 0) {
      employees = MOCK_EMPLOYEES;
    }
    if (salaries.length === 0) {
      salaries = MOCK_SALARIES;
      payrollBatches = MOCK_BATCHES;
    }

    return {
      orders: getStorageList('erp_orders'),
      workOrders: getStorageList('erp_work_orders'),
      dispatches: getStorageList('erp_dispatches'),
      payments: getStorageList('erp_payments'),
      notifications: getStorageList('erp_notifications'),
      samples: getStorageList('erp_samples'),
      rawInventory: getStorageList('erp_inventory'),
      customers: getStorageList('erp_customers'),
      leads: getStorageList('erp_leads'),
      quotations: getStorageList('erp_quotations'),
      purchaseIndents: getStorageList('erp_purchase_indents'),
      purchaseOrders: getStorageList('erp_purchase_orders'),
      goodsReceipts: getStorageList('erp_goods_receipts'),
      vendorInvoices: getStorageList('erp_vendor_invoices'),
      vendorPayments: getStorageList('erp_vendor_payments'),
      vendorReturns: getStorageList('erp_vendor_returns'),
      analysisRequests: getStorageList('erp_analysis_requests_v1'),
      qcInspections: getStorageList('erp_qc_inspections'),
      employees,
      payrollBatches,
      salaries
    };
  } catch {
    return {
      orders: [], workOrders: [], dispatches: [], payments: [], notifications: [], samples: [], rawInventory: [], customers: [], leads: [], quotations: [], purchaseIndents: [], purchaseOrders: [], goodsReceipts: [], vendorInvoices: [], vendorPayments: [], vendorReturns: [], analysisRequests: [], qcInspections: [], employees: [], payrollBatches: [], salaries: [], materialRejections: [], procurementAuditLogs: [], procurementDocuments: [], procurementNotifications: [], materialReplacementSchedules: [], replacementReceipts: []
    };
  }
};

const safePersist = (store: any, updater: (state: any) => any) => {
  if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('erp_procurement_data_version_2', '2');
      if (Array.isArray(store.state.materialRejections)) window.localStorage.setItem('erp_material_rejections', JSON.stringify(store.state.materialRejections));
      if (Array.isArray(store.state.procurementAuditLogs)) window.localStorage.setItem('erp_procurement_audit_logs', JSON.stringify(store.state.procurementAuditLogs));
      if (Array.isArray(store.state.procurementDocuments)) window.localStorage.setItem('erp_procurement_documents', JSON.stringify(store.state.procurementDocuments));
      if (Array.isArray(store.state.procurementNotifications)) window.localStorage.setItem('erp_procurement_notifications', JSON.stringify(store.state.procurementNotifications));
      if (Array.isArray(store.state.materialReplacementSchedules)) window.localStorage.setItem('erp_material_replacement_schedules', JSON.stringify(store.state.materialReplacementSchedules));
      if (Array.isArray(store.state.replacementReceipts)) window.localStorage.setItem('erp_replacement_receipts', JSON.stringify(store.state.replacementReceipts));
    const rawPOs = window.localStorage.getItem('erp_purchase_orders');
    if (rawPOs) {
      try {
        const storedPOs = JSON.parse(rawPOs);
        if (storedPOs?.length > 0 && store.state.purchaseOrders?.length > 0) {
          const latestStored = storedPOs[0]?.lastUpdatedAt;
          const latestMem = store.state.purchaseOrders[0]?.lastUpdatedAt;
          if (latestStored && latestMem && new Date(latestStored) > new Date(latestMem)) {
            // concurrency mismatch, could merge missing here, for now we will proceed to overwrite
          }
        }
      } catch (e) {}
    }
  }
  return updater(store);
};

export const useERPStore = create((set, get: any) => ({
  state: getInitialStateFromStorage(),
  setState: (newState: any) => {
    const currentState = get().state;
    if (deepEqual(newState, currentState)) {
      return;
    }
    persistToStorage(newState);
    set({ state: newState });
  },
  quotationDraft: null,
  setQuotationDraft: (draft: any) => set({ quotationDraft: draft }),
  clearQuotationDraft: () => set({ quotationDraft: null }),

  // ---------------- PROCUREMENT WORKFLOW METHODS ----------------

  // --- Indents ---
  createPurchaseIndent: (data: any, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    if (!data.items || data.items.length === 0) throw new Error("Indent requires at least one item");
    if (!data.requiredDate) throw new Error("Indent requires a requiredDate");
    const newIndent = { 
      ...data, 
      id: createId('IND'), 
      status: 'PENDING_PLANT_HEAD_APPROVAL', 
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      auditTrail: [createProcurementAuditEntry('CREATE_INDENT', undefined, 'PENDING_PLANT_HEAD_APPROVAL', actorName, 'Store')]
    };
    const newState = { ...s.state, purchaseIndents: [newIndent, ...(s.state.purchaseIndents || [])] };
    persistToStorage(newState);
    return { state: newState };
  })),

  updatePurchaseIndent: (indentId: string, data: any, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        if (ind.status !== 'PLANT_HEAD_REJECTED' && ind.status !== 'PENDING_PLANT_HEAD_APPROVAL') {
          throw new Error("Cannot edit indent unless pending or rejected");
        }
        return { ...ind, ...data, lastUpdatedAt: new Date().toISOString() };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents };
    persistToStorage(newState);
    return { state: newState };
  })),

  resubmitPurchaseIndent: (indentId: string, remarks: string, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        assertTransition('PurchaseIndent', ind.status, ['PLANT_HEAD_REJECTED'], 'resubmit');
        return { 
          ...ind, 
          status: 'PENDING_PLANT_HEAD_APPROVAL', 
          plantHeadRemarks: '', 
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(ind.auditTrail || []), createProcurementAuditEntry('RESUBMIT_INDENT', ind.status, 'PENDING_PLANT_HEAD_APPROVAL', actorName, 'Store', remarks)]
        };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents };
    persistToStorage(newState);
    return { state: newState };
  })),

  approvePurchaseIndent: (indentId: string, remarks: string, approverName: string = 'Plant Head') => set((store: any) => safePersist(store, (s) => {
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        assertTransition('PurchaseIndent', ind.status, ['PENDING_PLANT_HEAD_APPROVAL'], 'approve');
        return { 
          ...ind, 
          status: 'PLANT_HEAD_APPROVED', 
          plantHeadRemarks: remarks, 
          plantHeadApprovedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(ind.auditTrail || []), createProcurementAuditEntry('APPROVE_INDENT', ind.status, 'PLANT_HEAD_APPROVED', approverName, 'Plant Head', remarks)]
        };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents };
    persistToStorage(newState);
    return { state: newState };
  })),

  rejectPurchaseIndent: (indentId: string, remarks: string, rejectorName: string = 'Plant Head') => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Rejection remarks are mandatory");
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        assertTransition('PurchaseIndent', ind.status, ['PENDING_PLANT_HEAD_APPROVAL'], 'reject');
        return { 
          ...ind, 
          status: 'PLANT_HEAD_REJECTED', 
          plantHeadRemarks: remarks, 
          plantHeadRejectedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(ind.auditTrail || []), createProcurementAuditEntry('REJECT_INDENT', ind.status, 'PLANT_HEAD_REJECTED', rejectorName, 'Plant Head', remarks)]
        };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents };
    persistToStorage(newState);
    return { state: newState };
  })),

  cancelPurchaseIndent: (indentId: string, reason: string, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    if (!reason) throw new Error("Cancellation reason mandatory");
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        assertTransition('PurchaseIndent', ind.status, ['PENDING_PLANT_HEAD_APPROVAL', 'PLANT_HEAD_APPROVED'], 'cancel');
        return { 
          ...ind, 
          status: 'INDENT_CANCELLED',
          cancellationReason: reason,
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(ind.auditTrail || []), createProcurementAuditEntry('CANCEL_INDENT', ind.status, 'INDENT_CANCELLED', actorName, 'User', reason)]
        };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents };
    persistToStorage(newState);
    return { state: newState };
  })),


  // --- Purchase Orders ---
  createPurchaseOrderFromIndent: (indentId: string, poData: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    let indentConverted = false;
    const purchaseIndents = (s.state.purchaseIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        assertTransition('PurchaseIndent', ind.status, ['PLANT_HEAD_APPROVED'], 'convert to PO');
        indentConverted = true;
        return { 
          ...ind, 
          status: 'CONVERTED_TO_PO',
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(ind.auditTrail || []), createProcurementAuditEntry('CONVERT_TO_PO', ind.status, 'CONVERTED_TO_PO', actorName, 'Finance')]
        };
      }
      return ind;
    });
    if (!indentConverted) throw new Error("Indent not found or not approved");
    
    const totals = calculatePOLineTotals(poData.items, poData.freightAmount);
    const newPO = { 
      ...poData, 
      ...totals,
      id: createId('DPO'), 
      indentId, 
      status: 'DRAFT', 
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      auditTrail: [createProcurementAuditEntry('CREATE_DRAFT_PO', undefined, 'DRAFT', actorName, 'Finance')]
    };
    const newState = { ...s.state, purchaseIndents, purchaseOrders: [newPO, ...(s.state.purchaseOrders || [])] };
    persistToStorage(newState);
    return { state: newState };
  })),

  updatePurchaseOrder: (poId: string, data: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['DRAFT', 'SUPER_ADMIN_REJECTED'], 'update');
        const items = data.items || po.items;
        const freight = data.freightAmount !== undefined ? data.freightAmount : po.freightAmount;
        const totals = calculatePOLineTotals(items, freight);
        return { 
          ...po, 
          ...data, 
          ...totals,
          status: 'DRAFT',
          lastUpdatedAt: new Date().toISOString()
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  submitPurchaseOrder: (poId: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['DRAFT'], 'submit');
        if (!po.vendorId && !po.vendorName) throw new Error("Vendor is required");
        if (!po.items || po.items.length === 0) throw new Error("At least one item is required");
        
        const nextStatus = po.grandTotal <= 50000 ? 'SUPER_ADMIN_APPROVED' : 'PENDING_SUPER_ADMIN_APPROVAL';
        const remarks = po.grandTotal <= 50000 ? 'Auto-approved via Financial Threshold <= Γé╣50,000' : 'Submitted for approval';
        
        return { 
          ...po, 
          status: nextStatus, 
          submittedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('SUBMIT_PO', po.status, nextStatus, actorName, 'Finance', remarks)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  approvePurchaseOrder: (poId: string, remarks: string, approverName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['PENDING_SUPER_ADMIN_APPROVAL'], 'approve');
        return { 
          ...po, 
          status: 'SUPER_ADMIN_APPROVED', 
          superAdminRemarks: remarks, 
          approvedBy: approverName, 
          approvedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('APPROVE_PO', po.status, 'SUPER_ADMIN_APPROVED', approverName, 'Super Admin', remarks)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  rejectPurchaseOrder: (poId: string, remarks: string, rejectorName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Rejection remarks are mandatory");
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['PENDING_SUPER_ADMIN_APPROVAL'], 'reject');
        return { 
          ...po, 
          status: 'SUPER_ADMIN_REJECTED', 
          superAdminRemarks: remarks, 
          rejectedBy: rejectorName, 
          rejectedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('REJECT_PO', po.status, 'SUPER_ADMIN_REJECTED', rejectorName, 'Super Admin', remarks)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  issuePurchaseOrder: (poId: string, finalPoNumber?: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['SUPER_ADMIN_APPROVED'], 'issue');
        const poNumber = finalPoNumber || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        return { 
          ...po, 
          status: 'PO_ISSUED', 
          poNumber, 
          issuedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('ISSUE_PO', po.status, 'PO_ISSUED', actorName, 'Finance', `PO No: ${poNumber}`)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  acceptPurchaseOrderByVendor: (poId: string, data: any, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['PO_ISSUED'], 'vendor accept');
        if (!data.expectedDeliveryDate && !po.deliveryDate) throw new Error("Expected delivery date is required");
        return { 
          ...po, 
          status: 'VENDOR_ACCEPTED', 
          vendorResponse: {
            status: "ACCEPTED",
            respondedAt: new Date().toISOString(),
            expectedDeliveryDate: data.expectedDeliveryDate || po.deliveryDate,
            remarks: data.remarks || "Vendor acceptance simulated for prototype"
          },
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('VENDOR_ACCEPT_PO', po.status, 'VENDOR_ACCEPTED', actorName, 'Vendor', data.remarks)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  amendPurchaseOrder: (poId: string, amendmentData: any, reason: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    if (!reason) throw new Error("Amendment reason required");
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        const revNo = `Rev-${(po.amendments?.length || 0) + 1}`;
        const previousState = { items: po.items, freightAmount: po.freightAmount, grandTotal: po.grandTotal };
        const items = amendmentData.items || po.items;
        const freight = amendmentData.freightAmount !== undefined ? amendmentData.freightAmount : po.freightAmount;
        const totals = calculatePOLineTotals(items, freight);
        
        return {
          ...po,
          ...amendmentData,
          ...totals,
          amendments: [...(po.amendments || []), { revisionNo: revNo, amendedAt: new Date().toISOString(), amendedBy: actorName, reason, previousState, newState: totals }],
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('AMEND_PO', po.status, po.status, actorName, 'Finance', `${revNo}: ${reason}`)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  cancelPurchaseOrder: (poId: string, reason: string, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    if (!reason) throw new Error("Cancellation reason required");
    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        assertTransition('PurchaseOrder', po.status, ['DRAFT', 'PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'PO_ISSUED', 'VENDOR_ACCEPTED'], 'cancel');
        return { 
          ...po, 
          status: 'PO_CANCELLED',
          cancellationReason: reason,
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('CANCEL_PO', po.status, 'PO_CANCELLED', actorName, 'User', reason)]
        };
      }
      return po;
    });
    const newState = { ...s.state, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),


  // --- GRN & QC ---
  createGoodsReceipt: (poId: string, data: any, actorName: string = 'Store') => set((store: any) => safePersist(store, (s) => {
    let indentId = '';
    const existingGRNs = s.state.goodsReceipts || [];
    const vendorReturns = [...(s.state.vendorReturns || [])];
    
    const totalDelivered = Number(data.receivedQty || data.items?.reduce((acc: number, item: any) => acc + (Number(item.receivedQty || item.quantity) || 0), 0) || 0);
    const totalAccepted = Number(data.acceptedQty !== undefined ? data.acceptedQty : totalDelivered);
    const totalRejected = Number(data.rejectedQty !== undefined ? data.rejectedQty : Math.max(0, totalDelivered - totalAccepted));

    if (totalDelivered <= 0) throw new Error("Delivered quantity must be > 0");
    if (totalAccepted + totalRejected !== totalDelivered) throw new Error("Accepted + Rejected must equal Delivered quantity");

    const newGRNId = data.id || createId('GRN');
    const newGRNNo = data.grnNumber || `GRN-${Date.now().toString().slice(-6)}`;

    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poId || po.poNumber === poId) {
        assertTransition('PurchaseOrder', po.status, ['VENDOR_ACCEPTED', 'PARTIALLY_RECEIVED'], 'create GRN');
        indentId = po.indentId || '';
        
        const poOrderedQty = Number(po.orderedQty || po.quantity || po.items?.reduce((acc: number, i: any) => acc + (Number(i.quantity) || 0), 0) || 1000);
        const prevDelivered = existingGRNs.filter((g: any) => (g.purchaseOrderId === po.id || g.purchaseOrderId === po.poNumber) && g.status !== 'QUALITY_REJECTED').reduce((acc: number, g: any) => acc + (Number(g.receivedQty) || 0), 0);
        
        if (totalDelivered > (poOrderedQty - prevDelivered)) {
          throw new Error(`Delivered qty (${totalDelivered}) exceeds pending qty (${poOrderedQty - prevDelivered})`);
        }

        const nextStatus = (prevDelivered + totalDelivered) >= poOrderedQty ? 'GRN_SUBMITTED' : 'PARTIALLY_RECEIVED';
        
        return { 
          ...po, 
          status: nextStatus, 
          lastReceivedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('CREATE_GRN', po.status, nextStatus, actorName, 'Store', `GRN: ${newGRNNo}`)]
        };
      }
      return po;
    });

    if (totalRejected > 0 && !data.isReplacementGRN) {
      vendorReturns.push({
        id: createId('VRN'),
        returnNo: `VRN-${Date.now().toString().slice(-6)}`,
        poNumber: poId,
        grnNumber: newGRNNo,
        grnId: newGRNId,
        vendorName: data.vendorName || 'Authorized Vendor',
        materialName: data.materialName || 'Procured Materials',
        rejectedQty: totalRejected,
        reason: data.remarks || 'Quality Check / Mismatch',
        status: 'WAITING_PICKUP',
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      });
    }

    const newGRN = {
      ...data,
      id: newGRNId,
      grnNumber: newGRNNo,
      purchaseOrderId: poId,
      poNumber: poId,
      indentId,
      receivedQty: totalDelivered,
      acceptedQty: totalAccepted,
      rejectedQty: totalRejected,
      status: 'GRN_SUBMITTED',
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      auditTrail: [createProcurementAuditEntry('SUBMIT_GRN', undefined, 'GRN_SUBMITTED', actorName, 'Store')]
    };

    const newState = { ...s.state, purchaseOrders, vendorReturns, goodsReceipts: [newGRN, ...existingGRNs] };
    persistToStorage(newState);
    return { state: newState };
  })),

  approveGoodsReceipt: (grnId: string, remarks: string, inspectorName: string = 'QC') => set((store: any) => safePersist(store, (s) => {
    const goodsReceipts = (s.state.goodsReceipts || []).map((grn: any) => {
      if (grn.id === grnId) {
        assertTransition('GoodsReceipt', grn.status, ['GRN_SUBMITTED'], 'approve');
        return { 
          ...grn, 
          status: 'GRN_APPROVED', 
          qcRemarks: remarks, 
          approvedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(grn.auditTrail || []), createProcurementAuditEntry('APPROVE_GRN', grn.status, 'GRN_APPROVED', inspectorName, 'QC', remarks)]
        };
      }
      return grn;
    });
    const newState = { ...s.state, goodsReceipts };
    persistToStorage(newState);
    return { state: newState };
  })),

  rejectGoodsReceipt: (grnId: string, remarks: string, inspectorName: string = 'QC') => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Rejection remarks mandatory");
    let foundGRN: any = null;
    const goodsReceipts = (s.state.goodsReceipts || []).map((grn: any) => {
      if (grn.id === grnId) {
        assertTransition('GoodsReceipt', grn.status, ['GRN_SUBMITTED'], 'reject');
        foundGRN = grn;
        return { 
          ...grn, 
          status: 'QUALITY_REJECTED', 
          qcRemarks: remarks, 
          rejectedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(grn.auditTrail || []), createProcurementAuditEntry('REJECT_GRN', grn.status, 'QUALITY_REJECTED', inspectorName, 'QC', remarks)]
        };
      }
      return grn;
    });
    
    const vendorReturns = [...(s.state.vendorReturns || [])];
    if (foundGRN && !vendorReturns.find(v => v.grnId === grnId)) {
      vendorReturns.push({
        id: createId('VRN'),
        returnNo: `VRN-${Date.now().toString().slice(-6)}`,
        poNumber: foundGRN.poNumber || foundGRN.purchaseOrderId,
        grnNumber: foundGRN.grnNumber,
        grnId: foundGRN.id,
        vendorName: foundGRN.vendorName || 'Authorized Vendor',
        materialName: foundGRN.materialName || 'Procured Materials',
        rejectedQty: foundGRN.receivedQty || 0,
        reason: remarks,
        status: 'WAITING_PICKUP',
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      });
    }

    const newState = { ...s.state, goodsReceipts, vendorReturns };
    persistToStorage(newState);
    return { state: newState };
  })),

  postGoodsReceiptToStock: (grnId: string, actorName: string = 'Store') => set((store: any) => safePersist(store, (s) => {
    let rawInventory = [...(s.state.rawInventory || [])];
    let foundGRN: any = null;

    const goodsReceipts = (s.state.goodsReceipts || []).map((grn: any) => {
      if (grn.id === grnId) {
        assertTransition('GoodsReceipt', grn.status, ['GRN_APPROVED'], 'post stock');
        foundGRN = grn;
        return { 
          ...grn, 
          status: 'STOCK_POSTED', 
          postedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(grn.auditTrail || []), createProcurementAuditEntry('POST_STOCK', grn.status, 'STOCK_POSTED', actorName, 'Store')]
        };
      }
      return grn;
    });

    if (!foundGRN) throw new Error("GRN not found");

    const items = foundGRN.items && foundGRN.items.length > 0 ? foundGRN.items : [{ code: foundGRN.materialCode || `RM-${Date.now()}`, name: foundGRN.materialName || 'Raw Material', acceptedQty: foundGRN.acceptedQty }];
    items.forEach((item: any) => {
      const qtyToAdd = Number(item.acceptedQty !== undefined ? item.acceptedQty : item.quantity) || 0;
      if (qtyToAdd > 0) {
        const invIdx = rawInventory.findIndex((r: any) => (item.code && r.code === item.code) || r.material === item.name);
        if (invIdx !== -1) {
          rawInventory[invIdx] = { ...rawInventory[invIdx], stock: (Number(rawInventory[invIdx].stock) || 0) + qtyToAdd };
        } else {
          rawInventory.push({ code: item.code || `RM-${Date.now()}`, material: item.name, stock: qtyToAdd, unit: item.unit || 'Kg' });
        }
      }
    });

    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === foundGRN.purchaseOrderId || po.poNumber === foundGRN.purchaseOrderId || po.poNumber === foundGRN.poNumber) {
        const poOrderedQty = Number(po.orderedQty || po.quantity || po.items?.reduce((acc: number, i: any) => acc + (Number(i.quantity) || 0), 0) || 1000);
        const allPoGRNs = goodsReceipts.filter((g: any) => g.purchaseOrderId === po.id || g.purchaseOrderId === po.poNumber || g.poNumber === po.poNumber);
        
        const allPosted = allPoGRNs.every((g: any) => g.status === 'STOCK_POSTED' || g.status === 'QUALITY_REJECTED' || g.status === 'GRN Returned to Store');
        const totalAcceptedQty = allPoGRNs.reduce((acc: number, g: any) => acc + (Number(g.acceptedQty) || 0), 0);
        
        if (allPosted && totalAcceptedQty >= poOrderedQty) {
          return { ...po, status: 'STOCK_POSTED', lastUpdatedAt: new Date().toISOString(), auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('PO_STOCK_POSTED', po.status, 'STOCK_POSTED', 'System', 'System')] };
        }
      }
      return po;
    });

    const newState = { ...s.state, goodsReceipts, rawInventory, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),


  // --- Invoices & Payments ---
  createVendorInvoice: (poId: string, data: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const newInvoice = {
      ...data,
      id: createId('INV'),
      poId,
      status: 'INVOICE_SUBMITTED',
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      auditTrail: [createProcurementAuditEntry('SUBMIT_INVOICE', undefined, 'INVOICE_SUBMITTED', actorName, 'Finance')]
    };
    const newState = { ...s.state, vendorInvoices: [newInvoice, ...(s.state.vendorInvoices || [])] };
    persistToStorage(newState);
    return { state: newState };
  })),

  verifyVendorInvoice: (invoiceId: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const vendorInvoices = (s.state.vendorInvoices || []).map((inv: any) => {
      if (inv.id === invoiceId) {
        assertTransition('VendorInvoice', inv.status, ['INVOICE_SUBMITTED'], 'verify');
        return { 
          ...inv, 
          status: 'INVOICE_VERIFIED',
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(inv.auditTrail || []), createProcurementAuditEntry('VERIFY_INVOICE', inv.status, 'INVOICE_VERIFIED', actorName, 'Finance')]
        };
      }
      return inv;
    });
    const newState = { ...s.state, vendorInvoices };
    persistToStorage(newState);
    return { state: newState };
  })),

  createVendorPayment: (poId: string, invoiceId: string, data: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    // Validate PO has posted GRNs
    const poGRNs = (s.state.goodsReceipts || []).filter((g: any) => g.purchaseOrderId === poId || g.poNumber === poId);
    if (!poGRNs.some((g: any) => g.status === 'STOCK_POSTED')) {
      throw new Error("Cannot pay without at least one STOCK_POSTED GRN");
    }

    const newPayment = { 
      ...data, 
      id: createId('PAY'),
      purchaseOrderId: poId,
      invoiceId, 
      status: 'PAYMENT_PENDING', 
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      auditTrail: [createProcurementAuditEntry('CREATE_PAYMENT', undefined, 'PAYMENT_PENDING', actorName, 'Finance')]
    };
    const newState = { ...s.state, vendorPayments: [newPayment, ...(s.state.vendorPayments || [])] };
    persistToStorage(newState);
    return { state: newState };
  })),

  completeVendorPayment: (paymentId: string, data: any, actorName: string = 'Finance Executive') => set((store: any) => safePersist(store, (s) => {
    if (!data.transactionId && !data.utrNo) throw new Error("Transaction ID / UTR required to complete payment");
    
    let poIdToClose = '';
    let invoiceIdToClose = '';
    
    const vendorPayments = (s.state.vendorPayments || []).map((vp: any) => {
      if (vp.id === paymentId) {
        assertTransition('VendorPayment', vp.status, ['PAYMENT_PENDING'], 'complete');
        poIdToClose = vp.purchaseOrderId;
        invoiceIdToClose = vp.invoiceId;
        return { 
          ...vp, 
          ...data,
          status: 'PAYMENT_COMPLETED', 
          completedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(vp.auditTrail || []), createProcurementAuditEntry('COMPLETE_PAYMENT', vp.status, 'PAYMENT_COMPLETED', actorName, 'Finance', data.transactionId)]
        };
      }
      return vp;
    });

    const vendorInvoices = (s.state.vendorInvoices || []).map((inv: any) => {
      if (inv.id === invoiceIdToClose) {
        return { ...inv, status: 'INVOICE_PAID', lastUpdatedAt: new Date().toISOString() };
      }
      return inv;
    });

    const purchaseOrders = (s.state.purchaseOrders || []).map((po: any) => {
      if (po.id === poIdToClose || po.poNumber === poIdToClose) {
        // Strict PO Closing Check
        const allPoGRNs = (s.state.goodsReceipts || []).filter((g: any) => g.purchaseOrderId === po.id || g.purchaseOrderId === po.poNumber || g.poNumber === po.poNumber);
        const poVRNs = (s.state.vendorReturns || []).filter((v: any) => v.poNumber === po.id || v.poNumber === po.poNumber);
        const poPayments = vendorPayments.filter((vp: any) => vp.purchaseOrderId === po.id || vp.purchaseOrderId === po.poNumber);

        const allGRNsPosted = allPoGRNs.length > 0 && allPoGRNs.every((g: any) => g.status === 'STOCK_POSTED' || g.status === 'QUALITY_REJECTED' || g.status === 'GRN Returned to Store');
        const allReturnsResolved = poVRNs.every((v: any) => v.status === 'REPLACED' || v.status === 'CLOSED' || v.status === 'Replacement Received' || v.status === 'Replacement Settled' || v.status === 'Canceled');
        const totalCompletedPayment = poPayments.filter((vp: any) => vp.status === 'PAYMENT_COMPLETED').reduce((acc: number, vp: any) => acc + (Number(vp.amount) || 0), 0);
        
        const finalPayable = po.grandTotal || 0;

        if (allGRNsPosted && allReturnsResolved && totalCompletedPayment >= finalPayable * 0.95) {
          return { 
            ...po, 
            status: 'PO_CLOSED', 
            closedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
            auditTrail: [...(po.auditTrail || []), createProcurementAuditEntry('CLOSE_PO', po.status, 'PO_CLOSED', 'System', 'System', 'All criteria met')]
          };
        }
      }
      return po;
    });

    const newState = { ...s.state, vendorPayments, vendorInvoices, purchaseOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  cancelVendorPayment: (paymentId: string, reason: string, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    if (!reason) throw new Error("Cancellation reason required");
    const vendorPayments = (s.state.vendorPayments || []).map((vp: any) => {
      if (vp.id === paymentId) {
        assertTransition('VendorPayment', vp.status, ['PAYMENT_PENDING'], 'cancel');
        return { 
          ...vp, 
          status: 'PAYMENT_CANCELLED',
          cancellationReason: reason,
          lastUpdatedAt: new Date().toISOString(),
          auditTrail: [...(vp.auditTrail || []), createProcurementAuditEntry('CANCEL_PAYMENT', vp.status, 'PAYMENT_CANCELLED', actorName, 'Finance', reason)]
        };
      }
      return vp;
    });
    const newState = { ...s.state, vendorPayments };
    persistToStorage(newState);
    return { state: newState };
  })),

  attachDocumentMeta: (entityType: string, entityId: string, docMeta: any) => set((store: any) => safePersist(store, (s) => {
    const metaRecord = { ...docMeta, id: createId('DOC'), uploadedAt: new Date().toISOString() };
    const updater = (items: any[]) => (items || []).map(item => {
      if (item.id === entityId || item.poNumber === entityId) {
        return { ...item, documents: [...(item.documents || []), metaRecord], lastUpdatedAt: new Date().toISOString() };
      }
      return item;
    });

    let newState = { ...s.state };
    if (entityType === 'PO') newState.purchaseOrders = updater(newState.purchaseOrders);
    else if (entityType === 'GRN') newState.goodsReceipts = updater(newState.goodsReceipts);
    else if (entityType === 'INVOICE') newState.vendorInvoices = updater(newState.vendorInvoices);
    
    persistToStorage(newState);
    return { state: newState };
  })),

  // --- Vendor Returns ---
  updateVendorReturnStatus: (vrnId: string, status: string, remarks?: string) => {
    set((store: any) => {
      const vendorReturns = (store.state.vendorReturns || []).map((vrn: any) => {
        if (vrn.id === vrnId || vrn.returnNo === vrnId) {
          return { ...vrn, status, lastUpdatedAt: new Date().toISOString() };
        }
        return vrn;
      });
      const newState = { ...store.state, vendorReturns };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  // --- STRICT SALES & PRODUCTION FLOW ACTIONS ---
  ...salesAndProductionSlice(set, get, safePersist, persistToStorage),

  createReplacementGRN: (poId: string, vrnId: string, data: any) => {
    set((store: any) => {
      const vendorReturns = (store.state.vendorReturns || []).map((vrn: any) => {
        if (vrn.id === vrnId || vrn.returnNo === vrnId) {
          return { ...vrn, status: 'REPLACED' };
        }
        return vrn;
      });

      const newGRNId = createId('GRN');
      const newGRNNo = data.grnNumber || `GRN-REP-${Date.now().toString().slice(-4)}`;
      const totalReceived = Number(data.receivedQty || data.quantity || 0);
      const totalAccepted = Number(data.acceptedQty !== undefined ? data.acceptedQty : totalReceived);

      const newGRN = {
        ...data,
        id: newGRNId,
        grnNumber: newGRNNo,
        purchaseOrderId: poId,
        poNumber: poId,
        isReplacementGRN: true,
        linkedVRNId: vrnId,
        receivedQty: totalReceived,
        acceptedQty: totalAccepted,
        rejectedQty: 0,
        status: 'GRN_SUBMITTED',
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      };

      const newState = { ...store.state, goodsReceipts: [newGRN, ...(store.state.goodsReceipts || [])], vendorReturns };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  // --- QC & PRODUCTION WORKFLOW ---
  submitForQC: (workOrderId: string, actorName: string = 'Production') => set((store: any) => safePersist(store, (s) => {
    const workOrders = (s.state.workOrders || []).map((wo: any) => {
      if (matchOrderId(wo, workOrderId)) {
        return {
          ...wo,
          status: 'QC_PENDING',
          workflowStatus: 'QC_PENDING',
          updatedAt: new Date().toISOString()
        };
      }
      return wo;
    });
    const newState = { ...s.state, workOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  submitQCInspection: (workOrderId: string, qcData: any = {}) => set((store: any) => safePersist(store, (s) => {
    const inspectionId = `QC-INS-${Date.now()}`;
    const newInspection = {
      id: inspectionId,
      workOrderId: workOrderId,
      attemptNumber: (s.state.qcInspections || []).filter((ins: any) => matchOrderId(ins, workOrderId)).length + 1,
      inspectedQuantity: qcData.inspectedQuantity || 0,
      approvedQuantity: qcData.acceptedQty || 0,
      rejectedQuantity: qcData.rejectedQty || 0,
      reworkQuantity: qcData.reworkQty || 0,
      disposition: qcData.disposition || '',
      result: (qcData.rejectedQty > 0 || qcData.reworkQty > 0) ? (qcData.acceptedQty > 0 ? 'PARTIALLY_APPROVED' : 'FAILED') : 'APPROVED',
      inspectorName: qcData.inspectorName || 'QC User',
      parameters: { strength: qcData.strength, dimensions: qcData.dimensions, weight: qcData.weight },
      defects: qcData.defects || [],
      remarks: qcData.remarks || '',
      inspectedAt: new Date().toISOString()
    };

    let updatedOrder = null;

    const workOrders = (s.state.workOrders || []).map((wo: any) => {
      if (matchOrderId(wo, workOrderId)) {
        const approved = (wo.qcApprovedQuantity || 0) + (qcData.acceptedQty || 0);
        const rejected = (wo.qcRejectedQuantity || 0) + (qcData.rejectedQty || 0);
        const produced = wo.producedQuantity || wo.quantity || 0;
        
        let status = 'QC_PASSED';
        if (approved === 0 && rejected > 0) status = 'QC_FAILED';
        else if (approved > 0 && approved < produced) status = 'PARTIALLY_READY';
        else if (approved >= produced) status = 'QC_PASSED';
        
        if (qcData.disposition === 'Send for Rework') status = 'REWORK_REQUIRED';

        return {
          ...wo,
          qcApprovedQuantity: approved,
          qcRejectedQuantity: rejected,
          status,
          workflowStatus: status,
          updatedAt: new Date().toISOString()
        };
      }
      return wo;
    });
    
    const orders = (s.state.orders || []).map((order: any) => {
      if (matchOrderId(order, workOrderId)) {
        const approved = (order.qcApprovedQuantity || 0) + (qcData.acceptedQty || 0);
        const rejected = (order.qcRejectedQuantity || 0) + (qcData.rejectedQty || 0);
        const reworkPending = (order.reworkPendingQuantity || 0) + (qcData.disposition === 'Send for Rework' ? (qcData.rejectedQty || 0) : 0);
        const dispatched = order.dispatchedQuantity || 0;
        const available = approved - dispatched;
        
        let dispatchStatus = 'pending';
        let status = order.status;
        
        if (available > 0) {
            dispatchStatus = 'ready_for_dispatch';
            status = 'Partially Ready for Dispatch';
        }
        
        if (approved >= (order.producedQuantity || order.quantity || order.estimatedQuantity)) {
            dispatchStatus = 'ready_for_dispatch';
            status = 'QC Approved';
        }

        updatedOrder = { 
            ...order, 
            qcApprovedQuantity: approved,
            qcRejectedQuantity: rejected,
            reworkPendingQuantity: reworkPending,
            finishedGoodsQuantity: approved,
            availableQuantity: available,
            status, 
            workflowStatus: status === 'Partially Ready for Dispatch' ? 'PARTIALLY_READY' : 'QC_APPROVED', 
            dispatchStatus, 
            updatedAt: new Date().toISOString() 
        };
        return updatedOrder;
      }
      return order;
    });

    const newState = { 
      ...s.state, 
      workOrders, 
      orders,
      qcInspections: [newInspection, ...(s.state.qcInspections || [])] 
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  startReproduction: (workOrderId: string) => set((store: any) => safePersist(store, (s) => {
    const workOrders = (s.state.workOrders || []).map((wo: any) => {
      if (matchOrderId(wo, workOrderId)) {
        return {
          ...wo,
          status: 'REWORK_IN_PROGRESS',
          workflowStatus: 'REWORK_IN_PROGRESS',
          updatedAt: new Date().toISOString()
        };
      }
      return wo;
    });
    const newState = { ...s.state, workOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  completeReproduction: (workOrderId: string) => set((store: any) => safePersist(store, (s) => {
    const workOrders = (s.state.workOrders || []).map((wo: any) => {
      if (matchOrderId(wo, workOrderId)) {
        return {
          ...wo,
          status: 'REINSPECTION_PENDING',
          workflowStatus: 'REINSPECTION_PENDING',
          updatedAt: new Date().toISOString()
        };
      }
      return wo;
    });
    const newState = { ...s.state, workOrders };
    persistToStorage(newState);
    return { state: newState };
  })),

  // 3. CREATE DISPATCH RECORD
  createDispatchRecord: (orderId: string, dispatchData: any = {}) => {
    let foundOrder: any = null;
    set((store: any) => {
      const orders = (store.state.orders || []).map((order: any) => {
        if (!matchOrderId(order, orderId)) return order;
        foundOrder = order;
        return {
          ...order,
          dispatchStatus: 'created',
          orderStatus: 'Dispatch Created',
          workflowStatus: 'DISPATCH_CREATED',
          status: 'Dispatch Created',
          dispatchCreatedAt: new Date().toISOString(),
          vehicleNumber: dispatchData.vehicleNumber || order.vehicleNumber,
          driverName: dispatchData.driverName || order.driverName,
          driverPhone: dispatchData.driverPhone || order.driverPhone,
          expectedDeliveryDate: dispatchData.expectedDeliveryDate || order.expectedDeliveryDate,
          dispatchDocuments: dispatchData.documents || order.dispatchDocuments || {},
          quantity: dispatchData.quantity || order.quantity,
          availableQuantity: dispatchData.quantity || order.availableQuantity,
          updatedAt: new Date().toISOString(),
        };
      });

      const cleanId = String(orderId).replace(/^ORD-/i, '').replace(/^WO-/i, '') || '001';
      const dispatchId = `DSP-${cleanId}`;

      const existingIndex = (store.state.dispatches || []).findIndex((d: any) => matchOrderId(d, orderId) || d.dispatchId === dispatchId);
      const newDispatchObj = {
        dispatchId,
        id: dispatchId,
        orderId: orderId,
        orderNo: orderId,
        customer: foundOrder?.customer?.name || foundOrder?.customer || dispatchData.customer || 'ABC Infrastructure Pvt Ltd',
        customerName: foundOrder?.customer?.name || foundOrder?.customer || dispatchData.customer || 'ABC Infrastructure Pvt Ltd',
        products: foundOrder?.products?.[0]?.productName || foundOrder?.productName || dispatchData.products || 'RCC Hume Pipe 600mm',
        quantity: foundOrder?.production?.outputQuantity || foundOrder?.quantity || dispatchData.quantity || '100 Qty',
        deliveryAddress: foundOrder?.deliveryAddress || dispatchData.deliveryAddress || 'Customer Site Gate #1',
        vehicleNumber: dispatchData.vehicleNumber,
        driverName: dispatchData.driverName,
        driverPhone: dispatchData.driverPhone,
        transporterName: dispatchData.transporterName || 'Himalaya Logistics',
        dispatchDate: dispatchData.dispatchDate || new Date().toISOString().split('T')[0],
        expectedDeliveryDate: dispatchData.expectedDeliveryDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        gatePassNumber: dispatchData.gatePassNumber || 'GP-2026-001',
        deliveryChallanNumber: dispatchData.deliveryChallanNumber || 'DC-2026-001',
        invoiceNumber: dispatchData.invoiceNumber || 'INV-2026-001',
        remarks: dispatchData.remarks || '',
        dispatchStatus: 'created',
        orderStatus: 'Dispatch Created',
        status: 'Dispatch Created',
        dispatchDocuments: dispatchData.documents || {},
        createdAt: new Date().toISOString(),
      };

      const dispatches = [...(store.state.dispatches || [])];
      if (existingIndex !== -1) {
        dispatches[existingIndex] = { ...dispatches[existingIndex], ...newDispatchObj };
      } else {
        dispatches.push(newDispatchObj);
      }

      const newState = { ...store.state, orders, dispatches };
      persistToStorage(newState);
      return { state: newState };
    });
    return !!foundOrder;
  },

  // 4. START DISPATCH DELIVERY (IN TRANSIT)
  startDispatchDelivery: (targetId: string) => {
    let found = false;
    set((store: any) => {
      const dispatches = (store.state.dispatches || []).map((d: any) => {
        if (!matchOrderId(d, targetId)) return d;
        found = true;
        return {
          ...d,
          dispatchStatus: 'in_transit',
          orderStatus: 'In Transit',
          status: 'In Transit',
          deliveryStartedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      const orders = (store.state.orders || []).map((o: any) => {
        if (!matchOrderId(o, targetId)) return o;
        found = true;
        return {
          ...o,
          dispatchStatus: 'in_transit',
          orderStatus: 'In Transit',
          workflowStatus: 'IN_TRANSIT',
          status: 'In Transit',
          deliveryStartedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      const newState = { ...store.state, dispatches, orders };
      persistToStorage(newState);
      return { state: newState };
    });
    return found;
  },

  // 5. CONFIRM DELIVERED
  confirmDelivered: (targetId: string, deliveryData: any = {}) => {
    let foundOrder: any = null;
    set((store: any) => {
      const dispatches = (store.state.dispatches || []).map((d: any) => {
        if (!matchOrderId(d, targetId)) return d;
        return {
          ...d,
          dispatchStatus: 'delivered',
          deliveryStatus: 'confirmed',
          orderStatus: 'Delivered',
          status: 'Delivered',
          actualDeliveryDate: deliveryData.actualDeliveryDate || new Date().toISOString().split('T')[0],
          actualDeliveryTime: deliveryData.actualDeliveryTime || '14:00',
          receivedBy: deliveryData.receivedBy || 'Customer Site Engineer',
          receiverPhone: deliveryData.receiverPhone || '9876543210',
          deliveryLocation: deliveryData.deliveryLocation || 'Customer Site',
          deliveryRemarks: deliveryData.deliveryRemarks || 'Delivered securely in good condition',
          deliveryDocuments: deliveryData.documents || {},
          deliveredAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      const orders = (store.state.orders || []).map((o: any) => {
        if (!matchOrderId(o, targetId)) return o;
        foundOrder = o;
        return {
          ...o,
          dispatchStatus: 'delivered',
          deliveryStatus: 'confirmed',
          orderStatus: 'Delivered',
          workflowStatus: 'DELIVERED',
          status: 'Delivered',
          actualDeliveryDate: deliveryData.actualDeliveryDate || new Date().toISOString().split('T')[0],
          receivedBy: deliveryData.receivedBy || 'Customer Site Engineer',
          deliveryDocuments: deliveryData.documents || {},
          deliveredAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      const orderId = foundOrder?.id || foundOrder?.orderNo || targetId;
      const customerName = foundOrder?.customer?.name || foundOrder?.customer || 'ABC Infrastructure Pvt Ltd';
      const cleanId = String(orderId).replace(/^ORD-/i, '').replace(/^WO-/i, '') || '001';
      const pvId = `PV-${cleanId}`;
      const invoiceAmt = Number(foundOrder?.grandTotal || foundOrder?.totalValue || foundOrder?.invoiceAmount || 207000);

      // Create Payment Verification Item
      const payments = [...(store.state.payments || [])];
      const existingPayIdx = payments.findIndex((p: any) => matchOrderId(p, orderId) || p.paymentVerificationId === pvId || p.payment_id === pvId);
      const paymentItem = {
        paymentVerificationId: pvId,
        payment_id: pvId,
        id: pvId,
        orderId: orderId,
        order_id: orderId,
        orderNumber: orderId,
        order_number: orderId,
        customer: customerName,
        customer_name: customerName,
        invoiceAmount: invoiceAmt,
        grand_total: invoiceAmt,
        amountReceived: 0,
        verified_paid_amount: 0,
        outstandingAmount: invoiceAmt,
        balance_amount: invoiceAmt,
        paymentStatus: 'awaiting_customer_payment',
        verificationStatus: 'not_submitted',
        status: 'Awaiting Payment',
        deliveryStatus: 'Delivered',
        deliveredAt: new Date().toISOString(),
      };

      if (existingPayIdx !== -1) {
        payments[existingPayIdx] = { ...payments[existingPayIdx], ...paymentItem };
      } else {
        payments.push(paymentItem);
      }

      // Create Notifications
      const notifications = [...(store.state.notifications || [])];
      notifications.unshift({
        id: `notif-sales-${Date.now()}`,
        title: 'Order Delivered',
        message: `${orderId} for ${customerName} has been delivered successfully.`,
        type: 'delivery',
        referenceType: 'order',
        referenceId: orderId,
        navigationUrl: '/sales/orders',
        createdAt: new Date().toISOString(),
        read: false
      });
      notifications.unshift({
        id: `notif-fin-${Date.now() + 1}`,
        title: 'Delivered Order Awaiting Payment',
        message: `${orderId} has been delivered. Outstanding payment is Γé╣${(invoiceAmt / 100000).toFixed(2)} L.`,
        type: 'payment',
        referenceType: 'order',
        referenceId: orderId,
        navigationUrl: '/finance/payment-verification',
        createdAt: new Date().toISOString(),
        read: false
      });

      const newState = { ...store.state, dispatches, orders, payments, notifications };
      persistToStorage(newState);
      return { state: newState };
    });
    return !!foundOrder;
  },

  // 8. SUBMIT SALES PAYMENT FOLLOW-UP
  submitSalesPayment: (targetId: string, paymentData: any = {}) => {
    let found = false;
    set((store: any) => {
      const submittedAmt = Number(paymentData.amount || paymentData.submittedAmount || 207000);
      const txRef = paymentData.transactionReference || paymentData.utrNumber || 'UTR-' + Date.now();

      const payments = (store.state.payments || []).map((p: any) => {
        if (!matchOrderId(p, targetId)) return p;
        found = true;
        return {
          ...p,
          paymentStatus: 'submitted_for_verification',
          verificationStatus: 'pending',
          status: 'Pending Verification',
          submittedAmount: submittedAmt,
          payment_amount: submittedAmt,
          paymentMode: paymentData.paymentMode || 'NEFT',
          payment_mode: paymentData.paymentMode || 'NEFT',
          transactionReference: txRef,
          request_number: txRef,
          bankName: paymentData.bankName || '',
          chequeNumber: paymentData.chequeNumber || '',
          referenceText: paymentData.referenceText || '',
          remarks: paymentData.remarks || '',
          paymentProof: paymentData.proofs || {},
          paymentSubmittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      const orders = (store.state.orders || []).map((o: any) => {
        if (!matchOrderId(o, targetId)) return o;
        found = true;
        return {
          ...o,
          orderStatus: 'Pending Finance Verification',
          workflowStatus: 'PENDING_VERIFICATION',
          paymentStatus: 'submitted_for_verification',
          submittedAmount: submittedAmt,
          paymentSubmittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      const newState = { ...store.state, payments, orders };
      persistToStorage(newState);
      return { state: newState };
    });
    return found;
  },

  // 9. VERIFY FINANCE PAYMENT
  // ΓöÇΓöÇ ORDER CLOSURE ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  closeOrder: (orderId: string) => {
    let found = false;
    set((store: any) => {
      const orders = (store.state.orders || []).map((order: any) => {
        if (!matchOrderId(order, orderId)) return order;
        found = true;
        return {
          ...order,
          status: 'Closed',
          workflowStatus: 'CLOSED',
          orderStatus: 'Closed',
          closedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      const newState = { ...store.state, orders };
      persistToStorage(newState);
      return { state: newState };
    });
    return found;
  },

  verifyFinancePayment: (targetId: string, verificationData: any = {}) => {
    let found = false;
    set((store: any) => {
      const action = verificationData.action || 'verify';

      const payments = (store.state.payments || []).map((p: any) => {
        if (!matchOrderId(p, targetId)) return p;
        found = true;

        if (action === 'reject') {
          return {
            ...p,
            paymentStatus: 'verification_rejected',
            verificationStatus: 'rejected',
            status: 'Rejected',
            rejectionReason: verificationData.rejectionReason || 'Invalid UTR reference or proof mismatch',
            rejectedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        const prevRec = Number(p.amountReceived || p.verified_paid_amount || 0);
        const subAmt = Number(p.submittedAmount || p.payment_amount || verificationData.amount || 207000);
        const invAmt = Number(p.invoiceAmount || p.grand_total || 207000);
        const newRec = prevRec + subAmt;
        const newBal = Math.max(0, invAmt - newRec);
        const isFull = newBal <= 0 || verificationData.fullVerification !== false;

        if (isFull) {
          return {
            ...p,
            amountReceived: invAmt,
            verified_paid_amount: invAmt,
            outstandingAmount: 0,
            balance_amount: 0,
            paymentStatus: 'paid',
            verificationStatus: 'verified',
            status: 'Payment Verified',
            verifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else {
          return {
            ...p,
            amountReceived: newRec,
            verified_paid_amount: newRec,
            outstandingAmount: newBal,
            balance_amount: newBal,
            paymentStatus: 'partially_paid',
            verificationStatus: 'verified',
            status: 'Partially Paid',
            verifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      });

      const orders = (store.state.orders || []).map((o: any) => {
        if (!matchOrderId(o, targetId)) return o;
        if (action === 'reject') {
          return {
            ...o,
            orderStatus: 'Delivered',
            paymentStatus: 'verification_rejected',
            rejectionReason: verificationData.rejectionReason || 'Invalid proof',
            updatedAt: new Date().toISOString(),
          };
        }

        const matchingPay = payments.find((p: any) => matchOrderId(p, targetId));
        if (matchingPay && matchingPay.paymentStatus === 'paid') {
          return {
            ...o,
            orderStatus: 'Payment Completed',
            workflowStatus: 'PAYMENT_COMPLETED',
            paymentStatus: 'paid',
            outstandingAmount: 0,
            verifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else {
          return {
            ...o,
            orderStatus: 'Partially Paid',
            workflowStatus: 'PARTIALLY_PAID',
            paymentStatus: 'partially_paid',
            outstandingAmount: matchingPay?.outstandingAmount || 0,
            updatedAt: new Date().toISOString(),
          };
        }
      });

      const newState = { ...store.state, payments, orders };
      persistToStorage(newState);
      return { state: newState };
    });
    return found;
  },

  createAnalysisRequest: (data: any) => {
    set((store: any) => {
      const id = `AR-${Date.now()}`;
      const requestNumber = `AR-${Math.floor(100000 + Math.random() * 900000)}`;
      const newReq = {
        id,
        requestNumber,
        status: 'PENDING_FINANCE_REVIEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: data.createdBy || 'Store User',
        submittedAt: new Date().toISOString(),
        storeReport: { ...data.storeReport },
        history: [
          {
            action: 'CREATED_AND_SUBMITTED',
            fromStatus: 'NONE',
            toStatus: 'PENDING_FINANCE_REVIEW',
            performedBy: data.createdBy || 'Store User',
            performedAt: new Date().toISOString(),
            remarks: 'Analysis request created and submitted to Finance.'
          }
        ]
      };
      const analysisRequests = [newReq, ...(store.state.analysisRequests || [])];
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  saveAnalysisRequestDraft: (data: any) => {
    set((store: any) => {
      const id = `AR-${Date.now()}`;
      const requestNumber = `AR-${Math.floor(100000 + Math.random() * 900000)}`;
      const newReq = {
        id,
        requestNumber,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: data.createdBy || 'Store User',
        storeReport: { ...data.storeReport },
        history: [
          {
            action: 'DRAFT_CREATED',
            fromStatus: 'NONE',
            toStatus: 'DRAFT',
            performedBy: data.createdBy || 'Store User',
            performedAt: new Date().toISOString(),
            remarks: 'Analysis request saved as draft.'
          }
        ]
      };
      const analysisRequests = [newReq, ...(store.state.analysisRequests || [])];
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  updateAnalysisRequest: (requestId: string, data: any) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          return {
            ...req,
            updatedAt: new Date().toISOString(),
            storeReport: { ...req.storeReport, ...data.storeReport },
            history: [
              ...req.history,
              {
                action: 'REPORT_UPDATED',
                fromStatus: req.status,
                toStatus: req.status,
                performedBy: data.performedBy || 'Store User',
                performedAt: new Date().toISOString(),
                remarks: 'Operational store report details updated.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  submitAnalysisRequest: (requestId: string) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'PENDING_FINANCE_REVIEW';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            submittedAt: new Date().toISOString(),
            history: [
              ...req.history,
              {
                action: 'SUBMITTED_TO_FINANCE',
                fromStatus,
                toStatus,
                performedBy: 'Store User',
                performedAt: new Date().toISOString(),
                remarks: 'Request submitted to Finance department for analysis.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  startFinanceAnalysis: (requestId: string) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'FINANCE_UNDER_REVIEW';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            history: [
              ...req.history,
              {
                action: 'FINANCE_REVIEW_STARTED',
                fromStatus,
                toStatus,
                performedBy: 'Finance Auditor',
                performedAt: new Date().toISOString(),
                remarks: 'Finance department started reviewing PO & GRN histories.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  returnAnalysisRequestToStore: (requestId: string, remarks: string) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'RETURNED_TO_STORE';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            history: [
              ...req.history,
              {
                action: 'RETURNED_TO_STORE_BY_FINANCE',
                fromStatus,
                toStatus,
                performedBy: 'Finance Auditor',
                performedAt: new Date().toISOString(),
                remarks: remarks || 'Returned to store for operational clarifications.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  rejectAnalysisRequestByFinance: (requestId: string, remarks: string) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'FINANCE_REJECTED';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            history: [
              ...req.history,
              {
                action: 'REJECTED_BY_FINANCE',
                fromStatus,
                toStatus,
                performedBy: 'Finance Auditor',
                performedAt: new Date().toISOString(),
                remarks: remarks || 'Rejected during commercial impact analysis.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  submitAnalysisRequestToSuperAdmin: (requestId: string, reviewData: any) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'PENDING_SUPER_ADMIN_APPROVAL';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            financeReview: {
              ...reviewData,
              reviewedBy: 'Finance Auditor',
              reviewedAt: new Date().toISOString()
            },
            history: [
              ...req.history,
              {
                action: 'SUBMITTED_TO_SUPER_ADMIN',
                fromStatus,
                toStatus,
                performedBy: 'Finance Auditor',
                performedAt: new Date().toISOString(),
                remarks: 'Commercial analysis complete. Submitted for final Super Admin decision.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  returnAnalysisRequestToFinance: (requestId: string, remarks: string) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'RETURNED_TO_FINANCE';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            history: [
              ...req.history,
              {
                action: 'RETURNED_TO_FINANCE_BY_ADMIN',
                fromStatus,
                toStatus,
                performedBy: 'Super Admin',
                performedAt: new Date().toISOString(),
                remarks: remarks || 'Returned for cost comparison clarification.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  returnAnalysisRequestToStoreByAdmin: (requestId: string, remarks: string) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'RETURNED_TO_STORE';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            history: [
              ...req.history,
              {
                action: 'RETURNED_TO_STORE_BY_ADMIN',
                fromStatus,
                toStatus,
                performedBy: 'Super Admin',
                performedAt: new Date().toISOString(),
                remarks: remarks || 'Returned directly to Store for verification of physical occurrences.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  rejectAnalysisRequestByAdmin: (requestId: string, remarks: string) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'SUPER_ADMIN_REJECTED';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            adminDecision: {
              decisionType: 'OTHER',
              remarks: remarks || 'Rejected by Super Admin.',
              decidedBy: 'Super Admin',
              decidedAt: new Date().toISOString()
            },
            history: [
              ...req.history,
              {
                action: 'REJECTED_BY_ADMIN',
                fromStatus,
                toStatus,
                performedBy: 'Super Admin',
                performedAt: new Date().toISOString(),
                remarks: remarks || 'Request rejected. Stop action canceled.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  approveAnalysisRequest: (requestId: string, decisionData: any) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'APPROVED';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            adminDecision: {
              decisionType: decisionData.decisionType || 'APPROVE_ALTERNATIVE_BRAND',
              remarks: decisionData.remarks || 'Approved by Super Admin.',
              decidedBy: 'Super Admin',
              decidedAt: new Date().toISOString()
            },
            history: [
              ...req.history,
              {
                action: 'APPROVED_BY_ADMIN',
                fromStatus,
                toStatus,
                performedBy: 'Super Admin',
                performedAt: new Date().toISOString(),
                remarks: `Approved with policy decision: ${decisionData.decisionType}. Remarks: ${decisionData.remarks || 'None'}`
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  approveTechnicalTrial: (requestId: string, trialData: any) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'TRIAL_APPROVED';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            adminDecision: {
              decisionType: 'APPROVE_TECHNICAL_TRIAL',
              remarks: trialData.remarks || 'Technical trial approved.',
              decidedBy: 'Super Admin',
              decidedAt: new Date().toISOString()
            },
            trial: {
              required: true,
              trialBrand: trialData.trialBrand || req.storeReport.suggestedAlternativeBrand || 'Trial Alternative',
              trialQuantity: Number(trialData.trialQuantity || 10),
              unit: trialData.unit || req.storeReport.unit || 'Units',
              expectedCompletionDate: trialData.expectedCompletionDate || '',
              performanceCriteria: trialData.performanceCriteria || 'Verify hardness / moisture resistance'
            },
            history: [
              ...req.history,
              {
                action: 'TRIAL_APPROVED_BY_ADMIN',
                fromStatus,
                toStatus,
                performedBy: 'Super Admin',
                performedAt: new Date().toISOString(),
                remarks: `Technical trial approved. Quantity: ${trialData.trialQuantity} ${trialData.unit || 'Units'} of brand "${trialData.trialBrand}".`
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  startTrial: (requestId: string, startDate: string) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'TRIAL_IN_PROGRESS';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            trial: {
              ...(req.trial || {}),
              startDate: startDate || new Date().toISOString().split('T')[0]
            },
            history: [
              ...req.history,
              {
                action: 'TRIAL_STARTED_BY_STORE',
                fromStatus,
                toStatus,
                performedBy: 'Store User',
                performedAt: new Date().toISOString(),
                remarks: `Technical trial officially started on site. Start date: ${startDate}.`
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  submitTrialReport: (requestId: string, reportData: any) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'TRIAL_REPORT_SUBMITTED';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            trial: {
              ...(req.trial || {}),
              reportText: reportData.reportText || '',
              result: reportData.result || 'SUCCESSFUL',
              observations: reportData.observations || '',
              failedQuantity: Number(reportData.failedQuantity || 0),
              successfulQuantity: Number(reportData.successfulQuantity || 0),
              attachments: reportData.attachments || [],
              submittedBy: 'Store User',
              submittedAt: new Date().toISOString()
            },
            history: [
              ...req.history,
              {
                action: 'TRIAL_REPORT_SUBMITTED_BY_STORE',
                fromStatus,
                toStatus,
                performedBy: 'Store User',
                performedAt: new Date().toISOString(),
                remarks: `Trial report submitted with result: ${reportData.result}. Failed quantity: ${reportData.failedQuantity || 0}.`
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  requestTrialClarification: (requestId: string, remarks: string) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'TRIAL_IN_PROGRESS';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            history: [
              ...req.history,
              {
                action: 'TRIAL_CLARIFICATION_REQUESTED',
                fromStatus,
                toStatus,
                performedBy: 'Super Admin',
                performedAt: new Date().toISOString(),
                remarks: remarks || 'Trial report returned to Store for clarifications.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  completeAnalysisRequest: (requestId: string, finalRemarks: string) => {
    set((store: any) => {
      const analysisRequests = (store.state.analysisRequests || []).map((req: any) => {
        if (req.id === requestId) {
          const fromStatus = req.status;
          const toStatus = 'COMPLETED';
          return {
            ...req,
            status: toStatus,
            updatedAt: new Date().toISOString(),
            adminDecision: {
              ...(req.adminDecision || {}),
              finalRemarks: finalRemarks || 'Request marked as completed.'
            },
            history: [
              ...req.history,
              {
                action: 'COMPLETED_BY_ADMIN',
                fromStatus,
                toStatus,
                performedBy: 'Super Admin',
                performedAt: new Date().toISOString(),
                remarks: finalRemarks || 'Analysis request successfully verified and COMPLETED.'
              }
            ]
          };
        }
        return req;
      });
      const newState = { ...store.state, analysisRequests };
      persistToStorage(newState);
      return { state: newState };
    });
  },

  // ==========================================
  // HR & PAYROLL WORKFLOW METHODS
  // ==========================================

  createPayrollBatch: (month: string, year: string, actorName: string = 'HR') => set((store: any) => safePersist(store, (s) => {
    const batchId = `PAY-${year}-${month.padStart(2, '0')}`;
    const newBatch = {
      id: batchId,
      month: `${year}-${month.padStart(2, '0')}`,
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      createdBy: actorName,
    };
    const newState = { ...s.state, payrollBatches: [newBatch, ...(s.state.payrollBatches || [])] };
    persistToStorage(newState);
    return { state: newState };
  })),

  prepareSalary: (salaryData: any, actorName: string = 'HR') => set((store: any) => safePersist(store, (s) => {
    const salaries = [...(s.state.salaries || [])];
    const existingIndex = salaries.findIndex((sal: any) => sal.id === salaryData.id);

    const auditEntry = {
      action: existingIndex >= 0 ? "SALARY_UPDATED" : "SALARY_PREPARED",
      by: actorName,
      at: new Date().toISOString(),
      remarks: existingIndex >= 0 
        ? `Recalculated. Previous Net: Γé╣${salaries[existingIndex].netSalary.toLocaleString()}.` 
        : "Payroll Generated Automatically"
    };

    if (existingIndex >= 0) {
      salaries[existingIndex] = {
        ...salaries[existingIndex],
        ...salaryData,
        status: 'DRAFT',
        history: [...(salaries[existingIndex].history || []), auditEntry],
        lastUpdatedAt: new Date().toISOString()
      };
    } else {
      salaries.push({
        ...salaryData,
        status: 'DRAFT',
        history: [auditEntry],
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      });
    }

    const newState = { ...s.state, salaries };
    persistToStorage(newState);
    return { state: newState };
  })),

  updateSalaryAdjustment: (salaryId: string, adjustments: any, actorName: string = 'HR Admin') => set((store: any) => safePersist(store, (s) => {
    const salaries = (s.state.salaries || []).map((sal: any) => {
      if (sal.id === salaryId) {
        const emp = (s.state.employees || []).find((e: any) => e.id === sal.employeeId);
        if (!emp) return sal;
        
        const attendance = {
          workingDays: sal.workingDays,
          presentDays: sal.presentDays,
          paidLeaveDays: sal.paidLeave,
          absentDays: sal.absentDays,
          unpaidLeaveDays: sal.unpaidLeaveDays,
          overtimeHours: sal.overtimeHours
        };

        const newCalc = calculateSalary(emp, attendance, adjustments, sal.month);
        
        return {
          ...sal,
          ...newCalc,
          status: 'DRAFT',
          lastUpdatedAt: new Date().toISOString(),
          history: [...(sal.history || []), {
            action: "ADJUSTMENT_UPDATED",
            by: actorName,
            at: new Date().toISOString(),
            remarks: "Salary recalculated after manual adjustment."
          }]
        };
      }
      return sal;
    });
    const newState = { ...s.state, salaries };
    persistToStorage(newState);
    return { state: newState };
  })),

  submitSalaryToSuperAdmin: (salaryId: string, actorName: string = 'HR') => set((store: any) => safePersist(store, (s) => {
    const salaries = (s.state.salaries || []).map((sal: any) => {
      if (sal.id === salaryId) {
        return {
          ...sal,
          status: 'PENDING_SUPER_ADMIN_APPROVAL',
          hrSubmittedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          history: [...(sal.history || []), {
            action: "SUBMITTED_TO_SUPER_ADMIN",
            by: actorName,
            at: new Date().toISOString(),
            remarks: "Submitted to Super Admin for approval"
          }]
        };
      }
      return sal;
    });
    const newState = { ...s.state, salaries };
    persistToStorage(newState);
    return { state: newState };
  })),

  resubmitSalaryToSuperAdmin: (salaryId: string, updatedData: any, actorName: string = 'HR') => set((store: any) => safePersist(store, (s) => {
    const salaries = (s.state.salaries || []).map((sal: any) => {
      if (sal.id === salaryId) {
        return {
          ...sal,
          ...updatedData,
          status: 'PENDING_SUPER_ADMIN_APPROVAL',
          hrSubmittedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          history: [...(sal.history || []), {
            action: "RESUBMITTED_TO_SUPER_ADMIN",
            by: actorName,
            at: new Date().toISOString(),
            remarks: "Corrections made and resubmitted to Super Admin"
          }]
        };
      }
      return sal;
    });
    const newState = { ...s.state, salaries };
    persistToStorage(newState);
    return { state: newState };
  })),

  approveSalary: (salaryId: string, remarks: string, actorName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    const salaries = (s.state.salaries || []).map((sal: any) => {
      if (sal.id === salaryId) {
        return {
          ...sal,
          status: 'SUPER_ADMIN_APPROVED',
          superAdminDecisionAt: new Date().toISOString(),
          superAdminRemarks: remarks,
          lastUpdatedAt: new Date().toISOString(),
          history: [...(sal.history || []), {
            action: "SUPER_ADMIN_APPROVED",
            by: actorName,
            at: new Date().toISOString(),
            remarks: remarks || "Approved"
          }]
        };
      }
      return sal;
    });
    const newState = { ...s.state, salaries };
    persistToStorage(newState);
    return { state: newState };
  })),

  rejectSalary: (salaryId: string, remarks: string, actorName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    const salaries = (s.state.salaries || []).map((sal: any) => {
      if (sal.id === salaryId) {
        return {
          ...sal,
          status: 'SUPER_ADMIN_REJECTED',
          superAdminDecisionAt: new Date().toISOString(),
          superAdminRemarks: remarks,
          lastUpdatedAt: new Date().toISOString(),
          history: [...(sal.history || []), {
            action: "SUPER_ADMIN_REJECTED",
            by: actorName,
            at: new Date().toISOString(),
            remarks: remarks || "Rejected"
          }]
        };
      }
      return sal;
    });
    const newState = { ...s.state, salaries };
    persistToStorage(newState);
    return { state: newState };
  })),

  onHoldSalary: (salaryId: string, remarks: string, actorName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    const salaries = (s.state.salaries || []).map((sal: any) => {
      if (sal.id === salaryId) {
        return {
          ...sal,
          status: 'SUPER_ADMIN_ON_HOLD',
          superAdminDecisionAt: new Date().toISOString(),
          superAdminRemarks: remarks,
          lastUpdatedAt: new Date().toISOString(),
          history: [...(sal.history || []), {
            action: "SUPER_ADMIN_ON_HOLD",
            by: actorName,
            at: new Date().toISOString(),
            remarks: remarks || "On Hold"
          }]
        };
      }
      return sal;
    });
    const newState = { ...s.state, salaries };
    persistToStorage(newState);
    return { state: newState };
  })),

  sendSalaryToFinance: (salaryIds: string[], actorName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    const salaries = (s.state.salaries || []).map((sal: any) => {
      if (salaryIds.includes(sal.id)) {
        return {
          ...sal,
          status: 'SENT_TO_FINANCE',
          sentToFinanceAt: new Date().toISOString(),
          paymentStatus: 'NOT_SENT',
          lastUpdatedAt: new Date().toISOString(),
          history: [...(sal.history || []), {
            action: "SENT_TO_FINANCE",
            by: actorName,
            at: new Date().toISOString(),
            remarks: "Sent to Finance for payment processing"
          }]
        };
      }
      return sal;
    });
    const newState = { ...s.state, salaries };
    persistToStorage(newState);
    return { state: newState };
  })),

  startSalaryPayment: (salaryId: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const salaries = (s.state.salaries || []).map((sal: any) => {
      if (sal.id === salaryId) {
        return {
          ...sal,
          status: 'PAYMENT_PROCESSING',
          paymentStatus: 'PROCESSING',
          lastUpdatedAt: new Date().toISOString(),
          history: [...(sal.history || []), {
            action: "PAYMENT_PROCESSING_STARTED",
            by: actorName,
            at: new Date().toISOString(),
            remarks: "Payment processing initiated"
          }]
        };
      }
      return sal;
    });
    const newState = { ...s.state, salaries };
    persistToStorage(newState);
    return { state: newState };
  })),

  markSalaryAsPaid: (salaryId: string, paymentData: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const salaries = (s.state.salaries || []).map((sal: any) => {
      if (sal.id === salaryId) {
        return {
          ...sal,
          status: 'SALARY_PAID',
          paymentStatus: 'PAID',
          paymentDate: paymentData.paymentDate || new Date().toISOString(),
          paymentMode: paymentData.paymentMode,
          transactionReference: paymentData.transactionReference,
          paymentProof: paymentData.paymentProof,
          lastUpdatedAt: new Date().toISOString(),
          history: [...(sal.history || []), {
            action: "SALARY_PAID",
            by: actorName,
            at: new Date().toISOString(),
            remarks: `Paid via ${paymentData.paymentMode}. UTR: ${paymentData.transactionReference}`
          }]
        };
      }
      return sal;
    });
    const newState = { ...s.state, salaries };
    persistToStorage(newState);
    return { state: newState };
  }))
}));

// --- Procurement Analytics Selector ---
export const getProcurementAnalytics = (state: any) => {
  const purchaseIndents = state.purchaseIndents || [];
  const purchaseOrders = state.purchaseOrders || [];
  const goodsReceipts = state.goodsReceipts || [];
  const vendorPayments = state.vendorPayments || [];

  const openIndentsCount = purchaseIndents.filter((ind: any) => ind.status === 'PENDING_PLANT_HEAD_APPROVAL').length;
  const pendingSuperAdminPOsCount = purchaseOrders.filter((po: any) => po.status === 'PENDING_SUPER_ADMIN_APPROVAL').length;
  const pendingGRNsCount = goodsReceipts.filter((grn: any) => grn.status === 'GRN_SUBMITTED').length;

  let totalReceived = 0;
  let totalRejected = 0;
  goodsReceipts.forEach((grn: any) => {
    if (grn.status !== 'GRN_DRAFT' && grn.status !== 'QUALITY_REJECTED') {
      totalReceived += Number(grn.receivedQty || 0);
      totalRejected += Number(grn.rejectedQty || 0);
    }
    if (grn.status === 'QUALITY_REJECTED') {
      totalReceived += Number(grn.receivedQty || 0);
      totalRejected += Number(grn.receivedQty || 0);
    }
  });
  const qcRejectionRate = totalReceived > 0 ? ((totalRejected / totalReceived) * 100).toFixed(1) : "0.0";

  let onTimeCount = 0;
  let totalDeliveredPOs = 0;
  let leadTimeSum = 0;
  
  purchaseOrders.forEach((po: any) => {
    const poGRNs = goodsReceipts.filter((g: any) => g.purchaseOrderId === po.id || g.purchaseOrderId === po.poNumber);
    if (poGRNs.length > 0 && po.issuedAt) {
      totalDeliveredPOs++;
      const firstGRN = poGRNs.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
      const deliveryDate = po.vendorResponse?.expectedDeliveryDate || po.deliveryDate;
      if (deliveryDate && new Date(firstGRN.createdAt) <= new Date(deliveryDate)) {
        onTimeCount++;
      }
      const days = (new Date(firstGRN.createdAt).getTime() - new Date(po.issuedAt).getTime()) / (1000 * 3600 * 24);
      if (days >= 0) leadTimeSum += days;
    }
  });
  
  const vendorOnTimeDeliveryRate = totalDeliveredPOs > 0 ? ((onTimeCount / totalDeliveredPOs) * 100).toFixed(1) : "100.0";
  const averageLeadTimeDays = totalDeliveredPOs > 0 ? (leadTimeSum / totalDeliveredPOs).toFixed(1) : "0.0";

  const outstandingPaymentsTotal = vendorPayments.filter((vp: any) => vp.status === 'PAYMENT_PENDING').reduce((acc, vp: any) => acc + (Number(vp.amount) || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const monthlyProcurementSpend = purchaseOrders
    .filter((po: any) => (po.status === 'PO_ISSUED' || po.status === 'VENDOR_ACCEPTED' || po.status === 'PARTIALLY_RECEIVED' || po.status === 'STOCK_POSTED' || po.status === 'PAYMENT_PENDING' || po.status === 'PAYMENT_COMPLETED' || po.status === 'PO_CLOSED') && new Date(po.issuedAt || po.createdAt).getMonth() === currentMonth)
    .reduce((acc, po: any) => acc + (Number(po.grandTotal) || 0), 0);

  return {
    openIndentsCount,
    pendingSuperAdminPOsCount,
    pendingGRNsCount,
    qcRejectionRate,
    vendorOnTimeDeliveryRate,
    averageLeadTimeDays,
    outstandingPaymentsTotal,
    monthlyProcurementSpend
  };
};
