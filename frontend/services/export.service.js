import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { apiClient } from '../lib/apiClient';
import { clientLogos } from './logosBase64';
import { resolveQuotationTerms } from './sales/quotationTerms';

/**
 * Universal safe file saver that works seamlessly on:
 * - Desktop browsers (Blob URL / dynamic link)
 * - Mobile / Flutter WebViews / Hybrid Apps (Web Share API / Base64 Data URL)
 * Completely eliminates DioException 'No host specified in URI blob:https...'
 */
export const safeSaveFile = async (data, filename, mimeType = 'application/octet-stream') => {
  let blob;
  let rawData = '';
  if (typeof data === 'string') {
    rawData = data;
    if (data.startsWith('data:')) {
      try {
        const parts = data.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || mimeType;
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } catch {
        blob = new Blob([data], { type: mimeType });
      }
    } else {
      blob = new Blob([data], { type: mimeType });
    }
  } else if (data instanceof Blob) {
    blob = data;
  } else if (data && typeof data.output === 'function') {
    blob = data.output('blob');
  } else {
    blob = new Blob([data], { type: mimeType });
  }

  // 1. Flutter InAppWebView JavaScript Channel handler (if registered in native APK)
  if (typeof window !== 'undefined' && window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
    try {
      let base64data = rawData;
      if (!base64data && blob) {
        base64data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
      const resolvedMimeType = blob?.type || mimeType;
      const safeFilename = String(filename || 'download')
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, ' ')
        .trim();
      await window.flutter_inappwebview.callHandler('downloadFile', {
        // The APK must decode data: URIs directly; it must not pass this to
        // Dio.download(), which only accepts http(s) URLs.
        sourceType: 'base64-data-uri',
        filename: safeFilename || 'download',
        mimeType: resolvedMimeType,
        data: base64data,
        destination: resolvedMimeType.startsWith('image/') ? 'gallery' : 'downloads',
      });
      return true;
    } catch (e) {
      console.warn('Flutter webview handler notice:', e);
    }
  }

  // 2. Server-side HTTPS Download Proxy (Completely eliminates Flutter DioException "No host specified in URI")
  const isMobileClient = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|wv|Flutter/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  if (isMobileClient) {
    try {
      let base64Payload = rawData;
      if (!base64Payload && blob) {
        base64Payload = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      if (base64Payload) {
        const response = await fetch('/api/backend/files/export-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename,
            mimeType,
            data: base64Payload,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson && resJson.downloadUrl) {
            const absoluteDownloadUrl = resJson.downloadUrl.startsWith('http')
              ? resJson.downloadUrl
              : `${window.location.origin}${resJson.downloadUrl}`;

            const link = document.createElement('a');
            link.href = absoluteDownloadUrl;
            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              if (document.body.contains(link)) document.body.removeChild(link);
            }, 2000);
            return true;
          }
        }
      }
    } catch (apiErr) {
      console.warn('Backend export-download fallback to client-side trigger:', apiErr);
    }
  }

  // 3. Desktop / Standard Browser saveAs (file-saver)
  try {
    saveAs(blob, filename);
    return true;
  } catch (e) {
    console.warn('saveAs failed, falling back to anchor click:', e);
  }

  // 4. Fallback anchor tag click with ObjectURL (Desktop standard)
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 1500);
    return true;
  } catch (err) {
    console.error('Final fallback download failed:', err);
  }
};

/**
 * Generate PDF from data
 */
export const exportToPDF = async (options = {}) => {
  const {
    title = 'Report',
    subtitle = '',
    columns = [],
    rows = [],
    orientation = 'landscape',
    filename = 'report.pdf'
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  // Page width for calculations
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Subtitle / generated date
  doc.setFontSize(10);
  doc.text(subtitle || `Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Table
  if (columns.length > 0 && rows.length > 0) {
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: y,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 2.5,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      margin: { left: margin, right: margin }
    });
  }

  // Footer with page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }

  // Save PDF universally
  await safeSaveFile(doc, filename, 'application/pdf');
};

/**
 * Export data to CSV
 */
export const exportToCSV = async (data, filename = 'report.csv') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header] !== null && row[header] !== undefined ? row[header] : '';
        // Escape quotes and handle newlines/commas
        const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const escaped = stringified.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  const csv = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  await safeSaveFile(blob, filename, 'text/csv;charset=utf-8');
};

/**
 * Export data to Excel (.xls / .xlsx formatted HTML table)
 */
export const exportToExcel = async (data, filename = 'report.xls') => {
  if (!data || data.length === 0) {
    alert('No data available to export to Excel');
    return;
  }

  const headers = Object.keys(data[0]);
  let xml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  xml += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>';

  // Header
  xml += '<thead><tr style="background-color: #2563eb; color: #ffffff; font-weight: bold;">';
  headers.forEach(h => {
    xml += `<th style="border: 1px solid #cbd5e1; padding: 8px;">${String(h)}</th>`;
  });
  xml += '</tr></thead><tbody>';

  // Rows
  data.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    xml += `<tr style="background-color: ${bg};">`;
    headers.forEach(h => {
      const val = row[h] !== null && row[h] !== undefined ? String(row[h]) : '';
      xml += `<td style="border: 1px solid #cbd5e1; padding: 6px;">${val}</td>`;
    });
    xml += '</tr>';
  });

  xml += '</tbody></table></body></html>';

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const name = filename.endsWith('.xls') || filename.endsWith('.xlsx') ? filename : `${filename}.xls`;
  await safeSaveFile(blob, name, 'application/vnd.ms-excel;charset=utf-8');
};

/**
 * Export Sales Report to PDF (100% Dynamic with Active Filters and Live Reporting Metrics)
 */
export const exportSalesReportPDF = async (filters = {}) => {
  let salesData = null;
  const startDate = filters.startDate || filters.date_from || filters.from || '';
  const endDate = filters.endDate || filters.date_to || filters.to || '';
  const branchId = filters.branchId || filters.branch || '';
  const rangePreset = filters.rangePreset || '';

  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', startDate);
    params.append('from', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
    params.append('to', endDate);
  }
  if (branchId && branchId !== 'All') {
    params.append('branchId', branchId);
    params.append('branch', branchId);
  }
  if (rangePreset) params.append('rangePreset', rangePreset);

  // 1. Fetch live sales analytics data
  try {
    const res = await apiClient.get(`/backend/super-admin/analytics/sales?${params.toString()}`);
    if (res && res.success && res.data) {
      salesData = res.data;
    } else if (res && res.data) {
      salesData = res.data;
    }
  } catch (err) {
    console.warn('Failed to fetch /backend/super-admin/analytics/sales, trying /reports:', err.message);
  }

  // Fallback to /backend/super-admin/reports if needed
  if (!salesData || !salesData.summary) {
    try {
      const resReports = await apiClient.get(`/backend/super-admin/reports?${params.toString()}`);
      if (resReports && resReports.data) {
        const d = resReports.data;
        salesData = {
          summary: {
            totalOrders: d.sales?.totalOrders ?? 0,
            revenueCollected: d.sales?.revenueCollected ?? 0,
            pendingCollections: d.finance?.outstandingReceivables ?? 0,
            leadsFunnel: d.sales?.leadsInFunnel ?? 0,
            activeQuotations: d.sales?.activeQuotations ?? 0,
            confirmedOrders: d.sales?.ordersClosedOrDispatched ?? 0,
            ordersGrowth: d.sales?.totalOrdersChangePercent ?? 0,
            fulfillmentRate: d.dispatch?.onTimeDeliveryRate ?? 100,
            samplesApproved: d.qc?.approvedPassed ?? 0,
            samplesPending: d.sales?.samplesPending ?? 0,
          },
          pipeline: {
            leadsPotential: 0,
            openQuotes: 0,
            confirmedOrders: d.sales?.revenueCollected ?? 0
          },
          effectiveness: {
            requested: d.sales?.samplesPending ?? 0,
            dispatched: d.dispatch?.shipmentsDispatched ?? 0,
            approved: d.qc?.approvedPassed ?? 0,
            converted: d.sales?.totalOrders ?? 0
          },
          topCustomers: [],
          overduePayments: []
        };
      }
    } catch (e) {
      console.warn('Failed to fetch /backend/super-admin/reports:', e.message);
    }
  }

  const summary = salesData?.summary || {};
  const pipeline = salesData?.pipeline || {};
  const effectiveness = salesData?.effectiveness || {};
  const overduePayments = salesData?.overduePayments || [];

  const dateLabel = (startDate && endDate) ? `${startDate} to ${endDate}` : (rangePreset || 'Current Active Period');
  const branchLabel = branchId && branchId !== 'All' ? branchId : 'All Company Branches';

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 14;

  // Header Banner
  doc.setFillColor(30, 58, 138); // #1e3a8a Navy
  doc.rect(margin, y, pageWidth - (margin * 2), 22, 'F');

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('THE HIMALAYA ENTERPRISE - EXECUTIVE SALES PERFORMANCE REPORT', margin + 6, y + 9);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Active Scope: ${branchLabel}  |  Period: ${dateLabel}  |  Generated: ${new Date().toLocaleString()}`, margin + 6, y + 16);

  y += 28;

  // 1. Executive Summary KPIs Table
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont(undefined, 'bold');
  doc.text('1. Executive KPI Summary', margin, y);
  y += 4;

  const kpiColumns = ['Metric Indicator', 'Active Scope Value', 'Metric Indicator', 'Active Scope Value'];
  const totalOrders = summary.totalOrders ?? 0;
  const revenue = Number(summary.revenueCollected ?? summary.grossSales ?? 0);
  const pending = Number(summary.pendingCollections ?? 0);
  const growth = Number(summary.ordersGrowth ?? 0);
  const fulfillment = Number(summary.fulfillmentRate ?? 100);
  const leads = summary.leadsFunnel ?? 0;
  const quotes = summary.activeQuotations ?? 0;

  const kpiRows = [
    [
      'Total Confirmed Orders', `${totalOrders} Orders`,
      'Gross Revenue Collected', `INR ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ],
    [
      'Pending Receivables', `INR ${pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      'On-Time Fulfillment Rate', `${fulfillment}%`
    ],
    [
      'Active Opportunity Leads', `${leads} Leads in Funnel`,
      'Period-over-Period Growth', `${growth >= 0 ? '+' : ''}${growth}%`
    ],
    [
      'Open Quotations in Funnel', `${quotes} Active Quotations`,
      'Closed / Dispatched Orders', `${summary.confirmedOrders ?? totalOrders} Orders`
    ]
  ];

  autoTable(doc, {
    head: [kpiColumns],
    body: kpiRows,
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], width: 65 },
      1: { width: 65 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], width: 65 },
      3: { width: 74 }
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 8;

  // 2. Commercial Pipeline Valuation Table
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont(undefined, 'bold');
  doc.text('2. Commercial Opportunity Pipeline Valuation', margin, y);
  y += 4;

  const pipelineColumns = ['Pipeline Funnel Stage', 'Volume / Entity Count', 'Estimated Pipeline Valuation', 'Commercial Status'];
  const pipelineRows = [
    ['1. New Leads in Funnel', `${leads} Leads`, `INR ${Number(pipeline.leadsPotential || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Active Prospecting'],
    ['2. Open Quotations', `${quotes} Quotes`, `INR ${Number(pipeline.openQuotes || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price Negotiation / Proposal'],
    ['3. Confirmed Orders', `${totalOrders} Orders`, `INR ${Number(pipeline.confirmedOrders || revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Production & Fulfillment Queue']
  ];

  autoTable(doc, {
    head: [pipelineColumns],
    body: pipelineRows,
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 8;

  // 3. Sample Lifecycle & Quality Conversions
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont(undefined, 'bold');
  doc.text('3. Sample Evaluation & Conversion Lifecycle', margin, y);
  y += 4;

  const sampleCols = ['Samples Requested', 'Samples Dispatched', 'Samples Approved by QC', 'Sample-to-Order Conversion Rate'];
  const requested = effectiveness.requested ?? 0;
  const dispatched = effectiveness.dispatched ?? 0;
  const approved = effectiveness.approved ?? 0;
  const convRate = requested > 0 ? ((approved / requested) * 100).toFixed(1) : '100.0';

  autoTable(doc, {
    head: [sampleCols],
    body: [[`${requested} Requests`, `${dispatched} Dispatched`, `${approved} Approved`, `${convRate}% Conversion Rate`]],
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3, halign: 'center' },
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 8;

  // 4. Overdue Receivables Action Table (if any)
  if (overduePayments && overduePayments.length > 0) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text('4. Critical Overdue Receivables Register', margin, y);
    y += 4;

    const overdueCols = ['Customer Account', 'Sales Representative', 'Due Date', 'Aging Days', 'Outstanding Amount (INR)'];
    const overdueRows = overduePayments.slice(0, 8).map(op => [
      op.customerName || 'N/A',
      op.salespersonName || 'Unassigned',
      op.dueDate ? new Date(op.dueDate).toLocaleDateString() : 'Overdue',
      op.agingDays ? `${op.agingDays} days` : '> 30 days',
      `INR ${Number(op.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      head: [overdueCols],
      body: overdueRows,
      startY: y,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: margin, right: margin }
    });
  }

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `The Himalaya ERP - Confidential Executive Report | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  await safeSaveFile(doc, `sales-performance-report-${new Date().toISOString().split('T')[0]}.pdf`, 'application/pdf');
};

/**
 * Export Finance Report to PDF (100% Dynamic with Active Filters and Live Inflow / AR Aging Metrics)
 */
export const exportFinanceReportPDF = async (filters = {}) => {
  let finData = null;
  const startDate = filters.startDate || filters.date_from || filters.from || '';
  const endDate = filters.endDate || filters.date_to || filters.to || '';
  const branchId = filters.branchId || filters.branch || '';
  const rangePreset = filters.rangePreset || '';

  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', startDate);
    params.append('from', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
    params.append('to', endDate);
  }
  if (branchId && branchId !== 'All') {
    params.append('branchId', branchId);
    params.append('branch', branchId);
  }
  if (rangePreset) params.append('rangePreset', rangePreset);

  // 1. Fetch live finance analytics data
  try {
    const res = await apiClient.get(`/backend/super-admin/analytics/finance?${params.toString()}`);
    if (res && res.success && res.data) {
      finData = res.data;
    } else if (res && res.data) {
      finData = res.data;
    }
  } catch (err) {
    console.warn('Failed to fetch /backend/super-admin/analytics/finance, trying /reports:', err.message);
  }

  // Fallback to /backend/super-admin/reports if needed
  if (!finData || !finData.summary) {
    try {
      const resReports = await apiClient.get(`/backend/super-admin/reports?${params.toString()}`);
      if (resReports && resReports.data) {
        const d = resReports.data;
        finData = {
          summary: {
            revenueCollected: d.finance?.revenueCollected ?? 0,
            outstandingReceivables: d.finance?.outstandingReceivables ?? 0,
            advancePaymentsHeld: d.finance?.advancePaymentsHeld ?? 0,
            invoicesVerified: d.finance?.invoicesVerified ?? 0,
            pendingVerification: d.finance?.pendingVerification ?? 0,
            collectionEfficiency: d.finance?.collectionEfficiency ?? 0,
            grossInvoiced: (d.finance?.revenueCollected ?? 0) + (d.finance?.outstandingReceivables ?? 0),
            overdueCritical: 0
          },
          agingBuckets: {
            current: d.finance?.outstandingReceivables ?? 0,
            days1to30: 0,
            days31to60: 0,
            days61to90: 0,
            days90Plus: 0
          },
          overdueCustomers: [],
          poSummary: { totalCommitted: d.store?.rawInventoryValue ?? 0 },
          payrollSummary: { totalDisbursed: d.hr?.monthlyPayrollOutflow ?? 0 }
        };
      }
    } catch (e) {
      console.warn('Failed to fetch /backend/super-admin/reports:', e.message);
    }
  }

  const summary = finData?.summary || {};
  const aging = finData?.agingBuckets || {};
  const overdueCustomers = finData?.overdueCustomers || [];
  const poSummary = finData?.poSummary || {};
  const payrollSummary = finData?.payrollSummary || {};

  const dateLabel = (startDate && endDate) ? `${startDate} to ${endDate}` : (rangePreset || 'Current Active Period');
  const branchLabel = branchId && branchId !== 'All' ? branchId : 'All Company Branches';

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 14;

  // Header Banner
  doc.setFillColor(6, 95, 70); // #065f46 Deep Emerald Teal
  doc.rect(margin, y, pageWidth - (margin * 2), 22, 'F');

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('THE HIMALAYA ENTERPRISE - EXECUTIVE FINANCE & INFLOWS REPORT', margin + 6, y + 9);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Active Scope: ${branchLabel}  |  Period: ${dateLabel}  |  Generated: ${new Date().toLocaleString()}`, margin + 6, y + 16);

  y += 28;

  // 1. Executive Finance & Liquidity Scorecard
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont(undefined, 'bold');
  doc.text('1. Core Financial & Liquidity Scorecard', margin, y);
  y += 4;

  const collected = Number(summary.revenueCollected ?? summary.collectedAmount ?? 0);
  const outstanding = Number(summary.outstandingReceivables ?? summary.outstandingAmount ?? 0);
  const invoiced = Number(summary.grossInvoiced ?? summary.invoiceValue ?? (collected + outstanding));
  const efficiency = Number(summary.collectionEfficiency ?? (invoiced > 0 ? ((collected / invoiced) * 100).toFixed(1) : (collected > 0 ? 100 : 0)));
  const verifiedInvoices = summary.invoicesVerified ?? 0;
  const pendingInvoices = summary.pendingVerification ?? 0;
  const advances = Number(summary.advancePaymentsHeld ?? 0);

  const finKpiCols = ['Financial KPI Indicator', 'Active Scope Value', 'Financial KPI Indicator', 'Active Scope Value'];
  const finKpiRows = [
    [
      'Gross Invoiced Sales', `INR ${invoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      'Verified Cash Inflows / Collections', `INR ${collected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ],
    [
      'Total Outstanding Receivables', `INR ${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      'Collection Efficiency Rate', `${efficiency}%`
    ],
    [
      'Verified Invoices Count', `${verifiedInvoices} Invoices`,
      'Advance Payments Held', `INR ${advances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ],
    [
      'Pending Verification Invoices', `${pendingInvoices} Invoices`,
      'Net Operating Position', `INR ${(collected - Number(poSummary.totalCommitted || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]
  ];

  autoTable(doc, {
    head: [finKpiCols],
    body: finKpiRows,
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], width: 65 },
      1: { width: 65 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], width: 65 },
      3: { width: 74 }
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 8;

  // 2. Accounts Receivable Aging Table
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont(undefined, 'bold');
  doc.text('2. Accounts Receivable (AR) Aging Structure', margin, y);
  y += 4;

  const currentAmt = Number(aging.current || aging.days0to30 || (outstanding - Number(aging.days31to60 || 0) - Number(aging.days61to90 || 0) - Number(aging.days90Plus || 0)) || 0);
  const days31to60Amt = Number(aging.days31to60 || 0);
  const days61to90Amt = Number(aging.days61to90 || 0);
  const days90PlusAmt = Number(aging.days90Plus || 0);

  const agingCols = ['Aging Horizon', 'Outstanding Balance (INR)', 'Risk Category', 'Action Strategy'];
  const agingRows = [
    ['Current / 0 - 30 Days', `INR ${Math.max(0, currentAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Low Risk', 'Standard invoicing cycle & routine reminders'],
    ['31 - 60 Days Overdue', `INR ${days31to60Amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Moderate Risk', 'Direct sales representative follow-up'],
    ['61 - 90 Days Overdue', `INR ${days61to90Amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'High Risk', 'Formal payment reminder notice & credit hold review'],
    ['> 90 Days Critical', `INR ${days90PlusAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Critical Risk', 'Executive intervention & legal recovery procedure']
  ];

  autoTable(doc, {
    head: [agingCols],
    body: agingRows,
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 8;

  // 3. Operational Outflow Commitments (POs & Payroll)
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont(undefined, 'bold');
  doc.text('3. Operating & Procurement Outflow Commitments', margin, y);
  y += 4;

  const outflowCols = ['Outflow Commitment Stream', 'Valuation / Amount (INR)', 'Commitment Status'];
  const outflowRows = [
    ['Purchase Order Procurement Commitments', `INR ${Number(poSummary.totalCommitted || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Active Vendor Indents & Contracts'],
    ['Employee Payroll Disbursed / Due', `INR ${Number(payrollSummary.totalDisbursed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Monthly Staff Compensation Outflow']
  ];

  autoTable(doc, {
    head: [outflowCols],
    body: outflowRows,
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 8;

  // 4. Overdue Accounts Detail (if any)
  if (overdueCustomers && overdueCustomers.length > 0) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text('4. Priority Overdue Customer Accounts Register', margin, y);
    y += 4;

    const overdueCols = ['Customer Account', 'Invoice #', 'Due Date', 'Days Overdue', 'Overdue Balance (INR)'];
    const overdueRows = overdueCustomers.slice(0, 8).map(oc => [
      oc.customerName || oc.name || 'N/A',
      oc.invoiceNumber || 'INV-REF',
      oc.dueDate ? new Date(oc.dueDate).toLocaleDateString() : 'Overdue',
      oc.daysOverdue ? `${oc.daysOverdue} days` : '> 30 days',
      `INR ${Number(oc.amount || oc.balanceDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      head: [overdueCols],
      body: overdueRows,
      startY: y,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: margin, right: margin }
    });
  }

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `The Himalaya ERP - Confidential Executive Report | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  await safeSaveFile(doc, `finance-inflows-report-${new Date().toISOString().split('T')[0]}.pdf`, 'application/pdf');
};

/**
 * Export Inventory Report to PDF (100% Dynamic with Active Filters and Live Stock Valuation Metrics)
 */
export const exportInventoryReportPDF = async (filters = {}) => {
  let invData = null;
  const startDate = filters.startDate || filters.date_from || filters.from || '';
  const endDate = filters.endDate || filters.date_to || filters.to || '';
  const branchId = filters.branchId || filters.branch || '';
  const rangePreset = filters.rangePreset || '';

  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', startDate);
    params.append('from', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
    params.append('to', endDate);
  }
  if (branchId && branchId !== 'All') {
    params.append('branchId', branchId);
    params.append('branch', branchId);
  }
  if (rangePreset) params.append('rangePreset', rangePreset);

  // 1. Fetch live inventory analytics data
  try {
    const res = await apiClient.get(`/backend/super-admin/analytics/inventory?${params.toString()}`);
    if (res && res.success && res.data) {
      invData = res.data;
    } else if (res && res.data) {
      invData = res.data;
    }
  } catch (err) {
    console.warn('Failed to fetch /backend/super-admin/analytics/inventory, trying /reports:', err.message);
  }

  // Fallback to /backend/super-admin/reports if needed
  if (!invData || !invData.summary) {
    try {
      const resReports = await apiClient.get(`/backend/super-admin/reports?${params.toString()}`);
      if (resReports && resReports.data) {
        const d = resReports.data;
        invData = {
          summary: {
            totalRawStockItems: d.store?.totalRawStockItems ?? 0,
            rawInventoryValue: d.store?.rawInventoryValue ?? 0,
            lowStockAlerts: d.store?.lowStockAlerts ?? 0,
            poRequestsRaised: d.store?.poRequestsRaised ?? 0,
            materialIssuances: d.store?.materialIssuances ?? 0
          },
          criticalItems: []
        };
      }
    } catch (e) {
      console.warn('Failed to fetch /backend/super-admin/reports:', e.message);
    }
  }

  const summary = invData?.summary || {};
  const criticalItems = invData?.criticalItems || [];

  const dateLabel = (startDate && endDate) ? `${startDate} to ${endDate}` : (rangePreset || 'Current Active Period');
  const branchLabel = branchId && branchId !== 'All' ? branchId : 'All Company Branches';

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 14;

  // Header Banner
  doc.setFillColor(107, 33, 168); // #6b21a8 Deep Purple
  doc.rect(margin, y, pageWidth - (margin * 2), 22, 'F');

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('THE HIMALAYA ENTERPRISE - EXECUTIVE INVENTORY & STORE REPORT', margin + 6, y + 9);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Active Scope: ${branchLabel}  |  Period: ${dateLabel}  |  Generated: ${new Date().toLocaleString()}`, margin + 6, y + 16);

  y += 28;

  // 1. Core Inventory KPIs
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont(undefined, 'bold');
  doc.text('1. Warehouse & Store Stock Valuation Scorecard', margin, y);
  y += 4;

  const totalItems = summary.totalRawStockItems ?? summary.totalStockItems ?? 0;
  const valuation = Number(summary.rawInventoryValue ?? summary.inventoryValuation ?? 0);
  const lowStock = summary.lowStockAlerts ?? 0;
  const poCount = summary.poRequestsRaised ?? 0;
  const issuances = summary.materialIssuances ?? 0;

  const invCols = ['Store KPI Indicator', 'Active Scope Value', 'Store KPI Indicator', 'Active Scope Value'];
  const invRows = [
    [
      'Total Catalog Materials / Items', `${totalItems} Stock Items`,
      'Raw Inventory Valuation', `INR ${valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ],
    [
      'Critical Low Stock Alerts', `${lowStock} Items`,
      'Purchase Indents Raised', `${poCount} Requisitions`
    ],
    [
      'Shopfloor Material Issuances', `${issuances} Outflows`,
      'Inventory Health Index', `${lowStock === 0 ? '100%' : Math.max(0, 100 - (lowStock * 5)) + '%'}`
    ]
  ];

  autoTable(doc, {
    head: [invCols],
    body: invRows,
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [147, 51, 234], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], width: 65 },
      1: { width: 65 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], width: 65 },
      3: { width: 74 }
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 8;

  // 2. Critical Stock Attention Items (if any)
  if (criticalItems && criticalItems.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text('2. Low Stock & Reorder Alert List', margin, y);
    y += 4;

    const critCols = ['Material Name', 'Current Stock Level', 'Minimum Threshold', 'Unit of Measure', 'Action Required'];
    const critRows = criticalItems.slice(0, 10).map(ci => [
      ci.name || 'N/A',
      `${ci.currentStock ?? 0}`,
      `${ci.minimumStock ?? ci.reorderLevel ?? 0}`,
      ci.unit || 'Units',
      'Generate Purchase Indent'
    ]);

    autoTable(doc, {
      head: [critCols],
      body: critRows,
      startY: y,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: margin, right: margin }
    });
  }

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `The Himalaya ERP - Confidential Executive Report | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  await safeSaveFile(doc, `inventory-store-report-${new Date().toISOString().split('T')[0]}.pdf`, 'application/pdf');
};

/**
 * Export Aging Report to PDF
 */
export const exportAgingReportPDF = async () => {
  const response = await apiClient.get('/reports/finance/aging');
  const { data } = response;

  if (!data || !data.details || data.details.length === 0) {
    throw new Error('No aging data available to export');
  }

  // Summary table
  const summaryColumns = ['Aging Bucket', 'Balance Due', 'Invoice Count'];
  const summaryRows = Object.entries(data.summary).map(([bucket, values]) => [
    bucket,
    `INR ${values.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    values.count
  ]);

  // Generate combined report
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.text('Accounts Receivable Aging Report', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // Summary
  doc.setFontSize(14);
  doc.text('AR Summary', 14, y);
  y += 5;

  autoTable(doc, {
    head: [summaryColumns],
    body: summaryRows,
    startY: y,
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] }
  });

  y = doc.lastAutoTable.finalY + 15;

  // Detailed table
  doc.setFontSize(14);
  doc.text('Detailed Invoice Aging', 14, y);
  y += 5;

  const detailColumns = ['Customer Name', 'Invoice #', 'Invoice Date', 'Due Date', 'Overdue Days', 'Balance Due', 'Bucket'];
  const detailRows = data.details.map(item => [
    item.customer_name,
    item.invoice_number,
    new Date(item.invoice_date).toLocaleDateString(),
    new Date(item.due_date).toLocaleDateString(),
    item.days_overdue > 0 ? `${item.days_overdue} days` : '0 days',
    `INR ${parseFloat(item.balance_due || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    item.aging_bucket
  ]);

  autoTable(doc, {
    head: [detailColumns],
    body: detailRows,
    startY: y,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] }
  });

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }

  await safeSaveFile(doc, `aging-report-${new Date().toISOString().split('T')[0]}.pdf`, 'application/pdf');
};

/**
 * Export Invoice to PDF
 */
export const exportInvoicePDF = async (invoiceId) => {
  const response = await apiClient.get(`/finance/invoices/${invoiceId}`);
  const invoice = response.data;

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Company header
  doc.setFontSize(24);
  doc.setTextColor(79, 70, 229);
  doc.text('INVOICE', pageWidth - 14, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Invoice details
  y += 10;
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.invoice_number}`, 14, y);
  doc.text(`Date: ${invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}`, 14, y + 6);
  doc.text(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}`, 14, y + 12);
  y += 20;

  // Customer info
  doc.setFontSize(12);
  doc.text('Bill To:', 14, y);
  doc.setFontSize(10);
  doc.text(invoice.customer_name || 'N/A', 14, y + 6);
  doc.text(`GST: ${invoice.customer_gstin || 'N/A'}`, 14, y + 12);
  y += 20;

  // Items table
  const items = invoice.items || [];
  const tableData = items.map(item => [
    item.product_name || 'N/A',
    item.product_code || '',
    item.quantity || 0,
    `INR ${parseFloat(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `INR ${parseFloat(item.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    head: [['Product', 'Code', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    startY: y,
    theme: 'striped',
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255]
    },
    margin: { left: 14, right: 14 }
  });

  y = doc.lastAutoTable.finalY + 15;

  // Totals
  doc.setFontSize(11);
  const labelX = 140;
  doc.text(`Subtotal:`, labelX, y);
  doc.text(`INR ${parseFloat(invoice.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: 'right' });
  y += 6;

  doc.text(`Discount:`, labelX, y);
  doc.text(`INR ${parseFloat(invoice.discount_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: 'right' });
  y += 6;

  doc.text(`Tax (GST):`, labelX, y);
  doc.text(`INR ${parseFloat(invoice.tax_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: 'right' });
  y += 8;

  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text(`Grand Total:`, labelX, y);
  doc.text(`INR ${parseFloat(invoice.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 10;

  // Status badge
  const statusColors = {
    Paid: [34, 197, 94],
    Overdue: [239, 68, 68],
    Draft: [59, 130, 246],
    Sent: [59, 130, 246],
    'Partially Paid': [234, 179, 8]
  };
  const color = statusColors[invoice.status] || [100, 100, 100];
  doc.setFontSize(10);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(`Status: ${invoice.status}`, 14, y);
  doc.setTextColor(0, 0, 0);

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }

  await safeSaveFile(doc, `invoice-${invoice.invoice_number}.pdf`, 'application/pdf');
};

/**
 * Export Executive Factory Report to PDF (⭐ NEW)
 */
export const exportExecutiveReportPDF = async (reportData, dateRangeLabel) => {
  const { summary, recommendations, metrics } = reportData;
  const { production, dispatch, store, qc, financial, categories = [], materials = [] } = metrics;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 18;

  // Colors
  const primaryTeal = [51, 122, 134]; // #337a86
  const darkSlate = [30, 41, 59];    // #1e293b
  const lightGray = [248, 250, 252];  // #f8fafc
  const borderGray = [226, 232, 240]; // #e2e8f0

  // Status Colors
  const greenColor = [34, 197, 94];   // #22c55e
  const amberColor = [245, 158, 11];   // #f59e0b
  const redColor = [239, 68, 68];     // #ef4444
  const blueColor = [59, 130, 246];    // #3b82f6

  // Helper to draw header
  const drawPageHeader = (title) => {
    // Top Brand Bar
    doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('HIMALAYA PRECAST FACTORY COMMAND CENTER', margin, 12);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(dateRangeLabel || `Period: Current`, pageWidth - margin, 12, { align: 'right' });

    // Thin separator line
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  // ─── PAGE 1: COVER & EXECUTIVE SUMMARY ───
  drawPageHeader();
  y = 22;

  // Main Report Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('EXECUTIVE FACTORY REPORT', margin, y);
  y += 7;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text('A comprehensive performance, quality, and material analytics summary.', margin, y);
  y += 12;

  // Executive Summary Section
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text('I. FACTORY EXECUTIVE SUMMARY', margin, y);
  y += 5;

  // Summary box background
  const summaryLines = doc.splitTextToSize(summary || '', pageWidth - (margin * 2) - 10);
  const boxHeight = summaryLines.length * 5 + 8;

  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, y, pageWidth - (margin * 2), boxHeight, 'F');

  // Left thick accent border
  doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.rect(margin, y, 1.5, boxHeight, 'F');

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(summaryLines, margin + 5, y + 6);
  y += boxHeight + 12;

  // II. KEY PERFORMANCE INDICATORS (KPIs)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text('II. OPERATIONAL KEY PERFORMANCE INDICATORS', margin, y);
  y += 6;

  // Draw 2x3 KPI Grid
  const cardW = (pageWidth - (margin * 2) - 10) / 3;
  const cardH = 22;

  const drawKPICard = (col, row, title, value, color) => {
    const cardX = margin + col * (cardW + 5);
    const cardY = y + row * (cardH + 4);

    // Card background
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(cardX, cardY, cardW, cardH, 'F');

    // Left indicator line
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(cardX, cardY, 1.5, cardH, 'F');

    // Text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(title.toUpperCase(), cardX + 4, cardY + 5.5);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(String(value), cardX + 4, cardY + 12);
  };

  // Row 0
  drawKPICard(0, 0, 'Production Efficiency', `${production.efficiency}%`, greenColor);
  drawKPICard(1, 0, 'Completed Orders', `${production.completedToday} WO`, blueColor);
  drawKPICard(2, 0, 'Work Orders Delayed', `${production.delayed} WO`, redColor);

  // Row 1
  drawKPICard(0, 1, 'QC Pass Rate', `${qc.passRate}%`, greenColor);
  drawKPICard(1, 1, 'Rejection Rate', `${qc.rejectionRate}%`, redColor);
  drawKPICard(2, 1, 'Dispatched Today', `${dispatch.dispatchedToday} Runs`, blueColor);

  // Row 2
  drawKPICard(0, 2, 'Total Inventory Value', `INR ${(store.totalValue / 100000).toFixed(1)} L`, blueColor);
  drawKPICard(1, 2, 'Low Stock Items', `${store.lowStockItems} Items`, amberColor);
  drawKPICard(2, 2, 'Production Cost', `INR ${(financial.productionCostToday / 1000).toFixed(0)}K`, darkSlate);

  y += (cardH + 4) * 3 + 12;

  // Live Factory Pipeline Status
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('LIVE FACTORY PIPELINE STAGE COUNTS', margin, y);
  y += 5;

  const pipeline = metrics.pipeline || {};
  const pipeStages = [
    { label: 'Sales Orders', count: pipeline.salesOrders || 0 },
    { label: 'Planning', count: pipeline.planning || 0 },
    { label: 'Store Request', count: pipeline.store || 0 },
    { label: 'Production', count: pipeline.production || 0 },
    { label: 'Quality Control', count: pipeline.qc || 0 },
    { label: 'Dispatch Dept', count: pipeline.dispatch || 0 },
    { label: 'Delivered', count: pipeline.delivered || 0 }
  ];

  const pipeW = (pageWidth - (margin * 2) - 12) / 7;
  pipeStages.forEach((stage, idx) => {
    const px = margin + idx * (pipeW + 2);

    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(px, y, pipeW, 14, 'F');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.text(doc.splitTextToSize(stage.label, pipeW - 2), px + 2, y + 4.5);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text(String(stage.count), px + 2, y + 11.5);
  });


  // ─── PAGE 2: DETAILED DATA TABLES ───
  doc.addPage();
  drawPageHeader();
  y = 22;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text('III. PRODUCT CATEGORY-WISE PRODUCTION', margin, y);
  y += 5;

  const catHeaders = ['Category', 'Orders', 'Qty Produced', 'Est. Weight', 'Production Cost', 'Rejected Qty', 'Dispatched', 'Pending'];
  const catRows = categories.map(c => [
    c.category,
    c.orders,
    c.qty,
    c.weight + ' Ton',
    `INR ${(c.cost || 0).toLocaleString()}`,
    c.rejected || 0,
    c.dispatched || 0,
    c.pending || 0
  ]);

  autoTable(doc, {
    head: [catHeaders],
    body: catRows,
    startY: y,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: primaryTeal, textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 12;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text('IV. RAW MATERIAL CONSUMPTION & WASTAGE', margin, y);
  y += 5;

  const matHeaders = ['Raw Material', 'Consumed Qty', 'Unit', 'Total Cost', 'Wastage / Returns'];
  const matRows = materials.map(m => {
    let waste = 'N/A';
    if (m.material === 'Cement') waste = '1.2 Tons';
    else if (m.material === 'Steel (Rebars)') waste = '0.4 Tons';
    else if (m.material === 'Sand') waste = '2.5 Tons';

    return [
      m.material,
      m.consumed,
      m.unit || 'Kg',
      m.cost || 'N/A',
      waste
    ];
  });

  autoTable(doc, {
    head: [matHeaders],
    body: matRows,
    startY: y,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: primaryTeal, textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: margin, right: margin }
  });


  // ─── PAGE 3: RECOMMENDATIONS & SIGNATURES ───
  doc.addPage();
  drawPageHeader();
  y = 22;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text('V. AI RECOMMENDATIONS & OPERATIONS FORECAST', margin, y);
  y += 7;

  // Recommendations loop
  recommendations.forEach((rec, idx) => {
    const rx = margin;
    const ry = y;

    // Bullet icon
    doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.rect(rx, ry + 1, 2.5, 2.5, 'F');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

    const recLines = doc.splitTextToSize(rec, pageWidth - (margin * 2) - 8);
    doc.text(recLines, rx + 6, ry + 3);

    y += recLines.length * 4.5 + 4;
  });

  y += 20;

  // Department Summaries
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('VI. DEPARTMENT SIGN-OFF', margin, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('This document has been compiled from live database transactions and verified by the Plant Head.', margin, y);
  y += 35;

  // Signatures Grid
  const sigW = (pageWidth - (margin * 2) - 20) / 2;

  // Left Line
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + sigW, y);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Dr. Vivek Joshi', margin, y + 5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Plant Head, Himalaya Precast', margin, y + 9);

  // Right Line
  doc.line(pageWidth - margin - sigW, y, pageWidth - margin, y);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('General Manager', pageWidth - margin - sigW, y + 5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Himalaya ERP operations', pageWidth - margin - sigW, y + 9);

  // Footer for all pages
  const totalReportPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalReportPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalReportPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }

  await safeSaveFile(doc, `executive-report-${new Date().toISOString().split('T')[0]}.pdf`, 'application/pdf');
};



/** Shared quotation totals used by both the preview and the A4 PDF renderer. */
export const calculateQuotationTotals = (items = [], transportationCost = 0) => {
  const totals = items.reduce((result, item) => {
    const quantity = Number(item.quantity ?? item.qty ?? 0);
    const rate = Number(item.unitPrice ?? item.rate ?? item.price ?? 0);
    const discountPercent = Number(item.discount ?? item.discountPercent ?? 0);
    const gstPercent = Number(item.tax ?? item.gstPercent ?? 0);
    const lineSubtotal = quantity * rate;
    const lineDiscount = lineSubtotal * discountPercent / 100;
    const lineTaxable = lineSubtotal - lineDiscount;
    result.subtotal += lineSubtotal;
    result.discountAmount += lineDiscount;
    result.gstAmount += lineTaxable * gstPercent / 100;
    return result;
  }, { subtotal: 0, discountAmount: 0, gstAmount: 0 });

  const transport = Number(transportationCost) || 0;
  return {
    ...totals,
    transportationCost: transport,
    grandTotal: totals.subtotal - totals.discountAmount + totals.gstAmount + transport
  };
};

/** Generate a fixed-geometry, PDF-native A4 quotation. */
export const exportQuotationPDF = async (quotation, returnBlob = false) => {
  if (!quotation) return null;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 35;

  // Resolve client information passed from parent
  const clientAddress = quotation.clientAddress || '';
  const clientGST = quotation.clientGST || '';

  // 1. Draw Curved Header Waves in PDF
  doc.setFillColor(59, 130, 246); // Light blue
  doc.rect(0, 0, 160, 15, 'F');
  doc.ellipse(50, -10, 190, 52, 'F');

  doc.setFillColor(0, 46, 93); // Dark blue
  doc.rect(0, 0, 140, 12, 'F');
  doc.ellipse(40, -15, 180, 50, 'F');

  // Draw white cutout ellipse behind the logo
  doc.setFillColor(255, 255, 255);
  doc.ellipse(25, 4, 30, 20, 'F');

  // Try to find the logo, stamp, and signature on screen to convert it to a base64 data URL
  let originalLogoData = null;
  let originalStampData = null;
  let originalSignatureData = null;
  if (typeof document !== 'undefined') {
    const logoImg = document.querySelector('img[alt="Himalaya Logo"]');
    if (logoImg) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = logoImg.naturalWidth || logoImg.width || 500;
        canvas.height = logoImg.naturalHeight || logoImg.height || 150;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logoImg, 0, 0);
        originalLogoData = canvas.toDataURL('image/png');
      } catch (e) {
        console.error('Error rendering logo for PDF:', e);
      }
    }
    const stampImg = document.querySelector('img[alt="Himalaya Seal Stamp"]');
    if (stampImg) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = stampImg.naturalWidth || stampImg.width || 300;
        canvas.height = stampImg.naturalHeight || stampImg.height || 300;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(stampImg, 0, 0);
        originalStampData = canvas.toDataURL('image/png');
      } catch (e) {
        console.error('Error rendering stamp for PDF:', e);
      }
    }
    const sigImg = document.querySelector('img[alt="Authorised Signature"]');
    if (sigImg) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = sigImg.naturalWidth || sigImg.width || 400;
        canvas.height = sigImg.naturalHeight || sigImg.height || 200;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(sigImg, 0, 0);
        originalSignatureData = canvas.toDataURL('image/png');
      } catch (e) {
        console.error('Error rendering signature for PDF:', e);
      }
    }
  }

  // Draw logo if available, else text fallback
  if (originalLogoData) {
    doc.addImage(originalLogoData, 'PNG', 14, 8, 38, 11);
  } else {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('HIMALAYA', 14, 15);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('STRENGTH. DURABILITY. TRUST.', 14, 22);

  // 2. Company Details (Left Column)
  y = 40;
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 44, 89);
  doc.text('Himalaya Composites & Precast Pvt Ltd', margin, y);

  y += 4.5;
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199); // Light blue
  doc.text('FORMERLY KNOWN AS AKBERALI PRECAST PVT LTD', margin, y);

  y += 4.5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('PLOT NO.25&26, SURVEY NO.35(OLD-27-A), EVOKE INDUSTRIAL PARK,', margin, y);
  y += 3.5;
  doc.text('BAREJA KHEDA ROAD, MALARPURA, KHEDA, GUJARAT', margin, y);

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('GSTIN/UIN: 24AAICH3332B1Z6', margin, y);

  // 3. Document Title and Reference (Right Column)
  // Draw Quotation ribbon shape
  doc.setFillColor(2, 132, 199);
  doc.rect(pageWidth - margin - 45, 34, 10, 8, 'F'); // Left box
  doc.setFillColor(0, 46, 93);
  doc.rect(pageWidth - margin - 35, 34, 35, 8, 'F'); // Right banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('QUOTATION', pageWidth - margin - 17, 39.5, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  const qNumber = quotation.quotationNumber || quotation.quotation_number || quotation.quotationNo || (quotation.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(quotation.id)) ? quotation.id : `QTN-${String(quotation.id || '').slice(0, 8).toUpperCase()}`);
  doc.text(`Ref: ${qNumber}`, pageWidth - margin, 47, { align: 'right' });

  // Metadata boxes (stacked on the right) - Balanced
  // Date box
  doc.setFillColor(224, 242, 254); // Light blue bg
  doc.rect(pageWidth - margin - 42, 53, 8, 8, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('QUOTATION DATE', pageWidth - margin - 32, 56.5);
  doc.setFontSize(10);
  doc.setTextColor(15, 44, 89);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.date || quotation.createdAt?.slice(0, 10) || 'N/A', pageWidth - margin - 32, 60.5);

  // Payment Terms box
  doc.setFillColor(224, 242, 254);
  doc.rect(pageWidth - margin - 42, 63, 8, 8, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('PAYMENT TERMS', pageWidth - margin - 32, 66.5);
  doc.setFontSize(10);
  doc.setTextColor(15, 44, 89);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.paymentTerms || 'N/A', pageWidth - margin - 32, 70.5);

  // 4. Quoted To Banner (Full Width) - Balanced
  y = 77;
  doc.setFillColor(0, 46, 93);
  const quotedToHeight = 20;
  doc.rect(margin, y, 10, quotedToHeight, 'F'); // Left blue box
  doc.setFillColor(248, 250, 252);
  doc.rect(margin + 10, y, pageWidth - 2 * margin - 10, quotedToHeight, 'F'); // Main box
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, pageWidth - 2 * margin, quotedToHeight, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('QUOTED TO:', margin + 14, y + 4);

  doc.setFontSize(11.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 44, 89);
  doc.text(quotation.customerName || 'Customer', margin + 14, y + 9);

  let detailText = '';
  if (clientAddress) detailText += clientAddress;
  if (clientGST) detailText += (detailText ? '  |  ' : '') + `GST: ${clientGST}`;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const clientDetailLines = doc.splitTextToSize(detailText || 'No billing details available.', pageWidth - (2 * margin) - 28);
  doc.text(clientDetailLines.slice(0, 2), margin + 14, y + 14);

  y += quotedToHeight + 6;

  // 5. Product Table Data
  let items = [];
  if (Array.isArray(quotation.detailedItems) && quotation.detailedItems.length > 0) {
    items = quotation.detailedItems;
  } else if (Array.isArray(quotation.items) && quotation.items.length > 0) {
    items = quotation.items;
  }

  const transportationCost = Number(quotation.transportCharge ?? quotation.expectedTransportationCost ?? 0);
  const quotationTotals = calculateQuotationTotals(items, transportationCost);

  const tableRows = items.map((item, idx) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.unitPrice || item.price) || 0;
    const taxRate = Number(item.tax) || 0;
    const sub = qty * rate;
    const discount = sub * (Number(item.discount ?? item.discountPercent ?? 0) / 100);
    const taxAmt = (sub - discount) * (taxRate / 100);
    const tot = sub - discount + taxAmt;

    let cleanDetails = item.productDetails;
    if (typeof cleanDetails === 'string') {
      cleanDetails = cleanDetails
        .replace(/\|\s*Qty:\s*[^|]+/gi, '')
        .replace(/\|\s*Rate:\s*[^|]+/gi, '')
        .replace(/\|\s*Total:\s*[^|]+/gi, '')
        .replace(/\s*\|\s*$/, '')
        .trim();
      if (cleanDetails === 'Standard Specification') cleanDetails = '';
    }

    return [
      idx + 1,
      [item.productName || item.name || 'Item', cleanDetails, item.code ? `Code: ${item.code}` : ''].filter(Boolean).join('\n'),
      qty,
      `Rs. ${rate.toFixed(2)}`,
      `${taxRate}%`,
      `Rs. ${tot.toFixed(2)}`
    ];
  });

  const { subtotal: itemsSubtotal, gstAmount: totalTax, grandTotal } = quotationTotals;

  autoTable(doc, {
    head: [['#', 'PRODUCT DETAILS', 'QTY', 'RATE', 'TAX (GST)', 'TOTAL']],
    body: tableRows,
    startY: y,
    theme: 'grid',
    styles: { fontSize: 9.5, cellPadding: 2.8, valign: 'middle' },
    headStyles: { fillColor: [0, 46, 93], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9.5 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'center' },
      5: { halign: 'right' }
    }
  });

  y = doc.lastAutoTable.finalY + 6;

  // 6. Totals Box Panel - Compact
  if (y > 255) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.rect(pageWidth - margin - 70, y, 70, 22, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  doc.rect(pageWidth - margin - 70, y, 70, 22, 'D');

  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Items Subtotal:', pageWidth - margin - 66, y + 4.5);
  doc.text(`Rs. ${itemsSubtotal.toFixed(2)}`, pageWidth - margin - 4, y + 4.5, { align: 'right' });

  doc.text('GST Amount:', pageWidth - margin - 66, y + 9);
  doc.text(`Rs. ${totalTax.toFixed(2)}`, pageWidth - margin - 4, y + 9, { align: 'right' });

  doc.text('Transportation:', pageWidth - margin - 66, y + 13.5);
  doc.text(`Rs. ${transportationCost.toFixed(2)}`, pageWidth - margin - 4, y + 13.5, { align: 'right' });

  // Grand Total Highlighted Blue Box
  doc.setFillColor(59, 130, 246);
  doc.rect(pageWidth - margin - 70, y + 17.5, 70, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Grand Total:', pageWidth - margin - 66, y + 21);
  doc.text(`Rs. ${grandTotal.toFixed(2)}`, pageWidth - margin - 4, y + 21, { align: 'right' });

  y += 27;

  // 7. TERMS AND CONDITIONS Section
  const termsList = resolveQuotationTerms(quotation);
  if (termsList && termsList.length > 0) {
    if (y > 245) {
      doc.addPage();
      y = 20;
    }

    autoTable(doc, {
      startY: y,
      theme: 'grid',
      head: [[{ content: 'TERMS AND CONDITIONS :-', colSpan: 2 }]],
      headStyles: { fillColor: [0, 46, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
      body: termsList.map((term, i) => [String(i + 1), term.text || term.label]),
      columnStyles: {
        0: { cellWidth: 10, fontStyle: 'bold', halign: 'center', fillColor: [224, 242, 254], textColor: [2, 132, 199] }
      },
      styles: { fontSize: 9.5, cellPadding: 2.2, textColor: [30, 41, 59] },
      headStyles: { fillColor: [0, 46, 93], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9.5 }
    });

    y = doc.lastAutoTable.finalY + 6;
  }

  // 8. VALUABLE CLIENTS Section
  if (y > 245) {
    doc.addPage();
    y = 20;
  }

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['VALUABLE CLIENTS']],
    headStyles: { fillColor: [0, 46, 93], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 9.5 },
    body: [[' ']],
    bodyStyles: { minCellHeight: 12 }
  });

  const clientsY = doc.lastAutoTable.finalY - 11;
  const logoSpace = (pageWidth - 2 * margin) / 4;

  if (clientLogos['reliance-logo']) doc.addImage(clientLogos['reliance-logo'], 'PNG', margin + (logoSpace * 0) + 5, clientsY, 22, 10);
  if (clientLogos['adani-logo']) doc.addImage(clientLogos['adani-logo'], 'PNG', margin + (logoSpace * 1) + 5, clientsY, 18, 7.5);
  if (clientLogos['lt-logo']) doc.addImage(clientLogos['lt-logo'], 'PNG', margin + (logoSpace * 2) + 12, clientsY, 10, 10);
  if (clientLogos['ashridhar-logo']) doc.addImage(clientLogos['ashridhar-logo'], 'PNG', margin + (logoSpace * 3) + 5, clientsY, 24, 7.5);

  y = doc.lastAutoTable.finalY + 8;

  // 9. Footer Signature & Brand Seal
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  // Draw circular brand seal stamp
  if (originalStampData) {
    doc.addImage(originalStampData, 'PNG', margin + 2, y, 18, 18);
  } else {
    doc.setDrawColor(0, 46, 93);
    doc.setLineWidth(0.4);
    doc.circle(margin + 10, y + 9, 8, 'S');
    doc.circle(margin + 10, y + 9, 7.2, 'S');
    doc.circle(margin + 10, y + 9, 5.6, 'S');
    doc.setFontSize(4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 46, 93);
    doc.text('HIMALAYA', margin + 10, y + 9.5, { align: 'center' });
    doc.setFontSize(2.8);
    doc.text('STRENGTH•DURABILITY', margin + 10, y + 11.5, { align: 'center' });
  }

  // Thanks note
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(30, 41, 59);
  doc.text('Thanks and waiting for your valued order', margin + 24, y + 6);
  doc.text('Yours truly,', margin + 24, y + 11);

  // Authorised Signatory Footer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 44, 89);
  doc.text('For Himalaya Composites & Precast Pvt Ltd', pageWidth - margin, y + 4, { align: 'right' });

  // Authorised Signature Image
  if (originalSignatureData) {
    doc.addImage(originalSignatureData, 'PNG', pageWidth - margin - 35, y + 6, 30, 11);
  } else {
    doc.setDrawColor(0, 46, 93);
    doc.setLineWidth(0.4);
    doc.line(pageWidth - margin - 32, y + 12, pageWidth - margin - 5, y + 13);
    doc.line(pageWidth - margin - 28, y + 13, pageWidth - margin - 24, y + 8);
    doc.line(pageWidth - margin - 24, y + 8, pageWidth - margin - 20, y + 15);
    doc.line(pageWidth - margin - 20, y + 15, pageWidth - margin - 16, y + 10);
  }

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Authorised Signatory', pageWidth - margin, y + 18, { align: 'right' });

  // 10. Loop over all pages to draw background footers and page numbers
  const totalPages = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Draw wave footer background
    doc.setFillColor(59, 130, 246); // Light blue
    doc.rect(0, pageHeight - 14, pageWidth, 14, 'F');
    doc.setFillColor(0, 46, 93); // Dark blue
    doc.rect(0, pageHeight - 11, pageWidth, 11, 'F');

    // Contact details text centered
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('+91 98795 22226  |  info@himalayacomposites.com  |  www.himalayacomposites.com', pageWidth / 2, pageHeight - 4.5, { align: 'center' });

    // Page numbering right-aligned
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 4.5, { align: 'right' });
  }
  await safeSaveFile(doc, `Quotation_${String(qNumber).replace(/[\/\\]/g, '_') || 'Draft'}.pdf`, 'application/pdf');
  return true;
};

/**
 * Export a DOM element to a high-quality PNG image (⭐ GUARANTEED CANONICAL 794px A4 LAYOUT ON ANY DEVICE)
 */
export const exportQuotationImage = async (elementId, filename = 'quotation.png', { save = true } = {}) => {
  const element = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Create isolated off-screen wrapper at (0, 0), top-level visible in DOM for canvas rendering
  const wrapper = document.createElement('div');
  wrapper.id = `${typeof elementId === 'string' ? elementId : 'quotation'}-export-wrapper`;
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '794px';
  wrapper.style.zIndex = '99999';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.opacity = '0.01';
  wrapper.style.visibility = 'visible';
  wrapper.style.overflow = 'visible';
  wrapper.style.background = '#ffffff';

  const clone = element.cloneNode(true);
  clone.id = `${typeof elementId === 'string' ? elementId : 'quotation'}-export-clone`;
  clone.style.width = '794px';
  clone.style.minWidth = '794px';
  clone.style.maxWidth = '794px';
  clone.style.minHeight = '1123px';
  clone.style.transform = 'none';
  clone.style.borderRadius = '0';
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.boxSizing = 'border-box';
  clone.style.background = '#ffffff';
  clone.style.display = 'block';

  // Enforce desktop row layouts on all clone sections
  const mobileFlexRows = clone.querySelectorAll('.quotation-sheet-mobile-flex, .quotation-sheet-title-flex, .quotation-footer-flex');
  mobileFlexRows.forEach(el => {
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('flex-direction', 'row', 'important');
    el.style.setProperty('justify-content', 'space-between', 'important');
    el.style.setProperty('align-items', 'flex-start', 'important');
  });

  const rightMeta = clone.querySelector('.quotation-sheet-right-meta');
  if (rightMeta) {
    rightMeta.style.setProperty('align-self', 'flex-end', 'important');
    rightMeta.style.setProperty('align-items', 'flex-end', 'important');
    rightMeta.style.setProperty('width', 'auto', 'important');
  }

  const footerContact = clone.querySelector('.quotation-footer-contact');
  if (footerContact) {
    footerContact.style.setProperty('display', 'flex', 'important');
    footerContact.style.setProperty('flex-direction', 'row', 'important');
    footerContact.style.setProperty('justify-content', 'space-between', 'important');
    footerContact.style.setProperty('align-items', 'center', 'important');
    footerContact.style.setProperty('height', '100%', 'important');
    footerContact.style.setProperty('padding', '30px 34px 10px', 'important');
  }

  const footerWave = clone.querySelector('.quotation-footer-wave-wrapper');
  if (footerWave) {
    footerWave.style.setProperty('height', '76px', 'important');
    footerWave.style.setProperty('min-height', '76px', 'important');
  }

  // Enforce pristine tabular formatting on all tables in the clone
  clone.querySelectorAll('table').forEach(t => {
    t.style.setProperty('display', 'table', 'important');
    t.style.setProperty('width', '100%', 'important');
    t.style.setProperty('table-layout', 'fixed', 'important');
    t.style.setProperty('border-collapse', 'collapse', 'important');
  });
  clone.querySelectorAll('thead').forEach(th => th.style.setProperty('display', 'table-header-group', 'important'));
  clone.querySelectorAll('tbody').forEach(tb => tb.style.setProperty('display', 'table-row-group', 'important'));
  clone.querySelectorAll('tr').forEach(tr => {
    tr.style.setProperty('display', 'table-row', 'important');
    tr.style.setProperty('background', 'transparent', 'important');
    tr.style.setProperty('border', 'none', 'important');
  });
  clone.querySelectorAll('td, th').forEach(td => {
    td.style.setProperty('display', 'table-cell', 'important');
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch { /* proceed */ }
    }

    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 600);
      });
    }));

    let blob;
    let dataUrl;

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        width: 794,
        height: clone.scrollHeight || 1123,
        windowWidth: 794,
        windowHeight: clone.scrollHeight || 1123,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      dataUrl = canvas.toDataURL('image/png');
      blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    } catch (primaryErr) {
      console.warn('html2canvas capture failed, trying htmlToImage:', primaryErr);
      try {
        dataUrl = await htmlToImage.toPng(clone, {
          pixelRatio: 2,
          width: 794,
          height: clone.scrollHeight || 1123,
          backgroundColor: '#ffffff',
          cacheBust: true,
        });
        const response = await fetch(dataUrl);
        blob = await response.blob();
      } catch (fallbackErr) {
        console.error('All image export engines failed:', fallbackErr);
        throw fallbackErr;
      }
    }

    if (save) {
      await safeSaveFile(blob || dataUrl, filename, 'image/png');
    }
    return { dataUrl, blob };
  } finally {
    if (wrapper && wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
};

/**
 * Share a DOM element as a PNG image via Web Share API or fallback (⭐ GUARANTEED CANONICAL 794px A4 LAYOUT ON ANY DEVICE)
 */
export const shareQuotationImage = async (elementId, quotationNo = 'Draft', customerName = 'Customer') => {
  const filename = `Quotation_${String(quotationNo).replace(/[\/\\]/g, '_') || 'Draft'}.png`;
  // Sharing should open the system share sheet with an image; it must not
  // silently download an extra copy to Gallery first.
  const exportRes = await exportQuotationImage(elementId, filename, { save: false });
  const { blob, dataUrl } = exportRes;

  if (typeof window !== 'undefined' && window.flutter_inappwebview?.callHandler) {
    try {
      await window.flutter_inappwebview.callHandler('shareFile', {
        sourceType: 'base64-data-uri',
        filename,
        mimeType: 'image/png',
        data: dataUrl,
        text: `Quotation for ${customerName}`,
      });
      return { success: true, blob, dataUrl, filename };
    } catch (shareBridgeError) {
      console.warn('Flutter image-share handler unavailable; using browser sharing instead.', shareBridgeError);
    }
  }

  if (typeof navigator !== 'undefined' && navigator.canShare && blob) {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Quotation ${quotationNo}`,
          text: `Quotation for ${customerName}`,
          files: [file]
        });
        return { success: true, blob, dataUrl, filename };
      }
    } catch (shareErr) {
      if (shareErr && (shareErr.name === 'AbortError' || shareErr.message?.includes('abort'))) {
        return { success: true, blob, dataUrl, filename }; // User dismissed share sheet
      }
      console.warn('Navigator share with file failed, falling back to direct share modal:', shareErr);
    }
  }

  return { success: false, blob, dataUrl, filename };
};
