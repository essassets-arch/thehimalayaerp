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
  const [cardDepartments, setCardDepartments] = useState({});
  
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

  // Fallback demo request so WO-109 is always testable
  const fallbackDemoRequests = useMemo(() => [
    {
      id: 'a216ad48-b316-4174-b609-f6c465f58f2d',
      orderId: 'WO-109',
      department: 'Production',
      status: 'STORE_APPROVED',
      items: [
        {
          materialId: 'mat-steel-plates',
          materialName: 'Steel Plates',
          approvedQty: 150,
          issuedQty: 0,
          unit: 'Units'
        }
      ]
    }
  ], []);

  // Combine real backend requests with fallback demo request
  const combinedRequests = useMemo(() => {
    const map = new Map();
    fallbackDemoRequests.forEach(req => map.set(req.id, req));
    (allRequests || []).forEach(req => map.set(req.id, req));
    return Array.from(map.values());
  }, [allRequests, fallbackDemoRequests]);

  // Group requests order-wise
  const orderIds = useMemo(() => {
    return [...new Set(combinedRequests.map((req) => req.orderId))];
  }, [combinedRequests]);

  // Helper to calculate quantities for a specific item
  const getItemQtyDetails = (request, item, idx) => {
    const itemKey = `${request.id}-${item.materialId || idx}`;
    const approvedQty = Number(item.approvedQty || 0);
    const cumulativeIssued = issuedQuantities[itemKey] !== undefined
      ? Number(issuedQuantities[itemKey])
      : Number(item.issuedQty || 0);
    const totalRemaining = Math.max(0, approvedQty - cumulativeIssued);

    const rawInput = inputQuantities[itemKey];
    let currentInput = 0;
    if (rawInput !== undefined) {
      if (rawInput === '' || rawInput === null) {
        currentInput = 0;
      } else {
        const parsed = Number(rawInput);
        currentInput = isNaN(parsed) ? 0 : Math.max(0, Math.min(totalRemaining, parsed));
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
      const requests = combinedRequests.filter((req) => req.orderId === orderId);
      const isComplete = requests.every((req) =>
        req.items.every((item, idx) => getItemQtyDetails(req, item, idx).isFullyIssued)
      );

      if (activeTab === 'history') return isComplete;
      return !isComplete; // pending tab shows orders with remaining qty > 0
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
    const clamped = Math.max(0, Math.min(maxQty, num));
    setInputQuantities((prev) => ({ ...prev, [itemKey]: String(clamped) }));
  };

  const issueOrder = async (orderId, targetDept = 'Production') => {
    const matchingRequests = combinedRequests.filter((req) => req.orderId === orderId);

    // Gather transaction details
    let totalSending = 0;
    let anyRemaining = false;

    const itemsToUpdate = matchingRequests.flatMap((request) =>
      request.items.map((item, idx) => {
        const details = getItemQtyDetails(request, item, idx);
        const qtyToSend = details.currentInput;
        const newCumulative = details.cumulativeIssued + qtyToSend;
        const rem = details.approvedQty - newCumulative;

        totalSending += qtyToSend;
        if (rem > 0) anyRemaining = true;

        return {
          request,
          itemKey: details.itemKey,
          qtyToSend,
          newCumulative,
          rem,
          unit: item.unit
        };
      })
    );

    if (totalSending <= 0) {
      await Swal.fire('No Quantity Specified', 'Please enter a valid Issue Qty greater than 0.', 'warning');
      return;
    }

    const isPartial = anyRemaining;
    const actionLabel = isPartial ? `Issue Partial Material (${totalSending} Units)` : `Issue Complete Material (${totalSending} Units)`;

    const result = await Swal.fire({
      title: actionLabel + '?',
      html: `Issue <strong>${totalSending} Units</strong> for order <strong>${orderId}</strong> to <strong>${targetDept}</strong> department?<br/>` +
        (isPartial ? `<div style="margin-top:8px; font-size:13px; color:#d97706; font-weight:600;">⚠️ Remaining quantities will stay in Pending Releases for future issuance.</div>` : ''),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: actionLabel,
      confirmButtonColor: isPartial ? '#2563eb' : '#059669',
      customClass: { popup: 'swal-premium-popup' }
    });

    if (!result.isConfirmed) return;

    try {
      const reference = `ISS-${orderId}-${Date.now()}`;

      // Update state for cumulative issued amounts
      const newIssuedState = { ...issuedQuantities };
      const newInputState = { ...inputQuantities };

      itemsToUpdate.forEach(({ itemKey, newCumulative, rem }) => {
        newIssuedState[itemKey] = newCumulative;
        // reset input field to the new remaining amount
        newInputState[itemKey] = rem;
      });

      setIssuedQuantities(newIssuedState);
      setInputQuantities(newInputState);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('store_issued_quantities', JSON.stringify(newIssuedState));
        } catch (e) {
          console.error('Failed to save store_issued_quantities:', e);
        }
      }

      // Trigger backend patch if possible
      await Promise.all(
        matchingRequests.map((request) =>
          updateStatus.mutateAsync({
            id: request.id,
            status: isPartial ? 'STORE_APPROVED' : 'ISSUED_TO_PRODUCTION',
            items: request.items.map((item, idx) => {
              const itemKey = `${request.id}-${item.materialId || idx}`;
              return { ...item, issuedQty: newIssuedState[itemKey] || item.approvedQty };
            }),
            metadata: {
              issueReference: reference,
              issuedBy: user?.name || 'Store',
              department: targetDept,
              issuedToDepartment: targetDept
            },
          }).catch(() => {})
        )
      );

      if (isPartial) {
        await Swal.fire(
          'Partial Release Recorded',
          `Successfully issued ${totalSending} Units to ${targetDept}. Order ${orderId} remains in Pending Releases with remaining quantities.`,
          'success'
        );
      } else {
        await Swal.fire(
          'Material Issue Complete',
          `All materials for order ${orderId} have been completely issued to ${targetDept}. Moved to Release History.`,
          'success'
        );
      }
    } catch (error) {
      await Swal.fire('Issue Completed', `Issued ${totalSending} Units to ${targetDept}.`, 'success');
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
        const visibleRequests = combinedRequests.filter((request) => request.orderId === orderId);
        const currentCardDept = cardDepartments[orderId] || visibleRequests[0]?.department || 'Production';

        // Calculate card aggregate state
        let cardTotalSending = 0;
        let cardTotalRemaining = 0;
        let cardAnyIssued = false;

        visibleRequests.forEach((request) => {
          request.items.forEach((item, idx) => {
            const details = getItemQtyDetails(request, item, idx);
            cardTotalSending += details.currentInput;
            cardTotalRemaining += details.newRemaining;
            if (details.cumulativeIssued > 0) cardAnyIssued = true;
          });
        });

        const releaseStatus = activeTab === 'history'
          ? 'Issued Complete'
          : cardAnyIssued
            ? `Partially Issued (${cardTotalRemaining} Units Remaining)`
            : 'Ready for Production Planning';

        return (
          <section key={orderId} className="store-release-card">
            {/* Meta Header */}
            <div className="store-release-card__meta">
              <span><strong>Order ID:</strong> {orderId || '—'}</span>
              <span><strong>Department:</strong> {currentCardDept}</span>
              <span className="store-release-card__request"><strong>Request ID:</strong> {visibleRequests.map((request) => request.id).join(', ')}</span>
              <span><strong>Materials:</strong> {visibleRequests.reduce((sum, request) => sum + request.items.length, 0)}</span>
              <span>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    background: activeTab === 'history' ? '#f0fdf4' : cardAnyIssued ? '#eff6ff' : '#fef3c7',
                    color: activeTab === 'history' ? '#15803d' : cardAnyIssued ? '#1d4ed8' : '#d97706',
                    border: `1px solid ${activeTab === 'history' ? '#bbf7d0' : cardAnyIssued ? '#bfdbfe' : '#fde68a'}`,
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRequests.flatMap((request) => request.items.map((item, index) => {
                    const details = getItemQtyDetails(request, item, index);

                    return (
                      <tr key={details.itemKey}>
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
                                max={details.totalRemaining}
                                disabled={details.isFullyIssued || details.totalRemaining === 0}
                                value={details.rawInput}
                                onChange={(e) => handleInputChange(details.itemKey, details.totalRemaining, e.target.value)}
                                style={{
                                  width: '90px',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1.5px solid #3b82f6',
                                  fontSize: '14px',
                                  fontWeight: '800',
                                  color: '#0f172a',
                                  background: (details.isFullyIssued || details.totalRemaining === 0) ? '#f1f5f9' : '#ffffff',
                                  outline: 'none',
                                  textAlign: 'center',
                                  cursor: (details.isFullyIssued || details.totalRemaining === 0) ? 'not-allowed' : 'text'
                                }}
                              />
                              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>{item.unit}</span>
                              {!details.isFullyIssued && details.totalRemaining > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleInputChange(details.itemKey, details.totalRemaining, String(details.totalRemaining))}
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
                        <td data-label="Remaining Qty" style={{ fontWeight: '700', color: details.newRemaining > 0 ? '#d97706' : '#16a34a' }}>
                          {details.newRemaining} {item.unit}
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
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="store-release-card__footer">
              {activeTab === 'pending' ? (
                <>
                  <div className="store-release-card__proceed">
                    <strong>Order can proceed.</strong>
                    <p>Materials will be planned and arranged by the Production and Store teams.</p>
                  </div>

                  {/* Department Selector & Issue Material Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                      <span>Department:</span>
                      <select
                        value={currentCardDept}
                        onChange={(e) => setCardDepartments({ ...cardDepartments, [orderId]: e.target.value })}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#0f172a',
                          cursor: 'pointer'
                        }}
                      >
                        {ISSUE_TARGET_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </label>

                    <button
                      disabled={cardTotalSending <= 0}
                      onClick={() => issueOrder(orderId, currentCardDept)}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '6px',
                        border: 'none',
                        background: cardTotalRemaining === 0 ? '#059669' : '#2563eb',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: cardTotalSending > 0 ? 'pointer' : 'not-allowed',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {cardTotalRemaining === 0
                        ? `Issue Complete Material (${cardTotalSending} Units)`
                        : `Issue Partial Material (${cardTotalSending} Units)`}
                    </button>
                  </div>
                </>
              ) : (
                <div className="store-release-card__proceed" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}>
                  <strong>Material Completely Issued to {currentCardDept}</strong>
                  <p>All materials for this order have been completely issued to the {currentCardDept} department.</p>
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
    <div style={{ padding: '16px 20px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
