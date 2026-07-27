const fs = require('fs');
let content = fs.readFileSync('d:/prototype-next/modules/store/pages/StorePortal.jsx', 'utf8');

// 1. Add imports
content = content.replace("import { apiClient }", "import { useERPStore } from '@/store/erpStore';\nimport { apiClient }");

// 2. Add methods
content = content.replace("const resetAddMaterialForm = () => {", `const createPurchaseIndent = useERPStore(s => s.createPurchaseIndent);
  const createGoodsReceipt = useERPStore(s => s.createGoodsReceipt);
  const postGoodsReceiptToStock = useERPStore(s => s.postGoodsReceiptToStock);
  const resetAddMaterialForm = () => {`);

// 3. Update handleSubmitPORequest
const oldHandleSubmit = `const poId = 'PO-' + Math.floor(1000 + Math.random() * 9000);
    try {
      showToast('Submitting indent request to Finance...');
      await apiClient.post('/store/po-indents', {
        id: poId,
        items: poItems,
        notes: poNotes,
        expectedDate: poExpectedDate || null
      });
      await syncData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Indent Submission Failed', text: err.message });
      return;
    }`;

const newHandleSubmit = `const indentId = 'PI-' + Math.floor(10000 + Math.random() * 90000);
    
    createPurchaseIndent({
      id: indentId,
      material: poItems[0]?.name || 'Multiple Items',
      quantity: poItems[0]?.quantity || 0,
      unit: poItems[0]?.unit || 'Units',
      reason: poNotes || 'Routine Requirement',
      priority: 'Medium',
      requiredDate: poExpectedDate,
      createdBy: user?.name || 'Store Executive',
      items: poItems
    });`;
content = content.replace(oldHandleSubmit, newHandleSubmit);
content = content.replace(/Indent \$\{poId\} submitted with \$\{poItems\.length\} items to Finance/g, "Indent ${indentId} submitted with ${poItems.length} items to Plant Head");
content = content.replace(/Procurement Request \$\{poId\} has been successfully sent to Finance/g, "Indent ${indentId} has been successfully sent to Plant Head for approval");
content = content.replace("orderNo: poId,", "orderNo: indentId,");
content = content.replace("action: 'PO Request Created'", "action: 'Purchase Indent Created'");

// 4. Update Verify Delivery tab filter
content = content.replace(`po.status === 'PO_CREATED' || po.status === 'SENT_TO_STORE' || po.status === 'PARTIALLY_RECEIVED' || po.status === 'REJECTED'`, `po.status === 'VENDOR_ACCEPTED' || po.status === 'AWAITING_DELIVERY' || po.status === 'PO_ISSUED' || po.status === 'REJECTED'`);

// 5. Update verify delivery submit
const oldSaveVerify = `await apiClient.patch(\`/store/purchase-orders/\${po.id}/verify\`, {
              items: updatedItems,
              invoice_no: invoice_no,
              vehicle_no: vehicle_no,
              driver_name: driver_name,
              lr_number: lr_number,
              proof_images: [iFile, dFile !== 'N/A' ? dFile : null, p1File, p2File].filter(Boolean),
              notes: metadata.notes || '',
              status: 'AWAITING_FINANCE_CONFIRMATION'
            });
            await syncData();`;

const newSaveVerify = `createGoodsReceipt(po.id, {
              invoice_no: invoice_no,
              vehicle_no: vehicle_no,
              driver_name: driver_name,
              lr_number: lr_number,
              items: updatedItems,
              notes: metadata.notes || ''
            });`;
content = content.replace(oldSaveVerify, newSaveVerify);

// 6. Add renderPostStockTab and update tabs
const oldTabs = `const tabs = ["Create Request", "PO List", "Verify Delivery"];`;
const newTabs = `const tabs = ["Create Request", "PO List", "Verify Delivery", "Post Stock"];`;

const postStockLogic = `
  const renderPostStockTab = () => {
    const goodsReceipts = state.goodsReceipts || [];
    const approvedGRNs = goodsReceipts.filter(grn => grn.status === 'QC_APPROVED');

    const handlePostStock = (grn) => {
      Swal.fire({
        title: 'Post Stock?',
        text: \`Are you sure you want to post quantities from GRN \${grn.id} to raw inventory?\`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Post Stock',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          postGoodsReceiptToStock(grn.id);
          showToast(\`Stock posted successfully for GRN \${grn.id}\`);
        }
      });
    };

    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Post Stock (QC Approved)</h2>
        </div>
        <DataTable
          columns={[
            { header: 'GRN ID', accessor: 'id' },
            { header: 'PO Ref', accessor: 'purchaseOrderId' },
            { header: 'Items', cell: ({ row }) => row.original.items.map(i => \`\${i.acceptedQty || i.quantity} \${i.unit} \${i.name}\`).join(', ') },
            { header: 'QC Remarks', accessor: 'qcRemarks' },
            { 
              header: 'Status', 
              cell: () => <StatusBadge status="QC Approved" type="success" /> 
            }
          ]}
          data={approvedGRNs}
          actions={(row) => (
            <button 
              className="btn btn-primary" 
              onClick={() => handlePostStock(row)}
            >
              Post Stock
            </button>
          )}
          emptyMessage="No QC Approved GRNs pending for stock posting."
        />
      </div>
    );
  };

  const renderPOWorkspace = () => {
    const tabs = ["Create Request", "PO List", "Verify Delivery", "Post Stock"];
`;

content = content.replace("const renderPOWorkspace = () => {", postStockLogic);
content = content.replace(`{activeTab === "Verify Delivery" && renderPOVerifyDeliveryTab()}`, `{activeTab === "Verify Delivery" && renderPOVerifyDeliveryTab()}
        {activeTab === "Post Stock" && renderPostStockTab()}`);

fs.writeFileSync('d:/prototype-next/modules/store/pages/StorePortal.jsx', content);
console.log('Update successful!');
