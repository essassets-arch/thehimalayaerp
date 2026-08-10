import { useState, useEffect, useMemo } from 'react';
import { exportQuotationPDF } from '../services/export.service';
import { Search, Plus, Eye, ArrowRight, Download, Share2, Edit, Trash2, Truck, ChevronLeft, ChevronRight, ArrowLeft, FileText, Bell, ShieldCheck, ChevronDown, MoreVertical } from 'lucide-react';
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
    ? ['7 Days', '15 Days', '20 Days', '30 Days', '90 Days', 'Custom']
    : ['7 Days', '15 Days', '20 Days', 'Custom'];
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
    if (Array.isArray(quotation?.items)) {
      return quotation.items
        .map(item => `${item.productName || item.name || 'Item'} (${Number(item.quantity || item.qty || 0)} ${item.unit || 'Qty'})`)
        .join(', ');
    }
    return String(quotation?.items || quotation?.products || '');
  };
  const quotationDetailItems = (quotation) => {
    const source = Array.isArray(quotation?.detailedItems)
      ? quotation.detailedItems
      : Array.isArray(quotation?.items)
        ? quotation.items
        : [];
    return source.map((item, index) => ({
      ...item,
      id: item.id || index + 1,
      productName: item.productName || item.name || 'Item',
      productDetails: item.productDetails || item.specification || item.description || '',
      code: item.code || item.productCode || item.productId || `PRD-${index + 1}`,
      quantity: Number(item.quantity ?? item.qty ?? 0),
      unitPrice: Number(item.unitPrice ?? item.rate ?? item.price ?? 0),
      discount: Number(item.discount ?? item.discountPercent ?? 0),
      tax: Number(item.tax ?? item.gstPercent ?? 0),
    }));
  };
  const quotationTotal = (quotation) =>
    Number(quotation?.totalAmount ?? quotation?.grandTotal ?? 0);
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
      transportCharge: editTransportCharge || 0,
      expectedTransportationCost: editTransportCharge || 0,
      totalAmount: Math.round(grandTotal + (editTransportCharge || 0)),
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
    const next = getNextPendingReminder(quotationReminders, 'Quotation', q.id);
    if (!next) return <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>;
    return (
      <span style={{ fontSize: '12px', fontWeight: '700' }}>
        {formatReminderDate(next.reminderDate)}
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

  const calculatedSubtotal = itemsList.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
  const discountAmt = itemsList.reduce((sum, item) => sum + (((item.quantity || 0) * (item.unitPrice || 0)) * (item.discount || 0) / 100), 0);
  const calculatedTaxAmt = itemsList.reduce((sum, item) => {
    const sub = (item.quantity || 0) * (item.unitPrice || 0);
    const disc = sub * (item.discount || 0) / 100;
    return sum + ((sub - disc) * (item.tax !== undefined ? item.tax : 18) / 100);
  }, 0);

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

  // ── Show Inline Edit Quotation Form ──
  if (editingQuotation) {
    // Computed totals for the edit form
    const editSubtotal = editItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const editDiscountAmt = editItems.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * (item.discount || 0) / 100), 0);
    const editTaxAmt = editItems.reduce((sum, item) => {
      const sub = item.quantity * item.unitPrice;
      const disc = sub * (item.discount || 0) / 100;
      return sum + ((sub - disc) * (item.tax || 0) / 100);
    }, 0);
    const editGrandTotal = editSubtotal - editDiscountAmt + editTaxAmt + (editTransportCharge || 0);

    return (
      <div className="app-card" style={{ flex: 1 }}>
        <div className="module-header-row" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" className="card-top-icon-btn" onClick={() => setEditingQuotation(null)} style={{ width: '36px', height: '36px', background: '#f1f3f5', color: '#000' }}>
              <ArrowLeft size={16} />
            </button>
            <h2 className="module-title">Edit Quotation Proposal</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Ref: QTN-{editingQuotation.id}</span>
        </div>

        <form onSubmit={handleEditQuotationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer & General Metadata */}
          <div className="quotation-customer-grid">
            <div className="form-group quotation-customer-field" style={{ position: 'relative' }}>
              <label className="form-label">Customer / Corporate Company *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search existing lead or customer"
                  value={editCustomerName}
                  onChange={e => {
                    const nextValue = e.target.value;
                    const nextMatch = editCustomerOptions.find(option => normalizeText(option.name) === normalizeText(nextValue));
                    setEditCustomerName(nextValue);
                    setEditCustomerSearchOpen(true);
                    if (!nextMatch) {
                      setEditGroupName('');
                    }
                  }}
                  onFocus={() => setEditCustomerSearchOpen(true)}
                  onBlur={() => setTimeout(() => setEditCustomerSearchOpen(false), 180)}
                  required
                  style={{ paddingRight: '38px' }}
                />
                <ChevronDown size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5E6B82', pointerEvents: 'none' }} />
                {editCustomerSearchOpen && (
                  <div
                    className="smart-search-dropdown"
                    style={{
                      width: '100%',
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      zIndex: 40,
                      maxHeight: '260px',
                      overflowY: 'auto',
                      borderRadius: '10px',
                      boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)'
                    }}
                  >
                    {filteredEditCustomerOptions.length > 0 ? (
                      filteredEditCustomerOptions.map(option => (
                        <button
                          key={option.key}
                          type="button"
                          className="smart-search-item"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectEditCustomerOption(option);
                          }}
                          style={{ width: '100%', textAlign: 'left', border: 0, background: 'transparent', display: 'block' }}
                        >
                          <span style={{ display: 'block', fontWeight: 800 }}>{option.name}</span>
                          <span style={{ display: 'block', fontSize: '11.5px', color: '#5E6B82', marginTop: '2px' }}>{option.subtitle}</span>
                        </button>
                      ))
                    ) : (
                      <div style={{ padding: '12px', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', margin: '6px', fontSize: '12.5px', fontWeight: 700 }}>
                        No lead/customer found. Enter name manually or create lead first.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Group Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. NHAI Group"
                value={editGroupName}
                onChange={e => setEditGroupName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">GST Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Legal name as per GST registration"
                value={editGstName}
                onChange={e => setEditGstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">GST Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 09ABCDE1234F1Z5"
                value={editGstNumber}
                onChange={e => setEditGstNumber(e.target.value.toUpperCase())}
                maxLength={15}
                required
              />
            </div>
          </div>

          {/* Row 2: Validity + Transport — same as Create form */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quotation Validity Period *</label>
              <input
                type="date"
                className="form-input"
                value={editValidTill}
                onChange={e => setEditValidTill(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Truck size={12} /> Expected Transportation Cost (₹)
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 2500"
                min="0"
                value={editTransportCharge || ''}
                onChange={e => setEditTransportCharge(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <FileText size={14} /> Line Items Catalogue
            </h3>
            <div className="crm-table-container" style={{ marginTop: 0, overflow: 'visible' }}>
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Product &amp; Specification Details *</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Quantity *</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Unit Price (₹) *</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Discount (%)</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>GST (%)</th>
                    <th style={{ width: '13%', textAlign: 'right' }}>Total Amount</th>
                    <th style={{ width: '5%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {editItems.map((item) => {
                    const itemSubtotal = item.quantity * item.unitPrice;
                    const discVal = itemSubtotal * (item.discount || 0) / 100;
                    const taxVal = (itemSubtotal - discVal) * (item.tax || 0) / 100;
                    const total = itemSubtotal - discVal + taxVal;
                    return (
                      <tr key={item.id}>
                        <td data-label="Product Details">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Search product..."
                              value={item.productName}
                              onChange={e => handleEditItemChange(item.id, 'productName', e.target.value)}
                              required
                              style={{ padding: '8px 12px' }}
                            />
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Specifications / Color details * (e.g. Color: Grey, Size: M10)"
                              value={item.productDetails || ''}
                              onChange={e => handleEditItemChange(item.id, 'productDetails', e.target.value)}
                              required
                              style={{ padding: '6px 12px', fontSize: '12.5px' }}
                            />
                          </div>
                        </td>
                        <td data-label="Qty">
                          <input
                            type="number"
                            className="form-input"
                            min="1"
                            value={item.quantity}
                            onChange={e => handleEditItemChange(item.id, 'quantity', Number(e.target.value))}
                            required
                            style={{ padding: '8px 12px', textAlign: 'center' }}
                          />
                        </td>
                        <td data-label="Rate">
                          <input
                            type="number"
                            className="form-input"
                            min="0"
                            value={item.unitPrice}
                            onChange={e => handleEditItemChange(item.id, 'unitPrice', Number(e.target.value))}
                            required
                            style={{ padding: '8px 12px', textAlign: 'center' }}
                          />
                        </td>
                        <td data-label="Discount">
                          <input
                            type="number"
                            className="form-input"
                            min="0"
                            max="100"
                            value={item.discount || 0}
                            onChange={e => handleEditItemChange(item.id, 'discount', Number(e.target.value))}
                            required
                            style={{ padding: '8px 12px', textAlign: 'center' }}
                          />
                        </td>
                        <td data-label="Tax">
                          <input
                            type="number"
                            className="form-input"
                            min="0"
                            max="100"
                            value={item.tax || 0}
                            onChange={e => handleEditItemChange(item.id, 'tax', Number(e.target.value))}
                            required
                            style={{ padding: '8px 12px', textAlign: 'center' }}
                          />
                        </td>
                        <td data-label="Total Amount" style={{ fontWeight: '700', paddingLeft: '10px', textAlign: 'right' }}>
                          {formatINR(total)}
                        </td>
                        <td data-label="Action" style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-small btn-danger-small"
                            onClick={() => handleRemoveEditItem(item.id)}
                            disabled={editItems.length === 1}
                            style={{ padding: '8px', opacity: editItems.length === 1 ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="btn-small btn-outline-small"
              onClick={handleAddEditItem}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontWeight: '700' }}
            >
              <Plus size={14} /> Add Product Row
            </button>
          </div>

          {/* Totals & Notes — same layout as Create form */}
          <div className="totals-layout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Terms / Notes</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '135px' }}
                  placeholder="Enter quotation instructions, custom bank details, dispatch terms..."
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                />
              </div>

              {/* Payment Terms — same as Create form with Custom support */}
              <div style={{ background: '#f8f9fa', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', marginBottom: 0 }}>Payment Terms *</label>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                  {paymentTermOptions.map((term) => {
                    const isChecked = term === 'Custom'
                      ? !predefinedTerms.includes(editPaymentTerms)
                      : editPaymentTerms === term;
                    return (
                      <label key={term} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (term === 'Custom') {
                              setEditPaymentTerms('');
                            } else {
                              setEditPaymentTerms(term);
                            }
                          }}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        {term}
                      </label>
                    );
                  })}
                </div>
                {!predefinedTerms.includes(editPaymentTerms) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      placeholder="Enter number of days..."
                      value={editPaymentTerms.replace(/ Days/gi, '').trim()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditPaymentTerms(val ? `${val} Days` : '');
                      }}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: '13.5px', fontWeight: '500', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>Days</span>
                  </div>
                )}
              </div>
            </div>

            {/* Aggregated Totals Panel — same as Create form */}
            <div style={{ background: '#f8f9fa', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
                <ShieldCheck size={14} /> Totals Invoice Summary
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{formatINR(editSubtotal)}</span>
                </div>
                {editDiscountAmt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>Discount Applied:</span>
                    <span>-{formatINR(editDiscountAmt)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>GST Tax Value:</span>
                  <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>+{formatINR(editTaxAmt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0369a1' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={11} /> Expected Transportation Cost:</span>
                  <span style={{ fontWeight: '600' }}>+{formatINR(editTransportCharge || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '800', borderTop: '1px solid #e5e7eb', paddingTop: '10px', marginTop: '6px' }}>
                  <span>Grand Total (INR):</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{formatINR(editGrandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons — same as Create form */}
          <div className="form-actions">
            <button type="submit" className="form-submit-btn">Update Quotation Proposal</button>
            <button type="button" className="btn-small btn-outline-small" onClick={() => setEditingQuotation(null)}>Cancel</button>
          </div>
        </form>
      </div>
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
                    <td data-label="Quotation ID" style={{ fontWeight: '700' }}>#{String(q.id || '').startsWith('QTN-') ? q.id : `QTN-${q.id}`}</td>
                    <td data-label="Customer Name" style={{ fontWeight: '600' }}>{q.customerName}</td>
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
                      #{String(q.id || '').startsWith('QTN-') ? q.id : `QTN-${q.id}`}
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
                flex-direction: column;
                align-items: flex-start !important;
                gap: 12px;
              }
              .quotation-sheet-mobile-flex > div:nth-child(2),
              .quotation-footer-flex > div:nth-child(2) {
                align-self: flex-start;
                text-align: left !important;
              }
              .invoice-sheet-modal {
                padding: 16px !important;
              }
            }
            .invoice-sheet-modal {
              max-height: calc(100vh - 48px);
              overflow-y: auto;
              width: 840px;
              max-width: 100%;
              padding: 28px 32px;
              box-sizing: border-box;
              background: #ffffff;
              border-radius: 16px;
              margin: auto;
            }
          `}</style>
          <div
            className="invoice-sheet-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Branding Header - Himalaya Letterhead */}
            <div className="sheet-header quotation-sheet-mobile-flex" style={{ marginBottom: '14px' }}>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0F2C59', margin: 0, fontFamily: 'sans-serif', letterSpacing: '-0.2px' }}>
                  Himalaya Composites &amp; Precast Pvt Ltd
                </h1>
                <p style={{ fontSize: '10.5px', fontWeight: '700', color: '#0F2C59', margin: '2px 0 6px 0', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  FORMERLY KNOWN AS AKBERALI PRECAST PVT LTD
                </p>
                <div style={{ fontSize: '10.5px', color: '#1e293b', fontWeight: '600', lineHeight: '1.45' }}>
                  <p style={{ margin: 0 }}>PLOT NO.25&amp;26, SURVEY NO.35(OLD-27-A), EVOKE INDUSTRIAL PARK,</p>
                  <p style={{ margin: 0 }}>BAREJA KHEDA ROAD, MALARPURA,KHEDA,GUJARAT</p>
                  <p style={{ margin: 0 }}>GSTIN/UIN: <span style={{ fontWeight: '700' }}>24AAICH3332B1Z6</span></p>
                  <p style={{ margin: 0 }}>E-Mail : <a href="mailto:info@thehimalaya.co.in" style={{ color: '#0F2C59', textDecoration: 'underline' }}>info@thehimalaya.co.in</a></p>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: '4px' }}>
                <img src="/himalaya-logo-trimmed.png" alt="Himalaya Logo" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Horizontal Solid Branding Divider */}
            <hr style={{ border: 'none', borderTop: '2px solid #000000', margin: '0 0 16px 0' }} />

            {/* Document Title & Ref Banner */}
            <div className="quotation-sheet-title-flex">
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', letterSpacing: '0.5px', margin: 0, textTransform: 'uppercase' }}>QUOTATION</h2>
              <p style={{ fontSize: '13px', color: '#475569', fontWeight: '700', margin: 0 }}>Ref: QT-2026-{selectedQuotation.id || selectedQuotation.quotationNo}</p>
            </div>

            {/* Client Coordinates & Invoice Details */}
            <div className="sheet-meta">
              <div>
                <p style={{ margin: 0, fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Quoted To:</p>
                <p style={{ margin: '4px 0 0 0', fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{selectedQuotation.customerName}</p>
                <p style={{ margin: '2px 0 0 0', color: '#475569', fontWeight: '500' }}>{clientAddress}</p>
                <p style={{ margin: '4px 0 0 0', color: '#475569', fontWeight: '600' }}>GST: <span style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}>{clientGST}</span></p>
              </div>
              <div style={{ textAlign: 'right', fontWeight: '500', color: '#475569' }}>
                <p style={{ margin: 0 }}><strong>Quotation Date:</strong> {selectedQuotation.date || selectedQuotation.createdAt?.slice(0, 10) || '—'}</p>
                <p style={{ margin: '4px 0 0 0' }}><strong>Payment Terms:</strong> {quotationPaymentTerms(selectedQuotation)}</p>
                <p style={{ margin: '4px 0 0 0' }}><strong>Revision:</strong> Version 1</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="crm-table-container" style={{ margin: '0 0 20px 0', border: '1px solid #eaeaea', overflowX: 'auto' }}>
              <table className="crm-table responsive-table" style={{ border: 'none', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Product Details</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Qty</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Rate</th>
                    {/* Discount column removed as per request */}
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Tax (GST)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Total</th>
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
                      <tr key={index}>
                        <td data-label="Product Details">
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.productName}</div>
                          {item.productDetails && (
                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>{item.productDetails}</div>
                          )}
                          <div style={{ fontSize: '11px', color: '#5E6B82', marginTop: '2px', fontFamily: 'monospace' }}>Code: {item.code}</div>
                        </td>
                        <td data-label="Qty" style={{ textAlign: 'center', fontWeight: '600', color: '#334155' }}>{item.quantity}</td>
                        <td data-label="Rate" style={{ textAlign: 'center', fontWeight: '600', color: '#334155' }}>{formatINR(item.unitPrice)}</td>
                        {/* Discount cell removed as per request */}
                        <td data-label="Tax (GST)" style={{ textAlign: 'center', fontWeight: '600', color: '#5E6B82' }}>{item.tax !== undefined ? item.tax : 18}%</td>
                        <td data-label="Total" style={{ textAlign: 'right', fontWeight: '800', color: '#1e293b' }}>{formatINR(itemTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations Invoice Summary panel */}
            <div className="sheet-summary">
              <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: '500' }}>
                <span>Items Subtotal:</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatINR(calculatedSubtotal)}</span>
              </div>
              {/* Discount Applied row removed as per request */}
              <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: '500' }}>
                <span>GST Amount:</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatINR(calculatedTaxAmt)}</span>
              </div>
              {(Number(selectedQuotation.transportCharge ?? selectedQuotation.expectedTransportationCost ?? 0) > 0) && (
                <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '13.5px', color: '#0369a1', fontWeight: '500' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={12} /> Transport (Approx.):</span>
                  <span style={{ fontWeight: '600' }}>+{formatINR(Number(selectedQuotation.transportCharge ?? selectedQuotation.expectedTransportationCost ?? 0))}</span>
                </div>
              )}
              <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#1e293b', borderTop: '1px solid #eaeaea', paddingTop: '8px', marginTop: '4px' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#1e293b', fontSize: '17px' }}>{formatINR(quotationTotal(selectedQuotation))}</span>
              </div>
            </div>

            {/* Embedded styles for Terms & Clients */}
            <style dangerouslySetInnerHTML={{__html: `
              .terms-container {
                padding: 10px 16px;
                background: #ffffff;
                display: flex;
                flex-direction: column;
                gap: 4px;
              }
              .term-item {
                display: flex;
                align-items: flex-start;
                padding: 4px 0;
              }
              .term-number {
                width: 40px;
                font-weight: 600;
                color: #1e293b;
              }
              .term-text {
                flex: 1;
                color: #1e293b;
              }
              
              .clients-container {
                padding: 16px 24px;
                background: #ffffff;
                display: flex;
                justify-content: space-around;
                align-items: center;
                flex-wrap: wrap;
                gap: 20px;
              }

              @media (max-width: 640px) {
                .clients-container {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 24px 16px;
                  justify-items: center;
                  padding: 24px 16px;
                }
                .clients-container img {
                  max-height: 40px !important;
                }
              }
            `}} />

            {/* Terms & Conditions Section */}
            <div style={{ marginTop: '24px', border: '1px solid #1e293b' }}>
              <div style={{ background: '#1e293b', color: '#ffffff', padding: '6px 12px', fontWeight: '700', fontSize: '13px', textDecoration: 'underline', letterSpacing: '0.5px' }}>
                TERMS AND CONDITIONS :-
              </div>
              <div className="terms-container">
                <div className="term-item">
                  <div className="term-number">1</div>
                  <div className="term-text">Payment Terms</div>
                </div>
                <div className="term-item">
                  <div className="term-number">2</div>
                  <div className="term-text">Unloading at Client scope &amp; breakage risk &amp; responsibility</div>
                </div>
                <div className="term-item">
                  <div className="term-number">3</div>
                  <div className="term-text">Delivery timeline</div>
                </div>
                <div className="term-item">
                  <div className="term-number">4</div>
                  <div className="term-text">Any Dispute Shall Be Subject To Ahmedabad Jurisdiction</div>
                </div>
                <div className="term-item">
                  <div className="term-number">5</div>
                  <div className="term-text">Manufacturer Test Report shall be provided</div>
                </div>
                <div className="term-item">
                  <div className="term-number">6</div>
                  <div className="term-text">Different Colour Options available at additional 10% cost</div>
                </div>
              </div>
            </div>

            {/* Valuable Clients Section */}
            <div style={{ marginTop: '16px', border: '1px solid #1e293b' }}>
              <div style={{ background: '#1e293b', color: '#ffffff', padding: '6px 12px', textAlign: 'center', fontWeight: '700', fontSize: '13px', textDecoration: 'underline', letterSpacing: '0.5px' }}>
                VALUABLE CLIENTS
              </div>
              <div className="clients-container">
                {/* Reliance Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/client-logos/reliance-logo.png" alt="Reliance Industries Limited" style={{ maxHeight: '48px', maxWidth: '140px', objectFit: 'contain' }} />
                </div>
                {/* Adani Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/client-logos/adani-logo.png" alt="adani" style={{ maxHeight: '42px', maxWidth: '130px', objectFit: 'contain' }} />
                </div>
                {/* L&T Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/client-logos/lt-logo.png" alt="L&T" style={{ maxHeight: '46px', maxWidth: '110px', objectFit: 'contain' }} />
                </div>
                {/* A.SHRIDHAR Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/client-logos/ashridhar-logo.png" alt="A.SHRIDHAR" style={{ maxHeight: '44px', maxWidth: '140px', objectFit: 'contain' }} />
                </div>
              </div>
            </div>

            {/* Sign-off & Authorised Signatory Footer */}
            <div className="quotation-footer-flex" style={{ marginTop: '28px', marginBottom: '20px', paddingBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: '#1e293b', fontStyle: 'italic', lineHeight: '1.6' }}>
                <p style={{ margin: 0 }}>Thanks and waiting for your valued order</p>
                <p style={{ margin: '8px 0 0 0' }}>Yours truly,</p>
              </div>
              <div style={{ textAlign: 'right', color: '#1e293b' }}>
                <p style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: '#0F2C59' }}>
                  For Himalaya Composites &amp; Precast Pvt Ltd
                </p>
                <p style={{ margin: '2px 0 0 0', fontStyle: 'italic', fontSize: '12px', color: '#475569' }}>
                  (Formerly known as Akberali Precast Pvt Ltd)
                </p>
                <div style={{ height: '45px' }}></div>
                <p style={{ margin: 0, fontWeight: '800', fontSize: '13px', color: '#1e293b' }}>
                  Authorised Signatory
                </p>
              </div>
            </div>

            {/* Close / Convert Action controls */}
            <div className="sheet-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
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
                  onClick={() => {
                    try {
                      exportQuotationPDF(selectedQuotation);
                      Swal.fire('Downloaded', 'Quotation PDF has been downloaded.', 'success');
                    } catch (err) {
                      console.error('Error generating PDF:', err);
                      Swal.fire('Error', 'Failed to generate PDF.', 'error');
                    }
                  }}
                  style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={14} /> Download
                </button>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={async () => {
                    try {
                      // 1. Generate the PDF blob
                      const pdfBlob = exportQuotationPDF(selectedQuotation, true);
                      
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
                        title: 'Share Quotation',
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
                  <Share2 size={14} /> Share
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
