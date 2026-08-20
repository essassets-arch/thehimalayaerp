import { useState, useEffect, useMemo } from 'react';
import { calculateQuotationTotals, exportQuotationPDF, exportQuotationImage, shareQuotationImage } from '../services/export.service';
import { Search, Plus, Eye, ArrowRight, Download, Share2, Edit, Trash2, Truck, ChevronLeft, ChevronRight, ArrowLeft, FileText, Bell, ShieldCheck, ChevronDown, MoreVertical, User, Calendar, CreditCard, MapPin, Star, Phone, Mail, Globe, Percent, CheckSquare, Image } from 'lucide-react';
import Swal from 'sweetalert2';
import CreateQuotation from './CreateQuotation';
import { useERPStore } from '../shared/context/ERPContext';
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
    const cName = qtn.customerName || '';
    const matchedLead = leads.find(l =>
      (qtn.sourceId && String(l.id) === String(qtn.sourceId)) ||
      (qtn.leadId && String(l.id) === String(qtn.leadId)) ||
      (cName && (l.companyName?.toLowerCase() === cName.trim().toLowerCase() || l.projectName?.toLowerCase() === cName.trim().toLowerCase()))
    );
    const matchedCustomer = customers.find(c =>
      cName && c.name?.toLowerCase() === cName.trim().toLowerCase()
    );

    setEditCustomerName(cName || matchedLead?.companyName || matchedLead?.projectName || matchedCustomer?.name || '');
    setEditGroupName(qtn.groupName || matchedLead?.groupName || matchedLead?.group_name || matchedCustomer?.groupName || matchedCustomer?.group_name || '');
    setEditGstName(qtn.gstName || matchedLead?.gstName || matchedLead?.companyName || matchedLead?.projectName || matchedCustomer?.gstName || matchedCustomer?.name || cName || '');
    setEditGstNumber(qtn.gstNumber || matchedLead?.gstNumber || matchedLead?.gst_number || matchedCustomer?.gst || matchedCustomer?.gstNumber || matchedCustomer?.gstin || '');
    setEditValidTill(qtn.validTill || qtn.validityDate || '');
    setEditNotes(qtn.notes || qtn.termsAndNotes || '');
    setEditPaymentTerms(quotationPaymentTerms(qtn) === '—' ? '15 Days' : quotationPaymentTerms(qtn));
    setEditTransportCharge(Number(qtn.expectedTransportationCost ?? qtn.transportCharge ?? 0) || 0);

    // Resolve detailed items
    const resolvedItems = quotationDetailItems(qtn);
    // Map with custom ids for editing
    setEditItems(resolvedItems.map((item, idx) => {
      const q = item.quantity !== undefined ? item.quantity : (item.qty !== undefined ? item.qty : 1);
      const p = item.unitPrice !== undefined ? item.unitPrice : (item.price !== undefined ? item.price : 100);
      const d = item.productDetails !== undefined ? item.productDetails : (item.specifications !== undefined ? item.specifications : '');
      return {
        ...item,
        id: item.id || idx + 1,
        productName: item.productName || '',
        productDetails: d,
        quantity: q,
        unitPrice: p,
        discount: item.discount !== undefined ? item.discount : 0,
        tax: item.tax !== undefined ? item.tax : 18
      };
    }));
  };

  const handleEditItemChange = (id, field, value) => {
    setEditItems(editItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddEditItem = () => {
    const nextId = editItems.length > 0 ? Math.max(...editItems.map(i => i.id)) + 1 : 1;
    setEditItems([...editItems, {
      id: nextId,
      productName: '',
      code: `P-PRD-${Math.floor(100 + Math.random() * 900)}`,
      quantity: 1,
      unitPrice: 100,
      discount: 0,
      tax: 18
    }]);
  };

  const handleRemoveEditItem = (id) => {
    if (editItems.length === 1) return;
    setEditItems(editItems.filter(item => item.id !== id));
  };

  const handleEditQuotationSubmit = (e) => {
    e.preventDefault();
    if (
      !editCustomerName.trim() ||
      editItems.some(i => !i.productName.trim() || !i.productDetails.trim()) ||
      !editNotes.trim()
    ) {
      alert('Please fill out all fields and items.');
      return;
    }

    const itemsDescription = editItems.map(item => item.productDetails ? `${item.productName} (${item.productDetails}) (x${item.quantity})` : `${item.productName} (x${item.quantity})`).join(', ');

    // Calculate totals
    const grandTotal = editItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount || 0) / 100;
      const itemTax = (itemSubtotal - itemDiscount) * (item.tax || 0) / 100;
      return sum + (itemSubtotal - itemDiscount + itemTax);
    }, 0);

    onUpdateQuotation(editingQuotation.id, {
      customerName: editCustomerName.trim(),
      groupName: editGroupName.trim(),
      gstName: editGstName.trim(),
      gstNumber: editGstNumber.trim(),
      validTill: editValidTill,
      items: itemsDescription,
      detailedItems: editItems,
      quantity: editItems.reduce((sum, item) => sum + item.quantity, 0),
      price: editItems.length > 0 ? editItems[0].unitPrice : 0,
      discount: editItems.length > 0 ? editItems[0].discount : 0,
      tax: editItems.length > 0 ? editItems[0].tax : 18,
      transportCharge: editTransportCharge === '' || editTransportCharge === null || editTransportCharge === undefined ? 0 : Number(editTransportCharge),
      expectedTransportationCost: editTransportCharge === '' || editTransportCharge === null || editTransportCharge === undefined ? 0 : Number(editTransportCharge),
      totalAmount: Math.round(grandTotal + (editTransportCharge === '' || editTransportCharge === null || editTransportCharge === undefined ? 0 : Number(editTransportCharge))),
      paymentTerms: editPaymentTerms,
      notes: editNotes.trim()
    });

    setEditingQuotation(null);
  };

  const handleUpdateStatusClick = (qId, newStatus, textAction) => {
    Swal.fire({
      title: `${textAction} Quotation?`,
      text: `Are you sure you want to set the status of quotation #QTN-${qId} to "${newStatus}"?`,
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
    Swal.fire({
      title: 'Book Purchase Order?',
      text: `Are you sure you want to convert quotation #QTN-${qtn.id} into a Purchase Order for "${qtn.customerName}"?`,
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
    Swal.fire({
      title: 'Send Quotation?',
      text: `Send quotation #QTN-${qtn.id} to "${qtn.customerName}"?`,
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
    const searchString = typeof search === 'string' ? search : '';
    const matchesSearch = custName.toLowerCase().includes(searchString.toLowerCase()) ||
      qItems.toLowerCase().includes(searchString.toLowerCase());
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
          <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
            {['All', 'Draft', 'Sent', 'Approved', 'Rejected', 'Reminders'].map(st => (
              <button
                key={st}
                className={`filter-pill ${filter === st ? 'active' : ''}`}
                onClick={() => setFilter(st)}
                style={{ color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
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
                    <td>{formatReminderDate(reminder.reminderDate)}{reminder.reminderTime ? ` · ${formatReminderTime(reminder.reminderTime)}` : ''}</td>
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
              <col style={{ width: '12%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Quotation ID</th>
                <th>Customer Name</th>
                <th>Product / Items</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Reminder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    No quotations cataloged.
                  </td>
                </tr>
              ) : (
                displayedQuotations.map((q) => (
                  <tr key={q.id}>
                    <td data-label="Quotation ID" style={{ fontWeight: '700' }}>#{q.quotationNumber || (String(q.id || '').startsWith('QTN-') ? q.id : `QTN-${q.id}`)}</td>
                    <td data-label="Customer Name" style={{ fontWeight: '600' }}>{resolveQuotationCustomerName(q)}</td>
                    <td data-label="Product / Items">{quotationItemsText(q)}</td>
                    <td data-label="Total Value" style={{ fontWeight: '700' }}>{formatINR(quotationTotal(q))}</td>
                    <td data-label="Status">
                      <span className={`badge badge-${(q.status || '').toLowerCase()}`}>
                        {q.status || ''}
                      </span>
                    </td>
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
            @media (max-width: 640px) {
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
                <div key={q.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #f1f3f5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span onClick={() => setSelectedQuotation(q)} style={{ fontSize: '12.5px', fontWeight: '800', color: '#1e3a8a', cursor: 'pointer' }}>
                      #{q.quotationNumber || (String(q.id || '').startsWith('QTN-') ? q.id : `QTN-${q.id}`)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {canConvertQuotation(q.status) ? (
                        <button
                          onClick={() => handleConvertToOrderClick(q)}
                          style={{
                            background: '#2F4375', color: '#ffffff', border: '1px solid #2F4375',
                            padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '11px',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                          }}
                        >
                          Convert to Order →
                        </button>
                      ) : !['CONVERTED', 'CONVERTED_TO_SO', 'CANCELLED', 'REJECTED', 'SUPERSEDED'].includes(normalizedQuotationStatus(q.status)) ? (
                        <button
                          onClick={() => handleSendQuotationClick(q)}
                          style={{
                            background: '#2F4375', color: '#ffffff', border: '1px solid #2F4375',
                            padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '11px',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                          }}
                        >
                          Send Quotation →
                        </button>
                      ) : null}
                      <button onClick={() => setSelectedQuotation(q)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Body Row 1: Customer Name */}
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>
                    {q.customerName}
                  </div>
                  
                  {/* Body Row 2: Items, Total, Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '13px', color: '#475569', fontWeight: '500', flex: 1, paddingRight: '8px' }}>
                      {quotationItemsText(q)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                        {formatINR(quotationTotal(q))}
                      </span>
                      <div style={{ 
                        padding: '4px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700',
                        backgroundColor: (q.status === 'Converted' || q.status === 'Approved') ? '#dcfce7' : (q.status === 'New' || q.status === 'Draft' ? '#dbeafe' : '#f1f5f9'),
                        color: (q.status === 'Converted' || q.status === 'Approved') ? '#15803d' : (q.status === 'New' || q.status === 'Draft' ? '#1d4ed8' : '#475569')
                      }}>
                        {q.status || 'Draft'}
                      </div>
                    </div>
                  </div>

                  {/* Footer Row: Actions */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      title="View Quotation"
                      onClick={() => setSelectedQuotation(q)}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer' }}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      title="Edit Quotation"
                      onClick={() => startEditingQuotation(q)}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      title="Add Reminder"
                      onClick={() => setReminderModal({ quotation: q })}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer' }}
                    >
                      <Bell size={16} />
                    </button>
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
            padding: '24px 16px',
            overflowY: 'auto',
            display: 'flex',
            justify: 'center',
            alignItems: 'flex-start',
            boxSizing: 'border-box'
          }}
        >
          <style>{`
            .quotation-sheet-mobile-flex {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .quotation-sheet-title-flex {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            }
            .quotation-footer-flex {
               display: flex;
               justify-content: space-between;
               align-items: flex-end;
            }
            @media (max-width: 640px) {
              .quotation-sheet-mobile-flex, .quotation-sheet-title-flex, .quotation-footer-flex {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 12px !important;
              }
              .quotation-sheet-right-meta {
                align-self: flex-start !important;
                align-items: flex-start !important;
                width: 100% !important;
              }
              .quotation-footer-contact {
                flex-direction: column !important;
                align-items: center !important;
                gap: 8px !important;
                height: auto !important;
                padding: 20px 16px !important;
              }
              .quotation-footer-wave-wrapper {
                height: auto !important;
                min-height: 100px !important;
              }
              .invoice-sheet-modal {
                padding: 0 !important;
              }
            }
            .invoice-sheet-modal {
              max-height: calc(100vh - 48px);
              overflow-y: auto;
              width: 840px;
              max-width: 100%;
              padding: 0 !important;
              box-sizing: border-box;
              background: #ffffff;
              border-radius: 16px;
              margin: auto;
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
              fontWeight: 700;
            }
          `}</style>
          <div
            className="invoice-sheet-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Wrapper for image export to capture only the document area */}
            <div id="quotation-printable-area" style={{ background: '#ffffff', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
              {/* Curved Header Banner Wave */}
            <div style={{ position: 'relative', width: '100%', height: '150px', overflow: 'hidden', margin: 0, padding: 0 }}>
              <svg viewBox="0 0 840 150" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                {/* Light wave behind */}
                <path d="M 0 0 L 840 0 L 840 30 C 600 15, 450 120, 0 130 Z" fill="#3b82f6" opacity="0.25" />
                {/* Main dark wave */}
                <path d="M 0 0 L 840 0 L 840 15 C 600 5, 450 105, 0 115 Z" fill="#002e5d" />
                {/* White cutout ellipse background for logo */}
                <ellipse cx="80" cy="20" rx="180" ry="115" fill="#ffffff" />
              </svg>
              {/* Content inside wave (Original Himalaya Logo) */}
              <div style={{ position: 'relative', zIndex: 2, padding: '20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: '100%', boxSizing: 'border-box' }}>
                <img src="/himalaya-logo-trimmed.png" alt="Himalaya Logo" style={{ height: '62px', width: 'auto', objectFit: 'contain' }} />
                <div style={{ background: '#ffffff', color: '#002e5d', fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '3px', marginTop: '4px', letterSpacing: '0.5px' }}>
                  COMPOSITES &amp; PRECAST PVT LTD
                </div>
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
                    Ref: QT-2026-{selectedQuotation.id || selectedQuotation.quotationNo}
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

              {/* Items Table */}
              <div className="crm-table-container" style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <table className="crm-table responsive-table" style={{ border: 'none', minWidth: '600px', borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr style={{ background: '#002e5d', color: '#ffffff' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '10.5px', textTransform: 'uppercase', color: '#ffffff', width: '40px', textAlign: 'center', background: '#002e5d' }}>#</th>
                      <th style={{ padding: '12px 14px', fontWeight: '700', fontSize: '10.5px', textTransform: 'uppercase', color: '#ffffff', textAlign: 'left', background: '#002e5d' }}>Product Details</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', fontSize: '10.5px', textTransform: 'uppercase', color: '#ffffff', width: '60px', background: '#002e5d' }}>Qty</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', fontSize: '10.5px', textTransform: 'uppercase', color: '#ffffff', width: '100px', background: '#002e5d' }}>Rate</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', fontSize: '10.5px', textTransform: 'uppercase', color: '#ffffff', width: '100px', background: '#002e5d' }}>Tax (GST)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', fontSize: '10.5px', textTransform: 'uppercase', color: '#ffffff', width: '120px', background: '#002e5d' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.map((item, index) => {
                      const itemSubtotal = item.quantity * item.unitPrice;
                      const discountValue = itemSubtotal * (item.discount || 0) / 100;
                      const taxable = itemSubtotal - discountValue;
                      const taxValue = taxable * (item.tax !== undefined ? item.tax : 18) / 100;
                      const itemTotal = taxable + taxValue;

                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td data-label="#" style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{index + 1}</td>
                          <td data-label="Product Details" style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: '700', color: '#0f2c59' }}>{item.productName}</div>
                            {item.productDetails && (
                              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>{item.productDetails}</div>
                            )}
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>Code: {item.code}</div>
                          </td>
                          <td data-label="Qty" style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#0f2c59' }}>{item.quantity}</td>
                          <td data-label="Rate" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '600', color: '#334155' }}>{formatINR(item.unitPrice)}</td>
                          <td data-label="Tax (GST)" style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>{item.tax !== undefined ? item.tax : 18}%</td>
                          <td data-label="Total" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: '#0f2c59' }}>{formatINR(itemTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Calculations Invoice Summary panel */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', margin: '14px 0 20px 0', gap: '6px' }}>
                {/* Subtotal row */}
                <div style={{ display: 'flex', width: '280px', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '4px', background: '#e0f2fe' }}>
                      <FileText size={12} color="#0284c7" />
                    </span>
                    Items Subtotal:
                  </span>
                  <span style={{ fontWeight: '700', color: '#0f2c59' }}>{formatINR(calculatedSubtotal)}</span>
                </div>

                {/* GST row */}
                <div style={{ display: 'flex', width: '280px', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '4px', background: '#e0f2fe' }}>
                      <Percent size={12} color="#0284c7" />
                    </span>
                    GST Amount:
                  </span>
                  <span style={{ fontWeight: '700', color: '#0f2c59' }}>{formatINR(calculatedTaxAmt)}</span>
                </div>

                {/* Expected Transportation Cost */}
                {(Number(selectedQuotation.transportCharge ?? selectedQuotation.expectedTransportationCost ?? 0) >= 0) && (
                  <div style={{ display: 'flex', width: '280px', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', border: '1px solid #f0fdf4', borderRadius: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0369a1', fontWeight: '600' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '4px', background: '#e0fdf4' }}>
                        <Truck size={12} color="#0369a1" />
                      </span>
                      Expected Transportation Cost:
                    </span>
                    <span style={{ fontWeight: '700', color: '#0369a1' }}>+{formatINR(Number(selectedQuotation.transportCharge ?? selectedQuotation.expectedTransportationCost ?? 0))}</span>
                  </div>
                )}

                {/* Grand Total row */}
                <div style={{ display: 'flex', width: '280px', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#3b82f6', borderRadius: '6px', color: '#ffffff', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.15)' }}>
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
              <div style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#002e5d', color: '#ffffff', padding: '10px 16px', gap: '8px', fontWeight: '700', fontSize: '12.5px' }}>
                  <div style={{ background: '#0284c7', width: '22px', height: '22px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckSquare size={13} color="#ffffff" />
                  </div>
                  TERMS AND CONDITIONS :-
                </div>
                <div className="terms-container" style={{ padding: '12px 16px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    "Payment Terms",
                    "Unloading at Client scope & breakage risk & responsibility",
                    "Delivery timeline",
                    "Any Dispute Shall Be Subject To Ahmedabad Jurisdiction",
                    "Manufacturer Test Report shall be provided",
                    "Different Colour Options available at additional 10% cost"
                  ].map((term, i) => (
                    <div key={i} className="term-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '5px 0', borderBottom: i < 5 ? '1px dashed #f1f5f9' : 'none' }}>
                      <div className="term-number">
                        {i + 1}
                      </div>
                      <div className="term-text" style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600' }}>{term}</div>
                    </div>
                  ))}
                </div>
              </div>

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
                  {/* Circular Seal SVG */}
                  <svg width="80" height="80" viewBox="0 0 100 100" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <defs>
                      <path id="seal-text-path-top" d="M 16 50 A 34 34 0 0 1 84 50" fill="none" />
                      <path id="seal-text-path-bottom" d="M 84 50 A 34 34 0 0 1 16 50" fill="none" />
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#002e5d" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#002e5d" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
                    <circle cx="50" cy="50" r="34" fill="none" stroke="#002e5d" strokeWidth="1" />
                    {/* Mountains in the center */}
                    <g transform="translate(34, 34) scale(0.08)" fill="#002e5d">
                      <path d="M120 220 L180 80 L230 180 L280 60 L380 220 Z" />
                      <path d="M180 80 L210 140 L230 180" stroke="#ffffff" strokeWidth="3" />
                    </g>
                    <text fontSize="5.8" fontWeight="800" fill="#002e5d">
                      <textPath href="#seal-text-path-top" startOffset="50%" textAnchor="middle">
                        STRENGTH • DURABILITY • TRUST
                      </textPath>
                    </text>
                    <text fontSize="7.8" fontWeight="950" fill="#002e5d">
                      <textPath href="#seal-text-path-bottom" startOffset="50%" textAnchor="middle">
                        HIMALAYA
                      </textPath>
                    </text>
                  </svg>
                  
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
                  {/* Styled vector cursive signature path */}
                  <div style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '15px' }}>
                    <svg width="100" height="30" viewBox="0 0 100 30" style={{ opacity: 0.85 }}>
                      <path d="M 8 22 C 20 8, 28 4, 36 18 C 44 26, 48 4, 56 15 C 64 26, 72 18, 88 20" fill="none" stroke="#002e5d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 24 15 L 72 15" fill="none" stroke="#002e5d" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
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

            {/* Close / Convert Action controls wrapper */}
            <div className="sheet-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px 32px 20px 32px', boxSizing: 'border-box', background: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={() => setSelectedQuotation(null)}
                  style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', margin: 0 }}
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    try {
                      await exportQuotationPDF({ ...selectedQuotation, clientAddress, clientGST });
                      Swal.fire('Downloaded', 'Quotation PDF has been downloaded.', 'success');
                    } catch (err) {
                      console.error('Error generating PDF:', err);
                      Swal.fire('Error', 'Failed to generate PDF.', 'error');
                    }
                  }}
                  style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    try {
                      Swal.fire({
                        title: 'Generating Image...',
                        text: 'Please wait while we render a high-quality image.',
                        allowOutsideClick: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });
                      const filename = `Quotation_${selectedQuotation.quotationNo || selectedQuotation.id || 'Draft'}.png`;
                      await exportQuotationImage('quotation-printable-area', filename);
                      Swal.close();
                      Swal.fire('Success', 'Quotation image downloaded successfully.', 'success');
                    } catch (err) {
                      console.error('Error generating image:', err);
                      Swal.close();
                      Swal.fire('Error', 'Failed to generate image.', 'error');
                    }
                  }}
                  style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Image size={14} /> Download Image
                </button>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    try {
                      // 1. Generate the PDF blob
                      const pdfBlob = await exportQuotationPDF({ ...selectedQuotation, clientAddress, clientGST }, true);
                      
                      // 2. Prepare sharing data
                      const file = new File([pdfBlob], `Quotation_${selectedQuotation.quotationNo || 'Draft'}.pdf`, { type: 'application/pdf' });
                      const shareData = {
                        title: `Quotation ${selectedQuotation.quotationNo}`,
                        text: `Here is the quotation for ${selectedQuotation.customerName}.`,
                        files: [file]
                      };
                      
                      // 3. Try native share with files
                      if (navigator.canShare && navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                        return;
                      }
                      
                      // Fallback text if file sharing is not supported
                      const textShareData = {
                        title: `Quotation ${selectedQuotation.quotationNo}`,
                        text: `Here is the quotation for ${selectedQuotation.customerName}.`,
                        url: window.location.href
                      };
                      
                      if (navigator.share) {
                        await navigator.share(textShareData);
                      } else {
                        throw new Error("Share API not supported");
                      }
                    } catch (err) {
                      console.log('Native share failed or unsupported, using fallback popup:', err);
                      const encodedText = encodeURIComponent(`Here is the quotation for ${selectedQuotation.customerName}: ${window.location.href}`);
                      Swal.fire({
                        title: 'Share Quotation PDF',
                        html: `
                            <div style="display:flex; flex-direction:column; gap:12px; margin-top: 10px;">
                              <a href="https://wa.me/?text=${encodedText}" target="_blank" style="background:#25D366; color:#fff; text-decoration:none; padding:12px; border-radius:8px; font-weight:bold; display:flex; justify-content:center; align-items:center; gap:8px;">Share on WhatsApp</a>
                              <a href="mailto:?subject=Quotation%20${selectedQuotation.quotationNo}&body=${encodedText}" style="background:#ea4335; color:#fff; text-decoration:none; padding:12px; border-radius:8px; font-weight:bold; display:flex; justify-content:center; align-items:center; gap:8px;">Share via Email</a>
                            </div>
                          `,
                        showConfirmButton: false,
                        showCloseButton: true,
                        customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title' }
                      });
                    }
                  }}
                  style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Share2 size={14} /> Share PDF
                </button>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    try {
                      Swal.fire({
                        title: 'Preparing Image...',
                        text: 'Please wait while we render the sharing image.',
                        allowOutsideClick: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });
                      
                      const qNo = selectedQuotation.quotationNo || selectedQuotation.id || 'Draft';
                      const res = await shareQuotationImage('quotation-printable-area', qNo, selectedQuotation.customerName);
                      Swal.close();
                      
                      if (!res.success) {
                        // Native share unsupported fallback
                        Swal.fire({
                          title: 'Share Quotation Image',
                          html: `
                            <div style="display:flex; flex-direction:column; gap:12px; margin-top: 10px; align-items: center;">
                              <p style="font-size: 13.5px; color: #475569; margin: 0 0 10px 0; text-align: center;">Native sharing is not supported by your browser. You can download the image below or copy/share it manually.</p>
                              <img src="${res.dataUrl}" style="max-width: 100%; max-height: 250px; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
                              <a href="${res.dataUrl}" download="Quotation_${qNo}.png" style="background:#0284c7; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; display:flex; justify-content:center; align-items:center; gap:8px; width: 80%; margin-top: 10px;">Download Image File</a>
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
                      Swal.fire('Error', 'Failed to share image.', 'error');
                    }
                  }}
                  style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Share2 size={14} /> Share Image
                </button>
              </div>

              {canSendQuotation(selectedQuotation.status) ? (
                <div>
                  <button
                    type="button"
                    className="btn-small btn-primary-small"
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
                    className="btn-small btn-primary-small"
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
