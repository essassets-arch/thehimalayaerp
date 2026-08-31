import { useState, useEffect, useMemo, useRef } from 'react';
import { calculateQuotationTotals, exportQuotationPDF, exportQuotationImage, shareQuotationImage } from '../services/export.service';
import { Search, Plus, Eye, ArrowRight, Download, Share2, Edit, Trash2, Truck, ChevronLeft, ChevronRight, ArrowLeft, FileText, Bell, ShieldCheck, ChevronDown, MoreVertical, User, Calendar, CreditCard, MapPin, Star, Phone, Mail, Globe, Percent, CheckSquare, Image } from 'lucide-react';
import Swal from 'sweetalert2';
import CreateQuotation from './CreateQuotation';
import { useERPStore } from '../shared/context/ERPContext';
import { resolveQuotationTerms } from '../services/sales/quotationTerms';
import ReminderModal from '../shared/components/ReminderModal.jsx';
import SalesOwnerBadge from './SalesOwnerBadge.jsx';
import {
  formatReminderDate,
  formatReminderTime,
  getNextPendingReminder,
  filterRemindersByBucket
} from '../shared/utils/reminderUtils.js';

export default function QuotationsView({
  quotations = [],
  reminders = [],
  leads = [],
  customers = [],
  onCreateQuoteClick,
  onCreateLead,
  onUpdateQuotationStatus,
  onUpdateQuotation,
  onConvertToOrder,
  onSendPDF,
  onSaveReminder,
  onUpdateReminder,
  onCompleteReminder,
  searchQuery,
  setSearchQuery,
  showCreateFormProp,
  prefilledCustomer,
  prefilledProduct,
  prefilledQuantity,
  prefilledPrice,
  isFromSample,
  onResetTransition,
  flat = false,
  isSuperSales = false,
  basePath = '/sales'
}) {
  const isSuperSalesContext = isSuperSales || (typeof window !== 'undefined' && window.location.pathname.startsWith('/supersales')) || basePath?.startsWith('/supersales');
  const paymentTermOptions = isSuperSalesContext
    ? ['Advance', '7 Days', '15 Days', '20 Days', '30 Days', '90 Days', 'Custom']
    : ['Advance', '7 Days', '15 Days', '20 Days', 'Custom'];
  const predefinedTerms = paymentTermOptions.filter(t => t !== 'Custom');
  const [localSearch, setLocalSearch] = useState('');
  const search = (searchQuery !== undefined && searchQuery !== null) ? searchQuery : localSearch;
  const setSearch = setSearchQuery !== undefined ? setSearchQuery : setLocalSearch;
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [filter, setFilter] = useState('All');
  const [reminderBucket, setReminderBucket] = useState('Today');
  const [reminderModal, setReminderModal] = useState(null);

  const [previewZoomMode, setPreviewZoomMode] = useState('fit'); // 'fit' | 'full'
  const [previewScale, setPreviewScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(1150);
  const quotationSheetRef = useRef(null);

  useEffect(() => {
    if (!selectedQuotation) return;
    const calculateScale = () => {
      if (typeof window === 'undefined') return;
      const availableWidth = Math.min(window.innerWidth - 16, 794);
      const scale = availableWidth < 794 ? (availableWidth / 794) : 1;
      setPreviewScale(scale);
      if (quotationSheetRef.current) {
        setSheetHeight(quotationSheetRef.current.scrollHeight || 1123);
      }
    };
    calculateScale();
    const timer = setTimeout(calculateScale, 150);
    window.addEventListener('resize', calculateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateScale);
    };
  }, [selectedQuotation, previewZoomMode]);

  // ── Inline Create Quotation Form toggle ──
  const [showCreateForm, setShowCreateForm] = useState(false);
  const draft = useERPStore(s => s.quotationDraft);

  useEffect(() => {
    if (showCreateFormProp || draft) {
      setShowCreateForm(true);
      if (onResetTransition && showCreateFormProp) {
        onResetTransition();
      }
    }
  }, [showCreateFormProp, onResetTransition, draft]);

  const handleAddQuotation = (qData) => {
    const quoteId = 'QT-' + Math.floor(1000 + Math.random() * 9000);
    const newQuotation = {
      id: quoteId,
      status: 'Sent',
      date: new Date().toISOString().split('T')[0],
      ...qData
    };
    if (typeof onCreateQuoteClick === 'function') {
      onCreateQuoteClick(newQuotation);
    }
    setShowCreateForm(false);
    Swal.fire({
      title: '✅ Quotation Published!',
      text: `Quotation ${quoteId} created for ${qData.customerName}.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title' }
    });
  };

  const [editingQuotation, setEditingQuotation] = useState(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editGstName, setEditGstName] = useState('');
  const [editGstNumber, setEditGstNumber] = useState('');
  const [editValidTill, setEditValidTill] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [editNotes, setEditNotes] = useState('');
  const [editPaymentTerms, setEditPaymentTerms] = useState('15 Days');
  const [editTransportCharge, setEditTransportCharge] = useState(0);
  const [editCustomerSearchOpen, setEditCustomerSearchOpen] = useState(false);

  const normalizeText = (value) => String(value || '').trim().toLowerCase();
  const renderQuotationProducts = (quotation) => {
    const rawItems = (Array.isArray(quotation?.items) && quotation.items.length > 0)
      ? quotation.items
      : (Array.isArray(quotation?.detailedItems) && quotation.detailedItems.length > 0)
        ? quotation.detailedItems
        : (Array.isArray(quotation?.lead?.detailedItems) && quotation.lead.detailedItems.length > 0)
          ? quotation.lead.detailedItems
          : (Array.isArray(quotation?.lead?.items) && quotation.lead.items.length > 0)
            ? quotation.lead.items
            : null;

    if (rawItems && rawItems.length > 0) {
      const first = rawItems[0];
      const prodName = first.productName || first.product || first.name || first.description || 'Product';
      const sizeCap = [first.size, first.capacity].filter(Boolean).join(' ');
      const mainLabel = sizeCap ? `${prodName} ${sizeCap}` : prodName;
      const qty = Number(first.quantity ?? first.qty ?? 0);
      const unit = first.unit || 'Qty';
      const qtyStr = qty > 0 ? `(${qty} ${unit})` : '';

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', wordBreak: 'break-word' }}>
              {mainLabel} {qtyStr}
            </span>
            {rawItems.length > 1 && (
              <span
                title={rawItems.map(i => `${i.productName || i.product || i.name || 'Item'} (${i.quantity || i.qty || 1} ${i.unit || 'Qty'})`).join('\n')}
                style={{
                  fontSize: '10.5px',
                  fontWeight: '800',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                +{rawItems.length - 1} more
              </span>
            )}
          </div>
        </div>
      );
    }

    if (typeof quotation?.items === 'string' && quotation.items.trim()) {
      const parts = quotation.items.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', wordBreak: 'break-word' }}>
                {parts[0]}
              </span>
              <span
                title={parts.join('\n')}
                style={{
                  fontSize: '10.5px',
                  fontWeight: '800',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                +{parts.length - 1} more
              </span>
            </div>
          </div>
        );
      }
      return <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', wordBreak: 'break-word' }}>{quotation.items}</span>;
    }

    if (quotation?.productInterest || quotation?.productInterested || quotation?.lead?.productInterest) {
      const txt = quotation.productInterest || quotation.productInterested || quotation.lead?.productInterest;
      return <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155' }}>{txt}</span>;
    }

    return <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>;
  };

  const quotationItemsText = (quotation) => {
    const source = (Array.isArray(quotation?.items) && quotation.items.length > 0)
      ? quotation.items
      : (Array.isArray(quotation?.detailedItems) && quotation.detailedItems.length > 0)
        ? quotation.detailedItems
        : (Array.isArray(quotation?.lead?.detailedItems) && quotation.lead.detailedItems.length > 0)
          ? quotation.lead.detailedItems
          : null;

    if (source && source.length > 0) {
      return source
        .map(item => {
          const name = item.productName || item.description || item.product?.name || item.name || 'Item';
          const qty = Number(item.quantity ?? item.qty ?? 0);
          const unit = item.unit || 'Qty';
          return `${name}${qty > 0 ? ` (${qty} ${unit})` : ''}`;
        })
        .join(', ');
    }

    if (quotation?.productInterest || quotation?.productInterested) {
      return String(quotation.productInterest || quotation.productInterested);
    }

    if (quotation?.lead?.productInterest || quotation?.lead?.productInterested) {
      return String(quotation.lead.productInterest || quotation.lead.productInterested);
    }

    return String(quotation?.items || quotation?.products || '—');
  };
  const quotationDetailItems = (quotation) => {
    const source = (Array.isArray(quotation?.detailedItems) && quotation.detailedItems.length > 0)
      ? quotation.detailedItems
      : (Array.isArray(quotation?.items) && quotation.items.length > 0)
        ? quotation.items
        : (Array.isArray(quotation?.lead?.detailedItems) && quotation.lead.detailedItems.length > 0)
          ? quotation.lead.detailedItems
          : [];
    return source.map((item, index) => ({
      ...item,
      id: item.id || index + 1,
      productName: item.productName || item.description || item.product?.name || item.name || 'Item',
      productDetails: item.productDetails || item.specification || item.description || '',
      code: item.code || item.productCode || item.product?.sku || item.productId || `PRD-${index + 1}`,
      quantity: Number(item.quantity ?? item.qty ?? 0),
      unitPrice: Number(item.unitPrice ?? item.rate ?? item.price ?? 0),
      discount: Number(item.discount ?? item.discountPercent ?? 0),
      tax: Number(item.tax ?? item.gstPercent ?? 0),
    }));
  };

  const formatCleanProductSpecs = (item) => {
    if (item.productDetails && typeof item.productDetails === 'string') {
      const cleaned = item.productDetails
        .replace(/\|\s*Qty:\s*[^|]+/gi, '')
        .replace(/\|\s*Rate:\s*[^|]+/gi, '')
        .replace(/\|\s*Total:\s*[^|]+/gi, '')
        .replace(/\s*\|\s*$/, '')
        .trim();
      if (cleaned && cleaned !== 'Standard Specification') return cleaned;
    }
    const parts = [];
    if (item.product || item.type) parts.push(`Product: ${item.product || item.type}`);
    if (item.size) parts.push(`Size: ${item.size}`);
    if (item.capacity) parts.push(`Capacity: ${item.capacity}`);
    if (item.color) parts.push(`Color: ${item.color}`);
    return parts.join(' | ');
  };
  const quotationTotal = (quotation) => {
    const rows = quotationDetailItems(quotation);
    if (!rows.length) return Number(quotation?.totalAmount ?? quotation?.grandTotal ?? 0);
    return calculateQuotationTotals(
      rows,
      quotation?.transportCharge ?? quotation?.expectedTransportationCost ?? 0
    ).grandTotal;
  };
  const quotationDiscount = (quotation) => {
    const rows = quotationDetailItems(quotation);
    if (!rows.length) return Number(quotation?.discount || 0);
    const subtotal = rows.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountAmount = rows.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * item.discount / 100,
      0
    );
    return subtotal > 0 ? discountAmount / subtotal * 100 : 0;
  };
  const quotationValidTill = (quotation) =>
    quotation?.validTill || quotation?.validityDate || '—';
  const quotationPaymentTerms = (quotation) => {
    if (quotation?.paymentTerms) return quotation.paymentTerms;
    if (!Array.isArray(quotation?.paymentMilestones)) return '—';
    return quotation.paymentMilestones
      .map((milestone) => `${milestone.label} ${milestone.percentage}%`)
      .join(', ');
  };
  const resolveQuotationNumber = (q) => {
    if (!q) return '—';
    const num = q.quotationNumber || q.quotation_number || q.quotationNo;
    if (num && typeof num === 'string' && num.trim()) {
      return num.trim();
    }
    if (q.id) {
      const idStr = String(q.id).trim();
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr)) {
        return `QTN-${idStr.slice(0, 8).toUpperCase()}`;
      }
      if (idStr.startsWith('QT-') || idStr.startsWith('QTN-') || idStr.startsWith('QU/') || idStr.startsWith('HCCL/')) {
        return idStr;
      }
      return `QTN-${idStr}`;
    }
    return 'QTN-DRAFT';
  };
  const resolveQuotationCustomerName = (q) => {
    if (!q) return '—';
    return (
      q.customerName ||
      q.customer_name ||
      q.customer?.companyName ||
      q.customer?.name ||
      q.lead?.companyName ||
      q.lead?.customerName ||
      q.lead?.projectName ||
      q.leadName ||
      q.clientName ||
      q.partyName ||
      '—'
    );
  };
  const editCustomerOptions = useMemo(() => {
    const options = [
      ...leads.map(lead => ({
        key: `lead-${lead.id}`,
        type: 'Lead',
        id: lead.id,
        name: lead.companyName || lead.customerName || lead.projectName || '',
        subtitle: [lead.groupName || lead.group_name, lead.status ? `Lead - ${lead.status}` : 'Lead'].filter(Boolean).join(' - '),
        groupName: lead.groupName || lead.group_name || '',
        gstNumber: lead.gstNumber || lead.gst_number || '',
        gstName: lead.gstName || lead.companyName || lead.customerName || lead.projectName || '',
      })),
      ...customers.map(customer => ({
        key: `customer-${customer.id}`,
        type: 'Customer',
        id: customer.id,
        name: customer.name || customer.customerName || '',
        subtitle: [customer.groupName || customer.group_name, 'Customer'].filter(Boolean).join(' - '),
        groupName: customer.groupName || customer.group_name || '',
        gstNumber: customer.gst || customer.gstNumber || customer.gstin || '',
        gstName: customer.gstName || customer.name || customer.customerName || '',
      }))
    ].filter(option => option.name);

    const seen = new Set();
    return options.filter(option => {
      const key = `${normalizeText(option.name)}-${option.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [leads, customers]);

  const filteredEditCustomerOptions = useMemo(() => {
    const query = normalizeText(editCustomerName);
    if (!query) return editCustomerOptions.slice(0, 8);
    return editCustomerOptions
      .filter(option => (
        normalizeText(option.name).includes(query) ||
        normalizeText(option.groupName).includes(query) ||
        normalizeText(option.subtitle).includes(query)
      ))
      .slice(0, 8);
  }, [editCustomerOptions, editCustomerName]);

  const selectEditCustomerOption = (option) => {
    setEditCustomerName(option.name);
    setEditGroupName(option.groupName || '');
    setEditGstName(option.gstName || option.name);
    if (option.gstNumber) setEditGstNumber(option.gstNumber);
    setEditCustomerSearchOpen(false);
  };

  useEffect(() => {
    if (!editingQuotation) return;
    if (!editCustomerName.trim()) {
      return;
    }

    if (!editGstName.trim() || editGstName === editingQuotation.customerName) {
      setEditGstName(editCustomerName.trim());
    }

    if (editingQuotation.gstNumber && editCustomerName === editingQuotation.customerName) {
      return;
    }

    const matchedLead = leads.find(l =>
      l.companyName?.toLowerCase() === editCustomerName.trim().toLowerCase() ||
      l.projectName?.toLowerCase() === editCustomerName.trim().toLowerCase()
    );
    if (matchedLead && !editGroupName.trim()) {
      setEditGroupName(matchedLead.groupName || matchedLead.group_name || '');
    }
    if (matchedLead && matchedLead.gstNumber) {
      setEditGstNumber(matchedLead.gstNumber);
      return;
    }

    const matchedCustomer = customers.find(c =>
      c.name?.toLowerCase() === editCustomerName.trim().toLowerCase()
    );
    if (matchedCustomer && (matchedCustomer.gst || matchedCustomer.gstNumber)) {
      setEditGstNumber(matchedCustomer.gst || matchedCustomer.gstNumber);
    }
  }, [editCustomerName, editingQuotation, leads, customers]);

  const startEditingQuotation = (qtn) => {
    setEditingQuotation(qtn);
  };

  const handleUpdateStatusClick = (qId, newStatus, textAction) => {
    Swal.fire({
      title: `${textAction} Quotation?`,
      text: `Are you sure you want to set the status of quotation #${resolveQuotationNumber({ id: qId }).replace(/^#/, '')} to "${newStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${textAction}`,
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
        onUpdateQuotationStatus(qId, newStatus);
      }
    });
  };

  const handleConvertToOrderClick = (qtn, closePreview = false) => {
    const qNum = resolveQuotationNumber(qtn).replace(/^#/, '');
    Swal.fire({
      title: 'Book Purchase Order?',
      text: `Are you sure you want to convert quotation #${qNum} into a Purchase Order for "${qtn.customerName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Book Order',
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
        onConvertToOrder(qtn);
        if (closePreview) {
          setSelectedQuotation(null);
        }
      }
    });
  };

  const handleSendQuotationClick = (qtn) => {
    const qNum = resolveQuotationNumber(qtn).replace(/^#/, '');
    Swal.fire({
      title: 'Send Quotation?',
      text: `Send quotation #${qNum} to "${qtn.customerName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      await onUpdateQuotationStatus(qtn.id, 'Sent');
      if (typeof onSendPDF === 'function') onSendPDF(qtn.id);
    });
  };

  const normalizedQuotationStatus = (status) =>
    String(status || '').trim().toUpperCase().replace(/[\s-]+/g, '_');

  const canSendQuotation = (status) =>
    ['DRAFT', 'NEW', 'INTERNAL_REVIEW', 'QUOTATION_DRAFT', 'PENDING', 'CREATED']
      .includes(normalizedQuotationStatus(status));

  const canConvertQuotation = (status) =>
    ['SENT', 'QUOTATION_SENT', 'APPROVED', 'QUOTATION_APPROVED', 'ACCEPTED', 'CONFIRMED', 'NEGOTIATION', 'UNDER_NEGOTIATION']
      .includes(normalizedQuotationStatus(status));

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, reminderBucket]);

  const quotationReminders = useMemo(
    () => (reminders || []).filter((r) => r.moduleType === 'Quotation'),
    [reminders]
  );

  const handleSaveReminder = async (formData) => {
    if (!reminderModal) return;
    if (reminderModal.reminder && onUpdateReminder) {
      await onUpdateReminder(reminderModal.reminder.id, formData);
    } else if (onSaveReminder) {
      await onSaveReminder({
        moduleType: 'Quotation',
        moduleId: reminderModal.quotation.id,
        customerName: reminderModal.quotation.customerName,
        ...formData
      });
    }
    setReminderModal(null);
  };

  const filteredQuotations = (quotations || []).filter(q => {
    if (!q) return false;
    if (filter === 'Reminders') return false;
    const custName = q.customerName || '';
    const qItems = quotationItemsText(q);
    const status = q.status || '';
    const qNum = resolveQuotationNumber(q);
    const searchString = typeof search === 'string' ? search.toLowerCase() : '';
    const matchesSearch = !searchString ||
      custName.toLowerCase().includes(searchString) ||
      qItems.toLowerCase().includes(searchString) ||
      qNum.toLowerCase().includes(searchString) ||
      String(q.id || '').toLowerCase().includes(searchString);
    const matchesFilter = filter === 'All' || status === filter;
    return matchesSearch && matchesFilter;
  });

  const filteredQuotationReminders = useMemo(() => {
    let list = quotationReminders.filter((r) => {
      const q = quotations.find((item) => String(item.id) === String(r.moduleId));
      const label = q?.customerName || r.customerName || '';
      const searchString = typeof search === 'string' ? search : '';
      return label.toLowerCase().includes(searchString.toLowerCase()) ||
        (r.reminderType || '').toLowerCase().includes(searchString.toLowerCase());
    });
    return filterRemindersByBucket(list, reminderBucket);
  }, [quotationReminders, quotations, search, reminderBucket]);

  const isRemindersView = filter === 'Reminders';
  const activeList = isRemindersView ? filteredQuotationReminders : filteredQuotations;
  const ITEMS_PER_PAGE = 25;
  const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE) || 1;
  const displayedQuotations = flat ? filteredQuotations : filteredQuotations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const displayedQuotationReminders = flat ? filteredQuotationReminders : filteredQuotationReminders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderQuotationReminder = (q) => {
    const nextVal = q.nextReminder;
    if (!nextVal) return <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>;
    const date = new Date(nextVal);
    const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return (
      <span style={{ fontSize: '12px', fontWeight: '700' }}>
        {dateStr} · {timeStr}
      </span>
    );
  };

  // Helper function to format in INR Lakhs style
  const formatINR = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  };

  const renderAddress = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    const parts = [addr.line1, addr.city, addr.state, addr.country, addr.pincode].filter(Boolean);
    return parts.join(', ') || '';
  };

  // Resolve client information
  const clientLead = (selectedQuotation && selectedQuotation.customerName && leads)
    ? leads.find(l => l.companyName && l.companyName.toLowerCase() === selectedQuotation.customerName.toLowerCase())
    : null;
  const clientCustomer = (selectedQuotation && selectedQuotation.customerName && customers)
    ? customers.find(c => c.name && c.name.toLowerCase() === selectedQuotation.customerName.toLowerCase())
    : null;

  const clientAddress =
    selectedQuotation?.billingAddress ||
    selectedQuotation?.deliveryAddress ||
    (clientLead ? renderAddress(clientLead.address) : '') ||
    (clientCustomer ? renderAddress(clientCustomer.address) : '') ||
    '—';
  const clientGST = selectedQuotation?.gstNumber || clientLead?.gstNumber || '27ABCDE4321G2Z8';

  // Resolve detailed item rows
  const itemsList = selectedQuotation ? quotationDetailItems(selectedQuotation) : [];

  const quotationTotals = calculateQuotationTotals(
    itemsList,
    selectedQuotation?.transportCharge ?? selectedQuotation?.expectedTransportationCost ?? 0
  );
  const calculatedSubtotal = quotationTotals.subtotal;
  const discountAmt = quotationTotals.discountAmount;
  const calculatedTaxAmt = quotationTotals.gstAmount;

  // ── Show Inline Create Quotation Form (uses CreateQuotation component) ──
  if (showCreateForm) {
    return (
      <CreateQuotation
        key={`${prefilledCustomer || ''}-${prefilledProduct || ''}-${prefilledQuantity || 0}-${prefilledPrice || 0}`}
        leads={leads}
        customers={customers}
        prefilledCustomer={prefilledCustomer}
        prefilledProduct={prefilledProduct}
        prefilledQuantity={prefilledQuantity}
        prefilledPrice={prefilledPrice}
        isFromSample={isFromSample}
        onAddQuotation={handleAddQuotation}
        onCancel={() => setShowCreateForm(false)}
        onCreateLead={onCreateLead}
      />
    );
  }

  // ── Show Inline Edit Quotation Form (reuses CreateQuotation component to ensure identical layout) ──
  if (editingQuotation) {
    return (
      <CreateQuotation
        key={`edit-${editingQuotation.id}`}
        leads={leads}
        customers={customers}
        editingQuotation={editingQuotation}
        onUpdateQuotation={onUpdateQuotation}
        onCancel={() => setEditingQuotation(null)}
        onCreateLead={onCreateLead}
      />
    );
  }

  return (
    <div className="app-card" style={{ flex: 1 }}>
      {/* Header */}
      <div className="module-header-row">
        <h2 className="module-title">Quotations Manager</h2>
        <div className="module-actions">
          {/* Status filters */}
          <div className="tab-filters-row" style={{ background: '#f1f3f5', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', flexWrap: 'nowrap', width: '100%', maxWidth: '100%' }}>
            {['All', 'Draft', 'Sent', 'Approved', 'Rejected', 'Reminders'].map(st => (
              <button
                key={st}
                className={`filter-pill ${filter === st ? 'active' : ''}`}
                onClick={() => setFilter(st)}
                style={{ color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="search-box" style={{ background: '#f1f3f5', border: '1px solid #D6E2F0' }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input
              type="text"
              placeholder="Search quotations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
          <button
            className="btn-small btn-primary-small"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => {
              useERPStore.getState().clearQuotationDraft();
              if (typeof onCreateQuoteClick === 'function') {
                onCreateQuoteClick();
              } else {
                setShowCreateForm(true);
              }
            }}
          >
            <Plus size={14} /> Repeat Quotation
          </button>
        </div>
      </div>

      {isRemindersView && (
        <div className="tab-filters-row" style={{ background: '#F5FAFE', marginBottom: '16px' }}>
          {['Today', 'Tomorrow', 'This Week', 'Overdue', 'Completed'].map((bucket) => (
            <button
              key={bucket}
              className={`filter-pill ${reminderBucket === bucket ? 'active' : ''}`}
              onClick={() => setReminderBucket(bucket)}
            >
              {bucket}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="crm-table-container desktop-only">
        {isRemindersView ? (
          <table className="crm-table responsive-table flat-table">
            <thead>
              <tr>
                <th>Quotation</th>
                <th>Customer</th>
                <th>Reminder</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotationReminders.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No reminders found.</td></tr>
              ) : displayedQuotationReminders.map((reminder) => {
                const q = quotations.find((item) => String(item.id) === String(reminder.moduleId));
                return (
                  <tr key={reminder.id}>
                    <td>#QTN-{reminder.moduleId}</td>
                    <td>{q?.customerName || reminder.customerName}</td>
                    <td>{reminder.reminderType}</td>
                    <td>{formatReminderDate(reminder.reminderDate)}</td>
                    <td>{reminder.priority}</td>
                    <td>{reminder.status}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {reminder.status === 'Pending' && onCompleteReminder && (
                          <button className="btn-small btn-outline-small" onClick={() => onCompleteReminder(reminder.id)}>Complete</button>
                        )}
                        <button className="btn-small btn-outline-small" onClick={() => setReminderModal({ quotation: q, reminder })}>Edit</button>
                        {q && <button className="btn-small btn-outline-small" onClick={() => setSelectedQuotation(q)}>View</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="crm-table responsive-table flat-table">
            <colgroup>
              <col style={{ width: '14%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Quotation ID</th>
                <th>Customer Name</th>
                <th>Product / Items</th>
                <th>Total Value</th>
                <th>Reminder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    No quotations cataloged.
                  </td>
                </tr>
              ) : (
                displayedQuotations.map((q) => (
                  <tr key={q.id}>
                    <td data-label="Quotation ID" style={{ fontWeight: '700' }}>#{resolveQuotationNumber(q).replace(/^#/, '')}</td>
                    <td data-label="Customer Name" style={{ fontWeight: '600' }}>{resolveQuotationCustomerName(q)}</td>
                    <td data-label="Product / Items">{renderQuotationProducts(q)}</td>
                    <td data-label="Total Value" style={{ fontWeight: '700' }}>{formatINR(quotationTotal(q))}</td>
                    <td data-label="Reminder">{renderQuotationReminder(q)}</td>
                    <td data-label="Actions" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div className="action-btn-group" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                        {/* Sequential 2-Step Workflow with matching lime green pill buttons */}
                        {canConvertQuotation(q.status) ? (
                          <button
                            data-testid={`quotation-convert-order-${q.quotationNo || q.id}`}
                            type="button"
                            onClick={() => handleConvertToOrderClick(q)}
                            style={{
                              background: '#2F4375',
                              color: '#ffffff',
                              border: '1px solid #2F4375',
                              padding: '6px 14px',
                              borderRadius: '10px',
                              fontWeight: '800',
                              fontSize: '11.5px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              boxShadow: '0 1px 4px rgba(47,67,117,0.3)'
                            }}
                          >
                            Convert to Order →
                          </button>
                        ) : !['CONVERTED', 'CONVERTED_TO_SO', 'CANCELLED', 'REJECTED', 'SUPERSEDED'].includes(normalizedQuotationStatus(q.status)) ? (
                          <button
                            data-testid={`quotation-send-${q.quotationNo || q.id}`}
                            type="button"
                            onClick={() => handleSendQuotationClick(q)}
                            style={{
                              background: '#2F4375',
                              color: '#ffffff',
                              border: '1px solid #2F4375',
                              padding: '6px 14px',
                              borderRadius: '10px',
                              fontWeight: '800',
                              fontSize: '11.5px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              boxShadow: '0 1px 4px rgba(47,67,117,0.3)'
                            }}
                          >
                            Send Quotation →
                          </button>
                        ) : null}

                        <button
                          title="View Quotation"
                          onClick={() => setSelectedQuotation(q)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px',
                            background: '#ffffff', border: '1px solid #D6E2F0',
                            borderRadius: '8px', cursor: 'pointer', color: '#475569', flexShrink: 0
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title="Edit Quotation"
                          onClick={() => startEditingQuotation(q)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px',
                            background: '#ffffff', border: '1px solid #D6E2F0',
                            borderRadius: '8px', cursor: 'pointer', color: '#475569', flexShrink: 0
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          title="Add Reminder"
                          onClick={() => setReminderModal({ quotation: q })}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px',
                            background: '#ffffff', border: '1px solid #D6E2F0',
                            borderRadius: '8px', cursor: 'pointer', color: '#475569', flexShrink: 0
                          }}
                        >
                          <Bell size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Card Layout for Quotations */}
      {!isRemindersView && (
        <div className="mobile-only quotations-mobile-list" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
          <style>{`
            @media (max-width: 768px) {
              .desktop-only { display: none !important; }
              .mobile-only.quotations-mobile-list { display: flex !important; }
            }
          `}</style>
          {filteredQuotations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
              <strong>No quotations cataloged.</strong>
            </div>
          ) : (
            displayedQuotations.map((q) => {
              return (
                <div key={q.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Header Row: Quotation ID + Status Badge + 3-dot More */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span onClick={() => setSelectedQuotation(q)} style={{ fontSize: '13px', fontWeight: '800', color: '#1e3a8a', cursor: 'pointer' }}>
                      #{resolveQuotationNumber(q).replace(/^#/, '')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700',
                        backgroundColor: (q.status === 'Converted' || q.status === 'Approved') ? '#dcfce7' : (q.status === 'New' || q.status === 'Draft' ? '#dbeafe' : '#f1f5f9'),
                        color: (q.status === 'Converted' || q.status === 'Approved') ? '#15803d' : (q.status === 'New' || q.status === 'Draft' ? '#1d4ed8' : '#475569')
                      }}>
                        {q.status || 'Draft'}
                      </div>
                      <button onClick={() => setSelectedQuotation(q)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Body Row 1: Customer Name */}
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', lineHeight: 1.3 }}>
                    {resolveQuotationCustomerName(q)}
                  </div>
                  
                  {/* Body Row 2: Items / Products */}
                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: '500', minWidth: 0 }}>
                    {renderQuotationProducts(q)}
                  </div>

                  {/* Body Row 3: Total Amount & Primary Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total Value</span>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>
                        {formatINR(quotationTotal(q))}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                      {canConvertQuotation(q.status) ? (
                        <button
                          onClick={() => handleConvertToOrderClick(q)}
                          style={{
                            background: '#2F4375', color: '#ffffff', border: '1px solid #2F4375',
                            padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '11.5px',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0
                          }}
                        >
                          Convert to Order →
                        </button>
                      ) : !['CONVERTED', 'CONVERTED_TO_SO', 'CANCELLED', 'REJECTED', 'SUPERSEDED'].includes(normalizedQuotationStatus(q.status)) ? (
                        <button
                          onClick={() => handleSendQuotationClick(q)}
                          style={{
                            background: '#2F4375', color: '#ffffff', border: '1px solid #2F4375',
                            padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '11.5px',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0
                          }}
                        >
                          Send Quotation →
                        </button>
                      ) : null}

                      <button
                        title="View Quotation"
                        onClick={() => setSelectedQuotation(q)}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        title="Edit Quotation"
                        onClick={() => startEditingQuotation(q)}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        title="Add Reminder"
                        onClick={() => setReminderModal({ quotation: q })}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <Bell size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination controls */}
      {!flat && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{activeList.length}</strong> total {isRemindersView ? 'reminders' : 'quotations'})
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

      {/* Branded Quotation Details Sheet Modal */}
      {selectedQuotation && (
        <div
          className="modal-overlay active"
          onClick={() => setSelectedQuotation(null)}
          style={{
            padding: '12px 8px',
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            boxSizing: 'border-box',
            zIndex: 9999
          }}
        >
          <style>{`
            .quotation-sheet-modal-container {
              max-height: calc(100vh - 24px);
              width: 840px;
              max-width: calc(100vw - 16px);
              padding: 0 !important;
              box-sizing: border-box;
              background: #ffffff;
              border-radius: 16px;
              margin: auto;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
              border: 1px solid #dce5f0;
            }
            .quotation-document-viewport,
            .quotation-preview-wrapper {
              flex: 1;
              overflow-y: auto;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              background: #f1f5f9;
              display: flex;
              justify-content: center;
              padding: 12px 0;
            }
            .quotation-page,
            .quotation-preview-container {
              width: 794px !important;
              min-width: 794px !important;
              max-width: 794px !important;
              min-height: 1123px !important;
              flex-shrink: 0;
              position: relative;
              background: #ffffff;
              box-sizing: border-box;
            }
            .term-number {
              width: 22px;
              height: 22px;
              border-radius: 4px;
              background: #e0f2fe;
              color: #0284c7;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 700;
            }
            .quotation-preview-container table,
            .quotation-items-table,
            .doc-table {
              display: table !important;
              width: 100% !important;
              table-layout: fixed !important;
              border-collapse: collapse !important;
              border-spacing: 0 !important;
              background: #ffffff !important;
              margin: 0 !important;
            }
            .quotation-table-container {
              width: 100% !important;
              border: 1.5px solid #e2e8f0 !important;
              border-radius: 8px !important;
              overflow: hidden !important;
              background: #ffffff !important;
              margin: 0 0 16px 0 !important;
            }
            .quotation-preview-container thead,
            .quotation-items-table thead,
            .doc-table thead {
              display: table-header-group !important;
            }
            .quotation-preview-container thead tr,
            .quotation-items-table thead tr,
            .doc-table thead tr {
              display: table-row !important;
              background: #002e5d !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .quotation-preview-container tbody,
            .quotation-items-table tbody,
            .doc-table tbody {
              display: table-row-group !important;
            }
            .quotation-preview-container tbody tr,
            .quotation-items-table tbody tr,
            .doc-table tbody tr {
              display: table-row !important;
              background: #ffffff !important;
              border: none !important;
              border-bottom: 1px solid #f1f5f9 !important;
              border-radius: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .quotation-preview-container th,
            .quotation-items-table th,
            .doc-table th {
              display: table-cell !important;
              background: #002e5d !important;
              color: #ffffff !important;
              vertical-align: middle !important;
              padding: 12px 10px !important;
              font-weight: 800 !important;
              font-size: 11px !important;
              letter-spacing: 0.04em !important;
              text-transform: uppercase !important;
              border: none !important;
              box-shadow: none !important;
            }
            .quotation-preview-container td,
            .quotation-items-table td,
            .doc-table td {
              display: table-cell !important;
              vertical-align: middle !important;
              padding: 12px 10px !important;
              background: #ffffff !important;
              box-shadow: none !important;
              border: none !important;
              border-bottom: 1px solid #f1f5f9 !important;
              text-align: inherit !important;
              flex-direction: initial !important;
              justify-content: initial !important;
              align-items: initial !important;
              gap: 0 !important;
            }
            .quotation-preview-container td::before,
            .quotation-items-table td::before,
            .doc-table td::before {
              display: none !important;
              content: none !important;
            }
            .quotation-items-table .col-number,
            .quotation-items-table .product-number {
              width: 7% !important;
              text-align: center !important;
              vertical-align: middle !important;
              white-space: nowrap !important;
            }
            .quotation-items-table .col-details,
            .quotation-items-table .product-details-cell {
              width: 46% !important;
              text-align: left !important;
              vertical-align: middle !important;
              min-width: 0 !important;
              overflow: hidden !important;
              padding: 14px 16px !important;
            }
            .quotation-items-table .col-qty,
            .quotation-items-table .product-qty {
              width: 10% !important;
              text-align: center !important;
              vertical-align: middle !important;
              white-space: nowrap !important;
            }
            .quotation-items-table .col-rate,
            .quotation-items-table .product-rate {
              width: 13% !important;
              text-align: right !important;
              vertical-align: middle !important;
              white-space: nowrap !important;
            }
            .quotation-items-table .col-tax,
            .quotation-items-table .product-tax {
              width: 11% !important;
              text-align: center !important;
              vertical-align: middle !important;
              white-space: nowrap !important;
            }
            .quotation-items-table .col-total,
            .quotation-items-table .product-total {
              width: 13% !important;
              text-align: right !important;
              vertical-align: middle !important;
              white-space: nowrap !important;
            }
            .quotation-items-table .product-name {
              font-size: 14.5px !important;
              font-weight: 800 !important;
              color: #002e5d !important;
              line-height: 1.25 !important;
              margin-bottom: 4px !important;
              white-space: normal !important;
              overflow-wrap: break-word !important;
            }
            .quotation-items-table .product-description {
              font-size: 12px !important;
              line-height: 1.4 !important;
              color: #52627a !important;
              margin-bottom: 4px !important;
              white-space: normal !important;
              overflow-wrap: break-word !important;
              font-weight: 500 !important;
            }
            .quotation-items-table .product-code {
              font-size: 11px !important;
              line-height: 1.3 !important;
              color: #718096 !important;
              font-family: monospace !important;
              white-space: normal !important;
              overflow-wrap: anywhere !important;
            }
            @media (max-width: 640px) {
              .quotation-document-viewport {
                justify-content: flex-start;
                padding: 6px 0;
              }
              .sheet-actions {
                padding: 10px 12px !important;
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 8px !important;
              }
              .sheet-actions-btn-group {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 6px !important;
                width: 100% !important;
              }
              .sheet-actions-btn-group button {
                width: 100% !important;
                justify-content: center !important;
                padding: 8px 6px !important;
                font-size: 11.5px !important;
              }
              .sheet-actions-primary-btn {
                width: 100% !important;
                justify-content: center !important;
                padding: 10px !important;
                font-size: 13px !important;
              }
            }
          `}</style>
          <div
            className="quotation-sheet-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile zoom toggle toolbar */}
            {previewScale < 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setPreviewZoomMode(m => m === 'fit' ? 'full' : 'fit')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#2F4375', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {previewZoomMode === 'fit' ? '🔍 Zoom to 100%' : '📱 Fit to Mobile Screen'}
                </button>
                <span style={{ fontSize: '11px', color: '#334155', fontWeight: '700' }}>
                  {previewZoomMode === 'fit' ? `Fitted View (${Math.round(previewScale * 100)}%)` : 'Full 794px A4 Document'}
                </span>
              </div>
            )}

            {/* Scrollable Viewport to maintain exact 794px crisp geometry without squishing on mobile */}
            <div className="quotation-document-viewport quotation-preview-wrapper">
              <div
                style={{
                  width: (previewZoomMode === 'fit' && previewScale < 1) ? `${Math.round(794 * previewScale)}px` : '794px',
                  height: (previewZoomMode === 'fit' && previewScale < 1) ? `${Math.round(sheetHeight * previewScale)}px` : 'auto',
                  overflow: (previewZoomMode === 'fit' && previewScale < 1) ? 'hidden' : 'visible',
                  margin: '0 auto',
                  flexShrink: 0,
                  transition: 'width 0.15s ease, height 0.15s ease'
                }}
              >
                <div
                  ref={quotationSheetRef}
                  id="quotation-printable-area"
                  className="quotation-page quotation-preview-container no-mobile-stack flat-table"
                  style={{
                    width: '794px',
                    minWidth: '794px',
                    maxWidth: '794px',
                    minHeight: '1123px',
                    background: '#ffffff',
                    borderRadius: '0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    boxSizing: 'border-box',
                    transform: (previewZoomMode === 'fit' && previewScale < 1) ? `scale(${previewScale})` : 'none',
                    transformOrigin: 'top left',
                  }}
                >
                  {/* Curved Header Banner Wave */}
                  <div style={{ position: 'relative', width: '100%', height: '150px', overflow: 'hidden', margin: 0, padding: 0 }}>
                    <svg viewBox="0 0 794 150" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                      {/* Light wave behind */}
                      <path d="M 0 0 L 794 0 L 794 30 C 580 15, 420 120, 0 130 Z" fill="#3b82f6" opacity="0.25" />
                      {/* Main dark wave */}
                      <path d="M 0 0 L 794 0 L 794 15 C 580 5, 420 105, 0 115 Z" fill="#002e5d" />
                      {/* White cutout ellipse background for logo */}
                      <ellipse cx="80" cy="20" rx="180" ry="115" fill="#ffffff" />
                    </svg>
                    {/* Content inside wave (Original Himalaya Logo) */}
                    <div style={{ position: 'relative', zIndex: 2, padding: '20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: '100%', boxSizing: 'border-box' }}>
                      <img src="/himalaya-logo-trimmed.png" alt="Himalaya Logo" style={{ height: '75px', width: 'auto', objectFit: 'contain' }} />
                      <div style={{ color: '#ffffff', fontSize: '8.5px', fontWeight: '700', marginTop: '6px', letterSpacing: '0.8px' }}>
                        STRENGTH. DURABILITY. TRUST.
                      </div>
                    </div>
                  </div>

            {/* Inner Content Area with standard padding */}
            <div style={{ padding: '16px 32px 28px 32px' }}>
              
              {/* Upper Section: Company Details (Left) and Ref & Meta (Right) */}
              <div className="quotation-sheet-mobile-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '14px' }}>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '18px', fontWeight: '850', color: '#002e5d', margin: 0, fontFamily: 'sans-serif' }}>
                    Himalaya Composites &amp; Precast Pvt Ltd
                  </h1>
                  <p style={{ fontSize: '10px', fontWeight: '750', color: '#0284c7', margin: '2px 0 8px 0', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    FORMERLY KNOWN AS AKBERALI PRECAST PVT LTD
                  </p>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', lineHeight: '1.45', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <MapPin size={13} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>PLOT NO.25&amp;26, SURVEY NO.35(OLD-27-A), EVOKE INDUSTRIAL PARK, BAREJA KHEDA ROAD, MALARPURA, KHEDA, GUJARAT</span>
                    </p>
                    <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={13} color="#0284c7" />
                      <span>GSTIN/UIN: <span style={{ fontWeight: '750', color: '#1e293b' }}>24AAICH3332B1Z6</span></span>
                    </p>
                  </div>
                </div>

                <div className="quotation-sheet-right-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {/* QUOTATION ribbon header */}
                  <div style={{ display: 'inline-flex', alignItems: 'stretch', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                    <div style={{ background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
                      <FileText size={16} color="#ffffff" />
                    </div>
                    <div style={{ background: '#002e5d', color: '#ffffff', padding: '8px 24px 8px 16px', fontWeight: '800', fontSize: '15px', letterSpacing: '0.5px', clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)' }}>
                      QUOTATION
                    </div>
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#475569', fontWeight: '700', margin: '2px 0 6px 0' }}>
                    Ref: {resolveQuotationNumber(selectedQuotation)}
                  </p>

                  {/* Stacked Meta Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '180px', marginTop: '4px' }}>
                    {/* Date Card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Calendar size={15} color="#0284c7" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '9px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Quotation Date</p>
                        <p style={{ margin: 0, fontSize: '11.5px', color: '#0f2c59', fontWeight: '700' }}>
                          {selectedQuotation.date || selectedQuotation.createdAt?.slice(0, 10) || '—'}
                        </p>
                      </div>
                    </div>
                    {/* Payment Terms Card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CreditCard size={15} color="#0284c7" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '9px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Payment Terms</p>
                        <p style={{ margin: 0, fontSize: '11.5px', color: '#0f2c59', fontWeight: '700' }}>
                          {quotationPaymentTerms(selectedQuotation)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Styled horizontal banner "QUOTED TO:" */}
              <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', margin: '18px 0', overflow: 'hidden', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ background: '#002e5d', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', flexShrink: 0 }}>
                  <User size={20} color="#ffffff" />
                </div>
                <div style={{ padding: '10px 16px', flex: 1, position: 'relative', zIndex: 2 }}>
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>QUOTED TO:</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: '800', color: '#0f2c59' }}>{selectedQuotation.customerName}</p>
                  {clientAddress && <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#475569', fontWeight: '500' }}>{clientAddress}</p>}
                  {clientGST && <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#475569', fontWeight: '600' }}>GST: <span style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}>{clientGST}</span></p>}
                </div>
                {/* Faint watermark outline background on the right */}
                <div style={{ position: 'absolute', right: 0, bottom: 0, top: 0, width: '160px', opacity: 0.08, pointerEvents: 'none', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '4px' }}>
                  <img src="/himalaya-logo-mark.png" alt="watermark" style={{ height: '85%', width: 'auto', objectFit: 'contain' }} />
                </div>
              </div>

              {/* Items Table - Exact 6 Columns */}
              <div className="quotation-table-container no-mobile-stack" style={{ margin: '0 0 16px 0', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', background: '#ffffff' }}>
                <table className="quotation-items-table doc-table no-mobile-stack flat-table" style={{ border: 'none', width: '100%', borderCollapse: 'collapse', borderSpacing: 0, display: 'table', tableLayout: 'fixed', background: '#ffffff', margin: 0 }}>
                  <thead style={{ display: 'table-header-group' }}>
                    <tr style={{ background: '#002e5d', color: '#ffffff', display: 'table-row' }}>
                      <th className="col-number" style={{ width: '7%', padding: '12px 8px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#ffffff', textAlign: 'center', background: '#002e5d', display: 'table-cell', verticalAlign: 'middle' }}>#</th>
                      <th className="col-details" style={{ width: '46%', padding: '12px 16px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#ffffff', textAlign: 'left', background: '#002e5d', display: 'table-cell', verticalAlign: 'middle' }}>PRODUCT DETAILS</th>
                      <th className="col-qty" style={{ width: '10%', padding: '12px 8px', textAlign: 'center', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#ffffff', background: '#002e5d', display: 'table-cell', verticalAlign: 'middle' }}>QTY</th>
                      <th className="col-rate" style={{ width: '13%', padding: '12px 10px', textAlign: 'right', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#ffffff', background: '#002e5d', display: 'table-cell', verticalAlign: 'middle' }}>RATE</th>
                      <th className="col-tax" style={{ width: '11%', padding: '12px 8px', textAlign: 'center', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#ffffff', background: '#002e5d', display: 'table-cell', verticalAlign: 'middle' }}>TAX (GST)</th>
                      <th className="col-total" style={{ width: '13%', padding: '12px 14px', textAlign: 'right', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#ffffff', background: '#002e5d', display: 'table-cell', verticalAlign: 'middle' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody style={{ display: 'table-row-group' }}>
                    {itemsList.map((item, index) => {
                      const itemSubtotal = item.quantity * item.unitPrice;
                      const discountValue = itemSubtotal * (item.discount || 0) / 100;
                      const taxable = itemSubtotal - discountValue;
                      const taxValue = taxable * (item.tax !== undefined ? item.tax : 18) / 100;
                      const itemTotal = taxable + taxValue;
                      const cleanSpecs = formatCleanProductSpecs(item);

                      return (
                        <tr key={index} className="quotation-product-row" style={{ borderBottom: '1px solid #f1f5f9', display: 'table-row', background: 'transparent' }}>
                          {/* # */}
                          <td className="product-number" style={{ width: '7%', padding: '12px 8px', textAlign: 'center', fontWeight: '700', color: '#64748b', fontSize: '13px', display: 'table-cell', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            {index + 1}
                          </td>

                          {/* PRODUCT DETAILS — EVERYTHING IN ONE CELL */}
                          <td className="product-details-cell" style={{ width: '46%', padding: '14px 16px', display: 'table-cell', verticalAlign: 'middle', textAlign: 'left', minWidth: 0, overflow: 'hidden' }}>
                            <div className="product-name" style={{ fontWeight: '800', color: '#002e5d', fontSize: '14px', lineHeight: '1.25', marginBottom: '4px', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
                              {item.productName}
                            </div>
                            {cleanSpecs ? (
                              <div className="product-description" style={{ fontSize: '12px', color: '#52627a', lineHeight: '1.4', marginBottom: '4px', whiteSpace: 'normal', overflowWrap: 'break-word', fontWeight: '500' }}>
                                {cleanSpecs}
                              </div>
                            ) : null}
                            <div className="product-code" style={{ fontSize: '11px', color: '#718096', fontFamily: 'monospace', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                              Code: {item.code}
                            </div>
                          </td>

                          {/* QTY */}
                          <td className="product-qty" style={{ width: '10%', padding: '12px 8px', textAlign: 'center', fontWeight: '800', color: '#002e5d', fontSize: '13.5px', display: 'table-cell', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            {item.quantity}
                          </td>

                          {/* RATE */}
                          <td className="product-rate" style={{ width: '13%', padding: '12px 10px', textAlign: 'right', fontWeight: '700', color: '#002e5d', fontSize: '13.5px', display: 'table-cell', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            ₹{Math.round(item.unitPrice).toLocaleString('en-IN')}
                          </td>

                          {/* TAX */}
                          <td className="product-tax" style={{ width: '11%', padding: '12px 8px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '13px', display: 'table-cell', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            {item.tax !== undefined ? item.tax : 18}%
                          </td>

                          {/* TOTAL */}
                          <td className="product-total" style={{ width: '13%', padding: '12px 14px', textAlign: 'right', fontWeight: '900', color: '#002e5d', fontSize: '14px', display: 'table-cell', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            ₹{Math.round(itemTotal).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Calculations Invoice Summary panel */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', margin: '14px 0 20px 0', gap: '6px' }}>
                {/* Subtotal row */}
                <div style={{ display: 'flex', width: '290px', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '4px', background: '#e0f2fe' }}>
                      <FileText size={12} color="#0284c7" />
                    </span>
                    Items Subtotal:
                  </span>
                  <span style={{ fontWeight: '800', color: '#002e5d', fontSize: '13.5px' }}>{formatINR(calculatedSubtotal)}</span>
                </div>

                {/* GST row */}
                <div style={{ display: 'flex', width: '290px', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '4px', background: '#e0f2fe' }}>
                      <Percent size={12} color="#0284c7" />
                    </span>
                    GST Amount:
                  </span>
                  <span style={{ fontWeight: '800', color: '#002e5d', fontSize: '13.5px' }}>{formatINR(calculatedTaxAmt)}</span>
                </div>

                {/* Expected Transportation Cost */}
                {(Number(selectedQuotation.transportCharge ?? selectedQuotation.expectedTransportationCost ?? 0) >= 0) && (
                  <div style={{ display: 'flex', width: '290px', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', border: '1px solid #bbf7d0', borderRadius: '6px', background: '#f0fdf4' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0369a1', fontWeight: '600' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '4px', background: '#e0fdf4' }}>
                        <Truck size={12} color="#0369a1" />
                      </span>
                      Expected Transportation Cost:
                    </span>
                    <span style={{ fontWeight: '800', color: '#0369a1', fontSize: '13.5px' }}>+{formatINR(Number(selectedQuotation.transportCharge ?? selectedQuotation.expectedTransportationCost ?? 0))}</span>
                  </div>
                )}

                {/* Grand Total row */}
                <div style={{ display: 'flex', width: '290px', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '6px', color: '#ffffff', boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.2)' }}>
                      <ShieldCheck size={13} color="#ffffff" />
                    </span>
                    Grand Total:
                  </span>
                  <span style={{ fontWeight: '900', fontSize: '16px' }}>{formatINR(quotationTotal(selectedQuotation))}</span>
                </div>
              </div>

              {/* Terms & Conditions Section */}
              {(() => {
                const termsList = resolveQuotationTerms(selectedQuotation);
                if (!termsList || termsList.length === 0) return null;
                return (
                  <div style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#002e5d', color: '#ffffff', padding: '10px 16px', gap: '8px', fontWeight: '700', fontSize: '12.5px' }}>
                      <div style={{ background: '#0284c7', width: '22px', height: '22px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckSquare size={13} color="#ffffff" />
                      </div>
                      TERMS AND CONDITIONS :-
                    </div>
                    <div className="terms-container" style={{ padding: '12px 16px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {termsList.map((term, i) => (
                        <div key={term.termId || term.id || i} className="term-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '5px 0', borderBottom: i < termsList.length - 1 ? '1px dashed #f1f5f9' : 'none' }}>
                          <div className="term-number">
                            {i + 1}
                          </div>
                          <div className="term-text" style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600' }}>{term.text || term.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Valuable Clients Section */}
              <div style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#002e5d', color: '#ffffff', padding: '10px 16px', gap: '8px', fontWeight: '750', fontSize: '12.5px' }}>
                  <div style={{ background: '#3b82f6', width: '22px', height: '22px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Star size={13} color="#ffffff" fill="#ffffff" />
                  </div>
                  VALUABLE CLIENTS
                </div>
                <div className="clients-container" style={{ padding: '16px 20px', background: '#ffffff', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  {/* Reliance Logo */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/client-logos/reliance-logo.png" alt="Reliance Industries Limited" style={{ maxHeight: '42px', maxWidth: '120px', objectFit: 'contain' }} />
                  </div>
                  {/* Adani Logo */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/client-logos/adani-logo.png" alt="adani" style={{ maxHeight: '36px', maxWidth: '110px', objectFit: 'contain' }} />
                  </div>
                  {/* L&T Logo */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/client-logos/lt-logo.png" alt="L&T" style={{ maxHeight: '40px', maxWidth: '100px', objectFit: 'contain' }} />
                  </div>
                  {/* A.SHRIDHAR Logo */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/client-logos/ashridhar-logo.png" alt="A.SHRIDHAR" style={{ maxHeight: '38px', maxWidth: '120px', objectFit: 'contain' }} />
                  </div>
                </div>
              </div>

              {/* Sign-off & Authorised Signatory Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px', paddingBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Official Company Seal Stamp */}
                  <img
                    src="/himalaya-stamp.png"
                    alt="Himalaya Seal Stamp"
                    style={{ width: '84px', height: '84px', objectFit: 'contain', marginRight: '8px', flexShrink: 0 }}
                  />
                  
                  <div style={{ fontSize: '12.5px', color: '#334155', fontStyle: 'italic', lineHeight: '1.5' }}>
                    <p style={{ margin: 0, fontWeight: '500' }}>Thanks and waiting for your valued order</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>Yours truly,</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right', color: '#1e293b' }}>
                  <p style={{ margin: 0, fontWeight: '800', fontSize: '13px', color: '#002e5d' }}>
                    For Himalaya Composites &amp; Precast Pvt Ltd
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontStyle: 'italic', fontSize: '11px', color: '#475569' }}>
                    (Formerly known as Akberali Precast Pvt Ltd)
                  </p>
                  {/* Authorised Signature Image */}
                  <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px' }}>
                    <img
                      src="/himalaya-signature.png"
                      alt="Authorised Signature"
                      style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
                    />
                  </div>
                  <p style={{ margin: 0, fontWeight: '800', fontSize: '12.5px', color: '#1e293b', borderTop: '1px solid #e2e8f0', paddingTop: '4px', display: 'inline-block' }}>
                    Authorised Signatory
                  </p>
                </div>
              </div>

            </div>

            {/* Curved Footer Wave with Contact Info */}
            <div className="quotation-footer-wave-wrapper" style={{ position: 'relative', width: '100%', height: '76px', overflow: 'hidden', marginTop: '18px', background: '#002e5d' }}>
              <svg viewBox="0 0 840 76" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                <path d="M 0 10 C 245 -2, 560 26, 840 2 L 840 31 C 565 54, 255 24, 0 38 Z" fill="#3b82f6" opacity="0.28" />
                <path d="M 0 22 C 255 6, 560 45, 840 18 L 840 76 L 0 76 Z" fill="#002e5d" />
              </svg>
              <div className="quotation-footer-contact" style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', boxSizing: 'border-box', padding: '30px 34px 10px', color: '#ffffff', fontSize: '11.5px', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
                  <Phone size={13} color="#ffffff" fill="#ffffff" /> +91 98795 22226
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
                  <Mail size={13} color="#ffffff" /> info@himalayacomposites.com
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
                  <Globe size={13} color="#ffffff" /> www.himalayacomposites.com
                </span>
              </div>
            </div>

                </div> {/* End of #quotation-printable-area */}
              </div> {/* End of scaling container */}
            </div> {/* End of .quotation-document-viewport */}

            {/* Close / Convert Action controls wrapper */}
            <div className="sheet-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '14px 24px', boxSizing: 'border-box', background: '#ffffff', borderTop: '1px solid #e2e8f0', zIndex: 10 }}>
              <div className="sheet-actions-btn-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={() => setSelectedQuotation(null)}
                  style={{ padding: '9px 16px', fontSize: '12.5px', fontWeight: '700', borderRadius: '8px', margin: 0 }}
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    try {
                      Swal.fire({
                        title: 'Generating Image...',
                        text: 'Rendering high-resolution quotation image...',
                        allowOutsideClick: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });
                      const qNo = resolveQuotationNumber(selectedQuotation);
                      const safeFilename = `Quotation_${String(qNo).replace(/[\/\\]/g, '_') || 'Draft'}.png`;
                      await exportQuotationImage('quotation-printable-area', safeFilename);
                      Swal.close();
                      Swal.fire({
                        icon: 'success',
                        title: 'Quotation Downloaded!',
                        text: 'Image has been saved to your device.',
                        timer: 2000,
                        showConfirmButton: false
                      });
                    } catch (err) {
                      console.error('Error generating image:', err);
                      Swal.close();
                      Swal.fire('Error', 'Failed to generate quotation image. Please try again.', 'error');
                    }
                  }}
                  style={{ padding: '9px 16px', fontSize: '12.5px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <Image size={14} /> Download Image
                </button>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    try {
                      Swal.fire({
                        title: 'Preparing Image...',
                        text: 'Rendering quotation image for sharing...',
                        allowOutsideClick: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });
                      
                      const qNo = resolveQuotationNumber(selectedQuotation);
                      const res = await shareQuotationImage('quotation-printable-area', qNo, selectedQuotation.customerName);
                      Swal.close();
                      
                      if (!res.success) {
                        const whatsappText = encodeURIComponent(`Hello, please find the quotation details:\n*Quotation:* ${qNo}\n*Customer:* ${selectedQuotation.customerName || 'Valued Customer'}`);
                        const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappText}`;
                        
                        Swal.fire({
                          title: 'Share Quotation',
                          html: `
                            <div style="display:flex; flex-direction:column; gap:12px; margin-top: 10px; align-items: center; text-align: center;">
                              <p style="font-size: 12.5px; color: #475569; margin: 0;">Choose how you want to share or download the quotation:</p>
                              <img src="${res.dataUrl}" style="max-width: 100%; max-height: 220px; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.08);" />
                              <div style="display: flex; gap: 8px; width: 100%; justify-content: center; flex-wrap: wrap; margin-top: 6px;">
                                <a href="${res.dataUrl}" download="Quotation_${String(qNo).replace(/[\/\\]/g, '_') || 'Draft'}.png" style="background:#0284c7; color:#fff; text-decoration:none; padding:10px 18px; border-radius:8px; font-weight:700; font-size:12.5px; display:inline-flex; align-items:center; gap:6px;">📥 Save Image</a>
                                <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="background:#22c55e; color:#fff; text-decoration:none; padding:10px 18px; border-radius:8px; font-weight:700; font-size:12.5px; display:inline-flex; align-items:center; gap:6px;">💬 WhatsApp</a>
                              </div>
                              <span style="font-size: 11px; color: #94a3b8;">Tip: On mobile devices, you can touch & hold the image above to save directly to your gallery.</span>
                            </div>
                          `,
                          showConfirmButton: false,
                          showCloseButton: true,
                          customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title' }
                        });
                      }
                    } catch (err) {
                      console.error('Error sharing image:', err);
                      Swal.close();
                      Swal.fire('Error', 'Failed to share quotation image.', 'error');
                    }
                  }}
                  style={{ padding: '9px 16px', fontSize: '12.5px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <Share2 size={14} /> Share Image
                </button>
              </div>

              {canSendQuotation(selectedQuotation.status) ? (
                <div>
                  <button
                    type="button"
                    className="btn-small btn-primary-small sheet-actions-primary-btn"
                    onClick={() => handleSendQuotationClick(selectedQuotation)}
                    style={{ background: '#2F4375', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}
                  >
                    Send Quotation →
                  </button>
                </div>
              ) : canConvertQuotation(selectedQuotation.status) ? (
                <div>
                  <button
                    type="button"
                    className="btn-small btn-primary-small sheet-actions-primary-btn"
                    onClick={() => handleConvertToOrderClick(selectedQuotation, true)}
                    style={{ background: '#00a877', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}
                  >
                    Book Order Now
                  </button>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      )}

      <ReminderModal
        key={reminderModal?.reminder?.id || reminderModal?.quotation?.id || 'new'}
        open={!!reminderModal}
        onClose={() => setReminderModal(null)}
        onSave={handleSaveReminder}
        customerName={reminderModal?.quotation?.customerName || ''}
        title={reminderModal?.reminder ? 'Edit Quotation Reminder' : 'Quotation Reminder'}
        initialValues={reminderModal?.reminder || null}
      />

    </div>
  );
}
