import React from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useERP } from '../../../../shared/context/ERPContext';
import { isTradingProduct, isPureTradingOrder } from '../../../../shared/utils/dispatchCategory';

export default function QCDashboardView() {
  const navigate = useRouter();
  const { state } = useERP();
  
  const rawWorkOrders = state.production?.workOrders || state.workOrders || [];
  const workOrders = rawWorkOrders.filter(wo => {
    if (isPureTradingOrder(wo.salesOrder || wo.productionPlan?.salesOrder)) return false;
    if (isTradingProduct(wo) || isTradingProduct(wo.product) || isTradingProduct(wo.salesOrderItem?.product, wo.salesOrderItem)) return false;
    return true;
  });

  const pendingOrders = workOrders.filter(wo =>
    ['PRODUCTION_COMPLETED', 'QC_PENDING', 'REINSPECTION_PENDING'].includes(wo.status)
  );

  const rejectedOrders = workOrders.filter(wo =>
    ['QC_FAILED', 'REWORK_REQUIRED', 'REWORK_IN_PROGRESS'].includes(wo.status)
  );

  const qcInspections = (state.qcInspections || []).filter(ins => {
    const wo = ins.workOrder;
    if (isPureTradingOrder(wo?.salesOrder || wo?.productionPlan?.salesOrder)) return false;
    if (isTradingProduct(wo) || isTradingProduct(wo?.product) || isTradingProduct(wo?.salesOrderItem?.product, wo?.salesOrderItem) || isTradingProduct(ins.product)) return false;
    return true;
  });
  
  const totalInspected = qcInspections.length;
  // A simplistic way to count approved from history is to check the most recent result per work order,
  // or simply rely on the qcInspections result.
  const approvedCount = qcInspections.filter(ins => ins.result === 'APPROVED' || ins.result === 'PARTIALLY_APPROVED').length;
  const rejectedCount = qcInspections.filter(ins => ins.result === 'FAILED').length; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Awaiting Inspection', value: pendingOrders.length, color: '#f59e0b', icon: <ClipboardCheck size={20} /> },
          { label: 'Approved (Dispatch Ready)', value: approvedCount, color: '#22c55e', icon: <ShieldCheck size={20} /> },
          { label: 'Rejected / Rework', value: rejectedOrders.length, color: '#ef4444', icon: <ShieldAlert size={20} /> },
          { label: 'Total Inspected', value: totalInspected, color: '#6366f1', icon: <CheckCircle2 size={20} /> },
        ].map((card, i) => (
          <div key={i} className="app-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ color: card.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{card.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: '600' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div className="app-card" style={{ padding: '28px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#166534', margin: '0 0 8px 0' }}>Quality Assurance Terminal</h2>
        <p style={{ fontSize: '13px', color: '#14532d', margin: 0 }}>
          Orders completed by Production appear here for inspection. After QC approval, they automatically move to the Dispatch panel.
        </p>
        {pendingOrders.length > 0 && (
          <button
            onClick={() => navigate.push('/production/qc-pending')}
            style={{ marginTop: '16px', background: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            View {pendingOrders.length} Pending Inspection{pendingOrders.length > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}
