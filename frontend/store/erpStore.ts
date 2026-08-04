import { create } from 'zustand';
import { assertTransition, createId, calculatePOLineTotals, createProcurementAuditEntry } from '../constants/procurement';
import { deepEqual } from '../lib/deepEqual';
import * as SalesActions from './domains/sales/salesActions';
import * as DispatchActions from './domains/dispatch/dispatchActions';
import { ENTITY_ID_PREFIXES, EntityIdType, getNextEntityId } from './idGenerator';
import { can } from '../shared/context/AbilityContext';

const MATERIAL_FLOW_STORE_VERSION = 5;
const MATERIAL_FLOW_CLEANUP_VERSION = '2';
const MATERIAL_FLOW_LEGACY_KEYS = [
  'materialRequests',
  'production_material_requests',
  'plant_head_material_approvals',
  'store_material_requests',
  'production_store_releases',
  'erp_material_requests',
  'erp_store_releases',
  'himalaya_material_requests_v1',
];

export function getUserIdSuffix() {
  if (typeof window === 'undefined') return '';
  try {
    const authRaw = window.localStorage.getItem('auth-storage');
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      const id = parsed?.state?.user?.email || parsed?.state?.user?.id;
      if (id) return `_${id}`;
    }
  } catch (e) {}
  return '';
}

function getScopedKey(baseKey: string) {
  return `${baseKey}${getUserIdSuffix()}`;
}

const GLOBAL_KEYS = ['himalaya-material-flow-cleanup-version', 'himalaya-transactional-reset-version', 'himalaya-ess-browser-seed-version', 'erp_procurement_data_version_2'];

import { SafeStorage } from '../utils/storage';

function getStorageItem(key: string) {
  if (GLOBAL_KEYS.includes(key) || key === 'auth-storage') return window.localStorage.getItem(key);
  return window.localStorage.getItem(getScopedKey(key));
}

function setStorageItem(key: string, value: string) {
  const targetKey = GLOBAL_KEYS.includes(key) ? key : getScopedKey(key);
  return SafeStorage.setItemString(targetKey, value);
}

function removeStorageItem(key: string) {
  if (GLOBAL_KEYS.includes(key)) return window.localStorage.removeItem(key);
  return window.localStorage.removeItem(getScopedKey(key));
}

const safeStringify = (obj: any) => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'string' && value.length > 50000 && value.startsWith('data:image')) {
      return value.substring(0, 50) + '...[truncated to save quota]';
    }
    return value;
  });
};

const EMPTY_ARRAY: any[] = [];

export const postApprovedGrnToInventory = (state: any, grn: any) => {
  if (grn.inventoryPosted) {
    throw new Error(`Inventory has already been posted for GRN ${grn.id}.`);
  }

  const rawInventory = [...(state.rawInventory || [])];
  grn.items.forEach((item: any) => {
    const qtyToAdd = Number(item.acceptedQuantity || item.acceptedQty || 0);
    if (qtyToAdd > 0) {
      const invIdx = rawInventory.findIndex((r: any) =>
        r.id === item.materialId ||
        r.materialId === item.materialId ||
        r.code === item.materialId ||
        r.materialCode === item.materialId ||
        r.material === item.materialName
      );
      if (invIdx !== -1) {
        const currentStockVal = Number(rawInventory[invIdx].currentStock ?? rawInventory[invIdx].stock ?? rawInventory[invIdx].quantity ?? 0) + qtyToAdd;
        rawInventory[invIdx] = {
          ...rawInventory[invIdx],
          stock: currentStockVal,
          currentStock: currentStockVal,
          quantity: currentStockVal,
          lastUpdatedAt: new Date().toISOString()
        };
      } else {
        const currentStockVal = qtyToAdd;
        rawInventory.push({
          id: item.materialId || `RM-${Date.now()}`,
          code: item.materialId || `RM-${Date.now()}`,
          materialId: item.materialId || `RM-${Date.now()}`,
          material: item.materialName,
          stock: currentStockVal,
          currentStock: currentStockVal,
          quantity: currentStockVal,
          unit: item.unit || 'PCS'
        });
      }
    }
  });
  state.rawInventory = rawInventory;
};

export const normalizeStateForStore = (rawState: any) => {
  if (!rawState) return rawState;
  
  if (!rawState.procurement) {
    rawState.procurement = {
      materialIndents: [],
      purchaseOrders: [],
      goodsReceiptNotes: [],
      vendorReturns: [],
      vendorDisputes: [],
      procurementSchemaVersion: 2
    };
  }

  const stateObj = { ...rawState };

  // Delete legacy static properties to make sure they do not conflict with our dynamic getters
  delete stateObj.purchaseOrders;
  delete stateObj.goodsReceipts;
  delete stateObj.goodsReceiptNotes;
  delete stateObj.purchaseIndents;
  delete stateObj.materialIndents;

  Object.defineProperty(stateObj, 'purchaseOrders', {
    get() { return this.procurement?.purchaseOrders || EMPTY_ARRAY; },
    set(val) { if (this.procurement) this.procurement.purchaseOrders = val; },
    configurable: true,
    enumerable: true
  });

  Object.defineProperty(stateObj, 'goodsReceipts', {
    get() { return this.procurement?.goodsReceiptNotes || EMPTY_ARRAY; },
    set(val) { if (this.procurement) this.procurement.goodsReceiptNotes = val; },
    configurable: true,
    enumerable: true
  });

  Object.defineProperty(stateObj, 'goodsReceiptNotes', {
    get() { return this.procurement?.goodsReceiptNotes || EMPTY_ARRAY; },
    set(val) { if (this.procurement) this.procurement.goodsReceiptNotes = val; },
    configurable: true,
    enumerable: true
  });

  Object.defineProperty(stateObj, 'purchaseIndents', {
    get() { return this.procurement?.materialIndents || EMPTY_ARRAY; },
    set(val) { if (this.procurement) this.procurement.materialIndents = val; },
    configurable: true,
    enumerable: true
  });

  Object.defineProperty(stateObj, 'materialIndents', {
    get() { return this.procurement?.materialIndents || EMPTY_ARRAY; },
    set(val) { if (this.procurement) this.procurement.materialIndents = val; },
    configurable: true,
    enumerable: true
  });

  // Normalize Indents
  if (Array.isArray(stateObj.procurement?.materialIndents)) {
    stateObj.procurement.materialIndents.forEach((ind: any) => {
      if (!ind.items || ind.items.length === 0) {
        ind.items = [{
          indentItemId: ind.id + "-ITEM",
          materialId: ind.materialId,
          materialName: ind.materialName,
          quantity: ind.requiredQuantity,
          requiredQuantity: ind.requiredQuantity,
          approvedQuantity: ind.approvedQuantity
        }];
      } else {
        ind.items.forEach((it: any) => {
          if (it.quantity !== undefined && it.requiredQuantity === undefined) it.requiredQuantity = it.quantity;
          if (it.requiredQuantity !== undefined && it.quantity === undefined) it.quantity = it.requiredQuantity;
        });
      }
    });
  }

  // Normalize POs
  if (Array.isArray(stateObj.procurement?.purchaseOrders)) {
    stateObj.procurement.purchaseOrders.forEach((po: any) => {
      if (Array.isArray(po.items)) {
        po.items.forEach((item: any) => {
          if (item.orderedQuantity !== undefined && item.orderedQty === undefined) item.orderedQty = item.orderedQuantity;
          if (item.orderedQty !== undefined && item.orderedQuantity === undefined) item.orderedQuantity = item.orderedQty;
          if (item.unitRate !== undefined && item.rate === undefined) item.rate = item.unitRate;
          if (item.rate !== undefined && item.unitRate === undefined) item.unitRate = item.rate;

          // Calculate remainingSupplyQty dynamically based on APPROVED GRNs
          const poGRNs = (stateObj.procurement?.goodsReceiptNotes || []).filter((g: any) => g.poId === po.id && g.grnType !== 'REPLACEMENT' && !g.isReplacementGRN && (g.status === 'FINANCE_AUDIT_APPROVED' || g.status === 'FINANCE_APPROVED'));
          const cumulativeAccepted = poGRNs.reduce((sum: number, g: any) => {
            const gItem = (g.items || []).find((it: any) => it.materialId === item.materialId);
            return sum + Number(gItem?.acceptedQuantity || gItem?.acceptedQty || 0);
          }, 0);
          const cumulativeDelivered = (stateObj.procurement?.goodsReceiptNotes || []).filter((g: any) => g.poId === po.id && g.grnType !== 'REPLACEMENT' && !g.isReplacementGRN).reduce((sum: number, g: any) => {
            const gItem = (g.items || []).find((it: any) => it.materialId === item.materialId);
            return sum + Number(gItem?.receivedQuantity || gItem?.receivedQty || gItem?.deliveredQty || 0);
          }, 0);
          const cumulativeRejected = (stateObj.procurement?.goodsReceiptNotes || []).filter((g: any) => g.poId === po.id && g.grnType !== 'REPLACEMENT' && !g.isReplacementGRN).reduce((sum: number, g: any) => {
            const gItem = (g.items || []).find((it: any) => it.materialId === item.materialId);
            return sum + Number(gItem?.rejectedQuantity || gItem?.rejectedQty || 0);
          }, 0);

          item.cumulativeAcceptedQty = cumulativeAccepted;
          item.cumulativeDeliveredQty = cumulativeDelivered;
          item.cumulativeRejectedQty = cumulativeRejected;
          item.remainingSupplyQty = Math.max(0, item.orderedQty - cumulativeAccepted);
        });
      }
    });
  }

  // Normalize GRNs
  if (Array.isArray(stateObj.procurement?.goodsReceiptNotes)) {
    stateObj.procurement.goodsReceiptNotes.forEach((grn: any) => {
      let internalStatus = grn.status;
      Object.defineProperty(grn, 'status', {
        get() {
          if (internalStatus === 'PENDING_FINANCE_AUDIT') return 'SUBMITTED_FOR_FINANCE_AUDIT';
          if (internalStatus === 'FINANCE_AUDIT_APPROVED') return 'FINANCE_APPROVED';
          return internalStatus;
        },
        set(val) {
          internalStatus = val;
        },
        configurable: true,
        enumerable: true
      });

      if (Array.isArray(grn.items)) {
        grn.items.forEach((item: any) => {
          if (item.receivedQuantity !== undefined && item.deliveredQty === undefined) item.deliveredQty = item.receivedQuantity;
          if (item.deliveredQty !== undefined && item.receivedQuantity === undefined) item.receivedQuantity = item.deliveredQty;
          if (item.acceptedQuantity !== undefined && item.acceptedQty === undefined) item.acceptedQty = item.acceptedQuantity;
          if (item.acceptedQty !== undefined && item.acceptedQuantity === undefined) item.acceptedQuantity = item.acceptedQty;
          if (item.rejectedQuantity !== undefined && item.rejectedQty === undefined) item.rejectedQty = item.rejectedQuantity;
          if (item.rejectedQty !== undefined && item.rejectedQuantity === undefined) item.rejectedQuantity = item.rejectedQty;
        });
      }
    });
  }

  return stateObj;
};

const persistToStorage = (state: any) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      setStorageItem('erp_procurement_data_version_2', '2');
      if (Array.isArray(state.materialRejections)) setStorageItem('erp_material_rejections', JSON.stringify(state.materialRejections));
      if (Array.isArray(state.procurementAuditLogs)) setStorageItem('erp_procurement_audit_logs', JSON.stringify(state.procurementAuditLogs));
      if (Array.isArray(state.procurementDocuments)) setStorageItem('erp_procurement_documents', JSON.stringify(state.procurementDocuments));
      if (Array.isArray(state.procurementNotifications)) setStorageItem('erp_procurement_notifications', JSON.stringify(state.procurementNotifications));
      if (Array.isArray(state.materialReplacementSchedules)) setStorageItem('erp_material_replacement_schedules', JSON.stringify(state.materialReplacementSchedules));
      if (Array.isArray(state.replacementReceipts)) setStorageItem('erp_replacement_receipts', JSON.stringify(state.replacementReceipts));
      
      if (state.procurement) {
        setStorageItem('erp_procurement', JSON.stringify(state.procurement));
        // Keep fallback keys updated for non-migrated or legacy reader pages
        setStorageItem('erp_material_indents', JSON.stringify(state.procurement.materialIndents || []));
        setStorageItem('erp_purchase_orders', JSON.stringify(state.procurement.purchaseOrders || []));
        setStorageItem('erp_goods_receipts', JSON.stringify(state.procurement.goodsReceiptNotes || []));
      }

      setStorageItem('erp_procurement_data_version', '1');

      // Check feature flags to strip data if backend write mode is enabled
      const salesToPersist = { ...state.sales };
      if (process.env.NEXT_PUBLIC_BACKEND_LEADS_WRITE === 'true') {
        salesToPersist.leads = [];
      }

      if (process.env.NEXT_PUBLIC_BACKEND_CUSTOMERS_WRITE !== 'true') {
        setStorageItem('erp_customers', JSON.stringify(state.customers || []));
      }

      // Canonical persisted store snapshot under required key
      const unifiedStoreSnapshot = {
        state: {
          procurement: state.procurement,
          sales: salesToPersist,
          production: state.production || { finishedGoods: [], workOrders: [], qcRecords: [] },
          dispatch: state.dispatch || { dispatchOrders: [], consignments: [] },
          finance: state.finance || { customerPayments: [], paymentFollowUps: [], paymentReceipts: [] },
          customRoles: state.customRoles || [],
          auditEvents: state.auditEvents || [],
          idSequences: state.idSequences || {},
        },
        version: MATERIAL_FLOW_STORE_VERSION,
      };
      setStorageItem('himalaya-erp-store', safeStringify(unifiedStoreSnapshot));
      
      if (Array.isArray(state.notifications)) {
        setStorageItem('erp_notifications', JSON.stringify(state.notifications));
      }
      if (Array.isArray(state.vendorReturns)) {
        setStorageItem('erp_vendor_returns', JSON.stringify(state.vendorReturns));
      }
      if (Array.isArray(state.vendorInvoices)) {
        setStorageItem('erp_vendor_invoices', JSON.stringify(state.vendorInvoices));
      }
      if (Array.isArray(state.vendorPayments)) {
        setStorageItem('erp_vendor_payments', JSON.stringify(state.vendorPayments));
      }
      if (Array.isArray(state.rawInventory)) {
        setStorageItem('erp_inventory', JSON.stringify(state.rawInventory));
      }
      if (Array.isArray(state.analysisRequests)) {
        setStorageItem('erp_analysis_requests_v1', JSON.stringify(state.analysisRequests));
      }
      if (Array.isArray(state.qcInspections)) {
        setStorageItem('erp_qc_inspections', JSON.stringify(state.qcInspections));
      }
      if (Array.isArray(state.employees)) {
        setStorageItem('erp_employees', JSON.stringify(state.employees));
      }
      if (Array.isArray(state.payrollBatches)) {
        setStorageItem('erp_payroll_batches_v2', JSON.stringify(state.payrollBatches));
      }
      if (Array.isArray(state.salaries)) {
        setStorageItem('erp_salaries_v2', JSON.stringify(state.salaries));
      }
      if (Array.isArray(state.payrollRuns)) {
        setStorageItem('erp_payroll_runs', JSON.stringify(state.payrollRuns));
      }
    }
  } catch (e: any) {
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
  const version = typeof window !== 'undefined' ? getStorageItem('erp_procurement_data_version_2') : '2';
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

  return 0;
};
// ─── Sales state migration helpers ───────────────────────────────────────────

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  const index = items.findIndex((current) => current.id === item.id);
  if (index === -1) {
    return [...items, item];
  }
  const next = [...items];
  next[index] = item;
  return next;
}

function mergeById<T extends { id: string }>(current: T[] = [], legacy: T[] = []): T[] {
  const records = new Map<string, T>();
  for (const record of legacy) {
    if (record?.id) records.set(record.id, record);
  }
  for (const record of current) {
    if (record?.id) {
      records.set(record.id, { ...(records.get(record.id) || {} as T), ...record });
    }
  }
  return [...records.values()];
}

function normalizeSalesState(sales?: any) {
  return {
    leads: Array.isArray(sales?.leads) ? sales.leads : [],
    samples: Array.isArray(sales?.samples) ? sales.samples : [],
    quotations: Array.isArray(sales?.quotations) ? sales.quotations : [],
    orders: Array.isArray(sales?.orders) ? sales.orders : [],
    paymentConfirmations: Array.isArray(sales?.paymentConfirmations) ? sales.paymentConfirmations : [],
    replacementRequests: Array.isArray(sales?.replacementRequests) ? sales.replacementRequests : [],
    returnRequests: Array.isArray(sales?.returnRequests) ? sales.returnRequests : [],
    customers: Array.isArray(sales?.customers) ? sales.customers : [],
  };
}

function normalizeFinanceState(finance?: any) {
  return {
    customerPayments: Array.isArray(finance?.customerPayments) ? finance.customerPayments : [],
    paymentFollowUps: Array.isArray(finance?.paymentFollowUps) ? finance.paymentFollowUps : [],
    paymentReceipts: Array.isArray(finance?.paymentReceipts) ? finance.paymentReceipts : [],
  };
}

function repairProductionWorkOrders(production: any, sales: any) {
  const normalizedProduction = {
    ...(production || {}),
    workOrders: Array.isArray(production?.workOrders) ? production.workOrders : [],
    qcRecords: Array.isArray(production?.qcRecords) ? production.qcRecords : [],
    finishedGoods: Array.isArray(production?.finishedGoods) ? production.finishedGoods : [],
  };
  const orders = Array.isArray(sales?.orders) ? sales.orders : [];

  return {
    ...normalizedProduction,
    workOrders: normalizedProduction.workOrders.map((workOrder: any) => {
      const derivedOrderId = String(workOrder.id || '').startsWith('WO-')
        ? String(workOrder.id).replace(/^WO-/, 'ORD-')
        : '';
      const order = orders.find((candidate: any) =>
        candidate.id === workOrder.orderId ||
        candidate.id === workOrder.orderNo ||
        candidate.id === derivedOrderId ||
        String(candidate.id || '').replace(/^(ORD|SO)-/, '') ===
          String(workOrder.id || '').replace(/^WO-/, '')
      );
      if (!order) return workOrder;

      const sourceItems = Array.isArray(workOrder.items) && workOrder.items.length
        ? workOrder.items
        : Array.isArray(order.items)
          ? order.items
          : [];
      const items = sourceItems.map((item: any, index: number) => ({
        ...item,
        orderLineId: item.orderLineId || item.id || `${order.id}-LINE-${index + 1}`,
        productId: item.productId || item.id || `PRODUCT-${index + 1}`,
        productName: item.productName || item.name || 'Product',
        specification: item.specification || item.productDetails || item.description || '',
        targetQuantity: Number(item.targetQuantity ?? item.quantity ?? item.qty ?? 0),
        unit: item.unit || 'Pcs',
      }));

      return {
        ...workOrder,
        orderId: order.id,
        customerName: workOrder.customerName || order.customerName,
        items,
        targetQuantity: Number(workOrder.targetQuantity) ||
          items.reduce((sum: number, item: any) => sum + Number(item.targetQuantity || 0), 0),
        unit: workOrder.unit || (items.length === 1 ? items[0].unit : 'Mixed'),
        targetDate: workOrder.targetDate || order.productionTargetDate || order.targetDate,
        priority: workOrder.priority || order.priority || 'MEDIUM',
        status: workOrder.status || 'WORK_ORDER_CREATED',
      };
    }),
  };
}

function migrateToUnifiedSalesState(persistedState: unknown, version: number): any {
  const old = persistedState as any;
  // If already at version 3+, just normalize arrays to be safe
  if (version >= 3) {
    return {
      ...old,
      state: {
        ...(old?.state || {}),
        sales: normalizeSalesState(old?.state?.sales),
      },
    };
  }
  // Older snapshots must not restore transactional arrays from legacy root keys.
  const oldState = old?.state || old || {};
  const migratedSales = {
    leads: Array.isArray(oldState.sales?.leads) ? oldState.sales.leads : [],
    samples: Array.isArray(oldState.sales?.samples) ? oldState.sales.samples : [],
    quotations: Array.isArray(oldState.sales?.quotations) ? oldState.sales.quotations : [],
    orders: Array.isArray(oldState.sales?.orders) ? oldState.sales.orders : [],
    paymentConfirmations: Array.isArray(oldState.sales?.paymentConfirmations) ? oldState.sales.paymentConfirmations : [],
    replacementRequests: Array.isArray(oldState.sales?.replacementRequests) ? oldState.sales.replacementRequests : [],
    returnRequests: Array.isArray(oldState.sales?.returnRequests) ? oldState.sales.returnRequests : [],
    customers: Array.isArray(oldState.sales?.customers) ? oldState.sales.customers : [],
  };
  // Remove legacy flat Sales arrays from root — they are now in state.sales
  const {
    leads: _l, samples: _s, quotations: _q, orders: _o,
    paymentConfirmations: _pc, replacementRequests: _rr, returnRequests: _ret,
    ...remainingState
  } = oldState;
  return {
    ...old,
    state: {
      ...remainingState,
      sales: migratedSales,
    },
  };
}
const safePersist = (store: any, updater: (state: any) => any) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    setStorageItem('erp_procurement_data_version_2', '2');
    if (Array.isArray(store.state.materialRejections)) setStorageItem('erp_material_rejections', JSON.stringify(store.state.materialRejections));
    if (Array.isArray(store.state.procurementAuditLogs)) setStorageItem('erp_procurement_audit_logs', JSON.stringify(store.state.procurementAuditLogs));
    if (Array.isArray(store.state.procurementDocuments)) setStorageItem('erp_procurement_documents', JSON.stringify(store.state.procurementDocuments));
    if (Array.isArray(store.state.procurementNotifications)) setStorageItem('erp_procurement_notifications', JSON.stringify(store.state.procurementNotifications));
    if (Array.isArray(store.state.materialReplacementSchedules)) setStorageItem('erp_material_replacement_schedules', JSON.stringify(store.state.materialReplacementSchedules));
    if (Array.isArray(store.state.replacementReceipts)) setStorageItem('erp_replacement_receipts', JSON.stringify(store.state.replacementReceipts));
  }
  const result = updater(store);
  if (result && result.state) {
    result.state = normalizeStateForStore(result.state);
  }
  return result;
};

const DEPARTMENTS = [
  { id: 'DEPT-SALES', code: 'Sales', name: 'Sales', status: 'ACTIVE' },
  { id: 'DEPT-PRODUCTION', code: 'Production', name: 'Production', status: 'ACTIVE' },
  { id: 'DEPT-PLANT_HEAD', code: 'Plant Head', name: 'Plant Head', status: 'ACTIVE' },
  { id: 'DEPT-STORE', code: 'Store', name: 'Store', status: 'ACTIVE' },
  { id: 'DEPT-DISPATCH', code: 'Dispatch', name: 'Dispatch', status: 'ACTIVE' },
  { id: 'DEPT-FINANCE', code: 'Finance', name: 'Finance', status: 'ACTIVE' },
  { id: 'DEPT-HR', code: 'HR', name: 'Human Resources', status: 'ACTIVE' },
  { id: 'DEPT-QC', code: 'QC', name: 'Quality Control', status: 'ACTIVE' },
  { id: 'DEPT-ENGINEERING', code: 'Engineering', name: 'Engineering', status: 'ACTIVE' },
  { id: 'DEPT-MARKETING', code: 'Marketing', name: 'Marketing', status: 'ACTIVE' },
  { id: 'DEPT-SUPPORT', code: 'Customer Support', name: 'Customer Support', status: 'ACTIVE' }
];

const getInitialStateFromStorage = () => {
  if (typeof window === 'undefined') {
    return normalizeStateForStore({
      workOrders: [], dispatches: [], payments: [], notifications: [], samples: [], rawInventory: [], customers: [], leads: [], quotations: [], purchaseIndents: [], purchaseOrders: [], goodsReceipts: [], vendorInvoices: [], vendorPayments: [], vendorReturns: [], analysisRequests: [], qcInspections: [], employees: [], payrollBatches: [], salaries: [], materialRejections: [], procurementAuditLogs: [], procurementDocuments: [], procurementNotifications: [], materialReplacementSchedules: [], replacementReceipts: [],
      production: { finishedGoods: [], workOrders: [], qcRecords: [] },
      procurement: { materialIndents: [] },
      sales: {
        leads: [],
        samples: [],
        quotations: [],
        orders: [],
        paymentConfirmations: [],
        replacementRequests: [],
        returnRequests: [],
      },
      finance: {
        customerPayments: [],
        paymentFollowUps: [],
        paymentReceipts: [],
      },
      customRoles: [],
      masterData: {
        departments: DEPARTMENTS
      }
    });
  }
  try {
    const getStorageList = (key: string) => {
      const data = getStorageItem(key);
      if (!data) return [];
      try { return JSON.parse(data) || []; } catch { return []; }
    };

    const readJSON = (key: string) => {
      const data = getStorageItem(key);
      if (!data) return null;
      try { return JSON.parse(data); } catch { return null; }
    };

    const storedProcurement = readJSON("erp_procurement");

    const deduplicateById = (arr: any[]) => {
      if (!Array.isArray(arr)) return [];
      const seen = new Set();
      return arr.filter((item: any) => {
        if (!item || !item.id) return false;
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    };

    const normalizeStatus = (status: string, type: 'indent' | 'po' | 'grn') => {
      if (!status) return type === 'indent' ? 'PENDING_PLANT_HEAD_APPROVAL' : (type === 'po' ? 'DRAFT' : 'PENDING_FINANCE_AUDIT');
      const s = status.toUpperCase();
      if (type === 'indent') {
        if (s === 'PENDING' || s === 'PENDING_APPROVAL') return 'PENDING_PLANT_HEAD_APPROVAL';
        if (s === 'APPROVED') return 'PLANT_HEAD_APPROVED';
        if (s === 'REJECTED') return 'PLANT_HEAD_REJECTED';
        if (s === 'CORRECTION' || s === 'CORRECTION_REQUIRED') return 'CORRECTION_REQUIRED';
        return s;
      }
      if (type === 'po') {
        if (s === 'PENDING' || s === 'PENDING_APPROVAL' || s === 'AWAITING_SUPER_ADMIN_APPROVAL') return 'PENDING_SUPER_ADMIN_APPROVAL';
        if (s === 'APPROVED') return 'SUPER_ADMIN_APPROVED';
        if (s === 'REJECTED') return 'SUPER_ADMIN_REJECTED';
        return s;
      }
      return s;
    };

    let rawIndents = storedProcurement?.materialIndents ?? readJSON("erp_material_indents") ?? [];
    let rawPOs = storedProcurement?.purchaseOrders ?? readJSON("erp_purchase_orders") ?? [];
    let rawGRNs = storedProcurement?.goodsReceiptNotes ?? readJSON("erp_goods_receipts") ?? [];

    const legacyIndents = readJSON("erp_purchase_indents") || [];
    const legacyPOs = readJSON("erp_purchase_orders") || [];
    const legacyGRNs = readJSON("erp_goods_receipts") || [];

    const DEFAULT_SEED_INDENTS = [
      {
        id: "IND-0001",
        materialId: "HCPPL039",
        materialCode: "HCPPL039",
        materialName: "SANDING MACHINE",
        currentStock: 0,
        minimumStock: 1,
        requestedQuantity: 2,
        requiredQuantity: 2,
        approvedQuantity: null,
        unit: "PCS",
        targetDate: "2026-08-10",
        requiredDate: "2026-08-10",
        priority: "HIGH",
        remarks: "Critical maintenance requirement for grinding section",
        source: "LOW_STOCK_ALERT",
        requestedByDepartment: "STORE",
        status: "PENDING_PLANT_HEAD_APPROVAL",
        poId: null,
        createdAt: new Date().toISOString(),
        items: [{ indentItemId: "IND-0001-ITEM-1", materialId: "HCPPL039", materialName: "SANDING MACHINE", quantity: 2, requiredQuantity: 2, approvedQuantity: null }]
      },
      {
        id: "IND-0002",
        materialId: "HCPPL026",
        materialCode: "HCPPL026",
        materialName: "GC WHEEL",
        currentStock: 0,
        minimumStock: 20,
        requestedQuantity: 40,
        requiredQuantity: 40,
        approvedQuantity: null,
        unit: "PCS",
        targetDate: "2026-08-12",
        requiredDate: "2026-08-12",
        priority: "HIGH",
        remarks: "Polishing line stock depletion alert",
        source: "LOW_STOCK_ALERT",
        requestedByDepartment: "STORE",
        status: "PENDING_PLANT_HEAD_APPROVAL",
        poId: null,
        createdAt: new Date().toISOString(),
        items: [{ indentItemId: "IND-0002-ITEM-1", materialId: "HCPPL026", materialName: "GC WHEEL", quantity: 40, requiredQuantity: 40, approvedQuantity: null }]
      },
      {
        id: "IND-0003",
        materialId: "HCPPL014",
        materialCode: "HCPPL014",
        materialName: "HIGH TENSILE STEEL SHEETS 3MM",
        currentStock: 50,
        minimumStock: 200,
        requestedQuantity: 500,
        requiredQuantity: 500,
        approvedQuantity: null,
        unit: "KG",
        targetDate: "2026-08-15",
        requiredDate: "2026-08-15",
        priority: "MEDIUM",
        remarks: "Raw material for upcoming batch WO-2026-08",
        source: "LOW_STOCK_ALERT",
        requestedByDepartment: "STORE",
        status: "PENDING_PLANT_HEAD_APPROVAL",
        poId: null,
        createdAt: new Date().toISOString(),
        items: [{ indentItemId: "IND-0003-ITEM-1", materialId: "HCPPL014", materialName: "HIGH TENSILE STEEL SHEETS 3MM", quantity: 500, requiredQuantity: 500, approvedQuantity: null }]
      }
    ];

    const mergedIndents = [...rawIndents, ...legacyIndents];
    const mergedPOs = [...rawPOs, ...legacyPOs];
    const mergedGRNs = [...rawGRNs, ...legacyGRNs];

    let materialIndents = deduplicateById(mergedIndents).map((ind: any) => ({
      ...ind,
      status: normalizeStatus(ind.status, 'indent')
    }));

    if (materialIndents.length === 0) {
      materialIndents = DEFAULT_SEED_INDENTS;
    }

    const purchaseOrders = deduplicateById(mergedPOs).map((po: any) => ({
      ...po,
      status: normalizeStatus(po.status, 'po')
    }));

    const goodsReceiptNotes = deduplicateById(mergedGRNs).map((grn: any) => ({
      ...grn,
      status: normalizeStatus(grn.status, 'grn')
    }));

    let procurement = {
      materialIndents,
      purchaseOrders,
      goodsReceiptNotes,
      vendorReturns: storedProcurement?.vendorReturns ?? [],
      vendorDisputes: storedProcurement?.vendorDisputes ?? [],
      procurementSchemaVersion: 2
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

    let sales: any = { leads: [], samples: [], quotations: [], orders: [], paymentConfirmations: [], replacementRequests: [], returnRequests: [] };
    let production: any = { finishedGoods: [], workOrders: [], qcRecords: [] };
    let dispatch: any = { dispatchOrders: [], consignments: [] };
    let idSequences: any = {};
    let finance: any = { customerPayments: [], paymentFollowUps: [], paymentReceipts: [] };
    let customRoles: any[] = [];
    try {
      const materialFlowCleanupKey = 'himalaya-material-flow-cleanup-version';
      const requiresMaterialFlowCleanup =
        getStorageItem(materialFlowCleanupKey) !== MATERIAL_FLOW_CLEANUP_VERSION;
      if (requiresMaterialFlowCleanup) {
        MATERIAL_FLOW_LEGACY_KEYS.forEach((key) => removeStorageItem(key));
        const savedSnapshot = getStorageItem('himalaya-erp-store');
        if (savedSnapshot) {
          try {
            const parsedSnapshot = JSON.parse(savedSnapshot);
            const savedState = parsedSnapshot.state || parsedSnapshot;
            setStorageItem('himalaya-erp-store', safeStringify({
              ...parsedSnapshot,
              state: {
                ...savedState,
                production: savedState.production || {},
              },
              version: MATERIAL_FLOW_STORE_VERSION,
            }));
          } catch {
            removeStorageItem('himalaya-erp-store');
          }
        }
        setStorageItem(materialFlowCleanupKey, MATERIAL_FLOW_CLEANUP_VERSION);
      }

      const resetVersionKey = 'himalaya-transactional-reset-version';
      const requiresTransactionalReset = getStorageItem(resetVersionKey) !== '5';
      if (requiresTransactionalReset) {
        [
          'himalaya-erp-store',
          'erp-storage',
          'erp_store',
          'erp_state',
          'erp_sales',
          'erp_leads',
          'sales_leads',
          'leads',
          'himalaya-erp',
          'himalaya-erp-storage',
          'erp_dispatches',
          'erp_reminders',
          'erp_qc_inspections',
        ].forEach((key) => removeStorageItem(key));
        window.sessionStorage?.clear();
        setStorageItem(resetVersionKey, '5');
      }

      const unified = requiresTransactionalReset
        ? null
        : getStorageItem('himalaya-erp-store');
      if (unified) {
        const parsed = JSON.parse(unified);
        const persisted = parsed.state || parsed;
        if (persisted.procurement) procurement = persisted.procurement;
        if (persisted.sales) sales = normalizeSalesState(persisted.sales);
        if (persisted.production) production = persisted.production;
        if (persisted.dispatch) dispatch = persisted.dispatch;
        if (persisted.idSequences) idSequences = persisted.idSequences;
        if (persisted.finance) finance = normalizeFinanceState(persisted.finance);
        if (persisted.customRoles) customRoles = persisted.customRoles;
        production = repairProductionWorkOrders(production, sales);
      }
      const browserSeedVersionKey = 'himalaya-ess-browser-seed-version';
      const shouldSeedESSLead =
        (!unified || sales.leads.length === 0) &&
        getStorageItem(browserSeedVersionKey) !== '2';
      if (shouldSeedESSLead) {
        const now = new Date().toISOString();
        sales = normalizeSalesState({
          ...sales,
          leads: [{
            id: 'LEAD-ESS-001',
            customerName: 'ESS Infrastructure Pvt Ltd',
            companyName: 'ESS Infrastructure Pvt Ltd',
            contactPerson: 'ESS Contact',
            mobile: '9876543210',
            phone: '9876543210',
            siteInchargeName: 'ESS Contact',
            siteInchargeMobile: '9876543210',
            officeContact: '',
            email: 'ess@example.com',
            projectName: 'ESS Highway Drainage Project',
            groupName: 'ESS Group',
            gstName: 'ESS Infrastructure Private Limited',
            gstNumber: '27AABCE1234F1Z5',
            billingAddress: 'Site No. 5, NH-44, Nagpur, Maharashtra, 440001, India',
            deliveryAddress: 'Site No. 5, NH-44, Nagpur, Maharashtra, 440001, India',
            address: {
              line1: 'Site No. 5, NH-44',
              city: 'Nagpur',
              state: 'Maharashtra',
              country: 'India',
              pincode: '440001',
            },
            requiredProducts: 'RCC Hume Pipe 600mm',
            expectedQuantities: '100 Pcs',
            detailedItems: [{
              productName: 'RCC Hume Pipe 600mm',
              specification: 'NP3 Grade, Grey, M30',
              quantity: 100,
              unitPrice: 1800,
              discount: 5,
              tax: 18,
            }],
            expectedTransportationCost: 2500,
            sampleRequired: false,
            sampleItems: [],
            sampleQuantity: 0,
            sampleExpectedDate: '',
            notes: 'ESS canonical browser workflow seed',
            salesperson: 'Sales User',
            createdBy: 'System Seed',
            status: 'LEAD_CREATED',
            createdAt: now,
            updatedAt: now,
          }],
        });
        setStorageItem(browserSeedVersionKey, '2');
        setStorageItem('himalaya-erp-store', safeStringify({
          state: {
            sales,
            production,
            dispatch,
            finance,
            customRoles,
            auditEvents: [],
            idSequences,
          },
          version: MATERIAL_FLOW_STORE_VERSION,
        }));
      }
    } catch (e) { }

    const rawInitial = {
      workOrders: [],
      dispatches: [],
      payments: [],
      notifications: getStorageList('erp_notifications'),
      samples: [],
      rawInventory: getStorageList('erp_inventory'),
      customers: getStorageList('erp_customers'),
      leads: [],
      quotations: [],
      vendorInvoices: getStorageList('erp_vendor_invoices'),
      vendorPayments: getStorageList('erp_vendor_payments'),
      analysisRequests: getStorageList('erp_analysis_requests_v1'),
      qcInspections: getStorageList('erp_qc_inspections'),
      procurement,
      employees,
      payrollBatches,
      payrollRuns: getStorageList('erp_payroll_runs'),
      salaries,
      sales,
      production,
      dispatch,
      finance,
      customRoles,
      idSequences,
      serverCache: {
        customers: [],
        customersLoaded: false,
        customersLoading: false,
        customersError: null,
        leads: [],
        leadsLoaded: false,
        leadsLoading: false,
        leadsError: null,
      },
      masterData: {
        departments: DEPARTMENTS
      }
    };
    return normalizeStateForStore(rawInitial);
  } catch {
    return normalizeStateForStore({
      workOrders: [], dispatches: [], payments: [], notifications: [], samples: [], rawInventory: [], customers: [], leads: [], quotations: [], purchaseIndents: [], purchaseOrders: [], goodsReceipts: [], vendorInvoices: [], vendorPayments: [], vendorReturns: [], analysisRequests: [], qcInspections: [], employees: [], payrollBatches: [], salaries: [], materialRejections: [], procurementAuditLogs: [], procurementDocuments: [], procurementNotifications: [], materialReplacementSchedules: [], replacementReceipts: [],
      procurement: { materialIndents: [] },
      sales: {
        leads: [], samples: [], quotations: [], orders: [], paymentConfirmations: [], replacementRequests: [], returnRequests: [],
      },
      production: { finishedGoods: [], workOrders: [], qcRecords: [] },
      finance: { customerPayments: [], paymentFollowUps: [], paymentReceipts: [] },
      idSequences: {},
      serverCache: {
        customers: [],
        customersLoaded: false,
        customersLoading: false,
        customersError: null,
        leads: [],
        leadsLoaded: false,
        leadsLoading: false,
        leadsError: null,
      },
      masterData: {
        departments: DEPARTMENTS
      }
    });
  }
};

const PAYMENT_TRANSITIONS: Record<string, string[]> = {
  NOT_SUBMITTED: [
    'FINANCE_EXECUTIVE_RECORDED',
    'FINANCE_VERIFICATION_PENDING',
  ],
  FINANCE_EXECUTIVE_RECORDED: [
    'FINANCE_VERIFICATION_PENDING',
  ],
  FINANCE_VERIFICATION_PENDING: [
    'FINANCE_VERIFIED',
    'FINANCE_REJECTED',
  ],
  FINANCE_REJECTED: [
    'FINANCE_VERIFICATION_PENDING',
  ],
  FINANCE_VERIFIED: [],
};

function assertPaymentTransition(from: string, to: string) {
  const allowed = PAYMENT_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid payment transition from ${from} to ${to}`);
  }
}

function recalculateOrderPaymentStatePure(state: any, orderId: string) {
  const sales = state.sales || { orders: [] };
  const order = sales.orders.find((o: any) => o.id === orderId);
  if (!order) return state;

  const verifiedAmount = (state.finance?.customerPayments || [])
    .filter(
      (payment: any) =>
        payment.orderId === orderId &&
        payment.verificationStatus === 'FINANCE_VERIFIED'
    )
    .reduce((sum: number, payment: any) => sum + payment.paymentAmount, 0);

  const orderTotal = Number(order.grandTotal ?? order.totalAmount ?? 0);
  const pendingAmount = Math.max(orderTotal - verifiedAmount, 0);

  let paymentStatus:
    | 'NOT_DUE'
    | 'PAYMENT_DUE'
    | 'PARTIALLY_PAID'
    | 'FULLY_PAID';

  if (verifiedAmount >= orderTotal && orderTotal > 0) {
    paymentStatus = 'FULLY_PAID';
  } else if (verifiedAmount > 0) {
    paymentStatus = 'PARTIALLY_PAID';
  } else {
    paymentStatus = (order.deliveryStatus === 'DELIVERED' || order.dispatchStatus === 'DELIVERED')
      ? 'PAYMENT_DUE'
      : 'NOT_DUE';
  }

  const shouldClose =
    (order.deliveryStatus === 'DELIVERED' || order.dispatchStatus === 'DELIVERED') &&
    paymentStatus === 'FULLY_PAID';

  const updatedOrders = sales.orders.map((o: any) => {
    if (o.id === orderId) {
      return {
        ...o,
        verifiedAmount,
        pendingAmount,
        paymentStatus,
        orderClosureStatus: shouldClose
          ? 'ORDER_CLOSED'
          : o.orderClosureStatus === 'ORDER_CLOSED'
            ? 'OPEN'
            : o.orderClosureStatus,
      };
    }
    return o;
  });

  return {
    ...state,
    sales: {
      ...sales,
      orders: updatedOrders
    }
  };
}

function generateVerifiedPaymentReceiptPure(state: any, paymentId: string, actor: any) {
  const customerPayments = state.finance?.customerPayments || [];
  const paymentReceipts = state.finance?.paymentReceipts || [];
  const payment = customerPayments.find((p: any) => p.id === paymentId);

  if (!payment) return state;
  if (payment.verificationStatus !== 'FINANCE_VERIFIED') {
    throw new Error('A receipt cannot be generated for a pending or rejected payment.');
  }

  // Idempotent check
  if (paymentReceipts.some((receipt: any) => receipt.paymentId === paymentId)) {
    return state;
  }

  const order = (state.sales?.orders || []).find((o: any) => o.id === payment.orderId);
  if (!order) return state;

  // Scan highest receipt number to generate receiptNumber format #RCPT1, #RCPT2
  const highestReceiptNo = paymentReceipts.reduce((highest: number, r: any) => {
    const match = r.receiptNumber.match(/#RCPT(\d+)/);
    if (match) {
      highest = Math.max(highest, Number(match[1]));
    }
    return highest;
  }, 0);
  const receiptNumber = `#RCPT${highestReceiptNo + 1}`;

  const verifiedPaidBefore = customerPayments
    .filter((p: any) => p.orderId === payment.orderId && p.id !== paymentId && p.verificationStatus === 'FINANCE_VERIFIED')
    .reduce((sum: number, p: any) => sum + p.paymentAmount, 0);

  const totalInvoiceAmount = Number(order.grandTotal ?? order.totalAmount ?? 0);
  const remainingBalance = Math.max(totalInvoiceAmount - (verifiedPaidBefore + payment.paymentAmount), 0);

  const newReceipt: any = {
    id: `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    receiptNumber,
    paymentId,
    orderId: payment.orderId,
    invoiceNumber: payment.invoiceId || 'Pending',
    customerName: payment.customerName,
    customerAddress: order.deliveryAddress,
    paymentDate: payment.paymentDate,
    paymentAmount: payment.paymentAmount,
    paymentMode: payment.paymentMode,
    transactionReference: payment.transactionReference || payment.chequeNumber || payment.referenceNumber || '',
    totalInvoiceAmount,
    previouslyPaidAmount: verifiedPaidBefore,
    currentPaymentAmount: payment.paymentAmount,
    remainingBalance,
    collectedBy: payment.recordedBy,
    verifiedBy: payment.verifiedBy || actor.name,
    companyDetails: 'Himalaya Concrete Products Pvt Ltd, Plot No. 12, MIDC, Nagpur',
    authorizedSignature: 'Authorized Representative',
    createdAt: new Date().toISOString()
  };

  const receiptHistoryEntry = {
    id: `HST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action: 'RECEIPT_GENERATED' as const,
    actorId: actor.id || actor.name,
    actorName: actor.name,
    actorRole: actor.role || actor.name,
    remarks: `Receipt ${receiptNumber} generated`,
    createdAt: new Date().toISOString()
  };

  const updatedPayments = customerPayments.map((p: any) => {
    if (p.id === paymentId) {
      return {
        ...p,
        history: [...p.history, receiptHistoryEntry]
      };
    }
    return p;
  });

  return {
    ...state,
    finance: {
      ...state.finance,
      customerPayments: updatedPayments,
      paymentReceipts: [...paymentReceipts, newReceipt]
    }
  };
}

export const useERPStore = create((set: any, get: any) => ({
  state: getInitialStateFromStorage(),
  setState: (newState: any) => {
    const normalized = normalizeStateForStore(newState);
    const currentState = get().state;
    if (deepEqual(normalized, currentState)) {
      return;
    }
    persistToStorage(normalized);
    set({ state: normalized });
  },
  replaceCustomerCache: (customers: any[]) => {
    set((current: any) => ({
      state: {
        ...current.state,
        serverCache: {
          ...(current.state?.serverCache || {}),
          customers,
          customersLoaded: true
        }
      }
    }));
  },
  replaceLeadCache: (leads: any[]) => {
    set((current: any) => ({
      state: {
        ...current.state,
        serverCache: {
          ...(current.state?.serverCache || {}),
          leads,
          leadsLoaded: true
        }
      }
    }));
  },
  upsertServerCustomer: (customer: any) => {
    set((current: any) => {
      const customers = current.state?.serverCache?.customers || [];
      const updated = upsertById(customers, customer);
      return {
        state: {
          ...current.state,
          serverCache: {
            ...(current.state?.serverCache || {}),
            customers: updated,
            customersLoaded: true
          }
        }
      };
    });
  },
  removeServerCustomer: (id: string) => {
    set((current: any) => {
      const customers = current.state?.serverCache?.customers || [];
      const updated = customers.filter((c: any) => c.id !== id);
      return {
        state: {
          ...current.state,
          serverCache: {
            ...(current.state?.serverCache || {}),
            customers: updated
          }
        }
      };
    });
  },
  upsertServerLead: (lead: any) => {
    set((current: any) => {
      const leads = current.state?.serverCache?.leads || [];
      const updated = upsertById(leads, lead);
      return {
        state: {
          ...current.state,
          serverCache: {
            ...(current.state?.serverCache || {}),
            leads: updated,
            leadsLoaded: true
          }
        }
      };
    });
  },
  removeServerLead: (id: string) => {
    set((current: any) => {
      const leads = current.state?.serverCache?.leads || [];
      const updated = leads.filter((l: any) => l.id !== id);
      return {
        state: {
          ...current.state,
          serverCache: {
            ...(current.state?.serverCache || {}),
            leads: updated
          }
        }
      };
    });
  },
  setCustomersLoading: (loading: boolean) => {
    set((current: any) => ({
      state: {
        ...current.state,
        serverCache: {
          ...(current.state?.serverCache || {}),
          customersLoading: loading
        }
      }
    }));
  },
  setCustomersError: (error: string | null) => {
    set((current: any) => ({
      state: {
        ...current.state,
        serverCache: {
          ...(current.state?.serverCache || {}),
          customersError: error
        }
      }
    }));
  },
  setLeadsLoading: (loading: boolean) => {
    set((current: any) => ({
      state: {
        ...current.state,
        serverCache: {
          ...(current.state?.serverCache || {}),
          leadsLoading: loading
        }
      }
    }));
  },
  setLeadsError: (error: string | null) => {
    set((current: any) => ({
      state: {
        ...current.state,
        serverCache: {
          ...(current.state?.serverCache || {}),
          leadsError: error
        }
      }
    }));
  },
  generateEntityId: (type: EntityIdType) => {
    const prefix = ENTITY_ID_PREFIXES[type];
    let generatedId = '';

    set((state: any) => {
      let currentSequence = Number(state.state?.idSequences?.[type]) || 0;

      // Fallback: If 0, scan records to find the actual highest to avoid duplicates from old data
      if (currentSequence === 0) {
        let existingRecords: any[] = [];
        // Map type to state array
        switch (type) {
          case 'lead': existingRecords = state.state?.sales?.leads || []; break;
          case 'quotation': existingRecords = state.state?.sales?.quotations || []; break;
          case 'sample': existingRecords = state.state?.sales?.samples || []; break;
          case 'order': existingRecords = state.state?.sales?.orders || []; break;
          case 'workOrder': existingRecords = state.state?.production?.workOrders || []; break;
          case 'batch': existingRecords = state.state?.production?.finishedGoods || []; break;
          case 'storeRelease': existingRecords = state.state?.dispatch?.storeReleases || []; break; // Note: may not map 1:1, but safe to scan
          case 'materialIssue': existingRecords = state.state?.production?.materialIssues || []; break;
          case 'dispatch': existingRecords = state.state?.dispatch?.dispatchOrders || []; break;
          case 'returnRequest': existingRecords = state.state?.sales?.returnRequests || []; break;
          case 'replacementRequest': existingRecords = state.state?.sales?.replacementRequests || []; break;
          case 'purchaseIndent': existingRecords = state.state?.purchaseIndents || []; break;
          case 'purchaseOrder': existingRecords = state.state?.purchaseOrders || []; break;
          case 'grn': existingRecords = state.state?.goodsReceipts || []; break;
          case 'vendorReturn': existingRecords = state.state?.vendorReturns || []; break;
          case 'complaint': existingRecords = state.state?.complaints || []; break;
          case 'payrollRun': existingRecords = state.state?.payrollRuns || []; break;
          case 'payment': existingRecords = state.state?.sales?.paymentConfirmations || []; break;
          case 'qcInspection': existingRecords = state.state?.qcInspections || []; break;
          case 'analysisRequest': existingRecords = state.state?.analysisRequests || []; break;
          case 'audit': existingRecords = state.state?.auditEvents || []; break;
          case 'notification': existingRecords = state.state?.notifications || []; break;
        }
        
        const scanNextId = getNextEntityId(type, existingRecords);
        const match = scanNextId.match(/\d+$/);
        currentSequence = match ? (Number(match[0]) - 1) : 0;
      }

      const nextSequence = currentSequence + 1;
      generatedId = `${prefix}${nextSequence}`;

      // Update state and call persistToStorage
      const newState = {
        ...state.state,
        idSequences: {
          ...(state.state?.idSequences || {}),
          [type]: nextSequence,
        },
      };

      persistToStorage(newState);

      return { state: newState };
    });

    return generatedId;
  },
  resetTransactionalData: () => {
    const store: any = (useERPStore as any).getState();
    const current = store.state || {};
    const {
      leads: _legacyLeads,
      samples: _legacySamples,
      quotations: _legacyQuotations,
      orders: _legacyOrders,
      workOrders: _legacyWorkOrders,
      dispatches: _legacyDispatches,
      payments: _legacyPayments,
      qcInspections: _legacyQC,
      ...nonTransactional
    } = current;
    store.setState({
      ...nonTransactional,
      sales: {
        leads: [],
        samples: [],
        quotations: [],
        orders: [],
        customers: [],
        paymentConfirmations: [],
        replacementRequests: [],
        returnRequests: [],
      },
      production: {
        workOrders: [],
        productionEntries: [],
        qcRecords: [],
        finishedGoods: [],
        reworkEntries: [],
        scrapEntries: [],
      },
      qc: {
        inspections: [],
        certificates: [],
      },
      dispatch: {
        dispatchOrders: [],
        consignments: [],
        sampleDispatches: [],
        returns: [],
        replacements: [],
      },
      finance: {
        invoices: [],
        payments: [],
        paymentVerification: [],
        receipts: [],
      },
      auditEvents: [],
      auditLogs: [],
      notifications: [],
    });
  },

  // ─── Hydration flag ─────────────────────────────────────────────────────
  hasHydrated: false,
  setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

  // ─── Custom Roles Actions ────────────────────────────────────────────────
  customRolesActions: {
    addCustomRole: (roleData: any) => {
      const store: any = (useERPStore as any).getState();
      const currentState = store.state;
      const newRole = { ...roleData, id: `ROLE-${Date.now()}` };
      const newState = {
        ...currentState,
        customRoles: [...(currentState.customRoles || []), newRole]
      };
      store.setState(newState);
      return newRole.id;
    },
    updateCustomRole: (id: string, updates: any) => {
      const store: any = (useERPStore as any).getState();
      const currentState = store.state;
      const customRoles = currentState.customRoles || [];
      const newState = {
        ...currentState,
        customRoles: customRoles.map((r: any) => r.id === id ? { ...r, ...updates } : r)
      };
      store.setState(newState);
    },
    deleteCustomRole: (id: string) => {
      const store: any = (useERPStore as any).getState();
      const currentState = store.state;
      const customRoles = currentState.customRoles || [];
      const newState = {
        ...currentState,
        customRoles: customRoles.filter((r: any) => r.id !== id)
      };
      store.setState(newState);
    }
  },

  // ─── Sales domain actions (grouped namespace) ────────────────────────────
  // Usage: const createLead = useERPStore(s => s.salesActions.createLead);
  salesActions: {
    createLead: (payload: any, actorName = 'Sales User') => {
      if (process.env.NEXT_PUBLIC_BACKEND_LEADS_WRITE === 'true') {
        throw new Error('Legacy Lead mutation (createLead) was called while backend writes are enabled.');
      }
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const [newState, id] = SalesActions.createLead(store.state, payload, actor);
      store.setState(newState);
      return id;
    },
    requestSample: (payload: any, actorName = 'Sales User') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const [newState, id] = SalesActions.requestSample(store.state, payload, actor);
      store.setState(newState);
      return id;
    },
    updateLeadStatus: (leadId: string, status: any, actorName = 'Sales User') => {
      const actor = { id: actorName, name: actorName, department: 'Sales' };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.updateLeadStatus(store.state, leadId, status, actor);
      store.setState(newState);
    },
    createQuotation: (payload: any, actorName = 'Sales User') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const [newState, id] = SalesActions.createQuotation(store.state, payload, actor);
      store.setState(newState);
      return id;
    },
    updateQuotationStatus: (quotationId: string, status: any, actorName = 'Sales User') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.updateQuotationStatus(store.state, quotationId, status, actor);
      store.setState(newState);
    },
    convertQuotationToOrder: (quotationId: string, actorName = 'Sales User') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const [newState, orderId] = SalesActions.convertQuotationToOrder(
        store.state,
        quotationId,
        actor
      );
      store.setState(newState);
      return orderId;
    },
    sendOrderToPlantHead: (orderId: string, payload: any, actorName = 'Sales User') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.sendOrderToPlantHead(store.state, orderId, payload, actor);
      store.setState(newState);
    },
    acceptOrderByPlantHead: (orderId: string, payload: any, actorName = 'Plant Head') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.acceptOrderByPlantHead(store.state, orderId, payload, actor);
      store.setState(newState);
    },
    rejectOrderByPlantHead: (orderId: string, payload: any, actorName = 'Plant Head') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.rejectOrderByPlantHead(store.state, orderId, payload, actor);
      store.setState(newState);
    },
    planOrder: (orderId: string, payload: any, actorName = 'Plant Head') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.planOrder(store.state, orderId, payload, actor);
      store.setState(newState);
    },
    activateWorkOrder: (orderId: string, actorName = 'Production') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.activateWorkOrder(store.state, orderId, actor);
      store.setState(newState);
    },
    startProduction: (workOrderId: string, actorName = 'Production') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.startProduction(store.state, workOrderId, actor);
      store.setState(newState);
    },
    completeProduction: (workOrderId: string, payload: any = {}, actorName = 'Production') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.completeProduction(store.state, workOrderId, payload, actor);
      store.setState(newState);
    },
    approveQC: (workOrderId: string, payload: any = {}, actorName = 'QC') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.approveQC(store.state, workOrderId, payload, actor);
      store.setState(newState);
    },
    rejectQC: (workOrderId: string, payload: any, actorName = 'QC') => {
      const actor = { id: actorName, name: actorName, department: 'QC' };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.rejectQC(store.state, workOrderId, payload, actor);
      store.setState(newState);
    },
    createDispatch: (orderId: string, data: any, actorName = 'Dispatch') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.createDispatch(store.state, orderId, data, actor);
      store.setState(newState);
    },
    startDispatchTransit: (orderId: string, actorName = 'Dispatch') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.startDispatchTransit(store.state, orderId, actor);
      store.setState(newState);
    },
    confirmDelivery: (orderId: string, actorName = 'Dispatch') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.confirmDelivery(store.state, orderId, actor);
      store.setState(newState);
    },
    recordSalesPayment: (orderId: string, payload: any, actorName = 'Sales User') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const [newState, id] = SalesActions.recordSalesPayment(store.state, orderId, payload, actor);
      store.setState(newState);
      return id;
    },
    verifyFinancePayment: (confirmationId: string, actorName = 'Finance') => {
      const actor = { id: actorName, name: actorName, department: 'Finance' };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.verifyFinancePayment(store.state, confirmationId, actor);
      store.setState(newState);
    },
    rejectFinancePayment: (confirmationId: string, remarks: string, actorName = 'Finance') => {
      const actor = { id: actorName, name: actorName, department: 'Finance' };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.rejectFinancePayment(store.state, confirmationId, remarks, actor);
      store.setState(newState);
    },
    requestReplacement: (payload: any, actorName = 'Sales User') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const [newState, id] = SalesActions.requestReplacement(store.state, payload, actor);
      store.setState(newState);
      return id;
    },
    approveReplacement: (requestId: string, remarks: string, actorName = 'Plant Head') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.approveReplacement(store.state, requestId, remarks, actor);
      store.setState(newState);
    },
    requestReturn: (payload: any, actorName = 'Sales User') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const [newState, id] = SalesActions.requestReturn(store.state, payload, actor);
      store.setState(newState);
      return id;
    },
    approveReturn: (requestId: string, remarks: string, actorName = 'Plant Head') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.approveReturn(store.state, requestId, remarks, actor);
      store.setState(newState);
    },
    assignReturnPickup: (returnId: string, payload: any, actorName = 'Dispatch') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.assignReturnPickup(store.state, returnId, payload, actor);
      store.setState(newState);
    },
    startReturnTransit: (returnId: string, actorName = 'Dispatch') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.startReturnTransit(store.state, returnId, actor);
      store.setState(newState);
    },
    confirmReturnReceipt: (returnId: string, payload: any, actorName = 'Dispatch') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.confirmReturnReceipt(store.state, returnId, payload, actor);
      store.setState(newState);
    },
    rejectReplacement: (requestId: string, remarks: string, actorName = 'Plant Head') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.rejectReplacement(store.state, requestId, remarks, actor);
      store.setState(newState);
    },
    dispatchReplacement: (requestId: string, payload: any, actorName = 'Dispatch') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.dispatchReplacement(store.state, requestId, payload, actor);
      store.setState(newState);
    },
    startReplacementTransit: (requestId: string, actorName = 'Dispatch') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.startReplacementTransit(store.state, requestId, actor);
      store.setState(newState);
    },
    confirmReplacementDelivery: (requestId: string, payload: any, actorName = 'Dispatch') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.confirmReplacementDelivery(store.state, requestId, payload, actor);
      store.setState(newState);
    },
    rejectReturn: (requestId: string, remarks: string, actorName = 'Plant Head') => {
      const actor = { id: actorName, name: actorName };
      const store: any = (useERPStore as any).getState();
      const newState = SalesActions.rejectReturn(store.state, requestId, remarks, actor);
      store.setState(newState);
    },
  },

  finance: {
    // Getters for live data
    get customerPayments() { return (useERPStore as any).getState().state.finance?.customerPayments || []; },
    get paymentFollowUps() { return (useERPStore as any).getState().state.finance?.paymentFollowUps || []; },
    get paymentReceipts() { return (useERPStore as any).getState().state.finance?.paymentReceipts || []; },

    // Action methods
    recordCustomerPayment: (payload: any, actor: any) => {
      if (!can(actor, 'canCollectPayment')) {
        throw new Error('Permission denied: Unauthorized to collect payments.');
      }
      const store: any = (useERPStore as any).getState();
      const state = store.state;
      const customerPayments = state.finance?.customerPayments || [];
      const amount = Number(payload.paymentAmount || 0);
      if (amount <= 0) {
        throw new Error('Payment amount must be greater than zero.');
      }
      const orderId = payload.orderId;
      const order = (state.sales?.orders || []).find((o: any) => o.id === orderId);
      if (!order) throw new Error(`Order ${orderId} not found.`);
      const orderTotal = Number(order.grandTotal ?? order.totalAmount ?? 0);
      const verifiedBefore = customerPayments
        .filter((p: any) => p.orderId === orderId && p.verificationStatus === 'FINANCE_VERIFIED')
        .reduce((sum: number, p: any) => sum + p.paymentAmount, 0);
      const remainingBefore = Math.max(orderTotal - verifiedBefore, 0);
      if (amount > remainingBefore) {
        throw new Error(`Payment amount exceeds the remaining order balance of ₹${remainingBefore}.`);
      }
      const normalizedReference = payload.transactionReference?.trim().toUpperCase();
      if (normalizedReference) {
        const duplicate = customerPayments.some((p: any) =>
          p.paymentMode === payload.paymentMode &&
          p.transactionReference?.trim().toUpperCase() === normalizedReference &&
          p.paymentAmount === amount &&
          p.paymentDate === payload.paymentDate
        );
        if (duplicate) throw new Error('Duplicate transaction reference detected.');
      }
      if (payload.paymentMode === 'Cheque') {
        const duplicate = customerPayments.some((p: any) =>
          p.paymentMode === 'Cheque' &&
          p.bankName === payload.bankName &&
          p.chequeNumber === payload.chequeNumber &&
          p.paymentAmount === amount
        );
        if (duplicate) throw new Error('Duplicate cheque payment detected.');
      }
      const highestPaymentNo = customerPayments.reduce((highest: number, p: any) => {
        const match = p.id.match(/PMT(\d+)/);
        if (match) highest = Math.max(highest, Number(match[1]));
        return highest;
      }, 0);
      const paymentId = `PMT${highestPaymentNo + 1}`;
      let verificationStatus: any = 'FINANCE_EXECUTIVE_RECORDED';
      if (payload.source === 'SALES') {
        verificationStatus = 'FINANCE_VERIFICATION_PENDING';
      } else if (payload.source === 'FINANCE') {
        verificationStatus = 'FINANCE_VERIFICATION_PENDING';
      }
      const newPayment: any = {
        id: paymentId,
        orderId,
        invoiceId: payload.invoiceId || order.invoiceId || 'Pending',
        customerId: order.customer?.id || order.customerId || 'CUST-UNKNOWN',
        customerName: order.customerName,
        paymentAmount: amount,
        paymentDate: payload.paymentDate || new Date().toISOString().split('T')[0],
        paymentMode: payload.paymentMode,
        bankName: payload.bankName,
        transactionReference: payload.transactionReference,
        chequeNumber: payload.chequeNumber,
        referenceNumber: payload.referenceNumber,
        paymentProof: payload.paymentProof || [],
        remarks: payload.remarks || '',
        source: payload.source || 'FINANCE_EXECUTIVE',
        recordedBy: actor.name,
        recordedAt: new Date().toISOString(),
        verificationStatus,
        revision: 1,
        history: []
      };
      const historyEntry = {
        id: `HST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        action: 'PAYMENT_RECORDED' as const,
        toStatus: verificationStatus,
        actorId: actor.id || actor.name,
        actorName: actor.name,
        actorRole: actor.role || actor.name,
        remarks: payload.remarks || 'Payment recorded',
        createdAt: new Date().toISOString()
      };
      newPayment.history.push(historyEntry);
      const updatedPayments = [newPayment, ...customerPayments];
      const updatedOrders = state.sales.orders.map((o: any) => {
        if (o.id === orderId) {
          const history = o.history || [];
          const newEvent = {
            id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            status: o.workflowStatus || o.status || 'ORDER_CONFIRMED',
            event: `Customer Payment Recorded (${paymentId})`,
            action: 'PAYMENT_RECORDED',
            timestamp: new Date().toISOString(),
            actor: actor.name,
            department: actor.role || 'Finance Executive',
            notes: `Amount: ₹${amount}, Mode: ${payload.paymentMode}`
          };
          return {
            ...o,
            history: [...history, newEvent],
            paymentStatus: verificationStatus
          };
        }
        return o;
      });
      const nextState = {
        ...state,
        sales: { ...state.sales, orders: updatedOrders },
        finance: { ...state.finance, customerPayments: updatedPayments }
      };
      store.setState(nextState);
      return paymentId;
    },
    updateRecordedPayment: (paymentId: string, payload: any, actor: any) => {
      if (!can(actor, 'canCollectPayment')) {
        throw new Error('Permission denied: Unauthorized to update payments.');
      }
      const store: any = (useERPStore as any).getState();
      const state = store.state;
      const customerPayments = state.finance?.customerPayments || [];
      const payment = customerPayments.find((p: any) => p.id === paymentId);
      if (!payment) throw new Error(`Payment ${paymentId} not found.`);
      if (payment.verificationStatus === 'FINANCE_VERIFIED') {
        throw new Error('Permission denied: A verified payment cannot be edited.');
      }
      const updated = {
        ...payment,
        paymentAmount: Number(payload.paymentAmount ?? payment.paymentAmount),
        paymentDate: payload.paymentDate ?? payment.paymentDate,
        paymentMode: payload.paymentMode ?? payment.paymentMode,
        bankName: payload.bankName ?? payment.bankName,
        transactionReference: payload.transactionReference ?? payment.transactionReference,
        chequeNumber: payload.chequeNumber ?? payment.chequeNumber,
        remarks: payload.remarks ?? payment.remarks,
        paymentProof: payload.paymentProof ?? payment.paymentProof
      };
      const nextState = {
        ...state,
        finance: { ...state.finance, customerPayments: customerPayments.map((p: any) => p.id === paymentId ? updated : p) }
      };
      store.setState(nextState);
    },
    submitCustomerPaymentToFinance: (paymentId: string, actor: any) => {
      if (!can(actor, 'canSubmitPaymentVerification')) {
        throw new Error('Permission denied: Unauthorized to submit payments to Finance.');
      }
      const store: any = (useERPStore as any).getState();
      const state = store.state;
      const customerPayments = state.finance?.customerPayments || [];
      const payment = customerPayments.find((p: any) => p.id === paymentId);
      if (!payment) throw new Error(`Payment ${paymentId} not found.`);
      assertPaymentTransition(payment.verificationStatus, 'FINANCE_VERIFICATION_PENDING');
      const historyEntry = {
        id: `HST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        action: 'SUBMITTED_TO_FINANCE' as const,
        fromStatus: payment.verificationStatus,
        toStatus: 'FINANCE_VERIFICATION_PENDING' as const,
        actorId: actor.id || actor.name,
        actorName: actor.name,
        actorRole: actor.role || actor.name,
        remarks: 'Submitted to Finance for verification',
        createdAt: new Date().toISOString()
      };
      const updatedPayment = {
        ...payment,
        verificationStatus: 'FINANCE_VERIFICATION_PENDING' as const,
        submittedBy: actor.name,
        submittedAt: new Date().toISOString(),
        history: [...payment.history, historyEntry]
      };
      const nextState = {
        ...state,
        finance: { ...state.finance, customerPayments: customerPayments.map((p: any) => p.id === paymentId ? updatedPayment : p) }
      };
      store.setState(nextState);
    },
    verifyCustomerPayment: (paymentId: string, actor: any) => {
      if (!can(actor, 'canFinalVerifyPayment')) {
        throw new Error('Permission denied: Finance Executive cannot finally verify payments.');
      }
      const store: any = (useERPStore as any).getState();
      const state = store.state;
      const customerPayments = state.finance?.customerPayments || [];
      const payment = customerPayments.find((p: any) => p.id === paymentId);
      if (!payment) throw new Error(`Payment ${paymentId} not found.`);
      assertPaymentTransition(payment.verificationStatus, 'FINANCE_VERIFIED');
      const orderId = payment.orderId;
      const order = (state.sales?.orders || []).find((o: any) => o.id === orderId);
      if (!order) throw new Error(`Order ${orderId} not found.`);
      const orderTotal = Number(order.grandTotal ?? order.totalAmount ?? 0);
      const verifiedBefore = customerPayments
        .filter((p: any) => p.orderId === orderId && p.id !== paymentId && p.verificationStatus === 'FINANCE_VERIFIED')
        .reduce((sum: number, p: any) => sum + p.paymentAmount, 0);
      const remainingBefore = Math.max(orderTotal - verifiedBefore, 0);
      if (payment.paymentAmount <= 0) {
        throw new Error('Payment amount must be greater than zero.');
      }
      if (payment.paymentAmount > remainingBefore) {
        throw new Error(`Payment amount exceeds the remaining order balance of ₹${remainingBefore}.`);
      }
      const historyEntry = {
        id: `HST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        action: 'PAYMENT_VERIFIED' as const,
        fromStatus: payment.verificationStatus,
        toStatus: 'FINANCE_VERIFIED' as const,
        actorId: actor.id || actor.name,
        actorName: actor.name,
        actorRole: actor.role || actor.name,
        remarks: 'Payment verified successfully',
        createdAt: new Date().toISOString()
      };
      const updatedPayment = {
        ...payment,
        verificationStatus: 'FINANCE_VERIFIED' as const,
        verifiedBy: actor.name,
        verifiedAt: new Date().toISOString(),
        history: [...payment.history, historyEntry]
      };
      const updatedPayments = customerPayments.map((p: any) => p.id === paymentId ? updatedPayment : p);
      let nextState = {
        ...state,
        finance: { ...state.finance, customerPayments: updatedPayments }
      };
      nextState = recalculateOrderPaymentStatePure(nextState, orderId);
      nextState = generateVerifiedPaymentReceiptPure(nextState, paymentId, actor);
      store.setState(nextState);
    },
    rejectCustomerPayment: (paymentId: string, reason: string, actor: any) => {
      if (!can(actor, 'canRejectPaymentFinally')) {
        throw new Error('Permission denied: Unauthorized to reject payments.');
      }
      const store: any = (useERPStore as any).getState();
      const state = store.state;
      const customerPayments = state.finance?.customerPayments || [];
      const payment = customerPayments.find((p: any) => p.id === paymentId);
      if (!payment) throw new Error(`Payment ${paymentId} not found.`);
      assertPaymentTransition(payment.verificationStatus, 'FINANCE_REJECTED');
      const historyEntry = {
        id: `HST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        action: 'PAYMENT_REJECTED' as const,
        fromStatus: payment.verificationStatus,
        toStatus: 'FINANCE_REJECTED' as const,
        actorId: actor.id || actor.name,
        actorName: actor.name,
        actorRole: actor.role || actor.name,
        remarks: reason,
        createdAt: new Date().toISOString()
      };
      const updatedPayment = {
        ...payment,
        verificationStatus: 'FINANCE_REJECTED' as const,
        rejectedBy: actor.name,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
        correctionRequired: reason,
        history: [...payment.history, historyEntry]
      };
      const updatedPayments = customerPayments.map((p: any) => p.id === paymentId ? updatedPayment : p);
      let nextState = {
        ...state,
        finance: { ...state.finance, customerPayments: updatedPayments }
      };
      nextState = recalculateOrderPaymentStatePure(nextState, payment.orderId);
      store.setState(nextState);
    },
    correctRejectedPayment: (paymentId: string, updates: any, actor: any) => {
      if (!can(actor, 'canCollectPayment')) {
        throw new Error('Permission denied: Unauthorized to correct payments.');
      }
      const store: any = (useERPStore as any).getState();
      const state = store.state;
      const customerPayments = state.finance?.customerPayments || [];
      const payment = customerPayments.find((p: any) => p.id === paymentId);
      if (!payment) throw new Error(`Payment ${paymentId} not found.`);
      if (payment.verificationStatus !== 'FINANCE_REJECTED') {
        throw new Error('Payment must be in rejected status to correct.');
      }
      const historyEntry = {
        id: `HST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        action: 'CORRECTION_STARTED' as const,
        actorId: actor.id || actor.name,
        actorName: actor.name,
        actorRole: actor.role || actor.name,
        remarks: 'Payment details corrected',
        createdAt: new Date().toISOString()
      };
      const updatedPayment = {
        ...payment,
        ...updates,
        verificationStatus: 'FINANCE_REJECTED' as const,
        history: [...payment.history, historyEntry]
      };
      const nextState = {
        ...state,
        finance: { ...state.finance, customerPayments: customerPayments.map((p: any) => p.id === paymentId ? updatedPayment : p) }
      };
      store.setState(nextState);
    },
    resubmitCustomerPayment: (paymentId: string, actor: any) => {
      if (!can(actor, 'canCollectPayment')) {
        throw new Error('Permission denied: Unauthorized to resubmit payments.');
      }
      const store: any = (useERPStore as any).getState();
      const state = store.state;
      const customerPayments = state.finance?.customerPayments || [];
      const payment = customerPayments.find((p: any) => p.id === paymentId);
      if (!payment) throw new Error(`Payment ${paymentId} not found.`);
      assertPaymentTransition(payment.verificationStatus, 'FINANCE_VERIFICATION_PENDING');
      const historyEntry = {
        id: `HST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        action: 'PAYMENT_RESUBMITTED' as const,
        fromStatus: payment.verificationStatus,
        toStatus: 'FINANCE_VERIFICATION_PENDING' as const,
        actorId: actor.id || actor.name,
        actorName: actor.name,
        actorRole: actor.role || actor.name,
        remarks: 'Resubmitted to Finance',
        createdAt: new Date().toISOString()
      };
      const updatedPayment = {
        ...payment,
        verificationStatus: 'FINANCE_VERIFICATION_PENDING' as const,
        revision: payment.revision + 1,
        history: [...payment.history, historyEntry]
      };
      const nextState = {
        ...state,
        finance: { ...state.finance, customerPayments: customerPayments.map((p: any) => p.id === paymentId ? updatedPayment : p) }
      };
      store.setState(nextState);
    },
    addPaymentFollowUp: (payload: any, actor: any) => {
      const store: any = (useERPStore as any).getState();
      const state = store.state;
      const followUps = state.finance?.paymentFollowUps || [];
      const highestFollowUpNo = followUps.reduce((highest: number, f: any) => {
        const match = f.id.match(/FOL(\d+)/);
        if (match) highest = Math.max(highest, Number(match[1]));
        return highest;
      }, 0);
      const followUpId = `FOL${highestFollowUpNo + 1}`;
      const newFollowUp: any = {
        id: followUpId,
        customerId: payload.customerId,
        orderId: payload.orderId,
        invoiceNumber: payload.invoiceNumber,
        customerName: payload.customerName,
        outstandingAmount: payload.outstandingAmount ? Number(payload.outstandingAmount) : undefined,
        contactPerson: payload.contactPerson,
        phoneNumber: payload.phoneNumber,
        followUpDate: payload.followUpDate,
        contactMode: payload.contactMode,
        discussionSummary: payload.discussionSummary,
        customerResponse: payload.customerResponse,
        promisedAmount: payload.promisedAmount ? Number(payload.promisedAmount) : undefined,
        promisedPaymentDate: payload.promisedPaymentDate,
        nextFollowUpDate: payload.nextFollowUpDate,
        remarks: payload.remarks,
        recordedBy: actor.name,
        recordedAt: new Date().toISOString()
      };
      const updatedFollowUps = [newFollowUp, ...followUps];
      const updatedOrders = state.sales.orders.map((o: any) => {
        if (o.id === payload.orderId) {
          const history = o.history || [];
          const newEvent = {
            id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            status: o.workflowStatus || o.status || 'ORDER_CONFIRMED',
            event: `Customer Follow-up Added (${followUpId})`,
            action: 'FOLLOW_UP_ADDED',
            timestamp: new Date().toISOString(),
            actor: actor.name,
            department: actor.role || 'Finance Executive',
            notes: `Mode: ${payload.contactMode}, Response: ${payload.customerResponse}`
          };
          return { ...o, history: [...history, newEvent] };
        }
        return o;
      });
      const nextState = {
        ...state,
        sales: { ...state.sales, orders: updatedOrders },
        finance: { ...state.finance, paymentFollowUps: updatedFollowUps }
      };
      store.setState(nextState);
      return followUpId;
    },
    recordPaymentPromise: (payload: any, actor: any) => {
      return (useERPStore as any).getState().finance.addPaymentFollowUp({
        ...payload,
        customerResponse: 'Part Payment Promised'
      }, actor);
    },
    generateVerifiedPaymentReceipt: (paymentId: string, actor: any) => {
      const store: any = (useERPStore as any).getState();
      const state = store.state;
      const nextState = generateVerifiedPaymentReceiptPure(state, paymentId, actor);
      store.setState(nextState);
    },
    recalculateOrderPaymentState: (orderId: string) => {
      const store: any = (useERPStore as any).getState();
      const state = store.state;
      const nextState = recalculateOrderPaymentStatePure(state, orderId);
      store.setState(nextState);
    }
  },

  // ─── Flat top-level action methods ────────────────────────────
  createLead: (payload: any) => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.createLead(payload);
  },
  updateLeadStatus: (leadId: string, status: any, actorName = 'Sales User') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.updateLeadStatus(leadId, status, actorName);
  },
  createQuotation: (payload: any, actorName = 'Sales User') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.createQuotation(payload, actorName);
  },
  sendQuotation: (quotationId: string, actorName = 'Sales User') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.updateQuotationStatus(quotationId, 'QUOTATION_SENT', actorName);
  },
  createOrResumeQuotationFromLead: (leadId: string) => {
    const state = get();
    const leads = state.state?.sales?.leads || [];
    const lead = leads.find((item: any) => item.id === leadId || item.leadId === leadId);
    if (!lead) return { success: false, message: 'Lead not found.' };

    const quotations = state.state?.sales?.quotations || [];
    const existingQuotation = quotations.find(
      (item: any) => item.leadId === leadId && item.status !== 'CANCELLED' && item.status !== 'DELETED'
    );

    if (existingQuotation) {
      return { success: true, resumed: true, quotationId: existingQuotation.id || existingQuotation.quotationId };
    }

    const quotationId = get().generateEntityId('quotation');
    const quotationDraft = {
      id: quotationId,
      quotationId,
      leadId,
      companyName: lead.companyName || lead.customerName || lead.projectName || '',
      customerName: lead.companyName || lead.customerName || lead.projectName || '',
      contactPerson: lead.contactPerson || lead.siteInchargeName || '',
      phone: lead.phone || lead.mobile || lead.siteInchargeMobile || '',
      email: lead.email || '',
      items: [],
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((current: any) => ({
      state: {
        ...current.state,
        sales: {
          ...current.state.sales,
          quotations: [...(Array.isArray(current.state.sales.quotations) ? current.state.sales.quotations : []), quotationDraft],
        },
      }
    }));
    return { success: true, resumed: false, quotationId };
  },
  createOrResumeSampleFromLead: (leadId: string, leadObj?: any) => {
    const state = get();
    const leads = state.state?.sales?.leads || [];
    const lead = leadObj || leads.find((item: any) => item.id === leadId || item.leadId === leadId);
    if (!lead) return { success: false, message: 'Lead not found.' };

    const samples = state.state?.sales?.samples || [];
    const existingSample = samples.find(
      (item: any) => item.leadId === leadId && item.status !== 'CANCELLED' && item.status !== 'DELETED'
    );

    if (existingSample) {
      return { success: true, resumed: true, sampleId: existingSample.id || existingSample.sampleId };
    }

    const sampleId = get().generateEntityId('sample');
    const sampleDraft = {
      id: sampleId,
      sampleId,
      leadId,
      companyName: lead.companyName || lead.customerName || lead.projectName || '',
      customerName: lead.companyName || lead.customerName || lead.projectName || '',
      contactPerson: lead.contactPerson || lead.siteInchargeName || '',
      phone: lead.phone || lead.mobile || lead.siteInchargeMobile || '',
      email: lead.email || '',
      items: [],
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((current: any) => ({
      state: {
        ...current.state,
        sales: {
          ...current.state.sales,
          samples: [...(Array.isArray(current.state.sales.samples) ? current.state.sales.samples : []), sampleDraft],
        },
      }
    }));
    return { success: true, resumed: false, sampleId };
  },
  finalizeQuotation: (quotationId: string, payload: any) => {
    const state = get();
    const quotations = state.state?.sales?.quotations || [];
    const quotation = quotations.find((item: any) => item.id === quotationId || item.quotationId === quotationId);
    if (!quotation) return { success: false, message: 'Quotation not found.' };

    const leads = state.state?.sales?.leads || [];
    set((current: any) => ({
      state: {
        ...current.state,
        sales: {
          ...(current.state?.sales || {}),
          quotations: (current.state?.sales?.quotations || []).map((item: any) =>
            item.id === quotationId || item.quotationId === quotationId
              ? {
                  ...item,
                  ...payload,
                  status: 'QUOTATION_CREATED',
                  completedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
          leads: (current.state?.sales?.leads || []).map((lead: any) =>
            lead.id === quotation.leadId || lead.leadId === quotation.leadId
              ? {
                  ...lead,
                  status: 'QUOTATION_CREATED',
                  quotationId,
                  updatedAt: new Date().toISOString(),
                }
              : lead
          ),
        },
      }
    }));
    return { success: true, quotationId };
  },
  finalizeSample: (sampleId: string, payload: any) => {
    const state = get();
    const samples = state.state?.sales?.samples || [];
    const sample = samples.find((item: any) => item.id === sampleId || item.sampleId === sampleId);
    if (!sample) return { success: false, message: 'Sample not found.' };

    set((current: any) => ({
      state: {
        ...current.state,
        sales: {
          ...(current.state?.sales || {}),
          samples: (current.state?.sales?.samples || []).map((item: any) =>
            item.id === sampleId || item.sampleId === sampleId
              ? {
                  ...item,
                  ...payload,
                  status: 'SAMPLE_CREATED',
                  completedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
          leads: (current.state?.sales?.leads || []).map((lead: any) =>
            lead.id === sample.leadId || lead.leadId === sample.leadId
              ? {
                  ...lead,
                  status: 'SAMPLE_CREATED',
                  sampleId,
                  updatedAt: new Date().toISOString(),
                }
              : lead
          ),
        },
      }
    }));
    return { success: true, sampleId };
  },
  acceptQuotation: (quotationId: string, actorName = 'Sales User') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.updateQuotationStatus(quotationId, 'QUOTATION_APPROVED', actorName);
  },
  convertQuotationToOrder: (quotationId: string, actorName = 'Sales User') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.convertQuotationToOrder(quotationId, actorName);
  },
  sendOrderToPlantHead: (orderId: string, payload?: any, actorName = 'Sales User') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.sendOrderToPlantHead(orderId, payload, actorName);
  },
  acceptOrderByPlantHead: (orderId: string, payload?: any, actorName = 'Plant Head') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.acceptOrderByPlantHead(orderId, payload, actorName);
  },
  rejectOrderByPlantHead: (orderId: string, remarks?: string, actorName = 'Plant Head') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.rejectOrderByPlantHead(orderId, remarks, actorName);
  },
  planOrder: (orderId: string, payload?: any, actorName = 'Plant Head') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.planOrder(orderId, payload, actorName);
  },
  activateWorkOrder: (orderId: string, actorName = 'Production') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.activateWorkOrder(orderId, actorName);
  },
  startProduction: (workOrderId: string, actorName = 'Production') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.startProduction(workOrderId, actorName);
  },
  completeProduction: (workOrderId: string, payload?: any, actorName = 'Production') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.completeProduction(workOrderId, payload, actorName);
  },
  approveQC: (workOrderId: string, payload?: any, actorName = 'QC') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.approveQC(workOrderId, payload, actorName);
  },
  rejectQC: (workOrderId: string, payload: any, actorName = 'QC') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.rejectQC(workOrderId, payload, actorName);
  },
  sendFinishedGoodsToDispatch: (finishedGoodsId: string, selectedItems?: any[]) => {
    const store: any = (useERPStore as any).getState();
    const actor = { id: 'Dispatch', name: 'Dispatch' };
    const nextState = DispatchActions.sendFinishedGoodsToDispatch(store.state, finishedGoodsId, actor);
    store.setState(nextState);
    return nextState.dispatch.dispatchOrders.find((record: any) => record.finishedGoodsId === finishedGoodsId);
    /*
    const currentState = store.state;
    const finishedGoodsList = currentState.production?.finishedGoods || [];
    const finishedGoods = finishedGoodsList.find((record: any) => record.id === finishedGoodsId);

    if (!finishedGoods) {
      throw new Error("Finished goods record not found");
    }

    const existingQueueRecord = (currentState.dispatch?.dispatchOrders || []).find(
      (record: any) => record.finishedGoodsId === finishedGoodsId
    );

    if (existingQueueRecord) {
      return currentState;
    }

    const dispatchItems = finishedGoods.items.map((item: any) => {
      const selected = selectedItems?.find(
        (selectedItem: any) => selectedItem.orderLineId === item.orderLineId
      );

      const availableQuantity =
        Number(item.qcApprovedQuantity || 0) -
        Number(item.reservedQuantity || 0) -
        Number(item.dispatchedQuantity || 0);

      const quantity = selected ? Number(selected.quantity) : availableQuantity;

      if (quantity <= 0 || quantity > availableQuantity) {
        throw new Error(`Invalid dispatch quantity for ${item.productName}`);
      }

      return {
        orderLineId: item.orderLineId || `LINE-${item.productId || '1'}`,
        productId: item.productId || 'PROD-001',
        productName: item.productName || 'Product',
        approvedQuantity: Number(item.qcApprovedQuantity || 0),
        dispatchableQuantity: quantity,
        unit: item.unit || "Pcs"
      };
    });

    const dispatchOrder = {
      id: get().generateEntityId('dispatch'),
      finishedGoodsId: finishedGoods.id,
      batchId: finishedGoods.batchId,
      orderId: finishedGoods.orderId,
      customerName: finishedGoods.customerName,
      items: dispatchItems,
      status: "READY_FOR_DISPATCH",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedFGList = finishedGoodsList.map((record: any) =>
      record.id === finishedGoodsId
        ? {
            ...record,
            items: record.items.map((item: any) => {
              const selected = dispatchItems.find(
                (dispatchItem: any) => dispatchItem.orderLineId === item.orderLineId
              );
              if (!selected) return item;
              return {
                ...item,
                reservedQuantity: Number(item.reservedQuantity || 0) + selected.dispatchableQuantity
              };
            }),
            status: "SENT_TO_DISPATCH",
            updatedAt: new Date().toISOString()
          }
        : record
    );

    const updatedSalesOrders = (currentState.sales?.orders || []).map((o: any) => {
      if (o.id === finishedGoods.orderId || o.orderNo === finishedGoods.orderId) {
        return {
          ...o,
          dispatchStatus: "SENT_TO_DISPATCH",
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    const nextState = {
      ...currentState,
      production: {
        ...(currentState.production || {}),
        finishedGoods: updatedFGList
      },
      dispatch: {
        ...(currentState.dispatch || {}),
        dispatchOrders: [...(currentState.dispatch?.dispatchOrders || []), dispatchOrder]
      },
      sales: {
        ...(currentState.sales || {}),
        orders: updatedSalesOrders
      }
    };

    store.setState(nextState);
    return dispatchOrder;*/
  },

  createDispatch: (orderId: string, data?: any, actorName = 'Dispatch') => {
    const store: any = (useERPStore as any).getState();
    const actor = { id: actorName, name: actorName };
    const nextState = DispatchActions.createDispatch(store.state, orderId, data || {}, actor);
    store.setState(nextState);
    return nextState.dispatch.consignments.find((record: any) => record.dispatchOrderId === orderId);
    /*
    const currentState = store.state;
    const queueList = currentState.dispatch?.dispatchOrders || [];
    const queueRecord = queueList.find(
      (r: any) => r.id === orderId || r.finishedGoodsId === orderId || r.orderId === orderId
    );

    if (queueRecord) {
      const consignment = {
        id: get().generateEntityId('dispatch'),
        dispatchOrderId: queueRecord.id,
        finishedGoodsId: queueRecord.finishedGoodsId,
        orderId: queueRecord.orderId,
        batchId: queueRecord.batchId,
        customerName: queueRecord.customerName,
        items: queueRecord.items,
        vehicleNumber: data?.vehicleNumber || 'UK-07-1234',
        driverName: data?.driverName || 'Ramesh',
        driverMobile: data?.driverMobile || '9876543210',
        status: "DISPATCH_CREATED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedQueue = queueList.map((r: any) =>
        r.id === queueRecord.id ? { ...r, status: "DISPATCH_CREATED", updatedAt: new Date().toISOString() } : r
      );

      const updatedSalesOrders = (currentState.sales?.orders || []).map((o: any) => {
        if (o.id === queueRecord.orderId || o.orderNo === queueRecord.orderId) {
          return {
            ...o,
            dispatchStatus: "DISPATCH_CREATED",
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      });

      const nextState = {
        ...currentState,
        dispatch: {
          ...(currentState.dispatch || {}),
          dispatchOrders: updatedQueue,
          consignments: [...(currentState.dispatch?.consignments || []), consignment]
        },
        sales: {
          ...(currentState.sales || {}),
          orders: updatedSalesOrders
        }
      };

      store.setState(nextState);
      return consignment;
    }

    // Fallback: use domain salesActions.createDispatch
    return store.salesActions.createDispatch(orderId, data, actorName);*/
  },
  startDispatchTransit: (consignmentId: string, actorName = 'Dispatch') => {
    const store: any = (useERPStore as any).getState();
    const nextState = DispatchActions.startDispatchTransit(
      store.state, consignmentId, { id: actorName, name: actorName }
    );
    store.setState(nextState);
  },
  confirmDelivery: (consignmentId: string, deliveryData?: any, actorName = 'Dispatch') => {
    const store: any = (useERPStore as any).getState();
    const nextState = DispatchActions.confirmDelivery(
      store.state, consignmentId, deliveryData || {}, { id: actorName, name: actorName }
    );
    store.setState(nextState);
  },
  recordSalesPayment: (orderId: string, payload: any, actorName = 'Sales User') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.recordSalesPayment(orderId, payload, actorName);
  },
  requestReplacement: (orderId: string, payload: any, actorName = 'Sales User') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.requestReplacement({ ...payload, orderId }, actorName);
  },
  approveReplacement: (requestId: string, remarks?: string, actorName = 'Plant Head') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.approveReplacement(requestId, remarks, actorName);
  },
  requestReturn: (orderId: string, payload: any, actorName = 'Sales User') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.requestReturn({ ...payload, orderId }, actorName);
  },
  approveReturn: (requestId: string, remarks?: string, actorName = 'Plant Head') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.approveReturn(requestId, remarks, actorName);
  },
  verifyFinancePayment: (confirmationId: string, actorName = 'Finance') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.verifyFinancePayment(confirmationId, actorName);
  },
  rejectFinancePayment: (confirmationId: string, remarks: string, actorName = 'Finance') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.rejectFinancePayment(confirmationId, remarks, actorName);
  },
  assignReturnPickup: (returnId: string, payload: any, actorName = 'Dispatch') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.assignReturnPickup(returnId, payload, actorName);
  },
  startReturnTransit: (returnId: string, actorName = 'Dispatch') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.startReturnTransit(returnId, actorName);
  },
  confirmReturnReceipt: (returnId: string, payload: any, actorName = 'Dispatch') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.confirmReturnReceipt(returnId, payload, actorName);
  },
  rejectReplacement: (requestId: string, remarks: string, actorName = 'Plant Head') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.rejectReplacement(requestId, remarks, actorName);
  },
  dispatchReplacement: (requestId: string, payload: any, actorName = 'Dispatch') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.dispatchReplacement(requestId, payload, actorName);
  },
  startReplacementTransit: (requestId: string, actorName = 'Dispatch') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.startReplacementTransit(requestId, actorName);
  },
  confirmReplacementDelivery: (requestId: string, payload: any, actorName = 'Dispatch') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.confirmReplacementDelivery(requestId, payload, actorName);
  },
  rejectReturn: (requestId: string, remarks: string, actorName = 'Plant Head') => {
    const store: any = (useERPStore as any).getState();
    return store.salesActions.rejectReturn(requestId, remarks, actorName);
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
    const procurement = s.state.procurement || { materialIndents: [] };
    const materialIndents = (procurement.materialIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        const nowStr = new Date().toISOString();
        const newHistory = [...(ind.history || []), {
          action: 'INDENT_APPROVED',
          status: 'PLANT_HEAD_APPROVED',
          department: 'Plant Head',
          remarks: remarks || '',
          timestamp: nowStr
        }];
        return {
          ...ind,
          status: 'PLANT_HEAD_APPROVED',
          plantHeadRemarks: remarks || '',
          updatedAt: nowStr,
          history: newHistory
        };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents, procurement: { ...procurement, materialIndents } };
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
    const procurement = s.state.procurement || { materialIndents: [] };
    const materialIndents = (procurement.materialIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        const nowStr = new Date().toISOString();
        const newHistory = [...(ind.history || []), {
          action: 'INDENT_REJECTED',
          status: 'PLANT_HEAD_REJECTED',
          department: 'Plant Head',
          remarks: remarks || '',
          timestamp: nowStr
        }];
        return {
          ...ind,
          status: 'PLANT_HEAD_REJECTED',
          plantHeadRemarks: remarks || '',
          updatedAt: nowStr,
          history: newHistory
        };
      }
      return ind;
    });
    const newState = { ...s.state, purchaseIndents, procurement: { ...procurement, materialIndents } };
    persistToStorage(newState);
    return { state: newState };
  })),



  approveMaterialIndent: (indentId: string, approvedQtyOrItems: any, remarks: string) => set((store: any) => safePersist(store, (s) => {
    const procurement = s.state.procurement || { materialIndents: [] };
    const materialIndents = (procurement.materialIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        if (ind.status === 'PLANT_HEAD_APPROVED' || ind.status === 'APPROVED') {
          console.warn(`[approveMaterialIndent] Indent ${indentId} is already approved.`);
          return ind;
        }
        if (ind.status !== 'PENDING_PLANT_HEAD_APPROVAL' && ind.status !== 'PENDING') {
          console.warn(`Cannot approve indent from status ${ind.status}`);
          return ind;
        }
        
        let finalApprovedQty = 0;
        let updatedItems = ind.items || [];
        
        if (Array.isArray(approvedQtyOrItems)) {
          updatedItems = (ind.items || []).map((it: any) => {
            const approved = approvedQtyOrItems.find((a: any) => a.indentItemId === it.indentItemId || a.materialId === it.materialId);
            const qty = approved ? Number(approved.approvedQty ?? approved.approvedQuantity ?? approved.quantity) : Number(it.quantity);
            if (qty <= 0) throw new Error("Approved quantity must be greater than zero");
            if (qty > it.quantity) throw new Error("Approved quantity cannot exceed requested quantity");
            finalApprovedQty += qty;
            return { ...it, approvedQuantity: qty };
          });
        } else {
          finalApprovedQty = Number(approvedQtyOrItems);
          if (finalApprovedQty <= 0) throw new Error("Approved quantity must be greater than zero");
          if (finalApprovedQty > ind.requiredQuantity) throw new Error("Approved quantity cannot exceed requested quantity");
          updatedItems = (ind.items || []).map((it: any) => {
            return { ...it, approvedQuantity: finalApprovedQty };
          });
        }

        const nowStr = new Date().toISOString();
        const newHistory = [...(ind.history || []), {
          action: 'INDENT_APPROVED',
          fromStatus: ind.status,
          toStatus: 'PLANT_HEAD_APPROVED',
          performedBy: 'Plant Head User',
          performedByRole: 'Plant Head',
          remarks: remarks || 'Approved by Plant Head',
          timestamp: nowStr
        }];
        return {
          ...ind,
          approvedQuantity: finalApprovedQty,
          items: updatedItems,
          status: 'PLANT_HEAD_APPROVED',
          plantHeadRemarks: remarks || '',
          updatedAt: nowStr,
          history: newHistory
        };
      }
      return ind;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        materialIndents
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  returnMaterialIndent: (indentId: string, remarks: string) => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Remarks are mandatory for correction");
    const procurement = s.state.procurement || { materialIndents: [] };
    const materialIndents = (procurement.materialIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        if (ind.status !== 'PENDING_PLANT_HEAD_APPROVAL') {
          throw new Error(`Cannot return indent from status ${ind.status}`);
        }
        const nowStr = new Date().toISOString();
        const newHistory = [...(ind.history || []), {
          action: 'INDENT_RETURNED',
          fromStatus: ind.status,
          toStatus: 'CORRECTION_REQUIRED',
          performedBy: 'Plant Head User',
          performedByRole: 'Plant Head',
          remarks: remarks,
          timestamp: nowStr
        }];
        return {
          ...ind,
          status: 'CORRECTION_REQUIRED',
          plantHeadRemarks: remarks,
          updatedAt: nowStr,
          history: newHistory
        };
      }
      return ind;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        materialIndents
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  rejectMaterialIndent: (indentId: string, remarks: string) => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Remarks are mandatory for rejection");
    const procurement = s.state.procurement || { materialIndents: [] };
    const materialIndents = (procurement.materialIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        if (ind.status !== 'PENDING_PLANT_HEAD_APPROVAL') {
          throw new Error(`Cannot reject indent from status ${ind.status}`);
        }
        const nowStr = new Date().toISOString();
        const newHistory = [...(ind.history || []), {
          action: 'INDENT_REJECTED',
          fromStatus: ind.status,
          toStatus: 'PLANT_HEAD_REJECTED',
          performedBy: 'Plant Head User',
          performedByRole: 'Plant Head',
          remarks: remarks,
          timestamp: nowStr
        }];
        return {
          ...ind,
          status: 'PLANT_HEAD_REJECTED',
          plantHeadRemarks: remarks,
          updatedAt: nowStr,
          history: newHistory
        };
      }
      return ind;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        materialIndents
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  createMaterialIndent: (payload: any) => set((store: any) => safePersist(store, (s) => {
    const procurement = s.state.procurement || { materialIndents: [] };
    const materialIndents = procurement.materialIndents || [];
    
    // Prevent duplicate submission caused by double-clicking:
    const nowStr = new Date().toISOString();
    const firstItem = payload.items && payload.items[0] ? payload.items[0] : {};
    const requiredQuantity = Number(payload.requiredQuantity ?? payload.quantity ?? firstItem.quantity ?? 0);
    const materialId = payload.materialId || payload.materialCode || firstItem.materialId || '';

    const isDuplicate = materialIndents.some((ind: any) => {
      const timeDiff = Date.now() - new Date(ind.createdAt).getTime();
      return timeDiff < 2000 &&
             (ind.materialId === materialId || ind.materialCode === materialId) &&
             Number(ind.requiredQuantity) === requiredQuantity;
    });
    if (isDuplicate) {
      return { state: s.state };
    }

    let nextNum = materialIndents.length + 1;
    let indentId = payload.id || `#INDENT${nextNum}`;
    while (materialIndents.some((ind: any) => ind.id === indentId)) {
      nextNum++;
      indentId = `#INDENT${nextNum}`;
    }

    const newIndent = {
      id: indentId,
      materialId,
      materialCode: materialId,
      materialName: payload.materialName || payload.material || firstItem.materialName || '',
      currentStock: Number(payload.currentStock ?? 0),
      minimumStock: Number(payload.minimumStock ?? 0),
      requiredQuantity,
      approvedQuantity: null,
      unit: payload.unit || firstItem.unit || 'PCS',
      targetDate: payload.targetDate || payload.requiredDate || '',
      priority: (payload.priority || 'Medium').toUpperCase(),
      remarks: payload.remarks || '',
      source: 'LOW_STOCK_ALERT',
      requestedByDepartment: 'STORE',
      status: 'PENDING_PLANT_HEAD_APPROVAL',
      items: payload.items ? payload.items.map((it: any, index: number) => ({
        indentItemId: it.indentItemId || `${indentId}-ITEM-${index + 1}`,
        materialId: it.materialId,
        materialName: it.materialName,
        quantity: Number(it.quantity || it.requiredQuantity || 0),
        requiredQuantity: Number(it.quantity || it.requiredQuantity || 0),
        approvedQuantity: null
      })) : [
        {
          indentItemId: indentId + "-ITEM-1",
          materialId,
          materialName: payload.materialName || payload.material || '',
          quantity: requiredQuantity,
          requiredQuantity,
          approvedQuantity: null
        }
      ],
      createdAt: nowStr,
      updatedAt: nowStr,
      history: [
        {
          action: 'INDENT_CREATED',
          fromStatus: null,
          toStatus: 'PENDING_PLANT_HEAD_APPROVAL',
          performedBy: 'Store Executive',
          performedByRole: 'STORE',
          remarks: payload.remarks || '',
          timestamp: nowStr
        }
      ]
    };

    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        materialIndents: [newIndent, ...materialIndents]
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  cancelPurchaseIndent: (indentId: string, reason: string, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    if (!reason) throw new Error("Cancellation reason mandatory");
    const procurement = s.state.procurement || { materialIndents: [] };
    const materialIndents = (procurement.materialIndents || []).map((ind: any) => {
      if (ind.id === indentId) {
        return {
          ...ind,
          status: 'INDENT_CANCELLED',
          cancellationReason: reason,
          updatedAt: new Date().toISOString(),
          history: [...(ind.history || []), {
            action: 'CANCEL_INDENT',
            fromStatus: ind.status,
            toStatus: 'INDENT_CANCELLED',
            performedBy: actorName,
            performedByRole: 'User',
            remarks: reason,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return ind;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        materialIndents
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  createPurchaseOrderFromIndent: (indentId: string, poData: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const procurement = s.state.procurement || { materialIndents: [], purchaseOrders: [], goodsReceiptNotes: [] };
    const indents = procurement.materialIndents || [];
    const indentIdx = indents.findIndex((i: any) => i.id === indentId);
    if (indentIdx === -1) throw new Error("Indent not found");
    const indent = indents[indentIdx];

    if (indent.status !== 'PLANT_HEAD_APPROVED') {
      throw new Error(`Cannot convert indent from status ${indent.status}`);
    }
    if (indent.poId) {
      throw new Error("A purchase order already exists for this indent.");
    }

    const purchaseOrders = procurement.purchaseOrders || [];
    const existingPO = purchaseOrders.find(
      (po: any) => po.indentId === indentId && po.status !== 'CANCELLED'
    );
    if (existingPO) {
      throw new Error("A purchase order already exists for this indent.");
    }

    const roundMoney = (value: number) =>
      Math.round((value + Number.EPSILON) * 100) / 100;

    const items = poData.items || [];
    const subtotal = roundMoney(
      items.reduce(
        (total: number, item: any) =>
          total + Number(item.quantity || item.orderedQuantity || item.orderedQty || 0) * Number(item.rate || item.unitRate || 0),
        0
      )
    );
    const gstPercent = Number(poData.gst || poData.gstPercent || 18);
    const gstAmount = roundMoney(subtotal * (gstPercent / 100));
    const freight = Number(poData.freight || poData.freightAmount || 0);
    const grandTotal = roundMoney(subtotal + gstAmount + freight);

    let nextNum = purchaseOrders.length + 1;
    let poId = poData.id || `#PO${nextNum}`;
    while (purchaseOrders.some((p: any) => p.id === poId)) {
      nextNum++;
      poId = `#PO${nextNum}`;
    }

    const newPO = {
      id: poId,
      poNumber: poData.poNumber || poId,
      indentId,
      vendorId: poData.vendorId || 'VEND-' + Date.now(),
      vendorName: poData.vendorName || 'Selected Vendor',
      expectedDeliveryDate: poData.expectedDeliveryDate || poData.expectedDate || '',
      paymentTerms: poData.paymentTerms || '30 Days Net',
      subtotal,
      gstPercent,
      gstAmount,
      freight,
      grandTotal,
      items: items.map((it: any) => ({
        materialId: it.materialId || it.materialCode || indent.materialId || 'RM-STL-001',
        materialName: it.materialName || it.name || indent.materialName || 'Material',
        orderedQuantity: Number(it.quantity || it.orderedQuantity || it.orderedQty || 0),
        unit: it.unit || indent.unit || 'PCS',
        unitRate: Number(it.rate || it.unitRate || 0),
        subtotal: roundMoney(Number(it.quantity || it.orderedQuantity || it.orderedQty || 0) * Number(it.rate || it.unitRate || 0))
      })),
      status: 'DRAFT',
      deliveryStatus: 'AWAITING_DELIVERY',
      auditStatus: 'NOT_STARTED',
      closureStatus: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          action: 'DRAFT_PO_CREATED',
          fromStatus: null,
          toStatus: 'DRAFT',
          performedBy: actorName,
          performedByRole: 'Finance',
          remarks: 'Draft PO created from approved indent',
          timestamp: new Date().toISOString()
        }
      ]
    };

    const updatedIndents = indents.map((ind: any) => {
      if (ind.id === indentId) {
        return {
          ...ind,
          poId: poId,
          status: 'DRAFT_PO_CREATED',
          updatedAt: new Date().toISOString(),
          history: [...(ind.history || []), {
            action: 'DRAFT_PO_CREATED',
            fromStatus: ind.status,
            toStatus: 'DRAFT_PO_CREATED',
            performedBy: actorName,
            performedByRole: 'Finance',
            remarks: `Draft PO ${poId} generated`,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return ind;
    });

    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        materialIndents: updatedIndents,
        purchaseOrders: [newPO, ...purchaseOrders]
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  updatePurchaseOrder: (poId: string, data: any, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const procurement = s.state.procurement || { purchaseOrders: [] };
    const purchaseOrders = (procurement.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        if (po.status !== 'DRAFT' && po.status !== 'CORRECTION_REQUIRED') {
          throw new Error(`Cannot update PO from status ${po.status}`);
        }
        const roundMoney = (value: number) =>
          Math.round((value + Number.EPSILON) * 100) / 100;

        const items = data.items || po.items;
        const subtotal = roundMoney(
          items.reduce(
            (total: number, item: any) =>
              total + Number(item.quantity || item.orderedQuantity || 0) * Number(item.rate || item.unitRate || 0),
            0
          )
        );
        const gstPercent = Number(data.gst || data.gstPercent || po.gstPercent || 18);
        const gstAmount = roundMoney(subtotal * (gstPercent / 100));
        const freight = Number(data.freight !== undefined ? data.freight : (data.freightAmount !== undefined ? data.freightAmount : po.freight));
        const grandTotal = roundMoney(subtotal + gstAmount + freight);

        return {
          ...po,
          ...data,
          subtotal,
          gstPercent,
          gstAmount,
          freight,
          grandTotal,
          items: items.map((it: any) => ({
            materialId: it.materialId || 'RM-STL-001',
            materialName: it.materialName || it.name || 'Material',
            orderedQuantity: Number(it.quantity || it.orderedQuantity || 0),
            unit: it.unit || 'PCS',
            unitRate: Number(it.rate || it.unitRate || 0),
            subtotal: roundMoney(Number(it.quantity || it.orderedQuantity || 0) * Number(it.rate || it.unitRate || 0))
          })),
          status: 'DRAFT',
          updatedAt: new Date().toISOString()
        };
      }
      return po;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        purchaseOrders
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  submitPurchaseOrder: (poId: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const procurement = s.state.procurement || { purchaseOrders: [] };
    const purchaseOrders = (procurement.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        if (po.status !== 'DRAFT' && po.status !== 'CORRECTION_REQUIRED') {
          throw new Error(`Cannot submit PO from status ${po.status}.`);
        }
        const nowStr = new Date().toISOString();
        return {
          ...po,
          status: 'PENDING_SUPER_ADMIN_APPROVAL',
          updatedAt: nowStr,
          history: [...(po.history || []), {
            action: 'PO_SUBMITTED',
            fromStatus: po.status,
            toStatus: 'PENDING_SUPER_ADMIN_APPROVAL',
            performedBy: actorName,
            performedByRole: 'Finance',
            remarks: 'Submitted for Super Admin approval',
            timestamp: nowStr
          }]
        };
      }
      return po;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        purchaseOrders
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  approvePurchaseOrder: (poId: string, remarks: string, approverName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    const procurement = s.state.procurement || { purchaseOrders: [] };
    const purchaseOrders = (procurement.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        if (po.status !== 'PENDING_SUPER_ADMIN_APPROVAL') {
          throw new Error(`Cannot approve PO from status ${po.status}.`);
        }
        const nowStr = new Date().toISOString();
        return {
          ...po,
          status: 'SUPER_ADMIN_APPROVED',
          superAdminRemarks: remarks || '',
          approvedBy: approverName,
          approvedAt: nowStr,
          updatedAt: nowStr,
          history: [...(po.history || []), {
            action: 'PO_APPROVED',
            fromStatus: po.status,
            toStatus: 'SUPER_ADMIN_APPROVED',
            performedBy: approverName,
            performedByRole: 'Super Admin',
            remarks: remarks || 'Approved by Super Admin',
            timestamp: nowStr
          }]
        };
      }
      return po;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        purchaseOrders
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  returnPurchaseOrder: (poId: string, remarks: string, actorName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Remarks are mandatory for correction");
    const procurement = s.state.procurement || { purchaseOrders: [] };
    const purchaseOrders = (procurement.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        if (po.status !== 'PENDING_SUPER_ADMIN_APPROVAL') {
          throw new Error(`Cannot return PO from status ${po.status}.`);
        }
        const nowStr = new Date().toISOString();
        return {
          ...po,
          status: 'CORRECTION_REQUIRED',
          superAdminRemarks: remarks,
          updatedAt: nowStr,
          history: [...(po.history || []), {
            action: 'PO_RETURNED',
            fromStatus: po.status,
            toStatus: 'CORRECTION_REQUIRED',
            performedBy: actorName,
            performedByRole: 'Super Admin',
            remarks: remarks,
            timestamp: nowStr
          }]
        };
      }
      return po;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        purchaseOrders
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  rejectPurchaseOrder: (poId: string, remarks: string, actorName: string = 'Super Admin') => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Remarks are mandatory for rejection");
    const procurement = s.state.procurement || { purchaseOrders: [] };
    const purchaseOrders = (procurement.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        if (po.status !== 'PENDING_SUPER_ADMIN_APPROVAL') {
          throw new Error(`Cannot reject PO from status ${po.status}.`);
        }
        const nowStr = new Date().toISOString();
        return {
          ...po,
          status: 'SUPER_ADMIN_REJECTED',
          superAdminRemarks: remarks,
          updatedAt: nowStr,
          history: [...(po.history || []), {
            action: 'PO_REJECTED',
            fromStatus: po.status,
            toStatus: 'SUPER_ADMIN_REJECTED',
            performedBy: actorName,
            performedByRole: 'Super Admin',
            remarks: remarks,
            timestamp: nowStr
          }]
        };
      }
      return po;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        purchaseOrders
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  issuePurchaseOrder: (poId: string, finalPoNumber?: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const procurement = s.state.procurement || { purchaseOrders: [] };
    const purchaseOrders = (procurement.purchaseOrders || []).map((po: any) => {
      if (po.id === poId) {
        if (po.status !== 'SUPER_ADMIN_APPROVED') {
          throw new Error("Only a Super Admin-approved PO can be issued.");
        }
        const poNumber = finalPoNumber || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const nowStr = new Date().toISOString();
        return {
          ...po,
          status: 'PO_ISSUED',
          deliveryStatus: 'AWAITING_DELIVERY',
          poNumber,
          issuedAt: nowStr,
          issuedBy: actorName,
          updatedAt: nowStr,
          history: [...(po.history || []), {
            action: 'PO_ISSUED',
            fromStatus: po.status,
            toStatus: 'PO_ISSUED',
            performedBy: actorName,
            performedByRole: 'Finance',
            remarks: `Issued with PO No: ${poNumber}`,
            timestamp: nowStr
          }]
        };
      }
      return po;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        purchaseOrders
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  acceptPurchaseOrderByVendor: (poId: string, data: any, actorName: string = 'System') => set((store: any) => safePersist(store, (s) => {
    const procurement = s.state.procurement || { purchaseOrders: [] };
    const purchaseOrders = (procurement.purchaseOrders || []).map((po: any) => {
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
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        purchaseOrders
      }
    };
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
  createGoodsReceipt: (poId: string, grnData: any, actorName: string = 'Store') => set((store: any) => safePersist(store, (s) => {
    const procurement = s.state.procurement || { purchaseOrders: [], goodsReceiptNotes: [] };
    const pos = procurement.purchaseOrders || [];
    const poIdx = pos.findIndex((p: any) => p.id === poId || p.poNumber === poId);
    if (poIdx === -1) throw new Error("PO not found");
    const po = pos[poIdx];

    if (po.status !== 'PO_ISSUED') {
      throw new Error(`Cannot create GRN for PO in status ${po.status}`);
    }

    const receivedQuantity = Number(
      grnData.receivedQuantity || 
      grnData.receivedQty || 
      grnData.deliveredQty || 
      grnData.items?.reduce((sum: number, it: any) => sum + Number(it.receivedQuantity || it.receivedQty || it.deliveredQty || it.quantity || 0), 0) || 
      0
    );
    const acceptedQuantity = Number(
      grnData.acceptedQuantity !== undefined ? grnData.acceptedQuantity : 
      (grnData.acceptedQty !== undefined ? grnData.acceptedQty : 
      (grnData.items?.reduce((sum: number, it: any) => sum + Number(it.acceptedQuantity !== undefined ? it.acceptedQuantity : (it.acceptedQty !== undefined ? it.acceptedQty : (it.receivedQuantity || it.receivedQty || it.deliveredQty || it.quantity || 0))), 0) || receivedQuantity))
    );
    const rejectedQuantity = Number(
      grnData.rejectedQuantity !== undefined ? grnData.rejectedQuantity : 
      (grnData.rejectedQty !== undefined ? grnData.rejectedQty : 
      (grnData.items?.reduce((sum: number, it: any) => sum + Number(it.rejectedQuantity !== undefined ? it.rejectedQuantity : (it.rejectedQty !== undefined ? it.rejectedQty : 0)), 0) || 0))
    );

    if (receivedQuantity <= 0) throw new Error("Received quantity must be greater than zero");
    if (acceptedQuantity + rejectedQuantity !== receivedQuantity) {
      throw new Error("Accepted + Rejected quantity must equal Received quantity");
    }

    const linkedGRNs = (procurement.goodsReceiptNotes || []).filter((g: any) => g.poId === po.id && g.status !== 'CANCELLED');
    const items = (grnData.items || po.items.map((it: any) => ({
      materialId: it.materialId,
      materialName: it.materialName,
      receivedQuantity: receivedQuantity,
      acceptedQuantity: acceptedQuantity,
      rejectedQuantity: rejectedQuantity
    }))).map((it: any) => {
      const received = Number(it.receivedQuantity || it.receivedQty || it.deliveredQty || it.quantity || 0);
      const accepted = Number(it.acceptedQuantity !== undefined ? it.acceptedQuantity : (it.acceptedQty !== undefined ? it.acceptedQty : received));
      const rejected = Number(it.rejectedQuantity !== undefined ? it.rejectedQuantity : (it.rejectedQty !== undefined ? it.rejectedQty : 0));
      return {
        materialId: it.materialId,
        materialName: it.materialName || po.items.find((poi: any) => poi.materialId === it.materialId)?.materialName || '',
        receivedQuantity: received,
        acceptedQuantity: accepted,
        rejectedQuantity: rejected
      };
    });

    items.forEach((grnItem: any) => {
      const poItem = po.items.find((it: any) => it.materialId === grnItem.materialId);
      if (!poItem) throw new Error(`Material ${grnItem.materialName} not found on PO`);
      
      const prevReceivedItem = linkedGRNs.reduce((sum: number, grn: any) => {
        const matchingItem = (grn.items || []).find((it: any) => it.materialId === grnItem.materialId);
        return sum + Number(matchingItem?.receivedQuantity || matchingItem?.receivedQty || matchingItem?.deliveredQty || 0);
      }, 0);
      
      if (prevReceivedItem + Number(grnItem.receivedQuantity) > Number(poItem.orderedQuantity || poItem.orderedQty || 0)) {
        throw new Error("Received quantity exceeds the pending PO quantity.");
      }
    });

    let grnNum = (procurement.goodsReceiptNotes || []).length + 1;
    let grnId = grnData.id || `#GRN${grnNum}`;
    while (!grnData.id && (procurement.goodsReceiptNotes || []).some((g: any) => g.id === grnId)) {
      grnNum++;
      grnId = `#GRN${grnNum}`;
    }

    const newGRN = {
      id: grnId,
      grnNumber: grnId,
      poId: po.id,
      indentId: po.indentId,
      receivedDate: grnData.receivedDate || new Date().toISOString().split('T')[0],
      receivedQuantity,
      acceptedQuantity,
      rejectedQuantity,
      invoiceNumber: grnData.invoiceNumber || '',
      deliveryChallanNumber: grnData.deliveryChallanNumber || '',
      status: 'PENDING_FINANCE_AUDIT',
      inventoryPosted: false,
      items: items.map((it: any) => ({
        materialId: it.materialId,
        materialName: it.materialName,
        receivedQuantity: Number(it.receivedQuantity || 0),
        acceptedQuantity: Number(it.acceptedQuantity || 0),
        rejectedQuantity: Number(it.rejectedQuantity || 0)
      })),
      snapshot: grnData.snapshot || {},
      remarks: grnData.remarks || '',
      createdAt: new Date().toISOString(),
      history: [
        {
          action: 'GRN_CREATED',
          fromStatus: null,
          toStatus: 'PENDING_FINANCE_AUDIT',
          performedBy: actorName || 'Store Executive',
          performedByRole: 'Store',
          remarks: grnData.remarks || 'GRN generated',
          timestamp: new Date().toISOString()
        }
      ]
    };

    const orderedQuantity = po.items.reduce((sum: number, it: any) => sum + Number(it.orderedQuantity || 0), 0);
    const previousReceived = linkedGRNs.reduce((sum: number, grn: any) => sum + Number(grn.receivedQuantity || 0), 0);
    const totalReceivedSoFar = previousReceived + receivedQuantity;
    const nextDeliveryStatus = totalReceivedSoFar < orderedQuantity ? 'PARTIALLY_RECEIVED' : 'FULLY_RECEIVED';

    const purchaseOrders = pos.map((p: any) => {
      if (p.id === po.id) {
        return {
          ...p,
          status: p.status,
          deliveryStatus: nextDeliveryStatus,
          updatedAt: new Date().toISOString(),
          history: [...(p.history || []), {
            action: 'GRN_CREATED',
            fromStatus: p.status,
            toStatus: p.status,
            performedBy: actorName || 'Store Executive',
            performedByRole: 'Store',
            remarks: `Received ${receivedQuantity} units. GRN ${grnId} created.`,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return p;
    });

    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        purchaseOrders,
        goodsReceiptNotes: [newGRN, ...(procurement.goodsReceiptNotes || [])]
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  approveGoodsReceiptNote: (grnId: string, remarks: string, inspectorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    const procurement = s.state.procurement || { goodsReceiptNotes: [], purchaseOrders: [], materialIndents: [] };
    const grns = procurement.goodsReceiptNotes || [];
    const grnIdx = grns.findIndex((g: any) => g.id === grnId);
    if (grnIdx === -1) throw new Error("GRN not found");
    const grn = grns[grnIdx];

    if (grn.status !== 'PENDING_FINANCE_AUDIT' && grn.status !== 'SUBMITTED_FOR_FINANCE_AUDIT') {
      throw new Error(`Cannot audit GRN from ${grn.status}.`);
    }
    if (grn.inventoryPosted) {
      throw new Error("Inventory has already been posted for this GRN.");
    }

    const pos = procurement.purchaseOrders || [];
    const poIdx = pos.findIndex((p: any) => p.id === grn.poId);
    if (poIdx === -1) throw new Error("PO not found");
    const po = pos[poIdx];

    postApprovedGrnToInventory(s.state, grn);

    const updatedGRNs = grns.map((g: any) => {
      if (g.id === grnId) {
        return {
          ...g,
          status: 'FINANCE_AUDIT_APPROVED',
          inventoryPosted: true,
          inventoryPostedAt: new Date().toISOString(),
          items: (g.items || []).map((it: any) => ({ ...it, inventoryPosted: true })),
          remarks: remarks || g.remarks,
          updatedAt: new Date().toISOString(),
          history: [...(g.history || []), {
            action: 'GRN_AUDIT_APPROVED',
            fromStatus: g.status,
            toStatus: 'FINANCE_AUDIT_APPROVED',
            performedBy: inspectorName,
            performedByRole: 'Finance',
            remarks: remarks || 'Audit Approved and inventory posted',
            timestamp: new Date().toISOString()
          }]
        };
      }
      return g;
    });

    const rejections = [...(s.state.materialRejections || [])];
    if (grn.grnType === 'REPLACEMENT') {
      const rejIdx = rejections.findIndex((r: any) => r.id === grn.materialRejectionId);
      if (rejIdx !== -1) {
        const rej = { ...rejections[rejIdx] };
        grn.items.forEach((grnItem: any) => {
          rej.cumulativeReplacementAcceptedQty = (rej.cumulativeReplacementAcceptedQty || 0) + Number(grnItem.acceptedQuantity || grnItem.acceptedQty || 0);
          rej.cumulativeReplacementRejectedQty = (rej.cumulativeReplacementRejectedQty || 0) + Number(grnItem.rejectedQuantity || grnItem.rejectedQty || 0);
        });
        rej.remainingResolutionQty = Number(rej.rejectedQty) - (rej.cumulativeReplacementAcceptedQty || 0) - (rej.commerciallySettledQty || 0);
        if (rej.remainingResolutionQty <= 0) {
          rej.status = 'RESOLVED';
        } else {
          rej.status = 'PARTIALLY_RESOLVED';
        }
        rej.updatedAt = new Date().toISOString();
        rejections[rejIdx] = rej;
      }
    }

    const auditedOtherGRNs = updatedGRNs.filter((g: any) => g.poId === po.id && g.status === 'FINANCE_AUDIT_APPROVED' && g.grnType !== 'REPLACEMENT' && !g.isReplacementGRN);
    let allLinesMet = true;
    let unresolvedRejected = 0;

    po.items.forEach((poItem: any) => {
      const acceptedForLine = auditedOtherGRNs.reduce((sum: number, g: any) => {
        const item = g.items.find((it: any) => it.materialId === poItem.materialId);
        return sum + Number(item?.acceptedQuantity || 0);
      }, 0);
      
      const rejectedForLine = auditedOtherGRNs.reduce((sum: number, g: any) => {
        const item = g.items.find((it: any) => it.materialId === poItem.materialId);
        return sum + Number(item?.rejectedQuantity || 0);
      }, 0);

      unresolvedRejected += rejectedForLine;

      if (acceptedForLine !== Number(poItem.orderedQuantity)) {
        allLinesMet = false;
      }
    });

    const allGRNsForPO = updatedGRNs.filter((g: any) => g.poId === po.id && g.grnType !== 'REPLACEMENT' && !g.isReplacementGRN);
    const allRelevantGRNsAudited = allGRNsForPO.every((g: any) => g.status === 'FINANCE_AUDIT_APPROVED');

    const shouldClosePO = allLinesMet && allRelevantGRNsAudited && unresolvedRejected === 0;

    const purchaseOrders = pos.map((p: any) => {
      if (p.id === po.id) {
        if (shouldClosePO) {
          return {
            ...p,
            status: 'PO_CLOSED',
            deliveryStatus: 'DELIVERY_COMPLETED',
            auditStatus: 'FINANCE_AUDIT_APPROVED',
            closureStatus: 'CLOSED',
            closedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: [...(p.history || []), {
              action: 'PO_CLOSED',
              fromStatus: p.status,
              toStatus: 'PO_CLOSED',
              performedBy: inspectorName,
              performedByRole: 'Finance',
              remarks: 'All items received, audited, and closed.',
              timestamp: new Date().toISOString()
            }]
          };
        } else {
          return {
            ...p,
            updatedAt: new Date().toISOString()
          };
        }
      }
      return p;
    });

    const materialIndents = (procurement.materialIndents || []).map((ind: any) => {
      if (ind.id === po.indentId && shouldClosePO) {
        return {
          ...ind,
          status: 'PROCUREMENT_COMPLETED',
          closedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [...(ind.history || []), {
            action: 'PO_CLOSED',
            fromStatus: ind.status,
            toStatus: 'PROCUREMENT_COMPLETED',
            performedBy: inspectorName,
            performedByRole: 'Finance',
            remarks: 'Procurement complete',
            timestamp: new Date().toISOString()
          }]
        };
      }
      return ind;
    });

    const newState = {
      ...s.state,
      rawInventory: s.state.rawInventory,
      materialRejections: rejections,
      procurement: {
        ...procurement,
        goodsReceiptNotes: updatedGRNs,
        purchaseOrders,
        materialIndents
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  approveGoodsReceipt: (grnId: string, remarks: string, inspectorName: string = 'Finance') => {
    return (useERPStore.getState() as any).approveGoodsReceiptNote(grnId, remarks, inspectorName);
  },

  rejectGoodsReceipt: (grnId: string, remarks: string, actorName: string = 'Finance') => set((store: any) => safePersist(store, (s) => {
    if (!remarks) throw new Error("Rejection remarks mandatory");
    const procurement = s.state.procurement || { goodsReceiptNotes: [] };
    const goodsReceiptNotes = (procurement.goodsReceiptNotes || []).map((g: any) => {
      if (g.id === grnId) {
        return {
          ...g,
          status: 'RETURNED_TO_STORE',
          remarks: remarks,
          updatedAt: new Date().toISOString(),
          history: [...(g.history || []), {
            action: 'GRN_REJECTED',
            fromStatus: g.status,
            toStatus: 'RETURNED_TO_STORE',
            performedBy: actorName,
            performedByRole: 'Finance',
            remarks,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return g;
    });
    const newState = {
      ...s.state,
      procurement: {
        ...procurement,
        goodsReceiptNotes
      }
    };
    persistToStorage(newState);
    return { state: newState };
  })),

  postGoodsReceiptToStock: (grnId: string) => set((store: any) => ({ state: store.state })),


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


  createReplacementGRN: (poId: string, vrnId: string, data: any) => {
    set((store: any) => {
      const vendorReturns = (store.state.vendorReturns || []).map((vrn: any) => {
        if (vrn.id === vrnId || vrn.returnNo === vrnId) {
          return { ...vrn, status: 'REPLACED' };
        }
        return vrn;
      });

      const newGRNId = createId('GRN');
      const newGRNNo = data.grnNumber || get().generateEntityId('grn');
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
    const inspectionId = get().generateEntityId('qcInspection');
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
        id: get().generateEntityId('notification'),
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
        id: get().generateEntityId('notification'),
        title: 'Delivered Order Awaiting Payment',
        message: `${orderId} has been delivered. Outstanding payment is ₹${(invoiceAmt / 100000).toFixed(2)} L.`,
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
  // ── ORDER CLOSURE ─────────────────────────────────────
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

  verifyLegacyFinancePayment: (targetId: string, verificationData: any = {}) => {
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
      const id = get().generateEntityId('analysisRequest');
      const requestNumber = get().generateEntityId('analysisRequest');
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
      const id = get().generateEntityId('analysisRequest');
      const requestNumber = get().generateEntityId('analysisRequest');
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
        ? `Recalculated. Previous Net: ₹${salaries[existingIndex].netSalary.toLocaleString()}.`
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

// Node/test compatibility and a single canonical transactional state surface.
// React consumers keep using `store.state`; imperative consumers can use the
// conventional Zustand `getState().sales` shape without creating a second copy.
const nativeGetState = useERPStore.getState;
const nativeSetState = useERPStore.setState;

(useERPStore as any).getState = () => {
  const store = nativeGetState() as any;
  const merged = {
    ...store,
    ...(store.state || {}),
    state: store.state,
  };
  merged.finance = store.finance;
  return merged;
};

(useERPStore as any).setState = (update: any, replace?: boolean) => {
  const current = nativeGetState() as any;
  const resolved = typeof update === 'function'
    ? update((useERPStore as any).getState())
    : update;

  if (resolved && (
    Object.prototype.hasOwnProperty.call(resolved, 'sales') ||
    Object.prototype.hasOwnProperty.call(resolved, 'production') ||
    Object.prototype.hasOwnProperty.call(resolved, 'dispatch') ||
    Object.prototype.hasOwnProperty.call(resolved, 'finance') ||
    Object.prototype.hasOwnProperty.call(resolved, 'auditEvents')
  )) {
    const nextState = {
      ...(current.state || {}),
      ...(resolved.sales ? { sales: normalizeSalesState(resolved.sales) } : {}),
      ...(resolved.production ? { production: resolved.production } : {}),
      ...(resolved.dispatch ? { dispatch: resolved.dispatch } : {}),
      ...(resolved.finance ? { finance: normalizeFinanceState(resolved.finance) } : {}),
      ...(resolved.auditEvents ? { auditEvents: resolved.auditEvents } : {}),
    };
    persistToStorage(nextState);
    return nativeSetState({ state: nextState } as any, false);
  }

  return nativeSetState(resolved, replace as any);
};

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

  const outstandingPaymentsTotal = vendorPayments.filter((vp: any) => vp.status === 'PAYMENT_PENDING').reduce((acc: any, vp: any) => acc + (Number(vp.amount) || 0), 0);

  const currentMonth = new Date().getMonth();
  const monthlyProcurementSpend = purchaseOrders
    .filter((po: any) => (po.status === 'PO_ISSUED' || po.status === 'VENDOR_ACCEPTED' || po.status === 'PARTIALLY_RECEIVED' || po.status === 'STOCK_POSTED' || po.status === 'PAYMENT_PENDING' || po.status === 'PAYMENT_COMPLETED' || po.status === 'PO_CLOSED') && new Date(po.issuedAt || po.createdAt).getMonth() === currentMonth)
    .reduce((acc: any, po: any) => acc + (Number(po.grandTotal) || 0), 0);

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

export const getLeadQuotationState = (state: any, leadId: string) => {
  const quotations = Array.isArray(state.sales?.quotations)
    ? state.sales.quotations
    : [];

  const quotation = quotations.find(
    (item: any) =>
      (item.leadId === leadId || item.id === leadId) &&
      item.status !== 'CANCELLED' &&
      item.status !== 'DELETED'
  );

  if (!quotation) {
    return {
      state: 'NOT_CREATED',
      quotation: null,
    };
  }

  const completedStatuses = [
    'QUOTATION_CREATED',
    'SENT',
    'CUSTOMER_ACCEPTED',
    'CUSTOMER_REJECTED',
    'CONVERTED_TO_ORDER',
  ];

  return {
    state: completedStatuses.includes(quotation.status)
      ? 'COMPLETED'
      : 'DRAFT',
    quotation,
  };
};

export const getLeadSampleState = (state: any, leadId: string) => {
  const samples = Array.isArray(state.sales?.samples)
    ? state.sales.samples
    : [];

  const sample = samples.find(
    (item: any) =>
      (item.leadId === leadId || item.id === leadId) &&
      item.status !== 'CANCELLED' &&
      item.status !== 'DELETED'
  );

  if (!sample) {
    return {
      state: 'NOT_CREATED',
      sample: null,
    };
  }

  const completedStatuses = [
    'SAMPLE_CREATED',
    'READY_FOR_DISPATCH',
    'DISPATCHED',
    'IN_TRANSIT',
    'DELIVERED',
    'UNDER_TESTING',
    'APPROVED',
    'REJECTED',
    'RETURNED',
  ];

  return {
    state: completedStatuses.includes(sample.status)
      ? 'COMPLETED'
      : 'DRAFT',
    sample,
  };
};

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'erp-storage') {
      try {
        const parsed = JSON.parse(event.newValue || '{}');
        if (parsed) {
          useERPStore.setState({ state: parsed });
        }
      } catch (e) {
        console.error('Failed to sync erp-storage from another tab', e);
      }
    }
  });
}

export const selectPaymentsByOrderId = (state: any, orderId: string) => {
  return (state.finance?.customerPayments || []).filter((p: any) => p.orderId === orderId);
};

export const selectVerifiedPaymentsByOrderId = (state: any, orderId: string) => {
  return (state.finance?.customerPayments || []).filter((p: any) => p.orderId === orderId && p.verificationStatus === 'FINANCE_VERIFIED');
};

export const selectPendingVerificationPayments = (state: any) => {
  return (state.finance?.customerPayments || []).filter((p: any) => p.verificationStatus === 'FINANCE_VERIFICATION_PENDING');
};

export const selectRejectedPayments = (state: any) => {
  return (state.finance?.customerPayments || []).filter((p: any) => p.verificationStatus === 'FINANCE_REJECTED');
};

export const selectVerifiedAmountForOrder = (state: any, orderId: string) => {
  return (state.finance?.customerPayments || [])
    .filter((p: any) => p.orderId === orderId && p.verificationStatus === 'FINANCE_VERIFIED')
    .reduce((sum: number, p: any) => sum + p.paymentAmount, 0);
};

export const selectOutstandingAmountForOrder = (state: any, orderId: string) => {
  const order = (state.sales?.orders || []).find((o: any) => o.id === orderId);
  if (!order) return 0;
  const verified = selectVerifiedAmountForOrder(state, orderId);
  const total = Number(order.grandTotal ?? order.totalAmount ?? 0);
  return Math.max(total - verified, 0);
};

export const selectPaymentReceiptByPaymentId = (state: any, paymentId: string) => {
  return (state.finance?.paymentReceipts || []).find((r: any) => r.paymentId === paymentId);
};

export const selectCustomerOutstandingSummary = (state: any) => {
  const orders = state.sales?.orders || [];
  const customerMap = new Map();
  orders.forEach((o: any) => {
    const custId = o.customer?.id || o.customerId || 'CUST-UNKNOWN';
    const custName = o.customerName || o.customer?.name || 'Unknown Customer';
    if (!customerMap.has(custId)) {
      customerMap.set(custId, {
        customerId: custId,
        customerName: custName,
        contactPerson: o.customer?.contactPerson || 'N/A',
        phoneEmail: `${o.customer?.mobile || 'N/A'} / ${o.customer?.email || 'N/A'}`,
        totalBusiness: 0,
        totalPaid: 0,
        outstandingAmount: 0,
        overdueAmount: 0,
        lastPayment: 'N/A',
        nextFollowUp: 'N/A',
        paymentRisk: 'LOW'
      });
    }
    const record = customerMap.get(custId);
    record.totalBusiness += Number(o.grandTotal ?? o.totalAmount ?? 0);
  });

  const payments = state.finance?.customerPayments || [];
  payments.forEach((p: any) => {
    const matchingOrder = orders.find((o: any) => o.id === p.orderId);
    const custId = matchingOrder?.customer?.id || matchingOrder?.customerId || p.customerId || 'CUST-UNKNOWN';
    const record = customerMap.get(custId);
    if (record && p.verificationStatus === 'FINANCE_VERIFIED') {
      record.totalPaid += p.paymentAmount;
      if (p.paymentDate) {
        if (record.lastPayment === 'N/A' || new Date(p.paymentDate) > new Date(record.lastPayment)) {
          record.lastPayment = p.paymentDate.split('T')[0];
        }
      }
    }
  });

  customerMap.forEach((record) => {
    record.outstandingAmount = Math.max(record.totalBusiness - record.totalPaid, 0);
    if (record.outstandingAmount > 100000) {
      record.paymentRisk = 'CRITICAL';
    } else if (record.outstandingAmount > 50000) {
      record.paymentRisk = 'HIGH';
    } else if (record.outstandingAmount > 10000) {
      record.paymentRisk = 'MEDIUM';
    } else {
      record.paymentRisk = 'LOW';
    }
  });
  return Array.from(customerMap.values());
};
