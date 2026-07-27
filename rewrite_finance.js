const fs = require('fs');
const path = 'd:/prototype-next/modules/finance/pages/FinancePortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure useERPStore is imported
if (!content.includes("import { useERPStore } from '@/store/erpStore';")) {
  content = content.replace("import { useERP } from '../../../shared/context/ERPContext';", "import { useERP } from '../../../shared/context/ERPContext';\nimport { useERPStore } from '@/store/erpStore';");
}

// Add state destructurings inside FinancePortal component
const storeHooks = `
  const purchaseIndents = useERPStore(s => s.state.purchaseIndents || []);
  const purchaseOrders = useERPStore(s => s.state.purchaseOrders || []);
  const goodsReceipts = useERPStore(s => s.state.goodsReceipts || []);
  const createPurchaseOrderFromIndent = useERPStore(s => s.createPurchaseOrderFromIndent);
  const submitPurchaseOrder = useERPStore(s => s.submitPurchaseOrder);
  const issuePurchaseOrder = useERPStore(s => s.issuePurchaseOrder);
  const acceptPurchaseOrderByVendor = useERPStore(s => s.acceptPurchaseOrderByVendor);
  const createVendorPayment = useERPStore(s => s.createVendorPayment);
  const completeVendorPayment = useERPStore(s => s.completeVendorPayment);
`;
// Replace the old destructurings if they exist, else inject them near showToast
const hookTarget = "const showToast = require('@/store/notificationStore').useNotificationStore(s => s.showToast);";
if (content.includes("const purchaseIndents = useERPStore(")) {
  // Already has some, let's remove them to avoid duplicates (crude but works if they are consecutive)
  content = content.replace(/const purchaseIndents = useERPStore[\s\S]*?const simulateVendorAcceptance = useERPStore\(s => s.simulateVendorAcceptance\);/, '');
}
content = content.replace(hookTarget, hookTarget + '\n' + storeHooks);

const startStr = "const renderPendingRequestsTab = () => {";
const endStr = "const renderLedgerWorkspace = () => {";
const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find start/end markers");
  process.exit(1);
}

const newPOWorkspaceCode = `
  const renderPendingRequestsTab = () => {
    const pendingIndents = purchaseIndents.filter(i => i.status === 'PLANT_HEAD_APPROVED');

    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Approved Indents (Waiting for PO)</h2>
        </div>
        <DataTable 
          columns={[
            { header: 'Indent ID', accessor: 'id', render: row => <strong style={{color: 'var(--color-primary)'}}>{row.id}</strong> },
            { header: 'Material', accessor: 'material' },
            { header: 'Quantity', accessor: 'quantity' },
            { header: 'Required Date', accessor: 'requiredDate', render: row => row.requiredDate ? new Date(row.requiredDate).toLocaleDateString() : '-' },
            { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} /> }
          ]}
          data={pendingIndents}
          actions={row => (
            <button className="btn-small btn-primary-small" onClick={() => {
              setSelectedPO(row);
              setActiveTab('Create PO');
            }}>
              Convert to Draft PO
            </button>
          )}
          emptyMessage="No plant-head approved indents waiting for PO."
        />
      </div>
    );
  };

  const renderCreatePOTab = () => {
    if (!selectedPO || selectedPO.status !== 'PLANT_HEAD_APPROVED') {
      return (
        <div className="app-card">
          <div className="card-top-bar"><h2 className="card-heading">Select an Approved Indent to Generate PO</h2></div>
        </div>
      );
    }
    
    const handleGeneratePO = (e) => {
      e.preventDefault();
      const poPayload = {
        id: 'PO-DRAFT-' + Date.now(),
        vendorId: selectedVendorId,
        vendorName: supplierName || 'Selected Vendor',
        paymentTerms: poPaymentTerms,
        expectedDate: poExpectedDate,
        items: [{
          name: selectedPO.material,
          quantity: selectedPO.quantity,
          rate: Number(addMatRate || 0)
        }],
        gst: poGst,
        freight: poFreight
      };
      
      createPurchaseOrderFromIndent(selectedPO.id, poPayload);
      showToast('Draft PO created successfully!');
      setSelectedPO(null);
      setActiveTab('Draft POs');
    };

    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Create Draft PO for {selectedPO.id}</h2>
        </div>
        <form onSubmit={handleGeneratePO} style={{ display: 'grid', gap: '16px', padding: '16px' }}>
          <div>
            <label className="form-label">Vendor</label>
            <input type="text" className="form-input" value={supplierName} onChange={e => setSupplierName(e.target.value)} required placeholder="Vendor Name" />
          </div>
          <div>
            <label className="form-label">Material Rate (,1)</label>
            <input type="number" className="form-input" value={addMatRate} onChange={e => setAddMatRate(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">GST %</label>
              <input type="number" className="form-input" value={poGst} onChange={e => setPoGst(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Freight (,1)</label>
              <input type="number" className="form-input" value={poFreight} onChange={e => setPoFreight(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Payment Terms</label>
            <input type="text" className="form-input" value={poPaymentTerms} onChange={e => setPoPaymentTerms(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Expected Delivery Date</label>
            <input type="date" className="form-input" value={poExpectedDate} onChange={e => setPoExpectedDate(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">Create Draft PO</button>
            <button type="button" className="btn btn-outline" onClick={() => setActiveTab('Pending Requests')}>Cancel</button>
          </div>
        </form>
      </div>
    );
  };

  const renderDraftPOsTab = () => {
    const draftPOs = purchaseOrders.filter(po => po.status === 'DRAFT' || po.status === 'SUPER_ADMIN_REJECTED');

    const handleSubmitForApproval = (po) => {
      submitPurchaseOrder(po.id);
      showToast(\`PO \${po.id} submitted for Super Admin Approval\`);
    };

    return (
      <div className="app-card">
        <div className="card-top-bar"><h2 className="card-heading">Draft POs</h2></div>
        <DataTable 
          columns={[
            { header: 'PO ID', accessor: 'id', render: row => <strong>{row.id}</strong> },
            { header: 'Indent ID', accessor: 'indentId' },
            { header: 'Vendor', accessor: 'vendorName' },
            { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} /> },
            { header: 'Remarks', accessor: 'rejectionReason' }
          ]}
          data={draftPOs}
          actions={row => (
            <button className="btn-small btn-secondary-small" onClick={() => handleSubmitForApproval(row)}>
              Submit for Approval
            </button>
          )}
          emptyMessage="No Draft POs."
        />
      </div>
    );
  };

  const renderApprovedPOsTab = () => {
    const approvedPOs = purchaseOrders.filter(po => po.status === 'SUPER_ADMIN_APPROVED');

    const handleIssuePO = (po) => {
      const officialPoNo = 'PO-2026-' + Math.floor(1000 + Math.random() * 9000);
      issuePurchaseOrder(po.id, officialPoNo);
      showToast(\`PO officially issued as \${officialPoNo}\`);
    };

    return (
      <div className="app-card">
        <div className="card-top-bar"><h2 className="card-heading">Approved POs (Ready to Issue)</h2></div>
        <DataTable 
          columns={[
            { header: 'PO ID', accessor: 'id', render: row => <strong>{row.id}</strong> },
            { header: 'Indent ID', accessor: 'indentId' },
            { header: 'Vendor', accessor: 'vendorName' },
            { header: 'Approved By', accessor: 'history', render: row => row.history?.slice(-1)[0]?.actor || 'Super Admin' },
            { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} /> }
          ]}
          data={approvedPOs}
          actions={row => (
            <button className="btn-small btn-primary-small" onClick={() => handleIssuePO(row)}>
              Issue PO
            </button>
          )}
          emptyMessage="No approved POs waiting to be issued."
        />
      </div>
    );
  };

  const renderAllPOsTab = () => {
    const handleVendorAccept = (po) => {
      acceptPurchaseOrderByVendor(po.id, { vendorResponseDate: new Date().toISOString() });
      showToast('Vendor acceptance simulated!');
    };

    return (
      <div className="app-card">
        <div className="card-top-bar"><h2 className="card-heading">All Purchase Orders</h2></div>
        <DataTable 
          columns={[
            { header: 'Official PO Ref', accessor: 'poNumber', render: row => <strong style={{color:'var(--color-primary)'}}>{row.poNumber || row.id}</strong> },
            { header: 'Indent Ref', accessor: 'indentId' },
            { header: 'Vendor', accessor: 'vendorName' },
            { header: 'Date Created', accessor: 'createdAt', render: row => new Date(row.createdAt).toLocaleDateString() },
            { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} /> }
          ]}
          data={purchaseOrders}
          actions={row => (
            <div style={{display:'flex', gap:'8px'}}>
              {row.status === 'PO_ISSUED' && (
                <button className="btn-small btn-outline-small" onClick={() => handleVendorAccept(row)}>
                  Simulate Vendor Acceptance
                </button>
              )}
            </div>
          )}
          emptyMessage="No POs found."
        />
      </div>
    );
  };

  const renderVendorPaymentsTab = () => {
    // Show GRNs that are STOCK_POSTED but whose associated PO is not PURCHASE_COMPLETED
    const eligibleGRNs = goodsReceipts.filter(grn => grn.status === 'STOCK_POSTED');

    const handlePayVendor = (grn) => {
      const poId = grn.purchaseOrderId;
      createVendorPayment(poId, { amount: 50000 }); // simulated partial/full payment creation
      completeVendorPayment(\`PAY-\${Date.now()}\`, { poId }); // auto-complete for prototyping
      showToast(\`Payment processed and purchase completed for PO \${poId}.\`);
    };

    return (
      <div className="app-card">
        <div className="card-top-bar"><h2 className="card-heading">Vendor Payments</h2></div>
        <DataTable 
          columns={[
            { header: 'GRN ID', accessor: 'id', render: row => <strong>{row.id}</strong> },
            { header: 'PO Ref', accessor: 'purchaseOrderId' },
            { header: 'Invoice', accessor: 'invoiceNo' },
            { header: 'Status', accessor: 'status', render: row => <StatusBadge status={row.status} /> }
          ]}
          data={eligibleGRNs}
          actions={row => {
            const po = purchaseOrders.find(p => p.id === row.purchaseOrderId);
            if (po && (po.status === 'PURCHASE_COMPLETED' || po.status === 'PAYMENT_COMPLETED')) {
              return <span style={{fontSize:'12px', color:'green', fontWeight:'bold'}}>Paid</span>;
            }
            return (
              <button className="btn-small btn-primary-small" onClick={() => handlePayVendor(row)}>
                Pay Vendor
              </button>
            );
          }}
          emptyMessage="No stock-posted GRNs awaiting payment."
        />
      </div>
    );
  };

  const renderFinancePOWorkspace = () => {
    const tabs = ["Pending Requests", "Create PO", "Draft POs", "Approved POs", "All POs", "Vendor Payments"];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '8px', paddingBottom: '4px' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  padding: '10px 20px',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? '#000' : 'var(--color-text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: isActive ? '700' : '600',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {activeTab === "Pending Requests" && renderPendingRequestsTab()}
        {activeTab === "Create PO" && renderCreatePOTab()}
        {activeTab === "Draft POs" && renderDraftPOsTab()}
        {activeTab === "Approved POs" && renderApprovedPOsTab()}
        {activeTab === "All POs" && renderAllPOsTab()}
        {activeTab === "Vendor Payments" && renderVendorPaymentsTab()}
      </div>
    );
  };

  `;

const newContent = content.substring(0, startIdx) + newPOWorkspaceCode + content.substring(endIdx);
fs.writeFileSync(path, newContent);
console.log('FinancePortal rewritten!');
