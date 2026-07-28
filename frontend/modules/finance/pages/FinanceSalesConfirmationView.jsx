'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, CheckCircle2, XCircle, Eye, FileText, Download, DollarSign, Clock, AlertTriangle
} from 'lucide-react';
import { useERPStore } from '../../../store/erpStore';
import Swal from 'sweetalert2';

export default function FinanceSalesConfirmationView() {
  const state = useERPStore((s) => s.state);
  const verifyFinancePayment = useERPStore((s) => s.verifyFinancePayment);
  const rejectFinancePayment = useERPStore((s) => s.rejectFinancePayment);

  const orders = state.sales?.orders || [];

  const calculateVerifiedPaidAmount = (orderId) => {
    return (state.finance?.customerPayments || [])
      .filter((p) => p.orderId === orderId && p.verificationStatus === 'FINANCE_VERIFIED')
      .reduce((sum, p) => sum + p.paymentAmount, 0);
  };

  const calculatePendingAmount = (order) => {
    const total = Number(order.grandTotal ?? order.totalAmount ?? 0);
    const paid = calculateVerifiedPaidAmount(order.id);
    return Math.max(total - paid, 0);
  };

  const paymentConfirmations = React.useMemo(() => {
    return (state.finance?.customerPayments || []).map((p) => ({
      id: p.id,
      orderId: p.orderId,
      amount: p.paymentAmount,
      paymentDate: p.paymentDate,
      method: p.paymentMode === 'Bank Transfer' ? 'BANK_TRANSFER' : (p.paymentMode === 'Cheque' ? 'CHEQUE' : (p.paymentMode === 'Cash' ? 'CASH' : 'ONLINE')),
      transactionReference: p.transactionReference || p.chequeNumber || p.referenceNumber,
      proofDocument: p.paymentProof?.[0],
      status: p.verificationStatus,
      financeRemarks: p.rejectionReason || p.remarks,
      verifiedBy: p.verifiedBy,
      verifiedAt: p.verifiedAt,
      createdAt: p.recordedAt
    }));
  }, [state.finance?.customerPayments]);

  const [activeTab, setActiveTab] = useState('Sales Confirmations');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModal, setRejectModal] = useState(null);

  // Derive unified row objects depending on the tab context
  const rows = useMemo(() => {
    let result = [];
    
    if (activeTab === 'Payment Outstanding') {
      // Base on orders with pendingAmount > 0
      result = orders.filter((o) => {
        const pending = calculatePendingAmount(o, paymentConfirmations);
        return pending > 0 && o.commercialStatus !== 'ORDER_CLOSED';
      }).map((o) => ({
        type: 'ORDER',
        id: o.id,
        orderId: o.id,
        invoiceNo: o.invoiceNo || 'Pending',
        customerName: o.customerName,
        salesperson: o.salesperson,
        totalAmount: o.grandTotal,
        verifiedAmount: calculateVerifiedPaidAmount(o.id, paymentConfirmations),
        pendingAmount: calculatePendingAmount(o, paymentConfirmations),
        status: o.paymentStatus || 'PENDING'
      }));
    } 
    else if (activeTab === 'Closed Orders') {
      // Base on orders that are ORDER_CLOSED
      result = orders.filter((o) => o.commercialStatus === 'ORDER_CLOSED').map((o) => ({
        type: 'ORDER',
        id: o.id,
        orderId: o.id,
        invoiceNo: o.invoiceNo || 'Pending',
        customerName: o.customerName,
        salesperson: o.salesperson,
        totalAmount: o.grandTotal,
        verifiedAmount: calculateVerifiedPaidAmount(o.id, paymentConfirmations),
        pendingAmount: calculatePendingAmount(o, paymentConfirmations),
        status: 'CLOSED'
      }));
    }
    else {
      // Based on payment confirmations
      let filteredConfirmations = [];
      if (activeTab === 'Sales Confirmations') {
        filteredConfirmations = paymentConfirmations.filter((c) => c.status === 'FINANCE_VERIFICATION_PENDING' || c.status === 'SALES_PAYMENT_RECORDED');
      } else if (activeTab === 'Verified Payments') {
        filteredConfirmations = paymentConfirmations.filter((c) => c.status === 'FINANCE_VERIFIED');
      } else if (activeTab === 'Rejected Payments') {
        filteredConfirmations = paymentConfirmations.filter((c) => c.status === 'FINANCE_REJECTED');
      }

      // Older UI versions could submit the same confirmation repeatedly before
      // Finance reacted. Present one canonical row per confirmation/order/status.
      filteredConfirmations = Array.from(
        new Map(
          filteredConfirmations.map((confirmation) => [
            `${confirmation.id}|${confirmation.orderId}|${confirmation.status}`,
            confirmation,
          ])
        ).values()
      );

      result = filteredConfirmations.map((c) => {
        const o = orders.find((ord) => ord.id === c.orderId) || {};
        return {
          type: 'CONFIRMATION',
          id: c.id,
          orderId: c.orderId,
          confirmationId: c.id,
          invoiceNo: o.invoiceNo || 'Pending',
          customerName: o.customerName || 'Unknown',
          salesperson: o.salesperson || 'Unknown',
          paymentAmount: c.amount,
          paymentDate: c.paymentDate,
          paymentMethod: c.method,
          transactionRef: c.transactionReference,
          paymentProof: c.proofDocument,
          totalAmount: o.grandTotal || 0,
          verifiedAmount: calculateVerifiedPaidAmount(o.id, paymentConfirmations),
          pendingAmount: calculatePendingAmount(o, paymentConfirmations),
          status: c.status,
          remarks: c.financeRemarks,
          rawConfirmation: c
        };
      });
    }

    // Apply text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => 
        r.orderId?.toLowerCase().includes(q) || 
        r.confirmationId?.toLowerCase().includes(q) || 
        r.customerName?.toLowerCase().includes(q) ||
        r.invoiceNo?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, paymentConfirmations, activeTab, searchQuery]);

  const handleApprove = async (confirmationId) => {
    if (typeof verifyFinancePayment !== 'function') {
      await Swal.fire({ icon: 'error', title: 'Finance Action Unavailable', text: 'The verification action is not initialized.' });
      return;
    }
    const confirmation = paymentConfirmations.find((item) => item.id === confirmationId);
    const result = await Swal.fire({
      icon: 'question',
      title: 'Approve Payment?',
      text: `Verify ₹${Number(confirmation?.amount || 0).toLocaleString('en-IN')} for ${confirmation?.orderId || 'this order'}?`,
      showCancelButton: true,
      confirmButtonText: 'Approve Payment',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;
    try {
      verifyFinancePayment(confirmationId, 'Finance Team');
      await Swal.fire({ icon: 'success', title: 'Payment Verified', text: 'The verified amount and order payment status have been updated.', timer: 1800, showConfirmButton: false });
    } catch (err) {
      await Swal.fire({ icon: 'error', title: 'Verification Failed', text: err?.message || String(err) });
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectModal) return;
    const fd = new FormData(e.target);
    try {
      if (typeof rejectFinancePayment !== 'function') throw new Error('The rejection action is not initialized.');
      rejectFinancePayment(rejectModal.confirmationId, String(fd.get('remarks') || ''), 'Finance Team');
      setRejectModal(null);
      await Swal.fire({ icon: 'success', title: 'Payment Rejected', text: 'Sales can submit a corrected payment confirmation.', timer: 1800, showConfirmButton: false });
    } catch (err) {
      await Swal.fire({ icon: 'error', title: 'Rejection Failed', text: err?.message || String(err) });
    }
  };

  return (
    <div className="finance-verification-page">
      <div className="finance-verification-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Payment Verification</h1>
          <p className="text-gray-500 mt-1">Review and approve sales payment confirmations.</p>
        </div>
      </div>

      <div className="payment-verification-table-card">
        {/* Tabs */}
        <div className="finance-verification-tabs">
          {['Payment Outstanding', 'Sales Confirmations', 'Verified Payments', 'Rejected Payments', 'Closed Orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'active' : ''}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="finance-verification-toolbar">
          <div className="finance-verification-search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="finance-verification-table-wrap">
          <table className="payment-verification-table">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                {activeTab !== 'Payment Outstanding' && activeTab !== 'Closed Orders' && <th className="px-4 py-3">Conf. ID</th>}
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Customer</th>
                {activeTab !== 'Payment Outstanding' && activeTab !== 'Closed Orders' && (
                  <>
                    <th className="px-4 py-3">Payment Amt</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Method / Ref</th>
                  </>
                )}
                <th className="px-4 py-3">Total Amt</th>
                <th className="px-4 py-3">Verified Amt</th>
                <th className="px-4 py-3">Pending Amt</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                    No records found in this tab.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={r.id + idx} className="hover:bg-gray-50/50 transition-colors group">
                    {r.type === 'CONFIRMATION' && (
                      <td className="px-4 py-3 font-medium text-gray-900">{r.confirmationId}</td>
                    )}
                    <td className="px-4 py-3 text-gray-500">{r.orderId}</td>
                    <td className="px-4 py-3 text-gray-500">{r.invoiceNo}</td>
                    <td className="px-4 py-3">{r.customerName}</td>
                    
                    {r.type === 'CONFIRMATION' && (
                      <>
                        <td className="px-4 py-3 font-semibold">₹{r.paymentAmount?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">{r.paymentDate?.split('T')[0]}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col text-xs text-gray-500">
                            <span>{r.paymentMethod}</span>
                            <span>{r.transactionRef || '-'}</span>
                          </div>
                        </td>
                      </>
                    )}

                    <td className="px-4 py-3">₹{r.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">₹{r.verifiedAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">₹{r.pendingAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${r.status?.includes('VERIFIED') ? 'bg-green-100 text-green-700' : ''}
                        ${r.status?.includes('PENDING') || r.status?.includes('RECORDED') ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${r.status?.includes('REJECTED') ? 'bg-red-100 text-red-700' : ''}
                        ${r.status === 'CLOSED' ? 'bg-gray-200 text-gray-700' : ''}
                        ${r.status === 'FULLY_PAID' ? 'bg-green-100 text-green-800' : ''}
                        ${r.status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {r.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="payment-verification-actions">
                      <button
                        type="button"
                        title="View Details"
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        onClick={() => Swal.fire({
                          title: `Payment ${r.confirmationId || r.orderId}`,
                          text: [
                            `Order: ${r.orderId}`,
                            `Customer: ${r.customerName}`,
                            `Payment: ₹${Number(r.paymentAmount || 0).toLocaleString('en-IN')}`,
                            `Method: ${r.paymentMethod || '—'}`,
                            `Reference: ${r.transactionRef || '—'}`,
                            `Status: ${String(r.status || '').replaceAll('_', ' ')}`,
                          ].join('\n'),
                          confirmButtonText: 'Close',
                        })}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {r.type === 'CONFIRMATION' && r.paymentProof && (
                        <button
                          type="button"
                          title="View Proof"
                          className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                          onClick={() => window.open(r.paymentProof, '_blank', 'noopener,noreferrer')}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}

                      {r.type === 'CONFIRMATION' && (r.status === 'FINANCE_VERIFICATION_PENDING' || r.status === 'SALES_PAYMENT_RECORDED') && (
                        <>
                          <button
                            onClick={() => handleApprove(r.confirmationId)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectModal(r)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
              <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Reject Payment
              </h2>
              <button onClick={() => setRejectModal(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleReject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation ID</label>
                <input type="text" disabled value={rejectModal.confirmationId} className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Remarks</label>
                <textarea 
                  name="remarks" 
                  required 
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500" 
                  rows={3} 
                  placeholder="State the reason for rejection..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setRejectModal(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
