const fs = require('fs');
let content = fs.readFileSync('d:/prototype-next/modules/finance/pages/FinancePortal.jsx', 'utf8');

content = content.replace("const simulateVendorAcceptance = useERPStore(s => s.simulateVendorAcceptance);", `const simulateVendorAcceptance = useERPStore(s => s.simulateVendorAcceptance);
  const goodsReceipts = useERPStore(s => s.state.goodsReceipts || []);
  const vendorPayments = useERPStore(s => s.state.vendorPayments || []);
  const payVendor = useERPStore(s => s.payVendor);`);


// Replace Verify & Close tab with Vendor Payments tab
const oldVerifyClose = `const renderVerifyCloseTab = () => {
    const purchaseOrders = state.purchaseOrders || [];
    const awaitingConfirmation = purchaseOrders.filter(po => po.status === 'AWAITING_FINANCE_CONFIRMATION');

    if (!selectedPO || selectedPO.status !== 'AWAITING_FINANCE_CONFIRMATION') {
      return (
        <div className="app-card">
          <div className="card-top-bar">
            <h2 className="card-heading">Select Awaiting Closure PO to Audit</h2>
          </div>
          <DataTable 
            columns={[
              { header: 'PO Ref ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
              { 
                header: 'Date Created', 
                accessor: 'createdAt', 
                render: (row) => new Date(row.createdAt).toLocaleDateString() 
              },
              { 
                header: 'Items List', 
                accessor: 'items', 
                render: (row) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                    {row.items?.map((item, i) => (
                      <span key={i}>
                          {item.name}: <strong>{item.quantity_received ?? item.receivedQuantity ?? 0} / {item.quantity_ordered ?? item.quantity}</strong> received
                      </span>
                    ))}
                  </div>
                ) 
              },
              { header: 'Notes', accessor: 'notes', render: (row) => row.notes || '-' }
            ]}
            data={awaitingConfirmation}
            searchQuery={globalSearch}
            searchField="id"
            actions={(row) => (
              <button 
                className="btn-small btn-primary-small"
                style={{ margin: 0 }}
                onClick={() => setSelectedPO(row)}
              >
                Audit proofs
              </button>
            )}
            emptyMessage="No POs awaiting delivery verification closure."
          />
        </div>
      );
    }

    const handleApproveClosure = () => {
      Swal.fire({
        title: 'Approve PO Closure',
        text: \`Are you sure you want to approve closure for Purchase Order \${selectedPO.id}? Finance confirms all proofs are valid.\`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Approve & Close PO',
        cancelButtonText: 'Cancel',
        customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title', confirmButton: 'swal-premium-confirm-btn', cancelButton: 'swal-premium-cancel-btn' },
        buttonsStyling: false
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await apiClient.patch(\`/finance/purchase-orders/\${selectedPO.id}/close\`, {
              isApproval: true
            });
            await syncData();
            Swal.fire({ icon: 'success', title: 'PO Closed', text: \`Purchase Order \${selectedPO.id} closure approved successfully.\`, confirmButtonText: 'OK', customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title', confirmButton: 'swal-premium-confirm-btn' }, buttonsStyling: false }).then(() => {
              setSelectedPO(null);
              handleTabChange('All POs');
            });
          } catch (err) {
            Swal.fire({ icon: 'error', title: 'Failed to Close PO', text: err.response?.data?.message || err.message || 'An error occurred.', confirmButtonText: 'OK', customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title', confirmButton: 'swal-premium-confirm-btn' }, buttonsStyling: false });
          }
        }
      });
    };

    const handleRejectClosure = () => {
      Swal.fire({
        title: 'Reject PO Closure',
        input: 'textarea',
        inputLabel: 'Rejection Reason',
        inputPlaceholder: 'Specify the reason for rejection...',
        showCancelButton: true,
        confirmButtonText: 'Submit Rejection',
        cancelButtonText: 'Cancel',
        customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title', confirmButton: 'swal-premium-confirm-btn', cancelButton: 'swal-premium-cancel-btn' },
        buttonsStyling: false,
        preConfirm: (text) => {
          if (!text) { Swal.showValidationMessage('Rejection reason is required'); }
          return text;
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          const reason = result.value;
          try {
            await apiClient.patch(\`/finance/purchase-orders/\${selectedPO.id}/close\`, {
              isApproval: false,
              rejectionReason: reason
            });
            await syncData();
            Swal.fire({ icon: 'success', title: 'Closure Rejected', text: \`PO Closure for \${selectedPO.id} has been rejected.\`, confirmButtonText: 'OK', customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title', confirmButton: 'swal-premium-confirm-btn' }, buttonsStyling: false }).then(() => {
              setSelectedPO(null);
            });
          } catch (err) {
            Swal.fire({ icon: 'error', title: 'Failed to Reject Closure', text: err.response?.data?.message || err.message || 'An error occurred.', confirmButtonText: 'OK', customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title', confirmButton: 'swal-premium-confirm-btn' }, buttonsStyling: false });
          }
        }
      });
    };

    const parseStoreNotes = (notes) => {
      if (!notes) return { invoiceNo: '-', vehicleNo: '-', driverName: '-', lrNumber: '-' };
      const result = { invoiceNo: '-', vehicleNo: '-', driverName: '-', lrNumber: '-' };
      const parts = notes.split('|');
      parts.forEach(part => {
        const [key, val] = part.split(': ');
        if (key && val) {
          const k = key.trim().toLowerCase();
          const v = val.trim();
          if (k === 'invoice') result.invoiceNo = v;
          else if (k === 'vehicle') result.vehicleNo = v;
          else if (k === 'driver') result.driverName = v;
          else if (k === 'lr') result.lrNumber = v;
          else if (k === 'notes') result.notes = v;
        }
      });
      return result;
    };

    const storeMeta = parseStoreNotes(selectedPO.notes);

    return (
      <div className="app-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="card-heading" style={{ margin: 0 }}>Audit proofs & Close PO</h2>
          <button className="btn-small btn-outline-small" onClick={() => setSelectedPO(null)} style={{ margin: 0 }}>
            Back to List
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* PO Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>PO Reference</span>
              <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: 'var(--color-text-primary)' }}>{selectedPO.id}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Workflow Status</span>
              <div style={{ marginTop: '4px' }}>
                <StatusBadge status={selectedPO.status} />
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Date Requested</span>
              <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', color: 'var(--color-text-primary)' }}>{new Date(selectedPO.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Expected Date</span>
              <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', color: 'var(--color-text-primary)' }}>{selectedPO.expectedDate ? new Date(selectedPO.expectedDate).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>

          {/* Delivery details from Store Keeper */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Store Keeper\\'s Delivery details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Invoice Number</span>
                <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', color: '#1e293b' }}>{storeMeta.invoiceNo}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Vehicle Number</span>
                <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', color: '#1e293b' }}>{storeMeta.vehicleNo}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Driver Name</span>
                <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', color: '#1e293b' }}>{storeMeta.driverName}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>LR Number</span>
                <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', color: '#1e293b' }}>{storeMeta.lrNumber}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Store Notes</span>
                <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', color: '#1e293b' }}>{storeMeta.notes || '-'}</div>
              </div>
            </div>
          </div>

          {/* Items Receipt Summary */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Receipt Summary</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Material</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Ordered Qty</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Received Qty</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px', fontSize: '13.5px', fontWeight: '600' }}>{item.name}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '13.5px' }}>{item.quantity_ordered ?? item.quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '13.5px', fontWeight: '700', color: '#10b981' }}>{item.quantity_received ?? item.receivedQuantity ?? 0}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: item.status === 'Received' ? '#d1fae5' : '#fef3c7', color: item.status === 'Received' ? '#047857' : '#b45309' }}>
                          {item.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={handleRejectClosure}>
              <XCircle size={18} /> Reject
            </button>
            <button className="btn btn-primary" onClick={handleApproveClosure}>
              <CheckCircle2 size={18} /> Approve & Close PO
            </button>
          </div>
        </div>
      </div>
    );
  };`;

const newVerifyClose = `const renderVendorPaymentsTab = () => {
    // Show GRNs that are QC_APPROVED but not fully paid yet
    const unpaidPOs = goodsReceipts.filter(grn => grn.status === 'QC_APPROVED');

    const handlePayVendor = (grn) => {
      Swal.fire({
        title: 'Pay Vendor?',
        text: \`Are you sure you want to release payment for GRN \${grn.id} (PO: \${grn.purchaseOrderId})?\`,
        icon: 'question',
        input: 'number',
        inputLabel: 'Amount (₹)',
        inputPlaceholder: 'Enter payment amount',
        showCancelButton: true,
        confirmButtonText: 'Submit Payment',
        preConfirm: (amount) => {
          if (!amount || amount <= 0) {
            Swal.showValidationMessage('Please enter a valid amount');
          }
          return amount;
        }
      }).then(res => {
        if (res.isConfirmed) {
          payVendor(grn.purchaseOrderId, Number(res.value));
          showToast(\`Payment of ₹\${res.value} recorded for PO \${grn.purchaseOrderId}.\`);
        }
      });
    };

    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Vendor Payments (QC Approved GRNs)</h2>
        </div>
        <DataTable 
          columns={[
            { header: 'GRN Ref', accessor: 'id', render: row => <strong style={{color: 'var(--color-primary)'}}>{row.id}</strong> },
            { header: 'PO Ref', accessor: 'purchaseOrderId' },
            { header: 'Invoice No', accessor: 'metadata', render: row => row.metadata?.invoice_no || '-' },
            { header: 'Amount Due', accessor: 'id', render: () => 'Pending Calculation' }
          ]}
          data={unpaidPOs}
          actions={(row) => (
            <button 
              className="btn-small btn-primary-small"
              onClick={() => handlePayVendor(row)}
            >
              Pay Vendor
            </button>
          )}
          emptyMessage="No approved GRNs awaiting vendor payment."
        />
      </div>
    );
  };`;

content = content.replace(oldVerifyClose, newVerifyClose);

content = content.replace(`{activeTab === "Verify & Close" && renderVerifyCloseTab()}`, `{activeTab === "Vendor Payments" && renderVendorPaymentsTab()}`);
content = content.replace(`"Verify & Close"`, `"Vendor Payments"`);
content = content.replace(`"Verify & Close"`, `"Vendor Payments"`); // for tabs array or routing
content = content.replace(`'Verify & Close'`, `'Vendor Payments'`); // for tabs array or routing

fs.writeFileSync('d:/prototype-next/modules/finance/pages/FinancePortal.jsx', content);
console.log('Update successful!');
