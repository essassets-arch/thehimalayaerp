const fs = require('fs');
let c = fs.readFileSync('store/erpStore.ts', 'utf8');

c = c.replace(/\n  \}\n\};\n\nconst safePersist/, `
const getInitialStateFromStorage = () => {
  if (typeof window === 'undefined') {
    return {
      sales: { leads: [], samples: [], quotations: [], orders: [], paymentConfirmations: [], replacementRequests: [], returnRequests: [] },
      auditEvents: [],
      workOrders: [], dispatches: [], payments: [], notifications: [], rawInventory: [], customers: [], purchaseIndents: [], purchaseOrders: [], goodsReceipts: [], vendorInvoices: [], vendorPayments: [], vendorReturns: [], analysisRequests: [], qcInspections: [], employees: [], payrollBatches: [], salaries: [], materialRejections: [], procurementAuditLogs: [], procurementDocuments: [], procurementNotifications: [], materialReplacementSchedules: [], replacementReceipts: []
    };
  }
  try {
    const getStorageList = (key) => {
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
      sales: {
        leads: getStorageList('erp_leads'),
        samples: getStorageList('erp_samples'),
        quotations: getStorageList('erp_quotations'),
        orders: getStorageList('erp_orders'),
        paymentConfirmations: getStorageList('erp_sales_payments'),
        replacementRequests: getStorageList('erp_sales_replacements'),
        returnRequests: getStorageList('erp_sales_returns'),
      },
      auditEvents: getStorageList('erp_sales_audits'),
      workOrders: getStorageList('erp_work_orders'),
      dispatches: getStorageList('erp_dispatches'),
      payments: getStorageList('erp_payments'),
      notifications: getStorageList('erp_notifications'),
      rawInventory: getStorageList('erp_inventory'),
      customers: getStorageList('erp_customers'),
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
      sales: { leads: [], samples: [], quotations: [], orders: [], paymentConfirmations: [], replacementRequests: [], returnRequests: [] },
      auditEvents: [],
      workOrders: [], dispatches: [], payments: [], notifications: [], rawInventory: [], customers: [], purchaseIndents: [], purchaseOrders: [], goodsReceipts: [], vendorInvoices: [], vendorPayments: [], vendorReturns: [], analysisRequests: [], qcInspections: [], employees: [], payrollBatches: [], salaries: [], materialRejections: [], procurementAuditLogs: [], procurementDocuments: [], procurementNotifications: [], materialReplacementSchedules: [], replacementReceipts: []
    };
  }
};

const safePersist`);

fs.writeFileSync('store/erpStore.ts', c);
console.log("Fixed!");
