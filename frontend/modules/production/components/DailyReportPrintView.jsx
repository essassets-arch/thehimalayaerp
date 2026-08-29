'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { backendFetch } from '../../../lib/backendFetch';
import Swal from 'sweetalert2';
import { ArrowLeft, Printer, FileDown, CheckCircle, Clock } from 'lucide-react';

export default function DailyReportPrintView({ reportId, onBack, title, isDispatch = false }) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const printRef = useRef(null);

  const fetchReport = useCallback(async () => {
    if (!reportId) return;
    try {
      setLoading(true);
      const data = await backendFetch(`/api/backend/production/daily-reports/${reportId}`, { cacheTtlMs: 0 });
      setReport(data);
    } catch (err) {
      console.error('[DailyReportPrintView] Error fetching report details:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Report',
        text: err.message || 'Unable to load report details for printing'
      });
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px' }}>
        <h3>Loading Printable Production Report...</h3>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#dc2626', background: '#fff', borderRadius: '16px' }}>
        <h3>Report Not Found</h3>
        <button onClick={onBack} className="btn-secondary" style={{ marginTop: '16px' }}>
          Back to List
        </button>
      </div>
    );
  }

  const d = report.reportDate ? report.reportDate.split('T')[0] : '—';
  const totalWeightNum = Number(report.totalWeight || 0);
  const totalWeightMT = (totalWeightNum / 1000).toFixed(2);

  return (
    <div>
      {/* SCREEN CONTROLS BAR (Hidden on Print) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '16px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Back to Reports
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleDownloadPdf}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <FileDown size={16} /> Download PDF
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#2F4375',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(47, 67, 117, 0.25)'
            }}
          >
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* PRINTABLE A4 REPORT SHEET */}
      <div
        id="printable-area"
        ref={printRef}
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '900px',
          margin: '0 auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          fontFamily: 'Arial, sans-serif',
          color: '#0f172a'
        }}
      >
        {/* COMPANY HEADER */}
        <div style={{
          textAlign: 'center',
          borderBottom: '2px solid #0f172a',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '2px', color: '#1e293b' }}>
            HIMALAYA
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#334155', marginTop: '4px' }}>
            {title || (isDispatch ? 'Industrial FRP Dispatch Report' : 'Industrial FRP Production Report')}
          </div>
        </div>

        {/* METADATA BLOCK */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '13px',
          background: '#f8fafc'
        }}>
          <div><strong>Date:</strong> {d}</div>
          <div><strong>Report No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{report.reportNo}</span></div>
          <div><strong>Shift:</strong> {report.shift || 'Morning'}</div>
          <div><strong>Supervisor:</strong> {report.supervisorName || '—'}</div>
          <div><strong>Prepared By:</strong> {report.createdBy?.name || 'Operator'}</div>
          <div><strong>Status:</strong> <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{report.status}</span></div>
        </div>

        {/* PRODUCTION TABLE */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          marginBottom: '24px'
        }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #0f172a' }}>
              <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #cbd5e1', width: '40px' }}>Sr. No.</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Size</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1', width: '70px' }}>Type</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1', width: '80px' }}>Capacity</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', width: '60px' }}>Cover</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', width: '90px' }}>Cover Weight</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', width: '60px' }}>Frame</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', width: '90px' }}>Frame Weight</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', width: '95px' }}>Total Weight</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', width: '60px' }}>Set</th>
            </tr>
          </thead>
          <tbody>
            {report.items && report.items.length > 0 ? (
              report.items.map((item, index) => (
                <tr key={item.id || index} style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{index + 1}</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{item.size || item.product?.size || '—'}</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>{item.type || item.product?.type || '—'}</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>{item.capacity || item.product?.capacity || '—'}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1' }}>{item.coverQty}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1' }}>{Number(item.coverWeight).toFixed(1)} kg</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1' }}>{item.frameQty}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1' }}>{Number(item.frameWeight).toFixed(1)} kg</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{Number(item.totalWeight).toFixed(1)} kg</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{item.setQty}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} style={{ padding: '16px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                  No production items recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* BOTTOM TOTALS SUMMARY BLOCK */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
          gap: '12px',
          border: '2px solid #0f172a',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '40px',
          fontSize: '13px',
          background: '#f8fafc'
        }}>
          <div><strong>Total Covers:</strong> {report.totalCovers}</div>
          <div><strong>Total Frames:</strong> {report.totalFrames}</div>
          <div><strong>Total Sets:</strong> {report.totalSets}</div>
          <div><strong>Cover Weight:</strong> {Number(report.totalCoverWeight).toFixed(1)} kg</div>
          <div><strong>Frame Weight:</strong> {Number(report.totalFrameWeight).toFixed(1)} kg</div>
          <div><strong>Total Weight:</strong> <strong>{totalWeightNum.toFixed(1)} kg ({totalWeightMT} MT)</strong></div>
        </div>

        {/* SIGNATURE BLOCK */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
          gap: '24px',
          marginTop: '60px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#334155'
        }}>
          <div>
            <div style={{ borderBottom: '1px solid #0f172a', height: '40px', marginBottom: '8px' }}></div>
            <div>Prepared By</div>
            <div style={{ fontWeight: 'normal', color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{report.createdBy?.name || ''}</div>
          </div>
          <div>
            <div style={{ borderBottom: '1px solid #0f172a', height: '40px', marginBottom: '8px' }}></div>
            <div>Checked By</div>
            <div style={{ fontWeight: 'normal', color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{report.supervisorName || 'Supervisor'}</div>
          </div>
          <div>
            <div style={{ borderBottom: '1px solid #0f172a', height: '40px', marginBottom: '8px' }}></div>
            <div>Approved By</div>
            <div style={{ fontWeight: 'normal', color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{report.approvedBy?.name || 'Plant Head / Manager'}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
