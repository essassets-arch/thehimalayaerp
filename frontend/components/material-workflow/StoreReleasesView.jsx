'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../shared/context/AuthContext';
import { useERPStore } from '../../store/erpStore';
import { useMaterialRequests, useUpdateMaterialRequestStatus } from '../../hooks/useMaterialRequests';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './StoreReleasesView.css';

const getIssueQty = (item) => Number(item.issuedQty ?? item.issueQty ?? 0);

const ISSUE_TARGET_DEPARTMENTS = [
  'Production',
  'Customer Support',
  'Dispatch',
  'Engineering',
  'Finance',
  'HR',
  'Marketing',
  'Plant Head',
  'QC',
  'Sales',
  'Store',
];

export default function StoreReleasesView() {
  const { user } = useAuth();
  const { data: allRequests = [] } = useMaterialRequests();
  const updateStatus = useUpdateMaterialRequestStatus();

  const [activeTab, setActiveTab] = useState('pending');
  const [rowDepartments, setRowDepartments] = useState({});
  
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

  // Pagination states
  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Reset page when activeTab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Combine real backend requests (only store-approved or issued)
  const combinedRequests = useMemo(() => {
    const map = new Map();
    (allRequests || []).forEach(req => {
      if (['STORE_APPROVED', 'ISSUED_TO_PRODUCTION', 'RECEIVED', 'CONSUMING'].includes(req.status)) {
        map.set(req.id, req);
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

  // Filter orders by active tab (pending vs history)
  const visibleOrderIds = useMemo(() => {
    return orderIds.filter((orderId) => {
      const requests = combinedRequests.filter((req) => getOrderKey(req) === orderId);
      
      let anyIssued = false;
      let allFullyIssued = true;

      requests.forEach((req) => {
        req.items.forEach((item, idx) => {
          const details = getItemQtyDetails(req, item, idx);
          if (details.cumulativeIssued > 0) {
            anyIssued = true;
          }
          if (!details.isFullyIssued) {
            allFullyIssued = false;
          }
        });
      });

      if (activeTab === 'history') return anyIssued;
      return !allFullyIssued;
    });
  }, [orderIds, combinedRequests, activeTab, issuedQuantities]);

  const totalPages = Math.ceil(visibleOrderIds.length / pageSize);
  const paginatedVisibleOrderIds = useMemo(() => {
    return visibleOrderIds.slice((page - 1) * pageSize, page * pageSize);
  }, [visibleOrderIds, page, pageSize]);

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

  const issueRowItem = async (request, item, index, targetDept, qtyToSend) => {
    if (qtyToSend <= 0) {
      await Swal.fire('No Quantity Specified', 'Please enter a valid Issue Qty greater than 0.', 'warning');
      return;
    }

    const details = getItemQtyDetails(request, item, index);
    const newCumulative = details.cumulativeIssued + qtyToSend;
    
    // Check if the entire request will be fully issued after this item is updated
    const isRequestFullyIssued = request.items.every((it, idx) => {
      if (it.id === item.id) {
        return (it.approvedQty || it.quantity) - newCumulative <= 0;
      }
      const itDetails = getItemQtyDetails(request, it, idx);
      return itDetails.isFullyIssued;
    });

    const actionLabel = `Issue Material`;

    const result = await Swal.fire({
      title: actionLabel + '?',
      html: `Issue <strong>${qtyToSend} ${item.unit || 'Units'}</strong> of <strong>${item.materialName || item.material}</strong> to <strong>${targetDept}</strong> department?<br/>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Issue Material',
      confirmButtonColor: '#2563eb',
      customClass: { popup: 'swal-premium-popup' }
    });

    if (!result.isConfirmed) return;

    try {
      const reference = `ISS-${request.publicId || request.id}-${Date.now()}`;
      
      // Update local state for cumulative issued amounts
      const newIssuedState = { ...issuedQuantities };
      const newInputState = { ...inputQuantities };
      newIssuedState[details.itemKey] = newCumulative;
      newInputState[details.itemKey] = details.approvedQty - newCumulative;

      setIssuedQuantities(newIssuedState);
      setInputQuantities(newInputState);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('store_issued_quantities', JSON.stringify(newIssuedState));
        } catch (e) {
          console.error('Failed to save store_issued_quantities:', e);
        }
      }

      // Trigger backend patch for the single item
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

      await Swal.fire(
        'Material Issued',
        `Successfully issued ${qtyToSend} ${item.unit || 'Units'} to ${targetDept}.`,
        'success'
      );
    } catch (error) {
      console.error('Failed to issue item:', error);
      await Swal.fire('Error', 'Failed to issue material request.', 'error');
    }
  };

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
      html: `Are you sure you want to issue <strong>${itemsToIssue.length} item(s)</strong> (Total: <strong>${totalQty} units</strong>) to Production?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Issue All',
      confirmButtonColor: '#0f766e',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      for (const req of visibleRequests) {
        const reqItemsToIssue = itemsToIssue.filter(it => it.request.id === req.id);
        if (reqItemsToIssue.length === 0) continue;

        const reference = `ISS-${req.publicId || req.id}-${Date.now()}`;
        const newIssuedState = { ...issuedQuantities };
        const newInputState = { ...inputQuantities };

        const patchedItems = req.items.map(item => {
          const match = reqItemsToIssue.find(it => it.item.id === item.id);
          const currentCum = Number(issuedQuantities[`${req.id}-${item.materialId || item.id}`] ?? item.issuedQty ?? 0);
          const addQty = match ? match.qty : 0;
          const newCum = currentCum + addQty;
          newIssuedState[`${req.id}-${item.materialId || item.id}`] = newCum;
          newInputState[`${req.id}-${item.materialId || item.id}`] = Math.max(0, Number(item.approvedQty || item.quantity || 0) - newCum);
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

        await updateStatus.mutateAsync({
          id: req.id,
          status: 'ISSUED_TO_PRODUCTION',
          items: patchedItems,
          metadata: {
            issueReference: reference,
            issuedBy: user?.name || 'Store',
            issuedToDepartment: 'Production',
            issuedAt: new Date().toISOString()
          }
        });
      }

      await Swal.fire('All Materials Issued!', 'Materials have been successfully released to Production floor.', 'success');
    } catch (err) {
      console.error('Failed to issue all materials:', err);
      await Swal.fire('Error', 'Failed to issue materials. Please try again.', 'error');
    }
  };

  return (
    <div className="store-releases">
      {/* Top Heading + Tabs */}
      <div className="store-releases__heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1>Store Releases</h1>
            <p>{activeTab === 'pending' ? 'Store-approved requests. Enter issue quantity to release full or partial materials.' : 'History of materials completely issued to departments.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: 'none',
                background: activeTab === 'pending' ? '#fff' : 'transparent',
                color: activeTab === 'pending' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'pending' ? '600' : '500',
                boxShadow: activeTab === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Pending Releases
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: 'none',
                background: activeTab === 'history' ? '#fff' : 'transparent',
                color: activeTab === 'history' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'history' ? '600' : '500',
                boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Release History
            </button>
          </div>
        </div>
      </div>

      {/* Orders Cards List */}
      {paginatedVisibleOrderIds.map((orderId) => {
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
          <section key={orderId} className="store-release-card">
            {/* Meta Header */}
            <div className="store-release-card__meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <span><strong>{visibleRequests[0]?.workOrderNo ? 'Order ID:' : 'Requisition:'}</strong> {orderId || '—'}</span>
                <span className="store-release-card__request"><strong>Request ID:</strong> {visibleRequests.map((request) => request.requestNo || request.publicId || request.id).join(', ')}</span>
                <span><strong>Materials:</strong> {visibleRequests.reduce((sum, request) => sum + request.items.length, 0)}</span>
                <span>
                  <strong>Status:</strong>{' '}
                  <span
                    style={{
                      background: cardTotalRemaining === 0 ? '#f0fdf4' : cardAnyIssued ? '#eff6ff' : '#fef3c7',
                      color: cardTotalRemaining === 0 ? '#15803d' : cardAnyIssued ? '#1d4ed8' : '#d97706',
                      border: `1px solid ${cardTotalRemaining === 0 ? '#bbf7d0' : cardAnyIssued ? '#bfdbfe' : '#fde68a'}`,
                      padding: '2px 10px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '12px'
                    }}
                  >
                    {releaseStatus}
                  </span>
                </span>
              </div>
              {activeTab === 'pending' && cardTotalRemaining > 0 && (
                <button
                  type="button"
                  onClick={() => issueAllMaterialsForGroup(orderId, visibleRequests)}
                  style={{
                    padding: '8px 16px',
                    background: '#0f766e',
                    color: '#ffffff',
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
              <table className="store-release-card__table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Approved Qty</th>
                    <th>Issued Qty</th>
                    <th>Issue Qty (To Send)</th>
                    <th>Remaining Qty</th>
                    <th>Department</th>
                    <th>Status</th>
                    {activeTab === 'pending' && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleRequests.flatMap((request) => request.items.map((item, index) => {
                    const details = getItemQtyDetails(request, item, index);
                    const itemKey = details.itemKey;
                    const currentDept = rowDepartments[itemKey] || request.metadata?.itemDepartments?.[item.id] || request.metadata?.issuedToDepartment || request.department || 'Production';

                    return (
                      <tr key={itemKey}>
                        <td data-label="Material"><strong>{item.materialName}</strong></td>
                        <td data-label="Approved Qty">{details.approvedQty} {item.unit}</td>
                        <td data-label="Issued Qty" style={{ fontWeight: '600', color: details.cumulativeIssued > 0 ? '#1d4ed8' : '#64748b' }}>
                          {details.cumulativeIssued} {item.unit}
                        </td>
                        <td data-label="Issue Qty (To Send)">
                          {activeTab === 'pending' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <input
                                type="number"
                                min="0"
                                className="store-release-qty-input"
                                value={details.rawInput}
                                onChange={(e) => handleInputChange(itemKey, Infinity, e.target.value)}
                              />
                              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>{item.unit}</span>
                              {details.totalRemaining > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleInputChange(itemKey, details.totalRemaining, String(details.totalRemaining))}
                                  style={{
                                    padding: '3px 8px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#2563eb',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                  title="Fill maximum remaining quantity"
                                >
                                  Max ({details.totalRemaining})
                                </button>
                              )}
                            </div>
                          ) : (
                            <span>{details.cumulativeIssued} {item.unit}</span>
                          )}
                        </td>
                        <td data-label="Remaining Qty" style={{ fontWeight: '700', color: details.totalRemaining > 0 ? '#d97706' : '#16a34a' }}>
                          {details.totalRemaining} {item.unit}
                        </td>
                        <td data-label="Department">
                          {activeTab === 'pending' ? (
                            <>
                              <input
                                type="text"
                                className="store-release-dept-input"
                                list={`depts-${itemKey}`}
                                value={currentDept}
                                onChange={(e) => setRowDepartments((prev) => ({ ...prev, [itemKey]: e.target.value }))}
                              />
                              <datalist id={`depts-${itemKey}`}>
                                {ISSUE_TARGET_DEPARTMENTS.map((dept) => (
                                  <option key={dept} value={dept} />
                                ))}
                              </datalist>
                            </>
                          ) : (
                            <span>{currentDept}</span>
                          )}
                        </td>
                        <td data-label="Status">
                          {activeTab === 'history' || details.isFullyIssued ? (
                            <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              Ready / Issued
                            </span>
                          ) : details.cumulativeIssued > 0 ? (
                            <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              Partially Issued ({details.newRemaining} {item.unit} Left)
                            </span>
                          ) : (
                            <span style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              Ready for Issue
                            </span>
                          )}
                        </td>
                        {activeTab === 'pending' && (
                          <td data-label="Action">
                            <button
                              type="button"
                              disabled={details.currentInput <= 0}
                              onClick={() => issueRowItem(request, item, index, currentDept, details.currentInput)}
                              className="store-release-btn"
                              style={{
                                background: details.currentInput > 0 ? '#0f766e' : '#cbd5e1',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '12px',
                                cursor: details.currentInput > 0 ? 'pointer' : 'not-allowed',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              📦 Issue to Production
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="store-release-card__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {activeTab === 'pending' ? (
                <>
                  <div className="store-release-card__proceed">
                    <strong>Ready for Release:</strong>
                    <p>Enter issue quantities above and click &quot;Issue to Production&quot; or issue all line items together.</p>
                  </div>
                  {cardTotalRemaining > 0 && (
                    <button
                      type="button"
                      onClick={() => issueAllMaterialsForGroup(orderId, visibleRequests)}
                      style={{
                        padding: '10px 20px',
                        background: '#0f766e',
                        color: '#ffffff',
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
                      ⚡ Confirm & Issue All ({cardTotalSending} Units) to Production
                    </button>
                  )}
                </>
              ) : (
                <div className="store-release-card__proceed" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}>
                  <strong>Material Issue Completed</strong>
                  <p>All materials for this order have been issued to their respective departments.</p>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {visibleOrderIds.length === 0 && (
        <div className="store-releases__empty">
          {activeTab === 'pending' ? 'No pending store releases.' : 'No release history found.'}
        </div>
      )}

      <PaginationControl
        currentPage={page}
        totalPages={totalPages}
        totalItems={visibleOrderIds.length}
        pageSize={pageSize}
        onPageChange={setPage}
        themeColor="#2F4375"
      />
    </div>
  );
}

function PaginationControl({ currentPage, totalPages, totalItems, pageSize, onPageChange, themeColor = '#2F4375' }) {
  if (totalPages <= 1) return null;

  return (
    <div className="store-pagination-control store-pagination-wrap" style={{ padding: '16px 20px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
        Showing <span style={{ fontWeight: 700, color: '#0F172A' }}>{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span style={{ fontWeight: 700, color: '#0F172A' }}>{Math.min(currentPage * pageSize, totalItems)}</span> of <span style={{ fontWeight: 700, color: '#0F172A' }}>{totalItems}</span> entries (Page {currentPage} of {totalPages})
      </div>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button 
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: currentPage === 1 ? '#F1F5F9' : '#FFFFFF', border: '1px solid #CBD5E1', color: currentPage === 1 ? '#94A3B8' : '#334155', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
        >
          <ChevronLeft size={16} /> Previous
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
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: currentPage === pNum ? 'none' : '1px solid #CBD5E1',
                background: currentPage === pNum ? themeColor : '#FFFFFF',
                color: currentPage === pNum ? '#FFFFFF' : '#334155'
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
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: currentPage === totalPages ? '#F1F5F9' : '#FFFFFF', border: '1px solid #CBD5E1', color: currentPage === totalPages ? '#94A3B8' : '#334155', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
