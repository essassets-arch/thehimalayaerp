import { useState, useEffect, useRef, useCallback } from 'react';
import { backendFetch } from '../../lib/backendFetch';

/**
 * ProductPicker — Centralized, searchable product selector.
 *
 * Props:
 *  value         — { id, product_code, display_name, brand, gst_rate, hsn_sac_code, unit_of_measure, dispatch_category }
 *  onChange      — called with selected product object (or null on clear)
 *  categoryId    — optional: pre-filter by category
 *  dispatchCat   — optional: pre-filter by dispatch category ('DISPATCH 1' | 'DISPATCH 2')
 *  placeholder   — input placeholder text
 *  disabled      — disables the picker
 *  className     — extra classes for the container
 *  showBadge     — show dispatch badge next to result (default: true)
 *  label         — visible label above the input
 *  required      — marks field as required
 *  error         — error message string
 */
export default function ProductPicker({
  value = null,
  onChange,
  categoryId = null,
  dispatchCat = null,
  placeholder = 'Search products by name, code, or SKU…',
  disabled = false,
  className = '',
  showBadge = true,
  label,
  required = false,
  error,
  testId = 'product-picker'
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Dispatch badge styling
  const DISPATCH_BADGE = {
    'D1':         { label: 'D1', bg: 'rgba(99,102,241,0.18)', color: '#818cf8' },
    'D2':         { label: 'D2', bg: 'rgba(16,185,129,0.18)', color: '#34d399' },
    'DISPATCH 1': { label: 'D1', bg: 'rgba(99,102,241,0.18)', color: '#818cf8' },
    'DISPATCH 2': { label: 'D2', bg: 'rgba(16,185,129,0.18)', color: '#34d399' },
    'NONE':       { label: '—',  bg: 'rgba(100,116,139,0.18)', color: '#8893A7' },
  };

  const search = useCallback(async (q) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('scope', 'sales');
      if (q) queryParams.set('search', q);

      const response = await backendFetch(`/api/backend/products?${queryParams.toString()}`, { cacheTtlMs: 0 });
      const products = Array.isArray(response) ? response : response?.data || [];

      // Filter out internal Hardware and Raw Materials (unless explicitly MANUFACTURING or TRADING)
      const salesProducts = products.filter(p => {
        const type = (p.productType || p.product_type || '').toUpperCase();
        const cat = (p.category || p.product_family || '').toLowerCase();
        if (type === 'HARDWARE' || type === 'RAW_MATERIAL') return false;
        if (type === 'MANUFACTURING' || type === 'TRADING') return true;
        if (cat === 'raw material' || cat === 'electric') return false;
        return true;
      });

      const mappedResults = salesProducts.map(p => {
        let cat = p.dispatchCategory || 'NONE';
        if (cat === 'DISPATCH 1') cat = 'D1';
        if (cat === 'DISPATCH 2') cat = 'D2';
        return {
          id: p.id,
          public_id: p.publicId,
          product_name: p.name || 'Unknown Product',
          product_code: p.sku || p.publicId || 'N/A',
          brand: p.category || '',
          gst_rate: p.gstRate || 18,
          hsn_sac_code: p.hsnCode || '',
          unit_of_measure: p.unit || 'pcs',
          dispatch_category: cat,
          selling_price: Number(p.unitPrice || 0),
          price: Number(p.unitPrice || 0),
          description: p.description || '',
          productType: p.productType || 'MANUFACTURING',
        };
      });

      setResults(mappedResults);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, dispatchCat]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length === 0) {
      // On empty query, show first 20 products
      debounceRef.current = setTimeout(() => search(''), 0);
    } else {
      debounceRef.current = setTimeout(() => search(query), 280);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  // Close on outside click or touch
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('pointerdown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('pointerdown', handler);
    };
  }, []);

  const handleSelect = (product) => {
    onChange && onChange(product);
    setQuery('');
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange && onChange(null);
    setQuery('');
  };

  const handleInputFocus = () => {
    setOpen(true);
    if (results.length === 0) search(query);
  };

  // Group results by product_family for display
  const grouped = results.reduce((acc, p) => {
    const family = p.product_family || p.category_name || 'Other';
    if (!acc[family]) acc[family] = [];
    acc[family].push(p);
    return acc;
  }, {});

  const badge = (p) => {
    const b = DISPATCH_BADGE[p.dispatch_category] || DISPATCH_BADGE['NONE'];
    return (
      <span style={{
        fontSize: '10px', fontWeight: 700, padding: '1px 6px',
        borderRadius: '4px', background: b.bg, color: b.color, flexShrink: 0,
      }}>
        {b.label}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`product-picker ${className}`} style={{ position: 'relative', width: '100%', zIndex: open ? 2147483647 : 'auto', overflow: 'visible' }}>
      {label && (
        <label style={{
          display: 'block', marginBottom: '6px',
          fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary, #8893A7)',
          letterSpacing: '0.02em',
        }}>
          {label}{required && <span style={{ color: '#f87171', marginLeft: '3px' }}>*</span>}
        </label>
      )}

      {/* Selected value display */}
      {value && !open ? (
        <div
          data-testid="selected-product"
          data-product-code={value.product_code}
          onClick={() => !disabled && setOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 12px', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer',
            background: '#ffffff',
            border: `1px solid ${error ? '#f87171' : '#DCE5F0'}`,
            transition: 'border-color 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          {showBadge && badge(value)}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value.display_name || value.product_name}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
              {[value.product_code, value.brand, value.gst_rate != null ? `GST ${value.gst_rate}%` : null, value.hsn_sac_code ? `HSN ${value.hsn_sac_code}` : null].filter(Boolean).join(' · ')}
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleClear}
              style={{
                background: '#fee2e2', border: 'none', cursor: 'pointer',
                color: '#dc2626', width: '24px', height: '24px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800, flexShrink: 0
              }}
              title="Clear selection"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            data-testid={testId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={disabled ? 'N/A' : placeholder}
            disabled={disabled}
            autoComplete="off"
            style={{
              width: '100%', padding: '9px 36px 9px 12px',
              borderRadius: '8px', outline: 'none', boxSizing: 'border-box',
              background: '#ffffff',
              border: `1.5px solid ${error ? '#f87171' : open ? '#2563eb' : '#cbd5e1'}`,
              color: '#0f172a', fontSize: '13.5px',
              transition: 'all 0.15s ease',
              cursor: disabled ? 'not-allowed' : 'text',
              boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none'
            }}
          />
          {/* Search icon / Close button */}
          {open ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer',
                color: '#64748b', fontSize: '11px', fontWeight: 700, padding: '3px 6px'
              }}
            >
              ✕
            </button>
          ) : (
            <span style={{
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              color: '#94a3b8', pointerEvents: 'none', fontSize: '14px',
            }}>
              {loading ? '⟳' : '⌕'}
            </span>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>{error}</div>
      )}

      {/* Dropdown */}
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '10px', zIndex: 2147483647, maxHeight: '280px', overflowY: 'auto',
          boxShadow: '0 16px 40px rgba(15,23,42,0.22), 0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {/* Header with quick hide action */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
            position: 'sticky', top: 0, zIndex: 10
          }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Product
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: 700, color: '#2563eb', padding: '2px 6px'
              }}
            >
              ✕ Hide List
            </button>
          </div>
          {loading && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary, #5E6B82)', fontSize: '13px' }}>
              Searching…
            </div>
          )}
          {!loading && results.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary, #5E6B82)', fontSize: '13px' }}>
              No products found{query ? ` for "${query}"` : ''}
            </div>
          )}
          {!loading && Object.entries(grouped).map(([family, products]) => (
            <div key={family}>
              {/* Group header */}
              <div style={{
                padding: '6px 12px 4px',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                color: 'var(--color-text-secondary, #5E6B82)', textTransform: 'uppercase',
                borderBottom: '1px solid var(--color-border, #DCE5F0)',
              }}>
                {family}
              </div>
              {products.map((p) => (
                <div
                  key={p.id}
                  data-testid={`product-option-${p.public_id}`}
                  onClick={() => handleSelect(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px', cursor: 'pointer',
                    transition: 'background 0.15s',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-background, #F5FAFE)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {showBadge && badge(p)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary, #24345C)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {p.display_name || p.product_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #5E6B82)', marginTop: '1px' }}>
                      {p.product_code} · {p.unit_of_measure} · GST {p.gst_rate}%
                      {p.hsn_sac_code ? ` · HSN ${p.hsn_sac_code}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
