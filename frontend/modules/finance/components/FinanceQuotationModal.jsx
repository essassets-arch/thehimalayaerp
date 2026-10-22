'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  X,
  Download,
  Calendar,
  CreditCard,
  AlertCircle,
  MapPin,
  User,
  Truck,
  Percent,
  Star,
  Phone,
  Mail,
  Globe,
  CheckSquare,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import {
  calculateQuotationTotals,
  exportQuotationImage,
  shareQuotationImage,
  exportQuotationHighQualityPDF,
} from '../../../services/export.service';
import {
  himalayaLogoBase64,
  himalayaLogoMarkBase64,
  himalayaStampBase64,
  himalayaSignatureBase64,
  relianceLogoBase64,
  adaniLogoBase64,
  ltLogoBase64,
  ashridharLogoBase64,
} from '../../../services/quotationAssetsBase64';
import { resolveQuotationTerms } from '../../../services/sales/quotationTerms';
import { resolveQuotationNumber, resolveQuotationCustomerName } from '../../../shared/utils/quotationUtils';

const formatINR = (value) => {
  const num = Number(value) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatAddressString = (addr) => {
  if (!addr) return '';
  if (typeof addr === 'string') {
    try {
      const parsed = JSON.parse(addr);
      if (typeof parsed === 'object' && parsed !== null) {
        return formatAddressString(parsed);
      }
    } catch {
      // plain string
    }
    const trimmed = addr.trim();
    return ['—', '-', 'N/A', 'NA', 'NONE', 'NULL', 'UNDEFINED'].includes(trimmed.toUpperCase())
      ? ''
      : trimmed;
  }
  if (typeof addr === 'object' && addr !== null) {
    const parts = [
      addr.line1 || addr.addressLine1 || addr.street || addr.address,
      addr.line2 || addr.addressLine2,
      addr.city,
      addr.state || addr.stateName,
      addr.country,
      addr.pincode || addr.postalCode || addr.pinCode || addr.zipCode,
    ].filter(Boolean);
    return parts.join(', ');
  }
  return '';
};

const cleanField = (val) => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (['—', '-', 'N/A', 'NA', 'NONE', 'NULL', 'UNDEFINED'].includes(trimmed.toUpperCase())) {
    return '';
  }
  return trimmed;
};

const quotationDetailItems = (quotation) => {
  if (!quotation) return [];
  const source =
    Array.isArray(quotation.detailedItems) && quotation.detailedItems.length > 0
      ? quotation.detailedItems
      : Array.isArray(quotation.items) && quotation.items.length > 0
        ? quotation.items
        : Array.isArray(quotation.lead?.detailedItems) && quotation.lead.detailedItems.length > 0
          ? quotation.lead.detailedItems
          : Array.isArray(quotation.lead?.items) && quotation.lead.items.length > 0
            ? quotation.lead.items
            : [];

  return source.map((item, index) => ({
    ...item,
    id: item.id || index + 1,
    productName:
      item.productName || item.product?.name || item.name || item.description || 'Quoted Product',
    productDetails: item.productDetails || item.specification || item.description || '',
    code:
      item.code ||
      item.productCode ||
      item.product?.sku ||
      item.product?.code ||
      item.productId ||
      `PRD-${index + 1}`,
    quantity: Number(item.quantity ?? item.qty ?? 1),
    unitPrice: Number(item.unitPrice ?? item.rate ?? item.price ?? 0),
    discount: Number(item.discount ?? item.discountPercent ?? 0),
    tax: (() => {
      const raw = Number(item.tax ?? item.gstPercent ?? item.taxRate ?? item.gstRate ?? 18);
      const qty = Number(item.quantity ?? item.qty ?? 1);
      const rate = Number(item.unitPrice ?? item.rate ?? item.price ?? 0);
      const disc = Number(item.discount ?? item.discountPercent ?? 0);
      const taxable = qty * rate * (1 - disc / 100);
      if (raw > 28 && taxable > 0) {
        const derived = Math.round((raw / taxable) * 100);
        if (derived <= 28) return derived;
      }
      return raw || 18;
    })(),
  }));
};

const formatCleanProductSpecs = (item) => {
  if (item.productDetails && typeof item.productDetails === 'string') {
    const cleaned = item.productDetails
      .replace(/\|\s*Qty:\s*[^|]+/gi, '')
      .replace(/\|\s*Rate:\s*[^|]+/gi, '')
      .replace(/\|\s*Total:\s*[^|]+/gi, '')
      .replace(/\s*\|\s*$/, '')
      .trim();
    if (cleaned && cleaned !== 'Standard Specification') return cleaned;
  }
  const parts = [];
  if (item.product || item.type) parts.push(`Product: ${item.product || item.type}`);
  if (item.size) parts.push(`Size: ${item.size}`);
  if (item.capacity) parts.push(`Capacity: ${item.capacity}`);
  if (item.color) parts.push(`Color: ${item.color}`);
  return parts.join(' | ');
};

export default function FinanceQuotationModal({
  quotation,
  salesOrderNumber,
  customerName: fallbackCustomer,
  loading = false,
  onClose,
}) {
  const [previewZoomMode, setPreviewZoomMode] = useState('fit'); // 'fit' | 'full'
  const [previewScale, setPreviewScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(1150);
  const quotationSheetRef = useRef(null);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);

  // Responsive scale computation for mobile/tablets
  useEffect(() => {
    if (!quotation) return;
    const calculateScale = () => {
      if (typeof window === 'undefined') return;
      const availableWidth = Math.min(window.innerWidth - 16, 794);
      const scale = availableWidth < 794 ? availableWidth / 794 : 1;
      setPreviewScale(scale);
      if (quotationSheetRef.current) {
        setSheetHeight(quotationSheetRef.current.scrollHeight || 1123);
      }
    };
    calculateScale();
    const timer = setTimeout(calculateScale, 150);
    window.addEventListener('resize', calculateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateScale);
    };
  }, [quotation, previewZoomMode]);

  // Loading state
  if (loading && !quotation) {
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
            maxWidth: '420px',
            width: '100%',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              border: '3px solid #e2e8f0',
              borderTopColor: '#002e5d',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
            Loading Quotation
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Retrieving branded quotation details for Sales Order {salesOrderNumber || '—'}...
          </p>
        </div>
      </div>
    );
  }

  // Not found fallback
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
            This order may have been booked directly or the quotation has been archived.
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#002e5d',
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

  // Client info resolvers matching QuotationsView
  const clientCustomerName =
    quotation.customerName ||
    quotation.customer_name ||
    quotation.customer?.companyName ||
    quotation.customer?.name ||
    quotation.lead?.companyName ||
    quotation.lead?.customerName ||
    quotation.lead?.projectName ||
    quotation.gstName ||
    fallbackCustomer ||
    'Valued Customer';

  const rawAddress =
    quotation.deliveryAddress ||
    (quotation.addressLine1
      ? {
          line1: quotation.addressLine1,
          city: quotation.city,
          state: quotation.state || quotation.stateName,
          country: 'India',
          pincode: quotation.pincode,
        }
      : null) ||
    quotation.address ||
    quotation.clientAddress ||
    quotation.customerAddress ||
    quotation.shippingAddress ||
    quotation.billingAddress ||
    quotation.siteAddress ||
    quotation.customer?.shippingAddress ||
    quotation.customer?.billingAddress ||
    quotation.customer?.address ||
    quotation.lead?.deliveryAddress ||
    quotation.lead?.address ||
    quotation.lead?.siteAddress ||
    quotation.lead?.location ||
    '';
  const clientAddress = formatAddressString(rawAddress);

  const rawGst =
    quotation.gstNumber ||
    quotation.gstin ||
    quotation.gst ||
    quotation.customer?.gstNumber ||
    quotation.customer?.gstin ||
    quotation.customer?.gst ||
    quotation.lead?.gstNumber ||
    quotation.lead?.gstin ||
    quotation.lead?.gst ||
    '';
  const clientGST =
    typeof rawGst === 'string' &&
    rawGst.trim() &&
    !['—', '-', 'N/A', 'NA', 'NONE', 'NULL', 'UNDEFINED'].includes(rawGst.trim().toUpperCase())
      ? rawGst.trim().toUpperCase()
      : null;

  const rawSiteInchargeName =
    quotation.siteInchargeName ||
    quotation.site_incharge_name ||
    quotation.contactPerson ||
    quotation.contact_person ||
    quotation.lead?.siteInchargeName ||
    quotation.lead?.site_incharge_name ||
    quotation.lead?.contactPerson ||
    quotation.lead?.contact_person ||
    quotation.customer?.contactPerson ||
    '';
  const clientSiteInchargeName = cleanField(rawSiteInchargeName);

  const rawSiteInchargeMobile =
    quotation.siteInchargeMobile ||
    quotation.site_incharge_mobile ||
    quotation.phone ||
    quotation.mobile ||
    quotation.lead?.siteInchargeMobile ||
    quotation.lead?.site_incharge_mobile ||
    quotation.lead?.phone ||
    quotation.lead?.mobile ||
    quotation.customer?.phone ||
    quotation.customer?.mobile ||
    '';
  const clientSiteInchargeMobile = cleanField(rawSiteInchargeMobile);

  const rawSalesMobile =
    quotation.salesExecutiveMobile ||
    quotation.salesExecutivePhone ||
    quotation.salesExecutive?.employee?.phoneNumber ||
    quotation.salesExecutive?.employee?.companyPhoneNumber ||
    quotation.salesExecutive?.phoneNumber ||
    quotation.salesExecutive?.phone ||
    quotation.salesExecutive?.mobile ||
    quotation.lead?.salesExecutive?.employee?.phoneNumber ||
    quotation.lead?.salesExecutive?.employee?.companyPhoneNumber ||
    quotation.lead?.salesExecutive?.phoneNumber ||
    quotation.lead?.salesExecutive?.phone ||
    quotation.lead?.phone ||
    '';
  const cleanSalesMobile = rawSalesMobile ? String(rawSalesMobile).trim() : '';
  const quotationContactPhone = cleanSalesMobile
    ? (cleanSalesMobile.startsWith('+') ? cleanSalesMobile : `+91 ${cleanSalesMobile}`)
    : '+91 84888 11609';

  const paymentTermsText = quotation.paymentTerms
    ? quotation.paymentTerms
    : Array.isArray(quotation.paymentMilestones) && quotation.paymentMilestones.length > 0
      ? quotation.paymentMilestones.map((m) => `${m.label} ${m.percentage}%`).join(', ')
      : 'Advance';

  const quotationDateText =
    quotation.date ||
    (quotation.createdAt ? String(quotation.createdAt).slice(0, 10) : null) ||
    new Date().toISOString().slice(0, 10);

  // Detail items & Totals
  const itemsList = quotationDetailItems(quotation);
  const transportCost = Number(quotation.transportCharge ?? quotation.expectedTransportationCost ?? 0);
  const quotationTotals = calculateQuotationTotals(itemsList, transportCost);
  const calculatedSubtotal =
    quotationTotals.itemsTaxable ?? (quotationTotals.subtotal - quotationTotals.discountAmount);
  const calculatedTaxAmt = quotationTotals.gstAmount;

  // Actions
  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    try {
      setDownloadingPdf(true);
      const qNo = resolveQuotationNumber(quotation);
      const safeQNo = String(qNo).replace(/[\/\\]/g, '_') || 'Draft';
      const custName = (clientCustomerName || '')
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeFilename = `Quotation_${safeQNo}${custName ? `_${custName}` : ''}.pdf`;
      await exportQuotationHighQualityPDF('quotation-printable-area', safeFilename);
    } catch (err) {
      console.error('Error generating high quality PDF:', err);
      alert('Failed to generate high quality PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    if (downloadingImage) return;
    try {
      setDownloadingImage(true);
      const qNo = resolveQuotationNumber(quotation);
      const safeFilename = `Quotation_${String(qNo).replace(/[\/\\]/g, '_') || 'Draft'}.png`;
      await exportQuotationImage('quotation-printable-area', safeFilename);
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setDownloadingImage(false);
    }
  };

  const handleShareImage = async () => {
    if (sharingImage) return;
    try {
      setSharingImage(true);
      const qNo = resolveQuotationNumber(quotation);
      const custName = clientCustomerName || '';
      await shareQuotationImage('quotation-printable-area', qNo, custName);
    } catch (err) {
      console.error('Error sharing image:', err);
    } finally {
      setSharingImage(false);
    }
  };

  return (
    <div
      className="modal-overlay active"
      onClick={onClose}
      style={{
        padding: '12px 8px',
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        boxSizing: 'border-box',
        zIndex: 10000,
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <style>{`
        .quotation-sheet-modal-container {
          max-height: calc(100vh - 24px);
          width: 840px;
          max-width: calc(100vw - 16px);
          padding: 0 !important;
          box-sizing: border-box;
          background: #ffffff;
          border-radius: 16px;
          margin: auto;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
          border: 1px solid #dce5f0;
        }
        .quotation-document-viewport,
        .quotation-preview-wrapper {
          flex: 1;
          overflow-y: auto;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          background: #f1f5f9;
          display: flex;
          justify-content: center;
          padding: 12px 0;
        }
        .quotation-page,
        .quotation-preview-container {
          width: 794px !important;
          min-width: 794px !important;
          max-width: 794px !important;
          min-height: 1123px !important;
          flex-shrink: 0;
          position: relative;
          background: #ffffff;
          box-sizing: border-box;
        }
        .term-number {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          background: #e0f2fe;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }
        .quotation-preview-container table,
        .quotation-items-table,
        .doc-table {
          display: table !important;
          width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          border-spacing: 0 !important;
          background: #ffffff !important;
          margin: 0 !important;
        }
        .quotation-table-container {
          width: 100% !important;
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          background: #ffffff !important;
          margin: 0 0 16px 0 !important;
        }
        .quotation-preview-container thead,
        .quotation-items-table thead,
        .doc-table thead {
          display: table-header-group !important;
        }
        .quotation-preview-container thead tr,
        .quotation-items-table thead tr,
        .doc-table thead tr {
          display: table-row !important;
          background: #002e5d !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .quotation-preview-container tbody,
        .quotation-items-table tbody,
        .doc-table tbody {
          display: table-row-group !important;
        }
        .quotation-preview-container tbody tr,
        .quotation-items-table tbody tr,
        .doc-table tbody tr {
          display: table-row !important;
          background: #ffffff !important;
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
        }
        .quotation-preview-container th,
        .quotation-items-table th,
        .doc-table th {
          display: table-cell !important;
          background: #002e5d !important;
          color: #ffffff !important;
          vertical-align: middle !important;
          padding: 12px 10px !important;
          font-weight: 800 !important;
          font-size: 11px !important;
          letter-spacing: 0.04em !important;
          text-transform: uppercase !important;
          border: none !important;
          box-shadow: none !important;
        }
        .quotation-preview-container td,
        .quotation-items-table td,
        .doc-table td {
          display: table-cell !important;
          vertical-align: middle !important;
          padding: 12px 10px !important;
          background: #ffffff !important;
          box-shadow: none !important;
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          text-align: inherit !important;
          flex-direction: initial !important;
          justify-content: initial !important;
          align-items: initial !important;
          gap: 0 !important;
        }
        .quotation-preview-container td::before,
        .quotation-items-table td::before,
        .doc-table td::before {
          display: none !important;
          content: none !important;
        }
        .quotation-items-table .col-number,
        .quotation-items-table .product-number {
          width: 7% !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
        }
        .quotation-items-table .col-details,
        .quotation-items-table .product-details-cell {
          width: 46% !important;
          text-align: left !important;
          vertical-align: middle !important;
          min-width: 0 !important;
          overflow: hidden !important;
          padding: 14px 16px !important;
        }
        .quotation-items-table .col-qty,
        .quotation-items-table .product-qty {
          width: 10% !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
        }
        .quotation-items-table .col-rate,
        .quotation-items-table .product-rate {
          width: 13% !important;
          text-align: right !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
        }
        .quotation-items-table .col-tax,
        .quotation-items-table .product-tax {
          width: 11% !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
        }
        .quotation-items-table .col-total,
        .quotation-items-table .product-total {
          width: 13% !important;
          text-align: right !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
        }
        .quotation-items-table .product-name {
          font-size: 14.5px !important;
          font-weight: 800 !important;
          color: #002e5d !important;
          line-height: 1.25 !important;
          margin-bottom: 4px !important;
          white-space: normal !important;
          overflow-wrap: break-word !important;
        }
        .quotation-items-table .product-description {
          font-size: 12px !important;
          line-height: 1.4 !important;
          color: #52627a !important;
          margin-bottom: 4px !important;
          white-space: normal !important;
          overflow-wrap: break-word !important;
          font-weight: 500 !important;
        }
        .quotation-items-table .product-code {
          font-size: 11px !important;
          line-height: 1.3 !important;
          color: #718096 !important;
          font-family: monospace !important;
          white-space: normal !important;
          overflow-wrap: anywhere !important;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .quotation-document-viewport {
            justify-content: flex-start;
            padding: 6px 0;
          }
          .sheet-actions {
            padding: 10px 12px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .sheet-actions-btn-group {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .sheet-actions-btn-group button {
            width: 100% !important;
            justify-content: center !important;
            padding: 8px 6px !important;
            font-size: 11.5px !important;
          }
        }
      `}</style>

      <div className="quotation-sheet-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Mobile zoom toggle toolbar */}
        {previewScale < 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewZoomMode((m) => (m === 'fit' ? 'full' : 'fit'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#002e5d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {previewZoomMode === 'fit' ? '🔍 Zoom to 100%' : '📱 Fit to Mobile Screen'}
            </button>
            <span style={{ fontSize: '11px', color: '#334155', fontWeight: '700' }}>
              {previewZoomMode === 'fit'
                ? `Fitted View (${Math.round(previewScale * 100)}%)`
                : 'Full 794px A4 Document'}
            </span>
          </div>
        )}

        {/* Scrollable Viewport to maintain exact 794px crisp geometry without squishing */}
        <div className="quotation-document-viewport quotation-preview-wrapper">
          <div
            style={{
              width:
                previewZoomMode === 'fit' && previewScale < 1
                  ? `${Math.round(794 * previewScale)}px`
                  : '794px',
              height:
                previewZoomMode === 'fit' && previewScale < 1
                  ? `${Math.round(sheetHeight * previewScale)}px`
                  : 'auto',
              overflow: previewZoomMode === 'fit' && previewScale < 1 ? 'hidden' : 'visible',
              margin: '0 auto',
              flexShrink: 0,
              transition: 'width 0.15s ease, height 0.15s ease',
            }}
          >
            <div
              ref={quotationSheetRef}
              id="quotation-printable-area"
              className="quotation-page quotation-preview-container no-mobile-stack flat-table"
              style={{
                width: '794px',
                minWidth: '794px',
                maxWidth: '794px',
                minHeight: '1123px',
                background: '#ffffff',
                borderRadius: '0',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                boxSizing: 'border-box',
                transform:
                  previewZoomMode === 'fit' && previewScale < 1
                    ? `scale(${previewScale})`
                    : 'none',
                transformOrigin: 'top left',
              }}
            >
              {/* Curved Header Banner Wave with Himalaya Logo */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '150px',
                  overflow: 'hidden',
                  margin: 0,
                  padding: 0,
                }}
              >
                <svg
                  viewBox="0 0 794 150"
                  preserveAspectRatio="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                  }}
                >
                  {/* Light wave behind */}
                  <path
                    d="M 0 0 L 794 0 L 794 30 C 580 15, 420 120, 0 130 Z"
                    fill="#3b82f6"
                    opacity="0.25"
                  />
                  {/* Main dark wave */}
                  <path
                    d="M 0 0 L 794 0 L 794 15 C 580 5, 420 105, 0 115 Z"
                    fill="#002e5d"
                  />
                  {/* White cutout ellipse background for logo */}
                  <ellipse cx="80" cy="20" rx="180" ry="115" fill="#ffffff" />
                </svg>
                {/* Content inside wave (Original Himalaya Logo) */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    padding: '20px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <img
                    src={himalayaLogoBase64}
                    alt="Himalaya Logo"
                    style={{ height: '75px', width: 'auto', objectFit: 'contain' }}
                  />
                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: '8.5px',
                      fontWeight: '700',
                      marginTop: '6px',
                      letterSpacing: '0.8px',
                    }}
                  >
                    STRENGTH. DURABILITY. TRUST.
                  </div>
                </div>
              </div>

              {/* Inner Content Area */}
              <div style={{ padding: '16px 32px 28px 32px' }}>
                {/* Upper Section: Company Details (Left) and Ref & Meta (Right) */}
                <div
                  className="quotation-sheet-mobile-flex"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h1
                      style={{
                        fontSize: '18px',
                        fontWeight: '850',
                        color: '#002e5d',
                        margin: 0,
                        fontFamily: 'sans-serif',
                      }}
                    >
                      Himalaya Composites &amp; Precast Pvt Ltd
                    </h1>
                    <p
                      style={{
                        fontSize: '10px',
                        fontWeight: '750',
                        color: '#0284c7',
                        margin: '2px 0 8px 0',
                        letterSpacing: '0.4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      FORMERLY KNOWN AS AKBERALI PRECAST PVT LTD
                    </p>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#475569',
                        fontWeight: '600',
                        lineHeight: '1.45',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <p style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MapPin size={13} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>
                          PLOT NO.25&amp;26, SURVEY NO.35(OLD-27-A), EVOKE INDUSTRIAL PARK, BAREJA KHEDA
                          ROAD, MALARPURA, KHEDA, GUJARAT
                        </span>
                      </p>
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={13} color="#0284c7" />
                        <span>
                          GSTIN/UIN:{' '}
                          <span style={{ fontWeight: '750', color: '#1e293b' }}>24AAICH3332B1Z6</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  <div
                    className="quotation-sheet-right-meta"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '8px',
                    }}
                  >
                    {/* QUOTATION ribbon header */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'stretch',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                      }}
                    >
                      <div
                        style={{
                          background: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 12px',
                        }}
                      >
                        <FileText size={16} color="#ffffff" />
                      </div>
                      <div
                        style={{
                          background: '#002e5d',
                          color: '#ffffff',
                          padding: '8px 24px 8px 16px',
                          fontWeight: '800',
                          fontSize: '15px',
                          letterSpacing: '0.5px',
                          clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)',
                        }}
                      >
                        QUOTATION
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: '12.5px',
                        color: '#475569',
                        fontWeight: '700',
                        margin: '2px 0 6px 0',
                      }}
                    >
                      Ref: {resolveQuotationNumber(quotation)}
                    </p>

                    {/* Stacked Meta Info */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        width: '180px',
                        marginTop: '4px',
                      }}
                    >
                      {/* Date Card */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          textAlign: 'left',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: '#e0f2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Calendar size={15} color="#0284c7" />
                        </div>
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '9px',
                              color: '#64748b',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.2px',
                            }}
                          >
                            Quotation Date
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '11.5px',
                              color: '#0f2c59',
                              fontWeight: '700',
                            }}
                          >
                            {quotationDateText}
                          </p>
                        </div>
                      </div>

                      {/* Payment Terms Card */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          textAlign: 'left',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: '#e0f2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <CreditCard size={15} color="#0284c7" />
                        </div>
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '9px',
                              color: '#64748b',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.2px',
                            }}
                          >
                            Payment Terms
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '11.5px',
                              color: '#0f2c59',
                              fontWeight: '700',
                            }}
                          >
                            {paymentTermsText}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Styled horizontal banner "QUOTED TO:" */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    margin: '18px 0',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div
                    style={{
                      background: '#002e5d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      flexShrink: 0,
                    }}
                  >
                    <User size={20} color="#ffffff" />
                  </div>
                  <div
                    style={{
                      padding: '10px 16px',
                      flex: 1,
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: '9px',
                        fontWeight: '700',
                        color: '#64748b',
                        letterSpacing: '0.5px',
                      }}
                    >
                      QUOTED TO:
                    </p>
                    <p
                      style={{
                        margin: '2px 0 0 0',
                        fontSize: '15px',
                        fontWeight: '800',
                        color: '#0f2c59',
                      }}
                    >
                      {clientCustomerName}
                    </p>
                    {clientAddress && (
                      <p
                        style={{
                          margin: '2px 0 0 0',
                          fontSize: '11.5px',
                          color: '#475569',
                          fontWeight: '500',
                        }}
                      >
                        {clientAddress}
                      </p>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '16px',
                        marginTop: '4px',
                      }}
                    >
                      {clientGST && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '11.5px',
                            color: '#475569',
                            fontWeight: '600',
                          }}
                        >
                          GST:{' '}
                          <span
                            style={{
                              textTransform: 'uppercase',
                              fontFamily: 'monospace',
                              fontWeight: '700',
                              color: '#1e293b',
                            }}
                          >
                            {clientGST}
                          </span>
                        </p>
                      )}
                      {(clientSiteInchargeName || clientSiteInchargeMobile) && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '11.5px',
                            color: '#475569',
                            fontWeight: '600',
                          }}
                        >
                          Site Incharge:{' '}
                          {clientSiteInchargeName && (
                            <span style={{ fontWeight: '700', color: '#0f2c59' }}>
                              {clientSiteInchargeName}
                            </span>
                          )}
                          {clientSiteInchargeMobile && (
                            <span
                              style={{
                                color: '#0284c7',
                                fontWeight: '700',
                                marginLeft: clientSiteInchargeName ? '4px' : '0',
                              }}
                            >
                              {clientSiteInchargeName
                                ? `(${clientSiteInchargeMobile})`
                                : clientSiteInchargeMobile}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Faint watermark outline background on the right */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      top: 0,
                      width: '160px',
                      opacity: 0.08,
                      pointerEvents: 'none',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                      padding: '4px',
                    }}
                  >
                    <img
                      src={himalayaLogoMarkBase64}
                      alt="watermark"
                      style={{ height: '85%', width: 'auto', objectFit: 'contain' }}
                    />
                  </div>
                </div>

                {/* Items Table - Exact 6 Columns matching Sales */}
                <div
                  className="quotation-table-container no-mobile-stack"
                  style={{
                    margin: '0 0 16px 0',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    background: '#ffffff',
                  }}
                >
                  <table
                    className="quotation-items-table doc-table no-mobile-stack flat-table"
                    style={{
                      border: 'none',
                      width: '100%',
                      borderCollapse: 'collapse',
                      borderSpacing: 0,
                      display: 'table',
                      tableLayout: 'fixed',
                      background: '#ffffff',
                      margin: 0,
                    }}
                  >
                    <thead style={{ display: 'table-header-group' }}>
                      <tr style={{ background: '#002e5d', color: '#ffffff', display: 'table-row' }}>
                        <th
                          className="col-number"
                          style={{
                            width: '7%',
                            padding: '12px 8px',
                            fontWeight: '800',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#ffffff',
                            textAlign: 'center',
                            background: '#002e5d',
                            display: 'table-cell',
                            verticalAlign: 'middle',
                          }}
                        >
                          #
                        </th>
                        <th
                          className="col-details"
                          style={{
                            width: '46%',
                            padding: '12px 16px',
                            fontWeight: '800',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#ffffff',
                            textAlign: 'left',
                            background: '#002e5d',
                            display: 'table-cell',
                            verticalAlign: 'middle',
                          }}
                        >
                          PRODUCT DETAILS
                        </th>
                        <th
                          className="col-qty"
                          style={{
                            width: '10%',
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontWeight: '800',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#ffffff',
                            background: '#002e5d',
                            display: 'table-cell',
                            verticalAlign: 'middle',
                          }}
                        >
                          QTY
                        </th>
                        <th
                          className="col-rate"
                          style={{
                            width: '13%',
                            padding: '12px 10px',
                            textAlign: 'right',
                            fontWeight: '800',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#ffffff',
                            background: '#002e5d',
                            display: 'table-cell',
                            verticalAlign: 'middle',
                          }}
                        >
                          RATE
                        </th>
                        <th
                          className="col-tax"
                          style={{
                            width: '11%',
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontWeight: '800',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#ffffff',
                            background: '#002e5d',
                            display: 'table-cell',
                            verticalAlign: 'middle',
                          }}
                        >
                          TAX (GST)
                        </th>
                        <th
                          className="col-total"
                          style={{
                            width: '13%',
                            padding: '12px 14px',
                            textAlign: 'right',
                            fontWeight: '800',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#ffffff',
                            background: '#002e5d',
                            display: 'table-cell',
                            verticalAlign: 'middle',
                          }}
                        >
                          TOTAL
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ display: 'table-row-group' }}>
                      {itemsList.map((item, index) => {
                        const itemQty =
                          item.quantity !== undefined &&
                          item.quantity !== null &&
                          item.quantity !== ''
                            ? Number(item.quantity)
                            : 1;
                        const itemPrice = Number(item.unitPrice ?? item.rate ?? item.price ?? 0);
                        const itemSubtotal = itemQty * itemPrice;

                        let discPct = 0;
                        let discountValue = 0;
                        if (
                          item.discountPercent !== undefined &&
                          item.discountPercent !== null &&
                          item.discountPercent !== ''
                        ) {
                          discPct = Number(item.discountPercent);
                          discountValue = itemSubtotal * (discPct / 100);
                        } else if (
                          item.discountAmount !== undefined &&
                          item.discountAmount !== null &&
                          item.discountAmount !== ''
                        ) {
                          discountValue = Number(item.discountAmount);
                          discPct =
                            itemSubtotal > 0
                              ? Math.round((discountValue / itemSubtotal) * 100)
                              : 0;
                        } else if (
                          item.discount !== undefined &&
                          item.discount !== null &&
                          item.discount !== ''
                        ) {
                          const rawDisc = Number(item.discount);
                          if (itemSubtotal > 0 && rawDisc > 100) {
                            discountValue = rawDisc;
                            discPct = Math.round((rawDisc / itemSubtotal) * 100);
                          } else {
                            discPct = rawDisc;
                            discountValue = itemSubtotal * (discPct / 100);
                          }
                        }
                        if (discPct > 100) discPct = 0;

                        const taxable = Math.max(0, itemSubtotal - discountValue);
                        const discountedRate =
                          itemQty > 0
                            ? taxable / itemQty
                            : discPct > 0
                              ? itemPrice * (1 - discPct / 100)
                              : itemPrice;

                        let itemTaxRate =
                          item.tax !== undefined && item.tax !== null && item.tax !== ''
                            ? Number(item.tax)
                            : 0;
                        if (itemTaxRate > 28 && taxable > 0) {
                          const derived = Math.round((itemTaxRate / taxable) * 100);
                          if (derived <= 28) itemTaxRate = derived;
                        }
                        const taxValue = (taxable * itemTaxRate) / 100;
                        const itemTotal = taxable + taxValue;
                        const cleanSpecs = formatCleanProductSpecs(item);

                        return (
                          <tr
                            key={item.id || index}
                            className="quotation-product-row"
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              display: 'table-row',
                              background: 'transparent',
                            }}
                          >
                            {/* # */}
                            <td
                              className="product-number"
                              style={{
                                width: '7%',
                                padding: '12px 8px',
                                textAlign: 'center',
                                fontWeight: '700',
                                color: '#64748b',
                                fontSize: '13px',
                                display: 'table-cell',
                                verticalAlign: 'middle',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {index + 1}
                            </td>

                            {/* PRODUCT DETAILS */}
                            <td
                              className="product-details-cell"
                              style={{
                                width: '46%',
                                padding: '14px 16px',
                                display: 'table-cell',
                                verticalAlign: 'middle',
                                textAlign: 'left',
                                minWidth: 0,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                className="product-name"
                                style={{
                                  fontWeight: '800',
                                  color: '#002e5d',
                                  fontSize: '14px',
                                  lineHeight: '1.25',
                                  marginBottom: '4px',
                                  whiteSpace: 'normal',
                                  overflowWrap: 'break-word',
                                }}
                              >
                                {item.productName}
                              </div>
                              {cleanSpecs ? (
                                <div
                                  className="product-description"
                                  style={{
                                    fontSize: '12px',
                                    color: '#52627a',
                                    lineHeight: '1.4',
                                    marginBottom: '4px',
                                    whiteSpace: 'normal',
                                    overflowWrap: 'break-word',
                                    fontWeight: '500',
                                  }}
                                >
                                  {cleanSpecs}
                                </div>
                              ) : null}
                              <div
                                className="product-code"
                                style={{
                                  fontSize: '11px',
                                  color: '#718096',
                                  fontFamily: 'monospace',
                                  whiteSpace: 'normal',
                                  overflowWrap: 'anywhere',
                                }}
                              >
                                Code: {item.code}
                              </div>
                            </td>

                            {/* QTY */}
                            <td
                              className="product-qty"
                              style={{
                                width: '10%',
                                padding: '12px 8px',
                                textAlign: 'center',
                                fontWeight: '800',
                                color: '#002e5d',
                                fontSize: '13.5px',
                                display: 'table-cell',
                                verticalAlign: 'middle',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {itemQty}
                            </td>

                            {/* RATE */}
                            <td
                              className="product-rate"
                              style={{
                                width: '13%',
                                padding: '12px 10px',
                                textAlign: 'right',
                                fontWeight: '700',
                                color: '#002e5d',
                                fontSize: '13.5px',
                                display: 'table-cell',
                                verticalAlign: 'middle',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <div>{formatINR(discountedRate)}</div>
                            </td>

                            {/* TAX */}
                            <td
                              className="product-tax"
                              style={{
                                width: '11%',
                                padding: '12px 8px',
                                textAlign: 'center',
                                fontWeight: '600',
                                color: '#475569',
                                fontSize: '13px',
                                display: 'table-cell',
                                verticalAlign: 'middle',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {itemTaxRate}%
                            </td>

                            {/* TOTAL */}
                            <td
                              className="product-total"
                              style={{
                                width: '13%',
                                padding: '12px 14px',
                                textAlign: 'right',
                                fontWeight: '900',
                                color: '#002e5d',
                                fontSize: '14px',
                                display: 'table-cell',
                                verticalAlign: 'middle',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {formatINR(itemTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Calculations Invoice Summary panel */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    margin: '14px 0 20px 0',
                    gap: '6px',
                  }}
                >
                  {/* Subtotal row */}
                  <div
                    style={{
                      display: 'flex',
                      width: '290px',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '7px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: '#ffffff',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        color: '#475569',
                        fontWeight: '600',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          background: '#e0f2fe',
                        }}
                      >
                        <FileText size={12} color="#0284c7" />
                      </span>
                      Items Subtotal:
                    </span>
                    <span style={{ fontWeight: '800', color: '#002e5d', fontSize: '13.5px' }}>
                      {formatINR(calculatedSubtotal)}
                    </span>
                  </div>

                  {/* Transportation Cost */}
                  {transportCost >= 0 && (
                    <div
                      style={{
                        display: 'flex',
                        width: '290px',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '7px 12px',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        background: '#f0fdf4',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          color: '#0369a1',
                          fontWeight: '600',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '22px',
                            height: '22px',
                            borderRadius: '4px',
                            background: '#e0fdf4',
                          }}
                        >
                          <Truck size={12} color="#0369a1" />
                        </span>
                        Transportation Cost:
                      </span>
                      <span style={{ fontWeight: '800', color: '#0369a1', fontSize: '13.5px' }}>
                        +{formatINR(transportCost)}
                      </span>
                    </div>
                  )}

                  {/* GST row */}
                  <div
                    style={{
                      display: 'flex',
                      width: '290px',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '7px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: '#ffffff',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        color: '#475569',
                        fontWeight: '600',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          background: '#e0f2fe',
                        }}
                      >
                        <Percent size={12} color="#0284c7" />
                      </span>
                      GST Amount:
                    </span>
                    <span style={{ fontWeight: '800', color: '#002e5d', fontSize: '13.5px' }}>
                      {formatINR(calculatedTaxAmt)}
                    </span>
                  </div>

                  {/* Grand Total row */}
                  <div
                    style={{
                      display: 'flex',
                      width: '290px',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '9px 14px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: '800',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <ShieldCheck size={13} color="#ffffff" />
                      </span>
                      Grand Total:
                    </span>
                    <span style={{ fontWeight: '900', fontSize: '16px' }}>
                      {formatINR(quotationTotals.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Terms & Conditions Section */}
                {(() => {
                  const termsList = resolveQuotationTerms(quotation);
                  if (!termsList || termsList.length === 0) return null;
                  return (
                    <div
                      style={{
                        marginTop: '20px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#002e5d',
                          color: '#ffffff',
                          padding: '10px 16px',
                          gap: '8px',
                          fontWeight: '700',
                          fontSize: '12.5px',
                        }}
                      >
                        <div
                          style={{
                            background: '#0284c7',
                            width: '22px',
                            height: '22px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CheckSquare size={13} color="#ffffff" />
                        </div>
                        TERMS AND CONDITIONS :-
                      </div>
                      <div
                        className="terms-container"
                        style={{
                          padding: '12px 16px',
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        {termsList.map((term, i) => (
                          <div
                            key={term.termId || term.id || i}
                            className="term-item"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '5px 0',
                              borderBottom: i < termsList.length - 1 ? '1px dashed #f1f5f9' : 'none',
                            }}
                          >
                            <div className="term-number">{i + 1}</div>
                            <div
                              className="term-text"
                              style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600' }}
                            >
                              {term.text || term.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Valuable Clients Section */}
                <div
                  style={{
                    marginTop: '20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#002e5d',
                      color: '#ffffff',
                      padding: '10px 16px',
                      gap: '8px',
                      fontWeight: '750',
                      fontSize: '12.5px',
                    }}
                  >
                    <div
                      style={{
                        background: '#3b82f6',
                        width: '22px',
                        height: '22px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Star size={13} color="#ffffff" fill="#ffffff" />
                    </div>
                    VALUABLE CLIENTS
                  </div>
                  <div
                    className="clients-container"
                    style={{
                      padding: '16px 20px',
                      background: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    {/* Reliance Logo */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img
                        src={relianceLogoBase64}
                        alt="Reliance Industries Limited"
                        style={{ maxHeight: '42px', maxWidth: '120px', objectFit: 'contain' }}
                      />
                    </div>
                    {/* Adani Logo */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img
                        src={adaniLogoBase64}
                        alt="adani"
                        style={{ maxHeight: '36px', maxWidth: '110px', objectFit: 'contain' }}
                      />
                    </div>
                    {/* L&T Logo */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img
                        src={ltLogoBase64}
                        alt="L&T"
                        style={{ maxHeight: '40px', maxWidth: '100px', objectFit: 'contain' }}
                      />
                    </div>
                    {/* A.SHRIDHAR Logo */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img
                        src={ashridharLogoBase64}
                        alt="A.SHRIDHAR"
                        style={{ maxHeight: '38px', maxWidth: '120px', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sign-off & Authorised Signatory Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginTop: '24px',
                    paddingBottom: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Official Company Seal Stamp */}
                    <img
                      src={himalayaStampBase64}
                      alt="Himalaya Seal Stamp"
                      style={{
                        width: '84px',
                        height: '84px',
                        objectFit: 'contain',
                        marginRight: '8px',
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        fontSize: '12.5px',
                        color: '#334155',
                        fontStyle: 'italic',
                        lineHeight: '1.5',
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: '500' }}>
                        Thanks and waiting for your valued order
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>Yours truly,</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', color: '#1e293b' }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: '800',
                        fontSize: '13px',
                        color: '#002e5d',
                      }}
                    >
                      For Himalaya Composites &amp; Precast Pvt Ltd
                    </p>
                    <p
                      style={{
                        margin: '2px 0 0 0',
                        fontStyle: 'italic',
                        fontSize: '11px',
                        color: '#475569',
                      }}
                    >
                      (Formerly known as Akberali Precast Pvt Ltd)
                    </p>
                    {/* Authorised Signature Image */}
                    <div
                      style={{
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: '6px',
                      }}
                    >
                      <img
                        src={himalayaSignatureBase64}
                        alt="Authorised Signature"
                        style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
                      />
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: '800',
                        fontSize: '12.5px',
                        color: '#1e293b',
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '4px',
                        display: 'inline-block',
                      }}
                    >
                      Authorised Signatory
                    </p>
                  </div>
                </div>
              </div>

              {/* Curved Footer Wave with Contact Info */}
              <div
                className="quotation-footer-wave-wrapper"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '76px',
                  overflow: 'hidden',
                  marginTop: '18px',
                  background: '#002e5d',
                }}
              >
                <svg
                  viewBox="0 0 840 76"
                  preserveAspectRatio="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                  }}
                >
                  <path
                    d="M 0 10 C 245 -2, 560 26, 840 2 L 840 31 C 565 54, 255 24, 0 38 Z"
                    fill="#3b82f6"
                    opacity="0.28"
                  />
                  <path
                    d="M 0 22 C 255 6, 560 45, 840 18 L 840 76 L 0 76 Z"
                    fill="#002e5d"
                  />
                </svg>
                <div
                  className="quotation-footer-contact"
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                    boxSizing: 'border-box',
                    padding: '30px 34px 10px',
                    color: '#ffffff',
                    fontSize: '11.5px',
                    fontWeight: '700',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
                    <Phone size={13} color="#ffffff" fill="#ffffff" /> {quotationContactPhone}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
                    <Mail size={13} color="#ffffff" /> Info@thehimalaya.co.in
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
                    <Globe size={13} color="#ffffff" /> www.thehimalaya.co.in
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Footer (Strictly Read-Only for Finance: Close, Download PDF, Download Image, Share Image) */}
        <div
          className="sheet-actions"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '14px 24px',
            boxSizing: 'border-box',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            zIndex: 10,
          }}
        >
          <div className="sheet-actions-btn-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-small btn-outline-small"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                fontSize: '12.5px',
                fontWeight: '700',
                borderRadius: '8px',
                margin: 0,
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Close Preview
            </button>

            {/* Download PDF */}
            <button
              type="button"
              disabled={downloadingPdf}
              onClick={handleDownloadPdf}
              style={{
                padding: '9px 18px',
                fontSize: '12.5px',
                fontWeight: '800',
                borderRadius: '8px',
                margin: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#002e5d',
                color: '#ffffff',
                border: '1px solid #002e5d',
                cursor: downloadingPdf ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(0, 46, 93, 0.25)',
              }}
            >
              {downloadingPdf ? (
                <>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid #ffffff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <span>Saving HD PDF...</span>
                </>
              ) : (
                <>
                  <FileText size={15} />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Download Image */}
            <button
              type="button"
              disabled={downloadingImage}
              onClick={handleDownloadImage}
              style={{
                padding: '9px 16px',
                fontSize: '12.5px',
                fontWeight: '750',
                borderRadius: '8px',
                margin: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0284c7',
                color: '#ffffff',
                border: '1px solid #0284c7',
                cursor: downloadingImage ? 'not-allowed' : 'pointer',
              }}
            >
              {downloadingImage ? (
                <>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid #ffffff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <span>Saving HD Image...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download Image</span>
                </>
              )}
            </button>

            {/* Share Image */}
            <button
              type="button"
              disabled={sharingImage}
              onClick={handleShareImage}
              style={{
                padding: '9px 14px',
                fontSize: '12.5px',
                fontWeight: '700',
                borderRadius: '8px',
                margin: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#334155',
                cursor: sharingImage ? 'not-allowed' : 'pointer',
              }}
            >
              {sharingImage ? (
                <>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid #2563eb',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
