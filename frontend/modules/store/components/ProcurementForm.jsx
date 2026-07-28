import React, { useState } from 'react';
import { useToast } from '../../../shared/context/ToastContext';
import { useLoading } from '../../../hooks/useLoading';
import { apiClient } from '../../../lib/apiClient';

export const ProcurementForm = ({ materials = [], onSuccess }) => {
  const { success, error } = useToast();
  const { isLoading, withLoading } = useLoading();
  const [items, setItems] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('Medium');

  const handleAddItem = () => {
    if (!selectedMaterial) {
      error('Please select a material');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      error('Please enter a valid quantity');
      return;
    }

    const material = materials.find(m => m.id === parseInt(selectedMaterial));
    if (!material) return;

    // Check if already added
    if (items.some(item => item.product_id === material.id)) {
      error(`${material.product_name} already added`);
      return;
    }

    setItems([...items, {
      product_id: material.id,
      product_name: material.product_name,
      product_code: material.product_code,
      quantity_requested: parseFloat(quantity),
      unit_of_measure: material.unit_of_measure || 'Units',
      on_hand_balance: material.on_hand_balance || 0
    }]);

    setSelectedMaterial('');
    setQuantity('');
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      error('Please add at least one material');
      return;
    }

    await withLoading(
      async () => {
        await apiClient.post('/store/material-requests', {
          items: items.map(item => ({
            product_id: item.product_id,
            quantity_requested: item.quantity_requested
          })),
          notes,
          priority
        });

        success('Procurement request created successfully');
        setItems([]);
        setNotes('');
        setPriority('Medium');
        if (onSuccess) onSuccess();
      },
      'Failed to create procurement request'
    );
  };

  // Get available materials (not already added)
  const availableMaterials = materials.filter(
    m => !items.some(item => item.product_id === m.id)
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* Add Item Row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px', fontWeight: '600' }}
        >
          <option value="">Select Raw Material</option>
          {availableMaterials.map(m => (
            <option key={m.id} value={m.id}>
              {m.product_name} ({m.on_hand_balance || 0} {m.unit_of_measure || 'Units'})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-24 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          min="0.01"
          step="0.01"
          style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px', fontWeight: '600' }}
        />

        <button
          type="button"
          onClick={handleAddItem}
          className="action-btn"
          style={{ height: '42px', padding: '0 20px', background: 'var(--color-primary)', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
        >
          + Add
        </button>
      </div>

      {/* Added Items */}
      {items.length > 0 ? (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Material</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-text-secondary)', width: '120px' }}>Requested Qty</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-text-secondary)', width: '120px' }}>Available Stock</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', width: '60px' }}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: '600', color: '#24345C' }}>{item.product_name}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: '#24345C' }}>{item.quantity_requested} {item.unit_of_measure}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: item.on_hand_balance < item.quantity_requested ? '#ef4444' : '#10b981' }}>{item.on_hand_balance} {item.unit_of_measure}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '20px', border: '1.5px dashed var(--color-border)', borderRadius: '10px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          No materials added to indent yet. Choose items and add them.
        </div>
      )}

      {/* Priority & Notes */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="form-select"
            style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px', fontWeight: '600', minWidth: '150px' }}
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
          <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Procurement Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Urgent restock for plant operations"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input"
            style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || items.length === 0}
        className="action-btn"
        style={{
          background: items.length === 0 ? 'var(--color-border)' : 'var(--color-primary)',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '10px',
          color: '#000',
          fontWeight: 'bold',
          cursor: items.length === 0 || isLoading ? 'not-allowed' : 'pointer',
          opacity: items.length === 0 || isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? 'Submitting...' : 'Create Request'}
      </button>
    </form>
  );
};
