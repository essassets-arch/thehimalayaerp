'use client';

import React, { useRef, useState } from 'react';
import {
  FileText,
  X,
  Printer,
  Download,
  Calendar,
  Building2,
  ShieldCheck,
  CreditCard,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { exportQuotationHighQualityPDF } from '../../../services/export.service';

const formatINR = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value));
};

export default function FinanceQuotationModal({
  quotation,
  salesOrderNumber,
  customerName: fallbackCustomer,
  onClose,
}) {
  const [downloading, setDownloading] = useState(false);
  const printableRef = useRef(null);

  if (!quotation) {
    return (
      <div
        className="modal-overlay active"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            Quotation Unavailable
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#64748b', lineHeight: '1.5' }}>
            No quotation record is linked to Sales Order{' '}
            <strong style={{ color: '#0f172a' }}>{salesOrderNumber || '—'}</strong>.
            This order may have been created directly or the quotation has been archived.
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const qDate = quotation.createdAt
    ? new Date(quotation.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const vDate = quotation.validUntil
    ? new Date(quotation.validUntil).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Standard 30 Days';

  const customerName =
    quotation.lead?.companyName ||
    quotation.lead?.name ||
    fallbackCustomer ||
    'Customer';

  const handleDownloadPdf = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const filename = `Quotation_${quotation.quotationNumber || 'Document'}.pdf`;
      await exportQuotationHighQualityPDF('finance-quotation-printable', filename);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="modal-overlay active"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid #e2e8f0',
          maxWidth: '860px',
          width: '100%',
          maxHeight: 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#f0f9ff',
                color: '#0284c7',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  Quotation {quotation.quotationNumber}
                </h3>
                <span
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  VIEW ONLY
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Source Document • Linked to Order {salesOrderNumber || '—'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              color: '#475569',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Document Body */}
        <div
          id="finance-quotation-printable"
          ref={printableRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: '#f8fafc',
          }}
        >
          {/* Branded Sheet Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            {/* Top Sheet Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #0f172a',
                paddingBottom: '16px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
                  HIMALAYA FRP &amp; CONSTRUCTION PRODUCTS
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  Advanced Composite Engineering &amp; High-Grade Industrial Solutions
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#0284c7',
                    background: '#f0f9ff',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid #bae6fd',
                    marginBottom: '4px',
                  }}
                >
                  OFFICIAL QUOTATION
                </span>
                <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                  {quotation.quotationNumber}
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  Customer / Lead
                </span>
                <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{customerName}</strong>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  Quotation Date
                </span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{qDate}</span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  Validity Period
                </span>
                <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{vDate}</span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  Quotation Status
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#ecfdf5',
                    color: '#047857',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '800',
                  }}
                >
                  {quotation.status || 'Approved'}
                </span>
              </div>
            </div>

            {/* Quoted Products Table */}
            <div style={{ overflowX: 'auto', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                      Item &amp; Description
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', width: '70px' }}>
                      Qty
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', width: '110px' }}>
                      Unit Price
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', width: '70px' }}>
                      Tax %
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', width: '120px' }}>
                      Line Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                        No items recorded on this quotation.
                      </td>
                    </tr>
                  ) : (
                    items.map((it, idx) => (
                      <tr key={it.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <strong style={{ color: '#0f172a', display: 'block' }}>{it.productName}</strong>
                          {it.productCode && (
                            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                              SKU: {it.productCode}
                            </span>
                          )}
                          {it.description && it.description !== it.productName && (
                            <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                              {it.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                          {it.quantity}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: '#334155' }}>
                          {formatINR(it.unitPrice)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>
                          {it.tax !== null && it.tax !== undefined ? `${it.tax}%` : '18%'}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                          {formatINR(it.lineTotal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <div
                style={{
                  width: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  background: '#f8fafc',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#475569' }}>
                  <span>Subtotal:</span>
                  <strong style={{ color: '#0f172a' }}>{formatINR(quotation.subtotal)}</strong>
                </div>
                {Boolean(quotation.discount && Number(quotation.discount) > 0) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#dc2626' }}>
                    <span>Discount:</span>
                    <strong>-{formatINR(quotation.discount)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#475569' }}>
                  <span>Taxes (GST):</span>
                  <strong style={{ color: '#0f172a' }}>{formatINR(quotation.tax)}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '15px',
                    fontWeight: '900',
                    color: '#0f172a',
                    borderTop: '1.5px solid #cbd5e1',
                    paddingTop: '6px',
                    marginTop: '2px',
                  }}
                >
                  <span>Grand Total:</span>
                  <span>{formatINR(quotation.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Terms & Conditions */}
            {(quotation.paymentTerms || (quotation.terms && quotation.terms.length > 0)) && (
              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '14px',
                  fontSize: '11.5px',
                  color: '#64748b',
                }}
              >
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                  Payment Terms &amp; Commercial Notes:
                </strong>
                {quotation.paymentTerms && (
                  <p style={{ margin: '0 0 6px' }}>• Payment Terms: {quotation.paymentTerms}</p>
                )}
                {quotation.terms?.map((t, i) => (
                  <p key={i} style={{ margin: '0 0 4px' }}>• {t}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            🔒 Read-only view for Finance audit. No status transitions permitted.
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '700',
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
              }}
            >
              <Printer size={14} /> Print
            </button>
            <button
              type="button"
              disabled={downloading}
              onClick={handleDownloadPdf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '700',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                cursor: downloading ? 'not-allowed' : 'pointer',
              }}
            >
              <Download size={14} /> {downloading ? 'Exporting...' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '700',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
