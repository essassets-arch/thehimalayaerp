import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useCreateMaterialRequest } from '../../hooks/useMaterialRequests';
import { backendFetch } from '../../lib/backendFetch';
import { Plus, Trash2, ArrowLeft, Send, Save, PackagePlus, AlertCircle } from 'lucide-react';
import { useFormDraft } from '../../shared/hooks/useFormDraft';

const FALLBACK_RAW_MATERIALS_CATALOG = [
  { material: 'Cement Grade 53', defaultUnit: 'Bags' },
  { material: 'Fine River Sand', defaultUnit: 'Tons' },
  { material: 'Coarse Aggregate (20mm)', defaultUnit: 'Tons' },
  { material: 'Steel Reinforcement Wire (8mm)', defaultUnit: 'Coils' },
  { material: 'Fly Ash Grade A', defaultUnit: 'Tons' },
  { material: 'Admixture Waterproofing Liquid', defaultUnit: 'Drums' },
  { material: 'PVC Pipes (4")', defaultUnit: 'Meters' },
  { material: 'Gaskets', defaultUnit: 'Units' },
  { material: 'Bolts (M12)', defaultUnit: 'Units' },
  { material: 'Steel Plates', defaultUnit: 'Units' },
  { material: 'Metal Brackets', defaultUnit: 'Units' },
  { material: 'Weld Rods (Box)', defaultUnit: 'Boxes' }
];

export default function ProductionMaterialCreateView() {
  const router = useRouter();
  const createRequest = useCreateMaterialRequest();

  const [catalog, setCatalog] = useState(FALLBACK_RAW_MATERIALS_CATALOG);

  useEffect(() => {
    let isMounted = true;
    async function loadRawMaterials() {
      try {
        const data = await backendFetch('/api/backend/products?type=RAW_MATERIAL');
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const liveList = data.map(item => ({
            material: item.name || item.material || 'Raw Material Item',
            defaultUnit: item.unit || 'Units'
          }));
          const existingNames = new Set(liveList.map(i => i.material.toLowerCase()));
          const extraFallbacks = FALLBACK_RAW_MATERIALS_CATALOG.filter(f => !existingNames.has(f.material.toLowerCase()));
          setCatalog([...liveList, ...extraFallbacks]);
        }
      } catch (err) {
        console.warn('[ProductionMaterialCreateView] Failed to load live raw materials:', err);
      }
    }
    loadRawMaterials();
    return () => { isMounted = false; };
  }, []);

  const emptyMaterialForm = {
    warehouse: 'Main Raw Material Store (Haridwar)',
    priority: 'Normal',
    workOrderNo: 'WO-109',
    requester: 'Ravi Sharma (Line Alpha)',
    notes: '',
    items: [
      { material: 'Cement Grade 53', requestedQty: 100, unit: 'Bags' },
      { material: 'Fine River Sand', requestedQty: 50, unit: 'Tons' }
    ]
  };

  const { formData, setFormData, clearDraft } = useFormDraft({
    draftKey: `erp_draft_material_request_${emptyMaterialForm.workOrderNo || 'new'}`, // Alternatively from URL props if WO was dynamic
    initialData: emptyMaterialForm
  });

  const { warehouse, priority, workOrderNo, requester, notes, items } = formData;

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'function' ? value(prev[field]) : value
    }));
  };

  const setWarehouse = (val) => updateField('warehouse', val);
  const setPriority = (val) => updateField('priority', val);
  const setWorkOrderNo = (val) => updateField('workOrderNo', val);
  const setRequester = (val) => updateField('requester', val);
  const setNotes = (val) => updateField('notes', val);
  const setItems = (val) => updateField('items', val);

  const handleAddItem = () => {
    const existing = items.map(i => i.material);
    const available = catalog.find(c => !existing.includes(c.material)) || catalog[0];
    setItems(prev => [...prev, { material: available.material, requestedQty: 10, unit: available.defaultUnit }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      Swal.fire({ icon: 'warning', title: 'Cannot Remove', text: 'At least one material item is required.' });
      return;
    }
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      if (field === 'material') {
        const catItem = catalog.find(c => c.material === value);
        return { ...item, material: value, unit: catItem ? catItem.defaultUnit : item.unit };
      }
      return { ...item, [field]: value };
    }));
  };

  const handleSubmit = async () => {
    if (items.some(i => !i.material || i.requestedQty <= 0)) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please ensure all items have a material and quantity greater than 0.' });
      return;
    }

    try {
      const res = await createRequest.mutateAsync({
        requestDate: new Date().toISOString().split('T')[0],
        warehouse,
        priority,
        workOrderNo,
        requester,
        notes,
        status: 'PENDING_PLANT_HEAD_APPROVAL',
        items: items.map(i => ({
          material: i.material,
          requestedQty: Number(i.requestedQty),
          approvedQty: 0,
          issuedQty: 0,
          unit: i.unit || 'Units'
        }))
      });
      if (res?.success !== false) {
        clearDraft();
        Swal.fire({
          title: 'Request Submitted!',
          text: `Material Request ${res.requestNo} has been successfully sent to Plant Head for approval.`,
          icon: 'success',
          confirmButtonColor: '#0369a1'
        }).then(() => {
          router.push('/production/material-requests');
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', padding: '8px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-card-bg, #fff)', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--color-border, #DCE5F0)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/production/material-requests')}
            style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--color-border, #DCE5F0)', background: '#F5FAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#24345C', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PackagePlus size={24} style={{ color: '#2563eb' }} />
              Create Daily Material Request
            </h1>
            <p style={{ fontSize: '13px', color: '#5E6B82', margin: '4px 0 0 0' }}>
              Step 1: Raise raw material requirement for manufacturing batch (Draft → Submitted)
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleSubmit()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: '1px solid #D6E2F0', background: '#fff', color: '#334155', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
          >
            <Save size={16} /> Submit Request
          </button>
          <button
            onClick={() => handleSubmit()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
          >
            <Send size={16} /> Submit Request
          </button>
        </div>
      </div>

      {/* Form Details Card */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #DCE5F0', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#5E6B82', marginBottom: '8px' }}>Source Warehouse / Store</label>
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: '1px solid #D6E2F0', fontSize: '14px', fontWeight: '600', color: '#24345C' }}
          >
            <option value="Main Raw Material Store (Haridwar)">Main Raw Material Store (Haridwar)</option>
            <option value="Hardware & Spares Godown">Hardware & Spares Godown</option>
            <option value="Chemical & Liquid Additives Yard">Chemical & Liquid Additives Yard</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#5E6B82', marginBottom: '8px' }}>Priority Level</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: '1px solid #D6E2F0', fontSize: '14px', fontWeight: '700', color: priority === 'Urgent' ? '#e11d48' : priority === 'High' ? '#d97706' : '#24345C' }}
          >
            <option value="Low">Low Priority</option>
            <option value="Normal">Normal</option>
            <option value="High">High Priority</option>
            <option value="Urgent">⚠️ Urgent Requirement</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#5E6B82', marginBottom: '8px' }}>Linked Work Order No</label>
          <input
            type="text"
            value={workOrderNo}
            onChange={(e) => setWorkOrderNo(e.target.value)}
            placeholder="e.g. WO-109"
            style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: '1px solid #D6E2F0', fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', color: '#24345C' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#5E6B82', marginBottom: '8px' }}>Floor Requester</label>
          <input
            type="text"
            value={requester}
            onChange={(e) => setRequester(e.target.value)}
            placeholder="Name / Station"
            style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: '1px solid #D6E2F0', fontSize: '14px', fontWeight: '600', color: '#24345C' }}
          />
        </div>
      </div>

      {/* Materials Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #DCE5F0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #DCE5F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F5FAFE' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#24345C' }}>Requested Materials List</h2>
            <p style={{ fontSize: '12px', color: '#5E6B82', margin: '2px 0 0 0' }}>Specify quantities needed from store to complete work order</p>
          </div>
          <button
            onClick={handleAddItem}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #D6E2F0', background: '#fff', color: '#2563eb', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
          >
            <Plus size={15} /> Add Material Row
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 20px', width: '50px' }}>#</th>
                <th style={{ padding: '12px 20px' }}>Material Item Name</th>
                <th style={{ padding: '12px 20px', width: '180px' }}>Requested Qty</th>
                <th style={{ padding: '12px 20px', width: '140px' }}>Unit</th>
                <th style={{ padding: '12px 20px', width: '80px', textAlign: 'center' }}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '700', color: '#5E6B82' }}>{idx + 1}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <select
                      value={item.material}
                      onChange={(e) => handleItemChange(idx, 'material', e.target.value)}
                      style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #D6E2F0', fontSize: '14px', fontWeight: '600' }}
                    >
                      {catalog.map((c, cIdx) => (
                        <option key={`${c.material}-${cIdx}`} value={c.material}>{c.material}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={item.requestedQty}
                      onChange={(e) => handleItemChange(idx, 'requestedQty', Number(e.target.value))}
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D6E2F0', fontSize: '14px', fontWeight: '800', color: '#2563eb' }}
                    />
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #D6E2F0', fontSize: '13px', color: '#475569' }}
                    />
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#e11d48', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove Row"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '20px 24px', background: '#F5FAFE', borderTop: '1px solid #DCE5F0' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#5E6B82', marginBottom: '8px' }}>Floor Justification / Special Instructions</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add special notes or urgency explanation for Plant Head approval..."
            style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '10px', border: '1px solid #D6E2F0', fontSize: '13px', color: '#24345C' }}
          />
        </div>
      </div>
    </div>
  );
}
