import React, { useState, useEffect } from 'react';
import { selectPurchaseOrders } from '../../../store/procurementSelectors';
import { approvePurchaseOrder } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import { PurchaseOrderDetails } from '../components/PurchaseOrderDetails';
const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PurchaseOrderApproval() {
  const [pos, setPos] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only show POs submitted for SA approval
    const pending = selectPurchaseOrders().filter(po => 
      po.status === 'PENDING_SUPER_ADMIN_APPROVAL'
    );
    setPos(pending);
  }, []);

  const handleSelectPO = (poId) => {
    const po = selectPurchaseOrders().find(p => p.id === poId);
    setSelectedPO(po);
    setRemarks('');
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      approvePurchaseOrder(selectedPO.id, remarks || 'Approved automatically', 'Super Admin');
      
      await Swal.fire('Approved', 'Purchase Order approved successfully.', 'success');
      
      setSelectedPO(null);
      setPos(selectPurchaseOrders().filter(po => po.status === 'PENDING_SUPER_ADMIN_APPROVAL'));
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to approve PO', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!selectedPO ? (
        <div className="w-full">
          <div className="mb-6 border-b pb-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Commercial Approvals</h2>
              <p className="text-sm text-gray-500">Purchase Orders awaiting Super Admin commercial approval</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total (₹)</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pos.map(po => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(new Date(po.createdAt))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{po.vendorDisplayName || po.vendorName}</div>
                      <div className="text-xs text-gray-500">{po.items?.length || 0} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      ₹{(po.grandTotal || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <ProcurementStatusBadge status={po.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleSelectPO(po.id)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {pos.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No purchase orders pending approval.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedPO(null)}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center mb-2"
          >
            ← Back to Approvals
          </button>
          
          <PurchaseOrderDetails po={selectedPO} />

          <div className="w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Commercial Overview</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate (₹)</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">GST</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedPO.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.materialName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{item.orderedQty} {item.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">₹{item.unitRate?.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{item.discountPercent || 0}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{item.gstPercent || 18}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">₹{item.lineTotal?.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan="5" className="px-6 py-4 text-right text-sm text-gray-700">Subtotal</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">₹{(selectedPO.subtotal || 0).toLocaleString()}</td>
                  </tr>
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan="5" className="px-6 py-4 text-right text-sm text-gray-700">Freight & Charges</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">₹{(selectedPO.freightAmount || 0).toLocaleString()}</td>
                  </tr>
                  <tr className="bg-blue-50 font-bold">
                    <td colSpan="5" className="px-6 py-4 text-right text-sm text-blue-900">Grand Total</td>
                    <td className="px-6 py-4 text-right text-sm text-blue-900 text-lg">₹{(selectedPO.grandTotal || 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Approval Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter remarks for approval or rejection..."
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center py-2 px-6 border border-rose-300 shadow-sm text-sm font-medium rounded-md text-rose-700 bg-white hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
              >
                <XCircle size={18} className="mr-2" />
                Reject
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                <CheckCircle size={18} className="mr-2" />
                {isSubmitting ? 'Approving...' : 'Approve PO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
