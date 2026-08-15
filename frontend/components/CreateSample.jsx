'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, Plus, Trash2, Building2, User, Phone, MapPin, Truck, Layers, FileText } from 'lucide-react';
import { useERPStore } from '../shared/context/ERPContext';
import ProductPicker from '../shared/components/ProductPicker';
import { useFormDraft } from '../shared/hooks/useFormDraft';
import { displayEntityId } from '../store/idGenerator';

export default function CreateSample({ leads = [], defaultLeadId, onAddSample, onCancel }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetSampleId = searchParams?.get('sampleId');
  const targetLeadId = searchParams?.get('leadId') || defaultLeadId;
  const erpStore = useERPStore();
  const erpState = useERPStore(s => s.state);

  useEffect(() => {
    if (targetLeadId && !targetSampleId) {
      const allSamples = erpState?.sales?.samples || [];
      const leadSamples = allSamples.filter(s => (s.leadId === targetLeadId || s.sourceId === targetLeadId) && s.status !== 'CANCELLED' && s.status !== 'DELETED');
      
      const completed = leadSamples.find(s => s.status !== 'DRAFT');
      if (completed) {
        import('sweetalert2').then(({ default: Swal }) => {
          Swal.fire({
            icon: 'info',
            title: 'Already Completed',
            text: 'A sample request has already been created for this lead.',
            confirmButtonColor: '#0369a1'
          }).then(() => {
            if (onCancel) onCancel();
            else router.push('/sales/samples');
          });
        });
        return;
      }

      const draft = leadSamples.find(s => s.status === 'DRAFT');
      if (draft) {
        router.replace(`/sales/create-sample?sampleId=${draft.id || draft.sampleId}&leadId=${targetLeadId}`);
      } else {
        const res = erpStore.createOrResumeSampleFromLead(targetLeadId);
        if (res.success && res.sampleId) {
          router.replace(`/sales/create-sample?sampleId=${res.sampleId}&leadId=${targetLeadId}`);
        }
      }
    }
  }, [targetLeadId, targetSampleId, erpState, router, erpStore, onCancel]);
  
  const sampleDraft = targetSampleId 
    ? erpState?.sales?.samples?.find((s) => s.id === targetSampleId || s.sampleId === targetSampleId)
    : null;

  // Robust Lead Finder Helper
  const findLeadById = (searchId) => {
    if (!searchId) return null;
    const str = String(searchId).trim();
    const cleanNum = str.replace(/\D/g, '');
    return (
      leads.find((l) => String(l.id) === str) ||
      leads.find((l) => cleanNum && String(l.id) === cleanNum) ||
      leads.find((l) => (l.leadNo || '').toLowerCase() === str.toLowerCase()) ||
      leads.find((l) => (l.companyName || '').toLowerCase() === str.toLowerCase()) ||
      null
    );
  };

  const nonLostLeads = leads.filter((l) => l.status !== 'Lost' && l.status !== 'Archived');
  const activeLeads = nonLostLeads.length > 0 ? nonLostLeads : leads;

  const targetLead = findLeadById(targetLeadId);
  const initialLeadId = targetLead ? targetLead.id : (activeLeads[0]?.id || '');

  const emptySampleForm = {
    selectedLeadId: initialLeadId,
    selectedLead: targetLead || activeLeads[0] || null,
    productItems: [{ id: 1, product: null, quantity: 1, specification: '' }],
    transportationCost: '0',
    expectedDate: ''
  };

  const draftKey = `erp_draft_create_sample_${targetSampleId || targetLeadId || 'new'}`;

  const { formData, setFormData, clearDraft } = useFormDraft({
    draftKey,
    initialData: emptySampleForm,
    erpUpdatedAt: sampleDraft?.updatedAt
  });

  const { selectedLeadId, selectedLead, productItems, transportationCost, expectedDate } = formData;

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'function' ? value(prev[field]) : value
    }));
  };

  const setSelectedLeadId = (val) => updateField('selectedLeadId', val);
  const setSelectedLead = (val) => updateField('selectedLead', val);
  const setProductItems = (val) => updateField('productItems', val);
  const setTransportationCost = (val) => updateField('transportationCost', val);
  const setExpectedDate = (val) => updateField('expectedDate', val);

  // Handle lead selection change & prefill details
  useEffect(() => {
    const lead = leads.find((l) => String(l.id) === String(selectedLeadId)) || findLeadById(selectedLeadId);
    setSelectedLead(lead || null);

    if (lead) {
      // Auto-prefill transportation cost
      const cost = lead.expectedTransportationCost || lead.transportationCost || lead.transportCost || 0;
      setTransportationCost(String(cost));

      // Auto-prefill product items if sampleItems or detailedItems exist in lead
      if (lead.sampleItems && lead.sampleItems.length > 0) {
        setProductItems(
          lead.sampleItems.map((si, idx) => ({
            id: idx + 1,
            product: { product_name: si.productName, name: si.productName, id: si.productId || idx + 1 },
            quantity: Number(si.quantity) || 1,
            specification: si.specification || ''
          }))
        );
      } else if (lead.detailedItems && lead.detailedItems.length > 0) {
        setProductItems(
          lead.detailedItems.map((di, idx) => ({
            id: idx + 1,
            product: { product_name: di.productName, name: di.productName, id: di.productId || idx + 1 },
            quantity: Number(di.quantity) || 1,
            specification: di.specification || ''
          }))
        );
      } else if (lead.productInterested) {
        setProductItems([
          {
            id: 1,
            product: { product_name: lead.productInterested, name: lead.productInterested, id: 1 },
            quantity: 1,
            specification: ''
          }
        ]);
      }
    }
  }, [selectedLeadId, leads]);

  const addProductRow = () => {
    setProductItems((prev) => [
      ...prev,
      { id: Date.now(), product: null, quantity: 1, specification: '' }
    ]);
  };

  const removeProductRow = (id) => {
    if (productItems.length <= 1) return;
    setProductItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateProductRow = (id, key, val) => {
    setProductItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [key]: val } : it))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLeadId) return;

    const validProducts = productItems.filter((it) => it.product);
    if (validProducts.length === 0) {
      alert('Please select at least one product item from the catalog.');
      return;
    }

    const lead = selectedLead || leads.find((l) => String(l.id) === String(selectedLeadId));
    if (!lead) return;

    const formattedProducts = validProducts.map((it) => ({
      productId: it.product?.id || it.product?.code || `PRD-${it.id}`,
      productName: it.product?.product_name || it.product?.name || 'Sample Item',
      product: it.product?.product_name || it.product?.name || 'Sample Item',
      quantity: Number(it.quantity) || 1,
      specification: it.specification || ''
    }));

    const primaryProduct = formattedProducts[0].productName;
    const totalQty = formattedProducts.reduce((sum, p) => sum + p.quantity, 0);

    const payload = {
      leadId: lead.id,
      leadName: lead.companyName || lead.projectName || 'Lead Customer',
      customer: lead.companyName || lead.projectName || 'Lead Customer',
      product:
        formattedProducts.length === 1
          ? `${primaryProduct} (${formattedProducts[0].quantity} Pcs)`
          : formattedProducts.map((p) => `${p.productName} (${p.quantity} Pcs)`).join(', '),
      productName: primaryProduct,
      quantity: totalQty,
      products: formattedProducts,
      sampleItems: formattedProducts,
      transportationCost: Number(transportationCost) || 0,
      transportCost: Number(transportationCost) || 0,
      expectedDeliveryDate: expectedDate
    };

    const submitResult = async () => {
      let success = false;
      try {
        const res = await onAddSample(payload);
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
      <div className="module-header-row" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="card-top-icon-btn" onClick={onCancel} style={{ width: '36px', height: '36px', background: '#f1f3f5', color: '#000' }}>
            <ArrowLeft size={16} />
          </button>
          <h2 className="module-title">Create Sample Dispatch Request</h2>
        </div>
      </div>

      {activeLeads.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '14px', color: '#b45309' }}>
          <AlertCircle size={36} />
          <span style={{ fontWeight: '800', fontSize: '16px' }}>No Active Leads Available</span>
          <span style={{ fontSize: '13px', textAlign: 'center', maxWidth: '400px' }}>
            You need at least one active lead to issue and dispatch a product testing sample.
          </span>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              className="btn-small btn-primary-small" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontWeight: '800' }}
              onClick={() => router.push('/sales/create-lead')}
            >
              <Plus size={14} /> Create Lead First
            </button>
            <button 
              className="btn-small btn-outline-small" 
              style={{ padding: '10px 18px' }} 
              onClick={onCancel}
            >
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Lead Selector & Customer Details */}
          <div style={{ background: '#F5FAFE', padding: '20px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
              <Building2 size={16} style={{ color: 'var(--color-accent-teal)' }} />
              <span>1. Lead Selection & Fetched Customer Details</span>
            </h3>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Select Lead Reference *</label>
              <select 
                className="form-select" 
                value={selectedLeadId} 
                onChange={(e) => setSelectedLeadId(e.target.value)}
                required
                style={{ height: '44px', fontWeight: '700' }}
              >
                {activeLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    Lead {l.leadNumber || displayEntityId(l.id)} — {l.companyName || l.projectName || 'Customer'} {l.contactPerson || l.siteInchargeName ? `(${l.contactPerson || l.siteInchargeName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Details Display Card */}
            {selectedLead && (
              <div style={{ background: '#ffffff', border: '1.5px solid #D6E2F0', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Customer / Company</span>
                  <strong style={{ fontSize: '14px', color: '#24345C' }}>{selectedLead.companyName || selectedLead.projectName || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Contact Person / Site Incharge</span>
                  <strong style={{ fontSize: '13.5px', color: '#24345C' }}>{selectedLead.siteInchargeName || selectedLead.contactPerson || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Mobile Contact</span>
                  <strong style={{ fontSize: '13.5px', color: '#0369a1' }}>{selectedLead.siteInchargeMobile || selectedLead.phone || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Project / Group</span>
                  <strong style={{ fontSize: '13.5px', color: '#475569' }}>{selectedLead.projectName || '—'} {selectedLead.groupName ? `(${selectedLead.groupName})` : ''}</strong>
                </div>
                {selectedLead.gstNumber && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>GST Number</span>
                    <strong style={{ fontSize: '13px', color: '#166534' }}>{selectedLead.gstNumber}</strong>
                  </div>
                )}
                {selectedLead.address && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Delivery Address</span>
                    <span style={{ fontSize: '12.5px', color: '#334155' }}>
                      {[selectedLead.address?.line1, selectedLead.address?.city, selectedLead.address?.state, selectedLead.address?.pincode].filter(Boolean).join(', ') || 'Address not logged'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Multiple Products & Quantities */}
          <div style={{ background: '#F5FAFE', padding: '20px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Layers size={16} style={{ color: 'var(--color-accent-teal)' }} />
                <span>2. Products & Quantities ({productItems.length})</span>
              </h3>
              <button
                type="button"
                onClick={addProductRow}
                className="btn-small btn-primary-small"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', padding: '6px 12px' }}
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {productItems.map((item, index) => (
                <div 
                  key={item.id} 
                  style={{ 
                    background: '#ffffff', 
                    border: '1px solid #D6E2F0', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr)) auto', 
                    gap: '14px',
                    alignItems: 'center' 
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Product #{index + 1} *</label>
                    <ProductPicker 
                      value={item.product} 
                      onChange={(p) => updateProductRow(item.id, 'product', p)} 
                      placeholder="Search product from catalog..." 
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0, maxWidth: '140px' }}>
                    <label className="form-label">Quantity *</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => updateProductRow(item.id, 'quantity', e.target.value)} 
                      required 
                      style={{ height: '42px', color: '#000', background: '#fff' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Specification / Notes</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 60mm Grey M30 Grade" 
                      value={item.specification} 
                      onChange={(e) => updateProductRow(item.id, 'specification', e.target.value)} 
                      style={{ height: '42px', color: '#000', background: '#fff' }}
                    />
                  </div>

                  {productItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProductRow(item.id)}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        borderRadius: '8px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        marginTop: '22px'
                      }}
                      title="Remove product"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Logistics & Transportation Cost */}
          <div style={{ background: '#F5FAFE', padding: '20px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
              <Truck size={16} style={{ color: 'var(--color-accent-teal)' }} />
              <span>3. Transportation & Delivery Settings</span>
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expected Transportation Cost (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1500.00"
                  value={transportationCost} 
                  onChange={(e) => setTransportationCost(e.target.value)} 
                  style={{ height: '42px', color: '#000', background: '#fff', fontWeight: '700' }}
                />
                <span style={{ fontSize: '11px', color: '#5E6B82', marginTop: '4px', display: 'block' }}>Auto-fetched from lead details if previously entered.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Delivery Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={expectedDate} 
                  onChange={(e) => setExpectedDate(e.target.value)} 
                  style={{ height: '42px', color: '#000', background: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="submit" className="form-submit-btn" style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '800' }}>
              🚀 Send Sample Request
            </button>
            <button type="button" className="btn-small btn-outline-small" onClick={onCancel} style={{ padding: '12px 20px' }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
