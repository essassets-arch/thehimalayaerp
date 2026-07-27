'use client';

import { useState, useEffect } from 'react';
import { useSearchStore } from '@/store/searchStore';

import Swal from 'sweetalert2';
import { Plus, Search, Edit2, Trash2, ShieldAlert, Phone, Mail, MapPin, CreditCard, Clock, FileText } from 'lucide-react';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import * as purchaseService from '../services/purchase.service';

export default function VendorManagement() {
  const globalSearch = useSearchStore(s => s.globalSearch);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    vendor_name: '',
    vendor_code: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    payment_terms: 'Net 30',
    credit_limit: 0,
    notes: ''
  });

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const data = await purchaseService.getVendors();
      setVendors(data || []);
    } catch (err) {
      console.error('Fetch vendors error:', err);
      Swal.fire('Error', err.message || 'Failed to load vendors', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      vendor_name: '',
      vendor_code: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      payment_terms: 'Net 30',
      credit_limit: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      vendor_name: vendor.vendor_name || '',
      vendor_code: vendor.vendor_code || '',
      contact_person: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      gstin: vendor.gstin || '',
      payment_terms: vendor.payment_terms || 'Net 30',
      credit_limit: vendor.credit_limit || 0,
      notes: vendor.notes || ''
    });
    setShowModal(true);
  };

  const handleInspect = async (vendor) => {
    try {
      const detailed = await purchaseService.getVendorById(vendor.id);
      setSelectedVendorDetail(detailed);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch vendor profile details', 'error');
    }
  };

  const handleDelete = async (vendor) => {
    const result = await Swal.fire({
      title: 'Delete Vendor?',
      text: `Are you sure you want to delete ${vendor.vendor_name}? This cannot be undone if they have no transactions.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await purchaseService.deleteVendor(vendor.id);
        Swal.fire('Success', 'Vendor deleted successfully', 'success');
        fetchVendors();
        if (selectedVendorDetail?.id === vendor.id) {
          setSelectedVendorDetail(null);
        }
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete vendor', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendor_name.trim()) return;

    try {
      if (editingVendor) {
        await purchaseService.updateVendor(editingVendor.id, formData);
        Swal.fire('Success', 'Vendor updated successfully', 'success');
      } else {
        await purchaseService.createVendor(formData);
        Swal.fire('Success', 'Vendor created successfully', 'success');
      }
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      Swal.fire('Error', err.message || 'Operation failed', 'error');
    }
  };

  const formatCurrency = (val) => {
    return `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Row */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">Vendor Registry</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Manage supplier records, credit limits, and purchase order histories.
          </p>
        </div>
        <button className="action-btn" style={{ background: 'var(--color-primary)', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleOpenAdd}>
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      {/* Main Grid: Directory + Side details panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedVendorDetail ? '1fr 350px' : '1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Directory Card */}
        <div className="app-card" style={{ overflow: 'hidden' }}>
          <DataTable
            columns={[
              { header: 'Code', accessor: 'vendor_code', render: (row) => <strong style={{ color: 'var(--color-text-primary)' }}>{row.vendor_code}</strong> },
              { header: 'Vendor Name', accessor: 'vendor_name' },
              { header: 'Contact Person', accessor: 'contact_person' },
              { header: 'Email / Phone', accessor: 'email', render: (row) => (
                <div style={{ fontSize: '12px' }}>
                  {row.email && <div>{row.email}</div>}
                  {row.phone && <div style={{ color: 'var(--color-text-secondary)' }}>{row.phone}</div>}
                </div>
              )},
              { header: 'GSTIN', accessor: 'gstin' },
              { header: 'Total Spent', accessor: 'total_spent', render: (row) => formatCurrency(row.total_spent) },
              { header: 'Status', accessor: 'is_active', render: (row) => <StatusBadge status={row.is_active ? 'Active' : 'Inactive'} /> }
            ]}
            data={vendors}
            searchQuery={globalSearch}
            searchField="vendor_name"
            emptyMessage={isLoading ? 'Loading supplier registry sheets...' : 'No vendors registered yet.'}
            actions={(row) => (
              <>
                <button className="action-btn-icon" onClick={() => handleInspect(row)} title="Inspect Details" style={{ background: 'rgba(0,0,0,0.03)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}>
                  <FileText size={14} />
                </button>
                <button className="action-btn-icon" onClick={() => handleOpenEdit(row)} title="Edit Vendor" style={{ background: 'rgba(0,0,0,0.03)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}>
                  <Edit2 size={14} />
                </button>
                <button className="action-btn-icon" onClick={() => handleDelete(row)} title="Delete Vendor" style={{ background: 'rgba(239,68,68,0.05)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </>
            )}
          />
        </div>

        {/* Inspect Side Profile Card */}
        {selectedVendorDetail && (
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            <button style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => setSelectedVendorDetail(null)}>✕</button>
            
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedVendorDetail.vendor_code}</span>
              <h3 style={{ margin: '4px 0 10px 0', fontSize: '18px', fontWeight: '800' }}>{selectedVendorDetail.vendor_name}</h3>
              <StatusBadge status={selectedVendorDetail.is_active ? 'Active' : 'Inactive'} />
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              {selectedVendorDetail.contact_person && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={14} style={{ color: 'var(--color-primary)' }} />
                  <span>Contact: <strong>{selectedVendorDetail.contact_person}</strong></span>
                </div>
              )}
              {selectedVendorDetail.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} style={{ color: 'var(--color-text-secondary)' }} />
                  <span>Phone: <a href={`tel:${selectedVendorDetail.phone}`}>{selectedVendorDetail.phone}</a></span>
                </div>
              )}
              {selectedVendorDetail.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} style={{ color: 'var(--color-text-secondary)' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Email: <a href={`mailto:${selectedVendorDetail.email}`}>{selectedVendorDetail.email}</a></span>
                </div>
              )}
              {selectedVendorDetail.address && (
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <MapPin size={14} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }} />
                  <span>Address: {selectedVendorDetail.address}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={14} style={{ color: 'var(--color-text-secondary)' }} />
                <span>GSTIN: <strong>{selectedVendorDetail.gstin || 'N/A'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} style={{ color: 'var(--color-text-secondary)' }} />
                <span>Terms: <strong>{selectedVendorDetail.payment_terms || 'N/A'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={14} style={{ color: 'var(--color-text-secondary)' }} />
                <span>Credit Limit: <strong>{formatCurrency(selectedVendorDetail.credit_limit)}</strong></span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Purchase Order History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {selectedVendorDetail.purchase_orders && selectedVendorDetail.purchase_orders.length > 0 ? (
                  selectedVendorDetail.purchase_orders.map(po => po && po.id ? (
                    <div key={po.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', padding: '8px', borderRadius: '6px', fontSize: '11.5px' }}>
                      <div>
                        <strong style={{ color: 'var(--color-primary)' }}>{po.po_number}</strong>
                        <div style={{ color: '#888', fontSize: '10px', marginTop: '2px' }}>{po.date ? new Date(po.date).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div><strong>{formatCurrency(po.total)}</strong></div>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: po.status === 'Closed' || po.status === 'Received' ? '#10b981' : '#f59e0b' }}>{po.status}</span>
                      </div>
                    </div>
                  ) : null)
                ) : (
                  <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px' }}>No POs registered for this vendor.</div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay active" onClick={() => setShowModal(false)} style={{ zIndex: 10000 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '600px', maxWidth: '100%' }}>
            <div className="modal-header-row">
              <h3 className="modal-title-text">{editingVendor ? 'Edit Supplier Record' : 'Register New Supplier'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Vendor/Supplier Name *</label>
                <input
                  type="text" required className="form-input" placeholder="e.g. Reliance Steel Corp"
                  value={formData.vendor_name} onChange={e => setFormData({ ...formData, vendor_name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. John Doe"
                    value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Vendor Code (Auto-generated if blank)</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. VND-0001" disabled={!!editingVendor}
                    value={formData.vendor_code} onChange={e => setFormData({ ...formData, vendor_code: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. +91 9988776655"
                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email" className="form-input" placeholder="e.g. contact@supplier.com"
                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">GSTIN</label>
                  <input
                    type="text" className="form-input" placeholder="e.g. 07AAAAA1111A1Z1"
                    value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Payment Terms</label>
                  <select
                    className="form-select"
                    value={formData.payment_terms} onChange={e => setFormData({ ...formData, payment_terms: e.target.value })}
                  >
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                    <option value="COD">Cash On Delivery</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Credit Limit (INR)</label>
                  <input
                    type="number" className="form-input" placeholder="e.g. 500000"
                    value={formData.credit_limit} onChange={e => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
                  />
                </div>
                {editingVendor && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Vendor Status</label>
                    <select
                      className="form-select"
                      value={formData.is_active ? 'true' : 'false'} onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Supplier Address</label>
                <textarea
                  className="form-input" rows="2" placeholder="Corporate head office address..."
                  value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Internal Remarks / Notes</label>
                <textarea
                  className="form-input" rows="2" placeholder="Bank details, key POC names, or logistics preferences..."
                  value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '10px' }}>
                <button type="button" className="action-btn" style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-btn" style={{ background: 'var(--color-primary)', color: '#000', fontWeight: 'bold' }}>
                  {editingVendor ? 'Save Changes' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
