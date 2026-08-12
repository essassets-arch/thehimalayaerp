'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, Calendar, RefreshCw, Download, Printer, AlertTriangle,
  CheckCircle, Clock, Package, Truck, ShieldAlert, FileText, ArrowUpRight,
  ChevronDown, ChevronUp, Layers, Activity, FileSpreadsheet, Eye, UserCheck
} from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import { useRouter } from 'next/navigation';

export const PlantHeadDailySummary = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);

  const handleDownloadImage = async () => {
    setDownloadingImage(true);
    try {
      const element = document.getElementById('report-document-card');
      if (!element) {
        setDownloadingImage(false);
        return;
      }

      const fileName = `PlantHead_Executive_Report_${data?.date || new Date().toISOString().slice(0, 10)}.png`;

      // Strategy 1: html-to-image (Native Tailwind v4 oklch color & canvas taint support)
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

      // Strategy 2: html2canvas with oklch sanitizer
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
          const link = document.createElement('a');
          link.download = fileName;
          link.href = imageUri;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => document.body.removeChild(link), 100);
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

  // Section Collapse state
  const [collapsedSections, setCollapsedSections] = useState({
    indents: true,
    rawInventory: true,
    finishedGoods: true,
    replacementsReturns: true,
    activity: false,
    comparison: false
  });

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

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

  const handleExportExcel = () => {
    if (!data) return;
    const lines = [
      'PLANT HEAD DAILY SUMMARY REPORT',
      `Date: ${data.date}`,
      `Last Updated: ${data.lastUpdated}`,
      '',
      'MAIN KPIS',
      `Incoming Orders: ${data.mainKpis?.incomingOrders || 0}`,
      `Pending Planning: ${data.mainKpis?.pendingPlanning || 0}`,
      `Active Production: ${data.mainKpis?.activeProduction || 0}`,
      `Material Requests: ${data.mainKpis?.materialRequests || 0}`,
      `Pending Indents: ${data.mainKpis?.pendingIndents || 0}`,
      `QC Pending: ${data.mainKpis?.qcPending || 0}`,
      `Ready Dispatch: ${data.mainKpis?.readyDispatch || 0}`,
      `Critical Alerts: ${data.mainKpis?.criticalAlerts || 0}`,
      '',
      'TODAY SUMMARY',
      `"${data.summaryText}"`,
      '',
      'INCOMING ORDERS',
      'Order No,Customer,Product,Quantity,Status,Target Date',
      ...(data.orders?.table || []).map(o => `"${o.orderNo}","${o.customerName}","${o.productName}",${o.quantity},"${o.status}","${o.targetDate}"`),
      '',
      'PRODUCTION PLANNING',
      'Order No,Product,Ordered,FG Available,Reserved FG,Produce,Status',
      ...(data.planning?.table || []).map(p => `"${p.orderNo}","${p.productName}",${p.ordered},${p.fgAvailable},${p.reservedFg},${p.produce},"${p.status}"`),
      '',
      'QUALITY CONTROL FAILURES',
      'Work Order,Product,Batch,Failed Qty,Reason,Decision',
      ...(data.qc?.failureTable || []).map(q => `"${q.workOrderNo}","${q.productName}","${q.batchNo}",${q.failedQty},"${q.reason}","${q.decision}"`),
      '',
      'DISPATCH SUMMARY',
      'Order No,Customer,Product,Quantity,Status,Target Date',
      ...(data.dispatch?.table || []).map(d => `"${d.orderNo}","${d.customerName}","${d.productName}",${d.quantity},"${d.dispatchStatus}","${d.targetDate}"`)
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

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>

      {/* ── STICKY TOP SUMMARY BAR ON SCROLL ── */}
      {isStickyVisible && (
        <div style={{ position: 'fixed', top: '0', left: '0', right: '0', zIndex: 9999, background: '#0f172a', color: '#ffffff', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderBottom: '2px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '900' }}>
            <LayoutDashboard size={16} color="#38bdf8" /> Plant Head Command Summary
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px', fontWeight: '700' }}>
            <button onClick={() => scrollToAnchor('incoming-orders')} style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', fontWeight: '700' }}>
              Incoming: <strong style={{ color: '#fff' }}>{data?.mainKpis?.incomingOrders || 0}</strong>
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
              MR: <strong style={{ color: '#fff' }}>{data?.mainKpis?.materialRequests || 0}</strong>
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

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '10px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Plant Head Daily Summary</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12.5px', color: '#64748b' }}>
                <span>📅 {data?.date || new Date().toISOString().slice(0, 10)}</span>
                <span>•</span>
                <span>⏱️ {data?.lastUpdated || new Date().toLocaleTimeString('en-IN')}</span>
                <span>•</span>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>LIVE SNAPSHOT</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '4px', border: '1px solid #cbd5e1', display: 'flex', gap: '4px' }}>
            <button onClick={() => setSelectedDate('today')} style={{ background: selectedDate === 'today' ? '#0284c7' : 'transparent', color: selectedDate === 'today' ? '#fff' : '#475569', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>Today</button>
            <button onClick={() => setSelectedDate('yesterday')} style={{ background: selectedDate === 'yesterday' ? '#0284c7' : 'transparent', color: selectedDate === 'yesterday' ? '#fff' : '#475569', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>Yesterday</button>
            <button onClick={() => setSelectedDate('custom')} style={{ background: selectedDate === 'custom' ? '#0284c7' : 'transparent', color: selectedDate === 'custom' ? '#fff' : '#475569', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>Select Date</button>
          </div>

          {selectedDate === 'custom' && (
            <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
          )}

          <button onClick={fetchDailySummary} disabled={loading} style={{ background: '#ffffff', color: '#0284c7', border: '1.5px solid #cbd5e1', padding: '8px 14px', borderRadius: '9px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Refresh'}
          </button>

          <button onClick={() => setShowReportModal(true)} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '9px', fontSize: '12.5px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 10px rgba(2, 132, 199, 0.3)' }}>
            <FileText size={16} /> Generate Report
          </button>

          <button onClick={handleExportExcel} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '9px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSpreadsheet size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── ROW 1 — MAIN KPI CARDS (8 Compact Cards) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Incoming Orders', count: data?.mainKpis?.incomingOrders || 0, color: '#0284c7', anchor: 'incoming-orders' },
          { label: 'Pending Planning', count: data?.mainKpis?.pendingPlanning || 0, color: '#f59e0b', anchor: 'planning' },
          { label: 'Active Production', count: data?.mainKpis?.activeProduction || 0, color: '#8b5cf6', anchor: 'production' },
          { label: 'Material Requests', count: data?.mainKpis?.materialRequests || 0, color: '#ec4899', anchor: 'material-requests' },
          { label: 'Pending Indents', count: data?.mainKpis?.pendingIndents || 0, color: '#6366f1', anchor: 'purchase-indents' },
          { label: 'QC Pending', count: data?.mainKpis?.qcPending || 0, color: '#06b6d4', anchor: 'qc-summary' },
          { label: 'Ready Dispatch', count: data?.mainKpis?.readyDispatch || 0, color: '#10b981', anchor: 'dispatch' },
          { label: 'Critical Alerts', count: data?.mainKpis?.criticalAlerts || 0, color: '#ef4444', anchor: 'attention-required' },
        ].map((kpi, idx) => (
          <div key={idx} onClick={() => scrollToAnchor(kpi.anchor)} style={{ background: '#ffffff', borderRadius: '12px', padding: '12px 14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', borderLeft: `4px solid ${kpi.color}`, cursor: 'pointer', transition: 'transform 0.1s ease' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{kpi.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: kpi.color, marginTop: '2px' }}>{loading ? '...' : kpi.count}</div>
          </div>
        ))}
      </div>

      {/* ── TODAY'S AUTOMATIC SUMMARY TEXT ── */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: '13px', fontWeight: '900', color: '#1e40af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={16} /> Today's Plant Operational Summary
        </div>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#1e3a8a', lineHeight: '1.5', fontWeight: '600' }}>
          {data?.summaryText || 'Loading live operational summary statistics...'}
        </p>
      </div>

      {/* ── SECTION: ATTENTION REQUIRED (MOST VISIBLE) ── */}
      <div id="attention-required" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1.5px solid #fecaca', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#ef4444', color: '#fff', padding: '6px', borderRadius: '8px' }}>
              <AlertTriangle size={18} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#991b1b', margin: 0 }}>Attention Required</h2>
          </div>
          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '800' }}>
            {data?.attentionRequired?.length || 0} Action Items
          </span>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '480px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#fef2f2', borderBottom: '2px solid #fecaca', textTransform: 'uppercase', fontSize: '11px', color: '#991b1b' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Priority</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Material Code</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Problem</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Age / Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.attentionRequired && data.attentionRequired.length > 0 ? (
                data.attentionRequired.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #fecaca' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: item.priority === 'CRITICAL' ? '#ef4444' : item.priority === 'HIGH' ? '#f59e0b' : '#3b82f6', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '900' }}>
                        {item.priority}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '800', color: '#1e293b' }}>{item.type}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0284c7' }}>{item.materialCode || item.reference || '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#991b1b', fontWeight: '700' }}>{item.problem}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{item.age}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button onClick={() => router.push(item.actionLink)} style={{ background: '#ffffff', border: '1.5px solid #ef4444', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        View <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#166534', fontWeight: '700', background: '#f0fdf4' }}>
                    No critical operational alerts recorded today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION: PENDING MY APPROVAL (SINGLE APPROVAL INBOX) ── */}
      <div id="approval-inbox" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="#0284c7" />
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Pending My Approval</h2>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📥 Incoming Sales Orders</h3>
          <button onClick={() => router.push('/plant-head/incoming-orders')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View All</button>
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
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#9333ea' }}>{data?.orders?.pendingPlanning || 0}</div>
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
              </tr>
            </thead>
            <tbody>
              {data?.orders?.table && data.orders.table.length > 0 ? (
                data.orders.table.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.orderNo}</td>
                    <td style={{ padding: '8px 10px', color: '#334155' }}>{row.customerName}</td>
                    <td style={{ padding: '8px 10px', color: '#334155' }}>{row.productName}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}>{row.quantity}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>{row.status}</span></td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>{row.targetDate}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No incoming orders recorded today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 2 — PRODUCTION PLANNING ── */}
      <div id="planning" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📋 Production Planning & Allocation</h3>
          <button onClick={() => router.push('/plant-head/planning')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View All</button>
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
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Produce</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.planning?.table && data.planning.table.length > 0 ? (
                data.planning.table.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.orderNo}</td>
                    <td style={{ padding: '8px 10px', color: '#334155' }}>{row.productName}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>{row.ordered}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a' }}>{row.fgAvailable}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#ea580c' }}>{row.reservedFg}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: '#8b5cf6' }}>{row.produce}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}><span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>{row.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No pending planning items.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 3 — PRODUCTION STATUS & HORIZONTAL WORKFLOW ── */}
      <div id="production" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>⚙️ Production Floor & Work Orders</h3>
          <button onClick={() => router.push('/plant-head/production-analytics')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View All</button>
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
              <div style={{ textAlign: 'center', flex: 1 }}>
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
      </div>

      {/* ── SECTION 4 — MATERIAL REQUESTS ── */}
      <div id="material-requests" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📦 Material Requests (MR)</h3>
          <button onClick={() => router.push('/plant-head/material-approvals')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View All</button>
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
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Material</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Requested</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Available</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.materialRequests?.table && data.materialRequests.table.length > 0 ? (
                data.materialRequests.table.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: row.isShortage ? '#fef2f2' : 'transparent' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.mrNo}</td>
                    <td style={{ padding: '8px 10px', color: '#334155' }}>{row.workOrderNo}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: '#1e293b' }}>{row.materialName}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}>{row.requested}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: row.isShortage ? '#dc2626' : '#16a34a', fontWeight: '800' }}>{row.available}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ background: row.isShortage ? '#ef4444' : '#dcfce7', color: row.isShortage ? '#fff' : '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No material requests available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 5 — INDENT APPROVALS (COLLAPSIBLE) ── */}
      <div id="purchase-indents" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('indents')}>
            {collapsedSections.indents ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📝 Purchase / Material Indents</h3>
          </div>
          <button onClick={() => router.push('/plant-head/indent-approvals')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View All</button>
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
                    data.indents.table.map((row, i) => (
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

      {/* ── SECTION 6 — RAW MATERIAL INVENTORY (CRITICAL ONLY) ── */}
      <div id="raw-inventory" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('rawInventory')}>
            {collapsedSections.rawInventory ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>🏭 Raw Material Inventory (Critical Stock)</h3>
          </div>
          <button onClick={() => router.push('/plant-head/raw-inventory')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View Registry</button>
        </div>

        {!collapsedSections.rawInventory && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Total SKUs</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{data?.rawInventory?.totalMaterials || 0}</div>
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
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Available</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Minimum</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.rawInventory?.criticalTable && data.rawInventory.criticalTable.length > 0 ? (
                    data.rawInventory.criticalTable.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.code}</td>
                        <td style={{ padding: '8px 10px', color: '#1e293b', fontWeight: '700' }}>{row.materialName}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>{row.available}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#64748b' }}>{row.minimum}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span style={{ background: row.status === 'Out of Stock' ? '#ef4444' : '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>{row.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#166534', background: '#f0fdf4' }}>All raw material stock levels are optimal.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 7 — FINISHED GOODS (EXACT SOURCE REUSE) ── */}
      <div id="finished-goods" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('finishedGoods')}>
            {collapsedSections.finishedGoods ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>✨ Finished Goods Stock</h3>
          </div>
          <button onClick={() => router.push('/plant-head/finished-goods')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View All FG</button>
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
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Available</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Reserved</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Produced Today</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Dispatch Today</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.finishedGoods?.table && data.finishedGoods.table.length > 0 ? (
                    data.finishedGoods.table.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '800', color: '#1e293b' }}>{row.productName}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#16a34a' }}>{row.available}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#ea580c' }}>{row.reserved}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#0284c7' }}>{row.producedToday}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#8b5cf6' }}>{row.dispatchToday}</td>
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

      {/* ── SECTION 8 — QUALITY CONTROL ── */}
      <div id="qc-summary" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>🛡️ Quality Control & Failures</h3>
          <button onClick={() => router.push('/plant-head/qc-failures')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>QC Reviews</button>
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
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Batch</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Failed Qty</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Reason</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Decision</th>
              </tr>
            </thead>
            <tbody>
              {data?.qc?.failureTable && data.qc.failureTable.length > 0 ? (
                data.qc.failureTable.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.workOrderNo}</td>
                    <td style={{ padding: '8px 10px', color: '#1e293b' }}>{row.productName}</td>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{row.batchNo}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: '#dc2626' }}>{row.failedQty}</td>
                    <td style={{ padding: '8px 10px', color: '#991b1b', fontWeight: '700' }}>{row.reason}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}><span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>{row.decision}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#166534', background: '#f0fdf4' }}>No QC failures recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 9 — DISPATCH SUMMARY ── */}
      <div id="dispatch" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>🚚 Dispatch & Logistics</h3>
          <button onClick={() => router.push('/plant-head/dispatch-analytics')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View All</button>
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
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c' }}>Delayed Dispatch</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>{data?.dispatch?.dispatchDelayed || 0}</div>
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
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Target</th>
              </tr>
            </thead>
            <tbody>
              {data?.dispatch?.table && data.dispatch.table.length > 0 ? (
                data.dispatch.table.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0284c7' }}>{row.orderNo}</td>
                    <td style={{ padding: '8px 10px', color: '#1e293b' }}>{row.customerName}</td>
                    <td style={{ padding: '8px 10px', color: '#475569' }}>{row.productName}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800' }}>{row.quantity}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}><span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>{row.dispatchStatus}</span></td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>{row.targetDate}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No dispatch consignments recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 10 & 11 — REPLACEMENTS & RETURNS (COLLAPSIBLE) ── */}
      <div id="replacements-returns" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('replacementsReturns')}>
            {collapsedSections.replacementsReturns ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>🔄 Replacements & Returns</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => router.push('/plant-head/replacements')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}>Replacements</button>
            <button onClick={() => router.push('/plant-head/returns')} style={{ background: 'transparent', border: '1px solid #0284c7', color: '#0284c7', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}>Returns</button>
          </div>
        </div>

        {!collapsedSections.replacementsReturns && (
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Replacements Summary */}
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

            {/* Returns Summary */}
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

      {/* ── SECTION 12 — TODAY'S ACTIVITY TIMELINE ── */}
      <div id="activity-timeline" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('activity')}>
            {collapsedSections.activity ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>⏱️ Today's Activity Timeline</h3>
          </div>
        </div>

        {!collapsedSections.activity && (
          <div style={{ marginTop: '16px' }}>
            {data?.activityTimeline && data.activityTimeline.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.activityTimeline.map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', whiteSpace: 'nowrap' }}>{act.time}</span>
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600', marginTop: '2px' }}>{act.description}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No recorded plant activities today.</div>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION 13 — TODAY VS YESTERDAY COMPARISON ── */}
      <div id="comparison" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleSection('comparison')}>
            {collapsedSections.comparison ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0 }}>📊 Today vs Yesterday Operational Comparison</h3>
          </div>
        </div>

        {!collapsedSections.comparison && (
          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>KPI Metric</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Today</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Yesterday</th>
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

      {/* ── OFFICIAL PLANT HEAD DAILY EXECUTIVE REPORT MODAL ── */}
      {showReportModal && (
        <div className="report-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', padding: '32px 16px' }}>
          
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                box-sizing: border-box !important;
              }
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: 'Inter', sans-serif !important;
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
              .report-modal-overlay {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: #ffffff !important;
                padding: 0 !important;
                backdrop-filter: none !important;
              }
              .no-print {
                display: none !important;
              }
              table.report-table {
                display: table !important;
                width: 100% !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                page-break-inside: avoid !important;
                margin-bottom: 12px !important;
              }
              table.report-table tr {
                display: table-row !important;
                page-break-inside: avoid !important;
              }
              table.report-table td, table.report-table th {
                display: table-cell !important;
                vertical-align: middle !important;
                font-size: 10.5px !important;
              }
            }
          `}</style>

          <div id="report-document-card" className="printable-report-modal" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '980px', width: '100%', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid #cbd5e1', position: 'relative' }}>
            
            {/* Modal Actions Header (Hidden during Print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', paddingBottom: '16px', borderBottom: '2px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '900', color: '#0284c7' }}>
                <FileText size={22} /> Generated Plant Head Daily Operational Report
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleDownloadImage} disabled={downloadingImage} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}>
                  <Download size={16} /> {downloadingImage ? 'Downloading Image...' : 'Download Image'}
                </button>
                <button onClick={() => setShowReportModal(false)} style={{ background: '#f1f5f9', color: '#475569', border: '1.5px solid #cbd5e1', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>

            {/* Official Report Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Himalaya ERP — Plant Operations</h1>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0284c7', margin: '3px 0 0 0' }}>PLANT HEAD DAILY EXECUTIVE SUMMARY REPORT</h2>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>Location: Main Manufacturing Unit (COMP-001)</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#334155' }}>
                <div><strong>Report Date:</strong> {data?.date || new Date().toISOString().slice(0, 10)}</div>
                <div style={{ marginTop: '4px' }}><span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900' }}>OFFICIAL VERIFIED</span></div>
              </div>
            </div>

            {/* Executive Operational Brief */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>📌 Executive Operational Brief</div>
              <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.5', fontWeight: '600' }}>
                {data?.summaryText}
              </div>
            </div>

            {/* 1. Key Performance Indicators (8-Column Header & Data Table Grid) */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', borderLeft: '4px solid #0284c7', paddingLeft: '8px' }}>1. Key Performance Indicators</h3>
              <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #94a3b8' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1', fontSize: '10.5px', color: '#475569', textTransform: 'uppercase' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '12.5%', border: '1px solid #cbd5e1' }}>Incoming</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '12.5%', border: '1px solid #cbd5e1' }}>Planning</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '12.5%', border: '1px solid #cbd5e1' }}>Production</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '12.5%', border: '1px solid #cbd5e1' }}>MR Pending</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '12.5%', border: '1px solid #cbd5e1' }}>Indents</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '12.5%', border: '1px solid #cbd5e1' }}>QC Pending</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '12.5%', border: '1px solid #cbd5e1' }}>Dispatch</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: '12.5%', border: '1px solid #cbd5e1' }}>Alerts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ textAlign: 'center', fontWeight: '900', fontSize: '15px' }}>
                    <td style={{ padding: '8px 4px', color: '#0284c7', border: '1px solid #cbd5e1' }}>{data?.mainKpis?.incomingOrders || 0}</td>
                    <td style={{ padding: '8px 4px', color: '#ea580c', border: '1px solid #cbd5e1' }}>{data?.mainKpis?.pendingPlanning || 0}</td>
                    <td style={{ padding: '8px 4px', color: '#8b5cf6', border: '1px solid #cbd5e1' }}>{data?.mainKpis?.activeProduction || 0}</td>
                    <td style={{ padding: '8px 4px', color: '#ec4899', border: '1px solid #cbd5e1' }}>{data?.materialRequests?.mrPendingApproval || 0}</td>
                    <td style={{ padding: '8px 4px', color: '#6366f1', border: '1px solid #cbd5e1' }}>{data?.indents?.indentPendingPlantHead || 0}</td>
                    <td style={{ padding: '8px 4px', color: '#06b6d4', border: '1px solid #cbd5e1' }}>{data?.qc?.qcPending || 0}</td>
                    <td style={{ padding: '8px 4px', color: '#16a34a', border: '1px solid #cbd5e1' }}>{data?.dispatch?.dispatchReady || 0}</td>
                    <td style={{ padding: '8px 4px', color: '#dc2626', border: '1px solid #cbd5e1' }}>{data?.mainKpis?.criticalAlerts || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. Critical Operational Alerts & Bottlenecks */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', borderLeft: '4px solid #ef4444', paddingLeft: '8px' }}>2. Critical Operational Alerts & Bottlenecks</h3>
              <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #fecaca' }}>
                <thead>
                  <tr style={{ background: '#fef2f2', borderBottom: '1.5px solid #fecaca', color: '#991b1b', textTransform: 'uppercase', fontSize: '10.5px' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', width: '15%', border: '1px solid #fecaca' }}>Priority</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', width: '20%', border: '1px solid #fecaca' }}>Category</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', width: '65%', border: '1px solid #fecaca' }}>Material Code</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.attentionRequired && data.attentionRequired.length > 0 ? (
                    data.attentionRequired.map((att, i) => (
                      <tr key={i}>
                        <td style={{ padding: '6px 8px', fontWeight: '900', color: att.priority === 'CRITICAL' ? '#dc2626' : '#d97706', border: '1px solid #fecaca' }}>{att.priority}</td>
                        <td style={{ padding: '6px 8px', fontWeight: '700', color: '#1e293b', border: '1px solid #fecaca' }}>{att.type}</td>
                        <td style={{ padding: '6px 8px', color: '#0284c7', fontWeight: '700', border: '1px solid #fecaca', wordBreak: 'break-word', lineHeight: '1.5' }}>{att.materialCode || att.reference || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} style={{ padding: '10px', textAlign: 'center', color: '#166534', border: '1px solid #cbd5e1' }}>No critical operational alerts recorded today.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 3. Departmental Output Summary (Clean 2-Column Table) */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', borderLeft: '4px solid #10b981', paddingLeft: '8px' }}>3. Departmental Output Summary</h3>
              <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #cbd5e1' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50%', padding: '10px 12px', background: '#f8fafc', verticalAlign: 'top', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '11.5px', marginBottom: '4px', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>Sales Orders & Planning</div>
                      <div style={{ lineHeight: '1.6', color: '#334155' }}>
                        • Received Today: <strong>{data?.orders?.receivedToday || 0}</strong><br />
                        • Approved Today: <strong>{data?.orders?.approvedToday || 0}</strong><br />
                        • Pending Planning: <strong>{data?.planning?.pendingPlanning || 0}</strong>
                      </div>
                    </td>
                    <td style={{ width: '50%', padding: '10px 12px', background: '#ffffff', verticalAlign: 'top', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '11.5px', marginBottom: '4px', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>Production Floor & QC</div>
                      <div style={{ lineHeight: '1.6', color: '#334155' }}>
                        • Active Work Orders: <strong>{data?.production?.prodRunning || 0}</strong><br />
                        • Completed Today: <strong>{data?.production?.completedToday || 0}</strong><br />
                        • QC Failures Today: <strong>{data?.qc?.qcFailedToday || 0}</strong>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: '50%', padding: '10px 12px', background: '#ffffff', verticalAlign: 'top', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '11.5px', marginBottom: '4px', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>Stores & Inventory</div>
                      <div style={{ lineHeight: '1.6', color: '#334155' }}>
                        • Material Requests Approved: <strong>{data?.materialRequests?.mrApprovedToday || 0}</strong><br />
                        • Raw Material Shortages: <strong>{data?.materialRequests?.mrMaterialShortage || 0}</strong><br />
                        • Purchase Indents Pending: <strong>{data?.indents?.indentPendingPlantHead || 0}</strong>
                      </div>
                    </td>
                    <td style={{ width: '50%', padding: '10px 12px', background: '#f8fafc', verticalAlign: 'top', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '11.5px', marginBottom: '4px', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>Dispatch</div>
                      <div style={{ lineHeight: '1.6', color: '#334155' }}>
                        • Ready Dispatch: <strong>{data?.dispatch?.dispatchReady || 0}</strong><br />
                        • In Transit: <strong>{data?.dispatch?.dispatchInTransit || 0}</strong><br />
                        • Delivered Today: <strong>{data?.dispatch?.dispatchDeliveredToday || 0}</strong>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Plant Sign-off (Right Side Bottom) */}
            <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '20px', marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right', borderTop: '2px solid #0f172a', paddingTop: '8px', minWidth: '200px' }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.02em' }}>sana konda reddy</div>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>Plant Head</div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PlantHeadDailySummary;
