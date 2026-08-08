import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Download, Upload, RefreshCw, 
  ChevronLeft, ChevronRight, Package, CheckCircle2, Tag, Truck,
  SlidersHorizontal, Check
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../../components/ui/ConfirmDialog';

const UNITS = ['PCS', 'SET', 'KG', 'LTR', 'BAG', 'ROLL', 'CAN', 'BARREL', 'PKT', 'MTR'];

export default function ProductMasterUI({ role }) {
  const { showToast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
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
    unit_of_measure: 'PCS',
    brand: 'HIMALAYA',
    gst_rate: 18,
    hsn_sac_code: '',
    dispatch_category: 'DISPATCH 1',
    weight: '',
    image_url: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const isSuperAdmin = role === 'Super Admin';
  const canDelete = isSuperAdmin;
  const canEdit = isSuperAdmin || role === 'Plant Head';

  // Fetch Full Catalog Data
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch full set to enable responsive client-side filtering, KPI calculations, and instant search
      const { data } = await axios.get('/api/backend/products?limit=1000');
      if (data.success || Array.isArray(data.data)) {
        const list = data.data || [];
        
        // Normalize fields for backend compatibility
        const normalizedList = list.map(p => ({
          ...p,
          product_name: p.product_name || p.name || '',
          product_code: p.product_code || p.sku || '',
          product_family: p.product_family || p.category || '',
          unit_of_measure: p.unit_of_measure || p.unit || 'PCS',
          product_type: normalizeProductType(p.product_type || p.productType),
          brand: p.brand || 'HIMALAYA',
          gst_rate: p.gst_rate ?? p.gstRate ?? 18,
          hsn_sac_code: p.hsn_sac_code || p.hsnSacCode || '',
          dispatch_category: p.dispatch_category || p.dispatchCategory || 'DISPATCH 1'
        }));

        setRawProducts(normalizedList);
      }
    } catch (err) {
      showToast('Failed to fetch products catalog.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Dynamic Categories / Families list
  const availableFamilies = useMemo(() => {
    const families = new Set(rawProducts.map(p => p.product_family).filter(Boolean));
    return ['All', ...Array.from(families)];
  }, [rawProducts]);

  // Instant Client-Side Search & Filter
  const filteredProducts = useMemo(() => {
    return rawProducts.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.product_code.toLowerCase().includes(q) || 
        p.product_name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.product_family.toLowerCase().includes(q);

      const matchesFamily = filterFamily === 'All' || p.product_family === filterFamily;
      const matchesDispatch = filterDispatch === 'All' || p.dispatch_category === filterDispatch;

      return matchesSearch && matchesFamily && matchesDispatch;
    });
  }, [rawProducts, searchQuery, filterFamily, filterDispatch]);

  // Pagination Slice
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterFamily, filterDispatch, pageSize]);

  const currentPageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  // KPI Computations
  const activeCount = useMemo(() => rawProducts.filter(p => p.isActive !== false).length, [rawProducts]);
  const d1Count = useMemo(() => rawProducts.filter(p => p.dispatch_category === 'DISPATCH 1').length, [rawProducts]);
  const d2Count = useMemo(() => rawProducts.filter(p => p.dispatch_category === 'DISPATCH 2').length, [rawProducts]);
  const familyCount = Math.max(0, availableFamilies.length - 1);

  const dispatchCats = ['All', 'DISPATCH 1', 'DISPATCH 2'];
  const productTypes = [
    { value: 'MANUFACTURING', label: 'Manufactured' },
    { value: 'TRADING', label: 'Trading' },
    { value: 'SERVICE', label: 'Service' },
  ];

  const normalizeProductType = (type) => {
    const normalized = String(type || '').trim().toUpperCase();
    return normalized === 'MANUFACTURED' ? 'MANUFACTURING' :
      ['MANUFACTURING', 'TRADING', 'SERVICE'].includes(normalized)
        ? normalized
        : 'MANUFACTURING';
  };

  const openEdit = (p) => {
    setFormData({
      id: p.id,
      product_name: p.product_name || p.name || '',
      product_code: p.product_code || p.sku || '',
      product_type: normalizeProductType(p.product_type || p.productType),
      product_family: p.product_family || p.category || '',
      variant_details: p.variant_details || '',
      unit_of_measure: p.unit_of_measure || p.unit || 'PCS',
      brand: p.brand || 'HIMALAYA',
      gst_rate: p.gst_rate ?? 18,
      hsn_sac_code: p.hsn_sac_code || '',
      dispatch_category: p.dispatch_category || 'DISPATCH 1',
      weight: p.weight || '',
      image_url: p.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setFormData({ ...initialFormState });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.product_name || !formData.product_code) {
      showToast('Name and Code are required.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formData.product_name,
      sku: formData.product_code,
      category: formData.product_family,
      unit: formData.unit_of_measure,
      unitPrice: Number(formData.unitPrice || 0),
      productType: normalizeProductType(formData.product_type),
      brand: formData.brand || 'HIMALAYA',
      dispatchCategory: formData.dispatch_category || 'DISPATCH 1',
      gstRate: Number(formData.gst_rate || 18),
      hsnCode: formData.hsn_sac_code || '',
      variantDetails: formData.variant_details || '',
      weight: Number(formData.weight || 0),
      imageUrl: formData.image_url || '',
    };

    try {
      if (formData.id) {
        await axios.patch(`/api/backend/products/${formData.id}`, payload);
        showToast('Product updated successfully.');
      } else {
        await axios.post('/api/backend/products', payload);
        showToast('Product saved successfully.');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product');
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
          await axios.delete(`/api/backend/products/${id}`);
          showToast('Product deleted successfully.');
          fetchProducts();
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to delete product');
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
      const res = await axios.post('/api/backend/products/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast(`Imported successfully. ${res.data.inserted} added, ${res.data.updated} updated.`);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to import products');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExport = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      showToast('No products to export');
      return;
    }
    
    const headers = ['ID', 'Code', 'Name', 'Type', 'Family', 'Variant', 'Unit', 'Brand', 'GST', 'HSN', 'Dispatch'];
    const rows = filteredProducts.map(p => [
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
    <div style={{ padding: '28px 32px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <ConfirmDialogComponent />
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Product Master
          </h1>
          <p style={{ color: '#64748B', margin: '4px 0 0 0', fontSize: '14px', fontWeight: 400 }}>
            Centralized catalog for all items, variants, and dispatch routing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={handleExport}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.15s ease' }}
          >
            <Download size={16} /> Export CSV
          </button>
          
          <button 
            onClick={() => fetchProducts()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            {importing ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
            {importing ? 'Importing...' : 'Import Excel'}
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} style={{ display: 'none' }} disabled={importing} />
          </label>

          {canEdit && (
            <button 
              onClick={openCreate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', border: 'none', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}
            >
              <Plus size={18} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Modern KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Card 1: Total Catalog */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#6366F1' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#6366F1', letterSpacing: '0.05em' }}>Total Catalog</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '4px', lineHeight: 1 }}>{rawProducts.length}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Items across all categories</div>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
            <Package size={26} />
          </div>
        </div>

        {/* Card 2: Active Products */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#10B981' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#10B981', letterSpacing: '0.05em' }}>Active Products</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '4px', lineHeight: 1 }}>{activeCount}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Ready for sales & orders</div>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <CheckCircle2 size={26} />
          </div>
        </div>

        {/* Card 3: Product Families */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#8B5CF6' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#8B5CF6', letterSpacing: '0.05em' }}>Product Families</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '4px', lineHeight: 1 }}>{familyCount}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Distinct item categories</div>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
            <Tag size={26} />
          </div>
        </div>

        {/* Card 4: Dispatch Breakdown */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#F59E0B' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#D97706', letterSpacing: '0.05em' }}>Dispatch Routing</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '8px', lineHeight: 1 }}>
              <span style={{ color: '#4F46E5' }}>D1: {d1Count}</span> <span style={{ color: '#94A3B8', margin: '0 4px' }}>|</span> <span style={{ color: '#059669' }}>D2: {d2Count}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>Logistics dispatch breakdown</div>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Truck size={26} />
          </div>
        </div>

      </div>

      {/* Toolbar: Search, Filters & Page Size Controls */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input 
            type="text" 
            placeholder="Search by code, name, category, or brand..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 42px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none', transition: 'border-color 0.15s ease' }}
          />
        </div>

        {/* Filter Family Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Family:</span>
          <select 
            value={filterFamily} 
            onChange={e => setFilterFamily(e.target.value)}
            style={{ padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            {availableFamilies.map(f => <option key={f} value={f}>{f === 'All' ? 'All Families' : f}</option>)}
          </select>
        </div>

        {/* Filter Dispatch Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Dispatch:</span>
          <select 
            value={filterDispatch} 
            onChange={e => setFilterDispatch(e.target.value)}
            style={{ padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            {dispatchCats.map(d => <option key={d} value={d}>{d === 'All' ? 'All Dispatches' : d}</option>)}
          </select>
        </div>

        {/* Page Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Per Page:</span>
          <select 
            value={pageSize} 
            onChange={e => setPageSize(Number(e.target.value))}
            style={{ padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

      </div>

      {/* Premium Clean Data Table Container */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Code</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Name</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type / Family</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GST / HSN</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dispatch</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#6366F1' }} />
                    Loading catalog items...
                  </td>
                </tr>
              ) : currentPageData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                    No matching products found.
                  </td>
                </tr>
              ) : (
                currentPageData.map((p, idx) => (
                  <tr 
                    key={p.id || idx}
                    style={{ borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', transition: 'background-color 0.15s ease' }}
                  >
                    {/* Code */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px', fontWeight: 600, color: '#334155', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '6px' }}>
                        {p.product_code}
                      </span>
                    </td>

                    {/* Name */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>{p.product_name}</div>
                      {p.variant_details && (
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{p.variant_details}</div>
                      )}
                    </td>

                    {/* Type / Family */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{p.product_type}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{p.product_family || '—'}</div>
                    </td>

                    {/* Unit */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', background: '#E2E8F0', padding: '3px 8px', borderRadius: '4px' }}>
                        {p.unit_of_measure}
                      </span>
                    </td>

                    {/* Brand */}
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      {p.brand}
                    </td>

                    {/* GST / HSN */}
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                      {p.gst_rate}%{p.hsn_sac_code ? ` / ${p.hsn_sac_code}` : ''}
                    </td>

                    {/* Dispatch */}
                    <td style={{ padding: '16px 20px' }}>
                      {p.dispatch_category === 'DISPATCH 2' ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>D2</span>
                      ) : p.dispatch_category === 'DISPATCH 1' ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE' }}>D1</span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {canEdit && (
                          <button 
                            onClick={() => openEdit(p)}
                            style={{ padding: '6px', background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            title="Edit Product"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}
                        {canDelete && (
                          <button 
                            onClick={() => handleDelete(p.id)}
                            style={{ padding: '6px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Footer Pagination */}
        <div style={{ padding: '16px 20px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
            Showing <span style={{ fontWeight: 700, color: '#0F172A' }}>{totalItems > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span style={{ fontWeight: 700, color: '#0F172A' }}>{Math.min(page * pageSize, totalItems)}</span> of <span style={{ fontWeight: 700, color: '#0F172A' }}>{totalItems}</span> entries (Page {page} of {totalPages})
          </div>

          {/* Page Buttons */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: page === 1 ? '#F1F5F9' : '#FFFFFF', border: '1px solid #CBD5E1', color: page === 1 ? '#94A3B8' : '#334155', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {/* Quick Page Number Indicators */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pNum = i + 1;
              if (totalPages > 5 && page > 3) {
                pNum = page - 2 + i;
                if (pNum > totalPages) pNum = totalPages - (4 - i);
              }
              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: page === pNum ? 'none' : '1px solid #CBD5E1',
                    background: page === pNum ? '#4F46E5' : '#FFFFFF',
                    color: page === pNum ? '#FFFFFF' : '#334155'
                  }}
                >
                  {pNum}
                </button>
              );
            })}

            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: page >= totalPages ? '#F1F5F9' : '#FFFFFF', border: '1px solid #CBD5E1', color: page >= totalPages ? '#94A3B8' : '#334155', borderRadius: '6px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '620px', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                {formData.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '20px', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {"×"}
              </button>
            </div>

            {/* Modal Form Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Product Name *</label>
                  <input 
                    type="text" 
                    value={formData.product_name} 
                    onChange={e => setFormData({ ...formData, product_name: e.target.value })} 
                    placeholder="e.g. GREY GLOVES" 
                    style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }} 
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Product Code / SKU *</label>
                  <input 
                    type="text" 
                    value={formData.product_code} 
                    onChange={e => setFormData({ ...formData, product_code: e.target.value })} 
                    placeholder="e.g. HCPPL136" 
                    style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }} 
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Product Type</label>
                  <select 
                    value={formData.product_type} 
                    onChange={e => setFormData({ ...formData, product_type: e.target.value })} 
                    style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }}
                  >
                    {productTypes.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Product Family / Category</label>
                  <input 
                    type="text" 
                    value={formData.product_family} 
                    onChange={e => setFormData({ ...formData, product_family: e.target.value })} 
                    placeholder="e.g. Hardware" 
                    style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Variant Details</label>
                  <input 
                    type="text" 
                    value={formData.variant_details} 
                    onChange={e => setFormData({ ...formData, variant_details: e.target.value })} 
                    placeholder="e.g. 20mm / Grey" 
                    style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Unit of Measure</label>
                  <select 
                    value={formData.unit_of_measure} 
                    onChange={e => setFormData({ ...formData, unit_of_measure: e.target.value })} 
                    style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Brand</label>
                  <input 
                    type="text" 
                    value={formData.brand} 
                    onChange={e => setFormData({ ...formData, brand: e.target.value })} 
                    style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Dispatch Category</label>
                  <select 
                    value={formData.dispatch_category} 
                    onChange={e => setFormData({ ...formData, dispatch_category: e.target.value })} 
                    style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="DISPATCH 1">DISPATCH 1</option>
                    <option value="DISPATCH 2">DISPATCH 2</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>GST Rate (%)</label>
                    <input 
                      type="number" 
                      value={formData.gst_rate} 
                      onChange={e => setFormData({ ...formData, gst_rate: e.target.value })} 
                      style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>HSN / SAC Code</label>
                    <input 
                      type="text" 
                      value={formData.hsn_sac_code} 
                      onChange={e => setFormData({ ...formData, hsn_sac_code: e.target.value })} 
                      style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Weight</label>
                    <input 
                      type="number" 
                      value={formData.weight} 
                      onChange={e => setFormData({ ...formData, weight: e.target.value })} 
                      style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Product Image</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        id="product-image-upload"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setFormData({ ...formData, image_url: reader.result });
                          reader.readAsDataURL(file);
                        }} 
                        style={{ display: 'none' }} 
                      />
                      <label 
                        htmlFor="product-image-upload"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '8px', color: '#64748B', fontSize: '14px', cursor: 'pointer', outline: 'none', justifyContent: 'center' }}
                      >
                        <Upload size={16} />
                        <span style={{ fontWeight: 500, color: formData.image_url ? '#10B981' : '#64748B' }}>
                          {formData.image_url ? 'Image Selected (Change)' : 'Choose File'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#F8FAFC', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '10px 20px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#334155', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                disabled={isSubmitting}
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', border: 'none', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
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
