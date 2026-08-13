'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

export default function DailyReportEntryView({ reportId, onNavigateToHistory, onNavigateToPrint }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];

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

  // Fetch Products Master
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await backendFetch('/api/backend/products');
      const productList = Array.isArray(res) ? res : res?.items || res?.data || [];
      setProducts(productList);
    } catch (err) {
      console.error('[DailyReport] Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch Existing Report if Editing
  const fetchReport = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await backendFetch(`/api/backend/production/daily-reports/${id}`);
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
            size: item.size || item.product?.size || '',
            type: item.type || item.product?.type || '',
            capacity: item.capacity || item.product?.capacity || '',
            coverQty: item.coverQty || 0,
            coverUnitWeight: Number(item.coverUnitWeight || item.product?.coverUnitWeight || 0),
            coverWeight: Number(item.coverWeight || 0),
            actualCoverWeight: item.actualCoverWeight !== null ? String(item.actualCoverWeight) : '',
            frameQty: item.frameQty || 0,
            frameUnitWeight: Number(item.frameUnitWeight || item.product?.frameUnitWeight || 0),
            frameWeight: Number(item.frameWeight || 0),
            actualFrameWeight: item.actualFrameWeight !== null ? String(item.actualFrameWeight) : '',
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
  }, [todayStr]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    }
  }, [reportId, fetchReport]);

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
    const framesPerSet = Math.max(1, parseInt(row.framesPerSet) || 1);

    const setsFromCovers = Math.floor(coverQty / coversPerSet);
    const setsFromFrames = frameQty > 0 ? Math.floor(frameQty / framesPerSet) : 0;
    const setQty = Math.min(setsFromCovers, setsFromFrames);

    return {
      ...row,
      coverQty,
      frameQty,
      coverWeight: Math.round(coverWeight * 100) / 100,
      frameWeight: Math.round(frameWeight * 100) / 100,
      totalWeight: Math.round(totalWeight * 100) / 100,
      setQty
    };
  };

function SmartProductCombobox({ value, customProductName, disabled, products, onChange, onCustomNameChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 360 });
  const inputRef = useRef(null);

  const updateCoords = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 360)
      });
    }
  }, []);

  useEffect(() => {
    if (value) {
      const p = products.find(prod => prod.id === value);
      if (p) setQuery(p.name);
    } else if (customProductName) {
      setQuery(customProductName);
    }
  }, [value, customProductName, products]);

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) && !e.target.closest('.smart-product-popover')) {
        setIsOpen(false);
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
  }, [isOpen, updateCoords]);

  const filtered = useMemo(() => {
    if (!query.trim()) return products.slice(0, 50);
    const q = query.toLowerCase().trim();
    return products.filter(p => (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.size && p.size.toLowerCase().includes(q)) ||
      (p.type && p.type.toLowerCase().includes(q)) ||
      (p.capacity && p.capacity.toLowerCase().includes(q))
    )).slice(0, 50);
  }, [products, query]);

  const handleSelectProduct = (prod) => {
    setQuery(prod.name);
    setIsOpen(false);
    onChange(prod);
  };

  const handleSelectCustom = () => {
    setIsOpen(false);
    onCustomNameChange(query);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          placeholder="Search product or type custom name..."
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
            if (!e.target.value.trim()) {
              onChange(null);
            }
          }}
          className="form-input"
          style={{
            width: '100%',
            margin: 0,
            fontSize: '13px',
            fontWeight: '700',
            color: '#0f172a',
            paddingRight: '28px',
            background: value ? 'rgba(59, 130, 246, 0.04)' : (customProductName ? 'rgba(245, 158, 11, 0.04)' : '#ffffff'),
            borderColor: value ? 'rgba(59, 130, 246, 0.4)' : (customProductName ? 'rgba(245, 158, 11, 0.4)' : '#cbd5e1')
          }}
        />
        {query && !disabled && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange(null);
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
              padding: 0
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && !disabled && typeof window !== 'undefined' && createPortal(
        <div
          className="smart-product-popover"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            maxHeight: '300px',
            overflowY: 'auto',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
            zIndex: 999999,
            padding: '6px'
          }}
        >
          {query.trim() && (
            <div
              onClick={handleSelectCustom}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#b45309',
                fontSize: '12.5px',
                fontWeight: '700',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                wordBreak: 'break-word'
              }}
            >
              <span>✍️ Use custom product name:</span>
              <strong style={{ color: '#0f172a' }}>"{query}"</strong>
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
              No catalog product matched "{query}". Click above to use custom name.
            </div>
          ) : (
            filtered.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  transition: 'background 0.15s',
                  borderBottom: '1px solid #f1f5f9'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{prod.name}</span>
                  {prod.sku && (
                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontFamily: 'monospace', fontSize: '11px', padding: '1px 6px', borderRadius: '4px' }}>
                      {prod.sku}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: '#64748b', flexWrap: 'wrap' }}>
                  {prod.size && <span style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', color: '#334155', fontWeight: '600' }}>Size: {prod.size}</span>}
                  {prod.type && <span style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', color: '#334155', fontWeight: '600' }}>Type: {prod.type}</span>}
                  {prod.capacity && <span style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', color: '#334155', fontWeight: '600' }}>Cap: {prod.capacity}</span>}
                </div>
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

  // Product Selection Change
  const handleProductSelect = (rowIndex, selectedProd) => {
    setRows(prevRows => {
      const updated = [...prevRows];
      const curRow = updated[rowIndex];
      if (!selectedProd) {
        updated[rowIndex] = { ...curRow, productId: '', customProductName: '' };
        return updated;
      }

      const coverUnitWeight = Number(selectedProd.coverUnitWeight || selectedProd.weight || 0);
      const frameUnitWeight = Number(selectedProd.frameUnitWeight || 0);
      const coversPerSet = selectedProd.coversPerSet || 1;
      const framesPerSet = selectedProd.framesPerSet || 1;

      const newRow = calculateRowValues({
        ...curRow,
        productId: selectedProd.id,
        customProductName: '',
        size: selectedProd.size || selectedProd.variantDetails || curRow.size || '',
        type: selectedProd.type || selectedProd.brand || curRow.type || '',
        capacity: selectedProd.capacity || curRow.capacity || '',
        coverUnitWeight,
        frameUnitWeight,
        coversPerSet,
        framesPerSet
      });

      updated[rowIndex] = newRow;
      return updated;
    });
  };

  const handleCustomProductName = (rowIndex, name) => {
    setRows(prevRows => {
      const updated = [...prevRows];
      const curRow = updated[rowIndex];
      const newRow = calculateRowValues({
        ...curRow,
        productId: '',
        customProductName: name,
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
  const checkDuplicateReport = async (d, s) => {
    try {
      const res = await backendFetch(`/api/backend/production/daily-reports/check-duplicate?date=${d}&shift=${s}`);
      if (res?.exists && res?.report?.id !== currentReportId) {
        Swal.fire({
          icon: 'info',
          title: 'Existing Report Found',
          text: `A production report (${res.report.reportNo}) already exists for ${d} [${s} shift].`,
          showCancelButton: true,
          confirmButtonText: 'Open Existing Report',
          cancelButtonText: 'Continue Editing'
        }).then(result => {
          if (result.isConfirmed) {
            fetchReport(res.report.id);
          }
        });
      }
    } catch {
      // Best effort check
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    const validItems = rows.filter(r => r.productId || r.customProductName);
    if (validItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Product Specified',
        text: 'Please select a product or type a custom product name for at least one production row.'
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        reportDate,
        shift,
        supervisorName,
        items: rows.map((r, idx) => ({
          srNo: idx + 1,
          productId: r.productId || null,
          customProductName: r.customProductName || null,
          size: r.size,
          type: r.type,
          capacity: r.capacity,
          coverQty: Number(r.coverQty || 0),
          coverUnitWeight: Number(r.coverUnitWeight || 0),
          actualCoverWeight: r.actualCoverWeight !== '' ? Number(r.actualCoverWeight) : null,
          frameQty: Number(r.frameQty || 0),
          frameUnitWeight: Number(r.frameUnitWeight || 0),
          actualFrameWeight: r.actualFrameWeight !== '' ? Number(r.actualFrameWeight) : null,
          weightOverrideReason: r.weightOverrideReason || null,
          setQty: Number(r.setQty || 0),
          remarks: r.remarks || null
        }))
      };

      let response;
      if (currentReportId) {
        response = await backendFetch(`/api/backend/production/daily-reports/${currentReportId}`, {
          method: 'PATCH',
          body: payload
        });
      } else {
        response = await backendFetch('/api/backend/production/daily-reports', {
          method: 'POST',
          body: payload
        });
      }

      if (response) {
        setCurrentReportId(response.id);
        setReportNo(response.reportNo);
        setStatus(response.status || 'DRAFT');
        setLastUpdated(response.updatedAt);

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
    const validItems = rows.filter(r => r.productId || r.customProductName);
    if (validItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a product or enter a custom product name for at least one production row.'
      });
      return;
    }

    const invalidQty = rows.some(r => r.coverQty < 0 || r.frameQty < 0 || r.totalWeight < 0);
    if (invalidQty) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Production quantities and weights cannot be negative.'
      });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Submit Daily Production Report?',
      text: 'After submission, report entries will be locked for review and approval.',
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
        items: rows.map((r, idx) => ({
          srNo: idx + 1,
          productId: r.productId || null,
          customProductName: r.customProductName || null,
          size: r.size,
          type: r.type,
          capacity: r.capacity,
          coverQty: Number(r.coverQty || 0),
          coverUnitWeight: Number(r.coverUnitWeight || 0),
          actualCoverWeight: r.actualCoverWeight !== '' ? Number(r.actualCoverWeight) : null,
          frameQty: Number(r.frameQty || 0),
          frameUnitWeight: Number(r.frameUnitWeight || 0),
          actualFrameWeight: r.actualFrameWeight !== '' ? Number(r.actualFrameWeight) : null,
          weightOverrideReason: r.weightOverrideReason || null,
          setQty: Number(r.setQty || 0),
          remarks: r.remarks || null
        }))
      };

      if (!targetId) {
        const saved = await backendFetch('/api/backend/production/daily-reports', {
          method: 'POST',
          body: payload
        });
        targetId = saved.id;
        setCurrentReportId(saved.id);
        setReportNo(saved.reportNo);
      } else {
        await backendFetch(`/api/backend/production/daily-reports/${targetId}`, {
          method: 'PATCH',
          body: payload
        });
      }

      const submitted = await backendFetch(`/api/backend/production/daily-reports/${targetId}/submit`, {
        method: 'POST'
      });

      if (submitted) {
        setStatus(submitted.status);
        setLastUpdated(submitted.updatedAt);
        Swal.fire({
          icon: 'success',
          title: 'Report Submitted',
          text: `Daily Production Report ${submitted.reportNo} submitted successfully!`
        });
      }
    } catch (err) {
      console.error('[DailyReport] Submit Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || 'Unable to submit report'
      });
    } finally {
      setSubmitting(false);
    }
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

  const isReadOnly = status === 'SUBMITTED' || status === 'APPROVED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      
      {/* HEADER BAR */}
      <div style={{
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)', margin: 0 }}>
              Industrial FRP Production Report
            </h1>
            {renderStatusBadge(status)}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            Digital daily entry sheet for FRP Covers, Frames, Weights & Complete Sets.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onNavigateToHistory}
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

          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving || submitting}
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
      <div style={{
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
              checkDuplicateReport(e.target.value, shift);
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
              checkDuplicateReport(reportDate, e.target.value);
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
            Production Supervisor
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
            Production User
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
      <div style={{
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
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Production Weight</div>
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
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(248, 250, 252, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
              Production Entries
            </h2>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>
              {rows.length} {rows.length === 1 ? 'Row' : 'Rows'}
            </span>
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            Press <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '1px 5px', borderRadius: '4px' }}>Ctrl + Enter</kbd> to add row
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
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
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </td>

                  {/* Product Smart Combobox */}
                  <td style={{ padding: '10px 14px' }}>
                    <SmartProductCombobox
                      value={row.productId}
                      customProductName={row.customProductName}
                      disabled={isReadOnly}
                      products={products}
                      onChange={(selectedProd) => handleProductSelect(index, selectedProd)}
                      onCustomNameChange={(customName) => handleCustomProductName(index, customName)}
                    />
                  </td>

                  {/* Size */}
                  <td style={{ padding: '10px 14px' }}>
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
                  <td style={{ padding: '10px 14px' }}>
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
                  <td style={{ padding: '10px 14px' }}>
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
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
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
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
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
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
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
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
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
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '900', color: '#7c3aed' }}>
                    {row.totalWeight}
                  </td>

                  {/* Set Qty */}
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '900', color: '#059669' }}>
                    {row.setQty}
                  </td>

                  {/* Actions */}
                  {!isReadOnly && (
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
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

        {/* ADD ROW BUTTON */}
        {!isReadOnly && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--color-border)', background: '#fafafa' }}>
            <button
              type="button"
              onClick={handleAddRow}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1.5px dashed #2F4375',
                background: 'rgba(47, 67, 117, 0.04)',
                color: '#2F4375',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <Plus size={16} /> Add Production Row
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
          Daily Production Summary Breakdown
        </h3>

        <div style={{
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

    </div>
  );
}
