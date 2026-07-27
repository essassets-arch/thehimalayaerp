import { useState, useEffect } from 'react';
import { Search, CreditCard, AlertTriangle, CheckCircle, Bell, Eye, Calendar, Clock, Trash2, Sparkles, ChevronLeft, ChevronRight, PhoneCall, CalendarRange } from 'lucide-react';
import Swal from 'sweetalert2';
import { useERP } from '../shared/context/ERPContext';

export default function PaymentsView({ 
  payments, 
  onRecordPaymentClick,
  onReceivePayment, 
  searchQuery,
  setSearchQuery,
  deliveredOrders,
  fetchDeliveredOrders,
  handleSalesConfirmPayment,
  handleUpdateFollowup,
  parseOrderFollowup
}) {
  const { state: erpState, dispatch } = useERP();
  const paymentReminders = erpState.paymentReminders || [];

  const [localSearch, setLocalSearch] = useState('');
  const search = searchQuery !== undefined ? searchQuery : localSearch;
  const setSearch = setSearchQuery !== undefined ? setSearchQuery : setLocalSearch;
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filter, setFilter] = useState('All');
  const [deliveredFilter, setDeliveredFilter] = useState('Pending');
  
  const [reminderInvoice, setReminderInvoice] = useState(null);
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderNotes, setReminderNotes] = useState('');

  const formatINR = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  };

  const handleReceivePaymentClick = (invoice, closePreview = false) => {
    const outstandingVal = invoice.totalAmount - invoice.paidAmount;
    Swal.fire({
      title: 'Receive Payment?',
      text: `Are you sure you want to log full payment clearance of ₹${outstandingVal.toLocaleString('en-IN')} for invoice #${invoice.invoiceNo} (${invoice.customerName})?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Clear Balance',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        onReceivePayment(
          invoice.id,
          outstandingVal,
          new Date().toISOString().split('T')[0],
          'Bank Transfer',
          'DIRECT-MARK-RECEIVED',
          'Salesperson manually marked as received'
        );
        if (closePreview) {
          setSelectedInvoice(null);
        }
      }
    });
  };


  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const filteredPayments = payments.filter(p => {
    const customerName = p.customerName || '';
    const invoiceNo = p.invoiceNo || '';
    const matchesSearch = customerName.toLowerCase().includes(search.toLowerCase()) || 
                          invoiceNo.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalOutstanding = payments
    .filter(p => p.status !== 'Paid')
    .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0);

  const totalOverdue = payments
    .filter(p => p.status === 'Overdue')
    .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'badge badge-approved';
      case 'Overdue':
        return 'badge badge-overdue';
      default:
        return 'badge badge-outstanding';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysReminders = paymentReminders.filter(r => r.date <= todayStr);
  const upcomingReminders = paymentReminders.filter(r => r.date > todayStr);

  const countRemindersAll = paymentReminders.length;
  const countRemindersOutstanding = paymentReminders.filter(r => {
    const p = payments.find(pay => pay.id === r.invoiceId);
    return p && p.status === 'Outstanding';
  }).length;
  const countRemindersPaid = paymentReminders.filter(r => {
    const p = payments.find(pay => pay.id === r.invoiceId);
    return p && p.status === 'Paid';
  }).length;
  const countRemindersOverdue = paymentReminders.filter(r => {
    const p = payments.find(pay => pay.id === r.invoiceId);
    return p && p.status === 'Overdue';
  }).length;

  const getTabLabel = (st) => {
    switch (st) {
      case 'All': return `All (${countRemindersAll})`;
      case 'Outstanding': return `Outstanding (${countRemindersOutstanding})`;
      case 'Paid': return `Paid (${countRemindersPaid})`;
      case 'Overdue': return `Overdue (${countRemindersOverdue})`;
      case 'Reminders': return `Reminders (${countRemindersAll})`;
      default: return st;
    }
  };

  const filteredReminders = paymentReminders.filter(r => {
    const p = payments.find(pay => pay.id === r.invoiceId);
    if (filter === 'Outstanding' && (!p || p.status !== 'Outstanding')) return false;
    if (filter === 'Overdue' && (!p || p.status !== 'Overdue')) return false;
    if (filter === 'Paid' && (!p || p.status !== 'Paid')) return false;

    const customerName = r.customerName || '';
    const invoiceNo = r.invoiceNo || '';
    const notes = r.notes || '';
    return customerName.toLowerCase().includes(search.toLowerCase()) || 
           invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
           notes.toLowerCase().includes(search.toLowerCase());
  });

  const ITEMS_PER_PAGE = 25;
  const totalItemsCount = filteredReminders.length;
  const totalPages = Math.ceil(totalItemsCount / ITEMS_PER_PAGE) || 1;
  
  const displayedReminders = filteredReminders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const displayedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="app-card" style={{ flex: 1 }}>
      {/* Header */}
      <div className="module-header-row">
        <h2 className="module-title">Invoices & Receivables</h2>
        <div className="module-actions">
          {/* Status filters */}
          <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
            {['All', 'Outstanding', 'Paid', 'Overdue', 'Reminders'].map(st => (
              <button 
                key={st}
                className={`filter-pill ${filter === st ? 'active' : ''}`}
                onClick={() => setFilter(st)}
                style={{ color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                {getTabLabel(st)}
              </button>
            ))}
          </div>

          <div className="search-box" style={{ background: '#f1f3f5', border: '1px solid #D6E2F0' }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search reminders or customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
          <button 
            className="btn-small btn-primary-small"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={onRecordPaymentClick}
          >
            <CreditCard size={14} /> + Record Payment
          </button>
        </div>
      </div>

      {/* Receivables Dashboard Cards */}
      <div className="kpi-grid payments-kpi-grid" style={{ marginBottom: '16px' }}>
        <div className="kpi-card" style={{ borderLeft: '5px solid var(--color-orange-dot)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label">Total Outstanding Receivables</span>
            <CreditCard size={16} style={{ color: 'var(--color-orange-dot)' }} />
          </div>
          <span className="kpi-value">{formatINR(totalOutstanding)}</span>
        </div>

        <div className="kpi-card" style={{ borderLeft: '5px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-label">Total Overdue Collections</span>
            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
          </div>
          <span className="kpi-value" style={{ color: '#ef4444' }}>{formatINR(totalOverdue)}</span>
        </div>
      </div>

      {/* Delivered orders awaiting payment confirmation */}
      {deliveredOrders && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '16px', 
          background: '#ffffff', 
          border: '1.5px solid var(--color-border)', 
          borderRadius: '12px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--color-accent-teal)', borderRadius: '50%' }}></span>
              Delivered orders awaiting payment confirmation
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="tab-filters-row" style={{ background: '#DCE5F0', borderRadius: '8px', padding: '4px', display: 'flex', gap: '4px' }}>
                <button 
                  type="button"
                  className={`filter-pill ${deliveredFilter === 'Pending' ? 'active' : ''}`}
                  onClick={() => setDeliveredFilter('Pending')}
                  style={{ padding: '4px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', background: deliveredFilter === 'Pending' ? '#fff' : 'transparent', color: deliveredFilter === 'Pending' ? '#000' : '#475569', transition: 'all 0.15s' }}
                >
                  Pending
                </button>
                <button 
                  type="button"
                  className={`filter-pill ${deliveredFilter === 'Completed' ? 'active' : ''}`}
                  onClick={() => setDeliveredFilter('Completed')}
                  style={{ padding: '4px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', background: deliveredFilter === 'Completed' ? '#fff' : 'transparent', color: deliveredFilter === 'Completed' ? '#000' : '#475569', transition: 'all 0.15s' }}
                >
                  Completed
                </button>
              </div>
              <button
                type="button"
                className="action-btn"
                style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '5px 10px', borderRadius: '6px', color: 'var(--color-text-primary)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={fetchDeliveredOrders}
              >
                Refresh
              </button>
            </div>
          </div>
          {(() => {
            let filteredDeliveredOrders = [];
            if (deliveredFilter === 'Pending') {
              filteredDeliveredOrders = (deliveredOrders || []).filter(order => {
                const st = String(order.status || '').toLowerCase();
                return !(st.includes('verified') || st.includes('closed'));
              });
            } else {
              filteredDeliveredOrders = (erpState.orders || []).filter(order => {
                const st = String(order.status || '').toLowerCase();
                return st.includes('verified') || st.includes('closed');
              }).map(o => ({
                id: o.dbId || o.id,
                order_number: o.orderNo,
                customer_name: o.customer?.name || 'Customer',
                grand_total: o.totalAmount || 0,
                status: o.status,
                notes: o.notes || ''
              }));
            }
            return filteredDeliveredOrders.length === 0 ? (
              <div style={{ padding: '16px', color: 'var(--color-text-secondary)', textAlign: 'center', fontSize: '12.5px', fontStyle: 'italic' }}>
                No delivered orders in this category.
              </div>
            ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Order</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Customer</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>Amount</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Next Follow-up / Notes</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveredOrders.map(order => {
                    const followup = parseOrderFollowup ? parseOrderFollowup(order.notes) : { text: order.notes, nextDate: null };
                    const isCompleted = String(order.status || '').toLowerCase().includes('verified') || String(order.status || '').toLowerCase() === 'closed';
                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.12)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 700 }}>{order.order_number || `ORD-${order.id}`}</td>
                        <td style={{ padding: '8px 10px' }}>{order.customer_name || 'Customer'}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                          INR {Number(order.grand_total || order.total_amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          {followup.nextDate ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '10px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '1px 6px', borderRadius: '20px', fontWeight: 'bold', display: 'inline-block', width: 'fit-content' }}>
                                📅 Next: {followup.nextDate}
                              </span>
                              {followup.text && (
                                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                  "{followup.text}"
                                </span>
                              )}
                            </div>
                          ) : followup.text ? (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                              "{followup.text}"
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', opacity: 0.5, fontStyle: 'italic' }}>
                              No follow-up logged yet
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          {isCompleted ? (
                            <span className="badge badge-approved" style={{ fontWeight: 'bold', fontSize: '11px' }}>
                              <CheckCircle size={10} style={{ marginRight: '3px' }} /> Confirmed
                            </span>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                              <button
                                className="action-btn"
                                style={{ background: 'var(--color-primary)', border: 'none', padding: '5px 8px', borderRadius: '4px', color: '#000', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
                                onClick={() => handleSalesConfirmPayment && handleSalesConfirmPayment(order)}
                                title="Confirm Payment"
                              >
                                <CheckCircle size={11} /> Confirm
                              </button>
                              <button
                                className="action-btn"
                                style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '5px 8px', borderRadius: '4px', color: '#1e40af', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
                                onClick={() => handleUpdateFollowup && handleUpdateFollowup(order)}
                                title="Log Follow-up Note & Reminder"
                              >
                                <PhoneCall size={11} /> Follow-up
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
        </div>
      )}
         {/* Table */}
      <div className="crm-table-container">
        <table className="crm-table responsive-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Outstanding Balance</th>
              <th>Follow-up Date</th>
              <th>Action Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReminders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                  {paymentReminders.length === 0 ? 'No follow-up reminders scheduled.' : 'No matching reminders found.'}
                </td>
              </tr>
            ) : (
              displayedReminders.map((r) => {
                const p = payments.find(pay => pay.id === r.invoiceId);
                return (
                  <tr key={r.id}>
                    <td data-label="Invoice No" style={{ fontWeight: '700' }}>#{r.invoiceNo}</td>
                    <td data-label="Customer" style={{ fontWeight: '600' }}>{r.customerName}</td>
                    <td data-label="Outstanding Balance" style={{ fontWeight: '700' }}>{formatINR(r.amount)}</td>
                    <td data-label="Follow-up Date" style={{ fontWeight: '700', color: r.date <= todayStr ? '#dc2626' : 'inherit' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{r.date}</span>
                        {r.date <= todayStr && (
                          <span className="badge badge-overdue" style={{ fontSize: '9px', padding: '2px 5px', textTransform: 'uppercase' }}>
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td data-label="Action Notes">{r.notes}</td>
                    <td data-label="Actions">
                      <div className="action-btn-group" style={{ flexWrap: 'nowrap' }}>
                        {p && (
                          <button 
                            className="btn-small btn-outline-small"
                            onClick={() => setSelectedInvoice(p)}
                            title="View Invoice"
                          >
                            <Eye size={12} />
                          </button>
                        )}
                        {p && p.status !== 'Paid' && p.verified !== 'Pending' && (
                          <button 
                            className="btn-small btn-primary-small"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-accent-green)', color: '#fff', boxShadow: 'none' }}
                            onClick={() => handleReceivePaymentClick(p)}
                            title="Mark Received"
                          >
                            <CheckCircle size={11} /> Mark Received
                          </button>
                        )}
                        <button 
                          className="btn-small btn-primary-small"
                          style={{ background: 'var(--color-accent-purple)', color: '#fff', boxShadow: 'none' }}
                          onClick={() => {
                            dispatch({ type: 'DELETE_PAYMENT_REMINDER', payload: r.id });
                            Swal.fire({
                              icon: 'success',
                              title: 'Follow-up Dismissed',
                              text: 'Reminder has been dismissed successfully.',
                              timer: 1500,
                              showConfirmButton: false
                            });
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{totalItemsCount}</strong> total entries)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="btn-small btn-outline-small"
                style={{ margin: 0, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="btn-small btn-outline-small"
                style={{ margin: 0, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      {/* Invoice details modal */}
      {selectedInvoice && (
        <div className="modal-overlay active" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3 className="modal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Invoice #{selectedInvoice.invoiceNo}</span>
                <span className={getStatusBadge(selectedInvoice.status)}>
                  {selectedInvoice.status}
                </span>
              </h3>
              <button className="modal-close-btn" onClick={() => setSelectedInvoice(null)}>✕</button>
            </div>

            <div className="details-grid">
              <div className="details-row">
                <span className="details-label">Client Name</span>
                <span className="details-value">{selectedInvoice.customerName}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Due Date</span>
                <span className="details-value">{selectedInvoice.dueDate}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Invoice Total</span>
                <span className="details-value">{formatINR(selectedInvoice.totalAmount)}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Amount Cleared</span>
                <span className="details-value" style={{ color: '#16a34a' }}>{formatINR(selectedInvoice.paidAmount)}</span>
              </div>
              <div className="details-row details-full" style={{ borderTop: '1px solid #eaeaea', paddingTop: '12px', marginTop: '4px' }}>
                <span className="details-label">Net Outstanding Balance</span>
                <span className="details-value" style={{ fontSize: '18px', color: '#b91c1c', fontWeight: '800' }}>
                  {formatINR(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}
                </span>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '24px' }}>
              {selectedInvoice.status !== 'Paid' && selectedInvoice.verified !== 'Pending' && (
                <button 
                  className="btn-small btn-primary-small"
                  style={{ background: 'var(--color-accent-green)', color: '#fff' }}
                  onClick={() => handleReceivePaymentClick(selectedInvoice, true)}
                >
                  Clear Balance Received
                </button>
              )}
              <button 
                className="btn-small btn-outline-small"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Make Reminder modal */}
      {reminderInvoice && (() => {
        const in2DaysStr = (() => {
          const d = new Date();
          d.setDate(d.getDate() + 2);
          return d.toISOString().split('T')[0];
        })();
        const in1WeekStr = (() => {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          return d.toISOString().split('T')[0];
        })();

        const isToday = reminderDate === todayStr;
        const isIn2Days = reminderDate === in2DaysStr;
        const isIn1Week = reminderDate === in1WeekStr;

        return (
          <div className="modal-overlay active" onClick={() => setReminderInvoice(null)}>
            <div 
              className="modal-box" 
              onClick={(e) => e.stopPropagation()} 
              style={{ width: '700px', maxWidth: 'calc(100vw - 32px)', padding: '28px', borderRadius: '20px' }}
            >
              <div className="modal-header-row" style={{ marginBottom: '20px' }}>
                <h3 className="modal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '800' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(220, 242, 107, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent-teal)'
                  }}>
                    <Bell size={18} />
                  </div>
                  <span>Create Follow-up Reminder</span>
                </h3>
                <button 
                  className="modal-close-btn" 
                  onClick={() => setReminderInvoice(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', gap: '24px', flexDirection: 'row' }}>
                
                {/* Form Side */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #F5FAFE 0%, #f1f5f9 100%)', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    borderLeft: '4px solid var(--color-orange-dot)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: '800', letterSpacing: '0.05em' }}>
                      <Sparkles size={10} style={{ color: 'var(--color-orange-dot)' }} />
                      <span>INVOICE REFERENCE</span>
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                      #{reminderInvoice.invoiceNo}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500', marginTop: '2px' }}>
                      {reminderInvoice.customerName}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '10px', borderTop: '1px dashed rgba(0,0,0,0.08)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Balance Outstanding</span>
                      <span style={{ fontSize: '16px', color: '#e11d48', fontWeight: '800' }}>
                        {formatINR(reminderInvoice.totalAmount - reminderInvoice.paidAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Follow-up Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={reminderDate} 
                      onChange={e => setReminderDate(e.target.value)} 
                      required 
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        fontSize: '13px',
                        fontWeight: '600',
                        width: '100%',
                        transition: 'var(--transition-fast)'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                      <button 
                        type="button"
                        className="btn-small"
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '11px', 
                          borderRadius: '20px',
                          border: '1px solid',
                          background: isToday ? 'var(--color-text-primary)' : 'transparent',
                          color: isToday ? '#fff' : 'var(--color-text-secondary)',
                          borderColor: isToday ? 'var(--color-text-primary)' : 'var(--color-border)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                        onClick={() => setReminderDate(todayStr)}
                      >
                        Today
                      </button>
                      <button 
                        type="button"
                        className="btn-small"
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '11px', 
                          borderRadius: '20px',
                          border: '1px solid',
                          background: isIn2Days ? 'var(--color-text-primary)' : 'transparent',
                          color: isIn2Days ? '#fff' : 'var(--color-text-secondary)',
                          borderColor: isIn2Days ? 'var(--color-text-primary)' : 'var(--color-border)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                        onClick={() => setReminderDate(in2DaysStr)}
                      >
                        In 2 Days
                      </button>
                      <button 
                        type="button"
                        className="btn-small"
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '11px', 
                          borderRadius: '20px',
                          border: '1px solid',
                          background: isIn1Week ? 'var(--color-text-primary)' : 'transparent',
                          color: isIn1Week ? '#fff' : 'var(--color-text-secondary)',
                          borderColor: isIn1Week ? 'var(--color-text-primary)' : 'var(--color-border)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                        onClick={() => setReminderDate(in1WeekStr)}
                      >
                        In 1 Week
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Action Notes</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="e.g. Call client finance office, double check transfer ref..."
                      value={reminderNotes}
                      onChange={e => setReminderNotes(e.target.value)}
                      style={{ 
                        minHeight: '70px', 
                        fontSize: '13px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        width: '100%',
                        resize: 'vertical',
                        transition: 'var(--transition-fast)'
                      }}
                    />
                  </div>

                  <button 
                    className="btn-small"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      marginTop: '4px', 
                      background: 'linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%)',
                      color: '#ffffff',
                      fontWeight: '800',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(220, 242, 107, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      transition: 'var(--transition-smooth)'
                    }}
                    onClick={() => {
                      if (!reminderDate) return;
                      dispatch({
                        type: 'ADD_PAYMENT_REMINDER',
                        payload: {
                          id: Date.now() + Math.random(),
                          invoiceId: reminderInvoice.id,
                          invoiceNo: reminderInvoice.invoiceNo,
                          customerName: reminderInvoice.customerName,
                          amount: reminderInvoice.totalAmount - reminderInvoice.paidAmount,
                          date: reminderDate,
                          notes: reminderNotes || 'Payment follow-up'
                        }
                      });
                      setReminderNotes('');
                      setReminderInvoice(null);
                      Swal.fire({
                        icon: 'success',
                        title: 'Reminder Saved',
                        text: 'Self reminder has been scheduled successfully.',
                        timer: 1500,
                        showConfirmButton: false
                      });
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Create Self Reminder</span>
                  </button>
                </div>

                {/* Reminders List Side */}
                <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '1px solid var(--color-border)', paddingLeft: '20px' }}>
                  <div>
                    <h4 style={{ 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      color: '#e11d48', 
                      textTransform: 'uppercase', 
                      marginBottom: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      letterSpacing: '0.05em'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} />
                        <span>Today's Follow-ups</span>
                      </div>
                      <span style={{ fontSize: '9px', padding: '2px 6px', background: '#ffe4e6', color: '#be123c', border: '1px solid #fecdd3', borderRadius: '4px', fontWeight: '800' }}>
                        {todaysReminders.length}
                      </span>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
                      {todaysReminders.length === 0 ? (
                        <div style={{ 
                          border: '1px dashed #DCE5F0', 
                          borderRadius: '10px', 
                          padding: '16px', 
                          textAlign: 'center',
                          color: 'var(--color-text-muted)',
                          fontSize: '11.5px',
                          background: '#fafbfc'
                        }}>
                          No follow-ups due today.
                        </div>
                      ) : (
                        todaysReminders.map(r => (
                          <div 
                            key={r.id} 
                            style={{ 
                              background: '#fff', 
                              border: '1px solid #fee2e2', 
                              borderLeft: '4px solid #ef4444',
                              borderRadius: '10px', 
                              padding: '10px 12px', 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'start', 
                              gap: '12px',
                              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.03)'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: '800', fontSize: '12px', color: '#1e293b' }}>
                                  #{r.invoiceNo}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                                  {r.customerName}
                                </span>
                              </div>
                              <span style={{ fontSize: '11px', color: '#475569', fontWeight: '500', lineHeight: '1.4' }}>
                                {r.notes}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span className="badge badge-overdue" style={{ fontSize: '9px', padding: '1px 4px', textTransform: 'uppercase', background: '#ef4444', color: '#fff', borderRadius: '3px' }}>
                                  Today
                                </span>
                                <span style={{ fontSize: '10px', color: '#be123c', fontWeight: '700' }}>
                                  {formatINR(r.amount)}
                                </span>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              style={{ 
                                background: '#fee2e2', 
                                border: 'none', 
                                color: '#991b1b', 
                                cursor: 'pointer', 
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'var(--transition-fast)'
                              }}
                              onClick={() => dispatch({ type: 'DELETE_PAYMENT_REMINDER', payload: r.id })}
                              title="Complete & Delete"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      color: 'var(--color-text-secondary)', 
                      textTransform: 'uppercase', 
                      marginBottom: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      letterSpacing: '0.05em'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} style={{ color: 'var(--color-text-secondary)' }} />
                        <span>Upcoming (Future)</span>
                      </div>
                      <span style={{ fontSize: '9px', padding: '2px 6px', background: '#f1f5f9', color: '#475569', border: '1px solid #D6E2F0', borderRadius: '4px', fontWeight: '800' }}>
                        {upcomingReminders.length}
                      </span>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
                      {upcomingReminders.length === 0 ? (
                        <div style={{ 
                          border: '1px dashed #DCE5F0', 
                          borderRadius: '10px', 
                          padding: '16px', 
                          textAlign: 'center',
                          color: 'var(--color-text-muted)',
                          fontSize: '11.5px',
                          background: '#fafbfc'
                        }}>
                          No upcoming follow-ups.
                        </div>
                      ) : (
                        upcomingReminders.map(r => (
                          <div 
                            key={r.id} 
                            style={{ 
                              background: '#fff', 
                              border: '1px solid #DCE5F0', 
                              borderLeft: '4px solid var(--color-accent-teal)',
                              borderRadius: '10px', 
                              padding: '10px 12px', 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'start', 
                              gap: '12px',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: '800', fontSize: '12px', color: '#1e293b' }}>
                                  #{r.invoiceNo}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                                  {r.customerName}
                                </span>
                              </div>
                              <span style={{ fontSize: '11px', color: '#475569', fontWeight: '500', lineHeight: '1.4' }}>
                                {r.notes}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontSize: '9px', padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '4px', fontWeight: '800' }}>
                                  {r.date}
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                                  {formatINR(r.amount)}
                                </span>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              style={{ 
                                background: '#f1f5f9', 
                                border: 'none', 
                                color: '#5E6B82', 
                                cursor: 'pointer', 
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'var(--transition-fast)'
                              }}
                              onClick={() => dispatch({ type: 'DELETE_PAYMENT_REMINDER', payload: r.id })}
                              title="Complete & Delete"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

              <div className="form-actions" style={{ marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-small btn-outline-small"
                  onClick={() => setReminderInvoice(null)}
                  style={{ minWidth: '100px', justifyContent: 'center' }}
                >
                  Close Planner
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
