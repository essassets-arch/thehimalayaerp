const fs = require('fs');
const path = 'd:/prototype-next/modules/store/pages/StorePortal.jsx';
let content = fs.readFileSync(path, 'utf8');

const hookTarget = "const postGoodsReceiptToStock = useERPStore(s => s.postGoodsReceiptToStock);";
if (!content.includes("const purchaseIndents = useERPStore(s => s.state.purchaseIndents")) {
  const storeHooks = `
  const purchaseIndents = useERPStore(s => s.state.purchaseIndents || []);
  const purchaseOrders = useERPStore(s => s.state.purchaseOrders || []);
  const goodsReceipts = useERPStore(s => s.state.goodsReceipts || []);
  const updatePurchaseIndent = useERPStore(s => s.updatePurchaseIndent);
`;
  content = content.replace(hookTarget, hookTarget + '\n' + storeHooks);
}

const startStr = "const renderPOCreateRequestTab = () => {";
const endStr = "const renderSettingsTab = () => {";
const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

const newStoreWorkspace = `
  const renderPOCreateRequestTab = () => {
    const handleCreateIndent = (e) => {
      e.preventDefault();
      const payload = {
        id: 'PI-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
        material: reqMaterial,
        quantity: reqQuantity,
        requiredDate: reqDate,
        reason: reqReason,
        priority: reqPriority
      };
      
      createPurchaseIndent(payload);
      showToast('Purchase Indent Created successfully. Pending Plant Head Approval.');
      setActiveTab('Indent Ledger');
      
      setReqMaterial(''); setReqQuantity(''); setReqDate(''); setReqReason(''); setReqPriority('Normal');
    };

    return (
      <div className="app-card">
        <div className="card-top-bar"><h2 className="card-heading">Create Material Purchase Indent</h2></div>
        <form onSubmit={handleCreateIndent} style={{ display: 'grid', gap: '16px', padding: '16px' }}>
          <div><label className="form-label">Material</label><input type="text" className="form-input" value={reqMaterial} onChange={e=>setReqMaterial(e.target.value)} required /></div>
          <div><label className="form-label">Quantity</label><input type="number" className="form-input" value={reqQuantity} onChange={e=>setReqQuantity(e.target.value)} required /></div>
          <div><label className="form-label">Required Date</label><input type="date" className="form-input" value={reqDate} onChange={e=>setReqDate(e.target.value)} required /></div>
          <div><label className="form-label">Priority</label>
            <select className="form-input" value={reqPriority} onChange={e=>setReqPriority(e.target.value)}>
              <option>Normal</option><option>Urgent</option><option>Critical</option>
            </select>
          </div>
          <div><label className="form-label">Reason</label><textarea className="form-input" value={reqReason} onChange={e=>setReqReason(e.target.value)} required></textarea></div>
          <div><button type="submit" className="btn btn-primary">Submit to Plant Head</button></div>
        </form>
      </div>
    );
  };

  const renderPOListTab = () => {
    const handleResubmit = (indent) => {
      updatePurchaseIndent(indent.id, {
        material: indent.material,
        quantity: indent.quantity,
        requiredDate: indent.requiredDate,
        reason: indent.reason,
        priority: indent.priority,
        resubmitted: true
      });
      showToast(\`Indent \${indent.id} resubmitted for approval.\`);
    };

    return (
      <div className="app-card">
        <div className="card-top-bar"><h2 className="card-heading">Indent Ledger</h2></div>
        <DataTable
          columns={[
            { header: 'Indent ID', accessor: 'id', render: row => <strong style={{color:'var(--color-primary)'}}>{row.id}</strong> },
            { header: 'Material', accessor: 'material' },
            { header: 'Quantity', accessor: 'quantity' },
            { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} /> },
            { header: 'Remarks', accessor: 'plantHeadRemarks' }
          ]}
          data={purchaseIndents}
          actions={row => (
            row.status === 'PLANT_HEAD_REJECTED' ? (
              <button className="btn-small btn-primary-small" onClick={() => handleResubmit(row)}>Edit & Resubmit</button>
            ) : null
          )}
          emptyMessage="No indents created yet."
        />
      </div>
    );
  };

  const renderPOVerifyDeliveryTab = () => {
    const awaitingDeliveries = purchaseOrders.filter(po => po.status === 'VENDOR_ACCEPTED');

    const handleCreateGRN = (e) => {
      e.preventDefault();
      const payload = {
        id: 'GRN-' + Math.floor(1000 + Math.random() * 9000),
        receivedQuantity: Number(delReceived),
        acceptedQuantity: Number(delAccepted),
        rejectedQuantity: Number(delRejected),
        invoiceNo: delInvoice,
        challanNo: delChallan,
        batchNo: delBatch,
        remarks: delRemarks
      };

      createGoodsReceipt(selectedPO.id, payload);
      showToast(\`GRN created for PO \${selectedPO.id}. Sent to QC.\`);
      setSelectedPO(null);
      setActiveTab('Indent Ledger');
    };

    if (selectedPO) {
      return (
        <div className="app-card">
          <div className="card-top-bar">
            <h2 className="card-heading">Create GRN for PO: {selectedPO.id}</h2>
            <button className="btn-small btn-outline-small" onClick={() => setSelectedPO(null)}>Back</button>
          </div>
          <form onSubmit={handleCreateGRN} style={{ display: 'grid', gap: '16px', padding: '16px' }}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px'}}>
              <div><label className="form-label">Received Qty</label><input type="number" className="form-input" value={delReceived} onChange={e=>setDelReceived(e.target.value)} required /></div>
              <div><label className="form-label">Accepted Qty</label><input type="number" className="form-input" value={delAccepted} onChange={e=>setDelAccepted(e.target.value)} required /></div>
              <div><label className="form-label">Rejected Qty</label><input type="number" className="form-input" value={delRejected} onChange={e=>setDelRejected(e.target.value)} required /></div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
              <div><label className="form-label">Invoice #</label><input type="text" className="form-input" value={delInvoice} onChange={e=>setDelInvoice(e.target.value)} required /></div>
              <div><label className="form-label">Challan #</label><input type="text" className="form-input" value={delChallan} onChange={e=>setDelChallan(e.target.value)} /></div>
            </div>
            <div><label className="form-label">Batch/Lot #</label><input type="text" className="form-input" value={delBatch} onChange={e=>setDelBatch(e.target.value)} /></div>
            <div><label className="form-label">Remarks</label><textarea className="form-input" value={delRemarks} onChange={e=>setDelRemarks(e.target.value)}></textarea></div>
            <div><button type="submit" className="btn btn-primary">Generate GRN (Send to QC)</button></div>
          </form>
        </div>
      );
    }

    return (
      <div className="app-card">
        <div className="card-top-bar"><h2 className="card-heading">Awaiting Deliveries</h2></div>
        <DataTable
          columns={[
            { header: 'PO Ref', accessor: 'poNumber', render: row => <strong>{row.poNumber || row.id}</strong> },
            { header: 'Vendor', accessor: 'vendorName' },
            { header: 'Expected Date', accessor: 'expectedDate', render: row => new Date(row.expectedDate).toLocaleDateString() },
            { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} /> }
          ]}
          data={awaitingDeliveries}
          actions={row => (
            <button className="btn-small btn-primary-small" onClick={() => setSelectedPO(row)}>Create GRN</button>
          )}
          emptyMessage="No orders currently awaiting delivery."
        />
      </div>
    );
  };

  const renderPostStockTab = () => {
    const qcApprovedGRNs = goodsReceipts.filter(grn => grn.status === 'QC_APPROVED');

    const handlePostStock = (grn) => {
      postGoodsReceiptToStock(grn.id);
      showToast(\`Stock posted successfully for GRN \${grn.id}\`);
    };

    return (
      <div className="app-card">
        <div className="card-top-bar"><h2 className="card-heading">Post Stock to Inventory</h2></div>
        <DataTable
          columns={[
            { header: 'GRN ID', accessor: 'id', render: row => <strong>{row.id}</strong> },
            { header: 'PO Ref', accessor: 'purchaseOrderId' },
            { header: 'Accepted Qty', accessor: 'acceptedQuantity' },
            { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} /> }
          ]}
          data={qcApprovedGRNs}
          actions={row => (
            <button className="btn-small btn-primary-small" onClick={() => handlePostStock(row)}>Post Stock</button>
          )}
          emptyMessage="No QC approved GRNs waiting for stock posting."
        />
      </div>
    );
  };

  const renderPOWorkspace = () => {
    const tabs = ["Create Request", "Indent Ledger", "Awaiting Deliveries", "Post Stock"];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '8px', paddingBottom: '4px' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab || (tab === "Indent Ledger" && activeTab === "PO List") || (tab === "Awaiting Deliveries" && activeTab === "Verify Delivery");
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab === "Indent Ledger" ? "PO List" : tab === "Awaiting Deliveries" ? "Verify Delivery" : tab)}
                style={{
                  padding: '10px 20px',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? '#000' : 'var(--color-text-secondary)',
                  border: 'none', borderRadius: '8px', fontWeight: isActive ? '700' : '600', cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {activeTab === "Create Request" && renderPOCreateRequestTab()}
        {activeTab === "PO List" && renderPOListTab()}
        {activeTab === "Verify Delivery" && renderPOVerifyDeliveryTab()}
        {activeTab === "Post Stock" && renderPostStockTab()}
      </div>
    );
  };

  `;

let result = content.substring(0, startIdx) + newStoreWorkspace + content.substring(endIdx);
fs.writeFileSync(path, result);
console.log('StorePortal rewritten!');
