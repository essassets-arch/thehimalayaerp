import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit3, Trash2, Download, Upload, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import DataTable from './DataTable';
import StatusBadge from './StatusBadge';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../../components/ui/ConfirmDialog';

export default function ProductMasterUI({ role }) {
  const { showToast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  // Filters
  const [filterFamily, setFilterFamily] = useState('All');
  const [filterDispatch, setFilterDispatch] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);

  // Form State
  const initialFormState = {
    id: null,
    product_name: '',
    product_code: '',
    product_type: 'Manufactured', // Manufactured, Trading, Service
    product_family: '',
    variant_details: '',
    unit_of_measure: 'Set',
    brand: 'HIMALAYA',
    gst_rate: 18,
    hsn_sac_code: '',
    dispatch_category: 'DISPATCH 1'
  };
  const [formData, setFormData] = useState(initialFormState);

  const isSuperAdmin = role === 'Super Admin';
  const canDelete = isSuperAdmin;
  // Both Super Admin & Plant Head can Create/Edit
  const canEdit = isSuperAdmin || role === 'Plant Head';

  // Fetch Paginated Data
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search: searchQuery
      });
      // Optionally add category filters if backend supports it later
      const { data } = await axios.get(`/api/products?${params}`);
      if (data.success) {
        let list = data.data || [];
        
        // Client-side filtering for dispatch and family (since backend pagination currently only supports global search)
        // If the dataset is large, these filters should be moved to the backend as well.
        if (filterFamily !== 'All') {
          list = list.filter(p => p.product_family === filterFamily || (!p.product_family && filterFamily === 'Other'));
        }
        if (filterDispatch !== 'All') {
          list = list.filter(p => p.dispatch_category === filterDispatch);
        }

        setProducts(list);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || list.length);
      }
    } catch (err) {
      showToast('error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, filterFamily, filterDispatch, showToast]);

  useEffect(() => {
    // Reset to page 1 when search or filters change
    setPage(1);
  }, [searchQuery, filterFamily, filterDispatch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  const families = ['All', 'Manhole Covers', 'Gratings', 'Pipes', 'Blocks', 'Other']; // Static for now to avoid full table scan

  const dispatchCats = ['All', 'DISPATCH 1', 'DISPATCH 2'];
  const productTypes = ['Manufactured', 'Trading', 'Service'];

  const columns = [
    { header: 'Product Code', accessor: 'product_code' },
    { 
      header: 'Product Name', 
      accessor: (p) => (
        <div>
          <div style={{ fontWeight: 600 }}>{p.product_name}</div>
          {p.variant_details && <div style={{ fontSize: '11px', color: '#5E6B82' }}>{p.variant_details}</div>}
        </div>
      )
    },
    { 
      header: 'Type / Family', 
      accessor: (p) => (
        <div>
          <div style={{ fontSize: '13px' }}>{p.product_type || '—'}</div>
          <div style={{ fontSize: '11px', color: '#5E6B82' }}>{p.product_family || '—'}</div>
        </div>
      )
    },
    { header: 'Unit', accessor: 'unit_of_measure' },
    { header: 'Brand', accessor: 'brand' },
    { header: 'GST / HSN', accessor: (p) => `${p.gst_rate}%${p.hsn_sac_code ? ` / ${p.hsn_sac_code}` : ''}` },
    { 
      header: 'Dispatch', 
      accessor: (p) => {
        const badgeProps = p.dispatch_category === 'DISPATCH 2' 
          ? { text: 'D2', type: 'success' }
          : p.dispatch_category === 'DISPATCH 1'
            ? { text: 'D1', type: 'primary' }
            : { text: '—', type: 'secondary' };
        return <StatusBadge {...badgeProps} />;
      }
    },
    {
      header: 'Actions',
      accessor: (p) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && (
            <button 
              onClick={() => openEdit(p)}
              style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }}
              title="Edit"
            >
              <Edit3 size={16} />
            </button>
          )}
          {canDelete && (
            <button 
              onClick={() => handleDelete(p.id)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const openEdit = (p) => {
    setFormData({
      id: p.id,
      product_name: p.product_name || '',
      product_code: p.product_code || '',
      product_type: p.product_type || 'Manufactured',
      product_family: p.product_family || '',
      variant_details: p.variant_details || '',
      unit_of_measure: p.unit_of_measure || 'Set',
      brand: p.brand || 'HIMALAYA',
      gst_rate: p.gst_rate || 18,
      hsn_sac_code: p.hsn_sac_code || '',
      dispatch_category: p.dispatch_category || 'DISPATCH 1'
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setFormData({ ...initialFormState });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.product_name || !formData.product_code) {
      showToast('Name and Code are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (formData.id) {
        await axios.put(`/api/products/${formData.id}`, formData);
        showToast('Product updated successfully.');
      } else {
        await axios.post('/api/products', formData);
        showToast('success', 'Product saved successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone and may affect historical records.',
      confirmText: 'Delete',
      confirmColor: '#ef4444',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/products/${id}`);
          showToast('success', 'Product deleted successfully');
          fetchProducts();
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to delete product', 'error');
        }
      }
    });
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/api/products/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast(`Imported successfully. ${res.data.inserted} added, ${res.data.updated} updated.`);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to import products', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExport = () => {
    if (!products || products.length === 0) {
      showToast('No products to export', 'error');
      return;
    }
    
    // Basic CSV Export
    const headers = ['ID', 'Code', 'Name', 'Type', 'Family', 'Variant', 'Unit', 'Brand', 'GST', 'HSN', 'Dispatch'];
    const rows = products.map(p => [
      p.id,
      p.product_code,
      `"${(p.product_name || '').replace(/"/g, '""')}"`,
      p.product_type,
      `"${(p.product_family || '').replace(/"/g, '""')}"`,
      `"${(p.variant_details || '').replace(/"/g, '""')}"`,
      p.unit_of_measure,
      `"${(p.brand || '').replace(/"/g, '""')}"`,
      p.gst_rate,
      p.hsn_sac_code,
      p.dispatch_category
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product_master_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', animation: 'fadeIn 0.3s ease-in-out' }}>
      <ConfirmDialogComponent />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#F5FAFE', margin: 0 }}>Product Master</h2>
          <p style={{ color: '#8893A7', margin: '4px 0 0 0', fontSize: '14px' }}>Centralized catalog for all items, variants, and dispatch routing.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            <Download size={16} /> Export CSV
          </button>
          
          <button 
            onClick={() => fetchProducts()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            {importing ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
            {importing ? 'Importing...' : 'Import Excel'}
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} style={{ display: 'none' }} disabled={importing} />
          </label>

          {canEdit && (
            <button 
              onClick={openCreate}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
            >
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5E6B82' }} />
          <input 
            type="text" 
            placeholder="Search by code or name..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
          />
        </div>
        <select 
          value={filterFamily} 
          onChange={e => setFilterFamily(e.target.value)}
          style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
        >
          {families.map(f => <option key={f} value={f} style={{ background: '#1e293b' }}>{f === 'All' ? 'All Families' : f}</option>)}
        </select>
        <select 
          value={filterDispatch} 
          onChange={e => setFilterDispatch(e.target.value)}
          style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
        >
          {dispatchCats.map(d => <option key={d} value={d} style={{ background: '#1e293b' }}>{d === 'All' ? 'All Dispatches' : d}</option>)}
        </select>
      </div>

      <div className="crm-table-container">
        <DataTable columns={columns} data={products} isLoading={loading} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '10px 16px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #DCE5F0' }}>
        <span style={{ fontSize: '13px', color: '#5E6B82', fontWeight: '500' }}>
          Showing Page {page} of {totalPages} (Total: {totalCount})
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-small btn-outline-small" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button 
            className="btn-small btn-outline-small" 
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#1e293b', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#F5FAFE' }}>
                {formData.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8893A7', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#D6E2F0' }}>Product Name *</label>
                  <input type="text" value={formData.product_name} onChange={e => setFormData({ ...formData, product_name: e.target.value })} placeholder="e.g. WCB 20MM" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#D6E2F0' }}>Product Code *</label>
                  <input type="text" value={formData.product_code} onChange={e => setFormData({ ...formData, product_code: e.target.value })} placeholder="e.g. WCB-20" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#D6E2F0' }}>Product Type</label>
                  <select value={formData.product_type} onChange={e => setFormData({ ...formData, product_type: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                    {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#D6E2F0' }}>Product Family</label>
                  <input type="text" value={formData.product_family} onChange={e => setFormData({ ...formData, product_family: e.target.value })} placeholder="e.g. Cover Block" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#D6E2F0' }}>Variant Details</label>
                  <input type="text" value={formData.variant_details} onChange={e => setFormData({ ...formData, variant_details: e.target.value })} placeholder="e.g. 20mm" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#D6E2F0' }}>Unit of Measure</label>
                  <select value={formData.unit_of_measure} onChange={e => setFormData({ ...formData, unit_of_measure: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#D6E2F0' }}>Brand</label>
                  <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#D6E2F0' }}>Dispatch Category</label>
                  <select value={formData.dispatch_category} onChange={e => setFormData({ ...formData, dispatch_category: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}>
                    <option value="DISPATCH 1">DISPATCH 1</option>
                    <option value="DISPATCH 2">DISPATCH 2</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#D6E2F0' }}>GST Rate (%)</label>
                    <input type="number" value={formData.gst_rate} onChange={e => setFormData({ ...formData, gst_rate: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#D6E2F0' }}>HSN / SAC Code</label>
                    <input type="text" value={formData.hsn_sac_code} onChange={e => setFormData({ ...formData, hsn_sac_code: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
                  </div>
                </div>

              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#F5FAFE', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                disabled={isSubmitting}
                style={{ padding: '10px 20px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
