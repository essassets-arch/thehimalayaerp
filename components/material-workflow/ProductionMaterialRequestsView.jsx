'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useERPStore } from '../../store/erpStore';
import { selectMaterialRequests, submitMaterialRequest } from '../../store/materialFlow';
import { 
  ArrowLeft, 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

const RAW_MATERIALS_CATALOG = [
  { material: 'Cement Grade 53', unit: 'Bags', category: 'Raw Material' },
  { material: 'Sand Fine Grade', unit: 'Tons', category: 'Raw Material' },
  { material: 'Coarse Aggregate (20mm)', unit: 'Tons', category: 'Raw Material' },
  { material: 'Steel Reinforcement Wire (8mm)', unit: 'Coils', category: 'Raw Material' },
  { material: 'Fly Ash Grade A', unit: 'Tons', category: 'Raw Material' },
  { material: 'Admixture Waterproofing Liquid', unit: 'Drums', category: 'Raw Material' },
  { material: 'PVC Pipes (4")', unit: 'Meters', category: 'Hardware' },
  { material: 'Gaskets', unit: 'Units', category: 'Hardware' },
  { material: 'Bolts (M12)', unit: 'Units', category: 'Hardware' },
  { material: 'Steel Plates', unit: 'Units', category: 'Hardware' },
  { material: 'Metal Brackets', unit: 'Units', category: 'Hardware' },
  { material: 'Weld Rods (Box)', unit: 'Boxes', category: 'Hardware' }
];

const STATUS_COLORS = {
  PENDING_PLANT_HEAD_APPROVAL: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  PLANT_HEAD_APPROVED: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  PLANT_HEAD_REJECTED: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  STORE_APPROVED: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  STORE_REJECTED: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  ISSUED: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  Draft: { bg: '#f1f5f9', color: '#5E6B82', border: '#D6E2F0' },
  Submitted: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  Approved: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Rejected: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  Issued: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  'Partially Issued': { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Received: { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
  Consuming: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  'Return Pending': { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
  Returned: { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  Closed: { bg: '#F5FAFE', color: '#475569', border: '#8893A7' }
};

export default function ProductionMaterialRequestsView() {
  const router = useRouter();
  const materialRequests = useERPStore(s => selectMaterialRequests(s.state));
  const createRequest = submitMaterialRequest;
  const closeRequest = () => {};
  const deleteRequest = () => {};

  // Tab state: 'Raise' or 'Past'
  const [activeTab, setActiveTab] = useState('Past');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedReq, setSelectedReq] = useState(null);

  // Form states for Raise Request
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [requestItems, setRequestItems] = useState([]);
  
  // Extra fields for workflow
  const [priority, setPriority] = useState('Normal');
  const [workOrderNo, setWorkOrderNo] = useState('WO-109');
  const [notes, setNotes] = useState('');

  // Dropdown list filtering
  const filteredCatalog = RAW_MATERIALS_CATALOG.filter(item => 
    item.material.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdded = (name) => requestItems.some(item => item.material.toLowerCase() === name.toLowerCase());

  const handleSelectProduct = (product) => {
    if (isAdded(product.material)) {
      Swal.fire({ icon: 'warning', title: 'Already Added', text: `${product.material} is already in the list.`, timer: 1500, showConfirmButton: false });
      return;
    }
    setRequestItems(prev => [...prev, {
      material: product.material,
      requestedQty: 10,
      unit: product.unit,
      category: product.category
    }]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleAddEmptyRow = () => {
    const remaining = RAW_MATERIALS_CATALOG.filter(p => !isAdded(p.material));
    const nextProduct = remaining[0] || RAW_MATERIALS_CATALOG[0];
    if (nextProduct) {
      setRequestItems(prev => [...prev, {
        material: nextProduct.material,
        requestedQty: 1,
        unit: nextProduct.unit,
        category: nextProduct.category
      }]);
    }
  };

  const handleRemoveRow = (index) => {
    setRequestItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setRequestItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      if (field === 'material') {
        const catItem = RAW_MATERIALS_CATALOG.find(c => c.material === value);
        return {
          ...item,
          material: value,
          unit: catItem ? catItem.unit : item.unit,
          category: catItem ? catItem.category : item.category
        };
      }
      return { ...item, [field]: value };
    }));
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();

    if (requestItems.length === 0) {
      Swal.fire({ icon: 'error', title: 'No Items Added', text: 'Please search and add at least one material to submit.' });
      return;
    }

    if (requestItems.some(i => i.requestedQty <= 0)) {
      Swal.fire({ icon: 'error', title: 'Invalid Quantity', text: 'Please ensure all items have a quantity greater than 0.' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const created = createRequest({
      requestDate: today,
      warehouse: 'Main Raw Material Store (Haridwar)',
      priority,
      workOrderNo,
      requester: 'Ravi Sharma (Line Alpha)',
      notes,
      status: 'PENDING_PLANT_HEAD_APPROVAL',
      items: requestItems.map(i => ({
        material: i.material,
        requestedQty: Number(i.requestedQty),
        approvedQty: 0,
        issuedQty: 0,
        unit: i.unit
      }))
    });

    Swal.fire({
      icon: 'success',
      title: 'Request Submitted!',
      text: `Material Request ${created.requestNo} has been successfully sent to Plant Head for approval.`,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      // Clear form
      setRequestItems([]);
      setNotes('');
      // Switch to history tab
      setActiveTab('Past');
    });
  };

  const handleCancel = () => {
    setRequestItems([]);
    setNotes('');
    router.push('/production/work-orders');
  };

  // History Tab filtering
  const filteredRequests = materialRequests.filter(mr => {
    if (filterStatus === 'All') return true;
    return mr.status === filterStatus;
  });

  const handleCloseRequest = (id, reqNo) => {
    Swal.fire({
      title: 'Close Material Request?',
      text: `Verify that all materials for ${reqNo} have been fully reconciled. Close request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Close Request'
    }).then(res => {
      if (res.isConfirmed) {
        closeRequest(id);
        Swal.fire('Closed!', `${reqNo} is now marked as Closed.`, 'success');
      }
    });
  };

  const handleDelete = (id, reqNo) => {
    Swal.fire({
      title: 'Delete Draft?',
      text: `Are you sure you want to delete ${reqNo}?`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete'
    }).then(res => {
      if (res.isConfirmed) {
        deleteRequest(id);
        Swal.fire('Deleted', 'Request removed.', 'success');
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', padding: '16px 20px', background: '#F5FAFE', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Navigation Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/production/work-orders')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1e293b',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} style={{ color: '#4f46e5' }} />
              Material Requests
            </h1>
            <p style={{ fontSize: '12px', color: '#5E6B82', margin: '2px 0 0 0' }}>
              Raise and track raw materials and hardware components required for production.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ background: '#f1f5f9', borderRadius: '10px', padding: '4px', display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('Raise')}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              background: activeTab === 'Raise' ? '#fff' : 'transparent',
              color: activeTab === 'Raise' ? '#24345C' : '#5E6B82',
              boxShadow: activeTab === 'Raise' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            Raise Request
          </button>
          <button
            onClick={() => setActiveTab('Past')}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              background: activeTab === 'Past' ? '#fff' : 'transparent',
              color: activeTab === 'Past' ? '#24345C' : '#5E6B82',
              boxShadow: activeTab === 'Past' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            Past Requests ({materialRequests.length})
          </button>
        </div>
      </div>

      {/* Main Tab Render */}
      {activeTab === 'Raise' ? (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #DCE5F0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card Header Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <Layers size={16} style={{ color: '#4f46e5' }} />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e1b4b', letterSpacing: '0.05em' }}>MATERIAL SELECTION</span>
          </div>


          {/* Smart Search Field */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Smart Search & Add</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder="Type keyword to add product..."
                style={{ width: '100%', height: '42px', padding: '0 12px 0 40px', border: '1px solid #DCE5F0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8893A7' }} />
            </div>

            {/* Smart Search Dropdown */}
            {showDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#fff', border: '1px solid #DCE5F0', borderRadius: '10px', marginTop: '6px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                {filteredCatalog.length === 0 ? (
                  <div style={{ padding: '12px', color: '#8893A7', fontSize: '13px' }}>No matches found</div>
                ) : (
                  filteredCatalog.map(prod => {
                    const added = isAdded(prod.material);
                    return (
                      <div
                        key={prod.material}
                        onClick={() => !added && handleSelectProduct(prod)}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: added ? 'default' : 'pointer',
                          background: added ? '#F5FAFE' : '#fff',
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: '600', color: added ? '#D6E2F0' : '#1e293b' }}>
                          {prod.material} <span style={{ fontSize: '10px', color: '#8893A7', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>{prod.category}</span>
                        </span>
                        <span style={{ fontSize: '11px', color: '#5E6B82' }}>
                          {added ? '✓ Added' : `Unit: ${prod.unit}`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Table Container */}
          <div style={{ border: '1px solid #DCE5F0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px', width: '70%' }}>Product Details *</th>
                  <th style={{ padding: '12px 16px', width: '20%', textAlign: 'right' }}>Qty *</th>
                  <th style={{ padding: '12px 16px', width: '10%', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {requestItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '36px', textAlign: 'center', color: '#5E6B82', fontSize: '13px', fontStyle: 'italic' }}>
                      No items added yet. Use the &quot;Smart Search & Add&quot; bar above to select raw materials or hardware components.
                    </td>
                  </tr>
                ) : (
                  requestItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          value={item.material}
                          onChange={(e) => handleItemChange(idx, 'material', e.target.value)}
                          style={{
                            width: '100%',
                            height: '38px',
                            padding: '0 10px',
                            borderRadius: '8px',
                            border: '1px solid #D6E2F0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#1e293b'
                          }}
                        >
                          {RAW_MATERIALS_CATALOG.map(cat => (
                            <option key={cat.material} value={cat.material}>{cat.material} ({cat.category})</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.requestedQty}
                            onChange={(e) => handleItemChange(idx, 'requestedQty', Number(e.target.value))}
                            style={{
                              width: '90px',
                              height: '38px',
                              padding: '0 10px',
                              borderRadius: '8px',
                              border: '1px solid #D6E2F0',
                              fontSize: '13px',
                              fontWeight: '700',
                              textAlign: 'right',
                              color: '#4f46e5'
                            }}
                          />
                          <span style={{ fontSize: '11px', fontWeight: '800', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#5E6B82', textTransform: 'uppercase' }}>
                            {item.unit}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1px solid #fecdd3',
                            background: '#fff1f2',
                            color: '#e11d48',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <button
            type="button"
            onClick={handleAddEmptyRow}
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1.5px dashed #D6E2F0',
              background: 'transparent',
              color: '#4f46e5',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Plus size={14} /> Add Product Row
          </button>

          {/* Extra Notes */}
          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Justification / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide special instructions or reason for authorization request..."
              style={{ width: '100%', minHeight: '60px', padding: '10px 12px', border: '1px solid #D6E2F0', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
            />
          </div>

          {/* Bottom Actions Row */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={handleFormSubmit}
              style={{
                flex: 1,
                height: '46px',
                borderRadius: '10px',
                border: 'none',
                background: '#24345C',
                color: '#fff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1)'
              }}
            >
              Submit Request
            </button>
            <button
              onClick={handleCancel}
              style={{
                width: '120px',
                height: '46px',
                borderRadius: '10px',
                border: '1px solid #D6E2F0',
                background: '#fff',
                color: '#475569',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>

        </div>
      ) : (
        /* History Tab List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Filters List */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['All', 'PENDING_PLANT_HEAD_APPROVAL', 'PLANT_HEAD_APPROVED', 'PLANT_HEAD_REJECTED', 'STORE_APPROVED', 'STORE_REJECTED', 'ISSUED'].map(st => {
              const count = st === 'All' ? materialRequests.length : materialRequests.filter(m => m.status === st).length;
              const active = filterStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${active ? '#4f46e5' : '#D6E2F0'}`,
                    background: active ? '#4f46e5' : '#fff',
                    color: active ? '#fff' : '#475569',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {st}
                  <span style={{ fontSize: '10px', background: active ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: active ? '#fff' : '#5E6B82', padding: '1px 6px', borderRadius: '10px' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table Card */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #DCE5F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800' }}>
                    <th style={{ padding: '14px 20px' }}>Request No</th>
                    <th style={{ padding: '14px 20px' }}>Date</th>
                    <th style={{ padding: '14px 20px' }}>Work Order</th>
                    <th style={{ padding: '14px 20px' }}>Items Summary</th>
                    <th style={{ padding: '14px 20px' }}>Priority</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#8893A7', fontSize: '13px' }}>
                        No material requests created yet.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map(mr => {
                      const badge = STATUS_COLORS[mr.status] || { bg: '#f1f5f9', color: '#5E6B82', border: '#D6E2F0' };
                      const canClose = mr.status === 'Returned' || mr.status === 'Received';
                      return (
                        <tr key={mr.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                          <td style={{ padding: '16px 20px', fontWeight: '800', fontFamily: 'monospace', color: '#24345C' }}>{mr.requestNo}</td>
                          <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5E6B82' }}>{mr.requestDate}</td>
                          <td style={{ padding: '16px 20px', fontWeight: '700', color: '#4f46e5' }}>{mr.workOrderNo || '—'}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#24345C' }}>
                                {mr.items?.length || 0} Material Items
                              </span>
                              <span style={{ fontSize: '11px', color: '#5E6B82' }}>
                                {mr.items?.map(i => `${i.material} (${i.requestedQty} ${i.unit})`).join(', ')}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '800',
                              background: mr.priority === 'Urgent' ? '#fff1f2' : mr.priority === 'High' ? '#fffbeb' : '#F5FAFE',
                              color: mr.priority === 'Urgent' ? '#e11d48' : mr.priority === 'High' ? '#d97706' : '#475569',
                              border: `1px solid ${mr.priority === 'Urgent' ? '#fecdd3' : mr.priority === 'High' ? '#fde68a' : '#DCE5F0'}`
                            }}>
                              {mr.priority}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '800',
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              display: 'inline-block'
                            }}>
                              {mr.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                onClick={() => setSelectedReq(mr)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #D6E2F0', background: '#fff', color: '#334155', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Eye size={14} /> View
                              </button>

                              {canClose && (
                                <button
                                  onClick={() => handleCloseRequest(mr.id, mr.requestNo)}
                                  style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <CheckCircle2 size={13} /> Close
                                </button>
                              )}

                              {mr.status === 'Draft' && (
                                <button
                                  onClick={() => handleDelete(mr.id, mr.requestNo)}
                                  style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#e11d48', cursor: 'pointer' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '680px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '28px', border: '1px solid #DCE5F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #DCE5F0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#5E6B82' }}>Material Request Details</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0 0', color: '#24345C', fontFamily: 'monospace' }}>{selectedReq.requestNo}</h2>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ background: '#F5FAFE', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '700' }}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '13px', background: '#F5FAFE', padding: '14px', borderRadius: '12px' }}>
              <div><strong>Status:</strong> <span style={{ color: '#2563eb', fontWeight: '800' }}>{selectedReq.status}</span></div>
              <div><strong>Date:</strong> {selectedReq.requestDate}</div>
              <div><strong>Work Order:</strong> {selectedReq.workOrderNo}</div>
              <div><strong>Requester:</strong> {selectedReq.requester}</div>
              <div><strong>Priority:</strong> {selectedReq.priority}</div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#24345C', marginBottom: '12px' }}>Items & Quantity Status</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: '10px 12px' }}>Material</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Req Qty</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Appr Qty</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Issued</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Received</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Consumed</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Returned</th>
                </tr>
              </thead>
              <tbody>
                {selectedReq.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '700' }}>{item.material} <span style={{ color: '#8893A7', fontSize: '11px' }}>({item.unit})</span></td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>{item.requestedQty}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#16a34a', fontWeight: '700' }}>{item.approvedQty}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#059669', fontWeight: '700' }}>{item.issuedQty || 0}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0284c7', fontWeight: '700' }}>{item.receivedQty}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#7c3aed', fontWeight: '700' }}>{item.consumedQty}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#e11d48', fontWeight: '700' }}>{item.returnedQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedReq(null)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#24345C', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
