'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  Search,
  RefreshCw,
  SlidersHorizontal,
  X,
  CreditCard,
  Calendar,
  Phone,
  Download,
  Eye,
  ArrowUpRight,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  User,
  Building2,
  DollarSign,
  ChevronRight,
  RotateCcw,
  ArrowUpDown,
  Filter,
  Check
} from 'lucide-react';
import { useERPStore } from '../../../store/erpStore';
import { useAuthStore } from '../../../store/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { backendFetch } from '../../../lib/backendFetch';
import PaginationControl from '../../../shared/components/PaginationControl';

const formatINR = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export default function OutstandingView({ readOnly = false }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const state = useERPStore((s) => s.state);
  const financeActions = useERPStore((s) => s.finance);
  const user = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [activePreset, setActivePreset] = useState('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minOutstanding, setMinOutstanding] = useState('');
  const [maxOutstanding, setMaxOutstanding] = useState('');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [collectionStatus, setCollectionStatus] = useState('All');
  const [reminderStatus, setReminderStatus] = useState('All');
  const [salesmanFilter, setSalesmanFilter] = useState('All Salesmen');
  const [sortBy, setSortBy] = useState('Outstanding: High to Low');

  // Follow-up modal state
  const [followUpModal, setFollowUpModal] = useState(null);

  // 1. Fetch delivered orders & active sales orders with balances
  const {
    data: backendOrders = [],
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
    isFetching: ordersFetching,
  } = useQuery({
    queryKey: ['finance-outstanding-delivered-orders'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/finance/payments/delivered-orders');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });

  // 2. Fetch payments
  const {
    data: backendPayments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
    isFetching: paymentsFetching,
  } = useQuery({
    queryKey: ['finance-outstanding-payments'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/finance/payments');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });

  // 3. Fetch sales orders list for broader matching
  const {
    data: rawSalesOrders = [],
    refetch: refetchSalesOrders,
  } = useQuery({
    queryKey: ['finance-outstanding-sales-orders'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/sales/orders');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });

  const localOrders = state.sales?.orders || [];
  const localCustomerPayments = state.finance?.customerPayments || [];
  const followUps = state.finance?.paymentFollowUps || [];

  // Merge orders safely
  const orders = useMemo(() => {
    const combined = [...backendOrders, ...rawSalesOrders, ...localOrders];
    return combined.filter((order, index, list) => {
      const id = String(order.id || order.orderId || order.orderNo || order.orderNumber || '');
      return id && list.findIndex((candidate) =>
        String(candidate.id || candidate.orderId || candidate.orderNo || candidate.orderNumber || '') === id
      ) === index;
    });
  }, [backendOrders, rawSalesOrders, localOrders]);

  // Compute live outstanding records
  const outstandingList = useMemo(() => {
    return orders.map((o) => {
      const totalAmount = Number(o.grandTotal ?? o.grand_total ?? o.totalAmount ?? o.total_amount ?? o.totalValue ?? 0);
      const targetOrderId = String(o.id || o.orderNo || o.orderNumber || '');

      // 1. Backend verified payments
      const backendPaidAmount = backendPayments
        .filter((payment) => {
          const matchId = String(payment.salesOrderId || payment.salesOrder?.id || payment.orderNumber || payment.orderId || '');
          const isVerified = ['VERIFIED', 'FINANCE_VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(String(payment.status || '').toUpperCase());
          return isVerified && (matchId === String(o.id) || matchId === String(o.orderNo || o.orderNumber));
        })
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      // 2. Local state verified payments
      const localPaidAmount = localCustomerPayments
        .filter((payment) =>
          (String(payment.orderId || payment.salesOrderId || '') === targetOrderId) &&
          payment.verificationStatus === 'FINANCE_VERIFIED'
        )
        .reduce((sum, payment) => sum + Number(payment.paymentAmount || 0), 0);

      // 3. LocalStorage confirmations verified payments
      let storagePaidAmount = 0;
      try {
        const raw = localStorage.getItem('himalaya_sales_payment_confirmations');
        if (raw) {
          const list = JSON.parse(raw);
          storagePaidAmount = list
            .filter((c) => {
              const orderIdKey = String(c.orderId || c.orderNo || c.orderNumber || '').replace(/^ORD-/, '').trim().toLowerCase();
              const oIdKey = String(o.id || o.orderNo || o.orderNumber || '').replace(/^ORD-/, '').trim().toLowerCase();
              return (orderIdKey === oIdKey || oIdKey.includes(orderIdKey)) && (c.status === 'FINANCE_VERIFIED' || c.status === 'VERIFIED');
            })
            .reduce((sum, c) => sum + Number(c.amount || 0), 0);
        }
      } catch (e) {}

      // 4. Order object's own pre-calculated paid field
      const orderSelfPaid = Number(o.verifiedPaidAmount ?? o.verified_paid_amount ?? o.paidAmount ?? 0);

      const paidAmount = Math.max(backendPaidAmount, localPaidAmount, storagePaidAmount, orderSelfPaid);
      const outstanding = Math.max(totalAmount - paidAmount, 0);

      // Days Overdue calculation
      const deliveredDate = o.deliveredAt ? new Date(o.deliveredAt) : null;
      const paymentTermDays = Number(o.paymentTermsDays || o.paymentTermDays || 15);
      const baseDate = deliveredDate && !isNaN(deliveredDate.getTime()) ? deliveredDate : new Date(o.createdAt || Date.now());
      const defaultDueDate = new Date(baseDate.getTime() + (paymentTermDays * 24 * 60 * 60 * 1000)).toISOString();
      const dueDate = o.paymentDueDate || o.dueDate || o.expectedDeliveryDate || defaultDueDate;
      const diffTime = Date.now() - new Date(dueDate).getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      const orderRef = o.orderNumber || o.orderNo || o.order_number || o.id || '—';
      const custName = o.customerName || o.customer_name || o.customer?.companyName || o.customer?.name || (typeof o.customer === 'string' ? o.customer : '') || 'Customer';
      const spName = o.salesperson || o.salespersonName || o.salesExecutive?.name || 'Unassigned';

      return {
        invoiceId: o.id,
        invoiceNumber: o.invoiceNo || o.invoiceNumber || `INV-${orderRef}`,
        orderNumber: orderRef,
        customerName: custName,
        customerId: o.customerId || o.customer?.id || 'CUST-UNKNOWN',
        customerPhone: o.customer?.phone || o.customer?.mobile || '',
        customerEmail: o.customer?.email || '',
        totalAmount,
        paidAmount,
        outstanding,
        paymentTerms: o.paymentTerms || `${paymentTermDays} Days`,
        dueDate,
        daysOverdue,
        salesPerson: spName,
        salesPersonId: o.salespersonId || o.createdById || '',
        status: o.paymentStatus || (outstanding === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIALLY_PAID' : 'PAYMENT_DUE')),
        orderStatus: o.dispatchStatus || (o.deliveredAt ? 'DELIVERED' : (o.status || 'CONFIRMED')),
        reminderSent: followUps.some((f) => String(f.orderId || f.orderNumber) === String(o.id) || String(f.orderId || f.orderNumber) === String(orderRef))
      };
    }).filter((item) => item.outstanding > 0);
  }, [orders, backendPayments, localCustomerPayments, followUps]);

  const salesmen = useMemo(() => Array.from(new Set(
    outstandingList.map((item) => item.salesPerson).filter((name) => name && name !== 'Unassigned' && name !== 'N/A')
  )).sort((left, right) => left.localeCompare(right)), [outstandingList]);

  // Compute Aging KPIs
  const agingStats = useMemo(() => {
    return outstandingList.reduce((acc, item) => {
      const bal = item.outstanding;
      acc.total += bal;
      if (item.daysOverdue <= 0) acc.current += bal;
      else if (item.daysOverdue <= 30) acc.bracket1_30 += bal;
      else if (item.daysOverdue <= 60) acc.bracket31_60 += bal;
      else if (item.daysOverdue <= 90) acc.bracket61_90 += bal;
      else acc.bracket90_plus += bal;
      return acc;
    }, { total: 0, current: 0, bracket1_30: 0, bracket31_60: 0, bracket61_90: 0, bracket90_plus: 0 });
  }, [outstandingList]);

  // Count active advanced filters
  const advancedFilterCount = useMemo(() => {
    let count = 0;
    if (minOutstanding !== '') count++;
    if (maxOutstanding !== '') count++;
    if (dueFrom !== '') count++;
    if (dueTo !== '') count++;
    if (collectionStatus !== 'All') count++;
    if (salesmanFilter !== 'All Salesmen' && salesmanFilter !== 'All') count++;
    if (sortBy !== 'Outstanding: High to Low') count++;
    return count;
  }, [minOutstanding, maxOutstanding, dueFrom, dueTo, collectionStatus, salesmanFilter, sortBy]);

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const minVal = minOutstanding !== '' && !isNaN(Number(minOutstanding)) ? Number(minOutstanding) : null;
    const maxVal = maxOutstanding !== '' && !isNaN(Number(maxOutstanding)) ? Number(maxOutstanding) : null;

    const filtered = outstandingList.filter((o) => {
      // 1. Text Search
      if (q) {
        const matchesSearch = 
          (o.invoiceNumber && String(o.invoiceNumber).toLowerCase().includes(q)) ||
          (o.orderNumber && String(o.orderNumber).toLowerCase().includes(q)) ||
          (o.customerName && String(o.customerName).toLowerCase().includes(q)) ||
          (o.salesPerson && String(o.salesPerson).toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      
      // 2. Minimum Amount
      if (minVal !== null && (Number(o.outstanding) || 0) < minVal) return false;

      // 3. Maximum Amount
      if (maxVal !== null && (Number(o.outstanding) || 0) > maxVal) return false;

      // 4. Due Date Range
      if (dueFrom || dueTo) {
        if (!o.dueDate) return false;
        const itemDate = new Date(o.dueDate);
        if (isNaN(itemDate.getTime())) return false;
        const itemDateISO = itemDate.toISOString().slice(0, 10);
        if (dueFrom && itemDateISO < dueFrom) return false;
        if (dueTo && itemDateISO > dueTo) return false;
      }

      // 5. Payment Status
      if (collectionStatus === 'Unpaid' && o.paidAmount > 0) return false;
      if (collectionStatus === 'Partially Paid' && !(o.paidAmount > 0 && o.outstanding > 0)) return false;
      if (collectionStatus === 'Overdue Only' && o.daysOverdue <= 0) return false;
      if (collectionStatus === 'Critical Overdue (90+ Days)' && o.daysOverdue <= 90) return false;

      // 6. Sales Executive
      if (salesmanFilter && salesmanFilter !== 'All Salesmen' && salesmanFilter !== 'All') {
        if (salesmanFilter === 'Unassigned') {
          if (o.salesPerson && o.salesPerson !== 'Unassigned' && o.salesPerson !== 'N/A') return false;
        } else if (o.salesPerson !== salesmanFilter) {
          return false;
        }
      }

      // 7. Preset Aging Brackets
      switch (activePreset) {
        case 'Reminders':
          return Boolean(o.reminderSent);
        case 'Not Due':
          return o.daysOverdue === 0;
        case '1-30 Days':
          return o.daysOverdue >= 1 && o.daysOverdue <= 30;
        case '31-60 Days':
          return o.daysOverdue >= 31 && o.daysOverdue <= 60;
        case '61-90 Days':
          return o.daysOverdue >= 61 && o.daysOverdue <= 90;
        case '90+ Days Overdue':
          return o.daysOverdue > 90;
        default:
          return true;
      }
    });

    // 8. Sorting
    return filtered.sort((left, right) => {
      switch (sortBy) {
        case 'Outstanding: Low to High':
          return (Number(left.outstanding) || 0) - (Number(right.outstanding) || 0);
        case 'Most Overdue':
          return (Number(right.daysOverdue) || 0) - (Number(left.daysOverdue) || 0);
        case 'Least Overdue':
          return (Number(left.daysOverdue) || 0) - (Number(right.daysOverdue) || 0);
        case 'Due Date: Earliest': {
          const tA = left.dueDate ? new Date(left.dueDate).getTime() : 0;
          const tB = right.dueDate ? new Date(right.dueDate).getTime() : 0;
          return (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB);
        }
        case 'Due Date: Latest': {
          const tA = left.dueDate ? new Date(left.dueDate).getTime() : 0;
          const tB = right.dueDate ? new Date(right.dueDate).getTime() : 0;
          return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
        }
        case 'Customer: A to Z':
          return String(left.customerName || '').localeCompare(String(right.customerName || ''));
        case 'Customer: Z to A':
          return String(right.customerName || '').localeCompare(String(left.customerName || ''));
        default: // 'Outstanding: High to Low'
          return (Number(right.outstanding) || 0) - (Number(left.outstanding) || 0);
      }
    });
  }, [
    outstandingList,
    searchQuery,
    activePreset,
    minOutstanding,
    maxOutstanding,
    dueFrom,
    dueTo,
    collectionStatus,
    salesmanFilter,
    sortBy,
  ]);

  // Total filtered outstanding amount
  const filteredTotal = useMemo(() => {
    return filteredList.reduce((sum, item) => sum + (Number(item.outstanding) || 0), 0);
  }, [filteredList]);

  // Reset all filters
  const resetAdvancedFilters = () => {
    setMinOutstanding('');
    setMaxOutstanding('');
    setDueFrom('');
    setDueTo('');
    setCollectionStatus('All');
    setSalesmanFilter('All Salesmen');
    setSortBy('Outstanding: High to Low');
    setSearchQuery('');
    setActivePreset('All');
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    activePreset,
    minOutstanding,
    maxOutstanding,
    dueFrom,
    dueTo,
    collectionStatus,
    reminderStatus,
    salesmanFilter,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const handleRefreshAll = () => {
    refetchOrders();
    refetchPayments();
    refetchSalesOrders();
    queryClient.invalidateQueries({ queryKey: ['finance-outstanding-delivered-orders'] });
    queryClient.invalidateQueries({ queryKey: ['finance-outstanding-payments'] });
  };

  const handleScheduleReminder = (item) => {
    const today = new Date().toISOString().split('T')[0];
    Swal.fire({
      title: 'Schedule Payment Reminder',
      html: `
        <div style="text-align: left; font-size: 13px; display: flex; flex-direction: column; gap: 12px; margin-top: 10px; color: #334155;">
          <div style="background: #F8FAFC; padding: 10px 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div style="font-weight: bold; color: #0F172A;">${item.customerName}</div>
            <div style="font-size: 12px; color: #64748B;">Order ${item.orderNumber} • Outstanding: <b style="color: #DC2626;">${formatINR(item.outstanding)}</b></div>
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Next Follow-up / Reminder Date</label>
            <input type="date" id="reminder-date" value="${today}" style="width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13px;" />
          </div>
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 4px; font-size: 11px; color: #64748B; text-transform: uppercase;">Follow-up Notes / Discussion</label>
            <textarea id="reminder-notes" placeholder="e.g. Spoke to accounts manager, promised RTGS payment this Friday" style="width: 100%; height: 80px; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13px; resize: none;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Follow-up',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const date = (document.getElementById('reminder-date')).value;
        const notes = (document.getElementById('reminder-notes')).value;
        if (!date) {
          Swal.showValidationMessage('Please select a reminder date.');
          return false;
        }
        return { date, notes };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const actor = {
            id: user?.id || 'finance-user',
            name: user?.name || 'Finance Executive',
            role: user?.role || 'Finance'
          };
          if (financeActions && typeof financeActions.addPaymentFollowUp === 'function') {
            financeActions.addPaymentFollowUp({
              customerId: item.customerId,
              orderId: item.invoiceId,
              orderNumber: item.orderNumber,
              invoiceNumber: item.invoiceNumber,
              customerName: item.customerName,
              outstandingAmount: item.outstanding,
              contactPerson: 'Accounts Dept',
              phoneNumber: item.customerPhone || 'N/A',
              followUpDate: today,
              contactMode: 'Phone',
              discussionSummary: result.value.notes || 'Follow-up scheduled',
              customerResponse: 'Promised Payment',
              nextFollowUpDate: result.value.date,
              remarks: result.value.notes
            }, actor);
          }

          Swal.fire({
            icon: 'success',
            title: 'Follow-up Scheduled',
            text: 'Reminder recorded successfully.',
            timer: 1600,
            showConfirmButton: false
          });
          handleRefreshAll();
        } catch (err) {
          Swal.fire('Error', err?.message || String(err), 'error');
        }
      }
    });
  };

  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      Swal.fire('No Data', 'No records to export.', 'info');
      return;
    }
    const headers = ['Customer Name', 'Order Number', 'Invoice Number', 'Total Amount', 'Paid Amount', 'Outstanding Amount', 'Payment Terms', 'Due Date', 'Days Overdue', 'Sales Executive', 'Delivery Status'];
    const csvRows = [
      headers.join(','),
      ...filteredList.map((r) => [
        `"${r.customerName.replace(/"/g, '""')}"`,
        `"${r.orderNumber}"`,
        `"${r.invoiceNumber}"`,
        r.totalAmount,
        r.paidAmount,
        r.outstanding,
        `"${r.paymentTerms}"`,
        `"${r.dueDate?.split('T')[0] || ''}"`,
        r.daysOverdue,
        `"${r.salesPerson.replace(/"/g, '""')}"`,
        `"${r.orderStatus}"`
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `outstanding_receivables_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="finance-outstanding-page">
      <style>{`
        .finance-outstanding-page {
          width: 100%;
          max-width: 100%;
          padding: clamp(12px, 2.5vw, 24px);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-family: var(--font-main), 'Plus Jakarta Sans', sans-serif;
        }

        .finance-outstanding-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: clamp(14px, 2.5vw, 20px);
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          width: 100%;
          box-sizing: border-box;
        }

        .finance-outstanding-kpi-grid {
          display: grid !important;
          grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
          gap: 12px !important;
          width: 100% !important;
          box-sizing: border-box;
        }

        @media (max-width: 1300px) {
          .finance-outstanding-kpi-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 768px) {
          .finance-outstanding-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .finance-outstanding-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .finance-outstanding-kpi-card {
          background: #FFFFFF;
          padding: 16px 18px;
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          min-width: 0;
          box-sizing: border-box;
        }

        .finance-outstanding-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .finance-outstanding-table-card {
          background: #FFFFFF;
          padding: 20px 24px;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .finance-outstanding-desktop-table {
          display: block;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .finance-outstanding-mobile-cards {
          display: none;
        }

        @media (max-width: 768px) {
          .finance-outstanding-desktop-table {
            display: none !important;
          }
          .finance-outstanding-mobile-cards {
            display: flex !important;
            flex-direction: column;
            gap: 12px;
          }
          .finance-outstanding-table-card {
            padding: 14px !important;
            border-radius: 14px !important;
          }
        }

        @media (max-width: 640px) {
          .finance-outstanding-header {
            flex-direction: column;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .finance-outstanding-header > div:last-child {
            width: 100%;
            justify-content: space-between;
          }
          .finance-outstanding-search-wrap {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .finance-outstanding-search-box {
            width: 100% !important;
            max-width: 100% !important;
          }
        }

        .finance-outstanding-drawer {
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: drawerSlideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes drawerSlideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filter-field-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }

        .filter-control-input {
          width: 100%;
          height: 38px;
          padding: 7px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          font-size: 13px;
          color: #0f172a;
          box-sizing: border-box;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .filter-control-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .quick-chip-btn {
          padding: 4px 11px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .quick-chip-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .quick-chip-btn.active {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #93c5fd;
        }
      `}</style>

      {/* Header Title & Actions */}
      <div className="finance-outstanding-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <DollarSign className="text-blue-600" size={24} />
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Outstanding Collections & Receivables
            </h1>
            {readOnly && (
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Read-Only
              </span>
            )}
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            {readOnly
              ? 'Live monitoring of customer balances, aging brackets, and payment records (Read-Only)'
              : 'Live monitoring of customer balances, aging brackets, collection follow-ups, and payment records'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={handleRefreshAll}
            disabled={ordersFetching || paymentsFetching}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}
          >
            <RefreshCw size={14} className={ordersFetching || paymentsFetching ? 'animate-spin' : ''} />
            Refresh Dues
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="finance-outstanding-kpi-grid">
        
        {/* Total Outstanding */}
        <div className="finance-outstanding-kpi-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Outstanding</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{formatINR(agingStats.total)}</h3>
          <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>{outstandingList.length} total pending accounts</span>
        </div>

        {/* Not Due / Current */}
        <div className="finance-outstanding-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Not Due (Within Term)</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#10b981' }}>{formatINR(agingStats.current)}</h3>
          <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Upcoming due dates</span>
        </div>

        {/* 1-30 Days */}
        <div className="finance-outstanding-kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1-30 Days Overdue</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#d97706' }}>{formatINR(agingStats.bracket1_30)}</h3>
          <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Early stage overdue</span>
        </div>

        {/* 31-60 Days */}
        <div className="finance-outstanding-kpi-card" style={{ borderLeft: '4px solid #f97316' }}>
          <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>31-60 Days Overdue</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#ea580c' }}>{formatINR(agingStats.bracket31_60)}</h3>
          <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Requires follow-up</span>
        </div>

        {/* 61-90 Days */}
        <div className="finance-outstanding-kpi-card" style={{ borderLeft: '4px solid #e11d48' }}>
          <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>61-90 Days Overdue</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#e11d48' }}>{formatINR(agingStats.bracket61_90)}</h3>
          <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>High priority follow-up</span>
        </div>

        {/* 90+ Days */}
        <div className="finance-outstanding-kpi-card" style={{ borderLeft: '4px solid #dc2626' }}>
          <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>90+ Days Critical</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#dc2626' }}>{formatINR(agingStats.bracket90_plus)}</h3>
          <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>Critical recovery action</span>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="finance-outstanding-table-card">
          
          {/* Error Banner if any */}
          {(ordersError || paymentsError) && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>{ordersError?.message || paymentsError?.message || 'Unable to sync live outstanding data.'}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            
            {/* Aging & Status Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {['All', 'Not Due', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days Overdue', 'Reminders'].map((preset) => {
                const isActive = activePreset === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => setActivePreset(preset)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      background: isActive ? '#2563eb' : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            {/* Search and Advanced Filter Trigger */}
            <div className="finance-outstanding-search-wrap" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="finance-outstanding-search-box" style={{ position: 'relative', width: '280px' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '11px', width: '15px', height: '15px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search customer, order, invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 30px 8px 32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    background: '#ffffff'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '9px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className="finance-outstanding-filter-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 16px',
                  background: showAdvancedFilters || advancedFilterCount > 0 ? '#eff6ff' : '#ffffff',
                  color: showAdvancedFilters || advancedFilterCount > 0 ? '#1d4ed8' : '#334155',
                  border: showAdvancedFilters || advancedFilterCount > 0 ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: showAdvancedFilters ? '0 0 0 2px rgba(37, 99, 235, 0.15)' : 'none'
                }}
              >
                <SlidersHorizontal size={14} />
                Filters
                {advancedFilterCount > 0 && (
                  <span style={{
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 6px',
                    borderRadius: '9px',
                    background: '#2563eb',
                    color: '#ffffff',
                    display: 'inline-grid',
                    placeItems: 'center',
                    fontSize: '10.5px',
                    fontWeight: '800'
                  }}>
                    {advancedFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filter Chips Pill Row (when drawer is closed but filters are active) */}
          {!showAdvancedFilters && advancedFilterCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                Active Filters:
              </span>
              {minOutstanding !== '' && (
                <span className="quick-chip-btn active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  Min: {formatINR(minOutstanding)}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setMinOutstanding('')} />
                </span>
              )}
              {maxOutstanding !== '' && (
                <span className="quick-chip-btn active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  Max: {formatINR(maxOutstanding)}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setMaxOutstanding('')} />
                </span>
              )}
              {dueFrom !== '' && (
                <span className="quick-chip-btn active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  From: {dueFrom}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setDueFrom('')} />
                </span>
              )}
              {dueTo !== '' && (
                <span className="quick-chip-btn active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  To: {dueTo}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setDueTo('')} />
                </span>
              )}
              {collectionStatus !== 'All' && (
                <span className="quick-chip-btn active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  Status: {collectionStatus}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setCollectionStatus('All')} />
                </span>
              )}
              {salesmanFilter !== 'All Salesmen' && (
                <span className="quick-chip-btn active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  Salesman: {salesmanFilter}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSalesmanFilter('All Salesmen')} />
                </span>
              )}
              {sortBy !== 'Outstanding: High to Low' && (
                <span className="quick-chip-btn active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  Sort: {sortBy}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSortBy('Outstanding: High to Low')} />
                </span>
              )}
              <button
                onClick={resetAdvancedFilters}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#dc2626',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <RotateCcw size={11} /> Clear All
              </button>
            </div>
          )}

          {/* Redesigned Advanced Filters Expandable Drawer */}
          {showAdvancedFilters && (
            <div className="finance-outstanding-drawer">
              {/* Drawer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <SlidersHorizontal size={16} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '14px', fontWeight: '800' }}>
                        Advanced Filter Controls
                      </strong>
                      {advancedFilterCount > 0 && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: '#dbeafe',
                          color: '#1d4ed8',
                          fontSize: '11px',
                          fontWeight: '800'
                        }}>
                          {advancedFilterCount} Active
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                      Filter by amount thresholds, due dates, payment status, or sales executive
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={resetAdvancedFilters}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#475569',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <RotateCcw size={13} />
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    aria-label="Close filters"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Quick Amount Thresholds Strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Quick Amounts:
                </span>
                {[
                  { label: 'All', min: '', max: '' },
                  { label: '< ₹25,000', min: '', max: '25000' },
                  { label: '₹25,000 - ₹1,00,000', min: '25000', max: '100000' },
                  { label: '₹1,00,000 - ₹5,00,000', min: '100000', max: '500000' },
                  { label: '> ₹5,00,000', min: '500000', max: '' },
                ].map((preset) => {
                  const isActive = minOutstanding === preset.min && maxOutstanding === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setMinOutstanding(preset.min);
                        setMaxOutstanding(preset.max);
                      }}
                      className={`quick-chip-btn ${isActive ? 'active' : ''}`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Inputs Responsive Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                
                {/* 1. Minimum Amount */}
                <div>
                  <label className="filter-field-label">
                    <DollarSign size={13} className="text-blue-600" />
                    Minimum Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOutstanding}
                    onChange={(e) => setMinOutstanding(e.target.value)}
                    placeholder="₹ 0"
                    className="filter-control-input"
                  />
                </div>

                {/* 2. Maximum Amount */}
                <div>
                  <label className="filter-field-label">
                    <DollarSign size={13} className="text-blue-600" />
                    Maximum Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxOutstanding}
                    onChange={(e) => setMaxOutstanding(e.target.value)}
                    placeholder="No maximum"
                    className="filter-control-input"
                  />
                </div>

                {/* 3. Due Date From */}
                <div>
                  <label className="filter-field-label">
                    <Calendar size={13} className="text-blue-600" />
                    Due Date From
                  </label>
                  <input
                    type="date"
                    value={dueFrom}
                    onChange={(e) => setDueFrom(e.target.value)}
                    className="filter-control-input"
                  />
                </div>

                {/* 4. Due Date To */}
                <div>
                  <label className="filter-field-label">
                    <Calendar size={13} className="text-blue-600" />
                    Due Date To
                  </label>
                  <input
                    type="date"
                    value={dueTo}
                    onChange={(e) => setDueTo(e.target.value)}
                    className="filter-control-input"
                  />
                </div>

                {/* 5. Payment Status */}
                <div>
                  <label className="filter-field-label">
                    <Filter size={13} className="text-blue-600" />
                    Payment Status
                  </label>
                  <select
                    value={collectionStatus}
                    onChange={(e) => setCollectionStatus(e.target.value)}
                    className="filter-control-input"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Unpaid">Unpaid (Zero Paid)</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Overdue Only">Overdue Only</option>
                    <option value="Critical Overdue (90+ Days)">Critical Overdue (90+ Days)</option>
                  </select>
                </div>

                {/* 6. Sales Executive */}
                <div>
                  <label className="filter-field-label">
                    <User size={13} className="text-blue-600" />
                    Sales Executive
                  </label>
                  <select
                    value={salesmanFilter}
                    onChange={(e) => setSalesmanFilter(e.target.value)}
                    className="filter-control-input"
                  >
                    <option value="All Salesmen">All Salesmen</option>
                    {salesmen.map((salesman) => (
                      <option key={salesman} value={salesman}>{salesman}</option>
                    ))}
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>

                {/* 7. Sort Order */}
                <div>
                  <label className="filter-field-label">
                    <ArrowUpDown size={13} className="text-blue-600" />
                    Sort Order
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-control-input"
                  >
                    <option value="Outstanding: High to Low">Outstanding: High to Low</option>
                    <option value="Outstanding: Low to High">Outstanding: Low to High</option>
                    <option value="Most Overdue">Most Overdue (Days)</option>
                    <option value="Least Overdue">Least Overdue</option>
                    <option value="Due Date: Earliest">Due Date: Earliest First</option>
                    <option value="Due Date: Latest">Due Date: Latest First</option>
                    <option value="Customer: A to Z">Customer: A to Z</option>
                    <option value="Customer: Z to A">Customer: Z to A</option>
                  </select>
                </div>

              </div>

              {/* Drawer Footer Summary Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid #e2e8f0',
                marginTop: '4px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#475569', fontSize: '12.5px' }}>
                    Showing <strong style={{ color: '#0f172a' }}>{filteredList.length}</strong> of <strong style={{ color: '#0f172a' }}>{outstandingList.length}</strong> accounts
                  </span>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    fontSize: '12px',
                    color: '#991b1b',
                    fontWeight: '700'
                  }}>
                    Filtered Total: {formatINR(filteredTotal)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={resetAdvancedFilters}
                    style={{
                      padding: '7px 14px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '7px',
                      color: '#475569',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RotateCcw size={13} />
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    style={{
                      padding: '7px 18px',
                      background: '#2563eb',
                      border: 'none',
                      borderRadius: '7px',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <Check size={14} />
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          <div className="finance-outstanding-desktop-table">
            <table className="no-mobile-stack" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px' }}>Customer & Order</th>
                  <th style={{ padding: '12px 16px' }}>Invoice No</th>
                  <th style={{ padding: '12px 16px' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px' }}>Paid Amount</th>
                  <th style={{ padding: '12px 16px' }}>Outstanding Dues</th>
                  <th style={{ padding: '12px 16px' }}>Terms & Due Date</th>
                  <th style={{ padding: '12px 16px' }}>Aging Overdue</th>
                  <th style={{ padding: '12px 16px' }}>Sales Executive</th>
                  {!readOnly && (
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody style={{ fontSize: '13px', color: '#1e293b' }}>
                {(ordersLoading || paymentsLoading) ? (
                  <tr>
                    <td colSpan={readOnly ? 8 : 9} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span style={{ fontWeight: '700' }}>Loading live receivables and outstanding records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={readOnly ? 8 : 9} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={32} className="text-emerald-500" />
                        <span style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>No outstanding dues found matching criteria</span>
                        <span style={{ fontSize: '12px' }}>All matched accounts have been settled or no entries exist.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item) => {
                    const isCriticallyOverdue = item.daysOverdue > 90;
                    return (
                      <tr key={item.invoiceId} style={{ borderBottom: '1px solid #f1f5f9', background: isCriticallyOverdue ? '#fffdfd' : '#ffffff' }}>
                        
                        {/* Customer & Order Reference */}
                        <td data-label="Customer & Order" style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13.5px' }}>{item.customerName}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0284c7', fontWeight: '700' }}>
                              {item.orderNumber}
                            </span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '700',
                              background: item.orderStatus === 'DELIVERED' ? '#dcfce7' : '#f1f5f9',
                              color: item.orderStatus === 'DELIVERED' ? '#15803d' : '#475569'
                            }}>
                              {item.orderStatus}
                            </span>
                          </div>
                        </td>

                        {/* Invoice Number */}
                        <td data-label="Invoice No" style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#475569', fontSize: '12.5px' }}>
                          {item.invoiceNumber}
                        </td>

                        {/* Total Amount */}
                        <td data-label="Total Amount" style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>
                          {formatINR(item.totalAmount)}
                        </td>

                        {/* Verified Paid Amount */}
                        <td data-label="Paid Amount" style={{ padding: '12px 16px', fontWeight: '700', color: '#16a34a' }}>
                          {formatINR(item.paidAmount)}
                        </td>

                        {/* Outstanding Amount */}
                        <td data-label="Outstanding Dues" style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '900', fontSize: '14.5px', color: '#dc2626' }}>
                            {formatINR(item.outstanding)}
                          </div>
                          {item.paidAmount > 0 && (
                            <span style={{ fontSize: '10.5px', color: '#d97706', fontWeight: '700' }}>
                              Partially Settled
                            </span>
                          )}
                        </td>

                        {/* Terms & Due Date */}
                        <td data-label="Terms & Due Date" style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                            {item.dueDate?.split('T')[0] || '—'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {item.paymentTerms}
                          </div>
                        </td>

                        {/* Days Overdue */}
                        <td data-label="Aging Overdue" style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: item.daysOverdue > 90 ? '#fee2e2' : (item.daysOverdue > 30 ? '#ffedd5' : (item.daysOverdue > 0 ? '#fef3c7' : '#dcfce7')),
                            color: item.daysOverdue > 90 ? '#991b1b' : (item.daysOverdue > 30 ? '#c2410c' : (item.daysOverdue > 0 ? '#b45309' : '#15803d'))
                          }}>
                            {item.daysOverdue > 0 ? `${item.daysOverdue} Days Overdue` : 'Not Due'}
                          </span>
                        </td>

                        {/* Sales Executive */}
                        <td data-label="Sales Executive" style={{ padding: '12px 16px', color: '#475569', fontSize: '12px' }}>
                          {item.salesPerson}
                        </td>

                        {/* Action Buttons */}
                        {!readOnly && (
                          <td data-label="Actions" style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center' }}>
                              <button
                                onClick={() => handleScheduleReminder(item)}
                                title="Schedule Reminder / Add Follow-up"
                                style={{
                                  padding: '6px 10px',
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Calendar size={13} />
                                Follow-up
                              </button>

                              <button
                                onClick={() => router.push(`/sales/create-payment?orderId=${encodeURIComponent(item.orderNumber)}`)}
                                title="Log / Confirm Payment Collection"
                                style={{
                                  padding: '6px 12px',
                                  background: '#2563eb',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                                }}
                              >
                                <CreditCard size={13} />
                                Pay
                              </button>
                            </div>
                          </td>
                        )}

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Dedicated Mobile Cards List */}
          <div className="finance-outstanding-mobile-cards">
            {(ordersLoading || paymentsLoading) ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span style={{ fontWeight: '700', fontSize: '13.5px' }}>Loading live receivables and outstanding records...</span>
                </div>
              </div>
            ) : filteredList.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94a3b8', background: '#F8FAFC', borderRadius: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={32} className="text-emerald-500" />
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>No outstanding dues found matching criteria</span>
                  <span style={{ fontSize: '12px' }}>All matched accounts have been settled or no entries exist.</span>
                </div>
              </div>
            ) : (
              paginatedList.map((item) => {
                const isCriticallyOverdue = item.daysOverdue > 90;
                const isLate = item.daysOverdue > 30;
                const isOverdue = item.daysOverdue > 0;
                const accentColor = isCriticallyOverdue ? '#dc2626' : (isLate ? '#ea580c' : (isOverdue ? '#d97706' : '#10b981'));

                return (
                  <div
                    key={item.invoiceId}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderLeft: `4px solid ${accentColor}`,
                      borderRadius: '14px',
                      padding: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxSizing: 'border-box',
                      width: '100%'
                    }}
                  >
                    {/* Header: Customer Name, Order No & Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: 1.35, wordBreak: 'break-word' }}>
                          {item.customerName}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0284C7', fontWeight: 700 }}>
                            {item.orderNumber}
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 700,
                            background: item.orderStatus === 'DELIVERED' ? '#DCFCE7' : '#F1F5F9',
                            color: item.orderStatus === 'DELIVERED' ? '#15803D' : '#475569'
                          }}>
                            {item.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Aging Status Badge */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: item.daysOverdue > 90 ? '#FEE2E2' : (item.daysOverdue > 30 ? '#FFEDD5' : (item.daysOverdue > 0 ? '#FEF3C7' : '#DCFCE7')),
                        color: item.daysOverdue > 90 ? '#991B1B' : (item.daysOverdue > 30 ? '#C2410C' : (item.daysOverdue > 0 ? '#B45309' : '#15803D')),
                        flexShrink: 0,
                        whiteSpace: 'nowrap'
                      }}>
                        {item.daysOverdue > 0 ? `${item.daysOverdue}d Overdue` : 'Not Due'}
                      </span>
                    </div>

                    {/* Metadata Box: Invoice, Salesperson, Terms, Due Date */}
                    <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #F1F5F9', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ color: '#64748B', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Invoice No</span>
                          <span style={{ fontFamily: 'monospace', color: '#334155', fontWeight: 600 }}>{item.invoiceNumber || '—'}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#64748B', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Sales Executive</span>
                          <span style={{ color: '#334155', fontWeight: 600 }}>{item.salesPerson || '—'}</span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748B', fontSize: '11.5px' }}>
                          Due Date: <strong style={{ color: '#1E293B' }}>{item.dueDate?.split('T')[0] || '—'}</strong>
                        </span>
                        <span style={{ color: '#64748B', fontSize: '11.5px' }}>
                          Terms: <strong style={{ color: '#1E293B' }}>{item.paymentTerms || '—'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary: 3 Columns (Total, Paid, Outstanding) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px', background: '#F8FAFC', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Total</span>
                        <strong style={{ fontSize: '12.5px', color: '#0F172A', display: 'block', marginTop: '2px' }}>{formatINR(item.totalAmount)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Paid</span>
                        <strong style={{ fontSize: '12.5px', color: '#16A34A', display: 'block', marginTop: '2px' }}>{formatINR(item.paidAmount)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Outstanding</span>
                        <strong style={{ fontSize: '13.5px', color: '#DC2626', fontWeight: 900, display: 'block', marginTop: '2px' }}>{formatINR(item.outstanding)}</strong>
                      </div>
                    </div>

                    {item.paidAmount > 0 && item.outstanding > 0 && (
                      <div style={{ textAlign: 'center', marginTop: '-4px' }}>
                        <span style={{ fontSize: '10.5px', color: '#D97706', fontWeight: '700', background: '#FEF3C7', padding: '2px 8px', borderRadius: '4px' }}>
                          Partially Settled • Remaining Dues
                        </span>
                      </div>
                    )}

                    {/* Touch-Friendly Action Buttons */}
                    {!readOnly && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '2px' }}>
                        <button
                          onClick={() => handleScheduleReminder(item)}
                          style={{
                            padding: '10px',
                            background: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Calendar size={14} />
                          Follow-up
                        </button>
                        <button
                          onClick={() => router.push(`/sales/create-payment?orderId=${encodeURIComponent(item.orderNumber)}`)}
                          style={{
                            padding: '10px',
                            background: '#2563EB',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                          }}
                        >
                          <CreditCard size={14} />
                          Pay
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {filteredList.length > 0 && (
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredList.length}
              pageSize={pageSize}
              pageSizeOptions={[10, 25, 50, 100]}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          )}
        </div>

    </div>
  );
}
