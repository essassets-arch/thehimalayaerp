'use client';
import React, { useMemo, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Image as ImageIcon, Printer, RefreshCw, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { backendFetch } from '../../../lib/backendFetch';
import { getBackendAssetUrl } from '../../../lib/assetUrl';
import PaginationControl from '../../../shared/components/PaginationControl';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const date = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '—';
const safe = (value) => String(value ?? '—')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export default function ReceiptsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: payments = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['finance-payment-receipts'],
    queryFn: async () => {
      const response = await backendFetch('/api/backend/finance/payments');
      const records = Array.isArray(response) ? response : response?.data;
      return Array.isArray(records) ? records : [];
    },
  });

  const receipts = useMemo(() => payments
    .filter((payment) => ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(String(payment.status || '').toUpperCase()))
    .map((payment) => ({
      id: payment.id,
      receiptNumber: payment.paymentNo || `RCPT-${String(payment.id).slice(0, 8)}`,
      orderId: payment.salesOrder?.orderNumber || payment.salesOrderId || '—',
      invoiceNumber: payment.salesOrder?.orderNumber ? `INV-${payment.salesOrder.orderNumber}` : '—',
      customerName: payment.customer?.companyName || payment.customer?.name || 'Unknown customer',
      paymentAmount: Number(payment.amount || 0),
      totalInvoiceAmount: Number(payment.salesOrder?.totalAmount || payment.amount || 0),
      paymentMode: payment.method || 'Bank Transfer',
      transactionReference: payment.referenceNo || payment.paymentNo || '—',
      paymentDate: payment.verifiedAt || payment.receivedAt || payment.createdAt,
      proofUrl: payment.proofUrl,
    })), [payments]);

  const filteredReceipts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return receipts;
    return receipts.filter((receipt) => [
      receipt.receiptNumber,
      receipt.customerName,
      receipt.orderId,
      receipt.invoiceNumber,
      receipt.transactionReference,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [receipts, searchQuery]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredReceipts.length / pageSize));
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReceipts.slice(start, start + pageSize);
  }, [filteredReceipts, currentPage, pageSize]);

  const handleReceipt = async (receipt) => {
    const result = await Swal.fire({
      title: `Receipt ${safe(receipt.receiptNumber)}`,
      width: 620,
      showCancelButton: true,
      confirmButtonText: 'Print Receipt',
      cancelButtonText: 'Close',
      confirmButtonColor: '#2563eb',
      html: `
        <div id="finance-printable-receipt" style="text-align:left;border:1px solid #dbe5f0;border-radius:12px;padding:22px;font-family:Arial,sans-serif">
          <div style="display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:14px;margin-bottom:18px">
            <div><strong style="font-size:18px;color:#1e3a8a">Himalaya Composites & Precast Pvt. Ltd.</strong><div style="font-size:12px;color:#64748b;margin-top:4px">Official customer payment receipt</div></div>
            <div style="text-align:right"><strong style="color:#2563eb">${safe(receipt.receiptNumber)}</strong><div style="font-size:12px;color:#64748b">${safe(date(receipt.paymentDate))}</div></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
            <div><span style="color:#64748b">Received from</span><br><strong>${safe(receipt.customerName)}</strong></div>
            <div><span style="color:#64748b">Order / Invoice</span><br><strong>${safe(receipt.orderId)} / ${safe(receipt.invoiceNumber)}</strong></div>
            <div><span style="color:#64748b">Payment method</span><br><strong>${safe(receipt.paymentMode)}</strong></div>
            <div><span style="color:#64748b">Transaction reference</span><br><strong>${safe(receipt.transactionReference)}</strong></div>
          </div>
          <div style="margin-top:20px;padding:16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:9px;display:flex;justify-content:space-between"><strong>Verified amount received</strong><strong style="font-size:20px;color:#047857">${safe(money(receipt.paymentAmount))}</strong></div>
          <div style="margin-top:22px;font-size:11px;color:#64748b">System generated receipt • Finance verified</div>
        </div>
      `,
    });
    if (result.isConfirmed) window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        .receipts-desktop-table {
          display: block;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
        }
        .receipts-mobile-cards {
          display: none;
        }
        @media (max-width: 768px) {
          .receipts-desktop-table {
            display: none !important;
          }
          .receipts-mobile-cards {
            display: flex !important;
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>

      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', margin: 0 }}>Customer Payment Receipts</h1>
        <p style={{ color: '#64748B', fontSize: 13.5, margin: '4px 0 0' }}>Verified customer payments from the Finance workflow.</p>
      </div>

      <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 420 }}>
            <Search style={{ position: 'absolute', left: 12, top: 11, width: 15, height: 15, color: '#94A3B8' }} />
            <input
              type="search"
              placeholder="Search receipt, order, invoice or customer..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
            />
          </div>
          <button onClick={() => refetch()} disabled={isFetching} className="btn-small btn-outline-small" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {error && <div style={{ padding: 14, marginBottom: 14, borderRadius: 8, background: '#FEF2F2', color: '#B91C1C' }}>{error.message || 'Unable to load receipts.'}</div>}

        {/* Desktop Table View */}
        <div className="receipts-desktop-table">
          <table className="no-mobile-stack" style={{ width: '100%', minWidth: 880, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC', fontSize: 12, color: '#475569' }}>
              <tr>
                {['Receipt Number', 'Order / Invoice', 'Customer', 'Verified Amount', 'Payment Mode', 'Verified Date', 'Actions'].map((heading) => (
                  <th key={heading} style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0' }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ fontSize: 13 }}>
              {isLoading ? (
                <tr><td colSpan={7} style={{ padding: 28, textAlign: 'center', color: '#64748B' }}>Loading verified receipts...</td></tr>
              ) : filteredReceipts.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 28, textAlign: 'center', color: '#94A3B8' }}>No verified payment receipts found.</td></tr>
              ) : paginatedReceipts.map((receipt) => (
                <tr key={receipt.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td data-label="Receipt Number" style={{ padding: '12px 14px', fontWeight: 800, color: '#1E3A8A' }}>{receipt.receiptNumber}</td>
                  <td data-label="Order / Invoice" style={{ padding: '12px 14px' }}><strong>{receipt.orderId}</strong><div style={{ color: '#64748B', marginTop: 2 }}>{receipt.invoiceNumber}</div></td>
                  <td data-label="Customer" style={{ padding: '12px 14px', fontWeight: 600 }}>{receipt.customerName}</td>
                  <td data-label="Verified Amount" style={{ padding: '12px 14px', fontWeight: 800, color: '#047857' }}>{money(receipt.paymentAmount)}</td>
                  <td data-label="Payment Mode" style={{ padding: '12px 14px' }}>{receipt.paymentMode}</td>
                  <td data-label="Verified Date" style={{ padding: '12px 14px' }}>{date(receipt.paymentDate)}</td>
                  <td data-label="Actions" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      <button onClick={() => handleReceipt(receipt)} className="btn-small btn-primary-small" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Printer size={13} /> View / Print</button>
                      {receipt.proofUrl && <button onClick={() => window.open(getBackendAssetUrl(receipt.proofUrl), '_blank', 'noopener,noreferrer')} className="btn-small btn-outline-small" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><ImageIcon size={13} /> Proof</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dedicated Mobile Cards List */}
        <div className="receipts-mobile-cards">
          {isLoading ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#64748B' }}>Loading verified receipts...</div>
          ) : filteredReceipts.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#94A3B8' }}>No verified payment receipts found.</div>
          ) : (
            paginatedReceipts.map((receipt) => (
              <div
                key={receipt.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderLeft: '4px solid #10B981',
                  borderRadius: 14,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              >
                {/* Header: Receipt Number & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1E3A8A', fontFamily: 'monospace' }}>
                      {receipt.receiptNumber}
                    </span>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                      Verified: {date(receipt.paymentDate)}
                    </div>
                  </div>
                  <span style={{
                    background: '#DCFCE7',
                    color: '#15803D',
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap'
                  }}>
                    ✓ Verified
                  </span>
                </div>

                {/* Customer & Order Details */}
                <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{receipt.customerName}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11.5, color: '#475569', marginTop: 4 }}>
                    <span>Order: <strong style={{ color: '#002E5D', fontFamily: 'monospace' }}>{receipt.orderId}</strong></span>
                    {receipt.invoiceNumber !== '—' && (
                      <>
                        <span>•</span>
                        <span>Inv: <strong style={{ color: '#475569' }}>{receipt.invoiceNumber}</strong></span>
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, borderTop: '1px dashed #E2E8F0', paddingTop: 6, fontSize: 11.5 }}>
                    <span style={{ color: '#64748B' }}>Method: <strong style={{ color: '#334155' }}>{receipt.paymentMode}</strong></span>
                    <span style={{ color: '#64748B', fontFamily: 'monospace', fontSize: 11 }}>Ref: {receipt.transactionReference}</span>
                  </div>
                </div>

                {/* Amount Received Box */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ECFDF5', padding: '10px 14px', borderRadius: 10, border: '1px solid #A7F3D0' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#065F46' }}>Verified Amount</span>
                  <span style={{ fontSize: 17, fontWeight: 900, color: '#047857' }}>{money(receipt.paymentAmount)}</span>
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                  <button
                    onClick={() => handleReceipt(receipt)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Printer size={14} /> View / Print Receipt
                  </button>
                  {receipt.proofUrl && (
                    <button
                      onClick={() => window.open(getBackendAssetUrl(receipt.proofUrl), '_blank', 'noopener,noreferrer')}
                      style={{
                        padding: '10px 14px',
                        background: '#FFFFFF',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5
                      }}
                    >
                      <ImageIcon size={14} /> Proof
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {filteredReceipts.length > 0 && (
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredReceipts.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}



