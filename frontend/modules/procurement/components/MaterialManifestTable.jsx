import React from 'react';
import { Package, AlertCircle } from 'lucide-react';

export function MaterialManifestTable({ items, role = 'STORE', isReadOnly = true, onQuantityChange }) {
  const isFinance = role === 'FINANCE' || role === 'SUPER_ADMIN';

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Material Details
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ordered Qty
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pending Supply
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cumulative Delivered
            </th>
            {isFinance && (
              <>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Rate (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxable Amount (₹)
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, idx) => (
            <tr key={item.materialId || idx} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <Package size={20} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{item.materialName}</div>
                    <div className="text-sm text-gray-500">Code: {item.materialCode || item.materialId}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                {item.orderedQty} {item.unit || 'Nos'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <span className={`font-medium ${item.remainingSupplyQty > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {item.remainingSupplyQty} {item.unit || 'Nos'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                {item.cumulativeDeliveredQty} {item.unit || 'Nos'}
                {(item.cumulativeAcceptedQty > 0 || item.cumulativeRejectedQty > 0) && (
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="text-emerald-600 mr-2">{item.cumulativeAcceptedQty} Acc</span>
                    {item.cumulativeRejectedQty > 0 && <span className="text-rose-600">{item.cumulativeRejectedQty} Rej</span>}
                  </div>
                )}
              </td>
              {isFinance && (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    ₹{item.unitRate?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    ₹{item.taxableAmount?.toLocaleString() || (item.orderedQty * (item.unitRate || 0)).toLocaleString()}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
