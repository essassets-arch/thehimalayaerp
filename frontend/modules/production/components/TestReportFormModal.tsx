'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Loader2, Save, Send, Search, Check } from 'lucide-react';
import { toast } from 'sonner';
import { backendFetch } from '../../../lib/backendFetch';
import styles from './TestReportFormModal.module.css';
import {
  TestCertificateData,
  defaultSpecifications,
  defaultLoadTestingRows,
  TestSpecificationRow,
  LoadTestingRow,
} from './TestCertificateDocument';
import { defaultSpecificationsCert2 } from './TestCertificateDocument2';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedReport: any) => void;
  initialData?: TestCertificateData | null;
  products?: any[];
  customers?: any[];
}

export default function TestReportFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  products = [],
  customers = [],
}: Props) {
  const isEditing = !!initialData?.id;

  const [templateType, setTemplateType] = useState<'CERT_1' | 'CERT_2'>('CERT_1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportNumber, setReportNumber] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [productId, setProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isProductListOpen, setIsProductListOpen] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const productPickerRef = useRef<HTMLDivElement>(null);
  const [productName, setProductName] = useState('');
  const [clearOpening, setClearOpening] = useState('');
  const [quantitySupply, setQuantitySupply] = useState('');
  const [projectName, setProjectName] = useState('');
  const [specs, setSpecs] = useState<TestSpecificationRow[]>(defaultSpecifications);
  const [loadRows, setLoadRows] = useState<LoadTestingRow[]>(defaultLoadTestingRows);
  const [cycleLoadsTon, setCycleLoadsTon] = useState('40');
  const [finalLoadTon, setFinalLoadTon] = useState('40');
  const [resultStatement, setResultStatement] = useState(
    'Result:- No Cracks or Determination of FRP Cover observed after applying sequence of load and FRP Cover & frame were found satisfactory.'
  );
  const [testedByName, setTestedByName] = useState('Sana Konda Reddy');
  const [testedByTitle, setTestedByTitle] = useState('Plant Head');
  const [status, setStatus] = useState<'Draft' | 'Pending Approval'>('Draft');
  const [remarks, setRemarks] = useState('');

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLocaleLowerCase();
    const searchableProducts = products.map((product) => ({
      product,
      label: `${product.name || ''} ${product.size || ''} ${product.capacity || ''}`.trim(),
    }));
    if (!query) return searchableProducts;

    const terms = query.split(/\s+/);
    return searchableProducts
      .map((item) => {
        const name = String(item.product.name || '').toLocaleLowerCase();
        const size = String(item.product.size || '').toLocaleLowerCase();
        const capacity = String(item.product.capacity || '').toLocaleLowerCase();
        const searchable = `${name} ${size} ${capacity}`;
        const matches = terms.every((term) => searchable.includes(term));
        if (!matches) return null;

        // Put direct name matches before matches found only in size/capacity.
        const score = name.startsWith(query) ? 0 : name.includes(query) ? 1 : 2;
        return { ...item, score };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));
  }, [products, productSearch]);

  useEffect(() => {
    if (!isProductListOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!productPickerRef.current?.contains(event.target as Node)) {
        setIsProductListOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isProductListOpen]);

  useEffect(() => {
    if (initialData) {
      setReportNumber(initialData.reportNumber || '');
      setReportDate(
        initialData.reportDate
          ? new Date(initialData.reportDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setClientName(initialData.clientName || '');
      setPoNumber(initialData.poNumber || '');
      setProductName(initialData.productName || '');
      setClearOpening(initialData.clearOpening || '');
      setQuantitySupply(initialData.quantitySupply || '');
      setProjectName(initialData.projectName || '');

      const isC2 =
        (initialData as any).certificateType === 'CERT_2' ||
        (initialData.remarks && initialData.remarks.includes('CERT_TYPE:CERT_2')) ||
        (initialData.specifications && initialData.specifications.some((s) => s.specification?.toLowerCase().includes('cover size')));
      setTemplateType(isC2 ? 'CERT_2' : 'CERT_1');

      if (initialData.specifications && initialData.specifications.length > 0) {
        setSpecs(initialData.specifications);
      } else {
        setSpecs(isC2 ? defaultSpecificationsCert2 : defaultSpecifications);
      }
      if (initialData.loadTestingRows && initialData.loadTestingRows.length > 0) {
        setLoadRows(initialData.loadTestingRows);
      } else {
        setLoadRows(defaultLoadTestingRows);
      }
      setCycleLoadsTon(initialData.cycleLoadsTon || '40');
      setFinalLoadTon(initialData.finalLoadTon || '40');
      setResultStatement(
        initialData.resultStatement ||
          'Result:- No Cracks or Determination of FRP Cover observed after applying sequence of load and FRP Cover & frame were found satisfactory.'
      );
      setTestedByName(initialData.testedByName || (isC2 ? 'R&D Quality Engineer' : 'Sana Konda Reddy'));
      setTestedByTitle(initialData.testedByTitle || (isC2 ? 'R&D QUALITY ENGINEER' : 'Plant Head'));
      setStatus(initialData.status === 'Pending Approval' ? 'Pending Approval' : 'Draft');
      setRemarks(initialData.remarks || '');
    } else {
      // New report: generate fresh template defaults
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setReportNumber(`TC-${year}-${rand}`);
      setReportDate(new Date().toISOString().split('T')[0]);
      setClientName('');
      setPoNumber('');
      setProductId('');
      setProductSearch('');
      setIsProductListOpen(false);
      setProductName('');
      setClearOpening('');
      setQuantitySupply('');
      setProjectName('');
      setTemplateType('CERT_1');
      setSpecs(defaultSpecifications);
      setLoadRows(defaultLoadTestingRows);
      setCycleLoadsTon('40');
      setFinalLoadTon('40');
      setResultStatement(
        'Result:- No Cracks or Determination of FRP Cover observed after applying sequence of load and FRP Cover & frame were found satisfactory.'
      );
      setTestedByName('Sana Konda Reddy');
      setTestedByTitle('Plant Head');
      setStatus('Draft');
      setRemarks('');
    }
  }, [initialData, isOpen]);

  const handleTemplateSwitch = (target: 'CERT_1' | 'CERT_2') => {
    setTemplateType(target);
    if (target === 'CERT_2') {
      const pName = productName || '';
      const sizeMatch = (clearOpening + ' ' + pName).match(/(\d{3,4})\s*[xX*]\s*(\d{3,4})/);
      let derivedCover = '650 X 650 MM';
      let derivedFrame = '710 X 710 MM';
      if (sizeMatch) {
        const w = parseInt(sizeMatch[1], 10);
        const h = parseInt(sizeMatch[2], 10);
        derivedCover = `${w + 50} X ${h + 50} MM`;
        derivedFrame = `${w + 110} X ${h + 110} MM`;
      }
      setSpecs(defaultSpecificationsCert2.map((s) => {
        if (s.srNo === 1 && !s.description) return { ...s, description: 'FRP (Fiber Reinforced Polymer)' };
        if (s.srNo === 2 && clearOpening) return { ...s, description: clearOpening };
        if (s.srNo === 3 && derivedCover) return { ...s, description: derivedCover };
        if (s.srNo === 4 && derivedFrame) return { ...s, description: derivedFrame };
        return s;
      }));
      setTestedByTitle('R&D QUALITY ENGINEER');
    } else {
      setSpecs(defaultSpecifications);
      setTestedByTitle('Plant Head');
    }
  };

  const handleProductSelect = (selectedId: string) => {
    setProductId(selectedId);
    const prod = products.find((p) => p.id === selectedId);
    if (prod) {
      setProductSearch(`${prod.name || ''}${prod.size ? ` (${prod.size})` : ''}${prod.capacity ? ` [${prod.capacity}]` : ''}`);
      setIsProductListOpen(false);
      setActiveProductIndex(0);
      setProductName(prod.name || '');
      if (prod.size) setClearOpening(prod.size);

      // Update default specifications based on selected Product Master details
      if (templateType === 'CERT_2') {
        const sizeMatch = (prod.size || prod.name || '').match(/(\d{3,4})\s*[xX*]\s*(\d{3,4})/);
        let derivedCover = '650 X 650 MM';
        let derivedFrame = '710 X 710 MM';
        if (sizeMatch) {
          const w = parseInt(sizeMatch[1], 10);
          const h = parseInt(sizeMatch[2], 10);
          derivedCover = `${w + 50} X ${h + 50} MM`;
          derivedFrame = `${w + 110} X ${h + 110} MM`;
        }
        setSpecs((prev) =>
          prev.map((s) => {
            if (s.srNo === 2 && prod.size) return { ...s, description: prod.size };
            if (s.srNo === 3) return { ...s, description: derivedCover };
            if (s.srNo === 4) return { ...s, description: derivedFrame };
            if (s.srNo === 5 && prod.capacity) return { ...s, description: `${prod.capacity}` };
            return s;
          })
        );
      } else {
        setSpecs((prev) =>
          prev.map((s) => {
            if (s.srNo === 1) return { ...s, description: 'FRP' };
            if (s.srNo === 2 && prod.capacity) return { ...s, description: `${prod.capacity}` };
            if (s.srNo === 3 && prod.type) return { ...s, description: 'Black' };
            return s;
          })
        );
      }

      // If product has numeric capacity (e.g. 12.5, 25, 40), set cycle ton defaults
      const capNum = parseFloat(prod.capacity || '');
      if (!isNaN(capNum) && capNum > 0) {
        setCycleLoadsTon(String(capNum));
        setFinalLoadTon(String(capNum));
      }
    }
  };

  const handleSpecChange = (index: number, newDesc: string) => {
    setSpecs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], description: newDesc };
      return copy;
    });
  };

  const handleLoadRowChange = (index: number, field: keyof LoadTestingRow, value: string) => {
    setLoadRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (targetStatus: 'Draft' | 'Pending Approval') => {
    if (templateType === 'CERT_1' && !clientName.trim()) {
      toast.error('Client Name is required');
      return;
    }
    if (templateType === 'CERT_1' && !productName.trim()) {
      toast.error('Product Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanRemarks = (remarks || '').replace(/\[CERT_TYPE:[^\]]+\]\s*/g, '').trim();
      const finalRemarks = templateType === 'CERT_2'
        ? `[CERT_TYPE:CERT_2] ${cleanRemarks}`.trim()
        : cleanRemarks;

      const finalClientName = templateType === 'CERT_2'
        ? (clientName.trim() || 'HIMALAYA STANDARD')
        : clientName.trim();

      const finalProductName = templateType === 'CERT_2'
        ? (productName.trim() || 'HIMALAYA FRP COVER & FRAME')
        : productName.trim();

      const finalTestedByTitle = templateType === 'CERT_2'
        ? (testedByTitle.trim() || 'R&D QUALITY ENGINEER')
        : testedByTitle.trim();

      const payload = {
        reportNumber: reportNumber.trim(),
        reportDate,
        clientName: finalClientName,
        poNumber: poNumber.trim() || undefined,
        productName: finalProductName,
        productId: productId || undefined,
        clearOpening: clearOpening.trim() || undefined,
        quantitySupply: quantitySupply.trim() || undefined,
        projectName: projectName.trim() || undefined,
        specifications: specs,
        loadTestingRows: loadRows,
        cycleLoadsTon: cycleLoadsTon.trim() || undefined,
        finalLoadTon: finalLoadTon.trim() || undefined,
        resultStatement: resultStatement.trim(),
        testedByName: testedByName.trim(),
        testedByTitle: testedByTitle.trim(),
        status: targetStatus,
        remarks: finalRemarks || undefined,
        certificateType: templateType,
      };

      let res: any;
      if (isEditing && initialData?.id) {
        res = await backendFetch(`/api/backend/production/testing/reports/${initialData.id}`, {
          method: 'PUT',
          body: payload,
        });
        toast.success('Test Certificate updated successfully');
      } else {
        res = await backendFetch('/api/backend/production/testing/reports', {
          method: 'POST',
          body: payload,
        });
        toast.success('Test Certificate created successfully');
      }

      onSuccess(res?.data || res);
      onClose();
    } catch (err: any) {
      console.error('[TestReportFormModal] Submission error:', err);
      toast.error(err?.message || 'Failed to save test certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEditing ? `Edit Test Certificate (${reportNumber})` : 'New Test Certificate'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className={styles.modalBody}>
          {/* Certificate Template Selection */}
          <div className={styles.templateSelectionBar}>
            <span className={styles.templateSelectionLabel}>Select Certificate Design / Format</span>
            <div className={styles.templateOptions}>
              <button
                type="button"
                onClick={() => handleTemplateSwitch('CERT_1')}
                className={`${styles.templateOptionBtn} ${templateType === 'CERT_1' ? styles.templateOptionBtnActive : ''}`}
              >
                <span className={styles.templateIcon}>📜</span>
                <div>
                  <div className={styles.templateName}>Certificate 1 — MTC &amp; Proof Load Test</div>
                  <div className={styles.templateDesc}>
                    Full Mill Test Certificate with client details, 10-row technical specs, 5 sequence load stages &amp; dual signatures.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateSwitch('CERT_2')}
                className={`${styles.templateOptionBtn} ${templateType === 'CERT_2' ? styles.templateOptionBtnActive : ''}`}
              >
                <span className={styles.templateIcon}>📄</span>
                <div>
                  <div className={styles.templateName}>Certificate 2: TDS — Technical Data Specification</div>
                  <div className={styles.templateDesc}>
                    Direct 11-row technical specification certificate (MOC, Clear Opening, Cover/Frame Size, Load, Resin, R&amp;D Stamp).
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Form Content: Pure 11-row format for Certificate 2, full MTC form for Certificate 1 */}
          {templateType === 'CERT_2' ? (
            /* ── Certificate 2: JUST the 11-Row Technical Specification Certificate ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{
                textAlign: 'center',
                padding: '16px 20px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #000000',
                borderRadius: '8px',
              }}>
                <div style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#0b3c68',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  borderBottom: '2.5px solid #0b3c68',
                  paddingBottom: '6px',
                  marginBottom: '10px',
                  display: 'inline-block',
                }}>
                  HIMALAYA COMPOSITE &amp; PRECAST PVT. LTD.
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#000000',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>
                  HIMALAYA FRP COVER &amp; FRAME
                </div>
              </div>

              {/* Exact 11-Row Specification Table matching reference image */}
              <div className={styles.specTableWrap}>
                <table className={styles.specTable} style={{ border: '1.5px solid #000000' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '12%', textAlign: 'center', border: '1.5px solid #000000', fontWeight: 700 }}>
                        Sr. No
                      </th>
                      <th style={{ width: '44%', textAlign: 'left', border: '1.5px solid #000000', fontWeight: 700 }}>
                        Specification
                      </th>
                      <th style={{ width: '44%', textAlign: 'left', border: '1.5px solid #000000', fontWeight: 700 }}>
                        description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {specs.map((s, idx) => (
                      <tr key={s.srNo || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600, border: '1.5px solid #000000' }}>
                          {s.srNo}
                        </td>
                        <td style={{ fontWeight: 600, color: '#000000', border: '1.5px solid #000000' }}>
                          {s.specification}
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '4px 8px' }}>
                          <input
                            type="text"
                            value={s.description}
                            onChange={(e) => handleSpecChange(idx, e.target.value)}
                            className={styles.tableInput}
                            style={{ width: '100%', fontSize: '13px' }}
                            placeholder={
                              s.srNo === 1 ? 'MOC of Material (e.g. FRP)' :
                              s.srNo === 2 ? 'Clear Opening (e.g. 600 X 600 MM)' :
                              s.srNo === 3 ? 'Cover Size (e.g. 650 X 650 MM)' :
                              s.srNo === 4 ? 'Frame Size (e.g. 710 X 710 MM)' :
                              s.srNo === 5 ? 'Load Bearing (e.g. 12.5 TON)' :
                              s.srNo === 6 ? 'Colour (e.g. Black)' : ''
                            }
                          />
                        </td>
                      </tr>
                    ))}
                    {/* Bottom Footer Row with R&D QUALITY ENGINEER and Stamp */}
                    <tr>
                      <td colSpan={2} style={{ border: '1.5px solid #000000', padding: '16px 14px', verticalAlign: 'middle' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          R&amp;D QUALITY ENGINEER
                        </div>
                      </td>
                      <td style={{ border: '1.5px solid #000000', textAlign: 'center', padding: '10px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                          <Check size={16} /> Official Seal Stamp Ready
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ── Certificate 1: Full MTC & Proof Load Form ── */
            <>
              {/* 1. Header Information */}
              <div>
                <div className={styles.sectionTitle}>1. Certificate &amp; Client Details</div>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Report / Certificate No. *</label>
                    <input
                      type="text"
                      required
                      value={reportNumber}
                      onChange={(e) => setReportNumber(e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. TC-2026-0001"
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Test Date *</label>
                    <input
                      type="date"
                      required
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Client / Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. Larsen &amp; Toubro Ltd."
                      list="client-suggestions"
                    />
                    {customers.length > 0 && (
                      <datalist id="client-suggestions">
                        {customers.map((c) => (
                          <option key={c.id || c.companyName} value={c.companyName} />
                        ))}
                      </datalist>
                    )}
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>P.O. No.</label>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. PO/2026/089"
                    />
                  </div>

                  <div className={`${styles.formField} ${styles.fullWidth}`} ref={productPickerRef}>
                    <label className={styles.formLabel}>Select Product from Master (Auto-fills specifications)</label>
                    <div className={styles.productPicker}>
                      <Search size={16} aria-hidden="true" className={styles.productSearchIcon} />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setProductId('');
                          setIsProductListOpen(true);
                          setActiveProductIndex(0);
                        }}
                        onFocus={() => setIsProductListOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown' && filteredProducts.length) {
                            e.preventDefault();
                            setIsProductListOpen(true);
                            setActiveProductIndex((index) => Math.min(index + 1, filteredProducts.length - 1));
                          } else if (e.key === 'ArrowUp' && filteredProducts.length) {
                            e.preventDefault();
                            setActiveProductIndex((index) => Math.max(index - 1, 0));
                          } else if (e.key === 'Enter' && isProductListOpen && filteredProducts[activeProductIndex]) {
                            e.preventDefault();
                            handleProductSelect(filteredProducts[activeProductIndex].product.id);
                          } else if (e.key === 'Escape') {
                            setIsProductListOpen(false);
                          }
                        }}
                        className={`${styles.formInput} ${styles.productSearchInput}`}
                        placeholder="Search by product name, size, or capacity…"
                        role="combobox"
                        aria-label="Search master products"
                        aria-autocomplete="list"
                        aria-expanded={isProductListOpen}
                        aria-controls="master-product-options"
                      />
                      {isProductListOpen && (
                        <div className={styles.productOptions} id="master-product-options" role="listbox">
                          {filteredProducts.length ? filteredProducts.map(({ product, label }, index) => (
                            <button
                              type="button"
                              key={product.id}
                              role="option"
                              aria-selected={product.id === productId}
                              className={`${styles.productOption} ${index === activeProductIndex ? styles.productOptionActive : ''}`}
                              onMouseEnter={() => setActiveProductIndex(index)}
                              onClick={() => handleProductSelect(product.id)}
                            >
                              <span>{product.name}{product.size ? ` (${product.size})` : ''}{product.capacity ? ` [${product.capacity}]` : ''}</span>
                              {product.id === productId && <Check size={16} aria-hidden="true" />}
                            </button>
                          )) : (
                            <div className={styles.productEmpty}>No matching products. You can enter a custom name below.</div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className={styles.productHint}>Search across product names, sizes, and capacities.</span>
                  </div>

                  <div className={`${styles.formField} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Name Of the Products *</label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. 600mm DIA FRP Manhole Cover &amp; Frame (E600 / 40 Ton)"
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Clear Opening</label>
                    <input
                      type="text"
                      value={clearOpening}
                      onChange={(e) => setClearOpening(e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. 600 mm or 450x450 mm"
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Quantity Supply</label>
                    <input
                      type="text"
                      value={quantitySupply}
                      onChange={(e) => setQuantitySupply(e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. 100 Nos / 50 Sets"
                    />
                  </div>

                  <div className={`${styles.formField} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Project Name</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. Smart City Drainage &amp; Road Infrastructure"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Specifications Table */}
              <div>
                <div className={styles.sectionTitle}>2. Product Specifications (10 ISO/EN Rows)</div>
                <div className={styles.specTableWrap}>
                  <table className={styles.specTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '10%' }}>Sr. No.</th>
                        <th style={{ width: '40%' }}>Specification</th>
                        <th style={{ width: '50%' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specs.map((s, idx) => (
                        <tr key={s.srNo || idx}>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.srNo}</td>
                          <td style={{ fontWeight: 600, color: '#0b3c68' }}>{s.specification}</td>
                          <td>
                            <input
                              type="text"
                              value={s.description}
                              onChange={(e) => handleSpecChange(idx, e.target.value)}
                              className={styles.tableInput}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Load Testing Section (5 Stages) */}
              <div>
                <div className={styles.sectionTitle}>3. Load Testing Measurements (5 Sequence Stages)</div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Note: Enter the actual recorded test measurements and remarks for all five test sequences.
                </p>
                <div className={styles.specTableWrap}>
                  <table className={styles.specTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '10%' }}>No.</th>
                        <th style={{ width: '30%' }}>Load Applied</th>
                        <th style={{ width: '20%' }}>Load (Tons)</th>
                        <th style={{ width: '22%' }}>Sequence</th>
                        <th style={{ width: '18%' }}>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadRows.map((r, idx) => (
                        <tr key={r.no || idx}>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{r.no}</td>
                          <td>
                            <input
                              type="text"
                              value={r.loadApplied}
                              onChange={(e) => handleLoadRowChange(idx, 'loadApplied', e.target.value)}
                              className={styles.tableInput}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              placeholder="e.g. 10 / 20 / 40"
                              value={r.load}
                              onChange={(e) => handleLoadRowChange(idx, 'load', e.target.value)}
                              className={styles.tableInput}
                              style={{ fontWeight: 700 }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={r.sequence}
                              onChange={(e) => handleLoadRowChange(idx, 'sequence', e.target.value)}
                              className={styles.tableInput}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              placeholder="e.g. Satisfactory"
                              value={r.remark}
                              onChange={(e) => handleLoadRowChange(idx, 'remark', e.target.value)}
                              className={styles.tableInput}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Cycle & Holding Statement */}
              <div>
                <div className={styles.sectionTitle}>4. Five-Cycle &amp; Holding Statement</div>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Five Cycles Load (Tons)</label>
                    <input
                      type="text"
                      value={cycleLoadsTon}
                      onChange={(e) => setCycleLoadsTon(e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. 40"
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Final Maintained Load (Tons for 30s)</label>
                    <input
                      type="text"
                      value={finalLoadTon}
                      onChange={(e) => setFinalLoadTon(e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. 40"
                    />
                  </div>

                  <div className={`${styles.formField} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Result Paragraph</label>
                    <textarea
                      value={resultStatement}
                      onChange={(e) => setResultStatement(e.target.value)}
                      className={styles.formTextarea}
                    />
                  </div>
                </div>
              </div>

              {/* 5. Testing Signatures & Status */}
              <div>
                <div className={styles.sectionTitle}>5. Tester &amp; Status</div>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Plant Head Name</label>
                    <input
                      type="text"
                      value={testedByName}
                      onChange={(e) => setTestedByName(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Tester Designation</label>
                    <input
                      type="text"
                      value={testedByTitle}
                      onChange={(e) => setTestedByTitle(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={`${styles.formField} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Internal Notes / Remarks</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className={styles.formInput}
                      placeholder="Optional audit or reference notes"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => handleSubmit('Draft')}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 size={15} className={styles.spinner} /> : <Save size={15} />}
            Save as Draft
          </button>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => handleSubmit('Pending Approval')}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 size={15} className={styles.spinner} /> : <Send size={15} />}
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}
