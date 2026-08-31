'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  Eye,
  FilePenLine,
  Plus,
  Trash2,
  Search,
  X,
  Check,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Package,
  Calendar,
  User,
  Building2,
  FileText,
  Paperclip,
  ArrowRight,
  TrendingDown,
  RotateCcw,
  Send,
  Download,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import { useMediaQuery } from '../hooks/useMediaQuery';
import './CustomerComplaints.css';

const COMPLAINT_TYPES = [
  'Product Quality',
  'Damage',
  'Wrong Product',
  'Quantity Shortage',
  'Delivery',
  'Billing',
  'Service',
  'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const formatDate = (val) => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(val);
  }
};

const formatCurrency = (val) => {
  const num = Number(val || 0);
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

const getStatusBadge = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'DRAFT') {
    return { label: 'Draft', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  }
  if (s === 'PENDING_PLANT_HEAD' || s === 'PENDING_SUPER_ADMIN' || s === 'SUBMITTED' || s === 'PENDING') {
    return { label: 'Plant Head Pending', bg: '#fef3c7', color: '#b45309', border: '#fcd34d' };
  }
  if (s === 'APPROVED') {
    return { label: 'Approved', bg: '#dcfce7', color: '#15803d', border: '#86efac' };
  }
  if (s === 'REJECTED') {
    return { label: 'Rejected', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
  }
  if (s === 'RESOLVED') {
    return { label: 'Resolved', bg: '#e0e7ff', color: '#4338ca', border: '#a5b4fc' };
  }
  if (s === 'CLOSED') {
    return { label: 'Closed', bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
  }
  return { label: s || 'Unknown', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
};

const getPriorityBadge = (p) => {
  const pr = String(p || '').toLowerCase();
  if (pr === 'critical') return { bg: '#fee2e2', color: '#991b1b' };
  if (pr === 'high') return { bg: '#ffedd5', color: '#c2410c' };
  if (pr === 'medium') return { bg: '#fef9c3', color: '#854d0e' };
  return { bg: '#f0fdf4', color: '#166534' };
};

export default function CustomerComplaintManagement({ mode = 'sales', currentUser }) {
  const isPlantHead = mode === 'plant-head' || mode === 'admin';
  const isMobile = useMediaQuery('(max-width: 768px)');

  // List & Filter States
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(isPlantHead ? 'PENDING' : 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(isPlantHead ? 'PENDING' : 'ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Meta Data for Creation
  const [metaCustomers, setMetaCustomers] = useState([]);
  const [metaOrders, setMetaOrders] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [saving, setSaving] = useState(false);

  // Create Form State
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formOrderId, setFormOrderId] = useState('');
  const [formSelectedProducts, setFormSelectedProducts] = useState({}); // { [productId]: { selected: boolean, complaintQty: number, orderItemId: string, orderedQty: number, deliveredQty: number, name: string, sku: string } }
  const [formComplaintType, setFormComplaintType] = useState('Product Quality');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formComplaintDate, setFormComplaintDate] = useState(new Date().toISOString().slice(0, 10));
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSalesRemarks, setFormSalesRemarks] = useState('');
  const [formAttachment, setFormAttachment] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Fetch Complaints List
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isPlantHead ? '/plant-head/complaints' : '/sales/complaints';
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (customerFilter) params.set('customerId', customerFilter);
      if (orderFilter) params.set('orderId', orderFilter);
      if (typeFilter) params.set('complaintType', typeFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      
      const st = isPlantHead ? activeTab : statusFilter;
      if (st && st !== 'ALL') params.set('status', st);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await backendFetch(`${endpoint}${qs}`);
      if (Array.isArray(res)) {
        setComplaints(res);
      } else if (res?.data && Array.isArray(res.data)) {
        setComplaints(res.data);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error('[CustomerComplaints] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isPlantHead, activeTab, statusFilter, searchQuery, customerFilter, orderFilter, typeFilter, priorityFilter]);

  // Fetch Meta Data (Orders & Customers) for Super Sales Create Modal
  const fetchMeta = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const res = await backendFetch('/sales/complaints-meta/orders-and-customers');
      if (res) {
        setMetaCustomers(res.customers || []);
        setMetaOrders(res.orders || []);
      }
    } catch (err) {
      console.error('[CustomerComplaints] meta error:', err);
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    if (!isPlantHead) {
      fetchMeta();
    }
  }, [isPlantHead, fetchMeta]);

  // Filtered orders for selected customer in Create Form
  const availableOrdersForCustomer = useMemo(() => {
    if (!formCustomerId) return [];
    return metaOrders.filter((o) => o.customerId === formCustomerId);
  }, [formCustomerId, metaOrders]);

  // Currently selected order in Create Form
  const selectedOrderObj = useMemo(() => {
    if (!formOrderId) return null;
    return metaOrders.find((o) => o.id === formOrderId) || null;
  }, [formOrderId, metaOrders]);

  // When order changes in form, populate product selection map
  useEffect(() => {
    if (selectedOrderObj && selectedOrderObj.items) {
      const initialMap = {};
      selectedOrderObj.items.forEach((item) => {
        initialMap[item.productId] = {
          selected: true,
          orderItemId: item.orderItemId || item.id,
          productId: item.productId,
          productName: item.productName || item.product?.name || 'Product',
          sku: item.sku || item.product?.sku || '',
          orderedQuantity: Number(item.orderedQuantity || 0),
          deliveredQuantity: Number(item.deliveredQuantity ?? item.orderedQuantity ?? 0),
          complaintQuantity: Number(item.orderedQuantity || 1),
          unit: item.unit || 'Units',
        };
      });
      setFormSelectedProducts(initialMap);
    } else {
      setFormSelectedProducts({});
    }
  }, [selectedOrderObj]);

  const openCreateModal = () => {
    setFormCustomerId('');
    setFormOrderId('');
    setFormSelectedProducts({});
    setFormComplaintType('Product Quality');
    setFormPriority('Medium');
    setFormComplaintDate(new Date().toISOString().slice(0, 10));
    setFormSubject('');
    setFormDescription('');
    setFormSalesRemarks('');
    setFormAttachment('');
    setShowCreateModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormAttachment(data.url);
        Swal.fire({ icon: 'success', title: 'Attached', text: file.name, timer: 1500, showConfirmButton: false });
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message });
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleSubmitComplaint = async (targetStatus = 'SUBMIT') => {
    if (!formCustomerId) {
      return Swal.fire({ icon: 'warning', title: 'Customer Required', text: 'Please select a customer.' });
    }
    if (!formOrderId) {
      return Swal.fire({ icon: 'warning', title: 'Order Required', text: 'Please select a sales order.' });
    }

    const selectedItems = Object.values(formSelectedProducts).filter((p) => p.selected);
    if (selectedItems.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Product Selection Required',
        text: 'Please select at least one affected product and enter complaint quantity.',
      });
    }

    for (const item of selectedItems) {
      const qty = Number(item.complaintQuantity);
      if (!qty || qty <= 0) {
        return Swal.fire({
          icon: 'warning',
          title: 'Invalid Quantity',
          text: `Please enter a valid positive complaint quantity for ${item.productName}.`,
        });
      }
      if (qty > Number(item.orderedQuantity)) {
        return Swal.fire({
          icon: 'warning',
          title: 'Quantity Exceeded',
          text: `Complaint quantity (${qty}) for ${item.productName} cannot exceed ordered quantity (${item.orderedQuantity}).`,
        });
      }
    }

    if (!formSubject.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Subject Required', text: 'Please enter a subject.' });
    }
    if (!formDescription.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Description Required', text: 'Please enter complaint description.' });
    }

    const payload = {
      customerId: formCustomerId,
      orderId: formOrderId,
      complaintType: formComplaintType,
      priority: formPriority,
      complaintDate: formComplaintDate,
      subject: formSubject.trim(),
      description: formDescription.trim(),
      salesRemarks: formSalesRemarks.trim(),
      attachment: formAttachment,
      status: targetStatus === 'DRAFT' ? 'DRAFT' : 'PENDING_PLANT_HEAD',
      items: selectedItems.map((item) => ({
        orderItemId: item.orderItemId,
        productId: item.productId,
        orderedQuantity: Number(item.orderedQuantity),
        deliveredQuantity: Number(item.deliveredQuantity),
        complaintQuantity: Number(item.complaintQuantity),
      })),
    };

    setSaving(true);
    try {
      await backendFetch('/sales/complaints', {
        method: 'POST',
        body: payload,
      });

      Swal.fire({
        icon: 'success',
        title: targetStatus === 'DRAFT' ? 'Draft Saved' : 'Submitted to Plant Head',
        text: targetStatus === 'DRAFT'
          ? 'Complaint saved as Draft successfully.'
          : 'Complaint submitted to Plant Head for decision.',
        timer: 2000,
        showConfirmButton: false,
      });

      setShowCreateModal(false);
      fetchComplaints();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || 'Could not create complaint.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Plant Head Decision Handlers
  const handlePlantHeadApprove = async (complaint) => {
    const orderNo = complaint.order?.orderNumber || 'Order';
    const orderVal = formatCurrency(complaint.order?.totalAmount || 0);

    const { isConfirmed } = await Swal.fire({
      title: `Approve Complaint ${complaint.complaintNo}?`,
      html: `
        <div style="text-align:left; font-size:13.5px; line-height:1.6; color:#334155;">
          <p>Approving this complaint will initiate a transactional business impact:</p>
          <ul style="margin:8px 0; padding-left:20px; font-weight:600;">
            <li>Complaint Status <span style="color:#16a34a;">→ APPROVED</span></li>
            <li>Order <span style="color:#2563eb;">${orderNo}</span> Status <span style="color:#dc2626;">→ LOST</span></li>
            <li>Sales Order Loss Record created (${orderVal})</li>
            <li>Linked Quotation & Lead updated to <span style="color:#dc2626;">LOST</span></li>
            <li>Deducts <span style="color:#dc2626;">${orderVal}</span> from active salesperson targets</li>
          </ul>
          <p style="font-size:12px; color:#64748b; margin-top:10px;">This action cannot be undone and will be permanently recorded in audit logs.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve & Mark Order LOST',
      confirmButtonColor: '#16a34a',
      cancelButtonText: 'Cancel',
    });

    if (!isConfirmed) return;

    try {
      await backendFetch(`/plant-head/complaints/${complaint.id}/approve`, {
        method: 'PUT',
        body: { adminRemarks: 'Approved by Plant Head' },
      });

      Swal.fire({
        icon: 'success',
        title: 'Complaint Approved',
        text: `Order ${orderNo} marked as LOST and sales values adjusted.`,
        timer: 2200,
        showConfirmButton: false,
      });

      setShowDetailModal(false);
      fetchComplaints();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: err.message || 'Could not approve complaint.',
      });
    }
  };

  const handlePlantHeadReject = async (complaint) => {
    const { value: rejectionReason } = await Swal.fire({
      title: `Reject Complaint ${complaint.complaintNo}`,
      input: 'textarea',
      inputLabel: 'Rejection Reason *',
      inputPlaceholder: 'State why this customer complaint is rejected...',
      showCancelButton: true,
      confirmButtonText: 'Confirm Rejection',
      confirmButtonColor: '#dc2626',
      inputValidator: (val) => {
        if (!val || !val.trim()) {
          return 'Rejection reason is mandatory.';
        }
      },
    });

    if (!rejectionReason) return;

    try {
      await backendFetch(`/plant-head/complaints/${complaint.id}/reject`, {
        method: 'PUT',
        body: { rejectionReason: rejectionReason.trim() },
      });

      Swal.fire({
        icon: 'success',
        title: 'Complaint Rejected',
        text: 'Complaint status set to Rejected.',
        timer: 2000,
        showConfirmButton: false,
      });

      setShowDetailModal(false);
      fetchComplaints();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        text: err.message || 'Could not reject complaint.',
      });
    }
  };

  const handleDeleteDraft = async (complaint) => {
    const { isConfirmed } = await Swal.fire({
      title: `Delete Draft ${complaint.complaintNo}?`,
      text: 'This draft will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete Draft',
      confirmButtonColor: '#dc2626',
    });

    if (!isConfirmed) return;

    try {
      await backendFetch(`/sales/complaints/${complaint.id}`, { method: 'DELETE' });
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Draft complaint deleted.', timer: 1500, showConfirmButton: false });
      fetchComplaints();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.message });
    }
  };

  // Filtered Display List
  const displayComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (dateFilter) {
        const cDate = (c.complaintDate || '').slice(0, 10);
        if (cDate !== dateFilter) return false;
      }
      return true;
    });
  }, [complaints, dateFilter]);

  // Status Counts for Summary
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => {
      const s = String(c.status).toUpperCase();
      return s === 'PENDING_PLANT_HEAD' || s === 'PENDING_SUPER_ADMIN' || s === 'SUBMITTED';
    }).length;
    const approved = complaints.filter((c) => String(c.status).toUpperCase() === 'APPROVED').length;
    const rejected = complaints.filter((c) => String(c.status).toUpperCase() === 'REJECTED').length;
    return { total, pending, approved, rejected };
  }, [complaints]);

  return (
    <div className="complaints-page" style={{ width: '100%', minHeight: '100%', boxSizing: 'border-box' }}>
      <div className="complaints-container">
        
        {/* Header Bar */}
        <div className="complaints-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={26} color="#2F4375" />
              {isPlantHead ? 'Plant Head — Customer Complaints' : 'Customer Complaints'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
              {isPlantHead
                ? 'Review customer complaints and authorize order state transitions to Lost.'
                : 'Manage customer complaints against sales orders and track resolution status.'}
            </p>
          </div>

          {!isPlantHead && (
            <button
              data-testid="btn-create-complaint"
              type="button"
              onClick={openCreateModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#2F4375',
                color: '#fff',
                border: 'none',
                borderRadius: '9px',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(47,67,117,0.25)',
              }}
            >
              <Plus size={18} />
              + Create Complaint
            </button>
          )}
        </div>

        {/* Plant Head Navigation Tabs */}
        {isPlantHead && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { id: 'PENDING', label: 'Pending Review', count: stats.pending },
              { id: 'APPROVED', label: 'Approved (Lost Orders)', count: stats.approved },
              { id: 'REJECTED', label: 'Rejected', count: stats.rejected },
              { id: 'ALL', label: 'All Complaints', count: stats.total },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: active ? '2px solid #2F4375' : '1px solid #DCE5F0',
                    background: active ? '#2F4375' : '#fff',
                    color: active ? '#fff' : '#475569',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {tab.label}
                  <span
                    style={{
                      background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: active ? '#fff' : '#64748b',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Filter Controls Card */}
        <div className="complaints-filters-card" style={{ background: '#fff', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', alignItems: 'center' }}>
            
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search ID, Order, Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  border: '1px solid #DCE5F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Customer Filter */}
            <div>
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
              >
                <option value="">All Customers</option>
                {metaCustomers.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>

            {/* Order Filter */}
            <div>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
              >
                <option value="">All Orders</option>
                {metaOrders.map((o) => (
                  <option key={o.id} value={o.id}>{o.orderNumber || o.orderNo}</option>
                ))}
              </select>
            </div>

            {/* Complaint Type */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
              >
                <option value="">All Complaint Types</option>
                {COMPLAINT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Status Filter (Super Sales) */}
            {!isPlantHead && (
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Plant Head Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            )}

            {/* Date Filter */}
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
              />
            </div>

            {/* Reset Filters */}
            {(searchQuery || customerFilter || orderFilter || typeFilter || priorityFilter || dateFilter || (statusFilter !== 'ALL' && !isPlantHead)) && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCustomerFilter('');
                    setOrderFilter('');
                    setTypeFilter('');
                    setPriorityFilter('');
                    setStatusFilter('ALL');
                    setDateFilter('');
                  }}
                  style={{
                    padding: '8px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Complaints Table Card */}
        <div className="complaints-table-card" style={{ background: '#fff', border: '1px solid #DCE5F0', borderRadius: '12px', overflow: 'hidden' }}>
          <div className="complaints-table-scroll" style={{ overflowX: 'auto' }}>
            <table className="complaints-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>Complaint ID</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>Order</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>Customer</th>
                  {isPlantHead && <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>Sales Person</th>}
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>Product</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>Complaint Type</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>Priority</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isPlantHead ? 10 : 9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      Loading complaints...
                    </td>
                  </tr>
                ) : displayComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={isPlantHead ? 10 : 9} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No customer complaints found matching criteria.
                    </td>
                  </tr>
                ) : (
                  displayComplaints.map((c) => {
                    const badge = getStatusBadge(c.status);
                    const pBadge = getPriorityBadge(c.priority);
                    const isPending =
                      c.status === 'PENDING_PLANT_HEAD' ||
                      c.status === 'PENDING_SUPER_ADMIN' ||
                      c.status === 'SUBMITTED';

                    // Products summary
                    const itemsCount = c.items?.length || (c.product ? 1 : 0);
                    const primaryProdName =
                      c.items?.[0]?.product?.name ||
                      c.items?.[0]?.orderItem?.productNameSnapshot ||
                      c.product?.name ||
                      'Product';

                    return (
                      <tr
                        key={c.id}
                        style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedComplaint(c);
                          setShowDetailModal(true);
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: '800', color: '#2F4375', fontFamily: 'monospace' }}>
                          {c.complaintNo}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#1e293b' }}>
                          {c.order?.orderNumber || c.order?.orderNo || '—'}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#334155' }}>
                          {c.customer?.companyName || '—'}
                        </td>
                        {isPlantHead && (
                          <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>
                            {c.salesExecutive?.name || 'Sales Executive'}
                          </td>
                        )}
                        <td style={{ padding: '14px 16px', color: '#334155' }}>
                          <span style={{ fontWeight: '600' }}>{primaryProdName}</span>
                          {itemsCount > 1 && (
                            <span style={{ marginLeft: '6px', fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '10px' }}>
                              +{itemsCount - 1} more
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>
                          {c.complaintType}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              background: pBadge.bg,
                              color: pBadge.color,
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                            }}
                          >
                            {c.priority}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                          {formatDate(c.complaintDate || c.createdAt)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              display: 'inline-block',
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedComplaint(c);
                                setShowDetailModal(true);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: '#f8fafc',
                                border: '1px solid #DCE5F0',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: '#2F4375',
                                cursor: 'pointer',
                              }}
                            >
                              {isPlantHead && isPending ? 'Review' : 'View'}
                            </button>

                            {!isPlantHead && c.status === 'DRAFT' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDraft(c)}
                                style={{
                                  padding: '6px 8px',
                                  background: '#fff1f2',
                                  border: '1px solid #fecdd3',
                                  borderRadius: '6px',
                                  color: '#e11d48',
                                  cursor: 'pointer',
                                }}
                                title="Delete Draft"
                              >
                                <Trash2 size={14} />
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

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CREATE COMPLAINT MODAL (SUPER SALES)                          */}
        {/* ───────────────────────────────────────────────────────────── */}
        {showCreateModal && (
          <div
            className="complaint-modal-overlay"
            onClick={() => setShowCreateModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              padding: '16px',
            }}
          >
            <div
              className="complaint-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                width: 'min(860px, 100%)',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>
                    Create Customer Complaint
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                    Select customer, choose order, specify affected products and complaint details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Modal Form Body */}
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Customer & Order Selection Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Select Customer */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Select Customer *
                    </label>
                    <select
                      data-testid="select-complaint-customer"
                      value={formCustomerId}
                      onChange={(e) => {
                        setFormCustomerId(e.target.value);
                        setFormOrderId('');
                      }}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13.5px', background: '#fff' }}
                      required
                    >
                      <option value="">-- Choose Customer --</option>
                      {metaCustomers.map((cust) => (
                        <option key={cust.id} value={cust.id}>
                          {cust.companyName} {cust.customerCode ? `(${cust.customerCode})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Order */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Select Order *
                    </label>
                    <select
                      data-testid="select-complaint-order"
                      value={formOrderId}
                      onChange={(e) => setFormOrderId(e.target.value)}
                      disabled={!formCustomerId}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #DCE5F0',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        background: formCustomerId ? '#fff' : '#f8fafc',
                      }}
                      required
                    >
                      <option value="">{formCustomerId ? '-- Choose Customer Order --' : 'Select Customer First'}</option>
                      {availableOrdersForCustomer.map((ord) => (
                        <option key={ord.id} value={ord.id}>
                          {ord.orderNumber || ord.orderNo} ({formatDate(ord.orderDate)}) - {formatCurrency(ord.totalAmount)}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* 2. Auto-loaded Order Information Banner */}
                {selectedOrderObj && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px 18px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '12px',
                      fontSize: '12.5px',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: '700' }}>ORDER NO</span>
                      <strong style={{ color: '#1e293b' }}>{selectedOrderObj.orderNumber || selectedOrderObj.orderNo}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: '700' }}>ORDER DATE</span>
                      <strong style={{ color: '#1e293b' }}>{formatDate(selectedOrderObj.orderDate)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: '700' }}>CUSTOMER</span>
                      <strong style={{ color: '#1e293b' }}>{selectedOrderObj.customerName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: '700' }}>SALES PERSON</span>
                      <strong style={{ color: '#1e293b' }}>{selectedOrderObj.salesPersonName || 'Salesperson'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: '700' }}>STATUS</span>
                      <strong style={{ color: '#2563eb' }}>{selectedOrderObj.status}</strong>
                    </div>
                  </div>
                )}

                {/* 3. Ordered Products Table (Show ALL products from order) */}
                {selectedOrderObj && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                      Select Affected Product(s) & Specify Complaint Quantity *
                    </label>
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                      <table data-testid="complaint-products-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                            <th style={{ padding: '10px 14px', width: '40px', textAlign: 'center' }}>Select</th>
                            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Product</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Ordered Qty</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Delivered Qty</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#475569', width: '170px' }}>Complaint Qty *</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(formSelectedProducts).map((prod) => (
                            <tr key={prod.productId} style={{ borderBottom: '1px solid #f1f5f9', background: prod.selected ? '#ffffff' : '#fcfcfc' }}>
                              <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                <input
                                  data-testid={`checkbox-product-${prod.orderItemId || prod.productId}`}
                                  type="checkbox"
                                  checked={prod.selected}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setFormSelectedProducts((prev) => ({
                                      ...prev,
                                      [prod.productId]: { ...prev[prod.productId], selected: checked },
                                    }));
                                  }}
                                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                              </td>
                              <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e293b' }}>
                                {prod.productName}
                                {prod.sku && <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>SKU: {prod.sku}</span>}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                                {prod.orderedQuantity} {prod.unit}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                                {prod.deliveredQuantity} {prod.unit}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                <input
                                  data-testid={`input-complaint-qty-${prod.orderItemId || prod.productId}`}
                                  type="number"
                                  min="0.01"
                                  max={prod.orderedQuantity}
                                  step="any"
                                  disabled={!prod.selected}
                                  value={prod.complaintQuantity}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormSelectedProducts((prev) => ({
                                      ...prev,
                                      [prod.productId]: { ...prev[prod.productId], complaintQuantity: val },
                                    }));
                                  }}
                                  style={{
                                    width: '120px',
                                    padding: '6px 10px',
                                    border: '1px solid #DCE5F0',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    textAlign: 'right',
                                    background: prod.selected ? '#fff' : '#f1f5f9',
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Complaint Type, Priority, Date */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Complaint Type *
                    </label>
                    <select
                      data-testid="select-complaint-type"
                      value={formComplaintType}
                      onChange={(e) => setFormComplaintType(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
                      required
                    >
                      {COMPLAINT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Priority *
                    </label>
                    <select
                      data-testid="select-complaint-priority"
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
                      required
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Complaint Date *
                    </label>
                    <input
                      data-testid="input-complaint-date"
                      type="date"
                      value={formComplaintDate}
                      onChange={(e) => setFormComplaintDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
                      required
                    />
                  </div>

                </div>

                {/* 5. Subject */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Subject / Summary *
                  </label>
                  <input
                    data-testid="input-complaint-subject"
                    type="text"
                    placeholder="e.g. Broken tiles upon delivery / Color variation detected"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13.5px', background: '#fff' }}
                    required
                  />
                </div>

                {/* 6. Complaint Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Complaint Description *
                  </label>
                  <textarea
                    data-testid="textarea-complaint-description"
                    rows={3}
                    placeholder="Detailed explanation of the customer complaint and defect findings..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13.5px', resize: 'vertical' }}
                    required
                  />
                </div>

                {/* 7. Sales Remarks */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Sales Remarks *
                  </label>
                  <textarea
                    data-testid="textarea-complaint-remarks"
                    rows={2}
                    placeholder="Sales executive analysis and recommended resolution for Plant Head..."
                    value={formSalesRemarks}
                    onChange={(e) => setFormSalesRemarks(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #DCE5F0', borderRadius: '8px', fontSize: '13.5px', resize: 'vertical' }}
                    required
                  />
                </div>

                {/* 8. Attachment Upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Evidence Attachment (Photo / Document)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingAttachment}
                      style={{ fontSize: '13px' }}
                    />
                    {uploadingAttachment && <span style={{ fontSize: '12px', color: '#2563eb' }}>Uploading...</span>}
                    {formAttachment && (
                      <a href={formAttachment} target="_blank" rel="noreferrer" style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: '600' }}>
                        View Uploaded File
                      </a>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer with Actions */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #E2E8F0',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={saving}
                  style={{
                    padding: '10px 18px',
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  data-testid="btn-save-draft"
                  type="button"
                  onClick={() => handleSubmitComplaint('DRAFT')}
                  disabled={saving}
                  style={{
                    padding: '10px 18px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#1e293b',
                    cursor: 'pointer',
                  }}
                >
                  Save Draft
                </button>
                <button
                  data-testid="btn-submit-plant-head"
                  type="button"
                  onClick={() => handleSubmitComplaint('SUBMIT')}
                  disabled={saving}
                  style={{
                    padding: '10px 22px',
                    background: '#2F4375',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(47,67,117,0.3)',
                  }}
                >
                  {saving ? 'Submitting...' : 'Submit to Plant Head'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* COMPLAINT DETAILS & PLANT HEAD DECISION MODAL                  */}
        {/* ───────────────────────────────────────────────────────────── */}
        {showDetailModal && selectedComplaint && (() => {
          const badge = getStatusBadge(selectedComplaint.status);
          const pBadge = getPriorityBadge(selectedComplaint.priority);
          const isPending =
            selectedComplaint.status === 'PENDING_PLANT_HEAD' ||
            selectedComplaint.status === 'PENDING_SUPER_ADMIN' ||
            selectedComplaint.status === 'SUBMITTED';

          return (
            <div
              className="complaint-modal-overlay"
              onClick={() => setShowDetailModal(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                padding: '16px',
              }}
            >
              <div
                className="complaint-modal"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  width: 'min(860px, 100%)',
                  maxHeight: '92vh',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '18px', color: '#2F4375' }}>
                        {selectedComplaint.complaintNo}
                      </span>
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '800',
                        }}
                      >
                        {badge.label}
                      </span>
                      <span
                        style={{
                          background: pBadge.bg,
                          color: pBadge.color,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                        }}
                      >
                        {selectedComplaint.priority} Priority
                      </span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Created: {formatDate(selectedComplaint.complaintDate || selectedComplaint.createdAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDetailModal(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Top Key Info Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>CUSTOMER</span>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                        {selectedComplaint.customer?.companyName || '—'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedComplaint.customer?.customerCode}</div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SALES ORDER</span>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                        {selectedComplaint.order?.orderNumber || '—'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                        Value: {formatCurrency(selectedComplaint.order?.totalAmount || 0)} ({selectedComplaint.order?.status})
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SALES EXECUTIVE</span>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                        {selectedComplaint.salesExecutive?.name || 'Sales Representative'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedComplaint.complaintType}</div>
                    </div>
                  </div>

                  {/* Affected Products Table */}
                  <div>
                    <h3 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '800', color: '#334155' }}>
                      Affected Order Products
                    </h3>
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Product</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Ordered Qty</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Delivered Qty</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>Complaint Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedComplaint.items && selectedComplaint.items.length > 0 ? (
                            selectedComplaint.items.map((it) => (
                              <tr key={it.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e293b' }}>
                                  {it.orderItem?.productNameSnapshot || it.product?.name || 'Product'}
                                  {it.product?.sku && <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>SKU: {it.product.sku}</span>}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                                  {Number(it.orderedQuantity || 0)} {it.orderItem?.unit || 'Units'}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                                  {Number(it.deliveredQuantity || it.orderedQuantity || 0)} {it.orderItem?.unit || 'Units'}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>
                                  {Number(it.complaintQuantity || 0)} {it.orderItem?.unit || 'Units'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e293b' }}>
                                {selectedComplaint.product?.name || 'Product'}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>—</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#475569' }}>—</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>All / Specified</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Complaint Description & Remarks */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                        SUBJECT
                      </span>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                        {selectedComplaint.subject}
                      </div>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                        COMPLAINT DESCRIPTION
                      </span>
                      <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        {selectedComplaint.description}
                      </div>
                    </div>

                    {selectedComplaint.salesRemarks && (
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                          SALES REMARKS
                        </span>
                        <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          {selectedComplaint.salesRemarks}
                        </div>
                      </div>
                    )}

                    {selectedComplaint.attachment && (
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                          ATTACHMENT
                        </span>
                        <a
                          href={selectedComplaint.attachment}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                            color: '#1d4ed8',
                            fontSize: '13px',
                            fontWeight: '700',
                            textDecoration: 'none',
                          }}
                        >
                          <Paperclip size={16} /> View Evidence Attachment <ExternalLink size={14} />
                        </a>
                      </div>
                    )}

                    {/* Rejection / Loss details */}
                    {selectedComplaint.rejectionReason && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#b91c1c', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                          REJECTION REASON
                        </span>
                        <div style={{ fontSize: '13.5px', color: '#991b1b', fontWeight: '600' }}>
                          {selectedComplaint.rejectionReason}
                        </div>
                      </div>
                    )}

                    {selectedComplaint.status === 'APPROVED' && selectedComplaint.lossRecord && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                          TRANSACTIONAL IMPACT RECORDED
                        </span>
                        <div style={{ fontSize: '13px', color: '#166534' }}>
                          Order marked as <strong>LOST</strong>. Deducted {formatCurrency(selectedComplaint.lossRecord.lostValue)} on {formatDate(selectedComplaint.lossRecord.lostDate)}.
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Decisions for Plant Head */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #E2E8F0',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowDetailModal(false)}
                    style={{
                      padding: '9px 18px',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>

                  {isPlantHead && isPending && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        data-testid="btn-plant-head-reject"
                        type="button"
                        onClick={() => handlePlantHeadReject(selectedComplaint)}
                        style={{
                          padding: '10px 20px',
                          background: '#fff',
                          border: '1.5px solid #dc2626',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          fontWeight: '800',
                          color: '#dc2626',
                          cursor: 'pointer',
                        }}
                      >
                        Reject Complaint
                      </button>
                      <button
                        data-testid="btn-plant-head-approve"
                        type="button"
                        onClick={() => handlePlantHeadApprove(selectedComplaint)}
                        style={{
                          padding: '10px 24px',
                          background: '#16a34a',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          fontWeight: '800',
                          color: '#fff',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                        }}
                      >
                        Approve & Mark Order LOST
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
