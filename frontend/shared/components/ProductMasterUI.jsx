import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Download, Upload, RefreshCw, 
  ChevronLeft, ChevronRight, Package, CheckCircle2, Tag, Truck,
  SlidersHorizontal, Check, Factory, ShoppingBag, Layers
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import axios from 'axios';
import { backendFetch } from '../../lib/backendFetch';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { useERP } from '../context/ERPContext';

const UNITS = ['PCS', 'SET', 'KG', 'LTR', 'BAG', 'ROLL', 'CAN', 'BARREL', 'PKT', 'MTR'];

export default function ProductMasterUI({ role }) {
  const { showToast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { syncData } = useERP() || {};

  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Submenu Tab State: 'MANUFACTURING' | 'TRADING' | 'ALL'
  const [activeSubMenu, setActiveSubMenu] = useState('ALL');

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
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
    dispatch_category: 'D1',
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
      const data = await backendFetch('/api/backend/products?limit=1000');
      const list = Array.isArray(data) ? data : (data?.data || []);
      
      // Normalize fields for backend compatibility
      const normalizedList = list.map(p => {
        let cat = p.dispatchCategory || p.dispatch_category;
        if (cat === 'D1' || cat === 'DISPATCH 1') cat = 'D1';
        else if (cat === 'D2' || cat === 'DISPATCH 2') cat = 'D2';
        else cat = 'Unassigned';

        return {
          ...p,
          product_name: p.product_name || p.name || '',
          product_code: p.product_code || p.sku || '',
          product_family: p.product_family || p.category || '',
          unit_of_measure: p.unit_of_measure || p.unit || 'PCS',
          product_type: normalizeProductType(p.product_type || p.productType),
          brand: p.brand || 'HIMALAYA',
          gst_rate: p.gst_rate ?? p.gstRate ?? 18,
          hsn_sac_code: p.hsn_sac_code || p.hsnSacCode || '',
          dispatch_category: cat,
          image_url: p.image_url || p.imageUrl || ''
        };
      });

      // Exclude raw materials/materials (RAW_MATERIAL, HARDWARE, raw material, hardware, electric, consumables)
      const productsOnly = normalizedList.filter((p, index) => {
        const originalProduct = list[index];
        const origType = String(originalProduct?.productType || originalProduct?.product_type || '').toUpperCase();
        const family = String(p.product_family || '').toLowerCase();
        const code = String(p.product_code || '').toUpperCase();
        const name = String(p.product_name || '').toLowerCase();
        if (origType === 'RAW_MATERIAL' || origType === 'HARDWARE') {
          return false;
        }
        if (['raw material', 'hardware', 'electric', 'consumables', 'consumable'].includes(family)) {
          return false;
        }
        if (code.startsWith('HCPPL') || code.startsWith('RM-') || code.startsWith('HM')) {
          return false;
        }
        const rawKeywords = [
          'cement', 'sand', 'aggregate', 'gravel', 'stone', 'pigment', 'powder', 
          'water paper', 'brush', 'welcor', 'haksaw', 'drill', 'thappi', 'chisel', 
          'clamp', 'hammer', 'bucket', 'ghamela', 'carbon', 'pva', 'wax', 'polish', 
          'resin', 'cobalt', 'catalyst', 'fly ash', 'admixture'
        ];
        if (rawKeywords.some(keyword => name.includes(keyword))) {
          return false;
        }
        return true;
      }, [rawProducts]);

      setRawProducts(productsOnly);
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
    const families = new Set(rawProducts.map(p => p.product_family || p.category).filter(Boolean));
    let savedCustom = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('himalaya_custom_categories');
        if (stored) savedCustom = JSON.parse(stored);
      } catch (err) {
        console.error('Failed to parse custom categories:', err);
      }
    }
    const combined = Array.from(new Set([...families, ...savedCustom]));
    return ['All', ...combined]
      .filter(f => !['raw material', 'hardware', 'electric', 'consumable', 'consumables'].includes(f.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  }, [rawProducts]);

  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const dbCategories = Array.from(new Set(rawProducts.map(p => p.product_family || p.category).filter(Boolean)));
    let savedCustom = [];
    try {
      const stored = localStorage.getItem('himalaya_custom_categories');
      if (stored) savedCustom = JSON.parse(stored);
    } catch (err) {
      console.error('Failed to parse custom categories:', err);
    }
    const combined = Array.from(new Set([...dbCategories, ...savedCustom]))
      .filter(c => !['raw material', 'hardware', 'electric', 'consumable', 'consumables'].includes(c.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
    setAvailableCategories(combined);
  }, [isModalOpen, rawProducts]);

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
      
      const matchesDispatch = filterDispatch === 'All' || filterDispatch === 'All Dispatches' ||
        (filterDispatch === 'D1' && p.dispatch_category === 'D1') ||
        (filterDispatch === 'D2' && p.dispatch_category === 'D2') ||
        (filterDispatch === 'Unassigned' && (p.dispatch_category === 'Unassigned' || !p.dispatch_category));
      
      const pType = String(p.product_type || '').toUpperCase();
      const matchesSubMenu = activeSubMenu === 'ALL' || 
        (activeSubMenu === 'MANUFACTURING' && (pType === 'MANUFACTURING' || pType === 'MANUFACTURED')) ||
        (activeSubMenu === 'TRADING' && pType === 'TRADING');

      return matchesSearch && matchesFamily && matchesDispatch && matchesSubMenu;
    });
  }, [rawProducts, searchQuery, filterFamily, filterDispatch, activeSubMenu]);

  // Pagination Slice
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterFamily, filterDispatch, pageSize, activeSubMenu]);

  const currentPageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  // KPI Computations
  const activeCount = useMemo(() => rawProducts.filter(p => p.isActive !== false).length, [rawProducts]);
  const d1Count = useMemo(() => rawProducts.filter(p => p.dispatch_category === 'D1').length, [rawProducts]);
  const d2Count = useMemo(() => rawProducts.filter(p => p.dispatch_category === 'D2').length, [rawProducts]);
  const unassignedCount = useMemo(() => rawProducts.filter(p => p.dispatch_category === 'Unassigned' || !p.dispatch_category).length, [rawProducts]);
  const familyCount = Math.max(0, availableFamilies.length - 1);

  const mfgCount = useMemo(() => rawProducts.filter(p => {
    const t = String(p.product_type || '').toUpperCase();
    return t === 'MANUFACTURING' || t === 'MANUFACTURED';
  }).length, [rawProducts]);
  
  const tradingCount = useMemo(() => rawProducts.filter(p => {
    const t = String(p.product_type || '').toUpperCase();
    return t === 'TRADING';
  }).length, [rawProducts]);
  
  const allCount = rawProducts.length;

  const dispatchCats = ['All Dispatches', 'D1', 'D2', 'Unassigned'];
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
      dispatch_category: p.dispatch_category || 'D1',
      weight: p.weight || '',
      image_url: p.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    const defaultType = activeSubMenu === 'TRADING' ? 'TRADING' : 'MANUFACTURING';
    setFormData({ ...initialFormState, product_type: defaultType });
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
      dispatchCategory: (formData.dispatch_category === 'Unassigned' || !formData.dispatch_category) ? null : formData.dispatch_category,
      gstRate: Number(formData.gst_rate || 18),
      hsnCode: formData.hsn_sac_code || '',
      variantDetails: formData.variant_details || '',
      weight: Number(formData.weight || 0),
      imageUrl: formData.image_url || '',
    };

    try {
      if (formData.id) {
        await backendFetch(`/api/backend/products/${formData.id}`, { method: 'PATCH', body: payload });
        showToast('Product updated successfully.');
      } else {
        await backendFetch('/api/backend/products', { method: 'POST', body: payload });
        showToast('Product saved successfully.');
      }
      setIsModalOpen(false);
      fetchProducts();
      if (syncData) syncData();
    } catch (err) {
      showToast(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone and may affect historical records.',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await backendFetch(`/api/backend/products/${id}`, { method: 'DELETE' });
        showToast('Product deleted successfully.');
        fetchProducts();
        if (syncData) syncData();
      } catch (err) {
        showToast(err.message || 'Failed to delete product');
      }
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await backendFetch('/api/backend/products/import', { method: 'POST', body: fd });
      showToast(`Imported successfully. ${res?.inserted || 0} added, ${res?.updated || 0} updated.`);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to import products');
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
    <div style={{ padding: isMobile ? '12px' : '28px 32px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <ConfirmDialogComponent />
      
      {/* Header Section */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '0', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Product Master
          </h1>
          <p style={{ color: '#64748B', margin: '4px 0 0 0', fontSize: '14px', fontWeight: 400 }}>
            Centralized catalog for all items, variants, and dispatch routing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <button 
            onClick={handleExport}
            style={{ flex: isMobile ? 1 : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.15s ease' }}
          >
            <Download size={16} /> Export CSV
          </button>
          
          <button 
            onClick={() => fetchProducts()}
            style={{ flex: isMobile ? 1 : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          
          {canEdit && (
            <button 
              onClick={openCreate}
              style={{ flex: isMobile ? '1 1 100%' : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', border: 'none', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}
            >
              <Plus size={18} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Modern KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: isMobile ? '12px' : '20px', marginBottom: '24px' }}>
        
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
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#8B5CF6', letterSpacing: '0.05em' }}>Product Categories</div>
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
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '8px', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ color: '#0284c7' }}>D1: {d1Count}</span>
              <span style={{ color: '#94A3B8' }}>|</span>
              <span style={{ color: '#059669' }}>D2: {d2Count}</span>
              {unassignedCount > 0 && (
                <span style={{ color: '#d97706', fontSize: '11px', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px', border: '1px solid #FCD34D' }}>
                  ⚠ Null: {unassignedCount}
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>Logistics dispatch breakdown</div>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Truck size={26} />
          </div>
        </div>

      </div>

      {/* Products Submenu Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'stretch', width: '100%' }}>
        <button
          type="button"
          onClick={() => setActiveSubMenu('MANUFACTURING')}
          style={{
            flex: isMobile ? 1 : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: isMobile ? '10px 8px' : '11px 22px',
            borderRadius: '10px',
            border: activeSubMenu === 'MANUFACTURING' ? '2px solid #4F46E5' : '1px solid #CBD5E1',
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: 800,
            background: activeSubMenu === 'MANUFACTURING' ? '#4F46E5' : '#FFFFFF',
            color: activeSubMenu === 'MANUFACTURING' ? '#FFFFFF' : '#475569',
            boxShadow: activeSubMenu === 'MANUFACTURING' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Factory size={16} />
          {!isMobile && "Manufacturing Products"}
          {isMobile && "Mfg"}
          <span style={{
            background: activeSubMenu === 'MANUFACTURING' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
            color: activeSubMenu === 'MANUFACTURING' ? '#FFFFFF' : '#334155',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '12px',
            fontWeight: 700,
            marginLeft: '4px'
          }}>
            {mfgCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubMenu('TRADING')}
          style={{
            flex: isMobile ? 1 : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: isMobile ? '10px 8px' : '11px 22px',
            borderRadius: '10px',
            border: activeSubMenu === 'TRADING' ? '2px solid #059669' : '1px solid #CBD5E1',
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: 800,
            background: activeSubMenu === 'TRADING' ? '#059669' : '#FFFFFF',
            color: activeSubMenu === 'TRADING' ? '#FFFFFF' : '#475569',
            boxShadow: activeSubMenu === 'TRADING' ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <ShoppingBag size={16} />
          {!isMobile && "Trading Products"}
          {isMobile && "Trading"}
          <span style={{
            background: activeSubMenu === 'TRADING' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
            color: activeSubMenu === 'TRADING' ? '#FFFFFF' : '#334155',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '12px',
            fontWeight: 700,
            marginLeft: '4px'
          }}>
            {tradingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubMenu('ALL')}
          style={{
            flex: isMobile ? 1 : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: isMobile ? '10px 8px' : '11px 22px',
            borderRadius: '10px',
            border: activeSubMenu === 'ALL' ? '2px solid #334155' : '1px solid #CBD5E1',
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: 800,
            background: activeSubMenu === 'ALL' ? '#334155' : '#FFFFFF',
            color: activeSubMenu === 'ALL' ? '#FFFFFF' : '#475569',
            boxShadow: activeSubMenu === 'ALL' ? '0 4px 12px rgba(51, 65, 85, 0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={16} />
          {!isMobile && "All Products"}
          {isMobile && "All"}
          <span style={{
            background: activeSubMenu === 'ALL' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
            color: activeSubMenu === 'ALL' ? '#FFFFFF' : '#334155',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '12px',
            fontWeight: 700,
            marginLeft: '4px'
          }}>
            {allCount}
          </span>
        </button>
      </div>

      {/* Toolbar: Search, Filters & Page Size Controls */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '14px', alignItems: isMobile ? 'stretch' : 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        
        {/* Search Input Container */}
        <div className="search-box" style={{ flex: isMobile ? '1 1 auto' : '1 1 280px', minWidth: isMobile ? '100%' : '240px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px', boxSizing: 'border-box' }}>
          <Search size={18} style={{ color: '#94A3B8', flexShrink: 0 }} />
          <input 
            type="text" 
            placeholder="Search by code, name, category, or brand..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', color: '#0F172A', fontSize: '13.5px', outline: 'none', padding: 0 }}
          />
        </div>

        {/* Filter Controls Group */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '12px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          {/* Filter Category Dropdown */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '6px', flex: isMobile ? 1 : 'none', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>Category:</span>
            <select 
              value={filterFamily} 
              onChange={e => setFilterFamily(e.target.value)}
              style={{ width: isMobile ? '100%' : 'auto', padding: '9px 12px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '13.5px', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              {availableFamilies.map(f => <option key={f} value={f}>{f === 'All' ? 'All Categories' : f}</option>)}
            </select>
          </div>

          {/* Filter Dispatch Dropdown */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '6px', flex: isMobile ? 1 : 'none', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>Dispatch:</span>
            <select 
              value={filterDispatch} 
              onChange={e => setFilterDispatch(e.target.value)}
              style={{ width: isMobile ? '100%' : 'auto', padding: '9px 12px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '13.5px', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              {dispatchCats.map(d => <option key={d} value={d}>{d === 'All' ? 'All Dispatches' : d}</option>)}
            </select>
          </div>

          {/* Page Size Selector */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '6px', flex: isMobile ? 1 : 'none', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>Per Page:</span>
            <select 
              value={pageSize} 
              onChange={e => setPageSize(Number(e.target.value))}
              style={{ width: isMobile ? '100%' : 'auto', padding: '9px 12px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '13.5px', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

        </div>

      </div>
      {/* Premium Clean Data Table Container */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '14px', background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#6366F1' }} />
              Loading catalog items...
            </div>
          ) : currentPageData.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '14px', background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              No matching products found.
            </div>
          ) : (
            currentPageData.map((p, idx) => (
              <div
                key={p.id || idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.product_name}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f1f5f9', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <Package size={22} />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#334155', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                        {p.product_code}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                        {p.unit_of_measure}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', marginTop: '2px' }}>{p.product_name}</div>
                    {p.variant_details && (
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{p.variant_details}</div>
                    )}
                  </div>
                </div>

                {/* Details breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '12px', color: '#475569' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Type</span>
                    <span style={{ fontWeight: 600 }}>{p.product_type}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Category</span>
                    <span style={{ fontWeight: 600 }}>{p.product_family || '—'}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Brand</span>
                    <span style={{ fontWeight: 600 }}>{p.brand}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>GST / HSN</span>
                    <span>{p.gst_rate}% {p.hsn_sac_code ? `/ ${p.hsn_sac_code}` : ''}</span>
                  </div>
                </div>

                {/* Dispatch category Selector */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Dispatch Route:</span>
                  <select
                    value={p.dispatch_category || 'Unassigned'}
                    onChange={async (e) => {
                      const newCat = e.target.value;
                      const updatedCat = newCat === 'Unassigned' ? null : newCat;
                      try {
                        await backendFetch(`/api/backend/products/${p.id}`, {
                          method: 'PATCH',
                          body: { dispatchCategory: updatedCat },
                        });
                        setRawProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, dispatch_category: newCat } : prod));
                        showToast(`Product ${p.product_code} category updated to ${newCat}!`);
                      } catch (err) {
                        console.error('Failed to update dispatch category:', err);
                        showToast(`Failed to update category: ${err.message || 'Server error'}`);
                      }
                    }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      outline: 'none',
                      border: p.dispatch_category === 'D1'
                        ? '1px solid #93C5FD'
                        : p.dispatch_category === 'D2'
                        ? '1px solid #A7F3D0'
                        : '1px solid #FCD34D',
                      background: p.dispatch_category === 'D1'
                        ? '#EFF6FF'
                        : p.dispatch_category === 'D2'
                        ? '#ECFDF5'
                        : '#FEF3C7',
                      color: p.dispatch_category === 'D1'
                        ? '#1D4ED8'
                        : p.dispatch_category === 'D2'
                        ? '#047857'
                        : '#B45309',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <option value="D1">D1 (Dispatch 1)</option>
                    <option value="D2">D2 (Dispatch 2)</option>
                    <option value="Unassigned">⚠ Unassigned</option>
                  </select>
                </div>

                {/* Action controls */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', justifyContent: 'flex-end' }}>
                  {canEdit && (
                    <button
                      onClick={() => openEdit(p)}
                      style={{ flex: 1, padding: '8px', background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 'bold' }}
                    >
                      <Edit3 size={15} /> Edit Product
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{ padding: '8px 12px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', width: '64px' }}>Image</th>
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
                    <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#6366F1' }} />
                      Loading catalog items...
                    </td>
                  </tr>
                ) : currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((p, idx) => (
                    <tr 
                      key={p.id || idx}
                      style={{ borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', transition: 'background-color 0.15s ease' }}
                    >
                      {/* Image */}
                      <td style={{ padding: '12px 16px', width: '64px' }}>
                        {p.image_url ? (
                          <img 
                            src={p.image_url} 
                            alt={p.product_name} 
                            style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }} 
                          />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#F1F5F9', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                            <Package size={20} />
                          </div>
                        )}
                      </td>
  
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
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{p.variant_details}</div>
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
  
                      {/* Dispatch (Interactive Inline Management) */}
                      <td style={{ padding: '16px 20px' }}>
                        <select
                          value={p.dispatch_category || 'Unassigned'}
                          onChange={async (e) => {
                            const newCat = e.target.value;
                            const updatedCat = newCat === 'Unassigned' ? null : newCat;
                            try {
                              await backendFetch(`/api/backend/products/${p.id}`, {
                                method: 'PATCH',
                                body: { dispatchCategory: updatedCat },
                              });
                              setRawProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, dispatch_category: newCat } : prod));
                              showToast(`Product ${p.product_code} category updated to ${newCat}!`);
                            } catch (err) {
                              console.error('Failed to update dispatch category:', err);
                              showToast(`Failed to update category: ${err.message || 'Server error'}`);
                            }
                          }}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            outline: 'none',
                            border: p.dispatch_category === 'D1'
                              ? '1px solid #93C5FD'
                              : p.dispatch_category === 'D2'
                              ? '1px solid #A7F3D0'
                              : '1px solid #FCD34D',
                            background: p.dispatch_category === 'D1'
                              ? '#EFF6FF'
                              : p.dispatch_category === 'D2'
                              ? '#ECFDF5'
                              : '#FEF3C7',
                            color: p.dispatch_category === 'D1'
                              ? '#1D4ED8'
                              : p.dispatch_category === 'D2'
                              ? '#047857'
                              : '#B45309',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <option value="D1" style={{ background: '#fff', color: '#1D4ED8', fontWeight: 'bold' }}>D1 (Dispatch 1)</option>
                          <option value="D2" style={{ background: '#fff', color: '#047857', fontWeight: 'bold' }}>D2 (Dispatch 2)</option>
                          <option value="Unassigned" style={{ background: '#fff', color: '#B45309', fontWeight: 'bold' }}>⚠ Unassigned</option>
                        </select>
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
                              style={{ padding: '6px', background: '#FEF2FF', border: '1px solid #FECACA', color: '#EF4444', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
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
        )}

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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '650px', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF2FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                  <Package size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {formData.id ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                    Configure product master details & uploaded image
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#64748B', cursor: 'pointer', fontSize: '20px', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}
                title="Close"
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
                  <select 
                    value={formData.product_family} 
                    onChange={e => setFormData({ ...formData, product_family: e.target.value })} 
                    style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">Select Category / Product Family</option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Dispatch Category Routing</label>
                  <select 
                    value={formData.dispatch_category || 'Unassigned'} 
                    onChange={e => setFormData({ ...formData, dispatch_category: e.target.value })} 
                    style={{ width: '100%', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '14px', outline: 'none', fontWeight: 'bold' }}
                  >
                    <option value="D1">D1 (Dispatch 1 — Ravikant Tiwari Queue)</option>
                    <option value="D2">D2 (Dispatch 2 — Sahad Mansuri Queue)</option>
                    <option value="Unassigned">⚠ Unassigned / Pending</option>
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
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Product Image & Preview</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      id="product-image-upload"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setFormData(prev => ({ ...prev, image_url: reader.result }));
                        reader.readAsDataURL(file);
                      }} 
                      style={{ display: 'none' }} 
                    />
                    
                    {formData.image_url ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px' }}>
                        <img 
                          src={formData.image_url} 
                          alt="Product Preview" 
                          style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} 
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={16} /> Image Uploaded Successfully
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Live preview ready for catalog display</div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <label 
                              htmlFor="product-image-upload"
                              style={{ padding: '6px 12px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Upload size={14} /> Change Image
                            </label>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                              style={{ padding: '6px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label 
                        htmlFor="product-image-upload"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', padding: '20px 14px', background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '12px', color: '#64748B', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'center' }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Upload size={20} />
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, color: '#4F46E5' }}>Click to upload</span> or drag and drop product image
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>PNG, JPG, WEBP up to 5MB</div>
                        </div>
                      </label>
                    )}
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
