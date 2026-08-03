'use client';

import React, { useState, useMemo } from 'react';
import { History, CheckCircle2, Clock, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { backendFetch } from '@/lib/backendFetch';
import '@/components/erp-premium-ui.css';

function StatusBadge({ status }: { status: string }) {
  const s = String(status || '').toUpperCase();
  const isVerified = ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(s);
  const isPending = ['SUBMITTED', 'UNDER_VERIFICATION', 'RECEIVED'].includes(s);
  const isBounced = s === 'BOUNCED';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: isVerified ? '#dcfce7' : isPending ? '#fef9c3' : isBounced ? '#fee2e2' : '#f1f5f9',
      color: isVerified ? '#15803d' : isPending ? '#92400e' : isBounced ? '#dc2626' : '#64748b',
    }}>
      {isVerified ? <CheckCircle2 style={{ width: 12, height: 12 }} /> : <Clock style={{ width: 12, height: 12 }} />}
      {s.replace(/_/g, ' ')}
    </span>
  );
}

const APPROVED_STATUSES = ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'];

export default function SalesPaymentHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: payments = [], isLoading, isError, error, refetch } = useQuery<any[]>({
    queryKey: ['sales-recorded-payments-history'],
    queryFn: async () => {
      // Use the sales-authorized endpoint (requires sales.orders.read, not finance.payment.read)
      const response = await backendFetch<any>('/api/backend/finance/payments/sales-recorded');
      const records = Array.isArray(response) ? response : (response as any)?.data;
      return Array.isArray(records) ? records : [];
    },
    staleTime: 30_000,
    retry: 1,
  });

  // Only show Finance-approved payments in history
  const approvedPayments = useMemo(
    () => payments.filter((p: any) => APPROVED_STATUSES.includes(String(p.status || '').toUpperCase())),
    [payments]
  );

  const filteredPayments = useMemo(() => {
    if (!searchQuery) return approvedPayments;
    const q = searchQuery.toLowerCase();
    return approvedPayments.filter((p: any) => {
      const orderNo = String((p.salesOrder as any)?.orderNumber || p.salesOrderId || '').toLowerCase();
      const customer = String((p.customer as any)?.companyName || '').toLowerCase();
      const payNo = String(p.paymentNo || '').toLowerCase();
      return orderNo.includes(q) || customer.includes(q) || payNo.includes(q);
    });
  }, [approvedPayments, searchQuery]);

  return (
    <div className="erp-page-container">
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <History style={{ width: 24, height: 24, color: '#059669' }} />
            Sales → Payment History Ledger
          </h2>
          <p className="erp-header-subtitle">
            Complete audit trail of all recorded partial &amp; full payment transactions across orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search Order No, Customer, Payment No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13,
                outline: 'none', width: 280, background: '#f8fafc',
              }}
            />
          </div>
          <button
            onClick={() => refetch()}
            title="Refresh"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              background: '#f8fafc', fontSize: 13, cursor: 'pointer', fontWeight: 600, color: '#475569',
            }}
          >
            <RefreshCw style={{ width: 15, height: 15 }} />
            Refresh
          </button>
        </div>
      </div>

      <div className="erp-table-card">
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Payment No</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Payment Date</th>
                <th>Paid Amount</th>
                <th>Status</th>
                <th>Verified At</th>
                <th style={{ textAlign: 'right' }}>Proof</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#8893A7' }}>
                    Loading payment records from database...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={9} style={{ padding: '32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#dc2626' }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>Failed to load payment records</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>{(error as any)?.message || 'Unknown error'}</p>
                      <button onClick={() => refetch()} style={{ marginTop: 8, padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: '#f8fafc', color: '#475569' }}>
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#8893A7' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <History style={{ width: 36, height: 36, color: '#cbd5e1' }} />
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>No payment records found</p>
                      <p style={{ margin: 0, fontSize: 13, fontStyle: 'italic' }}>
                        {searchQuery
                          ? 'No payments match your search.'
                          : 'Payment records will appear here after Sales records payments and Finance verifies them.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p: any, idx: number) => {
                  const orderNo = (p.salesOrder as any)?.orderNumber || p.salesOrderId || '—';
                  const customerName = (p.customer as any)?.companyName || '—';
                  const paymentDate = p.receivedAt || p.createdAt
                    ? new Date(p.receivedAt || p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';
                  const verifiedAt = p.verifiedAt
                    ? new Date(p.verifiedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={p.id || idx}>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 800, color: '#1e1b4b', fontFamily: 'monospace' }}>{p.paymentNo || '—'}</td>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{orderNo}</td>
                      <td style={{ fontWeight: 600, color: '#24345C' }}>{customerName}</td>
                      <td style={{ color: '#475569' }}>{paymentDate}</td>
                      <td style={{ fontWeight: 800, color: '#047857', fontSize: 14 }}>
                        ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>{verifiedAt}</td>
                      <td style={{ textAlign: 'right' }}>
                        {p.proofUrl ? (
                          <button
                            onClick={() => window.open(p.proofUrl, '_blank', 'noopener,noreferrer')}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '4px 10px', borderRadius: 8, border: '1.5px solid #c7d2fe',
                              background: '#eef2ff', color: '#4338ca', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            <ExternalLink style={{ width: 12, height: 12 }} />
                            View Proof
                          </button>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: 12 }}>No proof</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredPayments.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#64748b' }}>
            <span>Showing <strong>{filteredPayments.length}</strong> of <strong>{payments.length}</strong> payment records</span>
            <span style={{ fontStyle: 'italic' }}>Live data from database</span>
          </div>
        )}
      </div>
    </div>
  );
}


