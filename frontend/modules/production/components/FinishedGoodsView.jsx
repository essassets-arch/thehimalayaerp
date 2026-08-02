import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, Archive, AlertCircle } from 'lucide-react';
import FinishedGoodsTable from '../../../components/shared/FinishedGoodsTable';
import { getFinishedGoods } from '../../../services/finishedGoodsService';

export default function FinishedGoodsView() {
  const navigate = useRouter();
  const [finishedGoodsList, setFinishedGoodsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFinishedGoods = async () => {
    try {
      setLoading(true);
      const res = await getFinishedGoods({ page: 1, pageSize: 100 });
      const rows = Array.isArray(res) ? res : res?.data ?? res?.items ?? [];
      setFinishedGoodsList(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinishedGoods();
  }, []);
  // Derived Summary Cards Metrics
  const totalFinished = finishedGoodsList.reduce(
    (sum, record) => {
      if (record.workOrderNumber) return sum + (record.quantity || 0);
      return sum + (record.items || []).reduce((itemSum, item) => itemSum + Number(item.producedQuantity || 0), 0);
    },
    0
  );

  const readyForDispatch = finishedGoodsList.reduce(
    (sum, record) => {
      if (record.workOrderNumber) return sum + (record.status === 'READY_FOR_DISPATCH' ? record.quantity || 0 : 0);
      return sum + (record.items || []).reduce((itemSum, item) => itemSum + Math.max(0, Number(item.qcApprovedQuantity || 0) - Number(item.reservedQuantity || 0) - Number(item.dispatchedQuantity || 0)), 0);
    },
    0
  );

  const reservedForOrders = finishedGoodsList.reduce(
    (sum, record) => sum + (record.items || []).reduce((itemSum, item) => itemSum + Number(item.reservedQuantity || 0), 0),
    0
  );

  const dispatchedQty = finishedGoodsList.reduce(
    (sum, record) => {
      if (record.workOrderNumber) return sum + (record.status === 'DISPATCHED' ? record.quantity || 0 : 0);
      return sum + (record.items || []).reduce((itemSum, item) => itemSum + Number(item.dispatchedQuantity || 0), 0);
    },
    0
  );

  const rejectedQty = finishedGoodsList.reduce(
    (sum, record) => sum + (record.items || []).reduce((itemSum, item) => itemSum + Number(item.qcRejectedQuantity || 0), 0),
    0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Finished', value: totalFinished, icon: Package, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Ready for Dispatch', value: readyForDispatch, icon: Truck, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Reserved for Orders', value: reservedForOrders, icon: Archive, color: '#6366f1', bg: '#e0e7ff' },
          { label: 'Dispatched Qty', value: dispatchedQty, icon: Truck, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Rejected Qty', value: rejectedQty, icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' }
        ].map((stat, i) => (
          <div key={i} className="app-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>{stat.label}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{stat.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Finished Goods Inventory Table */}
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Finished Goods Inventory Queue</h2>
        </div>
        <FinishedGoodsTable 
          records={finishedGoodsList} 
          readOnly={false} 
          showActions={true} 
          onActionComplete={fetchFinishedGoods} 
        />
      </div>
    </div>
  );
}
