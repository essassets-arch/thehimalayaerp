import React, { useState, useEffect } from 'react';
import { selectMaterialRejections, selectFinancePurchaseOrder } from '../../../store/procurementSelectors';
import { approveVendorReplacement, closeMaterialRejection, disposeRejectedStock, syncProcurementData } from '../../../store/procurementActions';
import { useERPStore } from '../../../store/erpStore';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import { AlertTriangle, CheckCircle, PackageX } from 'lucide-react';
import Swal from 'sweetalert2';

export default function RejectionManagement() {
  const [rejections, setRejections] = useState([]);
  const [selectedRejection, setSelectedRejection] = useState(null);
  const [approvalData, setApprovalData] = useState({
    approvedReplacementQty: 0,
    expectedDeliveryDate: '',
    vendorAcknowledgementNumber: '',
    vendorRemarks: '',
    financeRemarks: '',
    defectiveMaterialDisposition: 'RETURN_TO_VENDOR'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const storeState = useERPStore((state) => state.state);

  useEffect(() => {
    void syncProcurementData();
  }, []);

  useEffect(() => {
    setRejections(selectMaterialRejections(storeState));
  }, [storeState]);

  const handleSelectRejection = (rejId) => {
    const rej = selectMaterialRejections().find(r => r.id === rejId);
    setSelectedRejection(rej);
    setApprovalData({
      approvedReplacementQty: rej.remainingResolutionQty,
      expectedDeliveryDate: '',
      vendorAcknowledgementNumber: '',
      vendorRemarks: '',
      financeRemarks: '',
      defectiveMaterialDisposition: 'RETURN_TO_VENDOR'
    });
  };

  const handleApproveReplacement = async () => {
    if (!approvalData.expectedDeliveryDate) {
      Swal.fire('Expected replacement date required', 'Select the vendor replacement delivery date before sending this request to Store.', 'warning');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await approveVendorReplacement({
        rejectionId: selectedRejection.id,
        approvedReplacementQty: approvalData.approvedReplacementQty,
        expectedDeliveryDate: approvalData.expectedDeliveryDate,
        vendorAcknowledgementNumber: approvalData.vendorAcknowledgementNumber,
        vendorRemarks: approvalData.vendorRemarks,
        financeRemarks: approvalData.financeRemarks,
        defectiveMaterialDisposition: approvalData.defectiveMaterialDisposition,
        actor: 'Finance'
      });
      
      await Swal.fire('Success', 'Replacement approved and expected.', 'success');
      
      setSelectedRejection(null);
      await syncProcurementData();
      setRejections(selectMaterialRejections());
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to approve replacement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisposeStock = async () => {
    const { value: disposition } = await Swal.fire({
      title: 'Dispose Original Rejected Stock',
      input: 'select',
      inputOptions: {
        'RETURN_TO_VENDOR': 'Return to Vendor',
        'SCRAP_AFTER_APPROVAL': 'Scrap after Approval',
        'DISPOSE_LOCALLY': 'Dispose Locally'
      },
      inputPlaceholder: 'Select disposition',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to choose a disposition!'
        }
      }
    });

    if (disposition) {
      try {
        disposeRejectedStock(selectedRejection.id, selectedRejection.rejectedQty, disposition, 'Finance');
        await Swal.fire('Success', `Stock disposition recorded as ${disposition}`, 'success');
        setSelectedRejection(selectMaterialRejections().find(r => r.id === selectedRejection.id));
        setRejections(selectMaterialRejections());
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const handleCloseRejection = async () => {
    try {
      closeMaterialRejection(selectedRejection.id, 'Finance');
      await Swal.fire('Success', 'Material rejection closed.', 'success');
      setSelectedRejection(null);
      setRejections(selectMaterialRejections());
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  if (selectedRejection) {
    const po = selectFinancePurchaseOrder(selectedRejection.poId);
    
    return (
      <div style={{ padding: '24px' }}>
        <button 
          onClick={() => setSelectedRejection(null)}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}
        >
          ? Back to List
        </button>
        
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#24345C', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PackageX size={24} color="#dc2626" />
              Rejection Details
            </h2>
            <ProcurementStatusBadge status={selectedRejection.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: '#F5FAFE', padding: '16px', borderRadius: '8px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Rejection #</span>
              <strong style={{ color: '#24345C' }}>{selectedRejection.rejectionNumber}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Original PO #</span>
              <strong style={{ color: '#24345C' }}>{selectedRejection.poId}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Vendor</span>
              <strong style={{ color: '#24345C' }}>{po?.vendorName || 'Unknown'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5E6B82', display: 'block' }}>Material</span>
              <strong style={{ color: '#24345C' }}>{selectedRejection.materialName}</strong>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#24345C' }}>Resolution Progress</h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '150px', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '12px', color: '#b91c1c', display: 'block' }}>Original Rejected</span>
                <strong style={{ fontSize: '20px', color: '#991b1b' }}>{selectedRejection.rejectedQty}</strong>
              </div>
              <div style={{ flex: '1', minWidth: '150px', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '12px', color: '#1d4ed8', display: 'block' }}>Replacement Accepted</span>
                <strong style={{ fontSize: '20px', color: '#1e3a8a' }}>{selectedRejection.cumulativeReplacementAcceptedQty}</strong>
              </div>
              <div style={{ flex: '1', minWidth: '150px', padding: '12px', background: '#fdf4ff', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                <span style={{ fontSize: '12px', color: '#a21caf', display: 'block' }}>Comm. Settled</span>
                <strong style={{ fontSize: '20px', color: '#86198f' }}>{selectedRejection.commerciallySettledQty}</strong>
              </div>
              <div style={{ flex: '1', minWidth: '150px', padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '12px', color: '#b45309', display: 'block' }}>Remaining Resolution</span>
                <strong style={{ fontSize: '20px', color: '#92400e' }}>{selectedRejection.remainingResolutionQty}</strong>
              </div>
            </div>
          </div>

          {['SUBMITTED', 'MATERIAL_REJECTION_SUBMITTED'].includes(selectedRejection.status) && (
            <div style={{ background: '#F5FAFE', border: '1px solid #DCE5F0', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', color: '#24345C' }}>Set Replacement Delivery Date</h3>
              <p style={{ margin:'0 0 16px', color:'#64748b', fontSize:'13px' }}>The original rejected quantity will be sent to Store for replacement verification.</p>
              
              <div style={{ marginBottom: '16px', maxWidth:'360px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Expected Replacement Date *</label>
                  <input 
                    type="date" 
                    value={approvalData.expectedDeliveryDate} 
                    onChange={(e) => setApprovalData(prev => ({...prev, expectedDeliveryDate: e.target.value}))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #D6E2F0', borderRadius: '6px' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleApproveReplacement}
                  disabled={isSubmitting}
                  style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Replacement to Store'}
                </button>
              </div>
            </div>
          )}

          {['REPLACEMENT_EXPECTED', 'PARTIALLY_RESOLVED', 'RESOLVED'].includes(selectedRejection.status) && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #DCE5F0' }}>
              <button 
                onClick={handleDisposeStock}
                disabled={!!selectedRejection.originalStockDisposition}
                style={{ padding: '10px 16px', background: selectedRejection.originalStockDisposition ? '#f1f5f9' : '#fff', color: selectedRejection.originalStockDisposition ? '#8893A7' : '#24345C', border: '1px solid #D6E2F0', borderRadius: '6px', cursor: selectedRejection.originalStockDisposition ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                {selectedRejection.originalStockDisposition ? `Stock Disposed: ${selectedRejection.originalStockDisposition}` : 'Dispose Original Rejected Stock'}
              </button>
              
              <button 
                onClick={handleCloseRejection}
                disabled={selectedRejection.remainingResolutionQty > 0 || !selectedRejection.originalStockDisposition}
                style={{ padding: '10px 24px', background: (selectedRejection.remainingResolutionQty > 0 || !selectedRejection.originalStockDisposition) ? '#8893A7' : '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: (selectedRejection.remainingResolutionQty > 0 || !selectedRejection.originalStockDisposition) ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                Close Rejection Case
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  const historyStatuses = ['COMPLETED', 'CLOSED', 'REJECTED', 'RESOLVED', 'FINANCE_AUDIT_APPROVED'];
  const displayedRejections = rejections.filter((rejection) =>
    activeTab === 'history'
      ? historyStatuses.includes(rejection.status)
      : !historyStatuses.includes(rejection.status),
  );

  return (
    <div className="finance-rejections" style={{ padding: '24px', width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
      <style>{`
        .finance-rejections .rejection-hero { background: linear-gradient(118deg,#172554 0%,#243b6b 48%,#0e7490 100%); border-radius:18px; padding:26px 30px; color:#fff; display:flex; align-items:center; justify-content:space-between; gap:18px; box-shadow:0 12px 28px rgba(30,58,138,.16); }
        .finance-rejections .rejection-kpis { display:grid; grid-template-columns:repeat(3,minmax(115px,1fr)); gap:10px; }
        .finance-rejections .rejection-kpi { border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.1); border-radius:12px; padding:11px 14px; }
        .finance-rejections .rejection-kpi span { display:block;font-size:11px;color:#bfdbfe;font-weight:700;text-transform:uppercase;letter-spacing:.04em; }
        .finance-rejections .rejection-kpi strong { display:block;font-size:23px;margin-top:3px; }
        .finance-rejections .rejection-table-wrap { margin-top:22px; background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 5px 16px rgba(15,23,42,.04); }
        .finance-rejections table { min-width:780px; }
        .finance-rejections th { background:#f8fafc; color:#475569 !important; text-transform:uppercase; letter-spacing:.04em; font-size:11px !important; }
        .finance-rejections tbody tr:hover { background:#f8fbff; }
        .finance-rejections .manage-button { padding:8px 14px; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; }
        .finance-rejections .manage-button:hover { background:#2563eb; color:#fff; }
        @media(max-width:760px){ .finance-rejections{padding:14px !important}.finance-rejections .rejection-hero{padding:20px;align-items:flex-start;flex-direction:column}.finance-rejections .rejection-kpis{width:100%;grid-template-columns:repeat(3,1fr)}.finance-rejections .rejection-kpi{padding:10px}.finance-rejections .rejection-kpi strong{font-size:19px}.finance-rejections .rejection-table-wrap{overflow-x:auto} }
      `}</style>
      <div className="rejection-hero">
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}><div style={{ width:48,height:48,borderRadius:14,display:'grid',placeItems:'center',background:'rgba(251,113,133,.2)',color:'#fecdd3' }}><AlertTriangle size={25}/></div><div><h2 style={{ margin:0,fontSize:'23px',letterSpacing:'-.02em' }}>Rejection Management</h2><p style={{ margin:'5px 0 0', color:'#bfdbfe', fontSize:'13px' }}>Review Store material rejections and authorize replacement delivery.</p></div></div>
        <div className="rejection-kpis"><div className="rejection-kpi"><span>Open cases</span><strong>{rejections.filter(r => !['COMPLETED','CLOSED','REJECTED'].includes(r.status)).length}</strong></div><div className="rejection-kpi"><span>Awaiting review</span><strong>{rejections.filter(r => ['SUBMITTED','MATERIAL_REJECTION_SUBMITTED'].includes(r.status)).length}</strong></div><div className="rejection-kpi"><span>Replacement due</span><strong>{rejections.filter(r => r.status === 'REPLACEMENT_EXPECTED').length}</strong></div></div>
      </div>

      <div className="rejection-table-wrap">
        <div style={{ padding:'18px 20px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}><div><strong style={{ color:'#172554', fontSize:'16px' }}>Material rejection queue</strong><div style={{ color:'#64748b', fontSize:'12px', marginTop:3 }}>Select a case to set replacement quantity and expected delivery.</div></div><span style={{ background:'#eff6ff', color:'#1d4ed8', borderRadius:20, padding:'5px 10px', fontSize:12, fontWeight:700 }}>{rejections.length} Total</span></div>
        <div style={{ display:'flex', gap:'22px', padding:'0 20px', borderBottom:'1px solid #e2e8f0' }}>
          <button onClick={() => setActiveTab('active')} style={{ padding:'13px 2px', border:'none', borderBottom:activeTab === 'active' ? '2px solid #2563eb' : '2px solid transparent', background:'transparent', color:activeTab === 'active' ? '#1d4ed8' : '#64748b', fontWeight:700, cursor:'pointer' }}>Active Cases ({rejections.length - rejections.filter(r => historyStatuses.includes(r.status)).length})</button>
          <button onClick={() => setActiveTab('history')} style={{ padding:'13px 2px', border:'none', borderBottom:activeTab === 'history' ? '2px solid #2563eb' : '2px solid transparent', background:'transparent', color:activeTab === 'history' ? '#1d4ed8' : '#64748b', fontWeight:700, cursor:'pointer' }}>History ({rejections.filter(r => historyStatuses.includes(r.status)).length})</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', textAlign: 'left' }}>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Rejection #</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Material</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Original PO</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Unresolved Qty</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedRejections.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#5E6B82' }}>
                  {activeTab === 'history' ? 'No completed material rejection history.' : 'No active material rejections.'}
                </td>
              </tr>
            ) : (
              displayedRejections.map(rej => (
                <tr key={rej.id} style={{ borderBottom: '1px solid #DCE5F0' }}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{rej.rejectionNumber}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{rej.materialName}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#5E6B82' }}>{rej.poId}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <strong style={{ color: rej.remainingResolutionQty > 0 ? '#b91c1c' : '#15803d' }}>
                      {rej.remainingResolutionQty}
                    </strong>
                  </td>
                  <td style={{ padding: '16px' }}><ProcurementStatusBadge status={rej.status} /></td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button className="manage-button"
                      onClick={() => handleSelectRejection(rej.id)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
