import React, { useState, useEffect, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import { CheckCircle, Box, Truck, PackageCheck, X } from 'lucide-react';
import OrderTimeline from '../../components/OrderTimeline';
import { useERPStore } from '../../store/erpStore';
import { backendFetch } from '../../lib/backendFetch';

export default function OrderDetailsModal({ order, role, onClose }) {
  if (!order) return null;

  // Hide pricing for production and plant-head roles — they only need product + quantity
  const isProduction = role === 'production' || role === 'plant';

  // Normalize data formats to support both top-level state data and custom format data
  const orderRef = order.orderNo || order.ref || order.salesOrderNumber || '';
  const customerName = order.customerName || (order.customer && typeof order.customer === 'object' ? (order.customer.name || order.customer.companyName) : order.customer) || '';
  const date = order.date || order.orderDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : '2026-06-05');
  
  const orderStatus = order.status || order.salesStatus || 'Pending';
  const productionStatus = order.productionStatus || 'Pending';
  const dispatchStatus = order.dispatchStatus || 'Pending';

  // Global ERP store for cross-referencing customer / lead / order records
  const erpState = useERPStore(s => s.state || s) || {};
  const allOrders = useMemo(() => Array.isArray(erpState.orders) ? erpState.orders : [], [erpState.orders]);
  const allCustomers = useMemo(() => Array.isArray(erpState.customers) ? erpState.customers : [], [erpState.customers]);
  const allLeads = useMemo(() => Array.isArray(erpState.leads) ? erpState.leads : [], [erpState.leads]);

  // Async data state in case caller only passed minimal order summary
  const [asyncData, setAsyncData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFullDetails = async () => {
      // If we already have explicit address and GST, no need for network lookup
      if ((order.billingAddress || order.address || order.customer?.billingAddress) && (order.gstin || order.customer?.gstin)) {
        return;
      }
      try {
        if (orderRef) {
          const res = await backendFetch(`/api/backend/sales/orders/lookup/by-number?orderNumber=${encodeURIComponent(orderRef)}`);
          if (isMounted && res) {
            setAsyncData(res);
            return;
          }
        }
      } catch {
        // Soft fallback: silently continue with local store resolution
      }
    };
    fetchFullDetails();
    return () => { isMounted = false; };
  }, [orderRef, order]);

  // Address formatter
  const resolveAddressString = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') {
      const trimmed = addr.trim();
      if (!trimmed || trimmed.toLowerCase().includes('andheri, mumbai (default address)') || trimmed.toLowerCase() === 'andheri, mumbai') {
        return '';
      }
      return trimmed;
    }
    if (typeof addr === 'object') {
      const parts = [
        addr.line1 || addr.addressLine1 || addr.street,
        addr.line2 || addr.addressLine2,
        addr.city || addr.district,
        addr.state,
        addr.country,
        addr.pincode || addr.pinCode || addr.postalCode || addr.zipCode
      ].filter(Boolean);
      return parts.join(', ') || '';
    }
    return '';
  };

  // GSTIN formatter & validator
  const resolveGstString = (val) => {
    if (!val) return '';
    const str = String(val).trim();
    if (str.toUpperCase() === '27ABCDE4321G2Z8') return '';
    if (/^\d{1,2}%?$/.test(str)) return ''; // tax rate e.g. 18 or 18%
    return str;
  };

  const matchedCustomer = useMemo(() => {
    return allCustomers.find(c =>
      (c.id && (c.id === order.customerId || c.id === order.customer?.id)) ||
      (c.name && customerName && c.name.toLowerCase() === customerName.toLowerCase()) ||
      (c.companyName && customerName && c.companyName.toLowerCase() === customerName.toLowerCase())
    );
  }, [allCustomers, order, customerName]);

  const matchedLead = useMemo(() => {
    return allLeads.find(l =>
      (l.id && (l.id === order.leadId || l.id === order.customer?.leadId)) ||
      (l.companyName && customerName && l.companyName.toLowerCase() === customerName.toLowerCase())
    );
  }, [allLeads, order, customerName]);

  const matchedOrder = useMemo(() => {
    return allOrders.find(o =>
      (orderRef && String(o.orderNo || o.orderNumber || o.id) === String(orderRef)) ||
      (order.id && o.id === order.id)
    );
  }, [allOrders, orderRef, order]);

  // Resolve dynamic address
  const resolvedAddress =
    resolveAddressString(order.address) ||
    resolveAddressString(order.billingAddress) ||
    resolveAddressString(order.shippingAddress) ||
    resolveAddressString(order.deliveryAddress) ||
    resolveAddressString(order.customerAddress) ||
    resolveAddressString(order.customer?.billingAddress) ||
    resolveAddressString(order.customer?.shippingAddress) ||
    resolveAddressString(order.customer?.address) ||
    resolveAddressString(order.rawSalesOrder?.billingAddress) ||
    resolveAddressString(order.rawSalesOrder?.shippingAddress) ||
    resolveAddressString(order.rawSalesOrder?.customer?.billingAddress) ||
    resolveAddressString(order.rawSalesOrder?.customer?.shippingAddress) ||
    resolveAddressString(order.rawSalesOrder?.customer?.address) ||
    resolveAddressString(order.salesOrder?.billingAddress) ||
    resolveAddressString(order.salesOrder?.shippingAddress) ||
    resolveAddressString(order.salesOrder?.customer?.billingAddress) ||
    resolveAddressString(order.salesOrder?.customer?.shippingAddress) ||
    resolveAddressString(order.sourceQuotation?.customerAddress) ||
    resolveAddressString(order.sourceQuotation?.billingAddress) ||
    resolveAddressString(order.sourceQuotation?.shippingAddress) ||
    resolveAddressString(asyncData?.billingAddress) ||
    resolveAddressString(asyncData?.shippingAddress) ||
    resolveAddressString(asyncData?.customer?.billingAddress) ||
    resolveAddressString(asyncData?.customer?.shippingAddress) ||
    resolveAddressString(asyncData?.customer?.address) ||
    resolveAddressString(matchedOrder?.billingAddress) ||
    resolveAddressString(matchedOrder?.shippingAddress) ||
    resolveAddressString(matchedOrder?.deliveryAddress) ||
    resolveAddressString(matchedOrder?.customer?.billingAddress) ||
    resolveAddressString(matchedOrder?.customer?.shippingAddress) ||
    resolveAddressString(matchedOrder?.customer?.address) ||
    resolveAddressString(matchedCustomer?.billingAddress) ||
    resolveAddressString(matchedCustomer?.shippingAddress) ||
    resolveAddressString(matchedCustomer?.address) ||
    resolveAddressString(matchedLead?.address) ||
    (matchedCustomer?.city ? `${matchedCustomer.city}, ${matchedCustomer.state || 'India'}` : '') ||
    'Address Not Specified';

  // Resolve dynamic GSTIN
  const resolvedGst =
    resolveGstString(order.gstin) ||
    resolveGstString(order.gstNumber) ||
    resolveGstString(order.customerGst) ||
    resolveGstString(order.customerGstin) ||
    resolveGstString(order.customer?.gstin) ||
    resolveGstString(order.customer?.gstNumber) ||
    resolveGstString(order.customer?.gst) ||
    resolveGstString(order.rawSalesOrder?.customer?.gstin) ||
    resolveGstString(order.rawSalesOrder?.customer?.gstNumber) ||
    resolveGstString(order.salesOrder?.customer?.gstin) ||
    resolveGstString(order.sourceQuotation?.gstin) ||
    resolveGstString(asyncData?.customer?.gstin) ||
    resolveGstString(asyncData?.gstin) ||
    resolveGstString(matchedOrder?.customer?.gstin) ||
    resolveGstString(matchedOrder?.gstin) ||
    resolveGstString(matchedCustomer?.gstin) ||
    resolveGstString(matchedCustomer?.gstNumber) ||
    resolveGstString(matchedCustomer?.gst) ||
    resolveGstString(matchedLead?.gstNumber) ||
    resolveGstString(matchedLead?.gstin) ||
    resolveGstString(order.gst);

  const displayGst = resolvedGst || 'Unregistered / Non-GST';

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

  const transportVal = order.transportCharge !== undefined ? order.transportCharge : 0;

  const itemsList = order.detailedItems || order.items || [
    {
      name: order.products || order.product || 'Unknown Product',
      code: order.code || `P-${((order.products || order.product || 'PRD').replace(/[^A-Za-z]/g, '').substring(0, 3) || 'PRD').toUpperCase()}-02`,
      qty: order.quantity || order.qty || 1,
      rate: order.rate || ((order.payment?.totalAmount || order.totalValue || 0) - transportVal) / (order.quantity || 1),
      gst: order.tax !== undefined ? order.tax : (order.gst !== undefined ? order.gst : 18),
      total: order.total || order.totalValue || 0
    }
  ];

  // Helper calculation values for fallback invoice totals if not explicitly provided
  const rawSubtotal = itemsList.reduce((sum, item) => {
    const qtyVal = item.qty || item.quantity || 1;
    const rateVal = item.rate || item.unitPrice || 0;
    return sum + (qtyVal * rateVal);
  }, 0);

  const rawGstAmount = itemsList.reduce((sum, item) => {
    const qtyVal = item.qty || item.quantity || 1;
    const rateVal = item.rate || item.unitPrice || 0;
    const gstVal = item.gst !== undefined ? item.gst : (item.tax !== undefined ? item.tax : 18);
    return sum + (qtyVal * rateVal * (gstVal / 100));
  }, 0);

  const rawGrandTotal = rawSubtotal + rawGstAmount;

  // Dynamically compute transportVal fallback if it is not explicitly stored on the order,
  // by calculating the difference between recorded grand total and raw items total + tax.
  const orderGrandTotal = order.payment?.totalAmount || order.totalValue || rawGrandTotal;
  const computedTransportVal = order.transportCharge !== undefined ? order.transportCharge : Math.max(0, orderGrandTotal - rawGrandTotal);

  const displaySubtotal = order.subtotal !== undefined ? formatINR(order.subtotal) : formatINR(rawSubtotal);
  const displayGstAmount = order.gstAmount !== undefined ? formatINR(order.gstAmount) : formatINR(rawGstAmount);
  const displayGrandTotal = order.grandTotal !== undefined ? formatINR(order.grandTotal) : formatINR(orderGrandTotal);

  const getDispatchBadge = (status) => {
    const s = status || 'Pending';
    switch (s) {
      case 'Delivered':
        return 'badge badge-approved';
      case 'Dispatched':
        return 'badge badge-sent';
      default:
        return 'badge badge-pending';
    }
  };

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="invoice-sheet-modal" 
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Sheet Branding Header */}
        <div className="sheet-header">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px', margin: 0 }}>HIMALAYA PRODUCTS</h1>
            <p style={{ fontSize: '13px', color: '#5E6B82', fontWeight: '600', margin: '2px 0 0 0' }}>Concrete & Aggregate Supply</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px', margin: 0 }}>ORDER</h1>
            <p style={{ fontSize: '13px', color: '#5E6B82', fontWeight: '700', margin: '4px 0 0 0' }}>Ref: {orderRef}</p>
          </div>
        </div>

        {/* Horizontal Solid Branding Divider */}
        <hr style={{ border: 'none', borderTop: '2px solid #000000', margin: '0 0 24px 0' }} />

        {/* Client Coordinates & Order Details */}
        <div className="sheet-meta">
          <div>
            <p style={{ margin: 0, fontWeight: '700', color: '#5E6B82', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Bill To:</p>
            <p style={{ margin: '4px 0 0 0', fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{customerName}</p>
            <p style={{ margin: '4px 0 0 0', color: '#475569', fontWeight: '500', fontSize: '13.5px', lineHeight: '1.4' }}>{resolvedAddress}</p>
            <p style={{ margin: '8px 0 0 0', color: '#1e293b', fontWeight: '700', fontSize: '12.5px' }}>GST: <span style={{ color: resolvedGst ? '#0369a1' : '#64748B', fontWeight: resolvedGst ? '700' : '500' }}>{displayGst}</span></p>
          </div>
          <div className="sheet-meta-right" style={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: '12px', rowGap: '12px', alignItems: 'center' }}>
            <p style={{ margin: 0, textAlign: 'right', fontWeight: '700', color: '#5E6B82', fontSize: '13px' }}>Order Date:</p>
            <p style={{ margin: 0, textAlign: 'left', fontWeight: '500', color: '#475569', fontSize: '14px' }}>{date}</p>
            
            <p style={{ margin: 0, textAlign: 'right', fontWeight: '700', color: '#5E6B82', fontSize: '13px' }}>Order Status:</p>
            <div style={{ textAlign: 'left' }}><StatusBadge status={orderStatus} /></div>
            
            <p style={{ margin: 0, textAlign: 'right', fontWeight: '700', color: '#5E6B82', fontSize: '13px' }}>Production Status:</p>
            <div style={{ textAlign: 'left' }}><StatusBadge status={productionStatus} /></div>
            
            <p style={{ margin: 0, textAlign: 'right', fontWeight: '700', color: '#5E6B82', fontSize: '13px' }}>Dispatch Status:</p>
            <div style={{ textAlign: 'left' }}><span className={getDispatchBadge(dispatchStatus)} style={{ margin: 0 }}>{dispatchStatus}</span></div>
          </div>
        </div>

        {/* Items Table */}
        <div className="crm-table-container hide-scrollbar" style={{ margin: '0 0 24px 0', border: '1px solid #eaeaea', borderRadius: '12px', overflow: 'hidden' }}>
          <table className="crm-table responsive-table" style={{ border: 'none' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Product Details</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Qty</th>
                {!isProduction && <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Rate</th>}
                {!isProduction && <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Tax (GST)</th>}
                {!isProduction && <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Total</th>}
              </tr>
            </thead>
            <tbody>
              {itemsList.map((item, index) => {
                const itemName = item.name || item.productName || '';
                const itemCode = item.code || '';
                const qtyVal = item.qty || item.quantity || 1;
                const rateVal = item.rate || item.unitPrice || 0;
                const gstVal = item.gst !== undefined ? item.gst : (item.tax !== undefined ? item.tax : 18);
                const totalVal = item.total || (qtyVal * rateVal * (1 + gstVal / 100));

                return (
                  <tr key={index}>
                    <td data-label="Product Details">
                      <div>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{itemName}</div>
                        {item.productDetails && (
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>{item.productDetails}</div>
                        )}
                        <div style={{ fontSize: '11px', color: '#5E6B82', marginTop: '2px', fontFamily: 'monospace' }}>Code: {itemCode}</div>
                      </div>
                    </td>
                    <td data-label="Qty" style={{ textAlign: 'center', fontWeight: '600', color: '#334155' }}>{qtyVal}</td>
                    {!isProduction && <td data-label="Rate" style={{ textAlign: 'center', fontWeight: '600', color: '#334155' }}>{formatINR(rateVal)}</td>}
                    {!isProduction && <td data-label="Tax (GST)" style={{ textAlign: 'center', fontWeight: '600', color: '#5E6B82' }}>{gstVal}%</td>}
                    {!isProduction && <td data-label="Total" style={{ textAlign: 'right', fontWeight: '800', color: '#1e293b' }}>{formatINR(totalVal)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculations Invoice Summary panel */}
        {!isProduction && (
          <div className="sheet-summary">
            <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: '500' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>{displaySubtotal}</span>
            </div>
            <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: '500' }}>
              <span>GST Amount:</span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>{displayGstAmount}</span>
            </div>
            {computedTransportVal > 0 && (
              <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '13.5px', color: '#0369a1', fontWeight: '500' }}>
                <span>Transport (Approx.):</span>
                <span style={{ fontWeight: '600' }}>+{formatINR(computedTransportVal)}</span>
              </div>
            )}
            <div style={{ display: 'flex', width: '260px', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#1e293b', borderTop: '1px solid #eaeaea', paddingTop: '8px', marginTop: '4px' }}>
              <span>Grand Total:</span>
              <span style={{ color: '#1e293b', fontSize: '17px' }}>{displayGrandTotal}</span>
            </div>
          </div>
        )}

        {/* Live Order Timeline Progress Tracking */}
        <OrderTimeline orderId={orderRef} compact={true} />

        {/* Action buttons controls */}
        <div className="sheet-actions">
          <button 
            type="button" 
            className="btn-small btn-outline-small" 
            onClick={onClose}
            style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', margin: 0 }}
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
