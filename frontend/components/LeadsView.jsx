import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Plus, Clipboard, Edit, ChevronLeft, ChevronRight, Bell, Trash2, FlaskConical, FileText, ShieldCheck, MoreVertical, Calendar, X } from 'lucide-react';
import Swal from 'sweetalert2';
import ReminderModal from '../shared/components/ReminderModal.jsx';
import {
  formatReminderDate,
  formatReminderTime,
  getNextPendingReminder,
  getReminderTimingLabel,
  filterRemindersByBucket
} from '../shared/utils/reminderUtils.js';
import { useRouter } from 'next/navigation';
import { useERPStore, getLeadQuotationState, getLeadSampleState } from '../store/erpStore';
import { displayEntityId } from '../store/idGenerator';
import SalesOwnerBadge from './SalesOwnerBadge.jsx';

const parseAnyDate = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;

  if (typeof raw === 'number') {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const matchYmd = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (matchYmd) {
      const year = parseInt(matchYmd[1], 10);
      const month = parseInt(matchYmd[2], 10) - 1;
      const day = parseInt(matchYmd[3], 10);

      if (trimmed.includes('T') || trimmed.includes(' ')) {
        const d = new Date(trimmed);
        if (!Number.isNaN(d.getTime())) return d;
      }
      return new Date(year, month, day);
    }

    const matchDmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (matchDmy) {
      const day = parseInt(matchDmy[1], 10);
      const month = parseInt(matchDmy[2], 10) - 1;
      const year = parseInt(matchDmy[3], 10);
      return new Date(year, month, day);
    }
  }

  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatLeadDate = (value) => {
  if (!value) return '—';
  const d = parseAnyDate(value);
  if (!d) return String(value);
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatMonthOptionLabel = (yyyyMm) => {
  if (!yyyyMm || !/^\d{4}-\d{2}$/.test(yyyyMm)) return yyyyMm;
  const [y, m] = yyyyMm.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
};

const isLeadInDateRange = (rawDateVal, monthFilter, fromDateVal, toDateVal) => {
  if (monthFilter === 'ALL' && !fromDateVal && !toDateVal) {
    return true;
  }

  const d = parseAnyDate(rawDateVal);
  if (!d) {
    return false;
  }

  const year = d.getFullYear();
  const month = d.getMonth();

  if (monthFilter && monthFilter !== 'ALL' && monthFilter !== 'CUSTOM') {
    const now = new Date();
    let targetYear, targetMonth;

    if (monthFilter === 'THIS_MONTH') {
      targetYear = now.getFullYear();
      targetMonth = now.getMonth();
    } else if (monthFilter === 'LAST_MONTH') {
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      targetYear = prevMonthDate.getFullYear();
      targetMonth = prevMonthDate.getMonth();
    } else if (/^\d{4}-\d{2}$/.test(monthFilter)) {
      const [y, m] = monthFilter.split('-').map(Number);
      targetYear = y;
      targetMonth = m - 1;
    }

    if (targetYear !== undefined && targetMonth !== undefined) {
      if (year !== targetYear || month !== targetMonth) {
        return false;
      }
    }
  }

  if (monthFilter === 'CUSTOM') {
    if (fromDateVal) {
      const from = parseAnyDate(fromDateVal);
      if (from) {
        from.setHours(0, 0, 0, 0);
        if (d < from) return false;
      }
    }

    if (toDateVal) {
      const to = parseAnyDate(toDateVal);
      if (to) {
        to.setHours(23, 59, 59, 999);
        if (d > to) return false;
      }
    }
  }

  return true;
};

const getSmartLeadStatus = (lead, orders = [], quotations = [], samples = [], reminders = [], erpState = {}) => {
  let status = lead.status || lead.leadStatus || lead.workflowState?.name || lead.workflowState?.code || 'New';
  if (status === 'Lost' || status === 'Converted' || status === 'WON') return status === 'WON' ? 'Converted' : status;

  const leadId = lead.id || lead.leadId;
  const compName = (lead.companyName || lead.customerName || lead.projectName || '').trim().toLowerCase();

  const hasOrder = (orders || []).some(
    (o) =>
      (leadId && (o.leadId === leadId || o.quotation?.leadId === leadId || o.sourceQuotation?.leadId === leadId)) ||
      (compName && (o.customerName || o.customer?.companyName || '').trim().toLowerCase() === compName)
  );
  if (hasOrder) return 'Converted';

  const leadQuotations = (quotations || []).filter(
    (q) =>
      (leadId && (q.leadId === leadId || q.sourceId === leadId || q.lead?.id === leadId)) ||
      (compName && (q.customerName || q.lead?.companyName || '').trim().toLowerCase() === compName)
  );
  const hasQuotation = leadQuotations.length > 0;

  const quoState = getLeadQuotationState(erpState, leadId);
  const smpState = getLeadSampleState(erpState, leadId);

  const hasSample = (samples || []).some(
    (s) =>
      (leadId && (s.leadId === leadId || s.sourceId === leadId || s.lead?.id === leadId)) ||
      (compName && (s.leadName || s.customerName || '').trim().toLowerCase() === compName)
  );

  const hasReminder = (reminders || []).some(
    (r) =>
      ((leadId && r.moduleId === leadId) || (compName && (r.customerName || '').trim().toLowerCase() === compName)) &&
      r.status !== 'Completed' &&
      r.status !== 'Closed'
  );

  if (
    hasQuotation ||
    quoState.state === 'COMPLETED' ||
    lead.workflowState?.code === 'QUOTATION_SENT' ||
    status === 'Quotation' ||
    status === 'Quotation Sent' ||
    status === 'Quotation Generated'
  ) {
    return 'Quotation Generated';
  } else if (quoState.state === 'DRAFT') {
    return 'Quotation Draft';
  } else if (hasSample || smpState.state === 'COMPLETED' || smpState.state === 'DRAFT') {
    return 'Sample Sent';
  } else if (hasReminder) {
    return 'Follow-up';
  }
  return status;
};

export default function LeadsView({
  leads,
  reminders = [],
  samples = [],
  quotations = [],
  orders = [],
  onAddLeadClick,
  onEditLeadClick,
  onConvertToSample,
  onGenerateQuotation,
  onUpdateStatus,
  onUpdateLead,
  onAddFollowup,
  onDeleteLead,
  onSaveReminder,
  onUpdateReminder,
  onCompleteReminder,
  onOpenLead,
  searchQuery,
  setSearchQuery,
  flat = false
}) {
  const router = useRouter();
  const erpStore = useERPStore();
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const search = localSearch;
  const setSearch = (val) => {
    setLocalSearch(val);
    if (typeof setSearchQuery === 'function') {
      setSearchQuery(val);
    }
  };
  const [selectedLead, setSelectedLead] = useState(null);
  const [followupText, setFollowupText] = useState('');
  const [filter, setFilter] = useState('All');
  const [reminderBucket, setReminderBucket] = useState('Today');
  const [reminderModal, setReminderModal] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [editingLead, setEditingLead] = useState(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editGstNumber, setEditGstNumber] = useState('');
  const [editAddressLine1, setEditAddressLine1] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const startEditing = (lead) => {
    setEditingLead(lead);
    setEditCompanyName(lead.companyName || '');
    setEditContactPerson(lead.contactPerson || lead.siteInchargeName || '');
    setEditPhone(lead.phone || lead.siteInchargeMobile || '');
    setEditEmail(lead.email || '');
    setEditProjectName(lead.projectName || '');
    setEditGroupName(lead.groupName || '');
    setEditGstNumber(lead.gstNumber || '');
    setEditAddressLine1(lead.address?.line1 || '');
    setEditCity(lead.address?.city || '');
    setEditState(lead.address?.state || '');
    setEditPincode(lead.address?.pincode || '');
    setEditNotes(lead.notes || lead.requirements || '');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editCompanyName.trim() || !editContactPerson.trim() || !editPhone.trim()) {
      alert('Please fill out Company Name, Contact Person, and Mobile.');
      return;
    }
    const updatedData = {
      companyName: editCompanyName.trim(),
      contactPerson: editContactPerson.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      projectName: editProjectName.trim(),
      groupName: editGroupName.trim(),
      gstNumber: editGstNumber.trim(),
      siteInchargeName: editContactPerson.trim(),
      siteInchargeMobile: editPhone.trim(),
      address: {
        line1: editAddressLine1.trim(),
        city: editCity.trim(),
        state: editState.trim(),
        pincode: editPincode.trim(),
        country: 'India'
      },
      notes: editNotes.trim(),
      requirements: editNotes.trim()
    };
    onUpdateLead(editingLead.id, updatedData);
    setEditingLead(null);
  };

  const handleGenerateQuotationClick = (lead) => {
    const leadId = lead.id || lead.leadId;
    const leadItems = Array.isArray(lead.detailedItems) ? lead.detailedItems : (Array.isArray(lead.items) ? lead.items : []);

    const mappedItems = leadItems.length > 0 ? leadItems.map((item, index) => ({
      id: item.id || `item-${index + 1}`,
      productId: item.productId || item.productCode || `PRD-${index + 1}`,
      productName: item.productName || item.product || item.name || '',
      name: item.productName || item.product || item.name || '',
      specification: item.specification || item.productDetails || item.description || '',
      description: item.specification || item.productDetails || item.description || '',
      productDetails: item.specification || item.productDetails || item.description || '',
      quantity: Number(item.quantity) || 1,
      qty: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      discount: Number(item.discount) || 0,
      tax: item.tax !== undefined ? Number(item.tax) : (item.gstRate !== undefined ? Number(item.gstRate) : 18),
    })) : (lead.productInterest || lead.product ? [{
      id: 'item-1',
      productId: 'PRD-1',
      productName: lead.productInterest || lead.product,
      name: lead.productInterest || lead.product,
      specification: 'Standard Specification',
      description: 'Standard Specification',
      productDetails: 'Standard Specification',
      quantity: Number(lead.estimatedQuantity) || 1,
      qty: Number(lead.estimatedQuantity) || 1,
      unitPrice: 100,
      discount: 0,
      tax: 18,
    }] : []);

    const quotationDraftPayload = {
      source: 'LEAD',
      sourceId: leadId,
      leadId,
      customer: lead.companyName || lead.customerName || lead.projectName || '',
      company: lead.companyName || lead.customerName || lead.projectName || '',
      customerName: lead.companyName || lead.customerName || lead.projectName || '',
      groupName: lead.groupName || lead.companyName || '',
      gstName: lead.gstName || lead.companyName || lead.customerName || '',
      gstNumber: lead.gstNumber || '',
      isGstRegistered: lead.gstNumber ? 'YES' : 'YES',
      contactPerson: lead.contactPerson || lead.siteInchargeName || '',
      phone: lead.phone || lead.mobile || lead.siteInchargeMobile || '',
      email: lead.email || '',
      notes: lead.remarks || lead.notes || '',
      items: mappedItems,
      detailedItems: mappedItems,
    };

    erpStore.setQuotationDraft(quotationDraftPayload);
    erpStore.createOrResumeQuotationFromLead(leadId, lead);

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const navBasePath = currentPath.startsWith('/supersales') ? '/supersales' : '/sales';
    router.push(`${navBasePath}/create-quotation?leadId=${encodeURIComponent(String(leadId))}`);
  };

  const handleGenerateSampleClick = (lead) => {
    const res = erpStore.createOrResumeSampleFromLead(lead.id || lead.leadId, lead);
    if (res.success) {
      router.push(`/sales/create-sample?sampleId=${res.sampleId}&leadId=${lead.id || lead.leadId}`);
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: res.message });
    }
  };

  const handleMarkLostClick = (lead) => {
    Swal.fire({
      title: 'Mark as Lost?',
      text: `Are you sure you want to mark "${lead.companyName}" as Lost?`,
      input: 'text',
      inputPlaceholder: 'Write reason...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Mark Lost',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false,
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'You must write a reason for losing this lead!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        onUpdateStatus(lead.id, 'Lost', result.value);
      }
    });
  };

  const handleDeleteLeadClick = (lead) => {
    const isConverted = lead.status === 'Converted';
    Swal.fire({
      title: 'Delete Lead?',
      html: `
        <div style="text-align:left;font-size:14px;line-height:1.5;">
          <p style="margin:0 0 8px;"><strong>Lead:</strong> ${lead.companyName}</p>
          ${isConverted ? '<p style="margin:0 0 8px;color:#b45309;">This lead has been converted. Deletion is only allowed if it is not linked to quotations or orders.</p>' : ''}
          <p style="margin:0 0 12px;color:#5E6B82;">The lead will be archived (soft-deleted). Notes and timeline are preserved.</p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Reason for deletion (optional)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
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
      if (result.isConfirmed && onDeleteLead) {
        onDeleteLead(lead.id, {
          navigate: false,
          reason: result.value?.trim() || 'Deleted from leads directory'
        });
      }
    });
  };

  const leadReminders = useMemo(
    () => (reminders || []).filter((r) => r.moduleType === 'Lead'),
    [reminders]
  );

  const handleSaveReminder = async (formData) => {
    if (!reminderModal) return;
    if (reminderModal.reminder && onUpdateReminder) {
      await onUpdateReminder(reminderModal.reminder.id, formData);
    } else if (onSaveReminder) {
      await onSaveReminder({
        moduleType: 'Lead',
        moduleId: reminderModal.lead.id,
        customerName: reminderModal.lead.companyName,
        ...formData
      });
    }
    setReminderModal(null);
  };

  const [currentPage, setCurrentPage] = useState(1);

  const availableMonths = useMemo(() => {
    const set = new Set();
    (leads || []).forEach(lead => {
      const rawDate = lead.leadDate || lead.date || lead.createdAt || lead.created_at || lead.updatedAt;
      if (rawDate) {
        const d = parseAnyDate(rawDate);
        if (d) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          set.add(`${yyyy}-${mm}`);
        }
      }
    });
    const now = new Date();
    const curYyyy = now.getFullYear();
    const curMm = String(now.getMonth() + 1).padStart(2, '0');
    set.add(`${curYyyy}-${curMm}`);

    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYyyy = prev.getFullYear();
    const prevMm = String(prev.getMonth() + 1).padStart(2, '0');
    set.add(`${prevYyyy}-${prevMm}`);

    return Array.from(set).sort().reverse();
  }, [leads]);

  const now = new Date();
  const currentYyyyMm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastYyyyMm = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, reminderBucket, selectedMonth, fromDate, toDate]);

  const filteredLeads = leads.filter(lead => {
    const q = search.trim().toLowerCase();
    const companyName = (lead.companyName || '').toLowerCase();
    const contactPerson = (lead.contactPerson || '').toLowerCase();
    const salesperson = (lead.salesperson || lead.salesExecutive?.name || '').toLowerCase();
    const leadNumber = (lead.leadNumber || lead.id || lead.reference || '').toLowerCase();
    const projectName = (lead.projectName || '').toLowerCase();
    const groupName = (lead.groupName || '').toLowerCase();
    const phone = (lead.phone || lead.mobile || '').toLowerCase();
    const email = (lead.email || '').toLowerCase();
    const gstNumber = (lead.gstNumber || lead.gstin || lead.gstName || '').toLowerCase();

    const matchesSearch = !q ||
      companyName.includes(q) ||
      contactPerson.includes(q) ||
      salesperson.includes(q) ||
      leadNumber.includes(q) ||
      projectName.includes(q) ||
      groupName.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      gstNumber.includes(q);

    if (filter === 'Reminders') return false;

    // Status matching across standard, workflow-stage, and legacy values
    let matchesFilter = true;
    const s = String(lead.status || lead.leadStatus || '').toLowerCase().replace(/[\s-_]+/g, '');
    const smart = getSmartLeadStatus(lead, orders, quotations, samples, reminders, erpStore.state);
    const smartNorm = String(smart || '').toLowerCase().replace(/[\s-_]+/g, '');

    if (filter === 'All') {
      matchesFilter = true;
    } else if (filter === 'New') {
      matchesFilter = s === 'new' || s === 'open' || s === 'draft' || smartNorm === 'new';
    } else if (filter === 'Follow-up') {
      matchesFilter = s.includes('follow') || s === 'contacted' || s === 'pending' || smartNorm.includes('follow');
    } else if (filter === 'Converted') {
      matchesFilter = s === 'converted' || s === 'won' || s === 'quotationsent' || s === 'quotationgenerated' || smartNorm === 'converted' || smartNorm.includes('quotation');
    } else if (filter === 'Lost') {
      matchesFilter = s === 'lost' || s === 'cancelled' || s === 'rejected' || Boolean(lead.lostReason) || Boolean(lead.lostComplaintId);
    } else {
      matchesFilter = lead.status === filter || smart === filter;
    }

    const leadDateVal = lead.leadDate || lead.date || lead.createdAt || lead.created_at || lead.updatedAt;
    const matchesDate = isLeadInDateRange(leadDateVal, selectedMonth, fromDate, toDate);

    return matchesSearch && matchesFilter && matchesDate;
  });

  const filteredLeadReminders = useMemo(() => {
    let list = leadReminders.filter((r) => {
      const lead = leads.find((l) => String(l.id) === String(r.moduleId));
      if (!lead) return false;
      const companyName = lead.companyName || '';
      const contactPerson = lead.contactPerson || '';
      const matchesSearch = companyName.toLowerCase().includes(search.toLowerCase()) ||
        contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        (r.reminderType || '').toLowerCase().includes(search.toLowerCase());
      const remDateVal = r.reminderDate || lead.createdAt || lead.date;
      const matchesDate = isLeadInDateRange(remDateVal, selectedMonth, fromDate, toDate);
      return matchesSearch && matchesDate;
    });
    return filterRemindersByBucket(list, reminderBucket);
  }, [leadReminders, leads, search, reminderBucket, selectedMonth, fromDate, toDate]);

  const ITEMS_PER_PAGE = 25;
  const isRemindersView = filter === 'Reminders';
  const activeList = isRemindersView ? filteredLeadReminders : filteredLeads;
  const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE) || 1;
  const displayedLeads = flat ? filteredLeads : filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const displayedReminders = flat ? filteredLeadReminders : filteredLeadReminders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderNextReminder = (lead) => {
    const nextVal = lead.nextReminder;
    if (!nextVal) return <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>;
    const date = new Date(nextVal);
    const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const now = new Date();
    const isOverdue = date < now && date.toDateString() !== now.toDateString();
    const isToday = date.toDateString() === now.toDateString();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700' }}>
          {dateStr} · {timeStr}
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          color: isOverdue ? '#dc2626' : isToday ? '#dc2626' : '#ca8a04'
        }}>
          {isOverdue ? '🔴 Overdue' : isToday ? '🔴 Today' : '🟡 Upcoming'}
        </span>
      </div>
    );
  };

  const renderAddress = (addr) => {
    if (!addr) return 'Not specified';
    if (typeof addr === 'string') return addr;
    const parts = [addr.line1, addr.city, addr.state, addr.country, addr.pincode].filter(Boolean);
    return parts.join(', ') || 'Not specified';
  };

  const renderLeadSpecification = (lead) => {
    const rawItems = Array.isArray(lead.detailedItems) && lead.detailedItems.length > 0
      ? lead.detailedItems
      : (Array.isArray(lead.items) && lead.items.length > 0 ? lead.items : null);

    if (rawItems && rawItems.length > 0) {
      const first = rawItems[0];
      const prodName = first.product || first.productName || first.name || 'Product';
      const sizeCap = [first.size, first.capacity].filter(Boolean).join(' ');
      const mainLabel = sizeCap ? `${prodName} ${sizeCap}` : prodName;
      const subInfo = [
        first.quantity ? `Qty: ${first.quantity}` : null,
        first.color ? `Color: ${first.color}` : null
      ].filter(Boolean).join(' · ');

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap' }}>
              {mainLabel}
            </span>
            {rawItems.length > 1 && (
              <span
                title={`${rawItems.length} items in this lead`}
                style={{
                  fontSize: '10.5px',
                  fontWeight: '800',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  whiteSpace: 'nowrap'
                }}
              >
                +{rawItems.length - 1} more
              </span>
            )}
          </div>
          {subInfo && (
            <span style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap' }}>
              {subInfo}
            </span>
          )}
        </div>
      );
    }

    if (lead.productInterest || lead.productInterested || lead.specification) {
      const txt = lead.productInterest || lead.productInterested || lead.specification;
      return (
        <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155' }}>
          {txt}
        </span>
      );
    }

    return <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>;
  };

  const handleAddFollowupSubmit = (e) => {
    e.preventDefault();
    if (!followupText.trim() || !selectedLead) return;

    onAddFollowup(selectedLead.id, followupText.trim());
    setFollowupText('');
  };

  // Keep details updated if lead updates in props
  const currentDetailsLead = selectedLead ? leads.find(l => l.id === selectedLead.id) : null;
  const leadSamples = currentDetailsLead ? samples.filter((s) => String(s.leadId || s.lead_id) === String(currentDetailsLead.id)) : [];
  const leadQuotations = currentDetailsLead ? quotations.filter((q) => String(q.leadId || q.lead_id) === String(currentDetailsLead.id)) : [];
  const leadOrders = currentDetailsLead ? orders.filter((o) => o.customerName === currentDetailsLead.companyName || (currentDetailsLead.customerId && String(o.customerId) === String(currentDetailsLead.customerId))) : [];
  const currentDetailsStatus = currentDetailsLead ? getSmartLeadStatus(currentDetailsLead, orders, quotations, samples, reminders, erpStore.state) : '';

  return (
    <div className="app-card" style={{ flex: 1 }}>
      {/* Module Header */}
      <div className="module-header-row">
        <h2 className="module-title">Leads Directory</h2>
        <div className="module-actions">
          {/* Status filters */}
          <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
            {['All', 'New', 'Follow-up', 'Converted', 'Lost', 'Reminders'].map(st => (
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
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
          <button
            className="btn-small btn-primary-small"
            data-testid="lead-create"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={onAddLeadClick}
          >
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Date & Month Filter Toolbar */}
      <div className="leads-date-filter-bar">
        <style>{`
          .leads-date-filter-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            padding: 12px 18px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 6px -1px rgba(0, 0, 0, 0.04);
            border-radius: 12px;
            margin-bottom: 18px;
            margin-top: 12px;
          }
          .leads-filter-controls-group {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .leads-filter-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13.5px;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: -0.01em;
          }
          .leads-filter-icon-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: #eff6ff;
            color: #2563eb;
            flex-shrink: 0;
          }
          .leads-month-select {
            padding: 8px 36px 8px 14px;
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
            background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E") no-repeat right 12px center / 14px 14px;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
            cursor: pointer;
            outline: none;
            appearance: none;
            -webkit-appearance: none;
            transition: all 0.15s ease;
          }
          .leads-month-select:focus, .leads-month-select:hover {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
          }
          .leads-custom-date-group {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            background: #ffffff;
            padding: 4px 10px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          .leads-date-input-field {
            padding: 6px 10px;
            font-size: 12.5px;
            font-weight: 600;
            border: 1.5px solid #cbd5e1;
            border-radius: 6px;
            background: #ffffff;
            color: #0f172a;
            outline: none;
          }
          .leads-date-input-field:focus {
            border-color: #3b82f6;
          }
          .leads-clear-btn {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 7px 14px;
            font-size: 12.5px;
            font-weight: 700;
            color: #dc2626;
            background: #fef2f2;
            border: 1.5px solid #fecaca;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .leads-clear-btn:hover {
            background: #fee2e2;
            border-color: #fca5a5;
          }
          .leads-badge-counter {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 20px;
            background: #f1f5f9;
            color: #334155;
            font-size: 12.5px;
            font-weight: 700;
            border: 1px solid #e2e8f0;
          }
          @media (max-width: 768px) {
            .leads-date-filter-bar {
              flex-direction: column;
              align-items: stretch;
              gap: 10px;
              padding: 12px 14px;
            }
            .leads-filter-controls-group {
              flex-direction: column;
              align-items: stretch;
              width: 100%;
            }
            .leads-month-select {
              width: 100%;
            }
            .leads-custom-date-group {
              width: 100%;
              justify-content: space-between;
            }
            .leads-badge-counter {
              align-self: flex-start;
            }
          }
        `}</style>

        <div className="leads-filter-controls-group">
          <div className="leads-filter-label">
            <span className="leads-filter-icon-badge">
              <Calendar size={16} />
            </span>
            <span>Month & Date Filter:</span>
          </div>

          <select
            className="leads-month-select"
            value={selectedMonth}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedMonth(val);
              if (val !== 'CUSTOM') {
                setFromDate('');
                setToDate('');
              }
            }}
          >
            <option value="ALL">All Months / All Time</option>
            <option value="THIS_MONTH">This Month ({formatMonthOptionLabel(currentYyyyMm)})</option>
            <option value="LAST_MONTH">Last Month ({formatMonthOptionLabel(lastYyyyMm)})</option>
            <optgroup label="Select Specific Month">
              {availableMonths.map((m) => (
                <option key={m} value={m}>{formatMonthOptionLabel(m)}</option>
              ))}
            </optgroup>
            <option value="CUSTOM">Custom Date Range...</option>
          </select>

          {selectedMonth === 'CUSTOM' && (
            <div className="leads-custom-date-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>From:</span>
                <input
                  type="date"
                  className="leads-date-input-field"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>To:</span>
                <input
                  type="date"
                  className="leads-date-input-field"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {(selectedMonth !== 'ALL' || fromDate || toDate) && (
            <button
              className="leads-clear-btn"
              onClick={() => {
                setSelectedMonth('ALL');
                setFromDate('');
                setToDate('');
              }}
            >
              <X size={14} /> Clear Filter
            </button>
          )}
        </div>

        <div className="leads-badge-counter">
          <span>Showing:</span>
          <span style={{ color: '#1d4ed8', fontWeight: '800' }}>
            {isRemindersView
              ? `${filteredLeadReminders.length} ${filteredLeadReminders.length === 1 ? 'reminder' : 'reminders'}`
              : `${filteredLeads.length} ${filteredLeads.length === 1 ? 'lead' : 'leads'}`}
          </span>
        </div>
      </div>

      {isRemindersView && (
        <div className="tab-filters-row" style={{ background: '#F5FAFE', marginBottom: '16px' }}>
          {['Today', 'Tomorrow', 'This Week', 'Overdue', 'Completed'].map((bucket) => (
            <button
              key={bucket}
              className={`filter-pill ${reminderBucket === bucket ? 'active' : ''}`}
              onClick={() => setReminderBucket(bucket)}
              style={{ color: reminderBucket === bucket ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            >
              {bucket}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="crm-table-container desktop-only">
        {isRemindersView ? (
          <table className="crm-table responsive-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Reminder</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeadReminders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    No reminders found.
                  </td>
                </tr>
              ) : (
                displayedReminders.map((reminder) => {
                  const lead = leads.find((l) => String(l.id) === String(reminder.moduleId));
                  return (
                    <tr key={reminder.id}>
                      <td data-label="Lead" style={{ fontWeight: '700' }}>{lead?.companyName || reminder.customerName || `Lead #${reminder.moduleId}`}</td>
                      <td data-label="Reminder">{reminder.reminderType}</td>
                      <td data-label="Date">
                        {formatReminderDate(reminder.reminderDate)}
                      </td>
                      <td data-label="Priority">{reminder.priority}</td>
                      <td data-label="Status">{reminder.status}</td>
                      <td data-label="Action">
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {reminder.status === 'Pending' && onCompleteReminder && (
                            <button className="btn-small btn-outline-small" onClick={() => onCompleteReminder(reminder.id)}>Complete</button>
                          )}
                          <button className="btn-small btn-outline-small" onClick={() => setReminderModal({ lead, reminder })}>Edit</button>
                          {lead && (
                            <button className="btn-small btn-outline-small" onClick={() => setSelectedLead(lead)}>Open Lead</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : filter === 'Lost' ? (
          <table className="crm-table responsive-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Customer</th>
                <th>Quotation</th>
                <th>Order</th>
                <th>Lost Reason</th>
                <th>Complaint ID</th>
                <th>Lost Date</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>No lost leads.</td></tr>
              ) : (
                displayedLeads.map((lead) => {
                  const linkedQuote = quotations.find((q) => String(q.leadId || q.lead_id) === String(lead.id));
                  const linkedOrder = orders.find((o) => o.customerName === lead.companyName || (lead.customerId && String(o.customerId) === String(lead.customerId)) || (linkedQuote && String(o.quotationId) === String(linkedQuote.id)));
                  const lostReason = lead.lostReason || linkedQuote?.lostReason || linkedOrder?.lostReason || 'Customer Complaint';
                  const complaintNo = lead.lostComplaintId || linkedQuote?.lostComplaintId || linkedOrder?.lostComplaintId || '—';
                  const lostDate = lead.lostAt ? String(lead.lostAt).slice(0, 10) : (linkedOrder?.lostAt ? String(linkedOrder.lostAt).slice(0, 10) : (lead.updatedAt ? String(lead.updatedAt).slice(0, 10) : '-'));

                  return (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{lead.leadNumber || displayEntityId(lead.id)}</td>
                      <td style={{ fontWeight: '600' }}>{lead.companyName || lead.customerName || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{linkedQuote?.quotationNumber || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{linkedOrder?.orderNumber || linkedOrder?.orderNo || '—'}</td>
                      <td>
                        <span style={{ background: '#fef2f2', color: '#b91c1c', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                          {lostReason}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#2F4375' }}>{complaintNo}</td>
                      <td style={{ color: '#64748b', fontSize: '12.5px' }}>{lostDate}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-small btn-outline-small"
                          onClick={() => setSelectedLead(lead)}
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="crm-table responsive-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Date</th>
                <th>Company Name</th>
                <th>Specification</th>
                <th>Phone / Email</th>
                <th>Next Reminder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    <strong>{search.trim() ? `No leads found for "${search.trim()}"` : 'No leads available'}</strong>
                    <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500 }}>
                      {search.trim() ? 'Try a different search term or clear active filters.' : 'Create your first lead to begin the sales workflow.'}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedLeads.map((lead) => {
                  const displayStatus = getSmartLeadStatus(lead, orders, quotations, samples, reminders, erpStore.state);
                  const leadDateStr = formatLeadDate(lead.leadDate || lead.date || lead.createdAt || lead.created_at);

                  return (
                    <tr key={lead.id}>
                      <td data-label="Lead ID" style={{ fontWeight: '700', whiteSpace: 'nowrap', color: 'var(--color-text-primary)' }}>{lead.leadNumber || displayEntityId(lead.id)}</td>
                      <td data-label="Date" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{leadDateStr}</td>
                      <td data-label="Company Name" style={{ fontWeight: '700', whiteSpace: 'nowrap', color: 'var(--color-text-primary)' }}>{lead.companyName || lead.customerName || lead.projectName || 'N/A'}</td>
                      <td data-label="Specification" style={{ minWidth: '180px' }}>{renderLeadSpecification(lead)}</td>
                      <td data-label="Phone / Email">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{lead.phone || lead.mobile || lead.siteInchargeMobile || 'N/A'}</span>
                          <span style={{ fontSize: '11px', color: '#5E6B82', whiteSpace: 'nowrap' }}>{lead.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td data-label="Next Reminder">{renderNextReminder(lead)}</td>
                      <td data-label="Actions" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div className="action-btn-group" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                          {/* View Icon */}
                          <button
                            title="View Details"
                            onClick={() => setSelectedLead(lead)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '32px', height: '32px',
                              background: '#ffffff', border: '1px solid #D6E2F0',
                              borderRadius: '8px', cursor: 'pointer',
                              color: '#475569', flexShrink: 0
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          {/* Edit Icon */}
                          <button
                            title="Edit Details"
                            onClick={() => onEditLeadClick(lead.id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '32px', height: '32px',
                              background: '#ffffff', border: '1px solid #D6E2F0',
                              borderRadius: '8px', cursor: 'pointer',
                              color: '#475569', flexShrink: 0
                            }}
                          >
                            <Edit size={14} />
                          </button>

                          {lead.status !== 'Lost' ? (
                            <>
                              {/* 1. Generate / Continue Quotation */}
                              {(() => {
                                const quoState = getLeadQuotationState(erpStore.state, lead.id || lead.leadId);
                                const isQuotationGenerated = displayStatus === 'Converted' || displayStatus === 'Quotation Generated' || quoState.state === 'COMPLETED';

                                return (
                                  <button
                                    onClick={() => !isQuotationGenerated && handleGenerateQuotationClick(lead)}
                                    disabled={isQuotationGenerated}
                                    data-testid={`lead-generate-quotation-${lead.leadNumber || lead.id || lead.leadId}`}
                                    title={isQuotationGenerated ? "Quotation Generated" : (quoState.state === 'DRAFT' ? "Continue Quotation" : "Generate Quotation")}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center',
                                      padding: '6px 12px', height: '32px',
                                      background: isQuotationGenerated ? '#cbd5e1' : (quoState.state === 'DRAFT' ? '#F59E0B' : '#2F4375'),
                                      border: `1px solid ${isQuotationGenerated ? '#cbd5e1' : (quoState.state === 'DRAFT' ? '#F59E0B' : '#2F4375')}`,
                                      borderRadius: '8px', cursor: isQuotationGenerated ? 'not-allowed' : 'pointer',
                                      fontSize: '11.5px', fontWeight: '800',
                                      color: isQuotationGenerated ? '#64748b' : '#ffffff', whiteSpace: 'nowrap',
                                      flexShrink: 0,
                                      opacity: isQuotationGenerated ? 0.6 : 1,
                                      boxShadow: isQuotationGenerated ? 'none' : `0 1px 4px ${quoState.state === 'DRAFT' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(47,67,117,0.3)'}`
                                    }}
                                  >
                                    {isQuotationGenerated ? 'Quotation Generated' : (quoState.state === 'DRAFT' ? 'Continue Quotation →' : 'Generate Quotation →')}
                                  </button>
                                );
                              })()}
                              {/* 2. Send / Continue Sample */}
                              {(() => {
                                const smpState = getLeadSampleState(erpStore.state, lead.id || lead.leadId);
                                const quoState = getLeadQuotationState(erpStore.state, lead.id || lead.leadId);
                                const isQuotationGenerated = displayStatus === 'Converted' || displayStatus === 'Quotation Generated' || quoState.state === 'COMPLETED';
                                const isSampleSent = displayStatus === 'Sample Sent' || smpState.state === 'COMPLETED';
                                const isSampleDisabled = isSampleSent || isQuotationGenerated;

                                return (
                                  <button
                                    onClick={() => !isSampleDisabled && handleGenerateSampleClick(lead)}
                                    disabled={isSampleDisabled}
                                    data-testid={`lead-send-sample-${lead.leadNumber || lead.id || lead.leadId}`}
                                    title={isSampleSent ? "Sample Sent" : (isQuotationGenerated ? "Quotation Generated" : (smpState.state === 'DRAFT' ? "Continue Sample" : "Send Sample"))}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center',
                                      padding: '6px 12px', height: '32px',
                                      background: isSampleDisabled ? '#f1f5f9' : (smpState.state === 'DRAFT' ? '#FEF3C7' : '#ffffff'),
                                      border: `1px solid ${isSampleDisabled ? '#e2e8f0' : (smpState.state === 'DRAFT' ? '#FDE68A' : '#D6E2F0')}`,
                                      borderRadius: '8px', cursor: isSampleDisabled ? 'not-allowed' : 'pointer',
                                      fontSize: '11.5px', fontWeight: '700',
                                      color: isSampleDisabled ? '#94a3b8' : (smpState.state === 'DRAFT' ? '#92400E' : '#334155'), whiteSpace: 'nowrap',
                                      flexShrink: 0,
                                      opacity: isSampleDisabled ? 0.6 : 1
                                    }}
                                  >
                                    {isSampleSent ? 'Sample Sent' : (smpState.state === 'DRAFT' ? 'Continue Sample' : 'Send Sample')}
                                  </button>
                                );
                              })()}
                              {/* 3. Reminder */}
                              {onSaveReminder && lead.status !== 'Lost' && lead.status !== 'Converted' && (
                                <button
                                  onClick={() => setReminderModal({ lead })}
                                  data-testid={`lead-reminder-${lead.leadNumber || lead.id || lead.leadId}`}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    padding: '6px 12px', height: '32px',
                                    background: '#ffffff',
                                    border: '1px solid #D6E2F0',
                                    borderRadius: '8px', cursor: 'pointer',
                                    fontSize: '11.5px', fontWeight: '700',
                                    color: '#334155', whiteSpace: 'nowrap',
                                    flexShrink: 0
                                  }}
                                >
                                  <Bell size={12} /> Reminder
                                </button>
                              )}
                              {/* 4. Mark Lost */}
                              {lead.status !== 'Lost' && lead.status !== 'Converted' && (
                                <button
                                  onClick={() => handleMarkLostClick(lead)}
                                  data-testid={`lead-mark-lost-${lead.leadNumber || lead.id || lead.leadId}`}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    padding: '6px 12px', height: '32px',
                                    background: '#ffffff',
                                    border: '1.5px solid #fca5a5',
                                    borderRadius: '8px', cursor: 'pointer',
                                    fontSize: '11.5px', fontWeight: '700',
                                    color: '#dc2626', whiteSpace: 'nowrap',
                                    flexShrink: 0
                                  }}
                                >
                                  Lost
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              data-testid={`lead-restore-${lead.leadNumber || lead.id || lead.leadId}`}
                              onClick={() => {
                                Swal.fire({
                                  title: 'Restore Lead?',
                                  text: `Are you sure you want to restore "${lead.companyName}" to New status?`,
                                  icon: 'question',
                                  showCancelButton: true,
                                  confirmButtonText: 'Yes, Restore',
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
                                    onUpdateStatus(lead.id, 'New');
                                  }
                                });
                              }}
                              style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '4px 12px', height: '30px',
                                background: '#dcfce7',
                                border: '1px solid #86efac',
                                borderRadius: '8px', cursor: 'pointer',
                                fontSize: '12px', fontWeight: '700',
                                color: '#15803d', whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
                            >
                              Restore Lead
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
        )}
      </div>

      {/* Mobile Card Layout for Leads */}
      {!isRemindersView && (
        <div className="mobile-only leads-mobile-list" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
          <style>{`
            @media (max-width: 768px) {
              .desktop-only { display: none !important; }
              .mobile-only.leads-mobile-list { display: flex !important; }
            }
          `}</style>
          {filteredLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
              <strong>No leads found.</strong>
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500 }}>
                Create your first lead to begin the sales workflow.
              </div>
            </div>
          ) : (
            displayedLeads.map((lead) => {
              const displayStatus = getSmartLeadStatus(lead, orders, quotations, samples, reminders, erpStore.state);
              const quoState = getLeadQuotationState(erpStore.state, lead.id || lead.leadId);
              const smpState = getLeadSampleState(erpStore.state, lead.id || lead.leadId);
              const targetLeadId = lead.id || lead.leadId;
              
              const isQuotationGenerated = displayStatus === 'Converted' || displayStatus === 'Quotation Generated' || quoState.state === 'COMPLETED';
              const isSampleSent = displayStatus === 'Sample Sent' || smpState.state === 'COMPLETED';
              const isSampleDisabled = isSampleSent || isQuotationGenerated;

              const handleOpenDetails = (e) => {
                if (e) e.stopPropagation();
                setSelectedLead(lead);
                if (typeof onOpenLead === 'function') onOpenLead(lead);
              };

              const handleEditClick = (e) => {
                if (e) e.stopPropagation();
                if (typeof onEditLeadClick === 'function') {
                  onEditLeadClick(targetLeadId);
                } else {
                  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
                  const navBasePath = currentPath.startsWith('/supersales') ? '/supersales' : '/sales';
                  router.push(`${navBasePath}/edit-lead/${targetLeadId}`);
                }
              };

              return (
                <div key={lead.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span onClick={handleOpenDetails} style={{ fontSize: '13px', fontWeight: '800', color: '#1e3a8a', cursor: 'pointer' }}>{lead.leadNumber || displayEntityId(lead.id)}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>· {formatLeadDate(lead.date || lead.createdAt || lead.created_at || lead.leadDate)}</span>
                    </div>
                    <button onClick={handleOpenDetails} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={handleOpenDetails}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{lead.companyName || lead.customerName || lead.projectName || 'N/A'}</div>
                      <div style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{lead.phone || lead.mobile || lead.siteInchargeMobile || 'N/A'}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{lead.email || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        backgroundColor: (displayStatus === 'Converted' || displayStatus === 'Quotation Generated' || displayStatus === 'Sample Sent') ? '#dcfce7' : (displayStatus === 'New' ? '#dbeafe' : '#f1f5f9'),
                        color: (displayStatus === 'Converted' || displayStatus === 'Quotation Generated' || displayStatus === 'Sample Sent') ? '#15803d' : (displayStatus === 'New' ? '#1d4ed8' : '#475569')
                      }}>
                        {displayStatus}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <button
                      type="button"
                      title="View Details"
                      onClick={handleOpenDetails}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer' }}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      title="Edit Lead"
                      onClick={handleEditClick}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer' }}
                    >
                      <Edit size={16} />
                    </button>
                    
                    {lead.status !== 'Lost' && lead.status !== 'Converted' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => !isQuotationGenerated && handleGenerateQuotationClick(lead)}
                          disabled={isQuotationGenerated}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 12px', height: '36px', flex: '1',
                            background: isQuotationGenerated ? '#f1f5f9' : (quoState.state === 'DRAFT' ? '#F59E0B' : '#2F4375'),
                            border: `1px solid ${isQuotationGenerated ? '#e2e8f0' : (quoState.state === 'DRAFT' ? '#F59E0B' : '#2F4375')}`,
                            borderRadius: '8px', cursor: isQuotationGenerated ? 'not-allowed' : 'pointer',
                            fontSize: '11px', fontWeight: '700',
                            color: isQuotationGenerated ? '#94a3b8' : '#ffffff', whiteSpace: 'nowrap'
                          }}
                        >
                          {isQuotationGenerated ? 'Quotation Generated' : (quoState.state === 'DRAFT' ? 'Continue Quotation →' : 'Generate Quotation →')}
                        </button>
                        
                        {!isQuotationGenerated && (
                          <button
                            type="button"
                            onClick={() => !isSampleDisabled && handleGenerateSampleClick(lead)}
                            disabled={isSampleDisabled}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              padding: '0 10px', height: '36px',
                              background: isSampleDisabled ? '#f8fafc' : '#ffffff',
                              border: `1px solid ${isSampleDisabled ? '#f1f5f9' : '#e2e8f0'}`,
                              borderRadius: '8px', cursor: isSampleDisabled ? 'not-allowed' : 'pointer',
                              fontSize: '11px', fontWeight: '600',
                              color: isSampleDisabled ? '#cbd5e1' : '#475569', whiteSpace: 'nowrap'
                            }}
                          >
                            Send Sample
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => setReminderModal({ lead, reminder: null })}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            padding: '0 10px', height: '36px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px', cursor: 'pointer',
                            fontSize: '11px', fontWeight: '700',
                            color: '#334155', whiteSpace: 'nowrap'
                          }}
                        >
                          <Bell size={14} /> Reminder
                        </button>
                      </>
                    ) : (
                      lead.status === 'Converted' && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>
                          Order Generated
                        </div>
                      )
                    )}
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
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{activeList.length}</strong> total {isRemindersView ? 'reminders' : 'leads'})
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



      {/* Details Modal Overlay */}
      {currentDetailsLead && (
        <div className="modal-overlay active" onClick={() => setSelectedLead(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '20px' }}>
            <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className="modal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: 0 }}>
                <span>Lead Details {currentDetailsLead.leadNumber || displayEntityId(currentDetailsLead.id)}</span>
                <span className={`badge badge-${currentDetailsStatus.toLowerCase().replace(' ', '-')}`}>
                  {currentDetailsStatus}
                </span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = currentDetailsLead.id || currentDetailsLead.leadId;
                    setSelectedLead(null);
                    if (typeof onEditLeadClick === 'function') {
                      onEditLeadClick(targetId);
                    } else {
                      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
                      const navBasePath = currentPath.startsWith('/supersales') ? '/supersales' : '/sales';
                      router.push(`${navBasePath}/edit-lead/${targetId}`);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <Edit size={13} /> Edit Lead
                </button>
                <button className="modal-close-btn" onClick={() => setSelectedLead(null)} style={{ cursor: 'pointer' }}>✕</button>
              </div>
            </div>

            <div className="details-grid">
              <div className="details-row">
                <span className="details-label">Date Created</span>
                <span className="details-value">{formatLeadDate(currentDetailsLead.date || currentDetailsLead.createdAt || currentDetailsLead.created_at || currentDetailsLead.leadDate)}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Company Name</span>
                <span className="details-value">{currentDetailsLead.companyName}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Contact Person</span>
                <span className="details-value">{currentDetailsLead.contactPerson}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Phone</span>
                <span className="details-value">{currentDetailsLead.phone}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Email</span>
                <span className="details-value">{currentDetailsLead.email}</span>
              </div>
              <div className="details-row details-full">
                <span className="details-label">Address</span>
                <span className="details-value">{renderAddress(currentDetailsLead.address)}</span>
              </div>

              {currentDetailsLead.projectName && (
                <div className="details-row">
                  <span className="details-label">Project Name</span>
                  <span className="details-value">{currentDetailsLead.projectName}</span>
                </div>
              )}
              {currentDetailsLead.groupName && (
                <div className="details-row">
                  <span className="details-label">Group/Parent Company</span>
                  <span className="details-value">{currentDetailsLead.groupName}</span>
                </div>
              )}
              {currentDetailsLead.gstNumber && (
                <div className="details-row">
                  <span className="details-label">GST Number</span>
                  <span className="details-value" style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 'bold' }}>{currentDetailsLead.gstNumber}</span>
                </div>
              )}
              {currentDetailsLead.siteInchargeName && (
                <div className="details-row">
                  <span className="details-label">Site Incharge Contact</span>
                  <span className="details-value">{currentDetailsLead.siteInchargeName} ({currentDetailsLead.siteInchargeMobile})</span>
                </div>
              )}
              {currentDetailsLead.officeContact && (
                <div className="details-row">
                  <span className="details-label">Office Contact No</span>
                  <span className="details-value">{currentDetailsLead.officeContact}</span>
                </div>
              )}
              {currentDetailsLead.chiefDirector && (
                <div className="details-row">
                  <span className="details-label">Chief Director Assigned</span>
                  <span className="details-value">{currentDetailsLead.chiefDirector}</span>
                </div>
              )}

              {currentDetailsLead.industryType && (
                <div className="details-row">
                  <span className="details-label">Industry Type</span>
                  <span className="details-value">{currentDetailsLead.industryType}</span>
                </div>
              )}
              {currentDetailsLead.priority && (
                <div className="details-row">
                  <span className="details-label">Priority Level</span>
                  <span className="details-value" style={{
                    fontWeight: '700',
                    color: currentDetailsLead.priority === 'High' ? '#dc2626' : currentDetailsLead.priority === 'Medium' ? '#d97706' : '#2563eb'
                  }}>
                    {currentDetailsLead.priority}
                  </span>
                </div>
              )}

              {currentDetailsLead.productInterested && (
                <div className="details-row">
                  <span className="details-label">Product Interested</span>
                  <span className="details-value">{currentDetailsLead.productInterested}</span>
                </div>
              )}
              {currentDetailsLead.estimatedQuantity > 0 && (
                <div className="details-row">
                  <span className="details-label">Est. Quantity</span>
                  <span className="details-value">{currentDetailsLead.estimatedQuantity} units</span>
                </div>
              )}

              {currentDetailsLead.budget > 0 && (
                <div className="details-row">
                  <span className="details-label">Budget ($)</span>
                  <span className="details-value" style={{ fontWeight: '700', color: 'var(--color-accent-teal)' }}>
                    ${currentDetailsLead.budget.toLocaleString()}
                  </span>
                </div>
              )}
              {currentDetailsLead.campaignName && (
                <div className="details-row">
                  <span className="details-label">Campaign Source</span>
                  <span className="details-value">{currentDetailsLead.campaignName}</span>
                </div>
              )}

              <div className="details-row details-full">
                <span className="details-label">Notes & Requirements</span>
                <span className="details-value" style={{ fontStyle: 'italic', fontWeight: '500' }}>
                  "{currentDetailsLead.notes || currentDetailsLead.requirements || 'No special requirements listed.'}"
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">Assigned Salesperson</span>
                <span className="details-value">{currentDetailsLead.salesperson || currentDetailsLead.salesExecutive?.name || 'SuperSales'}</span>
              </div>
            </div>

            {/* Product Specifications Table / Mobile Cards */}
            {(() => {
              const allItems = (Array.isArray(currentDetailsLead.detailedItems) && currentDetailsLead.detailedItems.length > 0)
                ? currentDetailsLead.detailedItems
                : (Array.isArray(currentDetailsLead.items) && currentDetailsLead.items.length > 0)
                  ? currentDetailsLead.items
                  : (currentDetailsLead.products ? [{ product: currentDetailsLead.products, quantity: currentDetailsLead.quantity || 1 }] : []);

              if (!allItems || allItems.length === 0) return null;

              return (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Clipboard size={14} /> Product Specifications ({allItems.length} {allItems.length === 1 ? 'item' : 'items'})
                  </h4>

                  {/* Mobile-First List-Wise Cards */}
                  <div className="lead-spec-mobile-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {allItems.map((item, idx) => {
                      const itemTitle = item.product || item.productName || item.name || 'Product';
                      const grandTot = item.grandTotal || item.subTotal || item.total;
                      
                      return (
                        <div
                          key={idx}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          {/* Product Header */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                              <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', flexShrink: 0 }}>
                                #{idx + 1}
                              </span>
                              <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a', wordBreak: 'break-word' }}>
                                {itemTitle}
                              </span>
                            </div>
                            {item.code && (
                              <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#64748b', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                                {item.code}
                              </span>
                            )}
                          </div>

                          {/* Specification Key-Value Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', fontSize: '12px' }}>
                            {item.size && item.size !== '—' && (
                              <div>
                                <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: '600' }}>Size</span>
                                <span style={{ fontWeight: '600', color: '#334155' }}>{item.size}</span>
                              </div>
                            )}
                            {item.capacity && item.capacity !== '—' && (
                              <div>
                                <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: '600' }}>Capacity</span>
                                <span style={{ fontWeight: '600', color: '#334155' }}>{item.capacity}</span>
                              </div>
                            )}
                            {item.color && item.color !== '—' && (
                              <div>
                                <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: '600' }}>Color</span>
                                <span style={{ fontWeight: '600', color: '#334155' }}>{item.color}</span>
                              </div>
                            )}
                            <div>
                              <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: '600' }}>Quantity</span>
                              <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.quantity || item.qty || 1}</span>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: '600' }}>Rate / Unit</span>
                              <span style={{ fontWeight: '600', color: '#334155' }}>
                                {item.unitPrice || item.rate ? `₹${Number(item.unitPrice || item.rate).toLocaleString('en-IN')}` : '—'}
                              </span>
                            </div>
                            <div>
                              <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: '600' }}>GST</span>
                              <span style={{ fontWeight: '600', color: '#64748b' }}>
                                {item.gst || item.gstRate || item.tax ? `${item.gst || item.gstRate || item.tax}%` : '18%'}
                              </span>
                            </div>
                          </div>

                          {/* Item Total Row */}
                          {grandTot && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Item Total</span>
                              <span style={{ fontSize: '14px', fontWeight: '800', color: '#16a34a' }}>
                                ₹{Number(grandTot).toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <hr style={{ margin: '20px 0', borderColor: '#eaeaea' }} />

            <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={14} /> Reminder History
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {leadReminders.filter((r) => String(r.moduleId) === String(currentDetailsLead.id)).length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>No reminders scheduled yet.</p>
              ) : (
                leadReminders
                  .filter((r) => String(r.moduleId) === String(currentDetailsLead.id))
                  .sort((a, b) => `${b.reminderDate}`.localeCompare(`${a.reminderDate}`))
                  .map((reminder) => (
                    <div key={reminder.id} style={{ padding: '12px', border: '1px solid #DCE5F0', borderRadius: '10px', background: '#F5FAFE' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '13px' }}>
                          {formatReminderDate(reminder.reminderDate)}
                        </strong>
                        <span style={{ fontSize: '12px', fontWeight: '700' }}>{reminder.status}</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f766e' }}>{reminder.reminderType}</div>
                      {reminder.remarks && (
                        <p style={{ fontSize: '12.5px', color: '#475569', margin: '6px 0 0' }}>{reminder.remarks}</p>
                      )}
                    </div>
                  ))
              )}
            </div>

            {/* Connected Samples */}
            <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
              <FlaskConical size={14} /> Connected Samples
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {leadSamples.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>No sample requests created.</p>
              ) : (
                leadSamples.map((sample) => (
                  <div key={sample.id} style={{ padding: '8px 12px', border: '1.5px solid #eaeaea', borderRadius: '10px', background: '#F5FAFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '12.5px', color: 'var(--color-text-primary)' }}>{sample.sample_number || sample.sampleNumber || `#${sample.id}`}</strong>
                      <div style={{ fontSize: '11.5px', color: '#5E6B82', marginTop: '2px' }}>{sample.productName || sample.product || 'Prototype Sample'} (Qty: {sample.quantity || 1})</div>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: '800',
                      padding: '3px 8px', borderRadius: '6px',
                      background: sample.status === 'Approved' ? '#dcfce7' : sample.status === 'Rejected' ? '#fee2e2' : '#e0f2fe',
                      color: sample.status === 'Approved' ? '#15803d' : sample.status === 'Rejected' ? '#dc2626' : '#0369a1'
                    }}>{sample.status}</span>
                  </div>
                ))
              )}
            </div>

            {/* Connected Quotations */}
            <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
              <FileText size={14} /> Connected Quotations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {leadQuotations.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>No quotations generated.</p>
              ) : (
                leadQuotations.map((quote) => (
                  <div key={quote.id} style={{ padding: '8px 12px', border: '1.5px solid #eaeaea', borderRadius: '10px', background: '#F5FAFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '12.5px', color: 'var(--color-text-primary)' }}>{quote.quotation_number || quote.quotationNumber || `#${quote.id}`}</strong>
                      <div style={{ fontSize: '11.5px', color: '#5E6B82', marginTop: '2px' }}>Value: ₹{Number(quote.grand_total || quote.totalAmount || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: '800',
                      padding: '3px 8px', borderRadius: '6px',
                      background: quote.status === 'Approved' || quote.status === 'CONVERTED' ? '#dcfce7' : quote.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                      color: quote.status === 'Approved' || quote.status === 'CONVERTED' ? '#15803d' : quote.status === 'Rejected' ? '#dc2626' : '#92400e'
                    }}>{quote.status}</span>
                  </div>
                ))
              )}
            </div>

            {/* Connected Sales Orders */}
            <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
              <ShieldCheck size={14} /> Connected Orders
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {leadOrders.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>No sales orders created yet.</p>
              ) : (
                leadOrders.map((order) => (
                  <div key={order.id} style={{ padding: '8px 12px', border: '1.5px solid #eaeaea', borderRadius: '10px', background: '#F5FAFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '12.5px', color: 'var(--color-text-primary)' }}>{order.order_number || order.orderNumber || `#${order.id}`}</strong>
                      <div style={{ fontSize: '11.5px', color: '#5E6B82', marginTop: '2px' }}>Total: ₹{Number(order.grand_total || 0).toLocaleString('en-IN')} · Stage: {order.order_stage || order.orderStage || 'Pending'}</div>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: '800',
                      padding: '3px 8px', borderRadius: '6px',
                      background: '#dcfce7',
                      color: '#15803d'
                    }}>{order.payment_status || order.paymentStatus || 'Awaiting'}</span>
                  </div>
                ))
              )}
            </div>

            {/* Timeline */}
            <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
              <Clipboard size={14} /> Activity Timeline
            </h4>

            <div className="timeline-container">
              {(Array.isArray(currentDetailsLead.timeline) ? currentDetailsLead.timeline : []).map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <span className="timeline-time">{item.date}</span>
                  <span className="timeline-text">{item.text}</span>
                </div>
              ))}
            </div>


          </div>
        </div>
      )}

      <ReminderModal
        key={reminderModal?.reminder?.id || reminderModal?.lead?.id || 'new'}
        open={!!reminderModal}
        onClose={() => setReminderModal(null)}
        onSave={handleSaveReminder}
        customerName={reminderModal?.lead?.companyName || ''}
        title={reminderModal?.reminder ? 'Edit Reminder' : 'Create Reminder'}
        initialValues={reminderModal?.reminder || null}
      />

    </div>
  );
}
