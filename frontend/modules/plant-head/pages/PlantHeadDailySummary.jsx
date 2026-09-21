'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, Calendar, RefreshCw, Download, Printer, AlertTriangle,
  CheckCircle, Clock, Package, Truck, ShieldAlert, FileText, ArrowUpRight,
  ChevronDown, ChevronUp, Layers, Activity, FileSpreadsheet, Eye, UserCheck,
  Search, X, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Check,
  AlertOctagon, ExternalLink, Building2, User, ArrowRight, Filter
} from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import { useRouter } from 'next/navigation';
import { safeSaveFile } from '../../../services/export.service';
import { useAuth } from '../../../shared/context/AuthContext';

export const PlantHeadDailySummary = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Dynamic Interactive Features
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('off'); // 'off' | '30' | '60'
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedItem, setInspectedItem] = useState(null);

  // Section Specific Filters
  const [orderFilter, setOrderFilter] = useState('ALL'); // 'ALL' | 'AWAITING' | 'APPROVED' | 'OVERDUE'
  const [planningFilter, setPlanningFilter] = useState('ALL'); // 'ALL' | 'DIRECT_FG' | 'PRODUCE'
  const [mrFilter, setMrFilter] = useState('ALL'); // 'ALL' | 'SHORTAGE' | 'PENDING'
  const [qcFilter, setQcFilter] = useState('ALL'); // 'ALL' | 'FAILED' | 'REWORK'
  const [dispatchFilter, setDispatchFilter] = useState('ALL'); // 'ALL' | 'DELAYED' | 'TRANSIT' | 'READY'

  // Table Expansion state (Compact 8 vs Show All)
  const [expandedTables, setExpandedTables] = useState({
    orders: false,
    planning: false,
    materialRequests: false,
    indents: false,
    rawInventory: false,
    finishedGoods: false,
    qc: false,
    dispatch: false,
  });

  const toggleTableExpand = (tableKey) => {
    setExpandedTables(prev => ({ ...prev, [tableKey]: !prev[tableKey] }));
  };

  // Section Collapse state
  const [collapsedSections, setCollapsedSections] = useState({
    indents: true,
    rawInventory: true,
    finishedGoods: true,
    replacementsReturns: true,
    activity: false,
    comparison: false,
  });

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchDailySummary = useCallback(async () => {
    setLoading(true);
    try {
      const dateParam = selectedDate === 'custom' ? customDate : selectedDate;
      const res = await backendFetch(`/api/backend/plant-head/daily-summary?date=${encodeURIComponent(dateParam || 'today')}`);
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('[PlantHeadDailySummary] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, customDate]);

  useEffect(() => {
    fetchDailySummary();
  }, [fetchDailySummary]);

  // Auto Refresh Polling
  useEffect(() => {
    if (autoRefreshInterval === 'off') return;
    const sec = parseInt(autoRefreshInterval, 10);
    if (isNaN(sec) || sec <= 0) return;
    const timer = setInterval(() => {
      fetchDailySummary();
    }, sec * 1000);
    return () => clearInterval(timer);
  }, [autoRefreshInterval, fetchDailySummary]);

  // Track scroll position for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 220) {
        setIsStickyVisible(true);
      } else {
        setIsStickyVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Day Stepper Helpers
  const handlePrevDay = () => {
    let base = new Date();
    if (selectedDate === 'yesterday') {
      base.setDate(base.getDate() - 1);
    } else if (selectedDate === 'custom' && customDate) {
      const p = customDate.split('-');
      if (p.length === 3) base = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    }
    base.setDate(base.getDate() - 1);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, '0');
    const dd = String(base.getDate()).padStart(2, '0');
    setCustomDate(`${yyyy}-${mm}-${dd}`);
    setSelectedDate('custom');
  };

  const handleNextDay = () => {
    let base = new Date();
    if (selectedDate === 'yesterday') {
      base.setDate(base.getDate() - 1);
    } else if (selectedDate === 'custom' && customDate) {
      const p = customDate.split('-');
      if (p.length === 3) base = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    }
    base.setDate(base.getDate() + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(base);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate >= today) {
      setSelectedDate('today');
      setCustomDate('');
      return;
    }
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, '0');
    const dd = String(base.getDate()).padStart(2, '0');
    setCustomDate(`${yyyy}-${mm}-${dd}`);
    setSelectedDate('custom');
  };

  const isSelectedToday = selectedDate === 'today' || (selectedDate === 'custom' && customDate === new Date().toISOString().slice(0, 10));

  const scrollToAnchor = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleDownloadImage = async () => {
    setDownloadingImage(true);
    try {
      const element = document.getElementById('report-document-card');
      if (!element) {
        setDownloadingImage(false);
        return;
      }

      const fileName = `PlantHead_Executive_Report_${data?.date || new Date().toISOString().slice(0, 10)}.png`;

      // Strategy 1: html-to-image
      try {
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(element, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          filter: (node) => !node.classList || !node.classList.contains('no-print')
        });

        if (dataUrl) {
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => document.body.removeChild(link), 100);
          setDownloadingImage(false);
          return;
        }
      } catch (h2iErr) {
        console.warn('[html-to-image failed, trying fallback]:', h2iErr);
      }

      // Strategy 2: html2canvas
      try {
        const html2canvasModule = await import('html2canvas');
        const html2canvasFn = html2canvasModule.default || html2canvasModule;

        const canvas = await html2canvasFn(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          ignoreElements: (el) => el && el.classList && el.classList.contains('no-print'),
          onclone: (clonedDoc) => {
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach(el => {
              if (el.style) {
                const styleStr = el.getAttribute('style') || '';
                if (styleStr.includes('oklch')) {
                  el.setAttribute('style', styleStr.replace(/oklch\([^)]+\)/g, '#0284c7'));
                }
              }
            });
          }
        });

        if (canvas && canvas.width > 0 && canvas.height > 0) {
          const imageUri = canvas.toDataURL('image/png', 1.0);
          await safeSaveFile(imageUri, fileName, 'image/png');
        }
      } catch (h2cErr) {
        console.error('[Download Image error]:', h2cErr);
      }

    } catch (err) {
      console.error('[Download Image final error]:', err);
    } finally {
      setDownloadingImage(false);
    }
  };

  const handleExportExcel = () => {
    if (!data) return;
    const lines = [
      'PLANT HEAD DAILY SUMMARY REPORT',
      `Target Date: ${data.formattedDate || data.date}`,
      `Last Live Sync: ${data.lastUpdated}`,
      `Plant Head / Authorized Signatory: ${data.plantHeadName || user?.name || 'Plant Head'}`,
      '',
      'MAIN KPIS',
      `Incoming Orders Today: ${data.mainKpis?.incomingOrders || 0}`,
      `Awaiting Plant Head Action: ${data.mainKpis?.awaitingPlantHead || 0}`,
      `Pending Planning: ${data.mainKpis?.pendingPlanning || 0}`,
      `Active Production: ${data.mainKpis?.activeProduction || 0}`,
      `Material Requests Pending: ${data.mainKpis?.materialRequests || 0}`,
      `Material Shortages: ${data.mainKpis?.materialShortages || 0}`,
      `Pending Indents: ${data.mainKpis?.pendingIndents || 0}`,
      `QC Pending: ${data.mainKpis?.qcPending || 0}`,
      `Ready Dispatch: ${data.mainKpis?.readyDispatch || 0}`,
      `Critical Alerts: ${data.mainKpis?.criticalAlerts || 0}`,
      '',
      'EXECUTIVE OPERATIONAL BRIEF',
      `"${data.summaryText}"`,
      '',
      'INCOMING SALES ORDERS',
      'Order No,Customer,Product,Quantity,Status,Target Date,Age',
      ...(data.orders?.table || []).map(o => `"${o.orderNo}","${o.customerName}","${o.productName}",${o.quantity},"${o.status}","${o.targetDate}","${o.age}"`),
      '',
      'PRODUCTION PLANNING & FG ALLOCATION',
      'Order No,Customer,Product,Ordered,FG Available,Reserved FG,Produce Needed,Status',
      ...(data.planning?.table || []).map(p => `"${p.orderNo}","${p.customerName || ''}","${p.productName}",${p.ordered},${p.fgAvailable},${p.reservedFg},${p.produce},"${p.status}"`),
      '',
      'MATERIAL REQUESTS & WAREHOUSE DEFICITS',
      'MR No,Work Order,Material,Requested,Available In Stock,Shortage Qty,Status,Age',
      ...(data.materialRequests?.table || []).map(m => `"${m.mrNo}","${m.workOrderNo}","${m.materialName}",${m.requested},${m.available},${m.shortageQty || 0},"${m.status}","${m.age || ''}"`),
      '',
      'QUALITY CONTROL REJECTIONS',
      'Work Order,Product,Batch,Failed Qty,Reason,Decision',
      ...(data.qc?.failureTable || []).map(q => `"${q.workOrderNo}","${q.productName}","${q.batchNo}",${q.failedQty},"${q.reason}","${q.decision}"`),
      '',
      'DISPATCH SUMMARY',
      'Dispatch No,Order No,Customer,Consignment,Quantity,Status,Vehicle,Target Date',
      ...(data.dispatch?.table || []).map(d => `"${d.dispatchNo || ''}","${d.orderNo}","${d.customerName}","${d.productName}",${d.quantity},"${d.dispatchStatus}","${d.vehicleNumber || ''}","${d.targetDate}"`)
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlantHead_DailySummary_${data.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // ── SEARCH & FILTERED DATA LOGIC ──
  const q = searchQuery.trim().toLowerCase();

  // 1. Orders
  const filteredOrders = useMemo(() => {
    let list = data?.orders?.table || [];
    if (orderFilter === 'AWAITING') {
      list = list.filter(o => ['SENT_TO_PLANT_HEAD', 'SENT_TO_PLANT', 'PENDING_APPROVAL', 'SUBMITTED', 'PENDING'].includes(o.status));
    } else if (orderFilter === 'APPROVED') {
      list = list.filter(o => ['PLANT_APPROVED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION'].includes(o.status));
    } else if (orderFilter === 'OVERDUE') {
      list = list.filter(o => o.targetDate && o.targetDate !== 'N/A' && new Date(o.targetDate) < new Date());
    }
    if (q) {
      list = list.filter(o =>
        (o.orderNo || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.productName || '').toLowerCase().includes(q) ||
        (o.status || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data?.orders?.table, orderFilter, q]);

  // 2. Planning
  const filteredPlanning = useMemo(() => {
    let list = data?.planning?.table || [];
    if (planningFilter === 'DIRECT_FG') {
      list = list.filter(p => p.produce === 0 || p.canDirectFulfill);
    } else if (planningFilter === 'PRODUCE') {
      list = list.filter(p => p.produce > 0);
    }
    if (q) {
      list = list.filter(p =>
        (p.orderNo || '').toLowerCase().includes(q) ||
        (p.customerName || '').toLowerCase().includes(q) ||
        (p.productName || '').toLowerCase().includes(q) ||
        (p.status || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data?.planning?.table, planningFilter, q]);

  // 3. Material Requests
  const filteredMRs = useMemo(() => {
    let list = data?.materialRequests?.table || [];
    if (mrFilter === 'SHORTAGE') {
      list = list.filter(m => m.isShortage);
    } else if (mrFilter === 'PENDING') {
      list = list.filter(m => m.status === 'PENDING_PLANT_HEAD_APPROVAL' || m.status === 'PENDING');
    }
    if (q) {
      list = list.filter(m =>
        (m.mrNo || '').toLowerCase().includes(q) ||
        (m.workOrderNo || '').toLowerCase().includes(q) ||
        (m.materialName || '').toLowerCase().includes(q) ||
        (m.status || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data?.materialRequests?.table, mrFilter, q]);

  // 4. QC Failures
  const filteredQC = useMemo(() => {
    let list = data?.qc?.failureTable || [];
    if (qcFilter === 'FAILED') {
      list = list.filter(qItem => qItem.decision === 'FAILED');
    } else if (qcFilter === 'REWORK') {
      list = list.filter(qItem => qItem.decision === 'REWORK');
    }
    if (q) {
      list = list.filter(qItem =>
        (qItem.workOrderNo || '').toLowerCase().includes(q) ||
        (qItem.productName || '').toLowerCase().includes(q) ||
        (qItem.batchNo || '').toLowerCase().includes(q) ||
        (qItem.reason || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data?.qc?.failureTable, qcFilter, q]);

  // 5. Dispatches
  const filteredDispatches = useMemo(() => {
    let list = data?.dispatch?.table || [];
    if (dispatchFilter === 'DELAYED') {
      list = list.filter(d => d.isDelayed || d.dispatchStatus === 'DELAYED');
    } else if (dispatchFilter === 'TRANSIT') {
      list = list.filter(d => ['IN_TRANSIT', 'DISPATCHED', 'OUT_FOR_DELIVERY'].includes(d.dispatchStatus));
    } else if (dispatchFilter === 'READY') {
      list = list.filter(d => ['READY_FOR_PICKUP', 'DISPATCH_APPROVED'].includes(d.dispatchStatus));
    }
    if (q) {
      list = list.filter(d =>
        (d.dispatchNo || '').toLowerCase().includes(q) ||
        (d.orderNo || '').toLowerCase().includes(q) ||
        (d.customerName || '').toLowerCase().includes(q) ||
        (d.productName || '').toLowerCase().includes(q) ||
        (d.dispatchStatus || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data?.dispatch?.table, dispatchFilter, q]);

  // Dynamic Plant Head Signature info
  const effectivePlantHeadName = data?.plantHeadName || user?.name || 'Authorized Plant Head';
  const effectiveDesignation = data?.plantHeadDesignation || 'Plant Head';

  return (
    <div style={{ padding: isMobile ? '12px' : '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: '#0f172a', width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>

      {/* ── STICKY TOP SUMMARY BAR ON SCROLL ── */}
      {isStickyVisible && (
        <div style={{ position: 'fixed', top: '0', left: '0', right: '0', zIndex: 9999, background: '#0f172a', color: '#ffffff', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', borderBottom: '2px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '900', flexShrink: 0 }}>
            <LayoutDashboard size={16} color="#38bdf8" /> Plant Head Command
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>({data?.date})</span>
          </div>
          <div className="erp-tab-scroll-bar" style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px', fontWeight: '700', overflowX: 'auto', WebkitOverflowScrolling: 'touch', minWidth: 0 }}>
            <button onClick={() => scrollToAnchor('incoming-orders')} style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', fontWeight: '700' }}>
              Orders: <strong style={{ color: '#fff' }}>{data?.mainKpis?.incomingOrders || 0}</strong>
            </button>
            <span style={{ opacity: 0.3 }}>|</span>
            <button onClick={() => scrollToAnchor('planning')} style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', fontWeight: '700' }}>
              Planning: <strong style={{ color: '#fff' }}>{data?.mainKpis?.pendingPlanning || 0}</strong>
            </button>
            <span style={{ opacity: 0.3 }}>|</span>
            <button onClick={() => scrollToAnchor('production')} style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', fontWeight: '700' }}>
              Production: <strong style={{ color: '#fff' }}>{data?.mainKpis?.activeProduction || 0}</strong>
            </button>
            <span style={{ opacity: 0.3 }}>|</span>
            <button onClick={() => scrollToAnchor('material-requests')} style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', fontWeight: '700' }}>
              MRs: <strong style={{ color: '#fff' }}>{data?.mainKpis?.materialRequests || 0}</strong>
              {(data?.mainKpis?.materialShortages || 0) > 0 && <span style={{ marginLeft: '4px', color: '#f87171' }}>({data?.mainKpis?.materialShortages} Short)</span>}
            </button>
            <span style={{ opacity: 0.3 }}>|</span>
            <button onClick={() => scrollToAnchor('qc-summary')} style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', fontWeight: '700' }}>
              QC: <strong style={{ color: '#fff' }}>{data?.mainKpis?.qcPending || 0}</strong>
            </button>
            <span style={{ opacity: 0.3 }}>|</span>
            <button onClick={() => scrollToAnchor('dispatch')} style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', fontWeight: '700' }}>
              Dispatch: <strong style={{ color: '#fff' }}>{data?.mainKpis?.readyDispatch || 0}</strong>
            </button>
            <span style={{ opacity: 0.3 }}>|</span>
            <button onClick={() => scrollToAnchor('attention-required')} style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: '800' }}>
              Alerts: <strong style={{ color: '#ef4444' }}>{data?.mainKpis?.criticalAlerts || 0}</strong>
            </button>
          </div>
        </div>
      )}

      {/* ── PAGE HEADER & DYNAMIC DATE TOOLBAR ── */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '0', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '10px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
              <LayoutDashboard size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Plant Head Daily Summary</h1>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                  LIVE OPS
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '12.5px', color: '#64748b', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>📅 {data?.formattedDate || data?.date || new Date().toISOString().slice(0, 10)}</span>
                <span>•</span>
                <span>⏱️ Sync: {data?.lastUpdated || new Date().toLocaleTimeString('en-IN')}</span>
                <span>•</span>
                <span>👤 Plant Head: <strong style={{ color: '#0284c7' }}>{effectivePlantHeadName}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Controls: Day Stepper, Fast Selectors, Auto-refresh, Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          
          {/* Day-by-Day Stepper */}
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '3px' }}>
            <button
              onClick={handlePrevDay}
              title="Previous Day"
              style={{ background: 'transparent', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '11.5px', fontWeight: '800', padding: '0 6px', color: '#334155' }}>
              {selectedDate === 'today' ? 'Today' : selectedDate === 'yesterday' ? 'Yesterday' : customDate || data?.date}
            </span>
            <button
              onClick={handleNextDay}
              disabled={isSelectedToday}
              title="Next Day"
              style={{ background: 'transparent', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: isSelectedToday ? 'not-allowed' : 'pointer', color: isSelectedToday ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Date Buttons */}
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '4px', border: '1px solid #cbd5e1', display: 'flex', gap: '4px', width: isMobile ? '100%' : 'auto' }}>
            <button onClick={() => { setSelectedDate('today'); setCustomDate(''); }} style={{ flex: isMobile ? 1 : 'none', background: selectedDate === 'today' ? '#0284c7' : 'transparent', color: selectedDate === 'today' ? '#fff' : '#475569', border: 'none', padding: isMobile ? '6px 8px' : '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}>Today</button>
            <button onClick={() => { setSelectedDate('yesterday'); setCustomDate(''); }} style={{ flex: isMobile ? 1 : 'none', background: selectedDate === 'yesterday' ? '#0284c7' : 'transparent', color: selectedDate === 'yesterday' ? '#fff' : '#475569', border: 'none', padding: isMobile ? '6px 8px' : '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}>Yesterday</button>
            <button onClick={() => setSelectedDate('custom')} style={{ flex: isMobile ? 1 : 'none', background: selectedDate === 'custom' ? '#0284c7' : 'transparent', color: selectedDate === 'custom' ? '#fff' : '#475569', border: 'none', padding: isMobile ? '6px 8px' : '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}>Select Date</button>
          </div>

          {selectedDate === 'custom' && (
            <input
              type="date"
              value={customDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setCustomDate(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', width: isMobile ? '100%' : 'auto', background: '#fff' }}
            />
          )}

          {/* Auto Refresh Interval Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '9px', border: '1px solid #cbd5e1', padding: '4px 8px', fontSize: '12px' }}>
            <span style={{ color: '#64748b', fontWeight: '700', marginRight: '4px' }}>Auto-Sync:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: '800', color: '#0284c7', outline: 'none', cursor: 'pointer' }}
            >
              <option value="off">Off</option>
              <option value="30">30s</option>
              <option value="60">60s</option>
            </select>
          </div>

          {/* Refresh Action */}
          <button onClick={fetchDailySummary} disabled={loading} style={{ flex: isMobile ? 1 : 'none', justifyContent: 'center', background: '#ffffff', color: '#0284c7', border: '1.5px solid #cbd5e1', padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: '9px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Refresh'}
          </button>

          {/* Executive Report Generator */}
          <button onClick={() => setShowReportModal(true)} style={{ flex: isMobile ? '1 1 100%' : 'none', justifyContent: 'center', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', padding: isMobile ? '6px 12px' : '8px 16px', borderRadius: '9px', fontSize: '12.5px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 10px rgba(2, 132, 199, 0.3)' }}>
            <FileText size={16} /> Generate Report
          </button>

          {/* Export Excel */}
          <button onClick={handleExportExcel} style={{ flex: isMobile ? '1 1 100%' : 'none', justifyContent: 'center', background: '#10b981', color: '#fff', border: 'none', padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: '9px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSpreadsheet size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── ROW 1 — MAIN KPI CARDS (8 High-Precision KPI Cards) ── */}
      <div className="erp-kpi-grid" style={{ marginBottom: '16px' }}>
        {[
          {
            label: 'Incoming Orders',
            count: data?.mainKpis?.awaitingPlantHead ?? 0,
            sub: (data?.orders?.receivedToday || 0) > 0
              ? `${data.orders.receivedToday} Received Today`
              : '0 Awaiting Action',
            color: '#0284c7',
            anchor: 'incoming-orders',
          },
          {
            label: 'Pending Planning',
            count: data?.planning?.pendingPlanning ?? 0,
            sub: (data?.planning?.fgDirectFulfillment || 0) > 0
              ? `${data.planning.fgDirectFulfillment} Direct FG Ready`
              : (data?.planning?.productionRequired || 0) > 0
                ? `${data.planning.productionRequired} Production Required`
                : '0 Pending Planning',
            color: '#f59e0b',
            anchor: 'planning',
          },
          { label: 'Active Production', count: data?.mainKpis?.activeProduction || 0, sub: `${data?.production?.completedToday || 0} Completed Today`, color: '#8b5cf6', anchor: 'production' },
          { label: 'Material Requests', count: data?.mainKpis?.materialRequests || 0, sub: `${data?.mainKpis?.materialShortages || 0} Shortage Alerts`, color: '#ec4899', anchor: 'material-requests' },
          { label: 'Pending Indents', count: data?.mainKpis?.pendingIndents || 0, sub: `${data?.indents?.indentApprovedToday || 0} Signed Today`, color: '#6366f1', anchor: 'purchase-indents' },
          { label: 'QC Pending', count: data?.mainKpis?.qcPending || 0, sub: `${data?.qc?.qcApprovedToday || 0} Approved Today`, color: '#06b6d4', anchor: 'qc-summary' },
          { label: 'Ready Dispatch', count: data?.mainKpis?.readyDispatch || 0, sub: `${data?.dispatch?.dispatchDeliveredToday || 0} Delivered Today`, color: '#10b981', anchor: 'dispatch' },
          { label: 'Critical Alerts', count: data?.mainKpis?.criticalAlerts || 0, sub: `${data?.mainKpis?.totalAlerts || 0} Total Actions`, color: '#ef4444', anchor: 'attention-required' },
        ].map((kpi, idx) => (
          <div key={idx} onClick={() => scrollToAnchor(kpi.anchor)} style={{ background: '#ffffff', borderRadius: '12px', padding: isMobile ? '8px 10px' : '12px 14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', borderLeft: `4px solid ${kpi.color}`, cursor: 'pointer', transition: 'transform 0.15s ease' }}>
            <div style={{ fontSize: isMobile ? '9px' : '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: '1.2' }}>{kpi.label}</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '900', color: kpi.color, marginTop: '2px' }}>{loading ? '...' : kpi.count}</div>
            <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#64748b', marginTop: '2px' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── REAL-TIME SEARCH & FAST DISCOVERY BAR ── */}
      <div style={{ background: '#ffffff', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
        <Search size={18} color="#64748b" />
        <input
          type="text"
          placeholder="Instant filter by Order No, Customer, Product, SKU, Work Order, or Status across all sections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── TODAY'S AUTOMATIC OPERATIONAL NARRATIVE ── */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: '13px', fontWeight: '900', color: '#1e40af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={16} /> Executive Operational Narrative
        </div>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#1e3a8a', lineHeight: '1.55', fontWeight: '600' }}>
          {data?.summaryText || 'Loading operational summary metrics...'}
        </p>
      </div>

      {/* ── SECTION: ATTENTION REQUIRED (HIGH VISIBILITY ALERTS) ── */}
      <div id="attention-required" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1.5px solid #fecaca', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#ef4444', color: '#fff', padding: '6px', borderRadius: '8px' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#991b1b', margin: 0 }}>Attention Required</h2>
              <div style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: '2px', fontWeight: '600' }}>Direct action bottlenecks and critical escalations</div>
            </div>
          </div>
          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '900' }}>
            {data?.attentionRequired?.length || 0} Action Items
          </span>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '480px', overflowY: 'auto' }}>
          {data?.attentionRequired && data.attentionRequired.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#fef2f2', borderBottom: '2px solid #fecaca', textTransform: 'uppercase', fontSize: '11px', color: '#991b1b' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', width: '12%' }}>Priority</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', width: '18%' }}>Type</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', width: '18%' }}>Reference Code</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Problem / Escalation</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', width: '14%' }}>Age / Urgency</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '12%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.attentionRequired.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #fee2e2' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: item.priority === 'CRITICAL' ? '#ef4444' : item.priority === 'HIGH' ? '#f59e0b' : '#3b82f6', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' }}>
                        {item.priority}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '800', color: '#1e293b' }}>{item.type}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0284c7' }}>{item.materialCode || item.reference || '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#991b1b', fontWeight: '700' }}>{item.problem}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b', fontWeight: '600' }}>{item.age}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button onClick={() => router.push(item.actionLink)} style={{ background: '#ffffff', border: '1.5px solid #ef4444', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Resolve <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#166534', fontWeight: '700', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              🎉 Excellent! No critical operational alerts or bottlenecks recorded for this date.
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION: PENDING MY APPROVAL (SINGLE APPROVAL INBOX) ── */}
      <div id="approval-inbox" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="#0284c7" />
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Pending Plant Head Approvals</h2>
          </div>
          <span style={{ background: '#0284c7', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '900' }}>
            {data?.approvalInbox?.total || 0} Total Pending Approvals
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {data?.approvalInbox?.items?.map((app, idx) => (
            <div key={idx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{app.type}</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: app.pending > 0 ? '#dc2626' : '#166534', marginTop: '2px' }}>{app.pending}</div>
              </div>
              <button onClick={() => router.push(app.link)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View <Eye size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 1 — INCOMING ORDERS ── */}
      <div id="incoming-orders" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📥 Incoming Sales Orders</h3>
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
              {filteredOrders.length} Records
            </span>
          </div>

          {/* Quick Filter Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'AWAITING', label: `Awaiting Approval (${data?.orders?.awaitingPlantHead || 0})` },
              { id: 'APPROVED', label: `Approved Today (${data?.orders?.approvedToday || 0})` },
              { id: 'OVERDUE', label: `Overdue (${data?.orders?.overdueOrders || 0})` },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setOrderFilter(f.id)}
                style={{
                  background: orderFilter === f.id ? '#0284c7' : '#f1f5f9',
                  color: orderFilter === f.id ? '#fff' : '#475569',
                  border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
            <button onClick={() => router.push('/plant-head/incoming-orders')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>View Full Module →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1' }}>Received Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7' }}>{data?.orders?.receivedToday || 0}</div>
          </div>
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b45309' }}>Awaiting Approval</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#d97706' }}>{data?.orders?.awaitingPlantHead || 0}</div>
          </div>
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>Approved Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{data?.orders?.approvedToday || 0}</div>
          </div>
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c' }}>Rejected Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>{data?.orders?.rejectedToday || 0}</div>
          </div>
          <div style={{ background: '#f3e8ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b21a8' }}>Pending Planning</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#9333ea' }}>{data?.planning?.pendingPlanning || 0}</div>
          </div>
          <div style={{ background: '#ffe4e6', border: '1px solid #fecdd3', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9f1239' }}>Overdue Orders</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#e11d48' }}>{data?.orders?.overdueOrders || 0}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Order No</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Target Date</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {(expandedTables.orders ? filteredOrders : filteredOrders.slice(0, 8)).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.orderNo}</td>
                  <td style={{ padding: '8px 10px', color: '#334155' }}>{row.customerName}</td>
                  <td style={{ padding: '8px 10px', color: '#334155' }}>{row.productName}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}>{row.quantity}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <span style={{ background: ['PLANT_APPROVED', 'COMPLETED'].includes(row.status) ? '#dcfce7' : ['CANCELLED', 'REJECTED'].includes(row.status) ? '#fee2e2' : '#e0f2fe', color: ['PLANT_APPROVED', 'COMPLETED'].includes(row.status) ? '#15803d' : ['CANCELLED', 'REJECTED'].includes(row.status) ? '#dc2626' : '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>{row.targetDate}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <button onClick={() => setInspectedItem({ type: 'Sales Order', title: row.orderNo, data: row, actionLink: '/plant-head/incoming-orders' })} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '700', color: '#0284c7' }}>
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No sales orders match the active filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > 8 && (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button onClick={() => toggleTableExpand('orders')} style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
              {expandedTables.orders ? '▲ Show Compact (8 Orders)' : `▼ Show All (${filteredOrders.length} Orders)`}
            </button>
          </div>
        )}
      </div>

      {/* ── SECTION 2 — PRODUCTION PLANNING & LIVE FG ALLOCATION ── */}
      <div id="planning" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📋 Production Planning & Allocation</h3>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '900' }}>
              {data?.planning?.fgDirectFulfillment || 0} Direct FG Fulfillable
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'DIRECT_FG', label: 'Direct FG Ready' },
              { id: 'PRODUCE', label: 'Manufacturing Needed' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setPlanningFilter(f.id)}
                style={{
                  background: planningFilter === f.id ? '#0284c7' : '#f1f5f9',
                  color: planningFilter === f.id ? '#fff' : '#475569',
                  border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
            <button onClick={() => router.push('/plant-head/planning')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>View Planning →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#c2410c' }}>Pending Planning</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#ea580c' }}>{data?.planning?.pendingPlanning || 0}</div>
          </div>
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1' }}>Plans Created Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7' }}>{data?.planning?.plansCreatedToday || 0}</div>
          </div>
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>FG Direct Fulfillment</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{data?.planning?.fgDirectFulfillment || 0}</div>
          </div>
          <div style={{ background: '#f3e8ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b21a8' }}>Scheduled Plans</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#9333ea' }}>{data?.planning?.scheduledPlans || 0}</div>
          </div>
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c' }}>Delayed Plans</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>{data?.planning?.delayedPlans || 0}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Order No</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Ordered</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>FG Available</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Reserved FG</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Produce Needed</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Fulfillment Decision</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {(expandedTables.planning ? filteredPlanning : filteredPlanning.slice(0, 8)).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.orderNo}</td>
                  <td style={{ padding: '8px 10px', color: '#334155' }}>{row.productName}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>{row.ordered}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a', fontWeight: '800' }}>{row.fgAvailable}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#ea580c', fontWeight: '700' }}>{row.reservedFg}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: row.produce === 0 ? '#16a34a' : '#8b5cf6' }}>{row.produce}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <span style={{ background: row.canDirectFulfill ? '#dcfce7' : '#fef3c7', color: row.canDirectFulfill ? '#15803d' : '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <button onClick={() => setInspectedItem({ type: 'Planning Order', title: row.orderNo, data: row, actionLink: '/plant-head/planning' })} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '700', color: '#0284c7' }}>
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPlanning.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No pending planning items match.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredPlanning.length > 8 && (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button onClick={() => toggleTableExpand('planning')} style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
              {expandedTables.planning ? '▲ Show Compact (8 Plans)' : `▼ Show All (${filteredPlanning.length} Plans)`}
            </button>
          </div>
        )}
      </div>

      {/* ── SECTION 3 — PRODUCTION STATUS & HORIZONTAL PIPELINE ── */}
      <div id="production" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>⚙️ Production Floor & Work Orders</h3>
          <button onClick={() => router.push('/plant-head/production-analytics')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View Floor Analytics →</button>
        </div>

        {/* Horizontal Workflow Line */}
        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #cbd5e1', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { step: 'Planning', count: data?.production?.pipeline?.planning || 0 },
            { step: 'WO Created', count: data?.production?.pipeline?.woCreated || 0 },
            { step: 'Running', count: data?.production?.pipeline?.running || 0 },
            { step: 'Completed', count: data?.production?.pipeline?.completed || 0 },
            { step: 'QC Pending', count: data?.production?.pipeline?.qcPending || 0 },
            { step: 'QC Approved', count: data?.production?.pipeline?.qcApproved || 0 },
            { step: 'FG Inventory', count: data?.production?.pipeline?.fg || 0 }
          ].map((pipe, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center', flex: 1, minWidth: '70px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>{pipe.step}</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7', marginTop: '2px' }}>{pipe.count}</div>
              </div>
              {i < arr.length - 1 && <span style={{ color: '#cbd5e1', fontWeight: '900' }}>→</span>}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1' }}>WO Created Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7' }}>{data?.production?.woCreatedToday || 0}</div>
          </div>
          <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b45309' }}>Production Running</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#d97706' }}>{data?.production?.prodRunning || 0}</div>
          </div>
          <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>Completed Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{data?.production?.completedToday || 0}</div>
          </div>
          <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c' }}>Delayed WOs</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>{data?.production?.prodDelayed || 0}</div>
          </div>
        </div>

        {/* Submitted Production Floor Daily Reports */}
        <div style={{ marginTop: '18px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '900', color: '#312e81' }}>🏭 Production Daily Shift Submissions</span>
              <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                {data?.productionDailyReports?.submittedCount || 0} Shift Logs
              </span>
            </div>
            <button onClick={() => router.push('/plant-head/daily-reports')} style={{ background: 'transparent', border: '1px solid #4338ca', color: '#4338ca', padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}>View All Shift Reports</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '10.5px' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Report No</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>Shift</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Supervisor</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>Sets</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>Covers</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>Frames</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>Total Wt (Kg)</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.productionDailyReports?.list && data.productionDailyReports.list.length > 0 ? (
                  data.productionDailyReports.list.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 8px', fontWeight: '800', color: '#4338ca' }}>{r.reportNo}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#475569', fontWeight: '700' }}>{r.shift}</td>
                      <td style={{ padding: '6px 8px', color: '#334155' }}>{r.supervisorName}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>{r.totalSets}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b' }}>{r.totalCovers}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b' }}>{r.totalFrames}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '800', color: '#0284c7' }}>{Number(r.totalWeight || 0).toLocaleString()}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <span style={{ background: r.status === 'APPROVED' ? '#dcfce7' : (r.status === 'SUBMITTED' ? '#e0f2fe' : '#fef3c7'), color: r.status === 'APPROVED' ? '#15803d' : (r.status === 'SUBMITTED' ? '#0369a1' : '#b45309'), padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800' }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={8} style={{ padding: '12px', textAlign: 'center', color: '#94a3b8' }}>No production daily reports submitted for this date.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── SECTION 4 — MATERIAL REQUESTS (LIVE SHORTAGES HIGHLIGHTED) ── */}
      <div id="material-requests" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📦 Material Requests & Shortages</h3>
            <span style={{ background: (data?.materialRequests?.mrMaterialShortage || 0) > 0 ? '#fee2e2' : '#f0fdf4', color: (data?.materialRequests?.mrMaterialShortage || 0) > 0 ? '#dc2626' : '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
              {data?.materialRequests?.mrMaterialShortage || 0} Stock Shortages
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All Requests' },
              { id: 'SHORTAGE', label: `Shortages (${data?.materialRequests?.mrMaterialShortage || 0})` },
              { id: 'PENDING', label: `Pending (${data?.materialRequests?.mrPendingApproval || 0})` },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setMrFilter(f.id)}
                style={{
                  background: mrFilter === f.id ? '#0284c7' : '#f1f5f9',
                  color: mrFilter === f.id ? '#fff' : '#475569',
                  border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
            <button onClick={() => router.push('/plant-head/material-approvals')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Manage MRs →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1' }}>Created Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7' }}>{data?.materialRequests?.mrCreatedToday || 0}</div>
          </div>
          <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b45309' }}>Pending Approval</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#d97706' }}>{data?.materialRequests?.mrPendingApproval || 0}</div>
          </div>
          <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>Approved Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{data?.materialRequests?.mrApprovedToday || 0}</div>
          </div>
          <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c' }}>Material Shortage</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>{data?.materialRequests?.mrMaterialShortage || 0}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>MR No</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Work Order</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Material Requested</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Requested</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Warehouse Available</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status / Deficit</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {(expandedTables.materialRequests ? filteredMRs : filteredMRs.slice(0, 8)).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: row.isShortage ? '#fef2f2' : 'transparent' }}>
                  <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.mrNo}</td>
                  <td style={{ padding: '8px 10px', color: '#334155' }}>{row.workOrderNo}</td>
                  <td style={{ padding: '8px 10px', fontWeight: '700', color: '#1e293b' }}>{row.materialName}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}>{row.requested}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: row.isShortage ? '#dc2626' : '#16a34a', fontWeight: '800' }}>{row.available}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <span style={{ background: row.isShortage ? '#ef4444' : '#dcfce7', color: row.isShortage ? '#fff' : '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>
                      {row.isShortage ? `SHORTAGE (-${row.shortageQty})` : row.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <button onClick={() => setInspectedItem({ type: 'Material Request', title: row.mrNo, data: row, actionLink: '/plant-head/material-approvals' })} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '700', color: '#0284c7' }}>
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMRs.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No material requests match.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredMRs.length > 8 && (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button onClick={() => toggleTableExpand('materialRequests')} style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
              {expandedTables.materialRequests ? '▲ Show Compact (8 MRs)' : `▼ Show All (${filteredMRs.length} MRs)`}
            </button>
          </div>
        )}
      </div>

      {/* ── SECTION 5 — INDENT APPROVALS (COLLAPSIBLE) ── */}
      <div id="purchase-indents" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('indents')}>
            {collapsedSections.indents ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📝 Purchase / Material Indents</h3>
            <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
              {data?.indents?.table?.length || 0} Total Indents
            </span>
          </div>
          <button onClick={() => router.push('/plant-head/indent-approvals')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>Manage Indents →</button>
        </div>

        {!collapsedSections.indents && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1' }}>New Today</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7' }}>{data?.indents?.indentNewToday || 0}</div>
              </div>
              <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#b45309' }}>Pending Plant Head</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#d97706' }}>{data?.indents?.indentPendingPlantHead || 0}</div>
              </div>
              <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>Approved Today</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{data?.indents?.indentApprovedToday || 0}</div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Indent No</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Material</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Requested By</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Stage</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.indents?.table && data.indents.table.length > 0 ? (
                    data.indents.table.slice(0, 15).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.indentNo}</td>
                        <td style={{ padding: '8px 10px', color: '#1e293b' }}>{row.materialName}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}>{row.quantity}</td>
                        <td style={{ padding: '8px 10px', color: '#475569' }}>{row.requestedBy}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>{row.currentStage}</span></td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>{row.age}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No purchase indents recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 6 — RAW MATERIAL INVENTORY (CRITICAL REGISTRY) ── */}
      <div id="raw-inventory" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('rawInventory')}>
            {collapsedSections.rawInventory ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>🏭 Raw Material Inventory (Critical Registry)</h3>
            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
              {data?.rawInventory?.outOfStock || 0} Out of Stock
            </span>
          </div>
          <button onClick={() => router.push('/plant-head/raw-inventory')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View Inventory Registry →</button>
        </div>

        {!collapsedSections.rawInventory && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Total SKUs</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{data?.rawInventory?.totalMaterials || 0}</div>
              </div>
              <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>In Stock</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{data?.rawInventory?.inStock || 0}</div>
              </div>
              <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#b45309' }}>Low Stock</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#d97706' }}>{data?.rawInventory?.lowStock || 0}</div>
              </div>
              <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c' }}>Out of Stock</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>{data?.rawInventory?.outOfStock || 0}</div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '480px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>SKU Code</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Material Name</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Live Available</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Minimum Threshold</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Stock Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.rawInventory?.criticalTable && data.rawInventory.criticalTable.length > 0 ? (
                    data.rawInventory.criticalTable.slice(0, 30).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.code}</td>
                        <td style={{ padding: '8px 10px', color: '#1e293b', fontWeight: '700' }}>{row.materialName}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: row.available <= 0 ? '#dc2626' : '#ea580c' }}>{row.available}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#64748b' }}>{row.minimum}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span style={{ background: row.status === 'Out of Stock' ? '#ef4444' : '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>{row.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#166534', background: '#f0fdf4' }}>All warehouse raw materials are at optimal stock levels.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 7 — FINISHED GOODS STOCK ── */}
      <div id="finished-goods" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('finishedGoods')}>
            {collapsedSections.finishedGoods ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>✨ Finished Goods Stock</h3>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
              {data?.finishedGoods?.availableFgQty || 0} Total Available
            </span>
          </div>
          <button onClick={() => router.push('/plant-head/finished-goods')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View Finished Goods →</button>
        </div>

        {!collapsedSections.finishedGoods && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1' }}>Total FG Products</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7' }}>{data?.finishedGoods?.totalFgProducts || 0}</div>
              </div>
              <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>Available Qty</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{data?.finishedGoods?.availableFgQty || 0}</div>
              </div>
              <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#c2410c' }}>Reserved Qty</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#ea580c' }}>{data?.finishedGoods?.reservedFgQty || 0}</div>
              </div>
              <div style={{ background: '#f3e8ff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b21a8' }}>Produced Today</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#9333ea' }}>{data?.finishedGoods?.producedFgToday || 0}</div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Product Name</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Available Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Reserved Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Produced Today</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Dispatched Today</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.finishedGoods?.table && data.finishedGoods.table.length > 0 ? (
                    data.finishedGoods.table.slice(0, 15).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '800', color: '#1e293b' }}>{row.productName}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#16a34a' }}>{row.available}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#ea580c', fontWeight: '700' }}>{row.reserved}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#0284c7', fontWeight: '700' }}>{row.producedToday}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#8b5cf6', fontWeight: '700' }}>{row.dispatchToday}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No finished goods records.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 8 — QUALITY CONTROL & REJECTIONS ── */}
      <div id="qc-summary" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>🛡️ Quality Control & Failure Decisions</h3>
            <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
              {data?.qc?.qcDecisionPending || 0} Requiring Action
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All Inspections' },
              { id: 'FAILED', label: 'Scrap / Failed' },
              { id: 'REWORK', label: 'Rework' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setQcFilter(f.id)}
                style={{
                  background: qcFilter === f.id ? '#0284c7' : '#f1f5f9',
                  color: qcFilter === f.id ? '#fff' : '#475569',
                  border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
            <button onClick={() => router.push('/plant-head/qc-failures')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Manage QC →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1' }}>QC Pending</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7' }}>{data?.qc?.qcPending || 0}</div>
          </div>
          <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>Approved Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{data?.qc?.qcApprovedToday || 0}</div>
          </div>
          <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c' }}>Failed Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>{data?.qc?.qcFailedToday || 0}</div>
          </div>
          <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#c2410c' }}>Decision Pending</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#ea580c' }}>{data?.qc?.qcDecisionPending || 0}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Work Order</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Batch Ref</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Failed Qty</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Rejection Reason</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Decision</th>
              </tr>
            </thead>
            <tbody>
              {filteredQC.length > 0 ? (
                filteredQC.slice(0, 10).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.workOrderNo}</td>
                    <td style={{ padding: '8px 10px', color: '#1e293b' }}>{row.productName}</td>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{row.batchNo}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: '#dc2626' }}>{row.failedQty}</td>
                    <td style={{ padding: '8px 10px', color: '#991b1b', fontWeight: '700' }}>{row.reason}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ background: row.decision === 'FAILED' ? '#fee2e2' : '#fef3c7', color: row.decision === 'FAILED' ? '#991b1b' : '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                        {row.decision}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#166534', background: '#f0fdf4' }}>No quality rejections recorded for this date.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 9 — DISPATCH & LOGISTICS (REAL PRODUCTS & ACCURATE DELAYS) ── */}
      <div id="dispatch" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>🚚 Dispatch & Logistics</h3>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
              {data?.dispatch?.dispatchReady || 0} Ready to Ship
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All Dispatches' },
              { id: 'DELAYED', label: `Delayed (${data?.dispatch?.dispatchDelayed || 0})` },
              { id: 'TRANSIT', label: `In Transit (${data?.dispatch?.dispatchInTransit || 0})` },
              { id: 'READY', label: `Ready (${data?.dispatch?.dispatchReady || 0})` },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDispatchFilter(f.id)}
                style={{
                  background: dispatchFilter === f.id ? '#0284c7' : '#f1f5f9',
                  color: dispatchFilter === f.id ? '#fff' : '#475569',
                  border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
            <button onClick={() => router.push('/plant-head/dispatch-analytics')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Logistics Overview →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>Ready Dispatch</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{data?.dispatch?.dispatchReady || 0}</div>
          </div>
          <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1' }}>In Transit</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7' }}>{data?.dispatch?.dispatchInTransit || 0}</div>
          </div>
          <div style={{ background: '#f3e8ff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b21a8' }}>Delivered Today</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#9333ea' }}>{data?.dispatch?.dispatchDeliveredToday || 0}</div>
          </div>
          <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c' }}>Delayed Consignments</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>{data?.dispatch?.dispatchDelayed || 0}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Dispatch No</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Order No</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Consignment Items</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Qty / Wt</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Vehicle</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Target</th>
              </tr>
            </thead>
            <tbody>
              {(expandedTables.dispatch ? filteredDispatches : filteredDispatches.slice(0, 8)).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.dispatchNo}</td>
                  <td style={{ padding: '8px 10px', color: '#334155', fontWeight: '700' }}>{row.orderNo}</td>
                  <td style={{ padding: '8px 10px', color: '#1e293b' }}>{row.customerName}</td>
                  <td style={{ padding: '8px 10px', color: '#475569' }}>{row.productName}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}>{row.quantity}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>{row.vehicleNumber}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <span style={{ background: row.isDelayed ? '#fee2e2' : row.dispatchStatus === 'DELIVERED' ? '#dcfce7' : '#e0f2fe', color: row.isDelayed ? '#dc2626' : row.dispatchStatus === 'DELIVERED' ? '#15803d' : '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                      {row.isDelayed ? 'DELAYED' : row.dispatchStatus}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>{row.targetDate}</td>
                </tr>
              ))}
              {filteredDispatches.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No dispatch consignments match the active filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredDispatches.length > 8 && (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button onClick={() => toggleTableExpand('dispatch')} style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
              {expandedTables.dispatch ? '▲ Show Compact (8 Dispatches)' : `▼ Show All (${filteredDispatches.length} Dispatches)`}
            </button>
          </div>
        )}
      </div>

      {/* ── SECTION 10 & 11 — REPLACEMENTS & RETURNS (COLLAPSIBLE) ── */}
      <div id="replacements-returns" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('replacementsReturns')}>
            {collapsedSections.replacementsReturns ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>🔄 Replacements & Returns Overview</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => router.push('/plant-head/replacements')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}>Replacements</button>
            <button onClick={() => router.push('/plant-head/returns')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}>Returns</button>
          </div>
        </div>

        {!collapsedSections.replacementsReturns && (
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>Replacements Breakdown</h4>
              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Total Active Requests:</span> <strong style={{ color: '#0284c7' }}>{data?.replacements?.allReplacementsCount || 0}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Pending Approval:</span> <strong style={{ color: '#d97706' }}>{data?.replacements?.replacementPending || 0}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                <span>Approved:</span> <strong style={{ color: '#16a34a' }}>{data?.replacements?.replacementApproved || 0}</strong>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>Returns Breakdown</h4>
              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>New Returns Today:</span> <strong style={{ color: '#0284c7' }}>{data?.returns?.returnsNew || 0}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Pending Review:</span> <strong style={{ color: '#d97706' }}>{data?.returns?.returnsPending || 0}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                <span>Approved:</span> <strong style={{ color: '#16a34a' }}>{data?.returns?.returnsApproved || 0}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 12 — TODAY VS PREVIOUS DAY COMPARISON ── */}
      <div id="comparison" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('comparison')}>
            {collapsedSections.comparison ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📊 Target Date vs Previous Day Operational Comparison</h3>
          </div>
        </div>

        {!collapsedSections.comparison && (
          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>KPI Metric</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Target Date</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Previous Day</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Difference</th>
                </tr>
              </thead>
              <tbody>
                {data?.comparison && data.comparison.length > 0 ? (
                  data.comparison.map((comp, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '800', color: '#1e293b' }}>{comp.kpi}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', color: '#0284c7' }}>{comp.today}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>{comp.yesterday}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', color: comp.diff > 0 ? '#16a34a' : comp.diff < 0 ? '#dc2626' : '#64748b' }}>
                        {comp.diff > 0 ? `+${comp.diff}` : comp.diff}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No comparative data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SECTION 13 — TARGET DATE ACTIVITY TIMELINE ── */}
      <div id="activity-timeline" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('activity')}>
            {collapsedSections.activity ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>⏱️ Operational Activity Timeline</h3>
          </div>
        </div>

        {!collapsedSections.activity && (
          <div style={{ marginTop: '16px' }}>
            {data?.activityTimeline && data.activityTimeline.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.activityTimeline.map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', minWidth: '65px', textAlign: 'center' }}>
                      {act.time}
                    </span>
                    <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: '600' }}>
                      {act.description}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No activity records found for this date.</div>
            )}
          </div>
        )}
      </div>

      {/* ── INTERACTIVE ITEM INSPECTION MODAL ── */}
      {inspectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 11000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '560px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>
                  {inspectedItem.type}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{inspectedItem.title}</h3>
              </div>
              <button onClick={() => setInspectedItem(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '20px' }}>
              {Object.entries(inspectedItem.data || {}).filter(([k]) => k !== 'id').map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b', fontWeight: '700', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}:</span>
                  <span style={{ color: '#0f172a', fontWeight: '800' }}>{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v || '—')}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setInspectedItem(null)} style={{ background: '#f1f5f9', color: '#475569', border: '1.5px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' }}>
                Close
              </button>
              {inspectedItem.actionLink && (
                <button onClick={() => router.push(inspectedItem.actionLink)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Open Full Module <ExternalLink size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── OFFICIAL PLANT HEAD DAILY EXECUTIVE REPORT MODAL (DYNAMIC SIGN-OFF & PRINT READY) ── */}
      {showReportModal && (
        <div className="report-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', padding: isMobile ? '10px 8px' : '24px 16px' }}>
          
          <style>{`
            #report-document-card, #report-document-card * {
              box-sizing: border-box !important;
            }
            #report-document-card {
              width: 100% !important;
              max-width: 960px !important;
              background: #ffffff !important;
              padding: 36px;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              color: #0f172a !important;
              border-radius: 16px;
              box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);
              border: 1px solid #cbd5e1;
              position: relative;
            }
            #report-document-card table.report-table {
              display: table !important;
              width: 100% !important;
              border-collapse: collapse !important;
              margin-bottom: 0 !important;
            }
            #report-document-card table.report-table tr {
              display: table-row !important;
            }
            #report-document-card table.report-table td,
            #report-document-card table.report-table th {
              display: table-cell !important;
              vertical-align: middle !important;
            }

            @media (max-width: 768px) {
              #report-document-card {
                padding: 16px 12px !important;
                border-radius: 12px !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
              }
              .report-header-flex {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              .report-header-right {
                text-align: left !important;
              }
            }

            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body * {
                visibility: hidden !important;
              }
              .printable-report-modal, .printable-report-modal * {
                visibility: visible !important;
              }
              .printable-report-modal {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                padding: 10px !important;
                margin: 0 !important;
                background: #ffffff !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div id="report-document-card" className="printable-report-modal" style={{ background: '#ffffff', borderRadius: isMobile ? '12px' : '16px', width: '100%', maxWidth: '960px', padding: isMobile ? '16px 12px' : '36px', margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid #cbd5e1', position: 'relative', boxSizing: 'border-box' }}>
            
            {/* Modal Actions Header */}
            <div className="no-print report-actions-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '16px' : '24px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '14px' : '16px', fontWeight: '900', color: '#0284c7' }}>
                <FileText size={20} /> Generated Plant Head Daily Operational Report
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handlePrint} style={{ background: '#f1f5f9', color: '#334155', border: '1.5px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={14} /> Print
                </button>
                <button onClick={handleDownloadImage} disabled={downloadingImage} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}>
                  <Download size={15} /> {downloadingImage ? 'Generating...' : 'Download Image'}
                </button>
                <button onClick={() => setShowReportModal(false)} style={{ background: '#f1f5f9', color: '#475569', border: '1.5px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>

            {/* Official Report Header */}
            <div className="report-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #0f172a', paddingBottom: '14px', marginBottom: '18px', gap: '10px' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: '1.3' }}>Himalaya ERP — Plant Operations</h1>
                <h2 style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '800', color: '#0284c7', margin: '4px 0 0 0', lineHeight: '1.3' }}>PLANT HEAD DAILY EXECUTIVE SUMMARY REPORT</h2>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>Facility: Main Manufacturing Unit (COMP-001)</div>
              </div>
              <div className="report-header-right" style={{ textAlign: isMobile ? 'left' : 'right', fontSize: '11.5px', color: '#334155', flexShrink: 0 }}>
                <div><strong>Report Target Date:</strong> {data?.formattedDate || data?.date}</div>
                <div style={{ marginTop: '2px' }}><strong>Verified At:</strong> {data?.lastUpdated}</div>
                <div style={{ marginTop: '4px' }}><span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900' }}>✓ OFFICIAL ERP VERIFIED</span></div>
              </div>
            </div>

            {/* Executive Operational Narrative Brief */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>📌 Executive Operational Brief</div>
              <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.55', fontWeight: '600' }}>
                {data?.summaryText}
              </div>
            </div>

            {/* 1. Key Performance Indicators (Grid) */}
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '12.5px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '6px', borderLeft: '4px solid #0284c7', paddingLeft: '8px' }}>1. Key Performance Indicators</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(8, 1fr)', gap: '6px', textAlign: 'center' }}>
                {[
                  { label: 'Incoming', val: data?.mainKpis?.incomingOrders || 0, color: '#0284c7' },
                  { label: 'Planning', val: data?.mainKpis?.pendingPlanning || 0, color: '#ea580c' },
                  { label: 'Production', val: data?.mainKpis?.activeProduction || 0, color: '#8b5cf6' },
                  { label: 'MR Pending', val: data?.materialRequests?.mrPendingApproval || 0, color: '#ec4899' },
                  { label: 'Indents', val: data?.indents?.indentPendingPlantHead || 0, color: '#6366f1' },
                  { label: 'QC Pending', val: data?.qc?.qcPending || 0, color: '#06b6d4' },
                  { label: 'Dispatch', val: data?.dispatch?.dispatchReady || 0, color: '#16a34a' },
                  { label: 'Alerts', val: data?.mainKpis?.criticalAlerts || 0, color: '#dc2626' },
                ].map((kpi, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 4px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', lineHeight: '1.2' }}>{kpi.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: kpi.color }}>{kpi.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Critical Operational Alerts & Bottlenecks */}
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '12.5px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '6px', borderLeft: '4px solid #ef4444', paddingLeft: '8px' }}>2. Critical Operational Alerts & Bottlenecks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data?.attentionRequired && data.attentionRequired.length > 0 ? (
                  data.attentionRequired.map((att, i) => (
                    <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 12px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: isMobile ? 'flex-start' : 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ background: att.priority === 'CRITICAL' ? '#dc2626' : '#d97706', color: '#fff', fontSize: '9.5px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px' }}>{att.priority}</span>
                        <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#1e293b' }}>{att.type}</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: '700' }}>{att.materialCode || att.reference || '—'}</div>
                      <div style={{ fontSize: '11.5px', color: '#991b1b', fontWeight: '700' }}>{att.problem}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '10px', textAlign: 'center', color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>No critical operational alerts recorded for this period.</div>
                )}
              </div>
            </div>

            {/* 3. Departmental Output Summary */}
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '12.5px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '6px', borderLeft: '4px solid #10b981', paddingLeft: '8px' }}>3. Departmental Output Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '8px' }}>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '11.5px', marginBottom: '6px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>Sales Orders & Planning</div>
                  <div style={{ lineHeight: '1.6', color: '#334155', fontSize: '11px' }}>
                    • Received: <strong>{data?.orders?.receivedToday || 0}</strong><br />
                    • Approved: <strong>{data?.orders?.approvedToday || 0}</strong><br />
                    • Direct FG Fulfilled: <strong>{data?.planning?.fgDirectFulfillment || 0}</strong>
                  </div>
                </div>
                <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '11.5px', marginBottom: '6px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>Production Floor & QC</div>
                  <div style={{ lineHeight: '1.6', color: '#334155', fontSize: '11px' }}>
                    • Running Work Orders: <strong>{data?.production?.prodRunning || 0}</strong><br />
                    • Completed Today: <strong>{data?.production?.completedToday || 0}</strong><br />
                    • QC Failures: <strong>{data?.qc?.qcFailedToday || 0}</strong>
                  </div>
                </div>
                <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '11.5px', marginBottom: '6px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>Stores & Inventory</div>
                  <div style={{ lineHeight: '1.6', color: '#334155', fontSize: '11px' }}>
                    • Material Requests Approved: <strong>{data?.materialRequests?.mrApprovedToday || 0}</strong><br />
                    • Stock Shortages: <strong>{data?.materialRequests?.mrMaterialShortage || 0}</strong><br />
                    • Purchase Indents Pending: <strong>{data?.indents?.indentPendingPlantHead || 0}</strong>
                  </div>
                </div>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '11.5px', marginBottom: '6px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>Dispatch & Logistics</div>
                  <div style={{ lineHeight: '1.6', color: '#334155', fontSize: '11px' }}>
                    • Ready Dispatch: <strong>{data?.dispatch?.dispatchReady || 0}</strong><br />
                    • In Transit: <strong>{data?.dispatch?.dispatchInTransit || 0}</strong><br />
                    • Delivered Today: <strong>{data?.dispatch?.dispatchDeliveredToday || 0}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Plant Sign-off & Verification (Dynamic Authority Stamp) */}
            <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Generated dynamically via Himalaya ERP Command Suite. Validated against floor transactions.
              </div>
              <div style={{ textAlign: 'right', borderTop: '2px solid #0f172a', paddingTop: '6px', minWidth: '200px' }}>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {effectivePlantHeadName}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
                  {effectiveDesignation}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PlantHeadDailySummary;
