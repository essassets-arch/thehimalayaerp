'use client';

import React, { useState } from 'react';
import { Building2, Plus, X } from 'lucide-react';
import { PageSearchInput, StandardActionButtons } from '@/components/GlobalUIComponents';
import '@/components/erp-premium-ui.css';

export default function VendorMasterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState([
    { id: 'VEN-001', vendorName: 'Apex Steel Industries Ltd', gstNo: '27AAACA1234F1Z2', contactPerson: 'Vikram Mehta', mobile: '+91 98201 12345', email: 'sales@apexsteel.com', address: 'Plot 45, MIDC Industrial Area, Pune, MH', paymentTerms: '30 Days', status: 'Active' },
    { id: 'VEN-002', vendorName: 'Polymer Extrusions India', gstNo: '24AABCP5678G2Z9', contactPerson: 'Suresh Patel', mobile: '+91 97123 45678', email: 'orders@polymerextrusions.in', address: 'GIDC Phase 3, Vatva, Ahmedabad, GJ', paymentTerms: '15 Days', status: 'Active' },
    { id: 'VEN-003', vendorName: 'Precision Fasteners & Bolts', gstNo: '07AAACF9876H1Z1', contactPerson: 'Ramesh Sharma', mobile: '+91 98110 99887', email: 'info@precisionfasteners.com', address: 'Okhla Industrial Estate Phase II, New Delhi', paymentTerms: '20 Days', status: 'Active' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: '', gstNo: '', contactPerson: '', mobile: '', email: '', address: '', paymentTerms: '15 Days'
  });

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName.trim()) return;
    const newVendor = {
      id: `VEN-${(vendors.length + 1).toString().padStart(3, '0')}`,
      ...formData,
      status: 'Active'
    };
    setVendors([newVendor, ...vendors]);
    setShowAddModal(false);
    setFormData({ vendorName: '', gstNo: '', contactPerson: '', mobile: '', email: '', address: '', paymentTerms: '15 Days' });
    alert('Vendor created successfully!');
  };

  const filtered = vendors.filter(v => 
    v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.gstNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="erp-page-container">
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <Building2 style={{ width: 24, height: 24, color: '#4f46e5' }} />
            Store → Vendor Master
          </h2>
          <p className="erp-header-subtitle">Centralized directory of raw material suppliers, payment terms, and GST details.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PageSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search vendor name, GST..." />
          <button 
            onClick={() => setShowAddModal(true)}
            className="erp-btn erp-btn-primary"
            type="button"
          >
            <Plus style={{ width: 16, height: 16 }} />
            Add New Vendor
          </button>
        </div>
      </div>

      <div className="erp-table-card">
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Vendor Name</th>
                <th>GST No.</th>
                <th>Contact Person</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Address</th>
                <th>Payment Terms</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 800, color: '#1e1b4b' }}>{v.id}</td>
                  <td style={{ fontWeight: 700, color: '#24345C' }}>{v.vendorName}</td>
                  <td style={{ fontFamily: 'monospace', color: '#334155' }}>{v.gstNo}</td>
                  <td style={{ color: '#334155' }}>{v.contactPerson}</td>
                  <td style={{ color: '#475569' }}>{v.mobile}</td>
                  <td style={{ color: '#475569' }}>{v.email}</td>
                  <td style={{ color: '#5E6B82', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.address}</td>
                  <td style={{ fontWeight: 700, color: '#4f46e5' }}>{v.paymentTerms}</td>
                  <td><span className="erp-badge erp-badge-green">{v.status}</span></td>
                  <td style={{ textAlign: 'right' }}><StandardActionButtons compact /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '480px', background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #DCE5F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#24345C', margin: 0 }}>Add Vendor to Master</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#8893A7', cursor: 'pointer' }} type="button">
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Vendor Name *</label>
                <input type="text" required value={formData.vendorName} onChange={e => setFormData({ ...formData, vendorName: e.target.value })} className="erp-search-input" style={{ paddingLeft: '12px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>GST No. *</label>
                  <input type="text" required value={formData.gstNo} onChange={e => setFormData({ ...formData, gstNo: e.target.value })} className="erp-search-input" style={{ paddingLeft: '12px', textTransform: 'uppercase' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Payment Terms</label>
                  <input type="text" value={formData.paymentTerms} onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })} className="erp-search-input" style={{ paddingLeft: '12px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Contact Person</label>
                  <input type="text" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} className="erp-search-input" style={{ paddingLeft: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Mobile No.</label>
                  <input type="text" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="erp-search-input" style={{ paddingLeft: '12px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Email Address</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="erp-search-input" style={{ paddingLeft: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Office / Factory Address</label>
                <textarea rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="erp-search-input" style={{ paddingLeft: '12px', height: 'auto', paddingTop: '8px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="erp-btn erp-btn-secondary">Cancel</button>
                <button type="submit" className="erp-btn erp-btn-primary">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
