'use client';

import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Search, Eye, Calendar, User, ArrowLeftRight, Clock, ShieldCheck, History } from 'lucide-react';
import { useERPStore } from '../../../store/erpStore';

export default function PaymentHistoryView() {
  const state = useERPStore((s) => s.state);
  const customerPayments = state.finance?.customerPayments || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return customerPayments.filter((p) => {
      if (filterStatus !== 'All' && p.verificationStatus !== filterStatus) return false;
      if (filterMode !== 'All' && p.paymentMode !== filterMode) return false;
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesOrder = p.orderId?.toLowerCase().includes(q);
        const matchesCustomer = p.customerName?.toLowerCase().includes(q);
        const matchesRef = p.transactionReference?.toLowerCase().includes(q) || p.chequeNumber?.toLowerCase().includes(q);
        if (!matchesOrder && !matchesCustomer && !matchesRef) return false;
      }
      return true;
    });
  }, [customerPayments, filterStatus, filterMode, searchQuery]);

  // Comprehensive chronological audit logs from all payments
  const chronAuditLogs = useMemo(() => {
    const logs = [];
    customerPayments.forEach((p) => {
      (p.history || []).forEach((h) => {
        logs.push({
          ...h,
          paymentId: p.id,
          customerName: p.customerName,
          orderId: p.orderId,
          amount: p.paymentAmount
        });
      });
    });
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [customerPayments]);

  const handleViewPayment = (p) => {
    const historyRows = (p.history || []).map((h) => `
      <tr style="border-bottom: 1px solid #E2E8F0; font-size: 12.5px;">
        <td style="padding: 8px; color: #475569;">${h.createdAt?.replace('T', ' ').substring(0, 19)}</td>
        <td style="padding: 8px; font-weight: 700; color: #0284c7;">${h.action}</td>
        <td style="padding: 8px; font-weight: 600;">${h.actorName} (${h.actorRole})</td>
        <td style="padding: 8px; color: #64748B;">${h.remarks || '-'}</td>
      </tr>
    `).join('');

    Swal.fire({
      title: `<span style="font-weight: 800; color: #1E293B;">Archive Audit Entry: ${p.id}</span>`,
      width: '640px',
      html: `
        <div style="text-align: left; font-family: sans-serif; font-size: 13.5px; display: flex; flex-direction: column; gap: 14px;">
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div><span>Payment Reference:</span> <strong>${p.id}</strong></div>
            <div><span>Order ID:</span> <strong>${p.orderId}</strong></div>
            <div><span>Customer:</span> <strong>${p.customerName}</strong></div>
            <div><span>Payment Mode:</span> <strong>${p.paymentMode}</strong></div>
            <div><span>Amount Recd:</span> <strong style="color:#0284c7;">₹${p.paymentAmount.toLocaleString('en-IN')}</strong></div>
            <div><span>Recorded Date:</span> <strong>${p.paymentDate}</strong></div>
            <div><span>Recorded By:</span> <strong>${p.recordedBy}</strong></div>
            <div><span>Source Portal:</span> <strong>${p.source}</strong></div>
          </div>
          <div>
            <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #64748B;">Detailed Life-cycle Trail</h4>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="border-bottom: 2px solid #CBD5E1; color: #475569; font-size: 11px;">
                    <th style="padding: 6px;">Timestamp</th>
                    <th style="padding: 6px;">Event Action</th>
                    <th style="padding: 6px;">Actor (Role)</th>
                    <th style="padding: 6px;">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${historyRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Close Archive Entry',
      confirmButtonColor: '#0ea5e9'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Payment History Archive</h1>
        <p style={{ color: '#64748B', fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
          View final payments, historical audit trails, and the complete modification ledger.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Payment Archive List */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              >
                <option value="All">All Statuses</option>
                <option value="FINANCE_VERIFIED">Finance Verified</option>
                <option value="FINANCE_VERIFICATION_PENDING">Pending Verification</option>
                <option value="FINANCE_EXECUTIVE_RECORDED">Recorded</option>
                <option value="FINANCE_REJECTED">Rejected</option>
              </select>

              <select 
                value={filterMode} 
                onChange={(e) => setFilterMode(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              >
                <option value="All">All Modes</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="NEFT">NEFT</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div style={{ position: 'relative', width: '220px' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '10px', width: '14px', height: '14px', color: '#94A3B8' }} />
              <input 
                type="text" 
                placeholder="Search Archive..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F8FAFC', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px' }}>Payment ID</th>
                  <th style={{ padding: '12px 16px' }}>Order Ref</th>
                  <th style={{ padding: '12px 16px' }}>Customer Name</th>
                  <th style={{ padding: '12px 16px' }}>Amount</th>
                  <th style={{ padding: '12px 16px' }}>Mode</th>
                  <th style={{ padding: '12px 16px' }}>Revisions</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '13.5px' }}>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                      No archived payments match selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1E293B' }}>{p.id}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{p.orderId}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600' }}>{p.customerName}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0ea5e9' }}>₹{p.paymentAmount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px' }}>{p.paymentMode}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                          v{p.revision || 1}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background: p.verificationStatus === 'FINANCE_VERIFIED' ? '#D1FAE5' : (p.verificationStatus === 'FINANCE_REJECTED' ? '#FFE4E6' : '#FEF3C7'),
                          color: p.verificationStatus === 'FINANCE_VERIFIED' ? '#065F46' : (p.verificationStatus === 'FINANCE_REJECTED' ? '#9E2121' : '#92400E')
                        }}>
                          {p.verificationStatus?.replace('FINANCE_', '')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleViewPayment(p)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#0ea5e9' }}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Chronological Audit Trail */}
        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <History size={16} /> Live Audit Ledger
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '550px', paddingRight: '4px' }}>
            {chronAuditLogs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                No events recorded.
              </div>
            ) : (
              chronAuditLogs.map((l, idx) => (
                <div key={idx} style={{ background: 'white', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94A3B8' }}>
                    <span>{l.createdAt?.replace('T', ' ').substring(0, 16)}</span>
                    <span style={{ fontWeight: 'bold', color: '#0ea5e9' }}>{l.paymentId}</span>
                  </div>
                  <strong style={{ fontSize: '12.5px', color: '#1E293B' }}>{l.action}</strong>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    By {l.actorName} ({l.actorRole})
                  </div>
                  {l.remarks && (
                    <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#64748B', borderLeft: '2px solid #E2E8F0', paddingLeft: '6px', marginTop: '2px' }}>
                      "${l.remarks}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
