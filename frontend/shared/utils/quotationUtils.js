/**
 * Shared quotation utilities for resolving human-readable quotation numbers,
 * customer names, and quotation identifiers consistently across Views (QuotationsView,
 * ReportsView, DailyTaskView, DashboardView).
 */

export const resolveQuotationNumber = (q) => {
  if (!q) return '—';
  if (typeof q === 'string') {
    const trimmed = q.trim();
    if (!trimmed) return '—';
    if (trimmed.startsWith('QT/') || trimmed.startsWith('QU/') || trimmed.startsWith('QTN/') || trimmed.startsWith('QT-') || trimmed.startsWith('QTN-') || trimmed.startsWith('HCCL/')) {
      return trimmed;
    }
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      return `QTN-${trimmed.slice(0, 8).toUpperCase()}`;
    }
    if (/^\d+$/.test(trimmed)) {
      return `QT/2627/${trimmed.padStart(4, '0')}`;
    }
    return trimmed;
  }
  const num = q.quotationNumber || q.quotation_number || q.quotationNo || q.quotation_no || q.quoteNo;
  if (num && typeof num === 'string' && num.trim()) {
    return num.trim();
  }
  if (q.id !== undefined && q.id !== null) {
    const idStr = String(q.id).trim();
    if (idStr.startsWith('QT/') || idStr.startsWith('QU/') || idStr.startsWith('QTN/') || idStr.startsWith('QT-') || idStr.startsWith('QTN-') || idStr.startsWith('HCCL/')) {
      return idStr;
    }
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr)) {
      return `QTN-${idStr.slice(0, 8).toUpperCase()}`;
    }
    if (/^\d+$/.test(idStr)) {
      return `QT/2627/${idStr.padStart(4, '0')}`;
    }
    return `QT-${idStr}`;
  }
  return 'QTN-DRAFT';
};

export const resolveQuotationCustomerName = (q) => {
  if (!q) return '—';
  const leadName = q.lead?.companyName || q.lead?.projectName || q.lead?.customerName;
  const directCustName = q.customer?.companyName || q.customer?.name;
  return (
    q.customerName ||
    q.customer_name ||
    (q.leadId || q.lead ? leadName || directCustName : directCustName || leadName) ||
    q.leadName ||
    q.clientName ||
    q.partyName ||
    '—'
  );
};
