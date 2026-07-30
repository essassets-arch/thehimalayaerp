import React, { useState } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { approvePurchaseOrder, rejectPurchaseOrder, returnPurchaseOrderForCorrection } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import { PurchaseOrderDetails } from '../components/PurchaseOrderDetails';
import { ShieldCheck, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import Swal from 'sweetalert2';

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function PurchaseOrderApproval() {
  const purchaseOrders = useERPStore(state => state.state?.procurement?.purchaseOrders || []);
  const pendingPOs = purchaseOrders.filter(po => 
    po.status === 'PENDING_SUPER_ADMIN_APPROVAL'
  );

  const [selectedPO, setSelectedPO] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPO = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    setSelectedPO(po);
    setRemarks('');
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await approvePurchaseOrder(selectedPO.id, remarks || 'Approved automatically', 'Super Admin');
      await Swal.fire('Approved', 'Purchase Order approved successfully.', 'success');
      setSelectedPO(null);
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to approve PO', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      return Swal.fire('Error', 'Remarks are required for rejection', 'error');
    }
    try {
      setIsSubmitting(true);
      await rejectPurchaseOrder(selectedPO.id, remarks, 'Super Admin');
      await Swal.fire('Rejected', 'Purchase Order has been rejected.', 'success');
      setSelectedPO(null);
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to reject PO', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!remarks.trim()) {
      return Swal.fire('Error', 'Remarks are required to return for correction', 'error');
    }
    try {
      setIsSubmitting(true);
      await returnPurchaseOrderForCorrection(selectedPO.id, remarks, 'Super Admin');
      await Swal.fire('Returned', 'Purchase Order returned for correction.', 'success');
      setSelectedPO(null);
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to return PO', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe totals calculators
  const getSubtotal = (po) => {
    return (po?.items || []).reduce((acc, item) => {
      const qty = Number(item.quantity ?? item.orderedQty ?? 0);
      const rate = Number(item.unitPrice ?? item.unitRate ?? 0);
      const disc = Number(item.discountPercent ?? 0);
      return acc + (qty * rate * (1 - disc / 100));
    }, 0);
  };

  const getTaxAmount = (po) => {
    return (po?.items || []).reduce((acc, item) => {
      const qty = Number(item.quantity ?? item.orderedQty ?? 0);
      const rate = Number(item.unitPrice ?? item.unitRate ?? 0);
      const disc = Number(item.discountPercent ?? 0);
      const gst = Number(item.gstPercent ?? 18);
      const base = qty * rate * (1 - disc / 100);
      return acc + (base * (gst / 100));
    }, 0);
  };

  const getGrandTotal = (po) => {
    const subtotal = getSubtotal(po);
    const tax = getTaxAmount(po);
    return subtotal + tax + Number(po?.freight ?? po?.freightAmount ?? 0);
  };

  return (
    <div className="space-y-6">
      {!selectedPO ? (
        <div className="w-full bg-white rounded-lg p-6 border border-gray-200">
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor ID / Name</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total (₹)</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingPOs.map(po => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(po.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{po.supplier?.name || po.vendorDisplayName || po.vendorName || 'Supplier'}</div>
                      <div className="text-xs text-gray-500">{(po.items || []).length} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      ₹{getGrandTotal(po).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {pendingPOs.length === 0 && (
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
        <div className="space-y-6 bg-white rounded-lg p-6 border border-gray-200">
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
                  {(selectedPO.items || []).map((item, idx) => {
                    const qty = Number(item.quantity ?? item.orderedQty ?? 0);
                    const rate = Number(item.unitPrice ?? item.unitRate ?? 0);
                    const discount = Number(item.discountPercent ?? 0);
                    const gst = Number(item.gstPercent ?? 18);
                    const base = qty * rate * (1 - discount / 100);
                    const lineTotal = base * (1 + gst / 100);
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product?.name || item.materialName || 'Material'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{qty} {item.unit || item.product?.unit || 'Nos'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">₹{rate.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{discount}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{gst}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">₹{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan="5" className="px-6 py-4 text-right text-sm text-gray-700">Subtotal (Excl. Tax)</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">₹{getSubtotal(selectedPO).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan="5" className="px-6 py-4 text-right text-sm text-gray-700">GST Tax Amount</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">₹{getTaxAmount(selectedPO).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan="5" className="px-6 py-4 text-right text-sm text-gray-700">Freight & Charges</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">₹{Number(selectedPO.freight ?? selectedPO.freightAmount ?? 0).toLocaleString()}</td>
                  </tr>
                  <tr className="bg-blue-50 font-bold">
                    <td colSpan="5" className="px-6 py-4 text-right text-sm text-blue-900">Grand Total</td>
                    <td className="px-6 py-4 text-right text-sm text-blue-900 text-lg">₹{getGrandTotal(selectedPO).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                placeholder="Enter remarks for approval, return, or rejection..."
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReject}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center py-2 px-6 border border-rose-300 shadow-sm text-sm font-medium rounded-md text-rose-700 bg-white hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
              >
                <XCircle size={18} className="mr-2" />
                Reject
              </button>
              <button
                type="button"
                onClick={handleReturn}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center py-2 px-6 border border-amber-300 shadow-sm text-sm font-medium rounded-md text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <RotateCcw size={18} className="mr-2" />
                Return for Correction
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
