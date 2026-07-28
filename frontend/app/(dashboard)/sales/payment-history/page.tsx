'use client';

import React, { useState } from 'react';
import { useERPStore } from '@/store/erpStore';
import { History, CheckCircle2 } from 'lucide-react';
import { StandardActionButtons, PageSearchInput } from '@/components/GlobalUIComponents';
import '@/components/erp-premium-ui.css';

export default function SalesPaymentHistoryPage() {
  const storeState = useERPStore((s: any) => s.state);
  const orders = storeState?.orders || [];
  const [searchQuery, setSearchQuery] = useState('');

  const allLedgers = orders.flatMap((o: any) => {
    const history = Array.isArray(o.paymentHistory) ? o.paymentHistory : [];
    return history.map((tx: any) => ({
      ...tx,
      orderNo: o.orderNo || o.id,
      customerName: o.customerName || o.customer || 'Customer',
      salesperson: o.salesperson || 'Rajesh Kumar',
      totalAmount: Number(o.totalAmount || o.totalValue || o.amount || 0),
    }));
  });

  const filteredLedgers = allLedgers.filter((tx: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(tx.orderNo || '').toLowerCase().includes(q) ||
      String(tx.customerName || '').toLowerCase().includes(q) ||
      String(tx.transactionId || '').toLowerCase().includes(q) ||
      String(tx.paymentMode || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="erp-page-container">
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <History style={{ width: 24, height: 24, color: '#059669' }} />
            Sales → Payment History Ledger
          </h2>
          <p className="erp-header-subtitle">
            Complete audit trail of all recorded partial & full payment transactions across closed orders.
          </p>
        </div>

        <PageSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search Order No, Customer, UTR..."
        />
      </div>

      <div className="erp-table-card">
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Payment Date</th>
                <th>Payment Mode</th>
                <th>Transaction ID / UTR</th>
                <th>Paid Amount</th>
                <th>Verified By</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#8893A7', fontStyle: 'italic' }}>
                    No payment history entries recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLedgers.map((tx: any, idx: number) => (
                  <tr key={tx.id || idx}>
                    <td style={{ fontWeight: 800, color: '#1e1b4b' }}>{tx.orderNo}</td>
                    <td style={{ fontWeight: 700, color: '#24345C' }}>{tx.customerName}</td>
                    <td style={{ color: '#475569' }}>{tx.paymentDate}</td>
                    <td>
                      <span className="erp-badge erp-badge-green">
                        <CheckCircle2 style={{ width: 12, height: 12 }} />
                        {tx.paymentMode}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#334155' }}>{tx.transactionId}</td>
                    <td style={{ fontWeight: 800, color: '#047857' }}>₹{Number(tx.amount).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#475569' }}>{tx.verifiedBy || 'Finance'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <StandardActionButtons
                        onDownload={() => alert(`Downloading receipt for UTR ${tx.transactionId}...`)}
                        onShare={() => alert(`Sharing payment receipt...`)}
                        onPrint={() => window.print()}
                        compact
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
