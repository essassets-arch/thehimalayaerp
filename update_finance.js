const fs = require('fs');
let content = fs.readFileSync('d:/prototype-next/modules/finance/pages/FinancePortal.jsx', 'utf8');

// 1. Add useERPStore
content = content.replace("import { useERP } from '../../../shared/context/ERPContext';", "import { useERP } from '../../../shared/context/ERPContext';\nimport { useERPStore } from '@/store/erpStore';");

content = content.replace("const showToast = require('@/store/notificationStore').useNotificationStore(s => s.showToast);", `const showToast = require('@/store/notificationStore').useNotificationStore(s => s.showToast);
  const purchaseIndents = useERPStore(s => s.state.purchaseIndents || []);
  const issuePurchaseOrder = useERPStore(s => s.issuePurchaseOrder);
  const simulateVendorAcceptance = useERPStore(s => s.simulateVendorAcceptance);`);


// 2. Update Pending Requests Tab
const oldPendingFilter = `const purchaseOrders = state.purchaseOrders || [];
    const pendingRequests = purchaseOrders.filter(po => po.status === 'PENDING_PO');`;
const newPendingFilter = `const pendingRequests = purchaseIndents.filter(i => i.status === 'SUPER_ADMIN_APPROVED');`;
content = content.replace(oldPendingFilter, newPendingFilter);

content = content.replace(/PO Ref ID/g, "Indent ID");

const oldHandleConvertPO = `const handleConvertPO = (po) => {
      setSelectedPO(po);
      setActiveTab('Create PO');
    };`;
const newHandleConvertPO = `const handleConvertPO = (indent) => {
      setSelectedPO(indent);
      setActiveTab('Create PO');
    };`;
content = content.replace(oldHandleConvertPO, newHandleConvertPO);


// 3. Update Create PO Tab
const oldCreateFilter = `const purchaseOrders = state.purchaseOrders || [];
    const approvedRequests = purchaseOrders.filter(po => po.status === 'PENDING_PO');

    const rawMaterialsList = state.rawInventory || [`;
const newCreateFilter = `const approvedRequests = purchaseIndents.filter(i => i.status === 'SUPER_ADMIN_APPROVED');

    const rawMaterialsList = state.rawInventory || [`;
content = content.replace(oldCreateFilter, newCreateFilter);

const oldCreateCheck = `if (!selectedPO || selectedPO.status !== 'PENDING_PO') {`;
const newCreateCheck = `if (!selectedPO || selectedPO.status !== 'SUPER_ADMIN_APPROVED') {`;
content = content.replace(oldCreateCheck, newCreateCheck);

const oldGenPOSubmit = `try {
        const payload = {
          items: itemsToProcess,
          vendorId: selectedVendorId,
          supplierName: supplierName || 'Selected Vendor',
          paymentTerms: poPaymentTerms,
          expectedDate: poExpectedDate,
          status: 'PO_CREATED',
          history: [...(selectedPO.history || []), { stage: 'PO Generated', remarks: 'Finance generated PO', timestamp: new Date().toISOString() }]
        };
        await apiClient.patch(\`/finance/purchase-orders/\${selectedPO.id}/generate\`, payload);
        await syncData();
      } catch (err) {
        dispatch({
          type: 'UPDATE_PO',
          payload: {
            id: selectedPO.id,
            items: itemsToProcess,
            vendorId: selectedVendorId,
            supplierName: supplierName || 'Selected Vendor',
            paymentTerms: poPaymentTerms,
            expectedDate: poExpectedDate,
            status: 'PO_CREATED',
            history: [...(selectedPO.history || []), { stage: 'PO Generated', remarks: 'Finance generated PO', timestamp: new Date().toISOString() }]
          }
        });
      }`;
const newGenPOSubmit = `try {
        const payload = {
          indentId: selectedPO.id,
          vendorId: selectedVendorId,
          vendorName: supplierName || 'Selected Vendor',
          paymentTerms: poPaymentTerms,
          expectedDate: poExpectedDate,
          items: itemsToProcess
        };
        issuePurchaseOrder(payload);
      } catch (err) {
        console.error(err);
      }`;
content = content.replace(oldGenPOSubmit, newGenPOSubmit);


// 4. Update All POs Tab - Add simulate Vendor Acceptance
const oldAllPOs = `const purchaseOrders = state.purchaseOrders || [];
    return (`;
const newAllPOs = `const purchaseOrders = state.purchaseOrders || [];

    const handleVendorAcceptance = (po) => {
      Swal.fire({
        title: 'Simulate Vendor Acceptance?',
        text: 'This is a prototype feature to test the workflow. It simulates the vendor accepting the PO.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Accept PO'
      }).then(res => {
        if (res.isConfirmed) {
          simulateVendorAcceptance(po.id);
          showToast('Vendor acceptance simulated!');
        }
      });
    };

    return (`;
content = content.replace(oldAllPOs, newAllPOs);

const oldAllPOsActions = `actions={(row) => (
              <button 
                className="btn-small btn-secondary-small"
                onClick={() => {
                  setSelectedPO(row);
                  setActiveTab('Verify & Close');
                }}
              >
                Track Status
              </button>
            )}`;
const newAllPOsActions = `actions={(row) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-small btn-secondary-small"
                  onClick={() => {
                    setSelectedPO(row);
                    setActiveTab('Verify & Close');
                  }}
                >
                  Track Status
                </button>
                {row.status === 'PO_ISSUED' && (
                  <button 
                    className="btn-small btn-primary-small"
                    onClick={() => handleVendorAcceptance(row)}
                  >
                    Simulate Vendor Acceptance
                  </button>
                )}
              </div>
            )}`;
content = content.replace(oldAllPOsActions, newAllPOsActions);

fs.writeFileSync('d:/prototype-next/modules/finance/pages/FinancePortal.jsx', content);
console.log('Update successful!');
