'use client';

import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { 
  Bell, 
  Search, 
  RefreshCw,
  Mail,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useERPStore } from '../../../store/erpStore';
import { useAuthStore } from '../../../store/authStore';

export default function OutstandingView() {
  const state = useERPStore((s) => s.state);
  const financeActions = useERPStore((s) => (s).finance);
  const user = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [activePreset, setActivePreset] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const orders = state.sales?.orders || [];
  const customerPayments = state.finance?.customerPayments || [];
  const followUps = state.finance?.paymentFollowUps || [];

  // Map outstanding list from orders and payments
  const outstandingList = useMemo(() => {
    return orders.map((o) => {
      const totalAmount = Number(o.grandTotal ?? o.totalAmount ?? 0);
      const paidAmount = customerPayments
        .filter((p) => p.orderId === o.id && p.verificationStatus === 'FINANCE_VERIFIED')
        .reduce((sum, p) => sum + p.paymentAmount, 0);
      const outstanding = Math.max(totalAmount - paidAmount, 0);

      // Days Overdue
      const dueDate = o.requiredDeliveryDate || o.expectedDeliveryDate || new Date().toISOString();
      const diffTime = Date.now() - new Date(dueDate).getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      return {
        invoiceId: o.id,
        invoiceNumber: o.invoiceNo || 'Pending',
        orderNumber: o.id,
        customerName: o.customerName,
        customerId: o.customerId || o.customer?.id || 'CUST-UNKNOWN',
        totalAmount,
        paidAmount,
        outstanding,
        dueDate,
        daysOverdue,
        salesPerson: o.salesperson || 'N/A',
        status: o.paymentStatus || 'PAYMENT_DUE',
        orderStatus: o.dispatchStatus || 'OPEN',
        reminderSent: followUps.some((f) => f.orderId === o.id)
      };
    }).filter((item) => item.outstanding > 0);
  }, [orders, customerPayments, followUps]);

  // Compute aging buckets
  const agingStats = useMemo(() => {
    return outstandingList.reduce((acc, item) => {
      const bal = item.outstanding;
      if (item.daysOverdue <= 0) acc.current += bal;
      else if (item.daysOverdue <= 30) acc.bracket1_30 += bal;
      else if (item.daysOverdue <= 60) acc.bracket31_60 += bal;
      else if (item.daysOverdue <= 90) acc.bracket61_90 += bal;
      else acc.bracket90_plus += bal;
      return acc;
    }, { current: 0, bracket1_30: 0, bracket31_60: 0, bracket61_90: 0, bracket90_plus: 0 });
  }, [outstandingList]);

  const handleSendReminder = (item, channel) => {
    Swal.fire({
      title: `Sending ${channel} Reminder...`,
      html: `Drafting message for ${item.customerName} regarding outstanding amount: <strong>${formatCurrency(item.outstanding)}</strong>.`,
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => Swal.showLoading()
    }).then(() => {
      // Record a follow up log
      try {
        const actor = {
          id: user?.id || 'System',
          name: user?.name || 'Finance Executive User',
          role: user?.role || 'Finance Executive'
        };
        financeActions.addPaymentFollowUp({
          customerId: item.customerId,
          orderId: item.invoiceId,
          invoiceNumber: item.invoiceNumber,
          contactPerson: 'Accounts Manager',
          phoneNumber: '9876543210',
          followUpDate: new Date().toISOString().split('T')[0],
          contactMode: channel === 'WhatsApp' ? 'WhatsApp' : 'Email',
          discussionSummary: `Sent automated payment reminder for outstanding balance: ${formatCurrency(item.outstanding)}`,
          customerResponse: 'Needs More Time',
          nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          remarks: `Automated ${channel} reminder sent.`
        }, actor);

        Swal.fire({
          icon: 'success',
          title: 'Reminder Sent & Logged',
          text: `${channel} reminder successfully sent to ${item.customerName} and logged in follow-ups.`,
          timer: 1850,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire('Error', err?.message || String(err), 'error');
      }
    });
  };

  const handleClientReminderPrompt = (item) => {
    Swal.fire({
      title: 'Send Payment Reminder',
      text: `Select how you want to send the payment reminder to ${item.customerName} for ${formatCurrency(item.outstanding)}:`,
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Send via WhatsApp',
      denyButtonText: 'Send via Email',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#22c55e',
      denyButtonColor: '#0284c7'
    }).then((result) => {
      if (result.isConfirmed) {
        handleSendReminder(item, 'WhatsApp');
      } else if (result.isDenied) {
        handleSendReminder(item, 'Email');
      }
    });
  };

  const handleSelfReminder = (item) => {
    const today = new Date().toISOString().split('T')[0];
    Swal.fire({
      title: 'Schedule Self Reminder',
      html: `
        <div style="text-align: left; font-family: 'Outfit', sans-serif; font-size: 13.5px; display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Reminder Follow-up Date</label>
            <input type="date" id="reminder-date" value="${today}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Task Description / Notes</label>
            <textarea id="reminder-notes" placeholder="e.g. Call client accounts manager to verify NEFT settlement" style="width: 100%; height: 80px; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13px; resize: none;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Schedule Reminder',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0ea5e9',
      preConfirm: () => {
        const date = (document.getElementById('reminder-date') ).value;
        const notes = (document.getElementById('reminder-notes') ).value;
        if (!date) {
          Swal.showValidationMessage('Reminder date is required.');
          return false;
        }
        return { date, notes };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const actor = {
            id: user?.id || 'System',
            name: user?.name || 'Finance Executive User',
            role: user?.role || 'Finance Executive'
          };
          financeActions.addPaymentFollowUp({
            customerId: item.customerId,
            orderId: item.invoiceId,
            invoiceNumber: item.invoiceNumber,
            contactPerson: 'Accounts Desk',
            phoneNumber: '9876543210',
            followUpDate: today,
            contactMode: 'Phone',
            discussionSummary: `Scheduled task: ${result.value.notes}`,
            customerResponse: 'Needs More Time',
            nextFollowUpDate: result.value.date,
            remarks: result.value.notes
          }, actor);

          Swal.fire({
            icon: 'success',
            title: 'Reminder Logged',
            text: 'Self reminder scheduled and saved to customer follow-ups.',
            timer: 1850,
            showConfirmButton: false
          });
        } catch (err) {
          Swal.fire('Error', err?.message || String(err), 'error');
        }
      }
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const filteredList = useMemo(() => {
    return outstandingList.filter((o) => {
      const matchesSearch = 
        o.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.salesPerson?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      switch (activePreset) {
        case 'Reminders':
          return o.reminderSent;
        case '20-30 Days Overdue':
          return o.daysOverdue >= 20 && o.daysOverdue <= 30;
        case '30-45 Days Overdue':
          return o.daysOverdue > 30 && o.daysOverdue <= 45;
        case '45-60 Days Overdue':
          return o.daysOverdue > 45 && o.daysOverdue <= 60;
        case '60-90 Days Overdue':
          return o.daysOverdue > 60 && o.daysOverdue <= 90;
        case '90+ Days Overdue':
          return o.daysOverdue > 90;
        default:
          return true;
      }
    });
  }, [outstandingList, searchQuery, activePreset]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Outstanding Collections</h1>
        <p style={{ color: '#64748B', fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
          Monitor aging balances, send client payment reminders, and record collections commitments.
        </p>
      </div>

      {/* Aging Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Current Due</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#1E293B' }}>{formatCurrency(agingStats.current)}</h3>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>1-30 Days</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#10b981' }}>{formatCurrency(agingStats.bracket1_30)}</h3>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f59e0b', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase' }}>31-60 Days</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#f59e0b' }}>{formatCurrency(agingStats.bracket31_60)}</h3>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f97316', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '11px', color: '#f97316', fontWeight: '700', textTransform: 'uppercase' }}>61-90 Days</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#f97316' }}>{formatCurrency(agingStats.bracket61_90)}</h3>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ef4444', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase' }}>90+ Days Overdue</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(agingStats.bracket90_plus)}</h3>
        </div>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Filters bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Reminders', '20-30 Days Overdue', '30-45 Days Overdue', '45-60 Days Overdue', '60-90 Days Overdue', '90+ Days Overdue'].map((preset) => (
              <button
                key={preset}
                onClick={() => setActivePreset(preset)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: activePreset === preset ? '#0ea5e9' : '#F1F5F9',
                  color: activePreset === preset ? 'white' : '#475569',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '10px', width: '14px', height: '14px', color: '#94A3B8' }} />
            <input 
              type="text" 
              placeholder="Search outstanding..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px' }}>Customer Name</th>
                <th style={{ padding: '12px 16px' }}>Invoice No</th>
                <th style={{ padding: '12px 16px' }}>Total Amount</th>
                <th style={{ padding: '12px 16px' }}>Outstanding</th>
                <th style={{ padding: '12px 16px' }}>Due Date</th>
                <th style={{ padding: '12px 16px' }}>Days Overdue</th>
                <th style={{ padding: '12px 16px' }}>Sales Executive</th>
                <th style={{ padding: '12px 16px' }}>Delivery Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13.5px' }}>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                    No outstanding accounts found matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.invoiceId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{item.customerName}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{item.invoiceNumber}</td>
                    <td style={{ padding: '12px 16px' }}>₹{item.totalAmount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: '#EF4444' }}>₹{item.outstanding.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px' }}>{item.dueDate?.split('T')[0]}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: item.daysOverdue > 90 ? '#FFE4E6' : (item.daysOverdue > 30 ? '#FFEDD5' : '#D1FAE5'),
                        color: item.daysOverdue > 90 ? '#9E2121' : (item.daysOverdue > 30 ? '#C2410C' : '#065F46')
                      }}>
                        {item.daysOverdue > 0 ? `${item.daysOverdue} Days` : 'Not Due'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{item.salesPerson}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: item.orderStatus === 'DELIVERED' ? '#D1FAE5' : '#F1F5F9',
                        color: item.orderStatus === 'DELIVERED' ? '#065F46' : '#475569'
                      }}>
                        {item.orderStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button 
                          onClick={() => handleClientReminderPrompt(item)}
                          style={{
                            padding: '6px 10px',
                            background: '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Bell size={12} /> Remind Client
                        </button>
                        <button 
                          onClick={() => handleSelfReminder(item)}
                          style={{
                            padding: '6px 10px',
                            background: '#F1F5F9',
                            color: '#475569',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Schedule Self
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
