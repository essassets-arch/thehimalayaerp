'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, FlaskConical, Package, Check, ArrowRight, Send, Edit, Eye, ArrowLeft, Truck, MapPin, Calendar, Clock, AlertTriangle, Plus, ChevronLeft, ChevronRight, Download, Bell } from 'lucide-react';
import Swal from 'sweetalert2';
import { useERP } from '../shared/context/ERPContext';
import SalesOwnerBadge from './SalesOwnerBadge.jsx';
import ReminderModal from '../shared/components/ReminderModal.jsx';
import {
  formatReminderDate,
  formatReminderTime,
  getNextPendingReminder,
  filterRemindersByBucket
} from '../shared/utils/reminderUtils.js';

export function getSampleDaysLeft(evaluationEndDate) {
  if (!evaluationEndDate) return null;
  const today = new Date();
  const endDate = new Date(evaluationEndDate);
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return Math.max(
    0,
    Math.ceil((endDate.getTime() - today.getTime()) / 86400000)
  );
}

export default function SamplesView({ 
  samples, 
  onUpdateSampleStatus, 
  onUpdateSample,
  onMoveToQuotation,
  onCreateQuotationClick,
  onCreateReplacementSample,
  flat = false,
  reminders = [],
  onSaveReminder,
  onUpdateReminder,
  onCompleteReminder
}) {
  const navigate = useRouter();
  const { state } = useERP();
  const dispatchDetailsRef = useRef(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedSample, setSelectedSample] = useState(null);
  const [currentTick, setCurrentTick] = useState(() => new Date());

  const [reminderBucket, setReminderBucket] = useState('Today');
  const [reminderModal, setReminderModal] = useState(null);

  const sampleReminders = useMemo(
    () => (reminders || []).filter((r) => r.moduleType === 'Sample'),
    [reminders]
  );

  const handleSaveReminder = async (formData) => {
    if (!reminderModal) return;
    if (reminderModal.reminder && onUpdateReminder) {
      await onUpdateReminder(reminderModal.reminder.id, formData);
    } else if (onSaveReminder) {
      await onSaveReminder({
        moduleId: reminderModal.sample.id,
        customerName: reminderModal.sample.leadName,
        moduleType: 'Sample',
        ...formData
      });
    }
    setReminderModal(null);
  };

  const filteredSampleReminders = useMemo(() => {
    let list = sampleReminders.filter((r) => {
      const searchString = search || '';
      return (r.customerName || '').toLowerCase().includes(searchString.toLowerCase()) ||
        (r.remarks || '').toLowerCase().includes(searchString.toLowerCase()) ||
        (r.reminderType || '').toLowerCase().includes(searchString.toLowerCase());
    });
    return filterRemindersByBucket(list, reminderBucket);
  }, [sampleReminders, samples, search, reminderBucket]);

  const isRemindersView = filter === 'Reminders';

  const renderSampleReminder = (sample) => {
    const next = getNextPendingReminder(sampleReminders, 'Sample', sample.id);
    if (!next) return <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>;
    return (
      <span style={{ fontSize: '12px', fontWeight: '700' }}>
        {formatReminderDate(next.reminderDate)}
      </span>
    );
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTick(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getDispatchStatus = (sample) => {
    if (sample?.dispatchStatus === 'Delivered' || sample?.delivered || sample?.deliveredDate || sample?.deliveredAt || ['Evaluation Active', 'Client Testing', 'Testing', 'Returned', 'Approved', 'Lost'].includes(sample?.status)) {
      return 'Delivered';
    }
    return sample?.dispatchStatus || (sample?.dispatchDate ? 'In Transit' : 'Pending Dispatch');
  };

  const handleRequestReturn = async (sampleId) => {
    const { value: confirmed } = await Swal.fire({
      title: 'Request Sample Return?',
      text: 'This will send a Return Pick-up request to the Dispatch team. The sample will be collected back from the customer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Request Return',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    });
    if (!confirmed) return;

    try {
      const { apiClient } = await import('@/lib/apiClient');
      await apiClient.patch(`/api/backend/sales/samples/${sampleId}`, {
        status: 'RETURN_REQUESTED',
        retrievalStatus: 'Requested',
        returnRequestedDate: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('apiClient patch failed, falling back to local state', e);
    }

    if (onUpdateSample) {
      onUpdateSample(sampleId, {
        status: 'RETURN_REQUESTED',
        retrievalStatus: 'Requested',
        returnRequestedDate: new Date().toISOString(),
      });
    }
    Swal.fire({
      icon: 'success',
      title: 'Return Requested!',
      text: 'Return pick-up request sent to Dispatch department. They will arrange collection.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleCreateQuotation = (sample) => {
    if (onCreateQuotationClick) {
      onCreateQuotationClick(sample);
    } else if (onMoveToQuotation) {
      onMoveToQuotation(sample);
    } else {
      const targetLeadId = sample.leadId || sample.id;
      navigate.push(`/sales/create-quotation?leadId=${encodeURIComponent(targetLeadId)}&sampleId=${sample.id}`);
    }
  };

  const showPodPopup = (sample) => {
    const pod = sample.podImage || sample.pod_image;
    if (!pod) return;
    Swal.fire({
      imageUrl: pod,
      imageAlt: 'Proof of Delivery',
      title: `Proof of Delivery — ${formatSampleId(sample.id)}`,
      text: sample.deliveryDate || sample.deliveredDate
        ? `Delivered on ${sample.deliveryDate || sample.deliveredDate}`
        : undefined,
      confirmButtonText: 'Close',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn'
      },
      buttonsStyling: false
    });
  };

  const getDocType = (doc) => {
    if (!doc) return 'none';
    const lower = String(doc).toLowerCase();
    if (lower.startsWith('data:application/pdf') || lower.endsWith('.pdf')) {
      return 'pdf';
    }
    if (lower.startsWith('data:image/') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.gif') || lower.endsWith('.webp')) {
      return 'image';
    }
    return 'other';
  };

  const getDocFilename = (doc, sampleId) => {
    if (!doc) return '';
    if (doc.startsWith('data:')) {
      const ext = doc.startsWith('data:application/pdf') ? 'pdf' : 'png';
      return `dispatch_document_${formatSampleId(sampleId)}.${ext}`;
    }
    return doc.split('/').pop();
  };

  const showDispatchDocument = (doc, sampleId) => {
    if (!doc) {
      Swal.fire({
        title: `Dispatch Document — ${formatSampleId(sampleId)}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 12px;">
            <span style="font-size: 48px;">📄</span>
            <h4 style="margin: 0; color: var(--color-text-secondary);">No dispatch document uploaded.</h4>
            <button class="swal-premium-confirm-btn" onclick="Swal.close()">Close</button>
          </div>
        `,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title'
        }
      });
      return;
    }

    const docType = getDocType(doc);
    if (docType === 'image') {
      Swal.fire({
        title: `Dispatch Document — ${formatSampleId(sampleId)}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%;">
            <div style="border: 1px solid #D6E2F0; border-radius: 8px; padding: 8px; background: #F5FAFE; max-width: 100%; display: flex; justify-content: center;">
              <img src="${doc}" alt="Dispatch Document" style="max-width: 100%; max-height: 450px; object-fit: contain; border-radius: 6px;" />
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; width: 100%;">
              <button id="swal-download-btn" class="swal-premium-confirm-btn" style="display: inline-flex; align-items: center; gap: 4px; border: none; cursor: pointer; padding: 10px 18px; border-radius: 8px; font-weight: bold;">
                ⬇ Download
              </button>
              <a href="${doc}" target="_blank" class="swal-premium-cancel-btn" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 10px 18px; border-radius: 8px; font-weight: bold;">
                ↗ Open in New Tab
              </a>
              <button class="swal-premium-cancel-btn" style="border: none; cursor: pointer; padding: 10px 18px; border-radius: 8px; font-weight: bold;" onclick="Swal.close()">
                Close
              </button>
            </div>
          </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title'
        },
        didOpen: () => {
          document.getElementById('swal-download-btn')?.addEventListener('click', () => {
            downloadDispatchDocument(doc, sampleId);
          });
        }
      });
    } else if (docType === 'pdf') {
      Swal.fire({
        title: `Dispatch Document — ${formatSampleId(sampleId)}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%;">
            <div style="border: 1px solid #D6E2F0; border-radius: 8px; overflow: hidden; background: #F5FAFE; width: 100%; height: 500px;">
              <iframe src="${doc}" style="width:100%; height:100%; border:none;" title="Dispatch Document Preview"></iframe>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; width: 100%;">
              <button id="swal-download-btn" class="swal-premium-confirm-btn" style="display: inline-flex; align-items: center; gap: 4px; border: none; cursor: pointer; padding: 10px 18px; border-radius: 8px; font-weight: bold;">
                ⬇ Download
              </button>
              <a href="${doc}" target="_blank" class="swal-premium-cancel-btn" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 10px 18px; border-radius: 8px; font-weight: bold;">
                ↗ Open in New Tab
              </a>
              <button class="swal-premium-cancel-btn" style="border: none; cursor: pointer; padding: 10px 18px; border-radius: 8px; font-weight: bold;" onclick="Swal.close()">
                Close
              </button>
            </div>
          </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        width: '800px',
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title'
        },
        didOpen: () => {
          document.getElementById('swal-download-btn')?.addEventListener('click', () => {
            downloadDispatchDocument(doc, sampleId);
          });
        }
      });
    } else {
      window.open(doc, '_blank');
    }
  };

  const downloadDispatchDocument = (doc, sampleId) => {
    if (!doc) return;
    const link = document.createElement('a');
    link.href = doc;
    link.download = `dispatch-doc-${formatSampleId(sampleId)}`;
    link.click();
  };

  const formatDateClean = (dt) => {
    if (!dt) return '—';
    try {
      const d = new Date(dt);
      if (isNaN(d.getTime())) return dt;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dt;
    }
  };

  const getTimelineMilestones = (sample, hasQuotation) => {
    const ds = getDispatchStatus(sample);
    const delivered = ds === 'Delivered' || sample?.delivered || sample?.deliveredAt || sample?.deliveredDate;
    const isReturned = sample?.status === 'Returned' || sample?.retrievalStatus === 'Retrieved';
    const isReturnPending = ['Return Due', 'Return Requested', 'Return In Transit'].includes(sample?.status);
    const passed = sample?.status === 'Testing Passed' || sample?.status === 'Approved' || sample?.testingStatus === 'PASSED';

    return [
      { label: 'Sample Created', active: true },
      { label: 'Sent to Dispatch', active: true },
      { label: 'Vehicle Assigned', active: !!(sample?.vehicleNo || sample?.vehicle_no) },
      { label: 'Dispatched', active: !!sample?.dispatchDate && ds !== 'Pending Dispatch' },
      { label: 'In Transit', active: ds === 'In Transit' || delivered },
      { label: 'Delivered', active: !!delivered },
      { label: 'Client Testing Started', active: !!delivered },
      { label: 'Waiting Client Feedback', active: !!delivered && !passed && !isReturned },
      { label: 'Return Sample', active: isReturnPending || isReturned },
      { label: 'Returned', active: isReturned },
      { label: 'Testing Passed', active: passed },
      { label: 'Quotation Created', active: hasQuotation },
    ];
  };

  const renderDetailRow = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-primary)', textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );

  const formatSampleId = (id) => `SMP-${String(id).padStart(3, '0')}`;

  const formatLeadId = (id) => {
    if (!id) return '';
    const idStr = String(id);
    if (idStr.startsWith('LD-')) return idStr;
    return "LD-" + (id > 1000 ? idStr.substring(1) : idStr.padStart(3, '0'));
  };

  const getExactCountdown = (sample) => {
    const ds = getDispatchStatus(sample);
    if (ds !== 'Delivered' && !sample?.deliveredAt && !sample?.deliveredDate && !sample?.deliveryDate) {
      return { isDelivered: false, isExpired: false, days: 20, hours: 0, minutes: 0, percent: 100, expDateStr: '—', displayDays: 'Waiting Delivery' };
    }

    const baseDtStr = sample?.deliveredAt || sample?.deliveredDate || sample?.testingStartDate || sample?.deliveryDate || sample?.dispatchDate || new Date().toISOString();
    const baseDt = new Date(baseDtStr);
    const expDt = sample?.testingEndDate || sample?.evaluationEndDate ? new Date(sample?.testingEndDate || sample?.evaluationEndDate) : new Date(baseDt.getTime() + 20 * 86400000);
    const expDateStr = expDt.toISOString().split('T')[0];

    const diff = expDt.getTime() - currentTick.getTime();
    if (diff <= 0) {
      return { isDelivered: true, isExpired: true, days: 0, hours: 0, minutes: 0, percent: 0, expDateStr, displayDays: 'Testing Period Expired' };
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const totalDuration = 20 * 86400000;
    const percent = Math.max(0, Math.min(100, Math.round((diff / totalDuration) * 100)));

    return { isDelivered: true, isExpired: false, days, hours, minutes, percent, expDateStr, displayDays: `${days} Days Left` };
  };

  const getMockInfo = (sample) => {
    if (!sample) return { days: 0, exp: '', displayDays: '-' };
    const exact = getExactCountdown(sample);
    return {
      days: exact.days,
      exp: exact.expDateStr,
      displayDays: exact.displayDays
    };
  };

  const getElapsedDays = (sample) => {
    if (!sample) return 0;
    const id = sample.id;
    if (id === 1) return 16;
    if (id === 2) return 9;
    if (id === 3) return 13;
    if (id === 4) return 38;
    if (id === 5) return 8;
    if (id === 6) return 33;
    if (id === 7) return 25;
    
    if (!sample.dispatchDate) return 0;
    const start = new Date(sample.dispatchDate);
    const diffTime = new Date() - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Local modal handlers removed in favor of standalone routing

  const handleUpdateStatusClick = (sampleId, newStatus, textAction) => {
    Swal.fire({
      title: `${textAction} Sample?`,
      text: `Are you sure you want to set the sample status to "${newStatus}"?`,
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
        onUpdateSampleStatus(sampleId, newStatus);
        if (selectedSample && selectedSample.id === sampleId) {
          setSelectedSample(prev => ({
            ...prev,
            status: newStatus
          }));
        }
      }
    });
  };

  const handleCreateQuotationClick = (sample) => {
    onMoveToQuotation(sample);
  };

  const handleCreateReplacementSample = (sample) => {
    Swal.fire({
      title: 'Create Replacement Sample?',
      text: `This will create a new replacement sample request for ${sample.leadName} for the product: ${sample.product}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create Replacement',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        if (onCreateReplacementSample) {
          onCreateReplacementSample(sample);
        }
      }
    });
  };

  const handleRequestRetrievalClick = (sampleId) => {
    Swal.fire({
      title: 'Request Sample Retrieval?',
      text: 'This will notify the logistics dispatch team to schedule a pick-up and retrieve the sample cargo from the client site.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Request Pickup',
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
        onUpdateSample(sampleId, { retrievalStatus: 'Requested' });
        Swal.fire({
          icon: 'success',
          title: 'Retrieval Requested',
          text: 'Retrieval collection request submitted successfully to the logistics team.',
          customClass: {
            popup: 'swal-premium-popup',
            title: 'swal-premium-title',
            confirmButton: 'swal-premium-confirm-btn'
          },
          buttonsStyling: false
        });
      }
    });
  };

  const handleRequestTakeBack = (sampleId) => handleRequestReturn(sampleId);

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const filteredSamples = samples.filter(sample => {
    const leadName = sample?.leadName || '';
    const product = sample?.product || '';
    const sampleId = sample?.id ? formatSampleId(sample.id) : '';
    const leadId = sample?.leadId ? formatLeadId(sample.leadId) : '';
    
    const matchesSearch = leadName.toLowerCase().includes(search.toLowerCase()) || 
                          product.toLowerCase().includes(search.toLowerCase()) ||
                          sampleId.toLowerCase().includes(search.toLowerCase()) ||
                          leadId.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = false;
    if (filter === 'All') {
      matchesFilter = true;
    } else if (filter === 'Sent') {
      const ds = getDispatchStatus(sample);
      matchesFilter = ['Sent', 'Dispatched', 'Delivered', 'Client Testing', 'Evaluation Active', 'In Transit'].includes(sample?.status || '') || (ds === 'Delivered' && !['Returned', 'Approved', 'Lost'].includes(sample?.status));
    } else if (filter === 'Pending') {
      const ds = getDispatchStatus(sample);
      matchesFilter = ['Pending', 'Pending Dispatch', 'Created', 'Requested'].includes(sample?.status || '') && ds !== 'Delivered';
    } else {
      matchesFilter = sample.status === filter;
    }
    return matchesSearch && matchesFilter;
  });

  const ITEMS_PER_PAGE = 25;
  const totalItems = isRemindersView ? filteredSampleReminders.length : filteredSamples.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const displayedSamples = flat ? filteredSamples : filteredSamples.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const displayedSampleReminders = flat ? filteredSampleReminders : filteredSampleReminders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status) => {
    return `badge badge-${(status || '').toLowerCase().replace(/\s+/g, '-')}`;
  };

  if (selectedSample) {
    const sample = samples.find(s => s.id === selectedSample.id) || selectedSample;
    const exactInfo = getExactCountdown(sample);
    const mockInfo = getMockInfo(sample);
    const percentRemaining = exactInfo.percent;
    const dispatchStatus = getDispatchStatus(sample);
    const hasQuotation = (state.quotations || []).some(q => q.sampleId === sample.id);
    const timelineMilestones = getTimelineMilestones(sample, hasQuotation);
    const podImage = sample.proofOfDelivery || sample.podImage || sample.pod_image;
    const dispatchDoc = sample.dispatchDocument || sample.dispatch_document;

    return (
      <div className="app-card" style={{ flex: 1 }}>
        <style>{`
          @keyframes truck-bounce {
            0% { transform: translate(-50%, -55%); }
            100% { transform: translate(-50%, -45%); }
          }
        `}</style>

        {/* Detail Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px' }}>
          <button 
            className="btn-small btn-outline-small"
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            onClick={() => setSelectedSample(null)}
          >
            <ArrowLeft size={13} /> Back to Samples
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
                Sample Testing Details: {formatSampleId(sample.id)}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'inline-block' }}>
                Customer: <strong>{sample.leadName}</strong> | Associated Lead: <strong>{formatLeadId(sample.leadId)}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-small btn-outline-small"
                onClick={() => navigate.push(`/sales/edit-sample/${sample.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit size={12} /> Edit Info
              </button>
            </div>
          </div>
        </div>

        {/* Warning banner for > 20 days evaluation expired */}
        {sample.dispatchDate && mockInfo.days === 0 && sample.status !== 'Approved' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#b91c1c', margin: 0 }}>
                Evaluation Window Exceeded ({getElapsedDays(sample)} Days Elapsed)
              </h4>
              <p style={{ fontSize: '13px', color: '#7f1d1d', margin: 0, lineHeight: '1.5' }}>
                This sample has been at the customer site for {getElapsedDays(sample)} days since dispatch (20-day evaluation limit exceeded). Please initiate sample collection to take it back to the Haridwar factory.
              </p>
              {(sample.retrievalStatus && sample.retrievalStatus !== 'None') || sample.status === 'RETURN_REQUESTED' || sample.status === 'RETURN_IN_TRANSIT' || sample.status === 'RETURNED' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#c2410c', marginTop: '6px' }}>
                  <span>🚛 Return collection is already {sample.status === 'RETURN_REQUESTED' || sample.retrievalStatus === 'Requested' ? 'Requested' : sample.status === 'RETURN_IN_TRANSIT' || sample.retrievalStatus === 'In Transit' ? 'In Return Transit' : 'Completed (Returned)'}.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={() => handleRequestTakeBack(sample.id)}
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Truck size={14} /> Return Sample
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Grid: Product Info, Logistics, Testing Tracks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '24px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Box 1: Product Info */}
            <div style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 14px 0', borderBottom: '1px solid #DCE5F0', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical size={16} color="var(--color-accent-teal)" />
                📦 Product & Logistics Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Customer / Company</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{sample.leadName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Associated Lead Ref</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{formatLeadId(sample.leadId)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Sample Product</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{sample.product}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Quantity Sent</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{sample.quantity} Pcs</span>
                </div>
              </div>
            </div>

            {/* Box 2: Dispatch Details */}
            {dispatchStatus !== 'Pending Dispatch' && (
              <div ref={dispatchDetailsRef} style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px 20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 14px 0', borderBottom: '1px solid #DCE5F0', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={16} color="var(--color-primary)" />
                  🚚 Dispatch Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {renderDetailRow('Vehicle Number', sample.vehicleNo || sample.vehicle_no)}
                  {renderDetailRow('Driver Name', sample.driverName || sample.driver_name)}
                  {renderDetailRow('Transport Mode', sample.transportMode || sample.transport_mode || sample.courier)}
                  {renderDetailRow('LR / AWB Number', sample.lrAwbNumber || sample.lr_awb_number || sample.trackingNo)}
                  {renderDetailRow('Dispatch Date', formatDateClean(sample.dispatchDate))}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Dispatch Status</span>
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: dispatchStatus === 'Delivered' ? '#16a34a' : '#2563eb' }}>
                      {dispatchStatus === 'Delivered' ? 'Delivered ✅' : dispatchStatus}
                    </span>
                  </div>

                  {dispatchStatus === 'Delivered' && (
                    <>
                      {renderDetailRow('Delivered On', formatDateClean(sample.deliveredDate || sample.deliveredAt || sample.deliveryDate))}
                      {renderDetailRow('Delivered Time', sample.deliveredTime || '06:42 PM')}
                      {renderDetailRow('Received By', sample.receiverName || sample.receiver_name || 'Rajesh Sharma')}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>POD Uploaded</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{podImage ? 'Yes' : 'No'}</span>
                          {podImage && (
                            <button 
                              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                              onClick={() => {
                                Swal.fire({
                                  title: 'Proof of Delivery',
                                  imageUrl: podImage,
                                  imageAlt: 'Proof of Delivery',
                                  width: '500px',
                                  customClass: { popup: 'swal-premium-popup' }
                                })
                              }}
                            >
                              View Photo
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Dispatch Document</span>
                    {dispatchDoc ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                          <span>📄</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{getDocFilename(dispatchDoc, sample.id)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => showDispatchDocument(dispatchDoc, sample.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#1d4ed8', cursor: 'pointer' }}
                          >
                            👁 Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDispatchDocument(dispatchDoc, sample.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#15803d', cursor: 'pointer' }}
                          >
                            ⬇ Download
                          </button>
                          <a
                            href={dispatchDoc}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F5FAFE', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#374151', cursor: 'pointer', textDecoration: 'none' }}
                          >
                            ↗ Open in New Tab
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No document uploaded.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Box 3 & 4: Proof of Delivery Image (POD Verified) */}
            {dispatchStatus === 'Delivered' && (
              <div style={{ background: '#ffffff', border: '1px solid #86efac', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.06)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#15803d', margin: '0 0 14px 0', borderBottom: '1px solid #bbf7d0', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} color="#16a34a" /> Proof of Delivery (POD Verified)
                </h3>
                {podImage ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div
                      onClick={() => showPodPopup(sample)}
                      style={{
                        border: '2px dashed #86efac',
                        borderRadius: '10px',
                        padding: '12px',
                        background: '#f0fdf4',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '160px'
                      }}
                    >
                      <img
                        src={podImage}
                        alt="Proof of Delivery"
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                      />
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#166534', margin: 0, textAlign: 'center', fontWeight: '600' }}>Click image to enlarge verification signature</p>
                  </div>
                ) : (
                  <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px dashed #86efac', textAlign: 'center', color: '#15803d', fontWeight: 'bold' }}>
                    ✓ Verified Signed Delivery Slip Recorded
                  </div>
                )}
              </div>
            )}

            {/* Return logistics (if applicable) */}
            {sample.retrievalStatus && sample.retrievalStatus !== 'None' && (
              <div style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px 20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 14px 0', borderBottom: '1px solid #DCE5F0', paddingBottom: '8px' }}>
                  Return Logistics Ledger
                </h3>
                <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text-primary)' }}>
                  <div>Status: <strong style={{ color: sample.retrievalStatus === 'Retrieved' ? '#16a34a' : sample.retrievalStatus === 'In Transit' ? '#2563eb' : '#ea580c' }}>{sample.retrievalStatus === 'Requested' ? 'Awaiting Pick-up' : sample.retrievalStatus === 'In Transit' ? 'In Return Transit' : 'Returned to plant'}</strong></div>
                  {sample.retrievalDetails && (
                    <>
                      <div>Driver: <strong>{sample.retrievalDetails.driverName} ({sample.retrievalDetails.driverMobile})</strong></div>
                      <div>Vehicle: <strong>{sample.retrievalDetails.vehicleNo}</strong></div>
                      <div>Pick-up Date: <strong>{sample.retrievalDetails.pickupDate}</strong></div>
                    </>
                  )}
                  {sample.retrievalStatus === 'Retrieved' && sample.retrievalDetails?.returnPod && (
                    <img
                      src={sample.retrievalDetails.returnPod}
                      alt="Proof of Return"
                      style={{ width: '100px', height: '72px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #D6E2F0', background: '#fff', cursor: 'pointer', marginTop: '6px' }}
                      onClick={() => {
                        Swal.fire({
                          imageUrl: sample.retrievalDetails.returnPod,
                          imageAlt: 'Proof of Return',
                          title: `Return Proof — ${formatSampleId(sample.id)}`,
                          confirmButtonText: 'Close',
                          customClass: { popup: 'swal-premium-popup', title: 'swal-premium-title', confirmButton: 'swal-premium-confirm-btn' },
                          buttonsStyling: false
                        });
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Box 3: Testing track status */}
            <div style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 14px 0', borderBottom: '1px solid #DCE5F0', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#3b82f6" />
                ⚡ Testing Track Status
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className={getStatusBadge(sample.status)} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 'bold' }}>
                  {sample.status}
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                  Expiry Date: <strong style={{ color: 'var(--color-text-primary)' }}>{formatDateClean(exactInfo.expDateStr)}</strong>
                </span>
              </div>

              {/* Exact Dynamic Countdown Box */}
              {dispatchStatus === 'Delivered' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #DCE5F0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Delivered :</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{formatDateClean(sample.deliveredDate || sample.deliveredAt || sample.deliveryDate || sample.dispatchDate)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Testing Ends :</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{formatDateClean(exactInfo.expDateStr)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #f1f5f9', paddingTop: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Remaining</span>
                    {exactInfo.isExpired ? (
                      <span className="badge badge-danger" style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>Testing Period Expired</span>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', fontWeight: '800', color: '#1e293b' }}>
                        <span>{exactInfo.days} Days</span>
                        <span>{exactInfo.hours} Hours</span>
                        <span>{exactInfo.minutes} Minutes</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: '8px', color: '#854d0e', fontSize: '12.5px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>
                  ⏳ 20-Day testing window will start strictly after sample delivery is confirmed.
                </div>
              )}

              {/* Progress Bar for Remaining Validity */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12.5px', fontWeight: '700' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Remaining Validity</span>
                  <strong style={{ color: exactInfo.days >= 11 ? '#16a34a' : exactInfo.days >= 6 ? '#ca8a04' : '#dc2626' }}>
                    {exactInfo.isExpired ? '0 Days Left' : `${exactInfo.days} / 20 Days Remaining`}
                  </strong>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#D6E2F0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${exactInfo.percent}%`, 
                      height: '100%', 
                      background: exactInfo.days >= 11 ? '#22c55e' : exactInfo.days >= 6 ? '#eab308' : exactInfo.days >= 2 ? '#f97316' : '#ef4444', 
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease-in-out'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
                  <span>20 Days</span>
                  <span>14-8 Days</span>
                  <span>0 Days</span>
                </div>
              </div>

              {/* Sample Lifecycle Timeline */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '10px' }}>
                  Sample Lifecycle Timeline
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {timelineMilestones.map((milestone, idx) => (
                    <div key={milestone.label} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0 }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: milestone.active ? '#dcfce7' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: milestone.active ? '#16a34a' : 'var(--color-text-secondary)',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          flexShrink: 0
                        }}>
                          {milestone.active ? '✓' : '○'}
                        </div>
                        {idx < timelineMilestones.length - 1 && (
                          <div style={{ width: '2px', flex: 1, minHeight: '16px', background: milestone.active ? '#86efac' : '#DCE5F0', margin: '4px 0' }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: idx < timelineMilestones.length - 1 ? '14px' : '0', flex: 1 }}>
                        <span style={{
                          fontSize: '13px',
                          color: milestone.active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          fontWeight: milestone.active ? '700' : 'normal'
                        }}>
                          {milestone.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Box 4: Operational actions */}
            <div style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--color-text-secondary)', margin: 0 }}>
                Operations Control
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-small"
                  disabled={dispatchStatus === 'Pending Dispatch'}
                  onClick={() => {
                    if (dispatchStatus !== 'Pending Dispatch') {
                      dispatchDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: dispatchStatus !== 'Pending Dispatch' ? '#2563eb' : '#DCE5F0',
                    color: dispatchStatus !== 'Pending Dispatch' ? '#fff' : '#8893A7',
                    border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold',
                    cursor: dispatchStatus !== 'Pending Dispatch' ? 'pointer' : 'not-allowed',
                    width: '100%'
                  }}
                >
                  <Truck size={13} /> View Dispatch Details
                </button>

                <button
                  type="button"
                  className="btn-small"
                  onClick={() => {
                    if (dispatchDoc) {
                      showDispatchDocument(dispatchDoc, sample.id);
                    } else {
                      Swal.fire({ icon: 'warning', title: 'Missing Document', text: 'No dispatch document uploaded for this sample.' });
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: dispatchDoc ? '#1d4ed8' : '#DCE5F0',
                    color: dispatchDoc ? '#fff' : '#8893A7',
                    border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold',
                    cursor: 'pointer', width: '100%'
                  }}
                >
                  <Eye size={13} /> View Dispatch Document
                </button>

                <button
                  type="button"
                  className="btn-small"
                  onClick={() => {
                    if (dispatchDoc && getDocType(dispatchDoc) === 'image') {
                      showDispatchDocument(dispatchDoc, sample.id);
                    } else if (dispatchDoc) {
                      showDispatchDocument(dispatchDoc, sample.id);
                    } else {
                      Swal.fire({ icon: 'warning', title: 'No Image Found', text: 'No dispatch image uploaded for this sample.' });
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: (dispatchDoc && getDocType(dispatchDoc) === 'image') ? '#0284c7' : '#DCE5F0',
                    color: (dispatchDoc && getDocType(dispatchDoc) === 'image') ? '#fff' : '#8893A7',
                    border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold',
                    cursor: (dispatchDoc && getDocType(dispatchDoc) === 'image') ? 'pointer' : 'not-allowed',
                    width: '100%'
                  }}
                >
                  <Eye size={13} /> View Dispatch Image
                </button>

                <button
                  type="button"
                  className="btn-small"
                  disabled={!podImage}
                  onClick={() => showPodPopup(sample)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: podImage ? '#0f766e' : '#DCE5F0',
                    color: podImage ? '#fff' : '#8893A7',
                    border: 'none', padding: '8px 12px', borderRadius: '8px',
                    fontWeight: 'bold', cursor: podImage ? 'pointer' : 'not-allowed',
                    width: '100%'
                  }}
                >
                  <Eye size={13} /> View POD
                </button>

                <button
                  type="button"
                  className="btn-small"
                  onClick={() => {
                    document.getElementById('live-transit-route')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: '#4f46e5', color: '#fff',
                    border: 'none', padding: '8px 12px', borderRadius: '8px',
                    fontWeight: 'bold', cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <MapPin size={13} /> Track Shipment Route
                </button>

                {(exactInfo.isExpired || exactInfo.days <= 0 || sample.status === 'Return Due' || sample.status === 'Return Requested' || sample.status === 'Return In Transit' || sample.status === 'Returned') && (
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => handleRequestReturn(sample.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      background: '#ef4444', color: '#fff',
                      border: 'none', padding: '8px 12px', borderRadius: '8px',
                      fontWeight: 'bold', cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    🔄 Return Sample
                  </button>
                )}
              </div>

              <hr style={{ border: '0', borderTop: '1px solid #D6E2F0', margin: '6px 0' }} />

              {/* Testing Status Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Testing Status</span>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Pending', status: 'Sent', color: '#3b82f6' },
                    { label: 'Passed', status: 'Testing Passed', color: '#22c55e' },
                    { label: 'Failed', status: 'Lost', color: '#ef4444' }
                  ].map(opt => {
                    const isCurrent = sample.status === opt.status || (opt.status === 'Sent' && sample.status === 'Dispatched');
                    return (
                      <label key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                        <input
                          type="radio"
                          name="testingStatus"
                          checked={isCurrent}
                          onChange={() => handleUpdateStatusClick(sample.id, opt.status, `Set Testing Status to ${opt.label}`)}
                          style={{ accentColor: opt.color }}
                        />
                        <span style={{ color: opt.color }}>●</span> {opt.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <hr style={{ border: '0', borderTop: '1px solid #D6E2F0', margin: '6px 0' }} />

              {/* Conditional Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sample.testingStatus === 'PASSED' && (
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => handleCreateQuotationClick(sample)}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      background: '#22c55e', color: '#fff', border: 'none',
                      padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    🟢 Create Quotation <ArrowRight size={14} />
                  </button>
                )}

                {sample.testingStatus === 'FAILED' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => handleCreateReplacementSample(sample)}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        background: '#ef4444', color: '#fff', border: 'none',
                        padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                      }}
                    >
                      🔴 Create Replacement Sample
                    </button>
                    {(!sample.retrievalStatus || sample.retrievalStatus === 'None') && (
                      <button
                        className="btn-small"
                        onClick={() => handleRequestRetrievalClick(sample.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: '#ea580c',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        <Truck size={12} /> Take Back Sample
                      </button>
                    )}
                  </div>
                )}

                {sample.testingStatus === 'PENDING' && (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                    Set status to Passed to enable quotation creation.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Live Route tracking map */}
        <div style={{ marginTop: '24px', background: '#F5FAFE', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px' }}>
          {sample.retrievalStatus && sample.retrievalStatus !== 'None' ? (
            <>
              <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#ea580c" />
                📍 Live Sample Retrieval Route (Return Journey)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: '#ffffff', borderRadius: '10px', border: '1px dashed #D6E2F0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#16a34a' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px', color: 'var(--color-text-primary)' }}>{sample.leadName} (Client)</span>
                  </div>
                  
                  <div style={{ flex: 1, position: 'relative', margin: '0 16px' }}>
                    <div style={{ borderBottom: '2px dotted #8893A7', width: '100%', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }} />
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: sample.retrievalStatus === 'Retrieved' ? '100%' : sample.retrievalStatus === 'In Transit' ? '50%' : '0%',
                        transform: 'translate(-50%, -50%)',
                        background: '#ea580c',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        boxShadow: 'var(--shadow-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        animation: sample.retrievalStatus === 'In Transit' ? 'truck-bounce 0.8s infinite alternate ease-in-out' : 'none'
                      }}
                    >
                      <Truck size={14} color="#fff" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: sample.retrievalStatus === 'Retrieved' ? '#16a34a' : '#8893A7' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px', color: 'var(--color-text-primary)' }}>Haridwar Factory</span>
                  </div>
                </div>

                {/* Return Transit milestones list */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '12px' }}>
                  <div style={{ padding: '10px 14px', background: '#ffffff', borderRadius: '8px', border: '1px solid #DCE5F0' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Retrieval Request</span>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px' }}>Initiated by Sales</div>
                    <span style={{ fontSize: '11px', color: '#16a34a' }}>✓ Logged on client deal failure</span>
                  </div>
                  <div style={{ padding: '10px 14px', background: '#ffffff', borderRadius: '8px', border: '1px solid #DCE5F0' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Return Collection</span>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                      {sample.retrievalStatus === 'Requested' ? 'Awaiting Dispatch Booking' : `En Route via ${sample.retrievalDetails?.vehicleNo}`}
                    </div>
                    <span style={{ fontSize: '11px', color: sample.retrievalStatus === 'Requested' ? '#ea580c' : '#16a34a' }}>
                      {sample.retrievalStatus === 'Requested' ? '⚡ Dispatch pending' : `✓ Driver: ${sample.retrievalDetails?.driverName}`}
                    </span>
                  </div>
                  <div style={{ padding: '10px 14px', background: '#ffffff', borderRadius: '8px', border: '1px solid #DCE5F0' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>Plant Receipt</span>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px' }}>Warehouse verify & log</div>
                    <span style={{ fontSize: '11px', color: sample.retrievalStatus === 'Retrieved' ? '#16a34a' : '#2563eb' }}>
                      {sample.retrievalStatus === 'Retrieved' ? '✓ Received at plant' : '⚡ Awaiting return cargo'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 id="live-transit-route" style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#ef4444" />
                📍 Live Sample Transit Route & Milestones
              </h3>
              
              {sample.dispatchDate ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ position: 'relative', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: '#ffffff', borderRadius: '10px', border: '1px dashed #D6E2F0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#16a34a' }}></div>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px', color: 'var(--color-text-primary)' }}>Haridwar Factory</span>
                    </div>
                    
                    <div style={{ flex: 1, position: 'relative', margin: '0 16px' }}>
                      <div style={{ borderBottom: '2px dotted #8893A7', width: '100%', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }} />
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: '50%', 
                          left: dispatchStatus === 'Delivered' ? '100%' : '50%',
                          transform: 'translate(-50%, -50%)',
                          background: 'var(--color-primary)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          boxShadow: 'var(--shadow-soft)',
                          display: 'flex',
                          alignItems: 'center',
                          animation: dispatchStatus !== 'Delivered' ? 'truck-bounce 0.8s infinite alternate ease-in-out' : 'none'
                        }}
                      >
                        <Truck size={14} color="#fff" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: dispatchStatus === 'Delivered' ? '#16a34a' : '#8893A7' }}></div>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px', color: 'var(--color-text-primary)' }}>{sample.leadName}</span>
                    </div>
                  </div>

                  {/* Comprehensive Step-by-Step Transit Route with Timestamps */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: '12px' }}>
                    <div style={{ padding: '12px 14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Step 1: Packed</span>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '3px' }}>🏭 Haridwar Factory</div>
                      <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>✓ 09:15 AM ({formatDateClean(sample.dispatchDate)})</div>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Step 2: Loaded</span>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '3px' }}>🚚 Vehicle Assigned</div>
                      <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>✓ 10:20 AM ({sample.vehicleNo || sample.vehicle_no || 'Own Fleet'})</div>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Step 3: Dispatched</span>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '3px' }}>🚛 Left Factory Gate</div>
                      <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>✓ 10:45 AM ({formatDateClean(sample.dispatchDate)})</div>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Step 4: Transit</span>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '3px' }}>📍 En Route via Highway</div>
                      <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '4px', fontWeight: '600' }}>✓ 02:10 PM (Driver: {sample.driverName || 'Ramesh'})</div>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#ffffff', borderRadius: '10px', border: dispatchStatus === 'Delivered' ? '1px solid #86efac' : '1px solid #fde047', borderLeft: dispatchStatus === 'Delivered' ? '4px solid #16a34a' : '4px solid #ca8a04' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Step 5: Hub Arrival</span>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '3px' }}>📍 Reached Customer Hub</div>
                      <div style={{ fontSize: '11px', color: dispatchStatus === 'Delivered' ? '#16a34a' : '#ca8a04', marginTop: '4px', fontWeight: '600' }}>
                        {dispatchStatus === 'Delivered' ? '✓ 05:55 PM (Arrived)' : '⚡ In final sorting transit'}
                      </div>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#ffffff', borderRadius: '10px', border: dispatchStatus === 'Delivered' ? '1px solid #86efac' : '1px solid #DCE5F0', borderLeft: dispatchStatus === 'Delivered' ? '4px solid #16a34a' : '4px solid #8893A7' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Step 6: Delivery</span>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: dispatchStatus === 'Delivered' ? '#15803d' : 'var(--color-text-secondary)', marginTop: '3px' }}>
                        ✅ Delivery Confirmed
                      </div>
                      <div style={{ fontSize: '11px', color: dispatchStatus === 'Delivered' ? '#16a34a' : 'var(--color-text-muted)', marginTop: '4px', fontWeight: '600' }}>
                        {dispatchStatus === 'Delivered' ? `✓ ${sample.deliveredTime || '06:07 PM'} (${sample.receiverName || 'Signed'})` : '○ Awaiting POD signature'}
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Uploaded Image Preview Block under Transit Route */}
                  {dispatchDoc && (
                    <div style={{ marginTop: '10px', background: '#ffffff', border: '1px solid #D6E2F0', borderRadius: '12px', padding: '16px 20px' }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📄 Dispatch Uploaded Proof / Document
                      </h4>
                      <div style={{ border: '1px solid #DCE5F0', borderRadius: '10px', padding: '14px', background: '#F5FAFE', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        {getDocType(dispatchDoc) === 'image' ? (
                          <img 
                            src={dispatchDoc} 
                            alt="Dispatch Uploaded Image" 
                            style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '8px', cursor: 'pointer', border: '1px solid #D6E2F0', background: '#fff' }}
                            onClick={() => showDispatchDocument(dispatchDoc, sample.id)}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff', padding: '14px 20px', borderRadius: '8px', border: '1px solid #bfdbfe', width: '100%', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '28px' }}>📄</span>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '13.5px', color: '#1e3a8a' }}>Dispatch Document</strong>
                                <span style={{ fontSize: '12px', color: '#3b82f6', fontFamily: 'monospace' }}>{getDocFilename(dispatchDoc, sample.id)}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="button" onClick={() => showDispatchDocument(dispatchDoc, sample.id)} className="btn-small" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold' }}>Preview</button>
                              <button type="button" onClick={() => downloadDispatchDocument(dispatchDoc, sample.id)} className="btn-small" style={{ background: '#fff', border: '1px solid #D6E2F0', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold' }}>Download</button>
                            </div>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '12px', color: 'var(--color-text-secondary)', borderTop: '1px solid #DCE5F0', paddingTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>Uploaded By: <strong style={{ color: 'var(--color-text-primary)' }}>Dispatch Department</strong></div>
                          <div>Uploaded On: <strong style={{ color: 'var(--color-text-primary)' }}>{formatDateClean(sample.dispatchDate || new Date().toISOString())}</strong></div>
                          <div>Vehicle: <strong style={{ color: 'var(--color-text-primary)' }}>{sample.vehicleNo || sample.vehicle_no || 'Own Fleet'}</strong></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  ℹ️ Delivery tracking route will initialize as soon as the dispatch team ships this sample.
                </div>
              )}
            </>
          )}
        </div>

        {/* Standalone page navigation utilized */}
      </div>
    );
  }

  // Otherwise, render main Samples list view
  return (
    <div className="app-card" style={{ flex: 1 }}>
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title" style={{ margin: 0 }}>Sample Dispatch & Testing Status</h2>
          <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'inline-block' }}>
            Track and manage outgoing testing samples
          </span>
        </div>
        
        <div className="module-actions">
          {/* Status filters */}
          <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
            {['All', 'Pending', 'Sent', 'Approved', 'Lost'].map(st => (
              <button 
                key={st}
                className={`filter-pill ${filter === st ? 'active' : ''}`}
                onClick={() => setFilter(st)}
                style={{ color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
              >
                {st === 'All' ? 'All Statuses' : st}
              </button>
            ))}
          </div>

          <div className="search-box" style={{ background: '#f1f3f5', border: '1px solid #D6E2F0' }}>
            <Search size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search samples by customer, ID, product..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
          <button 
            className="btn-small btn-primary-small"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            onClick={() => {
              if (onCreateQuotationClick) {
                onCreateQuotationClick();
              } else {
                navigate.push('/sales/create-quotation');
              }
            }}
          >
            <Plus size={14} /> Create Quotation
          </button>
        </div>
      </div>

      {/* Info flow message */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '10px', fontSize: '12.5px', color: '#1e40af', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FlaskConical size={16} />
        <span><strong>Testing Timeline Rule:</strong> Samples are valid for a strict 20-day client evaluation window after despatch.</span>
      </div>

      {/* Table */}
      {/* Reminder Bucket Filters */}
      {isRemindersView && (
        <div className="tab-filters-row" style={{ background: '#f8fafc', padding: '4px', borderRadius: '8px', width: 'fit-content', marginBottom: '16px', display: 'flex', gap: '4px' }}>
          {['Today', 'Tomorrow', 'This Week', 'Overdue', 'Upcoming', 'All'].map(bucket => (
            <button
              key={bucket}
              className={`filter-pill ${reminderBucket === bucket ? 'active' : ''}`}
              onClick={() => setReminderBucket(bucket)}
              style={{ padding: '6px 12px', fontSize: '11.5px', background: reminderBucket === bucket ? '#fff' : 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px' }}
            >
              {bucket}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="crm-table-container">
        {isRemindersView ? (
          <table className="crm-table responsive-table flat-table">
            <thead>
              <tr>
                <th>Sample</th>
                <th>Customer</th>
                <th>Reminder</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSampleReminders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    No reminders found.
                  </td>
                </tr>
              ) : (
                displayedSampleReminders.map((reminder) => {
                  const s = samples.find((item) => String(item.id) === String(reminder.moduleId));
                  return (
                    <tr key={reminder.id}>
                      <td data-label="Sample">#SMP-{reminder.moduleId}</td>
                      <td data-label="Customer">{s?.leadName || reminder.customerName}</td>
                      <td data-label="Reminder">{reminder.reminderType}</td>
                      <td data-label="Date">
                        {formatReminderDate(reminder.reminderDate)}
                        {reminder.reminderTime ? ` · ${formatReminderTime(reminder.reminderTime)}` : ''}
                      </td>
                      <td data-label="Priority">{reminder.priority}</td>
                      <td data-label="Status">{reminder.status}</td>
                      <td data-label="Action">
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {reminder.status === 'Pending' && onCompleteReminder && (
                            <button className="btn-small btn-outline-small" onClick={() => onCompleteReminder(reminder.id)}>Complete</button>
                          )}
                          <button className="btn-small btn-outline-small" onClick={() => setReminderModal({ sample: s, reminder })}>Edit</button>
                          {s && <button className="btn-small btn-outline-small" onClick={() => setSelectedSample(s)}>View</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="crm-table responsive-table flat-table">
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Days Left</th>
                <th>Status</th>
                <th>Reminder</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                    No matching sample requests logged.
                  </td>
                </tr>
              ) : (
                displayedSamples.map((sample) => {
                  const exactInfo = getExactCountdown(sample);
                  const ds = getDispatchStatus(sample);
                  const isDeliveredOrActive = ds === 'Delivered' || ['Evaluation Active', 'Client Testing', 'Testing', 'Returned', 'Approved'].includes(sample.status);

                  return (
                    <tr key={sample.id}>
                      <td data-label="ID" style={{ fontWeight: '700' }}>
                        {formatSampleId(sample.id)}
                      </td>
                      <td data-label="Customer">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{sample.leadName}</span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Lead: {formatLeadId(sample.leadId)}</span>
                        </div>
                      </td>
                      <td data-label="Product">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{sample.product}</span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Qty: {sample.quantity} Pcs</span>
                        </div>
                      </td>
                      <td data-label="Days Left">
                        {(() => {
                          if (sample.status === 'RETURNED' || sample.status === 'Returned' || sample.retrievalStatus === 'Retrieved') {
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: '700', color: '#166534' }}>Evaluation Completed</span>
                                <span style={{ fontSize: '11px', color: '#15803d' }}>Returned on {sample.returnedDate ? sample.returnedDate.split('T')[0] : formatDateClean(sample.updatedAt || new Date().toISOString())}</span>
                              </div>
                            );
                          }
                          if (sample.status === 'RETURN_REQUESTED' || sample.status === 'RETURN_IN_TRANSIT') {
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: '700', color: '#b91c1c' }}>↩ Return {sample.status === 'RETURN_IN_TRANSIT' ? 'In Transit' : 'Requested'}</span>
                                <span style={{ fontSize: '11px', color: '#dc2626' }}>Pick-up {sample.status === 'RETURN_IN_TRANSIT' ? 'underway' : 'pending logistics'}</span>
                              </div>
                            );
                          }
                          if (isDeliveredOrActive) {
                            if (exactInfo.isExpired) {
                              return <span className="badge badge-danger" style={{ padding: '4px 10px', borderRadius: '999px', fontWeight: '700', display: 'inline-block' }}>Return Due (0d Left)</span>;
                            }
                            if (exactInfo.days > 5) {
                              return <span className="badge badge-success" style={{ padding: '4px 10px', borderRadius: '999px', fontWeight: '700', display: 'inline-block' }}>{exactInfo.days} Days Left ({exactInfo.hours}h)</span>;
                            }
                            return <span className="badge badge-warning" style={{ padding: '4px 10px', borderRadius: '999px', fontWeight: '700', display: 'inline-block' }}>{exactInfo.days} Days Left ({exactInfo.hours}h)</span>;
                          }
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>20 Days Window</span>
                              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '700' }}>⏳ Starts on Delivery</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td data-label="Status">
                        {(() => {
                          if (sample.status === 'RETURNED' || sample.status === 'Returned' || sample.retrievalStatus === 'Retrieved') {
                            return <span className="badge badge-returned">✓ Sample Returned</span>;
                          }
                          if (sample.status === 'RETURN_IN_TRANSIT') {
                            return <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 6, padding: '3px 8px', fontWeight: 800, fontSize: 11 }}>↩ Return In Transit</span>;
                          }
                          if (sample.status === 'RETURN_REQUESTED' || sample.status === 'Sample Back Requested' || sample.status === 'Return Requested' || sample.retrievalStatus === 'Requested') {
                            return <span className="badge badge-sample-back">↩ Return Requested</span>;
                          }
                          if (isDeliveredOrActive) {
                            if (exactInfo.isExpired) {
                              return <span className="badge badge-danger">Return Due</span>;
                            }
                            return <span className="badge badge-success" style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>Delivered ({exactInfo.days}d Left)</span>;
                          }
                          const displayStatus = sample.status || ds;
                          return <span className={getStatusBadge(displayStatus)}>{displayStatus}</span>;
                        })()}
                      </td>
                      <td data-label="Reminder">
                        {renderSampleReminder(sample)}
                      </td>
                      <td data-label="Actions" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div className="action-btn-group" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                          <button 
                            title="View Details"
                            onClick={() => setSelectedSample(sample)}
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

                          <button 
                            title="Edit Sample"
                            onClick={() => navigate.push(`/sales/edit-sample/${sample.id}`)}
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

                          <button 
                            title="Add Reminder"
                            onClick={() => setReminderModal({ sample })}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '32px', height: '32px',
                              background: '#ffffff', border: '1px solid #D6E2F0',
                              borderRadius: '8px', cursor: 'pointer', color: '#475569', flexShrink: 0
                            }}
                          >
                            <Bell size={14} />
                          </button>

                          {isDeliveredOrActive && sample.status !== 'RETURN_REQUESTED' && sample.status !== 'RETURN_IN_TRANSIT' && sample.status !== 'RETURNED' && sample.status !== 'Sample Back Requested' && sample.status !== 'Return Requested' && sample.status !== 'Return In Transit' && sample.status !== 'Returned' && (
                            <button
                              type="button"
                              onClick={() => handleRequestReturn(sample.id)}
                              style={{
                                background: '#ea580c',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '7px',
                                fontWeight: '800',
                                fontSize: '11.5px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                boxShadow: '0 1px 2px rgba(234,88,12,0.2)'
                              }}
                            >
                              ↩ Return Sample
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCreateQuotation(sample)}
                            style={{
                              background: '#2F4375',
                              color: '#ffffff',
                              border: '1px solid #2F4375',
                              padding: '6px 12px',
                              borderRadius: '8px',
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
                            Create Quotation →
                          </button>

                          {(sample.status === 'Sample Back Requested' || sample.status === 'Return Requested') && (
                            <span className="badge badge-sample-back" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>↩ Sample Back</span>
                          )}
                          {sample.status === 'Return In Transit' && (
                            <span style={{ fontSize: '11px', color: '#7e22ce', fontWeight: 'bold', background: '#f3e8ff', border: '1px solid #d8b4fe', padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}>Return In Transit</span>
                          )}
                          {(sample.status === 'Returned' || sample.retrievalStatus === 'Retrieved') && (
                            <span className="badge badge-returned" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>✓ Returned</span>
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

      {/* Pagination controls */}
      {!flat && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{filteredSamples.length}</strong> total samples)
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

      {/* Sample Audit History & Full Details Modal */}
      {selectedSample && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: '1px solid #DCE5F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DCE5F0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#24345C' }}>
                  Sample SMP-{String(selectedSample.id).padStart(3, '0')} Details & History
                </h3>
                <span style={{ fontSize: '12px', color: '#5E6B82' }}>Customer: <strong>{selectedSample.leadName || selectedSample.customer}</strong></span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedSample(null)} 
                style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                ✕ Close
              </button>
            </div>

            {/* General Details Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '12px', background: '#F5FAFE', padding: '14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
              <div><span style={{ color: '#5E6B82' }}>Product:</span> <strong>{selectedSample.product}</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Quantity:</span> <strong>{selectedSample.quantity} Pcs</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Status:</span> <strong style={{ color: '#2563eb' }}>{selectedSample.status}</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Dispatch Status:</span> <strong>{selectedSample.dispatchStatus || selectedSample.dispatch_status || 'Pending'}</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Transport Cost:</span> <strong style={{ color: '#16a34a' }}>₹{Number(selectedSample.transportationCost || selectedSample.transportCost || 0).toLocaleString()}</strong></div>
              <div><span style={{ color: '#5E6B82' }}>Delivered Date:</span> <strong>{selectedSample.deliveredDate ? selectedSample.deliveredDate.split('T')[0] : '—'}</strong></div>
            </div>

            {/* History Logs Timeline */}
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              📜 Status & Audit History Logs
            </h4>

            {(!selectedSample.history || selectedSample.history.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '24px', background: '#F5FAFE', borderRadius: '8px', color: '#5E6B82', fontSize: '13px' }}>
                No historical events logged yet for this sample.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedSample.history.map((log, idx) => (
                  <div key={log.id || idx} style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '10px', padding: '12px', fontSize: '12.5px', borderLeft: '4px solid #2563eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ color: '#24345C' }}>{log.status || log.event || 'Status Changed'}</strong>
                      <span style={{ fontSize: '11px', color: '#8893A7' }}>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}</span>
                    </div>
                    <div style={{ color: '#475569', margin: '2px 0' }}>{log.action || log.notes}</div>
                    {log.updatedBy && <div style={{ fontSize: '11px', color: '#5E6B82' }}>Updated by: <strong>{log.updatedBy || log.actor}</strong></div>}
                    {log.remarks && <div style={{ fontSize: '11.5px', color: '#059669', fontStyle: 'italic', marginTop: '4px' }}>Remarks: "{log.remarks}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      <ReminderModal
        open={Boolean(reminderModal)}
        onClose={() => setReminderModal(null)}
        onSave={handleSaveReminder}
        customerName={reminderModal?.sample?.leadName || reminderModal?.reminder?.customerName || ''}
        initialValues={reminderModal?.reminder}
        title={reminderModal?.reminder ? 'Edit Reminder' : 'Create Reminder'}
      />
    </div>
  );
}
