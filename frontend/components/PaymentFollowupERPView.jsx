'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Swal from 'sweetalert2';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '../lib/apiClient';
import { useERPStore } from '../store/erpStore';
import { backendFetch } from '../lib/backendFetch';

const PAYMENT_LABELS = {
  PAYMENT_PENDING: 'Awaiting Payment',
  PARTIALLY_PAID: 'Partial Paid',
  AWAITING_FINANCE_VERIFICATION: 'Payment Verification Pending',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  WAITING_FOR_DELIVERY: 'Waiting for Delivery',
};

const formatINR = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const isoDate = (d) => {
  if (!d) return null;
  try {
    return new Date(d).toISOString().split('T')[0];
  } catch {
    return null;
  }
};

const computeReminderStatus = (nextDate, currentStatus) => {
  if (currentStatus === 'Completed') return 'Completed';
  if (!nextDate) return 'Upcoming';
  const today = new Date().toISOString().split('T')[0];
  if (nextDate < today) return 'Overdue';
  if (nextDate === today) return 'Today';
  return 'Upcoming';
};

export default function PaymentFollowupERPView({ orders = [] }) {
  const navigate = useRouter();
  const canonicalState = useERPStore(store => store.state);
  const canonicalOrders = canonicalState?.sales?.orders || [];
  const canonicalQuotations = canonicalState?.sales?.quotations || [];
  const paymentConfirmations = canonicalState?.sales?.paymentConfirmations || [];
  const consignments = canonicalState?.dispatch?.consignments || [];
  const isCompact = useMediaQuery('(max-width: 1024px)');
  const [activeTab, setActiveTab] = useState('all'); // all | reminders | overdue | completed
  const [agingFilter, setAgingFilter] = useState('');
  const [showAgingDropdown, setShowAgingDropdown] = useState(false);
  const [pendingFilter, setPendingFilter] = useState('pending'); // pending | confirmed
  const [pendingCollection, setPendingCollection] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingFollowups, setLoadingFollowups] = useState(true);
  const [reminderFilter, setReminderFilter] = useState('All');

  const refreshPending = async () => {
    setLoadingPending(true);
    try {
      const res = await apiClient.get('/sales/orders/delivered/pending-payment');
      setPendingCollection(res?.success ? res.data : []);
    } catch (err) {
      console.error(err);
      setPendingCollection([]);
    } finally {
      setLoadingPending(false);
    }
  };

  const refreshFollowups = async () => {
    setLoadingFollowups(true);
    try {
      const res = await apiClient.get('/sales/payment-followups');
      setFollowups(res?.success ? res.data : []);
    } catch (err) {
      console.error(err);
      setFollowups([]);
    } finally {
      setLoadingFollowups(false);
    }
  };

  useEffect(() => {
    refreshPending();
    refreshFollowups();
  }, []);



  const completedOrders = useMemo(() => {
    const delivered = (orders || []).filter(o => {
      const st = String(o.orderStatus || o.status || o.workflowStatus || o.overallStage || '').trim().toUpperCase();
      const dispatchSt = String(o.dispatchStatus || '').toUpperCase();
      return ['DELIVERED', 'INVOICED', 'PAYMENT_PENDING', 'PAYMENT COMPLETED', 'PARTIALLY PAID', 'COMPLETED', 'CLOSED'].includes(st) || dispatchSt === 'DELIVERED' || Boolean(o?.deliveredDate || o?.deliveredAt);
    });
    return delivered.filter(o => {
      const paySt = String(o.paymentStatus || '').toUpperCase();
      const total = Number(o.totalAmount || o.totalValue || o.grandTotal || 0);
      const paid = Number(o.verifiedPaidAmount || o.payment?.paidAmount || o.payment?.paid || 0);
      const bal = o.balanceAmount !== undefined ? Number(o.balanceAmount) : Math.max(0, total - paid);
      return paySt === 'PAID' || (bal <= 0 && total > 0);
    });
  }, [orders]);

  const openAddFollowup = async (order) => {
    const today = new Date().toISOString().split('T')[0];
    const { value: formValues } = await Swal.fire({
      title: 'Add Follow-up',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:12px;">
          <div style="display:grid; grid-template-columns:110px 1fr; gap:8px; font-size:13px;">
            <span><strong>Customer</strong></span><span>${order.customer_name || 'N/A'}</span>
            <span><strong>Order</strong></span><span style="font-family:monospace;">${order.order_number || `ORD-${order.id}`}</span>
            <span><strong>Balance</strong></span><span style="color:#ef4444; font-weight:800;">${formatINR(order.balance_amount ?? (Number(order.grand_total || 0) - Number(order.verified_paid_amount || 0)))}</span>
          </div>
          <div>
            <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Conversation</label>
            <textarea id="pf-note" style="width:100%; min-height:90px; padding:10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;" placeholder="e.g. Spoke to accounts, promised payment on Friday..."></textarea>
          </div>
          <div>
            <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Next Reminder Date</label>
            <input id="pf-next" type="date" value="${today}" style="width:100%; height:40px; padding:0 10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const note = document.getElementById('pf-note').value.trim();
        const nextDate = document.getElementById('pf-next').value || null;
        if (!note) {
          Swal.showValidationMessage('Follow-up note is required.');
          return false;
        }
        return { note, nextDate };
      }
    });

    if (!formValues) return;
    try {
      const status = computeReminderStatus(formValues.nextDate, 'Upcoming');
      await apiClient.post(`/sales/orders/${order.id}/payment-followups`, {
        followup_note: formValues.note,
        next_reminder_date: formValues.nextDate,
        status
      });
      await Promise.all([refreshFollowups(), refreshPending()]);
      Swal.fire({ icon: 'success', title: 'Follow-up saved', timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: err?.message || 'Could not save follow-up.' });
    }
  };

  const openViewPaymentHistory = async (order) => {
    try {
      const res = await apiClient.get(`/payment-verification/order/${order.id}/history`);
      if (!res?.success || !res.data || res.data.length === 0) {
        Swal.fire({ icon: 'info', title: 'Payment History', text: 'No verified payments found.' });
        return;
      }

      const rowsHtml = res.data.map(p => `
        <tr style="border-bottom: 1px solid #DCE5F0;">
          <td style="padding: 10px; font-family: monospace;">${p.request_number || 'N/A'}</td>
          <td style="padding: 10px; font-weight: bold; color: ${p.status === 'VERIFIED' ? '#16a34a' : p.status === 'REJECTED' ? '#dc2626' : '#d97706'}">
            ${p.status}
          </td>
          <td style="padding: 10px; text-align: right;">${formatINR(p.payment_amount)}</td>
          <td style="padding: 10px;">${p.payment_mode || 'N/A'}</td>
          <td style="padding: 10px; font-size: 11px;">${p.verification_notes || p.remarks || '-'}</td>
        </tr>
      `).join('');

      Swal.fire({
        title: `Payment History — ${order.order_number}`,
        width: 700,
        html: `
          <div style="text-align: left; font-size: 13px; width: 100%;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="border-bottom: 2px solid #D6E2F0; font-weight: bold; text-align: left; background: #F5FAFE;">
                  <th style="padding: 10px;">Req No</th>
                  <th style="padding: 10px;">Status</th>
                  <th style="padding: 10px; text-align: right;">Amount</th>
                  <th style="padding: 10px;">Mode</th>
                  <th style="padding: 10px;">Remarks/Notes</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        `,
        confirmButtonText: 'Close',
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title',
          confirmButton: 'swal-premium-confirm-btn'
        },
        buttonsStyling: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load payment history.' });
    }
  };

  const openConfirmPayment = async (order) => {
    const total = Number(order.grand_total || 0);
    const verified = Number(order.verified_paid_amount || 0);
    const remaining = Math.max(0, total - verified);

    const { value: formValues } = await Swal.fire({
      title: 'Record Client Payment Collection',
      width: 650,
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:14px;">
          <div style="display:grid; grid-template-columns:140px 1fr; gap:8px; font-size:13px;">
            <span><strong>Customer</strong></span><span>${order.customer_name || 'N/A'}</span>
            <span><strong>Order No</strong></span><span style="font-family:monospace;">${order.order_number || `ORD-${order.id}`}</span>
            <span><strong>Total Order</strong></span><span>${formatINR(total)}</span>
            <span><strong>Verified Paid</strong></span><span style="color:#10b981; font-weight:800;">${formatINR(verified)}</span>
            <span><strong>Remaining Balance</strong></span><span style="color:#ef4444; font-weight:900;">${formatINR(remaining)}</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Amount Received *</label>
              <input id="pc-amount" type="number" min="1" step="0.01" value="${remaining}" style="width:100%; height:40px; padding:0 10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;" />
            </div>
            <div>
              <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Receipt Upload *</label>
              <input id="pc-file" type="file" accept=".jpg,.jpeg,.png,.pdf" style="width:100%; height:40px; padding:6px 0; font-size:13px;" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Payment Mode *</label>
              <select id="pc-mode" style="width:100%; height:40px; padding:0 10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;">
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="IMPS">IMPS</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Transaction Reference</label>
              <input id="pc-ref" type="text" placeholder="UTR or Txn ID" style="width:100%; height:40px; padding:0 10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;" />
            </div>
          </div>

          <div>
            <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Remarks</label>
            <textarea id="pc-remarks" placeholder="Optional notes…" style="width:100%; min-height:70px; padding:10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Submit Request',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const amount = Number(document.getElementById('pc-amount').value || 0);
        const mode = document.getElementById('pc-mode').value;
        const ref = document.getElementById('pc-ref').value.trim();
        const remarks = document.getElementById('pc-remarks').value.trim();
        const fileEl = document.getElementById('pc-file');
        const file = fileEl?.files?.[0];
        if (!amount || amount <= 0) {
          Swal.showValidationMessage('Amount Received is required.');
          return false;
        }
        if (amount > remaining) {
          Swal.showValidationMessage('Amount cannot exceed remaining balance.');
          return false;
        }
        if (!mode) {
          Swal.showValidationMessage('Payment Mode is required.');
          return false;
        }
        if (!file) {
          Swal.showValidationMessage('Receipt upload is required.');
          return false;
        }
        return { amount, mode, ref, remarks, file };
      }
    });

    if (!formValues) return;
    try {
      const uniqueRef = formValues.ref || `TXN-${order.id || order.order_number || 'ORD'}-${Date.now().toString().slice(-4)}`;
      
      const orderId = order.id || order.order_number || order.orderNo;
      if (process.env.NEXT_PUBLIC_DATA_SOURCE_MODE !== 'local') {
        let proofUrl = 'missing-proof.jpg';
        if (formValues.file) {
          const formData = new FormData();
          formData.append('file', formValues.file);
          formData.append('category', 'attachments');
          try {
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              proofUrl = uploadData.url || 'missing-proof.jpg';
            }
          } catch (uploadErr) {
            console.error('File upload failed, using fallback', uploadErr);
          }
        }

        const payload = {
          salesOrderId: order.id,
          customerId: order.customerId || 'unknown',
          amount: Number(formValues.amount),
          proofUrl: proofUrl,
        };

        await backendFetch('/api/backend/finance/payments/sales-record', {
          method: 'POST',
          body: payload,
        });
      } else {
        useERPStore.getState().recordSalesPayment(orderId, {
          amount: formValues.amount,
          method: formValues.mode,
          paymentMode: formValues.mode,
          transactionReference: uniqueRef,
          referenceNumber: uniqueRef,
          paymentDate: new Date().toISOString().split('T')[0],
          remarks: formValues.remarks || `Sales collected payment for ${order.id || order.order_number || 'Order'}`,
        }, 'Sales User');
      }

      Swal.fire({
        icon: 'success',
        title: 'Payment Collection Submitted!',
        html: `<div style="font-size:14px; text-align:center;">
          <p style="margin-bottom:8px;">Payment of <strong>${formatINR(formValues.amount)}</strong> recorded successfully.</p>
          <span style="background:#fef3c7; color:#92400e; padding:4px 12px; border-radius:6px; font-weight:700; font-size:12px;">Status: Sent to Finance Verification</span>
        </div>`,
        timer: 3000,
        showConfirmButton: false
      });
      await Promise.all([refreshPending(), refreshFollowups()]);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err?.message || 'Failed to record payment collection.'
      });
    }
  };

  const remindersWithComputed = useMemo(() => {
    return (followups || []).map(f => ({
      ...f,
      reminder_date: f.next_reminder_date ? isoDate(f.next_reminder_date) : null,
      computed_status: computeReminderStatus(isoDate(f.next_reminder_date), f.status),
    }));
  }, [followups]);

  const filteredReminders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = (() => {
      const d = new Date();
      const day = d.getDay(); // 0 sunday
      const diff = (day === 0 ? 6 : day - 1);
      d.setDate(d.getDate() - diff);
      return d.toISOString().split('T')[0];
    })();
    const endOfWeek = (() => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + 6);
      return d.toISOString().split('T')[0];
    })();
    const tomorrow = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    })();

    return remindersWithComputed.filter(r => {
      if (reminderFilter === 'All') return true;
      if (reminderFilter === 'Today') return r.reminder_date === today;
      if (reminderFilter === 'Tomorrow') return r.reminder_date === tomorrow;
      if (reminderFilter === 'This Week') return r.reminder_date && r.reminder_date >= startOfWeek && r.reminder_date <= endOfWeek;
      if (reminderFilter === 'Overdue') return r.computed_status === 'Overdue';
      if (reminderFilter === 'Upcoming') return r.computed_status === 'Upcoming';
      return true;
    });
  }, [remindersWithComputed, reminderFilter]);

  const updateReminder = async (followupId, updates, successText = 'Reminder updated') => {
    try {
      await apiClient.patch(`/sales/payment-followups/${followupId}`, updates);
      await Promise.all([refreshFollowups(), refreshPending()]);
      Swal.fire({ icon: 'success', title: successText, timer: 1100, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: err?.message || 'Could not update reminder.' });
    }
  };

  const deleteReminder = async (followupId) => {
    const confirm = await Swal.fire({
      title: 'Delete reminder?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (!confirm.isConfirmed) return;
    try {
      await apiClient.delete(`/sales/payment-followups/${followupId}`);
      await Promise.all([refreshFollowups(), refreshPending()]);
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Delete failed', text: err?.message || 'Could not delete reminder.' });
    }
  };

  const callDoneReminder = async (r) => {
    const { value: note } = await Swal.fire({
      title: 'Call Done',
      input: 'textarea',
      inputLabel: 'Conversation update',
      inputPlaceholder: 'What was discussed in the call?',
      inputValue: r.followup_note || '',
      showCancelButton: true,
      confirmButtonText: 'Save Call Update',
      cancelButtonText: 'Cancel'
    });
    if (note === undefined) return;
    await updateReminder(r.id, {
      followup_note: String(note || '').trim() || r.followup_note,
      status: computeReminderStatus(r.reminder_date, 'Upcoming')
    }, 'Call update saved');
  };

  const pendingRows = useMemo(() => {
    const apiRows = pendingCollection || [];
    // API/legacy records are fallbacks; canonical Zustand orders must win deduplication.
    const allCandidates = [...apiRows, ...(orders || []), ...canonicalOrders];
    
    const map = new Map();
    allCandidates.forEach(o => {
      const st = String(o.orderStatus || o.status || o.workflowStatus || o.overallStage || '').trim().toUpperCase();
      const dispatchSt = String(o.dispatchStatus || '').toUpperCase();
      const isDelivered = ['DELIVERED', 'INVOICED', 'PAYMENT_PENDING', 'PAYMENT COMPLETED', 'PARTIALLY PAID', 'COMPLETED', 'CLOSED'].includes(st) || dispatchSt === 'DELIVERED' || Boolean(o?.deliveredDate || o?.deliveredAt || o?.delivered_at);
      if (!isDelivered) return;

      const paySt = String(o.paymentStatus || o.payment_status || '').trim().toUpperCase();
      const total = Number(o.grand_total || o.totalAmount || o.totalValue || o.grandTotal || 0);
      const paid = Number(o.verified_paid_amount || o.verifiedPaidAmount || o.payment?.paidAmount || o.payment?.paid || 0);
      const bal = o.balance_amount !== undefined ? Number(o.balance_amount) : (o.balanceAmount !== undefined ? Number(o.balanceAmount) : Math.max(0, total - paid));

      if (paySt === 'PAID' || (bal <= 0 && total > 0)) return;

      const orderNo = o.order_number || o.orderNo || o.id;
      if (!orderNo) return;
      const quotation = canonicalQuotations.find(q =>
        String(q.id) === String(o.quotationId || o.quotation_id)
      );
      const consignment = consignments.find(c =>
        String(c.orderId) === String(o.id) ||
        String(c.orderId) === String(orderNo)
      );
      const confirmations = paymentConfirmations.filter(p =>
        String(p.orderId) === String(o.id) ||
        String(p.orderId) === String(orderNo)
      );
      const verifiedFromConfirmations = confirmations
        .filter(p => ['FINANCE_VERIFIED', 'VERIFIED'].includes(String(p.status || '').toUpperCase()))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const hasPendingConfirmation = confirmations.some(p =>
        ['FINANCE_VERIFICATION_PENDING', 'PENDING', 'SUBMITTED_FOR_VERIFICATION'].includes(
          String(p.status || '').toUpperCase()
        )
      );
      const resolvedTotal = Number(consignment?.payableAmount ?? total) || total;
      const resolvedPaid = Math.max(paid, verifiedFromConfirmations);
      const resolvedBalance = Math.max(0, resolvedTotal - resolvedPaid);
      const deliveredAt = consignment?.deliveredAt || o.delivered_at || o.deliveredAt ||
        o.actualDeliveryDate || o.deliveredDate;
      const invoiceDate = o.invoiceDate || o.invoice_date || deliveredAt || o.createdAt || o.created_at;
      const paymentTermDays = Number(
        o.paymentTermDays ?? o.payment_terms_days ?? quotation?.paymentTermDays ?? 15
      ) || 15;
      const dueDateValue = o.paymentDueDate || o.payment_due_date || (() => {
        if (!invoiceDate) return null;
        const date = new Date(invoiceDate);
        date.setDate(date.getDate() + paymentTermDays);
        return date.toISOString();
      })();
      const remainingDays = dueDateValue
        ? Math.ceil((new Date(dueDateValue).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
        : null;
      const resolvedPaymentStatus = hasPendingConfirmation
        ? 'AWAITING_FINANCE_VERIFICATION'
        : (resolvedPaid >= resolvedTotal && resolvedTotal > 0
          ? 'PAID'
          : (resolvedPaid > 0 ? 'PARTIALLY_PAID' : (deliveredAt ? 'PAYMENT_PENDING' : 'WAITING_FOR_DELIVERY')));

      const normalized = {
        id: o.id || orderNo,
        customerId: o.customerId || o.customer_id || o.customer?.id || 'unknown',
        order_number: orderNo,
        customer_name: o.customer_name || o.customerName || o.customer?.name || 'ABC Infrastructure Pvt Ltd',
        grand_total: resolvedTotal,
        invoice_number: o.invoiceNo || o.invoice_number || `INV-${String(orderNo).replace(/^ORD-/, '').slice(-6)}`,
        salesperson: o.salesperson || o.salesPerson || quotation?.salesperson || 'Sales',
        verified_paid_amount: resolvedPaid,
        balance_amount: resolvedBalance,
        payment_status: resolvedPaymentStatus,
        delivered_at: deliveredAt,
        invoice_date: invoiceDate,
        payment_terms: `${paymentTermDays} Days`,
        payment_due_date: dueDateValue,
        remaining_days: remainingDays,
        reminder_label: remainingDays === null
          ? 'Not scheduled'
          : (remainingDays < 0 ? `Overdue by ${Math.abs(remainingDays)} Days` : `Due in ${remainingDays} Days`),
        latest_pv_status: o.latest_pv_status || o.latestPvStatus,
        latest_pv_notes: o.latest_pv_notes || o.latestPvNotes
      };
      map.set(String(orderNo).toLowerCase(), normalized);
    });

    const rows = Array.from(map.values());
    
    let finalRows = rows;
    if (activeTab === 'overdue' && agingFilter) {
      finalRows = rows.filter(o => {
        if (!o.delivered_at && !o.deliveredAt) return false;
        const d = o.delivered_at || o.deliveredAt;
        const days = Math.floor((new Date() - new Date(d)) / (1000 * 60 * 60 * 24));
        if (agingFilter.includes('20-30') || agingFilter.includes('20–30')) return days >= 20 && days <= 30;
        if (agingFilter.includes('30-45') || agingFilter.includes('30–45')) return days > 30 && days <= 45;
        if (agingFilter.includes('45-60') || agingFilter.includes('45–60')) return days > 45 && days <= 60;
        if (agingFilter.includes('60-90') || agingFilter.includes('60–90')) return days > 60 && days <= 90;
        if (agingFilter.includes('90+')) return days > 90;
        return false;
      });
    } else if (activeTab === 'all' && pendingFilter === 'confirmed') {
      finalRows = rows.filter(o => String(o.payment_status || '').toUpperCase() === 'AWAITING_FINANCE_VERIFICATION' || String(o.payment_status || '').toLowerCase() === 'submitted_for_verification');
    } else {
      finalRows = rows.filter(o => String(o.payment_status || '').toUpperCase() !== 'AWAITING_FINANCE_VERIFICATION' && String(o.payment_status || '').toLowerCase() !== 'submitted_for_verification');
    }
    return finalRows;
  }, [
    pendingCollection,
    orders,
    canonicalOrders,
    canonicalQuotations,
    consignments,
    paymentConfirmations,
    pendingFilter,
    activeTab,
    agingFilter,
  ]);

  return (
    <div className="app-card" style={{ flex: 1 }}>
      <div className="module-header-row">
        <h2 className="module-title">Sales Payment Follow-up</h2>
        <div className="module-actions" style={{ width: isCompact ? '100%' : 'auto' }}>
          <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', width: isCompact ? '100%' : 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', borderRadius: '30px' }}>
            <button
              className={`filter-pill ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => { setActiveTab('all'); setAgingFilter(''); }}
              style={{ color: activeTab === 'all' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            >
              All
            </button>
            <button
              className={`filter-pill ${activeTab === 'reminders' ? 'active' : ''}`}
              onClick={() => { setActiveTab('reminders'); setAgingFilter(''); }}
              style={{ color: activeTab === 'reminders' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            >
              Reminders
            </button>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className={`filter-pill ${activeTab === 'overdue' ? 'active' : ''}`}
                onClick={() => setShowAgingDropdown(!showAgingDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: activeTab === 'overdue' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                {agingFilter ? agingFilter : 'Overdue Aging'} 
                <span style={{ fontSize: 10 }}>▼</span>
              </button>
              
              {showAgingDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: '8px 0', minWidth: 200, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 100 }}>
                  {['20-30 Days Overdue', '30-45 Days Overdue', '45-60 Days Overdue', '60-90 Days Overdue', '90+ Days Overdue'].map(opt => (
                    <div key={opt}
                         style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer', background: agingFilter === opt ? '#F5FAFE' : 'transparent', color: agingFilter === opt ? 'var(--color-primary)' : 'var(--color-text-primary)', whiteSpace: 'nowrap' }}
                         onClick={() => {
                           setAgingFilter(opt);
                           setActiveTab('overdue');
                           setShowAgingDropdown(false);
                         }}
                         onMouseEnter={(e) => e.currentTarget.style.background = '#F5FAFE'}
                         onMouseLeave={(e) => e.currentTarget.style.background = agingFilter === opt ? '#F5FAFE' : 'transparent'}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(activeTab === 'all' || activeTab === 'overdue') && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
              {[
                { id: 'pending', label: 'Pending Payment' },
                { id: 'confirmed', label: 'Confirmed (Verification Pending)' }
              ].map(f => (
                <button
                  key={f.id}
                  className={`filter-pill ${pendingFilter === f.id ? 'active' : ''}`}
                  onClick={() => setPendingFilter(f.id)}
                  style={{ color: pendingFilter === f.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button className="btn-small btn-outline-small" onClick={refreshPending}>Refresh</button>
          </div>

          {loadingPending ? (
            <div style={{ padding: 20, color: 'var(--color-text-secondary)' }}>Loading…</div>
          ) : isCompact ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {pendingRows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-muted)' }}>No pending collections.</div>
              ) : (
                pendingRows.map(o => {
                  const total = Number(o.grand_total || 0);
                  const paid = Number(o.verified_paid_amount || 0);
                  const bal = o.balance_amount !== undefined ? Number(o.balance_amount || 0) : Math.max(0, total - paid);
                  const paymentKey = String(o.payment_status || '').toUpperCase();
                  const nextFU = (() => {
                    const rows = remindersWithComputed.filter(r => String(r.order_id) === String(o.id) && r.status !== 'Completed');
                    const next = rows.sort((a, b) => String(a.reminder_date || '9999-12-31').localeCompare(String(b.reminder_date || '9999-12-31')))[0];
                    return next?.reminder_date || '-';
                  })();
                  const lastRemark = (() => {
                    const rows = remindersWithComputed.filter(r => String(r.order_id) === String(o.id));
                    const last = rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                    return last?.followup_note ? `"${String(last.followup_note).slice(0, 80)}${String(last.followup_note).length > 80 ? '…' : ''}"` : '-';
                  })();
                  return (
                    <div key={o.id} style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 12, background: 'var(--color-bg-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                        <strong style={{ fontFamily: 'monospace' }}>{o.order_number}</strong>
                        <span style={{ color: '#ef4444', fontWeight: 900 }}>{formatINR(bal)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{o.customer_name}</div>
                      <div style={{ marginTop: 6, fontSize: 12 }}>
                        <span>Total: {formatINR(total)} | </span>
                        <span style={{ color: '#10b981' }}>Paid: {formatINR(paid)}</span>
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12 }}>Next: {nextFU}</div>
                      <div style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{lastRemark}</div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {paymentKey === 'AWAITING_FINANCE_VERIFICATION' ? (
                          <span style={{ fontWeight: 800, color: '#d97706' }}>⏳ Verification Pending</span>
                        ) : paymentKey === 'PAID' ? (
                          <button className="btn-small btn-outline-small" onClick={() => openViewPaymentHistory(o)}>View Payment</button>
                        ) : paymentKey === 'PARTIALLY_PAID' ? (
                          <>
                            <button className="btn-small btn-primary-small" onClick={() => openConfirmPayment(o)}>Confirm Remaining Payment</button>
                            <button className="btn-small btn-outline-small" onClick={() => openViewPaymentHistory(o)}>View History</button>
                          </>
                        ) : o.latest_pv_status === 'REJECTED' ? (
                          <>
                            <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700 }}>Rejected{o.latest_pv_notes ? ` (Reason: ${o.latest_pv_notes})` : ''}</span>
                            <button className="btn-small btn-primary-small" onClick={() => openConfirmPayment(o)}>Confirm Payment</button>
                          </>
                        ) : (
                          <>
                            <button className="btn-small btn-primary-small" onClick={() => openConfirmPayment(o)}>Confirm Payment</button>
                            <button className="btn-small btn-outline-small" onClick={() => openAddFollowup(o)}>Add Follow-up</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="crm-table-container">
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Invoice No</th>
                    <th>Customer</th>
                    <th>Salesperson</th>
                    <th>Delivery Date</th>
                    <th>Invoice Date</th>
                    <th>Payment Terms</th>
                    <th>Payment Due Date</th>
                    <th>Remaining Days</th>
                    <th style={{ textAlign: 'right' }}>Total Amount</th>
                    <th style={{ textAlign: 'right' }}>Paid Amount</th>
                    <th style={{ textAlign: 'right' }}>Pending Amount</th>
                    <th>Status</th>
                    <th>Reminder</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRows.length === 0 ? (
                    <tr><td colSpan="15" style={{ textAlign: 'center', padding: 28, color: 'var(--color-text-muted)' }}>No pending collections.</td></tr>
                  ) : (
                    pendingRows.map(o => {
                      const total = Number(o.grand_total || 0);
                      const paid = Number(o.verified_paid_amount || 0);
                      const bal = o.balance_amount !== undefined ? Number(o.balance_amount || 0) : Math.max(0, total - paid);
                      const paymentKey = String(o.payment_status || '').toUpperCase();
                      const paymentLabel = PAYMENT_LABELS[paymentKey] || 'Awaiting Payment';
                      const nextFU = (() => {
                        const rows = remindersWithComputed.filter(r => String(r.order_id) === String(o.id) && r.status !== 'Completed');
                        const next = rows.sort((a, b) => String(a.reminder_date || '9999-12-31').localeCompare(String(b.reminder_date || '9999-12-31')))[0];
                        return next?.reminder_date || '-';
                      })();
                      const lastRemark = (() => {
                        const rows = remindersWithComputed.filter(r => String(r.order_id) === String(o.id));
                        const last = rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                        return last?.followup_note ? `"${String(last.followup_note).slice(0, 60)}${String(last.followup_note).length > 60 ? '…' : ''}"` : '-';
                      })();
                      return (
                        <tr key={o.id}>
                          <td data-label="Order ID" style={{ fontFamily: 'monospace', fontWeight: 800 }}>{o.order_number}</td>
                          <td data-label="Invoice No" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{o.invoice_number}</td>
                          <td data-label="Customer" style={{ fontWeight: 700 }}>{o.customer_name}</td>
                          <td data-label="Salesperson">{o.salesperson}</td>
                          <td data-label="Delivery Date">{isoDate(o.delivered_at) || '—'}</td>
                          <td data-label="Invoice Date">{isoDate(o.invoice_date) || '—'}</td>
                          <td data-label="Payment Terms">{o.payment_terms}</td>
                          <td data-label="Payment Due Date">{isoDate(o.payment_due_date) || '—'}</td>
                          <td data-label="Remaining Days" style={{ fontWeight: 700, color: Number(o.remaining_days) < 0 ? '#dc2626' : '#334155' }}>{o.remaining_days === null ? '—' : o.remaining_days}</td>
                          <td data-label="Total Amount" style={{ textAlign: 'right', fontWeight: 800 }}>{formatINR(total)}</td>
                          <td data-label="Paid Amount" style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>{formatINR(paid)}</td>
                          <td data-label="Pending Amount" style={{ textAlign: 'right', fontWeight: 900, color: '#ef4444' }}>{formatINR(bal)}</td>
                          <td data-label="Status" style={{ fontWeight: 800 }}>{paymentLabel}</td>
                          <td data-label="Reminder" style={{ whiteSpace: 'nowrap' }}>{o.reminder_label}</td>
                          <td data-label="Action" style={{ textAlign: 'right' }}>
                            {paymentKey === 'AWAITING_FINANCE_VERIFICATION' ? (
                              <span style={{ fontWeight: 800, color: '#d97706', whiteSpace: 'nowrap' }}>⏳ Verification Pending</span>
                            ) : paymentKey === 'PAID' ? (
                              <button className="btn-small btn-outline-small" onClick={() => openViewPaymentHistory(o)}>View Payment</button>
                            ) : paymentKey === 'PARTIALLY_PAID' ? (
                              <div style={{ display: 'inline-flex', gap: 8 }}>
                                <button className="btn-small btn-primary-small" onClick={() => navigate.push('/sales/create-payment?orderId=' + encodeURIComponent(o.order_number || o.id))}>Log Payment</button>
                                <button className="btn-small btn-outline-small" onClick={() => openConfirmPayment(o)}>Quick Modal</button>
                                <button className="btn-small btn-outline-small" onClick={() => openViewPaymentHistory(o)}>History</button>
                              </div>
                            ) : o.latest_pv_status === 'REJECTED' ? (
                              <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.latest_pv_notes ? `Reason: ${o.latest_pv_notes}` : 'Rejected'}>
                                  ✗ Rejected{o.latest_pv_notes ? ` (${o.latest_pv_notes})` : ''}
                                </span>
                                <button className="btn-small btn-primary-small" onClick={() => navigate.push('/sales/create-payment?orderId=' + encodeURIComponent(o.order_number || o.id))}>Log Payment</button>
                              </div>
                            ) : (
                              <div style={{ display: 'inline-flex', gap: 8 }}>
                                <button className="btn-small btn-primary-small" style={{ background: '#2563eb', borderColor: '#2563eb', color: '#fff' }} onClick={() => navigate.push('/sales/create-payment?orderId=' + encodeURIComponent(o.order_number || o.id))}>Log Payment</button>
                                <button className="btn-small btn-outline-small" onClick={() => openConfirmPayment(o)}>Quick Record</button>
                                <button className="btn-small btn-outline-small" onClick={() => openAddFollowup(o)}>Add Follow-up</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reminders' && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
              {['All', 'Today', 'Tomorrow', 'This Week', 'Overdue', 'Upcoming'].map(f => (
                <button
                  key={f}
                  className={`filter-pill ${reminderFilter === f ? 'active' : ''}`}
                  onClick={() => setReminderFilter(f)}
                  style={{ color: reminderFilter === f ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="btn-small btn-outline-small" onClick={refreshFollowups}>Refresh</button>
          </div>

          {loadingFollowups ? (
            <div style={{ padding: 20, color: 'var(--color-text-secondary)' }}>Loading…</div>
          ) : isCompact ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {filteredReminders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-muted)' }}>No reminders found.</div>
              ) : (
                filteredReminders.map(r => (
                  <div key={r.id} style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 12, background: 'var(--color-bg-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong>{r.reminder_date || '-'}</strong>
                      <span>{r.computed_status}</span>
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{r.customer_name || '-'}</div>
                    <div style={{ marginTop: 2, fontFamily: 'monospace', fontSize: 12 }}>{r.order_number || '-'}</div>
                    <div style={{ marginTop: 6, color: '#ef4444', fontWeight: 900 }}>{formatINR(r.balance_amount || 0)}</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>{r.followup_note}</div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn-small btn-outline-small" onClick={() => callDoneReminder(r)}>Call Done</button>
                      <button className="btn-small btn-outline-small" onClick={() => updateReminder(r.id, { status: 'Completed' }, 'Marked completed')}>Mark Completed</button>
                      <button
                        className="btn-small btn-outline-small"
                        onClick={async () => {
                          const { value: newDate } = await Swal.fire({
                            title: 'Reschedule',
                            input: 'date',
                            inputValue: r.reminder_date || new Date().toISOString().split('T')[0],
                            showCancelButton: true
                          });
                          if (newDate) {
                            await updateReminder(
                              r.id,
                              { next_reminder_date: newDate, status: computeReminderStatus(newDate, 'Upcoming') },
                              'Reminder rescheduled'
                            );
                          }
                        }}
                      >
                        Reschedule
                      </button>
                      <button className="btn-small btn-outline-small" onClick={() => deleteReminder(r.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="crm-table-container">
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th>Reminder Date</th>
                    <th>Customer</th>
                    <th>Order</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                    <th>Conversation</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReminders.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 28, color: 'var(--color-text-muted)' }}>No reminders found.</td></tr>
                  ) : (
                    filteredReminders.map(r => (
                      <tr key={r.id}>
                        <td data-label="Reminder Date">{r.reminder_date || '-'}</td>
                        <td data-label="Customer" style={{ fontWeight: 700 }}>{r.customer_name || '-'}</td>
                        <td data-label="Order" style={{ fontFamily: 'monospace', fontWeight: 800 }}>{r.order_number || '-'}</td>
                        <td data-label="Balance" style={{ textAlign: 'right', fontWeight: 900, color: '#ef4444' }}>{formatINR(r.balance_amount || 0)}</td>
                        <td data-label="Conversation" style={{ color: 'var(--color-text-secondary)' }}>{r.followup_note}</td>
                        <td data-label="Status">{r.computed_status}</td>
                        <td data-label="Action" style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button className="btn-small btn-outline-small" onClick={() => callDoneReminder(r)}>Call Done</button>
                            <button className="btn-small btn-outline-small" onClick={() => updateReminder(r.id, { status: 'Completed' }, 'Marked completed')}>Mark Completed</button>
                            <button
                              className="btn-small btn-outline-small"
                              onClick={async () => {
                                const { value: newDate } = await Swal.fire({
                                  title: 'Reschedule',
                                  input: 'date',
                                  inputValue: r.reminder_date || new Date().toISOString().split('T')[0],
                                  showCancelButton: true
                                });
                                if (newDate) {
                                  await updateReminder(
                                    r.id,
                                    { next_reminder_date: newDate, status: computeReminderStatus(newDate, 'Upcoming') },
                                    'Reminder rescheduled'
                                  );
                                }
                              }}
                            >
                              Reschedule
                            </button>
                            <button className="btn-small btn-outline-small" onClick={() => deleteReminder(r.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div style={{ marginTop: 12 }}>
          {isCompact ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {completedOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-muted)' }}>No completed payments.</div>
              ) : (
                completedOrders.map(o => (
                  <div key={o.orderNo} style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 12, background: 'var(--color-bg-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong style={{ fontFamily: 'monospace' }}>{o.orderNo || o.order_number || o.id}</strong>
                      <strong style={{ color: '#10b981' }}>{formatINR(o.verifiedPaidAmount || o.verified_paid_amount || ((o.totalAmount || o.grandTotal || o.grand_total || 0) - (o.balanceAmount || o.balance_amount || 0)))}</strong>
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{o.customer?.name || o.customerName || o.customer_name || 'ABC Infrastructure Pvt Ltd'}</div>
                    <div style={{ marginTop: 6, fontSize: 13 }}>Total: {formatINR(o.totalAmount || o.grandTotal || o.grand_total || 0)}</div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="crm-table-container">
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'right' }}>Paid</th>
                    <th>Verified Date</th>
                    <th>Verified By</th>
                    <th>Receipt</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: 28, color: 'var(--color-text-muted)' }}>No completed payments.</td></tr>
                  ) : (
                    completedOrders.map(o => (
                      <tr key={o.orderNo || o.order_number || o.id}>
                        <td data-label="Order" style={{ fontFamily: 'monospace', fontWeight: 800 }}>{o.orderNo || o.order_number || o.id}</td>
                        <td data-label="Customer" style={{ fontWeight: 700 }}>{o.customer?.name || o.customerName || o.customer_name || 'ABC Infrastructure Pvt Ltd'}</td>
                        <td data-label="Total" style={{ textAlign: 'right', fontWeight: 800 }}>{formatINR(o.totalAmount || o.grandTotal || o.grand_total || 0)}</td>
                        <td data-label="Paid" style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>{formatINR(o.verifiedPaidAmount || o.verified_paid_amount || ((o.totalAmount || o.grandTotal || o.grand_total || 0) - (o.balanceAmount || o.balance_amount || 0)))}</td>
                        <td data-label="Verified Date">-</td>
                        <td data-label="Verified By">-</td>
                        <td data-label="Receipt">-</td>
                        <td data-label="Remarks">-</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: 10 }}>
            <button className="btn-small btn-outline-small" onClick={() => navigate.push('/sales/orders')}>Back to Orders</button>
          </div>
        </div>
      )}
    </div>
  );
}

