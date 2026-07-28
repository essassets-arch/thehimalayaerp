'use client';

import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Search, Eye, Printer, FileText } from 'lucide-react';
import { useERPStore } from '../../../store/erpStore';

export default function ReceiptsView() {
  const state = useERPStore((s) => s.state);
  const receipts = state.finance?.paymentReceipts || [];

  const [searchQuery, setSearchQuery] = useState('');

  const filteredReceipts = useMemo(() => {
    if (!searchQuery) return receipts;
    const q = searchQuery.toLowerCase();
    return receipts.filter((r) =>
      r.receiptNumber?.toLowerCase().includes(q) ||
      r.customerName?.toLowerCase().includes(q) ||
      r.orderId?.toLowerCase().includes(q)
    );
  }, [receipts, searchQuery]);

  const handlePrintReceipt = (receipt) => {
    const formattedDate = new Date(receipt.createdAt).toLocaleString();
    Swal.fire({
      title: `<span style="font-size: 20px; font-weight: 800; color: #1E293B;">Receipt #${receipt.receiptNumber}</span>`,
      width: '560px',
      html: `
        <div style="text-align: left; font-family: 'Outfit', sans-serif; font-size: 13.5px; border: 1px solid #E2E8F0; padding: 20px; border-radius: 12px; background: white; margin-top: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <strong style="font-size: 16px; color: #1E3A8A;">Himalaya Concrete Products</strong>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Plot 12, MIDC, Nagpur, MH, India</div>
            </div>
            <div style="text-align: right;">
              <strong style="color: #3b82f6; font-size: 15px;">Official Receipt</strong>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Date: ${receipt.paymentDate}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div>
              <span style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase; display: block;">Received From</span>
              <strong style="color: #1E293B; font-size: 14px;">${receipt.customerName}</strong>
              <div style="font-size: 12px; color: #475569; margin-top: 2px; line-height: 1.4;">${receipt.customerAddress || 'Customer Address'}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase; display: block;">Order Context</span>
              <strong style="color: #1E293B; font-size: 13px; font-family: monospace;">Order: ${receipt.orderId}</strong>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">Invoice: ${receipt.invoiceNumber || 'Pending'}</div>
            </div>
          </div>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 8px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #475569;">Payment Method:</span>
              <strong>${receipt.paymentMode}</strong>
            </div>
            ${receipt.transactionReference ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #475569;">Transaction Reference:</span>
                <strong style="font-family: monospace;">${receipt.transactionReference}</strong>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; border-top: 1px dashed #CBD5E1; padding-top: 8px; margin-top: 4px;">
              <span style="color: #475569; font-weight: 600;">Amount Received:</span>
              <strong style="color: #10B981; font-size: 16px;">₹${receipt.paymentAmount.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div style="border-top: 1px solid #E2E8F0; padding-top: 12px; font-size: 12px; color: #475569; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Total Invoice Amount:</span>
              <span>₹${receipt.totalInvoiceAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Previously Verified Paid:</span>
              <span>₹${receipt.previouslyPaidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: #1E293B; border-top: 1px solid #F1F5F9; padding-top: 4px; margin-top: 2px;">
              <span>Outstanding Balance Remaining:</span>
              <span style="color: #EF4444;">₹${receipt.remainingBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; padding-top: 12px; border-top: 1px solid #F1F5F9;">
            <div style="font-size: 11px; color: #64748B;">
              <div>Generated At: ${formattedDate}</div>
              <div>System Signed & Verified</div>
            </div>
            <div style="text-align: right;">
              <div style="border-bottom: 1px solid #94A3B8; width: 140px; margin-bottom: 4px; height: 30px;"></div>
              <span style="font-size: 11px; font-weight: 700; color: #475569;">${receipt.authorizedSignature}</span>
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Print Receipt',
      showCancelButton: true,
      cancelButtonText: 'Close',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748B'
    }).then((res) => {
      if (res.isConfirmed) {
        window.print();
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Customer Payment Receipts</h1>
        <p style={{ color: '#64748B', fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
          View, print, and search verified receipts linked to order payments.
        </p>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Search */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '10px', width: '14px', height: '14px', color: '#94A3B8' }} />
            <input 
              type="text" 
              placeholder="Search by Receipt #, Client..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px' }}>Receipt Number</th>
                <th style={{ padding: '12px 16px' }}>Order ID</th>
                <th style={{ padding: '12px 16px' }}>Customer Name</th>
                <th style={{ padding: '12px 16px' }}>Amount Paid</th>
                <th style={{ padding: '12px 16px' }}>Payment Mode</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13.5px' }}>
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                    No verified receipts found.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1E293B' }}>{r.receiptNumber}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{r.orderId}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{r.customerName}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: '#10B981' }}>₹{r.paymentAmount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px' }}>{r.paymentMode}</td>
                    <td style={{ padding: '12px 16px' }}>{r.paymentDate}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          onClick={() => handlePrintReceipt(r)}
                          style={{
                            padding: '6px 12px',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={12} /> View / Print
                        </button>
                      </div>
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
