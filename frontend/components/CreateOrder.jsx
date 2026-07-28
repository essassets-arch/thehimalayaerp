import { useState, useMemo } from 'react';
import { ArrowLeft, Box, ShoppingCart, User, Plus, Trash2, ChevronDown } from 'lucide-react';
import ProductPicker from '../shared/components/ProductPicker';
import { useFormDraft } from '../shared/hooks/useFormDraft';

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export default function CreateOrder({ 
  customers = [],
  leads = [],
  onCreateOrder, 
  onCancel 
}) {
  const getInitialItems = () => [
    { 
      id: 1, 
      productName: '', 
      productDetails: '',
      quantity: 1, 
      unitPrice: 100,
      discount: 0,
      tax: 18,
      productId: ''
    }
  ];

  const emptyOrderForm = {
    customerName: '',
    selectedCustomerId: '',
    items: getInitialItems(),
    notes: ''
  };

  const { formData, setFormData, clearDraft } = useFormDraft({
    draftKey: 'erp_draft_create_order_new',
    initialData: emptyOrderForm
  });

  const { customerName, selectedCustomerId, items, notes } = formData;
  const [error, setError] = useState('');
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'function' ? value(prev[field]) : value
    }));
  };

  const normalizeText = (value) => String(value || '').trim().toLowerCase();

  const customerOptions = useMemo(() => {
    const options = [
      ...customers.map(customer => ({
        key: `customer-${customer.id}`,
        type: 'Customer',
        id: customer.id,
        name: customer.name || customer.customerName || '',
        subtitle: 'Customer'
      })),
      ...leads.map(lead => ({
        key: `lead-${lead.id}`,
        type: 'Lead',
        id: lead.id,
        name: lead.companyName || lead.customerName || lead.projectName || '',
        subtitle: 'Lead'
      }))
    ].filter(option => option.name);

    const seen = new Set();
    return options.filter(option => {
      const key = `${normalizeText(option.name)}-${option.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [leads, customers]);

  const filteredCustomerOptions = useMemo(() => {
    const query = normalizeText(customerName);
    if (!query) return customerOptions.slice(0, 8);
    return customerOptions
      .filter(option => (
        normalizeText(option.name).includes(query) ||
        normalizeText(option.subtitle).includes(query)
      ))
      .slice(0, 8);
  }, [customerOptions, customerName]);

  const selectCustomerOption = (option) => {
    updateField('customerName', option.name);
    updateField('selectedCustomerId', option.id);
    setCustomerSearchOpen(false);
  };

  const handleRowChange = (id, field, value) => {
    updateField('items', prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddItem = () => {
    updateField('items', prev => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map(i => i.id)) + 1 : 1,
        productName: '',
        productDetails: '',
        quantity: 1,
        unitPrice: 100,
        discount: 0,
        tax: 18,
        productId: ''
      }
    ]);
  };

  const handleRemoveItem = (id) => {
    updateField('items', prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomerId) {
      setError('Please select an existing customer or lead from the list.');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one item to the order.');
      return;
    }

    const invalidItems = items.filter(i => !i.productId || !i.productName);
    if (invalidItems.length > 0) {
      setError('Please select a catalog product for all items.');
      return;
    }

    const submitResult = async () => {
      let success = false;
      try {
        const payload = {
          customerId: selectedCustomerId,
          remarks: notes,
          items: items.map(i => ({
            productId: i.productId,
            orderedQuantity: Number(i.quantity),
            unit: 'Units',
            unitPrice: Number(i.unitPrice),
            discountAmount: (Number(i.quantity) * Number(i.unitPrice) * Number(i.discount)) / 100,
            taxRate: Number(i.tax),
            specifications: i.productDetails ? { details: i.productDetails } : {}
          }))
        };
        
        const res = await onCreateOrder(payload);
        success = res?.success !== false;
      } catch (err) {
        console.error(err);
      }
      
      if (success) {
        clearDraft();
      }
    };
    submitResult();
  };

  return (
    <div className="app-card" style={{ flex: 1, padding: '24px' }}>
      <div className="module-header-row" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            type="button" 
            className="card-top-icon-btn" 
            onClick={onCancel} 
            style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="module-title">Create Direct Purchase Order</h2>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#f87171', fontSize: '13px', fontWeight: 'bold' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Customer Coordinate */}
        <div className="form-group" style={{ position: 'relative', maxWidth: '600px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={13} style={{ color: 'var(--color-primary)' }} /> Customer / Corporate Company *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search existing lead or customer"
              value={customerName}
              onChange={e => {
                updateField('customerName', e.target.value);
                setCustomerSearchOpen(true);
                updateField('selectedCustomerId', '');
              }}
              onFocus={() => setCustomerSearchOpen(true)}
              onBlur={() => setTimeout(() => setCustomerSearchOpen(false), 200)}
              required
              style={{ paddingRight: '38px', background: 'rgba(0,0,0,0.2)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}
            />
            <ChevronDown size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5E6B82', pointerEvents: 'none' }} />
            {customerSearchOpen && (
              <div
                className="smart-search-dropdown"
                style={{
                  width: '100%',
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 40,
                  maxHeight: '260px',
                  overflowY: 'auto',
                  borderRadius: '10px',
                  boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                {filteredCustomerOptions.length > 0 ? (
                  filteredCustomerOptions.map(option => (
                    <button
                      key={option.key}
                      type="button"
                      className="smart-search-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectCustomerOption(option);
                      }}
                      style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: '10px 14px', cursor: 'pointer', display: 'block' }}
                    >
                      <div style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>{option.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>{option.subtitle}</div>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>No matching customers or leads</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="section-container" style={{ marginTop: '10px', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', background: 'rgba(255,255,255,0.015)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={16} style={{ color: 'var(--color-primary)' }} /> Order Items
            </h3>
            <button type="button" className="btn-small btn-primary-small" onClick={handleAddItem} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Add Product
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '280px' }}>Product & Specification Details *</th>
                  <th style={{ width: '100px' }}>Quantity *</th>
                  <th style={{ width: '120px' }}>Unit Price (₹) *</th>
                  <th style={{ width: '100px' }}>Discount (%)</th>
                  <th style={{ width: '100px' }}>GST (%)</th>
                  <th style={{ width: '130px' }}>Total Amount</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td data-label="Product & Details" style={{ verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ position: 'relative' }}>
                          <ProductPicker
                            value={item.productId ? { id: item.productId, product_name: item.productName } : null}
                            onChange={(p) => {
                              handleRowChange(item.id, 'productId', p?.id || '');
                              handleRowChange(item.id, 'productName', p?.product_name || '');
                            }}
                            placeholder="Search product..."
                            showBadge={false}
                          />
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Specifications / Color details *"
                          value={item.productDetails}
                          onChange={e => handleRowChange(item.id, 'productDetails', e.target.value)}
                          required
                          style={{ padding: '6px 12px', fontSize: '12.5px', width: '100%' }}
                        />
                      </div>
                    </td>
                    <td data-label="Quantity" style={{ verticalAlign: 'top' }}>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="1" 
                        value={item.quantity} 
                        onChange={e => handleRowChange(item.id, 'quantity', Number(e.target.value))}
                        required
                      />
                    </td>
                    <td data-label="Unit Price" style={{ verticalAlign: 'top' }}>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0.01" 
                        step="0.01"
                        value={item.unitPrice} 
                        onChange={e => handleRowChange(item.id, 'unitPrice', Number(e.target.value))}
                        required
                      />
                    </td>
                    <td data-label="Discount (%)" style={{ verticalAlign: 'top' }}>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0" 
                        max="100"
                        value={item.discount} 
                        onChange={e => handleRowChange(item.id, 'discount', Number(e.target.value))}
                      />
                    </td>
                    <td data-label="GST (%)" style={{ verticalAlign: 'top' }}>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0" 
                        max="100"
                        value={item.tax} 
                        onChange={e => handleRowChange(item.id, 'tax', Number(e.target.value))}
                      />
                    </td>
                    <td data-label="Total Amount" style={{ fontWeight: '700', verticalAlign: 'top', paddingTop: '16px' }}>
                      {(() => {
                        const itemSubtotal = item.quantity * item.unitPrice;
                        const itemDiscountAmt = (itemSubtotal * (item.discount || 0)) / 100;
                        const itemTaxable = itemSubtotal - itemDiscountAmt;
                        const itemTaxAmt = (itemTaxable * (item.tax || 0)) / 100;
                        return formatINR(itemTaxable + itemTaxAmt);
                      })()}
                    </td>
                    <td data-label="Action" style={{ textAlign: 'center', verticalAlign: 'top' }}>
                      <button 
                        type="button" 
                        className="btn-small btn-danger-small" 
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', opacity: items.length === 1 ? 0.4 : 1 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="form-group" style={{ maxWidth: '100%' }}>
          <label className="form-label">Order Notes / Remarks</label>
          <textarea
            className="form-input"
            rows="2"
            value={notes}
            onChange={e => updateField('notes', e.target.value)}
            placeholder="Add any internal notes..."
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>

        {/* Form controls */}
        <div className="form-actions" style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button type="submit" className="form-submit-btn" style={{ margin: 0, padding: '12px 24px' }}>
            ✓ Create Order
          </button>
          <button 
            type="button" 
            className="btn-small btn-outline-small" 
            onClick={onCancel}
            style={{ margin: 0, display: 'flex', alignItems: 'center', padding: '12px 24px', background: 'transparent', color: '#fff' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
