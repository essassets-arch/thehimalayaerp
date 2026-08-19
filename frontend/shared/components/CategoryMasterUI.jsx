'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Package, Tag, Info, RefreshCw, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { backendFetch } from '../../lib/backendFetch';
import { useToast } from '../context/ToastContext';
import { useSearchStore } from '@/store/searchStore';
import DataTable from './DataTable';

const fireSwal = async (opts) => {
  const Swal = (await import('sweetalert2')).default;
  return Swal.fire(opts);
};

export default function CategoryMasterUI({ role = 'Plant Head' }) {
  const { showToast } = useToast();
  const globalSearch = useSearchStore(s => s.globalSearch);

  const [loading, setLoading] = useState(true);
  const [realBackendProducts, setRealBackendProducts] = useState([]);
  const [productCategories, setProductCategories] = useState([]);

  // Fetch products and extract categories
  const fetchRealCatalogCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await backendFetch('/api/backend/products?limit=1000');
      const raw = Array.isArray(data) ? data : (data?.data || []);

      // Filter out raw materials/hardware from categories list
      const productsOnly = raw.filter(p => {
        const type = String(p.productType || p.product_type || '').toUpperCase();
        const family = String(p.category || p.product_family || '').toLowerCase();
        const code = String(p.sku || p.product_code || '').toUpperCase();
        const name = String(p.name || p.product_name || '').toLowerCase();
        if (type === 'RAW_MATERIAL' || type === 'HARDWARE') {
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
      });

      const normalized = productsOnly.map(p => ({
        ...p,
        product_name: p.product_name || p.name || '',
        category: p.category || p.product_family || 'Uncategorized'
      }));
      setRealBackendProducts(normalized);

      const dbCategories = Array.from(new Set(normalized.map(p => p.category).filter(Boolean)));
      
      // Load custom categories saved in storage for cross-module sync
      let savedCustom = [];
      try {
        const stored = localStorage.getItem('himalaya_custom_categories');
        if (stored) savedCustom = JSON.parse(stored);
      } catch (err) {
        console.error('Failed to parse custom categories:', err);
      }

      const combined = Array.from(new Set([...dbCategories, ...savedCustom]))
        .filter(c => !['raw material', 'hardware', 'electric', 'consumable', 'consumables'].includes(c.toLowerCase()));
      setProductCategories(combined.length > 0 ? combined : dbCategories);
    } catch (e) {
      console.error('Failed to load categories:', e);
      showToast('Failed to load product categories.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRealCatalogCategories();
  }, [fetchRealCatalogCategories]);

  const handleCreateCategory = async () => {
    const { value: categoryName } = await fireSwal({
      title: 'Add New Category',
      input: 'text',
      inputPlaceholder: 'e.g. Hardware, Raw Material...',
      showCancelButton: true,
      confirmButtonText: 'Add Category',
      confirmButtonColor: '#6366F1'
    });

    if (categoryName && categoryName.trim()) {
      const trimmed = categoryName.trim();
      if (productCategories.includes(trimmed)) {
        showToast(`Category "${trimmed}" already exists.`);
        return;
      }

      const updated = [...productCategories, trimmed];
      setProductCategories(updated);

      // Save custom categories to local storage for instant sync across tabs / portals
      try {
        let savedCustom = [];
        const stored = localStorage.getItem('himalaya_custom_categories');
        if (stored) savedCustom = JSON.parse(stored);
        if (!savedCustom.includes(trimmed)) {
          savedCustom.push(trimmed);
          localStorage.setItem('himalaya_custom_categories', JSON.stringify(savedCustom));
        }
      } catch (err) {
        console.error('Failed to save custom category:', err);
      }

      showToast(`Category "${trimmed}" added successfully!`);
    }
  };

  const handleDeleteCategory = (catName) => {
    const updated = productCategories.filter(c => c !== catName);
    setProductCategories(updated);

    try {
      const stored = localStorage.getItem('himalaya_custom_categories');
      if (stored) {
        let savedCustom = JSON.parse(stored);
        savedCustom = savedCustom.filter(c => c !== catName);
        localStorage.setItem('himalaya_custom_categories', JSON.stringify(savedCustom));
      }
    } catch (err) {
      console.error('Failed to sync deleted custom category:', err);
    }

    showToast(`Category "${catName}" removed.`);
  };

  const totalCategoriesCount = productCategories.length;
  const categorizedProductsCount = realBackendProducts.filter(p => p.category && p.category !== 'Uncategorized').length;

  const categoryStats = productCategories.map(cat => ({
    name: cat,
    count: realBackendProducts.filter(p => p.category === cat || p.product_family === cat).length
  })).sort((a, b) => b.count - a.count);

  const topCategory = categoryStats[0] || { name: 'None', count: 0 };
  const uncategorizedCount = realBackendProducts.filter(p => !p.category || p.category === 'Uncategorized').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* KPI Cards Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#6366F1' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#6366F1', letterSpacing: '0.05em' }}>Total Categories</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '4px', lineHeight: 1 }}>{totalCategoriesCount}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Active product categories</div>
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
            <Layers size={24} />
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#10B981' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#10B981', letterSpacing: '0.05em' }}>Categorized Items</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '4px', lineHeight: 1 }}>{categorizedProductsCount}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Mapped database products</div>
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <Package size={24} />
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#8B5CF6' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#8B5CF6', letterSpacing: '0.05em' }}>Top Category</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '6px', lineHeight: 1.2 }}>{topCategory.name}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{topCategory.count} products</div>
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
            <Tag size={24} />
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#F59E0B' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#D97706', letterSpacing: '0.05em' }}>Uncategorized</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginTop: '4px', lineHeight: 1 }}>{uncategorizedCount}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Items needing classification</div>
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Info size={24} />
          </div>
        </div>

      </div>

      {/* Categories Data Table Card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Product Catalog Categories</h2>
            <span style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', display: 'block' }}>Logical segmentation parameters for pricing and inventory tracking</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => fetchRealCatalogCategories()}
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '9px 16px', borderRadius: '8px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', border: 'none', padding: '9px 18px', borderRadius: '8px', color: '#FFFFFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}
              onClick={handleCreateCategory}
            >
              <Plus size={16} /> Create Category
            </button>
          </div>
        </div>

        <DataTable
          columns={[
            { 
              header: 'Category Name', 
              accessor: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tag size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>{row}</div>
                  </div>
                </div>
              )
            },
            { 
              header: 'Associated Products', 
              accessor: (row) => {
                const matching = realBackendProducts.filter(p => p.category === row || p.product_family === row);
                return (
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: matching.length > 0 ? '#EEF2FF' : '#F1F5F9', color: matching.length > 0 ? '#4338CA' : '#64748B', border: matching.length > 0 ? '1px solid #C7D2FE' : '1px solid #E2E8F0' }}>
                    {matching.length} Products
                  </span>
                );
              }
            },
            {
              header: 'Sample Products Preview',
              accessor: (row) => {
                const matching = realBackendProducts.filter(p => p.category === row || p.product_family === row);
                if (matching.length === 0) return <span style={{ fontSize: '12px', color: '#94A3B8', italic: 'true' }}>No items mapped</span>;
                const samples = matching.slice(0, 3).map(p => p.product_name || p.name).join(', ');
                const extra = matching.length > 3 ? ` +${matching.length - 3} more` : '';
                return <span style={{ fontSize: '13px', color: '#475569' }}>{samples}{extra}</span>;
              }
            }
          ]}
          data={productCategories}
          searchQuery={globalSearch}
          emptyMessage="No product categories found."
          actions={(row) => {
            const count = realBackendProducts.filter(p => p.category === row || p.product_family === row).length;
            if (count > 0) {
              return (
                <span 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '5px', 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    background: '#F1F5F9', 
                    color: '#64748B', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    border: '1px solid #E2E8F0',
                    cursor: 'not-allowed'
                  }}
                  title={`Cannot delete: ${count} active catalog products are mapped to ${row}`}
                >
                  <ShieldAlert size={13} style={{ color: '#94A3B8' }} /> In Use ({count})
                </span>
              );
            }

            return (
              <button
                onClick={() => handleDeleteCategory(row)}
                style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '6px 12px', borderRadius: '6px', color: '#EF4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Delete Empty Category"
              >
                <Trash2 size={13} /> Delete
              </button>
            );
          }}
        />
      </div>
    </div>
  );
}
