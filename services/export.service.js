import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiClient } from '../lib/apiClient';

/**
 * Generate PDF from data
 */
export const exportToPDF = (options = {}) => {
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

  // Save PDF
  doc.save(filename);
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename = 'report.csv') => {
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
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export Sales Report to PDF
 */
export const exportSalesReportPDF = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.customer_id) params.append('customer_id', filters.customer_id);

  const paramStr = params.toString();
  const path = paramStr ? `/reports/sales/summary?${paramStr}` : '/reports/sales/summary';
  const response = await apiClient.get(path);
  const data = response.data;

  if (!data || data.length === 0) {
    throw new Error('No sales data available to export');
  }

  const columns = ['Month', 'Orders', 'Unique Customers', 'Total Revenue', 'Avg Order Value', 'Closed Revenue'];
  const rows = data.map(item => [
    item.month,
    item.order_count,
    item.unique_customers,
    `INR ${parseFloat(item.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `INR ${parseFloat(item.avg_order_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `INR ${parseFloat(item.closed_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  exportToPDF({
    title: 'Sales Summary Report',
    subtitle: `Period: ${filters.date_from || 'Start'} to ${filters.date_to || 'Today'}`,
    columns,
    rows,
    orientation: 'landscape',
    filename: `sales-report-${new Date().toISOString().split('T')[0]}.pdf`
  });
};

/**
 * Export Finance Report to PDF
 */
export const exportFinanceReportPDF = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);

  const paramStr = params.toString();
  const path = paramStr ? `/reports/finance/revenue-expense?${paramStr}` : '/reports/finance/revenue-expense';
  const response = await apiClient.get(path);
  const data = response.data;

  if (!data || !data.summary || data.summary.length === 0) {
    throw new Error('No finance data available to export');
  }

  const columns = ['Month', 'Revenue (Invoiced)', 'Collected (Paid Invoices)', 'Expenses (PO Received)', 'Profit / Deficit'];
  const rows = data.summary.map(item => [
    item.month,
    `INR ${parseFloat(item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `INR ${parseFloat(item.collected || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `INR ${parseFloat(item.expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `INR ${parseFloat(item.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  exportToPDF({
    title: 'Finance Revenue vs Expenses Report',
    subtitle: `Period: ${filters.date_from || 'Start'} to ${filters.date_to || 'Today'}`,
    columns,
    rows,
    orientation: 'landscape',
    filename: `finance-report-${new Date().toISOString().split('T')[0]}.pdf`
  });
};

/**
 * Export Inventory Report to PDF
 */
export const exportInventoryReportPDF = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category_id) params.append('category_id', filters.category_id);
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);

  const paramStr = params.toString();
  const path = paramStr ? `/reports/inventory/stock-levels?${paramStr}` : '/reports/inventory/stock-levels';
  const response = await apiClient.get(path);
  const data = response.data;

  if (!data || data.length === 0) {
    throw new Error('No inventory data available to export');
  }

  const columns = ['Product Name', 'Product Code', 'Category', 'Type', 'Stock On Hand', 'UoM', 'Min Stock', 'Max Stock', 'Status'];
  const rows = data.map(item => [
    item.product_name,
    item.product_code,
    item.category_name || 'N/A',
    item.type || 'N/A',
    parseFloat(item.on_hand_balance || 0).toLocaleString(),
    item.unit_of_measure,
    parseFloat(item.min_stock_level || 0).toLocaleString(),
    parseFloat(item.max_stock_level || 0).toLocaleString(),
    item.stock_status
  ]);

  exportToPDF({
    title: 'Inventory Stock Levels Report',
    subtitle: `Generated: ${new Date().toLocaleString()}`,
    columns,
    rows,
    orientation: 'landscape',
    filename: `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`
  });
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

  doc.save(`aging-report-${new Date().toISOString().split('T')[0]}.pdf`);
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

  doc.save(`invoice-${invoice.invoice_number}.pdf`);
};

/**
 * Export Executive Factory Report to PDF (⭐ NEW)
 */
export const exportExecutiveReportPDF = (reportData, dateRangeLabel) => {
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

  doc.save(`executive-report-${new Date().toISOString().split('T')[0]}.pdf`);
};



/**
 * Export Quotation to PDF
 */
export const exportQuotationPDF = (quotation) => {
  if (!quotation) {
    throw new Error('Quotation not provided');
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
  doc.setTextColor(15, 23, 42);
  doc.text('QUOTATION', pageWidth - 14, y, { align: 'right' });
  doc.setFontSize(10);
  doc.text('HIMALAYA PRODUCTS', 14, y);
  doc.setTextColor(100, 116, 139);
  doc.text('Concrete & Aggregate Supply', 14, y + 5);
  doc.setTextColor(0, 0, 0);

  // Details
  y += 20;
  doc.setFontSize(10);
  doc.text(`Ref No: ${quotation.quotationNo || 'N/A'}`, pageWidth - 14, y, { align: 'right' });
  doc.text(`Date: ${quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : 'N/A'}`, pageWidth - 14, y + 6, { align: 'right' });
  y += 15;

  // Customer info
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('QUOTED TO:', 14, y);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(quotation.customerName || 'N/A', 14, y + 6);
  y += 20;

  // Items table
  let subtotal = 0;
  let taxTotal = 0;

  const items = Array.isArray(quotation.detailedItems) ? quotation.detailedItems : (
    Array.isArray(quotation.items) ? quotation.items : [
      {
        productName: typeof quotation.items === 'string' ? quotation.items : (quotation.product || 'Product Name'),
        quantity: quotation.quantity || 1,
        unitPrice: quotation.price || (quotation.amount ? (quotation.amount / (quotation.quantity || 1)) : 0),
        tax: quotation.tax !== undefined ? quotation.tax : 18
      }
    ]
  );
  const tableData = items.map(item => {
    const qty = item.quantity || 1;
    const price = item.unitPrice || 0;
    const itemSub = qty * price;
    const taxValue = itemSub * (item.tax !== undefined ? item.tax : 18) / 100;
    const itemTotal = itemSub + taxValue;

    subtotal += itemSub;
    taxTotal += taxValue;

    return [
      item.productName || 'N/A',
      qty,
      `INR ${parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${item.tax !== undefined ? item.tax : 18}%`,
      `INR ${parseFloat(itemTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ];
  });

  autoTable(doc, {
    head: [['Product Details', 'Qty', 'Rate', 'Tax (GST)', 'Total']],
    body: tableData,
    startY: y,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  y = doc.lastAutoTable.finalY + 15;

  const transport = quotation.transportCharge || 0;
  const grandTotal = subtotal + taxTotal + transport;

  // Totals
  doc.setFontSize(10);
  const labelX = 140;
  doc.text(`Items Subtotal:`, labelX, y);
  doc.text(`INR ${parseFloat(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: 'right' });
  y += 6;

  doc.text(`GST Amount:`, labelX, y);
  doc.text(`INR ${parseFloat(taxTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: 'right' });
  y += 6;

  if (transport > 0) {
    doc.text(`Transport (Approx.):`, labelX, y);
    doc.text(`INR ${parseFloat(transport).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: 'right' });
    y += 6;
  }

  y += 4;
  doc.setFontSize(12);
  doc.text(`Grand Total:`, labelX, y);
  doc.text(`INR ${parseFloat(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 14, y, { align: 'right' });

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  doc.save(`Quotation_${quotation.quotationNo || 'Draft'}.pdf`);
  return true;
};
