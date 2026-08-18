'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, FileText, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface Props {
  employeeId: string;
}

export default function EmployeeAttendanceSummary({ employeeId }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAttendanceSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get(`/attendance/employees/${employeeId}?month=${selectedMonth}`);
      if (res && res.success !== false) {
        setSummaryData(res.data || res);
      }
    } catch (err: any) {
      console.error('Failed to fetch employee attendance summary:', err);
      setError(err.message || 'Failed to load attendance summary');
    } finally {
      setLoading(false);
    }
  }, [employeeId, selectedMonth]);

  useEffect(() => {
    if (employeeId) {
      fetchAttendanceSummary();
    }
  }, [employeeId, fetchAttendanceSummary]);

  const summary = summaryData?.summary || {};
  const dailyLogs = summaryData?.dailyLogs || [];

  const getStatusBadge = (status: string, lateMins: number = 0, otMins: number = 0) => {
    let bg = '#F1F5F9';
    let color = '#475569';
    let border = '#CBD5E1';
    let label = status.replace(/_/g, ' ');

    switch (status) {
      case 'PRESENT':
        bg = '#DCFCE7'; color = '#15803D'; border = '#86EFAC'; label = 'Present'; break;
      case 'PUNCHED_IN':
        bg = '#FEF3C7'; color = '#B45309'; border = '#FDE68A'; label = 'Punched In'; break;
      case 'HALF_DAY':
        bg = '#FEF9C3'; color = '#A16207'; border = '#FEF08A'; label = 'Half Day'; break;
      case 'ABSENT':
        bg = '#FEE2E2'; color = '#B91C1C'; border = '#FCA5A5'; label = 'Absent'; break;
      case 'PAID_LEAVE':
        bg = '#E0F2FE'; color = '#0369A1'; border = '#BAE6FD'; label = 'Paid Leave'; break;
      case 'UNPAID_LEAVE':
        bg = '#F3E8FF'; color = '#6B21A8'; border = '#E9D5FF'; label = 'Unpaid Leave'; break;
      case 'WEEKLY_OFF':
        bg = '#F1F5F9'; color = '#64748B'; border = '#E2E8F0'; label = 'Weekly Off'; break;
      case 'HOLIDAY':
        bg = '#FAE8FF'; color = '#86198F'; border = '#F5D0FE'; label = 'Holiday'; break;
      case 'MISSING_PUNCH_OUT':
        bg = '#FFEDD5'; color = '#C2410C'; border = '#FDBA74'; label = 'Missing Punch Out'; break;
      case 'NOT_PUNCHED_IN':
        bg = '#F1F5F9'; color = '#64748B'; border = '#CBD5E1'; label = 'Not Punched In'; break;
      case 'NOT_APPLICABLE':
        bg = '#F8FAFC'; color = '#94A3B8'; border = '#E2E8F0'; label = 'Prior to Joining'; break;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{
          padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
          background: bg, color: color, border: `1px solid ${border}`, textTransform: 'uppercase', letterSpacing: '0.3px'
        }}>
          {label}
        </span>
        {lateMins > 0 && (
          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
            Late (+{lateMins}m)
          </span>
        )}
        {otMins > 0 && (
          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' }}>
            OT (+{otMins}m)
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'sans-serif' }}>
      {/* Top Header Controls */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#ffffff', padding: '16px 20px', borderRadius: '12px',
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={20} color="#4f46e5" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
            Attendance Summary — {summary.month || 'Selected Month'}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1',
              fontSize: '13px', fontWeight: '700', color: '#1e293b', background: '#f8fafc',
              cursor: 'pointer', outline: 'none'
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
          Loading attendance metrics...
        </div>
      ) : error ? (
        <div style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '10px', color: '#991b1b', fontSize: '13px' }}>
          {error}
        </div>
      ) : (
        <>
          {/* Monthly KPI Overview Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px'
          }}>
            {[
              { label: 'Scheduled Working Days', val: summary.scheduledWorkingDays ?? '—', sub: `MTD Elapsed: ${summary.elapsedWorkingDays ?? '—'}`, color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Present Days', val: summary.presentDays ?? 0, sub: `Half Days: ${summary.halfDays ?? 0}`, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Absent Days', val: summary.absentDays ?? 0, sub: `Missing Out: ${summary.missingPunchOuts ?? 0}`, color: '#dc2626', bg: '#fef2f2' },
              { label: 'Paid Leave', val: summary.paidLeaveDays ?? 0, sub: `Unpaid: ${summary.unpaidLeaveDays ?? 0}`, color: '#0284c7', bg: '#f0f9ff' },
              { label: 'Weekly Offs / Holidays', val: (summary.weeklyOffDays || 0) + (summary.holidayDays || 0), sub: `Offs: ${summary.weeklyOffDays ?? 0} | Hol: ${summary.holidayDays ?? 0}`, color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Late Arrivals', val: summary.lateArrivals ?? 0, sub: `Early Exits: ${summary.earlyExits ?? 0}`, color: '#d97706', bg: '#fffbeb' },
              { label: 'Total Working Time', val: summary.totalWorkingHours || '0h 0m', sub: `Overtime: ${summary.overtimeHours || '0h 0m'}`, color: '#059669', bg: '#ecfdf5' },
            ].map((card, i) => (
              <div key={i} style={{
                background: card.bg, padding: '14px 16px', borderRadius: '10px',
                border: `1px solid ${card.color}25`, display: 'flex', flexDirection: 'column', gap: '4px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.4px' }}>
                  {card.label}
                </span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: card.color }}>
                  {card.val}
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#64748b' }}>
                  {card.sub}
                </span>
              </div>
            ))}
          </div>

          {/* Daily Logs Table */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                Daily Attendance Logs ({dailyLogs.length} days)
              </h4>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Day</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Punch In</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Punch Out</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Worked Hours</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyLogs.map((row: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                        {row.date}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#64748b' }}>
                        {row.day}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: row.in !== '—' ? '#16a34a' : '#94a3b8', fontFamily: 'monospace' }}>
                        {row.in}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: row.out !== '—' ? '#dc2626' : '#94a3b8', fontFamily: 'monospace' }}>
                        {row.out}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#334155' }}>
                        {row.hours}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {getStatusBadge(row.status, row.lateMinutes, row.overtimeMinutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
