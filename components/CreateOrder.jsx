import { useState } from 'react';
import { ArrowLeft, Box, ShoppingCart, User } from 'lucide-react';
import ProductPicker from '../shared/components/ProductPicker';
import { useFormDraft } from '../shared/hooks/useFormDraft';

export default function CreateOrder({ 
  customers = [],
  onCreateOrder, 
  onCancel 
}) {
  const emptyOrderForm = {
    customerName: '',
    selectedCustomerId: '',
    productName: 'Concrete Cylinders (x1000)',
    quantity: '10',
    selectedProduct: null
  };

  const { formData, setFormData, clearDraft } = useFormDraft({
    draftKey: 'erp_draft_create_order_new',
    initialData: emptyOrderForm
  });

  const { customerName, selectedCustomerId, productName, quantity, selectedProduct } = formData;
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'function' ? value(prev[field]) : value
    }));
  };

  const setCustomerName = (val) => updateField('customerName', val);
  const setSelectedCustomerId = (val) => updateField('selectedCustomerId', val);
  const setProductName = (val) => updateField('productName', val);
  const setQuantity = (val) => updateField('quantity', val);
  const setSelectedProduct = (val) => updateField('selectedProduct', val);

  const handleCustomerSelectChange = (e) => {
    const val = e.target.value;
    setSelectedCustomerId(val);
    if (val === 'new') {
      setCustomerName('');
    } else {
      const custObj = customers.find(c => c.id === val);
      if (custObj) {
        setCustomerName(custObj.name);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Please select or specify a customer name.');
      return;
    }

    if (!selectedProduct) {
      setError('Please select a product from the catalog.');
      return;
    }

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Please specify a valid quantity greater than zero.');
      return;
    }

    const submitResult = async () => {
      let success = false;
      try {
        const res = await onCreateOrder({
          customerName: customerName.trim(),
          productName: selectedProduct.product_name,
          productId: selectedProduct.id,
          quantity: qtyNum
        });
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
    <div className="app-card" style={{ flex: 1 }}>
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
        {/* Customer Coordinate */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={13} style={{ color: 'var(--color-primary)' }} /> Select Existing Customer Account
          </label>
          <select 
            className="form-select" 
            style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)', fontWeight: 'bold' }}
            value={selectedCustomerId}
            onChange={handleCustomerSelectChange}
          >
            <option value="">-- Choose Account (Or Add New Below) --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="new">+ Specify New Customer --</option>
          </select>
        </div>

        {/* Custom Input when new or selected new */}
        {(!selectedCustomerId || selectedCustomerId === 'new') && (
          <div className="form-group">
            <label className="form-label">Customer Company Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Reliance Projects Ltd" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)} 
              required 
              style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}
            />
          </div>
        )}

        {/* Product Catalog dropdown */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Box size={13} style={{ color: 'var(--color-accent-teal)' }} /> Select Catalogue Product *
          </label>
          <ProductPicker
            value={selectedProduct}
            onChange={(p) => {
              setSelectedProduct(p);
              if (p) setProductName(p.product_name);
            }}
            placeholder="Search product..."
            showBadge={true}
          />
        </div>

        {/* Order Volume (Quantity) */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShoppingCart size={13} style={{ color: 'var(--color-primary)' }} /> Order Volume Quantity (Tons) *
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type="number" 
              className="form-input" 
              min="1"
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              required 
              style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)', paddingRight: '40px' }}
            />
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
              Tons
            </span>
          </div>
        </div>

        {/* Form controls */}
        <div className="form-actions" style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button type="submit" className="form-submit-btn" style={{ margin: 0, padding: '12px 24px' }}>
            ✓ Create Order (Send to PH)
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
