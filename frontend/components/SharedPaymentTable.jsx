'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Calendar, DollarSign, CheckCircle2, Clock, AlertTriangle, 
  CreditCard, Eye, Download, Share2, Printer, Plus, X, ArrowUpDown, ChevronDown, Bell
} from 'lucide-react';
import { useERPStore } from '../store/erpStore';
import { getPaymentStatus, formatRemainingDays } from '../utils/paymentTerms';
import ReminderModal from '../shared/components/ReminderModal.jsx';
import { apiClient } from '../shared/api/client.js';
import { 
  PaymentStatusBadge, 
  StandardActionButtons, 
  OrderDetailDrawer, 
  PageSearchInput 
} from './GlobalUIComponents';

export default function SharedPaymentTable({ mode = 'sales' }: { mode?: 'sales' | 'finance' }) {
  const storeState = useERPStore((s: any) => s.state);
  const recordPayment = useERPStore((s: any) => s.recordPayment);
  const orders = storeState?.orders || [];

  // Local UI State
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState('');
  
  // Modals & Drawers
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState<any>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<any>(null);
  
  // Payment Form State
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('Bank Transfer');
  const [payTxId, setPayTxId] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payRemarks, setPayRemarks] = useState('');
  const [reminderModal, setReminderModal] = useState(null);

  const handleSaveReminder = async (formData) => {
    if (!reminderModal) return;
    try {
      await apiClient.post('/sales/reminders', {
        ...formData,
        moduleType: 'Payment',
        moduleId: reminderModal.order.id || reminderModal.order.orderNo,
        customerName: reminderModal.order.customerName || reminderModal.order.customer || 'Customer',
      });
      Swal.fire({ icon: 'success', title: 'Reminder saved', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed to save reminder', text: err?.message });
    }
    setReminderModal(null);
  };

  // 1. Process Orders with Payment Calculations
  const processedOrders = useMemo(() => {
    return orders.map((o: any) => {
      const totalAmount = Number(o.totalAmount || o.totalValue || o.amount || 15000);
      const paidAmount = Number(o.paidAmount || o.paid_amount || 0);
      const pendingAmount = Math.max(0, totalAmount - paidAmount);
      const paymentTermsRaw = String(o.paymentTerms || '15');
      const paymentTermsMatch = paymentTermsRaw.match(/\d+/);
      const paymentTermsDays = paymentTermsMatch ? parseInt(paymentTermsMatch[0], 10) : (paymentTermsRaw.toLowerCase().includes('advance') ? 0 : 15);
      const deliveryDate = o.deliveryDate || o.deliveredAt?.split('T')[0] || (o.status === 'Delivered' ? '2026-07-10' : undefined);
      const invoiceDate = o.invoiceDate || o.createdAt?.split('T')[0] || '2026-07-05';
      const invoiceNo = o.invoiceNo || `INV-${(o.orderNo || o.id || '100').replace(/[^0-9]/g, '')}`;
      const salesperson = o.salesperson || 'Rajesh Kumar';

      const paymentInfo = getPaymentStatus(o.status || '', deliveryDate, paymentTermsDays, totalAmount, paidAmount);

      return {
        ...o,
        totalAmount,
        paidAmount,
        pendingAmount,
        paymentTerms: paymentTermsRaw,
        paymentTermsDays,
        deliveryDate: deliveryDate || '--',
        invoiceDate,
        invoiceNo,
        salesperson,
        paymentStatus: paymentInfo.status,
        dueDate: paymentInfo.dueDate,
        remainingDays: paymentInfo.remainingDays,
        badgeColor: paymentInfo.badgeColor,
        isDelivered: String(o.status || '').toLowerCase() === 'delivered' || Boolean(deliveryDate && deliveryDate !== '--')
      };
    });
  }, [orders]);

  // 2. Filter Orders for Table Display
  const filteredOrders = useMemo(() => {
    return processedOrders.filter((o: any) => {
      // Pending tab only shows DELIVERED orders that are not fully paid
      if (activeTab === 'pending') {
        if (!o.isDelivered || o.pendingAmount <= 0) return false;
      } else {
        // Completed tab shows fully paid orders
        if (o.pendingAmount > 0) return false;
      }

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = String(o.id || '').toLowerCase().includes(q);
        const matchNo = String(o.orderNo || '').toLowerCase().includes(q);
        const matchCust = String(o.customerName || o.customer || '').toLowerCase().includes(q);
        const matchInv = String(o.invoiceNo || '').toLowerCase().includes(q);
        const matchSales = String(o.salesperson || '').toLowerCase().includes(q);
        if (!matchId && !matchNo && !matchCust && !matchInv && !matchSales) return false;
      }

      // Customer Filter
      if (customerFilter && !String(o.customerName || o.customer || '').toLowerCase().includes(customerFilter.toLowerCase())) {
        return false;
      }

      // Salesperson Filter
      if (salespersonFilter && !String(o.salesperson || '').toLowerCase().includes(salespersonFilter.toLowerCase())) {
        return false;
      }

      // Status Filter
      if (statusFilter && o.paymentStatus !== statusFilter) return false;

      // Quick Aging Filter
      if (quickFilter) {
        const rem = o.remainingDays;
        if (quickFilter === 'due_today' && rem !== 0) return false;
        if (quickFilter === 'due_7' && (rem === null || rem <= 0 || rem > 7)) return false;
        if (quickFilter === 'overdue_20_30' && (rem === null || rem > -20 || rem < -30)) return false;
        if (quickFilter === 'overdue_30_45' && (rem === null || rem > -30 || rem < -45)) return false;
        if (quickFilter === 'overdue_45_60' && (rem === null || rem > -45 || rem < -60)) return false;
        if (quickFilter === 'overdue_60_90' && (rem === null || rem > -60 || rem < -90)) return false;
        if (quickFilter === 'overdue_90_plus' && (rem === null || rem > -90)) return false;
      }

      return true;
    });
  }, [processedOrders, activeTab, searchQuery, customerFilter, salespersonFilter, statusFilter, quickFilter]);

  // Submit Payment Recording
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalOrder) return;
    const amountNum = Number(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    recordPayment(
      paymentModalOrder.id || paymentModalOrder.orderNo,
      {
        amount: amountNum,
        paymentMode: payMode,
        transactionId: payTxId || `TXN${Date.now().toString().slice(-6)}`,
        paymentDate: payDate,
        remarks: payRemarks
      },
      mode === 'finance' ? 'Finance Team' : 'Sales Executive'
    );

    alert(`Payment of ₹${amountNum.toLocaleString('en-IN')} recorded successfully!`);
    setPaymentModalOrder(null);
    setPayAmount('');
    setPayTxId('');
    setPayRemarks('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            {mode === 'finance' ? 'Finance → Payment Verification' : 'Sales → Payment Follow-up'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Single Source of Truth payment tracking across ERP. Standardized 15-column specification.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-indigo-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {mode === 'finance' ? 'Remaining Payments (Outstanding)' : 'Pending Payments'}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-indigo-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paid / Verified Payments
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Page Search Input */}
          <PageSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search Order ID, Customer, Invoice..."
          />

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-slate-500">Quick Filters:</span>
            <button
              onClick={() => setQuickFilter(quickFilter === 'due_today' ? '' : 'due_today')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                quickFilter === 'due_today' ? 'bg-amber-500 text-white border-amber-600' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              Due Today
            </button>
            <button
              onClick={() => setQuickFilter(quickFilter === 'due_7' ? '' : 'due_7')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                quickFilter === 'due_7' ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
              }`}
            >
              Due in 7 Days
            </button>
            <button
              onClick={() => setQuickFilter(quickFilter === 'overdue_20_30' ? '' : 'overdue_20_30')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                quickFilter === 'overdue_20_30' ? 'bg-red-600 text-white border-red-700' : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
              }`}
            >
              20–30 Days Overdue
            </button>
            <button
              onClick={() => setQuickFilter(quickFilter === 'overdue_30_45' ? '' : 'overdue_30_45')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                quickFilter === 'overdue_30_45' ? 'bg-red-700 text-white border-red-800' : 'bg-red-100 text-red-900 border-red-300 hover:bg-red-200'
              }`}
            >
              30–45 Days Overdue
            </button>
            <button
              onClick={() => setQuickFilter(quickFilter === 'overdue_90_plus' ? '' : 'overdue_90_plus')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                quickFilter === 'overdue_90_plus' ? 'bg-red-900 text-white border-red-950' : 'bg-red-200 text-red-950 border-red-400 hover:bg-red-300'
              }`}
            >
              Above 90 Days
            </button>
            {quickFilter && (
              <button
                onClick={() => setQuickFilter('')}
                className="text-xs text-slate-500 underline hover:text-slate-800 ml-1"
              >
                Clear Quick Filters
              </button>
            )}
          </div>
        </div>

        {/* Detailed Dropdown Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <input
            type="text"
            placeholder="Filter Customer..."
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Filter Salesperson..."
            value={salespersonFilter}
            onChange={(e) => setSalespersonFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Payment Statuses</option>
            <option value="Not Due">Not Due</option>
            <option value="Due Today">Due Today</option>
            <option value="Overdue">Overdue</option>
            <option value="Paid">Paid</option>
          </select>
          <button
            onClick={() => {
              setCustomerFilter('');
              setSalespersonFilter('');
              setStatusFilter('');
              setSearchQuery('');
              setQuickFilter('');
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-center"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* 15-Column Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
            <thead className="bg-slate-900 text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 border-b border-slate-800">1. Order ID</th>
                <th className="p-3 border-b border-slate-800">2. Invoice No</th>
                <th className="p-3 border-b border-slate-800">3. Customer</th>
                <th className="p-3 border-b border-slate-800">4. Salesperson</th>
                <th className="p-3 border-b border-slate-800">5. Payment Terms</th>
                <th className="p-3 border-b border-slate-800">6. Delivery Date</th>
                <th className="p-3 border-b border-slate-800">7. Payment Due Date</th>
                <th className="p-3 border-b border-slate-800">8. Remaining Days</th>
                <th className="p-3 border-b border-slate-800">9. Total Amount</th>
                <th className="p-3 border-b border-slate-800">10. Status</th>
                <th className="p-3 border-b border-slate-800">11. Reminder</th>
                <th className="p-3 border-b border-slate-800 text-right">12. Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400 italic">
                    No orders match the selected payment filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o: any, idx: number) => {
                  const isAdvance = String(o.paymentTerms || '').toLowerCase().includes('advance');
                  const remainingText = formatRemainingDays(o.remainingDays, o.paymentStatus, isAdvance);
                  return (
                    <tr key={o.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-indigo-950">{o.orderNo || o.id}</td>
                      <td className="p-3 font-mono text-slate-600">{o.invoiceNo}</td>
                      <td className="p-3 font-semibold text-slate-800">{o.customerName || o.customer}</td>
                      <td className="p-3 text-slate-600">{o.salesperson}</td>
                      <td className="p-3 font-semibold text-sky-700">{o.paymentTerms || '15 Days'}</td>
                      <td className="p-3 text-slate-700">{o.deliveryDate}</td>
                      <td className="p-3 font-medium text-slate-900">{o.dueDate}</td>
                      <td className={`p-3 font-bold ${
                        o.remainingDays !== null && o.remainingDays < 0 ? 'text-red-600' :
                        (o.remainingDays === 0 || isAdvance) ? 'text-amber-600' : 'text-slate-700'
                      }`}>
                        {remainingText}
                      </td>
                      <td className="p-3 font-bold text-slate-900">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <PaymentStatusBadge
                          orderStatus={o.status}
                          deliveryDate={o.deliveryDate}
                          paymentTerms={o.paymentTerms}
                          totalAmount={o.totalAmount}
                          paidAmount={o.paidAmount}
                        />
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {o.paymentStatus === 'Overdue' ? 'Overdue Reminder Sent' : 'Due in ' + (o.remainingDays || 0) + ' Days'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrderForDrawer(o)}
                            className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                            title="View Order Details & Ledger"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => setReminderModal({ order: o })}
                            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Add Reminder"
                          >
                            <Bell className="w-4 h-4" />
                          </button>

                          {o.pendingAmount > 0 && o.isDelivered && (
                            <button
                              onClick={() => {
                                setPaymentModalOrder(o);
                                setPayAmount(String(o.pendingAmount));
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors shadow-2xs"
                            >
                              {mode === 'finance' ? 'Verify / Record Payment' : 'Record Payment'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrderForDrawer && (
        <OrderDetailDrawer
          order={selectedOrderForDrawer}
          onClose={() => setSelectedOrderForDrawer(null)}
        />
      )}

      {/* Record Payment Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Record Payment</h3>
                <p className="text-xs text-slate-300">Order: {paymentModalOrder.orderNo || paymentModalOrder.id}</p>
              </div>
              <button 
                onClick={() => setPaymentModalOrder(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="font-bold">₹{paymentModalOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Already Paid:</span>
                  <span className="font-semibold text-emerald-700">₹{paymentModalOrder.paidAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span className="text-slate-600 font-semibold">Remaining Pending:</span>
                  <span className="font-bold text-amber-700">₹{paymentModalOrder.pendingAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  max={paymentModalOrder.pendingAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="NEFT / RTGS">NEFT / RTGS</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction ID / UTR No.</label>
                <input
                  type="text"
                  placeholder="e.g. UTR98765432"
                  value={payTxId}
                  onChange={(e) => setPayTxId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalOrder(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                >
                  Submit Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      <ReminderModal
        key={reminderModal?.order?.id || 'new'}
        open={!!reminderModal}
        onClose={() => setReminderModal(null)}
        onSave={handleSaveReminder}
        customerName={reminderModal?.order?.customerName || reminderModal?.order?.customer || ''}
        title="Payment Reminder"
      />
    </div>
  );
}
