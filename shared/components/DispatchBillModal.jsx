import React from 'react';
import { X, Printer, Download, Truck, FileText, Box } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DispatchBillModal({ dispatchRecord, orders, onClose }) {
  if (!dispatchRecord) return null;

  // Resolve client and order metadata
  const linkedOrders = dispatchRecord.dispatchItems?.map(item =>
    orders.find(o =>
      String(o.orderNo) === String(item.orderNo || dispatchRecord.orderNo) ||
      String(o.id) === String(item.orderId || dispatchRecord.orderId)
    )
  ).filter(Boolean) || [];

  const firstOrder = linkedOrders[0] || orders.find(o =>
    String(o.orderNo) === String(dispatchRecord.orderNo) ||
    String(o.id) === String(dispatchRecord.orderId)
  );
  const customerName = dispatchRecord.customerName || firstOrder?.customerName || (firstOrder?.customer && typeof firstOrder.customer === 'object' ? firstOrder.customer.name : firstOrder.customer) || 'Multi-Customer';
  const date = dispatchRecord.dispatchDate || dispatchRecord.date || dispatchRecord.createdAt || new Date().toISOString().split('T')[0];
  const dispatchStatus = dispatchRecord.status || 'Dispatch Created';

  // Fallback Address & GST
  const gst = firstOrder?.gst || (firstOrder?.customer && typeof firstOrder.customer === 'object' ? firstOrder.customer.gst : '') || '27ABCDE4321G2Z8';
  const address = dispatchRecord.deliveryAddress || dispatchRecord.deliveryLocation ||
    firstOrder?.deliveryAddress ||
    (firstOrder?.customer && typeof firstOrder.customer === 'object' ? firstOrder.customer.address : '') ||
    'Delivery address not recorded';

  const formatINR = (value) => {
    if (typeof value === 'string') {
      if (value.startsWith('₹')) return value;
      return `₹${value}`;
    }
    const num = Number(value);
    if (isNaN(num)) return '₹0';
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  };

  // Compile item rows with calculations based on order pricing
  const itemsList = dispatchRecord.dispatchItems?.map((item) => {
    const order = orders.find(o =>
      String(o.orderNo) === String(item.orderNo || dispatchRecord.orderNo) ||
      String(o.id) === String(item.orderId || dispatchRecord.orderId)
    ) || firstOrder;
    const orderItem = order?.detailedItems?.[0] || order?.items?.[0] || {};
    
    const qty = Number(item.qty ?? item.quantity ?? dispatchRecord.quantity ?? 0);
    const rate = Number(orderItem.unitPrice || order?.rate || (order?.payment?.totalAmount || 0) / (order?.quantity || 1) || 25000);
    const taxRate = Number(orderItem.tax !== undefined ? orderItem.tax : (order?.tax !== undefined ? order.tax : (order?.gst !== undefined ? order.gst : 18)));
    
    const subtotal = qty * rate;
    const gstAmount = subtotal * (taxRate / 100);
    const total = subtotal + gstAmount;

    return {
      orderNo: item.orderNo || order?.orderNo || order?.id || dispatchRecord.orderNo,
      productName: orderItem.productName || order?.products || 'Concrete Supply',
      code: orderItem.code || `P-${((order?.products || 'PRD').replace(/[^A-Za-z]/g, '').substring(0, 3) || 'PRD').toUpperCase()}-02`,
      qty,
      unit: item.unit || orderItem.unit || 'Pcs',
      rate,
      taxRate,
      subtotal,
      gstAmount,
      total
    };
  }) || [];

  // Calculation totals
  const subtotalSum = itemsList.reduce((sum, item) => sum + item.subtotal, 0);
  const gstAmountSum = itemsList.reduce((sum, item) => sum + item.gstAmount, 0);
  const freightCost = Number(dispatchRecord.transportCost || 0);
  const grandTotal = Number(dispatchRecord.payableAmount ?? dispatchRecord.quotedPayableAmount) ||
    subtotalSum + gstAmountSum + freightCost;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 10000 }}>
      {/* Dynamic Printing Style Reset */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide standard screen layout elements */
          .app-container,
          .main-viewport,
          .mobile-header,
          .mobile-bottom-nav,
          .sidebar,
          .app-sidebar,
          .header-container,
          .sheet-actions,
          .modal-overlay:before,
          button,
          .no-print {
            display: none !important;
          }
          /* Force printable modal sheet to fill page */
          .modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            z-index: 9999999 !important;
          }
          .invoice-sheet-modal {
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
          }
          .crm-table-container {
            border: 1px solid #000000 !important;
          }
          .crm-table th {
            background-color: #f1f5f9 !important;
            color: #000000 !important;
            border-bottom: 2px solid #000000 !important;
          }
          .crm-table td {
            border-bottom: 1px solid #DCE5F0 !important;
          }
        }
      `}} />

      <div 
        className="invoice-sheet-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '850px' }}
      >
        {/* Close Button on top right */}
        <button 
          onClick={onClose} 
          className="no-print"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#5E6B82',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#DCE5F0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
        >
          <X size={16} />
        </button>

        {/* Sheet Branding Header */}
        <div className="sheet-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px', margin: 0 }}>HIMALAYA PRODUCTS</h1>
            <p style={{ fontSize: '13px', color: '#5E6B82', fontWeight: '600', margin: '2px 0 0 0' }}>Concrete & Aggregate Supply</p>
          </div>
          <div style={{ textAlign: 'right', paddingRight: '40px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px', margin: 0 }}>DELIVERY CHALLAN</h1>
            <p style={{ fontSize: '13px', color: '#5E6B82', fontWeight: '700', margin: '4px 0 0 0' }}>Ref: {dispatchRecord.id}</p>
          </div>
        </div>

        {/* Horizontal Solid Branding Divider */}
        <hr style={{ border: 'none', borderTop: '2px solid #000000', margin: '0 0 20px 0' }} />

        {/* Client Coordinates & Dispatch Logistics details */}
        <div className="sheet-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <p style={{ margin: 0, fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Bill / Ship To:</p>
            <p style={{ margin: '4px 0 0 0', fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{customerName}</p>
            <p style={{ margin: '2px 0 0 0', color: '#475569', fontWeight: '500', fontSize: '13px', lineHeight: '1.4' }}>{address}</p>
            <p style={{ margin: '4px 0 0 0', color: '#475569', fontWeight: '600', fontSize: '13px' }}>GST: <span style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}>{gst}</span></p>
          </div>

          <div style={{ background: '#F5FAFE', padding: '12px 16px', borderRadius: '8px', border: '1px solid #DCE5F0', fontSize: '12.5px' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logistics Details:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div><strong>Date:</strong> {date}</div>
              <div><strong>Status:</strong> <span style={{ fontWeight: '700', color: dispatchStatus === 'Delivered' ? '#15803d' : '#b45309' }}>{dispatchStatus}</span></div>
              <div><strong>Vehicle No:</strong> {dispatchRecord.vehicleNumber || dispatchRecord.vehicleNo}</div>
              <div><strong>Driver:</strong> {dispatchRecord.driverName}</div>
              <div><strong>Driver Mob:</strong> {dispatchRecord.driverPhone || dispatchRecord.driverMobile}</div>
              <div><strong>Transporter:</strong> {dispatchRecord.transporter || 'Own Fleet'}</div>
              {dispatchRecord.lrNumber && dispatchRecord.lrNumber !== 'N/A' && (
                <div><strong>LR Number:</strong> {dispatchRecord.lrNumber}</div>
              )}
              {dispatchRecord.ewayBill && dispatchRecord.ewayBill !== 'N/A' && (
                <div><strong>E-Way Bill:</strong> {dispatchRecord.ewayBill}</div>
              )}
            </div>
          </div>
        </div>

        {/* Cargo Items Table */}
        <div className="crm-table-container" style={{ margin: '0 0 20px 0', border: '1px solid #eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
          <table className="crm-table" style={{ border: 'none', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0' }}>
                <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase', textAlign: 'left' }}>Order / Product Details</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Qty Dispatched</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Unit Rate</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Tax (GST)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {itemsList.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #DCE5F0' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '13.5px' }}>{item.productName}</div>
                      <div style={{ fontSize: '11.5px', color: '#5E6B82', marginTop: '2px', display: 'flex', gap: '8px' }}>
                        <span>Order: <strong>{item.orderNo}</strong></span>
                        <span>|</span>
                        <span>Code: {item.code}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>
                    {item.qty} {item.unit}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#334155' }}>
                    {formatINR(item.rate)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#5E6B82' }}>
                    {item.taxRate}%
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '800', color: '#1e293b' }}>
                    {formatINR(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations Invoice Summary panel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', margin: '20px 0' }}>
          <div style={{ display: 'flex', width: '280px', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: '500' }}>
            <span>Subtotal:</span>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatINR(subtotalSum)}</span>
          </div>
          <div style={{ display: 'flex', width: '280px', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: '500' }}>
            <span>GST Tax Amount:</span>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatINR(gstAmountSum)}</span>
          </div>
          <div style={{ display: 'flex', width: '280px', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: '500' }}>
            <span>Freight Cost (Transport):</span>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatINR(freightCost)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            width: '280px', 
            justifyContent: 'space-between', 
            fontSize: '16px', 
            fontWeight: '900', 
            color: '#1e293b', 
            borderTop: '2.5px solid #000000', 
            paddingTop: '8px', 
            marginTop: '4px' 
          }}>
            <span>Grand Total:</span>
            <span style={{ color: '#1e293b', fontSize: '18px' }}>{formatINR(grandTotal)}</span>
          </div>
        </div>

        {/* Action buttons controls */}
        <div className="sheet-actions no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid #DCE5F0', paddingTop: '16px' }}>
          <button 
            type="button" 
            className="action-btn"
            style={{ 
              background: '#f1f5f9', 
              color: '#334155', 
              border: '1px solid #D6E2F0', 
              padding: '10px 18px', 
              fontSize: '13px', 
              fontWeight: '700', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }} 
            onClick={onClose}
          >
            Close Panel
          </button>
          
          <button 
            type="button" 
            className="action-btn"
            style={{ 
              background: 'var(--color-primary)', 
              color: '#000', 
              border: 'none', 
              padding: '10px 18px', 
              fontSize: '13px', 
              fontWeight: '700', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={handlePrint}
          >
            <Printer size={15} />
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
