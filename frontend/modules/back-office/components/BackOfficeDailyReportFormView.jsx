'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/apiClient';
import {
  FileText,
  ArrowLeft,
  Send,
  Clock,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function BackOfficeDailyReportFormView({ isEditMode = false }) {
  const router = useRouter();
  const [reportId, setReportId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    reportDate: new Date().toISOString().split('T')[0],
    title: '',
    tasksCompleted: '',
    issuesOrBlockers: '',
    workingHours: 8,
    status: 'SUBMITTED',
  });

  // Read edit-mode ID from URL on mount
  useEffect(() => {
    if (isEditMode && typeof window !== 'undefined') {
      const segments = window.location.pathname.split('/');
      const id = segments[segments.length - 1];
      if (id && id !== 'edit') setReportId(id);
    }
  }, [isEditMode]);

  const fetchReportDetails = useCallback(async () => {
    if (!isEditMode || !reportId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/back-office/daily-reports/${reportId}`);
      if (res && (res.data || res.publicId)) {
        const item = res.data || res;
        setFormData({
          reportDate: item.reportDate ? new Date(item.reportDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          title: item.title || '',
          tasksCompleted: item.tasksCompleted || '',
          issuesOrBlockers: item.issuesOrBlockers || '',
          workingHours: Number(item.workingHours) || 8,
          status: item.status || 'SUBMITTED',
        });
      }
    } catch (err) {
      console.error('Failed to fetch report details:', err);
      Swal.fire('Error', 'Unable to load report details for editing.', 'error');
      router.push('/back-office/daily-report');
    } finally {
      setLoading(false);
    }
  }, [isEditMode, reportId, router]);

  useEffect(() => { fetchReportDetails(); }, [fetchReportDetails]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title?.trim()) {
      Swal.fire('Validation Error', 'Please enter a report title / primary focus.', 'warning');
      return;
    }
    if (!formData.tasksCompleted?.trim()) {
      Swal.fire('Validation Error', 'Please describe what you worked on and tasks completed.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ...formData, workingHours: Number(formData.workingHours) || 0, status: 'SUBMITTED' };
      let res;
      if (isEditMode && reportId) {
        res = await apiClient.put(`/back-office/daily-reports/${reportId}`, payload);
      } else {
        res = await apiClient.post('/back-office/daily-reports', payload);
      }
      if (res && res.success !== false) {
        await Swal.fire({ title: 'Report Submitted!', text: 'Your daily report has been saved successfully.', icon: 'success', timer: 1800, showConfirmButton: false });
        router.push('/back-office/daily-report');
      } else {
        Swal.fire('Error', res.message || 'Failed to save daily report.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'Server error occurred while saving report.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid #cbd5e1',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    boxSizing: 'border-box',
    background: '#f8fafc',
    minHeight: '48px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit'
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 16px', textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: '14px' }}>Loading report details...</p>
      </div>
    );
  }

  return (
    <div className="bo-form-page-container">

      {/* ── Navigation Header ── */}
      <div className="bo-form-nav">
        <button
          onClick={() => router.push('/back-office/daily-report')}
          style={{
            background: '#ffffff', border: '1px solid #cbd5e1', padding: '11px 18px',
            borderRadius: '9px', fontSize: '13.5px', fontWeight: '700', color: '#334155',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', minHeight: '46px'
          }}
        >
          <ArrowLeft size={16} /> Back to Reports History
        </button>

        <span style={{
          background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontSize: '11.5px',
          padding: '6px 14px', borderRadius: '20px', fontWeight: '800',
          border: '1px solid rgba(2, 132, 199, 0.2)', textAlign: 'center'
        }}>
          {isEditMode ? 'EDIT REPORT MODE' : 'NEW SUBMISSION MODE'}
        </span>
      </div>

      {/* ── Main Form Card ── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

        {/* Form Header Banner */}
        <div className="bo-form-header-banner">
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
              {isEditMode ? 'Edit Daily Work Report' : 'Submit Daily Work Report'}
            </h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: '1.4' }}>
              Document your daily work, tasks completed & blockers for Super Admin review
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="bo-form-body">

          {/* Row 1: Report Date & Working Hours */}
          <div className="bo-form-date-hours-grid">
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                <Calendar size={14} style={{ color: '#0284c7' }} /> Report Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                required
                value={formData.reportDate}
                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                <Clock size={14} style={{ color: '#0284c7' }} /> Working Hours <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                required
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Row 2: Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              Primary Focus / Report Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vendor Invoices Reconciliation & Dispatch Documentation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* Row 3: Tasks Completed */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              What you worked on & Tasks Completed <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={6}
              required
              placeholder={"• Task 1: Verified 14 vendor bills against GRN store records\n• Task 2: Updated daily stock logs for FRP cover dispatch"}
              value={formData.tasksCompleted}
              onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })}
              style={{ ...inputStyle, minHeight: '140px', lineHeight: '1.6', resize: 'vertical' }}
            />
          </div>

          {/* Row 4: Issues or Blockers */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '700', color: '#b91c1c', marginBottom: '8px' }}>
              <AlertTriangle size={14} style={{ color: '#dc2626' }} /> Issues or Blockers Faced
              <span style={{ fontWeight: '500', color: '#94a3b8', fontSize: '11.5px' }}>(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe any delays, missing documents, system issues, or approvals needed..."
              value={formData.issuesOrBlockers}
              onChange={(e) => setFormData({ ...formData, issuesOrBlockers: e.target.value })}
              style={{ ...inputStyle, minHeight: '90px', border: '1.5px solid #fecaca', background: '#fff5f5', color: '#991b1b', lineHeight: '1.5', resize: 'vertical' }}
            />
          </div>

          {/* Form Actions */}
          <div className="bo-form-actions">
            <button
              type="button"
              onClick={() => router.push('/back-office/daily-report')}
              style={{
                background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1',
                padding: '12px 22px', borderRadius: '10px', fontSize: '13.5px',
                fontWeight: '700', cursor: 'pointer', minHeight: '48px'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff', border: 'none', padding: '12px 28px',
                borderRadius: '10px', fontSize: '14px', fontWeight: '800',
                cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)', minHeight: '48px',
                opacity: submitting ? 0.7 : 1
              }}
            >
              <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Daily Work Report'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
