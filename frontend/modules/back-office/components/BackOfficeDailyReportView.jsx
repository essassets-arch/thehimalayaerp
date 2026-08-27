'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/apiClient';
import DataTable from '../../../shared/components/DataTable';
import {
  FileText,
  PlusCircle,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  Calendar,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function BackOfficeDailyReportView() {
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [inspectReport, setInspectReport] = useState(null);

  const fetchMyReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);
      const res = await apiClient.get(`/back-office/daily-reports/my?${params.toString()}`);
      if (res && (res.data || Array.isArray(res))) {
        const list = res.data?.data || res.data || res || [];
        setReports(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Failed to load back office daily reports:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, search]);

  useEffect(() => { fetchMyReports(); }, [fetchMyReports]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayReport = reports.find(r => {
    if (!r.reportDate) return false;
    return new Date(r.reportDate).toISOString().split('T')[0] === todayStr;
  });

  const handleDeleteReport = async (reportId) => {
    const confirm = await Swal.fire({
      title: 'Delete Daily Report?',
      text: 'Are you sure you want to delete this report?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await apiClient.delete(`/back-office/daily-reports/${reportId}`);
      if (res && res.success !== false) {
        Swal.fire('Deleted', 'Report deleted.', 'success');
        fetchMyReports();
      } else {
        Swal.fire('Error', res.message || 'Failed to delete.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to delete report.', 'error');
    }
  };

  return (
    <div className="bo-page-container">

      {/* ── Top Header Banner ── */}
      <div className="bo-top-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '14px', flexShrink: 0,
            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)'
          }}>
            <FileText size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
                Back Office Daily Work Report
              </h1>
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
                fontSize: '10.5px', padding: '3px 10px', borderRadius: '20px',
                fontWeight: '700', border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                OPERATIONS NODE
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: '1.4' }}>
              Log daily activities, tasks completed & roadblocks directly to Super Admin
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/back-office/daily-report/create')}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff', border: 'none', padding: '12px 22px',
            borderRadius: '10px', fontWeight: '700', fontSize: '13.5px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)', minHeight: '44px'
          }}
        >
          <PlusCircle size={18} /> Submit Today's Report
        </button>
      </div>

      {/* ── Today's Report Card ── */}
      <div className="bo-today-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <Calendar size={20} style={{ color: '#0284c7', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Today's Daily Work Report ({new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})
            </div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {todayReport ? todayReport.title : 'No report submitted yet for today'}
            </div>
          </div>
        </div>

        {todayReport && (
          <button
            onClick={() => setInspectReport(todayReport)}
            style={{
              background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155',
              padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              minHeight: '42px', whiteSpace: 'nowrap'
            }}
          >
            <Eye size={15} /> Inspect Today's Report
          </button>
        )}
      </div>

      {/* ── Reports History Section ── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px 20px 16px', boxSizing: 'border-box' }}>

        {/* History Header */}
        <div className="bo-history-header">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Submitted Daily Reports History
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Archive of all your submitted daily reports
            </span>
          </div>

          <div className="bo-filter-controls">
            <button
              onClick={fetchMyReports}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#f8fafc', fontSize: '12.5px', fontWeight: '700',
                color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                minHeight: '38px'
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
            </button>
          </div>
        </div>

        {/* Horizontal scroll wrapper for table on mobile */}
        <div className="bo-table-scroll">
          <DataTable
            columns={[
              {
                header: 'Report Ref ID',
                accessor: 'publicId',
                render: (row) => (
                  <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#0284c7', fontSize: '12px' }}>
                    {row.publicId}
                  </span>
                )
              },
              {
                header: 'Report Date',
                accessor: 'reportDate',
                render: (row) => (
                  <strong style={{ color: '#0f172a', fontSize: '13px' }}>
                    {new Date(row.reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </strong>
                )
              },
              {
                header: 'Primary Focus / Title',
                accessor: 'title',
                render: (row) => (
                  <div>
                    <strong style={{ color: '#334155', fontSize: '13px', display: 'block' }}>{row.title}</strong>
                    {row.summary && <span style={{ fontSize: '11.5px', color: '#64748b' }}>{row.summary}</span>}
                  </div>
                )
              },
              {
                header: 'Hours',
                accessor: 'workingHours',
                render: (row) => (
                  <span style={{ fontWeight: '700', color: '#475569' }}>
                    {row.workingHours ? `${row.workingHours}h` : '—'}
                  </span>
                )
              }
            ]}
            data={reports}
            searchQuery={search}
            searchField="title"
            actions={(row) => (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setInspectReport(row)}
                  title="View"
                  style={{
                    background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 10px',
                    borderRadius: '6px', color: '#334155', fontSize: '11.5px', fontWeight: '700',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px'
                  }}
                >
                  <Eye size={13} /> View
                </button>
                <button
                  onClick={() => router.push(`/back-office/daily-report/edit/${row.id}`)}
                  title="Edit"
                  style={{
                    background: '#e0f2fe', border: '1px solid #bae6fd', padding: '6px 10px',
                    borderRadius: '6px', color: '#0369a1', fontSize: '11.5px', fontWeight: '700',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', minHeight: '32px'
                  }}
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteReport(row.id)}
                  title="Delete"
                  style={{
                    background: '#fee2e2', border: '1px solid #fca5a5', padding: '6px 8px',
                    borderRadius: '6px', color: '#b91c1c', cursor: 'pointer', minHeight: '32px',
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
            emptyMessage="No daily reports logged yet. Click 'Submit Today\'s Report' to log your daily work."
          />
        </div>
      </div>

      {/* ── INSPECTOR MODAL ── */}
      {inspectReport && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 9999, padding: '0'
        }}>
          <div className="bo-modal-window">
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f8fafc', borderTopLeftRadius: '16px', borderTopRightRadius: '16px'
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '800', color: '#0284c7' }}>
                  {inspectReport.publicId}
                </span>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inspectReport.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectReport(null)}
                style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748b', cursor: 'pointer', padding: '4px 8px', flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>

              {/* Meta Grid */}
              <div className="bo-modal-meta-grid" style={{
                background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9'
              }}>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Report Date</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                    {new Date(inspectReport.reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Working Hours</span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                    {inspectReport.workingHours ? `${inspectReport.workingHours} hrs` : '—'}
                  </div>
                </div>
              </div>

              {/* Tasks Completed */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#334155', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                  Tasks & Activities Completed
                </h4>
                <div style={{
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px',
                  fontSize: '13.5px', color: '#1e293b', whiteSpace: 'pre-line', lineHeight: '1.6'
                }}>
                  {inspectReport.tasksCompleted}
                </div>
              </div>

              {/* Roadblocks */}
              {inspectReport.issuesOrBlockers && (
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#b91c1c', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                    Issues / Roadblocks
                  </h4>
                  <div style={{
                    background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px',
                    fontSize: '13px', color: '#991b1b', whiteSpace: 'pre-line'
                  }}>
                    {inspectReport.issuesOrBlockers}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end',
              background: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'
            }}>
              <button
                onClick={() => setInspectReport(null)}
                style={{
                  background: '#334155', color: '#ffffff', border: 'none',
                  padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                  cursor: 'pointer', minHeight: '42px', width: '100%'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
