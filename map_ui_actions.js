const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  replacements.forEach(({ search, replace }) => {
    if (content.match(search)) {
      content = content.replace(search, replace);
      changed = true;
    } else {
      console.warn(`WARNING: Could not find match for regex in ${filePath}`);
    }
  });
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. Map PlantHeadPortal.jsx
replaceInFile('modules/plant-head/pages/PlantHeadPortal.jsx', [
  {
    // handleAcceptOrder
    search: /const res = await apiClient\.patch\(`\/plant-head\/orders\/\$\{order\.id\}\/accept`, \{\n\s*actor: user\?\.name \|\| 'Plant Head',\n\s*remarks\n\s*\}\);/g,
    replace: `// Strict State Machine Map
        const { reviewIncomingOrder } = useERPStore.getState();
        reviewIncomingOrder(order.id || order.orderNo, 'ACCEPT', remarks, user?.name || 'Plant Head');
        const res = { success: true };`
  },
  {
    // handleCreateWorkOrder
    search: /const res = await apiClient\.post\('\/production\/work-orders', payload\);/g,
    replace: `// Strict State Machine Map
        const { planProduction } = useERPStore.getState();
        planProduction(order.id || order.orderNo, payload, user?.name || 'Plant Head');
        const res = { success: true };`
  },
  {
    // MR Approval
    search: /const res = await apiClient\.patch\(`\/plant-head\/requests\/\$\{req\.id\}\/approve`, \{\s*actor: user\?\.name \|\| 'Plant Head'\s*\}\);/g,
    replace: `// Strict State Machine Map
        const { approveMaterialRequest } = useERPStore.getState();
        approveMaterialRequest(req.id, user?.name || 'Plant Head');
        const res = { success: true };`
  }
]);

// 2. Map StorePortal.jsx (Issue Material)
replaceInFile('modules/store/pages/StorePortal.jsx', [
  {
    search: /const res = await apiClient\.patch\(`\/store\/requests\/\$\{activeReq\.id\}\/issue`, \{\s*issuedItems: formattedItems,\s*actor: user\?\.name \|\| 'Store Manager'\s*\}\);/g,
    replace: `// Strict State Machine Map
        const { issueMaterialToProduction } = useERPStore.getState();
        issueMaterialToProduction(activeReq.id, formattedItems, user?.name || 'Store Manager');
        const res = { success: true };`
  }
]);

// 3. Map ProductionPortal.jsx
replaceInFile('modules/production/pages/ProductionPortal.jsx', [
  {
    // startProduction
    search: /const res = await apiClient\.patch\(`\/production\/work-orders\/\$\{woId\}\/start`, \{\s*actor: user\?\.name \|\| 'Production'\s*\}\);/g,
    replace: `// Strict State Machine Map
        const { startProduction } = useERPStore.getState();
        startProduction(woId, user?.name || 'Production');
        const res = { success: true };`
  },
  {
    // completeProduction
    search: /const res = await apiClient\.patch\(`\/production\/work-orders\/\$\{activeBatch\.id\}\/complete`, payload\);/g,
    replace: `// Strict State Machine Map
        const { completeProductionBatch } = useERPStore.getState();
        completeProductionBatch(activeBatch.id, payload, user?.name || 'Production');
        const res = { success: true };`
  },
  {
    // create MR
    search: /const res = await apiClient\.post\('\/store\/requests', payload\);/g,
    replace: `// Strict State Machine Map
        const { createMaterialRequest } = useERPStore.getState();
        createMaterialRequest(payload.workOrderId || payload.sourceId, payload, user?.name || 'Production');
        const res = { success: true };`
  }
]);

// 4. Map QCPortal.jsx
replaceInFile('modules/qc/pages/QCPortal.jsx', [
  {
    // approve order QC
    search: /const res = await apiClient\.patch\(`\/qc\/work-orders\/\$\{orderId\}\/approve`, \{\s*remarks: approvalRemarks,\s*actor: user\?\.name \|\| 'QC'\s*\}\);/g,
    replace: `// Strict State Machine Map
        const { approveSalesQC } = useERPStore.getState();
        approveSalesQC(orderId, { remarks: approvalRemarks }, user?.name || 'QC');
        const res = { success: true };`
  }
]);

// 5. Map DispatchPortal.jsx
replaceInFile('modules/dispatch/pages/DispatchPortal.jsx', [
  {
    // dispatch
    search: /const res = await apiClient\.post\('\/dispatch\/deliveries', payload\);/g,
    replace: `// Strict State Machine Map
        const { createDispatchForOrder } = useERPStore.getState();
        createDispatchForOrder(selectedOrder.id || selectedOrder.orderNo, payload, user?.name || 'Dispatch');
        const res = { success: true };`
  },
  {
    // startDelivery
    search: /const res = await apiClient\.patch\(`\/dispatch\/deliveries\/\$\{del\.id\}\/start`, \{\s*actor: user\?\.name \|\| 'Dispatch'\s*\}\);/g,
    replace: `// Strict State Machine Map
        const { startDelivery } = useERPStore.getState();
        startDelivery(del.id, user?.name || 'Dispatch');
        const res = { success: true };`
  },
  {
    // confirmDelivery
    search: /const res = await apiClient\.patch\(`\/dispatch\/deliveries\/\$\{delId\}\/confirm`, payload\);/g,
    replace: `// Strict State Machine Map
        const { confirmDelivery } = useERPStore.getState();
        confirmDelivery(delId, payload, user?.name || 'Dispatch');
        const res = { success: true };`
  }
]);

// 6. Map SalesPortal.jsx (and hooks)
// Since Sales uses hooks, we'll map the UI inside useQuotations and useOrders
replaceInFile('modules/sales/hooks/useQuotations.js', [
  {
    search: /const res = await quotationsService\.confirmOrder\(quotation, customers, user\);/g,
    replace: `// Strict State Machine Map
      const { convertQuotationToOrder } = require('../../../shared/context/ERPContext.jsx').useERPStore.getState();
      convertQuotationToOrder(quotation.id, { customerName: quotation.customerName || quotation.company, products: quotation.items, grandTotal: quotation.grandTotal }, user?.name || 'Sales');
      const res = { success: true, data: { orderNo: quotation.id } };`
  }
]);

console.log('UI Mapping Script Completed.');
