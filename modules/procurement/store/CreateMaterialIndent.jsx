import React, { useState } from 'react';
import { createMaterialIndent } from '../../../store/procurementActions';
import { Package, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useERPStore } from '../../../store/erpStore';

export default function CreateMaterialIndent() {
  const [items, setItems] = useState([{ id: 1, materialId: '', materialName: '', quantity: '', unit: 'Nos', reason: '' }]);
  const [department, setDepartment] = useState('Production');
  const [requiredDate, setRequiredDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inventory = useERPStore(state => state.state.rawInventory) || [];

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
          const invItem = inventory.find(i => i.id === value || i.materialCode === value || i.code === value);
          if (invItem) {
            updated.materialName = invItem.materialName || invItem.material || 'Selected Material';
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

    const validItems = items.filter(i => i.materialId && Number(i.quantity) > 0);
    if (validItems.length === 0) return Swal.fire('Error', 'Please add at least one material with a quantity greater than zero', 'error');

    try {
      setIsSubmitting(true);
      createMaterialIndent({ department, requiredDate, items: validItems }, 'Store Admin');
      await Swal.fire('Success', 'Material Indent created and sent to Plant Head for approval', 'success');
      setItems([{ id: 1, materialId: '', materialName: '', quantity: '', unit: 'Nos', reason: '' }]);
      setRequiredDate('');
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to create indent', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #DCE5F0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#24345C',
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#5E6B82',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E5ECF5' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={22} color="#0369a1" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#24345C' }}>Create Material Indent</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>Request new materials for procurement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Department + Date Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div>
            <label style={labelStyle}>Requesting Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              <option value="Production">Production</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Store">Store</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Required By Date</label>
            <input
              type="date"
              required
              value={requiredDate}
              onChange={(e) => setRequiredDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Materials Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#24345C' }}>Requested Materials</h3>
            <button
              type="button"
              onClick={handleAddItem}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: '#2F4375', color: '#ffffff', fontSize: '13px',
                fontWeight: '700', cursor: 'pointer',
              }}
            >
              <Plus size={15} />
              Add Material
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '12px',
                  padding: '16px',
                  border: '1px solid #E5ECF5',
                  borderRadius: '10px',
                  background: '#F9FBFE',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Material Name/Code</label>
                    <input
                      type="text"
                      placeholder="e.g. Steel Sheets"
                      value={item.materialId}
                      onChange={(e) => handleItemChange(item.id, 'materialId', e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Unit</label>
                    <input
                      type="text"
                      placeholder="Nos"
                      value={item.unit}
                      onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Reason/Purpose</label>
                    <input
                      type="text"
                      placeholder="Optional reason"
                      value={item.reason}
                      onChange={(e) => handleItemChange(item.id, 'reason', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {items.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remove item"
                      style={{
                        border: 'none', background: '#fee2e2', color: '#ef4444',
                        padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', fontWeight: '600',
                      }}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E5ECF5', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '10px 28px', borderRadius: '8px', border: 'none',
              background: isSubmitting ? '#9ca3af' : '#2F4375', color: '#ffffff',
              fontSize: '14px', fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(47, 67, 117, 0.25)',
            }}
          >
            {isSubmitting ? 'Submitting...' : '📤 Submit Indent'}
          </button>
        </div>
      </form>
    </div>
  );
}
