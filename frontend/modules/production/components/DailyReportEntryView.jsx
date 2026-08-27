'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../shared/context/AuthContext';
import { backendFetch } from '../../../lib/backendFetch';
import Swal from 'sweetalert2';
import {
  Plus,
  Trash2,
  Copy,
  Save,
  Send,
  CheckCircle,
  Clock,
  History,
  Printer,
  Scale,
  Package,
  Boxes,
  FileText,
  AlertCircle,
  Edit2,
  RefreshCw,
  X,
  Layers,
  Info
} from 'lucide-react';

import { useQueryClient } from '@tanstack/react-query';

// Helper to parse specifications (Size, Type, Capacity) from product name if not explicitly set
function parseProductSpecs(name = '') {
  const upper = (name || '').toUpperCase();
  const sizeMatch = upper.match(/\b(\d{2,4}\s*[xX*]\s*\d{2,4}|\d{1,2}\s*['"]\s*[xX*]\s*\d{1,2}\s*['"]|\d{1,2}\s*[xX*]\s*\d{1,2})\b/);
  const size = sizeMatch ? sizeMatch[0].replace(/\s+/g, '').toUpperCase() : '';

  let type = '';
  if (upper.includes('WGC')) type = 'WGC';
  else if (upper.includes('MHC')) type = 'MHC';
  else if (upper.includes('SFRC')) type = 'SFRC';
  else if (upper.includes('ONGC')) type = 'ONGC';
  else if (upper.includes('GRATING')) type = 'GRATING';
  else if (upper.includes('COVER BLOCK') || upper.includes('COVERBLOCK')) type = 'COVER BLOCK';
  else if (upper.includes('FRP')) type = 'FRP';

  const capMatch = upper.match(/\b(B125|C250|D400|E600|F900|A15|ELD|EHD|LD|MD|HD|2\.5T|5T|10T|12\.5T|20T|25T|40T)\b/);
  const capacity = capMatch ? capMatch[0] : '';

  return { size, type, capacity };
}

const SmartProductCombobox = memo(function SmartProductCombobox({ value, disabled, products = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 360, maxHeight: 320 });
  const inputRef = useRef(null);
  const popoverRef = useRef(null);
  const isSelectingRef = useRef(false);

  // Synchronize input query with the external selected value
  useEffect(() => {
    if (value) {
      const p = products.find(prod => prod.id === value);
      if (p) {
        setQuery(p.name);
      }
    } else {
      setQuery('');
    }
  }, [value, products]);

  const updateCoords = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const availableWidth = window.innerWidth - rect.left - 16;
      const popoverWidth = Math.max(rect.width, Math.min(420, availableWidth));
      
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < 320 && rect.top > 320;
      
      setCoords({
        top: showAbove ? rect.top - 330 : rect.bottom + 4,
        left: Math.max(8, rect.left),
        width: popoverWidth,
        maxHeight: showAbove ? Math.min(320, rect.top - 16) : Math.min(320, spaceBelow - 16)
      });
    }
  }, []);

  const handleSelectProduct = useCallback((prod) => {
    isSelectingRef.current = true;
    setQuery(prod ? prod.name : '');
    setIsOpen(false);
    setHighlightIndex(-1);
    if (onChange) {
      onChange(prod);
    }
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 150);
  }, [onChange]);

  const handleBlurValidation = useCallback(() => {
    if (isSelectingRef.current) return;

    if (!query.trim()) {
      if (value && onChange) {
        onChange(null);
      }
      return;
    }

    // Check if query exactly matches current value's product name or sku
    if (value) {
      const currentProd = products.find(p => p.id === value);
      if (currentProd && (
        currentProd.name?.toLowerCase().trim() === query.toLowerCase().trim() ||
        currentProd.sku?.toLowerCase().trim() === query.toLowerCase().trim()
      )) {
        return;
      }
    }

    // Search for exact match by name or SKU
    const exact = products.find(
      p => p.name?.toLowerCase().trim() === query.toLowerCase().trim() ||
           p.sku?.toLowerCase().trim() === query.toLowerCase().trim()
    );

    if (exact) {
      handleSelectProduct(exact);
    } else {
      // If we already had a valid selection, revert display to that selection's name
      if (value) {
        const currentProd = products.find(p => p.id === value);
        if (currentProd) {
          setQuery(currentProd.name);
          return;
        }
      }
      // If no valid selection existed, clear query and value
      setQuery('');
      if (onChange) onChange(null);
    }
  }, [query, value, products, handleSelectProduct, onChange]);

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleClickOutside = (e) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(e.target) && 
        popoverRef.current && 
        !popoverRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        handleBlurValidation();
      }
    };

    const handleScrollOrResize = () => {
      updateCoords();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updateCoords, handleBlurValidation]);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return [...products]
        .sort((a, b) => {
          const aIsMhc = a.name?.includes('MHC') || a.name?.includes('WGC') || a.name?.includes('FRP') ? 1 : 0;
          const bIsMhc = b.name?.includes('MHC') || b.name?.includes('WGC') || b.name?.includes('FRP') ? 1 : 0;
          if (aIsMhc !== bIsMhc) return bIsMhc - aIsMhc;
          return (a.name || '').localeCompare(b.name || '');
        })
        .slice(0, 80);
    }
    const q = query.toLowerCase().trim();
    const qParts = q.split(/\s+/).filter(Boolean);
    return products
      .map(p => {
        const fullStr = `${p.name || ''} ${p.sku || ''} ${p.size || ''} ${p.type || ''} ${p.capacity || ''} ${p.variantDetails || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase();
        let matchesAll = true;
        let score = 0;
        for (const part of qParts) {
          if (fullStr.includes(part)) {
            score += 10;
            if (p.name?.toLowerCase().includes(part)) score += 15;
            if (p.size?.toLowerCase().includes(part)) score += 20;
            if (p.type?.toLowerCase().includes(part)) score += 20;
            if (p.capacity?.toLowerCase().includes(part)) score += 20;
          } else {
            const normFull = fullStr.replace(/[\s\-_xX]/g, '');
            const normPart = part.replace(/[\s\-_xX]/g, '');
            if (normPart.length >= 3 && normFull.includes(normPart)) {
              score += 15;
            } else {
              matchesAll = false;
              break;
            }
          }
        }
        return { product: p, score, matchesAll };
      })
      .filter(item => item.matchesAll)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, 60);
  }, [products, query]);

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        updateCoords();
        setIsOpen(true);
        setHighlightIndex(0);
      } else {
        setHighlightIndex(prev => (prev + 1 < filtered.length ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightIndex(prev => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen) {
        e.preventDefault();
        const target = highlightIndex >= 0 && highlightIndex < filtered.length ? filtered[highlightIndex] : filtered[0];
        if (target) {
          handleSelectProduct(target);
        }
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        handleBlurValidation();
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          placeholder="Search product from catalog..."
          value={query}
          onFocus={() => {
            if (!disabled) {
              updateCoords();
              setIsOpen(true);
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            updateCoords();
            setIsOpen(true);
            setHighlightIndex(0);
            if (!e.target.value.trim()) {
              onChange(null);
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setTimeout(() => {
              handleBlurValidation();
            }, 200);
          }}
          className="form-input"
          style={{
            width: '100%',
            margin: 0,
            fontSize: '13px',
            fontWeight: '700',
            color: 'var(--color-text-primary, #0f172a)',
            paddingRight: '28px',
            background: value ? 'rgba(59, 130, 246, 0.04)' : '#ffffff',
            borderColor: value ? 'rgba(59, 130, 246, 0.4)' : 'var(--color-border, #cbd5e1)',
            borderRadius: '8px',
            padding: '8px 28px 8px 10px',
            transition: 'all 0.15s ease'
          }}
        />
        {query && !disabled && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery('');
              handleSelectProduct(null);
            }}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Clear selection"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && !disabled && typeof window !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          className="smart-product-popover"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            maxHeight: `${coords.maxHeight || 320}px`,
            overflowY: 'auto',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.25), 0 8px 16px -4px rgba(15, 23, 42, 0.1)',
            zIndex: 999999,
            padding: '6px',
            scrollbarWidth: 'thin'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
              No catalog product matched &quot;{query}&quot;. Please search by size (e.g. 300x300), type (MHC), or capacity (B125).
            </div>
          ) : (
            filtered.map((prod, idx) => {
              const isHighlighted = idx === highlightIndex;
              const isSelected = prod.id === value;
              return (
                <div
                  key={prod.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectProduct(prod);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectProduct(prod);
                  }}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'background 0.12s ease',
                    borderBottom: '1px solid #f1f5f9',
                    background: isSelected
                      ? 'rgba(59, 130, 246, 0.08)'
                      : isHighlighted
                      ? '#f1f5f9'
                      : 'transparent'
                  }}
                >
                  <div style={{ fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span>{prod.name}</span>
                    {prod.sku && (
                      <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontFamily: 'monospace', fontSize: '11px', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        {prod.sku}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', alignItems: 'center' }}>
                    {prod.size && <span style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', color: '#334155', fontWeight: '600' }}>Size: {prod.size}</span>}
                    {prod.type && <span style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', color: '#334155', fontWeight: '600' }}>Type: {prod.type}</span>}
                    {prod.capacity && <span style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', color: '#334155', fontWeight: '600' }}>Cap: {prod.capacity}</span>}
                    <span style={{ color: '#475569', fontWeight: '700' }}>Cover: {prod.coverUnitWeight || prod.weight || 0} kg</span>
                    <span style={{ color: '#475569', fontWeight: '700' }}>Frame: {prod.frameUnitWeight || 0} kg</span>
                  </div>
                </div>
              );
            })
          )}
        </div>,
        document.body
      )}
    </div>
  );
});

export default function DailyReportEntryView({
  reportId,
  onNavigateToHistory,
  onNavigateToPrint,
  title,
  subtitle,
  isDispatch = false,
  dispatchType = 'DISPATCH_1'
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const todayStr = new Date().toISOString().split('T')[0];

  const baseApiUrl = useMemo(() => {
    if (!isDispatch) {
      return '/api/backend/production/daily-reports';
    }
    return dispatchType === 'DISPATCH_1'
      ? '/api/backend/dispatch/daily-reports'
      : '/api/backend/dispatch-2/daily-reports';
  }, [isDispatch, dispatchType]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Form Header State
  const [currentReportId, setCurrentReportId] = useState(reportId || null);
  const [reportNo, setReportNo] = useState('Draft (Auto-generated on save)');
  const [reportDate, setReportDate] = useState(todayStr);
  const [shift, setShift] = useState('Morning');
  const [supervisorName, setSupervisorName] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [approvedBy, setApprovedBy] = useState(null);

  // Production Rows
  const [rows, setRows] = useState([
    {
      id: 'row-1',
      productId: '',
      size: '',
      type: '',
      capacity: '',
      coverQty: 0,
      coverUnitWeight: 0,
      coverWeight: 0,
      actualCoverWeight: '',
      frameQty: 0,
      frameUnitWeight: 0,
      frameWeight: 0,
      actualFrameWeight: '',
      weightOverrideReason: '',
      setQty: 0,
      extraCoverQty: 0,
      extraFrameQty: 0,
      totalWeight: 0,
      coversPerSet: 1,
      framesPerSet: 1,
      remarks: ''
    }
  ]);

  // Weight Override Modal State
  const [overrideModalRowIndex, setOverrideModalRowIndex] = useState(null);
  const [overrideForm, setOverrideForm] = useState({
    actualCoverWeight: '',
    actualFrameWeight: '',
    reason: ''
  });

  // Multi-Product Selection Modal State
  const [showMultiProductModal, setShowMultiProductModal] = useState(false);
  const [multiProductSearch, setMultiProductSearch] = useState('');
  const [multiProductTypeFilter, setMultiProductTypeFilter] = useState('ALL');
  const [selectedMultiProductIds, setSelectedMultiProductIds] = useState([]);


  // Fetch Products Master (Exact Parity with Super Admin Products Master, excluding raw materials)
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await backendFetch('/api/backend/products?scope=daily-report&limit=2000');
      const rawList = Array.isArray(res) ? res : res?.items || res?.data || [];

      const productList = rawList
        .map(p => {
          const specs = parseProductSpecs(p.name || p.product_name || '');
          return {
            ...p,
            id: p.id,
            name: p.name || p.product_name || '',
            sku: p.sku || p.product_code || '',
            size: p.size || p.variantDetails || specs.size || '',
            type: p.type || specs.type || '',
            capacity: p.capacity || specs.capacity || '',
            coverUnitWeight: Number(p.coverUnitWeight || p.weight || 0),
            frameUnitWeight: Number(p.frameUnitWeight || 0),
            coversPerSet: p.coversPerSet || 1,
            framesPerSet: p.framesPerSet || 1,
          };
        })
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      setProducts(productList);
    } catch (err) {
      console.error('[DailyReport] Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const productTypes = useMemo(() => {
    const types = new Set();
    products.forEach(p => {
      if (p.type) types.add(p.type);
    });
    return Array.from(types);
  }, [products]);

  const filteredCatalogProducts = useMemo(() => {
    return products.filter(p => {
      if (multiProductTypeFilter !== 'ALL' && p.type !== multiProductTypeFilter) return false;
      if (!multiProductSearch.trim()) return true;
      const q = multiProductSearch.toLowerCase().trim();
      const qParts = q.split(/\s+/).filter(Boolean);
      const fullStr = `${p.name || ''} ${p.sku || ''} ${p.size || ''} ${p.type || ''} ${p.capacity || ''} ${p.variantDetails || ''}`.toLowerCase();
      return qParts.every(part => fullStr.includes(part));
    });
  }, [products, multiProductTypeFilter, multiProductSearch]);

  // Fetch Existing Report if Editing
  const fetchReport = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await backendFetch(`${baseApiUrl}/${id}`, { cacheTtlMs: 0 });
      if (data) {
        setCurrentReportId(data.id);
        setReportNo(data.reportNo);
        setReportDate(data.reportDate ? data.reportDate.split('T')[0] : todayStr);
        setShift(data.shift || 'Morning');
        setSupervisorName(data.supervisorName || '');
        setStatus(data.status || 'DRAFT');
        setLastUpdated(data.updatedAt);
        setApprovedBy(data.approvedBy?.name || null);

        if (Array.isArray(data.items) && data.items.length > 0) {
          const loadedRows = data.items.map((item, idx) => ({
            id: item.id || `row-${idx + 1}`,
            productId: item.productId,
            customProductName: item.customProductName || '',
            size: item.size || item.product?.size || '',
            type: item.type || item.product?.type || '',
            capacity: item.capacity || item.product?.capacity || '',
            coverQty: item.coverQty || 0,
            coverUnitWeight: Number(item.coverUnitWeight || item.product?.coverUnitWeight || 0),
            coverWeight: Number(item.coverWeight || 0),
            actualCoverWeight: item.actualCoverWeight !== null && item.actualCoverWeight !== undefined ? String(item.actualCoverWeight) : '',
            frameQty: item.frameQty || 0,
            frameUnitWeight: Number(item.frameUnitWeight || item.product?.frameUnitWeight || 0),
            frameWeight: Number(item.frameWeight || 0),
            actualFrameWeight: item.actualFrameWeight !== null && item.actualFrameWeight !== undefined ? String(item.actualFrameWeight) : '',
            weightOverrideReason: item.weightOverrideReason || '',
            setQty: item.setQty || 0,
            totalWeight: Number(item.totalWeight || 0),
            coversPerSet: item.product?.coversPerSet || 1,
            framesPerSet: item.product?.framesPerSet || 1,
            remarks: item.remarks || ''
          }));
          setRows(loadedRows);
        }
      }
    } catch (err) {
      console.error('[DailyReport] Failed to load report details:', err);
      Swal.fire({
        icon: 'error',
        title: 'Report Load Failed',
        text: err.message || 'Unable to load report details'
      });
    } finally {
      setLoading(false);
    }
  }, [baseApiUrl, todayStr]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const editId = reportId || searchParams?.get('edit') || searchParams?.get('id');
    if (editId) {
      fetchReport(editId);
    }
  }, [reportId, searchParams, fetchReport]);

  // Recalculate Row Values
  const calculateRowValues = (row) => {
    const coverQty = Math.max(0, parseInt(row.coverQty) || 0);
    const frameQty = Math.max(0, parseInt(row.frameQty) || 0);
    const coverUnitWeight = Number(row.coverUnitWeight) || 0;
    const frameUnitWeight = Number(row.frameUnitWeight) || 0;

    const calcCoverWeight = coverQty * coverUnitWeight;
    const calcFrameWeight = frameQty * frameUnitWeight;

    let coverWeight = calcCoverWeight;
    if (row.actualCoverWeight !== '' && row.actualCoverWeight !== null && !isNaN(Number(row.actualCoverWeight))) {
      coverWeight = Number(row.actualCoverWeight);
    } else if (row.isCoverWeightCustom && row.coverWeight !== '' && !isNaN(Number(row.coverWeight))) {
      coverWeight = Number(row.coverWeight);
    }

    let frameWeight = calcFrameWeight;
    if (row.actualFrameWeight !== '' && row.actualFrameWeight !== null && !isNaN(Number(row.actualFrameWeight))) {
      frameWeight = Number(row.actualFrameWeight);
    } else if (row.isFrameWeightCustom && row.frameWeight !== '' && !isNaN(Number(row.frameWeight))) {
      frameWeight = Number(row.frameWeight);
    }

    const totalWeight = coverWeight + frameWeight;

    const coversPerSet = Math.max(1, parseInt(row.coversPerSet) || 1);
    const framesPerSet = row.framesPerSet !== undefined && row.framesPerSet !== null ? parseInt(row.framesPerSet) : 1;

    let calculatedSets = Math.floor(coverQty / coversPerSet);
    if (framesPerSet > 0) {
      const setsFromFrames = Math.floor(frameQty / framesPerSet);
      calculatedSets = Math.min(calculatedSets, setsFromFrames);
    }

    const setQty = row.isSetQtyCustom ? (parseInt(row.setQty) || 0) : calculatedSets;
    const extraCoverQty = Math.max(0, coverQty - (setQty * coversPerSet));
    const extraFrameQty = Math.max(0, frameQty - (setQty * (framesPerSet > 0 ? framesPerSet : 0)));

    return {
      ...row,
      coverQty,
      frameQty,
      coverWeight: Math.round(coverWeight * 100) / 100,
      frameWeight: Math.round(frameWeight * 100) / 100,
      totalWeight: Math.round(totalWeight * 100) / 100,
      setQty,
      extraCoverQty,
      extraFrameQty
    };
  };


  // Product Selection Change
  const handleProductSelect = (rowIndex, selectedProd) => {
    setRows(prevRows => {
      const updated = [...prevRows];
      const curRow = updated[rowIndex];
      if (!selectedProd) {
        updated[rowIndex] = { ...curRow, productId: '', size: '', type: '', capacity: '', coverUnitWeight: 0, frameUnitWeight: 0 };
        return updated;
      }

      const specs = parseProductSpecs(selectedProd.name || '');
      const size = selectedProd.size || selectedProd.variantDetails || specs.size || curRow.size || '';
      const type = selectedProd.type || selectedProd.brand || specs.type || curRow.type || '';
      const capacity = selectedProd.capacity || specs.capacity || curRow.capacity || '';
      const coverUnitWeight = Number(selectedProd.coverUnitWeight || selectedProd.weight || 0);
      const frameUnitWeight = Number(selectedProd.frameUnitWeight || 0);
      const coversPerSet = selectedProd.coversPerSet || 1;
      const framesPerSet = selectedProd.framesPerSet || 1;

      const newRow = calculateRowValues({
        ...curRow,
        productId: selectedProd.id,
        size,
        type,
        capacity,
        coverUnitWeight,
        frameUnitWeight,
        coversPerSet,
        framesPerSet
      });

      updated[rowIndex] = newRow;
      return updated;
    });
  };

  // Direct Edit of Cover Weight
  const handleCoverWeightChange = (rowIndex, value) => {
    setRows(prevRows => {
      const updated = [...prevRows];
      const curRow = updated[rowIndex];
      const isCustom = value !== '';
      const numVal = isCustom ? Number(value) : '';
      const coverWeight = isCustom ? (isNaN(numVal) ? 0 : numVal) : 0;
      const actualCoverWeight = isCustom ? coverWeight : null;

      const newRow = calculateRowValues({
        ...curRow,
        coverWeight,
        actualCoverWeight,
        isCoverWeightCustom: isCustom
      });
      updated[rowIndex] = newRow;
      return updated;
    });
  };

  // Direct Edit of Frame Weight
  const handleFrameWeightChange = (rowIndex, value) => {
    setRows(prevRows => {
      const updated = [...prevRows];
      const curRow = updated[rowIndex];
      const isCustom = value !== '';
      const numVal = isCustom ? Number(value) : '';
      const frameWeight = isCustom ? (isNaN(numVal) ? 0 : numVal) : 0;
      const actualFrameWeight = isCustom ? frameWeight : null;

      const newRow = calculateRowValues({
        ...curRow,
        frameWeight,
        actualFrameWeight,
        isFrameWeightCustom: isCustom
      });
      updated[rowIndex] = newRow;
      return updated;
    });
  };

  // Direct Edit of Set Qty (Override Auto-Calculation)
  const handleSetQtyChange = (rowIndex, value) => {
    setRows(prevRows => {
      const updated = [...prevRows];
      const curRow = updated[rowIndex];
      const isCustom = value !== '';
      const numVal = isCustom ? Math.max(0, parseInt(value) || 0) : 0;
      updated[rowIndex] = {
        ...curRow,
        setQty: numVal,
        isSetQtyCustom: isCustom
      };
      return updated;
    });
  };

  // Field Change Handler
  const handleFieldChange = (rowIndex, field, value) => {
    setRows(prevRows => {
      const updated = [...prevRows];
      const curRow = { ...updated[rowIndex], [field]: value };
      updated[rowIndex] = calculateRowValues(curRow);
      return updated;
    });
  };

  // Add Production Row
  const handleAddRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        productId: '',
        size: '',
        type: '',
        capacity: '',
        coverQty: 0,
        coverUnitWeight: 0,
        coverWeight: 0,
        actualCoverWeight: '',
        frameQty: 0,
        frameUnitWeight: 0,
        frameWeight: 0,
        actualFrameWeight: '',
        weightOverrideReason: '',
        setQty: 0,
        extraCoverQty: 0,
        extraFrameQty: 0,
        totalWeight: 0,
        coversPerSet: 1,
        framesPerSet: 1,
        remarks: ''
      }
    ]);
  };

  // Duplicate Row
  const handleDuplicateRow = (index) => {
    const targetRow = rows[index];
    const duplicated = {
      ...targetRow,
      id: `row-${Date.now()}`
    };
    setRows(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, duplicated);
      return copy;
    });
  };

  // Delete Row
  const handleDeleteRow = (index) => {
    if (rows.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Minimum 1 Row Required',
        text: 'Production report must contain at least one production entry.'
      });
      return;
    }
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  // Open Override Modal
  const openOverrideModal = (index) => {
    const r = rows[index];
    setOverrideForm({
      actualCoverWeight: r.actualCoverWeight,
      actualFrameWeight: r.actualFrameWeight,
      reason: r.weightOverrideReason || ''
    });
    setOverrideModalRowIndex(index);
  };

  // Apply Override Weight
  const applyWeightOverride = () => {
    if (overrideModalRowIndex === null) return;
    setRows(prev => {
      const copy = [...prev];
      const r = copy[overrideModalRowIndex];
      const updated = calculateRowValues({
        ...r,
        actualCoverWeight: overrideForm.actualCoverWeight,
        actualFrameWeight: overrideForm.actualFrameWeight,
        weightOverrideReason: overrideForm.reason
      });
      copy[overrideModalRowIndex] = updated;
      return copy;
    });
    setOverrideModalRowIndex(null);
  };

  // Keyboard Navigation: Ctrl+Enter adds row
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAddRow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Summary Totals Calculation
  const totals = useMemo(() => {
    let totalCovers = 0;
    let totalFrames = 0;
    let totalSets = 0;
    let totalCoverWeight = 0;
    let totalFrameWeight = 0;
    let totalWeight = 0;
    const productTypesSet = new Set();

    rows.forEach(r => {
      totalCovers += Number(r.coverQty || 0);
      totalFrames += Number(r.frameQty || 0);
      totalSets += Number(r.setQty || 0);
      totalCoverWeight += Number(r.coverWeight || 0);
      totalFrameWeight += Number(r.frameWeight || 0);
      totalWeight += Number(r.totalWeight || 0);
      if (r.type) productTypesSet.add(r.type);
    });

    return {
      totalCovers,
      totalFrames,
      totalSets,
      totalCoverWeight: Math.round(totalCoverWeight * 100) / 100,
      totalFrameWeight: Math.round(totalFrameWeight * 100) / 100,
      totalWeight: Math.round(totalWeight * 100) / 100,
      totalWeightMT: (totalWeight / 1000).toFixed(2),
      uniqueTypesCount: productTypesSet.size,
      totalRows: rows.length
    };
  }, [rows]);

  // Check Duplicate Warning on Date/Shift change
  // checkDuplicateReport moved to top using useCallback

  // Save Draft
  const handleSaveDraft = async () => {
    const validItems = rows.filter(r => r.productId);
    if (validItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Product Selected',
        text: 'Please select a catalog product for at least one production row.'
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        reportDate,
        shift,
        supervisorName,
        dispatchExecutive: supervisorName,
        items: rows.map((r, idx) => ({
          srNo: idx + 1,
          productId: r.productId || undefined,
          size: r.size || undefined,
          type: r.type || undefined,
          capacity: r.capacity || undefined,
          coverQty: Number(r.coverQty || 0),
          coverUnitWeight: Number(r.coverUnitWeight || 0),
          actualCoverWeight: (r.actualCoverWeight !== '' && r.actualCoverWeight !== null && !isNaN(Number(r.actualCoverWeight))) ? Number(r.actualCoverWeight) : undefined,
          frameQty: Number(r.frameQty || 0),
          frameUnitWeight: Number(r.frameUnitWeight || 0),
          actualFrameWeight: (r.actualFrameWeight !== '' && r.actualFrameWeight !== null && !isNaN(Number(r.actualFrameWeight))) ? Number(r.actualFrameWeight) : undefined,
          weightOverrideReason: r.weightOverrideReason || undefined,
          setQty: Number(r.setQty || 0),
          remarks: r.remarks || undefined
        }))
      };

      let response;
      if (currentReportId) {
        response = await backendFetch(`${baseApiUrl}/${currentReportId}`, {
          method: 'PATCH',
          body: payload
        });
      } else {
        response = await backendFetch(baseApiUrl, {
          method: 'POST',
          body: payload
        });
      }

      if (response) {
        setCurrentReportId(response.id);
        setReportNo(response.reportNo);
        setStatus(response.status || 'DRAFT');
        setLastUpdated(response.updatedAt);

        // Invalidate finished goods cache
        queryClient.invalidateQueries({ queryKey: ["finished-goods-all-stock"] });
        queryClient.invalidateQueries({ queryKey: ["finished-goods"] });

        Swal.fire({
          icon: 'success',
          title: 'Draft Saved',
          text: `Daily Production Report ${response.reportNo} saved successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error('[DailyReport] Save Draft Error:', err);
      const isConflict = err.status === 409 ||
        err.message?.includes('409') ||
        err.message?.toLowerCase().includes('already exists') ||
        err.message?.toLowerCase().includes('conflict');
      if (isConflict) {
        try {
          const check = await backendFetch(`${baseApiUrl}/check-duplicate?date=${reportDate}&shift=${shift}`, { cacheTtlMs: 0 });
          if (check?.exists && check?.report?.id) {
            const result = await Swal.fire({
              icon: 'warning',
              title: 'Report Already Exists',
              text: `A production report (${check.report.reportNo}) already exists for ${reportDate} [${shift} shift] with status '${check.report.status}'. Would you like to load this report?`,
              showCancelButton: true,
              confirmButtonText: 'Yes, Load Existing Report',
              cancelButtonText: 'Cancel'
            });
            if (result.isConfirmed) {
              fetchReport(check.report.id);
            }
            return;
          }
        } catch (checkErr) {
          console.error('Failed to resolve conflict:', checkErr);
        }
      }
      Swal.fire({
        icon: 'error',
        title: 'Save Draft Failed',
        text: err.message || 'Unable to save draft'
      });
    } finally {
      setSaving(false);
    }
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (submitting || saving) return;
    const validItems = rows.filter(r => r.productId);
    if (validItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: `Please select a catalog product for at least one ${isDispatch ? 'dispatch' : 'production'} row.`
      });
      return;
    }

    const invalidQty = rows.some(r => r.coverQty < 0 || r.frameQty < 0 || r.totalWeight < 0);
    if (invalidQty) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Quantities and weights cannot be negative.'
      });
      return;
    }

    const confirm = await Swal.fire({
      title: isDispatch ? 'Submit Daily Dispatch Report?' : 'Submit Daily Production Report?',
      text: isDispatch
        ? 'After submission, report entries will be locked and finished goods stock will be deducted.'
        : 'After submission, report entries will be locked and finished goods stock will be updated.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit Report',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
      setSubmitting(true);
      let targetId = currentReportId;
      const payload = {
        reportDate,
        shift,
        supervisorName,
        dispatchExecutive: supervisorName,
        items: rows.map((r, idx) => ({
          srNo: idx + 1,
          productId: r.productId || undefined,
          size: r.size || undefined,
          type: r.type || undefined,
          capacity: r.capacity || undefined,
          coverQty: Number(r.coverQty || 0),
          coverUnitWeight: Number(r.coverUnitWeight || 0),
          actualCoverWeight: (r.actualCoverWeight !== '' && r.actualCoverWeight !== null && !isNaN(Number(r.actualCoverWeight))) ? Number(r.actualCoverWeight) : undefined,
          frameQty: Number(r.frameQty || 0),
          frameUnitWeight: Number(r.frameUnitWeight || 0),
          actualFrameWeight: (r.actualFrameWeight !== '' && r.actualFrameWeight !== null && !isNaN(Number(r.actualFrameWeight))) ? Number(r.actualFrameWeight) : undefined,
          weightOverrideReason: r.weightOverrideReason || undefined,
          setQty: Number(r.setQty || 0),
          remarks: r.remarks || undefined
        }))
      };

      if (!targetId) {
        const saved = await backendFetch(baseApiUrl, {
          method: 'POST',
          body: payload
        });
        targetId = saved.id;
        setCurrentReportId(saved.id);
        setReportNo(saved.reportNo);
      } else {
        await backendFetch(`${baseApiUrl}/${targetId}`, {
          method: 'PATCH',
          body: payload
        });
      }

      const submitted = await backendFetch(`${baseApiUrl}/${targetId}/submit`, {
        method: 'POST'
      });

      if (submitted) {
        setStatus(submitted.status);
        setLastUpdated(submitted.updatedAt);

        // Invalidate finished goods and daily report caches
        queryClient.invalidateQueries({ queryKey: ["finished-goods-all-stock"] });
        queryClient.invalidateQueries({ queryKey: ["finished-goods"] });
        queryClient.invalidateQueries({ queryKey: ["finished-goods-dispatch-history"] });
        queryClient.invalidateQueries({ queryKey: ["dispatch-daily-reports"] });
        queryClient.invalidateQueries({ queryKey: ["production-daily-reports"] });

        Swal.fire({
          icon: 'success',
          title: 'Report Submitted',
          text: isDispatch
            ? `Daily Dispatch Report ${submitted.reportNo} submitted successfully! Finished goods stock has been deducted.`
            : `Daily Production Report ${submitted.reportNo} submitted successfully!`
        });
      }
    } catch (err) {
      console.error('[DailyReport] Submit Error:', err);
      const isConflict = err.status === 409 ||
        err.message?.includes('409') ||
        err.message?.toLowerCase().includes('already exists') ||
        err.message?.toLowerCase().includes('conflict');
      if (isConflict) {
        try {
          const check = await backendFetch(`${baseApiUrl}/check-duplicate?date=${reportDate}&shift=${shift}`, { cacheTtlMs: 0 });
          if (check?.exists && check?.report?.id) {
            const result = await Swal.fire({
              icon: 'warning',
              title: 'Report Already Exists',
              text: `A ${isDispatch ? 'dispatch' : 'production'} report (${check.report.reportNo}) already exists for ${reportDate} [${shift} shift] with status '${check.report.status}'. Would you like to load and view/edit this report?`,
              showCancelButton: true,
              confirmButtonText: 'Yes, Load Existing Report',
              cancelButtonText: 'Cancel'
            });
            if (result.isConfirmed) {
              fetchReport(check.report.id);
            }
            return;
          }
        } catch (checkErr) {
          console.error('Failed to resolve conflict:', checkErr);
        }
      }
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || 'Unable to submit report'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopenReport = async () => {
    if (!currentReportId) return;
    const confirm = await Swal.fire({
      title: isDispatch ? 'Reopen Daily Dispatch Report?' : 'Reopen Daily Production Report?',
      text: isDispatch
        ? 'This will reverse the deducted finished goods stock back into inventory and return the report to REOPENED for editing.'
        : 'This will reverse the finished goods stock posted from this report in the inventory ledger and return the report to REOPENED so it can be edited.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Reopen Report',
      cancelButtonText: 'Cancel'
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      const res = await backendFetch(`${baseApiUrl}/${currentReportId}/reopen`, {
        method: 'POST'
      });
      if (res) {
        setStatus(res.status);
        setLastUpdated(res.updatedAt);
        queryClient.invalidateQueries({ queryKey: ["finished-goods-all-stock"] });
        queryClient.invalidateQueries({ queryKey: ["finished-goods"] });
        queryClient.invalidateQueries({ queryKey: ["finished-goods-dispatch-history"] });
        queryClient.invalidateQueries({ queryKey: ["dispatch-daily-reports"] });
        queryClient.invalidateQueries({ queryKey: ["production-daily-reports"] });
        Swal.fire({
          icon: 'success',
          title: 'Report Reopened',
          text: isDispatch
            ? `Daily Dispatch Report ${res.reportNo} is now reopened for editing. Deducted stock has been restored.`
            : `Daily Report ${res.reportNo} is now reopened for editing. Posted production stock has been reversed.`
        });
      }
    } catch (err) {
      console.error('[DailyReport] Reopen Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Reopen Failed',
        text: err.message || 'Unable to reopen report'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReport = async () => {
    if (!currentReportId) return;
    const confirm = await Swal.fire({
      title: isDispatch ? 'Cancel Daily Dispatch Report?' : 'Cancel Daily Production Report?',
      text: isDispatch
        ? 'This will reverse the deducted finished goods stock back into inventory and mark the report as CANCELLED.'
        : 'This will reverse the finished goods stock posted from this report in the inventory ledger and mark the report as CANCELLED.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Cancel Report',
      cancelButtonText: 'No, Keep Report'
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      const res = await backendFetch(`${baseApiUrl}/${currentReportId}/cancel`, {
        method: 'POST'
      });
      if (res) {
        setStatus(res.status);
        setLastUpdated(res.updatedAt);
        queryClient.invalidateQueries({ queryKey: ["finished-goods-all-stock"] });
        queryClient.invalidateQueries({ queryKey: ["finished-goods"] });
        queryClient.invalidateQueries({ queryKey: ["finished-goods-dispatch-history"] });
        queryClient.invalidateQueries({ queryKey: ["dispatch-daily-reports"] });
        queryClient.invalidateQueries({ queryKey: ["production-daily-reports"] });
        Swal.fire({
          icon: 'success',
          title: 'Report Cancelled',
          text: `Daily Report ${res.reportNo} cancelled and stock reversed successfully.`
        });
      }
    } catch (err) {
      console.error('[DailyReport] Cancel Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Cancel Failed',
        text: err.message || 'Unable to cancel report'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewReport = () => {
    setCurrentReportId(null);
    setReportNo('Draft (Auto-generated on save)');
    setReportDate(todayStr);
    setShift('Morning');
    setSupervisorName('');
    setStatus('DRAFT');
    setLastUpdated(null);
    setApprovedBy(null);
    setRows([
      {
        id: `row-${Date.now()}`,
        productId: '',
        size: '',
        type: '',
        capacity: '',
        coverQty: 0,
        coverUnitWeight: 0,
        coverWeight: 0,
        actualCoverWeight: '',
        frameQty: 0,
        frameUnitWeight: 0,
        frameWeight: 0,
        actualFrameWeight: '',
        weightOverrideReason: '',
        setQty: 0,
        totalWeight: 0,
        coversPerSet: 1,
        framesPerSet: 1,
        remarks: ''
      }
    ]);
    const targetPath = isDispatch
      ? (dispatchType === 'DISPATCH_1' ? '/dispatch/daily-report' : '/dispatch-2/daily-report')
      : '/production/daily-report';
    router.replace(targetPath);
  };

  const handleAddMultipleProducts = (selectedList) => {
    if (!selectedList || selectedList.length === 0) return;

    setRows(prevRows => {
      let nextRows = [...prevRows];
      const isFirstRowBlank = nextRows.length === 1 && !nextRows[0].productId;
      let startIdx = 0;

      if (isFirstRowBlank) {
        const firstProd = selectedList[0];
        const coverUnitWeight = Number(firstProd.coverUnitWeight || firstProd.weight || 0);
        const frameUnitWeight = Number(firstProd.frameUnitWeight || 0);
        const coversPerSet = firstProd.coversPerSet || 1;
        const framesPerSet = firstProd.framesPerSet || 1;

        nextRows[0] = calculateRowValues({
          ...nextRows[0],
          productId: firstProd.id,
          size: firstProd.size || firstProd.variantDetails || '',
          type: firstProd.type || firstProd.brand || '',
          capacity: firstProd.capacity || '',
          coverUnitWeight,
          frameUnitWeight,
          coversPerSet,
          framesPerSet
        });
        startIdx = 1;
      }

      for (let i = startIdx; i < selectedList.length; i++) {
        const prod = selectedList[i];
        const coverUnitWeight = Number(prod.coverUnitWeight || prod.weight || 0);
        const frameUnitWeight = Number(prod.frameUnitWeight || 0);
        const coversPerSet = prod.coversPerSet || 1;
        const framesPerSet = prod.framesPerSet || 1;

        const newRow = calculateRowValues({
          id: `row-${Date.now()}-${i}`,
          productId: prod.id,
          size: prod.size || prod.variantDetails || '',
          type: prod.type || prod.brand || '',
          capacity: prod.capacity || '',
          coverQty: 0,
          coverUnitWeight,
          coverWeight: 0,
          actualCoverWeight: '',
          frameQty: 0,
          frameUnitWeight,
          frameWeight: 0,
          actualFrameWeight: '',
          weightOverrideReason: '',
          setQty: 0,
          totalWeight: 0,
          coversPerSet,
          framesPerSet,
          remarks: ''
        });
        nextRows.push(newRow);
      }

      return nextRows;
    });

    setShowMultiProductModal(false);
    setSelectedMultiProductIds([]);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Added ${selectedList.length} product${selectedList.length > 1 ? 's' : ''} to entries`,
      showConfirmButton: false,
      timer: 2000
    });
  };

  // Status Badge Rendering
  const renderStatusBadge = (st) => {
    let bg = 'rgba(100, 116, 139, 0.1)';
    let color = '#475569';
    let icon = <Clock size={12} />;

    if (st === 'DRAFT') {
      bg = 'rgba(245, 158, 11, 0.1)';
      color = '#d97706';
      icon = <Clock size={12} />;
    } else if (st === 'SUBMITTED') {
      bg = 'rgba(59, 130, 246, 0.1)';
      color = '#2563eb';
      icon = <Send size={12} />;
    } else if (st === 'APPROVED') {
      bg = 'rgba(16, 185, 129, 0.1)';
      color = '#059669';
      icon = <CheckCircle size={12} />;
    } else if (st === 'REOPENED') {
      bg = 'rgba(239, 68, 68, 0.1)';
      color = '#dc2626';
      icon = <RefreshCw size={12} />;
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '20px',
        background: bg,
        color: color,
        fontWeight: '800',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {icon} {st}
      </span>
    );
  };

  const isReadOnly = status === 'SUBMITTED' || status === 'APPROVED' || status === 'CANCELLED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>

      {/* HEADER BAR */}
      <div className="daily-report-header" style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div className="daily-report-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)', margin: 0 }}>
              {title || (isDispatch ? 'Industrial FRP Dispatch Report' : 'Industrial FRP Production Report')}
            </h1>
            {renderStatusBadge(status)}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            {subtitle || (isDispatch ? 'Digital daily entry sheet for Dispatch FRP Covers, Frames, Weights & Complete Sets.' : 'Digital daily entry sheet for FRP Covers, Frames, Weights & Complete Sets.')}
          </p>
        </div>

        <div className="daily-report-header-top-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onNavigateToHistory}
            className="daily-report-header-btn-history"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <History size={16} /> History Log
          </button>

          {currentReportId && (
            <button
              type="button"
              onClick={() => onNavigateToPrint(currentReportId)}
              className="daily-report-header-btn-print"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-subtle)',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Printer size={16} /> Print / Export PDF
            </button>
          )}
        </div>

        <div className="daily-report-header-main-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Always available "+ New Report" button */}
          <button
            type="button"
            onClick={handleNewReport}
            title="Create a fresh daily report"
            className="daily-report-header-btn-new"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '10px',
              border: '1.5px solid #2F4375',
              background: currentReportId ? '#2F4375' : '#ffffff',
              color: currentReportId ? '#ffffff' : '#2F4375',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: currentReportId ? '0 4px 10px rgba(47, 67, 117, 0.2)' : 'none'
            }}
          >
            <Plus size={16} /> New Report
          </button>

          {isReadOnly && (
            <>
              {(status === 'SUBMITTED' || status === 'APPROVED') && (
                <button
                  type="button"
                  onClick={handleReopenReport}
                  disabled={loading}
                  className="daily-report-header-btn-reopen"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <RefreshCw size={16} /> Reopen Report
                </button>
              )}

              {(status === 'SUBMITTED' || status === 'APPROVED') && (
                <button
                  type="button"
                  onClick={handleCancelReport}
                  disabled={loading}
                  className="daily-report-header-btn-cancel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <X size={16} /> Cancel Report
                </button>
              )}
            </>
          )}

          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving || submitting}
                className="daily-report-header-btn-save"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: '1px solid #D6E2F0',
                  background: '#ffffff',
                  color: '#24345C',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={saving || submitting}
                className="daily-report-header-btn-submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}
              >
                <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Daily Report'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* METADATA FIELDS BAR */}
      <div className="daily-report-metadata-bar" style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Report Date *
          </label>
          <input
            type="date"
            value={reportDate}
            disabled={isReadOnly}
            onChange={(e) => {
              setReportDate(e.target.value);
            }}
            className="form-input"
            style={{ width: '100%', margin: 0, fontWeight: '700', fontSize: '13.5px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Shift *
          </label>
          <select
            value={shift}
            disabled={isReadOnly}
            onChange={(e) => {
              setShift(e.target.value);
            }}
            className="form-select"
            style={{ width: '100%', margin: 0, fontWeight: '700', fontSize: '13.5px' }}
          >
            <option value="Morning">Morning Shift</option>
            <option value="Night">Night Shift</option>
            <option value="General">General Shift</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
            {isDispatch ? 'Dispatch Executive' : 'Production Supervisor'}
          </label>
          <input
            type="text"
            placeholder="e.g. Ravi Sharma"
            value={supervisorName}
            disabled={isReadOnly}
            onChange={(e) => setSupervisorName(e.target.value)}
            className="form-input"
            style={{ width: '100%', margin: 0, fontWeight: '600', fontSize: '13.5px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
            {isDispatch ? 'Dispatch User' : 'Production User'}
          </label>
          <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-primary)', padding: '8px 12px', background: 'var(--color-bg-subtle)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            {user?.name || 'Operator'}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Report Number
          </label>
          <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'monospace', padding: '8px 12px', background: 'rgba(47, 67, 117, 0.05)', borderRadius: '8px', border: '1px solid rgba(47, 67, 117, 0.15)' }}>
            {reportNo}
          </div>
        </div>
      </div>

      {/* DYNAMIC DAILY SUMMARY CARDS */}
      <div className="daily-report-summary-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Total Covers */}
        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Total Covers</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{totals.totalCovers.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Produced Cover Qty</div>
          </div>
        </div>

        {/* Card 2: Total Frames */}
        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Boxes size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Total Frames</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{totals.totalFrames.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Produced Frame Qty</div>
          </div>
        </div>

        {/* Card 3: Complete Sets */}
        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Complete Sets</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#059669' }}>{totals.totalSets.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Cover + Frame Sets</div>
          </div>
        </div>

        {/* Card 4: Total Weight */}
        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{isDispatch ? 'Dispatch Weight' : 'Production Weight'}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#7c3aed' }}>
              {totals.totalWeight.toLocaleString()} KG
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#6d28d9' }}>
              {totals.totalWeightMT} MT
            </div>
          </div>
        </div>
      </div>

      {/* MAIN PRODUCTION TABLE */}
      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-soft)',
        overflow: 'hidden'
      }}>
        <div className="daily-report-table-header" style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(248, 250, 252, 0.6)',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
              {isDispatch ? 'Dispatch Entries' : 'Production Entries'}
            </h2>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>
              {rows.length} {rows.length === 1 ? 'Row' : 'Rows'}
            </span>
          </div>

          <div className="daily-report-table-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {!isReadOnly && (
              <>
                <button
                  type="button"
                  onClick={() => setShowMultiProductModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #3b82f6',
                    background: 'rgba(59, 130, 246, 0.08)',
                    color: '#2563eb',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  <Boxes size={15} /> + Add Multiple Products
                </button>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="daily-report-btn-add-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #2F4375',
                    background: '#2F4375',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={15} /> + Add Row
                </button>
              </>
            )}
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
              Press <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '1px 5px', borderRadius: '4px' }}>Ctrl + Enter</kbd> to add row
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="daily-report-table responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 14px', textAlign: 'center', width: '50px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Sr</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', minWidth: '220px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Product *</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', width: '120px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Size</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', width: '90px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', width: '90px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Capacity</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: '90px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Cover</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: '120px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Cover Wt (kg)</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: '90px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Frame</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: '120px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Frame Wt (kg)</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: '120px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Total Wt (kg)</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: '80px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Set</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: '100px', fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>Extra Cover</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: '100px', fontSize: '11px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase' }}>Extra Frame</th>
                {!isReadOnly && <th style={{ padding: '12px 14px', textAlign: 'center', width: '80px', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                  }}
                >
                  {/* Sr No */}
                  <td data-label="SR" style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </td>

                  {/* Product Smart Combobox */}
                  <td data-label="PRODUCT *" style={{ padding: '10px 14px' }}>
                    <SmartProductCombobox
                      value={row.productId}
                      disabled={isReadOnly}
                      products={products}
                      onChange={(selectedProd) => handleProductSelect(index, selectedProd)}
                    />
                  </td>

                  {/* Size */}
                  <td data-label="SIZE" style={{ padding: '10px 14px' }}>
                    <input
                      type="text"
                      value={row.size}
                      disabled={isReadOnly}
                      placeholder="e.g. 600 x 600"
                      onChange={(e) => handleFieldChange(index, 'size', e.target.value)}
                      className="form-input"
                      style={{ width: '100%', margin: 0, fontSize: '12.5px', fontWeight: '600' }}
                    />
                  </td>

                  {/* Type */}
                  <td data-label="TYPE" style={{ padding: '10px 14px' }}>
                    <input
                      type="text"
                      value={row.type}
                      disabled={isReadOnly}
                      placeholder="MHC / WGC"
                      onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                      className="form-input"
                      style={{ width: '100%', margin: 0, fontSize: '12.5px', fontWeight: '600' }}
                    />
                  </td>

                  {/* Capacity */}
                  <td data-label="CAPACITY" style={{ padding: '10px 14px' }}>
                    <input
                      type="text"
                      value={row.capacity}
                      disabled={isReadOnly}
                      placeholder="B125 / C250"
                      onChange={(e) => handleFieldChange(index, 'capacity', e.target.value)}
                      className="form-input"
                      style={{ width: '100%', margin: 0, fontSize: '12.5px', fontWeight: '600' }}
                    />
                  </td>

                  {/* Cover Qty */}
                  <td data-label="COVER" style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.coverQty}
                      disabled={isReadOnly}
                      onChange={(e) => handleFieldChange(index, 'coverQty', e.target.value)}
                      className="form-input"
                      style={{ width: '100%', margin: 0, textAlign: 'right', fontWeight: '800', fontSize: '13px', color: '#1e293b' }}
                    />
                  </td>

                  {/* Cover Weight */}
                  <td data-label="COVER WT (KG)" style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={row.coverWeight}
                      disabled={isReadOnly}
                      placeholder="0"
                      onChange={(e) => handleCoverWeightChange(index, e.target.value)}
                      className="form-input"
                      style={{
                        width: '100%',
                        margin: 0,
                        textAlign: 'right',
                        fontWeight: '800',
                        fontSize: '13px',
                        color: row.isCoverWeightCustom || row.actualCoverWeight ? '#d97706' : '#1e293b',
                        background: row.isCoverWeightCustom || row.actualCoverWeight ? 'rgba(245, 158, 11, 0.06)' : '#ffffff',
                        borderColor: row.isCoverWeightCustom || row.actualCoverWeight ? 'rgba(245, 158, 11, 0.4)' : '#cbd5e1'
                      }}
                    />
                  </td>

                  {/* Frame Qty */}
                  <td data-label="FRAME" style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.frameQty}
                      disabled={isReadOnly}
                      onChange={(e) => handleFieldChange(index, 'frameQty', e.target.value)}
                      className="form-input"
                      style={{ width: '100%', margin: 0, textAlign: 'right', fontWeight: '800', fontSize: '13px', color: '#1e293b' }}
                    />
                  </td>

                  {/* Frame Weight */}
                  <td data-label="FRAME WT (KG)" style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={row.frameWeight}
                      disabled={isReadOnly}
                      placeholder="0"
                      onChange={(e) => handleFrameWeightChange(index, e.target.value)}
                      className="form-input"
                      style={{
                        width: '100%',
                        margin: 0,
                        textAlign: 'right',
                        fontWeight: '800',
                        fontSize: '13px',
                        color: row.isFrameWeightCustom || row.actualFrameWeight ? '#d97706' : '#1e293b',
                        background: row.isFrameWeightCustom || row.actualFrameWeight ? 'rgba(245, 158, 11, 0.06)' : '#ffffff',
                        borderColor: row.isFrameWeightCustom || row.actualFrameWeight ? 'rgba(245, 158, 11, 0.4)' : '#cbd5e1'
                      }}
                    />
                  </td>

                  {/* Total Weight */}
                  <td data-label="TOTAL WT (KG)" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '900', color: '#7c3aed' }}>
                    {row.totalWeight}
                  </td>

                  {/* Set Qty */}
                  <td data-label="SET" style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.setQty}
                      disabled={isReadOnly}
                      onChange={(e) => handleSetQtyChange(index, e.target.value)}
                      className="form-input"
                      style={{
                        width: '100%',
                        margin: 0,
                        textAlign: 'right',
                        fontWeight: '900',
                        fontSize: '13px',
                        color: '#059669',
                        background: 'rgba(16, 185, 129, 0.06)',
                        borderColor: 'rgba(16, 185, 129, 0.3)'
                      }}
                    />
                  </td>

                  {/* Extra Cover */}
                  <td data-label="EXTRA COVER" style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: '800',
                      fontSize: '12px',
                      background: Number(row.extraCoverQty || 0) > 0 ? 'rgba(37, 99, 235, 0.1)' : '#f8fafc',
                      color: Number(row.extraCoverQty || 0) > 0 ? '#2563eb' : '#94a3b8',
                      border: Number(row.extraCoverQty || 0) > 0 ? '1px solid #bfdbfe' : '1px solid #e2e8f0'
                    }}>
                      {Number(row.extraCoverQty || 0) > 0 ? `+${row.extraCoverQty}` : '0'}
                    </span>
                  </td>

                  {/* Extra Frame */}
                  <td data-label="EXTRA FRAME" style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: '800',
                      fontSize: '12px',
                      background: Number(row.extraFrameQty || 0) > 0 ? 'rgba(124, 58, 237, 0.1)' : '#f8fafc',
                      color: Number(row.extraFrameQty || 0) > 0 ? '#7c3aed' : '#94a3b8',
                      border: Number(row.extraFrameQty || 0) > 0 ? '1px solid #ddd6fe' : '1px solid #e2e8f0'
                    }}>
                      {Number(row.extraFrameQty || 0) > 0 ? `+${row.extraFrameQty}` : '0'}
                    </span>
                  </td>

                  {/* Actions */}
                  {!isReadOnly && (
                    <td data-label="ACTIONS" style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          title="Duplicate row"
                          onClick={() => handleDuplicateRow(index)}
                          style={{ background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: '6px', padding: '6px', color: '#2563eb', cursor: 'pointer' }}
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          title="Delete row"
                          onClick={() => handleDeleteRow(index)}
                          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '6px', color: '#dc2626', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADD ROW & MULTI-PRODUCT BUTTONS */}
        {!isReadOnly && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--color-border)', background: '#fafafa', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleAddRow}
              style={{
                flex: '1 1 200px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: '10px',
                border: '1.5px dashed #2F4375',
                background: 'rgba(47, 67, 117, 0.04)',
                color: '#2F4375',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                justifyContent: 'center'
              }}
            >
              <Plus size={16} /> {isDispatch ? 'Add Dispatch Row' : 'Add Production Row'}
            </button>

            <button
              type="button"
              onClick={() => setShowMultiProductModal(true)}
              style={{
                flex: '1 1 240px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: '10px',
                border: '1.5px solid #2563eb',
                background: '#eff6ff',
                color: '#2563eb',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                justifyContent: 'center'
              }}
            >
              <Boxes size={16} /> + Select Multiple Products from Catalog
            </button>
          </div>
        )}
      </div>

      {/* ADDITIONAL SUMMARY & BREAKDOWN */}
      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-soft)'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isDispatch ? 'Daily Dispatch Summary Breakdown' : 'Daily Production Summary Breakdown'}
        </h3>

        <div className="daily-report-breakdown-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Product Types</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{totals.uniqueTypesCount}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Total Rows</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{totals.totalRows}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Total Covers</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#2563eb' }}>{totals.totalCovers.toLocaleString()}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Total Frames</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#d97706' }}>{totals.totalFrames.toLocaleString()}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Total Sets</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#059669' }}>{totals.totalSets.toLocaleString()}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Cover Weight</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{totals.totalCoverWeight.toLocaleString()} kg</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Frame Weight</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{totals.totalFrameWeight.toLocaleString()} kg</div>
          </div>
          <div style={{ background: 'rgba(124, 58, 237, 0.06)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
            <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '800' }}>Total Weight</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#7c3aed' }}>{totals.totalWeight.toLocaleString()} kg ({totals.totalWeightMT} MT)</div>
          </div>
        </div>
      </div>

      {/* WEIGHT OVERRIDE MODAL */}
      {overrideModalRowIndex !== null && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                Measured Weight Override
              </h3>
              <button onClick={() => setOverrideModalRowIndex(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Actual Cover Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Leave empty to use calculated weight"
                  value={overrideForm.actualCoverWeight}
                  onChange={(e) => setOverrideForm(p => ({ ...p, actualCoverWeight: e.target.value }))}
                  className="form-input"
                  style={{ width: '100%', margin: 0 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Actual Frame Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Leave empty to use calculated weight"
                  value={overrideForm.actualFrameWeight}
                  onChange={(e) => setOverrideForm(p => ({ ...p, actualFrameWeight: e.target.value }))}
                  className="form-input"
                  style={{ width: '100%', margin: 0 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Override Reason
                </label>
                <textarea
                  placeholder="e.g. Shop floor weighing scale measurement difference"
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm(p => ({ ...p, reason: e.target.value }))}
                  rows={3}
                  className="form-input"
                  style={{ width: '100%', margin: 0, resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setOverrideModalRowIndex(null)}
                style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyWeightOverride}
                style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MULTI-PRODUCT SELECTION MODAL ── */}
      {showMultiProductModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '780px',
            maxHeight: '90vh',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Boxes size={20} style={{ color: '#2563eb' }} /> Select Products to Add to Report
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  Search and check multiple products from catalog to automatically insert their rows
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMultiProductModal(false);
                  setSelectedMultiProductIds([]);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Search by name, size (e.g. 300x300), type (MHC), capacity (B125)..."
                    value={multiProductSearch}
                    onChange={e => setMultiProductSearch(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {multiProductSearch && (
                    <button
                      type="button"
                      onClick={() => setMultiProductSearch('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8'
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>Type:</span>
                <button
                  type="button"
                  onClick={() => setMultiProductTypeFilter('ALL')}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: multiProductTypeFilter === 'ALL' ? '#2563eb' : '#e2e8f0',
                    background: multiProductTypeFilter === 'ALL' ? '#2563eb' : '#ffffff',
                    color: multiProductTypeFilter === 'ALL' ? '#ffffff' : '#475569',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  All ({products.length})
                </button>
                {productTypes.map(t => {
                  const count = products.filter(p => p.type === t).length;
                  const isSel = multiProductTypeFilter === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMultiProductTypeFilter(t)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: isSel ? '#2563eb' : '#e2e8f0',
                        background: isSel ? '#2563eb' : '#ffffff',
                        color: isSel ? '#ffffff' : '#475569',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {t} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Product List */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', padding: '12px 24px' }}>
              {filteredCatalogProducts.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No products matched your search "{multiProductSearch}".
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredCatalogProducts.map(prod => {
                    const isChecked = selectedMultiProductIds.includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setSelectedMultiProductIds(prev =>
                            prev.includes(prod.id)
                              ? prev.filter(id => id !== prod.id)
                              : [...prev, prod.id]
                          );
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid',
                          borderColor: isChecked ? '#3b82f6' : '#e2e8f0',
                          background: isChecked ? 'rgba(59, 130, 246, 0.05)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => { }}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{prod.name}</strong>
                            {prod.sku && (
                              <span style={{ fontSize: '11px', fontFamily: 'monospace', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                {prod.sku}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '11.5px', color: '#64748b', marginTop: '4px', flexWrap: 'wrap' }}>
                            {prod.size && <span style={{ background: '#f1f5f9', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', color: '#334155' }}>Size: {prod.size}</span>}
                            {prod.type && <span style={{ background: '#f1f5f9', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', color: '#334155' }}>Type: {prod.type}</span>}
                            {prod.capacity && <span style={{ background: '#f1f5f9', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', color: '#334155' }}>Cap: {prod.capacity}</span>}
                            <span style={{ color: '#475569', fontWeight: '700' }}>Cover Wt: {prod.coverUnitWeight || prod.weight || 0} kg</span>
                            <span style={{ color: '#475569', fontWeight: '700' }}>Frame Wt: {prod.frameUnitWeight || 0} kg</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    const allFilteredIds = filteredCatalogProducts.map(p => p.id);
                    setSelectedMultiProductIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                  }}
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                >
                  Select All Filtered ({filteredCatalogProducts.length})
                </button>
                {selectedMultiProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedMultiProductIds([])}
                    style={{ background: 'none', border: 'none', padding: '6px 10px', fontSize: '12px', fontWeight: '700', color: '#dc2626', cursor: 'pointer' }}
                  >
                    Clear ({selectedMultiProductIds.length})
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowMultiProductModal(false);
                    setSelectedMultiProductIds([]);
                  }}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedMultiProductIds.length === 0}
                  onClick={() => {
                    const selectedList = products.filter(p => selectedMultiProductIds.includes(p.id));
                    handleAddMultipleProducts(selectedList);
                  }}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedMultiProductIds.length === 0 ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: selectedMultiProductIds.length === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: selectedMultiProductIds.length > 0 ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
                  }}
                >
                  Add Selected ({selectedMultiProductIds.length}) Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
