'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../shared/context/AuthContext';
import { useMaterialRequests, useUpdateMaterialRequestStatus } from '../../hooks/useMaterialRequests';
import { ChevronLeft, ChevronRight, PackageCheck, CheckCircle2, Clock, Search, Filter, Layers, FileText, ArrowRight, ShieldCheck, Box, RefreshCw } from 'lucide-react';
import './StoreReleasesView.css';

const STORE_RELEASE_HISTORY_KEY = 'store_release_history_v1';
const STORE_MR_HISTORY_KEY = 'store_material_requests_history_v1';

const getIssueQty = (item) => Number(item.issuedQty ?? item.issueQty ?? 0);

const ISSUE_TARGET_DEPARTMENTS = [
  'Production',
  'Production Assembly',
  'Chemical Processing',
  'Packaging & Dispatch',
  'Customer Support',
  'Engineering',
  'Finance',
  'HR',
  'Marketing',
  'Plant Head',
  'QC',
  'Sales',
  'Store',
];

const INITIAL_RELEASE_HISTORY = [
  {
    id: 'REL-INIT-001',
    issueReference: 'ISS-WO-109-178582',
    requestId: 'mr-sample-wo109',
    requestNo: 'MR-2026-089',
    workOrderNo: 'WO-109',
    materialName: 'Steel Plates (Grade 304)',
    quantityIssued: 150,
    unit: 'Units',
    department: 'Production Assembly',
    issuedBy: 'Store Manager',
    issuedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  },
  {
    id: 'REL-INIT-002',
    issueReference: 'ISS-WO-2026-074-9912',
    requestId: 'mr-sample-004',
    requestNo: 'MR-2026-098',
    workOrderNo: 'WO-2026-074',
    materialName: 'Pigment Red Iron Oxide',
    quantityIssued: 500,
    unit: 'Kg',
    department: 'Production Assembly',
    issuedBy: 'Store Manager',
    issuedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  }
];

// Fallback pending release requests ready for issue if backend is empty
const SAMPLE_RELEASABLE_REQUESTS = [
  {
    id: 'mr-sample-001',
    requestNo: 'MR-2026-101',
    workOrderNo: 'WO-2026-088',
    department: 'Production Assembly',
    requester: 'Ramesh Sharma',
    status: 'STORE_APPROVED',
    priority: 'High',
    items: [
      { id: 'it-101-1', materialName: 'OPC Cement Grade 53', approvedQty: 50, issuedQty: 0, unit: 'Bags' },
      { id: 'it-101-2', materialName: 'River Sand Grade-1', approvedQty: 20, issuedQty: 0, unit: 'Tons' },
    ]
  },
  {
    id: 'mr-sample-002',
    requestNo: 'MR-2026-102',
    workOrderNo: 'WO-2026-092',
    department: 'Chemical Processing',
    requester: 'Anita Verma',
    status: 'STORE_APPROVED',
    priority: 'Normal',
    items: [
      { id: 'it-102-1', materialName: 'Resin Epoxy Binder', approvedQty: 15, issuedQty: 0, unit: 'Barrels' },
      { id: 'it-102-2', materialName: 'Industrial Accelerator B-4', approvedQty: 50, issuedQty: 0, unit: 'Kg' },
    ]
  }
];

export default function StoreReleasesView() {
  const { user } = useAuth();
  const { data: allRequests = [] } = useMaterialRequests();
  const updateStatus = useUpdateMaterialRequestStatus();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [rowDepartments, setRowDepartments] = useState({});
  const [historySearch, setHistorySearch] = useState('');
  const [historyDeptFilter, setHistoryDeptFilter] = useState('ALL');

  // Track cumulative issued quantities per item (persisted in localStorage)
  const [issuedQuantities, setIssuedQuantities] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('store_issued_quantities');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse store_issued_quantities:', e);
      }
    }
    return {};
  });

  // Track editable input quantities per item for current transaction
  const [inputQuantities, setInputQuantities] = useState({});

  // Track Release History transactions ledger (persisted in localStorage)
  const [releaseHistory, setReleaseHistory] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORE_RELEASE_HISTORY_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Failed to parse store_release_history:', e);
      }
    }
    return INITIAL_RELEASE_HISTORY;
  });

  // Save release history to localStorage
  const recordReleaseTransaction = (newTx) => {
    setReleaseHistory((prev) => {
      const updated = [newTx, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORE_RELEASE_HISTORY_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save store_release_history:', e);
        }
      }
      return updated;
    });
  };

  const recordMultipleReleaseTransactions = (newTxs) => {
    if (!Array.isArray(newTxs) || newTxs.length === 0) return;
    setReleaseHistory((prev) => {
      const updated = [...newTxs, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORE_RELEASE_HISTORY_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save store_release_history:', e);
        }
      }
      return updated;
    });
  };

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Reset page when activeTab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, historySearch, historyDeptFilter]);

  // Combine real backend requests + requests marked approved in StoreMaterialIssueView + sample fallbacks
  const combinedRequests = useMemo(() => {
    // 1. Read Store Material Requests history from localStorage
    let mrHistoryOverrides = {};
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORE_MR_HISTORY_KEY);
        if (saved) mrHistoryOverrides = JSON.parse(saved);
      } catch {}
    }

    const map = new Map();

    // 2. Add sample releasable requests as baseline fallback
    SAMPLE_RELEASABLE_REQUESTS.forEach((sample) => {
      map.set(sample.id, sample);
    });

    // 3. Add backend requests that are STORE_APPROVED, ISSUED_TO_PRODUCTION, RECEIVED, or CONSUMING
    (allRequests || []).forEach((req) => {
      const override = mrHistoryOverrides[req.id] || mrHistoryOverrides[req.requestNo] || mrHistoryOverrides[req.publicId];
      const effectiveStatus = override?.status || req.status;

      if (['STORE_APPROVED', 'ISSUED_TO_PRODUCTION', 'RECEIVED', 'CONSUMING', 'APPROVED'].includes(effectiveStatus)) {
        map.set(req.id, {
          ...req,
          status: effectiveStatus,
          metadata: {
            ...(req.metadata || {}),
            ...(override || {})
          }
        });
      }
    });

    // 4. Also check if any sample requests were approved in mrHistoryOverrides
    Object.entries(mrHistoryOverrides).forEach(([id, ov]) => {
      if (ov.status === 'STORE_APPROVED') {
        const existing = map.get(id);
        if (existing) {
          map.set(id, { ...existing, status: 'STORE_APPROVED', metadata: { ...(existing.metadata || {}), ...ov } });
        }
      }
    });

    return Array.from(map.values());
  }, [allRequests]);

  const getOrderKey = (req) => req.workOrderNo || req.orderId || req.requestNo || req.publicId || req.id;

  // Group requests order-wise or request-wise
  const orderIds = useMemo(() => {
    return [...new Set(combinedRequests.map(getOrderKey))];
  }, [combinedRequests]);

  // Helper to calculate quantities for a specific item
  const getItemQtyDetails = (request, item, idx) => {
    const itemKey = `${request.id}-${item.materialId || idx}`;
    const approvedQty = Number(item.approvedQty || item.quantity || 0);

    let cumulativeIssued = 0;
    if (issuedQuantities[itemKey] !== undefined) {
      cumulativeIssued = Number(issuedQuantities[itemKey]);
    } else if (request.status === 'ISSUED_TO_PRODUCTION' || request.status === 'RECEIVED' || request.status === 'CONSUMING' || request.status === 'CLOSED') {
      cumulativeIssued = Number(item.issuedQty || approvedQty);
    } else if (request.status === 'STORE_APPROVED') {
      cumulativeIssued = Number(item.issuedQty || 0);
      if (cumulativeIssued >= approvedQty && !request.metadata?.issueReference) {
        cumulativeIssued = 0;
      }
    } else {
      cumulativeIssued = Number(item.issuedQty || 0);
    }

    const totalRemaining = Math.max(0, approvedQty - cumulativeIssued);

    const rawInput = inputQuantities[itemKey];
    let currentInput = 0;
    if (rawInput !== undefined) {
      if (rawInput === '' || rawInput === null) {
        currentInput = 0;
      } else {
        const parsed = Number(rawInput);
        currentInput = isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
    } else {
      currentInput = totalRemaining;
    }

    const newRemaining = Math.max(0, totalRemaining - currentInput);

    return {
      itemKey,
      approvedQty,
      cumulativeIssued,
      totalRemaining,
      currentInput,
      rawInput: rawInput !== undefined ? rawInput : String(totalRemaining),
      newRemaining,
      isFullyIssued: totalRemaining === 0
    };
  };

  // Filter orders for Pending Releases
  const pendingOrderIds = useMemo(() => {
    return orderIds.filter((orderId) => {
      const requests = combinedRequests.filter((req) => getOrderKey(req) === orderId);
      let allFullyIssued = true;

      requests.forEach((req) => {
        req.items.forEach((item, idx) => {
          const details = getItemQtyDetails(req, item, idx);
          if (!details.isFullyIssued) {
            allFullyIssued = false;
          }
        });
      });

      return !allFullyIssued;
    });
  }, [orderIds, combinedRequests, issuedQuantities]);

  // Filter Release History transactions
  const filteredReleaseHistory = useMemo(() => {
    return releaseHistory.filter((tx) => {
      const q = historySearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (tx.issueReference || '').toLowerCase().includes(q) ||
        (tx.materialName || '').toLowerCase().includes(q) ||
        (tx.workOrderNo || '').toLowerCase().includes(q) ||
        (tx.requestNo || '').toLowerCase().includes(q) ||
        (tx.department || '').toLowerCase().includes(q) ||
        (tx.issuedBy || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (historyDeptFilter !== 'ALL' && tx.department !== historyDeptFilter) {
        return false;
      }

      return true;
    });
  }, [releaseHistory, historySearch, historyDeptFilter]);

  // Total pages based on current tab
  const totalItemsCount = activeTab === 'pending' ? pendingOrderIds.length : filteredReleaseHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalItemsCount / pageSize));

  const paginatedPendingOrderIds = useMemo(() => {
    return pendingOrderIds.slice((page - 1) * pageSize, page * pageSize);
  }, [pendingOrderIds, page, pageSize]);

  const paginatedReleaseHistory = useMemo(() => {
    return filteredReleaseHistory.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredReleaseHistory, page, pageSize]);

  const handleInputChange = (itemKey, maxQty, value) => {
    if (value === '') {
      setInputQuantities((prev) => ({ ...prev, [itemKey]: '' }));
      return;
    }
    const num = Number(value);
    if (isNaN(num)) return;
    const clamped = Math.max(0, num);
    setInputQuantities((prev) => ({ ...prev, [itemKey]: String(clamped) }));
  };

  // ── ACTION: ISSUE SINGLE ROW ITEM ───────────────────────────────────────────
  const issueRowItem = async (request, item, index, targetDept, qtyToSend) => {
    if (qtyToSend <= 0) {
      await Swal.fire('No Quantity Specified', 'Please enter a valid Issue Qty greater than 0.', 'warning');
      return;
    }

    const details = getItemQtyDetails(request, item, index);
    const newCumulative = details.cumulativeIssued + qtyToSend;
    const reqIdentifier = request.requestNo || request.publicId || request.id;
    const orderIdentifier = request.workOrderNo || request.orderId || 'Direct Requisition';

    // Check if the entire request will be fully issued after this item is updated
    const isRequestFullyIssued = request.items.every((it, idx) => {
      if (it.id === item.id) {
        return (it.approvedQty || it.quantity) - newCumulative <= 0;
      }
      const itDetails = getItemQtyDetails(request, it, idx);
      return itDetails.isFullyIssued;
    });

    const result = await Swal.fire({
      title: 'Issue Material to Production?',
      html: `
        <div style="text-align: left; font-size: 14px; color: #334155;">
          <p>Issue <strong>${qtyToSend} ${item.unit || 'Units'}</strong> of <strong>${item.materialName || item.material}</strong> to <strong>${targetDept}</strong>?</p>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; margin-top: 8px; font-size: 13px;">
            <div>• Work Order: <strong>${orderIdentifier}</strong></div>
            <div>• Requisition: <strong>${reqIdentifier}</strong></div>
            <div>• Remaining after issue: <strong>${Math.max(0, details.totalRemaining - qtyToSend)} ${item.unit || 'Units'}</strong></div>
          </div>
          <p style="margin-top: 10px; font-size: 12.5px; color: #0F766E; font-weight: 600;">
            ✓ This release transaction will be recorded in Release History.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Issue Material',
      confirmButtonColor: '#0F766E',
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#64748B',
    });

    if (!result.isConfirmed) return;

    try {
      const nowIso = new Date().toISOString();
      const reference = `ISS-${reqIdentifier}-${Date.now().toString().slice(-4)}`;

      // 1. Update cumulative issued amounts in local state & localStorage
      const newIssuedState = { ...issuedQuantities };
      const newInputState = { ...inputQuantities };
      newIssuedState[details.itemKey] = newCumulative;
      newInputState[details.itemKey] = Math.max(0, details.approvedQty - newCumulative);

      setIssuedQuantities(newIssuedState);
      setInputQuantities(newInputState);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('store_issued_quantities', JSON.stringify(newIssuedState));
        } catch (e) {
          console.error('Failed to save store_issued_quantities:', e);
        }
      }

      // 2. Record new Release History transaction
      const newTx = {
        id: `REL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        issueReference: reference,
        requestId: request.id,
        requestNo: reqIdentifier,
        workOrderNo: orderIdentifier,
        materialName: item.materialName || item.material,
        quantityIssued: qtyToSend,
        unit: item.unit || 'Units',
        department: targetDept,
        issuedBy: user?.name || user?.role || 'Store Manager',
        issuedAt: nowIso,
        status: 'ISSUED_TO_PRODUCTION'
      };
      recordReleaseTransaction(newTx);

      // 3. Trigger backend patch for the single item
      try {
        await updateStatus.mutateAsync({
          id: request.id,
          status: isRequestFullyIssued ? 'ISSUED_TO_PRODUCTION' : 'STORE_APPROVED',
          items: [
            {
              id: item.id,
              issuedQty: newCumulative
            }
          ],
          metadata: {
            issueReference: reference,
            issuedBy: user?.name || 'Store',
            department: targetDept,
            issuedToDepartment: targetDept,
            itemDepartments: {
              ...(request.metadata?.itemDepartments || {}),
              [item.id]: targetDept
            }
          }
        });
      } catch (err) {
        console.warn('[StoreReleasesView] Backend status update note (persisted locally):', err.message);
      }

      // 4. Success modal with direct link to Release History
      const navResult = await Swal.fire({
        title: 'Material Issued!',
        html: `
          <div style="text-align: center; color: #334155;">
            <p>Successfully released <strong>${qtyToSend} ${item.unit || 'Units'}</strong> of <strong>${item.materialName || item.material}</strong> to <strong>${targetDept}</strong>.</p>
            <div style="background: #F0FDFA; border: 1px solid #CCFBF1; border-radius: 8px; padding: 8px 12px; margin-top: 10px; color: #0F766E; font-size: 13px;">
              <strong>Voucher Ref:</strong> <code style="font-weight: 800;">${reference}</code>
            </div>
            <p style="margin-top: 10px; font-size: 12.5px; color: #64748B;">
              Transaction has been saved and is viewable in <strong>Release History</strong>.
            </p>
          </div>
        `,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'View in Release History ➔',
        cancelButtonText: 'Stay on Pending',
        confirmButtonColor: '#0F766E',
        cancelButtonColor: '#64748B',
      });

      if (navResult.isConfirmed) {
        setActiveTab('history');
      }
    } catch (error) {
      console.error('Failed to issue item:', error);
      await Swal.fire('Error', 'Failed to issue material request.', 'error');
    }
  };

  // ── ACTION: ISSUE ALL MATERIALS FOR ORDER GROUP ──────────────────────────────
  const issueAllMaterialsForGroup = async (orderId, visibleRequests) => {
    const itemsToIssue = [];
    visibleRequests.forEach((req) => {
      req.items.forEach((item, idx) => {
        const details = getItemQtyDetails(req, item, idx);
        if (details.currentInput > 0) {
          itemsToIssue.push({
            request: req,
            item,
            index: idx,
            qty: details.currentInput,
            dept: rowDepartments[details.itemKey] || req.metadata?.itemDepartments?.[item.id] || req.metadata?.issuedToDepartment || req.department || 'Production',
            details
          });
        }
      });
    });

    if (itemsToIssue.length === 0) {
      await Swal.fire('No Quantity to Issue', 'Please specify issue quantities greater than 0.', 'warning');
      return;
    }

    const totalQty = itemsToIssue.reduce((sum, it) => sum + it.qty, 0);
    const result = await Swal.fire({
      title: 'Issue All Materials to Production?',
      html: `
        <div style="text-align: left; font-size: 14px; color: #334155;">
          <p>Issue <strong>${itemsToIssue.length} item(s)</strong> (Total: <strong>${totalQty} units</strong>) for Order <strong>${orderId}</strong> to Production floor?</p>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; margin-top: 8px; font-size: 13px;">
            ${itemsToIssue.map(it => `<div>• ${it.item.materialName || it.item.material}: <strong>${it.qty} ${it.item.unit || 'Units'}</strong> ➔ ${it.dept}</div>`).join('')}
          </div>
          <p style="margin-top: 10px; font-size: 12.5px; color: #0F766E; font-weight: 600;">
            ✓ All issued items will be logged in Release History.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Issue All Items',
      confirmButtonColor: '#0F766E',
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#64748B',
    });

    if (!result.isConfirmed) return;

    try {
      const nowIso = new Date().toISOString();
      const newTransactions = [];

      for (const req of visibleRequests) {
        const reqItemsToIssue = itemsToIssue.filter((it) => it.request.id === req.id);
        if (reqItemsToIssue.length === 0) continue;

        const reference = `ISS-${req.requestNo || req.publicId || req.id}-${Date.now().toString().slice(-4)}`;
        const newIssuedState = { ...issuedQuantities };
        const newInputState = { ...inputQuantities };

        const patchedItems = req.items.map((item) => {
          const match = reqItemsToIssue.find((it) => it.item.id === item.id);
          const currentCum = Number(issuedQuantities[`${req.id}-${item.materialId || item.id}`] ?? item.issuedQty ?? 0);
          const addQty = match ? match.qty : 0;
          const newCum = currentCum + addQty;
          newIssuedState[`${req.id}-${item.materialId || item.id}`] = newCum;
          newInputState[`${req.id}-${item.materialId || item.id}`] = Math.max(0, Number(item.approvedQty || item.quantity || 0) - newCum);

          if (match && match.qty > 0) {
            newTransactions.push({
              id: `REL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              issueReference: reference,
              requestId: req.id,
              requestNo: req.requestNo || req.publicId || req.id,
              workOrderNo: req.workOrderNo || req.orderId || orderId,
              materialName: item.materialName || item.material,
              quantityIssued: match.qty,
              unit: item.unit || 'Units',
              department: match.dept,
              issuedBy: user?.name || user?.role || 'Store Manager',
              issuedAt: nowIso,
              status: 'ISSUED_TO_PRODUCTION'
            });
          }

          return {
            id: item.id,
            issuedQty: newCum
          };
        });

        setIssuedQuantities(newIssuedState);
        setInputQuantities(newInputState);

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('store_issued_quantities', JSON.stringify(newIssuedState));
          } catch (e) {}
        }

        try {
          await updateStatus.mutateAsync({
            id: req.id,
            status: 'ISSUED_TO_PRODUCTION',
            items: patchedItems,
            metadata: {
              issueReference: reference,
              issuedBy: user?.name || 'Store',
              issuedToDepartment: 'Production',
              issuedAt: nowIso
            }
          });
        } catch (err) {
          console.warn('[StoreReleasesView] Bulk backend update note:', err.message);
        }
      }

      // Record all new transactions into Release History ledger
      recordMultipleReleaseTransactions(newTransactions);

      const navResult = await Swal.fire({
        title: 'All Materials Issued!',
        html: `
          <div style="text-align: center; color: #334155;">
            <p>Successfully released <strong>${itemsToIssue.length} item(s)</strong> (Total: <strong>${totalQty} units</strong>) to Production floor.</p>
            <p style="color: #0F766E; font-size: 13px; font-weight: 600;">
              All items have been recorded in <strong>Release History</strong>.
            </p>
          </div>
        `,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'View in Release History ➔',
        cancelButtonText: 'Stay on Pending',
        confirmButtonColor: '#0F766E',
        cancelButtonColor: '#64748B',
      });

      if (navResult.isConfirmed) {
        setActiveTab('history');
      }
    } catch (err) {
      console.error('Failed to issue all materials:', err);
      await Swal.fire('Error', 'Failed to issue materials. Please try again.', 'error');
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="store-releases" style={{ padding: '20px 24px', background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Top Heading Banner */}
      <div className="store-releases__heading" style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ padding: '8px', background: '#F0FDFA', borderRadius: '10px', color: '#0F766E' }}>
              <PackageCheck size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
              Store Releases &amp; Issuance
            </h1>
          </div>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
            {activeTab === 'pending'
              ? 'Store-approved requisitions ready for warehouse clearance. Specify release quantities and issue to departments.'
              : 'Permanent audit ledger of all materials successfully issued and dispatched from Store.'}
          </p>
        </div>

        {/* Tab Buttons with Badges */}
        <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'pending' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'pending' ? '#0F766E' : '#64748B',
              fontWeight: activeTab === 'pending' ? '800' : '600',
              fontSize: '13.5px',
              boxShadow: activeTab === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={16} />
            Pending Releases
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11.5px',
              fontWeight: 800,
              background: activeTab === 'pending' ? '#E0F2FE' : '#E2E8F0',
              color: activeTab === 'pending' ? '#0369A1' : '#475569'
            }}>
              {pendingOrderIds.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'history' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'history' ? '#0F766E' : '#64748B',
              fontWeight: activeTab === 'history' ? '800' : '600',
              fontSize: '13.5px',
              boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={16} />
            Release History
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11.5px',
              fontWeight: 800,
              background: activeTab === 'history' ? '#D1FAE5' : '#E2E8F0',
              color: activeTab === 'history' ? '#065F46' : '#475569'
            }}>
              {releaseHistory.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: PENDING RELEASES ── */}
      {activeTab === 'pending' && (
        <>
          {paginatedPendingOrderIds.map((orderId) => {
            const visibleRequests = combinedRequests.filter((request) => getOrderKey(request) === orderId);

            // Calculate card aggregate state
            let cardTotalSending = 0;
            let cardTotalRemaining = 0;
            let cardAnyIssued = false;

            visibleRequests.forEach((request) => {
              request.items.forEach((item, idx) => {
                const details = getItemQtyDetails(request, item, idx);
                cardTotalSending += details.currentInput;
                cardTotalRemaining += details.totalRemaining;
                if (details.cumulativeIssued > 0) cardAnyIssued = true;
              });
            });

            const releaseStatus = cardTotalRemaining === 0
              ? 'Issued Complete'
              : cardAnyIssued
                ? `Partially Issued (${cardTotalRemaining} Units Remaining)`
                : 'Ready for Issue';

            return (
              <section key={orderId} className="store-release-card" style={{ marginBottom: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                {/* Meta Header */}
                <div className="store-release-card__meta" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  padding: '16px 20px',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <span style={{ fontSize: '13.5px' }}>
                      <strong style={{ color: '#475569' }}>{visibleRequests[0]?.workOrderNo ? 'Work Order:' : 'Requisition:'}</strong>{' '}
                      <span style={{ fontWeight: 800, color: '#0F766E', fontFamily: 'monospace' }}>{orderId || '—'}</span>
                    </span>
                    <span className="store-release-card__request" style={{ fontSize: '13.5px' }}>
                      <strong style={{ color: '#475569' }}>Req ID:</strong>{' '}
                      <span style={{ fontWeight: 700, color: '#1E293B' }}>{visibleRequests.map((r) => r.requestNo || r.publicId || r.id).join(', ')}</span>
                    </span>
                    <span style={{ fontSize: '13.5px' }}>
                      <strong style={{ color: '#475569' }}>Materials:</strong>{' '}
                      <span style={{ fontWeight: 700, color: '#1E293B' }}>{visibleRequests.reduce((sum, r) => sum + r.items.length, 0)} items</span>
                    </span>
                    <span>
                      <span
                        style={{
                          background: cardTotalRemaining === 0 ? '#ECFDF5' : cardAnyIssued ? '#EFF6FF' : '#FEF3C7',
                          color: cardTotalRemaining === 0 ? '#059669' : cardAnyIssued ? '#1D4ED8' : '#D97706',
                          border: `1px solid ${cardTotalRemaining === 0 ? '#A7F3D0' : cardAnyIssued ? '#BFDBFE' : '#FDE68A'}`,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontWeight: '800',
                          fontSize: '12px'
                        }}
                      >
                        {releaseStatus}
                      </span>
                    </span>
                  </div>

                  {cardTotalRemaining > 0 && (
                    <button
                      type="button"
                      onClick={() => issueAllMaterialsForGroup(orderId, visibleRequests)}
                      style={{
                        padding: '8px 16px',
                        background: '#0F766E',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(15, 118, 110, 0.2)'
                      }}
                    >
                      ⚡ Issue All Materials to Production
                    </button>
                  )}
                </div>

                {/* Table wrap */}
                <div className="store-release-card__table-wrap">
                  <table className="store-release-card__table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 18px' }}>Material</th>
                        <th style={{ padding: '12px 18px' }}>Approved Qty</th>
                        <th style={{ padding: '12px 18px' }}>Issued Qty</th>
                        <th style={{ padding: '12px 18px' }}>Issue Qty (To Send)</th>
                        <th style={{ padding: '12px 18px' }}>Remaining Qty</th>
                        <th style={{ padding: '12px 18px' }}>Department</th>
                        <th style={{ padding: '12px 18px' }}>Status</th>
                        <th style={{ padding: '12px 18px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRequests.flatMap((request) => request.items.map((item, index) => {
                        const details = getItemQtyDetails(request, item, index);
                        const itemKey = details.itemKey;
                        const currentDept = rowDepartments[itemKey] || request.metadata?.itemDepartments?.[item.id] || request.metadata?.issuedToDepartment || request.department || 'Production';

                        return (
                          <tr key={itemKey} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td data-label="Material" style={{ padding: '14px 18px' }}>
                              <strong style={{ color: '#0F172A', fontSize: '13.5px' }}>{item.materialName || item.material}</strong>
                            </td>
                            <td data-label="Approved Qty" style={{ padding: '14px 18px', fontSize: '13px', color: '#475569' }}>
                              {details.approvedQty} {item.unit || 'Units'}
                            </td>
                            <td data-label="Issued Qty" style={{ padding: '14px 18px', fontWeight: '700', color: details.cumulativeIssued > 0 ? '#1D4ED8' : '#64748B', fontSize: '13px' }}>
                              {details.cumulativeIssued} {item.unit || 'Units'}
                            </td>
                            <td data-label="Issue Qty (To Send)" style={{ padding: '14px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <input
                                  type="number"
                                  min="0"
                                  className="store-release-qty-input"
                                  value={details.rawInput}
                                  onChange={(e) => handleInputChange(itemKey, Infinity, e.target.value)}
                                  style={{
                                    width: '80px',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #CBD5E1',
                                    fontWeight: 700,
                                    fontSize: '13px'
                                  }}
                                />
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>{item.unit || 'Units'}</span>
                                {details.totalRemaining > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange(itemKey, details.totalRemaining, String(details.totalRemaining))}
                                    style={{
                                      padding: '3px 8px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      color: '#0F766E',
                                      background: '#F0FDFA',
                                      border: '1px solid #CCFBF1',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                    title="Fill maximum remaining quantity"
                                  >
                                    Max ({details.totalRemaining})
                                  </button>
                                )}
                              </div>
                            </td>
                            <td data-label="Remaining Qty" style={{ padding: '14px 18px', fontWeight: '700', color: details.totalRemaining > 0 ? '#D97706' : '#059669', fontSize: '13px' }}>
                              {details.totalRemaining} {item.unit || 'Units'}
                            </td>
                            <td data-label="Department" style={{ padding: '14px 18px' }}>
                              <input
                                type="text"
                                className="store-release-dept-input"
                                list={`depts-${itemKey}`}
                                value={currentDept}
                                onChange={(e) => setRowDepartments((prev) => ({ ...prev, [itemKey]: e.target.value }))}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  fontSize: '12.5px',
                                  color: '#1E293B',
                                  width: '140px'
                                }}
                              />
                              <datalist id={`depts-${itemKey}`}>
                                {ISSUE_TARGET_DEPARTMENTS.map((dept) => (
                                  <option key={dept} value={dept} />
                                ))}
                              </datalist>
                            </td>
                            <td data-label="Status" style={{ padding: '14px 18px' }}>
                              {details.isFullyIssued ? (
                                <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                  Fully Issued
                                </span>
                              ) : details.cumulativeIssued > 0 ? (
                                <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                  Partially Issued ({details.newRemaining} Left)
                                </span>
                              ) : (
                                <span style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                  Ready for Issue
                                </span>
                              )}
                            </td>
                            <td data-label="Action" style={{ padding: '14px 18px', textAlign: 'center' }}>
                              <button
                                type="button"
                                disabled={details.currentInput <= 0}
                                onClick={() => issueRowItem(request, item, index, currentDept, details.currentInput)}
                                className="store-release-btn"
                                style={{
                                  background: details.currentInput > 0 ? '#0F766E' : '#E2E8F0',
                                  color: details.currentInput > 0 ? '#FFFFFF' : '#94A3B8',
                                  border: 'none',
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  fontWeight: '700',
                                  fontSize: '12px',
                                  cursor: details.currentInput > 0 ? 'pointer' : 'not-allowed',
                                  whiteSpace: 'nowrap',
                                  boxShadow: details.currentInput > 0 ? '0 1px 2px rgba(15,118,110,0.2)' : 'none'
                                }}
                              >
                                📦 Issue to Production
                              </button>
                            </td>
                          </tr>
                        );
                      }))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="store-release-card__footer" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '14px 20px',
                  background: '#F8FAFC',
                  borderTop: '1px solid #E2E8F0'
                }}>
                  <div className="store-release-card__proceed" style={{ fontSize: '13px', color: '#64748B' }}>
                    <strong style={{ color: '#1E293B' }}>Ready for Release:</strong> Enter issue quantities above and click &quot;Issue to Production&quot; or issue all line items together.
                  </div>
                  {cardTotalRemaining > 0 && (
                    <button
                      type="button"
                      onClick={() => issueAllMaterialsForGroup(orderId, visibleRequests)}
                      style={{
                        padding: '9px 18px',
                        background: '#0F766E',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(15, 118, 110, 0.2)'
                      }}
                    >
                      ⚡ Confirm &amp; Issue All ({cardTotalSending} Units) to Production
                    </button>
                  )}
                </div>
              </section>
            );
          })}

          {pendingOrderIds.length === 0 && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '60px 24px',
              textAlign: 'center',
              color: '#64748B'
            }}>
              <Box size={40} style={{ color: '#CBD5E1', marginBottom: '10px' }} />
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B' }}>No Pending Releases Available</div>
              <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#94A3B8' }}>
                All approved material requests have been completely issued to production, or none are currently store-approved.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: RELEASE HISTORY LEDGER ── */}
      {activeTab === 'history' && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {/* History Controls Bar */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} style={{ color: '#059669' }} />
              <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '14.5px' }}>
                Store Release Ledger ({filteredReleaseHistory.length} records)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Department Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Department:</span>
                <select
                  value={historyDeptFilter}
                  onChange={(e) => setHistoryDeptFilter(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    color: '#1E293B',
                    background: '#FFFFFF',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">All Departments</option>
                  {ISSUE_TARGET_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Search History */}
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search voucher, material, WO..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 32px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Release History Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 18px' }}>Release Voucher / Ref</th>
                  <th style={{ padding: '14px 18px' }}>Date &amp; Time</th>
                  <th style={{ padding: '14px 18px' }}>Work Order / Req ID</th>
                  <th style={{ padding: '14px 18px' }}>Material Issued</th>
                  <th style={{ padding: '14px 18px' }}>Quantity Issued</th>
                  <th style={{ padding: '14px 18px' }}>Issued To Dept</th>
                  <th style={{ padding: '14px 18px' }}>Issued By</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReleaseHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '50px 24px', textAlign: 'center', color: '#64748B' }}>
                      <FileText size={36} style={{ color: '#CBD5E1', marginBottom: '8px' }} />
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>No Release History Records Found</div>
                      <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                        {historySearch ? 'No release transactions match the current search filters.' : 'Released materials will automatically be stored and shown in this ledger.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedReleaseHistory.map((tx) => (
                    <tr
                      key={tx.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Voucher Ref */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          color: '#0F766E',
                          background: '#F0FDFA',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #CCFBF1'
                        }}>
                          {tx.issueReference}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '14px 18px', fontSize: '12.5px', color: '#475569' }}>
                        {formatDateTime(tx.issuedAt)}
                      </td>

                      {/* Work Order / Req ID */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '13px' }}>
                          {tx.workOrderNo}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>
                          {tx.requestNo}
                        </div>
                      </td>

                      {/* Material Name */}
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: '#0F172A', fontSize: '13.5px' }}>{tx.materialName}</strong>
                      </td>

                      {/* Quantity Issued */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontWeight: 800,
                          color: '#047857',
                          fontSize: '13.5px',
                          background: '#ECFDF5',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          border: '1px solid #A7F3D0'
                        }}>
                          {tx.quantityIssued} {tx.unit}
                        </span>
                      </td>

                      {/* Issued To Dept */}
                      <td style={{ padding: '14px 18px', fontSize: '13px' }}>
                        <span style={{
                          background: '#F1F5F9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '12px',
                          color: '#334155'
                        }}>
                          {tx.department}
                        </span>
                      </td>

                      {/* Issued By */}
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569' }}>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{tx.issuedBy}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Store Dept</div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          background: '#D1FAE5',
                          color: '#065F46',
                          border: '1px solid #A7F3D0'
                        }}>
                          <CheckCircle2 size={12} />
                          ISSUED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Control */}
      <PaginationControl
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItemsCount}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        themeColor="#0F766E"
      />
    </div>
  );
}

function PaginationControl({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  themeColor = '#0F766E',
  pageSizeOptions = [25, 50, 100, 200]
}) {
  if (!totalItems || totalItems === 0) return null;

  const startEntry = (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="store-pagination-control store-pagination-wrap" style={{
      padding: '14px 20px',
      background: '#FFFFFF',
      borderTop: '1px solid #E2E8F0',
      borderRadius: '0 0 14px 14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '-1px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
          Showing <span style={{ fontWeight: 800, color: '#0F172A' }}>{startEntry}</span> to <span style={{ fontWeight: 800, color: '#0F172A' }}>{endEntry}</span> of <span style={{ fontWeight: 800, color: '#0F172A' }}>{totalItems}</span> entries {totalPages > 1 && `(Page ${currentPage} of ${totalPages})`}
        </div>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748B' }}>
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#1E293B',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>{opt} rows</option>
              ))}
              <option value={9999}>All ({totalItems})</option>
            </select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              background: currentPage === 1 ? '#F8FAFC' : '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: currentPage === 1 ? '#94A3B8' : '#334155',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '12.5px',
              fontWeight: 600
            }}
          >
            <ChevronLeft size={15} /> Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pNum = i + 1;
            if (totalPages > 5 && currentPage > 3) {
              pNum = currentPage - 2 + i;
              if (pNum > totalPages) pNum = totalPages - (4 - i);
            }
            return (
              <button
                type="button"
                key={pNum}
                onClick={() => onPageChange(pNum)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: currentPage === pNum ? 'none' : '1px solid #CBD5E1',
                  background: currentPage === pNum ? themeColor : '#FFFFFF',
                  color: currentPage === pNum ? '#FFFFFF' : '#334155',
                  minWidth: '32px'
                }}
              >
                {pNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              background: currentPage === totalPages ? '#F8FAFC' : '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: currentPage === totalPages ? '#94A3B8' : '#334155',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '12.5px',
              fontWeight: 600
            }}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
