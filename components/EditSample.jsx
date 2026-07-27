import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FlaskConical, Package, Plus, Search, Trash2 } from 'lucide-react';
import ProductPicker from '../shared/components/ProductPicker';

const ALL_PRODUCTS = [
  'Conplast Superplasticizer',
  'Fly Ash Blocks (Manufactured)',
  'AAC Lightweight Blocks (Manufactured)',
  'Solid Concrete Blocks (Manufactured)',
  'Hollow Concrete Blocks (Manufactured)',
  'Red Clay Bricks (Manufactured)',
  'Fly Ash Bricks (Manufactured)',
  'Pressed Sand-Lime Bricks (Manufactured)',
  'Uni Paver 60mm',
  'Interlocking Paver Blocks (Manufactured)',
  'Zig-Zag Pavers (Manufactured)',
  'Grass Paver Tiles (Manufactured)',
  'Ordinary Portland Cement 43 Grade (Manufactured)',
  'Portland Pozzolana Cement (Manufactured)',
  '10mm Coarse Aggregate (Manufactured)',
  '20mm Coarse Aggregate (Manufactured)',
  'CLC Foam Blocks (Traded)',
  'Gypsum Partition Blocks (Traded)',
  'Fire Clay Refractory Bricks (Traded)',
  'Calcium Silicate Bricks (Traded)',
  'Reflective Tactile Pavers (Traded)',
  'Heavy-duty Shotblasted Pavers (Traded)',
  'White Portland Cement (Traded)',
  'Rapid Hardening Cement (Traded)',
  'River Sand (Traded)',
  'Crushed Rock Sand / M-Sand (Traded)',
  'Stone Dust (Traded)',
  'FRCSQRC24x24 LD3',
  'FRCSQRC24x24 LD5',
  'FRCSQRC24x24 MD10',
  'FRCSQRC30x30 LD5',
  'FRCSQRC30x30 MD10',
  'FRCSQRC30x30 HD20',
  'FRCSQRC33x33 HD20',
  'FRCSQRC34x34 LD5'
];

export default function EditSample({ sample, onSave, onCancel }) {
  const [leadName, setLeadName] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [value, setValue] = useState(425);

  const [items, setItems] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Sync state with props
  useEffect(() => {
    if (sample) {
      setLeadName(sample.leadName || '');
      setDispatchDate(sample.dispatchDate || '');
      
      if (sample.detailedItems && sample.detailedItems.length > 0) {
        setItems(sample.detailedItems.map((item, idx) => ({
          id: idx + 1,
          productName: item.productName || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice !== undefined ? item.unitPrice : 100
        })));
      } else {
        const initialQty = sample.quantity || 1;
        const initialVal = sample.value !== undefined ? sample.value : 425;
        setItems([{
          id: 1,
          productName: sample.product || '',
          quantity: initialQty,
          unitPrice: Math.round(initialVal / initialQty)
        }]);
      }
    }
  }, [sample]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const grandTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Keep value state synced with grandTotal
  useEffect(() => {
    setValue(grandTotal);
  }, [grandTotal]);

  if (!sample) {
    return (
      <div className="app-card" style={{ flex: 1, padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '12px', fontSize: '18px', fontWeight: '800' }}>Sample Request Not Found</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>The requested sample ID does not exist or has been removed.</p>
        <button 
          type="button" 
          className="form-submit-btn" 
          onClick={onCancel}
          style={{ width: 'auto', display: 'inline-flex', padding: '10px 24px', margin: '0 auto' }}
        >
          Return to Samples List
        </button>
      </div>
    );
  }

  const formatSampleId = (id) => `SMP-${String(id).padStart(3, '0')}`;

  const handleAddItem = (prodName = '') => {
    const nextId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, {
      id: nextId,
      productName: prodName,
      quantity: 1,
      unitPrice: 100
    }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleRowChange = (id, field, val) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleSelectProduct = (prodName) => {
    if (items.length === 1 && !items[0].productName.trim()) {
      handleRowChange(items[0].id, 'productName', prodName);
    } else {
      handleAddItem(prodName);
    }
    setProductSearchQuery('');
    setShowDropdown(false);
  };

  const filteredProducts = ALL_PRODUCTS.filter(p => 
    p.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!leadName.trim()) {
      alert('Please fill out Customer/Company Name.');
      return;
    }

    const invalidItem = items.some(item => !item.productName.trim());
    if (invalidItem) {
      alert('Please fill out the product name for all items.');
      return;
    }

    const finalProduct = items.map(item => item.productName.trim()).join(', ');
    const finalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    onSave({
      leadName: leadName.trim(),
      product: finalProduct,
      quantity: finalQuantity,
      dispatchDate: dispatchDate,
      value: grandTotal,
      detailedItems: items.map(item => ({
        productName: item.productName.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    });
  };

  return (
    <div className="app-card" style={{ flex: 1 }}>
      {/* Header */}
      <div className="module-header-row" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="card-top-icon-btn" onClick={onCancel} style={{ width: '36px', height: '36px', background: '#f1f3f5', color: '#000' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="module-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Edit Sample Request #{formatSampleId(sample.id)}</span>
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Modify testing sample configurations and logistics dispatch scheduling.
            </p>
          </div>
        </div>
      </div>

      {/* Metadata Summary Card */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #F5FAFE)',
        border: '1px solid #bbf7d0',
        borderRadius: '16px',
        padding: '16px 24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.05)'
      }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#166534', letterSpacing: '0.5px' }}>Sample ID</span>
            <strong style={{ fontSize: '15px', color: '#16a34a' }}>{formatSampleId(sample.id)}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid #bbf7d0', paddingLeft: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#166534', letterSpacing: '0.5px' }}>Current Status</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              background: sample.status === 'Pending' ? '#ffedd5'
                : sample.status === 'Sent' ? '#dbeafe'
                : sample.status === 'Approved' ? '#dcfce7'
                : '#fee2e2',
              color: sample.status === 'Pending' ? '#ea580c'
                : sample.status === 'Sent' ? '#1d4ed8'
                : sample.status === 'Approved' ? '#15803d'
                : '#dc2626',
              width: 'fit-content',
              marginTop: '2px'
            }}>
              {sample.status}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid #bbf7d0', paddingLeft: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#166534', letterSpacing: '0.5px' }}>Sample Cost</span>
            <strong style={{ fontSize: '14px', color: '#475569' }}>₹{grandTotal.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="create-lead-grid">
          
          {/* Section 1: Sample Management */}
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
              <FlaskConical size={14} style={{ color: 'var(--color-accent-teal)' }} />
              <span>2. 🧪 Sample Management</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Customer / Company Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={leadName} 
                  onChange={e => setLeadName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Dispatch Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={dispatchDate} 
                  onChange={e => setDispatchDate(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product Selection Smart UI */}
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
              <Package size={14} style={{ color: 'var(--color-accent-purple)' }} />
              <span>3. 📦 Product Selection (Smart UI)</span>
            </h3>

            <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }} ref={dropdownRef}>
              <label className="form-label">Smart Search & Add</label>
              <div style={{ position: 'relative' }}>
                <ProductPicker 
                  value={null}
                  onChange={(p) => {
                    if (p) handleAddItem(p.product_name);
                  }}
                  placeholder="Search catalog to add product..."
                  showBadge={false}
                />
              </div>
            </div>

            {/* Items Catalog Table */}
            <div className="crm-table-container" style={{ marginTop: '12px', border: '1px solid #DCE5F0' }}>
              <table className="crm-table responsive-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#F5FAFE' }}>
                    <th style={{ width: '50%', padding: '10px' }}>Product Details *</th>
                    <th style={{ width: '15%', padding: '10px', textAlign: 'center' }}>Qty *</th>
                    <th style={{ width: '25%', padding: '10px', textAlign: 'center' }}>Rate (INR) *</th>
                    <th style={{ width: '10%', padding: '10px', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Product Details" style={{ padding: '8px 10px' }}>
                        <ProductPicker 
                          value={item.productId ? { id: item.productId, product_name: item.productName } : null}
                          onChange={(p) => {
                            if (p) {
                              handleRowChange(item.id, 'productId', p.id);
                              handleRowChange(item.id, 'productName', p.product_name);
                              if (p.selling_price) handleRowChange(item.id, 'unitPrice', p.selling_price);
                            } else {
                              handleRowChange(item.id, 'productId', null);
                              handleRowChange(item.id, 'productName', '');
                            }
                          }}
                          placeholder="Select product..."
                          showBadge={false}
                        />
                      </td>
                      <td data-label="Qty" style={{ padding: '8px 10px' }}>
                        <input 
                          type="number" 
                          className="form-input" 
                          min="1" 
                          value={item.quantity} 
                          onChange={e => handleRowChange(item.id, 'quantity', Number(e.target.value))} 
                          required 
                          style={{ padding: '6px 10px', fontSize: '12px', textAlign: 'center' }}
                        />
                      </td>
                      <td data-label="Rate" style={{ padding: '8px 10px' }}>
                        <input 
                          type="number" 
                          className="form-input" 
                          min="0" 
                          value={item.unitPrice} 
                          onChange={e => handleRowChange(item.id, 'unitPrice', Number(e.target.value))} 
                          required 
                          style={{ padding: '6px 10px', fontSize: '12px', textAlign: 'center' }}
                        />
                      </td>
                      <td data-label="Remove" style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <button 
                          type="button" 
                          className="btn-small btn-danger-small" 
                          onClick={() => handleRemoveItem(item.id)} 
                          disabled={items.length === 1}
                          style={{ padding: '6px', opacity: items.length === 1 ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add manual row button */}
            <button 
              type="button" 
              className="btn-small btn-outline-small" 
              onClick={() => handleAddItem('')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontWeight: '700' }}
            >
              <Plus size={12} /> Add Product Row
            </button>

            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '14px', fontWeight: '800', marginTop: '16px', color: '#1e293b' }}>
              <span>Grand Total: ₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>

        {/* Form Actions */}
        <div className="form-actions" style={{ marginTop: '24px' }}>
          <button type="submit" className="form-submit-btn">Save Changes</button>
          <button 
            type="button" 
            className="btn-small btn-outline-small" 
            onClick={onCancel}
            style={{ flex: 'none', padding: '12px 20px' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
