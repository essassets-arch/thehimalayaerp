import React, { useState, useEffect } from 'react';
import { createMaterialIndent } from '../../../store/procurementActions';
import { Package, Plus, Trash2, Calendar, MapPin, Send, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useERPStore } from '../../../store/erpStore';

/** Returns true when an id looks like a real DB UUID (not a dummy placeholder). */
const isRealId = (id) => id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export default function CreateMaterialIndent() {
  const [items, setItems] = useState([
    { id: 1, materialId: '', materialName: '', quantity: '', unit: 'Nos', reason: '' }
  ]);
  const [department, setDepartment] = useState('Production');
  const [requiredDate, setRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [warehouseId, setWarehouseId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use real data from the ERP store — never fall back to dummy/placeholder data
  const inventory = useERPStore(state => state.state?.rawInventory) || [];
  const warehouses = useERPStore(state => state.state?.warehouses) || [];
  const dataLoading = inventory.length === 0 || warehouses.length === 0;

  useEffect(() => {
    if (warehouses.length > 0 && !warehouseId) {
      setWarehouseId(warehouses[0].id);
    }
  }, [warehouses, warehouseId]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), materialId: '', materialName: '', quantity: '', unit: 'Nos', reason: '' }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'materialId' && value) {
          const invItem = inventory.find(i => i.id === value);
          if (invItem) {
            updated.materialName = invItem.material || 'Selected Material';
            updated.unit = invItem.unit || 'Nos';
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!requiredDate) return Swal.fire('Error', 'Please select a required date', 'error');
    if (!warehouseId) return Swal.fire('Error', 'Please select a warehouse', 'error');
    if (!isRealId(warehouseId)) return Swal.fire('Error', 'Selected warehouse is not valid. Please wait for data to load.', 'error');

    const validItems = items.filter(i => i.materialId && Number(i.quantity) > 0);
    if (validItems.length === 0) return Swal.fire('Error', 'Please add at least one material with a quantity greater than zero', 'error');

    const invalidItems = validItems.filter(i => !isRealId(i.materialId));
    if (invalidItems.length > 0) return Swal.fire('Error', 'One or more selected materials are not valid. Please wait for product data to load and reselect.', 'error');

    try {
      setIsSubmitting(true);
      await createMaterialIndent({ department, requiredDate, warehouseId, items: validItems }, 'Store Admin');
      await Swal.fire({
        title: 'Success!',
        text: 'Material Indent created and sent to Plant Head for approval',
        icon: 'success',
        confirmButtonColor: '#2F4375'
      });
      setItems([{ id: 1, materialId: '', materialName: '', quantity: '', unit: 'Nos', reason: '' }]);
      setRequiredDate('');
      setWarehouseId(warehouses[0]?.id || '');
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to create indent', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1e293b',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02) inset',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <div style={{ maxWidth: '100%', animation: 'fadeIn 0.4s ease-out' }}>
      {dataLoading && (
        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 10, padding: '10px 16px', marginBottom: 20, color: '#92400e', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⏳ Loading product and warehouse data from the server — please wait before submitting.
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .glass-panel {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 10px 30px -10px rgba(47, 67, 117, 0.1);
          borderRadius: 16px;
        }
        .premium-input:focus {
          border-color: #3b82f6 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }
        @media (max-width: 768px) {
          .indent-header-row {
            margin-bottom: 16px !important;
            gap: 12px !important;
          }
          .indent-header-icon {
            width: 44px !important;
            height: 44px !important;
            border-radius: 12px !important;
          }
          .indent-header-row h2 {
            font-size: 19px !important;
          }
          .indent-header-row p {
            font-size: 12px !important;
          }
          .indent-glass-form {
            padding: 14px 8px !important;
            border-radius: 12px !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          .indent-meta-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            margin-bottom: 20px !important;
          }
          .indent-materials-box {
            padding: 14px 10px !important;
            border-radius: 12px !important;
          }
          .indent-card-item {
            padding: 14px 10px !important;
            border-radius: 12px !important;
          }
          .indent-item-row {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .indent-footer-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            margin-top: 20px !important;
          }
          .indent-footer-row button {
            width: 100% !important;
            justify-content: center !important;
            padding: 12px 20px !important;
          }
        }
      `}</style>
      
      {/* Section Header */}
      <div className="indent-header-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div className="indent-header-icon" style={{ 
          width: '56px', height: '56px', borderRadius: '16px', 
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          flexShrink: 0
        }}>
          <Package size={26} color="#2563eb" style={{ filter: 'drop-shadow(0 2px 4px rgba(37,99,235,0.2))' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Material Indent Request</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Initiate a new procurement request for warehouse fulfillment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel indent-glass-form" style={{ padding: '32px', borderRadius: '20px' }}>
        {/* Department, Warehouse + Date Row */}
        <div className="indent-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          <div>
            <label style={labelStyle}><Package size={14}/> Requesting Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="premium-input"
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              <option value="Production">Production & Assembly</option>
              <option value="Maintenance">Plant Maintenance</option>
              <option value="Store">General Store</option>
              <option value="Administration">Administration HQ</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}><MapPin size={14}/> Destination Warehouse</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="premium-input"
              style={{ ...inputStyle, appearance: 'auto' }}
              required
            >
              <option value="">Select Delivery Location...</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} {w.location ? `— ${w.location}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}><Calendar size={14}/> Required By Date</label>
            <input
              type="date"
              required
              value={requiredDate}
              onChange={(e) => setRequiredDate(e.target.value)}
              className="premium-input"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Materials Section */}
        <div className="indent-materials-box" style={{ background: 'rgba(248, 250, 252, 0.6)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span>
              Requested Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '9px 16px', borderRadius: '10px', border: 'none',
                background: '#ffffff', color: '#0f172a', fontSize: '13px',
                fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
                border: '1px solid #e2e8f0'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={16} color="#3b82f6" />
              Add Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="indent-card-item"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255,255,255,0.8)',
                  borderRadius: '16px',
                  background: '#ffffff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  position: 'relative'
                }}
              >
                <div className="indent-item-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '16px' }}>
                  <div>
                    <label style={{...labelStyle, fontSize: '11px'}}>Material / Specification</label>
                    <select
                      value={item.materialId}
                      onChange={(e) => handleItemChange(item.id, 'materialId', e.target.value)}
                      className="premium-input"
                      style={{ ...inputStyle, appearance: 'auto', background: '#f8fafc' }}
                      required
                    >
                      <option value="">Select Material...</option>
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.material} ({inv.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{...labelStyle, fontSize: '11px'}}>Requested Qty</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="premium-input"
                      style={{...inputStyle, background: '#f8fafc'}}
                      required
                    />
                  </div>
                  <div>
                    <label style={{...labelStyle, fontSize: '11px'}}>Unit of Measure</label>
                    <input
                      type="text"
                      placeholder="Nos"
                      value={item.unit}
                      style={{ ...inputStyle, background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b', fontWeight: '600' }}
                      readOnly
                    />
                  </div>
                  <div>
                    <label style={{...labelStyle, fontSize: '11px'}}>Purpose / Remarks</label>
                    <input
                      type="text"
                      placeholder="Why is this needed?"
                      value={item.reason}
                      onChange={(e) => handleItemChange(item.id, 'reason', e.target.value)}
                      className="premium-input"
                      style={{...inputStyle, background: '#f8fafc'}}
                    />
                  </div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Remove item"
                    style={{
                      position: 'absolute', top: '-10px', right: '-10px',
                      border: '2px solid #ffffff', background: '#fee2e2', color: '#ef4444',
                      width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="indent-footer-row" style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12.5px', fontWeight: '500' }}>
            <CheckCircle2 size={16} color="#10b981" />
            All items will be sent to the Plant Head for secondary approval
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '12px 28px', borderRadius: '12px', border: 'none',
              background: isSubmitting ? '#cbd5e1' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
              color: '#ffffff',
              fontSize: '14px', fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: isSubmitting ? 'none' : '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
              transition: 'all 0.2s',
              transform: isSubmitting ? 'none' : 'translateY(0)',
            }}
            onMouseOver={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {isSubmitting ? 'Processing...' : (
              <>
                Submit Indent <Send size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

