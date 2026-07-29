'use client';

import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../shared/context/AuthContext';
import { useERPStore } from '../../store/erpStore';
import { useMaterialRequests, useUpdateMaterialRequestStatus } from '../../hooks/useMaterialRequests';
import './StoreReleasesView.css';

const findStock = (inventory, item) =>
  inventory.find((entry) =>
    [entry.id, entry.materialId, entry.code].filter(Boolean).includes(item.materialId) ||
    String(entry.material || entry.name || '').toLowerCase() ===
      String(item.materialName || item.material || '').toLowerCase()
  );

const getIssueQty = (item) => Number(item.issuedQty ?? item.issueQty ?? 0);
const DEFAULT_DEPARTMENTS = [
  'Sales',
  'Production',
  'Plant Head',
  'Store',
  'Dispatch',
  'Finance',
  'HR',
  'QC',
  'Engineering',
  'Marketing',
  'Customer Support',
];

export default function StoreReleasesView() {
  const { user } = useAuth();
  const { data: allRequests = [] } = useMaterialRequests();
  const updateStatus = useUpdateMaterialRequestStatus();
  const approved = allRequests.filter((request) => request.status === 'STORE_APPROVED');
  const inventory = useERPStore((store) => store.state.rawInventory || []);
  const erpDepartments = useERPStore(
    (store) => store.state?.masterData?.departments || store.masterData?.departments || [],
  );
  const departments = useMemo(
    () => [...new Set([
      ...DEFAULT_DEPARTMENTS,
      ...erpDepartments
        .filter((department) => department.status !== 'INACTIVE')
        .map((department) => department.code || department.name)
        .filter(Boolean),
      ...approved.map((request) => request.department).filter(Boolean),
    ])].sort(),
    [approved, erpDepartments],
  );
  const [selectedDepartment, setSelectedDepartment] = useState('Production');
  const visibleApproved = selectedDepartment === 'ALL'
    ? approved
    : approved.filter((request) => request.department === selectedDepartment);
  const orderIds = [...new Set(visibleApproved.map((request) => request.orderId))];

  const issueOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Issue Complete Material?',
      text: `Issue every approved material for ${orderId} to Production?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Issue Complete Material',
      confirmButtonColor: '#059669',
    });
    if (!result.isConfirmed) return;
    try {
      const reference = `ISS-${orderId}-${Date.now()}`;
      await Promise.all(approved.filter((request) => request.orderId === orderId).map((request) =>
        updateStatus.mutateAsync({
          id: request.id,
          status: 'ISSUED_TO_PRODUCTION',
          items: request.items.map((item) => ({ ...item, issuedQty: item.approvedQty })),
          metadata: { issueReference: reference, issuedBy: user?.name || 'Store' },
        })
      ));
      await Swal.fire('Issue Complete', `Material has been issued to Production successfully. Issue reference: ${reference}`, 'success');
    } catch (error) {
      await Swal.fire('Material issue could not be completed', error.message, 'error');
    }
  };

  return <div className="store-releases">
    <div className="store-releases__heading">
      <h1>Store Releases</h1>
      <p>Store-approved requests grouped order-wise for complete issue.</p>
    </div>
    <div className="store-releases__filters" aria-label="Store release filters">
      <label>
        <span>Department</span>
        <select
          value={selectedDepartment}
          onChange={(event) => setSelectedDepartment(event.target.value)}
        >
          {!departments.includes('Production') && <option value="Production">Production</option>}
          {departments.map((department) => (
            <option key={department} value={department}>{department}</option>
          ))}
          <option value="ALL">All Departments</option>
        </select>
      </label>
    </div>
    {orderIds.map((orderId) => {
      const orderRequests = allRequests.filter((request) => request.orderId === orderId);
      const visibleRequests = visibleApproved.filter((request) => request.orderId === orderId);
      const allRequestsApproved = orderRequests.length > 0 && orderRequests.every(
        (request) => request.status === 'STORE_APPROVED',
      );
      const quantitiesComplete = allRequestsApproved && orderRequests.every((request) =>
        request.items.every((item) => {
          const approvedQty = Number(item.approvedQty || 0);
          const issueQty = getIssueQty(item);
          return approvedQty > 0 && issueQty === approvedQty;
        }),
      );
      const canIssueCompleteOrder = quantitiesComplete;
      const canProceedToPlanning = allRequestsApproved && quantitiesComplete;
      const releaseStatus = !allRequestsApproved
        ? 'Awaiting Store Approval'
        : !quantitiesComplete
          ? 'Issue Quantity Incomplete'
          : 'Ready for Production Planning';
      return <section key={orderId} className="store-release-card">
        <div className="store-release-card__meta">
          <span><strong>Order ID:</strong> {orderId || '—'}</span>
          <span><strong>Department:</strong> {visibleRequests[0]?.department || '—'}</span>
          <span className="store-release-card__request"><strong>Request ID:</strong> {visibleRequests.map((request) => request.id).join(', ')}</span>
          <span><strong>Materials:</strong> {visibleRequests.reduce((sum, request) => sum + request.items.length, 0)}</span>
          <span><strong>Status:</strong> <span className={canProceedToPlanning ? 'is-ready' : 'is-incomplete'}>{releaseStatus}</span></span>
        </div>
        <div className="store-release-card__table-wrap">
          <table className="store-release-card__table">
            <thead><tr>{['Material', 'Approved Qty', 'Available Stock', 'Issue Qty', 'Status'].map((label) => <th key={label}>{label}</th>)}</tr></thead>
            <tbody>{visibleRequests.flatMap((request) => request.items.map((item) => {
              const available = Number(findStock(inventory, item)?.stock || 0);
              const issueQty = getIssueQty(item);
              const quantityReady = issueQty === Number(item.approvedQty || 0);
              const ready = quantityReady;
              return <tr key={`${request.id}-${item.materialId}`}>
                <td data-label="Material">{item.materialName}</td>
                <td data-label="Approved Qty">{item.approvedQty} {item.unit}</td>
                <td data-label="Available Stock">{available} {item.unit}</td>
                <td data-label="Issue Qty">{issueQty} {item.unit}</td>
                <td data-label="Status" className={ready ? 'is-ready' : 'is-incomplete'}>
                  {ready ? 'Ready' : 'Incomplete'}
                </td>
              </tr>;
            }))}</tbody>
          </table>
        </div>
        <div className="store-release-card__footer">
          {canProceedToPlanning && <div className="store-release-card__proceed">
            <strong>Order can proceed.</strong>
            <p>Materials will be planned and arranged by the Production and Store teams.</p>
          </div>}
          {!canProceedToPlanning && <div className="store-release-card__warning">
            <strong>Production planning is pending.</strong>
            {!allRequestsApproved && <p>Every request in this order must be Store approved.</p>}
            {allRequestsApproved && !quantitiesComplete && <p>The issue quantity must match the approved quantity for every material.</p>}
          </div>}
          <button
            disabled={!canIssueCompleteOrder}
            onClick={() => issueOrder(orderId)}
          >
            Issue Complete Material
          </button>
        </div>
      </section>;
    })}
    {orderIds.length === 0 && <div className="store-releases__empty">
      No Store-approved orders found for {selectedDepartment === 'ALL' ? 'any department' : selectedDepartment}.
    </div>}
  </div>;
}
