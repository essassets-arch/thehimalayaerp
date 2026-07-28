import React, { useState } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useERP } from '../../../../shared/context/ERPContext';
import DataTable from '../../../../shared/components/DataTable';
import StatusBadge from '../../../../shared/components/StatusBadge';
import QCInspectionDetailsModal from './QCInspectionDetailsModal';
import { Eye } from 'lucide-react';

export default function QCHistoryView() {
  const { state } = useERP();
  const globalSearch = useSearchStore(s => s.globalSearch);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const qcInspections = state.qcInspections || [];

  const openDetailsModal = (inspection) => {
    setSelectedInspection(inspection);
    setShowModal(true);
  };

  const historyColumns = [
    { header: 'Order No', accessor: 'workOrderId', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.workOrderId}</strong> },
    { header: 'Attempt', accessor: 'attemptNumber', render: (row) => `#${row.attemptNumber}` },
    { header: 'Inspected', accessor: 'inspectedQuantity', render: (row) => `${row.inspectedQuantity} units` },
    { header: 'Approved', accessor: 'approvedQuantity', render: (row) => <span style={{ color: '#16a34a' }}>{row.approvedQuantity} units</span> },
    { header: 'Rejected/Rework', accessor: 'rejectedQuantity', render: (row) => <span style={{ color: '#dc2626' }}>{row.rejectedQuantity + row.reworkQuantity} units</span> },
    { header: 'Result', accessor: 'result', render: (row) => <StatusBadge status={row.result} /> },
    { header: 'Inspector', accessor: 'inspectorName', render: (row) => row.inspectorName || '—' },
    { header: 'Date', accessor: 'inspectedAt', render: (row) => new Date(row.inspectedAt).toLocaleString() || '—' },
    {
      header: 'Details', accessor: 'id', render: (row) => (
        <button
          onClick={() => openDetailsModal(row)}
          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #D6E2F0', padding: '6px 14px', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Eye size={13} /> View
        </button>
      )
    }
  ];

  return (
    <div className="app-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 className="card-heading" style={{ margin: 0 }}>QC Inspection History</h2>
        <span style={{ fontSize: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
          {qcInspections.length} Records
        </span>
      </div>
      <DataTable
        columns={historyColumns}
        data={qcInspections}
        searchQuery={globalSearch}
        emptyMessage="No inspection history found."
      />

      {showModal && selectedInspection && (
        <QCInspectionDetailsModal 
          inspection={selectedInspection} 
          onClose={() => {
            setShowModal(false);
            setSelectedInspection(null);
          }} 
        />
      )}
    </div>
  );
}
