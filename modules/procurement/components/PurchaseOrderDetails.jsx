import React from 'react';
import { ProcurementStatusBadge } from './ProcurementStatusBadge';
export function formatProcurementDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
import { Calendar, Building2, MapPin } from 'lucide-react';

export function PurchaseOrderDetails({ po }) {
  if (!po) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Purchase Order: {po.poNumber}</h2>
          <p className="text-sm text-gray-500 mt-1">Ref Indent: {po.indentId || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-4">
          <ProcurementStatusBadge status={po.status} />
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
            <Building2 size={16} className="mr-2" />
            Vendor Information
          </div>
          <p className="text-base font-semibold text-gray-900">{po.vendorDisplayName || po.vendorName}</p>
        </div>

        <div>
          <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
            <Calendar size={16} className="mr-2" />
            Important Dates
          </div>
          <div className="text-sm">
            <p className="text-gray-600"><span className="text-gray-500 w-20 inline-block">Created:</span> <span className="font-medium text-gray-900">{formatProcurementDate(new Date(po.createdAt))}</span></p>
            {po.expectedDeliveryDate && (
              <p className="text-gray-600 mt-1"><span className="text-gray-500 w-20 inline-block">Delivery:</span> <span className="font-medium text-gray-900">{formatProcurementDate(new Date(po.expectedDeliveryDate))}</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
