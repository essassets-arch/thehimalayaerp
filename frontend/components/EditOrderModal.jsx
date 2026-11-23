'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Trash2, Save, Lock, Package, FileText, AlertCircle } from 'lucide-react';
import ProductPicker from '../shared/components/ProductPicker';

const UNITS = ['PCS', 'SET', 'NOS', 'KG', 'MTR', 'SQFT', 'SQM', 'BOX', 'BAG', 'LTR'];

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function extractAddressText(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object') {
    if (addr.fullAddress) return String(addr.fullAddress);
    if (addr.line1) {
      return [addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
        .filter(Boolean)
        .join(', ');
    }
    if (addr.address) return String(addr.address);
  }
  return '';
}

function extractSpecsText(item) {
  if (typeof item?.productDetails === 'string' && item.productDetails.trim()) {
    return item.productDetails.trim();
  }
  if (typeof item?.description === 'string' && item.description.trim()) {
    return item.description.trim();
  }
  const specs = item?.specifications;
  if (typeof specs === 'string') return specs.trim();
  if (specs && typeof specs === 'object') {
    return String(specs.description || specs.details || specs.productDetails || specs.size || '').trim();
  }
  return '';
}

function toInputDate(val) {
  if (!val) return '';
  const str = String(val);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const dt = new Date(str);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().slice(0, 10);
}

export default function EditOrderModal({ order, onClose, onSave }) {
  const orderNo = order?.orderNumber || order?.orderNo || order?.orderId || order?.id || '';
  const customerDisplay =
    order?.customerName ||
    order?.customer?.companyName ||
    order?.customer?.name ||
    'Customer';

  const initialItems = useMemo(() => {
    const rawItems =
      Array.isArray(order?.items) && order.items.length > 0
        ? order.items
        : Array.isArray(order?.detailedItems)
          ? order.detailedItems
          : [];

    return rawItems.map((it, idx) => {
      const qty = Number(it.orderedQuantity ?? it.quantity ?? it.qty ?? 1);
      const rate = Number(it.unitPrice ?? it.price ?? it.rate ?? 0);
      const gross = qty * rate;
      const rawDiscountAmt = Number(it.discountAmount || 0);
      const discountPct =
        it.discount !== undefined && it.discount !== null && rawDiscountAmt === 0
          ? Number(it.discount)
          : gross > 0
            ? Number(((rawDiscountAmt / gross) * 100).toFixed(2))
            : 0;
      const alreadyDispatchedQty = Number(
        it.fulfillment?.alreadyDispatchedQty ?? it.deliveredQuantity ?? 0,
      );
      const productionCommittedQty = Number(
        it.fulfillment?.productionCommittedQty ?? 0,
      );
      const isLockedItem =
        alreadyDispatchedQty > 0 || productionCommittedQty > 0;

      return {
        rowKey: it.id || `row-${idx}-${Date.now()}`,
        id: it.id || undefined,
        productId: it.productId || it.product?.id || '',
        productName: it.productName || it.productNameSnapshot || it.product?.name || it.name || '',
        productCode: it.productCode || it.productCodeSnapshot || it.product?.sku || '',
        unit: String(it.unit || 'PCS').toUpperCase(),
        quantity: qty,
        unitPrice: rate,
        discountPct,
        taxRate: Number(it.taxRate ?? it.tax ?? 18),
        specifications: extractSpecsText(it),
        alreadyDispatchedQty,
        isLockedItem,
      };
    });
  }, [order]);

  const [customerPurchaseOrderNo, setCustomerPurchaseOrderNo] = useState(
    order?.customerPurchaseOrderNo || order?.customerPoNo || order?.poNumber || '',
  );
  const [customerPurchaseOrderDate, setCustomerPurchaseOrderDate] = useState(
    toInputDate(order?.customerPurchaseOrderDate),
  );
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState(
    toInputDate(order?.requestedDeliveryDate || order?.targetDate || order?.deliveryDate),
  );
  const [paymentTermsDays, setPaymentTermsDays] = useState(() => {
    const days = order?.paymentTermDays ?? order?.paymentTermsDays;
    if (days !== undefined && days !== null && !Number.isNaN(Number(days))) {
      return String(days);
    }
    const match = String(order?.paymentTerms || '').match(/\d+/);
    return match ? match[0] : '15';
  });
  const [deliveryTerms, setDeliveryTerms] = useState(order?.deliveryTerms || '');
  const [freightAmount, setFreightAmount] = useState(
    String(Number(order?.freightAmount ?? order?.transportCharges ?? 0)),
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    extractAddressText(order?.shippingAddress || order?.deliveryAddress),
  );
  const [remarks, setRemarks] = useState(order?.remarks || '');
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !saving) onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving]);

  const updateItem = (rowKey, patch) => {
    setItems((prev) =>
      prev.map((it) => (it.rowKey === rowKey ? { ...it, ...patch } : it)),
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        rowKey: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        id: undefined,
        productId: '',
        productName: '',
        productCode: '',
        unit: 'PCS',
        quantity: 1,
        unitPrice: 0,
        discountPct: 0,
        taxRate: 18,
        specifications: '',
        alreadyDispatchedQty: 0,
        isLockedItem: false,
      },
    ]);
  };

  const removeItem = (rowKey) => {
    setItems((prev) => prev.filter((it) => it.rowKey !== rowKey));
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxableTotal = 0;
    let taxTotal = 0;

    for (const it of items) {
      const qty = Math.max(0, Number(it.quantity) || 0);
      const price = Math.max(0, Number(it.unitPrice) || 0);
      const discPct = Math.min(100, Math.max(0, Number(it.discountPct) || 0));
      const gst = Math.max(0, Number(it.taxRate) || 0);

      const gross = qty * price;
      const discAmt = (gross * discPct) / 100;
      const taxable = Math.max(0, gross - discAmt);
      const taxAmt = (taxable * gst) / 100;

      subtotal += gross;
      discountTotal += discAmt;
      taxableTotal += taxable;
      taxTotal += taxAmt;
    }

    const freight = Math.max(0, Number(freightAmount) || 0);
    const grandTotal = taxableTotal + taxTotal + freight;
    return { subtotal, discountTotal, taxableTotal, taxTotal, freight, grandTotal };
  }, [items, freightAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Please keep at least one item in the sales order.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productId) {
        setError(`Row #${i + 1}: Please select a product from the catalog.`);
        return;
      }
      const qty = Number(it.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        setError(`Row #${i + 1} (${it.productName}): Quantity must be greater than 0.`);
        return;
      }
      if (it.alreadyDispatchedQty > 0 && qty < it.alreadyDispatchedQty) {
        setError(
          `Row #${i + 1} (${it.productName}): Quantity cannot be less than already dispatched (${it.alreadyDispatchedQty}).`,
        );
        return;
      }
      const price = Number(it.unitPrice);
      if (!Number.isFinite(price) || price < 0) {
        setError(`Row #${i + 1} (${it.productName}): Rate must be 0 or greater.`);
        return;
      }
    }

    const parsedDays = Math.max(0, parseInt(String(paymentTermsDays || '15'), 10) || 0);

    const payload = {
      customerPurchaseOrderNo: customerPurchaseOrderNo.trim(),
      customerPurchaseOrderDate: customerPurchaseOrderDate || null,
      requestedDeliveryDate: requestedDeliveryDate || null,
      paymentTermsDays: parsedDays,
      paymentTerms: `${parsedDays} Days`,
      deliveryTerms: deliveryTerms.trim(),
      freightAmount: Math.max(0, Number(freightAmount) || 0),
      deliveryAddress: deliveryAddress.trim(),
      remarks: remarks.trim(),
      items: items.map((it) => {
        const qty = Number(it.quantity) || 1;
        const price = Number(it.unitPrice) || 0;
        const discPct = Math.min(100, Math.max(0, Number(it.discountPct) || 0));
        const discountAmount = Number(((qty * price * discPct) / 100).toFixed(2));
        return {
          ...(it.id ? { id: it.id } : {}),
          productId: it.productId,
          productName: it.productName,
          productCode: it.productCode,
          orderedQuantity: qty,
          unit: it.unit || 'PCS',
          unitPrice: price,
          discountAmount,
          taxRate: Number(it.taxRate) || 0,
          specifications: it.specifications ? { description: it.specifications } : null,
        };
      }),
    };

    try {
      setSaving(true);
      await onSave(order.id || orderNo, payload);
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Failed to update sales order. Please check details and try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasAnyLockedItems = items.some((it) => it.isLockedItem);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose?.();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1060px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2F4375 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <FileText size={18} />
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                Edit Sales Order — #{orderNo}
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'rgba(255,255,255,0.18)',
                  padding: '3px 10px',
                  borderRadius: '999px',
                }}
              >
                {order?.status || 'CONFIRMED'}
              </span>
            </div>
            <div style={{ fontSize: '12.5px', opacity: 0.9, marginTop: '4px' }}>
              Customer: <strong>{customerDisplay}</strong>
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close edit modal"
            style={{
              background: 'rgba(255,255,255,0.16)',
              border: 'none',
              color: '#ffffff',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="edit-sales-order-form"
          onSubmit={handleSubmit}
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {hasAnyLockedItems && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Lock size={14} style={{ flexShrink: 0 }} />
              <span>
                Items already in production or dispatched cannot be deleted or reduced below dispatched quantity, but pricing, terms, remarks, and new line items can still be updated.
              </span>
            </div>
          )}

          {/* Header Fields Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                Customer PO Number
              </label>
              <input
                type="text"
                value={customerPurchaseOrderNo}
                onChange={(e) => setCustomerPurchaseOrderNo(e.target.value)}
                placeholder="e.g. PO-2026-041"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                Customer PO Date
              </label>
              <input
                type="date"
                value={customerPurchaseOrderDate}
                onChange={(e) => setCustomerPurchaseOrderDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                Requested Delivery Date
              </label>
              <input
                type="date"
                value={requestedDeliveryDate}
                onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                Payment Terms (Days)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(e.target.value)}
                placeholder="15"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                Delivery Terms
              </label>
              <input
                type="text"
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                placeholder="e.g. Ex-Factory / Door Delivery"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                Freight / Transport (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={freightAmount}
                onChange={(e) => setFreightAmount(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                  Delivery / Shipping Address
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Site or customer delivery address..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                  Order Remarks / Instructions
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Special dispatch or packaging instructions..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} color="#1e3a8a" />
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                  Order Items ({items.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={addItem}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add Product Row
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item, idx) => {
                const qty = Math.max(0, Number(item.quantity) || 0);
                const price = Math.max(0, Number(item.unitPrice) || 0);
                const discPct = Math.min(100, Math.max(0, Number(item.discountPct) || 0));
                const gst = Math.max(0, Number(item.taxRate) || 0);
                const taxable = Math.max(0, qty * price * (1 - discPct / 100));
                const lineTotal = taxable * (1 + gst / 100);

                return (
                  <div
                    key={item.rowKey}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                        Item #{idx + 1}
                        {item.isLockedItem && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#92400e',
                              background: '#fef3c7',
                              padding: '2px 8px',
                              borderRadius: '999px',
                            }}
                          >
                            In Production / Dispatched ({item.alreadyDispatchedQty} sent)
                          </span>
                        )}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          Line Total: {formatINR(lineTotal)}
                        </span>
                        <button
                          type="button"
                          disabled={items.length <= 1 || item.isLockedItem}
                          title={
                            item.isLockedItem
                              ? 'Cannot remove item already in production or dispatched'
                              : items.length <= 1
                                ? 'At least one item is required'
                                : 'Remove item'
                          }
                          onClick={() => removeItem(item.rowKey)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #fecaca',
                            background: items.length <= 1 || item.isLockedItem ? '#f8fafc' : '#fff1f2',
                            color: items.length <= 1 || item.isLockedItem ? '#94a3b8' : '#dc2626',
                            cursor: items.length <= 1 || item.isLockedItem ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 2fr) minmax(160px, 1.2fr)', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          Product *
                        </label>
                        {item.isLockedItem ? (
                          <input
                            type="text"
                            disabled
                            value={item.productName}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', fontSize: '13px', color: '#475569', boxSizing: 'border-box' }}
                          />
                        ) : (
                          <ProductPicker
                            value={
                              item.productId
                                ? {
                                    id: item.productId,
                                    product_name: item.productName,
                                    display_name: item.productName,
                                    product_code: item.productCode,
                                  }
                                : null
                            }
                            placeholder="Smart search product (e.g. frp 600x600)..."
                            onChange={(prod) => {
                              if (!prod) {
                                updateItem(item.rowKey, { productId: '', productName: '', productCode: '' });
                                return;
                              }
                              updateItem(item.rowKey, {
                                productId: prod.id,
                                productName: prod.product_name || prod.display_name || '',
                                productCode: prod.product_code || '',
                                unit: String(prod.unit_of_measure || item.unit || 'PCS').toUpperCase(),
                                unitPrice: Number(prod.selling_price || prod.price || item.unitPrice || 0),
                                taxRate: prod.gst_rate != null ? Number(prod.gst_rate) : item.taxRate,
                              });
                            }}
                          />
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          Details / Size / Color
                        </label>
                        <input
                          type="text"
                          value={item.specifications}
                          onChange={(e) => updateItem(item.rowKey, { specifications: e.target.value })}
                          placeholder="e.g. 600x600, Gray, Heavy Duty"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          Qty *
                        </label>
                        <input
                          type="number"
                          min={item.alreadyDispatchedQty > 0 ? item.alreadyDispatchedQty : 1}
                          step="any"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.rowKey, { quantity: e.target.value })}
                          style={{ width: '100%', padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          Unit
                        </label>
                        <select
                          value={UNITS.includes(item.unit) ? item.unit : 'PCS'}
                          onChange={(e) => updateItem(item.rowKey, { unit: e.target.value })}
                          style={{ width: '100%', padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', boxSizing: 'border-box' }}
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          Rate (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.rowKey, { unitPrice: e.target.value })}
                          style={{ width: '100%', padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={item.discountPct}
                          onChange={(e) => updateItem(item.rowKey, { discountPct: e.target.value })}
                          style={{ width: '100%', padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          GST (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={item.taxRate}
                          onChange={(e) => updateItem(item.rowKey, { taxRate: e.target.value })}
                          style={{ width: '100%', padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Financial Summary */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Subtotal</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{formatINR(totals.subtotal)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Discount</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#dc2626' }}>-{formatINR(totals.discountTotal)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>GST Tax</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>+{formatINR(totals.taxTotal)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Freight</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>+{formatINR(totals.freight)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: '#1e3a8a', fontWeight: 700 }}>Grand Total</div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#1e3a8a' }}>{formatINR(totals.grandTotal)}</div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-sales-order-form"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              background: saving ? '#94a3b8' : '#1e3a8a',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            <Save size={14} />
            {saving ? 'Saving Changes...' : 'Save Order Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
