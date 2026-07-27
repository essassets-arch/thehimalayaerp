import React from 'react';

// Centralized DataTable Column definitions for Sales Data Explorer

export const categoryColumns = (onDrilldown) => [
  { header: 'Category Group', accessor: 'category', render: (row) => <strong>{row.category}</strong> },
  { header: 'Unique Products', accessor: 'products', render: (row) => row.products.toLocaleString() },
  { header: 'Orders Logged', accessor: 'orders' },
  { header: 'Qty Sold', accessor: 'qty', render: (row) => row.qty.toLocaleString('en-IN') },
  { header: 'Revenue Generated', accessor: 'revenue', render: (row) => <span style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{(row.revenue / 100000).toFixed(0)} L</span> },
  { header: 'Gross Profit', accessor: 'profit', render: (row) => `₹${(row.profit / 100000).toFixed(0)}L` },
  { header: 'Margin %', accessor: 'margin', render: (row) => <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{row.margin}%</span> },
  { header: 'Pending Active Orders', accessor: 'pendingOrders' }
];

export const productColumns = (onDrilldown) => [
  { header: 'SKU', accessor: 'sku', render: (row) => <strong onClick={() => onDrilldown('product', row.sku)} style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}>{row.sku}</strong> },
  { header: 'Product Specification', accessor: 'product', render: (row) => <span onClick={() => onDrilldown('product', row.product)} style={{ fontWeight: 'bold', cursor: 'pointer', color: 'var(--color-text-primary)' }}>{row.product}</span> },
  { header: 'Category Group', accessor: 'category' },
  { header: 'Size Dimensions', accessor: 'size' },
  { header: 'Base Color', accessor: 'color' },
  { header: 'Unit Price', accessor: 'price', render: (row) => `₹${row.price}` },
  { header: 'Orders Count', accessor: 'orders' },
  { header: 'Qty Sold', accessor: 'qty', render: (row) => row.qty.toLocaleString('en-IN') },
  { header: 'Gross Revenue', accessor: 'revenue', render: (row) => <span style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{(row.revenue / 100000).toFixed(0)} L</span> },
  { header: 'Mfg Cost', accessor: 'cost', render: (row) => `₹${(row.cost / 100000).toFixed(0)} L` },
  { header: 'Profit Yield', accessor: 'profit', render: (row) => `₹${(row.profit / 100000).toFixed(0)} L` },
  { header: 'Margin %', accessor: 'margin', render: (row) => `${row.margin}%` },
  { header: 'In Stock Qty', accessor: 'stock', render: (row) => row.stock.toLocaleString() },
  { header: 'Reserved Qty', accessor: 'reserved', render: (row) => row.reserved.toLocaleString() },
  { header: 'Pending Mfg', accessor: 'pendingProduction', render: (row) => row.pendingProduction.toLocaleString() }
];

export const employeeColumns = (onDrilldown) => [
  { header: 'Sales Executive', accessor: 'employee', render: (row) => <strong onClick={() => onDrilldown('employee', row.employee)} style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}>{row.employee}</strong> },
  { header: 'Total Leads Generated', accessor: 'leads' },
  { header: 'Qualified Leads', accessor: 'qualified' },
  { header: 'Samples Sent', accessor: 'samples' },
  { header: 'Quotations Created', accessor: 'quotations' },
  { header: 'Won Orders count', accessor: 'orders' },
  { header: 'Revenue Generated', accessor: 'revenue', render: (row) => <span style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{(row.revenue / 100000).toFixed(0)} L</span> },
  { header: 'Outstanding Receivable', accessor: 'pendingPayment', render: (row) => `₹${(row.pendingPayment / 100000).toFixed(0)} L` },
  { header: 'Net Receipts Collected', accessor: 'collection', render: (row) => `₹${(row.collection / 100000).toFixed(0)} L` },
  { header: 'Conversion Rate %', accessor: 'conversion', render: (row) => `${row.conversion}%` },
  { header: 'KPI Target Goal', accessor: 'target', render: (row) => `₹${(row.target / 100000).toFixed(0)} L` },
  { header: 'Target Achieved %', accessor: 'achievement', render: (row) => <span style={{ color: row.achievement >= 100 ? '#16a34a' : '#ea580c', fontWeight: 'bold' }}>{row.achievement}%</span> }
];

export const customerColumns = (onDrilldown) => [
  { header: 'Customer Partner', accessor: 'customer', render: (row) => <strong onClick={() => onDrilldown('customer', row.customer)} style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}>{row.customer}</strong> },
  { header: 'Industry Vertical', accessor: 'industry' },
  { header: 'State Location', accessor: 'state' },
  { header: 'City Location', accessor: 'city' },
  { header: 'Orders Placed', accessor: 'orders' },
  { header: 'Total Revenue Value', accessor: 'revenue', render: (row) => <span style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{(row.revenue / 100000).toFixed(0)} L</span> },
  { header: 'Outstanding Balance', accessor: 'outstanding', render: (row) => `₹${(row.outstanding / 100000).toFixed(0)} L` },
  { header: 'Collected Payments', accessor: 'collected', render: (row) => `₹${(row.collected / 100000).toFixed(0)} L` },
  { header: 'Outstanding Invoice Pending', accessor: 'pending', render: (row) => `₹${(row.pending / 100000).toFixed(0)} L` },
  { header: 'Last Order Date', accessor: 'lastOrder' },
  { header: 'Mapped Executive', accessor: 'executive', render: (row) => <span onClick={() => onDrilldown('employee', row.executive)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{row.executive}</span> }
];

export const leadColumns = (onDrilldown) => [
  { header: 'Lead ID Reference', accessor: 'leadId' },
  { header: 'Company Name', accessor: 'company' },
  { header: 'Assigned Executive', accessor: 'executive', render: (row) => <span onClick={() => onDrilldown('employee', row.executive)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{row.executive}</span> },
  { header: 'Acquisition Source', accessor: 'source' },
  { header: 'Current Phase Status', accessor: 'status', render: (row) => (
    <span style={{
      background: row.status === 'Converted' ? 'rgba(22,163,74,0.1)' : 'rgba(79,70,229,0.1)',
      color: row.status === 'Converted' ? '#16a34a' : '#4f46e5',
      padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px'
    }}>
      {row.status}
    </span>
  ) },
  { header: 'Conversion Date', accessor: 'convertedDate', render: (row) => row.convertedDate || 'N/A' },
  { header: 'Linked Quotation', accessor: 'quotation' },
  { header: 'Associated Order ID', accessor: 'order', render: (row) => row.order ? <span onClick={() => onDrilldown('order', row.order)} style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}>{row.order}</span> : 'N/A' },
  { header: 'Revenue Value', accessor: 'revenue', render: (row) => `₹${(row.revenue / 100000).toFixed(0)} L` }
];

export const quotationColumns = (onDrilldown) => [
  { header: 'Quotation Ref No', accessor: 'quotation' },
  { header: 'Customer Entity', accessor: 'customer', render: (row) => <span onClick={() => onDrilldown('customer', row.customer)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{row.customer}</span> },
  { header: 'Assigned Executive', accessor: 'executive', render: (row) => <span onClick={() => onDrilldown('employee', row.executive)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{row.executive}</span> },
  { header: 'Proposal Amount', accessor: 'amount', render: (row) => <span style={{ fontWeight: 'bold' }}>₹{row.amount.toLocaleString('en-IN')}</span> },
  { header: 'Approval Status', accessor: 'status', render: (row) => (
    <span style={{
      background: row.status === 'Approved' ? 'rgba(22,163,74,0.1)' : 'rgba(234,88,12,0.1)',
      color: row.status === 'Approved' ? '#16a34a' : '#ea580c',
      padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px'
    }}>
      {row.status}
    </span>
  ) },
  { header: 'Authority Signed', accessor: 'approvedBy', render: (row) => row.approvedBy || 'N/A' },
  { header: 'Revision Iterations', accessor: 'revisionCount' },
  { header: 'Created Calendar Date', accessor: 'createdDate' }
];

export const orderColumns = (onDrilldown) => [
  { header: 'Order Ref No', accessor: 'order', render: (row) => <strong onClick={() => onDrilldown('order', row.order)} style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}>{row.order}</strong> },
  { header: 'Customer Entity', accessor: 'customer', render: (row) => <span onClick={() => onDrilldown('customer', row.customer)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{row.customer}</span> },
  { header: 'Product Specification', accessor: 'product' },
  { header: 'Category Group', accessor: 'category' },
  { header: 'Quantity Placed', accessor: 'qty', render: (row) => row.qty.toLocaleString() },
  { header: 'Order Value (Capital)', accessor: 'value', render: (row) => <span style={{ fontWeight: 'bold', color: '#337a86' }}>₹{row.value.toLocaleString('en-IN')}</span> },
  { header: 'Production Stage', accessor: 'production' },
  { header: 'Dispatch Phase', accessor: 'dispatch' },
  { header: 'Delivery Logistics', accessor: 'delivery' },
  { header: 'Payment Verification', accessor: 'payment' },
  { header: 'ERP Pipeline Status', accessor: 'status', render: (row) => (
    <span style={{
      background: row.status === 'Closed' ? 'rgba(15,23,42,0.1)' : 'rgba(22,163,74,0.1)',
      color: row.status === 'Closed' ? '#24345C' : '#16a34a',
      padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px'
    }}>
      {row.status}
    </span>
  ) }
];

export const paymentColumns = (onDrilldown) => [
  { header: 'Associated Order', accessor: 'order', render: (row) => <span onClick={() => onDrilldown('order', row.order)} style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}>{row.order}</span> },
  { header: 'Customer Partner', accessor: 'customer', render: (row) => <span onClick={() => onDrilldown('customer', row.customer)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{row.customer}</span> },
  { header: 'Tax Invoice No', accessor: 'invoice' },
  { header: 'Total Value', accessor: 'amount', render: (row) => `₹${row.amount.toLocaleString('en-IN')}` },
  { header: 'Net Receipts Collected', accessor: 'collected', render: (row) => <span style={{ color: '#16a34a', fontWeight: 'bold' }}>₹{row.collected.toLocaleString('en-IN')}</span> },
  { header: 'Outstanding Balance', accessor: 'pending', render: (row) => <span style={{ color: '#ea580c', fontWeight: 'bold' }}>₹{row.pending.toLocaleString('en-IN')}</span> },
  { header: 'Overdue Penal Value', accessor: 'overdue', render: (row) => <span style={{ color: '#dc2626', fontWeight: 'bold' }}>₹{row.overdue.toLocaleString('en-IN')}</span> },
  { header: 'Financial Reconciliation', accessor: 'financeStatus', render: (row) => (
    <span style={{
      background: row.financeStatus === 'Verified' ? 'rgba(22,163,74,0.1)' : 'rgba(234,88,12,0.1)',
      color: row.financeStatus === 'Verified' ? '#16a34a' : '#ea580c',
      padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px'
    }}>
      {row.financeStatus}
    </span>
  ) }
];

export const regionColumns = (onDrilldown) => [
  { header: 'State Zone', accessor: 'state', render: (row) => <strong>{row.state}</strong> },
  { header: 'Municipal City', accessor: 'city', render: (row) => <strong>{row.city}</strong> },
  { header: 'Total Orders Placed', accessor: 'orders' },
  { header: 'Active Partners Base', accessor: 'customers' },
  { header: 'Total Revenue Accrued', accessor: 'revenue', render: (row) => <span style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{(row.revenue / 100000).toFixed(0)} L</span> },
  { header: 'Payments Collected', accessor: 'collection', render: (row) => `₹${(row.collection / 100000).toFixed(0)} L` },
  { header: 'Outstanding Collection Receivable', accessor: 'pending', render: (row) => `₹${(row.pending / 100000).toFixed(0)} L` }
];

export const profitabilityColumns = (onDrilldown) => [
  { header: 'Product Specification', accessor: 'product', render: (row) => <strong>{row.product}</strong> },
  { header: 'Sales Revenue Value', accessor: 'sales', render: (row) => `₹${(row.sales / 100000).toFixed(0)} L` },
  { header: 'Mfg Cost Value', accessor: 'cost', render: (row) => `₹${(row.cost / 100000).toFixed(0)} L` },
  { header: 'Gross Trade Profit', accessor: 'grossProfit', render: (row) => <span style={{ color: '#16a34a', fontWeight: 'bold' }}>₹{(row.grossProfit / 100000).toFixed(0)} L</span> },
  { header: 'Net Segment Profit', accessor: 'netProfit', render: (row) => <span style={{ color: '#24345C', fontWeight: 'bold' }}>₹{(row.netProfit / 100000).toFixed(0)} L</span> },
  { header: 'Gross Margin %', accessor: 'margin', render: (row) => <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{row.margin}%</span> },
  { header: 'Site Reject Return %', accessor: 'returnRate', render: (row) => `${row.returnRate}%` },
  { header: 'Complaints count', accessor: 'complaints' }
];

export const inventoryColumns = (onDrilldown) => [
  { header: 'Product Specification', accessor: 'product', render: (row) => <strong>{row.product}</strong> },
  { header: 'Store Physical Stock', accessor: 'stock', render: (row) => row.stock.toLocaleString() },
  { header: 'Precast Reserved Qty', accessor: 'reserved', render: (row) => row.reserved.toLocaleString() },
  { header: 'Precast Total Sold', accessor: 'sold', render: (row) => row.sold.toLocaleString() },
  { header: 'Production Pipeline Queue', accessor: 'production', render: (row) => row.production.toLocaleString() },
  { header: 'Free Stock Available', accessor: 'available', render: (row) => <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{row.available.toLocaleString()}</span> },
  { header: 'Stock Coverage Days', accessor: 'stockDays', render: (row) => `${row.stockDays} days` }
];

export const monthlyPerformanceColumns = (onDrilldown) => [
  { header: 'Month Period', accessor: 'month' },
  { header: 'Product Specification', accessor: 'product', render: (row) => <strong>{row.product}</strong> },
  { header: 'Quantity Dispatched', accessor: 'qty', render: (row) => row.qty.toLocaleString() },
  { header: 'Revenue Generated', accessor: 'revenue', render: (row) => `₹${row.revenue.toLocaleString('en-IN')}` },
  { header: 'Month MoM Growth %', accessor: 'growth', render: (row) => <span style={{ color: row.growth >= 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>{row.growth >= 0 ? `+${row.growth}%` : `${row.growth}%`}</span> },
  { header: 'Return Replacements', accessor: 'returns' }
];

export const top100ProductsColumns = (onDrilldown) => [
  { header: 'National Rank', accessor: 'rank', render: (row) => <strong>#{row.rank}</strong> },
  { header: 'Product Specification', accessor: 'product', render: (row) => <strong onClick={() => onDrilldown('product', row.product)} style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}>{row.product}</strong> },
  { header: 'Gross Revenue Val', accessor: 'revenue', render: (row) => <span style={{ fontWeight: 'bold', color: '#16a34a' }}>₹{(row.revenue / 100000).toFixed(0)} L</span> },
  { header: 'Total Orders Placed', accessor: 'orders' },
  { header: 'Net Segment Profit', accessor: 'profit', render: (row) => `₹${(row.profit / 100000).toFixed(0)} L` },
  { header: 'Margin %', accessor: 'margin', render: (row) => `${row.margin}%` },
  { header: 'Sales Growth YoY %', accessor: 'growth', render: (row) => <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+{row.growth}%</span> }
];

export const activityLogColumns = (onDrilldown) => [
  { header: 'Timestamp Date', accessor: 'date' },
  { header: 'Sales Employee', accessor: 'salesUser', render: (row) => <span onClick={() => onDrilldown('employee', row.salesUser)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{row.salesUser}</span> },
  { header: 'ERP Event Action', accessor: 'action', render: (row) => <strong>{row.action}</strong> },
  { header: 'Target Partner Entity', accessor: 'customer', render: (row) => row.customer ? <span onClick={() => onDrilldown('customer', row.customer)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{row.customer}</span> : 'N/A' },
  { header: 'Lead Reference', accessor: 'lead', render: (row) => row.lead || 'N/A' },
  { header: 'Quotation Ref ID', accessor: 'quotation' },
  { header: 'Linked Order', accessor: 'order', render: (row) => row.order ? <span onClick={() => onDrilldown('order', row.order)} style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}>{row.order}</span> : 'N/A' },
  { header: 'Remarks Detail', accessor: 'remarks' }
];
