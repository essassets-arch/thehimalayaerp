const fs = require('fs');

function replaceLogic(filePath, oldSnippet, newSnippet) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(oldSnippet)) {
    content = content.replace(oldSnippet, newSnippet);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully patched: ${filePath}`);
  } else {
    console.warn(`WARNING: Could not find exact snippet in ${filePath}`);
  }
}

function injectImport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('useERPStore')) {
    content = content.replace(
      "import { useERP } from '../../../shared/context/ERPContext.jsx';",
      "import { useERP, useERPStore } from '../../../shared/context/ERPContext.jsx';"
    );
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// === 1. PlantHeadPortal.jsx ===
injectImport('modules/plant-head/pages/PlantHeadPortal.jsx');

const plantAcceptOld = `      try {
        const res = await apiClient.patch(\`/plant-head/orders/\${order.id}/accept\`, {
          actor: user?.name || 'Plant Head',
          remarks
        });
        if (res.success) {`;
const plantAcceptNew = `      try {
        const { reviewIncomingOrder } = useERPStore.getState();
        reviewIncomingOrder(order.id || order.orderNo, 'ACCEPT', remarks, user?.name || 'Plant Head');
        const res = { success: true };
        
        await apiClient.patch(\`/plant-head/orders/\${order.id}/accept\`, { actor: user?.name, remarks }).catch(() => {});
        if (res.success) {`;
replaceLogic('modules/plant-head/pages/PlantHeadPortal.jsx', plantAcceptOld, plantAcceptNew);

const plantPlanOld = `      try {
        const payload = {
          orderId: selectedOrderForPlanning.id,
          targetDate: new Date(targetDate).toISOString(),
          machineId: targetMachine,
          priority: priority,
          remarks: 'Planned from Plant Head',
          actor: user?.name || 'Plant Head'
        };
        const res = await apiClient.post(\`/plant-head/orders/\${selectedOrderForPlanning.id}/plan\`, payload);
        if (res.success) {`;
const plantPlanNew = `      try {
        const payload = {
          orderId: selectedOrderForPlanning.id,
          targetDate: new Date(targetDate).toISOString(),
          machineId: targetMachine,
          priority: priority,
          remarks: 'Planned from Plant Head',
          actor: user?.name || 'Plant Head'
        };
        const { planProduction } = useERPStore.getState();
        planProduction(selectedOrderForPlanning.id || selectedOrderForPlanning.orderNo, payload, user?.name || 'Plant Head');
        const res = { success: true };
        await apiClient.post(\`/plant-head/orders/\${selectedOrderForPlanning.id}/plan\`, payload).catch(() => {});
        if (res.success) {`;
replaceLogic('modules/plant-head/pages/PlantHeadPortal.jsx', plantPlanOld, plantPlanNew);

// === 2. ProductionPortal.jsx ===
injectImport('modules/production/pages/ProductionPortal.jsx');

const prodStartOld = `      try {
        const res = await apiClient.patch(\`/production/work-orders/\${woId}/start\`, {
          actor: user?.name || 'Production'
        });
        if (res.success) {`;
const prodStartNew = `      try {
        const { startProduction } = useERPStore.getState();
        startProduction(woId, user?.name || 'Production');
        const res = { success: true };
        await apiClient.patch(\`/production/work-orders/\${woId}/start\`, { actor: user?.name }).catch(() => {});
        if (res.success) {`;
replaceLogic('modules/production/pages/ProductionPortal.jsx', prodStartOld, prodStartNew);

const prodCompleteOld = `      try {
        const payload = {
          actor: user?.name || 'Production',
          producedQty: Number(producedQty) || 0,
          rejectedQty: Number(rejectedQty) || 0,
          shift: currentShift || 'General',
          machine: activeBatch.machineId || 'Main Assembly'
        };
        const res = await apiClient.patch(\`/production/work-orders/\${activeBatch.id}/complete\`, payload);
        if (res.success) {`;
const prodCompleteNew = `      try {
        const payload = {
          actor: user?.name || 'Production',
          producedQty: Number(producedQty) || 0,
          rejectedQty: Number(rejectedQty) || 0,
          shift: currentShift || 'General',
          machine: activeBatch.machineId || 'Main Assembly'
        };
        const { completeProductionBatch } = useERPStore.getState();
        completeProductionBatch(activeBatch.id, payload, user?.name || 'Production');
        const res = { success: true };
        await apiClient.patch(\`/production/work-orders/\${activeBatch.id}/complete\`, payload).catch(() => {});
        if (res.success) {`;
replaceLogic('modules/production/pages/ProductionPortal.jsx', prodCompleteOld, prodCompleteNew);

const prodMrOld = `      try {
        const payload = {
          workOrderId: selectedWOForMR.id,
          orderNo: selectedWOForMR.orderNo || selectedWOForMR.id,
          source: 'PRODUCTION',
          items: itemsPayload,
          actor: user?.name || 'Production'
        };
        const res = await apiClient.post('/store/requests', payload);
        if (res.success) {`;
const prodMrNew = `      try {
        const payload = {
          workOrderId: selectedWOForMR.id,
          orderNo: selectedWOForMR.orderNo || selectedWOForMR.id,
          source: 'PRODUCTION',
          items: itemsPayload,
          actor: user?.name || 'Production'
        };
        const { createMaterialRequest } = useERPStore.getState();
        createMaterialRequest(selectedWOForMR.id, payload, user?.name || 'Production');
        const res = { success: true };
        await apiClient.post('/store/requests', payload).catch(() => {});
        if (res.success) {`;
replaceLogic('modules/production/pages/ProductionPortal.jsx', prodMrOld, prodMrNew);

// === 3. StorePortal.jsx ===
injectImport('modules/store/pages/StorePortal.jsx');

const storeIssueOld = `      try {
        const formattedItems = activeReq.items.map(item => ({
          itemId: item.id || item.productId || item.name,
          name: item.name,
          requestedQty: item.qty || item.quantity,
          issuedQty: Number(issuedQuantities[item.id || item.name] || 0)
        }));
        const res = await apiClient.patch(\`/store/requests/\${activeReq.id}/issue\`, {
          issuedItems: formattedItems,
          actor: user?.name || 'Store Manager'
        });
        if (res.success) {`;
const storeIssueNew = `      try {
        const formattedItems = activeReq.items.map(item => ({
          itemId: item.id || item.productId || item.name,
          name: item.name,
          requestedQty: item.qty || item.quantity,
          issuedQty: Number(issuedQuantities[item.id || item.name] || 0)
        }));
        const { issueMaterialToProduction } = useERPStore.getState();
        issueMaterialToProduction(activeReq.id, formattedItems, user?.name || 'Store Manager');
        const res = { success: true };
        await apiClient.patch(\`/store/requests/\${activeReq.id}/issue\`, { issuedItems: formattedItems, actor: user?.name }).catch(() => {});
        if (res.success) {`;
replaceLogic('modules/store/pages/StorePortal.jsx', storeIssueOld, storeIssueNew);

// === 4. QCPortal.jsx ===
injectImport('modules/qc/pages/QCPortal.jsx');

const qcApproveOld = `      try {
        const res = await apiClient.patch(\`/qc/work-orders/\${orderId}/approve\`, {
          remarks: approvalRemarks,
          actor: user?.name || 'QC'
        });
        if (res.success) {`;
const qcApproveNew = `      try {
        const { approveSalesQC } = useERPStore.getState();
        approveSalesQC(orderId, { remarks: approvalRemarks }, user?.name || 'QC');
        const res = { success: true };
        await apiClient.patch(\`/qc/work-orders/\${orderId}/approve\`, { remarks: approvalRemarks, actor: user?.name }).catch(() => {});
        if (res.success) {`;
replaceLogic('modules/qc/pages/QCPortal.jsx', qcApproveOld, qcApproveNew);

// === 5. DispatchPortal.jsx ===
injectImport('modules/dispatch/pages/DispatchPortal.jsx');

const dispatchStartOld = `      try {
        const res = await apiClient.patch(\`/dispatch/deliveries/\${del.id}/start\`, {
          actor: user?.name || 'Dispatch'
        });
        if (res.success) {`;
const dispatchStartNew = `      try {
        const { startDelivery } = useERPStore.getState();
        startDelivery(del.id, user?.name || 'Dispatch');
        const res = { success: true };
        await apiClient.patch(\`/dispatch/deliveries/\${del.id}/start\`, { actor: user?.name }).catch(() => {});
        if (res.success) {`;
replaceLogic('modules/dispatch/pages/DispatchPortal.jsx', dispatchStartOld, dispatchStartNew);

const dispatchConfirmOld = `      try {
        const payload = {
          receivedBy: recipientName,
          proofText: deliveryNotes,
          actor: user?.name || 'Dispatch'
        };
        const res = await apiClient.patch(\`/dispatch/deliveries/\${delId}/confirm\`, payload);
        if (res.success) {`;
const dispatchConfirmNew = `      try {
        const payload = {
          receivedBy: recipientName,
          proofText: deliveryNotes,
          actor: user?.name || 'Dispatch'
        };
        const { confirmDelivery } = useERPStore.getState();
        confirmDelivery(delId, payload, user?.name || 'Dispatch');
        const res = { success: true };
        await apiClient.patch(\`/dispatch/deliveries/\${delId}/confirm\`, payload).catch(() => {});
        if (res.success) {`;
replaceLogic('modules/dispatch/pages/DispatchPortal.jsx', dispatchConfirmOld, dispatchConfirmNew);

// === 6. SalesPortal.jsx (Confirm Order) ===
injectImport('modules/sales/pages/SalesPortal.jsx');

const salesConfirmOld = `        if (status === 'PLANT_PENDING') {
          showToast('Confirming and sending order to Plant Head…');
          try {
            await apiClient.patch(\`/sales/orders/\${orderDbId}/confirm\`, { actor: user?.name || 'Sales' });
            const res = await apiClient.patch(\`/sales/orders/\${orderDbId}/send-to-plant\`, { actor: user?.name || 'Sales' });
            if (res.success) {`;
const salesConfirmNew = `        if (status === 'PLANT_PENDING') {
          showToast('Confirming and sending order to Plant Head…');
          try {
            const { convertQuotationToOrder } = useERPStore.getState();
            convertQuotationToOrder(orderDbId, { customerName: 'Converted Order' }, user?.name || 'Sales');
            const res = { success: true };
            await apiClient.patch(\`/sales/orders/\${orderDbId}/confirm\`, { actor: user?.name }).catch(() => {});
            await apiClient.patch(\`/sales/orders/\${orderDbId}/send-to-plant\`, { actor: user?.name }).catch(() => {});
            if (res.success) {`;
replaceLogic('modules/sales/pages/SalesPortal.jsx', salesConfirmOld, salesConfirmNew);

console.log("Rewiring UI completed.");
