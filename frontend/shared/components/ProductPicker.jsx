import { useState, useEffect, useRef, useCallback } from 'react';
import { backendFetch } from '../../lib/backendFetch';

/**
 * Helper to perform smart multi-field, multi-token fuzzy/exact search with relevance scoring.
 */
function smartSearchProducts(items, searchQuery) {
  if (!searchQuery || !searchQuery.trim()) return items;

  const raw = searchQuery.trim().toLowerCase();
  const normalized = raw.replace(/[^a-z0-9]/g, '');
  const tokens = raw.split(/\s+/).filter(Boolean);
  const scored = [];

  for (const p of items) {
    const name = (p.display_name || p.product_name || '').toLowerCase();
    const code = (p.product_code || '').toLowerCase();
    const brand = (p.brand || p.category || '').toLowerCase();
    const hsn = (p.hsn_sac_code || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();

    const normName = name.replace(/[^a-z0-9]/g, '');
    const normCode = code.replace(/[^a-z0-9]/g, '');

    let score = 0;

    // 1. Exact match (highest priority)
    if (code === raw || normCode === normalized) {
      score += 200;
    } else if (name === raw || normName === normalized) {
      score += 160;
    }

    // 2. Starts with query
    if (code.startsWith(raw) || normCode.startsWith(normalized)) {
      score += 80;
    }
    if (name.startsWith(raw) || normName.startsWith(normalized)) {
      score += 65;
    }

    // 3. Substring match
    if (code.includes(raw)) score += 40;
    if (name.includes(raw)) score += 35;
    if (normCode.includes(normalized) && normalized.length >= 2) score += 30;
    if (normName.includes(normalized) && normalized.length >= 2) score += 25;
    if (brand.includes(raw)) score += 20;
    if (hsn.includes(raw)) score += 20;
    if (desc.includes(raw)) score += 15;

    // 4. Multi-token match: all tokens present across any product attributes
    if (tokens.length > 1) {
      const allTokensMatch = tokens.every(t => {
        const normT = t.replace(/[^a-z0-9]/g, '');
        return (
          name.includes(t) ||
          code.includes(t) ||
          brand.includes(t) ||
          hsn.includes(t) ||
          desc.includes(t) ||
          (normT && (normName.includes(normT) || normCode.includes(normT)))
        );
      });
      if (allTokensMatch) score += 55;
    }

    if (score > 0) {
      scored.push({ product: p, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || (a.product.product_name || '').localeCompare(b.product.product_name || ''));
  return scored.map(s => s.product);
}

/**
 * Highlights matching search tokens in text strings.
 */
function highlightMatch(text, q) {
  if (!text || !q || !q.trim()) return text;
  const tokens = q.trim().split(/\s+/).filter(Boolean).map(t => t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
  if (tokens.length === 0) return text;
  const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: '#fef08a', color: '#854d0e', fontWeight: 800, padding: '0 1px', borderRadius: '2px' }}>
        {part}
      </mark>
    ) : part
  );
}

/**
 * ProductPicker — Centralized, searchable product selector.
 *
 * Props:
 *  value         — { id, product_code, display_name, brand, gst_rate, hsn_sac_code, unit_of_measure, dispatch_category }
 *  onChange      — called with selected product object (or null on clear)
 *  onOpenChange  — optional callback when dropdown opens/closes
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
  onOpenChange,
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
  const [isMobile, setIsMobile] = useState(false);

  const catalogRef = useRef([]);
  const debounceRef = useRef(null);
  const searchSeqRef = useRef(0);
  const containerRef = useRef(null);

  // Monitor mobile viewport state
  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const handleSetOpen = useCallback((isOpen) => {
    setOpen(isOpen);
    if (onOpenChange) onOpenChange(isOpen);
  }, [onOpenChange]);

  // Dispatch badge styling
  const DISPATCH_BADGE = {
    'D1':         { label: 'D1', bg: 'rgba(99,102,241,0.18)', color: '#818cf8' },
    'D2':         { label: 'D2', bg: 'rgba(16,185,129,0.18)', color: '#34d399' },
    'DISPATCH 1': { label: 'D1', bg: 'rgba(99,102,241,0.18)', color: '#818cf8' },
    'DISPATCH 2': { label: 'D2', bg: 'rgba(16,185,129,0.18)', color: '#34d399' },
    'NONE':       { label: '—',  bg: 'rgba(100,116,139,0.18)', color: '#8893A7' },
  };

  const mapProducts = useCallback((rawList) => {
    // Filter out internal Hardware and Raw Materials (unless explicitly MANUFACTURING or TRADING)
    const salesProducts = rawList.filter(p => {
      const type = (p.productType || p.product_type || '').toUpperCase();
      const cat = (p.category || p.product_family || '').toLowerCase();
      if (type === 'HARDWARE' || type === 'RAW_MATERIAL') return false;
      if (type === 'MANUFACTURING' || type === 'TRADING') return true;
      if (cat === 'raw material' || cat === 'electric') return false;
      return true;
    });

    return salesProducts.map(p => {
      let cat = p.dispatchCategory || 'NONE';
      if (cat === 'DISPATCH 1') cat = 'D1';
      if (cat === 'DISPATCH 2') cat = 'D2';
      return {
        id: p.id,
        public_id: p.publicId || p.id,
        product_name: p.name || 'Unknown Product',
        product_code: p.sku || p.publicId || 'N/A',
        brand: p.brand || p.category || '',
        category: p.category || p.brand || 'Other',
        gst_rate: p.gstRate != null ? p.gstRate : 18,
        hsn_sac_code: p.hsnCode || '',
        unit_of_measure: p.unit || 'pcs',
        dispatch_category: cat,
        selling_price: Number(p.unitPrice || 0),
        price: Number(p.unitPrice || 0),
        description: p.description || '',
        productType: p.productType || 'MANUFACTURING',
      };
    });
  }, []);

  // Fetch full sales catalog once and cache in memory for 0ms instant smart search
  const fetchCatalog = useCallback(async () => {
    if (catalogRef.current.length > 0) return catalogRef.current;
    try {
      const response = await backendFetch('/api/backend/products?scope=sales', { cacheTtlMs: 30000 });
      const products = Array.isArray(response) ? response : response?.data || [];
      const mapped = mapProducts(products);
      catalogRef.current = mapped;
      return mapped;
    } catch {
      return [];
    }
  }, [mapProducts]);

  // Combined smart search: 0ms instant client search + debounced backend query
  const executeSearch = useCallback(async (q) => {
    const currentSeq = ++searchSeqRef.current;

    // 1. Instant client-side search from loaded catalog
    if (catalogRef.current.length > 0) {
      const filtered = smartSearchProducts(catalogRef.current, q);
      setResults(filtered);
    }

    // 2. Fetch or update from backend
    if (catalogRef.current.length === 0 || q.trim().length > 1) {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('scope', 'sales');
        if (q.trim()) queryParams.set('search', q.trim());

        const response = await backendFetch(`/api/backend/products?${queryParams.toString()}`, { cacheTtlMs: 0 });
        const products = Array.isArray(response) ? response : response?.data || [];
        const mapped = mapProducts(products);

        // Guard against stale asynchronous responses
        if (currentSeq === searchSeqRef.current) {
          if (catalogRef.current.length === 0 && !q.trim()) {
            catalogRef.current = mapped;
          } else {
            // Merge any uniquely returned products into local catalog cache
            const existingIds = new Set(catalogRef.current.map(p => p.id));
            mapped.forEach(p => {
              if (!existingIds.has(p.id)) catalogRef.current.push(p);
            });
          }
          const finalFiltered = smartSearchProducts(catalogRef.current, q);
          setResults(finalFiltered);
        }
      } catch {
        if (currentSeq === searchSeqRef.current && catalogRef.current.length === 0) {
          setResults([]);
        }
      } finally {
        if (currentSeq === searchSeqRef.current) {
          setLoading(false);
        }
      }
    }
  }, [mapProducts]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      if (catalogRef.current.length > 0) {
        setResults(catalogRef.current);
      } else {
        debounceRef.current = setTimeout(() => executeSearch(''), 0);
      }
    } else {
      // Run instant filter on existing cache
      if (catalogRef.current.length > 0) {
        setResults(smartSearchProducts(catalogRef.current, query));
      }
      // Debounce server verification
      debounceRef.current = setTimeout(() => executeSearch(query), 200);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, executeSearch]);

  // Close on outside click or touch
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleSetOpen(false);
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
  }, [handleSetOpen]);

  const handleSelect = (product) => {
    onChange && onChange(product);
    setQuery('');
    handleSetOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange && onChange(null);
    setQuery('');
  };

  const handleInputFocus = () => {
    handleSetOpen(true);
    if (catalogRef.current.length === 0) {
      void fetchCatalog().then(items => {
        setResults(smartSearchProducts(items, query));
      });
    } else {
      setResults(smartSearchProducts(catalogRef.current, query));
    }
  };

  // Group results by real category for display with item counts
  const grouped = results.reduce((acc, p) => {
    const family = (p.category || p.brand || p.product_family || 'Standard Products').trim().toUpperCase();
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
    <div
      ref={containerRef}
      data-open={open ? 'true' : 'false'}
      className={`product-picker ${open ? 'is-open' : ''} ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        zIndex: open ? 2147483647 : 1,
        overflow: 'visible'
      }}
    >
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
          onClick={() => !disabled && handleSetOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 12px', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer',
            background: '#ffffff',
            border: `1.5px solid ${error ? '#f87171' : '#DCE5F0'}`,
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
              onClick={(e) => { e.stopPropagation(); handleSetOpen(false); }}
              style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer',
                color: '#64748b', fontSize: '12px', fontWeight: 800, padding: '4px 8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Close product list"
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

      {/* Dropdown — Responsive center-aligned on mobile, sleek clamped on desktop */}
      {open && !disabled && (
        <div
          className="product-picker-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: isMobile ? 0 : 'auto',
            width: isMobile ? '100%' : 'max(100%, 360px)',
            minWidth: isMobile ? '100%' : '100%',
            maxWidth: isMobile ? '100%' : 'min(95vw, 600px)',
            boxSizing: 'border-box',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: isMobile ? '12px' : '10px',
            zIndex: 2147483647,
            maxHeight: isMobile ? 'min(340px, 48vh)' : '320px',
            overflowY: 'auto',
            boxShadow: '0 16px 40px rgba(15,23,42,0.24), 0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          {/* Header with quick hide action & search count */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
            position: 'sticky', top: 0, zIndex: 10
          }}>
            <span style={{
              fontSize: '11px', fontWeight: 800, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span>Select Product</span>
              <span style={{
                background: '#e2e8f0', color: '#334155', padding: '1px 6px',
                borderRadius: '10px', fontSize: '10px', fontWeight: 700
              }}>
                {results.length}
              </span>
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleSetOpen(false); }}
              style={{
                background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px',
                cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#1d4ed8',
                padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              ✕ Close
            </button>
          </div>

          {loading && results.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              Searching catalog…
            </div>
          )}

          {!loading && results.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>🔍</div>
              <div style={{ fontWeight: 600, color: '#334155' }}>No products found</div>
              <div style={{ fontSize: '11.5px', marginTop: '2px', color: '#94a3b8' }}>
                {query ? `No match for "${query}". Try code, size or category.` : 'Catalog is currently empty.'}
              </div>
            </div>
          )}

          {Object.entries(grouped).map(([family, products]) => (
            <div key={family}>
              {/* Group header */}
              <div style={{
                padding: '6px 12px 4px',
                fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em',
                color: '#64748b', textTransform: 'uppercase',
                background: '#f8fafc',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span>{family}</span>
                <span style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 700 }}>{products.length}</span>
              </div>

              {products.map((p) => (
                <div
                  key={p.id}
                  data-testid={`product-option-${p.public_id}`}
                  onClick={() => handleSelect(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: isMobile ? '10px 12px' : '9px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                    borderBottom: '1px solid #f8fafc',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {showBadge && badge(p)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', fontWeight: 700, color: '#1e293b',
                      lineHeight: '1.35', wordBreak: 'break-word'
                    }}>
                      {highlightMatch(p.display_name || p.product_name, query)}
                    </div>
                    <div style={{
                      fontSize: '11px', color: '#64748b', marginTop: '2px',
                      display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center'
                    }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                        {highlightMatch(p.product_code, query)}
                      </span>
                      <span>·</span>
                      <span>{p.unit_of_measure}</span>
                      <span>·</span>
                      <span>GST {p.gst_rate}%</span>
                      {p.hsn_sac_code && (
                        <>
                          <span>·</span>
                          <span>HSN {highlightMatch(p.hsn_sac_code, query)}</span>
                        </>
                      )}
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
