const fs = require('fs');

// 1. Update navigationConfig.js
let navContent = fs.readFileSync('d:/prototype-next/config/navigationConfig.js', 'utf8');
const oldQCMenu = `'QC': [
    { id: 'dashboard', label: 'QC Dashboard', icon: LayoutGrid, path: '/qc/dashboard' },
    // Quality Inspections group
    { id: 'pending', label: 'Pending Inspections', icon: Clock, path: '/qc/pending', group: 'Quality Inspections' },
    { id: 'completed', label: 'Inspected History', icon: ClipboardList, path: '/qc/history', group: 'Quality Inspections' }
  ],`;
const newQCMenu = `'QC': [
    { id: 'dashboard', label: 'QC Dashboard', icon: LayoutGrid, path: '/qc/dashboard' },
    // Quality Inspections group
    { id: 'grn-inspection', label: 'GRN Inspection', icon: ClipboardCheck, path: '/qc/grn-inspection', group: 'Quality Inspections' },
    { id: 'pending', label: 'Pending Inspections', icon: Clock, path: '/qc/pending', group: 'Quality Inspections' },
    { id: 'completed', label: 'Inspected History', icon: ClipboardList, path: '/qc/history', group: 'Quality Inspections' }
  ],`;
if (navContent.includes(oldQCMenu)) {
  navContent = navContent.replace(oldQCMenu, newQCMenu);
} else {
  // Try looser replacement
  navContent = navContent.replace(`{ id: 'pending', label: 'Pending Inspections'`, `{ id: 'grn-inspection', label: 'GRN Inspection', icon: ClipboardCheck, path: '/qc/grn-inspection', group: 'Quality Inspections' },\n    { id: 'pending', label: 'Pending Inspections'`);
}
fs.writeFileSync('d:/prototype-next/config/navigationConfig.js', navContent);


// 2. Update QCPortal.jsx
let qcContent = fs.readFileSync('d:/prototype-next/modules/qc/pages/QCPortal.jsx', 'utf8');

// Add import
qcContent = qcContent.replace("import { useERP } from '../../../shared/context/ERPContext';", "import { useERP } from '../../../shared/context/ERPContext';\nimport { useERPStore } from '@/store/erpStore';");

// Add GRN inspection state
qcContent = qcContent.replace("const { state, syncData, approveOrderQC, failOrderQC } = useERP();", `const { state, syncData, approveOrderQC, failOrderQC } = useERP();
  const goodsReceipts = useERPStore(s => s.state.goodsReceipts || []);
  const inspectGoodsReceipt = useERPStore(s => s.inspectGoodsReceipt);`);


// Add renderGRNInspection()
const grnRenderLogic = `
  const renderGRNInspection = () => {
    const pendingGRNs = goodsReceipts.filter(grn => grn.status === 'PENDING_QC');

    const handleInspectGRN = (grn) => {
      Swal.fire({
        title: 'Inspect GRN',
        html: \`
          <div style="text-align:left; font-size: 14px;">
            <p><strong>GRN ID:</strong> \${grn.id}</p>
            <p><strong>PO ID:</strong> \${grn.purchaseOrderId}</p>
            <p><strong>Items:</strong></p>
            <ul>
              \${grn.items.map(i => \`<li>\${i.name} - \${i.quantity_received ?? i.receivedQuantity ?? 0} \${i.unit}</li>\`).join('')}
            </ul>
            <label style="font-weight:bold; display:block; margin-top: 10px;">Inspection Remarks</label>
            <textarea id="grn-remarks" class="swal2-textarea" placeholder="Enter quality remarks..." style="margin-top:5px;"></textarea>
          </div>
        \`,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Approve',
        denyButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        customClass: { confirmButton: 'btn btn-primary', denyButton: 'btn btn-outline', cancelButton: 'btn btn-secondary' },
        buttonsStyling: false,
        preConfirm: () => {
          return {
            decision: 'APPROVE',
            remarks: document.getElementById('grn-remarks').value
          }
        },
        preDeny: () => {
          return {
            decision: 'REJECT',
            remarks: document.getElementById('grn-remarks').value
          }
        }
      }).then(res => {
        if (res.isConfirmed) {
          inspectGoodsReceipt(grn.id, true, res.value.remarks);
          showToast('GRN Approved successfully.');
        } else if (res.isDenied) {
          inspectGoodsReceipt(grn.id, false, res.value.remarks);
          showToast('GRN Rejected.');
        }
      });
    };

    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">GRN Inspections (Inward Quality Control)</h2>
        </div>
        <DataTable 
          columns={[
            { header: 'GRN ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
            { header: 'PO Ref', accessor: 'purchaseOrderId' },
            { header: 'Items', accessor: 'items', render: (row) => row.items.map(i => \`\${i.name} (\${i.quantity_received ?? i.receivedQuantity ?? 0})\`).join(', ') },
            { header: 'Status', accessor: 'status', render: () => <StatusBadge status="Pending QC" type="warning" /> }
          ]}
          data={pendingGRNs}
          actions={(row) => (
            <button 
              className="btn-small btn-primary-small"
              onClick={() => handleInspectGRN(row)}
            >
              Inspect
            </button>
          )}
          emptyMessage="No GRNs pending inspection."
        />
      </div>
    );
  };

  const renderPending = () => (`;

qcContent = qcContent.replace("const renderPending = () => (", grnRenderLogic);

// Add to return
qcContent = qcContent.replace("{view === 'pending' && (", `{view === 'grn-inspection' && renderGRNInspection()}
      {view === 'pending' && (`);

fs.writeFileSync('d:/prototype-next/modules/qc/pages/QCPortal.jsx', qcContent);
console.log('Update successful!');
