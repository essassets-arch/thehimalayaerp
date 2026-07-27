import React from 'react';
import { getPurchaseOrderDeliveredTotals } from '../../store/procurementSelectors';

export function QuantityReconciliation({ poId, items }) {
  const totals = getPurchaseOrderDeliveredTotals(poId);
  const totalOrdered = items.reduce((acc, item) => acc + (Number(item.orderedQty) || 0), 0);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Quantity Reconciliation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Ordered</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrdered}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm text-blue-600 font-medium mb-1">Reported Delivered</p>
          <p className="text-2xl font-bold text-blue-900">{totals.reportedDeliveredQty}</p>
          <p className="text-xs text-blue-500 mt-1">Pending finance approval</p>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
          <p className="text-sm text-emerald-600 font-medium mb-1">Finance Approved</p>
          <p className="text-2xl font-bold text-emerald-900">{totals.approvedDeliveredQty}</p>
          <p className="text-xs text-emerald-500 mt-1">Officially received</p>
        </div>
      </div>
    </div>
  );
}
