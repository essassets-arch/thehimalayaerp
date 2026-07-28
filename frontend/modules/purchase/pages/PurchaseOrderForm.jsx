'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { ArrowLeft, Plus, Trash2, Calendar, FileText, IndianRupee, Percent } from 'lucide-react';
import * as purchaseService from '../services/purchase.service';

export default function PurchaseOrderForm() {
  const navigate = useRouter();
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Current item builder states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDiscount, setItemDiscount] = useState('0');
  const [itemGstRate, setItemGstRate] = useState('18');

  // List of added items
  const [addedItems, setAddedItems] = useState([]);

  useEffect(() => {
    const loadFormData = async () => {
      setIsLoading(true);
      try {
        const [vendorsData, productsData] = await Promise.all([
          purchaseService.getVendors({ is_active: true }),
          purchaseService.getProducts()
        ]);
        setVendors(vendorsData || []);
        setProducts(productsData || []);
      } catch (err) {
        console.error('Error loading PO form metadata:', err);
        Swal.fire('Error', 'Failed to load vendors or products data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadFormData();
  }, []);

  // Sync default price when product selection changes
  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find(p => p.id === parseInt(selectedProductId));
      if (prod && prod.standard_cost) {
        setItemPrice(String(prod.standard_cost));
      } else {
        setItemPrice('');
      }
    }
  }, [selectedProductId, products]);

  const handleAddItem = () => {
    if (!selectedProductId) {
      Swal.fire('Warning', 'Please select a product', 'warning');
      return;
    }
    const qty = parseFloat(itemQty);
    if (isNaN(qty) || qty <= 0) {
      Swal.fire('Warning', 'Please enter a valid quantity greater than 0', 'warning');
      return;
    }
    const price = parseFloat(itemPrice);
    if (isNaN(price) || price < 0) {
      Swal.fire('Warning', 'Please enter a valid unit price', 'warning');
      return;
    }
    const discount = parseFloat(itemDiscount) || 0;
    if (discount < 0) {
      Swal.fire('Warning', 'Discount cannot be negative', 'warning');
      return;
    }

    const gstRate = parseFloat(itemGstRate) || 0;
    const prod = products.find(p => p.id === parseInt(selectedProductId));
    if (!prod) return;

    // Check if item already added
    if (addedItems.some(item => item.product_id === prod.id)) {
      Swal.fire('Warning', 'Product is already added to the PO. Please edit or delete it.', 'warning');
      return;
    }

    const subtotal = qty * price;
    const itemDiscountVal = discount;
    const itemTaxVal = ((subtotal - itemDiscountVal) * gstRate) / 100;
    const total = subtotal - itemDiscountVal + itemTaxVal;

    const newItem = {
      product_id: prod.id,
      product_name: prod.product_name,
      product_code: prod.product_code,
      unit_of_measure: prod.unit_of_measure,
      quantity_ordered: qty,
      unit_price: price,
      discount: itemDiscountVal,
      gst_rate: gstRate,
      tax_amount: itemTaxVal,
      total_price: total
    };

    setAddedItems([...addedItems, newItem]);
    
    // Clear item inputs
    setSelectedProductId('');
    setItemQty('');
    setItemPrice('');
    setItemDiscount('0');
    setItemGstRate('18');
  };

  const handleRemoveItem = (index) => {
    setAddedItems(addedItems.filter((_, idx) => idx !== index));
  };

  // Calculations for PO Summary
  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    
    addedItems.forEach(item => {
      subtotal += item.quantity_ordered * item.unit_price;
      discountTotal += item.discount;
      taxTotal += item.tax_amount;
    });

    const grandTotal = subtotal - discountTotal + taxTotal;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal
    };
  };

  const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals();

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!selectedVendorId) {
      Swal.fire('Warning', 'Please select a vendor', 'warning');
      return;
    }
    if (addedItems.length === 0) {
      Swal.fire('Warning', 'Please add at least one item to the purchase order', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Generate Purchase Order?',
      text: `Create PO with ${addedItems.length} items for a total of ₹${grandTotal.toLocaleString('en-IN')}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Generate PO',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const poData = {
          vendor_id: parseInt(selectedVendorId),
          po_date: poDate,
          delivery_date: deliveryDate || null,
          notes: notes || null
        };

        const items = addedItems.map(item => ({
          product_id: item.product_id,
          quantity_ordered: item.quantity_ordered,
          unit_price: item.unit_price,
          discount: item.discount,
          tax_amount: item.tax_amount
        }));

        await purchaseService.createPurchaseOrder({ ...poData, items });
        
        Swal.fire({
          icon: 'success',
          title: 'Purchase Order Created',
          text: 'Purchase Order generated successfully in Draft status.',
          confirmButtonText: 'View PO List'
        }).then(() => {
          navigate.push('/store/purchase/orders');
        });
      } catch (err) {
        console.error('Create PO error:', err);
        Swal.fire('Error', err.message || 'Failed to create Purchase Order', 'error');
      }
    }
  };

  const formatCurrency = (val) => {
    return `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Row */}
      <div className="module-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="module-title">Create Purchase Order</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Draft a new purchase order with materials list to dispatch to your registered suppliers.
          </p>
        </div>
        <button className="action-btn" style={{ background: '#f1f5f9', border: '1px solid #D6E2F0', color: '#334155', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate.push('/store/purchase/orders')}>
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Vendor & Items Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Vendor & Order details */}
          <div className="app-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Supplier & Schedule Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Select Supplier/Vendor *</label>
                <select 
                  className="form-select" 
                  value={selectedVendorId} 
                  onChange={e => setSelectedVendorId(e.target.value)}
                  style={{ height: '42px' }}
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.vendor_name} ({v.vendor_code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Expected Delivery Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={deliveryDate} 
                  onChange={e => setDeliveryDate(e.target.value)}
                  style={{ height: '42px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>PO Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={poDate} 
                  onChange={e => setPoDate(e.target.value)}
                  style={{ height: '42px' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Internal Notes / Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Urgently required for heavy machinery division"
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  style={{ height: '42px' }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Items builder */}
          <div className="app-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Add Material / Product Line</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Product / Material *</label>
                <select 
                  className="form-select" 
                  value={selectedProductId} 
                  onChange={e => setSelectedProductId(e.target.value)}
                  style={{ height: '42px' }}
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.product_name} ({p.product_code}) [{p.unit_of_measure}]</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Quantity *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="0.00"
                  value={itemQty} 
                  onChange={e => setItemQty(e.target.value)}
                  style={{ height: '42px' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Unit Rate (₹) *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="0.00"
                  value={itemPrice} 
                  onChange={e => setItemPrice(e.target.value)}
                  style={{ height: '42px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Discount Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="0.00"
                  value={itemDiscount} 
                  onChange={e => setItemDiscount(e.target.value)}
                  style={{ height: '42px' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700' }}>GST Rate (%)</label>
                <select 
                  className="form-select" 
                  value={itemGstRate} 
                  onChange={e => setItemGstRate(e.target.value)}
                  style={{ height: '42px' }}
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>

              <button 
                type="button" 
                className="action-btn" 
                style={{ 
                  background: 'var(--color-primary)', 
                  color: '#000', 
                  fontWeight: 'bold', 
                  height: '42px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={handleAddItem}
              >
                <Plus size={16} /> Add to checklist
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Added items list & summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 3: Checklist summary */}
          <div className="app-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', margin: 0 }}>Items Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              {addedItems.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '20px 0', fontSize: '13px' }}>
                  <FileText size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <div>No items added yet. Complete the builder to add product lines.</div>
                </div>
              ) : (
                addedItems.map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px', position: 'relative' }}>
                    <button 
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      onClick={() => handleRemoveItem(idx)}
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--color-text-primary)', paddingRight: '20px' }}>
                      {item.product_name}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      <span>Code: {item.product_code}</span>
                      <span>Unit: {item.unit_of_measure}</span>
                    </div>

                    <div style={{ borderTop: '1px dashed var(--color-border)', marginTop: '8px', paddingTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px' }}>
                      <div>Qty: <strong>{item.quantity_ordered.toLocaleString()}</strong></div>
                      <div>Rate: <strong>{formatCurrency(item.unit_price)}</strong></div>
                      {item.discount > 0 && <div style={{ color: '#ef4444' }}>Discount: <strong>-{formatCurrency(item.discount)}</strong></div>}
                      <div>GST ({item.gst_rate}%): <strong>+{formatCurrency(item.tax_amount)}</strong></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '6px', fontSize: '12px' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Item Total:</span>
                      <strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(item.total_price)}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Panel */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Gross Total:</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              {discountTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Discount Total:</span>
                  <strong>-{formatCurrency(discountTotal)}</strong>
                </div>
              )}
              {taxTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>GST Tax Total:</span>
                  <strong>+{formatCurrency(taxTotal)}</strong>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '16px', 
                fontWeight: 'bold', 
                borderTop: '2px dashed var(--color-border)', 
                paddingTop: '10px', 
                marginTop: '6px',
                color: 'var(--color-primary)'
              }}>
                <span>PO Total Value:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button 
              className="action-btn" 
              style={{ 
                background: 'var(--color-primary)', 
                color: '#000', 
                fontWeight: 'bold', 
                width: '100%', 
                padding: '12px',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={handleCreatePO}
              disabled={isLoading || addedItems.length === 0}
            >
              <FileText size={16} /> Draft Purchase Order
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
