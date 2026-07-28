const fs = require('fs');
let content = fs.readFileSync('c:/xampp/htdocs/prototype-next/store/erpStore.ts', 'utf8');

// 1. Update persistToStorage
content = content.replace(
  /if \(typeof window !== 'undefined' && window\.localStorage\) \{/g,
  `if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('erp_procurement_data_version_2', '2');
      if (Array.isArray(state.materialRejections)) window.localStorage.setItem('erp_material_rejections', JSON.stringify(state.materialRejections));
      if (Array.isArray(state.procurementAuditLogs)) window.localStorage.setItem('erp_procurement_audit_logs', JSON.stringify(state.procurementAuditLogs));
      if (Array.isArray(state.procurementDocuments)) window.localStorage.setItem('erp_procurement_documents', JSON.stringify(state.procurementDocuments));
      if (Array.isArray(state.procurementNotifications)) window.localStorage.setItem('erp_procurement_notifications', JSON.stringify(state.procurementNotifications));
      if (Array.isArray(state.materialReplacementSchedules)) window.localStorage.setItem('erp_material_replacement_schedules', JSON.stringify(state.materialReplacementSchedules));
      if (Array.isArray(state.replacementReceipts)) window.localStorage.setItem('erp_replacement_receipts', JSON.stringify(state.replacementReceipts));`
);

// 2. Update empty initial state
content = content.replace(
  /orders: \[\], workOrders: \[\].*?salaries: \[\]/g,
  'orders: [], workOrders: [], dispatches: [], payments: [], notifications: [], samples: [], rawInventory: [], customers: [], leads: [], quotations: [], purchaseIndents: [], purchaseOrders: [], goodsReceipts: [], vendorInvoices: [], vendorPayments: [], vendorReturns: [], analysisRequests: [], qcInspections: [], employees: [], payrollBatches: [], salaries: [], materialRejections: [], procurementAuditLogs: [], procurementDocuments: [], procurementNotifications: [], materialReplacementSchedules: [], replacementReceipts: []'
);

// 3. Update returned state from storage
content = content.replace(
  /salaries\n    \};/g,
  `salaries,
      materialRejections: getStorageList('erp_material_rejections'),
      procurementAuditLogs: getStorageList('erp_procurement_audit_logs'),
      procurementDocuments: getStorageList('erp_procurement_documents'),
      procurementNotifications: getStorageList('erp_procurement_notifications'),
      materialReplacementSchedules: getStorageList('erp_material_replacement_schedules'),
      replacementReceipts: getStorageList('erp_replacement_receipts')
    };`
);

// 4. Add migration logic
const migrationCode = `
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
`;

content = content.replace(/const getInitialStateFromStorage = \(\) => \{/, migrationCode + '\nconst getInitialStateFromStorage = () => {');

// We have three returns to patch inside getInitialStateFromStorage
// One in the try block, one in the catch block, and one at the top.
// Actually, earlier regex replaced the empty returns.

content = content.replace(/return \{\n      orders: getStorageList/g, 'const state = {\n      orders: getStorageList');
content = content.replace(/replacementReceipts: getStorageList\('erp_replacement_receipts'\)\n    \};/g, `replacementReceipts: getStorageList('erp_replacement_receipts')\n    };\n    return migratePersistedState(state);`);

// And for the empty returns:
content = content.replace(/return \{\n      orders: \[\], workOrders: \[\].*?replacementReceipts: \[\]\n    \};/g, 'return migratePersistedState({\n      orders: [], workOrders: [], dispatches: [], payments: [], notifications: [], samples: [], rawInventory: [], customers: [], leads: [], quotations: [], purchaseIndents: [], purchaseOrders: [], goodsReceipts: [], vendorInvoices: [], vendorPayments: [], vendorReturns: [], analysisRequests: [], qcInspections: [], employees: [], payrollBatches: [], salaries: [], materialRejections: [], procurementAuditLogs: [], procurementDocuments: [], procurementNotifications: [], materialReplacementSchedules: [], replacementReceipts: []\n    });');

fs.writeFileSync('c:/xampp/htdocs/prototype-next/store/erpStore.ts', content, 'utf8');
console.log("Migration script executed.");
