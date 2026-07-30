import React, { useState } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { 
  createVendorInvoice, 
  submitVendorInvoice,
  cancelVendorInvoice, 
  runThreeWayMatch, 
  requestInvoicePayment,
  createVendorPayment,
  submitVendorPayment,
  approveVendorPayment,
  processVendorPayment,
  completeVendorPayment,
  failVendorPayment,
  cancelVendorPayment
} from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import DataTable from '../../../shared/components/DataTable';
import { Receipt, FileText, CheckCircle2, XCircle, Calculator, CreditCard, RefreshCw, Send, AlertTriangle, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function VendorInvoiceWorkspace() {
  const [activeSubTab, setActiveSubTab] = useState('Invoices');
  
  // Reactive Zustand Store Subscriptions
  const purchaseOrders = useERPStore(state => state.state?.procurement?.purchaseOrders || []);
  const vendorInvoices = useERPStore(state => state.state?.vendorInvoices || []);
  const vendorPayments = useERPStore(state => state.state?.vendorPayments || []);
  const suppliers = useERPStore(state => state.state?.suppliers || []);
  const goodsReceipts = useERPStore(state => state.state?.goodsReceipts || []);

  // --- Invoices Tab State ---
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // --- Record Invoice Tab State ---
  const [invSupplierId, setInvSupplierId] = useState('');
  const [invPOId, setInvPOId] = useState('');
  const [invNumber, setInvNumber] = useState('');
  const [invDueDate, setInvDueDate] = useState('');
  const [invItems, setInvItems] = useState([]);
  const [isSubmittingInv, setIsSubmittingInv] = useState(false);

  // --- Payments Tab State ---
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isSubmittingPayAction, setIsSubmittingPayAction] = useState(false);

  // --- Record Payment Tab State ---
  const [paySupplierId, setPaySupplierId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Helper filters
  const supplierPOs = purchaseOrders.filter(po => 
    po.supplierId === invSupplierId && ['SUPER_ADMIN_APPROVED', 'PO_ISSUED', 'VENDOR_ACCEPTED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'CLOSED'].includes(po.status)
  );

  const outstandingInvoices = vendorInvoices.filter(inv => 
    inv.supplierId === paySupplierId && ['VERIFIED', 'PAYMENT_APPROVAL_PENDING', 'PARTIALLY_PAID'].includes(inv.status)
  );

  // Handlers for Invoice Creation
  const handleSelectPO = (poId) => {
    setInvPOId(poId);
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) {
      setInvItems([]);
      return;
    }
    
    // Map PO items to invoice item templates
    const items = (po.items || []).map(item => ({
      productId: item.productId,
      materialName: item.product?.name || item.materialName || 'Material',
      quantity: Number(item.quantity ?? 0),
      unitRate: Number(item.unitPrice ?? 0),
      gstPercent: Number(item.gstPercent ?? 18),
      unit: item.unit || item.product?.unit || 'Nos'
    }));
    setInvItems(items);
  };

  const handleInvItemChange = (productId, field, value) => {
    setInvItems(prev => prev.map(item => {
      if (item.productId === productId) {
        return { ...item, [field]: Number(value) || 0 };
      }
      return item;
    }));
  };

  const calculateInvoiceTotal = () => {
    return invItems.reduce((acc, item) => {
      const base = item.quantity * item.unitRate;
      const tax = base * (item.gstPercent / 100);
      return acc + base + tax;
    }, 0);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invSupplierId) return Swal.fire('Error', 'Please select a supplier', 'error');
    if (!invPOId) return Swal.fire('Error', 'Please select a Purchase Order', 'error');
    if (!invNumber) return Swal.fire('Error', 'Invoice number is required', 'error');

    const activeItems = invItems.filter(i => i.quantity > 0);
    if (activeItems.length === 0) return Swal.fire('Error', 'Please include at least one item with a quantity > 0', 'error');

    try {
      setIsSubmittingInv(true);
      const payload = {
        supplierId: invSupplierId,
        purchaseOrderId: invPOId,
        invoiceNumber: invNumber,
        totalAmount: calculateInvoiceTotal(),
        dueDate: invDueDate || null,
        items: activeItems
      };

      const res = await createVendorInvoice(payload, 'Finance Exec');
      
      // Auto-submit the invoice from DRAFT
      await submitVendorInvoice(res.id, 'Finance Exec');

      await Swal.fire('Success', `Invoice ${invNumber} raised and submitted for 3-Way Matching.`, 'success');
      
      // Reset
      setInvSupplierId('');
      setInvPOId('');
      setInvNumber('');
      setInvDueDate('');
      setInvItems([]);
      setActiveSubTab('Invoices');
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to raise invoice', 'error');
    } finally {
      setIsSubmittingInv(false);
    }
  };

  // Handlers for Invoice Actions (Matching & Payment Request)
  const handleRunMatch = async (invoiceId) => {
    try {
      await runThreeWayMatch(invoiceId, 'Finance');
      const latest = useERPStore.getState().state.vendorInvoices.find(i => i.id === invoiceId);
      if (latest?.status === 'VERIFIED') {
        Swal.fire('Matched Successfully', 'Invoice matches PO and GRN delivery values. Status: VERIFIED.', 'success');
      } else {
        Swal.fire('Match Exception', 'Invoice has mismatches against PO/GRN records. Status: MATCH_EXCEPTION.', 'warning');
      }
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice(latest);
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Matching failed', 'error');
    }
  };

  const handleRequestPayment = async (invoiceId) => {
    try {
      await requestInvoicePayment(invoiceId, 'Finance');
      Swal.fire('Payment Requested', 'Payment approval workflow triggered successfully.', 'success');
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice(useERPStore.getState().state.vendorInvoices.find(i => i.id === invoiceId));
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Action failed', 'error');
    }
  };

  // Handlers for Payment Creation
  const handleSupplierSelectForPayment = (supplierId) => {
    setPaySupplierId(supplierId);
    const invoices = vendorInvoices.filter(inv => 
      inv.supplierId === supplierId && ['VERIFIED', 'PAYMENT_APPROVAL_PENDING', 'PARTIALLY_PAID'].includes(inv.status)
    );
    setAllocations(invoices.map(inv => ({
      vendorInvoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      outstanding: Number(inv.totalAmount) - Number(inv.paidAmount),
      amount: 0
    })));
  };

  const handleAllocationChange = (invoiceId, value) => {
    const num = Math.max(0, Number(value) || 0);
    setAllocations(prev => prev.map(a => {
      if (a.vendorInvoiceId === invoiceId) {
        if (num > a.outstanding) {
          Swal.fire('Warning', `Allocation cannot exceed outstanding balance of ₹${a.outstanding}`, 'warning');
          return { ...a, amount: a.outstanding };
        }
        return { ...a, amount: num };
      }
      return a;
    }));
  };

  const calculateTotalAllocated = () => {
    return allocations.reduce((acc, a) => acc + a.amount, 0);
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!paySupplierId) return Swal.fire('Error', 'Please select a supplier', 'error');
    
    const activeAllocations = allocations.filter(a => a.amount > 0);
    if (activeAllocations.length === 0) return Swal.fire('Error', 'Please allocate payment to at least one invoice', 'error');

    const totalAllocated = calculateTotalAllocated();
    
    try {
      setIsSubmittingPay(true);
      const payload = {
        supplierId: paySupplierId,
        paidAmount: totalAllocated,
        allocations: activeAllocations
      };

      const res = await createVendorPayment(payload);
      
      // Auto-submit the payment to PENDING_APPROVAL
      await submitVendorPayment(res.id, 'Finance Exec');

      await Swal.fire('Success', `Vendor Payment of ₹${totalAllocated.toLocaleString()} created and submitted for approval.`, 'success');
      
      // Reset
      setPaySupplierId('');
      setPayAmount('');
      setAllocations([]);
      setActiveSubTab('Payments');
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to submit payment', 'error');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  // Handlers for Payment Actions
  const handlePaymentWorkflow = async (paymentId, action, extraPayload = {}) => {
    try {
      setIsSubmittingPayAction(true);
      if (action === 'approve') {
        await approveVendorPayment(paymentId, 'Finance Manager');
        Swal.fire('Approved', 'Payment approved successfully.', 'success');
      } else if (action === 'process') {
        await processVendorPayment(paymentId, 'Finance Manager');
        Swal.fire('Processing', 'Payment processing started.', 'info');
      } else if (action === 'complete') {
        const { value: txId } = await Swal.fire({
          title: 'Enter Transaction Reference',
          input: 'text',
          inputLabel: 'Transaction ID / UTR Number',
          inputPlaceholder: 'e.g. UTR123456789',
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) return 'Transaction reference is required';
          }
        });
        if (!txId) return;
        await completeVendorPayment(paymentId, txId, 'Finance Manager');
        Swal.fire('Settled', 'Payment complete. Linked invoice balances have been updated.', 'success');
      } else if (action === 'fail') {
        await failVendorPayment(paymentId, 'Finance Manager');
        Swal.fire('Failed', 'Payment marked as failed.', 'error');
      } else if (action === 'cancel') {
        await cancelVendorPayment(paymentId, 'Finance Manager');
        Swal.fire('Cancelled', 'Payment transaction cancelled.', 'info');
      }

      if (selectedPayment && selectedPayment.id === paymentId) {
        setSelectedPayment(useERPStore.getState().state.vendorPayments.find(p => p.id === paymentId));
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Action failed', 'error');
    } finally {
      setIsSubmittingPayAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Strip */}
      <div className="flex border-b border-gray-200 bg-white p-2 rounded-t-lg">
        {['Invoices', 'Raise Invoice', 'Payments', 'Record Payment'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveSubTab(tab);
              setSelectedInvoice(null);
              setSelectedPayment(null);
            }}
            className={`px-6 py-2.5 font-bold text-sm rounded-md transition-all ${
              activeSubTab === tab 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── SUB-TAB: INVOICES ── */}
      {activeSubTab === 'Invoices' && !selectedInvoice && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="text-blue-600" /> Vendor Invoice Registry
          </h2>
          <DataTable 
            columns={[
              { header: 'Invoice Number', accessor: 'invoiceNumber', render: row => <strong className="text-blue-600">{row.invoiceNumber}</strong> },
              { header: 'Supplier', accessor: 'supplierId', render: row => <span>{suppliers.find(s => s.id === row.supplierId)?.name || 'Supplier'}</span> },
              { header: 'Total Value', accessor: 'totalAmount', render: row => `₹${Number(row.totalAmount).toLocaleString()}` },
              { header: 'Paid Balance', accessor: 'paidAmount', render: row => `₹${Number(row.paidAmount).toLocaleString()}` },
              { header: 'Due Date', accessor: 'dueDate', render: row => formatDate(row.dueDate) },
              { header: 'Status', accessor: 'status', render: row => <ProcurementStatusBadge status={row.status} /> },
              { header: 'Actions', accessor: 'id', render: row => (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedInvoice(row)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-2 py-1 rounded"
                  >
                    View Details
                  </button>
                  {['SUBMITTED', 'MATCH_EXCEPTION', 'MATCHING_PENDING'].includes(row.status) && (
                    <button 
                      onClick={() => handleRunMatch(row.id)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Match
                    </button>
                  )}
                  {row.status === 'VERIFIED' && (
                    <button 
                      onClick={() => handleRequestPayment(row.id)}
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Send size={12} /> Request Pay
                    </button>
                  )}
                </div>
              )}
            ]}
            data={vendorInvoices}
            emptyMessage="No vendor invoices recorded yet."
          />
        </div>
      )}

      {activeSubTab === 'Invoices' && selectedInvoice && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
          <button 
            onClick={() => setSelectedInvoice(null)}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            ← Back to Invoice Registry
          </button>
          
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Invoice Ref: {selectedInvoice.invoiceNumber}
              <ProcurementStatusBadge status={selectedInvoice.status} />
            </h2>
            <p className="text-sm text-gray-500 mt-1">Supplier: {suppliers.find(s => s.id === selectedInvoice.supplierId)?.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg border">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase">Grand Total Value</span>
              <p className="text-lg font-extrabold text-gray-900 mt-1">₹{Number(selectedInvoice.totalAmount).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase">Paid Amount</span>
              <p className="text-lg font-extrabold text-emerald-600 mt-1">₹{Number(selectedInvoice.paidAmount).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase">Outstanding Balance</span>
              <p className="text-lg font-extrabold text-rose-600 mt-1">₹{(Number(selectedInvoice.totalAmount) - Number(selectedInvoice.paidAmount)).toLocaleString()}</p>
            </div>
          </div>

          {selectedInvoice.matchResult && (
            <div className={`p-4 rounded-lg border ${selectedInvoice.status === 'MATCH_EXCEPTION' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900">
                {selectedInvoice.status === 'MATCH_EXCEPTION' ? <AlertTriangle className="text-red-600" /> : <CheckCircle2 className="text-emerald-600" />}
                Three-Way Match Verification Results ({selectedInvoice.matchResult.status})
              </h3>
              {selectedInvoice.matchResult.errors?.length > 0 ? (
                <ul className="list-disc pl-5 mt-2 text-sm text-red-800 space-y-1">
                  {selectedInvoice.matchResult.errors.map((err, idx) => (
                    <li key={idx}><strong>{err}</strong>: Check purchase order rate, item quantities, or vendor alignment.</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-800 mt-2">All line item quantities, rates, tax codes, and supplier parameters successfully matched.</p>
              )}
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Invoice Line Items</h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product SKU / ID</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">GST %</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Line Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {(selectedInvoice.items || []).map((item, idx) => {
                    const lineVal = item.quantity * item.unitRate * (1 + item.gstPercent / 100);
                    return (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.productId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{Number(item.quantity)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">₹{Number(item.unitRate).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">{Number(item.gstPercent)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">₹{lineVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-4">
            {['SUBMITTED', 'MATCH_EXCEPTION', 'MATCHING_PENDING'].includes(selectedInvoice.status) && (
              <button 
                onClick={() => handleRunMatch(selectedInvoice.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded flex items-center gap-2 shadow"
              >
                <RefreshCw size={16} /> Run 3-Way Match Check
              </button>
            )}
            {selectedInvoice.status === 'VERIFIED' && (
              <button 
                onClick={() => handleRequestPayment(selectedInvoice.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded flex items-center gap-2 shadow"
              >
                <Send size={16} /> Request Payment Approval
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB: RAISE INVOICE ── */}
      {activeSubTab === 'Raise Invoice' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calculator className="text-blue-600" /> Raise Vendor Invoice
          </h2>

          <form onSubmit={handleCreateInvoice} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-4 rounded-lg border">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">SELECT SUPPLIER</label>
                <select
                  required
                  value={invSupplierId}
                  onChange={(e) => {
                    setInvSupplierId(e.target.value);
                    setInvPOId('');
                    setInvItems([]);
                  }}
                  className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                >
                  <option value="">Choose Supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.publicId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">SELECT PURCHASE ORDER</label>
                <select
                  required
                  disabled={!invSupplierId}
                  value={invPOId}
                  onChange={(e) => handleSelectPO(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                >
                  <option value="">Choose PO...</option>
                  {supplierPOs.map(po => (
                    <option key={po.id} value={po.id}>{po.poNumber || po.publicId || po.id} (₹{Number(po.totalAmount).toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">INVOICE NUMBER</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-2026-0001"
                  value={invNumber}
                  onChange={(e) => setInvNumber(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">DUE DATE</label>
                <input
                  type="date"
                  required
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                />
              </div>
            </div>

            {invItems.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">Line Items (Verify Values)</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product SKU</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Invoice Qty</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-36">Rate (₹)</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">GST %</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                      {invItems.map((item) => {
                        const lineBase = item.quantity * item.unitRate;
                        const lineTotal = lineBase * (1 + item.gstPercent / 100);
                        return (
                          <tr key={item.productId}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.materialName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(e) => handleInvItemChange(item.productId, 'quantity', e.target.value)}
                                className="block w-full border-gray-300 rounded-md text-right sm:text-xs"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitRate}
                                onChange={(e) => handleInvItemChange(item.productId, 'unitRate', e.target.value)}
                                className="block w-full border-gray-300 rounded-md text-right sm:text-xs"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={item.gstPercent}
                                onChange={(e) => handleInvItemChange(item.productId, 'gstPercent', e.target.value)}
                                className="block w-full border-gray-300 rounded-md text-right sm:text-xs"
                              >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900 bg-gray-50">
                              ₹{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-blue-50 font-bold">
                        <td colSpan="4" className="px-6 py-4 text-right text-sm text-blue-900">Grand Invoice Total</td>
                        <td className="px-6 py-4 text-right text-sm text-blue-900 text-base">₹{calculateInvoiceTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmittingInv || !invPOId}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded shadow disabled:opacity-50"
              >
                {isSubmittingInv ? 'Raising Invoice...' : 'Raise Invoice & Submit for Matching'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SUB-TAB: PAYMENTS ── */}
      {activeSubTab === 'Payments' && !selectedPayment && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="text-blue-600" /> Vendor Payments Registry
          </h2>
          <DataTable 
            columns={[
              { header: 'Payment Ref', accessor: 'paymentNumber', render: row => <strong className="text-blue-600">{row.paymentNumber || row.id}</strong> },
              { header: 'Supplier', accessor: 'supplierId', render: row => <span>{suppliers.find(s => s.id === row.supplierId)?.name || 'Supplier'}</span> },
              { header: 'Allocated Amount', accessor: 'paidAmount', render: row => `₹${Number(row.paidAmount).toLocaleString()}` },
              { header: 'Status', accessor: 'status', render: row => <ProcurementStatusBadge status={row.status} /> },
              { header: 'Transaction Reference', accessor: 'transactionId', render: row => <span className="font-mono text-xs">{row.transactionId || '—'}</span> },
              { header: 'Payment Date', accessor: 'paymentDate', render: row => row.paymentDate ? formatDate(row.paymentDate) : '—' },
              { header: 'Actions', accessor: 'id', render: row => (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedPayment(row)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-2 py-1 rounded"
                  >
                    Details
                  </button>
                  {row.status === 'PENDING_APPROVAL' && (
                    <button 
                      onClick={() => handlePaymentWorkflow(row.id, 'approve')}
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded"
                    >
                      Approve
                    </button>
                  )}
                  {row.status === 'APPROVED' && (
                    <button 
                      onClick={() => handlePaymentWorkflow(row.id, 'process')}
                      className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded"
                    >
                      Process
                    </button>
                  )}
                  {row.status === 'PROCESSING' && (
                    <button 
                      onClick={() => handlePaymentWorkflow(row.id, 'complete')}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded"
                    >
                      Settle
                    </button>
                  )}
                </div>
              )}
            ]}
            data={vendorPayments}
            emptyMessage="No vendor payments recorded yet."
          />
        </div>
      )}

      {activeSubTab === 'Payments' && selectedPayment && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
          <button 
            onClick={() => setSelectedPayment(null)}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            ← Back to Payments Registry
          </button>
          
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Payment Ref: {selectedPayment.paymentNumber || selectedPayment.id}
              <ProcurementStatusBadge status={selectedPayment.status} />
            </h2>
            <p className="text-sm text-gray-500 mt-1">Supplier: {suppliers.find(s => s.id === selectedPayment.supplierId)?.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border text-sm">
            <div>
              <span className="font-bold text-gray-500">Paid Amount:</span> <span className="font-bold text-gray-900 text-lg">₹{Number(selectedPayment.paidAmount).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-bold text-gray-500">Transaction ID:</span> <span className="font-mono text-gray-950 font-bold">{selectedPayment.transactionId || 'Pending settlement'}</span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Invoice Allocations</h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Number</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Allocated Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {(selectedPayment.allocations || []).map((allocation, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{allocation.vendorInvoice?.invoiceNumber || allocation.vendorInvoiceId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-950">₹{Number(allocation.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-4">
            {selectedPayment.status === 'PENDING_APPROVAL' && (
              <>
                <button 
                  onClick={() => handlePaymentWorkflow(selectedPayment.id, 'cancel')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded"
                >
                  Cancel Payment
                </button>
                <button 
                  onClick={() => handlePaymentWorkflow(selectedPayment.id, 'approve')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded"
                >
                  Approve Payment
                </button>
              </>
            )}
            {selectedPayment.status === 'APPROVED' && (
              <button 
                onClick={() => handlePaymentWorkflow(selectedPayment.id, 'process')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded"
              >
                Send to Processing Bank
              </button>
            )}
            {selectedPayment.status === 'PROCESSING' && (
              <>
                <button 
                  onClick={() => handlePaymentWorkflow(selectedPayment.id, 'fail')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded"
                >
                  Mark Transaction Failed
                </button>
                <button 
                  onClick={() => handlePaymentWorkflow(selectedPayment.id, 'complete')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded"
                >
                  Record Settlement (Complete)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB: RECORD PAYMENT ── */}
      {activeSubTab === 'Record Payment' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard className="text-blue-600" /> Record Vendor Payment
          </h2>

          <form onSubmit={handleCreatePayment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">SELECT SUPPLIER</label>
                <select
                  required
                  value={paySupplierId}
                  onChange={(e) => handleSupplierSelectForPayment(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                >
                  <option value="">Choose Supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.publicId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">TOTAL PAYMENT VALUE (AUTO-CALCULATED)</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={`₹${calculateTotalAllocated().toLocaleString()}`}
                  className="block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 font-bold"
                />
              </div>
            </div>

            {allocations.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">Allocate Outstanding Invoices</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Number</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoice Value</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid amount</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-rose-600 uppercase">Outstanding</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-600 uppercase w-48">Allocated payment</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                      {allocations.map((a) => (
                        <tr key={a.vendorInvoiceId}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{a.invoiceNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">₹{a.totalAmount.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-emerald-600">₹{a.paidAmount.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-rose-600 font-bold">₹{a.outstanding.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="number"
                              min="0"
                              max={a.outstanding}
                              value={a.amount || ''}
                              onChange={(e) => handleAllocationChange(a.vendorInvoiceId, e.target.value)}
                              className="block w-full border-gray-300 rounded-md text-right sm:text-xs"
                              placeholder="Allocate ₹"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-bold">
                        <td colSpan="4" className="px-6 py-4 text-right text-sm text-blue-900">Total Settlement Amount</td>
                        <td className="px-6 py-4 text-right text-sm text-blue-900 text-base">₹{calculateTotalAllocated().toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmittingPay || calculateTotalAllocated() === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded shadow disabled:opacity-50"
              >
                {isSubmittingPay ? 'Submitting...' : 'Record and Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
