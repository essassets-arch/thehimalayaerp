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
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Dispatch badge styling
  const DISPATCH_BADGE = {
    'DISPATCH 1': { label: 'D1', bg: 'rgba(99,102,241,0.18)', color: '#818cf8' },
    'DISPATCH 2': { label: 'D2', bg: 'rgba(16,185,129,0.18)', color: '#34d399' },
    'NONE':       { label: '—',  bg: 'rgba(100,116,139,0.18)', color: '#8893A7' },
  };

  const search = useCallback(async (q) => {
    setLoading(true);
    try {
      const response = await backendFetch(`/api/backend/products${q ? `?search=${encodeURIComponent(q)}` : ''}`);
      const products = Array.isArray(response) ? response : response?.data || [];
      const mappedResults = products.map(p => ({
        id: p.id,
        public_id: p.publicId,
        product_name: p.name || 'Unknown Product',
        product_code: p.sku || p.publicId || 'N/A',
        brand: p.category || '',
        gst_rate: p.gstRate || 18,
        hsn_sac_code: p.hsnCode || '',
        unit_of_measure: p.unit || 'pcs',
        dispatch_category: p.dispatchCategory || 'NONE',
        selling_price: Number(p.unitPrice || 0),
        price: Number(p.unitPrice || 0),
        description: p.description || ''
      }));

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

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
    <div ref={containerRef} className={`product-picker ${className}`} style={{ position: 'relative' }}>
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
          onClick={() => !disabled && setOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 12px', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer',
            background: 'var(--color-card-bg, #ffffff)',
            border: `1px solid ${error ? '#f87171' : 'var(--color-border, #DCE5F0)'}`,
            transition: 'border-color 0.2s',
          }}
        >
          {showBadge && badge(value)}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary, #24345C)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value.display_name || value.product_name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #5E6B82)', marginTop: '1px' }}>
              {value.product_code} · {value.brand} · GST {value.gst_rate}% · HSN {value.hsn_sac_code || '—'}
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleClear}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted, #5E6B82)', padding: '2px', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 0.15s',
              }}
              title="Clear selection"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
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
              background: 'var(--color-card-bg, #ffffff)',
              border: `1px solid ${error ? '#f87171' : open ? 'var(--color-accent-teal, #6366f1)' : 'var(--color-border, #DCE5F0)'}`,
              color: 'var(--color-text-primary, #24345C)', fontSize: '14px',
              transition: 'border-color 0.2s',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />
          {/* Search icon */}
          <span style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-secondary, #5E6B82)', pointerEvents: 'none', fontSize: '14px',
          }}>
            {loading ? '⟳' : '⌕'}
          </span>
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
          background: 'var(--color-card-bg, #ffffff)',
          border: '1px solid var(--color-border, #DCE5F0)',
          borderRadius: '10px', zIndex: 1000, maxHeight: '320px', overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
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
