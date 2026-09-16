'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  ChevronDown,
  Filter,
  Receipt,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import { useERPStore } from '@/store/erpStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import './CustomerComplaints.css';

const COMPLAINT_TYPES = [
  'Product Quality',
  'Wrong Product',
  'Damaged Product',
  'Short Quantity',
  'Excess Quantity',
  'Missing Product',
  'Product Defect',
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
  if (s === 'PLANT_HEAD_PENDING' || s === 'PENDING_PLANT_HEAD' || s === 'PENDING_SUPER_ADMIN' || s === 'SUBMITTED' || s === 'PENDING') {
    return { label: 'Plant Head Pending', bg: '#fef3c7', color: '#b45309', border: '#fcd34d' };
  }
  if (s === 'DISPATCH_PENDING') {
    return { label: 'Dispatch Pending', bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' };
  }
  if (s === 'DISPATCH_COMPLETED') {
    return { label: 'Dispatch Completed', bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' };
  }
  if (s === 'FINANCE_PENDING') {
    return { label: 'Finance Pending', bg: '#ffedd5', color: '#c2410c', border: '#fed7aa' };
  }
  if (s === 'RESOLVED') {
    return { label: 'Resolved', bg: '#dcfce7', color: '#15803d', border: '#86efac' };
  }
  if (s === 'REJECTED') {
    return { label: 'Rejected', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
  }
  if (s === 'APPROVED') {
    return { label: 'Approved', bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' };
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

  // Smart Customer Search State for Create Modal
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [highlightedCustomerIndex, setHighlightedCustomerIndex] = useState(-1);
  const customerSearchRef = useRef(null);
  const customerSearchInputRef = useRef(null);
  const customerListRef = useRef(null);

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
      
      const st = isPlantHead ? 'ALL' : statusFilter;
      if (st && st !== 'ALL') params.set('status', st);
      if (isPlantHead) params.set('status', 'ALL');

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
  }, [isPlantHead, statusFilter, searchQuery, customerFilter, orderFilter, typeFilter, priorityFilter]);

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

  // Precompute map of order count per customer
  const customerOrderCountMap = useMemo(() => {
    const map = {};
    metaOrders.forEach((o) => {
      if (o.customerId) {
        map[o.customerId] = (map[o.customerId] || 0) + 1;
      }
    });
    return map;
  }, [metaOrders]);

  // Levenshtein distance for fuzzy matching (supports typos like "sharron" -> "SHANNON")
  const levenshteinDistance = useCallback((a, b) => {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) return bn;
    if (bn === 0) return an;
    const matrix = Array(an + 1).fill(0).map(() => Array(bn + 1).fill(0));
    for (let i = 0; i <= an; i++) matrix[i][0] = i;
    for (let j = 0; j <= bn; j++) matrix[0][j] = j;
    for (let i = 1; i <= an; i++) {
      for (let j = 1; j <= bn; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[an][bn];
  }, []);

  const scoreCustomerMatch = useCallback((cust, query) => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return 100;

    const name = (cust.companyName || '').toLowerCase();
    const code = (cust.customerCode || '').toLowerCase();
    const contact = (cust.contactPerson || '').toLowerCase();
    const phone = (cust.phone || '').toLowerCase();
    const email = (cust.email || '').toLowerCase();
    const words = name.split(/\s+/).filter(Boolean);

    // 1. Exact start of company name (e.g. "SHANNON PROJECTS LLP" for "sha")
    if (name.startsWith(q)) return 1000 - (name.length - q.length);

    // 2. Start of any word in company name (e.g. "SUPER SHALIGRAM" for "sha")
    if (words.some((w) => w.startsWith(q))) return 800;

    // 3. Substring in company name (e.g. "VISHAN" for "sha")
    if (name.includes(q)) return 600 - name.indexOf(q);

    // 4. Code match
    if (code.includes(q)) return 400;

    // 5. Contact person / phone / email match
    if (contact.includes(q) || phone.includes(q) || email.includes(q)) return 300;

    // 6. Fuzzy match (handles typos like "sharron" -> "SHANNON", edit distance <= 2)
    if (q.length >= 3) {
      for (const w of words) {
        if (Math.abs(w.length - q.length) <= 2) {
          const dist = levenshteinDistance(q, w);
          if (dist <= 2) return 200 - dist * 30;
        }
        if (w.length > q.length) {
          const prefix = w.slice(0, q.length);
          const dist = levenshteinDistance(q, prefix);
          if (dist <= 1) return 180 - dist * 30;
        }
      }
    }

    return 0;
  }, [levenshteinDistance]);

  // Filtered & ranked customers for the Create modal smart search
  const filteredCustomersForCreate = useMemo(() => {
    if (!customerSearchQuery.trim()) {
      return metaCustomers;
    }
    const scored = [];
    for (const c of metaCustomers) {
      const score = scoreCustomerMatch(c, customerSearchQuery);
      if (score > 0) {
        scored.push({ customer: c, score });
      }
    }
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.customer.companyName || '').localeCompare(b.customer.companyName || '');
    });
    return scored.map((s) => s.customer);
  }, [metaCustomers, customerSearchQuery, scoreCustomerMatch]);

  const selectedCustomerObj = useMemo(() => {
    if (!formCustomerId) return null;
    return metaCustomers.find((c) => c.id === formCustomerId) || null;
  }, [formCustomerId, metaCustomers]);

  // Click outside to close customer dropdown and sync display name
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customerSearchRef.current && !customerSearchRef.current.contains(e.target)) {
        setIsCustomerSearchOpen(false);
        if (selectedCustomerObj) {
          setCustomerSearchQuery(selectedCustomerObj.companyName);
        } else {
          setCustomerSearchQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCustomerObj]);

  const handleSelectCustomer = useCallback((customer) => {
    if (!customer) {
      setFormCustomerId('');
      setCustomerSearchQuery('');
      setFormOrderId('');
      setIsCustomerSearchOpen(false);
      setHighlightedCustomerIndex(-1);
      return;
    }
    setFormCustomerId(customer.id);
    setCustomerSearchQuery(customer.companyName);
    setIsCustomerSearchOpen(false);
    setHighlightedCustomerIndex(-1);

    // If this customer has exactly 1 order, auto-select it for operator convenience
    const ordersForCust = metaOrders.filter((o) => o.customerId === customer.id);
    if (ordersForCust.length === 1) {
      setFormOrderId(ordersForCust[0].id);
    } else {
      setFormOrderId('');
    }
  }, [metaOrders]);

  const scrollItemIntoView = (index) => {
    if (customerListRef.current) {
      const items = customerListRef.current.querySelectorAll('[data-cust-item]');
      if (items[index]) {
        items[index].scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const handleCustomerKeyDown = (e) => {
    if (!isCustomerSearchOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsCustomerSearchOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedCustomerIndex((prev) => {
        const next = prev < filteredCustomersForCreate.length - 1 ? prev + 1 : 0;
        scrollItemIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedCustomerIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredCustomersForCreate.length - 1;
        scrollItemIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedCustomerIndex >= 0 && highlightedCustomerIndex < filteredCustomersForCreate.length) {
        handleSelectCustomer(filteredCustomersForCreate[highlightedCustomerIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsCustomerSearchOpen(false);
    }
  };

  const renderHighlightedText = (text, query) => {
    if (!text || !query || !query.trim()) return text;
    const q = query.trim();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = String(text).split(regex);
      if (parts.length <= 1) {
        return text;
      }
      return parts.map((part, idx) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <span
            key={idx}
            style={{
              backgroundColor: '#fef08a',
              color: '#854d0e',
              fontWeight: '800',
              padding: '1px 3px',
              borderRadius: '3px',
            }}
          >
            {part}
          </span>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  const openCreateModal = () => {
    setFormCustomerId('');
    setCustomerSearchQuery('');
    setIsCustomerSearchOpen(false);
    setHighlightedCustomerIndex(-1);
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
      status: targetStatus === 'DRAFT' ? 'DRAFT' : 'PLANT_HEAD_PENDING',
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

    const { isConfirmed } = await Swal.fire({
      title: `Approve Complaint ${complaint.complaintNo}?`,
      html: `
        <div style="text-align:left; font-size:13.5px; line-height:1.6; color:#334155;">
          <p>Approving this complaint will forward it to <b>Dispatch</b> for physical inspection and evidence upload:</p>
          <ul style="margin:8px 0; padding-left:20px; font-weight:600;">
            <li>Complaint Status <span style="color:#6d28d9;">→ DISPATCH_PENDING</span></li>
            <li>Order <span style="color:#2563eb;">${orderNo}</span> remains intact</li>
            <li>Dispatch will inspect affected items and upload photo evidence before forwarding to Finance</li>
          </ul>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve & Send to Dispatch',
      confirmButtonColor: '#2563eb',
      cancelButtonText: 'Cancel',
    });

    if (!isConfirmed) return;

    try {
      await backendFetch(`/plant-head/complaints/${complaint.id}/approve`, {
        method: 'PUT',
        body: { adminRemarks: 'Approved by Plant Head, forwarded to Dispatch for physical verification.' },
      });

      Swal.fire({
        icon: 'success',
        title: 'Sent to Dispatch',
        text: `Complaint ${complaint.complaintNo} forwarded to Dispatch for physical inspection.`,
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
      if (isPlantHead && activeTab && activeTab !== 'ALL') {
        const s = String(c.status || '').toUpperCase();
        if (activeTab === 'PLANT_HEAD_PENDING') {
          if (!['PLANT_HEAD_PENDING', 'PENDING_PLANT_HEAD', 'SUBMITTED', 'PENDING'].includes(s)) return false;
        } else if (activeTab === 'HISTORY') {
          if (!['RESOLVED', 'REJECTED', 'CLOSED'].includes(s)) return false;
        } else if (s !== activeTab) {
          return false;
        }
      }
      return true;
    });
  }, [complaints, dateFilter, isPlantHead, activeTab]);

  // Status Counts for Summary
  const stats = useMemo(() => {
    const total = complaints.length;
    const plantHeadPending = complaints.filter((c) => {
      const s = String(c.status).toUpperCase();
      return s === 'PLANT_HEAD_PENDING' || s === 'PENDING_PLANT_HEAD' || s === 'SUBMITTED' || s === 'PENDING';
    }).length;
    const dispatchPending = complaints.filter((c) => String(c.status).toUpperCase() === 'DISPATCH_PENDING').length;
    const financePending = complaints.filter((c) => String(c.status).toUpperCase() === 'FINANCE_PENDING').length;
    const resolved = complaints.filter((c) => String(c.status).toUpperCase() === 'RESOLVED').length;
    const rejected = complaints.filter((c) => String(c.status).toUpperCase() === 'REJECTED').length;
    const history = complaints.filter((c) => ['RESOLVED', 'REJECTED', 'CLOSED'].includes(String(c.status).toUpperCase())).length;
    return { total, pending: plantHeadPending, plantHeadPending, dispatchPending, financePending, resolved, rejected, history };
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
                ? 'Review customer complaints and authorize forwarding to Dispatch for physical inspection.'
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
              { id: 'PLANT_HEAD_PENDING', label: 'Pending Review', count: stats.plantHeadPending },
              { id: 'DISPATCH_PENDING', label: 'Sent to Dispatch', count: stats.dispatchPending },
              { id: 'FINANCE_PENDING', label: 'In Finance', count: stats.financePending },
              { id: 'RESOLVED', label: 'Resolved', count: stats.resolved },
              { id: 'REJECTED', label: 'Rejected', count: stats.rejected },
              { id: 'HISTORY', label: 'History', count: stats.history },
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
                  <option value="PLANT_HEAD_PENDING">Plant Head Pending</option>
                  <option value="DISPATCH_PENDING">Dispatch Pending</option>
                  <option value="FINANCE_PENDING">Finance Pending</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
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
              backgroundColor: 'rgba(15, 23, 42, 0.68)',
              backdropFilter: 'blur(6px)',
              padding: '16px',
            }}
          >
            <div
              className="complaint-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#f8fafc',
                borderRadius: '20px',
                width: 'min(940px, 98vw)',
                maxHeight: '94vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '20px 28px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#60a5fa',
                      flexShrink: 0,
                    }}
                  >
                    <FilePenLine size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                        Create Customer Complaint
                      </h2>
                      <span
                        style={{
                          background: 'rgba(96, 165, 250, 0.2)',
                          color: '#93c5fd',
                          border: '1px solid rgba(147, 197, 253, 0.35)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Sales Ticket
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#cbd5e1', fontWeight: '400' }}>
                      Select customer, choose order, specify affected products and complaint details.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    color: '#e2e8f0',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form Body */}
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* ── CARD 1: Customer & Sales Order Association ── */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '18px 20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  {/* Section Title */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #dbeafe',
                        }}
                      >
                        01
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Customer & Sales Order
                      </span>
                    </div>

                    {selectedCustomerObj && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#059669',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '3px 9px',
                          borderRadius: '12px',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        Customer Selected
                      </span>
                    )}
                  </div>

                  {/* Customer Search & Order Dropdown Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: '16px',
                      position: 'relative',
                      zIndex: isCustomerSearchOpen ? 50 : 2,
                    }}
                  >
                    {/* Customer Combobox */}
                    <div ref={customerSearchRef} style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Select Customer <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search
                          size={16}
                          style={{
                            position: 'absolute',
                            left: '12px',
                            color: isCustomerSearchOpen || selectedCustomerObj ? '#2563eb' : '#94a3b8',
                            pointerEvents: 'none',
                          }}
                        />
                        <input
                          ref={customerSearchInputRef}
                          type="text"
                          data-testid="smart-search-complaint-customer"
                          placeholder="Type customer name (e.g. DAKSH, TATA)..."
                          value={customerSearchQuery}
                          onFocus={() => setIsCustomerSearchOpen(true)}
                          onChange={(e) => {
                            setCustomerSearchQuery(e.target.value);
                            if (!isCustomerSearchOpen) setIsCustomerSearchOpen(true);
                            setHighlightedCustomerIndex(0);
                          }}
                          onKeyDown={handleCustomerKeyDown}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 64px 0 36px',
                            border: `1.5px solid ${isCustomerSearchOpen ? '#2563eb' : selectedCustomerObj ? '#93c5fd' : '#cbd5e1'}`,
                            borderRadius: '10px',
                            fontSize: '13.5px',
                            background: selectedCustomerObj && !isCustomerSearchOpen ? '#f0f9ff' : '#ffffff',
                            color: '#0f172a',
                            fontWeight: selectedCustomerObj ? '600' : '400',
                            outline: 'none',
                            boxShadow: isCustomerSearchOpen ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        />

                        {/* Right action controls */}
                        <div style={{ position: 'absolute', right: '8px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {customerSearchQuery && (
                            <button
                              type="button"
                              title="Clear search"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCustomer(null);
                                customerSearchInputRef.current?.focus();
                              }}
                              style={{
                                background: '#e2e8f0',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#475569',
                                padding: 0,
                              }}
                            >
                              <X size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomerSearchOpen((prev) => !prev);
                              customerSearchInputRef.current?.focus();
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#64748b',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <ChevronDown
                              size={16}
                              style={{
                                transform: isCustomerSearchOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Hidden input for HTML validation and test compatibility */}
                      <input
                        type="hidden"
                        data-testid="select-complaint-customer"
                        value={formCustomerId}
                        required
                      />

                      {/* Customer Dropdown Results */}
                      {isCustomerSearchOpen && (
                        <div
                          ref={customerListRef}
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0,
                            right: 0,
                            zIndex: 100,
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.2), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
                            maxHeight: '280px',
                            overflowY: 'auto',
                            padding: '6px 0',
                          }}
                        >
                          <div
                            style={{
                              padding: '6px 12px',
                              fontSize: '11px',
                              fontWeight: '700',
                              color: '#64748b',
                              borderBottom: '1px solid #f1f5f9',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: '#f8fafc',
                            }}
                          >
                            <span>
                              {filteredCustomersForCreate.length}{' '}
                              {filteredCustomersForCreate.length === 1 ? 'Customer' : 'Customers'}
                              {customerSearchQuery.trim() ? ` matching "${customerSearchQuery}"` : ' available'}
                            </span>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                              ↑↓ to navigate, Enter to select
                            </span>
                          </div>

                          {filteredCustomersForCreate.length === 0 ? (
                            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                              <AlertCircle size={24} style={{ margin: '0 auto 8px', color: '#f59e0b' }} />
                              <div>No customers found matching <b>"{customerSearchQuery}"</b></div>
                              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                                Check spelling or try searching by customer code or phone.
                              </div>
                            </div>
                          ) : (
                            filteredCustomersForCreate.map((cust, idx) => {
                              const isSelected = cust.id === formCustomerId;
                              const isHighlighted = idx === highlightedCustomerIndex;
                              const orderCount = customerOrderCountMap[cust.id] || 0;

                              return (
                                <div
                                  key={cust.id}
                                  data-cust-item
                                  onMouseEnter={() => setHighlightedCustomerIndex(idx)}
                                  onClick={() => handleSelectCustomer(cust)}
                                  style={{
                                    padding: '9px 12px',
                                    cursor: 'pointer',
                                    background: isSelected
                                      ? '#e0f2fe'
                                      : isHighlighted
                                      ? '#f1f5f9'
                                      : 'transparent',
                                    borderLeft: isSelected
                                      ? '4px solid #0284c7'
                                      : isHighlighted
                                      ? '4px solid #94a3b8'
                                      : '4px solid transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '10px',
                                    transition: 'background-color 0.1s',
                                  }}
                                >
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div
                                      style={{
                                        fontSize: '13px',
                                        fontWeight: isSelected ? '700' : '600',
                                        color: isSelected ? '#0369a1' : '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                      }}
                                    >
                                      <Building2 size={13} style={{ color: isSelected ? '#0284c7' : '#64748b', flexShrink: 0 }} />
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {renderHighlightedText(cust.companyName, customerSearchQuery)}
                                      </span>
                                    </div>

                                    <div
                                      style={{
                                        fontSize: '11px',
                                        color: '#64748b',
                                        marginTop: '2px',
                                        display: 'flex',
                                        gap: '8px',
                                        alignItems: 'center',
                                      }}
                                    >
                                      {cust.customerCode && (
                                        <span
                                          style={{
                                            fontFamily: 'monospace',
                                            background: '#f1f5f9',
                                            padding: '1px 5px',
                                            borderRadius: '4px',
                                            color: '#475569',
                                          }}
                                        >
                                          {renderHighlightedText(cust.customerCode, customerSearchQuery)}
                                        </span>
                                      )}
                                      {cust.phone && <span>📞 {cust.phone}</span>}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        padding: '2px 7px',
                                        borderRadius: '10px',
                                        background: orderCount > 0 ? '#ecfdf5' : '#fef2f2',
                                        color: orderCount > 0 ? '#047857' : '#b91c1c',
                                        border: `1px solid ${orderCount > 0 ? '#a7f3d0' : '#fecaca'}`,
                                      }}
                                    >
                                      {orderCount} {orderCount === 1 ? 'Order' : 'Orders'}
                                    </span>

                                    {isSelected && (
                                      <CheckCircle2 size={16} style={{ color: '#0284c7' }} />
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* Selected Customer Mini Card */}
                      {selectedCustomerObj && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '8px 12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={13} style={{ color: '#2563eb' }} />
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{selectedCustomerObj.companyName}</span>
                            {selectedCustomerObj.customerCode && (
                              <span style={{ fontFamily: 'monospace', fontSize: '11px', background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px', color: '#475569' }}>
                                {selectedCustomerObj.customerCode}
                              </span>
                            )}
                          </div>
                          <span style={{ color: '#0369a1', fontWeight: '600', fontSize: '11px' }}>
                            {customerOrderCountMap[selectedCustomerObj.id] === 1 ? '• 1 Order auto-selected' : `• ${customerOrderCountMap[selectedCustomerObj.id] || 0} Orders available`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Order Selection */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Select Order <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          data-testid="select-complaint-order"
                          value={formOrderId}
                          onChange={(e) => setFormOrderId(e.target.value)}
                          disabled={!formCustomerId}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 36px 0 12px',
                            border: `1.5px solid ${formOrderId ? '#93c5fd' : '#cbd5e1'}`,
                            borderRadius: '10px',
                            fontSize: '13.5px',
                            background: formCustomerId ? '#ffffff' : '#f8fafc',
                            color: formOrderId ? '#0f172a' : '#64748b',
                            fontWeight: formOrderId ? '600' : '400',
                            appearance: 'none',
                            outline: 'none',
                            cursor: formCustomerId ? 'pointer' : 'not-allowed',
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
                        <ChevronDown
                          size={16}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#64748b',
                            pointerEvents: 'none',
                          }}
                        />
                      </div>
                      {formCustomerId && availableOrdersForCustomer.length === 0 && (
                        <div style={{ marginTop: '5px', fontSize: '11.5px', color: '#dc2626' }}>
                          No eligible orders found for this customer.
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Order Information Banner */}
                  {selectedOrderObj && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                        border: '1px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '12px',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          <FileText size={11} style={{ color: '#2563eb' }} /> ORDER NO
                        </span>
                        <strong style={{ color: '#0f172a', fontSize: '13.5px', marginTop: '2px', display: 'block' }}>
                          {selectedOrderObj.orderNumber || selectedOrderObj.orderNo}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          <Calendar size={11} style={{ color: '#2563eb' }} /> ORDER DATE
                        </span>
                        <strong style={{ color: '#0f172a', fontSize: '13.5px', marginTop: '2px', display: 'block' }}>
                          {formatDate(selectedOrderObj.orderDate)}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          <Building2 size={11} style={{ color: '#2563eb' }} /> CUSTOMER
                        </span>
                        <strong style={{ color: '#0f172a', fontSize: '13.5px', marginTop: '2px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {selectedOrderObj.customerName}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          <User size={11} style={{ color: '#2563eb' }} /> SALES PERSON
                        </span>
                        <strong style={{ color: '#0f172a', fontSize: '13.5px', marginTop: '2px', display: 'block' }}>
                          {selectedOrderObj.salesPersonName || 'Salesperson'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          <Receipt size={11} style={{ color: '#059669' }} /> ORDER AMOUNT
                        </span>
                        <strong style={{ color: '#059669', fontSize: '13.5px', marginTop: '2px', display: 'block' }}>
                          {formatCurrency(selectedOrderObj.totalAmount)}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          STATUS
                        </span>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '2px',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          {selectedOrderObj.status}
                        </span>
                      </div>
                    </div>
                  )}

                </div>

                {/* ── CARD 2: Affected Products & Quantities ── */}
                {selectedOrderObj && (
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      padding: '18px 20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    {/* Header with Title & Quick Select Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #dbeafe',
                          }}
                        >
                          02
                        </span>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Affected Product(s) & Specify Complaint Quantity
                          </span>
                          <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                        </div>
                      </div>

                      {/* Selected count and Select All toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(() => {
                          const prods = Object.values(formSelectedProducts);
                          const selCount = prods.filter((p) => p.selected).length;
                          const allChecked = prods.length > 0 && selCount === prods.length;
                          return (
                            <>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: selCount > 0 ? '#2563eb' : '#64748b' }}>
                                {selCount} of {prods.length} selected
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormSelectedProducts((prev) => {
                                    const next = {};
                                    Object.values(prev).forEach((p) => {
                                      next[p.productId] = { ...p, selected: !allChecked };
                                    });
                                    return next;
                                  });
                                }}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc',
                                  color: '#334155',
                                  fontSize: '11.5px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                {allChecked ? 'Deselect All' : 'Select All'}
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Products Table */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                      <table data-testid="complaint-products-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                            <th style={{ padding: '10px 14px', width: '48px', textAlign: 'center' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Select</span>
                            </th>
                            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Product & SKU
                            </th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Ordered Qty
                            </th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Delivered Qty
                            </th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', width: '220px' }}>
                              Complaint Qty *
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(formSelectedProducts).map((prod) => {
                            const isQtyOver = Number(prod.complaintQuantity) > Number(prod.orderedQuantity);
                            const isQtyZero = !prod.complaintQuantity || Number(prod.complaintQuantity) <= 0;
                            return (
                              <tr
                                key={prod.productId}
                                style={{
                                  borderBottom: '1px solid #f1f5f9',
                                  background: prod.selected ? '#f8faff' : '#ffffff',
                                  borderLeft: prod.selected ? '3px solid #2563eb' : '3px solid transparent',
                                  transition: 'background 0.15s ease',
                                }}
                              >
                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
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
                                    style={{ cursor: 'pointer', width: '17px', height: '17px', accentColor: '#2563eb' }}
                                  />
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                  <div style={{ fontWeight: '700', color: prod.selected ? '#0f172a' : '#475569', fontSize: '13.5px' }}>
                                    {prod.productName}
                                  </div>
                                  {prod.sku && (
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        marginTop: '3px',
                                        fontSize: '11px',
                                        fontFamily: 'monospace',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        border: '1px solid #e2e8f0',
                                      }}
                                    >
                                      SKU: {prod.sku}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                                    {prod.orderedQuantity} {prod.unit}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#0369a1', background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px' }}>
                                    {prod.deliveredQuantity} {prod.unit}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                                          width: '100px',
                                          height: '34px',
                                          padding: '0 8px',
                                          border: `1.5px solid ${prod.selected && (isQtyOver || isQtyZero) ? '#f87171' : prod.selected ? '#93c5fd' : '#e2e8f0'}`,
                                          borderRadius: '8px',
                                          fontSize: '13px',
                                          fontWeight: '700',
                                          textAlign: 'right',
                                          background: prod.selected ? '#ffffff' : '#f8fafc',
                                          color: prod.selected ? '#0f172a' : '#94a3b8',
                                          outline: 'none',
                                        }}
                                      />
                                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginLeft: '4px' }}>
                                        {prod.unit}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      disabled={!prod.selected}
                                      onClick={() => {
                                        setFormSelectedProducts((prev) => ({
                                          ...prev,
                                          [prod.productId]: { ...prev[prod.productId], complaintQuantity: prod.deliveredQuantity || prod.orderedQuantity },
                                        }));
                                      }}
                                      title="Set to max delivered quantity"
                                      style={{
                                        padding: '4px 7px',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        background: '#f8fafc',
                                        color: '#475569',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        cursor: prod.selected ? 'pointer' : 'not-allowed',
                                        opacity: prod.selected ? 1 : 0.4,
                                      }}
                                    >
                                      Max
                                    </button>
                                  </div>
                                  {prod.selected && isQtyOver && (
                                    <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '3px', textAlign: 'right' }}>
                                      Exceeds ordered ({prod.orderedQuantity})
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── CARD 3: Classification & Urgency ── */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '18px 20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #dbeafe',
                      }}
                    >
                      03
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Classification & Priority
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.2fr 0.8fr', gap: '16px' }}>
                    {/* Complaint Type */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Complaint Type <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-testid="select-complaint-type"
                        list="complaint-types-list"
                        type="text"
                        placeholder="Type or select type..."
                        value={formComplaintType}
                        onChange={(e) => setFormComplaintType(e.target.value)}
                        style={{
                          width: '100%',
                          height: '38px',
                          padding: '0 12px',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          background: '#ffffff',
                          fontWeight: '600',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                        required
                      />
                      <datalist id="complaint-types-list">
                        {COMPLAINT_TYPES.map((t) => (
                          <option key={t} value={t} />
                        ))}
                      </datalist>

                      {/* Quick Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                        {COMPLAINT_TYPES.map((t) => {
                          const active = formComplaintType === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setFormComplaintType(t)}
                              style={{
                                padding: '3px 9px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: active ? '700' : '600',
                                border: active ? '1px solid #1e3a8a' : '1px solid #e2e8f0',
                                background: active ? '#1e3a8a' : '#f8fafc',
                                color: active ? '#ffffff' : '#475569',
                                cursor: 'pointer',
                                transition: 'all 0.1s ease',
                              }}
                            >
                              {active && '✓ '}{t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Priority <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-testid="select-complaint-priority"
                        list="priorities-list"
                        type="text"
                        placeholder="Type or select priority..."
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value)}
                        style={{
                          width: '100%',
                          height: '38px',
                          padding: '0 12px',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          background: '#ffffff',
                          fontWeight: '600',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                        required
                      />
                      <datalist id="priorities-list">
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>

                      {/* Styled 4 Priority Segment Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', marginTop: '8px' }}>
                        {PRIORITIES.map((p) => {
                          const active = formPriority === p;
                          const styles = {
                            Low: { bg: active ? '#10b981' : '#ecfdf5', color: active ? '#fff' : '#047857', border: '#a7f3d0' },
                            Medium: { bg: active ? '#0284c7' : '#eff6ff', color: active ? '#fff' : '#0369a1', border: '#bae6fd' },
                            High: { bg: active ? '#f59e0b' : '#fffbeb', color: active ? '#fff' : '#b45309', border: '#fde68a' },
                            Critical: { bg: active ? '#ef4444' : '#fef2f2', color: active ? '#fff' : '#b91c1c', border: '#fecaca' },
                          }[p] || { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' };

                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setFormPriority(p)}
                              style={{
                                padding: '6px 4px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: '700',
                                border: `1.5px solid ${active ? styles.bg : styles.border}`,
                                background: styles.bg,
                                color: styles.color,
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                                boxShadow: active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                              }}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Complaint Date */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Complaint Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        data-testid="input-complaint-date"
                        type="date"
                        value={formComplaintDate}
                        onChange={(e) => setFormComplaintDate(e.target.value)}
                        style={{
                          width: '100%',
                          height: '38px',
                          padding: '0 12px',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          background: '#ffffff',
                          fontWeight: '600',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ── CARD 4: Defect Summary & Remarks ── */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '18px 20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #dbeafe',
                      }}
                    >
                      04
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Defect Summary & Analysis
                    </span>
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Subject / Summary <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      data-testid="input-complaint-subject"
                      type="text"
                      placeholder="e.g. Broken tiles upon delivery / Color variation detected in batch #02"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 14px',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontWeight: '500',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>

                  {/* Description & Sales Remarks */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Complaint Description <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        data-testid="textarea-complaint-description"
                        rows={3}
                        placeholder="Detailed explanation of the customer complaint and defect findings..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          resize: 'vertical',
                          outline: 'none',
                          lineHeight: '1.5',
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Sales Remarks <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        data-testid="textarea-complaint-remarks"
                        rows={3}
                        placeholder="Sales executive analysis and recommended resolution for Plant Head..."
                        value={formSalesRemarks}
                        onChange={(e) => setFormSalesRemarks(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          resize: 'vertical',
                          outline: 'none',
                          lineHeight: '1.5',
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ── CARD 5: Evidence Attachment ── */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '18px 20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #dbeafe',
                        }}
                      >
                        05
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Evidence Attachment (Photo / Document)
                      </span>
                    </div>

                    {formAttachment && (
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} />
                        File Attached
                      </span>
                    )}
                  </div>

                  {/* Upload Box */}
                  <div
                    style={{
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: '#eff6ff',
                          border: '1px solid #dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2563eb',
                          flexShrink: 0,
                        }}
                      >
                        <Paperclip size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                          Upload Defect Photos or Documents
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                          PNG, JPG, PDF up to 15MB (photos of broken/damaged items, inspection report)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploadingAttachment}
                        style={{ fontSize: '12.5px', color: '#475569' }}
                      />
                      {uploadingAttachment && (
                        <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>
                          Uploading...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attached File Preview Card */}
                  {formAttachment && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
                        <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#065f46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Evidence file uploaded successfully
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={formAttachment}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#0284c7',
                            textDecoration: 'none',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#ffffff',
                            border: '1px solid #bae6fd',
                          }}
                        >
                          <ExternalLink size={12} />
                          View File
                        </a>
                        <button
                          type="button"
                          onClick={() => setFormAttachment('')}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: '3px 6px',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer with Actions */}
              <div
                style={{
                  padding: '16px 28px',
                  borderTop: '1px solid #e2e8f0',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedCustomerObj && selectedOrderObj ? (
                    <span style={{ color: '#047857', fontWeight: '600' }}>
                      Ready: <b>{selectedCustomerObj.companyName}</b> • Order <b>{selectedOrderObj.orderNumber || selectedOrderObj.orderNo}</b>
                    </span>
                  ) : (
                    <span>💡 Please select customer & order to proceed.</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={saving}
                    style={{
                      padding: '10px 18px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
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
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
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
                      padding: '10px 24px',
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {saving ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send size={15} />
                        Submit to Plant Head
                      </>
                    )}
                  </button>
                </div>
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
            selectedComplaint.status === 'PLANT_HEAD_PENDING' ||
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

                    {/* Dispatch Evidence Section */}
                    {selectedComplaint.dispatchEvidence && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                          ✓ DISPATCH INSPECTION EVIDENCE
                        </span>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <img
                            src={selectedComplaint.dispatchEvidence}
                            alt="Dispatch Inspection Evidence"
                            style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #86efac' }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', color: '#166534', fontWeight: '600' }}>
                              Notes: {selectedComplaint.dispatchRemarks || 'Inspected at dispatch bay'}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                              Completed by {selectedComplaint.dispatchCompletedBy || 'Dispatch Team'} on {formatDate(selectedComplaint.dispatchCompletedAt)}
                            </div>
                            <a
                              href={selectedComplaint.dispatchEvidence}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2563eb', marginTop: '6px', fontWeight: '700' }}
                            >
                              Enlarge Evidence <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Financial Resolution & Realization Section */}
                    {(selectedComplaint.status === 'RESOLVED' || selectedComplaint.financeApprovedReturnAmount !== null) && (
                      <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                          FINANCIAL ADJUSTMENT & SALES REALIZATION
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>ORIGINAL ORDER BILL</span>
                            <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>
                              {formatCurrency(selectedComplaint.originalBillAmount || selectedComplaint.order?.totalAmount)}
                            </div>
                          </div>

                          <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                            <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '700' }}>APPROVED RETURN DEDUCTION</span>
                            <div style={{ fontSize: '15px', fontWeight: '800', color: '#dc2626', marginTop: '2px' }}>
                              -{formatCurrency(selectedComplaint.financeApprovedReturnAmount)}
                            </div>
                          </div>

                          <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '700' }}>NET SALES REALIZATION</span>
                            <div style={{ fontSize: '15px', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>
                              {formatCurrency(
                                selectedComplaint.netOrderValue ??
                                Math.max(0, Number(selectedComplaint.originalBillAmount || selectedComplaint.order?.totalAmount || 0) - Number(selectedComplaint.financeApprovedReturnAmount || 0))
                              )}
                            </div>
                          </div>
                        </div>

                        {selectedComplaint.financeRemarks && (
                          <div style={{ fontSize: '12.5px', color: '#334155', background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <strong>Finance Remarks:</strong> {selectedComplaint.financeRemarks}
                            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                              Resolved by {selectedComplaint.financeResolvedBy || 'Finance'} on {formatDate(selectedComplaint.financeResolvedAt)}
                            </span>
                          </div>
                        )}
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
                          background: '#2563eb',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          fontWeight: '800',
                          color: '#fff',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                        }}
                      >
                        Approve & Send to Dispatch
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
