import { safeSaveFile } from '../export.service';

/**
 * Enterprise CSV Sanitizer & Escaper (RFC 4180 compliant)
 * - Escapes double quotes with double-quotes ("" -> """")
 * - Wraps fields containing commas, quotes, or newlines in double quotes
 * - Guards against CSV / Spreadsheet formula injection (=, +, -, @)
 */
export function sanitizeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return '';

  let str: string;
  if (typeof val === 'object') {
    if (val instanceof Date) {
      str = val.toISOString().slice(0, 10);
    } else {
      try {
        str = JSON.stringify(val);
      } catch {
        str = String(val);
      }
    }
  } else {
    str = String(val);
  }

  // Prevent formula injection in spreadsheet applications (Excel / Calc)
  const trimmed = str.trimStart();
  if (trimmed.startsWith('=') || trimmed.startsWith('+') || trimmed.startsWith('-') || trimmed.startsWith('@') || trimmed.startsWith('\t') || trimmed.startsWith('\r')) {
    // Prefix with single quote to force plain text rendering
    str = `'${str}`;
  }

  // Double up existing double-quotes
  const escaped = str.replace(/"/g, '""');

  // Wrap in quotes if it contains commas, quotes, newlines, or leading/trailing spaces
  if (
    escaped.includes(',') ||
    escaped.includes('"') ||
    escaped.includes('\n') ||
    escaped.includes('\r') ||
    str.startsWith(' ') ||
    str.endsWith(' ')
  ) {
    return `"${escaped}"`;
  }

  return escaped;
}

export function formatISODate(raw: unknown): string {
  if (!raw) return '';
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? '' : raw.toISOString().slice(0, 10);
  }
  const s = String(raw).trim();
  if (!s) return '';
  // Match standard YYYY-MM-DD
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return s;
}

export function formatISODateTime(raw: unknown): string {
  if (!raw) return '';
  const d = raw instanceof Date ? raw : new Date(String(raw));
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

export function formatNumeric(val: unknown, decimals: number = 2): string {
  if (val === null || val === undefined || val === '') return '0.00';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(num) || !Number.isFinite(num)) return '0.00';
  return num.toFixed(decimals);
}

export function formatAddress(addr: unknown): string {
  if (!addr) return '';
  if (typeof addr === 'string') {
    // Check if JSON
    if (addr.startsWith('{') && addr.endsWith('}')) {
      try {
        const parsed = JSON.parse(addr);
        return formatAddress(parsed);
      } catch {
        return addr.replace(/[\r\n]+/g, ', ').trim();
      }
    }
    return addr.replace(/[\r\n]+/g, ', ').trim();
  }
  if (typeof addr === 'object' && addr !== null) {
    const a = addr as Record<string, unknown>;
    const parts = [
      a.line1,
      a.line2,
      a.area || a.street,
      a.city,
      a.state,
      a.pincode || a.postalCode ? `- ${a.pincode || a.postalCode}` : '',
      a.country && a.country !== 'India' ? a.country : '',
    ]
      .map(p => (typeof p === 'string' ? p.trim() : ''))
      .filter(Boolean);
    return parts.join(', ');
  }
  return String(addr);
}

// -------------------------------------------------------------
// LEADS EXPORT
// -------------------------------------------------------------

export interface ExportLeadsOptions {
  mode?: 'summary' | 'item_level';
  filenamePrefix?: string;
}

export async function exportLeadsToCSV(
  leads: any[],
  options: ExportLeadsOptions = {}
): Promise<{ success: boolean; count: number; filename: string }> {
  const mode = options.mode || 'summary';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${options.filenamePrefix || 'Sales_Leads'}_${mode === 'item_level' ? 'Item_Details' : 'Report'}_${timestamp}.csv`;

  if (!Array.isArray(leads) || leads.length === 0) {
    throw new Error('No leads available to export.');
  }

  let headers: string[] = [];
  const rows: string[] = [];

  if (mode === 'summary') {
    headers = [
      'Lead ID',
      'Lead Date',
      'Company Name',
      'Contact Person',
      'Phone / Mobile',
      'Email',
      'Project Name',
      'Group Name',
      'GST Name',
      'GST Number',
      'Address Line',
      'City',
      'State',
      'Pincode',
      'Country',
      'Source',
      'Lead Status',
      'Workflow State',
      'Sales Executive',
      'Product Interest',
      'Estimated Quantity',
      'Unit',
      'Detailed Items Breakdown',
      'Remarks / Requirements',
      'Next Reminder Date',
      'Next Reminder Time',
      'Next Reminder Type',
      'Next Reminder Priority',
      'Next Reminder Status',
      'Lost Reason',
      'Lost Complaint ID',
      'Lost Date',
      'Converted Date',
      'Linked Quotations Count',
      'Created At',
      'Updated At',
    ];

    for (const lead of leads) {
      const addr = lead.address || {};
      const items = Array.isArray(lead.detailedItems)
        ? lead.detailedItems
        : Array.isArray(lead.items)
        ? lead.items
        : [];

      const itemsSummary = items
        .map((it: any, idx: number) => {
          const name = it.productName || it.product || it.name || `Item ${idx + 1}`;
          const qty = it.quantity ?? it.qty ?? '';
          const rate = it.unitPrice ?? it.rate ?? '';
          const tax = it.tax ?? it.gstRate ?? '';
          const total = it.grandTotal ?? it.subTotal ?? '';
          const specs = it.specification || it.productDetails || '';
          const parts = [
            `#${idx + 1}: ${name}`,
            specs ? `Specs: ${specs}` : '',
            qty ? `Qty: ${qty}` : '',
            rate ? `Rate: ₹${rate}` : '',
            tax ? `GST: ${tax}%` : '',
            total ? `Total: ₹${total}` : '',
          ].filter(Boolean);
          return parts.join(' | ');
        })
        .join('; ');

      const nextRem = lead.nextReminder || {};

      const rowValues = [
        lead.leadNumber || lead.id || '',
        formatISODate(lead.leadDate || lead.createdAt),
        lead.companyName || lead.customerName || '',
        lead.contactPerson || lead.siteInchargeName || '',
        lead.phone || lead.mobile || lead.siteInchargeMobile || '',
        lead.email || '',
        lead.projectName || '',
        lead.groupName || '',
        lead.gstName || '',
        lead.gstNumber || '',
        typeof addr === 'object' && addr !== null ? (addr.line1 || '') : '',
        typeof addr === 'object' && addr !== null ? (addr.city || '') : '',
        typeof addr === 'object' && addr !== null ? (addr.state || '') : '',
        typeof addr === 'object' && addr !== null ? (addr.pincode || '') : '',
        typeof addr === 'object' && addr !== null ? (addr.country || 'India') : 'India',
        lead.source || '',
        lead.status || lead.leadStatus || '',
        lead.workflowState?.name || lead.workflowState?.code || '',
        lead.salesExecutive?.name || lead.salesperson || '',
        lead.productInterest || lead.product || '',
        lead.estimatedQuantity || lead.expectedQuantities || (items[0]?.quantity ?? ''),
        lead.unit || (items[0]?.unit ?? ''),
        itemsSummary,
        lead.remarks || lead.notes || lead.requirements || '',
        nextRem.reminderDate ? formatISODate(nextRem.reminderDate) : (typeof lead.nextReminder === 'string' ? formatISODate(lead.nextReminder) : ''),
        nextRem.reminderTime || '',
        nextRem.reminderType || '',
        nextRem.priority || '',
        nextRem.status || '',
        lead.lostReason || '',
        lead.lostComplaintId || '',
        formatISODate(lead.lostAt),
        formatISODate(lead.convertedAt),
        Array.isArray(lead.quotations) ? String(lead.quotations.length) : '0',
        formatISODateTime(lead.createdAt),
        formatISODateTime(lead.updatedAt),
      ];

      rows.push(rowValues.map(sanitizeCSVValue).join(','));
    }
  } else {
    // mode === 'item_level'
    headers = [
      'Lead ID',
      'Lead Date',
      'Company Name',
      'Contact Person',
      'Phone / Mobile',
      'Email',
      'City',
      'State',
      'GST Number',
      'Lead Status',
      'Sales Executive',
      'Item Index',
      'Product Name',
      'Product Code',
      'Specifications',
      'Size',
      'Color',
      'Capacity',
      'Quantity',
      'Unit',
      'Unit Price (INR)',
      'Subtotal (INR)',
      'Discount (INR)',
      'GST Rate (%)',
      'GST Amount (INR)',
      'Grand Total (INR)',
      'Remarks',
    ];

    for (const lead of leads) {
      const items = Array.isArray(lead.detailedItems) && lead.detailedItems.length > 0
        ? lead.detailedItems
        : Array.isArray(lead.items) && lead.items.length > 0
        ? lead.items
        : [
            {
              productName: lead.productInterest || lead.product || 'Standard Item',
              quantity: lead.estimatedQuantity || 1,
              unit: lead.unit || 'SET',
              unitPrice: 0,
              specification: 'Standard Specification',
            },
          ];

      items.forEach((it: any, idx: number) => {
        const addr = lead.address || {};
        const rowValues = [
          lead.leadNumber || lead.id || '',
          formatISODate(lead.leadDate || lead.createdAt),
          lead.companyName || lead.customerName || '',
          lead.contactPerson || lead.siteInchargeName || '',
          lead.phone || lead.mobile || '',
          lead.email || '',
          typeof addr === 'object' && addr !== null ? (addr.city || '') : '',
          typeof addr === 'object' && addr !== null ? (addr.state || '') : '',
          lead.gstNumber || '',
          lead.status || lead.leadStatus || '',
          lead.salesExecutive?.name || lead.salesperson || '',
          String(idx + 1),
          it.productName || it.product || it.name || '',
          it.productCode || it.sku || '',
          it.specification || it.productDetails || it.description || '',
          it.size || '',
          it.color || '',
          it.capacity || '',
          formatNumeric(it.quantity ?? it.qty ?? 0, 3),
          it.unit || lead.unit || 'PCS',
          formatNumeric(it.unitPrice ?? it.rate ?? 0, 2),
          formatNumeric(it.subTotal ?? (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 2),
          formatNumeric(it.discount ?? 0, 2),
          formatNumeric(it.gstRate ?? it.tax ?? 18, 2),
          formatNumeric(it.gstAmount ?? 0, 2),
          formatNumeric(it.grandTotal ?? it.lineTotal ?? 0, 2),
          lead.remarks || lead.notes || '',
        ];
        rows.push(rowValues.map(sanitizeCSVValue).join(','));
      });
    }
  }

  const csvContent = '\uFEFF' + [headers.map(sanitizeCSVValue).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  await safeSaveFile(blob, filename, 'text/csv;charset=utf-8');

  return { success: true, count: rows.length, filename };
}

// -------------------------------------------------------------
// SALES ORDERS EXPORT
// -------------------------------------------------------------

export interface ExportOrdersOptions {
  mode?: 'summary' | 'item_level';
  filenamePrefix?: string;
}

export async function exportOrdersToCSV(
  orders: any[],
  options: ExportOrdersOptions = {}
): Promise<{ success: boolean; count: number; filename: string }> {
  const mode = options.mode || 'summary';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${options.filenamePrefix || 'Sales_Orders'}_${mode === 'item_level' ? 'Item_Wise_Details' : 'Master_Summary'}_${timestamp}.csv`;

  if (!Array.isArray(orders) || orders.length === 0) {
    throw new Error('No orders available to export.');
  }

  let headers: string[] = [];
  const rows: string[] = [];

  if (mode === 'summary') {
    headers = [
      'Order Number',
      'Order Date',
      'Customer Name',
      'Customer Code',
      'Contact Person',
      'Customer Phone',
      'Customer Email',
      'GSTIN',
      'Customer PO Number',
      'Customer PO Date',
      'Sales Executive',
      'Quotation Number',
      'Subtotal (INR)',
      'Discount Amount (INR)',
      'Taxable Amount (INR)',
      'GST Amount (INR)',
      'Freight Amount (INR)',
      'Total Order Value (INR)',
      'Verified Paid Amount (INR)',
      'Balance / Outstanding Amount (INR)',
      'Payment Terms',
      'Payment Term Days',
      'Payment Due Date',
      'Payment Status',
      'Delivery Terms',
      'Requested Delivery Date',
      'Delivered Date',
      'Billing Address',
      'Shipping Address',
      'Order Status',
      'Workflow State',
      'Production Status',
      'Dispatch Status',
      'Latest Dispatch No',
      'Transporter Name',
      'Vehicle Number',
      'LR Number',
      'Invoice Number',
      'E-Way Bill Number',
      'Gate Pass Number',
      'Delivery Received By',
      'Replacement Status',
      'Return Status',
      'Lost Reason',
      'Lost Date',
      'Lost Complaint ID',
      'Total Items Count',
      'Total Quantity Ordered',
      'Total Quantity Delivered',
      'Products Summary',
      'Items Full Breakdown & Specifications',
      'Remarks',
      'Created At',
      'Updated At',
    ];

    for (const order of orders) {
      const items = Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : Array.isArray(order.detailedItems) && order.detailedItems.length > 0
        ? order.detailedItems
        : [];

      const totalItemsCount = items.length;
      const totalQtyOrdered = items.reduce((sum: number, it: any) => sum + (Number(it.orderedQuantity ?? it.quantity ?? 0) || 0), 0);
      const totalQtyDelivered = items.reduce((sum: number, it: any) => sum + (Number(it.deliveredQuantity ?? it.quantity_dispatched ?? 0) || 0), 0);

      const productsSummary = items
        .map((it: any) => {
          const name = it.productName || it.productNameSnapshot || it.name || 'Item';
          const qty = it.orderedQuantity ?? it.quantity ?? 1;
          const unit = it.unit || 'PCS';
          return `${name} (${qty} ${unit})`;
        })
        .join('; ');

      const itemsFullBreakdown = items
        .map((it: any, idx: number) => {
          const name = it.productName || it.productNameSnapshot || it.name || `Item ${idx + 1}`;
          const code = it.productCode || it.productCodeSnapshot || it.sku || '';
          const qty = it.orderedQuantity ?? it.quantity ?? 0;
          const unit = it.unit || 'PCS';
          const rate = it.unitPrice ?? 0;
          const taxRate = it.taxRate ?? 18;
          const taxAmt = it.taxAmount ?? 0;
          const total = it.lineTotal ?? (Number(qty) * Number(rate));
          const deliv = it.deliveredQuantity ?? 0;
          const specsObj = it.specifications || {};
          const specStr = typeof specsObj === 'object' && specsObj !== null
            ? Object.entries(specsObj).map(([k, v]) => `${k}: ${v}`).join(', ')
            : String(specsObj);

          return `[#${idx + 1} ${name} | Code: ${code} | Specs: ${specStr} | Qty: ${qty} ${unit} | Rate: ₹${rate} | GST: ${taxRate}% (₹${taxAmt}) | Total: ₹${total} | Delivered: ${deliv}]`;
        })
        .join(' ');

      const latestDispatch = Array.isArray(order.dispatches) && order.dispatches.length > 0
        ? order.dispatches[0]
        : null;

      const customerObj = order.customer || {};
      const billingAddr = order.billingAddress || customerObj.billingAddress;
      const shippingAddr = order.shippingAddress || customerObj.shippingAddress || order.deliveryAddress;

      const subtotalVal = order.subtotal ?? (Number(order.totalAmount || 0) - Number(order.taxAmount || 0));
      const discountVal = order.discountAmount ?? order.discount ?? 0;
      const taxableVal = order.taxableAmount ?? (Number(subtotalVal) - Number(discountVal));
      const taxVal = order.taxAmount ?? order.tax ?? 0;
      const freightVal = order.freightAmount ?? order.transportCharge ?? 0;
      const totalVal = order.totalAmount ?? order.grandTotal ?? order.orderValue ?? 0;
      const paidVal = order.verifiedPaidAmount ?? order.paidAmount ?? order.payment?.paidAmount ?? 0;
      const balanceVal = order.balanceAmount ?? Math.max(0, Number(totalVal) - Number(paidVal));

      const rowValues = [
        order.orderNo || order.orderNumber || order.orderId || order.id || '',
        formatISODate(order.orderDate || order.createdAt),
        order.customerName || customerObj.companyName || customerObj.name || '',
        order.customerCode || customerObj.customerCode || order.customerId || '',
        customerObj.contactPerson || order.contactPerson || '',
        customerObj.phone || order.phone || '',
        customerObj.email || order.email || '',
        customerObj.gstin || order.gstNumber || order.gstin || '',
        order.customerPurchaseOrderNo || order.poNumber || '',
        formatISODate(order.customerPurchaseOrderDate || order.poDate),
        order.salesperson || order.salesExecutive?.name || 'Sales User',
        order.quotation?.quotationNumber || order.quotationNo || order.sourceQuotation?.quotationNumber || '',
        formatNumeric(subtotalVal, 2),
        formatNumeric(discountVal, 2),
        formatNumeric(taxableVal, 2),
        formatNumeric(taxVal, 2),
        formatNumeric(freightVal, 2),
        formatNumeric(totalVal, 2),
        formatNumeric(paidVal, 2),
        formatNumeric(balanceVal, 2),
        order.paymentTerms || '',
        order.paymentTermDays !== undefined && order.paymentTermDays !== null ? String(order.paymentTermDays) : '',
        formatISODate(order.paymentDueDate),
        order.paymentStatus || 'PENDING',
        order.deliveryTerms || '',
        formatISODate(order.requestedDeliveryDate),
        formatISODate(order.deliveredDate || order.deliveredAt || latestDispatch?.deliveredAt),
        formatAddress(billingAddr),
        formatAddress(shippingAddr),
        order.orderStatus || order.status || '',
        order.workflowState?.name || order.workflowState?.code || '',
        order.productionStatus || 'NOT_REQUIRED',
        order.dispatchStatus || (latestDispatch?.status ?? 'NOT_READY'),
        latestDispatch?.dispatchNo || '',
        latestDispatch?.transporterName || '',
        latestDispatch?.vehicleNumber || '',
        latestDispatch?.lrNumber || '',
        latestDispatch?.invoiceNumber || '',
        latestDispatch?.ewayBillNumber || '',
        latestDispatch?.gatePassNumber || '',
        latestDispatch?.receivedBy || '',
        order.replacementStatus || '',
        order.returnStatus || '',
        order.lostReason || '',
        formatISODate(order.lostAt),
        order.lostComplaintId || '',
        String(totalItemsCount),
        formatNumeric(totalQtyOrdered, 3),
        formatNumeric(totalQtyDelivered, 3),
        productsSummary,
        itemsFullBreakdown,
        order.remarks || '',
        formatISODateTime(order.createdAt),
        formatISODateTime(order.updatedAt),
      ];

      rows.push(rowValues.map(sanitizeCSVValue).join(','));
    }
  } else {
    // mode === 'item_level'
    headers = [
      'Order Number',
      'Order Date',
      'Customer Name',
      'Customer Code',
      'GSTIN',
      'Customer PO Number',
      'Sales Executive',
      'Item Line #',
      'Product Name',
      'Product Code / SKU',
      'Specifications',
      'Size',
      'Color',
      'Capacity',
      'Ordered Quantity',
      'Unit',
      'Unit Price (INR)',
      'Item Discount (INR)',
      'Item Taxable Amount (INR)',
      'Tax Rate (%)',
      'Item Tax Amount (INR)',
      'Line Total (INR)',
      'Delivered Quantity',
      'Returned Quantity',
      'Replaced Quantity',
      'Total Order Value (INR)',
      'Payment Status',
      'Paid Amount (INR)',
      'Balance Amount (INR)',
      'Dispatch Status',
      'Delivered Date',
      'Shipping Address',
      'Order Status',
      'Remarks',
    ];

    for (const order of orders) {
      const items = Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : Array.isArray(order.detailedItems) && order.detailedItems.length > 0
        ? order.detailedItems
        : [
            {
              productName: order.products || 'Standard Product',
              orderedQuantity: 1,
              unit: 'NOS',
              unitPrice: order.totalAmount || 0,
              lineTotal: order.totalAmount || 0,
            },
          ];

      const customerObj = order.customer || {};
      const shippingAddr = order.shippingAddress || customerObj.shippingAddress || order.deliveryAddress;
      const latestDispatch = Array.isArray(order.dispatches) && order.dispatches.length > 0 ? order.dispatches[0] : null;

      items.forEach((it: any, idx: number) => {
        const specsObj = it.specifications || {};
        const specStr = typeof specsObj === 'object' && specsObj !== null
          ? Object.entries(specsObj).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(specsObj || '');

        const qty = Number(it.orderedQuantity ?? it.quantity ?? 0);
        const rate = Number(it.unitPrice ?? 0);
        const discount = Number(it.discountAmount ?? it.discount ?? 0);
        const taxable = Number(it.taxableAmount ?? (qty * rate - discount));
        const taxRate = Number(it.taxRate ?? 18);
        const taxAmt = Number(it.taxAmount ?? (taxable * (taxRate / 100)));
        const lineTotal = Number(it.lineTotal ?? (taxable + taxAmt));

        const rowValues = [
          order.orderNo || order.orderNumber || order.orderId || order.id || '',
          formatISODate(order.orderDate || order.createdAt),
          order.customerName || customerObj.companyName || customerObj.name || '',
          order.customerCode || customerObj.customerCode || order.customerId || '',
          customerObj.gstin || order.gstNumber || order.gstin || '',
          order.customerPurchaseOrderNo || order.poNumber || '',
          order.salesperson || order.salesExecutive?.name || 'Sales User',
          String(idx + 1),
          it.productName || it.productNameSnapshot || it.name || '',
          it.productCode || it.productCodeSnapshot || it.sku || '',
          specStr,
          specsObj.size || '',
          specsObj.color || '',
          specsObj.capacity || '',
          formatNumeric(qty, 3),
          it.unit || 'PCS',
          formatNumeric(rate, 2),
          formatNumeric(discount, 2),
          formatNumeric(taxable, 2),
          formatNumeric(taxRate, 2),
          formatNumeric(taxAmt, 2),
          formatNumeric(lineTotal, 2),
          formatNumeric(it.deliveredQuantity ?? it.quantity_dispatched ?? 0, 3),
          formatNumeric(it.returnedQuantity ?? 0, 3),
          formatNumeric(it.replacedQuantity ?? 0, 3),
          formatNumeric(order.totalAmount ?? order.grandTotal ?? 0, 2),
          order.paymentStatus || 'PENDING',
          formatNumeric(order.verifiedPaidAmount ?? order.paidAmount ?? 0, 2),
          formatNumeric(order.balanceAmount ?? 0, 2),
          order.dispatchStatus || (latestDispatch?.status ?? 'NOT_READY'),
          formatISODate(order.deliveredDate || order.deliveredAt || latestDispatch?.deliveredAt),
          formatAddress(shippingAddr),
          order.orderStatus || order.status || '',
          order.remarks || '',
        ];

        rows.push(rowValues.map(sanitizeCSVValue).join(','));
      });
    }
  }

  const csvContent = '\uFEFF' + [headers.map(sanitizeCSVValue).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  await safeSaveFile(blob, filename, 'text/csv;charset=utf-8');

  return { success: true, count: rows.length, filename };
}
