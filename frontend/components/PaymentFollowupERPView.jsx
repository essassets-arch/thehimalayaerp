'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Swal from 'sweetalert2';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '../lib/apiClient';
import { useERPStore } from '../store/erpStore';
import { backendFetch } from '../lib/backendFetch';
import { remindersService } from '../modules/sales/services/reminders.service.js';

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
  const searchParams = useSearchParams();
  const canonicalState = useERPStore(store => store.state);
  const canonicalOrders = canonicalState?.sales?.orders || [];
  const canonicalQuotations = canonicalState?.sales?.quotations || [];
  const storeConfirmations = canonicalState?.sales?.paymentConfirmations || [];
  const consignments = canonicalState?.dispatch?.consignments || [];
  const isCompact = useMediaQuery('(max-width: 1024px)');
  const [activeTab, setActiveTab] = useState('all'); // all | reminders | overdue | completed
  const [agingFilter, setAgingFilter] = useState('');
  const [showAgingDropdown, setShowAgingDropdown] = useState(false);
  const [pendingFilter, setPendingFilter] = useState('pending'); // pending | confirmed
  const [pendingCollection, setPendingCollection] = useState([]);
  const [deliveredDispatches, setDeliveredDispatches] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingFollowups, setLoadingFollowups] = useState(true);
  const [reminderFilter, setReminderFilter] = useState('All');

  const [localConfirmations, setLocalConfirmations] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('himalaya_sales_payment_confirmations');
      if (raw) {
        setLocalConfirmations(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const paymentConfirmations = useMemo(() => {
    return [...localConfirmations, ...storeConfirmations];
  }, [localConfirmations, storeConfirmations]);

  const refreshPending = async () => {
    setLoadingPending(true);
    try {
      const [resPending, resDispatches] = await Promise.allSettled([
        apiClient.get('/sales/orders/delivered/pending-payment'),
        backendFetch('/api/backend/logistics/dispatches?status=DELIVERED'),
      ]);
      const pendingData = resPending.status === 'fulfilled' && resPending.value?.success
        ? resPending.value.data
        : Array.isArray(resPending.value) ? resPending.value : [];
      const dispData = resDispatches.status === 'fulfilled'
        ? (Array.isArray(resDispatches.value) ? resDispatches.value : Array.isArray(resDispatches.value?.data) ? resDispatches.value.data : [])
        : [];
      setPendingCollection(pendingData);
      setDeliveredDispatches(dispData);
    } catch (err) {
      console.error(err);
      setPendingCollection([]);
      setDeliveredDispatches([]);
    } finally {
      setLoadingPending(false);
    }
  };

  const refreshFollowups = async () => {
    setLoadingFollowups(true);
    try {
      const res = await remindersService.list({ moduleType: 'Payment' });
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
    if (searchParams) {
      const tabParam = searchParams.get('tab');
      const filterParam = searchParams.get('filter');
      if (tabParam === 'reminders') setActiveTab('reminders');
      if (tabParam === 'completed') setActiveTab('completed');
      if (tabParam === 'confirmed' || filterParam === 'confirmed') setPendingFilter('confirmed');
      if (tabParam === 'overdue') {
        setActiveTab('overdue');
        const agingParam = searchParams.get('aging');
        if (agingParam) setAgingFilter(agingParam);
      }
    }
  }, [searchParams]);

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
      const orderNo = order.order_number || order.orderNo || order.id;
      const custName = order.customer_name || order.customerName || 'Customer';
      const balAmt = Number(order.balance_amount ?? (Number(order.grand_total || 0) - Number(order.verified_paid_amount || 0)));

      await remindersService.create({
        moduleType: 'Payment',
        moduleId: String(order.id),
        sourceType: 'Payment',
        sourceId: String(order.id),
        customerName: custName,
        title: `Payment Follow-up: ${orderNo}`,
        description: formValues.note,
        reminderDate: formValues.nextDate,
        reminderTime: '10:00',
        reminderType: 'Payment Follow-up',
        priority: 'High',
        amount: balAmt,
        remarks: formValues.note
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

  const remindersWithComputed = useMemo(() => {
    return (followups || []).map(f => {
      const next_reminder_date = f.next_reminder_date || f.reminderDate || null;
      const status = f.status || 'Pending';
      const order_id = f.order_id || f.moduleId || '';
      const notes = f.followup_note || f.remarks || f.description || '';

      return {
        ...f,
        id: f.id,
        order_id,
        followup_note: notes,
        next_reminder_date,
        status,
        reminder_date: next_reminder_date ? isoDate(next_reminder_date) : null,
        computed_status: computeReminderStatus(isoDate(next_reminder_date), status),
      };
    });
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
      const mappedUpdates = {
        remarks: updates.followup_note,
        description: updates.followup_note,
        reminderDate: updates.next_reminder_date || updates.reminderDate,
        status: updates.status
      };
      Object.keys(mappedUpdates).forEach(key => mappedUpdates[key] === undefined && delete mappedUpdates[key]);

      await remindersService.update(followupId, mappedUpdates);
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
      await remindersService.cancel(followupId);
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
    try {
      await remindersService.complete(r.id);
      await Promise.all([refreshFollowups(), refreshPending()]);
      Swal.fire({ icon: 'success', title: 'Call completed', timer: 1100, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: err?.message || 'Could not complete reminder.' });
    }
  };

  const dispatchDeliveryMap = useMemo(() => {
    const map = new Map();
    (deliveredDispatches || []).forEach((d) => {
      const dDate = d.deliveredAt || d.dispatchedAt || d.createdAt;
      if (dDate) {
        if (d.salesOrderId) map.set(String(d.salesOrderId).toLowerCase(), dDate);
        if (d.salesOrder?.id) map.set(String(d.salesOrder.id).toLowerCase(), dDate);
        if (d.salesOrder?.orderNumber) {
          const rawNo = String(d.salesOrder.orderNumber).trim().toLowerCase();
          map.set(rawNo, dDate);
          map.set(rawNo.replace(/[^a-z0-9]/g, ''), dDate);
        }
        if (d.dispatchNo) {
          const rawNo = String(d.dispatchNo).trim().toLowerCase();
          map.set(rawNo, dDate);
          map.set(rawNo.replace(/[^a-z0-9]/g, ''), dDate);
        }
      }
    });
    return map;
  }, [deliveredDispatches]);

  const pendingRows = useMemo(() => {
    const apiRows = pendingCollection || [];
    const syntheticCandidates = localConfirmations.map((c) => ({
      id: c.orderId || c.orderNo,
      order_number: c.orderNo || c.orderNumber || c.orderId,
      orderNo: c.orderNo || c.orderNumber || c.orderId,
      customer_name: c.customerName,
      customerName: c.customerName,
      grand_total: Number(c.amount || 0),
      totalAmount: Number(c.amount || 0),
      verified_paid_amount: 0,
      balance_amount: Number(c.amount || 0),
      payment_status: 'AWAITING_FINANCE_VERIFICATION',
      orderStatus: 'DELIVERED',
      deliveredAt: c.createdAt || new Date().toISOString()
    }));
    // API/legacy records are fallbacks; canonical Zustand orders must win deduplication.
    const allCandidates = [...syntheticCandidates, ...apiRows, ...(orders || []), ...canonicalOrders];
    
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

      const matchesRef = (ref1, ref2) => {
        if (!ref1 || !ref2) return false;
        const c1 = String(ref1).replace(/^#/, '').trim().toLowerCase();
        const c2 = String(ref2).replace(/^#/, '').trim().toLowerCase();
        return c1 === c2 || c1.includes(c2) || c2.includes(c1);
      };

      const orderNo = o.order_number || o.orderNo || o.id;
      if (!orderNo) return;
      const quotation = canonicalQuotations.find(q =>
        String(q.id) === String(o.quotationId || o.quotation_id)
      );
      const consignment = consignments.find(c =>
        matchesRef(c.orderId, o.id) ||
        matchesRef(c.orderId, orderNo)
      );
      const confirmations = paymentConfirmations.filter(p =>
        matchesRef(p.orderId, o.id) ||
        matchesRef(p.orderId, orderNo) ||
        matchesRef(p.orderNo, orderNo) ||
        matchesRef(p.orderNumber, orderNo)
      );
      const verifiedFromConfirmations = confirmations
        .filter(p => ['FINANCE_VERIFIED', 'VERIFIED'].includes(String(p.status || '').toUpperCase()))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const hasPendingConfirmation = confirmations.some(p =>
        ['FINANCE_VERIFICATION_PENDING', 'PENDING', 'SUBMITTED_FOR_VERIFICATION', 'AWAITING_FINANCE_VERIFICATION'].includes(
          String(p.status || p.paymentStatus || '').toUpperCase()
        )
      ) || ['AWAITING_FINANCE_VERIFICATION', 'SUBMITTED_FOR_VERIFICATION'].includes(String(o.paymentStatus || o.payment_status || '').toUpperCase());

      const resolvedTotal = Number(consignment?.payableAmount ?? total) || total;
      const resolvedPaid = Math.max(paid, verifiedFromConfirmations);
      const resolvedBalance = Math.max(0, resolvedTotal - resolvedPaid);

      const cleanOrderKey = String(orderNo).trim().toLowerCase();
      const cleanOrderNoNorm = cleanOrderKey.replace(/[^a-z0-9]/g, '');
      const dispDeliveredDate =
        dispatchDeliveryMap.get(cleanOrderKey) ||
        dispatchDeliveryMap.get(cleanOrderNoNorm) ||
        (o.id ? dispatchDeliveryMap.get(String(o.id).toLowerCase()) : null);

      const deliveredAt =
        consignment?.deliveredAt ||
        o.delivered_at ||
        o.deliveredAt ||
        o.actualDeliveryDate ||
        o.deliveredDate ||
        o.deliveryDate ||
        o.paymentTermStartDate ||
        dispDeliveredDate ||
        o.dispatches?.find((d) => d.deliveredAt)?.deliveredAt ||
        o.dispatches?.[0]?.deliveredAt;

      const invoiceDate = o.invoiceDate || o.invoice_date || deliveredAt || o.createdAt || o.created_at;
      const rawPaymentTerms = o.paymentTerms || o.payment_terms || quotation?.paymentTerms || quotation?.payment_terms || '';
      const isAdvancePayment = String(rawPaymentTerms).toLowerCase().includes('advance') || String(o.payment_terms || '').toLowerCase().includes('advance');
      const paymentTermDays = isAdvancePayment ? 0 : (Number(
        o.paymentTermDays ?? o.payment_terms_days ?? quotation?.paymentTermDays ?? (String(rawPaymentTerms).match(/\d+/)?.[0] || 15)
      ) || 15);
      const displayPaymentTerms = isAdvancePayment ? 'Advance' : (rawPaymentTerms || `${paymentTermDays} Days`);

      const dueDateValue = isAdvancePayment
        ? (invoiceDate || deliveredAt || null)
        : (o.paymentDueDate || o.payment_due_date || (() => {
            if (!invoiceDate) return null;
            const date = new Date(invoiceDate);
            date.setDate(date.getDate() + paymentTermDays);
            return date.toISOString();
          })());

      const remainingDays = isAdvancePayment
        ? 0
        : (dueDateValue
            ? Math.ceil((new Date(dueDateValue).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
            : null);

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
        payment_terms: displayPaymentTerms,
        payment_due_date: dueDateValue,
        remaining_days: remainingDays,
        reminder_label: isAdvancePayment
          ? 'Advance (Due on Delivery)'
          : (remainingDays === null
            ? 'Not scheduled'
            : (remainingDays < 0 ? `Overdue by ${Math.abs(remainingDays)} Days` : (remainingDays === 0 ? 'Due Today' : `Due in ${remainingDays} Days`))),
        latest_pv_status: o.latest_pv_status || o.latestPvStatus,
        latest_pv_notes: o.latest_pv_notes || o.latestPvNotes
      };

      const key = String(orderNo).toLowerCase();
      const existing = map.get(key);
      if (existing && existing.payment_status === 'AWAITING_FINANCE_VERIFICATION' && resolvedPaymentStatus !== 'AWAITING_FINANCE_VERIFICATION') {
        return;
      }
      if (!normalized.delivered_at && existing?.delivered_at) {
        normalized.delivered_at = existing.delivered_at;
      }
      map.set(key, normalized);
    });

    const rows = Array.from(map.values());

    if (activeTab === 'overdue' && agingFilter) {
      return rows.filter(o => {
        const rem = o.remaining_days;
        if (rem === null || rem >= 0) return false;
        const overdueDays = Math.abs(rem);
        if (agingFilter === '20-30 Days Overdue') return overdueDays >= 20 && overdueDays <= 30;
        if (agingFilter === '30-45 Days Overdue') return overdueDays > 30 && overdueDays <= 45;
        if (agingFilter === '45-60 Days Overdue') return overdueDays > 45 && overdueDays <= 60;
        if (agingFilter === '60-90 Days Overdue') return overdueDays > 60 && overdueDays <= 90;
        if (agingFilter === '90+ Days Overdue') return overdueDays > 90;
        return true;
      });
    }

    if (pendingFilter === 'confirmed') {
      return rows.filter(o => String(o.payment_status || '').toUpperCase() === 'AWAITING_FINANCE_VERIFICATION' || String(o.payment_status || '').toLowerCase() === 'submitted_for_verification');
    }
    return rows.filter(o => String(o.payment_status || '').toUpperCase() !== 'AWAITING_FINANCE_VERIFICATION' && String(o.payment_status || '').toLowerCase() !== 'submitted_for_verification');
  }, [
    pendingCollection,
    localConfirmations,
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
    <div className="app-card payment-followup-container" style={{ flex: 1 }}>
      {/* Top Header Row */}
      <div className="module-header-row payment-followup-header">
        <h2 className="module-title">Sales Payment Follow-up</h2>
        <div className="module-actions payment-header-actions">
          <div className="payment-top-tabs-capsule">
            <button
              type="button"
              className={`filter-pill ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => { setActiveTab('all'); setAgingFilter(''); }}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-pill ${activeTab === 'reminders' ? 'active' : ''}`}
              onClick={() => { setActiveTab('reminders'); setAgingFilter(''); }}
            >
              Reminders
            </button>
            <button
              type="button"
              className={`filter-pill ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => { setActiveTab('completed'); setAgingFilter(''); }}
            >
              Completed
            </button>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                className={`filter-pill ${activeTab === 'overdue' ? 'active' : ''}`}
                onClick={() => setShowAgingDropdown(!showAgingDropdown)}
              >
                {agingFilter ? agingFilter : 'Overdue Aging'} 
                <span style={{ fontSize: 10, marginLeft: 4 }}>▼</span>
              </button>
              
              {showAgingDropdown && (
                <div className="aging-dropdown-menu">
                  {['20-30 Days Overdue', '30-45 Days Overdue', '45-60 Days Overdue', '60-90 Days Overdue', '90+ Days Overdue'].map(opt => (
                    <div
                      key={opt}
                      className={`aging-dropdown-item ${agingFilter === opt ? 'active' : ''}`}
                      onClick={() => {
                        setAgingFilter(opt);
                        setActiveTab('overdue');
                        setShowAgingDropdown(false);
                      }}
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
        <div style={{ marginTop: 4 }}>
          {/* Sub Controls: Pending vs Confirmed & Refresh */}
          <div className="payment-controls-row">
            <div className="tab-filters-row payment-sub-pills">
              {[
                { id: 'pending', label: 'Pending Payment' },
                { id: 'confirmed', label: 'Confirmed (Verification Pending)' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`filter-pill ${pendingFilter === f.id ? 'active' : ''}`}
                  onClick={() => setPendingFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button className="btn-small btn-outline-small payment-refresh-btn" onClick={refreshPending}>
              Refresh
            </button>
          </div>

          {loadingPending ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading pending collections…</div>
          ) : isCompact ? (
            <div className="payment-mobile-cards-grid">
              {pendingRows.length === 0 ? (
                <div className="empty-state-card">
                  <div className="empty-state-title">No pending collections</div>
                  <div className="empty-state-subtitle">All customer collections in this view are up to date.</div>
                </div>
              ) : (
                pendingRows.map(o => {
                  const total = Number(o.grand_total || 0);
                  const paid = Number(o.verified_paid_amount || 0);
                  const bal = o.balance_amount !== undefined ? Number(o.balance_amount || 0) : Math.max(0, total - paid);
                  const paymentKey = String(o.payment_status || '').toUpperCase();
                  const isAdv = String(o.payment_terms || '').toLowerCase().includes('advance');
                  const remDays = o.remaining_days;

                  const nextFU = (() => {
                    const rows = remindersWithComputed.filter(r => String(r.order_id) === String(o.id) && r.status !== 'Completed');
                    const next = rows.sort((a, b) => String(a.reminder_date || '9999-12-31').localeCompare(String(a.reminder_date || '9999-12-31')))[0];
                    return next?.reminder_date || '-';
                  })();
                  const lastRemark = (() => {
                    const rows = remindersWithComputed.filter(r => String(r.order_id) === String(o.id));
                    const last = rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                    return last?.followup_note ? `"${String(last.followup_note).slice(0, 80)}${String(last.followup_note).length > 80 ? '…' : ''}"` : '-';
                  })();

                  return (
                    <div key={o.id} className="payment-mobile-card">
                      {/* Top Header */}
                      <div className="pmc-header">
                        <div className="pmc-order-tag">
                          <strong>{o.order_number}</strong>
                          {o.invoice_number && o.invoice_number !== '-' && (
                            <span className="pmc-invoice-badge">Inv: {o.invoice_number}</span>
                          )}
                        </div>
                        <div className="pmc-balance-badge">
                          <span className="pmc-balance-lbl">Pending</span>
                          <strong style={{ color: bal > 0 ? '#ef4444' : '#10b981', fontSize: '15px', fontWeight: 900 }}>
                            {formatINR(bal)}
                          </strong>
                        </div>
                      </div>

                      {/* Customer Name */}
                      <div className="pmc-customer-name">{o.customer_name}</div>

                      {/* Financial Metrics Grid */}
                      <div className="pmc-metrics-grid">
                        <div className="pmc-metric-item">
                          <span>Total Amount:</span>
                          <strong>{formatINR(total)}</strong>
                        </div>
                        <div className="pmc-metric-item">
                          <span>Paid Amount:</span>
                          <strong style={{ color: '#16a34a' }}>{formatINR(paid)}</strong>
                        </div>
                        <div className="pmc-metric-item">
                          <span>Delivery Date:</span>
                          <strong>{isoDate(o.delivered_at) || '—'}</strong>
                        </div>
                        <div className="pmc-metric-item">
                          <span>Terms:</span>
                          <strong style={{ color: isAdv ? '#0284c7' : '#2563eb' }}>{o.payment_terms || '15 Days'}</strong>
                        </div>
                      </div>

                      {/* Status / Due Row */}
                      <div className="pmc-status-row">
                        <div className="pmc-due-date">
                          <span>Due: </span>
                          <strong>{isoDate(o.payment_due_date) || '—'}</strong>
                        </div>
                        <div>
                          {isAdv ? (
                            <span className="due-chip chip-advance">⚡ Advance</span>
                          ) : remDays === null ? (
                            <span className="due-chip chip-neutral">—</span>
                          ) : remDays > 0 ? (
                            <span className={`due-chip ${remDays <= 3 ? 'chip-warning' : 'chip-success'}`}>
                              🟢 {remDays} {remDays === 1 ? 'Day' : 'Days'}
                            </span>
                          ) : remDays === 0 ? (
                            <span className="due-chip chip-warning">🟡 Due Today</span>
                          ) : (
                            <span className="due-chip chip-danger">🔴 Overdue {Math.abs(remDays)}d</span>
                          )}
                        </div>
                      </div>

                      {/* Follow-up Note Preview */}
                      {(nextFU !== '-' || lastRemark !== '-') && (
                        <div className="pmc-followup-preview">
                          {nextFU !== '-' && (
                            <div className="pmc-next-fu">
                              <span>Next Follow-up: </span>
                              <strong>{nextFU}</strong>
                            </div>
                          )}
                          {lastRemark !== '-' && <div className="pmc-last-remark">{lastRemark}</div>}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pmc-actions-row">
                        {paymentKey === 'AWAITING_FINANCE_VERIFICATION' ? (
                          <span className="verification-pending-badge">⏳ Verification Pending</span>
                        ) : paymentKey === 'PAID' ? (
                          <button className="btn-small btn-outline-small" style={{ width: '100%' }} onClick={() => openViewPaymentHistory(o)}>View Payment</button>
                        ) : paymentKey === 'PARTIALLY_PAID' ? (
                          <>
                            <button className="btn-small btn-primary-small" style={{ flex: '1 1 auto' }} onClick={() => navigate.push('/sales/create-payment?orderId=' + encodeURIComponent(o.order_number || o.id))}>Log Payment</button>
                            <button className="btn-small btn-outline-small" style={{ flex: '1 1 auto' }} onClick={() => openAddFollowup(o)}>Add Follow-up</button>
                            <button className="btn-small btn-outline-small" onClick={() => openViewPaymentHistory(o)}>History</button>
                          </>
                        ) : o.latest_pv_status === 'REJECTED' ? (
                          <>
                            <span className="rejected-badge">Rejected{o.latest_pv_notes ? ` (${o.latest_pv_notes})` : ''}</span>
                            <button className="btn-small btn-primary-small" style={{ flex: '1 1 auto' }} onClick={() => navigate.push('/sales/create-payment?orderId=' + encodeURIComponent(o.order_number || o.id))}>Log Payment</button>
                          </>
                        ) : (
                          <>
                            <button className="btn-small btn-primary-small" style={{ flex: '1 1 auto', background: '#2563eb', borderColor: '#2563eb', color: '#fff' }} onClick={() => navigate.push('/sales/create-payment?orderId=' + encodeURIComponent(o.order_number || o.id))}>Log Payment</button>
                            <button className="btn-small btn-outline-small" style={{ flex: '1 1 auto' }} onClick={() => openAddFollowup(o)}>Add Follow-up</button>
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
                    <th>Delivery Date</th>
                    <th>Payment Terms</th>
                    <th>Due Date</th>
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
                    <tr><td colSpan="13" style={{ textAlign: 'center', padding: 28, color: 'var(--color-text-muted)' }}>No pending collections.</td></tr>
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

                      const isAdv = String(o.payment_terms || '').toLowerCase().includes('advance');
                      const remDays = o.remaining_days;

                      return (
                        <tr key={o.id}>
                          <td data-label="Order ID" style={{ fontFamily: 'monospace', fontWeight: 800 }}>{o.order_number}</td>
                          <td data-label="Invoice No" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{o.invoice_number}</td>
                          <td data-label="Customer" style={{ fontWeight: 700 }}>{o.customer_name}</td>
                          <td data-label="Delivery Date">{isoDate(o.delivered_at) || '—'}</td>
                          <td data-label="Payment Terms">
                            <span style={{
                              fontWeight: 700,
                              color: isAdv ? '#0284c7' : '#2563eb',
                              background: isAdv ? '#e0f2fe' : '#eff6ff',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                            }}>
                              {o.payment_terms || '15 Days'}
                            </span>
                          </td>
                          <td data-label="Due Date" style={{ fontSize: '12px', fontWeight: 600 }}>{isoDate(o.payment_due_date) || '—'}</td>
                          <td data-label="Remaining Days">
                            {isAdv ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                                ⚡ Advance
                              </span>
                            ) : remDays === null ? (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            ) : remDays > 0 ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: remDays <= 3 ? '#FEF3C7' : '#DCFCE7', color: remDays <= 3 ? '#D97706' : '#16A34A', border: `1px solid ${remDays <= 3 ? '#FDE68A' : '#BBF7D0'}` }}>
                                🟢 {remDays} {remDays === 1 ? 'Day' : 'Days'}
                              </span>
                            ) : remDays === 0 ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
                                🟡 Due Today
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                                🔴 Overdue {Math.abs(remDays)}d
                              </span>
                            )}
                          </td>
                          <td data-label="Total Amount" style={{ textAlign: 'right', fontWeight: 800 }}>{formatINR(total)}</td>
                          <td data-label="Paid Amount" style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{formatINR(paid)}</td>
                          <td data-label="Pending Amount" style={{ textAlign: 'right', fontWeight: 900, color: bal > 0 ? '#dc2626' : '#16a34a' }}>{formatINR(bal)}</td>
                          <td data-label="Status" style={{ fontWeight: 800 }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: paymentKey === 'PAID' ? '#dcfce7' : (paymentKey === 'PARTIALLY_PAID' ? '#dbeafe' : '#fef3c7'),
                              color: paymentKey === 'PAID' ? '#166534' : (paymentKey === 'PARTIALLY_PAID' ? '#1e40af' : '#92400e'),
                            }}>
                              {paymentLabel}
                            </span>
                          </td>
                          <td data-label="Reminder" style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#475569' }}>{o.reminder_label}</td>
                          <td data-label="Action" style={{ textAlign: 'right' }}>
                            {paymentKey === 'AWAITING_FINANCE_VERIFICATION' ? (
                              <span style={{ fontWeight: 800, color: '#d97706', whiteSpace: 'nowrap' }}>⏳ Verification Pending</span>
                            ) : paymentKey === 'PAID' ? (
                              <button className="btn-small btn-outline-small" onClick={() => openViewPaymentHistory(o)}>View Payment</button>
                            ) : paymentKey === 'PARTIALLY_PAID' ? (
                              <div style={{ display: 'inline-flex', gap: 8 }}>
                                <button className="btn-small btn-primary-small" onClick={() => navigate.push('/sales/create-payment?orderId=' + encodeURIComponent(o.order_number || o.id))}>Log Payment</button>
                                <button className="btn-small btn-outline-small" onClick={() => openAddFollowup(o)}>Add Follow-up</button>
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
        <div style={{ marginTop: 4 }}>
          {/* Reminder Filters & Refresh */}
          <div className="payment-controls-row">
            <div className="tab-filters-row payment-sub-pills">
              {['All', 'Today', 'Tomorrow', 'This Week', 'Overdue', 'Upcoming'].map(f => (
                <button
                  key={f}
                  type="button"
                  className={`filter-pill ${reminderFilter === f ? 'active' : ''}`}
                  onClick={() => setReminderFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="btn-small btn-outline-small payment-refresh-btn" onClick={refreshFollowups}>
              Refresh
            </button>
          </div>

          {loadingFollowups ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading reminders…</div>
          ) : isCompact ? (
            <div className="payment-mobile-cards-grid">
              {filteredReminders.length === 0 ? (
                <div className="empty-state-card">
                  <div className="empty-state-title">No reminders found</div>
                  <div className="empty-state-subtitle">There are no scheduled follow-up reminders in this filter.</div>
                </div>
              ) : (
                filteredReminders.map(r => (
                  <div key={r.id} className="payment-mobile-card">
                    <div className="pmc-header">
                      <div className="pmc-order-tag">
                        <strong>{r.reminder_date || '-'}</strong>
                        <span className={`due-chip ${r.computed_status === 'Overdue' ? 'chip-danger' : (r.computed_status === 'Today' ? 'chip-warning' : 'chip-success')}`}>
                          {r.computed_status}
                        </span>
                      </div>
                      <div className="pmc-balance-badge">
                        <span className="pmc-balance-lbl">Balance</span>
                        <strong style={{ color: '#ef4444', fontSize: '15px', fontWeight: 900 }}>
                          {formatINR(r.balance_amount || 0)}
                        </strong>
                      </div>
                    </div>

                    <div className="pmc-customer-name">{r.customer_name || '-'}</div>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#64748b' }}>Order: {r.order_number || '-'}</div>
                    
                    {r.followup_note && (
                      <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
                        {r.followup_note}
                      </div>
                    )}

                    <div className="pmc-actions-row">
                      <button className="btn-small btn-outline-small" style={{ flex: '1 1 auto' }} onClick={() => callDoneReminder(r)}>Call Done</button>
                      <button className="btn-small btn-outline-small" style={{ flex: '1 1 auto' }} onClick={() => updateReminder(r.id, { status: 'Completed' }, 'Marked completed')}>Mark Completed</button>
                      <button
                        className="btn-small btn-outline-small"
                        style={{ flex: '1 1 auto' }}
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
                      <button className="btn-small btn-outline-small" style={{ color: '#dc2626' }} onClick={() => deleteReminder(r.id)}>Delete</button>
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
        <div style={{ marginTop: 4 }}>
          {isCompact ? (
            <div className="payment-mobile-cards-grid">
              {completedOrders.length === 0 ? (
                <div className="empty-state-card">
                  <div className="empty-state-title">No completed payments</div>
                  <div className="empty-state-subtitle">No orders with fully verified payments found.</div>
                </div>
              ) : (
                completedOrders.map(o => (
                  <div key={o.orderNo || o.order_number || o.id} className="payment-mobile-card">
                    <div className="pmc-header">
                      <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{o.orderNo || o.order_number || o.id}</strong>
                      <span className="due-chip chip-success">Paid in Full</span>
                    </div>
                    <div className="pmc-customer-name">{o.customer?.name || o.customerName || o.customer_name || 'Customer'}</div>
                    <div className="pmc-metrics-grid">
                      <div className="pmc-metric-item">
                        <span>Total:</span>
                        <strong>{formatINR(o.totalAmount || o.grandTotal || o.grand_total || 0)}</strong>
                      </div>
                      <div className="pmc-metric-item">
                        <span>Verified Paid:</span>
                        <strong style={{ color: '#10b981' }}>{formatINR(o.verifiedPaidAmount || o.verified_paid_amount || ((o.totalAmount || o.grandTotal || o.grand_total || 0) - (o.balanceAmount || o.balance_amount || 0)))}</strong>
                      </div>
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
          <div style={{ marginTop: 14 }}>
            <button className="btn-small btn-outline-small" onClick={() => navigate.push('/sales/orders')}>Back to Orders</button>
          </div>
        </div>
      )}
    </div>
  );
}
